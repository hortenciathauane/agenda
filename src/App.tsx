/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import {
  Search,
  Filter,
  LayoutGrid,
  List,
  Plus,
  Star,
  Trash2,
  Database,
  ArrowUpDown,
  RefreshCw,
  X,
  CheckCircle2,
  AlertCircle,
  Download,
  Info,
  Sparkles,
} from 'lucide-react';
import { Contact, ContactCategory, SortField, SortOrder } from './types/contact';
import {
  fetchContacts,
  createContact,
  updateContact,
  deleteContact,
  bulkDeleteContacts,
  toggleFavoriteContact,
  getSupabaseConfigStatus,
  testSupabaseConnection,
} from './lib/supabase';
import { Header } from './components/Header';
import { StatsBar } from './components/StatsBar';
import { ContactCard } from './components/ContactCard';
import { ContactTableRow } from './components/ContactTableRow';
import { ContactModal } from './components/ContactModal';
import { ContactDetailModal } from './components/ContactDetailModal';
import { SupabaseGuideModal } from './components/SupabaseGuideModal';
import { ImportExportModal } from './components/ImportExportModal';
import { DeleteConfirmModal } from './components/DeleteConfirmModal';
import { CATEGORY_COLORS } from './utils/formatters';

const CATEGORIES: Array<string> = [
  'all',
  'Clientes',
  'Trabalho',
  'Parceiros',
  'Fornecedores',
  'Família',
  'Amigos',
  'Outros',
];

