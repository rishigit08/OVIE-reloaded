import * as DocumentPicker from 'expo-document-picker';
import { useRouter } from 'expo-router';
import * as Clipboard from 'expo-clipboard';
import { Camera, Check, ChevronRight, Cloud, Copy, FileText, Folder, HardDrive, Link, LucideIcon, Send, X } from 'lucide-react-native';
import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, Share, StyleSheet, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Moe } from '@/components/Moe';
import { IconButton, SheetClose, useGoBack } from '@/components/ui';
import { useStore } from '@/lib/store';
import { colors, fonts, HIT, radius, space, type } from '@/lib/theme';

const SAMPLE = 'baker-moving-insurance-2019.pdf';

// Cloud drives are simulated in the prototype: "connecting" waits a moment,
// then hands back a sample file as if you'd picked it there.
const DRIVES = {
  google: { name: 'Google Drive', icon: Cloud, file: 'Drive · renters-declarations-2026.pdf' },
  onedrive: { name: 'OneDrive', icon: HardDrive, file: 'OneDrive · auto-renewal-quote.pdf' },
} as const;
type Drive = keyof typeof DRIVES;

/** A made-up upload link; the real one would come from the backend. */
const UPLOAD_LINK = 'https://mosey.example/u/7kq2-x9fd';

export default function UploadSheet() {
  const router = useRouter();
  const close = useGoBack();
  const insets = useSafeAreaInsets();
  const startUpload = useStore((s) => s.startUpload);
  const busy = useStore((s) => s.uploads.some((u) => u.status === 'working'));
  const [connecting, setConnecting] = useState<Drive | null>(null);
  const [linkReady, setLinkReady] = useState(false);
  const [note, setNote] = useState('');
  const [copied, setCopied] = useState(false);
  const copiedTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
      if (copiedTimer.current) clearTimeout(copiedTimer.current);
    },
    [],
  );

  const begin = (fileName: string) => {
    startUpload(fileName);
    // One navigation, not back() then navigate(): on web the two race and leave
    // browser history out of step with the router.
    if (router.canGoBack()) router.dismissTo('/files');
    else router.replace('/files');
  };

  const pick = async () => {
    const result = await DocumentPicker.getDocumentAsync({
      type: ['application/pdf', 'image/*', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
      copyToCacheDirectory: false,
    });
    if (!result.canceled && result.assets[0]) begin(result.assets[0].name);
  };

  const connect = (drive: Drive) => {
    if (connecting) return;
    setConnecting(drive);
    timer.current = setTimeout(() => begin(DRIVES[drive].file), 1400);
  };

  const shareLink = () => {
    const lead = note.trim() || 'Upload my policy documents to Mosey here:';
    Share.share({ message: `${lead} ${UPLOAD_LINK}` }).catch(() => {});
  };

  const copyLink = async () => {
    await Clipboard.setStringAsync(UPLOAD_LINK);
    setCopied(true);
    if (copiedTimer.current) clearTimeout(copiedTimer.current);
    copiedTimer.current = setTimeout(() => setCopied(false), 1800);
  };

  const dismissLink = () => {
    setLinkReady(false);
    setNote('');
    setCopied(false);
  };

  return (
    <ScrollView
      style={{ flex: 1 }}
      contentContainerStyle={[styles.sheet, { paddingBottom: insets.bottom + space.xl }]}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
      automaticallyAdjustKeyboardInsets
    >
      <View style={styles.header}>
        <Text style={[type.h2, { flex: 1 }]}>Add a policy</Text>
        <SheetClose onPress={close} />
      </View>

      <View style={styles.moe}>
        <Moe size={64} mood="happy" />
        <View style={{ flex: 1 }}>
          <Text style={type.bodyInk}>
            {busy ? 'I’m still rolling one up, but hand me another!' : 'Hand me a policy and I’ll roll it up.'}
          </Text>
          <Text style={type.small}>PDF, DOC, PNG or JPG · up to 25 MB each</Text>
        </View>
      </View>

      <Text style={styles.group}>From this device</Text>
      <Option icon={Folder} title="Choose from files" body="Pick a document on this device" onPress={pick} />
      <Option
        icon={Camera}
        title="Scan with camera"
        body="Prototype: uses the sample policy"
        onPress={() => begin('scan-' + SAMPLE.replace('.pdf', '.jpg'))}
      />

      <Text style={styles.group}>From the cloud</Text>
      <View style={styles.drives}>
        {(Object.keys(DRIVES) as Drive[]).map((key) => {
          const drive = DRIVES[key];
          const Icon = drive.icon;
          const on = connecting === key;
          return (
            <Pressable
              key={key}
              accessibilityRole="button"
              accessibilityLabel={`Connect ${drive.name}`}
              accessibilityState={{ busy: on, disabled: !!connecting && !on }}
              disabled={!!connecting}
              onPress={() => connect(key)}
              style={({ pressed }) => [styles.drive, (pressed || on) && { backgroundColor: colors.plumSoft }, !!connecting && !on && { opacity: 0.5 }]}
            >
              <View style={styles.optionIcon}>
                {on ? <ActivityIndicator color={colors.plum} /> : <Icon size={22} color={colors.plum} strokeWidth={2.2} />}
              </View>
              <Text style={type.h3}>{drive.name}</Text>
              <Text style={type.small}>{on ? 'Connecting…' : 'Connect'}</Text>
            </Pressable>
          );
        })}
      </View>

      <Text style={styles.group}>From someone else</Text>
      {linkReady ? (
        <View style={styles.link}>
          <View style={styles.linkHead}>
            <View style={[styles.optionIcon, { backgroundColor: colors.goodBg }]}>
              <Check size={20} color={colors.goodInk} strokeWidth={2.8} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={type.h3}>Upload link ready</Text>
              <Text style={type.small}>Anyone with it can add documents for 7 days.</Text>
            </View>
            <IconButton icon={X} label="Dismiss upload link" onPress={dismissLink} tint={colors.muted} />
          </View>

          <View style={styles.url}>
            <Text style={styles.urlText} selectable numberOfLines={1} ellipsizeMode="middle">
              {UPLOAD_LINK}
            </Text>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={copied ? 'Link copied' : 'Copy link'}
              accessibilityLiveRegion="polite"
              onPress={copyLink}
              style={({ pressed }) => [styles.copy, copied && { backgroundColor: colors.goodBg }, pressed && { opacity: 0.7 }]}
            >
              {copied ? <Check size={16} color={colors.goodInk} strokeWidth={2.8} /> : <Copy size={16} color={colors.plum} strokeWidth={2.4} />}
              <Text style={[styles.copyText, copied && { color: colors.goodInk }]}>{copied ? 'Copied' : 'Copy'}</Text>
            </Pressable>
          </View>

          <TextInput
            value={note}
            onChangeText={setNote}
            placeholder="Add a note, e.g. which documents you need"
            placeholderTextColor={colors.muted}
            multiline
            maxLength={240}
            style={styles.note}
            accessibilityLabel="Note to send with the link"
          />
          <Pressable accessibilityRole="button" onPress={shareLink} style={({ pressed }) => [styles.share, pressed && { opacity: 0.85 }]}>
            <Send size={18} color="#fff" strokeWidth={2.4} />
            <Text style={styles.shareText}>Send the link</Text>
          </Pressable>
        </View>
      ) : (
        <Option
          icon={Link}
          title="Request an upload link"
          body="Let your agent or carrier upload for you"
          onPress={() => setLinkReady(true)}
        />
      )}

      <Text style={styles.group}>Just looking</Text>
      <Option icon={FileText} title="Try a sample policy" body={SAMPLE} onPress={() => begin(SAMPLE)} />

      <Text style={styles.consent}>
        Policies are sensitive. Mosey only reads what you upload so Moe can summarize it for you.
      </Text>
    </ScrollView>
  );
}

