import { ASSETS_BY_TECH, CMDB_ASSETS } from '../data/cmdbData';
import { STAGES, STAGE_MINUTES } from './simulationEngine';

/** done = completed, active = running now, failed = where an aborted run stopped, pending = not reached */
export const stageState = (run, i) =>
  run.stagesArray[i] === 1 ? 'done'
  : i !== run.stagesDone ? 'pending'
  : run.status === 'ABORTED' ? 'failed'
  : run.status === 'RUNNING' ? 'active'
  : 'pending';

const STAGE_AGENTS = [
  'sanity-check-agent',
  'patch-collection-agent',
  'risk-assessment-agent',
  'cr-lifecycle-agent',
  'snapshot-lifecycle-agent',
  'deployment-agent · patch-execution-agent',
  'postcheck-agent',
  'cmdb-bulk-update-agent · audit-agent',
  'reporting-agent',
];

const FAILURE = [
  'Unreachable hosts exceed the policy threshold',
  'Advisory source timed out',
  'Risk index above the threshold for the selected wave',
  'Change request rejected by CAB policy',
  'Snapshot capacity check failed',
  'Deployment halted: failure threshold reached',
  'Post-check degradation detected',
  'CMDB sync rejected',
  'Report dispatch failed',
];

const VERSIONS = {
  WINDOWS: ['KB5034129', 'KB5035857'],
  RHEL: ['kernel 4.18.0-513', 'kernel 4.18.0-553'],
  ORACLE: ['19.21 RU', '19.23 RU'],
  MSSQL: ['CU 14', 'CU 15'],
  WEBLOGIC: ['PSU 14.1.1.0.231', 'PSU 14.1.1.0.240'],
  JBOSS: ['EAP 7.4.13', 'EAP 7.4.17'],
};

const WARN_NOTES = ['SSH latency retry', 'Service slow to start, retried', 'Reboot exceeded 120s, retried', 'Package lock cleared and reapplied'];
const FAIL_NOTES = ['Reboot timeout, snapshot reverted', 'Dependency conflict, rolled back'];

