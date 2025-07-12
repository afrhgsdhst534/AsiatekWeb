// FILE: client/src/components/seo/LocalBusinessLD.tsx
// Replace ENTIRE file content

import { Helmet } from "react-helmet-async";

export default function LocalBusinessLD() {
  // Define the correct *relative path* from the public root
  const logoRelativePath = "assets/logos/asiatek-logo.png"; // <<< --- CORRECTED PATH

  const data = {
    "@context": "https://schema.org",
    "@type": "AutoPartsStore",
    name: "Asiatek",
    // --- UPDATED URL ---
    // Construct the full URL using the correct relative path
    image: `https://asiatek.pro/${logoRelativePath}`,
    // --- END UPDATED URL ---
    url: "https://asiatek.pro",
    telephone: "+79802174850",
    address: {
      "@type": "PostalAddress",
      streetAddress: "2-й Тушинский проезд 10",
      addressLocality: "Москва",
      postalCode: "125371",
      addressCountry: "RU",
    },
    openingHoursSpecification: [
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: [
          "Monday",
          "Tuesday",
          "Wednesday",
          "Thursday",
          "Friday",
          "Saturday",
        ],
        opens: "09:00",
        closes: "18:00",
      },
    ],
    geo: { "@type": "GeoCoordinates", latitude: 55.8483, longitude: 37.4361 },
  };
  return (
    <Helmet>
      <script type="application/ld+json">{JSON.stringify(data)}</script>
    </Helmet>
  );
}
