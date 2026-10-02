import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Minus, Plus, Trash2 } from "lucide-react";
import { Shell } from "@/components/store/layout";
import { EmptyState, ProductImage } from "@/components/store/ui";
import { cartCount, cartSubtotal, useCart } from "@/lib/store/cart";
import { money, shippingFor } from "@/lib/store/money";

export const Route = createFileRoute("/cart")({
  head: () => ({
    meta: [
      { title: "Your bag — UV" },
      { name: "description", content: "Review your UV pieces before checkout." },
    ],
  }),
  component: CartPage,
});

function CartPage() {
  const items = useCart((s) => s.items);
  const setQuantity = useCart((s) => s.setQuantity);
  const remove = useCart((s) => s.remove);
  const changeVariant = useCart((s) => s.changeVariant);
  const total = cartSubtotal(items);
  const count = cartCount(items);
  const shipping = shippingFor(total);

  return (
    <Shell>
      <main className="cart-page">
        <div className="page-title left">
          <span className="eyebrow">YOUR SELECTION</span>
          <h1>
            Your <em>bag.</em>
          </h1>
          <p>
            {count} {count === 1 ? "piece" : "pieces"} reserved for you.
          </p>
        </div>
        {!items.length ? (
          <EmptyState
            title="A little room for something good."
            copy="Your bag is waiting for the right piece."
            action={
              <Link to="/shop" search={{ category: undefined, q: undefined }} className="button button-dark">
                Explore the collection <ArrowRight size={16} />
              </Link>
            }
          />
        ) : (
          <div className="cart-layout">
            <div className="cart-lines">
              {items.map((line) => (
                <article className="cart-line" key={`${line.product.id}-${line.size}-${line.color}`}>
                  <Link to="/products/$slug" params={{ slug: line.product.slug }} className="cart-thumb">
                    <ProductImage product={line.product} />
                  </Link>
                  <div className="cart-line-info">
                    <Link to="/products/$slug" params={{ slug: line.product.slug }}>
                      <h2>{line.product.name}</h2>
                    </Link>
                    <div className="cart-variants">
                      <label>
                        Colour
                        <select
                          className="cart-variant"
                          value={line.color}
                          onChange={(e) =>
                            changeVariant(line.product.id, line.size, line.color, line.size, e.target.value)
                          }
                        >
                          {line.product.colors.map((value) => (
                            <option key={value}>{value}</option>
                          ))}
                        </select>
                      </label>
                      <label>
                        Size
                        <select
                          className="cart-variant"
                          value={line.size}
                          onChange={(e) =>
                            changeVariant(line.product.id, line.size, line.color, e.target.value, line.color)
                          }
                        >
                          {line.product.sizes.map((value) => (
                            <option key={value}>{value}</option>
                          ))}
                        </select>
                      </label>
                    </div>
                    <div className="quantity-control">
                      <button
                        onClick={() => setQuantity(line.product.id, line.size, line.color, line.quantity - 1)}
                        aria-label="Decrease quantity"
                      >
                        <Minus size={13} />
                      </button>
                      <span>{line.quantity}</span>
                      <button
                        onClick={() => setQuantity(line.product.id, line.size, line.color, line.quantity + 1)}
                        aria-label="Increase quantity"
                      >
                        <Plus size={13} />
                      </button>
                    </div>
                  </div>
                  <strong>{money(line.product.price * line.quantity)}</strong>
                  <button
                    className="remove-button"
                    aria-label="Remove item"
                    onClick={() => remove(line.product.id, line.size, line.color)}
                  >
                    <Trash2 size={16} />
                  </button>
                </article>
              ))}
            </div>
            <aside className="summary-card">
              <span className="eyebrow">ORDER SUMMARY</span>
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
              <p>Taxes included where applicable. Final total is calculated on the server at checkout.</p>
              <Link to="/checkout" className="button button-dark full">
                Continue to checkout <ArrowRight size={16} />
              </Link>
              <Link to="/shop" search={{ category: undefined, q: undefined }} className="text-link continue-shopping">
                Continue shopping
              </Link>
            </aside>
          </div>
        )}
      </main>
    </Shell>
  );
}
