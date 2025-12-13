import React, { useState } from 'react';
import AdminLayout from '../../components/AdminLayout';

const AdminPlatform: React.FC = () => {
  // State for AI Config
  const [aiConfig, setAiConfig] = useState({
      model: 'gemini-1.5-flash',
      temperature: 0.7,
      systemPrompt: 'You are an AI assistant for a B2B marketplace. Your goal is to match clients with vendors based on technical requirements and budget fit. Be professional, concise, and helpful.'
  });

  // State for Fees
  const [fees, setFees] = useState({
      vendorCommission: 10,
      clientFee: 3,
      escrowHoldDays: 3
  });

  // State for Skills
  const [skills, setSkills] = useState(['Machine Learning', 'Computer Vision', 'NLP', 'Generative AI', 'Robotics', 'Python', 'TensorFlow']);
  const [newSkill, setNewSkill] = useState('');

  const addSkill = () => {
      if (newSkill.trim() && !skills.includes(newSkill.trim())) {
          setSkills([...skills, newSkill.trim()]);
          setNewSkill('');
      }
  };

  const removeSkill = (skill: string) => {
      setSkills(skills.filter(s => s !== skill));
  };

  return (
    <AdminLayout>
      <div className="space-y-8 pb-20">
         <div className="flex justify-between items-end">
             <div>
                <h1 className="text-3xl font-black text-gray-900">Configuración de Plataforma</h1>
                <p className="text-gray-500 mt-1">Controla las reglas de negocio, monetización y el comportamiento de la IA.</p>
             </div>
             <button className="bg-dark text-white px-6 py-2.5 rounded-xl font-bold shadow-lg hover:bg-black transition-colors flex items-center gap-2">
                 <span className="material-symbols-outlined text-lg">save</span>
                 Guardar Cambios Globales
             </button>
         </div>
         
         <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
             
             {/* 1. MONETIZATION & FINANCE */}
             <div className="bg-white p-8 rounded-2xl border border-gray-200 shadow-sm space-y-6">
                 <div className="flex items-center gap-3 border-b border-gray-100 pb-4">
                     <div className="p-2 bg-green-50 text-green-600 rounded-lg">
                         <span className="material-symbols-outlined">payments</span>
                     </div>
                     <div>
                         <h2 className="text-lg font-bold text-gray-900">Monetización y Finanzas</h2>
                         <p className="text-xs text-gray-500">Configura las tasas y reglas de dinero.</p>
                     </div>
                 </div>

                 <div className="grid grid-cols-2 gap-6">
                     <div>
                         <label className="block text-xs font-bold text-gray-700 uppercase mb-2">Comisión Vendor (%)</label>
                         <div className="relative">
                             <input 
                                type="number" 
                                value={fees.vendorCommission}
                                onChange={(e) => setFees({...fees, vendorCommission: Number(e.target.value)})}
                                className="w-full pl-4 pr-8 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 font-bold focus:ring-2 focus:ring-green-500 focus:bg-white outline-none transition-all"
                             />
                             <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">%</span>
                         </div>
                         <p className="text-[10px] text-gray-400 mt-1">Deducido del pago al liberar hito.</p>
                     </div>
                     <div>
                         <label className="block text-xs font-bold text-gray-700 uppercase mb-2">Fee Cliente (%)</label>
                         <div className="relative">
                             <input 
                                type="number" 
                                value={fees.clientFee}
                                onChange={(e) => setFees({...fees, clientFee: Number(e.target.value)})}
                                className="w-full pl-4 pr-8 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 font-bold focus:ring-2 focus:ring-green-500 focus:bg-white outline-none transition-all"
                             />
                             <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">%</span>
                         </div>
                         <p className="text-[10px] text-gray-400 mt-1">Añadido al total en el checkout.</p>
                     </div>
                 </div>

                 <div>
                     <label className="block text-xs font-bold text-gray-700 uppercase mb-2">Retención de Seguridad (Escrow)</label>
                     <div className="flex items-center gap-4">
                         <input 
                            type="range" 
                            min="0" max="14" 
                            value={fees.escrowHoldDays}
                            onChange={(e) => setFees({...fees, escrowHoldDays: Number(e.target.value)})}
                            className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-green-600"
                         />
                         <span className="font-bold text-gray-900 w-16 text-right">{fees.escrowHoldDays} días</span>
                     </div>
                     <p className="text-xs text-gray-500 mt-1">Tiempo de espera antes de permitir el retiro de fondos tras la liberación.</p>
                 </div>
             </div>

             {/* 2. BUSINESS RULES & SKILLS */}
             <div className="space-y-8">
                 <div className="bg-white p-8 rounded-2xl border border-gray-200 shadow-sm space-y-6">
                     <div className="flex items-center gap-3 border-b border-gray-100 pb-4">
                         <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                             <span className="material-symbols-outlined">rule</span>
                         </div>
                         <div>
                             <h2 className="text-lg font-bold text-gray-900">Reglas de Negocio</h2>
                             <p className="text-xs text-gray-500">Control de calidad y seguridad.</p>
                         </div>
                     </div>

                     <div className="space-y-4">
                         <div className="flex items-center justify-between p-4 border border-gray-100 rounded-xl hover:bg-gray-50 transition-colors">
                             <div>
                                 <p className="font-bold text-gray-900 text-sm">Verificación Manual de Vendors</p>
                                 <p className="text-xs text-gray-500">Requiere aprobación admin antes de aparecer.</p>
                             </div>
                             <label className="relative inline-flex items-center cursor-pointer">
                                <input type="checkbox" defaultChecked className="sr-only peer" />
                                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                             </label>
                         </div>

                         <div className="flex items-center justify-between p-4 border border-gray-100 rounded-xl hover:bg-gray-50 transition-colors">
                             <div>
                                 <p className="font-bold text-gray-900 text-sm">Modo "Solo Invitación"</p>
                                 <p className="text-xs text-gray-500">Los clientes necesitan un código.</p>
                             </div>
                             <label className="relative inline-flex items-center cursor-pointer">
                                <input type="checkbox" className="sr-only peer" />
                                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                             </label>
                         </div>
                     </div>
                 </div>

                 {/* SKILLS TAXONOMY */}
                 <div className="bg-white p-8 rounded-2xl border border-gray-200 shadow-sm space-y-6">
                     <div className="flex items-center gap-3 border-b border-gray-100 pb-4">
                         <div className="p-2 bg-purple-50 text-purple-600 rounded-lg">
                             <span className="material-symbols-outlined">category</span>
                         </div>
                         <div>
                             <h2 className="text-lg font-bold text-gray-900">Taxonomía de Skills</h2>
                             <p className="text-xs text-gray-500">Etiquetas disponibles para matching.</p>
                         </div>
                     </div>

                     <div className="flex gap-2">
                         <input 
                            type="text" 
                            value={newSkill}
                            onChange={(e) => setNewSkill(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && addSkill()}
                            placeholder="Añadir tecnología (ej. GPT-4, Llama 3)" 
                            className="flex-1 px-4 py-2 border border-gray-200 bg-white rounded-lg text-sm text-gray-900 outline-none focus:ring-2 focus:ring-purple-500"
                         />
                         <button onClick={addSkill} className="px-4 py-2 bg-purple-600 text-white font-bold rounded-lg hover:bg-purple-700 transition-colors text-sm">
                             Añadir
                         </button>
                     </div>

                     <div className="flex flex-wrap gap-2">
                         {skills.map(skill => (
                             <span key={skill} className="px-3 py-1 bg-gray-100 text-gray-700 text-sm font-medium rounded-full flex items-center gap-2 group hover:bg-purple-50 hover:text-purple-700 transition-colors cursor-default">
                                 {skill}
                                 <button onClick={() => removeSkill(skill)} className="text-gray-400 hover:text-red-500 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                     <span className="material-symbols-outlined text-[14px]">close</span>
                                 </button>
                             </span>
                         ))}
                     </div>
                 </div>
             </div>

             {/* 3. AI AGENT CONFIGURATION */}
             <div className="lg:col-span-2 bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-8 text-white shadow-xl">
                 <div className="flex items-start gap-4 mb-8">
                     <div className="p-3 bg-white/10 rounded-xl border border-white/20">
                         <span className="material-symbols-outlined text-2xl text-purple-300">smart_toy</span>
                     </div>
                     <div>
                         <h2 className="text-xl font-bold">Cerebro de la Plataforma (Gemini)</h2>
                         <p className="text-gray-400 text-sm mt-1">Configura el comportamiento del agente de IA que gestiona el matching y soporte.</p>
                     </div>
                 </div>

                 <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                     <div className="lg:col-span-2 space-y-6">
                         <div>
                             <label className="block text-xs font-bold text-gray-400 uppercase mb-2">System Prompt Global</label>
                             <textarea 
                                value={aiConfig.systemPrompt}
                                onChange={(e) => setAiConfig({...aiConfig, systemPrompt: e.target.value})}
                                className="w-full h-40 bg-gray-800 border border-gray-700 rounded-xl p-4 text-sm text-gray-200 focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none resize-none font-mono leading-relaxed"
                             />
                             <p className="text-[10px] text-gray-500 mt-2">Este prompt define la personalidad base para todas las interacciones.</p>
                         </div>
                     </div>

                     <div className="space-y-6">
                         <div>
                             <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Modelo Base</label>
                             <select 
                                value={aiConfig.model}
                                onChange={(e) => setAiConfig({...aiConfig, model: e.target.value})}
                                className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-sm text-white focus:ring-2 focus:ring-purple-500 outline-none appearance-none cursor-pointer"
                             >
                                 <option value="gemini-1.5-pro">Gemini 1.5 Pro (Recomendado)</option>
                                 <option value="gemini-1.5-flash">Gemini 1.5 Flash (Más rápido)</option>
                             </select>
                         </div>

                         <div>
                             <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Temperatura (Creatividad)</label>
                             <div className="flex items-center gap-4">
                                 <span className="text-xs font-mono text-gray-400">Preciso</span>
                                 <input 
                                    type="range" 
                                    min="0" max="1" step="0.1"
                                    value={aiConfig.temperature}
                                    onChange={(e) => setAiConfig({...aiConfig, temperature: Number(e.target.value)})}
                                    className="flex-1 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-purple-500"
                                 />
                                 <span className="text-xs font-mono text-gray-400">Creativo</span>
                             </div>
                             <div className="text-center mt-1 font-bold text-purple-300">{aiConfig.temperature}</div>
                         </div>

                         <div className="pt-4">
                             <button className="w-full py-3 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl transition-colors shadow-lg shadow-purple-900/20">
                                 Actualizar Modelo
                             </button>
                         </div>
                     </div>
                 </div>
             </div>

         </div>
      </div>
    </AdminLayout>
  );
};

export default AdminPlatform;