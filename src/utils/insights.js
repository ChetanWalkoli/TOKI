import { isOverdue, getTodayString } from './task';

/**
 * Derives actionable, non-judgmental productivity insights from real task and focus records.
 */
export function calculateProductivityInsights(tasks = [], focusHistory = []) {
  const completedTasks = tasks.filter((t) => t.completed && t.completedAt);
  const activeTasks = tasks.filter((t) => !t.completed);
  const overdueTasks = activeTasks.filter(isOverdue);

  const insights = [];

  // 1. Completion Time of Day Pattern
  if (completedTasks.length >= 3) {
    let morningCount = 0;   // 05:00 - 11:59
    let afternoonCount = 0; // 12:00 - 16:59
    let eveningCount = 0;   // 17:00 - 21:59
    let nightCount = 0;     // 22:00 - 04:59

    completedTasks.forEach((t) => {
      const date = new Date(t.completedAt);
      const hour = date.getHours();
      if (hour >= 5 && hour < 12) morningCount++;
      else if (hour >= 12 && hour < 17) afternoonCount++;
      else if (hour >= 17 && hour < 22) eveningCount++;
      else nightCount++;
    });

    const max = Math.max(morningCount, afternoonCount, eveningCount, nightCount);
    let peakPeriod = 'morning';
    let peakPercentage = Math.round((morningCount / completedTasks.length) * 100);

    if (max === afternoonCount) {
      peakPeriod = 'afternoon';
      peakPercentage = Math.round((afternoonCount / completedTasks.length) * 100);
    } else if (max === eveningCount) {
      peakPeriod = 'evening';
      peakPercentage = Math.round((eveningCount / completedTasks.length) * 100);
    } else if (max === nightCount) {
      peakPeriod = 'night';
      peakPercentage = Math.round((nightCount / completedTasks.length) * 100);
    }

    insights.push({
      id: 'time-of-day',
      title: `You complete most tasks in the ${peakPeriod}`,
      description: `${peakPercentage}% of your recorded completions happen between ${
        peakPeriod === 'morning' ? '5 AM and 12 PM' :
        peakPeriod === 'afternoon' ? '12 PM and 5 PM' :
        peakPeriod === 'evening' ? '5 PM and 10 PM' : '10 PM and 5 AM'
      }. Consider scheduling your most complex tasks during this window.`,
      icon: '🌅',
      type: 'pattern',
    });
  }

  // 2. Overdue Tasks Attention
  if (overdueTasks.length > 0) {
    insights.push({
      id: 'overdue-count',
      title: `You have ${overdueTasks.length} ${overdueTasks.length === 1 ? 'task' : 'tasks'} past due date`,
      description: `Reviewing past-due items can free mental energy. Consider rescheduling them to a realistic future date or wrapping them up first today.`,
      icon: '⏳',
      type: 'actionable',
    });
  } else if (activeTasks.length > 0) {
    insights.push({
      id: 'zero-overdue',
      title: 'No overdue tasks!',
      description: 'Your current deadlines are fully up to date. Excellent pacing.',
      icon: '✨',
      type: 'celebration',
    });
  }

  // 3. Category Distribution of Completed Work
  if (completedTasks.length >= 2) {
    const categoryCounts = {};
    completedTasks.forEach((t) => {
      const cat = t.category || 'Other';
      categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
    });

    const sortedCats = Object.entries(categoryCounts).sort((a, b) => b[1] - a[1]);
    if (sortedCats.length > 0) {
      const [topCategory, count] = sortedCats[0];
      const percent = Math.round((count / completedTasks.length) * 100);
      insights.push({
        id: 'category-share',
        title: `${topCategory} tasks make up ${percent}% of completed work`,
        description: `You have directed significant momentum toward ${topCategory.toLowerCase()} accomplishments.`,
        icon: '📊',
        type: 'distribution',
      });
    }
  }

  // 4. Estimation vs Actual Focus Time
  const tasksWithBoth = tasks.filter((t) => t.estimatedMinutes > 0 && t.focusMinutes > 0);
  if (tasksWithBoth.length >= 2) {
    const totalEst = tasksWithBoth.reduce((acc, t) => acc + t.estimatedMinutes, 0);
    const totalActual = tasksWithBoth.reduce((acc, t) => acc + t.focusMinutes, 0);
    const ratio = Math.round((totalActual / totalEst) * 10) / 10;

    let message = '';
    if (ratio >= 0.9 && ratio <= 1.2) {
      message = 'Your time estimates align closely with your actual focus sessions!';
    } else if (ratio > 1.2) {
      message = `On average, tasks took about ${ratio}x your estimated time. Adding a small buffer to estimates can help keep schedules calm.`;
    } else {
      message = `Tasks are finishing faster than estimated (${ratio}x duration). You are making brisk progress.`;
    }

    insights.push({
      id: 'estimation-accuracy',
      title: 'Time Estimation Calibration',
      description: message,
      icon: '⏱️',
      type: 'calibration',
      metadata: { totalEst, totalActual, ratio },
    });
  }

  return insights;
}
