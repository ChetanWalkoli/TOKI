import { supabase, isSupabaseConfigured } from './supabase';

export async function signUpWithEmail(email, password, displayName = '') {
  if (!isSupabaseConfigured()) {
    throw new Error('Supabase is not configured. Please add your credentials to the .env file.');
  }

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        display_name: displayName,
      },
    },
  });

  if (error) throw error;
  return data;
}

export async function signInWithEmail(email, password) {
  if (!isSupabaseConfigured()) {
    throw new Error('Supabase is not configured. Please add your credentials to the .env file.');
  }

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) throw error;
  return data;
}

export async function signOutUser() {
  if (!isSupabaseConfigured()) return { error: null };
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
  return { error: null };
}

export async function resetPasswordForEmail(email) {
  if (!isSupabaseConfigured()) {
    throw new Error('Supabase is not configured. Please add your credentials to the .env file.');
  }

  const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/reset-password`,
  });

  if (error) throw error;
  return data;
}

export async function updateUserPassword(newPassword) {
  if (!isSupabaseConfigured()) {
    throw new Error('Supabase is not configured.');
  }

  const { data, error } = await supabase.auth.updateUser({
    password: newPassword,
  });

  if (error) throw error;
  return data;
}

export async function getUserSession() {
  if (!isSupabaseConfigured()) return null;
  const { data: { session } } = await supabase.auth.getSession();
  return session;
}
