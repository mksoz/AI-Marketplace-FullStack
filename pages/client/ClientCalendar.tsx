import React, { useState, useEffect } from 'react';
import ClientLayout from '../../components/ClientLayout';
import Modal from '../../components/Modal';

interface CalendarEvent {
  id: string;
  title: string;
  type: 'milestone' | 'meeting' | 'deadline' | 'other';
  date: Date; // Keep it simple object for mock
  project: string;
  vendor: string;
  time?: string;
}

const ClientCalendar: React.FC = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);

  // Modal Form State
  const [reminderTime, setReminderTime] = useState('30m');
  const [eventStatus, setEventStatus] = useState<'pending' | 'accepted' | 'declined'>('pending');
  const [declineReason, setDeclineReason] = useState('');

  // Reset form when event opens
  useEffect(() => {
    if (selectedEvent) {
        setReminderTime('30m');
        setEventStatus('pending'); // In a real app, this would come from the event data
        setDeclineReason('');
    }
  }, [selectedEvent]);

  // Mock Events
  const events: CalendarEvent[] = [
    { id: '1', title: 'Entrega Hito 2', type: 'milestone', date: new Date(currentDate.getFullYear(), currentDate.getMonth(), 5), project: 'Chatbot Soporte', vendor: 'InnovateAI', time: '14:00' },
    { id: '2', title: 'Reunión Semanal', type: 'meeting', date: new Date(currentDate.getFullYear(), currentDate.getMonth(), 8), project: 'Sistema Rec.', vendor: 'QuantumLeap', time: '10:00' },
    { id: '3', title: 'Vencimiento Factura', type: 'deadline', date: new Date(currentDate.getFullYear(), currentDate.getMonth(), 15), project: 'Análisis Ventas', vendor: 'Cognitive Tech' },
    { id: '4', title: 'Demo Prototipo', type: 'meeting', date: new Date(currentDate.getFullYear(), currentDate.getMonth(), 20), project: 'Chatbot Soporte', vendor: 'InnovateAI', time: '16:30' },
    { id: '5', title: 'Inicio Fase 3', type: 'other', date: new Date(currentDate.getFullYear(), currentDate.getMonth(), 25), project: 'Sistema Rec.', vendor: 'QuantumLeap' },
  ];

  // Logic to generate days for the grid
  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const days = [];

    // Fill previous month days
    const startDayOfWeek = firstDay.getDay() === 0 ? 6 : firstDay.getDay() - 1; // Start Monday
    for (let i = startDayOfWeek; i > 0; i--) {
        days.push({ date: new Date(year, month, 1 - i), isCurrentMonth: false });
    }

    // Fill current month days
    for (let i = 1; i <= lastDay.getDate(); i++) {
        days.push({ date: new Date(year, month, i), isCurrentMonth: true });
    }

    // Fill next month days to complete grid (42 cells max)
    const remainingCells = 42 - days.length;
    for (let i = 1; i <= remainingCells; i++) {
        days.push({ date: new Date(year, month + 1, i), isCurrentMonth: false });
    }

    return days;
  };

  const days = getDaysInMonth(currentDate);
  const weekDays = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];

  const changeMonth = (increment: number) => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + increment, 1));
  };

  const getEventsForDay = (date: Date) => {
    return events.filter(e => 
        e.date.getDate() === date.getDate() && 
        e.date.getMonth() === date.getMonth() && 
        e.date.getFullYear() === date.getFullYear()
    );
  };

  const getEventStyle = (type: string) => {
      switch(type) {
          case 'milestone': return 'bg-green-100 text-green-700 border-green-200';
          case 'meeting': return 'bg-blue-100 text-blue-700 border-blue-200';
          case 'deadline': return 'bg-red-100 text-red-700 border-red-200';
          default: return 'bg-gray-100 text-gray-700 border-gray-200';
      }
  };

  const getEventIcon = (type: string) => {
      switch(type) {
          case 'milestone': return 'flag';
          case 'meeting': return 'videocam';
          case 'deadline': return 'warning';
          default: return 'event';
      }
  };

  const handleSave = () => {
      // Simulate saving logic
      console.log("Saving Event Config:", { id: selectedEvent?.id, reminderTime, eventStatus, declineReason });
      setSelectedEvent(null);
  };

  return (
    <ClientLayout>
      <div className="flex flex-col h-full space-y-6">
         
         {/* Header */}
         <div className="flex flex-col md:flex-row justify-between items-center gap-4">
             <div>
                <h1 className="text-3xl font-black text-gray-900">Calendario Global</h1>
                <p className="text-gray-500 mt-1">Hitos, reuniones y eventos de todos tus proyectos.</p>
             </div>
             
             <div className="flex items-center bg-white rounded-xl border border-gray-200 shadow-sm p-1">
                 <button onClick={() => changeMonth(-1)} className="p-2 hover:bg-gray-100 rounded-lg text-gray-500">
                    <span className="material-symbols-outlined">chevron_left</span>
                 </button>
                 <span className="px-6 font-bold text-gray-900 text-lg min-w-[160px] text-center">
                    {currentDate.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' }).charAt(0).toUpperCase() + currentDate.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' }).slice(1)}
                 </span>
                 <button onClick={() => changeMonth(1)} className="p-2 hover:bg-gray-100 rounded-lg text-gray-500">
                    <span className="material-symbols-outlined">chevron_right</span>
                 </button>
                 <div className="w-px h-6 bg-gray-200 mx-2"></div>
                 <button onClick={() => setCurrentDate(new Date())} className="text-sm font-bold text-primary px-3 py-1 rounded-lg hover:bg-primary/5">
                    Hoy
                 </button>
             </div>
         </div>

         {/* Calendar Grid */}
         <div className="bg-white rounded-2xl border border-gray-200 shadow-sm flex-1 flex flex-col overflow-hidden">
             
             {/* Week Days Header */}
             <div className="grid grid-cols-7 border-b border-gray-200 bg-gray-50">
                 {weekDays.map(day => (
                     <div key={day} className="py-3 text-center text-xs font-bold text-gray-500 uppercase">
                         {day}
                     </div>
                 ))}
             </div>

             {/* Days Grid */}
             <div className="grid grid-cols-7 flex-1 auto-rows-fr">
                 {days.map((dayObj, index) => {
                     const dayEvents = getEventsForDay(dayObj.date);
                     const isToday = dayObj.date.toDateString() === new Date().toDateString();
                     
                     return (
                         <div 
                            key={index} 
                            className={`
                                min-h-[120px] p-2 border-b border-r border-gray-100 flex flex-col gap-1 transition-colors hover:bg-gray-50/50
                                ${!dayObj.isCurrentMonth ? 'bg-gray-50/30' : 'bg-white'}
                            `}
                         >
                             <div className="flex justify-between items-center mb-1">
                                <span className={`
                                    text-sm font-semibold w-7 h-7 flex items-center justify-center rounded-full
                                    ${isToday ? 'bg-primary text-white' : !dayObj.isCurrentMonth ? 'text-gray-300' : 'text-gray-700'}
                                `}>
                                    {dayObj.date.getDate()}
                                </span>
                             </div>

                             <div className="flex flex-col gap-1 overflow-y-auto max-h-[100px] no-scrollbar">
                                 {dayEvents.map(event => (
                                     <button 
                                        key={event.id}
                                        onClick={() => setSelectedEvent(event)}
                                        className={`
                                            text-left text-xs px-2 py-1.5 rounded-md border truncate font-medium flex items-center gap-1.5 transition-transform hover:scale-[1.02]
                                            ${getEventStyle(event.type)}
                                        `}
                                     >
                                        <span className="material-symbols-outlined text-[10px]">{getEventIcon(event.type)}</span>
                                        <span className="truncate">{event.title}</span>
                                     </button>
                                 ))}
                             </div>
                         </div>
                     );
                 })}
             </div>
         </div>
         
         {/* Legend */}
         <div className="flex gap-6 justify-center pb-4">
             <div className="flex items-center gap-2">
                 <span className="w-3 h-3 rounded-full bg-green-500"></span>
                 <span className="text-sm text-gray-600">Hitos</span>
             </div>
             <div className="flex items-center gap-2">
                 <span className="w-3 h-3 rounded-full bg-blue-500"></span>
                 <span className="text-sm text-gray-600">Reuniones</span>
             </div>
             <div className="flex items-center gap-2">
                 <span className="w-3 h-3 rounded-full bg-red-500"></span>
                 <span className="text-sm text-gray-600">Vencimientos</span>
             </div>
         </div>
      </div>

      {/* Event Details Modal */}
      <Modal isOpen={!!selectedEvent} onClose={() => setSelectedEvent(null)} title="Detalle y Configuración">
          {selectedEvent && (
              <div className="space-y-6">
                  {/* Event Summary Card */}
                  <div className={`p-4 rounded-xl border flex items-start gap-4 ${getEventStyle(selectedEvent.type)} bg-opacity-20 border-opacity-50`}>
                      <div className={`p-2 rounded-lg bg-white bg-opacity-60`}>
                          <span className="material-symbols-outlined text-2xl">{getEventIcon(selectedEvent.type)}</span>
                      </div>
                      <div>
                          <h3 className="text-lg font-bold text-gray-900">{selectedEvent.title}</h3>
                          <p className="text-sm opacity-80 uppercase font-bold mt-1">
                             {selectedEvent.date.toLocaleDateString()} • {selectedEvent.time || 'Todo el día'}
                          </p>
                      </div>
                  </div>
                  
                  {/* Basic Info */}
                  <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                          <p className="text-gray-500 text-xs uppercase font-bold mb-1">Proyecto</p>
                          <p className="font-medium text-gray-900 truncate">{selectedEvent.project}</p>
                      </div>
                      <div>
                          <p className="text-gray-500 text-xs uppercase font-bold mb-1">Vendor</p>
                          <p className="font-medium text-gray-900 truncate">{selectedEvent.vendor}</p>
                      </div>
                  </div>
                  
                  <div className="border-t border-gray-100 my-2"></div>

                  {/* Notification Settings */}
                  <div>
                      <h4 className="text-sm font-bold text-gray-900 mb-3">Recordatorio</h4>
                      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-100">
                           <div className="flex items-center gap-3">
                               <div className="w-8 h-8 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center">
                                  <span className="material-symbols-outlined text-lg">notifications</span>
                               </div>
                               <div>
                                  <p className="text-sm font-medium text-gray-900">Notificarme antes</p>
                                  <p className="text-xs text-gray-500">Vía email y app</p>
                               </div>
                           </div>
                           <select 
                              value={reminderTime}
                              onChange={(e) => setReminderTime(e.target.value)}
                              className="bg-white border border-gray-200 text-sm font-medium text-gray-700 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all cursor-pointer hover:bg-gray-50"
                           >
                              <option value="none">Sin aviso</option>
                              <option value="15m">15 minutos</option>
                              <option value="30m">30 minutos</option>
                              <option value="1h">1 hora</option>
                              <option value="1d">1 día</option>
                           </select>
                      </div>
                  </div>

                  {/* Status / RSVP */}
                  <div>
                      <h4 className="text-sm font-bold text-gray-900 mb-3">Tu Respuesta</h4>
                      <div className="flex gap-3">
                          <button 
                              onClick={() => setEventStatus('accepted')}
                              className={`flex-1 py-3 px-4 rounded-xl border font-bold text-sm flex items-center justify-center gap-2 transition-all ${eventStatus === 'accepted' ? 'bg-green-50 border-green-200 text-green-700 ring-2 ring-green-500 ring-offset-1' : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50 hover:border-gray-300'}`}
                          >
                              <span className="material-symbols-outlined text-lg">check_circle</span>
                              Asistiré
                          </button>
                          <button 
                              onClick={() => setEventStatus('declined')}
                              className={`flex-1 py-3 px-4 rounded-xl border font-bold text-sm flex items-center justify-center gap-2 transition-all ${eventStatus === 'declined' ? 'bg-red-50 border-red-200 text-red-700 ring-2 ring-red-500 ring-offset-1' : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50 hover:border-gray-300'}`}
                          >
                              <span className="material-symbols-outlined text-lg">cancel</span>
                              Rechazar
                          </button>
                      </div>

                      {/* Rejection Reason Input */}
                      {eventStatus === 'declined' && (
                          <div className="mt-4 animate-in fade-in slide-in-from-top-2 duration-200">
                              <label className="block text-xs font-bold text-gray-700 mb-1.5 ml-1">Motivo del rechazo (Se notificará al vendor)</label>
                              <textarea 
                                  value={declineReason}
                                  onChange={(e) => setDeclineReason(e.target.value)}
                                  placeholder="Ej: Tengo un conflicto de horario, propongo moverlo a..."
                                  className="w-full p-3 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-100 focus:border-red-300 resize-none h-24 placeholder:text-gray-400"
                              />
                          </div>
                      )}
                  </div>

                  {/* Footer Actions */}
                  <div className="flex items-center justify-between pt-4 border-t border-gray-100 mt-2">
                       <button onClick={() => setSelectedEvent(null)} className="text-gray-500 font-bold text-sm hover:text-dark hover:underline">
                           Cancelar
                       </button>
                       <div className="flex gap-3">
                           <button className="px-4 py-2 bg-white border border-gray-200 text-gray-700 font-bold rounded-lg hover:bg-gray-50 transition-colors">
                               Ir al Proyecto
                           </button>
                           <button onClick={handleSave} className="px-6 py-2 bg-dark text-white font-bold rounded-lg hover:bg-black transition-colors shadow-lg shadow-gray-200">
                               Guardar
                           </button>
                       </div>
                  </div>
              </div>
          )}
      </Modal>

    </ClientLayout>
  );
};

export default ClientCalendar;