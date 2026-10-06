import { useEffect, useState, type ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { Instagram, Menu, Moon, Search, ShoppingBag, Sun } from "lucide-react";
import { SignedIn, SignedOut, UserButton } from "@/lib/auth/gates";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { cartCount, useCart } from "@/lib/store/cart";
import "@/styles/theme-toggle.css";

function Header() {
  const [menu, setMenu] = useState(false);
  const [dark, setDark] = useState(false);
  const items = useCart((s) => s.items);
  const count = cartCount(items);
  const { isPending } = useCurrentUserState();

  useEffect(() => {
    const saved = window.localStorage.getItem("uv-theme");
    const shouldUseDark = saved === "dark";
    setDark(shouldUseDark);
    document.documentElement.classList.toggle("dark", shouldUseDark);
  }, []);

  const toggleTheme = () => {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle("dark", next);
    window.localStorage.setItem("uv-theme", next ? "dark" : "light");
  };

  return (
    <>
      <div className="announcement">
        Complimentary shipping on orders over ₹2,500 <span>•</span> Made for the long way around.
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

          <button
            type="button"
            className="theme-toggle"
            onClick={toggleTheme}
            aria-label={dark ? "Switch to light theme" : "Switch to dark theme"}
            aria-pressed={dark}
            title={dark ? "Light theme" : "Dark theme"}
            data-testid="button-theme-toggle"
          >
            {dark ? <Sun size={16} strokeWidth={1.7} /> : <Moon size={16} strokeWidth={1.7} />}
            <span>{dark ? "Light" : "Dark"}</span>
          </button>

          {isPending ? (
            <span className="header-account" aria-hidden="true">
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
            <a
              className="instagram-link"
              href="https://instagram.com"
              target="_blank"
              rel="noreferrer"
            >
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
