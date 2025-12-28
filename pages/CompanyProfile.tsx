import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import Button from '../components/Button';
import FAQWidget from '../components/FAQWidget';
import ProposalSubmissionModal from '../components/ProposalSubmissionModal';
import api from '../services/api';
import { MOCK_COMPANIES } from '../constants';

const CompanyProfile: React.FC = () => {
   const { id } = useParams();
   const navigate = useNavigate();
   const [searchParams] = useSearchParams();

   const [company, setCompany] = useState<any>(null);
   const [loading, setLoading] = useState(true);
   const [isModalOpen, setIsModalOpen] = useState(false);

   useEffect(() => {
      if (searchParams.get('openModal') === 'true') {
         setIsModalOpen(true);
      }
   }, [searchParams]);

   useEffect(() => {
      const fetchVendor = async () => {
         if (!id) return;
         // Check if it's a mock ID first (for legacy support)
         const mock = MOCK_COMPANIES.find(c => c.id === id);
         if (mock) {
            setCompany({ ...mock, isMock: true });
            setLoading(false);
            return;
         }

         try {
            const response = await api.get(`/vendors/${id}`);
            setCompany(response.data);
         } catch (error) {
            console.error("Failed to fetch vendor", error);
         } finally {
            setLoading(false);
         }
      };

      fetchVendor();
   }, [id]);

   if (loading) {
      return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
   }

   if (!company) {
      return <div className="min-h-screen flex items-center justify-center">Company not found</div>;
   }

   // Normalize data structure between Mock and Real
   const displayCompany = company.isMock ? company : {
      id: company.id, // VendorProfile ID
      name: company.companyName,
      slogan: company.bio?.substring(0, 50) + '...',
      description: company.bio,
      founded: "2020",
      teamSize: "10-20",
      location: "Remote",
      logo: "https://ui-avatars.com/api/?name=" + (company.companyName || 'Vendor') + "&background=random&size=200",
      useCases: company.skills?.map((s: string) => ({ title: s, description: 'Expertise in ' + s })) || [],
      integrations: ["Slack", "GitHub"],
      portfolio: [],
      templates: company.templates || []
   };

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
                  <img src={displayCompany.logo} alt={displayCompany.name} className="w-32 h-32 rounded-2xl border border-gray-100 shadow-sm object-cover" />
                  <div className="flex-1">
                     <h1 className="text-3xl md:text-4xl font-bold text-dark mb-2">{displayCompany.name}</h1>
                     <p className="text-xl text-gray-500 mb-4">{displayCompany.slogan}</p>
                     <div className="flex flex-wrap gap-4 text-sm text-gray-600 mb-6">
                        <span className="flex items-center gap-1"><span className="material-symbols-outlined text-lg">calendar_today</span> Founded {displayCompany.founded}</span>
                        <span className="flex items-center gap-1"><span className="material-symbols-outlined text-lg">group</span> {displayCompany.teamSize} Employees</span>
                        <span className="flex items-center gap-1"><span className="material-symbols-outlined text-lg">location_on</span> {displayCompany.location}</span>
                     </div>
                     <Button size="lg" onClick={() => setIsModalOpen(true)}>Enviar Propuesta de Proyecto</Button>
                  </div>
               </div>

               <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                  {/* Main Info */}
                  <div className="lg:col-span-2 space-y-12">
                     <section>
                        <h2 className="text-2xl font-bold mb-4">Sobre la empresa</h2>
                        <p className="text-gray-600 leading-relaxed text-lg">{displayCompany.description}</p>
                     </section>

                     {/* Dynamic Use Cases */}
                     <section>
                        <h2 className="text-2xl font-bold mb-6">Servicios & Casos de Uso</h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                           {displayCompany.useCases ? displayCompany.useCases.map((useCase: any, i: number) => (
                              <div key={i} className="flex gap-4 p-4 rounded-xl bg-gray-50 border border-gray-100 hover:shadow-md transition-shadow">
                                 <span className="material-symbols-outlined text-primary text-3xl">lightbulb</span>
                                 <div>
                                    <h3 className="font-bold text-dark">{useCase.title}</h3>
                                    <p className="text-sm text-gray-500 mt-1">{useCase.description}</p>
                                 </div>
                              </div>
                           )) : (
                              <p className="text-gray-500">No hay servicios listados.</p>
                           )}
                        </div>
                     </section>

                     <section>
                        <h2 className="text-2xl font-bold mb-6">Portafolio</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                           {displayCompany.portfolio && displayCompany.portfolio.length > 0 ? displayCompany.portfolio.map((item: any) => (
                              <div key={item.id} className="group cursor-pointer">
                                 <div className="rounded-xl overflow-hidden mb-3">
                                    <img src={item.image} alt={item.title} className="w-full aspect-video object-cover transition-transform duration-500 group-hover:scale-105" />
                                 </div>
                                 <p className="text-sm text-gray-500 mb-1">Cliente: {item.client}</p>
                                 <h3 className="font-bold text-lg group-hover:text-primary transition-colors">{item.title}</h3>
                              </div>
                           )) : (
                              <div className="col-span-2 text-center py-8 bg-gray-50 rounded-xl">
                                 <p className="text-gray-500 italic">No hay proyectos en el portafolio público.</p>
                              </div>
                           )}
                        </div>
                     </section>
                  </div>
               </div>
            </div>
         </main>

         <ProposalSubmissionModal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            vendorId={displayCompany.id}
            vendorName={displayCompany.name}
            templates={displayCompany.templates || []}
         />

         <Footer />
         <FAQWidget />
      </div>
   );
};

export default CompanyProfile;


