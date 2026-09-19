import { createContext, useContext, useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '../services/supabase';
import {
  signUpWithEmail,
  signInWithEmail,
  signOutUser,
  resetPasswordForEmail,
  updateUserPassword,
} from '../services/auth';
import { fetchUserProfile, updateUserProfile } from '../services/profile';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const isConfigured = isSupabaseConfigured();

  // Load session & profile on mount
  useEffect(() => {
    if (!isConfigured) {
      setLoading(false);
      return;
    }

    let mounted = true;

    async function initSession() {
      try {
        const { data: { session: initialSession } } = await supabase.auth.getSession();
        if (mounted) {
          setSession(initialSession);
          setUser(initialSession?.user ?? null);
          if (initialSession?.user) {
            const userProfile = await fetchUserProfile(initialSession.user.id);
            setProfile(userProfile);
          }
        }
      } catch (err) {
        console.warn('Toki: Session init error:', err);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    initSession();

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, newSession) => {
        setSession(newSession);
        setUser(newSession?.user ?? null);

        if (newSession?.user) {
          const userProfile = await fetchUserProfile(newSession.user.id);
          setProfile(userProfile);
        } else {
          setProfile(null);
        }
        setLoading(false);
      }
    );

    return () => {
      mounted = false;
      subscription?.unsubscribe();
    };
  }, [isConfigured]);

  const login = async (email, password) => {
    return signInWithEmail(email, password);
  };

  const signup = async (email, password, displayName) => {
    return signUpWithEmail(email, password, displayName);
  };

  const logout = async () => {
    await signOutUser();
    setUser(null);
    setSession(null);
    setProfile(null);
  };

  const resetPassword = async (email) => {
    return resetPasswordForEmail(email);
  };

  const updatePassword = async (newPassword) => {
    return updateUserPassword(newPassword);
  };

  const updateProfileData = async (updates) => {
    if (!user) return;
    const updated = await updateUserProfile(user.id, updates);
    setProfile((prev) => ({ ...prev, ...updates }));
    return updated;
  };

  const refreshProfile = async () => {
    if (!user) return;
    const p = await fetchUserProfile(user.id);
    setProfile(p);
  };

  const value = {
    user,
    session,
    profile,
    loading,
    isConfigured,
    isAuthenticated: Boolean(user),
    login,
    signup,
    logout,
    resetPassword,
    updatePassword,
    updateProfile: updateProfileData,
    refreshProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
