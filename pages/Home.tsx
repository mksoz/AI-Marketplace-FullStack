import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import FAQWidget from '../components/FAQWidget';
import { MOCK_COMPANIES } from '../constants';

const Home: React.FC = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  const scrollToHowItWorks = () => {
    const element = document.getElementById('how-it-works');
    element?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-grow">
        {/* Hero Section */}
        <section className="px-4 py-16 sm:py-24 lg:py-32 max-w-7xl mx-auto flex flex-col items-center text-center">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-dark mb-6 max-w-4xl font-display">
            Encuentra tu socio ideal para el desarrollo de productos de IA
          </h1>
          <p className="text-lg sm:text-xl text-gray-500 max-w-2xl mb-10">
            Conecta con las mejores empresas de desarrollo de IA y da vida a tu próximo proyecto de inteligencia artificial.
          </p>

          {/* Search Bar - Airbnb Style */}
          <div className="w-full max-w-2xl relative">
             <form onSubmit={handleSearch} className="relative w-full">
                <input 
                  type="text" 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-8 pr-32 py-4 rounded-full shadow-card border border-gray-200 bg-white text-gray-900 text-lg focus:outline-none focus:ring-2 focus:ring-gray-200 transition-all placeholder:text-gray-500"
                  placeholder="Describe tu proyecto (ej. 'Chatbot para banca')..."
                />
                <div className="absolute top-2 right-2 bottom-2">
                   <button 
                     type="submit" 
                     className="bg-primary hover:bg-red-600 text-white h-full px-6 rounded-full flex items-center gap-2 font-medium transition-colors"
                   >
                      <span className="material-symbols-outlined text-xl">search</span>
                      <span className="hidden sm:inline">Buscar</span>
                   </button>
                </div>
             </form>
          </div>
          
          <button onClick={scrollToHowItWorks} className="mt-12 text-sm font-semibold text-gray-500 hover:text-primary flex items-center gap-1 transition-colors">
            Cómo funciona <span className="material-symbols-outlined text-lg">expand_more</span>
          </button>
        </section>

        {/* How It Works Section (New) */}
        <section id="how-it-works" className="bg-gray-50 py-20 border-y border-gray-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold text-dark">Simplificamos la contratación de IA</h2>
              <p className="text-gray-500 mt-4">De la idea a la ejecución en tres simples pasos.</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center">
              {[
                { icon: 'manage_search', title: '1. Describe tu necesidad', desc: 'Usa nuestro buscador inteligente o chatea con el agente para definir tus requerimientos.' },
                { icon: 'smart_toy', title: '2. Match con IA', desc: 'Nuestro algoritmo analiza miles de proveedores para encontrar los que encajan con tu stack y presupuesto.' },
                { icon: 'handshake', title: '3. Conecta y Contrata', desc: 'Revisa perfiles verificados, envía propuestas estandarizadas y comienza a trabajar.' }
              ].map((step, idx) => (
                <div key={idx} className="flex flex-col items-center group">
                  <div className="w-16 h-16 bg-white rounded-2xl shadow-sm border border-gray-200 flex items-center justify-center text-primary mb-6 group-hover:scale-110 transition-transform duration-300">
                    <span className="material-symbols-outlined text-4xl">{step.icon}</span>
                  </div>
                  <h3 className="text-xl font-bold text-dark mb-3">{step.title}</h3>
                  <p className="text-gray-500 leading-relaxed max-w-xs">{step.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Featured Vendors Section (Replaced generic visuals) */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
           <div className="flex justify-between items-end mb-8">
             <div>
               <h2 className="text-2xl font-bold text-dark">Empresas mejor valoradas</h2>
               <p className="text-gray-500 mt-1">Socios tecnológicos con trayectoria probada.</p>
             </div>
             <button onClick={() => navigate('/search')} className="text-dark font-semibold border-b border-dark pb-0.5 hover:text-primary hover:border-primary transition-colors">
               Ver todas
             </button>
           </div>

           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {MOCK_COMPANIES.slice(0, 3).map(company => (
                 <div 
                   key={company.id} 
                   onClick={() => navigate(`/company/${company.id}`)}
                   className="group cursor-pointer"
                 >
                    <div className="rounded-xl overflow-hidden aspect-[4/3] relative mb-4 bg-gray-100">
                       <img src={company.banner} alt={company.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                       <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-md flex items-center gap-1 shadow-sm">
                          <span className="material-symbols-outlined text-sm filled text-black">star</span>
                          <span className="text-xs font-bold">{company.rating}</span>
                       </div>
                    </div>
                    <div className="flex justify-between items-start">
                       <div>
                          <h3 className="font-bold text-lg text-dark group-hover:text-primary transition-colors">{company.name}</h3>
                          <p className="text-gray-500 text-sm mt-1">{company.location} • {company.founded}</p>
                       </div>
                    </div>
                    <div className="flex flex-wrap gap-2 mt-3">
                        {company.specialties.slice(0, 2).map(spec => (
                          <span key={spec} className="text-xs font-medium text-gray-600 bg-gray-100 px-2 py-1 rounded-md">{spec}</span>
                        ))}
                    </div>
                 </div>
              ))}
           </div>
        </section>
      </main>

      <Footer />
      <FAQWidget />
    </div>
  );
};

export default Home;