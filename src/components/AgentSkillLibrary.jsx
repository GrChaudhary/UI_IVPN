import React, { useState } from 'react';
import { Sparkles, Play, Search, Code, CheckCircle, Zap } from 'lucide-react';

export default function AgentSkillLibrary() {
  const [search, setSearch] = useState('');

  const skills = [
    { id: 'sk-1', name: 'kernel-livepatch-verifier', category: 'Linux Kernel', version: 'v1.4', author: 'Wipro Platform Core', desc: 'Validates kpatch/livepatch state without requiring OS reboot on RHEL/Oracle Linux clusters.', invocations: 142 },
    { id: 'sk-2', name: 'wsus-advisory-catalog-sync', category: 'Windows Server', version: 'v2.1', author: 'Agentic Nexus', desc: 'Synchronizes and categorizes monthly Cumulative Update KBs across Windows Server 2019/2022.', invocations: 388 },
    { id: 'sk-3', name: 'vmware-snapshot-lifecycle', category: 'Hypervisor', version: 'v1.0', author: 'Infrastructure Agent', desc: 'Creates quiesced VM snapshots and schedules automatic TTL deletion after post-validation pass.', invocations: 94 },
    { id: 'sk-4', name: 'cohesity-protection-trigger', category: 'Backup & Recovery', version: 'v1.2', author: 'Backup Nexus', desc: 'Executes out-of-band backup jobs in Cohesity DataProtect prior to critical database wave patches.', invocations: 56 },
    { id: 'sk-5', name: 'servicenow-pir-generator', category: 'ITSM', version: 'v2.0', author: 'CR Lifecycle Agent', desc: 'Auto-generates Post Implementation Review (PIR) logs and closes ServiceNow Change Requests.', invocations: 230 },
    { id: 'sk-6', name: 'milvus-incident-indexer', category: 'Vector Memory', version: 'v3.0', author: 'Semantic Agent', desc: 'Embeds post-mortem logs and generates high-dimensional embeddings for incident retrieval.', invocations: 512 },
  ];

  const filtered = skills.filter((s) => s.name.toLowerCase().includes(search.toLowerCase()) || s.category.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-6 w-full animate-in fade-in">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-fg tracking-tight flex items-center gap-2">
            <Sparkles className="text-cyan-400" />
            <span>Agent Skill Library</span>
          </h2>
          <p className="text-xs text-fg3 mt-1">
            Modular reusable agent capabilities, reasoning protocols, and deterministic MCP skills.
          </p>
        </div>

        <div className="relative w-full sm:w-72">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-fg3" />
          <input
            type="text"
            placeholder="Search skills..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-inset border border-ink/[0.08] rounded-xl pl-8 pr-3 py-1.5 text-xs text-fg placeholder-fg4 focus:outline-none focus:border-cyan-500"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((sk) => (
          <div
            key={sk.id}
            className="nexus-card p-5 flex flex-col justify-between hover:border-cyan-500/40 transition-all group cursor-pointer"
            onClick={() => alert(`Testing skill invocation: ${sk.name}`)}
          >
            <div>
              <div className="flex items-center justify-between gap-2 mb-2">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono bg-cyan-950/60 text-cyan-300 border border-cyan-500/30">
                  {sk.category}
                </span>
                <span className="text-[10px] font-mono text-fg4">{sk.version}</span>
              </div>
              <h3 className="text-xs font-bold text-fg group-hover:text-cyan-300 font-mono transition-colors">
                {sk.name}
              </h3>
              <p className="text-xs text-fg3 mt-2 leading-relaxed">
                {sk.desc}
              </p>
            </div>

            <div className="pt-4 mt-4 border-t border-ink/[0.06] flex items-center justify-between text-xs">
              <span className="text-[10px] text-fg4 font-mono">
                ⚡ {sk.invocations} runs
              </span>
              <button className="flex items-center gap-1.5 text-cyan-400 font-semibold group-hover:text-cyan-300 text-xs">
                <Play size={12} />
                <span>Test Skill</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
