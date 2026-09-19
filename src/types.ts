export type CategoryType =
  | 'all'
  | 'biography'
  | 'education'
  | 'biotech'
  | 'health'
  | 'physics'
  | 'math'
  | 'astronomy'
  | 'geology'
  | 'tech'
  | 'ai'
  | 'universities'
  | 'psychology'
  | (string & {});

export interface CustomCategory {
  id: string;
  label: string;
  description?: string;
  isCustom?: boolean;
  order?: number; // ADICIONADO CAMPO DE ORDENAÇÃO
}

export interface FullArticleContent {
  abstract: string;
  abstractPt: string;
  introduction: string;
  introductionPt: string;
  methodology: string;
  methodologyPt: string;
  results: string;
  resultsPt: string;
  discussion: string;
  discussionPt: string;
  conclusion: string;
  conclusionPt: string;
  citationAbnt?: string;
  citationApa?: string;
  references?: string[];
}

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
  fullArticle?: FullArticleContent;
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
