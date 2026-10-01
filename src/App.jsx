import React, { useState, useEffect, useRef } from 'react';
import Sidebar from './components/Sidebar';
import TopHeader from './components/TopHeader';
import BackgroundTexture from './components/BackgroundTexture';
import CentralDashboard from './components/CentralDashboard';
import AgentRegistry from './components/AgentRegistry';
import ScheduleOverview from './components/ScheduleOverview';
import OnDemandExecution from './simulation/OnDemandExecution';
import ComplianceManagement from './components/ComplianceManagement';
import UnifiedHistory from './components/UnifiedHistory';
import VulnerabilityManagement from './components/VulnerabilityManagement';
import UserManagementView from './components/UserManagementView';
import AIChatCopilot from './components/AIChatCopilot';
import ConnectorMarketplace from './components/ConnectorMarketplace';
import ToolRegistration from './components/ToolRegistration';
import RemediationScripts from './components/RemediationScripts';
import CMDBManagement from './components/CMDBManagement';
import SignIn from './components/SignIn';
import AccessControl from './components/AccessControl';
import TourModal from './components/TourModal';
import AgentDetailModal from './components/AgentDetailModal';
import AddAgentModal from './components/AddAgentModal';
import SettingsModal from './components/SettingsModal';
import { useSettings } from './useSettings';
import { AGENTS_LIST, EXECUTION_RUNS } from './data/nexusData';
import { ROLES, SEED_USERS, initials } from './data/accessData';
import { techFromName, deriveStatus, STAGE_ARRAYS } from './simulation/simulationEngine';


const SESSION_KEY = 'nexus.session';
const loadSession = () => {
  try { return JSON.parse(sessionStorage.getItem(SESSION_KEY)); } catch { return null; }
};

const SEED_HISTORY = EXECUTION_RUNS.map((r) => {
  const { status, statusColor } = deriveStatus(r.status);
  return {
    id: `#R-${r.name}-${Math.random().toString(16).slice(2, 8)}`,
    mode: 'ON-DEMAND',
    week: 'ONDEMAND',
    env: 'Development',
    technology: techFromName(r.name),
    status,
    statusColor,
    stagesDone: r.status === 'SUCCESS' ? 9 : r.status === 'WARNING' ? 8 : r.status === 'RUNNING' ? 5 : 2,
    stagesTotal: 9,
    stagesArray: STAGE_ARRAYS[r.status] || STAGE_ARRAYS.ABORTED,
    triggeredBy: 'scheduler',
    started: r.time || '2026-08-18 10:00:00',
    duration: r.duration || 'N/A',
    passed: r.passed || 0,
    warnings: r.warnings || 0,
    failed: r.failed || 0,
    simulated: false,
  };
});

