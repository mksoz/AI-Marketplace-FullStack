import React, { useState } from 'react';
import AdminLayout from '../../components/AdminLayout';

const AdminSettings: React.FC = () => {
  // State for toggles
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [registrations, setRegistrations] = useState({ client: true, vendor: true });
  const [security, setSecurity] = useState({ twoFactor: true, strongPassword: true });

  // Mock Admin Team
  const adminTeam = [
      { id: 1, name: 'Super Admin', email: 'admin@platform.com', role: 'Owner', avatar: 'SA' },
      { id: 2, name: 'Support Lead', email: 'support@platform.com', role: 'Editor', avatar: 'SL' },
      { id: 3, name: 'Finance Mgr', email: 'finance@platform.com', role: 'Viewer', avatar: 'FM' },
  ];

  // Mock Audit Log
  const auditLogs = [
      { id: 1, action: 'Cambio de Comisión', user: 'Super Admin', details: 'Vendor fee 10% -> 12%', time: 'Hace 2h' },
      { id: 2, action: 'Suspensión Usuario', user: 'Support Lead', details: 'User: Bad Actor Inc', time: 'Ayer' },
      { id: 3, action: 'Liberación Fondos', user: 'Finance Mgr', details: 'Project #1234 - $5000', time: 'Hace 2 días' },
  ];

  return (
    <AdminLayout>
      <div className="space-y-8 pb-20">
         <div className="flex justify-between items-end">
             <div>
                <h1 className="text-3xl font-black text-gray-900">Configuración General</h1>
                <p className="text-gray-500 mt-1">Gestión del sistema, acceso administrativo y seguridad.</p>
             </div>
         </div>

         <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
             
             {/* 1. SYSTEM STATUS & ACCESS */}
             <div className="bg-white p-8 rounded-2xl border border-gray-200 shadow-sm space-y-6">
                 <div className="flex items-center gap-3 border-b border-gray-100 pb-4">
                     <div className="p-2 bg-orange-50 text-orange-600 rounded-lg">
                         <span className="material-symbols-outlined">power_settings_new</span>
                     </div>
                     <div>
                         <h2 className="text-lg font-bold text-gray-900">Estado del Sistema</h2>
                         <p className="text-xs text-gray-500">Control de acceso global.</p>
                     </div>
                 </div>

                 <div className="space-y-6">
                     {/* Maintenance Mode */}
                     <div className={`p-4 rounded-xl border transition-all ${maintenanceMode ? 'bg-red-50 border-red-200' : 'bg-gray-50 border-gray-200'}`}>
                         <div className="flex justify-between items-center mb-2">
                             <div className="flex items-center gap-2">
                                 <span className="material-symbols-outlined text-gray-700">build</span>
                                 <p className="font-bold text-gray-900 text-sm">Modo Mantenimiento</p>
                             </div>
                             <label className="relative inline-flex items-center cursor-pointer">
                                <input 
                                    type="checkbox" 
                                    checked={maintenanceMode}
                                    onChange={() => setMaintenanceMode(!maintenanceMode)}
                                    className="sr-only peer" 
                                />
                                <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-500"></div>
                             </label>
                         </div>
                         <p className="text-xs text-gray-500 mb-3">Si se activa, solo los administradores podrán iniciar sesión.</p>
                         {maintenanceMode && (
                             <input 
                                type="text" 
                                placeholder="Mensaje para usuarios (ej. Volveremos en 1 hora)"
                                className="w-full px-3 py-2 bg-white border border-red-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-red-200"
                             />
                         )}
                     </div>

                     {/* Registration Controls */}
                     <div className="grid grid-cols-2 gap-4">
                         <div className="p-4 border border-gray-200 rounded-xl flex flex-col justify-between h-32 hover:border-gray-300 transition-colors">
                             <div>
                                 <div className="flex justify-between items-start mb-2">
                                     <span className="material-symbols-outlined text-blue-500">person_add</span>
                                     <label className="relative inline-flex items-center cursor-pointer">
                                        <input 
                                            type="checkbox" 
                                            checked={registrations.client}
                                            onChange={() => setRegistrations({...registrations, client: !registrations.client})}
                                            className="sr-only peer" 
                                        />
                                        <div className="w-9 h-5 bg-gray-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-green-500"></div>
                                     </label>
                                 </div>
                                 <p className="font-bold text-gray-900 text-sm">Clientes</p>
                             </div>
                             <p className="text-xs text-gray-500">{registrations.client ? 'Registro Abierto' : 'Registro Pausado'}</p>
                         </div>
                         <div className="p-4 border border-gray-200 rounded-xl flex flex-col justify-between h-32 hover:border-gray-300 transition-colors">
                             <div>
                                 <div className="flex justify-between items-start mb-2">
                                     <span className="material-symbols-outlined text-purple-500">domain_add</span>
                                     <label className="relative inline-flex items-center cursor-pointer">
                                        <input 
                                            type="checkbox" 
                                            checked={registrations.vendor}
                                            onChange={() => setRegistrations({...registrations, vendor: !registrations.vendor})}
                                            className="sr-only peer" 
                                        />
                                        <div className="w-9 h-5 bg-gray-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-green-500"></div>
                                     </label>
                                 </div>
                                 <p className="font-bold text-gray-900 text-sm">Vendors</p>
                             </div>
                             <p className="text-xs text-gray-500">{registrations.vendor ? 'Registro Abierto' : 'Registro Pausado'}</p>
                         </div>
                     </div>
                 </div>
             </div>

             {/* 2. ADMIN TEAM MANAGEMENT */}
             <div className="bg-white p-8 rounded-2xl border border-gray-200 shadow-sm space-y-6">
                 <div className="flex items-center justify-between border-b border-gray-100 pb-4">
                     <div className="flex items-center gap-3">
                         <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
                             <span className="material-symbols-outlined">manage_accounts</span>
                         </div>
                         <div>
                             <h2 className="text-lg font-bold text-gray-900">Equipo Admin</h2>
                             <p className="text-xs text-gray-500">Accesos al panel de control.</p>
                         </div>
                     </div>
                     <button className="text-xs font-bold text-primary hover:underline bg-primary/5 px-3 py-1.5 rounded-lg transition-colors">
                         + Invitar
                     </button>
                 </div>

                 <div className="space-y-3">
                     {adminTeam.map(admin => (
                         <div key={admin.id} className="flex items-center justify-between p-3 border border-gray-100 rounded-xl hover:bg-gray-50 transition-colors">
                             <div className="flex items-center gap-3">
                                 <div className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center text-white text-xs font-bold">
                                     {admin.avatar}
                                 </div>
                                 <div>
                                     <p className="font-bold text-gray-900 text-sm">{admin.name}</p>
                                     <p className="text-xs text-gray-500">{admin.email}</p>
                                 </div>
                             </div>
                             <div className="flex items-center gap-3">
                                 <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${admin.role === 'Owner' ? 'bg-purple-100 text-purple-700' : 'bg-gray-200 text-gray-600'}`}>
                                     {admin.role}
                                 </span>
                                 <button className="text-gray-400 hover:text-gray-600">
                                     <span className="material-symbols-outlined text-lg">more_vert</span>
                                 </button>
                             </div>
                         </div>
                     ))}
                 </div>
             </div>

             {/* 3. AUDIT LOG (NEW) */}
             <div className="bg-white p-8 rounded-2xl border border-gray-200 shadow-sm space-y-6">
                 <div className="flex items-center gap-3 border-b border-gray-100 pb-4">
                     <div className="p-2 bg-gray-100 text-gray-600 rounded-lg">
                         <span className="material-symbols-outlined">history</span>
                     </div>
                     <div>
                         <h2 className="text-lg font-bold text-gray-900">Registro de Auditoría</h2>
                         <p className="text-xs text-gray-500">Historial de acciones administrativas.</p>
                     </div>
                 </div>
                 
                 <div className="space-y-3">
                     {auditLogs.map(log => (
                         <div key={log.id} className="text-sm p-3 bg-gray-50 rounded-lg border border-gray-100">
                             <div className="flex justify-between items-start mb-1">
                                 <span className="font-bold text-gray-800">{log.action}</span>
                                 <span className="text-xs text-gray-400">{log.time}</span>
                             </div>
                             <p className="text-gray-600 text-xs mb-1">Por: <span className="font-medium">{log.user}</span></p>
                             <p className="text-xs font-mono text-gray-500">{log.details}</p>
                         </div>
                     ))}
                     <button className="w-full text-center text-xs font-bold text-primary hover:underline mt-2">Ver Log Completo</button>
                 </div>
             </div>

             {/* 4. SECURITY & DANGER ZONE */}
             <div className="space-y-8">
                 <div className="bg-white p-8 rounded-2xl border border-gray-200 shadow-sm space-y-6">
                     <div className="flex items-center gap-3 border-b border-gray-100 pb-4">
                         <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                             <span className="material-symbols-outlined">security</span>
                         </div>
                         <div>
                             <h2 className="text-lg font-bold text-gray-900">Seguridad Global</h2>
                             <p className="text-xs text-gray-500">Políticas de contraseñas y sesiones.</p>
                         </div>
                     </div>

                     <div className="space-y-4">
                         <div className="flex items-center justify-between p-2">
                             <div>
                                 <p className="text-sm font-bold text-gray-700">Forzar 2FA para Admins</p>
                                 <p className="text-xs text-gray-500">Autenticación de dos factores obligatoria.</p>
                             </div>
                             <label className="relative inline-flex items-center cursor-pointer">
                                <input 
                                    type="checkbox" 
                                    checked={security.twoFactor}
                                    onChange={() => setSecurity({...security, twoFactor: !security.twoFactor})}
                                    className="sr-only peer" 
                                />
                                <div className="w-9 h-5 bg-gray-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
                             </label>
                         </div>
                         <div className="flex items-center justify-between p-2">
                             <div>
                                 <p className="text-sm font-bold text-gray-700">Contraseñas Fuertes</p>
                                 <p className="text-xs text-gray-500">Min. 12 caracteres, símbolos y números.</p>
                             </div>
                             <label className="relative inline-flex items-center cursor-pointer">
                                <input 
                                    type="checkbox" 
                                    checked={security.strongPassword}
                                    onChange={() => setSecurity({...security, strongPassword: !security.strongPassword})}
                                    className="sr-only peer" 
                                />
                                <div className="w-9 h-5 bg-gray-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
                             </label>
                         </div>
                     </div>
                 </div>

                 <div className="bg-red-50 p-8 rounded-2xl border border-red-100 space-y-6">
                     <div className="flex items-center gap-3 border-b border-red-200 pb-4">
                         <div className="p-2 bg-white text-red-600 rounded-lg shadow-sm">
                             <span className="material-symbols-outlined">warning</span>
                         </div>
                         <div>
                             <h2 className="text-lg font-bold text-red-900">Zona de Peligro</h2>
                             <p className="text-xs text-red-700">Acciones irreversibles.</p>
                         </div>
                     </div>

                     <div className="space-y-3">
                         <div className="flex items-center justify-between">
                             <p className="text-sm font-bold text-red-900">Purgar Caché del Sistema</p>
                             <button className="px-4 py-2 bg-white border border-red-200 text-red-600 text-xs font-bold rounded-lg hover:bg-red-100 transition-colors">Ejecutar</button>
                         </div>
                         <div className="flex items-center justify-between">
                             <p className="text-sm font-bold text-red-900">Reiniciar Servicios de IA</p>
                             <button className="px-4 py-2 bg-white border border-red-200 text-red-600 text-xs font-bold rounded-lg hover:bg-red-100 transition-colors">Reiniciar</button>
                         </div>
                     </div>
                 </div>
             </div>

         </div>
      </div>
    </AdminLayout>
  );
};

export default AdminSettings;