import React, { useState, useEffect } from 'react';
import VendorLayout from '../../components/VendorLayout';
import Modal from '../../components/Modal';

interface CalendarEvent {
  id: string;
  title: string;
  type: 'milestone' | 'meeting' | 'deadline' | 'other';
  date: Date;
  project: string;
  client: string; // Changed from vendor to client
  time?: string;
}

const VendorCalendar: React.FC = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);

  // Modal Form State
  const [reminderTime, setReminderTime] = useState('30m');
  const [eventStatus, setEventStatus] = useState<'pending' | 'accepted' | 'declined'>('pending');
  const [declineReason, setDeclineReason] = useState('');

  useEffect(() => {
    if (selectedEvent) {
        setReminderTime('30m');
        setEventStatus('pending');
        setDeclineReason('');
    }
  }, [selectedEvent]);

  // Mock Events (Vendor Context)
  const events: CalendarEvent[] = [
    { id: '1', title: 'Entrega Hito 2', type: 'milestone', date: new Date(currentDate.getFullYear(), currentDate.getMonth(), 5), project: 'Chatbot Soporte', client: 'Cliente Corp', time: '14:00' },
    { id: '2', title: 'Reunión Semanal', type: 'meeting', date: new Date(currentDate.getFullYear(), currentDate.getMonth(), 8), project: 'Sistema Rec.', client: 'Logistics Pro', time: '10:00' },
    { id: '3', title: 'Deadline Código', type: 'deadline', date: new Date(currentDate.getFullYear(), currentDate.getMonth(), 15), project: 'Análisis Ventas', client: 'Retail X' },
    { id: '4', title: 'Demo Prototipo', type: 'meeting', date: new Date(currentDate.getFullYear(), currentDate.getMonth(), 20), project: 'Chatbot Soporte', client: 'Cliente Corp', time: '16:30' },
  ];

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const days = [];

    const startDayOfWeek = firstDay.getDay() === 0 ? 6 : firstDay.getDay() - 1; 
    for (let i = startDayOfWeek; i > 0; i--) {
        days.push({ date: new Date(year, month, 1 - i), isCurrentMonth: false });
    }

    for (let i = 1; i <= lastDay.getDate(); i++) {
        days.push({ date: new Date(year, month, i), isCurrentMonth: true });
    }

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
      console.log("Saving Event Config:", { id: selectedEvent?.id, reminderTime, eventStatus, declineReason });
      setSelectedEvent(null);
  };

  return (
    <VendorLayout>
      <div className="flex flex-col h-full space-y-6">
         
         {/* Header */}
         <div className="flex flex-col md:flex-row justify-between items-center gap-4">
             <div>
                <h1 className="text-3xl font-black text-gray-900">Calendario de Agencia</h1>
                <p className="text-gray-500 mt-1">Gestiona entregas y reuniones con clientes.</p>
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
                                min-h-[100px] p-2 border-b border-r border-gray-100 flex flex-col gap-1 transition-colors hover:bg-gray-50/50
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

                             <div className="flex flex-col gap-1 overflow-y-auto max-h-[80px] no-scrollbar">
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

         {/* Legend (Added for consistency with Client View) */}
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
      <Modal isOpen={!!selectedEvent} onClose={() => setSelectedEvent(null)} title="Detalle del Evento">
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
                          <p className="text-gray-500 text-xs uppercase font-bold mb-1">Cliente</p>
                          <p className="font-medium text-gray-900 truncate">{selectedEvent.client}</p>
                      </div>
                  </div>
                  
                  <div className="border-t border-gray-100 my-2"></div>

                  {/* Actions */}
                  <div className="flex gap-3 pt-2">
                       <button className="flex-1 px-4 py-2 bg-white border border-gray-200 text-gray-700 font-bold rounded-lg hover:bg-gray-50 transition-colors">
                           Ir al Proyecto
                       </button>
                       <button onClick={handleSave} className="flex-1 px-6 py-2 bg-dark text-white font-bold rounded-lg hover:bg-black transition-colors">
                           Cerrar
                       </button>
                  </div>
              </div>
          )}
      </Modal>

    </VendorLayout>
  );
};

export default VendorCalendar;