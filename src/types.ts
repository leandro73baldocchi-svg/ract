export type CategoryType = 'all' | 'education' | 'science' | 'tech' | 'ai' | 'space' | 'health' | 'physics' | 'biography';

export interface NewsArticle {
  id: string;
  title: string;
  titlePt: string;
  source: string;
  sourceCategory: CategoryType;
  articleType?: 'paper' | 'report' | 'biography' | 'research' | 'news';
  link: string;
  pubDate: string;
  isoDate?: string;
  summary: string;
  summaryPt: string;
  keyTakeaway?: string;
  author?: string;
  imageUrl?: string;
  readTime: string;
  doi?: string;
  isPeerReviewed?: boolean;
  tags: string[];
  savedAt?: number;
  cachedDeepDive?: ArticleDeepDive;
}

export interface DailyBriefing {
  date: string;
  edition: string;
  headline: string;
  executiveSummary: string;
  keyBulletPoints: string[];
  scienceHighlight: {
    title: string;
    source: string;
    impact: string;
  };
  techHighlight: {
    title: string;
    source: string;
    impact: string;
  };
  sourcesActive: string[];
  lastSync: string;
}

export interface ArticleDeepDive {
  whyItMatters: string;
  scientificContext: string;
  potentialImpact: string;
  simplifiedExplanation: string;
  keyTerms: { term: string; definition: string }[];
}
