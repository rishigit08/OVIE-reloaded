import { Lock } from 'lucide-react-native';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BackHeader, Card, MosaicStrip, SectionLabel, useGoBack } from '@/components/ui';
import { money, profile } from '@/lib/data';
import { useStore } from '@/lib/store';
import { colors, fonts, HIT, radius, space, type } from '@/lib/theme';

export default function Profile() {
  const goBack = useGoBack();
  const insets = useSafeAreaInsets();
  const policies = useStore((s) => s.policies);
  const chats = useStore((s) => s.chats);
  const [first, setFirst] = useState(profile.firstName);
  const [last, setLast] = useState(profile.lastName);
  const [dob, setDob] = useState(profile.dob);
  const [state, setState] = useState(profile.state);

  const own = policies.filter((p) => !p.sharedBy);
  const perYear = own.filter((p) => p.status !== 'expired').reduce((s, p) => s + p.premium, 0);

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <BackHeader title="Profile" onBack={goBack} />
      <ScrollView
        contentContainerStyle={{ paddingHorizontal: space.xl, paddingBottom: insets.bottom + space.xxl }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.top}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {(first[0] ?? '').toUpperCase()}
              {(last[0] ?? '').toUpperCase()}
            </Text>
          </View>
          <Text style={type.h2}>
            {first} {last}
          </Text>
          <Text style={type.small}>Member {profile.memberId}</Text>
          <MosaicStrip count={9} size={8} style={{ width: 120, marginTop: space.sm }} />
        </View>

        <View style={styles.stats}>
          <Stat value={String(own.length)} label="Policies" />
          <Stat value={money(perYear, true)} label="Per year" />
          <Stat value={String(chats.filter((c) => c.messages.length).length)} label="Chats with Moe" />
        </View>

        <SectionLabel>About you</SectionLabel>
        <Card style={{ gap: space.lg }}>
          <Field label="First name" value={first} onChangeText={setFirst} />
          <Field label="Last name" value={last} onChangeText={setLast} />
          <Field label="Date of birth" value={dob} onChangeText={setDob} />
          <Field label="State" value={state} onChangeText={setState} />
        </Card>

        <SectionLabel>Sign-in details</SectionLabel>
        <Card style={{ gap: space.lg }}>
          <Field label="Email" value={profile.email} locked />
          <Field label="Phone" value={profile.phone} locked />
          <Field label="Country" value={profile.country} locked />
        </Card>
        <Text style={[type.small, { marginTop: space.md, textAlign: 'center' }]}>
          Prototype: edits here aren’t saved between launches.
        </Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <Card style={styles.stat}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={type.small}>{label}</Text>
    </Card>
  );
}

function Field({
  label,
  value,
  onChangeText,
  locked = false,
}: {
  label: string;
  value: string;
  onChangeText?: (v: string) => void;
  locked?: boolean;
}) {
  return (
    <View>
      <Text style={styles.fieldLabel}>{label}</Text>
      <View style={[styles.field, locked && { backgroundColor: colors.sunken }]}>
        <TextInput
          value={value}
          onChangeText={onChangeText}
          editable={!locked}
          style={[styles.fieldInput, locked && { color: colors.inkSoft }]}
          accessibilityLabel={label}
        />
        {locked ? <Lock size={16} color={colors.muted} /> : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  top: { alignItems: 'center', gap: 4, marginTop: space.md },
  avatar: {
    width: 96,
    height: 96,
    borderRadius: 34,
    backgroundColor: colors.plum,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: space.sm,
  },
  avatarText: { fontFamily: fonts.display, fontSize: 34, lineHeight: 49, color: '#fff' },
  stats: { flexDirection: 'row', gap: space.sm, marginTop: space.xl },
  stat: { flex: 1, padding: space.md, alignItems: 'center', gap: 2 },
  statValue: { fontFamily: fonts.display, fontSize: 24, lineHeight: 28, color: colors.ink },
  fieldLabel: { fontFamily: fonts.semi, fontSize: 13, lineHeight: 19, color: colors.inkSoft, marginBottom: 6 },
  field: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.sm,
    minHeight: 50,
    borderRadius: radius.md,
    backgroundColor: colors.bg,
    paddingHorizontal: space.lg,
  },
  fieldInput: { flex: 1, fontFamily: fonts.medium, fontSize: 16, lineHeight: 23, color: colors.ink, minHeight: HIT },
});
