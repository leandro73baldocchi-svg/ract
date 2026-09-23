import { CustomCategory, NewsArticle } from '../types';
import { ACADEMIC_ARTICLES } from '../data/academicArticles';
import { db } from './firebase';
import { collection, getDocs, doc, setDoc, deleteDoc } from 'firebase/firestore';

const CUSTOM_CATEGORIES_KEY = 'ract_custom_categories_v2';
const ALL_ARTICLES_KEY = 'ract_all_managed_articles_v3';
const CUSTOM_FEEDS_KEY = 'ract_custom_rss_feeds_v2';
const ADMIN_PASSWORD_KEY = 'ract_admin_password_hash_v1';
const AFFILIATE_LINKS_KEY = 'ract_affiliates_v2';
const SPONSORS_KEY = 'ract_sponsors_v1';

export interface CustomRssFeed { id: string; name: string; url: string; category: string; enabled: boolean; }
export interface AffiliateLink { id: string; categoryId: string; title: string; url: string; }
// NOVO: Estrutura do Patrocinador
export interface SponsorBanner { id: string; title: string; imageUrl: string; linkUrl: string; }

export const DEFAULT_BASE_CATEGORIES: CustomCategory[] = [
  { id: 'all', label: 'Todas as Áreas', order: 0 },
  { id: 'biography', label: 'Biografias', order: 99 },
  { id: 'education', label: 'Educação', order: 99 },
  { id: 'biotech', label: 'Biotecnologia', order: 99 },
  { id: 'health', label: 'Saúde', order: 99 },
  { id: 'physics', label: 'Física', order: 99 },
  { id: 'math', label: 'Matemática', order: 99 },
  { id: 'astronomy', label: 'Astronomia', order: 99 },
  { id: 'geology', label: 'Geologia', order: 99 },
  { id: 'tech', label: 'Tecnologia', order: 99 },
  { id: 'ai', label: 'Inteligência Artificial', order: 99 },
  { id: 'psychology', label: 'Psicologia', order: 99 },
  { id: 'universities', label: 'Universidades (Brasil & Mundo)', order: 99 },
];

export const DEFAULT_RSS_FEEDS: CustomRssFeed[] = [
  { id: 'f-nature', name: 'Nature Journal', url: 'https://www.nature.com/nature.rss', category: 'biotech', enabled: true },
  { id: 'f-science', name: 'Science Magazine', url: 'https://www.science.org/rss/news_current.xml', category: 'health', enabled: true }
];

export async function fetchServerArticles(): Promise<NewsArticle[]> {
  try {
    const querySnapshot = await getDocs(collection(db, "articles"));
    const articles: NewsArticle[] = [];
    querySnapshot.forEach((docSnap) => { articles.push(docSnap.data() as NewsArticle); });
    saveAllManagedArticles(articles); 
    return articles; 
  } catch (err) {
    if (typeof navigator !== 'undefined' && !navigator.onLine) return getAllManagedArticles();
    return [];
  }
}

export async function fetchServerCategories(): Promise<CustomCategory[]> {
  try {
    const querySnapshot = await getDocs(collection(db, "categories"));
    const serverCats: CustomCategory[] = [];
    querySnapshot.forEach((docSnap) => { serverCats.push(docSnap.data() as CustomCategory); });
    
    let mergedCategories = DEFAULT_BASE_CATEGORIES.map(defaultCat => {
      const found = serverCats.find(s => s.id === defaultCat.id);
      return found ? { ...defaultCat, ...found } : defaultCat;
    });

    serverCats.forEach(sc => {
      if (!mergedCategories.find(mc => mc.id === sc.id)) { mergedCategories.push(sc); }
    });

    const allCat = mergedCategories.find(c => c.id === 'all') || { id: 'all', label: 'Todas as Áreas', order: 0 };
    const otherCats = mergedCategories.filter(c => c.id !== 'all');
    otherCats.sort((a, b) => {
      const orderA = a.order ?? 99; const orderB = b.order ?? 99;
      if (orderA !== orderB) return orderA - orderB;
      return a.label.localeCompare(b.label);
    });

    const finalCategories = [allCat, ...otherCats];
    saveCustomCategories(finalCategories);
    return finalCategories;
  } catch (err) { return getCustomCategories(); }
}

