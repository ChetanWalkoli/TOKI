import { supabase, isSupabaseConfigured } from './supabase';

/**
 * Maps PostgreSQL database task row to application frontend model
 */
export function mapDbTaskToModel(row) {
  if (!row) return null;

  // Subtasks
  const subtasks = Array.isArray(row.task_subtasks)
    ? row.task_subtasks.map((st) => ({
        id: st.id,
        title: st.title,
        completed: Boolean(st.completed),
      }))
    : [];

  // Tags
  let tags = [];
  if (Array.isArray(row.task_tags)) {
    tags = row.task_tags
      .map((tt) => tt?.tags?.name || tt?.name)
      .filter(Boolean);
  }

  const createdAt = row.created_at ? new Date(row.created_at).getTime() : Date.now();
  const updatedAt = row.updated_at ? new Date(row.updated_at).getTime() : createdAt;
  const completedAt = row.completed_at ? new Date(row.completed_at).getTime() : null;

  return {
    id: row.id,
    title: row.title,
    description: row.description || '',
    priority: row.priority || 'Medium',
    category: row.category || 'Personal',
    status: row.status || (row.completed ? 'done' : 'todo'),
    dueDate: row.due_date || '',
    completed: Boolean(row.completed),
    completedAt,
    focusSessions: row.focus_sessions || 0,
    focusMinutes: row.focus_minutes || 0,
    subtasks,
    tags,
    createdAt,
    updatedAt,
  };
}

export async function fetchTasks(userId) {
  if (!isSupabaseConfigured() || !userId) return [];

  const { data, error } = await supabase
    .from('tasks')
    .select(`
      *,
      task_subtasks (*),
      task_tags (
        tags (
          name
        )
      )
    `)
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Toki: Error fetching cloud tasks:', error);
    throw error;
  }

  return (data || []).map(mapDbTaskToModel).filter(Boolean);
}

export async function createCloudTask(taskData, userId) {
  if (!isSupabaseConfigured() || !userId) return null;

  const insertPayload = {
    user_id: userId,
    title: taskData.title.trim(),
    description: taskData.description || '',
    priority: taskData.priority || 'Medium',
    category: taskData.category || 'Personal',
    status: taskData.status || (taskData.completed ? 'done' : 'todo'),
    due_date: taskData.dueDate || null,
    completed: Boolean(taskData.completed),
    completed_at: taskData.completed ? new Date().toISOString() : null,
  };

  const { data, error } = await supabase
    .from('tasks')
    .insert(insertPayload)
    .select()
    .single();

  if (error) throw error;
  const newTaskId = data.id;

  // Insert subtasks if any
  if (Array.isArray(taskData.subtasks) && taskData.subtasks.length > 0) {
    const subtaskPayloads = taskData.subtasks.map((st) => ({
      task_id: newTaskId,
      user_id: userId,
      title: st.title.trim(),
      completed: Boolean(st.completed),
    }));
    await supabase.from('task_subtasks').insert(subtaskPayloads);
  }

  // Insert tags if any
  if (Array.isArray(taskData.tags) && taskData.tags.length > 0) {
    for (const tagName of taskData.tags) {
      const cleanName = tagName.trim().replace(/^#/, '').toLowerCase();
      if (!cleanName) continue;

      // Upsert tag
      const { data: tagRow } = await supabase
        .from('tags')
        .upsert({ user_id: userId, name: cleanName }, { onConflict: 'user_id, name' })
        .select()
        .single();

      if (tagRow) {
        await supabase
          .from('task_tags')
          .insert({ task_id: newTaskId, tag_id: tagRow.id, user_id: userId });
      }
    }
  }

  // Fetch fully hydrated task
  const { data: fullTask } = await supabase
    .from('tasks')
    .select(`
      *,
      task_subtasks (*),
      task_tags (
        tags (
          name
        )
      )
    `)
    .eq('id', newTaskId)
    .single();

  return mapDbTaskToModel(fullTask || data);
}

export async function updateCloudTask(id, changes) {
  if (!isSupabaseConfigured() || !id) return;

  const dbChanges = {
    updated_at: new Date().toISOString(),
  };

  if (changes.title !== undefined) dbChanges.title = changes.title;
  if (changes.description !== undefined) dbChanges.description = changes.description;
  if (changes.priority !== undefined) dbChanges.priority = changes.priority;
  if (changes.category !== undefined) dbChanges.category = changes.category;
  if (changes.status !== undefined) dbChanges.status = changes.status;
  if (changes.dueDate !== undefined) dbChanges.due_date = changes.dueDate || null;
  if (changes.completed !== undefined) {
    dbChanges.completed = changes.completed;
    dbChanges.completed_at = changes.completed ? new Date().toISOString() : null;
  }
  if (changes.focusSessions !== undefined) dbChanges.focus_sessions = changes.focusSessions;
  if (changes.focusMinutes !== undefined) dbChanges.focus_minutes = changes.focusMinutes;

  const { error } = await supabase.from('tasks').update(dbChanges).eq('id', id);
  if (error) throw error;
}

export async function deleteCloudTask(id) {
  if (!isSupabaseConfigured() || !id) return;
  const { error } = await supabase.from('tasks').delete().eq('id', id);
  if (error) throw error;
}

export async function toggleCloudTask(id, completed) {
  return updateCloudTask(id, {
    completed,
    status: completed ? 'done' : 'todo',
  });
}

export async function setCloudTaskStatus(id, status) {
  return updateCloudTask(id, {
    status,
    completed: status === 'done',
  });
}

export async function addCloudSubtask(taskId, userId, title) {
  if (!isSupabaseConfigured() || !taskId || !userId) return null;

  const { data, error } = await supabase
    .from('task_subtasks')
    .insert({
      task_id: taskId,
      user_id: userId,
      title: title.trim(),
      completed: false,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function toggleCloudSubtask(subtaskId, completed) {
  if (!isSupabaseConfigured() || !subtaskId) return;
  const { error } = await supabase
    .from('task_subtasks')
    .update({ completed })
    .eq('id', subtaskId);
  if (error) throw error;
}

export async function deleteCloudSubtask(subtaskId) {
  if (!isSupabaseConfigured() || !subtaskId) return;
  const { error } = await supabase
    .from('task_subtasks')
    .delete()
    .eq('id', subtaskId);
  if (error) throw error;
}

/**
 * Migrates tasks from localStorage into Supabase for authenticated user
 */
export async function migrateLocalTasks(localTasks = [], userId) {
  if (!isSupabaseConfigured() || !userId || !Array.isArray(localTasks) || localTasks.length === 0) {
    return 0;
  }

  let count = 0;
  for (const task of localTasks) {
    try {
      await createCloudTask(task, userId);
      count++;
    } catch (e) {
      console.warn('Toki: Migration skip for item:', task.title, e);
    }
  }

  return count;
}

/**
 * Realtime subscription to tasks table
 */
export function subscribeToTaskChanges(userId, onPayload) {
  if (!isSupabaseConfigured() || !userId) {
    return { unsubscribe: () => {} };
  }

  const channel = supabase
    .channel(`public:tasks:${userId}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'tasks',
        filter: `user_id=eq.${userId}`,
      },
      (payload) => {
        onPayload(payload);
      }
    )
    .subscribe();

  return {
    unsubscribe: () => {
      supabase.removeChannel(channel);
    },
  };
}
