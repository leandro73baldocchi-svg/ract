const fs = require('fs');

const univs = [
  { id: 'usp', name: 'Universidade de São Paulo', acronym: 'USP', region: 'Brasil', country: 'Brasil', city: 'São Paulo', founded: 1934, description: 'Maior instituição de ensino superior do Brasil.', focusAreas: ['Pesquisa Médica', 'Engenharia', 'Ciências Sociais', 'Física'] },
  { id: 'unicamp', name: 'Universidade Estadual de Campinas', acronym: 'UNICAMP', region: 'Brasil', country: 'Brasil', city: 'Campinas', founded: 1966, description: 'Principal produtora de patentes do Brasil, com forte polo tecnológico.', focusAreas: ['Física de Partículas', 'Biologia Celular', 'Engenharia Elétrica'] },
  { id: 'ufrj', name: 'Universidade Federal do Rio de Janeiro', acronym: 'UFRJ', region: 'Brasil', country: 'Brasil', city: 'Rio de Janeiro', founded: 1920, description: 'Primeira universidade do Brasil, com excelência em engenharia e ciências biológicas.', focusAreas: ['Engenharia Oceânica', 'Biotecnologia', 'Saúde Pública'] },
  { id: 'unesp', name: 'Universidade Estadual Paulista', acronym: 'UNESP', region: 'Brasil', country: 'Brasil', city: 'Múltiplas', founded: 1976, description: 'Extensa rede de campi com foco em agricultura e biociências.', focusAreas: ['Ciências Agrárias', 'Medicina Veterinária', 'Física'] },
  { id: 'ufmg', name: 'Universidade Federal de Minas Gerais', acronym: 'UFMG', region: 'Brasil', country: 'Brasil', city: 'Belo Horizonte', founded: 1927, description: 'Destaque em inteligência artificial e ciências da computação.', focusAreas: ['Computação', 'Engenharia de Software', 'Bioquímica'] },
  { id: 'impa', name: 'Instituto de Matemática Pura e Aplicada', acronym: 'IMPA', region: 'Brasil', country: 'Brasil', city: 'Rio de Janeiro', founded: 1952, description: 'Excelência em matemática, berço da medalha Fields no Brasil.', focusAreas: ['Sistemas Dinâmicos', 'Geometria Algébrica'] },
  { id: 'fiocruz', name: 'Fundação Oswaldo Cruz', acronym: 'FIOCRUZ', region: 'Brasil', country: 'Brasil', city: 'Rio de Janeiro', founded: 1900, description: 'Instituição líder em vacinas e vigilância epidemiológica na América do Sul.', focusAreas: ['Saúde Coletiva', 'Imunologia', 'Biologia Molecular'] },
  { id: 'ufrgs', name: 'Universidade Federal do Rio Grande do Sul', acronym: 'UFRGS', region: 'Brasil', country: 'Brasil', city: 'Porto Alegre', founded: 1934, description: 'Excelência no sul do país em ciências exatas e da saúde.', focusAreas: ['Física Teórica', 'Medicina'] },
  { id: 'ita', name: 'Instituto Tecnológico de Aeronáutica', acronym: 'ITA', region: 'Brasil', country: 'Brasil', city: 'São José dos Campos', founded: 1950, description: 'Referência militar e civil em engenharia aeroespacial.', focusAreas: ['Engenharia Aeroespacial', 'Computação Quântica'] },
  { id: 'ufsc', name: 'Universidade Federal de Santa Catarina', acronym: 'UFSC', region: 'Brasil', country: 'Brasil', city: 'Florianópolis', founded: 1960, description: 'Forte presença em engenharia mecânica e aquicultura.', focusAreas: ['Engenharia Mecânica', 'Ciências do Mar'] },
  { id: 'ufpe', name: 'Universidade Federal de Pernambuco', acronym: 'UFPE', region: 'Brasil', country: 'Brasil', city: 'Recife', founded: 1946, description: 'Referência no Nordeste em informática e medicina tropical.', focusAreas: ['Informática', 'Medicina Tropical'] },
  { id: 'unifesp', name: 'Universidade Federal de São Paulo', acronym: 'UNIFESP', region: 'Brasil', country: 'Brasil', city: 'São Paulo', founded: 1933, description: 'Tradição e excelência no ensino e pesquisa médica.', focusAreas: ['Ciências da Saúde', 'Neurociência'] },
  { id: 'unb', name: 'Universidade de Brasília', acronym: 'UnB', region: 'Brasil', country: 'Brasil', city: 'Brasília', founded: 1962, description: 'Polo científico do centro-oeste.', focusAreas: ['Geologia', 'Relações Internacionais'] },
  { id: 'ufpr', name: 'Universidade Federal do Paraná', acronym: 'UFPR', region: 'Brasil', country: 'Brasil', city: 'Curitiba', founded: 1912, description: 'A mais antiga universidade do Brasil.', focusAreas: ['Ciências Agrárias', 'Química'] },
  { id: 'ufscar', name: 'Universidade Federal de São Carlos', acronym: 'UFSCar', region: 'Brasil', country: 'Brasil', city: 'São Carlos', founded: 1968, description: 'Excelência em ciências dos materiais e tecnologia.', focusAreas: ['Engenharia de Materiais', 'Biotecnologia'] },

  // International
  { id: 'mit', name: 'Massachusetts Institute of Technology', acronym: 'MIT', region: 'Internacional', country: 'EUA', city: 'Cambridge', founded: 1861, description: 'Líder em tecnologia, robótica e IA.', focusAreas: ['IA', 'Física Quântica', 'Engenharia'] },
  { id: 'stanford', name: 'Stanford University', acronym: 'Stanford', region: 'Internacional', country: 'EUA', city: 'Stanford', founded: 1885, description: 'Coração intelectual do Vale do Silício.', focusAreas: ['Ciências da Computação', 'Biotecnologia'] },
  { id: 'harvard', name: 'Harvard University', acronym: 'Harvard', region: 'Internacional', country: 'EUA', city: 'Cambridge', founded: 1636, description: 'Maior endowment do mundo e líder em diversas áreas de pesquisa.', focusAreas: ['Biomedicina', 'Direito', 'Educação'] },
  { id: 'cambridge', name: 'University of Cambridge', acronym: 'Cambridge', region: 'Internacional', country: 'Reino Unido', city: 'Cambridge', founded: 1209, description: 'Casa de Newton e Darwin.', focusAreas: ['Física Teórica', 'Matemática'] },
  { id: 'oxford', name: 'University of Oxford', acronym: 'Oxford', region: 'Internacional', country: 'Reino Unido', city: 'Oxford', founded: 1096, description: 'A universidade de língua inglesa mais antiga do mundo.', focusAreas: ['Medicina', 'Humanidades', 'Física'] },
  { id: 'eth-zurich', name: 'ETH Zurich', acronym: 'ETH', region: 'Internacional', country: 'Suíça', city: 'Zurique', founded: 1855, description: 'Onde Einstein estudou; excelência em física e engenharia.', focusAreas: ['Engenharia', 'Matemática'] },
  { id: 'sorbonne', name: 'Sorbonne Université', acronym: 'Sorbonne', region: 'Internacional', country: 'França', city: 'Paris', founded: 1257, description: 'Herança de Marie Curie.', focusAreas: ['Matemática', 'Física', 'Biologia'] },
  { id: 'u-tokyo', name: 'University of Tokyo', acronym: 'UTokyo', region: 'Internacional', country: 'Japão', city: 'Tóquio', founded: 1877, description: 'Pioneira em pesquisa asiática, robótica e física quântica.', focusAreas: ['Física', 'Engenharia Mecânica'] },
  { id: 'princeton', name: 'Princeton University', acronym: 'Princeton', region: 'Internacional', country: 'EUA', city: 'Princeton', founded: 1746, description: 'Famosa pelo Institute for Advanced Study.', focusAreas: ['Matemática Pura', 'Astrofísica'] },
  { id: 'caltech', name: 'California Institute of Technology', acronym: 'Caltech', region: 'Internacional', country: 'EUA', city: 'Pasadena', founded: 1891, description: 'Responsável pelo JPL e inovações em gravitação.', focusAreas: ['Astronomia', 'Física'] },
  { id: 'yale', name: 'Yale University', acronym: 'Yale', region: 'Internacional', country: 'EUA', city: 'New Haven', founded: 1701, description: 'Excelente em pesquisa jurídica, ambiental e biológica.', focusAreas: ['Ciências Ambientais', 'Direito'] },
  { id: 'uchicago', name: 'University of Chicago', acronym: 'UChicago', region: 'Internacional', country: 'EUA', city: 'Chicago', founded: 1890, description: 'Múltiplos Prêmios Nobel em Economia e Física.', focusAreas: ['Física Nuclear', 'Economia'] },
  { id: 'columbia', name: 'Columbia University', acronym: 'Columbia', region: 'Internacional', country: 'EUA', city: 'New York', founded: 1754, description: 'Inovações em neurociências e medicina.', focusAreas: ['Neurociência', 'Jornalismo Científico'] },
  { id: 'upenn', name: 'University of Pennsylvania', acronym: 'UPenn', region: 'Internacional', country: 'EUA', city: 'Philadelphia', founded: 1740, description: 'Pioneira no desenvolvimento de terapias genéticas.', focusAreas: ['Biotecnologia', 'Ciências Cognitivas'] },
  { id: 'johns-hopkins', name: 'Johns Hopkins University', acronym: 'JHU', region: 'Internacional', country: 'EUA', city: 'Baltimore', founded: 1876, description: 'Principal instituição de pesquisa médica dos EUA.', focusAreas: ['Medicina', 'Saúde Pública', 'Bioengenharia'] },
  { id: 'imperial-college', name: 'Imperial College London', acronym: 'Imperial', region: 'Internacional', country: 'Reino Unido', city: 'London', founded: 1907, description: 'Extrema força em ciências físicas, engenharia e medicina.', focusAreas: ['Engenharia', 'Infectologia'] },
  { id: 'ucl', name: 'University College London', acronym: 'UCL', region: 'Internacional', country: 'Reino Unido', city: 'London', founded: 1826, description: 'Potência global em saúde e ciência e tecnologia.', focusAreas: ['Neurociência', 'Física Astrofísica'] },
  { id: 'epfl', name: 'École Polytechnique Fédérale de Lausanne', acronym: 'EPFL', region: 'Internacional', country: 'Suíça', city: 'Lausanne', founded: 1853, description: 'Parceira da ETH, forte em tecnologia da informação e robótica.', focusAreas: ['Ciências da Computação', 'Microtécnica'] },
  { id: 'tsinghua', name: 'Tsinghua University', acronym: 'Tsinghua', region: 'Internacional', country: 'China', city: 'Beijing', founded: 1911, description: 'Potência em engenharia civil e ciências exatas.', focusAreas: ['Engenharia', 'Ciência dos Materiais'] },
  { id: 'peking', name: 'Peking University', acronym: 'PKU', region: 'Internacional', country: 'China', city: 'Beijing', founded: 1898, description: 'Líder em ciências puras e pesquisa biológica na China.', focusAreas: ['Física', 'Biologia Estrutural'] },
  { id: 'nus', name: 'National University of Singapore', acronym: 'NUS', region: 'Internacional', country: 'Singapura', city: 'Singapura', founded: 1905, description: 'A melhor universidade da Ásia, forte em IA.', focusAreas: ['Engenharia Química', 'Sistemas de Informação'] },
  { id: 'ntu', name: 'Nanyang Technological University', acronym: 'NTU', region: 'Internacional', country: 'Singapura', city: 'Singapura', founded: 1981, description: 'Avanços em nanotecnologia e materiais de energia.', focusAreas: ['Nanotecnologia', 'Inteligência Artificial'] },
  { id: 'kaist', name: 'KAIST', acronym: 'KAIST', region: 'Internacional', country: 'Coreia do Sul', city: 'Daejeon', founded: 1971, description: 'A espinha dorsal tecnológica da Coreia do Sul.', focusAreas: ['Microeletrônica', 'Biotecnologia'] },
  { id: 'sydney', name: 'University of Sydney', acronym: 'USyd', region: 'Internacional', country: 'Austrália', city: 'Sydney', founded: 1850, description: 'Excelência australiana em pesquisa antártica e médica.', focusAreas: ['Medicina de Precisão', 'Sustentabilidade'] },
  { id: 'melbourne', name: 'University of Melbourne', acronym: 'Unimelb', region: 'Internacional', country: 'Austrália', city: 'Melbourne', founded: 1853, description: 'Centro global de engenharia de software e imunologia.', focusAreas: ['Imunologia', 'Informática Quântica'] },
  { id: 'toronto', name: 'University of Toronto', acronym: 'UofT', region: 'Internacional', country: 'Canadá', city: 'Toronto', founded: 1827, description: 'Berço do aprendizado profundo (Deep Learning).', focusAreas: ['Machine Learning', 'Bioquímica'] },
  { id: 'ubc', name: 'University of British Columbia', acronym: 'UBC', region: 'Internacional', country: 'Canadá', city: 'Vancouver', founded: 1908, description: 'Referência em física de partículas subatômicas.', focusAreas: ['Física Experimental', 'Engenharia Florestal'] },
  { id: 'mcgill', name: 'McGill University', acronym: 'McGill', region: 'Internacional', country: 'Canadá', city: 'Montreal', founded: 1821, description: 'Instituição líder no Canadá em pesquisa médica.', focusAreas: ['Neurologia', 'Genética'] },
  { id: 'munich', name: 'Technical University of Munich', acronym: 'TUM', region: 'Internacional', country: 'Alemanha', city: 'Munique', founded: 1868, description: 'Forte presença em engenharia mecânica e astrofísica.', focusAreas: ['Astrofísica', 'Engenharia Automotiva'] },
  { id: 'lmu', name: 'LMU Munich', acronym: 'LMU', region: 'Internacional', country: 'Alemanha', city: 'Munique', founded: 1472, description: 'Ciência puras de excelência na Europa.', focusAreas: ['Física Quântica', 'Humanidades'] },
  { id: 'heidelberg', name: 'Heidelberg University', acronym: 'Heidelberg', region: 'Internacional', country: 'Alemanha', city: 'Heidelberg', founded: 1386, description: 'Uma das mais antigas e fortes em ciências biomédicas.', focusAreas: ['Ciências Médicas', 'Física Computacional'] },
  { id: 'kuleuven', name: 'KU Leuven', acronym: 'KU Leuven', region: 'Internacional', country: 'Bélgica', city: 'Leuven', founded: 1425, description: 'A universidade mais inovadora da Europa.', focusAreas: ['Microeletrônica (IMEC)', 'Medicina'] },
  { id: 'delft', name: 'Delft University of Technology', acronym: 'TU Delft', region: 'Internacional', country: 'Holanda', city: 'Delft', founded: 1842, description: 'Centro mundial de pesquisa em águas e arquitetura.', focusAreas: ['Engenharia Civil', 'Computação Quântica'] },
  { id: 'kth', name: 'KTH Royal Institute of Technology', acronym: 'KTH', region: 'Internacional', country: 'Suécia', city: 'Estocolmo', founded: 1827, description: 'O maior instituto de pesquisa técnica da Suécia.', focusAreas: ['Engenharia Elétrica', 'Materiais Inovadores'] },
  { id: 'copenhagen', name: 'University of Copenhagen', acronym: 'UCPH', region: 'Internacional', country: 'Dinamarca', city: 'Copenhagen', founded: 1479, description: 'Casa do Instituto Niels Bohr para a física teórica.', focusAreas: ['Física Teórica Quântica', 'Biologia Sintética'] },
];

let output = `export interface University {
  id: string;
  name: string;
  acronym: string;
  region: 'Brasil' | 'Internacional';
  country: string;
  city: string;
  founded: number;
  description: string;
  officialUrl: string;
  researchUrl: string;
  digitalLibraryUrl: string;
  focusAreas: string[];
}

export const UNIVERSITIES_DIRECTORY: University[] = [
`;

univs.forEach(u => {
  const domain = u.acronym.toLowerCase().replace(/ /g, '');
  output += `  {
    id: '${u.id}',
    name: '${u.name}',
    acronym: '${u.acronym}',
    region: '${u.region}',
    country: '${u.country}',
    city: '${u.city}',
    founded: ${u.founded},
    description: '${u.description}',
    officialUrl: 'https://www.${domain}.edu',
    researchUrl: 'https://research.${domain}.edu',
    digitalLibraryUrl: 'https://library.${domain}.edu',
    focusAreas: ${JSON.stringify(u.focusAreas)},
  },
`;
});

output += `];\n`;

fs.writeFileSync('src/data/universities.ts', output);
console.log('Universities written: ' + univs.length);
