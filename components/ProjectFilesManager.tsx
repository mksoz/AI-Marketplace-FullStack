import React, { useState, useRef } from 'react';

interface FileItem {
    id: string;
    name: string;
    type: 'folder' | 'file';
    size?: string;
    updatedAt?: string;
    uploadedBy?: string;
}

interface ProjectFilesManagerProps {
    files: FileItem[];
    folders: FileItem[];
    readOnly?: boolean;
    onUpload?: (file: File, folderId?: string) => void;
    onDelete?: (id: string, type: 'folder' | 'file') => void;
    onCreateFolder?: (name: string, parentId?: string) => void;
    onRename?: (id: string, newName: string, type: 'folder' | 'file') => void;
}

const ProjectFilesManager: React.FC<ProjectFilesManagerProps> = ({
    files,
    folders,
    readOnly = false,
    onUpload,
    onDelete,
    onCreateFolder,
    onRename
}) => {
    const [currentPath, setCurrentPath] = useState<FileItem[]>([]);
    const [dragActive, setDragActive] = useState(false);
    const [showNewFolderModal, setShowNewFolderModal] = useState(false);
    const [newFolderName, setNewFolderName] = useState('');

    // Context Menu State
    const [contextMenu, setContextMenu] = useState<{ x: number, y: number, item: FileItem } | null>(null);

    // Confirmation Modal State
    const [confirmDelete, setConfirmDelete] = useState<{ item: FileItem } | null>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    const currentFolderId = currentPath.length > 0 ? currentPath[currentPath.length - 1].id : null;

    // Filter items for current view (mock logic: basic filtering, real app would use parentId)
    // For simplicity in this mock, assuming flat list provided or handled by parent. 
    // BUT user wants logic "inside each folder". 
    // Let's assume the parent filters or we do simple local filtering if props allow.
    // For this generic component, let's assume `files` and `folders` passed are ALL items, and we filter by `currentFolderId`.
    // NOTE: The mock data structure needs `parentId`. I will assume items have `parentId`.

    const visibleItems = [
        ...folders.filter((f: any) => (f.parentId || null) === currentFolderId),
        ...files.filter((f: any) => (f.parentId || null) === currentFolderId)
    ];

    const handleDrag = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (readOnly) return;
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            if (e.currentTarget.contains(e.relatedTarget as Node)) return;
            setDragActive(false);
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        if (readOnly) return;

        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleFileUpload(e.dataTransfer.files[0]);
        }
    };

    const handleFileUpload = (file: File) => {
        if (file.size > 10 * 1024 * 1024) { // 10MB limit explanation
            alert("El archivo excede el límite de 10MB");
            return;
        }
        if (onUpload) onUpload(file, currentFolderId || undefined);
    };

    const onContextMenu = (e: React.MouseEvent, item: FileItem) => {
        e.preventDefault();
        if (readOnly) return;
        setContextMenu({ x: e.clientX, y: e.clientY, item });
    };

    return (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden flex flex-col h-[600px]">
            {/* Toolbar */}
            <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setCurrentPath([])}
                        className={`p-2 rounded-lg hover:bg-gray-100 ${currentPath.length === 0 ? 'text-primary bg-blue-50' : 'text-gray-500'}`}
                    >
                        <span className="material-symbols-outlined">home</span>
                    </button>
                    {currentPath.map((folder, index) => (
                        <div key={folder.id} className="flex items-center gap-1">
                            <span className="material-symbols-outlined text-gray-300 text-sm">chevron_right</span>
                            <button
                                onClick={() => setCurrentPath(currentPath.slice(0, index + 1))}
                                className={`text-sm font-bold px-2 py-1 rounded-lg hover:bg-gray-100 ${index === currentPath.length - 1 ? 'text-gray-900' : 'text-gray-500'}`}
                            >
                                {folder.name}
                            </button>
                        </div>
                    ))}
                </div>
                {!readOnly && (
                    <div className="flex gap-2">
                        <button
                            onClick={() => setShowNewFolderModal(true)}
                            className="px-3 py-2 bg-white border border-gray-200 text-gray-700 font-bold text-xs rounded-lg hover:bg-gray-50 flex items-center gap-2"
                        >
                            <span className="material-symbols-outlined text-lg">create_new_folder</span> Nueva Carpeta
                        </button>
                    </div>
                )}
            </div>

            {/* Drop Zone & File List */}
            <div
                className={`flex-1 overflow-y-auto p-6 relative transition-colors ${dragActive ? 'bg-blue-50 border-2 border-dashed border-blue-400' : ''}`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                onClick={() => setContextMenu(null)}
            >
                {/* Upload Banner */}
                {!readOnly && (
                    <div
                        onClick={() => inputRef.current?.click()}
                        className="mb-6 border-2 border-dashed border-gray-300 rounded-xl p-8 flex items-center justify-center gap-4 cursor-pointer hover:bg-gray-50 hover:border-primary/50 transition-all group"
                    >
                        <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center group-hover:scale-110 transition-transform">
                            <span className="material-symbols-outlined text-primary text-xl">cloud_upload</span>
                        </div>
                        <div className="text-sm">
                            <span className="font-bold text-gray-900 block">Arrastra archivos aquí para subir</span>
                            <span className="text-gray-500">o <span className="text-red-400 hover:text-red-500 hover:underline">haz clic para explorar</span></span>
                        </div>
                        <input
                            ref={inputRef}
                            type="file"
                            className="hidden"
                            onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0])}
                        />
                    </div>
                )}

                {dragActive && (
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10 bg-white/80 backdrop-blur-sm">
                        <div className="text-center text-blue-500">
                            <span className="material-symbols-outlined text-6xl mb-2 animate-bounce">cloud_upload</span>
                            <p className="font-bold text-lg">Suelta los archivos para subir</p>
                        </div>
                    </div>
                )}

                {visibleItems.length === 0 ? (
                    <div className="h-40 flex flex-col items-center justify-center text-gray-400">
                        <span className="material-symbols-outlined text-4xl mb-2 text-gray-200">folder_open</span>
                        <p className="font-medium text-sm">Carpeta vacía</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                        {visibleItems.map(item => (
                            <div
                                key={item.id}
                                onContextMenu={(e) => onContextMenu(e, item)}
                                onClick={() => item.type === 'folder' ? setCurrentPath([...currentPath, item]) : null}
                                className={`
                                    group relative p-4 rounded-xl border border-gray-100 hover:border-primary/30 hover:shadow-md transition-all cursor-pointer bg-white
                                    ${item.type === 'folder' ? 'hover:bg-blue-50/30' : 'hover:bg-gray-50'}
                                `}
                            >
                                <div className={`w-12 h-12 rounded-lg flex items-center justify-center mb-3 mx-auto ${item.type === 'folder' ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-500'}`}>
                                    <span className="material-symbols-outlined text-2xl">
                                        {item.type === 'folder' ? 'folder' : 'description'}
                                    </span>
                                </div>
                                <p className="text-xs font-bold text-gray-700 text-center truncate px-1">{item.name}</p>
                                <p className="text-[10px] text-gray-400 text-center mt-1">{item.size || (item.type === 'folder' ? '-' : '0 KB')}</p>

                                {!readOnly && (
                                    <button
                                        onClick={(e) => { e.stopPropagation(); onContextMenu(e, item); }}
                                        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 p-1 hover:bg-gray-200 rounded text-gray-500"
                                    >
                                        <span className="material-symbols-outlined text-sm">more_vert</span>
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Context Menu */}
            {contextMenu && (
                <div
                    className="fixed z-50 bg-white rounded-lg shadow-xl border border-gray-100 py-1 w-48 animate-in fade-in zoom-in-95 duration-100"
                    style={{ top: contextMenu.y, left: contextMenu.x }}
                >
                    <div className="px-3 py-2 border-b border-gray-50 mb-1">
                        <p className="text-xs font-bold text-gray-900 truncate">{contextMenu.item.name}</p>
                    </div>
                    <button className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2">
                        <span className="material-symbols-outlined text-gray-400 text-lg">drive_file_rename_outline</span> Renombrar
                    </button>
                    <button className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2">
                        <span className="material-symbols-outlined text-gray-400 text-lg">download</span> Descargar
                    </button>
                    <div className="border-t border-gray-50 my-1"></div>
                    <button
                        onClick={() => { setConfirmDelete({ item: contextMenu.item }); setContextMenu(null); }}
                        className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 font-medium"
                    >
                        <span className="material-symbols-outlined text-lg">delete</span> Eliminar
                    </button>
                </div>
            )}

            {/* New Folder Modal */}
            {showNewFolderModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl p-6 w-96 shadow-2xl animate-in zoom-in-95 duration-200">
                        <h3 className="text-lg font-bold text-gray-900 mb-4">Nueva Carpeta</h3>
                        <input
                            type="text"
                            className="w-full p-3 border border-gray-300 rounded-xl mb-6 focus:ring-2 focus:ring-primary outline-none"
                            placeholder="Nombre de la carpeta"
                            autoFocus
                            value={newFolderName}
                            onChange={(e) => setNewFolderName(e.target.value)}
                        />
                        <div className="flex justify-end gap-3">
                            <button onClick={() => setShowNewFolderModal(false)} className="px-4 py-2 text-gray-600 font-bold hover:bg-gray-50 rounded-lg">Cancelar</button>
                            <button
                                onClick={() => {
                                    if (newFolderName.trim() && onCreateFolder) onCreateFolder(newFolderName, currentFolderId || undefined);
                                    setNewFolderName('');
                                    setShowNewFolderModal(false);
                                }}
                                className="px-4 py-2 bg-primary text-white font-bold rounded-lg hover:opacity-90"
                            >
                                Crear
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {confirmDelete && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl p-6 w-[400px] shadow-2xl animate-in zoom-in-95 duration-200">
                        <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4 mx-auto text-red-600">
                            <span className="material-symbols-outlined text-2xl">delete</span>
                        </div>
                        <h3 className="text-lg font-bold text-gray-900 text-center mb-2">¿Eliminar {confirmDelete.item.type === 'folder' ? 'Carpeta' : 'Archivo'}?</h3>
                        <p className="text-gray-500 text-center mb-6 text-sm">
                            Estás a punto de eliminar <span className="font-bold text-gray-800">"{confirmDelete.item.name}"</span>.
                            {confirmDelete.item.type === 'folder' && " Todo su contenido será eliminado permanentemente."}
                            <br />Esta acción no se puede deshacer.
                        </p>
                        <div className="flex justify-center gap-3">
                            <button onClick={() => setConfirmDelete(null)} className="px-4 py-2 text-gray-600 font-bold hover:bg-gray-50 rounded-lg border border-gray-200">Cancelar</button>
                            <button
                                onClick={() => {
                                    if (onDelete) onDelete(confirmDelete.item.id, confirmDelete.item.type);
                                    setConfirmDelete(null);
                                }}
                                className="px-4 py-2 bg-red-600 text-white font-bold rounded-lg hover:bg-red-700 shadow-lg shadow-red-200"
                            >
                                Sí, Eliminar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProjectFilesManager;
