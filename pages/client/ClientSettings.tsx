import React from 'react';
import ClientLayout from '../../components/ClientLayout';

import { useToast } from '../../contexts/ToastContext';
import api from '../../services/api';

const ClientSettings: React.FC = () => {
   const { showToast } = useToast();
   const [simulationMode, setSimulationMode] = React.useState(false);
   const [loading, setLoading] = React.useState(false);

   React.useEffect(() => {
      fetchSettings();
   }, []);

   const fetchSettings = async () => {
      try {
         const res = await api.get('/auth/me');
         setSimulationMode(res.data.simulationMode);
      } catch (error) {
         console.error('Error fetching settings:', error);
      }
   };

   const toggleSimulationMode = async () => {
      const newValue = !simulationMode;
      setSimulationMode(newValue); // Optimistic update

      try {
         await api.patch('/auth/me', { simulationMode: newValue });
         showToast(newValue ? 'Modo Simulación activado' : 'Modo Simulación desactivado', 'success');
      } catch (error: any) {
         setSimulationMode(!newValue); // Revert
         const msg = error.response?.data?.message || 'Error al actualizar configuración';
         showToast(msg, 'error');
      }
   };
   const inputClass = "w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-gray-900 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all placeholder:text-gray-400";
   const labelClass = "block text-sm font-bold text-gray-700 mb-1.5";

   return (
      <ClientLayout>
         <div className="max-w-4xl mx-auto space-y-12 pb-20">

            {/* Header */}
            <div className="border-b border-gray-200 pb-6">
               <h1 className="text-3xl font-black text-gray-900">Configuración</h1>
               <p className="text-gray-500 mt-2">Gestiona los detalles de tu empresa, preferencias y seguridad.</p>
            </div>

            {/* General Section */}
            <section id="general" className="scroll-mt-24">
               <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                  <span className="material-symbols-outlined text-gray-400">tune</span>
                  Información de la Empresa
               </h2>
               <div className="bg-white rounded-xl border border-gray-200 p-8 shadow-sm">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                     <div>
                        <label className={labelClass}>Nombre de la Empresa</label>
                        <input type="text" defaultValue="Cliente Corp" className={inputClass} />
                     </div>
                     <div>
                        <label className={labelClass}>Sitio Web</label>
                        <input type="text" defaultValue="https://www.clientecorp.com" className={inputClass} />
                     </div>
                     <div>
                        <label className={labelClass}>Industria</label>
                        <div className="relative">
                           <select className={`${inputClass} appearance-none`}>
                              <option>Fintech</option>
                              <option>Retail</option>
                              <option>Salud</option>
                              <option>Tecnología</option>
                           </select>
                           <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none">expand_more</span>
                        </div>
                     </div>
                     <div>
                        <label className={labelClass}>Tamaño de Empresa</label>
                        <div className="relative">
                           <select className={`${inputClass} appearance-none`}>
                              <option>1-10</option>
                              <option>11-50</option>
                              <option>51-200</option>
                              <option>200+</option>
                           </select>
                           <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none">expand_more</span>
                        </div>
                     </div>
                  </div>

                  <div className="mt-8 pt-6 border-t border-gray-100 grid grid-cols-1 md:grid-cols-2 gap-6">
                     <div>
                        <label className={labelClass}>Idioma</label>
                        <div className="relative">
                           <select className={`${inputClass} appearance-none`}>
                              <option>Español</option>
                              <option>English</option>
                           </select>
                           <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none">expand_more</span>
                        </div>
                     </div>
                     <div>
                        <label className={labelClass}>Zona Horaria</label>
                        <div className="relative">
                           <select className={`${inputClass} appearance-none`}>
                              <option>(GMT-05:00) Eastern Time</option>
                              <option>(GMT+01:00) Madrid</option>
                           </select>
                           <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none">expand_more</span>
                        </div>
                     </div>
                  </div>

                  <div className="mt-8 flex justify-end">
                     <button className="px-6 py-3 bg-dark text-white font-bold rounded-xl hover:bg-black transition-colors">Guardar Cambios</button>
                  </div>
               </div>
            </section>

            {/* Notifications Section */}
            <section id="notifications" className="scroll-mt-24">
               <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                  <span className="material-symbols-outlined text-gray-400">notifications</span>
                  Notificaciones
               </h2>
               <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
                  <div className="divide-y divide-gray-100">
                     {[
                        { title: 'Actualizaciones de Proyecto', desc: 'Recibe un email cuando haya novedades, entregas o cambios de estado.', checked: true },
                        { title: 'Nuevos Mensajes', desc: 'Aviso inmediato cuando un vendor te envíe un mensaje directo.', checked: true },
                        { title: 'Facturas y Pagos', desc: 'Notificaciones sobre facturas generadas y recibos de pago.', checked: false }
                     ].map((item, i) => (
                        <div key={i} className="p-6 flex items-start justify-between hover:bg-gray-50 transition-colors">
                           <div className="pr-8">
                              <h4 className="font-bold text-gray-900">{item.title}</h4>
                              <p className="text-sm text-gray-500 mt-1">{item.desc}</p>
                           </div>
                           <label className="relative inline-flex items-center cursor-pointer">
                              <input type="checkbox" defaultChecked={item.checked} className="sr-only peer" />
                              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                           </label>
                        </div>
                     ))}
                  </div>
               </div>
            </section>

            {/* Security Section */}
            <section id="security" className="scroll-mt-24">
               <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                  <span className="material-symbols-outlined text-gray-400">security</span>
                  Seguridad
               </h2>

               {/* Simulation Mode Switch */}
               <div className="bg-white rounded-xl border border-gray-200 p-8 shadow-sm mb-6">
                  <div className="flex justify-between items-center">
                     <div>
                        <h3 className="font-bold text-gray-900 flex items-center gap-2">
                           <span className="material-symbols-outlined text-purple-600">labs</span>
                           Modo Simulación de Pagos
                        </h3>
                        <p className="text-gray-500 text-sm mt-1 max-w-lg">
                           Permite aprobar pagos automáticamente simulando fondos suficientes. Útil para pruebas.
                        </p>
                     </div>
                     <label className="relative inline-flex items-center cursor-pointer">
                        <input
                           type="checkbox"
                           checked={simulationMode}
                           onChange={toggleSimulationMode}
                           className="sr-only peer"
                        />
                        <div className="w-14 h-7 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-purple-600"></div>
                     </label>
                  </div>
               </div>

               <div className="bg-white rounded-xl border border-gray-200 p-8 shadow-sm mb-6">
                  <h3 className="font-bold text-gray-900 mb-6">Cambiar Contraseña</h3>
                  <div className="space-y-4 max-w-md">
                     <div>
                        <label className={labelClass}>Contraseña Actual</label>
                        <input type="password" className={inputClass} />
                     </div>
                     <div>
                        <label className={labelClass}>Nueva Contraseña</label>
                        <input type="password" className={inputClass} />
                     </div>
                     <div>
                        <label className={labelClass}>Confirmar Nueva Contraseña</label>
                        <input type="password" className={inputClass} />
                     </div>
                     <button className="px-6 py-3 bg-white border border-gray-300 text-gray-700 font-bold rounded-xl hover:bg-gray-50 mt-2">Actualizar Contraseña</button>
                  </div>
               </div>

               <div className="bg-white rounded-xl border border-gray-200 p-8 shadow-sm">
                  <div className="flex justify-between items-center">
                     <div>
                        <h3 className="font-bold text-gray-900">Autenticación de Dos Factores (2FA)</h3>
                        <p className="text-gray-500 text-sm mt-1 max-w-lg">Añade una capa extra de seguridad a tu cuenta.</p>
                     </div>
                     <button className="px-6 py-3 bg-primary text-white font-bold rounded-xl hover:opacity-90">Activar 2FA</button>
                  </div>
               </div>
            </section>

            {/* Billing Section */}
            <section id="billing" className="scroll-mt-24">
               <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                  <span className="material-symbols-outlined text-gray-400">credit_card</span>
                  Facturación
               </h2>
               <div className="bg-white rounded-xl border border-gray-200 p-8 shadow-sm mb-6">
                  <div className="flex justify-between items-center mb-6">
                     <h3 className="font-bold text-gray-900">Métodos de Pago</h3>
                     <button className="text-sm text-primary font-bold hover:underline flex items-center gap-1">
                        <span className="material-symbols-outlined text-sm">add</span> Añadir Método
                     </button>
                  </div>
                  <div className="space-y-3">
                     <div className="flex items-center justify-between p-4 border border-gray-200 rounded-xl bg-gray-50">
                        <div className="flex items-center gap-4">
                           <div className="w-12 h-8 bg-white border border-gray-200 rounded flex items-center justify-center">
                              <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/Visa_Inc._logo.svg/2560px-Visa_Inc._logo.svg.png" alt="Visa" className="h-3 object-contain" />
                           </div>
                           <div>
                              <p className="font-bold text-gray-900 text-sm">Visa terminada en 4242</p>
                              <p className="text-xs text-gray-500">Expira 12/28</p>
                           </div>
                        </div>
                        <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded font-bold">Predeterminado</span>
                     </div>
                  </div>
               </div>

               <div className="bg-white rounded-xl border border-gray-200 p-8 shadow-sm mb-6">
                  <h3 className="font-bold text-gray-900 mb-6">Información Fiscal</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                     <div>
                        <label className={labelClass}>Nombre Fiscal</label>
                        <input type="text" defaultValue="Cliente Corp S.L." className={inputClass} />
                     </div>
                     <div>
                        <label className={labelClass}>ID Fiscal / CIF</label>
                        <input type="text" defaultValue="B-12345678" className={inputClass} />
                     </div>
                     <div className="md:col-span-2">
                        <label className={labelClass}>Dirección de Facturación</label>
                        <input type="text" defaultValue="Calle Tecnología 123, Madrid" className={inputClass} />
                     </div>
                  </div>
               </div>
            </section>

         </div>
      </ClientLayout>
   );
};

export default ClientSettings;