import React, { useState, useRef, useEffect } from 'react';
import ClientLayout from '../../components/ClientLayout';
import Modal from '../../components/Modal';

interface Folder {
    id: string;
    name: string;
    filesCount: number;
    updated: string;
}

interface FileItem {
    id: string;
    name: string;
    type: string;
    size: string;
    date: string;
    uploader: string;
}

const ClientProjectFiles: React.FC = () => {
  // Navigation State
  const [currentFolder, setCurrentFolder] = useState<Folder | null>(null);
  
  // Search State
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProject, setSelectedProject] = useState({
      name: 'Motor de Recomendación con IA',
      vendor: 'QuantumLeap AI',
      id: '1'
  });
  const searchRef = useRef<HTMLDivElement>(null);

  // Interaction State
  const [isDragging, setIsDragging] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<{type: 'folder'|'file', id: string, name: string} | null>(null);
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);

  // Mock Data
  const projects = [
      { id: '1', name: 'Motor de Recomendación con IA', vendor: 'QuantumLeap AI', status: 'Activo' },
      { id: '2', name: 'Chatbot de Soporte al Cliente', vendor: 'InnovateAI Corp', status: 'Activo' },
  ];

  const folders: Folder[] = [
    { id: 'f1', name: 'Documentación Legal', filesCount: 3, updated: '2 días' },
    { id: 'f2', name: 'Diseños UI/UX', filesCount: 12, updated: '5 horas' },
    { id: 'f3', name: 'Especificaciones Técnicas', filesCount: 5, updated: '1 semana' },
    { id: 'f4', name: 'Entregables Finales', filesCount: 0, updated: '-' }
  ];

  // Files are "mocked" to change based on folder, for demo purposes we just show same list
  const files: FileItem[] = [
    { id: 'fi1', name: 'Contrato_v2_Firmado.pdf', type: 'pdf', size: '2.4 MB', date: '15 Ago, 2024', uploader: 'Ana Torres' },
    { id: 'fi2', name: 'Wireframes_Home_v3.fig', type: 'figma', size: '15 MB', date: '14 Ago, 2024', uploader: 'QuantumLeap AI' },
    { id: 'fi3', name: 'Brief_Inicial.docx', type: 'doc', size: '1.1 MB', date: '10 Jul, 2024', uploader: 'Ana Torres' },
    { id: 'fi4', name: 'Arquitectura_Sistema.png', type: 'img', size: '5.6 MB', date: '01 Ago, 2024', uploader: 'QuantumLeap AI' }
  ];

  const filteredProjects = projects.filter(p => 
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      p.vendor.toLowerCase().includes(searchQuery.toLowerCase())
  );

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsSearchOpen(false);
      }
      
      // Close menu if clicking outside
      if (activeMenuId && !(event.target as Element).closest('.folder-menu-trigger')) {
          setActiveMenuId(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [activeMenuId]);

  const handleDragOver = (e: React.DragEvent) => { e.preventDefault(); setIsDragging(true); };
  const handleDragLeave = () => { setIsDragging(false); };
  const handleDrop = (e: React.DragEvent) => { e.preventDefault(); setIsDragging(false); console.log('Dropped'); };

  const handleDeleteConfirm = () => {
      // Logic to delete itemToDelete
      console.log('Deleting', itemToDelete);
      setItemToDelete(null);
  };

  const getIcon = (type: string) => {
    if (type === 'pdf') return 'picture_as_pdf';
    if (type === 'figma' || type === 'img') return 'image';
    if (type === 'doc') return 'description';
    return 'insert_drive_file';
  };

  const getColor = (type: string) => {
    if (type === 'pdf') return 'text-red-500 bg-red-50';
    if (type === 'figma') return 'text-purple-500 bg-purple-50';
    if (type === 'img') return 'text-blue-500 bg-blue-50';
    if (type === 'doc') return 'text-blue-700 bg-blue-50';
    return 'text-gray-500 bg-gray-50';
  };

  return (
    <ClientLayout>
      <div className="space-y-6">
        
        {/* Project Selector - ONLY Show at Root Level */}
        {!currentFolder && (
            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex flex-col md:flex-row justify-between items-center gap-4 relative z-20 animate-in slide-in-from-top-2 duration-300">
                <div className="w-full md:w-auto flex-1" ref={searchRef}>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Proyecto Seleccionado</label>
                    <div className="relative">
                    <button 
                        onClick={() => setIsSearchOpen(!isSearchOpen)}
                        className="w-full md:w-96 flex items-center justify-between bg-gray-50 border border-gray-200 hover:bg-white hover:border-gray-300 text-gray-900 text-left rounded-xl px-4 py-3 transition-all group"
                    >
                        <div>
                            <span className="block font-bold text-lg leading-tight">{selectedProject.name}</span>
                            <span className="text-xs text-gray-500 font-medium">{selectedProject.vendor}</span>
                        </div>
                        <span className="material-symbols-outlined text-gray-400 group-hover:text-gray-600">expand_more</span>
                    </button>
                    {isSearchOpen && (
                        <div className="absolute top-full left-0 w-full md:w-[450px] bg-white rounded-xl shadow-floating border border-gray-100 mt-2 p-2 animate-in fade-in zoom-in-95 duration-200">
                            <div className="relative mb-2">
                                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">search</span>
                                <input 
                                type="text" placeholder="Buscar..." 
                                className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                                value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} autoFocus
                                />
                            </div>
                            <div className="max-h-60 overflow-y-auto space-y-1">
                                {filteredProjects.map(p => (
                                <button 
                                    key={p.id}
                                    onClick={() => { setSelectedProject(p); setIsSearchOpen(false); setSearchQuery(''); }}
                                    className={`w-full text-left px-3 py-2 rounded-lg flex justify-between items-center group transition-colors ${selectedProject.id === p.id ? 'bg-primary/5' : 'hover:bg-gray-50'}`}
                                >
                                    <div><p className={`font-bold text-sm ${selectedProject.id === p.id ? 'text-primary' : 'text-gray-900'}`}>{p.name}</p><p className="text-xs text-gray-500">{p.vendor}</p></div>
                                    {selectedProject.id === p.id && <span className="material-symbols-outlined text-primary text-sm">check</span>}
                                </button>
                                ))}
                            </div>
                        </div>
                    )}
                    </div>
                </div>
            </div>
        )}

        {/* REPOSITORY VIEW */}
        <div className="space-y-4">
            
            {/* Header / Breadcrumb / Actions */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    {currentFolder ? (
                        <>
                            <button onClick={() => setCurrentFolder(null)} className="text-gray-500 hover:text-dark font-bold text-lg">Repositorio</button>
                            <span className="material-symbols-outlined text-gray-400">chevron_right</span>
                            <h1 className="text-xl font-black text-gray-900">{currentFolder.name}</h1>
                        </>
                    ) : (
                        <h1 className="text-2xl font-black text-gray-900">Repositorio</h1>
                    )}
                </div>
                {/* Create Action */}
                {!currentFolder && (
                    <button className="flex items-center gap-1 text-sm font-bold text-primary hover:bg-primary/5 px-3 py-2 rounded-lg transition-colors">
                        <span className="material-symbols-outlined text-lg">create_new_folder</span> Nueva Carpeta
                    </button>
                )}
            </div>

            {/* Folder Grid (Root View) */}
            {!currentFolder && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 animate-in fade-in duration-300">
                    {folders.map((folder) => (
                    <div 
                        key={folder.id} 
                        onDoubleClick={() => setCurrentFolder(folder)}
                        className="p-4 bg-white border border-gray-200 rounded-xl hover:shadow-md transition-all cursor-pointer group relative select-none"
                    >
                        <div className="flex justify-between items-start mb-3">
                            <span className="material-symbols-outlined text-4xl text-amber-300 group-hover:text-amber-400 transition-colors">folder</span>
                            <div className="relative">
                                <button 
                                    className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100 folder-menu-trigger" 
                                    onClick={(e) => { e.stopPropagation(); setActiveMenuId(activeMenuId === folder.id ? null : folder.id); }}
                                >
                                    <span className="material-symbols-outlined text-lg">more_vert</span>
                                </button>
                                {activeMenuId === folder.id && (
                                    <div className="absolute right-0 top-8 bg-white shadow-card border border-gray-100 rounded-lg p-1 z-10 w-32 animate-in fade-in zoom-in-95 duration-100">
                                        <button className="w-full text-left px-3 py-2 text-xs font-medium hover:bg-gray-50 rounded flex items-center gap-2">
                                            <span className="material-symbols-outlined text-sm">edit</span> Editar
                                        </button>
                                        <button 
                                            className="w-full text-left px-3 py-2 text-xs font-medium hover:bg-red-50 text-red-600 rounded flex items-center gap-2"
                                            onClick={(e) => { e.stopPropagation(); setItemToDelete({type: 'folder', id: folder.id, name: folder.name}); setActiveMenuId(null); }}
                                        >
                                            <span className="material-symbols-outlined text-sm">delete</span> Borrar
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                        <h3 className="font-bold text-gray-900 truncate">{folder.name}</h3>
                        <p className="text-xs text-gray-500 mt-1">{folder.filesCount} archivos • {folder.updated}</p>
                    </div>
                    ))}
                </div>
            )}

            {/* Inside Folder View */}
            {currentFolder && (
                <div className="space-y-6 animate-in slide-in-from-right-4 fade-in duration-300">
                    {/* Compact Drag & Drop */}
                    <div 
                        onDragOver={handleDragOver} onDragLeave={handleDragLeave} onDrop={handleDrop}
                        className={`w-full border-2 border-dashed rounded-lg p-4 flex items-center justify-center gap-4 transition-all cursor-pointer ${isDragging ? 'border-primary bg-primary/5' : 'border-gray-300 hover:bg-gray-50'}`}
                    >
                        <div className="w-10 h-10 bg-blue-50 text-[#1313ec] rounded-full flex items-center justify-center flex-shrink-0">
                            <span className="material-symbols-outlined">cloud_upload</span>
                        </div>
                        <div>
                            <p className="text-sm font-bold text-gray-900">Arrastra archivos aquí para subir</p>
                            <p className="text-xs text-gray-500">o <span className="text-primary hover:underline">haz clic para explorar</span></p>
                        </div>
                    </div>

                    {/* Files List inside Folder */}
                    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
                        <table className="w-full text-left">
                        <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                                <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Nombre</th>
                                <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Detalles</th>
                                <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase text-right">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {files.map((file) => (
                            <tr key={file.id} className="hover:bg-gray-50 transition-colors cursor-default">
                                <td className="px-6 py-3">
                                <div className="flex items-center gap-3">
                                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${getColor(file.type)}`}>
                                    <span className="material-symbols-outlined text-lg">{getIcon(file.type)}</span>
                                    </div>
                                    <span className="font-medium text-sm text-gray-900">{file.name}</span>
                                </div>
                                </td>
                                <td className="px-6 py-3 text-xs text-gray-500">
                                    {file.size} • {file.date}
                                </td>
                                <td className="px-6 py-3 text-right">
                                <div className="flex justify-end gap-1">
                                    <button className="p-1.5 text-gray-400 hover:text-dark rounded hover:bg-gray-200" title="Ver"><span className="material-symbols-outlined text-lg">visibility</span></button>
                                    <button className="p-1.5 text-gray-400 hover:text-primary rounded hover:bg-gray-200" title="Descargar"><span className="material-symbols-outlined text-lg">download</span></button>
                                    <button 
                                        className="p-1.5 text-gray-400 hover:text-red-600 rounded hover:bg-red-50" 
                                        title="Eliminar"
                                        onClick={() => setItemToDelete({type: 'file', id: file.id, name: file.name})}
                                    >
                                        <span className="material-symbols-outlined text-lg">delete</span>
                                    </button>
                                </div>
                                </td>
                            </tr>
                            ))}
                        </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Global Recent Files (Only visible at root or separate section) */}
            {!currentFolder && (
                <div className="pt-4">
                    <h2 className="text-lg font-bold text-gray-900 mb-4">Archivos Recientes</h2>
                    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
                        <table className="w-full text-left">
                        <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                            <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Nombre</th>
                            <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase hidden sm:table-cell">Subido por</th>
                            <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase text-right">Descarga</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {files.slice(0,3).map((file, i) => (
                            <tr key={i} className="hover:bg-gray-50 transition-colors">
                                <td className="px-6 py-3">
                                <div className="flex items-center gap-3">
                                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${getColor(file.type)}`}>
                                        <span className="material-symbols-outlined text-lg">{getIcon(file.type)}</span>
                                    </div>
                                    <div>
                                        <p className="font-medium text-sm text-gray-900">{file.name}</p>
                                        <p className="text-xs text-gray-400 sm:hidden">{file.date}</p>
                                    </div>
                                </div>
                                </td>
                                <td className="px-6 py-3 text-sm text-gray-500 hidden sm:table-cell">{file.uploader} • {file.date}</td>
                                <td className="px-6 py-3 text-right">
                                    <button className="p-2 text-gray-500 hover:text-primary hover:bg-gray-100 rounded-full transition-colors">
                                        <span className="material-symbols-outlined text-xl">download</span>
                                    </button>
                                </td>
                            </tr>
                            ))}
                        </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <Modal isOpen={!!itemToDelete} onClose={() => setItemToDelete(null)} title={`¿Eliminar ${itemToDelete?.type === 'folder' ? 'Carpeta' : 'Archivo'}?`}>
          <div className="space-y-4">
              <p className="text-gray-600">
                  Estás a punto de eliminar <span className="font-bold text-gray-900">"{itemToDelete?.name}"</span>. 
                  {itemToDelete?.type === 'folder' && ' Todo su contenido será eliminado permanentemente.'}
                  <br/>Esta acción no se puede deshacer.
              </p>
              <div className="flex justify-end gap-3 pt-2">
                  <button onClick={() => setItemToDelete(null)} className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-lg transition-colors">Cancelar</button>
                  <button onClick={handleDeleteConfirm} className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg transition-colors">Sí, eliminar</button>
              </div>
          </div>
      </Modal>

    </ClientLayout>
  );
};

export default ClientProjectFiles;