import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { User, Bell, Globe, LogOut, Check, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { requestNotificationPermission } from '../services/notifications';
import { categories, priorityOptions } from '../utils/task';

const eyebrowCls = 'text-xs font-semibold tracking-wider text-[var(--color-muted)] uppercase';
const sectionCls = 'flex flex-col gap-4 p-5 rounded-xl border border-[var(--color-line)] bg-[var(--color-paper-card)] shadow-[var(--shadow-sm)]';
const rowCls = 'flex items-center justify-between gap-4 py-3 border-b border-[var(--color-line-subtle)] last:border-b-0';
const inputCls = 'px-3 py-2 rounded-lg border border-[var(--color-line)] bg-[var(--color-paper-subtle)] text-sm text-[var(--color-ink)] outline-none focus:border-[var(--color-coral)] transition-all placeholder:text-[var(--color-muted)] min-w-0 max-w-[200px]';
const selectCls = 'px-3 py-2 rounded-lg border border-[var(--color-line)] bg-[var(--color-paper-subtle)] text-sm text-[var(--color-ink)] outline-none focus:border-[var(--color-coral)] transition-all';

export default function Profile() {
  const { user, profile, updateProfile, logout, isConfigured } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    displayName: profile?.displayName || user?.user_metadata?.display_name || '',
    avatarUrl: profile?.avatarUrl || '',
    timezone: profile?.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC',
    themePreference: profile?.themePreference || 'system',
    defaultPriority: profile?.defaultPriority || 'Medium',
    defaultCategory: profile?.defaultCategory || 'Personal',
    notificationsEnabled: profile?.notificationsEnabled ?? true,
  });

  const [saving, setSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (profile) {
      setForm({
        displayName: profile.displayName || '',
        avatarUrl: profile.avatarUrl || '',
        timezone: profile.timezone || 'UTC',
        themePreference: profile.themePreference || 'system',
        defaultPriority: profile.defaultPriority || 'Medium',
        defaultCategory: profile.defaultCategory || 'Personal',
        notificationsEnabled: profile.notificationsEnabled ?? true,
      });
    }
  }, [profile]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleNotificationToggle = async () => {
    if (!form.notificationsEnabled) {
      const perm = await requestNotificationPermission();
      if (perm === 'granted') setForm((prev) => ({ ...prev, notificationsEnabled: true }));
    } else {
      setForm((prev) => ({ ...prev, notificationsEnabled: false }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSuccessMessage('');
    setErrorMessage('');
    try {
      if (user && isConfigured) await updateProfile(form);
      setSuccessMessage('Profile and preferences updated successfully.');
    } catch (err) {
      setErrorMessage(err.message || 'Could not update profile.');
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => { await logout(); navigate('/login'); };

  const displayName = form.displayName || user?.email?.split('@')[0] || 'Guest';
  const initial = displayName.charAt(0).toUpperCase();

  return (
    <motion.div
      className="max-w-2xl mx-auto flex flex-col gap-6"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
    >
      {/* Title */}
      <div>
        <p className={eyebrowCls}>Personal Space &amp; Preferences</p>
        <div className="flex items-center gap-3 mt-1">
          <h1 className="font-['Fraunces'] text-3xl font-semibold text-[var(--color-ink)]">Account Profile</h1>
          <button type="button" onClick={handleLogout}
            className="ml-auto flex items-center gap-1.5 px-3 py-2 rounded-lg border border-[rgba(194,88,77,0.3)] text-[var(--color-red)] text-sm font-semibold hover:bg-[var(--color-red-subtle)] transition-colors">
            <LogOut size={14} /> Sign out
          </button>
        </div>
      </div>

      {/* Avatar banner */}
      <div className="flex items-center gap-4 p-5 rounded-xl border border-[var(--color-line)] bg-[var(--color-paper-card)] shadow-[var(--shadow-sm)]">
        {form.avatarUrl ? (
          <img src={form.avatarUrl} alt={displayName} className="w-14 h-14 rounded-full object-cover border-2 border-[var(--color-line)] shrink-0" />
        ) : (
          <span className="w-14 h-14 rounded-full bg-[var(--color-coral-subtle)] text-[var(--color-coral)] font-bold text-xl flex items-center justify-center border-2 border-[rgba(220,107,84,0.2)] shrink-0">
            {initial}
          </span>
        )}
        <div>
          <strong className="text-base font-semibold text-[var(--color-ink)]">{displayName}</strong>
          <p className="text-sm text-[var(--color-muted)]">{user ? user.email : 'Local guest · tasks saved locally'}</p>
          <span className={`inline-block mt-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${user ? 'bg-[var(--color-leaf-subtle)] text-[var(--color-leaf)]' : 'bg-[var(--color-butter-subtle)] text-[var(--color-butter)]'}`}>
            {user ? 'Synced' : 'Local only'}
          </span>
        </div>
      </div>

      {/* Alerts */}
      {successMessage && (
        <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-[var(--color-leaf-subtle)] border border-[rgba(82,133,98,0.3)] text-[var(--color-leaf)] text-sm" role="status">
          <Check size={16} /> <span>{successMessage}</span>
        </div>
      )}
      {errorMessage && (
        <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-[var(--color-red-subtle)] border border-[rgba(194,88,77,0.3)] text-[var(--color-red)] text-sm" role="alert">
          <AlertCircle size={16} /> <span>{errorMessage}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        {/* Identity */}
        <section className={sectionCls}>
          <div className="flex items-center gap-2 mb-1">
            <User size={17} className="text-[var(--color-muted)]" />
            <h2 className="font-['Fraunces'] font-semibold text-base text-[var(--color-ink)]">Identity</h2>
          </div>
          {[
            { label: 'Display Name', sub: 'How Toki addresses you on your dashboard.', name: 'displayName', type: 'text', placeholder: 'Your name' },
            { label: 'Avatar URL', sub: 'Link to a profile picture (optional).', name: 'avatarUrl', type: 'url', placeholder: 'https://example.com/avatar.jpg' },
          ].map(({ label, sub, name, type, placeholder }) => (
            <div key={name} className={rowCls}>
              <div className="flex flex-col gap-0.5">
                <strong className="text-sm text-[var(--color-ink)]">{label}</strong>
                <small className="text-[11px] text-[var(--color-muted)]">{sub}</small>
              </div>
              <input type={type} name={name} value={form[name]} onChange={handleChange} placeholder={placeholder} className={inputCls} />
            </div>
          ))}
          <div className={rowCls}>
            <div className="flex flex-col gap-0.5">
              <strong className="text-sm text-[var(--color-ink)]">Email Address</strong>
              <small className="text-[11px] text-[var(--color-muted)]">{user ? user.email : 'Local Guest Account'}</small>
            </div>
            <span className={`px-2.5 py-1 rounded-full text-[11px] font-semibold ${user ? 'bg-[var(--color-leaf-subtle)] text-[var(--color-leaf)]' : 'bg-[var(--color-butter-subtle)] text-[var(--color-butter)]'}`}>
              {user ? 'Verified' : 'Guest'}
            </span>
          </div>
        </section>

        {/* Localization */}
        <section className={sectionCls}>
          <div className="flex items-center gap-2 mb-1">
            <Globe size={17} className="text-[var(--color-muted)]" />
            <h2 className="font-['Fraunces'] font-semibold text-base text-[var(--color-ink)]">Localization</h2>
          </div>
          <div className={rowCls}>
            <div className="flex flex-col gap-0.5">
              <strong className="text-sm text-[var(--color-ink)]">Timezone</strong>
              <small className="text-[11px] text-[var(--color-muted)]">Used for accurate streaks, due dates, and daily metrics.</small>
            </div>
            <select name="timezone" value={form.timezone} onChange={handleChange} className={selectCls}>
              {[
                ['UTC', 'UTC (Universal)'],
                ['America/New_York', 'New York (EST/EDT)'],
                ['America/Chicago', 'Chicago (CST/CDT)'],
                ['America/Denver', 'Denver (MST/MDT)'],
                ['America/Los_Angeles', 'Los Angeles (PST/PDT)'],
                ['Europe/London', 'London (GMT/BST)'],
                ['Europe/Paris', 'Paris (CET/CEST)'],
                ['Asia/Tokyo', 'Tokyo (JST)'],
                ['Asia/Kolkata', 'Kolkata (IST)'],
                ['Australia/Sydney', 'Sydney (AEST)'],
              ].map(([val, label]) => <option key={val} value={val}>{label}</option>)}
            </select>
          </div>
        </section>

        {/* Notifications & Defaults */}
        <section className={sectionCls}>
          <div className="flex items-center gap-2 mb-1">
            <Bell size={17} className="text-[var(--color-muted)]" />
            <h2 className="font-['Fraunces'] font-semibold text-base text-[var(--color-ink)]">Notifications &amp; Defaults</h2>
          </div>
          <div className={rowCls}>
            <div className="flex flex-col gap-0.5">
              <strong className="text-sm text-[var(--color-ink)]">Browser Notifications</strong>
              <small className="text-[11px] text-[var(--color-muted)]">Get notified when your Pomodoro session completes.</small>
            </div>
            <button type="button" onClick={handleNotificationToggle} role="switch"
              aria-checked={form.notificationsEnabled}
              className={`relative w-10 h-5.5 rounded-full border transition-colors shrink-0 ${
                form.notificationsEnabled ? 'bg-[var(--color-coral)] border-[var(--color-coral)]' : 'bg-[var(--color-paper-deep)] border-[var(--color-line-strong)]'
              }`}
              style={{ minWidth: 40, height: 22 }}>
              <span className={`absolute top-0.5 w-4.5 h-4.5 rounded-full bg-white shadow transition-transform ${
                form.notificationsEnabled ? 'translate-x-[18px]' : 'translate-x-0.5'
              }`} style={{ width: 18, height: 18 }} />
            </button>
          </div>
          {[
            { name: 'defaultPriority', label: 'Default Task Priority', sub: 'Preselected for new quick-add tasks.', options: priorityOptions },
            { name: 'defaultCategory', label: 'Default Category', sub: 'Default folder for new tasks.', options: categories },
          ].map(({ name, label, sub, options }) => (
            <div key={name} className={rowCls}>
              <div className="flex flex-col gap-0.5">
                <strong className="text-sm text-[var(--color-ink)]">{label}</strong>
                <small className="text-[11px] text-[var(--color-muted)]">{sub}</small>
              </div>
              <select name={name} value={form[name]} onChange={handleChange} className={selectCls}>
                {options.map((o) => <option key={o} value={o}>{o}</option>)}
              </select>
            </div>
          ))}
        </section>

        {/* Save */}
        <div className="flex justify-end">
          <button type="submit" disabled={saving}
            className="px-5 py-2.5 rounded-xl bg-[var(--color-coral)] text-white text-sm font-semibold hover:bg-[var(--color-coral-hover)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
            {saving ? 'Saving changes…' : 'Save profile changes'}
          </button>
        </div>
      </form>
    </motion.div>
  );
}
