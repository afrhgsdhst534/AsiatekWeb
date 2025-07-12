
import { Helmet } from 'react-helmet-async';

interface Props {
  id: string;            // canonical URL
  name: string;
  brand: string;
  image?: string;
  price?: number;
  rating?: number;       // 0‑5
  reviewCount?: number;
}
export default function ProductLD(p: Props) {
  const ld: any = {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": p.name,
    "brand": p.brand,
    "url": p.id,
    "image": p.image
  };
  if (p.price) ld.offers = {
    "@type": "Offer",
    "priceCurrency": "TJS",
    "price": p.price,
    "availability": "https://schema.org/InStock"
  };
  if (p.rating) ld.aggregateRating = {
    "@type": "AggregateRating",
    "ratingValue": p.rating.toFixed(1),
    "reviewCount": p.reviewCount ?? 1
  };
  return (
    <Helmet>
      <script type="application/ld+json">{JSON.stringify(ld)}</script>
    </Helmet>
  );
}
