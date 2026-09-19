import fs from 'fs';
import path from 'path';

interface ApiRequest {
  method?: string;
  body?: any;
  query?: { [key: string]: string | string[] };
}

interface ApiResponse {
  setHeader(name: string, value: string): void;
  status(code: number): {
    json(data: any): void;
    end(): void;
  };
}

// Carrega os 41 artigos padrão do arquivo caso não haja na memória
function loadInitialArticles(): any[] {
  try {
    const candidates = [
      path.join(process.cwd(), 'data', 'articles.json'),
      path.join(process.cwd(), 'data', 'articles.default.json'),
    ];
    for (const p of candidates) {
      if (fs.existsSync(p)) {
        return JSON.parse(fs.readFileSync(p, 'utf-8'));
      }
    }
  } catch (e) {
    console.error('Erro ao ler artigos iniciais:', e);
  }
  return [];
}

let storedArticles: any[] = loadInitialArticles();

export default function handler(req: ApiRequest, res: ApiResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  if (req.method === 'GET') {
    if (storedArticles.length === 0) {
      storedArticles = loadInitialArticles();
    }
    return res.status(200).json({
      success: true,
      articles: storedArticles,
      count: storedArticles.length,
      lastUpdated: Date.now(),
    });
  }

  if (req.method === 'POST') {
    const article = req.body;
    if (!article || (!article.title && !article.titlePt)) {
      return res.status(400).json({ error: 'Título do artigo é obrigatório' });
    }

    const id = article.id || `art-${Date.now()}`;
    const articleToSave = { ...article, id };
    const index = storedArticles.findIndex((a) => a.id === id);

    if (index >= 0) {
      storedArticles[index] = { ...storedArticles[index], ...articleToSave };
    } else {
      storedArticles.unshift(articleToSave);
    }

    return res.status(200).json({
      success: true,
      article: articleToSave,
      count: storedArticles.length,
      articles: storedArticles,
    });
  }

  if (req.method === 'DELETE') {
    const id = req.query ? req.query['id'] : undefined;
    if (!id) {
      return res.status(400).json({ error: 'ID do artigo não fornecido' });
    }

    storedArticles = storedArticles.filter((a) => a.id !== id);
    return res.status(200).json({
      success: true,
      id,
      articles: storedArticles,
    });
  }

  return res.status(405).json({ error: 'Método não permitido' });
}
