import { createClient } from '@supabase/supabase-js';

// Vite expone variables de entorno mediante import.meta.env
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !anonKey) {
  throw new Error('Supabase URL or anon key is missing in environment variables');
}

export const supabaseAuth = createClient(supabaseUrl, anonKey);
