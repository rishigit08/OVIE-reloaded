import { useIsFocused, useRouter } from 'expo-router';
import {
  Building2,
  Car,
  ChevronLeft,
  HardHat,
  Heart,
  KeyRound,
  LucideIcon,
  Package,
  Scale,
  Store,
  Truck,
  Umbrella,
  Warehouse,
  X,
} from 'lucide-react-native';
import { ReactNode, useEffect, useRef } from 'react';
import { Animated, LayoutChangeEvent, Platform, Pressable, ScrollView, StyleProp, StyleSheet, Text, View, ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Policy, PolicyType, statusLabel, Tone } from '@/lib/data';
import { colors, fonts, HIT, mosaic, radius, shadow, space, type } from '@/lib/theme';

/** Height reserved at the bottom of tab screens for the floating tab bar. */
export const TAB_BAR_SPACE = 110;

/** Height of the tab bar itself above the bottom safe area, for content that must sit clear of it. */
export const TAB_BAR_CLEARANCE = Platform.select({ ios: 50, android: 0, default: 84 })!;

/**
 * Go back, or to `fallback` when this screen is the first one in history
 * (opened from a link, or after a reload on web).
 */
export function useGoBack(fallback = '/') {
  const router = useRouter();
  return () => (router.canGoBack() ? router.back() : router.replace(fallback));
}

/** Whether this screen is the one on top; used to pause 3D rendering when it isn't. */
export function useFocused() {
  return useIsFocused();
}

export function Card({ children, style }: { children: ReactNode; style?: StyleProp<ViewStyle> }) {
  return <View style={[styles.card, style]}>{children}</View>;
}

/** `beside` sits right after the title; `right` is pushed to the far edge. */
export function ScreenTitle({ title, beside, right }: { title: string; beside?: ReactNode; right?: ReactNode }) {
  const insets = useSafeAreaInsets();
  return (
    <View style={[styles.titleRow, { paddingTop: insets.top + space.md }]}>
      <View style={styles.titleLeft}>
        <Text style={type.h1} accessibilityRole="header">
          {title}
        </Text>
        {beside}
      </View>
      {right}
    </View>
  );
}

export function BackHeader({ title, onBack, right }: { title?: string; onBack: () => void; right?: ReactNode }) {
  const insets = useSafeAreaInsets();
  return (
    <View style={[styles.backHeader, { paddingTop: insets.top + 4 }]}>
      <IconButton icon={ChevronLeft} label="Back" onPress={onBack} />
      <Text style={[type.h3, { flex: 1, textAlign: 'center' }]} numberOfLines={1}>
        {title}
      </Text>
      <View style={{ minWidth: HIT, alignItems: 'flex-end' }}>{right}</View>
    </View>
  );
}

export function IconButton({
  icon: Icon,
  label,
  onPress,
  tint = colors.ink,
  filled = false,
  size = 22,
}: {
  icon: LucideIcon;
  label: string;
  onPress: () => void;
  tint?: string;
  filled?: boolean;
  size?: number;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      hitSlop={4}
      style={({ pressed }) => [styles.iconButton, filled && styles.iconButtonFilled, pressed && { opacity: 0.6 }]}
    >
      <Icon size={size} color={tint} strokeWidth={2.2} />
    </Pressable>
  );
}

/**
 * Sheets close by swiping down, so on a phone they carry no close button.
 * The web build has no swipe, so it keeps one there.
 */
export function SheetClose({ onPress }: { onPress: () => void }) {
  if (Platform.OS !== 'web') return null;
  return <IconButton icon={X} label="Close" onPress={onPress} />;
}

export function Chip({
  label,
  onPress,
  active = false,
  icon: Icon,
  count,
}: {
  label: string;
  count?: number;
  onPress?: () => void;
  active?: boolean;
  icon?: LucideIcon;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected: active }}
      onPress={onPress}
      style={({ pressed }) => [styles.chip, active && styles.chipActive, pressed && { opacity: 0.7 }]}
    >
      {Icon ? <Icon size={15} color={active ? '#fff' : colors.plum} strokeWidth={2.2} /> : null}
      <Text style={[styles.chipText, active && { color: '#fff' }]} numberOfLines={1}>
        {label}
      </Text>
      {count !== undefined ? (
        <Text
          style={[styles.chipCount, active && { color: '#fff', opacity: 0.8 }]}
          accessibilityLabel={`${count} ${count === 1 ? 'insight' : 'insights'}`}
        >
          {count}
        </Text>
      ) : null}
    </Pressable>
  );
}

