import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import Header from './Header';
import FAQWidget from './FAQWidget';

interface AdminLayoutProps {
  children: React.ReactNode;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(() => window.innerWidth >= 768);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setIsSidebarOpen(false);
      } else {
        setIsSidebarOpen(true);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

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

        {/* Mobile Sidebar Backdrop */}
        {isSidebarOpen && (
          <div
            className="fixed inset-0 bg-black/50 z-40 md:hidden"
            onClick={() => setIsSidebarOpen(false)}
          ></div>
        )}

        {/* Sidebar */}
        <aside
          className={`
            bg-gray-900 text-gray-300 border-r border-gray-800 flex-shrink-0 transition-transform duration-300 flex flex-col z-50
            fixed inset-y-0 left-0 h-full shadow-xl md:shadow-none
            ${isSidebarOpen ? 'w-64 translate-x-0' : 'w-0 -translate-x-full overflow-hidden md:w-20 md:translate-x-0'}
            md:relative md:sticky md:top-20 md:h-[calc(100vh-80px)]
          `}
        >
          <div className={`p-4 py-6 flex-1 w-64 ${!isSidebarOpen && 'md:items-center'}`}>
            <div className="md:hidden flex justify-between items-center mb-6 text-white px-2">
              <span className="font-bold">Menú Admin</span>
              <button onClick={() => setIsSidebarOpen(false)} className="text-gray-400 hover:text-white">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <nav className="space-y-1">
              {menuItems.map((item, index) => (
                <Link
                  key={index}
                  to={item.path}
                  onClick={() => window.innerWidth < 768 && setIsSidebarOpen(false)}
                  className={`
                        flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium transition-all
                        ${isActive(item.path)
                      ? 'bg-primary text-white'
                      : 'hover:bg-gray-800 hover:text-white'}
                        ${!isSidebarOpen && 'md:justify-center md:px-2'}
                        `}
                  title={!isSidebarOpen ? item.label : ''}
                >
                  <span className="material-symbols-outlined">{item.icon}</span>
                  <span className={`${!isSidebarOpen && 'md:hidden'}`}>{item.label}</span>
                  {item.badge && (isSidebarOpen || window.innerWidth < 768) && (
                    <span className="ml-auto bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">{item.badge}</span>
                  )}
                </Link>
              ))}
            </nav>
          </div>

          {/* Logout Section */}
          <div className="p-4 border-t border-gray-800">
            <button
              onClick={() => { localStorage.removeItem('ai_dev_user'); navigate('/'); }}
              className={`flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium text-red-400 hover:bg-red-900/20 hover:text-red-300 transition-all w-full ${!isSidebarOpen && 'md:justify-center md:px-2'}`}
              title="Cerrar Sesión"
            >
              <span className="material-symbols-outlined">logout</span>
              <span className={`${!isSidebarOpen && 'md:hidden'}`}>Cerrar Sesión</span>
            </button>
          </div>
        </aside>

        {/* Content */}
        <main className="flex-1 min-w-0">
          {/* Mobile/Desktop Toggle Bar */}
          <div className="bg-white border-b border-gray-200 px-4 py-3 sticky top-20 z-30 flex items-center md:bg-transparent md:border-none md:static md:z-auto md:p-0 md:mb-6">
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-2 text-gray-600 hover:bg-gray-100 rounded-md md:text-gray-400 md:hover:text-gray-900"
            >
              <span className="material-symbols-outlined">{isSidebarOpen ? 'menu_open' : 'menu'}</span>
            </button>
            <h2 className="ml-3 font-bold text-gray-900 md:hidden">Panel de Admin</h2>
          </div>

          <div className="max-w-6xl mx-auto p-4 md:p-8 md:pt-0">
            {children}
          </div>
        </main>
      </div>
      <FAQWidget />
    </div>
  );
};

export default AdminLayout;