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
import { getProjects } from "../services/api";
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

  const stats = [
    { label: "Total projects", value: projectsSource === "loading" ? "—" : String(projects.length).padStart(2, "0"), detail: projectsSource === "sample" ? "Sample portfolio" : "View all projects", href: "/admin/projects", icon: FolderKanban },
    { label: "New requests", value: "—", detail: "Inbox unavailable", href: "/admin/requests", icon: MessageSquare },
    { label: "Pending reviews", value: "—", detail: "Queue unavailable", href: "/admin/reviews", icon: Star },
    { label: "Active jobs", value: "—", detail: "Tracking unavailable", href: "/admin/projects", icon: Wrench },
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
            <div className="admin-inbox-empty">
              <MessageSquare size={23} />
              <b>Request inbox is not connected yet</b>
              <p>Customer enquiries will appear here when request management is connected.</p>
              <Link to="/admin/requests">Open requests <ArrowRight size={14} /></Link>
            </div>
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
