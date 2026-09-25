import React, { useState } from 'react';
import {
  X,
  Star,
  Mail,
  Phone,
  Building,
  Briefcase,
  FileText,
  Calendar,
  MessageSquare,
  Edit2,
  Trash2,
  Copy,
  Check,
} from 'lucide-react';
import { Contact } from '../types/contact';
import {
  formatPhoneNumber,
  formatDate,
  getInitials,
  getAvatarGradient,
  getWhatsAppUrl,
  CATEGORY_COLORS,
} from '../utils/formatters';

interface ContactDetailModalProps {
  contact: Contact | null;
  onClose: () => void;
  onEdit: (contact: Contact) => void;
  onDelete: (contact: Contact) => void;
  onToggleFavorite: (id: string, current: boolean) => void;
}

export const ContactDetailModal: React.FC<ContactDetailModalProps> = ({
  contact,
  onClose,
  onEdit,
  onDelete,
  onToggleFavorite,
}) => {
  const [copiedField, setCopiedField] = useState<string | null>(null);

  if (!contact) return null;

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 1800);
  };

  const categoryStyle = CATEGORY_COLORS[contact.category] || CATEGORY_COLORS.Outros;
  const whatsAppUrl = getWhatsAppUrl(contact.phone, contact.name);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto bg-black/70 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-lg rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl overflow-hidden my-8">
        {/* Banner / Header */}
        <div className="relative h-28 bg-gradient-to-r from-slate-800 via-slate-800/80 to-emerald-950/40 p-4 border-b border-slate-800 flex items-start justify-between">
          <div className="flex items-center gap-2">
            <span
              className={`text-xs font-semibold px-3 py-1 rounded-full border ${categoryStyle.bg} ${categoryStyle.text} ${categoryStyle.border}`}
            >
              {contact.category}
            </span>
            {contact.favorite && (
              <span className="flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400">
                <Star className="w-3.5 h-3.5 fill-amber-400" />
                Favorito
              </span>
            )}
          </div>

          <div className="flex items-center gap-1.5 bg-slate-900/60 backdrop-blur-md p-1 rounded-xl border border-slate-700/60">
            <button
              onClick={() => onToggleFavorite(contact.id, contact.favorite)}
              className={`p-1.5 rounded-lg transition-colors ${
                contact.favorite ? 'text-amber-400' : 'text-slate-400 hover:text-white'
              }`}
              title="Favoritar"
            >
              <Star className={`w-4 h-4 ${contact.favorite ? 'fill-amber-400' : ''}`} />
            </button>
            <button
              onClick={() => {
                onClose();
                onEdit(contact);
              }}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              title="Editar"
            >
              <Edit2 className="w-4 h-4" />
            </button>
            <button
              onClick={() => {
                onClose();
                onDelete(contact);
              }}
              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
              title="Excluir"
            >
              <Trash2 className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              title="Fechar"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Profile Info */}
        <div className="px-6 pb-6 pt-0 relative">
          {/* Avatar floating */}
          <div className="-mt-12 mb-4 flex items-end justify-between">
            {contact.avatar_url ? (
              <img
                src={contact.avatar_url}
                alt={contact.name}
                className="w-20 h-20 rounded-2xl object-cover border-4 border-slate-900 shadow-xl"
              />
            ) : (
              <div
                className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${getAvatarGradient(
                  contact.name
                )} border-4 border-slate-900 shadow-xl flex items-center justify-center text-white text-2xl font-extrabold`}
              >
                {getInitials(contact.name)}
              </div>
            )}
          </div>

          {/* Name, Role & Company */}
          <div className="mb-5">
            <h2 className="text-xl font-bold text-white">{contact.name}</h2>
            {(contact.role || contact.company) && (
              <p className="text-sm text-slate-400 flex items-center gap-1.5 mt-0.5">
                {contact.role && <span>{contact.role}</span>}
                {contact.role && contact.company && <span>em</span>}
                {contact.company && <span className="font-medium text-slate-300">{contact.company}</span>}
              </p>
            )}
          </div>

          {/* Quick Communication Action Strip */}
          <div className="grid grid-cols-3 gap-2.5 mb-6">
            {contact.phone ? (
              <a
                href={whatsAppUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-col items-center justify-center gap-1 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20 transition group"
              >
                <MessageSquare className="w-5 h-5 group-hover:scale-110 transition-transform" />
                <span className="text-xs font-semibold">WhatsApp</span>
              </a>
            ) : (
              <div className="flex flex-col items-center justify-center gap-1 p-3 rounded-xl bg-slate-800/40 border border-slate-800 text-slate-600 cursor-not-allowed">
                <MessageSquare className="w-5 h-5" />
                <span className="text-xs">WhatsApp</span>
              </div>
            )}

            {contact.phone ? (
              <a
                href={`tel:${contact.phone}`}
                className="flex flex-col items-center justify-center gap-1 p-3 rounded-xl bg-slate-800 border border-slate-700 text-slate-200 hover:bg-slate-700 hover:text-white transition group"
              >
                <Phone className="w-5 h-5 text-blue-400 group-hover:scale-110 transition-transform" />
                <span className="text-xs font-semibold">Ligar</span>
              </a>
            ) : (
              <div className="flex flex-col items-center justify-center gap-1 p-3 rounded-xl bg-slate-800/40 border border-slate-800 text-slate-600 cursor-not-allowed">
                <Phone className="w-5 h-5" />
                <span className="text-xs">Ligar</span>
              </div>
            )}

            {contact.email ? (
              <a
                href={`mailto:${contact.email}`}
                className="flex flex-col items-center justify-center gap-1 p-3 rounded-xl bg-slate-800 border border-slate-700 text-slate-200 hover:bg-slate-700 hover:text-white transition group"
              >
                <Mail className="w-5 h-5 text-purple-400 group-hover:scale-110 transition-transform" />
                <span className="text-xs font-semibold">E-mail</span>
              </a>
            ) : (
              <div className="flex flex-col items-center justify-center gap-1 p-3 rounded-xl bg-slate-800/40 border border-slate-800 text-slate-600 cursor-not-allowed">
                <Mail className="w-5 h-5" />
                <span className="text-xs">E-mail</span>
              </div>
            )}
          </div>

          {/* Details List */}
          <div className="space-y-3 bg-slate-950/50 p-4 rounded-xl border border-slate-800/80 text-xs">
            {/* Phone */}
            <div className="flex items-center justify-between py-1 border-b border-slate-800/60">
              <div className="flex items-center gap-2.5 text-slate-400">
                <Phone className="w-4 h-4 text-slate-500" />
                <span>Telefone</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-medium text-slate-200">
                  {contact.phone ? formatPhoneNumber(contact.phone) : 'Não informado'}
                </span>
                {contact.phone && (
                  <button
                    onClick={() => copyToClipboard(contact.phone!, 'phone')}
                    className="p-1 text-slate-500 hover:text-slate-300 transition"
                    title="Copiar telefone"
                  >
                    {copiedField === 'phone' ? (
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
                )}
              </div>
            </div>

            {/* Email */}
            <div className="flex items-center justify-between py-1 border-b border-slate-800/60">
              <div className="flex items-center gap-2.5 text-slate-400">
                <Mail className="w-4 h-4 text-slate-500" />
                <span>E-mail</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-medium text-slate-200 truncate max-w-[200px]">
                  {contact.email || 'Não informado'}
                </span>
                {contact.email && (
                  <button
                    onClick={() => copyToClipboard(contact.email!, 'email')}
                    className="p-1 text-slate-500 hover:text-slate-300 transition"
                    title="Copiar e-mail"
                  >
                    {copiedField === 'email' ? (
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
                )}
              </div>
            </div>

            {/* Company & Role */}
            <div className="flex items-center justify-between py-1 border-b border-slate-800/60">
              <div className="flex items-center gap-2.5 text-slate-400">
                <Building className="w-4 h-4 text-slate-500" />
                <span>Empresa / Cargo</span>
              </div>
              <span className="font-medium text-slate-200">
                {contact.company ? `${contact.company} ${contact.role ? `(${contact.role})` : ''}` : 'Não informado'}
              </span>
            </div>

            {/* Notes */}
            {contact.notes && (
              <div className="pt-2">
                <div className="flex items-center gap-2 text-slate-400 mb-1">
                  <FileText className="w-4 h-4 text-slate-500" />
                  <span>Observações:</span>
                </div>
                <p className="text-slate-300 text-xs pl-6 whitespace-pre-wrap leading-relaxed">
                  {contact.notes}
                </p>
              </div>
            )}

            {/* Created and updated timestamps */}
            <div className="pt-2 flex items-center justify-between text-[11px] text-slate-500 border-t border-slate-800/60">
              <div className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5" />
                <span>Cadastrado em {formatDate(contact.created_at)}</span>
              </div>
              {contact.updated_at && (
                <span>Atualizado em {formatDate(contact.updated_at)}</span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
