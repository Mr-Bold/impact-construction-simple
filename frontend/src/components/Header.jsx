import { Link, NavLink } from "react-router-dom";
import { ArrowUpRight, Menu, X } from "lucide-react";
import { useState } from "react";
import { useSettings } from "../context/SettingsContext";
export default function Header() {
  const [open, setOpen] = useState(false);
  const settings = useSettings();
  return (
    <header className="site-header">
      <Link to="/" className="logo" onClick={() => setOpen(false)}>
        {settings.logo_url ? (
          <img
            className="logo-image"
            src={settings.logo_url}
            alt={settings.company_name}
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
        onClick={() => setOpen(!open)}
        aria-label="Toggle navigation"
      >
        {open ? <X /> : <Menu />}
      </button>
      <nav className={open ? "nav open" : "nav"}>
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
