import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import Animated, {
  useAnimatedStyle,
  withSpring,
  withTiming,
  interpolate,
  useSharedValue,
  Easing,
} from 'react-native-reanimated';
import { triggerHaptic } from '@/utils/haptics';
import { colors, spacing, borderRadius, typography } from '@/constants/theme';

const { width } = Dimensions.get('window');

export type AnimationType = 'slide' | 'expand' | 'fade-slide' | 'height-expand';

interface AnimatedTextRevealProps {
  text: string;
  style?: any;
  numberOfLines?: number;
  animationType?: AnimationType;
  enableAnimation?: boolean;
  showIndicator?: boolean;
  indicatorType?: 'arrow' | 'dots' | 'plus';
  onExpand?: () => void;
  onCollapse?: () => void;
}

export const AnimatedTextReveal: React.FC<AnimatedTextRevealProps> = ({
  text,
  style,
  numberOfLines = 1,
  animationType = 'slide',
  enableAnimation = true,
  showIndicator = true,
  indicatorType = 'arrow',
  onExpand,
  onCollapse,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isTruncated, setIsTruncated] = useState(false);
  const animationProgress = useSharedValue(0);
  const heightValue = useSharedValue(0);
  const slideValue = useSharedValue(0);

  const handlePress = async () => {
    if (!enableAnimation || !isTruncated) return;
    
    await triggerHaptic('light');
    const newExpandedState = !isExpanded;
    setIsExpanded(newExpandedState);
    
    // Trigger callbacks
    if (newExpandedState) {
      onExpand?.();
    } else {
      onCollapse?.();
    }
    
    // Animate based on type
    switch (animationType) {
      case 'slide':
        animationProgress.value = withSpring(newExpandedState ? 1 : 0, {
          damping: 20,
          stiffness: 200,
        });
        slideValue.value = withTiming(newExpandedState ? 1 : 0, {
          duration: 300,
          easing: Easing.inOut(Easing.ease),
        });
        break;
        
      case 'expand':
        animationProgress.value = withSpring(newExpandedState ? 1 : 0, {
          damping: 15,
          stiffness: 150,
        });
        heightValue.value = withTiming(newExpandedState ? 1 : 0, {
          duration: 350,
          easing: Easing.bezier(0.4, 0, 0.2, 1),
        });
        break;
        
      case 'fade-slide':
        animationProgress.value = withTiming(newExpandedState ? 1 : 0, {
          duration: 400,
          easing: Easing.bezier(0.4, 0, 0.2, 1),
        });
        slideValue.value = withSpring(newExpandedState ? 1 : 0, {
          damping: 18,
          stiffness: 180,
        });
        break;
        
      case 'height-expand':
        heightValue.value = withSpring(newExpandedState ? 1 : 0, {
          damping: 12,
          stiffness: 120,
        });
        animationProgress.value = withTiming(newExpandedState ? 1 : 0, {
          duration: 250,
        });
        break;
    }
  };

  const handleTextLayout = (event: any) => {
    const { lines } = event.nativeEvent;
    if (lines && lines.length > 0) {
      const lastLine = lines[lines.length - 1];
      if (lastLine && lastLine.text && text.length > lastLine.text.length) {
        setIsTruncated(true);
      }
    }
  };

  // Animation styles based on type
  const getContainerStyle = () => {
    switch (animationType) {
      case 'slide':
      case 'fade-slide':
        return useAnimatedStyle(() => ({
          overflow: 'hidden',
        }));
        
      case 'expand':
      case 'height-expand':
        return useAnimatedStyle(() => ({
          height: interpolate(
            heightValue.value,
            [0, 1],
            [24 * numberOfLines, 24 * (numberOfLines + 2)] // Adjust based on your typography
          ),
          overflow: 'hidden',
        }));
        
      default:
        return {};
    }
  };

  const getTextStyle = () => {
    switch (animationType) {
      case 'slide':
        return useAnimatedStyle(() => ({
          transform: [
            {
              translateX: interpolate(
                slideValue.value,
                [0, 1],
                [0, -10]
              ),
            },
          ],
          opacity: interpolate(
            animationProgress.value,
            [0, 0.5, 1],
            [1, 0.8, 1]
          ),
        }));
        
      case 'expand':
        return useAnimatedStyle(() => ({
          opacity: interpolate(
            animationProgress.value,
            [0, 0.3, 1],
            [1, 0.9, 1]
          ),
        }));
        
      case 'fade-slide':
        return useAnimatedStyle(() => ({
          opacity: interpolate(
            animationProgress.value,
            [0, 0.5, 1],
            [1, 0.6, 1]
          ),
          transform: [
            {
              translateY: interpolate(
                slideValue.value,
                [0, 1],
                [0, -5]
              ),
            },
            {
              scale: interpolate(
                animationProgress.value,
                [0, 1],
                [1, 1.02]
              ),
            },
          ],
        }));
        
      case 'height-expand':
        return useAnimatedStyle(() => ({
          opacity: interpolate(
            animationProgress.value,
            [0, 1],
            [1, 1]
          ),
        }));
        
      default:
        return {};
    }
  };

  const getIndicatorStyle = () => {
    return useAnimatedStyle(() => ({
      opacity: interpolate(animationProgress.value, [0, 1], [0.6, 0]),
      transform: [
        {
          rotate: indicatorType === 'arrow' 
            ? `${interpolate(animationProgress.value, [0, 1], [0, 180])}deg`
            : '0deg',
        },
        {
          scale: interpolate(animationProgress.value, [0, 1], [1, 0.8]),
        },
      ],
    }));
  };

  const renderIndicator = () => {
    if (!showIndicator || !isTruncated) return null;
    
    let indicatorContent;
    switch (indicatorType) {
      case 'arrow':
        indicatorContent = '›';
        break;
      case 'dots':
        indicatorContent = '•••';
        break;
      case 'plus':
        indicatorContent = isExpanded ? '−' : '+';
        break;
      default:
        indicatorContent = '›';
    }
    
    return (
      <Animated.View style={[styles.indicator, getIndicatorStyle()]}>
        <Text style={styles.indicatorText}>{indicatorContent}</Text>
      </Animated.View>
    );
  };

  return (
    <TouchableOpacity
      activeOpacity={enableAnimation && isTruncated ? 0.8 : 1}
      onPress={handlePress}
      style={styles.touchable}
    >
      <Animated.View style={[styles.container, getContainerStyle()]}>
        <Animated.Text
          style={[styles.text, style, getTextStyle()]}
          numberOfLines={isExpanded ? undefined : numberOfLines}
          ellipsizeMode={isExpanded ? undefined : 'tail'}
          onTextLayout={handleTextLayout}
        >
          {text}
        </Animated.Text>
        {renderIndicator()}
      </Animated.View>
    </TouchableOpacity>
  );
};

