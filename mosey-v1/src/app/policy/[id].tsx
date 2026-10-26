import { useLocalSearchParams, useRouter } from 'expo-router';
import { Eye, EyeOff, FileText, MessageCircle } from 'lucide-react-native';
import { ReactNode, useEffect, useRef, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { MoeSheet } from '@/components/MoeSheet';
import { AssetList, CoveredList, PolicyFooter } from '@/components/PolicyContext';
import { PolicyDetails } from '@/components/PolicyDetails';
import { PolicyTile } from '@/components/PolicyTile';
import { BackHeader, Card, IconButton, StatusPill, StickyHeader, TONE, TonePill, ToneFilter, ToneFilterValue, emptyToneCopy, toneCounts, useFocused, useGoBack } from '@/components/ui';
import { maskNumber, money, shortDate, TYPE_LABEL } from '@/lib/data';
import { askMoe } from '@/lib/askMoe';
import { useStore } from '@/lib/store';
import { colors, fonts, HIT, space, type } from '@/lib/theme';

export default function PolicyDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const goBack = useGoBack('/files');
  const focused = useFocused();
  const policy = useStore((s) => s.policies.find((p) => p.id === id));
  const router = useRouter();
  const [reveal, setReveal] = useState(false);
  const [tone, setTone] = useState<ToneFilterValue>('all');
  const scroller = useRef<ScrollView>(null);
  const scrollY = useRef(0);
  const noticedY = useRef(0);

  // A filter can shrink the section to one line. If the reader has scrolled into
  // it, bring its header back to the top so the result is in view, not whatever
  // section slid up underneath.
  const pickTone = (next: ToneFilterValue) => {
    setTone(next);
    if (scrollY.current > noticedY.current) scroller.current?.scrollTo({ y: noticedY.current, animated: false });
  };
  const [dock, setDock] = useState(170);

  // Moe's sheet picks up the latest chat about this policy, or starts fresh.
  useEffect(() => {
    if (!focused) return;
    const { chats, openChat } = useStore.getState();
    openChat(chats.find((c) => c.policyId === id && c.messages.length > 0)?.id ?? null);
  }, [focused, id]);

  if (!policy) {
    return (
      <View style={{ flex: 1 }}>
        <BackHeader onBack={goBack} />
        <Text style={[type.body, { textAlign: 'center', marginTop: 80 }]}>That policy isn’t here anymore.</Text>
      </View>
    );
  }

  const shown = policy.insights.filter((i) => tone === 'all' || i.tone === tone);
  type Block = { key: string; title: string; chips?: boolean; body: ReactNode };
  const blocks: Block[] = [];
  if (policy.covered.length > 0) blocks.push({ key: 'covered', title: policy.coveredLabel, body: <CoveredList policy={policy} /> });
  if (policy.assets.length > 0) blocks.push({ key: 'assets', title: policy.assetsLabel, body: <AssetList policy={policy} /> });
  blocks.push({ key: 'details', title: 'Policy details', body: <PolicyDetails policy={policy} /> });
  blocks.push({
    key: 'noticed',
    title: 'What Moe noticed',
    chips: true,
    body: (
      <>
        {shown.map((i) => (
          <Card key={i.id} style={[styles.insight, { borderLeftColor: TONE[i.tone].ink }]}>
            <View style={styles.insightTop}>
              <TonePill tone={i.tone} />
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={`Ask Moe about: ${i.title}`}
                hitSlop={10}
                onPress={() => askMoe({ policyId: policy.id, insightId: i.id })}
                style={({ pressed }) => [styles.ask, pressed && { opacity: 0.7 }]}
              >
                <MessageCircle size={16} color={colors.plum} strokeWidth={2.4} />
                <Text style={styles.askText}>Ask Moe</Text>
              </Pressable>
            </View>
            <Text style={[type.h3, { marginTop: space.sm }]}>{i.title}</Text>
            <Text style={[type.body, { marginTop: 4 }]}>{i.body}</Text>
          </Card>
        ))}
        {shown.length === 0 ? <Text style={type.body}>{emptyToneCopy(tone)}</Text> : null}
      </>
    ),
  });
  blocks.push({
    key: 'limits',
    title: 'Limits at a glance',
    body: (
      <Card style={{ paddingVertical: 4 }}>
        {policy.coverages.map((c, i) => (
          <View key={c.key} style={[styles.line, i > 0 && styles.lineBorder]}>
            <View style={{ flex: 1 }}>
              <Text style={type.bodyInk}>{c.label}</Text>
              {c.note ? <Text style={type.small}>{c.note}</Text> : null}
            </View>
            <Text style={styles.limit}>{c.limit === null ? 'Included' : money(c.limit)}</Text>
          </View>
        ))}
      </Card>
    ),
  });
  blocks.push({
    key: 'about',
    title: 'About these insights',
    body: (
      <>
        <PolicyFooter policy={policy} />
        <Text style={styles.disclaimer}>
          Insights are based on the documents provided. They are policy summaries only, not advice, and not evidence of insurance. Review coverage questions with your insurance professional.
        </Text>
      </>
    ),
  });

  // Each section is a header followed by its body. The headers are the sticky
  // children; they have an opaque background, so bodies slide cleanly under them.
  const children: ReactNode[] = [
    <View key="top" style={styles.pad}>
        <View style={styles.hero}>
          <PolicyTile type={policy.type} size={64} dim={policy.status === 'expired'} live paused={!focused} />
          <View style={{ flex: 1, gap: 2 }}>
            <Text style={styles.title}>{policy.title}</Text>
            <Text style={styles.carrier}>{policy.carrier}</Text>
          </View>
        </View>

        <View style={styles.metaRow}>
          <StatusPill policy={policy} />
          {policy.sharedBy ? <TonePill tone="good" label={`Shared by ${policy.sharedBy}`} /> : null}
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={reveal ? 'Hide policy number' : 'Show policy number'}
            onPress={() => setReveal((v) => !v)}
            hitSlop={12}
            style={styles.number}
          >
            <Text style={styles.numberText}>{reveal ? policy.number : maskNumber(policy.number)}</Text>
            {reveal ? <EyeOff size={18} color={colors.inkSoft} /> : <Eye size={18} color={colors.inkSoft} />}
          </Pressable>
        </View>

        <View style={styles.stats}>
          <Stat label={policy.premium ? policy.premiumLabel : 'Premium'} value={policy.premium ? money(policy.premium) : 'Not stated'} />
          <Stat label="Deductible" value={money(policy.deductible)} />
          <Stat label={policy.status === 'expired' ? 'Ended' : 'Ends'} value={shortDate(policy.expires)} small />
        </View>

        <Card style={styles.facts}>
          <Fact label="Policyholder" value={policy.policyholder} />
          {policy.form ? <Fact label="Policy form" value={policy.form} /> : null}
          {policy.payment ? <Fact label="Payment" value={policy.payment} /> : null}
          <Fact label="Coverage period" value={policy.effective ? `${shortDate(policy.effective)} – ${shortDate(policy.expires)}` : 'Not found in the document'} />
          <Fact label="Carrier" value={policy.carrier} last />
        </Card>

    </View>,
  ];
  const sticky: number[] = [];
  for (const b of blocks) {
    sticky.push(children.length);
    children.push(
      <StickyHeader
        key={`${b.key}-header`}
        title={b.title}
        onLayout={b.chips ? (e) => (noticedY.current = e.nativeEvent.layout.y) : undefined}
      >
        {b.chips ? <ToneFilter value={tone} onChange={pickTone} counts={toneCounts(policy.insights)} /> : null}
      </StickyHeader>,
    );
    children.push(
      <View key={b.key} style={styles.pad}>
        {b.body}
      </View>,
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <BackHeader
        title={TYPE_LABEL[policy.type]}
        onBack={goBack}
        right={
          <IconButton
            icon={FileText}
            label={`Documents, ${policy.documents.length}`}
            onPress={() => router.push({ pathname: '/documents', params: { policy: policy.id } })}
            tint={colors.plum}
          />
        }
      />
      <ScrollView
        ref={scroller}
        onScroll={(e) => (scrollY.current = e.nativeEvent.contentOffset.y)}
        scrollEventThrottle={32}
        contentContainerStyle={{ paddingBottom: dock + space.xl }}
        stickyHeaderIndices={sticky}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {children}
      </ScrollView>

      {/* Moe's chat, minimised to its composer. Pull it up for the full conversation. */}
      <MoeSheet policyId={policy.id} paused={!focused} onDockHeight={setDock} />
    </View>
  );
}

function Fact({ label, value, last = false }: { label: string; value: string; last?: boolean }) {
  return (
    <View style={[styles.fact, !last && styles.lineBorderBottom]}>
      <Text style={type.small}>{label}</Text>
      <Text style={[type.bodyInk, { flex: 1, textAlign: 'right' }]} numberOfLines={2}>
        {value}
      </Text>
    </View>
  );
}

function Stat({ label, value, small = false }: { label: string; value: string; small?: boolean }) {
  return (
    <Card style={styles.stat}>
      <Text style={type.small}>{label}</Text>
      <Text style={[styles.statValue, small && { fontSize: 16, lineHeight: 24 }]} numberOfLines={1} adjustsFontSizeToFit>
        {value}
      </Text>
    </Card>
  );
}

const styles = StyleSheet.create({
  // The bottom padding leaves room for a card's shadow to fade out before the
  // next sticky header, whose opaque background would otherwise cut it off.
  pad: { paddingHorizontal: space.xl, paddingBottom: 24 },
  hero: { flexDirection: 'row', alignItems: 'center', gap: space.md, marginTop: space.xs },
  // Three points down from the standard screen title, so the header takes less room.
  title: { fontFamily: fonts.display, fontSize: 19, lineHeight: 23, color: colors.ink, letterSpacing: -0.2 },
  carrier: { fontFamily: fonts.body, fontSize: 14, lineHeight: 20, color: colors.inkSoft },
  metaRow: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: space.sm, marginTop: space.md },
  // No minimum height here: it would sit the number lower than the badge. hitSlop keeps the tap target.
  number: { flexDirection: 'row', alignItems: 'center', gap: 8, marginLeft: 'auto' },
  numberText: { fontFamily: fonts.semi, fontSize: 14, lineHeight: 20, color: colors.inkSoft },
  stats: { flexDirection: 'row', gap: space.sm, marginTop: space.md },
  stat: { flex: 1, padding: space.md, gap: 2 },
  statValue: { fontFamily: fonts.display, fontSize: 20, lineHeight: 24, color: colors.ink },
  facts: { marginTop: space.sm, paddingVertical: 2 },
  fact: { flexDirection: 'row', alignItems: 'center', gap: space.lg, minHeight: 46, paddingVertical: 8 },
  lineBorderBottom: { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.line },
  insight: { marginBottom: space.md, borderLeftWidth: 5 },
  insightTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  ask: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: colors.plumSoft,
  },
  askText: { fontFamily: fonts.bold, fontSize: 12, lineHeight: 17, color: colors.plum },
  line: { flexDirection: 'row', alignItems: 'center', gap: space.md, minHeight: 52, paddingVertical: 10 },
  lineBorder: { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.line },
  limit: { fontFamily: fonts.bold, fontSize: 15, lineHeight: 22, color: colors.ink },
  disclaimer: { fontFamily: fonts.body, fontSize: 12, lineHeight: 17, color: colors.muted, marginTop: space.md },
});
