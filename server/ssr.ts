// server/ssr.ts
import React from "react";
import { renderToString } from "react-dom/server";
// --- Only import Router from wouter ---
import { Router } from "wouter";
// --- memoryLocation import is REMOVED ---

// --- Helmet imports (keep as named import) ---
import { HelmetProvider } from "react-helmet-async";
import type { HelmetServerState } from "react-helmet-async";
// --- End Helmet imports ---

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import App from "../client/src/App"; // Assumes alias resolves correctly

export interface HelmetContext {
  helmet?: HelmetServerState;
}

// Note: Return type could eventually include redirect info if needed
export async function renderPage(
  url: string,
): Promise<{ html: string; head: HelmetContext; redirect?: string }> { // Added optional redirect
  const helmetContext: HelmetContext = {};
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { staleTime: Infinity, gcTime: Infinity, retry: false },
    },
  });

  // --- Context object for SSR features like redirects ---
  const ssrContext: { redirect?: string } = {}; // Wouter uses this pattern

  let appHtml = "";
  try {
    appHtml = renderToString(
      <HelmetProvider context={helmetContext}>
        <QueryClientProvider client={queryClient}>
          {/* --- Use ssrPath and ssrContext props --- */}
          <Router ssrPath={url} ssrContext={ssrContext}>
             <App />
          </Router>
          {/* --- hook prop is REMOVED --- */}
        </QueryClientProvider>
      </HelmetProvider>
    );
  } catch (renderError) {
    console.error(`SSR Rendering Error for route ${url}:`, renderError);
    throw renderError;
  }

  // Return html, head context, and potential redirect location
  return {
    html: appHtml,
    head: helmetContext,
    redirect: ssrContext.redirect // If a <Redirect> was rendered, it populates this
  };
}