import React, { useState } from 'react';
import {
  Wrench,
  Plus,
  RefreshCw,
  CheckCircle,
  AlertCircle,
  Clock,
  Server,
  Key,
  Shield,
  Zap,
} from 'lucide-react';
import Select from './ui/Select';
import Orb from './ui/Orb';

const REGISTERED_TOOLS = [
  { name: 'api-smoke-test', cat: 'Other', type: 'API', ip: 'api_smoke_test', status: 'Pending', statusColor: 'bg-amber-500/20 text-amber-300 border-amber-500/30', tested: 'Never' },
  { name: 'WebLogic', cat: 'Other', type: 'API', ip: 'orchestrator:8000', status: 'Unreachable', statusColor: 'bg-rose-500/20 text-rose-300 border-rose-500/30', tested: '8/18/2026, 6:00:19 PM' },
  { name: 'Active Directory SGX', cat: 'Identity & Secrets', type: 'WINRM', ip: '172.17.65.134:389', status: 'Active', statusColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30', tested: '8/18/2026, 1:50:28 PM' },
  { name: 'Active Directory', cat: 'Identity & Secrets', type: 'WINRM', ip: '172.17.254.140:389', status: 'Active', statusColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30', tested: '8/18/2026, 1:05:36 PM' },
  { name: 'WebLogic PCDK', cat: 'Patch Sources', type: 'PCDK', ip: 'pcdk-auto', status: 'Active', statusColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30', tested: 'Never' },
  { name: 'Qualys MCP Server', cat: 'Vulnerability Scanners', type: 'MCP', ip: 'http://172.17.85.100:8001', status: 'Active', statusColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30', tested: '8/13/2026, 11:39:21 AM' },
  { name: 'oracle', cat: 'Patch Sources', type: 'LOCAL_REPO', ip: '172.17.90.104:80', status: 'Active', statusColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30', tested: '7/29/2026, 12:44:40 AM' },
  { name: 'Openvas mcp server', cat: 'Vulnerability Scanners', type: 'MCP', ip: 'http://172.17.80.206:8000', status: 'Active', statusColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30', tested: '7/27/2026, 9:41:01 PM' },
  { name: 'Tenable Nessus MCP', cat: 'Vulnerability Scanners', type: 'MCP', ip: 'http://172.17.85.100:8000', status: 'Active', statusColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30', tested: '7/27/2026, 7:31:10 PM' },
  { name: 'WSUS', cat: 'Patch Sources', type: 'API', ip: '172.17.74.91', status: 'Active', statusColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30', tested: '7/27/2026, 5:52:34 PM' },
  { name: 'MECM', cat: 'Patch Sources', type: 'API', ip: '172.17.66.151', status: 'Active', statusColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30', tested: '7/27/2026, 5:50:20 PM' },
  { name: 'Rookie Vcenter', cat: 'Infra & Backup', type: 'API', ip: '172.17.168.212', status: 'Active', statusColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30', tested: '8/17/2026, 3:26:36 PM' },
  { name: 'Prod Vcenter', cat: 'Infra & Backup', type: 'API', ip: '172.17.101.15', status: 'Active', statusColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30', tested: '8/17/2026, 3:25:28 PM' },
  { name: 'Redhat Satellite Server', cat: 'Patch Sources', type: 'API', ip: '172.17.65.179:443', status: 'Active', statusColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30', tested: '8/17/2026, 3:24:22 PM' },
  { name: 'Hashicorp Vault', cat: 'Identity & Secrets', type: 'API', ip: '172.17.74.72:8200', status: 'Active', statusColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30', tested: '7/27/2026, 5:42:21 PM' },
  { name: 'cohesity', cat: 'Infra & Backup', type: 'API', ip: '172.17.70.15:443', status: 'Active', statusColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30', tested: '7/27/2026, 4:20:04 PM' },
  { name: 'Service Now UAT', cat: 'ITSM', type: 'API', ip: 'https://blecoe.service-now.com', status: 'Active', statusColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30', tested: '8/11/2026, 8:02:38 PM' },
  { name: 'Tenable Nessus Essential', cat: 'Vulnerability Scanners', type: 'API', ip: '172.17.73.82:8834', status: 'Active', statusColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30', tested: '7/27/2026, 4:09:20 PM' },
  { name: 'Openvas', cat: 'Vulnerability Scanners', type: 'API', ip: '172.17.77.175:443', status: 'Active', statusColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30', tested: '7/27/2026, 4:04:27 PM' },
];

const TABS = ['All', 'Vulnerability Scanners', 'Patch Sources', 'Infra & Backup', 'Identity & Secrets', 'ITSM', 'Other'];
const STATUS_ORB = { Active: '#10b981', Pending: '#f59e0b', Unreachable: '#f43f5e' };

export default function ToolRegistration() {
  const [toolName, setToolName] = useState('');
  const [connType, setConnType] = useState('Generic / TCP');
  const [hostIp, setHostIp] = useState('');
  const [tab, setTab] = useState('All');
  const [query, setQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('All types');
  const [statusFilter, setStatusFilter] = useState('All statuses');

  const types = ['All types', ...new Set(REGISTERED_TOOLS.map((t) => t.type))];
  const inTab = (t) => tab === 'All' || t.cat === tab;
  const visibleTools = REGISTERED_TOOLS.filter(
    (t) =>
      inTab(t) &&
      (typeFilter === 'All types' || t.type === typeFilter) &&
      (statusFilter === 'All statuses' || t.status === statusFilter) &&
      `${t.name} ${t.ip}`.toLowerCase().includes(query.toLowerCase()),
  );


  return (
    <div className="p-6 space-y-6 w-full max-w-[1700px] mx-auto animate-in fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Wrench size={16} className="text-cyan-400" />
          <h2 className="text-xs font-bold uppercase tracking-wider text-fg3 font-mono">
            {REGISTERED_TOOLS.length} registered
          </h2>
        </div>
        <button
          onClick={() => alert('Refreshing tool health status')}
          className="flex items-center gap-1.5 px-3 py-1 bg-ink/[0.04] hover:bg-ink/[0.08] border border-ink/[0.08] rounded-full text-xs text-fg2 transition-all"
        >
          <RefreshCw size={12} />
          <span>Refresh</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (4 cols): Register New Tool Form */}
        <div className="lg:col-span-4 nexus-card p-5 space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-fg2">
            Register New Tool
          </h3>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-fg3">Technology Name</label>
            <input
              type="text"
              placeholder="e.g. OpenVAS, Cohesity, Palo Alto..."
              value={toolName}
              onChange={(e) => setToolName(e.target.value)}
              className="w-full bg-inset border border-ink/[0.08] rounded-xl px-3 py-2 text-xs text-fg focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-fg3">Connection Type</label>
            <Select value={connType} onValueChange={setConnType} options={["Generic / TCP", "REST API / HTTPS", "SSH / WinRM", "Model Context Protocol (MCP)"]} className="w-full" />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-fg3">Host / IP / FQDN / URL</label>
            <input
              type="text"
              placeholder="172.17.77.175 or https://api.corp.local"
              value={hostIp}
              onChange={(e) => setHostIp(e.target.value)}
              className="w-full bg-inset border border-ink/[0.08] rounded-xl px-3 py-2 text-xs text-fg font-mono focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-[11px] font-medium text-fg3">Username</label>
              <input
                type="text"
                defaultValue="admin"
                className="w-full bg-inset border border-ink/[0.08] rounded-xl px-3 py-1.5 text-xs text-fg"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[11px] font-medium text-fg3">Port (opt.)</label>
              <input
                type="text"
                defaultValue="443"
                className="w-full bg-inset border border-ink/[0.08] rounded-xl px-3 py-1.5 text-xs text-fg font-mono"
              />
            </div>
          </div>

          <div className="pt-2 flex items-center gap-2">
            <button
              type="button"
              onClick={() => alert('Testing connection... Ping response 24ms (OK)')}
              className="flex-1 py-2 bg-ink/[0.04] hover:bg-ink/[0.08] border border-ink/[0.08] text-xs font-semibold text-fg2 rounded-xl"
            >
              ⚡ Test Connection
            </button>
            <button
              type="button"
              onClick={() => alert('Tool registered successfully!')}
              className="flex-1 py-2 bg-cyan-400 hover:bg-cyan-300 text-onbright text-xs font-bold rounded-xl shadow-lg shadow-cyan-500/20"
            >
              ✓ Save & Register
            </button>
          </div>
        </div>

        {/* Right Column (8 cols): registered tools, tabbed by function */}
        <div className="lg:col-span-8 space-y-3 min-w-0">
          <div className="flex flex-wrap items-center gap-1.5">
            {TABS.map((name) => {
              const count = REGISTERED_TOOLS.filter((t) => name === 'All' || t.cat === name).length;
              return (
                <button
                  key={name}
                  onClick={() => setTab(name)}
                  className={`px-3 py-1 rounded-full text-[11px] font-semibold transition-all ${tab === name ? 'pill-tab-active' : 'text-fg3 hover:text-fg border border-ink/[0.08]'}`}
                >
                  {name} <span className="font-mono opacity-60">{count}</span>
                </button>
              );
            })}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <input
              type="text"
              placeholder="Filter by name or host…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="flex-1 min-w-[180px] bg-surface border border-ink/[0.08] rounded-full px-3.5 py-1.5 text-xs text-fg placeholder-fg4 focus:outline-none focus:border-cyan-500/50"
            />
            <Select value={typeFilter} onValueChange={setTypeFilter} options={types} className="w-36" />
            <Select value={statusFilter} onValueChange={setStatusFilter} options={['All statuses', 'Active', 'Pending', 'Unreachable']} className="w-40" />
            <span className="text-[11px] font-mono text-fg3 whitespace-nowrap">{visibleTools.length} of {REGISTERED_TOOLS.length}</span>
          </div>

          <div className="grid grid-cols-[repeat(auto-fill,minmax(240px,1fr))] gap-3">
            {visibleTools.map((t) => (
              <div
                key={t.name}
                className="p-3 rounded-xl bg-surface border border-ink/[0.06] hover:border-cyan-500/40 transition-all space-y-2 group cursor-pointer"
                onClick={() => alert(`Inspecting tool: ${t.name}`)}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <Orb color={STATUS_ORB[t.status]} size={28} pulse={t.status === 'Active'} delay={t.name.length % 5}>
                      <Zap size={11} />
                    </Orb>
                    <div className="min-w-0">
                      <div className="text-xs font-bold text-fg group-hover:text-cyan-300 transition-colors truncate">{t.name}</div>
                      <div className="text-[10px] text-fg3 font-mono">{t.type}</div>
                    </div>
                  </div>
                  <span className={`px-2 py-0.5 rounded text-[9px] font-bold border flex-shrink-0 ${t.statusColor}`}>{t.status}</span>
                </div>

                <div className="text-[11px] font-mono text-fg2 truncate bg-inset px-2 py-1 rounded border border-ink/[0.04]">{t.ip}</div>
                <div className="text-[10px] text-fg4 font-mono">Tested: {t.tested}</div>
              </div>
            ))}
            {!visibleTools.length && <p className="col-span-full text-xs text-fg3 py-8 text-center">No tools match these filters.</p>}
          </div>
        </div>
      </div>
    </div>
  );
}
