import React from 'react';
import VendorLayout from '../../components/VendorLayout';
import ClientMessages from '../client/ClientMessages';

import { useState } from 'react';
import Modal from '../../components/Modal';

// Mock data for the chats (Vendor Perspective)
const MOCK_CHATS = [
  {
    id: '1',
    companyId: 'c1',
    name: 'Cliente Corp', 
    lastMessage: '¿Cuándo podríamos ver el avance?',
    time: '10:42 AM',
    unread: 1,
    online: true,
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD56sMogw_VBB9yDp-jxxYeihYrC8RGmccLUN9_8TyhtQFMfYRISR5MkcUL3DhYdjP1W0idTNuYYx4IYzTgsCsrrcJaTze-5aPqLr5-AdStPpGbPg-2H_HeF5zIOU2rNNB5Lxf5iOdEDlFBsR52qtxTSD2vGaLIYzxsMLLYLyKYXQTRRtzfZLohcIfqB5u2JzB7FilkC1Z1O-blivYoU_3uGvwBDlTeW3TCocCvcIy_2FoXiX5_TXgdkdB_hgJ3-uGTBLmqDSTeAU8',
    messages: [
      { id: 'm1', role: 'vendor', text: 'Hola, hemos avanzado con el modelo base.', time: '10:40 AM' },
      { id: 'm2', role: 'client', text: '¡Genial! ¿Cuándo podríamos ver el avance?', time: '10:42 AM' },
    ]
  },
  {
    id: '2',
    companyId: 'c2',
    name: 'Logistics Pro',
    lastMessage: 'Factura recibida, gracias.',
    time: 'Ayer',
    unread: 0,
    online: false,
    avatar: 'https://ui-avatars.com/api/?name=Logistics+Pro&background=random',
    messages: []
  }
];

const VendorMessages: React.FC = () => {
  const [selectedChatId, setSelectedChatId] = useState<string>('1');
  const [inputText, setInputText] = useState('');
  
  // Meeting Scheduler State
  const [showScheduler, setShowScheduler] = useState(false);
  const [meetingDate, setMeetingDate] = useState('');
  const [meetingTime, setMeetingTime] = useState('');
  const [customDuration, setCustomDuration] = useState('');

  const selectedChat = MOCK_CHATS.find(c => c.id === selectedChatId) || MOCK_CHATS[0];

  const handleScheduleSubmit = () => {
    alert(`Invitación enviada para el ${meetingDate} a las ${meetingTime}`);
    setShowScheduler(false);
  };

  return (
    <VendorLayout fullHeight>
      <div className="flex h-full w-full bg-white">
        
        {/* LEFT COLUMN: Chat List */}
        <aside className="w-80 border-r border-gray-200 flex flex-col bg-white">
          <div className="p-4 border-b border-gray-100 flex items-center justify-between">
             <h2 className="font-bold text-gray-900 text-lg">Mensajes</h2>
             <button className="p-2 text-gray-400 hover:bg-gray-50 rounded-full transition-colors">
                <span className="material-symbols-outlined">edit_square</span>
             </button>
          </div>
          <nav className="flex-1 overflow-y-auto p-2 space-y-1">
             {MOCK_CHATS.map(chat => (
                <div 
                  key={chat.id}
                  onClick={() => setSelectedChatId(chat.id)}
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
        <main className="flex-1 flex flex-col bg-gray-50 min-w-0">
           {/* Chat Header */}
           <header className="h-18 px-6 py-4 bg-white border-b border-gray-200 flex justify-between items-center shadow-sm z-10">
              <div className="flex items-center gap-3">
                 <div className="relative">
                    <img src={selectedChat.avatar} alt={selectedChat.name} className="w-10 h-10 rounded-full object-cover" />
                    {selectedChat.online && <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-white rounded-full"></span>}
                 </div>
                 <div>
                    <h2 className="font-bold text-gray-900">{selectedChat.name}</h2>
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
              </div>
           </header>

           {/* Messages Feed */}
           <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {selectedChat.messages.map(msg => (
                 <div key={msg.id} className={`flex items-start gap-3 ${msg.role === 'vendor' ? 'flex-row-reverse' : ''}`}>
                    <div className={`flex flex-col max-w-[70%] ${msg.role === 'vendor' ? 'items-end' : 'items-start'}`}>
                       <div className={`p-4 rounded-2xl text-sm leading-relaxed shadow-sm ${
                          msg.role === 'vendor' 
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
                 <div className="flex-1 bg-gray-50 border border-gray-200 rounded-2xl flex items-center p-2 focus-within:ring-2 focus-within:ring-primary focus-within:border-transparent focus-within:bg-white transition-all">
                    <input 
                      type="text" 
                      placeholder="Escribe tu mensaje..."
                      value={inputText}
                      onChange={(e) => setInputText(e.target.value)}
                      className="flex-1 bg-transparent border-none focus:ring-0 px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 max-h-32"
                    />
                 </div>
                 <button className="p-3 bg-primary text-white rounded-full shadow-sm hover:bg-primary/90 transition-colors flex items-center justify-center">
                    <span className="material-symbols-outlined">send</span>
                 </button>
              </div>
           </div>
        </main>
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

            <div className="pt-2">
               <button onClick={handleScheduleSubmit} className="w-full py-3 bg-primary text-white font-bold rounded-xl hover:opacity-90 shadow-lg shadow-red-100 transition-all transform active:scale-[0.98]">
                  Enviar Invitación
               </button>
            </div>
         </div>
      </Modal>
    </VendorLayout>
  );
};

export default VendorMessages;