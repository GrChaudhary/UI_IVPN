import React, { useState } from 'react';
import { ASSETS_BY_TECH } from '../data/cmdbData';

const RAW_TECHS = [
  { id: 'windows', label: 'Windows', color: '#38bdf8', hosts: 612, mix: [58, 22, 12, 8], pending: 148, critical: 23, lastRun: 'Sep 29 · Windows Prod Batch 1', next: 'Oct 06 · 10:00 PM', versions: [['Server 2022', 340], ['Server 2019', 210], ['Server 2016', 62]] },
  { id: 'rhel', label: 'RHEL', color: '#ef4444', hosts: 487, mix: [52, 26, 13, 9], pending: 96, critical: 17, lastRun: 'Sep 24 · RHEL Critical Fix', next: 'Oct 15 · 02:00 AM', versions: [['RHEL 9.4', 210], ['RHEL 8.9', 190], ['RHEL 8.7', 87]] },
  { id: 'mssql', label: 'MSSQL', color: '#f59e0b', hosts: 74, mix: [61, 20, 11, 8], pending: 18, critical: 4, lastRun: 'Sep 15 · Oracle & MSSQL CU', next: 'Oct 20 · 04:00 AM', versions: [['SQL 2022', 30], ['SQL 2019', 32], ['SQL 2016', 12]] },
  { id: 'oracle', label: 'Oracle', color: '#f97316', hosts: 58, mix: [49, 28, 14, 9], pending: 22, critical: 6, lastRun: 'Sep 15 · Oracle & MSSQL CU', next: 'Oct 20 · 04:00 AM', versions: [['Oracle 19c', 41], ['Oracle 12c', 17]] },
  { id: 'weblogic', label: 'WebLogic', color: '#a855f7', hosts: 41, mix: [55, 24, 12, 9], pending: 14, critical: 3, lastRun: 'Sep 22 · Middleware Batch', next: 'Oct 27 · 11:30 PM', versions: [['WebLogic 14c', 22], ['WebLogic 12c', 19]] },
  { id: 'jboss', label: 'JBoss', color: '#10b981', hosts: 36, mix: [47, 29, 14, 10], pending: 19, critical: 5, lastRun: 'Sep 22 · Middleware Batch', next: 'Oct 27 · 11:30 PM', versions: [['EAP 7.4', 20], ['EAP 8.0', 16]] },
];

/** Hosts come from the CMDB; version counts are re-split in the same proportions so they add up. */
const TECHS = RAW_TECHS.map((t) => {
  const hosts = ASSETS_BY_TECH[t.id.toUpperCase()].length;
  const weight = t.versions.reduce((n, [, c]) => n + c, 0);
  let left = hosts;
  const versions = t.versions.map(([name, c], i) => {
    const count = i === t.versions.length - 1 ? left : Math.round((c / weight) * hosts);
    left -= count;
    return [name, count];
  });
  return { ...t, hosts, versions };
});

const MIX = [
  ['Compliant', 'bg-emerald-400'],
  ['N-1', 'bg-sky-400'],
  ['N-3', 'bg-amber-400'],
  ['Non-compliant', 'bg-red-400'],
];

const sum = (list, pick) => list.reduce((n, t) => n + pick(t), 0);

const ALL = {
  id: 'all', label: 'All', color: '#22d3ee',
  hosts: sum(TECHS, (t) => t.hosts),
  mix: [0, 1, 2, 3].map((i) => Math.round(sum(TECHS, (t) => t.mix[i] * t.hosts) / sum(TECHS, (t) => t.hosts))),
  pending: sum(TECHS, (t) => t.pending),
  critical: sum(TECHS, (t) => t.critical),
  lastRun: 'Sep 29 · Windows Prod Batch 1',
  next: 'Oct 06 · 10:00 PM',
  versions: TECHS.map((t) => [t.label, t.hosts]),
};

export default function TechFleetWidget() {
  const [selected, setSelected] = useState('all');
  const view = selected === 'all' ? ALL : TECHS.find((t) => t.id === selected);
  const topVersion = Math.max(...view.versions.map(([, n]) => n));

  return (
    <div className="nexus-card p-5 space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="w-1 h-3.5 rounded-full" style={{ background: view.color, boxShadow: `0 0 8px ${view.color}` }} />
          <h2 className="text-xs font-bold uppercase tracking-wider text-fg2">Technology Fleet Health</h2>
        </div>
        <div className="flex flex-wrap items-center gap-1.5" role="tablist" aria-label="Filter by technology">
          {[ALL, ...TECHS].map((t) => (
            <button
              key={t.id}
              role="tab"
              aria-selected={selected === t.id}
              onClick={() => setSelected(t.id)}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold transition-all ${
                selected === t.id ? 'pill-tab-active' : 'text-fg3 hover:text-fg border border-ink/[0.08]'
              }`}
            >
              {t.id !== 'all' && <span className="w-1.5 h-1.5 rounded-full" style={{ background: t.color }} />}
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        <div className="lg:col-span-5 grid grid-cols-2 grid-rows-2 gap-3">
          {[
            ['Hosts managed', view.hosts.toLocaleString(), 'text-fg'],
            ['Compliant', `${view.mix[0]}%`, 'text-emerald-400'],
            ['Pending patches', view.pending, 'text-amber-400'],
            ['Critical CVEs', view.critical, 'text-red-400'],
          ].map(([label, value, tone]) => (
            <div key={label} className="rounded-xl bg-inset border border-ink/[0.06] px-3.5 py-3 flex flex-col justify-center">
              <div className="text-[10px] uppercase tracking-wider text-fg3">{label}</div>
              <div className={`text-2xl font-extrabold mt-1 ${tone}`}>{value}</div>
            </div>
          ))}
        </div>

        <div className="lg:col-span-7 space-y-4">
          <div>
            <div className="text-[10px] uppercase tracking-wider text-fg3 mb-1.5">Patch compliance · {view.label}</div>
            <div className="flex h-3 rounded-full overflow-hidden bg-inset">
              {MIX.map(([name, bg], i) => (
                <div key={name} className={`${bg} transition-all duration-500`} style={{ width: `${view.mix[i]}%` }} title={`${name} ${view.mix[i]}%`} />
              ))}
            </div>
            <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-[11px] text-fg3">
              {MIX.map(([name, bg], i) => (
                <span key={name} className="flex items-center gap-1.5">
                  <span className={`w-2 h-2 rounded-full ${bg}`} /> {name} <b className="text-fg2 font-mono">{view.mix[i]}%</b>
                </span>
              ))}
            </div>
          </div>

          <div>
            <div className="text-[10px] uppercase tracking-wider text-fg3 mb-1.5">{selected === 'all' ? 'Hosts by technology' : 'Hosts by version'}</div>
            <div className="space-y-1.5 min-h-[8.25rem]">
              {view.versions.map(([name, count]) => (
                <div key={name} className="flex items-center gap-3 text-[11px]">
                  <span className="w-24 text-fg2 truncate">{name}</span>
                  <div className="flex-1 h-1.5 rounded-full bg-inset overflow-hidden">
                    <div className="h-full rounded-full transition-all duration-500" style={{ width: `${(count / topVersion) * 100}%`, background: view.color }} />
                  </div>
                  <span className="w-10 text-right font-mono text-fg3">{count}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="flex flex-wrap gap-x-6 gap-y-1 text-[11px] text-fg3 pt-1 border-t border-ink/[0.06]">
            <span>Last run <b className="text-fg2">{view.lastRun}</b></span>
            <span>Next window <b className="text-cyan-400">{view.next}</b></span>
          </div>
        </div>
      </div>
    </div>
  );
}
