import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MotiView } from 'moti';
import { colors, spacing, borderRadius, typography } from '@/constants/theme';

interface PieDataPoint {
  label: string;
  value: number;
  percentage: number;
  color: string;
}

interface SimplePieChartProps {
  data: PieDataPoint[];
  size?: number;
  showLegend?: boolean;
}

export const SimplePieChart: React.FC<SimplePieChartProps> = ({
  data,
  size = 160,
  showLegend = true,
}) => {
  if (!data || data.length === 0) {
    return (
      <View style={styles.container}>
        <Text style={styles.emptyText}>No data available</Text>
      </View>
    );
  }

  // Sort by value descending and take top 5
  const topData = [...data].sort((a, b) => b.value - a.value).slice(0, 5);
  
  // Calculate "Others" if needed
  const othersValue = data.slice(5).reduce((sum, item) => sum + item.value, 0);
  const totalValue = data.reduce((sum, item) => sum + item.value, 0);
  
  const displayData = [...topData];
  if (othersValue > 0) {
    displayData.push({
      label: 'Others',
      value: othersValue,
      percentage: (othersValue / totalValue) * 100,
      color: colors.neutral[400],
    });
  }

  return (
    <View style={styles.container}>
      <View style={styles.chartContainer}>
        {/* Simple visualization using stacked bars */}
        <View style={styles.pieContainer}>
          <View style={[styles.donutCircle, { width: size, height: size }]}>
            {displayData.map((item, index) => {
              const heightPercentage = item.percentage;
              
              return (
                <MotiView
                  key={index}
                  from={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ type: 'spring', damping: 15, delay: index * 100 }}
                  style={[
                    styles.segment,
                    {
                      height: `${heightPercentage}%`,
                      backgroundColor: item.color,
                      zIndex: displayData.length - index,
                    },
                  ]}
                />
              );
            })}
            
            {/* Center hole */}
            <View style={[styles.centerHole, { width: size * 0.5, height: size * 0.5 }]}>
              <Text style={styles.centerLabel}>Total</Text>
              <Text style={styles.centerValue}>${totalValue.toFixed(0)}</Text>
            </View>
          </View>
        </View>

        {/* Legend */}
        {showLegend && (
          <View style={styles.legend}>
            {displayData.map((item, index) => (
              <MotiView
                key={index}
                from={{ opacity: 0, translateX: -20 }}
                animate={{ opacity: 1, translateX: 0 }}
                transition={{ type: 'timing', duration: 300, delay: index * 50 }}
                style={styles.legendItem}
              >
                <View style={[styles.legendColor, { backgroundColor: item.color }]} />
                <View style={styles.legendText}>
                  <Text style={styles.legendLabel} numberOfLines={1}>
                    {item.label}
                  </Text>
                  <Text style={styles.legendValue}>
                    ${item.value.toFixed(0)} ({item.percentage.toFixed(1)}%)
                  </Text>
                </View>
              </MotiView>
            ))}
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: spacing.md,
  },
  chartContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.lg,
  },
  pieContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  donutCircle: {
    position: 'relative',
    borderRadius: 1000,
    overflow: 'hidden',
    backgroundColor: colors.neutral[100],
    alignItems: 'center',
    justifyContent: 'center',
  },
  segment: {
    position: 'absolute',
    width: '100%',
    bottom: 0,
    borderTopLeftRadius: 1000,
    borderTopRightRadius: 1000,
  },
  centerHole: {
    position: 'absolute',
    borderRadius: 1000,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 100,
  },
  centerLabel: {
    ...typography.tiny,
    color: colors.neutral[600],
    fontSize: 10,
  },
  centerValue: {
    ...typography.heading6,
    color: colors.neutral[900],
    fontWeight: '700',
  },
  legend: {
    flex: 1,
    gap: spacing.sm,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  legendColor: {
    width: 12,
    height: 12,
    borderRadius: 2,
  },
  legendText: {
    flex: 1,
  },
  legendLabel: {
    ...typography.small,
    color: colors.neutral[900],
    fontWeight: '500',
  },
  legendValue: {
    ...typography.tiny,
    color: colors.neutral[600],
    fontSize: 10,
  },
  emptyText: {
    ...typography.body,
    color: colors.neutral[400],
    textAlign: 'center',
  },
});
