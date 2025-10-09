import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { MotiView } from 'moti';
import { Skeleton } from 'moti/skeleton';
import { Ionicons } from '@expo/vector-icons';
import { format } from 'date-fns';
import { triggerHaptic } from '@/utils/haptics';
import { colors, spacing, borderRadius, typography, shadows } from '@/constants/theme';
import {
  StatCard,
  TransactionCard,
  BudgetProgressCard,
  BottomSheet,
  AmountInput,
  CategoryPicker,
  DateTimePicker,
  CustomInput,
  CustomButton,
  PendingTransactionsModal,
} from '@/components/ui';
import { useAuthStore, useBudgetStore, useTransactionStore, useSettingsStore } from '@/store';
import { usePendingTransactions } from '@/hooks/usePendingTransactions';
import { getAllCategories } from '@/services/categoryService';
import { getCurrencyByCode, formatCurrency } from '@/utils/currency';
import type { Category } from '@/types/database';

const { width } = Dimensions.get('window');

export const DashboardScreen: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showTransactionModal, setShowTransactionModal] = useState(false);
  const [showPendingModal, setShowPendingModal] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  
  // Add transaction form state
  const [amount, setAmount] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [description, setDescription] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [paymentMethod, setPaymentMethod] = useState('');
  const [isRecurring, setIsRecurring] = useState(false);
  const [transactionType, setTransactionType] = useState<'income' | 'expense'>('expense');
  const [isAddingTransaction, setIsAddingTransaction] = useState(false);

  const { user } = useAuthStore();
  const { activeBudgets, loadActiveBudgets } = useBudgetStore();
  const { filteredTransactions, loadTransactions, getTotals, addTransaction } = useTransactionStore();
  const { currency: currencyCode } = useSettingsStore();
  const { pendingCount } = usePendingTransactions();
  const currency = getCurrencyByCode(currencyCode);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setIsLoading(true);
      
      // Load categories
      const loadedCategories = await getAllCategories();
      setCategories(loadedCategories);
      
      // Load budgets and transactions
      await Promise.all([loadActiveBudgets(), loadTransactions()]);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await loadData();
    setIsRefreshing(false);
  };

  const handleFABPress = async () => {
    await triggerHaptic('medium');
    
    // Reload categories when opening modal
    try {
      const loadedCategories = await getAllCategories();
      setCategories(loadedCategories);
    } catch (error) {
      console.error('Error loading categories:', error);
    }
    
    setShowTransactionModal(true);
  };

  const handleAddTransaction = async () => {
    if (!amount) {
      alert('Please enter an amount');
      return;
    }

    if (!selectedCategory) {
      alert('Please select a category');
      return;
    }

    setIsAddingTransaction(true);
    try {
      await triggerHaptic('success');
      
      await addTransaction({
        category_id: selectedCategory,
        amount: parseFloat(amount),
        description: description || 'No description',
        date: format(selectedDate, 'yyyy-MM-dd'),
        type: transactionType,
        payment_method: paymentMethod || 'cash',
        is_recurring: isRecurring,
        recurring_frequency: isRecurring ? 'monthly' : null,
      });

      // Reset form
      setAmount('');
      setSelectedCategory(null);
      setDescription('');
      setPaymentMethod('');
      setIsRecurring(false);
      setTransactionType('expense');
      setShowTransactionModal(false);
      
      // Reload data
      await loadData();
    } catch (error) {
      console.error('Error adding transaction:', error);
      alert('Failed to add transaction. Please try again.');
    } finally {
      setIsAddingTransaction(false);
    }
  };

  const totals = getTotals();
  const balance = totals.balance;
  const recentTransactions = filteredTransactions.slice(0, 5);

  // Calculate quick stats
  const savingsRate = totals.income > 0 
    ? ((totals.income - totals.expenses) / totals.income) * 100 
    : 0;

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

  if (isLoading) {
    return (
      <View style={styles.container}>
        <DashboardSkeleton />
      </View>
    );
  }

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
        {/* Header Section */}
        <MotiView
          from={{ opacity: 0, translateY: -20 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'timing', duration: 300 }}
          style={styles.header}
        >
          <View style={styles.headerTop}>
            <View>
              <Text style={styles.greeting}>{getGreeting()},</Text>
              <Text style={styles.userName}>{user?.email?.split('@')[0] || 'User'}</Text>
              <Text style={styles.date}>{format(new Date(), 'EEEE, MMMM dd')}</Text>
            </View>
            <View style={styles.headerActions}>
              <TouchableOpacity 
                style={styles.notificationButton}
                onPress={async () => {
                  await triggerHaptic('light');
                  setShowPendingModal(true);
                }}
              >
                {pendingCount > 0 && (
                  <View style={styles.notificationBadge}>
                    <Text style={styles.badgeText}>{pendingCount}</Text>
                  </View>
                )}
                <Ionicons name="notifications-outline" size={24} color={colors.neutral[700]} />
              </TouchableOpacity>
              <TouchableOpacity style={styles.settingsButton}>
                <Ionicons name="settings-outline" size={24} color={colors.neutral[700]} />
              </TouchableOpacity>
            </View>
          </View>

          <MotiView
            from={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', damping: 15, delay: 100 }}
            style={styles.balanceCard}
          >
            <Text style={styles.balanceLabel}>Total Balance</Text>
            <Text style={styles.balanceAmount}>
              {formatCurrency(balance, currencyCode)}
            </Text>
          </MotiView>
        </MotiView>

        {/* Quick Stats Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Stats</Text>
          <View style={styles.sectionSpacer} />
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.quickStatsContainer}
          >
            <View style={styles.statCardWrapper}>
              <StatCard
                title="This Month's Income"
                value={formatCurrency(totals.income, currencyCode)}
                variant="success"
                trend={{ value: 12, isPositive: true }}
                delay={0}
              />
            </View>
            <View style={styles.statCardWrapper}>
              <StatCard
                title="This Month's Expenses"
                value={formatCurrency(totals.expenses, currencyCode)}
                variant="error"
                trend={{ value: 8, isPositive: false }}
                delay={100}
              />
            </View>
            <View style={styles.statCardWrapper}>
              <StatCard
                title="Savings Rate"
                value={`${savingsRate.toFixed(1)}%`}
                variant="primary"
                subtitle="of income"
                delay={200}
              />
            </View>
            <View style={styles.statCardWrapper}>
              <StatCard
                title="Top Category"
                value="Food"
                variant="warning"
                subtitle="$234 spent"
                delay={300}
              />
            </View>
          </ScrollView>
        </View>

        {/* Budget Overview Section */}
        {activeBudgets.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Budget Overview</Text>
              <TouchableOpacity>
                <Text style={styles.seeAllText}>See All</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.sectionSpacer} />
            {activeBudgets.slice(0, 3).map((budget, index) => (
              <MotiView
                key={budget.id}
                from={{ opacity: 0, translateX: -20 }}
                animate={{ opacity: 1, translateX: 0 }}
                transition={{ type: 'timing', duration: 300, delay: index * 100 }}
              >
                <BudgetProgressCard
                  categoryName="General" // Would get from category using budget.category_id
                  categoryIcon="📊"
                  categoryColor={colors.primary[500]}
                  budgetAmount={budget.amount}
                  spentAmount={0} // Would calculate from transactions
                  period={budget.period}
                />
              </MotiView>
            ))}
          </View>
        )}

        {/* Recent Transactions Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Transactions</Text>
            <TouchableOpacity>
              <Text style={styles.seeAllText}>See All</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.sectionSpacer} />
          {recentTransactions.length > 0 ? (
            recentTransactions.map((transaction) => {
              const category = categories.find(c => c.id === transaction.category_id);
              return (
                <TransactionCard
                  key={transaction.id}
                  id={transaction.id}
                  amount={transaction.amount}
                  description={transaction.description}
                  category={{
                    name: category?.name || 'Category',
                    icon: category?.icon || '💰',
                    color: category?.color || colors.primary[500],
                  }}
                  date={transaction.date}
                  type={transaction.type}
                  onPress={() => console.log('View transaction')}
                  onEdit={(id) => console.log('Edit', id)}
                  onDelete={(id) => console.log('Delete', id)}
                />
              );
            })
          ) : (
            <MotiView
              from={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ type: 'timing', duration: 300 }}
            >
              <View style={styles.emptyTransactions}>
                <Ionicons name="cash-outline" size={64} color={colors.neutral[300]} />
                <Text style={styles.emptyText}>No recent transactions</Text>
                <Text style={styles.emptySubtext}>Tap the + button to add your first transaction</Text>
              </View>
            </MotiView>
          )}
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Floating Action Button */}
      <MotiView
        from={{ scale: 0, rotate: '-180deg' }}
        animate={{ scale: 1, rotate: '0deg' }}
        transition={{ type: 'spring', damping: 15, delay: 500 }}
        style={styles.fabContainer}
      >
        <TouchableOpacity
          onPress={handleFABPress}
          activeOpacity={0.8}
          style={[styles.fab, shadows.xl]}
        >
          <Ionicons name="add" size={32} color={colors.white} />
        </TouchableOpacity>
      </MotiView>

      {/* Pending Transactions Modal */}
      <PendingTransactionsModal
        visible={showPendingModal}
        onClose={() => setShowPendingModal(false)}
      />

      {/* Transaction Entry Modal */}
      <BottomSheet
        visible={showTransactionModal}
        onClose={() => setShowTransactionModal(false)}
        title="Add Transaction"
        snapPoint={85}
      >
        <View style={styles.typeSelector}>
          <TouchableOpacity
            onPress={() => setTransactionType('expense')}
            style={[
              styles.typeButton,
              transactionType === 'expense' && styles.typeButtonActive,
            ]}
          >
            <Text
              style={[
                styles.typeButtonText,
                transactionType === 'expense' && styles.typeButtonTextActive,
              ]}
            >
              Expense
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setTransactionType('income')}
            style={[
              styles.typeButton,
              transactionType === 'income' && styles.typeButtonActive,
            ]}
          >
            <Text
              style={[
                styles.typeButtonText,
                transactionType === 'income' && styles.typeButtonTextActive,
              ]}
            >
              Income
            </Text>
          </TouchableOpacity>
        </View>

        <AmountInput
          value={amount}
          onChangeValue={setAmount}
          label="Amount"
          suggestedAmounts={[10, 25, 50, 100, 200]}
        />

        <View style={styles.modalSection}>
          <Text style={styles.modalSectionTitle}>Category</Text>
          {categories.length > 0 ? (
            <CategoryPicker
              categories={categories.map((cat, idx) => ({
                id: idx,
                name: cat.name,
                icon: cat.icon,
                color: cat.color,
              }))}
              selectedId={selectedCategory ? categories.findIndex(c => c.id === selectedCategory) : undefined}
              onSelect={cat => setSelectedCategory(categories[cat.id].id)}
              columns={4}
            />
          ) : (
            <Text style={styles.noCategoriesText}>No categories available. Please add categories first.</Text>
          )}
        </View>

        <View style={{ marginTop: spacing.md }}>
          <DateTimePicker
            value={selectedDate}
            onChange={setSelectedDate}
            mode="date"
            label="Date"
          />
        </View>

        <View style={{ marginTop: spacing.md }}>
          <CustomInput
            label="Description"
            value={description}
            onChangeText={setDescription}
            placeholder="Enter description..."
          />
        </View>

        <View style={{ marginTop: spacing.md }}>
          <CustomInput
            label="Payment Method"
            value={paymentMethod}
            onChangeText={setPaymentMethod}
            placeholder="Cash, Card, etc."
          />
        </View>

        <TouchableOpacity
          onPress={() => setIsRecurring(!isRecurring)}
          style={styles.recurringToggle}
        >
          <Text style={styles.recurringLabel}>Recurring Transaction</Text>
          <View style={[styles.checkbox, isRecurring && styles.checkboxActive]}>
            {isRecurring && <Text style={styles.checkmark}>✓</Text>}
          </View>
        </TouchableOpacity>

        <CustomButton
          onPress={handleAddTransaction}
          variant="primary"
          size="lg"
          fullWidth
          loading={isAddingTransaction}
          hapticFeedback="medium"
        >
          Save Transaction
        </CustomButton>
      </BottomSheet>
    </View>
  );
};

