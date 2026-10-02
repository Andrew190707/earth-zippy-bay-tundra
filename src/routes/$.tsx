import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { Shell } from "@/components/store/layout";

export const Route = createFileRoute("/$")({
  component: NotFoundPage,
});

function NotFoundPage() {
  return (
    <Shell>
      <main className="not-found">
        <span className="eyebrow">404 / NOT FOUND</span>
        <h1>
          That piece
          <br />
          <em>isn't here.</em>
        </h1>
        <p>It may have moved on. Let's find you something else.</p>
        <Link to="/shop" search={{ category: undefined, q: undefined }} className="button button-dark">
          Shop the collection <ArrowRight size={16} />
        </Link>
      </main>
    </Shell>
  );
}
