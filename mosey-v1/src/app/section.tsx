import { useLocalSearchParams } from 'expo-router';
import { ArrowLeft, FileText } from 'lucide-react-native';
import { useState } from 'react';
import { Linking, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { KIND_STYLE, SEVERITY } from '@/components/PolicyDetails';
import { SourceDetails } from '@/components/SourceDetails';
import { IconButton, SheetClose, Skeleton, useGoBack } from '@/components/ui';
import { coverageMeta, findSection, KIND_LABEL, Section } from '@/lib/details';
import { useStore } from '@/lib/store';
import { colors, fonts, radius, space, type } from '@/lib/theme';

/** One section of a policy summary in full, with the passage it was read from. */
export default function SectionSheet() {
  const { policy: policyId, section: sectionId } = useLocalSearchParams<{ policy: string; section: string }>();
  const insets = useSafeAreaInsets();
  const close = useGoBack('/files');
  const policy = useStore((s) => s.policies.find((p) => p.id === policyId));
  const section = policy ? findSection(policy, sectionId) : undefined;
  const [inDocument, setInDocument] = useState(false);

  if (!policy || !section) {
    return (
      <View style={styles.sheet}>
        <View style={styles.header}>
          <Text style={[type.h2, { flex: 1 }]}>Not found</Text>
          <SheetClose onPress={close} />
        </View>
      </View>
    );
  }

  const tone = KIND_STYLE[section.kind];
  const document = policy.documents.find((d) => d.name === section.cite.doc);
  const pages = document?.pages ?? section.cite.page;
  const pageLabel = section.cite.pages.length > 1 ? `Pages ${section.cite.pages.join(', ')}` : `Page ${section.cite.page}`;

  return (
    <ScrollView style={{ flex: 1 }} contentContainerStyle={[styles.sheet, { paddingBottom: insets.bottom + space.xl }]}>
      <View style={styles.header}>
        {inDocument ? <IconButton icon={ArrowLeft} label="Back to summary" onPress={() => setInDocument(false)} /> : null}
        <Text style={[type.h2, { flex: 1 }]} numberOfLines={2}>
          {inDocument ? 'In the document' : section.title}
        </Text>
        <SheetClose onPress={close} />
      </View>

      {inDocument ? (
        <DocumentPage section={section} pages={pages} />
      ) : (
        <>
          <View style={[styles.kind, { backgroundColor: tone.bg }]}>
            <Text style={[styles.kindText, { color: tone.ink }]}>{KIND_LABEL[section.kind]}</Text>
          </View>
          {section.severity ? (
            <View style={[styles.kind, { backgroundColor: SEVERITY[section.severity].bg, marginTop: 6 }]}>
              <Text style={[styles.kindText, { color: SEVERITY[section.severity].ink }]}>{section.severity}</Text>
            </View>
          ) : null}
          {section.group ? <Text style={[type.small, { marginTop: space.sm }]}>{section.group}</Text> : null}

          {coverageMeta(section).map((m) => (
            <Text key={m} style={styles.meta}>
              {m}
            </Text>
          ))}

          <View style={styles.points}>
            {section.points.map((p) => (
              <View key={p} style={styles.point}>
                <View style={[styles.dot, { backgroundColor: tone.ink }]} />
                <Text style={styles.pointText}>{p}</Text>
              </View>
            ))}
          </View>

          <Text style={[type.label, { marginTop: space.xl, marginBottom: space.sm }]}>Where this comes from</Text>
          {section.source ? (
            <SourceDetails source={section.source} totalPages={document?.pages} />
          ) : (
            <Text style={type.body}>
              {pageLabel} · {section.cite.heading}
            </Text>
          )}

          <Pressable
            accessibilityRole="button"
            onPress={() =>
              document?.url ? Linking.openURL(`${document.url}#page=${section.cite.page}`) : setInDocument(true)
            }
            style={({ pressed }) => [styles.button, pressed && { opacity: 0.85 }]}
          >
            <Text style={styles.buttonText}>View in document</Text>
          </Pressable>
          <Text style={styles.note}>This summary is in plain words. The policy wording is what counts.</Text>
        </>
      )}
    </ScrollView>
  );
}

/** A stand-in for the real page: the cited passage highlighted among placeholder lines. */
function DocumentPage({ section, pages }: { section: Section; pages: number }) {
  return (
    <>
      <Text style={type.small} numberOfLines={1} ellipsizeMode="middle">
        {section.cite.doc} · Page {section.cite.page} of {pages}
      </Text>
      <View style={styles.page}>
        <Skeleton width="55%" height={10} />
        <Skeleton width="100%" height={8} style={{ marginTop: 14 }} />
        <Skeleton width="92%" height={8} style={{ marginTop: 8 }} />
        <Skeleton width="97%" height={8} style={{ marginTop: 8 }} />

        <Text style={styles.pageHeading}>{section.cite.heading.toUpperCase()}</Text>
        <Text style={styles.pageText}>
          <Text style={styles.highlight}>{section.points.join(' ')}</Text>
        </Text>

        <Skeleton width="100%" height={8} style={{ marginTop: 18 }} />
        <Skeleton width="88%" height={8} style={{ marginTop: 8 }} />
        <Skeleton width="95%" height={8} style={{ marginTop: 8 }} />
        <Skeleton width="60%" height={8} style={{ marginTop: 8 }} />
      </View>
      <Text style={styles.note}>Prototype: this is a mock page. The real app would open the PDF at this passage.</Text>
    </>
  );
}

const styles = StyleSheet.create({
  sheet: { paddingHorizontal: space.xl, paddingTop: space.xl, backgroundColor: colors.surface, flexGrow: 1 },
  header: { flexDirection: 'row', alignItems: 'center', gap: space.xs, marginBottom: space.sm },
  kind: { alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 4, borderRadius: radius.pill },
  kindText: { fontFamily: fonts.bold, fontSize: 12, lineHeight: 17 },
  meta: { fontFamily: fonts.semi, fontSize: 14, lineHeight: 20, color: colors.ink, marginTop: space.sm },
  points: { gap: 12, marginTop: space.lg },
  point: { flexDirection: 'row', gap: 12 },
  dot: { width: 8, height: 8, borderRadius: 2, marginTop: 8 },
  pointText: { flex: 1, fontFamily: fonts.medium, fontSize: 16, lineHeight: 23, color: colors.ink },
  source: { backgroundColor: colors.bg, borderRadius: radius.md, padding: space.lg },
  sourceHead: { flexDirection: 'row', alignItems: 'center', gap: space.md },
  sourcePage: { fontFamily: fonts.bold, fontSize: 15, lineHeight: 22, color: colors.plum },
  excerpt: {
    fontFamily: fonts.body,
    fontSize: 14,
    lineHeight: 21,
    color: colors.inkSoft,
    marginTop: space.md,
    paddingLeft: space.md,
    borderLeftWidth: 3,
    borderLeftColor: colors.line,
  },
  button: {
    minHeight: 54,
    borderRadius: radius.pill,
    backgroundColor: colors.plum,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: space.lg,
  },
  buttonText: { fontFamily: fonts.bold, fontSize: 16, lineHeight: 23, color: '#fff' },
  note: { fontFamily: fonts.body, fontSize: 12, lineHeight: 17, color: colors.muted, textAlign: 'center', marginTop: space.md },
  page: {
    marginTop: space.md,
    backgroundColor: '#FFFDF8',
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: radius.sm,
    padding: space.xl,
  },
  pageHeading: { fontFamily: fonts.bold, fontSize: 12, lineHeight: 17, letterSpacing: 0.8, color: colors.ink, marginTop: 20, marginBottom: 8 },
  pageText: { fontFamily: fonts.body, fontSize: 14, lineHeight: 22, color: colors.ink },
  entry: { marginTop: space.md, gap: 2 },
  entryLabel: { fontFamily: fonts.bold, fontSize: 12, lineHeight: 17, color: colors.muted },
  entryValue: { fontFamily: fonts.body, fontSize: 14, lineHeight: 20, color: colors.ink },
  highlight: { backgroundColor: '#FFE9A8' },
});
