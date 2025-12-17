import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import Header from './Header';
import FAQWidget from './FAQWidget';

interface VendorLayoutProps {
  children: React.ReactNode;
  fullHeight?: boolean;
}

const VendorLayout: React.FC<VendorLayoutProps> = ({ children, fullHeight = false }) => {
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
  const [expandedMenus, setExpandedMenus] = useState<string[]>([]);

  const isActive = (path: string, exact = false) => {
    if (exact) return location.pathname === path;
    return location.pathname.startsWith(path);
  };

  const toggleMenu = (path: string, e: React.MouseEvent) => {
    e.preventDefault();
    if (expandedMenus.includes(path)) {
      setExpandedMenus(expandedMenus.filter(p => p !== path));
    } else {
      setExpandedMenus([...expandedMenus, path]);
    }
  };

  const menuItems = [
    {
      label: 'Dashboard',
      path: '/vendor/dashboard',
      icon: 'dashboard',
      exact: true
    },
    {
      label: 'Mis Proyectos',
      path: '/vendor/projects',
      icon: 'rocket_launch'
    },
    {
      label: 'Mis Propuestas',
      path: '/vendor/proposals',
      icon: 'description'
    },
    {
      label: 'Calendario',
      path: '/vendor/calendar',
      icon: 'calendar_month'
    },
    {
      label: 'Clientes',
      path: '/vendor/clients',
      icon: 'groups'
    },
    {
      label: 'Finanzas',
      path: '/vendor/finance',
      icon: 'payments'
    },
    {
      label: 'Mensajes',
      path: '/vendor/messages',
      icon: 'chat',
      badge: 5
    },
    {
      label: 'Notificaciones',
      path: '/vendor/notifications',
      icon: 'notifications'
    },
    {
      type: 'divider'
    },
    {
      type: 'label',
      label: 'Agencia'
    },
    {
      label: 'Perfil Público',
      path: '/vendor/profile',
      icon: 'business'
    },
    {
      label: 'Configuración',
      path: '/vendor/settings',
      icon: 'settings'
    }
  ];

  // Breadcrumb Logic
  const generateBreadcrumbs = () => {
    const pathnames = location.pathname.split('/').filter(x => x);
    const items = pathnames.map((value, index) => {
      const to = `/${pathnames.slice(0, index + 1).join('/')}`;

      let name = value.charAt(0).toUpperCase() + value.slice(1);
      // Custom mappings for cleaner UI
      if (value === 'vendor') name = 'Inicio'; // CHANGED: Agency -> Inicio
      if (value === 'dashboard') name = 'Dashboard';
      if (value === 'projects') name = 'Proyectos';
      if (value === 'proposals') name = 'Propuestas';
      if (value === 'clients') name = 'Clientes';
      if (value === 'finance') name = 'Finanzas';
      if (value === 'settings') name = 'Configuración';
      if (value === 'profile') name = 'Perfil Público';
      if (value === 'messages') name = 'Mensajes';
      if (value === 'template') name = 'Editor de Plantilla';
      if (value === 'calendar') name = 'Calendario';
      if (value === 'notifications') name = 'Notificaciones';

      return { name, to };
    });
    return items;
  };

  const breadcrumbs = generateBreadcrumbs();

  return (
    <div className={`flex flex-col bg-[#f6f6f8] min-h-screen`}>
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
            border-r border-gray-200 flex-col flex-shrink-0 bg-white transition-transform duration-300 ease-in-out z-50
            fixed inset-y-0 left-0 h-full w-64 shadow-xl md:shadow-none
            ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0 md:w-0 md:border-none md:overflow-hidden'}
            md:relative md:sticky md:top-20 md:h-[calc(100vh-80px)] md:overflow-y-auto custom-scrollbar
          `}
        >
          <div className={`p-4 py-6 w-64 h-full overflow-y-auto custom-scrollbar ${!isSidebarOpen && 'md:hidden'}`}>
            <nav className="flex flex-col space-y-1">
              <div className="md:hidden flex justify-between items-center mb-6 px-2">
                <span className="text-lg font-bold text-gray-900">Agencia</span>
                <button onClick={() => setIsSidebarOpen(false)} className="p-1 text-gray-500 hover:bg-gray-100 rounded-full">
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>

              {menuItems.map((item, index) => {
                if (item.type === 'divider') return <div key={index} className="my-4 border-t border-gray-100"></div>;
                if (item.type === 'label') return <p key={index} className="px-3 text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 mt-2">{item.label}</p>;

                const isItemActive = isActive(item.path!, item.exact);

                return (
                  <Link
                    key={index}
                    to={item.path!}
                    onClick={() => window.innerWidth < 768 && setIsSidebarOpen(false)}
                    className={`
                            flex-1 flex items-center justify-between gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200
                            ${isItemActive
                        ? 'bg-primary/5 text-primary'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}
                            `}
                  >
                    <div className="flex items-center gap-3">
                      <span className={`material-symbols-outlined text-[20px] ${isItemActive ? 'filled' : ''}`}>{item.icon}</span>
                      {item.label}
                    </div>
                    {item.badge && (
                      <span className="bg-primary text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm">{item.badge}</span>
                    )}
                  </Link>
                );
              })}

              <div className="mt-8 pt-4">
                <button
                  onClick={() => { localStorage.removeItem('ai_dev_user'); navigate('/'); }}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
                >
                  <span className="material-symbols-outlined text-[20px]">logout</span>
                  Cerrar Sesión
                </button>
              </div>
            </nav>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className={`flex-1 flex flex-col min-w-0 transition-all duration-300`}>
          {/* Sticky Toggle Bar & Breadcrumbs */}
          <div className="bg-white border-b border-gray-200 px-6 py-3 flex items-center shadow-sm shrink-0 gap-4 sticky top-20 z-30">
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="text-gray-500 hover:text-primary hover:bg-gray-50 p-1.5 rounded-md transition-colors block"
              title={isSidebarOpen ? "Ocultar menú lateral" : "Mostrar menú lateral"}
            >
              <span className="material-symbols-outlined text-2xl">{isSidebarOpen ? 'menu_open' : 'menu'}</span>
            </button>

            {/* Dynamic Breadcrumbs */}
            <div className="flex items-center gap-2 text-sm text-gray-500 overflow-x-auto no-scrollbar whitespace-nowrap">
              <span className="material-symbols-outlined text-gray-400">home</span>
              <Link to="/vendor/dashboard" className="hover:text-primary transition-colors">Inicio</Link>
              {breadcrumbs.map((crumb, index) => {
                const isLast = index === breadcrumbs.length - 1;
                if (crumb.name === 'Inicio' || crumb.name === 'Agencia') return null;

                return (
                  <React.Fragment key={crumb.to}>
                    <span className="material-symbols-outlined text-gray-300 text-base">chevron_right</span>
                    <Link
                      to={crumb.to}
                      className={`hover:bg-gray-100 px-2 py-1 rounded transition-colors ${isLast ? 'font-bold text-gray-900 pointer-events-none' : ''}`}
                    >
                      {crumb.name}
                    </Link>
                  </React.Fragment>
                );
              })}
            </div>
          </div>

          <div className={`${fullHeight ? 'h-[calc(100vh-140px)]' : ''}`}>
            <div className={`${fullHeight ? 'h-full flex flex-col' : 'p-6 md:p-8 lg:p-10 max-w-7xl w-full mx-auto'}`}>
              {children}
            </div>
          </div>
        </main>
      </div>
      <FAQWidget />
    </div>
  );
};

export default VendorLayout;