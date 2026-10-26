import { useLocalSearchParams } from 'expo-router';
import { ExternalLink, FileText } from 'lucide-react-native';
import { Linking, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { SheetClose, useGoBack } from '@/components/ui';
import { useStore } from '@/lib/store';
import { colors, space, type } from '@/lib/theme';

/** The files a policy was read from. Sample PDFs open where the client hosts one. */
export default function Documents() {
  const { policy: policyId } = useLocalSearchParams<{ policy: string }>();
  const insets = useSafeAreaInsets();
  const close = useGoBack('/files');
  const policy = useStore((s) => s.policies.find((p) => p.id === policyId));

  return (
    <ScrollView style={{ flex: 1 }} contentContainerStyle={[styles.sheet, { paddingBottom: insets.bottom + space.xl }]}>
      <View style={styles.header}>
        <Text style={[type.h2, { flex: 1 }]}>Documents</Text>
        <SheetClose onPress={close} />
      </View>
      {policy ? <Text style={type.small}>{policy.title}</Text> : null}

      {policy?.documents.map((d, i) => (
        <Pressable
          key={d.name}
          accessibilityRole={d.url ? 'link' : undefined}
          accessibilityLabel={d.url ? `Open sample file ${d.name}` : `${d.name}, no sample file`}
          disabled={!d.url}
          onPress={() => d.url && Linking.openURL(d.url)}
          style={[styles.row, i > 0 && styles.rowBorder]}
        >
          <FileText size={22} color={colors.plum} />
          <View style={{ flex: 1 }}>
            <Text style={type.bodyInk} numberOfLines={1} ellipsizeMode="middle">
              {d.name}
            </Text>
            <Text style={type.small}>{d.pages} pages{d.url ? '' : ' · no sample file'}</Text>
          </View>
          {d.url ? <ExternalLink size={18} color={colors.plum} /> : null}
        </Pressable>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  sheet: { paddingHorizontal: space.xl, paddingTop: space.xl, backgroundColor: colors.surface, flexGrow: 1 },
  header: { flexDirection: 'row', alignItems: 'center', gap: space.xs, marginBottom: space.xs },
  row: { flexDirection: 'row', alignItems: 'center', gap: space.md, minHeight: 64, paddingVertical: space.md },
  rowBorder: { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.line },
});
