import { createFileRoute } from "@tanstack/react-router";
import { ContentPage, Shell } from "@/components/store/layout";

export const Route = createFileRoute("/terms")({
  head: () => ({
    meta: [
      { title: "Terms — UV" },
      { name: "description", content: "Terms of sale for the UV store." },
    ],
  }),
  component: TermsPage,
});

function TermsPage() {
  return (
    <Shell>
      <ContentPage eyebrow="THE FINE PRINT" title={<>Terms of <em>sale.</em></>}>
        <p>
          By placing an order you agree that UV will charge the server-calculated total through Razorpay, then fulfil
          the pieces listed on your confirmation. Prices are in Indian rupees. Stock is reserved for 30 minutes while
          payment completes.
        </p>
        <p>
          Title to goods passes on delivery. Nothing here limits rights you have under Indian consumer law. The store
          is operated for uvclo.com.
        </p>
      </ContentPage>
    </Shell>
  );
}
