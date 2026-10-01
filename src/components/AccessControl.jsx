import React, { useState } from 'react';
import { Lock, UserRound, Eye, Wrench, Crown, KeyRound, Trash2 } from 'lucide-react';
import { ROLES } from '../data/accessData';
import RoleSelect from './ui/RoleSelect';
import PageHeader from './ui/PageHeader';

const ROLE_CARDS = [
  { role: 'Viewer',   icon: Eye },
  { role: 'Operator', icon: Wrench },
  { role: 'Admin',    icon: Crown },
];

export default function AccessControl({ users, setUsers, currentUser, canManage }) {
  const [pendingDelete, setPendingDelete] = useState(null);

  const me = users.find((u) => u.handle === currentUser);
  const myRole = ROLES[me.role];

  const setRole = (id, role) => setUsers((p) => p.map((u) => (u.id === id ? { ...u, role } : u)));
  const removeUser = (id) => {
    setUsers((p) => p.filter((u) => u.id !== id));
    setPendingDelete(null);
  };

  return (
    <div className="p-6 space-y-5 w-full max-w-[1200px] mx-auto animate-in fade-in">
      <PageHeader icon={Lock} tone="text-emerald-400" title="Access Control" subtitle="Review your identity and permissions, and manage role assignments for your tenant.">
        <span className={`px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider ${myRole.tone.solid}`}>
          {me.name} · {myRole.label}
        </span>
      </PageHeader>

      {/* Identity */}
      <div className="nexus-card p-5">
        <div className="flex items-center gap-2 text-sm font-bold text-fg mb-3">
          <UserRound size={15} className="text-fg3" /> Your Identity
        </div>
        <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1.5 text-xs">
          <dt className="font-bold text-fg2">Username:</dt>
          <dd className="text-fg2">{me.handle}</dd>
          <dt className="font-bold text-fg2">Role:</dt>
          <dd className="text-fg2">{myRole.label} — {myRole.desc}</dd>
          <dt className="font-bold text-fg2">Permissions:</dt>
          <dd className="flex flex-wrap gap-1.5">
            {myRole.permissions.map((p) => (
              <code key={p} className="px-1.5 py-0.5 rounded bg-indigo-950/60 border border-indigo-500/20 text-[10px] text-indigo-200">{p}</code>
            ))}
          </dd>
        </dl>
      </div>

      {/* Role tiers */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {ROLE_CARDS.map(({ role, icon: Icon }) => (
          <div key={role} className={`nexus-card p-4 ${me.role === role ? 'border-cyan-500/40' : ''}`}>
            <div className={`flex items-center gap-2 text-sm font-bold ${ROLES[role].tone.text}`}>
              <Icon size={14} /> {ROLES[role].label}
              {me.role === role && <span className="ml-auto text-[9px] font-bold uppercase tracking-wider text-cyan-300">Your role</span>}
            </div>
            <div className="mt-1 text-[11px] text-fg3">{ROLES[role].desc}</div>
          </div>
        ))}
      </div>

      {/* User management */}
      <div>
        <h3 className="text-xs font-bold uppercase tracking-wider text-fg mb-3">User Management</h3>
        <div className="nexus-card overflow-x-auto">
          <table className="w-full text-left text-xs text-fg2 min-w-[680px]">
            <thead className="bg-inset border-b border-ink/[0.08] text-[10px] font-bold text-fg3 uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">Username</th>
                <th className="py-3 px-4">Display Name</th>
                <th className="py-3 px-4">Source</th>
                <th className="py-3 px-4">Role</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink/[0.04]">
              {users.map((u) => {
                const self = u.handle === currentUser;
                const confirming = pendingDelete === u.id;
                return (
                  <tr key={u.id} className="hover:bg-ink/[0.02] transition-colors">
                    <td className="py-2.5 px-4 font-mono font-bold text-fg">{u.handle}</td>
                    <td className="py-2.5 px-4 font-semibold text-fg2">{u.name}</td>
                    <td className="py-2.5 px-4">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold border ${u.source === 'AD' ? 'text-sky-300 bg-sky-950/40 border-sky-500/30' : 'text-amber-300 bg-amber-950/30 border-amber-500/30'}`}>
                        {u.source === 'AD' ? <Lock size={10} /> : <KeyRound size={10} />} {u.source}
                      </span>
                    </td>
                    <td className="py-2.5 px-4">
                      <RoleSelect value={u.role} onChange={(r) => setRole(u.id, r)} disabled={!canManage || self} label={`Role for ${u.handle}`} />
                    </td>
                    <td className="py-2.5 px-4">
                      <div className="flex justify-end items-center gap-1 text-fg4">
                        {canManage && !self && (confirming ? (
                          <>
                            <button onClick={() => removeUser(u.id)} className="px-2 py-0.5 rounded bg-red-500/20 text-red-300 border border-red-500/40 text-[10px] font-bold">Delete?</button>
                            <button onClick={() => setPendingDelete(null)} className="px-2 py-0.5 rounded text-[10px] hover:text-fg">Cancel</button>
                          </>
                        ) : (
                          <button onClick={() => setPendingDelete(u.id)} aria-label={`Delete ${u.handle}`} className="p-1.5 rounded hover:text-red-400 hover:bg-ink/5">
                            <Trash2 size={13} />
                          </button>
                        ))}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {!canManage && <p className="mt-2 text-[11px] text-fg4">Changing roles requires the rbac.write permission.</p>}
      </div>
    </div>
  );
}
