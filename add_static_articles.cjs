const fs = require('fs');
let file = fs.readFileSync('src/data/academicArticles.ts', 'utf8');

// Find the last closing bracket of the array
const endIndex = file.lastIndexOf('];');

if (endIndex !== -1) {
  const newArticles = `
  // ==========================================
  // BIOGRAFIAS E PERFIS HISTÓRICOS
  // ==========================================
  {
    id: 'bio-01-marie-curie',
    title: 'Marie Sklodowska-Curie: The Radiating Legacy of a Double Nobel Laureate',
    titlePt: 'Marie Sklodowska-Curie: O Legado Radiante de uma Dupla Laureada com o Nobel',
    source: 'Historical Science Profiles',
    sourceCategory: 'biography',
    articleType: 'biography',
    link: 'https://scholar.google.com/scholar?q=Marie+Curie+Biography',
    pubDate: '10 Fev 2026',
    summary: 'A comprehensive biographical review of Marie Curie\\'s foundational work in radioactivity and its enduring impact on both physics and modern medicine.',
    summaryPt: 'Uma revisão biográfica abrangente do trabalho fundamental de Marie Curie na radioatividade e seu impacto duradouro tanto na física quanto na medicina moderna.',
    author: 'Elise G. Richards',
    readTime: '12 min',
    tags: ['Biography', 'Physics', 'Nobel Prize', 'Radioactivity']
  },
  {
    id: 'bio-02-turing',
    title: 'Alan Turing: The Enigma of Computation and Artificial Intelligence',
    titlePt: 'Alan Turing: O Enigma da Computação e Inteligência Artificial',
    source: 'Turing Archive Institute',
    sourceCategory: 'biography',
    articleType: 'biography',
    link: 'https://scholar.google.com/scholar?q=Alan+Turing+Biography',
    pubDate: '05 Jan 2026',
    summary: 'Tracing the life of Alan Turing, from his wartime codebreaking to laying the mathematical groundwork for what would become modern computer science and AI.',
    summaryPt: 'Traçando a vida de Alan Turing, desde a quebra de códigos na guerra até o estabelecimento das bases matemáticas do que viria a ser a ciência da computação moderna e IA.',
    author: 'J. Hodges',
    readTime: '15 min',
    tags: ['Biography', 'Computer Science', 'AI']
  },

  // ==========================================
  // BIOTECNOLOGIA
  // ==========================================
  {
    id: 'biotech-01-crispr',
    title: 'CRISPR-Cas9 Enhancements: Minimizing Off-Target Effects in Human Genomic Editing',
    titlePt: 'Melhorias no CRISPR-Cas9: Minimizando Efeitos Fora de Alvo na Edição Genômica Humana',
    source: 'Journal of Biotech Research',
    sourceCategory: 'biotech',
    articleType: 'paper',
    link: 'https://scholar.google.com/scholar?q=CRISPR+Cas9',
    pubDate: '12 Mar 2026',
    summary: 'Recent modifications to the Cas9 enzyme structure have shown a 98% reduction in off-target genetic mutations, paving the way for safer clinical therapeutics.',
    summaryPt: 'Modificações recentes na estrutura da enzima Cas9 mostraram uma redução de 98% nas mutações genéticas fora do alvo, abrindo caminho para terapias clínicas mais seguras.',
    author: 'Dr. Sarah Chen',
    readTime: '9 min',
    tags: ['Biotech', 'Genetics', 'CRISPR']
  },

  // ==========================================
  // ASTRONOMIA & GEOLOGIA
  // ==========================================
  {
    id: 'astro-01-james-webb',
    title: 'JWST Early Observations: Atmospheric Characterization of Exoplanet K2-18b',
    titlePt: 'Observações Iniciais do JWST: Caracterização Atmosférica do Exoplaneta K2-18b',
    source: 'Astrophysics Journal',
    sourceCategory: 'astronomy',
    articleType: 'research',
    link: 'https://scholar.google.com/scholar?q=JWST+K2-18b',
    pubDate: '22 Abr 2026',
    summary: 'Spectroscopic data from the James Webb Space Telescope reveals robust carbon-bearing molecules in the habitable-zone exoplanet K2-18b.',
    summaryPt: 'Dados espectroscópicos do Telescópio Espacial James Webb revelam robustas moléculas portadoras de carbono no exoplaneta K2-18b, localizado na zona habitável.',
    author: 'H. Jenkins et al.',
    readTime: '11 min',
    tags: ['Astronomy', 'Exoplanets', 'JWST']
  },
  {
    id: 'geo-01-mantle',
    title: 'Deep Mantle Plumes and the Formation of Large Igneous Provinces',
    titlePt: 'Plumas Mantélicas Profundas e a Formação de Grandes Províncias Ígneas',
    source: 'Geoscience Reports',
    sourceCategory: 'geology',
    articleType: 'paper',
    link: 'https://scholar.google.com/scholar?q=Mantle+Plumes',
    pubDate: '01 Fev 2026',
    summary: 'New seismic tomography models map the ascent of lower mantle plumes, providing a cohesive link to surface volcanic activity over millions of years.',
    summaryPt: 'Novos modelos de tomografia sísmica mapeiam a ascensão de plumas do manto inferior, fornecendo uma ligação coesa com a atividade vulcânica de superfície ao longo de milhões de anos.',
    author: 'K. R. Nakamura',
    readTime: '8 min',
    tags: ['Geology', 'Seismology', 'Volcanology']
  },

  // ==========================================
  // INTELIGÊNCIA ARTIFICIAL E UNIVERSIDADES
  // ==========================================
  {
    id: 'ai-01-llm',
    title: 'Emergent Reasoning Capabilities in Highly Scaled Transformer Models',
    titlePt: 'Capacidades Emergentes de Raciocínio em Modelos Transformer Altamente Escalados',
    source: 'AI Research Quarterly',
    sourceCategory: 'ai',
    articleType: 'research',
    link: 'https://scholar.google.com/scholar?q=Emergent+Reasoning+LLM',
    pubDate: '15 Mai 2026',
    summary: 'Investigating the threshold at which large language models begin to exhibit zero-shot logical inference without explicit structural training.',
    summaryPt: 'Investigando o limite no qual grandes modelos de linguagem começam a exibir inferência lógica zero-shot sem treinamento estrutural explícito.',
    author: 'DeepAI Group',
    readTime: '14 min',
    tags: ['AI', 'Machine Learning', 'Transformers']
  },
  {
    id: 'uni-01-oxford',
    title: 'Oxford Interdisciplinary Initiative on Sustainable Material Sciences',
    titlePt: 'Iniciativa Interdisciplinar de Oxford sobre Ciências de Materiais Sustentáveis',
    source: 'Oxford Academic Press',
    sourceCategory: 'universities',
    articleType: 'news',
    link: 'https://scholar.google.com/scholar?q=Oxford+Sustainable+Materials',
    pubDate: '28 Fev 2026',
    summary: 'A new collegiate effort combining chemistry, engineering, and economics to develop biodegradable alternatives to commercial polymers.',
    summaryPt: 'Um novo esforço universitário combinando química, engenharia e economia para desenvolver alternativas biodegradáveis aos polímeros comerciais.',
    author: 'University Affairs',
    readTime: '5 min',
    tags: ['Universities', 'Sustainability', 'Materials']
  }
`;

  file = file.substring(0, endIndex) + newArticles + file.substring(endIndex);
  fs.writeFileSync('src/data/academicArticles.ts', file);
}
