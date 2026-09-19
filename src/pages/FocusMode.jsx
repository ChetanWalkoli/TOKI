import { motion } from 'framer-motion';
import { Play, Pause, RotateCcw, SkipForward, CheckCircle2, Flame, Timer } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Companion from '../components/companion/Companion';

export default function FocusMode({ todos, pomodoro }) {
  const [searchParams] = useSearchParams();
  const urlTaskId = searchParams.get('taskId');

  const { mode, formattedTime, progress, isRunning, selectedTaskId, setSelectedTaskId, totalFocusMinutes, totalFocusSessions, history, start, pause, resume, reset, switchMode } = pomodoro;

  useEffect(() => {
    if (urlTaskId) setSelectedTaskId(urlTaskId);
  }, [urlTaskId, setSelectedTaskId]);

  const activeTasks = todos.tasks.filter((t) => !t.completed);
  const currentTask = todos.tasks.find((t) => t.id === selectedTaskId);

  const radius = 110;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - progress * circumference;

  return (
    <motion.div
      className="max-w-xl lg:max-w-4xl 2xl:max-w-5xl mx-auto flex flex-col gap-6"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
    >
      <div className="text-center sm:text-left">
        <p className="text-xs font-semibold tracking-wider text-[var(--color-muted)] uppercase">Deep Work & Mindfulness</p>
        <h1 className="font-['Fraunces'] text-2xl sm:text-3xl font-semibold text-[var(--color-ink)] mt-1">Focus Mode</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 items-start">
        {/* Main Timer Card */}
        <div className="lg:col-span-3 w-full flex flex-col gap-5 p-4 sm:p-6 rounded-2xl border border-[var(--color-line)] bg-[var(--color-paper-card)] shadow-[var(--shadow-md)]">
          {/* Mode tabs */}
          <div className="flex justify-center" role="tablist">
            {[['focus', '25m Focus'], ['break', '5m Break']].map(([m, label]) => (
              <button key={m} type="button"
                className={`px-4 py-2 text-sm font-semibold rounded-lg transition-colors ${
                  mode === m ? 'bg-[var(--color-coral)] text-white' : 'text-[var(--color-ink-secondary)] hover:bg-[var(--color-paper-deep)]'
                }`}
                onClick={() => switchMode(m)}>
                {label}
              </button>
            ))}
          </div>

          {/* Circular timer - responsive sizing */}
          <div className="relative flex items-center justify-center mx-auto w-[220px] h-[220px] sm:w-[260px] sm:h-[260px]">
            <svg viewBox="0 0 260 260" className="w-full h-full">
              <circle className="timer-track" cx="130" cy="130" r={radius} strokeWidth="10" />
              <circle className={`timer-progress ${mode === 'break' ? 'progress-break' : ''}`} cx="130" cy="130" r={radius} strokeWidth="10" strokeDasharray={circumference} strokeDashoffset={strokeDashoffset} strokeLinecap="round" />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
              <Companion mood={isRunning ? 'working' : mode === 'break' ? 'happy' : 'thinking'} size="small" />
              <span className="font-['DM_Mono'] text-3xl font-semibold text-[var(--color-ink)] tabular-nums">{formattedTime}</span>
              <span className="text-[11px] text-[var(--color-muted)]">{isRunning ? (mode === 'focus' ? 'Deep in the flow' : 'Relaxing break') : 'Ready'}</span>
            </div>
          </div>

          {/* Task selector */}
          <div className="flex flex-col gap-1">
            <label htmlFor="focus-task-dropdown" className="text-xs font-medium text-[var(--color-muted)]">Focusing on:</label>
            <select id="focus-task-dropdown" value={selectedTaskId || ''} onChange={(e) => setSelectedTaskId(e.target.value || null)}
              className="w-full px-3 py-2 rounded-lg border border-[var(--color-line)] bg-[var(--color-paper-card)] text-sm text-[var(--color-ink)] outline-none focus:border-[var(--color-coral)] transition-all">
              <option value="">-- No specific task (General focus) --</option>
              {activeTasks.map((task) => <option key={task.id} value={task.id}>{task.title} ({task.priority})</option>)}
            </select>
          </div>

          {currentTask && (
            <div className="flex items-center justify-between gap-3 px-4 py-3 rounded-xl border border-[var(--color-line)] bg-[var(--color-paper-subtle)]">
              <div className="flex flex-col gap-0.5 min-w-0">
                <strong className="text-sm text-[var(--color-ink)] truncate">{currentTask.title}</strong>
                <small className="text-[11px] text-[var(--color-muted)]">{currentTask.category} · {currentTask.focusSessions || 0} completed sessions</small>
              </div>
              <button type="button" onClick={() => todos.toggleTask(currentTask.id)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[var(--color-line)] text-xs font-medium text-[var(--color-ink-secondary)] hover:bg-[var(--color-paper-deep)] transition-colors shrink-0">
                <CheckCircle2 size={13} /> Mark complete
              </button>
            </div>
          )}

          {/* Controls */}
          <div className="flex items-center justify-center gap-4 pt-1">
            <button type="button" onClick={reset} aria-label="Reset timer" title="Reset timer"
              className="w-11 h-11 sm:w-12 sm:h-12 flex items-center justify-center rounded-full border border-[var(--color-line)] text-[var(--color-ink-secondary)] hover:bg-[var(--color-paper-deep)] active:scale-95 transition-all">
              <RotateCcw size={18} />
            </button>
            <button type="button" onClick={isRunning ? pause : start} aria-label={isRunning ? 'Pause timer' : 'Start timer'}
              className="w-15 h-15 sm:w-16 sm:h-16 flex items-center justify-center rounded-full bg-[var(--color-coral)] text-white shadow-[0_4px_16px_rgba(220,107,84,0.4)] hover:bg-[var(--color-coral-hover)] active:scale-95 transition-all">
              {isRunning ? <Pause size={26} /> : <Play size={26} className="ml-1" />}
            </button>
            <button type="button" onClick={() => switchMode(mode === 'focus' ? 'break' : 'focus')} aria-label="Skip to next session" title="Skip session"
              className="w-11 h-11 sm:w-12 sm:h-12 flex items-center justify-center rounded-full border border-[var(--color-line)] text-[var(--color-ink-secondary)] hover:bg-[var(--color-paper-deep)] active:scale-95 transition-all">
              <SkipForward size={18} />
            </button>
          </div>

          {/* Stats */}
          <div className="flex justify-center gap-8 pt-3 border-t border-[var(--color-line-subtle)]">
            {[
              { icon: <Flame size={18} className="text-[var(--color-coral)]" />, value: totalFocusSessions, label: 'Sessions' },
              { icon: <Timer size={18} className="text-[var(--color-leaf)]" />, value: `${totalFocusMinutes}m`, label: 'Total focus' },
            ].map(({ icon, value, label }) => (
              <div key={label} className="flex items-center gap-2">
                {icon}
                <div className="flex flex-col leading-tight">
                  <strong className="text-sm font-bold text-[var(--color-ink)]">{value}</strong>
                  <small className="text-[11px] text-[var(--color-muted)]">{label}</small>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Focus history & Stats Column */}
        <div className="lg:col-span-2 flex flex-col gap-4">
          <div className="p-4 sm:p-5 rounded-2xl border border-[var(--color-line)] bg-[var(--color-paper-card)] shadow-[var(--shadow-sm)]">
            <h2 className="font-['Fraunces'] font-semibold text-base text-[var(--color-ink)] mb-3">Session Activity</h2>
            {history.length === 0 ? (
              <p className="text-xs text-[var(--color-muted)] py-4 text-center">No focus sessions recorded today yet. Hit start above to begin your deep work!</p>
            ) : (
              <div className="flex flex-col gap-2 max-h-80 overflow-y-auto pr-1">
                {history.slice(0, 8).map((item) => {
                  const matchedTask = todos.tasks.find((t) => t.id === item.taskId);
                  const timeString = new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                  return (
                    <div key={item.id} className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl border border-[var(--color-line-subtle)] bg-[var(--color-paper-subtle)]">
                      <div className="w-2 h-2 rounded-full bg-[var(--color-coral)] shrink-0" />
                      <div className="flex flex-col gap-0.5 min-w-0">
                        <strong className="text-xs font-medium text-[var(--color-ink)] truncate">{matchedTask ? matchedTask.title : 'General Focus'}</strong>
                        <small className="text-[10px] text-[var(--color-muted)]">{timeString} · {item.durationMinutes} min</small>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
