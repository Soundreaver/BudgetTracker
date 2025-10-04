import React from 'react';
import { TouchableOpacity, ActivityIndicator, Text, StyleSheet, View } from 'react-native';
import { triggerHaptic } from '@/utils/haptics';
import { colors, spacing, borderRadius, shadows } from '@/constants/theme';

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
type ButtonSize = 'sm' | 'md' | 'lg';

interface CustomButtonProps {
  onPress: () => void | Promise<void>;
  children: React.ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  hapticFeedback?: 'light' | 'medium' | 'heavy';
  accessibilityLabel?: string;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
}

export const CustomButton: React.FC<CustomButtonProps> = ({
  onPress,
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  fullWidth = false,
  hapticFeedback = 'medium',
  accessibilityLabel,
  icon,
  iconPosition = 'left',
}) => {
  const handlePress = async () => {
    if (disabled || loading) return;
    
    await triggerHaptic(hapticFeedback);
    onPress();
  };

  const getVariantStyles = () => {
    switch (variant) {
      case 'primary':
        return {
          container: {
            backgroundColor: colors.primary[500],
            borderColor: colors.primary[500],
          },
          text: {
            color: colors.white,
          },
        };
      case 'secondary':
        return {
          container: {
            backgroundColor: colors.secondary[500],
            borderColor: colors.secondary[500],
          },
          text: {
            color: colors.white,
          },
        };
      case 'outline':
        return {
          container: {
            backgroundColor: 'transparent',
            borderColor: colors.primary[500],
          },
          text: {
            color: colors.primary[500],
          },
        };
      case 'ghost':
        return {
          container: {
            backgroundColor: 'transparent',
            borderColor: 'transparent',
          },
          text: {
            color: colors.primary[500],
          },
        };
      case 'danger':
        return {
          container: {
            backgroundColor: colors.error[500],
            borderColor: colors.error[500],
          },
          text: {
            color: colors.white,
          },
        };
    }
  };

  const getSizeStyles = () => {
    switch (size) {
      case 'sm':
        return {
          container: {
            paddingVertical: spacing.sm,
            paddingHorizontal: spacing.md,
            minHeight: 36,
          },
          text: {
            fontSize: 12,
          },
        };
      case 'md':
        return {
          container: {
            paddingVertical: spacing.md,
            paddingHorizontal: spacing.lg,
            minHeight: 44,
          },
          text: {
            fontSize: 14,
          },
        };
      case 'lg':
        return {
          container: {
            paddingVertical: spacing.lg,
            paddingHorizontal: spacing.xl,
            minHeight: 52,
          },
          text: {
            fontSize: 16,
          },
        };
    }
  };

  const variantStyles = getVariantStyles();
  const sizeStyles = getSizeStyles();

  return (
    <TouchableOpacity
      onPress={handlePress}
      disabled={disabled || loading}
      activeOpacity={0.7}
      accessibilityLabel={accessibilityLabel || (typeof children === 'string' ? children : undefined)}
      accessibilityRole="button"
      accessibilityState={{ disabled: disabled || loading }}
      style={[
        styles.button,
        variantStyles.container,
        sizeStyles.container,
        fullWidth && styles.fullWidth,
        (disabled || loading) && styles.disabled,
        variant !== 'ghost' && shadows.md,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={variantStyles.text.color} size="small" />
      ) : (
        <View style={styles.content}>
          {icon && iconPosition === 'left' && (
            <View style={styles.iconLeft}>{icon}</View>
          )}
          <Text
            style={[
              styles.text,
              variantStyles.text,
              sizeStyles.text,
            ]}
            numberOfLines={1}
          >
            {children}
          </Text>
          {icon && iconPosition === 'right' && (
            <View style={styles.iconRight}>{icon}</View>
          )}
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    borderRadius: borderRadius.md,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontWeight: '600',
    textAlign: 'center',
  },
  iconLeft: {
    marginRight: spacing.sm,
  },
  iconRight: {
    marginLeft: spacing.sm,
  },
  fullWidth: {
    width: '100%',
  },
  disabled: {
    opacity: 0.5,
  },
});
