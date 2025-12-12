import React from 'react';
import VendorLayout from '../../components/VendorLayout';

const VendorClients: React.FC = () => {
  return (
    <VendorLayout>
      <div className="space-y-8">
          <div className="flex justify-between items-center">
             <h1 className="text-3xl font-black text-gray-900">Cartera de Clientes</h1>
             <button className="bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg text-sm font-bold hover:bg-gray-50">Exportar CSV</button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
             {/* Client Card */}
             <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all group">
                 <div className="flex justify-between items-start mb-4">
                     <div className="flex items-center gap-4">
                         <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center text-xl font-bold text-gray-500 group-hover:bg-[#1313ec] group-hover:text-white transition-colors">CC</div>
                         <div>
                             <h3 className="font-bold text-lg text-gray-900">Cliente Corp</h3>
                             <p className="text-sm text-gray-500">San Francisco, CA</p>
                         </div>
                     </div>
                     <span className="w-3 h-3 bg-green-500 rounded-full border-2 border-white shadow-sm" title="Activo"></span>
                 </div>
                 
                 <div className="bg-gray-50 rounded-lg p-3 mb-4 flex justify-between items-center">
                     <div>
                         <p className="text-xs text-gray-500 uppercase font-bold">LTV (Valor)</p>
                         <p className="font-black text-gray-900 text-lg">$120k</p>
                     </div>
                     <div className="text-right">
                         <p className="text-xs text-gray-500 uppercase font-bold">Proyectos</p>
                         <p className="font-black text-gray-900 text-lg">2</p>
                     </div>
                 </div>

                 <div className="border-t border-gray-100 pt-4 space-y-2">
                     <div className="flex justify-between text-sm">
                         <span className="text-gray-500">Último contacto</span>
                         <span className="font-medium text-gray-900">Hace 2 días</span>
                     </div>
                     <div className="flex justify-between text-sm">
                         <span className="text-gray-500">Pagos pendientes</span>
                         <span className="font-bold text-red-500">$5,000</span>
                     </div>
                 </div>
                 
                 <div className="grid grid-cols-2 gap-2 mt-6">
                     <button className="py-2 border border-gray-200 text-gray-600 font-bold text-sm rounded-lg hover:bg-gray-50 flex items-center justify-center gap-1">
                        <span className="material-symbols-outlined text-sm">chat</span> Mensaje
                     </button>
                     <button className="py-2 bg-gray-900 text-white font-bold text-sm rounded-lg hover:bg-black transition-colors">
                        Ver Perfil
                     </button>
                 </div>
             </div>

             {/* Add Client Placeholder */}
             <div className="border-2 border-dashed border-gray-200 rounded-xl flex flex-col items-center justify-center p-6 text-gray-400 hover:border-primary hover:text-primary hover:bg-primary/5 transition-colors cursor-pointer min-h-[300px]">
                 <span className="material-symbols-outlined text-4xl mb-2">person_add</span>
                 <p className="font-bold">Invitar Nuevo Cliente</p>
             </div>
          </div>
      </div>
    </VendorLayout>
  );
};

export default VendorClients;