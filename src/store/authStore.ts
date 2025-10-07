import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '@/services/supabase';
import type { User, Session } from '@supabase/supabase-js';

interface AuthState {
  // State
  user: User | null;
  session: Session | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isBiometricEnabled: boolean;
  isAppLocked: boolean;
  biometricType: 'fingerprint' | 'face' | 'iris' | null;
  
  // Actions
  signUp: (email: string, password: string, name: string) => Promise<{ error: Error | null }>;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  setSession: (session: Session | null) => void;
  setUser: (user: User | null) => void;
  setBiometricEnabled: (enabled: boolean) => void;
  setBiometricType: (type: 'fingerprint' | 'face' | 'iris' | null) => void;
  lockApp: () => void;
  unlockApp: () => void;
  toggleAppLock: () => void;
  initialize: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      // Initial state
      user: null,
      session: null,
      isAuthenticated: false,
      isLoading: true,
      isBiometricEnabled: false,
      isAppLocked: false,
      biometricType: null,

      // Initialize auth state
      initialize: async () => {
        try {
          const { data: { session } } = await supabase.auth.getSession();
          
          if (session) {
            set({
              session,
              user: session.user,
              isAuthenticated: true,
              isLoading: false,
            });
          } else {
            set({
              session: null,
              user: null,
              isAuthenticated: false,
              isLoading: false,
            });
          }

          // Listen for auth changes
          supabase.auth.onAuthStateChange((_event, session) => {
            set({
              session,
              user: session?.user ?? null,
              isAuthenticated: !!session,
            });
          });
        } catch (error) {
          console.error('Error initializing auth:', error);
          set({ isLoading: false });
        }
      },

      // Sign up new user
      signUp: async (email: string, password: string, name: string) => {
        try {
          const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
              data: {
                name,
              },
            },
          });

          if (error) {
            return { error };
          }

          if (data.session) {
            set({
              session: data.session,
              user: data.user,
              isAuthenticated: true,
              isAppLocked: false,
            });
          }

          return { error: null };
        } catch (error) {
          return { error: error as Error };
        }
      },

      // Sign in existing user
      signIn: async (email: string, password: string) => {
        try {
          const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
          });

          if (error) {
            return { error };
          }

          set({
            session: data.session,
            user: data.user,
            isAuthenticated: true,
            isAppLocked: false,
          });

          return { error: null };
        } catch (error) {
          return { error: error as Error };
        }
      },

      // Sign out user
      signOut: async () => {
        try {
          await supabase.auth.signOut();
          set({
            user: null,
            session: null,
            isAuthenticated: false,
            isAppLocked: false,
          });
        } catch (error) {
          console.error('Error signing out:', error);
        }
      },

      // Set session
      setSession: (session) => set({ session }),

      // Set user
      setUser: (user) => set({ user }),

      // Set biometric enabled
      setBiometricEnabled: (enabled) =>
        set({ isBiometricEnabled: enabled }),

      // Set biometric type
      setBiometricType: (type) =>
        set({ biometricType: type }),

      // Lock app
      lockApp: () => set({ isAppLocked: true }),

      // Unlock app
      unlockApp: () => set({ isAppLocked: false }),

      // Toggle app lock
      toggleAppLock: () =>
        set((state) => ({ isAppLocked: !state.isAppLocked })),
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        isBiometricEnabled: state.isBiometricEnabled,
        biometricType: state.biometricType,
        isAppLocked: state.isAppLocked,
      }),
    }
  )
);
