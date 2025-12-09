import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Talk n Tales - PACE ON",
  description:
    "Event networking untuk Gen Z Founder dan decision maker. Limited seats — save yours now.",

  alternates: {
    canonical: "https://paceon.id/Talk-n-Tales",
  },

  openGraph: {
    title: "Talk n Tales - PACE ON",
    description: "Event networking untuk Gen Z Founder dan decision maker.",
    url: "https://paceon.id/Talk-n-Tales",
    siteName: "PACE ON",
    images: [
      {
        url: "https://paceon.id/images/product-logo.png",
        width: 1200,
        height: 630,
        alt: "Talk n Tales Event Poster",
      },
    ],
    locale: "id_ID",
    type: "website",
  },

  other: {
    "application/ld+json": JSON.stringify({
      "@context": "https://schema.org",
      "@type": "Event",
      name: "Talk n Tales",
      description:
        "Event networking untuk Gen Z Founder dan decision maker.",
      url: "https://paceon.id/Talk-n-Tales",
      eventStatus: "https://schema.org/EventScheduled",
      organizer: {
        "@type": "Organization",
        name: "PACE ON",
        url: "https://paceon.id",
      },
    }),
  },
};
