import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MotiView } from 'moti';
import { colors, spacing, borderRadius, typography, shadows } from '@/constants/theme';

interface StatCardProps {
  title: string;
  value: string | number;
  icon?: React.ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'error';
  subtitle?: string;
  delay?: number;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  icon,
  trend,
  variant = 'default',
  subtitle,
  delay = 0,
}) => {
  const getVariantColor = () => {
    switch (variant) {
      case 'primary':
        return colors.primary[500];
      case 'success':
        return colors.success[500];
      case 'warning':
        return colors.warning[500];
      case 'error':
        return colors.error[500];
      default:
        return colors.neutral[700];
    }
  };

  const variantColor = getVariantColor();

  return (
    <MotiView
      from={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: 'timing', duration: 300, delay }}
    >
      <View style={[styles.container, shadows.md]}>
        <View style={styles.header}>
          <Text style={styles.title}>{title}</Text>
          {icon && <View style={styles.icon}>{icon}</View>}
        </View>
        
        <MotiView
          from={{ opacity: 0, translateY: 10 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'timing', duration: 300, delay: delay + 100 }}
        >
          <Text style={[styles.value, { color: variantColor }]}>
            {typeof value === 'number' ? value.toLocaleString() : value}
          </Text>
        </MotiView>

        {(trend || subtitle) && (
          <View style={styles.footer}>
            {trend && (
              <View
                style={[
                  styles.trend,
                  { backgroundColor: trend.isPositive ? colors.success[50] : colors.error[50] },
                ]}
              >
                <Text
                  style={[
                    styles.trendText,
                    { color: trend.isPositive ? colors.success[700] : colors.error[700] },
                  ]}
                >
                  {trend.isPositive ? '↑' : '↓'} {Math.abs(trend.value)}%
                </Text>
              </View>
            )}
            {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
          </View>
        )}
      </View>
    </MotiView>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    flex: 1,
    minHeight: 120,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  title: {
    ...typography.caption,
    color: colors.neutral[600],
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  icon: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  value: {
    ...typography.heading2,
    marginBottom: spacing.sm,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  trend: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
  },
  trendText: {
    ...typography.small,
    fontWeight: '600',
  },
  subtitle: {
    ...typography.small,
    color: colors.neutral[500],
  },
});
