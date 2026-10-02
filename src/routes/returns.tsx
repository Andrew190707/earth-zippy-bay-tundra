import { createFileRoute } from "@tanstack/react-router";
import { ContentPage, Shell } from "@/components/store/layout";

export const Route = createFileRoute("/returns")({
  head: () => ({
    meta: [
      { title: "Returns — UV" },
      { name: "description", content: "Easy 7-day returns on unused UV pieces." },
    ],
  }),
  component: ReturnsPage,
});

function ReturnsPage() {
  return (
    <Shell>
      <ContentPage eyebrow="IF IT ISN'T RIGHT" title={<>Seven quiet <em>days.</em></>}>
        <p>
          Unworn pieces, with tags still on, can come back within 7 days of delivery. Write to{" "}
          <a href="mailto:hello@uvclo.com">hello@uvclo.com</a> with your order number and we'll send a return label.
        </p>
        <p>Sale items and pieces showing wear cannot be returned. Refunds are issued to the original payment method.</p>
      </ContentPage>
    </Shell>
  );
}
