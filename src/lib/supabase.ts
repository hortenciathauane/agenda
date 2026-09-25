import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Contact, SupabaseConfigStatus } from '../types/contact';

// Read env variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Check if valid configuration exists
const isValidConfig = Boolean(
  supabaseUrl &&
  supabaseAnonKey &&
  supabaseUrl.startsWith('http') &&
  !supabaseUrl.includes('your-project-id') &&
  !supabaseAnonKey.includes('your-anon-key')
);

// Create Supabase client singleton if configured
export const supabase: SupabaseClient | null = isValidConfig
  ? createClient(supabaseUrl!, supabaseAnonKey!, {
      auth: {
        persistSession: false,
      },
    })
  : null;

// Local storage key for offline/fallback mode
const LOCAL_STORAGE_KEY = 'supabase_contacts_app_data';

// Initial sample data in Portuguese
const INITIAL_DEMO_CONTACTS: Contact[] = [
  {
    id: '1',
    name: 'Ana Beatriz Silveira',
    email: 'ana.silveira@inovatech.com.br',
    phone: '11987654321',
    company: 'InovaTech Soluções',
    role: 'Diretora Comercial',
    category: 'Clientes',
    notes: 'Cliente VIP desde 2024. Contrato corporativo anual.',
    avatar_url: null,
    favorite: true,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString(),
    updated_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString(),
  },
  {
    id: '2',
    name: 'Carlos Eduardo Santos',
    email: 'cadu.santos@cloudscale.io',
    phone: '21976543210',
    company: 'CloudScale Brasil',
    role: 'Tech Lead / Arquiteto',
    category: 'Trabalho',
    notes: 'Especialista em banco de dados e arquitetura serverless.',
    avatar_url: null,
    favorite: true,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 12).toISOString(),
    updated_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 12).toISOString(),
  },
  {
    id: '3',
    name: 'Juliana Mendes Rocha',
    email: 'juliana.mendes@designstudio.art',
    phone: '31998765432',
    company: 'Studio Pixel & Marca',
    role: 'UI/UX Designer Senior',
    category: 'Parceiros',
    notes: 'Parceira de projetos de design de interface e identidade visual.',
    avatar_url: null,
    favorite: false,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 18).toISOString(),
    updated_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 18).toISOString(),
  },
  {
    id: '4',
    name: 'Roberto Figueiredo',
    email: 'roberto@distribuidorasul.com.br',
    phone: '41988887777',
    company: 'Distribuidora Sul',
    role: 'Gerente de Suprimentos',
    category: 'Fornecedores',
    notes: 'Fornecedor de hardware e infraestrutura de rede.',
    avatar_url: null,
    favorite: false,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 30).toISOString(),
    updated_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 30).toISOString(),
  },
  {
    id: '5',
    name: 'Mariana Costa Lima',
    email: 'mari.costa@emailpessoal.com',
    phone: '11971234567',
    company: '',
    role: '',
    category: 'Amigos',
    notes: 'Aniversário em 14 de Novembro.',
    avatar_url: null,
    favorite: true,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 45).toISOString(),
    updated_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 45).toISOString(),
  },
];

// Helper to get local contacts
function getLocalContacts(): Contact[] {
  try {
    const data = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (!data) {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(INITIAL_DEMO_CONTACTS));
      return INITIAL_DEMO_CONTACTS;
    }
    return JSON.parse(data);
  } catch (err) {
    console.error('Failed to read from localStorage:', err);
    return INITIAL_DEMO_CONTACTS;
  }
}

// Helper to save local contacts
function saveLocalContacts(contacts: Contact[]): void {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(contacts));
  } catch (err) {
    console.error('Failed to save to localStorage:', err);
  }
}

export function getSupabaseConfigStatus(): SupabaseConfigStatus {
  return {
    isConfigured: isValidConfig,
    url: supabaseUrl || null,
    hasAnonKey: Boolean(supabaseAnonKey && !supabaseAnonKey.includes('your-anon-key')),
    isConnected: false,
    checked: false,
  };
}

/**
 * Tests connection to Supabase and verifies the contacts table
 */
export async function testSupabaseConnection(): Promise<{
  success: boolean;
  message: string;
  tableExists: boolean;
}> {
  if (!supabase) {
    return {
      success: false,
      message: 'Supabase não configurado. Adicione VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY no arquivo .env.',
      tableExists: false,
    };
  }

  try {
    const { error } = await supabase
      .from('contacts')
      .select('id', { head: true, count: 'exact' });

    if (error) {
      if (error.code === '42P01' || error.message.includes('relation "public.contacts" does not exist')) {
        return {
          success: true,
          message: 'Conectado ao Supabase com sucesso, porém a tabela "contacts" ainda não foi criada. Execute o script SQL no SQL Editor.',
          tableExists: false,
        };
      }
      return {
        success: false,
        message: `Erro do Supabase: ${error.message} (Código: ${error.code || 'N/A'})`,
        tableExists: false,
      };
    }

    return {
      success: true,
      message: 'Conexão ativa e tabela "contacts" pronta para uso!',
      tableExists: true,
    };
  } catch (err: any) {
    return {
      success: false,
      message: err.message || 'Falha ao conectar com o Supabase.',
      tableExists: false,
    };
  }
}

