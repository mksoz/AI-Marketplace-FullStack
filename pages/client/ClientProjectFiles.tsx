import React, { useState } from 'react';
import DeliverableFolderCard from '../../components/deliverables/DeliverableFolderCard';
import MilestoneFolderGrid from '../../components/deliverables/MilestoneFolderGrid';

interface ClientProjectFilesProps {
    project: any;
    userRole: 'CLIENT' | 'VENDOR';
}

const ClientProjectFiles: React.FC<ClientProjectFilesProps> = ({ project, userRole = 'CLIENT' }) => {
    // View Mode: Documents (Standard) vs Repository (GitHub) vs Deliverables (Protected by milestone)
    const [viewMode, setViewMode] = useState<'documents' | 'repository' | 'deliverables'>('deliverables');

    // Deliverables navigation
    const [selectedMilestone, setSelectedMilestone] = useState<any | null>(null);
    const [selectedFolder, setSelectedFolder] = useState<any | null>(null); // New state for specific folder

    // Navigation State
    const [currentFolder, setCurrentFolder] = useState<any | null>(null);

    // Interaction State
    const [isDragging, setIsDragging] = useState(false);
    const [showNewFolderModal, setShowNewFolderModal] = useState(false);
    const [newFolderName, setNewFolderName] = useState('');
    const [folderMenu, setFolderMenu] = useState<{ id: string, x: number, y: number } | null>(null);
    const [renamingFolder, setRenamingFolder] = useState<{ id: string, name: string } | null>(null);

    // Upload State
    const [uploadQueue, setUploadQueue] = useState<Array<{
        id: string;
        file: File;
        progress: number;
        status: 'pending' | 'uploading' | 'success' | 'error';
        error?: string;
    }>>([]);
    const fileInputRef = React.useRef<HTMLInputElement>(null);

    // Derived Data
    // Ideally this comes from props or a fetch, for now using local copy or props
    const [localFolders, setLocalFolders] = useState<any[]>(project.folders || []);
    const [localFiles, setLocalFiles] = useState<any[]>(project.files || []);

    // Sync with props if needed, but for local edits we might need local state
    // For this demo we'll just push to local state

    const folders = project.folders || [];
    const rootFiles = project.files || [];
    const currentFiles = currentFolder ? (currentFolder.files || []) : rootFiles;
    const currentSubfolders = localFolders.filter((f: any) =>
        currentFolder ? f.parentId === currentFolder.id : !f.parentId
    );

    const handleDragOver = (e: React.DragEvent) => { e.preventDefault(); setIsDragging(true); };
    const handleDragLeave = () => { setIsDragging(false); };
    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            handleFiles(e.dataTransfer.files);
        }
    };

    const handleFiles = (files: FileList) => {
        const newItems = Array.from(files).map(file => ({
            id: Math.random().toString(36).substring(7),
            file,
            progress: 0,
            status: 'pending' as const
        }));

        // Filter size limit
        const validItems = newItems.filter(item => {
            if (item.file.size > 10 * 1024 * 1024) {
                alert(`Skip: ${item.file.name} (Max 10MB)`);
                return false;
            }
            return true;
        });

        setUploadQueue(prev => [...prev, ...validItems]);
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            handleFiles(e.target.files);
            e.target.value = ''; // Reset input
        }
    };

    // Process upload queue
    React.useEffect(() => {
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
        formData.append('projectId', project.id);
        if (currentFolder) {
            formData.append('folderId', currentFolder.id);
        }

        try {
            await api.post(`/files/upload`, formData, {
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

            // Refresh file list
            // TODO: refresh project data from parent or refetch
            console.log('File uploaded successfully:', pendingItem.file.name);

        } catch (error: any) {
            console.error('Upload error:', error);
            setUploadQueue(prev => prev.map(item =>
                item.id === pendingItem.id ? { ...item, status: 'error', error: error.message || 'Error' } : item
            ));
        }

        // Remove from queue after delay
        setTimeout(() => {
            setUploadQueue(prev => prev.filter(item => item.id !== pendingItem.id));
        }, 3000);
    };

    const handleCreateFolder = () => {
        if (!newFolderName.trim()) return;
        const newFolder = {
            id: `new-${Date.now()}`,
            name: newFolderName,
            parentId: currentFolder?.id || null,
            filesCount: 0
        };
        setLocalFolders([...localFolders, newFolder]);
        setNewFolderName('');
        setShowNewFolderModal(false);
    };

    const handleDeleteFolder = (folderId: string) => {
        if (window.confirm('¿Estás seguro de que deseas eliminar esta carpeta?')) {
            setLocalFolders(localFolders.filter(f => f.id !== folderId));
        }
        setFolderMenu(null);
    };

    const handleRenameFolder = () => {
        if (renamingFolder && renamingFolder.name.trim()) {
            setLocalFolders(localFolders.map(f => f.id === renamingFolder.id ? { ...f, name: renamingFolder.name } : f));
            setRenamingFolder(null);
        }
    };

    // Close menu on click outside
    React.useEffect(() => {
        const closeMenu = () => setFolderMenu(null);
        window.addEventListener('click', closeMenu);
        return () => window.removeEventListener('click', closeMenu);
    }, []);

    const getIcon = (type: string) => {
        if (type === 'pdf') return 'picture_as_pdf';
        if (type === 'figma' || type === 'img' || type === 'png' || type === 'jpg') return 'image';
        if (type === 'doc' || type === 'docx') return 'description';
        return 'insert_drive_file';
    };

    const getColor = (type: string) => {
        if (type === 'pdf') return 'text-red-500 bg-red-50';
        if (type === 'figma') return 'text-purple-500 bg-purple-50';
        if (type === 'img' || type === 'png' || type === 'jpg') return 'text-blue-500 bg-blue-50';
        if (type === 'doc' || type === 'docx') return 'text-blue-700 bg-blue-50';
        return 'text-gray-500 bg-gray-50';
    };

    // --- GITHUB MOCK DATA (Ideally this comes from project.repoUrl integration) ---
    const repoStats = {
        name: project.repoName || 'repo-not-linked',
        branch: 'main',
        url: project.repoUrl,
        lastCommit: 'Hace 2 horas', // Mock
        commits: 142,
        contributors: 4,
        status: 'stable',
        language: 'Python'
    };

    const recentCommits = [ // Mock
        { id: 'c1', message: 'feat: Implement collaborative filtering', hash: '8a2b3c', author: 'DevTeam', time: 'Hace 2h', type: 'add' },
        { id: 'c2', message: 'fix: API endpoint latency issue', hash: '9d1e2f', author: 'TechLead', time: 'Hace 5h', type: 'fix' },
    ];

    if (!project) return null;

    return (
        <div className="space-y-6">

            {/* Header & View Toggle */}
            <div className="flex flex-col md:flex-row justify-between items-end md:items-center gap-4">
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setCurrentFolder(null)}
                        className={`text-sm font-bold ${!currentFolder ? 'text-gray-900' : 'text-gray-500 hover:text-gray-900'}`}
                    >
                        Archivos
                    </button>
                    {currentFolder && (
                        <>
                            <span className="material-symbols-outlined text-gray-400 text-sm">chevron_right</span>
                            <span className="text-sm font-bold text-gray-900">{currentFolder.name}</span>
                        </>
                    )}
                </div>

                {/* View Mode Toggle */}
                <div className="bg-gray-100 p-1 rounded-xl flex items-center">
                    <button
                        onClick={() => setViewMode('deliverables')}
                        className={`px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-all ${viewMode === 'deliverables' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                        <span className="material-symbols-outlined text-lg">folder_special</span> Entregables
                    </button>
                    <button
                        onClick={() => setViewMode('documents')}
                        className={`px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-all ${viewMode === 'documents' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                        <span className="material-symbols-outlined text-lg">folder</span> Documentos
                    </button>
                    <button
                        onClick={() => setViewMode('repository')}
                        className={`px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-all ${viewMode === 'repository' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                        <img src="https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png" className={`w-4 h-4 ${viewMode === 'repository' ? 'opacity-100' : 'opacity-50'}`} alt="GitHub" />
                        Repositorio
                    </button>
                </div>
            </div>

            {/* =======================
            DELIVERABLES VIEW (Protected by Milestone)
           ======================= */}
            {viewMode === 'deliverables' && (
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-6">
                    {/* Breadcrumb Navigation - Enhanced */}
                    {(selectedMilestone || selectedFolder) && (
                        <div className="flex items-center gap-2 text-sm">
                            <button
                                onClick={() => {
                                    setSelectedMilestone(null);
                                    setSelectedFolder(null); // Clear folder too
                                }}
                                className="flex items-center gap-1 text-gray-500 hover:text-primary transition-colors"
                            >
                                <span className="material-symbols-outlined text-lg">folder_special</span>
                                <span className="font-medium">Entregables</span>
                            </button>
                            {selectedMilestone && (
                                <>
                                    <span className="material-symbols-outlined text-gray-400 text-sm">chevron_right</span>
                                    <span className="font-bold text-gray-900">
                                        Hito {selectedMilestone.order}: {selectedMilestone.title}
                                    </span>
                                </>
                            )}
                            {selectedFolder && (
                                <>
                                    <span className="material-symbols-outlined text-gray-400 text-sm">chevron_right</span>
                                    <span className="font-bold text-gray-900">{selectedFolder.name}</span>
                                </>
                            )}
                        </div>
                    )}

                    {/* Grid View - All Milestones/Folders */}
                    {!selectedFolder && (
                        <>
                            {/* Info Banner */}
                            <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-xl p-4">
                                <div className="flex items-start gap-3">
                                    <span className="material-symbols-outlined text-blue-600 text-2xl">info</span>
                                    <div>
                                        <h4 className="font-bold text-gray-900 mb-1">Entregables Protegidos por Hito</h4>
                                        <p className="text-sm text-gray-700">
                                            Los archivos están organizados por hito y se desbloquean automáticamente cuando el cliente aprueba el pago.
                                            {userRole === 'VENDOR' && ' Gestiona múltiples carpetas por hito para organizar mejor tus entregas.'}
                                            {userRole === 'CLIENT' && ' Las carpetas se desbloquearán tras aprobar cada pago.'}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Folder Grid */}
                            {project.milestones && project.milestones.length > 0 ? (
                                <div>
                                    <MilestoneFolderGrid
                                        milestones={project.milestones}
                                        projectId={project.id}
                                        isVendor={userRole === 'VENDOR'}
                                        onSelectFolder={(folder, milestone) => {
                                            setSelectedFolder(folder);
                                            setSelectedMilestone(milestone);
                                        }}
                                    />
                                </div>
                            ) : (
                                <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
                                    <span className="material-symbols-outlined text-6xl text-gray-300 block mb-4">
                                        flag
                                    </span>
                                    <h3 className="text-lg font-bold text-gray-900 mb-2">No hay hitos en este proyecto</h3>
                                    <p className="text-gray-500">Los entregables se organizarán por hito una vez que se cree el roadmap.</p>
                                </div>
                            )}
                        </>
                    )}

                    {/* Detail View - Selected Folder */}
                    {selectedFolder && selectedMilestone && (
                        <div>
                            {/* Back Button */}
                            <button
                                onClick={() => {
                                    setSelectedFolder(null);
                                    setSelectedMilestone(null);
                                }}
                                className="mb-4 p-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-gray-300 transition-all group"
                                title="Volver a los entregables"
                            >
                                <span className="material-symbols-outlined text-xl text-gray-600 group-hover:text-primary transition-colors">arrow_back</span>
                            </button>

                            {/* Folder Card */}
                            <DeliverableFolderCard
                                milestoneId={selectedMilestone.id}
                                milestoneTitle={selectedMilestone.title}
                                projectId={project.id}
                                isVendor={userRole === 'VENDOR'}
                                folderId={selectedFolder.id}
                            />
                        </div>
                    )}
                </div>
            )}

            {/* =======================
            REPOSITORY VIEW
           ======================= */}
            {viewMode === 'repository' && (
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-6">
                    {/* Repo Health Card */}
                    <div className="bg-gray-900 text-white rounded-2xl p-6 shadow-lg relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-8 opacity-10">
                            <span className="material-symbols-outlined text-9xl">code</span>
                        </div>
                        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                            <div>
                                <h2 className="text-2xl font-bold font-mono tracking-tight flex items-center gap-3">
                                    {repoStats.name}
                                </h2>
                                <p className="text-gray-400 text-sm mt-1">{repoStats.url || 'No vinculado'}</p>
                            </div>
                            <div className="text-right">
                                {repoStats.url ? (
                                    <a href={repoStats.url} target="_blank" rel="noopener noreferrer" className="bg-white text-gray-900 px-4 py-2 rounded-lg font-bold text-sm hover:bg-gray-100 flex items-center gap-2 transition-colors">
                                        <span className="material-symbols-outlined text-lg">open_in_new</span>
                                        Ver en GitHub
                                    </a>
                                ) : (
                                    <span className="px-3 py-1 bg-gray-800 text-gray-400 rounded text-sm">Repositorio no configurado</span>
                                )}
                            </div>
                        </div>
                    </div>
                    {/* Activity Stream (Mocked for now) */}
                    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
                        <div className="bg-gray-50 px-4 py-3 border-b border-gray-200 flex justify-between items-center">
                            <span className="text-xs font-bold text-gray-500 uppercase">Actividad Reciente (Demo)</span>
                        </div>
                        <div className="divide-y divide-gray-100">
                            {recentCommits.map((commit, i) => (
                                <div key={commit.id} className="p-4 hover:bg-gray-50 transition-colors group flex gap-4 items-start">
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-gray-900 font-mono truncate">{commit.message}</p>
                                        <div className="flex items-center gap-2 mt-1">
                                            <span className="text-xs text-gray-500 font-bold">{commit.author}</span>
                                            <span className="text-xs text-gray-400">•</span>
                                            <span className="text-xs text-gray-400">{commit.time}</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* =======================
            DOCUMENTS VIEW (Standard)
           ======================= */}
            {viewMode === 'documents' && (
                <div
                    className={`bg-white rounded-2xl border-2 transition-all duration-300 relative ${isDragging ? 'border-primary bg-primary/5' : 'border-gray-200 hover:border-gray-300'}`}
                >
                    <div className="p-6">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="font-bold text-gray-700">Carpetas</h3>
                            <button onClick={() => setShowNewFolderModal(true)} className="text-primary hover:bg-primary/5 px-3 py-1.5 rounded-lg text-sm font-bold flex items-center gap-2 transition-colors">
                                <span className="material-symbols-outlined text-lg">create_new_folder</span> Nueva Carpeta
                            </button>
                        </div>

                        {/* Upload Zone with Click to Upload */}
                        <div
                            onDragOver={handleDragOver}
                            onDragLeave={handleDragLeave}
                            onDrop={handleDrop}
                            onClick={() => fileInputRef.current?.click()}
                            className={`mb-6 border-2 border-dashed rounded-xl p-6 cursor-pointer transition-all ${isDragging ? 'border-primary bg-primary/10 scale-[1.02]' : 'border-gray-300 hover:border-primary hover:bg-gray-50'
                                }`}
                        >
                            <input
                                ref={fileInputRef}
                                type="file"
                                multiple
                                className="hidden"
                                onChange={handleFileSelect}
                            />

                            {/* Default State */}
                            {uploadQueue.length === 0 && (
                                <div className="flex items-center justify-center gap-4">
                                    <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center">
                                        <span className="material-symbols-outlined text-primary text-2xl">cloud_upload</span>
                                    </div>
                                    <div className="text-sm">
                                        <span className="font-bold text-gray-900 block">Click para subir o arrastra archivos aquí</span>
                                        <span className="text-gray-500">Máximo 10MB por archivo</span>
                                    </div>
                                </div>
                            )}

                            {/* Upload Queue Progress */}
                            {uploadQueue.length > 0 && (
                                <div className="space-y-2">
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

                        {/* Folders List */}
                        {currentSubfolders.length > 0 ? (
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                                {currentSubfolders.map((folder: any) => (
                                    <div
                                        key={folder.id}
                                        onClick={(e) => { e.stopPropagation(); setCurrentFolder(folder); }}
                                        className="p-4 bg-gray-50 hover:bg-white hover:shadow-md border border-gray-100 hover:border-blue-200 rounded-xl cursor-pointer transition-all group relative"
                                    >
                                        <div className="flex items-start justify-between mb-2">
                                            <span className="material-symbols-outlined text-3xl text-blue-300 group-hover:text-blue-500 transition-colors">folder</span>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setFolderMenu({ id: folder.id, x: e.clientX, y: e.clientY });
                                                }}
                                                className="text-gray-300 hover:text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-gray-200 rounded-full"
                                            >
                                                <span className="material-symbols-outlined text-lg">more_vert</span>
                                            </button>
                                        </div>
                                        {renamingFolder?.id === folder.id ? (
                                            <input
                                                autoFocus
                                                value={renamingFolder.name}
                                                onChange={e => setRenamingFolder({ ...renamingFolder, name: e.target.value })}
                                                onBlur={handleRenameFolder}
                                                onKeyDown={e => e.key === 'Enter' && handleRenameFolder()}
                                                onClick={e => e.stopPropagation()}
                                                className="w-full text-sm font-bold border border-blue-300 rounded px-1 outline-none"
                                            />
                                        ) : (
                                            <h4 className="font-bold text-gray-900 text-sm truncate" title={folder.name}>{folder.name}</h4>
                                        )}
                                        <p className="text-xs text-gray-500 mt-1">{folder.filesCount || 0} archivos</p>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="mb-8 p-4 border border-dashed border-gray-200 rounded-xl text-center">
                                <p className="text-gray-400 text-sm">No hay carpetas aquí.</p>
                            </div>
                        )}

                        {/* Files List */}
                        <div className="space-y-1">
                            <div className="grid grid-cols-12 px-4 py-2 text-xs font-bold text-gray-400 uppercase tracking-wide border-b border-gray-100">
                                <div className="col-span-5 md:col-span-6">Nombre</div>
                                <div className="col-span-3 md:col-span-2">Tamaño</div>
                                <div className="col-span-4 md:col-span-4 text-right">Acciones</div>
                            </div>

                            {currentFiles.length === 0 ? (
                                <div className="py-12 text-center">
                                    <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <span className="material-symbols-outlined text-3xl text-gray-300">folder_open</span>
                                    </div>
                                    <p className="text-gray-500 text-sm">Esta carpeta está vacía.</p>
                                </div>
                            ) : (
                                currentFiles.map((file: any) => (
                                    <div key={file.id} className="grid grid-cols-12 px-4 py-3 hover:bg-gray-50 rounded-lg group items-center transition-colors">
                                        <div className="col-span-5 md:col-span-6 flex items-center gap-3 overflow-hidden">
                                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${getColor(file.mimeType)}`}>
                                                <span className="material-symbols-outlined text-lg">{getIcon(file.mimeType)}</span>
                                            </div>
                                            <div className="min-w-0">
                                                <p className="text-sm font-bold text-gray-900 truncate">{file.name}</p>
                                                <p className="text-xs text-gray-400 hidden sm:block">{new Date(file.createdAt).toLocaleDateString()} • {file.uploaderId}</p>
                                            </div>
                                        </div>
                                        <div className="col-span-3 md:col-span-2 text-sm text-gray-500 font-mono">{(file.size / 1024).toFixed(1)} KB</div>
                                        <div className="col-span-4 md:col-span-4 flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button className="p-2 hover:bg-gray-200 rounded-lg text-gray-500 hover:text-gray-700" title="Descargar">
                                                <span className="material-symbols-outlined text-lg">download</span>
                                            </button>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Context Menu */}
            {folderMenu && (
                <div
                    className="fixed bg-white shadow-xl rounded-lg border border-gray-100 py-1 w-40 z-50 animate-in fade-in zoom-in-95 duration-100"
                    style={{ top: folderMenu.y, left: folderMenu.x }}
                    onClick={e => e.stopPropagation()}
                >
                    <button
                        onClick={() => {
                            const f = localFolders.find(f => f.id === folderMenu.id);
                            if (f) setRenamingFolder({ id: f.id, name: f.name });
                            setFolderMenu(null);
                        }}
                        className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                    >
                        <span className="material-symbols-outlined text-base">edit</span> Renombrar
                    </button>
                    <button
                        onClick={() => handleDeleteFolder(folderMenu.id)}
                        className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                    >
                        <span className="material-symbols-outlined text-base">delete</span> Eliminar
                    </button>
                </div>
            )}

            {/* New Folder Modal */}
            {showNewFolderModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6">
                        <h3 className="text-lg font-bold text-gray-900 mb-4">Nueva Carpeta</h3>
                        <input
                            autoFocus
                            type="text"
                            className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary outline-none mb-4"
                            placeholder="Nombre de la carpeta"
                            value={newFolderName}
                            onChange={e => setNewFolderName(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && handleCreateFolder()}
                        />
                        <div className="flex justify-end gap-2">
                            <button onClick={() => setShowNewFolderModal(false)} className="px-4 py-2 text-gray-600 font-bold hover:bg-gray-50 rounded-lg">Cancelar</button>
                            <button onClick={handleCreateFolder} className="px-4 py-2 bg-primary text-white font-bold rounded-lg hover:bg-primary-dark">Crear</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ClientProjectFiles;