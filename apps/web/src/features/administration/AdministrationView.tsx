import React, { useState } from 'react';
import {
  ShieldCheck,
  Users,
  Clock,
  Cpu,
  Lock,
  CheckCircle2,
  AlertTriangle,
  UserPlus,
  Search,
  Filter,
  Check,
  X,
  Sliders
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
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold uppercase tracking-wider">
            <ShieldCheck className="w-4 h-4" /> Módulo 10 • Administración & Seguridad
          </div>
          <h1 className="text-2xl font-bold text-white mt-1">Control de Acceso (RBAC), Cuotas & Auditoría</h1>
          <p className="text-xs text-slate-300 mt-1">
            Gobernanza corporativa, segregación de funciones por rol, límites de cómputo y registro inmutable de acciones.
          </p>
        </div>

        <button
          onClick={() => setShowInviteModal(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-xs transition-colors shadow-lg shadow-emerald-500/20"
        >
          <UserPlus className="w-4 h-4" /> Invitar Usuario
        </button>
      </div>

      {/* Grid: User Directory & Hardware Quota Manager */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* User Directory */}
        <div className="lg:col-span-2 p-5 rounded-xl bg-slate-900 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <Users className="w-4 h-4 text-emerald-400" /> Directorio de Usuarios ({users.length})
            </h2>
            <span className="text-[10px] text-slate-400">Autenticación JWT Segura</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400">
                  <th className="pb-2.5 font-semibold">Usuario</th>
                  <th className="pb-2.5 font-semibold">Correo Electrónico</th>
                  <th className="pb-2.5 font-semibold">Rol Asignado</th>
                  <th className="pb-2.5 font-semibold">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="py-2.5 font-bold text-white">{u.name}</td>
                    <td className="py-2.5 text-slate-400">{u.email}</td>
                    <td className="py-2.5">
                      <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-slate-800 text-indigo-300 border border-slate-700 font-bold">
                        {u.role}
                      </span>
                    </td>
                    <td className="py-2.5">
                      <span className="text-emerald-400 font-semibold flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> {u.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Hardware Quotas Manager */}
        <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <Cpu className="w-4 h-4 text-emerald-400" /> Cuotas de Cómputo
            </h2>
            <button
              onClick={saveQuotas}
              className="text-xs text-emerald-400 hover:text-emerald-300 font-bold"
            >
              Guardar
            </button>
          </div>

          <div className="space-y-4 text-xs">
            <div>
              <div className="flex justify-between text-slate-400 mb-1">
                <span>Workers Concurrentes:</span>
                <span className="text-emerald-400 font-bold font-mono">{maxWorkers} slots</span>
              </div>
              <input
                type="range"
                min="1"
                max="8"
                value={maxWorkers}
                onChange={(e) => setMaxWorkers(parseInt(e.target.value))}
                className="w-full accent-emerald-500 cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between text-slate-400 mb-1">
                <span>Tiempo Máximo por Job:</span>
                <span className="text-indigo-400 font-bold font-mono">{maxHours} horas ({maxHours * 3600}s)</span>
              </div>
              <input
                type="range"
                min="1"
                max="12"
                value={maxHours}
                onChange={(e) => setMaxHours(parseInt(e.target.value))}
                className="w-full accent-indigo-500 cursor-pointer"
              />
            </div>

            <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
              <div>
                <span className="font-semibold text-slate-200">Aceleración GPU / CUDA</span>
                <p className="text-[10px] text-slate-500">Fallback automático a CPU si GPU no está disponible</p>
              </div>
              <input
                type="checkbox"
                checked={gpuEnabled}
                onChange={(e) => setGpuEnabled(e.target.checked)}
                className="w-4 h-4 accent-emerald-500 cursor-pointer"
              />
            </div>
          </div>
        </div>
      </div>

      {/* RBAC Permissions Matrix Table */}
      <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-white flex items-center gap-2">
            <Lock className="w-4 h-4 text-emerald-400" /> Matriz de Permisos RBAC por Módulo
          </h2>
          <span className="text-xs text-slate-400">Rol activo actualmente en tu sesión: <strong className="text-emerald-400 font-mono">{currentRole}</strong></span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-center text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400">
                <th className="pb-2.5 text-left font-semibold">Módulo del Sistema</th>
                <th className="pb-2.5 font-semibold">ADMIN</th>
                <th className="pb-2.5 font-semibold">PROJECT_LEAD</th>
                <th className="pb-2.5 font-semibold">AI_ENGINEER</th>
                <th className="pb-2.5 font-semibold">REVIEWER</th>
                <th className="pb-2.5 font-semibold">VIEWER</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {rbacModules.map((row, idx) => (
                <tr key={idx} className="hover:bg-slate-800/20">
                  <td className="py-2.5 text-left font-sans font-semibold text-slate-300">{row.module}</td>
                  <td className="py-2.5">{row.admin ? <Check className="w-4 h-4 text-emerald-400 mx-auto" /> : <X className="w-4 h-4 text-slate-700 mx-auto" />}</td>
                  <td className="py-2.5">{row.lead ? <Check className="w-4 h-4 text-emerald-400 mx-auto" /> : <X className="w-4 h-4 text-slate-700 mx-auto" />}</td>
                  <td className="py-2.5">{row.engineer ? <Check className="w-4 h-4 text-emerald-400 mx-auto" /> : <X className="w-4 h-4 text-slate-700 mx-auto" />}</td>
                  <td className="py-2.5">{row.reviewer ? <Check className="w-4 h-4 text-emerald-400 mx-auto" /> : <X className="w-4 h-4 text-slate-700 mx-auto" />}</td>
                  <td className="py-2.5">{row.viewer ? <Check className="w-4 h-4 text-emerald-400 mx-auto" /> : <X className="w-4 h-4 text-slate-700 mx-auto" />}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Audit Log */}
      <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <h2 className="text-sm font-bold text-white flex items-center gap-2">
            <Clock className="w-4 h-4 text-emerald-400" /> Registro Inmutable de Auditoría (Audit Log)
          </h2>

          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Filtrar por acción o actor..."
              value={auditSearch}
              onChange={(e) => setAuditSearch(e.target.value)}
              className="bg-slate-950 border border-slate-800 text-xs rounded-lg pl-8 pr-3 py-1.5 w-64 text-slate-200 focus:outline-none focus:border-emerald-500"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="border-b border-slate-800 text-slate-500">
                <th className="pb-2">Tiempo</th>
                <th className="pb-2">Actor</th>
                <th className="pb-2">Acción</th>
                <th className="pb-2">Detalles / Metadata</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/40">
              {filteredLogs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-800/30">
                  <td className="py-2 text-slate-400 font-sans">{log.timestamp}</td>
                  <td className="py-2 text-slate-300">{log.actor}</td>
                  <td className="py-2 text-emerald-400 font-bold">{log.action}</td>
                  <td className="py-2 text-slate-300 font-sans">{log.details}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Invite Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 max-w-md w-full space-y-4 shadow-2xl animate-in fade-in zoom-in-95">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <UserPlus className="w-5 h-5 text-emerald-400" /> Invitar Colaborador al Proyecto
            </h3>
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">Nombre Completo</label>
              <input
                type="text"
                placeholder="ej. Ana Beltrán"
                value={inviteName}
                onChange={(e) => setInviteName(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">Correo Corporativo</label>
              <input
                type="email"
                placeholder="ana.beltran@neurolab.enterprise"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">Rol RBAC Asignado</label>
              <select
                value={inviteRole}
                onChange={(e) => setInviteRole(e.target.value as UserRole)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-emerald-500"
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
                className="px-3 py-1.5 text-xs text-slate-400 hover:text-white"
              >
                Cancelar
              </button>
              <button
                onClick={handleInviteSubmit}
                className="px-4 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-xs rounded-lg transition-colors"
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
