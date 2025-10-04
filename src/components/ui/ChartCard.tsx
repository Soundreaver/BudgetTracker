import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { MotiView } from 'moti';
import { triggerHaptic } from '@/utils/haptics';
import { colors, spacing, borderRadius, typography, shadows } from '@/constants/theme';

type Period = 'week' | 'month' | 'year';

interface ChartCardProps {
  title: string;
  children?: React.ReactNode;
  period?: Period;
  onPeriodChange?: (period: Period) => void;
  loading?: boolean;
  isEmpty?: boolean;
  emptyMessage?: string;
}

export const ChartCard: React.FC<ChartCardProps> = ({
  title,
  children,
  period = 'month',
  onPeriodChange,
  loading = false,
  isEmpty = false,
  emptyMessage = 'No data available',
}) => {
  const handlePeriodChange = async (newPeriod: Period) => {
    await triggerHaptic('selection');
    onPeriodChange?.(newPeriod);
  };

  const periods: Period[] = ['week', 'month', 'year'];

  return (
    <MotiView
      from={{ opacity: 0, translateY: 20 }}
      animate={{ opacity: 1, translateY: 0 }}
      transition={{ type: 'timing', duration: 300 }}
    >
      <View style={[styles.container, shadows.md]}>
        <View style={styles.header}>
          <Text style={styles.title}>{title}</Text>
          
          {onPeriodChange && (
            <View style={styles.periodSelector}>
              {periods.map((p) => (
                <TouchableOpacity
                  key={p}
                  onPress={() => handlePeriodChange(p)}
                  style={[
                    styles.periodButton,
                    period === p && styles.activePeriod,
                  ]}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      styles.periodText,
                      period === p && styles.activePeriodText,
                    ]}
                  >
                    {p.charAt(0).toUpperCase() + p.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        <View style={styles.content}>
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={colors.primary[500]} />
              <Text style={styles.loadingText}>Loading chart...</Text>
            </View>
          ) : isEmpty ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyIcon}>📊</Text>
              <Text style={styles.emptyText}>{emptyMessage}</Text>
            </View>
          ) : (
            children
          )}
        </View>
      </View>
    </MotiView>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  title: {
    ...typography.heading5,
    color: colors.neutral[900],
  },
  periodSelector: {
    flexDirection: 'row',
    backgroundColor: colors.neutral[100],
    borderRadius: borderRadius.md,
    padding: spacing.xs,
  },
  periodButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
  },
  activePeriod: {
    backgroundColor: colors.primary[500],
  },
  periodText: {
    ...typography.small,
    color: colors.neutral[600],
    fontWeight: '500',
  },
  activePeriodText: {
    color: colors.white,
    fontWeight: '600',
  },
  content: {
    minHeight: 200,
    justifyContent: 'center',
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xl,
  },
  loadingText: {
    ...typography.caption,
    color: colors.neutral[500],
    marginTop: spacing.md,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xl,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: spacing.md,
  },
  emptyText: {
    ...typography.body,
    color: colors.neutral[500],
    textAlign: 'center',
  },
});
