import React, { useState, useMemo } from 'react';
import { Filter, Search, ChevronRight, Sparkles, Download } from 'lucide-react';
import Select from './ui/Select';
import PageHeader from './ui/PageHeader';
import { TECH_OPTIONS } from '../simulation/simulationEngine';
import { stageState, STATUS_LABELS, MODE_LABELS, weekLabel } from '../simulation/runDetail';
import RunDetailModal from './RunDetailModal';

/* ---------- static seed (fallback when App hasn't loaded EXECUTION_RUNS) ---------- */
const STATIC_SEED = [
  {
    id: '#R-WEBLOGIC-ONDEMAND-ec3ccd-20260818T135848',
    mode: 'ON-DEMAND', week: 'ONDEMAND', env: 'Development',
    technology: 'WEBLOGIC',
    status: 'COMPLETED_WITH_WARNINGS',
    statusColor: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
    stagesDone: 8, stagesTotal: 9,
    stagesArray: [1,1,1,1,1,1,1,1,0],
    triggeredBy: 'admin', started: '2026-08-18 13:58:48',
    passed: 34, warnings: 4, failed: 0, simulated: false,
  },
  {
    id: '#R-ALL-ONDEMAND-74555c-20260818T135223',
    mode: 'ON-DEMAND', week: 'ONDEMAND', env: 'Development',
    technology: 'ALL',
    status: 'ABORTED',
    statusColor: 'bg-rose-500/20 text-rose-300 border-rose-500/30',
    stagesDone: 2, stagesTotal: 9,
    stagesArray: [1,1,0,0,0,0,0,0,0],
    triggeredBy: 'admin', started: '2026-08-18 13:52:23',
    passed: 0, warnings: 0, failed: 2, simulated: false,
  },
  {
    id: '#R-WINDOWS-ONDEMAND-db36c4-20260817T123032',
    mode: 'ON-DEMAND', week: 'ONDEMAND', env: 'Development',
    technology: 'WINDOWS',
    status: 'COMPLETED_WITH_WARNINGS',
    statusColor: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
    stagesDone: 8, stagesTotal: 9,
    stagesArray: [1,1,1,1,1,1,1,1,0],
    triggeredBy: 'admin', started: '2026-08-17 12:30:32',
    passed: 30, warnings: 6, failed: 0, simulated: false,
  },
  {
    id: '#R-RHEL-ONDEMAND-22bb34-20260817T144037',
    mode: 'ON-DEMAND', week: 'ONDEMAND', env: 'Development',
    technology: 'RHEL',
    status: 'COMPLETED_WITH_WARNINGS',
    statusColor: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
    stagesDone: 5, stagesTotal: 9,
    stagesArray: [1,1,1,1,1,0,0,0,0],
    triggeredBy: 'admin', started: '2026-08-17 14:40:37',
    passed: 22, warnings: 5, failed: 0, simulated: false,
  },
  {
    id: '#R-ORACLE-ONDEMAND-fa1b86-20260818T123125',
    mode: 'ON-DEMAND', week: 'ONDEMAND', env: 'Development',
    technology: 'ORACLE',
    status: 'COMPLETED_WITH_WARNINGS',
    statusColor: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
    stagesDone: 8, stagesTotal: 9,
    stagesArray: [1,1,1,1,1,1,1,1,0],
    triggeredBy: 'admin', started: '2026-08-18 12:31:25',
    passed: 28, warnings: 3, failed: 0, simulated: false,
  },
  {
    id: '#R-MSSQL-W01-9cb2f6-20260816T140516',
    mode: 'ON-DEMAND', week: 'w01', env: 'Development',
    technology: 'MSSQL',
    status: 'COMPLETED_WITH_WARNINGS',
    statusColor: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
    stagesDone: 8, stagesTotal: 9,
    stagesArray: [1,1,1,1,1,1,1,1,0],
    triggeredBy: 'scheduler', started: '2026-08-16 14:05:16',
    passed: 32, warnings: 2, failed: 0, simulated: false,
  },
  {
    id: '#R-JBOSS-ONDEMAND-56f53b-20260817T152733',
    mode: 'ON-DEMAND', week: 'ONDEMAND', env: 'Development',
    technology: 'JBOSS',
    status: 'COMPLETED_WITH_WARNINGS',
    statusColor: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
    stagesDone: 7, stagesTotal: 9,
    stagesArray: [1,1,1,1,1,1,1,0,0],
    triggeredBy: 'admin', started: '2026-08-17 15:27:33',
    passed: 25, warnings: 7, failed: 0, simulated: false,
  },
];

