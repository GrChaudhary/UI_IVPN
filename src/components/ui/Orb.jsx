import React from 'react';

/** Lightweight CSS sphere (no WebGL context): glossy gradient, drifting highlight, optional pulse ring. */
export default function Orb({ color, size = 40, pulse = true, delay = 0, children }) {
  const style = { width: size, height: size, animationDelay: `${-delay}s` };
  return (
    <span className="orb-float relative inline-flex items-center justify-center rounded-full flex-shrink-0" style={style}>
      {pulse && <span className="orb-ring absolute inset-0 rounded-full" style={{ border: `1px solid ${color}`, animationDelay: `${-delay}s` }} />}
      <span
        className="absolute inset-0 rounded-full overflow-hidden"
        style={{
          background: `radial-gradient(circle at 32% 28%, color-mix(in srgb, #fff 60%, ${color}), ${color} 52%, color-mix(in srgb, #000 55%, ${color}))`,
          boxShadow: `0 0 ${size * 0.55}px ${color}55`,
        }}
      >
        <span className="orb-swirl absolute inset-0" style={{ background: 'conic-gradient(from 0deg, transparent 0 55%, rgba(255,255,255,0.35) 75%, transparent 90%)', animationDelay: `${-delay}s` }} />
      </span>
      <span className="relative text-white font-mono font-bold drop-shadow" style={{ fontSize: size * 0.28 }}>{children}</span>
    </span>
  );
}
