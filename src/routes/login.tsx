import { useState, type FormEvent } from "react";
import { createFileRoute, Link, Navigate } from "@tanstack/react-router";
import { CircleAlert } from "lucide-react";
import { GROK_PROVIDERS, authClient, authEnabled, signIn } from "@/lib/auth/client";
import { useCurrentUserState } from "@/lib/auth/use-current-user";

export const Route = createFileRoute("/login")({
  validateSearch: (search: Record<string, unknown>) => ({
    next: typeof search.next === "string" ? search.next : "/",
  }),
  head: () => ({
    meta: [
      { title: "Sign in — UV" },
      { name: "description", content: "Sign in to your UV account." },
    ],
  }),
  component: Login,
});

function Login() {
  const { next } = Route.useSearch();
  const { user, isPending } = useCurrentUserState();
  const [mode, setMode] = useState<"in" | "up">("in");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  if (!isPending && user) {
    const target = next && next.startsWith("/") ? next : "/";
    return <Navigate to={target} />;
  }

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setPending(true);
    setError("");
    try {
      if (mode === "up") {
        const result = await authClient.signUp.email({ name: name || email, email, password });
        if (result.error) throw new Error(result.error.message || "Unable to create an account.");
      } else {
        const result = await authClient.signIn.email({ email, password });
        if (result.error) throw new Error(result.error.message || "Unable to sign in.");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Sign-in failed.");
      setPending(false);
    }
  };

  return (
    <div className="admin-login-wrap">
      <form className="auth-card admin-login" onSubmit={submit}>
        <Link to="/" className="wordmark" aria-label="UV home">
          <img src="/uv-logo.png" alt="UV" className="brand-logo" />
        </Link>
        <span className="eyebrow">{mode === "in" ? "WELCOME BACK" : "JOIN UV"}</span>
        <h1>{mode === "in" ? "Sign in." : "Create account."}</h1>
        <p>{mode === "in" ? "Your orders, waiting quietly." : "Optional — guest checkout is always available."}</p>
        {authEnabled ? (
          <div className="auth-methods">
            {GROK_PROVIDERS.map((p) => (
              <button
                key={p.providerId}
                type="button"
                onClick={() => signIn(p.providerId, { callbackURL: next || "/" })}
              >
                Continue with {p.label}
              </button>
            ))}
          </div>
        ) : (
          <p className="setup-note">Sign-in is disabled.</p>
        )}
        <div className="auth-split">or email</div>
        {mode === "up" && (
          <label className="field">
            Name
            <input value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" />
          </label>
        )}
        <label className="field">
          Email address
          <input
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </label>
        <label className="field">
          Password
          <input
            type="password"
            required
            minLength={8}
            autoComplete={mode === "up" ? "new-password" : "current-password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </label>
        {error && (
          <div className="inline-error">
            <CircleAlert size={16} />
            {error}
          </div>
        )}
        <button className="button button-dark full" disabled={pending || !authEnabled}>
          {pending ? "Please wait…" : mode === "in" ? "Sign in" : "Create account"}
        </button>
        <p className="auth-foot">
          {mode === "in" ? (
            <button type="button" className="text-link" onClick={() => setMode("up")}>
              New to UV? Create an account
            </button>
          ) : (
            <button type="button" className="text-link" onClick={() => setMode("in")}>
              Already have an account? Sign in
            </button>
          )}
        </p>
      </form>
    </div>
  );
}
