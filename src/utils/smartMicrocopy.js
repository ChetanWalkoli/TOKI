import { isOverdue } from './task';

/**
 * Deterministic, contextual microcopy based on real task data.
 */
export function getSmartMicrocopy({ tasks = [], lastAction = 'idle', todayStats = {}, streak = 0, isFocusing = false }) {
  if (isFocusing) {
    return {
      message: 'Deep focus time. Toki is in the zone with you.',
      mood: 'working',
    };
  }

  const overdueCount = tasks.filter(isOverdue).length;
  const activeCount = tasks.filter((t) => !t.completed).length;

  if (lastAction === 'completed') {
    if (todayStats.completed >= 4) {
      return {
        message: 'You’re really getting somewhere today.',
        mood: 'celebrating',
      };
    }
    if (todayStats.remaining === 0 && todayStats.total > 0) {
      return {
        message: 'All done for today! Take a well-deserved breather.',
        mood: 'celebrating',
      };
    }
    return {
      message: 'Nice. One less thing on your plate.',
      mood: 'happy',
    };
  }

  if (lastAction === 'created') {
    return {
      message: 'Captured. Your mind has more space now.',
      mood: 'happy',
    };
  }

  if (lastAction === 'edited') {
    return {
      message: 'Refined and crystal clear.',
      mood: 'thinking',
    };
  }

  if (lastAction === 'cleared') {
    return {
      message: 'A clean slate feels wonderful.',
      mood: 'happy',
    };
  }

  if (lastAction === 'reopened') {
    return {
      message: 'Back on the list. Take it when you’re ready.',
      mood: 'idle',
    };
  }

  // Situational state without recent user action
  if (overdueCount > 0) {
    return {
      message: `Let’s deal with the old stuff first (${overdueCount} overdue).`,
      mood: 'thinking',
    };
  }

  if (activeCount === 0) {
    return {
      message: 'Looks clear around here. Everything is handled.',
      mood: 'sleepy',
    };
  }

  if (streak >= 3) {
    return {
      message: `${streak} days in a row! Beautiful momentum.`,
      mood: 'happy',
    };
  }

  if (todayStats.completed > 0 && todayStats.remaining > 0) {
    return {
      message: `${todayStats.completed} done, ${todayStats.remaining} to go today. Pace yourself.`,
      mood: 'idle',
    };
  }

  return {
    message: 'One small step at a time.',
    mood: 'idle',
  };
}
