import React, { useState } from 'react';
import {
  Box,
  Download,
  Copy,
  Check
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
    if (newStatus === 'APPROVED' && !['ADMIN', 'PROJECT_LEAD'].includes(currentRole)) {
      showToast('Permiso denegado: Solo Administrador o Responsable de Proyecto pueden Aprobar versiones (RBAC)', 'warning');
      return;
    }

    setModels(models.map((m) => (m.id === id ? { ...m, status: newStatus } : m)));
    showToast(`Estado de versión: ${newStatus}`, 'success');
  };

  const copyChecksum = (checksum: string, id: string) => {
    navigator.clipboard.writeText(checksum);
    setCopiedId(id);
    showToast('Hash SHA-256 copiado', 'info');
    setTimeout(() => setCopiedId(null), 2500);
  };

  const handleDownload = (storageKey: string) => {
    showToast(`Descarga autorizada: ${storageKey}`, 'success');
  };

  return (
    <div className="space-y-5 animate-in fade-in duration-200">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 text-xs font-semibold uppercase tracking-wider">
            <Box className="w-4 h-4" /> Módulo 08 • Registro de Modelos (Model Registry)
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white mt-1">
            Gobernanza de Modelos & Versionado Inmutable
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Ciclo de vida (DRAFT &rarr; REVIEWED &rarr; APPROVED &rarr; RETIRED) con integridad criptográfica SHA-256.
          </p>
        </div>
      </div>

      <div className="space-y-3.5">
        {models.map((model) => (
          <div key={model.id} className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold">
                  <Box className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">{activeScenario.architecture.name}</h3>
                    <span className="font-mono text-xs px-2 py-0.2 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 font-semibold">
                      {model.version}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 font-mono mt-0.5">{model.storageKey}</p>
                </div>
              </div>

              {/* Status Badge & Workflow selector */}
              <div className="flex items-center gap-2.5">
                <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-950 p-1 rounded-lg border border-slate-200 dark:border-slate-800 text-xs font-semibold">
                  {(['DRAFT', 'REVIEWED', 'APPROVED', 'RETIRED'] as const).map((st) => (
                    <button
                      key={st}
                      onClick={() => updateStatus(model.id, st)}
                      className={`px-2 py-0.5 rounded transition-all ${
                        model.status === st
                          ? st === 'APPROVED'
                            ? 'bg-emerald-600 text-white shadow-xs'
                            : st === 'RETIRED'
                            ? 'bg-red-600 text-white shadow-xs'
                            : 'bg-blue-600 text-white shadow-xs'
                          : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                      }`}
                    >
                      {st}
                    </button>
                  ))}
                </div>

                <button
                  onClick={() => handleDownload(model.storageKey)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold border border-slate-200 dark:border-slate-700 transition-colors"
                >
                  <Download className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" /> Descargar (.keras)
                </button>
              </div>
            </div>

            {/* Metrics & Checksum */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2.5 border-t border-slate-100 dark:border-slate-800 text-xs">
              <div className="space-y-1">
                <div className="text-slate-500 text-[10px] uppercase font-bold flex items-center justify-between">
                  <span>Integridad SHA-256</span>
                  <button
                    onClick={() => copyChecksum(model.checksum, model.id)}
                    className="text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 normal-case font-sans"
                  >
                    {copiedId === model.id ? (
                      <>
                        <Check className="w-3 h-3" /> Copiado
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3" /> Copiar Hash
                      </>
                    )}
                  </button>
                </div>
                <div className="p-2 rounded bg-slate-50 dark:bg-slate-950 font-mono text-[11px] text-slate-700 dark:text-slate-300 break-all border border-slate-200 dark:border-slate-800">
                  {model.checksum}
                </div>
              </div>

              <div className="space-y-1">
                <span className="text-slate-500 text-[10px] uppercase font-bold">Métricas Aprobadas</span>
                <div className="p-2 rounded bg-slate-50 dark:bg-slate-950 flex items-center justify-between border border-slate-200 dark:border-slate-800 font-mono text-xs">
                  <span>Acc: <strong className="text-emerald-600 dark:text-emerald-400">{(model.metricsSummary.accuracy * 100).toFixed(1)}%</strong></span>
                  <span>Loss: <strong className="text-slate-700 dark:text-slate-300">{model.metricsSummary.loss}</strong></span>
                  <span>Val Acc: <strong className="text-blue-600 dark:text-blue-400">{(model.metricsSummary.valAccuracy * 100).toFixed(1)}%</strong></span>
                  <span>F1: <strong className="text-amber-600 dark:text-amber-400">{model.metricsSummary.f1Score || '0.941'}</strong></span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
