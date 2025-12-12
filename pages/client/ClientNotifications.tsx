import React from 'react';
import ClientLayout from '../../components/ClientLayout';

const ClientNotifications: React.FC = () => {
  const notifications = [
    {
      id: 1,
      title: "Nuevo mensaje de QuantumLeap Analytics",
      desc: "Has recibido una respuesta sobre el contrato de descubrimiento.",
      time: "Hace 10 min",
      read: false,
      type: "message"
    },
    {
      id: 2,
      title: "Hito completado",
      desc: "El hito 'Diseño UI/UX' del proyecto Chatbot ha sido marcado como completado.",
      time: "Hace 2 horas",
      read: false,
      type: "success"
    },
    {
      id: 3,
      title: "Factura disponible",
      desc: "La factura #INV-2024-001 está lista para descargar.",
      time: "Ayer",
      read: true,
      type: "info"
    },
    {
      id: 4,
      title: "Alerta de seguridad",
      desc: "Se detectó un inicio de sesión desde un nuevo dispositivo.",
      time: "Hace 2 días",
      read: true,
      type: "warning"
    }
  ];

  const getIcon = (type: string) => {
    switch (type) {
      case 'message': return 'chat';
      case 'success': return 'check_circle';
      case 'warning': return 'warning';
      default: return 'info';
    }
  };

  const getColor = (type: string) => {
    switch (type) {
      case 'message': return 'text-blue-500 bg-blue-50';
      case 'success': return 'text-green-500 bg-green-50';
      case 'warning': return 'text-yellow-500 bg-yellow-50';
      default: return 'text-gray-500 bg-gray-50';
    }
  };

  return (
    <ClientLayout>
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
    </ClientLayout>
  );
};

export default ClientNotifications;