import React, { useState } from 'react';
import { Activity, Lock, Mail, Network, ShieldCheck, ArrowRight, AlertCircle } from 'lucide-react';
import { useAuth } from '../../lib/AuthContext';

export const LoginView: React.FC = () => {
  const { login } = useAuth();
  const [email, setEmail] = useState('admin@neurolab.enterprise');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await login(email.trim(), password);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No fue posible iniciar sesión');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4">
      <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Brand panel */}
        <div className="glass-panel rounded-3xl p-8 hidden lg:flex flex-col justify-between relative overflow-hidden">
          <div className="space-y-5">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-black/5 dark:bg-white/10 border border-black/10 dark:border-white/20 flex items-center justify-center text-zinc-900 dark:text-white">
                <Network className="w-5 h-5" />
              </div>
              <div>
                <p className="text-lg font-semibold text-zinc-900 dark:text-white tracking-tight">
                  NeuroLab <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded-full bg-black/5 dark:bg-white/10 border border-black/10 dark:border-white/15">Enterprise</span>
                </p>
                <p className="text-[11px] text-zinc-500 dark:text-white/50">Aprendizaje profundo • Semana 11</p>
              </div>
            </div>

            <div className="space-y-2">
              <h1 className="text-2xl font-semibold text-zinc-900 dark:text-white leading-tight">
                Diseño, entrenamiento y gobierno de redes neuronales
              </h1>
              <p className="text-xs text-zinc-600 dark:text-white/60 leading-relaxed">
                Plataforma con API FastAPI, workers aislados de TensorFlow/Keras, telemetría en
                tiempo real con recuperación de estado y registro inmutable de versiones.
              </p>
            </div>

            <ul className="space-y-2.5 text-xs text-zinc-600 dark:text-white/60">
              <li className="flex items-center gap-2"><ShieldCheck className="w-4 h-4" /> Autenticación JWT y RBAC por proyecto</li>
              <li className="flex items-center gap-2"><Activity className="w-4 h-4" /> Telemetría SSE con replay desde PostgreSQL</li>
              <li className="flex items-center gap-2"><Lock className="w-4 h-4" /> Modelos inmutables verificados con SHA-256</li>
            </ul>
          </div>

          <p className="text-[10px] text-zinc-500 dark:text-white/40 font-mono">
            NeuroLab Enterprise Engine · v1.0.0
          </p>
          <div className="absolute -right-16 -bottom-16 w-64 h-64 rounded-full bg-black/5 dark:bg-white/5 blur-2xl" />
        </div>

        {/* Login form */}
        <div className="glass-panel rounded-3xl p-8 space-y-6 flex flex-col justify-center">
          <div>
            <h2 className="text-xl font-semibold text-zinc-900 dark:text-white">Iniciar sesión</h2>
            <p className="text-xs text-zinc-500 dark:text-white/50 mt-1">
              Acceda con sus credenciales corporativas para continuar.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-zinc-600 dark:text-white/60 mb-1.5">
                Correo electrónico
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400 dark:text-white/40" />
                <input
                  type="email"
                  required
                  autoComplete="username"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  className="w-full glass-input rounded-xl pl-10 pr-3 py-2.5 text-xs"
                  placeholder="usuario@empresa.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-600 dark:text-white/60 mb-1.5">
                Contraseña
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400 dark:text-white/40" />
                <input
                  type="password"
                  required
                  minLength={8}
                  autoComplete="current-password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  className="w-full glass-input rounded-xl pl-10 pr-3 py-2.5 text-xs"
                  placeholder="••••••••"
                />
              </div>
            </div>

            {error && (
              <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/25 text-red-600 dark:text-red-300 text-xs flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full glass-btn-primary rounded-xl px-4 py-2.5 text-xs font-semibold flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {submitting ? 'Autenticando...' : 'Entrar a la plataforma'}
              {!submitting && <ArrowRight className="w-4 h-4" />}
            </button>
          </form>

          <div className="p-3 rounded-xl glass-inset border border-black/10 dark:border-white/10 text-[10px] text-zinc-500 dark:text-white/40 font-mono space-y-1">
            <p className="font-sans font-semibold text-zinc-600 dark:text-white/60">Cuenta inicial de desarrollo</p>
            <p>admin@neurolab.enterprise · Admin123!</p>
            <p className="text-[9px]">Cambie la contraseña en producción.</p>
          </div>
        </div>
      </div>
    </div>
  );
};
