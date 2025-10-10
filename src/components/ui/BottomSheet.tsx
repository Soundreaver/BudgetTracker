import React, { useRef, useState } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, Dimensions, ScrollView, Pressable, PanResponder, Animated } from 'react-native';
import { MotiView } from 'moti';
import { triggerHaptic } from '@/utils/haptics';
import { colors, spacing, borderRadius, typography, shadows } from '@/constants/theme';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

interface BottomSheetProps {
  visible: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  snapPoint?: number; // Percentage of screen height (0-100)
}

export const BottomSheet: React.FC<BottomSheetProps> = ({
  visible,
  onClose,
  title,
  children,
  snapPoint = 60,
}) => {
  const [dragOffset, setDragOffset] = useState(0);
  const translateY = useRef(new Animated.Value(0)).current;

  const handleClose = async () => {
    await triggerHaptic('light');
    onClose();
  };

  const sheetHeight = (SCREEN_HEIGHT * snapPoint) / 100;

  // Pan responder for drag-to-close gesture
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, gestureState) => {
        // Only respond to vertical drags
        return Math.abs(gestureState.dy) > 5;
      },
      onPanResponderGrant: () => {
        triggerHaptic('light');
      },
      onPanResponderMove: (_, gestureState) => {
        // Only allow dragging down, not up
        if (gestureState.dy > 0) {
          setDragOffset(gestureState.dy);
          translateY.setValue(gestureState.dy);
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        // If dragged down more than 150px, close the modal
        if (gestureState.dy > 150) {
          // Just close immediately - modal will handle its own exit animation
          handleClose();
          // Reset after a delay to avoid flash
          setTimeout(() => {
            translateY.setValue(0);
            setDragOffset(0);
          }, 300);
        } else {
          // Animate back to position
          Animated.spring(translateY, {
            toValue: 0,
            tension: 80,
            friction: 10,
            useNativeDriver: true,
          }).start();
          setDragOffset(0);
        }
      },
    })
  ).current;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={handleClose}
      statusBarTranslucent
    >
      <Pressable style={styles.backdrop} onPress={handleClose}>
        <MotiView
          from={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ type: 'timing', duration: 250 }}
          style={StyleSheet.absoluteFill}
        >
          <View style={styles.backdropOverlay} />
        </MotiView>
      </Pressable>

      <Animated.View
        style={[
          styles.sheet,
          { height: sheetHeight },
          shadows['2xl'],
          {
            transform: [{ translateY: translateY }],
          },
        ]}
      >
        <View style={styles.handleBar} {...panResponder.panHandlers}>
          <View style={styles.handle} />
        </View>
        
        {title && (
          <View style={styles.header}>
            <Text style={styles.title}>{title}</Text>
            <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
              <Text style={styles.closeIcon}>✕</Text>
            </TouchableOpacity>
          </View>
        )}

        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          bounces={true}
          scrollEventThrottle={16}
        >
          {children}
        </ScrollView>
      </Animated.View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'flex-end',
  },
  backdropOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: colors.black,
    opacity: 0.5,
  },
  sheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.white,
    borderTopLeftRadius: borderRadius['2xl'],
    borderTopRightRadius: borderRadius['2xl'],
  },
  handleBar: {
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
    alignItems: 'center',
  },
  handle: {
    width: 40,
    height: 4,
    backgroundColor: colors.neutral[300],
    borderRadius: borderRadius.sm,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral[200],
  },
  title: {
    ...typography.heading4,
    color: colors.neutral[900],
  },
  closeButton: {
    padding: spacing.sm,
  },
  closeIcon: {
    ...typography.heading5,
    color: colors.neutral[600],
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.lg,
    paddingBottom: spacing.xl,
  },
});
