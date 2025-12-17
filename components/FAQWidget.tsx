import React, { useState, useRef, useEffect } from 'react';
import { sendMessageToGemini } from '../services/geminiService';

const FAQWidget: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<{ role: 'user' | 'model', text: string }[]>([
    { role: 'model', text: '¡Hola! ¿En qué puedo ayudarte hoy?' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  // DRAG STATE
  const [position, setPosition] = useState({ x: 20, y: 20 }); // Bottom-Right distance or absolute? Let's use specific bottom/right or top/left. Fixed uses Top/Left usually or Bottom/Right. Original was bottom-6 left-6. 
  // Let's use offsets from bottom-left as original. x = left, y = bottom.
  const [isDragging, setIsDragging] = useState(false);
  const dragStartPos = useRef({ x: 0, y: 0 }); // Mouse/Touch start
  const widgetStartPos = useRef({ x: 0, y: 0 }); // Widget start

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

  // DRAG HANDLERS
  const handleDragStart = (clientX: number, clientY: number) => {
    setIsDragging(true);
    dragStartPos.current = { x: clientX, y: clientY };
    widgetStartPos.current = { ...position };
  };

  const handleDragMove = (clientX: number, clientY: number) => {
    if (!isDragging) return;
    // const dx = clientX - dragStartPos.current.x; // X movement ignored
    const dy = clientY - dragStartPos.current.y;

    // Lock X to 20 (Left Margin). Only allow Y change.
    // Mouse Up (-y) -> Bottom Increases (+y)
    setPosition({
      x: 20,
      y: widgetStartPos.current.y - dy
    });
  };

  const handleDragEnd = () => {
    setIsDragging(false);
    snapToEdge();
  };

  const snapToEdge = () => {
    const { innerHeight } = window;
    const buttonSize = 56;

    // Always lock to Left (20). 
    // Clamp Y to stay within screen stats.
    let newY = position.y;
    newY = Math.max(20, Math.min(newY, innerHeight - buttonSize - 20));

    setPosition({ x: 20, y: newY });
  };

  // Mouse Events
  const onMouseDown = (e: React.MouseEvent) => {
    if (isOpen) return;
    handleDragStart(e.clientX, e.clientY);
  };

  const currentPosRef = useRef(position);
  useEffect(() => { currentPosRef.current = position; }, [position]);

  const snapToEdgeRef = () => {
    const { innerHeight } = window;
    const buttonSize = 56;
    const { y } = currentPosRef.current;

    let newY = y;
    newY = Math.max(20, Math.min(newY, innerHeight - buttonSize - 20));

    setPosition({ x: 20, y: newY });
  };

  // Re-bind handleDragEnd to use Ref
  const handleDragEndRef = () => {
    setIsDragging(false);
    snapToEdgeRef();
  };

  // Modify Effect to use ref versions
  useEffect(() => {
    const onMouseMove = (e: MouseEvent) => handleDragMove(e.clientX, e.clientY);
    const onMouseUp = () => handleDragEndRef();

    if (isDragging) {
      window.addEventListener('mousemove', onMouseMove);
      window.addEventListener('mouseup', onMouseUp);
      window.addEventListener('touchmove', (e) => handleDragMove(e.touches[0].clientX, e.touches[0].clientY));
      window.addEventListener('touchend', onMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      window.removeEventListener('touchmove', (e) => handleDragMove(e.touches[0].clientX, e.touches[0].clientY));
      window.removeEventListener('touchend', onMouseUp);
    };
  }, [isDragging]);

  const isTopHalf = position.y > (typeof window !== 'undefined' ? window.innerHeight / 2 : 400);

  // Determine position style
  const style: React.CSSProperties = {
    left: `${position.x}px`,
    zIndex: 50,
    position: 'fixed',
    cursor: isDragging ? 'grabbing' : undefined,
    // When in top half, anchor to TOP to let content grow downwards
    // y is distance from bottom. Top = Height - y - ButtonHeight(56)
    ...(isTopHalf
      ? { top: `${typeof window !== 'undefined' ? window.innerHeight - position.y - 56 : 0}px`, bottom: 'auto' }
      : { bottom: `${position.y}px`, top: 'auto' }
    )
  };

  return (
    <div
      style={style}
      className={`flex ${isTopHalf ? 'flex-col' : 'flex-col-reverse'} items-end select-none touch-none ${isDragging ? 'transition-none' : 'transition-all duration-500 ease-out'}`}
    >
      {/* Toggle Button */}
      <button
        onClick={() => !isDragging && setIsOpen(!isOpen)}
        onMouseDown={onMouseDown}
        onTouchStart={(e) => handleDragStart(e.touches[0].clientX, e.touches[0].clientY)}
        className={`h-14 w-14 bg-primary text-white rounded-full shadow-floating flex items-center justify-center hover:scale-105 transition-transform active:scale-95 z-20 ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
      >
        <span className="material-symbols-outlined text-3xl">
          {isOpen ? (isTopHalf ? 'expand_less' : 'expand_more') : 'chat_bubble'}
        </span>
      </button>

      {isOpen && (
        <div
          className={`${isTopHalf ? 'mt-4' : 'mb-4'} w-80 sm:w-96 bg-white rounded-2xl shadow-floating border border-gray-100 overflow-hidden flex flex-col animate-in ${isTopHalf ? 'slide-in-from-top-5' : 'slide-in-from-bottom-5'} fade-in duration-200 z-10`}
          style={{ maxHeight: 'calc(80vh - 100px)', height: '500px' }}
        >
          {/* Header - Make THIS draggable if open? */}
          <div
            className="bg-primary p-4 flex justify-between items-center text-white cursor-grab active:cursor-grabbing"
            onMouseDown={(e) => { e.stopPropagation(); handleDragStart(e.clientX, e.clientY); }}
            onTouchStart={(e) => { e.stopPropagation(); handleDragStart(e.touches[0].clientX, e.touches[0].clientY); }}
          >
            <h3 className="font-bold pointer-events-none">Asistente Virtual</h3>
            <button onClick={(e) => { e.stopPropagation(); setIsOpen(false); }} className="hover:bg-white/20 p-1 rounded-full transition-colors">
              <span className="material-symbols-outlined text-xl">close</span>
            </button>
          </div>
          <div className="flex-1 p-4 overflow-y-auto bg-gray-50 flex flex-col gap-3">
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] p-3 rounded-2xl text-sm ${m.role === 'user'
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
    </div>
  );
};

export default FAQWidget;