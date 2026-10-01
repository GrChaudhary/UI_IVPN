import React, { useState, useEffect, useRef } from 'react';
import {
  Plug, X, Check, Lock, SkipForward, Play, FileText, Plus, ArrowLeft, ArrowRight,
  Loader2, Info, CheckCircle2, AlertTriangle,
} from 'lucide-react';
import Select from './ui/Select';
import {
  DOMAINS, DOMAIN_COLOR, SANDBOX_SERVERS, CMDB_SOURCES, CMDB_INSTANCES,
  CVE_SOURCES, PATCH_SOURCES, BACKUP_PLATFORMS,
} from '../data/connectorData';

// ─── Step definitions: label, validate-button text, validation rule ──────────
const STEPS = [
  { label: 'Technology Selection', action: 'Validate & Continue', skippable: false,
    check: (d) => (!d.domain ? 'Choose a technology domain.' : !d.tech ? 'Choose a technology.' : !d.server ? 'Choose a development sandbox server.' : null) },
  { label: 'Asset Discovery', action: 'Validate', check: (d) => (d.cmdbInstance ? null : 'Select a CMDB instance.') },
  { label: 'CVE / Patch Verification', action: 'Verify Connectivity', check: (d) => (d.cveSource ? null : 'Select a CVE source.') },
  { label: 'Patch Sources', action: 'Verify Reachability', check: (d) => (d.patchSource ? null : 'Select a patch source.') },
  { label: 'Pre-Check', action: 'Validate' },
  { label: 'Backup', action: 'Verify Backup Config',
    check: (d) => (d.backupMode === 'api' && !d.backupPlatform ? 'Select a backup platform.' : null) },
  { label: 'Change Request', action: 'Validate', auto: true },
  { label: 'Patch Execution', action: 'Validate (Dry Run)',
    check: (d) => (d.execMode === 'api' && !/^https?:\/\/\S+/.test(d.execEndpoint) ? 'Enter a valid http(s) endpoint.'
      : !d.dryRun && !d.targetConfirmed ? 'Confirm the target list before a live run.' : null) },
  { label: 'Post-Check', action: 'Validate' },
  { label: 'Reporting', action: 'Validate', check: (d) => (d.pdf || d.xlsx ? null : 'Pick at least one report format.') },
  { label: 'Summary', summary: true },
];
const LAST = STEPS.length - 1;

const INITIAL = {
  domain: '', tech: '', server: SANDBOX_SERVERS[0],
  cmdbSource: CMDB_SOURCES[0], cmdbInstance: CMDB_INSTANCES[0],
  cveSource: '', patchSource: '', precheckMode: 'api',
  backupMode: 'api', backupPlatform: '', scopeDb: false, scopeApp: false, retention: '30', backupType: 'FULL',
  execMode: 'api', execEndpoint: 'http://orchestrator:8000/health', dryRun: true, targetConfirmed: false,
  postMode: 'api', reportMode: 'api', pdf: true, xlsx: false, distro: '',
};

const newSession = () =>
  `T-ORG-PCDK-ONBOARD-${Math.random().toString(36).slice(2, 8)}-${new Date().toISOString().replace(/\D/g, '').slice(0, 15)}`;

