// FILE: client/src/App.tsx (FINAL VERSION with Default Helmet Tags)
// Replace the ENTIRE content of your existing App.tsx with this.

import React from "react";
import { Switch, Route, Router } from "wouter"; // Import Router too
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { AuthProvider } from "./hooks/use-auth";
import { ProtectedRoute } from "./lib/protected-route";
import { Helmet, HelmetProvider } from "react-helmet-async"; // Import Helmet

/* ─── UI helpers ─── */
import { Toaster } from "@/components/ui/toaster";
import { PWAInstallPrompt } from "@/components/ui/pwa-install-prompt";
// import LocalBusinessLD from "@/components/seo/LocalBusinessLD"; // Can keep or add LD+JSON via Helmet

/* ─── pages ─── */
import HomePage from "@/pages/home-page";
import OrderPage from "@/pages/order-page";
import ContactPage from "@/pages/contact-page";
import AuthPage from "@/pages/auth-page";
import DashboardPage from "@/pages/dashboard-page";
import ForgotPasswordPage from "@/pages/forgot-password-page";
import ResetPasswordPage from "@/pages/reset-password-page";
import ZapchastiIndexPage from "@/pages/zapchasti-index-page";
import ZapchastiPage from "@/pages/zapchasti-page";
import NotFound from "@/pages/not-found";

/* ─── layout ─── */
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";

/* -------------------------------------------------------------------------- */

// Renamed internal Router component to avoid conflict with wouter's Router
function AppRouter() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-grow">
        <Switch>
          <Route path="/" component={HomePage} />
          <Route path="/order" component={OrderPage} />
          <Route path="/contact" component={ContactPage} />
          <Route path="/auth" component={AuthPage} />
          <Route path="/auth/forgot-password" component={ForgotPasswordPage} />
          <Route path="/auth/reset-password" component={ResetPasswordPage} />
          <ProtectedRoute path="/dashboard" component={DashboardPage} />
          <Route path="/zapchasti" component={ZapchastiIndexPage} />
          <Route path="/zapchasti/:brand" component={ZapchastiPage} />
          <Route component={NotFound} />
        </Switch>
      </main>
      <Footer />
    </div>
  );
}

/* -------------------------------------------------------------------------- */

function App() {
  // --- Default SEO and Social Tags ---
  const defaultTitle = "Asiatek | Автозапчасти Оптом и в Розницу";
  const defaultDescription =
    "Asiatek - Надежный поставщик автозапчастей для китайских, корейских, японских и европейских автомобилей. Запчасти оптом и в розницу с доставкой по России.";
  // !!! IMPORTANT: Create a default preview image (e.g., your logo, 1200x630px)
  // !!! Place it in client/public/assets/ (or similar) and update the filename below
  const defaultImageUrl = "https://asiatek.pro/assets/asiatek-preview.png"; // <--- CHANGE THIS FILENAME
  const siteUrl = "https://asiatek.pro";
  // ---

  return (
    // HelmetProvider should wrap everything that might use Helmet
    <HelmetProvider>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          {/* --- START: Default Helmet Tags --- */}
          <Helmet>
            <html lang="ru" />
            <title>{defaultTitle}</title> {/* Default Title */}
            <meta name="description" content={defaultDescription} />{" "}
            {/* Default Description */}
            {/* Default Open Graph tags (for Facebook, LinkedIn, etc.) */}
            <meta property="og:type" content="website" />
            <meta property="og:url" content={siteUrl} />
            <meta property="og:title" content={defaultTitle} />
            <meta property="og:description" content={defaultDescription} />
            <meta property="og:image" content={defaultImageUrl} />
            <meta property="og:image:width" content="1200" />
            <meta property="og:image:height" content="630" />
            <meta property="og:locale" content="ru_RU" />
            <meta property="og:site_name" content="Asiatek" />
            {/* Default Twitter Card tags */}
            <meta name="twitter:card" content="summary_large_image" />
            <meta name="twitter:url" content={siteUrl} />
            <meta name="twitter:title" content={defaultTitle} />
            <meta name="twitter:description" content={defaultDescription} />
            <meta name="twitter:image" content={defaultImageUrl} />
            {/* You might add other default tags like theme-color, etc. if needed */}
            {/* <meta name="theme-color" content="#ffffff" /> */}
            {/* Add JSON-LD structured data here if you removed the component */}
            {/* Example (make sure content matches your LocalBusinessLD component) */}
            {/* <script type="application/ld+json">{`
              {
                "@context": "https://schema.org",
                "@type": "AutoPartsStore",
                "name": "Asiatek",
                "image": "${siteUrl}/assets/asiatek-logo-og.png", // Use appropriate logo
                "url": "${siteUrl}",
                "telephone": "+79802174850",
                "address": {
                  "@type": "PostalAddress",
                  "streetAddress": "2-й Тушинский проезд 10",
                  "addressLocality": "Москва",
                  "postalCode": "125371",
                  "addressCountry": "RU"
                },
                "openingHoursSpecification": [{
                  "@type": "OpeningHoursSpecification",
                  "dayOfWeek": ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"],
                  "opens": "09:00",
                  "closes": "18:00"
                }]
              }
            `}</script> */}
          </Helmet>
          {/* --- END: Default Helmet Tags --- */}

          {/* Use wouter <Router> to wrap the routes */}
          <Router>
            <AppRouter /> {/* Your component containing layout and <Switch> */}
          </Router>

          <Toaster />
          <PWAInstallPrompt />
          {/* Remove <LocalBusinessLD /> if you add the JSON-LD via Helmet */}
        </AuthProvider>
      </QueryClientProvider>
    </HelmetProvider>
  );
}

export default App;
