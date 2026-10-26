import { ChevronRight, Layers } from 'lucide-react-native';
import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Animated,
  Image,
  LayoutAnimation,
  PanResponder,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { TILE_TINT } from '@/components/policyModels';
import { PolicyTile } from '@/components/PolicyTile';
import { Card, ScreenTitle, SectionLabel, TAB_BAR_CLEARANCE } from '@/components/ui';
import { askMoe } from '@/lib/askMoe';
import { money, Policy, shortDate, statusLabel, Tone } from '@/lib/data';
import { useStore } from '@/lib/store';
import { colors, fonts, HIT, radius, shadowUp, space, type } from '@/lib/theme';

type Line = { key: string; label: string; a?: Policy['coverages'][number]; b?: Policy['coverages'][number] };
type Slot = 0 | 1;
const SLOT = ['A', 'B'] as const;

/** More unpicked policies than this and they stack up like a deck of cards. */
const LOOSE = 2;
const TILE_HEIGHT = 108;

function takeaway(a: Policy, b: Policy, shared: number): string {
  const cheaper = a.premium <= b.premium ? a : b;
  const pricier = cheaper === a ? b : a;
  const diff = pricier.premium - cheaper.premium;
  const overlap = shared
    ? `They overlap on ${shared} ${shared === 1 ? 'kind' : 'kinds'} of cover, so the limits are a fair side by side.`
    : 'They cover different things, so they sit next to each other rather than competing.';
  return `${cheaper.title} costs ${money(diff)} less per year than ${pricier.title}. ${overlap}`;
}

function insightsFor(a: Policy, b: Policy, lines: Line[]): { tone: Tone; text: string }[] {
  const out: { tone: Tone; text: string }[] = [];
  const list = (items: Line[]) => items.map((l) => l.label.toLowerCase()).join(', ');

  const shared = lines.filter((l) => l.a && l.b && l.a.limit !== null && l.b.limit !== null);
  const aHigher = shared.filter((l) => l.a!.limit! > l.b!.limit!).length;
  const bHigher = shared.filter((l) => l.b!.limit! > l.a!.limit!).length;
  if (shared.length && aHigher !== bHigher) {
    const lead = aHigher > bHigher ? a : b;
    out.push({ tone: 'good', text: `${lead.title} has the higher limit on ${Math.max(aHigher, bHigher)} of ${shared.length} shared lines.` });
  }
  if (a.deductible !== null && b.deductible !== null && a.deductible !== b.deductible) {
    const low = a.deductible < b.deductible ? a : b;
    const high = low === a ? b : a;
    out.push({ tone: 'good', text: `${low.title} has the lower deductible: ${money(low.deductible)} against ${money(high.deductible)}.` });
  }
  const onlyA = lines.filter((l) => l.a && !l.b);
  const onlyB = lines.filter((l) => l.b && !l.a);
  if (onlyA.length) out.push({ tone: 'warn', text: `Only ${a.title} includes ${list(onlyA)}.` });
  if (onlyB.length) out.push({ tone: 'warn', text: `Only ${b.title} includes ${list(onlyB)}.` });
  for (const p of [a, b]) {
    if (p.status === 'expired') out.push({ tone: 'gap', text: `${p.title} has expired, so it isn’t protecting you today.` });
    if (p.status === 'expiring') out.push({ tone: 'warn', text: `${p.title} ends ${shortDate(p.expires)}.` });
    const gap = p.insights.find((i) => i.tone === 'gap');
    if (gap) out.push({ tone: 'gap', text: `${p.title}: ${gap.title.toLowerCase()}.` });
  }
  return out;
}

