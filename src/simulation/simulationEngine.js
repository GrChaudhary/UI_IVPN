// ─────────────────────────────────────────────────────────────────────────────
// simulationEngine.js
// All constants and helper utilities used by the patch-run simulation.
// Imported by OnDemandExecution.jsx, App.jsx, and UnifiedHistory.jsx.
// ─────────────────────────────────────────────────────────────────────────────

import { Cpu, Database, Globe2 } from 'lucide-react';
import { ASSETS_BY_TECH } from '../data/cmdbData';

/** Ordered list of 9 execution gate stages */
export const STAGES = [
  'Stage 1: Sanity & Host Reachability Check',
  'Stage 2: CVE & Advisory Delta Collection',
  'Stage 3: 5-Factor Risk Scoring & Blast Radius Calculation',
  'Stage 4: ServiceNow Change Request Auto-Approval',
  'Stage 5: Pre-Flight Snapshot & Backup Verification',
  'Stage 6: Multi-Node Staged Deployment (Rolling wave)',
  'Stage 7: 10-Item Service & Port Health Post-Check',
  'Stage 8: SNOW CMDB Sync & Cryptographic Audit Attestation',
  'Stage 9: Completion Report & Telemetry Dispatch',
];

/** Technology options shown as pill selectors in OnDemandExecution */
export const TECH_OPTIONS = [
  { value: 'WINDOWS',  label: 'Windows',  icon: Globe2,   color: 'from-blue-500 to-blue-700' },
  { value: 'RHEL',     label: 'RHEL',     icon: Cpu,      color: 'from-red-500 to-red-700' },
  { value: 'ORACLE',   label: 'Oracle',   icon: Database, color: 'from-rose-500 to-pink-700' },
  { value: 'MSSQL',    label: 'MSSQL',    icon: Database, color: 'from-violet-500 to-purple-700' },
  { value: 'WEBLOGIC', label: 'WebLogic', icon: Cpu,      color: 'from-amber-500 to-orange-700' },
  { value: 'JBOSS',    label: 'JBoss',    icon: Cpu,      color: 'from-emerald-500 to-teal-700' },
];

/** Wave allocation options */
export const WAVE_OPTIONS = [
  'Wave 01 — Non-Production Canary',
  'Wave 02 — Batch Secondary Apps (12 hosts)',
  'Wave 03 — Core Database Gateways (8 hosts)',
  'Wave 04 — Mission-Critical Production Cluster',
];

/** Typical minutes per stage (sums to ~25 min; multiplied by wave factor for the max estimate) */
export const STAGE_MINUTES = [1, 2, 2, 1, 4, 8, 4, 2, 1];

/** Managed host count per technology (drives blast-radius preview) */
export const TECH_HOSTS = Object.fromEntries(Object.entries(ASSETS_BY_TECH).map(([tech, list]) => [tech, list.length]));

/** Per-wave scope multiplier, risk label and whether live runs need an explicit confirm */
export const WAVE_META = {
  [WAVE_OPTIONS[0]]: { share: 0.1,  risk: 'LOW',      tone: 'emerald', confirm: false },
  [WAVE_OPTIONS[1]]: { share: 0.3,  risk: 'MEDIUM',   tone: 'amber',   confirm: false },
  [WAVE_OPTIONS[2]]: { share: 0.2,  risk: 'HIGH',     tone: 'orange',  confirm: true  },
  [WAVE_OPTIONS[3]]: { share: 0.4,  risk: 'CRITICAL', tone: 'rose',    confirm: true  },
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

/** Generate a short random hex string for run IDs */
export function randomHex(len = 6) {
  return Math.random().toString(16).slice(2, 2 + len);
}

/** Zero-pad a number to 2 digits */
export function pad(n) {
  return String(n).padStart(2, '0');
}

/** Return current time formatted as IST-style "YYYY-MM-DD HH:MM:SS" */
export function nowIST() {
  const d = new Date();
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}

/**
 * Derive technology tag from a run name string.
 * e.g. "WIN-PROD-BATCH-0929-A" → "WINDOWS"
 */
export function techFromName(name = '') {
  const n = name.toUpperCase();
  if (n.startsWith('WIN'))      return 'WINDOWS';
  if (n.startsWith('RHEL'))     return 'RHEL';
  if (n.startsWith('ORACLE'))   return 'ORACLE';
  if (n.startsWith('MSSQL'))    return 'MSSQL';
  if (n.startsWith('WEBLOGIC')) return 'WEBLOGIC';
  if (n.startsWith('JBOSS'))    return 'JBOSS';
  return 'ALL';
}

/**
 * Derive status string + statusColor tailwind classes from a raw nexusData status.
 * @param {'SUCCESS'|'WARNING'|'RUNNING'|string} rawStatus
 * @returns {{ status: string, statusColor: string }}
 */
export function deriveStatus(rawStatus) {
  switch (rawStatus) {
    case 'SUCCESS':
      return {
        status: 'COMPLETED',
        statusColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
      };
    case 'WARNING':
      return {
        status: 'COMPLETED_WITH_WARNINGS',
        statusColor: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
      };
    case 'RUNNING':
      return {
        status: 'RUNNING',
        statusColor: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30',
      };
    default:
      return {
        status: 'ABORTED',
        statusColor: 'bg-rose-500/20 text-rose-300 border-rose-500/30',
      };
  }
}

/** stagesArray shapes keyed by raw status */
export const STAGE_ARRAYS = {
  SUCCESS: [1, 1, 1, 1, 1, 1, 1, 1, 1],
  WARNING: [1, 1, 1, 1, 1, 1, 1, 1, 0],
  RUNNING: [1, 1, 1, 1, 1, 0, 0, 0, 0],
  ABORTED: [1, 1, 0, 0, 0, 0, 0, 0, 0],
};

/**
 * Build a history entry object from a finished simulation run.
 * @param {{ id, selectedTech, selectedWave, isDryRun, ts }} params
 * @returns {object} history entry
 */
export function buildHistoryEntry({ id, selectedTech, selectedWave, isDryRun, ts }) {
  const hasWarning = !isDryRun && Math.random() > 0.2;
  const rawStatus  = isDryRun ? 'DRY_RUN' : hasWarning ? 'WARNING' : 'SUCCESS';

  const statusMap = {
    DRY_RUN: { status: 'DRY_RUN',                 statusColor: 'bg-slate-500/20 text-slate-300 border-slate-500/30' },
    WARNING: { status: 'COMPLETED_WITH_WARNINGS',  statusColor: 'bg-amber-500/20 text-amber-300 border-amber-500/30' },
    SUCCESS: { status: 'COMPLETED',                statusColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' },
  };

  const { status, statusColor } = statusMap[rawStatus];
  const passed   = Math.floor(Math.random() * 15) + 25;
  const warnings = hasWarning ? Math.floor(Math.random() * 8) + 1 : 0;

  return {
    id,
    mode: isDryRun ? 'SANDBOX' : 'ON-DEMAND',
    week: 'ONDEMAND',
    env: 'Development',
    technology: selectedTech,
    status,
    statusColor,
    stagesDone: STAGES.length,
    stagesTotal: STAGES.length,
    stagesArray: Array(STAGES.length).fill(1),
    triggeredBy: 'admin',
    started: ts,
    duration: `${(STAGES.length * 1.1).toFixed(1)}s`,
    passed,
    warnings,
    failed: 0,
    simulated: true,
  };
}
