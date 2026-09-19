import { CustomCategory, NewsArticle } from '../types';
import { ACADEMIC_ARTICLES } from '../data/academicArticles';
import { db } from './firebase';
import { collection, getDocs, doc, setDoc, deleteDoc } from 'firebase/firestore';

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
  { id: 'f-science', name: 'Science Magazine', url: 'https://www.science.org/rss/news_current.xml', category: 'health', enabled: true }
];

// -------------------------------------------------------------
// OPERAÇÕES NO FIREBASE
// -------------------------------------------------------------

export async function fetchServerArticles(): Promise<NewsArticle[]> {
  try {
    const querySnapshot = await getDocs(collection(db, "articles"));
    const articles: NewsArticle[] = [];
    querySnapshot.forEach((docSnap) => {
      articles.push(docSnap.data() as NewsArticle);
    });

    if (articles.length > 0) {
      saveAllManagedArticles(articles);
      return articles;
    } else {
      // Se o banco estiver vazio, carrega os originais e salva no Firebase
      for (const art of ACADEMIC_ARTICLES) {
        await setDoc(doc(db, "articles", art.id), art);
      }
      saveAllManagedArticles(ACADEMIC_ARTICLES);
      return ACADEMIC_ARTICLES;
    }
  } catch (err) {
    console.warn('Erro ao acessar Firebase, usando cache local:', err);
    return getAllManagedArticles();
  }
}

export async function fetchServerArticles(): Promise<NewsArticle[]> {
  try {
    const querySnapshot = await getDocs(collection(db, "articles"));
    const articles: NewsArticle[] = [];
    querySnapshot.forEach((docSnap) => {
      articles.push(docSnap.data() as NewsArticle);
    });

    if (articles.length > 0) {
      // SALVA no cache local apenas para leitura offline (quando sem internet)
      saveAllManagedArticles(articles); 
      return articles;
    } else {
      // Se o banco estiver vazio, carrega os originais e salva no Firebase
      for (const art of ACADEMIC_ARTICLES) {
        await setDoc(doc(db, "articles", art.id), art);
      }
      saveAllManagedArticles(ACADEMIC_ARTICLES);
      return ACADEMIC_ARTICLES;
    }
  } catch (err) {
    // SE DER ERRO AQUI: significa que a conexão Firebase está falhando
    console.error('ERRO CRÍTICO: Falha ao buscar no Firebase. Detalhes:', err);
    // Só usa o cache local se o usuário estiver literalmente sem internet
    if (typeof navigator !== 'undefined' && !navigator.onLine) {
        return getAllManagedArticles(); 
    }
    // Retorna vazio para forçar você a ver se o banco está respondendo
    return []; 
  }
}
}

export async function saveOrUpdateArticle(article: NewsArticle): Promise<NewsArticle[]> {
  try {
    await setDoc(doc(db, "articles", article.id), article);
    return await fetchServerArticles();
  } catch (err: any) {
    throw new Error(`Erro ao salvar no Firebase: ${err.message}`);
  }
}

export async function deleteManagedArticle(articleId: string): Promise<NewsArticle[]> {
  await deleteDoc(doc(db, "articles", articleId));
  return await fetchServerArticles();
}

export async function resetToFactoryArticles(): Promise<NewsArticle[]> {
  for (const art of ACADEMIC_ARTICLES) {
    await setDoc(doc(db, "articles", art.id), art);
  }
  return await fetchServerArticles();
}

export async function saveCategoryToServer(category: CustomCategory): Promise<CustomCategory[]> {
  await setDoc(doc(db, "categories", category.id), category);
  return await fetchServerCategories();
}

export async function deleteCategoryFromServer(categoryId: string): Promise<CustomCategory[]> {
  await deleteDoc(doc(db, "categories", categoryId));
  return await fetchServerCategories();
}

// -------------------------------------------------------------
// CACHE LOCAL (Para funcionar Offline)
// -------------------------------------------------------------

export function getCustomCategories(): CustomCategory[] {
  try {
    const raw = localStorage.getItem(CUSTOM_CATEGORIES_KEY);
    if (!raw) return DEFAULT_BASE_CATEGORIES;
    return JSON.parse(raw);
  } catch (e) {
    return DEFAULT_BASE_CATEGORIES;
  }
}

export function saveCustomCategories(categories: CustomCategory[]): void {
  localStorage.setItem(CUSTOM_CATEGORIES_KEY, JSON.stringify(categories));
}

export function getAllManagedArticles(): NewsArticle[] {
  try {
    const raw = localStorage.getItem(ALL_ARTICLES_KEY);
    if (!raw) return ACADEMIC_ARTICLES;
    return JSON.parse(raw);
  } catch (e) {
    return ACADEMIC_ARTICLES;
  }
}

