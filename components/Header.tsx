import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import Button from './Button';
import Modal from './Modal';

interface HeaderProps {
  simple?: boolean;
}

const Header: React.FC<HeaderProps> = ({ simple = false }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  
  // Auth State
  const [user, setUser] = useState<{name: string, avatar: string, role: 'client' | 'vendor'} | null>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  // Dropdown States
  const [isLangMenuOpen, setIsLangMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  
  const [language, setLanguage] = useState<'es' | 'en'>('es');
  const langMenuRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Check for simulated session
    const storedUser = localStorage.getItem('ai_dev_user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }

    const handleClickOutside = (event: MouseEvent) => {
      if (langMenuRef.current && !langMenuRef.current.contains(event.target as Node)) {
        setIsLangMenuOpen(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogin = () => {
    if (email === 'cliente' && password === 'cliente') {
      const userData = {
        name: 'Cliente Corp',
        avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD56sMogw_VBB9yDp-jxxYeihYrC8RGmccLUN9_8TyhtQFMfYRISR5MkcUL3DhYdjP1W0idTNuYYx4IYzTgsCsrrcJaTze-5aPqLr5-AdStPpGbPg-2H_HeF5zIOU2rNNB5Lxf5iOdEDlFBsR52qtxTSD2vGaLIYzxsMLLYLyKYXQTRRtzfZLohcIfqB5u2JzB7FilkC1Z1O-blivYoU_3uGvwBDlTeW3TCocCvcIy_2FoXiX5_TXgdkdB_hgJ3-uGTBLmqDSTeAU8',
        role: 'client' as const
      };
      localStorage.setItem('ai_dev_user', JSON.stringify(userData));
      setUser(userData);
      setIsLoginOpen(false);
      navigate('/client/dashboard');
    } else if (email === 'vendor' && password === 'vendor') {
      const userData = {
        name: 'QuantumLeap AI',
        avatar: 'https://picsum.photos/id/40/200/200',
        role: 'vendor' as const
      };
      localStorage.setItem('ai_dev_user', JSON.stringify(userData));
      setUser(userData);
      setIsLoginOpen(false);
      navigate('/vendor/dashboard');
    } else {
      setLoginError('Credenciales incorrectas. Usa cliente/cliente o vendor/vendor');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('ai_dev_user');
    setUser(null);
    setIsUserMenuOpen(false);
    navigate('/');
  };

  const getLinkClasses = (path: string) => {
    const baseClasses = "text-sm py-1 border-b-2 transition-colors duration-200";
    if (location.pathname === path || location.pathname.startsWith(path + '/')) {
      return `${baseClasses} text-black border-black font-semibold`;
    }
    return `${baseClasses} text-gray-500 border-transparent hover:border-gray-200 hover:text-gray-800`;
  };

  // Dynamic Dashboard Link based on role
  const dashboardLink = user?.role === 'vendor' ? '/vendor/dashboard' : '/client/dashboard';
  const dashboardPrefix = user?.role === 'vendor' ? '/vendor' : '/client';

  return (
    <>
      <header className="sticky top-0 z-40 w-full bg-white/80 backdrop-blur-md border-b border-gray-100 h-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full">
          <div className="flex items-center justify-between h-full">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2 group">
               <span className="material-symbols-outlined text-primary text-4xl group-hover:scale-105 transition-transform">hub</span>
               <span className="text-xl font-bold tracking-tight text-primary">AI Dev Connect</span>
            </Link>

            {!simple && (
              <>
                {/* Desktop Nav */}
                <nav className="hidden md:flex items-center gap-8">
                  <Link to="/search" className={getLinkClasses('/search')}>Explorar</Link>
                  <Link to="/how-it-works" className={getLinkClasses('/how-it-works')}>Cómo Funciona</Link>
                  <Link to="/support" className={getLinkClasses('/support')}>Soporte</Link>
                  <Link to="/pricing" className={getLinkClasses('/pricing')}>Precios</Link>
                  
                  {/* "Mi Perfil" appears here when logged in */}
                  {user && (
                    <Link to={dashboardLink} className={getLinkClasses(dashboardPrefix)}>Mi Perfil</Link>
                  )}
                </nav>

                {/* Actions */}
                <div className="flex items-center gap-2">
                  <div className="relative" ref={langMenuRef}>
                    <button 
                      onClick={() => setIsLangMenuOpen(!isLangMenuOpen)}
                      className="p-2 rounded-full hover:bg-gray-100 transition-colors text-gray-600"
                    >
                      <span className="material-symbols-outlined text-xl">translate</span>
                    </button>
                    {isLangMenuOpen && (
                      <div className="absolute top-full right-0 mt-2 w-40 bg-white rounded-xl shadow-card border border-gray-100 py-2 z-50 animate-in fade-in zoom-in-95 duration-200">
                         <button onClick={() => { setLanguage('es'); setIsLangMenuOpen(false); }} className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 flex justify-between ${language === 'es' ? 'text-primary font-bold' : 'text-gray-700'}`}>Español {language === 'es' && '✓'}</button>
                         <button onClick={() => { setLanguage('en'); setIsLangMenuOpen(false); }} className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 flex justify-between ${language === 'en' ? 'text-primary font-bold' : 'text-gray-700'}`}>English {language === 'en' && '✓'}</button>
                      </div>
                    )}
                  </div>

                  {user ? (
                    <div className="flex items-center gap-4 ml-2 relative" ref={userMenuRef}>
                       <button 
                        onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                        className="flex items-center gap-2 cursor-pointer focus:outline-none hover:bg-gray-50 p-1.5 rounded-full transition-colors pr-3"
                       >
                          <img src={user.avatar} alt={user.name} className="w-9 h-9 rounded-full object-cover border border-gray-200" />
                          <span className="text-sm font-medium text-gray-700 hidden lg:block">{user.name}</span>
                          <span className="material-symbols-outlined text-gray-400 text-lg">expand_more</span>
                       </button>

                       {isUserMenuOpen && (
                          <div className="absolute top-full right-0 mt-2 w-56 bg-white rounded-xl shadow-floating border border-gray-100 py-2 z-50 animate-in fade-in zoom-in-95 duration-200 origin-top-right">
                             <div className="px-4 py-3 border-b border-gray-100 mb-1">
                                <p className="text-sm font-bold text-gray-900 truncate">{user.name}</p>
                                <p className="text-xs text-gray-500 truncate capitalize">{user.role}</p>
                             </div>
                             
                             <Link 
                                to={dashboardLink} 
                                className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-3 transition-colors"
                                onClick={() => setIsUserMenuOpen(false)}
                             >
                                <span className="material-symbols-outlined text-[20px] text-gray-400">dashboard</span>
                                Dashboard
                             </Link>

                             <Link 
                                to={user.role === 'vendor' ? '/vendor/profile' : '/client/profile'} 
                                className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-3 transition-colors"
                                onClick={() => setIsUserMenuOpen(false)}
                             >
                                <span className="material-symbols-outlined text-[20px] text-gray-400">person</span>
                                Mi Perfil
                             </Link>

                             <Link 
                                to={user.role === 'vendor' ? '/vendor/settings' : '/client/settings'} 
                                className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-3 transition-colors"
                                onClick={() => setIsUserMenuOpen(false)}
                             >
                                <span className="material-symbols-outlined text-[20px] text-gray-400">settings</span>
                                Configuración
                             </Link>

                             <div className="border-t border-gray-100 my-1"></div>
                             
                             <button 
                                onClick={handleLogout} 
                                className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-3 font-medium transition-colors"
                             >
                                <span className="material-symbols-outlined text-[20px]">logout</span>
                                Cerrar Sesión
                             </button>
                          </div>
                       )}
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" className="hidden sm:flex" onClick={() => setIsLoginOpen(true)}>
                        Iniciar Sesión
                      </Button>
                      <Button variant="primary" onClick={() => navigate('/signup')}>
                        Registrarse
                      </Button>
                    </div>
                  )}
                </div>
              </>
            )}

            {simple && (
              <div className="flex items-center gap-4">
                <span className="text-sm text-gray-500 hidden sm:inline">¿Ya tienes una cuenta?</span>
                <Button variant="primary" size="sm" onClick={() => setIsLoginOpen(true)}>
                  Iniciar Sesión
                </Button>
              </div>
            )}
          </div>
        </div>
      </header>

      <Modal isOpen={isLoginOpen} onClose={() => setIsLoginOpen(false)} title="Iniciar Sesión">
         <div className="flex flex-col gap-4">
            <h4 className="text-xl font-bold text-gray-800">Bienvenido de nuevo</h4>
            <div className="p-3 bg-gray-50 rounded-lg text-xs text-gray-500">
                <p><strong>Demo Access:</strong></p>
                <div className="flex justify-between mt-1">
                    <span>Cliente: <code>cliente / cliente</code></span>
                    <span>Vendor: <code>vendor / vendor</code></span>
                </div>
            </div>
            
            {loginError && (
              <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg flex items-center gap-2">
                 <span className="material-symbols-outlined text-base">error</span>
                 {loginError}
              </div>
            )}

            <input 
              type="text" 
              placeholder="Usuario o Email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 bg-white text-gray-900 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all" 
            />
            <input 
              type="password" 
              placeholder="Contraseña" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 bg-white text-gray-900 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all" 
            />
            <Button fullWidth onClick={handleLogin}>Entrar</Button>
            <div className="flex items-center gap-4 my-2">
              <div className="h-px bg-gray-200 flex-1"></div>
              <span className="text-xs text-gray-400">O</span>
              <div className="h-px bg-gray-200 flex-1"></div>
            </div>
            <p className="text-center text-sm text-gray-500">
              ¿No tienes cuenta? <button onClick={() => { setIsLoginOpen(false); navigate('/signup'); }} className="text-primary font-semibold hover:underline">Regístrate</button>
            </p>
         </div>
      </Modal>
    </>
  );
};

export default Header;