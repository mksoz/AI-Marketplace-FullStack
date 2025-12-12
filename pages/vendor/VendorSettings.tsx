import React, { useState } from 'react';
import VendorLayout from '../../components/VendorLayout';

const VendorSettings: React.FC = () => {
  const inputClass = "w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-gray-900 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all placeholder:text-gray-400";
  const labelClass = "block text-sm font-bold text-gray-700 mb-1.5";

  // State for Gold Lead Criteria
  const [goldCriteria, setGoldCriteria] = useState<string[]>([
      'Presupuesto > $50k', 'Contrato a Largo Plazo', 'Sector Fintech', 'Python Required', 'Pago Verificado', 'Cliente Enterprise'
  ]);
  const [newCriteria, setNewCriteria] = useState('');

  const addCriteria = () => {
      if (newCriteria.trim() && goldCriteria.length < 10) {
          setGoldCriteria([...goldCriteria, newCriteria.trim()]);
          setNewCriteria('');
      }
  };

  const removeCriteria = (index: number) => {
      setGoldCriteria(goldCriteria.filter((_, i) => i !== index));
  };

  return (
    <VendorLayout>
       <div className="max-w-4xl mx-auto space-y-12 pb-20">
          <div className="border-b border-gray-200 pb-6">
            <h1 className="text-3xl font-black text-gray-900">Configuración de la Agencia</h1>
            <p className="text-gray-500 mt-2">Gestiona tu perfil público, equipo, agente de IA y preferencias.</p>
          </div>

          {/* Public Info */}
          <section id="general" className="scroll-mt-24">
            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <span className="material-symbols-outlined text-gray-400">domain</span>
                Información Pública
            </h2>
            <div className="bg-white rounded-xl border border-gray-200 p-8 shadow-sm">
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                     <label className={labelClass}>Nombre de Agencia</label>
                     <input type="text" defaultValue="QuantumLeap AI" className={inputClass} />
                  </div>
                  <div>
                     <label className={labelClass}>Slogan / Tagline</label>
                     <input type="text" defaultValue="Expertos en Machine Learning" className={inputClass} />
                  </div>
                  <div className="md:col-span-2">
                     <label className={labelClass}>Descripción (Bio)</label>
                     <textarea className={`${inputClass} h-32 resize-none`} defaultValue="Somos un equipo de expertos..." />
                  </div>
               </div>
               <div className="mt-8 flex justify-end">
                   <button className="px-6 py-3 bg-dark text-white font-bold rounded-xl hover:bg-black transition-colors">Guardar Cambios</button>
               </div>
            </div>
          </section>

          {/* Services & Rates - NEW SECTION */}
          <section id="services" className="scroll-mt-24">
            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <span className="material-symbols-outlined text-gray-400">design_services</span>
                Servicios y Tarifas
            </h2>
            <div className="bg-white rounded-xl border border-gray-200 p-8 shadow-sm">
                <p className="text-sm text-gray-500 mb-4">Define los servicios principales que ofreces para que la IA haga mejores matches.</p>
                <div className="space-y-4">
                    <div className="flex items-center gap-4 p-4 border border-gray-200 rounded-xl bg-gray-50">
                        <div className="flex-1">
                            <h4 className="font-bold text-gray-900">Desarrollo de MVP</h4>
                            <p className="text-xs text-gray-500">Incluye diseño, frontend y backend básico.</p>
                        </div>
                        <div className="text-right">
                            <p className="font-bold text-gray-900 text-lg">$10k - $25k</p>
                            <button className="text-xs text-primary font-bold hover:underline">Editar</button>
                        </div>
                    </div>
                    <div className="flex items-center gap-4 p-4 border border-gray-200 rounded-xl bg-gray-50">
                        <div className="flex-1">
                            <h4 className="font-bold text-gray-900">Consultoría de IA</h4>
                            <p className="text-xs text-gray-500">Auditoría y estrategia de implementación.</p>
                        </div>
                        <div className="text-right">
                            <p className="font-bold text-gray-900 text-lg">$150 / hr</p>
                            <button className="text-xs text-primary font-bold hover:underline">Editar</button>
                        </div>
                    </div>
                    <button className="w-full py-3 border-2 border-dashed border-gray-300 rounded-xl text-gray-500 font-bold hover:border-primary hover:text-primary transition-colors flex items-center justify-center gap-2">
                        <span className="material-symbols-outlined">add</span> Añadir Servicio
                    </button>
                </div>
            </div>
          </section>

          {/* AI Prioritization Agent Configuration - ENHANCED */}
          <section id="ai-agent" className="scroll-mt-24">
            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <span className="material-symbols-outlined text-[#1313ec]">smart_toy</span>
                Agente de Priorización de Leads
            </h2>
            <div className="bg-gradient-to-br from-indigo-50 to-white rounded-xl border border-indigo-100 p-8 shadow-sm">
               <div className="flex items-start gap-4 mb-6">
                  <div className="p-3 bg-indigo-100 text-indigo-600 rounded-lg">
                     <span className="material-symbols-outlined">auto_awesome</span>
                  </div>
                  <div>
                     <h3 className="font-bold text-gray-900">Entrena a tu Agente Comercial</h3>
                     <p className="text-sm text-gray-600 mt-1">
                        Define los "Criterios de Lead de Oro". Si una propuesta cumple estos requisitos, la IA la marcará como prioridad máxima.
                     </p>
                  </div>
               </div>

               <div className="space-y-6">
                  <div>
                     <div className="flex justify-between items-center mb-2">
                        <label className={labelClass}>Criterios de "Lead de Oro" ({goldCriteria.length}/10)</label>
                        <span className="text-xs text-indigo-600 font-medium cursor-help" title="Ejemplos: 'Sector Salud', 'Urgente', 'Python', 'Presupuesto > 10k'">Ver ejemplos</span>
                     </div>
                     
                     <div className="flex flex-wrap gap-2 mb-3">
                        {goldCriteria.map((tag, i) => (
                           <span key={i} className="px-3 py-1.5 bg-white border border-indigo-200 text-indigo-700 rounded-lg text-sm font-medium flex items-center gap-2 shadow-sm animate-in fade-in zoom-in duration-200">
                              {tag}
                              <button onClick={() => removeCriteria(i)} className="hover:text-red-500 flex items-center justify-center"><span className="material-symbols-outlined text-sm">close</span></button>
                           </span>
                        ))}
                     </div>
                     
                     <div className="flex gap-2">
                        <input 
                            type="text" 
                            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-indigo-500 bg-white text-gray-900"
                            placeholder="Añadir nuevo criterio (ej. 'React Native Expert')..."
                            value={newCriteria}
                            onChange={(e) => setNewCriteria(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && addCriteria()}
                            disabled={goldCriteria.length >= 10}
                        />
                        <button 
                            onClick={addCriteria}
                            disabled={!newCriteria.trim() || goldCriteria.length >= 10}
                            className="px-4 py-2 bg-indigo-600 text-white rounded-lg font-bold text-sm hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Añadir
                        </button>
                     </div>
                  </div>

                  <div>
                     <label className={labelClass}>Instrucciones de Comportamiento (Prompt)</label>
                     <textarea 
                        className={`${inputClass} h-40 resize-none font-mono text-sm`} 
                        placeholder="Ej: Prioriza clientes que busquen soluciones de Machine Learning sobre desarrollo web simple. Valora mucho la claridad en los requisitos."
                        defaultValue="Actúa como mi director comercial. Prioriza proyectos que involucren 'Visión por Computador' o 'LLMs'. Desacredita ligeramente proyectos que no tengan un presupuesto definido."
                     />
                  </div>
               </div>

               <div className="mt-8 flex justify-end">
                   <button className="px-6 py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200">
                      Actualizar Agente
                   </button>
               </div>
            </div>
          </section>

          {/* Billing & Payouts - NEW SECTION */}
          <section id="payouts" className="scroll-mt-24">
            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <span className="material-symbols-outlined text-gray-400">account_balance</span>
                Facturación y Pagos
            </h2>
            <div className="bg-white rounded-xl border border-gray-200 p-8 shadow-sm">
                <h3 className="font-bold text-gray-900 mb-4">Cuenta Bancaria para Retiros</h3>
                <div className="flex items-center gap-4 p-4 bg-gray-50 border border-gray-200 rounded-xl mb-4">
                    <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center border border-gray-200">
                        <span className="material-symbols-outlined text-gray-600 text-2xl">account_balance</span>
                    </div>
                    <div className="flex-1">
                        <p className="font-bold text-gray-900">Banco Santander **** 4589</p>
                        <p className="text-xs text-gray-500">Cuenta Corriente • USD</p>
                    </div>
                    <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-bold rounded">Verificada</span>
                </div>
                <button className="text-sm font-bold text-primary hover:underline">+ Añadir nueva cuenta</button>
                
                <div className="mt-8 pt-6 border-t border-gray-100">
                    <h3 className="font-bold text-gray-900 mb-4">Información Fiscal</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className={labelClass}>Razón Social</label>
                            <input type="text" defaultValue="QuantumLeap AI LLC" className={inputClass} />
                        </div>
                        <div>
                            <label className={labelClass}>Tax ID / VAT</label>
                            <input type="text" defaultValue="US-987654321" className={inputClass} />
                        </div>
                    </div>
                </div>
            </div>
          </section>
          
       </div>
    </VendorLayout>
  );
};

export default VendorSettings;