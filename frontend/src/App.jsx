import { lazy, Suspense } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import Header from "./components/Header";
import Footer from "./components/Footer";
import RequireAdmin from "./components/RequireAdmin";
import { SettingsProvider } from "./context/SettingsContext";

const Home = lazy(() => import("./pages/Home"));
const Projects = lazy(() => import("./pages/Projects"));
const ProjectDetail = lazy(() => import("./pages/ProjectDetail"));
const Contact = lazy(() => import("./pages/Contact"));
const AdminLogin = lazy(() => import("./pages/AdminLogin"));
const AdminDashboard = lazy(() => import("./pages/AdminDashboard"));
const AdminProjects = lazy(() => import("./pages/AdminProjects"));
const AdminRequests = lazy(() => import("./pages/AdminRequests"));
const AdminReviews = lazy(() => import("./pages/AdminReviews"));
const AdminSettings = lazy(() => import("./pages/AdminSettings"));
const NotFound = lazy(() => import("./pages/NotFound"));
export default function App() {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith("/admin");
  return (
    <SettingsProvider>
      {!isAdminRoute && <Header />}
      <div id="main-content" tabIndex={-1} className="route-layer" key={location.pathname}>
        <Suspense
          fallback={
            <main className="page-shell" role="status" aria-live="polite">
              Loading page…
            </main>
          }
        >
          <Routes location={location}>
            <Route path="/" element={<Home />} />
            <Route path="/projects" element={<Projects />} />
            <Route path="/projects/:projectId" element={<ProjectDetail />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/admin/dashboard" element={<RequireAdmin><AdminDashboard /></RequireAdmin>} />
            <Route path="/admin/projects" element={<RequireAdmin><AdminProjects /></RequireAdmin>} />
            <Route path="/admin/requests" element={<RequireAdmin><AdminRequests /></RequireAdmin>} />
            <Route path="/admin/reviews" element={<RequireAdmin><AdminReviews /></RequireAdmin>} />
            <Route path="/admin/settings" element={<RequireAdmin><AdminSettings /></RequireAdmin>} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </div>
      {!isAdminRoute && <Footer />}
    </SettingsProvider>
  );
}
