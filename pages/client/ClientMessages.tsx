import React, { useState } from 'react';
import ClientLayout from '../../components/ClientLayout';
import Modal from '../../components/Modal';

// Mock data for the chats
const MOCK_CHATS = [
   {
      id: '1',
      companyId: '1', // QuantumLeap (mapped from constants)
      name: 'QuantumLeap Analytics',
      lastMessage: 'Sounds good, I\'ll review the agreement.',
      time: '10:42 AM',
      unread: 2,
      online: true,
      avatar: 'https://picsum.photos/id/40/200/200',
      messages: [
         { id: 'm1', role: 'vendor', text: '¡Hola! He revisado el brief del proyecto y tengo algunas ideas iniciales que me gustaría compartir. ¿Tienes un momento para discutirlo?', time: '10:40 AM' },
         { id: 'm2', role: 'client', text: 'Hola, claro. Estoy disponible ahora. ¡Adelante!', time: '10:41 AM' },
         { id: 'm3', role: 'vendor', text: 'Genial. Te he preparado un borrador inicial del contrato de descubrimiento. Lo puedes encontrar en la pestaña de "Acuerdos". Incluye los hitos y entregables que propongo.', time: '10:42 AM' },
      ]
   },
   {
      id: '2',
      companyId: '2',
      name: 'InnovateAI Solutions',
      lastMessage: 'Perfect, thank you!',
      time: 'Ayer',
      unread: 0,
      online: false,
      avatar: 'https://picsum.photos/id/50/200/200',
      messages: []
   },
   {
      id: '3',
      companyId: '3',
      name: 'DataDriven Dynamics',
      lastMessage: 'The files are attached.',
      time: 'Lunes',
      unread: 0,
      online: false,
      avatar: 'https://picsum.photos/id/60/200/200',
      messages: []
   }
];

