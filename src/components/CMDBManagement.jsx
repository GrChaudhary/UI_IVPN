import React, { useState, useMemo, useEffect } from 'react';
import {
  Search,
  RefreshCw,
  Download,
  BookOpen,
  ScanSearch,
  ArrowUp,
  ArrowDown,
  Filter,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  Loader2,
} from 'lucide-react';
import Select from './ui/Select';
import { buildAssets, SOP_COVERED, GROUPS } from '../data/cmdbData';

const COLUMNS = [
  { key: 'name',        label: 'Name',        mono: false, w: 'min-w-[230px]' },
  { key: 'ip',          label: 'IP Address',  mono: true,  w: 'min-w-[130px]' },
  { key: 'host',        label: 'Host Name',   mono: false, w: 'min-w-[230px]' },
  { key: 'dns',         label: 'DNS Domain',  mono: false, w: 'min-w-[120px]' },
  { key: 'os',          label: 'OS',          mono: false, w: 'min-w-[240px]' },
  { key: 'osVersion',   label: 'OS Version',  mono: false, w: 'min-w-[100px]' },
  { key: 'env',         label: 'Environment', mono: false, w: 'min-w-[120px]' },
  { key: 'group',       label: 'Support Group', mono: false, w: 'min-w-[150px]' },
];

const csvCell = (v) => `"${String(v).replace(/"/g, '""')}"`;

