import React from 'react';
import ClientLayout from '../../components/ClientLayout';

const ClientProjectMilestones: React.FC = () => {
  return (
    <ClientLayout>
       <div className="max-w-3xl mx-auto space-y-8">
          <div className="text-center mb-10">
            <h1 className="text-3xl font-black text-gray-900">Hitos del Proyecto</h1>
            <p className="text-gray-500 mt-2">Cronograma de pagos y entregas principales.</p>
          </div>

          <div className="relative pl-8 space-y-12 before:content-[''] before:absolute before:top-0 before:left-[23px] before:h-full before:w-0.5 before:bg-gray-200">
             
             {/* Milestone 1 - Completed */}
             <div className="relative">
                <div className="absolute -left-[29px] top-0 h-12 w-12 rounded-full bg-green-100 border-4 border-white shadow-sm flex items-center justify-center text-green-600 z-10">
                   <span className="material-symbols-outlined">check</span>
                </div>
                <div className="bg-white p-6 rounded-2xl border border-green-200 shadow-sm relative overflow-hidden">
                   <div className="absolute top-0 right-0 bg-green-500 text-white text-xs font-bold px-3 py-1 rounded-bl-xl">PAGADO</div>
                   <h3 className="text-xl font-bold text-gray-900 mb-2">Fase 1: Descubrimiento y Diseño</h3>
                   <p className="text-gray-600 mb-4">Definición de requerimientos, wireframes y arquitectura técnica.</p>
                   <div className="flex justify-between items-center text-sm">
                      <span className="font-bold text-gray-900">$5,000.00 USD</span>
                      <span className="text-gray-500">Liberado: 15 Ago</span>
                   </div>
                </div>
             </div>

             {/* Milestone 2 - Current */}
             <div className="relative">
                <div className="absolute -left-[29px] top-0 h-12 w-12 rounded-full bg-primary text-white border-4 border-white shadow-lg flex items-center justify-center z-10">
                   <span className="material-symbols-outlined animate-pulse">sync</span>
                </div>
                <div className="bg-white p-6 rounded-2xl border-2 border-primary shadow-md relative">
                   <div className="absolute top-0 right-0 bg-primary text-white text-xs font-bold px-3 py-1 rounded-bl-xl">EN PROGRESO</div>
                   <h3 className="text-xl font-bold text-gray-900 mb-2">Fase 2: Desarrollo MVP</h3>
                   <p className="text-gray-600 mb-4">Implementación del core backend y frontend funcional.</p>
                   
                   <div className="bg-gray-100 rounded-full h-2.5 mb-4">
                      <div className="bg-primary h-2.5 rounded-full" style={{width: '60%'}}></div>
                   </div>

                   <div className="flex justify-between items-center text-sm border-t border-gray-100 pt-4">
                      <div>
                         <span className="block font-bold text-gray-900">$10,000.00 USD</span>
                         <span className="text-xs text-gray-500">En Garantía (Escrow)</span>
                      </div>
                      <div className="text-right">
                         <span className="block text-primary font-bold">Entrega estimada</span>
                         <span className="text-xs text-gray-500">30 Oct, 2024</span>
                      </div>
                   </div>
                </div>
             </div>

             {/* Milestone 3 - Pending */}
             <div className="relative">
                <div className="absolute -left-[29px] top-0 h-12 w-12 rounded-full bg-white border-2 border-gray-300 flex items-center justify-center text-gray-300 z-10">
                   <span className="font-bold">3</span>
                </div>
                <div className="bg-gray-50 p-6 rounded-2xl border border-gray-200 border-dashed opacity-70">
                   <h3 className="text-xl font-bold text-gray-500 mb-2">Fase 3: QA y Despliegue</h3>
                   <p className="text-gray-400 mb-4">Pruebas, corrección de errores y lanzamiento a producción.</p>
                   <div className="flex justify-between items-center text-sm">
                      <span className="font-bold text-gray-400">$5,000.00 USD</span>
                      <span className="text-gray-400">Pendiente</span>
                   </div>
                </div>
             </div>

          </div>
       </div>
    </ClientLayout>
  );
};

export default ClientProjectMilestones;