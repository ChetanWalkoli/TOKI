import { useState, useEffect, useRef } from 'react';
import { readFocusHistory, writeFocusHistory } from '../services/storage';

const FOCUS_TIME = 25 * 60; // 25 minutes in seconds
const BREAK_TIME = 5 * 60;  // 5 minutes in seconds

export function usePomodoro(onTaskFocusComplete) {
  const [mode, setMode] = useState('focus'); // 'focus' | 'break'
  const [timeLeft, setTimeLeft] = useState(FOCUS_TIME);
  const [isRunning, setIsRunning] = useState(false);
  const [selectedTaskId, setSelectedTaskId] = useState(null);
  const [history, setHistory] = useState(() => readFocusHistory());

  const timerRef = useRef(null);

  // Sync history with storage
  useEffect(() => {
    writeFocusHistory(history);
  }, [history]);

  useEffect(() => {
    if (isRunning) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            handleTimerFinish();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      clearInterval(timerRef.current);
    }

    return () => clearInterval(timerRef.current);
  }, [isRunning, mode, selectedTaskId]);

  const handleTimerFinish = () => {
    setIsRunning(false);

    if (mode === 'focus') {
      const sessionEntry = {
        id: crypto.randomUUID(),
        taskId: selectedTaskId || null,
        mode: 'focus',
        durationMinutes: 25,
        timestamp: Date.now(),
      };

      setHistory((prev) => [sessionEntry, ...prev]);

      if (selectedTaskId && onTaskFocusComplete) {
        onTaskFocusComplete(selectedTaskId, 25);
      }

      // Switch to break
      setMode('break');
      setTimeLeft(BREAK_TIME);
    } else {
      // Break finished, switch to focus
      setMode('focus');
      setTimeLeft(FOCUS_TIME);
    }
  };

  const start = () => setIsRunning(true);
  const pause = () => setIsRunning(false);
  const resume = () => setIsRunning(true);

  const reset = () => {
    setIsRunning(false);
    setTimeLeft(mode === 'focus' ? FOCUS_TIME : BREAK_TIME);
  };

  const switchMode = (newMode) => {
    setIsRunning(false);
    setMode(newMode);
    setTimeLeft(newMode === 'focus' ? FOCUS_TIME : BREAK_TIME);
  };

  const totalFocusMinutes = history.reduce((sum, item) => sum + (item.durationMinutes || 0), 0);
  const totalFocusSessions = history.length;

  const totalDuration = mode === 'focus' ? FOCUS_TIME : BREAK_TIME;
  const progress = (totalDuration - timeLeft) / totalDuration;

  // Format MM:SS
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const formattedTime = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  return {
    mode,
    timeLeft,
    formattedTime,
    progress,
    isRunning,
    selectedTaskId,
    setSelectedTaskId,
    history,
    totalFocusMinutes,
    totalFocusSessions,
    start,
    pause,
    resume,
    reset,
    switchMode,
  };
}
