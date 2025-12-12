import React from 'react';
import VendorLayout from '../../components/VendorLayout';

const VendorNotifications: React.FC = () => {
  const notifications = [
    {
      id: 1,
      title: "Nueva propuesta recibida: Fintech App",
      desc: "Un nuevo lead coincide con tus criterios de 'Lead de Oro'.",
      time: "Hace 15 min",
      read: false,
      type: "opportunity" // special type
    },
    {
      id: 2,
      title: "Pago liberado: Hito 1",
      desc: "El cliente ha aprobado el entregable y los fondos ($5,000) están disponibles.",
      time: "Hace 3 horas",
      read: false,
      type: "success"
    },
    {
      id: 3,
      title: "Mensaje de Cliente Corp",
      desc: "¿Podemos reagendar la reunión de mañana?",
      time: "Ayer",
      read: true,
      type: "message"
    },
    {
      id: 4,
      title: "Recordatorio de entrega",
      desc: "El proyecto 'Motor de Recomendación' tiene una entrega en 2 días.",
      time: "Hace 1 día",
      read: true,
      type: "warning"
    }
  ];

  const getIcon = (type: string) => {
    switch (type) {
      case 'opportunity': return 'star'; // Gold lead
      case 'message': return 'chat';
      case 'success': return 'paid';
      case 'warning': return 'warning';
      default: return 'info';
    }
  };

  const getColor = (type: string) => {
    switch (type) {
      case 'opportunity': return 'text-amber-600 bg-amber-100';
      case 'message': return 'text-blue-500 bg-blue-50';
      case 'success': return 'text-green-500 bg-green-50';
      case 'warning': return 'text-orange-500 bg-orange-50';
      default: return 'text-gray-500 bg-gray-50';
    }
  };

  return (
    <VendorLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-black text-gray-900">Notificaciones</h1>
          <button className="text-sm font-medium text-primary hover:underline">Marcar todas como leídas</button>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
          <div className="divide-y divide-gray-100">
            {notifications.map((notif) => (
              <div key={notif.id} className={`p-6 flex gap-4 hover:bg-gray-50 transition-colors ${!notif.read ? 'bg-blue-50/10' : ''}`}>
                <div className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ${getColor(notif.type)}`}>
                  <span className="material-symbols-outlined">{getIcon(notif.type)}</span>
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <h3 className={`font-bold text-gray-900 ${!notif.read ? 'text-black' : 'text-gray-700'}`}>
                      {notif.title}
                      {!notif.read && <span className="ml-2 w-2 h-2 bg-primary rounded-full inline-block mb-0.5"></span>}
                    </h3>
                    <span className="text-xs text-gray-400 whitespace-nowrap ml-4">{notif.time}</span>
                  </div>
                  <p className="text-gray-500 mt-1 text-sm leading-relaxed">{notif.desc}</p>
                </div>
              </div>
            ))}
          </div>
          {notifications.length === 0 && (
            <div className="p-12 text-center text-gray-500">
              <span className="material-symbols-outlined text-4xl mb-2 text-gray-300">notifications_off</span>
              <p>No tienes notificaciones nuevas.</p>
            </div>
          )}
        </div>
      </div>
    </VendorLayout>
  );
};

export default VendorNotifications;