export default function ConnectorWizard({ preset, onClose, onActivate }) {
  const [data, setData] = useState(() => ({ ...INITIAL, ...(preset || {}) }));
  const [status, setStatus] = useState(() => STEPS.map(() => 'pending')); // pending | done | skipped
  const [step, setStep] = useState(0);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);
  const [session] = useState(newSession);
  const dialogRef = useRef(null);

  const set = (patch) => { setData((d) => ({ ...d, ...patch })); setError(null); setStatus((s) => s.map((v, i) => (i === step && v === 'done' ? 'pending' : v))); };
  const cur = STEPS[step];
  const furthest = status.findIndex((s) => s === 'pending');           // first step not yet handled
  const reach = furthest === -1 ? LAST : furthest;                       // can navigate up to here
  const done = status.filter((s) => s === 'done').length;
  const skipped = status.filter((s) => s === 'skipped').length;
  const coreComplete = status.slice(0, LAST).every((s) => s !== 'pending');

  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    dialogRef.current?.focus();
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  // Steps managed centrally validate themselves on entry
  useEffect(() => {
    if (cur.auto) setStatus((s) => s.map((v, i) => (i === step && v === 'pending' ? 'done' : v)));
  }, [step, cur.auto]);

  const mark = (i, v) => setStatus((s) => s.map((x, j) => (j === i ? v : x)));
  const go = (i) => { setStep(i); setError(null); };

  const validate = () => {
    const problem = cur.check?.(data);
    if (problem) { setError(problem); return; }
    setBusy(true);
    setTimeout(() => { setBusy(false); mark(step, 'done'); }, 700);
  };
  const skip = () => { mark(step, 'skipped'); go(step + 1); };

  const activate = () => {
    onActivate({ ...data, session });
  };

  const ready = status[step] === 'done';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div
        ref={dialogRef}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-label="PCDK Onboarding Sandbox"
        className="w-full max-w-5xl max-h-[92vh] flex flex-col rounded-2xl bg-surface border border-ink/10 shadow-2xl outline-none"
      >
        {/* Header */}
        <div className="flex items-center justify-between gap-4 px-6 py-4 border-b border-ink/[0.08] bg-raised rounded-t-2xl">
          <div className="flex items-center gap-3 min-w-0">
            <Plug size={16} className="text-teal-400 flex-shrink-0" />
            <div className="min-w-0">
              <h2 className="text-lg font-bold text-fg leading-tight">PCDK Onboarding Sandbox</h2>
              <p className="text-[10px] font-mono text-fg3 truncate">{session}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 text-[11px] flex-shrink-0">
            {data.tech && <span className="text-teal-300">{data.domain} / {data.tech}</span>}
            <span className="text-fg3">Draft saved</span>
            <button
              onClick={() => { setData({ ...INITIAL, ...(preset || {}) }); setStatus(STEPS.map(() => 'pending')); go(0); }}
              className="px-2.5 py-1 rounded-lg border border-ink/15 text-fg2 font-semibold hover:bg-ink/5"
            >Reset Draft</button>
            <button onClick={onClose} aria-label="Close" className="p-1 text-fg3 hover:text-fg"><X size={16} /></button>
          </div>
        </div>

        <div className="overflow-y-auto custom-scrollbar px-6 py-5 space-y-6">
          {/* Stepper */}
          <ol className="flex items-start overflow-x-auto pb-1">
            {STEPS.map((s, i) => {
              const st = status[i];
              const isCur = i === step;
              const locked = i > reach;
              return (
                <li key={s.label} className="flex items-start flex-1 min-w-[76px]">
                  <button
                    disabled={locked}
                    onClick={() => go(i)}
                    aria-current={isCur ? 'step' : undefined}
                    className="flex flex-col items-center gap-1.5 w-full disabled:cursor-not-allowed"
                  >
                    <span className={`w-5 h-5 rounded-full flex items-center justify-center ${
                      isCur ? 'bg-indigo-500 ring-4 ring-indigo-500/25'
                      : st === 'done' ? 'text-emerald-400' : st === 'skipped' ? 'text-amber-400' : 'text-slate-600'}`}>
                      {isCur ? null : st === 'done' ? <CheckCircle2 size={16} /> : st === 'skipped' ? <SkipForward size={14} /> : <Lock size={13} />}
                    </span>
                    <span className={`text-[10px] leading-tight text-center font-semibold ${
                      isCur ? 'text-indigo-300' : st === 'done' ? 'text-emerald-400' : st === 'skipped' ? 'text-amber-400' : 'text-fg4'}`}>
                      {s.label}
                    </span>
                  </button>
                  {i < LAST && <span className={`h-0.5 w-6 mt-2.5 flex-shrink-0 rounded ${st !== 'pending' ? 'bg-emerald-500/60' : 'bg-ink/10'}`} />}
                </li>
              );
            })}
          </ol>

          {/* Step body */}
          {cur.summary ? (
            <Summary data={data} status={status} done={done} skipped={skipped} session={session} onEdit={go} />
          ) : (
            <StepBody step={step} data={data} set={set} />
          )}

          {error && (
            <div role="alert" className="flex items-center gap-2 px-3 py-2 rounded-lg bg-amber-500/10 border border-amber-500/30 text-xs text-amber-200">
              <AlertTriangle size={14} /> {error}
            </div>
          )}

          {/* Footer actions */}
          <div className="pt-4 border-t border-ink/[0.08] flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              {step > 0 && <GhostBtn onClick={() => go(step - 1)}><ArrowLeft size={13} /> Back</GhostBtn>}
              {!cur.summary && !cur.auto && (
                <button
                  onClick={validate}
                  disabled={busy || ready}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-indigo-500/80 hover:bg-indigo-500 text-fg text-xs font-bold disabled:opacity-60"
                >
                  {busy ? <Loader2 size={13} className="animate-spin" /> : <CheckCircle2 size={13} />}
                  {ready ? 'Validated' : cur.action}
                </button>
              )}
              {cur.auto && <span className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-indigo-500/60 text-fg text-xs font-bold"><CheckCircle2 size={13} /> Validated</span>}
              {!cur.summary && cur.skippable !== false && !ready && (
                <GhostBtn onClick={skip}><SkipForward size={13} /> Skip</GhostBtn>
              )}
            </div>

            {cur.summary ? (
              <button
                onClick={activate}
                disabled={!coreComplete}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-onbright text-xs font-bold disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <Plug size={14} /> Activate Connector
              </button>
            ) : (
              <div className="flex items-center gap-3">
                {(ready || status[step] === 'skipped') && <span className="flex items-center gap-1 text-xs text-emerald-400"><Check size={13} /> Ready</span>}
                <button
                  onClick={() => go(step + 1)}
                  disabled={status[step] === 'pending'}
                  className="flex items-center gap-1.5 px-5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Next <ArrowRight size={13} />
                </button>
              </div>
            )}
          </div>

          {!cur.summary && coreComplete && (
            <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 rounded-xl bg-emerald-500/10 border border-emerald-500/25">
              <span className="flex items-center gap-2 text-xs text-emerald-300"><CheckCircle2 size={14} /> Core steps complete. Open Summary to validate all and activate.</span>
              <button onClick={() => go(LAST)} className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold"><CheckCircle2 size={13} /> Go to Summary</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── UI atoms ────────────────────────────────────────────────────────────────
const GhostBtn = ({ children, ...p }) => (
  <button {...p} className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-ink/12 bg-ink/[0.03] hover:bg-ink/[0.07] text-xs font-semibold text-fg2">{children}</button>
);

const Title = ({ children, hint }) => (
  <div className="space-y-1">
    <h3 className="text-sm font-bold text-fg">{children}</h3>
    {hint && <p className="text-[11px] text-fg3">{hint}</p>}
  </div>
);

function Card({ on, onClick, icon, title, sub, dot }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={on}
      className={`flex items-center gap-2.5 px-4 py-3 rounded-xl border text-left transition-all ${
        on ? 'border-teal-400/70 bg-teal-500/10 ring-1 ring-teal-400/30' : 'border-ink/[0.08] bg-inset hover:border-ink/25'
      }`}
    >
      {dot ? <span className={`w-4 h-4 rounded ${dot}`} /> : icon}
      <span>
        <span className="block text-xs font-bold text-fg">{title}</span>
        {sub && <span className="block text-[10px] text-fg3 mt-0.5">{sub}</span>}
      </span>
      {on && <CheckCircle2 size={14} className="ml-auto text-teal-400" />}
    </button>
  );
}

/** Row of choice cards plus an "Add New" chip that lets the user type a custom option. */
function Choices({ options, value, onPick, dotFor, icon }) {
  const [adding, setAdding] = useState(false);
  const [text, setText] = useState('');
  const [extra, setExtra] = useState([]);
  const all = [...options, ...extra];
  const add = () => {
    const v = text.trim();
    if (v && !all.includes(v)) { setExtra((e) => [...e, v]); onPick(v); }
    setText(''); setAdding(false);
  };
  return (
    <div className="flex flex-wrap gap-2.5">
      {all.map((o) => <Card key={o} on={value === o} onClick={() => onPick(o)} title={o} dot={dotFor?.(o)} icon={icon} />)}
      {adding ? (
        <span className="flex items-center gap-1.5">
          <input
            autoFocus value={text} onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') add(); if (e.key === 'Escape') setAdding(false); }}
            placeholder="Name…" aria-label="New option name"
            className="w-36 bg-inset border border-teal-400/50 rounded-lg px-3 py-2 text-xs text-fg focus:outline-none"
          />
          <button onClick={add} className="px-3 py-2 rounded-lg bg-teal-500 text-onbright text-xs font-bold">Add</button>
        </span>
      ) : (
        <button type="button" onClick={() => setAdding(true)} className="flex items-center gap-1.5 px-5 py-3 rounded-xl border border-dashed border-ink/20 text-xs font-semibold text-teal-300 hover:border-teal-400/60">
          <Plus size={13} /> Add New
        </button>
      )}
    </div>
  );
}

const ModePair = ({ value, onPick, a, b }) => (
  <div className="flex flex-wrap gap-2.5">
    <Card on={value === 'api'} onClick={() => onPick('api')} icon={<Play size={13} className="text-fg2" />} title={a[0]} sub={a[1]} />
    <Card on={value === 'script'} onClick={() => onPick('script')} icon={<FileText size={13} className="text-fg2" />} title={b[0]} sub={b[1]} />
  </div>
);

const Check2 = ({ checked, onChange, children }) => (
  <label className="flex items-center gap-2 text-xs text-fg2 cursor-pointer">
    <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="accent-indigo-500 w-3.5 h-3.5" />
    {children}
  </label>
);

const Notice = ({ children }) => (
  <div className="flex items-center gap-2.5 px-4 py-2.5 rounded-lg bg-sky-500/10 border border-sky-500/25 text-xs text-sky-100">
    <Info size={14} className="text-sky-300 flex-shrink-0" /> {children}
  </div>
);

const fieldCls = 'w-full bg-inset border border-ink/[0.1] rounded-lg px-3.5 py-2.5 text-xs text-fg placeholder-fg4 focus:outline-none focus:border-teal-400';

// ─── Step bodies ─────────────────────────────────────────────────────────────
function StepBody({ step, data, set }) {
  switch (step) {
    case 0:
      return (
        <div className="space-y-5">
          <div className="space-y-2.5">
            <Title>Select Technology Domain</Title>
            <div className="flex flex-wrap gap-2.5">
              {Object.keys(DOMAINS).map((d) => (
                <Card key={d} on={data.domain === d} onClick={() => set({ domain: d, tech: '' })} title={d} dot={DOMAIN_COLOR[d]} />
              ))}
            </div>
          </div>
          {data.domain && (
            <div className="space-y-2.5">
              <Title>Select Technology</Title>
              <Choices options={DOMAINS[data.domain]} value={data.tech} onPick={(tech) => set({ tech })} dotFor={() => 'bg-rose-500'} />
            </div>
          )}
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-fg2" htmlFor="sandbox">Development sandbox server <span className="text-red-400">*</span></label>
            <Select id="sandbox" size="md" value={data.server} onValueChange={(server) => set({ server })} options={SANDBOX_SERVERS} className="w-full max-w-2xl font-normal" />
            <p className="text-[10px] text-fg4">This single CMDB development host is reused for every script test in the wizard.</p>
          </div>
        </div>
      );
    case 1:
      return (
        <div className="space-y-4">
          <Title>Select Asset / CMDB Source</Title>
          <Choices options={CMDB_SOURCES} value={data.cmdbSource} onPick={(cmdbSource) => set({ cmdbSource })} icon={<span className="w-4 h-4 rounded bg-emerald-600/70" />} />
          <div className="p-4 rounded-xl border border-ink/[0.08] bg-inset space-y-3">
            <div className="text-xs font-bold text-fg">{data.cmdbSource || 'CMDB'} Instance</div>
            <Select size="md" value={data.cmdbInstance} onValueChange={(cmdbInstance) => set({ cmdbInstance })} options={CMDB_INSTANCES} placeholder="Select instance…" aria-label="CMDB instance" className="w-full max-w-xl font-normal" />
            {data.cmdbInstance && (
              <div className="p-3 rounded-lg bg-emerald-500/[0.07] border border-emerald-500/25 text-[11px] space-y-1">
                <div className="flex items-center gap-1.5 text-emerald-300 font-semibold"><CheckCircle2 size={13} /> Instance reachable</div>
                <div className="font-mono text-fg3">URL: https://blecoe.service-now.com · Type: API · Registry ID: #5</div>
                <div className="text-fg4">Credentials are stored securely in the tools registry. No manual entry required.</div>
              </div>
            )}
          </div>
        </div>
      );
    case 2:
      return (
        <div className="space-y-3">
          <Title hint="Connectivity check only. No scans, no data pulled.">CVE / Patch Source Verification</Title>
          <Choices options={CVE_SOURCES} value={data.cveSource} onPick={(cveSource) => set({ cveSource })} icon={<FileText size={13} className="text-sky-300" />} />
        </div>
      );
    case 3:
      return (
        <div className="space-y-3">
          <Title>Configure Patch Source</Title>
          <div className="flex flex-wrap gap-2.5">
            {PATCH_SOURCES.map((p) => <Card key={p} on={data.patchSource === p} onClick={() => set({ patchSource: p })} icon={<FileText size={13} className="text-fg2" />} title={p} />)}
          </div>
        </div>
      );
    case 4:
      return (
        <div className="space-y-3">
          <Title hint="API mode uses centrally configured MCP pre-checks. Script mode requires an uploaded automation file.">Pre-Check Configuration</Title>
          <ModePair value={data.precheckMode} onPick={(precheckMode) => set({ precheckMode })} a={['API Call', 'Trigger pre-checks via MCP tool']} b={['Script Upload', 'Upload .yaml / .py / .ps1 pre-check']} />
        </div>
      );
    case 5:
      return (
        <div className="space-y-4">
          <Notice>This is a centrally managed service — agents are already configured to perform these actions.</Notice>
          <Title hint="Configure backup platform and scope-level validation before patching.">Backup</Title>
          <ModePair value={data.backupMode} onPick={(backupMode) => set({ backupMode })} a={['API / Managed Backup', 'Use platform profile + scope configuration']} b={['Upload Backup Script', 'Single script for backup phase']} />
          {data.backupMode === 'api' && (
            <>
              <Choices options={BACKUP_PLATFORMS} value={data.backupPlatform} onPick={(backupPlatform) => set({ backupPlatform })} icon={<span className="w-3.5 h-3.5 rounded bg-sky-500/70" />} />
              <div className="flex gap-5">
                <Check2 checked={data.scopeDb} onChange={(scopeDb) => set({ scopeDb })}>Database-level</Check2>
                <Check2 checked={data.scopeApp} onChange={(scopeApp) => set({ scopeApp })}>Application-level</Check2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 rounded-xl border border-ink/[0.08] bg-inset">
                <label className="space-y-1.5 text-[10px] text-fg3">Retention Period (days)
                  <input type="number" min="1" value={data.retention} onChange={(e) => set({ retention: e.target.value })} className={fieldCls} />
                </label>
                <label className="space-y-1.5 text-[10px] text-fg3">Backup Type
                  <Select size="md" value={data.backupType} onValueChange={(backupType) => set({ backupType })} options={['FULL', 'INCREMENTAL', 'DIFFERENTIAL']} className="w-full font-normal" />
                </label>
              </div>
            </>
          )}
        </div>
      );
    case 6:
      return (
        <div className="space-y-4">
          <Notice>Change Request and Maintenance Window are managed centrally. When you activate the connector, the On-Demand flow will bind to the centrally approved CR/MW path automatically.</Notice>
          <Title>Change Request &amp; Maintenance Window</Title>
          <div className="p-4 rounded-xl border border-ink/[0.08] bg-inset space-y-1.5">
            <div className="text-xs font-bold text-fg">Managed Centrally</div>
            <div className="text-[11px] text-fg3">CR/MW agents handle the approval and schedule binding. No user input is required here.</div>
            <div className="text-[10px] font-mono text-fg4">On-Demand execution will inherit the central CR/MW workflow automatically.</div>
          </div>
        </div>
      );
    case 7:
      return (
        <div className="space-y-4">
          <Title hint="Configure patch application method and trigger execution.">Patch Execution</Title>
          <ModePair value={data.execMode} onPick={(execMode) => set({ execMode })} a={['API / MCP Execution', 'Via connector apply_patches tool']} b={['Custom Playbook', 'Upload execution playbook']} />
          {data.execMode === 'api' && (
            <div className="space-y-1.5 max-w-xl">
              <label htmlFor="endpoint" className="text-[10px] text-fg3">Execution API Endpoint</label>
              <input id="endpoint" value={data.execEndpoint} onChange={(e) => set({ execEndpoint: e.target.value })} className={fieldCls} />
              <p className="text-[10px] text-fg4">Ansible Tower/AWX job template URL, or MCP tool endpoint for direct execution.</p>
            </div>
          )}
          <div className="space-y-2">
            <Check2 checked={data.dryRun} onChange={(dryRun) => set({ dryRun })}>Dry Run <span className="text-fg3">(default: ON) — simulate without applying</span></Check2>
            <Check2 checked={data.targetConfirmed} onChange={(targetConfirmed) => set({ targetConfirmed })}>Target List Confirmed</Check2>
          </div>
        </div>
      );
    case 8:
      return (
        <div className="space-y-3">
          <Title hint="Run post-patch checks and diff against the Step 5 pre-check baseline.">Post-Check Validation</Title>
          <ModePair value={data.postMode} onPick={(postMode) => set({ postMode })} a={['API Post-Check', 'Via verify_health MCP tool']} b={['Script Upload', 'Custom post-check script']} />
        </div>
      );
    default:
      return (
        <div className="space-y-4">
          <Title hint="Generate the final report artifact and optionally distribute it.">Reporting &amp; Distribution</Title>
          <ModePair value={data.reportMode} onPick={(reportMode) => set({ reportMode })} a={['API Report Generation', 'Generate via reporting service']} b={['YAML Report Script', 'Upload report generation script']} />
          <div className="flex gap-5">
            <Check2 checked={data.pdf} onChange={(pdf) => set({ pdf })}>PDF</Check2>
            <Check2 checked={data.xlsx} onChange={(xlsx) => set({ xlsx })}>XLSX</Check2>
          </div>
          <input value={data.distro} onChange={(e) => set({ distro: e.target.value })} placeholder="Distribution list (e.g. patchops@corp.com, sre@corp.com)" aria-label="Distribution list" className={`${fieldCls} max-w-xl`} />
        </div>
      );
  }
}

// ─── Summary ─────────────────────────────────────────────────────────────────
function Summary({ data, status, done, skipped, session, onEdit }) {
  const nz = (v) => v || 'Not selected';
  const mode = (m, a) => (m === 'api' ? a : 'Script');
  const cols = [
    ['Connector inputs', [
      ['Asset / CMDB', data.cmdbSource ? data.cmdbSource.replace(' CMDB', '').toLowerCase() : 'Not selected'],
      ['CVE / Patch', nz(data.cveSource)], ['Patch Repo', nz(data.patchSource)],
      ['Execution Mode', mode(data.execMode, 'API / MCP')],
    ]],
    ['Sandbox verification', [
      ['Development Server', data.server.split(' · ')[0]], ['Default Mode', data.dryRun ? 'Dry run; live execution requires confirmation' : 'Live execution'],
    ]],
    ['Backup profile', [
      ['Platform', nz(data.backupMode === 'api' ? data.backupPlatform : 'Custom script')], ['Retention', `${data.retention} days`], ['Type', data.backupType],
      ['Scope', [data.scopeDb && 'Database', data.scopeApp && 'Application'].filter(Boolean).join(', ') || 'Not selected'],
    ]],
    ['Execution & reporting', [
      ['Pre-Check', mode(data.precheckMode, 'API Call')], ['Post-Check', mode(data.postMode, 'API Call')],
      ['Reporting', [data.pdf && 'PDF', data.xlsx && 'XLSX'].filter(Boolean).join(' / ') || 'None'], ['Distribution', data.distro || 'Not set'],
    ]],
  ];
  const chip = 'px-2.5 py-0.5 rounded-full border text-[10px] font-mono';
  const flow = STEPS.slice(0, LAST).map((s) => s.label).join(' → ');
  return (
    <div className="space-y-4">
      <div className="p-4 rounded-xl bg-emerald-500/[0.06] border border-emerald-500/25 space-y-2">
        <h3 className="text-sm font-bold text-fg">Patch Cycle Configuration Summary</h3>
        <p className="text-[11px] text-fg2">The selected and validated phases will be handed off to On-Demand execution as the PCDK operating flow.</p>
        <div className="flex flex-wrap gap-2">
          <span className={`${chip} text-emerald-300 border-emerald-500/40 bg-emerald-500/10`}>Validated: {done}</span>
          <span className={`${chip} text-amber-300 border-amber-500/40 bg-amber-500/10`}>Skipped: {skipped}</span>
          <span className={`${chip} text-red-300 border-red-500/40 bg-red-500/10`}>Errors: 0</span>
          <span className={`${chip} text-sky-300 border-sky-500/40 bg-sky-500/10 break-all`}>Session: {session}</span>
        </div>
      </div>

      <div className="p-3 rounded-xl border border-ink/[0.08] bg-inset text-[11px]">
        <div className="text-[9px] font-bold uppercase tracking-wider text-fg3 mb-1">Wiring overview</div>
        <span className="text-fg2">{flow} → On-Demand execution</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3">
        {cols.map(([title, rows]) => (
          <div key={title} className="p-3.5 rounded-xl border border-ink/[0.08] bg-inset space-y-2">
            <div className="text-[9px] font-bold uppercase tracking-wider text-fg3">{title}</div>
            {rows.map(([k, v]) => (
              <div key={k}><div className="text-[10px] font-bold text-fg2">{k}</div><div className="text-[10px] text-fg3 break-words">{v}</div></div>
            ))}
          </div>
        ))}
      </div>

      <ul className="space-y-2">
        {STEPS.slice(0, LAST).map((s, i) => (
          <li key={s.label} className="flex items-center justify-between gap-3 px-4 py-2.5 rounded-xl border border-ink/[0.08] bg-inset">
            <div className="flex items-center gap-3 min-w-0">
              <span className="w-5 h-5 rounded-md bg-ink/[0.06] text-[10px] font-bold text-fg2 flex items-center justify-center flex-shrink-0">{i + 1}</span>
              <span className="text-xs font-bold text-fg truncate">{s.label}</span>
              <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded border ${status[i] === 'done' ? 'text-emerald-300 border-emerald-500/40' : status[i] === 'skipped' ? 'text-amber-300 border-amber-500/40' : 'text-fg3 border-ink/15'}`}>
                {status[i] === 'done' ? 'DONE' : status[i] === 'skipped' ? 'SKIPPED' : 'PENDING'}
              </span>
            </div>
            <button onClick={() => onEdit(i)} className="text-[11px] font-semibold text-teal-300 hover:underline">Edit</button>
          </li>
        ))}
      </ul>
    </div>
  );
}
