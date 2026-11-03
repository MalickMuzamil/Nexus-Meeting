import React from 'react';

export const AuraBackground: React.FC = () => {
  return (
    <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden bg-[#030712]">
      {/* Top Left Indigo / Purple Ambient Aura */}
      <div 
        className="absolute -top-[15%] -left-[10%] w-[55vw] h-[55vw] rounded-full blur-[140px] opacity-45 animate-float-slow"
        style={{
          background: 'radial-gradient(circle, rgba(99, 102, 241, 0.45) 0%, rgba(168, 85, 247, 0.25) 45%, rgba(3, 7, 18, 0) 75%)'
        }}
      />

      {/* Top Right Cyan Glow Aura */}
      <div 
        className="absolute top-[5%] -right-[12%] w-[50vw] h-[50vw] rounded-full blur-[150px] opacity-40 animate-pulse-glow"
        style={{
          background: 'radial-gradient(circle, rgba(6, 182, 212, 0.4) 0%, rgba(14, 165, 233, 0.2) 50%, rgba(3, 7, 18, 0) 75%)'
        }}
      />

      {/* Bottom Center Rose / Violet Aura */}
      <div 
        className="absolute -bottom-[20%] left-[20%] w-[60vw] h-[60vw] rounded-full blur-[160px] opacity-35"
        style={{
          background: 'radial-gradient(circle, rgba(236, 72, 153, 0.3) 0%, rgba(139, 92, 246, 0.2) 45%, rgba(3, 7, 18, 0) 80%)'
        }}
      />

      {/* Subtle Noise / Grid Overlay */}
      <div 
        className="absolute inset-0 opacity-[0.025]"
        style={{
          backgroundImage: `radial-gradient(rgba(255, 255, 255, 0.15) 1px, transparent 1px)`,
          backgroundSize: '28px 28px'
        }}
      />
    </div>
  );
};

