import { useEffect, useMemo, useState } from "react";
import {
  ArrowUpRight,
  ChevronLeft,
  ChevronRight,
  Pause,
  Play,
} from "lucide-react";
import { Link } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";

export default function ProjectAdSlideshow({ projects }) {
  const slides = useMemo(
    () =>
      projects.flatMap((project) => {
        const media = (project.project_media || [])
          .filter((item) => item.media_type === "image")
          .map((item) => item.media_url);
        return [...new Set([project.image, ...media].filter(Boolean))].map(
          (image) => ({
            image,
            title: project.title,
            category: project.category,
            slug: project.slug,
          }),
        );
      }),
    [projects],
  );
  const [index, setIndex] = useState(0);
  const [reducedMotion, setReducedMotion] = useState(() =>
    window.matchMedia("(prefers-reduced-motion: reduce)").matches,
  );
  const [paused, setPaused] = useState(() =>
    window.matchMedia("(prefers-reduced-motion: reduce)").matches,
  );

  useEffect(() => {
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    const updateMotionPreference = (event) => {
      setReducedMotion(event.matches);
      setPaused(event.matches);
    };
    preference.addEventListener("change", updateMotionPreference);
    return () =>
      preference.removeEventListener("change", updateMotionPreference);
  }, []);

  useEffect(() => {
    setIndex((current) => (slides.length ? current % slides.length : 0));
  }, [slides.length]);

  useEffect(() => {
    if (slides.length < 2 || paused || reducedMotion) return undefined;
    const timer = window.setInterval(() => {
      if (!document.hidden) {
        setIndex((current) => (current + 1) % slides.length);
      }
    }, 5500);
    return () => window.clearInterval(timer);
  }, [paused, reducedMotion, slides.length]);

  if (!slides.length) return null;

  const slide = slides[index];
  const move = (step) =>
    setIndex((current) => (current + step + slides.length) % slides.length);

  return (
    <aside className="project-ad" aria-label="Featured projects">
      <AnimatePresence mode="wait">
        <motion.div
          className="project-ad-image"
          key={slide.image}
          initial={reducedMotion ? false : { opacity: 0, scale: 1.04 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: reducedMotion ? 1 : 0.98 }}
          transition={{ duration: reducedMotion ? 0 : 0.65 }}
        >
          <img
            src={slide.image}
            alt={slide.title}
            loading="lazy"
            decoding="async"
          />
        </motion.div>
      </AnimatePresence>
      <div className="project-ad-scrim" />
      <div className="project-ad-copy">
        <p className="eyebrow light-text">Need work like this?</p>
        <h2>
          Make your next
          <br />
          <em>project happen.</em>
        </h2>
        <p>
          Explore our completed {slide.category.toLowerCase()} work, then tell
          us what you have in mind.
        </p>
        <Link className="solid-button" to={`/projects/${slide.slug}`}>
          View this project <ArrowUpRight size={16} />
        </Link>
      </div>
      {slides.length > 1 && (
        <div className="project-ad-controls">
          <button
            type="button"
            onClick={() => setPaused((current) => !current)}
            aria-label={paused ? "Play featured projects" : "Pause featured projects"}
          >
            {paused ? <Play size={16} aria-hidden="true" /> : <Pause size={16} aria-hidden="true" />}
          </button>
          <button
            type="button"
            onClick={() => move(-1)}
            aria-label="Previous featured project"
          >
            <ChevronLeft size={17} aria-hidden="true" />
          </button>
          <span aria-live="off">
            {String(index + 1).padStart(2, "0")} /{" "}
            {String(slides.length).padStart(2, "0")}
          </span>
          <button
            type="button"
            onClick={() => move(1)}
            aria-label="Next featured project"
          >
            <ChevronRight size={17} aria-hidden="true" />
          </button>
        </div>
      )}
    </aside>
  );
}
