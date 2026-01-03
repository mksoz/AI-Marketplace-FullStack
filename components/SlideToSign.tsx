import React, { useState, useRef, useEffect } from 'react';

interface SlideToSignProps {
    onConfirm: () => void;
    isLoading?: boolean;
    labelUnsigned?: string;
    labelSigned?: string;
    disabled?: boolean;
    isSigned?: boolean;
    onRevert?: () => void;
}

const SlideToSign: React.FC<SlideToSignProps> = ({
    onConfirm,
    isLoading = false,
    labelUnsigned = "Presiona hasta completar la firma",
    labelSigned = "Firmado",
    disabled = false,
    isSigned = false,
    onRevert
}) => {
    // State - Initialize localSigned from prop to maintain state across version switches
    const [isHolding, setIsHolding] = useState(false);
    const [progress, setProgress] = useState(isSigned ? 100 : 0);
    const [localSigned, setLocalSigned] = useState(isSigned);

    const requestRef = useRef<number>();
    const startTimeRef = useRef<number>(0);
    const DURATION = 800; // ms to hold

    const prevLoading = useRef(isLoading);
    const prevIsSigned = useRef(isSigned);

    // Sync external signed state
    useEffect(() => {
        console.log('[SlideToSign] Props changed:', { isSigned, isLoading, localSigned, prevIsSigned: prevIsSigned.current, prevLoading: prevLoading.current });

        // Case 1: Server confirms signature
        if (isSigned) {
            console.log('[SlideToSign] Server confirmed signature');
            setLocalSigned(true);
            setProgress(100);
        }

        // Case 2: Server explicitly reverts (signed -> not signed)
        // This is the ONLY way to reset once user has completed the action
        if (prevIsSigned.current && !isSigned) {
            console.log('[SlideToSign] Server reverted signature');
            setLocalSigned(false);
            setProgress(0);
        }

        // REMOVED Case 3: Never auto-reset after user completes action
        // The user action (localSigned=true) is permanent until server explicitly reverts it

        prevLoading.current = isLoading;
        prevIsSigned.current = isSigned;
    }, [isSigned, isLoading, localSigned]);

    // Animation Loop
    const animate = (time: number) => {
        if (!startTimeRef.current) startTimeRef.current = time;
        const elapsed = time - startTimeRef.current;
        const newProgress = Math.min((elapsed / DURATION) * 100, 100);

        setProgress(newProgress);

        if (newProgress < 100) {
            requestRef.current = requestAnimationFrame(animate);
        } else {
            // Completed!
            handleComplete();
        }
    };

    const handleComplete = () => {
        console.log('[SlideToSign] User completed hold action - setting localSigned=true');
        setLocalSigned(true);
        setProgress(100);
        setIsHolding(false);
        onConfirm();
    };

    const startHolding = (e: React.MouseEvent | React.TouchEvent) => {
        if (disabled || isLoading || isSigned || localSigned) return;
        // Prevent default to avoid scrolling/selection interactions on touch
        // e.preventDefault(); // Be careful with this on some devices

        setIsHolding(true);
        startTimeRef.current = 0;
        requestRef.current = requestAnimationFrame(animate);
    };

    const stopHolding = () => {
        if (localSigned) return; // Don't reset if already done

        setIsHolding(false);
        if (requestRef.current) {
            cancelAnimationFrame(requestRef.current);
            requestRef.current = undefined;
        }

        // Rapid snap back
        setProgress(0);
    };

    // Cleanup
    useEffect(() => {
        return () => {
            if (requestRef.current) cancelAnimationFrame(requestRef.current);
        };
    }, []);

    const effectiveSigned = isSigned || localSigned;

    return (
        <div
            className="flex flex-col items-center gap-3 w-full"
            onContextMenu={(e) => e.preventDefault()} // prevent right click
        >
            <button
                onMouseDown={startHolding}
                onMouseUp={stopHolding}
                onMouseLeave={stopHolding}
                onTouchStart={startHolding}
                onTouchEnd={stopHolding}
                disabled={disabled || effectiveSigned || isLoading}
                className={`
                    relative overflow-hidden w-full max-w-[420px] h-14 rounded-full font-bold uppercase tracking-wider text-sm transition-all duration-300 select-none touch-none
                    shadow-sm active:scale-[0.98]
                    ${effectiveSigned
                        ? 'bg-green-500 text-white cursor-default'
                        : 'bg-white border border-gray-200 text-gray-500 hover:border-gray-300'
                    }
                    ${isLoading ? 'opacity-80' : ''}
                `}
            >
                {/* Progress Fill Background */}
                {!effectiveSigned && (
                    <div
                        className="absolute inset-0 bg-green-50 z-0 transition-transform duration-75 ease-linear origin-left"
                        style={{
                            transform: `scaleX(${progress / 100})`,
                            willChange: 'transform'
                        }}
                    />
                )}

                {/* Content Layer */}
                <div className="relative z-10 flex items-center justify-center gap-3 w-full h-full">
                    {effectiveSigned ? (
                        <>
                            <span className="material-symbols-outlined text-xl">check_circle</span>
                            {labelSigned}
                        </>
                    ) : isLoading ? (
                        <>
                            <div className="w-5 h-5 border-2 border-green-600 border-t-transparent rounded-full animate-spin"></div>
                            Firmando...
                        </>
                    ) : (
                        <>
                            <span className={`material-symbols-outlined text-xl transition-all duration-300 ${isHolding ? 'scale-125 text-green-600' : 'text-gray-400'}`}>
                                fingerprint
                            </span>
                            <span className={isHolding ? 'text-green-700' : ''}>
                                {labelUnsigned}
                            </span>
                        </>
                    )}
                </div>

                {/* Border effect when holding */}
                {!effectiveSigned && isHolding && !isLoading && (
                    <div className="absolute inset-0 border-2 border-green-500 rounded-full animate-pulse z-20 pointer-events-none"></div>
                )}
            </button>

            {/* Helper Text */}
            {!effectiveSigned && !isLoading && (
                <p className="text-xs text-gray-400 animate-pulse">
                    {isHolding ? "Mantén presionado..." : ""}
                </p>
            )}
        </div>
    );
};

export default SlideToSign;