/**
 * Uploads an avatar image to Supabase Storage ('contact-avatars' bucket)
 */
export async function uploadContactAvatar(file: File): Promise<{
  success: boolean;
  publicUrl?: string;
  error?: string;
}> {
  if (!supabase) {
    // If running in local fallback mode, convert to local object URL / base64
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = () => {
        resolve({
          success: true,
          publicUrl: reader.result as string,
        });
      };
      reader.onerror = () => {
        resolve({
          success: false,
          error: 'Falha ao processar arquivo localmente.',
        });
      };
      reader.readAsDataURL(file);
    });
  }

  try {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}_${Math.random().toString(36).substring(2, 9)}.${fileExt}`;
    const filePath = `avatars/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('contact-avatars')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false,
      });

    if (uploadError) {
      console.warn('Storage upload error:', uploadError);
      return { success: false, error: uploadError.message };
    }

    const { data: publicUrlData } = supabase.storage
      .from('contact-avatars')
      .getPublicUrl(filePath);

    return {
      success: true,
      publicUrl: publicUrlData.publicUrl,
    };
  } catch (err: any) {
    return {
      success: false,
      error: err.message || 'Erro durante o upload no Supabase Storage.',
    };
  }
}

/**
 * Fetches all contacts from Supabase or LocalStorage
 */
export async function fetchContacts(): Promise<{ contacts: Contact[]; isLive: boolean; error?: string }> {
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('contacts')
        .select('*')
        .order('name', { ascending: true });

      if (!error && data) {
        return { contacts: data as Contact[], isLive: true };
      }

      console.warn('Supabase query failed, falling back to local storage:', error?.message);
      return {
        contacts: getLocalContacts(),
        isLive: false,
        error: error ? `Supabase: ${error.message}` : undefined,
      };
    } catch (err: any) {
      console.error('Supabase exception:', err);
      return {
        contacts: getLocalContacts(),
        isLive: false,
        error: err.message,
      };
    }
  }

  // Fallback to local storage
  return { contacts: getLocalContacts(), isLive: false };
}

/**
 * Creates a new contact
 */
export async function createContact(
  contact: Omit<Contact, 'id' | 'created_at' | 'updated_at'>
): Promise<{ success: boolean; contact?: Contact; error?: string }> {
  const now = new Date().toISOString();

  if (supabase) {
    try {
      const newContact = {
        ...contact,
        created_at: now,
        updated_at: now,
      };

      const { data, error } = await supabase
        .from('contacts')
        .insert([newContact])
        .select()
        .single();

      if (!error && data) {
        return { success: true, contact: data as Contact };
      }

      console.warn('Failed to insert in Supabase, using local fallback:', error?.message);
    } catch (err: any) {
      console.warn('Supabase insert exception:', err);
    }
  }

  // Local fallback
  const localList = getLocalContacts();
  const created: Contact = {
    ...contact,
    id: typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `local_${Date.now()}`,
    created_at: now,
    updated_at: now,
  };

  saveLocalContacts([created, ...localList]);
  return { success: true, contact: created };
}

/**
 * Updates an existing contact
 */
export async function updateContact(
  id: string,
  updates: Partial<Omit<Contact, 'id' | 'created_at'>>
): Promise<{ success: boolean; contact?: Contact; error?: string }> {
  const now = new Date().toISOString();
  const payload = { ...updates, updated_at: now };

  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('contacts')
        .update(payload)
        .eq('id', id)
        .select()
        .single();

      if (!error && data) {
        return { success: true, contact: data as Contact };
      }
      console.warn('Failed to update in Supabase, updating locally:', error?.message);
    } catch (err: any) {
      console.warn('Supabase update exception:', err);
    }
  }

  // Local fallback
  const localList = getLocalContacts();
  let updatedContact: Contact | undefined;
  const newList = localList.map((item) => {
    if (item.id === id) {
      updatedContact = { ...item, ...payload };
      return updatedContact;
    }
    return item;
  });

  saveLocalContacts(newList);
  return { success: true, contact: updatedContact };
}

/**
 * Deletes a single contact
 */
