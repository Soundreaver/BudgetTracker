import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MotiView } from 'moti';
import { Swipeable } from 'react-native-gesture-handler';
import Animated, {
  useAnimatedStyle,
  withSpring,
  withTiming,
  interpolate,
  useSharedValue,
} from 'react-native-reanimated';
import { triggerHaptic } from '@/utils/haptics';
import { colors, spacing, borderRadius, typography, shadows } from '@/constants/theme';
import { format } from 'date-fns';
import { useSettingsStore } from '@/store';
import { formatCurrency } from '@/utils/currency';

interface TransactionCardProps {
  id: number;
  amount: number;
  description: string;
  category: {
    name: string;
    icon: string;
    color: string;
  };
  date: string;
  type: 'expense' | 'income';
  onPress?: () => void;
  onEdit?: (id: number) => void;
  onDelete?: (id: number) => void;
  enableTextReveal?: boolean; // New prop to enable/disable text reveal animation
}

export const TransactionCard: React.FC<TransactionCardProps> = ({
  id,
  amount,
  description,
  category,
  date,
  type,
  onPress,
  onEdit,
  onDelete,
  enableTextReveal = true, // Enable by default
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  // Check if description is long enough to potentially be truncated (rough estimate)
  const isTruncated = enableTextReveal && description.length > 20;
  const animationProgress = useSharedValue(0);
  const expandHeight = useSharedValue(0);

  const handlePress = async () => {
    if (!enableTextReveal || !isTruncated) {
      await triggerHaptic('light');
      onPress?.();
      return;
    }
    
    await triggerHaptic('light');
    const newExpandedState = !isExpanded;
    setIsExpanded(newExpandedState);
    
    // Animate the expansion
    animationProgress.value = withSpring(newExpandedState ? 1 : 0, {
      damping: 15,
      stiffness: 150,
    });
    
    expandHeight.value = withTiming(newExpandedState ? 1 : 0, {
      duration: 300,
    });
    
    // Call onPress after animation if provided
    if (onPress && newExpandedState) {
      setTimeout(() => onPress(), 300);
    }
  };


  const handleEdit = async () => {
    await triggerHaptic('medium');
    onEdit?.(id);
  };

  const handleDelete = async () => {
    await triggerHaptic('heavy');
    onDelete?.(id);
  };

  const renderRightActions = () => {
    return (
      <View style={styles.actionsContainer}>
        {onDelete && (
          <TouchableOpacity
            onPress={handleDelete}
            style={styles.deleteButton}
            activeOpacity={0.8}
          >
            <Text style={styles.deleteIcon}>🗑️</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  const { currency: currencyCode } = useSettingsStore();
  const formattedAmount = type === 'expense' 
    ? `-${formatCurrency(amount, currencyCode)}` 
    : `+${formatCurrency(amount, currencyCode)}`;
  const amountColor = type === 'expense' ? colors.error[500] : colors.success[500];

  const descriptionContainerStyle = useAnimatedStyle(() => {
    return {
      height: interpolate(
        expandHeight.value,
        [0, 1],
        [24, 48] // Adjust these values based on your typography
      ),
    };
  });


  return (
    <MotiView
      from={{ opacity: 0, translateX: -20 }}
      animate={{ opacity: 1, translateX: 0 }}
      transition={{ type: 'timing', duration: 250 }}
    >
      <Swipeable renderRightActions={renderRightActions}>
        <TouchableOpacity
          onPress={handlePress}
          activeOpacity={0.7}
          style={[styles.container, { borderLeftColor: category.color }, shadows.sm]}
        >
          <View style={[styles.iconContainer, { backgroundColor: `${category.color}20` }]}>
            <Text style={styles.icon}>{category.icon}</Text>
          </View>

          <View style={styles.content}>
            <Animated.View style={[styles.descriptionContainer, descriptionContainerStyle]}>
              <View style={{ flex: 1 }}>
                <Text
                  style={[styles.description]}
                  numberOfLines={isExpanded ? undefined : 1}
                  ellipsizeMode={isExpanded ? undefined : "tail"}
                >
                  {description}
                </Text>
              </View>
              {enableTextReveal && isTruncated && (
                <Animated.View
                  style={[
                    styles.expandIndicator,
                    useAnimatedStyle(() => ({
                      opacity: interpolate(animationProgress.value, [0, 1], [0.5, 0]),
                      transform: [
                        {
                          scale: interpolate(animationProgress.value, [0, 1], [1, 0.8]),
                        },
                      ],
                    })),
                  ]}
                >
                  <Text style={styles.expandDots}>•••</Text>
                </Animated.View>
              )}
            </Animated.View>
            <View style={styles.footer}>
              <Text style={styles.category}>{category.name}</Text>
              <Text style={styles.date}>{format(new Date(date), 'MMM dd')}</Text>
            </View>
          </View>

          <Text style={[styles.amount, { color: amountColor }]}>
            {formattedAmount}
          </Text>
        </TouchableOpacity>
      </Swipeable>
    </MotiView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderLeftWidth: 4,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.xl,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  icon: {
    fontSize: 24,
  },
  content: {
    flex: 1,
  },
  descriptionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    overflow: 'hidden',
    marginBottom: spacing.xs,
  },
  description: {
    ...typography.body,
    color: colors.neutral[900],
    flex: 1,
  },
  expandIndicator: {
    marginLeft: spacing.xs,
    paddingHorizontal: spacing.xs,
  },
  expandDots: {
    color: colors.neutral[400],
    fontSize: 10,
    letterSpacing: 1,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  category: {
    ...typography.small,
    color: colors.neutral[600],
  },
  date: {
    ...typography.small,
    color: colors.neutral[500],
  },
  amount: {
    ...typography.heading6,
    fontWeight: '700',
  },
  actionsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginLeft: spacing.xs,
  },
  deleteButton: {
    backgroundColor: colors.error[500],
    justifyContent: 'center',
    alignItems: 'center',
    width: 60,
    height: 76,
    borderRadius: borderRadius.lg,
    ...shadows.sm,
  },
  deleteIcon: {
    fontSize: 24,
  },
});
