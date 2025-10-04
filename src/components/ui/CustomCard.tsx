import React from 'react';
import { TouchableOpacity, View, StyleSheet, ViewStyle } from 'react-native';
import { MotiView } from 'moti';
import { triggerHaptic } from '@/utils/haptics';
import { colors, spacing, borderRadius, shadows } from '@/constants/theme';

interface CustomCardProps {
  children: React.ReactNode;
  onPress?: () => void;
  variant?: 'elevated' | 'outlined' | 'filled';
  padding?: keyof typeof spacing;
  hapticFeedback?: 'light' | 'medium' | 'heavy';
  accessibilityLabel?: string;
  style?: ViewStyle;
  animateOnPress?: boolean;
}

export const CustomCard: React.FC<CustomCardProps> = ({
  children,
  onPress,
  variant = 'elevated',
  padding = 'md',
  hapticFeedback = 'light',
  accessibilityLabel,
  style,
  animateOnPress = true,
}) => {
  const handlePress = async () => {
    if (!onPress) return;
    
    await triggerHaptic(hapticFeedback);
    onPress();
  };

  const getVariantStyles = () => {
    switch (variant) {
      case 'elevated':
        return {
          backgroundColor: colors.white,
          ...shadows.md,
        };
      case 'outlined':
        return {
          backgroundColor: colors.white,
          borderWidth: 1,
          borderColor: colors.neutral[300],
        };
      case 'filled':
        return {
          backgroundColor: colors.neutral[100],
        };
    }
  };

  const variantStyles = getVariantStyles();
  const paddingValue = spacing[padding];

  const content = (
    <View
      style={[
        styles.card,
        variantStyles,
        { padding: paddingValue },
        style,
      ]}
    >
      {children}
    </View>
  );

  if (onPress) {
    return (
      <MotiView
        from={{ opacity: 0, translateY: 20 }}
        animate={{ opacity: 1, translateY: 0 }}
        transition={{ type: 'timing', duration: 300 }}
      >
        <TouchableOpacity
          onPress={handlePress}
          activeOpacity={0.7}
          accessibilityLabel={accessibilityLabel}
          accessibilityRole="button"
        >
          <MotiView
            animate={animateOnPress ? { scale: 1 } : {}}
            transition={{ type: 'timing', duration: 100 }}
          >
            {content}
          </MotiView>
        </TouchableOpacity>
      </MotiView>
    );
  }

  return (
    <MotiView
      from={{ opacity: 0, translateY: 20 }}
      animate={{ opacity: 1, translateY: 0 }}
      transition={{ type: 'timing', duration: 300 }}
    >
      {content}
    </MotiView>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: borderRadius.lg,
  },
});
