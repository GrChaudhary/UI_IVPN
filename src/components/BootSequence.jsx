import React, { useEffect, useState } from 'react';
import { ShieldCheck } from 'lucide-react';
import BrandMark from './BrandMark';
import { ROLES, initials } from '../data/accessData';
import { AGENTS_LIST } from '../data/nexusData';
import { STAGES, TECH_HOSTS } from '../simulation/simulationEngine';

const STEP_MS = 520;
const FINISH_MS = 650;
const TOTAL_HOSTS = Object.values(TECH_HOSTS).reduce((a, b) => a + b, 0);

/** Full-screen "logging in / booting" sequence shown after a successful sign-in. Calls onDone when finished. */
export default function BootSequence({ user, org, onDone }) {
  const role = ROLES[user.role];
  const lines = [
    `Authenticated ${user.handle} · ${org.name}`,
    `Loaded RBAC profile: ${role.label} (${role.permissions.length} permissions)`,
    `Isolated tenant data for ${org.name}`,
    `Connected agent fleet (${AGENTS_LIST.length} agents)`,
    `Armed policy gates across ${STAGES.length} pipeline stages`,
    `Synced asset inventory (${TOTAL_HOSTS} managed hosts)`,
  ];
  const [step, setStep] = useState(0); // number of lines shown

  useEffect(() => {
    const done = step >= lines.length;
    const t = setTimeout(done ? onDone : () => setStep((s) => s + 1), done ? FINISH_MS : STEP_MS);
    return () => clearTimeout(t);
  }, [step]);

  const progress = Math.round((step / lines.length) * 100);

  return (
    <div role="status" aria-live="polite" className="absolute inset-0 z-20 bg-page flex items-center justify-center px-6 boot-fade-in">
      <div className="w-full max-w-[520px]">
        <div className="flex justify-center"><BrandMark size="lg" /></div>

        <div className="mt-10 flex items-center justify-center gap-5">
          <div className="relative w-16 h-16">
            <div className="absolute inset-0 rounded-full border-2 border-ink/10 border-t-cyan-400 animate-spin" />
            <div className="absolute inset-2 rounded-full bg-gradient-to-br from-indigo-500/30 to-cyan-500/20 flex items-center justify-center">
              <ShieldCheck size={24} className="text-indigo-200" />
            </div>
          </div>
          <div>
            <div className="text-xs font-mono uppercase tracking-wider text-fg3">Welcome back</div>
            <div className="text-2xl font-extrabold tracking-tight">{user.name}</div>
          </div>
          <div className="w-10 h-10 rounded-full bg-emerald-500 text-onbright font-bold text-sm flex items-center justify-center">{initials(user)}</div>
        </div>

        <div className="mt-8 h-1.5 rounded-full bg-ink/[0.08] overflow-hidden">
          <div className="h-full rounded-full bg-gradient-to-r from-indigo-400 via-sky-400 to-emerald-400 transition-[width] duration-500 ease-out" style={{ width: `${progress}%` }} />
        </div>

        <ul className="mt-6 space-y-2 font-mono text-xs min-h-[9.5rem]">
          {lines.slice(0, step).map((l) => (
            <li key={l} className="boot-line-in flex gap-3 text-fg2">
              <span className="text-emerald-400 shrink-0">[ OK ]</span>
              <span>{l}</span>
            </li>
          ))}
          {step >= lines.length && (
            <li className="boot-line-in flex gap-3 text-cyan-300">
              <span className="shrink-0">[ &gt;&gt; ]</span>
              <span>Launching console…</span>
            </li>
          )}
        </ul>
      </div>
    </div>
  );
}
