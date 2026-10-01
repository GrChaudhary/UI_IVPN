import React from 'react';
import { ShieldCheck, HardDrive, Database, Network, BarChart3 } from 'lucide-react';
import PageHeader from './ui/PageHeader';

// Device counts per OEM and compliance state are the single source for every number on this page.
const STATUSES = [
  { key: 'compliant',    label: 'Compliant',     color: '#10b981', text: 'text-emerald-400' },
  { key: 'n1',           label: 'N-1',           color: '#eab308', text: 'text-amber-400' },
  { key: 'n3',           label: 'N-3',           color: '#f97316', text: 'text-orange-400' },
  { key: 'nonCompliant', label: 'Non-Compliant', color: '#ef4444', text: 'text-rose-400' },
];

const DOMAINS = [
  {
    id: 'storage', label: 'Storage', icon: HardDrive,
    oems: [
      { name: 'DELL EMC', dot: 'bg-blue-500',   counts: { compliant: 1, nonCompliant: 1 } },
      { name: 'HP',       dot: 'bg-blue-500',   counts: { compliant: 1 } },
      { name: 'NETAPP',   dot: 'bg-blue-500',   counts: { n1: 1 } },
      { name: 'PURE',     dot: 'bg-orange-500', counts: { compliant: 1, n1: 1, nonCompliant: 1 } },
    ],
  },
  {
    id: 'backup', label: 'Backup', icon: Database,
    oems: [
      { name: 'COHESITY',  dot: 'bg-violet-500',  counts: { compliant: 1 } },
      { name: 'COMMVAULT', dot: 'bg-orange-500',  counts: { n3: 1 } },
      { name: 'RUBRIK',    dot: 'bg-red-500',     counts: { compliant: 1 } },
      { name: 'VEEAM',     dot: 'bg-emerald-500', counts: { n1: 1 } },
      // The reference screenshot cuts this card off, so its name is unknown; counts reconcile the Backup total.
      { name: 'OTHER',     dot: 'bg-slate-500',   counts: { compliant: 1 } },
    ],
  },
  {
    id: 'network', label: 'Network', icon: Network,
    oems: [{ name: 'CISCO', dot: 'bg-blue-500', counts: { nonCompliant: 6 } }],
  },
];

const sum = (counts) => STATUSES.reduce((n, { key }) => n + (counts[key] ?? 0), 0);
const merge = (list) => Object.fromEntries(STATUSES.map(({ key }) => [key, list.reduce((n, c) => n + (c[key] ?? 0), 0)]));
const pct = (counts) => Math.round(((counts.compliant ?? 0) / sum(counts)) * 100);

const domainCounts = (d) => merge(d.oems.map((o) => o.counts));
const overall = merge(DOMAINS.map(domainCounts));

const CIRC = 2 * Math.PI * 38;

/** Ring of coloured arcs, one per compliance state, with the compliant share in the middle. */
function Donut({ counts, className, big }) {
  const total = sum(counts);
  let offset = 0;
  const value = pct(counts);
  return (
    <div className={`relative flex items-center justify-center shrink-0 ${className}`}>
      <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100" role="img" aria-label={`${value}% compliant`}>
        <circle cx="50" cy="50" r="38" className="stroke-slate-800" strokeWidth="12" fill="transparent" />
        {STATUSES.filter(({ key }) => counts[key]).map(({ key, color }) => {
          const len = (counts[key] / total) * CIRC;
          const arc = <circle key={key} cx="50" cy="50" r="38" stroke={color} strokeWidth="12" strokeDasharray={`${len} ${CIRC}`} strokeDashoffset={-offset} fill="transparent" />;
          offset += len;
          return arc;
        })}
      </svg>
      <div className="absolute text-center">
        <div className={`${big ? 'text-xl' : 'text-xs'} font-bold ${value === 0 ? 'text-rose-400' : 'text-fg'}`}>{value}%</div>
        {big && <div className="text-[9px] text-fg3">compliant</div>}
      </div>
    </div>
  );
}

