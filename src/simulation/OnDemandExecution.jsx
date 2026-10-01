import React, { useState, useRef, useEffect, useMemo } from 'react';
import {
  Play,
  CheckCircle2,
  Terminal,
  ShieldCheck,
  RefreshCw,
  ChevronRight,
  Square,
  AlertTriangle,
  Clock,
  Server,
  Loader2,
  History as HistoryIcon,
  Eye,
} from 'lucide-react';
import TechScopeModal from './TechScopeModal';
import { ASSETS_BY_TECH } from '../data/cmdbData';
import {
  STAGES,
  STAGE_MINUTES,
  TECH_OPTIONS,
  TECH_HOSTS,
  WAVE_OPTIONS,
  WAVE_META,
  randomHex,
  nowIST,
  buildHistoryEntry,
} from './simulationEngine';

const TICKS_PER_STAGE = 3;
const TICK_MS = 380;
const HOST_STAGE = 6; // "Multi-Node Staged Deployment"
const INIT_LOG = ['[INIT] Agentic Execution Engine ready. Awaiting trigger signal...'];

const PREFLIGHT = [
  'Orchestrator reachable',
  'Target hosts reachable',
  'Snapshot capacity available',
  'ServiceNow CR slot open',
];

const TONE = {
  emerald: 'text-emerald-300 bg-emerald-500/15 border-emerald-500/30',
  amber:   'text-amber-300 bg-amber-500/15 border-amber-500/30',
  orange:  'text-orange-300 bg-orange-500/15 border-orange-500/30',
  rose:    'text-rose-300 bg-rose-500/15 border-rose-500/30',
};

const stageLabel = (s) => s.replace(/^Stage \d+:\s*/, '');
const logColor = (l) =>
  l.includes('✗') || l.includes('ABORT') ? 'text-rose-400'
  : l.includes('★') ? 'text-cyan-300'
  : l.includes('▶') ? 'text-amber-300'
  : 'text-emerald-400';

