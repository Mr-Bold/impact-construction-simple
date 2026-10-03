import { useEffect, useMemo, useState } from 'react';
import { ClipboardList, RefreshCw } from 'lucide-react';
import AdminSidebar from '../components/AdminSidebar';
import { authClient } from '../services/auth';
import { getAdminRequests, updateAdminRequestStatus } from '../services/api';

const requestStatuses = ['new', 'contacted', 'quotation', 'approved', 'in_progress', 'completed', 'cancelled'];
const formatStatus = (status) => status.replaceAll('_', ' ');
const formatDate = (value) => new Intl.DateTimeFormat(undefined, { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value));

async function getAccessToken() {
	if (!authClient) throw new Error('Supabase authentication is not configured.');
	const { data, error } = await authClient.auth.getSession();
	if (error) throw error;
	if (!data.session?.access_token) throw new Error('Your admin session has expired. Sign in again.');
	return data.session.access_token;
}

export default function AdminRequests() {
	const [requests, setRequests] = useState([]);
	const [statusFilter, setStatusFilter] = useState('all');
	const [isLoading, setIsLoading] = useState(true);
	const [loadError, setLoadError] = useState('');
	const [actionError, setActionError] = useState('');
	const [updatingId, setUpdatingId] = useState('');

	const loadRequests = async () => {
		setIsLoading(true);
		setLoadError('');
		try {
			const token = await getAccessToken();
			setRequests(await getAdminRequests(token));
		} catch (error) {
			setLoadError(error.message || 'Unable to load work requests.');
		} finally {
			setIsLoading(false);
		}
	};

	useEffect(() => {
		loadRequests();
	}, []);

	const filteredRequests = useMemo(
		() => statusFilter === 'all' ? requests : requests.filter((request) => request.status === statusFilter),
		[requests, statusFilter],
	);

	const changeStatus = async (request, status) => {
		setActionError('');
		setUpdatingId(request.id);
		try {
			const token = await getAccessToken();
			const updated = await updateAdminRequestStatus(request.id, status, token);
			setRequests((current) => current.map((item) => item.id === request.id ? { ...item, ...updated } : item));
		} catch (error) {
			setActionError(error.message || 'Unable to update request status.');
		} finally {
			setUpdatingId('');
		}
	};

	return (
		<div className="admin-layout">
			<AdminSidebar />
			<main className="admin-content">
				<div className="admin-top">
					<div><p className="eyebrow">Workspace / Enquiries</p><h1>Work <em>requests.</em></h1></div>
					<button className="admin-secondary-button" type="button" onClick={loadRequests} disabled={isLoading}><RefreshCw size={15} /> Refresh</button>
				</div>
				{loadError && <p className="admin-settings-alert is-error" role="alert">{loadError}</p>}
				{actionError && <p className="admin-settings-alert is-error" role="alert">{actionError}</p>}
				<section className="admin-list-panel" aria-label="Work request inbox">
					<div className="admin-list-heading">
						<div><h2>Request inbox</h2><p>{requests.length} {requests.length === 1 ? 'request' : 'requests'} received</p></div>
						<label className="admin-record-filter" htmlFor="request-status-filter">
							<span>Status</span>
							<select id="request-status-filter" value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>
								<option value="all">All statuses</option>
								{requestStatuses.map((status) => <option key={status} value={status}>{formatStatus(status)}</option>)}
							</select>
						</label>
					</div>
					{isLoading ? <p className="admin-list-message" role="status">Loading work requests…</p> : loadError ? null : filteredRequests.length === 0 ? (
						<div className="admin-empty-state admin-inbox-empty-state">
							<span className="admin-empty-icon"><ClipboardList size={23} /></span>
							<h2>{requests.length ? 'No requests in this status.' : 'No work requests yet.'}</h2>
							<p>New project enquiries submitted through the website will appear here.</p>
						</div>
					) : (
						<div className="admin-record-list">
							{filteredRequests.map((request) => (
								<article className="admin-record-card" key={request.id}>
									<div className="admin-record-heading">
										<div><h3>{request.full_name}</h3><p>{formatDate(request.created_at)}</p></div>
										<span className={`status-pill is-${request.status}`}>{formatStatus(request.status)}</span>
									</div>
									<div className="admin-record-details">
										<a href={`mailto:${request.email}`}>{request.email}</a>
										<a href={`tel:${request.phone}`}>{request.phone}</a>
										<span>{request.location}</span>
										<span>{request.work_type}</span>
									</div>
									{request.project?.title && <p className="admin-record-project">Regarding: {request.project.title}</p>}
									<p className="admin-record-description">{request.description}</p>
									<div className="admin-record-meta">
										{request.contact_method && <span>Preferred contact: {request.contact_method}</span>}
										{request.budget && <span>Budget: {request.budget}</span>}
										{request.preferred_start_date && <span>Preferred start: {request.preferred_start_date}</span>}
									</div>
									<label className="admin-record-status">
										Update status
										<select value={request.status} onChange={(event) => changeStatus(request, event.target.value)} disabled={updatingId === request.id}>
											{requestStatuses.map((status) => <option key={status} value={status}>{formatStatus(status)}</option>)}
										</select>
									</label>
								</article>
							))}
						</div>
					)}
				</section>
			</main>
		</div>
	);
}
