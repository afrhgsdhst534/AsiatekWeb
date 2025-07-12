// This file provides SSG-compatible components for react-helmet-async
import React from 'react';
import { Helmet } from 'react-helmet-async';

// Store metadata for SSG
let ssgMetadata: {
  title: string;
  meta: string[];
  link: string[];
  script: string[];
  htmlAttributes: Record<string, string>;
  bodyAttributes: Record<string, string>;
} = {
  title: '',
  meta: [],
  link: [],
  script: [],
  htmlAttributes: {},
  bodyAttributes: {},
};

// Reset metadata between renders
export const resetMetadata = () => {
  ssgMetadata = {
    title: '',
    meta: [],
    link: [],
    script: [],
    htmlAttributes: {},
    bodyAttributes: {},
  };
};

// Get the collected metadata
export const getMetadata = () => {
  return {
    toString: () => JSON.stringify(ssgMetadata),
    title: { toString: () => ssgMetadata.title },
    meta: { toString: () => ssgMetadata.meta.join('') },
    link: { toString: () => ssgMetadata.link.join('') },
    script: { toString: () => ssgMetadata.script.join('') },
    htmlAttributes: { toString: () => Object.entries(ssgMetadata.htmlAttributes).map(([key, value]) => `${key}="${value}"`).join(' ') },
    bodyAttributes: { toString: () => Object.entries(ssgMetadata.bodyAttributes).map(([key, value]) => `${key}="${value}"`).join(' ') },
  };
};

// Mock Helmet component that captures metadata
export const Helmet = (props: any) => {
  // Process title
  if (props.title) {
    ssgMetadata.title = `<title>${props.title}</title>`;
  }

  // Process meta tags
  if (props.meta) {
    props.meta.forEach((meta: any) => {
      const attributes = Object.entries(meta)
        .map(([key, value]) => `${key}="${value}"`)
        .join(' ');
      ssgMetadata.meta.push(`<meta ${attributes}>`);
    });
  }

  // Process link tags
  if (props.link) {
    props.link.forEach((link: any) => {
      const attributes = Object.entries(link)
        .map(([key, value]) => `${key}="${value}"`)
        .join(' ');
      ssgMetadata.link.push(`<link ${attributes}>`);
    });
  }

  // Process script tags
  if (props.script) {
    props.script.forEach((script: any) => {
      const attributes = Object.entries(script)
        .filter(([key]) => key !== 'children')
        .map(([key, value]) => `${key}="${value}"`)
        .join(' ');

      if (script.children) {
        ssgMetadata.script.push(`<script ${attributes}>${script.children}</script>`);
      } else {
        ssgMetadata.script.push(`<script ${attributes}></script>`);
      }
    });
  }

  // Process HTML attributes
  if (props.htmlAttributes) {
    Object.assign(ssgMetadata.htmlAttributes, props.htmlAttributes);
  }

  // Process body attributes
  if (props.bodyAttributes) {
    Object.assign(ssgMetadata.bodyAttributes, props.bodyAttributes);
  }

  return React.createElement(React.Fragment, null, props.children);
};

// Context to store Helmet context
let helmetContext = { helmet: getMetadata() };

// Mock HelmetProvider component
export const HelmetProvider = (props: any) => {
  // If context is provided by the parent, use it
  if (props.context) {
    props.context.helmet = getMetadata();
    helmetContext = props.context;
  }

  return React.createElement(React.Fragment, null, props.children);
};