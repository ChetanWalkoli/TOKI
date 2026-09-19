import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { KeyRound, AlertCircle, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Companion from '../components/companion/Companion';

const inputCls = 'w-full px-4 py-3 rounded-xl border border-[var(--color-line)] bg-[var(--color-paper-subtle)] text-[var(--color-ink)] text-sm outline-none focus:border-[var(--color-coral)] focus:shadow-[0_0_0_3px_var(--color-coral-subtle)] transition-all placeholder:text-[var(--color-muted)]';

export default function ForgotPassword() {
  const { resetPassword } = useAuth();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!email.trim()) { setError('Please enter your email address.'); return; }
    setLoading(true);
    try {
      await resetPassword(email.trim());
      setSent(true);
    } catch (err) {
      setError(err.message || 'Unable to send password reset email.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[var(--color-paper)]">
      <motion.div
        className="w-full max-w-md flex flex-col gap-6"
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        {/* Header */}
        <div className="flex flex-col items-center gap-3 text-center">
          <Companion mood="thinking" size="large" />
          <h1 className="font-['Fraunces'] text-2xl font-semibold text-[var(--color-ink)]">Reset password</h1>
          <p className="text-sm text-[var(--color-muted)]">Enter your email and we'll send reset instructions.</p>
        </div>

        {/* Card */}
        <div className="p-6 rounded-2xl border border-[var(--color-line)] bg-[var(--color-paper-card)] shadow-[var(--shadow-md)]">
          {sent ? (
            <div className="flex flex-col items-center gap-4 text-center py-2">
              <CheckCircle2 size={36} className="text-[var(--color-leaf)]" />
              <div>
                <h2 className="font-['Fraunces'] font-semibold text-base text-[var(--color-ink)]">Reset link sent</h2>
                <p className="text-sm text-[var(--color-ink-secondary)] mt-1 leading-relaxed">
                  If an account exists for <strong>{email}</strong>, you will receive password reset instructions shortly.
                </p>
              </div>
              <Link to="/login"
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[var(--color-coral)] text-white font-semibold text-sm hover:bg-[var(--color-coral-hover)] transition-colors">
                Return to sign in
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              {error && (
                <div className="flex items-center gap-2 px-3 py-2.5 rounded-lg bg-[var(--color-red-subtle)] border border-[rgba(194,88,77,0.3)] text-[var(--color-red)] text-sm" role="alert">
                  <AlertCircle size={15} /> <span>{error}</span>
                </div>
              )}
              <div>
                <label htmlFor="reset-email" className="block text-xs font-medium text-[var(--color-ink-secondary)] mb-1.5">Email address</label>
                <input id="reset-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com" required autoFocus className={inputCls} />
              </div>
              <button type="submit" disabled={loading}
                className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-[var(--color-coral)] text-white font-semibold text-sm hover:bg-[var(--color-coral-hover)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                {loading ? <span>Sending…</span> : <><KeyRound size={15} /><span>Send reset link</span></>}
              </button>
            </form>
          )}
        </div>

        <div className="text-center">
          <Link to="/login" className="inline-flex items-center gap-1 text-sm text-[var(--color-muted)] hover:text-[var(--color-coral)] transition-colors">
            <ArrowLeft size={13} /> Back to sign in
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