export default function App() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [supabaseStatus, setSupabaseStatus] = useState(getSupabaseConfigStatus());
  
  // Filters and UI state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [onlyFavorites, setOnlyFavorites] = useState(false);
  const [sortField, setSortField] = useState<SortField>('name');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Modals state
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const [editingContact, setEditingContact] = useState<Contact | null>(null);
  const [viewingContact, setViewingContact] = useState<Contact | null>(null);
  const [isSupabaseGuideOpen, setIsSupabaseGuideOpen] = useState(false);
  const [isImportExportOpen, setIsImportExportOpen] = useState(false);
  
  // Deletion modal state
  const [deleteDialog, setDeleteDialog] = useState<{
    isOpen: boolean;
    contact?: Contact;
    isBatch?: boolean;
    isDeleting?: boolean;
  }>({ isOpen: false });

  // Toast notification state
  const [toast, setToast] = useState<{
    show: boolean;
    type: 'success' | 'error' | 'info';
    message: string;
  } | null>(null);

  const showToast = (type: 'success' | 'error' | 'info', message: string) => {
    setToast({ show: true, type, message });
    setTimeout(() => setToast(null), 4000);
  };

  // Load contacts on mount
  const loadContacts = async () => {
    try {
      setIsLoading(true);
      const res = await fetchContacts();
      setContacts(res.contacts);
      
      // Check Supabase connection health
      const test = await testSupabaseConnection();
      setSupabaseStatus((prev) => ({
        ...prev,
        isConnected: test.success,
        checked: true,
        errorMessage: test.success ? null : test.message,
      }));
    } catch (err: any) {
      console.error('Error loading contacts:', err);
      showToast('error', 'Erro ao carregar contatos.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadContacts();
  }, []);

  // Filter and sort contacts
  const filteredAndSortedContacts = useMemo(() => {
    return contacts
      .filter((contact) => {
        // Search filter
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchName = contact.name.toLowerCase().includes(q);
          const matchEmail = contact.email?.toLowerCase().includes(q);
          const matchPhone = contact.phone?.includes(q);
          const matchCompany = contact.company?.toLowerCase().includes(q);
          const matchRole = contact.role?.toLowerCase().includes(q);
          const matchNotes = contact.notes?.toLowerCase().includes(q);

          if (!matchName && !matchEmail && !matchPhone && !matchCompany && !matchRole && !matchNotes) {
            return false;
          }
        }

        // Category filter
        if (selectedCategory !== 'all' && contact.category !== selectedCategory) {
          return false;
        }

        // Favorites filter
        if (onlyFavorites && !contact.favorite) {
          return false;
        }

        return true;
      })
      .sort((a, b) => {
        let valA = '';
        let valB = '';

        if (sortField === 'name') {
          valA = a.name.toLowerCase();
          valB = b.name.toLowerCase();
        } else if (sortField === 'company') {
          valA = (a.company || '').toLowerCase();
          valB = (b.company || '').toLowerCase();
        } else if (sortField === 'created_at') {
          valA = a.created_at || '';
          valB = b.created_at || '';
        } else if (sortField === 'updated_at') {
          valA = a.updated_at || '';
          valB = b.updated_at || '';
        }

        if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
        if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
        return 0;
      });
  }, [contacts, searchQuery, selectedCategory, onlyFavorites, sortField, sortOrder]);

  // Handlers for contact actions
  const handleSaveContact = async (
    contactData: Omit<Contact, 'id' | 'created_at' | 'updated_at'>
  ) => {
    if (editingContact) {
      // Update
      const res = await updateContact(editingContact.id, contactData);
      if (res.success && res.contact) {
        setContacts((prev) =>
          prev.map((c) => (c.id === editingContact.id ? res.contact! : c))
        );
        showToast('success', `Contato "${contactData.name}" atualizado!`);
      } else {
        throw new Error(res.error || 'Falha ao atualizar contato.');
      }
    } else {
      // Create
      const res = await createContact(contactData);
      if (res.success && res.contact) {
        setContacts((prev) => [res.contact!, ...prev]);
        showToast('success', `Contato "${contactData.name}" adicionado com sucesso!`);
      } else {
        throw new Error(res.error || 'Falha ao criar contato.');
      }
    }
  };

  const handleToggleFavorite = async (id: string, current: boolean) => {
    // Optimistic UI update
    setContacts((prev) =>
      prev.map((c) => (c.id === id ? { ...c, favorite: !current } : c))
    );
    if (viewingContact && viewingContact.id === id) {
      setViewingContact({ ...viewingContact, favorite: !current });
    }

    try {
      await toggleFavoriteContact(id, current);
    } catch {
      // Revert on failure
      setContacts((prev) =>
        prev.map((c) => (c.id === id ? { ...c, favorite: current } : c))
      );
      showToast('error', 'Não foi possível atualizar o favorito.');
    }
  };

  const handleSelectContact = (id: string, selected: boolean) => {
    setSelectedIds((prev) =>
      selected ? [...prev, id] : prev.filter((item) => item !== id)
    );
  };

  const handleSelectAll = (selectAll: boolean) => {
    if (selectAll) {
      setSelectedIds(filteredAndSortedContacts.map((c) => c.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleConfirmDelete = async () => {
    setDeleteDialog((prev) => ({ ...prev, isDeleting: true }));
    try {
      if (deleteDialog.isBatch) {
        // Bulk delete
        await bulkDeleteContacts(selectedIds);
        setContacts((prev) => prev.filter((c) => !selectedIds.includes(c.id)));
        showToast('success', `${selectedIds.length} contatos excluídos.`);
        setSelectedIds([]);
      } else if (deleteDialog.contact) {
        // Single delete
        const idToDelete = deleteDialog.contact.id;
        await deleteContact(idToDelete);
        setContacts((prev) => prev.filter((c) => c.id !== idToDelete));
        setSelectedIds((prev) => prev.filter((id) => id !== idToDelete));
        showToast('success', `Contato "${deleteDialog.contact.name}" excluído.`);
      }
      setDeleteDialog({ isOpen: false });
    } catch {
      showToast('error', 'Falha ao excluir contato.');
    } finally {
      setDeleteDialog((prev) => ({ ...prev, isDeleting: false }));
    }
  };

  const handleImportContacts = async (
    newContacts: Array<Omit<Contact, 'id' | 'created_at' | 'updated_at'>>
  ): Promise<number> => {
    let successCount = 0;
    for (const c of newContacts) {
      const res = await createContact(c);
      if (res.success && res.contact) {
        setContacts((prev) => [res.contact!, ...prev]);
        successCount++;
      }
    }
    showToast('success', `${successCount} contatos importados com sucesso!`);
    return successCount;
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col antialiased">
      {/* Toast Notification Banner */}
      {toast && (
        <div className="fixed top-20 right-6 z-50 animate-fade-in">
          <div
            className={`flex items-center gap-3 px-4 py-3 rounded-xl shadow-2xl border text-xs font-semibold backdrop-blur-md ${
              toast.type === 'success'
                ? 'bg-emerald-950/90 text-emerald-300 border-emerald-500/40'
                : toast.type === 'error'
                ? 'bg-rose-950/90 text-rose-300 border-rose-500/40'
                : 'bg-slate-900/90 text-slate-200 border-slate-700'
            }`}
          >
            {toast.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            ) : toast.type === 'error' ? (
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            ) : (
              <Info className="w-4 h-4 text-slate-400 shrink-0" />
            )}
            <span>{toast.message}</span>
            <button
              onClick={() => setToast(null)}
              className="p-1 hover:opacity-80 transition"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Main Header */}
      <Header
        status={supabaseStatus}
        onOpenNewContact={() => {
          setEditingContact(null);
          setIsContactModalOpen(true);
        }}
        onOpenSupabaseGuide={() => setIsSupabaseGuideOpen(true)}
        onOpenImportExport={() => setIsImportExportOpen(true)}
      />

      {/* Main Workspace */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Stats KPIs bar */}
        <StatsBar
          contacts={contacts}
          status={supabaseStatus}
          selectedCategory={selectedCategory}
          onSelectCategory={(cat) => setSelectedCategory(cat)}
          onlyFavorites={onlyFavorites}
          onToggleFavoritesOnly={() => setOnlyFavorites(!onlyFavorites)}
        />

        {/* Action, Search and Filter Control Bar */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 mb-6 shadow-sm">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar por nome, e-mail, telefone, cargo ou empresa..."
                className="w-full pl-10 pr-10 py-2.5 text-xs sm:text-sm rounded-xl bg-slate-950 border border-slate-800 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-500 hover:text-slate-300"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Controls: Sorting, View Mode, Refresh */}
            <div className="flex items-center gap-2 shrink-0">
              {/* Sort Order Selector */}
              <div className="flex items-center rounded-xl bg-slate-950 border border-slate-800 p-1">
                <select
                  value={sortField}
                  onChange={(e) => setSortField(e.target.value as SortField)}
                  className="bg-transparent text-xs text-slate-300 font-medium px-2 py-1 focus:outline-none cursor-pointer"
                >
                  <option value="name" className="bg-slate-900">Nome (A-Z)</option>
                  <option value="created_at" className="bg-slate-900">Data de Criação</option>
                  <option value="updated_at" className="bg-slate-900">Última Modificação</option>
                  <option value="company" className="bg-slate-900">Empresa</option>
                </select>

                <button
                  onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                  className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
                  title={sortOrder === 'asc' ? 'Ordem Crescente' : 'Ordem Decrescente'}
                >
                  <ArrowUpDown className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* View Mode Toggle (Grid / Table) */}
              <div className="flex items-center rounded-xl bg-slate-950 border border-slate-800 p-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-1.5 rounded-lg text-xs transition ${
                    viewMode === 'grid'
                      ? 'bg-emerald-500/20 text-emerald-400 shadow-sm'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                  title="Visualização em Grade"
                >
                  <LayoutGrid className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('table')}
                  className={`p-1.5 rounded-lg text-xs transition ${
                    viewMode === 'table'
                      ? 'bg-emerald-500/20 text-emerald-400 shadow-sm'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                  title="Visualização em Tabela"
                >
                  <List className="w-4 h-4" />
                </button>
              </div>

              {/* Refresh */}
              <button
                onClick={loadContacts}
                disabled={isLoading}
                className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-400 hover:text-white hover:border-slate-700 transition"
                title="Recarregar dados"
              >
                <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>

          {/* Category Filter Pills Row */}
          <div className="flex items-center gap-1.5 overflow-x-auto pt-3 mt-3 border-t border-slate-800/80 no-scrollbar">
            <span className="text-xs text-slate-500 font-medium mr-1 flex items-center gap-1">
              <Filter className="w-3 h-3" />
              Filtrar:
            </span>

            {CATEGORIES.map((cat) => {
              const count =
                cat === 'all'
                  ? contacts.length
                  : contacts.filter((c) => c.category === cat).length;
              const isSelected = selectedCategory === cat;

              return (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                    isSelected
                      ? 'bg-emerald-500 text-slate-950 font-semibold shadow-sm'
                      : 'bg-slate-950 text-slate-400 hover:text-slate-200 hover:bg-slate-800 border border-slate-800/60'
                  }`}
                >
                  <span>{cat === 'all' ? 'Todos os Contatos' : cat}</span>
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                      isSelected ? 'bg-slate-950/20 text-slate-950' : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}

            {/* Only Favorites Filter Pill */}
            <button
              onClick={() => setOnlyFavorites(!onlyFavorites)}
              className={`flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                onlyFavorites
                  ? 'bg-amber-400 text-slate-950 font-semibold shadow-sm'
                  : 'bg-slate-950 text-amber-400/80 hover:text-amber-300 border border-slate-800/60'
              }`}
            >
              <Star className={`w-3 h-3 ${onlyFavorites ? 'fill-slate-950' : 'fill-amber-400'}`} />
              <span>Apenas Favoritos</span>
            </button>
          </div>
        </div>

        {/* Batch Selection Floating Action Bar */}
        {selectedIds.length > 0 && (
          <div className="mb-6 p-3 rounded-xl bg-slate-900 border border-emerald-500/50 shadow-lg shadow-emerald-500/10 flex items-center justify-between gap-4 animate-fade-in">
            <div className="flex items-center gap-3">
              <span className="text-xs font-semibold text-emerald-400">
                {selectedIds.length} contato{selectedIds.length > 1 ? 's' : ''} selecionado{selectedIds.length > 1 ? 's' : ''}
              </span>
              <button
                onClick={() => handleSelectAll(false)}
                className="text-xs text-slate-400 hover:text-white underline"
              >
                Desmarcar todos
              </button>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  setDeleteDialog({
                    isOpen: true,
                    isBatch: true,
                  });
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-rose-600/20 text-rose-300 hover:bg-rose-600 hover:text-white border border-rose-600/40 transition"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Excluir Selecionados</span>
              </button>
            </div>
          </div>
        )}

        {/* Contacts Content Display */}
        {isLoading ? (
          <div className="py-20 flex flex-col items-center justify-center gap-3">
            <div className="w-8 h-8 border-3 border-emerald-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-xs text-slate-400 font-medium">Carregando contatos...</p>
          </div>
        ) : filteredAndSortedContacts.length === 0 ? (
          /* Empty State */
          <div className="py-16 px-4 text-center rounded-2xl border border-dashed border-slate-800 bg-slate-900/40 max-w-lg mx-auto">
            <div className="w-12 h-12 rounded-2xl bg-slate-800 text-slate-400 flex items-center justify-center mx-auto mb-4 border border-slate-700">
              <Search className="w-6 h-6 text-slate-500" />
            </div>
            <h3 className="text-base font-bold text-white mb-1">
              Nenhum contato encontrado
            </h3>
            <p className="text-xs text-slate-400 mb-6 max-w-xs mx-auto">
              {searchQuery || selectedCategory !== 'all' || onlyFavorites
                ? 'Nenhum resultado corresponde aos filtros selecionados. Tente limpar os filtros de busca.'
                : 'Sua lista de contatos está vazia. Comece adicionando um novo contato agora mesmo!'}
            </p>

            <div className="flex flex-wrap items-center justify-center gap-2">
              {searchQuery || selectedCategory !== 'all' || onlyFavorites ? (
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedCategory('all');
                    setOnlyFavorites(false);
                  }}
                  className="px-4 py-2 rounded-xl text-xs font-medium text-slate-300 bg-slate-800 hover:bg-slate-700 transition"
                >
                  Limpar Filtros
                </button>
              ) : null}

              <button
                onClick={() => {
                  setEditingContact(null);
                  setIsContactModalOpen(true);
                }}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-slate-950 bg-emerald-400 hover:bg-emerald-300 transition"
              >
                <Plus className="w-4 h-4" />
                <span>Adicionar Primeiro Contato</span>
              </button>
            </div>
          </div>
        ) : viewMode === 'grid' ? (
          /* Grid View */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredAndSortedContacts.map((contact) => (
              <ContactCard
                key={contact.id}
                contact={contact}
                isSelected={selectedIds.includes(contact.id)}
                onSelect={handleSelectContact}
                onToggleFavorite={handleToggleFavorite}
                onEdit={(c) => {
                  setEditingContact(c);
                  setIsContactModalOpen(true);
                }}
                onDelete={(c) => {
                  setDeleteDialog({
                    isOpen: true,
                    contact: c,
                    isBatch: false,
                  });
                }}
                onViewDetails={(c) => setViewingContact(c)}
              />
            ))}
          </div>
        ) : (
          /* Table View */
          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 bg-slate-950/60 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                    <th className="py-3 px-4 w-10">
                      <input
                        type="checkbox"
                        checked={
                          filteredAndSortedContacts.length > 0 &&
                          selectedIds.length === filteredAndSortedContacts.length
                        }
                        onChange={(e) => handleSelectAll(e.target.checked)}
                        className="w-4 h-4 rounded border-slate-700 bg-slate-800 text-emerald-500 focus:ring-emerald-500 cursor-pointer"
                      />
                    </th>
                    <th className="py-3 px-2 w-8"></th>
                    <th className="py-3 px-3">Contato</th>
                    <th className="py-3 px-3 hidden sm:table-cell">Categoria</th>
                    <th className="py-3 px-3 hidden md:table-cell">Telefone / WhatsApp</th>
                    <th className="py-3 px-3 hidden lg:table-cell">E-mail</th>
                    <th className="py-3 px-3 hidden xl:table-cell">Empresa</th>
                    <th className="py-3 px-4 text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {filteredAndSortedContacts.map((contact) => (
                    <ContactTableRow
                      key={contact.id}
                      contact={contact}
                      isSelected={selectedIds.includes(contact.id)}
                      onSelect={handleSelectContact}
                      onToggleFavorite={handleToggleFavorite}
                      onEdit={(c) => {
                        setEditingContact(c);
                        setIsContactModalOpen(true);
                      }}
                      onDelete={(c) => {
                        setDeleteDialog({
                          isOpen: true,
                          contact: c,
                          isBatch: false,
                        });
                      }}
                      onViewDetails={(c) => setViewingContact(c)}
                    />
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950 py-6 mt-12 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-300">AgendaBase</span>
            <span>•</span>
            <span>Sistema para Armazenamento de Contatos com Supabase</span>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsSupabaseGuideOpen(true)}
              className="text-emerald-400 hover:underline inline-flex items-center gap-1 font-medium"
            >
              <Database className="w-3.5 h-3.5" />
              Guia & Script SQL do Supabase
            </button>
            <span>•</span>
            <button
              onClick={() => setIsImportExportOpen(true)}
              className="text-slate-400 hover:text-slate-200 transition"
            >
              Backup / Exportar
            </button>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <ContactModal
        isOpen={isContactModalOpen}
        contact={editingContact}
        onClose={() => {
          setIsContactModalOpen(false);
          setEditingContact(null);
        }}
        onSave={handleSaveContact}
      />

      <ContactDetailModal
        contact={viewingContact}
        onClose={() => setViewingContact(null)}
        onEdit={(c) => {
          setViewingContact(null);
          setEditingContact(c);
          setIsContactModalOpen(true);
        }}
        onDelete={(c) => {
          setViewingContact(null);
          setDeleteDialog({
            isOpen: true,
            contact: c,
            isBatch: false,
          });
        }}
        onToggleFavorite={handleToggleFavorite}
      />

      <SupabaseGuideModal
        isOpen={isSupabaseGuideOpen}
        status={supabaseStatus}
        onClose={() => setIsSupabaseGuideOpen(false)}
        onRefreshContacts={loadContacts}
      />

      <ImportExportModal
        isOpen={isImportExportOpen}
        contacts={contacts}
        onClose={() => setIsImportExportOpen(false)}
        onImportContacts={handleImportContacts}
      />

      <DeleteConfirmModal
        isOpen={deleteDialog.isOpen}
        title={
          deleteDialog.isBatch
            ? `Excluir ${selectedIds.length} contatos?`
            : `Excluir contato "${deleteDialog.contact?.name}"?`
        }
        description={
          deleteDialog.isBatch
            ? 'Esta ação removerá permanentemente todos os contatos selecionados. Deseja continuar?'
            : 'Esta ação não poderá ser desfeita e removerá este contato do seu banco de dados.'
        }
        onConfirm={handleConfirmDelete}
        onClose={() => setDeleteDialog({ isOpen: false })}
        isDeleting={deleteDialog.isDeleting}
      />
    </div>
  );
}
