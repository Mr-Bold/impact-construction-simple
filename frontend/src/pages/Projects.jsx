import { Fragment, lazy, Suspense, useEffect, useState } from "react";
import { Search, SlidersHorizontal } from "lucide-react";
import ProjectCard from "../components/ProjectCard";
import RequestModal from "../components/RequestModal";
import { demoProjects } from "../data/demoProjects";
import { getProjects } from "../services/api";
const ProjectAdSlideshow = lazy(
  () => import("../components/ProjectAdSlideshow"),
);
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
    [request, setRequest] = useState(null),
    [loadError, setLoadError] = useState("");
  useEffect(() => {
    const controller = new AbortController();
    setLoadError("");
    getProjects(category, { signal: controller.signal })
      .then(setProjects)
      .catch((error) => {
        if (error.name !== "AbortError") {
          console.error("Unable to load live projects.", error);
          setLoadError("Live projects are temporarily unavailable.");
        }
      });
    return () => controller.abort();
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
        <div
          className="category-scroll"
          role="group"
          aria-label="Filter projects by category"
        >
          {categories.map((c) => (
            <button
              type="button"
              className={category === c ? "active" : ""}
              aria-pressed={category === c}
              onClick={() => setCategory(c)}
              key={c}
            >
              {c}
            </button>
          ))}
        </div>
        <label className="search-box">
          <Search size={17} aria-hidden="true" />
          <input
            type="search"
            aria-label="Search projects"
            placeholder="Search projects"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </label>
        <SlidersHorizontal className="filter-icon" size={18} aria-hidden="true" />
      </div>
      {loadError && (
        <p className="form-error" role="alert">
          Showing available sample projects. {loadError}
        </p>
      )}
      <div className="project-grid">
            {filtered.map((project, index) => (
              <Fragment key={project.id}>
                <ProjectCard project={project} onRequest={setRequest} />
                {(index + 1) % 10 === 0 && (
                  <Suspense key={`ad-${project.id}`} fallback={null}>
                    <ProjectAdSlideshow projects={filtered} />
                  </Suspense>
                )}
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
