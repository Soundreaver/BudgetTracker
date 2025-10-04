import React from 'react';
import { TextInput, View, Text, StyleSheet, TextInputProps } from 'react-native';
import { MotiView } from 'moti';
import { colors, spacing, borderRadius, typography } from '@/constants/theme';

interface CustomInputProps extends Omit<TextInputProps, 'style'> {
  label?: string;
  error?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  variant?: 'default' | 'success' | 'error' | 'warning';
  accessibilityLabel?: string;
}

export const CustomInput: React.FC<CustomInputProps> = ({
  label,
  error,
  leftIcon,
  rightIcon,
  variant = 'default',
  accessibilityLabel,
  ...textInputProps
}) => {
  const getBorderColor = () => {
    if (error || variant === 'error') return colors.error[500];
    if (variant === 'success') return colors.success[500];
    if (variant === 'warning') return colors.warning[500];
    return colors.neutral[300];
  };

  return (
    <MotiView
      from={{ opacity: 0, translateY: -10 }}
      animate={{ opacity: 1, translateY: 0 }}
      transition={{ type: 'timing', duration: 250 }}
    >
      {label && <Text style={styles.label}>{label}</Text>}
      <View
        style={[
          styles.inputContainer,
          { borderColor: getBorderColor() },
          error && styles.errorBorder,
        ]}
      >
        {leftIcon && <View style={styles.leftIcon}>{leftIcon}</View>}
        <TextInput
          {...textInputProps}
          style={[
            styles.input,
            leftIcon ? styles.inputWithLeftIcon : undefined,
            rightIcon ? styles.inputWithRightIcon : undefined,
          ]}
          placeholderTextColor={colors.neutral[400]}
          accessibilityLabel={accessibilityLabel || label}
        />
        {rightIcon && <View style={styles.rightIcon}>{rightIcon}</View>}
      </View>
      {error && (
        <MotiView
          from={{ opacity: 0, translateY: -5 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'timing', duration: 200 }}
        >
          <Text style={styles.errorText}>{error}</Text>
        </MotiView>
      )}
    </MotiView>
  );
};

const styles = StyleSheet.create({
  label: {
    ...typography.captionBold,
    color: colors.neutral[700],
    marginBottom: spacing.sm,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: borderRadius.md,
    backgroundColor: colors.white,
    minHeight: 44,
  },
  input: {
    flex: 1,
    ...typography.body,
    color: colors.neutral[900],
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  inputWithLeftIcon: {
    paddingLeft: spacing.sm,
  },
  inputWithRightIcon: {
    paddingRight: spacing.sm,
  },
  leftIcon: {
    marginLeft: spacing.md,
  },
  rightIcon: {
    marginRight: spacing.md,
  },
  errorBorder: {
    borderColor: colors.error[500],
  },
  errorText: {
    ...typography.small,
    color: colors.error[500],
    marginTop: spacing.xs,
  },
});
