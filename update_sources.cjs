const fs = require('fs');

const file = fs.readFileSync('server.ts', 'utf8');

const regex = /const SOURCES: FeedSource\[\] = \[([\s\S]*?)\];/;

const newSources = `const SOURCES: FeedSource[] = [
  // Geral e Ciência
  { name: 'Nature Journal', url: 'https://www.nature.com/nature.rss', category: 'biotech' },
  { name: 'Science Magazine', url: 'https://www.science.org/rss/news_current.xml', category: 'health' },
  
  // Educação e Universidades
  { name: 'Harvard Gazette', url: 'https://news.harvard.edu/gazette/feed/', category: 'education' },
  { name: 'Cambridge University', url: 'https://www.cam.ac.uk/research/feed', category: 'universities' },
  { name: 'Stanford News', url: 'https://news.stanford.edu/feed/', category: 'universities' },
  { name: 'MIT News', url: 'https://news.mit.edu/rss/feed', category: 'universities' },
  { name: 'UN News (ONU Global)', url: 'https://news.un.org/feed/subscribe/en/news/all/rss.xml', category: 'education' },

  // Biotecnologia & Saúde
  { name: 'Fierce Biotech', url: 'https://www.fiercebiotech.com/rss/xml', category: 'biotech' },
  { name: 'Medical Xpress', url: 'https://medicalxpress.com/rss-feed/', category: 'health' },
  { name: 'NIH News (National Institutes of Health)', url: 'https://www.nih.gov/news-events/news-releases/rss.xml', category: 'health' },
  { name: 'Phys.org Biology', url: 'https://phys.org/rss-feed/biology-news/', category: 'biotech' },

  // Física e Matemática
  { name: 'CERN Courier & Particle Physics', url: 'https://cerncourier.com/feed/', category: 'physics' },
  { name: 'Quanta Magazine (Math & Physics)', url: 'https://api.quantamagazine.org/feed/', category: 'math' },
  { name: 'Phys.org Physics', url: 'https://phys.org/rss-feed/physics-news/', category: 'physics' },
  { name: 'Phys.org Math', url: 'https://phys.org/rss-feed/science-news/mathematics/', category: 'math' },

  // Astronomia & Geologia
  { name: 'NASA Discoveries', url: 'https://www.nasa.gov/rss/dyn/breaking_news.rss', category: 'astronomy' },
  { name: 'Phys.org Astronomy', url: 'https://phys.org/rss-feed/space-news/astronomy/', category: 'astronomy' },
  { name: 'Phys.org Earth', url: 'https://phys.org/rss-feed/earth-news/geology/', category: 'geology' },
  { name: 'Space.com', url: 'https://www.space.com/feeds/all', category: 'astronomy' },

  // Tecnologia & IA
  { name: 'MIT Tech Review', url: 'https://www.technologyreview.com/feed/', category: 'tech' },
  { name: 'MIT News AI', url: 'https://news.mit.edu/rss/topic/artificial-intelligence2', category: 'ai' },
  { name: 'Wired Tech & Science', url: 'https://www.wired.com/feed/category/science/latest/rss', category: 'tech' },
  { name: 'Ars Technica Science', url: 'https://feeds.arstechnica.com/arstechnica/science', category: 'tech' },
  { name: 'Phys.org Technology', url: 'https://phys.org/rss-feed/technology-news/', category: 'tech' },
  
  // Biografias (Focando em obituários, perfis e prêmios na Ciência)
  { name: 'The Nobel Prize News', url: 'https://www.nobelprize.org/feed/', category: 'biography' },
  { name: 'Famous Scientists', url: 'https://www.famousscientists.org/feed/', category: 'biography' }
];`;

fs.writeFileSync('server.ts', file.replace(regex, newSources));
