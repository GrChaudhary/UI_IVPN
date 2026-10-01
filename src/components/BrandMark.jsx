import React from 'react';

/** "wipro ●●●● intelligence ™" wordmark shared by the top bar and the sign-in page. */
export default function BrandMark({ size = 'md' }) {
  const big = size === 'lg';
  return (
    <span className="flex items-baseline">
      <span className={`${big ? 'text-3xl' : 'text-xl'} font-bold tracking-tight text-fg transition-colors`}>wipro</span>
      <span className="mx-1 text-sm font-bold flex items-center gap-0.5">
        <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-[0_0_8px_#00f2fe]" />
        <span className="w-1.5 h-1.5 rounded-full bg-pink-500 shadow-[0_0_8px_#ec4899]" />
        <span className="w-1.5 h-1.5 rounded-full bg-yellow-400 shadow-[0_0_8px_#facc15]" />
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_#10b981]" />
      </span>
      <span className={`${big ? 'text-2xl' : 'text-lg'} font-medium text-fg2`}>intelligence</span>
      <span className="text-[10px] ml-0.5 text-cyan-400 font-mono">™</span>
    </span>
  );
}
