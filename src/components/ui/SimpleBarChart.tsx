import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { MotiView } from 'moti';
import { colors, spacing, borderRadius, typography } from '@/constants/theme';

interface DataPoint {
  label: string;
  value: number;
  color?: string;
}

interface SimpleBarChartProps {
  data: DataPoint[];
  height?: number;
  showValues?: boolean;
  animated?: boolean;
}

export const SimpleBarChart: React.FC<SimpleBarChartProps> = ({
  data,
  height = 200,
  showValues = true,
  animated = true,
}) => {
  if (!data || data.length === 0) {
    return (
      <View style={[styles.container, { height }]}>
        <Text style={styles.emptyText}>No data available</Text>
      </View>
    );
  }

  const maxValue = Math.max(...data.map(d => d.value));
  const barWidth = (Dimensions.get('window').width - spacing.xl * 4) / data.length;

  return (
    <View style={[styles.container, { height }]}>
      <View style={styles.chartContainer}>
        {data.map((item, index) => {
          const barHeight = maxValue > 0 ? (item.value / maxValue) * (height - 60) : 0;
          
          return (
            <View key={index} style={[styles.barContainer, { width: barWidth }]}>
              {showValues && item.value > 0 && (
                <Text style={styles.valueText}>${item.value.toFixed(0)}</Text>
              )}
              <MotiView
                from={{ height: 0 }}
                animate={{ height: animated ? barHeight : barHeight }}
                transition={{ type: 'timing', duration: 500, delay: index * 100 }}
                style={[
                  styles.bar,
                  {
                    backgroundColor: item.color || colors.primary[500],
                  },
                ]}
              />
              <Text style={styles.labelText} numberOfLines={1}>
                {item.label}
              </Text>
            </View>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    paddingVertical: spacing.md,
  },
  chartContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-around',
    height: '100%',
    paddingBottom: 30,
  },
  barContainer: {
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: spacing.xs,
  },
  bar: {
    width: '80%',
    borderRadius: borderRadius.sm,
    minHeight: 2,
  },
  valueText: {
    ...typography.tiny,
    color: colors.neutral[700],
    fontWeight: '600',
    fontSize: 10,
  },
  labelText: {
    ...typography.tiny,
    color: colors.neutral[600],
    fontSize: 10,
    textAlign: 'center',
    marginTop: spacing.xs,
  },
  emptyText: {
    ...typography.body,
    color: colors.neutral[400],
    textAlign: 'center',
  },
});
