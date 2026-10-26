import { useRouter } from 'expo-router';
import { ChevronDown, ChevronRight, ChevronUp } from 'lucide-react-native';
import { useEffect, useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Moe } from '@/components/Moe';
import { NotificationsButton } from '@/components/NotificationsButton';
import { PolicyTile } from '@/components/PolicyTile';
import { Card, Chip, MosaicStrip, SectionLabel, TAB_BAR_SPACE, TonePill, useFocused } from '@/components/ui';
import { askMoe } from '@/lib/askMoe';
import { money, Policy, profile, shortDate, Tone } from '@/lib/data';
import { greeting, HOME_PROMPTS } from '@/lib/moeBrain';
import { useStore } from '@/lib/store';
import { colors, fonts, HIT, radius, shadow, space, type } from '@/lib/theme';

/** How many "needs your attention" rows show before "Show more". */
const ATTENTION_LIMIT = 5;

function attentionFor(p: Policy): { tone: Tone; title: string; body: string } | null {
  if (p.sharedBy) return null;
  if (p.status === 'expiring') return { tone: 'warn', title: 'Renews soon', body: `${p.title} ends ${shortDate(p.expires)}.` };
  if (p.status === 'unknown') return { tone: 'warn', title: 'Dates unknown', body: `I couldn’t find an end date in ${p.title}.` };
  if (p.status === 'expired') return { tone: 'gap', title: 'Expired', body: `${p.title} ended ${shortDate(p.expires)}.` };
  return null;
}

/** Types Moe's greeting out a few characters at a time. */
function useTyped(text: string) {
  const [n, setN] = useState(0);
  useEffect(() => {
    setN(0);
    const timer = setInterval(() => {
      setN((v) => {
        if (v >= text.length) {
          clearInterval(timer);
          return v;
        }
        return v + 2;
      });
    }, 24);
    return () => clearInterval(timer);
  }, [text]);
  return { shown: text.slice(0, n), done: n >= text.length };
}

export default function Home() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const focused = useFocused();
  const policies = useStore((s) => s.policies);
  const [allAttention, setAllAttention] = useState(false);

  const hello = useMemo(() => greeting(profile.firstName, policies), [policies]);
  const { shown, done } = useTyped(hello);

  const own = policies.filter((p) => !p.sharedBy);
  const active = own.filter((p) => p.status !== 'expired');
  const perYear = active.reduce((sum, p) => sum + p.premium, 0);
  const gaps = own.flatMap((p) => p.insights).filter((i) => i.tone === 'gap').length;
  const attention = own.map((p) => ({ p, a: attentionFor(p) })).filter((x) => x.a);

  const today = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }} collapsable={false}>
    <ScrollView
      style={{ flex: 1 }}
      contentContainerStyle={{ paddingTop: insets.top + space.md, paddingHorizontal: space.xl, paddingBottom: TAB_BAR_SPACE + insets.bottom }}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.header}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Your profile"
          onPress={() => router.push('/profile')}
          style={styles.avatar}
        >
          <Text style={styles.avatarText}>
            {profile.firstName[0]}
            {profile.lastName[0]}
          </Text>
        </Pressable>
        <View style={{ flex: 1 }}>
          <Text style={type.small}>{today}</Text>
          <Text style={type.h1} accessibilityRole="header">
            Hi, {profile.firstName}
          </Text>
        </View>
        <NotificationsButton />
      </View>

      {/* Moe's greeting */}
      <Card style={styles.hero}>
        <MosaicStrip count={18} size={8} style={{ marginBottom: space.lg }} />
        <View style={styles.heroRow}>
          <Moe size={96} mood={done ? 'idle' : 'happy'} paused={!focused} label="Chat with Moe" onPress={() => askMoe()} />
          <View style={styles.bubble}>
            <View style={styles.bubbleTail} />
            <Text style={styles.bubbleText} accessibilityLabel={hello}>
              {shown}
              {/* Reserve the full height so the card doesn't grow while typing. */}
              <Text style={{ color: 'transparent' }}>{hello.slice(shown.length)}</Text>
            </Text>
          </View>
        </View>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.prompts}
          contentContainerStyle={{ gap: space.sm, paddingHorizontal: space.lg }}
        >
          {HOME_PROMPTS.map((p) => (
            <Chip key={p} label={p} onPress={() => askMoe({ prompt: p })} />
          ))}
        </ScrollView>
        <Pressable accessibilityRole="button" onPress={() => askMoe()} style={styles.ask}>
          <Text style={styles.askText}>Ask Moe anything…</Text>
          <View style={styles.askGo}>
            <ChevronRight size={18} color="#fff" strokeWidth={2.6} />
          </View>
        </Pressable>
      </Card>

      {/* Snapshot */}
      <View style={styles.stats}>
        <Stat value={String(active.length)} label="Active policies" />
        <Stat value={money(perYear, true)} label="Per year" />
        <Stat value={String(gaps)} label="Gaps found" tint={colors.gapInk} />
      </View>

      {attention.length ? (
        <>
          <SectionLabel>Needs your attention</SectionLabel>
          <Card style={{ paddingVertical: 4 }}>
            {(allAttention ? attention : attention.slice(0, ATTENTION_LIMIT)).map(({ p, a }, i) => (
              <Pressable
                key={p.id}
                accessibilityRole="button"
                onPress={() => router.push(`/policy/${p.id}`)}
                style={[styles.row, i > 0 && styles.rowBorder]}
              >
                <PolicyTile type={p.type} size={48} />
                <View style={{ flex: 1, gap: 4 }}>
                  <TonePill tone={a!.tone} label={a!.title} />
                  <Text style={type.bodyInk}>{a!.body}</Text>
                </View>
                <ChevronRight size={20} color={colors.muted} />
              </Pressable>
            ))}
            {attention.length > ATTENTION_LIMIT ? (
              <Pressable
                accessibilityRole="button"
                accessibilityState={{ expanded: allAttention }}
                onPress={() => setAllAttention((v) => !v)}
                style={[styles.row, styles.rowBorder, styles.more]}
              >
                <Text style={styles.moreText}>
                  {allAttention ? 'Show less' : `Show ${attention.length - ATTENTION_LIMIT} more`}
                </Text>
                {allAttention ? (
                  <ChevronUp size={18} color={colors.plum} strokeWidth={2.4} />
                ) : (
                  <ChevronDown size={18} color={colors.plum} strokeWidth={2.4} />
                )}
              </Pressable>
            ) : null}
          </Card>
        </>
      ) : null}

    </ScrollView>
    </View>
  );
}

