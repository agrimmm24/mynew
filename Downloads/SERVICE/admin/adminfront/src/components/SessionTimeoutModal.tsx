import { useEffect, useState } from 'react';
import { AlertTriangle } from 'lucide-react';

interface SessionTimeoutModalProps {
  isOpen: boolean;
  onStayLoggedIn: () => void;
  countdownMinutes: number; // usually 1
}

export default function SessionTimeoutModal({ isOpen, onStayLoggedIn, countdownMinutes }: SessionTimeoutModalProps) {
  const [timeLeft, setTimeLeft] = useState(countdownMinutes * 60);

  useEffect(() => {
    if (!isOpen) {
      setTimeLeft(countdownMinutes * 60); // reset when closed
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isOpen, countdownMinutes]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-[#1a1b26] border border-amber-500/50 rounded-lg p-8 max-w-sm w-full mx-4 shadow-2xl shadow-amber-900/20 text-center animate-in zoom-in-95 duration-300">
        <div className="w-16 h-16 bg-amber-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
          <AlertTriangle size={32} className="text-amber-500" />
        </div>
        <h2 className="text-2xl font-black text-white uppercase tracking-tight mb-2">Protocol Timeout</h2>
        <p className="text-gray-400 font-medium text-sm mb-6">
          Admin inactivity detected. Secure session terminating in <span className="text-amber-500 font-bold">{timeLeft}s</span>.
        </p>
        
        <button
          onClick={onStayLoggedIn}
          className="w-full bg-amber-600 hover:bg-amber-500 py-3 rounded text-white font-black uppercase text-xs tracking-widest transition-all active:scale-[0.98] shadow-lg shadow-amber-900/30"
        >
          Maintain Access
        </button>
      </div>
    </div>
  );
}
