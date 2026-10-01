import React, { useMemo, useState } from 'react';
import { X, CheckCircle2, XCircle, Loader2, Circle, ChevronDown, AlertTriangle, Download, FileSpreadsheet, FileText, Presentation, FileType2, Table2, Sparkles } from 'lucide-react';
import ModalPortal from './ui/ModalPortal';
import { buildRunDetail, formatDuration } from '../simulation/runDetail';
import { REPORT_FORMATS, downloadRunReport } from '../simulation/runReport';

const TABS = [['stages', 'Stage timeline'], ['hosts', 'Hosts'], ['report', 'Report & export']];

const STATE = {
  done: { icon: CheckCircle2, ring: 'border-emerald-500/50 text-emerald-400', label: 'Completed', badge: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30' },
  failed: { icon: XCircle, ring: 'border-rose-500/50 text-rose-400', label: 'Failed', badge: 'bg-rose-500/15 text-rose-300 border-rose-500/30' },
  active: { icon: Loader2, ring: 'border-cyan-500/50 text-cyan-400', label: 'Running', badge: 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30' },
  pending: { icon: Circle, ring: 'border-ink/20 text-fg4', label: 'Not run', badge: 'bg-ink/[0.05] text-fg3 border-ink/10' },
};

const HOST_TONE = {
  Passed: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
  Warning: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
  Failed: 'bg-rose-500/15 text-rose-300 border-rose-500/30',
};

const FORMAT_ICON = { xlsx: FileSpreadsheet, csv: Table2, pdf: FileText, pptx: Presentation, docx: FileType2 };

function Stat({ label, value, tone = 'text-fg' }) {
  return (
    <div className="p-3 rounded-xl bg-inset border border-ink/[0.06] text-center">
      <div className={`text-lg font-extrabold font-mono ${tone}`}>{value}</div>
      <div className="text-[10px] text-fg3 mt-0.5">{label}</div>
    </div>
  );
}

function StageItem({ stage, open, onToggle, last }) {
  const st = STATE[stage.state];
  const Icon = st.icon;
  return (
    <li className="relative pl-12">
      {!last && <span className="absolute left-[17px] top-9 bottom-[-12px] w-px bg-ink/[0.1]" aria-hidden="true" />}
      <span className={`absolute left-0 top-1 w-9 h-9 rounded-full border-2 bg-surface flex items-center justify-center ${st.ring}`}>
        <Icon size={16} className={stage.state === 'active' ? 'animate-spin' : ''} />
      </span>
      <div className={`rounded-xl border transition-colors ${open ? 'border-cyan-500/30 bg-ink/[0.02]' : 'border-ink/[0.08]'}`}>
        <button onClick={onToggle} aria-expanded={open} className="w-full flex items-center gap-3 px-4 py-3 text-left">
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
              <span className="text-[10px] font-mono text-fg4">STAGE {stage.n}</span>
              <span className="text-xs font-bold text-fg">{stage.name}</span>
              {stage.warn && <span className="flex items-center gap-1 text-[10px] font-bold text-amber-300"><AlertTriangle size={11} /> warnings</span>}
            </div>
            <div className="text-[11px] text-fg3 mt-0.5 truncate">{stage.summary}</div>
          </div>
          <div className="hidden sm:block text-right text-[10px] font-mono text-fg3 flex-shrink-0">
            {stage.start && <div>{stage.start}</div>}
            {stage.durationSec > 0 && <div className="text-fg2">{formatDuration(stage.durationSec)}</div>}
          </div>
          <span className={`px-2 py-0.5 rounded-full border text-[9px] font-bold flex-shrink-0 ${st.badge}`}>{st.label}</span>
          <ChevronDown size={14} className={`text-fg3 flex-shrink-0 transition-transform ${open ? 'rotate-180' : ''}`} />
        </button>

        {open && (
          <div className="px-4 pb-4 space-y-3 animate-in fade-in">
            <div className="text-[11px] text-fg3">
              Agent <span className="font-mono text-cyan-400">{stage.agent}</span>
            </div>
            {stage.metrics.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {stage.metrics.map(([k, v]) => (
                  <div key={k} className="p-2.5 rounded-lg bg-inset border border-ink/[0.06] min-w-0">
                    <div className="text-[9px] uppercase tracking-wider text-fg4">{k}</div>
                    <div className="text-xs font-semibold text-fg mt-0.5 break-words">{String(v)}</div>
                  </div>
                ))}
              </div>
            )}
            {stage.events.length > 0 && (
              <div className="rounded-lg bg-black/80 p-3 font-mono text-[11px] space-y-1">
                {stage.events.map((e, i) => (
                  <div key={i} className={e.message.startsWith('ERROR') ? 'text-rose-400' : 'text-emerald-400'}>
                    <span className="text-slate-500">[{e.time}]</span> {e.message}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </li>
  );
}

export default function RunDetailModal({ run, initialTab = 'stages', onClose }) {
  const detail = useMemo(() => buildRunDetail(run), [run]);
  const [tab, setTab] = useState(initialTab);
  const firstProblem = detail.stages.find((s) => s.state === 'failed' || s.warn);
  const [openStages, setOpenStages] = useState(() => new Set(firstProblem ? [firstProblem.n] : [6]));
  const [hostFilter, setHostFilter] = useState('All');
  const [busy, setBusy] = useState(null);
  const [error, setError] = useState(null);

  const toggle = (n) => setOpenStages((prev) => { const next = new Set(prev); next.has(n) ? next.delete(n) : next.add(n); return next; });
  const allOpen = openStages.size === detail.stages.length;
  const hosts = detail.hosts.filter((h) => hostFilter === 'All' || h.status === hostFilter);

  const download = async (id) => {
    setBusy(id);
    setError(null);
    try {
      await downloadRunReport(run, detail, id);
    } catch (e) {
      setError(`Could not build the ${id.toUpperCase()} report: ${e.message}`);
    } finally {
      setBusy(null);
    }
  };

  return (
    <ModalPortal>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
        <div role="dialog" aria-label="Run detail" className="w-full max-w-5xl max-h-[92vh] flex flex-col bg-surface text-fg border border-cyan-500/30 rounded-2xl shadow-2xl animate-in zoom-in-95">
          <div className="flex items-start justify-between gap-3 p-5 pb-3">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2 mb-1.5">
                {run.simulated && (
                  <span className="text-[10px] bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 px-2.5 py-0.5 rounded-full font-bold flex items-center gap-1"><Sparkles size={10} /> SIMULATED</span>
                )}
                <span className={`text-[10px] px-2.5 py-0.5 rounded-full border font-bold ${run.statusColor}`}>{run.status.replace(/_/g, ' ')}</span>
                <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-amber-400 text-onbright font-bold">{run.mode}</span>
              </div>
              <h3 className="text-sm font-bold font-mono break-all">{run.id}</h3>
              <p className="text-xs text-fg3 mt-0.5">{run.technology} · {run.env} · {run.week} · by {run.triggeredBy} · {run.started} IST</p>
            </div>
            <button onClick={onClose} aria-label="Close" className="p-1 text-fg3 hover:text-fg rounded-lg hover:bg-ink/[0.08] flex-shrink-0"><X size={18} /></button>
          </div>

          <div className="px-5 grid grid-cols-3 md:grid-cols-6 gap-2">
            <Stat label="Hosts" value={detail.totals.total} />
            <Stat label="Passed" value={run.passed ?? 0} tone="text-emerald-400" />
            <Stat label="Warnings" value={run.warnings ?? 0} tone="text-amber-400" />
            <Stat label="Failed" value={run.failed ?? 0} tone="text-rose-400" />
            <Stat label="Duration" value={formatDuration(detail.totals.durationSec)} />
            <Stat label="Stages done" value={`${detail.totals.finished}/${detail.stages.length}`} tone="text-cyan-400" />
          </div>

          <div className="px-5 pt-4 flex items-center gap-2 border-b border-ink/[0.08]">
            {TABS.map(([id, label]) => (
              <button key={id} onClick={() => setTab(id)} className={`px-4 py-2 text-xs font-semibold border-b-2 -mb-px transition-colors ${tab === id ? 'border-cyan-400 text-cyan-300' : 'border-transparent text-fg3 hover:text-fg'}`}>
                {label}
              </button>
            ))}
            {tab === 'stages' && (
              <button onClick={() => setOpenStages(allOpen ? new Set() : new Set(detail.stages.map((s) => s.n)))} className="ml-auto mb-1 text-[11px] text-cyan-400 hover:text-cyan-300">
                {allOpen ? 'Collapse all' : 'Expand all'}
              </button>
            )}
          </div>

          <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar p-5">
            {tab === 'stages' && (
              <ol className="space-y-3">
                {detail.stages.map((s, i) => (
                  <StageItem key={s.n} stage={s} open={openStages.has(s.n)} onToggle={() => toggle(s.n)} last={i === detail.stages.length - 1} />
                ))}
              </ol>
            )}

            {tab === 'hosts' && (
              <div className="space-y-3">
                <div className="flex flex-wrap items-center gap-1.5">
                  {['All', 'Passed', 'Warning', 'Failed'].map((f) => (
                    <button key={f} onClick={() => setHostFilter(f)} className={`px-3 py-1 rounded-full text-[11px] font-semibold ${hostFilter === f ? 'pill-tab-active' : 'text-fg3 hover:text-fg border border-ink/[0.08]'}`}>
                      {f} <span className="font-mono opacity-60">{f === 'All' ? detail.hosts.length : detail.hosts.filter((h) => h.status === f).length}</span>
                    </button>
                  ))}
                </div>
                <div className="rounded-xl border border-ink/[0.08] overflow-x-auto">
                  <table className="w-full text-xs min-w-[900px]">
                    <thead className="bg-inset text-[10px] uppercase tracking-wider text-fg3 text-left">
                      <tr>{['Host', 'IP', 'Wave', 'Before', 'After', 'Attempts', 'Duration', 'Result', 'Note'].map((c) => <th key={c} className="px-3 py-2">{c}</th>)}</tr>
                    </thead>
                    <tbody>
                      {hosts.length === 0 && <tr><td colSpan={9} className="py-8 text-center text-fg3">No hosts to show.</td></tr>}
                      {hosts.map((h) => (
                        <tr key={h.name} className="border-t border-ink/[0.06]">
                          <td className="px-3 py-2 font-mono text-fg">{h.name}</td>
                          <td className="px-3 py-2 font-mono text-fg3">{h.ip}</td>
                          <td className="px-3 py-2 text-fg2">{h.wave}</td>
                          <td className="px-3 py-2 text-fg3 whitespace-nowrap">{h.before}</td>
                          <td className="px-3 py-2 text-fg2 whitespace-nowrap">{h.after}</td>
                          <td className="px-3 py-2 text-fg2">{h.attempts}</td>
                          <td className="px-3 py-2 font-mono text-fg3">{formatDuration(h.durationSec)}</td>
                          <td className="px-3 py-2"><span className={`px-2 py-0.5 rounded-full border text-[9px] font-bold ${HOST_TONE[h.status]}`}>{h.status}</span></td>
                          <td className="px-3 py-2 text-fg3 whitespace-nowrap">{h.note || '-'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {tab === 'report' && (
              <div className="space-y-4">
                <p className="text-xs text-fg3">
                  Download the full report for this run: summary, all {detail.stages.length} stages with their outcome, metrics and log, and the result for each of the {detail.hosts.length} hosts.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {REPORT_FORMATS.map((f) => {
                    const Icon = FORMAT_ICON[f.id];
                    return (
                      <div key={f.id} className="p-4 rounded-xl border border-ink/[0.08] bg-inset flex flex-col gap-3">
                        <div className="flex items-center gap-2.5">
                          <span className="w-9 h-9 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 flex items-center justify-center"><Icon size={17} /></span>
                          <div>
                            <div className="text-xs font-bold text-fg">{f.label}</div>
                            <div className="text-[10px] font-mono text-fg4">.{f.ext}</div>
                          </div>
                        </div>
                        <p className="text-[11px] text-fg3 flex-1">{f.desc}</p>
                        <button
                          onClick={() => download(f.id)}
                          disabled={busy !== null}
                          className="flex items-center justify-center gap-2 py-2 rounded-lg bg-cyan-400 hover:bg-cyan-300 text-onbright text-xs font-semibold transition-all active:scale-95 disabled:opacity-50"
                        >
                          {busy === f.id ? <Loader2 size={13} className="animate-spin" /> : <Download size={13} />}
                          {busy === f.id ? 'Preparing…' : `Download ${f.label}`}
                        </button>
                      </div>
                    );
                  })}
                </div>
                {error && <p role="alert" className="text-xs text-rose-300">{error}</p>}
              </div>
            )}
          </div>

          <div className="p-4 border-t border-ink/[0.08] flex justify-end">
            <button onClick={onClose} className="px-4 py-2 text-xs font-semibold text-onbright bg-cyan-400 hover:bg-cyan-300 rounded-xl">Close</button>
          </div>
        </div>
      </div>
    </ModalPortal>
  );
}
