import React, { useState } from 'react';
import { AGENTS_LIST } from '../data/nexusData';
import AgentFlow from './AgentFlow';
import AgentSkillLibrary from './AgentSkillLibrary';
import AgentNetwork from './AgentNetwork';
import { tone } from '../tone';
import {
  Sparkles,
  Plus,
  ChevronDown,
  ChevronUp,
  Cpu,
  Bot,
  Activity,
  Zap,
  Terminal,
  Search,
  Filter,
  Network,
  LayoutGrid,
} from 'lucide-react';

/** Agent grouping shown in the registry (ids from AGENTS_LIST) */
const CATEGORIES = [
  { id: 'pre',   title: 'Pre-Orchestration', blurb: 'Discover, assess and make hosts patch-ready', note: 'Stages 1–3 run in parallel', color: '#06b6d4', gate: 'Read-only scope', rows: [[1, 2, 3], [4, 5], [6, 7, 8]] },
  { id: 'orch',  title: 'Orchestration',     blurb: 'Coordinate change, communication and live telemetry', color: '#a855f7', gate: 'CAB approval', rows: [[9, 10], [20]] },
  { id: 'exec',  title: 'Execution',         blurb: 'Deploy patches, validate and roll back on failure', color: '#f97316', gate: 'Change window + rollback', rows: [[11, 12], [13, 14], [15]] },
  { id: 'gov',   title: 'Governance',        blurb: 'Evidence, compliance and CMDB accountability', color: '#10b981', gate: 'Audit attestation', rows: [[16, 17], [18, 19]] },
].map((c) => ({ ...c, agents: c.rows.flat() }));

