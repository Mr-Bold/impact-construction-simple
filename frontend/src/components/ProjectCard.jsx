import { Link } from "react-router-dom";
import { ArrowUpRight, Heart, Star } from "lucide-react";
export default function ProjectCard({ project, onRequest }) {
  return (
    <article className="project-card">
      <Link to={`/projects/${project.slug}`} className="project-image">
        <img
          src={project.image || project.project_media?.[0]?.media_url}
          alt={project.title}
          loading="lazy"
          decoding="async"
        />
        <span className="project-category">{project.category}</span>
      </Link>
      <div className="project-card-body">
        <div className="project-card-meta">
          <span>{project.location}</span>
          <span className="rating">
            <Star size={14} fill="currentColor" aria-hidden="true" />{" "}
            {project.rating || "New"}
          </span>
        </div>
        <h3>{project.title}</h3>
        <p>{project.description}</p>
        <div className="project-actions">
          <Link to={`/projects/${project.slug}`}>
            View project <ArrowUpRight size={15} />
          </Link>
          <button onClick={() => onRequest(project)}>
            Request similar work
          </button>
        </div>
      </div>
    </article>
  );
}