export default function App() {
  const [users, setUsers] = useState(SEED_USERS);
  const [session, setSession] = useState(loadSession); // { handle, orgId } | null. Prototype only: no real auth.
  const [activeTab, setActiveTab] = useState('central-dashboard');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [darkMode, setDarkMode] = useState(() => document.documentElement.dataset.theme !== 'light');

  const mainRef = useRef(null);
  const firstThemeRun = useRef(true);
  useEffect(() => {
    const theme = darkMode ? 'dark' : 'light';
    document.documentElement.dataset.theme = theme;
    if (firstThemeRun.current) firstThemeRun.current = false;
    else if (mainRef.current) {
      const el = mainRef.current;
      el.classList.remove('theme-popup');
      void el.offsetWidth; // restart the animation
      el.classList.add('theme-popup');
    }
    try { localStorage.setItem('nexus.theme', theme); } catch { /* storage unavailable */ }
  }, [darkMode]);
  const [isTourOpen, setIsTourOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [settings, updateSettings, resetSettings] = useSettings();
  useEffect(() => {
    document.documentElement.dataset.motion = settings.reduceMotion ? 'reduced' : 'full';
  }, [settings.reduceMotion]);

  // Shared simulation history — lifted here so OnDemandExecution can push entries
  const [historyRuns, setHistoryRuns] = useState(SEED_HISTORY);

  // Agent State & Modals
  const [agents, setAgents] = useState(AGENTS_LIST);
  const [selectedAgent, setSelectedAgent] = useState(null);
  const [isAddAgentOpen, setIsAddAgentOpen] = useState(false);

  const handleSimulationComplete = (entry) => {
    setHistoryRuns((prev) => [entry, ...prev]);
  };

  const handleAddAgent = (newAgent) => {
    const created = {
      ...newAgent,
      id: agents.length + 1,
    };
    setAgents((prev) => [...prev, created]);
  };

  const signIn = (user, org) => {
    const next = { handle: user.handle, orgId: org.id };
    try { sessionStorage.setItem(SESSION_KEY, JSON.stringify(next)); } catch { /* storage unavailable */ }
    setActiveTab('central-dashboard');
    setSession(next);
  };

  const signOut = () => {
    try { sessionStorage.removeItem(SESSION_KEY); } catch { /* storage unavailable */ }
    setSession(null);
  };

  const me = session && users.find((u) => u.handle === session.handle);

  const getTabTitle = () => {
    switch (activeTab) {
      case 'central-dashboard':
        return 'Central Dashboard';
      case 'on-demand-execution':
        return 'On-Demand Execution';
      case 'schedule-overview':
        return 'Patch Window Planner';
      case 'agent-registry':
        return 'Agent Registry';
      case 'remediation-scripts':
        return 'Remediation Scripts & Auto-Fix';
      case 'compliance-management':
        return 'Compliance Management';
      case 'vulnerability-mgmt':
        return 'Vulnerability Management';
      case 'access-control':
        return 'Access Control & RBAC Matrix';
      case 'user-management':
        return 'User Management';
      case 'cmdb-management':
        return 'ServiceNow CMDB Management';
      case 'history':
        return 'Unified Execution History';
      case 'chat':
        return 'Agentic Patching Copilot';
      case 'connector-marketplace':
        return 'PCDK Connector Marketplace';
      case 'tool-registration':
        return 'Tool Registration & Health';
      default:
        return 'Central Dashboard';
    }
  };

  if (!me) return <SignIn users={users} onSignIn={signIn} />;

  const theme = darkMode ? 'dark' : 'light';
  const canManage = ROLES[me.role].permissions.includes('rbac.write');
  const headerUser = {
    name: me.name,
    initials: initials(me),
    roleLabel: ROLES[me.role].label,
    email: me.email === '—' ? me.handle : me.email,
  };

  // The shell (top bar, sidebar, background) always uses the dark blue theme; only <main> and modals follow `theme`.
  return (
    <div data-theme="dark" className={`app-enter h-screen w-screen bg-page text-fg flex flex-col relative overflow-hidden select-none selection:bg-cyan-500/30 selection:text-cyan-200 ${darkMode ? 'dark' : ''}`}>
      {/* Dynamic Vulnerability & Patching Background Canvas (Visible behind Sidebar & Window) */}
      <BackgroundTexture />

      {/* 1. TOP HEADER (Integrated with background canvas) */}
      <TopHeader
        activeTabTitle={getTabTitle()}
        darkMode={darkMode}
        setDarkMode={setDarkMode}
        onNavigateTab={setActiveTab}
        isSidebarCollapsed={isSidebarCollapsed}
        setIsSidebarCollapsed={setIsSidebarCollapsed}
        user={headerUser}
        onSignOut={signOut}
        onOpenSettings={() => setIsSettingsOpen(true)}
        integrationMode={settings.integrationMode}
      />

      {/* 2. GMAIL-STYLE APPLICATION SHELL */}
      <div className="flex flex-1 pt-16 h-[calc(100vh-4rem)] overflow-hidden">
        {/* Transparent Left Sidebar (Part of ambient background canvas) */}
        <Sidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          isCollapsed={isSidebarCollapsed}
          setIsCollapsed={setIsSidebarCollapsed}
        />

        {/* 3. SEPARATE FLOATING MAIN WORKSPACE WINDOW (Rounded Card Canvas) */}
        <div
          className={`flex-1 flex flex-col min-w-0 pr-4 pb-4 pt-1 transition-all duration-300 ${
            isSidebarCollapsed ? 'pl-20' : 'pl-64'
          }`}
        >
          <main ref={mainRef} onAnimationEnd={(e) => e.target === e.currentTarget && e.currentTarget.classList.remove('theme-popup')} data-theme={theme} className="text-fg flex-1 bg-panel/90 backdrop-blur-2xl border border-ink/[0.08] rounded-2xl md:rounded-3xl shadow-[0_20px_60px_rgba(0,0,0,0.7)] overflow-y-auto custom-scrollbar flex flex-col relative">
            {activeTab === 'central-dashboard' && (
              <CentralDashboard
                onNavigateTab={setActiveTab}
                onSelectItem={(item) => console.log('Selected item:', item)}
                showLiveRuns={settings.activity.liveRuns}
              />
            )}

            {activeTab === 'agent-registry' && (
              <AgentRegistry
                onNavigateTab={setActiveTab}
                onOpenAddAgent={() => setIsAddAgentOpen(true)}
                onSelectAgent={(agent) => setSelectedAgent(agent)}
              />
            )}

            {activeTab === 'remediation-scripts' && (
              <RemediationScripts />
            )}

            {activeTab === 'schedule-overview' && (
              <ScheduleOverview settings={settings} />
            )}

            {activeTab === 'on-demand-execution' && (
              <OnDemandExecution
                onSimulationComplete={handleSimulationComplete}
                onNavigateTab={setActiveTab}
                historyRuns={historyRuns}
              />
            )}

            {activeTab === 'compliance-management' && (
              <ComplianceManagement />
            )}

            {activeTab === 'vulnerability-mgmt' && (
              <VulnerabilityManagement />
            )}

            {activeTab === 'history' && (
              <UnifiedHistory historyRuns={historyRuns} />
            )}

            {activeTab === 'user-management' && (
              <UserManagementView users={users} setUsers={setUsers} currentUser={me.handle} canManage={canManage} />
            )}

            {activeTab === 'cmdb-management' && (
              <CMDBManagement />
            )}

            {activeTab === 'chat' && (
              <AIChatCopilot />
            )}

            {activeTab === 'connector-marketplace' && (
              <ConnectorMarketplace />
            )}

            {activeTab === 'tool-registration' && (
              <ToolRegistration />
            )}

            {activeTab === 'access-control' && (
              <AccessControl users={users} setUsers={setUsers} currentUser={me.handle} canManage={canManage} />
            )}
          </main>
        </div>
      </div>

      {/* 4. MODALS & DRAWERS (follow the chosen theme) */}
      <div data-theme={theme} className="contents">
      <TourModal
        isOpen={isTourOpen}
        onClose={() => setIsTourOpen(false)}
      />

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        onUpdate={updateSettings}
        onReset={resetSettings}
        darkMode={darkMode}
        setDarkMode={setDarkMode}
        user={{ ...headerUser, role: me.role }}
        session={session}
        onNavigateTab={setActiveTab}
        onSignOut={signOut}
      />

      <AgentDetailModal
        agent={selectedAgent}
        onClose={() => setSelectedAgent(null)}
      />

      <AddAgentModal
        isOpen={isAddAgentOpen}
        onClose={() => setIsAddAgentOpen(false)}
        onAdd={handleAddAgent}
      />
      </div>
    </div>
  );
}
