import React, { useState } from 'react';
import { X, UserCog, Palette, Activity, Plug, HeartPulse, CalendarClock, Database, Info, Sun, Moon } from 'lucide-react';
import Select from './ui/Select';
import Toggle from './ui/Toggle';
import { ROLES, ORGS } from '../data/accessData';
import { AGENTS_LIST } from '../data/nexusData';
import pkg from '../../package.json';

const SECTIONS = [
  { id: 'identity', label: 'Identity & Access', icon: UserCog },
  { id: 'appearance', label: 'Appearance', icon: Palette },
  { id: 'activity', label: 'Activity Stream', icon: Activity },
  { id: 'integrations', label: 'Integrations Mode', icon: Plug },
  { id: 'health', label: 'Service Health', icon: HeartPulse },
  { id: 'scheduling', label: 'Scheduling Defaults', icon: CalendarClock },
  { id: 'session', label: 'Session Data', icon: Database },
  { id: 'about', label: 'About', icon: Info },
];

const MODES = [
  { id: 'live', label: 'Live', desc: 'Agents act on real systems through connected tools.' },
  { id: 'simulation', label: 'Simulation', desc: 'Dry-run: full pipeline with mocked tool responses, nothing is changed.' },
  { id: 'readonly', label: 'Read-only', desc: 'Discovery and reporting only; execution stages are blocked.' },
];

const SERVICES = [
  ['Orchestrator API', 'Healthy', '42 ms'],
  ['MCP Gateway', 'Healthy', '58 ms'],
  ['ServiceNow connector', 'Healthy', '210 ms'],
  ['vCenter connector', 'Healthy', '134 ms'],
  ['Milvus vector store', 'Degraded', '480 ms'],
  ['Audit store', 'Healthy', '36 ms'],
];

