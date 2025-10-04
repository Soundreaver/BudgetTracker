import React from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, Dimensions, ScrollView, Pressable } from 'react-native';
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
  const handleClose = async () => {
    await triggerHaptic('light');
    onClose();
  };

  const sheetHeight = (SCREEN_HEIGHT * snapPoint) / 100;

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

      <MotiView
        from={{ translateY: sheetHeight }}
        animate={{ translateY: 0 }}
        exit={{ translateY: sheetHeight }}
        transition={{ type: 'timing', duration: 300 }}
        style={[styles.sheet, { height: sheetHeight }, shadows['2xl']]}
      >
        <View style={styles.handleBar}>
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
      </MotiView>
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
