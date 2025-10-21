// utils/animations.ts
import { Animated, Easing } from "react-native";

export class ChildFriendlyAnimations {
  // Bouncy entrance animation for cards
  static bounceIn(animatedValue: Animated.Value, duration: number = 800) {
    return Animated.timing(animatedValue, {
      toValue: 1,
      duration,
      easing: Easing.bezier(0.68, -0.55, 0.265, 1.55), // Bounce effect
      useNativeDriver: true,
    });
  }

  // Gentle floating animation
  static float(animatedValue: Animated.Value, duration: number = 2000) {
    return Animated.loop(
      Animated.sequence([
        Animated.timing(animatedValue, {
          toValue: 1,
          duration: duration / 2,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(animatedValue, {
          toValue: 0,
          duration: duration / 2,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ])
    );
  }

  // Scale pulse animation for interactive elements
  static pulse(animatedValue: Animated.Value, duration: number = 1000) {
    return Animated.loop(
      Animated.sequence([
        Animated.timing(animatedValue, {
          toValue: 1.05,
          duration: duration / 2,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(animatedValue, {
          toValue: 1,
          duration: duration / 2,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    );
  }

  // Wiggle animation for fun interactions
  static wiggle(animatedValue: Animated.Value, intensity: number = 10) {
    return Animated.sequence([
      Animated.timing(animatedValue, {
        toValue: intensity,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(animatedValue, {
        toValue: -intensity,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(animatedValue, {
        toValue: intensity,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(animatedValue, {
        toValue: 0,
        duration: 100,
        useNativeDriver: true,
      }),
    ]);
  }

  // Sparkle effect animation
  static sparkle(animatedValue: Animated.Value) {
    return Animated.loop(
      Animated.sequence([
        Animated.timing(animatedValue, {
          toValue: 1,
          duration: 600,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(animatedValue, {
          toValue: 0,
          duration: 600,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    );
  }

  // Staggered entrance animation for multiple elements
  static staggeredEntrance(
    animatedValues: Animated.Value[],
    delay: number = 150,
    duration: number = 500
  ) {
    const animations = animatedValues.map((value, index) =>
      Animated.timing(value, {
        toValue: 1,
        duration,
        delay: index * delay,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      })
    );

    return Animated.parallel(animations);
  }

  // Success celebration animation
  static celebrate(scaleValue: Animated.Value, rotateValue: Animated.Value) {
    return Animated.parallel([
      Animated.sequence([
        Animated.timing(scaleValue, {
          toValue: 1.2,
          duration: 200,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.spring(scaleValue, {
          toValue: 1,
          tension: 300,
          friction: 10,
          useNativeDriver: true,
        }),
      ]),
      Animated.timing(rotateValue, {
        toValue: 1,
        duration: 800,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]);
  }
}

export default ChildFriendlyAnimations;
