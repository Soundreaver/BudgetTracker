import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { MotiView } from 'moti';
import Animated, {
  useAnimatedStyle,
  withSpring,
  useSharedValue,
  interpolate,
} from 'react-native-reanimated';
import { colors, spacing, borderRadius, typography, shadows } from '@/constants/theme';
import { triggerHaptic } from '@/utils/haptics';

interface StatCardProps {
  title: string;
  value: string | number;
  icon?: React.ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'error';
  subtitle?: string;
  delay?: number;
  enableTextReveal?: boolean;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  icon,
  trend,
  variant = 'default',
  subtitle,
  delay = 0,
  enableTextReveal = true,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  // Simple heuristic: titles 12+ chars are likely truncated in the small card
  const [isTruncated, setIsTruncated] = useState(title.length >= 12);
  const expandHeight = useSharedValue(0);
  const scaleAnim = useSharedValue(1);

  const getVariantColor = () => {
    switch (variant) {
      case 'primary':
        return colors.primary[500];
      case 'success':
        return colors.success[500];
      case 'warning':
        return colors.warning[500];
      case 'error':
        return colors.error[500];
      default:
        return colors.neutral[700];
    }
  };

  const variantColor = getVariantColor();

  const handlePressIn = () => {
    if (enableTextReveal && isTruncated) {
      scaleAnim.value = withSpring(0.98, {
        damping: 15,
        stiffness: 400,
      });
    }
  };

  const handlePressOut = () => {
    if (enableTextReveal && isTruncated) {
      scaleAnim.value = withSpring(1, {
        damping: 15,
        stiffness: 400,
      });
    }
  };

  const handlePress = async () => {
    if (!enableTextReveal || !isTruncated) return;
    
    await triggerHaptic('light');
    setIsExpanded(!isExpanded);
    
    // Animate the expansion with spring for natural feel
    expandHeight.value = withSpring(isExpanded ? 0 : 1, {
      damping: 20,
      stiffness: 200,
      mass: 0.5,
    });
  };

  const handleTextLayout = (event: any) => {
    // Detect if text is actually truncated by checking line count
    const { lines } = event.nativeEvent;
    
    if (lines && lines.length > 0) {
      const allText = lines.map((l: any) => l.text).join('');
      const displayedText = allText.replace(/\.\.\.$/,  '').trim();
      const fullTitle = title.toUpperCase().trim();
      
      // If displayed text is shorter than full title, it's truncated
      if (displayedText.length < fullTitle.length) {
        setIsTruncated(true);
      }
    }
  };

  const containerAnimStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scaleAnim.value }],
    };
  });

  const titleContainerStyle = useAnimatedStyle(() => {
    // Smoothly expand height when tapped
    const height = interpolate(
      expandHeight.value,
      [0, 1],
      [18, 40] // From single line to expanded
    );
    
    return {
      height,
      overflow: 'hidden',
    };
  });

  return (
    <MotiView
      from={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: 'timing', duration: 300, delay }}
      style={styles.wrapper}
    >
      <Animated.View style={containerAnimStyle}>
        <Pressable
          onPress={handlePress}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          style={({ pressed }) => [
            styles.container,
            shadows.md,
            pressed && enableTextReveal && isTruncated && styles.containerPressed,
          ]}
        >
          <View style={styles.header}>
            <Animated.View style={[styles.titleContainer, titleContainerStyle]}>
              <Text
                style={styles.title}
                numberOfLines={isExpanded ? undefined : 1}
                ellipsizeMode={isExpanded ? undefined : 'tail'}
                onTextLayout={handleTextLayout}
              >
                {title}
              </Text>
            </Animated.View>
            
            {icon && <View style={styles.icon}>{icon}</View>}
          </View>
          
          <MotiView
            from={{ opacity: 0, translateY: 10 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ type: 'timing', duration: 300, delay: delay + 100 }}
            pointerEvents="none"
          >
            <Text style={[styles.value, { color: variantColor }]} numberOfLines={1}>
              {typeof value === 'number' ? value.toLocaleString() : value}
            </Text>
          </MotiView>

          {(trend || subtitle) && (
            <View style={styles.footer} pointerEvents="none">
              {trend && (
                <View
                  style={[
                    styles.trend,
                    { backgroundColor: trend.isPositive ? colors.success[50] : colors.error[50] },
                  ]}
                >
                  <Text
                    style={[
                      styles.trendText,
                      { color: trend.isPositive ? colors.success[700] : colors.error[700] },
                    ]}
                  >
                    {trend.isPositive ? '↑' : '↓'} {Math.abs(trend.value).toFixed(1)}%
                  </Text>
                </View>
              )}
              {subtitle && <Text style={styles.subtitle} numberOfLines={1}>{subtitle}</Text>}
            </View>
          )}
        </Pressable>
      </Animated.View>
    </MotiView>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
  },
  container: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    minHeight: 110,
    justifyContent: 'space-between',
  },
  containerPressed: {
    opacity: 0.9,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.sm,
  },
  titleContainer: {
    flex: 1,
    marginRight: spacing.xs,
  },
  title: {
    ...typography.caption,
    color: colors.neutral[600],
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  icon: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: spacing.xs,
  },
  value: {
    ...typography.heading3,
    marginBottom: spacing.sm,
    fontWeight: '700',
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    flexWrap: 'wrap',
  },
  trend: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
  },
  trendText: {
    ...typography.small,
    fontWeight: '600',
  },
  subtitle: {
    ...typography.small,
    color: colors.neutral[500],
    flex: 1,
  },
});
