import React from 'react';
import { Database, Plus, UploadCloud, CheckCircle2, AlertCircle, Sparkles } from 'lucide-react';
import { SupabaseConfigStatus } from '../types/contact';

interface HeaderProps {
  status: SupabaseConfigStatus;
  onOpenNewContact: () => void;
  onOpenSupabaseGuide: () => void;
  onOpenImportExport: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  status,
  onOpenNewContact,
  onOpenSupabaseGuide,
  onOpenImportExport,
}) => {
  return (
    <header className="border-b border-slate-800 bg-slate-900/80 backdrop-blur-md sticky top-0 z-30 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Logo & Title */}
        <div className="flex items-center gap-3">
          <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-600 text-slate-950 font-bold shadow-lg shadow-emerald-500/20">
            <Database className="w-5 h-5 text-slate-950" />
            <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-slate-900 rounded-full flex items-center justify-center p-0.5">
              <span className={`w-full h-full rounded-full ${status.isConfigured ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
            </span>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold tracking-tight text-white flex items-center gap-1.5">
                Agenda<span className="text-emerald-400">Base</span>
              </h1>
              <span className="hidden sm:inline-block text-[11px] font-semibold tracking-wide uppercase px-2 py-0.5 rounded-full bg-slate-800 border border-slate-700 text-slate-400">
                Supabase DB
              </span>
            </div>
            <p className="text-xs text-slate-400 hidden md:block">
              Sistema de armazenamento e gestão de contatos
            </p>
          </div>
        </div>

        {/* Action Controls & Supabase Status */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Supabase Connection Pill Button */}
          <button
            onClick={onOpenSupabaseGuide}
            className={`group flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
              status.isConfigured
                ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30 hover:bg-emerald-500/20 hover:border-emerald-500/50'
                : 'bg-amber-500/10 text-amber-300 border-amber-500/30 hover:bg-amber-500/20 hover:border-amber-500/50'
            }`}
            title="Clique para ver detalhes da conexão e script SQL do Supabase"
          >
            {status.isConfigured ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            ) : (
              <AlertCircle className="w-4 h-4 text-amber-400" />
            )}
            <div className="text-left hidden sm:block">
              <div className="text-[11px] font-semibold leading-tight">
                {status.isConfigured ? 'Supabase Conectado' : 'Modo Armazenamento Local'}
              </div>
              <div className="text-[9px] text-slate-400">
                {status.isConfigured ? 'Banco de dados ativo' : 'Clique para configurar'}
              </div>
            </div>
            <span className="sm:hidden text-xs">
              {status.isConfigured ? 'Supabase' : 'Configurar'}
            </span>
          </button>

          {/* Import / Export button */}
          <button
            onClick={onOpenImportExport}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-300 bg-slate-800 hover:bg-slate-700 hover:text-white border border-slate-700/80 transition-colors"
            title="Importar ou exportar contatos em CSV / JSON"
          >
            <UploadCloud className="w-4 h-4 text-slate-400" />
            <span className="hidden md:inline">Importar / Exportar</span>
          </button>

          {/* Add Contact Button */}
          <button
            onClick={onOpenNewContact}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold text-slate-950 bg-emerald-400 hover:bg-emerald-300 active:scale-95 transition-all shadow-md shadow-emerald-500/25"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Novo Contato</span>
          </button>
        </div>
      </div>
    </header>
  );
};
