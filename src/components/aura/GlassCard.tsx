import React from 'react';

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  glow?: 'cyan' | 'purple' | 'emerald' | 'amber' | 'rose' | 'indigo' | 'none';
  interactive?: boolean;
  onClick?: () => void;
}

export const GlassCard: React.FC<GlassCardProps> = ({
  children,
  className = '',
  glow = 'none',
  interactive = false,
  onClick
}) => {
  const glowClasses = {
    none: '',
    cyan: 'hover:border-cyan-400/40 hover:shadow-[0_0_30px_rgba(6,182,212,0.2)]',
    purple: 'hover:border-purple-400/40 hover:shadow-[0_0_30px_rgba(168,85,247,0.2)]',
    emerald: 'hover:border-emerald-400/40 hover:shadow-[0_0_30px_rgba(16,185,129,0.2)]',
    amber: 'hover:border-amber-400/40 hover:shadow-[0_0_30px_rgba(245,158,11,0.2)]',
    rose: 'hover:border-rose-400/40 hover:shadow-[0_0_30px_rgba(244,63,94,0.2)]',
    indigo: 'hover:border-indigo-400/40 hover:shadow-[0_0_30px_rgba(99,102,241,0.2)]',
  };

  return (
    <div
      onClick={onClick}
      className={`
        relative min-w-0 rounded-2xl border border-white/75 bg-white/80 backdrop-blur-xl
        shadow-[0_12px_34px_rgba(89,117,95,0.10)] transition-all duration-300
        ${interactive ? 'cursor-pointer ' + glowClasses[glow] : ''}
        ${className}
      `}
    >
      {/* Subtle Top Highlight Border */}
      <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent pointer-events-none" />
      {children}
    </div>
  );
};
