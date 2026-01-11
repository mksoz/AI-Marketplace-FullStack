import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import Header from './Header';
import FAQWidget from './FAQWidget';
import NotificationBadge from './notifications/NotificationBadge';
import { useUnreadCount } from '../hooks/useUnreadCount';
import { useUnreadMessagesCount } from '../hooks/useUnreadMessagesCount';

interface ClientLayoutProps {
  children: React.ReactNode;
  title?: string;
  fullHeight?: boolean;
}

const ClientLayout: React.FC<ClientLayoutProps> = ({ children, fullHeight = false }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { count: unreadCount } = useUnreadCount();
  const { count: unreadMessagesCount } = useUnreadMessagesCount();

  // State for Sidebar Visibility
  const [isSidebarOpen, setIsSidebarOpen] = useState(() => window.innerWidth >= 768);

  // Handle window resize to auto-collapse/expand if needed or just keep user preference
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setIsSidebarOpen(false);
      } else {
        setIsSidebarOpen(true);
      }
    };

    // Optional: We can listen to resize, but maybe we just want initial state.
    // If we want dynamic responsiveness when resizing window (desktop <-> mobile):
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // State for Expandable Menus
  const [expandedMenus, setExpandedMenus] = useState<string[]>([]);

  // Helper to check active route (supports query params)
  const isActive = (path: string, exact = false) => {
    const [pathBase, pathQuery] = path.split('?');
    const matchesPath = exact ? location.pathname === pathBase : location.pathname.startsWith(pathBase);

    if (matchesPath && pathQuery) {
      return location.search.includes(pathQuery);
    }
    return matchesPath;
  };

  // Initialize expanded menus based on current active route
  useEffect(() => {
    const activeParents = getMenuItems()
      .filter(item => item.subsections && (isActive(item.path!) || item.subsections.some(sub => isActive(sub.path))))
      .map(item => item.path!);

    setExpandedMenus(prev => Array.from(new Set([...prev, ...activeParents])));
  }, [location.pathname, location.search]);

  const toggleMenu = (path: string, e: React.MouseEvent) => {
    e.preventDefault();
    if (expandedMenus.includes(path)) {
      setExpandedMenus(expandedMenus.filter(p => p !== path));
    } else {
      setExpandedMenus([...expandedMenus, path]);
    }
  };

  // Dynamic Menu Configuration
  const menuItems = React.useMemo(() => {
    const projectMatch = location.pathname.match(/^\/client\/projects\/([^/]+)/);
    const projectId = projectMatch ? projectMatch[1] : null;

    const baseItems = [
      {
        label: 'Dashboard',
        path: '/client/dashboard',
        icon: 'dashboard',
        exact: true
      },
      {
        label: 'Proyectos',
        path: '/client/projects',
        icon: 'business_center',
        // Dynamic subsections if inside a project
        subsections: projectId ? [
          { label: 'Visión General', path: `/client/projects/${projectId}?tab=dashboard` },
          { label: 'Archivos', path: `/client/projects/${projectId}?tab=files` },
          { label: 'Finanzas', path: `/client/projects/${projectId}?tab=financials` },
          { label: 'Incidencias', path: `/client/projects/${projectId}?tab=incidents` },
        ] : undefined
      },
      {
        label: 'Calendario',
        path: '/client/calendar',
        icon: 'calendar_month'
      },
      {
        label: 'Propuestas',
        path: '/client/proposals',
        icon: 'description'
      },
      {
        label: 'Vendors',
        path: '/client/vendors',
        icon: 'store'
      },
      {
        label: 'Mensajes',
        path: '/client/messages',
        icon: 'chat'
      },
      {
        label: 'Notificaciones',
        path: '/client/notifications',
        icon: 'notifications'
      },
      {
        type: 'divider'
      },
      {
        type: 'label',
        label: 'Cuenta'
      },
      {
        label: 'Mi Perfil',
        path: '/client/profile',
        icon: 'person'
      },
      {
        label: 'Fondos',
        path: '/client/funds',
        icon: 'account_balance_wallet'
      },
      {
        label: 'Configuración',
        path: '/client/settings',
        icon: 'settings'
      },
      {
        label: 'Ayuda',
        path: '/support',
        icon: 'help'
      }
    ];
    return baseItems;
  }, [location.pathname]);

  // Compatibility helper for Effect
  const getMenuItems = () => menuItems;

  // Breadcrumb Logic
  const generateBreadcrumbs = () => {
    const pathnames = location.pathname.split('/').filter(x => x);
    const items = pathnames.map((value, index) => {
      const to = `/${pathnames.slice(0, index + 1).join('/')}`;

      let name = value.charAt(0).toUpperCase() + value.slice(1);
      if (value === 'client') name = 'Inicio';
      if (value === 'dashboard') name = 'Dashboard';
      if (value === 'projects') name = 'Proyectos';
      if (value === 'track') name = 'Seguimiento';
      if (value === 'files') name = 'Archivos';
      if (value === 'deliverables') name = 'Hitos y Entregables';
      if (value === 'proposals') name = 'Propuestas';
      if (value === 'vendors') name = 'Vendors';
      if (value === 'calendar') name = 'Calendario';
      if (value === 'funds') name = 'Fondos';
      if (value === 'settings') name = 'Configuración';
      if (value === 'profile') name = 'Mi Perfil';
      if (value === 'messages') name = 'Mensajes';
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
                <span className="text-lg font-bold text-gray-900">Menú</span>
                <button onClick={() => setIsSidebarOpen(false)} className="p-1 text-gray-500 hover:bg-gray-100 rounded-full">
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>

              {menuItems.map((item, index) => {
                if (item.type === 'divider') {
                  return <div key={index} className="my-4 border-t border-gray-100"></div>;
                }

                if (item.type === 'label') {
                  return <p key={index} className="px-3 text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 mt-2">{item.label}</p>;
                }

                const isItemActive = isActive(item.path!, item.exact);
                const hasSubsections = item.subsections && item.subsections.length > 0;
                const isExpanded = expandedMenus.includes(item.path!);

                return (
                  <div key={index}>
                    <div className="flex items-center">
                      <Link
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
                          <div className="relative">
                            <span
                              className={`material-symbols-outlined text-[20px] ${isItemActive ? 'filled' : ''} ${item.path === '/client/notifications' && unreadCount > 0
                                ? 'animate-pulse text-red-500'
                                : ''
                                }`}
                            >
                              {item.icon}
                            </span>
                          </div>
                          {item.label}
                        </div>
                      </Link>

                      {
                        hasSubsections && (
                          <button
                            onClick={(e) => toggleMenu(item.path!, e)}
                            className="p-2 mr-1 text-gray-400 hover:text-gray-600 rounded-md hover:bg-gray-100"
                          >
                            <span className="material-symbols-outlined text-[18px]">
                              {isExpanded ? 'expand_less' : 'expand_more'}
                            </span>
                          </button>
                        )
                      }
                    </div>

                    {hasSubsections && (
                      <div className={`
                                flex flex-col mt-1 ml-4 border-l-2 border-gray-100 pl-2 space-y-0.5 overflow-hidden transition-all duration-300 ease-in-out
                                ${isExpanded ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}
                             `}>
                        {item.subsections!.map((sub, subIndex) => {
                          const isSubActive = isActive(sub.path);
                          return (
                            <Link
                              key={subIndex}
                              to={sub.path}
                              onClick={() => window.innerWidth < 768 && setIsSidebarOpen(false)}
                              className={`
                                          flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-colors
                                          ${isSubActive
                                  ? 'text-primary font-medium bg-primary/5'
                                  : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'}
                                        `}
                            >
                              <span className={`w-1.5 h-1.5 rounded-full ${isSubActive ? 'bg-primary' : 'bg-gray-300'}`}></span>
                              {sub.label}
                            </Link>
                          );
                        })}
                      </div>
                    )}
                  </div>
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
          </div >
        </aside >

        {/* Main Content Area */}
        < main className={`flex-1 flex flex-col min-w-0 transition-all duration-300`}>

          {/* Sticky Breadcrumbs Bar */}
          < div className="bg-white border-b border-gray-200 px-6 py-3 flex items-center shadow-sm shrink-0 gap-4 sticky top-20 z-30" >

            {/* Sidebar Toggle Button */}
            < button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="text-gray-500 hover:text-primary hover:bg-gray-50 p-1.5 rounded-md transition-colors block"
              title={isSidebarOpen ? "Ocultar menú lateral" : "Mostrar menú lateral"}
            >
              <span className="material-symbols-outlined text-2xl">
                {isSidebarOpen ? 'menu_open' : 'menu'}
              </span>
            </button >

            <div className="flex items-center gap-2 text-sm text-gray-500 overflow-x-auto no-scrollbar whitespace-nowrap">
              <span className="material-symbols-outlined text-gray-400">home</span>
              <Link to="/client/dashboard" className="hover:text-primary transition-colors">Inicio</Link>
              {breadcrumbs.map((crumb, index) => {
                const isLast = index === breadcrumbs.length - 1;
                if (crumb.name === 'Inicio' || crumb.name === 'Client') return null;

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
          </div >

          {/* Content */}
          < div className={`${fullHeight ? 'h-[calc(100vh-140px)]' : ''}`}>
            <div className={`${fullHeight ? 'h-full flex flex-col' : 'p-6 md:p-8 lg:p-10 max-w-7xl w-full mx-auto'}`}>
              {children}
            </div>
          </div >
        </main >
      </div >
      <FAQWidget />
    </div >
  );
};

export default ClientLayout;