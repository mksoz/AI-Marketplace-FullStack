import React from 'react';
import ClientLayout from '../../components/ClientLayout';

const ClientReviewRelease: React.FC = () => {
  return (
    <ClientLayout>
       <div className="max-w-4xl mx-auto space-y-6">
          <div className="flex items-center justify-between">
             <h1 className="text-3xl font-black text-gray-900">Revisar Solicitud de Liberación</h1>
             <span className="px-3 py-1 bg-yellow-100 text-yellow-800 text-sm font-bold rounded-full flex items-center gap-1">
                <span className="material-symbols-outlined text-base">hourglass_top</span> Pendiente de Revisión
             </span>
          </div>

          <div className="bg-white border border-gray-200 rounded-xl p-8 space-y-8">
             {/* Header Info */}
             <div className="flex flex-col md:flex-row gap-6 border border-gray-100 rounded-lg overflow-hidden">
                <div className="w-full md:w-1/3 bg-gray-100 h-48 md:h-auto bg-cover bg-center" style={{backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuDK2dH-q1phG6wFqxg5BihvvtSU2ldWxAVAerugpYUgw6ovhm9uhSjDccExJmpJJw7GlAf2VFBMwm0EDAJO5Rvl7rY4HSA_oxlVQvO4pZiV4WHRX3S0gpbgEsyvIlfpN4x0Sk-_zXu7J_uGdvKlgpyQyEAyGnCI2R7h27iGokzKxWJSD7c7FbyfoSvVlOdNqaehUve-gguWmPdEdTL0KepIar0JLEPdBlidTL_wHGKFcBIoun8bCXtoaLMLwhWxovsa3372dP8L9Pg")'}}></div>
                <div className="p-6 flex flex-col justify-center flex-1">
                   <p className="text-sm text-gray-500">Hito Entregado</p>
                   <h2 className="text-2xl font-bold text-gray-900 mb-2">Modelo de Recomendación v1</h2>
                   <p className="text-gray-600">El vendor ha marcado este hito como completado y solicita la liberación de los fondos correspondientes.</p>
                </div>
             </div>

             {/* Details Grid */}
             <div className="grid grid-cols-2 md:grid-cols-4 gap-6 py-6 border-y border-gray-100">
                <div>
                   <p className="text-sm text-gray-500 mb-1">Monto a Liberar</p>
                   <p className="text-lg font-bold text-gray-900">$5,000.00 USD</p>
                </div>
                <div>
                   <p className="text-sm text-gray-500 mb-1">Solicitado por</p>
                   <p className="text-base font-medium text-gray-900">AI Solutions Inc.</p>
                </div>
                <div>
                   <p className="text-sm text-gray-500 mb-1">Fecha Solicitud</p>
                   <p className="text-base font-medium text-gray-900">15 Ago, 2024</p>
                </div>
                <div>
                   <p className="text-sm text-gray-500 mb-1">Fondos en Escrow</p>
                   <p className="text-base font-medium text-gray-900">$5,000.00 USD</p>
                </div>
             </div>

             {/* Evidence */}
             <div>
                <h3 className="font-bold text-lg text-gray-900 mb-4">Evidencia de Trabajo Completado</h3>
                <div className="space-y-3">
                   <div className="flex items-center gap-4 p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
                      <div className="w-10 h-10 bg-blue-50 text-[#1313ec] rounded-lg flex items-center justify-center">
                         <span className="material-symbols-outlined">description</span>
                      </div>
                      <div className="flex-1">
                         <p className="font-medium text-gray-900">Reporte_Final_Recomendador.pdf</p>
                         <p className="text-xs text-gray-500">1.2 MB</p>
                      </div>
                      <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-200 rounded-full">
                         <span className="material-symbols-outlined">download</span>
                      </button>
                   </div>
                   <div className="flex items-center gap-4 p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
                      <div className="w-10 h-10 bg-blue-50 text-[#1313ec] rounded-lg flex items-center justify-center">
                         <span className="material-symbols-outlined">link</span>
                      </div>
                      <div className="flex-1">
                         <p className="font-medium text-gray-900">Acceso a Repositorio en GitHub</p>
                         <p className="text-xs text-gray-500">github.com/aisolutions/retail-rec-model</p>
                      </div>
                      <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-200 rounded-full">
                         <span className="material-symbols-outlined">open_in_new</span>
                      </button>
                   </div>
                </div>
                <div className="mt-4 bg-gray-50 p-4 rounded-lg">
                   <p className="text-sm font-bold text-gray-800 mb-1">Comentarios del Vendor:</p>
                   <p className="text-sm text-gray-600">"Hemos completado el desarrollo del modelo según las especificaciones. Adjuntamos el reporte final y el enlace al repo. Quedamos a su disposición."</p>
                </div>
             </div>

             {/* Actions */}
             <div className="pt-6 border-t border-gray-100 flex flex-col sm:flex-row justify-between items-center gap-4">
                <div>
                   <button className="flex items-center gap-1 text-sm text-gray-500 hover:text-[#1313ec] font-medium">
                      <span className="material-symbols-outlined text-lg">gavel</span>
                      ¿Problemas? Iniciar una Disputa
                   </button>
                   <p className="text-xs text-gray-400 mt-1">Un mediador intervendrá para resolver el problema.</p>
                </div>
                <div className="flex gap-3 w-full sm:w-auto">
                   <button className="flex-1 sm:flex-none px-6 py-3 border border-red-600 text-red-600 font-bold rounded-lg hover:bg-red-50">Rechazar</button>
                   <button className="flex-1 sm:flex-none px-6 py-3 bg-green-600 text-white font-bold rounded-lg hover:bg-green-700 shadow-sm">Aprobar Liberación</button>
                </div>
             </div>
          </div>
       </div>
    </ClientLayout>
  );
};

export default ClientReviewRelease;