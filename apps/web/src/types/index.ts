// ==========================================
// NEUROLAB ENTERPRISE - TYPE DEFINITIONS
// ==========================================

export type UserRole = 'ADMIN' | 'PROJECT_LEAD' | 'AI_ENGINEER' | 'REVIEWER' | 'VIEWER';

export interface User {
  id: string;
  email: string;
  displayName: string;
  role: UserRole;
  status: 'ACTIVE' | 'INACTIVE';
  createdAt: string;
}

export interface Project {
  id: string;
  name: string;
  description?: string;
  ownerId: string;
  status: 'ACTIVE' | 'ARCHIVED';
  createdAt: string;
  updatedAt: string;
  architecturesCount?: number;
  datasetsCount?: number;
  jobsCount?: number;
}

export type NetworkFamily = 'FEEDFORWARD' | 'RNN' | 'CNN' | 'GAN';

export type LayerType = 
  | 'Dense' 
  | 'Dropout' 
  | 'Conv2D' 
  | 'MaxPooling2D' 
  | 'Flatten' 
  | 'LSTM' 
  | 'GRU' 
  | 'BatchNormalization';

export type ActivationFunction = 'relu' | 'sigmoid' | 'tanh' | 'softmax' | 'linear' | 'leaky_relu';

export interface LayerConfig {
  id: string;
  type: LayerType;
  units?: number;
  activation?: ActivationFunction;
  rate?: number;
  filters?: number;
  kernelSize?: [number, number];
  poolSize?: [number, number];
  returnSequences?: boolean;
}

export interface NetworkTopology {
  inputShape: number[];
  layers: LayerConfig[];
}

export interface Architecture {
  id: string;
  projectId: string;
  name: string;
  family: NetworkFamily;
  config: NetworkTopology;
  version: number;
  createdAt: string;
}

export interface ArchitectureValidationResult {
  valid: boolean;
  totalParameters: number;
  trainableParameters: number;
  outputShape: (number | null)[];
  warnings: string[];
  errors: string[];
}

export interface Dataset {
  id: string;
  projectId: string;
  name: string;
  version: string;
  storageKey: string;
  metadata: {
    samples: number;
    featuresCount: number;
    targetColumn: string;
    trainSplit: number;
    valSplit: number;
    testSplit: number;
  };
  createdAt: string;
}

export type JobStatus = 'QUEUED' | 'PREPARING' | 'RUNNING' | 'COMPLETED' | 'FAILED' | 'CANCELLED';

export interface Hyperparameters {
  epochs: number;
  batchSize: number;
  optimizer: 'adam' | 'sgd' | 'rmsprop';
  learningRate: number;
  loss: string;
  metrics: string[];
}

export interface TrainingMetric {
  epoch: number;
  loss: number;
  accuracy?: number;
  valLoss?: number;
  valAccuracy?: number;
}

export interface TrainingJob {
  id: string;
  projectId: string;
  architectureId: string;
  datasetId: string;
  status: JobStatus;
  progress: number;
  hyperparameters: Hyperparameters;
  startedAt?: string;
  endedAt?: string;
  errorMessage?: string;
  createdAt: string;
  metricsHistory?: TrainingMetric[];
}

export type ModelLifecycleStatus = 'DRAFT' | 'REVIEWED' | 'APPROVED' | 'RETIRED';

export interface ModelVersion {
  id: string;
  projectId: string;
  jobId: string;
  version: string;
  storageKey: string;
  status: ModelLifecycleStatus;
  checksum: string;
  metricsSummary: {
    accuracy: number;
    loss: number;
    valAccuracy: number;
    valLoss: number;
    f1Score?: number;
  };
  createdAt: string;
}

export interface AuditEvent {
  id: string;
  actorId: string;
  actorName?: string;
  projectId?: string;
  action: string;
  metadata: Record<string, any>;
  createdAt: string;
}
