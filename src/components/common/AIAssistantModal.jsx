import { useState, useEffect } from 'react';
import {
  Sparkles,
  ListPlus,
  Clock,
  FileEdit,
  FolderGit2,
  Check,
  Plus,
  CheckCircle2,
  ArrowRight,
  HelpCircle,
} from 'lucide-react';
import Modal from './Modal';
import {
  generateSubtaskSuggestions,
  suggestTaskEstimates,
  rewriteTaskDescription,
  summarizeProject,
} from '../../services/aiAssistant';

export default function AIAssistantModal({
  open,
  onClose,
  initialTask = null,
  projects = [],
  allTasks = [],
  onApplySubtasks,
  onApplyEstimates,
  onApplyDescription,
}) {
  const [activeTab, setActiveTab] = useState('breakdown'); // 'breakdown' | 'estimates' | 'rewrite' | 'project'
  const [taskTitle, setTaskTitle] = useState('');
  const [selectedSubtasks, setSelectedSubtasks] = useState({});
  const [suggestedSubtasks, setSuggestedSubtasks] = useState([]);

  // Estimate state
  const [estimateResult, setEstimateResult] = useState(null);

  // Rewrite state
  const [rewrittenText, setRewrittenText] = useState('');

  // Project summary state
  const [selectedProjectId, setSelectedProjectId] = useState('');
  const [projectSummaryResult, setProjectSummaryResult] = useState(null);

  // Sync with initialTask when modal opens
  useEffect(() => {
    if (open) {
      const title = initialTask?.title || '';
      setTaskTitle(title);

      if (title.trim()) {
        // Generate initial suggestions
        const subtasks = generateSubtaskSuggestions(title, initialTask?.description || '');
        setSuggestedSubtasks(subtasks);
        const initialSelected = {};
        subtasks.forEach((st) => {
          initialSelected[st.id] = true;
        });
        setSelectedSubtasks(initialSelected);

        const est = suggestTaskEstimates(title, initialTask?.category || 'Personal');
        setEstimateResult(est);

        const rewritten = rewriteTaskDescription(title, initialTask?.description || '');
        setRewrittenText(rewritten);
      } else {
        setSuggestedSubtasks([]);
        setSelectedSubtasks({});
        setEstimateResult(null);
        setRewrittenText('');
      }

      if (projects.length > 0) {
        const initialProjId = initialTask?.projectId || projects[0]?.id;
        setSelectedProjectId(initialProjId);
        const proj = projects.find((p) => p.id === initialProjId);
        if (proj) {
          setProjectSummaryResult(summarizeProject(proj, allTasks));
        }
      }
    }
  }, [open, initialTask, projects, allTasks]);

  const handleGenerateBreakdown = () => {
    if (!taskTitle.trim()) return;
    const subtasks = generateSubtaskSuggestions(taskTitle);
    setSuggestedSubtasks(subtasks);
    const sel = {};
    subtasks.forEach((st) => {
      sel[st.id] = true;
    });
    setSelectedSubtasks(sel);
  };

  const toggleSubtaskSelection = (id) => {
    setSelectedSubtasks((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const handleAddSubtasks = () => {
    const chosen = suggestedSubtasks.filter((st) => selectedSubtasks[st.id]);
    if (chosen.length > 0 && onApplySubtasks) {
      onApplySubtasks(chosen);
      onClose();
    }
  };

  const handleApplyEstimates = () => {
    if (estimateResult && onApplyEstimates) {
      onApplyEstimates(estimateResult);
      onClose();
    }
  };

  const handleApplyDescription = () => {
    if (rewrittenText && onApplyDescription) {
      onApplyDescription(rewrittenText);
      onClose();
    }
  };

  const handleSelectProject = (projId) => {
    setSelectedProjectId(projId);
    const proj = projects.find((p) => p.id === projId);
    if (proj) {
      setProjectSummaryResult(summarizeProject(proj, allTasks));
    }
  };

  return (
    <Modal open={open} onClose={onClose} title="Toki Intelligent Assistant">
      <div className="flex flex-col gap-4 text-sm text-[var(--color-ink)]">
        {/* Core Principle Banner */}
        <div className="flex items-start gap-2.5 p-3 rounded-xl bg-[var(--color-paper-subtle)] border border-[var(--color-line-subtle)] text-xs text-[var(--color-ink-secondary)]">
          <Sparkles size={16} className="text-[var(--color-coral)] shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            Toki AI assists your productivity without taking control. Suggestions are transparent, reversible, and only applied when you confirm.
          </p>
        </div>

        {/* Tab Selection */}
        <div className="flex items-center gap-1 p-1 rounded-xl bg-[var(--color-paper-deep)] border border-[var(--color-line-subtle)] overflow-x-auto">
          <button
            type="button"
            onClick={() => setActiveTab('breakdown')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all shrink-0 ${
              activeTab === 'breakdown'
                ? 'bg-[var(--color-paper-card)] text-[var(--color-coral)] shadow-sm font-semibold'
                : 'text-[var(--color-ink-secondary)] hover:text-[var(--color-ink)]'
            }`}
          >
            <ListPlus size={14} />
            <span>Break down task</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('estimates')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all shrink-0 ${
              activeTab === 'estimates'
                ? 'bg-[var(--color-paper-card)] text-[var(--color-coral)] shadow-sm font-semibold'
                : 'text-[var(--color-ink-secondary)] hover:text-[var(--color-ink)]'
            }`}
          >
            <Clock size={14} />
            <span>Duration & Priority</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('rewrite')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all shrink-0 ${
              activeTab === 'rewrite'
                ? 'bg-[var(--color-paper-card)] text-[var(--color-coral)] shadow-sm font-semibold'
                : 'text-[var(--color-ink-secondary)] hover:text-[var(--color-ink)]'
            }`}
          >
            <FileEdit size={14} />
            <span>Clarify description</span>
          </button>

          {projects.length > 0 && (
            <button
              type="button"
              onClick={() => setActiveTab('project')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all shrink-0 ${
                activeTab === 'project'
                  ? 'bg-[var(--color-paper-card)] text-[var(--color-coral)] shadow-sm font-semibold'
                  : 'text-[var(--color-ink-secondary)] hover:text-[var(--color-ink)]'
              }`}
            >
              <FolderGit2 size={14} />
              <span>Project next steps</span>
            </button>
          )}
        </div>

        {/* Tab 1: Smart Task Breakdown */}
        {activeTab === 'breakdown' && (
          <div className="flex flex-col gap-3">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-[var(--color-ink-secondary)]">
                Goal or task to break down
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={taskTitle}
                  onChange={(e) => setTaskTitle(e.target.value)}
                  placeholder="e.g. Build my portfolio, Prepare for interview..."
                  className="flex-1 px-3 py-2 text-xs rounded-lg border border-[var(--color-line)] bg-[var(--color-paper-card)] text-[var(--color-ink)] outline-none focus:border-[var(--color-coral)]"
                />
                <button
                  type="button"
                  onClick={handleGenerateBreakdown}
                  className="px-3 py-2 rounded-lg bg-[var(--color-paper-deep)] hover:bg-[var(--color-line)] text-xs font-medium text-[var(--color-ink)] transition-colors shrink-0"
                >
                  Generate
                </button>
              </div>
            </div>

            {suggestedSubtasks.length > 0 && (
              <div className="flex flex-col gap-2 mt-1">
                <div className="flex items-center justify-between text-xs text-[var(--color-muted)]">
                  <span>Select which suggestions to include:</span>
                  <span className="font-semibold text-[var(--color-coral)]">
                    {Object.values(selectedSubtasks).filter(Boolean).length} of {suggestedSubtasks.length} selected
                  </span>
                </div>

                <div className="flex flex-col gap-1.5 max-h-56 overflow-y-auto p-1 border border-[var(--color-line-subtle)] rounded-xl bg-[var(--color-paper-card)]">
                  {suggestedSubtasks.map((st) => (
                    <label
                      key={st.id}
                      className="flex items-center gap-2.5 p-2 rounded-lg hover:bg-[var(--color-paper-deep)] cursor-pointer transition-colors text-xs"
                    >
                      <input
                        type="checkbox"
                        checked={Boolean(selectedSubtasks[st.id])}
                        onChange={() => toggleSubtaskSelection(st.id)}
                        className="w-4 h-4 rounded text-[var(--color-coral)] focus:ring-[var(--color-coral)] accent-[var(--color-coral)] cursor-pointer"
                      />
                      <span className={selectedSubtasks[st.id] ? 'text-[var(--color-ink)]' : 'text-[var(--color-muted)]'}>
                        {st.title}
                      </span>
                    </label>
                  ))}
                </div>

                <div className="flex justify-end gap-2 mt-2">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-3 py-1.5 rounded-lg border border-[var(--color-line)] text-xs text-[var(--color-ink-secondary)] hover:bg-[var(--color-paper-deep)]"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleAddSubtasks}
                    disabled={Object.values(selectedSubtasks).filter(Boolean).length === 0}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[var(--color-coral)] text-white text-xs font-semibold hover:bg-[var(--color-coral-hover)] disabled:opacity-50 transition-colors"
                  >
                    <Plus size={14} />
                    <span>Add {Object.values(selectedSubtasks).filter(Boolean).length} subtasks</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Duration & Priority Suggestions */}
        {activeTab === 'estimates' && (
          <div className="flex flex-col gap-3">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-[var(--color-ink-secondary)]">Task name</label>
              <input
                type="text"
                value={taskTitle}
                onChange={(e) => {
                  setTaskTitle(e.target.value);
                  setEstimateResult(suggestTaskEstimates(e.target.value));
                }}
                placeholder="e.g. Deploy website to production"
                className="px-3 py-2 text-xs rounded-lg border border-[var(--color-line)] bg-[var(--color-paper-card)] text-[var(--color-ink)] outline-none focus:border-[var(--color-coral)]"
              />
            </div>

            {estimateResult && (
              <div className="flex flex-col gap-3 p-3.5 rounded-xl bg-[var(--color-paper-card)] border border-[var(--color-line)] mt-1">
                <div className="flex items-center gap-4">
                  <div className="flex flex-col gap-0.5">
                    <span className="text-[11px] text-[var(--color-muted)]">Suggested Duration</span>
                    <span className="text-sm font-semibold text-[var(--color-coral)]">
                      ⏱️ {estimateResult.estimatedMinutes} minutes
                    </span>
                  </div>
                  <div className="h-8 w-px bg-[var(--color-line)]" />
                  <div className="flex flex-col gap-0.5">
                    <span className="text-[11px] text-[var(--color-muted)]">Suggested Priority</span>
                    <span className="text-sm font-semibold text-[var(--color-ink)]">
                      🎯 {estimateResult.priority}
                    </span>
                  </div>
                </div>

                <div className="flex items-start gap-2 p-2.5 rounded-lg bg-[var(--color-paper-deep)] text-xs text-[var(--color-ink-secondary)]">
                  <HelpCircle size={14} className="text-[var(--color-muted)] shrink-0 mt-0.5" />
                  <span>{estimateResult.reason}</span>
                </div>

                <div className="flex justify-end gap-2 mt-1">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-3 py-1.5 rounded-lg border border-[var(--color-line)] text-xs text-[var(--color-ink-secondary)] hover:bg-[var(--color-paper-deep)]"
                  >
                    Dismiss
                  </button>
                  <button
                    type="button"
                    onClick={handleApplyEstimates}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[var(--color-coral)] text-white text-xs font-semibold hover:bg-[var(--color-coral-hover)] transition-colors"
                  >
                    <Check size={14} />
                    <span>Apply Duration & Priority</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Tab 3: Clarify Description */}
        {activeTab === 'rewrite' && (
          <div className="flex flex-col gap-3">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-[var(--color-ink-secondary)]">Task context</label>
              <input
                type="text"
                value={taskTitle}
                onChange={(e) => {
                  setTaskTitle(e.target.value);
                  setRewrittenText(rewriteTaskDescription(e.target.value));
                }}
                placeholder="e.g. Fix user profile bug"
                className="px-3 py-2 text-xs rounded-lg border border-[var(--color-line)] bg-[var(--color-paper-card)] text-[var(--color-ink)] outline-none focus:border-[var(--color-coral)]"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between text-xs text-[var(--color-muted)]">
                <span>Proposed Actionable Description (Editable):</span>
              </div>
              <textarea
                rows={6}
                value={rewrittenText}
                onChange={(e) => setRewrittenText(e.target.value)}
                className="p-3 text-xs font-mono rounded-xl border border-[var(--color-line)] bg-[var(--color-paper-card)] text-[var(--color-ink)] outline-none focus:border-[var(--color-coral)] resize-y leading-relaxed"
              />
            </div>

            <div className="flex justify-end gap-2 mt-1">
              <button
                type="button"
                onClick={onClose}
                className="px-3 py-1.5 rounded-lg border border-[var(--color-line)] text-xs text-[var(--color-ink-secondary)] hover:bg-[var(--color-paper-deep)]"
              >
                Keep Current
              </button>
              <button
                type="button"
                onClick={handleApplyDescription}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[var(--color-coral)] text-white text-xs font-semibold hover:bg-[var(--color-coral-hover)] transition-colors"
              >
                <Check size={14} />
                <span>Apply Description</span>
              </button>
            </div>
          </div>
        )}

        {/* Tab 4: Project Next Steps */}
        {activeTab === 'project' && projects.length > 0 && (
          <div className="flex flex-col gap-3">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-[var(--color-ink-secondary)]">Select Project</label>
              <select
                value={selectedProjectId}
                onChange={(e) => handleSelectProject(e.target.value)}
                className="px-3 py-2 text-xs rounded-lg border border-[var(--color-line)] bg-[var(--color-paper-card)] text-[var(--color-ink)] outline-none focus:border-[var(--color-coral)]"
              >
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>

            {projectSummaryResult && (
              <div className="flex flex-col gap-3 p-3.5 rounded-xl bg-[var(--color-paper-card)] border border-[var(--color-line)]">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-[var(--color-ink)]">Project Progress</span>
                  <span className="font-bold text-[var(--color-coral)]">{projectSummaryResult.percent}%</span>
                </div>
                <div className="w-full h-1.5 rounded-full bg-[var(--color-paper-deep)] overflow-hidden">
                  <div
                    className="h-full bg-[var(--color-coral)] transition-all duration-300"
                    style={{ width: `${projectSummaryResult.percent}%` }}
                  />
                </div>

                <p className="text-xs text-[var(--color-ink-secondary)] leading-relaxed">
                  {projectSummaryResult.statusSummary}
                </p>

                {projectSummaryResult.nextActions.length > 0 ? (
                  <div className="flex flex-col gap-2 mt-1">
                    <span className="text-[11px] font-bold tracking-wider text-[var(--color-muted)] uppercase">
                      Recommended Next Actions:
                    </span>
                    {projectSummaryResult.nextActions.map((task) => (
                      <div
                        key={task.id}
                        className="flex items-center gap-2 p-2.5 rounded-lg bg-[var(--color-paper-deep)] border border-[var(--color-line-subtle)] text-xs"
                      >
                        <ArrowRight size={13} className="text-[var(--color-coral)] shrink-0" />
                        <span className="font-medium text-[var(--color-ink)] flex-1">{task.title}</span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-[var(--color-paper-card)] text-[var(--color-ink-secondary)] font-mono">
                          {task.priority}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex items-center gap-2 p-2 text-xs text-[var(--color-leaf)]">
                    <CheckCircle2 size={15} />
                    <span>No unblocked pending actions right now!</span>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </Modal>
  );
}
