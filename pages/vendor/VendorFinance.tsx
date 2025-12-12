import React, { useState, useRef, useEffect } from 'react';
import VendorLayout from '../../components/VendorLayout';

const VendorFinance: React.FC = () => {
  // Date Picker State
  const [isDateOpen, setIsDateOpen] = useState(false);
  const [dateRange, setDateRange] = useState({
    label: 'Este Mes',
    start: new Date().toISOString().split('T')[0].slice(0, 7) + '-01', // First day of current month
    end: new Date().toISOString().split('T')[0] // Today
  });
  const dateRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dateRef.current && !dateRef.current.contains(event.target as Node)) {
        setIsDateOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const applyPreset = (preset: string) => {
    const today = new Date();
    let start = '';
    let end = today.toISOString().split('T')[0];
    let label = preset;

    if (preset === 'Hoy') {
        start = end;
    } else if (preset === 'Últimos 7 días') {
        const d = new Date();
        d.setDate(d.getDate() - 7);
        start = d.toISOString().split('T')[0];
    } else if (preset === 'Este Mes') {
        start = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split('T')[0];
    } else if (preset === 'Mes Pasado') {
        const firstDayPrevMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
        const lastDayPrevMonth = new Date(today.getFullYear(), today.getMonth(), 0);
        start = firstDayPrevMonth.toISOString().split('T')[0];
        end = lastDayPrevMonth.toISOString().split('T')[0];
    } else {
        label = 'Custom';
        // Keep current manual values
        start = dateRange.start;
        end = dateRange.end;
    }

    setDateRange({ label, start, end });
    if (preset !== 'Custom') setIsDateOpen(false);
  };

  const handleManualChange = (type: 'start' | 'end', value: string) => {
      setDateRange(prev => ({ ...prev, label: 'Personalizado', [type]: value }));
  };

  return (
    <VendorLayout>
      <div className="space-y-8 pb-12">
         <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
                <h1 className="text-3xl font-black text-gray-900">Finanzas y Flujo de Caja</h1>
                <p className="text-gray-500 mt-1">Gestiona facturación, cobros y retiros.</p>
            </div>
            <div className="flex gap-2">
                <button className="bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg text-sm font-bold hover:bg-gray-50 flex items-center gap-2">
                    <span className="material-symbols-outlined">download</span> Exportar CSV
                </button>
                <button className="bg-green-600 text-white px-6 py-2 rounded-lg font-bold shadow-sm hover:bg-green-700 flex items-center gap-2">
                    <span className="material-symbols-outlined">account_balance</span>
                    Configurar Retiros
                </button>
            </div>
         </div>

         {/* Summary Cards */}
         <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white border border-gray-200 p-6 rounded-xl shadow-sm relative overflow-hidden group">
               <div className="absolute top-0 right-0 w-20 h-20 bg-green-50 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110"></div>
               <div className="relative z-10">
                   <div className="flex justify-between items-start mb-2">
                       <p className="text-gray-500 text-sm font-bold uppercase">Disponible para Retiro</p>
                       <span className="p-2 bg-green-50 text-green-600 rounded-lg"><span className="material-symbols-outlined">savings</span></span>
                   </div>
                   <p className="text-4xl font-black text-gray-900">$8,450.00</p>
                   <button className="text-sm font-bold text-green-600 hover:underline mt-2 flex items-center gap-1">
                       Retirar ahora <span className="material-symbols-outlined text-base">arrow_forward</span>
                   </button>
               </div>
            </div>
            <div className="bg-[#1313ec] text-white p-6 rounded-xl shadow-lg relative overflow-hidden group">
               <div className="relative z-10">
                   <div className="flex justify-between items-start mb-2">
                       <p className="text-blue-200 text-sm font-bold uppercase">En Escrow (Protegido)</p>
                       <span className="p-2 bg-white/20 text-white rounded-lg"><span className="material-symbols-outlined">lock</span></span>
                   </div>
                   <p className="text-4xl font-black">$15,000.00</p>
                   <p className="text-sm text-blue-200 mt-2">Se libera al aprobar hitos</p>
               </div>
               <span className="material-symbols-outlined absolute -right-4 -bottom-4 text-9xl text-white/10 group-hover:scale-110 transition-transform">security</span>
            </div>
            <div className="bg-white border border-gray-200 p-6 rounded-xl shadow-sm relative overflow-hidden group">
               <div className="absolute top-0 right-0 w-20 h-20 bg-purple-50 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110"></div>
               <div className="relative z-10">
                   <div className="flex justify-between items-start mb-2">
                       <p className="text-gray-500 text-sm font-bold uppercase">Proyectado (Q4)</p>
                       <span className="p-2 bg-purple-50 text-purple-600 rounded-lg"><span className="material-symbols-outlined">trending_up</span></span>
                   </div>
                   <p className="text-4xl font-black text-gray-900">$42,000</p>
                   <p className="text-sm text-gray-400 mt-2">Basado en contratos activos</p>
               </div>
            </div>
         </div>

         {/* Detailed Table & Filters */}
         <div className="space-y-4">
            
            {/* Toolbar */}
            <div className="flex flex-col md:flex-row justify-between gap-4 bg-white p-4 rounded-xl border border-gray-200 shadow-sm z-20 relative">
                <div className="flex gap-2 items-center w-full md:w-auto overflow-x-auto no-scrollbar">
                    <span className="text-sm font-bold text-gray-500 uppercase mr-2">Filtrar:</span>
                    <button className="px-3 py-1.5 bg-dark text-white rounded-lg text-sm font-medium">Todos</button>
                    <button className="px-3 py-1.5 bg-gray-100 text-gray-600 hover:bg-gray-200 rounded-lg text-sm font-medium">Pagados</button>
                    <button className="px-3 py-1.5 bg-gray-100 text-gray-600 hover:bg-gray-200 rounded-lg text-sm font-medium">En Escrow</button>
                    <button className="px-3 py-1.5 bg-gray-100 text-gray-600 hover:bg-gray-200 rounded-lg text-sm font-medium">Pendientes</button>
                </div>
                
                {/* Date Picker Widget */}
                <div className="relative w-full md:w-auto" ref={dateRef}>
                    <button 
                        onClick={() => setIsDateOpen(!isDateOpen)}
                        className="flex items-center justify-between gap-3 w-full md:w-64 bg-white border border-gray-300 hover:border-gray-400 text-gray-700 px-4 py-2 rounded-lg shadow-sm transition-all text-sm font-medium"
                    >
                        <div className="flex items-center gap-2">
                            <span className="material-symbols-outlined text-gray-500">calendar_today</span>
                            <span>{dateRange.label === 'Personalizado' ? `${dateRange.start} - ${dateRange.end}` : dateRange.label}</span>
                        </div>
                        <span className="material-symbols-outlined text-gray-400 text-lg">expand_more</span>
                    </button>

                    {isDateOpen && (
                        <div className="absolute top-full right-0 mt-2 w-72 bg-white rounded-xl shadow-floating border border-gray-200 p-4 z-50 animate-in fade-in zoom-in-95 duration-200">
                            <div className="space-y-1 mb-4">
                                {['Hoy', 'Últimos 7 días', 'Este Mes', 'Mes Pasado'].map(preset => (
                                    <button 
                                        key={preset}
                                        onClick={() => applyPreset(preset)}
                                        className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors flex justify-between items-center ${dateRange.label === preset ? 'bg-primary/10 text-primary' : 'text-gray-700 hover:bg-gray-50'}`}
                                    >
                                        {preset}
                                        {dateRange.label === preset && <span className="material-symbols-outlined text-sm">check</span>}
                                    </button>
                                ))}
                            </div>
                            
                            <div className="border-t border-gray-100 pt-3">
                                <p className="text-xs font-bold text-gray-400 uppercase mb-2">Rango Personalizado</p>
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between gap-2">
                                        <span className="text-xs text-gray-500 w-10">Desde</span>
                                        <input 
                                            type="date" 
                                            value={dateRange.start}
                                            onChange={(e) => handleManualChange('start', e.target.value)}
                                            className="flex-1 bg-gray-50 border border-gray-200 rounded px-2 py-1 text-xs text-gray-700 outline-none focus:border-primary"
                                        />
                                    </div>
                                    <div className="flex items-center justify-between gap-2">
                                        <span className="text-xs text-gray-500 w-10">Hasta</span>
                                        <input 
                                            type="date" 
                                            value={dateRange.end}
                                            onChange={(e) => handleManualChange('end', e.target.value)}
                                            className="flex-1 bg-gray-50 border border-gray-200 rounded px-2 py-1 text-xs text-gray-700 outline-none focus:border-primary"
                                        />
                                    </div>
                                </div>
                                <button 
                                    onClick={() => setIsDateOpen(false)}
                                    className="w-full mt-3 bg-dark text-white text-xs font-bold py-2 rounded-lg hover:bg-black transition-colors"
                                >
                                    Aplicar
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
                <table className="w-full text-left">
                    <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                            <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">ID / Referencia</th>
                            <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Proyecto</th>
                            <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Fecha</th>
                            <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Monto</th>
                            <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Estado</th>
                            <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase text-right">Acción</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        <tr className="hover:bg-gray-50 transition-colors">
                            <td className="px-6 py-4 font-mono text-xs text-gray-500">#INV-24-003</td>
                            <td className="px-6 py-4">
                                <p className="font-bold text-gray-900">Chatbot Banca - Hito 2</p>
                                <p className="text-xs text-gray-500">Cliente Corp</p>
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-600">15 Oct 2024</td>
                            <td className="px-6 py-4 font-bold text-gray-900">$5,000</td>
                            <td className="px-6 py-4">
                                <span className="px-2 py-1 bg-amber-100 text-amber-800 text-xs font-bold rounded-full flex items-center w-fit gap-1">
                                    <span className="material-symbols-outlined text-[10px]">hourglass_top</span> Pendiente
                                </span>
                            </td>
                            <td className="px-6 py-4 text-right">
                                <button className="text-primary hover:underline text-xs font-bold">Solicitar Liberación</button>
                            </td>
                        </tr>
                        <tr className="hover:bg-gray-50 transition-colors">
                            <td className="px-6 py-4 font-mono text-xs text-gray-500">#INV-24-002</td>
                            <td className="px-6 py-4">
                                <p className="font-bold text-gray-900">Motor Recomendación - Hito 1</p>
                                <p className="text-xs text-gray-500">Logistics Pro</p>
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-600">01 Oct 2024</td>
                            <td className="px-6 py-4 font-bold text-gray-900">$10,000</td>
                            <td className="px-6 py-4">
                                <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-bold rounded-full flex items-center w-fit gap-1">
                                    <span className="material-symbols-outlined text-[10px]">lock</span> En Escrow
                                </span>
                            </td>
                            <td className="px-6 py-4 text-right">
                                <button className="text-gray-400 hover:text-dark"><span className="material-symbols-outlined text-lg">visibility</span></button>
                            </td>
                        </tr>
                        <tr className="hover:bg-gray-50 transition-colors">
                            <td className="px-6 py-4 font-mono text-xs text-gray-500">#INV-24-001</td>
                            <td className="px-6 py-4">
                                <p className="font-bold text-gray-900">Consultoría AI - Inicial</p>
                                <p className="text-xs text-gray-500">Retail Corp</p>
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-600">15 Sep 2024</td>
                            <td className="px-6 py-4 font-bold text-gray-900">$2,500</td>
                            <td className="px-6 py-4">
                                <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-bold rounded-full flex items-center w-fit gap-1">
                                    <span className="material-symbols-outlined text-[10px]">check_circle</span> Pagado
                                </span>
                            </td>
                            <td className="px-6 py-4 text-right">
                                <button className="text-gray-400 hover:text-green-600"><span className="material-symbols-outlined text-lg">download</span></button>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
         </div>
      </div>
    </VendorLayout>
  );
};

export default VendorFinance;