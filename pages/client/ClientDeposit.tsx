import React from 'react';
import ClientLayout from '../../components/ClientLayout';

const ClientDeposit: React.FC = () => {
  return (
    <ClientLayout>
       <div className="max-w-6xl mx-auto space-y-8">
          <h1 className="text-3xl font-black text-gray-900">Realizar Depósito Seguro para el Proyecto</h1>

          {/* Stepper */}
          <div className="flex gap-4">
             <div className="px-4 py-1.5 bg-blue-50 text-[#1313ec] font-bold text-sm rounded-lg">1. Detalles</div>
             <div className="px-4 py-1.5 bg-gray-100 text-gray-500 font-medium text-sm rounded-lg">2. Pago</div>
             <div className="px-4 py-1.5 bg-gray-100 text-gray-500 font-medium text-sm rounded-lg">3. Confirmación</div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
             <div className="lg:col-span-2 space-y-8">
                {/* Deposit Amount */}
                <div className="bg-white p-8 rounded-xl border border-gray-200 shadow-sm">
                   <h2 className="text-xl font-bold text-gray-900 mb-6">Selecciona el monto a depositar</h2>
                   <div className="space-y-4">
                      <label className="flex items-center p-4 border-2 border-[#1313ec] bg-blue-50/50 rounded-lg cursor-pointer">
                         <input type="radio" name="deposit" defaultChecked className="w-5 h-5 text-[#1313ec] focus:ring-[#1313ec]" />
                         <div className="ml-4">
                            <p className="font-bold text-gray-900">Depositar el total del proyecto</p>
                            <p className="text-sm text-gray-500">$15,000.00 USD</p>
                         </div>
                      </label>
                      <label className="flex items-center p-4 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                         <input type="radio" name="deposit" className="w-5 h-5 text-[#1313ec] focus:ring-[#1313ec]" />
                         <div className="ml-4">
                            <p className="font-bold text-gray-900">Depositar por hito actual (Hito 1: Diseño UI/UX)</p>
                            <p className="text-sm text-gray-500">$5,000.00 USD</p>
                         </div>
                      </label>
                   </div>
                </div>

                {/* Payment Method */}
                <div className="bg-white p-8 rounded-xl border border-gray-200 shadow-sm">
                   <h2 className="text-xl font-bold text-gray-900 mb-6">Elige tu método de pago</h2>
                   <div className="space-y-4">
                      <div className="p-4 border border-[#1313ec] bg-blue-50/30 rounded-lg">
                         <label className="flex items-center cursor-pointer mb-4">
                            <input type="radio" name="method" defaultChecked className="w-4 h-4 text-[#1313ec] focus:ring-[#1313ec]" />
                            <span className="ml-3 font-bold text-gray-900">Tarjeta de crédito/débito</span>
                         </label>
                         <div className="pl-7 space-y-4">
                            <div>
                               <label className="block text-sm font-medium text-gray-700 mb-1">Número de Tarjeta</label>
                               <input type="text" placeholder="•••• •••• •••• 1234" className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#1313ec] outline-none" />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                               <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-1">Fecha de Vencimiento</label>
                                  <input type="text" placeholder="MM / AA" className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#1313ec] outline-none" />
                               </div>
                               <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-1">CVC</label>
                                  <input type="text" placeholder="123" className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#1313ec] outline-none" />
                               </div>
                            </div>
                         </div>
                      </div>
                      <label className="flex items-center p-4 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                         <input type="radio" name="method" className="w-4 h-4 text-[#1313ec] focus:ring-[#1313ec]" />
                         <span className="ml-3 font-bold text-gray-900">Transferencia bancaria</span>
                      </label>
                   </div>
                </div>
             </div>

             {/* Sidebar Summary */}
             <div className="space-y-6">
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm sticky top-24">
                   <h3 className="text-lg font-bold text-gray-900 mb-4">Resumen del Proyecto</h3>
                   <div className="space-y-3 text-sm pb-4 border-b border-dashed border-gray-300">
                      <div className="flex justify-between">
                         <span className="text-gray-500">Nombre del Proyecto</span>
                         <span className="font-medium text-gray-900">Proyecto Alpha</span>
                      </div>
                      <div className="flex justify-between">
                         <span className="text-gray-500">Proveedor de IA</span>
                         <span className="font-medium text-gray-900">QuantumLeap AI</span>
                      </div>
                      <div className="flex justify-between">
                         <span className="text-gray-500">Costo Total</span>
                         <span className="font-medium text-gray-900">$15,000.00 USD</span>
                      </div>
                   </div>
                   <div className="flex justify-between items-center pt-4 mb-6">
                      <span className="text-lg font-bold text-gray-900">Monto a Depositar</span>
                      <span className="text-xl font-bold text-[#1313ec]">$15,000.00</span>
                   </div>

                   <div className="bg-green-50 border border-green-100 p-4 rounded-lg flex gap-3 mb-6">
                      <span className="material-symbols-outlined text-green-600">lock</span>
                      <div>
                         <h4 className="font-bold text-green-800 text-sm">Pago 100% Seguro</h4>
                         <p className="text-xs text-green-700 mt-1 leading-tight">Tus fondos se mantienen seguros en depósito (escrow) y solo se liberan tras tu aprobación.</p>
                      </div>
                   </div>

                   <button className="w-full py-3 bg-[#1313ec] text-white font-bold rounded-lg hover:opacity-90 shadow-lg shadow-blue-200 flex items-center justify-center gap-2">
                      <span className="material-symbols-outlined">verified_user</span>
                      Pagar y Depositar
                   </button>
                </div>
             </div>
          </div>
       </div>
    </ClientLayout>
  );
};

export default ClientDeposit;