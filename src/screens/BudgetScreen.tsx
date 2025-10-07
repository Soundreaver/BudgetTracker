import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { MotiView } from 'moti';
import { Swipeable } from 'react-native-gesture-handler';
import { format, differenceInDays, addMonths } from 'date-fns';
import { triggerHaptic } from '@/utils/haptics';
import { colors, spacing, borderRadius, typography, shadows } from '@/constants/theme';
import {
  BottomSheet,
  AmountInput,
  CategoryPicker,
  DateTimePicker,
  CustomButton,
  CustomInput,
  StatCard,
  EmptyState,
} from '@/components/ui';
import { useBudgetStore, useSettingsStore, useTransactionStore } from '@/store';
import { getCurrencyByCode, formatCurrency } from '@/utils/currency';
import { getAllCategories, getCategoryById } from '@/services/categoryService';
import { getBudgetSpending } from '@/services/budgetService';
import type { BudgetPeriod, Category } from '@/types/database';

interface BudgetCardData {
  id: number;
  categoryName: string;
  categoryIcon: string;
  categoryColor: string;
  amount: number;
  spent: number;
  period: BudgetPeriod;
  startDate: string;
  endDate: string;
}

export const BudgetScreen: React.FC = () => {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showNotificationSettings, setShowNotificationSettings] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);

  // Add budget form state
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [budgetAmount, setBudgetAmount] = useState('');
  const [selectedPeriod, setSelectedPeriod] = useState<BudgetPeriod>('monthly');
  const [startDate, setStartDate] = useState(new Date());
  const [alertThreshold, setAlertThreshold] = useState('80');

  // Notification settings state
  const [budgetAlertsEnabled, setBudgetAlertsEnabled] = useState(true);
  const [alertAt80, setAlertAt80] = useState(true);
  const [alertAt100, setAlertAt100] = useState(true);

  const { activeBudgets, loadActiveBudgets, addBudget, removeBudget } = useBudgetStore();
  const { currency: currencyCode } = useSettingsStore();
  const transactions = useTransactionStore(state => state.transactions);

  useEffect(() => {
    loadData();
  }, [transactions]);

  const loadData = async () => {
    await loadActiveBudgets();
    
    // Load categories
    const loadedCategories = getAllCategories();
    
    // Add "All Categories" option at the beginning
    const allCategoriesOption: Category = {
      id: 0,
      name: 'All Categories',
      icon: '📊',
      color: colors.primary[500],
      type: 'expense',
      budget_limit: null,
      created_at: new Date().toISOString(),
    };
    
    setCategories([allCategoriesOption, ...loadedCategories]);
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await loadData();
    setIsRefreshing(false);
  };

  const handleAddBudget = async () => {
    if (!budgetAmount) {
      await triggerHaptic('error');
      alert('Please enter a budget amount');
      return;
    }

    await triggerHaptic('success');

    // Always start budget from TODAY to avoid counting old transactions
    const today = new Date();
    const endDate = addMonths(today, selectedPeriod === 'monthly' ? 1 : selectedPeriod === 'yearly' ? 12 : 0);

    // If no category selected or "All Categories" (id: 0), set category_id to null
    const categoryId = selectedCategory === 0 ? null : selectedCategory;

    addBudget({
      category_id: categoryId || null,
      amount: parseFloat(budgetAmount),
      period: selectedPeriod,
      start_date: format(today, 'yyyy-MM-dd'),
      end_date: format(endDate, 'yyyy-MM-dd'),
      alert_threshold: parseInt(alertThreshold) || 80,
    });

    // Reset form
    setSelectedCategory(null);
    setBudgetAmount('');
    setSelectedPeriod('monthly');
    setStartDate(new Date());
    setAlertThreshold('80');
    setShowAddModal(false);
  };

  const handleDeleteBudget = async (id: number) => {
    await triggerHaptic('heavy');
    removeBudget(id);
  };

  // Calculate budget card data with real spending
  const budgetCards: BudgetCardData[] = activeBudgets.map((budget) => {
    const spent = getBudgetSpending(budget);
    let categoryName = 'All Categories';
    let categoryIcon = '📊';
    let categoryColor = colors.primary[500];

    if (budget.category_id) {
      const category = getCategoryById(budget.category_id);
      if (category) {
        categoryName = category.name;
        categoryIcon = category.icon;
        categoryColor = category.color;
      }
    }

    return {
      id: budget.id,
      categoryName,
      categoryIcon,
      categoryColor,
      amount: budget.amount,
      spent,
      period: budget.period,
      startDate: budget.start_date,
      endDate: budget.end_date,
    };
  });

  const totalBudgeted = budgetCards.reduce((sum, b) => sum + b.amount, 0);
  const totalSpent = budgetCards.reduce((sum, b) => sum + b.spent, 0);
  const utilizationRate = totalBudgeted > 0 ? (totalSpent / totalBudgeted) * 100 : 0;
  const categoriesWithoutBudgets = 3; // Would calculate from categories

  const getProgressColor = (percentage: number): string => {
    if (percentage < 70) return colors.success[500];
    if (percentage < 90) return colors.warning[500];
    return colors.error[500];
  };

  const getStatusBadge = (percentage: number) => {
    if (percentage < 70) return { label: 'On Track', color: colors.success[500] };
    if (percentage < 100) return { label: 'Warning', color: colors.warning[500] };
    return { label: 'Exceeded', color: colors.error[500] };
  };

  const renderBudgetCard = (budget: BudgetCardData) => {
    const percentage = (budget.spent / budget.amount) * 100;
    const remaining = budget.amount - budget.spent;
    const daysRemaining = differenceInDays(new Date(budget.endDate), new Date());
    const status = getStatusBadge(percentage);
    const progressColor = getProgressColor(percentage);

    const renderRightActions = () => (
      <View style={styles.swipeActions}>
        <TouchableOpacity
          onPress={() => handleDeleteBudget(budget.id)}
          style={styles.deleteAction}
          activeOpacity={0.8}
        >
          <Text style={styles.deleteIcon}>🗑️</Text>
        </TouchableOpacity>
      </View>
    );

    return (
      <Swipeable key={budget.id} renderRightActions={renderRightActions}>
        <MotiView
          from={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'timing', duration: 300 }}
        >
          <View style={[styles.budgetCard, shadows.md]}>
            <View style={styles.budgetCardHeader}>
              <View style={styles.budgetCardInfo}>
                <View
                  style={[
                    styles.budgetIconContainer,
                    { backgroundColor: `${budget.categoryColor}20` },
                  ]}
                >
                  <Text style={styles.budgetIcon}>{budget.categoryIcon}</Text>
                </View>
                <View>
                  <Text style={styles.budgetCategoryName}>{budget.categoryName}</Text>
                  <Text style={styles.budgetPeriod}>{budget.period}</Text>
                </View>
              </View>

              <View
                style={[
                  styles.statusBadge,
                  { backgroundColor: `${status.color}20` },
                ]}
              >
                <Text style={[styles.statusBadgeText, { color: status.color }]}>
                  {status.label}
                </Text>
              </View>
            </View>

            <View style={styles.budgetCardBody}>
              {/* Circular Progress */}
              <View style={styles.circularProgress}>
                <View style={styles.circularProgressInner}>
                  <Text style={[styles.percentageText, { color: progressColor }]}>
                    {percentage.toFixed(0)}%
                  </Text>
                  <Text style={styles.percentageLabel}>spent</Text>
                </View>
              </View>

              <View style={styles.budgetDetails}>
                <View style={styles.budgetAmounts}>
                  <View style={styles.amountRow}>
                    <Text style={styles.amountLabel}>Spent</Text>
                    <Text style={[styles.amountValue, { color: progressColor }]}>
                      {formatCurrency(budget.spent, currencyCode)}
                    </Text>
                  </View>
                  <View style={styles.amountRow}>
                    <Text style={styles.amountLabel}>Budget</Text>
                    <Text style={styles.amountValue}>{formatCurrency(budget.amount, currencyCode)}</Text>
                  </View>
                  <View style={styles.amountRow}>
                    <Text style={styles.amountLabel}>Remaining</Text>
                    <Text
                      style={[
                        styles.amountValue,
                        { color: remaining < 0 ? colors.error[500] : colors.success[500] },
                      ]}
                    >
                      {formatCurrency(Math.abs(remaining), currencyCode)}
                    </Text>
                  </View>
                </View>

                <View style={styles.timeRemaining}>
                  <Text style={styles.timeRemainingIcon}>⏱️</Text>
                  <Text style={styles.timeRemainingText}>
                    {daysRemaining} days remaining
                  </Text>
                </View>
              </View>
            </View>
          </View>
        </MotiView>
      </Swipeable>
    );
  };

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            tintColor={colors.primary[500]}
          />
        }
      >
        {/* Budget Insights */}
        <MotiView
          from={{ opacity: 0, translateY: -20 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'timing', duration: 300 }}
          style={styles.section}
        >
          <Text style={styles.sectionTitle}>Budget Insights</Text>
          <View style={styles.sectionSpacer} />

          <View style={styles.insightsGrid}>
            <View style={styles.insightCard}>
              <StatCard
                title="Total Budgeted"
                value={formatCurrency(totalBudgeted, currencyCode)}
                variant="primary"
                delay={0}
              />
            </View>
            <View style={styles.insightCard}>
              <StatCard
                title="Actual Spent"
                value={formatCurrency(totalSpent, currencyCode)}
                variant={totalSpent > totalBudgeted ? 'error' : 'success'}
                delay={100}
              />
            </View>
            <View style={styles.insightCard}>
              <StatCard
                title="Utilization Rate"
                value={`${utilizationRate.toFixed(1)}%`}
                variant={utilizationRate > 90 ? 'warning' : 'primary'}
                delay={200}
              />
            </View>
            <View style={styles.insightCard}>
              <StatCard
                title="Without Budgets"
                value={`${categoriesWithoutBudgets}`}
                subtitle="categories"
                variant="warning"
                delay={300}
              />
            </View>
          </View>
        </MotiView>

        {/* Budget Cards */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Active Budgets</Text>
            <TouchableOpacity onPress={() => setShowNotificationSettings(true)}>
              <Text style={styles.settingsIcon}>⚙️</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.sectionSpacer} />

          {budgetCards.length > 0 ? (
            budgetCards.map(renderBudgetCard)
          ) : (
            <EmptyState
              variant="budgets"
              onAction={() => setShowAddModal(true)}
            />
          )}
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* FAB */}
      <MotiView
        from={{ scale: 0, rotate: '-180deg' }}
        animate={{ scale: 1, rotate: '0deg' }}
        transition={{ type: 'spring', damping: 15, delay: 300 }}
        style={styles.fabContainer}
      >
        <TouchableOpacity
          onPress={() => {
            loadData(); // Reload categories when opening modal
            setShowAddModal(true);
          }}
          activeOpacity={0.8}
          style={[styles.fab, shadows.xl]}
        >
          <Text style={styles.fabIcon}>+</Text>
        </TouchableOpacity>
      </MotiView>

      {/* Add Budget Modal */}
      <BottomSheet
        visible={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Add Budget"
        snapPoint={85}
      >
        <View style={styles.modalContent}>
          <View style={styles.modalSection}>
            <Text style={styles.modalSectionTitle}>Category (Optional - Leave blank for all)</Text>
            <CategoryPicker
              categories={categories}
              selectedId={selectedCategory || undefined}
              onSelect={(cat) => setSelectedCategory(cat.id)}
              columns={4}
            />
          </View>

          <AmountInput
            value={budgetAmount}
            onChangeValue={setBudgetAmount}
            label="Budget Amount"
            suggestedAmounts={[100, 250, 500, 1000]}
          />

          <View style={styles.modalSection}>
            <Text style={styles.modalSectionTitle}>Period</Text>
            <View style={styles.periodSelector}>
              {(['weekly', 'monthly', 'yearly'] as BudgetPeriod[]).map((period) => (
                <TouchableOpacity
                  key={period}
                  onPress={() => setSelectedPeriod(period)}
                  style={[
                    styles.periodButton,
                    selectedPeriod === period && styles.periodButtonActive,
                  ]}
                >
                  <Text
                    style={[
                      styles.periodButtonText,
                      selectedPeriod === period && styles.periodButtonTextActive,
                    ]}
                  >
                    {period.charAt(0).toUpperCase() + period.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.infoBox}>
            <Text style={styles.infoText}>
              💡 Budget will start from today and track new expenses only
            </Text>
          </View>

          <CustomInput
            label="Alert Threshold (%)"
            value={alertThreshold}
            onChangeText={setAlertThreshold}
            keyboardType="numeric"
            placeholder="80"
          />

          <CustomButton
            onPress={handleAddBudget}
            variant="primary"
            size="lg"
            fullWidth
            hapticFeedback="medium"
          >
            Save Budget
          </CustomButton>
        </View>
      </BottomSheet>

      {/* Notification Settings Modal */}
      <BottomSheet
        visible={showNotificationSettings}
        onClose={() => setShowNotificationSettings(false)}
        title="Notification Settings"
        snapPoint={60}
      >
        <View style={styles.modalContent}>
          <View style={styles.settingRow}>
            <View>
              <Text style={styles.settingLabel}>Budget Alerts</Text>
              <Text style={styles.settingDescription}>
                Get notified when approaching budget limits
              </Text>
            </View>
            <TouchableOpacity
              onPress={() => setBudgetAlertsEnabled(!budgetAlertsEnabled)}
              style={[
                styles.toggle,
                budgetAlertsEnabled && styles.toggleActive,
              ]}
            >
              <View
                style={[
                  styles.toggleKnob,
                  budgetAlertsEnabled && styles.toggleKnobActive,
                ]}
              />
            </TouchableOpacity>
          </View>

          {budgetAlertsEnabled && (
            <>
              <View style={styles.settingRow}>
                <Text style={styles.settingLabel}>Alert at 80%</Text>
                <TouchableOpacity
                  onPress={() => setAlertAt80(!alertAt80)}
                  style={[styles.checkbox, alertAt80 && styles.checkboxActive]}
                >
                  {alertAt80 && <Text style={styles.checkmark}>✓</Text>}
                </TouchableOpacity>
              </View>

              <View style={styles.settingRow}>
                <Text style={styles.settingLabel}>Alert at 100%</Text>
                <TouchableOpacity
                  onPress={() => setAlertAt100(!alertAt100)}
                  style={[styles.checkbox, alertAt100 && styles.checkboxActive]}
                >
                  {alertAt100 && <Text style={styles.checkmark}>✓</Text>}
                </TouchableOpacity>
              </View>
            </>
          )}

          <CustomButton
            onPress={() => setShowNotificationSettings(false)}
            variant="primary"
            size="lg"
            fullWidth
          >
            Save Settings
          </CustomButton>
        </View>
      </BottomSheet>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.neutral[50],
  },
  scrollView: {
    flex: 1,
  },
  section: {
    padding: spacing.xl,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionSpacer: {
    height: spacing.md,
  },
  sectionTitle: {
    ...typography.heading5,
    color: colors.neutral[900],
  },
  settingsIcon: {
    fontSize: 24,
  },
  insightsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: spacing.md,
  },
  insightCard: {
    width: '48%',
  },
  budgetCard: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    marginBottom: spacing.md,
  },
  budgetCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  budgetCardInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  budgetIconContainer: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  budgetIcon: {
    fontSize: 24,
  },
  budgetCategoryName: {
    ...typography.bodyBold,
    color: colors.neutral[900],
  },
  budgetPeriod: {
    ...typography.small,
    color: colors.neutral[500],
    textTransform: 'capitalize',
  },
  statusBadge: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
  },
  statusBadgeText: {
    ...typography.small,
    fontWeight: '600',
  },
  budgetCardBody: {
    flexDirection: 'row',
    gap: spacing.lg,
  },
  circularProgress: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: colors.neutral[100],
    alignItems: 'center',
    justifyContent: 'center',
  },
  circularProgressInner: {
    alignItems: 'center',
  },
  percentageText: {
    ...typography.heading4,
    fontWeight: '700',
  },
  percentageLabel: {
    ...typography.small,
    color: colors.neutral[600],
  },
  budgetDetails: {
    flex: 1,
    justifyContent: 'space-between',
  },
  budgetAmounts: {
    gap: spacing.sm,
  },
  amountRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  amountLabel: {
    ...typography.caption,
    color: colors.neutral[600],
  },
  amountValue: {
    ...typography.bodyBold,
    color: colors.neutral[900],
  },
  timeRemaining: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: colors.neutral[100],
    padding: spacing.sm,
    borderRadius: borderRadius.md,
  },
  timeRemainingIcon: {
    fontSize: 16,
  },
  timeRemainingText: {
    ...typography.small,
    color: colors.neutral[700],
  },
  swipeActions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginLeft: spacing.xs,
  },
  deleteAction: {
    backgroundColor: colors.error[500],
    justifyContent: 'center',
    alignItems: 'center',
    width: 60,
    height: 136,
    borderRadius: borderRadius.lg,
    ...shadows.sm,
  },
  deleteIcon: {
    fontSize: 28,
  },
  fabContainer: {
    position: 'absolute',
    bottom: spacing.xl,
    right: spacing.xl,
  },
  fab: {
    width: 64,
    height: 64,
    borderRadius: borderRadius.full,
    backgroundColor: colors.primary[500],
    alignItems: 'center',
    justifyContent: 'center',
  },
  fabIcon: {
    fontSize: 32,
    color: colors.white,
    fontWeight: '300',
  },
  modalContent: {
    gap: spacing.lg,
  },
  modalSection: {
    gap: spacing.sm,
  },
  modalSectionTitle: {
    ...typography.captionBold,
    color: colors.neutral[700],
  },
  periodSelector: {
    flexDirection: 'row',
    backgroundColor: colors.neutral[100],
    borderRadius: borderRadius.lg,
    padding: spacing.xs,
  },
  periodButton: {
    flex: 1,
    paddingVertical: spacing.sm,
    alignItems: 'center',
    borderRadius: borderRadius.md,
  },
  periodButtonActive: {
    backgroundColor: colors.primary[500],
  },
  periodButtonText: {
    ...typography.caption,
    color: colors.neutral[600],
    fontWeight: '500',
  },
  periodButtonTextActive: {
    color: colors.white,
    fontWeight: '600',
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.md,
  },
  settingLabel: {
    ...typography.body,
    color: colors.neutral[900],
  },
  settingDescription: {
    ...typography.small,
    color: colors.neutral[600],
    marginTop: spacing.xs,
  },
  toggle: {
    width: 51,
    height: 31,
    borderRadius: borderRadius.full,
    backgroundColor: colors.neutral[300],
    padding: 2,
  },
  toggleActive: {
    backgroundColor: colors.primary[500],
  },
  toggleKnob: {
    width: 27,
    height: 27,
    borderRadius: borderRadius.full,
    backgroundColor: colors.white,
  },
  toggleKnobActive: {
    transform: [{ translateX: 20 }],
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: borderRadius.sm,
    borderWidth: 2,
    borderColor: colors.neutral[300],
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxActive: {
    backgroundColor: colors.primary[500],
    borderColor: colors.primary[500],
  },
  checkmark: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
  infoBox: {
    backgroundColor: colors.primary[50],
    padding: spacing.md,
    borderRadius: borderRadius.md,
    borderLeftWidth: 3,
    borderLeftColor: colors.primary[500],
  },
  infoText: {
    ...typography.caption,
    color: colors.primary[700],
    lineHeight: 18,
  },
});
