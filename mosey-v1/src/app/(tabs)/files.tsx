import { useRouter } from 'expo-router';
import { ChevronRight, FilePen, FilePlus, FileText, IdCard, ListChecks, ListFilter, LucideIcon, Plus, Search, X } from 'lucide-react-native';
import { useEffect, useRef, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { PolicyCard } from '@/components/PolicyCard';
import { MosaicStrip, ScreenTitle, Segmented, TAB_BAR_SPACE, useFocused } from '@/components/ui';
import { UploadCard } from '@/components/UploadCard';
import { PolicyType, TYPE_LABEL } from '@/lib/data';
import { DocKind, FileDoc, resolveDoc, seedDocuments } from '@/lib/documents';
import { useStore } from '@/lib/store';
import { colors, fonts, HIT, radius, shadow, space, type } from '@/lib/theme';

type Scope = 'mine' | 'shared' | 'documents';

export default function Files() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const focused = useFocused();
  const policies = useStore((s) => s.policies);
  const uploads = useStore((s) => s.uploads);
  const unseen = useStore((s) => s.unseenFiles);
  const markSeen = useStore((s) => s.markFilesSeen);
  const filter = useStore((s) => s.filesFilter) as PolicyType | null;
  const setFilter = useStore((s) => s.setFilesFilter);
  const [scope, setScope] = useState<Scope>('mine');
  const [query, setQuery] = useState('');
  const q = query.trim().toLowerCase();
  const [searchOpen, setSearchOpen] = useState(false);
  const scroller = useRef<ScrollView>(null);
  const searchInput = useRef<TextInput>(null);

  // Search stays out of the way until it's asked for. The header button brings
  // the field in with the keyboard up; it leaves again once it's empty and unfocused.
  const goToSearch = () => {
    setSearchOpen(true);
    scroller.current?.scrollTo({ y: 0, animated: true });
    searchInput.current?.focus();
  };

  // Looking at the list is what clears the "new file" badge.
  useEffect(() => {
    if (focused && unseen) markSeen();
  }, [focused, unseen, markSeen]);

  const mine = policies.filter((p) => !p.sharedBy);
  const shared = policies.filter((p) => p.sharedBy);
  // The type filter applies to your own policies only.
  const filtering = scope === 'mine' && filter !== null && mine.some((p) => p.type === filter);
  const hit = (...fields: (string | undefined)[]) => !q || fields.some((f) => f?.toLowerCase().includes(q));
  const list = (scope === 'shared' ? shared : filtering ? mine.filter((p) => p.type === filter) : mine).filter((p) =>
    hit(p.title, p.carrier, p.policyholder, p.number, TYPE_LABEL[p.type]),
  );

  // Supporting documents: ID cards, declarations, endorsements. Not policies.
  const docs = seedDocuments.filter((d) => hit(d.name, d.kind, policies.find((p) => p.id === d.policyId)?.title));
  const docKinds = [...new Set(docs.map((d) => d.kind))];
  const count = scope === 'documents' ? docs.length : list.length;

  // One section per policy type, in the order the types first appear.
  const groups = [...new Set(list.map((p) => p.type))];

  // Nothing uploaded at all yet: the add action moves to the middle of the screen.
  const empty = policies.length === 0 && uploads.length === 0;

  if (empty) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.bg }}>
        <ScreenTitle title="Files" />
        <View style={[styles.blank, { paddingBottom: TAB_BAR_SPACE + insets.bottom }]}>
          <MosaicStrip count={5} size={14} gap={5} style={{ width: 110 }} />
          <Text style={[type.h2, { textAlign: 'center' }]}>No policies yet</Text>
          <Text style={[type.body, { textAlign: 'center' }]}>
            Add your first policy and Moe will read it, sum it up and flag anything worth knowing.
          </Text>
          <Pressable
            accessibilityRole="button"
            onPress={() => router.push('/upload')}
            style={({ pressed }) => [styles.blankButton, pressed && { opacity: 0.85 }]}
          >
            <Plus size={20} color="#fff" strokeWidth={2.8} />
            <Text style={styles.blankButtonText}>Add a policy</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <ScreenTitle
        title="Files"
        right={
          <View style={styles.actions}>
            {/* Filter and search share one pill, split by a rule. */}
            <View style={styles.joined}>
              {scope === 'mine' ? (
                <>
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel={filtering ? `Filter: showing ${TYPE_LABEL[filter!]}` : 'Filter by policy type'}
                    onPress={() => router.push('/files-filter')}
                    style={({ pressed }) => [styles.half, filtering && styles.halfOn, pressed && { opacity: 0.7 }]}
                  >
                    <ListFilter size={20} color={filtering ? '#fff' : colors.ink} strokeWidth={2.4} />
                  </Pressable>
                  <View style={styles.rule} />
                </>
              ) : null}
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Search files"
                onPress={goToSearch}
                style={({ pressed }) => [scope === 'mine' ? styles.half : styles.alone, pressed && { opacity: 0.7 }]}
              >
                <Search size={20} color={colors.ink} strokeWidth={2.4} />
              </Pressable>
            </View>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Add a policy"
              onPress={() => router.push('/upload')}
              style={({ pressed }) => [styles.addButton, pressed && { opacity: 0.8 }]}
            >
              <Plus size={18} color="#fff" strokeWidth={2.8} />
              <Text style={styles.addButtonText}>Add</Text>
            </Pressable>
          </View>
        }
      />
      <ScrollView
        ref={scroller}
        contentContainerStyle={{ paddingHorizontal: space.xl, paddingBottom: TAB_BAR_SPACE + insets.bottom }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {searchOpen || query ? (
        <View style={styles.search}>
          <Search size={18} color={colors.muted} strokeWidth={2.4} />
          <TextInput
            ref={searchInput}
            autoFocus
            onBlur={() => {
              if (!query.trim()) setSearchOpen(false);
            }}
            value={query}
            onChangeText={setQuery}
            placeholder="Search policies and documents"
            placeholderTextColor={colors.muted}
            returnKeyType="search"
            autoCorrect={false}
            accessibilityLabel="Search files"
            style={styles.searchInput}
          />
          {query ? (
            <Pressable accessibilityRole="button" accessibilityLabel="Clear search" onPress={() => setQuery('')} hitSlop={8}>
              <X size={18} color={colors.muted} strokeWidth={2.4} />
            </Pressable>
          ) : null}
        </View>
        ) : null}

        <Segmented
          value={scope}
          onChange={setScope}
          options={[
            { value: 'mine', label: 'Policies' },
            { value: 'shared', label: 'Shared with Me' },
            { value: 'documents', label: 'Documents' },
          ]}
        />

        {/* Only when a type filter is narrowing the list. */}
        {filtering ? (
          <View style={styles.showing}>
            <Text style={[type.body, { flex: 1 }]} numberOfLines={1}>
              Showing <Text style={{ fontFamily: fonts.bold, color: colors.ink }}>{TYPE_LABEL[filter!]}</Text>
            </Text>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Clear filter"
              onPress={() => setFilter(null)}
              style={({ pressed }) => [styles.clear, pressed && { opacity: 0.7 }]}
            >
              <X size={14} color={colors.plum} strokeWidth={2.8} />
              <Text style={styles.clearText}>Clear</Text>
            </Pressable>
          </View>
        ) : (
          <View style={{ height: space.lg }} />
        )}

        {scope === 'mine' && !q ? uploads.map((u) => <UploadCard key={u.id} upload={u} paused={!focused} />) : null}

        {scope === 'documents'
          ? docKinds.map((kind) => (
              <View key={kind}>
                <Text style={styles.groupLabel} accessibilityRole="header">
                  {kind}
                </Text>
                {docs
                  .filter((d) => d.kind === kind)
                  .map((d) => (
                    <DocumentCard key={d.id} doc={d} />
                  ))}
              </View>
            ))
          : groups.map((type) => (
              <View key={type}>
                <Text style={styles.groupLabel} accessibilityRole="header">
                  {TYPE_LABEL[type]}
                </Text>
                {list
                  .filter((p) => p.type === type)
                  .map((p) => (
                    <PolicyCard key={p.id} policy={p} />
                  ))}
              </View>
            ))}

        {count === 0 ? (
          <View style={styles.empty}>
            <Text style={type.h3}>{q ? 'No matches' : scope === 'shared' ? 'Nothing shared yet' : 'Nothing here yet'}</Text>
            <Text style={[type.body, { textAlign: 'center' }]}>
              {q
                ? `Nothing in this view matches “${query.trim()}”.`
                : scope === 'shared'
                  ? 'When someone shares a policy with you, it lands here.'
                  : 'Add a file and it will show up here.'}
            </Text>
          </View>
        ) : null}
      </ScrollView>
    </View>
  );
}

