import React, { useState, useEffect, useRef } from 'react';
import {
  Bell,
  LogOut,
  Calendar,
  Network,
  CheckCircle2,
  AlertTriangle,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Zap,
  PanelLeft,
  PanelLeftClose,
  Settings,
} from 'lucide-react';
import { WindowsMicroLogo, RhelMicroLogo } from './BackgroundTexture';
import BrandMark from './BrandMark';
import ThemeSwitch from './ui/ThemeSwitch';
import { AGENTS_LIST } from '../data/nexusData';

export default function TopHeader({
  activeTabTitle = 'Central Dashboard',
  darkMode,
  setDarkMode,
  onNavigateTab,
  isSidebarCollapsed,
  setIsSidebarCollapsed,
  user,
  onSignOut,
  onOpenSettings,
  integrationMode = 'live',
}) {
  const [timeString, setTimeString] = useState('');
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);
  const [selectedMonthIndex, setSelectedMonthIndex] = useState(8); // September = index 8
  const [selectedDay, setSelectedDay] = useState(29);
  const calendarRef = useRef(null);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeString(
        now.toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
          hour12: true,
        })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Close calendar popover on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (calendarRef.current && !calendarRef.current.contains(event.target)) {
        setShowCalendar(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  // Month-wise Scheduled Patch Runs Database
  const monthlyPatchData = {
    8: { // September 2026
      year: 2026,
      daysInMonth: 30,
      startDayOffset: 2,
      totalRuns: 14,
      totalNodes: '1,420 Hosts',
      events: [
        { day: 8, type: 'win', title: 'Patch Tuesday Rollout A', nodes: 340, time: '11:00 PM', status: 'Completed' },
        { day: 10, type: 'rhel', title: 'RHEL 9.4 Kernel Errata Fix', nodes: 210, time: '02:00 AM', status: 'Completed' },
        { day: 15, type: 'db', title: 'Oracle & MSSQL Security CU', nodes: 85, time: '04:00 AM', status: 'Completed' },
        { day: 22, type: 'win', title: 'Windows Tier-2 Apps Batch', nodes: 280, time: '10:30 PM', status: 'Completed' },
        { day: 24, type: 'rhel', title: 'RHEL Critical Security Fix', nodes: 195, time: '01:00 AM', status: 'Completed' },
        { day: 29, type: 'win', title: 'Windows Production Fleet - Batch 1', nodes: 222, time: '11:30 PM', status: 'In Progress' },
        { day: 30, type: 'rhel', title: 'RHEL FinTech DMZ Cluster', nodes: 88, time: '03:00 AM', status: 'Scheduled' },
      ],
    },
    9: { // October 2026
      year: 2026,
      daysInMonth: 31,
      startDayOffset: 4,
      totalRuns: 18,
      totalNodes: '1,850 Hosts',
      events: [
        { day: 6, type: 'win', title: 'Windows Pre-Prod Validation', nodes: 150, time: '10:00 PM', status: 'Scheduled' },
        { day: 13, type: 'win', title: 'October Patch Tuesday Global', nodes: 620, time: '11:00 PM', status: 'Scheduled' },
        { day: 15, type: 'rhel', title: 'RHEL Core Infrastructure', nodes: 340, time: '02:00 AM', status: 'Scheduled' },
        { day: 20, type: 'db', title: 'Database Security & Hotfixes', nodes: 110, time: '04:00 AM', status: 'Scheduled' },
        { day: 27, type: 'win', title: 'Windows DMZ & Edge Servers', nodes: 240, time: '11:30 PM', status: 'Scheduled' },
      ],
    },
    10: { // November 2026
      year: 2026,
      daysInMonth: 30,
      startDayOffset: 0,
      totalRuns: 12,
      totalNodes: '1,200 Hosts',
      events: [
        { day: 10, type: 'win', title: 'November Patch Tuesday Stage 1', nodes: 500, time: '11:00 PM', status: 'Planned' },
        { day: 12, type: 'rhel', title: 'RHEL 9.4 Compliance Errata', nodes: 280, time: '02:00 AM', status: 'Planned' },
        { day: 19, type: 'win', title: 'Windows Production Stage 2', nodes: 420, time: '11:00 PM', status: 'Planned' },
      ],
    },
  };

  const currentMonthData = monthlyPatchData[selectedMonthIndex] || {
    year: 2026,
    daysInMonth: 30,
    startDayOffset: 1,
    totalRuns: 0,
    totalNodes: '0 Hosts',
    events: [],
  };

  const selectedDayEvents = currentMonthData.events.filter((e) => e.day === selectedDay);

  const prevMonth = () => {
    setSelectedMonthIndex((prev) => (prev > 0 ? prev - 1 : 11));
    setSelectedDay(1);
  };

  const nextMonth = () => {
    setSelectedMonthIndex((prev) => (prev < 11 ? prev + 1 : 0));
    setSelectedDay(1);
  };

  return (
    <header className="fixed top-0 left-0 right-0 h-16 bg-page/75 backdrop-blur-md border-b border-ink/[0.04] px-5 flex items-center justify-between z-50 select-none">
      {/* LEFT: Wipro Brand + Divider + Platform Info (Unified single bar) */}
      <div className="flex items-center gap-4">
        {/* Sidebar Toggle Button */}
        <button
          onClick={() => setIsSidebarCollapsed && setIsSidebarCollapsed(!isSidebarCollapsed)}
          className="text-fg3 hover:text-cyan-400 p-1.5 rounded-lg hover:bg-ink/[0.06] transition-colors border border-transparent hover:border-ink/10"
          title={isSidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {isSidebarCollapsed ? <PanelLeft size={18} /> : <PanelLeftClose size={18} />}
        </button>

        {/* Wipro Brand Logo */}
        <div
          className="flex items-baseline cursor-pointer group"
          onClick={() => onNavigateTab && onNavigateTab('central-dashboard')}
        >
          <BrandMark />
        </div>

        {/* Subtle Vertical Divider */}
        <div className="h-6 w-px bg-ink/[0.12] mx-1" />

        {/* Platform Identity */}
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-teal-950/80 border border-teal-500/40 flex items-center justify-center text-teal-400 shadow-[0_0_12px_rgba(20,184,166,0.25)]">
            <Network size={17} className="text-teal-400 animate-pulse" />
          </div>
          <div className="flex flex-col">
            <h1 className="text-sm font-bold text-fg tracking-tight leading-tight">
              Agentic Vulnerability and Patching Nexus
            </h1>
            <p className="text-[11px] font-medium text-cyan-400 leading-none mt-0.5">
              {activeTabTitle}
            </p>
          </div>
        </div>
      </div>

      {/* RIGHT: Calendar Popover + Controls */}
      <div className="flex items-center gap-2.5">
        {/* Month-Wise Patch Runs Calendar Trigger */}
        <div className="relative" ref={calendarRef}>
          <button
            onClick={() => setShowCalendar(!showCalendar)}
            className={`px-3 py-1.5 text-xs font-medium border rounded-full flex items-center gap-2 transition-all duration-200 shadow-sm ${
              showCalendar
                ? 'bg-cyan-500/15 border-cyan-400 text-cyan-300 shadow-[0_0_15px_rgba(0,242,254,0.25)]'
                : 'text-fg2 hover:text-fg bg-ink/[0.05] hover:bg-ink/[0.09] border-ink/[0.1]'
            }`}
            title="View Month-Wise Scheduled Patch Runs"
          >
            <Calendar size={14} className="text-cyan-400" />
            <span className="font-semibold">{months[selectedMonthIndex]} {currentMonthData.year}</span>
            <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-cyan-950/80 border border-cyan-500/30 text-cyan-300">
              {currentMonthData.events.length} Runs
            </span>
            <ChevronDown
              size={13}
              className={`text-fg3 transition-transform duration-200 ${showCalendar ? 'rotate-180 text-cyan-400' : ''}`}
            />
          </button>

          {/* Calendar Popover */}
          {showCalendar && (
            <div className="absolute right-0 mt-2.5 w-[390px] bg-surface border border-cyan-500/30 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.8),0_0_20px_rgba(0,242,254,0.12)] p-4 z-50 animate-in fade-in zoom-in-95 duration-150">
              <div className="flex items-center justify-between pb-3 border-b border-ink/[0.08]">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-lg bg-cyan-500/20 border border-cyan-400/40 flex items-center justify-center text-cyan-400">
                    <Calendar size={13} />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-fg tracking-wide">
                      Patch Cycle Calendar
                    </h4>
                    <p className="text-[10px] text-fg3">
                      {currentMonthData.totalNodes} targeted in {months[selectedMonthIndex]}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1 bg-ink/[0.04] p-0.5 rounded-lg border border-ink/[0.06]">
                  <button
                    onClick={prevMonth}
                    className="p-1 hover:bg-ink/[0.08] rounded text-fg3 hover:text-fg transition-colors"
                  >
                    <ChevronLeft size={13} />
                  </button>
                  <span className="text-[11px] font-bold text-fg2 px-1.5">
                    {months[selectedMonthIndex].slice(0, 3)} {currentMonthData.year}
                  </span>
                  <button
                    onClick={nextMonth}
                    className="p-1 hover:bg-ink/[0.08] rounded text-fg3 hover:text-fg transition-colors"
                  >
                    <ChevronRight size={13} />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-bold text-fg4 uppercase pt-3 pb-1">
                <span>Su</span>
                <span>Mo</span>
                <span>Tu</span>
                <span>We</span>
                <span>Th</span>
                <span>Fr</span>
                <span>Sa</span>
              </div>

              <div className="grid grid-cols-7 gap-1">
                {Array.from({ length: currentMonthData.startDayOffset }).map((_, i) => (
                  <div key={`empty-${i}`} className="h-8 rounded-lg" />
                ))}

                {Array.from({ length: currentMonthData.daysInMonth }).map((_, i) => {
                  const dayNum = i + 1;
                  const dayEvents = currentMonthData.events.filter((e) => e.day === dayNum);
                  const hasWin = dayEvents.some((e) => e.type === 'win');
                  const hasRhel = dayEvents.some((e) => e.type === 'rhel');
                  const hasDb = dayEvents.some((e) => e.type === 'db');
                  const isSelected = selectedDay === dayNum;
                  const isToday = dayNum === 29 && selectedMonthIndex === 8;

                  return (
                    <button
                      key={dayNum}
                      onClick={() => setSelectedDay(dayNum)}
                      className={`h-8 rounded-lg flex flex-col items-center justify-center text-xs font-semibold relative transition-all duration-150 ${
                        isSelected
                          ? 'bg-cyan-500 text-onbright font-bold shadow-md shadow-cyan-500/30'
                          : isToday
                          ? 'border border-cyan-400/80 bg-cyan-950/40 text-cyan-300'
                          : dayEvents.length > 0
                          ? 'bg-ink/[0.04] text-fg2 hover:bg-ink/[0.08]'
                          : 'text-fg3 hover:bg-ink/[0.03]'
                      }`}
                    >
                      <span className="text-[11px] leading-none">{dayNum}</span>
                      {dayEvents.length > 0 && !isSelected && (
                        <div className="flex items-center gap-0.5 mt-0.5">
                          {hasWin && <span className="w-1 h-1 rounded-full bg-blue-400 shadow-[0_0_4px_#00a4ef]" />}
                          {hasRhel && <span className="w-1 h-1 rounded-full bg-red-500 shadow-[0_0_4px_#ee0000]" />}
                          {hasDb && <span className="w-1 h-1 rounded-full bg-emerald-400 shadow-[0_0_4px_#10b981]" />}
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>

              <div className="flex items-center justify-between text-[9px] text-fg3 pt-3 pb-2 px-1 border-t border-ink/[0.06] mt-2">
                <div className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />
                  <span>Windows Patch</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                  <span>RHEL Errata</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  <span>Database / App</span>
                </div>
              </div>

              <div className="bg-inset border border-ink/[0.06] rounded-xl p-2.5 space-y-2 mt-1">
                <div className="flex items-center justify-between text-[11px] font-bold text-fg2">
                  <span>{months[selectedMonthIndex]} {selectedDay}, {currentMonthData.year}</span>
                  <span className="text-[10px] text-cyan-400 font-mono">{selectedDayEvents.length} Event{selectedDayEvents.length !== 1 ? 's' : ''}</span>
                </div>

                {selectedDayEvents.length > 0 ? (
                  <div className="space-y-1.5">
                    {selectedDayEvents.map((evt, idx) => (
                      <div
                        key={idx}
                        className="p-2 rounded-lg bg-surface border border-ink/[0.08] flex items-center justify-between text-xs"
                      >
                        <div className="flex items-center gap-2">
                          {evt.type === 'win' && <WindowsMicroLogo className="w-3.5 h-3.5" color="#00a4ef" />}
                          {evt.type === 'rhel' && <RhelMicroLogo className="w-3.5 h-3.5" color="#ee0000" />}
                          {evt.type === 'db' && <Zap size={14} className="text-emerald-400" />}
                          <div>
                            <div className="text-[11px] font-semibold text-fg2 leading-tight">
                              {evt.title}
                            </div>
                            <div className="text-[9px] text-fg3 font-mono mt-0.5">
                              {evt.nodes} Hosts · {evt.time}
                            </div>
                          </div>
                        </div>

                        <span
                          className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                            evt.status === 'In Progress'
                              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30 animate-pulse'
                              : evt.status === 'Completed'
                              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                              : 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                          }`}
                        >
                          {evt.status}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-[11px] text-fg4 py-2 text-center">
                    No maintenance patch window scheduled for this date.
                  </div>
                )}
              </div>

              <button
                onClick={() => {
                  setShowCalendar(false);
                  if (onNavigateTab) onNavigateTab('schedule-overview');
                }}
                className="w-full mt-3 py-2 px-3 rounded-xl bg-gradient-to-r from-cyan-500/20 to-blue-500/20 hover:from-cyan-500/30 hover:to-blue-500/30 border border-cyan-500/40 text-cyan-300 hover:text-fg font-semibold text-xs flex items-center justify-center gap-1.5 transition-all shadow-sm"
              >
                <span>Open Full Schedule Matrix</span>
                <ExternalLink size={12} />
              </button>
            </div>
          )}
        </div>

        {/* Light / Dark Mode Toggle */}
        <ThemeSwitch dark={darkMode} onChange={setDarkMode} />

        {/* Live Status Badge */}
        <div className="px-3 py-1.5 text-xs font-semibold text-emerald-400 bg-emerald-950/40 border border-emerald-500/30 rounded-full flex items-center gap-1.5 shadow-[0_0_10px_rgba(16,185,129,0.15)]">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse-glow"></span>
          <span>{{ live: 'Live', simulation: 'Simulation', readonly: 'Read-only' }[integrationMode]}</span>
        </div>

        {/* Clock */}
        <span className="px-3 py-1.5 text-xs font-mono font-medium text-fg2 bg-ink/[0.04] border border-ink/[0.08] rounded-full">
          {timeString || '12:35 AM'}
        </span>

        {/* Settings */}
        <button
          onClick={onOpenSettings}
          className="p-2 text-fg2 hover:text-fg hover:bg-ink/[0.08] border border-ink/[0.08] rounded-full transition-all"
          title="Settings"
          aria-label="Settings"
        >
          <Settings size={16} />
        </button>

        {/* Notification Bell */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2 text-fg2 hover:text-fg hover:bg-ink/[0.08] border border-ink/[0.08] rounded-full relative transition-all"
            title="System Alerts"
          >
            <Bell size={16} />
            <span className="absolute top-1 right-1 w-2 h-2 bg-pink-500 rounded-full animate-ping"></span>
            <span className="absolute top-1 right-1 w-2 h-2 bg-pink-500 rounded-full"></span>
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 bg-surface border border-ink/[0.12] rounded-xl shadow-2xl p-3 z-50 animate-in fade-in slide-in-from-top-2">
              <div className="flex items-center justify-between pb-2 mb-2 border-b border-ink/[0.08]">
                <span className="text-xs font-bold text-fg uppercase tracking-wider">
                  Nexus Notifications (3)
                </span>
                <button
                  onClick={() => setShowNotifications(false)}
                  className="text-[11px] text-cyan-400 hover:underline"
                >
                  Clear all
                </button>
              </div>
              <div className="space-y-2 text-xs">
                <div className="p-2 rounded-lg bg-red-950/30 border border-red-500/20 text-fg2">
                  <div className="flex items-center gap-1.5 font-semibold text-red-400">
                    <AlertTriangle size={13} />
                    <span>8 Non-Compliant Devices Detected</span>
                  </div>
                  <p className="text-[11px] text-fg3 mt-0.5">
                    Storage cluster is falling behind N-1 baseline standard.
                  </p>
                </div>
                <div className="p-2 rounded-lg bg-emerald-950/30 border border-emerald-500/20 text-fg2">
                  <div className="flex items-center gap-1.5 font-semibold text-emerald-400">
                    <CheckCircle2 size={13} />
                    <span>Sanity Gate Passed</span>
                  </div>
                  <p className="text-[11px] text-fg3 mt-0.5">
                    {AGENTS_LIST.length} AI agent fleet operational and synced with CMDB.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* User Pill */}
        <div className="relative">
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-2 pl-1 pr-3 py-1 bg-ink/[0.04] hover:bg-ink/[0.08] border border-ink/[0.08] rounded-full transition-all"
          >
            <div className="w-6 h-6 rounded-full bg-emerald-500 text-onbright font-bold text-xs flex items-center justify-center">
              {user.initials}
            </div>
            <span className="text-xs font-semibold text-fg2">
              {user.name}
            </span>
            <ChevronDown size={13} className="text-fg3" />
          </button>

          {showUserMenu && (
            <div className="absolute right-0 mt-2 w-48 bg-surface border border-ink/[0.12] rounded-xl shadow-2xl p-2 z-50">
              <div className="px-3 py-2 border-b border-ink/[0.08]">
                <div className="text-xs font-bold text-fg">{user.roleLabel}</div>
                <div className="text-[10px] text-fg3">{user.email}</div>
              </div>
              <button
                onClick={() => alert('Viewing admin profile settings')}
                className="w-full text-left px-3 py-1.5 text-xs text-fg2 hover:text-fg hover:bg-ink/[0.05] rounded-md mt-1"
              >
                Profile & RBAC
              </button>
              <button
                onClick={() => alert('Tenant settings')}
                className="w-full text-left px-3 py-1.5 text-xs text-fg2 hover:text-fg hover:bg-ink/[0.05] rounded-md"
              >
                Tenant Config
              </button>
            </div>
          )}
        </div>

        {/* Sign out */}
        <button
          onClick={onSignOut}
          className="p-2 text-fg3 hover:text-fg2 hover:bg-ink/[0.08] border border-ink/[0.08] rounded-full transition-all"
          title="Sign Out"
        >
          <LogOut size={16} />
        </button>
      </div>
    </header>
  );
}