export default function Compare() {
  const policies = useStore((s) => s.policies);
  const [picked, setPicked] = useState<[string, string]>(['personalAuto', 'commercialAuto']);

  // Slots are always filled; fall back to the first two if a pick has gone away.
  const a = policies.find((p) => p.id === picked[0]) ?? policies[0];
  const b = policies.find((p) => p.id === picked[1] && p.id !== a?.id) ?? policies.find((p) => p.id !== a?.id);

  if (!a || !b) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.bg }}>
        <ScreenTitle title="Compare" />
        <Text style={[type.body, { textAlign: 'center', marginTop: 60, paddingHorizontal: space.xxl }]}>
          Add at least two policies and I’ll line them up side by side.
        </Text>
      </View>
    );
  }

  const keys = [...new Set([...a.coverages, ...b.coverages].map((c) => c.key))];
  const lines: Line[] = keys.map((key) => {
    const ca = a.coverages.find((c) => c.key === key);
    const cb = b.coverages.find((c) => c.key === key);
    return { key, label: (ca ?? cb)!.label, a: ca, b: cb };
  });
  const sharedLines = lines.filter((l) => l.a && l.b).length;

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <ScreenTitle title="Compare" />
      <Selector
        policies={policies}
        a={a}
        b={b}
        onPick={(slot, id) => setPicked(slot === 0 ? [id, b.id] : [a.id, id])}
      />

      <Split
        top={
          <>
            <Card style={{ padding: 0, overflow: 'hidden' }}>
              <View style={[styles.tr, styles.head]}>
                <View style={styles.th} />
                <Head slot="A" policy={a} />
                <Head slot="B" policy={b} />
              </View>
              <Row label="Carrier" a={a.carrier} b={b.carrier} />
              <Row label="Status" a={statusLabel(a)} b={statusLabel(b)} />
              <Row label="Per year" a={money(a.premium)} b={money(b.premium)} best={a.premium === b.premium ? null : a.premium < b.premium ? 'a' : 'b'} />
              <Row
                label="Deductible"
                a={money(a.deductible)}
                b={money(b.deductible)}
                best={a.deductible === null || b.deductible === null || a.deductible === b.deductible ? null : a.deductible < b.deductible ? 'a' : 'b'}
              />
              <Row label="Ends" a={shortDate(a.expires)} b={shortDate(b.expires)} />
            </Card>

            <SectionLabel>Coverage, line by line</SectionLabel>
            <Card style={{ padding: 0, overflow: 'hidden' }}>
              {lines.map((l, i) => {
                const la = l.a?.limit ?? null;
                const lb = l.b?.limit ?? null;
                const best = la !== null && lb !== null && la !== lb ? (la > lb ? 'a' : 'b') : null;
                const cell = (c: Line['a']) => (!c ? 'Not included' : c.limit === null ? (c.note ?? 'Included') : money(c.limit, true));
                return <Row key={l.key} first={i === 0} label={l.label} a={cell(l.a)} b={cell(l.b)} best={best} missA={!l.a} missB={!l.b} />;
              })}
            </Card>
          </>
        }
        take={takeaway(a, b, sharedLines)}
        insights={insightsFor(a, b, lines)}
        onAsk={() => askMoe({ prompt: `Compare ${a.title} and ${b.title}` })}
      />
    </View>
  );
}

/* ---------- Selector: A and B always lead; the rest wait in a deck ---------- */

