import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MotiView } from 'moti';
import { colors, spacing, borderRadius, typography } from '@/constants/theme';

interface ProgressBarProps {
  progress: number; // 0-100
  label?: string;
  showPercentage?: boolean;
  variant?: 'primary' | 'success' | 'warning' | 'error';
  height?: number;
  animated?: boolean;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  progress,
  label,
  showPercentage = true,
  variant = 'primary',
  height = 8,
  animated = true,
}) => {
  const clampedProgress = Math.min(Math.max(progress, 0), 100);

  const getColor = () => {
    switch (variant) {
      case 'primary':
        return colors.primary[500];
      case 'success':
        return colors.success[500];
      case 'warning':
        return colors.warning[500];
      case 'error':
        return colors.error[500];
    }
  };

  const barColor = getColor();

  return (
    <View style={styles.container}>
      {(label || showPercentage) && (
        <View style={styles.labelContainer}>
          {label && <Text style={styles.label}>{label}</Text>}
          {showPercentage && (
            <Text style={styles.percentage}>{clampedProgress.toFixed(0)}%</Text>
          )}
        </View>
      )}
      <View style={[styles.track, { height, borderRadius: height / 2 }]}>
        <MotiView
          from={{ width: 0 }}
          animate={{ width: `${clampedProgress}%` }}
          transition={{ type: 'timing', duration: animated ? 500 : 0 }}
          style={[
            styles.fill,
            {
              backgroundColor: barColor,
              height,
              borderRadius: height / 2,
            },
          ]}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  labelContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  label: {
    ...typography.caption,
    color: colors.neutral[700],
  },
  percentage: {
    ...typography.captionBold,
    color: colors.neutral[900],
  },
  track: {
    width: '100%',
    backgroundColor: colors.neutral[200],
    overflow: 'hidden',
  },
  fill: {
    position: 'absolute',
    left: 0,
    top: 0,
  },
});
