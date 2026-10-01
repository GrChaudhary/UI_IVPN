import React, { useMemo, useState } from 'react';
import { ArrowLeft, RefreshCw, Search, Server, CalendarClock, Check, CircleCheck, RotateCcw, Wrench } from 'lucide-react';
import ScheduleRunModal from './ScheduleRunModal';

const WEEKS = [
  { id: 'W01', env: 'Development', editable: true },
  { id: 'W02', env: 'Non-Production', editable: true },
  { id: 'W03', env: 'Production', editable: true },
  { id: 'W04', env: 'Remediation', editable: true },
];

const STAGES = ['Discovery', 'Pre-Check', 'Snapshot', 'Download', 'Deploy', 'Reboot', 'Post-Check', 'Validation', 'Sign-off'];

const TECHS = [
  { id: 'linux', label: 'RHEL / Linux' },
  { id: 'windows', label: 'Microsoft Windows' },
  { id: 'oracle', label: 'Oracle Database' },
  { id: 'mssql', label: 'Microsoft SQL Server' },
  { id: 'weblogic', label: 'WebLogic' },
  { id: 'suse', label: 'SUSE' },
  { id: 'postgres', label: 'PostgreSQL' },
  { id: 'websphere', label: 'IBM WebSphere' },
  { id: 'rhelpcs', label: 'RHEL PCS Cluster' },
  { id: 'apache', label: 'Apache' },
  { id: 'winha', label: 'Windows HA Cluster' },
  { id: 'mssqlha', label: 'MSSQL HA' },
];

const GROUP_RULES = [
  [/pcs|wsfc|sqlha/, 'Cluster nodes'],
  [/-web-|iis|apache/, 'Web tier'],
  [/-api-/, 'API tier'],
  [/-db-|^(ora|sql|pg)/, 'Database tier'],
  [/-app-|^(wls|wasnd)/, 'App tier'],
];
const groupOf = (name) => GROUP_RULES.find(([re]) => re.test(name))?.[1] ?? 'Infrastructure';

