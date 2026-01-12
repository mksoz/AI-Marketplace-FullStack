import React, { useState, useEffect } from 'react';

interface CountdownTimerProps {
    targetDate: string | Date;
    onExpire?: () => void;
    size?: 'sm' | 'md' | 'lg';
    showIcon?: boolean;
}

const CountdownTimer: React.FC<CountdownTimerProps> = ({ targetDate, onExpire, size = 'sm', showIcon = true }) => {
    const [timeLeft, setTimeLeft] = useState<{
        days: number;
        hours: number;
        minutes: number;
        seconds: number;
        expired: boolean;
    }>({ days: 0, hours: 0, minutes: 0, seconds: 0, expired: false });

    useEffect(() => {
        const calculateTimeLeft = () => {
            const difference = new Date(targetDate).getTime() - new Date().getTime();

            if (difference > 0) {
                return {
                    days: Math.floor(difference / (1000 * 60 * 60 * 24)),
                    hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
                    minutes: Math.floor((difference / 1000 / 60) % 60),
                    seconds: Math.floor((difference / 1000) % 60),
                    expired: false
                };
            } else {
                return {
                    days: 0,
                    hours: 0,
                    minutes: 0,
                    seconds: 0,
                    expired: true
                };
            }
        };

        const timer = setInterval(() => {
            const tl = calculateTimeLeft();
            setTimeLeft(tl);
            if (tl.expired) {
                clearInterval(timer);
                if (onExpire) onExpire();
            }
        }, 1000);

        // Initial call
        setTimeLeft(calculateTimeLeft());

        return () => clearInterval(timer);
    }, [targetDate, onExpire]);

    if (timeLeft.expired) {
        return (
            <div className="flex items-center gap-1 text-red-600 font-bold text-xs bg-red-50 px-2 py-1 rounded">
                <span className="material-symbols-outlined text-sm">timer_off</span>
                <span>Tiempo Expirado - Aprobación Automática</span>
            </div>
        );
    }

    const isUrgent = timeLeft.days < 1; // Less than 1 day left
    const textSize = size === 'sm' ? 'text-xs' : size === 'md' ? 'text-sm' : 'text-base';
    const padding = size === 'sm' ? 'px-2 py-1' : size === 'md' ? 'px-3 py-1.5' : 'px-4 py-2';

    return (
        <div className={`inline-flex items-center gap-1.5 rounded-full font-mono font-bold border transition-colors ${padding} ${textSize} ${isUrgent
                ? 'bg-red-50 text-red-600 border-red-100 animate-pulse'
                : 'bg-indigo-50 text-indigo-600 border-indigo-100'
            }`}>
            {showIcon && <span className="material-symbols-outlined text-sm">timer</span>}
            <div className="flex items-center gap-1">
                {timeLeft.days > 0 && (
                    <>
                        <span>{timeLeft.days}d</span>
                        <span className="opacity-50">:</span>
                    </>
                )}
                <span>{timeLeft.hours.toString().padStart(2, '0')}h</span>
                <span className="opacity-50">:</span>
                <span>{timeLeft.minutes.toString().padStart(2, '0')}m</span>
                {timeLeft.days === 0 && (
                    <>
                        <span className="opacity-50">:</span>
                        <span>{timeLeft.seconds.toString().padStart(2, '0')}s</span>
                    </>
                )}
            </div>
        </div>
    );
};

export default CountdownTimer;