// Example usage component demonstrating all animation types
export const AnimatedTextRevealExamples: React.FC = () => {
  return (
    <View style={styles.examplesContainer}>
      <Text style={styles.sectionTitle}>Text Reveal Animation Examples</Text>
      
      <View style={styles.exampleCard}>
        <Text style={styles.exampleTitle}>Slide Animation</Text>
        <AnimatedTextReveal
          text="THIS MONTH'S INCOME - Total earnings from all sources"
          animationType="slide"
          style={styles.exampleText}
        />
      </View>
      
      <View style={styles.exampleCard}>
        <Text style={styles.exampleTitle}>Expand Animation</Text>
        <AnimatedTextReveal
          text="THIS MONTH'S EXPENSES - All your spending categorized"
          animationType="expand"
          style={styles.exampleText}
        />
      </View>
      
      <View style={styles.exampleCard}>
        <Text style={styles.exampleTitle}>Fade & Slide Animation</Text>
        <AnimatedTextReveal
          text="BUDGET OVERVIEW - Track your financial goals and limits"
          animationType="fade-slide"
          style={styles.exampleText}
          indicatorType="dots"
        />
      </View>
      
      <View style={styles.exampleCard}>
        <Text style={styles.exampleTitle}>Height Expand Animation</Text>
        <AnimatedTextReveal
          text="SAVINGS PROGRESS - Monitor your savings goals and achievements"
          animationType="height-expand"
          style={styles.exampleText}
          indicatorType="plus"
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  touchable: {
    flex: 1,
  },
  container: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  text: {
    ...typography.body,
    color: colors.neutral[700],
    flex: 1,
  },
  indicator: {
    marginLeft: spacing.xs,
    paddingHorizontal: spacing.xs,
  },
  indicatorText: {
    color: colors.neutral[400],
    fontSize: 14,
    fontWeight: '600',
  },
  
  // Example styles
  examplesContainer: {
    padding: spacing.lg,
    backgroundColor: colors.neutral[50],
  },
  sectionTitle: {
    ...typography.heading4,
    color: colors.neutral[900],
    marginBottom: spacing.lg,
  },
  exampleCard: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  exampleTitle: {
    ...typography.caption,
    color: colors.primary[600],
    marginBottom: spacing.sm,
    textTransform: 'uppercase',
  },
  exampleText: {
    ...typography.body,
    color: colors.neutral[800],
  },
});

export default AnimatedTextReveal;
