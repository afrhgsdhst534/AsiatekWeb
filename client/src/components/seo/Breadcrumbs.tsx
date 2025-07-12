
// client/src/components/seo/Breadcrumbs.tsx
import React from 'react';
import { Link } from 'wouter';
import { Helmet } from 'react-helmet-async';

interface BreadcrumbItem {
  name: string;
  item?: string;
  position: number;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  className?: string;
}

const Breadcrumbs: React.FC<BreadcrumbsProps> = ({ items, className = "mb-8" }) => {
  // Format items for structured data
  const breadcrumbListItems = items.map(item => ({
    "@type": "ListItem",
    "position": item.position,
    "name": item.name,
    ...(item.item && { "item": item.item })
  }));

  // Structured data JSON
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": breadcrumbListItems
  };

  return (
    <>
      {/* Structured data for SEO */}
      <Helmet>
        <script type="application/ld+json">
          {JSON.stringify(structuredData)}
        </script>
      </Helmet>

      {/* Visual breadcrumbs */}
      <nav className={className} aria-label="Breadcrumb">
        <ol className="flex flex-wrap items-center space-x-2 text-sm text-gray-500">
          {items.map((item, index) => (
            <li key={index} className="flex items-center">
              {index > 0 && (
                <span className="mx-2 text-gray-400">
                  /
                </span>
              )}
              
              {item.item ? (
                <Link href={item.item.replace('https://asiatek.pro', '')}>
                  <span className="hover:text-primary transition-colors cursor-pointer">
                    {item.name}
                  </span>
                </Link>
              ) : (
                <span className="font-medium text-gray-800">
                  {item.name}
                </span>
              )}
            </li>
          ))}
        </ol>
      </nav>
    </>
  );
};

export default Breadcrumbs;