function Selector({
  policies,
  a,
  b,
  onPick,
}: {
  policies: Policy[];
  a: Policy;
  b: Policy;
  onPick: (slot: Slot, id: string) => void;
}) {
  const { width } = useWindowDimensions();
  const [target, setTarget] = useState<Slot>(1);
  const [open, setOpen] = useState(false);
  const row = useRef<ScrollView>(null);

  const others = policies.filter((p) => p.id !== a.id && p.id !== b.id);
  const stacked = others.length > LOOSE && !open;
  // Three across: A, B and the deck all fit without scrolling.
  const tile = Math.floor((width - space.xl * 2 - 8 * 2 - 30) / 3);

  const animate = () => LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);

  const tapSlot = (slot: Slot) => {
    animate();
    setOpen(!(open && target === slot));
    setTarget(slot);
  };

  const choose = (id: string) => {
    animate();
    onPick(target, id);
    setOpen(false);
    row.current?.scrollTo({ x: 0, animated: true });
  };

  return (
    <View>
      <ScrollView
        ref={row}
        horizontal
        showsHorizontalScrollIndicator={false}
        scrollEnabled={!stacked}
        style={{ flexGrow: 0 }}
        contentContainerStyle={styles.selector}
      >
        {[a, b].map((p, i) => {
          const swapping = open && target === i;
          return (
            <Pressable
              key={p.id}
              accessibilityRole="button"
              accessibilityLabel={`Slot ${SLOT[i]}: ${p.title}. Tap to change.`}
              onPress={() => tapSlot(i as Slot)}
              style={[styles.pick, styles.pickOn, { width: tile }, swapping && styles.pickSwapping]}
            >
              <PolicyTile type={p.type} size={40} />
              <Text style={styles.pickText} numberOfLines={2}>
                {p.title}
              </Text>
              <View style={styles.slot}>
                <Text style={styles.slotText}>{SLOT[i]}</Text>
              </View>
            </Pressable>
          );
        })}

        {stacked ? (
          <Deck
            policies={others}
            width={tile}
            onPress={() => {
              animate();
              setOpen(true);
            }}
          />
        ) : (
          <>
            {others.map((p) => (
              <Pressable
                key={p.id}
                accessibilityRole="button"
                accessibilityLabel={`Compare ${p.title} as ${SLOT[target]}`}
                onPress={() => choose(p.id)}
                style={[styles.pick, { width: tile }]}
              >
                <PolicyTile type={p.type} size={40} />
                <Text style={styles.pickText} numberOfLines={2}>
                  {p.title}
                </Text>
              </Pressable>
            ))}
            {others.length > LOOSE ? (
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Stack the other policies"
                onPress={() => {
                  animate();
                  setOpen(false);
                  row.current?.scrollTo({ x: 0, animated: true });
                }}
                style={styles.restack}
              >
                <Layers size={20} color={colors.plum} strokeWidth={2.2} />
                <Text style={styles.restackText}>Stack</Text>
              </Pressable>
            ) : null}
          </>
        )}
      </ScrollView>
      <Text style={styles.hint}>
        {stacked ? 'Tap A, B or the stack to change what you’re comparing.' : `Pick a policy to put in slot ${SLOT[target]}.`}
      </Text>
    </View>
  );
}

