import { Fragment, useEffect, useState } from "react";
import { Search, SlidersHorizontal } from "lucide-react";
import ProjectCard from "../components/ProjectCard";
import ProjectAdSlideshow from "../components/ProjectAdSlideshow";
import RequestModal from "../components/RequestModal";
import { demoProjects } from "../data/demoProjects";
import { getProjects } from "../services/api";
const categories = [
  "All",
  "Building",
  "Roofing",
  "Tiling",
  "Painting",
  "Plumbing",
  "Electrical",
  "Landscaping",
  "Renovation",
];
export default function Projects() {
  const [projects, setProjects] = useState(demoProjects),
    [category, setCategory] = useState("All"),
    [query, setQuery] = useState(""),
    [request, setRequest] = useState(null);
  useEffect(() => {
    getProjects(category)
      .then(setProjects)
      .catch(() => {});
  }, [category]);
  const filtered = projects.filter(
    (p) =>
      (category === "All" || p.category === category) &&
      `${p.title} ${p.category} ${p.location}`
        .toLowerCase()
        .includes(query.toLowerCase()),
  );
  return (
    <main className="page-shell projects-page">
      <div className="page-intro">
        <p className="eyebrow">The portfolio</p>
        <h1>
          Our <em>work.</em>
        </h1>
        <p>
          Every project is a conversation between a clear idea and careful
          execution.
        </p>
      </div>
      <div className="gallery-toolbar">
        <div className="category-scroll">
          {categories.map((c) => (
            <button
              className={category === c ? "active" : ""}
              onClick={() => setCategory(c)}
              key={c}
            >
              {c}
            </button>
          ))}
        </div>
        <label className="search-box">
          <Search size={17} />
          <input
            placeholder="Search projects"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </label>
        <SlidersHorizontal className="filter-icon" size={18} />
      </div>
      <div className="project-grid">
            {filtered.map((project, index) => (
              <Fragment key={project.id}>
                <ProjectCard project={project} onRequest={setRequest} />
                {(index + 1) % 10 === 0 && <ProjectAdSlideshow key={`ad-${project.id}`} projects={filtered} />}
              </Fragment>
            ))}
      </div>
      {!filtered.length && (
        <div className="empty-state">
          <p>No projects match that search yet.</p>
        </div>
      )}
      {request && (
        <RequestModal project={request} onClose={() => setRequest(null)} />
      )}
    </main>
  );
}
