import React, { useState } from 'react';
import { TextInput, View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MotiView } from 'moti';
import { triggerHaptic } from '@/utils/haptics';
import { colors, spacing, borderRadius, typography } from '@/constants/theme';
import { useSettingsStore } from '@/store';
import { getCurrencyByCode } from '@/utils/currency';

interface AmountInputProps {
  value: string;
  onChangeValue: (value: string) => void;
  currency?: string;
  label?: string;
  error?: string;
  accessibilityLabel?: string;
  maxAmount?: number;
  suggestedAmounts?: number[];
}

export const AmountInput: React.FC<AmountInputProps> = ({
  value,
  onChangeValue,
  currency: currencyProp,
  label,
  error,
  accessibilityLabel,
  maxAmount,
  suggestedAmounts = [10, 20, 50, 100],
}) => {
  const { currency: currencyCode } = useSettingsStore();
  const selectedCurrency = getCurrencyByCode(currencyCode);
  const currency = currencyProp || selectedCurrency.symbol;
  const formatAmount = (text: string) => {
    // Remove non-numeric characters except decimal point
    const cleaned = text.replace(/[^0-9.]/g, '');
    
    // Ensure only one decimal point
    const parts = cleaned.split('.');
    if (parts.length > 2) {
      return parts[0] + '.' + parts.slice(1).join('');
    }
    
    // Limit decimal places to 2
    if (parts[1] && parts[1].length > 2) {
      return parts[0] + '.' + parts[1].slice(0, 2);
    }
    
    return cleaned;
  };

  const handleChangeText = (text: string) => {
    const formatted = formatAmount(text);
    if (maxAmount && parseFloat(formatted) > maxAmount) {
      return;
    }
    onChangeValue(formatted);
  };

  const handleSuggestedAmount = async (amount: number) => {
    await triggerHaptic('selection');
    onChangeValue(amount.toString());
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
          error ? styles.errorBorder : undefined,
        ]}
      >
        <Text style={styles.currency}>{currency}</Text>
        <TextInput
          value={value}
          onChangeText={handleChangeText}
          style={styles.input}
          placeholder="0.00"
          placeholderTextColor={colors.neutral[400]}
          keyboardType="decimal-pad"
          accessibilityLabel={accessibilityLabel || label}
        />
      </View>

      {suggestedAmounts && suggestedAmounts.length > 0 && (
        <View style={styles.suggestionsContainer}>
          {suggestedAmounts.map((amount) => (
            <TouchableOpacity
              key={amount}
              onPress={() => handleSuggestedAmount(amount)}
              style={styles.suggestionButton}
              activeOpacity={0.7}
            >
              <Text style={styles.suggestionText}>
                {currency}{amount}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

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
    borderColor: colors.neutral[300],
    borderRadius: borderRadius.md,
    backgroundColor: colors.white,
    paddingHorizontal: spacing.md,
    minHeight: 56,
  },
  currency: {
    ...typography.heading4,
    color: colors.neutral[600],
    marginRight: spacing.sm,
  },
  input: {
    flex: 1,
    ...typography.heading4,
    color: colors.neutral[900],
    paddingVertical: spacing.md,
  },
  errorBorder: {
    borderColor: colors.error[500],
  },
  errorText: {
    ...typography.small,
    color: colors.error[500],
    marginTop: spacing.xs,
  },
  suggestionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  suggestionButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.neutral[100],
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.neutral[300],
  },
  suggestionText: {
    ...typography.caption,
    color: colors.neutral[700],
    fontWeight: '600',
  },
});