export function Segmented<T extends string>({
  options,
  value,
  onChange,
}: {
  options: { value: T; label: string; count?: number }[];
  value: T;
  onChange: (v: T) => void;
}) {
  return (
    <View style={styles.segmented} accessibilityRole="tablist">
      {options.map((o) => {
        const on = o.value === value;
        return (
          <Pressable
            key={o.value}
            accessibilityRole="tab"
            accessibilityState={{ selected: on }}
            onPress={() => onChange(o.value)}
            style={[styles.segment, on && styles.segmentOn]}
          >
            <Text style={[styles.segmentText, on && { color: colors.ink }]} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.85}>
              {o.label}
            </Text>
            {o.count !== undefined ? (
              <View style={[styles.count, on && { backgroundColor: colors.plumSoft }]}>
                <Text style={[styles.countText, on && { color: colors.plum }]}>{o.count}</Text>
              </View>
            ) : null}
          </Pressable>
        );
      })}
    </View>
  );
}

const TYPE_ICON: Record<PolicyType, { icon: LucideIcon; color: string }> = {
  personalAuto: { icon: Car, color: colors.sky },
  commercialAuto: { icon: Truck, color: colors.sky },
  renters: { icon: KeyRound, color: colors.tangerine },
  condo: { icon: Building2, color: colors.teal },
  personalUmbrella: { icon: Umbrella, color: colors.plum },
  commercialUmbrella: { icon: Umbrella, color: colors.plum },
  generalLiability: { icon: Scale, color: colors.pink },
  commercialProperty: { icon: Warehouse, color: colors.teal },
  bop: { icon: Store, color: colors.tangerine },
  workersComp: { icon: HardHat, color: colors.sun },
  commercialPackage: { icon: Package, color: colors.leaf },
  termLife: { icon: Heart, color: colors.pink },
};

/** A single glazed "tile" holding the icon for a line of cover. */
export function TypeTile({ type: t, size = 48, dim = false }: { type: PolicyType; size?: number; dim?: boolean }) {
  const { icon: Icon, color } = TYPE_ICON[t];
  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size * 0.3,
        backgroundColor: dim ? colors.sunken : color,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Icon size={size * 0.48} color={dim ? colors.muted : '#fff'} strokeWidth={2.2} />
    </View>
  );
}

export function StatusPill({ policy }: { policy: Policy }) {
  const tone: Tone = policy.status === 'active' ? 'good' : policy.status === 'expired' ? 'gap' : 'warn';
  return <TonePill tone={tone} label={statusLabel(policy)} />;
}

export const TONE: Record<Tone, { bg: string; ink: string; label: string }> = {
  good: { bg: colors.goodBg, ink: colors.goodInk, label: 'Good news' },
  warn: { bg: colors.warnBg, ink: colors.warnInk, label: 'Heads-up' },
  gap: { bg: colors.gapBg, ink: colors.gapInk, label: 'Gap' },
};

export function TonePill({ tone, label }: { tone: Tone; label?: string }) {
  const t = TONE[tone];
  return (
    <View style={[styles.pill, { backgroundColor: t.bg }]}>
      <Text style={[styles.pillText, { color: t.ink }]}>{label ?? t.label}</Text>
    </View>
  );
}

/** A row of little tiles. `filled` (0..1) colors them in left to right. */
export function MosaicStrip({
  count = 14,
  filled = 1,
  size = 10,
  gap = 4,
  style,
}: {
  count?: number;
  filled?: number;
  size?: number;
  gap?: number;
  style?: StyleProp<ViewStyle>;
}) {
  const lit = Math.round(filled * count);
  return (
    <View style={[{ flexDirection: 'row', gap }, style]}>
      {Array.from({ length: count }, (_, i) => (
        <View
          key={i}
          style={{
            flex: 1,
            height: size,
            borderRadius: size * 0.3,
            backgroundColor: i < lit ? mosaic[(i * 3) % mosaic.length] : colors.sunken,
          }}
        />
      ))}
    </View>
  );
}

/** Pulsing placeholder block for content that's still loading. */
export function Skeleton({ width, height = 12, style }: { width: number | `${number}%`; height?: number; style?: StyleProp<ViewStyle> }) {
  const pulse = useRef(new Animated.Value(0.45)).current;
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1, duration: 700, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 0.45, duration: 700, useNativeDriver: true }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [pulse]);
  return (
    <Animated.View
      style={[{ width, height, borderRadius: height / 2, backgroundColor: colors.sunken, opacity: pulse }, style]}
    />
  );
}

