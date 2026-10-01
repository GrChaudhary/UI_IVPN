import React, { useState } from 'react';
import OrchestratorHub from './OrchestratorHub';
import Orb from './ui/Orb';
import { tone } from '../tone';

const W = 1200;
const H = 800;
const PANEL_W = 266;
const PANEL_GAP = 32;
const PANEL_TOP = 310;
const ROW_Y0 = PANEL_TOP + 128;
const ROW_STEP = 118;
const ROW_DX = { 1: [0], 2: [-62, 62], 3: [-90, 0, 90] };
const HUB_BOTTOM = 150;
const NODE_HALF_W = 30; // edges attach to the orb, not its label
const NODE_HALF_H = 30;

/** Agent-to-agent connections: `handoff` carries work forward, `side` is telemetry / audit evidence. */
const LINKS = [
  [1, 4, 'healthy hosts'], [2, 4, 'CVE set'], [3, 4, 'asset inventory'], [4, 5, 'risk score'],
  [5, 6, 'incident history'], [3, 6, 'target hosts'], [6, 7, 'pre-check verdict'], [6, 8, 'blockers'],
  [7, 8, 'snapshot ID'], [8, 9, 'patch-ready hosts'], [4, 9, 'risk → CR type'], [9, 10, 'approved CR'],
  [10, 11, 'change window'], [11, 12, 'patch plan'], [12, 13, 'failed hosts'], [13, 14, 'unrecoverable hosts'],
  [7, 14, 'restore point'], [12, 15, 'execution result'], [14, 15, 'reverted state'], [15, 16, 'validation data'],
  [16, 17, 'patch evidence'], [17, 18, 'updated CMDB'], [18, 19, 'compliance verdict'], [16, 19, 'report evidence'],
  [18, 9, 'CR closure'],
  [12, 20, 'KPI stream', 'side'], [15, 20, 'KPI stream', 'side'], [6, 20, 'KPI stream', 'side'],
  [9, 19, 'CR trail', 'side'], [12, 19, 'execution log', 'side'],
].map(([from, to, label, kind = 'handoff']) => ({ from, to, label, kind }));

const windowX = (i) => (W - (4 * PANEL_W + 3 * PANEL_GAP)) / 2 + PANEL_W / 2 + i * (PANEL_W + PANEL_GAP);
const pct = (v, total) => `${(v / total) * 100}%`;

/** Place each window's agents on its configured rows (agents on one row run side by side). */
function layout(categories, agents) {
  return categories.flatMap((cat, ci) =>
    cat.rows.flatMap((row, r) =>
      row.map((id, i) => ({
        agent: agents.find((a) => a.id === id),
        color: cat.color,
        x: windowX(ci) + ROW_DX[row.length][i],
        y: ROW_Y0 + r * ROW_STEP,
      })),
    ),
  ).filter((n) => n.agent);
}

