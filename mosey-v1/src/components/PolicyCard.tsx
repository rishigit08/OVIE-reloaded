import { useRouter } from 'expo-router';
import { ChevronRight, Users } from 'lucide-react-native';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { maskNumber, Policy, shortDate, TYPE_LABEL } from '@/lib/data';
import { colors, fonts, radius, space, type } from '@/lib/theme';

import { PolicyTile } from './PolicyTile';
import { Card, StatusPill } from './ui';

export function PolicyCard({ policy }: { policy: Policy }) {
  const router = useRouter();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${policy.title}, ${policy.carrier}`}
      onPress={() => router.push(`/policy/${policy.id}`)}
      style={({ pressed }) => pressed && { opacity: 0.85 }}
    >
      <Card style={styles.card}>
        <View style={styles.top}>
          <PolicyTile type={policy.type} size={56} dim={policy.status === 'expired'} />
          <View style={{ flex: 1 }}>
            <Text style={type.h3} numberOfLines={2}>
              {policy.title}
            </Text>
            <Text style={type.small} numberOfLines={1}>
              {policy.carrier}
            </Text>
          </View>
          <ChevronRight size={20} color={colors.muted} />
        </View>
        <View style={styles.meta}>
          <View style={styles.tag}>
            <Text style={styles.tagText}>{TYPE_LABEL[policy.type]}</Text>
          </View>
          <StatusPill policy={policy} />
          <Text style={[type.small, { marginLeft: 'auto' }]}>{maskNumber(policy.number)}</Text>
        </View>
        <View style={styles.foot}>
          {policy.sharedBy ? (
            <View style={styles.shared}>
              <Users size={14} color={colors.inkSoft} />
              <Text style={[type.small, { color: colors.inkSoft }]}>Shared by {policy.sharedBy}</Text>
            </View>
          ) : (
            <Text style={type.small}>Uploaded {shortDate(policy.uploadedAt)}</Text>
          )}
        </View>
      </Card>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: { marginBottom: space.md },
  top: { flexDirection: 'row', alignItems: 'center', gap: space.md },
  meta: { flexDirection: 'row', alignItems: 'center', gap: space.sm, marginTop: space.md },
  tag: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: radius.pill, backgroundColor: colors.sunken },
  tagText: { fontFamily: fonts.bold, fontSize: 12, lineHeight: 17, color: colors.inkSoft },
  foot: { marginTop: space.md, paddingTop: space.md - StyleSheet.hairlineWidth, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.line },
  shared: { flexDirection: 'row', alignItems: 'center', gap: 6 },
});
