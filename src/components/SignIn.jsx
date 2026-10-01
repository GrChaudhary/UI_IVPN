import React, { useEffect, useState } from 'react';
import { Line, Radar } from 'react-chartjs-2';
import {
  Chart as ChartJS, CategoryScale, LinearScale, RadialLinearScale, PointElement, LineElement, Filler, Tooltip,
} from 'chart.js';
import {
  Lock, UserPlus, Eye, EyeOff, ShieldCheck, Building2, GitBranch, Cpu, Shield, Sparkles, ChevronDown, AlertCircle, CheckCircle2,
} from 'lucide-react';
import BrandMark from './BrandMark';
import BootSequence from './BootSequence';
import Select from './ui/Select';
import { ORGS, ROLES } from '../data/accessData';
import { STAGES, TECH_OPTIONS, TECH_HOSTS } from '../simulation/simulationEngine';
import { EXEC_ACTIVITY_DATA } from '../simulation/simulationData';

ChartJS.register(CategoryScale, LinearScale, RadialLinearScale, PointElement, LineElement, Filler, Tooltip);

const CAPABILITY_AREAS = ['Patch orchestration', 'Vulnerability & compliance', 'Agentic AI & integrations'];
const STATS = [
  { icon: Building2, value: ORGS.length,             label: 'Organizations',     tone: 'text-emerald-300' },
  { icon: GitBranch, value: STAGES.length,           label: 'Pipeline stages',   tone: 'text-indigo-300' },
  { icon: Cpu,       value: TECH_OPTIONS.length,     label: 'Tech platforms',    tone: 'text-sky-300' },
  { icon: Shield,    value: Object.keys(ROLES).length, label: 'Role tiers',      tone: 'text-amber-300' },
  { icon: Sparkles,  value: CAPABILITY_AREAS.length, label: 'Capability areas',  tone: 'text-fuchsia-300' },
];

const TICK = '#64748b';
const GRID = 'rgba(148,163,184,0.12)';
const RADAR_DATA = {
  labels: TECH_OPTIONS.map((t) => t.label),
  datasets: [{
    label: 'Managed hosts',
    data: TECH_OPTIONS.map((t) => TECH_HOSTS[t.value]),
    backgroundColor: 'rgba(99,102,241,0.25)',
    borderColor: '#818cf8',
    pointBackgroundColor: '#a5b4fc',
    borderWidth: 1.5,
  }],
};
const RADAR_OPTIONS = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: { legend: { display: false } },
  scales: { r: { angleLines: { color: GRID }, grid: { color: GRID }, ticks: { display: false }, pointLabels: { color: TICK, font: { size: 10 } } } },
};
const AREA_COLORS = ['59,130,246', '99,102,241', '168,85,247'];
const AREA_DATA = {
  labels: EXEC_ACTIVITY_DATA.labels,
  datasets: EXEC_ACTIVITY_DATA.datasets.map((d, i) => ({
    label: d.label,
    data: d.data,
    fill: true,
    tension: 0.4,
    pointRadius: 0,
    borderWidth: 1.5,
    borderColor: `rgb(${AREA_COLORS[i]})`,
    backgroundColor: `rgba(${AREA_COLORS[i]},0.35)`,
  })),
};
const AREA_OPTIONS = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: { legend: { display: false } },
  scales: {
    x: { grid: { display: false }, ticks: { color: TICK, font: { size: 10 } } },
    y: { stacked: true, grid: { color: GRID }, ticks: { color: TICK, font: { size: 10 } } },
  },
};

const FIELD = 'w-full bg-inset border border-ink/[0.1] rounded-lg px-4 py-3 text-sm text-fg placeholder-fg4 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/40 transition-colors';
const LABEL = 'block text-xs font-bold uppercase tracking-wider text-fg2 mb-2';

// Decorative network backdrop for the marketing panel, kept to the edges so it never sits behind text: [x%, y%, colour]
const SLIDE_MS = 750;
const prefersReducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const NODES = [[2, 46, '#14b8a6'], [97, 9, '#ec4899'], [98, 58, '#6366f1'], [96, 90, '#14b8a6'], [3, 90, '#14b8a6'], [52, 99, '#6366f1']];

