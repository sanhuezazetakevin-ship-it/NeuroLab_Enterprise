import React, { useState } from 'react';
import {
  FileSpreadsheet,
  Download,
  Printer,
  ShieldCheck,
  Check,
  Layers,
  FileCheck2,
  CheckCircle2,
  ExternalLink
} from 'lucide-react';
import { useDemo } from '../../lib/DemoContext';

export const ReportsView: React.FC = () => {
  const { activeScenario, showToast } = useDemo();

  const [includeTopology, setIncludeTopology] = useState(true);
  const [includeMetrics, setIncludeMetrics] = useState(true);
  const [includeAudit, setIncludeAudit] = useState(true);

  const exportCSV = () => {
    const rows = [
      ['Modulo', 'Campo', 'Valor'],
      ['Proyecto', 'Nombre', activeScenario.project.name],
      ['Proyecto', 'Descripcion', activeScenario.project.description],
      ['Arquitectura', 'Familia', activeScenario.architecture.family],
      ['Arquitectura', 'Version', String(activeScenario.architecture.version)],
      ['Dataset', 'Nombre', activeScenario.dataset.name],
      ['Dataset', 'Muestras', String(activeScenario.dataset.metadata.samples)],
      ['Evaluacion', 'Test Accuracy', `${(activeScenario.modelVersion.metricsSummary.accuracy * 100).toFixed(1)}%`],
      ['Evaluacion', 'Test Loss', String(activeScenario.modelVersion.metricsSummary.loss)],
      ['Gobernanza', 'SHA-256 Checksum', activeScenario.modelVersion.checksum],
      ['Gobernanza', 'Estado', activeScenario.modelVersion.status],
    ];

    const csvContent = 'data:text/csv;charset=utf-8,' + rows.map((e) => e.join(',')).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `reporte_${activeScenario.id}_neurolab.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showToast('Reporte CSV generado y descargado correctamente', 'success');
  };

  const exportJSON = () => {
    const data = {
      project: activeScenario.project,
      architecture: activeScenario.architecture,
      dataset: activeScenario.dataset,
      modelVersion: activeScenario.modelVersion,
      generatedAt: new Date().toISOString(),
      certifiedBy: 'NeuroLab Enterprise Engine'
    };

    const jsonBlob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(jsonBlob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `model_card_${activeScenario.id}.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showToast('Ficha técnica JSON exportada exitosamente', 'success');
  };

  const printReport = () => {
    window.print();
  };

  return (
    <div className="space-y-4 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-white/10">
        <div>
          <div className="flex items-center gap-2 text-white/60 text-xs font-semibold uppercase tracking-wider">
            <FileSpreadsheet className="w-4 h-4 text-white/80" /> Módulo 09 • Ficha Técnica & Reportes
          </div>
          <h1 className="text-xl sm:text-2xl font-semibold text-white dark:text-white light:text-zinc-900 mt-1">
            Certificación Formal & Auditoría de Modelos
          </h1>
          <p className="text-xs text-white/50 dark:text-white/50 light:text-zinc-500 mt-0.5">
            Documentación técnica verificable, especificación de capas, resultados de validación y firma criptográfica inmutable.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={exportCSV}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl glass-btn-secondary text-xs font-medium"
          >
            <Download className="w-3.5 h-3.5" /> Exportar CSV
          </button>
          <button
            onClick={exportJSON}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl glass-btn-secondary text-xs font-medium"
          >
            <Download className="w-3.5 h-3.5" /> Exportar JSON
          </button>
          <button
            onClick={printReport}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl glass-btn-primary text-xs font-semibold"
          >
            <Printer className="w-3.5 h-3.5" /> Imprimir / PDF
          </button>
        </div>
      </div>

      {/* Report Section Toggles */}
      <div className="glass-card p-4 rounded-2xl flex flex-wrap items-center gap-5 text-xs text-white/70">
        <span className="font-semibold text-white">Secciones a incluir:</span>
        <label className="flex items-center gap-2 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={includeTopology}
            onChange={(e) => setIncludeTopology(e.target.checked)}
            className="rounded accent-white cursor-pointer"
          />
          <span>Topología de Capas</span>
        </label>
        <label className="flex items-center gap-2 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={includeMetrics}
            onChange={(e) => setIncludeMetrics(e.target.checked)}
            className="rounded accent-white cursor-pointer"
          />
          <span>Métricas de Validación</span>
        </label>
        <label className="flex items-center gap-2 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={includeAudit}
            onChange={(e) => setIncludeAudit(e.target.checked)}
            className="rounded accent-white cursor-pointer"
          />
          <span>Firma Criptográfica SHA-256</span>
        </label>
      </div>

      {/* Printable Sheet */}
      <div className="glass-card p-8 rounded-3xl space-y-6 text-xs text-white/80 print:shadow-none print:border-none print:p-0">
        <div className="border-b border-white/10 pb-5 flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-white/60 font-semibold text-xs tracking-wider mb-1">
              <ShieldCheck className="w-4 h-4 text-white/80" /> NEUROLAB ENTERPRISE &bull; AUDITORÍA SEMANA 11
            </div>
            <h2 className="text-xl font-bold text-white tracking-tight">
              MODEL AUDIT CARD &amp; FICHA TÉCNICA
            </h2>
            <p className="text-white/50 mt-0.5">Certificación oficial para despliegue en ambiente productivo</p>
          </div>
          <div className="sm:text-right">
            <span className="font-mono text-white font-bold px-3 py-1 rounded-full glass-inset border border-white/20">
              ESTADO: {activeScenario.modelVersion.status}
            </span>
            <p className="text-white/40 text-[10px] mt-1.5 font-mono">
              Emisión: {new Date().toLocaleDateString()} | Ref: NL-ENT-S11
            </p>
          </div>
        </div>

        {/* Section 1: Overview */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 rounded-2xl glass-inset border border-white/10">
          <div>
            <span className="text-white/40 text-[10px] uppercase font-bold tracking-wider">Proyecto</span>
            <p className="font-semibold text-white mt-0.5">{activeScenario.project.name}</p>
          </div>
          <div>
            <span className="text-white/40 text-[10px] uppercase font-bold tracking-wider">Familia Arquitectónica</span>
            <p className="font-semibold text-white mt-0.5 font-mono">{activeScenario.architecture.family}</p>
          </div>
          <div>
            <span className="text-white/40 text-[10px] uppercase font-bold tracking-wider">Dataset de Referencia</span>
            <p className="font-semibold text-white mt-0.5 font-mono">{activeScenario.dataset.name}</p>
          </div>
        </div>

        {/* Section 2: Topology */}
        {includeTopology && (
          <div className="space-y-2">
            <span className="text-white/50 text-[10px] uppercase font-bold tracking-wider">
              1. Especificación de la Topología Compilada
            </span>
            <div className="p-4 glass-inset rounded-2xl border border-white/10 font-mono text-[11px] space-y-1.5 text-white/80">
              <div>&bull; Tensor de Entrada: [{activeScenario.architecture.config.inputShape.join(', ')}]</div>
              {activeScenario.architecture.config.layers.map((layer, idx) => (
                <div key={idx} className="text-white/70">
                  &bull; Capa {idx + 1}: <strong className="text-white">{layer.type}</strong>
                  {layer.units && ` (${layer.units} neuronas, activacion: ${layer.activation})`}
                  {layer.filters && ` (filtros: ${layer.filters}, kernel: [${layer.kernelSize?.join('x')}], activacion: ${layer.activation})`}
                  {layer.rate && ` (tasa dropout: ${layer.rate})`}
                </div>
              ))}
              <div className="pt-2 text-white font-semibold border-t border-white/10">
                &bull; Total Parámetros: {activeScenario.architecture.family === 'CNN' ? '1,199,873' : '3,169'} parámetros entrenables
              </div>
            </div>
          </div>
        )}

        {/* Section 3: Evaluation Metrics */}
        {includeMetrics && (
          <div className="space-y-2">
            <span className="text-white/50 text-[10px] uppercase font-bold tracking-wider">
              2. Benchmarks &amp; Resultados Certificados
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
              <div className="p-3.5 glass-inset rounded-2xl border border-white/10">
                <span className="text-white/40 text-[10px] uppercase font-bold tracking-wider">Test Loss</span>
                <p className="font-semibold text-white font-mono text-base mt-1">
                  {activeScenario.modelVersion.metricsSummary.loss.toFixed(3)}
                </p>
              </div>
              <div className="p-3.5 glass-inset rounded-2xl border border-white/10">
                <span className="text-white/40 text-[10px] uppercase font-bold tracking-wider">Test Accuracy</span>
                <p className="font-semibold text-white font-mono text-base mt-1">
                  {(activeScenario.modelVersion.metricsSummary.accuracy * 100).toFixed(1)}%
                </p>
              </div>
              <div className="p-3.5 glass-inset rounded-2xl border border-white/10">
                <span className="text-white/40 text-[10px] uppercase font-bold tracking-wider">Validation Acc</span>
                <p className="font-semibold text-white font-mono text-base mt-1">
                  {(activeScenario.modelVersion.metricsSummary.valAccuracy * 100).toFixed(1)}%
                </p>
              </div>
              <div className="p-3.5 glass-inset rounded-2xl border border-white/10">
                <span className="text-white/40 text-[10px] uppercase font-bold tracking-wider">F1-Score</span>
                <p className="font-semibold text-white font-mono text-base mt-1">
                  {activeScenario.modelVersion.metricsSummary.f1Score || '0.941'}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Section 4: Cryptographic Audit Signature */}
        {includeAudit && (
          <div className="space-y-2 pt-2 border-t border-white/10">
            <span className="text-white/50 text-[10px] uppercase font-bold tracking-wider">
              3. Trazabilidad Inmutable &amp; Integridad Criptográfica
            </span>
            <div className="p-3.5 glass-inset rounded-2xl border border-white/10 font-mono text-[11px] text-white/70 break-all">
              Checksum SHA-256: {activeScenario.modelVersion.checksum}
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between text-[10px] text-white/40 pt-1 gap-1">
              <span>Firmado electrónicamente: lead.engineer@neurolab.enterprise</span>
              <span>Latencia de Inferencia Estimada: 1.8ms / muestra</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