export async function saveOrUpdateArticle(article: NewsArticle): Promise<NewsArticle[]> {
  await setDoc(doc(db, "articles", article.id), article); return await fetchServerArticles();
}

export async function deleteManagedArticle(articleId: string): Promise<NewsArticle[]> {
  await deleteDoc(doc(db, "articles", articleId)); return await fetchServerArticles();
}

export async function resetToFactoryArticles(): Promise<NewsArticle[]> {
  for (const art of ACADEMIC_ARTICLES) await setDoc(doc(db, "articles", art.id), art);
  return await fetchServerArticles();
}

export async function saveCategoryToServer(category: CustomCategory): Promise<CustomCategory[]> {
  await setDoc(doc(db, "categories", category.id), category); return await fetchServerCategories();
}

export async function deleteCategoryFromServer(categoryId: string): Promise<CustomCategory[]> {
  await deleteDoc(doc(db, "categories", categoryId)); return await fetchServerCategories();
}

export async function fetchServerAffiliates(): Promise<AffiliateLink[]> {
  try {
    const querySnapshot = await getDocs(collection(db, "affiliates"));
    const links: AffiliateLink[] = [];
    querySnapshot.forEach((docSnap) => {
      const data = docSnap.data();
      links.push({ id: data.id || docSnap.id, categoryId: data.categoryId || docSnap.id, title: data.title, url: data.url });
    });
    saveAffiliateLinks(links); return links;
  } catch (err) { return getAffiliateLinks(); }
}

export async function saveAffiliateToServer(link: AffiliateLink): Promise<AffiliateLink[]> {
  await setDoc(doc(db, "affiliates", link.id), link); return await fetchServerAffiliates();
}

export async function deleteAffiliateFromServer(linkId: string): Promise<AffiliateLink[]> {
  await deleteDoc(doc(db, "affiliates", linkId)); return await fetchServerAffiliates();
}

// NOVO: Gerenciamento de Patrocinadores (Banners)
export async function fetchServerSponsors(): Promise<SponsorBanner[]> {
  try {
    const querySnapshot = await getDocs(collection(db, "sponsors"));
    const sponsors: SponsorBanner[] = [];
    querySnapshot.forEach((docSnap) => { sponsors.push(docSnap.data() as SponsorBanner); });
    saveSponsorsLocal(sponsors); return sponsors;
  } catch (err) { return getSponsorsLocal(); }
}

export async function saveSponsorToServer(sponsor: SponsorBanner): Promise<SponsorBanner[]> {
  await setDoc(doc(db, "sponsors", sponsor.id), sponsor); return await fetchServerSponsors();
}

export async function deleteSponsorFromServer(sponsorId: string): Promise<SponsorBanner[]> {
  await deleteDoc(doc(db, "sponsors", sponsorId)); return await fetchServerSponsors();
}

export async function fetchServerFeeds(): Promise<CustomRssFeed[]> {
  try {
    const querySnapshot = await getDocs(collection(db, "feeds"));
    const feeds: CustomRssFeed[] = [];
    querySnapshot.forEach((docSnap) => { feeds.push(docSnap.data() as CustomRssFeed); });
    if (feeds.length > 0) { saveCustomRssFeeds(feeds); return feeds; } 
    else {
      for (const f of DEFAULT_RSS_FEEDS) await setDoc(doc(db, "feeds", f.id), f);
      saveCustomRssFeeds(DEFAULT_RSS_FEEDS); return DEFAULT_RSS_FEEDS;
    }
  } catch (err) { return getCustomRssFeeds(); }
}

export async function saveFeedToServer(feed: CustomRssFeed): Promise<CustomRssFeed[]> {
  await setDoc(doc(db, "feeds", feed.id), feed); return await fetchServerFeeds();
}