const DashboardSkeleton: React.FC = () => (
  <View style={styles.skeletonContainer}>
    <Skeleton width="60%" height={24} radius={4} />
    <Skeleton width="40%" height={32} radius={4} />
    <Skeleton width={width - spacing.xl * 2} height={120} radius={borderRadius.lg} />
    <Skeleton width="100%" height={150} radius={borderRadius.lg} />
    <Skeleton width="100%" height={150} radius={borderRadius.lg} />
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.neutral[50],
  },
  scrollView: {
    flex: 1,
  },
  header: {
    padding: spacing.xl,
    paddingTop: spacing['2xl'],
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.xl,
  },
  greeting: {
    ...typography.caption,
    color: colors.neutral[600],
  },
  userName: {
    ...typography.heading3,
    color: colors.neutral[900],
    marginBottom: spacing.xs,
  },
  date: {
    ...typography.small,
    color: colors.neutral[500],
  },
  headerActions: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  notificationButton: {
    position: 'relative',
    padding: spacing.sm,
  },
  notificationBadge: {
    position: 'absolute',
    top: spacing.xs,
    right: spacing.xs,
    backgroundColor: colors.error[500],
    borderRadius: borderRadius.full,
    width: 16,
    height: 16,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  badgeText: {
    ...typography.tiny,
    color: colors.white,
    fontWeight: '600',
  },
  notificationIcon: {
    fontSize: 24,
  },
  settingsButton: {
    padding: spacing.sm,
  },
  settingsIcon: {
    fontSize: 24,
  },
  balanceCard: {
    backgroundColor: colors.primary[500],
    borderRadius: borderRadius.xl,
    padding: spacing.xl,
    ...shadows.lg,
  },
  balanceLabel: {
    ...typography.caption,
    color: colors.white,
    opacity: 0.9,
    marginBottom: spacing.xs,
  },
  balanceAmount: {
    ...typography.heading1,
    color: colors.white,
    fontWeight: '700',
  },
  section: {
    paddingHorizontal: spacing.xl,
    marginBottom: spacing.xl,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionTitle: {
    ...typography.heading5,
    color: colors.neutral[900],
  },
  sectionSpacer: {
    height: spacing.md,
  },
  seeAllText: {
    ...typography.caption,
    color: colors.primary[500],
    fontWeight: '600',
  },
  quickStatsContainer: {
    gap: spacing.md,
    paddingRight: spacing.xl,
    flexDirection: 'row',
  },
  statCardWrapper: {
    width: 180,
  },
  emptyTransactions: {
    alignItems: 'center',
    padding: spacing.xl,
    paddingVertical: spacing['2xl'],
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: spacing.md,
  },
  emptyText: {
    ...typography.heading6,
    color: colors.neutral[700],
    marginTop: spacing.md,
  },
  emptySubtext: {
    ...typography.small,
    color: colors.neutral[500],
    marginTop: spacing.xs,
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
  modalSection: {
    gap: spacing.sm,
    marginTop: spacing.lg,
  },
  modalSectionTitle: {
    ...typography.captionBold,
    color: colors.neutral[700],
  },
  recurringToggle: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.md,
    marginTop: spacing.lg,
  },
  recurringLabel: {
    ...typography.body,
    color: colors.neutral[900],
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
  typeSelector: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  typeButton: {
    flex: 1,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.neutral[300],
    backgroundColor: colors.white,
    alignItems: 'center',
  },
  typeButtonActive: {
    backgroundColor: colors.primary[500],
    borderColor: colors.primary[500],
  },
  typeButtonText: {
    ...typography.body,
    color: colors.neutral[700],
    fontWeight: '600',
  },
  typeButtonTextActive: {
    color: colors.white,
  },
  noCategoriesText: {
    ...typography.caption,
    color: colors.neutral[500],
    textAlign: 'center',
    paddingVertical: spacing.lg,
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    paddingVertical: spacing.sm,
  },
  categoryItem: {
    alignItems: 'center',
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    borderWidth: 2,
    borderColor: colors.neutral[200],
    backgroundColor: colors.white,
    width: 80,
    marginRight: spacing.sm,
  },
  categoryItemSelected: {
    borderWidth: 2,
    backgroundColor: colors.neutral[50],
  },
  categoryIcon: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  categoryEmoji: {
    fontSize: 20,
  },
  categoryName: {
    ...typography.tiny,
    color: colors.neutral[700],
    textAlign: 'center',
  },
  skeletonContainer: {
    padding: spacing.xl,
    gap: spacing.lg,
  },
});
