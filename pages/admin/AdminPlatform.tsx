import React from 'react';
import AdminLayout from '../../components/AdminLayout';

const AdminPlatform: React.FC = () => {
  return (
    <AdminLayout>
      <div className="space-y-6">
         <h1 className="text-3xl font-black text-gray-900">Plataforma</h1>
         
         <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm max-w-2xl">
             <h2 className="text-xl font-bold mb-4">Comisiones y Tarifas</h2>
             <div className="space-y-4">
                 <div>
                     <label className="block text-sm font-bold text-gray-700 mb-1">Comisión Vendor (%)</label>
                     <input type="number" defaultValue="10" className="w-full border border-gray-300 rounded-lg px-4 py-2" />
                 </div>
                 <div>
                     <label className="block text-sm font-bold text-gray-700 mb-1">Fee Cliente (%)</label>
                     <input type="number" defaultValue="3" className="w-full border border-gray-300 rounded-lg px-4 py-2" />
                 </div>
                 <button className="bg-gray-900 text-white px-4 py-2 rounded-lg text-sm font-bold">Guardar Cambios</button>
             </div>
         </div>

         <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm max-w-2xl">
             <h2 className="text-xl font-bold mb-4">Configuración Agente IA</h2>
             <div className="space-y-4">
                 <div>
                     <label className="block text-sm font-bold text-gray-700 mb-1">System Prompt Global</label>
                     <textarea className="w-full border border-gray-300 rounded-lg px-4 py-2 h-32" defaultValue="You are a helpful assistant for B2B matching..."></textarea>
                 </div>
                 <button className="bg-purple-600 text-white px-4 py-2 rounded-lg text-sm font-bold">Actualizar Prompt</button>
             </div>
         </div>
      </div>
    </AdminLayout>
  );
};

export default AdminPlatform;