import { useEffect, useState, type ChangeEvent, type FormEvent } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, ArrowRight, CircleAlert, LoaderCircle, LockKeyhole } from "lucide-react";
import { Shell } from "@/components/store/layout";
import { EmptyState, ProductImage } from "@/components/store/ui";
import { cartSubtotal, useCart } from "@/lib/store/cart";
import { createCheckoutOrder, verifyCheckoutPayment } from "@/lib/store/checkout";
import { CONFIRMATION_STORAGE_KEY } from "@/lib/store/constants";
import { money, shippingFor } from "@/lib/store/money";

export const Route = createFileRoute("/checkout")({
  head: () => ({
    meta: [
      { title: "Checkout — UV" },
      { name: "description", content: "Securely complete your UV order." },
    ],
  }),
  component: CheckoutPage,
});

type RazorpayCtor = new (options: Record<string, unknown>) => { open: () => void };

function CheckoutPage() {
  const items = useCart((s) => s.items);
  const clear = useCart((s) => s.clear);
  const total = cartSubtotal(items);
  const shipping = shippingFor(total);
  const [message, setMessage] = useState("");
  const [busyPayment, setBusyPayment] = useState(false);
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
  });

  useEffect(() => {
    if (document.querySelector("script[data-razorpay-sdk]")) return;
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.dataset.razorpaySdk = "true";
    document.head.appendChild(script);
  }, []);

  const update = (e: ChangeEvent<HTMLInputElement>) => setForm({ ...form, [e.target.name]: e.target.value });

  const pay = async (e: FormEvent) => {
    e.preventDefault();
    setMessage("");
    if (!items.length) {
      setMessage("Your bag is empty. Add a piece before checkout.");
      return;
    }
    setBusyPayment(true);
    try {
      const session = await createCheckoutOrder({
        data: {
          items: items.map((i) => ({
            productId: i.product.id,
            quantity: i.quantity,
            size: i.size,
            color: i.color,
          })),
          shippingAddress: form,
        },
      });
      const RazorpayConstructor = (window as Window & { Razorpay?: RazorpayCtor }).Razorpay;
      if (!session.keyId || !session.razorpayOrderId || !RazorpayConstructor) {
        setMessage(
          "Payments are not available yet. Razorpay checkout is not configured for this store. Your bag is unchanged; please try again later.",
        );
        setBusyPayment(false);
        return;
      }
      const checkout = new RazorpayConstructor({
        key: session.keyId,
        amount: session.amount,
        currency: session.currency,
        order_id: session.razorpayOrderId,
        name: "UV",
        description: `Order ${session.orderNumber}`,
        prefill: { name: form.fullName, email: form.email, contact: form.phone },
        theme: { color: "#302d29" },
        handler: async (response: {
          razorpay_order_id: string;
          razorpay_payment_id: string;
          razorpay_signature: string;
        }) => {
          try {
            const confirmation = await verifyCheckoutPayment({
              data: {
                orderId: session.orderId,
                razorpayOrderId: response.razorpay_order_id,
                razorpayPaymentId: response.razorpay_payment_id,
                razorpaySignature: response.razorpay_signature,
              },
            });
            if (confirmation.paymentStatus !== "paid") throw new Error("Payment could not be confirmed.");
            sessionStorage.setItem(CONFIRMATION_STORAGE_KEY, JSON.stringify(confirmation));
            clear();
            await queryClient.invalidateQueries({ queryKey: ["account-orders"] });
            await navigate({ to: "/orders/confirmed" });
          } catch (error) {
            setMessage(
              error instanceof Error
                ? error.message
                : "Payment verification failed. Contact support before trying again.",
            );
            setBusyPayment(false);
          }
        },
        modal: { ondismiss: () => setBusyPayment(false) },
      });
      checkout.open();
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "We could not start checkout. Please review your details and try again.",
      );
      setBusyPayment(false);
    }
  };

  return (
    <Shell>
      <main className="checkout-page">
        <div className="checkout-heading">
          <Link to="/cart" className="text-link">
            <ArrowLeft size={15} /> Return to bag
          </Link>
          <h1>
            Almost <em>yours.</em>
          </h1>
          <p>Guest checkout · No account needed</p>
        </div>
        {!items.length ? (
          <EmptyState
            title="Your bag is empty."
            copy="Add something considered to your bag to continue."
            action={
              <Link className="button button-dark" to="/shop">
                Shop the collection <ArrowRight size={16} />
              </Link>
            }
          />
        ) : (
          <div className="checkout-layout">
            <form className="checkout-form" onSubmit={pay}>
              <section>
                <span className="eyebrow">01 / CONTACT</span>
                <h2>Where can we reach you?</h2>
                <div className="form-grid">
                  <label className="field full-field">
                    Email address
                    <input required name="email" type="email" value={form.email} onChange={update} autoComplete="email" />
                  </label>
                  <label className="field full-field">
                    Full name
                    <input required name="fullName" value={form.fullName} onChange={update} autoComplete="name" />
                  </label>
                  <label className="field full-field">
                    Phone number
                    <input required name="phone" type="tel" value={form.phone} onChange={update} autoComplete="tel" />
                  </label>
                </div>
              </section>
              <section>
                <span className="eyebrow">02 / DELIVERY</span>
                <h2>Where should it go?</h2>
                <div className="form-grid">
                  <label className="field full-field">
                    Address
                    <input required name="address" value={form.address} onChange={update} autoComplete="street-address" />
                  </label>
                  <label className="field">
                    City
                    <input required name="city" value={form.city} onChange={update} autoComplete="address-level2" />
                  </label>
                  <label className="field">
                    State
                    <input required name="state" value={form.state} onChange={update} autoComplete="address-level1" />
                  </label>
                  <label className="field">
                    PIN code
                    <input required name="pincode" value={form.pincode} onChange={update} autoComplete="postal-code" />
                  </label>
                </div>
              </section>
              {message && (
                <div className="inline-error" role="alert">
                  <CircleAlert size={17} />
                  {message}
                </div>
              )}
              <button className="button button-dark full pay-button" disabled={busyPayment}>
                {busyPayment ? (
                  <>
                    <LoaderCircle className="spin" size={16} /> Preparing secure checkout
                  </>
                ) : (
                  <>
                    Continue to secure payment <ArrowRight size={16} />
                  </>
                )}
              </button>
              <p className="secure-note">
                <LockKeyhole size={14} /> Your details are encrypted and secure. The amount is calculated on the server.
              </p>
            </form>
            <aside className="checkout-summary">
              <span className="eyebrow">IN YOUR BAG</span>
              {items.map((line) => (
                <div className="checkout-item" key={`${line.product.id}${line.size}${line.color}`}>
                  <div className="checkout-thumb">
                    <ProductImage product={line.product} />
                    <span>{line.quantity}</span>
                  </div>
                  <div>
                    <strong>{line.product.name}</strong>
                    <p>
                      {line.color} / {line.size}
                    </p>
                  </div>
                  <b>{money(line.product.price * line.quantity)}</b>
                </div>
              ))}
              <div>
                <span>Subtotal</span>
                <strong>{money(total)}</strong>
              </div>
              <div>
                <span>Shipping</span>
                <span>{shipping === 0 ? "Complimentary" : money(shipping)}</span>
              </div>
              <div className="summary-total">
                <span>Total</span>
                <strong>{money(total + shipping)}</strong>
              </div>
              <p>Payment is completed securely via Razorpay. We never store card details.</p>
            </aside>
          </div>
        )}
      </main>
    </Shell>
  );
}
