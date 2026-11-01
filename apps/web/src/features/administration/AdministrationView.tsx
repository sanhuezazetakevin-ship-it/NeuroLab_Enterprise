import React, { useState } from 'react';
import {
  ShieldCheck,
  Users,
  Clock,
  Cpu,
  Lock,
  CheckCircle2,
  UserPlus,
  Search,
  Check,
  X,
  Sliders,
  Server,
  Zap
} from 'lucide-react';
import { useDemo } from '../../lib/DemoContext';
import { UserRole } from '../../types';

export const AdministrationView: React.FC = () => {
  const { currentRole, switchRole, showToast } = useDemo();

  const [users, setUsers] = useState([
    { id: '1', name: 'Gabriel (Tú)', email: 'engineer@neurolab.enterprise', role: 'AI_ENGINEER', status: 'Activo' },
    { id: '2', name: 'Dra. María Sánchez', email: 'lead@neurolab.enterprise', role: 'PROJECT_LEAD', status: 'Activo' },
    { id: '3', name: 'Admin Corporativo', email: 'admin@neurolab.enterprise', role: 'ADMIN', status: 'Activo' },
    { id: '4', name: 'Carlos Mendoza (Revisor)', email: 'reviewer@neurolab.enterprise', role: 'REVIEWER', status: 'Activo' },
    { id: '5', name: 'Laura Gómez (Directorio)', email: 'viewer@neurolab.enterprise', role: 'VIEWER', status: 'Activo' },
  ]);

  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteName, setInviteName] = useState('');
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<UserRole>('AI_ENGINEER');

  // Quota states
  const [maxWorkers, setMaxWorkers] = useState(4);
  const [maxHours, setMaxHours] = useState(2);
  const [gpuEnabled, setGpuEnabled] = useState(true);

  // Audit filter state
  const [auditSearch, setAuditSearch] = useState('');

  const [auditLogs, setAuditLogs] = useState([
    {
      id: 'aud-01',
      actor: 'engineer@neurolab.enterprise',
      action: 'APPROVE_MODEL_VERSION',
      details: 'Modelo Feedforward v1.0.0 promovido a estado APPROVED (Accuracy: 94.8%)',
      timestamp: 'Hace 25 min'
    },
    {
      id: 'aud-02',
      actor: 'engineer@neurolab.enterprise',
      action: 'TRAINING_JOB_COMPLETED',
      details: 'Trabajo job-fintech-01 completado en 25 épocas en worker CPU-01',
      timestamp: 'Hace 45 min'
    },
    {
      id: 'aud-03',
      actor: 'admin@neurolab.enterprise',
      action: 'UPDATE_RESOURCE_QUOTA',
      details: 'Límite de workers concurrentes ajustado a 4 slots',
      timestamp: 'Hace 2 horas'
    },
    {
      id: 'aud-04',
      actor: 'lead@neurolab.enterprise',
      action: 'DATASET_REGISTERED',
      details: 'creditcard_transactions_v2.csv registrado con hash SHA-256',
      timestamp: 'Ayer'
    }
  ]);

  const handleInviteSubmit = () => {
    if (!inviteName || !inviteEmail) return;
    const newUser = {
      id: Math.random().toString(),
      name: inviteName,
      email: inviteEmail,
      role: inviteRole,
      status: 'Activo'
    };
    setUsers([...users, newUser]);
    setShowInviteModal(false);
    setInviteName('');
    setInviteEmail('');
    showToast(`Usuario ${inviteName} invitado con rol ${inviteRole}`, 'success');
  };

  const saveQuotas = () => {
    showToast('Cuotas de hardware y límites actualizados en el clúster', 'success');
  };

  const filteredLogs = auditLogs.filter(
    (l) =>
      l.action.toLowerCase().includes(auditSearch.toLowerCase()) ||
      l.actor.toLowerCase().includes(auditSearch.toLowerCase()) ||
      l.details.toLowerCase().includes(auditSearch.toLowerCase())
  );

  // RBAC Matrix
  const rbacModules = [
    { module: 'M01 Dashboard', admin: true, lead: true, engineer: true, reviewer: true, viewer: true },
    { module: 'M02 Proyectos (Crear/Editar)', admin: true, lead: true, engineer: false, reviewer: false, viewer: false },
    { module: 'M03 Fundamentos (Lectura/Simulación)', admin: true, lead: true, engineer: true, reviewer: true, viewer: true },
    { module: 'M04 Diseñador (Crear/Editar)', admin: true, lead: true, engineer: true, reviewer: false, viewer: false },
    { module: 'M05 Datasets (Subir/Split)', admin: true, lead: true, engineer: true, reviewer: false, viewer: false },
    { module: 'M06 Entrenamientos (Iniciar/Cancelar)', admin: true, lead: true, engineer: true, reviewer: false, viewer: false },
    { module: 'M07 Evaluación (Consultar Métricas)', admin: true, lead: true, engineer: true, reviewer: true, viewer: true },
    { module: 'M08 Registro (Aprobar Versión)', admin: true, lead: true, engineer: false, reviewer: false, viewer: false },
    { module: 'M09 Reportes (Exportar PDF/CSV)', admin: true, lead: true, engineer: true, reviewer: true, viewer: true },
    { module: 'M10 Administración (RBAC/Cuotas)', admin: true, lead: false, engineer: false, reviewer: false, viewer: false },
  ];

  return (
    <div className="space-y-4 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-white/10">
        <div>
          <div className="flex items-center gap-2 text-white/60 text-xs font-semibold uppercase tracking-wider">
            <ShieldCheck className="w-4 h-4 text-white/80" /> Módulo 10 • Administración & Seguridad
          </div>
          <h1 className="text-xl sm:text-2xl font-semibold text-white dark:text-white light:text-zinc-900 mt-1">
            Control de Acceso (RBAC), Cuotas & Auditoría
          </h1>
          <p className="text-xs text-white/50 dark:text-white/50 light:text-zinc-500 mt-0.5">
            Gobernanza corporativa, segregación de roles, límites de cómputo y registro inmutable de auditoría.
          </p>
        </div>

        <button
          onClick={() => setShowInviteModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl glass-btn-primary text-xs font-semibold self-start sm:self-auto"
        >
          <UserPlus className="w-4 h-4" /> Invitar Usuario
        </button>
      </div>

      {/* Main Grid: User Directory (Left) + Quotas & Hardware Status (Right compact dock) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Left: User Directory */}
        <div className="lg:col-span-2 glass-card p-5 rounded-2xl space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-white dark:text-white light:text-zinc-900 flex items-center gap-2">
              <Users className="w-4 h-4 text-white/70" /> Directorio de Usuarios ({users.length})
            </h2>
            <span className="text-[11px] text-white/40">Autenticación JWT Segura</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-white/10 text-white/40">
                  <th className="pb-2.5 font-medium">Usuario</th>
                  <th className="pb-2.5 font-medium">Correo Electrónico</th>
                  <th className="pb-2.5 font-medium">Rol Asignado</th>
                  <th className="pb-2.5 font-medium">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-white/[0.04] transition-colors">
                    <td className="py-3 font-semibold text-white dark:text-white light:text-zinc-900">{u.name}</td>
                    <td className="py-3 text-white/60 dark:text-white/60 light:text-zinc-600">{u.email}</td>
                    <td className="py-3">
                      <span className="font-mono text-[10px] px-2.5 py-0.5 rounded-full glass-inset text-white border border-white/10">
                        {u.role}
                      </span>
                    </td>
                    <td className="py-3">
                      <span className="text-white/80 font-medium flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span> {u.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Compact Dock: Hardware Quotas Manager */}
        <div className="glass-card p-5 rounded-2xl space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-white dark:text-white light:text-zinc-900 flex items-center gap-2">
              <Cpu className="w-4 h-4 text-white/70" /> Cuotas de Cómputo
            </h2>
            <button
              onClick={saveQuotas}
              className="text-xs text-white hover:underline font-semibold"
            >
              Guardar
            </button>
          </div>

          <div className="space-y-4 text-xs">
            <div>
              <div className="flex justify-between text-white/60 mb-1">
                <span>Workers Concurrentes:</span>
                <span className="text-white font-medium font-mono">{maxWorkers} slots</span>
              </div>
              <input
                type="range"
                min="1"
                max="8"
                value={maxWorkers}
                onChange={(e) => setMaxWorkers(parseInt(e.target.value))}
                className="w-full accent-white cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between text-white/60 mb-1">
                <span>Tiempo Máximo por Job:</span>
                <span className="text-white font-medium font-mono">{maxHours} horas ({maxHours * 3600}s)</span>
              </div>
              <input
                type="range"
                min="1"
                max="12"
                value={maxHours}
                onChange={(e) => setMaxHours(parseInt(e.target.value))}
                className="w-full accent-white cursor-pointer"
              />
            </div>

            <div className="pt-3 border-t border-white/10 flex items-center justify-between">
              <div>
                <span className="font-medium text-white/90 dark:text-white/90 light:text-zinc-800">Aceleración GPU / CUDA</span>
                <p className="text-[10px] text-white/40">Fallback CPU si GPU no disponible</p>
              </div>
              <input
                type="checkbox"
                checked={gpuEnabled}
                onChange={(e) => setGpuEnabled(e.target.checked)}
                className="w-4 h-4 accent-white cursor-pointer rounded"
              />
            </div>

            <div className="p-3.5 glass-inset rounded-xl border border-white/10 text-[11px] text-white/50 space-y-1">
              <div className="flex items-center justify-between">
                <span>Clúster:</span>
                <span className="font-mono text-white font-medium">cluster-primary-us-east</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Capacidad Usada:</span>
                <span className="font-mono text-white/80">2 de {maxWorkers} workers</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* RBAC Permissions Matrix Table */}
      <div className="glass-card p-5 rounded-2xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <h2 className="text-sm font-semibold text-white dark:text-white light:text-zinc-900 flex items-center gap-2">
            <Lock className="w-4 h-4 text-white/70" /> Matriz de Permisos RBAC por Módulo
          </h2>
          <span className="text-xs text-white/50">
            Rol simulado actualmente: <strong className="text-white font-mono">{currentRole}</strong>
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-center text-xs">
            <thead>
              <tr className="border-b border-white/10 text-white/40">
                <th className="pb-2.5 text-left font-medium">Módulo del Sistema</th>
                <th className="pb-2.5 font-medium">ADMIN</th>
                <th className="pb-2.5 font-medium">PROJECT_LEAD</th>
                <th className="pb-2.5 font-medium">AI_ENGINEER</th>
                <th className="pb-2.5 font-medium">REVIEWER</th>
                <th className="pb-2.5 font-medium">VIEWER</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 font-mono">
              {rbacModules.map((row, idx) => (
                <tr key={idx} className="hover:bg-white/[0.04]">
                  <td className="py-2.5 text-left font-sans font-medium text-white/80">{row.module}</td>
                  <td className="py-2.5">{row.admin ? <Check className="w-4 h-4 text-white mx-auto" /> : <X className="w-4 h-4 text-white/20 mx-auto" />}</td>
                  <td className="py-2.5">{row.lead ? <Check className="w-4 h-4 text-white mx-auto" /> : <X className="w-4 h-4 text-white/20 mx-auto" />}</td>
                  <td className="py-2.5">{row.engineer ? <Check className="w-4 h-4 text-white mx-auto" /> : <X className="w-4 h-4 text-white/20 mx-auto" />}</td>
                  <td className="py-2.5">{row.reviewer ? <Check className="w-4 h-4 text-white mx-auto" /> : <X className="w-4 h-4 text-white/20 mx-auto" />}</td>
                  <td className="py-2.5">{row.viewer ? <Check className="w-4 h-4 text-white mx-auto" /> : <X className="w-4 h-4 text-white/20 mx-auto" />}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Audit Log */}
      <div className="glass-card p-5 rounded-2xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <h2 className="text-sm font-semibold text-white dark:text-white light:text-zinc-900 flex items-center gap-2">
            <Clock className="w-4 h-4 text-white/70" /> Registro Inmutable de Auditoría (Audit Log)
          </h2>

          <div className="relative">
            <Search className="w-3.5 h-3.5 text-white/40 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Filtrar por acción o usuario..."
              value={auditSearch}
              onChange={(e) => setAuditSearch(e.target.value)}
              className="glass-input rounded-xl pl-8 pr-3 py-1.5 w-64 text-xs text-white"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="border-b border-white/10 text-white/40">
                <th className="pb-2">Tiempo</th>
                <th className="pb-2">Actor</th>
                <th className="pb-2">Acción</th>
                <th className="pb-2">Detalles / Metadata</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredLogs.map((log) => (
                <tr key={log.id} className="hover:bg-white/[0.04]">
                  <td className="py-2.5 text-white/50 font-sans">{log.timestamp}</td>
                  <td className="py-2.5 text-white/80">{log.actor}</td>
                  <td className="py-2.5 text-white font-medium">{log.action}</td>
                  <td className="py-2.5 text-white/60 font-sans">{log.details}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Invite Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="glass-panel border border-white/15 rounded-3xl p-6 max-w-md w-full space-y-4 shadow-glass animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-semibold text-white flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-white/80" /> Invitar Colaborador al Proyecto
              </h3>
              <button onClick={() => setShowInviteModal(false)} className="text-white/40 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div>
              <label className="block text-xs font-medium text-white/60 mb-1.5">Nombre Completo</label>
              <input
                type="text"
                placeholder="ej. Dra. Ana Beltrán"
                value={inviteName}
                onChange={(e) => setInviteName(e.target.value)}
                className="w-full glass-input rounded-xl px-3 py-2 text-xs text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-white/60 mb-1.5">Correo Corporativo</label>
              <input
                type="email"
                placeholder="ana.beltran@neurolab.enterprise"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                className="w-full glass-input rounded-xl px-3 py-2 text-xs text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-white/60 mb-1.5">Rol RBAC Asignado</label>
              <select
                value={inviteRole}
                onChange={(e) => setInviteRole(e.target.value as UserRole)}
                className="w-full glass-input rounded-xl px-3 py-2 text-xs text-white"
              >
                <option value="AI_ENGINEER">AI_ENGINEER (Diseña, entrena y evalúa)</option>
                <option value="PROJECT_LEAD">PROJECT_LEAD (Gestiona equipo y aprueba modelos)</option>
                <option value="REVIEWER">REVIEWER (Audita y certifica en solo lectura)</option>
                <option value="VIEWER">VIEWER (Visualización de dashboards)</option>
              </select>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setShowInviteModal(false)}
                className="px-3.5 py-2 text-xs text-white/50 hover:text-white"
              >
                Cancelar
              </button>
              <button
                onClick={handleInviteSubmit}
                className="px-4 py-2 glass-btn-primary text-xs font-semibold rounded-xl"
              >
                Enviar Invitación
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
