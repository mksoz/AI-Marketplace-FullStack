
import React, { useState, useEffect, useRef } from 'react';
import VendorLayout from '../../components/VendorLayout';
import Modal from '../../components/Modal';
import api from '../../services/api';
import ConfirmationModal from '../../components/ConfirmationModal';
import ReportModal from '../../components/ReportModal';
import DebugErrorBoundary from '../../components/DebugErrorBoundary';

interface Chat {
   id: string;
   projectId: string;
   projectTitle: string;
   counterpartyName: string;
   lastMessage: string;
   updatedAt: string;
   unread: number;
   isArchived: boolean;
}

interface Message {
   id: string;
   content: string;
   senderId: string;
   createdAt: string;
   sender: {
      id: string;
      email: string;
      role: string;
   }
}

const VendorMessagesContent: React.FC = () => {
   const [chats, setChats] = useState<Chat[]>([]);
   const [selectedChat, setSelectedChat] = useState<Chat | null>(null);
   const [messages, setMessages] = useState<Message[]>([]);
   const [inputText, setInputText] = useState('');
   const [loading, setLoading] = useState(true);
   const [userId, setUserId] = useState('');
   const [userEmail, setUserEmail] = useState('');
   const [searchQuery, setSearchQuery] = useState('');

   const [showChatOnMobile, setShowChatOnMobile] = useState(false);
   const [showScheduler, setShowScheduler] = useState(false);
   const [meetingDate, setMeetingDate] = useState('');
   const [meetingTime, setMeetingTime] = useState('');

   const [activeTab, setActiveTab] = useState<'all' | 'archived'>('all');
   const [showEmojiPicker, setShowEmojiPicker] = useState(false);
   const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
   const [showReportModal, setShowReportModal] = useState(false);
   const [showActionsMenu, setShowActionsMenu] = useState(false);
   const [chatToDelete, setChatToDelete] = useState<Chat | null>(null);

   const messagesEndRef = useRef<HTMLDivElement>(null);
   const fileInputRef = useRef<HTMLInputElement>(null);

   const emojis = ['😊', '👍', '🙌', '🚀', '⭐', '📅', '💡', '✅', '❌', '💰', '🏗️', '🤖'];

   const fetchChats = async () => {
      try {
         const res = await api.get('/chats');
         if (Array.isArray(res.data)) {
            setChats(res.data);
         } else {
            console.warn('API /chats returned non-array:', res.data);
            setChats([]);
         }
      } catch (err) {
         console.error("Error fetching chats", err);
         setChats([]);
      } finally {
         setLoading(false);
      }
   };

   const fetchMessages = async (projectId: string) => {
      try {
         const res = await api.get(`/chats/${projectId}`);
         if (res.data && Array.isArray(res.data.messages)) {
            setMessages(res.data.messages);
         } else {
            console.warn('API /chats/:id returned invalid structure:', res.data);
            setMessages([]);
         }
      } catch (err) {
         console.error("Error fetching messages", err);
         setMessages([]);
      }
   };

   const fetchMe = async () => {
      try {
         const res = await api.get('/auth/me');
         setUserId(res.data.id || res.data.userId);
         setUserEmail(res.data.email);
      } catch (err) {
         console.error("Error fetching me", err);
      }
   };

   useEffect(() => {
      fetchChats();
      fetchMe();
      const chatInterval = setInterval(fetchChats, 10000);
      return () => clearInterval(chatInterval);
   }, []);

   useEffect(() => {
      if (selectedChat) {
         fetchMessages(selectedChat.projectId);
         const interval = setInterval(() => fetchMessages(selectedChat.projectId), 5000);
         return () => clearInterval(interval);
      }
   }, [selectedChat]);

   useEffect(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
   }, [messages]);

   const handleSend = async (customContent?: string) => {
      const contentToSend = customContent || inputText;
      if (!contentToSend.trim() || !selectedChat) return;
      try {
         if (!customContent) setInputText('');
         await api.post(`/chats/${selectedChat.projectId}/messages`, { content: contentToSend });
         fetchMessages(selectedChat.projectId);
      } catch (err) {
         console.error("Error sending message", err);
      }
   };

   const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
         const msg = `📎 Ha enviado un archivo: ${file.name}`;
         handleSend(msg);
      }
   };

   const handleArchive = async (e: React.MouseEvent, chat: Chat) => {
      e.stopPropagation();
      try {
         await api.post(`/chats/${chat.id}/archive`);
         fetchChats();
         if (selectedChat?.id === chat.id) setSelectedChat(null);
      } catch (err) {
         console.error("Error archiving chat", err);
      }
   };

   const handleDelete = (e: React.MouseEvent, chat: Chat) => {
      e.stopPropagation();
      setChatToDelete(chat);
      setShowDeleteConfirm(true);
   };

   const confirmDelete = async () => {
      if (!chatToDelete) return;
      try {
         await api.delete(`/chats/${chatToDelete.id}`);
         fetchChats();
         if (selectedChat?.id === chatToDelete.id) setSelectedChat(null);
      } catch (err) {
         console.error("Error deleting chat", err);
      }
      setChatToDelete(null);
      setShowDeleteConfirm(false);
   };

   const handleChatSelect = (chat: Chat) => {
      setSelectedChat(chat);
      setShowChatOnMobile(true);
   };

   const filteredChats = chats.filter(c => {
      // Hardened filter logic
      if (!c) return false;
      const matchesTab = activeTab === 'archived' ? c.isArchived : !c.isArchived;
      const counterparty = c.counterpartyName || 'Usuario Desconocido';
      const projectTitle = c.projectTitle || 'Sin Título';

      const matchesSearch = counterparty.toLowerCase().includes(searchQuery.toLowerCase()) ||
         projectTitle.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesTab && matchesSearch;
   });

   return (
      <div className="flex h-full w-full bg-white relative overflow-hidden">
         <input
            type="file"
            className="hidden"
            ref={fileInputRef}
            onChange={handleFileSelect}
         />

         {/* LEFT COLUMN: Chat List */}
         <aside className={`w-full md:w-80 lg:w-96 border-r border-gray-200 flex flex-col bg-white shrink-0 ${showChatOnMobile ? 'hidden md:flex' : 'flex'}`}>
            <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
               <h2 className="font-bold text-gray-900 text-xl tracking-tight">Chats</h2>
               <div className="flex gap-1">
                  <button
                     onClick={() => setActiveTab(activeTab === 'all' ? 'archived' : 'all')}
                     className={`p-2 rounded-lg transition-colors ${activeTab === 'archived' ? 'bg-primary/10 text-primary' : 'text-gray-400 hover:bg-gray-100'}`}
                     title={activeTab === 'archived' ? 'Ver todos' : 'Ver archivados'}
                  >
                     <span className="material-symbols-outlined text-xl">{activeTab === 'archived' ? 'unarchive' : 'archive'}</span>
                  </button>
               </div>
            </div>

            <div className="p-4 bg-white">
               <div className="relative group">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary transition-colors">search</span>
                  <input
                     type="text"
                     placeholder="Buscar chats..."
                     value={searchQuery}
                     onChange={(e) => setSearchQuery(e.target.value)}
                     className="w-full pl-10 pr-4 py-2.5 bg-gray-100 border-none rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                  />
               </div>
            </div>

            <nav className="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-0.5">
               {loading ? (
                  <div className="flex flex-col items-center py-20 gap-3">
                     <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin"></div>
                     <p className="text-gray-400 text-sm">Cargando...</p>
                  </div>
               ) : filteredChats.length === 0 ? (
                  <div className="text-center py-20 px-6">
                     <span className="material-symbols-outlined text-4xl text-gray-200 mb-2">forum</span>
                     <p className="text-gray-400 text-sm">{activeTab === 'archived' ? 'No tienes chats archivados.' : 'No tienes conversaciones activas.'}</p>
                  </div>
               ) : (
                  filteredChats.map(chat => (
                     <div
                        key={chat.id}
                        onClick={() => handleChatSelect(chat)}
                        className={`group flex gap-3 p-3 rounded-2xl cursor-pointer transition-all relative ${selectedChat?.id === chat.id ? 'bg-primary/10 ring-1 ring-primary/20' : 'hover:bg-gray-50'}`}
                     >
                        <div className="relative flex-shrink-0">
                           <div className="w-14 h-14 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center text-gray-600 font-bold text-lg uppercase shadow-sm">
                              {(chat.counterpartyName || '?').charAt(0)}
                           </div>
                           <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 border-2 border-white rounded-full"></div>
                        </div>
                        <div className="flex-1 min-w-0 flex flex-col justify-center">
                           <div className="flex justify-between items-baseline mb-1">
                              <h3 className="font-bold text-[15px] text-gray-900 truncate pr-2">{chat.counterpartyName || 'Usuario Desconocido'}</h3>
                              <span className="text-[10px] font-medium text-gray-400 flex-shrink-0">{chat.updatedAt ? new Date(chat.updatedAt).toLocaleDateString([], { day: '2-digit', month: '2-digit' }) : ''}</span>
                           </div>
                           <div className="flex justify-between items-center pr-8">
                              <p className={`text-xs truncate ${selectedChat?.id === chat.id ? 'text-primary font-medium' : 'text-gray-500'}`}>
                                 {chat.lastMessage}
                              </p>
                           </div>
                        </div>

                        {/* Hover Actions */}
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                           <button
                              onClick={(e) => handleArchive(e, chat)}
                              className="p-1.5 bg-white shadow-md border border-gray-100 rounded-lg text-gray-400 hover:text-primary transition-colors"
                              title="Archivar"
                           >
                              <span className="material-symbols-outlined text-lg">{chat.isArchived ? 'unarchive' : 'archive'}</span>
                           </button>
                           <button
                              onClick={(e) => handleDelete(e, chat)}
                              className="p-1.5 bg-white shadow-md border border-gray-100 rounded-lg text-gray-400 hover:text-red-500 transition-colors"
                              title="Eliminar"
                           >
                              <span className="material-symbols-outlined text-lg">delete</span>
                           </button>
                        </div>
                     </div>
                  ))
               )}
            </nav>
         </aside>

         {/* MIDDLE COLUMN: Chat Interface */}
         <main className={`flex-1 flex flex-col bg-[#e5ddd5] min-w-0 h-full relative ${showChatOnMobile ? 'fixed inset-0 z-[60] bg-white md:relative md:inset-auto md:z-10' : 'hidden md:flex'}`}>

            {/* WhatsApp Wallpaper Pattern Overlay */}
            <div className="absolute inset-0 opacity-[0.05] pointer-events-none bg-[url('https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png')]"></div>

            {!selectedChat ? (
               <div className="flex-1 flex flex-col items-center justify-center text-gray-400 p-10 z-10">
                  <div className="w-24 h-24 bg-white/50 backdrop-blur-sm rounded-full flex items-center justify-center mb-6 shadow-sm">
                     <span className="material-symbols-outlined text-5xl opacity-20">chat_bubble</span>
                  </div>
                  <h3 className="text-gray-900 font-bold text-lg mb-1">AI Marketplace Web</h3>
                  <p className="max-w-xs text-center text-sm leading-relaxed">Envía y recibe mensajes sobre tus proyectos de forma centralizada.</p>
                  <div className="mt-8 flex items-center gap-2 text-xs opacity-50">
                     <span className="material-symbols-outlined text-sm">lock</span>
                     Cifrado de extremo a extremo
                  </div>
               </div>
            ) : (
               <>
                  {/* Chat Header */}
                  <header className="px-4 md:px-6 py-3 bg-[#f0f2f5] border-b border-gray-200 flex justify-between items-center z-20 shadow-sm">
                     <div className="flex items-center gap-3">
                        <button
                           onClick={() => setShowChatOnMobile(false)}
                           className="md:hidden p-2 -ml-2 text-gray-600 rounded-full hover:bg-gray-200 transition-colors"
                        >
                           <span className="material-symbols-outlined">arrow_back</span>
                        </button>
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center text-gray-600 font-bold uppercase shadow-inner">
                           {(selectedChat.counterpartyName || '?').charAt(0)}
                        </div>
                        <div className="min-w-0">
                           <h2 className="font-bold text-gray-900 leading-tight truncate">{selectedChat.counterpartyName || 'Usuario Desconocido'}</h2>
                           <p className="text-[11px] text-gray-500 font-medium truncate italic">{selectedChat.projectTitle || 'Sin Título'}</p>
                        </div>
                     </div>
                     <div className="flex items-center gap-1 relative">
                        <button
                           onClick={() => setShowScheduler(true)}
                           className="p-2 text-gray-500 rounded-full hover:bg-gray-200 transition-colors"
                           title="Agendar videollamada"
                        >
                           <span className="material-symbols-outlined text-2xl">video_call</span>
                        </button>
                        <div className="relative">
                           <button
                              onClick={() => setShowActionsMenu(!showActionsMenu)}
                              className={`p-2 rounded-full transition-colors ${showActionsMenu ? 'bg-gray-200 text-gray-900' : 'text-gray-500 hover:bg-gray-200'}`}
                           >
                              <span className="material-symbols-outlined text-2xl">more_vert</span>
                           </button>

                           {showActionsMenu && (
                              <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-xl shadow-floating border border-gray-100 py-2 z-[100] animate-in fade-in zoom-in-95 duration-200">
                                 <button
                                    onClick={() => { fileInputRef.current?.click(); setShowActionsMenu(false); }}
                                    className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-3"
                                 >
                                    <span className="material-symbols-outlined text-lg text-gray-400">attach_file</span>
                                    Adjuntar archivo
                                 </button>
                                 <button
                                    onClick={(e) => { if (selectedChat) handleArchive(e, selectedChat); setShowActionsMenu(false); }}
                                    className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-3"
                                 >
                                    <span className="material-symbols-outlined text-lg text-gray-400">{selectedChat.isArchived ? 'unarchive' : 'archive'}</span>
                                    {selectedChat.isArchived ? 'Desarchivar chat' : 'Archivar chat'}
                                 </button>
                                 <button
                                    onClick={(e) => { if (selectedChat) handleDelete(e, selectedChat); setShowActionsMenu(false); }}
                                    className="w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 flex items-center gap-3"
                                 >
                                    <span className="material-symbols-outlined text-lg">delete</span>
                                    Eliminar chat
                                 </button>
                                 <div className="h-px bg-gray-100 my-1 mx-2"></div>
                                 <button
                                    onClick={() => { setShowReportModal(true); setShowActionsMenu(false); }}
                                    className="w-full text-left px-4 py-2.5 text-sm text-orange-600 hover:bg-orange-50 flex items-center gap-3"
                                 >
                                    <span className="material-symbols-outlined text-lg text-orange-400">report</span>
                                    Reportar incidencia
                                 </button>
                              </div>
                           )}
                        </div>
                     </div>
                  </header>

                  {/* Messages Feed */}
                  <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-4 z-10 custom-scrollbar scroll-smooth">
                     {messages.length === 0 ? (
                        <div className="flex justify-center">
                           <span className="px-3 py-1 bg-yellow-100 text-[10px] font-bold text-yellow-800 rounded-md uppercase tracking-wider shadow-sm">Hoy</span>
                        </div>
                     ) : (
                        messages.map((msg, index) => {
                           if (!msg) return null;
                           const isMe = msg.sender?.id === userId || msg.sender?.email === userEmail;
                           const showTail = index === 0 || messages[index - 1]?.senderId !== msg.senderId;

                           return (
                              <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2`}>
                                 <div className={`relative group max-w-[85%] md:max-w-[65%] flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                                    <div className={`px-4 py-2.5 shadow-sm text-[14px] leading-relaxed relative ${isMe
                                       ? 'bg-[#d9fdd3] text-gray-800 rounded-2xl rounded-tr-none'
                                       : 'bg-white text-gray-800 rounded-2xl rounded-tl-none'
                                       }`}>

                                       {/* Message Tail */}
                                       {showTail && (
                                          <div className={`absolute top-0 w-3 h-3 ${isMe
                                             ? 'right-[-8px] bg-[#d9fdd3] [clip-path:polygon(0_0,0_100%,100%_0)]'
                                             : 'left-[-8px] bg-white [clip-path:polygon(100%_0,100%_100%,0_0)]'
                                             }`}></div>
                                       )}

                                       <div className="pr-12">{msg.content}</div>

                                       <div className={`absolute bottom-1 right-2 flex items-center gap-1 ${isMe ? 'text-green-600' : 'text-gray-400'}`}>
                                          <span className="text-[10px] font-medium leading-none">
                                             {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                          </span>
                                          {isMe && <span className="material-symbols-outlined text-[14px]">done_all</span>}
                                       </div>
                                    </div>
                                 </div>
                              </div>
                           );
                        })
                     )}
                     <div ref={messagesEndRef} />
                  </div>

                  {/* Input Area */}
                  <div className="p-3 bg-[#f0f2f5] z-20 relative">
                     {/* Emoji Picker Overlay */}
                     {showEmojiPicker && (
                        <div className="absolute bottom-full left-4 bg-white shadow-xl rounded-xl p-3 mb-2 flex flex-wrap gap-2 w-48 z-30 animate-in slide-in-from-bottom-2">
                           {emojis.map(e => (
                              <button
                                 key={e}
                                 type="button"
                                 onClick={() => { setInputText(prev => prev + e); setShowEmojiPicker(false); }}
                                 className="text-xl hover:scale-125 transition-transform"
                              >
                                 {e}
                              </button>
                           ))}
                        </div>
                     )}

                     <form onSubmit={(e) => { e.preventDefault(); handleSend(); }} className="flex items-center gap-2 max-w-6xl mx-auto">
                        <div className="flex gap-1 shrink-0">
                           <button
                              type="button"
                              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                              className={`p-2 rounded-full transition-colors ${showEmojiPicker ? 'bg-primary/10 text-primary' : 'text-gray-500 hover:bg-gray-200'}`}
                           >
                              <span className="material-symbols-outlined text-2xl">sentiment_satisfied</span>
                           </button>
                           <button
                              type="button"
                              onClick={() => fileInputRef.current?.click()}
                              className="p-2 text-gray-500 hover:bg-gray-200 rounded-full transition-colors"
                           >
                              <span className="material-symbols-outlined text-2xl">attach_file</span>
                           </button>
                        </div>

                        <div className="flex-1 bg-white rounded-xl shadow-sm border-none flex items-center p-1.5 focus-within:ring-0 transition-all">
                           <input
                              type="text"
                              placeholder="Escribe un mensaje"
                              value={inputText}
                              onChange={(e) => setInputText(e.target.value)}
                              className="flex-1 bg-transparent border-none focus:ring-0 px-3 py-1 text-[15px] text-gray-800 placeholder:text-gray-400"
                           />
                        </div>

                        <button
                           type="submit"
                           disabled={!inputText.trim()}
                           className="p-3 bg-primary text-white rounded-full shadow-md hover:opacity-90 transition-all active:scale-95 disabled:opacity-50 disabled:scale-100 flex items-center justify-center shrink-0"
                        >
                           <span className="material-symbols-outlined text-2xl">send</span>
                        </button>
                     </form>
                  </div>
               </>
            )}
         </main>

         {/* Schedule Meeting Modal */}
         <Modal isOpen={showScheduler} onClose={() => setShowScheduler(false)} title="Programar Reunión">
            <div className="space-y-6 p-4">
               <div className="flex items-center gap-4 bg-indigo-50 p-4 rounded-xl border border-indigo-100">
                  <div className="bg-white p-2 rounded-lg shadow-sm">
                     <span className="material-symbols-outlined text-indigo-600 text-2xl">video_call</span>
                  </div>
                  <div>
                     <h4 className="font-bold text-indigo-900">Programar por Google Meet / Teams</h4>
                     <p className="text-xs text-indigo-600">Envía una invitación formal a {selectedChat?.counterpartyName}</p>
                  </div>
               </div>

               <div className="grid grid-cols-2 gap-4">
                  <div>
                     <label className="block text-xs font-bold text-gray-700 mb-1 uppercase">Fecha</label>
                     <input
                        type="date"
                        className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-primary/20 transition-all font-medium text-sm"
                        onChange={(e) => setMeetingDate(e.target.value)}
                     />
                  </div>
                  <div>
                     <label className="block text-xs font-bold text-gray-700 mb-1 uppercase">Hora</label>
                     <input
                        type="time"
                        className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-primary/20 transition-all font-medium text-sm"
                        onChange={(e) => setMeetingTime(e.target.value)}
                     />
                  </div>
               </div>

               <div className="pt-2">
                  <button
                     onClick={() => {
                        const inviteMsg = `📅 Me gustaría agendar una reunión para el ${meetingDate} a las ${meetingTime}.`;
                        handleSend(inviteMsg);
                        setShowScheduler(false);
                     }}
                     className="w-full py-4 bg-primary text-white font-black rounded-xl hover:opacity-90 shadow-lg shadow-red-100 transition-all transform active:scale-[0.98]"
                  >
                     Confirmar Invitación
                  </button>
               </div>
            </div>
         </Modal>

         <ConfirmationModal
            isOpen={showDeleteConfirm}
            onClose={() => setShowDeleteConfirm(false)}
            onConfirm={confirmDelete}
            title="Eliminar Conversación"
            message={`¿Estás seguro de que deseas eliminar la conversación con ${chatToDelete?.counterpartyName}? Esta acción ocultará el chat de tu lista pero no borrará los mensajes para la otra persona.`}
            variant="danger"
            confirmText="Eliminar"
         />
         <ReportModal
            isOpen={showReportModal}
            onClose={() => setShowReportModal(false)}
            chatPartnerName={selectedChat?.counterpartyName || ''}
         />
      </div>
   );
};

const VendorMessages: React.FC = () => {
   return (
      <VendorLayout fullHeight>
         <DebugErrorBoundary>
            <VendorMessagesContent />
         </DebugErrorBoundary>
      </VendorLayout>
   );
};

export default VendorMessages;