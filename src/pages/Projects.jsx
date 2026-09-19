import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FolderGit2,
  Plus,
  Users,
  CheckCircle2,
  Clock,
  ChevronRight,
  MoreVertical,
} from 'lucide-react';
import Modal from '../components/common/Modal';

export default function Projects({
  projects = [],
  tasks = [],
  onCreateProject,
  onDeleteProject,
}) {
  const navigate = useNavigate();
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [newProject, setNewProject] = useState({
    name: '',
    description: '',
    color: '#dc6b54',
  });

  const availableColors = [
    { label: 'Coral', value: '#dc6b54' },
    { label: 'Leaf', value: '#4a7c59' },
    { label: 'Ocean', value: '#3b82f6' },
    { label: 'Violet', value: '#8b5cf6' },
    { label: 'Amber', value: '#f59e0b' },
    { label: 'Berry', value: '#ec4899' },
  ];

  const handleCreate = (e) => {
    e.preventDefault();
    if (!newProject.name.trim()) return;

    onCreateProject({
      name: newProject.name.trim(),
      description: newProject.description.trim(),
      color: newProject.color,
      members: [{ id: 'local-owner', name: 'You', email: '', role: 'owner' }],
    });

    setNewProject({ name: '', description: '', color: '#dc6b54' });
    setCreateModalOpen(false);
  };

  return (
    <div className="flex flex-col gap-6 max-w-6xl 2xl:max-w-7xl mx-auto w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-['Fraunces'] font-semibold text-2xl lg:text-3xl text-[var(--color-ink)]">
            Projects
          </h1>
          <p className="text-xs text-[var(--color-muted)] mt-1">
            Organize complex initiatives, track team progress, and collaborate seamlessly.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setCreateModalOpen(true)}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[var(--color-coral)] text-white text-xs font-semibold hover:bg-[var(--color-coral-hover)] transition-all shadow-[var(--shadow-sm)] shrink-0 self-start sm:self-auto"
        >
          <Plus size={15} />
          <span>New Project</span>
        </button>
      </div>

      {/* Projects Grid */}
      {projects.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-12 rounded-2xl border border-dashed border-[var(--color-line)] bg-[var(--color-paper-card)] text-center">
          <div className="w-12 h-12 rounded-2xl bg-[var(--color-coral-subtle)] text-[var(--color-coral)] flex items-center justify-center mb-3">
            <FolderGit2 size={24} />
          </div>
          <h3 className="font-['Fraunces'] font-semibold text-base text-[var(--color-ink)]">
            No projects yet
          </h3>
          <p className="text-xs text-[var(--color-muted)] max-w-sm mt-1 mb-4">
            Group related tasks together into projects to easily measure progress and collaborate with teammates.
          </p>
          <button
            type="button"
            onClick={() => setCreateModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[var(--color-coral)] text-white text-xs font-semibold hover:bg-[var(--color-coral-hover)] transition-colors"
          >
            <Plus size={14} />
            <span>Create your first project</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {projects.map((project) => {
            const projectTasks = tasks.filter((t) => t.projectId === project.id);
            const totalCount = projectTasks.length;
            const completedCount = projectTasks.filter((t) => t.completed).length;
            const activeCount = totalCount - completedCount;
            const percent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;
            const members = project.members || [];

            return (
              <div
                key={project.id}
                onClick={() => navigate(`/projects/${project.id}`)}
                className="group flex flex-col justify-between p-5 rounded-2xl border border-[var(--color-line)] bg-[var(--color-paper-card)] hover:border-[var(--color-line-strong)] hover:shadow-md transition-all cursor-pointer"
              >
                <div>
                  {/* Top line: Color pill + menu */}
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span
                      className="w-3.5 h-3.5 rounded-full shrink-0 shadow-sm"
                      style={{ backgroundColor: project.color || 'var(--color-coral)' }}
                    />
                    <div className="flex items-center gap-1 text-[11px] font-mono font-semibold text-[var(--color-muted)]">
                      <span>{completedCount}/{totalCount} tasks</span>
                      <ChevronRight size={14} className="opacity-0 group-hover:opacity-100 transition-opacity text-[var(--color-coral)]" />
                    </div>
                  </div>

                  <h3 className="font-['Fraunces'] font-semibold text-lg text-[var(--color-ink)] group-hover:text-[var(--color-coral)] transition-colors">
                    {project.name}
                  </h3>
                  <p className="text-xs text-[var(--color-ink-secondary)] mt-1 line-clamp-2 leading-relaxed">
                    {project.description || 'No description provided.'}
                  </p>
                </div>

                {/* Progress bar and metrics */}
                <div className="flex flex-col gap-3 mt-6 pt-4 border-t border-[var(--color-line-subtle)]">
                  <div>
                    <div className="flex items-center justify-between text-xs mb-1.5">
                      <span className="text-[11px] text-[var(--color-muted)]">Progress</span>
                      <span className="font-bold text-xs text-[var(--color-ink)] font-mono">{percent}%</span>
                    </div>
                    <div className="w-full h-1.5 rounded-full bg-[var(--color-paper-deep)] overflow-hidden">
                      <div
                        className="h-full transition-all duration-500 rounded-full"
                        style={{
                          width: `${percent}%`,
                          backgroundColor: project.color || 'var(--color-coral)',
                        }}
                      />
                    </div>
                  </div>

                  {/* Member avatars */}
                  <div className="flex items-center justify-between text-xs text-[var(--color-muted)]">
                    <div className="flex items-center -space-x-1.5 overflow-hidden">
                      {members.slice(0, 3).map((m, idx) => (
                        <span
                          key={m.id || idx}
                          title={`${m.name} (${m.role})`}
                          className="w-6 h-6 rounded-full border-2 border-[var(--color-paper-card)] bg-[var(--color-paper-deep)] text-[10px] font-bold flex items-center justify-center text-[var(--color-ink)]"
                        >
                          {(m.name || 'U').charAt(0).toUpperCase()}
                        </span>
                      ))}
                      {members.length > 3 && (
                        <span className="w-6 h-6 rounded-full border-2 border-[var(--color-paper-card)] bg-[var(--color-paper-deep)] text-[10px] font-bold flex items-center justify-center text-[var(--color-muted)]">
                          +{members.length - 3}
                        </span>
                      )}
                    </div>

                    <span className="text-[11px] font-medium text-[var(--color-ink-secondary)]">
                      {activeCount} active
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create Project Modal */}
      <Modal
        open={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        title="Create New Project"
      >
        <form onSubmit={handleCreate} className="flex flex-col gap-4 text-sm text-[var(--color-ink)]">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-[var(--color-ink-secondary)]">Project Name</label>
            <input
              type="text"
              required
              value={newProject.name}
              onChange={(e) => setNewProject({ ...newProject, name: e.target.value })}
              placeholder="e.g. Website Redesign, Q3 Planning..."
              className="px-3.5 py-2 rounded-xl border border-[var(--color-line)] bg-[var(--color-paper-card)] text-xs text-[var(--color-ink)] outline-none focus:border-[var(--color-coral)]"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-[var(--color-ink-secondary)]">Description</label>
            <textarea
              rows={3}
              value={newProject.description}
              onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
              placeholder="What are the goals of this project?"
              className="px-3.5 py-2 rounded-xl border border-[var(--color-line)] bg-[var(--color-paper-card)] text-xs text-[var(--color-ink)] outline-none focus:border-[var(--color-coral)] resize-none"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-[var(--color-ink-secondary)]">Color Accent</label>
            <div className="flex items-center gap-2">
              {availableColors.map((c) => (
                <button
                  key={c.value}
                  type="button"
                  onClick={() => setNewProject({ ...newProject, color: c.value })}
                  className={`w-7 h-7 rounded-full transition-transform ${
                    newProject.color === c.value ? 'scale-110 ring-2 ring-offset-2 ring-[var(--color-ink)]' : 'hover:scale-105'
                  }`}
                  style={{ backgroundColor: c.value }}
                  title={c.label}
                />
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-[var(--color-line-subtle)] mt-2">
            <button
              type="button"
              onClick={() => setCreateModalOpen(false)}
              className="px-3.5 py-2 rounded-xl border border-[var(--color-line)] text-xs font-medium text-[var(--color-ink-secondary)] hover:bg-[var(--color-paper-deep)]"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!newProject.name.trim()}
              className="px-4 py-2 rounded-xl bg-[var(--color-coral)] text-white text-xs font-semibold hover:bg-[var(--color-coral-hover)] disabled:opacity-40 transition-colors shadow-sm"
            >
              Create Project
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
