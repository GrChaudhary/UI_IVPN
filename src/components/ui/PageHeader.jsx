import React from 'react';

/** Shared tab header: icon + title + one-line subtitle, optional actions on the right. */
export default function PageHeader({ icon: Icon, tone = 'text-cyan-400', title, subtitle, children }) {
  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
      <div>
        <div className="flex items-center gap-2">
          <Icon size={18} className={tone} />
          <h2 className="text-xl font-bold text-fg tracking-tight">{title}</h2>
        </div>
        <p className="text-xs text-fg3 mt-1">{subtitle}</p>
      </div>
      {children && <div className="flex items-center gap-3">{children}</div>}
    </div>
  );
}
