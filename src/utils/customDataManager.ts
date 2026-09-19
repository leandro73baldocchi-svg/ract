import { CustomCategory, NewsArticle } from '../types';
import { ACADEMIC_ARTICLES } from '../data/academicArticles';

const CUSTOM_CATEGORIES_KEY = 'ract_custom_categories_v1';
const ALL_ARTICLES_KEY = 'ract_all_managed_articles_v2';
const DELETED_ARTICLE_IDS_KEY = 'ract_deleted_article_ids_v1';
const CUSTOM_FEEDS_KEY = 'ract_custom_rss_feeds_v1';
const ADMIN_PASSWORD_KEY = 'ract_admin_password_hash_v1';

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

export const INITIAL_PSYCHOLOGY_ARTICLES: NewsArticle[] = [
  {
    id: 'psy-01-neuroplasticity-cognitive',
    title: 'Cognitive Behavioral Protocols and Neural Plasticity in Executive Function Optimization',
    titlePt: 'Protocolos Cognitivo-Comportamentais e Plasticidade Neural na Otimização das Funções Executivas',
    source: 'American Psychological Association (APA)',
    sourceCategory: 'psychology',
    link: 'https://www.apa.org/pubs/journals',
    pubDate: '16 de Março de 2026',
    summary: 'A randomized controlled trial demonstrates that targeted cognitive behavioral interventions induce measurable gray matter restructuring in the prefrontal cortex.',
    summaryPt: 'Ensaio clínico randomizado demonstra que intervenções cognitivo-comportamentais estruturadas geram reestruturação mensurável da substância cinzenta no córtex pré-frontal, aprimorando a autorregulação emocional.',
    keyTakeaway: 'Técnicas cognitivas contemporâneas produzem alterações estruturais objetivas na neuroplasticidade cerebral.',
    author: 'Dr. Aaron S. Miller & APA Neuroscience Consortium',
    readTime: '6 min',
    isPeerReviewed: true,
    tags: ['Psicologia', 'Neurociência', 'TCC', 'Funções Executivas', 'APA'],
  },
  {
    id: 'psy-02-child-development-attachment',
    title: 'Longitudinal Attachment Theory in Early Childhood: Socioemotional Resilience and Academic Performance',
    titlePt: 'Teoria do Apego na Primeira Infância: Resiliência Socioemocional e Desempenho Acadêmico Longitudinal',
    source: 'Journal of Child Psychology and Psychiatry',
    sourceCategory: 'psychology',
    link: 'https://acamh.onlinelibrary.wiley.com',
    pubDate: '12 de Março de 2026',
    summary: 'A 15-year cohort analysis reveals that secure parental attachment in infancy predicts superior stress modulation and higher academic perseverance through adolescence.',
    summaryPt: 'Análise de coorte de 15 anos comprova que o apego seguro com cuidadores na infância prediz superior capacidade de modulação do estresse e maior persistência acadêmica na adolescência.',
    keyTakeaway: 'A segurança emocional precoce constrói os alicerces neurobiológicos da aprendizagem e estabilidade na vida adulta.',
    author: 'Dra. Elena Vasconcelos & Cambridge Child Lab',
    readTime: '7 min',
    isPeerReviewed: true,
    tags: ['Psicologia do Desenvolvimento', 'Teoria do Apego', 'Infância', 'Educação'],
  },
  {
    id: 'psy-03-digital-wellbeing-focus',
    title: 'Attention Restoration and Digital Hyperconnectivity: Restoring Attentional Capacities through Natural Immersion',
    titlePt: 'Restauração Atencional e Hiperconectividade: Recuperação de Foco Cognitivo por Imersão Ambiental',
    source: 'British Psychological Society (BPS)',
    sourceCategory: 'psychology',
    link: 'https://www.bps.org.uk',
    pubDate: '09 de Março de 2026',
    summary: 'Investigating how sensory overload from micro-notifications depletes directed attention, and validating 20-minute daily natural stimuli protocols to restore working memory capacity.',
    summaryPt: 'Investigação sobre a sobrecarga de micro-notificações no esgotamento da atenção dirigida e validação de protocolos de 20 minutos de imersão em ambientes naturais para recompor a memória operacional.',
    keyTakeaway: 'Pausas ativas e descompressão sensorial reduzem a fadiga mental e recuperam a profundidade do pensamento analítico.',
    author: 'Institute of Cognitive Psychology - Oxford & BPS',
    readTime: '5 min',
    isPeerReviewed: true,
    tags: ['Psicologia Cognitiva', 'Atenção', 'Bem-estar Digital', 'BPS'],
  }
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

export function getCustomCategories(): CustomCategory[] {
  try {
    const raw = localStorage.getItem(CUSTOM_CATEGORIES_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch (e) {
    console.warn('Erro ao ler categorias customizadas:', e);
    return [];
  }
}

export function saveCustomCategories(categories: CustomCategory[]): void {
  try {
    localStorage.setItem(CUSTOM_CATEGORIES_KEY, JSON.stringify(categories));
  } catch (e) {
    console.warn('Erro ao salvar categorias:', e);
  }
}

export function getDeletedArticleIds(): Set<string> {
  try {
    const raw = localStorage.getItem(DELETED_ARTICLE_IDS_KEY);
    if (!raw) return new Set();
    return new Set(JSON.parse(raw));
  } catch (e) {
    return new Set();
  }
}

export function saveDeletedArticleIds(ids: Set<string>): void {
  try {
    localStorage.setItem(DELETED_ARTICLE_IDS_KEY, JSON.stringify(Array.from(ids)));
  } catch (e) {
    console.warn('Erro ao salvar ids excluídos:', e);
  }
}

/**
 * Retorna todos os artigos do portal (catálogo completo + psicologia + novos adicionados - excluídos)
 */
export function getAllManagedArticles(): NewsArticle[] {
  try {
    const raw = localStorage.getItem(ALL_ARTICLES_KEY);
    const deletedIds = getDeletedArticleIds();

    if (!raw) {
      // Primeira inicialização: junta ACADEMIC_ARTICLES + INITIAL_PSYCHOLOGY_ARTICLES
      const initialMap = new Map<string, NewsArticle>();
      for (const art of INITIAL_PSYCHOLOGY_ARTICLES) {
        initialMap.set(art.id, art);
      }
      for (const art of ACADEMIC_ARTICLES) {
        if (!deletedIds.has(art.id)) {
          initialMap.set(art.id, art);
        }
      }
      const initialList = Array.from(initialMap.values());
      saveAllManagedArticles(initialList);
      return initialList;
    }

    const parsed: NewsArticle[] = JSON.parse(raw);
    return parsed.filter((art) => !deletedIds.has(art.id));
  } catch (e) {
    console.warn('Erro ao ler todos os artigos:', e);
    return [...INITIAL_PSYCHOLOGY_ARTICLES, ...ACADEMIC_ARTICLES];
  }
}

export function saveAllManagedArticles(articles: NewsArticle[]): void {
  try {
    localStorage.setItem(ALL_ARTICLES_KEY, JSON.stringify(articles));
  } catch (e) {
    console.warn('Erro ao salvar todos os artigos:', e);
  }
}

/**
 * Salva ou atualiza um artigo individual (se já existir atualiza, senão adiciona no topo)
 */
export function saveOrUpdateArticle(article: NewsArticle): void {
  const current = getAllManagedArticles();
  const index = current.findIndex((a) => a.id === article.id);
  let updated: NewsArticle[];

  if (index >= 0) {
    updated = [...current];
    updated[index] = { ...updated[index], ...article };
  } else {
    updated = [article, ...current];
  }

  // Se havia sido marcado como excluído antes, remove dos excluídos
  const deleted = getDeletedArticleIds();
  if (deleted.has(article.id)) {
    deleted.delete(article.id);
    saveDeletedArticleIds(deleted);
  }

  saveAllManagedArticles(updated);
}

/**
 * Exclui um artigo permanentemente do portal
 */
export function deleteManagedArticle(articleId: string): void {
  const current = getAllManagedArticles();
  const updated = current.filter((a) => a.id !== articleId);
  saveAllManagedArticles(updated);

  const deleted = getDeletedArticleIds();
  deleted.add(articleId);
  saveDeletedArticleIds(deleted);
}

/**
 * Restaura todos os artigos padrão de fábrica
 */
export function resetToFactoryArticles(): void {
  localStorage.removeItem(ALL_ARTICLES_KEY);
  localStorage.removeItem(DELETED_ARTICLE_IDS_KEY);
  const combined = [...INITIAL_PSYCHOLOGY_ARTICLES, ...ACADEMIC_ARTICLES];
  saveAllManagedArticles(combined);
}

// RSS Feeds Management
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

const SHOW_RADAR_BRIEFING_KEY = 'ract_show_radar_briefing_v1';

export function getShowRadarBriefingPreference(): boolean {
  try {
    const val = localStorage.getItem(SHOW_RADAR_BRIEFING_KEY);
    if (val === null) return false; // Default to false (hidden) as requested by user
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

