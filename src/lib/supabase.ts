import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Database } from '../types/database.types';

// These would normally be in environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

let supabase: SupabaseClient<Database>;

/**
 * Initialize the Supabase client
 */
export const initSupabase = (): SupabaseClient<Database> => {
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Supabase URL and anon key must be provided');
  }
  
  if (!supabase) {
    supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        storage: localStorage
      }
    });
  }
  
  return supabase;
};

/**
 * Get the Supabase client instance
 */
export const getSupabaseClient = (): SupabaseClient<Database> => {
  if (!supabase) {
    return initSupabase();
  }
  return supabase;
};

export default getSupabaseClient();