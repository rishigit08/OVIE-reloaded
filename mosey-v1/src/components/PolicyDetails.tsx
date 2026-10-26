import { useRouter } from 'expo-router';
import { Check, ChevronRight, Coins, Eye, FileText, Gauge, ListChecks, LucideIcon, X } from 'lucide-react-native';
import { useMemo, useRef, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, useWindowDimensions, View } from 'react-native';

import { Policy } from '@/lib/data';
import { Chip } from '@/components/ui';
import { coverageMeta, DetailKind, detailsFor, KIND_LABEL, KINDS, Section } from '@/lib/details';
import { colors, fonts, HIT, radius, shadow, space, type } from '@/lib/theme';

export const KIND_STYLE: Record<DetailKind, { bg: string; ink: string; icon: LucideIcon }> = {
  included: { bg: colors.goodBg, ink: colors.goodInk, icon: Check },
  excluded: { bg: colors.gapBg, ink: colors.gapInk, icon: X },
  limits: { bg: colors.warnBg, ink: colors.warnInk, icon: Gauge },
  watch: { bg: '#DCE9FF', ink: '#1F4FA8', icon: Eye },
  specs: { bg: colors.plumSoft, ink: colors.plum, icon: ListChecks },
  deductibles: { bg: '#E6F3D5', ink: '#3B7A1E', icon: Coins },
};

/** The client's watch-point severities. */
export const SEVERITY = {
  Critical: { bg: colors.gapBg, ink: colors.gapInk },
  Moderate: { bg: colors.warnBg, ink: colors.warnInk },
  Low: { bg: colors.sunken, ink: colors.inkSoft },
} as const;

const GAP = 12;
/** How many points a carousel card previews before "+N more". */
const PREVIEW = 3;

/**
 * The full summary of a policy. Six tiles pick the kind of detail; the
 * sections of that kind sit in a carousel underneath, each citing its page.
 */
export function PolicyDetails({ policy }: { policy: Policy }) {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const details = useMemo(() => detailsFor(policy), [policy]);
  const [kind, setKind] = useState<DetailKind>('included');
  const carousel = useRef<ScrollView>(null);

  const [group, setGroup] = useState<string | null>(null);

  // Scope bubbles come from whatever groups this kind of detail has: a vehicle,
  // a coverage part, "Across your policy". One group means nothing to choose.
  const groups = [...new Set(details[kind].map((s) => s.group).filter((g): g is string => !!g))];
  const scoped = groups.length > 1 && group !== null && groups.includes(group);
  const sections = scoped ? details[kind].filter((s) => s.group === group) : details[kind];
  const tone = KIND_STYLE[kind];
  const cardWidth = Math.min(340, width - space.xl * 2 - 36);

  const pick = (next: DetailKind) => {
    setKind(next);
    setGroup(null);
    carousel.current?.scrollTo({ x: 0, animated: false });
  };

  const scope = (next: string | null) => {
    setGroup(next);
    carousel.current?.scrollTo({ x: 0, animated: false });
  };

  return (
    <View>
      <View style={styles.grid} accessibilityRole="tablist">
        {KINDS.map((k) => {
          const s = KIND_STYLE[k];
          const on = k === kind;
          const Icon = s.icon;
          return (
            <Pressable
              key={k}
              accessibilityRole="tab"
              accessibilityState={{ selected: on }}
              accessibilityLabel={`${KIND_LABEL[k]}, ${details[k].length} sections`}
              onPress={() => pick(k)}
              style={[styles.kind, { backgroundColor: s.bg, borderColor: on ? s.ink : 'transparent' }]}
            >
              <View style={styles.kindTop}>
                <View style={[styles.kindIcon, { backgroundColor: s.ink }]}>
                  <Icon size={14} color="#fff" strokeWidth={3} />
                </View>
                <Text style={[styles.kindCount, { color: s.ink }]}>{details[k].length}</Text>
              </View>
              <Text style={[styles.kindLabel, { color: s.ink }]}>{KIND_LABEL[k]}</Text>
            </Pressable>
          );
        })}
      </View>

      {groups.length > 1 ? (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.scope}
          contentContainerStyle={{ gap: space.sm, paddingHorizontal: space.xl }}
        >
          <Chip label="All" active={!scoped} onPress={() => scope(null)} />
          {groups.map((g) => (
            <Chip key={g} label={g} active={scoped && group === g} onPress={() => scope(g)} />
          ))}
        </ScrollView>
      ) : null}

      {sections.length === 0 ? (
        <View style={styles.none}>
          <Text style={type.body}>Nothing was found under this heading in the document.</Text>
        </View>
      ) : (
        <ScrollView
          ref={carousel}
          horizontal
          showsHorizontalScrollIndicator={false}
          snapToInterval={cardWidth + GAP}
          decelerationRate="fast"
          style={styles.carousel}
          contentContainerStyle={{ gap: GAP, paddingHorizontal: space.xl, paddingVertical: space.md }}
        >
          {sections.map((s, i) => (
            <SectionCard
              key={s.id}
              section={s}
              width={cardWidth}
              position={`${i + 1} of ${sections.length}`}
              ink={tone.ink}
              onPress={() => router.push({ pathname: '/section', params: { policy: policy.id, section: s.id } })}
            />
          ))}
        </ScrollView>
      )}
    </View>
  );
}

