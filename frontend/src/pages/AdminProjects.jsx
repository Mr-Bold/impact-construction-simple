import { useEffect, useMemo, useState } from 'react';
import { ArrowUpRight, ExternalLink, FolderKanban, ImagePlus, Plus, Search, Trash2, Upload, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import AdminSidebar from '../components/AdminSidebar';
import { authClient } from '../services/auth';
import { createAdminProject, deleteAdminProject, getAdminProjects, uploadProjectMedia } from '../services/api';

const allowedMediaTypes = new Set(['image/jpeg', 'image/png', 'image/webp', 'video/mp4', 'video/webm', 'video/quicktime']);
const maxMediaSize = 50 * 1024 * 1024;
const emptyForm = { title: '', category: '', location: '', description: '', project_date: '', services: '', featured: false, status: 'published' };

const getImage = (project) => {
	const images = (project.project_media || []).filter((media) => media.media_type === 'image');
	return images.find((media) => media.is_cover)?.media_url || images[0]?.media_url || '';
};
const getCategory = (project) => typeof project.category === 'string' ? project.category : project.category?.name || 'Construction';
const getStatus = (project) => project.status === 'draft' ? 'Draft' : project.status === 'archived' ? 'Archived' : 'Published';

async function getAccessToken() {
	if (!authClient) throw new Error('Supabase authentication is not configured.');
	const { data, error } = await authClient.auth.getSession();
	if (error) throw error;
	if (!data.session?.access_token) throw new Error('Your admin session has expired. Sign in again.');
	return data.session.access_token;
}

function validateFiles(files) {
	const validFiles = [];
	const errors = [];
	files.forEach((file) => {
		if (!allowedMediaTypes.has(file.type)) errors.push(`${file.name}: use JPG, PNG, WEBP, MP4, WEBM, or MOV.`);
		else if (file.size > maxMediaSize) errors.push(`${file.name}: must be 50 MB or smaller.`);
		else validFiles.push(file);
	});
	return { validFiles, errors };
}

export default function AdminProjects() {
	const [projects, setProjects] = useState([]);
	const [source, setSource] = useState('loading');
	const [loadError, setLoadError] = useState('');
	const [actionError, setActionError] = useState('');
	const [search, setSearch] = useState('');
	const [category, setCategory] = useState('All');
	const [formOpen, setFormOpen] = useState(false);
	const [form, setForm] = useState(emptyForm);
	const [mediaFiles, setMediaFiles] = useState([]);
	const [mediaPreviews, setMediaPreviews] = useState([]);
	const [formError, setFormError] = useState('');
	const [notice, setNotice] = useState('');
	const [isSaving, setIsSaving] = useState(false);
	const [uploadState, setUploadState] = useState(null);
	const [deletingProjectId, setDeletingProjectId] = useState(null);

	const refreshProjects = async () => {
		const accessToken = await getAccessToken();
		const items = await getAdminProjects(accessToken);
		setProjects(items);
		setSource('live');
		setLoadError('');
	};

	useEffect(() => {
		let isMounted = true;
		const load = async () => {
			try {
				const accessToken = await getAccessToken();
				const items = await getAdminProjects(accessToken);
				if (!isMounted) return;
				setProjects(items);
				setSource('live');
			} catch (requestError) {
				if (!isMounted) return;
				setLoadError(requestError.message || 'Unable to load admin projects.');
				setSource('error');
			}
		};
		load();
		return () => { isMounted = false; };
	}, []);

	useEffect(() => () => {
		mediaPreviews.forEach((preview) => URL.revokeObjectURL(preview.url));
	}, [mediaPreviews]);

	const categories = useMemo(() => ['All', ...new Set(projects.map(getCategory))], [projects]);
	const filteredProjects = projects.filter((project) => {
		const matchesSearch = `${project.title} ${getCategory(project)} ${project.location || ''}`.toLowerCase().includes(search.toLowerCase());
		return matchesSearch && (category === 'All' || getCategory(project) === category);
	});

	const selectMedia = (event) => {
		const chosenFiles = Array.from(event.target.files || []);
		event.target.value = '';
		if (!chosenFiles.length) return;
		const { validFiles, errors } = validateFiles(chosenFiles);
		setFormError(errors.join(' '));
		if (!validFiles.length) return;
		setMediaFiles((current) => [...current, ...validFiles]);
		setMediaPreviews((current) => [...current, ...validFiles.map((file) => ({ file, url: URL.createObjectURL(file) }))]);
	};

	const removeMedia = (file) => {
		setMediaFiles((current) => current.filter((item) => item !== file));
		setMediaPreviews((current) => current.filter((preview) => preview.file !== file));
	};

	const handleCreateProject = async (event) => {
		event.preventDefault();
		setFormError('');
		setNotice('');
		setIsSaving(true);
		let createdProject = null;
		const filesToUpload = [...mediaFiles];
		try {
			const accessToken = await getAccessToken();
			createdProject = await createAdminProject({
				...form,
				services: form.services.split(',').map((service) => service.trim()).filter(Boolean),
			}, accessToken);
			setProjects((current) => [createdProject, ...current.filter((project) => project.id !== createdProject.id)]);
			setForm(emptyForm);
			setMediaFiles([]);
			setMediaPreviews([]);
			setFormOpen(false);

			let coverAssigned = false;
			for (const [index, file] of filesToUpload.entries()) {
				setUploadState({ projectId: createdProject.id, current: index + 1, total: filesToUpload.length, fileName: file.name });
				const isCover = !coverAssigned && file.type.startsWith('image/');
				await uploadProjectMedia(createdProject.id, file, accessToken, isCover);
				if (isCover) coverAssigned = true;
			}
			await refreshProjects();
			setNotice(filesToUpload.length ? `Project created with ${filesToUpload.length} media ${filesToUpload.length === 1 ? 'file' : 'files'}.` : 'Project created. Add its photos or videos from the project list.');
		} catch (requestError) {
			if (createdProject) {
				setNotice(`Project created, but media upload stopped. ${requestError.message} You can retry from Add media on the project row.`);
				try { await refreshProjects(); } catch { /* Keep the project visible in local state. */ }
			} else {
				setFormError(requestError.message || 'Unable to create project.');
			}
		} finally {
			setUploadState(null);
			setIsSaving(false);
		}
	};

	const handleAddMedia = async (project, event) => {
		const chosenFiles = Array.from(event.target.files || []);
		event.target.value = '';
		if (!chosenFiles.length) return;
		const { validFiles, errors } = validateFiles(chosenFiles);
		setNotice(errors.join(' '));
		if (!validFiles.length) return;
		setNotice('');
		let uploadedCount = 0;
		try {
			const accessToken = await getAccessToken();
			let coverAssigned = (project.project_media || []).some((media) => media.is_cover);
			for (const [index, file] of validFiles.entries()) {
				setUploadState({ projectId: project.id, current: index + 1, total: validFiles.length, fileName: file.name });
				const isCover = !coverAssigned && file.type.startsWith('image/');
				await uploadProjectMedia(project.id, file, accessToken, isCover);
				if (isCover) coverAssigned = true;
				uploadedCount += 1;
			}
			await refreshProjects();
			setNotice(`${uploadedCount} ${uploadedCount === 1 ? 'file' : 'files'} added to ${project.title}.`);
		} catch (requestError) {
			try { await refreshProjects(); } catch { /* Keep the current rows available. */ }
			setNotice(`${uploadedCount} of ${validFiles.length} files uploaded. ${requestError.message}`);
		} finally {
			setUploadState(null);
		}
	};

	const handleDeleteProject = async (project) => {
		const confirmed = window.confirm(
			`Permanently delete "${project.title}"? Its photos, videos, reviews, ratings, and likes will be removed. Related requests will remain without a project link.`,
		);
		if (!confirmed) return;

		setNotice('');
		setActionError('');
		setDeletingProjectId(project.id);
		try {
			const accessToken = await getAccessToken();
			const result = await deleteAdminProject(project.id, accessToken);
			setProjects((current) => current.filter((item) => item.id !== project.id));
			setNotice(result.cleanupWarning || `"${project.title}" was deleted.`);
		} catch (requestError) {
			setNotice('');
			setActionError(requestError.message || 'Unable to delete project.');
		} finally {
			setDeletingProjectId(null);
		}
	};

	return (
		<div className="admin-layout">
			<AdminSidebar />
			<main className="admin-content">
				<div className="admin-top">
					<div><p className="eyebrow">Workspace / Portfolio</p><h1>All <em>projects.</em></h1></div>
					<div className="admin-project-heading-actions">
						<Link className="solid-button dark-button" to="/projects">Preview portfolio <ArrowUpRight size={16} /></Link>
						<button className="solid-button admin-add-project-button" type="button" onClick={() => { setFormOpen((open) => !open); setFormError(''); }}><Plus size={16} />{formOpen ? 'Close form' : 'Add project'}</button>
					</div>
				</div>

				{formOpen && (
					<section className="admin-list-panel admin-create-project-panel" aria-labelledby="create-project-heading">
						<div className="admin-list-heading"><div><h2 id="create-project-heading">Add a project</h2><p>Project details, photos, and videos can be added together.</p></div><button type="button" className="admin-icon-button" aria-label="Close project form" onClick={() => setFormOpen(false)}><X size={18} /></button></div>
						<form className="admin-create-project-form" onSubmit={handleCreateProject}>
							<div className="admin-create-project-grid">
								<label>Project title<input required maxLength={140} value={form.title} onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))} placeholder="e.g. Modern family home" /></label>
								<label>Category<input required maxLength={80} value={form.category} onChange={(event) => setForm((current) => ({ ...current, category: event.target.value }))} placeholder="Building, Roofing, Renovation…" /></label>
								<label>Location<input required maxLength={140} value={form.location} onChange={(event) => setForm((current) => ({ ...current, location: event.target.value }))} placeholder="Town or area" /></label>
								<label>Completion date<input type="date" value={form.project_date} onChange={(event) => setForm((current) => ({ ...current, project_date: event.target.value }))} /></label>
								<label className="admin-create-wide">Description<textarea required rows={3} maxLength={3000} value={form.description} onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))} placeholder="Describe the project and work completed" /></label>
								<label className="admin-create-wide">Services<input value={form.services} onChange={(event) => setForm((current) => ({ ...current, services: event.target.value }))} placeholder="Separate services with commas" /></label>
								<label>Visibility<select value={form.status} onChange={(event) => setForm((current) => ({ ...current, status: event.target.value }))}><option value="published">Published</option><option value="draft">Draft</option></select></label>
								<label className="admin-featured-toggle"><input type="checkbox" checked={form.featured} onChange={(event) => setForm((current) => ({ ...current, featured: event.target.checked }))} /> Feature this project</label>
							</div>

							<label className="admin-media-picker">
								<ImagePlus size={20} />
								<span><b>Add project photos or videos</b><small>JPG, PNG, WEBP, MP4, WEBM, or MOV · up to 50 MB per file</small></span>
								<input type="file" accept="image/jpeg,image/png,image/webp,video/mp4,video/webm,video/quicktime" multiple onChange={selectMedia} />
							</label>
							{mediaPreviews.length > 0 && <div className="admin-media-preview-grid">{mediaPreviews.map(({ file, url }) => (
								<div className="admin-media-preview" key={`${file.name}-${file.lastModified}`}>
									{file.type.startsWith('video/') ? <video src={url} muted playsInline /> : <img src={url} alt={file.name} />}
									<button type="button" onClick={() => removeMedia(file)} aria-label={`Remove ${file.name}`}><X size={14} /></button>
									<small>{file.name}</small>
								</div>
							))}</div>}
							{formError && <p className="admin-settings-alert is-error" role="alert">{formError}</p>}
							<div className="admin-create-actions"><button type="button" className="admin-secondary-button" onClick={() => { setFormOpen(false); setForm(emptyForm); setMediaFiles([]); setMediaPreviews([]); setFormError(''); }}>Cancel</button><button className="solid-button dark-button" disabled={isSaving || source !== 'live'}>{isSaving ? 'Creating project…' : 'Create project and upload media'}</button></div>
						</form>
					</section>
				)}

				{notice && <p className="admin-upload-notice" role="status">{notice}</p>}
				{actionError && <p className="admin-settings-alert is-error" role="alert">{actionError}</p>}
				{uploadState && <div className="admin-upload-progress" role="status"><span><Upload size={15} /> Uploading {uploadState.current} of {uploadState.total}: {uploadState.fileName}</span><progress value={uploadState.current - 1} max={uploadState.total} /></div>}
				{loadError && <p className="admin-settings-alert is-error" role="alert">{loadError}{loadError.includes('Admin access required') && ' Configure this account with the admin role or add its email to ADMIN_EMAILS on the backend.'}</p>}

				<section className="admin-list-panel" aria-labelledby="admin-projects-heading">
					<div className="admin-list-heading">
						<div><h2 id="admin-projects-heading">Project library</h2><p>{filteredProjects.length} {filteredProjects.length === 1 ? 'project' : 'projects'}{category !== 'All' ? ` in ${category}` : ''}</p></div>
						<span className="admin-source-badge">{source === 'loading' ? 'Loading' : source === 'error' ? 'Unavailable' : 'Live projects'}</span>
					</div>
					<div className="admin-project-filters">
						<label className="admin-search-field"><Search size={17} /><span className="sr-only">Search projects</span><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search by project, category, or location" /></label>
						<label className="admin-category-field"><span className="sr-only">Filter by category</span><select value={category} onChange={(event) => setCategory(event.target.value)}>{categories.map((item) => <option key={item}>{item}</option>)}</select></label>
					</div>
					<div className="admin-project-list">
						{filteredProjects.map((project) => {
							const image = getImage(project);
							const projectUpload = uploadState?.projectId === project.id;
							return (
								<article className="admin-project-row" key={project.id}>
									{image ? <img src={image} alt="" loading="lazy" /> : <span className="admin-project-placeholder"><FolderKanban size={21} /></span>}
									<div className="admin-project-row-copy"><b>{project.title}</b><small>{getCategory(project)} <span>·</span> {project.location || 'Location not specified'} <span>·</span> {(project.project_media || []).length} media</small></div>
									<span className={`status-pill ${project.status === 'draft' ? 'is-draft' : ''}`}>{getStatus(project)}</span>
									<div className="admin-project-row-actions">
										<label className="admin-row-upload" aria-disabled={projectUpload} title="Add photos or videos"><ImagePlus size={15} /><span>{projectUpload ? `${uploadState.current}/${uploadState.total}` : 'Add media'}</span><input type="file" accept="image/jpeg,image/png,image/webp,video/mp4,video/webm,video/quicktime" multiple disabled={projectUpload} onChange={(event) => handleAddMedia(project, event)} /></label>
										<Link to={`/projects/${project.slug || project.id}`} aria-label={`View ${project.title}`} title={`View ${project.title}`}><ExternalLink size={16} /></Link>
										<button
											type="button"
											className="admin-icon-button admin-delete-project"
											aria-label={`Delete ${project.title}`}
											title={`Delete ${project.title}`}
											disabled={Boolean(deletingProjectId) || projectUpload}
											aria-busy={deletingProjectId === project.id}
											onClick={() => handleDeleteProject(project)}
										>
											{deletingProjectId === project.id ? '…' : <Trash2 size={15} />}
										</button>
									</div>
								</article>
							);
						})}
						{source === 'loading' && <p className="admin-list-message">Loading projects…</p>}
						{source === 'error' && !loadError && <p className="admin-list-message">Could not load the project library.</p>}
						{source === 'live' && filteredProjects.length === 0 && <p className="admin-list-message">No projects match these filters.</p>}
					</div>
				</section>
			</main>
		</div>
	);
}
