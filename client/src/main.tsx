
import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { HelmetProvider } from 'react-helmet-async';

// For client-side rendering in all environments
if (typeof window !== 'undefined') {
  const container = document.getElementById("root");
  if (container) {
    const queryClient = new QueryClient();
    createRoot(container).render(
      <HelmetProvider>
        <QueryClientProvider client={queryClient}>
          <App />
        </QueryClientProvider>
      </HelmetProvider>
    );
  }
}

// Export for SSR/SSG compatibility
export default function ClientApp() {
  const queryClient = new QueryClient();
  
  return (
    <HelmetProvider>
      <QueryClientProvider client={queryClient}>
        <App />
      </QueryClientProvider>
    </HelmetProvider>
  );
}
