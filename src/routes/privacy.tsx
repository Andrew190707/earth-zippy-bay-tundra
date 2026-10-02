import { createFileRoute } from "@tanstack/react-router";
import { ContentPage, Shell } from "@/components/store/layout";

export const Route = createFileRoute("/privacy")({
  head: () => ({
    meta: [
      { title: "Privacy — UV" },
      { name: "description", content: "How UV handles your information." },
    ],
  }),
  component: PrivacyPage,
});

function PrivacyPage() {
  return (
    <Shell>
      <ContentPage eyebrow="YOUR DETAILS" title={<>Held with <em>care.</em></>}>
        <p>
          We collect only what we need to fulfil an order: name, email, phone, and delivery address. Payment is handled
          by Razorpay. We never store card numbers.
        </p>
        <p>
          If you create an account, we keep your order history so you can find it later. You can ask us to delete your
          account by writing to hello@uvclo.com.
        </p>
        <p>We do not sell your information. We do not run a noisy marketing stack.</p>
      </ContentPage>
    </Shell>
  );
}
