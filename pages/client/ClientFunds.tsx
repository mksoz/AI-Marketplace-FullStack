import React, { useState, useRef, useEffect } from 'react';
import ClientLayout from '../../components/ClientLayout';
import api from '../../services/api';
import { useToast } from '../../contexts/ToastContext';

interface FinancialItem {
   id: string;
   reference: string;
   project: string;
   counterparty: string; // Vendor Name or Platform
   date: string;
   amount: number;
   status: 'Pagado' | 'Aprobado' | 'Pendiente' | 'Rechazado' | 'En Escrow' | 'Recibido';
   originalStatus?: string;
   type: 'MILESTONE' | 'TRANSACTION';
   isDebit?: boolean;
}

interface FundsSummary {
   balance: number;
   currency: string;
   escrowAmount: number;
   projectedAmount: number;
   totalSpent: number;
   financialItems: FinancialItem[];
}

const ClientFunds: React.FC = () => {
   const { showToast } = useToast();
   const [loading, setLoading] = useState(true);
   const [summary, setSummary] = useState<FundsSummary>({
      balance: 0,
      currency: 'USD',
      escrowAmount: 0,
      projectedAmount: 0,
      totalSpent: 0,
      financialItems: []
   });

   // Filter State
   const [filterStatus, setFilterStatus] = useState<'All' | 'Paid' | 'In Progress' | 'Pending'>('All');

   // Date Picker State - Default to 'Todos'
   const [isDateOpen, setIsDateOpen] = useState(false);
   const [dateRange, setDateRange] = useState({
      label: 'Todos',
      start: '2023-01-01',
      end: '2030-12-31'
   });
   const dateRef = useRef<HTMLDivElement>(null);

   useEffect(() => {
      fetchFundsData();
   }, []);

   const fetchFundsData = async () => {
      try {
         setLoading(true);
         const res = await api.get('/accounts/client-summary');
         setSummary(res.data);
      } catch (error) {
         console.error('Error fetching funds data:', error);
         showToast('Error al cargar datos financieros', 'error');
      } finally {
         setLoading(false);
      }
   };

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
         end = new Date(today.getFullYear(), today.getMonth() + 1, 0).toISOString().split('T')[0];
      } else if (preset === 'Todos') {
         start = '2023-01-01';
         end = '2030-12-31';
         label = 'Todo el historial';
      } else {
         label = 'Custom';
         start = dateRange.start;
         end = dateRange.end;
      }

      setDateRange({ label, start, end });
      if (preset !== 'Custom') setIsDateOpen(false);
   };

   // Filtering Logic
   const filteredItems = summary.financialItems.filter(item => {
      const itemDate = new Date(item.date).toISOString().split('T')[0];
      if (itemDate < dateRange.start || itemDate > dateRange.end) return false;

      if (filterStatus === 'All') return true;
      if (filterStatus === 'Paid') return item.status === 'Pagado' || item.status === 'Recibido';
      if (filterStatus === 'In Progress') return item.status === 'En Escrow';
      if (filterStatus === 'Pending') return item.status === 'Pendiente';
      return true;
   });

   const currencyFormatter = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
   });

   return (
      <ClientLayout>
         <div className="max-w-7xl mx-auto space-y-8 pb-12">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-end gap-4 border-b border-gray-100 pb-6">
               <div>
                  <h1 className="text-3xl font-black text-gray-900 tracking-tight">Gestión de Fondos</h1>
                  <p className="text-gray-500 mt-1">Administra depósitos, garantías y pagos</p>
               </div>
               <div className="flex gap-3">
                  <button
                     className="bg-primary text-white px-5 py-2.5 rounded-lg text-sm font-bold shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all flex items-center gap-2"
                  >
                     <span className="material-symbols-outlined">add</span>
                     Depositar Fondos
                  </button>
               </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
               {/* Balance */}
               <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start mb-4">
                     <p className="text-green-600 text-xs font-semibold uppercase tracking-wider">Disponible</p>
                     <span className="material-symbols-outlined text-green-200">account_balance_wallet</span>
                  </div>
                  <p className="text-3xl font-bold text-gray-900 tracking-tight">
                     {loading ? '...' : currencyFormatter.format(summary.balance)}
                  </p>
                  <p className="text-xs text-green-400 mt-1">Listo para asignar</p>
               </div>

               {/* Escrow */}
               <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start mb-4">
                     <div className="flex items-center gap-2">
                        <p className="text-blue-600 text-xs font-semibold uppercase tracking-wider">En Garantía</p>
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse"></span>
                     </div>
                     <span className="material-symbols-outlined text-blue-200">lock</span>
                  </div>
                  <p className="text-3xl font-bold text-gray-900 tracking-tight">
                     {loading ? '...' : currencyFormatter.format(summary.escrowAmount)}
                  </p>
                  <p className="text-xs text-blue-400 mt-1">Fondos protegidos</p>
               </div>

               {/* Pending/Projected */}
               <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start mb-4">
                     <p className="text-amber-600 text-xs font-semibold uppercase tracking-wider">Pendiente</p>
                     <span className="material-symbols-outlined text-amber-200">pending</span>
                  </div>
                  <p className="text-3xl font-bold text-gray-900 tracking-tight">
                     {loading ? '...' : currencyFormatter.format(summary.projectedAmount)}
                  </p>
                  <p className="text-xs text-amber-400 mt-1">Obligaciones futuras</p>
               </div>

               {/* Spent */}
               <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start mb-4">
                     <p className="text-purple-600 text-xs font-semibold uppercase tracking-wider">Total Liberado</p>
                     <span className="material-symbols-outlined text-purple-200">payments</span>
                  </div>
                  <p className="text-3xl font-bold text-gray-900 tracking-tight">
                     {loading ? '...' : currencyFormatter.format(summary.totalSpent)}
                  </p>
                  <p className="text-xs text-purple-400 mt-1">Pagos completados</p>
               </div>
            </div>

            {/* Filters & Table */}
            <div className="space-y-6">
               {/* Toolbar */}
               <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                  <div className="flex gap-1 p-1 bg-gray-50 rounded-lg">
                     {(['All', 'Paid', 'In Progress', 'Pending'] as const).map((status) => (
                        <button
                           key={status}
                           onClick={() => setFilterStatus(status)}
                           className={`px-4 py-1.5 rounded-md text-xs font-medium transition-all ${filterStatus === status
                              ? 'bg-white text-gray-900 shadow-sm'
                              : 'text-gray-500 hover:text-gray-700'
                              }`}
                        >
                           {status === 'All' ? 'Todos' :
                              status === 'Paid' ? 'Liberados' :
                                 status === 'In Progress' ? 'En Garantía' : 'Pendientes'}
                        </button>
                     ))}
                  </div>

                  {/* Date Picker */}
                  <div className="relative" ref={dateRef}>
                     <button
                        onClick={() => setIsDateOpen(!isDateOpen)}
                        className="flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-gray-900"
                     >
                        <span className="material-symbols-outlined text-lg">calendar_today</span>
                        <span>{dateRange.label === 'Personalizado' ? `${dateRange.start} - ${dateRange.end}` : dateRange.label}</span>
                        <span className="material-symbols-outlined text-lg">expand_more</span>
                     </button>

                     {isDateOpen && (
                        <div className="absolute top-full right-0 mt-2 w-72 bg-white rounded-xl shadow-xl border border-gray-100 p-2 z-50">
                           {['Hoy', 'Últimos 7 días', 'Este Mes', 'Todos'].map(preset => (
                              <button
                                 key={preset}
                                 onClick={() => applyPreset(preset)}
                                 className={`w-full text-left px-3 py-2 rounded-lg text-xs font-medium ${dateRange.label === preset ? 'bg-gray-50 text-gray-900' : 'text-gray-500 hover:bg-gray-50'}`}
                              >
                                 {preset}
                              </button>
                           ))}
                        </div>
                     )}
                  </div>
               </div>

               {/* Table */}
               <div className="overflow-hidden">
                  <table className="w-full text-left">
                     <thead className="border-b border-gray-100">
                        <tr>
                           <th className="px-4 py-3 text-[10px] font-bold text-gray-400 uppercase tracking-wider">Concepto</th>
                           <th className="px-4 py-3 text-[10px] font-bold text-gray-400 uppercase tracking-wider">Vendor / Destino</th>
                           <th className="px-4 py-3 text-[10px] font-bold text-gray-400 uppercase tracking-wider">Fecha</th>
                           <th className="px-4 py-3 text-[10px] font-bold text-gray-400 uppercase tracking-wider">Monto</th>
                           <th className="px-4 py-3 text-[10px] font-bold text-gray-400 uppercase tracking-wider">Estado</th>
                           <th className="px-4 py-3 text-[10px] font-bold text-gray-400 uppercase tracking-wider text-right"></th>
                        </tr>
                     </thead>
                     <tbody className="divide-y divide-gray-50">
                        {loading ? (
                           <tr><td colSpan={6} className="px-4 py-8 text-center text-gray-400 text-sm">Cargando...</td></tr>
                        ) : filteredItems.length === 0 ? (
                           <tr><td colSpan={6} className="px-4 py-8 text-center text-gray-400 text-sm">Sin movimientos</td></tr>
                        ) : (
                           filteredItems.map((item) => (
                              <tr key={item.id} className="group hover:bg-gray-50/50 transition-colors">
                                 <td className="px-4 py-3">
                                    <p className="text-sm font-medium text-gray-900">{item.project}</p>
                                    <p className="text-[10px] text-gray-400">{item.reference}</p>
                                 </td>
                                 <td className="px-4 py-3 text-sm text-gray-600">
                                    {item.counterparty}
                                 </td>
                                 <td className="px-4 py-3 text-xs text-gray-500">
                                    {new Date(item.date).toLocaleDateString()}
                                 </td>
                                 <td className={`px-4 py-3 text-sm font-semibold ${!item.isDebit ? 'text-green-600' : 'text-gray-900'}`}>
                                    {item.isDebit ? '-' : '+'}{currencyFormatter.format(item.amount)}
                                 </td>
                                 <td className="px-4 py-3">
                                    <StatusBadge status={item.status} originalStatus={item.originalStatus} />
                                 </td>
                                 <td className="px-4 py-3 text-right">
                                    {item.status === 'Pendiente' && item.originalStatus !== 'PENDING' && (
                                       <button className="bg-red-50 text-red-600 px-3 py-1 rounded-full text-xs font-bold hover:bg-red-100 transition-colors">
                                          Revisar
                                       </button>
                                    )}
                                 </td>
                              </tr>
                           ))
                        )}
                     </tbody>
                  </table>
               </div>
            </div>
         </div>
      </ClientLayout>
   );
};

