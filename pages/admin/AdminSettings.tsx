import React from 'react';
import AdminLayout from '../../components/AdminLayout';

const AdminSettings: React.FC = () => {
  return (
    <AdminLayout>
      <div className="space-y-6">
         <h1 className="text-3xl font-black text-gray-900">Configuración General</h1>
         <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
             <div className="flex items-center justify-between py-4 border-b border-gray-100">
                 <div>
                     <p className="font-bold">Modo Mantenimiento</p>
                     <p className="text-sm text-gray-500">Desactiva el acceso a usuarios</p>
                 </div>
                 <input type="checkbox" className="w-5 h-5" />
             </div>
             <div className="flex items-center justify-between py-4">
                 <div>
                     <p className="font-bold">Registros Abiertos</p>
                     <p className="text-sm text-gray-500">Permitir nuevos usuarios</p>
                 </div>
                 <input type="checkbox" defaultChecked className="w-5 h-5" />
             </div>
         </div>
      </div>
    </AdminLayout>
  );
};

export default AdminSettings;