export default function SignIn({ users, onSignIn }) {
  const [mode, setMode] = useState('signin'); // signin | register
  const [orgId, setOrgId] = useState('');
  const [username, setUsername] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [registered, setRegistered] = useState(false);
  const [phase, setPhase] = useState('form'); // form -> sliding (box exits right) -> booting (boot screen, then onSignIn)
  const [pending, setPending] = useState(null); // { user, org } once credentials are accepted

  const org = ORGS.find((o) => o.id === orgId);
  const signingIn = mode === 'signin';
  const ready = username.trim() && password && (signingIn ? orgId : displayName.trim());

  const switchMode = (next) => { setMode(next); setError(''); setRegistered(false); };

  const submit = (e) => {
    e.preventDefault();
    if (!ready || phase !== 'form') return;
    if (!signingIn) { setRegistered(true); return; }
    const user = users.find((u) => u.handle.toLowerCase() === username.trim().toLowerCase());
    if (!user) return setError('Invalid username or password.');
    if (user.status === 'Disabled') return setError('This account is disabled. Contact an administrator.');
    if (prefersReducedMotion()) return onSignIn(user, org);
    setPending({ user, org });
    setPhase('sliding');
  };

  useEffect(() => {
    if (phase !== 'sliding') return;
    const t = setTimeout(() => setPhase('booting'), SLIDE_MS);
    return () => clearTimeout(t);
  }, [phase]);

  const leaving = phase !== 'form';

  return (
    <div data-theme="dark" className="relative h-screen w-screen bg-page text-fg grid lg:grid-cols-[minmax(440px,39%)_1fr] overflow-hidden selection:bg-cyan-500/30 selection:text-cyan-200">
      {/* LEFT: sign-in form */}
      <section className={`relative z-10 px-6 sm:px-12 py-8 flex flex-col ${phase === 'sliding' ? 'overflow-visible' : 'overflow-y-auto custom-scrollbar'}`}>
        <div className="w-full max-w-[520px] mx-auto">
          <div className={`transition-opacity duration-500 ${leaving ? 'opacity-0' : ''}`}><BrandMark size="lg" /></div>

          <div className={`mt-8 rounded-2xl border border-ink/[0.1] bg-surface/80 backdrop-blur-xl p-7 sm:p-8 shadow-[0_24px_60px_rgba(0,0,0,0.55)] transition-[transform,opacity] duration-[750ms] ease-[cubic-bezier(0.7,0,0.84,0)] ${leaving ? 'translate-x-[130%] opacity-0' : ''}`}>

            <div className="flex items-center gap-6">
              <div className="w-20 h-20 shrink-0 rounded-3xl bg-gradient-to-br from-indigo-500/30 to-cyan-500/20 border border-indigo-400/40 flex items-center justify-center shadow-[0_0_40px_rgba(99,102,241,0.35)]">
                <ShieldCheck size={38} className="text-indigo-300" />
              </div>
              <div>
                <h1 className="text-2xl font-extrabold tracking-tight">{signingIn ? 'Sign in' : 'Request access'}</h1>
                <div className="text-2xl font-extrabold tracking-tight bg-gradient-to-r from-indigo-300 via-sky-300 to-cyan-300 bg-clip-text text-transparent">
                  Agentic Patching Factory
                </div>
              </div>
            </div>

            <p className="mt-6 text-center text-sm italic text-fg3">
              {org ? 'Your infrastructure’s patch posture, at a glance.' : 'From advisory to remediation — fully orchestrated, fully audited.'}
            </p>

            <div role="tablist" className="mt-5 grid grid-cols-2 gap-1 p-1 rounded-xl bg-surface border border-ink/[0.06]">
              {[['signin', 'Sign In', Lock], ['register', 'Register', UserPlus]].map(([id, label, Icon]) => (
                <button
                  key={id}
                  role="tab"
                  aria-selected={mode === id}
                  onClick={() => switchMode(id)}
                  className={`flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold transition-colors ${mode === id ? 'bg-teal-500/20 text-teal-300' : 'text-fg2 hover:text-fg'}`}
                >
                  <Icon size={14} /> {label}
                </button>
              ))}
            </div>

            <form onSubmit={submit} className="mt-5 space-y-4" noValidate>
              {signingIn && (
                <div>
                  <label htmlFor="org" className={LABEL}>Tenant / Organization</label>
                  <div className={`relative ${org ? 'rounded-lg ring-1 ring-indigo-400/60' : ''}`}>
                    <Select
                      id="org"
                      size="lg"
                      value={orgId}
                      onValueChange={setOrgId}
                      placeholder="Select organization…"
                      options={ORGS.map((o) => ({ value: o.id, label: o.name, dot: o.dot }))}
                      className={`w-full font-normal ${org ? 'bg-indigo-950/40' : ''}`}
                    />
                  </div>
                  {org && (
                    <p className="mt-2 flex items-center gap-1.5 text-xs text-fg3">
                      <Lock size={11} /> Data isolated to {org.name}
                    </p>
                  )}
                </div>
              )}

              {!signingIn && (
                <div>
                  <label htmlFor="display" className={LABEL}>Display name</label>
                  <input id="display" value={displayName} onChange={(e) => setDisplayName(e.target.value)} placeholder="Enter your full name" autoComplete="name" className={FIELD} />
                </div>
              )}

              <div>
                <label htmlFor="username" className={LABEL}>Username</label>
                <input id="username" value={username} onChange={(e) => { setUsername(e.target.value); setError(''); }} placeholder="Enter username" autoComplete="username" className={FIELD} />
              </div>

              <div>
                <label htmlFor="password" className={LABEL}>Password</label>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => { setPassword(e.target.value); setError(''); }}
                    placeholder="Enter password"
                    autoComplete={signingIn ? 'current-password' : 'new-password'}
                    className={`${FIELD} pr-12`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((s) => !s)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-fg3 hover:text-fg rounded"
                  >
                    {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                  </button>
                </div>
                {signingIn && (
                  <div className="text-right mt-2">
                    <button type="button" className="text-sm font-semibold text-sky-400 hover:text-sky-300">Forgot password?</button>
                  </div>
                )}
              </div>

              <div aria-live="polite">
                {error && (
                  <div className="flex items-center gap-2 px-3 py-2.5 rounded-lg bg-red-950/40 border border-red-500/30 text-xs text-red-300">
                    <AlertCircle size={14} /> {error}
                  </div>
                )}
                {registered && (
                  <div className="flex items-center gap-2 px-3 py-2.5 rounded-lg bg-emerald-950/40 border border-emerald-500/30 text-xs text-emerald-300">
                    <CheckCircle2 size={14} /> Request submitted. An administrator must approve your account before you can sign in.
                  </div>
                )}
              </div>

              <button
                type="submit"
                disabled={!ready}
                className="w-full py-3.5 rounded-lg text-sm font-bold transition-all bg-teal-600 hover:bg-teal-500 text-white shadow-lg shadow-teal-500/20 disabled:bg-teal-900/50 disabled:text-teal-200/50 disabled:shadow-none disabled:cursor-not-allowed"
              >
                {signingIn ? 'Sign In' : 'Request access'}
              </button>
              {signingIn && <p className="text-[11px] text-fg4 text-center -mt-2">Prototype: any password works for a listed username (try admin, operator or viewer).</p>}
            </form>

            <details className="group mt-5 pt-4 border-t border-ink/[0.06]">
                <summary className="flex cursor-pointer list-none items-center justify-between text-xs font-bold uppercase tracking-wider text-fg2 hover:text-fg [&::-webkit-details-marker]:hidden">
                  What can each role do?
                  <ChevronDown size={14} className="transition-transform group-open:rotate-180" />
                </summary>
                <ul className="mt-3 space-y-2">
                  {Object.values(ROLES).map((r) => (
                    <li key={r.label} className="flex items-center gap-3 text-sm">
                      <span className={`w-1.5 h-1.5 rounded-full ${r.tone.dot}`} />
                      <span className="w-24 font-semibold text-fg">{r.label}</span>
                      <span className="text-fg3">{r.desc}</span>
                    </li>
                  ))}
                </ul>
              </details>
          </div>
        </div>
      </section>

      {/* RIGHT: platform snapshot (desktop only) */}
      <section aria-hidden="true" className={`relative hidden lg:block overflow-y-auto custom-scrollbar transition-opacity duration-700 ${leaving ? 'opacity-0' : ''} border-l border-ink/[0.06] bg-gradient-to-br from-panel via-page to-page`}>
        <svg className="absolute inset-0 w-full h-full pointer-events-none" preserveAspectRatio="none" viewBox="0 0 100 100">
          {NODES.map((a, i) => NODES.slice(i + 1, i + 3).map((b, j) => (
            <line key={`${i}-${j}`} x1={a[0]} y1={a[1]} x2={b[0]} y2={b[1]} stroke="rgba(148,163,184,0.12)" strokeWidth="0.15" vectorEffect="non-scaling-stroke" />
          )))}
        </svg>
        {NODES.map(([x, y, c], i) => (
          <span key={i} className="absolute w-4 h-4 rounded-full opacity-50 pointer-events-none" style={{ left: `${x}%`, top: `${y}%`, background: c }} />
        ))}

        <div className="relative px-14 py-12 max-w-[1100px]">
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-teal-500/30 bg-teal-950/30 text-xs font-semibold text-teal-200">
            <span className="w-1.5 h-1.5 rounded-full bg-teal-400" /> Wipro Intelligence · Agentic AI Platform
          </span>
          <h2 className="mt-7 text-4xl font-extrabold tracking-tight">
            Your fleet’s <span className="bg-gradient-to-r from-emerald-300 via-sky-300 to-fuchsia-400 bg-clip-text text-transparent">actual console</span> — not a mockup.
          </h2>
          <p className="mt-5 text-base leading-relaxed text-fg3 max-w-[760px]">
            Live view of the platform your team runs every cycle. CVE-aware, wave-planned orchestration across Linux, Windows and database estates, with automatic rollback.
          </p>

          <div className="mt-8 rounded-2xl border border-ink/[0.08] bg-surface/70 overflow-hidden">
            <div className="flex items-center gap-2 px-4 py-3 border-b border-ink/[0.06] bg-inset/60">
              <span className="w-2 h-2 rounded-full bg-slate-600" /><span className="w-2 h-2 rounded-full bg-slate-600" /><span className="w-2 h-2 rounded-full bg-slate-600" />
              <span className="ml-2 font-mono text-xs text-fg3">platform · capability snapshot</span>
            </div>
            <div className="p-5 space-y-4">
              <div className="grid grid-cols-5 gap-3">
                {STATS.map(({ icon: Icon, value, label, tone }) => (
                  <div key={label} className="rounded-xl border border-ink/[0.06] bg-raised/60 p-4">
                    <Icon size={16} className={tone} />
                    <div className={`mt-3 text-2xl font-extrabold ${tone}`}>{value}</div>
                    <div className="mt-1 text-[10px] font-bold uppercase tracking-wider text-fg3">{label}</div>
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-xl border border-ink/[0.06] bg-raised/60 p-4">
                  <div className="font-mono text-[10px] font-bold uppercase tracking-wider text-fg2">Technology coverage</div>
                  <div className="h-44 mt-2"><Radar data={RADAR_DATA} options={RADAR_OPTIONS} /></div>
                </div>
                <div className="rounded-xl border border-ink/[0.06] bg-raised/60 p-4">
                  <div className="font-mono text-[10px] font-bold uppercase tracking-wider text-fg2">Pipeline throughput</div>
                  <div className="h-44 mt-2"><Line data={AREA_DATA} options={AREA_OPTIONS} /></div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 pt-8 border-t border-ink/[0.06] grid grid-cols-3 gap-8 text-sm leading-relaxed text-fg3">
            <div>
              <h3 className="text-base font-bold text-fg mb-2">Supported Technologies</h3>
              Linux, Windows &amp; Database platforms — RHEL 8/9, SUSE SLES 15, Windows Server 2016–2022, MySQL, MSSQL, PostgreSQL — fully supported across every pipeline stage.
            </div>
            <div>
              <h3 className="text-base font-bold text-fg mb-2">Platform</h3>
              Red Hat OpenShift Container Platform · Kubernetes-native multi-node cluster · Ansible Automation Platform · Cohesity DataProtect · vCenter snapshot
            </div>
            <div>
              <h3 className="text-base font-bold text-fg mb-2">Agentic AI &amp; Integrations</h3>
              Full lifecycle agent orchestration across {STAGES.length} pipeline stages · MCP integrations · ServiceNow, Cohesity, Red Hat Satellite, WSUS, Milvus, Ansible
            </div>
          </div>
        </div>
      </section>

      {phase === 'booting' && <BootSequence user={pending.user} org={pending.org} onDone={() => onSignIn(pending.user, pending.org)} />}
    </div>
  );
}
