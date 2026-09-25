import React, { useState } from 'react';
import { Star, Mail, Phone, Edit2, Trash2, ExternalLink, MessageSquare, Copy, Check } from 'lucide-react';
import { Contact } from '../types/contact';
import {
  formatPhoneNumber,
  getInitials,
  getAvatarGradient,
  getWhatsAppUrl,
  CATEGORY_COLORS,
} from '../utils/formatters';

interface ContactTableRowProps {
  contact: Contact;
  isSelected: boolean;
  onSelect: (id: string, selected: boolean) => void;
  onToggleFavorite: (id: string, current: boolean) => void;
  onEdit: (contact: Contact) => void;
  onDelete: (contact: Contact) => void;
  onViewDetails: (contact: Contact) => void;
}

export const ContactTableRow: React.FC<ContactTableRowProps> = ({
  contact,
  isSelected,
  onSelect,
  onToggleFavorite,
  onEdit,
  onDelete,
  onViewDetails,
}) => {
  const [copiedField, setCopiedField] = useState<'phone' | 'email' | null>(null);

  const copyToClipboard = (text: string, field: 'phone' | 'email', e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 1800);
  };

  const categoryStyle = CATEGORY_COLORS[contact.category] || CATEGORY_COLORS.Outros;
  const whatsAppUrl = getWhatsAppUrl(contact.phone, contact.name);

  return (
    <tr
      onClick={() => onViewDetails(contact)}
      className={`border-b border-slate-800/80 transition-colors cursor-pointer group ${
        isSelected
          ? 'bg-emerald-950/20'
          : 'hover:bg-slate-800/50'
      }`}
    >
      {/* Checkbox */}
      <td className="py-3 px-4 w-10" onClick={(e) => e.stopPropagation()}>
        <input
          type="checkbox"
          checked={isSelected}
          onChange={(e) => onSelect(contact.id, e.target.checked)}
          className="w-4 h-4 rounded border-slate-700 bg-slate-800 text-emerald-500 focus:ring-emerald-500 focus:ring-offset-slate-900 cursor-pointer"
        />
      </td>

      {/* Favorite */}
      <td className="py-3 px-2 w-8" onClick={(e) => e.stopPropagation()}>
        <button
          onClick={() => onToggleFavorite(contact.id, contact.favorite)}
          className={`p-1 rounded transition-colors ${
            contact.favorite ? 'text-amber-400' : 'text-slate-600 hover:text-slate-400'
          }`}
          title={contact.favorite ? 'Favoritado' : 'Marcar favorito'}
        >
          <Star className={`w-4 h-4 ${contact.favorite ? 'fill-amber-400' : ''}`} />
        </button>
      </td>

      {/* Name and Avatar */}
      <td className="py-3 px-3">
        <div className="flex items-center gap-3">
          {contact.avatar_url ? (
            <img
              src={contact.avatar_url}
              alt={contact.name}
              className="w-9 h-9 rounded-lg object-cover border border-slate-700 shrink-0"
              onError={(e) => {
                (e.target as HTMLElement).style.display = 'none';
              }}
            />
          ) : (
            <div
              className={`w-9 h-9 rounded-lg bg-gradient-to-br ${getAvatarGradient(
                contact.name
              )} flex items-center justify-center text-white font-bold text-xs shrink-0`}
            >
              {getInitials(contact.name)}
            </div>
          )}
          <div className="min-w-0">
            <span className="font-semibold text-slate-100 group-hover:text-emerald-400 transition-colors block truncate">
              {contact.name}
            </span>
            {contact.role && (
              <span className="text-xs text-slate-400 truncate block">
                {contact.role}
              </span>
            )}
          </div>
        </div>
      </td>

      {/* Category */}
      <td className="py-3 px-3 hidden sm:table-cell">
        <span
          className={`inline-block text-[11px] font-medium px-2.5 py-0.5 rounded-full border ${categoryStyle.bg} ${categoryStyle.text} ${categoryStyle.border}`}
        >
          {contact.category}
        </span>
      </td>

      {/* Phone / WhatsApp */}
      <td className="py-3 px-3 hidden md:table-cell">
        {contact.phone ? (
          <div className="flex items-center gap-2 group/phone">
            <span className="text-xs text-slate-300">
              {formatPhoneNumber(contact.phone)}
            </span>
            <div className="flex items-center gap-1 opacity-0 group-hover/phone:opacity-100 transition-opacity" onClick={(e) => e.stopPropagation()}>
              <a
                href={whatsAppUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="p-1 rounded text-emerald-400 hover:bg-emerald-500/20"
                title="WhatsApp"
              >
                <MessageSquare className="w-3.5 h-3.5" />
              </a>
              <button
                onClick={(e) => copyToClipboard(contact.phone!, 'phone', e)}
                className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-700"
                title="Copiar telefone"
              >
                {copiedField === 'phone' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
              </button>
            </div>
          </div>
        ) : (
          <span className="text-xs text-slate-600">-</span>
        )}
      </td>

      {/* Email */}
      <td className="py-3 px-3 hidden lg:table-cell">
        {contact.email ? (
          <div className="flex items-center gap-2 group/mail">
            <a
              href={`mailto:${contact.email}`}
              onClick={(e) => e.stopPropagation()}
              className="text-xs text-slate-300 hover:text-emerald-400 truncate max-w-[180px] block"
            >
              {contact.email}
            </a>
            <button
              onClick={(e) => copyToClipboard(contact.email!, 'email', e)}
              className="opacity-0 group-hover/mail:opacity-100 p-1 text-slate-400 hover:text-white"
              title="Copiar e-mail"
            >
              {copiedField === 'email' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
            </button>
          </div>
        ) : (
          <span className="text-xs text-slate-600">-</span>
        )}
      </td>

      {/* Company */}
      <td className="py-3 px-3 hidden xl:table-cell">
        <span className="text-xs text-slate-300 truncate block max-w-[140px]">
          {contact.company || '-'}
        </span>
      </td>

      {/* Actions */}
      <td className="py-3 px-4 text-right" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-end gap-1">
          <button
            onClick={() => onEdit(contact)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
            title="Editar"
          >
            <Edit2 className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => onDelete(contact)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
            title="Excluir"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => onViewDetails(contact)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-400 hover:bg-slate-700 transition-colors"
            title="Ver detalhes"
          >
            <ExternalLink className="w-3.5 h-3.5" />
          </button>
        </div>
      </td>
    </tr>
  );
};
