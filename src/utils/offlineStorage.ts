import { NewsArticle } from '../types';

const OFFLINE_ARTICLES_KEY = 'ract_offline_articles_v2';
const AUTO_TRANSLATE_KEY = 'ract_auto_translate_v2';
const THEME_MODE_KEY = 'ract_theme_mode_v1';

export function getOfflineArticles(): NewsArticle[] {
  try {
    const raw = localStorage.getItem(OFFLINE_ARTICLES_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    console.warn('Error reading offline articles from localStorage:', e);
    return [];
  }
}

export function saveArticleOffline(article: NewsArticle): boolean {
  try {
    const current = getOfflineArticles();
    const existingIndex = current.findIndex((a) => a.id === article.id);
    const toSave: NewsArticle = {
      ...article,
      savedAt: Date.now(),
    };

    let updated: NewsArticle[];
    if (existingIndex >= 0) {
      updated = [...current];
      updated[existingIndex] = toSave;
    } else {
      updated = [toSave, ...current];
    }

    localStorage.setItem(OFFLINE_ARTICLES_KEY, JSON.stringify(updated));
    return true;
  } catch (e) {
    console.warn('Error saving article offline:', e);
    return false;
  }
}

export function removeArticleOffline(articleId: string): boolean {
  try {
    const current = getOfflineArticles();
    const updated = current.filter((a) => a.id !== articleId);
    localStorage.setItem(OFFLINE_ARTICLES_KEY, JSON.stringify(updated));
    return true;
  } catch (e) {
    console.warn('Error removing article offline:', e);
    return false;
  }
}

export function isArticleSavedOffline(articleId: string): boolean {
  const current = getOfflineArticles();
  return current.some((a) => a.id === articleId);
}

export function getAutoTranslatePreference(): boolean {
  try {
    const val = localStorage.getItem(AUTO_TRANSLATE_KEY);
    return val === null ? true : val === 'true'; // Default to true (Portuguese automatic translation)
  } catch {
    return true;
  }
}

export function setAutoTranslatePreference(enabled: boolean): void {
  try {
    localStorage.setItem(AUTO_TRANSLATE_KEY, String(enabled));
  } catch (e) {
    console.warn('Error saving translation preference:', e);
  }
}

export function getDarkModePreference(): boolean {
  try {
    const val = localStorage.getItem(THEME_MODE_KEY);
    if (val !== null) {
      return val === 'dark';
    }
    // Check system preference if not explicitly set
    if (typeof window !== 'undefined' && window.matchMedia) {
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return false;
  } catch {
    return false;
  }
}

export function setDarkModePreference(isDark: boolean): void {
  try {
    localStorage.setItem(THEME_MODE_KEY, isDark ? 'dark' : 'light');
  } catch (e) {
    console.warn('Error saving dark mode preference:', e);
  }
}
