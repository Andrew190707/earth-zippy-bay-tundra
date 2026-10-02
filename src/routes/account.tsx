import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight } from "lucide-react";
import { RedirectToSignIn } from "@/lib/auth/gates";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { Shell } from "@/components/store/layout";
import { EmptyState, Status } from "@/components/store/ui";
import { listAccountOrders } from "@/lib/store/checkout";
import { money } from "@/lib/store/money";
import type { Order } from "@/lib/store/types";

export const Route = createFileRoute("/account")({
  head: () => ({
    meta: [
      { title: "Your account — UV" },
      { name: "description", content: "Sign in to view your UV orders." },
    ],
  }),
  component: AccountPage,
});

function OrderCard({ order }: { order: Order }) {
  return (
    <article className="order-card">
      <div className="order-card-top">
        <div>
          <span className="eyebrow">ORDER {order.orderNumber}</span>
          <p>
            {new Date(order.createdAt).toLocaleDateString("en-IN", {
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </p>
        </div>
        <div>
          <span className={`status-pill ${order.status}`}>{order.status}</span>
          <strong>{money(order.total)}</strong>
        </div>
      </div>
      <div className="order-items">
        {order.items.map((i, n) => (
          <div key={`${i.productName}-${n}`}>
            <span>
              {i.productName} <small>× {i.quantity}</small>
            </span>
            <span>
              {i.color} / {i.size}
            </span>
          </div>
        ))}
      </div>
    </article>
  );
}

function AccountPage() {
  const { user, isPending } = useCurrentUserState();
  const orders = useQuery({
    queryKey: ["account-orders"],
    queryFn: () => listAccountOrders(),
    enabled: !!user,
  });

  if (isPending) {
    return (
      <Shell>
        <main className="account-page">
          <div className="state-message">Loading your account…</div>
        </main>
      </Shell>
    );
  }
  if (!user) return <Navigate to="/login" search={{ next: "/account" }} />;

  return (
    <Shell>
      <main className="account-page">
        <div className="page-title">
          <span className="eyebrow">YOUR UV ACCOUNT</span>
          <h1>Your orders.</h1>
          <p>A little history, all in one place.</p>
        </div>
        <div className="account-orders">
          <div className="account-bar">
            <span>Signed in as {user.primaryEmail || user.displayName}</span>
          </div>
          {orders.isLoading ? (
            <div className="state-message">Loading your orders…</div>
          ) : orders.isError ? (
            <Status error={orders.error} retry={() => orders.refetch()} />
          ) : orders.data?.length ? (
            orders.data.map((order) => <OrderCard key={order.id} order={order} />)
          ) : (
            <EmptyState
              title="No orders yet."
              copy="Your next favourite is waiting in the collection."
              action={
                <Link to="/shop" className="text-link">
                  Shop UV <ArrowRight size={15} />
                </Link>
              }
            />
          )}
        </div>
      </main>
    </Shell>
  );
}
