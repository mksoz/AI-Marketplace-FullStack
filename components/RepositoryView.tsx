import React, { useState, useEffect } from 'react';
import api from '../services/api';

interface RepositoryViewProps {
    projectId: string;
    isVendor: boolean;
}

interface Repository {
    url: string;
    owner: string;
    name: string;
    branch: string;
    stars: number;
    forks: number;
    language: string | null;
    openIssues: number;
    lastSyncAt: string | null;
    status: string;
}

interface Commit {
    id: string;
    sha: string;
    message: string;
    author: string;
    authorAvatar: string | null;
    committedAt: string;
    additions: number;
    deletions: number;
    changedFiles: number;
}

const RepositoryView: React.FC<RepositoryViewProps> = ({ projectId, isVendor }) => {
    const [loading, setLoading] = useState(true);
    const [synced, setSynced] = useState(false);
    const [repository, setRepository] = useState<Repository | null>(null);
    const [commits, setCommits] = useState<Commit[]>([]);
    const [showSyncModal, setShowSyncModal] = useState(false);
    const [repoUrl, setRepoUrl] = useState('');
    const [syncing, setSyncing] = useState(false);
    const [refreshing, setRefreshing] = useState(false);

    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const commitsPerPage = 10;

    useEffect(() => {
        fetchRepositoryInfo();
    }, [projectId]);

    const fetchRepositoryInfo = async () => {
        try {
            setLoading(true);
            const res = await api.get(`/projects/${projectId}/github`);

            if (res.data.synced) {
                setSynced(true);
                setRepository(res.data.repository);
                setCommits(res.data.commits);
                setCurrentPage(1); // Reset to first page on fetch
            } else {
                setSynced(false);
            }
        } catch (error) {
            console.error('Error fetching repository:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSync = async () => {
        try {
            setSyncing(true);
            await api.post(`/projects/${projectId}/github/sync`, { repoUrl });
            setShowSyncModal(false);
            setRepoUrl('');
            fetchRepositoryInfo();
        } catch (error: any) {
            alert(error.response?.data?.message || 'Error al sincronizar repositorio');
        } finally {
            setSyncing(false);
        }
    };

    const handleRefresh = async () => {
        try {
            setRefreshing(true);
            await api.post(`/projects/${projectId}/github/refresh`);
            fetchRepositoryInfo();
        } catch (error: any) {
            alert(error.response?.data?.message || 'Error al actualizar commits');
        } finally {
            setRefreshing(false);
            setCurrentPage(1); // Reset to first page after refresh
        }
    };

    const handleUnlink = async () => {
        if (!confirm('¿Seguro que deseas desvincular el repositorio?')) return;

        try {
            await api.delete(`/projects/${projectId}/github`);
            setSynced(false);
            setRepository(null);
            setCommits([]);
        } catch (error: any) {
            alert(error.response?.data?.message || 'Error al desvincular repositorio');
        }
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

        if (diffDays === 0) return 'Hoy';
        if (diffDays === 1) return 'Ayer';
        if (diffDays < 7) return `Hace ${diffDays} días`;
        return date.toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' });
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-20">
                <span className="material-symbols-outlined text-gray-300 text-5xl animate-spin">sync</span>
            </div>
        );
    }

    // Not synced - Show empty state
    if (!synced) {
        return (
            <>
                <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center">
                    <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <span className="material-symbols-outlined text-4xl text-gray-400">integration_instructions</span>
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">No hay repositorio vinculado</h3>
                    <p className="text-gray-500 mb-6 max-w-md mx-auto">
                        {isVendor
                            ? 'Sincroniza el repositorio GitHub de este proyecto para que el cliente pueda ver los commits y el progreso del desarrollo.'
                            : 'El vendor aún no ha vinculado un repositorio GitHub a este proyecto.'
                        }
                    </p>
                    {isVendor && (
                        <button
                            onClick={() => setShowSyncModal(true)}
                            className="px-6 py-3 bg-gray-900 text-white font-bold rounded-xl hover:bg-black transition-colors inline-flex items-center gap-2"
                        >
                            <span className="material-symbols-outlined">link</span>
                            Sincronizar Repositorio
                        </button>
                    )}
                </div>

                {/* Sync Modal */}
                {showSyncModal && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setShowSyncModal(false)}>
                        <div className="bg-white rounded-2xl p-8 max-w-lg w-full mx-4" onClick={(e) => e.stopPropagation()}>
                            <h3 className="text-2xl font-bold text-gray-900 mb-4">Sincronizar Repositorio GitHub</h3>
                            <p className="text-gray-600 mb-6">Introduce la URL del repositorio GitHub de este proyecto.</p>

                            <input
                                type="text"
                                value={repoUrl}
                                onChange={(e) => setRepoUrl(e.target.value)}
                                placeholder="https://github.com/usuario/repositorio"
                                className="w-full px-4 py-3 rounded-xl border border-gray-300 mb-4 focus:ring-2 focus:ring-primary outline-none"
                            />

                            <div className="flex gap-3">
                                <button
                                    onClick={() => setShowSyncModal(false)}
                                    className="flex-1 px-4 py-3 border border-gray-300 rounded-xl font-bold hover:bg-gray-50"
                                    disabled={syncing}
                                >
                                    Cancelar
                                </button>
                                <button
                                    onClick={handleSync}
                                    disabled={!repoUrl || syncing}
                                    className="flex-1 px-4 py-3 bg-gray-900 text-white rounded-xl font-bold hover:bg-black disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {syncing ? 'Sincronizando...' : 'Sincronizar'}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </>
        );
    }

    // Synced - Show repository info and commits
    return (
        <div className="space-y-6">
            {/* Repository Header */}
            <div className="bg-white rounded-2xl border border-gray-200 p-6">
                <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-gray-900 rounded-xl flex items-center justify-center">
                            <span className="material-symbols-outlined text-white text-2xl">code</span>
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-gray-900">{repository?.owner}/{repository?.name}</h3>
                            <a
                                href={repository?.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-sm text-primary hover:underline inline-flex items-center gap-1"
                            >
                                Ver en GitHub
                                <span className="material-symbols-outlined text-sm">open_in_new</span>
                            </a>
                        </div>
                    </div>

                    <div className="flex gap-2">
                        <button
                            onClick={handleRefresh}
                            disabled={refreshing}
                            className="p-2 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
                            title="Actualizar commits"
                        >
                            <span className={`material-symbols-outlined text-gray-600 ${refreshing ? 'animate-spin' : ''}`}>refresh</span>
                        </button>
                        {isVendor && (
                            <button
                                onClick={handleUnlink}
                                className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                                title="Desvincular repositorio"
                            >
                                <span className="material-symbols-outlined text-red-600">link_off</span>
                            </button>
                        )}
                    </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                        <span className="material-symbols-outlined text-yellow-500">star</span>
                        <span>{repository?.stars} stars</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                        <span className="material-symbols-outlined text-gray-500">fork_right</span>
                        <span>{repository?.forks} forks</span>
                    </div>
                    {repository?.language && (
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                            <span className="w-3 h-3 rounded-full bg-blue-500"></span>
                            <span>{repository.language}</span>
                        </div>
                    )}
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                        <span className="material-symbols-outlined text-gray-500">schedule</span>
                        <span>Sincronizado {repository?.lastSyncAt ? formatDate(repository.lastSyncAt) : 'nunca'}</span>
                    </div>
                </div>
            </div>

            {/* Commits Timeline */}
            <div className="bg-white rounded-2xl border border-gray-200 p-6">
                <h4 className="font-bold text-gray-900 mb-6 flex items-center gap-2">
                    <span className="material-symbols-outlined">commit</span>
                    Historial de Commits ({commits.length})
                </h4>

                {commits.length === 0 ? (
                    <div className="text-center py-12 text-gray-500">
                        <span className="material-symbols-outlined text-5xl text-gray-300 block mb-3">history</span>
                        <p>No hay commits disponibles</p>
                    </div>
                ) : (
                    <>
                        <div className="space-y-4">
                            {commits
                                .slice((currentPage - 1) * commitsPerPage, currentPage * commitsPerPage)
                                .map((commit) => (
                                    <div key={commit.id} className="flex gap-4 pb-4 border-b border-gray-100 last:border-0">
                                        <img
                                            src={commit.authorAvatar || `https://ui-avatars.com/api/?name=${commit.author}&background=random`}
                                            alt={commit.author}
                                            className="w-10 h-10 rounded-full"
                                        />
                                        <div className="flex-1">
                                            <p className="font-medium text-gray-900 mb-1">{commit.message}</p>
                                            <div className="flex items-center gap-4 text-xs text-gray-500">
                                                <span className="font-medium">{commit.author}</span>
                                                <span>{formatDate(commit.committedAt)}</span>
                                                <span className="inline-flex items-center gap-1">
                                                    <span className="material-symbols-outlined text-xs">code</span>
                                                    {commit.changedFiles} archivos
                                                </span>
                                                <span className="text-green-600">+{commit.additions}</span>
                                                <span className="text-red-600">-{commit.deletions}</span>
                                            </div>
                                        </div>
                                        <a
                                            href={`${repository?.url}/commit/${commit.sha}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-gray-400 hover:text-primary transition-colors"
                                            title="Ver commit en GitHub"
                                        >
                                            <span className="material-symbols-outlined">open_in_new</span>
                                        </a>
                                    </div>
                                ))}
                        </div>

                        {/* Pagination Controls */}
                        {commits.length > commitsPerPage && (
                            <div className="mt-6 flex items-center justify-between pt-4 border-t border-gray-100">
                                <div className="text-sm text-gray-500">
                                    Mostrando {((currentPage - 1) * commitsPerPage) + 1} - {Math.min(currentPage * commitsPerPage, commits.length)} de {commits.length} commits
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                                        disabled={currentPage === 1}
                                        className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-bold hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                    >
                                        Anterior
                                    </button>
                                    <div className="flex items-center gap-1">
                                        {Array.from({ length: Math.ceil(commits.length / commitsPerPage) }, (_, i) => i + 1).map(page => (
                                            <button
                                                key={page}
                                                onClick={() => setCurrentPage(page)}
                                                className={`w-10 h-10 rounded-lg text-sm font-bold transition-colors ${currentPage === page
                                                        ? 'bg-primary text-white'
                                                        : 'border border-gray-300 hover:bg-gray-50'
                                                    }`}
                                            >
                                                {page}
                                            </button>
                                        ))}
                                    </div>
                                    <button
                                        onClick={() => setCurrentPage(prev => Math.min(Math.ceil(commits.length / commitsPerPage), prev + 1))}
                                        disabled={currentPage === Math.ceil(commits.length / commitsPerPage)}
                                        className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-bold hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                    >
                                        Siguiente
                                    </button>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

export default RepositoryView;
