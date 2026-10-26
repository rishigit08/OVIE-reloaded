import { useRouter } from 'expo-router';
import { Check, ChevronRight, MessageCircle, Minus, Plus } from 'lucide-react-native';
import { useRef, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import {
  Card,
  emptyToneCopy,
  ScreenTitle,
  StickyHeader,
  TAB_BAR_SPACE,
  TONE,
  toneCounts,
  ToneFilter,
  ToneFilterValue,
  TonePill,
} from '@/components/ui';
import { PolicyTile } from '@/components/PolicyTile';
import { COVERAGE_MAP } from '@/lib/data';
import { askMoe } from '@/lib/askMoe';
import { useStore } from '@/lib/store';
import { colors, fonts, radius, space, type } from '@/lib/theme';

// Bright glazes only, so dark text stays readable on every covered tile.
const GLAZE = [colors.sun, colors.teal, colors.pink, colors.tangerine, colors.leaf, colors.sky];

export default function Insights() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const policies = useStore((s) => s.policies);
  const [filter, setFilter] = useState<ToneFilterValue>('all');

  const own = policies.filter((p) => !p.sharedBy);
  // One section per policy, so a policy with several insights reads as a group.
  const order = 'gap warn good';
  const sections = own
    .map((p) => ({
      policy: p,
      data: p.insights
        .filter((i) => filter === 'all' || i.tone === filter)
        .sort((a, b) => order.indexOf(a.tone) - order.indexOf(b.tone)),
    }))
    .filter((s) => s.data.length > 0);

  const map = COVERAGE_MAP.map((line) => {
    const matches = own.filter((p) => line.types.includes(p.type));
    const live = matches.some((p) => p.status !== 'expired');
    return { ...line, state: live ? 'have' : matches.length ? 'lapsed' : 'missing' } as const;
  });
  const have = map.filter((m) => m.state === 'have').length;

  // Which policy the reader is in, so its name can ride along under the pinned
  // "What Moe noticed" bar. Section tops are measured as they lay out.
  const tops = useRef<Record<string, number>>({});
  const barHeight = useRef(0);
  const offset = useRef(0);
  const [current, setCurrent] = useState<string | null>(null);

  const sync = () => {
    const line = offset.current + barHeight.current;
    let id: string | null = sections[0]?.policy.id ?? null;
    for (const sec of sections) if ((tops.current[sec.policy.id] ?? Infinity) <= line) id = sec.policy.id;
    setCurrent((was) => (was === id ? was : id));
  };

  const shown = sections.find((sec) => sec.policy.id === current) ?? sections[0];

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <ScreenTitle title="Insights" />
      <ScrollView
        // The bar is the one pinned child. Android needs it to be a real,
        // un-flattened view with an opaque background (StickyHeader is).
        stickyHeaderIndices={[1]}
        onScroll={(e) => {
          offset.current = e.nativeEvent.contentOffset.y;
          sync();
        }}
        scrollEventThrottle={16}
        contentContainerStyle={{ paddingBottom: TAB_BAR_SPACE + insets.bottom }}
        showsVerticalScrollIndicator={false}
      >
        <View style={{ paddingHorizontal: space.xl, paddingBottom: space.lg }}>
          {/* What you have, what you don't */}
          <Card>
            <Text style={type.h2}>Your coverage mosaic</Text>
            <Text style={[type.body, { marginTop: 4 }]}>
              {have} of {map.length} common kinds of cover are in place.
            </Text>
            <View style={styles.grid}>
              {map.map((m, i) => {
                const on = m.state === 'have';
                const Icon = on ? Check : m.state === 'lapsed' ? Minus : Plus;
                return (
                  <View
                    key={m.key}
                    style={[
                      styles.tile,
                      on ? { backgroundColor: GLAZE[i % GLAZE.length] } : styles.tileOff,
                    ]}
                  >
                    <View style={[styles.tileIcon, !on && { backgroundColor: colors.surface }]}>
                      <Icon size={14} color={on ? colors.ink : colors.muted} strokeWidth={3} />
                    </View>
                    <Text style={[styles.tileLabel, !on && { color: colors.inkSoft }]}>{m.label}</Text>
                    <Text style={[styles.tileState, !on && { color: colors.muted }]}>
                      {on ? 'Covered' : m.state === 'lapsed' ? 'Expired' : 'Not found'}
                    </Text>
                  </View>
                );
              })}
            </View>
            <Pressable
              accessibilityRole="button"
              onPress={() => askMoe({ prompt: 'What am I missing?' })}
              style={styles.link}
            >
              <Text style={styles.linkText}>Ask Moe what’s missing</Text>
              <ChevronRight size={18} color={colors.plum} strokeWidth={2.4} />
            </Pressable>
          </Card>

        </View>

        <StickyHeader
          title="What Moe noticed"
          onLayout={(e) => {
            barHeight.current = e.nativeEvent.layout.height;
          }}
        >
          <ToneFilter value={filter} onChange={setFilter} counts={toneCounts(own.flatMap((p) => p.insights))} />
          {/* The policy these insights belong to, pinned under the filters. */}
          <View style={styles.policyRow}>
            {shown ? <PolicyTile type={shown.policy.type} size={24} /> : null}
            <Text style={[styles.policy, { flex: 1 }]} numberOfLines={1} accessibilityRole="header">
              {shown ? shown.policy.title : emptyToneCopy(filter)}
            </Text>
          </View>
        </StickyHeader>

        {sections.map((sec, i) => (
          <View
            key={sec.policy.id}
            onLayout={(e) => {
              tops.current[sec.policy.id] = e.nativeEvent.layout.y;
              sync();
            }}
            style={styles.section}
          >
            {/* The first policy's name is already showing in the bar. */}
            {i > 0 ? (
              <View style={[styles.policyRow, styles.policyInline]}>
                <PolicyTile type={sec.policy.type} size={24} />
                <Text style={[styles.policy, { flex: 1 }]} numberOfLines={1}>
                  {sec.policy.title}
                </Text>
              </View>
            ) : null}
            {sec.data.map((item) => (
              <Pressable
                key={item.id}
                accessibilityRole="button"
                onPress={() => router.push(`/policy/${sec.policy.id}`)}
                style={({ pressed }) => pressed && { opacity: 0.85 }}
              >
                <Card style={[styles.insight, { borderLeftColor: TONE[item.tone].ink }]}>
                  <View style={styles.insightTop}>
                    <TonePill tone={item.tone} />
                    <Pressable
                      accessibilityRole="button"
                      accessibilityLabel={`Ask Moe about: ${item.title}`}
                      hitSlop={10}
                      onPress={() => askMoe({ policyId: sec.policy.id, insightId: item.id })}
                      style={({ pressed }) => [styles.ask, pressed && { opacity: 0.7 }]}
                    >
                      <MessageCircle size={16} color={colors.plum} strokeWidth={2.4} />
                      <Text style={styles.askText}>Ask Moe</Text>
                    </Pressable>
                  </View>
                  <Text style={[type.h3, { marginTop: space.sm }]}>{item.title}</Text>
                  <Text style={[type.body, { marginTop: 4 }]}>{item.body}</Text>
                </Card>
              </Pressable>
            ))}
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  policyRow: { flexDirection: 'row', alignItems: 'center', gap: space.sm, marginTop: space.md },
  policy: { ...type.label, color: colors.ink },
  policyInline: { marginTop: space.sm, marginBottom: space.md },
  insightTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  ask: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radius.pill,
    backgroundColor: colors.plumSoft,
  },
  askText: { fontFamily: fonts.bold, fontSize: 12, lineHeight: 17, color: colors.plum },
  section: { paddingHorizontal: space.xl, paddingBottom: space.md },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: space.lg },
  tile: {
    width: '48.5%',
    flexGrow: 1,
    borderRadius: radius.md,
    padding: space.md,
    minHeight: 92,
  },
  tileOff: { backgroundColor: colors.bg, borderWidth: 1.5, borderColor: colors.line, borderStyle: 'dashed' },
  tileIcon: {
    width: 24,
    height: 24,
    borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  tileLabel: { fontFamily: fonts.bold, fontSize: 15, lineHeight: 22, color: colors.ink },
  tileState: { fontFamily: fonts.medium, fontSize: 12, lineHeight: 17, color: colors.ink, opacity: 0.75, marginTop: 2 },
  link: { flexDirection: 'row', alignItems: 'center', gap: 4, minHeight: 44, marginTop: space.sm },
  linkText: { fontFamily: fonts.bold, fontSize: 15, lineHeight: 22, color: colors.plum },
  insight: { marginBottom: space.md, borderLeftWidth: 5 },
});
