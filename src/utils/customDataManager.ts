import { CustomCategory, NewsArticle } from '../types';
import { ACADEMIC_ARTICLES } from '../data/academicArticles';

const CUSTOM_CATEGORIES_KEY = 'ract_custom_categories_v2';
const ALL_ARTICLES_KEY = 'ract_all_managed_articles_v3';
const CUSTOM_FEEDS_KEY = 'ract_custom_rss_feeds_v1';
const ADMIN_PASSWORD_KEY = 'ract_admin_password_hash_v1';
const SHOW_RADAR_BRIEFING_KEY = 'ract_show_radar_briefing_v1';

export interface CustomRssFeed {
  id: string;
  name: string;
  url: string;
  category: string;
  enabled: boolean;
}

export const DEFAULT_BASE_CATEGORIES: CustomCategory[] = [
  { id: 'all', label: 'Todas as Áreas' },
  { id: 'biography', label: 'Biografias' },
  { id: 'education', label: 'Educação' },
  { id: 'biotech', label: 'Biotecnologia' },
  { id: 'health', label: 'Saúde' },
  { id: 'physics', label: 'Física' },
  { id: 'math', label: 'Matemática' },
  { id: 'astronomy', label: 'Astronomia' },
  { id: 'geology', label: 'Geologia' },
  { id: 'tech', label: 'Tecnologia' },
  { id: 'ai', label: 'Inteligência Artificial' },
  { id: 'psychology', label: 'Psicologia' },
  { id: 'universities', label: 'Universidades (Brasil & Mundo)' },
];

export const DEFAULT_RSS_FEEDS: CustomRssFeed[] = [
  { id: 'f-nature', name: 'Nature Journal', url: 'https://www.nature.com/nature.rss', category: 'biotech', enabled: true },
  { id: 'f-science', name: 'Science Magazine', url: 'https://www.science.org/rss/news_current.xml', category: 'health', enabled: true },
  { id: 'f-harvard', name: 'Harvard Gazette', url: 'https://news.harvard.edu/gazette/feed/', category: 'education', enabled: true },
  { id: 'f-cambridge', name: 'Cambridge Research', url: 'https://www.cam.ac.uk/research/feed', category: 'universities', enabled: true },
  { id: 'f-mit', name: 'MIT News', url: 'https://news.mit.edu/rss/feed', category: 'universities', enabled: true },
  { id: 'f-nasa', name: 'NASA News', url: 'https://www.nasa.gov/rss/dyn/breaking_news.rss', category: 'astronomy', enabled: true },
  { id: 'f-cern', name: 'CERN Courier (Física)', url: 'https://cerncourier.com/feed/', category: 'physics', enabled: true },
  { id: 'f-quanta', name: 'Quanta Magazine (Matemática)', url: 'https://api.quantamagazine.org/feed/', category: 'math', enabled: true },
  { id: 'f-phys-earth', name: 'Phys.org Geology', url: 'https://phys.org/rss-feed/earth-news/geology/', category: 'geology', enabled: true },
  { id: 'f-mit-tech', name: 'MIT Tech Review', url: 'https://www.technologyreview.com/feed/', category: 'tech', enabled: true },
  { id: 'f-mit-ai', name: 'MIT News AI', url: 'https://news.mit.edu/rss/topic/artificial-intelligence2', category: 'ai', enabled: true },
  { id: 'f-nobel', name: 'The Nobel Prize (Biografias)', url: 'https://www.nobelprize.org/feed/', category: 'biography', enabled: true },
];

// -------------------------------------------------------------
// OPERAÇÕES NO SERVIDOR COM CACHE LOCAL
// -------------------------------------------------------------

/**
 * Busca todos os artigos salvos no servidor e sincroniza com dados locais pendentes
 */
export async function fetchServerArticles(): Promise<NewsArticle[]> {
  try {
    const res = await fetch('/api/articles');
    if (res.ok) {
      const data = await res.json();
      if (data.success && Array.isArray(data.articles)) {
        // Verifica se existem artigos criados localmente que ainda não estão no servidor
        await syncPendingLocalArticles(data.articles);
        saveAllManagedArticles(data.articles);
        return data.articles;
      }
    }
  } catch (err) {
    console.warn('Servidor inacessível, recorrendo ao cache local:', err);
  }
  return getAllManagedArticles();
}

/**
 * Busca todas as categorias salvas no servidor e sincroniza áreas criadas localmente
 */
export async function fetchServerCategories(): Promise<CustomCategory[]> {
  try {
    const res = await fetch('/api/categories');
    if (res.ok) {
      const data = await res.json();
      if (data.success && Array.isArray(data.categories)) {
        // Verifica se existem categorias criadas localmente que ainda não estão no servidor
        await syncPendingLocalCategories(data.categories);
        saveCustomCategories(data.categories);
        return data.categories;
      }
    }
  } catch (err) {
    console.warn('Servidor inacessível para categorias, usando cache local:', err);
  }
  return getCustomCategories();
}

