import React, { useState } from 'react';
import {
  Users,
  UserPlus,
  RefreshCw,
  Search,
  Trash2,
  Edit2,
  CheckCircle,
  Clock,
  Ban,
  KeyRound,
  Settings,
  PlugZap,
} from 'lucide-react';
import { SEED_USERS, initials } from '../data/accessData';
import Select from './ui/Select';
import PageHeader from './ui/PageHeader';
import RoleSelect, { ROLE_OPTIONS } from './ui/RoleSelect';

const AVATAR_TONES = [
  'bg-cyan-950 border-cyan-500/30 text-cyan-300',
  'bg-rose-950 border-rose-500/30 text-rose-300',
  'bg-violet-950 border-violet-500/30 text-violet-300',
  'bg-emerald-950 border-emerald-500/30 text-emerald-300',
];

export default function UserManagementView({ users, setUsers, currentUser, canManage }) {
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [authFilter, setAuthFilter] = useState('All');
  const [pendingDelete, setPendingDelete] = useState(null);

  const count = (status) => users.filter((u) => u.status === status).length;

  const q = search.trim().toLowerCase();
  const filtered = users.filter(
    (u) =>
      (!q || u.handle.toLowerCase().includes(q) || u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q)) &&
      (roleFilter === 'All' || u.role === roleFilter) &&
      (statusFilter === 'All' || u.status === statusFilter) &&
      (authFilter === 'All' || u.source === authFilter),
  );

  const setRole = (id, role) => setUsers((p) => p.map((u) => (u.id === id ? { ...u, role } : u)));
  const toggleDisabled = (id) =>
    setUsers((p) => p.map((u) => (u.id === id ? { ...u, status: u.status === 'Disabled' ? 'Active' : 'Disabled' } : u)));
  const removeUser = (id) => {
    setUsers((p) => p.filter((u) => u.id !== id));
    setPendingDelete(null);
  };

  const kpis = [
    { label: 'Total Users', value: users.length,        icon: Users,       tone: 'text-blue-400 bg-blue-950/60 border-blue-500/30' },
    { label: 'Active',      value: count('Active'),     icon: CheckCircle, tone: 'text-emerald-400 bg-emerald-950/60 border-emerald-500/30' },
    { label: 'Pending',     value: count('Pending'),    icon: Clock,       tone: 'text-amber-400 bg-amber-950/60 border-amber-500/30' },
    { label: 'Disabled',    value: count('Disabled'),   icon: Ban,         tone: 'text-fg3 bg-slate-900 border-slate-700' },
  ];

  return (
    <div className="p-6 space-y-5 w-full max-w-[1200px] mx-auto animate-in fade-in">
      <PageHeader icon={Users} tone="text-violet-400" title="User Management" subtitle="Manage users, roles, registrations and AD integration for your tenant.">
        <button
          onClick={() => setUsers(SEED_USERS)}
          className="flex items-center gap-1.5 px-3.5 py-2 bg-ink/[0.04] hover:bg-ink/[0.08] border border-ink/[0.1] rounded-lg text-xs font-semibold text-fg2 transition-all"
        >
          <RefreshCw size={13} /> Refresh
        </button>
        <button className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-lg shadow-lg shadow-indigo-500/20 transition-all">
          <UserPlus size={14} /> Add User
        </button>
      </PageHeader>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {kpis.map(({ label, value, icon: Icon, tone }) => (
          <div key={label} className="nexus-card p-4 flex items-center gap-3.5">
            <div className={`w-10 h-10 rounded-lg border flex items-center justify-center ${tone}`}>
              <Icon size={17} />
            </div>
            <div>
              <div className="text-xl font-extrabold text-fg leading-none">{value}</div>
              <div className="text-[11px] text-fg3 mt-1">{label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Active Directory integration */}
      <div className="nexus-card p-4 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-9 h-9 rounded-lg bg-slate-800/80 flex items-center justify-center text-fg3 flex-shrink-0">
            <PlugZap size={16} />
          </div>
          <div className="min-w-0">
            <div className="text-xs font-bold text-fg">Active Directory Integration</div>
            <div className="text-[11px] text-fg3 truncate">
              Not configured — set AD_HOST, AD_BIND_DN, AD_BASE_DN environment variables
            </div>
          </div>
        </div>
        <div className="flex items-center gap-1 text-fg3 flex-shrink-0">
          <button aria-label="Re-test AD connection" className="p-2 rounded-lg hover:bg-ink/5 hover:text-fg"><RefreshCw size={14} /></button>
          <button aria-label="AD settings" className="p-2 rounded-lg hover:bg-ink/5 hover:text-fg"><Settings size={14} /></button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-2.5">
        <div className="relative flex-1">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-fg4" />
          <input
            type="text"
            placeholder="Search users..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-inset border border-ink/[0.08] rounded-lg pl-9 pr-3 py-2 text-xs text-fg placeholder-fg4 focus:outline-none focus:border-cyan-500"
          />
        </div>
        <Select value={roleFilter} onValueChange={setRoleFilter} aria-label="Role filter" options={[{ value: 'All', label: 'All Roles' }, ...ROLE_OPTIONS.map(({ value, label }) => ({ value, label }))]} />
        <Select value={statusFilter} onValueChange={setStatusFilter} aria-label="Status filter" options={[{ value: 'All', label: 'All Status' }, 'Active', 'Pending', 'Disabled']} />
        <Select value={authFilter} onValueChange={setAuthFilter} aria-label="Auth filter" options={[{ value: 'All', label: 'All Auth' }, 'Local', 'AD']} />
      </div>

      {/* Table */}
      <div className="nexus-card overflow-x-auto">
        <table className="w-full text-left text-xs text-fg2 min-w-[760px]">
          <thead className="bg-inset border-b border-ink/[0.08] text-[10px] font-bold text-fg3 uppercase tracking-wider font-mono">
            <tr>
              <th className="py-3 px-4">All Users — AD &amp; Local ({filtered.length})</th>
              <th className="py-3 px-4">Display Name</th>
              <th className="py-3 px-4">Email</th>
              <th className="py-3 px-4">Role</th>
              <th className="py-3 px-4">Source</th>
              <th className="py-3 px-4">Last Login</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-ink/[0.04]">
            {filtered.map((u, i) => {
              const disabled = u.status === 'Disabled';
              const confirming = pendingDelete === u.id;
              return (
                <tr key={u.id} className={`hover:bg-ink/[0.02] transition-colors ${disabled ? 'opacity-50' : ''}`}>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2.5">
                      <div className={`w-8 h-8 rounded-full border flex items-center justify-center font-bold text-[10px] ${AVATAR_TONES[i % AVATAR_TONES.length]}`}>
                        {initials(u)}
                      </div>
                      <span className="font-bold text-fg">{u.handle}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-fg2">{u.name}</td>
                  <td className="py-3 px-4 text-fg3">{u.email}</td>
                  <td className="py-3 px-4">
                    <RoleSelect value={u.role} onChange={(r) => setRole(u.id, r)} disabled={!canManage || u.handle === currentUser} label={`Role for ${u.handle}`} />
                  </td>
                  <td className="py-3 px-4">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono bg-slate-800/70 text-fg2 border border-ink/10">
                      {u.source}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-fg3 text-[11px] whitespace-nowrap">{u.lastLogin}</td>
                  <td className="py-3 px-4">
                    <div className="flex items-center justify-end gap-1 text-fg4">
                      {confirming ? (
                        <>
                          <button onClick={() => removeUser(u.id)} className="px-2 py-0.5 rounded bg-red-500/20 text-red-300 border border-red-500/40 text-[10px] font-bold">Delete?</button>
                          <button onClick={() => setPendingDelete(null)} className="px-2 py-0.5 rounded text-[10px] hover:text-fg">Cancel</button>
                        </>
                      ) : (
                        <>
                          <button aria-label={`Edit ${u.handle}`} className="p-1.5 rounded hover:text-indigo-300 hover:bg-ink/5"><Edit2 size={13} /></button>
                          {u.source === 'Local' && (
                            <button aria-label={`Reset password for ${u.handle}`} className="p-1.5 rounded hover:text-amber-300 hover:bg-ink/5"><KeyRound size={13} /></button>
                          )}
                          <button
                            onClick={() => toggleDisabled(u.id)}
                            disabled={u.handle === currentUser}
                            aria-label={disabled ? `Enable ${u.handle}` : `Disable ${u.handle}`}
                            className="p-1.5 rounded hover:text-fg hover:bg-ink/5 disabled:opacity-30 disabled:cursor-not-allowed"
                          ><Ban size={13} /></button>
                          <button
                            onClick={() => setPendingDelete(u.id)}
                            disabled={u.handle === currentUser}
                            aria-label={`Delete ${u.handle}`}
                            className="p-1.5 rounded text-red-400/70 hover:text-red-400 hover:bg-ink/5 disabled:opacity-30 disabled:cursor-not-allowed"
                          ><Trash2 size={13} /></button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
            {!filtered.length && (
              <tr><td colSpan={7} className="py-10 text-center text-fg4">No users match these filters.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
