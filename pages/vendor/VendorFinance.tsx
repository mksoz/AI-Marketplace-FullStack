import React, { useState, useRef, useEffect } from 'react';
import VendorLayout from '../../components/VendorLayout';
import api from '../../services/api';
import { useToast } from '../../contexts/ToastContext';

interface FinancialItem {
    id: string;
    reference: string;
    project: string;
    client: string;
    date: string;
    amount: number;
    status: 'Pagado' | 'Aprobado' | 'Pendiente' | 'Rechazado' | 'En Escrow' | 'En Garantía';
    originalStatus?: string;
    type: 'MILESTONE' | 'TRANSACTION';
    isDebit?: boolean;
}

interface FinanceSummary {
    balance: number;
    currency: string;
    escrowAmount: number;
    projectedAmount: number;
    financialItems: FinancialItem[];
}

const VendorFinance: React.FC = () => {
    const { showToast } = useToast();
    const [loading, setLoading] = useState(true);
    const [summary, setSummary] = useState<FinanceSummary>({
        balance: 0,
        currency: 'USD',
        escrowAmount: 0,
        projectedAmount: 0,
        financialItems: []
    });

    // Filter State
    const [filterStatus, setFilterStatus] = useState<'All' | 'Paid' | 'Escrow' | 'Pending'>('All');

    // Date Picker State - Default to 'Todos' to show Projected (Future) and History
    const [isDateOpen, setIsDateOpen] = useState(false);
    const [dateRange, setDateRange] = useState({
        label: 'Todos',
        start: '2023-01-01',
        end: '2030-12-31'
    });
    const dateRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        fetchFinanceData();
    }, []);

    const fetchFinanceData = async () => {
        try {
            setLoading(true);
            const res = await api.get('/accounts/vendor-summary');
            setSummary(res.data);
        } catch (error) {
            console.error('Error fetching finance data:', error);
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
        } else if (preset === 'Mes Pasado') {
            const firstDayPrevMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
            const lastDayPrevMonth = new Date(today.getFullYear(), today.getMonth(), 0);
            start = firstDayPrevMonth.toISOString().split('T')[0];
            end = lastDayPrevMonth.toISOString().split('T')[0];
        } else if (preset === 'Todos') {
            start = '2023-01-01';
            end = '2030-12-31'; // Future included for Projected
            label = 'Todo el historial';
        } else {
            label = 'Custom';
            start = dateRange.start;
            end = dateRange.end;
        }

        setDateRange({ label, start, end });
        if (preset !== 'Custom') setIsDateOpen(false);
    };

    const handleManualChange = (type: 'start' | 'end', value: string) => {
        setDateRange(prev => ({ ...prev, label: 'Personalizado', [type]: value }));
    };

    // Filtering Logic
    const filteredItems = summary.financialItems.filter(item => {
        const itemDate = new Date(item.date).toISOString().split('T')[0];
        if (itemDate < dateRange.start || itemDate > dateRange.end) return false;

        if (filterStatus === 'All') return true;
        if (filterStatus === 'Paid') return item.status === 'Pagado';
        if (filterStatus === 'Escrow') return item.status === 'En Escrow' || item.status === 'En Garantía' || item.status === 'Aprobado';
        if (filterStatus === 'Pending') return item.status === 'Pendiente';
        return true;
    });

    const currencyFormatter = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD'
    });

    return (
        <VendorLayout>
            <div className="max-w-7xl mx-auto space-y-8 pb-12">
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-end gap-4 border-b border-gray-100 pb-6">
                    <div>
                        <h1 className="text-3xl font-black text-gray-900 tracking-tight">Finanzas</h1>
                        <p className="text-gray-500 mt-1">Resumen de actividad y flujo de caja</p>
                    </div>
                    <div className="flex gap-3">
                        <button
                            onClick={() => {
                                const header = ['ID', 'Referencia', 'Proyecto', 'Cliente', 'Fecha', 'Monto', 'Estado'];
                                const rows = filteredItems.map(item => [
                                    item.id, item.reference, item.project, item.client, new Date(item.date).toLocaleDateString(), item.amount, item.status
                                ]);
                                const csvContent = [header, ...rows].map(e => e.join(',')).join('\n');
                                const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
                                const link = document.createElement('a');
                                link.href = URL.createObjectURL(blob);
                                link.download = 'finanzas.csv';
                                link.click();
                            }}
                            className="text-gray-600 px-4 py-2 text-sm font-medium hover:text-gray-900 transition-colors flex items-center gap-2"
                        >
                            <span className="material-symbols-outlined text-[18px]">download</span> Exportar
                        </button>
                        <button className="bg-primary text-white px-5 py-2.5 rounded-lg text-sm font-bold shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all flex items-center gap-2">
                            <span className="material-symbols-outlined">account_balance_wallet</span>
                            Configurar Retiros
                        </button>
                    </div>
                </div>

                {/* Minimalist Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Balance Card */}
                    <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex justify-between items-start mb-4">
                            <p className="text-green-600 text-xs font-semibold uppercase tracking-wider">Disponible</p>
                            <span className="material-symbols-outlined text-green-200">wallet</span>
                        </div>
                        <p className="text-3xl font-bold text-gray-900 tracking-tight">
                            {loading ? '...' : currencyFormatter.format(summary.balance)}
                        </p>
                        {summary.balance > 0 && (
                            <div className="mt-4 pt-4 border-t border-gray-50">
                                <button className="text-xs font-bold text-gray-900 flex items-center gap-1 group">
                                    Retirar fondos <span className="material-symbols-outlined text-sm group-hover:translate-x-0.5 transition-transform">arrow_forward</span>
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Escrow/In-Progress Card */}
                    <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex justify-between items-start mb-4">
                            <div className="flex items-center gap-2">
                                <p className="text-blue-600 text-xs font-semibold uppercase tracking-wider">En Escrow</p>
                                <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse"></span>
                            </div>
                            <span className="material-symbols-outlined text-blue-200">lock</span>
                        </div>
                        <p className="text-3xl font-bold text-gray-900 tracking-tight">
                            {loading ? '...' : currencyFormatter.format(summary.escrowAmount)}
                        </p>
                        <p className="text-xs text-blue-400 mt-2">Fondos asegurados</p>
                    </div>

                    {/* Projected Card */}
                    <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex justify-between items-start mb-4">
                            <p className="text-amber-600 text-xs font-semibold uppercase tracking-wider">Proyectado</p>
                            <span className="material-symbols-outlined text-amber-200">trending_up</span>
                        </div>
                        <p className="text-3xl font-bold text-gray-900 tracking-tight">
                            {loading ? '...' : currencyFormatter.format(summary.projectedAmount)}
                        </p>
                        <p className="text-xs text-amber-400 mt-2">Por iniciar</p>
                    </div>
                </div>

                {/* Filters & Table */}
                <div className="space-y-6">
                    {/* Minimal Toolbar */}
                    <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                        <div className="flex gap-1 p-1 bg-gray-50 rounded-lg">
                            {(['All', 'Paid', 'Escrow', 'Pending'] as const).map((status) => (
                                <button
                                    key={status}
                                    onClick={() => setFilterStatus(status)}
                                    className={`px-4 py-1.5 rounded-md text-xs font-medium transition-all ${filterStatus === status
                                        ? 'bg-white text-gray-900 shadow-sm'
                                        : 'text-gray-500 hover:text-gray-700'
                                        }`}
                                >
                                    {status === 'All' ? 'Todos' :
                                        status === 'Paid' ? 'Pagados' :
                                            status === 'Escrow' ? 'Escrow' : 'Pendientes'}
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
                                    {['Hoy', 'Últimos 7 días', 'Este Mes', 'Mes Pasado', 'Todos'].map(preset => (
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
                                    <th className="px-4 py-3 text-[10px] font-bold text-gray-400 uppercase tracking-wider">Ref</th>
                                    <th className="px-4 py-3 text-[10px] font-bold text-gray-400 uppercase tracking-wider">Proyecto</th>
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
                                            <td className="px-4 py-3 text-xs text-gray-400 font-mono">{item.reference}</td>
                                            <td className="px-4 py-3">
                                                <p className="text-sm font-medium text-gray-900">{item.project}</p>
                                                <p className="text-[10px] text-gray-400">{item.client}</p>
                                            </td>
                                            <td className="px-4 py-3 text-xs text-gray-500">
                                                {new Date(item.date).toLocaleDateString()}
                                            </td>
                                            <td className={`px-4 py-3 text-sm font-semibold ${item.isDebit ? 'text-gray-900' : 'text-gray-900'}`}>
                                                {item.isDebit ? '-' : ''}{currencyFormatter.format(item.amount)}
                                            </td>
                                            <td className="px-4 py-3">
                                                <StatusBadge status={item.status} originalStatus={item.originalStatus} />
                                            </td>
                                            <td className="px-4 py-3 text-right">
                                                {item.status === 'Pendiente' && !item.isDebit && item.originalStatus !== 'PENDING' && (
                                                    <button className="text-xs font-medium text-gray-900 underline decoration-gray-300 hover:decoration-gray-900">Solicitar</button>
                                                )}
                                                {item.status === 'Pagado' && (
                                                    <button className="text-gray-300 hover:text-gray-900 transition-colors">
                                                        <span className="material-symbols-outlined text-lg">download</span>
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
        </VendorLayout>
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
            break;
        case 'Aprobado':
            styles = 'bg-blue-50 text-blue-700';
            dot = 'bg-blue-500';
            break;
        case 'En Escrow':
            styles = 'bg-blue-50 text-blue-700';
            dot = 'bg-blue-500';
            break;
        case 'En Garantía':
            styles = 'bg-purple-50 text-purple-700';
            dot = 'bg-purple-500';
            break;
        case 'Pendiente':
            // Logic to differentiate
            if (originalStatus === 'PENDING') {
                label = 'Por Iniciar';
                styles = 'bg-gray-50 text-gray-400';
                dot = 'bg-gray-300';
            } else {
                // Payment Requested PENDING
                label = 'Solicitado';
                styles = 'bg-amber-50 text-amber-700';
                dot = 'bg-amber-500';
            }
            break;
        case 'Rechazado':
            styles = 'bg-red-50 text-red-600';
            dot = 'bg-red-500';
            break;
    }

    return (
        <span className={`px-2 py-0.5 text-[10px] font-medium rounded-full flex items-center w-fit gap-1.5 ${styles}`}>
            <span className={`w-1 h-1 rounded-full ${dot}`}></span>
            {label}
        </span>
    );
}

export default VendorFinance;