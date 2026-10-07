import { useEffect, useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ArrowDownRight, ArrowRight, CreditCard, ShieldCheck, Truck } from "lucide-react";
import { Shell } from "@/components/store/layout";
import { EmptyState, LoadingGrid, ProductCard, ProductImage, Status } from "@/components/store/ui";
import { listProducts } from "@/lib/store/catalog";
import { SIKKU_DROPS } from "@/lib/store/sikku";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "UV — Considered menswear" },
      {
        name: "description",
        content: "A modern uniform for wherever the day takes you. Explore considered menswear by UV.",
      },
    ],
  }),
  component: HomePage,
});

function BestSellerHero({ products }: { products: Array<Parameters<typeof ProductCard>[0]["product"]> }) {
  const slides = useMemo(() => products.filter((product) => product.images?.length).slice(0, 5), [products]);
  const [active, setActive] = useState(0);

  useEffect(() => {
    if (slides.length < 2) return;
    const timer = window.setInterval(() => setActive((current) => (current + 1) % slides.length), 5000);
    return () => window.clearInterval(timer);
  }, [slides.length]);

  const product = slides[active];

  return (
    <section className="hero best-seller-hero">
      {product ? (
        <ProductImage
          product={product}
          className="hero-image"
          alt={`${product.name} from UV`}
        />
      ) : (
        <img
          className="hero-image"
          src="/products/sikku-02/spidey-ver2-01.jpg"
          alt="UV Spidey Kolam Tee Ver 2 from Sikku Drop 02"
        />
      )}
      <div className="hero-shade" />
      <div className="hero-copy">
        <span className="eyebrow light">THE EVERYDAY, RECONSIDERED — VOL. 01</span>
        <h1>
          Quietly
          <br />
          <em>distinct.</em>
        </h1>
        <p>Modern menswear for the hours that matter, and all the ones in between.</p>
        <Link to="/shop" search={{ category: undefined, q: undefined }} className="button button-light">
          Explore the collection <ArrowRight size={16} />
        </Link>
      </div>
      <div className="hero-carousel">
        <div className="hero-index">
          <span>{slides.length ? `${String(active + 1).padStart(2, "0")} / ${String(slides.length).padStart(2, "0")}` : "01 / 01"}</span>
          <span>{product?.name ?? "SIKKU / SPIDEY VER 2"}</span>
        </div>
        {slides.length > 1 && (
          <div className="hero-dots" aria-label="Best sellers">
            {slides.map((slide, index) => (
              <button
                key={slide.id}
                className={index === active ? "active" : ""}
                onClick={() => setActive(index)}
                aria-label={`Show ${slide.name}`}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

function HomePage() {
  const products = useQuery({
    queryKey: ["products", { page: 1, pageSize: 8, sort: "featured" }],
    queryFn: () => listProducts({ data: { page: 1, pageSize: 8, sort: "featured" } }),
  });

  return (
    <Shell>
      <main>
        <BestSellerHero products={products.data?.items ?? []} />
        <section className="section-wrap new-arrivals home-best-sellers">
          <div className="section-heading">
            <div>
              <span className="eyebrow">FIRST LOOK</span>
              <h2>
                In good <em>company.</em>
              </h2>
            </div>
            <Link to="/shop" search={{ category: undefined, q: undefined }} className="text-link">
              View the collection <ArrowRight size={15} />
            </Link>
          </div>
          {products.isLoading ? (
            <LoadingGrid />
          ) : products.isError ? (
            <Status error={products.error} retry={() => products.refetch()} />
          ) : products.data?.items.length ? (
            <div className="product-grid">
              {products.data.items.slice(0, 4).map((p) => (
                <ProductCard product={p} key={p.id} />
              ))}
            </div>
          ) : (
            <EmptyState
              title="The next collection is on its way."
              copy="There's nothing on the rail just yet. Check back soon."
              action={
                <Link to="/shop" search={{ category: undefined, q: undefined }} className="text-link">
                  Browse the shop <ArrowRight size={15} />
                </Link>
              }
            />
          )}
        </section>
        <section className="section-wrap collection-band">
          <div className="section-heading">
            <div>
              <span className="eyebrow">THE UV WARDROBE</span>
              <h2>
                Find your <em>form.</em>
              </h2>
            </div>
            <Link to="/shop" search={{ category: undefined, q: undefined }} className="text-link">
              Shop all pieces <ArrowRight size={15} />
            </Link>
          </div>
          <div className="collection-row">
            {SIKKU_DROPS.map((drop, i) => (
              <Link
                className={`collection-tile tone-${i}`}
                key={drop.slug}
                to="/shop"
                search={{ category: drop.slug, q: undefined }}
              >
                <div className="collection-art">
                  {drop.image ? <img src={drop.image} alt={`${drop.name} featured tee`} /> : <span>0{i + 1}</span>}
                </div>
                <div>
                  <h3>{drop.name}</h3>
                  <span>
                    {drop.productCount} pieces <ArrowRight size={14} />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </section>
        <section className="editorial-intro fabric-specs section-wrap">
          <span className="eyebrow">LESS, BUT WITH MORE TO SAY</span>
          <p className="fabric-catchphrase">
            Less, but with <span>more to say.</span>
          </p>
          <span className="eyebrow">THE UV STANDARD</span>
          <h2>240 GSM IMPORTED FRENCH TERRY COTTON</h2>
          <p className="fabric-lead">
            Built for weight, structure, and everyday comfort.
          </p>

          <div className="fabric-grid">
            <div className="fabric-column">
              <span className="fabric-label">FABRIC &amp; CONSTRUCTION</span>
              <ul>
                <li><strong>Fabric:</strong> 240 GSM French Terry Cotton</li>
                <li><strong>Fabric Origin:</strong> Imported — sourced from Taiwan, China &amp; USA</li>
                <li><strong>Fit:</strong> Premium Oversized Fit</li>
                <li><strong>Print:</strong> High-quality DTF (Direct-to-Film) print</li>
                <li><strong>Print Durability:</strong> Up to 100 washes guaranteed when care instructions are followed</li>
                <li><strong>Feel:</strong> Soft, structured, breathable, and heavyweight</li>
                <li><strong>Construction:</strong> Made for long-lasting shape and everyday wear</li>
              </ul>
            </div>

            <div className="fabric-column">
              <span className="fabric-label">PRINT GUARANTEE</span>
              <p>
                Our DTF prints are designed to withstand up to 100 washes without significant
                cracking, peeling, or loss of print quality, provided the recommended care
                instructions are followed.
              </p>


            </div>
          </div>
        </section>
        <section className="manifesto">
          <span className="eyebrow light">A NOTE ON CLOTHES</span>
          <h2>
            Wear it in.
            <br />
            <em>Wear it out.</em>
          </h2>
          <p>Pieces with room to become yours. No noise, no occasion required.</p>
          <Link to="/shop" search={{ category: undefined, q: undefined }} className="button button-light">
            Meet the collection <ArrowRight size={16} />
          </Link>
        </section>
        <section className="service-strip">
          <div>
            <Truck size={19} />
            <span>
              <strong>Considered delivery</strong>Free shipping over ₹2,500
            </span>
          </div>
          <div>
            <ShieldCheck size={19} />
            <span>
              <strong>Made to last</strong>Quality, in every detail
            </span>
          </div>
          <div>
            <CreditCard size={19} />
            <span>
              <strong>Secure checkout</strong>Protected at every step
            </span>
          </div>
        </section>
      </main>
    </Shell>
  );
}
