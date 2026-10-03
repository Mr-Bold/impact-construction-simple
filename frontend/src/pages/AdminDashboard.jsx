import { useEffect, useState } from "react";
import {
  ArrowRight,
  ArrowUpRight,
  CirclePlus,
  FolderKanban,
  MessageSquare,
  Star,
  Wrench,
} from "lucide-react";
import { Link } from "react-router-dom";
import AdminSidebar from "../components/AdminSidebar";
import { authClient } from "../services/auth";
import { getAdminRequests, getAdminReviews, getProjects } from "../services/api";
import { demoProjects } from "../data/demoProjects";

const quickActions = [
  { title: "Add new project", description: "Upload photos and videos", href: "/admin/projects", icon: CirclePlus },
  { title: "View new requests", description: "See customer enquiries", href: "/admin/requests", icon: MessageSquare },
  { title: "Review feedback", description: "Manage customer reviews", href: "/admin/reviews", icon: Star },
];

const projectImage = (project) => project.image
  || project.cover_image_url
  || project.project_media?.find((media) => media.media_type === "image")?.media_url
  || "";

export default function AdminDashboard() {
  const [projects, setProjects] = useState([]);
  const [projectsSource, setProjectsSource] = useState("loading");
  const [requests, setRequests] = useState([]);
  const [requestsState, setRequestsState] = useState("loading");
  const [requestsError, setRequestsError] = useState("");
  const [reviews, setReviews] = useState([]);
  const [reviewsState, setReviewsState] = useState("loading");
  const [reviewsError, setReviewsError] = useState("");

  useEffect(() => {
    let isMounted = true;
    getProjects()
      .then((items) => {
        if (!isMounted) return;
        setProjects(Array.isArray(items) ? items : []);
        setProjectsSource("live");
      })
      .catch(() => {
        if (!isMounted) return;
        setProjects(demoProjects);
        setProjectsSource("sample");
      });
    return () => { isMounted = false; };
  }, []);

  useEffect(() => {
    let isMounted = true;
    const loadInbox = async () => {
      try {
        if (!authClient) throw new Error("Supabase authentication is not configured.");
        const { data, error } = await authClient.auth.getSession();
        if (error) throw error;
        if (!data.session?.access_token) throw new Error("Your admin session has expired. Sign in again.");

        const [requestResult, reviewResult] = await Promise.allSettled([
          getAdminRequests(data.session.access_token),
          getAdminReviews(data.session.access_token),
        ]);
        if (!isMounted) return;
        if (requestResult.status === "fulfilled") {
          setRequests(requestResult.value);
          setRequestsState("live");
        } else {
          setRequestsError(requestResult.reason.message || "Unable to load work requests.");
          setRequestsState("error");
        }
        if (reviewResult.status === "fulfilled") {
          setReviews(reviewResult.value);
          setReviewsState("live");
        } else {
          setReviewsError(reviewResult.reason.message || "Unable to load reviews.");
          setReviewsState("error");
        }
      } catch (error) {
        if (!isMounted) return;
        const message = error.message || "Unable to load admin inbox data.";
        setRequestsError(message);
        setReviewsError(message);
        setRequestsState("error");
        setReviewsState("error");
      }
    };
    loadInbox();
    return () => { isMounted = false; };
  }, []);

  const newRequestCount = requests.filter((request) => request.status === "new").length;
  const pendingReviewCount = reviews.filter((review) => review.status === "pending").length;
  const activeJobCount = requests.filter((request) => request.status === "in_progress").length;
  const recentRequests = requests.slice(0, 3);

  const stats = [
    { label: "Total projects", value: projectsSource === "loading" ? "—" : String(projects.length).padStart(2, "0"), detail: projectsSource === "sample" ? "Sample portfolio" : "View all projects", href: "/admin/projects", icon: FolderKanban },
    { label: "New requests", value: requestsState === "loading" ? "—" : requestsState === "error" ? "!" : String(newRequestCount).padStart(2, "0"), detail: requestsState === "error" ? "Inbox unavailable" : "View requests", href: "/admin/requests", icon: MessageSquare },
    { label: "Pending reviews", value: reviewsState === "loading" ? "—" : reviewsState === "error" ? "!" : String(pendingReviewCount).padStart(2, "0"), detail: reviewsState === "error" ? "Queue unavailable" : "View reviews", href: "/admin/reviews", icon: Star },
    { label: "Active jobs", value: requestsState === "loading" ? "—" : requestsState === "error" ? "!" : String(activeJobCount).padStart(2, "0"), detail: requestsState === "error" ? "Inbox unavailable" : "View requests", href: "/admin/requests", icon: Wrench },
  ];

  return (
    <div className="admin-layout">
      <AdminSidebar />
      <main className="admin-content">
        <div className="admin-overview-heading">
          <div>
            <p className="eyebrow">Overview</p>
            <h1>Good morning,<br /><em>let’s build.</em></h1>
          </div>
          <Link className="solid-button dark-button" to="/admin/projects">Manage projects <ArrowUpRight size={16} /></Link>
        </div>

        {requestsError && <p className="admin-settings-alert is-error" role="alert">Requests: {requestsError}</p>}
        {reviewsError && <p className="admin-settings-alert is-error" role="alert">Reviews: {reviewsError}</p>}

        <section className="admin-stats" aria-label="Workspace summary">
          {stats.map(({ label, value, detail, href, icon: Icon }) => (
            <Link className="admin-stat" to={href} key={label}>
              <Icon size={23} strokeWidth={1.8} />
              <small>{label}</small>
              <b>{value}</b>
              <span>{detail}<ArrowRight size={13} /></span>
            </Link>
          ))}
        </section>

        <div className="admin-overview-columns">
          <section className="admin-dashboard-panel admin-requests-panel">
            <div className="admin-panel-heading">
              <h2>Recent requests</h2>
              <Link to="/admin/requests">View all</Link>
            </div>
            {requestsState === "loading" ? (
              <div className="admin-inbox-empty" role="status">Loading recent requests…</div>
            ) : requestsState === "error" ? (
              <div className="admin-inbox-empty">
                <MessageSquare size={23} />
                <b>Could not load requests</b>
                <p>{requestsError}</p>
                <Link to="/admin/requests">Open requests <ArrowRight size={14} /></Link>
              </div>
            ) : recentRequests.length ? (
              <div className="admin-dashboard-requests">
                {recentRequests.map((request) => (
                  <Link className="admin-dashboard-request" to="/admin/requests" key={request.id}>
                    <span><b>{request.full_name}</b><small>{request.work_type} · {request.location}</small></span>
                    <span className={`status-pill is-${request.status}`}>{request.status.replaceAll("_", " ")}</span>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="admin-inbox-empty">
                <MessageSquare size={23} />
                <b>No requests yet</b>
                <p>Customer enquiries submitted through the website will appear here.</p>
                <Link to="/admin/requests">Open requests <ArrowRight size={14} /></Link>
              </div>
            )}
          </section>

          <section className="admin-dashboard-panel admin-projects-panel">
            <div className="admin-panel-heading">
              <h2>Recent projects</h2>
              <Link to="/admin/projects">View all</Link>
            </div>
            {projects.length > 0 ? (
              <div className="admin-recent-projects">
                {projects.slice(0, 3).map((project) => (
                  <Link className="admin-recent-project" to="/admin/projects" key={project.id}>
                    {projectImage(project) ? <img src={projectImage(project)} alt="" loading="lazy" /> : <span className="admin-project-placeholder"><FolderKanban size={20} /></span>}
                    <span className="admin-recent-project-name"><b>{project.title}</b><small>{typeof project.category === "string" ? project.category : project.category?.name || "Construction"}</small></span>
                    <span className="admin-project-meta"><b>{project.likes ?? project.like_count ?? "—"}</b><small>Likes</small><i>{project.status === "draft" ? "Draft" : "Published"}</i></span>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="admin-projects-empty">No projects have been published yet.</div>
            )}
            {projectsSource === "sample" && <p className="admin-data-note">Showing sample portfolio data while the project service is unavailable.</p>}
            <Link className="admin-panel-footer-link" to="/admin/projects">View all projects <ArrowRight size={14} /></Link>
          </section>
        </div>

        <section className="admin-dashboard-panel admin-quick-panel">
          <div className="admin-panel-heading">
            <h2>Quick start</h2>
            <span>{new Intl.DateTimeFormat("en", { month: "long", year: "numeric" }).format(new Date())}</span>
          </div>
          <div className="admin-quick">
            {quickActions.map(({ title, description, href, icon: Icon }) => (
              <Link to={href} key={title}>
                <Icon size={24} strokeWidth={1.7} />
                <span><b>{title}</b><small>{description}</small></span>
                <ArrowRight size={15} />
              </Link>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
