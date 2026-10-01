import { formatDuration } from './runDetail';

// Office/PDF libraries are loaded on demand, only when a download is requested.

export const REPORT_FORMATS = [
  { id: 'xlsx', label: 'Excel', ext: 'xlsx', desc: 'Workbook with summary, stage-wise and host-level sheets.' },
  { id: 'csv', label: 'CSV', ext: 'csv', desc: 'Plain-text sections for scripts and spreadsheets.' },
  { id: 'pdf', label: 'PDF', ext: 'pdf', desc: 'Print-ready report with tables and page numbers.' },
  { id: 'pptx', label: 'PowerPoint', ext: 'pptx', desc: 'Slide deck for change-board and status reviews.' },
  { id: 'docx', label: 'Word', ext: 'docx', desc: 'Editable document with stage-by-stage write-up.' },
];

const STATE_LABEL = { done: 'Completed', failed: 'Failed', active: 'Running', pending: 'Not run' };

/** One table model shared by every export format. */
function model(run, detail) {
  const stageRows = detail.stages.map((s) => [
    s.n, s.name, s.agent, STATE_LABEL[s.state] + (s.warn ? ' (warnings)' : ''), s.start || '-', s.durationSec ? formatDuration(s.durationSec) : '-', s.summary,
  ]);
  const hostRows = detail.hosts.map((h) => [h.name, h.ip, h.wave, h.before, h.after, h.attempts, formatDuration(h.durationSec), h.status, h.note || '-']);
  const logRows = detail.stages.flatMap((s) => s.events.map((e) => [s.n, e.time, e.message]));
  return {
    title: 'Patch Run Report',
    facts: detail.facts,
    stageCols: ['Stage', 'Name', 'Agent', 'Result', 'Start', 'Duration', 'Outcome'],
    stageRows,
    hostCols: ['Host', 'IP', 'Wave', 'Before', 'After', 'Attempts', 'Duration', 'Result', 'Note'],
    hostRows,
    logCols: ['Stage', 'Time', 'Message'],
    logRows,
  };
}

const save = (blob, name) => {
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = name;
  document.body.append(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(a.href), 1000);
};

const cell = (v) => `"${String(v).replace(/"/g, '""')}"`;
const csvLines = (rows) => rows.map((r) => r.map(cell).join(','));

