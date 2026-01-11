import React, { useState, useEffect } from 'react';
import AdminLayout from '../../components/AdminLayout';
import toast from 'react-hot-toast';
import { adminFinanceService } from '../../services/adminService';

interface FinanceDashboard {
    platformBalance: number;
    pendingTransactions: number;
    thisMonthRevenue: number;
    pendingPaymentRequests: number;
    failedTransactions: number;
    disputedPayments: number;
}

interface Transaction {
    id: string;
    amount: number;
    type: string;
    status: string;
    description: string | null;
    createdAt: string;
    fromAccount?: {
        client: {
            companyName: string | null;
            user: { email: string };
        };
    } | null;
    toAccount?: {
        vendor: {
            companyName: string | null;
            user: { email: string };
        };
    } | null;
}

interface PaymentRequest {
    id: string;
    amount: number;
    status: string;
    requestedAt: string;
    milestone: {
        title: string;
        project: {
            id: string;
            title: string;
            client: {
                companyName: string | null;
                user: { email: string };
            };
            vendor: {
                companyName: string | null;
                user: { email: string };
            } | null;
        };
    };
}

const AdminFinance: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'dashboard' | 'transactions' | 'payments'>('dashboard');
    const [dashboard, setDashboard] = useState<FinanceDashboard | null>(null);
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [paymentRequests, setPaymentRequests] = useState<PaymentRequest[]>([]);
    const [loading, setLoading] = useState(true);

    // Pagination
    const [page, setPage] = useState(1);
    const [total, setTotal] = useState(0);
    const limit = 20;

    // Filters
    const [statusFilter, setStatusFilter] = useState('all');
    const [typeFilter, setTypeFilter] = useState('all');

    // Modals
    const [showApproveModal, setShowApproveModal] = useState(false);
    const [showRefundModal, setShowRefundModal] = useState(false);
    const [selectedItem, setSelectedItem] = useState<any>(null);

    useEffect(() => {
        if (activeTab === 'dashboard') {
            fetchDashboard();
        } else if (activeTab === 'transactions') {
            fetchTransactions();
        } else if (activeTab === 'payments') {
            fetchPaymentRequests();
        }
    }, [activeTab, page, statusFilter, typeFilter]);

    const fetchDashboard = async () => {
        try {
            setLoading(true);
            const response = await adminFinanceService.getDashboard();
            setDashboard(response.data);
        } catch (error: any) {
            console.error('Error loading dashboard:', error);
            toast.error('Error al cargar dashboard financiero');
        } finally {
            setLoading(false);
        }
    };

    const fetchTransactions = async () => {
        try {
            setLoading(true);
            const params: any = { page, limit };
            if (statusFilter !== 'all') params.status = statusFilter;
            if (typeFilter !== 'all') params.type = typeFilter;

            const response = await adminFinanceService.getTransactions(params);
            setTransactions(response.data.transactions);
            setTotal(response.data.total);
        } catch (error: any) {
            console.error('Error loading transactions:', error);
            toast.error('Error al cargar transacciones');
        } finally {
            setLoading(false);
        }
    };

    const fetchPaymentRequests = async () => {
        try {
            setLoading(true);
            const params: any = { page, limit };
            if (statusFilter !== 'all') params.status = statusFilter;

            const response = await adminFinanceService.getPaymentRequests(params);
            setPaymentRequests(response.data.requests);
            setTotal(response.data.total);
        } catch (error: any) {
            console.error('Error loading payment requests:', error);
            toast.error('Error al cargar solicitudes de pago');
        } finally {
            setLoading(false);
        }
    };

    const handleApprovePayment = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const reason = formData.get('reason') as string;

        if (!selectedItem) return;

        try {
            await adminFinanceService.approvePayment(selectedItem.id, reason);
            toast.success('Pago aprobado exitosamente');
            setShowApproveModal(false);
            setSelectedItem(null);
            fetchPaymentRequests();
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Error al aprobar pago');
        }
    };

    const handleRefund = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const reason = formData.get('reason') as string;
        const amount = formData.get('amount') ? parseFloat(formData.get('amount') as string) : undefined;

        if (!selectedItem) return;

        try {
            await adminFinanceService.refundTransaction(selectedItem.id, { reason, amount });
            toast.success('Reembolso procesado exitosamente');
            setShowRefundModal(false);
            setSelectedItem(null);
            fetchTransactions();
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Error al procesar reembolso');
        }
    };

    const getStatusBadge = (status: string) => {
        const config: Record<string, { bg: string; text: string }> = {
            PENDING: { bg: 'bg-yellow-100', text: 'text-yellow-800' },
            PROCESSING: { bg: 'bg-blue-100', text: 'text-blue-800' },
            COMPLETED: { bg: 'bg-green-100', text: 'text-green-800' },
            FAILED: { bg: 'bg-red-100', text: 'text-red-800' },
            APPROVED: { bg: 'bg-green-100', text: 'text-green-800' },
            REJECTED: { bg: 'bg-red-100', text: 'text-red-800' },
        };

        const c = config[status] || { bg: 'bg-gray-100', text: 'text-gray-800' };
        return (
            <span className={`px-2 py-1 text-xs font-bold rounded-full ${c.bg} ${c.text}`}>
                {status}
            </span>
        );
    };

    return (
        <AdminLayout>
            <div>
                {/* Header */}
                <div className="mb-6">
                    <h1 className="text-3xl font-bold text-gray-900">Gestión Financiera</h1>
                    <p className="text-gray-600 mt-1">Administra transacciones, pagos y cuentas de la plataforma</p>
                </div>

                {/* Tabs */}
                <div className="bg-white rounded-lg shadow mb-6">
                    <div className="border-b border-gray-200">
                        <nav className="flex -mb-px">
                            {[
                                { id: 'dashboard', label: 'Dashboard', icon: 'dashboard' },
                                { id: 'transactions', label: 'Transacciones', icon: 'account_balance' },
                                { id: 'payments', label: 'Solicitudes de Pago', icon: 'payments' },
                            ].map((tab) => (
                                <button
                                    key={tab.id}
                                    onClick={() => {
                                        setActiveTab(tab.id as any);
                                        setPage(1);
                                    }}
                                    className={`px-6 py-3 border-b-2 font-medium text-sm flex items-center gap-2 ${activeTab === tab.id
                                            ? 'border-primary text-primary'
                                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                        }`}
                                >
                                    <span className="material-symbols-outlined text-lg">{tab.icon}</span>
                                    {tab.label}
                                </button>
                            ))}
                        </nav>
                    </div>
                </div>

                {/* Dashboard Tab */}
                {activeTab === 'dashboard' && (
                    <div>
                        {loading ? (
                            <div className="bg-white rounded-lg shadow p-8 text-center">
                                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                                <p className="text-gray-600 mt-4">Cargando métricas...</p>
                            </div>
                        ) : dashboard ? (
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="bg-white rounded-lg shadow p-6">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm text-gray-600">Balance Plataforma</p>
                                            <p className="text-2xl font-bold text-gray-900 mt-1">
                                                ${dashboard.platformBalance.toLocaleString()}
                                            </p>
                                        </div>
                                        <div className="bg-blue-100 p-3 rounded-lg">
                                            <span className="material-symbols-outlined text-blue-600 text-2xl">account_balance</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-white rounded-lg shadow p-6">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm text-gray-600">Transacciones Pendientes</p>
                                            <p className="text-2xl font-bold text-gray-900 mt-1">{dashboard.pendingTransactions}</p>
                                        </div>
                                        <div className="bg-yellow-100 p-3 rounded-lg">
                                            <span className="material-symbols-outlined text-yellow-600 text-2xl">pending</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-white rounded-lg shadow p-6">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm text-gray-600">Ingresos Este Mes</p>
                                            <p className="text-2xl font-bold text-green-600 mt-1">
                                                ${dashboard.thisMonthRevenue.toLocaleString()}
                                            </p>
                                        </div>
                                        <div className="bg-green-100 p-3 rounded-lg">
                                            <span className="material-symbols-outlined text-green-600 text-2xl">trending_up</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-white rounded-lg shadow p-6">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm text-gray-600">Pagos Pendientes</p>
                                            <p className="text-2xl font-bold text-gray-900 mt-1">{dashboard.pendingPaymentRequests}</p>
                                        </div>
                                        <div className="bg-purple-100 p-3 rounded-lg">
                                            <span className="material-symbols-outlined text-purple-600 text-2xl">payments</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-white rounded-lg shadow p-6">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm text-gray-600">Transacciones Fallidas (7d)</p>
                                            <p className="text-2xl font-bold text-red-600 mt-1">{dashboard.failedTransactions}</p>
                                        </div>
                                        <div className="bg-red-100 p-3 rounded-lg">
                                            <span className="material-symbols-outlined text-red-600 text-2xl">error</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-white rounded-lg shadow p-6">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm text-gray-600">Pagos Disputados</p>
                                            <p className="text-2xl font-bold text-gray-900 mt-1">{dashboard.disputedPayments}</p>
                                        </div>
                                        <div className="bg-orange-100 p-3 rounded-lg">
                                            <span className="material-symbols-outlined text-orange-600 text-2xl">warning</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ) : null}
                    </div>
                )}

                {/* Transactions Tab */}
                {activeTab === 'transactions' && (
                    <div>
                        {/* Filters */}
                        <div className="bg-white rounded-lg shadow p-4 mb-6">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Tipo</label>
                                    <select
                                        value={typeFilter}
                                        onChange={(e) => setTypeFilter(e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                                    >
                                        <option value="all">Todos</option>
                                        <option value="DEPOSIT">Depósito</option>
                                        <option value="WITHDRAWAL">Retiro</option>
                                        <option value="PAYMENT">Pago</option>
                                        <option value="REFUND">Reembolso</option>
                                        <option value="FEE">Comisión</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Estado</label>
                                    <select
                                        value={statusFilter}
                                        onChange={(e) => setStatusFilter(e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                                    >
                                        <option value="all">Todos</option>
                                        <option value="PENDING">Pendiente</option>
                                        <option value="PROCESSING">Procesando</option>
                                        <option value="COMPLETED">Completado</option>
                                        <option value="FAILED">Fallido</option>
                                    </select>
                                </div>

                                <div className="flex items-end justify-end">
                                    <div className="text-right">
                                        <p className="text-sm text-gray-600">Total</p>
                                        <p className="text-2xl font-bold text-gray-900">{total}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Table */}
                        {loading ? (
                            <div className="bg-white rounded-lg shadow p-8 text-center">
                                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                            </div>
                        ) : transactions.length === 0 ? (
                            <div className="bg-white rounded-lg shadow p-8 text-center">
                                <p className="text-gray-600">No se encontraron transacciones</p>
                            </div>
                        ) : (
                            <div className="bg-white rounded-lg shadow overflow-hidden">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tipo</th>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Desde</th>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Hacia</th>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Monto</th>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estado</th>
                                            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Acciones</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200">
                                        {transactions.map((tx) => (
                                            <tr key={tx.id} className="hover:bg-gray-50">
                                                <td className="px-4 py-4">
                                                    <p className="text-xs font-mono text-gray-600">{tx.id.slice(0, 8)}...</p>
                                                </td>
                                                <td className="px-4 py-4">
                                                    <span className="text-sm font-bold text-gray-900">{tx.type}</span>
                                                </td>
                                                <td className="px-4 py-4">
                                                    {tx.fromAccount ? (
                                                        <p className="text-sm text-gray-900">{tx.fromAccount.client.user.email}</p>
                                                    ) : (
                                                        <span className="text-xs text-gray-400">—</span>
                                                    )}
                                                </td>
                                                <td className="px-4 py-4">
                                                    {tx.toAccount ? (
                                                        <p className="text-sm text-gray-900">{tx.toAccount.vendor.user.email}</p>
                                                    ) : (
                                                        <span className="text-xs text-gray-400">—</span>
                                                    )}
                                                </td>
                                                <td className="px-4 py-4">
                                                    <p className="text-sm font-bold text-gray-900">${tx.amount.toLocaleString()}</p>
                                                </td>
                                                <td className="px-4 py-4">{getStatusBadge(tx.status)}</td>
                                                <td className="px-4 py-4 text-right">
                                                    {tx.status === 'COMPLETED' && (
                                                        <button
                                                            onClick={() => {
                                                                setSelectedItem(tx);
                                                                setShowRefundModal(true);
                                                            }}
                                                            className="text-red-600 hover:text-red-800 text-sm font-bold"
                                                        >
                                                            Reembolsar
                                                        </button>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>

                                {/* Pagination */}
                                <div className="bg-gray-50 px-4 py-3 flex items-center justify-between border-t">
                                    <button
                                        onClick={() => setPage(p => Math.max(1, p - 1))}
                                        disabled={page === 1}
                                        className="px-4 py-2 border rounded-lg disabled:opacity-50 hover:bg-gray-100"
                                    >
                                        Anterior
                                    </button>
                                    <button
                                        onClick={() => setPage(p => p + 1)}
                                        disabled={page * limit >= total}
                                        className="px-4 py-2 border rounded-lg disabled:opacity-50 hover:bg-gray-100"
                                    >
                                        Siguiente
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* Payment Requests Tab */}
                {activeTab === 'payments' && (
                    <div>
                        {/* Filters */}
                        <div className="bg-white rounded-lg shadow p-4 mb-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Estado</label>
                                    <select
                                        value={statusFilter}
                                        onChange={(e) => setStatusFilter(e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                                    >
                                        <option value="all">Todos</option>
                                        <option value="PENDING">Pendiente</option>
                                        <option value="APPROVED">Aprobado</option>
                                        <option value="REJECTED">Rechazado</option>
                                        <option value="COMPLETED">Completado</option>
                                    </select>
                                </div>

                                <div className="flex items-end justify-end">
                                    <div className="text-right">
                                        <p className="text-sm text-gray-600">Total</p>
                                        <p className="text-2xl font-bold text-gray-900">{total}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Table */}
                        {loading ? (
                            <div className="bg-white rounded-lg shadow p-8 text-center">
                                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                            </div>
                        ) : paymentRequests.length === 0 ? (
                            <div className="bg-white rounded-lg shadow p-8 text-center">
                                <p className="text-gray-600">No se encontraron solicitudes de pago</p>
                            </div>
                        ) : (
                            <div className="bg-white rounded-lg shadow overflow-hidden">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Proyecto</th>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Milestone</th>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Vendor</th>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Monto</th>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estado</th>
                                            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Acciones</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200">
                                        {paymentRequests.map((pr) => (
                                            <tr key={pr.id} className="hover:bg-gray-50">
                                                <td className="px-4 py-4">
                                                    <p className="text-sm font-bold text-gray-900">{pr.milestone.project.title}</p>
                                                    <p className="text-xs text-gray-500">{pr.milestone.project.client.user.email}</p>
                                                </td>
                                                <td className="px-4 py-4">
                                                    <p className="text-sm text-gray-900">{pr.milestone.title}</p>
                                                </td>
                                                <td className="px-4 py-4">
                                                    {pr.milestone.project.vendor ? (
                                                        <p className="text-sm text-gray-900">{pr.milestone.project.vendor.user.email}</p>
                                                    ) : (
                                                        <span className="text-xs text-gray-400">Sin vendor</span>
                                                    )}
                                                </td>
                                                <td className="px-4 py-4">
                                                    <p className="text-sm font-bold text-gray-900">${pr.amount.toLocaleString()}</p>
                                                </td>
                                                <td className="px-4 py-4">{getStatusBadge(pr.status)}</td>
                                                <td className="px-4 py-4 text-right">
                                                    {pr.status === 'PENDING' && (
                                                        <button
                                                            onClick={() => {
                                                                setSelectedItem(pr);
                                                                setShowApproveModal(true);
                                                            }}
                                                            className="text-green-600 hover:text-green-800 text-sm font-bold"
                                                        >
                                                            Aprobar
                                                        </button>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>

                                {/* Pagination */}
                                <div className="bg-gray-50 px-4 py-3 flex items-center justify-between border-t">
                                    <button
                                        onClick={() => setPage(p => Math.max(1, p - 1))}
                                        disabled={page === 1}
                                        className="px-4 py-2 border rounded-lg disabled:opacity-50 hover:bg-gray-100"
                                    >
                                        Anterior
                                    </button>
                                    <button
                                        onClick={() => setPage(p => p + 1)}
                                        disabled={page * limit >= total}
                                        className="px-4 py-2 border rounded-lg disabled:opacity-50 hover:bg-gray-100"
                                    >
                                        Siguiente
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* Approve Payment Modal */}
                {showApproveModal && selectedItem && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-lg max-w-md w-full p-6">
                            <h3 className="text-lg font-bold text-green-600 mb-4">✓ Aprobar Pago</h3>
                            <p className="text-sm text-gray-600 mb-4">
                                Monto: <span className="font-bold">${selectedItem.amount.toLocaleString()}</span>
                            </p>

                            <form onSubmit={handleApprovePayment} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Razón *</label>
                                    <textarea
                                        name="reason"
                                        required
                                        rows={3}
                                        placeholder="Explica por qué apruebas este pago..."
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                                    />
                                </div>

                                <div className="flex gap-3">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setShowApproveModal(false);
                                            setSelectedItem(null);
                                        }}
                                        className="flex-1 px-4 py-2 border rounded-lg hover:bg-gray-50"
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        type="submit"
                                        className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                                    >
                                        Aprobar Pago
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* Refund Modal */}
                {showRefundModal && selectedItem && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-lg max-w-md w-full p-6">
                            <h3 className="text-lg font-bold text-red-600 mb-4">Procesar Reembolso</h3>

                            <form onSubmit={handleRefund} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Monto (Opcional)
                                    </label>
                                    <input
                                        type="number"
                                        name="amount"
                                        step="0.01"
                                        placeholder={`Máx: $${selectedItem.amount}`}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                                    />
                                    <p className="text-xs text-gray-500 mt-1">
                                        Dejar vacío para reembolso completo
                                    </p>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Razón *</label>
                                    <textarea
                                        name="reason"
                                        required
                                        rows={3}
                                        placeholder="Explica la razón del reembolso..."
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                                    />
                                </div>

                                <div className="flex gap-3">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setShowRefundModal(false);
                                            setSelectedItem(null);
                                        }}
                                        className="flex-1 px-4 py-2 border rounded-lg hover:bg-gray-50"
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        type="submit"
                                        className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                                    >
                                        Procesar Reembolso
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </AdminLayout>
    );
};

export default AdminFinance;
