import { useEffect, useRef } from 'react';
import { DEFAULT_TITLE, DEFAULT_DESCRIPTION, DEFAULT_OG_IMAGE, BASE_URL } from '../utils/seo';

interface SEOOptions {
  title: string;
  description: string;
  canonical: string;
  ogImage?: string;
  ogType?: 'website' | 'article';
  /** ISO date string, article-only */
  publishedTime?: string;
  /** JSON-LD schema object — will be serialised and injected */
  schema?: object;
  /** Full URL for rel="prev" pagination link */
  prevUrl?: string;
  /** Full URL for rel="next" pagination link */
  nextUrl?: string;
}

function getOrCreateMeta(selector: string, attribute: 'name' | 'property'): HTMLMetaElement {
  let el = document.querySelector<HTMLMetaElement>(`meta[${attribute}="${selector}"]`);
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attribute, selector);
    document.head.appendChild(el);
  }
  return el;
}

function getOrCreateLink(rel: string): HTMLLinkElement {
  let el = document.querySelector<HTMLLinkElement>(`link[rel="${rel}"]`);
  if (!el) {
    el = document.createElement('link');
    el.setAttribute('rel', rel);
    document.head.appendChild(el);
  }
  return el;
}

function injectJsonLd(schema: object, id: string): HTMLScriptElement {
  const existing = document.getElementById(id);
  if (existing) existing.remove();

  const script = document.createElement('script');
  script.type = 'application/ld+json';
  script.id = id;
  script.textContent = JSON.stringify(schema);
  document.head.appendChild(script);
  return script;
}

export function useSEO({
  title,
  description,
  canonical,
  ogImage = DEFAULT_OG_IMAGE,
  ogType = 'website',
  publishedTime,
  schema,
  prevUrl,
  nextUrl,
}: SEOOptions) {
  const prevTitle = useRef(document.title);
  const schemaId = 'ld-json-page';

  useEffect(() => {
    prevTitle.current = document.title;

    // --- Title ---
    document.title = title;

    // --- Standard meta ---
    getOrCreateMeta('description', 'name').content = description;
    getOrCreateMeta('robots', 'name').content = 'index, follow';

    // --- Canonical ---
    getOrCreateLink('canonical').href = canonical;

    // --- Pagination ---
    if (prevUrl) {
      getOrCreateLink('prev').href = prevUrl;
    } else {
      document.querySelector('link[rel="prev"]')?.remove();
    }
    if (nextUrl) {
      getOrCreateLink('next').href = nextUrl;
    } else {
      document.querySelector('link[rel="next"]')?.remove();
    }

    // --- Open Graph ---
    getOrCreateMeta('og:type', 'property').content = ogType;
    getOrCreateMeta('og:title', 'property').content = title;
    getOrCreateMeta('og:description', 'property').content = description;
    getOrCreateMeta('og:url', 'property').content = canonical;
    getOrCreateMeta('og:image', 'property').content = ogImage;
    getOrCreateMeta('og:site_name', 'property').content = 'BrokerChooser';
    if (publishedTime) {
      getOrCreateMeta('article:published_time', 'property').content = publishedTime;
    } else {
      document.querySelector('meta[property="article:published_time"]')?.remove();
    }

    // --- Twitter ---
    getOrCreateMeta('twitter:card', 'name').content = 'summary_large_image';
    getOrCreateMeta('twitter:site', 'name').content = '@brokerchooser';
    getOrCreateMeta('twitter:title', 'name').content = title;
    getOrCreateMeta('twitter:description', 'name').content = description;
    getOrCreateMeta('twitter:image', 'name').content = ogImage;

    // --- JSON-LD ---
    if (schema) {
      injectJsonLd(schema, schemaId);
    }

    return () => {
      document.title = prevTitle.current || DEFAULT_TITLE;
      document.getElementById(schemaId)?.remove();
    };
  }, [title, description, canonical, ogImage, ogType, publishedTime, schema, prevUrl, nextUrl]);
}

/** Lightweight variant for pages that only need to reset the title on unmount */
export function usePageTitle(title: string) {
  useSEO({
    title,
    description: DEFAULT_DESCRIPTION,
    canonical: BASE_URL,
  });
}
