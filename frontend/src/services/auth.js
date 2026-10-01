import { createClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL;
const key = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
export const authClient = url && key ? createClient(url, key) : null;

export async function signInAdmin(email, password) {
  if (!authClient) throw new Error('Supabase authentication is not configured.');
  const { data, error } = await authClient.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data;
}
