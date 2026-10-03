import { createClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL;
const key = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
const adminEmails = new Set(
  (import.meta.env.VITE_ADMIN_EMAILS || '')
    .split(',')
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean),
);

export const authClient = url && key ? createClient(url, key) : null;

export function isAdminUser(user) {
  if (!user) return false;
  const email = user.email?.toLowerCase();
  const appMetadata = user.app_metadata || {};

  return (
    appMetadata.role === 'admin' ||
    appMetadata.admin === true ||
    (email && adminEmails.has(email))
  );
}

export async function signInAdmin(email, password) {
  if (!authClient) throw new Error('Supabase authentication is not configured.');
  const { data, error } = await authClient.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data;
}
