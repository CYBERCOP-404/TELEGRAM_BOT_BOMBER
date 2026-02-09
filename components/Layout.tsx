
import React from 'react';

interface LayoutProps {
  children: React.ReactNode;
  title: string;
}

const Layout: React.FC<LayoutProps> = ({ children, title }) => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 relative">
      <div className="w-full max-w-md z-10">
        <div className="text-center mb-10 group">
          <div className="inline-block px-4 py-1 bg-green-500/10 rounded-full border border-green-500/20 mb-3 animate-pulse">
            <span className="text-[9px] uppercase tracking-[0.4em] font-black text-green-400">Secure Transmission active</span>
          </div>
          <h1 className="text-4xl font-black text-green-500 uppercase tracking-tighter glitch-text select-none">
            {title}
          </h1>
          <div className="flex justify-center gap-1 mt-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="w-8 h-[2px] bg-green-900/40 overflow-hidden">
                <div className={`h-full bg-green-400 animate-[loading_1.5s_infinite]`} style={{ animationDelay: `${i * 0.2}s` }}></div>
              </div>
            ))}
          </div>
        </div>
        
        <div className="glass-panel rounded-xl p-8 relative overflow-hidden group">
          {/* Animated edges */}
          <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-green-500 m-4 opacity-40 group-hover:opacity-100 transition-opacity"></div>
          <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-green-500 m-4 opacity-40 group-hover:opacity-100 transition-opacity"></div>
          <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-green-500 m-4 opacity-40 group-hover:opacity-100 transition-opacity"></div>
          <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-green-500 m-4 opacity-40 group-hover:opacity-100 transition-opacity"></div>
          
          <div className="relative z-20">
            {children}
          </div>
        </div>
        
        <div className="mt-8 flex justify-between items-center text-[10px] text-green-900 font-black uppercase tracking-widest px-2 opacity-50">
          <span>Node: 0x5316471518</span>
          <span className="animate-pulse">Live // Encrypted</span>
        </div>
      </div>
      
      <style>{`
        @keyframes loading {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
      `}</style>
    </div>
  );
};

export default Layout;