const pad = (n) => String(n).padStart(2, '0');
const clock = (d) => `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
export const formatDuration = (sec) => (sec >= 60 ? `${Math.floor(sec / 60)}m ${pad(Math.round(sec % 60))}s` : `${Math.round(sec)}s`);

/** Deterministic RNG so a run always shows the same detail. */
function seeded(text) {
  let h = 1779033703;
  for (let i = 0; i < text.length; i++) h = Math.imul(h ^ text.charCodeAt(i), 3432918353) << 13 | h >>> 19;
  let a = h >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function buildHosts(run, rnd) {
  const sandbox = run.mode === 'SANDBOX';
  const source = ASSETS_BY_TECH[(run.technology || '').toUpperCase()] ?? CMDB_ASSETS;
  const pool = [...new Map(source.map((a) => [a.name, a])).values()]; // CMDB feed can repeat a hostname
  const total = (run.passed ?? 0) + (run.warnings ?? 0) + (run.failed ?? 0);
  const n = Math.min(total, pool.length);
  const offset = Math.floor(rnd() * (pool.length - n + 1));
  const failed = Math.min(run.failed ?? 0, n);
  const warned = Math.min(run.warnings ?? 0, n - failed);
  const statuses = [...Array(failed).fill('Failed'), ...Array(warned).fill('Warning'), ...Array(n - failed - warned).fill('Passed')];
  for (let i = statuses.length - 1; i > 0; i--) {
    const j = Math.floor(rnd() * (i + 1));
    [statuses[i], statuses[j]] = [statuses[j], statuses[i]];
  }
  const [before, after] = VERSIONS[(run.technology || '').toUpperCase()] ?? ['n-1 baseline', 'n baseline'];
  const waveSize = Math.max(1, Math.ceil(n / 2));
  return pool.slice(offset, offset + n).map((a, i) => {
    const status = statuses[i];
    return {
      name: a.name,
      ip: a.ip,
      wave: Math.floor(i / waveSize) + 1,
      before,
      after: sandbox || status === 'Failed' ? before : after,
      attempts: sandbox ? 1 : status === 'Passed' ? 1 : status === 'Warning' ? 2 : 3,
      durationSec: Math.round(90 + rnd() * 210),
      status,
      note: sandbox ? 'Validated in sandbox, nothing applied'
        : status === 'Warning' ? WARN_NOTES[Math.floor(rnd() * WARN_NOTES.length)]
        : status === 'Failed' ? FAIL_NOTES[Math.floor(rnd() * FAIL_NOTES.length)]
        : '',
    };
  });
}

/** Stage body for a completed stage: one-line outcome, key metrics and log messages. */
function doneBody(i, c) {
  const { total, passed, warnings, failed, sandbox, rnd } = c;
  switch (i) {
    case 0:
      return {
        summary: `All ${total} hosts reachable; SSH/WinRM auth and package-manager health passed.`,
        metrics: [['Hosts checked', total], ['Reachable', total], ['Auth failures', 0], ['Package manager', 'Healthy']],
        events: [`Probing ${total} hosts`, 'SSH/WinRM authentication OK', 'DNF / Windows Update health gate passed'],
      };
    case 1: {
      const adv = 40 + Math.floor(rnd() * 60);
      const crit = 4 + Math.floor(rnd() * 9);
      return {
        summary: `${adv} advisories collected against the N-1 baseline; ${crit} critical.`,
        metrics: [['Advisories', adv], ['Critical', crit], ['Baseline', 'N-1'], ['Sources', 'Satellite, WSUS']],
        events: ['Polling Red Hat Satellite and WSUS', `${adv} applicable advisories found`, `${crit} critical advisories prioritised`],
      };
    }
    case 2:
      return {
        summary: `Risk index ${c.risk.toFixed(2)}; blast radius ${total} hosts; gate passed.`,
        metrics: [['Risk index', c.risk.toFixed(2)], ['Blast radius', `${total} hosts`], ['Gate', 'Passed'], ['Factors', '5 (severity, criticality, redundancy, blast radius, incidents)']],
        events: ['Scoring 5 risk factors', `Risk index ${c.risk.toFixed(2)} below the wave threshold`, 'Similar past incidents: none blocking'],
      };
    case 3:
      return {
        summary: `${c.cr} auto-approved under the standard change policy.`,
        metrics: [['Change request', c.cr], ['Type', 'Standard'], ['Approval', 'Auto-approved'], ['Window', 'Open']],
        events: [`Created ${c.cr}`, 'Policy check: standard change, low risk', 'Approved; change window confirmed'],
      };
    case 4:
      return {
        summary: sandbox ? 'Skipped in sandbox: no snapshots taken.' : `${total} VM snapshots taken and verified.`,
        metrics: [['Snapshots', sandbox ? 0 : total], ['First snapshot', sandbox ? 'n/a' : `snap-${c.snap}`], ['Retention', '15 h'], ['Backup verified', sandbox ? 'n/a' : 'Yes']],
        events: sandbox ? ['Sandbox mode: snapshot step simulated'] : ['Creating no-memory snapshots', `${total} snapshots created`, 'Backup capacity and retention verified'],
      };
    case 5: {
      const first = passed;
      return {
        summary: sandbox
          ? `Sandbox: patch plan validated for ${total} hosts, nothing applied.`
          : `${first} of ${total} hosts patched in the first flow; ${warnings} needed a reattempt; ${failed} failed.`,
        metrics: [
          ['Patched in first flow', sandbox ? 0 : first],
          ['Needed reattempt', warnings],
          ['Failed', failed],
          ['Patches reapplied', warnings * 2 + failed],
          ['Waves', 2],
          ['Rollbacks', failed],
        ],
        events: sandbox
          ? ['Sandbox: dry plan generated for 2 waves', 'No packages were installed']
          : ['Wave 1 started', 'Wave 1 complete', 'Wave 2 started', ...(warnings ? [`${warnings} host(s) retried after remediation`] : []), 'Wave 2 complete'],
      };
    }
    case 6:
      return {
        summary: warnings || failed ? `${passed} hosts healthy, ${warnings} with warnings, ${failed} failed the post-check.` : `All ${total} hosts passed the 10-item post-check.`,
        metrics: [['Checks per host', 10], ['Healthy', passed], ['Warnings', warnings], ['Failed', failed]],
        events: ['Running 10-item service and port health checks', ...(warnings ? [`Warnings on ${warnings} host(s): see Hosts tab`] : []), 'Post-check complete'],
      };
    case 7:
      return {
        summary: `${total} CMDB records updated and audit evidence attested.`,
        metrics: [['CMDB records', total], ['Audit attestation', `sha256:${c.hash}`], ['Signed by', 'audit-agent'], ['PatchTheater', 'Synced']],
        events: ['Pushing post-patch data to ServiceNow CMDB', 'Recording audit evidence', 'Attestation signed'],
      };
    default:
      return {
        summary: 'Completion report generated and telemetry dispatched.',
        metrics: [['Report', 'Generated'], ['Telemetry', 'Dispatched'], ['Recipients', 'patch-ops@wipro.local'], ['Change request', 'Closed']],
        events: ['Rendering completion report', 'Dispatching telemetry to the monitoring agent', 'Change request closed'],
      };
  }
}

/** Everything the run-detail view and the downloadable report need, derived from a history entry. */
export function buildRunDetail(run) {
  const rnd = seeded(run.id);
  const sandbox = run.mode === 'SANDBOX';
  const total = (run.passed ?? 0) + (run.warnings ?? 0) + (run.failed ?? 0);
  const ctx = {
    rnd, sandbox, total,
    passed: run.passed ?? 0, warnings: run.warnings ?? 0, failed: run.failed ?? 0,
    risk: 0.08 + rnd() * 0.23,
    cr: `CHG0${String(Math.floor(100000 + rnd() * 899999))}`,
    snap: Math.floor(10000 + rnd() * 89999),
    hash: Array.from({ length: 12 }, () => Math.floor(rnd() * 16).toString(16)).join(''),
  };

  const parsed = new Date(String(run.started).replace(' ', 'T'));
  let cursor = Number.isNaN(parsed.getTime()) ? new Date() : parsed;

  const stages = STAGES.map((full, i) => {
    const state = stageState(run, i);
    const name = full.replace(/^Stage \d+:\s*/, '');
    const base = {
      n: i + 1, name, state, agent: STAGE_AGENTS[i],
      warn: state === 'done' && ctx.warnings > 0 && (i === 5 || i === 6),
    };
    if (state === 'pending') {
      return {
        ...base, start: '', durationSec: 0, metrics: [], events: [],
        summary: run.status === 'ABORTED' ? 'Skipped: run aborted before this stage.' : 'Waiting for earlier stages.',
      };
    }
    let seconds = STAGE_MINUTES[i] * 60 * (0.8 + rnd() * 0.4);
    if (i === 5) seconds *= 1 + total / 40;
    if (state === 'failed') seconds *= 0.5;
    seconds = Math.round(seconds);

    const start = cursor;
    cursor = new Date(cursor.getTime() + seconds * 1000);

    const body = state === 'done'
      ? doneBody(i, ctx)
      : state === 'failed'
      ? {
          summary: `${FAILURE[i]}. Run aborted, snapshot revert issued.`,
          metrics: [['Result', 'Failed'], ['Action', 'Run aborted'], ['Rollback', 'Snapshot revert issued']],
          events: ['ERROR ' + FAILURE[i], 'Abort signal sent to the orchestrator', 'Snapshot revert issued for all targets'],
        }
      : { summary: 'In progress.', metrics: [['Result', 'Running']], events: ['Stage started'] };

    const step = seconds / (body.events.length + 1);
    return {
      ...base,
      start: clock(start),
      durationSec: seconds,
      summary: body.summary,
      metrics: body.metrics,
      events: body.events.map((message, k) => ({ time: clock(new Date(start.getTime() + step * (k + 1) * 1000)), message })),
    };
  });

  const hosts = buildHosts(run, rnd);
  const durationSec = stages.reduce((n, s) => n + s.durationSec, 0);
  const finished = stages.filter((s) => s.state === 'done').length;

  const facts = [
    ['Run ID', run.id],
    ['Status', run.status.replace(/_/g, ' ')],
    ['Mode', run.mode],
    ['Technology', run.technology],
    ['Environment', run.env],
    ['Week', run.week],
    ['Triggered by', run.triggeredBy],
    ['Started (IST)', run.started],
    ['Duration', formatDuration(durationSec)],
    ['Stages completed', `${finished} of ${stages.length}`],
    ['Hosts in scope', total],
    ['Passed', run.passed ?? 0],
    ['Warnings', run.warnings ?? 0],
    ['Failed', run.failed ?? 0],
    ['Change request', ctx.cr],
  ];

  return { facts, stages, hosts, totals: { total, durationSec, finished }, cr: ctx.cr };
}
