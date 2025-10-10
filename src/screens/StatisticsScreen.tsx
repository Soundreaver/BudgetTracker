import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Share,
  Dimensions,
} from 'react-native';
import { MotiView } from 'moti';
import { 
  format, 
  subDays, 
  subMonths, 
  subWeeks, 
  subYears,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  startOfYear,
  endOfYear,
} from 'date-fns';
import { triggerHaptic } from '@/utils/haptics';
import { colors, spacing, borderRadius, typography, shadows } from '@/constants/theme';
import {
  ChartCard,
  StatCard,
  ProgressBar,
  CustomButton,
  EmptyState,
  SimpleBarChart,
  SimplePieChart,
} from '@/components/ui';
import { useTransactionStore } from '@/store';
import { getAllCategories } from '@/services/categoryService';
import type { Category } from '@/types/database';

type Period = 'week' | 'month' | 'year' | 'custom';

interface CategoryStat {
  id: string;
  name: string;
  icon: string;
  color: string;
  amount: number;
  percentage: number;
  change: number;
  transactionCount: number;
}

export const StatisticsScreen: React.FC = () => {
  const [selectedPeriod, setSelectedPeriod] = useState<Period>('month');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [customStartDate, setCustomStartDate] = useState<Date>(subMonths(new Date(), 1));
  const [customEndDate, setCustomEndDate] = useState<Date>(new Date());
  const [categories, setCategories] = useState<Category[]>([]);

  const { transactions, loadTransactions } = useTransactionStore();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      await loadTransactions();
      const loadedCategories = await getAllCategories();
      setCategories(loadedCategories);
    } catch (error) {
      console.error('Error loading statistics data:', error);
    }
  };

  // Calculate date range based on selected period
  const { startDate, endDate, prevStartDate, prevEndDate } = useMemo(() => {
    const now = new Date();
    let start: Date, end: Date, prevStart: Date, prevEnd: Date;

    switch (selectedPeriod) {
      case 'week':
        start = startOfWeek(now);
        end = endOfWeek(now);
        prevStart = startOfWeek(subWeeks(now, 1));
        prevEnd = endOfWeek(subWeeks(now, 1));
        break;
      case 'year':
        start = startOfYear(now);
        end = endOfYear(now);
        prevStart = startOfYear(subYears(now, 1));
        prevEnd = endOfYear(subYears(now, 1));
        break;
      case 'custom':
        start = customStartDate;
        end = customEndDate;
        const daysDiff = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
        prevEnd = subDays(start, 1);
        prevStart = subDays(prevEnd, daysDiff);
        break;
      default: // month
        start = startOfMonth(now);
        end = endOfMonth(now);
        prevStart = startOfMonth(subMonths(now, 1));
        prevEnd = endOfMonth(subMonths(now, 1));
    }

    return {
      startDate: format(start, 'yyyy-MM-dd'),
      endDate: format(end, 'yyyy-MM-dd'),
      prevStartDate: format(prevStart, 'yyyy-MM-dd'),
      prevEndDate: format(prevEnd, 'yyyy-MM-dd'),
    };
  }, [selectedPeriod, customStartDate, customEndDate]);

  // Filter transactions for current and previous period
  const currentTransactions = useMemo(() => 
    transactions.filter(t => 
      t.type === 'expense' && 
      t.date >= startDate && 
      t.date <= endDate
    ),
    [transactions, startDate, endDate]
  );

  const previousTransactions = useMemo(() =>
    transactions.filter(t =>
      t.type === 'expense' &&
      t.date >= prevStartDate &&
      t.date <= prevEndDate
    ),
    [transactions, prevStartDate, prevEndDate]
  );

  // Calculate category statistics
  const categoryStats: CategoryStat[] = useMemo(() => {
    const expenseCategories = categories.filter(c => c.type === 'expense');
    const totalExpenses = currentTransactions.reduce((sum, t) => sum + t.amount, 0);

    const stats = expenseCategories.map(category => {
      const categoryTransactions = currentTransactions.filter(t => t.category_id === category.id);
      const prevCategoryTransactions = previousTransactions.filter(t => t.category_id === category.id);
      
      const amount = categoryTransactions.reduce((sum, t) => sum + t.amount, 0);
      const prevAmount = prevCategoryTransactions.reduce((sum, t) => sum + t.amount, 0);
      
      const percentage = totalExpenses > 0 ? (amount / totalExpenses) * 100 : 0;
      const change = prevAmount > 0 ? ((amount - prevAmount) / prevAmount) * 100 : (amount > 0 ? 100 : 0);

      return {
        id: category.id,
        name: category.name,
        icon: category.icon,
        color: category.color,
        amount,
        percentage,
        change: Math.round(change),
        transactionCount: categoryTransactions.length,
      };
    });

    return stats
      .filter(s => s.amount > 0)
      .sort((a, b) => b.amount - a.amount);
  }, [currentTransactions, previousTransactions, categories]);

  // Calculate totals
  const totals = useMemo(() => {
    const expenses = currentTransactions.reduce((sum, t) => sum + t.amount, 0);
    const income = transactions
      .filter(t => t.type === 'income' && t.date >= startDate && t.date <= endDate)
      .reduce((sum, t) => sum + t.amount, 0);
    
    return {
      expenses,
      income,
      balance: income - expenses,
    };
  }, [currentTransactions, transactions, startDate, endDate]);

  // Calculate insights
  const biggestExpense = categoryStats.length > 0 
    ? categoryStats.reduce((max, cat) => cat.amount > max.amount ? cat : max, categoryStats[0])
    : null;

  const mostFrequentCategory = categoryStats.length > 0
    ? categoryStats.reduce((max, cat) => cat.transactionCount > max.transactionCount ? cat : max, categoryStats[0])
    : null;

  const daysDiff = useMemo(() => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    return Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
  }, [startDate, endDate]);

  const averageDailySpending = totals.expenses / daysDiff;

  const spendingTrend = useMemo(() => {
    const prevExpenses = previousTransactions.reduce((sum, t) => sum + t.amount, 0);
    if (prevExpenses === 0) return totals.expenses > 0 ? 100 : 0;
    return ((totals.expenses - prevExpenses) / prevExpenses) * 100;
  }, [totals.expenses, previousTransactions]);

  // Smart recommendation
  const recommendation = useMemo(() => {
    if (categoryStats.length === 0) return null;
    
    const increasedCategories = categoryStats.filter(c => c.change > 10);
    if (increasedCategories.length > 0) {
      const topIncrease = increasedCategories[0];
      return `Your ${topIncrease.name.toLowerCase()} expenses increased by ${topIncrease.change}% this period. Consider reviewing this category to reduce costs.`;
    }
    
    if (biggestExpense && biggestExpense.percentage > 40) {
      return `${biggestExpense.name} makes up ${Math.round(biggestExpense.percentage)}% of your spending. Consider setting a budget to manage this category better.`;
    }
    
    return 'Great job! Your spending is well distributed across categories.';
  }, [categoryStats, biggestExpense]);

  const handlePeriodChange = async (period: Period) => {
    await triggerHaptic('selection');
    setSelectedPeriod(period);
  };

  const handleExportCSV = async () => {
    await triggerHaptic('medium');
    console.log('Export CSV - to be implemented');
  };

  const handleExportPDF = async () => {
    await triggerHaptic('medium');
    console.log('Export PDF - to be implemented');
  };

  const handleShare = async () => {
    await triggerHaptic('light');
    try {
      const periodName = selectedPeriod.charAt(0).toUpperCase() + selectedPeriod.slice(1);
      await Share.share({
        message: `${periodName} Financial Summary:\n\nIncome: $${totals.income.toFixed(2)}\nExpenses: $${totals.expenses.toFixed(2)}\nBalance: $${totals.balance.toFixed(2)}\n\nGenerated by Budget Tracker`,
      });
    } catch (error) {
      console.error('Share error:', error);
    }
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Period Selector */}
      <MotiView
        from={{ opacity: 0, translateY: -20 }}
        animate={{ opacity: 1, translateY: 0 }}
        transition={{ type: 'timing', duration: 300 }}
        style={styles.header}
      >
        <View style={styles.periodSelector}>
          {(['week', 'month', 'year', 'custom'] as Period[]).map((period) => (
            <TouchableOpacity
              key={period}
              onPress={() => handlePeriodChange(period)}
              style={[
                styles.periodTab,
                selectedPeriod === period && styles.periodTabActive,
              ]}
            >
              <Text
                style={[
                  styles.periodTabText,
                  selectedPeriod === period && styles.periodTabTextActive,
                ]}
              >
                {period.charAt(0).toUpperCase() + period.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        
        {selectedPeriod === 'custom' && (
          <MotiView
            from={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            transition={{ type: 'timing', duration: 200 }}
          >
            <TouchableOpacity
              onPress={() => setShowDatePicker(true)}
              style={styles.dateRangePicker}
            >
              <Text style={styles.dateRangeText}>
                {format(customStartDate, 'MMM dd')} - {format(customEndDate, 'MMM dd, yyyy')}
              </Text>
              <Text style={styles.calendarIcon}>📅</Text>
            </TouchableOpacity>
          </MotiView>
        )}
      </MotiView>

      {currentTransactions.length === 0 ? (
        <View style={styles.emptyContainer}>
          <EmptyState
            icon="📊"
            title="No Data Available"
            message={`No transactions found for this ${selectedPeriod}. Add some transactions to see statistics.`}
          />
        </View>
      ) : (
        <>
          {/* Insights Cards */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Key Insights</Text>
            
            <View style={styles.insightsGrid}>
              <View style={styles.cardWrapper}>
                <StatCard
                  title="Biggest Expense"
                  value={biggestExpense ? `$${biggestExpense.amount.toFixed(2)}` : '$0.00'}
                  icon={biggestExpense ? <Text style={styles.insightIcon}>{biggestExpense.icon}</Text> : <Text style={styles.insightIcon}>💸</Text>}
                  subtitle={biggestExpense?.name || 'N/A'}
                  variant="error"
                  delay={0}
                />
              </View>
              
              <View style={styles.cardWrapper}>
                <StatCard
                  title="Most Frequent"
                  value={mostFrequentCategory?.name || 'N/A'}
                  icon={mostFrequentCategory ? <Text style={styles.insightIcon}>{mostFrequentCategory.icon}</Text> : <Text style={styles.insightIcon}>📝</Text>}
                  subtitle={`${mostFrequentCategory?.transactionCount || 0} transactions`}
                  variant="primary"
                  delay={100}
                />
              </View>
              
              <View style={styles.cardWrapper}>
                <StatCard
                  title="Daily Average"
                  value={`$${averageDailySpending.toFixed(2)}`}
                  icon={<Text style={styles.insightIcon}>💰</Text>}
                  subtitle="per day"
                  variant="warning"
                  delay={200}
                />
              </View>
              
              <View style={styles.cardWrapper}>
                <StatCard
                  title="Spending Trend"
                  value={`${spendingTrend > 0 ? '+' : ''}${spendingTrend.toFixed(1)}%`}
                  trend={{ value: Math.abs(spendingTrend), isPositive: spendingTrend < 0 }}
                  icon={<Text style={styles.insightIcon}>📈</Text>}
                  subtitle="vs last period"
                  variant={spendingTrend > 0 ? 'error' : 'success'}
                  delay={300}
                />
              </View>
            </View>

            {/* Recommendation Card */}
            {recommendation && (
              <MotiView
                from={{ opacity: 0, translateY: 20 }}
                animate={{ opacity: 1, translateY: 0 }}
                transition={{ type: 'timing', duration: 300, delay: 400 }}
                style={[styles.recommendationCard, shadows.md]}
              >
                <View style={styles.recommendationHeader}>
                  <Text style={styles.recommendationIcon}>💡</Text>
                  <Text style={styles.recommendationTitle}>Smart Recommendation</Text>
                </View>
                <Text style={styles.recommendationText}>{recommendation}</Text>
              </MotiView>
            )}
          </View>

          {/* Visual Charts Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Overview</Text>
            
            {/* Spending Trend Bar Chart */}
            <ChartCard
              title="Spending Trend"
              period={selectedPeriod === 'custom' ? 'month' : selectedPeriod}
              onPeriodChange={(p) => handlePeriodChange(p as Period)}
            >
              <SimpleBarChart
                data={categoryStats.map(cat => ({
                  label: cat.name.length > 8 ? cat.name.substring(0, 8) + '...' : cat.name,
                  value: cat.amount,
                  color: cat.color,
                }))}
                height={200}
              />
            </ChartCard>

            {/* Category Breakdown Pie Chart */}
            {/* <ChartCard title="Category Breakdown">
              <SimplePieChart
                data={categoryStats.map(cat => ({
                  label: cat.name,
                  value: cat.amount,
                  percentage: cat.percentage,
                  color: cat.color,
                }))}
                size={140}
              />
            </ChartCard> */}
          </View>

          {/* Category Breakdown List */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Category Breakdown</Text>
            
            {categoryStats.map((category, index) => (
              <MotiView
                key={category.id}
                from={{ opacity: 0, translateX: -20 }}
                animate={{ opacity: 1, translateX: 0 }}
                transition={{ type: 'timing', duration: 300, delay: index * 50 }}
                style={styles.categoryItem}
              >
                <View style={styles.categoryHeader}>
                  <View style={styles.categoryInfo}>
                    <View
                      style={[
                        styles.categoryIconContainer,
                        { backgroundColor: `${category.color}20` },
                      ]}
                    >
                      <Text style={styles.categoryIcon}>{category.icon}</Text>
                    </View>
                    <View style={styles.categoryDetails}>
                      <Text style={styles.categoryName}>{category.name}</Text>
                      <View style={styles.categoryMeta}>
                        <Text style={styles.categoryPercentage}>{category.percentage.toFixed(1)}%</Text>
                        <Text style={styles.categoryAmount}>${category.amount.toFixed(2)}</Text>
                        <Text style={styles.categoryCount}>• {category.transactionCount} txns</Text>
                      </View>
                    </View>
                  </View>
                  
                  <View
                    style={[
                      styles.changeIndicator,
                      { backgroundColor: category.change >= 0 ? colors.error[50] : colors.success[50] },
                    ]}
                  >
                    <Text
                      style={[
                        styles.changeText,
                        { color: category.change >= 0 ? colors.error[700] : colors.success[700] },
                      ]}
                    >
                      {category.change >= 0 ? '+' : ''}{category.change}%
                    </Text>
                  </View>
                </View>
                
                <ProgressBar
                  progress={category.percentage}
                  showPercentage={false}
                  height={8}
                  animated
                />
              </MotiView>
            ))}
          </View>

          {/* Export Options */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Export & Share</Text>
            
            <MotiView
              from={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ type: 'spring', damping: 15, delay: 500 }}
              style={styles.exportButtons}
            >
              <CustomButton
                onPress={handleExportCSV}
                variant="outline"
                size="md"
                icon={<Text style={styles.buttonIcon}>📄</Text>}
                iconPosition="left"
              >
                Export CSV
              </CustomButton>
              
              <CustomButton
                onPress={handleExportPDF}
                variant="outline"
                size="md"
                icon={<Text style={styles.buttonIcon}>📑</Text>}
                iconPosition="left"
              >
                Generate PDF
              </CustomButton>
              
              <CustomButton
                onPress={handleShare}
                variant="primary"
                size="md"
                icon={<Text style={styles.buttonIcon}>📤</Text>}
                iconPosition="left"
              >
                Share Report
              </CustomButton>
            </MotiView>
          </View>
        </>
      )}

      <View style={{ height: 40 }} />
    </ScrollView>
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
  periodSelector: {
    flexDirection: 'row',
    backgroundColor: colors.neutral[100],
    borderRadius: borderRadius.lg,
    padding: spacing.xs,
  },
  periodTab: {
    flex: 1,
    paddingVertical: spacing.sm,
    alignItems: 'center',
    borderRadius: borderRadius.md,
  },
  periodTabActive: {
    backgroundColor: colors.primary[500],
  },
  periodTabText: {
    ...typography.caption,
    color: colors.neutral[600],
    fontWeight: '500',
    fontSize: 12,
  },
  periodTabTextActive: {
    color: colors.white,
    fontWeight: '600',
  },
  dateRangePicker: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.md,
    padding: spacing.md,
    backgroundColor: colors.neutral[100],
    borderRadius: borderRadius.md,
  },
  dateRangeText: {
    ...typography.body,
    color: colors.neutral[900],
  },
  calendarIcon: {
    fontSize: 20,
  },
  emptyContainer: {
    padding: spacing.xl,
    paddingTop: spacing['3xl'],
  },
  section: {
    padding: spacing.xl,
    gap: spacing.lg,
  },
  sectionTitle: {
    ...typography.heading5,
    color: colors.neutral[900],
    marginBottom: spacing.sm,
  },
  chartPlaceholder: {
    height: 200,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.neutral[50],
    borderRadius: borderRadius.md,
  },
  chartLabel: {
    fontSize: 48,
    marginBottom: spacing.sm,
  },
  chartSubtext: {
    ...typography.caption,
    color: colors.neutral[500],
  },
  insightsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: spacing.md,
  },
  cardWrapper: {
    width: '48%',
  },
  insightIcon: {
    fontSize: 24,
  },
  recommendationCard: {
    backgroundColor: colors.primary[50],
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    borderLeftWidth: 4,
    borderLeftColor: colors.primary[500],
  },
  recommendationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  recommendationIcon: {
    fontSize: 24,
  },
  recommendationTitle: {
    ...typography.bodyBold,
    color: colors.primary[900],
  },
  recommendationText: {
    ...typography.body,
    color: colors.primary[800],
    lineHeight: 22,
  },
  categoryItem: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    gap: spacing.md,
    ...shadows.sm,
  },
  categoryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  categoryInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    flex: 1,
  },
  categoryIconContainer: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryIcon: {
    fontSize: 24,
  },
  categoryDetails: {
    flex: 1,
  },
  categoryName: {
    ...typography.bodyBold,
    color: colors.neutral[900],
    marginBottom: spacing.xs,
  },
  categoryMeta: {
    flexDirection: 'row',
    gap: spacing.sm,
    flexWrap: 'wrap',
  },
  categoryPercentage: {
    ...typography.small,
    color: colors.neutral[600],
  },
  categoryAmount: {
    ...typography.small,
    color: colors.neutral[900],
    fontWeight: '600',
  },
  categoryCount: {
    ...typography.small,
    color: colors.neutral[500],
  },
  changeIndicator: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
    marginLeft: spacing.sm,
  },
  changeText: {
    ...typography.small,
    fontWeight: '600',
  },
  exportButtons: {
    gap: spacing.md,
  },
  buttonIcon: {
    fontSize: 18,
  },
});
