import { useEffect, useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Check, LockKeyhole, Minus, Plus, ShieldCheck, Truck, X } from "lucide-react";
import { Shell } from "@/components/store/layout";
import { LoadingGrid, ProductImage, Status, imageSrc } from "@/components/store/ui";
import { useCart } from "@/lib/store/cart";
import { getProduct } from "@/lib/store/catalog";
import { money } from "@/lib/store/money";

export const Route = createFileRoute("/products/$slug")({
  head: ({ params }) => ({
    meta: [
      { title: `${params.slug.replace(/-/g, " ")} — UV` },
      { name: "description", content: `Shop ${params.slug.replace(/-/g, " ")} from UV's considered menswear collection.` },
    ],
  }),
  component: ProductPage,
});

function colorSwatch(color: string) {
  const c = color.toLowerCase();
  if (c.includes("black") || c.includes("ink") || c.includes("charcoal")) return "#272522";
  if (c.includes("navy")) return "#303c44";
  if (c.includes("olive")) return "#727467";
  if (c.includes("white") || c.includes("bone")) return "#f0eee8";
  if (c.includes("stone")) return "#b7a998";
  return "#b7a998";
}

function ProductPage() {
  const { slug } = Route.useParams();
  const navigate = useNavigate();
  const add = useCart((s) => s.add);
  const product = useQuery({
    queryKey: ["product", slug],
    queryFn: () => getProduct({ data: { slug } }),
  });
  const [size, setSize] = useState("");
  const [color, setColor] = useState("");
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);
  const [lightbox, setLightbox] = useState<string | null>(null);

  useEffect(() => {
    if (product.data) {
      setSize(product.data.sizes[0] || "");
      setColor(product.data.colors[0] || "");
      setQty(1);
    }
  }, [product.data]);

  if (product.isLoading) {
    return (
      <Shell>
        <main className="product-detail">
          <LoadingGrid />
        </main>
      </Shell>
    );
  }
  if (product.isError || !product.data) {
    return (
      <Shell>
        <main className="product-detail">
          <Status error={product.error} retry={() => product.refetch()} />
        </main>
      </Shell>
    );
  }
  const p = product.data;
  const canBuy = p.stock > 0 && !!size && !!color;

  return (
    <Shell>
      <main className="product-detail">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Product",
              name: p.name,
              description: p.description,
              sku: p.sku,
              image: p.images.map((im) => im.url),
              brand: { "@type": "Brand", name: "UV" },
              offers: {
                "@type": "Offer",
                priceCurrency: "INR",
                price: p.price,
                availability: p.stock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
              },
            }),
          }}
        />
        <div className="breadcrumbs">
          <Link to="/shop" search={{ category: undefined, q: undefined }}>Shop</Link>
          <span>/</span>
          <span>{p.category}</span>
          <span>/</span>
          <span>{p.name}</span>
        </div>
        <div className="detail-grid">
          <div className="detail-gallery">
            {p.images.length ? (
              p.images.map((im, i) => (
                <img
                  key={`${im.url}-${i}`}
                  src={imageSrc(im.url)}
                  alt={im.alt || p.name}
                  className="detail-image"
                  loading={i === 0 ? "eager" : "lazy"}
                  onClick={() => setLightbox(im.url)}
                />
              ))
            ) : (
              <ProductImage product={p} className="detail-image" />
            )}
          </div>
          <aside className="detail-info">
            <span className="eyebrow">
              {p.category} / UV STUDIO
            </span>
            <h1>{p.name}</h1>
            <div className="detail-price">
              {money(p.price)}
              {p.compareAtPrice && p.compareAtPrice > p.price && <del>{money(p.compareAtPrice)}</del>}
            </div>
            <p className="detail-description">{p.description}</p>
            <div className="choice-group">
              <div className="choice-label">
                Colour <span>{color}</span>
              </div>
              <div className="color-options">
                {p.colors.map((c) => (
                  <button
                    className={`color-chip ${color === c ? "chosen" : ""}`}
                    key={c}
                    onClick={() => setColor(c)}
                    aria-label={`Choose ${c}`}
                    title={c}
                  >
                    <span style={{ background: colorSwatch(c) }} />
                  </button>
                ))}
              </div>
            </div>
            <div className="choice-group">
              <div className="choice-label">
                Size{" "}
                <span>
                  <button
                    className="text-link tiny"
                    onClick={() =>
                      window.alert("For the best fit, choose your usual size. For a relaxed fit, size up.")
                    }
                  >
                    Size guide
                  </button>
                </span>
              </div>
              <div className="size-options">
                {p.sizes.map((s) => (
                  <button key={s} onClick={() => setSize(s)} className={size === s ? "size-chip chosen" : "size-chip"}>
                    {s}
                  </button>
                ))}
              </div>
            </div>
            {p.stock > 0 && (
              <div className="quantity-control quantity-pdp">
                <button onClick={() => setQty(Math.max(1, qty - 1))} aria-label="Decrease quantity">
                  <Minus size={13} />
                </button>
                <span>{qty}</span>
                <button onClick={() => setQty(Math.min(10, Math.min(p.stock, qty + 1)))} aria-label="Increase quantity">
                  <Plus size={13} />
                </button>
              </div>
            )}
            <div className="product-actions">
              <button
                className="button button-dark add-button"
                disabled={!canBuy}
                onClick={() => {
                  add(p, size, color, qty);
                  setAdded(true);
                  setTimeout(() => setAdded(false), 2200);
                }}
                data-testid="button-add-to-bag"
              >
                {added ? (
                  <>
                    <Check size={16} /> Added to bag
                  </>
                ) : (
                  <>
                    <span>Add to bag</span>
                    <span>{money(p.price * qty)}</span>
                  </>
                )}
              </button>
              <button
                className="button button-outline"
                disabled={!canBuy}
                onClick={() => {
                  add(p, size, color, qty);
                  void navigate({ to: "/checkout" });
                }}
              >
                Buy now
              </button>
            </div>
            {!p.stock && <p className="out-of-stock">OUT OF STOCK</p>}
            {p.stock > 0 && p.stock <= 5 && <p className="stock-message">Only {p.stock} left in this colour</p>}
            <div className="product-perks">
              <p>
                <Truck size={17} /> Complimentary shipping over ₹2,500
              </p>
              <p>
                <ShieldCheck size={17} /> Easy 7-day returns
              </p>
              <p>
                <LockKeyhole size={17} /> Secure, encrypted checkout
              </p>
            </div>
            <details className="detail-disclosure">
              <summary>
                Details & care <Plus size={15} />
              </summary>
              <p>
                Designed with a focus on fabric, fit and the details that make a piece feel considered. Follow the care
                label to keep yours in rotation.
              </p>
            </details>
          </aside>
        </div>
        {lightbox && (
          <div className="lightbox" onClick={() => setLightbox(null)} role="dialog" aria-label="Product image">
            <button className="icon-button" aria-label="Close" style={{ position: "absolute", top: 16, right: 16, color: "#f4f1eb" }}>
              <X size={22} />
            </button>
            <img src={imageSrc(lightbox)} alt={p.name} />
          </div>
        )}
      </main>
    </Shell>
  );
}
