import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import VendorLayout from '../../components/VendorLayout';

const VendorTemplateEditor: React.FC = () => {
  const navigate = useNavigate();

  return (
    <VendorLayout>
       <div className="space-y-6">
          {/* Header */}
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 border-b border-gray-200 pb-6">
             <div>
                <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
                    <button onClick={() => navigate('/vendor/proposals')} className="hover:text-dark">Propuestas</button>
                    <span className="material-symbols-outlined text-sm">chevron_right</span>
                    <span>Editor</span>
                </div>
                <h1 className="text-3xl font-black text-gray-900">Configurador de Plantilla de Requisitos</h1>
                <p className="text-gray-500 mt-1">Diseña visualmente las plantillas que los clientes completarán.</p>
             </div>
             <div className="flex gap-3">
                 <button className="px-4 py-2 bg-blue-100 text-blue-700 font-bold rounded-lg text-sm hover:bg-blue-200 flex items-center gap-2">
                    <span className="material-symbols-outlined text-lg">visibility</span> Previsualizar
                 </button>
                 <button className="px-4 py-2 bg-[#1313ec] text-white font-bold rounded-lg text-sm hover:opacity-90 flex items-center gap-2 shadow-sm">
                    <span className="material-symbols-outlined text-lg">save</span> Guardar Plantilla
                 </button>
             </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
             
             {/* Left: Editor Canvas */}
             <div className="lg:col-span-2 space-y-6">
                <div className="bg-white p-4 rounded-xl border border-gray-200 flex items-center justify-between">
                    <span className="font-bold text-gray-700">Editor de Plantilla:</span>
                    <select className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-1.5 text-sm font-medium outline-none">
                        <option>Plantilla para Proyectos IA (Default)</option>
                        <option>Consultoría Técnica</option>
                    </select>
                </div>

                <div className="bg-white border border-gray-200 rounded-xl p-8 min-h-[500px] relative">
                    <div className="space-y-6">
                        
                        {/* Section 1 */}
                        <div className="group border border-gray-200 rounded-xl p-6 hover:border-primary/50 hover:shadow-md transition-all relative bg-white">
                            <div className="flex justify-between items-center mb-4">
                                <div className="flex items-center gap-3">
                                    <span className="material-symbols-outlined text-gray-300 cursor-move">drag_indicator</span>
                                    <h3 className="font-bold text-lg text-gray-900">Alcance del Proyecto</h3>
                                </div>
                                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button className="p-1 text-gray-400 hover:text-dark"><span className="material-symbols-outlined">edit</span></button>
                                    <button className="p-1 text-gray-400 hover:text-red-500"><span className="material-symbols-outlined">delete</span></button>
                                </div>
                            </div>
                            <div className="space-y-4 pl-8">
                                <div className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg border border-gray-100 border-dashed">
                                    <span className="material-symbols-outlined text-gray-400 text-sm">drag_handle</span>
                                    <span className="text-sm font-medium text-gray-700 flex-1">Objetivos del proyecto</span>
                                    <span className="text-xs bg-gray-200 text-gray-600 px-2 py-0.5 rounded">Campo de Texto</span>
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <div className="w-8 h-4 bg-[#1313ec] rounded-full relative"><div className="absolute right-0.5 top-0.5 w-3 h-3 bg-white rounded-full"></div></div>
                                        <span className="text-xs text-gray-500">Obligatorio</span>
                                    </label>
                                </div>
                                <div className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg border border-gray-100 border-dashed">
                                    <span className="material-symbols-outlined text-gray-400 text-sm">drag_handle</span>
                                    <span className="text-sm font-medium text-gray-700 flex-1">Funcionalidades clave</span>
                                    <span className="text-xs bg-gray-200 text-gray-600 px-2 py-0.5 rounded">Selección Múltiple</span>
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <div className="w-8 h-4 bg-gray-300 rounded-full relative"><div className="absolute left-0.5 top-0.5 w-3 h-3 bg-white rounded-full"></div></div>
                                        <span className="text-xs text-gray-500">Opcional</span>
                                    </label>
                                </div>
                                <button className="w-full py-2 border border-dashed border-gray-300 rounded-lg text-sm text-gray-500 hover:bg-gray-50 hover:text-primary hover:border-primary transition-colors">
                                    + Añadir Campo
                                </button>
                            </div>
                        </div>

                        {/* Section 2 */}
                        <div className="group border border-gray-200 rounded-xl p-6 hover:border-primary/50 hover:shadow-md transition-all relative bg-white">
                            <div className="flex justify-between items-center mb-4">
                                <div className="flex items-center gap-3">
                                    <span className="material-symbols-outlined text-gray-300 cursor-move">drag_indicator</span>
                                    <h3 className="font-bold text-lg text-gray-900">Presupuesto y Plazos</h3>
                                </div>
                                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button className="p-1 text-gray-400 hover:text-dark"><span className="material-symbols-outlined">edit</span></button>
                                    <button className="p-1 text-gray-400 hover:text-red-500"><span className="material-symbols-outlined">delete</span></button>
                                </div>
                            </div>
                            <div className="space-y-4 pl-8">
                                <div className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg border border-gray-100 border-dashed">
                                    <span className="material-symbols-outlined text-gray-400 text-sm">drag_handle</span>
                                    <span className="text-sm font-medium text-gray-700 flex-1">Rango de presupuesto</span>
                                    <span className="text-xs bg-gray-200 text-gray-600 px-2 py-0.5 rounded">Rango Numérico</span>
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <div className="w-8 h-4 bg-[#1313ec] rounded-full relative"><div className="absolute right-0.5 top-0.5 w-3 h-3 bg-white rounded-full"></div></div>
                                        <span className="text-xs text-gray-500">Obligatorio</span>
                                    </label>
                                </div>
                                <button className="w-full py-2 border border-dashed border-gray-300 rounded-lg text-sm text-gray-500 hover:bg-gray-50 hover:text-primary hover:border-primary transition-colors">
                                    + Añadir Campo
                                </button>
                            </div>
                        </div>

                    </div>

                    <button className="w-full mt-6 py-4 bg-blue-50 text-[#1313ec] rounded-xl font-bold border-2 border-dashed border-blue-200 hover:bg-blue-100 hover:border-blue-300 transition-colors flex items-center justify-center gap-2">
                        <span className="material-symbols-outlined">add_circle</span> Añadir Sección
                    </button>
                </div>
             </div>

             {/* Right: Insights & Tips */}
             <div className="space-y-6">
                
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                    <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <span className="material-symbols-outlined text-[#1313ec]">tips_and_updates</span>
                        Guías Contextuales
                    </h3>
                    <p className="text-sm text-gray-600 mb-4 leading-relaxed">
                        Define requisitos claros para atraer a los clientes adecuados. Una buena plantilla reduce las idas y vueltas y acelera el inicio del proyecto.
                    </p>
                    <div className="space-y-2">
                        <button className="w-full text-left text-xs font-bold text-[#1313ec] hover:underline flex justify-between items-center">
                            Mejores prácticas para definir el alcance <span className="material-symbols-outlined text-sm">arrow_forward</span>
                        </button>
                        <button className="w-full text-left text-xs font-bold text-[#1313ec] hover:underline flex justify-between items-center">
                            Cómo preguntar sobre el presupuesto <span className="material-symbols-outlined text-sm">arrow_forward</span>
                        </button>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                    <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <span className="material-symbols-outlined text-[#1313ec]">analytics</span>
                        Análisis de Impacto
                    </h3>
                    <div className="space-y-4">
                        <div className="flex gap-3">
                            <div className="w-8 h-8 rounded-full bg-green-100 text-green-600 flex items-center justify-center flex-shrink-0">
                                <span className="material-symbols-outlined text-sm">arrow_upward</span>
                            </div>
                            <div>
                                <p className="text-sm font-bold text-gray-900">Calidad de Propuestas</p>
                                <p className="text-xs text-gray-500">Añadir más campos obligatorios suele aumentar la calidad de la información inicial.</p>
                            </div>
                        </div>
                        <div className="flex gap-3">
                            <div className="w-8 h-8 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center flex-shrink-0">
                                <span className="material-symbols-outlined text-sm">warning</span>
                            </div>
                            <div>
                                <p className="text-sm font-bold text-gray-900">Volumen de Propuestas</p>
                                <p className="text-xs text-gray-500">Una plantilla muy extensa puede disuadir a algunos clientes. Busca un equilibrio.</p>
                            </div>
                        </div>
                    </div>
                </div>

             </div>
          </div>
       </div>
    </VendorLayout>
  );
};

export default VendorTemplateEditor;