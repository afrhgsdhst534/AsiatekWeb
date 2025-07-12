// FILE: client/src/components/seo/Seo.tsx
// Replace ENTIRE file content

import React from "react";
import { Helmet } from "react-helmet-async";

interface SeoProps {
  title: string;
  description: string;
  path: string;
  image?: string; // The default will be updated below
  type?: "website" | "article" | "product";
  brand?: string;
  noindex?: boolean;
  children?: React.ReactNode;
}

const Seo: React.FC<SeoProps> = ({
  title,
  description,
  path,
  // --- UPDATE DEFAULT IMAGE PATH ---
  image = "/assets/social-preview-banner.png", // <-- Use the new banner path
  // --- END UPDATE ---
  type = "website",
  brand,
  noindex = false,
  children,
}) => {
  const siteUrl = "https://asiatek.pro";
  const url = `${siteUrl}${path}`;
  // Construct the full image URL correctly whether it's absolute or relative
  const imageUrl = image.startsWith("http")
    ? image
    : `${siteUrl}${image.startsWith("/") ? image : "/" + image}`;

  return (
    <Helmet>
      {/* Basic metadata */}
      <title>{title}</title>
      <meta name="description" content={description} />
      {/* Indexing instructions */}
      {noindex && <meta name="robots" content="noindex, nofollow" />}
      {noindex && <meta name="googlebot" content="noindex, nofollow" />}
      {noindex && <meta name="yandex" content="noindex, nofollow" />}
      {/* Canonical URL */}
      <link rel="canonical" href={url} />
      {/* Open Graph / Facebook */}
      <meta property="og:type" content={type} />
      <meta property="og:url" content={url} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={imageUrl} />
      <meta property="og:locale" content="ru_RU" />
      <meta property="og:site_name" content="Asiatek" />
      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:url" content={url} />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={imageUrl} />
      {/* Additional product metadata if this is a product */}
      {type === "product" && brand && (
        <>
          <meta property="og:brand" content={brand} />
          <meta property="product:brand" content={brand} />
          <meta property="product:availability" content="in stock" />
        </>
      )}
      {/* Additional Russian-specific tags */}
      <meta name="geo.region" content="RU" />
      <meta name="geo.placename" content="Москва" />
      <meta name="language" content="Russian" />
      {/* Yandex verification */}
      {/* <meta name="yandex-verification" content="YOUR_YANDEX_TOKEN" /> */}{" "}
      {/* Make sure to add your token or remove */}
      {/* Mobile-specific */}
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <meta name="format-detection" content="telephone=no" />
      {/* Additional custom elements */}
      {children}
    </Helmet>
  );
};

export default Seo;