export default function CMDBManagement() {
  const [tab, setTab] = useState('registry');
  const [assets, setAssets] = useState(() => buildAssets());
  const [search, setSearch] = useState('');
  const [colFilters, setColFilters] = useState({});
  const [showFilters, setShowFilters] = useState(false);
  const [sort, setSort] = useState({ key: 'name', dir: 'asc' });
  const [pageSize, setPageSize] = useState(25);
  const [page, setPage] = useState(1);
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [refreshedAt, setRefreshedAt] = useState(() => new Date());
  const [refreshing, setRefreshing] = useState(false);
  const [autoIngest, setAutoIngest] = useState(false);
  const [scan, setScan] = useState(null); // null | 'running' | result

  const refresh = () => {
    setRefreshing(true);
    setTimeout(() => { setRefreshing(false); setRefreshedAt(new Date()); }, 700);
  };
  useEffect(() => {
    if (!autoRefresh) return undefined;
    const t = setInterval(refresh, 60000);
    return () => clearInterval(t);
  }, [autoRefresh]);

  const rows = useMemo(() => {
    const q = search.trim().toLowerCase();
    const list = assets.filter(
      (a) =>
        (!q || COLUMNS.some((c) => String(a[c.key]).toLowerCase().includes(q))) &&
        COLUMNS.every((c) => !colFilters[c.key] || String(a[c.key]).toLowerCase().includes(colFilters[c.key].toLowerCase())),
    );
    const { key, dir } = sort;
    return [...list].sort((a, b) => String(a[key]).localeCompare(String(b[key]), undefined, { numeric: true }) * (dir === 'asc' ? 1 : -1));
  }, [assets, search, colFilters, sort]);

  const pages = Math.max(1, Math.ceil(rows.length / pageSize));
  const safePage = Math.min(page, pages);
  const start = (safePage - 1) * pageSize;
  const visible = rows.slice(start, start + pageSize);

  const toggleSort = (key) =>
    setSort((s) => (s.key === key ? { key, dir: s.dir === 'asc' ? 'desc' : 'asc' } : { key, dir: 'asc' }));

  const exportCsv = () => {
    const csv = [COLUMNS.map((c) => csvCell(c.label)).join(',')]
      .concat(rows.map((a) => COLUMNS.map((c) => csvCell(a[c.key])).join(',')))
      .join('\n');
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = 'cmdb-assets.csv';
    link.click();
    URL.revokeObjectURL(url);
  };

  const runSopScan = () => {
    setScan('running');
    setTimeout(() => {
      const gaps = {};
      assets.forEach((a) => { if (!SOP_COVERED.test(a.os)) gaps[a.os] = (gaps[a.os] || 0) + 1; });
      const gapCount = Object.values(gaps).reduce((n, v) => n + v, 0);
      setScan({ total: assets.length, covered: assets.length - gapCount, gaps: Object.entries(gaps).sort((a, b) => b[1] - a[1]), ingested: autoIngest });
    }, 1400);
  };

  const inputCls = 'bg-inset border border-ink/[0.08] rounded-lg px-3 py-2 text-xs text-fg placeholder-fg4 focus:outline-none focus:border-cyan-500';

  return (
    <div className="p-6 space-y-5 w-full max-w-[1600px] mx-auto animate-in fade-in">
      <h2 className="text-xl font-bold text-fg tracking-tight">CMDB Management</h2>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-ink/[0.08]" role="tablist">
        {[['registry', 'CMDB Asset Registry'], ['register', 'Register / Update']].map(([id, label]) => (
          <button
            key={id}
            role="tab"
            aria-selected={tab === id}
            onClick={() => setTab(id)}
            className={`px-5 py-2.5 text-sm font-semibold border-b-2 -mb-px transition-all ${
              tab === id ? 'text-teal-300 border-teal-400' : 'text-fg3 border-transparent hover:text-fg'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {tab === 'registry' ? (
        <>
          {/* Title + actions */}
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h3 className="text-2xl font-extrabold text-fg tracking-tight">CMDB Asset Registry</h3>
              <p className="text-xs text-fg3 mt-1">
                ServiceNow · BLR-DC Region · {assets.length} assets · {COLUMNS.length} columns
                <span className="text-fg4"> · refreshed {refreshedAt.toLocaleTimeString()}</span>
              </p>
            </div>
            <div className="flex items-center gap-3">
              <label className="flex items-center gap-2 text-xs text-fg2 cursor-pointer">
                <input type="checkbox" checked={autoRefresh} onChange={(e) => setAutoRefresh(e.target.checked)} className="accent-teal-400" />
                Auto-refresh (60s)
              </label>
              <button onClick={refresh} className="flex items-center gap-2 px-4 py-2 bg-ink/[0.04] hover:bg-ink/[0.08] border border-ink/10 rounded-lg text-xs font-semibold text-fg">
                <RefreshCw size={13} className={refreshing ? 'animate-spin' : ''} /> Refresh
              </button>
              <button onClick={exportCsv} className="flex items-center gap-2 px-4 py-2 bg-ink/[0.04] hover:bg-ink/[0.08] border border-ink/10 rounded-lg text-xs font-semibold text-fg">
                <Download size={13} /> CSV
              </button>
            </div>
          </div>

          {/* SOP Coverage Scanner */}
          <div className="nexus-card p-5 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-11 h-11 rounded-xl bg-violet-500/25 border border-violet-400/40 flex items-center justify-center text-violet-200">
                  <BookOpen size={20} />
                </div>
                <div>
                  <div className="text-sm font-bold text-fg">SOP Coverage Scanner</div>
                  <div className="text-xs text-fg3">Scans CMDB assets → maps OS to SOP tech → identifies coverage gaps</div>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 text-xs text-fg2 cursor-pointer">
                  <input type="checkbox" checked={autoIngest} onChange={(e) => setAutoIngest(e.target.checked)} className="accent-violet-400" />
                  Auto-ingest to Milvus
                </label>
                <button
                  onClick={runSopScan}
                  disabled={scan === 'running'}
                  className="flex items-center gap-2 px-5 py-2.5 bg-violet-500 hover:bg-violet-400 text-white font-bold text-xs rounded-xl shadow-lg shadow-violet-500/25 disabled:opacity-60"
                >
                  {scan === 'running' ? <Loader2 size={14} className="animate-spin" /> : <ScanSearch size={14} />} Scan SOPs
                </button>
              </div>
            </div>

            {scan && scan !== 'running' && (
              <div className="pt-4 border-t border-ink/[0.08] space-y-2.5">
                <div className="flex flex-wrap items-center gap-x-6 gap-y-1 text-xs">
                  <span className="flex items-center gap-1.5 text-emerald-300 font-semibold"><CheckCircle2 size={14} /> Scan complete</span>
                  <span className="text-fg2">{scan.total} assets scanned</span>
                  <span className="text-emerald-300">{scan.covered} covered ({Math.round((scan.covered / scan.total) * 100)}%)</span>
                  <span className="text-amber-300">{scan.total - scan.covered} without an SOP</span>
                  {scan.ingested && <span className="text-violet-300">Ingested to Milvus</span>}
                </div>
                {scan.gaps.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {scan.gaps.map(([os, n]) => (
                      <span key={os} className="px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-[11px] text-amber-200">
                        {os} <span className="font-mono opacity-80">× {n}</span>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Search + rows */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="relative w-full sm:w-[500px]">
              <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-fg4" />
              <input
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                placeholder="Global search across all columns..."
                className={`${inputCls} w-full pl-10 py-2.5`}
              />
            </div>
            <div className="flex items-center gap-3 text-xs text-fg2">
              <button
                onClick={() => setShowFilters((v) => !v)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg border ${showFilters ? 'border-teal-400/60 text-teal-300' : 'border-ink/10 text-fg2'}`}
              >
                <Filter size={13} /> Column filters
              </button>
              Rows:
              <Select value={String(pageSize)} onValueChange={(v) => { setPageSize(Number(v)); setPage(1); }} options={['10', '25', '50', '100']} aria-label="Rows per page" />
            </div>
          </div>

          {/* Table */}
          <div className="nexus-card overflow-hidden">
            <div className="overflow-auto max-h-[520px] custom-scrollbar">
              <table className="w-full text-left text-[13px] text-fg2">
                <thead className="sticky top-0 z-10 bg-inset text-[11px] font-bold text-teal-300 uppercase tracking-wider">
                  <tr>
                    {COLUMNS.map((c) => (
                      <th key={c.key} className={`py-3 px-4 ${c.w} whitespace-nowrap`}>
                        <button onClick={() => toggleSort(c.key)} className="flex items-center gap-1 uppercase hover:text-fg">
                          {c.label}
                          {sort.key === c.key && (sort.dir === 'asc' ? <ArrowUp size={11} /> : <ArrowDown size={11} />)}
                        </button>
                      </th>
                    ))}
                  </tr>
                  {showFilters && (
                    <tr className="bg-inset">
                      {COLUMNS.map((c) => (
                        <th key={c.key} className="px-4 pb-2 font-normal normal-case">
                          <input
                            value={colFilters[c.key] || ''}
                            onChange={(e) => { setColFilters((f) => ({ ...f, [c.key]: e.target.value })); setPage(1); }}
                            placeholder="Filter…"
                            aria-label={`Filter ${c.label}`}
                            className="w-full bg-inset border border-ink/10 rounded px-2 py-1 text-[11px] text-fg placeholder-fg4 focus:outline-none focus:border-teal-400"
                          />
                        </th>
                      ))}
                    </tr>
                  )}
                </thead>
                <tbody className="divide-y divide-ink/[0.04]">
                  {visible.map((a) => (
                    <tr key={a.id} className="hover:bg-ink/[0.03]">
                      {COLUMNS.map((c) => (
                        <td key={c.key} className={`py-2.5 px-4 whitespace-nowrap ${c.mono ? 'font-mono text-fg2' : ''}`}>{a[c.key]}</td>
                      ))}
                    </tr>
                  ))}
                  {!visible.length && (
                    <tr><td colSpan={COLUMNS.length} className="py-10 text-center text-fg4">No assets match your search.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pagination */}
          <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-fg3">
            <span>Showing {rows.length ? start + 1 : 0}–{Math.min(start + pageSize, rows.length)} of {rows.length}</span>
            <div className="flex items-center gap-2">
              <button disabled={safePage <= 1} onClick={() => setPage(safePage - 1)} aria-label="Previous page" className="p-1.5 rounded-lg border border-ink/10 hover:bg-ink/5 disabled:opacity-30"><ChevronLeft size={14} /></button>
              <span>Page {safePage} of {pages}</span>
              <button disabled={safePage >= pages} onClick={() => setPage(safePage + 1)} aria-label="Next page" className="p-1.5 rounded-lg border border-ink/10 hover:bg-ink/5 disabled:opacity-30"><ChevronRight size={14} /></button>
            </div>
          </div>
        </>
      ) : (
        <RegisterForm
          assets={assets}
          onSave={(asset) => {
            setAssets((prev) => {
              const i = prev.findIndex((a) => a.name.toLowerCase() === asset.name.toLowerCase());
              if (i >= 0) return prev.map((a, j) => (j === i ? { ...a, ...asset } : a));
              return [{ ...asset, id: Date.now() }, ...prev];
            });
            setRefreshedAt(new Date());
          }}
          inputCls={inputCls}
        />
      )}
    </div>
  );
}

const EMPTY = { name: '', ip: '', host: '', dns: 'sdxtest.local', os: '', osVersion: '', env: 'Production', group: 'Linux-Platform' };
const IPV4 = /^(25[0-5]|2[0-4]\d|1?\d?\d)(\.(25[0-5]|2[0-4]\d|1?\d?\d)){3}$/;

function RegisterForm({ assets, onSave, inputCls }) {
  const [f, setF] = useState(EMPTY);
  const [msg, setMsg] = useState(null);
  const exists = f.name && assets.some((a) => a.name.toLowerCase() === f.name.trim().toLowerCase());
  const set = (k) => (e) => { setF((p) => ({ ...p, [k]: e.target.value })); setMsg(null); };

  const submit = (e) => {
    e.preventDefault();
    if (!f.name.trim() || !IPV4.test(f.ip.trim()) || !f.os.trim()) {
      setMsg({ ok: false, text: 'Name, a valid IPv4 address and OS are required.' });
      return;
    }
    const asset = { ...f, name: f.name.trim(), ip: f.ip.trim(), host: f.host.trim() || f.name.trim() };
    onSave(asset);
    setMsg({ ok: true, text: `${exists ? 'Updated' : 'Registered'} ${asset.name}.` });
    if (!exists) setF(EMPTY);
  };

  const fields = [
    ['name', 'Name *', 'sdxdclexample01'], ['ip', 'IP Address *', '172.17.0.10'],
    ['host', 'Host Name', 'example01.sdxtest.local'], ['dns', 'DNS Domain', 'sdxtest.local'],
    ['os', 'OS *', 'Red Hat Enterprise Linux 9 (64-bit)'], ['osVersion', 'OS Version', '9.6'],
  ];

  return (
    <form onSubmit={submit} className="nexus-card p-6 space-y-5 max-w-3xl">
      <div>
        <h3 className="text-lg font-bold text-fg">Register / Update asset</h3>
        <p className="text-xs text-fg3 mt-1">Enter an existing asset name to update it, or a new name to register it.</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {fields.map(([k, label, ph]) => (
          <label key={k} className="space-y-1.5 text-xs font-semibold text-fg2">
            {label}
            <input value={f[k]} onChange={set(k)} placeholder={ph} className={`${inputCls} w-full font-normal`} />
          </label>
        ))}
        <label className="space-y-1.5 text-xs font-semibold text-fg2">
          Environment
          <Select value={f.env} onValueChange={(v) => set('env')({ target: { value: v } })} options={['Production', 'UAT', 'Development', 'DR']} className="w-full font-normal" />
        </label>
        <label className="space-y-1.5 text-xs font-semibold text-fg2">
          Support Group
          <Select value={f.group} onValueChange={(v) => set('group')({ target: { value: v } })} options={GROUPS} className="w-full font-normal" />
        </label>
      </div>
      <div className="flex items-center gap-4">
        <button type="submit" className="px-5 py-2.5 bg-teal-500 hover:bg-teal-400 text-onbright font-bold text-xs rounded-xl">
          {exists ? 'Update asset' : 'Register asset'}
        </button>
        {msg && <span className={`text-xs ${msg.ok ? 'text-emerald-300' : 'text-amber-300'}`}>{msg.text}</span>}
      </div>
    </form>
  );
}
