import React from 'react';
import { Activity, ExternalLink, Rocket, ShieldCheck, Server } from 'lucide-react';
import { ACTIVE_CAMPAIGNS, EXECUTION_RUNS } from '../data/nexusData';
import { WindowsMicroLogo, RhelMicroLogo } from './BackgroundTexture';

const WIN = 842;
const RHEL = 578;

const STATUS_STYLE = {
  RUNNING: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/30',
  HEALTHY: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
  SUCCESS: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
  WARNING: 'text-amber-400 bg-amber-500/10 border-amber-500/30',
};

/** Faint static icon "blob" in the corner of a tile, like the KPI cards. */
function Watermark({ icon: Icon, className }) {
  return <Icon aria-hidden strokeWidth={1.25} className={`absolute -top-2 -right-2 w-24 h-24 pointer-events-none ${className}`} />;
}

const TILE = 'relative overflow-hidden rounded-2xl p-4 bg-inset/60 border border-ink/[0.08]';

export default function SystemCapacity({ onNavigateTab }) {
  const total = WIN + RHEL;
  const winPct = (WIN / total) * 100;
  const sum = (k) => EXECUTION_RUNS.reduce((n, r) => n + r[k], 0);
  const passed = sum('passed'), warnings = sum('warnings'), failed = sum('failed');
  const hosts = passed + warnings + failed;
  const passRate = ((passed / hosts) * 100).toFixed(1);

  return (
    <div className="nexus-card p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2 text-xs font-bold tracking-wider uppercase text-fg2">
          <Activity size={14} className="text-cyan-400 animate-pulse" />
          Fleet Operations
          <span className="ml-2 flex items-center gap-1 text-[10px] font-mono text-emerald-400">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse-glow" />
            OPTIMAL
          </span>
        </div>
        <button
          onClick={() => onNavigateTab && onNavigateTab('history')}
          className="group flex items-center gap-1.5 text-[11px] font-medium text-cyan-400 hover:text-cyan-300 transition-colors cursor-pointer"
        >
          Server Telemetry
          <ExternalLink size={12} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Active campaigns */}
        <div className={TILE}>
          <Watermark icon={Rocket} className="text-cyan-500/[0.14]" />
          <div className="relative flex items-baseline justify-between">
            <span className="text-[11px] font-bold text-fg3 uppercase tracking-wider">Active Campaigns</span>
            <span className="font-mono text-sm font-semibold text-cyan-400">{ACTIVE_CAMPAIGNS.length}</span>
          </div>
          <div className="mt-3 space-y-2">
            {ACTIVE_CAMPAIGNS.map((c) => (
              <div key={c.id} className="flex items-center gap-2.5 text-xs">
                <span className={`px-1.5 py-0.5 rounded border text-[9px] font-mono font-bold ${STATUS_STYLE[c.status] || STATUS_STYLE.RUNNING}`}>
                  {c.status}
                </span>
                <span className="truncate text-fg2 flex-1" title={c.name}>{c.name.replace(/^Wave \d+: /, '')}</span>
                <span className="font-mono text-[10px] text-fg3 flex-shrink-0">{c.nodes} nodes</span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent run health */}
        <div className={TILE}>
          <Watermark icon={ShieldCheck} className="text-emerald-500/[0.14]" />
          <div className="relative flex items-baseline justify-between">
            <span className="text-[11px] font-bold text-fg3 uppercase tracking-wider">Recent Run Health</span>
            <span className="font-mono text-sm font-semibold text-emerald-400">{passRate}% pass</span>
          </div>
          <div className="flex h-2 rounded-full overflow-hidden mt-3 bg-slate-800">
            <div className="bg-emerald-500" style={{ width: `${(passed / hosts) * 100}%` }} />
            <div className="bg-amber-500" style={{ width: `${(warnings / hosts) * 100}%` }} />
            <div className="bg-red-500" style={{ width: `${(failed / hosts) * 100}%` }} />
          </div>
          <div className="grid grid-cols-3 gap-2 mt-3 text-center">
            {[['Passed', passed, 'text-emerald-400'], ['Warnings', warnings, 'text-amber-400'], ['Failed', failed, 'text-red-400']].map(([l, v, c]) => (
              <div key={l} className="p-2 rounded-xl bg-inset border border-ink/[0.08]">
                <div className={`font-mono text-sm font-bold ${c}`}>{v}</div>
                <div className="text-[10px] text-fg3">{l}</div>
              </div>
            ))}
          </div>
          <div className="text-[11px] text-fg3 mt-2">Across last {EXECUTION_RUNS.length} runs · {hosts} hosts</div>
        </div>

        {/* OS split */}
        <div className={TILE}>
          <Watermark icon={Server} className="text-blue-500/[0.14]" />
          <div className="relative flex items-baseline justify-between">
            <span className="text-[11px] font-bold text-fg3 uppercase tracking-wider">Managed Nodes</span>
            <span className="font-mono text-sm font-semibold text-fg2">{total.toLocaleString()}</span>
          </div>
          <div className="flex h-2 rounded-full overflow-hidden mt-3 bg-slate-800">
            <div className="bg-sky-500" style={{ width: `${winPct}%` }} />
            <div className="bg-red-500" style={{ width: `${100 - winPct}%` }} />
          </div>
          <div className="grid grid-cols-2 gap-2 mt-3">
            <div className="flex items-center gap-2 p-2 rounded-xl bg-blue-950/30 border border-blue-500/20">
              <WindowsMicroLogo className="w-4 h-4" color="#00a4ef" />
              <div className="leading-tight">
                <div className="text-xs font-semibold text-blue-200">Windows</div>
                <div className="text-[10px] font-mono text-fg3">{WIN} Nodes</div>
              </div>
            </div>
            <div className="flex items-center gap-2 p-2 rounded-xl bg-red-950/30 border border-red-500/20">
              <RhelMicroLogo className="w-4 h-4" color="#ee0000" />
              <div className="leading-tight">
                <div className="text-xs font-semibold text-red-200">RHEL 9</div>
                <div className="text-[10px] font-mono text-fg3">{RHEL} Nodes</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
