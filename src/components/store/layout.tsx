import { useState, type ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { Instagram, Menu, Search, ShoppingBag } from "lucide-react";
import { SignedIn, SignedOut, UserButton } from "@/lib/auth/gates";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { cartCount, useCart } from "@/lib/store/cart";

export function Header() {
  const [menu, setMenu] = useState(false);
  const items = useCart((s) => s.items);
  const count = cartCount(items);
  const { isPending } = useCurrentUserState();

  return (
    <>
      <div className="announcement">
        Complimentary shipping on orders over ₹2,500 <span>—</span> Made for the long way around.
      </div>
      <header className="site-header">
        <button
          className="icon-button mobile-menu"
          aria-label={menu ? "Close menu" : "Open menu"}
          aria-expanded={menu}
          data-testid="button-open-menu"
          onClick={() => setMenu(!menu)}
        >
          <Menu size={19} />
        </button>

        <Link to="/" className="wordmark" data-testid="link-home" aria-label="UV home">
          <img src="/uv-logo.png" alt="UV" className="brand-logo" />
        </Link>

        <nav className={`main-nav ${menu ? "nav-open" : ""}`} aria-label="Main navigation">
          <Link
            to="/shop"
            search={{ category: undefined, q: undefined }}
            onClick={() => setMenu(false)}
          >
            Collections
          </Link>

        </nav>

        <div className="header-actions">
          <Link
            to="/shop"
            search={{ category: undefined, q: undefined }}
            className="header-search"
            aria-label="Search the collection"
          >
            <Search size={17} />
            <span>Search</span>
          </Link>

          {isPending ? (
            <span className="header-account" aria-hidden>
              Account
            </span>
          ) : (
            <>
              <SignedOut>
                <Link to="/account" className="header-account">
                  Account
                </Link>
              </SignedOut>

              <SignedIn>
                <span className="header-user">
                  <UserButton />
                </span>
              </SignedIn>
            </>
          )}

          <Link to="/cart" className="bag-link" data-testid="link-cart">
            <ShoppingBag size={18} strokeWidth={1.6} />
            <span>Bag ({count})</span>
          </Link>
        </div>
      </header>
    </>
  );
}

export function Footer() {
  return (
    <footer className="site-footer">
      <div className="footer-top">
        <div>
          <Link to="/" className="wordmark footer-mark" aria-label="UV home">
            <img src="/uv-logo.png" alt="UV" className="brand-logo" />
          </Link>
          <p>
            Considered clothing.
            <br />
            Made to be worn, often.
          </p>
        </div>

        <div className="footer-links">
          <div>
            <span>Explore</span>
            <Link
              to="/shop"
              search={{ category: undefined, q: undefined }}
            >
              Shop all
            </Link>
            <Link to="/about">About UV</Link>
            <Link to="/account">Your account</Link>
          </div>

          <div>
            <span>Need a hand?</span>
            <Link to="/contact">Contact</Link>
            <Link to="/shipping">Shipping</Link>
            <Link to="/returns">Returns</Link>
          </div>

          <div>
            <span>Information</span>
            <Link to="/privacy">Privacy</Link>
            <Link to="/terms">Terms</Link>
            <a className="instagram-link" href="https://instagram.com" target="_blank" rel="noreferrer">
              <Instagram size={15} /> Brand page
            </a>
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        <span>© UV {new Date().getFullYear()}</span>
        <span>Designed for everyday, not just every day.</span>
        <Link to="/admin">Store access</Link>
      </div>
    </footer>
  );
}

export function Shell({ children }: { children: ReactNode }) {
  return (
    <>
      <Header />
      {children}
      <Footer />
    </>
  );
}

export function ContentPage({
  eyebrow,
  title,
  children,
}: {
  eyebrow: string;
  title: ReactNode;
  children: ReactNode;
}) {
  return (
    <main className="prose-page">
      <div className="page-title left">
        <span className="eyebrow">{eyebrow}</span>
        <h1>{title}</h1>
      </div>
      {children}
    </main>
  );
}