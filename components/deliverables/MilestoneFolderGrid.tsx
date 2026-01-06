import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { useToast } from '../../contexts/ToastContext';
import CreateProtectedFolderModal from './CreateProtectedFolderModal';
import EditProtectedFolderModal from './EditProtectedFolderModal';
import ConfirmDeleteModal from './ConfirmDeleteModal';

interface MilestoneFolderGridProps {
    milestones: any[];
    projectId: string;
    isVendor: boolean;
    onSelectFolder: (folder: any, milestone: any) => void;
}

const MilestoneFolderGrid: React.FC<MilestoneFolderGridProps> = ({
    milestones,
    projectId,
    isVendor,
    onSelectFolder
}) => {
    const { showToast } = useToast();
    const [folders, setFolders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    // Modals state
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [editingFolder, setEditingFolder] = useState<any>(null);
    const [deleteTarget, setDeleteTarget] = useState<{ id: string, name: string } | null>(null);

    const fetchFolders = async () => {
        try {
            setLoading(true);
            const res = await api.get(`/protected-folders?projectId=${projectId}`);
            if (res.data && Array.isArray(res.data.folders)) {
                setFolders(res.data.folders);
            } else {
                setFolders([]);
            }
        } catch (error) {
            console.error('Error fetching protected folders:', error);
            showToast('Error al cargar carpetas', 'error');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (projectId) {
            fetchFolders();
        }
    }, [projectId]);

    const handleCreateFolder = async (milestoneId: string, name: string) => {
        try {
            await api.post('/protected-folders', {
                milestoneId,
                name,
                projectId
            });
            showToast('Carpeta creada exitosamente', 'success');
            fetchFolders();
        } catch (error: any) {
            console.error('Error creating folder:', error);
            showToast(error.response?.data?.message || 'Error al crear carpeta', 'error');
        }
    };

    const handleUpdateFolder = async (folderId: string, name: string) => {
        try {
            await api.patch(`/protected-folders/${folderId}`, { name });
            showToast('Carpeta actualizada correctamente', 'success');
            fetchFolders();
        } catch (error: any) {
            console.error('Error updating folder:', error);
            showToast('Error al actualizar carpeta', 'error');
        }
    };

    const handleDeleteClick = (folderId: string, folderName: string) => {
        setDeleteTarget({ id: folderId, name: folderName });
    };

    const handleConfirmDelete = async () => {
        if (!deleteTarget) return;

        try {
            await api.delete(`/protected-folders/${deleteTarget.id}`);
            showToast('Carpeta eliminada', 'success');
            fetchFolders();
            setDeleteTarget(null);
        } catch (error: any) {
            console.error('Error deleting folder:', error);
            showToast('Error al eliminar carpeta', 'error');
        }
    };

    const getStatusColor = (status: string) => {
        if (status === 'UNLOCKED') {
            return 'border-green-200 bg-green-50 hover:bg-green-100 hover:border-green-300';
        }
        return 'border-amber-200 bg-amber-50 hover:bg-amber-100 hover:border-amber-300';
    };

    const formatBytes = (bytes: number) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    if (loading && folders.length === 0) {
        return (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 animate-pulse">
                {[...Array(4)].map((_, i) => (
                    <div key={i} className="h-32 bg-gray-100 rounded-xl"></div>
                ))}
            </div>
        );
    }

    // Sort folders by milestone order if possible, or just render them
    // We need to map folders to milestones to get order if needed, but the folder object might have milestone info if we included it in backend.
    // If not, we can map using the `milestones` prop.

    // Let's create a combined view
    const sortedFolders = [...folders].sort((a, b) => {
        // Sort by milestone order then by name
        const mA = milestones.find(m => m.id === a.milestoneId);
        const mB = milestones.find(m => m.id === b.milestoneId);
        if (mA && mB && mA.order !== mB.order) return mA.order - mB.order;
        return a.name.localeCompare(b.name);
    });

    return (
        <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm">
            {/* Header with Title and Add Button */}
            <div className="flex justify-between items-center mb-6">
                <h3 className="font-bold text-gray-900 flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary">folder_special</span>
                    Carpetas Protegidas
                    <span className="text-xs font-normal text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                        {folders.length}
                    </span>
                </h3>

                {isVendor && (
                    <button
                        onClick={() => setShowCreateModal(true)}
                        className="w-8 h-8 flex items-center justify-center bg-primary text-white rounded-full hover:bg-primary/90 transition-all shadow-md hover:shadow-lg hover:scale-105"
                        title="Nueva Carpeta Protegida"
                    >
                        <span className="material-symbols-outlined text-xl font-bold">add</span>
                    </button>
                )}
            </div>

            {/* Combined Grid */}
            {sortedFolders.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {sortedFolders.map(folder => {
                        const milestone = milestones.find(m => m.id === folder.milestoneId);
                        const isUnlocked = folder.status === 'UNLOCKED';

                        return (
                            <div
                                key={folder.id}
                                className={`
                                    relative group rounded-xl border p-4 transition-all
                                    ${getStatusColor(folder.status)}
                                    ${isUnlocked || isVendor ? 'cursor-pointer hover:shadow-md hover:-translate-y-1' : 'opacity-75 cursor-not-allowed'}
                                `}
                                onClick={() => {
                                    if (isUnlocked || isVendor) {
                                        onSelectFolder(folder, milestone);
                                    }
                                }}
                            >
                                {/* Lock Badge */}
                                <div className={`absolute -top-2 -right-2 ${isUnlocked ? 'bg-green-500' : 'bg-amber-500'} text-white rounded-full p-1 shadow-md z-10`}>
                                    <span className="material-symbols-outlined text-sm block">
                                        {isUnlocked ? 'lock_open' : 'lock'}
                                    </span>
                                </div>

                                {/* Vendor Actions - Moved to bottom to avoid overlap */}
                                {isVendor && (
                                    <div className="absolute bottom-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1 z-20">
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setEditingFolder(folder);
                                            }}
                                            className="p-1.5 bg-white rounded-full hover:bg-gray-100 text-gray-600 border border-gray-200 shadow-sm"
                                            title="Editar nombre"
                                        >
                                            <span className="material-symbols-outlined text-sm block">edit</span>
                                        </button>
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleDeleteClick(folder.id, folder.name);
                                            }}
                                            className="p-1.5 bg-white rounded-full hover:bg-red-50 text-red-500 border border-gray-200 shadow-sm"
                                            title="Eliminar carpeta"
                                        >
                                            <span className="material-symbols-outlined text-sm block">delete</span>
                                        </button>
                                    </div>
                                )}

                                <div className="flex items-center justify-between mb-3">
                                    <span className={`material-symbols-outlined text-4xl ${isUnlocked ? 'text-green-600' : 'text-amber-600'}`}>
                                        folder
                                    </span>
                                    {milestone && (
                                        <span className="text-xs font-bold text-gray-500 uppercase tracking-wide">
                                            Hito {milestone.order}
                                        </span>
                                    )}
                                </div>

                                <h4 className="font-bold text-gray-900 text-sm mb-1 truncate" title={folder.name}>
                                    {folder.name}
                                </h4>

                                <div className="flex items-center text-xs text-gray-500 mt-2">
                                    <span>{folder.fileCount || 0} archivos</span>
                                </div>

                                {/* Download Button - Minimalist */}
                                {(isUnlocked || isVendor) && (
                                    <button
                                        onClick={async (e) => {
                                            e.stopPropagation();
                                            try {
                                                const res = await api.get(
                                                    `/deliverables/milestones/${folder.milestoneId}/download-all?folderId=${folder.id}`,
                                                    { responseType: 'blob' }
                                                );
                                                const url = window.URL.createObjectURL(new Blob([res.data]));
                                                const link = document.createElement('a');
                                                link.href = url;
                                                link.setAttribute('download', `${folder.name}.zip`);
                                                document.body.appendChild(link);
                                                link.click();
                                                link.remove();
                                            } catch (error) {
                                                console.error('Download error:', error);
                                                showToast('Error al descargar carpetas', 'error');
                                            }
                                        }}
                                        className="absolute bottom-3 right-3 p-2 bg-gray-50 text-gray-500 rounded-full hover:bg-primary hover:text-white transition-colors opacity-0 group-hover:opacity-100 shadow-sm"
                                        title="Descargar ZIP"
                                    >
                                        <span className="material-symbols-outlined text-lg block">download</span>
                                    </button>
                                )}
                            </div>
                        );
                    })}
                </div>
            ) : (
                <div className="text-center py-12 border-2 border-dashed border-gray-200 rounded-xl bg-gray-50">
                    <span className="material-symbols-outlined text-4xl text-gray-300 block mb-3">folder_open</span>
                    <p className="text-gray-500 text-sm">No hay carpetas protegidas creadas.</p>
                    {isVendor && (
                        <p className="text-xs text-gray-400 mt-1">Usa el botón + para crear una nueva carpeta asociada a un hito.</p>
                    )}
                </div>
            )
            }

            {/* Modals */}
            {
                showCreateModal && (
                    <CreateProtectedFolderModal
                        milestones={milestones}
                        onClose={() => setShowCreateModal(false)}
                        onCreate={handleCreateFolder}
                    />
                )
            }

            {
                editingFolder && (
                    <EditProtectedFolderModal
                        isOpen={!!editingFolder}
                        folderId={editingFolder.id}
                        currentName={editingFolder.name}
                        onClose={() => setEditingFolder(null)}
                        onUpdate={handleUpdateFolder}
                    />
                )
            }

            {
                deleteTarget && (
                    <ConfirmDeleteModal
                        title="Eliminar Carpeta Protegida"
                        message={`¿Estás seguro de que deseas eliminar la carpeta "${deleteTarget.name}"? Esta acción eliminará permanentemente la carpeta y todos los archivos que contiene. No se puede deshacer.`}
                        onConfirm={handleConfirmDelete}
                        onCancel={() => setDeleteTarget(null)}
                    />
                )
            }
        </div >
    );
};

export default MilestoneFolderGrid;
