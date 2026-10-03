import { useEffect, useMemo, useState } from 'react';
import { RefreshCw, Star } from 'lucide-react';
import AdminSidebar from '../components/AdminSidebar';
import { authClient } from '../services/auth';
import { getAdminReviews, updateAdminReviewStatus } from '../services/api';

const reviewStatuses = ['pending', 'approved', 'rejected'];
const formatDate = (value) => new Intl.DateTimeFormat(undefined, { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value));

async function getAccessToken() {
	if (!authClient) throw new Error('Supabase authentication is not configured.');
	const { data, error } = await authClient.auth.getSession();
	if (error) throw error;
	if (!data.session?.access_token) throw new Error('Your admin session has expired. Sign in again.');
	return data.session.access_token;
}

export default function AdminReviews() {
	const [reviews, setReviews] = useState([]);
	const [statusFilter, setStatusFilter] = useState('all');
	const [isLoading, setIsLoading] = useState(true);
	const [loadError, setLoadError] = useState('');
	const [actionError, setActionError] = useState('');
	const [updatingId, setUpdatingId] = useState('');

	const loadReviews = async () => {
		setIsLoading(true);
		setLoadError('');
		try {
			const token = await getAccessToken();
			setReviews(await getAdminReviews(token));
		} catch (error) {
			setLoadError(error.message || 'Unable to load reviews.');
		} finally {
			setIsLoading(false);
		}
	};

	useEffect(() => {
		loadReviews();
	}, []);

	const filteredReviews = useMemo(
		() => statusFilter === 'all' ? reviews : reviews.filter((review) => review.status === statusFilter),
		[reviews, statusFilter],
	);

	const changeStatus = async (review, status) => {
		setActionError('');
		setUpdatingId(review.id);
		try {
			const token = await getAccessToken();
			const updated = await updateAdminReviewStatus(review.id, status, token);
			setReviews((current) => current.map((item) => item.id === review.id ? { ...item, ...updated } : item));
		} catch (error) {
			setActionError(error.message || 'Unable to update review status.');
		} finally {
			setUpdatingId('');
		}
	};

	return (
		<div className="admin-layout">
			<AdminSidebar />
			<main className="admin-content">
				<div className="admin-top">
					<div><p className="eyebrow">Workspace / Customer feedback</p><h1>Customer <em>voice.</em></h1></div>
					<button className="admin-secondary-button" type="button" onClick={loadReviews} disabled={isLoading}><RefreshCw size={15} /> Refresh</button>
				</div>
				{loadError && <p className="admin-settings-alert is-error" role="alert">{loadError}</p>}
				{actionError && <p className="admin-settings-alert is-error" role="alert">{actionError}</p>}
				<section className="admin-list-panel" aria-label="Customer review moderation">
					<div className="admin-list-heading">
						<div><h2>Review moderation</h2><p>{reviews.length} {reviews.length === 1 ? 'review' : 'reviews'} received</p></div>
						<label className="admin-record-filter" htmlFor="review-status-filter">
							<span>Status</span>
							<select id="review-status-filter" value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>
								<option value="pending">Pending</option>
								<option value="approved">Approved</option>
								<option value="rejected">Rejected</option>
								<option value="all">All statuses</option>
							</select>
						</label>
					</div>
					{isLoading ? <p className="admin-list-message" role="status">Loading reviews…</p> : loadError ? null : filteredReviews.length === 0 ? (
						<div className="admin-empty-state admin-inbox-empty-state">
							<span className="admin-empty-icon"><Star size={23} /></span>
							<h2>{reviews.length ? 'No reviews in this status.' : 'No customer reviews yet.'}</h2>
							<p>Reviews submitted on project pages will appear here for moderation.</p>
						</div>
					) : (
						<div className="admin-record-list">
							{filteredReviews.map((review) => (
								<article className="admin-record-card" key={review.id}>
									<div className="admin-record-heading">
										<div><h3>{review.name}</h3><p>{formatDate(review.created_at)}</p></div>
										<span className={`status-pill is-${review.status}`}>{review.status}</span>
									</div>
									<div className="admin-review-rating" aria-label={`${review.rating} out of 5 stars`}>
										{Array.from({ length: 5 }, (_, index) => <Star key={index} size={15} fill={index < review.rating ? 'currentColor' : 'none'} />)}
										<span>{review.rating}/5</span>
									</div>
									<p className="admin-record-description">{review.review}</p>
									{review.project?.title && <p className="admin-record-project">Project: {review.project.title}</p>}
									<label className="admin-record-status">
										Moderation status
										<select value={review.status} onChange={(event) => changeStatus(review, event.target.value)} disabled={updatingId === review.id}>
											{reviewStatuses.map((status) => <option key={status} value={status}>{status}</option>)}
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
