import { Check } from 'lucide-react-native';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { PolicyTile } from '@/components/PolicyTile';
import { MosaicStrip, SheetClose, useGoBack } from '@/components/ui';
import { PolicyType, TYPE_LABEL } from '@/lib/data';
import { useStore } from '@/lib/store';
import { colors, fonts, radius, space, type } from '@/lib/theme';

/** Narrow the Files list to one type of policy. */
export default function FilesFilter() {
  const insets = useSafeAreaInsets();
  const close = useGoBack('/files');
  const policies = useStore((s) => s.policies);
  const filter = useStore((s) => s.filesFilter);
  const setFilter = useStore((s) => s.setFilesFilter);

  const mine = policies.filter((p) => !p.sharedBy);
  // Only the types you actually have, in the order they first appear.
  const kinds = [...new Set(mine.map((p) => p.type))];

  const choose = (next: PolicyType | null) => {
    setFilter(next);
    close();
  };

  return (
    <ScrollView style={{ flex: 1 }} contentContainerStyle={[styles.sheet, { paddingBottom: insets.bottom + space.xl }]}>
      <View style={styles.header}>
        <Text style={[type.h2, { flex: 1 }]}>Show</Text>
        <SheetClose onPress={close} />
      </View>

      <Row label="All policies" count={mine.length} on={filter === null} onPress={() => choose(null)}>
        <View style={styles.all}>
          <MosaicStrip count={3} size={9} gap={3} style={{ width: 30 }} />
        </View>
      </Row>
      {kinds.map((k) => (
        <Row
          key={k}
          label={TYPE_LABEL[k]}
          count={mine.filter((p) => p.type === k).length}
          on={filter === k}
          onPress={() => choose(k)}
        >
          <PolicyTile type={k} size={44} />
        </Row>
      ))}
    </ScrollView>
  );
}

function Row({
  label,
  count,
  on,
  onPress,
  children,
}: {
  label: string;
  count: number;
  on: boolean;
  onPress: () => void;
  children: React.ReactNode;
}) {
  return (
    <Pressable
      accessibilityRole="radio"
      accessibilityState={{ checked: on }}
      accessibilityLabel={`${label}, ${count}`}
      onPress={onPress}
      style={({ pressed }) => [styles.row, on && styles.rowOn, pressed && { opacity: 0.8 }]}
    >
      {children}
      <Text style={[type.h3, { flex: 1 }]}>{label}</Text>
      <Text style={styles.count}>{count}</Text>
      <View style={[styles.check, on && { backgroundColor: colors.plum, borderColor: colors.plum }]}>
        {on ? <Check size={14} color="#fff" strokeWidth={3} /> : null}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  sheet: { paddingHorizontal: space.xl, paddingTop: space.xl, backgroundColor: colors.surface },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: space.sm },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.md,
    minHeight: 64,
    paddingHorizontal: space.md,
    borderRadius: radius.md,
    backgroundColor: colors.bg,
    marginBottom: space.sm,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  rowOn: { borderColor: colors.plum, backgroundColor: colors.plumSoft },
  all: { width: 44, height: 44, borderRadius: 14, backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center' },
  count: { fontFamily: fonts.bold, fontSize: 14, lineHeight: 20, color: colors.muted },
  check: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.line,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
