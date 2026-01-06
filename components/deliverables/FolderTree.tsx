import React, { useState } from 'react';
import ConfirmDeleteModal from './ConfirmDeleteModal';

interface Subfolder {
    id: string;
    name: string;
    parentId: string | null;
    createdAt: string;
}

interface FolderTreeProps {
    subfolders: Subfolder[];
    currentFolderId: string | null;
    onSelectFolder: (folderId: string | null) => void;
    onCreateFolder: (name: string, parentId: string | null) => Promise<void>;
    onRenameFolder: (folderId: string, newName: string) => Promise<void>;
    onDeleteFolder: (folderId: string) => Promise<void>;
    isVendor: boolean;
}

const FolderTree: React.FC<FolderTreeProps> = ({
    subfolders,
    currentFolderId,
    onSelectFolder,
    onCreateFolder,
    onRenameFolder,
    onDeleteFolder,
    isVendor
}) => {
    const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set());
    const [editingFolder, setEditingFolder] = useState<string | null>(null);
    const [editName, setEditName] = useState('');
    const [deleteTarget, setDeleteTarget] = useState<{ id: string, name: string } | null>(null);
    const [showNewFolderInput, setShowNewFolderInput] = useState<string | null>(null);
    const [newFolderName, setNewFolderName] = useState('');

    const toggleFolder = (folderId: string) => {
        const newExpanded = new Set(expandedFolders);
        if (newExpanded.has(folderId)) {
            newExpanded.delete(folderId);
        } else {
            newExpanded.add(folderId);
        }
        setExpandedFolders(newExpanded);
    };

    const handleStartEdit = (folder: Subfolder) => {
        setEditingFolder(folder.id);
        setEditName(folder.name);
    };

    const handleSaveEdit = async (folderId: string) => {
        if (editName.trim()) {
            await onRenameFolder(folderId, editName.trim());
            setEditingFolder(null);
        }
    };

    const handleCreateFolder = async (parentId: string | null) => {
        if (newFolderName.trim()) {
            await onCreateFolder(newFolderName.trim(), parentId);
            setShowNewFolderInput(null);
            setNewFolderName('');
            if (parentId) {
                setExpandedFolders(prev => new Set(prev).add(parentId));
            }
        }
    };

    const buildTree = (parentId: string | null = null): Subfolder[] => {
        return subfolders.filter(f => f.parentId === parentId);
    };

    const renderFolder = (folder: Subfolder, level: number = 0) => {
        const children = buildTree(folder.id);
        const isExpanded = expandedFolders.has(folder.id);
        const isSelected = currentFolderId === folder.id;
        const isEditing = editingFolder === folder.id;

        return (
            <div key={folder.id}>
                <div
                    className={`
                        flex items-center gap-2 px-2 py-1.5 rounded-lg cursor-pointer transition-colors group
                        ${isSelected ? 'bg-primary/10 text-primary font-semibold' : 'hover:bg-gray-100'}
                    `}
                    style={{ paddingLeft: `${level * 20 + 8}px` }}
                >
                    {/* Expand/Collapse */}
                    {children.length > 0 && (
                        <button
                            onClick={() => toggleFolder(folder.id)}
                            className="p-0.5 hover:bg-gray-200 rounded"
                        >
                            <span className="material-symbols-outlined text-sm text-gray-600">
                                {isExpanded ? 'expand_more' : 'chevron_right'}
                            </span>
                        </button>
                    )}
                    {children.length === 0 && <div className="w-5"></div>}

                    {/* Folder Icon */}
                    <span className="material-symbols-outlined text-lg text-amber-600">
                        {isExpanded && children.length > 0 ? 'folder_open' : 'folder'}
                    </span>

                    {/* Folder Name or Edit Input */}
                    {isEditing ? (
                        <input
                            autoFocus
                            type="text"
                            value={editName}
                            onChange={e => setEditName(e.target.value)}
                            onBlur={() => handleSaveEdit(folder.id)}
                            onKeyDown={e => {
                                if (e.key === 'Enter') handleSaveEdit(folder.id);
                                if (e.key === 'Escape') setEditingFolder(null);
                            }}
                            className="flex-1 px-2 py-0.5 text-sm border border-primary rounded focus:outline-none"
                        />
                    ) : (
                        <span
                            onClick={() => onSelectFolder(folder.id)}
                            className="flex-1 text-sm truncate"
                        >
                            {folder.name}
                        </span>
                    )}

                    {/* Actions (visible on hover for vendor) */}
                    {isVendor && !isEditing && (
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                                onClick={() => setShowNewFolderInput(folder.id)}
                                className="p-1 hover:bg-gray-200 rounded"
                                title="Nueva subcarpeta"
                            >
                                <span className="material-symbols-outlined text-sm text-gray-600">create_new_folder</span>
                            </button>
                            <button
                                onClick={() => handleStartEdit(folder)}
                                className="p-1 hover:bg-gray-200 rounded"
                                title="Renombrar"
                            >
                                <span className="material-symbols-outlined text-sm text-gray-600">edit</span>
                            </button>
                            <button
                                onClick={() => setDeleteTarget({ id: folder.id, name: folder.name })}
                                className="p-1 hover:bg-red-100 rounded"
                                title="Eliminar"
                            >
                                <span className="material-symbols-outlined text-sm text-red-600">delete</span>
                            </button>
                        </div>
                    )}
                </div>

                {/* New Folder Input */}
                {showNewFolderInput === folder.id && (
                    <div
                        className="flex items-center gap-2 px-2 py-1.5 ml-3"
                        style={{ paddingLeft: `${(level + 1) * 20 + 8}px` }}
                    >
                        <span className="material-symbols-outlined text-lg text-gray-400">folder</span>
                        <input
                            autoFocus
                            type="text"
                            placeholder="Nombre de carpeta"
                            value={newFolderName}
                            onChange={e => setNewFolderName(e.target.value)}
                            onBlur={() => {
                                if (!newFolderName.trim()) setShowNewFolderInput(null);
                            }}
                            onKeyDown={e => {
                                if (e.key === 'Enter') handleCreateFolder(folder.id);
                                if (e.key === 'Escape') {
                                    setShowNewFolderInput(null);
                                    setNewFolderName('');
                                }
                            }}
                            className="flex-1 px-2 py-0.5 text-sm border border-primary rounded focus:outline-none"
                        />
                        <button
                            onClick={() => handleCreateFolder(folder.id)}
                            className="p-1 bg-primary text-white rounded hover:bg-primary/90"
                        >
                            <span className="material-symbols-outlined text-sm">check</span>
                        </button>
                    </div>
                )}

                {/* Children */}
                {isExpanded && children.map(child => renderFolder(child, level + 1))}
            </div>
        );
    };

    const rootFolders = buildTree(null);

    return (
        <div className="border border-gray-200 rounded-lg p-2 bg-white max-h-80 overflow-y-auto">
            {/* Root Level */}
            <div
                className={`
                    flex items-center gap-2 px-2 py-1.5 rounded-lg cursor-pointer transition-colors mb-1 group
                    ${currentFolderId === null ? 'bg-primary/10 text-primary font-semibold' : 'hover:bg-gray-100'}
                `}
                onClick={() => onSelectFolder(null)}
            >
                <span className="material-symbols-outlined text-lg text-primary">home</span>
                <span className="flex-1 text-sm">Raíz</span>
                {isVendor && (
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            setShowNewFolderInput('root');
                        }}
                        className="p-1 hover:bg-primary/10 rounded transition-colors"
                        title="Nueva carpeta"
                    >
                        <span className="material-symbols-outlined text-sm text-primary">add</span>
                    </button>
                )}
            </div>

            {/* New Root Folder Input */}
            {showNewFolderInput === 'root' && (
                <div className="flex items-center gap-2 px-2 py-1.5 ml-3 mb-1">
                    <span className="material-symbols-outlined text-lg text-gray-400">folder</span>
                    <input
                        autoFocus
                        type="text"
                        placeholder="Nombre de carpeta"
                        value={newFolderName}
                        onChange={e => setNewFolderName(e.target.value)}
                        onBlur={() => {
                            if (!newFolderName.trim()) setShowNewFolderInput(null);
                        }}
                        onKeyDown={e => {
                            if (e.key === 'Enter') handleCreateFolder(null);
                            if (e.key === 'Escape') {
                                setShowNewFolderInput(null);
                                setNewFolderName('');
                            }
                        }}
                        className="flex-1 px-2 py-0.5 text-sm border border-primary rounded focus:outline-none"
                    />
                    <button
                        onClick={() => handleCreateFolder(null)}
                        className="p-1 bg-primary text-white rounded hover:bg-primary/90"
                    >
                        <span className="material-symbols-outlined text-sm">check</span>
                    </button>
                </div>
            )}

            {/* Folder Tree */}
            {rootFolders.length > 0 && (
                <div className="space-y-0.5">
                    {rootFolders.map(folder => renderFolder(folder, 0))}
                </div>
            )}

            {rootFolders.length === 0 && !showNewFolderInput && (
                <div className="text-center py-4 text-gray-400 text-xs">
                    {isVendor ? 'Click "+" para crear carpetas' : 'Sin carpetas'}
                </div>
            )}

            {/* Delete Confirmation */}
            {deleteTarget && (
                <ConfirmDeleteModal
                    title="¿Eliminar carpeta?"
                    message={`Se eliminará "${deleteTarget.name}" y todas sus subcarpetas y archivos permanentemente.`}
                    onConfirm={async () => {
                        await onDeleteFolder(deleteTarget.id);
                        setDeleteTarget(null);
                    }}
                    onCancel={() => setDeleteTarget(null)}
                />
            )}
        </div>
    );
};

export default FolderTree;
