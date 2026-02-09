
import React, { useState } from 'react';
import { UserCredentials, SendStatus } from '../types.ts';
import { sendMessageToUser } from '../services/telegramService.ts';

interface SenderViewProps {
  credentials: UserCredentials;
  onFinished: (status: SendStatus) => void;
  onLogout: () => void;
}

const SenderView: React.FC<SenderViewProps> = ({ credentials, onFinished, onLogout }) => {
  const [message, setMessage] = useState('');
  const [count, setCount] = useState<number | string>('');
  const [status, setStatus] = useState<SendStatus>({ sent: 0, failed: 0, remaining: 0, total: 0 });
  const [isSending, setIsSending] = useState(false);
  const [notifs, setNotifs] = useState<{ id: number; text: string; success: boolean }[]>([]);

  const addNotif = (text: string, success: boolean) => {
    const id = Date.now();
    setNotifs(prev => [{ id, text, success }, ...prev].slice(0, 2));
    setTimeout(() => {
      setNotifs(prev => prev.filter(n => n.id !== id));
    }, 4500);
  };

  const handleSend = async () => {
    const totalCount = parseInt(count.toString());
    if (!message || !totalCount || totalCount <= 0) return;

    setIsSending(true);
    let sentCount = 0;
    let failedCount = 0;
    
    setStatus({ sent: 0, failed: 0, remaining: totalCount, total: totalCount });

    for (let i = 0; i < totalCount; i++) {
      const success = await sendMessageToUser(credentials.token, credentials.userId, message);
      
      if (success) sentCount++; else failedCount++;

      setStatus({
        sent: sentCount,
        failed: failedCount,
        remaining: totalCount - (i + 1),
        total: totalCount
      });

      addNotif(`[DATA_PACKET_${i+1}] >> ${success ? 'RESOLVED' : 'ERROR'}`, success);
      await new Promise(r => setTimeout(r, 200));
    }

    setIsSending(false);
    setTimeout(() => {
      onFinished({ sent: sentCount, failed: failedCount, remaining: 0, total: totalCount });
    }, 1000);
  };

  const progress = status.total > 0 ? (status.sent / status.total) * 100 : 0;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center border-b border-green-500/10 pb-4">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
          <h3 className="text-xs font-black text-green-500 uppercase tracking-widest">Operator Console</h3>
        </div>
        <button 
          onClick={onLogout}
          className="text-[9px] font-black text-red-500 hover:bg-red-500 hover:text-black border border-red-500/30 px-3 py-1.5 rounded transition-all transform active:scale-95"
        >
          [ TERMINATE SESSION ]
        </button>
      </div>

      <div className="space-y-4">
        <div className="relative group">
          <div className="absolute -inset-0.5 bg-green-500/20 rounded blur opacity-0 group-focus-within:opacity-100 transition duration-500"></div>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="SYSTEM: Enter payload data..."
            rows={3}
            disabled={isSending}
            className="relative w-full px-4 py-3 rounded bg-green-400 text-black font-bold border-2 border-green-500 focus:ring-0 outline-none resize-none transition-all placeholder:text-black/30"
          />
          <div className="absolute top-2 right-2 text-[7px] text-black font-black uppercase opacity-20">Payload.bin</div>
        </div>
        
        <div className="relative group">
          <div className="absolute -inset-0.5 bg-green-500/20 rounded blur opacity-0 group-focus-within:opacity-100 transition duration-500"></div>
          <input
            type="number"
            value={count}
            onChange={(e) => setCount(e.target.value)}
            placeholder="CYCLES: Execution count..."
            disabled={isSending}
            className="relative w-full px-4 py-3 rounded bg-green-400 text-black font-bold border-2 border-green-500 focus:ring-0 outline-none transition-all placeholder:text-black/30"
          />
          <div className="absolute top-2 right-2 text-[7px] text-black font-black uppercase opacity-20">Loops.exe</div>
        </div>
        
        <button
          onClick={handleSend}
          disabled={isSending}
          className={`w-full py-4 bg-green-500 text-black font-black uppercase tracking-tighter shadow-[0_0_20px_rgba(0,255,65,0.4)] hover:shadow-[0_0_40px_rgba(0,255,65,0.6)] hover:-translate-y-1 active:translate-y-0 transition-all ${isSending ? 'opacity-50 cursor-wait' : ''}`}
        >
          {isSending ? ">>> FLOODING NETWORK..." : ">>> EXECUTE PACKET FLOOD"}
        </button>
      </div>

      <div className="pt-6 border-t border-green-500/10 space-y-4">
        <div className="flex justify-between text-[10px] font-black text-green-500 uppercase tracking-widest">
          <span>Network Load</span>
          <span className="animate-pulse">{Math.round(progress)}% COMPLETE</span>
        </div>
        <div className="h-3 w-full bg-black/40 border border-green-500/20 rounded-full overflow-hidden p-[2px]">
          <div 
            className="h-full bg-green-500 shadow-[0_0_15px_#00ff41] transition-all duration-500 ease-out" 
            style={{ width: `${progress}%` }}
          ></div>
        </div>
        
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-black/40 border border-green-500/10 p-3 rounded-lg text-center group hover:border-green-500/40 transition-colors">
            <div className="text-[7px] text-green-900 font-black uppercase mb-1">ACK_OK</div>
            <div className="text-sm font-black text-green-400">{status.sent}</div>
          </div>
          <div className="bg-black/40 border border-green-500/10 p-3 rounded-lg text-center group hover:border-green-500/40 transition-colors">
            <div className="text-[7px] text-green-900 font-black uppercase mb-1">WAIT_Q</div>
            <div className="text-sm font-black text-blue-400">{status.remaining}</div>
          </div>
          <div className="bg-black/40 border border-green-500/10 p-3 rounded-lg text-center group hover:border-green-500/40 transition-colors">
            <div className="text-[7px] text-green-900 font-black uppercase mb-1">ACK_ERR</div>
            <div className="text-sm font-black text-red-500">{status.failed}</div>
          </div>
        </div>
      </div>

      <div className="fixed top-8 right-8 z-[1002] flex flex-col gap-3 pointer-events-none w-64">
        {notifs.map(notif => (
          <div 
            key={notif.id}
            className={`px-4 py-3 rounded-md border-l-4 notification-glass shadow-[0_10px_30px_rgba(0,0,0,0.5)] text-[10px] font-black uppercase tracking-[0.1em] transition-all transform animate-slide-in flex flex-col gap-1 ${notif.success ? 'border-green-500 text-green-400' : 'border-red-500 text-red-400'}`}
          >
            <div className="flex justify-between items-center opacity-40">
              <span>SYSTEM_MSG</span>
              <span>${Math.floor(Math.random() * 9999)}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[12px]">{notif.text}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SenderView;
