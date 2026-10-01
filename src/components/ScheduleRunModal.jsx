import React, { useMemo, useState } from 'react';
import { X, CalendarClock, Layers, AlertTriangle } from 'lucide-react';
import Select from './ui/Select';
import ModalPortal from './ui/ModalPortal';

const NO_GROUP = 'No group (selected servers only)';
const pad = (n) => String(n).padStart(2, '0');
const isoDate = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

/** Next occurrence of a weekday (0 = Sun) at 23:00, or tonight if `weekday` is null. */
function nextSlot(weekday) {
  const d = new Date();
  if (weekday !== null) d.setDate(d.getDate() + ((weekday - d.getDay() + 7) % 7 || 7));
  return { date: isoDate(d), time: '23:00' };
}

export default function ScheduleRunModal({ week, env, techs, hosts, initialTech, chosenNames, settings, onClose, onSchedule }) {
  const [tech, setTech] = useState(initialTech);
  const [label, setLabel] = useState(`${week}-${initialTech.toUpperCase()}-${isoDate(new Date()).replaceAll('-', '')}`);
  const [slot, setSlot] = useState(nextSlot(6));
  const [group, setGroup] = useState(NO_GROUP);

  const envHosts = useMemo(() => hosts.filter((h) => h.tech === tech && h.env === env), [hosts, tech, env]);
  const groups = [...new Set(envHosts.map((h) => h.group))];
  const effectiveGroup = groups.includes(group) ? group : NO_GROUP;
  const servers =
    effectiveGroup !== NO_GROUP
      ? envHosts.filter((h) => h.group === effectiveGroup)
      : tech === initialTech
      ? envHosts.filter((h) => chosenNames.includes(h.name))
      : envHosts;
  const waves = Math.ceil(servers.length / settings.scheduling.maxCisPerWave);
  const canSubmit = label.trim() && slot.date && slot.time && servers.length > 0;

  const submit = (e) => {
    e.preventDefault();
    onSchedule({ label: label.trim(), tech, week, group: effectiveGroup === NO_GROUP ? null : effectiveGroup, when: `${slot.date}T${slot.time}`, servers });
  };

  const field = 'w-full bg-inset border border-ink/[0.08] rounded-xl px-3 py-2 text-xs text-fg focus:outline-none focus:border-cyan-500';

  return (
    <ModalPortal>
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <form onSubmit={submit} role="dialog" aria-label="Schedule patch run" className="w-full max-w-2xl max-h-[90vh] flex flex-col bg-surface text-fg border border-cyan-500/30 rounded-2xl shadow-2xl animate-in zoom-in-95">
        <div className="flex items-center justify-between p-5 pb-3 border-b border-ink/[0.08]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-cyan-950/80 border border-cyan-500/40 flex items-center justify-center text-cyan-400"><CalendarClock size={17} /></div>
            <div>
              <h3 className="text-base font-bold">Schedule patch run</h3>
              <p className="text-[11px] text-fg3">{week} · {env} · IST</p>
            </div>
          </div>
          <button type="button" onClick={onClose} aria-label="Close" className="p-1 text-fg3 hover:text-fg rounded-lg hover:bg-ink/[0.08]"><X size={18} /></button>
        </div>

        <div className="p-5 space-y-4 overflow-y-auto custom-scrollbar">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-fg2" htmlFor="job-label">Job label</label>
            <input id="job-label" value={label} onChange={(e) => setLabel(e.target.value)} placeholder="e.g. W03-RHEL-Oct-cycle" className={`${field} font-mono`} required />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-fg2" htmlFor="job-date">Date</label>
              <input id="job-date" type="date" value={slot.date} onChange={(e) => setSlot({ ...slot, date: e.target.value })} className={field} required />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-fg2" htmlFor="job-time">Time (IST)</label>
              <input id="job-time" type="time" value={slot.time} onChange={(e) => setSlot({ ...slot, time: e.target.value })} className={field} required />
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2 -mt-2 text-[11px]">
            <span className="text-fg3">Quick pick</span>
            {[['Tonight 23:00', null], ['This Saturday 23:00', 6], ['This Sunday 23:00', 0]].map(([text, day]) => (
              <button key={text} type="button" onClick={() => setSlot(nextSlot(day))} className="px-2.5 py-1 rounded-full border border-ink/[0.1] text-fg2 hover:text-fg hover:border-cyan-500/40">{text}</button>
            ))}
            <span className="text-fg4">Default window: {settings.scheduling.window}</span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <span className="text-xs font-semibold text-fg2">Technology tab</span>
              <Select value={tech} onValueChange={setTech} options={techs.map((t) => ({ value: t.id, label: t.label }))} className="w-full" />
            </div>
            <div className="space-y-1.5">
              <span className="text-xs font-semibold text-fg2">Server group <span className="text-fg4 font-normal">(optional)</span></span>
              <Select value={effectiveGroup} onValueChange={setGroup} options={[NO_GROUP, ...groups]} className="w-full" />
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-fg2 flex items-center gap-1.5"><Layers size={13} className="text-cyan-400" /> Servers to be patched</span>
              <span className="text-[11px] font-mono text-cyan-400">{servers.length} server{servers.length === 1 ? '' : 's'}</span>
            </div>
            <div className="rounded-xl border border-ink/[0.08] overflow-hidden">
              <div className="max-h-52 overflow-y-auto custom-scrollbar">
                <table className="w-full text-xs">
                  <thead className="sticky top-0 bg-inset text-[10px] uppercase tracking-wider text-fg3 text-left">
                    <tr><th className="px-3 py-2">Hostname</th><th className="px-3 py-2">OS</th><th className="px-3 py-2">Group</th><th className="px-3 py-2">IP</th></tr>
                  </thead>
                  <tbody>
                    {servers.length === 0 && (
                      <tr><td colSpan={4} className="py-8 text-center text-fg3">No servers selected. Pick hosts in the planner or choose a server group.</td></tr>
                    )}
                    {servers.map((h) => (
                      <tr key={h.name} className="border-t border-ink/[0.06]">
                        <td className="px-3 py-2 font-mono text-fg">{h.name}</td>
                        <td className="px-3 py-2 text-fg2">{h.os}</td>
                        <td className="px-3 py-2 text-fg2">{h.group}</td>
                        <td className="px-3 py-2 font-mono text-fg3">{h.ip}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            {waves > 1 && (
              <p className="flex items-center gap-1.5 text-[11px] text-amber-400"><AlertTriangle size={12} /> Split into {waves} waves of up to {settings.scheduling.maxCisPerWave} servers, {settings.scheduling.soakHours}h soak between waves.</p>
            )}
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 p-4 border-t border-ink/[0.08]">
          <button type="button" onClick={onClose} className="px-4 py-2 rounded-xl bg-surface border border-ink/[0.1] text-xs font-semibold text-fg2 hover:text-fg">Cancel</button>
          <button type="submit" disabled={!canSubmit} className="px-4 py-2 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-onbright text-xs font-semibold transition-all active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed">
            Schedule patch run
          </button>
        </div>
      </form>
    </div>
    </ModalPortal>
  );
}
