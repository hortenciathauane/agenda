import React, { useState } from 'react';
import {
  X,
  Database,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  RefreshCw,
  ExternalLink,
  Code2,
  KeyRound,
  Layers,
  ArrowRight,
  Upload,
} from 'lucide-react';
import { SupabaseConfigStatus } from '../types/contact';
import {
  testSupabaseConnection,
  SUPABASE_SQL_SCRIPT,
  syncLocalContactsToSupabase,
} from '../lib/supabase';

interface SupabaseGuideModalProps {
  isOpen: boolean;
  status: SupabaseConfigStatus;
  onClose: () => void;
  onRefreshContacts: () => void;
}

export const SupabaseGuideModal: React.FC<SupabaseGuideModalProps> = ({
  isOpen,
  status,
  onClose,
  onRefreshContacts,
}) => {
  const [activeTab, setActiveTab] = useState<'status' | 'sql' | 'env' | 'sync'>('status');
  const [copiedSql, setCopiedSql] = useState(false);
  const [copiedEnv, setCopiedEnv] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{
    success: boolean;
    message: string;
    tableExists: boolean;
  } | null>(null);
  const [syncing, setSyncing] = useState(false);
  const [syncMessage, setSyncMessage] = useState<{ text: string; isError: boolean } | null>(null);

  if (!isOpen) return null;

  const handleCopySql = () => {
    navigator.clipboard.writeText(SUPABASE_SQL_SCRIPT);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 2000);
  };

  const envSample = `# No arquivo .env ou Secrets do seu ambiente:
VITE_SUPABASE_URL="https://seu-projeto-id.supabase.co"
VITE_SUPABASE_ANON_KEY="sua-chave-anon-publica"`;

  const handleCopyEnv = () => {
    navigator.clipboard.writeText(envSample);
    setCopiedEnv(true);
    setTimeout(() => setCopiedEnv(false), 2000);
  };

  const handleTestConnection = async () => {
    setTesting(true);
    setTestResult(null);
    try {
      const result = await testSupabaseConnection();
      setTestResult(result);
      if (result.success) {
        onRefreshContacts();
      }
    } catch (err: any) {
      setTestResult({
        success: false,
        message: err.message || 'Falha ao testar conexão.',
        tableExists: false,
      });
    } finally {
      setTesting(false);
    }
  };

  const handleSyncData = async () => {
    setSyncing(true);
    setSyncMessage(null);
    try {
      const res = await syncLocalContactsToSupabase();
      setSyncMessage({ text: res.message, isError: !res.success });
      if (res.success) {
        onRefreshContacts();
      }
    } catch (err: any) {
      setSyncMessage({ text: err.message || 'Erro durante a sincronização.', isError: true });
    } finally {
      setSyncing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto bg-black/75 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-2xl rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl overflow-hidden my-8">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/95">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-bold border border-emerald-500/20">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                Integração Supabase
                <span
                  className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full ${
                    status.isConfigured
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                      : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                  }`}
                >
                  {status.isConfigured ? 'Ativo' : 'Offline / Local'}
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Guia de configuração, script SQL e diagnóstico de conexão
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

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-800 bg-slate-950/40 px-6">
          <button
            onClick={() => setActiveTab('status')}
            className={`py-3 px-3 text-xs font-semibold border-b-2 flex items-center gap-2 transition-colors ${
              activeTab === 'status'
                ? 'border-emerald-400 text-emerald-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <CheckCircle2 className="w-4 h-4" />
            Status & Teste
          </button>
          <button
            onClick={() => setActiveTab('sql')}
            className={`py-3 px-3 text-xs font-semibold border-b-2 flex items-center gap-2 transition-colors ${
              activeTab === 'sql'
                ? 'border-emerald-400 text-emerald-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Code2 className="w-4 h-4" />
            Script SQL
          </button>
          <button
            onClick={() => setActiveTab('env')}
            className={`py-3 px-3 text-xs font-semibold border-b-2 flex items-center gap-2 transition-colors ${
              activeTab === 'env'
                ? 'border-emerald-400 text-emerald-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <KeyRound className="w-4 h-4" />
            Variáveis de Ambiente
          </button>
          <button
            onClick={() => setActiveTab('sync')}
            className={`py-3 px-3 text-xs font-semibold border-b-2 flex items-center gap-2 transition-colors ${
              activeTab === 'sync'
                ? 'border-emerald-400 text-emerald-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Upload className="w-4 h-4" />
            Sincronização
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-6 max-h-[calc(80vh-140px)] overflow-y-auto space-y-4">
          {/* TAB 1: Status & Teste */}
          {activeTab === 'status' && (
            <div className="space-y-4">
              <div
                className={`p-4 rounded-xl border ${
                  status.isConfigured
                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                    : 'bg-amber-500/10 border-amber-500/30 text-amber-300'
                }`}
              >
                <div className="flex items-start gap-3">
                  {status.isConfigured ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                  ) : (
                    <AlertCircle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                  )}
                  <div>
                    <h3 className="text-sm font-bold text-white">
                      {status.isConfigured
                        ? 'Supabase Configurado no Ambiente'
                        : 'Modo de Armazenamento Local Ativo'}
                    </h3>
                    <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                      {status.isConfigured
                        ? `A aplicação está configurada para conectar a: ${status.url}`
                        : 'A aplicação está funcionando perfeitamente em modo local (armazenando contatos no navegador). Para conectar ao seu banco de dados PostgreSQL na nuvem do Supabase, siga os passos das abas "Script SQL" e "Variáveis de Ambiente".'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Step by step cards */}
              <div className="space-y-2.5">
                <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                  Passo a Passo Rápido
                </h4>
                
                <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/80 flex items-start gap-3 text-xs">
                  <div className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 font-bold flex items-center justify-center shrink-0">
                    1
                  </div>
                  <div>
                    <span className="font-semibold text-white block">Crie ou abra seu projeto no Supabase</span>
                    <span className="text-slate-400">
                      Acesse{' '}
                      <a
                        href="https://supabase.com/dashboard"
                        target="_blank"
                        rel="noreferrer"
                        className="text-emerald-400 hover:underline inline-flex items-center gap-1"
                      >
                        supabase.com/dashboard <ExternalLink className="w-3 h-3" />
                      </a>{' '}
                      e crie um novo projeto gratuito.
                    </span>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/80 flex items-start gap-3 text-xs">
                  <div className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 font-bold flex items-center justify-center shrink-0">
                    2
                  </div>
                  <div>
                    <span className="font-semibold text-white block">Execute o script SQL na aba "Script SQL"</span>
                    <span className="text-slate-400">
                      No menu lateral do Supabase, clique em <strong>SQL Editor</strong> &gt; <strong>New Query</strong>, cole o script e clique em <strong>Run</strong>.
                    </span>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/80 flex items-start gap-3 text-xs">
                  <div className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 font-bold flex items-center justify-center shrink-0">
                    3
                  </div>
                  <div>
                    <span className="font-semibold text-white block">Adicione as variáveis de ambiente</span>
                    <span className="text-slate-400">
                      Vá em <strong>Project Settings &gt; API</strong>, copie a <strong>Project URL</strong> e a <strong>anon public key</strong>, e defina-as no arquivo <code>.env</code>.
                    </span>
                  </div>
                </div>
              </div>

              {/* Test Connection Button */}
              <div className="pt-2">
                <button
                  onClick={handleTestConnection}
                  disabled={testing}
                  className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-semibold bg-emerald-500 hover:bg-emerald-400 text-slate-950 transition disabled:opacity-50"
                >
                  <RefreshCw className={`w-4 h-4 ${testing ? 'animate-spin' : ''}`} />
                  <span>{testing ? 'Testando Conexão...' : 'Testar Conexão com o Supabase'}</span>
                </button>

                {testResult && (
                  <div
                    className={`mt-3 p-3 rounded-xl border text-xs ${
                      testResult.success
                        ? testResult.tableExists
                          ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                          : 'bg-amber-500/10 border-amber-500/30 text-amber-300'
                        : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
                    }`}
                  >
                    <div className="flex items-center gap-2 font-semibold mb-0.5">
                      {testResult.success ? (
                        <CheckCircle2 className="w-4 h-4" />
                      ) : (
                        <AlertCircle className="w-4 h-4" />
                      )}
                      <span>
                        {testResult.success
                          ? testResult.tableExists
                            ? 'Conexão e Tabela OK!'
                            : 'Conectado! Falta criar a tabela'
                          : 'Erro na conexão'}
                      </span>
                    </div>
                    <p className="pl-6 text-slate-300">{testResult.message}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: Script SQL */}
          {activeTab === 'sql' && (
            <div className="space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h3 className="text-xs font-bold text-white flex items-center gap-2">
                    Script DDL & Políticas de Armazenamento (RLS)
                    <span className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded-full font-semibold">
                      Tabela + Storage Bucket
                    </span>
                  </h3>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Inclui criação da tabela <code>contacts</code>, índices, triggers, políticas de tabela e do bucket de armazenamento (<code>contact-avatars</code>).
                  </p>
                </div>
                <button
                  onClick={handleCopySql}
                  className="self-start sm:self-auto flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-emerald-400 text-slate-950 hover:bg-emerald-300 transition shadow-sm"
                >
                  {copiedSql ? <Check className="w-3.5 h-3.5 stroke-[2.5]" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedSql ? 'Copiado para a Área de Transferência!' : 'Copiar Script SQL Completo'}</span>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                <div className="p-2.5 rounded-lg bg-slate-950/70 border border-slate-800 flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold text-slate-200 block text-[11px]">Políticas da Tabela (RLS)</span>
                    <span className="text-slate-400 text-[10px]">SELECT, INSERT, UPDATE e DELETE granulares com suporte a autenticação e anon key.</span>
                  </div>
                </div>

                <div className="p-2.5 rounded-lg bg-slate-950/70 border border-slate-800 flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold text-slate-200 block text-[11px]">Storage de Arquivos (Bucket)</span>
                    <span className="text-slate-400 text-[10px]">Bucket <code>contact-avatars</code> com políticas de visualização pública e upload seguro.</span>
                  </div>
                </div>
              </div>

              <div className="relative">
                <pre className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-emerald-400/90 text-xs overflow-x-auto max-h-96 leading-relaxed font-mono">
                  {SUPABASE_SQL_SCRIPT}
                </pre>
              </div>
            </div>
          )}

          {/* TAB 3: Variáveis de Ambiente */}
          {activeTab === 'env' && (
            <div className="space-y-4">
              <div>
                <h3 className="text-xs font-bold text-white mb-1">Configuração do Arquivo .env</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Para que a aplicação no navegador fale diretamente com o seu Supabase, você precisa definir as seguintes variáveis de ambiente no arquivo <code>.env</code> da raiz do projeto:
                </p>
              </div>

              <div className="relative">
                <button
                  onClick={handleCopyEnv}
                  className="absolute right-3 top-3 p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 transition"
                  title="Copiar configuração"
                >
                  {copiedEnv ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
                <pre className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-emerald-300 text-xs overflow-x-auto font-mono">
                  {envSample}
                </pre>
              </div>

              <div className="space-y-2 text-xs text-slate-400 bg-slate-800/40 p-3.5 rounded-xl border border-slate-800">
                <span className="font-semibold text-slate-200 block">Onde encontrar essas chaves no Supabase:</span>
                <ol className="list-decimal list-inside space-y-1 pl-1">
                  <li>Acesse o painel do seu projeto no Supabase</li>
                  <li>Clique na engrenagem <strong>Project Settings</strong> (canto inferior esquerdo)</li>
                  <li>Clique em <strong>API</strong></li>
                  <li>Copie o campo <strong>Project URL</strong> para <code>VITE_SUPABASE_URL</code></li>
                  <li>Copie a chave do campo <strong>Project API keys &gt; anon (public)</strong> para <code>VITE_SUPABASE_ANON_KEY</code></li>
                </ol>
              </div>
            </div>
          )}

          {/* TAB 4: Sincronização */}
          {activeTab === 'sync' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-800">
                <h3 className="text-xs font-bold text-white mb-1">
                  Migrar Contatos Locais para o Supabase
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Se você cadastrou contatos enquanto estava no modo offline/local, clique no botão abaixo para enviá-los todos de uma vez para a tabela do seu banco de dados Supabase na nuvem.
                </p>

                <div className="mt-4">
                  <button
                    onClick={handleSyncData}
                    disabled={syncing || !status.isConfigured}
                    className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-semibold bg-emerald-500 hover:bg-emerald-400 text-slate-950 transition disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <Upload className={`w-4 h-4 ${syncing ? 'animate-bounce' : ''}`} />
                    <span>
                      {syncing
                        ? 'Enviando contatos...'
                        : status.isConfigured
                        ? 'Sincronizar Contatos com Supabase'
                        : 'Conecte o Supabase primeiro'}
                    </span>
                  </button>

                  {syncMessage && (
                    <div
                      className={`mt-3 p-3 rounded-lg text-xs ${
                        syncMessage.isError
                          ? 'bg-rose-500/10 text-rose-300 border border-rose-500/30'
                          : 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/30'
                      }`}
                    >
                      {syncMessage.text}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-slate-800 bg-slate-900/90 flex items-center justify-between text-xs">
          <span className="text-slate-500">
            Documentação oficial: <a href="https://supabase.com/docs" target="_blank" rel="noreferrer" className="text-emerald-400 hover:underline">supabase.com/docs</a>
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg text-xs font-medium text-slate-200 hover:bg-slate-800 transition"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};
