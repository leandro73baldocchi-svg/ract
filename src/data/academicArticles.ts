import { NewsArticle } from '../types';

/**
 * Conforme instrução: os 41 artigos residem exclusivamente no servidor
 * (/data/articles.json) e são carregados dinamicamente via API (/api/articles).
 * O código-fonte do frontend não embute mais artigos estáticos.
 */
export const ACADEMIC_ARTICLES: NewsArticle[] = [];
