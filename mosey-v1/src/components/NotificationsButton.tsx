import { useRouter } from 'expo-router';
import { Bell, Upload } from 'lucide-react-native';
import { useEffect, useRef } from 'react';
import { Animated, Easing, Platform, Pressable, StyleSheet, Text } from 'react-native';
import Svg, { Circle } from 'react-native-svg';

import { useStore } from '@/lib/store';
import { colors, fonts, shadow } from '@/lib/theme';

const SIZE = 48;
const STROKE = 3;
const R = (SIZE - STROKE) / 2;
const LENGTH = 2 * Math.PI * R;
/** The bright stretch that travels round the edge while something uploads. */
const PULSE = LENGTH * 0.18;

// The web build has no native animation driver.
const native = Platform.OS !== 'web';

/**
 * The bell on Home. While an upload is running it becomes an upload icon with
 * progress drawn round the button's edge and a pulse circling it; when the
 * upload finishes the bell fades back in as the ring and icon fade away.
 */
export function NotificationsButton() {
  const router = useRouter();
  const uploads = useStore((s) => s.uploads);
  const unseen = useStore((s) => s.unseenNotifications);
  const working = uploads.filter((u) => u.status === 'working');
  const active = working.length > 0;
  const progress = active ? working.reduce((sum, u) => sum + u.progress, 0) / working.length : 1;

  const mix = useRef(new Animated.Value(active ? 1 : 0)).current; // 0 = bell, 1 = uploading
  const spin = useRef(new Animated.Value(0)).current;
  const bob = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(mix, { toValue: active ? 1 : 0, duration: 450, easing: Easing.out(Easing.quad), useNativeDriver: native }).start();
    if (!active) return;
    const turning = Animated.loop(Animated.timing(spin, { toValue: 1, duration: 1400, easing: Easing.linear, useNativeDriver: native }));
    const bobbing = Animated.loop(
      Animated.sequence([
        Animated.timing(bob, { toValue: 1, duration: 520, easing: Easing.inOut(Easing.quad), useNativeDriver: native }),
        Animated.timing(bob, { toValue: 0, duration: 520, easing: Easing.inOut(Easing.quad), useNativeDriver: native }),
      ]),
    );
    turning.start();
    bobbing.start();
    return () => {
      turning.stop();
      bobbing.stop();
    };
  }, [active, mix, spin, bob]);

  const percent = Math.round(progress * 100);

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={
        active ? `Notifications. Uploading, ${percent} percent.` : unseen ? `Notifications, ${unseen} new` : 'Notifications'
      }
      onPress={() => router.push('/notifications')}
      style={({ pressed }) => [styles.button, pressed && { opacity: 0.8 }]}
    >
      {/* Progress so far, drawn from the top of the button round its edge. */}
      <Animated.View style={[StyleSheet.absoluteFill, { opacity: mix }]} pointerEvents="none">
        <Svg width={SIZE} height={SIZE} style={{ transform: [{ rotate: '-90deg' }] }}>
          <Circle cx={SIZE / 2} cy={SIZE / 2} r={R} stroke={colors.plumSoft} strokeWidth={STROKE} fill="none" />
          <Circle
            cx={SIZE / 2}
            cy={SIZE / 2}
            r={R}
            stroke={colors.plum}
            strokeWidth={STROKE}
            strokeLinecap="round"
            strokeDasharray={`${LENGTH * progress} ${LENGTH}`}
            fill="none"
          />
        </Svg>
      </Animated.View>

      {/* The pulse that keeps circling, so it reads as working even when progress is slow. */}
      <Animated.View
        pointerEvents="none"
        style={[
          StyleSheet.absoluteFill,
          { opacity: mix, transform: [{ rotate: spin.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] }) }] },
        ]}
      >
        <Svg width={SIZE} height={SIZE}>
          <Circle
            cx={SIZE / 2}
            cy={SIZE / 2}
            r={R}
            stroke={colors.tangerine}
            strokeWidth={STROKE}
            strokeLinecap="round"
            strokeDasharray={`${PULSE} ${LENGTH}`}
            fill="none"
          />
        </Svg>
      </Animated.View>

      <Animated.View style={[styles.icon, { opacity: mix.interpolate({ inputRange: [0, 1], outputRange: [1, 0] }) }]}>
        <Bell size={22} color={colors.plum} strokeWidth={2.2} />
      </Animated.View>
      <Animated.View
        style={[
          styles.icon,
          { opacity: mix, transform: [{ translateY: bob.interpolate({ inputRange: [0, 1], outputRange: [2, -2] }) }] },
        ]}
      >
        <Upload size={20} color={colors.plum} strokeWidth={2.4} />
      </Animated.View>

      {/* Something new to look at. Waits for the upload ring to clear, then fades in with the bell. */}
      {unseen > 0 ? (
        <Animated.View
          pointerEvents="none"
          style={[styles.badge, { opacity: mix.interpolate({ inputRange: [0, 1], outputRange: [1, 0] }) }]}
        >
          <Text style={styles.badgeText}>{unseen > 9 ? '9+' : unseen}</Text>
        </Animated.View>
      ) : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    width: SIZE,
    height: SIZE,
    borderRadius: SIZE / 2,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadow,
  },
  badge: {
    position: 'absolute',
    top: -2,
    right: -2,
    minWidth: 18,
    height: 18,
    paddingHorizontal: 4,
    borderRadius: 9,
    backgroundColor: colors.gapInk,
    borderWidth: 2,
    borderColor: colors.bg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: { fontFamily: fonts.bold, fontSize: 10, lineHeight: 12, color: '#fff' },
  icon: { position: 'absolute', top: 0, right: 0, bottom: 0, left: 0, alignItems: 'center', justifyContent: 'center' },
});
