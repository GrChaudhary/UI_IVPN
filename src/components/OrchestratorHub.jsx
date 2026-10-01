import React from 'react';
import { Network, ShieldCheck, UserCheck, Gauge, Lock, ScrollText, OctagonX } from 'lucide-react';

const GOVERNANCE_CONTROLS = [
  { icon: UserCheck, label: 'RBAC & approvals' },
  { icon: Gauge, label: 'N-1 baseline policy' },
  { icon: Lock, label: 'Change-freeze windows' },
  { icon: ScrollText, label: 'Signed audit trail' },
  { icon: OctagonX, label: 'Kill-switch & rollback' },
];

/** Governance & Policy Layer — lives inside the orchestrator and gates every agent it dispatches. */
function GovernancePanel({ compact }) {
  return (
    <div className="rounded-lg border border-emerald-500/25 bg-emerald-500/[0.06] p-3 space-y-2.5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-emerald-950/70 border border-emerald-500/40 flex items-center justify-center text-emerald-400 flex-shrink-0">
            <ShieldCheck size={16} />
          </div>
          <div>
            <h4 className="text-xs font-bold text-fg">Governance &amp; Policy Layer</h4>
            {!compact && <p className="text-[11px] text-fg3">Every stage below executes only while policy gates pass.</p>}
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {GOVERNANCE_CONTROLS.map(({ icon: Icon, label }) => (
            <span
              key={label}
              title={label}
              className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-[11px] text-emerald-300"
            >
              <Icon size={12} />
              {!compact && label}
            </span>
          ))}
          <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-[10px] font-bold font-mono text-emerald-300 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> ENFORCING
          </span>
        </div>
      </div>
    </div>
  );
}

/** variant="banner": full-width strip above the pipeline. variant="core": centre of the agent network. */
export default function OrchestratorHub({ variant = 'banner', agentCount = 18 }) {
  const core = variant === 'core';
  return (
    <div
      className={`nexus-card border-purple-500/40 bg-gradient-to-br from-purple-950/40 via-surface to-emerald-950/20 space-y-3 ${
        core ? 'p-3.5 w-[300px] shadow-[0_0_40px_rgba(168,85,247,0.25)] hub-breathe' : 'p-4'
      }`}
    >
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-purple-950/70 border border-purple-500/50 flex items-center justify-center text-purple-300 flex-shrink-0">
            <Network size={18} />
          </div>
          <div>
            <h3 className="text-sm font-bold text-fg">Orchestrator</h3>
            <p className="text-[11px] text-fg3">
              {core ? `Governs all ${agentCount} agents` : `Sequences ${agentCount} agents, hands off context and gates each stage on policy.`}
            </p>
          </div>
        </div>
        <span className="px-2.5 py-1 rounded-full bg-purple-500/15 border border-purple-500/40 text-[10px] font-bold font-mono text-purple-300 flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-pulse" /> LIVE
        </span>
      </div>
      <GovernancePanel compact={core} />
    </div>
  );
}
