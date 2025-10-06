import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

type Theme = 'light' | 'dark' | 'system';
type DateFormat = 'MM/DD/YYYY' | 'DD/MM/YYYY' | 'YYYY-MM-DD';

interface NotificationPreferences {
  budgetAlerts: boolean;
  transactionReminders: boolean;
  savingsGoalReminders: boolean;
  weeklyReport: boolean;
  monthlyReport: boolean;
  pushEnabled: boolean;
  emailEnabled: boolean;
}

interface DataSettings {
  autoBackup: boolean;
  backupFrequency: 'daily' | 'weekly' | 'monthly';
  lastBackupDate: string | null;
  cloudSyncEnabled: boolean;
  exportFormat: 'json' | 'csv' | 'pdf';
}

interface SettingsState {
  // State
  theme: Theme;
  currency: string;
  dateFormat: DateFormat;
  notifications: NotificationPreferences;
  dataSettings: DataSettings;
  language: string;
  passcodeEnabled: boolean;
  passcode: string | null;

  // Actions
  setTheme: (theme: Theme) => void;
  setCurrency: (currency: string) => void;
  setDateFormat: (format: DateFormat) => void;
  setLanguage: (language: string) => void;
  updateNotifications: (preferences: Partial<NotificationPreferences>) => void;
  toggleNotification: (key: keyof NotificationPreferences) => void;
  updateDataSettings: (settings: Partial<DataSettings>) => void;
  setAutoBackup: (enabled: boolean) => void;
  setBackupFrequency: (frequency: 'daily' | 'weekly' | 'monthly') => void;
  updateLastBackupDate: () => void;
  setCloudSync: (enabled: boolean) => void;
  setExportFormat: (format: 'json' | 'csv' | 'pdf') => void;
  enablePasscode: (passcode: string) => void;
  disablePasscode: () => void;
  verifyPasscode: (passcode: string) => boolean;
  resetSettings: () => void;
}

const initialNotifications: NotificationPreferences = {
  budgetAlerts: true,
  transactionReminders: true,
  savingsGoalReminders: true,
  weeklyReport: false,
  monthlyReport: true,
  pushEnabled: true,
  emailEnabled: false,
};

const initialDataSettings: DataSettings = {
  autoBackup: false,
  backupFrequency: 'weekly',
  lastBackupDate: null,
  cloudSyncEnabled: false,
  exportFormat: 'json',
};

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set, get) => ({
      // Initial state
      theme: 'system',
      currency: 'USD',
      dateFormat: 'MM/DD/YYYY',
      notifications: initialNotifications,
      dataSettings: initialDataSettings,
      language: 'en',
      passcodeEnabled: false,
      passcode: null,

      // Actions
      setTheme: (theme) => set({ theme }),

      setCurrency: (currency) => set({ currency }),

      setDateFormat: (format) => set({ dateFormat: format }),

      setLanguage: (language) => set({ language }),

      updateNotifications: (preferences) =>
        set((state) => ({
          notifications: { ...state.notifications, ...preferences },
        })),

      toggleNotification: (key) =>
        set((state) => ({
          notifications: {
            ...state.notifications,
            [key]: !state.notifications[key],
          },
        })),

      updateDataSettings: (settings) =>
        set((state) => ({
          dataSettings: { ...state.dataSettings, ...settings },
        })),

      setAutoBackup: (enabled) =>
        set((state) => ({
          dataSettings: { ...state.dataSettings, autoBackup: enabled },
        })),

      setBackupFrequency: (frequency) =>
        set((state) => ({
          dataSettings: { ...state.dataSettings, backupFrequency: frequency },
        })),

      updateLastBackupDate: () =>
        set((state) => ({
          dataSettings: {
            ...state.dataSettings,
            lastBackupDate: new Date().toISOString(),
          },
        })),

      setCloudSync: (enabled) =>
        set((state) => ({
          dataSettings: { ...state.dataSettings, cloudSyncEnabled: enabled },
        })),

      setExportFormat: (format) =>
        set((state) => ({
          dataSettings: { ...state.dataSettings, exportFormat: format },
        })),

      enablePasscode: (passcode) =>
        set({
          passcodeEnabled: true,
          passcode,
        }),

      disablePasscode: () =>
        set({
          passcodeEnabled: false,
          passcode: null,
        }),

      verifyPasscode: (passcode) => {
        const { passcode: storedPasscode } = get();
        return storedPasscode === passcode;
      },

      resetSettings: () =>
        set({
          theme: 'system',
          currency: 'USD',
          dateFormat: 'MM/DD/YYYY',
          notifications: initialNotifications,
          dataSettings: initialDataSettings,
          language: 'en',
          passcodeEnabled: false,
          passcode: null,
        }),
    }),
    {
      name: 'settings-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
