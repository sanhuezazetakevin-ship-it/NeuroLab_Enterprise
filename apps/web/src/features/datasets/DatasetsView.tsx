import React, { useState } from 'react';
import {
  Database,
  Upload,
  CheckCircle2,
  FileText,
  Sliders,
  Table,
  Maximize2
} from 'lucide-react';
import { useDemo } from '../../lib/DemoContext';
import { EnlargedChartModal } from '../../components/common/EnlargedChartModal';

export const DatasetsView: React.FC = () => {
  const { activeScenario, showToast } = useDemo();

  const [trainSplit, setTrainSplit] = useState(70);
  const [valSplit, setValSplit] = useState(15);
  const testSplit = Math.max(0, 100 - trainSplit - valSplit);

  const [showUploadModal, setShowUploadModal] = useState(false);
  const [newDatasetName, setNewDatasetName] = useState('');
  const [enlargedTableOpen, setEnlargedTableOpen] = useState(false);

  const totalSamples = activeScenario.dataset.metadata.samples;
  const trainSamples = Math.round((totalSamples * trainSplit) / 100);
  const valSamples = Math.round((totalSamples * valSplit) / 100);
  const testSamples = totalSamples - trainSamples - valSamples;

  const handleUploadSubmit = () => {
    if (!newDatasetName) return;
    setShowUploadModal(false);
    showToast(`Dataset "${newDatasetName}" registrado exitosamente`, 'success');
    setNewDatasetName('');
  };

  const renderTableRows = () => (
    <table className="w-full text-left text-xs font-mono">
      <thead>
        <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500 font-sans">
          {activeScenario.dataPreview.columns.map((col, idx) => (
            <th key={idx} className="pb-2 px-3 font-semibold">
              <div>{col.name}</div>
              <span className="text-[9px] text-slate-400 uppercase font-normal">{col.type}</span>
            </th>
          ))}
        </tr>
      </thead>
      <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
        {activeScenario.dataPreview.rows.map((row, rIdx) => (
          <tr key={rIdx} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
            {activeScenario.dataPreview.columns.map((col, cIdx) => {
              const val = row[col.name];
              const isTarget = col.type === 'Target';
              return (
                <td key={cIdx} className="py-2.5 px-3">
                  {isTarget ? (
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      val === 1 || val === 'Neumonia'
                        ? 'bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-500/20'
                        : 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20'
                    }`}>
                      {val}
                    </span>
                  ) : (
                    <span className="text-slate-700 dark:text-slate-300">{val}</span>
                  )}
                </td>
              );
            })}
          </tr>
        ))}
      </tbody>
    </table>
  );

  return (
    <div className="space-y-5 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 text-xs font-semibold uppercase tracking-wider">
            <Database className="w-4 h-4" /> Módulo 05 • Datasets & Particiones
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white mt-1">
            Gestión y Partición de Datos
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Metadatos estructurados, almacenamiento en Object Storage y separación determinista Train/Val/Test.
          </p>
        </div>

        <button
          onClick={() => setShowUploadModal(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs transition-colors shadow-xs"
        >
          <Upload className="w-4 h-4" /> Registrar Dataset
        </button>
      </div>

      {/* Main Grid: Left Details & Data Table (2 cols) + Right Compact Splits (1 col) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* LEFT COLUMN: Metadata & Table Preview */}
        <div className="lg:col-span-2 space-y-4">
          {/* Metadata Card */}
          <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-lg bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">{activeScenario.dataset.name}</h3>
                    <span className="text-[10px] px-2 py-0.2 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-mono">
                      {activeScenario.dataset.version}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 font-mono mt-0.5">{activeScenario.dataset.storageKey}</p>
                </div>
              </div>

              <span className="text-xs text-emerald-700 dark:text-emerald-400 font-medium flex items-center gap-1 bg-emerald-50 dark:bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-200 dark:border-emerald-500/20">
                <CheckCircle2 className="w-3.5 h-3.5" /> Validado
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs pt-1">
              <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800">
                <span className="text-slate-400 text-[10px] uppercase font-bold">Total Muestras</span>
                <div className="text-slate-800 dark:text-white font-bold font-mono text-xs mt-0.5">{totalSamples.toLocaleString()}</div>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800">
                <span className="text-slate-400 text-[10px] uppercase font-bold">Columnas</span>
                <div className="text-slate-800 dark:text-white font-bold font-mono text-xs mt-0.5">{activeScenario.dataset.metadata.featuresCount}</div>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800">
                <span className="text-slate-400 text-[10px] uppercase font-bold">Target</span>
                <div className="text-blue-600 dark:text-blue-400 font-bold font-mono text-xs mt-0.5 truncate">{activeScenario.dataset.metadata.targetColumn}</div>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800">
                <span className="text-slate-400 text-[10px] uppercase font-bold">Nulos</span>
                <div className="text-slate-700 dark:text-slate-300 font-bold font-mono text-xs mt-0.5">0.00%</div>
              </div>
            </div>
          </div>

          {/* Table Preview */}
          <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5 uppercase tracking-wider">
                <Table className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" /> Muestras del Dataset
              </h2>
              <button
                onClick={() => setEnlargedTableOpen(true)}
                className="text-xs text-blue-600 dark:text-blue-400 hover:underline font-semibold flex items-center gap-1"
              >
                <span>Ver tabla completa</span>
                <Maximize2 className="w-3 h-3" />
              </button>
            </div>

            <div className="overflow-x-auto">
              {renderTableRows()}
            </div>
          </div>
        </div>

        {/* RIGHT DOCK: Partitions Configuration */}
        <div className="space-y-4">
          <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 px-1">
            Partición de Muestras (Split)
          </div>

          <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3.5 text-xs">
            <span className="font-semibold text-slate-800 dark:text-slate-200 block border-b border-slate-100 dark:border-slate-800 pb-2">
              Proporciones del Conjunto
            </span>

            <div>
              <div className="flex justify-between text-slate-600 dark:text-slate-400 mb-1">
                <span>Entrenamiento (Train):</span>
                <span className="text-blue-600 dark:text-blue-400 font-bold font-mono">{trainSplit}% ({trainSamples.toLocaleString()})</span>
              </div>
              <input
                type="range"
                min="50"
                max="85"
                value={trainSplit}
                onChange={(e) => setTrainSplit(parseInt(e.target.value))}
                className="w-full accent-blue-600 cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between text-slate-600 dark:text-slate-400 mb-1">
                <span>Validación (Val):</span>
                <span className="text-amber-600 dark:text-amber-400 font-bold font-mono">{valSplit}% ({valSamples.toLocaleString()})</span>
              </div>
              <input
                type="range"
                min="5"
                max="25"
                value={valSplit}
                onChange={(e) => setValSplit(parseInt(e.target.value))}
                className="w-full accent-amber-500 cursor-pointer"
              />
            </div>

            <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 space-y-1">
              <div className="flex justify-between text-slate-500">
                <span>Prueba (Test):</span>
                <span className="text-slate-800 dark:text-white font-bold font-mono">{testSplit}% ({testSamples.toLocaleString()})</span>
              </div>
              <p className="text-[10px] text-slate-400">
                Semilla pseudo-aleatoria constante: <code className="font-mono">seed=42</code>.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ENLARGED TABLE MODAL */}
      <EnlargedChartModal
        isOpen={enlargedTableOpen}
        onClose={() => setEnlargedTableOpen(false)}
        title={`Inspección del Dataset: ${activeScenario.dataset.name}`}
        subtitle={`Total: ${totalSamples.toLocaleString()} registros con ${activeScenario.dataset.metadata.featuresCount} características`}
        badge={activeScenario.dataset.version}
      >
        <div className="space-y-3">
          <div className="overflow-x-auto p-2 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800">
            {renderTableRows()}
          </div>
        </div>
      </EnlargedChartModal>

      {/* Modal for Dataset Upload */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-5 max-w-md w-full space-y-3 shadow-2xl animate-in fade-in zoom-in-95">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
              <Upload className="w-4 h-4 text-blue-600 dark:text-blue-400" /> Registrar Dataset
            </h3>
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Nombre</label>
              <input
                type="text"
                placeholder="ej. churn_tabular_2026.csv"
                value={newDatasetName}
                onChange={(e) => setNewDatasetName(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded p-2 text-xs text-slate-800 dark:text-white focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Destino Storage</label>
              <input
                type="text"
                disabled
                value="s3://neurolab-artifacts/datasets/"
                className="w-full bg-slate-100 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded p-2 text-xs text-slate-500 font-mono"
              />
            </div>
            <div className="flex justify-end gap-2 pt-1">
              <button
                onClick={() => setShowUploadModal(false)}
                className="px-3 py-1.5 text-xs text-slate-500 hover:text-slate-800 dark:hover:text-white"
              >
                Cancelar
              </button>
              <button
                onClick={handleUploadSubmit}
                className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded transition-colors"
              >
                Subir
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
