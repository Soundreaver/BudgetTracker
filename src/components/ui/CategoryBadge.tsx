import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MotiView } from 'moti';
import { triggerHaptic } from '@/utils/haptics';
import { colors, spacing, borderRadius, typography } from '@/constants/theme';

interface CategoryBadgeProps {
  name: string;
  icon: string;
  color: string;
  onPress?: () => void;
  size?: 'sm' | 'md' | 'lg';
}

export const CategoryBadge: React.FC<CategoryBadgeProps> = ({
  name,
  icon,
  color,
  onPress,
  size = 'md',
}) => {
  const handlePress = async () => {
    if (!onPress) return;
    await triggerHaptic('selection');
    onPress();
  };

  const getSizeStyles = () => {
    switch (size) {
      case 'sm':
        return {
          paddingHorizontal: spacing.sm,
          paddingVertical: spacing.xs,
          iconSize: 16,
          fontSize: typography.small,
        };
      case 'md':
        return {
          paddingHorizontal: spacing.md,
          paddingVertical: spacing.sm,
          iconSize: 20,
          fontSize: typography.caption,
        };
      case 'lg':
        return {
          paddingHorizontal: spacing.lg,
          paddingVertical: spacing.md,
          iconSize: 24,
          fontSize: typography.body,
        };
    }
  };

  const sizeStyles = getSizeStyles();

  const BadgeContent = (
    <View
      style={[
        styles.container,
        {
          backgroundColor: `${color}20`,
          borderColor: color,
          paddingHorizontal: sizeStyles.paddingHorizontal,
          paddingVertical: sizeStyles.paddingVertical,
        },
      ]}
    >
      <Text style={[styles.icon, { fontSize: sizeStyles.iconSize }]}>
        {icon}
      </Text>
      <Text style={[sizeStyles.fontSize, { color }]}>
        {name}
      </Text>
    </View>
  );

  if (onPress) {
    return (
      <MotiView
        from={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'timing', duration: 200 }}
      >
        <TouchableOpacity
          onPress={handlePress}
          activeOpacity={0.7}
          accessibilityLabel={`Category: ${name}`}
          accessibilityRole="button"
        >
          <MotiView
            animate={{ scale: 1 }}
            transition={{ type: 'timing', duration: 100 }}
          >
            {BadgeContent}
          </MotiView>
        </TouchableOpacity>
      </MotiView>
    );
  }

  return (
    <MotiView
      from={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: 'timing', duration: 200 }}
    >
      {BadgeContent}
    </MotiView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: borderRadius.full,
    borderWidth: 1,
    gap: spacing.xs,
  },
  icon: {
    lineHeight: 20,
  },
});
