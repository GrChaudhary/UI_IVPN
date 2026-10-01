// ─────────────────────────────────────────────────────────────────────────────
// simulationData.js
// Chart.js dataset definitions and chart option configs for all simulation
// related bar charts rendered in the dashboard.
// Imported by CentralDashboard.jsx — keeps chart config out of the component.
// ─────────────────────────────────────────────────────────────────────────────

/** Shared dark tooltip style applied to all simulation charts */
const darkTooltip = (borderColor = 'rgba(0,242,254,0.3)') => ({
  backgroundColor: '#0e1424',
  borderColor,
  borderWidth: 1,
  titleColor: '#94a3b8',
  bodyColor: '#e2e8f0',
  padding: 10,
  cornerRadius: 8,
});

/** Light-theme variant of a chart options object: darker axis text, visible grid lines. */
export function themedOptions(opts, theme) {
  if (theme !== 'light') return opts;
  const tick = '#475569';
  const axis = (a, grid) => ({ ...a, ticks: { ...a.ticks, color: tick }, ...(grid && { grid: { ...a.grid, color: 'rgba(15,23,42,0.08)' } }) });
  const legend = opts.plugins.legend;
  return {
    ...opts,
    plugins: { ...opts.plugins, legend: legend.labels ? { ...legend, labels: { ...legend.labels, color: tick } } : legend },
    scales: { x: axis(opts.scales.x), y: axis(opts.scales.y, true) },
  };
}

// ─── 14-Day Execution Activity ────────────────────────────────────────────────

export const EXEC_ACTIVITY_DATA = {
  labels: ['Aug 6', 'Aug 9', 'Aug 12', 'Aug 15', 'Aug 18', 'Aug 19', 'Aug 22'],
  datasets: [
    {
      label: 'Completed',
      data: [8, 0, 14, 22, 15, 11, 6],
      backgroundColor: 'rgba(16,185,129,0.85)',
      hoverBackgroundColor: '#10b981',
      borderRadius: 4,
      borderSkipped: false,
    },
    {
      label: 'Warnings',
      data: [10, 0, 10, 16, 12, 9, 4],
      backgroundColor: 'rgba(249,115,22,0.85)',
      hoverBackgroundColor: '#f97316',
      borderRadius: 4,
      borderSkipped: false,
    },
    {
      label: 'Errors',
      data: [0, 0, 0, 0, 0, 0, 1],
      backgroundColor: 'rgba(239,68,68,0.85)',
      hoverBackgroundColor: '#ef4444',
      borderRadius: 4,
      borderSkipped: false,
    },
  ],
};

export const EXEC_ACTIVITY_OPTIONS = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: false },
    tooltip: darkTooltip('rgba(0,242,254,0.3)'),
  },
  scales: {
    x: {
      stacked: true,
      grid: { display: false },
      ticks: { color: '#64748b', font: { size: 10, family: 'monospace' } },
      border: { display: false },
    },
    y: {
      stacked: true,
      grid: { color: 'rgba(255,255,255,0.04)', drawBorder: false },
      ticks: { color: '#64748b', font: { size: 10 }, maxTicksLimit: 5 },
      border: { display: false },
    },
  },
};

// ─── Monthly Patch Activity (full year) ──────────────────────────────────────

export const MONTHLY_DATA = {
  labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
  datasets: [
    {
      label: 'Successful',
      data: [12, 19, 8, 25, 17, 30, 22, 35, 28, 0, 0, 0],
      backgroundColor: 'rgba(56,189,248,0.75)',
      hoverBackgroundColor: '#38bdf8',
      borderRadius: 5,
      borderSkipped: false,
    },
    {
      label: 'Warnings',
      data: [3, 5, 2, 8, 4, 9, 6, 13, 7, 0, 0, 0],
      backgroundColor: 'rgba(249,115,22,0.75)',
      hoverBackgroundColor: '#f97316',
      borderRadius: 5,
      borderSkipped: false,
    },
    {
      label: 'Failed',
      data: [1, 0, 1, 2, 0, 1, 0, 0, 2, 0, 0, 0],
      backgroundColor: 'rgba(239,68,68,0.7)',
      hoverBackgroundColor: '#ef4444',
      borderRadius: 5,
      borderSkipped: false,
    },
  ],
};

export const MONTHLY_OPTIONS = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: true,
      position: 'top',
      align: 'end',
      labels: {
        color: '#94a3b8',
        font: { size: 11 },
        boxWidth: 10,
        boxHeight: 10,
        borderRadius: 3,
        useBorderRadius: true,
        padding: 14,
      },
    },
    tooltip: darkTooltip('rgba(56,189,248,0.3)'),
  },
  scales: {
    x: {
      stacked: true,
      grid: { display: false },
      ticks: { color: '#64748b', font: { size: 11 } },
      border: { display: false },
    },
    y: {
      stacked: true,
      grid: { color: 'rgba(255,255,255,0.05)', drawBorder: false },
      ticks: { color: '#64748b', font: { size: 11 }, maxTicksLimit: 6 },
      border: { display: false },
    },
  },
};
