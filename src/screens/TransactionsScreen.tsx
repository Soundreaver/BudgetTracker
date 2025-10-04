import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  TouchableOpacity,
  SectionList,
  TextInput,
  ScrollView,
} from 'react-native';
import { MotiView } from 'moti';
import { Ionicons } from '@expo/vector-icons';
import { format, parseISO, isSameDay } from 'date-fns';
import { triggerHaptic } from '@/utils/haptics';
import { colors, spacing, borderRadius, typography, shadows } from '@/constants/theme';
import {
  TransactionCard,
  BottomSheet,
  AmountInput,
  CategoryPicker,
  DateTimePicker,
  CustomInput,
  CustomButton,
  EmptyState,
} from '@/components/ui';
import { useTransactionStore } from '@/store';
import { getAllCategories } from '@/services/categoryService';
import type { Transaction, Category } from '@/types/database';

type FilterType = 'all' | 'income' | 'expense';

interface GroupedTransaction {
  title: string;
  data: Transaction[];
}

export const TransactionsScreen: React.FC = () => {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [searchExpanded, setSearchExpanded] = useState(false);
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');
  const [selectedMonth, setSelectedMonth] = useState(new Date());
  const [categories, setCategories] = useState<Category[]>([]);
  
  // Add transaction form state
  const [amount, setAmount] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [description, setDescription] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [paymentMethod, setPaymentMethod] = useState('');
  const [isRecurring, setIsRecurring] = useState(false);
  const [transactionType, setTransactionType] = useState<'income' | 'expense'>('expense');

  const {
    filteredTransactions,
    loadTransactions,
    getTotals,
    searchQuery,
    setSearchQuery,
    addTransaction,
  } = useTransactionStore();

  useEffect(() => {
    loadTransactions();
    
    // Load categories
    const loadedCategories = getAllCategories();
    setCategories(loadedCategories);
  }, []);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await loadTransactions();
    setIsRefreshing(false);
  };

  const handleFilterChange = async (filter: FilterType) => {
    await triggerHaptic('selection');
    setActiveFilter(filter);
    // Would apply filter to store
  };

  const handleSearchToggle = async () => {
    await triggerHaptic('light');
    setSearchExpanded(!searchExpanded);
    if (searchExpanded) {
      setSearchQuery('');
    }
  };

  const handleAddTransaction = async () => {
    if (!amount) {
      alert('Please enter an amount');
      return;
    }

    await triggerHaptic('success');
    
    addTransaction({
      category_id: selectedCategory || 1, // Default category if none selected
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
    setShowAddModal(false);
  };

  // Group transactions by date
  const groupTransactionsByDate = (transactions: Transaction[]): GroupedTransaction[] => {
    const groups: { [key: string]: Transaction[] } = {};

    transactions.forEach((transaction) => {
      const date = transaction.date;
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(transaction);
    });

    return Object.keys(groups)
      .sort((a, b) => b.localeCompare(a))
      .map((date) => ({
        title: format(parseISO(date), 'EEEE, MMMM dd'),
        data: groups[date],
      }));
  };

  const groupedTransactions = groupTransactionsByDate(filteredTransactions);
  const totals = getTotals();

  const renderSectionHeader = ({ section }: { section: GroupedTransaction }) => (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionHeaderText}>{section.title}</Text>
    </View>
  );

  const renderTransaction = ({ item }: { item: Transaction }) => (
    <TransactionCard
      id={item.id}
      amount={item.amount}
      description={item.description}
      category={{
        name: 'Category',
        icon: '💰',
        color: colors.primary[500],
      }}
      date={item.date}
      type={item.type}
      onPress={() => console.log('View transaction')}
      onEdit={(id) => console.log('Edit', id)}
      onDelete={(id) => console.log('Delete', id)}
    />
  );

  const renderEmptyList = () => (
    <EmptyState
      variant="transactions"
      onAction={() => setShowAddModal(true)}
    />
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <MotiView
        from={{ opacity: 0, translateY: -20 }}
        animate={{ opacity: 1, translateY: 0 }}
        transition={{ type: 'timing', duration: 300 }}
        style={styles.header}
      >
        <View style={styles.headerTop}>
          <TouchableOpacity style={styles.monthSelector}>
            <Text style={styles.monthText}>
              {format(selectedMonth, 'MMMM yyyy')}
            </Text>
            <Text style={styles.chevron}>›</Text>
          </TouchableOpacity>

          <View style={styles.headerActions}>
            <TouchableOpacity onPress={handleSearchToggle} style={styles.searchButton}>
              <Ionicons name="search-outline" size={22} color={colors.neutral[700]} />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setShowFilterModal(true)}
              style={styles.filterButton}
            >
              <Ionicons name="filter-outline" size={22} color={colors.neutral[700]} />
              {activeFilter !== 'all' && (
                <View style={styles.filterBadge}>
                  <Text style={styles.filterBadgeText}>1</Text>
                </View>
              )}
            </TouchableOpacity>
          </View>
        </View>

        {searchExpanded && (
          <MotiView
            from={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 44 }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ type: 'timing', duration: 200 }}
          >
            <TextInput
              style={styles.searchInput}
              placeholder="Search transactions..."
              placeholderTextColor={colors.neutral[400]}
              value={searchQuery}
              onChangeText={setSearchQuery}
              autoFocus
            />
          </MotiView>
        )}
      </MotiView>

      {/* Summary Section */}
      <MotiView
        from={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: 'timing', duration: 300, delay: 100 }}
        style={styles.summary}
      >
        <View style={styles.summaryItem}>
          <Text style={styles.summaryLabel}>Income</Text>
          <Text style={[styles.summaryValue, { color: colors.success[500] }]}>
            ${totals.income.toFixed(2)}
          </Text>
        </View>
        <View style={styles.summaryDivider} />
        <View style={styles.summaryItem}>
          <Text style={styles.summaryLabel}>Expenses</Text>
          <Text style={[styles.summaryValue, { color: colors.error[500] }]}>
            ${totals.expenses.toFixed(2)}
          </Text>
        </View>
        <View style={styles.summaryDivider} />
        <View style={styles.summaryItem}>
          <Text style={styles.summaryLabel}>Net</Text>
          <Text style={[styles.summaryValue, { color: colors.primary[500] }]}>
            ${totals.balance.toFixed(2)}
          </Text>
        </View>
      </MotiView>

      {/* Filter Chips */}
      <View style={styles.filterChipsContainer}>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={[
            { key: 'all', label: 'All' },
            { key: 'income', label: 'Income' },
            { key: 'expense', label: 'Expense' },
          ]}
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() => handleFilterChange(item.key as FilterType)}
              style={[
                styles.filterChip,
                activeFilter === item.key && styles.filterChipActive,
              ]}
            >
              <Text
                style={[
                  styles.filterChipText,
                  activeFilter === item.key && styles.filterChipTextActive,
                ]}
              >
                {item.label}
              </Text>
            </TouchableOpacity>
          )}
          contentContainerStyle={styles.filterChipsList}
        />
      </View>

      {/* Transaction List */}
      <SectionList
        sections={groupedTransactions}
        renderItem={renderTransaction}
        renderSectionHeader={renderSectionHeader}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContent}
        stickySectionHeadersEnabled
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            tintColor={colors.primary[500]}
          />
        }
        ListEmptyComponent={renderEmptyList}
      />

      {/* FAB */}
      <MotiView
        from={{ scale: 0, rotate: '-180deg' }}
        animate={{ scale: 1, rotate: '0deg' }}
        transition={{ type: 'spring', damping: 15, delay: 300 }}
        style={styles.fabContainer}
      >
        <TouchableOpacity
          onPress={() => setShowAddModal(true)}
          activeOpacity={0.8}
          style={[styles.fab, shadows.xl]}
        >
          <Ionicons name="add" size={32} color={colors.white} />
        </TouchableOpacity>
      </MotiView>

      {/* Add Transaction Modal */}
      <BottomSheet
        visible={showAddModal}
        onClose={() => setShowAddModal(false)}
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
          currency="$"
          label="Amount"
          suggestedAmounts={[10, 25, 50, 100, 200]}
        />

        <View style={styles.modalSection}>
          <Text style={styles.modalSectionTitle}>Category</Text>
          {categories.length > 0 ? (
            <CategoryPicker
              categories={categories}
              selectedId={selectedCategory || undefined}
              onSelect={(cat) => setSelectedCategory(cat.id)}
              columns={4}
            />
          ) : (
            <Text style={styles.noCategoriesText}>No categories available. Please add categories first.</Text>
          )}
        </View>

        <DateTimePicker
          value={selectedDate}
          onChange={setSelectedDate}
          mode="date"
          label="Date"
        />

        <CustomInput
          label="Description"
          value={description}
          onChangeText={setDescription}
          placeholder="Enter description..."
        />

        <CustomInput
          label="Payment Method"
          value={paymentMethod}
          onChangeText={setPaymentMethod}
          placeholder="Cash, Card, etc."
        />

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
          hapticFeedback="medium"
        >
          Save Transaction
        </CustomButton>
      </BottomSheet>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.neutral[50],
  },
  header: {
    padding: spacing.xl,
    paddingTop: spacing['2xl'],
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral[200],
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  monthSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  monthText: {
    ...typography.heading5,
    color: colors.neutral[900],
  },
  chevron: {
    ...typography.heading5,
    color: colors.neutral[400],
    transform: [{ rotate: '90deg' }],
  },
  headerActions: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  searchButton: {
    padding: spacing.sm,
  },
  searchIcon: {
    fontSize: 20,
  },
  filterButton: {
    padding: spacing.sm,
    position: 'relative',
  },
  filterIcon: {
    fontSize: 20,
  },
  filterBadge: {
    position: 'absolute',
    top: spacing.xs,
    right: spacing.xs,
    backgroundColor: colors.primary[500],
    borderRadius: borderRadius.full,
    width: 16,
    height: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterBadgeText: {
    ...typography.tiny,
    color: colors.white,
    fontWeight: '600',
  },
  searchInput: {
    ...typography.body,
    backgroundColor: colors.neutral[100],
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    marginTop: spacing.md,
    color: colors.neutral[900],
  },
  summary: {
    flexDirection: 'row',
    backgroundColor: colors.white,
    padding: spacing.lg,
    marginHorizontal: spacing.xl,
    marginTop: spacing.md,
    borderRadius: borderRadius.lg,
    ...shadows.sm,
  },
  summaryItem: {
    flex: 1,
    alignItems: 'center',
  },
  summaryLabel: {
    ...typography.small,
    color: colors.neutral[600],
    marginBottom: spacing.xs,
  },
  summaryValue: {
    ...typography.heading6,
    fontWeight: '700',
  },
  summaryDivider: {
    width: 1,
    backgroundColor: colors.neutral[200],
  },
  filterChipsContainer: {
    marginTop: spacing.md,
  },
  filterChipsList: {
    paddingHorizontal: spacing.xl,
    gap: spacing.sm,
  },
  filterChip: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    backgroundColor: colors.neutral[100],
    borderWidth: 1,
    borderColor: colors.neutral[200],
  },
  filterChipActive: {
    backgroundColor: colors.primary[500],
    borderColor: colors.primary[500],
  },
  filterChipText: {
    ...typography.caption,
    color: colors.neutral[700],
    fontWeight: '500',
  },
  filterChipTextActive: {
    color: colors.white,
    fontWeight: '600',
  },
  listContent: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.md,
    paddingBottom: 100,
  },
  sectionHeader: {
    backgroundColor: colors.neutral[50],
    paddingVertical: spacing.sm,
    marginBottom: spacing.sm,
  },
  sectionHeaderText: {
    ...typography.captionBold,
    color: colors.neutral[600],
    textTransform: 'uppercase',
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
  modalContent: {
    padding: spacing.lg,
    gap: spacing.lg,
  },
  modalSection: {
    gap: spacing.sm,
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
  noCategoriesText: {
    ...typography.caption,
    color: colors.neutral[500],
    textAlign: 'center',
    paddingVertical: spacing.lg,
  },
});
