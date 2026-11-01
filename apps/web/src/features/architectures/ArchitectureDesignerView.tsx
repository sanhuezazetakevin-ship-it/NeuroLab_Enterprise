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
  Info,
  Sparkles,
  ChevronDown,
  Workflow,
  Sliders,
  MoveUp,
  MoveDown
} from 'lucide-react';
import { LayerConfig, LayerType, NetworkFamily, NetworkTopology, ArchitectureValidationResult } from '../../types';
import { ApiClient } from '../../lib/api';
import { useDemo } from '../../lib/DemoContext';

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

  // Sync when active scenario changes
  useEffect(() => {
    setArchName(activeScenario.architecture.name);
    setFamily(activeScenario.architecture.family);
    setInputFeatures(activeScenario.architecture.config.inputShape[0] || 30);
    setLayers(activeScenario.architecture.config.layers);
  }, [activeScenario]);

  // Recalculate validation whenever layers or family changes
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
      showToast('Plantilla cargada: MLP Feedforward Base', 'info');
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
      showToast('Plantilla cargada: CNN Convolucional 2D', 'info');
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
      showToast('Plantilla cargada: Subred Generadora GAN', 'info');
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
    showToast(`Capa ${type} agregada a la secuencia`, 'info');
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
      showToast(`¡Arquitectura "${archName}" certificada y guardada en servidor!`, 'success');
    }, 600);
  };

  // Memory footprint approximation
  const memoryKB = ((validation.totalParameters * 4) / 1024).toFixed(1);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Header & Preset Buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold uppercase tracking-wider">
            <Cpu className="w-4 h-4" /> Módulo 04 • Diseñador de Arquitecturas
          </div>
          <h1 className="text-2xl font-bold text-white mt-1">Constructor Visual & Validador de Tensores</h1>
          <p className="text-xs text-slate-300 mt-1">
            Diseña topologías para FNN, CNN, RNN y GAN con validación dimensional matemática en el backend FastAPI.
          </p>
        </div>

        <button
          onClick={handleSaveAndValidate}
          disabled={!validation.valid || isSaving}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs transition-all shadow-lg ${
            validation.valid
              ? 'bg-emerald-500 hover:bg-emerald-600 text-slate-950 shadow-emerald-500/20'
              : 'bg-slate-800 text-slate-500 cursor-not-allowed'
          }`}
        >
          <Save className="w-4 h-4" />
          {isSaving ? 'Validando en Servidor...' : 'Guardar y Validar en Backend'}
        </button>
      </div>

      {/* Preset Quick Load Bar */}
      <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 text-slate-300 font-semibold">
          <Sparkles className="w-4 h-4 text-emerald-400" />
          <span>Plantillas Rápidas:</span>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => loadPreset('mlp')}
            className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-medium"
          >
            MLP Feedforward (S11)
          </button>
          <button
            onClick={() => loadPreset('cnn')}
            className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-medium"
          >
            CNN Convolucional (Imágenes)
          </button>
          <button
            onClick={() => loadPreset('lstm')}
            className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-medium"
          >
            LSTM Recurrente (Series)
          </button>
          <button
            onClick={() => loadPreset('gan')}
            className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-medium"
          >
            Generador GAN
          </button>
        </div>
      </div>

      {/* Configuration Inputs */}
      <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-xs font-semibold text-slate-400 mb-1">Nombre de la Arquitectura</label>
          <input
            type="text"
            value={archName}
            onChange={(e) => setArchName(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-400 mb-1">Familia de Red</label>
          <select
            value={family}
            onChange={(e) => setFamily(e.target.value as NetworkFamily)}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500 font-medium"
          >
            <option value="FEEDFORWARD">Feedforward (FNN / Dense)</option>
            <option value="CNN">Convolucional (CNN / 2D)</option>
            <option value="RNN">Recurrente (RNN / LSTM)</option>
            <option value="GAN">Generativa Adversaria (GAN)</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-400 mb-1">Dimensión de Entrada (Input Shape)</label>
          <input
            type="number"
            value={inputFeatures}
            onChange={(e) => setInputFeatures(parseInt(e.target.value) || 1)}
            min="1"
            className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500 font-mono"
          />
        </div>
      </div>

      {/* Visual Flow / Layer Topology Nodes */}
      <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
        <h2 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
          <Workflow className="w-4 h-4 text-emerald-400" /> Flujo Dimensional de Tensores
        </h2>

        {/* Horizontal Node Flowchart */}
        <div className="flex items-center gap-2 overflow-x-auto py-2">
          {/* Input Node */}
          <div className="shrink-0 p-3 rounded-xl bg-slate-950 border border-blue-500/40 text-center min-w-[100px]">
            <span className="text-[10px] text-blue-400 uppercase font-bold">Input Tensor</span>
            <div className="text-xs font-mono font-bold text-white mt-1">
              [{family === 'CNN' ? '128, 128, 1' : inputFeatures}]
            </div>
          </div>

          {layers.map((layer, idx) => (
            <React.Fragment key={layer.id}>
              <ArrowRight className="w-4 h-4 text-slate-600 shrink-0" />
              <div className="shrink-0 p-3 rounded-xl bg-slate-950 border border-slate-800 hover:border-emerald-500/50 text-center min-w-[110px] transition-colors">
                <span className="text-[10px] text-emerald-400 uppercase font-bold">{layer.type}</span>
                <div className="text-xs font-mono font-bold text-white mt-0.5">
                  {layer.units && `${layer.units}u`}
                  {layer.filters && `${layer.filters}f`}
                  {layer.rate && `r=${layer.rate}`}
                </div>
                {layer.activation && (
                  <span className="inline-block mt-1 text-[9px] px-1.5 py-0.2 rounded bg-indigo-500/20 text-indigo-300 font-mono">
                    {layer.activation}
                  </span>
                )}
              </div>
            </React.Fragment>
          ))}

          {/* Output Node */}
          <ArrowRight className="w-4 h-4 text-slate-600 shrink-0" />
          <div className="shrink-0 p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/40 text-center min-w-[100px]">
            <span className="text-[10px] text-emerald-400 uppercase font-bold">Output Shape</span>
            <div className="text-xs font-mono font-bold text-emerald-300 mt-1">
              {JSON.stringify(validation.outputShape)}
            </div>
          </div>
        </div>
      </div>

      {/* Layer Editor & Validation Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Layer Stack Editor */}
        <div className="lg:col-span-2 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <Layers className="w-4 h-4 text-emerald-400" /> Secuencia de Capas ({layers.length})
            </h2>
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-slate-400">Añadir:</span>
              <button
                onClick={() => addLayer('Dense')}
                className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs rounded-lg border border-slate-700 font-medium"
              >
                + Dense
              </button>
              <button
                onClick={() => addLayer('Dropout')}
                className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs rounded-lg border border-slate-700 font-medium"
              >
                + Dropout
              </button>
              <button
                onClick={() => addLayer('BatchNormalization')}
                className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs rounded-lg border border-slate-700 font-medium"
              >
                + BatchNorm
              </button>
            </div>
          </div>

          <div className="space-y-2">
            {layers.map((layer, index) => (
              <div
                key={layer.id}
                className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between gap-4 hover:border-slate-700 transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <div className="flex flex-col gap-0.5">
                    <button
                      onClick={() => moveLayer(index, 'up')}
                      disabled={index === 0}
                      className="p-0.5 text-slate-500 hover:text-white disabled:opacity-30"
                      title="Mover arriba"
                    >
                      <MoveUp className="w-3 h-3" />
                    </button>
                    <button
                      onClick={() => moveLayer(index, 'down')}
                      disabled={index === layers.length - 1}
                      className="p-0.5 text-slate-500 hover:text-white disabled:opacity-30"
                      title="Mover abajo"
                    >
                      <MoveDown className="w-3 h-3" />
                    </button>
                  </div>

                  <div className="w-6 h-6 rounded bg-slate-800 text-slate-400 font-mono text-xs flex items-center justify-center font-bold">
                    {index + 1}
                  </div>

                  <span className="font-mono text-xs font-bold text-white bg-slate-800 px-2 py-0.5 rounded text-emerald-400">
                    {layer.type}
                  </span>
                </div>

                <div className="flex items-center gap-3 text-xs">
                  {layer.type === 'Dense' && (
                    <>
                      <div className="flex items-center gap-1.5">
                        <span className="text-slate-400">Neuronas:</span>
                        <input
                          type="number"
                          value={layer.units || 32}
                          onChange={(e) => updateLayerUnits(layer.id, parseInt(e.target.value) || 1)}
                          className="w-16 bg-slate-950 border border-slate-700 rounded px-2 py-1 text-xs text-white font-mono"
                        />
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-slate-400">Activación:</span>
                        <select
                          value={layer.activation || 'relu'}
                          onChange={(e) => updateLayerActivation(layer.id, e.target.value)}
                          className="bg-slate-950 border border-slate-700 rounded px-2 py-1 text-xs text-white"
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
                    <div className="flex items-center gap-1.5">
                      <span className="text-slate-400">Rate:</span>
                      <input
                        type="number"
                        step="0.05"
                        min="0"
                        max="0.9"
                        value={layer.rate ?? 0.2}
                        onChange={(e) => updateDropoutRate(layer.id, parseFloat(e.target.value) || 0)}
                        className="w-16 bg-slate-950 border border-slate-700 rounded px-2 py-1 text-xs text-white font-mono"
                      />
                    </div>
                  )}

                  <button
                    onClick={() => removeLayer(layer.id)}
                    className="p-1.5 text-slate-500 hover:text-red-400 transition-colors"
                    title="Eliminar capa"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Backend Validation & Parameter Summary */}
        <div className="space-y-4">
          <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 space-y-4">
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-400" /> Resumen Técnico de Compilación
            </h2>

            <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 space-y-2.5 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-400">Estado de Validación:</span>
                {validation.valid ? (
                  <span className="text-emerald-400 font-bold flex items-center gap-1">
                    <CheckCircle className="w-3.5 h-3.5" /> Aprobada para TensorFlow
                  </span>
                ) : (
                  <span className="text-red-400 font-bold flex items-center gap-1">
                    <AlertTriangle className="w-3.5 h-3.5" /> Errores detectados
                  </span>
                )}
              </div>

              <div className="flex justify-between">
                <span className="text-slate-400">Parámetros Totales:</span>
                <span className="font-mono font-bold text-white">
                  {validation.totalParameters.toLocaleString()}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-slate-400">Parámetros Entrenables:</span>
                <span className="font-mono text-emerald-400 font-bold">
                  {validation.trainableParameters.toLocaleString()}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-slate-400">Memoria Estimada de Pesos:</span>
                <span className="font-mono text-indigo-300 font-semibold">{memoryKB} KB</span>
              </div>

              <div className="flex justify-between">
                <span className="text-slate-400">Forma Salida (Keras):</span>
                <span className="font-mono text-amber-300 font-bold">
                  {JSON.stringify(validation.outputShape)}
                </span>
              </div>
            </div>

            {/* Error notifications */}
            {validation.errors.length > 0 && (
              <div className="p-3 rounded-lg bg-red-950/40 border border-red-800/50 text-xs text-red-300 space-y-1">
                <div className="font-bold flex items-center gap-1">
                  <AlertTriangle className="w-3.5 h-3.5" /> Errores dimensionales:
                </div>
                {validation.errors.map((err, i) => (
                  <div key={i}>&bull; {err}</div>
                ))}
              </div>
            )}

            <div className="p-3 rounded-lg bg-slate-950/70 border border-slate-800 text-[11px] text-slate-400 space-y-1">
              <div className="flex items-center gap-1 text-slate-300 font-semibold">
                <Info className="w-3.5 h-3.5 text-emerald-400" /> Regla de Negocio (Sec. 10):
              </div>
              <p>
                La configuración se valida en el backend FastAPI con Pydantic. Al compilar con Keras, el modelo calcula los pesos de cada capa w_ij y sus términos de sesgo b_j.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
