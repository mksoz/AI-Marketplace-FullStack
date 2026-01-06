import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { useToast } from '../../contexts/ToastContext';
import ConfirmDeleteModal from './ConfirmDeleteModal';
import FolderTree from './FolderTree';

interface DeliverableFolderCardProps {
    milestoneId: string;
    milestoneTitle: string;
    projectId: string;
    isVendor: boolean;
    folderId?: string; // New prop for specific folder
}

const DeliverableFolderCard: React.FC<DeliverableFolderCardProps> = ({
    milestoneId,
    milestoneTitle,
    projectId,
    isVendor,
    folderId
}) => {
    const { showToast } = useToast();
    const [folder, setFolder] = useState<any>(null);
    const [fullAccess, setFullAccess] = useState(false);
    const [loading, setLoading] = useState(true);
    const [uploadQueue, setUploadQueue] = useState<Array<{
        id: string;
        file: File;
        progress: number;
        status: 'pending' | 'uploading' | 'success' | 'error';
        error?: string;
    }>>([]);
    const [isDragging, setIsDragging] = useState(false);
    const [deleteTarget, setDeleteTarget] = useState<{ id: string, name: string } | null>(null);
    const [currentSubfolderId, setCurrentSubfolderId] = useState<string | null>(null);

    // Derived uploading state
    const isUploading = uploadQueue.some(item => item.status === 'uploading' || item.status === 'pending');

    useEffect(() => {
        fetchDeliverables();
    }, [milestoneId, folderId]);

    const fetchDeliverables = async () => {
        try {
            setLoading(true);
            const query = folderId ? `?folderId=${folderId}` : '';
            const res = await api.get(`/deliverables/milestones/${milestoneId}/deliverables${query}`);
            setFolder(res.data.folder);
            setFullAccess(res.data.fullAccess);
        } catch (error: any) {
            console.error('Error fetching deliverables:', error);
            showToast('Error al cargar entregables', 'error');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (uploadQueue.some(item => item.status === 'pending')) {
            processUploadQueue();
        }
    }, [uploadQueue]);

    const processUploadQueue = async () => {
        const pendingItem = uploadQueue.find(item => item.status === 'pending');
        if (!pendingItem) return;

        // Mark as uploading
        setUploadQueue(prev => prev.map(item =>
            item.id === pendingItem.id ? { ...item, status: 'uploading' } : item
        ));

        const formData = new FormData();
        formData.append('file', pendingItem.file);
        formData.append('milestoneId', milestoneId);
        formData.append('projectId', projectId);
        if (currentSubfolderId) {
            formData.append('subfolderId', currentSubfolderId);
        }
        if (folderId) {
            formData.append('folderId', folderId);
        }

        try {
            await api.post(`/deliverables/milestones/${milestoneId}/deliverables`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
                onUploadProgress: (progressEvent) => {
                    const percentCompleted = Math.round((progressEvent.loaded * 100) / (progressEvent.total || 1));
                    setUploadQueue(prev => prev.map(item =>
                        item.id === pendingItem.id ? { ...item, progress: percentCompleted } : item
                    ));
                }
            });

            setUploadQueue(prev => prev.map(item =>
                item.id === pendingItem.id ? { ...item, status: 'success', progress: 100 } : item
            ));

            // Refresh list if this was the last one or just periodically 
            // Better to refresh once generic success or debounced, but here doing it per file is safer for sync
            fetchDeliverables();
            showToast(`Archivo subido: ${pendingItem.file.name}`, 'success');

        } catch (error: any) {
            console.error('Upload error:', error);
            setUploadQueue(prev => prev.map(item =>
                item.id === pendingItem.id ? { ...item, status: 'error', error: error.message || 'Error' } : item
            ));
            showToast(`Error al subir ${pendingItem.file.name}`, 'error');
        }

        // Remove success items after a delay to clean up UI? Or keep them?
        // Let's keep them for a moment or until user clears. For now, we'll auto-clear success after 3s
        setTimeout(() => {
            setUploadQueue(prev => prev.filter(item => item.id !== pendingItem.id));
        }, 3000);
    };

    const handleFiles = (files: FileList | null) => {
        if (!files) return;

        const newItems = Array.from(files).map(file => ({
            id: Math.random().toString(36).substring(7),
            file,
            progress: 0,
            status: 'pending' as const
        }));

        // Filter size limit
        const validItems = newItems.filter(item => {
            if (item.file.size > 10 * 1024 * 1024) {
                showToast(`Skip: ${item.file.name} (Max 10MB)`, 'error');
                return false;
            }
            return true;
        });

        setUploadQueue(prev => [...prev, ...validItems]);
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        handleFiles(e.target.files);
        e.target.value = ''; // Reset input
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        handleFiles(e.dataTransfer.files);
    };

    const handleDelete = async (fileId: string) => {
        try {
            await api.delete(`/deliverables/files/${fileId}`);
            showToast('Archivo eliminado', 'success');
            fetchDeliverables();
            setDeleteTarget(null);
        } catch (error) {
            showToast('Error al eliminar archivo', 'error');
        }
    };

    const handleCreateSubfolder = async (name: string, parentId: string | null) => {
        try {
            await api.post(`/deliverables/folders/${folder.id}/subfolders`, { name, parentId });
            showToast('Carpeta creada', 'success');
            fetchDeliverables();
        } catch (error: any) {
            showToast(error.response?.data?.message || 'Error al crear carpeta', 'error');
        }
    };

    const handleRenameSubfolder = async (subfolderId: string, newName: string) => {
        try {
            await api.patch(`/deliverables/subfolders/${subfolderId}`, { name: newName });
            showToast('Carpeta renombrada', 'success');
            fetchDeliverables();
        } catch (error: any) {
            showToast(error.response?.data?.message || 'Error al renombrar carpeta', 'error');
        }
    };

    const handleDeleteSubfolder = async (subfolderId: string) => {
        try {
            await api.delete(`/deliverables/subfolders/${subfolderId}`);
            showToast('Carpeta eliminada', 'success');
            setCurrentSubfolderId(null);
            fetchDeliverables();
        } catch (error: any) {
            showToast(error.response?.data?.message || 'Error al eliminar carpeta', 'error');
        }
    };

    const getStatusBadge = (status: string) => {
        const configs: any = {
            PENDING: { bg: 'bg-gray-100', text: 'text-gray-700', label: 'Pendiente', icon: 'schedule' },
            IN_PROGRESS: { bg: 'bg-blue-100', text: 'text-blue-700', label: 'En Progreso', icon: 'autorenew' },
            READY_FOR_REVIEW: { bg: 'bg-amber-100', text: 'text-amber-700', label: 'Listo', icon: 'check_circle' },
            UNLOCKED: { bg: 'bg-green-100', text: 'text-green-700', label: 'Desbloqueado', icon: 'lock_open' }
        };

        const config = configs[status] || configs.PENDING;

        return (
            <span className={`px-3 py-1 rounded-lg text-xs font-semibold ${config.bg} ${config.text} flex items-center gap-1`}>
                <span className="material-symbols-outlined text-sm">{config.icon}</span>
                {config.label}
            </span>
        );
    };

    const formatBytes = (bytes: number) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
    };

    const formatDate = (date: string) => {
        return new Date(date).toLocaleDateString('es-ES', {
            day: '2-digit',
            month: 'short',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const handleDownload = (downloadUrl: string, filename: string) => {
        const link = document.createElement('a');
        link.href = downloadUrl;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    // Filter files by current subfolder
    const visibleFiles = folder?.files?.filter((file: any) => {
        // If no subfolder selected, show files without subfolder (null)
        if (currentSubfolderId === null) {
            return file.subfolderId === null;
        }
        // Otherwise, show files belonging to current subfolder
        return file.subfolderId === currentSubfolderId;
    }) || [];

    // Build breadcrumb path
    const buildPath = (): Array<{ id: string | null, name: string }> => {
        const path: Array<{ id: string | null, name: string }> = [{ id: null, name: 'Raíz' }];

        if (!currentSubfolderId || !folder?.subfolders) return path;

        const findPathToFolder = (folderId: string, currentPath: Array<any> = []): Array<any> | null => {
            const subfolder = folder.subfolders.find((f: any) => f.id === folderId);
            if (!subfolder) return null;

            const newPath = [...currentPath, subfolder];

            if (subfolder.parentId === null) {
                return newPath;
            }

            return findPathToFolder(subfolder.parentId, newPath);
        };

        const pathFolders = findPathToFolder(currentSubfolderId);
        if (pathFolders) {
            pathFolders.reverse().forEach(f => {
                path.push({ id: f.id, name: f.name });
            });
        }

        return path;
    };

    const currentPath = buildPath();

    if (loading) {
        return (
            <div className="bg-white rounded-xl border border-gray-200">
                <div className="animate-pulse p-6 space-y-4">
                    <div className="h-6 bg-gray-200 rounded w-1/3"></div>
                    <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                </div>
            </div>
        );
    }

    return (
        <>
            <div className="bg-white rounded-xl border border-gray-200">
                {/* Compact Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                    <div className="flex items-center gap-4">
                        <h3 className="text-lg font-bold text-gray-900">{milestoneTitle}</h3>
                        {getStatusBadge(folder.status)}
                    </div>

                    <div className="flex items-center gap-4">
                        {/* Inline Stats */}
                        <div className="flex items-center gap-3 text-sm text-gray-600">
                            <div className="flex items-center gap-1">
                                <span className="material-symbols-outlined text-sm">description</span>
                                <span className="font-semibold">{folder.totalFiles}</span>
                            </div>
                            <div className="text-gray-400">•</div>
                            <div className="font-mono font-semibold">
                                {formatBytes(folder.totalSize)}
                            </div>
                        </div>

                        {!fullAccess && (
                            <div className="flex items-center gap-2 bg-amber-50 text-amber-700 px-3 py-1.5 rounded-lg border border-amber-200">
                                <span className="material-symbols-outlined text-sm">lock</span>
                                <span className="text-xs font-medium">Bloqueado</span>
                            </div>
                        )}

                        {/* Download ZIP Button */}
                        {(fullAccess || isVendor) && (
                            <button
                                onClick={async () => {
                                    try {
                                        const res = await api.get(
                                            `/deliverables/milestones/${milestoneId}/download-all?folderId=${folder.id}`,
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
                                        showToast('Error al descargar ZIP', 'error');
                                    }
                                }}
                                className="p-2 text-gray-500 hover:text-primary hover:bg-primary/10 rounded-lg transition-colors border border-transparent hover:border-primary/20"
                                title="Descargar todo (ZIP)"
                            >
                                <span className="material-symbols-outlined text-xl">download</span>
                            </button>
                        )}
                    </div>
                </div>

                <div className="p-6">
                    {/* Two Column Layout: Folder Tree + Files */}
                    <div className="grid grid-cols-12 gap-6">
                        {/* Folder Tree Sidebar */}
                        <div className="col-span-3">
                            <div className="mb-2 flex items-center justify-between">
                                <h4 className="text-xs font-bold text-gray-500 uppercase">Carpetas</h4>
                                {isVendor && folder.subfolders && (
                                    <span className="text-xs text-gray-400">{folder.subfolders.length}</span>
                                )}
                            </div>
                            <FolderTree
                                subfolders={folder.subfolders || []}
                                currentFolderId={currentSubfolderId}
                                onSelectFolder={setCurrentSubfolderId}
                                onCreateFolder={handleCreateSubfolder}
                                onRenameFolder={handleRenameSubfolder}
                                onDeleteFolder={handleDeleteSubfolder}
                                isVendor={isVendor}
                            />
                        </div>

                        {/* Files Area */}
                        <div className="col-span-9">
                            {/* Breadcrumb Path */}
                            <div className="mb-4 px-3 py-2 bg-gray-50 rounded-lg border border-gray-200">
                                <div className="flex items-center gap-1 text-sm flex-wrap">
                                    {currentPath.map((pathItem, index) => (
                                        <div key={pathItem.id || 'root'} className="flex items-center gap-1">
                                            <button
                                                onClick={() => setCurrentSubfolderId(pathItem.id)}
                                                className={`px-2 py-1 rounded transition-colors ${index === currentPath.length - 1
                                                    ? 'font-semibold text-primary bg-primary/10'
                                                    : 'text-gray-600 hover:text-primary hover:bg-gray-100'
                                                    }`}
                                            >
                                                {pathItem.name}
                                            </button>
                                            {index < currentPath.length - 1 && (
                                                <span className="material-symbols-outlined text-gray-400 text-sm">chevron_right</span>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Upload Zone (Vendor only) - Compact */}
                            {/* Upload Zone - Available to Vendor and Client */}
                            {/* Upload Zone - Available to Vendor and Client */}
                            <div className="mb-4">
                                <div
                                    onDragOver={handleDragOver}
                                    onDragLeave={handleDragLeave}
                                    onDrop={handleDrop}
                                    className={`relative flex flex-col items-center justify-center w-full min-h-[5rem] border-2 border-dashed rounded-lg transition-all ${isDragging
                                        ? 'border-primary bg-primary/10'
                                        : 'border-gray-300 hover:border-primary hover:bg-primary/5'
                                        }`}
                                >
                                    <input
                                        type="file"
                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                        onChange={handleFileSelect}
                                        multiple // Enable multiple files
                                        disabled={isUploading}
                                    />

                                    {/* Default State */}
                                    {!isUploading && uploadQueue.length === 0 && (
                                        <div className="flex items-center gap-3 pointer-events-none">
                                            <span className="material-symbols-outlined text-2xl text-gray-400">
                                                cloud_upload
                                            </span>
                                            <div className="text-sm">
                                                <span className="font-semibold text-gray-700">Click para subir</span>
                                                <span className="text-gray-500"> o arrastra archivos • Máx 10MB</span>
                                            </div>
                                        </div>
                                    )}

                                    {/* Uploading State / Queue Preview */}
                                    {uploadQueue.length > 0 && (
                                        <div className="w-full p-3 space-y-2 pointer-events-none">
                                            {uploadQueue.map(item => (
                                                <div key={item.id} className="flex items-center gap-3 text-sm">
                                                    <span className={`material-symbols-outlined text-lg ${item.status === 'success' ? 'text-green-500' :
                                                        item.status === 'error' ? 'text-red-500' :
                                                            'text-primary animate-spin'
                                                        }`}>
                                                        {item.status === 'success' ? 'check_circle' :
                                                            item.status === 'error' ? 'error' :
                                                                'progress_activity'}
                                                    </span>
                                                    <div className="flex-1">
                                                        <div className="flex justify-between mb-1">
                                                            <span className="font-medium text-gray-700 truncate max-w-[200px]">{item.file.name}</span>
                                                            <span className="text-xs text-gray-500">{item.progress}%</span>
                                                        </div>
                                                        <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                                            <div
                                                                className={`h-full transition-all duration-300 ${item.status === 'error' ? 'bg-red-500' : 'bg-primary'
                                                                    }`}
                                                                style={{ width: `${item.progress}%` }}
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>


                            {/* Files List - Compact Table Style */}
                            {visibleFiles.length > 0 ? (
                                <div className="space-y-1">
                                    {visibleFiles.map((file: any) => (
                                        <div
                                            key={file.id}
                                            className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg transition-colors group"
                                        >
                                            {/* Thumbnail or Icon */}
                                            {file.thumbnailUrl ? (
                                                <img
                                                    src={file.thumbnailUrl}
                                                    alt={file.originalName}
                                                    className="w-10 h-10 rounded object-cover border border-gray-200 flex-shrink-0"
                                                />
                                            ) : (
                                                <div className="w-10 h-10 bg-gray-100 rounded flex items-center justify-center flex-shrink-0">
                                                    <span className="material-symbols-outlined text-gray-400 text-lg">
                                                        description
                                                    </span>
                                                </div>
                                            )}

                                            {/* File Info */}
                                            <div className="flex-1 min-w-0">
                                                <p className="font-medium text-sm text-gray-900 truncate">{file.originalName}</p>
                                                <p className="text-xs text-gray-500">
                                                    {formatBytes(file.fileSize)} • {formatDate(file.uploadedAt)}
                                                </p>
                                            </div>

                                            {/* Actions */}
                                            <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                {fullAccess && file.downloadUrl && (
                                                    <button
                                                        onClick={() => handleDownload(file.downloadUrl, file.originalName)}
                                                        className="p-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
                                                        title="Descargar"
                                                    >
                                                        <span className="material-symbols-outlined text-sm">download</span>
                                                    </button>
                                                )}

                                                {!fullAccess && (
                                                    <div className="px-3 py-1.5 bg-gray-100 text-gray-400 rounded-lg flex items-center gap-1">
                                                        <span className="material-symbols-outlined text-sm">lock</span>
                                                        <span className="text-xs">Bloqueado</span>
                                                    </div>
                                                )}

                                                {isVendor && fullAccess && (
                                                    <button
                                                        onClick={() => setDeleteTarget({ id: file.id, name: file.originalName })}
                                                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                        title="Eliminar"
                                                    >
                                                        <span className="material-symbols-outlined text-sm">delete</span>
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-12 text-gray-500">
                                    <span className="material-symbols-outlined text-5xl text-gray-300 mb-3 block">
                                        folder_open
                                    </span>
                                    <p className="text-sm font-medium text-gray-700">No hay archivos en esta carpeta</p>
                                    <p className="text-xs mt-1">Sube archivos para comenzar</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Confirm Delete Modal */}
            {deleteTarget && (
                <ConfirmDeleteModal
                    title="¿Eliminar archivo?"
                    message={`Se eliminará "${deleteTarget.name}" permanentemente.`}
                    onConfirm={() => handleDelete(deleteTarget.id)}
                    onCancel={() => setDeleteTarget(null)}
                />
            )}
        </>
    );
};

export default DeliverableFolderCard;
