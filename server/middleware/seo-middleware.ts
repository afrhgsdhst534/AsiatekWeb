// FILE: server/middleware/seo-middleware.ts (Add specific error logging)
// Replace ENTIRE file content

import { Request, Response, NextFunction } from "express";
import path from "path";
import fs from "fs"; // Keep fs for initial directory check

/**
 * Factory function to create the SEO Middleware.
 * Requires the absolute path to the 'dist/public' directory.
 */
export function createSeoMiddleware(prerenderedDirPath: string) {
  console.log(
    `[SEO Middleware Init] Using prerendered directory: ${prerenderedDirPath}`,
  );
  if (!fs.existsSync(prerenderedDirPath)) {
    console.error(
      `[SEO Middleware Init] CRITICAL WARNING: Provided prerendered directory does not exist: ${prerenderedDirPath}`,
    );
  } else if (!fs.statSync(prerenderedDirPath).isDirectory()) {
    console.error(
      `[SEO Middleware Init] CRITICAL WARNING: Provided path is not a directory: ${prerenderedDirPath}`,
    );
  }

  return function seoMiddleware(
    req: Request,
    res: Response,
    next: NextFunction,
  ) {
    const userAgent = req.headers["user-agent"] || "";
    const isBot =
      /bot|crawl|spider|slurp|lighthouse|prerender|screaming|yahoo|bing|google|yandex|baidu|duckduckgo|facebookexternalhit|twitterbot|linkedinbot|pinterest|whatsapp|telegrambot/i.test(
        userAgent,
      );

    // Keep this log minimal now we're confident detection works
    // console.log(`[SEO Check] Path: ${req.path}, User-Agent: ${userAgent}`);

    if (isBot) {
      // console.log(`[SEO Check] Bot DETECTED: ${userAgent}`); // Keep commented unless needed

      let relativePath;
      if (req.path === "/" || req.path === "") {
        relativePath = "index.html";
      } else {
        const cleanReqPath = req.path.replace(/^\/+/, "");
        if (path.extname(cleanReqPath)) {
          relativePath = cleanReqPath;
        } else {
          relativePath = path.join(cleanReqPath, "index.html");
        }
      }
      // console.log(`[SEO Check] Target file relative to public dir: ${relativePath}`); // Keep commented

      const filePath = path.join(prerenderedDirPath, relativePath);
      // console.log(`[SEO Check] Calculated absolute file path: ${filePath}`); // Keep commented

      res.sendFile(filePath, (err) => {
        if (err) {
          // --- ADD DETAILED ERROR LOGGING ---
          console.error(
            `[SEO Check] sendFile error for path "${filePath}":`,
            err,
          ); // Log the actual error object
          // Example: Check for specific common errors
          if (err.code === "ENOENT") {
            console.warn(
              `[SEO Check] File not found (ENOENT). Passing to next handler.`,
            );
          } else if (err.code === "EACCES") {
            console.error(
              `[SEO Check] Permission denied (EACCES). Passing to next handler.`,
            );
          } else {
            console.warn(
              `[SEO Check] Other sendFile error (${err.code || "Unknown"}). Passing to next handler.`,
            );
          }
          // --- END DETAILED ERROR LOGGING ---
          next(); // Fall back to SPA or other handlers
        } else {
          // console.log(`[SEO Check] SUCCESS: Served prerendered file ${filePath} to bot.`); // Success case, log if needed
        }
      });
      return; // Stop middleware chain if bot detected & sendFile attempted
    } else {
      // console.log(`[SEO Check] Not a bot. Passing to next handler.`); // Log if needed
      next();
    }
  };
}