const DOC_ICON: Record<DocKind, LucideIcon> = {
  'ID card': IdCard,
  Declarations: FileText,
  Endorsement: FilePlus,
  Schedule: ListChecks,
  Form: FilePen,
};

/** A supporting document in the list. Opens its preview. */
function DocumentCard({ doc }: { doc: FileDoc }) {
  const router = useRouter();
  const policies = useStore((s) => s.policies);
  const { policy } = resolveDoc(doc, policies);
  const Icon = DOC_ICON[doc.kind];
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${doc.name}, ${doc.kind}. Open preview.`}
      onPress={() => router.push({ pathname: '/document', params: { id: doc.id } })}
      style={({ pressed }) => [styles.doc, pressed && { opacity: 0.85 }]}
    >
      <View style={styles.docIcon}>
        <Icon size={22} color={colors.plum} strokeWidth={2} />
      </View>
      <View style={{ flex: 1, gap: 2 }}>
        <Text style={type.h3} numberOfLines={2}>
          {doc.name}
        </Text>
        <Text style={type.small} numberOfLines={1}>
          {policy?.title ?? 'Unknown policy'}
        </Text>
      </View>
      <ChevronRight size={20} color={colors.inkSoft} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  actions: { flexDirection: 'row', alignItems: 'center', gap: space.sm },
  joined: {
    flexDirection: 'row',
    alignItems: 'center',
    height: HIT,
    borderRadius: HIT / 2,
    backgroundColor: colors.surface,
    overflow: 'hidden',
    ...shadow,
  },
  half: { width: HIT + 4, height: HIT, alignItems: 'center', justifyContent: 'center' },
  // On its own (no filter beside it) the search button is a true circle.
  alone: { width: HIT, height: HIT, alignItems: 'center', justifyContent: 'center' },
  halfOn: { backgroundColor: colors.plum },
  rule: { width: 1, height: 22, backgroundColor: colors.line },
  search: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.sm,
    minHeight: 48,
    paddingHorizontal: space.lg,
    borderRadius: radius.pill,
    backgroundColor: colors.surface,
    marginBottom: space.md,
    ...shadow,
  },
  searchInput: { flex: 1, fontFamily: fonts.body, fontSize: 16, color: colors.ink, paddingVertical: 0 },
  showing: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.sm,
    minHeight: HIT,
    marginVertical: space.md,
  },
  doc: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.md,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: space.lg,
    marginBottom: space.md,
    ...shadow,
  },
  docIcon: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: colors.plumSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  clear: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    minHeight: HIT,
    paddingHorizontal: 12,
    borderRadius: radius.pill,
    backgroundColor: colors.plumSoft,
  },
  clearText: { fontFamily: fonts.bold, fontSize: 13, lineHeight: 19, color: colors.plum },
  groupLabel: { ...type.label, marginTop: space.sm, marginBottom: space.sm },
  empty: { alignItems: 'center', gap: 6, paddingVertical: 48, paddingHorizontal: space.xl },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    minHeight: HIT,
    paddingLeft: 14,
    paddingRight: 18,
    borderRadius: radius.pill,
    backgroundColor: colors.plum,
  },
  addButtonText: { fontFamily: fonts.bold, fontSize: 15, lineHeight: 22, color: '#fff' },
  blank: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: space.md, paddingHorizontal: space.xxl },
  blankButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    minHeight: 54,
    paddingHorizontal: 26,
    borderRadius: radius.pill,
    backgroundColor: colors.plum,
    marginTop: space.sm,
  },
  blankButtonText: { fontFamily: fonts.bold, fontSize: 16, lineHeight: 23, color: '#fff' },
});
