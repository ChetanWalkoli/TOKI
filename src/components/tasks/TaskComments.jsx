import { useState } from 'react';
import { MessageSquare, Send, User } from 'lucide-react';

export default function TaskComments({
  comments = [],
  onAddComment,
  currentUser = null,
}) {
  const [content, setContent] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    const clean = content.trim();
    if (!clean) return;

    const newComment = {
      id: crypto.randomUUID(),
      userId: currentUser?.id || 'local-user',
      userName: currentUser?.user_metadata?.display_name || currentUser?.email?.split('@')[0] || 'You',
      userAvatar: currentUser?.user_metadata?.avatar_url || '',
      content: clean,
      createdAt: Date.now(),
    };

    onAddComment(newComment);
    setContent('');
  };

  return (
    <div className="flex flex-col gap-2.5 pt-2 border-t border-[var(--color-line-subtle)]">
      <div className="flex items-center gap-1.5 text-xs font-semibold text-[var(--color-ink)]">
        <MessageSquare size={14} className="text-[var(--color-coral)]" />
        <span>Discussion ({comments.length})</span>
      </div>

      {/* Comments List */}
      {comments.length > 0 && (
        <div className="flex flex-col gap-2 max-h-48 overflow-y-auto pr-1">
          {comments.map((comment) => {
            const initial = (comment.userName || 'A').charAt(0).toUpperCase();
            const dateStr = new Date(comment.createdAt).toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
            });

            return (
              <div
                key={comment.id}
                className="flex items-start gap-2.5 p-2 rounded-lg bg-[var(--color-paper-deep)] border border-[var(--color-line-subtle)] text-xs"
              >
                {comment.userAvatar ? (
                  <img
                    src={comment.userAvatar}
                    alt={comment.userName}
                    className="w-6 h-6 rounded-full object-cover shrink-0 mt-0.5"
                  />
                ) : (
                  <span className="w-6 h-6 rounded-full bg-[var(--color-coral-subtle)] text-[var(--color-coral)] font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                    {initial}
                  </span>
                )}
                <div className="flex flex-col flex-1 overflow-hidden leading-snug">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-semibold text-[var(--color-ink)]">{comment.userName}</span>
                    <span className="text-[10px] text-[var(--color-muted)] font-mono">{dateStr}</span>
                  </div>
                  <p className="text-[var(--color-ink-secondary)] mt-0.5 break-words whitespace-pre-wrap">
                    {comment.content}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Input form */}
      <form onSubmit={handleSubmit} className="flex items-center gap-2 mt-1">
        <input
          type="text"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Add a comment or team update…"
          className="flex-1 px-3 py-1.5 rounded-lg border border-[var(--color-line)] bg-[var(--color-paper-card)] text-xs text-[var(--color-ink)] outline-none focus:border-[var(--color-coral)]"
        />
        <button
          type="submit"
          disabled={!content.trim()}
          className="p-1.5 rounded-lg bg-[var(--color-coral)] text-white hover:bg-[var(--color-coral-hover)] disabled:opacity-40 transition-colors shrink-0"
        >
          <Send size={13} />
        </button>
      </form>
    </div>
  );
}
