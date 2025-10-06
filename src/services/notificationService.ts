import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { formatCurrency } from '@/utils/currency';

// Configure notification behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export interface BudgetAlert {
  budgetId: number;
  categoryName: string;
  percentage: number;
  spent: number;
  total: number;
}

export const requestNotificationPermissions = async (): Promise<boolean> => {
  try {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      console.log('Notification permissions not granted');
      return false;
    }

    // Configure notification channel for Android
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('budget-alerts', {
        name: 'Budget Alerts',
        importance: Notifications.AndroidImportance.HIGH,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#6366F1',
      });
    }

    return true;
  } catch (error) {
    console.error('Error requesting notification permissions:', error);
    return false;
  }
};

export const scheduleBudgetAlert = async (alert: BudgetAlert, currencyCode: string = 'USD'): Promise<void> => {
  try {
    const hasPermission = await requestNotificationPermissions();
    if (!hasPermission) {
      return;
    }

    const title = alert.percentage >= 100 
      ? '⚠️ Budget Exceeded!' 
      : '📊 Budget Alert';
    
    const body = alert.percentage >= 100
      ? `You've exceeded your ${alert.categoryName} budget! Spent ${formatCurrency(alert.spent, currencyCode)} of ${formatCurrency(alert.total, currencyCode)} (${alert.percentage.toFixed(0)}%)`
      : `You've used ${alert.percentage.toFixed(0)}% of your ${alert.categoryName} budget. ${formatCurrency(alert.total - alert.spent, currencyCode)} remaining.`;

    await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        data: { 
          budgetId: alert.budgetId,
          type: 'budget-alert',
        },
        sound: true,
        priority: Notifications.AndroidNotificationPriority.HIGH,
      },
      trigger: null, // Send immediately
    });
  } catch (error) {
    console.error('Error scheduling budget alert:', error);
  }
};

export const checkBudgetThresholds = async (
  budgets: Array<{
    id: number;
    categoryName: string;
    amount: number;
    spent: number;
    alertAt80: boolean;
    alertAt100: boolean;
    lastAlertPercentage?: number;
  }>
): Promise<void> => {
  for (const budget of budgets) {
    const percentage = (budget.spent / budget.amount) * 100;
    const lastAlert = budget.lastAlertPercentage || 0;

    // Alert at 80% threshold
    if (budget.alertAt80 && percentage >= 80 && lastAlert < 80) {
      await scheduleBudgetAlert({
        budgetId: budget.id,
        categoryName: budget.categoryName,
        percentage,
        spent: budget.spent,
        total: budget.amount,
      });
    }

    // Alert at 100% threshold
    if (budget.alertAt100 && percentage >= 100 && lastAlert < 100) {
      await scheduleBudgetAlert({
        budgetId: budget.id,
        categoryName: budget.categoryName,
        percentage,
        spent: budget.spent,
        total: budget.amount,
      });
    }
  }
};

export const cancelAllNotifications = async (): Promise<void> => {
  await Notifications.cancelAllScheduledNotificationsAsync();
};

export const getBadgeCount = async (): Promise<number> => {
  return await Notifications.getBadgeCountAsync();
};

export const setBadgeCount = async (count: number): Promise<void> => {
  await Notifications.setBadgeCountAsync(count);
};