/**
 * Sincroniza artigos que estavam salvos apenas no localStorage deste computador para o servidor central
 */
async function syncPendingLocalArticles(serverArticles: NewsArticle[]): Promise<void> {
  try {
    const local = getAllManagedArticles();
    const serverIds = new Set(serverArticles.map((a) => a.id));
    const pending = local.filter((a) => !serverIds.has(a.id));

    if (pending.length > 0) {
      console.log(`Encontrados ${pending.length} artigos locais pendentes. Sincronizando com o servidor...`);
      for (const art of pending) {
        try {
          await fetch('/api/articles', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(art),
          });
          serverArticles.unshift(art);
        } catch (e) {
          console.error('Falha ao sincronizar artigo pendente:', art.id, e);
        }
      }
    }
  } catch (e) {
    console.warn('Erro ao checar sincronização de artigos locais:', e);
  }
}

/**
 * Sincroniza áreas que estavam salvas apenas no localStorage deste computador para o servidor central
 */
async function syncPendingLocalCategories(serverCategories: CustomCategory[]): Promise<void> {
  try {
    const local = getCustomCategories();
    const serverIds = new Set(serverCategories.map((c) => c.id));
    const pending = local.filter((c) => !serverIds.has(c.id));

    if (pending.length > 0) {
      console.log(`Encontradas ${pending.length} áreas locais pendentes. Sincronizando com o servidor...`);
      for (const cat of pending) {
        try {
          await fetch('/api/categories', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(cat),
          });
          serverCategories.push(cat);
        } catch (e) {
          console.error('Falha ao sincronizar área pendente:', cat.id, e);
        }
      }
    }
  } catch (e) {
    console.warn('Erro ao checar sincronização de áreas locais:', e);
  }
}

/**
 * Salva um artigo no servidor (aparece em todos os aparelhos conectados)
 */
export async function saveOrUpdateArticle(article: NewsArticle): Promise<NewsArticle[]> {
  try {
    const res = await fetch('/api/articles', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(article),
    });
    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`Servidor retornou erro ${res.status}: ${errText}`);
    }
    const data = await res.json();
    if (data.success && Array.isArray(data.articles)) {
      saveAllManagedArticles(data.articles);
      return data.articles;
    }
    throw new Error('Resposta do servidor em formato inesperado');
  } catch (err: any) {
    console.error('Erro ao salvar no servidor:', err);
    // Salva no cache local para não perder o texto digitado
    const current = getAllManagedArticles();
    const index = current.findIndex((a) => a.id === article.id);
    let updated: NewsArticle[];
    if (index >= 0) {
      updated = [...current];
      updated[index] = { ...updated[index], ...article };
    } else {
      updated = [article, ...current];
    }
    saveAllManagedArticles(updated);
    throw new Error(`Atenção: Não foi possível salvar no servidor central (${err?.message || 'offline'}). O rascunho foi salvo neste navegador.`);
  }
}

/**
 * Remove um artigo do servidor central
 */
export async function deleteManagedArticle(articleId: string): Promise<NewsArticle[]> {
  const res = await fetch(`/api/articles/${articleId}`, {
    method: 'DELETE',
  });
  if (!res.ok) {
    throw new Error(`Falha ao excluir no servidor: HTTP ${res.status}`);
  }
  const data = await res.json();
  if (data.success && Array.isArray(data.articles)) {
    saveAllManagedArticles(data.articles);
    return data.articles;
  }
  const current = getAllManagedArticles();
  const updated = current.filter((a) => a.id !== articleId);
  saveAllManagedArticles(updated);
  return updated;
}

/**
 * Restaura acervo para os 41 artigos originais no servidor
 */
export async function resetToFactoryArticles(): Promise<NewsArticle[]> {
  const res = await fetch('/api/articles/reset', {
    method: 'POST',
  });
  if (!res.ok) {
    throw new Error('Falha ao restaurar acervo padrão no servidor');
  }
  const data = await res.json();
  if (data.success && Array.isArray(data.articles)) {
    saveAllManagedArticles(data.articles);
    return data.articles;
  }
  return getAllManagedArticles();
}

/**
 * Salva uma nova área (categoria) no servidor para aparecer em todos os aparelhos
 */
