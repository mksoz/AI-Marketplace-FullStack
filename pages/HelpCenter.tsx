import React from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import FAQWidget from '../components/FAQWidget';
import { FAQ_CATEGORIES } from '../constants';

const HelpCenter: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header />
      
      <main className="flex-grow">
        {/* Hero */}
        <div className="bg-gray-50 py-16 px-4 text-center border-b border-gray-100">
           <h1 className="text-3xl md:text-4xl font-bold text-dark mb-4">¿Cómo podemos ayudarte?</h1>
           <p className="text-gray-500 mb-8 text-lg">Encuentra respuestas, guías y contacta a nuestro equipo de soporte.</p>
           
           <div className="max-w-2xl mx-auto relative">
              <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">search</span>
              <input 
                type="text" 
                placeholder="Busca por palabra clave (ej. 'facturación', 'publicar')"
                className="w-full pl-12 pr-4 py-4 rounded-full border border-gray-200 bg-white text-gray-900 shadow-sm focus:ring-2 focus:ring-primary focus:border-transparent outline-none placeholder:text-gray-500"
              />
              <button className="absolute right-2 top-2 bottom-2 bg-primary text-white px-6 rounded-full font-medium hover:bg-primary/90 transition-colors">
                 Buscar
              </button>
           </div>
        </div>

        {/* Categories */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
           <h2 className="text-2xl font-bold mb-8 text-dark">Explorar por categoría</h2>
           <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {FAQ_CATEGORIES.map((cat, i) => (
                 <div key={i} className="group p-6 rounded-xl border border-gray-200 hover:shadow-card hover:border-transparent transition-all cursor-pointer bg-white">
                    <div className="w-12 h-12 bg-gray-50 rounded-lg flex items-center justify-center text-primary mb-4 group-hover:bg-primary group-hover:text-white transition-colors">
                       <span className="material-symbols-outlined text-2xl">{cat.icon}</span>
                    </div>
                    <h3 className="font-bold text-lg mb-2 text-dark">{cat.title}</h3>
                    <p className="text-gray-500 text-sm">{cat.desc}</p>
                 </div>
              ))}
           </div>
        </section>

        {/* Support CTA */}
        <section className="bg-gray-900 text-white py-16 px-4">
           <div className="max-w-4xl mx-auto text-center">
              <h2 className="text-2xl md:text-3xl font-bold mb-4">¿No encuentras lo que buscas?</h2>
              <p className="text-gray-400 mb-8">Nuestro equipo de soporte está disponible 24/7 para ayudarte con cualquier problema.</p>
              <div className="flex flex-col sm:flex-row justify-center gap-4">
                 <button className="flex items-center justify-center gap-2 px-8 py-3 bg-primary rounded-lg font-bold hover:bg-primary/90 transition-colors">
                    <span className="material-symbols-outlined">chat</span> Chat en Vivo
                 </button>
                 <button className="flex items-center justify-center gap-2 px-8 py-3 bg-white/10 border border-white/20 rounded-lg font-bold hover:bg-white/20 transition-colors">
                    <span className="material-symbols-outlined">mail</span> Enviar un Ticket
                 </button>
              </div>
           </div>
        </section>
      </main>

      <Footer />
      <FAQWidget />
    </div>
  );
};

export default HelpCenter;