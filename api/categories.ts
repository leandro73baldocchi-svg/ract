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

// Lista base padrão de categorias
const DEFAULT_CATEGORIES = [
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
  { id: 'universities', label: 'Universidades (Brasil & Mundo)' }
];

// Armazenamento em memória na Vercel Serverless
let storedCategories = [...DEFAULT_CATEGORIES];

export default function handler(req: ApiRequest, res: ApiResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  if (req.method === 'GET') {
    return res.status(200).json({
      success: true,
      categories: storedCategories,
    });
  }

  if (req.method === 'POST') {
    const { id, label, isCustom } = req.body || {};
    if (!id || !label) {
      return res.status(400).json({ error: 'Identificador e nome são obrigatórios' });
    }

    const newCat = { id: String(id).trim(), label: String(label).trim(), isCustom: isCustom ?? true };
    const index = storedCategories.findIndex((c) => c.id === newCat.id);
    if (index >= 0) {
      storedCategories[index] = { ...storedCategories[index], ...newCat };
    } else {
      storedCategories.push(newCat);
    }

    return res.status(200).json({
      success: true,
      category: newCat,
      categories: storedCategories,
    });
  }

  if (req.method === 'DELETE') {
    const id = req.query ? req.query['id'] : undefined;
    if (!id || id === 'all') {
      return res.status(400).json({ error: 'ID inválido ou protegido' });
    }

    storedCategories = storedCategories.filter((c) => c.id !== id);
    return res.status(200).json({
      success: true,
      id,
      categories: storedCategories,
    });
  }

  return res.status(405).json({ error: 'Método não permitido' });
}