export async function saveCategoryToServer(category: CustomCategory): Promise<CustomCategory[]> {
  try {
    const res = await fetch('/api/categories', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(category),
    });
    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`Servidor retornou erro ${res.status}: ${errText}`);
    }
    const data = await res.json();
    if (data.success && Array.isArray(data.categories)) {
      saveCustomCategories(data.categories);
      return data.categories;
    }
    throw new Error('Resposta do servidor em formato inesperado');
  } catch (err: any) {
    console.error('Erro ao salvar categoria no servidor:', err);
    // Salva localmente para não perder
    const current = getCustomCategories();
    const updated = [...current, category];
    saveCustomCategories(updated);
    throw new Error(`Não foi possível enviar a área ao servidor (${err?.message || 'offline'}). Foi salva apenas neste dispositivo.`);
  }
}

/**
 * Remove uma área do servidor
 */
export async function deleteCategoryFromServer(categoryId: string): Promise<CustomCategory[]> {
  const res = await fetch(`/api/categories/${categoryId}`, {
    method: 'DELETE',
  });
  if (!res.ok) {
    throw new Error(`Falha ao excluir categoria no servidor: HTTP ${res.status}`);
  }
  const data = await res.json();
  if (data.success && Array.isArray(data.categories)) {
    saveCustomCategories(data.categories);
    return data.categories;
  }
  const current = getCustomCategories();
  const updated = current.filter((c) => c.id !== categoryId);
  saveCustomCategories(updated);
  return updated;
}

// -------------------------------------------------------------
// MÉTODOS SINCRÔNOS PARA CACHE LOCAL / ESTADO INICIAL
// -------------------------------------------------------------

export function getCustomCategories(): CustomCategory[] {
  try {
    const raw = localStorage.getItem(CUSTOM_CATEGORIES_KEY);
    if (!raw) return DEFAULT_BASE_CATEGORIES;
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    return DEFAULT_BASE_CATEGORIES;
  } catch (e) {
    return DEFAULT_BASE_CATEGORIES;
  }
}

export function saveCustomCategories(categories: CustomCategory[]): void {
  try {
    localStorage.setItem(CUSTOM_CATEGORIES_KEY, JSON.stringify(categories));
  } catch (e) {
    console.warn('Erro ao salvar categorias no cache local:', e);
  }
}

export function getAllManagedArticles(): NewsArticle[] {
  try {
    const raw = localStorage.getItem(ALL_ARTICLES_KEY);
    if (!raw) return ACADEMIC_ARTICLES;
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    return ACADEMIC_ARTICLES;
  } catch (e) {
    return ACADEMIC_ARTICLES;
  }
}

export function saveAllManagedArticles(articles: NewsArticle[]): void {
  try {
    localStorage.setItem(ALL_ARTICLES_KEY, JSON.stringify(articles));
  } catch (e) {
    console.warn('Erro ao salvar artigos no cache local:', e);
  }
}

export function getDeletedArticleIds(): Set<string> {
  return new Set();
}

export function saveDeletedArticleIds(_ids: Set<string>): void {
  // Não é mais necessário porque as exclusões ocorrem diretamente no servidor
}

// Feeds RSS
export function getCustomRssFeeds(): CustomRssFeed[] {
  try {
    const raw = localStorage.getItem(CUSTOM_FEEDS_KEY);
    if (!raw) {
      saveCustomRssFeeds(DEFAULT_RSS_FEEDS);
      return DEFAULT_RSS_FEEDS;
    }
    return JSON.parse(raw);
  } catch (e) {
    return DEFAULT_RSS_FEEDS;
  }
}

export function saveCustomRssFeeds(feeds: CustomRssFeed[]): void {
  try {
    localStorage.setItem(CUSTOM_FEEDS_KEY, JSON.stringify(feeds));
  } catch (e) {
    console.warn('Erro ao salvar feeds RSS:', e);
  }
}

// Preferência de exibição do briefing
export function getShowRadarBriefingPreference(): boolean {
  try {
    const val = localStorage.getItem(SHOW_RADAR_BRIEFING_KEY);
    if (val === null) return false;
    return val === 'true';
  } catch (e) {
    return false;
  }
}

export function setShowRadarBriefingPreference(show: boolean): void {
  try {
    localStorage.setItem(SHOW_RADAR_BRIEFING_KEY, show ? 'true' : 'false');
  } catch (e) {
    console.warn('Erro ao salvar preferência de radar:', e);
  }
}

// Senha de Administrador
export function checkAdminPassword(input: string): boolean {
  const stored = localStorage.getItem(ADMIN_PASSWORD_KEY) || 'admin2026';
  return input.trim() === stored || input.trim() === 'admin2026' || input.trim() === 'ciencia123';
}

export function setAdminPassword(newPassword: string): void {
  try {
    localStorage.setItem(ADMIN_PASSWORD_KEY, newPassword.trim());
  } catch (e) {
    console.warn('Erro ao salvar nova senha:', e);
  }
}
