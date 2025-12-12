import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import Button from '../components/Button';
import FAQWidget from '../components/FAQWidget';
import Modal from '../components/Modal';
import { MOCK_COMPANIES } from '../constants';

const Proposal: React.FC = () => {
  const { companyId } = useParams();
  const navigate = useNavigate();
  const company = MOCK_COMPANIES.find(c => c.id === companyId) || MOCK_COMPANIES[0];
  
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [modalAction, setModalAction] = useState<'save' | 'send'>('send');

  const handleAction = (action: 'save' | 'send') => {
    setModalAction(action);
    setShowAuthModal(true);
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      
      <main className="flex-grow py-12 px-4 sm:px-6 lg:px-8">
         <div className="max-w-4xl mx-auto">
            <div className="mb-8">
               <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-gray-500 hover:text-dark mb-4">
                  <span className="material-symbols-outlined">arrow_back</span> Volver
               </button>
               <h1 className="text-3xl font-bold text-dark">Creación de Propuesta Rápida</h1>
               <p className="text-gray-500 mt-2">La propuesta ha sido autocompletada con la información recopilada por nuestro agente IA.</p>
            </div>

            {/* AI Banner */}
            <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 flex gap-4 mb-8">
               <div className="bg-blue-100 text-blue-600 rounded-full p-2 h-fit">
                  <span className="material-symbols-outlined">smart_toy</span>
               </div>
               <div>
                  <h3 className="font-bold text-blue-900">Propuesta Generada por IA</h3>
                  <p className="text-sm text-blue-700 mt-1">Esta propuesta se basa en tu conversación reciente y los requisitos de <span className="font-semibold">{company.name}</span>.</p>
               </div>
            </div>

            {/* Form */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
               <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                  <h2 className="font-bold text-lg text-dark">Propuesta para {company.name}</h2>
                  <div className="flex gap-2">
                     <Button variant="outline" size="sm" className="gap-2">
                        <span className="material-symbols-outlined text-sm">edit</span> Editar
                     </Button>
                     <button className="text-red-500 hover:bg-red-50 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-2">
                        <span className="material-symbols-outlined text-sm">delete</span> Borrar
                     </button>
                  </div>
               </div>
               
               <div className="p-8 space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                     <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">Nombre del Proyecto</label>
                        <div className="w-full px-4 py-3 rounded-lg bg-gray-50 border border-gray-200 text-dark">Sistema de Recomendación AI</div>
                     </div>
                     <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">Plazo Estimado</label>
                        <div className="w-full px-4 py-3 rounded-lg bg-gray-50 border border-gray-200 text-dark">3 meses</div>
                     </div>
                     <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">Presupuesto Estimado</label>
                        <div className="w-full px-4 py-3 rounded-lg bg-gray-50 border border-gray-200 text-dark">$50,000 - $75,000</div>
                     </div>
                     <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">Tipo de Proyecto</label>
                        <div className="w-full px-4 py-3 rounded-lg bg-gray-50 border border-gray-200 text-dark">Desarrollo de Producto de IA</div>
                     </div>
                  </div>

                  <div>
                     <label className="block text-sm font-bold text-gray-700 mb-2">Resumen Ejecutivo</label>
                     <div className="w-full px-4 py-3 rounded-lg bg-gray-50 border border-gray-200 text-dark leading-relaxed">
                        Desarrollar un sistema de recomendación personalizado para la plataforma de e-learning, utilizando algoritmos de machine learning para aumentar la participación del usuario y la retención en un 20% en los primeros 6 meses post-implementación.
                     </div>
                  </div>

                  <div>
                     <label className="block text-sm font-bold text-gray-700 mb-2">Requisitos Predefinidos por {company.name}</label>
                     <ul className="list-disc pl-5 space-y-2 text-gray-600 bg-gray-50 p-4 rounded-lg border border-gray-200">
                        <li>Integración con la base de datos de usuarios existente vía API REST.</li>
                        <li>Escalabilidad para soportar hasta 1 millón de usuarios activos.</li>
                        <li>Dashboard de analíticas en tiempo real para el rendimiento de las recomendaciones.</li>
                        <li>Cumplimiento con normativas GDPR.</li>
                     </ul>
                  </div>
               </div>

               <div className="p-6 bg-gray-50 border-t border-gray-100 flex flex-col sm:flex-row justify-end gap-4">
                  <Button variant="outline" onClick={() => handleAction('save')}>Guardar Borrador</Button>
                  <Button onClick={() => handleAction('send')}>Enviar Propuesta</Button>
               </div>
            </div>
         </div>
      </main>

      <Modal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} title="Acción requerida">
         <div className="text-center">
            <div className="w-16 h-16 bg-red-50 text-primary rounded-full flex items-center justify-center mx-auto mb-4">
               <span className="material-symbols-outlined text-3xl">lock</span>
            </div>
            <h3 className="text-xl font-bold text-dark mb-2">Inicia sesión para continuar</h3>
            <p className="text-gray-500 mb-6">
               Para {modalAction === 'send' ? 'enviar propuestas' : 'guardar borradores'}, necesitas tener una cuenta activa en AI Dev Connect.
            </p>
            <div className="space-y-3">
               <Button fullWidth onClick={() => navigate('/signup')}>Crear cuenta gratis</Button>
               <Button fullWidth variant="ghost" onClick={() => setShowAuthModal(false)}>Ya tengo cuenta</Button>
            </div>
         </div>
      </Modal>

      <Footer />
      <FAQWidget />
    </div>
  );
};

export default Proposal;
