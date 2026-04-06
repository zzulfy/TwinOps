import { FormEvent, useState } from "react";
import { loginAdmin, setAdminSession } from "../api/backend";
import type { RouteMatch } from "../types/route";

export default function LoginPage({
  route,
  onLoginSuccess,
}: {
  route: RouteMatch;
  onLoginSuccess: (target: string) => void;
}) {
  const [username, setUsername] = useState("admin");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const authExpiredNotice = route.query.get("expired") === "1";

  const submitLogin = async (event: FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setErrorMessage("");
    try {
      const result = await loginAdmin(username.trim(), password);
      setAdminSession(result);
      const redirect = route.query.get("redirect") || "/";
      onLoginSuccess(redirect);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <h1>TwinOps Admin Login</h1>
        <p>Only administrator access is allowed.</p>
        {authExpiredNotice ? <div className="expired-notice">Session expired. Please sign in again.</div> : null}
        <form onSubmit={submitLogin}>
          <label>
            Username
            <input value={username} onChange={(event) => setUsername(event.target.value)} type="text" autoComplete="username" required />
          </label>
          <label>
            Password
            <input
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              type="password"
              autoComplete="current-password"
              required
            />
          </label>
          <button type="submit" disabled={loading}>
            {loading ? "Signing in..." : "Sign in"}
          </button>
        </form>
        {errorMessage ? <div className="error">{errorMessage}</div> : null}
        <div className="hint">Default admin credentials can be configured in backend application.yml.</div>
      </div>
    </div>
  );
}

