import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { MotiView } from 'moti';
import { format, differenceInDays, differenceInMonths } from 'date-fns';
import { triggerHaptic } from '@/utils/haptics';
import { colors, spacing, borderRadius, typography, shadows } from '@/constants/theme';
import {
  BottomSheet,
  AmountInput,
  DateTimePicker,
  CustomInput,
  CustomButton,
  ProgressBar,
  EmptyState,
} from '@/components/ui';

interface SavingsGoal {
  id: number;
  name: string;
  targetAmount: number;
  currentAmount: number;
  deadline: string;
  icon: string;
  color: string;
}

const GOAL_ICONS = ['🎯', '🏠', '🚗', '✈️', '💍', '🎓', '💰', '🏖️', '🎁', '📱', '💻', '🎸'];
const GOAL_COLORS = [
  colors.primary[500],
  colors.success[500],
  colors.warning[500],
  colors.error[500],
  '#FF6B6B',
  '#4ECDC4',
  '#45B7D1',
  '#96CEB4',
];

export const SavingsGoalsScreen: React.FC = () => {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState<SavingsGoal | null>(null);

  // Add goal form state
  const [goalName, setGoalName] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [currentAmount, setCurrentAmount] = useState('');
  const [deadline, setDeadline] = useState(new Date());
  const [selectedIcon, setSelectedIcon] = useState('🎯');
  const [selectedColor, setSelectedColor] = useState(colors.primary[500]);

  // Mock goals data
  const [goals, setGoals] = useState<SavingsGoal[]>([
    {
      id: 1,
      name: 'Vacation Fund',
      targetAmount: 3000,
      currentAmount: 1850,
      deadline: '2025-12-31',
      icon: '✈️',
      color: '#45B7D1',
    },
    {
      id: 2,
      name: 'Emergency Fund',
      targetAmount: 10000,
      currentAmount: 6500,
      deadline: '2026-06-30',
      icon: '💰',
      color: colors.success[500],
    },
  ]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    // Would load goals from store
    setIsRefreshing(false);
  };

  const handleAddGoal = async () => {
    if (!goalName || !targetAmount) {
      await triggerHaptic('error');
      return;
    }

    await triggerHaptic('success');

    const newGoal: SavingsGoal = {
      id: Date.now(),
      name: goalName,
      targetAmount: parseFloat(targetAmount),
      currentAmount: parseFloat(currentAmount) || 0,
      deadline: format(deadline, 'yyyy-MM-dd'),
      icon: selectedIcon,
      color: selectedColor,
    };

    setGoals([...goals, newGoal]);

    // Reset form
    setGoalName('');
    setTargetAmount('');
    setCurrentAmount('');
    setDeadline(new Date());
    setSelectedIcon('🎯');
    setSelectedColor(colors.primary[500]);
    setShowAddModal(false);
  };

  const handleAddFunds = async (goalId: number, amount: number) => {
    await triggerHaptic('medium');
    setGoals(goals.map(g => 
      g.id === goalId 
        ? { ...g, currentAmount: g.currentAmount + amount }
        : g
    ));
  };

  const renderGoalCard = (goal: SavingsGoal) => {
    const percentage = (goal.currentAmount / goal.targetAmount) * 100;
    const remaining = goal.targetAmount - goal.currentAmount;
    const daysRemaining = differenceInDays(new Date(goal.deadline), new Date());
    const monthsRemaining = differenceInMonths(new Date(goal.deadline), new Date());
    const monthlySavingsNeeded = monthsRemaining > 0 ? remaining / monthsRemaining : remaining;

    return (
      <MotiView
        key={goal.id}
        from={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: 'timing', duration: 300 }}
      >
        <TouchableOpacity
          onPress={() => {
            setSelectedGoal(goal);
            setShowDetailsModal(true);
          }}
          activeOpacity={0.9}
          style={[styles.goalCard, shadows.md]}
        >
          <View style={styles.goalHeader}>
            <View
              style={[
                styles.goalIconContainer,
                { backgroundColor: `${goal.color}20` },
              ]}
            >
              <Text style={styles.goalIcon}>{goal.icon}</Text>
            </View>
            <View style={styles.goalInfo}>
              <Text style={styles.goalName}>{goal.name}</Text>
              <Text style={styles.goalDeadline}>
                Due: {format(new Date(goal.deadline), 'MMM dd, yyyy')}
              </Text>
            </View>
            <View style={styles.percentageBadge}>
              <Text style={[styles.percentageText, { color: goal.color }]}>
                {percentage.toFixed(0)}%
              </Text>
            </View>
          </View>

          <ProgressBar
            progress={percentage}
            variant={percentage >= 75 ? 'success' : percentage >= 50 ? 'primary' : 'warning'}
            showPercentage={false}
            animated
            height={12}
          />

          <View style={styles.goalAmounts}>
            <View style={styles.amountItem}>
              <Text style={styles.amountLabel}>Current</Text>
              <Text style={styles.amountValue}>
                ${goal.currentAmount.toFixed(2)}
              </Text>
            </View>
            <View style={styles.amountItem}>
              <Text style={styles.amountLabel}>Target</Text>
              <Text style={styles.amountValue}>
                ${goal.targetAmount.toFixed(2)}
              </Text>
            </View>
            <View style={styles.amountItem}>
              <Text style={styles.amountLabel}>Remaining</Text>
              <Text style={[styles.amountValue, { color: colors.error[500] }]}>
                ${remaining.toFixed(2)}
              </Text>
            </View>
          </View>

          <View style={styles.goalFooter}>
            <View style={styles.timeInfo}>
              <Text style={styles.timeInfoIcon}>⏱️</Text>
              <Text style={styles.timeInfoText}>{daysRemaining} days left</Text>
            </View>
            <TouchableOpacity
              onPress={() => handleAddFunds(goal.id, 50)}
              style={[styles.addFundsButton, { backgroundColor: goal.color }]}
            >
              <Text style={styles.addFundsText}>+ Add Funds</Text>
            </TouchableOpacity>
          </View>

          {monthlySavingsNeeded > 0 && (
            <View style={styles.savingsNeeded}>
              <Text style={styles.savingsNeededText}>
                Save ${monthlySavingsNeeded.toFixed(2)}/month to reach goal
              </Text>
            </View>
          )}
        </TouchableOpacity>
      </MotiView>
    );
  };

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            tintColor={colors.primary[500]}
          />
        }
      >
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Savings Goals</Text>
          {goals.length > 0 ? (
            goals.map(renderGoalCard)
          ) : (
            <EmptyState
              variant="savings"
              onAction={() => setShowAddModal(true)}
            />
          )}
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* FAB */}
      <MotiView
        from={{ scale: 0, rotate: '-180deg' }}
        animate={{ scale: 1, rotate: '0deg' }}
        transition={{ type: 'spring', damping: 15, delay: 300 }}
        style={styles.fabContainer}
      >
        <TouchableOpacity
          onPress={() => setShowAddModal(true)}
          activeOpacity={0.8}
          style={[styles.fab, shadows.xl]}
        >
          <Text style={styles.fabIcon}>+</Text>
        </TouchableOpacity>
      </MotiView>

      {/* Add Goal Modal */}
      <BottomSheet
        visible={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Add Savings Goal"
        snapPoint={90}
      >
        <View style={styles.modalContent}>
          <CustomInput
            label="Goal Name"
            value={goalName}
            onChangeText={setGoalName}
            placeholder="e.g., Vacation Fund"
          />

          <AmountInput
            value={targetAmount}
            onChangeValue={setTargetAmount}
            currency="$"
            label="Target Amount"
            suggestedAmounts={[1000, 5000, 10000, 20000]}
          />

          <AmountInput
            value={currentAmount}
            onChangeValue={setCurrentAmount}
            currency="$"
            label="Current Amount"
          />

          <DateTimePicker
            value={deadline}
            onChange={setDeadline}
            mode="date"
            label="Deadline"
          />

          <View style={styles.modalSection}>
            <Text style={styles.modalSectionTitle}>Icon</Text>
            <View style={styles.iconGrid}>
              {GOAL_ICONS.map((icon) => (
                <TouchableOpacity
                  key={icon}
                  onPress={() => setSelectedIcon(icon)}
                  style={[
                    styles.iconButton,
                    selectedIcon === icon && styles.iconButtonSelected,
                  ]}
                >
                  <Text style={styles.iconButtonText}>{icon}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.modalSection}>
            <Text style={styles.modalSectionTitle}>Color</Text>
            <View style={styles.colorGrid}>
              {GOAL_COLORS.map((color) => (
                <TouchableOpacity
                  key={color}
                  onPress={() => setSelectedColor(color)}
                  style={[
                    styles.colorButton,
                    { backgroundColor: color },
                    selectedColor === color && styles.colorButtonSelected,
                  ]}
                />
              ))}
            </View>
          </View>

          <CustomButton
            onPress={handleAddGoal}
            variant="primary"
            size="lg"
            fullWidth
            hapticFeedback="medium"
          >
            Save Goal
          </CustomButton>
        </View>
      </BottomSheet>

      {/* Goal Details Modal */}
      {selectedGoal && (
        <BottomSheet
          visible={showDetailsModal}
          onClose={() => setShowDetailsModal(false)}
          title={selectedGoal.name}
          snapPoint={80}
        >
          <View style={styles.modalContent}>
            <View style={styles.detailsHeader}>
              <View
                style={[
                  styles.detailsIcon,
                  { backgroundColor: `${selectedGoal.color}20` },
                ]}
              >
                <Text style={styles.detailsIconText}>{selectedGoal.icon}</Text>
              </View>
              <Text style={styles.detailsPercentage}>
                {((selectedGoal.currentAmount / selectedGoal.targetAmount) * 100).toFixed(1)}%
              </Text>
            </View>

            <ProgressBar
              progress={(selectedGoal.currentAmount / selectedGoal.targetAmount) * 100}
              variant="success"
              showPercentage={false}
              animated
              height={16}
            />

            <View style={styles.detailsAmounts}>
              <Text style={styles.detailsAmount}>
                ${selectedGoal.currentAmount.toFixed(2)} / ${selectedGoal.targetAmount.toFixed(2)}
              </Text>
              <Text style={styles.detailsRemaining}>
                ${(selectedGoal.targetAmount - selectedGoal.currentAmount).toFixed(2)} remaining
              </Text>
            </View>

            <CustomButton
              onPress={() => handleAddFunds(selectedGoal.id, 100)}
              variant="primary"
              size="lg"
              fullWidth
            >
              Add Contribution
            </CustomButton>
          </View>
        </BottomSheet>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.neutral[50],
  },
  scrollView: {
    flex: 1,
  },
  section: {
    padding: spacing.xl,
  },
  sectionTitle: {
    ...typography.heading5,
    color: colors.neutral[900],
    marginBottom: spacing.lg,
  },
  goalCard: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    marginBottom: spacing.md,
  },
  goalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  goalIconContainer: {
    width: 56,
    height: 56,
    borderRadius: borderRadius.xl,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  goalIcon: {
    fontSize: 28,
  },
  goalInfo: {
    flex: 1,
  },
  goalName: {
    ...typography.heading6,
    color: colors.neutral[900],
    marginBottom: spacing.xs,
  },
  goalDeadline: {
    ...typography.small,
    color: colors.neutral[500],
  },
  percentageBadge: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.neutral[100],
    borderRadius: borderRadius.full,
  },
  percentageText: {
    ...typography.bodyBold,
    fontWeight: '700',
  },
  goalAmounts: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.md,
    marginBottom: spacing.md,
  },
  amountItem: {
    alignItems: 'center',
  },
  amountLabel: {
    ...typography.small,
    color: colors.neutral[600],
    marginBottom: spacing.xs,
  },
  amountValue: {
    ...typography.bodyBold,
    color: colors.neutral[900],
  },
  goalFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.md,
  },
  timeInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  timeInfoIcon: {
    fontSize: 16,
  },
  timeInfoText: {
    ...typography.small,
    color: colors.neutral[700],
  },
  addFundsButton: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
  },
  addFundsText: {
    ...typography.caption,
    color: colors.white,
    fontWeight: '600',
  },
  savingsNeeded: {
    marginTop: spacing.md,
    padding: spacing.md,
    backgroundColor: colors.primary[50],
    borderRadius: borderRadius.md,
  },
  savingsNeededText: {
    ...typography.small,
    color: colors.primary[700],
    textAlign: 'center',
  },
  fabContainer: {
    position: 'absolute',
    bottom: spacing.xl,
    right: spacing.xl,
  },
  fab: {
    width: 64,
    height: 64,
    borderRadius: borderRadius.full,
    backgroundColor: colors.primary[500],
    alignItems: 'center',
    justifyContent: 'center',
  },
  fabIcon: {
    fontSize: 32,
    color: colors.white,
    fontWeight: '300',
  },
  modalContent: {
    gap: spacing.lg,
  },
  modalSection: {
    gap: spacing.sm,
  },
  modalSectionTitle: {
    ...typography.captionBold,
    color: colors.neutral[700],
  },
  iconGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  iconButton: {
    width: 50,
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: borderRadius.md,
    backgroundColor: colors.neutral[100],
    borderWidth: 2,
    borderColor: 'transparent',
  },
  iconButtonSelected: {
    borderColor: colors.primary[500],
    backgroundColor: colors.primary[50],
  },
  iconButtonText: {
    fontSize: 24,
  },
  colorGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  colorButton: {
    width: 50,
    height: 50,
    borderRadius: borderRadius.full,
    borderWidth: 3,
    borderColor: 'transparent',
  },
  colorButtonSelected: {
    borderColor: colors.neutral[900],
  },
  detailsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  detailsIcon: {
    width: 80,
    height: 80,
    borderRadius: borderRadius.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  detailsIconText: {
    fontSize: 40,
  },
  detailsPercentage: {
    ...typography.heading2,
    color: colors.primary[500],
    fontWeight: '700',
  },
  detailsAmounts: {
    alignItems: 'center',
    marginTop: spacing.md,
    marginBottom: spacing.lg,
  },
  detailsAmount: {
    ...typography.heading5,
    color: colors.neutral[900],
    marginBottom: spacing.xs,
  },
  detailsRemaining: {
    ...typography.body,
    color: colors.neutral[600],
  },
});
