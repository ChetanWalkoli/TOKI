import { supabase, isSupabaseConfigured } from './supabase';

export async function fetchUserProfile(userId) {
  if (!isSupabaseConfigured() || !userId) return null;

  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (error) {
    console.error('Toki: Error fetching profile:', error);
    return null;
  }

  return {
    id: data.id,
    displayName: data.display_name || '',
    avatarUrl: data.avatar_url || '',
    timezone: data.timezone || 'UTC',
    themePreference: data.theme_preference || 'system',
    defaultPriority: data.default_priority || 'Medium',
    defaultCategory: data.default_category || 'Personal',
    notificationsEnabled: Boolean(data.notifications_enabled),
    createdAt: data.created_at,
    updatedAt: data.updated_at,
  };
}

export async function updateUserProfile(userId, updates) {
  if (!isSupabaseConfigured() || !userId) return null;

  const dbUpdates = {
    updated_at: new Date().toISOString(),
  };

  if (updates.displayName !== undefined) dbUpdates.display_name = updates.displayName;
  if (updates.avatarUrl !== undefined) dbUpdates.avatar_url = updates.avatarUrl;
  if (updates.timezone !== undefined) dbUpdates.timezone = updates.timezone;
  if (updates.themePreference !== undefined) dbUpdates.theme_preference = updates.themePreference;
  if (updates.defaultPriority !== undefined) dbUpdates.default_priority = updates.defaultPriority;
  if (updates.defaultCategory !== undefined) dbUpdates.default_category = updates.defaultCategory;
  if (updates.notificationsEnabled !== undefined) dbUpdates.notifications_enabled = updates.notificationsEnabled;

  const { data, error } = await supabase
    .from('profiles')
    .update(dbUpdates)
    .eq('id', userId)
    .select()
    .single();

  if (error) throw error;
  return data;
}
