import { Company } from './types';

export const MOCK_COMPANIES: Company[] = [
  {
    id: '1',
    name: 'QuantumLeap Analytics',
    slogan: 'Modelos predictivos y análisis de datos para finanzas.',
    description: 'Somos un equipo de expertos en IA dedicados a resolver desafíos complejos de negocio a través de soluciones de aprendizaje automático personalizadas.',
    rating: 4.9,
    reviews: 124,
    logo: 'https://picsum.photos/id/40/200/200',
    banner: 'https://picsum.photos/id/41/800/400',
    tags: ['NLP', 'Finanzas', 'Python'],
    specialties: ['Análisis Predictivo', 'Machine Learning', 'NLP', 'Data Science'],
    industries: ['Finanzas', 'Legal', 'Seguros', 'Retail'],
    projects: 150,
    teamSize: '50 - 100',
    founded: '2012',
    location: 'San Francisco, CA',
    email: 'contact@quantumleap.ai',
    phone: '+1 (555) 123-4567',
    website: 'www.quantumleap.ai',
    portfolio: [
      { id: 'p1', title: 'Optimización de Rutas Logísticas', client: 'LogiCorp', image: 'https://picsum.photos/id/20/400/300', tags: ['Python', 'TensorFlow'] },
      { id: 'p2', title: 'Análisis de Sentimiento', client: 'RetailGiant', image: 'https://picsum.photos/id/26/400/300', tags: ['NLP', 'PyTorch'] }
    ]
  },
  {
    id: '2',
    name: 'InnovateAI Solutions',
    slogan: 'Especialistas en Visión por Computador y NLP.',
    description: 'Transformamos imágenes y texto en insights accionables para tu negocio.',
    rating: 4.8,
    reviews: 89,
    logo: 'https://picsum.photos/id/50/200/200',
    banner: 'https://picsum.photos/id/51/800/400',
    tags: ['Computer Vision', 'Retail'],
    specialties: ['Computer Vision', 'Object Detection', 'OCR'],
    industries: ['Retail', 'Seguridad', 'Manufactura'],
    projects: 95,
    teamSize: '20 - 50',
    founded: '2015',
    location: 'Austin, TX',
    email: 'hello@innovateai.com',
    phone: '+1 (555) 987-6543',
    website: 'www.innovateai.com',
    portfolio: []
  },
  {
    id: '3',
    name: 'DataDriven Dynamics',
    slogan: 'Soluciones de IA para optimización de cadenas de suministro.',
    description: 'Optimizamos tu cadena de suministro utilizando algoritmos avanzados de IA.',
    rating: 4.7,
    reviews: 56,
    logo: 'https://picsum.photos/id/60/200/200',
    banner: 'https://picsum.photos/id/61/800/400',
    tags: ['Logística', 'Optimización'],
    specialties: ['Supply Chain', 'Optimization', 'Forecasting'],
    industries: ['Logística', 'Transporte'],
    projects: 42,
    teamSize: '10 - 20',
    founded: '2018',
    location: 'New York, NY',
    email: 'info@datadriven.com',
    phone: '+1 (555) 555-5555',
    website: 'www.datadriven.com',
    portfolio: []
  }
];

export const FAQ_CATEGORIES = [
  { icon: 'rocket_launch', title: 'Primeros Pasos', desc: 'Todo lo que necesitas para empezar.' },
  { icon: 'assignment', title: 'Gestión de Proyectos', desc: 'Gestiona tus proyectos eficazmente.' },
  { icon: 'payments', title: 'Pagos', desc: 'Información sobre facturas y pagos.' },
  { icon: 'business_center', title: 'Perfil de Empresa', desc: 'Optimiza el perfil de tu empresa.' },
  { icon: 'verified', title: 'Verificación', desc: 'Completa el proceso de verificación.' },
  { icon: 'gavel', title: 'Disputas', desc: 'Resuelve conflictos y disputas.' },
];
