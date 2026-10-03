import { ArrowUpRight, Info, Star } from 'lucide-react';
import { Link } from 'react-router-dom';
import AdminSidebar from '../components/AdminSidebar';

export default function AdminReviews() {
	return (
		<div className="admin-layout">
			<AdminSidebar />
			<main className="admin-content">
				<div className="admin-top"><div><p className="eyebrow">Workspace / Customer feedback</p><h1>Customer <em>voice.</em></h1></div></div>
				<section className="admin-empty-state" aria-labelledby="reviews-empty-title">
					<span className="admin-empty-icon"><Star size={23} /></span>
					<p className="eyebrow">Review moderation</p>
					<h2 id="reviews-empty-title">Review moderation is not connected.</h2>
					<p>Customer reviews can be submitted, but this backend does not yet expose an admin queue to approve or hide them.</p>
					<div className="admin-status-note"><Info size={16} /> No review status has been changed.</div>
					<Link className="solid-button dark-button" to="/projects">View public projects <ArrowUpRight size={16} /></Link>
				</section>
			</main>
		</div>
	);
}
