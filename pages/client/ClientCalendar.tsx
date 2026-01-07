import React from 'react';
import ClientLayout from '../../components/ClientLayout';
import CalendarView from '../../components/calendar/CalendarView';

const ClientCalendar: React.FC = () => {
    return (
        <ClientLayout>
            <div className="flex flex-col h-full">
                <CalendarView userRole="CLIENT" />
            </div>
        </ClientLayout>
    );
};

export default ClientCalendar;