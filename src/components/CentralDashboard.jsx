import React, { useState } from 'react';
import { Bar } from 'react-chartjs-2';
import { useTheme } from '../useTheme';
import SystemCapacity from './SystemCapacity';
import TechFleetWidget from './TechFleetWidget';
import { Globe, Server, Layers, HardDrive, Cpu } from 'lucide-react';

const KPI_ICONS = {
  'patch-runs': Activity, platforms: Globe, 'hosts-managed': Server, 'patches-found': Layers,
  'infra-devices': HardDrive, 'agents-online': Cpu, 'sanity-pass': CheckCircle2,
};
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip as ChartTooltip,
  Legend as ChartLegend,
} from 'chart.js';
import {
  EXEC_ACTIVITY_DATA,
  EXEC_ACTIVITY_OPTIONS,
  MONTHLY_DATA,
  MONTHLY_OPTIONS,
  themedOptions,
} from '../simulation/simulationData';
import {
  NEXUS_KPIS,
  ATTENTION_ITEMS,
  ACTIVE_CAMPAIGNS,
  EXECUTION_RUNS,
  AI_INSIGHTS,
} from '../data/nexusData';

import {
  Zap,
  TrendingUp,
  Sparkles,
  ExternalLink,
  ChevronRight,
  ShieldAlert,
  AlertCircle,
  Activity,
  CheckCircle2,
} from 'lucide-react';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  ChartTooltip,
  ChartLegend
);


