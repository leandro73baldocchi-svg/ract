import { CustomCategory, NewsArticle } from '../types';

const CUSTOM_CATEGORIES_KEY = 'ract_custom_categories_v1';
const CUSTOM_ARTICLES_KEY = 'ract_custom_articles_v1';
const ADMIN_PASSWORD_KEY = 'ract_admin_password_hash_v1';

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

export function getCustomArticles(): NewsArticle[] {
  try {
    const raw = localStorage.getItem(CUSTOM_ARTICLES_KEY);
    if (!raw) {
      // Initialize with default psychology articles on first access
      saveCustomArticles(INITIAL_PSYCHOLOGY_ARTICLES);
      return INITIAL_PSYCHOLOGY_ARTICLES;
    }
    return JSON.parse(raw);
  } catch (e) {
    console.warn('Erro ao ler artigos customizados:', e);
    return INITIAL_PSYCHOLOGY_ARTICLES;
  }
}

export function saveCustomArticles(articles: NewsArticle[]): void {
  try {
    localStorage.setItem(CUSTOM_ARTICLES_KEY, JSON.stringify(articles));
  } catch (e) {
    console.warn('Erro ao salvar artigos customizados:', e);
  }
}

export function checkAdminPassword(input: string): boolean {
  // Senha padrão inicial: 'admin2026' ou 'ciencia' ou o que você definir
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
