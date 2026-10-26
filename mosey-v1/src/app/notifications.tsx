import { useRouter } from 'expo-router';
import { Bell, CircleAlert, CircleCheck, Eye, LucideIcon, Sparkles, Upload } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BackHeader, Card, Segmented, useGoBack } from '@/components/ui';
import { Activity, stageFor, timeAgo, UPLOAD_STAGES, useStore } from '@/lib/store';
import { colors, fonts, HIT, radius, space, type } from '@/lib/theme';

type Pane = 'uploads' | 'insights';

const EMPTY: Record<Pane, { title: string; body: string }> = {
  uploads: { title: 'No upload news', body: 'Finished, read and failed uploads will show up here.' },
  insights: { title: 'Nothing new yet', body: 'New insights and watch points will show up here.' },
};

function look(item: Activity): { icon: LucideIcon; bg: string; ink: string } {
  if (item.kind === 'upload') {
    if (item.status === 'failed') return { icon: CircleAlert, bg: colors.gapBg, ink: colors.gapInk };
    if (item.status === 'read') return { icon: CircleCheck, bg: colors.goodBg, ink: colors.goodInk };
    return { icon: Upload, bg: colors.plumSoft, ink: colors.plum };
  }
  if (item.kind === 'watch') return { icon: Eye, bg: '#DCE9FF', ink: '#1F4FA8' };
  return { icon: Sparkles, bg: colors.plumSoft, ink: colors.plum };
}

/** Two panes: what happened to your uploads, and what Moe has newly found. */
export default function Notifications() {
  const goBack = useGoBack('/');
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const activity = useStore((s) => s.activity);
  const working = useStore((s) => s.uploads).filter((u) => u.status === 'working');
  const [pane, setPane] = useState<Pane>('uploads');
  const unseen = useStore((s) => s.unseenNotifications);
  const markSeen = useStore((s) => s.markNotificationsSeen);

  // Being here is what clears the bell's badge, including for uploads that finish while it's open.
  useEffect(() => {
    if (unseen) markSeen();
  }, [unseen, markSeen]);

  const items = activity.filter((a) => (pane === 'uploads' ? a.kind === 'upload' : a.kind !== 'upload'));

  return (
    <View style={{ flex: 1 }}>
      <BackHeader title="Notifications" onBack={goBack} />
      <ScrollView
        contentContainerStyle={{ paddingHorizontal: space.xl, paddingBottom: insets.bottom + space.xxl }}
        showsVerticalScrollIndicator={false}
      >
        <Segmented
          value={pane}
          onChange={setPane}
          options={[
            { value: 'uploads', label: 'Uploads' },
            { value: 'insights', label: 'Insights' },
          ]}
        />

        {/* Uploads still running lead the pane, with live progress. */}
        {pane === 'uploads' && working.length > 0 ? (
          <Card style={styles.list}>
            {working.map((u, i) => {
              const percent = Math.round(u.progress * 100);
              return (
                <View
                  key={u.id}
                  style={[styles.row, i > 0 && styles.rowBorder]}
                  accessibilityRole="progressbar"
                  accessibilityValue={{ min: 0, max: 100, now: percent }}
                >
                  <View style={[styles.icon, { backgroundColor: colors.plumSoft }]}>
                    <Upload size={18} color={colors.plum} strokeWidth={2.2} />
                  </View>
                  <View style={{ flex: 1, gap: 4 }}>
                    <Text style={type.bodyInk} numberOfLines={1} ellipsizeMode="middle">
                      Uploading {u.fileName}
                    </Text>
                    <View style={styles.track}>
                      <View style={[styles.fill, { width: `${percent}%` }]} />
                    </View>
                    <Text style={type.small}>
                      {UPLOAD_STAGES[stageFor(u.progress)].label} · {percent}%
                    </Text>
                  </View>
                </View>
              );
            })}
          </Card>
        ) : null}

        {items.length > 0 ? (
          <Card style={styles.list}>
            {items.map((item, i) => {
              const { icon: Icon, bg, ink } = look(item);
              return (
                <Pressable
                  key={item.id}
                  accessibilityRole={item.policyId ? 'button' : undefined}
                  disabled={!item.policyId}
                  onPress={() => router.push(`/policy/${item.policyId}`)}
                  style={({ pressed }) => [styles.row, i > 0 && styles.rowBorder, pressed && { opacity: 0.7 }]}
                >
                  <View style={[styles.icon, { backgroundColor: bg }]}>
                    <Icon size={18} color={ink} strokeWidth={2.2} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={type.bodyInk}>{item.text}</Text>
                    <Text style={type.small}>{timeAgo(item.at)}</Text>
                  </View>
                </Pressable>
              );
            })}
          </Card>
        ) : pane === 'uploads' && working.length > 0 ? null : (
          <View style={styles.empty}>
            <View style={styles.badge}>
              <Bell size={28} color={colors.plum} strokeWidth={2.2} />
            </View>
            <Text style={type.h3}>{EMPTY[pane].title}</Text>
            <Text style={[type.body, { textAlign: 'center' }]}>{EMPTY[pane].body}</Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  list: { paddingVertical: 4, marginTop: space.lg },
  row: { flexDirection: 'row', alignItems: 'center', gap: space.md, paddingVertical: space.md, minHeight: HIT + 20 },
  // Padding gives back what the hairline adds, so the row stays a whole number tall.
  rowBorder: {
    paddingTop: space.md - StyleSheet.hairlineWidth,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.line,
  },
  track: { height: 6, borderRadius: radius.pill, backgroundColor: colors.sunken, overflow: 'hidden' },
  fill: { height: 6, borderRadius: radius.pill, backgroundColor: colors.plum },
  icon: { width: 36, height: 36, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  empty: { alignItems: 'center', gap: space.sm, paddingHorizontal: space.xxl, paddingTop: 96 },
  badge: {
    width: 64,
    height: 64,
    borderRadius: 20,
    backgroundColor: colors.plumSoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: space.sm,
  },
});
