/** SEO utilities — canonical URLs, schema builders, meta helpers */

export const BASE_URL = 'https://bc-newsengine.netlify.app';
export const SITE_NAME = 'BrokerChooser News';
export const ORG_NAME = 'BrokerChooser';
export const ORG_URL = 'https://brokerchooser.com';
export const ORG_LOGO = 'https://brokerchooser.com/favicon.svg';
export const DEFAULT_OG_IMAGE = 'https://brokerchooser.com/images/og-image.jpg';
export const DEFAULT_TITLE = 'News | BrokerChooser — Broker News, Markets & Regulation';
export const DEFAULT_DESCRIPTION =
  'Stay informed with the latest broker news, market analysis, regulation updates, and expert insights from BrokerChooser. Independent, unbiased financial news for retail investors.';

// ---- URL helpers ----

export const newsUrl = () => `${BASE_URL}/news`;
export const articleUrl = (slug: string) => `${BASE_URL}/news/${slug}`;
export const brokerNewsUrl = (slug: string) => `${BASE_URL}/news/broker/${slug}`;

// ---- Meta helpers ----

export function articleTitle(title: string) {
  return `${title} | ${ORG_NAME}`;
}

export function articleDescription(body: string): string {
  const text = body.replace(/\n+/g, ' ').trim();
  return text.length > 160 ? text.slice(0, 157) + '…' : text;
}

export function brokerPageTitle(brokerName: string) {
  return `${brokerName} Latest News & Updates | ${ORG_NAME}`;
}

export function brokerPageDescription(brokerName: string) {
  return `Follow the latest ${brokerName} news, platform updates, fee changes, and regulatory developments. Independent broker coverage by BrokerChooser.`;
}

// ---- Schema builders ----

interface ArticleSchemaOptions {
  title: string;
  description: string;
  url: string;
  image: string;
  datePublished: string;
  dateModified: string;
  authorName?: string;
  sourceName: string;
  sourceUrl: string;
  breadcrumbs: Array<{ name: string; url: string }>;
}

export function buildNewsArticleSchema(opts: ArticleSchemaOptions) {
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'NewsArticle',
        '@id': `${opts.url}#article`,
        headline: opts.title,
        description: opts.description,
        url: opts.url,
        datePublished: opts.datePublished,
        dateModified: opts.dateModified,
        image: {
          '@type': 'ImageObject',
          url: opts.image,
          width: 1200,
          height: 675,
        },
        author: opts.authorName
          ? { '@type': 'Person', name: opts.authorName }
          : {
              '@type': 'Organization',
              name: opts.sourceName,
              url: opts.sourceUrl,
            },
        publisher: {
          '@type': 'Organization',
          '@id': `${ORG_URL}/#organization`,
          name: ORG_NAME,
          url: ORG_URL,
          logo: {
            '@type': 'ImageObject',
            url: ORG_LOGO,
          },
        },
        isPartOf: {
          '@type': 'WebSite',
          '@id': `${BASE_URL}/#website`,
          name: SITE_NAME,
          url: BASE_URL,
        },
        inLanguage: 'en-US',
      },
      {
        '@type': 'BreadcrumbList',
        '@id': `${opts.url}#breadcrumb`,
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'News', item: newsUrl() },
          ...opts.breadcrumbs.map((b, i) => ({
            '@type': 'ListItem',
            position: i + 2,
            name: b.name,
            item: b.url,
          })),
          {
            '@type': 'ListItem',
            position: opts.breadcrumbs.length + 2,
            name: opts.title,
            item: opts.url,
          },
        ],
      },
    ],
  };
}

export function buildHomePageSchema(recentArticles: Array<{ title: string; url: string; image: string; datePublished: string }>) {
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebSite',
        '@id': `${BASE_URL}/#website`,
        name: SITE_NAME,
        url: newsUrl(),
        description: DEFAULT_DESCRIPTION,
        publisher: { '@id': `${ORG_URL}/#organization` },
        inLanguage: 'en-US',
        potentialAction: {
          '@type': 'SearchAction',
          target: {
            '@type': 'EntryPoint',
            urlTemplate: `${newsUrl()}?q={search_term_string}`,
          },
          'query-input': 'required name=search_term_string',
        },
      },
      {
        '@type': 'Organization',
        '@id': `${ORG_URL}/#organization`,
        name: ORG_NAME,
        url: ORG_URL,
        logo: {
          '@type': 'ImageObject',
          url: ORG_LOGO,
        },
        sameAs: [
          'https://twitter.com/brokerchooser',
          'https://www.linkedin.com/company/brokerchooser',
          'https://www.facebook.com/BrokerChooser',
        ],
      },
      {
        '@type': 'CollectionPage',
        '@id': `${newsUrl()}/#webpage`,
        url: newsUrl(),
        name: DEFAULT_TITLE,
        description: DEFAULT_DESCRIPTION,
        isPartOf: { '@id': `${BASE_URL}/#website` },
        hasPart: recentArticles.slice(0, 10).map((a) => ({
          '@type': 'NewsArticle',
          headline: a.title,
          url: a.url,
          image: a.image,
          datePublished: a.datePublished,
        })),
        inLanguage: 'en-US',
      },
    ],
  };
}

interface BrokerPageSchemaOptions {
  brokerName: string;
  brokerSlug: string;
  description: string;
  articles: Array<{ title: string; url: string; image: string; datePublished: string }>;
}

export function buildBrokerPageSchema(opts: BrokerPageSchemaOptions) {
  const pageUrl = brokerNewsUrl(opts.brokerSlug);
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'CollectionPage',
        '@id': `${pageUrl}#webpage`,
        url: pageUrl,
        name: brokerPageTitle(opts.brokerName),
        description: opts.description,
        isPartOf: { '@id': `${BASE_URL}/#website` },
        about: {
          '@type': 'Organization',
          name: opts.brokerName,
        },
        hasPart: opts.articles.slice(0, 10).map((a) => ({
          '@type': 'NewsArticle',
          headline: a.title,
          url: a.url,
          image: a.image,
          datePublished: a.datePublished,
        })),
        inLanguage: 'en-US',
      },
      {
        '@type': 'BreadcrumbList',
        '@id': `${pageUrl}#breadcrumb`,
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'News', item: newsUrl() },
          { '@type': 'ListItem', position: 2, name: `${opts.brokerName} News`, item: pageUrl },
        ],
      },
    ],
  };
}
