// ==========================================
// NEUROLAB ENTERPRISE - CLIENT API SERVICE
// ==========================================

import {
  Project,
  Architecture,
  Dataset,
  TrainingJob,
  ModelVersion,
  AuditEvent,
  ArchitectureValidationResult,
  NetworkTopology
} from '../types';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';

export class ApiClient {
  private static token: string | null = localStorage.getItem('neurolab_token');

  static setToken(token: string) {
    this.token = token;
    localStorage.setItem('neurolab_token', token);
  }

  static getHeaders(): HeadersInit {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }
    return headers;
  }

  // Projects
  static async getProjects(): Promise<Project[]> {
    try {
      const res = await fetch(`${API_BASE}/projects`, { headers: this.getHeaders() });
      if (!res.ok) throw new Error('Error al cargar proyectos');
      return await res.json();
    } catch {
      // Fallback local mock data for instant prototype demonstration
      return [
        {
          id: '11111111-1111-1111-1111-111111111111',
          name: 'Clasificador de Clientes - Red Feedforward',
          description: 'Modelo predictivo para determinar propensión de fuga mediante una red neuronal multicapa densa.',
          ownerId: 'c138d879-112e-4b44-b0db-6e1d283626fa',
          status: 'ACTIVE',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          architecturesCount: 3,
          datasetsCount: 2,
          jobsCount: 5
        },
        {
          id: '22222222-2222-2222-2222-222222222222',
          name: 'Reconocimiento de Patrones Visuales (CNN)',
          description: 'Red neuronal convolucional para inspección automatizada de defectos en componentes de manufactura.',
          ownerId: 'c138d879-112e-4b44-b0db-6e1d283626fa',
          status: 'ACTIVE',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          architecturesCount: 2,
          datasetsCount: 1,
          jobsCount: 2
        }
      ];
    }
  }

  // Validate Architecture
  static async validateArchitecture(topology: NetworkTopology, family: string): Promise<ArchitectureValidationResult> {
    try {
      const res = await fetch(`${API_BASE}/projects/temp/architectures/validate?family=${family}`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(topology),
      });
      if (res.ok) return await res.json();
    } catch {
      // Client-side fallback validator
    }

    // Client-side quick calculation if backend is disconnected
    let params = 0;
    let curr = topology.inputShape[0] || 16;
    for (const l of topology.layers) {
      if (l.type === 'Dense' && l.units) {
        params += (curr + 1) * l.units;
        curr = l.units;
      }
    }
    return {
      valid: topology.layers.length > 0,
      totalParameters: params,
      trainableParameters: params,
      outputShape: [null, curr],
      warnings: [],
      errors: topology.layers.length === 0 ? ['Debe agregar al menos una capa'] : []
    };
  }

  // Fundamentals
  static async getFundamentals(): Promise<any> {
    try {
      const res = await fetch(`${API_BASE}/fundamentals`, { headers: this.getHeaders() });
      if (res.ok) return await res.json();
    } catch {
      // Handled in component
    }
    return null;
  }
}
