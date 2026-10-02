import { createFileRoute } from "@tanstack/react-router";
import { ContentPage, Shell } from "@/components/store/layout";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact — UV" },
      { name: "description", content: "Get in touch with UV." },
    ],
  }),
  component: ContactPage,
});

function ContactPage() {
  return (
    <Shell>
      <ContentPage eyebrow="A QUIET LINE" title={<>We're <em>listening.</em></>}>
        <p>
          For orders, fits, or something that didn't arrive quite right: write to{" "}
          <a href="mailto:hello@uvclo.com">hello@uvclo.com</a>. We read every note.
        </p>
        <p>
          Studio hours are Monday to Friday, 10:00–18:00 IST. If you've already placed an order, include your order
          number and we'll pick it up from there.
        </p>
      </ContentPage>
    </Shell>
  );
}
