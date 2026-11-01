import React, { useState } from 'react';
import {
  Database,
  Upload,
  CheckCircle2,
  FileText,
  Sliders,
  Table,
  ShieldCheck,
  Search,
  Filter,
  Info
} from 'lucide-react';
import { useDemo } from '../../lib/DemoContext';

export const DatasetsView: React.FC = () => {
  const { activeScenario, showToast } = useDemo();

  const [trainSplit, setTrainSplit] = useState(70);
  const [valSplit, setValSplit] = useState(15);
  const testSplit = Math.max(0, 100 - trainSplit - valSplit);

  const [showUploadModal, setShowUploadModal] = useState(false);
  const [newDatasetName, setNewDatasetName] = useState('');

  const totalSamples = activeScenario.dataset.metadata.samples;
  const trainSamples = Math.round((totalSamples * trainSplit) / 100);
  const valSamples = Math.round((totalSamples * valSplit) / 100);
  const testSamples = totalSamples - trainSamples - valSamples;

  const handleUploadSubmit = () => {
    if (!newDatasetName) return;
    setShowUploadModal(false);
    showToast(`Dataset "${newDatasetName}" validado y subido a MinIO S3`, 'success');
    setNewDatasetName('');
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold uppercase tracking-wider">
            <Database className="w-4 h-4" /> Módulo 05 • Datasets & Particiones
          </div>
          <h1 className="text-2xl font-bold text-white mt-1">Gobernanza y Preparación de Datos</h1>
          <p className="text-xs text-slate-300 mt-1">
            Almacenamiento seguro en MinIO / S3, metadatos estructurados y particiones deterministas (Train / Val / Test).
          </p>
        </div>

        <button
          onClick={() => setShowUploadModal(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-xs transition-colors shadow-lg shadow-emerald-500/20"
        >
          <Upload className="w-4 h-4" /> Registrar Nuevo Dataset
        </button>
      </div>

      {/* Dataset Details Card & Split Sliders */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Dataset Meta Information */}
        <div className="lg:col-span-2 p-5 rounded-xl bg-slate-900 border border-slate-800 space-y-4">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
                <FileText className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold text-white">{activeScenario.dataset.name}</h3>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-indigo-300 font-mono font-bold">
                    {activeScenario.dataset.version}
                  </span>
                </div>
                <p className="text-xs text-slate-400 font-mono mt-0.5">{activeScenario.dataset.storageKey}</p>
              </div>
            </div>

            <span className="text-xs text-emerald-400 font-semibold flex items-center gap-1 bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/20">
              <CheckCircle2 className="w-3.5 h-3.5" /> Esquema Validado
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs pt-2">
            <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
              <span className="text-slate-500 text-[10px] uppercase font-bold">Muestras Totales</span>
              <div className="text-white font-bold font-mono text-sm mt-0.5">{totalSamples.toLocaleString()}</div>
            </div>
            <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
              <span className="text-slate-500 text-[10px] uppercase font-bold">Columnas / Features</span>
              <div className="text-white font-bold font-mono text-sm mt-0.5">{activeScenario.dataset.metadata.featuresCount}</div>
            </div>
            <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
              <span className="text-slate-500 text-[10px] uppercase font-bold">Variable Objetivo</span>
              <div className="text-emerald-400 font-bold font-mono text-sm mt-0.5 truncate">{activeScenario.dataset.metadata.targetColumn}</div>
            </div>
            <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
              <span className="text-slate-500 text-[10px] uppercase font-bold">Valores Nulos</span>
              <div className="text-indigo-300 font-bold font-mono text-sm mt-0.5">0.00% (Limpio)</div>
            </div>
          </div>
        </div>

        {/* Train/Val/Test Split Configuration */}
        <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 space-y-4">
          <h2 className="text-sm font-bold text-white flex items-center gap-2">
            <Sliders className="w-4 h-4 text-emerald-400" /> Partición de Datos (Split)
          </h2>

          <div className="space-y-3 text-xs">
            <div>
              <div className="flex justify-between text-slate-400 mb-1">
                <span>Entrenamiento (Train):</span>
                <span className="text-emerald-400 font-bold font-mono">{trainSplit}% ({trainSamples.toLocaleString()})</span>
              </div>
              <input
                type="range"
                min="50"
                max="85"
                value={trainSplit}
                onChange={(e) => setTrainSplit(parseInt(e.target.value))}
                className="w-full accent-emerald-500 cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between text-slate-400 mb-1">
                <span>Validación (Val):</span>
                <span className="text-indigo-400 font-bold font-mono">{valSplit}% ({valSamples.toLocaleString()})</span>
              </div>
              <input
                type="range"
                min="5"
                max="25"
                value={valSplit}
                onChange={(e) => setValSplit(parseInt(e.target.value))}
                className="w-full accent-indigo-500 cursor-pointer"
              />
            </div>

            <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 space-y-1.5">
              <div className="flex justify-between text-slate-400">
                <span>Evaluación Final (Test):</span>
                <span className="text-amber-400 font-bold font-mono">{testSplit}% ({testSamples.toLocaleString()})</span>
              </div>
              <p className="text-[10px] text-slate-500">
                División reproducible mediante semilla pseudo-aleatoria constante (<code className="text-slate-400">seed=42</code>).
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Live Data Preview Table */}
      <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-white flex items-center gap-2">
            <Table className="w-4 h-4 text-emerald-400" /> Vista Previa de Filas del Dataset ({activeScenario.dataPreview.rows.length} muestras)
          </h2>
          <span className="text-xs text-slate-400 font-mono">Formato Tabular Estructurado</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400">
                {activeScenario.dataPreview.columns.map((col, idx) => (
                  <th key={idx} className="pb-2 px-3 font-semibold">
                    <div>{col.name}</div>
                    <span className="text-[9px] text-slate-500 uppercase font-normal">{col.type}</span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {activeScenario.dataPreview.rows.map((row, rIdx) => (
                <tr key={rIdx} className="hover:bg-slate-800/30 transition-colors">
                  {activeScenario.dataPreview.columns.map((col, cIdx) => {
                    const val = row[col.name];
                    const isTarget = col.type === 'Target';
                    return (
                      <td key={cIdx} className="py-2.5 px-3">
                        {isTarget ? (
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            val === 1 || val === 'Neumonia'
                              ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                              : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          }`}>
                            {val}
                          </span>
                        ) : (
                          <span className="text-slate-300">{val}</span>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal for Dataset Upload */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 max-w-md w-full space-y-4 shadow-2xl animate-in fade-in zoom-in-95">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Upload className="w-5 h-5 text-emerald-400" /> Registrar Nuevo Dataset
            </h3>
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">Nombre del Archivo o Tabla</label>
              <input
                type="text"
                placeholder="ej. churn_telecom_q4_2026.csv"
                value={newDatasetName}
                onChange={(e) => setNewDatasetName(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">Bucket en Object Storage (MinIO)</label>
              <input
                type="text"
                disabled
                value="s3://neurolab-artifacts/datasets/"
                className="w-full bg-slate-950/60 border border-slate-800 rounded-lg p-2 text-xs text-slate-500 font-mono"
              />
            </div>
            <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-[11px] text-emerald-300">
              ✓ Se validará automáticamente el tamaño máximo (100 MB), codificación UTF-8 y ausencia de ejecutables según Sección 10.
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setShowUploadModal(false)}
                className="px-3 py-1.5 text-xs text-slate-400 hover:text-white"
              >
                Cancelar
              </button>
              <button
                onClick={handleUploadSubmit}
                className="px-4 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-xs rounded-lg transition-colors"
              >
                Subir y Validar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
