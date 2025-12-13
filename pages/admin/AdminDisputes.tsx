import React, { useState, useMemo } from 'react';
import AdminLayout from '../../components/AdminLayout';
import Modal from '../../components/Modal';

interface Dispute {
    id: string;
    project: string;
    plaintiff: string; 
    defendant: string;
    amount: number;
    escrow: number;
    reason: string;
    status: 'open' | 'investigating' | 'resolved';
    resolution?: 'refund' | 'release' | 'split';
    date: string;
    resolvedDate?: string;
    description: string;
    evidence: string[];
    // AI Data
    aiSummary: string;
    aiAnalysis: {
        sentiment: 'neutral' | 'hostile' | 'cooperative';
        contractClause: string;
        recommendation: string;
        confidence: number;
        justification: string;
    };
}

const AdminDisputes: React.FC = () => {
  // State
  const [activeTab, setActiveTab] = useState<'active' | 'history'>('active');
  const [selectedDispute, setSelectedDispute] = useState<Dispute | null>(null);
  const [resolutionType, setResolutionType] = useState<'refund' | 'release' | 'split' | null>(null);
  
  // Filter State for History
  const [searchQuery, setSearchQuery] = useState('');
  const [historyFilter, setHistoryFilter] = useState('all');

  // Split Logic State
  const [splitClient, setSplitClient] = useState(0);
  const [splitVendor, setSplitVendor] = useState(0);

  // Mock Active Disputes
  const activeDisputes: Dispute[] = [
      {
          id: 'DIS-992',
          project: 'Motor de Recomendación',
          plaintiff: 'Cliente Corp',
          defendant: 'DevStudio X',
          amount: 5000,
          escrow: 5000,
          reason: 'Retraso en entrega y baja calidad',
          status: 'open',
          date: '2024-10-12',
          description: 'El vendor entregó el hito 1 con 2 semanas de retraso y el código no compila. Hemos solicitado correcciones pero no responden.',
          evidence: ['logs_error.txt', 'email_thread.pdf', 'contrato_v1.pdf'],
          aiSummary: 'El análisis de logs confirma errores críticos. El vendor ha incumplido el SLA de respuesta.',
          aiAnalysis: {
              sentiment: 'hostile',
              contractClause: 'Cláusula 4.2: Garantía de Funcionalidad',
              recommendation: 'Reembolso Total',
              confidence: 89,
              justification: 'La evidencia técnica (logs_error.txt) muestra que el entregable no cumple con los requisitos mínimos de compilación. El silencio del vendor durante 2 semanas constituye abandono según la Cláusula 7.'
          }
      },
      {
          id: 'DIS-998',
          project: 'Chatbot Bancario',
          plaintiff: 'AI Labs (Vendor)',
          defendant: 'FinBank Global',
          amount: 12000,
          escrow: 12000,
          reason: 'Cliente no libera fondos tras aprobación',
          status: 'investigating',
          date: '2024-10-10',
          description: 'El cliente aprobó verbalmente el entregable hace 10 días en Slack pero se niega a liberar los fondos del Escrow alegando "cambios internos".',
          evidence: ['slack_approvals_screenshot.png', 'demo_recording.mp4'],
          aiSummary: 'Existe aprobación tácita en las comunicaciones. Retención de fondos parece injustificada.',
          aiAnalysis: {
              sentiment: 'cooperative',
              contractClause: 'Cláusula 3.1: Aceptación de Entregables',
              recommendation: 'Liberación de Fondos',
              confidence: 95,
              justification: 'El screenshot de Slack muestra una aprobación explícita ("Looks good, let\'s proceed") del Product Owner. Los "cambios internos" posteriores a la aprobación no son motivo válido para retener el pago de trabajo ya realizado.'
          }
      }
  ];

  // Mock Resolved Disputes (History)
  const resolvedDisputes: Dispute[] = [
      {
          id: 'DIS-850',
          project: 'Dashboard Financiero',
          plaintiff: 'Logistics Pro',
          defendant: 'CodeCrafters',
          amount: 3000,
          escrow: 3000,
          reason: 'Discrepancia en alcance',
          status: 'resolved',
          resolution: 'split',
          date: '2024-09-01',
          resolvedDate: '2024-09-05',
          description: 'El cliente esperaba features no listadas explícitamente.',
          evidence: [],
          aiSummary: 'Ambigüedad en el contrato inicial.',
          aiAnalysis: {
              sentiment: 'neutral',
              contractClause: 'Anexo A: Alcance',
              recommendation: 'Split 50/50',
              confidence: 70,
              justification: 'Ambas partes tienen argumentos válidos debido a una redacción vaga del alcance.'
          }
      },
      {
          id: 'DIS-720',
          project: 'App Retail',
          plaintiff: 'Retail X',
          defendant: 'AppDevs',
          amount: 8000,
          escrow: 8000,
          reason: 'Abandono de proyecto',
          status: 'resolved',
          resolution: 'refund',
          date: '2024-08-15',
          resolvedDate: '2024-08-20',
          description: 'El vendor dejó de responder.',
          evidence: [],
          aiSummary: 'Incumplimiento claro.',
          aiAnalysis: {
              sentiment: 'hostile',
              contractClause: 'Cláusula de Rescisión',
              recommendation: 'Reembolso Total',
              confidence: 99,
              justification: 'Abandono probado.'
          }
      }
  ];

  // Filter History Logic
  const filteredHistory = useMemo(() => {
      return resolvedDisputes.filter(d => {
          const matchesSearch = d.id.toLowerCase().includes(searchQuery.toLowerCase()) || 
                                d.project.toLowerCase().includes(searchQuery.toLowerCase()) ||
                                d.plaintiff.toLowerCase().includes(searchQuery.toLowerCase());
          const matchesFilter = historyFilter === 'all' || d.resolution === historyFilter;
          return matchesSearch && matchesFilter;
      });
  }, [searchQuery, historyFilter]);

  // Logic to handle split calculation
  const handleSplitChange = (who: 'client' | 'vendor', value: string) => {
      const val = parseInt(value) || 0;
      if (!selectedDispute) return;
      
      const max = selectedDispute.escrow;
      
      if (who === 'client') {
          const newClient = Math.min(val, max);
          setSplitClient(newClient);
          setSplitVendor(max - newClient);
      } else {
          const newVendor = Math.min(val, max);
          setSplitVendor(newVendor);
          setSplitClient(max - newVendor);
      }
  };

  const handleResolve = () => {
      alert(`Disputa ${selectedDispute?.id} resuelta vía ${resolutionType}. Cliente: $${splitClient}, Vendor: $${splitVendor}`);
      setSelectedDispute(null);
      setResolutionType(null);
  };

  return (
    <AdminLayout>
      <div className="space-y-8">
         <div className="flex flex-col md:flex-row justify-between items-end gap-4">
            <div>
                <h1 className="text-3xl font-black text-gray-900">Centro de Resolución</h1>
                <p className="text-gray-500 mt-1">Gestión de conflictos potenciada por IA.</p>
            </div>
            
            {/* Tabs */}
            <div className="bg-white p-1 rounded-lg border border-gray-200 flex">
                <button 
                    onClick={() => setActiveTab('active')}
                    className={`px-4 py-2 text-sm font-bold rounded-md transition-all flex items-center gap-2 ${activeTab === 'active' ? 'bg-gray-900 text-white shadow-sm' : 'text-gray-500 hover:text-gray-900'}`}
                >
                    <span className="material-symbols-outlined text-lg">gavel</span>
                    Activas ({activeDisputes.length})
                </button>
                <button 
                    onClick={() => setActiveTab('history')}
                    className={`px-4 py-2 text-sm font-bold rounded-md transition-all flex items-center gap-2 ${activeTab === 'history' ? 'bg-gray-900 text-white shadow-sm' : 'text-gray-500 hover:text-gray-900'}`}
                >
                    <span className="material-symbols-outlined text-lg">history</span>
                    Histórico
                </button>
            </div>
         </div>

         {/* ACTIVE DISPUTES VIEW */}
         {activeTab === 'active' && (
             <div className="grid grid-cols-1 gap-6 animate-in fade-in duration-300">
                 {activeDisputes.map(dispute => (
                     <div key={dispute.id} className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden hover:shadow-card transition-shadow">
                         <div className="p-6 flex flex-col md:flex-row gap-6">
                             {/* Left Info */}
                             <div className="flex-1 space-y-4">
                                 <div className="flex items-center gap-3">
                                     <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${dispute.status === 'open' ? 'bg-red-100 text-red-700' : 'bg-orange-100 text-orange-700'}`}>
                                         {dispute.status === 'open' ? 'Abierta' : 'Investigando'}
                                     </span>
                                     <span className="text-sm text-gray-500 font-mono">{dispute.id}</span>
                                     <span className="text-sm text-gray-400">• {dispute.date}</span>
                                 </div>
                                 <div>
                                     <h3 className="text-xl font-bold text-gray-900">{dispute.reason}</h3>
                                     <p className="text-sm text-gray-500 mt-1">Proyecto: <span className="font-medium text-gray-700">{dispute.project}</span></p>
                                 </div>
                                 <div className="flex items-center gap-8 text-sm">
                                     <div>
                                         <p className="text-xs text-gray-400 uppercase font-bold">Demandante</p>
                                         <p className="font-bold text-gray-800">{dispute.plaintiff}</p>
                                     </div>
                                     <div className="text-gray-300">vs</div>
                                     <div>
                                         <p className="text-xs text-gray-400 uppercase font-bold">Demandado</p>
                                         <p className="font-bold text-gray-800">{dispute.defendant}</p>
                                     </div>
                                 </div>
                                 
                                 {/* AI Summary Box */}
                                 <div className="flex items-start gap-3 bg-gradient-to-r from-purple-50 to-white p-3 rounded-lg border border-purple-100">
                                     <span className="material-symbols-outlined text-purple-600 mt-0.5">smart_toy</span>
                                     <div>
                                         <p className="text-xs font-bold text-purple-700 uppercase mb-0.5">Sugerencia del Agente</p>
                                         <p className="text-sm text-gray-700 leading-snug">{dispute.aiSummary}</p>
                                     </div>
                                 </div>
                             </div>

                             {/* Right Actions & Amount */}
                             <div className="flex flex-col justify-between items-end border-l border-gray-100 pl-6 min-w-[200px]">
                                 <div className="text-right">
                                     <p className="text-xs text-gray-500 uppercase font-bold mb-1">Monto en Disputa</p>
                                     <p className="text-2xl font-black text-gray-900">${dispute.escrow.toLocaleString()}</p>
                                     <p className="text-xs text-green-600 font-medium flex items-center justify-end gap-1">
                                         <span className="material-symbols-outlined text-sm">lock</span> Protegido en Escrow
                                     </p>
                                 </div>
                                 <button 
                                    onClick={() => {
                                        setSelectedDispute(dispute);
                                        setSplitClient(0);
                                        setSplitVendor(0);
                                        setResolutionType(null);
                                    }}
                                    className="bg-dark text-white px-6 py-2.5 rounded-lg font-bold text-sm hover:bg-black transition-colors shadow-lg shadow-gray-200 flex items-center gap-2 mt-4"
                                 >
                                     Gestión de Caso <span className="material-symbols-outlined text-sm">gavel</span>
                                 </button>
                             </div>
                         </div>
                     </div>
                 ))}
             </div>
         )}

         {/* HISTORY VIEW */}
         {activeTab === 'history' && (
             <div className="space-y-4 animate-in fade-in duration-300">
                 {/* History Filters */}
                 <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex gap-4">
                     <div className="relative flex-1">
                         <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">search</span>
                         <input 
                            type="text" 
                            placeholder="Buscar por ID, Proyecto o Cliente..." 
                            className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary/20"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                         />
                     </div>
                     <select 
                        className="bg-gray-50 border border-gray-200 rounded-lg px-4 py-2 text-sm font-medium outline-none cursor-pointer"
                        value={historyFilter}
                        onChange={(e) => setHistoryFilter(e.target.value)}
                     >
                         <option value="all">Todas las resoluciones</option>
                         <option value="refund">Reembolsos</option>
                         <option value="release">Liberaciones</option>
                         <option value="split">Splits (Arbitraje)</option>
                     </select>
                 </div>

                 {/* History Table */}
                 <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
                     <table className="w-full text-left">
                         <thead className="bg-gray-50 border-b border-gray-200">
                             <tr>
                                 <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Caso</th>
                                 <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Monto</th>
                                 <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Resolución</th>
                                 <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Fecha Cierre</th>
                                 <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase text-right">Detalles</th>
                             </tr>
                         </thead>
                         <tbody className="divide-y divide-gray-100">
                             {filteredHistory.length > 0 ? (
                                 filteredHistory.map(dispute => (
                                     <tr key={dispute.id} className="hover:bg-gray-50 transition-colors">
                                         <td className="px-6 py-4">
                                             <div className="flex flex-col">
                                                 <span className="font-bold text-gray-900 text-sm">{dispute.project}</span>
                                                 <span className="text-xs text-gray-500">{dispute.id}</span>
                                             </div>
                                         </td>
                                         <td className="px-6 py-4 font-bold text-gray-900">${dispute.amount.toLocaleString()}</td>
                                         <td className="px-6 py-4">
                                             <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${
                                                 dispute.resolution === 'refund' ? 'bg-red-100 text-red-700' : 
                                                 dispute.resolution === 'release' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'
                                             }`}>
                                                 {dispute.resolution}
                                             </span>
                                         </td>
                                         <td className="px-6 py-4 text-sm text-gray-600">{dispute.resolvedDate}</td>
                                         <td className="px-6 py-4 text-right">
                                             <button className="text-primary hover:underline text-xs font-bold">Ver Archivo</button>
                                         </td>
                                     </tr>
                                 ))
                             ) : (
                                 <tr>
                                     <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                                         No se encontraron resoluciones.
                                     </td>
                                 </tr>
                             )}
                         </tbody>
                     </table>
                 </div>
             </div>
         )}
      </div>

      {/* DETAILED RESOLUTION MODAL - LARGER SIZE */}
      <Modal isOpen={!!selectedDispute} onClose={() => setSelectedDispute(null)} title={`Gestión de Disputa ${selectedDispute?.id}`} size="4xl">
          {selectedDispute && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* LEFT COLUMN: Case Details & Evidence */}
                  <div className="space-y-6">
                      {/* Case Header */}
                      <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                          <h3 className="font-bold text-gray-900 text-lg mb-2">{selectedDispute.reason}</h3>
                          <p className="text-sm text-gray-600 leading-relaxed mb-4">{selectedDispute.description}</p>
                          
                          <div className="flex gap-4">
                              <div className="bg-white px-3 py-2 rounded-lg border border-gray-200 text-sm flex-1">
                                  <span className="block text-xs text-gray-400 font-bold uppercase">Demandante</span>
                                  <span className="font-bold text-gray-800">{selectedDispute.plaintiff}</span>
                              </div>
                              <div className="bg-white px-3 py-2 rounded-lg border border-gray-200 text-sm flex-1">
                                  <span className="block text-xs text-gray-400 font-bold uppercase">Demandado</span>
                                  <span className="font-bold text-gray-800">{selectedDispute.defendant}</span>
                              </div>
                          </div>
                      </div>

                      {/* Evidence Vault */}
                      <div>
                          <h4 className="text-sm font-bold text-gray-900 uppercase mb-3 flex items-center gap-2">
                              <span className="material-symbols-outlined text-gray-400">inventory_2</span>
                              Evidencia Presentada
                          </h4>
                          <div className="space-y-2">
                              {selectedDispute.evidence.map((file, i) => (
                                  <div key={i} className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors group">
                                      <div className="w-8 h-8 bg-blue-50 text-blue-600 rounded flex items-center justify-center group-hover:bg-blue-100">
                                          <span className="material-symbols-outlined text-lg">description</span>
                                      </div>
                                      <span className="text-sm text-gray-700 font-medium truncate flex-1">{file}</span>
                                      <span className="material-symbols-outlined text-gray-300 group-hover:text-gray-500">download</span>
                                  </div>
                              ))}
                          </div>
                      </div>
                  </div>

                  {/* RIGHT COLUMN: AI Analysis & Resolution */}
                  <div className="space-y-6">
                      
                      {/* AI FORENSIC REPORT */}
                      <div className="bg-gradient-to-br from-indigo-50 to-white border border-indigo-100 rounded-xl p-5 shadow-sm">
                          <div className="flex items-center gap-3 mb-4">
                              <div className="w-10 h-10 rounded-full bg-indigo-600 text-white flex items-center justify-center shadow-lg shadow-indigo-200">
                                  <span className="material-symbols-outlined text-xl">smart_toy</span>
                              </div>
                              <div>
                                  <h4 className="font-bold text-indigo-900">Análisis Forense IA</h4>
                                  <p className="text-xs text-indigo-600 font-medium">Nivel de Confianza: {selectedDispute.aiAnalysis.confidence}%</p>
                              </div>
                          </div>
                          
                          <div className="space-y-4 text-sm">
                              <div className="bg-white/60 p-3 rounded-lg border border-indigo-50">
                                  <p className="text-xs font-bold text-gray-500 uppercase mb-1">Cláusula Aplicable</p>
                                  <p className="font-mono text-indigo-800 bg-indigo-50 px-2 py-1 rounded inline-block">{selectedDispute.aiAnalysis.contractClause}</p>
                              </div>
                              
                              <div>
                                  <p className="text-xs font-bold text-gray-500 uppercase mb-1">Justificación Técnica</p>
                                  <p className="text-gray-700 leading-relaxed">
                                      {selectedDispute.aiAnalysis.justification}
                                  </p>
                              </div>

                              <div className="flex items-center justify-between pt-2 border-t border-indigo-100">
                                  <span className="text-gray-500 font-medium">Recomendación:</span>
                                  <span className="font-bold text-indigo-700 bg-indigo-100 px-3 py-1 rounded-full text-xs uppercase">
                                      {selectedDispute.aiAnalysis.recommendation}
                                  </span>
                              </div>
                          </div>
                      </div>

                      {/* Resolution Console */}
                      <div className="border-t border-gray-200 pt-6">
                          <h4 className="text-sm font-bold text-gray-900 uppercase mb-4 flex items-center gap-2">
                              <span className="material-symbols-outlined text-gray-400">balance</span>
                              Consola de Resolución
                          </h4>

                          {!resolutionType ? (
                              <div className="grid grid-cols-3 gap-3">
                                  <button 
                                    onClick={() => { setResolutionType('refund'); setSplitClient(selectedDispute.escrow); setSplitVendor(0); }}
                                    className="p-3 border border-gray-200 rounded-xl hover:border-red-500 hover:bg-red-50 transition-all text-center group"
                                  >
                                      <span className="material-symbols-outlined text-red-500 mb-1 group-hover:scale-110 transition-transform block text-2xl">undo</span>
                                      <p className="font-bold text-gray-900 text-xs">Reembolso</p>
                                  </button>
                                  <button 
                                    onClick={() => { setResolutionType('release'); setSplitVendor(selectedDispute.escrow); setSplitClient(0); }}
                                    className="p-3 border border-gray-200 rounded-xl hover:border-green-500 hover:bg-green-50 transition-all text-center group"
                                  >
                                      <span className="material-symbols-outlined text-green-500 mb-1 group-hover:scale-110 transition-transform block text-2xl">payments</span>
                                      <p className="font-bold text-gray-900 text-xs">Liberar</p>
                                  </button>
                                  <button 
                                    onClick={() => { setResolutionType('split'); setSplitClient(selectedDispute.escrow / 2); setSplitVendor(selectedDispute.escrow / 2); }}
                                    className="p-3 border border-gray-200 rounded-xl hover:border-blue-500 hover:bg-blue-50 transition-all text-center group"
                                  >
                                      <span className="material-symbols-outlined text-blue-500 mb-1 group-hover:scale-110 transition-transform block text-2xl">call_split</span>
                                      <p className="font-bold text-gray-900 text-xs">Split</p>
                                  </button>
                              </div>
                          ) : (
                              <div className="bg-gray-50 p-5 rounded-xl border border-gray-200 animate-in fade-in zoom-in duration-200">
                                  <div className="flex justify-between items-center mb-4">
                                      <h5 className="font-bold text-gray-900 text-sm">
                                          {resolutionType === 'split' ? 'Arbitraje (Split)' : resolutionType === 'refund' ? 'Reembolso Total' : 'Liberación Total'}
                                      </h5>
                                      <button onClick={() => setResolutionType(null)} className="text-xs font-bold text-gray-500 hover:underline">Cancelar</button>
                                  </div>

                                  <div className="flex items-center gap-3 mb-4">
                                      <div className="flex-1">
                                          <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Cliente</label>
                                          <div className="relative">
                                              <span className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-500 text-xs">$</span>
                                              <input 
                                                type="number" 
                                                value={splitClient}
                                                onChange={(e) => handleSplitChange('client', e.target.value)}
                                                className="w-full pl-4 pr-2 py-1.5 border border-gray-300 rounded text-sm font-bold text-gray-900 focus:ring-2 focus:ring-blue-500 outline-none"
                                                disabled={resolutionType !== 'split'}
                                              />
                                          </div>
                                      </div>
                                      <div className="flex-1">
                                          <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Vendor</label>
                                          <div className="relative">
                                              <span className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-500 text-xs">$</span>
                                              <input 
                                                type="number" 
                                                value={splitVendor}
                                                onChange={(e) => handleSplitChange('vendor', e.target.value)}
                                                className="w-full pl-4 pr-2 py-1.5 border border-gray-300 rounded text-sm font-bold text-gray-900 focus:ring-2 focus:ring-blue-500 outline-none"
                                                disabled={resolutionType !== 'split'}
                                              />
                                          </div>
                                      </div>
                                  </div>
                                  
                                  <div className="flex justify-between items-center text-xs border-t border-gray-200 pt-3 mb-4">
                                      <span className="font-medium text-gray-600">Total:</span>
                                      <span className={`font-bold ${splitClient + splitVendor === selectedDispute.escrow ? 'text-green-600' : 'text-red-600'}`}>
                                          ${(splitClient + splitVendor).toLocaleString()} / ${selectedDispute.escrow.toLocaleString()}
                                      </span>
                                  </div>

                                  <button 
                                    onClick={handleResolve}
                                    disabled={splitClient + splitVendor !== selectedDispute.escrow}
                                    className="w-full py-2.5 bg-dark text-white font-bold rounded-lg hover:bg-black transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg text-sm"
                                  >
                                      Ejecutar Resolución Final
                                  </button>
                              </div>
                          )}
                      </div>
                  </div>
              </div>
          )}
      </Modal>
    </AdminLayout>
  );
};

export default AdminDisputes;