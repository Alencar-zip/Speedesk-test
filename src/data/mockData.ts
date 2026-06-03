import { Product, Transaction } from '../types';

export const mockProducts: Product[] = [
  {
    id: 1,
    title: "Quantum Pitch Deck",
    format: "PPTX",
    price: 1250.00,
    category: "Slides",
    img: "https://lh3.googleusercontent.com/aida-public/AB6AXuAuoEugjmSopUyUtAwG0-zss0p7RzRcvfHLOU0wx9imP7yj7Z57OHzUUq38ct7Nmrl2ZCcVFof79aVBjFpriVydBh_NFeGFnB5ilo7u85_SzuuHtKHczwZrfLGH6-4Feqimr7obtmqOCVrI8g2B7-lYcwvscuM0iDmnMqvjg5EMUsPDGr0c7PCPp0PxVUP7pa_LADIXbacjo1QE9GTx7a_S1oiKM9TjJMt_0WGL_RKkm5EgCDoNdPFEaRtLcz43Y7wTDBeU6ZFi6w",
    creator: "Speedesk Studio",
    description: "Eleve seu pitch com layouts cibernéticos de alta fidelidade e visualização de dados glassmórfica.",
    longDescription: "Projetado especificamente para a próxima geração de startups disruptivas de deep tech, o Quantum Pitch Deck aproveita os princípios do glassmorfismo sobre uma base de ardósia profunda e brilhos aetheric. O pacote conta com layouts responsivos de tabelas, cronogramas de desenvolvimento técnico e projeções bento-grid excepcionalmente polidas para atrair capital de risco com clareza cristalina.",
    features: [
      "Mais de 60 slides mestre exclusivos e responsivos",
      "Diagramas vetoriais de fluxo de dados de alta precisão",
      "Infográficos de finanças e investimentos prontos",
      "Camadas de animação de transição fluida nativas"
    ],
    specs: {
      resolution: "1920x1080 (16:9)",
      software: "PowerPoint",
      size: "42.8 MB",
      updates: "Gratuitas Vitalícias",
      slidesCount: "64",
      fileFormat: ".pptx"
    },
    rating: 4.9,
    downloads: 342,
    views: 1845
  },
  {
    id: 2,
    title: "Nexus Strategy Presentation",
    format: "KEYNOTE",
    price: 850.00,
    category: "Slides",
    img: "https://lh3.googleusercontent.com/aida-public/AB6AXuCM1Hz1H6ynJIWJKCrOwNTXgYoI634qu_ys5SPkklO1NRVumHHTCLtXnsi2OpjVeocz0fvSji7Wyupu9VLO72T2xHCtIFZU3Uqh0WmBy_53ubXFWFSUDq3gthM5ahI33aiKsMhofdhVaMq7LeEuFojCxoxp5-L3j8rCz6wvaczWYBwKNmMh2ay_sFPiINZvm6vnqqqaP4ldpaRuHay00V96ISArZHyen1sb9vrPkeuP3_dDAzAPB7o8Ut4t7qicR21Qblwm84nNLA",
    creator: "Nexus Design Corp",
    description: "Layouts corporativos futuristas ideais para planejamento estratégico e relatórios quadrimestrais rústicos.",
    longDescription: "O Nexus Strategy traz uma paleta refinada de neon cobalto e prata espacial para dar seriedade e sofisticação às suas reuniões trimestrais. São grades perfeitamente alinhadas a um design minimalista que elimina o supérfluo e coloca os KPIs em foco total.",
    features: [
      "45 slides estruturados para relatórios de KPI e OKR",
      "Paleta cromática secundária cinza metálico",
      "Componentes de diagramação 3D estilizados no estilo pixel linear",
      "Instruções fáceis para importação no Keynote"
    ],
    specs: {
      resolution: "3840x2160 (Ultra-HD)",
      software: "Apple Keynote",
      size: "28.1 MB",
      updates: "1 ano incluído",
      slidesCount: "45",
      fileFormat: ".key"
    },
    rating: 4.7,
    downloads: 189,
    views: 942
  },
  {
    id: 3,
    title: "DataViz Dashboard UI Kit",
    format: "FIGMA",
    price: 1500.00,
    category: "UI Kit",
    img: "https://lh3.googleusercontent.com/aida-public/AB6AXuCSSDWhJHMgaYslQBn204xjhoYQlq9bv4_AVOI51RAyIwv6reQbS739I8FHeByarsWa_EkkGBkAY51mGjXABbMEl_D_n7tNvMrYTMxs8GIZOAdNKi3WMqZ_hqqF8kyve5FHtARjJaehJk1vRdtzVM9jsUSgm24E6Sz78s400oRpjh-UeEcaBIaFiXPEwSIqxe-jk3oqt3wlRamgfNO2MNlC6OgG5VnMmNpX2rrECm2yakMh-YMykkgXVQ0zkToL2ONNAqaEMMCfsg",
    creator: "Aetheric Labs",
    description: "Kit completo de componentes de visualização de dados baseados em glassmorphism reativo para designers.",
    longDescription: "Um kit de interface do usuário de alta complexidade contendo mais de 200 componentes detalhados para gráficos de dispersão, linhas, velocímetros de performance de rede e grades táticas. Totalmente parametrizado por Figma Variables e componentes auto-layout atualizados.",
    features: [
      "200+ Variantes de componentes com variantes de estado ativas/hover",
      "Modelagem vetorial de alta fidelidade baseada em design molecular",
      "Temas de cores pré-configurados adaptativos (Dark e Dim)",
      "Acesso instantâneo à comunidade privada de apoio técnico"
    ],
    specs: {
      resolution: "Vetorial",
      software: "Figma",
      size: "84.3 MB",
      updates: "Gratuitas Vitalícias",
      slidesCount: "200+ comps",
      fileFormat: ".fig"
    },
    rating: 5.0,
    downloads: 512,
    views: 2980
  },
  {
    id: 4,
    title: "Aura Multipurpose Portfolio",
    format: "PPTX",
    price: 600.00,
    category: "Slides",
    img: "https://lh3.googleusercontent.com/aida-public/AB6AXuAeqSDtqw3mLx2D7OFa1K_aJtvLyKwcOD4rFdwAF4l5myLeX4EDRWrz8bwzu7CG6UZ5CNT0DAc34WdXJPrAl7qD7H_ViT830SKw_beNDhhdYIw5MIpJZCC5P6UWKGjT5CGH0UqDdzHB-at9DUA18ccYWcX7xjtJLUIM4Kzzi0EPJZOo-okuy3juS98-g84-2i61eTCvAotCuM3VyEnHWe1mZXmLJDDI5Q_5KzcnrcRDsVmz8eRCIPAIQncQV02H03lj9MYdsk17kg",
    creator: "Luminary Dev",
    description: "Portfolio de design futurista e minimalista para expor projetos de criadores criativos.",
    longDescription: "Aura é um template multiúso requintado que funde minimalismo nórdico e neon cyber. Use este template incrível para destacar fotografias, renderizações 3D ou código-fonte formatado de maneira extremamente clean e inovadora.",
    features: [
      "32 slides dedicados a vitrines visuais elegantes",
      "Seções de grade fluida auto-ajustáveis",
      "Estilos tipográficos expressivos integrados",
      "Fácil personalização arrastando arquivos"
    ],
    specs: {
      resolution: "1920x1080 (16:9)",
      software: "PowerPoint",
      size: "15.0 MB",
      updates: "Gratuitas Vitalícias",
      slidesCount: "32",
      fileFormat: ".pptx"
    },
    rating: 4.8,
    downloads: 145,
    views: 650
  },
  {
    id: 5,
    title: "Cyberpunk City 3D Environment",
    format: "ZIP",
    price: 3400.00,
    category: "3D Model",
    img: "https://lh3.googleusercontent.com/aida-public/AB6AXuDg0OR-gtLqrVcmGZATUdozlSsiXT_3zwRT9Z0p5wGeky8VzlpoYv-6x6y4lA_DMjLW9yeqHrM9UxgcDDN8wt1eo2vUKLiTPZL649gSxtZJQ5JEQiFZlct0-bTaGKGoRGol3_fXGoLaY1M30FsETxVrwnyQhYUGA7GyRRJd1L60IbHULCw27q5f-niDpZA00-nOa3lnqtzcpI5xCDTvtReQroVmC41tLoX3ZtEsLuvhkkI6ZZmL5WUre4Q5SVoZ2Gjsc03nbaOwsg",
    creator: "HyperFuture 3D",
    description: "Cenário cibernético urbano em 3D totalmente texturizado para Blender e Unreal Engine 5.",
    longDescription: "Um megapacote de malhas 3D modulares e Assets prontos para montar mega-cidades futuristas. O kit traz mais de 100 prédios holográficos, postes de neon dinâmicos e calçadas molhadas com reflexos reais otimizados para ray-tracing.",
    features: [
      "Mais de 120 modelos modulares de prédios, robôs e vias",
      "Texturas 4K premium com mapas PBR inclusos",
      "Arquivo .blend e arquivos .fbx integrados",
      "Configurações prontas de iluminação volumétrica"
    ],
    specs: {
      resolution: "4K Texturas PBR",
      software: "Blender, UE5",
      size: "1.85 GB",
      updates: "Gratuitas Vitalícias",
      slidesCount: "120+ modelos",
      fileFormat: ".zip"
    },
    rating: 4.95,
    downloads: 98,
    views: 1120
  },
  {
    id: 6,
    title: "Futuristic Presentation Layouts",
    format: "PPTX",
    price: 240.00,
    category: "Slides",
    img: "https://lh3.googleusercontent.com/aida-public/AB6AXuBpGHH305G9dKCQllWnZ0niT9Q-xI5VVdBvla0H89bGML1OM7tVjKC364MZrDgIsEFJxEr-jG4SYaOGYcJQ4lDXkTgYqzRM9cDJMj8g7wNas_9809VTtg-IusjWAd1vb1Y_ytGf3udNQABG_dABtoSFyOBx3u2Y5bSDamGRIrAKqmvfPBltmDsAU3lVX4NvYpIU0-FJLGEuuJcS_JN7vHhg3-b5iJezDDU3sInlXdEnH1-lMv-YCWgxyaFrCz-gMPeX38-DP_RccQ",
    creator: "Aetheric Labs",
    description: "Estilos cibernéticos dinâmicos ideais para apresentações rápidas de produtos avançados ou designs acadêmicos.",
    longDescription: "Apresente suas conclusões com diagramas simplificados influenciados por elementos de ficção científica militarizada. Layouts de alta rigidez visual facilitam o entendimento de dados teóricos complexos.",
    features: [
      "22 layouts de slides ultra-focados em gráficos e tabelas",
      "Configuração acelerada de temas com dois cliques",
      "Ícones futuristas do sistema inclusos",
      "Totalmente responsivo no PowerPoint"
    ],
    specs: {
      resolution: "1920x1080 (16:9)",
      software: "PowerPoint",
      size: "9.6 MB",
      updates: "Sem updates adicionais",
      slidesCount: "22",
      fileFormat: ".pptx"
    },
    rating: 4.6,
    downloads: 231,
    views: 780
  }
];

export const initialTransactions: Transaction[] = [
  {
    id: "TX-9021",
    date: "24 Out, 2026",
    type: "Depósito",
    source: "Transferência PIX Realizada",
    amount: 2500.00,
    status: "success"
  },
  {
    id: "TX-8915",
    date: "22 Out, 2026",
    type: "Compra",
    source: "Cyberpunk City 3D Environment",
    amount: -3400.00,
    status: "expense"
  },
  {
    id: "TX-7832",
    date: "21 Out, 2026",
    type: "Saque",
    source: "Saque solicitado para Conta Bancária",
    amount: -1200.00,
    status: "expense"
  },
  {
    id: "TX-6241",
    date: "19 Out, 2026",
    type: "Compra",
    source: "Aura Multipurpose Portfolio",
    amount: -600.00,
    status: "expense"
  }
];
