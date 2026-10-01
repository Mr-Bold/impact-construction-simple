import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { authClient } from "../services/auth";
export default function RequireAdmin({ children }) {
  const [state, setState] = useState("loading");
  useEffect(() => {
    if (!authClient) {
      setState("missing");
      return;
    }
    authClient.auth
      .getSession()
      .then(({ data }) => setState(data.session ? "ready" : "denied"));
  }, []);
  if (state === "loading")
    return (
      <main className="admin-page">
        <p className="eyebrow">Checking access</p>
        <h1>
          Opening
          <br />
          <em>workspace.</em>
        </h1>
      </main>
    );
  if (state !== "ready") return <Navigate to="/admin/login" replace />;
  return children;
}
