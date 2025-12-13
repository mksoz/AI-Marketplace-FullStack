import React, { useState, useRef, useEffect } from 'react';
import AdminLayout from '../../components/AdminLayout';

// Mock available vendors for the advanced selector
const AVAILABLE_VENDORS = [
    { id: 'v1', name: 'QuantumLeap AI', sector: 'AI / ML', region: 'Global' },
    { id: 'v2', name: 'InnovateAI Corp', sector: 'Computer Vision', region: 'N. America' },
    { id: 'v3', name: 'DevStudio X', sector: 'Web Dev', region: 'LatAm' },
    { id: 'v4', name: 'CodeCrafters', sector: 'Backend', region: 'Europe' },
    { id: 'v5', name: 'DataDriven Dynamics', sector: 'Data Science', region: 'Global' },
];

const AdminMetrics: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'general' | 'insights' | 'benchmarks'>('benchmarks'); 
  const [timeRange, setTimeRange] = useState('30d');

  // --- MOCK DATA ---

  // General Charts
  const revenueTrend = [40, 55, 45, 70, 65, 80, 75, 90, 85, 100, 95, 110];
  
  // Market AI Data
  const techTrends = [
      { name: 'RAG Frameworks', growth: '+240%', volume: 'High', status: 'Exploding' },
      { name: 'AutoGPT / Agents', growth: '+180%', volume: 'Med', status: 'Rising' },
      { name: 'Computer Vision (Retail)', growth: '+45%', volume: 'High', status: 'Stable' },
      { name: 'Basic Chatbots', growth: '-15%', volume: 'Med', status: 'Declining' },
  ];

  const priceHeatmap = [
      { role: 'ML Engineer', latam: '$45-70', na: '$120-180', eu: '$90-140' },
      { role: 'AI Product Mgr', latam: '$40-60', na: '$110-160', eu: '$80-120' },
      { role: 'Data Scientist', latam: '$35-55', na: '$100-150', eu: '$70-110' },
  ];

  // Vendor Benchmark Report Data
  const vendorStats = {
      rank: 'Top 15%',
      winRate: 24,
      marketWinRate: 18,
      avgTicket: '$12,500',
      marketTicket: '$8,200',
      pricePosition: 75, // 0-100 scale for bell curve
      qualityScore: 8.5,
      funnel: [
          { stage: 'Impresiones', value: 1200, benchmark: 2500, label: 'Bajo' },
          { stage: 'Clics al Perfil', value: 340, benchmark: 200, label: 'Alto' },
          { stage: 'Propuestas', value: 45, benchmark: 30, label: 'Alto' },
          { stage: 'Contratos', value: 12, benchmark: 8, label: 'Alto' }
      ],
      opportunityEscape: [
          { term: 'Llama 3 Fine-tuning', volume: 145, potentialValue: '$25k+', reason: 'Falta tag en perfil' },
          { term: 'Fraud Detection', volume: 80, potentialValue: '$15k+', reason: 'Tarifa fuera de rango' },
          { term: 'AI Consulting', volume: 210, potentialValue: '$40k+', reason: 'Tiempo de respuesta lento' }
      ]
  };

  // State for Advanced Report Generator
  const [reportConfig, setReportConfig] = useState({
      vendor: 'QuantumLeap AI',
      sector: 'AI / ML',
      region: 'global',
      size: 'similar',
      stack: [] as string[]
  });

  // Advanced Vendor Selector State
  const [isVendorSearchOpen, setIsVendorSearchOpen] = useState(false);
  const vendorSearchRef = useRef<HTMLDivElement>(null);
  const [vendorSearchQuery, setVendorSearchQuery] = useState('');

  // Close vendor dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (vendorSearchRef.current && !vendorSearchRef.current.contains(event.target as Node)) {
        setIsVendorSearchOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredVendors = AVAILABLE_VENDORS.filter(v => 
      v.name.toLowerCase().includes(vendorSearchQuery.toLowerCase())
  );

  const handleVendorSelect = (name: string, sector: string) => {
      setReportConfig(prev => ({ ...prev, vendor: name, sector: sector }));
      setVendorSearchQuery(''); // Clear query but keep the displayed value logic separate if needed, here we use config
      setIsVendorSearchOpen(false);
  };

  return (
    <AdminLayout>
      <div className="space-y-8 pb-12">
         
         {/* Header & Tabs */}
         <div className="flex flex-col md:flex-row justify-between items-end gap-6">
             <div>
                <h1 className="text-3xl font-black text-gray-900">Centro de Inteligencia</h1>
                <p className="text-gray-500 mt-1">Métricas estratégicas y generador de valor para vendors.</p>
             </div>
             
             <div className="bg-white p-1.5 rounded-xl border border-gray-200 shadow-sm flex">
                 <button 
                    onClick={() => setActiveTab('general')}
                    className={`px-5 py-2.5 rounded-lg text-sm font-bold transition-all flex items-center gap-2 ${activeTab === 'general' ? 'bg-gray-900 text-white shadow-md' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'}`}
                 >
                    <span className="material-symbols-outlined text-[18px]">monitoring</span>
                    KPIs Globales
                 </button>
                 <button 
                    onClick={() => setActiveTab('insights')}
                    className={`px-5 py-2.5 rounded-lg text-sm font-bold transition-all flex items-center gap-2 ${activeTab === 'insights' ? 'bg-gray-900 text-white shadow-md' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'}`}
                 >
                    <span className="material-symbols-outlined text-[18px]">psychology</span>
                    Market AI
                 </button>
                 <button 
                    onClick={() => setActiveTab('benchmarks')}
                    className={`px-5 py-2.5 rounded-lg text-sm font-bold transition-all flex items-center gap-2 ${activeTab === 'benchmarks' ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200' : 'text-gray-500 hover:text-indigo-600 hover:bg-indigo-50'}`}
                 >
                    <span className="material-symbols-outlined text-[18px]">workspace_premium</span>
                    Vendor Reports
                 </button>
             </div>
         </div>

         {/* =======================
             TAB 1: GENERAL KPI
             ======================= */}
         {activeTab === 'general' && (
             <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                 
                 {/* High Level Stats */}
                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                     <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
                         <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-1">Gross Merchandise Value (GMV)</p>
                         <div className="flex items-baseline gap-2">
                             <h2 className="text-3xl font-black text-gray-900">$425.5k</h2>
                             <span className="text-green-600 bg-green-50 px-2 py-0.5 rounded text-xs font-bold">+12%</span>
                         </div>
                     </div>
                     <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
                         <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-1">Net Revenue (Take Rate)</p>
                         <div className="flex items-baseline gap-2">
                             <h2 className="text-3xl font-black text-gray-900">$63.8k</h2>
                             <span className="text-gray-500 text-xs font-medium">15% Avg. Fee</span>
                         </div>
                     </div>
                     <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
                         <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-1">Liquidez (Time-to-Hire)</p>
                         <div className="flex items-baseline gap-2">
                             <h2 className="text-3xl font-black text-gray-900">5.2 días</h2>
                             <span className="text-green-600 bg-green-50 px-2 py-0.5 rounded text-xs font-bold">-1.1 días</span>
                         </div>
                         <p className="text-xs text-gray-400 mt-1">Velocidad de matching mejorada</p>
                     </div>
                     <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
                         <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-1">Vendor Retention</p>
                         <div className="flex items-baseline gap-2">
                             <h2 className="text-3xl font-black text-gray-900">94%</h2>
                             <span className="text-xs text-gray-500">Churn &lt; 6%</span>
                         </div>
                     </div>
                 </div>

                 {/* Revenue Chart Area */}
                 <div className="bg-white p-8 rounded-2xl border border-gray-200 shadow-sm">
                     <div className="flex justify-between items-center mb-8">
                         <div>
                             <h3 className="text-xl font-bold text-gray-900">Evolución de Ingresos</h3>
                             <p className="text-gray-500 text-sm">Comparativa de los últimos 12 meses.</p>
                         </div>
                         <select 
                            className="bg-gray-50 border border-gray-200 text-gray-700 text-sm font-medium rounded-lg px-3 py-2 outline-none cursor-pointer"
                            value={timeRange}
                            onChange={(e) => setTimeRange(e.target.value)}
                         >
                             <option value="30d">Últimos 30 días</option>
                             <option value="90d">Último Trimestre</option>
                             <option value="1y">Año Actual</option>
                         </select>
                     </div>
                     
                     <div className="h-64 flex items-end justify-between gap-4 px-2">
                         {revenueTrend.map((h, i) => (
                             <div key={i} className="flex-1 flex flex-col justify-end group">
                                 <div className="relative w-full bg-blue-50 rounded-t-lg transition-all duration-500 group-hover:bg-primary/10 overflow-hidden" style={{height: `${h * 0.8}%`}}>
                                     <div className="absolute bottom-0 left-0 w-full bg-primary rounded-t-lg transition-all duration-700 group-hover:bg-blue-600" style={{height: `${h * 0.6}%`}}></div>
                                 </div>
                                 <p className="text-center text-xs text-gray-400 mt-2">Mes {i+1}</p>
                             </div>
                         ))}
                     </div>
                 </div>
             </div>
         )}

         {/* =======================
             TAB 2: MARKET INSIGHTS
             ======================= */}
         {activeTab === 'insights' && (
             <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                 
                 {/* Tech Trends Radar */}
                 <div className="bg-white p-8 rounded-2xl border border-gray-200 shadow-sm">
                     <div className="flex justify-between items-center mb-6">
                         <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                             <span className="material-symbols-outlined text-purple-600">trending_up</span>
                             Radar de Tecnologías Emergentes
                         </h3>
                     </div>
                     <div className="space-y-4">
                         {techTrends.map((tech, i) => (
                             <div key={i} className="flex items-center justify-between p-3 border border-gray-100 rounded-xl hover:bg-gray-50 transition-colors">
                                 <div>
                                     <p className="font-bold text-gray-900 text-sm">{tech.name}</p>
                                     <div className="flex items-center gap-2 mt-1">
                                         <span className={`w-2 h-2 rounded-full ${tech.status === 'Exploding' ? 'bg-red-500' : tech.status === 'Rising' ? 'bg-green-500' : 'bg-gray-400'}`}></span>
                                         <span className="text-xs text-gray-500">{tech.status}</span>
                                     </div>
                                 </div>
                                 <div className="text-right">
                                     <p className="text-lg font-black text-gray-900">{tech.growth}</p>
                                     <p className="text-xs text-gray-400">Volumen: {tech.volume}</p>
                                 </div>
                             </div>
                         ))}
                     </div>
                     <div className="mt-4 bg-purple-50 p-3 rounded-lg text-xs text-purple-700">
                         <strong>Insight:</strong> La demanda de "RAG Frameworks" supera la oferta en un 40%. Sugerir a vendors actualizar perfiles.
                     </div>
                 </div>

                 {/* Pricing Heatmap */}
                 <div className="bg-white p-8 rounded-2xl border border-gray-200 shadow-sm">
                     <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                         <span className="material-symbols-outlined text-green-600">monetization_on</span>
                         Mapa de Calor de Tarifas (Hora)
                     </h3>
                     <div className="overflow-x-auto">
                         <table className="w-full text-sm text-left">
                             <thead className="text-xs text-gray-500 uppercase bg-gray-50">
                                 <tr>
                                     <th className="px-4 py-3 rounded-l-lg">Rol</th>
                                     <th className="px-4 py-3">LatAm</th>
                                     <th className="px-4 py-3">N. America</th>
                                     <th className="px-4 py-3 rounded-r-lg">Europe</th>
                                 </tr>
                             </thead>
                             <tbody className="divide-y divide-gray-100">
                                 {priceHeatmap.map((row, i) => (
                                     <tr key={i}>
                                         <td className="px-4 py-3 font-bold text-gray-900">{row.role}</td>
                                         <td className="px-4 py-3 text-gray-600">{row.latam}</td>
                                         <td className="px-4 py-3 text-green-700 font-medium bg-green-50/50">{row.na}</td>
                                         <td className="px-4 py-3 text-gray-600">{row.eu}</td>
                                     </tr>
                                 ))}
                             </tbody>
                         </table>
                     </div>
                     <p className="text-xs text-gray-400 mt-4 text-center">Basado en contratos firmados en los últimos 90 días.</p>
                 </div>
             </div>
         )}

         {/* =======================
             TAB 3: VENDOR BENCHMARKS (PREMIUM REPORT)
             ======================= */}
         {activeTab === 'benchmarks' && (
             <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                 
                 {/* Left: Report Generator & Revenue */}
                 <div className="lg:col-span-1 flex flex-col gap-6">
                     
                     {/* Revenue Card (Moved Up) */}
                     <div className="bg-gradient-to-br from-gray-900 to-gray-800 text-white p-6 rounded-2xl shadow-lg relative overflow-hidden">
                         <div className="relative z-10">
                             <h3 className="font-bold mb-2">Ingresos por Benchmarks</h3>
                             <p className="text-gray-400 text-xs mb-4">Venta de informes premium.</p>
                             <div className="flex items-end gap-3">
                                 <span className="text-3xl font-black">$12,450</span>
                                 <span className="text-green-400 text-sm font-bold mb-1 bg-green-900/30 px-2 py-0.5 rounded">+24%</span>
                             </div>
                         </div>
                         <span className="material-symbols-outlined absolute -right-4 -bottom-4 text-9xl text-white/5">workspace_premium</span>
                     </div>

                     {/* Report Generator */}
                     <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex-1">
                         <div className="flex items-center gap-3 mb-6">
                             <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
                                 <span className="material-symbols-outlined">tune</span>
                             </div>
                             <div>
                                 <h3 className="font-bold text-gray-900">Configurador de Informe</h3>
                                 <p className="text-xs text-gray-500">Define los segmentos comparativos.</p>
                             </div>
                         </div>

                         <div className="space-y-5">
                             <div>
                                 <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">Vendor Objetivo</label>
                                 <div className="relative" ref={vendorSearchRef}>
                                     <div 
                                        className="relative cursor-pointer"
                                        onClick={() => setIsVendorSearchOpen(!isVendorSearchOpen)}
                                     >
                                         <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">search</span>
                                         <input 
                                            type="text" 
                                            value={isVendorSearchOpen ? vendorSearchQuery : reportConfig.vendor}
                                            onChange={(e) => {
                                                setVendorSearchQuery(e.target.value);
                                                if (!isVendorSearchOpen) setIsVendorSearchOpen(true);
                                            }}
                                            placeholder="Buscar vendor..."
                                            className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm font-medium outline-none focus:border-indigo-500 transition-colors cursor-pointer"
                                            autoComplete="off"
                                         />
                                         <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-lg">expand_more</span>
                                     </div>

                                     {isVendorSearchOpen && (
                                         <div className="absolute top-full left-0 w-full mt-2 bg-white rounded-xl shadow-xl border border-gray-200 py-1 z-50 max-h-60 overflow-y-auto animate-in fade-in zoom-in-95 duration-100">
                                             {filteredVendors.length > 0 ? (
                                                 filteredVendors.map((vendor) => (
                                                     <button 
                                                        key={vendor.id}
                                                        onClick={() => handleVendorSelect(vendor.name, vendor.sector)}
                                                        className="w-full text-left px-4 py-2 hover:bg-indigo-50 transition-colors flex flex-col group"
                                                     >
                                                         <span className="text-sm font-bold text-gray-900 group-hover:text-indigo-700">{vendor.name}</span>
                                                         <span className="text-xs text-gray-500 flex justify-between w-full">
                                                             <span>{vendor.sector}</span>
                                                             <span>{vendor.region}</span>
                                                         </span>
                                                     </button>
                                                 ))
                                             ) : (
                                                 <div className="px-4 py-3 text-xs text-gray-500 text-center">No se encontraron vendors</div>
                                             )}
                                         </div>
                                     )}
                                 </div>
                             </div>

                             <div className="border-t border-gray-100 pt-4">
                                 <p className="text-xs font-bold text-indigo-600 uppercase mb-3 flex items-center gap-1">
                                     <span className="material-symbols-outlined text-sm">filter_list</span> Segmentación Comparativa
                                 </p>
                                 
                                 <div className="space-y-3">
                                     <div>
                                         <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Región Geográfica</label>
                                         <select 
                                            className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 outline-none focus:border-indigo-500 cursor-pointer"
                                            value={reportConfig.region}
                                            onChange={(e) => setReportConfig({...reportConfig, region: e.target.value})}
                                         >
                                             <option value="global">Global (Todo el mundo)</option>
                                             <option value="latam">Latinoamérica</option>
                                             <option value="na">Norteamérica</option>
                                             <option value="eu">Europa</option>
                                         </select>
                                     </div>

                                     <div>
                                         <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Stack Tecnológico (Tags)</label>
                                         <div className="flex flex-wrap gap-2 p-2 bg-gray-50 border border-gray-200 rounded-lg min-h-[40px]">
                                             <span className="bg-white border border-gray-200 text-xs px-2 py-1 rounded-md text-gray-600 flex items-center gap-1">Python <span className="text-[10px] cursor-pointer">✕</span></span>
                                             <span className="bg-white border border-gray-200 text-xs px-2 py-1 rounded-md text-gray-600 flex items-center gap-1">ML <span className="text-[10px] cursor-pointer">✕</span></span>
                                             <button className="text-xs text-indigo-600 font-bold hover:underline">+ Añadir</button>
                                         </div>
                                     </div>

                                     <div>
                                         <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Tamaño de Empresa</label>
                                         <select 
                                            className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 outline-none focus:border-indigo-500 cursor-pointer"
                                            value={reportConfig.size}
                                            onChange={(e) => setReportConfig({...reportConfig, size: e.target.value})}
                                         >
                                             <option value="all">Cualquier tamaño</option>
                                             <option value="similar">Similar al Vendor (+/- 20%)</option>
                                             <option value="sm">1-10 Empleados</option>
                                             <option value="md">11-50 Empleados</option>
                                             <option value="lg">50+ Empleados</option>
                                         </select>
                                     </div>
                                 </div>
                             </div>

                             <div className="bg-indigo-50 p-3 rounded-lg flex items-center gap-3">
                                 <div className="relative w-10 h-10 flex items-center justify-center">
                                     {/* Fixed viewBox to prevent clipping of the stroke */}
                                     <svg className="transform -rotate-90 w-10 h-10" viewBox="0 0 40 40">
                                         <circle cx="20" cy="20" r="15.5" stroke="currentColor" strokeWidth="4" fill="transparent" className="text-indigo-200" />
                                         <circle cx="20" cy="20" r="15.5" stroke="currentColor" strokeWidth="4" fill="transparent" strokeDasharray="100" strokeDashoffset="15" className="text-indigo-600" />
                                     </svg>
                                     <span className="absolute text-[10px] font-bold text-indigo-800">85%</span>
                                 </div>
                                 <div>
                                     <p className="text-xs font-bold text-indigo-900">Precisión de Datos</p>
                                     <p className="text-[10px] text-indigo-700">Alta densidad de muestras para este segmento.</p>
                                 </div>
                             </div>
                             
                             <button className="w-full py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-100 flex items-center justify-center gap-2">
                                 <span className="material-symbols-outlined">auto_awesome</span>
                                 Regenerar Preview
                             </button>
                         </div>
                     </div>
                 </div>

                 {/* Right: Live Preview of the Premium Report */}
                 <div className="lg:col-span-2 bg-gray-50 p-8 rounded-3xl border border-gray-200 flex flex-col items-center justify-center relative overflow-hidden">
                     {/* The Report Card (Paper style A4-ish) */}
                     <div className="bg-white w-full max-w-2xl shadow-2xl rounded-xl border border-gray-200 overflow-hidden relative z-10 animate-in zoom-in-95 duration-500">
                         {/* Header */}
                         <div className="bg-indigo-900 p-8 text-white flex justify-between items-start pattern-grid-lg">
                             <div>
                                 <h2 className="text-2xl font-bold font-display tracking-tight">Reporte de Competitividad</h2>
                                 <p className="text-indigo-200 text-sm mt-2">Preparado para: <strong>{reportConfig.vendor}</strong> • Octubre 2024</p>
                             </div>
                             <div className="text-right">
                                 <span className="bg-white/10 px-3 py-1 rounded text-xs font-bold backdrop-blur-sm border border-white/20">PREMIUM TIER</span>
                             </div>
                         </div>

                         <div className="p-8 space-y-12">
                             
                             {/* Section 1: Executive Summary */}
                             <div className="grid grid-cols-3 gap-4">
                                 <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 text-center">
                                     <p className="text-xs font-bold text-gray-400 uppercase">Posición Mercado</p>
                                     <p className="text-2xl font-black text-indigo-600 mt-1">{vendorStats.rank}</p>
                                 </div>
                                 <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 text-center">
                                     <p className="text-xs font-bold text-gray-400 uppercase">Win Rate</p>
                                     <p className="text-2xl font-black text-gray-900 mt-1">{vendorStats.winRate}%</p>
                                     <p className="text-[10px] text-green-600 font-bold">vs {vendorStats.marketWinRate}% Avg</p>
                                 </div>
                                 <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 text-center">
                                     <p className="text-xs font-bold text-gray-400 uppercase">Ticket Promedio</p>
                                     <p className="text-2xl font-black text-gray-900 mt-1">{vendorStats.avgTicket}</p>
                                 </div>
                             </div>

                             {/* Visual 1: Bell Curve Pricing (Clean & Modern) */}
                             <div>
                                <h4 className="font-bold text-gray-900 mb-6 flex items-center gap-2">
                                     <span className="material-symbols-outlined text-indigo-600">stacked_line_chart</span> 
                                     Posicionamiento de Precio (Distribución Normal)
                                 </h4>
                                 <div className="relative h-40 w-full flex items-end justify-center px-4">
                                     {/* The Curve Shape */}
                                     <div className="absolute bottom-0 w-full h-32 bg-gradient-to-t from-indigo-50 to-white rounded-t-[100%] border-t border-indigo-200 opacity-60"></div>
                                     <div className="absolute bottom-0 w-[80%] h-24 bg-gradient-to-t from-indigo-100 to-white rounded-t-[100%] border-t border-indigo-300 opacity-60"></div>
                                     
                                     {/* Baseline */}
                                     <div className="absolute bottom-0 w-full h-px bg-gray-300"></div>

                                     {/* Average Marker */}
                                     <div className="absolute bottom-0 left-1/2 -translate-x-1/2 h-full flex flex-col items-center justify-end group">
                                         <div className="h-32 border-l border-dashed border-gray-400"></div>
                                         <span className="absolute -top-6 bg-gray-100 text-gray-600 text-[10px] font-bold px-2 py-1 rounded shadow-sm whitespace-nowrap">
                                             Promedio Mercado: {vendorStats.marketTicket}
                                         </span>
                                     </div>

                                     {/* You Marker */}
                                     <div 
                                        className="absolute bottom-0 h-full flex flex-col items-center justify-end z-10 transition-all duration-500"
                                        style={{ left: `${vendorStats.pricePosition}%` }}
                                     >
                                         <div className="h-28 w-0.5 bg-indigo-600 relative">
                                             <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3 h-3 bg-indigo-600 rounded-full border-2 border-white shadow-sm"></div>
                                         </div>
                                         <div className="absolute top-4 bg-indigo-600 text-white text-[10px] font-bold px-3 py-1.5 rounded-lg shadow-lg flex flex-col items-center whitespace-nowrap">
                                             <span>Tú: {vendorStats.avgTicket}</span>
                                             <div className="w-2 h-2 bg-indigo-600 transform rotate-45 absolute -bottom-1"></div>
                                         </div>
                                     </div>
                                 </div>
                                 <div className="mt-4 p-3 bg-indigo-50 rounded-lg text-xs text-indigo-800 border border-indigo-100">
                                     <span className="font-bold block mb-1">Metodología:</span>
                                     Estás en el <strong>percentil 75</strong>. Calculado sobre una base de 1,240 contratos cerrados en tu categoría ({reportConfig.sector}) en los últimos 90 días.
                                 </div>
                             </div>

                             {/* Visual 2: Funnel Comparison (FIXED OVERFLOW LOGIC) */}
                             <div>
                                 <h4 className="font-bold text-gray-900 mb-6 flex items-center gap-2">
                                     <span className="material-symbols-outlined text-blue-600">filter_list</span> 
                                     Análisis de Embudo vs. Top 10%
                                 </h4>
                                 <div className="space-y-6">
                                     {vendorStats.funnel.map((step, i) => {
                                         // Normalize widths so the LARGEST bar (user or benchmark) takes 100% of the container, preventing overflow.
                                         const maxVal = Math.max(step.value, step.benchmark) * 1.1; // 1.1 buffer
                                         const userWidth = (step.value / maxVal) * 100;
                                         const benchWidth = (step.benchmark / maxVal) * 100;

                                         return (
                                             <div key={i} className="flex items-center gap-4">
                                                 <div className="w-24 text-xs font-bold text-gray-500 text-right">{step.stage}</div>
                                                 <div className="flex-1 flex flex-col gap-1">
                                                     {/* User Bar */}
                                                     <div className="relative h-6 bg-indigo-50 rounded-r-full overflow-hidden w-full flex items-center">
                                                         <div 
                                                            className="absolute top-0 left-0 h-full bg-indigo-600 rounded-r-full flex items-center px-2 transition-all duration-700"
                                                            style={{ width: `${userWidth}%` }}
                                                         ></div>
                                                         <span className="relative z-10 text-[10px] font-bold text-indigo-900 px-2 ml-1">Tú: {step.value}</span>
                                                     </div>
                                                     {/* Benchmark Bar */}
                                                     <div className="relative h-6 bg-gray-50 rounded-r-full overflow-hidden w-full flex items-center">
                                                         <div 
                                                            className="absolute top-0 left-0 h-full bg-gray-300 rounded-r-full flex items-center px-2 transition-all duration-700"
                                                            style={{ width: `${benchWidth}%` }}
                                                         ></div>
                                                         <span className="relative z-10 text-[10px] font-bold text-gray-600 px-2 ml-1">Top 10%: {step.benchmark}</span>
                                                     </div>
                                                 </div>
                                                 <div className={`w-16 text-center text-[10px] font-bold px-2 py-1 rounded ${step.label === 'Bajo' ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'}`}>
                                                     {step.label}
                                                 </div>
                                             </div>
                                         );
                                     })}
                                 </div>
                                 <div className="mt-4 text-[10px] text-gray-400 text-right">
                                     *Comparativa normalizada por segmento de mercado seleccionado.
                                 </div>
                             </div>

                             {/* Visual 3: Quadrant Matrix (Competitiveness) */}
                             <div>
                                 <h4 className="font-bold text-gray-900 mb-6 flex items-center gap-2">
                                     <span className="material-symbols-outlined text-purple-600">apps</span> 
                                     Matriz de Competitividad (Calidad vs. Precio)
                                 </h4>
                                 <div className="relative h-80 w-full bg-gray-50 border border-gray-200 rounded-xl p-6 overflow-hidden">
                                     {/* Background Quadrants Labels */}
                                     <span className="absolute top-4 left-4 text-[10px] font-bold text-green-600 uppercase bg-green-50 px-2 py-1 rounded border border-green-100">Oportunidad / Gema</span>
                                     <span className="absolute top-4 right-4 text-[10px] font-bold text-purple-600 uppercase bg-purple-50 px-2 py-1 rounded border border-purple-100">Premium (Tú)</span>
                                     <span className="absolute bottom-4 left-4 text-[10px] font-bold text-gray-500 uppercase bg-white px-2 py-1 rounded border border-gray-200">Económico</span>
                                     <span className="absolute bottom-4 right-4 text-[10px] font-bold text-orange-500 uppercase bg-orange-50 px-2 py-1 rounded border border-orange-100">Sobrevalorado</span>

                                     {/* Axis Lines */}
                                     <div className="absolute left-1/2 top-0 bottom-0 w-px bg-gray-300 border-l border-dashed"></div>
                                     <div className="absolute top-1/2 left-0 right-0 h-px bg-gray-300 border-t border-dashed"></div>
                                     
                                     {/* Axis Titles */}
                                     <span className="absolute bottom-1 right-2 text-[10px] font-bold text-gray-400">Precio ($)</span>
                                     <span className="absolute top-2 left-1 text-[10px] font-bold text-gray-400">Calidad (Rating)</span>

                                     {/* Market Dots (Scatter) */}
                                     {[...Array(12)].map((_, i) => (
                                         <div 
                                            key={i} 
                                            className="absolute w-2 h-2 bg-gray-400 rounded-full opacity-40 hover:opacity-100 hover:scale-150 transition-all cursor-pointer"
                                            style={{ 
                                                left: `${10 + Math.random() * 80}%`, // Avoid edges
                                                top: `${10 + Math.random() * 80}%`   // Avoid edges
                                            }}
                                            title="Vendor Anónimo"
                                         ></div>
                                     ))}

                                     {/* User Dot */}
                                     <div 
                                        className="absolute w-6 h-6 bg-purple-600 rounded-full border-4 border-white shadow-lg flex items-center justify-center z-20 group cursor-help"
                                        style={{ left: '70%', top: '25%' }} // High Price (Right), High Quality (Top)
                                     >
                                         <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-black text-white text-[10px] px-3 py-1.5 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity z-30 shadow-xl">
                                             Tú: $125/h • 4.9★
                                             <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-black transform rotate-45"></div>
                                         </div>
                                     </div>
                                 </div>
                                 <p className="text-xs text-gray-500 mt-2">
                                     Te posicionas en el cuadrante <strong>Premium</strong>. Tu ratio Calidad/Precio es competitivo respecto al promedio del mercado (Puntos grises).
                                 </p>
                             </div>

                             {/* Section 4: Opportunity Escape */}
                             <div>
                                 <h4 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                                     <span className="material-symbols-outlined text-red-500">warning</span> 
                                     Escape de Oportunidades
                                 </h4>
                                 <div className="bg-red-50/50 border border-red-100 rounded-xl overflow-hidden">
                                     <table className="w-full text-sm text-left">
                                         <thead className="bg-red-50 text-xs text-red-800 uppercase font-bold">
                                             <tr>
                                                 <th className="px-4 py-3">Término de Búsqueda</th>
                                                 <th className="px-4 py-3">Volumen Perdido</th>
                                                 <th className="px-4 py-3 text-right">Valor Est.</th>
                                             </tr>
                                         </thead>
                                         <tbody className="divide-y divide-red-100">
                                             {vendorStats.opportunityEscape.map((opp, i) => (
                                                 <tr key={i}>
                                                     <td className="px-4 py-3 font-medium text-gray-900">
                                                         {opp.term}
                                                         <span className="block text-[10px] text-red-500 font-normal">{opp.reason}</span>
                                                     </td>
                                                     <td className="px-4 py-3 text-gray-600">{opp.volume}</td>
                                                     <td className="px-4 py-3 text-gray-900 font-bold text-right">{opp.potentialValue}</td>
                                                 </tr>
                                             ))}
                                         </tbody>
                                     </table>
                                 </div>
                             </div>

                         </div>
                         
                         {/* Footer */}
                         <div className="bg-gray-50 p-6 border-t border-gray-200 text-center">
                             <p className="text-xs text-gray-400 mb-2">Generado automáticamente por AI Dev Connect Intelligence Engine</p>
                             <div className="flex justify-center gap-4">
                                 <span className="text-[10px] text-gray-400">Privado & Confidencial</span>
                                 <span className="text-[10px] text-gray-400">ID: RPT-2024-882</span>
                             </div>
                         </div>
                     </div>

                     {/* Action Buttons for Admin */}
                     <div className="mt-8 flex gap-4 relative z-20">
                         <button className="bg-white text-gray-700 px-6 py-3 rounded-full font-bold shadow-lg hover:bg-gray-50 transition-colors flex items-center gap-2">
                             <span className="material-symbols-outlined">edit</span> Personalizar Notas
                         </button>
                         <button className="bg-indigo-600 text-white px-8 py-3 rounded-full font-bold shadow-lg shadow-indigo-300 hover:bg-indigo-700 transition-colors flex items-center gap-2 transform hover:-translate-y-1">
                             <span className="material-symbols-outlined">send</span> Enviar Reporte
                         </button>
                     </div>
                 </div>
             </div>
         )}

      </div>
    </AdminLayout>
  );
};

export default AdminMetrics;