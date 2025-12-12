import React, { useState } from 'react';
import ClientLayout from '../../components/ClientLayout';

const ClientProfile: React.FC = () => {
  const [integrations, setIntegrations] = useState({
      slack: true,
      jira: false,
      github: true,
      figma: false
  });

  return (
    <ClientLayout>
      <div className="flex flex-col xl:flex-row gap-8">
         
         {/* LEFT COLUMN - MAIN */}
         <div className="flex-1 space-y-8">
            <div className="flex items-end justify-between">
                <div>
                     <h1 className="text-3xl font-black text-gray-900">Perfil y Equipo</h1>
                     <p className="text-gray-500">Gestiona tu identidad, preferencias y colaboradores.</p>
                </div>
            </div>

            {/* Identity Card */}
            <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm relative overflow-hidden">
                <div className="absolute top-0 right-0 bg-green-100 text-green-700 text-xs font-bold px-3 py-1 rounded-bl-xl border-l border-b border-green-200 flex items-center gap-1">
                    <span className="material-symbols-outlined text-sm">verified</span> VERIFICADO
                </div>
                <div className="flex flex-col sm:flex-row items-center gap-6">
                    <div className="relative">
                        <div className="w-24 h-24 rounded-full bg-gray-200 bg-cover bg-center border-4 border-white shadow-md" style={{backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuD56sMogw_VBB9yDp-jxxYeihYrC8RGmccLUN9_8TyhtQFMfYRISR5MkcUL3DhYdjP1W0idTNuYYx4IYzTgsCsrrcJaTze-5aPqLr5-AdStPpGbPg-2H_HeF5zIOU2rNNB5Lxf5iOdEDlFBsR52qtxTSD2vGaLIYzxsMLLYLyKYXQTRRtzfZLohcIfqB5u2JzB7FilkC1Z1O-blivYoU_3uGvwBDlTeW3TCocCvcIy_2FoXiX5_TXgdkdB_hgJ3-uGTBLmqDSTeAU8")'}}></div>
                        <button className="absolute bottom-0 right-0 bg-white p-1.5 rounded-full border border-gray-200 shadow-sm text-gray-600 hover:text-primary transition-colors">
                            <span className="material-symbols-outlined text-sm">edit</span>
                        </button>
                    </div>
                    <div className="flex-1 text-center sm:text-left">
                        <h2 className="text-2xl font-bold text-gray-900">Ana Torres</h2>
                        <p className="text-gray-500">Product Manager @ Cliente Corp</p>
                        <div className="flex gap-2 justify-center sm:justify-start mt-3">
                             <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-md">Admin</span>
                             <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-md">Facturación</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* AI Persona Context */}
            <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl border border-indigo-100 p-6">
                <div className="flex items-start gap-4">
                    <div className="p-3 bg-white rounded-lg shadow-sm text-indigo-600">
                        <span className="material-symbols-outlined">smart_toy</span>
                    </div>
                    <div className="flex-1">
                        <h3 className="text-lg font-bold text-gray-900">Contexto de IA (AI Persona)</h3>
                        <p className="text-sm text-gray-600 mb-4">Personaliza cómo nuestro Agente IA interactúa contigo y los vendors.</p>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Nivel Técnico</label>
                                <select className="w-full bg-white border border-gray-200 text-gray-700 text-sm rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-indigo-200">
                                    <option>Intermedio - Entiendo conceptos generales</option>
                                    <option>Experto - Quiero detalles de arquitectura</option>
                                    <option>Básico - Explicaciones sencillas</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Tono de Comunicación</label>
                                <select className="w-full bg-white border border-gray-200 text-gray-700 text-sm rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-indigo-200">
                                    <option>Profesional y directo</option>
                                    <option>Casual y amigable</option>
                                </select>
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Stack Preferido</label>
                                <input type="text" defaultValue="AWS, React, Python, Node.js" className="w-full bg-white border border-gray-200 text-gray-700 text-sm rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-indigo-200" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Personal Data Form */}
            <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                <div className="flex justify-between items-center mb-6 pb-4 border-b border-gray-100">
                    <h3 className="text-lg font-bold text-gray-900">Datos de Contacto</h3>
                    <button className="text-primary text-sm font-bold hover:underline">Editar</button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="text-xs font-bold text-gray-500 uppercase mb-1">Email</label>
                        <p className="font-medium text-gray-900 bg-gray-50 p-3 rounded-lg border border-gray-100">ana.torres@techsolutions.com</p>
                    </div>
                    <div>
                        <label className="text-xs font-bold text-gray-500 uppercase mb-1">Teléfono</label>
                        <p className="font-medium text-gray-900 bg-gray-50 p-3 rounded-lg border border-gray-100">+1 (555) 123-4567</p>
                    </div>
                    <div className="md:col-span-2">
                        <label className="text-xs font-bold text-gray-500 uppercase mb-1">Dirección de la Empresa</label>
                        <p className="font-medium text-gray-900 bg-gray-50 p-3 rounded-lg border border-gray-100">123 Tech Avenue, Silicon Valley, CA 94025</p>
                    </div>
                </div>
            </div>

            {/* Team Management */}
            <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-lg font-bold text-gray-900">Miembros del Equipo</h3>
                    <button className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-bold rounded-lg transition-colors flex items-center gap-1">
                        <span className="material-symbols-outlined text-sm">add</span> Invitar
                    </button>
                </div>
                <div className="space-y-4">
                    {[
                        { name: 'Ana Torres', role: 'Admin', email: 'ana@tech.com', avatar: 'AT' },
                        { name: 'Carlos Ruiz', role: 'Revisor Técnico', email: 'carlos@tech.com', avatar: 'CR' },
                        { name: 'Lucia Mendez', role: 'Finanzas', email: 'lucia@tech.com', avatar: 'LM' }
                    ].map((member, i) => (
                        <div key={i} className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors border border-transparent hover:border-gray-100">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-sm font-bold text-gray-600">
                                    {member.avatar}
                                </div>
                                <div>
                                    <p className="font-bold text-gray-900 text-sm">{member.name}</p>
                                    <p className="text-xs text-gray-500">{member.role}</p>
                                </div>
                            </div>
                            <button className="text-gray-400 hover:text-gray-600">
                                <span className="material-symbols-outlined">more_vert</span>
                            </button>
                        </div>
                    ))}
                </div>
            </div>
         </div>

         {/* RIGHT COLUMN - SIDEBAR */}
         <aside className="w-full xl:w-96 space-y-8">
            
            {/* Trust Center Widget */}
            <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Trust Center</h3>
                <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-100">
                        <div className="flex items-center gap-2">
                            <span className="material-symbols-outlined text-green-600">verified_user</span>
                            <span className="text-sm font-bold text-green-800">Identidad Verificada</span>
                        </div>
                        <span className="material-symbols-outlined text-green-600 text-sm">check</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-100">
                        <div className="flex items-center gap-2">
                            <span className="material-symbols-outlined text-green-600">payments</span>
                            <span className="text-sm font-bold text-green-800">Método de Pago</span>
                        </div>
                        <span className="material-symbols-outlined text-green-600 text-sm">check</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-100 opacity-60">
                         <div className="flex items-center gap-2">
                            <span className="material-symbols-outlined text-gray-500">domain_verification</span>
                            <span className="text-sm font-medium text-gray-600">Verificación Fiscal</span>
                        </div>
                        <span className="text-xs text-gray-500">Pendiente</span>
                    </div>
                </div>
                <button className="w-full mt-4 text-center text-sm text-primary font-bold hover:underline">Ver detalles de cumplimiento</button>
            </div>

            {/* Integration Hub */}
            <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-bold text-gray-900">Integraciones</h3>
                    <span className="bg-gray-100 text-gray-600 text-xs font-bold px-2 py-0.5 rounded">BETA</span>
                </div>
                <p className="text-sm text-gray-500 mb-4">Conecta tus herramientas para sincronizar hitos y chats.</p>
                <div className="space-y-3">
                    <div className="flex items-center justify-between">
                         <div className="flex items-center gap-3">
                            <img src="https://cdn-icons-png.flaticon.com/512/2111/2111615.png" alt="Slack" className={`w-6 h-6 ${!integrations.slack ? 'grayscale opacity-50' : ''}`} />
                            <span className={`text-sm font-medium ${integrations.slack ? 'text-gray-900' : 'text-gray-500'}`}>Slack</span>
                         </div>
                         <label className="relative inline-flex items-center cursor-pointer">
                            <input type="checkbox" checked={integrations.slack} onChange={() => setIntegrations({...integrations, slack: !integrations.slack})} className="sr-only peer" />
                            <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary"></div>
                         </label>
                    </div>
                    <div className="flex items-center justify-between">
                         <div className="flex items-center gap-3">
                            <img src="https://cdn-icons-png.flaticon.com/512/5968/5968853.png" alt="Jira" className={`w-6 h-6 ${!integrations.jira ? 'grayscale opacity-50' : ''}`} />
                            <span className={`text-sm font-medium ${integrations.jira ? 'text-gray-900' : 'text-gray-500'}`}>Jira</span>
                         </div>
                         <label className="relative inline-flex items-center cursor-pointer">
                            <input type="checkbox" checked={integrations.jira} onChange={() => setIntegrations({...integrations, jira: !integrations.jira})} className="sr-only peer" />
                            <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary"></div>
                         </label>
                    </div>
                     <div className="flex items-center justify-between">
                         <div className="flex items-center gap-3">
                            <img src="https://cdn-icons-png.flaticon.com/512/25/25231.png" alt="GitHub" className={`w-6 h-6 ${!integrations.github ? 'grayscale opacity-50' : ''}`} />
                            <span className={`text-sm font-medium ${integrations.github ? 'text-gray-900' : 'text-gray-500'}`}>GitHub</span>
                         </div>
                         <label className="relative inline-flex items-center cursor-pointer">
                            <input type="checkbox" checked={integrations.github} onChange={() => setIntegrations({...integrations, github: !integrations.github})} className="sr-only peer" />
                            <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary"></div>
                         </label>
                    </div>
                </div>
            </div>

            {/* Activity History Widget */}
            <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Actividad Reciente</h3>
                <div className="relative pl-4 space-y-6 before:content-[''] before:absolute before:top-2 before:bottom-2 before:left-[5px] before:w-0.5 before:bg-gray-100">
                    <div className="relative">
                        <div className="absolute -left-[16px] top-1.5 w-2.5 h-2.5 rounded-full bg-primary border-2 border-white shadow-sm"></div>
                        <p className="text-xs font-bold text-gray-900">Inicio de Sesión</p>
                        <p className="text-xs text-gray-500">Hoy, 09:30 AM • IP 192.168.1.1</p>
                    </div>
                    <div className="relative">
                        <div className="absolute -left-[16px] top-1.5 w-2.5 h-2.5 rounded-full bg-gray-300 border-2 border-white shadow-sm"></div>
                        <p className="text-xs font-bold text-gray-900">Perfil Actualizado</p>
                        <p className="text-xs text-gray-500">Ayer, 14:15 PM</p>
                    </div>
                     <div className="relative">
                        <div className="absolute -left-[16px] top-1.5 w-2.5 h-2.5 rounded-full bg-gray-300 border-2 border-white shadow-sm"></div>
                        <p className="text-xs font-bold text-gray-900">Fondos Depositados</p>
                        <p className="text-xs text-gray-500">15 Ago, 10:00 AM</p>
                    </div>
                </div>
            </div>

            {/* Danger Zone */}
            <div className="bg-red-50 rounded-xl border border-red-100 p-6">
                <h3 className="text-sm font-bold text-red-800 mb-2">Zona de Peligro</h3>
                <button className="text-xs font-bold text-red-600 bg-white border border-red-200 px-3 py-2 rounded-lg hover:bg-red-50 w-full text-center">
                    Desactivar o eliminar cuenta
                </button>
            </div>

         </aside>

      </div>
    </ClientLayout>
  );
};

export default ClientProfile;