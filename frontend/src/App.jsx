import { Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import Header from "./components/Header";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import Projects from "./pages/Projects";
import ProjectDetail from "./pages/ProjectDetail";
import Contact from "./pages/Contact";
import AdminLogin from "./pages/AdminLogin";
import AdminDashboard from "./pages/AdminDashboard";
import AdminProjects from "./pages/AdminProjects";
import AdminRequests from "./pages/AdminRequests";
import AdminReviews from "./pages/AdminReviews";
import NotFound from "./pages/NotFound";
import RequireAdmin from "./components/RequireAdmin";
import AdminSettings from "./pages/AdminSettings";
import { SettingsProvider } from "./context/SettingsContext";
export default function App() {
  const location = useLocation();
  return (
    <SettingsProvider><>
      <Header />
      <AnimatePresence mode="wait" initial>
      <motion.div className="route-layer" key={location.pathname} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.38, ease: [0.22, 1, 0.36, 1] }}>
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
      </motion.div>
      </AnimatePresence>
      <Footer />
    </></SettingsProvider>
  );
}
