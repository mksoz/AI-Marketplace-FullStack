import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminLayout from '../../components/AdminLayout';
import Modal from '../../components/Modal';

// Mock Data Interfaces
interface User {
    id: string;
    name: string;
    email: string;
    role: 'client' | 'vendor' | 'admin';
    status: 'active' | 'pending' | 'suspended';
    joinDate: string;
    financials: string; // Spent or Earned
    avatar: string;
}

const AdminUsers: React.FC = () => {
  const navigate = useNavigate();
  
  // State
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  
  // Edit State
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // Create State
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newUser, setNewUser] = useState({
      name: '',
      email: '',
      role: 'client',
      password: ''
  });

  // Mock Users Data
  const [users, setUsers] = useState<User[]>([
      { id: '1', name: 'QuantumLeap AI', email: 'contact@quantumleap.ai', role: 'vendor', status: 'active', joinDate: '15/01/2023', financials: '$120k Earned', avatar: 'https://picsum.photos/id/40/200/200' },
      { id: '2', name: 'Cliente Corp', email: 'ana@clientecorp.com', role: 'client', status: 'active', joinDate: '20/02/2023', financials: '$45k Spent', avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD56sMogw_VBB9yDp-jxxYeihYrC8RGmccLUN9_8TyhtQFMfYRISR5MkcUL3DhYdjP1W0idTNuYYx4IYzTgsCsrrcJaTze-5aPqLr5-AdStPpGbPg-2H_HeF5zIOU2rNNB5Lxf5iOdEDlFBsR52qtxTSD2vGaLIYzxsMLLYLyKYXQTRRtzfZLohcIfqB5u2JzB7FilkC1Z1O-blivYoU_3uGvwBDlTeW3TCocCvcIy_2FoXiX5_TXgdkdB_hgJ3-uGTBLmqDSTeAU8' },
      { id: '3', name: 'DevStudio X', email: 'hello@devstudio.com', role: 'vendor', status: 'pending', joinDate: '10/08/2024', financials: '$0 Earned', avatar: 'https://ui-avatars.com/api/?name=DevStudio+X&background=random' },
      { id: '4', name: 'Bad Actor Inc', email: 'spam@badactor.com', role: 'client', status: 'suspended', joinDate: '01/05/2024', financials: '$0 Spent', avatar: 'https://ui-avatars.com/api/?name=Bad+Actor&background=000&color=fff' },
      { id: '5', name: 'Super Admin', email: 'admin@platform.com', role: 'admin', status: 'active', joinDate: '01/01/2023', financials: '-', avatar: 'https://ui-avatars.com/api/?name=Super+Admin&background=000&color=fff' },
      { id: '6', name: 'InnovateAI', email: 'info@innovate.com', role: 'vendor', status: 'active', joinDate: '12/03/2023', financials: '$85k Earned', avatar: 'https://picsum.photos/id/50/200/200' },
  ]);

  // Derived State (Filtering)
  const filteredUsers = useMemo(() => {
      return users.filter(user => {
          const matchesSearch = user.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                                user.email.toLowerCase().includes(searchQuery.toLowerCase());
          const matchesRole = roleFilter === 'all' || user.role === roleFilter;
          const matchesStatus = statusFilter === 'all' || user.status === statusFilter;
          
          return matchesSearch && matchesRole && matchesStatus;
      });
  }, [users, searchQuery, roleFilter, statusFilter]);

  // Handlers
  const handleEditClick = (user: User) => {
      setSelectedUser(user);
      setIsEditModalOpen(true);
  };

  const handleSaveUser = (e: React.FormEvent) => {
      e.preventDefault();
      if (selectedUser) {
          setUsers(users.map(u => u.id === selectedUser.id ? selectedUser : u));
          setIsEditModalOpen(false);
          setSelectedUser(null);
      }
  };

  const handleCreateUser = (e: React.FormEvent) => {
      e.preventDefault();
      const createdUser: User = {
          id: (users.length + 1).toString(),
          name: newUser.name,
          email: newUser.email,
          role: newUser.role as any,
          status: 'active',
          joinDate: new Date().toLocaleDateString('es-ES'),
          financials: '$0',
          avatar: `https://ui-avatars.com/api/?name=${newUser.name}&background=random`
      };
      setUsers([...users, createdUser]);
      setIsCreateModalOpen(false);
      setNewUser({ name: '', email: '', role: 'client', password: '' });
  };

  const handleStatusChange = (newStatus: 'active' | 'pending' | 'suspended') => {
      if (selectedUser) {
          setSelectedUser({ ...selectedUser, status: newStatus });
      }
  };

  const navigateToProfile = () => {
      if (!selectedUser) return;
      // In a real app, this would go to dynamic profile routes
      if (selectedUser.role === 'vendor') {
          navigate(`/company/${selectedUser.id}`);
      } else {
          // Simulate generic profile view for clients/admins
          alert(`Navegando al perfil público de ${selectedUser.name}`);
      }
      setIsEditModalOpen(false);
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
         
         {/* Page Header */}
         <div className="flex flex-col md:flex-row justify-between items-end gap-4">
            <div>
               <h1 className="text-3xl font-black text-gray-900">Gestión de Usuarios</h1>
               <p className="text-gray-500 mt-1">Administra clientes, vendors y permisos del sistema.</p>
            </div>
            <button 
                onClick={() => setIsCreateModalOpen(true)}
                className="bg-primary text-white px-5 py-2.5 rounded-xl text-sm font-bold shadow-sm hover:opacity-90 flex items-center gap-2 transition-transform hover:-translate-y-0.5"
            >
                <span className="material-symbols-outlined text-lg">person_add</span>
                Nuevo Usuario
            </button>
         </div>

         {/* Advanced Filters Toolbar */}
         <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex flex-col lg:flex-row gap-4">
             {/* Search */}
             <div className="flex-1 relative">
                 <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">search</span>
                 <input 
                    type="text" 
                    placeholder="Buscar por nombre o email..." 
                    className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                 />
             </div>

             {/* Filters */}
             <div className="flex gap-3 overflow-x-auto pb-2 lg:pb-0">
                 <select 
                    value={roleFilter}
                    onChange={(e) => setRoleFilter(e.target.value)}
                    className="bg-white border border-gray-200 text-gray-700 text-sm font-medium rounded-lg px-4 py-2.5 outline-none focus:border-primary cursor-pointer hover:bg-gray-50"
                 >
                     <option value="all">Todos los Roles</option>
                     <option value="client">Clientes</option>
                     <option value="vendor">Vendors</option>
                     <option value="admin">Admins</option>
                 </select>

                 <select 
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="bg-white border border-gray-200 text-gray-700 text-sm font-medium rounded-lg px-4 py-2.5 outline-none focus:border-primary cursor-pointer hover:bg-gray-50"
                 >
                     <option value="all">Todos los Estados</option>
                     <option value="active">Activos</option>
                     <option value="pending">Pendientes</option>
                     <option value="suspended">Suspendidos</option>
                 </select>
             </div>
         </div>

         {/* Users Table */}
         <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
             <div className="overflow-x-auto">
                 <table className="w-full text-left">
                     <thead className="bg-gray-50 border-b border-gray-200">
                         <tr>
                             <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Usuario</th>
                             <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Rol</th>
                             <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Estado</th>
                             <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Registro</th>
                             <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Finanzas</th>
                             <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase text-right">Acciones</th>
                         </tr>
                     </thead>
                     <tbody className="divide-y divide-gray-100">
                         {filteredUsers.length > 0 ? (
                             filteredUsers.map(user => (
                                 <tr key={user.id} className="hover:bg-gray-50 transition-colors group">
                                     <td className="px-6 py-4">
                                         <div className="flex items-center gap-3">
                                             <img src={user.avatar} alt={user.name} className="w-10 h-10 rounded-full object-cover border border-gray-200" />
                                             <div>
                                                 <p className="font-bold text-gray-900 text-sm">{user.name}</p>
                                                 <p className="text-xs text-gray-500">{user.email}</p>
                                             </div>
                                         </div>
                                     </td>
                                     <td className="px-6 py-4">
                                         <span className={`px-2.5 py-1 rounded-md text-xs font-bold capitalize border ${
                                             user.role === 'admin' ? 'bg-purple-50 text-purple-700 border-purple-100' :
                                             user.role === 'vendor' ? 'bg-blue-50 text-blue-700 border-blue-100' :
                                             'bg-gray-50 text-gray-700 border-gray-200'
                                         }`}>
                                             {user.role}
                                         </span>
                                     </td>
                                     <td className="px-6 py-4">
                                         <span className={`flex items-center gap-1.5 text-xs font-bold capitalize ${
                                             user.status === 'active' ? 'text-green-600' :
                                             user.status === 'pending' ? 'text-amber-600' :
                                             'text-red-600'
                                         }`}>
                                             <span className={`w-2 h-2 rounded-full ${
                                                 user.status === 'active' ? 'bg-green-500' :
                                                 user.status === 'pending' ? 'bg-amber-500' :
                                                 'bg-red-500'
                                             }`}></span>
                                             {user.status === 'active' ? 'Activo' : user.status === 'pending' ? 'Pendiente' : 'Suspendido'}
                                         </span>
                                     </td>
                                     <td className="px-6 py-4 text-sm text-gray-600">{user.joinDate}</td>
                                     <td className="px-6 py-4 text-sm font-medium text-gray-900">{user.financials}</td>
                                     <td className="px-6 py-4 text-right">
                                         <button 
                                            onClick={() => handleEditClick(user)}
                                            className="text-gray-400 hover:text-primary p-2 hover:bg-gray-100 rounded-lg transition-colors"
                                            title="Editar Usuario"
                                         >
                                             <span className="material-symbols-outlined text-lg">edit</span>
                                         </button>
                                     </td>
                                 </tr>
                             ))
                         ) : (
                             <tr>
                                 <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                                     <span className="material-symbols-outlined text-4xl text-gray-300 mb-2">search_off</span>
                                     <p>No se encontraron usuarios con los filtros actuales.</p>
                                 </td>
                             </tr>
                         )}
                     </tbody>
                 </table>
             </div>
             
             {/* Pagination (Mock) */}
             <div className="px-6 py-4 border-t border-gray-200 flex justify-between items-center bg-gray-50">
                 <p className="text-xs text-gray-500">Mostrando {filteredUsers.length} de {users.length} usuarios</p>
                 <div className="flex gap-2">
                     <button className="p-1 rounded hover:bg-gray-200 disabled:opacity-50" disabled><span className="material-symbols-outlined text-lg">chevron_left</span></button>
                     <button className="p-1 rounded hover:bg-gray-200"><span className="material-symbols-outlined text-lg">chevron_right</span></button>
                 </div>
             </div>
         </div>
      </div>

      {/* Edit User Modal */}
      <Modal isOpen={isEditModalOpen} onClose={() => { setIsEditModalOpen(false); setSelectedUser(null); }} title="Editar Usuario">
          {selectedUser && (
              <form onSubmit={handleSaveUser} className="space-y-6">
                  {/* Avatar & Header */}
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100">
                      <div className="flex items-center gap-4">
                        <img src={selectedUser.avatar} alt="Avatar" className="w-16 h-16 rounded-full object-cover border-2 border-white shadow-sm" />
                        <div>
                            <h3 className="font-bold text-gray-900">{selectedUser.name}</h3>
                            <p className="text-xs text-gray-500">ID: {selectedUser.id}</p>
                        </div>
                      </div>
                      <button 
                        type="button" 
                        onClick={navigateToProfile}
                        className="text-primary text-xs font-bold hover:underline flex items-center gap-1 bg-white px-3 py-1.5 rounded-lg border border-gray-200 hover:bg-gray-50"
                      >
                          <span className="material-symbols-outlined text-sm">visibility</span>
                          Ver Perfil
                      </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                          <label className="block text-xs font-bold text-gray-700 mb-1.5">Nombre Completo</label>
                          <input 
                            type="text" 
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 outline-none bg-white text-gray-900"
                            value={selectedUser.name}
                            onChange={(e) => setSelectedUser({...selectedUser, name: e.target.value})}
                          />
                      </div>
                      <div>
                          <label className="block text-xs font-bold text-gray-700 mb-1.5">Email</label>
                          <input 
                            type="email" 
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 outline-none bg-gray-50 text-gray-500 cursor-not-allowed"
                            value={selectedUser.email}
                            readOnly
                          />
                      </div>
                      <div>
                          <label className="block text-xs font-bold text-gray-700 mb-1.5">Rol</label>
                          <select 
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 outline-none bg-white text-gray-900"
                            value={selectedUser.role}
                            onChange={(e) => setSelectedUser({...selectedUser, role: e.target.value as any})}
                          >
                              <option value="client">Cliente</option>
                              <option value="vendor">Vendor</option>
                              <option value="admin">Administrador</option>
                          </select>
                      </div>
                      <div>
                          <label className="block text-xs font-bold text-gray-700 mb-1.5">Estado</label>
                          <select 
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 outline-none bg-white text-gray-900"
                            value={selectedUser.status}
                            onChange={(e) => setSelectedUser({...selectedUser, status: e.target.value as any})}
                          >
                              <option value="active">Activo</option>
                              <option value="pending">Pendiente de Verificación</option>
                              <option value="suspended">Suspendido</option>
                          </select>
                      </div>
                  </div>

                  {/* Actions Section */}
                  <div className="border-t border-gray-100 pt-4">
                      <p className="text-xs font-bold text-gray-500 uppercase mb-3">Acciones Rápidas</p>
                      <div className="flex gap-3 flex-wrap">
                          {selectedUser.status === 'pending' && (
                              <button 
                                type="button" 
                                onClick={() => handleStatusChange('active')}
                                className="px-3 py-1.5 bg-green-100 text-green-700 text-xs font-bold rounded-lg hover:bg-green-200 transition-colors flex items-center gap-1"
                              >
                                  <span className="material-symbols-outlined text-sm">verified</span> Aprobar Vendor
                              </button>
                          )}
                          <button type="button" className="px-3 py-1.5 bg-gray-100 text-gray-700 text-xs font-bold rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-1">
                              <span className="material-symbols-outlined text-sm">lock_reset</span> Reset Password
                          </button>
                          {selectedUser.status !== 'suspended' && (
                              <button 
                                type="button" 
                                onClick={() => handleStatusChange('suspended')}
                                className="px-3 py-1.5 bg-red-50 text-red-600 text-xs font-bold rounded-lg hover:bg-red-100 transition-colors flex items-center gap-1"
                              >
                                  <span className="material-symbols-outlined text-sm">block</span> Suspender
                              </button>
                          )}
                      </div>
                  </div>

                  <div className="flex justify-end gap-3 pt-2">
                      <button 
                        type="button" 
                        onClick={() => { setIsEditModalOpen(false); setSelectedUser(null); }}
                        className="px-4 py-2 bg-white border border-gray-300 text-gray-700 font-bold rounded-lg text-sm hover:bg-gray-50 transition-colors"
                      >
                          Cancelar
                      </button>
                      <button 
                        type="submit" 
                        className="px-6 py-2 bg-dark text-white font-bold rounded-lg text-sm hover:bg-black transition-colors"
                      >
                          Guardar Cambios
                      </button>
                  </div>
              </form>
          )}
      </Modal>

      {/* Create User Modal */}
      <Modal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} title="Crear Nuevo Usuario">
          <form onSubmit={handleCreateUser} className="space-y-6">
              <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 flex gap-3">
                  <span className="material-symbols-outlined text-blue-600">info</span>
                  <p className="text-xs text-blue-800">El usuario recibirá un correo electrónico para configurar su contraseña. Aquí se genera una cuenta base.</p>
              </div>

              <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1.5">Nombre Completo</label>
                  <input 
                    type="text" 
                    placeholder="Ej. Juan Pérez"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 outline-none bg-white text-gray-900"
                    value={newUser.name}
                    onChange={(e) => setNewUser({...newUser, name: e.target.value})}
                    required
                  />
              </div>
              
              <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1.5">Correo Electrónico</label>
                  <input 
                    type="email" 
                    placeholder="usuario@dominio.com"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 outline-none bg-white text-gray-900"
                    value={newUser.email}
                    onChange={(e) => setNewUser({...newUser, email: e.target.value})}
                    required
                  />
              </div>

              <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1.5">Rol Inicial</label>
                  <div className="grid grid-cols-2 gap-3">
                      <label className={`border rounded-lg p-3 cursor-pointer flex items-center gap-2 transition-all ${newUser.role === 'client' ? 'border-primary bg-primary/5' : 'border-gray-200 hover:border-gray-300'}`}>
                          <input type="radio" name="role" value="client" className="hidden" checked={newUser.role === 'client'} onChange={() => setNewUser({...newUser, role: 'client'})} />
                          <span className="material-symbols-outlined text-gray-500">domain</span>
                          <span className="text-sm font-medium">Cliente</span>
                      </label>
                      <label className={`border rounded-lg p-3 cursor-pointer flex items-center gap-2 transition-all ${newUser.role === 'vendor' ? 'border-primary bg-primary/5' : 'border-gray-200 hover:border-gray-300'}`}>
                          <input type="radio" name="role" value="vendor" className="hidden" checked={newUser.role === 'vendor'} onChange={() => setNewUser({...newUser, role: 'vendor'})} />
                          <span className="material-symbols-outlined text-gray-500">code</span>
                          <span className="text-sm font-medium">Vendor</span>
                      </label>
                  </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                  <button 
                    type="button" 
                    onClick={() => setIsCreateModalOpen(false)}
                    className="px-4 py-2 bg-white border border-gray-300 text-gray-700 font-bold rounded-lg text-sm hover:bg-gray-50 transition-colors"
                  >
                      Cancelar
                  </button>
                  <button 
                    type="submit" 
                    className="px-6 py-2 bg-dark text-white font-bold rounded-lg text-sm hover:bg-black transition-colors"
                  >
                      Crear Usuario
                  </button>
              </div>
          </form>
      </Modal>
    </AdminLayout>
  );
};

export default AdminUsers;