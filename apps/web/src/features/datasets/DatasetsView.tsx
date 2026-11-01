import React, { useState } from 'react';
import {
  Database,
  Upload,
  CheckCircle2,
  FileText,
  Sliders,
  Table,
  Maximize2,
  X
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
        <tr className="border-b border-black/10 dark:border-white/10 text-zinc-500 dark:text-white/40 font-sans">
          {activeScenario.dataPreview.columns.map((col, idx) => (
            <th key={idx} className="pb-2.5 px-3 font-medium">
              <div>{col.name}</div>
              <span className="text-[9px] text-zinc-400 dark:text-white/30 uppercase font-normal">{col.type}</span>
            </th>
          ))}
        </tr>
      </thead>
      <tbody className="divide-y divide-black/5 dark:divide-white/5">
        {activeScenario.dataPreview.rows.map((row, rIdx) => (
          <tr key={rIdx} className="hover:bg-black/[0.03] dark:hover:bg-white/[0.04] transition-colors">
            {activeScenario.dataPreview.columns.map((col, cIdx) => {
              const val = row[col.name];
              const isTarget = col.type === 'Target';
              return (
                <td key={cIdx} className="py-3 px-3">
                  {isTarget ? (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold glass-inset text-zinc-900 dark:text-white border border-black/15 dark:border-white/15">
                      {val}
                    </span>
                  ) : (
                    <span className="text-zinc-700 dark:text-white/80">{val}</span>
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
    <div className="space-y-4 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-black/10 dark:border-white/10">
        <div>
          <div className="flex items-center gap-2 text-zinc-600 dark:text-white/60 text-xs font-semibold uppercase tracking-wider">
            <Database className="w-4 h-4 text-zinc-700 dark:text-white/80" /> Módulo 05 • Datasets & Particiones
          </div>
          <h1 className="text-xl sm:text-2xl font-semibold text-zinc-900 dark:text-white mt-1">
            Gestión y Partición de Datos
          </h1>
          <p className="text-xs text-zinc-500 dark:text-white/50 mt-0.5">
            Metadatos estructurados, almacenamiento en Object Storage y separación determinista Train/Val/Test.
          </p>
        </div>

        <button
          onClick={() => setShowUploadModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl glass-btn-primary text-xs font-semibold"
        >
          <Upload className="w-4 h-4" /> Registrar Dataset
        </button>
      </div>

      {/* Main Grid: Left Details & Data Table (2 cols) + Right Compact Splits (1 col) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* LEFT COLUMN: Metadata & Table Preview */}
        <div className="lg:col-span-2 space-y-4">
          {/* Metadata Card */}
          <div className="glass-card p-5 rounded-2xl space-y-3">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl glass-inset text-zinc-700 dark:text-white/80 border border-black/10 dark:border-white/10">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-semibold text-zinc-900 dark:text-white">{activeScenario.dataset.name}</h3>
                    <span className="text-[10px] px-2 py-0.5 rounded-full glass-inset text-zinc-700 dark:text-white/70 font-mono">
                      {activeScenario.dataset.version}
                    </span>
                  </div>
                  <p className="text-[11px] text-zinc-500 dark:text-white/40 font-mono mt-0.5">{activeScenario.dataset.storageKey}</p>
                </div>
              </div>

              <span className="text-[10px] px-2.5 py-0.5 rounded-full glass-inset text-zinc-700 dark:text-white/80 font-mono border border-black/15 dark:border-white/15">
                CSV
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 text-xs border-t border-black/10 dark:border-white/10">
              <div>
                <span className="text-zinc-500 dark:text-white/40 text-[10px] uppercase font-bold tracking-wider">Muestras Totales</span>
                <p className="font-semibold text-zinc-900 dark:text-white font-mono mt-0.5">{totalSamples.toLocaleString()}</p>
              </div>
              <div>
                <span className="text-zinc-500 dark:text-white/40 text-[10px] uppercase font-bold tracking-wider">Features</span>
                <p className="font-semibold text-zinc-900 dark:text-white font-mono mt-0.5">{activeScenario.dataset.metadata.featuresCount} variables</p>
              </div>
              <div>
                <span className="text-zinc-500 dark:text-white/40 text-[10px] uppercase font-bold tracking-wider">Tamaño</span>
                <p className="font-semibold text-zinc-900 dark:text-white font-mono mt-0.5">12.4 MB</p>
              </div>
              <div>
                <span className="text-zinc-500 dark:text-white/40 text-[10px] uppercase font-bold tracking-wider">Target Column</span>
                <p className="font-semibold text-zinc-900 dark:text-white font-mono mt-0.5">{activeScenario.dataset.metadata.targetColumn}</p>
              </div>
            </div>
          </div>

          {/* Data Preview Table */}
          <div className="glass-card p-5 rounded-2xl space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-zinc-900 dark:text-white/90 flex items-center gap-1.5 uppercase tracking-wider">
                <Table className="w-4 h-4 text-zinc-600 dark:text-white/60" /> Muestra de Datos (Head 5 filas)
              </span>
              <button
                onClick={() => setEnlargedTableOpen(true)}
                className="text-xs text-zinc-600 dark:text-white/70 hover:text-zinc-900 dark:hover:text-white font-medium flex items-center gap-1 transition-colors"
              >
                <span>Inspeccionar</span>
                <Maximize2 className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="overflow-x-auto glass-inset rounded-xl p-2 border border-black/10 dark:border-white/10">
              {renderTableRows()}
            </div>
          </div>
        </div>

        {/* RIGHT DOCK: Compact Split Sliders (1/3 width) */}
        <div className="space-y-3.5">
          <div className="text-xs font-medium text-zinc-500 dark:text-white/50 flex items-center justify-between px-1">
            <span>Partición Determinista (Dock)</span>
            <span className="text-[10px] text-zinc-600 dark:text-white/70">100% total</span>
          </div>

          <div className="glass-card p-5 rounded-2xl space-y-4 text-xs">
            <div className="flex items-center justify-between">
              <span className="font-medium text-zinc-900 dark:text-white/90 flex items-center gap-1.5">
                <Sliders className="w-4 h-4 text-zinc-600 dark:text-white/70" /> Split de Datos
              </span>
              <span className="font-mono text-[11px] text-zinc-700 dark:text-white/80 font-medium">
                {trainSplit} / {valSplit} / {testSplit}
              </span>
            </div>

            {/* Visual Partition Stack */}
            <div className="h-2.5 rounded-full glass-inset overflow-hidden flex border border-black/10 dark:border-white/10">
              <div style={{ width: `${trainSplit}%` }} className="bg-zinc-800 dark:bg-white" title={`Train: ${trainSplit}%`} />
              <div style={{ width: `${valSplit}%` }} className="bg-zinc-500 dark:bg-white/60" title={`Validation: ${valSplit}%`} />
              <div style={{ width: `${testSplit}%` }} className="bg-zinc-300 dark:bg-white/30" title={`Test: ${testSplit}%`} />
            </div>

            {/* Slider 1: Train */}
            <div>
              <div className="flex justify-between text-zinc-600 dark:text-white/60 mb-1">
                <span>Train:</span>
                <span className="font-mono text-zinc-900 dark:text-white font-medium">{trainSplit}% ({trainSamples.toLocaleString()})</span>
              </div>
              <input
                type="range"
                min="50"
                max="85"
                value={trainSplit}
                onChange={(e) => setTrainSplit(parseInt(e.target.value))}
                className="w-full accent-zinc-800 dark:accent-white cursor-pointer"
              />
            </div>

            {/* Slider 2: Val */}
            <div>
              <div className="flex justify-between text-zinc-600 dark:text-white/60 mb-1">
                <span>Validation:</span>
                <span className="font-mono text-zinc-700 dark:text-white/80 font-medium">{valSplit}% ({valSamples.toLocaleString()})</span>
              </div>
              <input
                type="range"
                min="5"
                max="30"
                value={valSplit}
                onChange={(e) => setValSplit(parseInt(e.target.value))}
                className="w-full accent-zinc-800 dark:accent-white cursor-pointer"
              />
            </div>

            {/* Test info */}
            <div className="p-3 glass-inset rounded-xl border border-black/10 dark:border-white/10 flex justify-between items-center text-zinc-700 dark:text-white/70">
              <span>Test (Ciego):</span>
              <span className="font-mono font-medium text-zinc-900 dark:text-white">{testSplit}% ({testSamples.toLocaleString()} filas)</span>
            </div>
          </div>
        </div>
      </div>

      {/* ENLARGED TABLE MODAL */}
      <EnlargedChartModal
        isOpen={enlargedTableOpen}
        onClose={() => setEnlargedTableOpen(false)}
        title={`Inspección del Dataset: ${activeScenario.dataset.name}`}
        subtitle="Vista tabular de variables independientes y vector objetivo (ground truth)"
        badge={`${totalSamples.toLocaleString()} Muestras`}
      >
        <div className="space-y-4">
          <div className="glass-inset rounded-2xl p-4 overflow-x-auto border border-black/10 dark:border-white/10">
            {renderTableRows()}
          </div>
          <p className="text-xs text-zinc-500 dark:text-white/50">
            Los datos han sido normalizados y parseados directamente desde el MinIO Object Storage de NeuroLab.
          </p>
        </div>
      </EnlargedChartModal>

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="glass-panel border border-black/15 dark:border-white/15 rounded-3xl p-6 max-w-md w-full space-y-4 shadow-glass animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-semibold text-zinc-900 dark:text-white">Registrar Nuevo Dataset</h3>
              <button onClick={() => setShowUploadModal(false)} className="text-zinc-400 dark:text-white/40 hover:text-zinc-900 dark:hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-600 dark:text-white/60 mb-1.5">Nombre del Dataset</label>
              <input
                type="text"
                placeholder="ej. churn_telecom_2026.csv"
                value={newDatasetName}
                onChange={(e) => setNewDatasetName(e.target.value)}
                className="w-full glass-input rounded-xl px-3 py-2 text-xs"
              />
            </div>

            <div className="border-2 border-dashed border-black/20 dark:border-white/20 rounded-2xl p-6 text-center text-xs text-zinc-500 dark:text-white/50 space-y-2 hover:border-black/40 dark:hover:border-white/40 transition-colors cursor-pointer">
              <Upload className="w-6 h-6 mx-auto text-zinc-600 dark:text-white/60" />
              <p>Arrastra tu archivo CSV o haz clic para explorar</p>
              <span className="text-[10px] text-zinc-400 dark:text-white/40 font-mono">Formatos soportados: CSV, Parquet, NPY</span>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setShowUploadModal(false)}
                className="px-3.5 py-2 text-xs text-zinc-500 dark:text-white/50 hover:text-zinc-900 dark:hover:text-white transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleUploadSubmit}
                className="px-4 py-2 glass-btn-primary text-xs font-semibold rounded-xl"
              >
                Subir & Registrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
