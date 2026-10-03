import { Link } from "react-router-dom";
import { AtSign, Globe, ArrowUpRight } from "lucide-react";
import { useSettings } from "../context/SettingsContext";
export default function Footer() {
  const settings = useSettings();
  return (
    <footer className="footer">
      <div className="footer-top">
        <div>
          <Link to="/" className="logo light">
            {settings.logo_url ? <img className="logo-image" src={settings.logo_url} alt={settings.company_name} /> : <span className="logo-mark">I</span>}
            <span>
              {settings.company_name.toUpperCase()}
              <small>CONSTRUCTION</small>
            </span>
          </Link>
          <p>{settings.tagline}</p>
        </div>
        <div className="footer-links">
          <div>
            <b>Explore</b>
            <Link to="/projects">Our work</Link>
            <Link to="/contact">Contact</Link>
          </div>
          <div>
            <b>Connect</b>
            <a href={`mailto:${settings.email}`}>Email us</a>
            <a href={`https://wa.me/${settings.whatsapp}`}>
              WhatsApp <ArrowUpRight size={13} />
            </a>
          </div>
        </div>
      </div>
      <div className="footer-bottom">
        <span>© 2026 {settings.company_name}</span>
        <span className="social">
          <a href={`mailto:${settings.email}`} aria-label="Email">
            <AtSign size={16} />
          </a>
          <a href="/projects" aria-label="Projects">
            <Globe size={16} />
          </a>
        </span>
      </div>
    </footer>
  );
}
