import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ArrowDownRight, ArrowRight, CreditCard, ShieldCheck, Truck } from "lucide-react";
import { Shell } from "@/components/store/layout";
import { EmptyState, LoadingGrid, ProductCard, Status } from "@/components/store/ui";
import { listCollections, listProducts } from "@/lib/store/catalog";
import type { Collection } from "@/lib/store/types";

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

function HomePage() {
  const products = useQuery({
    queryKey: ["products", { page: 1, pageSize: 4, sort: "featured" }],
    queryFn: () => listProducts({ data: { page: 1, pageSize: 4, sort: "featured" } }),
  });
  const collections = useQuery({
    queryKey: ["collections"],
    queryFn: () => listCollections(),
  });

  return (
    <Shell>
      <main>
        <section className="hero">
          <img
            className="hero-image"
            src="/products/sikku-02/spidey-ver2-01.jpg"
            alt="UV Spidey Kolam Tee Ver 2 from Sikku Drop 02"
          />
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
          <div className="hero-index">
            <span>01 / 02</span>
            <span>SIKKU / SPIDEY VER 2</span>
          </div>
        </section>
        <section className="editorial-intro section-wrap">
          <span className="eyebrow">A BETTER KIND OF BASIC</span>
          <p>
            Less, but with <span>more to say.</span>
          </p>
          <div className="intro-foot">
            <span>
              Designed in restraint.
              <br />
              Made for the real world.
            </span>
            <Link to="/shop" search={{ category: undefined, q: undefined }} className="text-link">
              Discover UV <ArrowDownRight size={15} />
            </Link>
          </div>
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
          {collections.isLoading ? (
            <div className="collection-loading">Finding your way around…</div>
          ) : collections.isError ? (
            <Status error={collections.error} retry={() => collections.refetch()} />
          ) : (
            <div className="collection-row">
              {(collections.data ?? []).slice(0, 3).map((c: Collection, i: number) => (
                <Link
                  className={`collection-tile tone-${i}`}
                  key={c.slug}
                  to="/shop"
                  search={{ category: c.slug, q: undefined }}
                >
                  <div className="collection-art">{c.image ? <img src={c.image} alt={c.name} /> : <span>0{i + 1}</span>}</div>
                  <div>
                    <h3>{c.name}</h3>
                    <span>
                      {c.productCount} pieces <ArrowRight size={14} />
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>
        <section className="section-wrap new-arrivals">
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
              {products.data.items.map((p) => (
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
