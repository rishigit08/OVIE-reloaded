import { useRouter } from 'expo-router';
import { ChevronDown, ChevronRight, ChevronUp } from 'lucide-react-native';
import { ReactNode, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Card } from '@/components/ui';
import type { Asset, Policy } from '@/lib/data';
import { colors, fonts, HIT, radius, space, type } from '@/lib/theme';

/** The people or entities the policy covers: drivers, named insureds, beneficiaries. */
export function CoveredList({ policy }: { policy: Policy }) {
  const router = useRouter();
  if (policy.covered.length === 0) return null;
  return (
    <Card style={{ paddingVertical: 4 }}>
      {policy.covered.map((c, i) => {
        // A row with evidence behind it opens the full details in a sheet.
        const open = c.source
          ? () => router.push({ pathname: '/source', params: { policy: policy.id, source: c.source! } })
          : undefined;
        return (
          <Pressable
            key={`${c.name}-${i}`}
            accessibilityRole={open ? 'button' : undefined}
            accessibilityLabel={open ? `${c.name}. Open details.` : undefined}
            disabled={!open}
            onPress={open}
            style={({ pressed }) => [styles.row, i > 0 && styles.rowBorder, pressed && { opacity: 0.7 }]}
          >
            <View style={{ flex: 1, gap: 2 }}>
              <Text style={type.bodyInk}>{c.name}</Text>
              {c.role ? <Text style={styles.role}>{c.role}</Text> : null}
              {c.note ? <Text style={type.small}>{c.note}</Text> : null}
            </View>
            {open ? <ChevronRight size={20} color={colors.inkSoft} /> : null}
          </Pressable>
        );
      })}
    </Card>
  );
}

const PAGE = 6;

/**
 * Vehicles, locations, units: one compact row each. The full schedule lives in
 * a sheet (`/asset`), so the page stays short however much an entity carries.
 */
