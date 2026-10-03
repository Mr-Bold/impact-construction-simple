import { useEffect, useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import {
  Bell,
  BarChart3,
  ChevronDown,
  CircleHelp,
  FolderKanban,
  LogOut,
  Menu,
  MessageSquare,
  Search,
  Settings,
  Star,
  X,
} from "lucide-react";
import { useSettings } from "../context/SettingsContext";
import { authClient } from "../services/auth";

export default function AdminSidebar() {
  const navigate = useNavigate();
  const settings = useSettings();
  const [adminEmail, setAdminEmail] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    authClient?.auth.getUser().then(({ data }) => setAdminEmail(data.user?.email || ""));
  }, []);

  const handleLogout = async () => {
    await authClient?.auth.signOut();
    navigate("/");
  };

  const closeMobileMenu = () => setMobileMenuOpen(false);

  return (
    <>
      <header className="admin-header">
        <button type="button" className="admin-mobile-menu-toggle" aria-label={mobileMenuOpen ? "Close admin menu" : "Open admin menu"} aria-expanded={mobileMenuOpen} onClick={() => setMobileMenuOpen((open) => !open)}>
          {mobileMenuOpen ? <X size={21} /> : <Menu size={21} />}
        </button>
        <Link to="/admin/dashboard" className="admin-mobile-brand" onClick={closeMobileMenu}>
          {settings.logo_url ? <img className="admin-brand-logo" src={settings.logo_url} alt={settings.company_name} /> : <span className="logo-mark">I</span>}<span>IMPACT<small>WORKSPACE</small></span>
        </Link>
        <Link to="/admin/dashboard" className="admin-header-brand">
          {settings.logo_url ? <img className="admin-brand-logo" src={settings.logo_url} alt={settings.company_name} /> : <span className="logo-mark">I</span>}
          <span>{settings.company_name.toUpperCase()}<small>CONSTRUCTION</small></span>
        </Link>
        <div className="admin-header-actions">
          <button type="button" aria-label="Open projects" title="Open projects" onClick={() => navigate("/admin/projects")}><Search size={19} /></button>
          <NavLink to="/admin/requests" aria-label="Open requests" title="Open requests"><Bell size={19} /></NavLink>
          <span className="admin-header-divider" />
          <span className="admin-avatar" aria-hidden="true">{adminEmail ? adminEmail.charAt(0).toUpperCase() : "A"}</span>
          <span className="admin-identity"><b>{adminEmail ? adminEmail.split("@")[0] : "Administrator"}</b><small>Administrator</small></span>
          <ChevronDown size={15} className="admin-profile-chevron" />
        </div>
      </header>
      {mobileMenuOpen && (
        <>
          <button type="button" className="admin-mobile-menu-scrim" onClick={closeMobileMenu} aria-label="Close admin menu" />
          <div className="admin-mobile-menu">
            <p className="eyebrow">Workspace</p>
            <NavLink to="/admin/dashboard" onClick={closeMobileMenu}><BarChart3 size={17} />Overview</NavLink>
            <NavLink to="/admin/projects" onClick={closeMobileMenu}><FolderKanban size={17} />Projects</NavLink>
            <NavLink to="/admin/requests" onClick={closeMobileMenu}><MessageSquare size={17} />Requests</NavLink>
            <NavLink to="/admin/reviews" onClick={closeMobileMenu}><Star size={17} />Reviews</NavLink>
            <NavLink to="/admin/settings" onClick={closeMobileMenu}><Settings size={17} />Settings</NavLink>
            <button type="button" onClick={handleLogout}><LogOut size={17} />Sign out</button>
          </div>
        </>
      )}
      <aside className="admin-sidebar">
        <div className="admin-workspace-mark">{settings.logo_url ? <img className="admin-brand-logo" src={settings.logo_url} alt={settings.company_name} /> : <span className="logo-mark">I</span>}<span>IMPACT<small>WORKSPACE</small></span></div>
        <nav aria-label="Admin navigation">
          <NavLink to="/admin/dashboard"><BarChart3 size={18} />Overview</NavLink>
          <NavLink to="/admin/projects"><FolderKanban size={18} />Projects</NavLink>
          <NavLink to="/admin/requests"><MessageSquare size={18} />Requests</NavLink>
          <NavLink to="/admin/reviews"><Star size={18} />Reviews</NavLink>
          <NavLink to="/admin/settings"><Settings size={18} />Settings</NavLink>
        </nav>
        <div className="admin-sidebar-bottom">
          <div className="admin-help-card"><CircleHelp size={19} /><div><b>Need help?</b><small>We’re here to help you</small></div><Link to="/contact">Contact support</Link></div>
          <button className="admin-logout" onClick={handleLogout}><LogOut size={16} />Sign out</button>
        </div>
      </aside>
    </>
  );
}
