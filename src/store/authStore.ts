import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface User {
  id: string;
  name: string;
  email: string;
}

interface AuthState {
  // State
  user: User | null;
  isAuthenticated: boolean;
  isBiometricEnabled: boolean;
  isAppLocked: boolean;
  biometricType: 'fingerprint' | 'face' | 'iris' | null;
  
  // Actions
  login: (user: User) => void;
  logout: () => void;
  setUser: (user: User) => void;
  setBiometricEnabled: (enabled: boolean) => void;
  setBiometricType: (type: 'fingerprint' | 'face' | 'iris' | null) => void;
  lockApp: () => void;
  unlockApp: () => void;
  toggleAppLock: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      // Initial state
      user: null,
      isAuthenticated: false,
      isBiometricEnabled: false,
      isAppLocked: false,
      biometricType: null,

      // Actions
      login: (user) =>
        set({
          user,
          isAuthenticated: true,
          isAppLocked: false,
        }),

      logout: () =>
        set({
          user: null,
          isAuthenticated: false,
          isAppLocked: false,
        }),

      setUser: (user) => set({ user }),

      setBiometricEnabled: (enabled) =>
        set({ isBiometricEnabled: enabled }),

      setBiometricType: (type) =>
        set({ biometricType: type }),

      lockApp: () => set({ isAppLocked: true }),

      unlockApp: () => set({ isAppLocked: false }),

      toggleAppLock: () =>
        set((state) => ({ isAppLocked: !state.isAppLocked })),
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
