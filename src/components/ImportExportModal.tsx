import React, { useState } from 'react';
import { X, Download, Upload, FileSpreadsheet, FileJson, Check, AlertCircle } from 'lucide-react';
import { Contact, ContactCategory } from '../types/contact';
import { cleanPhoneNumber } from '../utils/formatters';

interface ImportExportModalProps {
  isOpen: boolean;
  contacts: Contact[];
  onClose: () => void;
  onImportContacts: (imported: Array<Omit<Contact, 'id' | 'created_at' | 'updated_at'>>) => Promise<number>;
}

export const ImportExportModal: React.FC<ImportExportModalProps> = ({
  isOpen,
  contacts,
  onClose,
  onImportContacts,
}) => {
  const [activeTab, setActiveTab] = useState<'export' | 'import'>('export');
  const [importStatus, setImportStatus] = useState<{ success?: boolean; message?: string } | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  if (!isOpen) return null;

  // Export as CSV
  const handleExportCSV = () => {
    const headers = ['Nome', 'Email', 'Telefone', 'Empresa', 'Cargo', 'Categoria', 'Notas', 'Favorito'];
    const rows = contacts.map((c) => [
      `"${(c.name || '').replace(/"/g, '""')}"`,
      `"${(c.email || '').replace(/"/g, '""')}"`,
      `"${(c.phone || '').replace(/"/g, '""')}"`,
      `"${(c.company || '').replace(/"/g, '""')}"`,
      `"${(c.role || '').replace(/"/g, '""')}"`,
      `"${(c.category || 'Outros').replace(/"/g, '""')}"`,
      `"${(c.notes || '').replace(/"/g, '""')}"`,
      c.favorite ? 'Sim' : 'Nao',
    ]);

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `contatos_export_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Export as JSON
  const handleExportJSON = () => {
    const jsonString = JSON.stringify(contacts, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `contatos_backup_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Handle file import (JSON or CSV)
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsProcessing(true);
    setImportStatus(null);

    const reader = new FileReader();

    reader.onload = async (event) => {
      try {
        const text = event.target?.result as string;

        if (file.name.endsWith('.json')) {
          const parsed = JSON.parse(text);
          if (!Array.isArray(parsed)) {
            throw new Error('O arquivo JSON deve conter uma lista de contatos.');
          }

          const validContacts = parsed.map((item: any) => ({
            name: String(item.name || 'Sem Nome'),
            email: item.email ? String(item.email) : null,
            phone: item.phone ? cleanPhoneNumber(String(item.phone)) : null,
            company: item.company ? String(item.company) : null,
            role: item.role ? String(item.role) : null,
            category: (item.category as ContactCategory) || 'Outros',
            notes: item.notes ? String(item.notes) : null,
            avatar_url: item.avatar_url ? String(item.avatar_url) : null,
            favorite: Boolean(item.favorite),
          }));

          const count = await onImportContacts(validContacts);
          setImportStatus({
            success: true,
            message: `${count} contatos importados com sucesso!`,
          });
        } else {
          // CSV parser
          const lines = text.split(/\r?\n/).filter((l) => l.trim().length > 0);
          if (lines.length <= 1) {
            throw new Error('O arquivo CSV está vazio ou contém apenas o cabeçalho.');
          }

          const parsedList: Array<Omit<Contact, 'id' | 'created_at' | 'updated_at'>> = [];

          // Skip header row
          for (let i = 1; i < lines.length; i++) {
            // Regex to handle quoted CSV items
            const parts = lines[i].match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g) || lines[i].split(',');
            if (parts.length > 0) {
              const clean = (val?: string) => val ? val.replace(/^"|"$/g, '').trim() : '';
              const name = clean(parts[0]);
              if (name) {
                parsedList.push({
                  name,
                  email: clean(parts[1]) || null,
                  phone: cleanPhoneNumber(clean(parts[2])) || null,
                  company: clean(parts[3]) || null,
                  role: clean(parts[4]) || null,
                  category: (clean(parts[5]) as ContactCategory) || 'Outros',
                  notes: clean(parts[6]) || null,
                  avatar_url: null,
                  favorite: clean(parts[7]).toLowerCase() === 'sim' || clean(parts[7]).toLowerCase() === 'true',
                });
              }
            }
          }

          const count = await onImportContacts(parsedList);
          setImportStatus({
            success: true,
            message: `${count} contatos importados do CSV com sucesso!`,
          });
        }
      } catch (err: any) {
        setImportStatus({
          success: false,
          message: err.message || 'Falha ao processar arquivo.',
        });
      } finally {
        setIsProcessing(false);
      }
    };

    reader.readAsText(file);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto bg-black/70 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-lg rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl overflow-hidden my-8">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/90">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-bold">
              <Download className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Importar & Exportar</h2>
              <p className="text-xs text-slate-400">
                Faça backup ou importe contatos em CSV ou JSON
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selection */}
        <div className="flex border-b border-slate-800 bg-slate-950/40 px-6">
          <button
            onClick={() => setActiveTab('export')}
            className={`py-3 px-4 text-xs font-semibold border-b-2 flex items-center gap-2 transition-colors ${
              activeTab === 'export'
                ? 'border-emerald-400 text-emerald-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Download className="w-4 h-4" />
            Exportar Contatos ({contacts.length})
          </button>
          <button
            onClick={() => setActiveTab('import')}
            className={`py-3 px-4 text-xs font-semibold border-b-2 flex items-center gap-2 transition-colors ${
              activeTab === 'import'
                ? 'border-emerald-400 text-emerald-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Upload className="w-4 h-4" />
            Importar Arquivo
          </button>
        </div>

        <div className="p-6">
          {activeTab === 'export' && (
            <div className="space-y-4">
              <p className="text-xs text-slate-300">
                Escolha o formato no qual deseja baixar seus <strong>{contacts.length}</strong> contatos:
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* CSV */}
                <button
                  onClick={handleExportCSV}
                  className="flex flex-col items-start p-4 rounded-xl border border-slate-700 bg-slate-800/60 hover:bg-slate-800 hover:border-emerald-500/50 transition group text-left"
                >
                  <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 mb-2 group-hover:scale-110 transition-transform">
                    <FileSpreadsheet className="w-5 h-5" />
                  </div>
                  <span className="text-sm font-semibold text-white">Planilha CSV</span>
                  <span className="text-xs text-slate-400 mt-0.5">
                    Compatível com Excel, Google Planilhas e Outlook
                  </span>
                </button>

                {/* JSON */}
                <button
                  onClick={handleExportJSON}
                  className="flex flex-col items-start p-4 rounded-xl border border-slate-700 bg-slate-800/60 hover:bg-slate-800 hover:border-blue-500/50 transition group text-left"
                >
                  <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400 mb-2 group-hover:scale-110 transition-transform">
                    <FileJson className="w-5 h-5" />
                  </div>
                  <span className="text-sm font-semibold text-white">Backup JSON</span>
                  <span className="text-xs text-slate-400 mt-0.5">
                    Backup completo com todos os campos e metadados
                  </span>
                </button>
              </div>
            </div>
          )}

          {activeTab === 'import' && (
            <div className="space-y-4">
              <p className="text-xs text-slate-300">
                Selecione um arquivo <strong>.csv</strong> ou <strong>.json</strong> para adicionar os contatos ao seu sistema:
              </p>

              <div className="relative border-2 border-dashed border-slate-700 hover:border-emerald-500/60 rounded-xl p-6 text-center transition cursor-pointer bg-slate-800/30">
                <input
                  type="file"
                  accept=".csv,.json"
                  onChange={handleFileUpload}
                  disabled={isProcessing}
                  className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                />
                <Upload className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                <span className="text-xs font-semibold text-white block">
                  Clique ou arraste seu arquivo aqui
                </span>
                <span className="text-[11px] text-slate-400 mt-1 block">
                  Formatos aceitos: CSV e JSON
                </span>
              </div>

              {isProcessing && (
                <div className="text-center py-2 text-xs text-slate-400">
                  Processando arquivo e salvando contatos...
                </div>
              )}

              {importStatus && (
                <div
                  className={`p-3 rounded-xl border text-xs flex items-center gap-2 ${
                    importStatus.success
                      ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                      : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
                  }`}
                >
                  {importStatus.success ? (
                    <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                  )}
                  <span>{importStatus.message}</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-800 bg-slate-900/90 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-800 transition"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};
