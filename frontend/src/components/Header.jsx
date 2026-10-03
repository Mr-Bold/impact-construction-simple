import { Link, NavLink } from "react-router-dom";
import { ArrowUpRight, Menu, X } from "lucide-react";
import { useState } from "react";
import { useSettings } from "../context/SettingsContext";
export default function Header() {
  const [open, setOpen] = useState(false);
  const settings = useSettings();
  return (
    <header className="site-header">
      <a className="skip-link" href="#main-content">
        Skip to main content
      </a>
      <Link to="/" className="logo" onClick={() => setOpen(false)}>
        {settings.logo_url ? (
          <img
            className="logo-image"
            src={settings.logo_url}
            alt=""
          />
        ) : (
          <span className="logo-mark">I</span>
        )}
        <span>
          {settings.company_name.toUpperCase()}
          <small>CONSTRUCTION</small>
        </span>
      </Link>
      <button
        className="menu-button"
        type="button"
        onClick={() => setOpen(!open)}
        aria-label={open ? "Close navigation" : "Open navigation"}
        aria-expanded={open}
        aria-controls="primary-navigation"
      >
        {open ? <X /> : <Menu />}
      </button>
      <nav
        id="primary-navigation"
        className={open ? "nav open" : "nav"}
        aria-label="Main navigation"
      >
        <NavLink to="/projects" onClick={() => setOpen(false)}>
          Our work
        </NavLink>
        <NavLink to="/contact" onClick={() => setOpen(false)}>
          Contact
        </NavLink>
        <a
          className="nav-cta"
          href={`https://wa.me/${settings.whatsapp}`}
          target="_blank"
          rel="noreferrer"
          onClick={() => setOpen(false)}
        >
          Start a project <ArrowUpRight size={15} />
        </a>
      </nav>
    </header>
  );
}
