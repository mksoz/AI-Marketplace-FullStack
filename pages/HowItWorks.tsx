import React from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import Button from '../components/Button';
import FAQWidget from '../components/FAQWidget';

const HowItWorks: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header />
      
      <main className="flex-grow">
        {/* Hero Section */}
        <section className="py-20 sm:py-28 px-4 text-center max-w-4xl mx-auto">
           <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-dark tracking-tight mb-6 font-display">
             Más que un marketplace.<br/>Tu sistema operativo de IA.
           </h1>
           <p className="text-xl text-gray-500 mb-10 max-w-2xl mx-auto leading-relaxed">
             Desde la definición de la idea hasta la entrega final del código. Centralizamos la contratación, los pagos y la gestión para que construyas software con total tranquilidad.
           </p>
           <Button size="lg" onClick={() => navigate('/signup')}>Comenzar ahora</Button>
        </section>

        {/* The Workflow - Zig Zag Layout */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-24">
           
           {/* Step 1 */}
           <div className="flex flex-col md:flex-row items-center gap-12 lg:gap-20">
              <div className="w-full md:w-1/2 relative">
                 <div className="aspect-[4/3] bg-gray-50 rounded-2xl border border-gray-100 flex items-center justify-center relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-tr from-blue-50 to-transparent"></div>
                    <span className="material-symbols-outlined text-9xl text-blue-200 relative z-10">forum</span>
                    {/* Simulated Chat Bubble */}
                    <div className="absolute bottom-8 left-8 right-8 bg-white p-4 rounded-xl shadow-card border border-gray-100 z-20 animate-in slide-in-from-bottom-4 fade-in duration-700">
                       <div className="flex gap-3 items-center">
                          <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center"><span className="material-symbols-outlined text-sm">smart_toy</span></div>
                          <div className="h-2 bg-gray-100 rounded w-3/4"></div>
                       </div>
                       <div className="mt-2 h-2 bg-gray-100 rounded w-1/2 ml-11"></div>
                    </div>
                 </div>
              </div>
              <div className="w-full md:w-1/2">
                 <span className="text-primary font-bold text-sm uppercase tracking-wider mb-2 block">Paso 1</span>
                 <h2 className="text-3xl font-bold text-dark mb-4">Cuéntanos qué quieres construir</h2>
                 <p className="text-lg text-gray-500 leading-relaxed mb-6">
                    No necesitas especificaciones técnicas complejas. Simplemente chatea con nuestro <strong>Agente IA</strong> y describe tu idea en lenguaje natural. Nosotros estructuramos los requisitos por ti.
                 </p>
                 <ul className="space-y-3">
                    {['Definición de alcance asistida', 'Estimación preliminar de presupuesto', 'Sugerencias de tecnologías'].map((item, i) => (
                       <li key={i} className="flex items-center gap-3 text-gray-700">
                          <span className="material-symbols-outlined text-green-500">check_circle</span>
                          {item}
                       </li>
                    ))}
                 </ul>
              </div>
           </div>

           {/* Step 2 */}
           <div className="flex flex-col md:flex-row-reverse items-center gap-12 lg:gap-20">
              <div className="w-full md:w-1/2 relative">
                 <div className="aspect-[4/3] bg-gray-50 rounded-2xl border border-gray-100 flex items-center justify-center relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-bl from-red-50 to-transparent"></div>
                    <span className="material-symbols-outlined text-9xl text-red-200 relative z-10">manage_search</span>
                    {/* Simulated Card Stack */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 bg-white p-4 rounded-xl shadow-card border border-gray-100 z-20 rotate-3">
                       <div className="flex gap-3 items-center mb-3">
                          <div className="w-10 h-10 rounded-lg bg-gray-200"></div>
                          <div>
                             <div className="h-3 bg-gray-200 rounded w-24 mb-1"></div>
                             <div className="h-2 bg-gray-100 rounded w-16"></div>
                          </div>
                       </div>
                       <div className="flex gap-1">
                          <span className="h-6 w-16 bg-green-50 rounded-md"></span>
                          <span className="h-6 w-16 bg-blue-50 rounded-md"></span>
                       </div>
                    </div>
                 </div>
              </div>
              <div className="w-full md:w-1/2">
                 <span className="text-primary font-bold text-sm uppercase tracking-wider mb-2 block">Paso 2</span>
                 <h2 className="text-3xl font-bold text-dark mb-4">Recibe el "Match" perfecto</h2>
                 <p className="text-lg text-gray-500 leading-relaxed mb-6">
                    Nuestro algoritmo analiza miles de proveedores verificados para encontrar aquellos que tienen experiencia exacta en tu industria y stack tecnológico.
                 </p>
                 <ul className="space-y-3">
                    {['Proveedores verificados manualmente', 'Historial de proyectos comprobado', 'Comparativa de "Fit" cultural y técnico'].map((item, i) => (
                       <li key={i} className="flex items-center gap-3 text-gray-700">
                          <span className="material-symbols-outlined text-green-500">check_circle</span>
                          {item}
                       </li>
                    ))}
                 </ul>
              </div>
           </div>

           {/* Step 3 */}
           <div className="flex flex-col md:flex-row items-center gap-12 lg:gap-20">
              <div className="w-full md:w-1/2 relative">
                 <div className="aspect-[4/3] bg-gray-50 rounded-2xl border border-gray-100 flex items-center justify-center relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-tr from-green-50 to-transparent"></div>
                    <span className="material-symbols-outlined text-9xl text-green-200 relative z-10">description</span>
                     {/* Simulated Proposal */}
                     <div className="absolute top-10 right-10 left-10 bottom-10 bg-white rounded-xl shadow-card border border-gray-100 z-20 p-6 flex flex-col justify-between hover:scale-[1.02] transition-transform">
                        <div className="space-y-3">
                           <div className="flex justify-between items-center mb-2">
                              <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                              <span className="px-2 py-1 bg-green-50 text-green-600 rounded text-xs font-bold">VERIFICADO</span>
                           </div>
                           <div className="h-2 bg-gray-100 rounded w-full"></div>
                           <div className="h-2 bg-gray-100 rounded w-full"></div>
                           <div className="h-2 bg-gray-100 rounded w-3/4"></div>
                        </div>
                        <div className="flex items-center justify-between mt-4">
                           <div className="h-6 w-20 bg-gray-100 rounded"></div>
                           <div className="h-8 w-24 bg-primary rounded-lg opacity-90"></div>
                        </div>
                     </div>
                 </div>
              </div>
              <div className="w-full md:w-1/2">
                 <span className="text-primary font-bold text-sm uppercase tracking-wider mb-2 block">Paso 3</span>
                 <h2 className="text-3xl font-bold text-dark mb-4">Propuestas rápidas y claras</h2>
                 <p className="text-lg text-gray-500 leading-relaxed mb-6">
                    Olvida los PDFs interminables. Recibe propuestas estructuradas, claras y comparables generadas automáticamente por el sistema para que tomes decisiones informadas al instante.
                 </p>
                 <ul className="space-y-3">
                    {['Formato estandarizado fácil de comparar', 'Precios y plazos transparentes', 'Contratación con un solo clic'].map((item, i) => (
                       <li key={i} className="flex items-center gap-3 text-gray-700">
                          <span className="material-symbols-outlined text-green-500">check_circle</span>
                          {item}
                       </li>
                    ))}
                 </ul>
              </div>
           </div>

           {/* Step 4 - NEW MANAGEMENT SECTION */}
           <div className="flex flex-col md:flex-row-reverse items-center gap-12 lg:gap-20">
              <div className="w-full md:w-1/2 relative">
                 <div className="aspect-[4/3] bg-gray-50 rounded-2xl border border-gray-100 flex items-center justify-center relative overflow-hidden group">
                    <div className="absolute inset-0 bg-gradient-to-br from-indigo-50 to-purple-50"></div>
                    
                    {/* Simulated Dashboard UI */}
                    <div className="absolute inset-x-8 inset-y-12 bg-white rounded-xl shadow-2xl border border-gray-200 z-20 flex flex-col overflow-hidden transform group-hover:translate-y-[-5px] transition-transform duration-500">
                       {/* Header Mock */}
                       <div className="bg-gray-50 p-3 border-b border-gray-100 flex gap-2">
                          <div className="w-3 h-3 rounded-full bg-red-400"></div>
                          <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                          <div className="w-3 h-3 rounded-full bg-green-400"></div>
                       </div>
                       
                       <div className="p-5 flex-1 flex flex-col gap-4">
                          {/* Progress Card */}
                          <div className="bg-white border border-gray-100 rounded-lg p-3 shadow-sm">
                             <div className="flex justify-between items-center mb-2">
                                <span className="text-xs font-bold text-gray-500">Hito Actual: MVP</span>
                                <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">En Progreso</span>
                             </div>
                             <div className="w-full bg-gray-100 rounded-full h-2">
                                <div className="bg-indigo-500 h-2 rounded-full w-2/3"></div>
                             </div>
                          </div>

                          {/* Escrow Badge */}
                          <div className="flex items-center gap-3 bg-green-50 p-3 rounded-lg border border-green-100">
                             <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-green-600 shadow-sm">
                                <span className="material-symbols-outlined text-sm">lock</span>
                             </div>
                             <div>
                                <p className="text-xs font-bold text-green-800">Fondos en Garantía</p>
                                <p className="text-[10px] text-green-600">Liberación tras tu aprobación</p>
                             </div>
                          </div>
                       </div>
                    </div>

                    {/* Floating Element: Files */}
                    <div className="absolute -right-4 bottom-20 bg-white p-3 rounded-lg shadow-floating border border-gray-100 z-30 animate-in slide-in-from-right-8 fade-in duration-1000 delay-300">
                        <div className="flex items-center gap-2">
                            <span className="material-symbols-outlined text-blue-500">folder_open</span>
                            <div>
                                <p className="text-xs font-bold text-gray-800">Entregables.zip</p>
                                <p className="text-[10px] text-gray-400">Subido hace 2m</p>
                            </div>
                        </div>
                    </div>
                 </div>
              </div>
              <div className="w-full md:w-1/2">
                 <span className="text-indigo-600 font-bold text-sm uppercase tracking-wider mb-2 block">Paso 4</span>
                 <h2 className="text-3xl font-bold text-dark mb-4">Tranquilidad y Control Total</h2>
                 <p className="text-lg text-gray-500 leading-relaxed mb-6">
                    Tu proyecto no termina con la firma. Te damos un <strong>Dashboard completo</strong> para supervisar hitos, gestionar archivos y controlar el presupuesto.
                 </p>
                 <ul className="space-y-4">
                    <li className="flex items-start gap-3">
                       <div className="w-6 h-6 rounded-full bg-green-100 text-green-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <span className="material-symbols-outlined text-sm">lock</span>
                       </div>
                       <div>
                          <strong className="text-gray-900 block text-sm">Modelo Escrow (Garantía)</strong>
                          <span className="text-gray-600 text-sm">Tus fondos están seguros y solo se liberan al vendor cuando apruebas los entregables.</span>
                       </div>
                    </li>
                    <li className="flex items-start gap-3">
                       <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <span className="material-symbols-outlined text-sm">calendar_month</span>
                       </div>
                       <div>
                          <strong className="text-gray-900 block text-sm">Seguimiento en Tiempo Real</strong>
                          <span className="text-gray-600 text-sm">Calendario integrado, chat centralizado y repositorio de archivos en un solo lugar.</span>
                       </div>
                    </li>
                 </ul>
              </div>
           </div>

        </section>

        {/* Trust Factors */}
        <section className="bg-gray-50 py-20 border-t border-gray-100">
           <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center max-w-2xl mx-auto mb-16">
                 <h2 className="text-3xl font-bold text-dark">¿Por qué AI Dev Connect?</h2>
                 <p className="text-gray-500 mt-4 text-lg">Más que un directorio, somos tu socio tecnológico en todo el ciclo de vida del proyecto.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                 {[
                    { title: "Verificación Rigurosa", icon: "verified_user", desc: "Solo aceptamos al top 5% de las agencias que aplican. Revisamos código, finanzas y satisfacción de clientes anteriores." },
                    { title: "Garantía de Proyecto", icon: "shield_lock", desc: "Sin riesgos. Si el vendor no cumple, nuestro sistema de arbitraje y Escrow protege tu inversión." },
                    { title: "Soporte Técnico", icon: "support_agent", desc: "Si algo sale mal, nuestros expertos técnicos median para asegurar que el proyecto llegue a buen puerto." }
                 ].map((feat, i) => (
                    <div key={i} className="bg-white p-8 rounded-2xl border border-gray-200 shadow-sm hover:shadow-card transition-shadow">
                       <div className="w-14 h-14 bg-gray-50 rounded-xl flex items-center justify-center text-dark mb-6">
                          <span className="material-symbols-outlined text-3xl">{feat.icon}</span>
                       </div>
                       <h3 className="text-xl font-bold text-dark mb-3">{feat.title}</h3>
                       <p className="text-gray-500 leading-relaxed">{feat.desc}</p>
                    </div>
                 ))}
              </div>
           </div>
        </section>

        {/* Bottom CTA */}
        <section className="py-24 px-4 bg-white text-center">
           <h2 className="text-3xl sm:text-4xl font-bold text-dark mb-6">¿Listo para empezar tu proyecto?</h2>
           <p className="text-xl text-gray-500 mb-10 max-w-2xl mx-auto">
              Únete a cientos de empresas innovadoras que ya están construyendo el futuro con nosotros.
           </p>
           <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Button size="lg" onClick={() => navigate('/signup')}>Crear cuenta gratis</Button>
              <Button size="lg" variant="outline" onClick={() => navigate('/search')}>Ver demos de IA</Button>
           </div>
        </section>
      </main>

      <Footer />
      <FAQWidget />
    </div>
  );
};

export default HowItWorks;