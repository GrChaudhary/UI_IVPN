import React, { useState } from 'react';
import {
  SlidersHorizontal,
  Trash2,
  Check,
  HardDrive,
  Database,
  Cloud,
  Clock,
  ShieldCheck,
  AlertCircle,
} from 'lucide-react';
import Select from './ui/Select';
import PageHeader from './ui/PageHeader';
import PatchCycleSchedule from './PatchCycleSchedule';

export default function ScheduleOverview({ settings }) {
  const [activeSubTab, setActiveSubTab] = useState('patch-cycles'); // 'patch-cycles' | 'vcenter'
  const [retentionHours, setRetentionHours] = useState(15);
  const [platformTarget, setPlatformTarget] = useState('VMware vCenter — Snapshot');
  const [appliesTo, setAppliesTo] = useState('All targets (RHEL + Windows)');
  const [saveSuccess, setSaveSuccess] = useState(false);

  const [retentionPolicies, setRetentionPolicies] = useState([
    {
      id: 'cohesity',
      name: 'Cohesity Backup Retention',
      badge: '30 days',
      badgeColor: 'bg-blue-950/60 text-blue-400 border-blue-500/30',
      iconColor: 'text-amber-500',
    },
    {
      id: 'rubrik',
      name: 'Rubrik Backup Retention',
      badge: 'Not available',
      badgeColor: 'bg-slate-800 text-fg3 border-slate-700',
      iconColor: 'text-red-400',
    },
    {
      id: 'vcenter',
      name: 'vCenter Snapshot Retention',
      badge: `${Math.round(retentionHours / 24) || 1} day`,
      badgeColor: 'bg-blue-950/60 text-blue-400 border-blue-500/30',
      iconColor: 'text-cyan-400',
    },
  ]);

  const handleSave = () => {
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  return (
    <div className="p-6 space-y-6 w-full animate-in fade-in">
      <PageHeader title="Patch Window Planner" subtitle="Maintenance windows, rollout waves and pre-patch snapshot & backup policy." />

      {/* 1. TOP SUBTABS BAR */}
      <div className="flex items-center gap-3 border-b border-ink/[0.08] pb-4">
        <button
          onClick={() => setActiveSubTab('patch-cycles')}
          className={`px-4 py-1.5 text-xs font-semibold rounded-full transition-all ${
            activeSubTab === 'patch-cycles'
              ? 'pill-tab-active'
              : 'text-fg3 hover:text-fg'
          }`}
        >
          Patch Cycle Schedules
        </button>
        <button
          onClick={() => setActiveSubTab('vcenter')}
          className={`px-4 py-1.5 text-xs font-semibold rounded-full transition-all ${
            activeSubTab === 'vcenter'
              ? 'pill-tab-active'
              : 'text-fg3 hover:text-fg'
          }`}
        >
          vCenter & Backup Manager
        </button>
      </div>

      {activeSubTab === 'patch-cycles' && <PatchCycleSchedule settings={settings} />}

      {activeSubTab === 'vcenter' && (
        <>
      {/* 3. THREE CONNECTED INTEGRATION CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* VMware Card */}
        <div className="nexus-card p-4 flex items-center gap-4">
          <div className="w-24 h-10 bg-white rounded-lg flex items-center justify-center font-bold text-onbright tracking-tighter text-sm shadow-md">
            VMware
          </div>
          <div>
            <div className="text-xs text-fg3">Snapshot management</div>
            <div className="text-xs font-semibold text-emerald-400 flex items-center gap-1.5 mt-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
              <span>Connected</span>
            </div>
          </div>
        </div>

        {/* Cohesity Card */}
        <div className="nexus-card p-4 flex items-center gap-4">
          <div className="w-24 h-10 bg-white rounded-lg flex items-center justify-center font-extrabold text-onbright tracking-wider text-xs shadow-md">
            COHESITY
          </div>
          <div>
            <div className="text-xs text-fg3">Backup & retention</div>
            <div className="text-xs font-semibold text-emerald-400 flex items-center gap-1.5 mt-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
              <span>Connected</span>
            </div>
          </div>
        </div>

        {/* Rubrik Card */}
        <div className="nexus-card p-4 flex items-center gap-4">
          <div className="w-24 h-10 bg-white rounded-lg flex items-center justify-center font-bold text-onbright text-sm shadow-md">
            rubrik
          </div>
          <div>
            <div className="text-xs text-fg3">Backup & retention</div>
            <div className="text-xs font-semibold text-amber-400 flex items-center gap-1.5 mt-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
              <span>Soon will get connected</span>
            </div>
          </div>
        </div>
      </div>

      {/* 4. RETENTION POLICY PANEL */}
      <div className="nexus-card p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-ink/[0.08]">
          <div>
            <h3 className="text-base font-bold text-fg">Retention Policy</h3>
            <p className="text-xs text-fg3 mt-0.5">
              Applies to all snapshots/backups taken during On-Demand Patch Execution.
            </p>
          </div>
          <span className="text-xs font-bold text-emerald-400 font-mono tracking-wider">
            VMware
          </span>
        </div>

        {/* 2-Column Split: Left List vs Right Form */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column (5 cols): Retention list */}
          <div className="lg:col-span-6 space-y-3">
            {retentionPolicies.map((policy) => (
              <div
                key={policy.id}
                className="flex items-center justify-between p-3.5 bg-inset/80 border border-ink/[0.06] rounded-xl hover:border-ink/[0.12] transition-colors"
              >
                <div className="flex items-center gap-3">
                  <Database size={17} className={policy.iconColor} />
                  <span className="text-xs font-semibold text-fg2">
                    {policy.name}
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <span
                    className={`px-3 py-1 rounded-md text-xs font-mono font-semibold border ${policy.badgeColor}`}
                  >
                    {policy.badge}
                  </span>
                  <button
                    onClick={() => alert(`Configuring ${policy.name}`)}
                    className="text-fg3 hover:text-fg transition-colors"
                  >
                    <SlidersHorizontal size={14} />
                  </button>
                  <button
                    onClick={() => alert(`Reset policy for ${policy.name}`)}
                    className="text-fg4 hover:text-red-400 transition-colors"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Right Column (6 cols): Form & Slider */}
          <div className="lg:col-span-6 space-y-4">
            {/* Platform / Target Dropdown */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-medium text-fg3">
                Platform / Target
              </label>
              <Select value={platformTarget} onValueChange={setPlatformTarget} options={["VMware vCenter — Snapshot", "Cohesity — Protection Group", "AWS EC2 — AMI Snapshot"]} className="w-full" />
            </div>

            {/* Applies to Dropdown */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-medium text-fg3">
                Applies to
              </label>
              <Select value={appliesTo} onValueChange={setAppliesTo} options={["All targets (RHEL + Windows)", "RHEL 8 / 9 Servers Only", "Windows Server 2019/2022 Fleet", "Database Clusters (Oracle + Postgres)"]} className="w-full" />
            </div>

            {/* Retention duration Slider */}
            <div className="space-y-2 pt-1">
              <div className="flex items-center justify-between text-xs">
                <span className="text-cyan-400 font-medium">
                  Retention duration {retentionHours} hours
                </span>
                <span className="text-fg3 font-mono text-[11px]">
                  Max: 72 hrs
                </span>
              </div>
              <input
                type="range"
                min="1"
                max="72"
                value={retentionHours}
                onChange={(e) => setRetentionHours(Number(e.target.value))}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
              />
            </div>

            {/* Save Button */}
            <div className="pt-2">
              <button
                onClick={handleSave}
                className="w-full py-2.5 px-4 bg-[#6366f1] hover:bg-[#4f46e5] text-white font-semibold text-xs rounded-lg shadow-lg shadow-indigo-500/20 flex items-center justify-center gap-2 transition-all active:scale-[0.99]"
              >
                <Check size={15} />
                <span>Save retention policy</span>
              </button>

              {saveSuccess && (
                <div className="mt-2 text-center text-xs font-medium text-emerald-400 animate-in fade-in">
                  ✓ Retention policy updated successfully!
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 5. FLEET-WIDE SNAPSHOT & BACKUP STATUS */}
      <div className="nexus-card p-6 space-y-4">
        <div>
          <h3 className="text-base font-bold text-fg">
            Fleet-Wide Snapshot & Backup Status
          </h3>
          <p className="text-xs text-fg3 mt-0.5">
            Aggregated across all runs in unified Execution History
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 pt-2">
          <div>
            <div className="text-xs text-fg3">Total Active</div>
            <div className="text-3xl font-extrabold text-fg mt-1">0</div>
          </div>
          <div>
            <div className="text-xs text-fg3">Deleted Today</div>
            <div className="text-3xl font-extrabold text-fg mt-1">0</div>
          </div>
          <div>
            <div className="text-xs text-fg3">About to Expire</div>
            <div className="text-3xl font-extrabold text-amber-400 mt-1">0</div>
          </div>
          <div className="flex items-end justify-end">
            <span className="text-xs text-fg3 font-mono">0 snapshots</span>
          </div>
        </div>
      </div>
        </>
      )}
    </div>
  );
}