export type ToneFilterValue = 'all' | Tone;
const TONE_FILTERS: { value: ToneFilterValue; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'gap', label: 'Gaps' },
  { value: 'warn', label: 'Heads-up' },
  { value: 'good', label: 'Good news' },
];

/** What to say when a filter leaves a list of insights empty. */
export function emptyToneCopy(value: ToneFilterValue): string {
  const what = { all: 'nothing to flag', gap: 'no gaps', warn: 'no heads-ups', good: 'no good news' }[value];
  return `Moe found ${what}. Always check for yourself.`;
}

/** The All / Gaps / Heads-up / Good news bubbles, shared by every list of insights. */
/** How many insights fall under each bubble. */
export function toneCounts(insights: { tone: Tone }[]): Record<ToneFilterValue, number> {
  const of = (t: Tone) => insights.filter((i) => i.tone === t).length;
  return { all: insights.length, gap: of('gap'), warn: of('warn'), good: of('good') };
}

export function ToneFilter({
  value,
  onChange,
  counts,
}: {
  value: ToneFilterValue;
  onChange: (v: ToneFilterValue) => void;
  /** Totals shown beside each label, e.g. "Gaps 3". */
  counts?: Record<ToneFilterValue, number>;
}) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{ gap: space.sm, paddingHorizontal: space.xl }}
      style={styles.toneFilter}
    >
      {TONE_FILTERS.map((f) => (
        <Chip
          key={f.value}
          label={f.label}
          count={counts?.[f.value]}
          active={value === f.value}
          onPress={() => onChange(f.value)}
        />
      ))}
    </ScrollView>
  );
}

/**
 * A plain-text section header that stays pinned while its section scrolls.
 * It is full width with an opaque background so content slides underneath it
 * cleanly; `collapsable={false}` keeps Android from flattening the view away,
 * which would stop it sticking. Pass it to a list as a section header, or
 * list its index in a ScrollView's `stickyHeaderIndices`.
 */
export function StickyHeader({
  title,
  children,
  onLayout,
}: {
  title: string;
  children?: ReactNode;
  onLayout?: (e: LayoutChangeEvent) => void;
}) {
  return (
    <View collapsable={false} style={styles.sticky} onLayout={onLayout}>
      <Text style={type.label} accessibilityRole="header">
        {title}
      </Text>
      {children}
    </View>
  );
}

export function SectionLabel({ children, style }: { children: string; style?: StyleProp<ViewStyle> }) {
  return (
    <View style={[{ marginTop: space.xxl, marginBottom: space.md }, style]}>
      <Text style={type.label}>{children}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  toneFilter: { flexGrow: 0, marginHorizontal: -space.xl, marginTop: space.sm },
  sticky: { backgroundColor: colors.bg, paddingHorizontal: space.xl, paddingTop: space.sm, paddingBottom: space.sm },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: space.lg,
    ...shadow,
  },
  titleLeft: { flexDirection: 'row', alignItems: 'center', gap: space.md },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: space.xl,
    paddingBottom: space.md,
    minHeight: HIT,
  },
  backHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: space.sm,
    paddingBottom: 4,
    gap: space.sm,
  },
  iconButton: {
    width: HIT,
    height: HIT,
    borderRadius: HIT / 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconButtonFilled: { backgroundColor: colors.surface, ...shadow },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    minHeight: HIT,
    paddingHorizontal: 14,
    borderRadius: radius.pill,
    backgroundColor: colors.plumSoft,
  },
  chipActive: { backgroundColor: colors.plum },
  chipCount: { fontFamily: fonts.semi, fontSize: 13, lineHeight: 19, color: colors.plum, opacity: 0.6 },
  chipText: { fontFamily: fonts.semi, fontSize: 14, lineHeight: 20, color: colors.plum },
  segmented: {
    flexDirection: 'row',
    backgroundColor: colors.sunken,
    borderRadius: radius.pill,
    padding: 4,
  },
  segment: {
    flex: 1,
    minHeight: HIT,
    borderRadius: radius.pill,
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  segmentOn: { backgroundColor: colors.surface, ...shadow },
  segmentText: { fontFamily: fonts.semi, fontSize: 15, lineHeight: 22, color: colors.muted },
  count: {
    minWidth: 22,
    height: 22,
    paddingHorizontal: 6,
    borderRadius: 11,
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
  },
  countText: { fontFamily: fonts.bold, fontSize: 12, lineHeight: 17, color: colors.muted },
  pill: { alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 4, borderRadius: radius.pill },
  pillText: { fontFamily: fonts.bold, fontSize: 12, lineHeight: 17, letterSpacing: 0.2 },
});
