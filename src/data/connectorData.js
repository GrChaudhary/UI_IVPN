// Mock data for the PCDK Connector Marketplace (swap for the tool-registry API).

/** Technology connectors — the onboarded, patch-capable connectors */
export const TECH_CONNECTORS = [
  { id: 'rhel',     name: 'RHEL / Linux',      kind: 'linux',      auth: 'SSH',   tier: 'T2', code: 'Low-Code',  status: 'Active', logo: '#ee0000' },
  { id: 'windows',  name: 'Microsoft Windows', kind: 'windows',    auth: 'WINRM', tier: 'T2', code: 'Low-Code',  status: 'Active', logo: '#00a4ef' },
  { id: 'oracle',   name: 'Oracle Database',   kind: 'database',   auth: 'SQL',   tier: 'T2', code: 'Low-Code',  status: 'Active', logo: '#f80000' },
  { id: 'jboss',    name: 'JBoss',             kind: 'middleware', auth: 'SSH',   tier: 'T2', code: 'Low-Code',  status: 'Active', logo: '#ef4444' },
  { id: 'weblogic', name: 'WebLogic',          kind: 'generic',    auth: 'API',   tier: 'T3', code: 'Full-Code', status: 'Active', logo: '#ef4444' },
];

export const KIND_FILTERS = ['all', 'linux', 'windows', 'database', 'middleware', 'generic'];

/** ITSM & infrastructure tools. `ok:false` renders as unreachable. */
export const INFRA_CONNECTORS = [
  { id: 'servicenow', name: 'ServiceNow',        type: 'ITSM',          desc: 'CMDB, Change Requests, Incidents — blecoe.service-now.com', ok: true },
  { id: 'ansible',    name: 'Ansible Tower',     type: 'Automation',    desc: 'AWX / AAP job templates — RHEL + Windows execution substrate', ok: true },
  { id: 'mecm-sccm',  name: 'MECM / SCCM',       type: 'Patch Mgmt',    desc: 'Windows patch collection via Tower template 9451/9454 · 175 hosts', ok: true },
  { id: 'milvus',     name: 'Milvus Vector DB',  type: 'AI Knowledge',  desc: 'Similar incident search · SOP knowledge base · 384-dim embeddings', ok: true },
  { id: 'outlook',    name: 'Outlook / Mail',    type: 'Notifications', desc: 'Patch cycle email notifications via Exchange / O365', ok: true },
  { id: 'smoke',      name: 'api-smoke-test',    type: 'API',           desc: 'api_smoke_test · Not tested', ok: null },
  { id: 'weblogic-api', name: 'WebLogic',        type: 'API',           desc: 'orchestrator:8000 · Unreachable', ok: false },
  { id: 'ad-sgx',     name: 'Active Directory SGX', type: 'WINRM',     desc: '172.17.65.134:389', ok: true },
  { id: 'ad',         name: 'Active Directory', type: 'WINRM',          desc: '172.17.254.140:389', ok: true },
  { id: 'weblogic-pcdk', name: 'WebLogic',      type: 'PCDK',          desc: 'pcdk-auto', ok: true },
  { id: 'qualys',     name: 'Qualys MCP Server', type: 'MCP',           desc: 'http://172.17.85.100:8001', ok: true },
  { id: 'oracle-repo', name: 'oracle',           type: 'LOCAL_REPO',    desc: '172.17.90.104:80', ok: true },
  { id: 'openvas-mcp', name: 'Openvas Mcp server', type: 'MCP',         desc: 'http://172.17.80.206:8000/:8000', ok: true },
  { id: 'nessus-mcp', name: 'Tenable Nessus MCP', type: 'MCP',          desc: 'http://172.17.85.100:8000:8000', ok: true },
  { id: 'wsus',       name: 'WSUS',              type: 'API',           desc: '172.17.74.91', ok: true },
  { id: 'mecm',       name: 'MECM',              type: 'API',           desc: '172.17.66.151', ok: true },
  { id: 'vc-rookie',  name: 'Rookie Vcenter',    type: 'API',           desc: '172.17.168.212', ok: true },
  { id: 'vc-prod',    name: 'Prod Vcenter',      type: 'API',           desc: '172.17.101.15', ok: true },
  { id: 'satellite',  name: 'Redhat Satellite Server', type: 'API',     desc: '172.17.65.179:443', ok: true },
  { id: 'vault',      name: 'Hashicorp Vault',   type: 'API',           desc: '172.17.74.72:8200', ok: true },
  { id: 'cohesity',   name: 'cohesity',          type: 'API',           desc: '172.17.70.15:443', ok: true },
  { id: 'snow-uat',   name: 'Service Now UAT',   type: 'API',           desc: 'https://blecoe.service-now.com:443', ok: true },
  { id: 'nessus-ess', name: 'Tenable Nessus Essentials', type: 'API',   desc: '172.17.73.82:8834', ok: true },
  { id: 'openvas',    name: 'Openvas',           type: 'API',           desc: '172.17.77.175:443', ok: true },
  { id: 'toolreg',    name: 'Tool Registration', type: 'Connector Registry', desc: 'Register any tool — host, credentials, API key', ok: null },
];

// ─── Onboarding wizard constants ─────────────────────────────────────────────
export const DOMAINS = {
  OS:         ['RHEL', 'Windows', 'SUSE', 'Ubuntu'],
  Database:   ['MSSQL', 'Oracle', 'MySQL', 'PostgreSQL', 'MongoDB'],
  Middleware: ['WebLogic', 'JBoss', 'Tomcat', 'WebSphere'],
  Backup:     ['Cohesity', 'Veeam', 'Rubrik'],
  Network:    ['Cisco IOS', 'F5 BIG-IP', 'Palo Alto'],
  Cloud:      ['AWS', 'Azure', 'GCP'],
};
export const DOMAIN_COLOR = {
  OS: 'bg-red-500', Database: 'bg-rose-500', Middleware: 'bg-purple-600',
  Backup: 'bg-emerald-500', Network: 'bg-sky-500', Cloud: 'bg-amber-500',
};

export const SANDBOX_SERVERS = [
  'SDXDCWMSSQL001 · 172.17.86.95 · Microsoft Windows Server 2022 (64-bit)',
  'SDXDCRHEL002 · 172.17.88.96 · Red Hat Enterprise Linux 9.2',
  'SDXDCORACLE003 · 172.17.88.97 · Oracle Linux 8.8',
];
export const CMDB_SOURCES = ['ServiceNow CMDB'];
export const CMDB_INSTANCES = ['Service Now UAT — https://blecoe.service-now.com'];
export const CVE_SOURCES = ['Tenable Nessus', 'Local Repository'];
export const PATCH_SOURCES = ['Vendor Repository (public)', 'Local Repo / NFS / SMB', 'Custom Playbook Upload'];
export const BACKUP_PLATFORMS = ['Cohesity DataProtect', 'Veeam Backup & Replication', 'Rubrik CDM', 'Native DB Backup (RMAN/pg_dump)'];
