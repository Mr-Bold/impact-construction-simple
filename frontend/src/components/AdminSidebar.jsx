import { NavLink, useNavigate } from "react-router-dom";
import {
  BarChart3,
  FolderKanban,
  LogOut,
  MessageSquare,
  Settings,
  Star,
  Wrench,
} from "lucide-react";
export default function AdminSidebar() {
  const navigate = useNavigate();
  return (
    <aside className="admin-sidebar">
      <NavLink to="/admin/dashboard" className="admin-brand">
        <span className="logo-mark">I</span>
        <span>
          IMPACT<small>WORKSPACE</small>
        </span>
      </NavLink>
      <nav>
        <NavLink to="/admin/dashboard">
          <BarChart3 size={17} />
          Overview
        </NavLink>
        <NavLink to="/admin/projects">
          <FolderKanban size={17} />
          Projects
        </NavLink>
        <NavLink to="/admin/requests">
          <MessageSquare size={17} />
          Requests
        </NavLink>
        <NavLink to="/admin/reviews">
          <Star size={17} />
          Reviews
        </NavLink>
        <NavLink to="/admin/settings">
          <Settings size={17} />
          Settings
        </NavLink>
      </nav>
      <button className="admin-logout" onClick={() => navigate("/")}>
        <LogOut size={16} />
        Exit workspace
      </button>
    </aside>
  );
}
