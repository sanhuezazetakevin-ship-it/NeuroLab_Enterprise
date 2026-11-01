import React, { useState } from 'react';
import {
  FileSpreadsheet,
  Download,
  Printer,
  CheckCircle,
  FileText,
  ShieldCheck,
  Check,
  Layers,
  Sparkles
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
      certifiedBy: 'NeuroLab Enterprise ML Engine'
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
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold uppercase tracking-wider">
            <FileSpreadsheet className="w-4 h-4" /> Módulo 09 • Ficha Técnica & Reportes
          </div>
          <h1 className="text-2xl font-bold text-white mt-1">Generador de Informes Ejecutivos & Auditoría</h1>
          <p className="text-xs text-slate-300 mt-1">
            Certificación formal del modelo, especificación de capas, resultados de validación y firma criptográfica.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={exportCSV}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors"
          >
            <Download className="w-4 h-4 text-emerald-400" /> Exportar CSV
          </button>
          <button
            onClick={exportJSON}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors"
          >
            <Download className="w-4 h-4 text-indigo-400" /> Exportar JSON
          </button>
          <button
            onClick={printReport}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 text-xs font-bold transition-all shadow-lg shadow-emerald-500/20"
          >
            <Printer className="w-4 h-4" /> Imprimir / PDF
          </button>
        </div>
      </div>

      {/* Report Section Toggles */}
      <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 flex flex-wrap items-center gap-4 text-xs">
        <span className="font-semibold text-slate-300">Incluir en el informe:</span>
        <label className="flex items-center gap-1.5 cursor-pointer">
          <input
            type="checkbox"
            checked={includeTopology}
            onChange={(e) => setIncludeTopology(e.target.checked)}
            className="accent-emerald-500"
          />
          <span className="text-slate-300">Topología de Capas</span>
        </label>
        <label className="flex items-center gap-1.5 cursor-pointer">
          <input
            type="checkbox"
            checked={includeMetrics}
            onChange={(e) => setIncludeMetrics(e.target.checked)}
            className="accent-emerald-500"
          />
          <span className="text-slate-300">Métricas & Matriz de Confusión</span>
        </label>
        <label className="flex items-center gap-1.5 cursor-pointer">
          <input
            type="checkbox"
            checked={includeAudit}
            onChange={(e) => setIncludeAudit(e.target.checked)}
            className="accent-emerald-500"
          />
          <span className="text-slate-300">Firma Criptográfica y Auditoría</span>
        </label>
      </div>

      {/* Printable Sheet */}
      <div className="p-8 rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl space-y-6 text-xs text-slate-200">
        <div className="border-b border-slate-800 pb-5 flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs uppercase tracking-wider mb-1">
              <ShieldCheck className="w-4 h-4" /> NeuroLab Enterprise • Semana 11
            </div>
            <h2 className="text-xl font-bold text-white uppercase tracking-wider">
              MODEL AUDIT CARD & FICHA TÉCNICA
            </h2>
            <p className="text-slate-400 mt-0.5">Certificación oficial para despliegue en ambiente productivo</p>
          </div>
          <div className="sm:text-right">
            <span className="font-mono text-emerald-400 font-bold px-2.5 py-1 rounded bg-emerald-500/10 border border-emerald-500/30">
              ESTADO: {activeScenario.modelVersion.status}
            </span>
            <p className="text-slate-500 text-[10px] mt-1.5 font-mono">Emisión: {new Date().toLocaleDateString()} | Ref: NL-ENT-S11</p>
          </div>
        </div>

        {/* Section 1: Overview */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 rounded-xl bg-slate-950 border border-slate-800">
          <div>
            <span className="text-slate-400 text-[10px] uppercase font-bold">Proyecto</span>
            <p className="font-semibold text-white mt-0.5">{activeScenario.project.name}</p>
          </div>
          <div>
            <span className="text-slate-400 text-[10px] uppercase font-bold">Familia Arquitectónica</span>
            <p className="font-semibold text-white mt-0.5 font-mono">{activeScenario.architecture.family}</p>
          </div>
          <div>
            <span className="text-slate-400 text-[10px] uppercase font-bold">Dataset de Referencia</span>
            <p className="font-semibold text-white mt-0.5 font-mono">{activeScenario.dataset.name}</p>
          </div>
        </div>

        {/* Section 2: Topology */}
        {includeTopology && (
          <div className="space-y-2">
            <span className="text-slate-400 text-[10px] uppercase font-bold">1. Especificación de la Topología Compilada</span>
            <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 font-mono text-[11px] space-y-1.5">
              <div>&bull; Tensor de Entrada: [{activeScenario.architecture.config.inputShape.join(', ')}]</div>
              {activeScenario.architecture.config.layers.map((layer, idx) => (
                <div key={idx} className="text-slate-300">
                  &bull; Capa {idx + 1}: <strong className="text-emerald-400">{layer.type}</strong>
                  {layer.units && ` (${layer.units} neuronas, activacion: ${layer.activation})`}
                  {layer.filters && ` (filtros: ${layer.filters}, kernel: [${layer.kernelSize?.join('x')}], activacion: ${layer.activation})`}
                  {layer.rate && ` (tasa dropout: ${layer.rate})`}
                </div>
              ))}
              <div className="pt-2 text-emerald-400 font-bold border-t border-slate-800/80">
                &bull; Total Parámetros: {activeScenario.architecture.family === 'CNN' ? '1,199,873' : '3,169'} parámetros entrenables
              </div>
            </div>
          </div>
        )}

        {/* Section 3: Evaluation Metrics */}
        {includeMetrics && (
          <div className="space-y-2">
            <span className="text-slate-400 text-[10px] uppercase font-bold">2. Benchmarks & Resultados Certificados</span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                <span className="text-slate-500 text-[10px] uppercase font-bold">Test Loss</span>
                <p className="font-bold text-white font-mono text-base mt-0.5">{activeScenario.modelVersion.metricsSummary.loss.toFixed(3)}</p>
              </div>
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                <span className="text-slate-500 text-[10px] uppercase font-bold">Test Accuracy</span>
                <p className="font-bold text-emerald-400 font-mono text-base mt-0.5">{(activeScenario.modelVersion.metricsSummary.accuracy * 100).toFixed(1)}%</p>
              </div>
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                <span className="text-slate-500 text-[10px] uppercase font-bold">Validation Acc</span>
                <p className="font-bold text-indigo-400 font-mono text-base mt-0.5">{(activeScenario.modelVersion.metricsSummary.valAccuracy * 100).toFixed(1)}%</p>
              </div>
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                <span className="text-slate-500 text-[10px] uppercase font-bold">F1-Score</span>
                <p className="font-bold text-amber-400 font-mono text-base mt-0.5">{activeScenario.modelVersion.metricsSummary.f1Score || '0.941'}</p>
              </div>
            </div>
          </div>
        )}

        {/* Section 4: Cryptographic Audit Signature */}
        {includeAudit && (
          <div className="space-y-2 pt-2 border-t border-slate-800">
            <span className="text-slate-400 text-[10px] uppercase font-bold">3. Trazabilidad Inmutable & Integridad SHA-256</span>
            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 font-mono text-[11px] text-slate-300 break-all">
              Checksum: {activeScenario.modelVersion.checksum}
            </div>
            <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1">
              <span>Firmado electrónicamente por: lead.engineer@neurolab.enterprise</span>
              <span>Validación de Inferencia: 1.8ms / muestra</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
