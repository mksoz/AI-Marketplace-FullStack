import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import Button from '../components/Button';
import FAQWidget from '../components/FAQWidget';
import { MOCK_COMPANIES } from '../constants';

const CompanyProfile: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const company = MOCK_COMPANIES.find(c => c.id === id) || MOCK_COMPANIES[0];

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header />
      
      <main className="flex-grow pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          
          <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-gray-500 hover:text-dark mb-6">
             <span className="material-symbols-outlined">arrow_back</span> Volver
          </button>

          {/* Header Section */}
          <div className="flex flex-col md:flex-row gap-8 items-start mb-12">
             <img src={company.logo} alt={company.name} className="w-32 h-32 rounded-2xl border border-gray-100 shadow-sm object-cover" />
             <div className="flex-1">
                <h1 className="text-3xl md:text-4xl font-bold text-dark mb-2">{company.name}</h1>
                <p className="text-xl text-gray-500 mb-4">{company.slogan}</p>
                <div className="flex flex-wrap gap-4 text-sm text-gray-600 mb-6">
                   <span className="flex items-center gap-1"><span className="material-symbols-outlined text-lg">calendar_today</span> Founded {company.founded}</span>
                   <span className="flex items-center gap-1"><span className="material-symbols-outlined text-lg">group</span> {company.teamSize} Employees</span>
                   <span className="flex items-center gap-1"><span className="material-symbols-outlined text-lg">location_on</span> {company.location}</span>
                </div>
                <Button size="lg" onClick={() => navigate(`/proposal/${company.id}`)}>Enviar Propuesta de Proyecto</Button>
             </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
             {/* Main Info */}
             <div className="lg:col-span-2 space-y-12">
                <section>
                   <h2 className="text-2xl font-bold mb-4">Sobre la empresa</h2>
                   <p className="text-gray-600 leading-relaxed text-lg">{company.description}</p>
                </section>

                <section>
                   <h2 className="text-2xl font-bold mb-6">Servicios</h2>
                   <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      {['Natural Language Processing', 'Computer Vision', 'Predictive Analytics', 'Machine Learning'].map((service, i) => (
                         <div key={i} className="flex gap-4 p-4 rounded-xl bg-gray-50 border border-gray-100">
                            <span className="material-symbols-outlined text-primary text-3xl">verified</span>
                            <div>
                               <h3 className="font-bold text-dark">{service}</h3>
                               <p className="text-sm text-gray-500 mt-1">Soluciones avanzadas para tu negocio.</p>
                            </div>
                         </div>
                      ))}
                   </div>
                </section>

                <section>
                   <h2 className="text-2xl font-bold mb-6">Portafolio</h2>
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {company.portfolio.length > 0 ? company.portfolio.map(item => (
                         <div key={item.id} className="group cursor-pointer">
                            <div className="rounded-xl overflow-hidden mb-3">
                               <img src={item.image} alt={item.title} className="w-full aspect-video object-cover transition-transform duration-500 group-hover:scale-105" />
                            </div>
                            <p className="text-sm text-gray-500 mb-1">Cliente: {item.client}</p>
                            <h3 className="font-bold text-lg group-hover:text-primary transition-colors">{item.title}</h3>
                         </div>
                      )) : <p className="text-gray-500 italic">No hay proyectos públicos disponibles.</p>}
                   </div>
                </section>
             </div>

             {/* Sidebar Contact */}
             <aside className="space-y-8">
                <div className="p-6 rounded-2xl border border-gray-200 shadow-card bg-white sticky top-24">
                   <h3 className="text-xl font-bold mb-6">Información de Contacto</h3>
                   <ul className="space-y-4">
                      <li className="flex gap-3 items-center text-gray-600">
                         <span className="material-symbols-outlined text-gray-400">mail</span>
                         <a href={`mailto:${company.email}`} className="hover:text-primary transition-colors">{company.email}</a>
                      </li>
                      <li className="flex gap-3 items-center text-gray-600">
                         <span className="material-symbols-outlined text-gray-400">phone</span>
                         <span>{company.phone}</span>
                      </li>
                      <li className="flex gap-3 items-center text-gray-600">
                         <span className="material-symbols-outlined text-gray-400">language</span>
                         <a href={`https://${company.website}`} target="_blank" rel="noreferrer" className="hover:text-primary transition-colors">{company.website}</a>
                      </li>
                      <li className="flex gap-3 items-center text-gray-600">
                         <span className="material-symbols-outlined text-gray-400">map</span>
                         <span>{company.location}</span>
                      </li>
                   </ul>
                   <div className="mt-6 rounded-xl bg-gray-100 h-48 w-full flex items-center justify-center text-gray-400 text-sm">
                      Map Placeholder
                   </div>
                </div>
             </aside>
          </div>
        </div>
      </main>

      <Footer />
      <FAQWidget />
    </div>
  );
};

export default CompanyProfile;