function Stat({ value, label, tint = colors.ink }: { value: string; label: string; tint?: string }) {
  return (
    <Card style={styles.stat}>
      <Text style={[styles.statValue, { color: tint }]}>{value}</Text>
      <Text style={type.small}>{label}</Text>
    </Card>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', gap: space.md, marginBottom: space.lg },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.plum,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { fontFamily: fonts.bold, fontSize: 16, lineHeight: 23, color: '#fff' },
  hero: { padding: space.lg },
  heroRow: { flexDirection: 'row', alignItems: 'center', gap: space.md },
  bubble: {
    flex: 1,
    backgroundColor: colors.plumSoft,
    borderRadius: radius.md,
    padding: space.md,
  },
  bubbleTail: {
    position: 'absolute',
    left: -6,
    top: '50%',
    width: 14,
    height: 14,
    borderRadius: 3,
    backgroundColor: colors.plumSoft,
    transform: [{ rotate: '45deg' }],
  },
  bubbleText: { fontFamily: fonts.medium, fontSize: 16, lineHeight: 22, color: colors.plumDeep },
  prompts: { flexGrow: 0, marginTop: space.lg, marginHorizontal: -space.lg },
  ask: {
    marginTop: space.md,
    minHeight: 52,
    borderRadius: radius.pill,
    backgroundColor: colors.bg,
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: space.lg,
    paddingRight: 6,
  },
  askText: { flex: 1, fontFamily: fonts.body, fontSize: 15, lineHeight: 22, color: colors.muted },
  askGo: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.plum,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stats: { flexDirection: 'row', gap: space.md, marginTop: space.md },
  stat: { flex: 1, padding: space.md, gap: 2 },
  statValue: { fontFamily: fonts.display, fontSize: 26, lineHeight: 30 },
  row: { flexDirection: 'row', alignItems: 'center', gap: space.md, paddingVertical: space.md, minHeight: HIT },
  rowBorder: { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.line },
  more: { justifyContent: 'center', gap: 6 },
  moreText: { fontFamily: fonts.bold, fontSize: 15, lineHeight: 22, color: colors.plum },
});
