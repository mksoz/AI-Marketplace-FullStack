import React, { useState } from 'react';
import { sendMessageToGemini } from '../services/geminiService';

const FAQWidget: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<{role: 'user'|'model', text: string}[]>([
    { role: 'model', text: '¡Hola! ¿En qué puedo ayudarte hoy?' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {
    if (!input.trim()) return;
    const userMsg = input;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setLoading(true);

    const response = await sendMessageToGemini(userMsg, "User is asking for help in the FAQ widget.");
    setMessages(prev => [...prev, { role: 'model', text: response }]);
    setLoading(false);
  };

  return (
    <div className="fixed bottom-6 left-6 z-50 flex flex-col items-start">
       {isOpen && (
         <div className="mb-4 w-80 sm:w-96 bg-white rounded-2xl shadow-floating border border-gray-100 overflow-hidden flex flex-col animate-in slide-in-from-bottom-5 fade-in duration-200" style={{ height: '500px' }}>
            <div className="bg-primary p-4 flex justify-between items-center text-white">
               <h3 className="font-bold">Asistente Virtual</h3>
               <button onClick={() => setIsOpen(false)} className="hover:bg-white/20 p-1 rounded-full transition-colors">
                  <span className="material-symbols-outlined text-xl">close</span>
               </button>
            </div>
            <div className="flex-1 p-4 overflow-y-auto bg-gray-50 flex flex-col gap-3">
               {messages.map((m, i) => (
                 <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[80%] p-3 rounded-2xl text-sm ${
                      m.role === 'user' 
                      ? 'bg-primary text-white rounded-tr-none' 
                      : 'bg-white text-gray-700 border border-gray-200 rounded-tl-none shadow-sm'
                    }`}>
                      {m.text}
                    </div>
                 </div>
               ))}
               {loading && (
                 <div className="flex justify-start">
                   <div className="bg-white p-3 rounded-2xl rounded-tl-none border border-gray-200 shadow-sm flex gap-1">
                     <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                     <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-75"></div>
                     <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-150"></div>
                   </div>
                 </div>
               )}
            </div>
            <div className="p-3 bg-white border-t border-gray-100">
               <div className="flex items-center gap-2 bg-gray-50 rounded-full px-4 py-2 border border-gray-200 focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all">
                  <input 
                    className="bg-transparent w-full text-sm outline-none placeholder:text-gray-400"
                    placeholder="Escribe tu pregunta..."
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                  />
                  <button onClick={handleSend} disabled={loading} className="text-primary disabled:opacity-50">
                     <span className="material-symbols-outlined">send</span>
                  </button>
               </div>
            </div>
         </div>
       )}

       <button 
         onClick={() => setIsOpen(!isOpen)}
         className="h-14 w-14 bg-primary text-white rounded-full shadow-floating flex items-center justify-center hover:scale-105 transition-transform active:scale-95"
       >
         <span className="material-symbols-outlined text-3xl">
           {isOpen ? 'expand_more' : 'chat_bubble'}
         </span>
       </button>
    </div>
  );
};

export default FAQWidget;