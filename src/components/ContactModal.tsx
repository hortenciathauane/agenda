import React, { useState, useEffect, useRef } from 'react';
import { X, User, Mail, Phone, Building, Briefcase, FileText, Star, Image, Check, Upload, Trash2 } from 'lucide-react';
import { Contact, ContactCategory } from '../types/contact';
import { cleanPhoneNumber, formatPhoneNumber, CATEGORY_COLORS } from '../utils/formatters';
import { uploadContactAvatar } from '../lib/supabase';

interface ContactModalProps {
  isOpen: boolean;
  contact?: Contact | null;
  onClose: () => void;
  onSave: (contactData: Omit<Contact, 'id' | 'created_at' | 'updated_at'>) => Promise<void>;
}

const CATEGORIES: ContactCategory[] = [
  'Clientes',
  'Trabalho',
  'Parceiros',
  'Fornecedores',
  'Família',
  'Amigos',
  'Outros',
];

export const ContactModal: React.FC<ContactModalProps> = ({
  isOpen,
  contact,
  onClose,
  onSave,
}) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [company, setCompany] = useState('');
  const [role, setRole] = useState('');
  const [category, setCategory] = useState<ContactCategory>('Clientes');
  const [notes, setNotes] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [favorite, setFavorite] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleAvatarFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setErrorMessage('Por favor, selecione um arquivo de imagem válido (JPG, PNG, WebP).');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setErrorMessage('A imagem selecionada excede o limite de 5MB do Storage.');
      return;
    }

    try {
      setIsUploadingAvatar(true);
      setErrorMessage('');
      const res = await uploadContactAvatar(file);
      if (res.success && res.publicUrl) {
        setAvatarUrl(res.publicUrl);
      } else {
        setErrorMessage(res.error || 'Falha ao fazer upload da imagem.');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Erro durante o upload.');
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  // Populate data when modal opens
  useEffect(() => {
    if (contact) {
      setName(contact.name || '');
      setEmail(contact.email || '');
      setPhone(contact.phone ? formatPhoneNumber(contact.phone) : '');
      setCompany(contact.company || '');
      setRole(contact.role || '');
      setCategory(contact.category || 'Clientes');
      setNotes(contact.notes || '');
      setAvatarUrl(contact.avatar_url || '');
      setFavorite(Boolean(contact.favorite));
    } else {
      setName('');
      setEmail('');
      setPhone('');
      setCompany('');
      setRole('');
      setCategory('Clientes');
      setNotes('');
      setAvatarUrl('');
      setFavorite(false);
    }
    setErrorMessage('');
  }, [contact, isOpen]);

  if (!isOpen) return null;

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    const cleaned = cleanPhoneNumber(raw);
    if (cleaned.length <= 11) {
      setPhone(formatPhoneNumber(cleaned));
    } else {
      setPhone(raw);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setErrorMessage('O nome do contato é obrigatório.');
      return;
    }

    try {
      setIsSubmitting(true);
      setErrorMessage('');

      await onSave({
        name: name.trim(),
        email: email.trim() || null,
        phone: cleanPhoneNumber(phone) || null,
        company: company.trim() || null,
        role: role.trim() || null,
        category,
        notes: notes.trim() || null,
        avatar_url: avatarUrl.trim() || null,
        favorite,
      });

      onClose();
    } catch (err: any) {
      setErrorMessage(err.message || 'Ocorreu um erro ao salvar o contato.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto bg-black/70 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-xl rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl overflow-hidden my-8">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/90">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-bold">
              <User className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">
                {contact ? 'Editar Contato' : 'Adicionar Novo Contato'}
              </h2>
              <p className="text-xs text-slate-400">
                {contact
                  ? 'Atualize as informações do contato'
                  : 'Preencha os dados para salvar no banco de dados'}
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

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[calc(85vh-130px)] overflow-y-auto">
          {errorMessage && (
            <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs">
              {errorMessage}
            </div>
          )}

          {/* Nome Completo */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Nome Completo <span className="text-emerald-400">*</span>
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex: Ana Beatriz Silveira"
                className="w-full pl-9 pr-3 py-2 text-sm rounded-xl bg-slate-800/80 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition"
              />
            </div>
          </div>

          {/* Categoria */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-2">
              Categoria do Contato
            </label>
            <div className="flex flex-wrap gap-1.5">
              {CATEGORIES.map((cat) => {
                const isSelected = category === cat;
                const style = CATEGORY_COLORS[cat] || CATEGORY_COLORS.Outros;
                return (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setCategory(cat)}
                    className={`text-xs px-3 py-1.5 rounded-lg border font-medium transition-all ${
                      isSelected
                        ? `${style.bg} ${style.text} ${style.border} ring-1 ring-emerald-400/30 font-semibold shadow-sm`
                        : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-slate-200'
                    }`}
                  >
                    {cat}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Telefone & E-mail */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Telefone / WhatsApp
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={phone}
                  onChange={handlePhoneChange}
                  placeholder="(11) 98765-4321"
                  className="w-full pl-9 pr-3 py-2 text-sm rounded-xl bg-slate-800/80 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                E-mail
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="exemplo@email.com"
                  className="w-full pl-9 pr-3 py-2 text-sm rounded-xl bg-slate-800/80 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition"
                />
              </div>
            </div>
          </div>

          {/* Empresa & Cargo */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Empresa / Organização
              </label>
              <div className="relative">
                <Building className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  placeholder="Ex: Google, Supabase, etc."
                  className="w-full pl-9 pr-3 py-2 text-sm rounded-xl bg-slate-800/80 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Cargo / Profissão
              </label>
              <div className="relative">
                <Briefcase className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  placeholder="Ex: Diretor Comercial, Desenvolvedor"
                  className="w-full pl-9 pr-3 py-2 text-sm rounded-xl bg-slate-800/80 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition"
                />
              </div>
            </div>
          </div>

          {/* Foto / Avatar com Upload para Supabase Storage */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-slate-300">
                Foto / Avatar do Contato
              </label>
              <span className="text-[11px] text-emerald-400 font-medium">
                Supabase Storage (contact-avatars)
              </span>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2.5">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleAvatarFileSelect}
                  accept="image/jpeg,image/png,image/webp,image/gif,image/svg+xml"
                  className="hidden"
                />

                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploadingAvatar}
                  className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition disabled:opacity-50"
                >
                  <Upload className={`w-4 h-4 ${isUploadingAvatar ? 'animate-bounce text-emerald-400' : 'text-slate-400'}`} />
                  <span>{isUploadingAvatar ? 'Enviando ao Storage...' : 'Upload de Foto'}</span>
                </button>

                <div className="relative flex-1">
                  <Image className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="url"
                    value={avatarUrl}
                    onChange={(e) => setAvatarUrl(e.target.value)}
                    placeholder="Ou cole a URL da imagem..."
                    className="w-full pl-9 pr-8 py-2 text-xs rounded-xl bg-slate-800/80 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition"
                  />
                  {avatarUrl && (
                    <button
                      type="button"
                      onClick={() => setAvatarUrl('')}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-rose-400"
                      title="Remover foto"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {avatarUrl && (
                  <img
                    src={avatarUrl}
                    alt="Preview"
                    className="w-10 h-10 rounded-xl object-cover border border-slate-700 shrink-0"
                    onError={(e) => {
                      (e.target as HTMLElement).style.display = 'none';
                    }}
                  />
                )}
              </div>

              <span className="text-[11px] text-slate-500 block">
                Envie uma imagem (JPG, PNG, WebP) de até 5MB ou insira um link externo.
              </span>
            </div>
          </div>

          {/* Notas / Observações */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Notas e Observações
            </label>
            <div className="relative">
              <FileText className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
              <textarea
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Detalhes adicionais, preferências, histórico ou endereço..."
                className="w-full pl-9 pr-3 py-2 text-sm rounded-xl bg-slate-800/80 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition resize-none"
              />
            </div>
          </div>

          {/* Toggle Favorito */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-800/50 border border-slate-800">
            <div className="flex items-center gap-2.5">
              <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-400">
                <Star className={`w-4 h-4 ${favorite ? 'fill-amber-400' : ''}`} />
              </div>
              <div>
                <span className="text-xs font-semibold text-white block">
                  Marcar como Favorito
                </span>
                <span className="text-[11px] text-slate-400">
                  Destaque este contato na lista principal
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setFavorite(!favorite)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                favorite ? 'bg-amber-400' : 'bg-slate-700'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-slate-950 transition-transform ${
                  favorite ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          {/* Footer Buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-800 transition"
            >
              Cancelar
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-1.5 px-5 py-2 rounded-xl text-xs font-semibold text-slate-950 bg-emerald-400 hover:bg-emerald-300 disabled:opacity-50 active:scale-95 transition shadow-lg shadow-emerald-500/25"
            >
              {isSubmitting ? (
                <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
              ) : (
                <Check className="w-4 h-4 stroke-[2.5]" />
              )}
              <span>{contact ? 'Salvar Alterações' : 'Criar Contato'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
