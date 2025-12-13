import React from 'react';
import AdminLayout from '../../components/AdminLayout';

const AdminMetrics: React.FC = () => {
  return (
    <AdminLayout>
      <div className="space-y-6">
         <h1 className="text-3xl font-black text-gray-900">Métricas & Insights</h1>
         
         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm h-64 flex flex-col justify-center items-center">
                 <p className="text-gray-400 mb-2">Gráfico de GMV Mensual</p>
                 <div className="w-full h-32 bg-blue-50 rounded flex items-end justify-between px-4 pb-2">
                     <div className="w-8 h-10 bg-blue-300"></div>
                     <div className="w-8 h-16 bg-blue-400"></div>
                     <div className="w-8 h-12 bg-blue-300"></div>
                     <div className="w-8 h-24 bg-blue-500"></div>
                     <div className="w-8 h-20 bg-blue-400"></div>
                 </div>
             </div>
             <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm h-64 flex flex-col justify-center items-center">
                 <p className="text-gray-400 mb-2">Conversión de Leads</p>
                 <div className="flex gap-4 items-end">
                     <div className="text-center">
                         <div className="w-16 h-16 rounded-full border-4 border-indigo-500 flex items-center justify-center font-bold">12%</div>
                         <p className="text-xs mt-2">Conversión</p>
                     </div>
                 </div>
             </div>
         </div>

         <div className="bg-gradient-to-r from-gray-900 to-gray-800 text-white p-8 rounded-xl shadow-lg">
             <h2 className="text-2xl font-bold mb-2">Benchmarks IA (Beta)</h2>
             <p className="text-gray-300 mb-4">Herramienta de consultoría para comparar vendors.</p>
             <button className="bg-primary text-white px-4 py-2 rounded-lg font-bold">Generar Reporte Demo</button>
         </div>
      </div>
    </AdminLayout>
  );
};

export default AdminMetrics;