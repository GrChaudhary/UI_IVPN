import React, { useState } from 'react';
import { FlaskConical, Play, Terminal, Code, Search, CheckCircle2 } from 'lucide-react';

export default function RemediationScripts() {
  const [search, setSearch] = useState('');

  const scripts = [
    { id: 'scr-1', name: 'clean_yum_lock_and_cache.sh', target: 'RHEL 8/9', runtime: 'Bash / Root', status: 'Verified', desc: 'Kills hanging yum/dnf lock processes, removes stale pidfiles, cleans yum cache and metadata.' },
    { id: 'scr-2', name: 'win_clear_software_distribution.ps1', target: 'Windows Server', runtime: 'PowerShell 5.1+', status: 'Verified', desc: 'Stops wuauserv service, renames SoftwareDistribution folder, resets BITS queue and restarts update daemon.' },
    { id: 'scr-3', name: 'oracle_asm_rebalance_precheck.sql', target: 'Oracle DB', runtime: 'SQL*Plus', status: 'Verified', desc: 'Verifies ASM disk group balance and waits for active sync jobs before instance bounce.' },
    { id: 'scr-4', name: 'extend_root_lvm_disk.sh', target: 'Linux LVM', runtime: 'Bash', status: 'Verified', desc: 'Auto-extends /var and / filesystem when free capacity falls below 20% pre-patch threshold.' },
  ];

  return (
    <div className="p-6 space-y-6 w-full max-w-[1600px] mx-auto animate-in fade-in">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-fg tracking-tight flex items-center gap-2">
            <FlaskConical className="text-cyan-400" />
            <span>Remediation Scripts & Auto-Fix Registry</span>
          </h2>
          <p className="text-xs text-fg3 mt-1">
            Automated scripts executed by `auto-remediation-agent` to unblock host pre-checks automatically.
          </p>
        </div>

        <div className="relative w-full sm:w-72">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-fg3" />
          <input
            type="text"
            placeholder="Search scripts..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-inset border border-ink/[0.08] rounded-xl pl-8 pr-3 py-1.5 text-xs text-fg placeholder-fg4 focus:outline-none focus:border-cyan-500"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {scripts.map((scr) => (
          <div
            key={scr.id}
            className="nexus-card p-5 space-y-3 hover:border-cyan-500/40 transition-all cursor-pointer group"
            onClick={() => alert(`Running pre-flight dry-run of ${scr.name}`)}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Code size={16} className="text-cyan-400" />
                <span className="text-xs font-bold text-fg font-mono group-hover:text-cyan-300">
                  {scr.name}
                </span>
              </div>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-semibold">
                ✓ {scr.status}
              </span>
            </div>

            <p className="text-xs text-fg3 leading-relaxed">
              {scr.desc}
            </p>

            <div className="pt-3 border-t border-ink/[0.06] flex items-center justify-between text-[11px] font-mono text-fg3">
              <span>Target: {scr.target}</span>
              <span>Runtime: {scr.runtime}</span>
              <button className="flex items-center gap-1 text-cyan-400 font-sans font-semibold">
                <Play size={12} />
                <span>Run Script</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