// Simulated CMDB-tagged inventory: Development is intentionally empty for Linux, like a fresh environment.
const HOSTS = [
  ['linux', 'Non-Production', 'rhel8-app-nprd-01', 'RHEL 8.9', '10.20.4.11'],
  ['linux', 'Non-Production', 'rhel8-app-nprd-02', 'RHEL 8.9', '10.20.4.12'],
  ['linux', 'Non-Production', 'rhel9-api-nprd-01', 'RHEL 9.4', '10.20.5.21'],
  ['linux', 'Production', 'rhel9-web-prd-01', 'RHEL 9.4', '10.30.1.31'],
  ['linux', 'Production', 'rhel8-db-prd-02', 'RHEL 8.7', '10.30.2.42'],
  ['linux', 'Remediation', 'tsg-isilon-c01', 'RHEL 8.7', '10.30.9.5'],
  ['windows', 'Development', 'win22-dev-app-01', 'Windows Server 2022', '10.10.2.14'],
  ['windows', 'Development', 'win19-dev-iis-02', 'Windows Server 2019', '10.10.2.15'],
  ['windows', 'Non-Production', 'win22-nprd-app-01', 'Windows Server 2022', '10.20.6.14'],
  ['windows', 'Production', 'win22-prd-app-01', 'Windows Server 2022', '10.30.6.14'],
  ['windows', 'Production', 'win22-prd-app-02', 'Windows Server 2022', '10.30.6.15'],
  ['oracle', 'Development', 'ora19-dev-01', 'Oracle 19c', '10.10.8.3'],
  ['oracle', 'Production', 'ora19-prd-fin-01', 'Oracle 19c', '10.30.8.7'],
  ['mssql', 'Non-Production', 'sql19-nprd-01', 'SQL Server 2019', '10.20.7.9'],
  ['mssql', 'Production', 'sql22-prd-01', 'SQL Server 2022', '10.30.7.10'],
  ['weblogic', 'Development', 'wls14-dev-01', 'WebLogic 14c', '10.10.9.2'],
  ['weblogic', 'Production', 'wls14-prd-01', 'WebLogic 14c', '10.30.9.2'],
  ['suse', 'Development', 'suse12-dev-01', 'SLES 12 SP5', '10.10.3.21'],
  ['suse', 'Non-Production', 'suse15-app-nprd-01', 'SLES 15 SP5', '10.20.3.22'],
  ['suse', 'Production', 'suse15-app-prd-02', 'SLES 15 SP5', '10.30.3.23'],
  ['suse', 'Production', 'suse15-db-prd-01', 'SLES 15 SP5', '10.30.3.24'],
  ['postgres', 'Development', 'pg14-dev-01', 'PostgreSQL 14', '10.10.8.31'],
  ['postgres', 'Non-Production', 'pg15-nprd-01', 'PostgreSQL 15', '10.20.8.32'],
  ['postgres', 'Production', 'pg15-prd-01', 'PostgreSQL 15', '10.30.8.33'],
  ['postgres', 'Production', 'pg14-prd-02', 'PostgreSQL 14', '10.30.8.34'],
  ['websphere', 'Development', 'wasnd9-dev-01', 'WebSphere ND 9.0', '10.10.9.41'],
  ['websphere', 'Non-Production', 'wasnd9-nprd-01', 'WebSphere ND 9.0', '10.20.9.42'],
  ['websphere', 'Production', 'wasnd9-prd-01', 'WebSphere ND 9.0', '10.30.9.43'],
  ['websphere', 'Production', 'wasnd9-prd-02', 'WebSphere ND 9.0', '10.30.9.44'],
  ['rhelpcs', 'Non-Production', 'pcs-rhel8-nprd-n1', 'RHEL 8.9 · Pacemaker', '10.20.4.51'],
  ['rhelpcs', 'Production', 'pcs-rhel9-prd-n1', 'RHEL 9.4 · Pacemaker', '10.30.4.52'],
  ['rhelpcs', 'Production', 'pcs-rhel9-prd-n2', 'RHEL 9.4 · Pacemaker', '10.30.4.53'],
  ['rhelpcs', 'Remediation', 'pcs-rhel8-rem-n1', 'RHEL 8.7 · Pacemaker', '10.30.9.54'],
  ['apache', 'Development', 'apache-dev-01', 'Apache HTTPD 2.4', '10.10.1.61'],
  ['apache', 'Non-Production', 'apache-nprd-01', 'Apache HTTPD 2.4', '10.20.1.62'],
  ['apache', 'Production', 'apache-prd-01', 'Apache HTTPD 2.4', '10.30.1.63'],
  ['apache', 'Production', 'apache-prd-02', 'Apache HTTPD 2.4', '10.30.1.64'],
  ['winha', 'Development', 'wsfc-dev-n1', 'Windows Server 2022 · WSFC', '10.10.6.71'],
  ['winha', 'Non-Production', 'wsfc-nprd-n1', 'Windows Server 2022 · WSFC', '10.20.6.72'],
  ['winha', 'Production', 'wsfc-prd-n1', 'Windows Server 2022 · WSFC', '10.30.6.73'],
  ['winha', 'Production', 'wsfc-prd-n2', 'Windows Server 2022 · WSFC', '10.30.6.74'],
  ['mssqlha', 'Non-Production', 'sqlha-nprd-n1', 'SQL Server 2019 · AG', '10.20.7.81'],
  ['mssqlha', 'Production', 'sqlha-prd-n1', 'SQL Server 2022 · AG', '10.30.7.82'],
  ['mssqlha', 'Production', 'sqlha-prd-n2', 'SQL Server 2022 · AG', '10.30.7.83'],
].map(([tech, env, name, os, ip]) => ({ tech, env, name, os, ip, group: groupOf(name) }));

