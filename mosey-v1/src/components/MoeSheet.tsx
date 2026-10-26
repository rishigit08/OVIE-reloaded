import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Animated,
  BackHandler,
  Keyboard,
  PanResponder,
  Platform,
  Pressable,
  StyleSheet,
  useWindowDimensions,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors, radius, shadowUp } from '@/lib/theme';

import { ChatBody } from './ChatPanel';

const GRABBER = 22;
/** Dragging down only closes the sheet from its top strip, so the messages can still scroll. */
const CLOSE_ZONE = 90;

type Props = {
  policyId: string;
  paused?: boolean;
  /** Reports how much of the screen the minimised sheet covers, so content can clear it. */
  onDockHeight?: (height: number) => void;
};

/**
 * Moe's chat as a sheet with two resting places. Minimised, only the composer
 * shows (Moe, the input, a few prompts). Drag it up and the same sheet opens
 * into the full conversation; the composer stays where your thumb left it.
 */
export function MoeSheet({ policyId, paused = false, onDockHeight }: Props) {
  const insets = useSafeAreaInsets();
  const { height: windowHeight } = useWindowDimensions();
  const [keyboard, setKeyboard] = useState(0);
  const [composer, setComposer] = useState(130);
  const [expanded, setExpanded] = useState(false);

  const top = insets.top + 30;
  const bottomPad = keyboard ? 8 : Math.max(insets.bottom, 12);
  const height = windowHeight - top - keyboard;
  const dock = GRABBER + composer + bottomPad;
  // How far the sheet is pushed down when minimised.
  const closed = Math.max(1, height - dock);

  const offset = useRef(new Animated.Value(closed)).current;
  const live = useRef({ closed, expanded, top, start: closed });
  live.current.closed = closed;
  live.current.top = top;

  const settle = (open: boolean) => {
    live.current.expanded = open;
    setExpanded(open);
    if (!open) Keyboard.dismiss();
    Animated.spring(offset, {
      toValue: open ? 0 : live.current.closed,
      damping: 28,
      stiffness: 280,
      mass: 1,
      useNativeDriver: true,
    }).start();
  };

  // The resting place moves when the keyboard or composer height changes.
  useEffect(() => {
    if (!live.current.expanded) {
      Animated.spring(offset, { toValue: closed, damping: 28, stiffness: 280, mass: 1, useNativeDriver: true }).start();
    }
  }, [closed, offset]);

  useEffect(() => {
    onDockHeight?.(GRABBER + composer + Math.max(insets.bottom, 12));
  }, [composer, insets.bottom, onDockHeight]);

  useEffect(() => {
    const ios = Platform.OS === 'ios';
    const show = Keyboard.addListener(ios ? 'keyboardWillShow' : 'keyboardDidShow', (e) => setKeyboard(e.endCoordinates.height));
    const hide = Keyboard.addListener(ios ? 'keyboardWillHide' : 'keyboardDidHide', () => setKeyboard(0));
    return () => {
      show.remove();
      hide.remove();
    };
  }, []);

  useEffect(() => {
    if (!expanded) return;
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      settle(false);
      return true;
    });
    return () => sub.remove();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [expanded]);

  const pan = useMemo(() => {
    const clamp = (v: number) => Math.max(0, Math.min(live.current.closed, v));
    return PanResponder.create({
      onMoveShouldSetPanResponderCapture: (_, g) => {
        if (Math.abs(g.dy) < 8 || Math.abs(g.dy) < Math.abs(g.dx) * 1.5) return false;
        if (!live.current.expanded) return g.dy < 0;
        return g.dy > 0 && g.y0 - live.current.top < CLOSE_ZONE;
      },
      onPanResponderGrant: () => {
        offset.stopAnimation();
        live.current.start = live.current.expanded ? 0 : live.current.closed;
      },
      // The sheet tracks the finger the whole way; nothing is "launched".
      onPanResponderMove: (_, g) => offset.setValue(clamp(live.current.start + g.dy)),
      onPanResponderRelease: (_, g) => {
        const at = clamp(live.current.start + g.dy);
        const flung = Math.abs(g.vy) > 0.35;
        settle(flung ? g.vy < 0 : at < live.current.closed / 2);
      },
      onPanResponderTerminate: () => settle(live.current.expanded),
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [offset]);

  const reveal = offset.interpolate({ inputRange: [0, closed * 0.65, closed], outputRange: [1, 0, 0] });
  const dim = offset.interpolate({ inputRange: [0, closed], outputRange: [1, 0] });

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="box-none">
      <Animated.View style={[StyleSheet.absoluteFill, styles.backdrop, { opacity: dim }]} pointerEvents={expanded ? 'auto' : 'none'}>
        <Pressable style={{ flex: 1 }} onPress={() => settle(false)} accessibilityRole="button" accessibilityLabel="Minimise chat" />
      </Animated.View>

      <Animated.View
        {...pan.panHandlers}
        style={[styles.sheet, { bottom: keyboard, height, paddingBottom: bottomPad, transform: [{ translateY: offset }] }]}
      >
        <View style={styles.grabberZone}>
          <View style={styles.grabber} />
        </View>
        <ChatBody
          paused={paused}
          onClose={expanded ? () => settle(false) : undefined}
          sheet={{
            policyId,
            expanded,
            bodyStyle: { opacity: reveal },
            // Cancel the sheet's own movement so the composer never leaves the bottom of the screen.
            composerStyle: { transform: [{ translateY: Animated.multiply(offset, -1) }] },
            onComposerLayout: setComposer,
            onExpand: () => settle(true),
          }}
        />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  backdrop: { backgroundColor: 'rgba(27,27,58,0.4)' },
  sheet: {
    position: 'absolute',
    left: 0,
    right: 0,
    backgroundColor: colors.surface,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    ...shadowUp,
  },
  grabberZone: { height: GRABBER, alignItems: 'center', justifyContent: 'center' },
  grabber: { width: 40, height: 5, borderRadius: 3, backgroundColor: colors.line },
});