/** The unpicked policies, fanned slightly like a deck. Tap to spread them out. */
function Deck({ policies, width, onPress }: { policies: Policy[]; width: number; onPress: () => void }) {
  const shown = policies.slice(0, 4);
  const step = 8;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${policies.length} more policies. Tap to choose one.`}
      onPress={onPress}
      style={{ width: width + (shown.length - 1) * step, height: TILE_HEIGHT }}
    >
      {shown
        .map((p, i) => (
          <View
            key={p.id}
            style={[
              styles.pick,
              styles.deckCard,
              {
                width,
                left: i * step,
                zIndex: shown.length - i,
                backgroundColor: i === 0 ? colors.surface : TILE_TINT[p.type],
                transform: [{ scale: 1 - i * 0.045 }, { rotate: `${i * 1.5}deg` }],
              },
            ]}
          >
            {i === 0 ? (
              <>
                <PolicyTile type={p.type} size={40} />
                <Text style={styles.pickText} numberOfLines={2}>
                  {policies.length} more{'\n'}
                  <Text style={{ color: colors.muted, fontFamily: fonts.medium }}>Tap to choose</Text>
                </Text>
              </>
            ) : null}
          </View>
        ))
        .reverse()}
    </Pressable>
  );
}

/* ---------- Split view: tables above, Moe below, a draggable edge between ---------- */

const HANDLE = 58;
const TWO_LINES = 44;

function Split({
  top,
  take,
  insights,
  onAsk,
}: {
  top: React.ReactNode;
  take: string;
  insights: { tone: Tone; text: string }[];
  onAsk: () => void;
}) {
  const insets = useSafeAreaInsets();
  const [area, setArea] = useState(0);
  const [collapsed, setCollapsed] = useState(false);

  const clearance = insets.bottom + TAB_BAR_CLEARANCE;
  // Smallest: the handle and two lines of Moe's take, clear of the tab bar.
  const min = HANDLE + TWO_LINES + 10 + clearance;
  const max = Math.max(min, area - 96);
  const mid = Math.min(max, Math.max(min, Math.round(area * 0.46)));

  const height = useRef(new Animated.Value(min)).current;
  const live = useRef({ min, max, mid, at: min, start: min });
  live.current.min = min;
  live.current.max = max;
  live.current.mid = mid;

  const settle = (to: number) => {
    live.current.at = to;
    setCollapsed(to <= live.current.min + 4);
    Animated.spring(height, { toValue: to, damping: 26, stiffness: 240, mass: 1, useNativeDriver: false }).start();
  };

  // Open at the halfway point once the available height is known.
  const placed = useRef(false);
  useEffect(() => {
    if (!area || placed.current) return;
    placed.current = true;
    live.current.at = mid;
    height.setValue(mid);
  }, [area, mid, height]);

  const pan = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: (_, g) => Math.abs(g.dy) > 4,
        onPanResponderGrant: () => {
          height.stopAnimation();
          live.current.start = live.current.at;
        },
        onPanResponderMove: (_, g) => {
          const next = Math.max(live.current.min, Math.min(live.current.max, live.current.start - g.dy));
          live.current.at = next;
          height.setValue(next);
          setCollapsed(next <= live.current.min + 4);
        },
        onPanResponderRelease: (_, g) => {
          const { min: lo, mid: half, at } = live.current;
          // A tap toggles; a drag rests where you leave it, snapping shut when it's nearly closed.
          if (Math.abs(g.dy) < 4) return settle(at <= lo + 4 ? half : lo);
          settle(at < lo + 48 || g.vy > 1.2 ? lo : at);
        },
        onPanResponderTerminate: () => settle(live.current.at),
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [height],
  );

  return (
    <View style={{ flex: 1 }} onLayout={(e) => setArea(e.nativeEvent.layout.height)}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingHorizontal: space.xl, paddingTop: space.xs, paddingBottom: space.xl }}
        showsVerticalScrollIndicator={false}
      >
        {top}
      </ScrollView>

      <Animated.View style={[styles.pane, { height, paddingBottom: clearance }]}>
        <View
          {...pan.panHandlers}
          accessibilityRole="adjustable"
          accessibilityLabel="Moe’s take. Drag to resize."
          accessibilityActions={[{ name: 'increment' }, { name: 'decrement' }]}
          onAccessibilityAction={(e) => settle(e.nativeEvent.actionName === 'increment' ? live.current.max : live.current.min)}
          style={styles.paneHandle}
        >
          <View style={styles.grabber} />
          <View style={styles.paneTitle}>
            <Image source={require('../../../assets/moe-tab.png')} style={{ width: 28, height: 28 }} />
            <Text style={styles.paneLabel}>Moe’s take</Text>
          </View>
        </View>

        {collapsed ? (
          <Text style={[styles.take, { paddingHorizontal: space.xl }]} numberOfLines={2}>
            {take}
          </Text>
        ) : (
          <ScrollView
            style={{ flex: 1 }}
            contentContainerStyle={{ paddingHorizontal: space.xl, paddingBottom: space.lg }}
            showsVerticalScrollIndicator={false}
          >
            <Text style={styles.take}>{take}</Text>

            {insights.length ? <Text style={[type.label, { marginTop: space.lg, marginBottom: space.xs }]}>Insights</Text> : null}
            {insights.map((n) => (
              <View key={n.text} style={styles.insight}>
                <View style={[styles.insightDot, { backgroundColor: n.tone === 'good' ? colors.teal : n.tone === 'warn' ? colors.sun : colors.pink }]} />
                <Text style={styles.insightText}>{n.text}</Text>
              </View>
            ))}

            <Pressable accessibilityRole="button" onPress={onAsk} style={styles.ask}>
              <Text style={styles.askText}>Ask Moe about these two</Text>
              <ChevronRight size={18} color="#fff" strokeWidth={2.4} />
            </Pressable>
          </ScrollView>
        )}
      </Animated.View>
    </View>
  );
}

/* ---------- Table bits ---------- */

function Head({ slot, policy }: { slot: string; policy: Policy }) {
  return (
    <View style={styles.td}>
      <View style={styles.headSlot}>
        <Text style={styles.slotText}>{slot}</Text>
      </View>
      <Text style={styles.headText} numberOfLines={2}>
        {policy.title}
      </Text>
    </View>
  );
}

function Row({
  label,
  a,
  b,
  best = null,
  first = false,
  missA = false,
  missB = false,
}: {
  label: string;
  a: string;
  b: string;
  best?: 'a' | 'b' | null;
  first?: boolean;
  missA?: boolean;
  missB?: boolean;
}) {
  return (
    <View style={[styles.tr, !first && styles.trBorder]}>
      <Text style={[styles.th, styles.thText]}>{label}</Text>
      <View style={styles.td}>
        <Text style={[styles.cell, best === 'a' && styles.best, missA && styles.miss]}>{a}</Text>
      </View>
      <View style={styles.td}>
        <Text style={[styles.cell, best === 'b' && styles.best, missB && styles.miss]}>{b}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  selector: { gap: 8, paddingHorizontal: space.xl, paddingTop: 4, paddingBottom: 6, alignItems: 'flex-start' },
  pick: {
    height: TILE_HEIGHT,
    padding: 10,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    borderWidth: 2,
    borderColor: 'transparent',
    gap: 6,
  },
  pickOn: { borderColor: colors.plum, backgroundColor: colors.plumSoft },
  pickSwapping: { borderStyle: 'dashed', backgroundColor: colors.surface },
  pickText: { fontFamily: fonts.semi, fontSize: 13, lineHeight: 16, color: colors.ink },
  // No drop shadow: the scrolling row clips it into a hard-edged box.
  deckCard: { position: 'absolute', top: 0, borderColor: colors.line, borderWidth: 1.5 },
  slot: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 24,
    height: 24,
    borderRadius: 8,
    backgroundColor: colors.plum,
    alignItems: 'center',
    justifyContent: 'center',
  },
  slotText: { fontFamily: fonts.bold, fontSize: 12, lineHeight: 17, color: '#fff' },
  restack: {
    width: 76,
    height: TILE_HEIGHT,
    borderRadius: radius.md,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: colors.line,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  restackText: { fontFamily: fonts.bold, fontSize: 13, lineHeight: 19, color: colors.plum },
  hint: { ...type.small, paddingHorizontal: space.xl, marginBottom: space.sm },

  pane: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    ...shadowUp,
  },
  paneHandle: { height: HANDLE, paddingHorizontal: space.xl },
  grabber: { alignSelf: 'center', width: 40, height: 5, borderRadius: 3, backgroundColor: colors.line, marginTop: 8 },
  paneTitle: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 8 },
  paneLabel: { fontFamily: fonts.bold, fontSize: 12, lineHeight: 17, letterSpacing: 0.6, textTransform: 'uppercase', color: colors.plum },
  take: { fontFamily: fonts.medium, fontSize: 16, lineHeight: 22, color: colors.ink },
  insight: { flexDirection: 'row', gap: 10, paddingVertical: 6 },
  insightDot: { width: 9, height: 9, borderRadius: 3, marginTop: 6 },
  insightText: { flex: 1, fontFamily: fonts.body, fontSize: 15, lineHeight: 21, color: colors.inkSoft },
  ask: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    minHeight: 50,
    borderRadius: radius.pill,
    backgroundColor: colors.plum,
    marginTop: space.lg,
  },
  askText: { fontFamily: fonts.bold, fontSize: 15, lineHeight: 22, color: '#fff' },

  tr: { flexDirection: 'row', alignItems: 'center', minHeight: HIT + 4, paddingHorizontal: space.md, paddingVertical: 10, gap: 8 },
  trBorder: { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.line },
  head: { backgroundColor: colors.plumSoft, alignItems: 'flex-start' },
  th: { flex: 1.05 },
  thText: { fontFamily: fonts.medium, fontSize: 13, lineHeight: 17, color: colors.inkSoft },
  td: { flex: 1, alignItems: 'flex-start', gap: 6 },
  headSlot: {
    width: 24,
    height: 24,
    borderRadius: 8,
    backgroundColor: colors.plum,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headText: { fontFamily: fonts.bold, fontSize: 13, lineHeight: 17, color: colors.plumDeep },
  cell: { fontFamily: fonts.semi, fontSize: 14, lineHeight: 18, color: colors.ink },
  best: {
    backgroundColor: colors.goodBg,
    color: colors.goodInk,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    overflow: 'hidden',
    marginLeft: -8,
  },
  miss: { color: colors.muted, fontFamily: fonts.body },
});
