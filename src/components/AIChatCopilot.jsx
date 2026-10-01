import React, { useState, useEffect, useRef } from 'react';
import {
  AssistantRuntimeProvider,
  AuiIf,
  ThreadPrimitive,
  MessagePrimitive,
  ComposerPrimitive,
  ActionBarPrimitive,
  useAuiState,
  useLocalRuntime,
} from '@assistant-ui/react';
import { VoiceOrb } from './VoiceOrb';
import { AGENTS_LIST } from '../data/nexusData';
import { MANAGED_HOSTS } from '../data/cmdbData';
import { ShieldAlert, Gauge, ListChecks, FileCheck2, Send, Bot, User, Square, ArrowDown, Copy, Check, RefreshCw, History, Plus, Search, Trash2, MessageSquare } from 'lucide-react';

const SUGGESTED_PROMPTS = [
  'Why are 8 storage devices non-compliant?',
  'Show me the 5-factor risk score for Wave 03',
  'Trigger pre-flight sanity checks for RHEL estate',
  'Summarize CVE closure evidence for last patch cycle',
];

const replyFor = (query) => {
  const q = query.toLowerCase();
  if (q.includes('non-compliant') || q.includes('storage'))
    return 'Storage arrays `tsg-ilsilon-c01`, `FB-1`, and `tsg-netapp-c01` are currently running RHEL 8.7/8.8 which is 2+ minor versions behind the approved N-1 baseline (RHEL 8.9). I recommend orchestrating firmware & kernel sync in the upcoming batch Wave 03.';
  if (q.includes('risk') || q.includes('wave'))
    return 'Wave 03 (Database Gateways) has a composite risk score of 0.28 (LOW/MEDIUM). Pre-flight checks show all 8 nodes have >30% free disk space in `/var/cache` and active VMware snapshot protection enabled.';
  if (q.includes('sanity'))
    return 'Invoking `sanity-check-agent`... Ping sweeps across 40 target IPs succeeded (0% packet loss). SSH & WinRM credentials validated against HashiCorp Vault.';
  return 'Acknowledged. Query processed by Risk Assessment & Compliance Sync Agents. All 17 active agents are synchronized with ServiceNow CMDB and Milvus vector memories.';
};

/** Local (simulated) model adapter — streams the canned reply word by word. Swap `run` for a real backend call. */
const copilotAdapter = {
  async *run({ messages, abortSignal }) {
    const last = messages[messages.length - 1];
    const query = last.content.filter((p) => p.type === 'text').map((p) => p.text).join(' ');
    await new Promise((r) => setTimeout(r, 500));
    let text = '';
    for (const word of replyFor(query).split(' ')) {
      if (abortSignal.aborted) return;
      text += (text ? ' ' : '') + word;
      yield { content: [{ type: 'text', text }] };
      await new Promise((r) => setTimeout(r, 35));
    }
  },
};

const STORE_KEY = 'nexus.copilot.chats';
const uid = () => Math.random().toString(36).slice(2, 10);
const ago = (h) => Date.now() - h * 3600 * 1000;
const msg = (role, text) => ({ role, content: [{ type: 'text', text }] });

const SEED_CHATS = [
  { id: 's1', title: 'Non-compliant storage devices', updatedAt: ago(3), messages: [
    msg('user', 'Why are 8 storage devices non-compliant?'), msg('assistant', replyFor('storage')) ] },
  { id: 's2', title: 'Wave 03 risk score', updatedAt: ago(26), messages: [
    msg('user', 'Show me the 5-factor risk score for Wave 03'), msg('assistant', replyFor('risk wave')) ] },
  { id: 's3', title: 'RHEL pre-flight sanity checks', updatedAt: ago(30), messages: [
    msg('user', 'Trigger pre-flight sanity checks for RHEL estate'), msg('assistant', replyFor('sanity')) ] },
  { id: 's4', title: 'CVE closure evidence', updatedAt: ago(96), messages: [
    msg('user', 'Summarize CVE closure evidence for last patch cycle'), msg('assistant', replyFor('cve')) ] },
];

const loadChats = () => {
  try {
    const raw = JSON.parse(localStorage.getItem(STORE_KEY));
    if (Array.isArray(raw)) return raw;
  } catch { /* storage unavailable */ }
  return SEED_CHATS;
};

const groupOf = (t) => {
  const d = (Date.now() - t) / 86400000;
  return d < 1 ? 'Today' : d < 2 ? 'Yesterday' : d < 8 ? 'Previous 7 days' : 'Older';
};

