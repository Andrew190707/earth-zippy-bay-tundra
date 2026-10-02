import { useEffect, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Check } from "lucide-react";
import { Shell } from "@/components/store/layout";
import { EmptyState } from "@/components/store/ui";
import { CONFIRMATION_STORAGE_KEY } from "@/lib/store/constants";
import { money } from "@/lib/store/money";
import type { Order } from "@/lib/store/types";

export const Route = createFileRoute("/orders/confirmed")({
  head: () => ({
    meta: [
      { title: "Order confirmed — UV" },
      { name: "description", content: "Your UV order is confirmed." },
    ],
  }),
  component: ConfirmationPage,
});

function ConfirmationPage() {
  const [order, setOrder] = useState<Order | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const confirmation = JSON.parse(sessionStorage.getItem(CONFIRMATION_STORAGE_KEY) || "null") as {
        order?: Order;
        paymentStatus?: string;
      } | null;
      setOrder(confirmation?.paymentStatus === "paid" ? confirmation.order ?? null : null);
    } catch {
      setOrder(null);
    }
    setReady(true);
  }, []);

  return (
    <Shell>
      <main className="confirmation-page">
        {!ready ? (
          <div className="state-message">Confirming your order…</div>
        ) : order ? (
          <div className="confirmation-card reveal">
            <div className="confirmation-seal">
              <Check size={27} />
            </div>
            <span className="eyebrow">IT'S OFFICIAL</span>
            <h1>
              Good things
              <br />
              <em>are coming.</em>
            </h1>
            <p>
              Thank you, {order.customerName}. Your order is confirmed and on its way to becoming a favourite.
            </p>
            <div className="confirmation-order">
              <span>ORDER NUMBER</span>
              <strong>{order.orderNumber}</strong>
              <span>
                {order.items.length} pieces · {money(order.total)} · {order.paymentStatus}
              </span>
            </div>
            <div className="confirm-items">
              {order.items.map((item, i) => (
                <div key={`${item.productName}-${i}`}>
                  <span>
                    {item.productName} × {item.quantity}
                    <br />
                    <small>
                      {item.color} / {item.size}
                    </small>
                  </span>
                  <span>{money(item.unitPrice * item.quantity)}</span>
                </div>
              ))}
            </div>
            <p className="confirm-address">
              Delivering to {order.shippingAddress.fullName}, {order.shippingAddress.address},{" "}
              {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.pincode}.
            </p>
            <Link to="/shop" className="button button-dark">
              Continue shopping <ArrowRight size={16} />
            </Link>
          </div>
        ) : (
          <EmptyState
            title="No confirmed order found."
            copy="We only show this page after a successful payment confirmation."
            action={
              <Link to="/shop" className="button button-dark">
                Return to UV <ArrowRight size={16} />
              </Link>
            }
          />
        )}
      </main>
    </Shell>
  );
}
