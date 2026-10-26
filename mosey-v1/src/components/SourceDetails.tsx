import { StyleSheet, Text, View } from 'react-native';

import type { Source } from '@/lib/data';
import { colors, fonts, radius, space, type } from '@/lib/theme';

/**
 * Where a statement was read from, in full: the passage, its PDF pages, the
 * form it sits on, the facts read off it and any verbatim excerpt.
 */
export function SourceDetails({ source, totalPages }: { source: Source; totalPages?: number }) {
  const pages = `PDF page${source.pages.length > 1 ? 's' : ''} ${source.pages.join(', ')}${totalPages ? ` of ${totalPages}` : ''}`;
  const entries = source.entries ?? [];
  return (
    <View>
      <Text style={styles.where}>
        {source.title} · {pages}
      </Text>
      {source.form ? <Text style={[type.body, { marginTop: space.sm }]}>Form reference: {source.form}</Text> : null}

      {entries.length > 0 || source.excerpt ? (
        <View style={styles.box}>
          {entries.map(([label, value], i) => (
            <View key={`${label}-${i}`} style={[styles.entry, i > 0 && styles.entryBorder]}>
              <Text style={styles.label}>{label}</Text>
              <Text style={type.body}>{value}</Text>
            </View>
          ))}
          {source.excerpt ? (
            <View style={[styles.entry, entries.length > 0 && styles.entryBorder]}>
              <Text style={styles.label}>Policy wording</Text>
              <Text style={styles.excerpt}>{source.excerpt}</Text>
            </View>
          ) : null}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  where: { fontFamily: fonts.bold, fontSize: 15, lineHeight: 21, color: colors.plum },
  box: { backgroundColor: colors.bg, borderRadius: radius.md, paddingHorizontal: space.lg, marginTop: space.lg },
  entry: { paddingVertical: space.md, gap: 2 },
  // Padding gives back what the hairline adds, so the row stays a whole number tall.
  entryBorder: {
    paddingTop: space.md - StyleSheet.hairlineWidth,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.line,
  },
  label: { fontFamily: fonts.bold, fontSize: 15, lineHeight: 21, color: colors.ink },
  excerpt: { fontFamily: fonts.body, fontSize: 14, lineHeight: 21, color: colors.inkSoft, fontStyle: 'italic' },
});
