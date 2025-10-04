import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Share,
} from 'react-native';
import { MotiView } from 'moti';
import { format, subDays, subMonths } from 'date-fns';
import { triggerHaptic } from '@/utils/haptics';
import { colors, spacing, borderRadius, typography, shadows } from '@/constants/theme';
import {
  ChartCard,
  StatCard,
  ProgressBar,
  CustomButton,
  CategoryBadge,
} from '@/components/ui';
import { useTransactionStore } from '@/store';

type Period = 'week' | 'month' | 'year' | 'custom';

interface CategoryStat {
  id: number;
  name: string;
  icon: string;
  color: string;
  amount: number;
  percentage: number;
  change: number; // Comparison to last period
}

export const StatisticsScreen: React.FC = () => {
  const [selectedPeriod, setSelectedPeriod] = useState<Period>('month');
  const [showDatePicker, setShowDatePicker] = useState(false);

  const { getTotals } = useTransactionStore();
  const totals = getTotals();

  // Mock data - would be calculated from transactions
  const categoryStats: CategoryStat[] = [
    { id: 1, name: 'Food', icon: '🍔', color: '#FF6B6B', amount: 450, percentage: 35, change: 12 },
    { id: 2, name: 'Transport', icon: '🚗', color: '#4ECDC4', amount: 280, percentage: 22, change: -5 },
    { id: 3, name: 'Shopping', icon: '🛍️', color: '#45B7D1', amount: 320, percentage: 25, change: 8 },
    { id: 4, name: 'Entertainment', icon: '🎮', color: '#96CEB4', amount: 150, percentage: 12, change: -3 },
    { id: 5, name: 'Bills', icon: '📱', color: '#FFEAA7', amount: 80, percentage: 6, change: 0 },
  ];

  const handlePeriodChange = async (period: Period) => {
    await triggerHaptic('selection');
    setSelectedPeriod(period);
  };

  const handleExportCSV = async () => {
    await triggerHaptic('medium');
    // Would implement CSV export
    console.log('Export CSV');
  };

  const handleExportPDF = async () => {
    await triggerHaptic('medium');
    // Would implement PDF export
    console.log('Export PDF');
  };

  const handleShare = async () => {
    await triggerHaptic('light');
    try {
      await Share.share({
        message: `My spending summary: Income $${totals.income.toFixed(2)}, Expenses $${totals.expenses.toFixed(2)}, Net $${totals.balance.toFixed(2)}`,
      });
    } catch (error) {
      console.error('Share error:', error);
    }
  };

  const biggestExpense = categoryStats.reduce((max, cat) => 
    cat.amount > max.amount ? cat : max
  , categoryStats[0]);

  const mostFrequentCategory = categoryStats[0]; // Would calculate from transaction count

  const averageDailySpending = totals.expenses / 30; // Assuming monthly period

  const spendingTrend = 12; // Would calculate percentage change from last period

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
                {format(subMonths(new Date(), 1), 'MMM dd')} - {format(new Date(), 'MMM dd, yyyy')}
              </Text>
              <Text style={styles.calendarIcon}>📅</Text>
            </TouchableOpacity>
          </MotiView>
        )}
      </MotiView>

      {/* Visual Charts Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Overview</Text>
        
        {/* Spending Trend Line Chart */}
        <ChartCard
          title="Spending Trend"
          period={selectedPeriod === 'custom' ? 'month' : selectedPeriod}
          onPeriodChange={(p) => handlePeriodChange(p as Period)}
        >
          <MotiView
            from={{ opacity: 0, translateY: 20 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ type: 'timing', duration: 500 }}
            style={styles.chartPlaceholder}
          >
            <Text style={styles.chartLabel}>📈 Line Chart</Text>
            <Text style={styles.chartSubtext}>Interactive chart would render here</Text>
          </MotiView>
        </ChartCard>

        {/* Category Breakdown Pie Chart */}
        <ChartCard title="Category Breakdown">
          <MotiView
            from={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: 'spring', damping: 15, delay: 200 }}
            style={styles.chartPlaceholder}
          >
            <Text style={styles.chartLabel}>🍩 Donut Chart</Text>
            <Text style={styles.chartSubtext}>Tap segments for details</Text>
          </MotiView>
        </ChartCard>

        {/* Income vs Expense Bar Chart */}
        <ChartCard title="Income vs Expenses">
          <MotiView
            from={{ opacity: 0, translateX: -20 }}
            animate={{ opacity: 1, translateX: 0 }}
            transition={{ type: 'timing', duration: 500, delay: 300 }}
            style={styles.chartPlaceholder}
          >
            <Text style={styles.chartLabel}>📊 Bar Chart</Text>
            <Text style={styles.chartSubtext}>Monthly comparison</Text>
          </MotiView>
        </ChartCard>

        {/* Daily Spending Heatmap */}
        <ChartCard title="Daily Spending Heatmap">
          <MotiView
            from={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ type: 'timing', duration: 600, delay: 400 }}
            style={styles.chartPlaceholder}
          >
            <Text style={styles.chartLabel}>🔥 Heatmap</Text>
            <Text style={styles.chartSubtext}>Intensity by day</Text>
          </MotiView>
        </ChartCard>
      </View>

      {/* Insights Cards */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Key Insights</Text>
        
        <View style={styles.insightsGrid}>
          <StatCard
            title="Biggest Expense"
            value={`$${biggestExpense.amount}`}
            icon={<Text style={styles.insightIcon}>{biggestExpense.icon}</Text>}
            subtitle={biggestExpense.name}
            variant="error"
            delay={0}
          />
          
          <StatCard
            title="Most Frequent"
            value={mostFrequentCategory.name}
            icon={<Text style={styles.insightIcon}>{mostFrequentCategory.icon}</Text>}
            subtitle="15 transactions"
            variant="primary"
            delay={100}
          />
          
          <StatCard
            title="Daily Average"
            value={`$${averageDailySpending.toFixed(2)}`}
            icon={<Text style={styles.insightIcon}>💰</Text>}
            subtitle="per day"
            variant="warning"
            delay={200}
          />
          
          <StatCard
            title="Spending Trend"
            value={`${spendingTrend > 0 ? '+' : ''}${spendingTrend}%`}
            trend={{ value: Math.abs(spendingTrend), isPositive: spendingTrend < 0 }}
            icon={<Text style={styles.insightIcon}>📈</Text>}
            subtitle="vs last period"
            variant={spendingTrend > 0 ? 'error' : 'success'}
            delay={300}
          />
        </View>

        {/* Recommendation Card */}
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
          <Text style={styles.recommendationText}>
            Your food expenses increased by 12% this month. Consider meal planning to reduce costs.
          </Text>
        </MotiView>
      </View>

      {/* Category Breakdown List */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Category Breakdown</Text>
        
        {categoryStats.map((category, index) => (
          <MotiView
            key={category.id}
            from={{ opacity: 0, translateX: -20 }}
            animate={{ opacity: 1, translateX: 0 }}
            transition={{ type: 'timing', duration: 300, delay: index * 100 }}
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
                    <Text style={styles.categoryPercentage}>{category.percentage}%</Text>
                    <Text style={styles.categoryAmount}>${category.amount}</Text>
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
    gap: spacing.md,
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
    gap: spacing.md,
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
  changeIndicator: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
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
