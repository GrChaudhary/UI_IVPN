// Roles, permissions, organizations and users shared by SignIn, AccessControl and UserManagementView.
// Prototype data only: there is no backend, so nothing here is authenticated for real.

export const ALL_PERMISSIONS = [
  'activity.read', 'agents.read', 'assets.collect', 'assets.read', 'chat.send', 'config.write',
  'dashboard.read', 'deploy.execute', 'events.read', 'patches.collect', 'patches.read', 'precheck.run',
  'rbac.read', 'rbac.write', 'risks.assess', 'risks.read', 'rollback.execute', 'similar.search',
];

const ADMIN_ONLY = ['rbac.read', 'rbac.write', 'config.write'];
const OPERATOR_PERMISSIONS = ALL_PERMISSIONS.filter((p) => !ADMIN_ONLY.includes(p));

/** Keyed by the role value stored on each user. `label` is what the screens display; `tone` is its colour set. */
const TONE = {
  Viewer:   { text: 'text-sky-400',    dot: 'bg-sky-400',    solid: 'bg-sky-400 text-onbright',    chip: 'text-sky-400 bg-sky-950/40 border-sky-500/30 hover:border-sky-400/60' },
  Operator: { text: 'text-amber-400',  dot: 'bg-amber-400',  solid: 'bg-amber-400 text-onbright',  chip: 'text-amber-400 bg-amber-950/40 border-amber-500/30 hover:border-amber-400/60' },
  Admin:    { text: 'text-violet-400', dot: 'bg-violet-400', solid: 'bg-violet-400 text-onbright', chip: 'text-violet-400 bg-violet-950/40 border-violet-500/30 hover:border-violet-400/60' },
};

export const ROLES = {
  Viewer:   { label: 'Viewer',        desc: 'Read-only dashboard access',    tone: TONE.Viewer,   permissions: OPERATOR_PERMISSIONS.filter((p) => p.endsWith('.read')) },
  Operator: { label: 'Operator',      desc: 'Run queries & assessments',     tone: TONE.Operator, permissions: OPERATOR_PERMISSIONS },
  Admin:    { label: 'Administrator', desc: 'Full access + RBAC management', tone: TONE.Admin,    permissions: ALL_PERMISSIONS },
};

// Sample tenants for the sign-in dropdown (placeholders; replace with the real tenant list).
export const ORGS = [
  { id: 'wipro-intelligence', name: 'Wipro Intelligence', dot: 'bg-indigo-500' },
  { id: 'wipro-infra', name: 'Wipro Infrastructure Services', dot: 'bg-cyan-400' },
  { id: 'wipro-cloud', name: 'Wipro Cloud & Security', dot: 'bg-emerald-400' },
];

export const initials = (u) => (u.name.match(/\b\w/g) || [u.handle[0]]).slice(0, 2).join('').toUpperCase();

export const SEED_USERS = [
  { id: 1,  handle: 'abhijeet',  name: 'Abhijeet Kumar Verma', email: '—',                   role: 'Admin',    source: 'Local', status: 'Active', lastLogin: '—' },
  { id: 2,  handle: 'admin',     name: 'Wipro Admin',          email: 'admin@wipro.local',   role: 'Admin',    source: 'Local', status: 'Active', lastLogin: 'Aug 1, 2026, 06:28 PM' },
  { id: 3,  handle: 'afzal',     name: 'afzal D',              email: 'afzal@sdxtest.local', role: 'Admin',    source: 'AD',    status: 'Active', lastLogin: '—' },
  { id: 4,  handle: 'amar',      name: 'Amarpreet Singh',      email: '—',                   role: 'Operator', source: 'AD',    status: 'Active', lastLogin: '—' },
  { id: 5,  handle: 'ambarish',  name: 'Ambarish M',           email: '—',                   role: 'Admin',    source: 'AD',    status: 'Active', lastLogin: 'Jul 30, 2026, 10:38 PM' },
  { id: 6,  handle: 'dhananjay', name: 'dhananjay mishra4',    email: '—',                   role: 'Admin',    source: 'AD',    status: 'Active', lastLogin: 'Jul 30, 2026, 05:35 PM' },
  { id: 7,  handle: 'farhan',    name: 'Farhan Azam',          email: '—',                   role: 'Operator', source: 'AD',    status: 'Active', lastLogin: '—' },
  { id: 8,  handle: 'mayurshah', name: 'mayurshah',            email: '—',                   role: 'Admin',    source: 'AD',    status: 'Active', lastLogin: '—' },
  { id: 9,  handle: 'nikhil',    name: 'Nikhil Rao',           email: '—',                   role: 'Operator', source: 'AD',    status: 'Active', lastLogin: '—' },
  { id: 10, handle: 'operator',  name: 'Wipro Operator',       email: 'operator@wipro.local', role: 'Operator', source: 'Local', status: 'Active', lastLogin: '—' },
  { id: 11, handle: 'priya',     name: 'Priya Nair',           email: '—',                   role: 'Viewer',   source: 'AD',    status: 'Active', lastLogin: '—' },
  { id: 12, handle: 'rohit',     name: 'Rohit Menon',          email: '—',                   role: 'Operator', source: 'AD',    status: 'Active', lastLogin: '—' },
  { id: 13, handle: 'sekhar',    name: 'perumal sekhar',       email: '—',                   role: 'Admin',    source: 'AD',    status: 'Active', lastLogin: '—' },
  { id: 14, handle: 'sneha',     name: 'Sneha Kulkarni',       email: '—',                   role: 'Viewer',   source: 'AD',    status: 'Active', lastLogin: '—' },
  { id: 15, handle: 'taj',       name: 'Khaiser Taj',          email: '—',                   role: 'Operator', source: 'Local', status: 'Active', lastLogin: '—' },
  { id: 16, handle: 'viewer',    name: 'Wipro Viewer',         email: 'viewer@wipro.local',  role: 'Viewer',   source: 'Local', status: 'Active', lastLogin: '—' },
];