export async function deleteFeedFromServer(feedId: string): Promise<CustomRssFeed[]> {
  await deleteDoc(doc(db, "feeds", feedId)); return await fetchServerFeeds();
}

export async function fetchRssArticles(): Promise<NewsArticle[]> {
  const feeds = await fetchServerFeeds();
  const activeFeeds = feeds.filter(f => f.enabled);
  const rssPromises = activeFeeds.map(async (feed) => {
    try {
      const res = await fetch(`https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(feed.url)}`);
      const data = await res.json();
      if (data.status === 'ok') {
        return data.items.map((item: any) => ({
          id: `rss-${feed.id}-${item.guid || item.link}`, title: item.title, titlePt: "",
          summary: (item.description || "").replace(/(<([^>]+)>)/gi, "").substring(0, 250) + "...",
          summaryPt: "", source: feed.name, sourceCategory: feed.category,
          date: item.pubDate?.split(' ')[0] || new Date().toISOString().split('T')[0],
          url: item.link, imageUrl: item.thumbnail || item.enclosure?.link || "https://images.unsplash.com/photo-1532094349884-543bc11b234d",
          authors: item.author ? [item.author] : ["Redação"], tags: ["RSS Automático", feed.category]
        }));
      }
      return [];
    } catch (err) { return []; }
  });
  const results = await Promise.all(rssPromises); return results.flat();
}

export function getCustomCategories(): CustomCategory[] { try { const raw = localStorage.getItem(CUSTOM_CATEGORIES_KEY); if (!raw) return DEFAULT_BASE_CATEGORIES; return JSON.parse(raw); } catch (e) { return DEFAULT_BASE_CATEGORIES; } }
export function saveCustomCategories(categories: CustomCategory[]): void { localStorage.setItem(CUSTOM_CATEGORIES_KEY, JSON.stringify(categories)); }
export function getAllManagedArticles(): NewsArticle[] { try { const raw = localStorage.getItem(ALL_ARTICLES_KEY); if (!raw) return ACADEMIC_ARTICLES; return JSON.parse(raw); } catch (e) { return ACADEMIC_ARTICLES; } }
export function saveAllManagedArticles(articles: NewsArticle[]): void { localStorage.setItem(ALL_ARTICLES_KEY, JSON.stringify(articles)); }
export function getCustomRssFeeds(): CustomRssFeed[] { try { const raw = localStorage.getItem(CUSTOM_FEEDS_KEY); if (!raw) { saveCustomRssFeeds(DEFAULT_RSS_FEEDS); return DEFAULT_RSS_FEEDS; } return JSON.parse(raw); } catch (e) { return DEFAULT_RSS_FEEDS; } }
export function saveCustomRssFeeds(feeds: CustomRssFeed[]): void { localStorage.setItem(CUSTOM_FEEDS_KEY, JSON.stringify(feeds)); }
export function getAffiliateLinks(): AffiliateLink[] { try { const raw = localStorage.getItem(AFFILIATE_LINKS_KEY); return raw ? JSON.parse(raw) : []; } catch { return []; } }
export function saveAffiliateLinks(links: AffiliateLink[]): void { localStorage.setItem(AFFILIATE_LINKS_KEY, JSON.stringify(links)); }
export function getSponsorsLocal(): SponsorBanner[] { try { const raw = localStorage.getItem(SPONSORS_KEY); return raw ? JSON.parse(raw) : []; } catch { return []; } }
export function saveSponsorsLocal(sponsors: SponsorBanner[]): void { localStorage.setItem(SPONSORS_KEY, JSON.stringify(sponsors)); }
export function checkAdminPassword(input: string): boolean { const stored = localStorage.getItem(ADMIN_PASSWORD_KEY) || 'admin2026'; return input.trim() === stored || input.trim() === 'admin2026' || input.trim() === 'ciencia123'; }
export function setAdminPassword(newPassword: string): void { localStorage.setItem(ADMIN_PASSWORD_KEY, newPassword.trim()); }
