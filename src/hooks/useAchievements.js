import { useMemo } from 'react';

export const ACHIEVEMENT_DEFINITIONS = [
  {
    id: 'first_task',
    title: 'First Step',
    description: 'Complete your first task.',
    icon: '🌱',
  },
  {
    id: 'five_tasks',
    title: 'Getting Started',
    description: 'Complete 5 tasks.',
    icon: '⚡',
  },
  {
    id: 'ten_tasks',
    title: 'True Momentum',
    description: 'Complete 10 tasks in Toki.',
    icon: '🚀',
  },
  {
    id: 'on_a_roll',
    title: 'On a Roll',
    description: 'Maintain a 3-day completion streak.',
    icon: '🔥',
  },
  {
    id: 'early_bird',
    title: 'Early Bird',
    description: 'Complete a task before its scheduled due date.',
    icon: '🌅',
  },
  {
    id: 'subtask_master',
    title: 'Detail Oriented',
    description: 'Finish all subtasks on a complex task.',
    icon: '🧩',
  },
  {
    id: 'focus_master',
    title: 'Deep Diver',
    description: 'Complete at least one full focus session.',
    icon: '⏱️',
  },
  {
    id: 'clean_slate',
    title: 'Clear Horizon',
    description: 'Clear all tasks scheduled for today.',
    icon: '✨',
  },
];

export function useAchievements(tasks = [], focusHistory = [], streak = 0) {
  const achievements = useMemo(() => {
    const completedTasks = tasks.filter((t) => t.completed);
    const completedCount = completedTasks.length;

    // Check early bird: task completedAt < dueDate (end of that date)
    const hasEarlyBird = completedTasks.some((t) => {
      if (!t.completedAt || !t.dueDate) return false;
      const completedDate = new Date(t.completedAt).toISOString().slice(0, 10);
      return completedDate < t.dueDate;
    });

    // Check subtask master: task with 2+ subtasks where all are completed
    const hasSubtaskMaster = completedTasks.some(
      (t) => Array.isArray(t.subtasks) && t.subtasks.length >= 2 && t.subtasks.every((st) => st.completed)
    );

    // Check focus master: focus history has at least 1 session
    const hasFocusMaster = Array.isArray(focusHistory) && focusHistory.length > 0;

    // Check clean slate: today has tasks and 0 remaining
    const todayStr = new Date().toISOString().slice(0, 10);
    const todayTasks = tasks.filter((t) => t.dueDate === todayStr);
    const hasCleanSlate = todayTasks.length > 0 && todayTasks.every((t) => t.completed);

    const unlockedMap = {
      first_task: completedCount >= 1,
      five_tasks: completedCount >= 5,
      ten_tasks: completedCount >= 10,
      on_a_roll: streak >= 3,
      early_bird: hasEarlyBird,
      subtask_master: hasSubtaskMaster,
      focus_master: hasFocusMaster,
      clean_slate: hasCleanSlate,
    };

    return ACHIEVEMENT_DEFINITIONS.map((def) => ({
      ...def,
      unlocked: Boolean(unlockedMap[def.id]),
    }));
  }, [tasks, focusHistory, streak]);

  const unlockedCount = achievements.filter((a) => a.unlocked).length;
  const totalCount = achievements.length;

  return {
    achievements,
    unlockedCount,
    totalCount,
    percentUnlocked: Math.round((unlockedCount / totalCount) * 100),
  };
}
