import React, { useState } from 'react';
import { Plug, Plus, Trash2, SlidersHorizontal, Eye, Server, Loader2, CheckCircle2, XCircle, HelpCircle, ArrowUpRight } from 'lucide-react';
import ConnectorWizard from './ConnectorWizard';
import { TECH_CONNECTORS, INFRA_CONNECTORS, KIND_FILTERS } from '../data/connectorData';

const DOMAIN_KIND = { OS: 'linux', Database: 'database', Middleware: 'middleware' };

export default function ConnectorMarketplace() {
  const [connectors, setConnectors] = useState(TECH_CONNECTORS);
  const [filter, setFilter] = useState('all');
  const [wizard, setWizard] = useState(null);           // null | preset object
  const [detailsId, setDetailsId] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [openInfra, setOpenInfra] = useState(null);
  const [testing, setTesting] = useState(null);
  const [infraState, setInfraState] = useState({});     // id -> ok override after re-test
  const [toast, setToast] = useState(null);

  const visible = connectors.filter((c) => filter === 'all' || c.kind === filter);
  const count = (s) => connectors.filter((c) => c.status === s).length;

  const activate = (d) => {
    const kind = d.tech === 'Windows' ? 'windows' : DOMAIN_KIND[d.domain] || 'generic';
    setConnectors((p) => [
      { id: `${d.tech}-${Date.now()}`, name: d.tech, kind, auth: d.execMode === 'api' ? 'API' : 'SCRIPT', tier: 'T2', code: 'Low-Code', status: 'Registered', logo: '#6366f1' },
      ...p,
    ]);
    setWizard(null);
    setToast(`${d.domain} / ${d.tech} connector registered.`);
    setTimeout(() => setToast(null), 4000);
  };

  const retest = (id) => {
    setTesting(id);
    setTimeout(() => {
      setInfraState((s) => ({ ...s, [id]: INFRA_CONNECTORS.find((i) => i.id === id).ok === false ? false : true }));
      setTesting(null);
    }, 900);
  };

  const pill = (label, tone) => (
    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold font-mono border ${tone}`}>{label}</span>
  );

  return (
    <div className="p-6 w-full space-y-6 animate-in fade-in">
        {/* Status + actions (the top bar already names the page) */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 text-[11px] font-bold uppercase tracking-wider">
            <Plug size={14} className="text-emerald-400" />
            <span className="text-fg3 font-medium">{connectors.length} technology connectors · {INFRA_CONNECTORS.length} infrastructure</span>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {pill(`${count('Active')} ACTIVE`, 'text-emerald-300 bg-emerald-500/10 border-emerald-500/30')}
            {pill(`${count('Registered')} REGISTERED`, 'text-sky-300 bg-sky-500/10 border-sky-500/30')}
            {pill('0 STUB', 'text-amber-300 bg-amber-500/10 border-amber-500/30')}
            {pill('0 NEEDS CONFIG', 'text-red-300 bg-red-500/10 border-red-500/30')}
            <button
              onClick={() => setWizard({})}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-lg shadow-indigo-500/25"
            >
              <Plus size={14} /> Add Connector
            </button>
          </div>
        </div>

          {toast && (
            <div role="status" className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-xs text-emerald-300">
              <CheckCircle2 size={14} /> {toast}
            </div>
          )}

          {/* Kind filters */}
          <div className="flex flex-wrap gap-2" role="tablist">
            {KIND_FILTERS.map((k) => (
              <button
                key={k}
                role="tab"
                aria-selected={filter === k}
                onClick={() => setFilter(k)}
                className={`px-3.5 py-1 rounded-full border text-[11px] font-semibold capitalize transition-all ${
                  filter === k ? 'border-cyan-400 text-cyan-200 bg-cyan-500/10' : 'border-ink/10 text-fg2 hover:border-ink/25'
                }`}
              >
                {k}
              </button>
            ))}
          </div>

          {/* Technology connectors */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-3">
            {visible.map((c) => (
              <div key={c.id} className="rounded-xl border border-ink/[0.08] bg-inset p-4 space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 border border-ink/10" style={{ background: `${c.logo}22` }}>
                      <Server size={16} style={{ color: c.logo }} />
                    </span>
                    <div className="min-w-0">
                      <div className="text-sm font-bold text-fg truncate">{c.name}</div>
                      <div className="text-[11px] text-fg3">{c.kind} · {c.auth}</div>
                    </div>
                  </div>
                  <span className={`px-2 py-0.5 rounded border text-[10px] font-bold flex-shrink-0 ${c.status === 'Active' ? 'text-emerald-300 bg-emerald-500/10 border-emerald-500/30' : 'text-sky-300 bg-sky-500/10 border-sky-500/30'}`}>{c.status}</span>
                </div>

                {detailsId === c.id && (
                  <dl className="grid grid-cols-2 gap-x-3 gap-y-1 text-[10px] p-2.5 rounded-lg bg-black/25">
                    <dt className="text-fg4">Tier</dt><dd className="text-fg2">{c.tier}</dd>
                    <dt className="text-fg4">Build</dt><dd className="text-fg2">{c.code}</dd>
                    <dt className="text-fg4">Auth</dt><dd className="text-fg2">{c.auth}</dd>
                    <dt className="text-fg4">Kind</dt><dd className="text-fg2">{c.kind}</dd>
                  </dl>
                )}

                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="px-2 py-1 rounded-md bg-ink/[0.04] border border-ink/10 text-[9px] leading-tight text-fg2">{c.tier} · {c.code}</span>
                  {deleteId === c.id ? (
                    <>
                      <button onClick={() => { setConnectors((p) => p.filter((x) => x.id !== c.id)); setDeleteId(null); }} className="px-2 py-1 rounded-md bg-red-500/20 border border-red-500/40 text-[10px] font-bold text-red-300">Confirm?</button>
                      <button onClick={() => setDeleteId(null)} className="px-2 py-1 text-[10px] text-fg3 hover:text-fg">Cancel</button>
                    </>
                  ) : (
                    <>
                      <button onClick={() => setDetailsId(detailsId === c.id ? null : c.id)} className="flex items-center gap-1 px-2 py-1 rounded-md border border-emerald-500/30 text-[10px] font-semibold text-emerald-300 hover:bg-emerald-500/10"><Eye size={10} /> Details</button>
                      <button onClick={() => setWizard({ domain: Object.keys(DOMAIN_KIND).find((d) => DOMAIN_KIND[d] === c.kind) || '', tech: c.name })} className="flex items-center gap-1 px-2 py-1 rounded-md border border-ink/15 text-[10px] font-semibold text-fg2 hover:bg-ink/5"><SlidersHorizontal size={10} /> Configure</button>
                      <button onClick={() => setDeleteId(c.id)} className="flex items-center gap-1 px-2 py-1 rounded-md border border-red-500/30 text-[10px] font-semibold text-red-300 hover:bg-red-500/10"><Trash2 size={10} /> Delete</button>
                    </>
                  )}
                </div>
              </div>
            ))}
            {!visible.length && <p className="text-xs text-fg4 col-span-full py-6 text-center">No {filter} connectors yet.</p>}
          </div>

          {/* ITSM & infrastructure */}
          <section className="space-y-3">
            <h3 className="text-[11px] font-bold uppercase tracking-wider text-fg2 flex items-center gap-2"><Server size={12} /> ITSM &amp; Infrastructure</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-6 gap-3">
              {INFRA_CONNECTORS.map((i) => {
                const ok = infraState[i.id] ?? i.ok;
                const expanded = openInfra === i.id;
                return (
                  <div key={i.id} className={`rounded-xl border bg-inset p-3.5 space-y-2 ${ok === false ? 'border-red-500/30' : 'border-ink/[0.08]'}`}>
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <div className="text-xs font-bold text-fg">{i.name}</div>
                        <div className="text-[10px] text-fg4">{i.type}</div>
                      </div>
                      <span className={`px-1.5 py-0.5 rounded border text-[9px] font-bold flex-shrink-0 ${ok === false ? 'text-red-300 bg-red-500/10 border-red-500/30' : 'text-emerald-300 bg-emerald-500/10 border-emerald-500/30'}`}>{ok === false ? 'Down' : 'Active'}</span>
                    </div>
                    <p className="text-[10px] text-fg3 leading-snug break-words">
                      {i.desc}
                      {i.ok !== null && <span className={ok ? 'text-emerald-400' : 'text-red-400'}>{' · '}{ok ? 'Reachable ✓' : 'Unreachable'}</span>}
                    </p>
                    {expanded && (
                      <div className="flex items-center justify-between gap-2 p-2 rounded-lg bg-black/25 text-[10px]">
                        <span className="flex items-center gap-1 text-fg2">
                          {ok === null ? <HelpCircle size={11} className="text-fg4" /> : ok ? <CheckCircle2 size={11} className="text-emerald-400" /> : <XCircle size={11} className="text-red-400" />}
                          {ok === null ? 'Not tested' : ok ? 'Last check passed' : 'Last check failed'}
                        </span>
                        <button onClick={() => retest(i.id)} disabled={testing === i.id} className="px-2 py-0.5 rounded border border-cyan-500/40 text-cyan-300 font-semibold disabled:opacity-60">
                          {testing === i.id ? <Loader2 size={10} className="animate-spin" /> : 'Re-test'}
                        </button>
                      </div>
                    )}
                    <button onClick={() => setOpenInfra(expanded ? null : i.id)} className="flex items-center gap-1 text-[10px] font-semibold text-cyan-300 hover:text-cyan-200">
                      {expanded ? 'Close' : 'Open'} <ArrowUpRight size={10} />
                    </button>
                  </div>
                );
              })}
            </div>
          </section>


      {wizard && <ConnectorWizard preset={wizard} onClose={() => setWizard(null)} onActivate={activate} />}
    </div>
  );
}
