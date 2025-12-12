import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import Button from '../components/Button';
import FAQWidget from '../components/FAQWidget';

type BillingCycle = 'monthly' | 'biannual' | 'annual';

const Pricing: React.FC = () => {
  const navigate = useNavigate();
  const [billingCycle, setBillingCycle] = useState<BillingCycle>('annual');

  // Pricing Logic
  const basePrice = 49; // Monthly price
  const biannualDiscount = 0.15; // 15% off
  const annualDiscount = 0.25; // 25% off

  const pricingData = {
    monthly: {
      price: basePrice,
      billed: 'Facturado mensualmente',
      savings: null,
      label: 'Mensual'
    },
    biannual: {
      price: Math.round(basePrice * (1 - biannualDiscount)),
      billed: `Facturado $${Math.round(basePrice * (1 - biannualDiscount) * 6)} cada 6 meses`,
      savings: 'Ahorra 15%',
      label: '6 Meses'
    },
    annual: {
      price: Math.round(basePrice * (1 - annualDiscount)),
      billed: `Facturado $${Math.round(basePrice * (1 - annualDiscount) * 12)} anualmente`,
      savings: 'Ahorra 25%',
      label: 'Anual'
    }
  };

  const currentPlan = pricingData[billingCycle];

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header />
      
      <main className="flex-grow">
        {/* Hero Section */}
        <section className="pt-20 pb-16 px-4 text-center max-w-4xl mx-auto">
           <h1 className="text-4xl sm:text-5xl font-bold text-dark tracking-tight mb-6 font-display">
             Planes sencillos para ambiciones grandes
           </h1>
           <p className="text-xl text-gray-500 max-w-2xl mx-auto leading-relaxed">
             Comienza gratis o desbloquea todo el potencial de la IA con nuestras suscripciones Pro. Sin costes ocultos.
           </p>
        </section>

        {/* Pricing Cards */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-24">
           <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12 max-w-5xl mx-auto items-start">
              
              {/* Free Plan */}
              <div className="bg-white rounded-2xl p-8 border border-gray-200 hover:shadow-lg transition-shadow relative overflow-hidden">
                 <div className="mb-6">
                    <span className="inline-block p-3 rounded-xl bg-gray-100 text-dark mb-4">
                       <span className="material-symbols-outlined text-3xl">hiking</span>
                    </span>
                    <h2 className="text-2xl font-bold text-dark">Starter</h2>
                    <p className="text-gray-500 mt-2">Perfecto para explorar la plataforma y conocer proveedores.</p>
                 </div>
                 
                 <div className="mb-8">
                    <div className="flex items-baseline gap-1">
                       <span className="text-4xl font-bold text-dark">$0</span>
                       <span className="text-gray-400">/mes</span>
                    </div>
                    <p className="text-sm text-gray-400 mt-2">Para siempre.</p>
                 </div>

                 <Button variant="outline" fullWidth onClick={() => navigate('/signup')}>
                    Crear cuenta gratis
                 </Button>

                 <div className="mt-8 space-y-4">
                    <p className="text-sm font-bold text-gray-900 uppercase tracking-wide">Incluye:</p>
                    <ul className="space-y-3">
                       <li className="flex items-start gap-3 text-gray-600 text-sm">
                          <span className="material-symbols-outlined text-green-500 text-lg">check</span>
                          <span>Búsquedas limitadas (5/día)</span>
                       </li>
                       <li className="flex items-start gap-3 text-gray-600 text-sm">
                          <span className="material-symbols-outlined text-green-500 text-lg">check</span>
                          <span>Ver perfiles públicos de empresas</span>
                       </li>
                       <li className="flex items-start gap-3 text-gray-600 text-sm">
                          <span className="material-symbols-outlined text-green-500 text-lg">check</span>
                          <span>Acceso a la comunidad básica</span>
                       </li>
                    </ul>
                 </div>
              </div>

              {/* Pro Plan */}
              <div className="bg-white rounded-2xl p-8 border-2 border-primary shadow-card relative overflow-hidden">
                 {billingCycle === 'annual' && (
                    <div className="absolute top-0 right-0 bg-primary text-white text-xs font-bold px-3 py-1 rounded-bl-xl">
                       MEJOR VALOR
                    </div>
                 )}
                 
                 <div className="mb-6">
                    <span className="inline-block p-3 rounded-xl bg-primary/10 text-primary mb-4">
                       <span className="material-symbols-outlined text-3xl">rocket_launch</span>
                    </span>
                    <h2 className="text-2xl font-bold text-dark">Pro Member</h2>
                    <p className="text-gray-500 mt-2">Potencia total para contratar y gestionar proyectos de IA.</p>
                 </div>

                 {/* Cycle Selector */}
                 <div className="flex bg-gray-100 p-1 rounded-lg mb-6 relative z-10">
                    {(['monthly', 'biannual', 'annual'] as BillingCycle[]).map((cycle) => (
                       <button
                          key={cycle}
                          onClick={() => setBillingCycle(cycle)}
                          className={`flex-1 py-1.5 text-sm font-medium rounded-md transition-all ${
                             billingCycle === cycle 
                             ? 'bg-white text-dark shadow-sm' 
                             : 'text-gray-500 hover:text-gray-700'
                          }`}
                       >
                          {pricingData[cycle].label}
                       </button>
                    ))}
                 </div>
                 
                 <div className="mb-8">
                    <div className="flex items-baseline gap-2">
                       <span className="text-5xl font-bold text-dark">${currentPlan.price}</span>
                       <span className="text-gray-400">/mes</span>
                       {currentPlan.savings && (
                          <span className="bg-green-100 text-green-700 text-xs font-bold px-2 py-1 rounded-full">
                             {currentPlan.savings}
                          </span>
                       )}
                    </div>
                    <p className="text-sm text-gray-400 mt-2">{currentPlan.billed}</p>
                 </div>

                 <Button variant="primary" fullWidth onClick={() => navigate('/signup')}>
                    Suscribirse ahora
                 </Button>

                 <div className="mt-8 space-y-4">
                    <p className="text-sm font-bold text-gray-900 uppercase tracking-wide">Todo lo de Starter, más:</p>
                    <ul className="space-y-3">
                       <li className="flex items-start gap-3 text-gray-700 text-sm">
                          <span className="material-symbols-outlined text-primary text-lg">check_circle</span>
                          <span className="font-medium">Búsquedas y Chat con IA ilimitados</span>
                       </li>
                       <li className="flex items-start gap-3 text-gray-700 text-sm">
                          <span className="material-symbols-outlined text-primary text-lg">check_circle</span>
                          <span className="font-medium">Generación automática de propuestas</span>
                       </li>
                       <li className="flex items-start gap-3 text-gray-700 text-sm">
                          <span className="material-symbols-outlined text-primary text-lg">check_circle</span>
                          <span>Acceso a insignias de verificación ("Verified Partner")</span>
                       </li>
                       <li className="flex items-start gap-3 text-gray-700 text-sm">
                          <span className="material-symbols-outlined text-primary text-lg">check_circle</span>
                          <span>Protección de pagos (Escrow) y soporte prioritario</span>
                       </li>
                       <li className="flex items-start gap-3 text-gray-700 text-sm">
                          <span className="material-symbols-outlined text-primary text-lg">check_circle</span>
                          <span>Herramientas de gestión de proyectos</span>
                       </li>
                    </ul>
                 </div>
              </div>
           </div>
        </section>

        {/* Feature Comparison Table */}
        <section className="bg-gray-50 py-20 border-t border-gray-100">
           <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
              <h2 className="text-2xl font-bold text-dark text-center mb-12">Comparativa detallada</h2>
              
              <div className="overflow-x-auto">
                 <table className="w-full text-left border-collapse">
                    <thead>
                       <tr className="border-b border-gray-200">
                          <th className="py-4 px-6 text-sm font-medium text-gray-500 w-1/2">Funcionalidad</th>
                          <th className="py-4 px-6 text-center text-lg font-bold text-dark w-1/4">Starter</th>
                          <th className="py-4 px-6 text-center text-lg font-bold text-primary w-1/4">Pro</th>
                       </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 bg-white">
                       {[
                          { feat: 'Búsquedas con Agente IA', free: '5 / día', pro: 'Ilimitado' },
                          { feat: 'Ver perfiles de empresas', free: true, pro: true },
                          { feat: 'Contactar proveedores', free: false, pro: true },
                          { feat: 'Generador de Propuestas', free: false, pro: true },
                          { feat: 'Gestión de Contratos', free: false, pro: true },
                          { feat: 'Pagos en Escrow', free: false, pro: true },
                          { feat: 'Soporte Técnico', free: 'Email', pro: 'Prioritario 24/7' },
                       ].map((row, i) => (
                          <tr key={i} className="hover:bg-gray-50 transition-colors">
                             <td className="py-4 px-6 text-sm text-gray-700 font-medium">{row.feat}</td>
                             <td className="py-4 px-6 text-center text-sm text-gray-500">
                                {typeof row.free === 'boolean' ? (
                                   row.free ? <span className="material-symbols-outlined text-green-500">check</span> : <span className="material-symbols-outlined text-gray-300">remove</span>
                                ) : row.free}
                             </td>
                             <td className="py-4 px-6 text-center text-sm text-dark font-semibold">
                                {typeof row.pro === 'boolean' ? (
                                   row.pro ? <span className="material-symbols-outlined text-primary">check_circle</span> : <span className="material-symbols-outlined text-gray-300">remove</span>
                                ) : row.pro}
                             </td>
                          </tr>
                       ))}
                    </tbody>
                 </table>
              </div>
           </div>
        </section>

      </main>

      <Footer />
      <FAQWidget />
    </div>
  );
};

export default Pricing;