const StatusBadge = ({ status, originalStatus }: { status: string, originalStatus?: string }) => {
   let styles = 'bg-gray-100 text-gray-500';
   let dot = 'bg-gray-400';
   let label = status;

   switch (status) {
      case 'Pagado':
         styles = 'bg-gray-100 text-gray-700';
         dot = 'bg-green-500';
         label = 'Liberado';
         break;
      case 'Recibido':
         styles = 'bg-green-50 text-green-700';
         dot = 'bg-green-500';
         break;
      case 'En Escrow':
         styles = 'bg-blue-50 text-blue-700';
         dot = 'bg-blue-500';
         break;
      case 'En Garantía': // New case matching backend map
         styles = 'bg-blue-50 text-blue-700';
         dot = 'bg-blue-500';
         break;
      case 'Pendiente':
         if (originalStatus === 'PENDING') {
            label = 'Proyectado';
            styles = 'bg-gray-50 text-gray-400';
            dot = 'bg-gray-300';
         } else {
            label = 'Por Aprobar';
            styles = 'bg-amber-50 text-amber-700';
            dot = 'bg-amber-500';
         }
         break;
   }

   return (
      <span className={`px-2 py-0.5 text-[10px] font-medium rounded-full flex items-center w-fit gap-1.5 ${styles}`}>
         <span className={`w-1 h-1 rounded-full ${dot}`}></span>
         {label}
      </span>
   );
}

export default ClientFunds;