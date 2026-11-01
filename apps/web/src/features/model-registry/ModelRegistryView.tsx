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
    <div className="space-y-4 animate-in fade-in duration-200">
      <div className="pb-2 border-b border-white/10">
        <div className="flex items-center gap-2 text-white/60 text-xs font-semibold uppercase tracking-wider">
          <Box className="w-4 h-4 text-white/80" /> Módulo 08 • Registro de Modelos (Model Registry)
        </div>
        <h1 className="text-xl sm:text-2xl font-semibold text-white dark:text-white light:text-zinc-900 mt-1">
          Gobernanza de Modelos & Versionado Inmutable
        </h1>
        <p className="text-xs text-white/50 dark:text-white/50 light:text-zinc-500 mt-0.5">
          Ciclo de vida (DRAFT &rarr; REVIEWED &rarr; APPROVED &rarr; RETIRED) con integridad criptográfica SHA-256.
        </p>
      </div>

      <div className="space-y-3.5">
        {models.map((model) => (
          <div key={model.id} className="glass-card p-5 rounded-2xl space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl glass-inset text-white flex items-center justify-center font-bold border border-white/10">
                  <Box className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-semibold text-white dark:text-white light:text-zinc-900">{activeScenario.architecture.name}</h3>
                    <span className="font-mono text-xs px-2.5 py-0.5 rounded-full glass-inset text-white/80 border border-white/15">
                      {model.version}
                    </span>
                  </div>
                  <p className="text-xs text-white/40 font-mono mt-0.5">{model.storageKey}</p>
                </div>
              </div>

              {/* Status Badge & Workflow selector */}
              <div className="flex flex-wrap items-center gap-2">
                <div className="flex items-center gap-1 glass-inset p-1 rounded-xl border border-white/10 text-xs font-medium">
                  {(['DRAFT', 'REVIEWED', 'APPROVED', 'RETIRED'] as const).map((st) => (
                    <button
                      key={st}
                      onClick={() => updateStatus(model.id, st)}
                      className={`px-2.5 py-1 rounded-lg transition-all ${
                        model.status === st
                          ? 'bg-white text-zinc-950 font-semibold shadow-glass-sm'
                          : 'text-white/50 hover:text-white'
                      }`}
                    >
                      {st}
                    </button>
                  ))}
                </div>

                <button
                  onClick={() => handleDownload(model.storageKey)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl glass-btn-secondary text-xs font-medium"
                >
                  <Download className="w-3.5 h-3.5" /> Descargar (.keras)
                </button>
              </div>
            </div>

            {/* Checksum row */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 rounded-xl glass-inset border border-white/10 text-xs">
              <div className="flex items-center gap-2 overflow-hidden">
                <span className="text-[10px] uppercase font-bold text-white/40 tracking-wider">SHA-256</span>
                <code className="font-mono text-[11px] text-white/80 truncate">{model.checksum}</code>
              </div>
              <button
                onClick={() => copyChecksum(model.checksum, model.id)}
                className="flex items-center gap-1 text-[11px] text-white/70 hover:text-white shrink-0 self-end sm:self-auto font-medium"
              >
                {copiedId === model.id ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" /> Copiado
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" /> Copiar Hash
                  </>
                )}
              </button>
            </div>

            {/* Metrics pills */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="p-2.5 glass-inset rounded-xl">
                <span className="text-white/40 text-[10px] uppercase font-bold">Accuracy</span>
                <p className="font-mono font-semibold text-white mt-0.5">
                  {(model.metricsSummary.accuracy * 100).toFixed(1)}%
                </p>
              </div>
              <div className="p-2.5 glass-inset rounded-xl">
                <span className="text-white/40 text-[10px] uppercase font-bold">Loss</span>
                <p className="font-mono font-semibold text-white mt-0.5">
                  {model.metricsSummary.loss.toFixed(4)}
                </p>
              </div>
              <div className="p-2.5 glass-inset rounded-xl">
                <span className="text-white/40 text-[10px] uppercase font-bold">Val Accuracy</span>
                <p className="font-mono font-semibold text-white/80 mt-0.5">
                  {model.metricsSummary.valAccuracy ? `${(model.metricsSummary.valAccuracy * 100).toFixed(1)}%` : '-'}
                </p>
              </div>
              <div className="p-2.5 glass-inset rounded-xl">
                <span className="text-white/40 text-[10px] uppercase font-bold">Registro</span>
                <p className="font-mono text-white/60 text-[11px] mt-0.5">
                  {new Date(model.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
