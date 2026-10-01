import React, { useState } from 'react';
import {
  LayoutDashboard,
  Calendar,
  Cpu,
  FlaskConical,
  ShieldCheck,
  ShieldAlert,
  Lock,
  Users,
  Database,
  History,
  MessageSquare,
  Plug,
  Wrench,
  Plus,
  ChevronDown,
} from 'lucide-react';

export default function Sidebar({
  activeTab,
  setActiveTab,
  isCollapsed,
}) {
  // Collapsed section titles persist across reloads
  const [closed, setClosed] = useState(() => {
    try { return JSON.parse(localStorage.getItem('nexus.sidebar.closed') || '[]'); } catch { return []; }
  });
  const toggleSection = (title) =>
    setClosed((prev) => {
      const next = prev.includes(title) ? prev.filter((t) => t !== title) : [...prev, title];
      try { localStorage.setItem('nexus.sidebar.closed', JSON.stringify(next)); } catch { /* storage unavailable */ }
      return next;
    });

  const navSections = [
    {
      title: 'OVERVIEW',
      color: '#00f2fe',
      items: [
        { id: 'central-dashboard', label: 'Central Dashboard', icon: LayoutDashboard },
      ],
    },
    {
      title: 'EXECUTION',
      color: '#f59e0b',
      items: [
        { id: 'schedule-overview', label: 'Patch Window Planner', icon: Calendar },
      ],
    },
    {
      title: 'AGENTS',
      color: '#a855f7',
      items: [
        { id: 'agent-registry', label: 'Agent Registry', icon: Cpu },
        { id: 'remediation-scripts', label: 'Remediation Scripts', icon: FlaskConical },
      ],
    },
    {
      title: 'GOVERNANCE',
      color: '#10b981',
      items: [
        { id: 'compliance-management', label: 'Compliance Management', icon: ShieldCheck },
        { id: 'vulnerability-mgmt', label: 'Vulnerability Mgmt', icon: ShieldAlert },
        { id: 'access-control', label: 'Access Control', icon: Lock },
        { id: 'user-management', label: 'User Management', icon: Users },
      ],
    },
    {
      title: 'DATA & TOOLS',
      color: '#6366f1',
      items: [
        { id: 'cmdb-management', label: 'CMDB Management', icon: Database },
        { id: 'history', label: 'History', icon: History },
        { id: 'chat', label: 'Chat Copilot', icon: MessageSquare },
      ],
    },
    {
      title: 'INTEGRATIONS',
      color: '#ec4899',
      items: [
        { id: 'connector-marketplace', label: 'Connector Marketplace', icon: Plug },
        { id: 'tool-registration', label: 'Tool Registration', icon: Wrench },
      ],
    },
  ];

  return (
    <aside
      className={`fixed top-16 left-0 bottom-0 z-40 flex flex-col bg-transparent transition-all duration-300 overflow-hidden select-none ${
        isCollapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* 1. TOP QUICK ACTION (Gmail Compose-Style Pill Button) */}
      <div className="px-3 pt-3 pb-2 flex-shrink-0">
        {!isCollapsed ? (
          <button
            onClick={() => setActiveTab('on-demand-execution')}
            className="flex items-center gap-3 py-3 px-5 rounded-2xl text-xs font-bold text-fg bg-gradient-to-r from-cyan-500/30 via-indigo-500/25 to-cyan-500/20 hover:from-cyan-400 hover:to-blue-500 hover:text-onbright border border-cyan-400/40 hover:border-transparent shadow-[0_4px_20px_rgba(0,242,254,0.18)] hover:shadow-[0_6px_25px_rgba(0,242,254,0.4)] transition-all duration-200 active:scale-[0.97] group"
          >
            <div className="w-5 h-5 rounded-lg bg-cyan-400/20 group-hover:bg-black/20 flex items-center justify-center text-cyan-300 group-hover:text-black transition-colors">
              <Plus size={14} className="stroke-[3]" />
            </div>
            <span className="tracking-wide text-sm font-semibold">
              On Demand Execution
            </span>
          </button>
        ) : (
          <button
            onClick={() => setActiveTab('on-demand-execution')}
            className="w-12 h-12 mx-auto flex items-center justify-center rounded-2xl bg-cyan-500/25 hover:bg-cyan-400 hover:text-black border border-cyan-400/40 text-cyan-300 shadow-lg shadow-cyan-500/20 transition-all active:scale-95"
            title="On Demand Execution"
          >
            <Plus size={20} className="stroke-[3]" />
          </button>
        )}
      </div>

      {/* 2. NAVIGATION LIST (Part of ambient background canvas) */}
      <div className="flex-1 overflow-y-auto px-3 py-1 space-y-3.5 custom-scrollbar">
        {navSections.map((section, idx) => (
          <div key={idx} className="space-y-0.5">
            {!isCollapsed && (
              <button
                onClick={() => toggleSection(section.title)}
                aria-expanded={!closed.includes(section.title)}
                className="w-full px-3 py-1 flex items-center justify-between text-[10px] font-bold tracking-wider uppercase rounded-lg hover:bg-ink/[0.04] group/sec"
              >
                <span className="flex items-center gap-1.5 text-fg3 font-semibold tracking-wider group-hover/sec:text-fg2">
                  <ChevronDown size={11} className={`transition-transform ${closed.includes(section.title) ? '-rotate-90' : ''}`} />
                  {section.title}
                </span>
                <span
                  className="w-1.5 h-1.5 rounded-full opacity-60"
                  style={{ backgroundColor: section.color, boxShadow: `0 0 6px ${section.color}` }}
                />
              </button>
            )}
            <div className="space-y-0.5">
              {section.items
                .filter((item) => isCollapsed || !closed.includes(section.title) || item.id === activeTab)
                .map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`w-full flex items-center gap-3.5 px-3 py-2 rounded-2xl text-[13px] font-medium transition-all duration-150 active:scale-[0.98] group relative ${
                      isActive
                        ? 'bg-cyan-500/15 text-cyan-300 font-semibold border border-cyan-400/40 shadow-[0_0_18px_rgba(0,242,254,0.18)]'
                        : 'text-fg3 hover:text-fg hover:bg-ink/[0.06] border border-transparent'
                    } ${isCollapsed ? 'justify-center px-0' : ''}`}
                    title={isCollapsed ? item.label : undefined}
                  >
                    <Icon
                      size={18}
                      className={`transition-colors ${
                        isActive
                          ? 'text-cyan-400 drop-shadow-[0_0_6px_rgba(0,242,254,0.6)]'
                          : 'text-fg3 group-hover:text-fg2'
                      }`}
                    />
                    {!isCollapsed && (
                      <span className="flex-1 text-left truncate">{item.label}</span>
                    )}
                    {!isCollapsed && item.badge && (
                      <span
                        className={`text-[9px] font-bold uppercase px-1.5 py-0.5 rounded-full tracking-wide ${
                          item.badge === 'AI'
                            ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-[0_0_8px_rgba(0,242,254,0.25)]'
                            : 'bg-ink/[0.06] text-fg3 border border-ink/[0.08]'
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </aside>
  );
}