export default function AIChatCopilot() {
  const [chats, setChats] = useState(loadChats);
  const [activeId, setActiveId] = useState(null); // null = fresh conversation
  const [freshKey, setFreshKey] = useState(0);
  const [query, setQuery] = useState('');

  useEffect(() => {
    try { localStorage.setItem(STORE_KEY, JSON.stringify(chats)); } catch { /* storage unavailable */ }
  }, [chats]);

  const active = chats.find((c) => c.id === activeId);

  // Called by the thread whenever a run finishes; creates the chat on first reply.
  const persist = (id, messages) => {
    if (!messages.length) return;
    const first = messages.find((m) => m.role === 'user');
    const text = first?.content.find((p) => p.type === 'text')?.text || 'New conversation';
    const slim = messages.map((m) => ({ role: m.role, content: m.content.filter((p) => p.type === 'text') }));
    if (id === draftId) setActiveId(id);
    setChats((prev) => {
      const exists = prev.some((c) => c.id === id);
      const next = { id, title: text.length > 42 ? text.slice(0, 42) + '…' : text, updatedAt: Date.now(), messages: slim };
      return exists ? prev.map((c) => (c.id === id ? { ...c, ...next, title: c.title } : c)) : [next, ...prev];
    });
  };

  const [draftId, setDraftId] = useState(uid);
  const threadId = activeId ?? draftId;

  const newChat = () => { setActiveId(null); setDraftId(uid()); setFreshKey((k) => k + 1); };
  const remove = (id) => {
    setChats((prev) => prev.filter((c) => c.id !== id));
    if (id === activeId) newChat();
  };

  const filtered = chats
    .filter((c) => c.title.toLowerCase().includes(query.toLowerCase()))
    .sort((a, b) => b.updatedAt - a.updatedAt);
  const groups = ['Today', 'Yesterday', 'Previous 7 days', 'Older']
    .map((g) => [g, filtered.filter((c) => groupOf(c.updatedAt) === g)])
    .filter(([, list]) => list.length);

  return (
    <div className="p-6 w-full max-w-[1400px] mx-auto h-[calc(100vh-6rem)] flex gap-4 animate-in fade-in">
      {/* Conversation */}
      <div className="flex-1 min-w-0 flex flex-col gap-4">
        <div className="nexus-card p-4 flex items-center justify-between gap-3">
          <div>
            <h2 className="text-sm font-bold text-fg flex items-center gap-2">
              <span>{active ? active.title : 'New conversation'}</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                {AGENTS_LIST.length} Agents Connected
              </span>
            </h2>
            <p className="text-xs text-fg3 mt-0.5">
              Natural language interface to orchestrate, analyze, and query your entire patch estate.
            </p>
          </div>
        </div>

        <Conversation
          key={`${threadId}-${freshKey}`}
          threadId={threadId}
          initialMessages={active?.messages}
          onSettled={persist}
        />
      </div>

      {/* Past conversations */}
      <aside className="hidden lg:flex w-72 flex-shrink-0 nexus-card flex-col overflow-hidden">
        <div className="p-3 space-y-2.5 border-b border-ink/[0.08]">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-fg2 flex items-center gap-1.5">
              <History size={13} className="text-cyan-400" /> Past Conversations
            </span>
            <span className="text-[10px] font-mono text-fg4">{chats.length}</span>
          </div>
          <button
            onClick={newChat}
            className="w-full flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-semibold bg-cyan-400 hover:bg-cyan-300 text-onbright transition-colors"
          >
            <Plus size={14} /> New chat
          </button>
          <div className="relative">
            <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-fg4" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search conversations"
              className="w-full pl-8 pr-2 py-1.5 rounded-lg bg-inset border border-ink/[0.08] text-xs text-fg placeholder-fg4 focus:outline-none focus:border-cyan-500/50"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-2 space-y-3">
          {groups.length === 0 && <div className="text-xs text-fg4 text-center py-8">No conversations found</div>}
          {groups.map(([g, list]) => (
            <div key={g}>
              <div className="px-2 pb-1 text-[10px] font-bold uppercase tracking-wider text-fg4">{g}</div>
              {list.map((c) => (
                <div
                  key={c.id}
                  onClick={() => { setActiveId(c.id); setFreshKey((k) => k + 1); }}
                  className={`group flex items-center gap-2 px-2.5 py-2 rounded-xl cursor-pointer transition-colors ${
                    c.id === activeId ? 'bg-cyan-500/10 border border-cyan-500/30' : 'border border-transparent hover:bg-ink/[0.05]'
                  }`}
                >
                  <MessageSquare size={13} className={c.id === activeId ? 'text-cyan-400' : 'text-fg4'} />
                  <div className="min-w-0 flex-1">
                    <div className="text-xs text-fg2 truncate">{c.title}</div>
                    <div className="text-[10px] text-fg4">
                      {c.messages.length} messages · {new Date(c.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                  <button
                    onClick={(e) => { e.stopPropagation(); remove(c.id); }}
                    className="opacity-0 group-hover:opacity-100 p-1 rounded text-fg4 hover:text-rose-400 transition-opacity"
                    aria-label="Delete conversation"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              ))}
            </div>
          ))}
        </div>
      </aside>
    </div>
  );
}

/** One thread. Remounted (via key) when switching conversations so the runtime starts from that history. */
function Conversation({ threadId, initialMessages, onSettled }) {
  const runtime = useLocalRuntime(copilotAdapter, { initialMessages });
  return (
    <AssistantRuntimeProvider runtime={runtime}>
      <SettleSync threadId={threadId} onSettled={onSettled} />
      <ThreadPrimitive.Root className="flex-1 min-h-0 flex flex-col gap-4">
        <div className="flex-1 min-h-0 nexus-card relative flex flex-col">
          <ThreadPrimitive.Viewport className="flex-1 overflow-y-auto p-6 space-y-5">
            <AuiIf condition={(s) => s.thread.isEmpty}>
              <Welcome />
            </AuiIf>
            <ThreadPrimitive.Messages>
              {({ message }) => (message.role === 'user' ? <UserMessage /> : <AssistantMessage />)}
            </ThreadPrimitive.Messages>
          </ThreadPrimitive.Viewport>

          <ThreadPrimitive.ScrollToBottom className="absolute bottom-3 left-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-surface border border-ink/15 text-fg2 hover:text-fg flex items-center justify-center shadow-lg disabled:hidden">
            <ArrowDown size={14} />
          </ThreadPrimitive.ScrollToBottom>
        </div>

        <AuiIf condition={(s) => !s.thread.isEmpty}>
          <Suggestions className="overflow-x-auto" />
        </AuiIf>

        <ComposerPrimitive.Root className="nexus-card px-3 py-2 focus-within:border-cyan-500/60 transition-colors">
          <ComposerPrimitive.Input
            rows={2}
            autoFocus
            placeholder="Ask Copilot anything about your patches, compliance, or agents..."
            className="w-full min-h-[48px] max-h-40 resize-none bg-transparent px-2 py-1.5 text-xs text-fg placeholder-fg4 focus:outline-none"
          />
          <div className="flex items-center justify-between pt-1">
            <span className="text-[10px] text-fg4 px-2">Enter to send · Shift + Enter for a new line</span>
            <AuiIf condition={(s) => !s.thread.isRunning}>
              <ComposerPrimitive.Send className="h-8 px-3.5 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-onbright text-xs font-semibold flex items-center gap-2 transition-all active:scale-95 shadow-md shadow-cyan-500/20 disabled:opacity-40 disabled:cursor-not-allowed">
                Send <Send size={13} />
              </ComposerPrimitive.Send>
            </AuiIf>
            <AuiIf condition={(s) => s.thread.isRunning}>
              <ComposerPrimitive.Cancel className="h-8 px-3.5 rounded-xl bg-rose-500 hover:bg-rose-400 text-white text-xs font-semibold flex items-center gap-2 transition-all active:scale-95">
                Stop <Square size={12} />
              </ComposerPrimitive.Cancel>
            </AuiIf>
          </div>
        </ComposerPrimitive.Root>
      </ThreadPrimitive.Root>
    </AssistantRuntimeProvider>
  );
}

/** Reports the thread's messages to the history store each time a run finishes. */
function SettleSync({ threadId, onSettled }) {
  const running = useAuiState((s) => s.thread.isRunning);
  const messages = useAuiState((s) => s.thread.messages);
  const wasRunning = useRef(false);
  useEffect(() => {
    if (wasRunning.current && !running) onSettled(threadId, messages);
    wasRunning.current = running;
  }, [running]); // eslint-disable-line react-hooks/exhaustive-deps
  return null;
}

/** Orb reflects thread state: thinking before the first token, active while streaming, calm otherwise. */
function ChatOrb({ className }) {
  const state = useAuiState((s) => {
    if (!s.thread.isRunning) return 'idle';
    const last = s.thread.messages[s.thread.messages.length - 1];
    return last?.role === 'assistant' && last.content.length > 0 ? 'speaking' : 'connecting';
  });
  return <VoiceOrb state={state} variant="emerald" className={className} />;
}

function Suggestions({ className = '' }) {
  return (
    <div className={`flex gap-2 text-xs ${className}`}>
      {SUGGESTED_PROMPTS.map((p) => (
        <ThreadPrimitive.Suggestion
          key={p}
          prompt={p}
          send
          className="px-3 py-1.5 rounded-full bg-ink/[0.04] hover:bg-ink/[0.08] border border-ink/[0.08] text-fg2 hover:text-fg whitespace-nowrap transition-all active:scale-95"
        >
          {p}
        </ThreadPrimitive.Suggestion>
      ))}
    </div>
  );
}

const STARTERS = [
  { icon: ShieldAlert, title: 'Investigate compliance', prompt: SUGGESTED_PROMPTS[0] },
  { icon: Gauge, title: 'Assess wave risk', prompt: SUGGESTED_PROMPTS[1] },
  { icon: ListChecks, title: 'Run pre-flight checks', prompt: SUGGESTED_PROMPTS[2] },
  { icon: FileCheck2, title: 'Summarise evidence', prompt: SUGGESTED_PROMPTS[3] },
];

function Welcome() {
  return (
    <div className="h-full min-h-[320px] flex flex-col items-center justify-center text-center gap-4 px-4">
      <ChatOrb className="w-28 h-28" />
      <div className="max-w-xl space-y-1.5">
        <h3 className="text-base font-bold text-fg">Hello Wipro Admin!</h3>
        <p className="text-xs text-fg3 leading-relaxed">
          I am your Agentic Patching Copilot. I have real-time visibility into all {AGENTS_LIST.length} AI agents, {MANAGED_HOSTS} managed hosts,
          baseline compliance drift, and active patch cycles. How can I assist you today?
        </p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 w-full max-w-2xl text-left">
        {STARTERS.map(({ icon: Icon, title, prompt }) => (
          <ThreadPrimitive.Suggestion
            key={prompt}
            prompt={prompt}
            send
            className="group p-3.5 rounded-xl bg-ink/[0.03] hover:bg-ink/[0.07] border border-ink/[0.08] hover:border-cyan-500/40 transition-all active:scale-[0.99]"
          >
            <span className="flex items-center gap-2 text-xs font-bold text-fg group-hover:text-cyan-300"><Icon size={14} className="text-cyan-400" /> {title}</span>
            <span className="block text-[11px] text-fg3 mt-1 leading-snug">{prompt}</span>
          </ThreadPrimitive.Suggestion>
        ))}
      </div>
    </div>
  );
}

function AssistantMessage() {
  return (
    <MessagePrimitive.Root className="flex gap-3 max-w-[85%]">
      <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 bg-teal-950/80 border border-teal-500/40 text-teal-400">
        <Bot size={16} />
      </div>
      <div className="space-y-1.5 min-w-0">
        <div className="p-4 rounded-2xl text-xs leading-relaxed bg-inset border border-ink/[0.08] text-fg2 shadow-md whitespace-pre-line">
          <MessagePrimitive.Parts />
          <AuiIf condition={(s) => s.message.status?.type === 'running' && s.message.parts.length === 0}>
            <span className="flex items-center gap-2 text-fg3">
              <RefreshCw size={13} className="animate-spin text-teal-400" />
              Analyzing agent swarm telemetry...
            </span>
          </AuiIf>
        </div>
        <ActionBarPrimitive.Root hideWhenRunning autohide="not-last" className="flex gap-1 px-1 text-fg4">
          <ActionBarPrimitive.Copy className="group p-1 rounded hover:text-fg hover:bg-ink/5" aria-label="Copy">
            <Copy size={12} className="group-data-[copied]:hidden" />
            <Check size={12} className="hidden group-data-[copied]:block text-emerald-400" />
          </ActionBarPrimitive.Copy>
          <ActionBarPrimitive.Reload className="p-1 rounded hover:text-fg hover:bg-ink/5" aria-label="Regenerate">
            <RefreshCw size={12} />
          </ActionBarPrimitive.Reload>
        </ActionBarPrimitive.Root>
      </div>
    </MessagePrimitive.Root>
  );
}

function UserMessage() {
  return (
    <MessagePrimitive.Root className="flex gap-3 max-w-[85%] ml-auto flex-row-reverse">
      <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 bg-cyan-500 text-onbright">
        <User size={16} />
      </div>
      <div className="p-4 rounded-2xl text-xs leading-relaxed bg-gradient-to-r from-cyan-500 to-blue-600 text-onbright font-medium shadow-md shadow-cyan-500/10 whitespace-pre-line">
        <MessagePrimitive.Parts />
      </div>
    </MessagePrimitive.Root>
  );
}