const SERVICE_TONE = { Healthy: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30', Degraded: 'text-amber-400 bg-amber-500/10 border-amber-500/30' };

const WINDOWS = ['Sat 23:00 – 03:00 IST', 'Sun 02:00 – 06:00 IST', 'Weeknights 22:00 – 02:00 IST', 'Fri 21:00 – 01:00 IST'];

function Row({ title, hint, children }) {
  return (
    <div className="flex items-center justify-between gap-4 py-3 border-b border-ink/[0.06] last:border-0">
      <div className="min-w-0">
        <div className="text-xs font-semibold text-fg">{title}</div>
        {hint && <div className="text-[11px] text-fg3 mt-0.5">{hint}</div>}
      </div>
      {children}
    </div>
  );
}

export default function SettingsModal({ isOpen, onClose, settings, onUpdate, onReset, darkMode, setDarkMode, user, session, onNavigateTab, onSignOut }) {
  const [section, setSection] = useState('identity');
  if (!isOpen) return null;

  const go = (tab) => { onClose(); onNavigateTab(tab); };
  const org = ORGS.find((o) => o.id === session?.orgId);
  const role = ROLES[user.role];
  const storageKeys = (() => {
    try { return Object.keys(localStorage).filter((k) => k.startsWith('nexus.')); } catch { return []; }
  })();

  const panels = {
    identity: (
      <>
        <div className="flex items-center gap-3 pb-4">
          <div className="w-11 h-11 rounded-full bg-emerald-500 text-onbright font-bold flex items-center justify-center">{user.initials}</div>
          <div>
            <div className="text-sm font-bold text-fg">{user.name}</div>
            <div className="text-[11px] text-fg3">{user.email} · {role.label} · {org?.name}</div>
          </div>
        </div>
        <div className="flex flex-wrap gap-1.5 pb-3">
          {role.permissions.map((p) => (
            <span key={p} className="px-2 py-0.5 rounded-md bg-inset border border-ink/[0.08] text-[10px] font-mono text-fg2">{p}</span>
          ))}
        </div>
        <Row title="Session timeout" hint="Sign out after this long without activity.">
          <Select value={settings.identity.sessionTimeoutMin} onValueChange={(v) => onUpdate({ identity: { ...settings.identity, sessionTimeoutMin: v } })} options={['30', '60', '120', '480'].map((v) => ({ value: v, label: `${v} min` }))} className="w-32" />
        </Row>
        <div className="flex gap-2 pt-3">
          <button onClick={() => go('user-management')} className="px-3 py-1.5 rounded-lg bg-surface border border-ink/[0.1] text-xs text-fg2 hover:text-fg">Manage users</button>
          <button onClick={() => go('access-control')} className="px-3 py-1.5 rounded-lg bg-surface border border-ink/[0.1] text-xs text-fg2 hover:text-fg">Roles &amp; RBAC matrix</button>
        </div>
      </>
    ),
    appearance: (
      <>
        <Row title="Theme" hint="Applies to the workspace and dialogs.">
          <div className="flex rounded-full border border-ink/[0.12] p-0.5">
            {[[true, Moon, 'Dark'], [false, Sun, 'Light']].map(([isDark, Icon, label]) => (
              <button key={label} onClick={() => setDarkMode(!isDark)} className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold ${darkMode !== isDark ? 'text-fg3' : 'pill-tab-active'}`}>
                <Icon size={12} /> {label}
              </button>
            ))}
          </div>
        </Row>
        <Row title="Reduce motion" hint="Turns off flowing connectors, orbs and transitions.">
          <Toggle checked={settings.reduceMotion} onChange={(v) => onUpdate({ reduceMotion: v })} label="Reduce motion" />
        </Row>
      </>
    ),
    activity: (
      <>
        <Row title="Live execution runs" hint="Show the live runs stream on the Central Dashboard.">
          <Toggle checked={settings.activity.liveRuns} onChange={(v) => onUpdate({ activity: { ...settings.activity, liveRuns: v } })} label="Live execution runs" />
        </Row>
        <Row title="Agent events" hint="Hand-offs, gate decisions and retries.">
          <Toggle checked={settings.activity.agentEvents} onChange={(v) => onUpdate({ activity: { ...settings.activity, agentEvents: v } })} label="Agent events" />
        </Row>
        <Row title="Audit events" hint="Operator actions and policy overrides.">
          <Toggle checked={settings.activity.auditEvents} onChange={(v) => onUpdate({ activity: { ...settings.activity, auditEvents: v } })} label="Audit events" />
        </Row>
        <Row title="Refresh interval">
          <Select value={settings.activity.refresh} onValueChange={(v) => onUpdate({ activity: { ...settings.activity, refresh: v } })} options={['5s', '10s', '30s', '60s']} className="w-28" />
        </Row>
      </>
    ),
    integrations: (
      <div className="space-y-2">
        {MODES.map((m) => (
          <button
            key={m.id}
            onClick={() => onUpdate({ integrationMode: m.id })}
            className={`w-full text-left p-3.5 rounded-xl border transition-all ${settings.integrationMode === m.id ? 'bg-cyan-500/10 border-cyan-500/60' : 'bg-inset border-ink/[0.08] hover:border-ink/20'}`}
          >
            <div className="text-xs font-bold text-fg">{m.label}</div>
            <div className="text-[11px] text-fg3 mt-0.5">{m.desc}</div>
          </button>
        ))}
      </div>
    ),
    health: (
      <div className="divide-y divide-ink/[0.06]">
        {SERVICES.map(([name, status, latency]) => (
          <div key={name} className="flex items-center justify-between py-2.5 text-xs">
            <span className="text-fg">{name}</span>
            <div className="flex items-center gap-3">
              <span className="font-mono text-fg3">{latency}</span>
              <span className={`px-2 py-0.5 rounded-md border text-[10px] font-bold ${SERVICE_TONE[status]}`}>{status}</span>
            </div>
          </div>
        ))}
      </div>
    ),
    scheduling: (
      <>
        <Row title="Default scheduling window" hint="Pre-selected when scheduling a patch run.">
          <Select value={settings.scheduling.window} onValueChange={(v) => onUpdate({ scheduling: { ...settings.scheduling, window: v } })} options={WINDOWS} className="w-60" />
        </Row>
        <Row title="Default soak period" hint="Hold time between waves before the next one starts.">
          <div className="flex items-center gap-2">
            <input type="number" min="0" max="168" value={settings.scheduling.soakHours} onChange={(e) => onUpdate({ scheduling: { ...settings.scheduling, soakHours: Math.max(0, Number(e.target.value)) } })} className="w-20 bg-inset border border-ink/[0.08] rounded-lg px-2 py-1.5 text-xs text-fg font-mono text-right focus:outline-none focus:border-cyan-500" />
            <span className="text-xs text-fg3">hours</span>
          </div>
        </Row>
        <Row title="Max CIs per wave" hint="Larger runs are split into waves of this size.">
          <input type="number" min="1" max="500" value={settings.scheduling.maxCisPerWave} onChange={(e) => onUpdate({ scheduling: { ...settings.scheduling, maxCisPerWave: Math.max(1, Number(e.target.value)) } })} className="w-20 bg-inset border border-ink/[0.08] rounded-lg px-2 py-1.5 text-xs text-fg font-mono text-right focus:outline-none focus:border-cyan-500" />
        </Row>
      </>
    ),
    session: (
      <>
        <Row title="Signed in as"><span className="text-xs font-mono text-fg2">{session?.handle} @ {org?.name}</span></Row>
        <Row title="Stored preferences" hint="Kept in this browser only.">
          <span className="text-[11px] font-mono text-fg3">{storageKeys.join(', ') || 'none'}</span>
        </Row>
        <div className="flex gap-2 pt-3">
          <button onClick={onReset} className="px-3 py-1.5 rounded-lg bg-surface border border-ink/[0.1] text-xs text-fg2 hover:text-fg">Reset preferences</button>
          <button onClick={() => { onClose(); onSignOut(); }} className="px-3 py-1.5 rounded-lg bg-red-500/10 border border-red-500/30 text-xs text-red-300 hover:text-red-200">Sign out</button>
        </div>
      </>
    ),
    about: (
      <>
        <Row title="Product"><span className="text-xs text-fg2">Agentic Vulnerability and Patching Nexus</span></Row>
        <Row title="Version"><span className="text-xs font-mono text-fg2">v{pkg.version}</span></Row>
        <Row title="Agents registered"><span className="text-xs font-mono text-fg2">{AGENTS_LIST.length}</span></Row>
        <Row title="Stack"><span className="text-xs font-mono text-fg2">React 18 · Vite 5 · Tailwind 3</span></Row>
      </>
    ),
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div role="dialog" aria-label="Settings" className="w-full max-w-3xl h-[540px] bg-surface text-fg border border-cyan-500/30 rounded-2xl shadow-2xl flex overflow-hidden animate-in zoom-in-95">
        <nav className="w-52 flex-shrink-0 border-r border-ink/[0.08] p-3 space-y-0.5 bg-inset/50">
          <div className="px-2 pb-2 text-[11px] font-bold uppercase tracking-wider text-fg3">Settings</div>
          {SECTIONS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setSection(id)}
              className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-xs font-medium text-left transition-colors ${section === id ? 'bg-cyan-500/15 text-cyan-300' : 'text-fg2 hover:bg-ink/[0.05] hover:text-fg'}`}
            >
              <Icon size={14} /> {label}
            </button>
          ))}
        </nav>
        <div className="flex-1 min-w-0 flex flex-col">
          <div className="flex items-center justify-between px-5 py-3 border-b border-ink/[0.08]">
            <h3 className="text-sm font-bold">{SECTIONS.find((s) => s.id === section).label}</h3>
            <button onClick={onClose} aria-label="Close settings" className="p-1 text-fg3 hover:text-fg rounded-lg hover:bg-ink/[0.08]"><X size={17} /></button>
          </div>
          <div className="flex-1 overflow-y-auto custom-scrollbar p-5">{panels[section]}</div>
        </div>
      </div>
    </div>
  );
}
