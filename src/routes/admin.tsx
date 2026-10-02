import { createFileRoute, Link, Navigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { signOut } from "@/lib/auth/client";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { AdminDesk } from "@/components/store/admin-desk";
import { getStoreProfile } from "@/lib/store/admin";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Store dashboard — UV" },
      { name: "description", content: "Manage UV products, inventory and orders." },
    ],
  }),
  component: AdminPage,
});

function AdminPage() {
  const { user, isPending } = useCurrentUserState();
  const profile = useQuery({
    queryKey: ["store-profile"],
    queryFn: () => getStoreProfile(),
    enabled: !!user,
    retry: false,
  });

  if (isPending) {
    return (
      <div className="admin-login-wrap">
        <div className="state-message">Checking store access…</div>
      </div>
    );
  }
  if (!user) return <Navigate to="/login" search={{ next: "/admin" }} />;

  if (profile.isLoading) {
    return (
      <div className="admin-login-wrap">
        <div className="state-message">Opening the desk…</div>
      </div>
    );
  }

  if (profile.isError || !profile.data?.isAdmin) {
    return (
      <div className="admin-login-wrap">
        <div className="auth-card admin-login">
          <Link to="/" className="wordmark" aria-label="UV home">
            <img src="/uv-logo.png" alt="UV" className="brand-logo" />
          </Link>
          <span className="eyebrow">RESTRICTED</span>
          <h1>Not this door.</h1>
          <p>
            This account does not have store administrator access. The first signed-in owner becomes admin
            automatically. Ask the store owner if you need access.
          </p>
          <Link to="/" className="button button-dark full">
            Return to UV
          </Link>
        </div>
      </div>
    );
  }

  return (
    <AdminDesk
      onSignOut={() => {
        void signOut().catch(() => undefined);
      }}
    />
  );
}