export async function deleteContact(id: string): Promise<{ success: boolean; error?: string }> {
  if (supabase) {
    try {
      const { error } = await supabase.from('contacts').delete().eq('id', id);
      if (!error) {
        return { success: true };
      }
      console.warn('Failed to delete in Supabase, deleting locally:', error.message);
    } catch (err: any) {
      console.warn('Supabase delete exception:', err);
    }
  }

  // Local fallback
  const localList = getLocalContacts();
  saveLocalContacts(localList.filter((item) => item.id !== id));
  return { success: true };
}

/**
 * Deletes multiple contacts in bulk
 */
export async function bulkDeleteContacts(ids: string[]): Promise<{ success: boolean; error?: string }> {
  if (supabase) {
    try {
      const { error } = await supabase.from('contacts').delete().in('id', ids);
      if (!error) {
        return { success: true };
      }
    } catch (err: any) {
      console.warn('Supabase bulk delete exception:', err);
    }
  }

  // Local fallback
  const localList = getLocalContacts();
  saveLocalContacts(localList.filter((item) => !ids.includes(item.id)));
  return { success: true };
}

/**
 * Toggles contact favorite status
 */
export async function toggleFavoriteContact(id: string, currentStatus: boolean): Promise<boolean> {
  const result = await updateContact(id, { favorite: !currentStatus });
  return result.success;
}

/**
 * Syncs contacts from local storage into the connected Supabase instance
 */
export async function syncLocalContactsToSupabase(): Promise<{
  success: boolean;
  insertedCount: number;
  message: string;
}> {
  if (!supabase) {
    return {
      success: false,
      insertedCount: 0,
      message: 'Supabase não está configurado.',
    };
  }

  const localContacts = getLocalContacts();
  if (localContacts.length === 0) {
    return {
      success: true,
      insertedCount: 0,
      message: 'Nenhum contato local encontrado para sincronizar.',
    };
  }

  try {
    // Prepare items without local IDs so Supabase can generate proper UUIDs
    const preparedItems = localContacts.map((c) => ({
      name: c.name,
      email: c.email || null,
      phone: c.phone || null,
      company: c.company || null,
      role: c.role || null,
      category: c.category || 'Outros',
      notes: c.notes || null,
      avatar_url: c.avatar_url || null,
      favorite: Boolean(c.favorite),
    }));

    const { data, error } = await supabase
      .from('contacts')
      .insert(preparedItems)
      .select();

    if (error) {
      return {
        success: false,
        insertedCount: 0,
        message: `Erro ao sincronizar: ${error.message}`,
      };
    }

    return {
      success: true,
      insertedCount: data ? data.length : preparedItems.length,
      message: `${preparedItems.length} contatos sincronizados com sucesso no Supabase!`,
    };
  } catch (err: any) {
    return {
      success: false,
      insertedCount: 0,
      message: `Falha na sincronização: ${err.message}`,
    };
  }
}

/**
 * Complete ready-to-run PostgreSQL SQL script for Supabase
 * Includes table, storage bucket, and granular RLS policies
 */
