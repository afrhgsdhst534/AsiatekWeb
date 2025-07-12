// client/src/pages/zapchasti-page.tsx
import React from "react";
import { useRoute } from "wouter";
import { getBrandBySlug } from "@/data/brands";
import BrandPage from "@/components/brand/BrandPage";
import NotFound from "@/pages/not-found";

const ZapchastiPage: React.FC = () => {
  // Match route pattern
  const [match, params] = useRoute<{ brand: string }>("/zapchasti/:brand");
  
  if (!match) {
    return <NotFound />;
  }
  
  // Get brand from slug
  const brand = getBrandBySlug(params.brand);
  
  if (!brand) {
    return <NotFound />;
  }
  
  return <BrandPage brand={brand} />;
};

export default ZapchastiPage;