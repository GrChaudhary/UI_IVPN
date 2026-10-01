import React, { useState } from 'react';
import { Sparkles, ArrowRight, RefreshCw, Play } from 'lucide-react';
import { AGENTS_LIST } from '../data/nexusData';
import OrchestratorHub from './OrchestratorHub';
import { tone } from '../tone';

/** Pipeline stages in order. `policy` is the gate the orchestrator enforces on entry; `handoff` is the payload passed to the next stage. */
const STAGES = [
  { id: 'discovery', title: 'DISCOVERY', color: '#06b6d4', policy: 'Read-only scope', handoff: 'Asset + CVE inventory' },
  { id: 'analysis', title: 'ANALYSIS', color: '#a855f7', policy: 'Risk threshold gate', handoff: 'Risk score + blast radius' },
  { id: 'readiness', title: 'READINESS', color: '#eab308', policy: 'Snapshot mandatory', handoff: 'Snapshot ID + pre-check verdict' },
  { id: 'changemgmt', title: 'CHANGE MGMT', color: '#ec4899', policy: 'CAB approval', handoff: 'Approved change request' },
  { id: 'execution', title: 'EXECUTION', color: '#f97316', policy: 'Change window + rollback', handoff: 'Deployment result' },
  { id: 'validation', title: 'VALIDATION', color: '#38bdf8', policy: 'Audit attestation', handoff: 'Validated evidence' },
  { id: 'closure', title: 'CLOSURE', color: '#10b981', policy: 'Compliance sign-off', handoff: 'Closed-loop KPIs' },
  { id: 'observability', title: 'OBSERVABILITY', color: '#14b8a6', policy: 'Continuous telemetry' },
].map((stage) => ({ ...stage, nodes: AGENTS_LIST.filter((a) => a.group === stage.id) }));

const STATUS_STYLE = {
  ACTIVE: 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30',
  CONDITIONAL: 'bg-amber-500/20 text-amber-400 border border-amber-500/30',
};