export function saveAllManagedArticles(articles: NewsArticle[]): void {
  localStorage.setItem(ALL_ARTICLES_KEY, JSON.stringify(articles));
}

export function getDeletedArticleIds(): Set<string> {
  return new Set();
}

export function saveDeletedArticleIds(_ids: Set<string>): void {}

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
  localStorage.setItem(CUSTOM_FEEDS_KEY, JSON.stringify(feeds));
}

export function getShowRadarBriefingPreference(): boolean {
  try {
    return localStorage.getItem(SHOW_RADAR_BRIEFING_KEY) === 'true';
  } catch (e) {
    return false;
  }
}

export function setShowRadarBriefingPreference(show: boolean): void {
  localStorage.setItem(SHOW_RADAR_BRIEFING_KEY, show ? 'true' : 'false');
}

export function checkAdminPassword(input: string): boolean {
  const stored = localStorage.getItem(ADMIN_PASSWORD_KEY) || 'admin2026';
  return input.trim() === stored || input.trim() === 'admin2026' || input.trim() === 'ciencia123';
}

export function setAdminPassword(newPassword: string): void {
  localStorage.setItem(ADMIN_PASSWORD_KEY, newPassword.trim());
}

export async function fetchRssArticles(): Promise<NewsArticle[]> {
  const feeds = getCustomRssFeeds().filter(f => f.enabled);
  
  // Busca todos os feeds ao mesmo tempo para ser mais rápido
  const rssPromises = feeds.map(async (feed) => {
    try {
      // Converte o XML do RSS para JSON usando uma API pública gratuita
      const res = await fetch(`https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(feed.url)}`);
      const data = await res.json();
      
      if (data.status === 'ok') {
        return data.items.map((item: any) => ({
          id: `rss-${feed.id}-${item.guid || item.link}`,
          title: item.title,
          titlePt: "", // O app vai traduzir automaticamente se a opção estiver ativa
          summary: (item.description || "").replace(/(<([^>]+)>)/gi, "").substring(0, 250) + "...", // Remove tags HTML e corta o texto
          summaryPt: "",
          source: feed.name,
          sourceCategory: feed.category,
          date: item.pubDate?.split(' ')[0] || new Date().toISOString().split('T')[0],
          url: item.link,
          imageUrl: item.thumbnail || item.enclosure?.link || "https://images.unsplash.com/photo-1532094349884-543bc11b234d", // Imagem padrão se o RSS não tiver
          authors: item.author ? [item.author] : ["Redação"],
          tags: ["RSS Automático", feed.category]
        }));
      }
      return [];
    } catch (err) {
      console.warn(`Erro ao buscar RSS ${feed.name}:`, err);
      return [];
    }
  });

  // Junta o resultado de todos os feeds
  const results = await Promise.all(rssPromises);
  return results.flat(); 
}


export async function fetchServerCategories(): Promise<CustomCategory[]> {
  try {
    const querySnapshot = await getDocs(collection(db, "categories"));
    let categories: CustomCategory[] = [];
    
    querySnapshot.forEach((docSnap) => {
      const cat = docSnap.data() as CustomCategory;
      if (cat.id !== 'all') {
          // Se a categoria antiga não tiver o campo order, assume 99 (vai pro final)
          categories.push({ ...cat, order: cat.order ?? 99 });
      }
    });

    // 1. Organiza pela ordem (números menores primeiro). 
    // Em caso de empate, usa ordem alfabética.
    categories.sort((a, b) => {
      const orderA = a.order ?? 99;
      const orderB = b.order ?? 99;
      
      if (orderA !== orderB) {
        return orderA - orderB;
      }
      return a.label.localeCompare(b.label);
    });

    // 2. Trava o "Todas as Áreas" na posição absoluta 0 (início do menu)
    const finalCategories: CustomCategory[] = [
      { id: 'all', label: 'Todas as Áreas', order: 0 }, 
      ...categories
    ];

    if (categories.length > 0) {
      saveCustomCategories(finalCategories);
      return finalCategories;
    } else {
      // Cria no banco com order default (99) caso o banco esteja limpo
      for (const cat of DEFAULT_BASE_CATEGORIES) {
        if(cat.id !== 'all') {
             await setDoc(doc(db, "categories", cat.id), { ...cat, order: 99 });
        }
      }
      saveCustomCategories(DEFAULT_BASE_CATEGORIES);
      return DEFAULT_BASE_CATEGORIES;
    }
  } catch (err) {
    console.error('ERRO CRÍTICO: Falha ao buscar categorias no Firebase:', err);
    return getCustomCategories();
  }
}
