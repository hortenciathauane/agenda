import React from 'react';
import { Users, Star, Building2, Layers, CloudCheck, HardDrive } from 'lucide-react';
import { Contact, SupabaseConfigStatus } from '../types/contact';

interface StatsBarProps {
  contacts: Contact[];
  status: SupabaseConfigStatus;
  selectedCategory: string;
  onSelectCategory: (cat: string) => void;
  onlyFavorites: boolean;
  onToggleFavoritesOnly: () => void;
}

export const StatsBar: React.FC<StatsBarProps> = ({
  contacts,
  status,
  selectedCategory,
  onSelectCategory,
  onlyFavorites,
  onToggleFavoritesOnly,
}) => {
  const total = contacts.length;
  const favorites = contacts.filter((c) => c.favorite).length;
  const clients = contacts.filter((c) => c.category === 'Clientes').length;
  const categoriesCount = new Set(contacts.map((c) => c.category)).size;

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
      {/* Total Contacts */}
      <div
        onClick={() => {
          onSelectCategory('all');
          if (onlyFavorites) onToggleFavoritesOnly();
        }}
        className={`cursor-pointer p-3.5 rounded-xl border transition-all ${
          selectedCategory === 'all' && !onlyFavorites
            ? 'bg-slate-800/90 border-emerald-500/50 shadow-md shadow-emerald-500/10'
            : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 hover:bg-slate-800/50'
        }`}
      >
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs text-slate-400 font-medium">Total de Contatos</span>
          <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400">
            <Users className="w-4 h-4" />
          </div>
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-bold text-white tracking-tight">{total}</span>
          <span className="text-[11px] text-slate-400">cadastrados</span>
        </div>
      </div>

      {/* Favorites */}
      <div
        onClick={onToggleFavoritesOnly}
        className={`cursor-pointer p-3.5 rounded-xl border transition-all ${
          onlyFavorites
            ? 'bg-slate-800/90 border-amber-500/50 shadow-md shadow-amber-500/10'
            : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 hover:bg-slate-800/50'
        }`}
      >
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs text-slate-400 font-medium">Favoritos</span>
          <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-400">
            <Star className={`w-4 h-4 ${onlyFavorites ? 'fill-amber-400' : ''}`} />
          </div>
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-bold text-white tracking-tight">{favorites}</span>
          <span className="text-[11px] text-slate-400">destacados</span>
        </div>
      </div>

      {/* Clientes */}
      <div
        onClick={() => onSelectCategory(selectedCategory === 'Clientes' ? 'all' : 'Clientes')}
        className={`cursor-pointer p-3.5 rounded-xl border transition-all ${
          selectedCategory === 'Clientes'
            ? 'bg-slate-800/90 border-blue-500/50 shadow-md shadow-blue-500/10'
            : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 hover:bg-slate-800/50'
        }`}
      >
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs text-slate-400 font-medium">Clientes</span>
          <div className="p-1.5 rounded-lg bg-blue-500/10 text-blue-400">
            <Building2 className="w-4 h-4" />
          </div>
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-bold text-white tracking-tight">{clients}</span>
          <span className="text-[11px] text-slate-400">contatos</span>
        </div>
      </div>

      {/* Database Storage Engine */}
      <div className="p-3.5 rounded-xl border bg-slate-900/60 border-slate-800">
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs text-slate-400 font-medium">Armazenamento</span>
          <div
            className={`p-1.5 rounded-lg ${
              status.isConfigured
                ? 'bg-emerald-500/10 text-emerald-400'
                : 'bg-slate-800 text-slate-400'
            }`}
          >
            {status.isConfigured ? (
              <CloudCheck className="w-4 h-4 text-emerald-400" />
            ) : (
              <HardDrive className="w-4 h-4 text-amber-400" />
            )}
          </div>
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-sm font-semibold text-white tracking-tight">
            {status.isConfigured ? 'Supabase Cloud' : 'Armaz. Local'}
          </span>
          <span className="text-[11px] text-slate-400 truncate">
            {status.isConfigured ? 'PostgreSQL' : 'Navegador'}
          </span>
        </div>
      </div>
    </div>
  );
};
