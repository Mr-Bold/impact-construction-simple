import { Link } from "react-router-dom";
import {
  ArrowDownRight,
  ArrowUpRight,
  Check,
  HardHat,
  Hammer,
  Paintbrush,
  Ruler,
  Star,
} from "lucide-react";
import { demoProjects } from "../data/demoProjects";
import ProjectCard from "../components/ProjectCard";
import RequestModal from "../components/RequestModal";
import { useState } from "react";
export default function Home() {
  const [request, setRequest] = useState(null);
  return (
    <>
      <main className="home">
        <section className="hero">
          <div className="hero-image" />
          <div className="hero-content">
            <p className="eyebrow light-text">
              Construction · Renovation · Handy-work
            </p>
            <h1>
              We build.
              <br />
              <em>We transform.</em>
              <br />
              We deliver.
            </h1>
            <p className="hero-copy">
              Thoughtful spaces, built with discipline. From foundations to
              final finishes, we bring clarity and craft to every project.
            </p>
            <div className="hero-actions">
              <Link className="solid-button" to="/projects">
                View our work <ArrowUpRight size={17} />
              </Link>
              <Link className="text-button light-text" to="/contact">
                Talk to us <ArrowDownRight size={17} />
              </Link>
            </div>
          </div>
          <div className="hero-note">
            01 <span /> Built in Canada.
          </div>
        </section>
        <section className="statement-section">
          <p className="eyebrow">The difference is in the detail</p>
          <h2>
            Built for the way
            <br />
            <em>you want to live.</em>
          </h2>
          <div className="statement-grid">
            <p>
              Impact Construction is a hands-on construction and handy-work
              company for people who care about the result. We combine honest
              communication with exacting workmanship.
            </p>
            <div className="stat-list">
              <div>
                <b>
                  100<span>+</span>
                </b>
                <small>Projects completed</small>
              </div>
              <div>
                <b>
                  8<span>+</span>
                </b>
                <small>Years experience</small>
              </div>
              <div>
                <b>
                  95<span>%</span>
                </b>
                <small>Happy clients</small>
              </div>
            </div>
          </div>
        </section>
        <section className="dark-section">
          <div className="section-heading">
            <div>
              <p className="eyebrow light-text">Selected work</p>
              <h2>
                Made to be
                <br />
                <em>lived in.</em>
              </h2>
            </div>
            <Link className="text-button light-text" to="/projects">
              See all projects <ArrowUpRight size={16} />
            </Link>
          </div>
          <div className="project-grid featured-grid">
            {demoProjects.slice(0, 3).map((project) => (
              <ProjectCard
                key={project.id}
                project={project}
                onRequest={setRequest}
              />
            ))}
          </div>
        </section>
        <section className="services-section">
          <div className="section-heading">
            <div>
              <p className="eyebrow">What we do</p>
              <h2>
                From first sketch
                <br />
                <em>to final touch.</em>
              </h2>
            </div>
            <p className="section-intro">
              One experienced team, the full range of work. We make complex
              projects feel straightforward.
            </p>
          </div>
          <div className="services-grid">
            {[
              [
                HardHat,
                "Building construction",
                "A solid foundation for what comes next.",
              ],
              [
                Hammer,
                "Roofing & repairs",
                "Protection that looks as good as it works.",
              ],
              [
                Paintbrush,
                "Finishing & interiors",
                "The detail that turns a house into home.",
              ],
              [
                Ruler,
                "Renovation & handy-work",
                "Thoughtful upgrades, done properly.",
              ],
            ].map(([Icon, title, copy]) => (
              <div className="service" key={title}>
                <Icon size={22} />
                <h3>{title}</h3>
                <p>{copy}</p>
              </div>
            ))}
          </div>
        </section>
        <section className="cta-section">
          <p className="eyebrow">Let’s make a plan</p>
          <h2>
            Have a project
            <br />
            <em>in mind?</em>
          </h2>
          <Link className="solid-button dark-button" to="/contact">
            Start a conversation <ArrowUpRight size={17} />
          </Link>
        </section>
      </main>
      {request && (
        <RequestModal project={request} onClose={() => setRequest(null)} />
      )}
    </>
  );
}
