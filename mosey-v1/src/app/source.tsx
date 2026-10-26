import { useLocalSearchParams } from 'expo-router';
import { Linking, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { SourceDetails } from '@/components/SourceDetails';
import { SheetClose, useGoBack } from '@/components/ui';
import { useStore } from '@/lib/store';
import { colors, fonts, radius, space, type } from '@/lib/theme';

/** The full details behind one fact on a policy: a driver, a vehicle, a coverage. */
export default function SourceSheet() {
  const { policy: policyId, source: sourceId } = useLocalSearchParams<{ policy: string; source: string }>();
  const insets = useSafeAreaInsets();
  const close = useGoBack('/files');
  const policy = useStore((s) => s.policies.find((p) => p.id === policyId));
  const source = policy?.sources.find((s) => s.id === sourceId);
  const file = policy?.documents[0];

  return (
    <ScrollView style={{ flex: 1 }} contentContainerStyle={[styles.sheet, { paddingBottom: insets.bottom + space.xl }]}>
      <View style={styles.header}>
        <Text style={[type.h2, { flex: 1 }]}>{source?.title ?? 'Not found'}</Text>
        <SheetClose onPress={close} />
      </View>

      {source ? (
        <>
          <SourceDetails source={source} totalPages={file?.pages} />
          {file?.url ? (
            <Pressable
              accessibilityRole="link"
              onPress={() => Linking.openURL(`${file.url}#page=${source.pages[0]}`)}
              style={({ pressed }) => [styles.button, pressed && { opacity: 0.85 }]}
            >
              <Text style={styles.buttonText}>View in document</Text>
            </Pressable>
          ) : (
            <Text style={styles.note}>There’s no sample file for this policy, so the document view isn’t available.</Text>
          )}
        </>
      ) : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  sheet: { paddingHorizontal: space.xl, paddingTop: space.xl, backgroundColor: colors.surface, flexGrow: 1 },
  header: { flexDirection: 'row', alignItems: 'center', gap: space.xs, marginBottom: space.lg },
  button: {
    minHeight: 54,
    borderRadius: radius.pill,
    backgroundColor: colors.plum,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: space.lg,
  },
  buttonText: { fontFamily: fonts.bold, fontSize: 16, lineHeight: 23, color: '#fff' },
  note: { fontFamily: fonts.body, fontSize: 12, lineHeight: 17, color: colors.muted, textAlign: 'center', marginTop: space.lg },
});
