import React from 'react';
import { MANAGED_HOSTS } from '../data/cmdbData';
import {
  X,
  Bot,
  Activity,
  Zap,
  Terminal,
  ShieldCheck,
  CheckCircle2,
  Clock,
} from 'lucide-react';

export default function AgentDetailModal({ agent, onClose }) {
  if (!agent) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-end p-0 bg-black/70 backdrop-blur-sm animate-in fade-in">
      <div className="w-full max-w-xl h-full bg-surface border-l border-ink/[0.12] p-6 overflow-y-auto flex flex-col justify-between animate-in slide-in-from-right duration-300">
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-ink/[0.08]">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-cyan-950/80 border border-cyan-500/40 flex items-center justify-center text-cyan-400 font-mono font-bold">
                {agent.id}
              </div>
              <div>
                <h3 className="text-base font-bold text-fg font-mono">
                  {agent.name}
                </h3>
                <span className="text-xs text-cyan-400">{agent.phase}</span>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 text-fg3 hover:text-fg rounded-lg hover:bg-ink/[0.08]"
            >
              <X size={18} />
            </button>
          </div>

          {/* Status badge & Stage */}
          <div className="flex items-center gap-3">
            <div className="px-3 py-1 bg-emerald-950/40 border border-emerald-500/30 rounded-full text-xs font-semibold text-emerald-400 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>Status: {agent.status || 'ACTIVE'}</span>
            </div>
            <span className="px-3 py-1 bg-ink/[0.04] border border-ink/[0.08] rounded-full text-xs text-fg2 font-mono">
              {agent.stage || 'Pipeline Stage'}
            </span>
          </div>

          {/* Purpose & Description */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-fg3 uppercase tracking-wider">
              Agent Purpose & Logic
            </h4>
            <p className="text-xs text-fg2 leading-relaxed bg-inset p-3.5 rounded-xl border border-ink/[0.06]">
              {agent.details || agent.desc}
            </p>
          </div>

          {/* Connected MCP Tools */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-fg3 uppercase tracking-wider">
              Connected MCP Tools ({agent.toolsCount || 3})
            </h4>
            <div className="grid grid-cols-1 gap-2">
              <div className="p-3 bg-inset border border-ink/[0.06] rounded-xl flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs text-fg2 font-mono">
                  <Zap size={14} className="text-cyan-400" />
                  <span>mcp_server_satellite_query</span>
                </div>
                <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                  Ready
                </span>
              </div>
              <div className="p-3 bg-inset border border-ink/[0.06] rounded-xl flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs text-fg2 font-mono">
                  <Zap size={14} className="text-cyan-400" />
                  <span>mcp_servicenow_cmdb_sync</span>
                </div>
                <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                  Ready
                </span>
              </div>
              <div className="p-3 bg-inset border border-ink/[0.06] rounded-xl flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs text-fg2 font-mono">
                  <Zap size={14} className="text-cyan-400" />
                  <span>mcp_milvus_vector_retrieval</span>
                </div>
                <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                  Ready
                </span>
              </div>
            </div>
          </div>

          {/* Live Execution Logs */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-fg3 uppercase tracking-wider flex items-center gap-2">
              <Terminal size={14} className="text-cyan-400" />
              <span>Real-Time Execution Trace</span>
            </h4>
            <div className="p-3 bg-black/80 font-mono text-[11px] text-emerald-400/90 rounded-xl border border-ink/[0.08] space-y-1.5 leading-relaxed overflow-x-auto">
              <div>[00:00:01] Initializing agent context with tenant ID: Wipro-Primary</div>
              <div>[00:00:02] Querying N-1 baseline catalog from Satellite / WSUS repository</div>
              <div>[00:00:04] 1,098 applicable advisories mapped across {MANAGED_HOSTS} managed hosts</div>
              <div className="text-cyan-300">[00:00:05] Memory snapshot written to Milvus cluster (vector dimension: 1536)</div>
              <div className="text-fg3">[00:00:06] Awaiting next wave trigger event...</div>
            </div>
          </div>
        </div>

        {/* Bottom Actions */}
        <div className="pt-6 border-t border-ink/[0.08] flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-fg2 hover:bg-ink/[0.08] rounded-xl transition-all"
          >
            Close
          </button>
          <button
            onClick={() => {
              alert(`Manually invoking ${agent.name}...`);
              onClose();
            }}
            className="px-4 py-2 text-xs font-bold text-onbright bg-cyan-400 hover:bg-cyan-300 rounded-xl shadow-lg shadow-cyan-500/20 transition-all"
          >
            Invoke Agent Now
          </button>
        </div>
      </div>
    </div>
  );
}
