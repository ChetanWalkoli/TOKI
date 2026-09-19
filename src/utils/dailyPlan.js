import { isOverdue, getTodayString } from './task';

/**
 * Generates a suggested daily schedule for today.
 * Considers overdue items, due dates, priority weights, estimated durations,
 * and task dependency blockers.
 * 
 * Never claims to be "objectively optimal" — it is a smart baseline sequence
 * meant to be refined and confirmed by the human user.
 */
export function generateDailyPlan(tasks = [], availableMinutes = 240) {
  const todayStr = getTodayString();
  const activeTasks = tasks.filter((t) => !t.completed);

  // Score tasks based on urgency and priority
  const scoredTasks = activeTasks.map((task) => {
    let score = 0;
    let reason = '';

    const overdue = isOverdue(task);
    const dueToday = task.dueDate === todayStr;

    if (overdue) {
      score += 100;
      reason = 'Overdue — needs immediate closure';
    } else if (dueToday) {
      score += 50;
      reason = 'Due today';
    } else if (!task.dueDate) {
      score += 10;
      reason = 'Open backlog item';
    } else {
      score += 5;
      reason = 'Upcoming milestone';
    }

    if (task.priority === 'High') {
      score += 30;
    } else if (task.priority === 'Medium') {
      score += 15;
    } else {
      score += 5;
    }

    // Check dependencies: if dependencies are not done, penalize score so blockers go first
    const hasUnresolvedBlockers = Array.isArray(task.dependsOn) && task.dependsOn.some((depId) => {
      const dep = tasks.find((t) => t.id === depId);
      return dep && !dep.completed;
    });

    if (hasUnresolvedBlockers) {
      score -= 40;
      reason += ' (Waiting on prerequisite task)';
    }

    const duration = task.estimatedMinutes > 0 ? task.estimatedMinutes : 30;

    return {
      task,
      score,
      reason,
      duration,
    };
  });

  // Sort descending by score
  scoredTasks.sort((a, b) => b.score - a.score);

  // Fit into available daily capacity
  let accumulatedMinutes = 0;
  const plannedItems = [];
  const reserveItems = [];

  scoredTasks.forEach((item) => {
    if (accumulatedMinutes + item.duration <= availableMinutes || plannedItems.length < 2) {
      accumulatedMinutes += item.duration;
      plannedItems.push(item);
    } else {
      reserveItems.push(item);
    }
  });

  return {
    plannedItems,
    reserveItems,
    totalPlannedMinutes: accumulatedMinutes,
    availableMinutes,
  };
}
