import { Company } from './types';

export const MOCK_COMPANIES: Company[] = [
  {
    id: '1',
    name: 'Munch',
    slogan: '#1 AI Video Repurposing Platform',
    description: 'Extrae automáticamente los clips más atractivos de tus videos largos. Edición, subtitulado y publicación automática para TikTok, Reels y Shorts. Ideal para creadores y marcas que quieren escalar en redes.',
    rating: 4.9,
    reviews: 1240,
    logo: 'https://images.crunchbase.com/image/upload/c_lpad,f_auto,q_auto:eco,dpr_1/v1660144577/w9a34q4k2s9q4k2s9q4k.png', // Placeholder URL logic
    banner: 'https://cdn.prod.website-files.com/63a1a4c9c1c5a9116e04f056/63a1a4c9c1c5a9756b04f08e_Hero%20Image%20-%20Generic.png',
    tags: ['Marketing', 'Video', 'Content'],
    specialties: ['Video Editing', 'Social Media', 'Content Repurposing'],
    industries: ['Marketing', 'E-commerce', 'Creators'],
    projects: 5000,
    teamSize: '10 - 50',
    founded: '2021',
    location: 'Tel Aviv / Global',
    email: 'hello@getmunch.com',
    phone: '+1 (555) 000-0000',
    website: 'www.getmunch.com',
    pricing: {
      type: 'Freemium',
      startingAt: '$49/mo',
      description: 'Prueba gratuita disponible. Planes escalables.'
    },
    integrations: ['YouTube', 'Instagram', 'TikTok', 'Slack', 'HubSpot'],
    useCases: [
      { title: 'Redes Sociales', description: 'Convierte 1 webinar en 10 TikToks virales.' },
      { title: 'Ads', description: 'Genera variantes de anuncios en minutos.' }
    ],
    portfolio: [
      { id: 'p1', title: 'Campaña Viral Tech', client: 'TechReviewer', image: 'https://picsum.photos/id/20/400/300', tags: ['Shorts', 'Viral'] }
    ]
  },
  {
    id: '2',
    name: 'Rauda.ai',
    slogan: 'Agentes de Voz IA para tu Negocio',
    description: 'Automatiza la atención al cliente y la captación de leads con agentes de voz que suenan 100% humanos. No pierdas ni una llamada en tu clínica, inmobiliaria o despacho.',
    rating: 4.8,
    reviews: 89,
    logo: 'https://framerusercontent.com/images/8kZ9kZ9kZ9kZ9kZ9kZ9kZ9kZ9k.png', // Placeholder
    banner: 'https://framerusercontent.com/images/39393939393939393939393939.png',
    tags: ['Ventas', 'Soporte', 'Voz'],
    specialties: ['Voice AI', 'Customer Support', 'Lead Gen'],
    industries: ['Salud', 'Real Estate', 'Legal'],
    projects: 120,
    teamSize: '10 - 20',
    founded: '2023',
    location: 'Madrid, ES',
    email: 'hola@rauda.ai',
    phone: '+34 910 000 000',
    website: 'www.rauda.ai',
    pricing: {
      type: 'Paid',
      startingAt: '99€/mo',
      description: 'Setup e implementación incluidos.'
    },
    integrations: ['WhatsApp', 'Salesforce', 'Calendly', 'Zendesk'],
    useCases: [
      { title: 'Citas Médicas', description: 'Gestión automática de agenda y recordatorios.' },
      { title: 'Cualificación de Leads', description: 'Filtra interesados en inmobiliaria 24/7.' }
    ],
    portfolio: []
  },
  {
    id: '3',
    name: 'DevPyme Solutions',
    slogan: 'Digitalización Asequible para PYMES',
    description: 'Agencia especializada en implementar soluciones No-Code y automatizaciones para pequeñas empresas. Te ayudamos a integrar IA en tus procesos diarios sin necesidad de programar.',
    rating: 5.0,
    reviews: 42,
    logo: 'https://picsum.photos/id/60/200/200',
    banner: 'https://picsum.photos/id/61/800/400',
    tags: ['No-Code', 'Consultoría', 'Automatización'],
    specialties: ['Zapier', 'Make', 'Airtable', 'Chatbots'],
    industries: ['Retail', 'Restauración', 'Servicios'],
    projects: 200,
    teamSize: '1 - 10',
    founded: '2020',
    location: 'Barcelona, ES',
    email: 'info@devpyme.com',
    phone: '+34 600 000 000',
    website: 'www.devpyme.com',
    pricing: {
      type: 'Contact',
      description: 'Proyectos llave en mano desde 500€'
    },
    integrations: ['Zapier', 'Make', 'Airtable', 'Notion', 'Shopify'],
    useCases: [
      { title: 'Automatización de Facturas', description: 'De email a Excel automáticamente.' },
      { title: 'Chatbot Web', description: 'Responde dudas frecuentes en tu web.' }
    ],
    portfolio: []
  }
];

export const FAQ_CATEGORIES = [
  { icon: 'savings', title: 'Precios y Planes', desc: '¿Cómo funcionan los pagos y suscripciones?' },
  { icon: 'integration_instructions', title: 'Integraciones', desc: 'Conecta con tu software actual (Shopify, CRM...)' },
  { icon: 'verified_user', title: 'Garantías', desc: '¿Qué pasa si no funciona como espero?' },
  { icon: 'rocket_launch', title: 'Empezar Rápido', desc: 'Guía para lanzar tu primer proyecto en 24h.' },
  { icon: 'support_agent', title: 'Soporte', desc: 'Ayuda técnica en tu idioma.' },
  { icon: 'manage_accounts', title: 'Cuenta', desc: 'Gestión de facturas y usuarios.' },
];
