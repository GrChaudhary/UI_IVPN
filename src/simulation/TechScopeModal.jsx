import React, { useMemo, useState } from 'react';
import { X, Search, Server } from 'lucide-react';
import { ASSETS_BY_TECH } from '../data/cmdbData';
import Toggle from '../components/ui/Toggle';
import ModalPortal from '../components/ui/ModalPortal';
import Select from '../components/ui/Select';

const ALL_ENVS = 'All environments';
const ALL_GROUPS = 'All support groups';
const ANY_STATE = 'Any selection';

/** Lists the CMDB servers that fall under one technology scope. Closing keeps the scope; "Remove" drops it. */
export default function TechScopeModal({ tech, excluded, onToggle, onSetMany, onClose, onRemove }) {
  const [query, setQuery] = useState('');
  const [env, setEnv] = useState(ALL_ENVS);
  const [group, setGroup] = useState(ALL_GROUPS);
  const [state, setState] = useState(ANY_STATE);
  const servers = ASSETS_BY_TECH[tech.value] ?? [];
  const envs = [...new Set(servers.map((a) => a.env))].sort();
  const groups = [...new Set(servers.map((a) => a.group))].sort();
  const rows = useMemo(
    () =>
      servers.filter(
        (a) =>
          `${a.name} ${a.ip} ${a.os} ${a.env} ${a.group}`.toLowerCase().includes(query.toLowerCase()) &&
          (env === ALL_ENVS || a.env === env) &&
          (group === ALL_GROUPS || a.group === group) &&
          (state === ANY_STATE || (state === 'Selected') === !excluded.has(a.id)),
      ),
    [servers, query, env, group, state, excluded],
  );
  const Icon = tech.icon;
  const isOn = (a) => !excluded.has(a.id);
  const selectedCount = servers.filter(isOn).length;
  const allShownOn = rows.length > 0 && rows.every(isOn);

  return (
    <ModalPortal>
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div role="dialog" aria-label={`${tech.label} servers in scope`} className="w-full max-w-4xl max-h-[85vh] flex flex-col bg-surface text-fg border border-cyan-500/30 rounded-2xl shadow-2xl animate-in zoom-in-95">
        <div className="flex items-center justify-between p-5 pb-3 border-b border-ink/[0.08]">
          <div className="flex items-center gap-3">
            <div className={`w-9 h-9 rounded-lg bg-gradient-to-br ${tech.color} flex items-center justify-center text-white`}><Icon size={17} /></div>
            <div>
              <h3 className="text-base font-bold">{tech.label} · servers in scope</h3>
              <p className="text-[11px] text-fg3">From CMDB · {selectedCount} of {servers.length} servers selected</p>
            </div>
          </div>
          <button onClick={onClose} aria-label="Close" className="p-1 text-fg3 hover:text-fg rounded-lg hover:bg-ink/[0.08]"><X size={18} /></button>
        </div>

        <div className="px-5 pt-3 flex flex-wrap items-center gap-2">
          <div className="relative flex-1 min-w-[160px] max-w-xs">
            <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-fg4" />
            <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Filter servers…" className="w-full pl-8 pr-2 py-1.5 rounded-lg bg-inset border border-ink/[0.08] text-xs text-fg placeholder-fg4 focus:outline-none focus:border-cyan-500/50" />
          </div>
          <Select value={env} onValueChange={setEnv} options={[ALL_ENVS, ...envs]} className="w-44" />
          <Select value={group} onValueChange={setGroup} options={[ALL_GROUPS, ...groups]} className="w-48" />
          <Select value={state} onValueChange={setState} options={[ANY_STATE, 'Selected', 'Unselected']} className="w-36" />
          <div className="flex items-center gap-3 ml-auto">
            <span className="flex items-center gap-1.5 text-[11px] font-mono text-fg3"><Server size={12} /> {rows.length} shown</span>
            <label className="flex items-center gap-2 text-[11px] text-fg2">
              {allShownOn ? 'Unselect all' : 'Select all'}
              <Toggle checked={allShownOn} onChange={(v) => onSetMany(rows.map((a) => a.id), v)} label="Select all shown servers" />
            </label>
          </div>
        </div>

        <div className="p-5 pt-3 min-h-0 flex-1">
          <div className="h-full max-h-[48vh] overflow-y-auto custom-scrollbar rounded-xl border border-ink/[0.08]">
            <table className="w-full text-xs">
              <thead className="sticky top-0 z-10 bg-inset text-[10px] uppercase tracking-wider text-fg3 text-left">
                <tr><th className="px-3 py-2 w-14">Patch</th><th className="px-3 py-2">Name</th><th className="px-3 py-2">IP</th><th className="px-3 py-2">OS</th><th className="px-3 py-2">Env</th><th className="px-3 py-2">Support group</th></tr>
              </thead>
              <tbody>
                {rows.length === 0 && <tr><td colSpan={6} className="py-8 text-center text-fg3">No servers match.</td></tr>}
                {rows.map((a) => (
                  <tr key={a.id} className={`border-t border-ink/[0.06] hover:bg-ink/[0.03] ${isOn(a) ? '' : 'opacity-50'}`}>
                    <td className="px-3 py-2"><Toggle checked={isOn(a)} onChange={() => onToggle(a.id)} label={`Include ${a.name}`} /></td>
                    <td className="px-3 py-2 font-mono text-fg">{a.name}</td>
                    <td className="px-3 py-2 font-mono text-fg3">{a.ip}</td>
                    <td className="px-3 py-2 text-fg2">{a.os} {a.osVersion}</td>
                    <td className="px-3 py-2 text-fg2">{a.env}</td>
                    <td className="px-3 py-2 text-fg2">{a.group}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 p-4 border-t border-ink/[0.08]">
          <button onClick={onRemove} className="px-4 py-2 rounded-xl bg-surface border border-ink/[0.1] text-xs font-semibold text-fg2 hover:text-rose-300">Remove from scope</button>
          <button onClick={onClose} disabled={selectedCount === 0} className="px-4 py-2 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-onbright text-xs font-semibold active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed">Keep {selectedCount} server{selectedCount === 1 ? '' : 's'} in scope</button>
        </div>
      </div>
    </div>
    </ModalPortal>
  );
}
