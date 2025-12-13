import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import Header from './Header';
import FAQWidget from './FAQWidget';

interface AdminLayoutProps {
  children: React.ReactNode;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const isActive = (path: string) => location.pathname === path || location.pathname.startsWith(path + '/');

  const menuItems = [
    { label: 'Dashboard', path: '/admin/dashboard', icon: 'dashboard' },
    { label: 'Usuarios', path: '/admin/users', icon: 'group' },
    { label: 'Disputas', path: '/admin/disputes', icon: 'gavel', badge: 2 },
    { label: 'Métricas', path: '/admin/metrics', icon: 'analytics' },
    { label: 'Plataforma', path: '/admin/platform', icon: 'tune' },
    { label: 'Configuración', path: '/admin/settings', icon: 'settings' },
  ];

  return (
    <div className="flex flex-col bg-gray-50 min-h-screen">
      <Header />
      
      <div className="flex flex-1 max-w-[1920px] mx-auto w-full relative">
        
        {/* Sidebar */}
        <aside 
          className={`
            bg-gray-900 text-gray-300 border-r border-gray-800 flex-shrink-0 sticky top-20 h-[calc(100vh-80px)] overflow-y-auto transition-all duration-300
            ${isSidebarOpen ? 'w-64' : 'w-0 overflow-hidden md:w-20'}
            hidden md:block
          `}
        >
           <div className="p-4 py-6">
              <nav className="space-y-1">
                 {menuItems.map((item, index) => (
                    <Link 
                        key={index}
                        to={item.path} 
                        className={`
                        flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium transition-all
                        ${isActive(item.path) 
                            ? 'bg-primary text-white' 
                            : 'hover:bg-gray-800 hover:text-white'}
                        `}
                    >
                        <span className="material-symbols-outlined">{item.icon}</span>
                        <span className={`${!isSidebarOpen && 'hidden'}`}>{item.label}</span>
                        {item.badge && isSidebarOpen && (
                            <span className="ml-auto bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">{item.badge}</span>
                        )}
                    </Link>
                 ))}
              </nav>
           </div>
        </aside>

        {/* Content */}
        <main className="flex-1 p-6 md:p-8">
           <div className="max-w-6xl mx-auto">
              {children}
           </div>
        </main>
      </div>
      <FAQWidget />
    </div>
  );
};

export default AdminLayout;