export default function CentralDashboard({
  onNavigateTab,
  onSelectItem,
  showLiveRuns = true,
}) {
  const [selectedAttention, setSelectedAttention] = useState(null);
  const theme = useTheme();

  return (
    <div className="p-6 space-y-6 w-full animate-in fade-in">
      {/* 1. TOP KPI STAT CARDS ROW (7 Cards with Magnifying Lens Effect) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-3.5">
        {NEXUS_KPIS.map((kpi) => (
          <div
            key={kpi.id}
            className="nexus-widget-magnify p-4 flex flex-col justify-between cursor-pointer group select-none"
            onClick={() => onSelectItem && onSelectItem(kpi)}
          >
            {KPI_ICONS[kpi.id] && (() => {
              const Icon = KPI_ICONS[kpi.id];
              return <Icon aria-hidden strokeWidth={1.25} className="absolute -top-1 -right-2 w-20 h-20 pointer-events-none opacity-[0.14]" style={{ color: kpi.color }} />;
            })()}
            <div className="relative text-[11px] font-bold tracking-wider text-fg3 uppercase">
              {kpi.label}
            </div>
            <div className="my-2 magnify-zoom-target">
              <span
                className="text-2xl lg:text-3xl font-extrabold tracking-tight transition-all duration-300 group-hover:drop-shadow-[0_0_12px_rgba(0,242,254,0.4)]"
                style={{ color: kpi.color }}
              >
                {kpi.value}
              </span>
            </div>
            <div className="text-[11px] font-medium text-fg3 truncate group-hover:text-fg2 transition-colors">
              {kpi.subtext}
            </div>
          </div>
        ))}
      </div>

      <SystemCapacity onNavigateTab={onNavigateTab} />

      {/* 2. MIDDLE ROW: REQUIRES ATTENTION (Left) & AI INSIGHTS (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* REQUIRES ATTENTION (4 cols) */}
        <div className="lg:col-span-4 space-y-2.5">
          <div className="flex items-center gap-2">
            <span className="w-1 h-3.5 bg-red-500 rounded-full"></span>
            <h2 className="text-xs font-bold uppercase tracking-wider text-red-400">
              Requires Attention
            </h2>
          </div>

          <div className="space-y-2">
            {ATTENTION_ITEMS.map((item) => (
              <div
                key={item.id}
                onClick={() => setSelectedAttention(item)}
                className="nexus-card p-3 flex items-start justify-between gap-3 cursor-pointer group hover:scale-[1.01] hover:border-red-500/40 transition-all"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-[9px] font-bold uppercase px-1.5 py-0.5 rounded tracking-wide ${
                        item.severity === 'CRITICAL'
                          ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                          : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                      }`}
                    >
                      {item.severity}
                    </span>
                    <span className="text-xs font-semibold text-fg2 group-hover:text-cyan-300 transition-colors">
                      {item.title}
                    </span>
                  </div>
                  <p className="text-[11px] text-fg3 leading-snug">
                    {item.desc}
                  </p>
                </div>
                <button
                  className="text-xs text-cyan-400 font-semibold opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap self-center"
                >
                  Inspect →
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* AI & AUTOMATION INSIGHTS (8 cols) */}
        <div className="lg:col-span-8 flex flex-col gap-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-1 h-3.5 bg-cyan-400 rounded-full shadow-[0_0_8px_#00f2fe]"></span>
              <h2 className="text-xs font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-1.5">
                <Sparkles size={13} />
                <span>AI & Automation Insights</span>
              </h2>
            </div>
            <span className="text-[11px] text-fg3 font-mono">
              Live Copilot Feedback (3 Active)
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 flex-1">
            {AI_INSIGHTS.map((insight) => (
              <div
                key={insight.id}
                className="nexus-card p-4 flex flex-col justify-between hover:scale-[1.02] hover:border-cyan-500/40 transition-all group"
              >
                <div>
                  <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-fg3">
                    <span className="text-cyan-300 flex items-center gap-1 font-mono">
                      <Sparkles size={11} /> {insight.agentName}
                    </span>
                    <span className="font-mono text-[9px] text-fg4">
                      {insight.reference}
                    </span>
                  </div>
                  <p className="text-[11px] text-fg2 mt-2 leading-relaxed">
                    {insight.text}
                  </p>
                </div>
                <div className="pt-3 mt-2 border-t border-ink/[0.06] flex items-center justify-between">
                  <span className="text-[10px] text-fg4 font-mono">
                    Agent Intelligence
                  </span>
                  <button
                    onClick={() => onNavigateTab && onNavigateTab('chat')}
                    className="text-[11px] font-semibold text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
                  >
                    <span>Remediate with Copilot</span>
                    <ChevronRight size={12} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 3. FOUR CORE WIDGETS WITH MAGNIFYING LENS EFFECT */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-1 h-3.5 bg-indigo-400 rounded-full shadow-[0_0_8px_#818cf8]"></span>
            <h2 className="text-xs font-bold uppercase tracking-wider text-fg2">
              Patch Run Overview & Metrics
            </h2>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: PATCH RUN OUTCOMES (Magnifying Donut) */}
          <div className="nexus-widget-magnify p-4 flex flex-col justify-between cursor-pointer group">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-fg2 uppercase tracking-wide group-hover:text-cyan-300 transition-colors">
                Patch Run Outcomes
              </span>
              <span className="text-[10px] font-mono text-fg4 group-hover:text-fg2">
                48 Total
              </span>
            </div>

            {/* Custom SVG Donut Chart with Magnifying Zoom Target */}
            <div className="relative flex items-center justify-center my-4">
              <div className="magnify-zoom-target flex items-center justify-center">
                <svg className="w-40 h-40 transform -rotate-90 drop-shadow-md group-hover:drop-shadow-[0_0_15px_rgba(249,115,22,0.3)] transition-all" viewBox="0 0 100 100">
                  {/* Background Ring */}
                  <circle
                    cx="50"
                    cy="50"
                    r="38"
                    className="stroke-slate-800"
                    strokeWidth="12"
                    fill="transparent"
                  />
                  {/* Warnings arc (84%) */}
                  <circle
                    cx="50"
                    cy="50"
                    r="38"
                    stroke="#f97316"
                    strokeWidth="12"
                    strokeDasharray="200.5 238.7"
                    strokeDashoffset="0"
                    strokeLinecap="round"
                    fill="transparent"
                    className="transition-all duration-500 ease-out group-hover:stroke-orange-400"
                  />
                  {/* Aborted arc (16%) */}
                  <circle
                    cx="50"
                    cy="50"
                    r="38"
                    stroke="#64748b"
                    strokeWidth="12"
                    strokeDasharray="38.2 238.7"
                    strokeDashoffset="-200.5"
                    strokeLinecap="round"
                    fill="transparent"
                    className="transition-all duration-500 ease-out group-hover:stroke-slate-400"
                  />
                </svg>
                <div className="absolute flex flex-col items-center justify-center text-center">
                  <span className="text-3xl font-extrabold text-fg tracking-tight group-hover:text-orange-400 group-hover:scale-110 transition-all duration-300 drop-shadow-md">
                    48
                  </span>
                  <span className="text-[11px] text-fg3 font-medium tracking-wider uppercase">
                    runs
                  </span>
                </div>
              </div>
            </div>

            {/* Legend */}
            <div className="space-y-1.5 text-xs pt-2 border-t border-ink/[0.06]">
              <div className="flex items-center justify-between p-1 rounded-lg group-hover:bg-ink/[0.03] transition-colors">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#f97316] shadow-[0_0_6px_#f97316]"></span>
                  <span className="text-fg2">Warnings</span>
                </div>
                <span className="font-semibold text-fg font-mono">37 (84%)</span>
              </div>
              <div className="flex items-center justify-between p-1 rounded-lg group-hover:bg-ink/[0.03] transition-colors">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#64748b]"></span>
                  <span className="text-fg2">Aborted</span>
                </div>
                <span className="font-semibold text-fg font-mono">7 (16%)</span>
              </div>
            </div>
          </div>

          {/* Card 2: INFRASTRUCTURE COMPLIANCE (Magnifying Multi-Donut) */}
          <div className="nexus-widget-magnify p-4 flex flex-col justify-between cursor-pointer group">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-fg2 uppercase tracking-wide group-hover:text-emerald-300 transition-colors">
                Infrastructure Compliance
              </span>
              <span className="text-[10px] font-mono text-emerald-400 font-semibold">
                N-0 Focus
              </span>
            </div>

            {/* Multi-segment Donut Chart with Magnifying Target */}
            <div className="relative flex items-center justify-center my-4">
              <div className="magnify-zoom-target flex items-center justify-center">
                <svg className="w-40 h-40 transform -rotate-90 drop-shadow-md group-hover:drop-shadow-[0_0_15px_rgba(16,185,129,0.3)] transition-all" viewBox="0 0 100 100">
                  <circle
                    cx="50"
                    cy="50"
                    r="38"
                    className="stroke-slate-800"
                    strokeWidth="12"
                    fill="transparent"
                  />
                  {/* Compliant: 33% */}
                  <circle
                    cx="50"
                    cy="50"
                    r="38"
                    stroke="#10b981"
                    strokeWidth="12"
                    strokeDasharray="78.8 238.7"
                    strokeDashoffset="0"
                    strokeLinecap="round"
                    fill="transparent"
                    className="transition-all duration-300 group-hover:stroke-emerald-300"
                  />
                  {/* N-1: 17% */}
                  <circle
                    cx="50"
                    cy="50"
                    r="38"
                    stroke="#eab308"
                    strokeWidth="12"
                    strokeDasharray="40.5 238.7"
                    strokeDashoffset="-78.8"
                    strokeLinecap="round"
                    fill="transparent"
                  />
                  {/* N-3: 6% */}
                  <circle
                    cx="50"
                    cy="50"
                    r="38"
                    stroke="#f97316"
                    strokeWidth="12"
                    strokeDasharray="14.3 238.7"
                    strokeDashoffset="-119.3"
                    strokeLinecap="round"
                    fill="transparent"
                  />
                  {/* Non-Compliant: 44% */}
                  <circle
                    cx="50"
                    cy="50"
                    r="38"
                    stroke="#ef4444"
                    strokeWidth="12"
                    strokeDasharray="105 238.7"
                    strokeDashoffset="-133.6"
                    strokeLinecap="round"
                    fill="transparent"
                  />
                </svg>
                <div className="absolute flex flex-col items-center justify-center text-center">
                  <span className="text-2xl font-extrabold text-fg tracking-tight group-hover:text-emerald-400 group-hover:scale-110 transition-all duration-300">
                    33.3%
                  </span>
                  <span className="text-[10px] text-fg3 font-medium uppercase tracking-wider">
                    compliant
                  </span>
                </div>
              </div>
            </div>

            {/* Legend */}
            <div className="space-y-1 text-xs pt-2 border-t border-ink/[0.06]">
              <div className="flex items-center justify-between p-0.5 rounded group-hover:bg-ink/[0.03]">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#10b981] shadow-[0_0_4px_#10b981]"></span>
                  <span className="text-fg2">Compliant</span>
                </div>
                <span className="font-semibold text-fg font-mono">6 (33%)</span>
              </div>
              <div className="flex items-center justify-between p-0.5 rounded group-hover:bg-ink/[0.03]">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#eab308]"></span>
                  <span className="text-fg2">N-1</span>
                </div>
                <span className="font-semibold text-fg font-mono">3 (17%)</span>
              </div>
              <div className="flex items-center justify-between p-0.5 rounded group-hover:bg-ink/[0.03]">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#f97316]"></span>
                  <span className="text-fg2">N-3</span>
                </div>
                <span className="font-semibold text-fg font-mono">1 (6%)</span>
              </div>
              <div className="flex items-center justify-between p-0.5 rounded group-hover:bg-ink/[0.03]">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#ef4444]"></span>
                  <span className="text-fg2">Non-Compliant</span>
                </div>
                <span className="font-semibold text-fg font-mono">8 (44%)</span>
              </div>
            </div>
          </div>

          {/* Card 3: COMPOSITE HEALTH SCORE (Magnifying Meter) */}
          <div className="nexus-widget-magnify p-4 flex flex-col justify-between cursor-pointer group">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-fg2 uppercase tracking-wide group-hover:text-amber-300 transition-colors">
                Composite Health Score
              </span>
              <span className="text-[10px] text-cyan-400 font-mono">
                Fleet Gauge
              </span>
            </div>

            <div className="flex flex-col items-center my-3 magnify-zoom-target">
              <span className="px-2.5 py-0.5 text-[11px] font-bold text-amber-300 bg-amber-950/60 border border-amber-500/30 rounded-full uppercase tracking-wider mb-1 shadow-sm">
                Fair
              </span>
              <span className="text-5xl font-extrabold text-fg tracking-tight group-hover:text-amber-300 transition-colors drop-shadow-md">
                57
              </span>
            </div>

            {/* Gradient Slider Meter with Interactive Magnifying Needle */}
            <div className="space-y-1 px-1">
              <div className="relative w-full h-2.5 rounded-full bg-gradient-to-r from-red-500 via-amber-400 to-emerald-500 shadow-inner">
                {/* Needle */}
                <div
                  className="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-white border-2 border-onbright rounded-full shadow-[0_0_10px_rgba(255,255,255,0.8)] gauge-marker group-hover:scale-125 transition-transform"
                  style={{ left: 'calc(57% - 8px)' }}
                ></div>
              </div>
              <div className="flex justify-between text-[10px] text-fg3 font-mono pt-0.5">
                <span>0</span>
                <span className="font-sans font-semibold text-fg2 text-[11px]">HEALTH SCORE</span>
                <span>100</span>
              </div>
            </div>

            {/* Breakdown Sub-bars */}
            <div className="space-y-2 pt-3 border-t border-ink/[0.06] text-xs">
              <div className="flex items-center justify-between">
                <span className="text-fg2 flex items-center gap-1">
                  <span className="text-emerald-400 font-bold">▶</span> Agents
                </span>
                <div className="flex items-center gap-2">
                  <div className="w-20 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-500 rounded-full w-full shadow-[0_0_6px_#10b981]"></div>
                  </div>
                  <span className="font-mono font-bold text-fg">100%</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-fg2 flex items-center gap-1">
                  <span className="text-red-400 font-bold">▶</span> Infra
                </span>
                <div className="flex items-center gap-2">
                  <div className="w-20 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-red-500 rounded-full w-[33%]"></div>
                  </div>
                  <span className="font-mono font-bold text-fg">33%</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-fg2 flex items-center gap-1">
                  <span className="text-orange-400 font-bold">▶</span> Runs
                </span>
                <div className="flex items-center gap-2">
                  <div className="w-20 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-orange-500 rounded-full w-[46%] shadow-[0_0_6px_#f97316]"></div>
                  </div>
                  <span className="font-mono font-bold text-fg">46%</span>
                </div>
              </div>
            </div>
          </div>

          {/* Card 4: EXECUTION ACTIVITY — 14D (react-chartjs-2 Bar) */}
          <div className="nexus-widget-magnify p-4 flex flex-col gap-3 cursor-pointer group">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-fg2 uppercase tracking-wide group-hover:text-cyan-300 transition-colors">
                Execution Activity — 14D
              </span>
              <span className="text-[10px] font-mono text-fg3">
                48 · 37w · 7e
              </span>
            </div>

            <div className="magnify-zoom-target flex-1" style={{ height: '140px' }}>
              <Bar data={EXEC_ACTIVITY_DATA} options={themedOptions(EXEC_ACTIVITY_OPTIONS, theme)} />
            </div>

            {/* Legend */}
            <div className="flex items-center justify-center gap-4 text-[11px] pt-2 border-t border-ink/[0.06]">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                <span className="text-fg3">Completed</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-orange-400"></span>
                <span className="text-fg3">Warnings</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-red-400"></span>
                <span className="text-fg3">Errors</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 3b. TECHNOLOGY FLEET HEALTH (filterable per tech) */}
      <TechFleetWidget />

      {/* 4. MONTHLY PATCH ACTIVITY — Full-Width Bar Chart */}
      <div className="nexus-widget-magnify p-5 flex flex-col gap-3 cursor-default">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-1 h-3.5 bg-sky-400 rounded-full shadow-[0_0_8px_#38bdf8]"></span>
            <h2 className="text-xs font-bold uppercase tracking-wider text-fg2">
              Monthly Patch Activity — 2025
            </h2>
          </div>
          <span className="text-[11px] font-mono text-fg3">Stacked by outcome</span>
        </div>
        <div className="magnify-zoom-target" style={{ height: '200px' }}>
          <Bar data={MONTHLY_DATA} options={themedOptions(MONTHLY_OPTIONS, theme)} />
        </div>
      </div>

      {/* 5. ACTIVE CAMPAIGNS & LIVE EXECUTION RUNS (Bottom 2-column Grid) */}
      <div className={`grid grid-cols-1 ${showLiveRuns ? 'lg:grid-cols-2' : ''} gap-5 pt-2`}>
        {/* Active Patch Campaigns */}
        <div className="space-y-2.5">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-bold uppercase tracking-wider text-fg2">
              Active Patch Campaigns
            </h2>
            <button
              onClick={() => onNavigateTab && onNavigateTab('schedule-overview')}
              className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center gap-1 font-semibold"
            >
              <span>View All</span>
              <ExternalLink size={12} />
            </button>
          </div>

          <div className="nexus-card overflow-hidden">
            <div className="divide-y divide-ink/[0.06]">
              {ACTIVE_CAMPAIGNS.map((c) => (
                <div
                  key={c.id}
                  className="p-3.5 flex items-center justify-between hover:bg-ink/[0.03] transition-colors"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-fg">{c.name}</span>
                      <span className="text-[10px] text-cyan-400 font-mono bg-cyan-950/60 px-1.5 py-0.5 rounded border border-cyan-500/20">
                        {c.phase}
                      </span>
                    </div>
                    <div className="text-[11px] text-fg3 font-mono">
                      Target: {c.nodes} Nodes · Agent: {c.agent}
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-1">
                    <span
                      className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded-full ${
                        c.status === 'RUNNING'
                          ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 animate-pulse'
                          : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      }`}
                    >
                      {c.status}
                    </span>
                    <span className="text-[10px] text-fg4 font-mono">{c.schedule}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Live Execution Runs Stream (toggle: Settings → Activity stream) */}
        {showLiveRuns && <div className="space-y-2.5">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-bold uppercase tracking-wider text-fg2">
              Live Execution Runs
            </h2>
            <button
              onClick={() => onNavigateTab && onNavigateTab('history')}
              className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center gap-1 font-semibold"
            >
              <span>Full History</span>
              <ExternalLink size={12} />
            </button>
          </div>

          <div className="nexus-card overflow-hidden">
            <div className="divide-y divide-ink/[0.06]">
              {EXECUTION_RUNS.slice(0, 3).map((r) => (
                <div
                  key={r.id}
                  className="p-3.5 flex items-center justify-between hover:bg-ink/[0.03] transition-colors"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-fg">{r.name}</span>
                      <span className="text-[10px] font-mono text-fg3">
                        {r.duration}
                      </span>
                    </div>
                    <div className="text-[11px] text-fg3 font-mono">
                      Passed: {r.passed} · Warnings: {r.warnings} · Failed: {r.failed}
                    </div>
                  </div>

                  <span
                    className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded-full ${
                      r.status === 'SUCCESS'
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                        : r.status === 'RUNNING'
                        ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 animate-pulse'
                        : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                    }`}
                  >
                    {r.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>}
      </div>

      {/* Attention Detail Modal */}
      {selectedAttention && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in">
          <div className="nexus-card max-w-lg w-full p-6 border-ink/20 shadow-2xl animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-ink/[0.08]">
              <div className="flex items-center gap-2">
                <ShieldAlert className="text-red-400" size={18} />
                <h3 className="text-sm font-bold text-fg">Attention Item Detail</h3>
              </div>
              <button
                onClick={() => setSelectedAttention(null)}
                className="text-fg3 hover:text-fg"
              >
                ✕
              </button>
            </div>
            <div className="mt-4 space-y-3 text-xs">
              <div>
                <span className="text-fg3">Title: </span>
                <span className="font-semibold text-fg">{selectedAttention.title}</span>
              </div>
              <div>
                <span className="text-fg3">Severity: </span>
                <span className="font-mono text-red-400 font-bold">{selectedAttention.severity}</span>
              </div>
              <div>
                <span className="text-fg3">Description: </span>
                <p className="text-fg2 mt-1">{selectedAttention.desc}</p>
              </div>
              <div className="pt-4 border-t border-ink/[0.08] flex justify-end gap-2">
                <button
                  onClick={() => setSelectedAttention(null)}
                  className="px-3 py-1.5 rounded-lg bg-ink/[0.05] text-fg2 hover:text-fg"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    setSelectedAttention(null);
                    if (onNavigateTab) onNavigateTab('compliance-management');
                  }}
                  className="px-4 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-onbright font-bold shadow-lg shadow-cyan-500/20"
                >
                  Remediate in Compliance →
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
