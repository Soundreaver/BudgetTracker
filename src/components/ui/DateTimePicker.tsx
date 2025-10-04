import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { MotiView } from 'moti';
import { triggerHaptic } from '@/utils/haptics';
import { colors, spacing, borderRadius, typography } from '@/constants/theme';
import { format } from 'date-fns';

interface DateTimePickerProps {
  value: Date;
  onChange: (date: Date) => void;
  mode?: 'date' | 'time' | 'datetime';
  label?: string;
  minimumDate?: Date;
  maximumDate?: Date;
  accessibilityLabel?: string;
}

export const DateTimePicker: React.FC<DateTimePickerProps> = ({
  value,
  onChange,
  mode = 'date',
  label,
  minimumDate,
  maximumDate,
  accessibilityLabel,
}) => {
  const [showPicker, setShowPicker] = useState(false);

  const handlePress = async () => {
    await triggerHaptic('light');
    setShowPicker(true);
    // Note: Actual date picker implementation would use @react-native-community/datetimepicker
    // or a custom modal picker. This is a simplified version.
  };

  const formatDate = () => {
    switch (mode) {
      case 'date':
        return format(value, 'MMM dd, yyyy');
      case 'time':
        return format(value, 'hh:mm a');
      case 'datetime':
        return format(value, 'MMM dd, yyyy hh:mm a');
      default:
        return format(value, 'MMM dd, yyyy');
    }
  };

  return (
    <MotiView
      from={{ opacity: 0, translateY: -10 }}
      animate={{ opacity: 1, translateY: 0 }}
      transition={{ type: 'timing', duration: 250 }}
    >
      {label && <Text style={styles.label}>{label}</Text>}
      
      <TouchableOpacity
        onPress={handlePress}
        activeOpacity={0.7}
        style={styles.pickerButton}
        accessibilityLabel={accessibilityLabel || label}
        accessibilityRole="button"
      >
        <View style={styles.iconContainer}>
          <Text style={styles.icon}>{mode === 'time' ? '🕐' : '📅'}</Text>
        </View>
        <Text style={styles.dateText}>{formatDate()}</Text>
        <Text style={styles.chevron}>›</Text>
      </TouchableOpacity>

      {/* Note: In a real implementation, you would integrate @react-native-community/datetimepicker here */}
    </MotiView>
  );
};

const styles = StyleSheet.create({
  label: {
    ...typography.captionBold,
    color: colors.neutral[700],
    marginBottom: spacing.sm,
  },
  pickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.neutral[300],
    borderRadius: borderRadius.md,
    backgroundColor: colors.white,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    minHeight: 44,
  },
  iconContainer: {
    marginRight: spacing.md,
  },
  icon: {
    fontSize: 20,
  },
  dateText: {
    flex: 1,
    ...typography.body,
    color: colors.neutral[900],
  },
  chevron: {
    ...typography.heading5,
    color: colors.neutral[400],
    transform: [{ rotate: '90deg' }],
  },
});
