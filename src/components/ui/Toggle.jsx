import React from 'react';

export default function Toggle({ checked, onChange, label }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className={`relative w-9 h-5 rounded-full border transition-colors flex-shrink-0 ${checked ? 'bg-cyan-500/70 border-cyan-400' : 'bg-inset border-ink/[0.15]'}`}
    >
      <span className={`absolute top-0.5 left-0.5 w-3.5 h-3.5 rounded-full bg-white transition-transform ${checked ? 'translate-x-4' : ''}`} />
    </button>
  );
}
