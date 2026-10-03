import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { authClient } from "../services/auth";
export default function RequireAdmin({ children }) {
  const [state, setState] = useState("loading");
  const [error, setError] = useState("");
  useEffect(() => {
    let isMounted = true;
    if (!authClient) {
      setError("Supabase authentication is not configured for this frontend.");
      setState("error");
      return () => { isMounted = false; };
    }
    authClient.auth
      .getSession()
      .then(({ data, error: sessionError }) => {
        if (!isMounted) return;
        if (sessionError) {
          setError(sessionError.message);
          setState("error");
        } else {
          setState(data.session ? "ready" : "denied");
        }
      })
      .catch((sessionError) => {
        if (!isMounted) return;
        setError(sessionError.message || "Unable to check your sign-in session.");
        setState("error");
      });
    return () => { isMounted = false; };
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
  if (state === "error") return <Navigate to="/admin/login" replace state={{ message: error }} />;
  if (state !== "ready") return <Navigate to="/admin/login" replace />;
  return children;
}
