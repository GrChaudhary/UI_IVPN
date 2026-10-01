import React, { useState } from 'react';
import { X, Plus, Cpu, Bot, CheckCircle2 } from 'lucide-react';
import Select from './ui/Select';

export default function AddAgentModal({ isOpen, onClose, onAdd }) {
  const [name, setName] = useState('');
  const [desc, setDesc] = useState('');
  const [phase, setPhase] = useState('Phase 1 · Linux · Windows');
  const [toolsCount, setToolsCount] = useState(3);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name) return;
    onAdd({
      name,
      desc: desc || 'Autonomous patch orchestration agent with real-time feedback loops.',
      phase,
      toolsCount: Number(toolsCount),
      status: 'ACTIVE',
      stage: 'Custom Stage',
    });
    setName('');
    setDesc('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in">
      <div className="w-full max-w-lg bg-surface border border-cyan-500/30 rounded-2xl p-6 shadow-2xl animate-in zoom-in-95">
        <div className="flex items-center justify-between pb-3 border-b border-ink/[0.08]">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-cyan-950/80 border border-cyan-500/40 flex items-center justify-center text-cyan-400">
              <Bot size={18} />
            </div>
            <h3 className="text-base font-bold text-fg">Register New Agent</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-fg3 hover:text-fg rounded-lg hover:bg-ink/[0.08]"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-fg2">
              Agent System Name
            </label>
            <input
              type="text"
              placeholder="e.g. kernel-livepatch-agent"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-inset border border-ink/[0.08] rounded-xl px-3.5 py-2 text-xs text-fg font-mono placeholder-fg4 focus:outline-none focus:border-cyan-500"
              required
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-fg2">
              Description & Directive
            </label>
            <textarea
              rows={3}
              placeholder="Specify the autonomous responsibility of this agent..."
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
              className="w-full bg-inset border border-ink/[0.08] rounded-xl p-3 text-xs text-fg2 placeholder-fg4 focus:outline-none focus:border-cyan-500"
            ></textarea>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-fg2">
                Phase & OS Tag
              </label>
              <Select value={phase} onValueChange={setPhase} options={["Phase 1 · Linux · Windows", "Phase 2 · Linux · Windows", "Phase 3 · Linux · Windows", "Phase 4 · Linux · Windows", "Phase 0 · Telemetry"]} className="w-full" />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-fg2">
                MCP Tools Count
              </label>
              <input
                type="number"
                min="1"
                max="10"
                value={toolsCount}
                onChange={(e) => setToolsCount(e.target.value)}
                className="w-full bg-inset border border-ink/[0.08] rounded-xl px-3 py-2 text-xs text-fg focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-ink/[0.08] flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-fg3 hover:text-fg"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-onbright font-bold text-xs rounded-xl shadow-lg shadow-cyan-500/25"
            >
              Register Agent
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
