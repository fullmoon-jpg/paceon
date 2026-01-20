import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "LOOP - Learning on Our Pace",
  description:
    "A Learning Experience for Gen Z.",

  alternates: {
    canonical: "https://paceon.id/LOOP",
  },

  openGraph: {
    title: "LOOP - Learning on Our Pace",
    description: "A Learning Experience for Gen Z.",
    url: "https://paceon.id/LOOP",
    siteName: "PACE ON",
    type: "website",
  },

  other: {
    "application/ld+json": JSON.stringify({
      "@context": "https://schema.org",
      "@type": "Event",
      name: "Talk n Tales",
      description:
        "Learning Experience untuk Gen Z.",
      url: "https://paceon.id/LOOP",
      eventStatus: "https://schema.org/EventScheduled",
      organizer: {
        "@type": "Organization",
        name: "PACE ON",
        url: "https://paceon.id",
      },
    }),
  },
};