const lerp = (a, b, t) => ({ x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t });
const fmt = (p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`;

/** Curved path between two nodes, trimmed to start/end at the pill edges. Cross-window links arch upward. */
function curve(a, b, flip) {
  const len = Math.hypot(b.x - a.x, b.y - a.y);
  const [ux, uy] = [(b.x - a.x) / len, (b.y - a.y) / len];
  let [nx, ny] = [-uy, ux];
  const horizontal = Math.abs(ux) > Math.abs(uy);
  if (horizontal ? ny > 0 : false) [nx, ny] = [-nx, -ny]; // arch up
  if (!horizontal && flip) [nx, ny] = [-nx, -ny];
  const mid = lerp(a, b, 0.5);
  const c = { x: mid.x + nx * 0.2 * len, y: mid.y + ny * 0.2 * len };
  const trim = Math.min(NODE_HALF_W / Math.max(Math.abs(ux), 0.01), NODE_HALF_H / Math.max(Math.abs(uy), 0.01)) + 5;
  const t0 = Math.min(0.4, trim / len);
  const t1 = 1 - t0;
  // de Casteljau: keep the sub-curve between t0 and t1
  const c1 = lerp(a, c, t1);
  const end = lerp(c1, lerp(c, b, t1), t1);
  const s = t0 / t1;
  const start = lerp(lerp(a, c1, s), lerp(c1, end, s), s);
  return `M${fmt(start)} Q${fmt(lerp(c1, end, s))} ${fmt(end)}`;
}

const stats = (cat, agents) => {
  const own = agents.filter((a) => cat.agents.includes(a.id));
  return { tools: own.reduce((n, a) => n + a.toolsCount, 0), active: own.filter((a) => a.status === 'ACTIVE').length };
};

export default function AgentNetwork({ categories, agents, onSelectAgent }) {
  const [hoverId, setHoverId] = useState(null);
  const nodes = layout(categories, agents);
  const byId = Object.fromEntries(nodes.map((n) => [n.agent.id, n]));
  const edges = LINKS.filter((l) => byId[l.from] && byId[l.to]).map((l, i) => ({
    ...l,
    d: curve(byId[l.from], byId[l.to], i % 2),
    color: byId[l.from].color,
    cat: categories.find((c) => c.color === byId[l.from].color).id,
  }));
  const linked = new Set(hoverId === null ? [] : edges.filter((e) => e.from === hoverId || e.to === hoverId).flatMap((e) => [e.from, e.to]));
  const dim = (id) => hoverId !== null && !linked.has(id) && hoverId !== id;
  const name = (id) => byId[id].agent.name.replace(/-agent$/, '');

  return (
    <div className="space-y-3">
      <div className="overflow-x-auto">
        <div className="relative mx-auto min-w-[1000px] max-w-[1400px]" style={{ aspectRatio: `${W} / ${H}` }}>
          {/* Sequential windows */}
          {categories.map((c, i) => (
            <div
              key={c.id}
              className="absolute rounded-2xl border window-glow"
              style={{
                left: pct(windowX(i) - PANEL_W / 2, W), top: pct(PANEL_TOP, H), width: pct(PANEL_W, W), height: pct(H - 20 - PANEL_TOP, H),
                borderColor: `${c.color}44`, background: `${c.color}0c`, animationDelay: `${i * 1.5}s`, '--glow': c.color,
              }}
            >
              <div className="px-3.5 pt-3">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold font-mono uppercase tracking-wider" style={{ color: tone(c.color) }}>
                    {String(i + 1).padStart(2, '0')} · {c.title}
                  </span>
                  <span className="text-[10px] font-mono text-fg3">{c.agents.length}</span>
                </div>
                <p className="text-[10px] text-fg3 mt-0.5 leading-snug">{c.blurb}</p>
                {c.note && <span className="inline-block mt-1.5 px-1.5 py-0.5 rounded text-[9px] font-mono" style={{ background: `${c.color}1f`, color: tone(c.color) }}>⇉ {c.note}</span>}
              </div>
              <div className="absolute bottom-0 inset-x-0 px-3.5 py-2 border-t flex items-center justify-between text-[10px] font-mono text-fg3" style={{ borderColor: `${c.color}22` }}>
                <span>{stats(c, agents).tools} tools</span>
                <span>{stats(c, agents).active}/{c.agents.length} active</span>
              </div>
            </div>
          ))}

          <svg viewBox={`0 0 ${W} ${H}`} className="absolute inset-0 w-full h-full pointer-events-none z-[1]" aria-hidden="true">
            <defs>
              {categories.map((c) => (
                <marker key={c.id} id={`arrow-${c.id}`} viewBox="0 0 10 10" refX="8" refY="5" markerWidth="9" markerHeight="9" markerUnits="userSpaceOnUse" orient="auto">
                  <path d="M0,1 L9,5 L0,9 z" fill={c.color} />
                </marker>
              ))}
            </defs>

            {/* Orchestrator -> window dispatch, gated by policy */}
            {categories.map((c, i) => {
              const cx = windowX(i);
              const sx = W / 2 + (cx - W / 2) * 0.5;
              const d = `M${sx},${HUB_BOTTOM} C${sx},${HUB_BOTTOM + 55} ${cx},${PANEL_TOP - 55} ${cx},${PANEL_TOP - 2}`;
              return (
                <g key={`drop-${c.id}`} style={{ opacity: hoverId === null ? 1 : 0.3, transition: 'opacity 0.25s' }}>
                  <path d={d} fill="none" stroke={c.color} strokeOpacity="0.7" strokeWidth="1.6" className="flow-line" markerEnd={`url(#arrow-${c.id})`} />
                  <circle r="3" fill={c.color} className="flow-dot">
                    <animateMotion path={d} dur="2.4s" begin={`${i * 0.6}s`} repeatCount="indefinite" />
                  </circle>
                </g>
              );
            })}

            {/* Window -> next window: the sequential pipeline */}
            {categories.slice(0, -1).map((c, i) => {
              const x1 = windowX(i) + PANEL_W / 2 + 3;
              const x2 = windowX(i + 1) - PANEL_W / 2 - 6;
              const d = `M${x1},${PANEL_TOP + 40} L${x2},${PANEL_TOP + 40}`;
              return (
                <g key={`seq-${c.id}`} style={{ opacity: hoverId === null ? 1 : 0.3, transition: 'opacity 0.25s' }}>
                  <path d={d} stroke={categories[i + 1].color} strokeWidth="2.4" className="flow-line" markerEnd={`url(#arrow-${categories[i + 1].id})`} />
                  <circle r="3.5" fill={categories[i + 1].color} className="flow-dot">
                    <animateMotion path={d} dur="1.8s" begin={`${i * 0.5}s`} repeatCount="indefinite" />
                  </circle>
                </g>
              );
            })}

            {/* Agent-to-agent hand-offs */}
            {edges.map((e, i) => {
              const on = hoverId !== null && (e.from === hoverId || e.to === hoverId);
              const faded = hoverId !== null && !on;
              const side = e.kind === 'side';
              return (
                <g key={`${e.from}-${e.to}`} style={{ opacity: faded ? 0.08 : 1, transition: 'opacity 0.25s' }}>
                  <path
                    d={e.d}
                    fill="none"
                    stroke={e.color}
                    strokeOpacity={on ? 1 : side ? 0.3 : 0.6}
                    strokeWidth={on ? 2.2 : side ? 1 : 1.5}
                    className={side ? 'flow-line-slow' : 'flow-line'}
                    markerEnd={side ? undefined : `url(#arrow-${e.cat})`}
                  />
                  {!side && (
                    <circle r={on ? 4 : 2.8} fill={e.color} className="flow-dot">
                      <animateMotion path={e.d} dur={`${2.6 + (i % 4) * 0.5}s`} begin={`${(i * 0.41) % 3}s`} repeatCount="indefinite" />
                    </circle>
                  )}
                </g>
              );
            })}
          </svg>

          {/* Policy gates on each dispatch */}
          {categories.map((c, i) => (
            <span
              key={`gate-${c.id}`}
              className="absolute z-10 -translate-x-1/2 -translate-y-1/2 px-2 py-0.5 rounded-md border text-[10px] font-mono whitespace-nowrap bg-emerald-950/70 border-emerald-500/30 text-emerald-300"
              style={{ left: pct(W / 2 + (windowX(i) - W / 2) * 0.75, W), top: pct((HUB_BOTTOM + PANEL_TOP) / 2, H) }}
            >
              {c.gate}
            </span>
          ))}

          {/* Main orchestrator on top of the windows */}
          <div className="absolute z-10 -translate-x-1/2" style={{ left: '50%', top: 0, width: pct(900, W) }}>
            <OrchestratorHub variant="banner" agentCount={nodes.length} />
          </div>

          {/* Agent nodes: glowing orb + label */}
          {nodes.map(({ agent, color, x, y }, i) => (
            <button
              key={agent.id}
              type="button"
              onClick={() => onSelectAgent?.(agent)}
              onMouseEnter={() => setHoverId(agent.id)}
              onMouseLeave={() => setHoverId(null)}
              onFocus={() => setHoverId(agent.id)}
              onBlur={() => setHoverId(null)}
              title={agent.desc}
              className="absolute -translate-x-1/2 -translate-y-[23px] z-10 flex flex-col items-center gap-1.5 w-[80px] text-center outline-none transition-all duration-200 hover:scale-110 focus-visible:scale-110"
              style={{ left: pct(x, W), top: pct(y, H), opacity: dim(agent.id) ? 0.3 : 1, filter: hoverId === agent.id ? `drop-shadow(0 0 10px ${color}99)` : 'none' }}
            >
              <Orb color={agent.status === 'ACTIVE' ? color : '#64748b'} size={46} pulse={agent.status === 'ACTIVE'} delay={(i * 0.7) % 5}>
                {agent.id}
              </Orb>
              <span className="text-[10px] font-mono font-semibold text-fg leading-tight break-words bg-inset/80 rounded px-1">{agent.name.replace(/-agent$/, '')}</span>
              <span className="text-[9px] font-mono text-fg3 -mt-1 bg-inset/80 rounded px-1">{agent.toolsCount} tools</span>
            </button>
          ))}
        </div>
      </div>

      <div className="nexus-card px-4 py-2.5 text-[11px] text-fg3 min-h-[44px] flex flex-wrap items-center gap-x-6 gap-y-1">
        {hoverId === null ? (
          <>
            <span>Hover an agent to trace what it receives and what it hands off.</span>
            <span className="flex items-center gap-1.5"><span className="w-5 border-t-2 border-dashed border-fg3" /> hand-off</span>
            <span className="flex items-center gap-1.5"><span className="w-5 border-t border-dashed border-fg4" /> telemetry / audit</span>
          </>
        ) : (
          <>
            <span><b className="text-fg2">Receives</b> {edges.filter((e) => e.to === hoverId).map((e) => `${e.label} ← ${name(e.from)}`).join(' · ') || '— (entry point)'}</span>
            <span><b className="text-fg2">Hands off</b> {edges.filter((e) => e.from === hoverId).map((e) => `${e.label} → ${name(e.to)}`).join(' · ') || '— (terminal)'}</span>
          </>
        )}
      </div>
    </div>
  );
}