const STAGE_TONE = { done: 'bg-emerald-400', active: 'bg-amber-400', failed: 'bg-red-500', pending: 'bg-slate-600' };

const unique = (runs, key) => [...new Set(runs.map((r) => r[key]).filter(Boolean))];

export default function UnifiedHistory({ historyRuns }) {
  const runs = historyRuns ?? STATIC_SEED;

  const [modeFilter,   setModeFilter]   = useState('All');
  const [envFilter,    setEnvFilter]    = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [techFilter,   setTechFilter]   = useState('All');
  const [searchQuery,  setSearchQuery]  = useState('');
  const [selectedRun,  setSelectedRun]  = useState(null);
  const [detailTab,    setDetailTab]    = useState('stages');
  const openRun = (run, tab = 'stages') => { setDetailTab(tab); setSelectedRun(run); };

  const filtered = useMemo(() => {
    const q = searchQuery.toLowerCase();
    return runs.filter(
      (r) =>
        (r.id.toLowerCase().includes(q) || (r.triggeredBy || '').toLowerCase().includes(q)) &&
        (modeFilter === 'All' || r.mode === modeFilter) &&
        (envFilter === 'All' || r.env === envFilter) &&
        (statusFilter === 'All' || r.status === statusFilter) &&
        (techFilter === 'All' || (r.technology || '').toUpperCase() === techFilter),
    );
  }, [runs, searchQuery, modeFilter, envFilter, statusFilter, techFilter]);

  const kpis = [
    { label: 'Total Runs', value: runs.length,                                   tone: 'text-violet-400' },
    { label: 'On-Demand',  value: runs.filter((r) => r.mode === 'ON-DEMAND').length, tone: 'text-orange-400' },
    { label: 'Scheduled',  value: runs.filter((r) => r.mode === 'SCHEDULED').length, tone: 'text-blue-400' },
    { label: 'Showing',    value: filtered.length,                               tone: 'text-fg' },
  ];

  return (
    <div className="p-6 space-y-4 w-full max-w-[1700px] mx-auto animate-in fade-in duration-300">
      <PageHeader title="Execution History" subtitle="Every patch run across environments, with stage-by-stage progress." />

      {/* KPI row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {kpis.map(({ label, value, tone }) => (
          <div key={label} className="nexus-card p-4 text-center">
            <div className={`text-3xl font-extrabold ${tone}`}>{value}</div>
            <div className="text-xs text-fg3 mt-1">{label}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="nexus-card p-3 flex flex-wrap items-center gap-2.5">
        <span className="flex items-center gap-2 px-2 text-[11px] font-bold uppercase tracking-wider text-fg3">
          <Filter size={13} /> Filters
        </span>
        <Select value={modeFilter} onValueChange={setModeFilter} aria-label="Mode filter" options={[{ value: 'All', label: 'All Modes' }, ...unique(runs, 'mode').map((m) => ({ value: m, label: MODE_LABELS[m] ?? m }))]} />
        <Select value={envFilter} onValueChange={setEnvFilter} aria-label="Environment filter" options={[{ value: 'All', label: 'All Environments' }, ...unique(runs, 'env')]} />
        <Select
          value={statusFilter}
          onValueChange={setStatusFilter}
          aria-label="Status filter"
          options={[{ value: 'All', label: 'All Statuses' }, ...unique(runs, 'status').map((s) => ({ value: s, label: STATUS_LABELS[s] ?? s }))]}
        />
        <Select value={techFilter} onValueChange={setTechFilter} aria-label="Technology filter" options={[{ value: 'All', label: 'All Technologies' }, ...TECH_OPTIONS.map(({ value, label }) => ({ value, label }))]} />
        <div className="relative w-full sm:w-64">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-fg3" />
          <input
            type="text"
            placeholder="Search run ID or initiator..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            aria-label="Search runs"
            className="w-full bg-inset border border-ink/[0.1] rounded-lg pl-8 pr-3 py-2 text-xs text-fg placeholder-fg4 focus:outline-none focus:border-cyan-500"
          />
        </div>
        <span className="ml-auto pr-2 text-[11px] text-fg3">{filtered.length} results</span>
      </div>

      {/* Stage legend: swatches match the table */}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 px-1 text-[11px] text-fg3">
        <span className="font-semibold text-fg2">Stages S1–S9</span>
        {[['done', 'Completed'], ['active', 'In progress'], ['failed', 'Failed'], ['pending', 'Pending']].map(([k, label]) => (
          <span key={k} className="flex items-center gap-1.5"><span className={`w-2.5 h-2.5 rounded-[2px] ${STAGE_TONE[k]}`} />{label}</span>
        ))}
      </div>

      {/* Table */}
      <div className="nexus-card overflow-x-auto">
        {filtered.length === 0 ? (
          <div className="p-16 text-center text-fg4 text-sm">No runs match the current filters.</div>
        ) : (
          <table className="w-full text-left text-xs text-fg2 min-w-[900px]">
            <thead className="bg-inset border-b border-ink/[0.08] text-[10px] font-bold text-fg3 uppercase tracking-wider font-mono">
              <tr>
                <th className="py-3.5 px-3">Run ID</th>
                <th className="py-3.5 px-2">Mode</th>
                <th className="py-3.5 px-2">Week</th>
                <th className="py-3.5 px-2">Environment</th>
                <th className="py-3.5 px-2">Status</th>
                <th className="py-3.5 px-2">Stages (S1–S9)</th>
                <th className="py-3.5 px-2 whitespace-nowrap">Triggered By</th>
                <th className="py-3.5 px-2">Started (IST)</th>
                <th className="py-3.5 px-3"><span className="sr-only">Actions</span></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink/[0.04] font-mono text-[11px]">
              {filtered.map((run) => {
                return (
                  <tr key={run.id} className={`hover:bg-ink/[0.02] transition-colors group ${run.simulated ? 'border-l-2 border-cyan-500/40' : ''}`}>
                    <td className="py-3 px-3 font-bold text-fg group-hover:text-cyan-300 transition-colors max-w-[230px]">
                      <div className="flex items-center gap-1.5">
                        {run.simulated && <Sparkles size={10} className="text-cyan-400 flex-shrink-0" />}
                        <span className="truncate" title={run.id}>{run.id}</span>
                      </div>
                    </td>
                    <td className="py-3 px-2">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-400 text-onbright whitespace-nowrap">✦ {MODE_LABELS[run.mode] ?? run.mode}</span>
                    </td>
                    <td className="py-3 px-2">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${run.week === 'ONDEMAND' ? 'bg-slate-500/15 text-fg2 border-ink/15' : 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'}`}>
                        {weekLabel(run.week)}
                      </span>
                    </td>
                    <td className="py-3 px-2 font-sans text-fg2">{run.env}</td>
                    <td className="py-3 px-2">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border whitespace-nowrap ${run.statusColor}`}>{STATUS_LABELS[run.status] ?? run.status}</span>
                    </td>
                    <td className="py-3 px-2">
                      <div className="flex items-center gap-1.5">
                        <div className="flex items-center gap-0.5" role="img" aria-label={`${run.stagesDone} of ${run.stagesTotal} stages complete`}>
                          {run.stagesArray.map((_, i) => (
                            <span key={i} className={`w-2 h-2 rounded-[2px] ${STAGE_TONE[stageState(run, i)]}`} />
                          ))}
                        </div>
                        <span className="text-[10px] text-fg3">{run.stagesDone}/{run.stagesTotal}</span>
                      </div>
                    </td>
                    <td className="py-3 px-2 font-sans text-fg2">{run.triggeredBy}</td>
                    <td className="py-3 px-2 text-fg3 whitespace-nowrap">{run.started}</td>
                    <td className="py-3 px-3">
                      <div className="flex items-center justify-end">
                        <div className="flex items-center gap-3">
                          <button onClick={() => openRun(run, 'report')} aria-label={`Download report for ${run.id}`} title="Download report" className="text-fg3 hover:text-cyan-300 font-sans text-xs flex items-center gap-1">
                            <Download size={13} /> Report
                          </button>
                          <button onClick={() => openRun(run)} className="text-cyan-400 hover:text-cyan-300 font-sans font-semibold text-xs flex items-center gap-0.5">
                            View <ChevronRight size={13} />
                          </button>
                        </div>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {filtered.length > 0 && <OutcomeSummary runs={filtered} />}

      {selectedRun && <RunDetailModal key={selectedRun.id} run={selectedRun} initialTab={detailTab} onClose={() => setSelectedRun(null)} />}
    </div>
  );
}

/** At-a-glance outcome of the runs currently listed: status mix and host totals. */
function OutcomeSummary({ runs }) {
  const byStatus = Object.keys(STATUS_LABELS)
    .map((status) => ({ status, count: runs.filter((r) => r.status === status).length }))
    .filter((s) => s.count > 0);
  const sum = (k) => runs.reduce((n, r) => n + (r[k] ?? 0), 0);
  const bar = { COMPLETED: 'bg-emerald-400', COMPLETED_WITH_WARNINGS: 'bg-amber-400', RUNNING: 'bg-cyan-400', DRY_RUN: 'bg-slate-400', ABORTED: 'bg-rose-500' };
  const tiles = [['Hosts passed', sum('passed'), 'text-emerald-400'], ['Warnings', sum('warnings'), 'text-amber-400'], ['Failed', sum('failed'), 'text-rose-400']];
  return (
    <div className="nexus-card p-5 grid grid-cols-1 lg:grid-cols-12 gap-5 items-center">
      <div className="lg:col-span-7 space-y-2.5">
        <div className="text-[11px] font-bold uppercase tracking-widest text-fg2">Outcome mix · {runs.length} run{runs.length === 1 ? '' : 's'}</div>
        <div className="flex h-3 rounded-full overflow-hidden bg-inset">
          {byStatus.map((s) => <div key={s.status} className={bar[s.status]} style={{ width: `${(s.count / runs.length) * 100}%` }} title={`${STATUS_LABELS[s.status]}: ${s.count}`} />)}
        </div>
        <div className="flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-fg3">
          {byStatus.map((s) => (
            <span key={s.status} className="flex items-center gap-1.5"><span className={`w-2 h-2 rounded-full ${bar[s.status]}`} />{STATUS_LABELS[s.status]} <b className="text-fg2 font-mono">{s.count}</b></span>
          ))}
        </div>
      </div>
      <div className="lg:col-span-5 grid grid-cols-3 gap-3">
        {tiles.map(([label, value, tone]) => (
          <div key={label} className="p-3 rounded-xl bg-inset border border-ink/[0.06] text-center">
            <div className={`text-xl font-extrabold font-mono ${tone}`}>{value}</div>
            <div className="text-[10px] text-fg3 mt-0.5">{label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
