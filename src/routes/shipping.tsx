import { createFileRoute } from "@tanstack/react-router";
import { ContentPage, Shell } from "@/components/store/layout";

export const Route = createFileRoute("/shipping")({
  head: () => ({
    meta: [
      { title: "Shipping — UV" },
      { name: "description", content: "UV shipping across India. Complimentary over ₹2,500." },
    ],
  }),
  component: ShippingPage,
});

function ShippingPage() {
  return (
    <Shell>
      <ContentPage eyebrow="GETTING IT TO YOU" title={<>Considered <em>delivery.</em></>}>
        <p>We ship across India. Orders over ₹2,500 travel complimentary. Under that, a flat ₹99.</p>
        <ul>
          <li>Most metros: 3–5 working days.</li>
          <li>The rest of the country: 5–8 working days.</li>
          <li>You'll receive tracking as soon as the parcel leaves us.</li>
        </ul>
        <p>We don't currently ship internationally. If that changes, you'll hear it here first.</p>
      </ContentPage>
    </Shell>
  );
}
