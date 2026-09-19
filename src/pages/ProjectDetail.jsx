import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Plus,
  Users,
  Sparkles,
  CheckCircle2,
  Trash2,
  Share2,
  Shield,
  Eye,
  Edit3,
} from 'lucide-react';
import TaskCard from '../components/tasks/TaskCard';
import Modal from '../components/common/Modal';
import QuickAddInput from '../components/tasks/QuickAddInput';
import { summarizeProject } from '../services/aiAssistant';

export default function ProjectDetail({
  projects = [],
  tasks = [],
  todos,
  onAdd,
  onEdit,
  onStartFocus,
  onUpdateProject,
  onDeleteProject,
}) {
  const { id } = useParams();
  const navigate = useNavigate();

  const project = projects.find((p) => p.id === id);

  const [statusFilter, setStatusFilter] = useState('all'); // 'all' | 'todo' | 'in_progress' | 'done'
  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  const [aiSummaryOpen, setAiSummaryOpen] = useState(false);

  const [newMember, setNewMember] = useState({
    name: '',
    email: '',
    role: 'editor',
  });

  if (!project) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center max-w-lg mx-auto">
        <h2 className="font-['Fraunces'] font-semibold text-lg text-[var(--color-ink)]">
          Project Not Found
        </h2>
        <p className="text-xs text-[var(--color-muted)] mt-1 mb-4">
          This project may have been deleted or moved.
        </p>
        <Link
          to="/projects"
          className="px-3.5 py-2 rounded-xl bg-[var(--color-coral)] text-white text-xs font-semibold hover:bg-[var(--color-coral-hover)] transition-colors no-underline"
        >
          Back to Projects
        </Link>
      </div>
    );
  }

  const projectTasks = tasks.filter((t) => t.projectId === project.id);
  const total = projectTasks.length;
  const completed = projectTasks.filter((t) => t.completed).length;
  const percent = total > 0 ? Math.round((completed / total) * 100) : 0;
  const totalFocusMinutes = projectTasks.reduce((acc, t) => acc + (t.focusMinutes || 0), 0);

  const filteredTasks = projectTasks.filter((task) => {
    if (statusFilter === 'done') return task.completed;
    if (statusFilter === 'todo') return !task.completed && task.status !== 'in_progress';
    if (statusFilter === 'in_progress') return !task.completed && task.status === 'in_progress';
    return true;
  });

  const handleAddMember = (e) => {
    e.preventDefault();
    if (!newMember.name.trim()) return;

    const currentMembers = project.members || [];
    const updatedMembers = [
      ...currentMembers,
      {
        id: crypto.randomUUID(),
        name: newMember.name.trim(),
        email: newMember.email.trim(),
        role: newMember.role,
      },
    ];

    onUpdateProject(project.id, { members: updatedMembers });
    setNewMember({ name: '', email: '', role: 'editor' });
    setInviteModalOpen(false);
  };

  const handleRemoveMember = (memberId) => {
    const currentMembers = project.members || [];
    const updated = currentMembers.filter((m) => m.id !== memberId);
    onUpdateProject(project.id, { members: updated });
  };

  const aiSummary = summarizeProject(project, tasks);

  return (
    <div className="flex flex-col gap-6 max-w-5xl mx-auto w-full p-4 lg:p-8">
      {/* Top Nav Back button */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => navigate('/projects')}
          className="flex items-center gap-1.5 text-xs text-[var(--color-muted)] hover:text-[var(--color-ink)] transition-colors"
        >
          <ArrowLeft size={14} />
          <span>Back to Projects</span>
        </button>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setAiSummaryOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[var(--color-line)] bg-[var(--color-paper-card)] text-[var(--color-ink)] text-xs font-medium hover:bg-[var(--color-paper-deep)] transition-colors"
          >
            <Sparkles size={13} className="text-[var(--color-coral)]" />
            <span>AI Status & Next Steps</span>
          </button>

          <button
            type="button"
            onClick={() => {
              if (window.confirm(`Delete project "${project.name}"? Tasks will be kept in your backlog.`)) {
                onDeleteProject(project.id);
                navigate('/projects');
              }
            }}
            title="Delete Project"
            className="p-2 rounded-lg border border-[var(--color-line)] text-[var(--color-muted)] hover:text-[var(--color-red)] hover:bg-[var(--color-red-subtle)] transition-colors"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      {/* Project Header Banner */}
      <div className="flex flex-col gap-4 p-6 rounded-2xl border border-[var(--color-line)] bg-[var(--color-paper-card)] shadow-[var(--shadow-sm)]">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <span
              className="w-5 h-5 rounded-full mt-1 shrink-0 shadow-sm"
              style={{ backgroundColor: project.color || 'var(--color-coral)' }}
            />
            <div className="flex flex-col">
              <h1 className="font-['Fraunces'] font-semibold text-2xl text-[var(--color-ink)]">
                {project.name}
              </h1>
              <p className="text-xs text-[var(--color-ink-secondary)] mt-1 max-w-2xl leading-relaxed">
                {project.description || 'No description provided.'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setInviteModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[var(--color-paper-deep)] border border-[var(--color-line)] text-xs font-semibold text-[var(--color-ink)] hover:bg-[var(--color-line-subtle)] transition-colors shrink-0"
          >
            <Users size={13} />
            <span>Team ({project.members?.length || 1})</span>
          </button>
        </div>

        {/* Progress bar */}
        <div className="flex flex-col gap-1.5 pt-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-[11px] text-[var(--color-muted)]">
              {completed} of {total} tasks completed
            </span>
            <span className="font-bold text-xs text-[var(--color-ink)] font-mono">{percent}%</span>
          </div>
          <div className="w-full h-2 rounded-full bg-[var(--color-paper-deep)] overflow-hidden">
            <div
              className="h-full transition-all duration-500 rounded-full"
              style={{
                width: `${percent}%`,
                backgroundColor: project.color || 'var(--color-coral)',
              }}
            />
          </div>
        </div>

        {/* Quick stat chips */}
        <div className="flex items-center gap-4 pt-2 text-[11px] text-[var(--color-muted)] font-mono">
          <span>Active: {total - completed}</span>
          <span>•</span>
          <span>Done: {completed}</span>
          <span>•</span>
          <span>Focus: {Math.round(totalFocusMinutes / 60 * 10) / 10}h</span>
        </div>
      </div>

      {/* Quick Add for this project */}
      <QuickAddInput
        onAdd={(taskData) => onAdd({ ...taskData, projectId: project.id })}
        onOpenDetailed={(prefill) => onAdd({ ...prefill, projectId: project.id })}
        placeholder={`Add a task to ${project.name}… try "Deploy staging tomorrow !high"`}
      />

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-[var(--color-line-subtle)] pb-2 text-xs">
        {[
          { id: 'all', label: 'All Tasks', count: total },
          { id: 'todo', label: 'To Do', count: projectTasks.filter((t) => !t.completed && t.status !== 'in_progress').length },
          { id: 'in_progress', label: 'In Progress', count: projectTasks.filter((t) => !t.completed && t.status === 'in_progress').length },
          { id: 'done', label: 'Done', count: completed },
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setStatusFilter(tab.id)}
            className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
              statusFilter === tab.id
                ? 'bg-[var(--color-coral-subtle)] text-[var(--color-coral)] font-semibold'
                : 'text-[var(--color-ink-secondary)] hover:bg-[var(--color-paper-deep)]'
            }`}
          >
            {tab.label} ({tab.count})
          </button>
        ))}
      </div>

      {/* Tasks List */}
      {filteredTasks.length === 0 ? (
        <div className="p-8 text-center text-xs text-[var(--color-muted)] border border-dashed border-[var(--color-line)] rounded-xl bg-[var(--color-paper-card)]">
          No tasks found in this view. Use the input above to add one!
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {filteredTasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              allTasks={tasks}
              onToggle={() => todos.toggleTask(task.id)}
              onDelete={() => todos.deleteTask(task.id)}
              onEdit={() => onEdit(task)}
              onStartFocus={() => onStartFocus(task.id)}
            />
          ))}
        </div>
      )}

      {/* Team Collaboration / Invite Modal */}
      <Modal
        open={inviteModalOpen}
        onClose={() => setInviteModalOpen(false)}
        title={`Project Members — ${project.name}`}
      >
        <div className="flex flex-col gap-4 text-sm text-[var(--color-ink)]">
          {/* Members List */}
          <div className="flex flex-col gap-2">
            <span className="text-xs font-semibold text-[var(--color-ink-secondary)]">Current Members</span>
            <div className="flex flex-col gap-1.5 max-h-48 overflow-y-auto">
              {(project.members || []).map((member) => (
                <div
                  key={member.id}
                  className="flex items-center justify-between p-2.5 rounded-xl border border-[var(--color-line)] bg-[var(--color-paper-card)] text-xs"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="w-7 h-7 rounded-full bg-[var(--color-coral-subtle)] text-[var(--color-coral)] font-bold text-xs flex items-center justify-center">
                      {(member.name || 'U').charAt(0).toUpperCase()}
                    </span>
                    <div className="flex flex-col leading-tight">
                      <span className="font-semibold text-[var(--color-ink)]">{member.name}</span>
                      <span className="text-[10px] text-[var(--color-muted)]">{member.email || 'Local user'}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[var(--color-paper-deep)] text-[var(--color-ink-secondary)] uppercase">
                      {member.role}
                    </span>
                    {member.role !== 'owner' && (
                      <button
                        type="button"
                        onClick={() => handleRemoveMember(member.id)}
                        className="text-[var(--color-muted)] hover:text-[var(--color-red)] p-1 text-xs"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Add member form */}
          <form onSubmit={handleAddMember} className="flex flex-col gap-3 pt-3 border-t border-[var(--color-line-subtle)]">
            <span className="text-xs font-semibold text-[var(--color-ink-secondary)]">Invite Teammate</span>
            <div className="grid grid-cols-2 gap-2">
              <input
                type="text"
                required
                placeholder="Name"
                value={newMember.name}
                onChange={(e) => setNewMember({ ...newMember, name: e.target.value })}
                className="px-3 py-1.5 rounded-lg border border-[var(--color-line)] bg-[var(--color-paper-card)] text-xs text-[var(--color-ink)] outline-none focus:border-[var(--color-coral)]"
              />
              <input
                type="email"
                placeholder="Email (optional)"
                value={newMember.email}
                onChange={(e) => setNewMember({ ...newMember, email: e.target.value })}
                className="px-3 py-1.5 rounded-lg border border-[var(--color-line)] bg-[var(--color-paper-card)] text-xs text-[var(--color-ink)] outline-none focus:border-[var(--color-coral)]"
              />
            </div>

            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 text-xs">
                <span className="text-xs text-[var(--color-muted)]">Role:</span>
                <select
                  value={newMember.role}
                  onChange={(e) => setNewMember({ ...newMember, role: e.target.value })}
                  className="px-2 py-1 rounded-lg border border-[var(--color-line)] bg-[var(--color-paper-card)] text-xs text-[var(--color-ink)] outline-none"
                >
                  <option value="editor">Editor (Can edit & complete tasks)</option>
                  <option value="viewer">Viewer (Read-only)</option>
                  <option value="owner">Owner (Full permissions)</option>
                </select>
              </div>

              <button
                type="submit"
                className="px-3.5 py-1.5 rounded-lg bg-[var(--color-coral)] text-white text-xs font-semibold hover:bg-[var(--color-coral-hover)] transition-colors shrink-0"
              >
                Add Member
              </button>
            </div>
          </form>
        </div>
      </Modal>

      {/* AI Summary Modal */}
      <Modal
        open={aiSummaryOpen}
        onClose={() => setAiSummaryOpen(false)}
        title={`AI Progress Summary — ${project.name}`}
      >
        <div className="flex flex-col gap-4 text-xs text-[var(--color-ink)] leading-relaxed">
          <p className="text-sm font-medium text-[var(--color-ink)]">
            {aiSummary.statusSummary}
          </p>

          {aiSummary.nextActions.length > 0 && (
            <div className="flex flex-col gap-2 mt-2">
              <span className="font-bold text-[var(--color-muted)] uppercase tracking-wider text-[10px]">
                High-Impact Next Actions:
              </span>
              {aiSummary.nextActions.map((task) => (
                <div
                  key={task.id}
                  className="flex items-center justify-between p-2.5 rounded-lg bg-[var(--color-paper-deep)] border border-[var(--color-line-subtle)]"
                >
                  <span className="font-medium text-[var(--color-ink)]">{task.title}</span>
                  <span className="font-mono text-[10px] text-[var(--color-coral)] font-bold">
                    {task.priority} Priority
                  </span>
                </div>
              ))}
            </div>
          )}

          <div className="flex justify-end pt-3 border-t border-[var(--color-line-subtle)]">
            <button
              type="button"
              onClick={() => setAiSummaryOpen(false)}
              className="px-3.5 py-1.5 rounded-lg bg-[var(--color-coral)] text-white text-xs font-semibold"
            >
              Got it
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
