import { useState, useEffect } from 'react';
import {
  CalendarDays,
  Clock,
  ArrowUp,
  ArrowDown,
  X,
  Plus,
  CheckCircle2,
  Sparkles,
  AlertCircle,
} from 'lucide-react';
import Modal from '../common/Modal';
import { generateDailyPlan } from '../../utils/dailyPlan';
import { getTodayString } from '../../utils/task';

export default function PlanMyDayModal({
  open,
  onClose,
  tasks = [],
  onApplyPlan,
}) {
  const [availableHours, setAvailableHours] = useState(4);
  const [plannedList, setPlannedList] = useState([]);
  const [reserveList, setReserveList] = useState([]);

  useEffect(() => {
    if (open) {
      const plan = generateDailyPlan(tasks, availableHours * 60);
      setPlannedList(plan.plannedItems.map((item) => item.task));
      setReserveList(plan.reserveItems.map((item) => item.task));
    }
  }, [open, tasks, availableHours]);

  const handleHoursChange = (hours) => {
    setAvailableHours(hours);
    const plan = generateDailyPlan(tasks, hours * 60);
    setPlannedList(plan.plannedItems.map((item) => item.task));
    setReserveList(plan.reserveItems.map((item) => item.task));
  };

  const moveItem = (index, direction) => {
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= plannedList.length) return;
    const next = [...plannedList];
    const [moved] = next.splice(index, 1);
    next.splice(targetIndex, 0, moved);
    setPlannedList(next);
  };

  const removeFromPlan = (task) => {
    setPlannedList((prev) => prev.filter((t) => t.id !== task.id));
    setReserveList((prev) => [task, ...prev]);
  };

  const addToPlan = (task) => {
    setReserveList((prev) => prev.filter((t) => t.id !== task.id));
    setPlannedList((prev) => [...prev, task]);
  };

  const totalMinutes = plannedList.reduce(
    (acc, t) => acc + (t.estimatedMinutes > 0 ? t.estimatedMinutes : 30),
    0
  );

  const handleApply = () => {
    if (onApplyPlan) {
      onApplyPlan(plannedList);
      onClose();
    }
  };

  return (
    <Modal open={open} onClose={onClose} title="Plan My Day">
      <div className="flex flex-col gap-4 text-sm text-[var(--color-ink)]">
        {/* Transparent Principle Banner */}
        <div className="flex items-start gap-2.5 p-3 rounded-xl bg-[var(--color-paper-subtle)] border border-[var(--color-line-subtle)] text-xs text-[var(--color-ink-secondary)]">
          <Sparkles size={16} className="text-[var(--color-coral)] shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            Here is a suggested sequence based on upcoming deadlines, priorities, and dependency blockers. It is not an inflexible schedule — feel free to tweak, remove, or reorder.
          </p>
        </div>

        {/* Available Focus Capacity */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-[var(--color-ink-secondary)] flex items-center justify-between">
            <span>Available focus time today:</span>
            <span className="text-[var(--color-coral)] font-mono">{availableHours} hours ({availableHours * 60} mins)</span>
          </label>
          <div className="flex items-center gap-2">
            {[2, 4, 6, 8].map((hours) => (
              <button
                key={hours}
                type="button"
                onClick={() => handleHoursChange(hours)}
                className={`flex-1 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                  availableHours === hours
                    ? 'bg-[var(--color-coral-subtle)] border-[var(--color-coral)] text-[var(--color-coral)] font-semibold'
                    : 'border-[var(--color-line)] bg-[var(--color-paper-card)] text-[var(--color-ink-secondary)] hover:bg-[var(--color-paper-deep)]'
                }`}
              >
                {hours}h
              </button>
            ))}
          </div>
        </div>

        {/* Planned Sequence */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-[var(--color-ink)]">Suggested Flow ({plannedList.length} tasks)</span>
            <span className={`text-xs font-mono font-medium ${totalMinutes > availableHours * 60 ? 'text-[var(--color-red)]' : 'text-[var(--color-muted)]'}`}>
              Estimated: ~{Math.round(totalMinutes / 60 * 10) / 10}h / {availableHours}h
            </span>
          </div>

          <div className="flex flex-col gap-1.5 max-h-64 overflow-y-auto p-1 border border-[var(--color-line-subtle)] rounded-xl bg-[var(--color-paper-card)]">
            {plannedList.length === 0 ? (
              <div className="p-4 text-center text-xs text-[var(--color-muted)]">
                No tasks selected in today's plan. Add from below!
              </div>
            ) : (
              plannedList.map((task, index) => {
                const duration = task.estimatedMinutes > 0 ? task.estimatedMinutes : 30;
                return (
                  <div
                    key={task.id}
                    className="flex items-center gap-2 p-2.5 rounded-lg bg-[var(--color-paper-deep)] border border-[var(--color-line-subtle)] text-xs"
                  >
                    <span className="w-5 text-center font-mono text-[11px] text-[var(--color-muted)] font-semibold">
                      {index + 1}.
                    </span>
                    <div className="flex flex-col flex-1 overflow-hidden leading-tight">
                      <span className="font-medium text-[var(--color-ink)] truncate">{task.title}</span>
                      <div className="flex items-center gap-2 text-[10px] text-[var(--color-muted)] mt-0.5">
                        <span className="flex items-center gap-0.5">
                          <Clock size={10} /> ~{duration}m
                        </span>
                        <span className="font-medium text-[var(--color-coral)]">
                          {task.priority}
                        </span>
                      </div>
                    </div>

                    {/* Reorder Buttons */}
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        type="button"
                        onClick={() => moveItem(index, -1)}
                        disabled={index === 0}
                        title="Move earlier"
                        className="p-1 rounded hover:bg-[var(--color-paper-card)] disabled:opacity-30 text-[var(--color-muted)] hover:text-[var(--color-ink)]"
                      >
                        <ArrowUp size={13} />
                      </button>
                      <button
                        type="button"
                        onClick={() => moveItem(index, 1)}
                        disabled={index === plannedList.length - 1}
                        title="Move later"
                        className="p-1 rounded hover:bg-[var(--color-paper-card)] disabled:opacity-30 text-[var(--color-muted)] hover:text-[var(--color-ink)]"
                      >
                        <ArrowDown size={13} />
                      </button>
                      <button
                        type="button"
                        onClick={() => removeFromPlan(task)}
                        title="Remove from plan"
                        className="p-1 rounded hover:bg-[var(--color-red-subtle)] text-[var(--color-muted)] hover:text-[var(--color-red)]"
                      >
                        <X size={13} />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Reserve Tasks */}
        {reserveList.length > 0 && (
          <div className="flex flex-col gap-1.5">
            <span className="text-[11px] font-semibold text-[var(--color-muted)] uppercase tracking-wider">
              Remaining Backlog ({reserveList.length})
            </span>
            <div className="flex flex-col gap-1 max-h-28 overflow-y-auto p-1 border border-[var(--color-line-subtle)] rounded-lg bg-[var(--color-paper-subtle)]">
              {reserveList.slice(0, 5).map((task) => (
                <div
                  key={task.id}
                  className="flex items-center justify-between p-1.5 px-2 rounded hover:bg-[var(--color-paper-card)] text-xs text-[var(--color-ink-secondary)]"
                >
                  <span className="truncate flex-1 mr-2">{task.title}</span>
                  <button
                    type="button"
                    onClick={() => addToPlan(task)}
                    className="flex items-center gap-1 text-[11px] text-[var(--color-coral)] font-semibold hover:underline shrink-0"
                  >
                    <Plus size={12} />
                    <span>Include</span>
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex justify-end gap-2 mt-2 pt-3 border-t border-[var(--color-line-subtle)]">
          <button
            type="button"
            onClick={onClose}
            className="px-3.5 py-2 rounded-lg border border-[var(--color-line)] text-xs font-medium text-[var(--color-ink-secondary)] hover:bg-[var(--color-paper-deep)] transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleApply}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[var(--color-coral)] text-white text-xs font-semibold hover:bg-[var(--color-coral-hover)] transition-colors shadow-sm"
          >
            <CheckCircle2 size={14} />
            <span>Apply Today's Plan</span>
          </button>
        </div>
      </div>
    </Modal>
  );
}