function Option({ icon: Icon, title, body, onPress }: { icon: LucideIcon; title: string; body: string; onPress: () => void }) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={title}
      onPress={onPress}
      style={({ pressed }) => [styles.option, pressed && { backgroundColor: colors.plumSoft }]}
    >
      <View style={styles.optionIcon}>
        <Icon size={22} color={colors.plum} strokeWidth={2.2} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={type.h3}>{title}</Text>
        <Text style={type.small} numberOfLines={1}>
          {body}
        </Text>
      </View>
      <ChevronRight size={20} color={colors.muted} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  sheet: { paddingHorizontal: space.xl, paddingTop: space.xl, backgroundColor: colors.surface },
  header: { flexDirection: 'row', alignItems: 'center' },
  moe: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.md,
    backgroundColor: colors.plumSoft,
    borderRadius: radius.lg,
    padding: space.md,
    marginTop: space.sm,
  },
  group: { ...type.label, marginTop: space.lg, marginBottom: space.sm },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.md,
    minHeight: 64,
    paddingHorizontal: space.md,
    borderRadius: radius.md,
    backgroundColor: colors.bg,
    marginBottom: space.sm,
  },
  optionIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  drives: { flexDirection: 'row', gap: space.sm },
  drive: {
    flex: 1,
    minHeight: 112,
    padding: space.md,
    borderRadius: radius.md,
    backgroundColor: colors.bg,
    gap: 4,
  },
  link: { backgroundColor: colors.bg, borderRadius: radius.md, padding: space.md, marginBottom: space.sm, gap: space.md },
  linkHead: { flexDirection: 'row', alignItems: 'center', gap: space.md },
  url: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.sm,
    backgroundColor: colors.surface,
    borderRadius: radius.sm,
    paddingLeft: space.md,
    paddingRight: 4,
    minHeight: 52,
  },
  urlText: { flex: 1, fontFamily: fonts.semi, fontSize: 14, lineHeight: 20, color: colors.ink },
  copy: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    minHeight: HIT,
    paddingHorizontal: 12,
    borderRadius: radius.sm,
    backgroundColor: colors.plumSoft,
  },
  copyText: { fontFamily: fonts.bold, fontSize: 13, lineHeight: 19, color: colors.plum },
  note: {
    fontFamily: fonts.body,
    fontSize: 15,
    lineHeight: 21,
    color: colors.ink,
    backgroundColor: colors.surface,
    borderRadius: radius.sm,
    paddingHorizontal: space.md,
    paddingTop: 12,
    paddingBottom: 12,
    minHeight: 72,
    textAlignVertical: 'top',
  },
  share: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    minHeight: HIT + 4,
    borderRadius: radius.pill,
    backgroundColor: colors.plum,
  },
  shareText: { fontFamily: fonts.bold, fontSize: 15, lineHeight: 22, color: '#fff' },
  consent: { fontFamily: fonts.body, fontSize: 12, lineHeight: 17, color: colors.muted, textAlign: 'center', marginTop: space.md },
});
