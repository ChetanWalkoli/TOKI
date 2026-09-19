import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Eye, EyeOff, LogIn, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Companion from '../components/companion/Companion';

const inputCls = 'w-full px-4 py-3 rounded-xl border border-[var(--color-line)] bg-[var(--color-paper-subtle)] text-[var(--color-ink)] text-sm outline-none focus:border-[var(--color-coral)] focus:shadow-[0_0_0_3px_var(--color-coral-subtle)] transition-all placeholder:text-[var(--color-muted)]';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      navigate('/');
    } catch (err) {
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[var(--color-paper)]">
      <motion.div
        className="w-full max-w-md flex flex-col gap-6"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
      >
        {/* Logo */}
        <div className="flex flex-col items-center gap-3">
          <div className="flex flex-col items-center gap-2">
            <Companion mood="happy" size="large" />
          </div>
          <h1 className="font-['Fraunces'] text-2xl font-semibold text-[var(--color-ink)]">Welcome back to Toki</h1>
          <p className="text-sm text-[var(--color-muted)]">Sign in to sync your tasks across devices.</p>
        </div>

        {/* Card */}
        <div className="p-6 rounded-2xl border border-[var(--color-line)] bg-[var(--color-paper-card)] shadow-[var(--shadow-md)]">
          <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="login-email" className="block text-xs font-medium text-[var(--color-ink-secondary)] mb-1.5">Email address</label>
              <input id="login-email" type="email" autoComplete="email" required value={email}
                onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" className={inputCls} />
            </div>
            <div>
              <label htmlFor="login-password" className="block text-xs font-medium text-[var(--color-ink-secondary)] mb-1.5">Password</label>
              <div className="relative">
                <input id="login-password" type={showPassword ? 'text' : 'password'} autoComplete="current-password" required value={password}
                  onChange={(e) => setPassword(e.target.value)} placeholder="Your password" className={`${inputCls} pr-11`} />
                <button type="button" onClick={() => setShowPassword((p) => !p)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-muted)] hover:text-[var(--color-ink)] transition-colors"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}>
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
            {error && (
              <div className="px-3 py-2.5 rounded-lg bg-[var(--color-red-subtle)] border border-[rgba(194,88,77,0.3)] text-[var(--color-red)] text-sm" role="alert">{error}</div>
            )}
            <button type="submit" disabled={loading}
              className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-[var(--color-coral)] text-white font-semibold text-sm hover:bg-[var(--color-coral-hover)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
              <LogIn size={16} />
              {loading ? 'Signing in…' : 'Sign in'}
            </button>
          </form>
          <p className="text-center text-sm text-[var(--color-muted)] mt-4">
            Don't have an account?{' '}
            <Link to="/signup" className="text-[var(--color-coral)] font-semibold hover:underline">Create one <ArrowRight size={12} className="inline" /></Link>
          </p>
        </div>

        <p className="text-center text-xs text-[var(--color-muted)]">
          Prefer local-only? <Link to="/" className="text-[var(--color-coral)] hover:underline">Continue without account</Link>
        </p>
      </motion.div>
    </div>
  );
}
