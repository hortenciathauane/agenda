export type ContactCategory =
  | 'Clientes'
  | 'Trabalho'
  | 'Família'
  | 'Amigos'
  | 'Fornecedores'
  | 'Parceiros'
  | 'Outros';

export interface Contact {
  id: string;
  name: string;
  email?: string | null;
  phone?: string | null;
  company?: string | null;
  role?: string | null;
  category: ContactCategory;
  notes?: string | null;
  avatar_url?: string | null;
  favorite: boolean;
  created_at?: string;
  updated_at?: string;
}

export type SortField = 'name' | 'created_at' | 'updated_at' | 'company';
export type SortOrder = 'asc' | 'desc';

export interface ContactFilters {
  search: string;
  category: string; // 'all' or ContactCategory
  onlyFavorites: boolean;
  sortField: SortField;
  sortOrder: SortOrder;
}

export interface SupabaseConfigStatus {
  isConfigured: boolean;
  url: string | null;
  hasAnonKey: boolean;
  isConnected: boolean;
  checked: boolean;
  errorMessage?: string | null;
}
