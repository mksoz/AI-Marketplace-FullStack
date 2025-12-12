import React from 'react';
import VendorLayout from '../../components/VendorLayout';

const VendorProfile: React.FC = () => {
  return (
    <VendorLayout>
      <div className="space-y-8">
         {/* Header with Call to Action */}
         <div className="flex flex-col md:flex-row justify-between items-end gap-4">
            <div>
               <h1 className="text-3xl font-black text-gray-900">Perfil Público</h1>
               <p className="text-gray-500 mt-1">Así es como te ven los clientes potenciales. Optimízalo para ganar más leads.</p>
            </div>
            <div className="flex gap-3">
               <button className="px-4 py-2 border border-gray-300 text-gray-700 font-bold rounded-lg hover:bg-gray-50 flex items-center gap-2">
                  <span className="material-symbols-outlined text-lg">visibility</span> Ver como Cliente
               </button>
               <button className="px-4 py-2 bg-black text-white font-bold rounded-lg hover:bg-gray-800 flex items-center gap-2">
                  <span className="material-symbols-outlined text-lg">share</span> Compartir Enlace
               </button>
            </div>
         </div>

         <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Left Column: Main Profile Edit */}
            <div className="lg:col-span-2 space-y-8">
                
                {/* Brand Header */}
                <div className="bg-white p-8 rounded-xl border border-gray-200 shadow-sm relative overflow-hidden group">
                    <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-r from-indigo-500 to-purple-600"></div>
                    <button className="absolute top-4 right-4 bg-white/20 hover:bg-white/40 text-white p-2 rounded-lg backdrop-blur-sm transition-colors">
                        <span className="material-symbols-outlined">edit</span>
                    </button>
                    
                    <div className="relative mt-8 flex flex-col md:flex-row gap-6 items-start">
                        <div className="w-24 h-24 rounded-2xl bg-white p-1 shadow-lg -mt-4">
                            <img src="https://picsum.photos/id/40/200/200" className="w-full h-full rounded-xl object-cover" alt="Logo" />
                        </div>
                        <div className="flex-1 pt-2">
                            <h2 className="text-2xl font-bold text-gray-900">QuantumLeap AI</h2>
                            <p className="text-lg text-gray-500 leading-relaxed">Expertos en Machine Learning y Análisis Predictivo para Finanzas.</p>
                            <div className="flex gap-2 mt-4 flex-wrap">
                                {['Python', 'TensorFlow', 'Fintech', 'Big Data'].map(tag => (
                                    <span key={tag} className="px-3 py-1 bg-gray-100 rounded-full text-xs font-bold text-gray-600 border border-gray-200">{tag}</span>
                                ))}
                                <button className="px-3 py-1 border border-dashed border-gray-300 rounded-full text-xs font-bold text-gray-400 hover:text-primary hover:border-primary">+ Tag</button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Portfolio Section */}
                <div className="bg-white p-8 rounded-xl border border-gray-200 shadow-sm">
                    <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                        <span className="material-symbols-outlined text-gray-400">cases</span> Portafolio Destacado
                    </h3>
                    <button className="flex items-center gap-1 text-sm font-bold text-primary hover:bg-primary/5 px-3 py-1.5 rounded-lg transition-colors"><span className="material-symbols-outlined text-lg">add_circle</span> Añadir Proyecto</button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="border border-gray-200 rounded-xl p-4 hover:border-primary cursor-pointer transition-all hover:shadow-md group">
                            <div className="h-40 bg-gray-100 rounded-lg mb-3 bg-cover bg-center relative overflow-hidden" style={{backgroundImage: 'url("https://picsum.photos/id/1/400/300")'}}>
                                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white font-bold">Editar</div>
                            </div>
                            <p className="font-bold text-gray-900 text-lg">App de Logística AI</p>
                            <p className="text-xs text-gray-500 mt-1">Optimización de rutas en tiempo real.</p>
                        </div>
                        <div className="border border-gray-200 rounded-xl p-4 hover:border-primary cursor-pointer transition-all hover:shadow-md group">
                            <div className="h-40 bg-gray-100 rounded-lg mb-3 bg-cover bg-center relative overflow-hidden" style={{backgroundImage: 'url("https://picsum.photos/id/2/400/300")'}}>
                                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white font-bold">Editar</div>
                            </div>
                            <p className="font-bold text-gray-900 text-lg">Dashboard Financiero</p>
                            <p className="text-xs text-gray-500 mt-1">Predicción de fraude bancario.</p>
                        </div>
                    </div>
                </div>

                {/* Services Section */}
                <div className="bg-white p-8 rounded-xl border border-gray-200 shadow-sm">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                            <span className="material-symbols-outlined text-gray-400">design_services</span> Servicios
                        </h3>
                        <button className="text-sm font-bold text-gray-500 hover:text-dark">Gestionar</button>
                    </div>
                    <div className="space-y-4">
                        <div className="flex justify-between items-center p-4 border border-gray-100 rounded-lg hover:bg-gray-50">
                            <div>
                                <h4 className="font-bold text-gray-900">Desarrollo End-to-End</h4>
                                <p className="text-xs text-gray-500">Desde concepto hasta despliegue.</p>
                            </div>
                            <span className="font-bold text-gray-900">$50k+</span>
                        </div>
                        <div className="flex justify-between items-center p-4 border border-gray-100 rounded-lg hover:bg-gray-50">
                            <div>
                                <h4 className="font-bold text-gray-900">Auditoría de Algoritmos</h4>
                                <p className="text-xs text-gray-500">Revisión de sesgo y performance.</p>
                            </div>
                            <span className="font-bold text-gray-900">$150/hr</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Right Column: Stats & Sidebar */}
            <div className="space-y-8">
                
                {/* Profile Strength */}
                <div className="bg-gradient-to-br from-gray-900 to-black text-white p-6 rounded-xl shadow-lg relative overflow-hidden">
                    <div className="relative z-10">
                        <h3 className="font-bold text-lg mb-2">Fortaleza del Perfil</h3>
                        <div className="flex items-center gap-4 mb-4">
                            <div className="flex-1 bg-white/20 rounded-full h-2">
                                <div className="bg-green-400 h-2 rounded-full" style={{width: '85%'}}></div>
                            </div>
                            <span className="font-bold text-green-400">85%</span>
                        </div>
                        <p className="text-xs text-gray-300 mb-4">Un perfil completo aumenta un 40% las posibilidades de ser contactado.</p>
                        <button className="w-full py-2 bg-white text-black font-bold text-xs rounded-lg hover:bg-gray-100">
                            Completar: Añadir Video Pitch
                        </button>
                    </div>
                    <span className="material-symbols-outlined absolute -right-4 -bottom-4 text-9xl text-white/5">verified</span>
                </div>

                {/* Quick Stats */}
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                    <h3 className="font-bold text-gray-900 mb-4">Impacto</h3>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="text-center p-3 bg-gray-50 rounded-lg">
                            <span className="block text-2xl font-black text-gray-900">4.9</span>
                            <span className="text-xs text-gray-500 uppercase font-bold">Rating</span>
                        </div>
                        <div className="text-center p-3 bg-gray-50 rounded-lg">
                            <span className="block text-2xl font-black text-gray-900">12</span>
                            <span className="text-xs text-gray-500 uppercase font-bold">Proyectos</span>
                        </div>
                        <div className="text-center p-3 bg-gray-50 rounded-lg">
                            <span className="block text-2xl font-black text-gray-900">100%</span>
                            <span className="text-xs text-gray-500 uppercase font-bold">JSS</span>
                        </div>
                        <div className="text-center p-3 bg-gray-50 rounded-lg">
                            <span className="block text-2xl font-black text-gray-900">2h</span>
                            <span className="text-xs text-gray-500 uppercase font-bold">Respuesta</span>
                        </div>
                    </div>
                </div>

                {/* Reviews Widget */}
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="font-bold text-gray-900">Reseñas Recientes</h3>
                        <span className="text-xs text-primary font-bold">Ver todas</span>
                    </div>
                    <div className="space-y-4">
                        <div className="border-b border-gray-100 pb-3">
                            <div className="flex items-center gap-2 mb-1">
                                <span className="font-bold text-sm text-gray-900">Cliente Corp</span>
                                <div className="flex text-yellow-400 text-xs">★★★★★</div>
                            </div>
                            <p className="text-xs text-gray-600 italic">"Excelente trabajo en el motor de recomendación. Muy profesionales."</p>
                        </div>
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <span className="font-bold text-sm text-gray-900">StartUp Inc</span>
                                <div className="flex text-yellow-400 text-xs">★★★★☆</div>
                            </div>
                            <p className="text-xs text-gray-600 italic">"Buena calidad técnica, aunque hubo un pequeño retraso en la entrega."</p>
                        </div>
                    </div>
                </div>

            </div>
         </div>
      </div>
    </VendorLayout>
  );
};

export default VendorProfile;