const exporters = {
  csv(m) {
    const text = [
      cell(m.title), ...csvLines(m.facts), '',
      cell('Stage-wise results'), ...csvLines([m.stageCols, ...m.stageRows]), '',
      cell('Host results'), ...csvLines([m.hostCols, ...m.hostRows]), '',
      cell('Execution log'), ...csvLines([m.logCols, ...m.logRows]),
    ].join('\r\n');
    return new Blob(['﻿' + text], { type: 'text/csv;charset=utf-8' });
  },

  async xlsx(m) {
    const ExcelJS = (await import('exceljs')).default;
    const wb = new ExcelJS.Workbook();
    wb.creator = 'Patch 2.0';
    const sheet = (name, cols, rows, widths) => {
      const ws = wb.addWorksheet(name, { views: [{ state: 'frozen', ySplit: 1 }] });
      ws.addRow(cols).eachCell((c) => {
        c.font = { bold: true, color: { argb: 'FFFFFFFF' } };
        c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF0E7490' } };
      });
      rows.forEach((r) => ws.addRow(r));
      ws.columns.forEach((c, i) => { c.width = widths[i]; });
      ws.autoFilter = { from: { row: 1, column: 1 }, to: { row: 1, column: cols.length } };
      return ws;
    };
    const summary = sheet('Summary', ['Field', 'Value'], m.facts, [24, 60]);
    summary.getColumn(2).alignment = { horizontal: 'left' };
    sheet('Stages', m.stageCols, m.stageRows, [8, 46, 38, 18, 10, 11, 80]);
    const hosts = sheet('Hosts', m.hostCols, m.hostRows, [26, 16, 7, 22, 22, 10, 11, 10, 40]);
    const tone = { Passed: 'FF15803D', Warning: 'FFB45309', Failed: 'FFB91C1C' };
    hosts.eachRow((row, i) => {
      if (i > 1) row.getCell(8).font = { bold: true, color: { argb: tone[row.getCell(8).value] ?? 'FF000000' } };
    });
    sheet('Log', m.logCols, m.logRows, [8, 11, 90]);
    const buffer = await wb.xlsx.writeBuffer();
    return new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  },

  async pdf(m) {
    const { jsPDF } = await import('jspdf');
    const autoTable = (await import('jspdf-autotable')).default;
    const doc = new jsPDF({ orientation: 'landscape', unit: 'pt', format: 'a4' });
    const head = { fillColor: [14, 116, 144], textColor: 255 };
    doc.setFontSize(18);
    doc.text(m.title, 40, 44);
    doc.setFontSize(9);
    doc.setTextColor(100);
    doc.text(String(m.facts[0][1]), 40, 60);
    doc.setTextColor(0);

    const half = Math.ceil(m.facts.length / 2);
    autoTable(doc, {
      startY: 74,
      body: Array.from({ length: half }, (_, i) => [...m.facts[i], ...(m.facts[i + half] ?? ['', ''])]),
      theme: 'plain',
      styles: { fontSize: 9, cellPadding: 3 },
      columnStyles: { 0: { fontStyle: 'bold', cellWidth: 110 }, 1: { cellWidth: 240 }, 2: { fontStyle: 'bold', cellWidth: 110 } },
    });
    doc.setFontSize(12);
    doc.text('Stage-wise results', 40, doc.lastAutoTable.finalY + 26);
    autoTable(doc, {
      startY: doc.lastAutoTable.finalY + 34,
      head: [m.stageCols], body: m.stageRows, headStyles: head,
      styles: { fontSize: 8, cellPadding: 3, overflow: 'linebreak' },
      columnStyles: { 0: { cellWidth: 36 }, 1: { cellWidth: 150 }, 2: { cellWidth: 130 }, 6: { cellWidth: 220 } },
    });
    doc.addPage();
    doc.setFontSize(12);
    doc.text(`Host results (${m.hostRows.length})`, 40, 40);
    autoTable(doc, {
      startY: 50, head: [m.hostCols], body: m.hostRows, headStyles: head,
      styles: { fontSize: 8, cellPadding: 2.5 },
      didParseCell: ({ section, column, cell: c }) => {
        if (section === 'body' && column.index === 7) {
          c.styles.textColor = { Passed: [21, 128, 61], Warning: [180, 83, 9], Failed: [185, 28, 28] }[c.raw] ?? 0;
          c.styles.fontStyle = 'bold';
        }
      },
    });
    const pages = doc.getNumberOfPages();
    for (let p = 1; p <= pages; p++) {
      doc.setPage(p);
      doc.setFontSize(8);
      doc.setTextColor(120);
      doc.text(`Page ${p} of ${pages}`, doc.internal.pageSize.getWidth() - 40, doc.internal.pageSize.getHeight() - 20, { align: 'right' });
    }
    return doc.output('blob');
  },

  async pptx(m) {
    const PptxGenJS = (await import('pptxgenjs')).default;
    const pptx = new PptxGenJS();
    pptx.layout = 'LAYOUT_WIDE';
    const font = 'Calibri';
    const head = (t) => ({ text: t, options: { bold: true, color: 'FFFFFF', fill: { color: '0E7490' } } });
    const fact = (k) => m.facts.find(([key]) => key === k)[1];

    let s = pptx.addSlide();
    s.background = { color: '0B1220' };
    s.addText(m.title, { x: 0.6, y: 2.2, w: 12, h: 1, fontFace: font, fontSize: 40, bold: true, color: 'FFFFFF' });
    s.addText(String(fact('Run ID')), { x: 0.6, y: 3.2, w: 12, h: 0.5, fontFace: font, fontSize: 16, color: '67E8F9' });
    s.addText(`${fact('Technology')} · ${fact('Environment')} · ${fact('Status')} · ${fact('Started (IST)')}`, { x: 0.6, y: 3.8, w: 12, h: 0.5, fontFace: font, fontSize: 14, color: 'CBD5E1' });

    s = pptx.addSlide();
    s.addText('Run summary', { x: 0.5, y: 0.3, w: 12, h: 0.6, fontFace: font, fontSize: 26, bold: true, color: '0E7490' });
    [['Hosts in scope', 'Hosts in scope', '0E7490'], ['Passed', 'Passed', '15803D'], ['Warnings', 'Warnings', 'B45309'], ['Failed', 'Failed', 'B91C1C'], ['Duration', 'Duration', '334155']].forEach(([label, key, color], i) => {
      s.addShape(pptx.ShapeType.roundRect, { x: 0.5 + i * 2.5, y: 1.2, w: 2.3, h: 1.3, fill: { color: 'F1F5F9' }, line: { color, width: 1.5 }, rectRadius: 0.1 });
      s.addText(String(fact(key)), { x: 0.5 + i * 2.5, y: 1.3, w: 2.3, h: 0.7, align: 'center', fontFace: font, fontSize: 28, bold: true, color });
      s.addText(label, { x: 0.5 + i * 2.5, y: 2.0, w: 2.3, h: 0.4, align: 'center', fontFace: font, fontSize: 12, color: '475569' });
    });
    s.addTable(m.facts.map(([k, v]) => [{ text: k, options: { bold: true } }, String(v)]), { x: 0.5, y: 2.9, w: 12.3, colW: [3, 9.3], fontFace: font, fontSize: 11, border: { type: 'solid', color: 'E2E8F0', pt: 0.5 } });

    s = pptx.addSlide();
    s.addText('Stage-by-stage results', { x: 0.5, y: 0.3, w: 12, h: 0.6, fontFace: font, fontSize: 26, bold: true, color: '0E7490' });
    s.addTable(
      [[head('#'), head('Stage'), head('Agent'), head('Result'), head('Duration')], ...m.stageRows.map((r) => [String(r[0]), r[1], r[2], r[3], r[5]])],
      { x: 0.5, y: 1.1, w: 12.3, colW: [0.5, 5.2, 3.6, 1.8, 1.2], fontFace: font, fontSize: 11, border: { type: 'solid', color: 'E2E8F0', pt: 0.5 } },
    );

    const outcomes = m.stageRows.filter((r) => r[3] !== 'Not run');
    for (let i = 0; i < outcomes.length; i += 5) {
      s = pptx.addSlide();
      s.addText('Stage outcomes', { x: 0.5, y: 0.3, w: 12, h: 0.6, fontFace: font, fontSize: 26, bold: true, color: '0E7490' });
      s.addText(
        outcomes.slice(i, i + 5).flatMap((r) => [
          { text: `Stage ${r[0]}: ${r[1]}`, options: { bold: true, fontSize: 15, color: '0F172A', breakLine: true } },
          { text: `${r[3]} · ${r[4]} · ${r[5]}`, options: { fontSize: 11, color: '64748B', breakLine: true } },
          { text: r[6], options: { fontSize: 13, color: '334155', breakLine: true } },
          { text: ' ', options: { fontSize: 6, breakLine: true } },
        ]),
        { x: 0.5, y: 1.1, w: 12.3, h: 5.8, fontFace: font, valign: 'top' },
      );
    }

    s = pptx.addSlide();
    s.addText('Hosts needing attention', { x: 0.5, y: 0.3, w: 12, h: 0.6, fontFace: font, fontSize: 26, bold: true, color: '0E7490' });
    const flagged = m.hostRows.filter((r) => r[7] !== 'Passed');
    if (flagged.length === 0) {
      s.addText(`All ${m.hostRows.length} hosts completed without warnings or failures.`, { x: 0.5, y: 1.4, w: 12, h: 0.6, fontFace: font, fontSize: 18, color: '15803D' });
    } else {
      s.addTable(
        [[head('Host'), head('Result'), head('Attempts'), head('Note')], ...flagged.slice(0, 14).map((r) => [r[0], r[7], String(r[5]), r[8]])],
        { x: 0.5, y: 1.1, w: 12.3, colW: [4.2, 1.5, 1.3, 5.3], fontFace: font, fontSize: 11, border: { type: 'solid', color: 'E2E8F0', pt: 0.5 } },
      );
      if (flagged.length > 14) s.addText(`+ ${flagged.length - 14} more in the Excel / PDF report`, { x: 0.5, y: 6.9, w: 12, h: 0.4, fontFace: font, fontSize: 11, color: '64748B' });
    }
    return pptx.write({ outputType: 'blob' });
  },

  async docx(m) {
    const d = await import('docx');
    const { Document, Packer, Paragraph, HeadingLevel, Table, TableRow, TableCell, WidthType, ShadingType, TextRun } = d;
    const cellOf = (text, o = {}) =>
      new TableCell({
        shading: o.fill ? { type: ShadingType.CLEAR, fill: o.fill, color: 'auto' } : undefined,
        children: [new Paragraph({ children: [new TextRun({ text: String(text), bold: o.bold, color: o.color, size: o.size ?? 18 })] })],
      });
    const table = (cols, rows) =>
      new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        rows: [
          new TableRow({ tableHeader: true, children: cols.map((c) => cellOf(c, { bold: true, color: 'FFFFFF', fill: '0E7490' })) }),
          ...rows.map((r) => new TableRow({ children: r.map((v) => cellOf(v)) })),
        ],
      });

    const stageBlocks = m.stageRows.flatMap((r, i) => {
      const stage = { name: r[1], agent: r[2], result: r[3], start: r[4], duration: r[5], summary: r[6] };
      return [
        new Paragraph({ heading: HeadingLevel.HEADING_3, text: `Stage ${r[0]}: ${stage.name}` }),
        new Paragraph({ children: [new TextRun({ text: `${stage.result} · ${stage.agent} · start ${stage.start} · ${stage.duration}`, italics: true, color: '64748B', size: 18 })] }),
        new Paragraph({ text: stage.summary }),
        ...m.stageMetrics[i].map(([k, v]) => new Paragraph({ bullet: { level: 0 }, children: [new TextRun({ text: `${k}: `, bold: true }), new TextRun(String(v))] })),
      ];
    });

    const doc = new Document({
      creator: 'Patch 2.0',
      title: m.title,
      sections: [{
        children: [
          new Paragraph({ heading: HeadingLevel.TITLE, text: m.title }),
          new Paragraph({ children: [new TextRun({ text: String(m.facts[0][1]), color: '0E7490' })] }),
          new Paragraph({ heading: HeadingLevel.HEADING_1, text: 'Run summary' }),
          table(['Field', 'Value'], m.facts),
          new Paragraph({ heading: HeadingLevel.HEADING_1, text: 'Stage-by-stage detail' }),
          ...stageBlocks,
          new Paragraph({ heading: HeadingLevel.HEADING_1, text: `Host results (${m.hostRows.length})` }),
          table(m.hostCols, m.hostRows),
        ],
      }],
    });
    return Packer.toBlob(doc);
  },
};

/** Builds the report for one run in the chosen format and downloads it. */
export async function downloadRunReport(run, detail, formatId) {
  const format = REPORT_FORMATS.find((f) => f.id === formatId);
  const m = { ...model(run, detail), stageMetrics: detail.stages.map((s) => s.metrics) };
  const blob = await exporters[formatId](m);
  save(blob, `patch-run-${run.id.replace(/[^\w-]+/g, '_')}.${format.ext}`);
}