/** Next scheduled window per week plus a snapshot of that week's last execution. */
const WEEK_RUNS = {
  W01: { window: 'Sat 03 Oct · 23:00 – 03:00', scheduled: 128, last: { total: 126, firstFlow: 112, reattempt: 11, reapplied: 17 } },
  W02: { window: 'Sat 10 Oct · 23:00 – 03:00', scheduled: 214, last: { total: 208, firstFlow: 187, reattempt: 17, reapplied: 26 } },
  W03: { window: 'Sat 17 Oct · 01:00 – 05:00', scheduled: 342, last: { total: 336, firstFlow: 301, reattempt: 28, reapplied: 41 } },
  W04: { window: 'Sat 24 Oct · 22:00 – 02:00', scheduled: 64, last: { total: 61, firstFlow: 49, reattempt: 9, reapplied: 14 } },
};

export default function PatchCycleSchedule({ onBack, settings }) {
  const [week, setWeek] = useState('W01');
  const [tech, setTech] = useState('linux');
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState({});
  const [showSchedule, setShowSchedule] = useState(false);
  const [queued, setQueued] = useState([]);
  const [scheduled, setScheduled] = useState(null);

  const w = WEEKS.find((x) => x.id === week);
  const rows = useMemo(
    () => HOSTS.filter((h) => h.tech === tech && h.env === w.env && `${h.name} ${h.ip}`.toLowerCase().includes(search.toLowerCase())),
    [tech, w.env, search],
  );
  const chosen = rows.filter((h) => selected[h.name]);
  const setAll = (v) => setSelected((s) => ({ ...s, ...Object.fromEntries(rows.map((h) => [h.name, v])) }));

  const handleSchedule = (job) => {
    setQueued((q) => [{ ...job, id: Date.now() }, ...q]);
    setShowSchedule(false);
    setScheduled(`"${job.label}" queued: ${job.servers.length} server${job.servers.length === 1 ? '' : 's'}`);
    setTimeout(() => setScheduled(null), 4000);
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div className="flex items-start gap-4">
          {onBack && (
            <button onClick={onBack} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface border border-ink/[0.1] text-xs text-fg2 hover:text-fg">
              <ArrowLeft size={13} /> Back
            </button>
          )}
          <div>
            <h3 className="text-xl font-bold text-fg tracking-tight">Patch Cycle Schedule</h3>
            <p className="text-xs text-fg3 mt-1">4-week rolling cycle · 9 stages per week · IST timezone</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="px-2 py-1 rounded-md bg-inset border border-ink/[0.08] text-[10px] font-mono text-fg3">v0</span>
          <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface border border-ink/[0.1] text-xs text-fg2 hover:text-fg">
            <RefreshCw size={13} /> Refresh
          </button>
        </div>
      </div>

      {/* Week selector */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {WEEKS.map((x) => (
          <button
            key={x.id}
            onClick={() => setWeek(x.id)}
            className={`rounded-xl px-4 py-3 text-center border transition-all ${
              week === x.id
                ? 'bg-emerald-500/10 border-emerald-500/60 shadow-[0_0_14px_rgba(16,185,129,0.15)]'
                : 'bg-surface border-ink/[0.08] hover:border-ink/20'
            }`}
          >
            <div className={`font-mono text-sm font-bold ${week === x.id ? 'text-emerald-400' : 'text-fg2'}`}>{x.id}</div>
            <div className={`text-xs mt-0.5 ${week === x.id ? 'text-fg font-semibold' : 'text-fg3'}`}>{x.env}</div>
          </button>
        ))}
      </div>

      {/* Stage strip */}
      <div className="nexus-card p-4">
        <div className="text-[11px] font-bold uppercase tracking-wider text-fg3 mb-3">{week} · {w.env} — weekly stages</div>
        <div className="grid grid-cols-3 md:grid-cols-9 gap-2">
          {STAGES.map((s, i) => (
            <div key={s} className="rounded-lg bg-inset border border-ink/[0.08] px-2 py-2 text-center">
              <div className="text-[9px] font-mono text-fg4">{String(i + 1).padStart(2, '0')}</div>
              <div className="text-[11px] text-fg2 font-medium leading-tight mt-0.5">{s}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Planner */}
      <div className="nexus-card p-5 space-y-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h4 className="text-base font-bold text-fg">Patch Target Planner</h4>
            <p className="text-xs text-fg3 mt-0.5">{w.env} environment · Select technology &amp; hosts, then schedule a run</p>
          </div>
          <span className="flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/30">
            <Check size={12} /> Editable
          </span>
        </div>

        <div>
          <div className="text-[11px] font-bold uppercase tracking-wider text-fg3 mb-2">Technology</div>
          <div className="flex flex-wrap gap-2">
            {TECHS.map((t) => (
              <button
                key={t.id}
                onClick={() => setTech(t.id)}
                className={`px-4 py-2 rounded-xl text-xs font-semibold border transition-all ${
                  tech === t.id ? 'bg-blue-500/15 border-blue-500/70 text-fg' : 'bg-surface border-ink/[0.08] text-fg2 hover:border-ink/20'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-2 text-xs text-fg3">
            <Server size={13} />
            <span>{rows.length} hosts in {w.env}</span>
            {rows.length === 0 && <span className="text-amber-400">— no {tech} hosts tagged for this environment</span>}
          </div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-fg4" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search…"
                className="w-52 pl-8 pr-2 py-1.5 rounded-lg bg-inset border border-ink/[0.08] text-xs text-fg placeholder-fg4 focus:outline-none focus:border-cyan-500/50"
              />
            </div>
            <button onClick={() => setAll(true)} className="px-3 py-1.5 rounded-lg bg-surface border border-ink/[0.1] text-xs text-fg2 hover:text-fg">All</button>
            <button onClick={() => setAll(false)} className="px-3 py-1.5 rounded-lg bg-surface border border-ink/[0.1] text-xs text-fg2 hover:text-fg">None</button>
          </div>
        </div>

        <div className="rounded-xl border border-ink/[0.08] overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="bg-inset text-[10px] uppercase tracking-wider text-fg3 text-left">
                <th className="w-10 px-3 py-2.5" />
                <th className="px-3 py-2.5">Hostname</th>
                <th className="px-3 py-2.5">OS</th>
                <th className="px-3 py-2.5">Environment</th>
                <th className="px-3 py-2.5">IP</th>
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-10 text-center text-fg3">
                    No {tech} hosts found for <b className="text-fg2">{w.env}</b> environment.
                    <div className="text-[11px] text-fg4 mt-1">Check CMDB inventory tags.</div>
                  </td>
                </tr>
              )}
              {rows.map((h) => (
                <tr key={h.name} className="border-t border-ink/[0.06] hover:bg-ink/[0.03]">
                  <td className="px-3 py-2.5">
                    <input
                      type="checkbox"
                      checked={!!selected[h.name]}
                      onChange={(e) => setSelected((s) => ({ ...s, [h.name]: e.target.checked }))}
                      className="accent-cyan-500"
                    />
                  </td>
                  <td className="px-3 py-2.5 font-mono text-fg">{h.name}</td>
                  <td className="px-3 py-2.5 text-fg2">{h.os}</td>
                  <td className="px-3 py-2.5 text-fg2">{h.env}</td>
                  <td className="px-3 py-2.5 font-mono text-fg3">{h.ip}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-end gap-3 flex-wrap pt-1">
          {scheduled && (
            <span className="flex items-center gap-1.5 text-xs text-emerald-400"><CircleCheck size={14} /> {scheduled}</span>
          )}
          <button
            onClick={() => setShowSchedule(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-onbright text-xs font-semibold transition-all active:scale-95"
          >
            <CalendarClock size={14} /> Schedule patch run{chosen.length > 0 && ` (${chosen.length})`}
          </button>
        </div>
      </div>

      {/* Scheduled patch runs W01–W04 + execution snapshot */}
      <div className="nexus-card p-5 space-y-4">
        <div className="flex items-start justify-between gap-3 flex-wrap">
          <div>
            <h4 className="text-base font-bold text-fg">Scheduled Patch Runs · W01–W04</h4>
            <p className="text-xs text-fg3 mt-0.5">Next window per week, with a snapshot of how its last execution went</p>
          </div>
          {settings && (
            <div className="flex gap-2 text-[10px] font-mono text-fg3">
              <span className="px-2 py-1 rounded-md bg-inset border border-ink/[0.08]">soak {settings.scheduling.soakHours}h</span>
              <span className="px-2 py-1 rounded-md bg-inset border border-ink/[0.08]">max {settings.scheduling.maxCisPerWave} CIs / wave</span>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3">
          {WEEKS.map((x) => {
            const { window: win, scheduled: n, last } = WEEK_RUNS[x.id];
            const unresolved = last.total - last.firstFlow - last.reattempt;
            const pct = (v) => `${(v / last.total) * 100}%`;
            return (
              <div key={x.id} className={`rounded-xl border p-4 space-y-3 ${week === x.id ? 'border-emerald-500/50 bg-emerald-500/[0.04]' : 'border-ink/[0.08] bg-surface'}`}>
                <div className="flex items-center justify-between">
                  <span className="font-mono text-sm font-bold text-emerald-400">{x.id}</span>
                  <span className="text-[11px] text-fg2 font-semibold">{x.env}</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-fg2">
                  <CalendarClock size={13} className="text-cyan-400 flex-shrink-0" />
                  <span>{win} IST</span>
                </div>
                <div className="text-[11px] text-fg3">{n} VMs scheduled</div>

                <div className="pt-2 border-t border-ink/[0.06] space-y-2">
                  <div className="text-[10px] uppercase tracking-wider text-fg3">Last execution snapshot · {last.total} VMs</div>
                  <div className="flex h-2 rounded-full overflow-hidden bg-inset">
                    <div className="bg-emerald-400" style={{ width: pct(last.firstFlow) }} />
                    <div className="bg-amber-400" style={{ width: pct(last.reattempt) }} />
                    <div className="bg-red-400" style={{ width: pct(unresolved) }} />
                  </div>
                  <dl className="space-y-1 text-[11px]">
                    <div className="flex justify-between"><dt className="flex items-center gap-1.5 text-fg3"><span className="w-1.5 h-1.5 rounded-full bg-emerald-400" /> Patched in first flow</dt><dd className="font-mono font-bold text-fg">{last.firstFlow}</dd></div>
                    <div className="flex justify-between"><dt className="flex items-center gap-1.5 text-fg3"><RotateCcw size={10} className="text-amber-400" /> Took reattempt</dt><dd className="font-mono font-bold text-fg">{last.reattempt}</dd></div>
                    <div className="flex justify-between"><dt className="flex items-center gap-1.5 text-fg3"><Wrench size={10} className="text-sky-400" /> Patches reapplied</dt><dd className="font-mono font-bold text-fg">{last.reapplied}</dd></div>
                    <div className="flex justify-between"><dt className="flex items-center gap-1.5 text-fg3"><span className="w-1.5 h-1.5 rounded-full bg-red-400" /> Unresolved</dt><dd className="font-mono font-bold text-fg">{unresolved}</dd></div>
                  </dl>
                </div>
              </div>
            );
          })}
        </div>

        {queued.length > 0 && (
          <div className="space-y-1.5 pt-1">
            <div className="text-[11px] font-bold uppercase tracking-wider text-fg3">Queued by you ({queued.length})</div>
            {queued.map((j) => (
              <div key={j.id} className="flex flex-wrap items-center justify-between gap-2 px-3 py-2 rounded-lg bg-inset border border-ink/[0.06] text-xs">
                <span className="font-mono text-fg">{j.label}</span>
                <span className="text-fg3">{j.week} · {TECHS.find((t) => t.id === j.tech).label}{j.group && ` · ${j.group}`} · {j.servers.length} servers</span>
                <span className="text-cyan-400 font-mono">{new Date(j.when).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })} IST</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {showSchedule && (
        <ScheduleRunModal
          week={week}
          env={w.env}
          techs={TECHS}
          hosts={HOSTS}
          initialTech={tech}
          chosenNames={chosen.map((h) => h.name)}
          settings={settings ?? { scheduling: { window: 'Sat 23:00 – 03:00 IST', soakHours: 24, maxCisPerWave: 50 } }}
          onClose={() => setShowSchedule(false)}
          onSchedule={handleSchedule}
        />
      )}
    </div>
  );
}
