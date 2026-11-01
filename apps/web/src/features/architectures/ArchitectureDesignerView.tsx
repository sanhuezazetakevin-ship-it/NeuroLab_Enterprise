import React, { useState, useEffect } from 'react';
import {
  Cpu,
  Plus,
  Trash2,
  CheckCircle,
  AlertTriangle,
  Save,
  Layers,
  ArrowRight,
  Workflow,
  Maximize2,
  MoveUp,
  MoveDown
} from 'lucide-react';
import { LayerConfig, LayerType, NetworkFamily, NetworkTopology, ArchitectureValidationResult } from '../../types';
import { ApiClient } from '../../lib/api';
import { useDemo } from '../../lib/DemoContext';
import { EnlargedChartModal } from '../../components/common/EnlargedChartModal';

export const ArchitectureDesignerView: React.FC = () => {
  const { activeScenario, showToast } = useDemo();

  const [archName, setArchName] = useState(activeScenario.architecture.name);
  const [family, setFamily] = useState<NetworkFamily>(activeScenario.architecture.family);
  const [inputFeatures, setInputFeatures] = useState(activeScenario.architecture.config.inputShape[0] || 30);
  const [layers, setLayers] = useState<LayerConfig[]>(activeScenario.architecture.config.layers);

  const [validation, setValidation] = useState<ArchitectureValidationResult>({
    valid: true,
    totalParameters: 3169,
    trainableParameters: 3169,
    outputShape: [null, 1],
    warnings: [],
    errors: [],
  });

  const [isSaving, setIsSaving] = useState(false);
  const [enlargedTopologyOpen, setEnlargedTopologyOpen] = useState(false);

  useEffect(() => {
    setArchName(activeScenario.architecture.name);
    setFamily(activeScenario.architecture.family);
    setInputFeatures(activeScenario.architecture.config.inputShape[0] || 30);
    setLayers(activeScenario.architecture.config.layers);
  }, [activeScenario]);

  useEffect(() => {
    const topology: NetworkTopology = {
      inputShape: family === 'CNN' ? [128, 128, 1] : [inputFeatures],
      layers: layers,
    };

    ApiClient.validateArchitecture(topology, family).then((res) => {
      setValidation(res);
    });
  }, [layers, family, inputFeatures]);

  const loadPreset = (presetType: 'mlp' | 'cnn' | 'lstm' | 'gan') => {
    if (presetType === 'mlp') {
      setArchName('MLP Feedforward Profunda (Semana 11)');
      setFamily('FEEDFORWARD');
      setInputFeatures(30);
      setLayers([
        { id: '1', type: 'Dense', units: 64, activation: 'relu' },
        { id: '2', type: 'Dropout', rate: 0.2 },
        { id: '3', type: 'Dense', units: 32, activation: 'relu' },
        { id: '4', type: 'Dense', units: 1, activation: 'sigmoid' },
      ]);
      showToast('Plantilla cargada: MLP Feedforward', 'info');
    } else if (presetType === 'cnn') {
      setArchName('ChestNet CNN Clasificación 2D');
      setFamily('CNN');
      setInputFeatures(128);
      setLayers([
        { id: '1', type: 'Conv2D', filters: 32, kernelSize: [3, 3], activation: 'relu' },
        { id: '2', type: 'MaxPooling2D', poolSize: [2, 2] },
        { id: '3', type: 'Conv2D', filters: 64, kernelSize: [3, 3], activation: 'relu' },
        { id: '4', type: 'MaxPooling2D', poolSize: [2, 2] },
        { id: '5', type: 'Flatten' },
        { id: '6', type: 'Dense', units: 64, activation: 'relu' },
        { id: '7', type: 'Dense', units: 1, activation: 'sigmoid' },
      ]);
      showToast('Plantilla cargada: CNN Convolucional', 'info');
    } else if (presetType === 'lstm') {
      setArchName('GridLoad LSTM Time Series');
      setFamily('RNN');
      setInputFeatures(24);
      setLayers([
        { id: '1', type: 'LSTM', units: 64, returnSequences: false },
        { id: '2', type: 'Dropout', rate: 0.2 },
        { id: '3', type: 'Dense', units: 32, activation: 'relu' },
        { id: '4', type: 'Dense', units: 1, activation: 'linear' },
      ]);
      showToast('Plantilla cargada: Red Recurrente LSTM', 'info');
    } else if (presetType === 'gan') {
      setArchName('Generador Adversario GAN');
      setFamily('GAN');
      setInputFeatures(100);
      setLayers([
        { id: '1', type: 'Dense', units: 128, activation: 'relu' },
        { id: '2', type: 'BatchNormalization' },
        { id: '3', type: 'Dense', units: 256, activation: 'relu' },
        { id: '4', type: 'BatchNormalization' },
        { id: '5', type: 'Dense', units: 784, activation: 'tanh' },
      ]);
      showToast('Plantilla cargada: Generador GAN', 'info');
    }
  };

  const addLayer = (type: LayerType) => {
    const newId = (layers.length + 1).toString();
    const newLayer: LayerConfig = {
      id: newId,
      type: type,
      units: type === 'Dense' ? 32 : undefined,
      activation: type === 'Dense' ? 'relu' : undefined,
      rate: type === 'Dropout' ? 0.2 : undefined,
      filters: type === 'Conv2D' ? 32 : undefined,
      kernelSize: type === 'Conv2D' ? [3, 3] : undefined,
      poolSize: type === 'MaxPooling2D' ? [2, 2] : undefined,
    };
    setLayers([...layers, newLayer]);
    showToast(`Capa ${type} añadida`, 'info');
  };

  const removeLayer = (id: string) => {
    setLayers(layers.filter((l) => l.id !== id));
    showToast('Capa eliminada', 'warning');
  };

  const moveLayer = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= layers.length) return;
    const newLayers = [...layers];
    const temp = newLayers[index];
    newLayers[index] = newLayers[targetIndex];
    newLayers[targetIndex] = temp;
    setLayers(newLayers);
  };

  const updateLayerUnits = (id: string, units: number) => {
    setLayers(layers.map((l) => (l.id === id ? { ...l, units: Math.max(1, units) } : l)));
  };

  const updateLayerActivation = (id: string, activation: any) => {
    setLayers(layers.map((l) => (l.id === id ? { ...l, activation } : l)));
  };

  const updateDropoutRate = (id: string, rate: number) => {
    setLayers(layers.map((l) => (l.id === id ? { ...l, rate } : l)));
  };

  const handleSaveAndValidate = () => {
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      showToast(`Arquitectura validada y guardada en backend`, 'success');
    }, 500);
  };

  const memoryKB = ((validation.totalParameters * 4) / 1024).toFixed(1);

  // Helper to render horizontal topology
  const renderTopologyFlow = (isLarge = false) => {
    return (
      <div className="flex items-center gap-2 overflow-x-auto py-2">
        <div className="shrink-0 p-2.5 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-center min-w-[90px]">
          <span className="text-[9px] text-slate-500 uppercase font-bold">Input</span>
          <div className="text-xs font-mono font-bold text-slate-800 dark:text-white mt-0.5">
            [{family === 'CNN' ? '128,128,1' : inputFeatures}]
          </div>
        </div>

        {layers.map((layer, idx) => (
          <React.Fragment key={layer.id}>
            <ArrowRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <div className="shrink-0 p-2.5 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-center min-w-[95px]">
              <span className="text-[9px] text-blue-600 dark:text-blue-400 uppercase font-bold">{layer.type}</span>
              <div className="text-xs font-mono font-bold text-slate-800 dark:text-white">
                {layer.units && `${layer.units}u`}
                {layer.filters && `${layer.filters}f`}
                {layer.rate && `r=${layer.rate}`}
              </div>
              {layer.activation && (
                <span className="inline-block text-[8px] px-1 rounded bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-mono">
                  {layer.activation}
                </span>
              )}
            </div>
          </React.Fragment>
        ))}

        <ArrowRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
        <div className="shrink-0 p-2.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/40 text-center min-w-[90px]">
          <span className="text-[9px] text-emerald-600 dark:text-emerald-400 uppercase font-bold">Output</span>
          <div className="text-xs font-mono font-bold text-emerald-700 dark:text-emerald-300 mt-0.5">
            {JSON.stringify(validation.outputShape)}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-5 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 text-xs font-semibold uppercase tracking-wider">
            <Cpu className="w-4 h-4" /> Módulo 04 • Diseñador de Arquitecturas
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white mt-1">
            Topologías & Validación Dimensional
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Configuración de capas y verificación matemática de tensores en servidor FastAPI antes de compilar con TensorFlow.
          </p>
        </div>

        <button
          onClick={handleSaveAndValidate}
          disabled={!validation.valid || isSaving}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold text-xs transition-colors shadow-xs ${
            validation.valid
              ? 'bg-blue-600 hover:bg-blue-700 text-white'
              : 'bg-slate-200 dark:bg-slate-800 text-slate-400 cursor-not-allowed'
          }`}
        >
          <Save className="w-4 h-4" />
          {isSaving ? 'Validando...' : 'Guardar y Validar'}
        </button>
      </div>

      {/* Preset Quick Load Strip */}
      <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-2 text-xs shadow-xs">
        <span className="text-slate-500 dark:text-slate-400 font-medium">Plantillas de Referencia:</span>
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            onClick={() => loadPreset('mlp')}
            className="px-2.5 py-1 rounded bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-medium border border-slate-200 dark:border-slate-700"
          >
            MLP Feedforward (S11)
          </button>
          <button
            onClick={() => loadPreset('cnn')}
            className="px-2.5 py-1 rounded bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-medium border border-slate-200 dark:border-slate-700"
          >
            CNN Convolucional
          </button>
          <button
            onClick={() => loadPreset('lstm')}
            className="px-2.5 py-1 rounded bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-medium border border-slate-200 dark:border-slate-700"
          >
            LSTM Recurrente
          </button>
          <button
            onClick={() => loadPreset('gan')}
            className="px-2.5 py-1 rounded bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-medium border border-slate-200 dark:border-slate-700"
          >
            Generador GAN
          </button>
        </div>
      </div>

      {/* Configuration Controls */}
      <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 grid grid-cols-1 md:grid-cols-3 gap-3 shadow-xs text-xs">
        <div>
          <label className="block text-slate-500 dark:text-slate-400 font-semibold mb-1">Nombre</label>
          <input
            type="text"
            value={archName}
            onChange={(e) => setArchName(e.target.value)}
            className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded px-2.5 py-1 text-slate-800 dark:text-white"
          />
        </div>

        <div>
          <label className="block text-slate-500 dark:text-slate-400 font-semibold mb-1">Familia</label>
          <select
            value={family}
            onChange={(e) => setFamily(e.target.value as NetworkFamily)}
            className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded px-2.5 py-1 text-slate-800 dark:text-white"
          >
            <option value="FEEDFORWARD">Feedforward (FNN)</option>
            <option value="CNN">Convolucional (CNN)</option>
            <option value="RNN">Recurrente (RNN / LSTM)</option>
            <option value="GAN">Generativa (GAN)</option>
          </select>
        </div>

        <div>
          <label className="block text-slate-500 dark:text-slate-400 font-semibold mb-1">Input Shape</label>
          <input
            type="number"
            value={inputFeatures}
            onChange={(e) => setInputFeatures(parseInt(e.target.value) || 1)}
            min="1"
            className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded px-2.5 py-1 text-slate-800 dark:text-white font-mono"
          />
        </div>
      </div>

      {/* Main Grid: Left Layer Stack (2 cols) + Right Compact Previews (1 col) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* LEFT COLUMN: Layers Editor */}
        <div className="lg:col-span-2 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5 uppercase tracking-wider">
              <Layers className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" /> Secuencia de Capas ({layers.length})
            </h2>
            <div className="flex items-center gap-1 text-xs">
              <button
                onClick={() => addLayer('Dense')}
                className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded border border-slate-200 dark:border-slate-700"
              >
                + Dense
              </button>
              <button
                onClick={() => addLayer('Dropout')}
                className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded border border-slate-200 dark:border-slate-700"
              >
                + Dropout
              </button>
              <button
                onClick={() => addLayer('BatchNormalization')}
                className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded border border-slate-200 dark:border-slate-700"
              >
                + BatchNorm
              </button>
            </div>
          </div>

          <div className="space-y-2">
            {layers.map((layer, index) => (
              <div
                key={layer.id}
                className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3 shadow-xs hover:border-slate-300 dark:hover:border-slate-700 transition-colors text-xs"
              >
                <div className="flex items-center gap-2">
                  <div className="flex flex-col gap-0.5">
                    <button
                      onClick={() => moveLayer(index, 'up')}
                      disabled={index === 0}
                      className="p-0.5 text-slate-400 hover:text-slate-700 dark:hover:text-white disabled:opacity-20"
                    >
                      <MoveUp className="w-3 h-3" />
                    </button>
                    <button
                      onClick={() => moveLayer(index, 'down')}
                      disabled={index === layers.length - 1}
                      className="p-0.5 text-slate-400 hover:text-slate-700 dark:hover:text-white disabled:opacity-20"
                    >
                      <MoveDown className="w-3 h-3" />
                    </button>
                  </div>

                  <span className="w-5 h-5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500 font-mono text-[11px] flex items-center justify-center font-bold">
                    {index + 1}
                  </span>

                  <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-blue-600 dark:text-blue-400">
                    {layer.type}
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  {layer.type === 'Dense' && (
                    <>
                      <div className="flex items-center gap-1">
                        <span className="text-slate-500">Unidades:</span>
                        <input
                          type="number"
                          value={layer.units || 32}
                          onChange={(e) => updateLayerUnits(layer.id, parseInt(e.target.value) || 1)}
                          className="w-14 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded px-1.5 py-0.5 text-xs text-slate-800 dark:text-white font-mono"
                        />
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="text-slate-500">Activación:</span>
                        <select
                          value={layer.activation || 'relu'}
                          onChange={(e) => updateLayerActivation(layer.id, e.target.value)}
                          className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded px-1.5 py-0.5 text-xs text-slate-800 dark:text-white"
                        >
                          <option value="relu">ReLU</option>
                          <option value="sigmoid">Sigmoid</option>
                          <option value="tanh">Tanh</option>
                          <option value="softmax">Softmax</option>
                          <option value="linear">Linear</option>
                        </select>
                      </div>
                    </>
                  )}

                  {layer.type === 'Dropout' && (
                    <div className="flex items-center gap-1">
                      <span className="text-slate-500">Rate:</span>
                      <input
                        type="number"
                        step="0.05"
                        min="0"
                        max="0.9"
                        value={layer.rate ?? 0.2}
                        onChange={(e) => updateDropoutRate(layer.id, parseFloat(e.target.value) || 0)}
                        className="w-16 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded px-1.5 py-0.5 text-xs text-slate-800 dark:text-white font-mono"
                      />
                    </div>
                  )}

                  <button
                    onClick={() => removeLayer(layer.id)}
                    className="p-1 text-slate-400 hover:text-red-500 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT DOCK: Compact Previews with Click-to-Enlarge */}
        <div className="space-y-4">
          <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 flex items-center justify-between px-1">
            <span>Visualización (Miniatura)</span>
            <span className="text-[10px] text-blue-600 dark:text-blue-400">Clic para ampliar</span>
          </div>

          {/* Compact Card 1: Flow Diagram Preview */}
          <div
            onClick={() => setEnlargedTopologyOpen(true)}
            className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-blue-400 dark:hover:border-blue-500/50 cursor-pointer transition-all shadow-xs group"
          >
            <div className="flex items-center justify-between text-xs mb-1.5">
              <span className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1">
                <Workflow className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" /> Grafo de Topología
              </span>
              <Maximize2 className="w-3 h-3 text-slate-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors" />
            </div>

            <div className="p-1 bg-slate-50 dark:bg-slate-950 rounded-lg border border-slate-100 dark:border-slate-800/80 overflow-hidden">
              {renderTopologyFlow(false)}
            </div>
            <div className="flex justify-between items-center text-[10px] text-slate-400 mt-1.5 px-0.5">
              <span>{layers.length} capas encadenadas</span>
              <span className="text-blue-600 dark:text-blue-400 font-medium">Ampliar &rarr;</span>
            </div>
          </div>

          {/* Technical Summary Card */}
          <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-2.5 text-xs">
            <span className="font-semibold text-slate-800 dark:text-slate-200 block border-b border-slate-100 dark:border-slate-800 pb-1.5">
              Resumen Técnico Keras
            </span>

            <div className="flex justify-between">
              <span className="text-slate-500">Parámetros Totales:</span>
              <span className="font-mono font-bold text-slate-800 dark:text-white">
                {validation.totalParameters.toLocaleString()}
              </span>
            </div>

            <div className="flex justify-between">
              <span className="text-slate-500">Parámetros Entrenables:</span>
              <span className="font-mono font-bold text-blue-600 dark:text-blue-400">
                {validation.trainableParameters.toLocaleString()}
              </span>
            </div>

            <div className="flex justify-between">
              <span className="text-slate-500">Memoria de Pesos:</span>
              <span className="font-mono text-slate-700 dark:text-slate-300">{memoryKB} KB</span>
            </div>

            <div className="flex justify-between">
              <span className="text-slate-500">Salida del Grafo:</span>
              <span className="font-mono text-emerald-600 dark:text-emerald-400 font-bold">
                {JSON.stringify(validation.outputShape)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ENLARGED TOPOLOGY MODAL */}
      <EnlargedChartModal
        isOpen={enlargedTopologyOpen}
        onClose={() => setEnlargedTopologyOpen(false)}
        title={`Grafo de Topología Neuronal: ${archName}`}
        subtitle="Flujo completo de transformación de tensores verificado dimensionalmente"
        badge={family}
      >
        <div className="space-y-4">
          <div className="p-6 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800">
            {renderTopologyFlow(true)}
          </div>

          <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-400 space-y-1">
            <div>&bull; Total Parámetros: <strong>{validation.totalParameters.toLocaleString()}</strong> ({validation.trainableParameters.toLocaleString()} entrenables)</div>
            <div>&bull; Memoria aproximada de almacenamiento: <strong>{memoryKB} KB</strong></div>
            <div>&bull; Tensor de salida: <strong>{JSON.stringify(validation.outputShape)}</strong></div>
          </div>
        </div>
      </EnlargedChartModal>
    </div>
  );
};
