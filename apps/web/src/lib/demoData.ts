// ====================================================================
// NEUROLAB ENTERPRISE - DEMO DATA & SCENARIOS PRESETS
// ====================================================================

import { Project, Architecture, Dataset, TrainingJob, ModelVersion, AuditEvent, UserRole } from '../types';

export interface DemoScenario {
  id: string;
  title: string;
  subtitle: string;
  category: 'Fintech' | 'Salud' | 'Energía' | 'GenAI';
  project: Project;
  architecture: Architecture;
  dataset: Dataset;
  initialJob: TrainingJob;
  modelVersion: ModelVersion;
  dataPreview: {
    columns: { name: string; type: string }[];
    rows: Record<string, string | number>[];
  };
}

export const DEMO_SCENARIOS: Record<string, DemoScenario> = {
  fintech: {
    id: 'fintech',
    title: 'Fintech: Detección de Fraude Transaccional',
    subtitle: 'Red Neuronal Feedforward Profunda (MLP) para transacciones bancarias',
    category: 'Fintech',
    project: {
      id: '11111111-1111-1111-1111-111111111111',
      name: 'Detección de Fraude Transaccional (FNN)',
      description: 'Clasificación de riesgo de fraude bancario en tiempo real sobre transacciones electrónicas de alta concurrencia mediante un Perceptrón Multicapa (MLP).',
      ownerId: 'c138d879-112e-4b44-b0db-6e1d283626fa',
      status: 'ACTIVE',
      createdAt: '2026-10-20T08:00:00Z',
      updatedAt: '2026-11-01T10:00:00Z',
      architecturesCount: 3,
      datasetsCount: 2,
      jobsCount: 6
    },
    architecture: {
      id: 'arch-fintech-01',
      projectId: '11111111-1111-1111-1111-111111111111',
      name: 'MLP Fraud Classifier v1 (Semana 11)',
      family: 'FEEDFORWARD',
      config: {
        inputShape: [30],
        layers: [
          { id: '1', type: 'Dense', units: 64, activation: 'relu' },
          { id: '2', type: 'Dropout', rate: 0.2 },
          { id: '3', type: 'Dense', units: 32, activation: 'relu' },
          { id: '4', type: 'Dense', units: 1, activation: 'sigmoid' }
        ]
      },
      version: 1,
      createdAt: '2026-10-22T14:30:00Z'
    },
    dataset: {
      id: 'ds-fintech-01',
      projectId: '11111111-1111-1111-1111-111111111111',
      name: 'creditcard_transactions_v2.csv',
      version: 'v2.1',
      storageKey: 'datasets/fintech/creditcard_transactions_v2.csv',
      metadata: {
        samples: 284807,
        featuresCount: 30,
        targetColumn: 'is_fraud (0 o 1)',
        trainSplit: 0.70,
        valSplit: 0.15,
        testSplit: 0.15
      },
      createdAt: '2026-10-21T09:15:00Z'
    },
    initialJob: {
      id: 'job-fintech-01',
      projectId: '11111111-1111-1111-1111-111111111111',
      architectureId: 'arch-fintech-01',
      datasetId: 'ds-fintech-01',
      status: 'COMPLETED',
      progress: 100,
      hyperparameters: {
        epochs: 25,
        batchSize: 64,
        optimizer: 'adam',
        learningRate: 0.001,
        loss: 'binary_crossentropy',
        metrics: ['accuracy', 'precision', 'recall']
      },
      startedAt: '2026-10-31T15:00:00Z',
      endedAt: '2026-10-31T15:18:22Z',
      createdAt: '2026-10-31T14:59:00Z',
      metricsHistory: [
        { epoch: 1, loss: 0.612, accuracy: 0.71, valLoss: 0.589, valAccuracy: 0.74 },
        { epoch: 5, loss: 0.432, accuracy: 0.82, valLoss: 0.418, valAccuracy: 0.81 },
        { epoch: 10, loss: 0.315, accuracy: 0.88, valLoss: 0.329, valAccuracy: 0.87 },
        { epoch: 15, loss: 0.228, accuracy: 0.92, valLoss: 0.241, valAccuracy: 0.90 },
        { epoch: 20, loss: 0.174, accuracy: 0.94, valLoss: 0.198, valAccuracy: 0.93 },
        { epoch: 25, loss: 0.138, accuracy: 0.958, valLoss: 0.162, valAccuracy: 0.948 }
      ]
    },
    modelVersion: {
      id: 'model-fintech-01',
      projectId: '11111111-1111-1111-1111-111111111111',
      jobId: 'job-fintech-01',
      version: 'v1.0.0-prod',
      storageKey: 'models/fintech/mlp_fraud_classifier_v1.0.0.keras',
      status: 'APPROVED',
      checksum: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
      metricsSummary: {
        accuracy: 0.948,
        loss: 0.162,
        valAccuracy: 0.948,
        valLoss: 0.162,
        f1Score: 0.941
      },
      createdAt: '2026-10-31T15:30:00Z'
    },
    dataPreview: {
      columns: [
        { name: 'Time_Sec', type: 'Numeric' },
        { name: 'Amount_USD', type: 'Numeric' },
        { name: 'V1_PCA', type: 'Float' },
        { name: 'V2_PCA', type: 'Float' },
        { name: 'Device_Trust', type: 'Score' },
        { name: 'Geo_Distance_Km', type: 'Float' },
        { name: 'is_fraud', type: 'Target' }
      ],
      rows: [
        { Time_Sec: 42, Amount_USD: 149.50, V1_PCA: -1.3598, V2_PCA: -0.0727, Device_Trust: 0.98, Geo_Distance_Km: 1.2, is_fraud: 0 },
        { Time_Sec: 108, Amount_USD: 2.69, V1_PCA: 1.1918, V2_PCA: 0.2661, Device_Trust: 0.95, Geo_Distance_Km: 0.4, is_fraud: 0 },
        { Time_Sec: 1840, Amount_USD: 4500.00, V1_PCA: -4.8921, V2_PCA: 3.8211, Device_Trust: 0.12, Geo_Distance_Km: 842.1, is_fraud: 1 },
        { Time_Sec: 2100, Amount_USD: 25.00, V1_PCA: -0.4219, V2_PCA: 0.8122, Device_Trust: 0.89, Geo_Distance_Km: 4.5, is_fraud: 0 },
        { Time_Sec: 3410, Amount_USD: 2890.30, V1_PCA: -3.1290, V2_PCA: 2.7812, Device_Trust: 0.21, Geo_Distance_Km: 1250.0, is_fraud: 1 }
      ]
    }
  },

  salud: {
    id: 'salud',
    title: 'Salud: Detección de Neumonía en Rayos X',
    subtitle: 'Red Neuronal Convolucional (CNN) para diagnóstico por imágenes',
    category: 'Salud',
    project: {
      id: '22222222-2222-2222-2222-222222222222',
      name: 'Diagnóstico Asistido por Imágenes (CNN)',
      description: 'Clasificación automatizada de radiografías de tórax en dos clases (Normal vs Neumonía) utilizando convoluciones espaciales y pooling.',
      ownerId: 'c138d879-112e-4b44-b0db-6e1d283626fa',
      status: 'ACTIVE',
      createdAt: '2026-10-25T11:00:00Z',
      updatedAt: '2026-11-01T11:30:00Z',
      architecturesCount: 2,
      datasetsCount: 1,
      jobsCount: 3
    },
    architecture: {
      id: 'arch-salud-01',
      projectId: '22222222-2222-2222-2222-222222222222',
      name: 'ChestNet Conv2D v2',
      family: 'CNN',
      config: {
        inputShape: [128, 128, 1],
        layers: [
          { id: '1', type: 'Conv2D', filters: 32, kernelSize: [3, 3], activation: 'relu' },
          { id: '2', type: 'MaxPooling2D', poolSize: [2, 2] },
          { id: '3', type: 'Conv2D', filters: 64, kernelSize: [3, 3], activation: 'relu' },
          { id: '4', type: 'MaxPooling2D', poolSize: [2, 2] },
          { id: '5', type: 'Flatten' },
          { id: '6', type: 'Dense', units: 64, activation: 'relu' },
          { id: '7', type: 'Dense', units: 1, activation: 'sigmoid' }
        ]
      },
      version: 2,
      createdAt: '2026-10-26T16:00:00Z'
    },
    dataset: {
      id: 'ds-salud-01',
      projectId: '22222222-2222-2222-2222-222222222222',
      name: 'chest_xray_medical_images.tar.gz',
      version: 'v1.0',
      storageKey: 'datasets/salud/chest_xray_128x128.tar.gz',
      metadata: {
        samples: 5856,
        featuresCount: 16384,
        targetColumn: 'condition (Normal / Neumonia)',
        trainSplit: 0.75,
        valSplit: 0.15,
        testSplit: 0.10
      },
      createdAt: '2026-10-25T12:00:00Z'
    },
    initialJob: {
      id: 'job-salud-01',
      projectId: '22222222-2222-2222-2222-222222222222',
      architectureId: 'arch-salud-01',
      datasetId: 'ds-salud-01',
      status: 'COMPLETED',
      progress: 100,
      hyperparameters: {
        epochs: 20,
        batchSize: 32,
        optimizer: 'adam',
        learningRate: 0.0005,
        loss: 'binary_crossentropy',
        metrics: ['accuracy', 'recall']
      },
      startedAt: '2026-10-30T10:00:00Z',
      endedAt: '2026-10-30T10:35:10Z',
      createdAt: '2026-10-30T09:58:00Z',
      metricsHistory: [
        { epoch: 1, loss: 0.540, accuracy: 0.72, valLoss: 0.490, valAccuracy: 0.76 },
        { epoch: 5, loss: 0.320, accuracy: 0.86, valLoss: 0.310, valAccuracy: 0.87 },
        { epoch: 10, loss: 0.210, accuracy: 0.92, valLoss: 0.230, valAccuracy: 0.91 },
        { epoch: 15, loss: 0.140, accuracy: 0.95, valLoss: 0.165, valAccuracy: 0.94 },
        { epoch: 20, loss: 0.095, accuracy: 0.965, valLoss: 0.125, valAccuracy: 0.962 }
      ]
    },
    modelVersion: {
      id: 'model-salud-01',
      projectId: '22222222-2222-2222-2222-222222222222',
      jobId: 'job-salud-01',
      version: 'v2.0.0-clinical',
      storageKey: 'models/salud/chestnet_cnn_v2.0.0.keras',
      status: 'APPROVED',
      checksum: '7b92f913e614bc82d029f63529a3915bc828d19364a029c48192a74c20491823',
      metricsSummary: {
        accuracy: 0.962,
        loss: 0.125,
        valAccuracy: 0.962,
        valLoss: 0.125,
        f1Score: 0.961
      },
      createdAt: '2026-10-30T11:00:00Z'
    },
    dataPreview: {
      columns: [
        { name: 'Image_ID', type: 'String' },
        { name: 'Patient_Age', type: 'Numeric' },
        { name: 'Projection', type: 'Categorical' },
        { name: 'Resolution', type: 'String' },
        { name: 'Opacity_Score', type: 'Float' },
        { name: 'condition', type: 'Target' }
      ],
      rows: [
        { Image_ID: 'IMG_00291', Patient_Age: 45, Projection: 'PA', Resolution: '128x128', Opacity_Score: 0.08, condition: 'Normal' },
        { Image_ID: 'IMG_00292', Patient_Age: 62, Projection: 'AP', Resolution: '128x128', Opacity_Score: 0.88, condition: 'Neumonia' },
        { Image_ID: 'IMG_00293', Patient_Age: 31, Projection: 'PA', Resolution: '128x128', Opacity_Score: 0.11, condition: 'Normal' },
        { Image_ID: 'IMG_00294', Patient_Age: 74, Projection: 'AP', Resolution: '128x128', Opacity_Score: 0.94, condition: 'Neumonia' }
      ]
    }
  },

  energia: {
    id: 'energia',
    title: 'Energía: Predicción de Demanda Eléctrica',
    subtitle: 'Red Neuronal Recurrente (LSTM) para series de tiempo',
    category: 'Energía',
    project: {
      id: '33333333-3333-3333-3333-333333333333',
      name: 'Pronóstico de Carga Energética (RNN/LSTM)',
      description: 'Predicción horaria de consumo eléctrico en la red metropolitana con dependencias temporales y estacionalidad mediante células LSTM.',
      ownerId: 'c138d879-112e-4b44-b0db-6e1d283626fa',
      status: 'ACTIVE',
      createdAt: '2026-10-27T09:00:00Z',
      updatedAt: '2026-11-01T12:00:00Z',
      architecturesCount: 2,
      datasetsCount: 1,
      jobsCount: 2
    },
    architecture: {
      id: 'arch-energia-01',
      projectId: '33333333-3333-3333-3333-333333333333',
      name: 'GridLoad LSTM Forecaster',
      family: 'RNN',
      config: {
        inputShape: [24, 5],
        layers: [
          { id: '1', type: 'LSTM', units: 64, returnSequences: false },
          { id: '2', type: 'Dropout', rate: 0.2 },
          { id: '3', type: 'Dense', units: 32, activation: 'relu' },
          { id: '4', type: 'Dense', units: 1, activation: 'linear' }
        ]
      },
      version: 1,
      createdAt: '2026-10-27T10:00:00Z'
    },
    dataset: {
      id: 'ds-energia-01',
      projectId: '33333333-3333-3333-3333-333333333333',
      name: 'hourly_grid_load_2024_2026.parquet',
      version: 'v1.0',
      storageKey: 'datasets/energia/hourly_grid_load.parquet',
      metadata: {
        samples: 17520,
        featuresCount: 5,
        targetColumn: 'megawatts_consumed',
        trainSplit: 0.80,
        valSplit: 0.10,
        testSplit: 0.10
      },
      createdAt: '2026-10-27T09:30:00Z'
    },
    initialJob: {
      id: 'job-energia-01',
      projectId: '33333333-3333-3333-3333-333333333333',
      architectureId: 'arch-energia-01',
      datasetId: 'ds-energia-01',
      status: 'COMPLETED',
      progress: 100,
      hyperparameters: {
        epochs: 25,
        batchSize: 32,
        optimizer: 'adam',
        learningRate: 0.001,
        loss: 'mse',
        metrics: ['mae']
      },
      startedAt: '2026-10-29T14:00:00Z',
      endedAt: '2026-10-29T14:22:15Z',
      createdAt: '2026-10-29T13:58:00Z',
      metricsHistory: [
        { epoch: 1, loss: 0.350, accuracy: 0.70, valLoss: 0.310, valAccuracy: 0.73 },
        { epoch: 5, loss: 0.180, accuracy: 0.82, valLoss: 0.170, valAccuracy: 0.84 },
        { epoch: 10, loss: 0.095, accuracy: 0.89, valLoss: 0.091, valAccuracy: 0.89 },
        { epoch: 15, loss: 0.052, accuracy: 0.93, valLoss: 0.058, valAccuracy: 0.92 },
        { epoch: 20, loss: 0.035, accuracy: 0.95, valLoss: 0.041, valAccuracy: 0.94 },
        { epoch: 25, loss: 0.024, accuracy: 0.962, valLoss: 0.031, valAccuracy: 0.955 }
      ]
    },
    modelVersion: {
      id: 'model-energia-01',
      projectId: '33333333-3333-3333-3333-333333333333',
      jobId: 'job-energia-01',
      version: 'v1.1.0',
      storageKey: 'models/energia/gridload_lstm_v1.1.0.keras',
      status: 'APPROVED',
      checksum: '4a1b8c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b',
      metricsSummary: {
        accuracy: 0.955,
        loss: 0.031,
        valAccuracy: 0.955,
        valLoss: 0.031,
        f1Score: 0.952
      },
      createdAt: '2026-10-29T15:00:00Z'
    },
    dataPreview: {
      columns: [
        { name: 'Timestamp', type: 'DateTime' },
        { name: 'Temp_Celsius', type: 'Numeric' },
        { name: 'Humidity_Pct', type: 'Numeric' },
        { name: 'DayOfWeek', type: 'Int' },
        { name: 'Is_Holiday', type: 'Boolean' },
        { name: 'megawatts_consumed', type: 'Target' }
      ],
      rows: [
        { Timestamp: '2026-10-31 08:00', Temp_Celsius: 18.2, Humidity_Pct: 65, DayOfWeek: 5, Is_Holiday: 0, megawatts_consumed: 3420 },
        { Timestamp: '2026-10-31 09:00', Temp_Celsius: 21.0, Humidity_Pct: 58, DayOfWeek: 5, Is_Holiday: 0, megawatts_consumed: 4120 },
        { Timestamp: '2026-10-31 10:00', Temp_Celsius: 23.5, Humidity_Pct: 52, DayOfWeek: 5, Is_Holiday: 0, megawatts_consumed: 4890 },
        { Timestamp: '2026-10-31 11:00', Temp_Celsius: 25.1, Humidity_Pct: 48, DayOfWeek: 5, Is_Holiday: 0, megawatts_consumed: 5200 }
      ]
    }
  }
};