const ClientMessages: React.FC = () => {
   const [selectedChatId, setSelectedChatId] = useState<string>('1');
   const [inputText, setInputText] = useState('');
   const [showChatOnMobile, setShowChatOnMobile] = useState(false);

   // Meeting Scheduler State
   const [showScheduler, setShowScheduler] = useState(false);
   const [meetingDate, setMeetingDate] = useState('');
   const [meetingTime, setMeetingTime] = useState('');
   const [customDuration, setCustomDuration] = useState('');

   const selectedChat = MOCK_CHATS.find(c => c.id === selectedChatId) || MOCK_CHATS[0];

   const handleScheduleSubmit = () => {
      // Logic to send invite
      alert(`Invitación enviada para el ${meetingDate} a las ${meetingTime}`);
      setShowScheduler(false);
   };

   const handleChatSelect = (chatId: string) => {
      setSelectedChatId(chatId);
      setShowChatOnMobile(true);
   };

   return (
      <ClientLayout fullHeight>
         <div className="flex h-full w-full bg-white relative">

            {/* LEFT COLUMN: Chat List */}
            <aside className={`w-full md:w-80 border-r border-gray-200 flex-col bg-white ${showChatOnMobile ? 'hidden md:flex' : 'flex'}`}>
               <div className="p-4 border-b border-gray-100 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                     <div className="w-10 h-10 rounded-full bg-gray-200 bg-cover bg-center" style={{ backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuD56sMogw_VBB9yDp-jxxYeihYrC8RGmccLUN9_8TyhtQFMfYRISR5MkcUL3DhYdjP1W0idTNuYYx4IYzTgsCsrrcJaTze-5aPqLr5-AdStPpGbPg-2H_HeF5zIOU2rNNB5Lxf5iOdEDlFBsR52qtxTSD2vGaLIYzxsMLLYLyKYXQTRRtzfZLohcIfqB5u2JzB7FilkC1Z1O-blivYoU_3uGvwBDlTeW3TCocCvcIy_2FoXiX5_TXgdkdB_hgJ3-uGTBLmqDSTeAU8")' }}></div>
                     <div>
                        <h2 className="font-bold text-gray-900 text-sm">Cliente Corp</h2>
                        <p className="text-xs text-gray-500 font-medium">CLIENTE</p>
                     </div>
                  </div>
                  <button className="p-2 text-gray-400 hover:bg-gray-50 rounded-full transition-colors">
                     <span className="material-symbols-outlined">more_horiz</span>
                  </button>
               </div>

               <div className="p-4 border-b border-gray-100">
                  <div className="relative">
                     <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">search</span>
                     <input
                        type="text"
                        placeholder="Buscar mensajes..."
                        className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                     />
                  </div>
               </div>

               <nav className="flex-1 overflow-y-auto p-2 space-y-1">
                  {MOCK_CHATS.map(chat => (
                     <div
                        key={chat.id}
                        onClick={() => handleChatSelect(chat.id)}
                        className={`flex gap-3 p-3 rounded-xl cursor-pointer transition-colors ${selectedChatId === chat.id ? 'bg-primary/10' : 'hover:bg-gray-50'}`}
                     >
                        <div className="relative flex-shrink-0">
                           <img src={chat.avatar} alt={chat.name} className="w-12 h-12 rounded-full object-cover" />
                           {chat.online && <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></span>}
                        </div>
                        <div className="flex-1 min-w-0 flex flex-col justify-center">
                           <div className="flex justify-between items-baseline mb-0.5">
                              <h3 className="font-bold text-sm text-gray-900 truncate pr-2">{chat.name}</h3>
                              <span className="text-xs text-gray-400 flex-shrink-0">{chat.time}</span>
                           </div>
                           <div className="flex justify-between items-center">
                              <p className={`text-sm truncate ${selectedChatId === chat.id ? 'text-primary font-medium' : 'text-gray-500'}`}>{chat.lastMessage}</p>
                              {chat.unread > 0 && (
                                 <span className="ml-2 w-5 h-5 flex items-center justify-center bg-primary text-white text-xs font-bold rounded-full">{chat.unread}</span>
                              )}
                           </div>
                        </div>
                     </div>
                  ))}
               </nav>
            </aside>

            {/* MIDDLE COLUMN: Chat Interface */}
            <main className={`flex-1 flex-col bg-gray-50 min-w-0 ${showChatOnMobile ? 'flex fixed inset-0 z-50 bg-white' : 'hidden md:flex'}`}>
               {/* Chat Header */}
               <header className="h-18 px-4 md:px-6 py-4 bg-white border-b border-gray-200 flex justify-between items-center shadow-sm z-10 sticky top-0">
                  <div className="flex items-center gap-3">
                     <button
                        onClick={() => setShowChatOnMobile(false)}
                        className="md:hidden p-2 -ml-2 text-gray-600 rounded-full hover:bg-gray-100"
                     >
                        <span className="material-symbols-outlined">arrow_back</span>
                     </button>
                     <div className="relative">
                        <img src={selectedChat.avatar} alt={selectedChat.name} className="w-10 h-10 rounded-full object-cover" />
                        {selectedChat.online && <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-white rounded-full"></span>}
                     </div>
                     <div>
                        <h2 className="font-bold text-gray-900 leading-tight">{selectedChat.name}</h2>
                        <p className="text-xs text-green-600 font-medium">{selectedChat.online ? 'Online' : 'Offline'}</p>
                     </div>
                  </div>
                  <div className="flex items-center gap-2">
                     {/* Schedule Button (Icon Only) */}
                     <button
                        onClick={() => setShowScheduler(true)}
                        className="p-2.5 bg-white border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors tooltip"
                        title="Agendar Videollamada"
                     >
                        <span className="material-symbols-outlined text-xl">calendar_add_on</span>
                     </button>
                     <button className="flex items-center justify-center p-2.5 bg-primary text-white rounded-lg hover:bg-primary/90 shadow-sm transition-colors tooltip" title="Llamada Inmediata">
                        <span className="material-symbols-outlined text-xl">videocam</span>
                     </button>
                     <button className="p-2 text-gray-400 hover:bg-gray-100 rounded-lg transition-colors hidden sm:block">
                        <span className="material-symbols-outlined">more_vert</span>
                     </button>
                  </div>
               </header>

               {/* Messages Feed */}
               <div className="flex-1 overflow-y-auto p-6 space-y-6">
                  <div className="flex justify-center">
                     <span className="text-xs font-medium text-gray-400 bg-gray-100 px-3 py-1 rounded-full">Hoy</span>
                  </div>

                  {selectedChat.messages.map(msg => (
                     <div key={msg.id} className={`flex items-start gap-3 ${msg.role === 'client' ? 'flex-row-reverse' : ''}`}>
                        <img
                           src={msg.role === 'client' ? 'https://lh3.googleusercontent.com/aida-public/AB6AXuD56sMogw_VBB9yDp-jxxYeihYrC8RGmccLUN9_8TyhtQFMfYRISR5MkcUL3DhYdjP1W0idTNuYYx4IYzTgsCsrrcJaTze-5aPqLr5-AdStPpGbPg-2H_HeF5zIOU2rNNB5Lxf5iOdEDlFBsR52qtxTSD2vGaLIYzxsMLLYLyKYXQTRRtzfZLohcIfqB5u2JzB7FilkC1Z1O-blivYoU_3uGvwBDlTeW3TCocCvcIy_2FoXiX5_TXgdkdB_hgJ3-uGTBLmqDSTeAU8' : selectedChat.avatar}
                           alt="Avatar"
                           className="w-8 h-8 rounded-full object-cover flex-shrink-0"
                        />
                        <div className={`flex flex-col max-w-[70%] ${msg.role === 'client' ? 'items-end' : 'items-start'}`}>
                           <div className={`p-4 rounded-2xl text-sm leading-relaxed shadow-sm ${msg.role === 'client'
                              ? 'bg-primary text-white rounded-br-none'
                              : 'bg-white text-gray-800 rounded-bl-none border border-gray-100'
                              }`}>
                              {msg.text}
                           </div>
                           <span className="text-xs text-gray-400 mt-1 px-1">{msg.time}</span>
                        </div>
                     </div>
                  ))}
               </div>

               {/* Input Area */}
               <div className="p-4 bg-white border-t border-gray-200">
                  <div className="flex items-end gap-2 max-w-4xl mx-auto">
                     <button className="p-3 text-gray-400 hover:bg-gray-100 rounded-full transition-colors">
                        <span className="material-symbols-outlined">add_circle</span>
                     </button>
                     <div className="flex-1 bg-gray-50 border border-gray-200 rounded-2xl flex items-center p-2 focus-within:ring-2 focus-within:ring-primary focus-within:border-transparent focus-within:bg-white transition-all">
                        <input
                           type="text"
                           placeholder="Escribe tu mensaje..."
                           value={inputText}
                           onChange={(e) => setInputText(e.target.value)}
                           className="flex-1 bg-transparent border-none focus:ring-0 px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 max-h-32"
                        />
                        <div className="flex gap-1 pr-2">
                           <button className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-200 transition-colors">
                              <span className="material-symbols-outlined text-xl">attach_file</span>
                           </button>
                           <button className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-200 transition-colors">
                              <span className="material-symbols-outlined text-xl">mood</span>
                           </button>
                        </div>
                     </div>
                     <button className="p-3 bg-primary text-white rounded-full shadow-sm hover:bg-primary/90 transition-colors flex items-center justify-center">
                        <span className="material-symbols-outlined">send</span>
                     </button>
                  </div>
               </div>
            </main>

            {/* RIGHT COLUMN: Collaboration Hub */}
            <aside className="w-80 border-l border-gray-200 bg-white flex flex-col hidden xl:flex">
               {/* Tabs */}
               <div className="flex border-b border-gray-200">
                  <button className="flex-1 py-4 text-sm font-bold text-primary border-b-2 border-primary">Acuerdos</button>
                  <button className="flex-1 py-4 text-sm font-medium text-gray-500 hover:text-gray-800 border-b-2 border-transparent hover:border-gray-200 transition-colors">Archivos</button>
               </div>
               <div className="flex-1 overflow-y-auto p-4 space-y-6">
                  <div>
                     <h3 className="font-bold text-gray-900 mb-3 text-sm uppercase tracking-wider">Acuerdos Activos</h3>
                     <div className="border border-gray-200 rounded-xl p-4 bg-gray-50/50 hover:bg-white hover:shadow-sm transition-all cursor-pointer mb-3">
                        <div className="flex justify-between items-start mb-2">
                           <div>
                              <h4 className="font-bold text-gray-900 text-sm">Contrato de Descubrimiento</h4>
                              <p className="text-xs text-gray-500">v1.0 • Pendiente de Revisión</p>
                           </div>
                           <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                        </div>
                        <div className="flex justify-between items-center mt-2">
                           <span className="text-xs text-gray-400">15 Mayo, 2024</span>
                           <span className="material-symbols-outlined text-gray-400 text-sm">more_horiz</span>
                        </div>
                     </div>
                  </div>
               </div>
            </aside>

         </div>

         {/* Schedule Meeting Modal */}
         <Modal isOpen={showScheduler} onClose={() => setShowScheduler(false)} title="Programar Reunión">
            <div className="space-y-6">
               <div className="flex items-center gap-4 bg-blue-50 p-4 rounded-xl border border-blue-100">
                  <div className="bg-white p-2 rounded-lg shadow-sm">
                     <span className="material-symbols-outlined text-primary text-2xl">videocam</span>
                  </div>
                  <div>
                     <h4 className="font-bold text-gray-900">Videollamada con {selectedChat.name}</h4>
                     <p className="text-xs text-gray-500">Se enviará una invitación a ambos calendarios.</p>
                  </div>
               </div>

               <div className="grid grid-cols-2 gap-4">
                  <div>
                     <label className="block text-xs font-bold text-gray-700 mb-1 uppercase">Fecha</label>
                     <input
                        type="date"
                        className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                        onChange={(e) => setMeetingDate(e.target.value)}
                     />
                  </div>
                  <div>
                     <label className="block text-xs font-bold text-gray-700 mb-1 uppercase">Hora</label>
                     <input
                        type="time"
                        className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                        onChange={(e) => setMeetingTime(e.target.value)}
                     />
                  </div>
               </div>

               <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1 uppercase">Duración</label>
                  <div className="flex flex-wrap gap-2">
                     {['30 min', '45 min', '60 min'].map((dur) => (
                        <button key={dur} className="flex-1 py-2 px-3 border border-gray-200 rounded-lg text-sm font-medium hover:bg-primary hover:text-white hover:border-primary transition-colors focus:bg-primary focus:text-white whitespace-nowrap">
                           {dur}
                        </button>
                     ))}
                     <input
                        type="number"
                        placeholder="Min. Custom"
                        className="w-24 p-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-center outline-none focus:ring-2 focus:ring-primary/20"
                        value={customDuration}
                        onChange={(e) => setCustomDuration(e.target.value)}
                     />
                  </div>
               </div>

               <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1 uppercase">Invitar Equipo (Vendor)</label>
                  <div className="border border-gray-200 rounded-lg p-3 max-h-32 overflow-y-auto space-y-2">
                     <label className="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" className="rounded text-primary focus:ring-primary" />
                        <span className="text-sm text-gray-700">Lead Developer</span>
                     </label>
                     <label className="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" className="rounded text-primary focus:ring-primary" />
                        <span className="text-sm text-gray-700">Project Manager</span>
                     </label>
                     <label className="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" className="rounded text-primary focus:ring-primary" />
                        <span className="text-sm text-gray-700">Designer UI/UX</span>
                     </label>
                  </div>
               </div>

               <div className="pt-2">
                  <button onClick={handleScheduleSubmit} className="w-full py-3 bg-primary text-white font-bold rounded-xl hover:opacity-90 shadow-lg shadow-red-100 transition-all transform active:scale-[0.98]">
                     Enviar Invitación
                  </button>
               </div>
            </div>
         </Modal>
      </ClientLayout>
   );
};

export default ClientMessages;