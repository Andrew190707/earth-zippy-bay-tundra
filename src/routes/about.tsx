import { createFileRoute } from "@tanstack/react-router";
import { ContentPage, Shell } from "@/components/store/layout";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About — UV" },
      { name: "description", content: "UV is a men's clothing brand for the long way around." },
    ],
  }),
  component: AboutPage,
});

function AboutPage() {
  return (
    <Shell>
      <ContentPage eyebrow="THE STUDIO" title={<>Clothes with <em>room.</em></>}>
        <p>
          UV began as a way to dress without performing. Pieces that hold their shape through the day, then soften into
          something that feels like yours. We make menswear for the hours that matter, and all the ones in between.
        </p>
        <h2>A quieter uniform</h2>
        <p>
          The collection is small on purpose. Shirts, knits, trousers — cut with restraint, in fabrics that last. No
          seasonal noise. No logo for the sake of a logo. Just considered clothing, made to be worn often.
        </p>
        <p>
          We used to live on Shopify. This store is ours now: lighter, faster, and built so the wardrobe can grow without
          a monthly tax on taste.
        </p>
      </ContentPage>
    </Shell>
  );
}
