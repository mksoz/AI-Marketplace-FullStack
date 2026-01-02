export const mockProjects = [
    {
        id: 'proj-001',
        title: 'Desarrollo de Chatbot IA para E-commerce',
        status: 'IN_PROGRESS',
        client: { name: 'TechSolutions Inc', companyName: 'TechSolutions Inc' },
        vendor: { name: 'AI Experts Studio', companyName: 'AI Experts Studio' },
        repoUrl: 'https://github.com/aiexperts/chatbot-ecommerce',
        repoName: 'chatbot-ecommerce',
        progress: 65,
        milestones: [
            { id: 'm-1', title: 'Diseño de Arquitectura', amount: 1500, status: 'COMPLETED', isPaid: true, dueDate: '2023-11-15' },
            { id: 'm-2', title: 'Desarrollo del Core NLP', amount: 3000, status: 'COMPLETED', isPaid: false, releaseStatus: 'REQUESTED', dueDate: '2023-12-01' }, // Vendor Requested Release
            { id: 'm-3', title: 'Integración con Shopify', amount: 2500, status: 'IN_PROGRESS', isPaid: false, releaseStatus: 'NONE', dueDate: '2023-12-20' },
            { id: 'm-4', title: 'Testing y Despliegue', amount: 1000, status: 'PENDING', isPaid: false, releaseStatus: 'NONE', dueDate: '2024-01-10' },
        ],
        incidents: [
            { id: 'inc-1', title: 'Retraso en API de Shopify', description: 'La API de Shopify cambió sus endpoints y require refactorización.', priority: 'HIGH', status: 'IN_PROGRESS', createdAt: '2023-12-05', type: 'BUG', reportedBy: 'vendor' },
            { id: 'inc-2', title: 'Error en Login de Admin', description: 'No se puede acceder al dashboard de administración con credenciales de prueba.', priority: 'MEDIUM', status: 'OPEN', createdAt: '2023-12-10', type: 'BUG', reportedBy: 'client' },
            { id: 'inc-3', title: 'Cambio de Color en UI', description: 'Solicitud de cambio de color primario a #FF5733.', priority: 'LOW', status: 'RESOLVED', createdAt: '2023-11-20', type: 'CHANGE_REQUEST', reportedBy: 'client' }
        ],
        folders: [
            { id: 'f-1', name: 'Documentación', type: 'folder', parentId: null },
            { id: 'f-2', name: 'Diseños', type: 'folder', parentId: null },
            { id: 'f-3', name: 'Legal', type: 'folder', parentId: null },
        ],
        files: [
            { id: 'file-1', name: 'Especificaciones_Tecnicas_v2.pdf', type: 'file', parentId: 'f-1', size: '2.4 MB' },
            { id: 'file-2', name: 'Mockups_Finales.fig', type: 'file', parentId: 'f-2', size: '15 MB' },
            { id: 'file-3', name: 'Contrato_Firmado.pdf', type: 'file', parentId: 'f-3', size: '1.1 MB' },
        ]
    },
    {
        id: 'proj-002',
        title: 'Sistema de Recomendación para Streaming',
        status: 'COMPLETED',
        client: { name: 'StreamFlix', companyName: 'StreamFlix' },
        vendor: { name: 'DataWizards', companyName: 'DataWizards' },
        progress: 100,
        milestones: [
            { id: 'm-10', title: 'Análisis de Datos', amount: 5000, status: 'COMPLETED', isPaid: true },
            { id: 'm-11', title: 'Entrenamiento del Modelo', amount: 8000, status: 'COMPLETED', isPaid: true },
            { id: 'm-12', title: 'API REST', amount: 4000, status: 'COMPLETED', isPaid: false, releaseStatus: 'REJECTED' }, // Rejected for demo
        ],
        incidents: [],
        folders: [],
        files: []
    },
    {
        id: 'proj-003',
        title: 'Automatización de Procesos Legales',
        status: 'PENDING_SETUP', // Por Configurar kanban
        client: { name: 'LegalFirm', companyName: 'LegalFirm' },
        vendor: { name: 'AutomateIt', companyName: 'AutomateIt' },
        progress: 0,
        milestones: [],
        incidents: [],
        folders: [],
        files: []
    }
];

export const getMockProject = (id: string) => {
    return mockProjects.find(p => p.id === id) || mockProjects[0];
};
