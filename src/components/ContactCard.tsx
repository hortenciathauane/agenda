import React, { useState } from 'react';
import {
  Star,
  Mail,
  Phone,
  Building,
  MoreVertical,
  Edit2,
  Trash2,
  ExternalLink,
  Copy,
  Check,
  MessageSquare,
} from 'lucide-react';
import { Contact } from '../types/contact';
import {
  formatPhoneNumber,
  getInitials,
  getAvatarGradient,
  getWhatsAppUrl,
  CATEGORY_COLORS,
} from '../utils/formatters';

interface ContactCardProps {
  contact: Contact;
  isSelected: boolean;
  onSelect: (id: string, selected: boolean) => void;
  onToggleFavorite: (id: string, current: boolean) => void;
  onEdit: (contact: Contact) => void;
  onDelete: (contact: Contact) => void;
  onViewDetails: (contact: Contact) => void;
}

export const ContactCard: React.FC<ContactCardProps> = ({
  contact,
  isSelected,
  onSelect,
  onToggleFavorite,
  onEdit,
  onDelete,
  onViewDetails,
}) => {
  const [copiedField, setCopiedField] = useState<'phone' | 'email' | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);

  const copyToClipboard = (text: string, field: 'phone' | 'email', e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 1800);
  };

  const categoryStyle = CATEGORY_COLORS[contact.category] || CATEGORY_COLORS.Outros;
  const whatsAppUrl = getWhatsAppUrl(contact.phone, contact.name);

  return (
    <div
      onClick={() => onViewDetails(contact)}
      className={`group relative flex flex-col justify-between p-4 rounded-xl border transition-all duration-200 cursor-pointer ${
        isSelected
          ? 'bg-slate-800/90 border-emerald-500 shadow-md shadow-emerald-500/10 ring-1 ring-emerald-500'
          : 'bg-slate-900/80 border-slate-800 hover:border-slate-700 hover:bg-slate-800/60 hover:shadow-lg hover:shadow-slate-950/40'
      }`}
    >
      {/* Top row: Checkbox, Category Badge, Favorite & Menu */}
      <div>
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
            <input
              type="checkbox"
              checked={isSelected}
              onChange={(e) => onSelect(contact.id, e.target.checked)}
              className="w-4 h-4 rounded border-slate-700 bg-slate-800 text-emerald-500 focus:ring-emerald-500 focus:ring-offset-slate-900 cursor-pointer transition"
            />
            <span
              className={`text-[11px] font-medium px-2.5 py-0.5 rounded-full border ${categoryStyle.bg} ${categoryStyle.text} ${categoryStyle.border}`}
            >
              {contact.category}
            </span>
          </div>

          <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => onToggleFavorite(contact.id, contact.favorite)}
              className={`p-1.5 rounded-lg transition-colors ${
                contact.favorite
                  ? 'text-amber-400 hover:text-amber-300'
                  : 'text-slate-500 hover:text-slate-300'
              }`}
              title={contact.favorite ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
            >
              <Star className={`w-4 h-4 ${contact.favorite ? 'fill-amber-400' : ''}`} />
            </button>

            {/* Quick action menu */}
            <div className="relative">
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                title="Opções"
              >
                <MoreVertical className="w-4 h-4" />
              </button>

              {menuOpen && (
                <>
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setMenuOpen(false)}
                  />
                  <div className="absolute right-0 mt-1 w-36 rounded-lg bg-slate-800 border border-slate-700 shadow-xl py-1 z-20">
                    <button
                      onClick={() => {
                        setMenuOpen(false);
                        onEdit(contact);
                      }}
                      className="w-full text-left px-3 py-1.5 text-xs text-slate-200 hover:bg-slate-700 flex items-center gap-2"
                    >
                      <Edit2 className="w-3.5 h-3.5 text-slate-400" />
                      Editar
                    </button>
                    <button
                      onClick={() => {
                        setMenuOpen(false);
                        onDelete(contact);
                      }}
                      className="w-full text-left px-3 py-1.5 text-xs text-rose-400 hover:bg-rose-500/10 flex items-center gap-2"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      Excluir
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* User Identity Header */}
        <div className="flex items-start gap-3 mb-3">
          {contact.avatar_url ? (
            <img
              src={contact.avatar_url}
              alt={contact.name}
              className="w-12 h-12 rounded-xl object-cover border border-slate-700 shrink-0"
              onError={(e) => {
                // Fallback to initials if image link breaks
                (e.target as HTMLElement).style.display = 'none';
              }}
            />
          ) : (
            <div
              className={`w-12 h-12 rounded-xl bg-gradient-to-br ${getAvatarGradient(
                contact.name
              )} flex items-center justify-center text-white font-bold text-base shadow-sm shrink-0 border border-white/10`}
            >
              {getInitials(contact.name)}
            </div>
          )}

          <div className="min-w-0 flex-1">
            <h3 className="text-sm font-semibold text-white truncate group-hover:text-emerald-400 transition-colors">
              {contact.name}
            </h3>
            {(contact.role || contact.company) && (
              <div className="flex items-center gap-1.5 text-xs text-slate-400 mt-0.5 truncate">
                <Building className="w-3 h-3 text-slate-500 shrink-0" />
                <span className="truncate">
                  {contact.role ? `${contact.role}` : ''}
                  {contact.role && contact.company ? ' • ' : ''}
                  {contact.company ? `${contact.company}` : ''}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Contact Information (Phone, Email) */}
        <div className="space-y-1.5 text-xs text-slate-300">
          {contact.phone && (
            <div className="flex items-center justify-between group/line">
              <a
                href={`tel:${contact.phone}`}
                onClick={(e) => e.stopPropagation()}
                className="flex items-center gap-2 text-slate-300 hover:text-emerald-400 truncate"
              >
                <Phone className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                <span className="truncate">{formatPhoneNumber(contact.phone)}</span>
              </a>
              <button
                onClick={(e) => copyToClipboard(contact.phone!, 'phone', e)}
                className="opacity-0 group-hover/line:opacity-100 p-1 text-slate-400 hover:text-white transition-opacity"
                title="Copiar telefone"
              >
                {copiedField === 'phone' ? (
                  <Check className="w-3 h-3 text-emerald-400" />
                ) : (
                  <Copy className="w-3 h-3" />
                )}
              </button>
            </div>
          )}

          {contact.email && (
            <div className="flex items-center justify-between group/line">
              <a
                href={`mailto:${contact.email}`}
                onClick={(e) => e.stopPropagation()}
                className="flex items-center gap-2 text-slate-300 hover:text-emerald-400 truncate"
              >
                <Mail className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                <span className="truncate">{contact.email}</span>
              </a>
              <button
                onClick={(e) => copyToClipboard(contact.email!, 'email', e)}
                className="opacity-0 group-hover/line:opacity-100 p-1 text-slate-400 hover:text-white transition-opacity"
                title="Copiar e-mail"
              >
                {copiedField === 'email' ? (
                  <Check className="w-3 h-3 text-emerald-400" />
                ) : (
                  <Copy className="w-3 h-3" />
                )}
              </button>
            </div>
          )}

          {contact.notes && (
            <p className="text-[11px] text-slate-400 line-clamp-1 italic pt-1 border-t border-slate-800/80">
              "{contact.notes}"
            </p>
          )}
        </div>
      </div>

      {/* Bottom Quick Action Bar */}
      <div
        className="mt-3 pt-3 border-t border-slate-800/90 flex items-center justify-between gap-1.5"
        onClick={(e) => e.stopPropagation()}
      >
        {/* WhatsApp Button */}
        {contact.phone ? (
          <a
            href={whatsAppUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 hover:text-emerald-300 border border-emerald-500/20 text-xs font-medium transition-all"
            title="Conversar no WhatsApp"
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>WhatsApp</span>
          </a>
        ) : (
          <div className="flex-1 py-1.5 px-2 text-center text-[11px] text-slate-600 bg-slate-800/40 rounded-lg">
            Sem telefone
          </div>
        )}

        {/* Call button */}
        {contact.phone && (
          <a
            href={`tel:${contact.phone}`}
            className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white border border-slate-700/60 transition-colors"
            title="Ligar"
          >
            <Phone className="w-3.5 h-3.5" />
          </a>
        )}

        {/* Email button */}
        {contact.email && (
          <a
            href={`mailto:${contact.email}`}
            className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white border border-slate-700/60 transition-colors"
            title="Enviar e-mail"
          >
            <Mail className="w-3.5 h-3.5" />
          </a>
        )}

        {/* View Details Icon */}
        <button
          onClick={() => onViewDetails(contact)}
          className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-emerald-400 border border-slate-700/60 transition-colors"
          title="Ver perfil completo"
        >
          <ExternalLink className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
