import type { ReactNode } from "react";
import { CircleAlert } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { money } from "@/lib/store/money";
import type { Product } from "@/lib/store/types";

export function imageSrc(url?: string | null) {
  if (!url) return undefined;
  if (/^(https?:|data:|\/)/i.test(url)) return url;
  return `/${url.replace(/^\//, "")}`;
}

const CATALOGUE_HERO_OVERRIDES: Record<string, string> = {
  "prd-sikku-godzilla-kolam": "/products/sikku-01/godzilla-05.jpg",
};

export function ProductImage({
  product,
  className = "",
  src,
  alt,
}: {
  product?: Product;
  className?: string;
  src?: string | null;
  alt?: string;
}) {
  const resolved = imageSrc(src ?? product?.images?.[0]?.url);
  const label = alt || product?.images?.[0]?.alt || product?.name || "UV menswear";
  return resolved ? (
    <img className={className} src={resolved} alt={label} loading="lazy" />
  ) : (
    <div className={`image-placeholder ${className}`} aria-label="Product image not yet available">
      <span>UV</span>
    </div>
  );
}

export function Status({ error, retry }: { error: unknown; retry?: () => void }) {
  return (
    <div className="state-message">
      <CircleAlert size={22} />
      <h2>We couldn't load this just now.</h2>
      <p>{error instanceof Error ? error.message : "Please try again in a moment."}</p>
      {retry && (
        <button className="button button-dark" onClick={retry}>
          Try again
        </button>
      )}
    </div>
  );
}

export function LoadingGrid() {
  return (
    <div className="product-grid">
      {[0, 1, 2, 3].map((i) => (
        <div className="skeleton-card" key={i}>
          <div className="skeleton-image" />
          <div className="skeleton-line" />
          <div className="skeleton-line short" />
        </div>
      ))}
    </div>
  );
}

export function EmptyState({
  title,
  copy,
  action,
}: {
  title: string;
  copy: string;
  action?: ReactNode;
}) {
  return (
    <div className="empty-state">
      <div className="empty-mark">UV</div>
      <h2>{title}</h2>
      <p>{copy}</p>
      {action}
    </div>
  );
}

export function ProductCard({ product }: { product: Product }) {
  return (
    <Link
      to="/products/$slug"
      params={{ slug: product.slug }}
      className="product-card"
      data-testid={`card-product-${product.id}`}
    >
      <div className="product-photo">
        <ProductImage product={product} src={CATALOGUE_HERO_OVERRIDES[product.id]} className="product-image" />
        {(product.newArrival || product.featured) && (
          <span className="product-flag">{product.newArrival ? "NEW ARRIVAL" : "UV SELECT"}</span>
        )}
        <span className="quick-view">
          View piece <span aria-hidden>→</span>
        </span>
      </div>
      <div className="product-meta">
        <div>
          <h3>{product.name}</h3>
          <p>{product.category}</p>
        </div>
        <strong className={product.compareAtPrice && product.compareAtPrice > product.price ? "product-sale-price" : undefined}>
          {product.compareAtPrice && product.compareAtPrice > product.price && (
            <del>{money(product.compareAtPrice)}</del>
          )}
          {money(product.price)}
        </strong>
      </div>
    </Link>
  );
}

export function PageIntro({
  eyebrow,
  title,
  copy,
  left,
}: {
  eyebrow: string;
  title: ReactNode;
  copy: string;
  left?: boolean;
}) {
  return (
    <div className={`page-title ${left ? "left" : ""}`}>
      <span className="eyebrow">{eyebrow}</span>
      <h1>{title}</h1>
      <p>{copy}</p>
    </div>
  );
}
