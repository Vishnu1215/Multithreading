import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { useSimulationStore } from '@/store/simulationStore';
import { FileText, Download, Printer, CheckCircle2, FileSpreadsheet } from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export const ReportPage: React.FC = () => {
  const author = useSimulationStore((s) => s.author);
  const currentMetrics = useSimulationStore((s) => s.currentMetrics);
  const history = useSimulationStore((s) => s.history);
  const config = useSimulationStore((s) => s.config);
  const [exporting, setExporting] = useState<boolean>(false);

  // Generate CSV Export
  const handleExportCSV = () => {
    const headers = ['ID', 'Workload', 'Threads', 'Cores', 'ExecutionTimeMs', 'Speedup', 'EfficiencyPercent', 'TotalCtxSwitches'];
    const rows = history.map((h) => [
      h.id,
      h.workloadName,
      h.config.threadCount,
      h.config.cores,
      h.metrics.executionTimeMs,
      h.metrics.speedup,
      h.metrics.efficiency,
      h.metrics.totalCtxSwitches,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `ThreadLab_Report_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Generate Multi-Page PDF
  const handleExportPDF = () => {
    setExporting(true);
    try {
      const doc = new jsPDF();

      // Title & Cover Info
      doc.setFontSize(18);
      doc.text('ThreadLab Linux: Performance Evaluation Report', 14, 22);

      doc.setFontSize(11);
      doc.setTextColor(100);
      doc.text(`Course: ${author.courseName}`, 14, 30);
      doc.text(`Student: ${author.studentName} (${author.rollNo}) | Guide: ${author.guideName}`, 14, 36);
      doc.text(`Date: ${new Date().toLocaleDateString()} | Platform: Linux Kernel 6.6 NPTL`, 14, 42);

      // Current Run Metrics Summary
      doc.setFontSize(14);
      doc.setTextColor(0);
      doc.text('1. Active Run Summary', 14, 52);

      autoTable(doc, {
        startY: 56,
        head: [['Metric', 'Value']],
        body: [
          ['Evaluated Workload', config.workload.toUpperCase()],
          ['Worker Threads / Virtual Cores', `${config.threadCount} Threads / ${config.cores} Cores`],
          ['Execution Time', `${currentMetrics.executionTimeMs} ms`],
          ['Speedup Factor vs 1T', `${currentMetrics.speedup}x`],
          ['Parallel Efficiency', `${currentMetrics.efficiency}%`],
          ['Total Context Switches', `${currentMetrics.totalCtxSwitches}`],
          ['Throughput Rate', `${currentMetrics.throughput} ops/sec`],
        ],
      });

      // Historical Benchmark Comparison Table
      const finalY = (doc as any).lastAutoTable.finalY || 110;
      doc.setFontSize(14);
      doc.text('2. Historical Scaling Benchmark Sweep', 14, finalY + 12);

      const tableData = history.slice(0, 10).map((h) => [
        h.workloadName,
        `${h.config.threadCount}T / ${h.config.cores}C`,
        `${h.metrics.executionTimeMs} ms`,
        `${h.metrics.speedup}x`,
        `${h.metrics.efficiency}%`,
        h.metrics.totalCtxSwitches,
      ]);

      autoTable(doc, {
        startY: finalY + 16,
        head: [['Workload', 'Config', 'Time', 'Speedup', 'Efficiency', 'Ctx Switches']],
        body: tableData,
      });

      doc.save(`ThreadLab_Technical_Report_${Date.now()}.pdf`);
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-mono bg-primary/10 text-primary border border-primary/20 mb-2">
            <FileText className="w-3.5 h-3.5" />
            <span>Academic Export & Submission Generator</span>
          </div>
          <h1 className="text-3xl font-bold font-heading text-foreground">Report Export</h1>
          <p className="text-xs text-muted-foreground">
            Generate formal multi-page PDF documents, CSV datasets, and printable case study summaries for faculty submission.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button size="sm" variant="outline" onClick={handleExportCSV} className="gap-1.5 text-xs">
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-500" /> Export CSV Data
          </Button>
          <Button size="sm" variant="glow" disabled={exporting} onClick={handleExportPDF} className="gap-1.5 text-xs">
            <Download className="w-3.5 h-3.5 fill-white" />
            {exporting ? 'Generating PDF...' : 'Download PDF Report'}
          </Button>
          <Button size="sm" variant="secondary" onClick={() => window.print()} className="gap-1.5 text-xs">
            <Printer className="w-3.5 h-3.5" /> Print
          </Button>
        </div>
      </div>

      {/* Live A4 Document Preview Card */}
      <Card className="p-8 max-w-4xl mx-auto space-y-8 bg-card border-border/50 shadow-2xl">
        {/* Cover / Header section */}
        <div className="border-b border-border/40 pb-6 space-y-2">
          <div className="text-xs font-mono uppercase text-primary font-bold tracking-wider">
            {author.courseName}
          </div>
          <h2 className="text-2xl font-bold font-heading text-foreground">
            Analysis of Multithreading in Linux: Performance Evaluation of Single-Threaded and Multi-Threaded Applications
          </h2>
          <div className="grid grid-cols-2 text-xs font-mono text-muted-foreground pt-2">
            <div>Student: <strong className="text-foreground">{author.studentName}</strong> ({author.rollNo})</div>
            <div>Advisor: <strong className="text-foreground">{author.guideName}</strong></div>
          </div>
        </div>

        {/* Executive Summary */}
        <div className="space-y-2 text-xs leading-relaxed text-muted-foreground">
          <h3 className="font-heading font-semibold text-sm text-foreground">Executive Summary</h3>
          <p>
            This experimental report evaluates the scalability, speedup, and OS overheads of the Linux Native 
            POSIX Thread Library (NPTL) across 1, 2, 4, and 8 worker threads. Using Amdahl's Law as the theoretical 
            benchmark, the investigation characterizes parallel efficiency retention and identifies involuntary context 
            switching penalties during oversubscription.
          </p>
        </div>

        {/* Live Empirical Results Table */}
        <div className="space-y-3">
          <h3 className="font-heading font-semibold text-sm text-foreground">
            Empirical Results Matrix ({history.length} Recorded Runs)
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-xs font-mono border border-border/40 rounded-xl overflow-hidden">
              <thead className="bg-secondary/60 text-muted-foreground">
                <tr className="text-left">
                  <th className="p-2.5">Workload</th>
                  <th className="p-2.5">Threads / Cores</th>
                  <th className="p-2.5">Exec Time</th>
                  <th className="p-2.5">Speedup</th>
                  <th className="p-2.5">Efficiency</th>
                  <th className="p-2.5">Ctx Switches</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/20">
                {history.slice(0, 6).map((h) => (
                  <tr key={h.id}>
                    <td className="p-2.5 font-bold text-foreground">{h.workloadName}</td>
                    <td className="p-2.5">{h.config.threadCount}T / {h.config.cores}C</td>
                    <td className="p-2.5">{h.metrics.executionTimeMs} ms</td>
                    <td className="p-2.5 text-emerald-500 font-bold">{h.metrics.speedup}×</td>
                    <td className="p-2.5 text-primary font-bold">{h.metrics.efficiency}%</td>
                    <td className="p-2.5 text-amber-500">{h.metrics.totalCtxSwitches}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </Card>
    </div>
  );
};
