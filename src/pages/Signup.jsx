import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Eye, EyeOff, UserPlus } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Companion from '../components/companion/Companion';

const inputCls = 'w-full px-4 py-3 rounded-xl border border-[var(--color-line)] bg-[var(--color-paper-subtle)] text-[var(--color-ink)] text-sm outline-none focus:border-[var(--color-coral)] focus:shadow-[0_0_0_3px_var(--color-coral-subtle)] transition-all placeholder:text-[var(--color-muted)]';

export default function Signup() {
  const { signup } = useAuth();
  const navigate = useNavigate();
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (password !== confirm) { setError('Passwords do not match.'); return; }
    if (password.length < 6) { setError('Password must be at least 6 characters.'); return; }
    setLoading(true);
    try {
      await signup(email, password, displayName);
      setSuccess(true);
    } catch (err) {
      setError(err.message || 'Failed to create account. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-[var(--color-paper)]">
        <motion.div
          className="w-full max-w-md flex flex-col items-center gap-5 text-center"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Companion mood="celebrating" size="large" />
          <div>
            <h2 className="font-['Fraunces'] text-2xl font-semibold text-[var(--color-ink)]">You're in! 🎉</h2>
            <p className="text-sm text-[var(--color-muted)] mt-2 leading-relaxed">
              Check your email for a confirmation link, then come back and sign in.
            </p>
          </div>
          <Link to="/login"
            className="flex items-center gap-2 px-5 py-3 rounded-xl bg-[var(--color-coral)] text-white font-semibold text-sm hover:bg-[var(--color-coral-hover)] transition-colors">
            Go to sign in
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[var(--color-paper)]">
      <motion.div
        className="w-full max-w-md flex flex-col gap-6"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
      >
        <div className="flex flex-col items-center gap-3">
          <Companion mood="thinking" size="large" />
          <h1 className="font-['Fraunces'] text-2xl font-semibold text-[var(--color-ink)]">Create your Toki account</h1>
          <p className="text-sm text-[var(--color-muted)]">Sync tasks across all your devices.</p>
        </div>

        <div className="p-6 rounded-2xl border border-[var(--color-line)] bg-[var(--color-paper-card)] shadow-[var(--shadow-md)]">
          <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="signup-name" className="block text-xs font-medium text-[var(--color-ink-secondary)] mb-1.5">Display name</label>
              <input id="signup-name" type="text" autoComplete="name" required value={displayName}
                onChange={(e) => setDisplayName(e.target.value)} placeholder="Your name" className={inputCls} />
            </div>
            <div>
              <label htmlFor="signup-email" className="block text-xs font-medium text-[var(--color-ink-secondary)] mb-1.5">Email address</label>
              <input id="signup-email" type="email" autoComplete="email" required value={email}
                onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" className={inputCls} />
            </div>
            <div>
              <label htmlFor="signup-password" className="block text-xs font-medium text-[var(--color-ink-secondary)] mb-1.5">Password</label>
              <div className="relative">
                <input id="signup-password" type={showPassword ? 'text' : 'password'} autoComplete="new-password" required value={password}
                  onChange={(e) => setPassword(e.target.value)} placeholder="At least 6 characters" className={`${inputCls} pr-11`} />
                <button type="button" onClick={() => setShowPassword((p) => !p)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-muted)] hover:text-[var(--color-ink)] transition-colors"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}>
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
            <div>
              <label htmlFor="signup-confirm" className="block text-xs font-medium text-[var(--color-ink-secondary)] mb-1.5">Confirm password</label>
              <input id="signup-confirm" type={showPassword ? 'text' : 'password'} autoComplete="new-password" required value={confirm}
                onChange={(e) => setConfirm(e.target.value)} placeholder="Repeat your password" className={inputCls} />
            </div>
            {error && (
              <div className="px-3 py-2.5 rounded-lg bg-[var(--color-red-subtle)] border border-[rgba(194,88,77,0.3)] text-[var(--color-red)] text-sm" role="alert">{error}</div>
            )}
            <button type="submit" disabled={loading}
              className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-[var(--color-coral)] text-white font-semibold text-sm hover:bg-[var(--color-coral-hover)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
              <UserPlus size={16} />
              {loading ? 'Creating account…' : 'Create account'}
            </button>
          </form>
          <p className="text-center text-sm text-[var(--color-muted)] mt-4">
            Already have an account?{' '}
            <Link to="/login" className="text-[var(--color-coral)] font-semibold hover:underline">Sign in</Link>
          </p>
        </div>

        <p className="text-center text-xs text-[var(--color-muted)]">
          Prefer local-only? <Link to="/" className="text-[var(--color-coral)] hover:underline">Skip for now</Link>
        </p>
      </motion.div>
    </div>
  );
}
