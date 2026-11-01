import React, { useState } from 'react';
import {
  Box,
  Download,
  CheckCircle,
  ShieldCheck,
  Tag,
  FileCode,
  Clock,
  Copy,
  Check,
  Sparkles,
  Layers,
  ArrowRight
} from 'lucide-react';
import { ModelVersion, ModelLifecycleStatus } from '../../types';
import { useDemo } from '../../lib/DemoContext';

export const ModelRegistryView: React.FC = () => {
  const { activeScenario, showToast, currentRole } = useDemo();

  const [models, setModels] = useState<ModelVersion[]>([
    activeScenario.modelVersion,
    {
      id: 'model-prior-01',
      projectId: activeScenario.project.id,
      jobId: 'job-prior-01',
      version: 'v0.9.2-beta',
      storageKey: `models/${activeScenario.project.id.slice(0, 8)}/model_weights_b1c2d3.keras`,
      status: 'RETIRED',
      checksum: 'b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2',
      metricsSummary: {
        accuracy: 0.892,
        loss: 0.245,
        valAccuracy: 0.880,
        valLoss: 0.260,
      },
      createdAt: '2026-10-25T11:00:00Z',
    }
  ]);

  const [copiedId, setCopiedId] = useState<string | null>(null);

  const updateStatus = (id: string, newStatus: ModelLifecycleStatus) => {
    // RBAC check: only ADMIN or PROJECT_LEAD can approve
    if (newStatus === 'APPROVED' && !['ADMIN', 'PROJECT_LEAD'].includes(currentRole)) {
      showToast('Permiso denegado: Solo el Administrador o Responsable de Proyecto pueden Aprobar modelos para Producción (RBAC)', 'warning');
      return;
    }

    setModels(models.map((m) => (m.id === id ? { ...m, status: newStatus } : m)));
    showToast(`Estado de versión actualizado a: ${newStatus}`, 'success');
  };

  const copyChecksum = (checksum: string, id: string) => {
    navigator.clipboard.writeText(checksum);
    setCopiedId(id);
    showToast('Hash SHA-256 copiado al portapapeles', 'info');
    setTimeout(() => setCopiedId(null), 2500);
  };

  const handleDownload = (storageKey: string) => {
    showToast(`Iniciando descarga autorizada del artefacto: ${storageKey}`, 'success');
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold uppercase tracking-wider">
            <Box className="w-4 h-4" /> Módulo 08 • Registro de Modelos (Model Registry)
          </div>
          <h1 className="text-2xl font-bold text-white mt-1">Gobernanza de Modelos & Versionado Inmutable</h1>
          <p className="text-xs text-slate-300 mt-1">
            Ciclo de vida (DRAFT &rarr; REVIEWED &rarr; APPROVED &rarr; RETIRED) con integridad criptográfica SHA-256 y trazabilidad de pesos.
          </p>
        </div>
      </div>

      <div className="space-y-4">
        {models.map((model) => (
          <div key={model.id} className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4 shadow-xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-emerald-600/20 to-teal-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                  <Box className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold text-white">{activeScenario.architecture.name}</h3>
                    <span className="font-mono text-xs px-2.5 py-0.5 rounded-full bg-slate-800 text-indigo-300 border border-slate-700 font-bold">
                      {model.version}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 font-mono mt-0.5">{model.storageKey}</p>
                </div>
              </div>

              {/* Status Badge & Workflow selector */}
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5 bg-slate-950 p-1 rounded-xl border border-slate-800">
                  {(['DRAFT', 'REVIEWED', 'APPROVED', 'RETIRED'] as const).map((st) => (
                    <button
                      key={st}
                      onClick={() => updateStatus(model.id, st)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                        model.status === st
                          ? st === 'APPROVED'
                            ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                            : st === 'RETIRED'
                            ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                            : 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      {st}
                    </button>
                  ))}
                </div>

                <button
                  onClick={() => handleDownload(model.storageKey)}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors"
                >
                  <Download className="w-4 h-4 text-emerald-400" /> Descargar (.keras)
                </button>
              </div>
            </div>

            {/* Metrics & Checksum */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-3 border-t border-slate-800 text-xs">
              <div className="space-y-1">
                <span className="text-slate-500 text-[10px] uppercase font-bold flex items-center justify-between">
                  <span>Integridad Criptográfica Inmutable (SHA-256)</span>
                  <button
                    onClick={() => copyChecksum(model.checksum, model.id)}
                    className="text-emerald-400 hover:text-emerald-300 flex items-center gap-1 normal-case font-sans"
                  >
                    {copiedId === model.id ? (
                      <>
                        <Check className="w-3 h-3" /> ¡Copiado!
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3" /> Copiar Hash
                      </>
                    )}
                  </button>
                </span>
                <div className="p-2.5 rounded-xl bg-slate-950 font-mono text-[11px] text-slate-300 break-all border border-slate-800">
                  {model.checksum}
                </div>
              </div>

              <div className="space-y-1">
                <span className="text-slate-500 text-[10px] uppercase font-bold">Métricas Certificadas</span>
                <div className="p-2.5 rounded-xl bg-slate-950 flex items-center justify-between border border-slate-800 font-mono text-xs">
                  <span>Accuracy: <strong className="text-emerald-400">{(model.metricsSummary.accuracy * 100).toFixed(1)}%</strong></span>
                  <span>Loss: <strong className="text-slate-200">{model.metricsSummary.loss}</strong></span>
                  <span>Val Acc: <strong className="text-indigo-400">{(model.metricsSummary.valAccuracy * 100).toFixed(1)}%</strong></span>
                  <span>F1: <strong className="text-amber-300">{model.metricsSummary.f1Score || '0.941'}</strong></span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