export default function AgentRegistry({
  onNavigateTab,
  onOpenAddAgent,
  onSelectAgent,
}) {
  const [activeSubTab, setActiveSubTab] = useState('registry'); // 'flow' | 'registry' | 'engine'
  const [view, setView] = useState('network'); // 'network' | 'grid'
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedAgentId, setExpandedAgentId] = useState(null);

  const filteredAgents = AGENTS_LIST.filter((agent) =>
    agent.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    agent.desc.toLowerCase().includes(searchQuery.toLowerCase()) ||
    agent.phase.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-6 space-y-6 w-full animate-in fade-in">
      {/* 1. TOP SUBTABS BAR */}
      <div className="flex items-center gap-3 border-b border-ink/[0.08] pb-4">
        {[
          ['flow', 'Agent Flow'],
          ['registry', 'Agent Registry'],
          ['skills', 'Agent Skill Library'],
          ['engine', 'Instruction Engine'],
        ].map(([id, label]) => (
          <button
            key={id}
            onClick={() => setActiveSubTab(id)}
            className={`px-4 py-1.5 text-xs font-semibold rounded-full transition-all ${
              activeSubTab === id ? 'pill-tab-active' : 'text-fg3 hover:text-fg'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {activeSubTab === 'flow' ? (
        <AgentFlow />
      ) : activeSubTab === 'skills' ? (
        <AgentSkillLibrary />
      ) : (
        <>
      {/* 2. SUB-HEADER: AGENTS REGISTRY TITLE & CONTROLS */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <span className="text-cyan-400">✦</span>
          <h2 className="text-xs font-bold uppercase tracking-wider text-fg3">
            {AGENTS_LIST.filter((a) => a.status === 'ACTIVE').length} of {AGENTS_LIST.length} agents active
          </h2>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          {/* Search bar */}
          <div className="relative flex-1 sm:w-64">
            <Search
              size={14}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-fg3"
            />
            <input
              type="text"
              placeholder="Filter agents..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-surface border border-ink/[0.08] rounded-full pl-8 pr-3 py-1 text-xs text-fg placeholder-fg4 focus:outline-none focus:border-cyan-500/50"
            />
          </div>

          <span className="text-xs font-mono text-fg3 whitespace-nowrap">
            {filteredAgents.length} agents
          </span>

          <div className="hidden lg:flex items-center rounded-full border border-ink/[0.12] p-0.5">
            {[['network', Network, 'Network'], ['grid', LayoutGrid, 'Grid']].map(([id, Icon, label]) => (
              <button
                key={id}
                onClick={() => setView(id)}
                className={`flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold transition-all ${
                  view === id ? 'pill-tab-active' : 'text-fg3 hover:text-fg'
                }`}
              >
                <Icon size={12} /> {label}
              </button>
            ))}
          </div>

          <button
            onClick={onOpenAddAgent}
            className="flex items-center gap-1.5 px-3.5 py-1 bg-ink/[0.04] hover:bg-ink/[0.08] border border-ink/[0.12] rounded-full text-xs font-semibold text-fg transition-all shadow-md hover:border-cyan-500/40"
          >
            <Plus size={14} className="text-cyan-400" />
            <span>Add Agent</span>
          </button>
        </div>
      </div>

      {/* 3a. CONNECTED VIEW: orchestrator governing every agent (desktop) */}
      {view === 'network' && (
        <div className="hidden lg:block">
          <AgentNetwork
            categories={CATEGORIES}
            agents={filteredAgents}
            onSelectAgent={onSelectAgent ?? ((a) => setExpandedAgentId(a.id))}
          />
        </div>
      )}

      {/* 3b. AGENT CARDS, GROUPED BY CATEGORY (grid view, and the mobile fallback) */}
      <div className={`space-y-6 ${view === 'network' ? 'lg:hidden' : ''}`}>
      {CATEGORIES.map((cat) => {
        const agents = cat.agents
          .map((id) => filteredAgents.find((a) => a.id === id))
          .filter(Boolean);
        if (!agents.length) return null;
        return (
          <section key={cat.id} className="space-y-3">
            <div className="flex items-center gap-3">
              <span className="w-1 h-8 rounded-full" style={{ background: cat.color }} />
              <div>
                <h3 className="text-sm font-bold text-fg flex items-center gap-2">
                  {cat.title}
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-mono border" style={{ color: tone(cat.color), borderColor: `${cat.color}66` }}>
                    {agents.length} {agents.length === 1 ? 'agent' : 'agents'}
                  </span>
                </h3>
                <p className="text-[11px] text-fg3">{cat.blurb}</p>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3.5">
              {agents.map((agent) => {
                const isExpanded = expandedAgentId === agent.id;
                return (
                  <div
                    key={agent.id}
                    className={`nexus-card p-3.5 flex flex-col justify-between hover:border-cyan-500/40 transition-all cursor-pointer group ${
                      isExpanded ? 'border-cyan-500/60 ring-1 ring-cyan-500/30' : ''
                    }`}
                    onClick={() => onSelectAgent ? onSelectAgent(agent) : setExpandedAgentId(isExpanded ? null : agent.id)}
                  >
                    {/* Top Row: Number Badge & Name & Chevron */}
                    <div>
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div className="w-6 h-6 rounded-md bg-blue-950/80 border border-blue-500/40 flex items-center justify-center text-xs font-bold text-blue-400 font-mono">
                          {agent.id}
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setExpandedAgentId(isExpanded ? null : agent.id);
                          }}
                          className="text-fg4 group-hover:text-fg2 p-0.5"
                        >
                          {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                        </button>
                      </div>

                      {/* Agent Name */}
                      <h3 className="text-xs font-bold text-fg tracking-tight mb-2 group-hover:text-cyan-300 transition-colors font-mono">
                        {agent.name}
                      </h3>

                      {/* Agent Description */}
                      <p className="text-[11px] text-fg3 leading-snug line-clamp-3 mb-3">
                        {agent.desc}
                      </p>
                    </div>

                    {/* Bottom Tag */}
                    <div className="pt-2 border-t border-ink/[0.06] flex items-center justify-between text-[10px]">
                      <span className="text-cyan-400 font-medium truncate">
                        {agent.phase}
                      </span>
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 flex-shrink-0 animate-pulse"></span>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        );
      })}
      </div>
        </>
      )}
    </div>
  );
}
