import { useLocalSearchParams } from 'expo-router';
import { ExternalLink } from 'lucide-react-native';
import { Linking, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { SourceDetails } from '@/components/SourceDetails';
import { BackHeader, useGoBack } from '@/components/ui';
import { shortDate } from '@/lib/data';
import { resolveDoc, seedDocuments } from '@/lib/documents';
import { useStore } from '@/lib/store';
import { colors, fonts, radius, space, type } from '@/lib/theme';

/** Preview of a supporting document: an ID card, a declarations page, an endorsement. */
export default function DocumentPreview() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const goBack = useGoBack('/files');
  const policies = useStore((s) => s.policies);
  const doc = seedDocuments.find((d) => d.id === id);

  if (!doc) {
    return (
      <View style={{ flex: 1 }}>
        <BackHeader onBack={goBack} />
        <Text style={[type.body, { textAlign: 'center', marginTop: 80 }]}>That document isn’t here anymore.</Text>
      </View>
    );
  }

  const { policy, source, url, totalPages } = resolveDoc(doc, policies);

  return (
    <View style={{ flex: 1 }}>
      <BackHeader title={doc.kind} onBack={goBack} />
      <ScrollView
        contentContainerStyle={{ paddingHorizontal: space.xl, paddingBottom: insets.bottom + space.xxl }}
        showsVerticalScrollIndicator={false}
      >
        <Text style={[type.h2, { marginTop: space.sm }]}>{doc.name}</Text>
        <Text style={[type.small, { marginTop: 4 }]}>
          {policy?.title ?? 'Unknown policy'} · Added {shortDate(doc.addedAt)}
        </Text>

        {/* The page itself. A real build would render the PDF here. */}
        <View style={styles.page}>
          <Text style={styles.kind}>{doc.kind.toUpperCase()}</Text>
          {source ? <SourceDetails source={source} totalPages={totalPages} /> : null}
          {doc.entries?.map(([label, value], i) => (
            <View key={label} style={[styles.entry, i > 0 && styles.entryBorder]}>
              <Text style={type.small}>{label}</Text>
              <Text style={type.bodyInk}>{value}</Text>
            </View>
          ))}
        </View>

        {doc.note ? <Text style={styles.note}>{doc.note}</Text> : null}

        {url ? (
          <Pressable
            accessibilityRole="link"
            onPress={() => Linking.openURL(url)}
            style={({ pressed }) => [styles.button, pressed && { opacity: 0.85 }]}
          >
            <Text style={styles.buttonText}>Open sample PDF</Text>
            <ExternalLink size={18} color="#fff" />
          </Pressable>
        ) : (
          <Text style={styles.note}>Prototype preview. There’s no sample file to open for this one.</Text>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  page: {
    marginTop: space.lg,
    backgroundColor: '#FFFDF8',
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: radius.sm,
    padding: space.xl,
  },
  kind: { fontFamily: fonts.bold, fontSize: 12, lineHeight: 17, letterSpacing: 0.8, color: colors.muted, marginBottom: space.md },
  entry: { paddingVertical: space.md, gap: 2 },
  entryBorder: {
    paddingTop: space.md - StyleSheet.hairlineWidth,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.line,
  },
  note: { fontFamily: fonts.body, fontSize: 12, lineHeight: 17, color: colors.muted, textAlign: 'center', marginTop: space.md },
  button: {
    minHeight: 54,
    borderRadius: radius.pill,
    backgroundColor: colors.plum,
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: space.lg,
  },
  buttonText: { fontFamily: fonts.bold, fontSize: 16, lineHeight: 23, color: '#fff' },
});