function OemCard({ oem }) {
  const total = sum(oem.counts);
  return (
    <div className="nexus-card p-4 flex items-center gap-4">
      <Donut counts={oem.counts} className="w-16 h-16" />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className={`w-2.5 h-2.5 rounded-sm ${oem.dot}`} />
          <span className="text-xs font-extrabold text-fg tracking-wide">{oem.name}</span>
          <span className="text-[10px] text-fg3">({total} {total === 1 ? 'device' : 'devices'})</span>
        </div>
        <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[10px] font-mono text-fg2">
          {STATUSES.filter(({ key }) => oem.counts[key]).map(({ key, label, color }) => (
            <span key={key} className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-[2px]" style={{ background: color }} />
              {label}: <b className="text-fg">{oem.counts[key]}</b>
            </span>
          ))}
        </div>
        <div className="mt-2.5 flex h-1.5 rounded-full overflow-hidden bg-slate-800">
          {STATUSES.filter(({ key }) => oem.counts[key]).map(({ key, color }) => (
            <span key={key} style={{ width: `${(oem.counts[key] / total) * 100}%`, background: color }} />
          ))}
        </div>
      </div>
    </div>
  );
}

export default function ComplianceManagement() {
  const total = sum(overall);
  const metrics = [
    { label: 'TOTAL DEVICES',     value: total,                 tone: 'text-fg',          head: 'text-fg3' },
    { label: 'COMPLIANT',         value: overall.compliant,     tone: 'text-emerald-400', head: 'text-emerald-400' },
    { label: 'N-1 (1 VER BEHIND)', value: overall.n1,           tone: 'text-amber-400',   head: 'text-amber-400' },
    { label: 'N-3 (3 VER BEHIND)', value: overall.n3,           tone: 'text-orange-400',  head: 'text-orange-400' },
    { label: 'NON-COMPLIANT',     value: overall.nonCompliant,  tone: 'text-rose-400',    head: 'text-rose-400' },
  ];
  const summaries = [{ id: 'overall', label: 'Overall', counts: overall }, ...DOMAINS.map((d) => ({ id: d.id, label: d.label, counts: domainCounts(d) }))];

  return (
    <div className="p-6 space-y-6 w-full max-w-[1700px] mx-auto animate-in fade-in">
      <PageHeader icon={ShieldCheck} tone="text-emerald-400" title="Compliance Management" subtitle="Device patch compliance against the N-1 baseline, by domain and OEM." />

      {/* Metric cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3.5">
        {metrics.map(({ label, value, tone, head }) => (
          <div key={label} className="nexus-card p-4">
            <div className={`text-[11px] font-bold tracking-wider uppercase ${head}`}>{label}</div>
            <div className={`text-3xl font-extrabold mt-1 ${tone}`}>{value}</div>
          </div>
        ))}
      </div>

      {/* Overall + per-domain donuts */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {summaries.map(({ id, label, counts }) => (
          <div key={id} className="nexus-card p-4 flex flex-col justify-between">
            <div className="text-xs font-bold text-fg2 uppercase tracking-wide">{label}</div>
            <Donut counts={counts} big className="w-36 h-36 mx-auto my-3" />
            <div className="space-y-1 text-[11px] pt-2 border-t border-ink/[0.06]">
              {STATUSES.filter(({ key }) => counts[key]).map(({ key, label: l, text }) => (
                <div key={key} className="flex justify-between text-fg2"><span>{l}</span><span className={`font-mono ${text}`}>{counts[key]}</span></div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Compliance by OEM */}
      <section className="nexus-card p-5 space-y-4" aria-labelledby="oem-heading">
        <h2 id="oem-heading" className="flex items-center gap-2 text-xs font-bold text-fg2 uppercase tracking-wider">
          <BarChart3 size={13} className="text-fg3" /> Compliance by OEM
        </h2>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {DOMAINS.map(({ id, label, icon: Icon, oems }) => (
            <div key={id} className="space-y-3">
              <div className="flex items-center gap-2 pb-2 border-b border-ink/[0.06] text-[11px] font-bold uppercase tracking-wider text-fg3">
                <Icon size={13} /> {label}
              </div>
              {oems.map((o) => <OemCard key={o.name} oem={o} />)}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
