import React from 'react';
import VendorLayout from '../../components/VendorLayout';
import CalendarView from '../../components/calendar/CalendarView';

const VendorCalendar: React.FC = () => {
    return (
        <VendorLayout>
            <div className="flex flex-col h-full">
                <CalendarView userRole="VENDOR" />
            </div>
        </VendorLayout>
    );
};

export default VendorCalendar;