export const SUPABASE_SQL_SCRIPT = `-- ==============================================================================
-- 🚀 SCRIPT SQL COMPLETO: BANCO DE DADOS & POLÍTICAS DE ARMAZENAMENTO (SUPABASE)
-- Execute no SQL Editor do seu projeto Supabase:
-- (Painel do Supabase -> Seu Projeto -> SQL Editor -> New Query -> Run)
-- ==============================================================================

-- 1. EXTENSÃO PARA UUIDS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. TABELA PRINCIPAL DE CONTATOS
CREATE TABLE IF NOT EXISTS public.contacts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE DEFAULT auth.uid(),
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  company TEXT,
  role TEXT,
  category TEXT DEFAULT 'Outros',
  notes TEXT,
  avatar_url TEXT,
  favorite BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. GATILHO AUTOMÁTICO PARA ATUALIZAÇÃO DO CAMPO "updated_at"
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_contacts_updated_at ON public.contacts;
CREATE TRIGGER set_contacts_updated_at
  BEFORE UPDATE ON public.contacts
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- 4. ÍNDICES DE PERFORMANCE
CREATE INDEX IF NOT EXISTS idx_contacts_name ON public.contacts (name);
CREATE INDEX IF NOT EXISTS idx_contacts_email ON public.contacts (email);
CREATE INDEX IF NOT EXISTS idx_contacts_phone ON public.contacts (phone);
CREATE INDEX IF NOT EXISTS idx_contacts_category ON public.contacts (category);
CREATE INDEX IF NOT EXISTS idx_contacts_favorite ON public.contacts (favorite);
CREATE INDEX IF NOT EXISTS idx_contacts_user_id ON public.contacts (user_id);

-- ==============================================================================
-- 🛡️ POLÍTICAS DE SEGURANÇA DA TABELA CONTACTS (ROW LEVEL SECURITY - RLS)
-- ==============================================================================

ALTER TABLE public.contacts ENABLE ROW LEVEL SECURITY;

-- Limpar políticas antigas se existirem
DROP POLICY IF EXISTS "Permitir leitura de contatos" ON public.contacts;
DROP POLICY IF EXISTS "Permitir insercao de contatos" ON public.contacts;
DROP POLICY IF EXISTS "Permitir atualizacao de contatos" ON public.contacts;
DROP POLICY IF EXISTS "Permitir exclusao de contatos" ON public.contacts;
DROP POLICY IF EXISTS "Permitir acesso completo aos contatos" ON public.contacts;

-- Políticas granulares da tabela (Permite tanto anon key da API quanto usuários logados):
-- Política de Leitura (SELECT)
CREATE POLICY "Permitir leitura de contatos"
  ON public.contacts
  FOR SELECT
  TO anon, authenticated
  USING (
    user_id IS NULL OR user_id = auth.uid() OR auth.uid() IS NULL
  );

-- Política de Inserção (INSERT)
CREATE POLICY "Permitir insercao de contatos"
  ON public.contacts
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (
    user_id IS NULL OR user_id = auth.uid() OR auth.uid() IS NULL
  );

-- Política de Atualização (UPDATE)
CREATE POLICY "Permitir atualizacao de contatos"
  ON public.contacts
  FOR UPDATE
  TO anon, authenticated
  USING (
    user_id IS NULL OR user_id = auth.uid() OR auth.uid() IS NULL
  )
  WITH CHECK (
    user_id IS NULL OR user_id = auth.uid() OR auth.uid() IS NULL
  );

-- Política de Exclusão (DELETE)
CREATE POLICY "Permitir exclusao de contatos"
  ON public.contacts
  FOR DELETE
  TO anon, authenticated
  USING (
    user_id IS NULL OR user_id = auth.uid() OR auth.uid() IS NULL
  );

-- ==============================================================================
-- 📦 POLÍTICAS DE ARMAZENAMENTO DE ARQUIVOS (SUPABASE STORAGE BUCKET: "contact-avatars")
-- ==============================================================================

-- 1. Criação automática do Bucket público de avatares/documentos de contatos
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'contact-avatars',
  'contact-avatars',
  true,
  5242880, -- limite de 5MB por arquivo
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml']
)
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 5242880,
  allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml'];

-- Limpar políticas de storage antigas se existirem
DROP POLICY IF EXISTS "Visualizacao publica de avatares" ON storage.objects;
DROP POLICY IF EXISTS "Upload de avatares de contatos" ON storage.objects;
DROP POLICY IF EXISTS "Atualizacao de avatares de contatos" ON storage.objects;
DROP POLICY IF EXISTS "Exclusao de avatares de contatos" ON storage.objects;

-- Política 1 de Armazenamento: Leitura Pública dos avatares
CREATE POLICY "Visualizacao publica de avatares"
  ON storage.objects
  FOR SELECT
  TO public
  USING (bucket_id = 'contact-avatars');

-- Política 2 de Armazenamento: Upload de novas imagens/arquivos
CREATE POLICY "Upload de avatares de contatos"
  ON storage.objects
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (bucket_id = 'contact-avatars');

-- Política 3 de Armazenamento: Atualização de arquivos existentes
CREATE POLICY "Atualizacao de avatares de contatos"
  ON storage.objects
  FOR UPDATE
  TO anon, authenticated
  USING (bucket_id = 'contact-avatars')
  WITH CHECK (bucket_id = 'contact-avatars');

-- Política 4 de Armazenamento: Exclusão de arquivos
CREATE POLICY "Exclusao de avatares de contatos"
  ON storage.objects
  FOR DELETE
  TO anon, authenticated
  USING (bucket_id = 'contact-avatars');

-- ==============================================================================
-- 📋 DADOS INICIAIS DE TESTE (OPCIONAL)
-- ==============================================================================
INSERT INTO public.contacts (name, email, phone, company, role, category, notes, favorite)
VALUES
  ('Ana Beatriz Silveira', 'ana.silveira@inovatech.com.br', '11987654321', 'InovaTech Soluções', 'Diretora Comercial', 'Clientes', 'Cliente VIP com contrato corporativo ativo.', true),
  ('Carlos Eduardo Santos', 'cadu.santos@cloudscale.io', '21976543210', 'CloudScale Brasil', 'Tech Lead', 'Trabalho', 'Especialista em bancos de dados e nuvem.', true),
  ('Juliana Mendes Rocha', 'juliana.mendes@designstudio.art', '31998765432', 'Studio Pixel', 'UI/UX Designer', 'Parceiros', 'Colaboradora de design de interfaces.', false),
  ('Roberto Figueiredo', 'roberto@distribuidorasul.com.br', '41988887777', 'Distribuidora Sul', 'Gerente', 'Fornecedores', 'Fornecedor de hardware e infraestrutura.', false)
ON CONFLICT DO NOTHING;
`;