export default function OnDemandExecution({ onSimulationComplete, onNavigateTab, historyRuns = [] }) {
  const [selectedTechs, setSelectedTechs] = useState([]);
  const [selectedWave,  setSelectedWave]  = useState(null);
  const [mode,          setMode]          = useState(null); // 'sandbox' | 'live'
  const [scopeTech,     setScopeTech]     = useState(null); // tech whose server list is open
  const [excluded,      setExcluded]      = useState(() => new Set()); // CMDB server ids unselected in the scope popup
  const [confirmText,   setConfirmText]   = useState('');
  const [checks,        setChecks]        = useState(PREFLIGHT.map(() => 'idle'));
  const [checkNonce,    setCheckNonce]    = useState(0);

  const [tick,      setTick]      = useState(-1);      // -1 = idle
  const [status,    setStatus]    = useState('idle');  // idle | running | done | aborted
  const [entries,   setEntries]   = useState([]);
  const [logs,      setLogs]      = useState(INIT_LOG);

  const intervalRef = useRef(null);
  const logsEndRef  = useRef(null);
  const runRef      = useRef(null); // { techs, wave, dry, ts } snapshot of the launched run

  const waveMeta   = WAVE_META[selectedWave] ?? null;
  const isDryRun   = mode === 'sandbox';
  const share      = waveMeta?.share ?? 1;
  const scopedHosts = (tech) => ASSETS_BY_TECH[tech].filter((a) => !excluded.has(a.id)).length;
  const totalHosts = useMemo(
    () => Math.max(1, Math.round(selectedTechs.reduce((n, t) => n + scopedHosts(t), 0) * share)),
    [selectedTechs, share, excluded],
  );
  const minMinutes = STAGE_MINUTES.reduce((a, b) => a + b, 0);
  const maxMinutes = Math.round(minMinutes * (1 + share * 5));
  const needsConfirm = waveMeta?.confirm && mode === 'live';
  const confirmOk    = !needsConfirm || confirmText.trim().toUpperCase() === 'PATCH';
  const checksDone   = checks.every((c) => c === 'ok');
  const isRunning    = status === 'running';

  const blocker =
    !selectedTechs.length ? 'Select at least one technology'
    : selectedTechs.some((t) => scopedHosts(t) === 0) ? 'A selected technology has no servers in scope'
    : !waveMeta           ? 'Select a rollout wave'
    : !mode               ? 'Select a mode'
    : !checksDone         ? 'Waiting for pre-flight checks'
    : !confirmOk          ? 'Type PATCH to confirm a live run'
    : null;

  // Pre-flight re-runs whenever scope changes (or on manual retry)
  useEffect(() => {
    if (status !== 'idle') return undefined;
    if (!selectedTechs.length) {
      setChecks(PREFLIGHT.map(() => 'idle'));
      return undefined;
    }
    setChecks(PREFLIGHT.map(() => 'checking'));
    const timers = PREFLIGHT.map((_, i) =>
      setTimeout(() => setChecks((c) => c.map((v, j) => (j === i ? 'ok' : v))), 350 + i * 300),
    );
    return () => timers.forEach(clearTimeout);
  }, [selectedTechs, selectedWave, checkNonce, status]);

  useEffect(() => () => clearInterval(intervalRef.current), []);
  useEffect(() => { logsEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [logs]);

  const stage = tick < 0 ? 0 : Math.min(Math.floor(tick / TICKS_PER_STAGE) + 1, STAGES.length + 1);
  const hostsDone =
    stage > HOST_STAGE ? totalHosts
    : stage === HOST_STAGE ? Math.round((totalHosts * ((tick % TICKS_PER_STAGE) + 1)) / TICKS_PER_STAGE)
    : 0;

  const appendLog = (msg) => setLogs((p) => [...p, `[${new Date().toLocaleTimeString()}] ${msg}`]);

  const toggleTech = (tech) => {
    const on = selectedTechs.includes(tech.value);
    setSelectedTechs((p) => (on ? p.filter((t) => t !== tech.value) : [...p, tech.value]));
    if (!on) setScopeTech(tech); // show the servers this scope pulls in
  };

  const finish = (aborted, atStage) => {
    clearInterval(intervalRef.current);
    const { techs, wave, dry, ts } = runRef.current;
    const built = techs.map((tech) => {
      const e = buildHistoryEntry({
        id: `#R-${tech}-ONDEMAND-${randomHex()}-${ts.replace(/\D/g, '').slice(0, 14)}`,
        selectedTech: tech, selectedWave: wave, isDryRun: dry, ts,
      });
      if (!aborted) return e;
      return {
        ...e,
        status: 'ABORTED',
        statusColor: 'bg-rose-500/20 text-rose-300 border-rose-500/30',
        stagesDone: atStage,
        stagesArray: STAGES.map((_, i) => (i < atStage ? 1 : 0)),
        passed: 0, warnings: 0,
      };
    });
    setEntries(built);
    setStatus(aborted ? 'aborted' : 'done');
    built.forEach((e) => onSimulationComplete?.(e));
    if (aborted) {
      appendLog(`✗ ABORTED at stage ${atStage + 1}. Snapshot revert issued for ${techs.length} target group(s).`);
    } else {
      const sum = (k) => built.reduce((n, e) => n + e[k], 0);
      appendLog(`★ Run complete. Passed: ${sum('passed')} · Warnings: ${sum('warnings')} · Failed: ${sum('failed')}`);
    }
  };

  const handleStart = () => {
    if (blocker || isRunning) return;
    runRef.current = { techs: selectedTechs, wave: selectedWave, dry: isDryRun, ts: nowIST() };
    setEntries([]);
    setStatus('running');
    setTick(0);
    setLogs([
      ...INIT_LOG,
      `[${new Date().toLocaleTimeString()}] ▶ Triggered on-demand run — ${selectedTechs.join(', ')} · ${selectedWave} · ${totalHosts} hosts · Mode: ${isDryRun ? 'Sandbox testing' : 'Live patch'}`,
      `[${new Date().toLocaleTimeString()}] → ${stageLabel(STAGES[0])}`,
    ]);

    let t = 0;
    intervalRef.current = setInterval(() => {
      t += 1;
      setTick(t);
      if (t % TICKS_PER_STAGE !== 0) return;
      const done = t / TICKS_PER_STAGE;
      appendLog(`✓ ${STAGES[done - 1]}`);
      if (done >= STAGES.length) finish(false, done);
      else appendLog(`→ ${stageLabel(STAGES[done])}`);
    }, TICK_MS);
  };

  const handleAbort = () => finish(true, Math.min(stage, STAGES.length) - 1);

  const handleReset = () => {
    setTick(-1);
    setStatus('idle');
    setEntries([]);
    setConfirmText('');
    setLogs(INIT_LOG);
  };

  const recent = historyRuns.slice(0, 4);
  const locked = status !== 'idle';
  const sum = (k) => entries.reduce((n, e) => n + e[k], 0);

  return (
    <div className="p-6 space-y-5 w-full max-w-[1600px] mx-auto animate-in fade-in">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full ${isRunning ? 'bg-amber-400' : 'bg-cyan-400'} animate-pulse`} />
            <span className="text-xs font-bold text-cyan-400 uppercase tracking-widest font-mono">
              {isRunning ? 'Run in progress' : status === 'idle' ? 'Ready to compose' : 'Run finished'}
            </span>
          </div>
          <h2 className="sr-only">On-Demand Patch Execution</h2>
          <p className="text-xs text-fg3 mt-1">Pick scope, review the blast radius, then launch the 9-stage lifecycle.</p>
        </div>
        <button
          onClick={() => onNavigateTab?.('history')}
          className="px-3.5 py-2 text-xs font-bold text-fg2 border border-ink/10 rounded-xl hover:bg-ink/5 flex items-center gap-1.5"
        >
          <HistoryIcon size={13} /> History
        </button>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-5">
        {/* LEFT: scope (idle) or live pipeline (running/done) */}
        <div className="xl:col-span-8 space-y-5">
          {!locked ? (
            <>
              <Section n={1} title="Technology scope" hint={selectedTechs.length ? `${selectedTechs.length} selected` : 'Required — no implicit "all targets"'}>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2.5">
                  {TECH_OPTIONS.map((t) => {
                    const Icon = t.icon;
                    const on = selectedTechs.includes(t.value);
                    return (
                      <button
                        key={t.value}
                        onClick={() => toggleTech(t)}
                        aria-pressed={on}
                        className={`p-3.5 rounded-xl border text-left transition-all ${
                          on ? `bg-gradient-to-br ${t.color} border-ink/25 text-white shadow-lg`
                             : 'border-ink/[0.07] bg-inset text-fg3 hover:border-ink/20 hover:text-fg'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <Icon size={16} />
                          {on && (
                            <span className="flex items-center gap-1.5">
                              <span
                                role="button"
                                tabIndex={0}
                                aria-label={`View ${t.label} servers`}
                                onClick={(e) => { e.stopPropagation(); setScopeTech(t); }}
                                onKeyDown={(e) => { if (e.key === 'Enter') { e.stopPropagation(); setScopeTech(t); } }}
                                className="p-0.5 rounded hover:bg-white/20"
                              >
                                <Eye size={14} />
                              </span>
                              <CheckCircle2 size={14} />
                            </span>
                          )}
                        </div>
                        <div className="text-sm font-bold mt-2">{t.label}</div>
                        <div className="text-[11px] opacity-80 font-mono">{on ? `${scopedHosts(t.value)} of ${TECH_HOSTS[t.value]}` : TECH_HOSTS[t.value]} hosts</div>
                      </button>
                    );
                  })}
                </div>
              </Section>

              <Section n={2} title="Rollout wave" hint="Later waves carry higher blast radius">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                  {WAVE_OPTIONS.map((w) => {
                    const m = WAVE_META[w];
                    const on = selectedWave === w;
                    const [name, desc] = w.split(' — ');
                    return (
                      <button
                        key={w}
                        onClick={() => setSelectedWave(w)}
                        aria-pressed={on}
                        className={`p-3.5 rounded-xl border text-left transition-all ${
                          on ? 'border-cyan-400/60 bg-cyan-950/30 ring-1 ring-cyan-400/40'
                             : 'border-ink/[0.07] bg-inset hover:border-ink/20'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-xs font-bold text-fg">{name}</span>
                          <span className={`px-1.5 py-0.5 rounded border text-[9px] font-bold font-mono ${TONE[m.tone]}`}>{m.risk}</span>
                        </div>
                        <div className="text-[11px] text-fg3 mt-1">{desc}</div>
                      </button>
                    );
                  })}
                </div>
              </Section>

              <Section n={3} title="Mode">
                <div className="grid grid-cols-2 gap-2.5">
                  {[
                    { id: 'sandbox', title: 'Sandbox testing', desc: 'Runs every gate in an isolated sandbox, applies nothing to live systems.' },
                    { id: 'live', title: 'Live patch', desc: 'Applies patches, with snapshot rollback armed.' },
                  ].map((o) => (
                    <button
                      key={o.title}
                      onClick={() => setMode(o.id)}
                      aria-pressed={mode === o.id}
                      className={`p-3.5 rounded-xl border text-left transition-all ${
                        mode === o.id ? 'border-cyan-400/60 bg-cyan-950/30 ring-1 ring-cyan-400/40'
                                           : 'border-ink/[0.07] bg-inset hover:border-ink/20'
                      }`}
                    >
                      <div className="text-xs font-bold text-fg">{o.title}</div>
                      <div className="text-[11px] text-fg3 mt-1">{o.desc}</div>
                    </button>
                  ))}
                </div>
              </Section>
            </>
          ) : (
            <>
              {status === 'done' && (
                <Banner tone="emerald" icon={<CheckCircle2 size={18} />} title={runRef.current.dry ? 'Sandbox test complete' : 'Patch run complete'}>
                  Passed {sum('passed')} · Warnings {sum('warnings')} · Failed {sum('failed')}
                </Banner>
              )}
              {status === 'aborted' && (
                <Banner tone="rose" icon={<AlertTriangle size={18} />} title="Run aborted — rollback issued">
                  Stopped at stage {Math.max(entries[0]?.stagesDone ?? 0, 0) + 1}. Snapshots were reverted; nothing was left half-patched.
                </Banner>
              )}

              <div className="nexus-card p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-fg2">9-stage pipeline</h3>
                  <span className="text-xs font-mono text-cyan-400">
                    {isRunning ? `Stage ${stage} / ${STAGES.length}` : status === 'done' ? 'COMPLETE' : 'ABORTED'}
                  </span>
                </div>

                <div className="flex gap-1">
                  {STAGES.map((_, i) => {
                    const n = i + 1;
                    const done = status === 'done' || stage > n;
                    const cur = isRunning && stage === n;
                    return (
                      <div key={i} className="flex-1 h-1.5 rounded-full bg-ink/[0.06] overflow-hidden">
                        <div className={`h-full transition-all ${done ? 'w-full bg-emerald-400' : cur ? 'w-1/2 bg-cyan-400 animate-pulse' : 'w-0'}`} />
                      </div>
                    );
                  })}
                </div>

                <ol className="space-y-1.5">
                  {STAGES.map((s, i) => {
                    const n = i + 1;
                    const done = status === 'done' || stage > n;
                    const cur = isRunning && stage === n;
                    return (
                      <li key={n} className={`px-3 py-2 rounded-lg border text-xs flex items-center justify-between transition-all ${
                        done ? 'bg-emerald-950/20 border-emerald-500/25 text-emerald-300'
                        : cur ? 'bg-cyan-950/40 border-cyan-500/50 text-cyan-200 ring-1 ring-cyan-400'
                        : 'bg-inset border-ink/[0.04] text-fg4'
                      }`}>
                        <span className="flex items-center gap-2.5 min-w-0">
                          {done ? <CheckCircle2 size={14} className="text-emerald-400 flex-shrink-0" />
                            : cur ? <Loader2 size={14} className="text-cyan-400 animate-spin flex-shrink-0" />
                            : <span className="w-3.5 text-[10px] text-center flex-shrink-0">{n}</span>}
                          <span className="truncate">{stageLabel(s)}</span>
                        </span>
                        {n === HOST_STAGE && (isRunning || status === 'done') ? (
                          <span className="font-mono text-[10px] flex-shrink-0 ml-2">{hostsDone}/{totalHosts} hosts</span>
                        ) : (
                          <span className="font-mono text-[10px] flex-shrink-0 ml-2">~{STAGE_MINUTES[i]}m</span>
                        )}
                      </li>
                    );
                  })}
                </ol>
              </div>
            </>
          )}

          {/* Console */}
          <div className="nexus-card p-4 space-y-2 bg-black/90 font-mono text-xs">
            <div className="flex items-center justify-between pb-2 border-b border-ink/[0.08] text-fg3 text-[11px]">
              <span className="flex items-center gap-1.5"><Terminal size={13} className="text-cyan-400" /> Execution output</span>
              <span>tty0 · UTF-8</span>
            </div>
            <div className={`${status === 'idle' ? 'h-16' : 'h-44'} overflow-y-auto space-y-1 text-[11px] leading-relaxed pr-1 custom-scrollbar transition-[height] duration-300`}>
              {logs.map((l, i) => <div key={i} className={logColor(l)}>{l}</div>)}
              <div ref={logsEndRef} />
            </div>
          </div>
        </div>

        {/* RIGHT: run plan */}
        <aside className="xl:col-span-4 space-y-5 xl:sticky xl:top-2 xl:self-start">
          <div className="nexus-card p-5 space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-fg2">Run plan</h3>

            <div className="grid grid-cols-3 gap-2">
              <Stat icon={<Server size={13} />} label="Hosts" value={selectedTechs.length ? totalHosts : '—'} />
              <Stat icon={<Clock size={13} />} label="Est. time" value={selectedTechs.length ? `${minMinutes}–${maxMinutes}m` : '—'} />
              <div className={`p-2.5 rounded-xl border text-center ${waveMeta ? TONE[waveMeta.tone] : 'border-ink/[0.07] bg-inset text-fg4'}`}>
                <div className="text-[10px] uppercase opacity-80">Risk</div>
                <div className="text-sm font-extrabold mt-0.5">{waveMeta?.risk ?? '—'}</div>
              </div>
            </div>

            <div className="text-[11px] text-fg3 leading-relaxed">
              <span className="text-fg font-semibold">{mode ? (isDryRun ? 'Sandbox testing' : 'Live') : 'No mode'}</span> ·{' '}
              {selectedTechs.length ? selectedTechs.join(', ') : 'no technology selected'} · {selectedWave?.split(' — ')[0] ?? 'no wave'}
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-fg3">Pre-flight</span>
                {!locked && (
                  <button onClick={() => setCheckNonce((n) => n + 1)} className="text-[11px] text-cyan-400 hover:text-cyan-300 flex items-center gap-1">
                    <RefreshCw size={11} /> Re-check
                  </button>
                )}
              </div>
              {PREFLIGHT.map((c, i) => (
                <div key={c} className="flex items-center gap-2 text-xs text-fg2">
                  {checks[i] === 'ok' || locked
                    ? <CheckCircle2 size={13} className="text-emerald-400" />
                    : checks[i] === 'idle'
                    ? <span className="w-[13px] h-[13px] rounded-full border border-ink/20" />
                    : <Loader2 size={13} className="text-fg4 animate-spin" />}
                  {c}
                </div>
              ))}
            </div>

            {needsConfirm && !locked && (
              <div className="space-y-1.5 p-3 rounded-xl border border-rose-500/30 bg-rose-950/20">
                <label htmlFor="confirm" className="text-[11px] text-rose-300 font-semibold flex items-center gap-1.5">
                  <AlertTriangle size={13} /> {waveMeta.risk} wave, live run. Type PATCH to confirm.
                </label>
                <input
                  id="confirm"
                  value={confirmText}
                  onChange={(e) => setConfirmText(e.target.value)}
                  className="w-full bg-inset border border-ink/10 rounded-lg px-3 py-2 text-xs text-fg font-mono focus:outline-none focus:border-rose-400"
                />
              </div>
            )}

            <div className="flex items-start gap-2 p-3 rounded-xl bg-cyan-950/20 border border-cyan-500/20 text-[11px] text-fg3">
              <ShieldCheck size={14} className="text-cyan-400 flex-shrink-0 mt-0.5" />
              Rollback armed — post-check degradation triggers a snapshot revert within 90s.
            </div>

            {status === 'idle' && (
              <div className="space-y-1.5">
                <button
                  onClick={handleStart}
                  disabled={!!blocker}
                  className="w-full py-3 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-onbright font-extrabold text-xs rounded-xl shadow-lg shadow-cyan-500/25 flex items-center justify-center gap-2 transition-all active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none"
                >
                  <Play size={15} /> {isDryRun ? 'Start sandbox test' : 'Launch patch run'}
                </button>
                {blocker && <p className="text-[11px] text-amber-300 text-center">{blocker}</p>}
              </div>
            )}
            {isRunning && (
              <button onClick={handleAbort} className="w-full py-3 border border-rose-500/50 text-rose-300 hover:bg-rose-950/40 font-bold text-xs rounded-xl flex items-center justify-center gap-2">
                <Square size={13} /> Abort &amp; roll back
              </button>
            )}
            {(status === 'done' || status === 'aborted') && (
              <div className="grid grid-cols-2 gap-2">
                <button onClick={handleReset} className="py-2.5 bg-ink/10 hover:bg-ink/20 text-fg font-bold text-xs rounded-xl flex items-center justify-center gap-1.5">
                  <RefreshCw size={13} /> New run
                </button>
                <button onClick={() => onNavigateTab?.('history')} className="py-2.5 border border-cyan-500/40 text-cyan-400 hover:bg-cyan-950/40 font-bold text-xs rounded-xl flex items-center justify-center gap-1">
                  History <ChevronRight size={13} />
                </button>
              </div>
            )}
          </div>

          {recent.length > 0 && (
            <div className="nexus-card p-5 space-y-2.5">
              <h3 className="text-xs font-bold uppercase tracking-wider text-fg2">Recent runs</h3>
              {recent.map((r) => (
                <div key={r.id} className="flex items-center justify-between gap-2 text-xs">
                  <span className="font-mono text-fg2 truncate">{r.technology} · {r.week}</span>
                  <span className={`px-1.5 py-0.5 rounded border text-[9px] font-bold flex-shrink-0 ${r.statusColor}`}>{r.status.replace(/_/g, ' ')}</span>
                </div>
              ))}
            </div>
          )}
        </aside>
      </div>

      {scopeTech && (
        <TechScopeModal
          tech={scopeTech}
          excluded={excluded}
          onToggle={(id) => setExcluded((prev) => { const next = new Set(prev); next.has(id) ? next.delete(id) : next.add(id); return next; })}
          onSetMany={(ids, include) => setExcluded((prev) => { const next = new Set(prev); ids.forEach((id) => (include ? next.delete(id) : next.add(id))); return next; })}
          onClose={() => setScopeTech(null)}
          onRemove={() => {
            setSelectedTechs((p) => p.filter((t) => t !== scopeTech.value));
            setScopeTech(null);
          }}
        />
      )}
    </div>
  );
}

function Section({ n, title, hint, children }) {
  return (
    <div className="nexus-card p-5 space-y-3.5">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-bold uppercase tracking-wider text-fg2 flex items-center gap-2">
          <span className="w-5 h-5 rounded-full bg-cyan-500/15 text-cyan-300 text-[10px] flex items-center justify-center">{n}</span>
          {title}
        </h3>
        {hint && <span className="text-[11px] text-fg4">{hint}</span>}
      </div>
      {children}
    </div>
  );
}

function Stat({ icon, label, value }) {
  return (
    <div className="p-2.5 rounded-xl border border-ink/[0.07] bg-inset text-center">
      <div className="text-[10px] uppercase text-fg4 flex items-center justify-center gap-1">{icon}{label}</div>
      <div className="text-sm font-extrabold text-fg mt-0.5 font-mono">{value}</div>
    </div>
  );
}

function Banner({ tone, icon, title, children }) {
  return (
    <div className={`nexus-card p-4 flex items-center gap-3 border ${TONE[tone]}`}>
      <span className="flex-shrink-0">{icon}</span>
      <div>
        <div className="text-sm font-bold text-fg">{title}</div>
        <div className="text-[11px] font-mono opacity-80">{children}</div>
      </div>
    </div>
  );
}
