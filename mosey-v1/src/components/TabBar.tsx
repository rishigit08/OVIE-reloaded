import { Columns2, Folder, House, LucideIcon, Sparkles } from 'lucide-react-native';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useStore } from '@/lib/store';
import { colors, fonts, HIT, radius, shadowBar } from '@/lib/theme';

import { Moe } from './Moe';

// The web stand-in for the native tab bar (see app/(tabs)/_layout.tsx): four
// tabs in a pill, with Moe in his own circle at the trailing edge.

const ICONS: Record<string, LucideIcon> = {
  index: House,
  files: Folder,
  insights: Sparkles,
  compare: Columns2,
};

type Route = { key: string; name: string };

type TabBarProps = {
  state: { index: number; routes: Route[] };
  descriptors: Record<string, { options: { title?: string } }>;
  navigation: { navigate: (name: string) => void; emit: (e: any) => any };
};

export function TabBar({ state, descriptors, navigation }: TabBarProps) {
  const insets = useSafeAreaInsets();
  const working = useStore((s) => s.uploads.filter((u) => u.status === 'working').length);
  const unseen = useStore((s) => s.unseenFiles);
  const filesBadge = working + unseen;

  const press = (route: Route, active: boolean) => {
    const event = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
    if (!active && !event.defaultPrevented) navigation.navigate(route.name);
  };

  const moe = state.routes.find((r) => r.name === 'moe');
  const moeActive = !!moe && state.routes[state.index]?.key === moe.key;

  return (
    <View pointerEvents="box-none" style={[styles.wrap, { paddingBottom: Math.max(insets.bottom, 12) }]}>
      <View style={styles.bar}>
        {state.routes.map((route, index) => {
          if (route.name === 'moe') return null;
          const active = state.index === index;
          const Icon = ICONS[route.name] ?? House;
          const title = descriptors[route.key]?.options.title ?? route.name;
          const badge = route.name === 'files' ? filesBadge : 0;
          return (
            <Pressable
              key={route.key}
              accessibilityRole="tab"
              accessibilityState={{ selected: active }}
              accessibilityLabel={badge ? `${title}, ${badge} new` : title}
              onPress={() => press(route, active)}
              style={styles.tab}
            >
              <View style={[styles.tabInner, active && styles.tabActive]}>
                <View>
                  <Icon size={22} color={active ? colors.plum : colors.inkSoft} strokeWidth={active ? 2.4 : 2} />
                  {badge ? (
                    <View style={styles.badge}>
                      <Text style={styles.badgeText}>{badge}</Text>
                    </View>
                  ) : null}
                </View>
                <Text style={[styles.tabLabel, active && { color: colors.plum, fontFamily: fonts.bold }]}>{title}</Text>
              </View>
            </Pressable>
          );
        })}
      </View>

      {moe ? (
        <Pressable
          accessibilityRole="tab"
          accessibilityState={{ selected: moeActive }}
          accessibilityLabel="Moe"
          onPress={() => press(moe, moeActive)}
          style={[styles.moe, moeActive && { backgroundColor: colors.plumSoft }]}
        >
          <Moe size={50} />
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  bar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.pill,
    paddingHorizontal: 6,
    height: 68,
    ...shadowBar,
  },
  tab: { flex: 1, height: 68, alignItems: 'center', justifyContent: 'center' },
  tabInner: {
    minWidth: 60,
    minHeight: HIT + 8,
    paddingHorizontal: 6,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
  },
  tabActive: { backgroundColor: colors.plumSoft },
  tabLabel: { fontFamily: fonts.medium, fontSize: 11, lineHeight: 16, color: colors.inkSoft },
  badge: {
    position: 'absolute',
    top: -6,
    right: -10,
    minWidth: 18,
    height: 18,
    paddingHorizontal: 4,
    borderRadius: 9,
    backgroundColor: colors.gapInk,
    borderWidth: 2,
    borderColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: { fontFamily: fonts.bold, fontSize: 10, color: '#fff', lineHeight: 12 },
  moe: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadowBar,
  },
});