export function AssetList({ policy }: { policy: Policy }) {
  const [shown, setShown] = useState(PAGE);
  if (policy.assets.length === 0) return null;
  const visible = policy.assets.slice(0, shown);
  const left = policy.assets.length - visible.length;
  return (
    <View style={{ gap: space.sm }}>
      {visible.map((a) => (
        <AssetRow key={a.id} policyId={policy.id} asset={a} />
      ))}
      {left > 0 ? (
        <Pressable accessibilityRole="button" onPress={() => setShown((n) => n + PAGE)} style={styles.more}>
          <Text style={styles.moreText}>See more ({left} left)</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

/** "10 coverages · 1 declined", or nothing when the entity has no schedule. */
export function scheduleSummary(asset: Asset): string | null {
  if (asset.coverages.length === 0) return null;
  const declined = asset.coverages.filter((c) => c.declined).length;
  const n = asset.coverages.length;
  return `${n} ${n === 1 ? 'coverage' : 'coverages'}${declined ? ` · ${declined} declined` : ''}`;
}

function AssetRow({ policyId, asset }: { policyId: string; asset: Asset }) {
  const router = useRouter();
  const summary = scheduleSummary(asset);
  const facts = asset.facts.slice(0, 2);
  const body = (
    <Card style={styles.asset}>
      <View style={{ flex: 1, gap: 2 }}>
        <Text style={styles.role}>{asset.kind}</Text>
        <Text style={type.h3}>{asset.name}</Text>
        {facts.map(([label, value]) => (
          <Text key={label} style={type.small} numberOfLines={1}>
            {label}: {value}
          </Text>
        ))}
        {summary ? <Text style={styles.summary}>{summary}</Text> : null}
      </View>
      {summary ? <ChevronRight size={20} color={colors.inkSoft} /> : null}
    </Card>
  );
  // Nothing more to show than the row already does: not a button.
  if (!summary) return body;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${asset.name}. ${summary}. Open schedule.`}
      onPress={() => router.push({ pathname: '/asset', params: { policy: policyId, asset: asset.id } })}
      style={({ pressed }) => pressed && { opacity: 0.85 }}
    >
      {body}
    </Pressable>
  );
}

/** An entity's schedule, read straight down: limit, deductible and premium per coverage. */
export function CoverageRows({ asset, policyId }: { asset: Asset; policyId: string }) {
  const router = useRouter();
  return (
    <>
      {asset.coverages.map((c) => (
        <Pressable
          key={c.title}
          accessibilityRole={c.source ? 'button' : undefined}
          disabled={!c.source}
          onPress={() => router.push({ pathname: '/source', params: { policy: policyId, source: c.source! } })}
          style={({ pressed }) => [styles.cov, pressed && { opacity: 0.7 }]}
        >
          <View style={styles.covTop}>
            <Text style={[type.bodyInk, { flex: 1 }, c.declined && { color: colors.muted }]}>{c.title}</Text>
            <Text style={[styles.limit, c.declined && { color: colors.gapInk }]}>{c.limit}</Text>
          </View>
          <Text style={type.small}>{c.text}</Text>
          {!c.declined && (c.deductible || c.premium) ? (
            <Text style={styles.meta}>
              {[c.deductible ? `Deductible: ${c.deductible}` : null, c.premium ? `Premium: ${c.premium}` : null]
                .filter(Boolean)
                .join('  ·  ')}
            </Text>
          ) : null}
        </Pressable>
      ))}
    </>
  );
}

function Disclosure({ title, count, children }: { title: string; count: number; children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const Chevron = open ? ChevronUp : ChevronDown;
  return (
    <Card style={{ padding: 0, overflow: 'hidden' }}>
      <Pressable
        accessibilityRole="button"
        accessibilityState={{ expanded: open }}
        onPress={() => setOpen((v) => !v)}
        style={styles.head}
      >
        <Text style={[type.h3, { flex: 1 }]}>{title}</Text>
        <View style={styles.count}>
          <Text style={styles.countText}>{count}</Text>
        </View>
        <Chevron size={18} color={colors.inkSoft} />
      </Pressable>
      {open ? <View style={styles.body}>{children}</View> : null}
    </Card>
  );
}

/** The client's footer: which forms sit on which pages, and what could not be read. */
export function PolicyFooter({ policy }: { policy: Policy }) {
  return (
    <View style={{ gap: space.sm }}>
      {policy.documentMap.length > 0 ? (
        <Disclosure title="Document sources" count={policy.documentMap.length}>
          {policy.documentMap.map((d) => (
            <View key={d.title} style={styles.cov}>
              <Text style={type.bodyInk}>{d.title}</Text>
              <Text style={type.small}>{d.ref}</Text>
            </View>
          ))}
        </Disclosure>
      ) : null}
      {policy.notAvailable.length > 0 ? (
        <Disclosure title="Not available in the pages analyzed" count={policy.notAvailable.length}>
          {policy.notAvailable.map((n) => (
            <View key={n} style={styles.point}>
              <View style={styles.dot} />
              <Text style={[type.body, { flex: 1 }]}>{n}</Text>
            </View>
          ))}
        </Disclosure>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: space.sm, minHeight: 52, paddingVertical: 10 },
  rowBorder: { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.line },
  role: { fontFamily: fonts.bold, fontSize: 12, lineHeight: 17, color: colors.plum },
  asset: { flexDirection: 'row', alignItems: 'center', gap: space.sm },
  summary: { fontFamily: fonts.semi, fontSize: 13, lineHeight: 19, color: colors.inkSoft, marginTop: 4 },
  head: { flexDirection: 'row', alignItems: 'center', gap: space.sm, minHeight: HIT + 12, padding: space.lg },
  body: { paddingHorizontal: space.lg, paddingBottom: space.lg, gap: space.md },
  cov: {
    gap: 4,
    paddingTop: space.md - StyleSheet.hairlineWidth,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.line,
  },
  covTop: { flexDirection: 'row', gap: space.md, alignItems: 'flex-start' },
  limit: { fontFamily: fonts.bold, fontSize: 14, lineHeight: 20, color: colors.ink, flexShrink: 1, textAlign: 'right', maxWidth: '50%' },
  meta: { fontFamily: fonts.semi, fontSize: 12, lineHeight: 17, color: colors.inkSoft },
  count: { minWidth: 26, paddingHorizontal: 8, paddingVertical: 2, borderRadius: radius.pill, backgroundColor: colors.plumSoft, alignItems: 'center' },
  countText: { fontFamily: fonts.bold, fontSize: 12, lineHeight: 17, color: colors.plum },
  more: { minHeight: HIT + 6, borderRadius: radius.pill, backgroundColor: colors.plumSoft, alignItems: 'center', justifyContent: 'center' },
  moreText: { fontFamily: fonts.bold, fontSize: 15, lineHeight: 22, color: colors.plum },
  point: { flexDirection: 'row', gap: 10 },
  dot: { width: 7, height: 7, borderRadius: 2, marginTop: 8, backgroundColor: colors.muted },
});
