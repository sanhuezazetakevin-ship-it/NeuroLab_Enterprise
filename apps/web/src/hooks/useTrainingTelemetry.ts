import { useState, useEffect, useRef } from 'react';
import { TrainingMetric } from '../types';

interface TelemetryEvent {
  event: string;
  job_id: string;
  epoch: number;
  total_epochs: number;
  progress: number;
  metrics: {
    loss: number;
    accuracy?: number;
    val_loss?: number;
    val_accuracy?: number;
  };
}

export function useTrainingTelemetry(jobId: string | null) {
  const [metrics, setMetrics] = useState<TrainingMetric[]>([]);
  const [progress, setProgress] = useState(0);
  const [currentEpoch, setCurrentEpoch] = useState(0);
  const [totalEpochs, setTotalEpochs] = useState(0);
  const [isConnected, setIsConnected] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    if (!jobId) return;

    const wsUrl = `ws://${window.location.hostname}:8000/api/v1/training-jobs/${jobId}/events`;
    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;

    ws.onopen = () => {
      setIsConnected(true);
    };

    ws.onmessage = (event) => {
      try {
        const data: TelemetryEvent = JSON.parse(event.data);
        if (data.event === 'epoch_end') {
          setCurrentEpoch(data.epoch);
          setTotalEpochs(data.total_epochs);
          setProgress(data.progress);
          setMetrics((prev) => [
            ...prev,
            {
              epoch: data.epoch,
              loss: data.metrics.loss,
              accuracy: data.metrics.accuracy,
              valLoss: data.metrics.val_loss,
              valAccuracy: data.metrics.val_accuracy,
            },
          ]);
        }
      } catch (err) {
        console.error('Error procesando evento de telemetría:', err);
      }
    };

    ws.onclose = () => {
      setIsConnected(false);
    };

    return () => {
      ws.close();
    };
  }, [jobId]);

  return {
    metrics,
    progress,
    currentEpoch,
    totalEpochs,
    isConnected,
  };
}
