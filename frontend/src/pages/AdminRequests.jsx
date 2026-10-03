import { ArrowUpRight, ClipboardList, Info } from 'lucide-react';
import { Link } from 'react-router-dom';
import AdminSidebar from '../components/AdminSidebar';

export default function AdminRequests() {
	return (
		<div className="admin-layout">
			<AdminSidebar />
			<main className="admin-content">
				<div className="admin-top"><div><p className="eyebrow">Workspace / Enquiries</p><h1>Work <em>requests.</em></h1></div></div>
				<section className="admin-empty-state" aria-labelledby="requests-empty-title">
					<span className="admin-empty-icon"><ClipboardList size={23} /></span>
					<p className="eyebrow">Request inbox</p>
					<h2 id="requests-empty-title">Request management is not connected.</h2>
					<p>The current backend accepts project enquiries, but does not yet provide an authenticated admin inbox or status updates.</p>
					<div className="admin-status-note"><Info size={16} /> Enquiries are not displayed here until the admin API is available.</div>
					<Link className="solid-button dark-button" to="/contact">View public enquiry form <ArrowUpRight size={16} /></Link>
				</section>
			</main>
		</div>
	);
}
