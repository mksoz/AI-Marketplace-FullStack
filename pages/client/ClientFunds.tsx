import React from 'react';
import { useNavigate } from 'react-router-dom';
import ClientLayout from '../../components/ClientLayout';

const ClientFunds: React.FC = () => {
  const navigate = useNavigate();

  return (
    <ClientLayout>
       <div className="space-y-8">
          <div className="flex flex-wrap justify-between items-start gap-4">
             <div className="max-w-xl">
                <h1 className="text-3xl font-black text-gray-900">Gestión de Fondos</h1>
                <p className="text-gray-500 mt-1">Supervise el estado de los fondos depositados en garantía para sus proyectos.</p>
             </div>
             <button onClick={() => navigate('/client/funds/deposit')} className="flex items-center gap-2 px-6 py-2.5 bg-primary text-white font-bold rounded-lg hover:opacity-90 shadow-sm">
                <span className="material-symbols-outlined">add</span>
                Depositar Fondos
             </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
             <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                <p className="text-gray-500 font-medium mb-2">Total en Garantía</p>
                <p className="text-3xl font-bold text-gray-900">$125,500.00</p>
                <div className="flex items-center gap-1 text-green-600 text-sm font-medium mt-1">
                   <span className="material-symbols-outlined text-base">arrow_upward</span> +2.5%
                </div>
             </div>
             <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                <p className="text-gray-500 font-medium mb-2">Total Liberado</p>
                <p className="text-3xl font-bold text-gray-900">$75,000.00</p>
                <div className="flex items-center gap-1 text-green-600 text-sm font-medium mt-1">
                   <span className="material-symbols-outlined text-base">arrow_upward</span> +5.1%
                </div>
             </div>
             <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                <p className="text-gray-500 font-medium mb-2">Fondos Pendientes</p>
                <p className="text-3xl font-bold text-gray-900">$15,500.00</p>
                <div className="flex items-center gap-1 text-orange-500 text-sm font-medium mt-1">
                   <span className="material-symbols-outlined text-base">arrow_upward</span> +1.2%
                </div>
             </div>
             <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                <p className="text-gray-500 font-medium mb-2">Proyectos Activos</p>
                <p className="text-3xl font-bold text-gray-900">4</p>
                <div className="flex items-center gap-1 text-red-500 text-sm font-medium mt-1">
                   <span className="material-symbols-outlined text-base">arrow_downward</span> -1.0%
                </div>
             </div>
          </div>

          <div className="space-y-4">
             <h2 className="text-xl font-bold text-gray-900">Desglose de Fondos por Proyecto</h2>
             <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
                <table className="w-full text-left">
                   <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                         <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Proyecto</th>
                         <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Vendor</th>
                         <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Presupuesto Total</th>
                         <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Fondos en Garantía</th>
                         <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Estado</th>
                         <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Acción</th>
                         <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Acción Rápida</th>
                      </tr>
                   </thead>
                   <tbody className="divide-y divide-gray-100">
                      <tr className="hover:bg-gray-50 transition-colors">
                         <td className="px-6 py-4 font-medium text-gray-900">Desarrollo de Chatbot IA</td>
                         <td className="px-6 py-4 text-gray-500">AI Solutions Inc.</td>
                         <td className="px-6 py-4 text-gray-500">$50,000</td>
                         <td className="px-6 py-4 text-gray-500">$25,000</td>
                         <td className="px-6 py-4">
                            <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-orange-100 text-orange-700">Acción Requerida</span>
                         </td>
                         <td className="px-6 py-4">
                            <button onClick={() => navigate('/client/funds/review')} className="px-4 py-2 bg-primary text-white text-sm font-bold rounded-lg hover:opacity-90 shadow-sm">Revisar Solicitud</button>
                         </td>
                         <td className="px-6 py-4">
                            <span className="text-xs text-gray-400">-</span>
                         </td>
                      </tr>
                      <tr className="hover:bg-gray-50 transition-colors">
                         <td className="px-6 py-4 font-medium text-gray-900">Plataforma de Análisis</td>
                         <td className="px-6 py-4 text-gray-500">DataDriven Co.</td>
                         <td className="px-6 py-4 text-gray-500">$75,000</td>
                         <td className="px-6 py-4 text-gray-500">$45,000</td>
                         <td className="px-6 py-4">
                            <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-700">Activo</span>
                         </td>
                         <td className="px-6 py-4">
                            <button onClick={() => navigate('/client/projects/track')} className="px-4 py-2 bg-white border border-gray-300 text-gray-700 text-sm font-bold rounded-lg hover:bg-gray-50">Ver Detalles</button>
                         </td>
                         <td className="px-6 py-4">
                            <button onClick={() => navigate('/client/funds/deposit')} className="text-primary font-bold text-xs hover:underline flex items-center gap-1">
                                <span className="material-symbols-outlined text-sm">add_circle</span>
                                Añadir $15k
                            </button>
                         </td>
                      </tr>
                      <tr className="hover:bg-gray-50 transition-colors">
                         <td className="px-6 py-4 font-medium text-gray-900">Sistema Reconocimiento</td>
                         <td className="px-6 py-4 text-gray-500">Visionary Tech</td>
                         <td className="px-6 py-4 text-gray-500">$30,000</td>
                         <td className="px-6 py-4 text-gray-500">$0</td>
                         <td className="px-6 py-4">
                            <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700">Completado</span>
                         </td>
                         <td className="px-6 py-4">
                            <button onClick={() => navigate('/client/projects/track')} className="px-4 py-2 bg-white border border-gray-300 text-gray-700 text-sm font-bold rounded-lg hover:bg-gray-50">Ver Detalles</button>
                         </td>
                         <td className="px-6 py-4">
                            <span className="text-xs text-gray-400">-</span>
                         </td>
                      </tr>
                   </tbody>
                </table>
             </div>
          </div>
       </div>
    </ClientLayout>
  );
};

export default ClientFunds;