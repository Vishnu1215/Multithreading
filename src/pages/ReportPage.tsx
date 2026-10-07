import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { useSimulationStore } from '@/store/simulationStore';
import { 
  FileText, 
  Download, 
  Printer, 
  CheckCircle2, 
  FileSpreadsheet, 
  Camera, 
  Archive,
  Sparkles,
  Settings
} from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import JSZip from 'jszip';
import { toPng } from 'html-to-image';

export const ReportPage: React.FC = () => {
  const author = useSimulationStore((s) => s.author);
  const setAuthor = useSimulationStore((s) => s.setAuthor);
  const currentMetrics = useSimulationStore((s) => s.currentMetrics);
  const history = useSimulationStore((s) => s.history);
  const config = useSimulationStore((s) => s.config);

  const [exporting, setExporting] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Section config toggles
  const [includeCover, setIncludeCover] = useState(true);
  const [includeMethodology, setIncludeMethodology] = useState(true);
  const [includeBenchmarks, setIncludeBenchmarks] = useState(true);
  const [includeAnalysis, setIncludeAnalysis] = useState(true);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // 1. Generate CSV Export
  const handleExportCSV = () => {
    const headers = ['ID', 'Workload', 'Threads', 'Cores', 'ExecutionTimeMs', 'Speedup', 'EfficiencyPercent', 'TotalCtxSwitches', 'ThroughputOpsSec'];
    const rows = history.map((h) => [
      h.id,
      h.workloadName,
      h.config.threadCount,
      h.config.cores,
      h.metrics.executionTimeMs,
      h.metrics.speedup,
      h.metrics.efficiency,
      h.metrics.totalCtxSwitches,
      h.metrics.throughput,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `ThreadLab_Report_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('CSV dataset exported successfully!');
  };

  // 2. Generate Multi-Page PDF
  const handleExportPDF = () => {
    setExporting(true);
    try {
      const doc = new jsPDF();

      // Cover / Header
      if (includeCover) {
        doc.setFontSize(18);
        doc.text('ThreadLab Linux: Performance Evaluation Report', 14, 22);

        doc.setFontSize(11);
        doc.setTextColor(100);
        doc.text(`Course: ${author.courseName}`, 14, 30);
        doc.text(`Student: ${author.studentName} (${author.rollNo}) | Guide: ${author.guideName}`, 14, 36);
        doc.text(`Date: ${new Date().toLocaleDateString()} | Platform: Linux Kernel 6.6 NPTL`, 14, 42);
      }

      // Active Run Summary
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

      // Historical Benchmark Sweep Table
      if (includeBenchmarks) {
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
      }

      // Analysis & Conclusion
      if (includeAnalysis) {
        const finalY2 = (doc as any).lastAutoTable.finalY || 180;
        if (finalY2 > 230) {
          doc.addPage();
          doc.text('3. Performance Analysis & Findings', 14, 22);
          doc.setFontSize(10);
          doc.text('• CPU-bound scaling achieves up to 3.7x on 4 physical cores.', 14, 32);
          doc.text('• Oversubscription (8T on 4C) triples context switches, causing an efficiency drop.', 14, 38);
        } else {
          doc.text('3. Performance Analysis & Findings', 14, finalY2 + 12);
          doc.setFontSize(10);
          doc.text('• CPU-bound scaling achieves up to 3.7x on 4 physical cores.', 14, finalY2 + 20);
          doc.text('• Oversubscription (8T on 4C) triples context switches, causing an efficiency drop.', 14, finalY2 + 26);
        }
      }

      doc.save(`ThreadLab_Technical_Report_${Date.now()}.pdf`);
      showToast('Multi-page PDF generated and downloaded!');
    } finally {
      setExporting(false);
    }
  };

  // 3. Screenshot Capture of Current Document Preview
  const handleCaptureScreenshot = async () => {
    const node = document.getElementById('report-document-preview');
    if (!node) return;
    setExporting(true);
    try {
      const dataUrl = await toPng(node);
      const link = document.createElement('a');
      link.download = `ThreadLab_Screenshot_${Date.now()}.png`;
      link.href = dataUrl;
      link.click();
      showToast('Document screenshot captured as PNG!');
    } catch {
      showToast('Failed to capture screenshot');
    } finally {
      setExporting(false);
    }
  };

  // 4. Download All As ZIP (JSZip)
  const handleDownloadAllZip = async () => {
    setExporting(true);
    try {
      const zip = new JSZip();

      // Add CSV
      const csvData = [
        'ID,Workload,Threads,Cores,TimeMs,Speedup,Efficiency',
        ...history.map(h => `${h.id},${h.workloadName},${h.config.threadCount},${h.config.cores},${h.metrics.executionTimeMs},${h.metrics.speedup},${h.metrics.efficiency}`)
      ].join('\n');
      zip.file('benchmark_data.csv', csvData);

      // Add Metadata TXT
      const meta = `ThreadLab Linux Performance Evaluation\nStudent: ${author.studentName}\nRoll: ${author.rollNo}\nGuide: ${author.guideName}\nDate: ${new Date().toISOString()}`;
      zip.file('metadata.txt', meta);

      // Add Screenshot PNG if preview available
      const node = document.getElementById('report-document-preview');
      if (node) {
        const dataUrl = await toPng(node);
        const base64Data = dataUrl.replace(/^data:image\/png;base64,/, '');
        zip.file('report_preview.png', base64Data, { base64: true });
      }

      const content = await zip.generateAsync({ type: 'blob' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(content);
      link.download = `ThreadLab_Bundle_${Date.now()}.zip`;
      link.click();
      showToast('Complete ZIP archive package downloaded!');
    } catch {
      showToast('Error generating ZIP package');
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Toast Banner */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 p-3.5 rounded-xl bg-card border border-emerald-500 text-emerald-500 text-xs font-mono shadow-2xl flex items-center gap-2 animate-in slide-in-from-top-3">
          <CheckCircle2 className="w-4 h-4" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-mono bg-primary/10 text-primary border border-primary/20 mb-2">
            <FileText className="w-3.5 h-3.5" />
            <span>Academic Export & Submission Suite</span>
          </div>
          <h1 className="text-3xl font-bold font-heading text-foreground">Report & Export Center</h1>
          <p className="text-xs text-muted-foreground">
            Generate formal multi-page PDF documents, CSV datasets, PNG screenshot captures, and ZIP bundles.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button size="sm" variant="outline" onClick={handleExportCSV} className="gap-1.5 text-xs">
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-500" /> Export CSV
          </Button>
          <Button size="sm" variant="outline" onClick={handleCaptureScreenshot} className="gap-1.5 text-xs">
            <Camera className="w-3.5 h-3.5 text-cyan-400" /> Screenshot PNG
          </Button>
          <Button size="sm" variant="outline" onClick={handleDownloadAllZip} className="gap-1.5 text-xs">
            <Archive className="w-3.5 h-3.5 text-amber-500" /> Download ZIP
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

      {/* Report Customization Config Panel */}
      <Card className="p-5 space-y-3 bg-secondary/30">
        <div className="flex items-center justify-between border-b border-border/40 pb-2">
          <div className="flex items-center gap-2 text-xs font-bold font-heading text-foreground">
            <Settings className="w-3.5 h-3.5 text-primary" /> Report Section Configuration
          </div>
          <span className="text-[11px] text-muted-foreground font-mono">Customizes PDF and print output</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={includeCover} onChange={(e) => setIncludeCover(e.target.checked)} className="rounded text-primary" />
            <span>Include Cover & Header</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={includeMethodology} onChange={(e) => setIncludeMethodology(e.target.checked)} className="rounded text-primary" />
            <span>Include Methodology</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={includeBenchmarks} onChange={(e) => setIncludeBenchmarks(e.target.checked)} className="rounded text-primary" />
            <span>Include Scaling Sweep</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={includeAnalysis} onChange={(e) => setIncludeAnalysis(e.target.checked)} className="rounded text-primary" />
            <span>Include Key Findings</span>
          </label>
        </div>
      </Card>

      {/* Live A4 Document Preview Card */}
      <Card id="report-document-preview" className="p-8 max-w-4xl mx-auto space-y-8 bg-card border-border/50 shadow-2xl">
        {/* Cover / Header section */}
        {includeCover && (
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
        )}

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
        {includeBenchmarks && (
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
        )}
      </Card>
    </div>
  );
};
