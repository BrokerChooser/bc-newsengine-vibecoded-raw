/** NewsAPI.ai (Event Registry) article data structure */

export interface NewsApiSource {
  uri: string;
  dataType: 'news' | 'pr' | 'blog';
  title: string;
}

export interface NewsApiAuthor {
  uri: string;
  name: string;
  type: 'author';
  isAgency: boolean;
}

export interface NewsApiConcept {
  uri: string;
  type: 'person' | 'org' | 'loc' | 'wiki';
  score: number;
  label: {
    eng: string;
  };
}

export interface NewsApiCategory {
  uri: string;
  label: string;
  wgt: number;
}

export interface NewsApiLocation {
  type: string;
  label: {
    eng: string;
  };
  country?: {
    label: {
      eng: string;
    };
  };
}

export interface NewsApiSocialScore {
  facebookShares: number;
  twitterShares: number;
}

export interface NewsApiArticle {
  uri: string;
  lang: string;
  isDuplicate: boolean;
  date: string;
  time: string;
  dateTime: string;
  dateTimePub: string;
  dataType: 'news' | 'pr' | 'blog';
  sim: number;
  url: string;
  title: string;
  body: string;
  source: NewsApiSource;
  authors: NewsApiAuthor[];
  image: string;
  eventUri: string | null;
  sentiment: number | null;
  wgt: number;
  relevance: number;
  concepts: NewsApiConcept[];
  categories: NewsApiCategory[];
  links: string[];
  videos: string[];
  socialScore: NewsApiSocialScore;
  location: NewsApiLocation | null;
  extractedDates: string[];
  storyUri: string | null;
}

export interface NewsApiResponse {
  articles: {
    results: NewsApiArticle[];
    totalResults: number;
    page: number;
    count: number;
    pages: number;
  };
}

/** BrokerChooser extension — added by our AI pipeline */
export type BCNewsCategory =
  | 'broker-news'
  | 'markets'
  | 'regulation-safety'
  | 'analysis-insights'
  | 'guides';

export interface BCAuthorTake {
  authorName: string;
  authorRole: string;
  authorImage: string;
  summary: string;
  takeaway: string;
}

export interface BCEnrichedArticle extends NewsApiArticle {
  bcCategory: BCNewsCategory;
  bcSlug: string;
  bcTake: BCAuthorTake;
  bcRelatedBrokers?: string[];
  bcReadingTime: number;
}
