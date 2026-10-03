import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { authClient, isAdminUser } from "../services/auth";

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
      .getUser()
      .then(({ data, error: userError }) => {
        if (!isMounted) return;

        if (userError) {
          if (userError.name === "AuthSessionMissingError") {
            setState("signedOut");
            return;
          }
          setError(userError.message || "Unable to check your sign-in session.");
          setState("error");
          return;
        }

        if (!data.user) {
          setState("signedOut");
          return;
        }

        if (!isAdminUser(data.user)) {
          setError("Admin access required.");
          setState("denied");
          return;
        }

        setState("ready");
      })
      .catch((userError) => {
        if (!isMounted) return;
        setError(userError.message || "Unable to check your sign-in session.");
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
  if (state === "denied") return <Navigate to="/admin/login" replace state={{ message: "Admin access required." }} />;
  if (state !== "ready") return <Navigate to="/admin/login" replace />;
  return children;
}