function SectionCard({
  section,
  width,
  position,
  ink,
  onPress,
}: {
  section: Section;
  width: number;
  position: string;
  ink: string;
  onPress: () => void;
}) {
  const more = section.points.length - PREVIEW;
  const meta = coverageMeta(section);
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${section.title}. ${section.points.length} points. Page ${section.cite.page}.`}
      onPress={onPress}
      style={({ pressed }) => [styles.card, { width }, pressed && { opacity: 0.9 }]}
    >
      <View style={styles.cardHead}>
        <View style={{ flex: 1, gap: 2 }}>
          {section.group ? (
            <Text style={styles.group} numberOfLines={1}>
              {section.group}
            </Text>
          ) : null}
          <Text style={type.h3} numberOfLines={2}>
            {section.title}
          </Text>
        </View>
        <Text style={type.small}>{position}</Text>
      </View>

      {meta.length > 0 ? (
        <View style={styles.metaRow}>
          {meta.map((m) => (
            <View key={m} style={styles.metaPill}>
              <Text style={styles.metaText} numberOfLines={1}>
                {m}
              </Text>
            </View>
          ))}
        </View>
      ) : null}

      {section.severity ? (
        <View style={[styles.sev, { backgroundColor: SEVERITY[section.severity].bg }]}>
          <Text style={[styles.sevText, { color: SEVERITY[section.severity].ink }]}>{section.severity}</Text>
        </View>
      ) : null}

      <View style={styles.points}>
        {section.points.slice(0, PREVIEW).map((p) => (
          <View key={p} style={styles.point}>
            <View style={[styles.dot, { backgroundColor: ink }]} />
            <Text style={styles.pointText} numberOfLines={3}>
              {p}
            </Text>
          </View>
        ))}
      </View>

      <View style={styles.cardFoot}>
        <View style={styles.cite}>
          <FileText size={14} color={colors.plum} strokeWidth={2.2} />
          <Text style={styles.citeText}>Page {section.cite.page}</Text>
        </View>
        <View style={styles.open}>
          <Text style={styles.openText}>{more > 0 ? `${more} more` : 'Open'}</Text>
          <ChevronRight size={16} color={colors.plum} strokeWidth={2.4} />
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  kind: {
    width: '48.5%',
    flexGrow: 1,
    minHeight: 84,
    borderRadius: radius.md,
    borderWidth: 2,
    padding: space.md,
    justifyContent: 'space-between',
    gap: 8,
  },
  kindTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  kindIcon: { width: 24, height: 24, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  kindCount: { fontFamily: fonts.display, fontSize: 22, lineHeight: 24 },
  kindLabel: { fontFamily: fonts.bold, fontSize: 14, lineHeight: 18 },
  carousel: { marginHorizontal: -space.xl, flexGrow: 0 },
  card: {
    minHeight: 236,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: space.lg,
    ...shadow,
  },
  cardHead: { flexDirection: 'row', alignItems: 'flex-start', gap: space.sm },
  points: { flex: 1, gap: 10, marginTop: space.md },
  point: { flexDirection: 'row', gap: 10 },
  dot: { width: 7, height: 7, borderRadius: 2, marginTop: 7 },
  pointText: { flex: 1, fontFamily: fonts.body, fontSize: 15, lineHeight: 21, color: colors.inkSoft },
  cardFoot: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: HIT,
    marginTop: space.sm,
    marginBottom: -space.sm,
  },
  cite: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: radius.pill,
    backgroundColor: colors.plumSoft,
  },
  citeText: { fontFamily: fonts.bold, fontSize: 12, lineHeight: 17, color: colors.plum },
  open: { flexDirection: 'row', alignItems: 'center', gap: 2 },
  openText: { fontFamily: fonts.bold, fontSize: 14, lineHeight: 20, color: colors.plum },
  none: { paddingVertical: space.xl },
  scope: { marginHorizontal: -space.xl, marginTop: space.md, flexGrow: 0 },
  metaRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: space.sm },
  metaPill: { maxWidth: '100%', paddingHorizontal: 10, paddingVertical: 4, borderRadius: radius.pill, backgroundColor: colors.bg },
  metaText: { fontFamily: fonts.semi, fontSize: 12, lineHeight: 17, color: colors.ink },
  group: { fontFamily: fonts.bold, fontSize: 12, lineHeight: 17, color: colors.muted },
  sev: { alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 3, borderRadius: radius.pill, marginTop: space.sm },
  sevText: { fontFamily: fonts.bold, fontSize: 12, lineHeight: 17 },
});
