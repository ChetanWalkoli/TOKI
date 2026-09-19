import { supabase, isSupabaseConfigured } from './supabase';

export async function logCloudFocusSession(userId, taskId = null, durationMinutes = 25, mode = 'focus') {
  if (!isSupabaseConfigured() || !userId) return null;

  const { data, error } = await supabase
    .from('focus_sessions')
    .insert({
      user_id: userId,
      task_id: taskId || null,
      mode,
      duration_minutes: durationMinutes,
    })
    .select()
    .single();

  if (error) {
    console.error('Toki: Error logging focus session:', error);
    return null;
  }

  // Also increment task's focus_sessions and focus_minutes if taskId provided
  if (taskId) {
    try {
      const { data: currentTask } = await supabase
        .from('tasks')
        .select('focus_sessions, focus_minutes')
        .eq('id', taskId)
        .single();

      if (currentTask) {
        await supabase
          .from('tasks')
          .update({
            focus_sessions: (currentTask.focus_sessions || 0) + 1,
            focus_minutes: (currentTask.focus_minutes || 0) + durationMinutes,
          })
          .eq('id', taskId);
      }
    } catch (e) {
      console.warn('Toki: Non-blocking error updating task focus count:', e);
    }
  }

  return data;
}

export async function fetchCloudFocusSessions(userId) {
  if (!isSupabaseConfigured() || !userId) return [];

  const { data, error } = await supabase
    .from('focus_sessions')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Toki: Error fetching focus sessions:', error);
    return [];
  }

  return (data || []).map((row) => ({
    id: row.id,
    taskId: row.task_id,
    mode: row.mode,
    durationMinutes: row.duration_minutes,
    timestamp: new Date(row.created_at).getTime(),
  }));
}