export default function AgentFlow() {
  const [isRunningPipeline, setIsRunningPipeline] = useState(false);
  const [activeStageIndex, setActiveStageIndex] = useState(null);

  const totalTools = AGENTS_LIST.reduce((n, a) => n + a.toolsCount, 0);
  const activeCount = AGENTS_LIST.filter((a) => a.status === 'ACTIVE').length;
  const activeRate = Math.round((activeCount / AGENTS_LIST.length) * 100);

  const handleRunSimulation = () => {
    setIsRunningPipeline(true);
    let stage = 0;
    const interval = setInterval(() => {
      setActiveStageIndex(stage);
      stage++;
      if (stage >= STAGES.length) {
        clearInterval(interval);
        setTimeout(() => {
          setIsRunningPipeline(false);
          setActiveStageIndex(null);
        }, 1200);
      }
    }, 900);
  };

  const renderStage = (stage, idx, hasNext) => {
    const isHighlighted = activeStageIndex === idx;
    return (
      <React.Fragment key={stage.id}>
        <div className="flex-1 lg:min-w-[158px] flex flex-col">
          {/* Governance drop: policy chip + link into this stage */}
          <div className="hidden lg:flex flex-col items-center">
            <span
              className={`px-2 py-0.5 rounded-md border text-[10px] font-mono whitespace-nowrap transition-all ${
                isHighlighted
                  ? 'bg-emerald-500/25 border-emerald-400 text-emerald-200 shadow-[0_0_12px_rgba(16,185,129,0.4)]'
                  : 'bg-emerald-950/40 border-emerald-500/25 text-emerald-400/80'
              }`}
            >
              {stage.policy}
            </span>
            <Link direction="down" color="#10b981" active={isHighlighted} />
          </div>

          <div
            className={`nexus-card p-4 space-y-3 relative flex-1 transition-all duration-300 ${
              isHighlighted ? 'ring-2 ring-cyan-400 scale-[1.02] shadow-[0_0_20px_rgba(0,242,254,0.3)]' : ''
            }`}
          >
            <div className="flex items-center justify-between gap-2 pb-2 border-b border-ink/[0.08]">
              <span className="text-xs font-bold uppercase tracking-wide font-mono whitespace-nowrap" style={{ color: tone(stage.color) }}>
                {stage.title}
              </span>
              <span className="text-[10px] text-fg3 font-mono whitespace-nowrap shrink-0">{stage.nodes.length}<span className="hidden 2xl:inline"> {stage.nodes.length === 1 ? 'node' : 'nodes'}</span></span>
            </div>

            <div className="space-y-2.5">
              {stage.nodes.map((node) => (
                <div
                  key={node.id}
                  className="p-3 rounded-lg bg-inset border border-ink/[0.06] hover:border-cyan-500/40 transition-all cursor-pointer group"
                  onClick={() => alert(`Node details: ${node.label} (${node.stage})`)}
                >
                  <div className="text-xs font-bold text-fg group-hover:text-cyan-300 mb-1">{node.label}</div>
                  <div className="text-[10px] text-fg3 mb-2 font-mono">{node.stage}</div>
                  <div className="flex items-center justify-between pt-1.5 border-t border-ink/[0.04]">
                    <span className="text-[10px] text-fg3 font-mono whitespace-nowrap">⚡ {node.toolsCount} tools</span>
                    <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded font-mono ${STATUS_STYLE[node.status] ?? 'bg-slate-800 text-fg3'}`}>
                      {node.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {hasNext && (
          <div className="flex items-center justify-center lg:self-stretch lg:pt-12" title={stage.handoff}>
            <Link
              direction="right"
              color={STAGES[idx + 1].color}
              active={activeStageIndex !== null && activeStageIndex > idx}
              className="rotate-90 lg:rotate-0"
            />
          </div>
        )}
      </React.Fragment>
    );
  };

  return (
    <div className="space-y-6 w-full">
      {/* Top Metrics Banner */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-6 text-xs">
          <div>
            <span className="font-extrabold text-fg text-base">{AGENTS_LIST.length}</span>{' '}
            <span className="text-fg3">Total Agents</span>
          </div>
          <div>
            <span className="font-extrabold text-emerald-400 text-base">{activeRate}%</span>{' '}
            <span className="text-fg3">Active Rate</span>
          </div>
          <div>
            <span className="font-extrabold text-fg text-base">{totalTools}</span>{' '}
            <span className="text-fg3">MCP Tools</span>
          </div>
          <div>
            <span className="font-extrabold text-fg text-base">{STAGES.length}</span>{' '}
            <span className="text-fg3">Phases</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleRunSimulation}
            disabled={isRunningPipeline}
            className="flex items-center gap-2 px-4 py-1.5 bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 rounded-full text-xs font-semibold shadow-lg shadow-cyan-500/10 transition-all active:scale-95 disabled:opacity-50"
          >
            {isRunningPipeline ? <RefreshCw size={14} className="animate-spin" /> : <Play size={14} />}
            <span>{isRunningPipeline ? 'Simulating Pipeline...' : 'Test Full Pipeline'}</span>
          </button>
        </div>
      </div>

      {/* Header Container */}
      <div className="nexus-card p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-teal-950/60 border border-teal-500/40 flex items-center justify-center text-teal-400">
            <Sparkles size={18} />
          </div>
          <div>
            <h3 className="text-sm font-bold text-fg">Patch Cycle Agent Pipeline</h3>
            <p className="text-xs text-fg3">
              {AGENTS_LIST.length} agents · {STAGES.length} phases · {totalTools} MCP tools · N-1 baseline
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="px-3 py-1 bg-emerald-950/40 border border-emerald-500/30 rounded-full text-xs font-semibold text-emerald-400 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>{activeCount} active</span>
          </div>
          <button
            onClick={() => alert('Pipeline refreshed')}
            className="px-3 py-1 bg-ink/[0.04] hover:bg-ink/[0.08] border border-ink/[0.08] rounded-full text-xs text-fg2 flex items-center gap-1.5"
          >
            <RefreshCw size={12} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Orchestrator — owns the governance layer and sits above the stages it dispatches */}
      <OrchestratorHub variant="banner" agentCount={AGENTS_LIST.length} />

      {/* Interactive Visual Flow Diagram: stage columns joined by hand-off connectors */}
      <div className="overflow-x-auto pb-1">
        <div className="flex flex-col lg:flex-row lg:items-stretch lg:min-w-max xl:min-w-0">
          {STAGES.map((stage, idx) => renderStage(stage, idx, idx < STAGES.length - 1))}
        </div>
      </div>

      {/* Hand-off legend */}
      <div className="nexus-card p-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-[11px] text-fg3">
        <span className="font-bold uppercase tracking-wider text-fg2">Hand-offs</span>
        {STAGES.slice(0, -1).map((stage, i) => (
          <span key={stage.id} className="flex items-center gap-1.5">
            <span style={{ color: tone(stage.color) }}>{stage.title}</span>
            <ArrowRight size={11} />
            <span style={{ color: tone(STAGES[i + 1].color) }}>{STAGES[i + 1].title}</span>
            <span className="text-fg4">· {stage.handoff}</span>
          </span>
        ))}
      </div>
    </div>
  );
}

/** Animated connector. `active` = data has flowed through it during the simulation run. */
function Link({ direction, color, active, className = '' }) {
  const down = direction === 'down';
  const w = down ? 16 : 40;
  const h = down ? 28 : 16;
  const [x1, y1, x2, y2] = down ? [8, 0, 8, 22] : [0, 8, 33, 8];
  const head = down ? '3,20 8,27 13,20' : '32,3 39,8 32,13';
  return (
    <svg width={w} height={h} className={`flex-shrink-0 ${className}`} aria-hidden="true">
      <line
        x1={x1} y1={y1} x2={x2} y2={y2}
        stroke={color}
        strokeWidth={active ? 2.5 : 1.5}
        strokeOpacity={active ? 1 : 0.55}
        strokeDasharray="4 4"
      >
        <animate attributeName="stroke-dashoffset" from="8" to="0" dur={active ? '0.5s' : '1.4s'} repeatCount="indefinite" />
      </line>
      <polygon points={head} fill={color} fillOpacity={active ? 1 : 0.7} />
    </svg>
  );
}
