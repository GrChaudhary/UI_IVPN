// Mock ServiceNow asset feed (deterministic; swap for the real CMDB API).
const OS_POOL = [
  ['Red Hat Enterprise Linux 9 (64-bit)', ['9.6', '9.4', '9.2'], 26],
  ['IBM Red Hat Enterprise Linux 8 (64-bit)', ['8.10', '8.8', '8.6', '8.1'], 34],
  ['Red Hat Enterprise Linux 8 (64-bit)', ['8.1', '8'], 12],
  ['IBM Red Hat Enterprise Linux 7', ['7.6', '7.9'], 5],
  ['Microsoft Windows Server 2022', ['2022'], 9],
  ['Windows 2019 Datacenter', ['10.0.17763'], 8],
  ['Microsoft Windows Server 2016', ['10.0.14393'], 3],
  ['Oracle Solaris 11', ['11.4'], 3],
];
export const SOP_COVERED = /Red Hat Enterprise Linux (8|9)|Windows Server 2022|Windows 2019/;
const ENVS = ['Production', 'Production', 'UAT', 'Development', 'DR'];
export const GROUPS = ['Linux-Platform', 'Windows-Platform', 'DBA-Oracle', 'Middleware', 'Infra-Ops'];
const WORDS = ['cephiftasrhocp', 'terraform', 'petpevmnginx', 'wstdevlakshmi', 'oraclegoldengate', 'sanjay', 'rrhel8-', 'netapp', 'jenkins', 'servicetheater', 'peopsapp', 'dashboard', 'mssql', 'weblogic', 'jboss', 'kafka'];

export function buildAssets(n = 541) {
  let seed = 7;
  const rnd = () => ((seed = (seed * 1664525 + 1013904223) % 4294967296) / 4294967296);
  const pick = (arr) => arr[Math.floor(rnd() * arr.length)];
  const total = OS_POOL.reduce((s, o) => s + o[2], 0);
  return Array.from({ length: n }, (_, i) => {
    let r = rnd() * total;
    const [os, versions] = OS_POOL.find((o) => (r -= o[2]) < 0) || OS_POOL[0];
    const base = `${pick(WORDS)}${String(Math.floor(rnd() * 90) + 1).padStart(2, '0')}`;
    const name = `sdxdcl${base}`;
    return {
      id: i,
      name,
      ip: `172.17.${Math.floor(rnd() * 120) + 60}.${Math.floor(rnd() * 250) + 2}`,
      host: rnd() > 0.25 ? `${base}.sdxtest.local` : name,
      dns: 'sdxtest.local',
      os,
      osVersion: pick(versions),
      env: pick(ENVS),
      group: pick(GROUPS),
    };
  });
}


/** Technology scope an asset belongs to (matches the On-Demand Execution tech options), or null if unmanaged. */
export function techOf({ name, os }) {
  if (/mssql/i.test(name)) return 'MSSQL';
  if (/weblogic/i.test(name)) return 'WEBLOGIC';
  if (/jboss/i.test(name)) return 'JBOSS';
  if (/oracle/i.test(name)) return 'ORACLE';
  if (/Windows/.test(os)) return 'WINDOWS';
  if (/Red Hat/.test(os)) return 'RHEL';
  return null;
}

export const CMDB_ASSETS = buildAssets();

/** Assets grouped by technology scope. */
export const ASSETS_BY_TECH = CMDB_ASSETS.reduce((acc, a) => {
  const t = techOf(a);
  if (t) (acc[t] ??= []).push(a);
  return acc;
}, {});
