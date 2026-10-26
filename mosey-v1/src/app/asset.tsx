import { useLocalSearchParams } from 'expo-router';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { CoverageRows, scheduleSummary } from '@/components/PolicyContext';
import { SheetClose, useGoBack } from '@/components/ui';
import { useStore } from '@/lib/store';
import { colors, fonts, space, type } from '@/lib/theme';

/** One entity on a policy (a vehicle, a building, an underlying policy) and its full schedule. */
export default function AssetSheet() {
  const { policy: policyId, asset: assetId } = useLocalSearchParams<{ policy: string; asset: string }>();
  const insets = useSafeAreaInsets();
  const close = useGoBack('/files');
  const policy = useStore((s) => s.policies.find((p) => p.id === policyId));
  const asset = policy?.assets.find((a) => a.id === assetId);

  return (
    <ScrollView style={{ flex: 1 }} contentContainerStyle={[styles.sheet, { paddingBottom: insets.bottom + space.xl }]}>
      <View style={styles.header}>
        <View style={{ flex: 1, gap: 2 }}>
          {asset ? <Text style={styles.kind}>{asset.kind}</Text> : null}
          <Text style={type.h2}>{asset?.name ?? 'Not found'}</Text>
        </View>
        <SheetClose onPress={close} />
      </View>

      {asset ? (
        <>
          {asset.facts.map(([label, value]) => (
            <View key={label} style={styles.fact}>
              <Text style={[type.small, { flexBasis: '38%' }]}>{label}</Text>
              <Text style={[type.bodyInk, { flex: 1, textAlign: 'right' }]}>{value}</Text>
            </View>
          ))}
          <Text style={[type.label, { marginTop: space.xl }]}>{scheduleSummary(asset)}</Text>
          <View style={{ gap: space.md, marginTop: space.md }}>
            <CoverageRows asset={asset} policyId={policy!.id} />
          </View>
        </>
      ) : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  sheet: { paddingHorizontal: space.xl, paddingTop: space.xl, backgroundColor: colors.surface, flexGrow: 1 },
  header: { flexDirection: 'row', alignItems: 'flex-start', gap: space.xs, marginBottom: space.md },
  kind: { fontFamily: fonts.bold, fontSize: 12, lineHeight: 17, color: colors.plum },
  fact: { flexDirection: 'row', gap: space.md, alignItems: 'flex-start', paddingVertical: 6 },
});
