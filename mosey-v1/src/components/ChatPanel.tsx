import { ArrowUp, Check, Mic, Menu, MessageCircle, Pencil, SquarePen, Trash, X } from 'lucide-react-native';
import { useEffect, useRef, useState } from 'react';
import {
  Animated,
  BackHandler,
  Easing,
  Keyboard,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  useWindowDimensions,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Moe, MoeMood } from '@/components/Moe';
import { Chip, IconButton, TONE, TonePill } from '@/components/ui';
import { HOME_PROMPTS, INSIGHT_FOLLOW_UPS, policyPrompts } from '@/lib/moeBrain';
import { Chat, timeAgo, useStore } from '@/lib/store';
import { colors, fonts, HIT, radius, shadowStrong, space, type } from '@/lib/theme';

const EDGE = 10;
const DISCLAIMER = 'Moe summarizes your policies. He doesn’t give insurance advice or recommendations.';

/**
 * Moe's chat. Lives above every screen and grows out of wherever Moe was
 * tapped, then tucks back into him on close.
 */
export function ChatPanel() {
  const open = useStore((s) => s.panelOpen);
  const anchor = useStore((s) => s.panelAnchor);
  const close = useStore((s) => s.closePanel);
  const insets = useSafeAreaInsets();
  const { width, height } = useWindowDimensions();
  const [mounted, setMounted] = useState(false);
  const [keyboard, setKeyboard] = useState(0);
  const progress = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (open) {
      setMounted(true);
      Animated.spring(progress, { toValue: 1, damping: 19, stiffness: 210, mass: 0.9, useNativeDriver: true }).start();
      return;
    }
    Keyboard.dismiss();
    Animated.timing(progress, { toValue: 0, duration: 200, easing: Easing.in(Easing.cubic), useNativeDriver: true }).start(
      ({ finished }) => finished && setMounted(false),
    );
  }, [open, progress]);

  useEffect(() => {
    const ios = Platform.OS === 'ios';
    const show = Keyboard.addListener(ios ? 'keyboardWillShow' : 'keyboardDidShow', (e) => setKeyboard(e.endCoordinates.height));
    const hide = Keyboard.addListener(ios ? 'keyboardWillHide' : 'keyboardDidHide', () => setKeyboard(0));
    return () => {
      show.remove();
      hide.remove();
    };
  }, []);

  useEffect(() => {
    if (!open) return;
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      close();
      return true;
    });
    return () => sub.remove();
  }, [open, close]);

  if (!mounted) return null;

  // Leave a strip of backdrop above the panel so there's always somewhere to tap out.
  const top = insets.top + 30;
  const bottom = keyboard ? keyboard + 8 : Math.max(insets.bottom, EDGE);
  const from = anchor ?? { x: width - 48, y: height - insets.bottom - 110, size: 56 };

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents={open ? 'auto' : 'none'}>
      <Animated.View style={[StyleSheet.absoluteFill, styles.backdrop, { opacity: progress }]}>
        <Pressable style={{ flex: 1 }} onPress={close} accessibilityRole="button" accessibilityLabel="Close chat" />
      </Animated.View>
      <View style={{ position: 'absolute', left: EDGE, right: EDGE, top, bottom }} pointerEvents="box-none">
        <Animated.View
          accessibilityViewIsModal
          style={[
            styles.panel,
            {
              transformOrigin: `${from.x - EDGE}px ${from.y - top}px`,
              opacity: progress.interpolate({ inputRange: [0, 0.3, 1], outputRange: [0, 1, 1] }),
              transform: [{ scale: progress.interpolate({ inputRange: [0, 1], outputRange: [0.1, 1] }) }],
            },
          ]}
        >
          <View style={styles.panelClip}>
            <ChatBody onClose={close} />
          </View>
        </Animated.View>
      </View>
    </View>
  );
}

type ChatBodyProps = {
  /** Shows a close button; omitted when the chat is a tab of its own. */
  onClose?: () => void;
  /** Give Moe centre stage while the chat is empty (the Moe tab). */
  hero?: boolean;
  paused?: boolean;
  /** Set when the chat is the pull-up sheet on a policy screen. */
  sheet?: ChatSheet;
};

export type ChatSheet = {
  policyId: string;
  expanded: boolean;
  /** Animated style for everything above the composer (fades in as the sheet opens). */
  bodyStyle: any;
  /** Animated style that keeps the composer pinned to the bottom of the screen. */
  composerStyle: any;
  onComposerLayout: (height: number) => void;
  onExpand: () => void;
};

export function ChatBody({ onClose, hero = false, paused = false, sheet }: ChatBodyProps) {
  const chats = useStore((s) => s.chats);
  const activeId = useStore((s) => s.activeChatId);
  const thinkingId = useStore((s) => s.thinkingChatId);
  const policies = useStore((s) => s.policies);
  const openChat = useStore((s) => s.openChat);
  const send = useStore((s) => s.send);

  const [view, setView] = useState<'chat' | 'history'>('chat');
  const [draft, setDraft] = useState('');
  const [typing, setTyping] = useState(false);
  const [cheer, setCheer] = useState(false);
  const scroll = useRef<ScrollView>(null);

  const chat = chats.find((c) => c.id === activeId);
  const policy = policies.find((p) => p.id === (chat?.policyId ?? sheet?.policyId));
  const thinking = !!activeId && thinkingId === activeId;
  const count = chat?.messages.length ?? 0;
  const past = chats.filter((c) => c.messages.length > 0);

  // A little bounce when an answer lands.
  const wasThinking = useRef(false);
  useEffect(() => {
    if (wasThinking.current && !thinking) {
      setCheer(true);
      const timer = setTimeout(() => setCheer(false), 1200);
      return () => clearTimeout(timer);
    }
    wasThinking.current = thinking;
  }, [thinking]);
  useEffect(() => {
    wasThinking.current = thinking;
  });

  useEffect(() => {
    const timer = setTimeout(() => scroll.current?.scrollToEnd({ animated: true }), 60);
    return () => clearTimeout(timer);
  }, [count, thinking, view]);

  // A minimised sheet only ever shows the composer, so drop back to the chat itself.
  const minimised = !!sheet && !sheet.expanded;
  useEffect(() => {
    if (minimised) setView('chat');
  }, [minimised]);

  // Voice input is simulated in the prototype: Moe "listens" for a moment,
  // then a sample question lands in the input, ready to send or edit.
  const [hearing, setHearing] = useState(false);
  const heard = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(
    () => () => {
      if (heard.current) clearTimeout(heard.current);
    },
    [],
  );
  const toggleVoice = () => {
    if (heard.current) clearTimeout(heard.current);
    if (hearing) return setHearing(false);
    setHearing(true);
    heard.current = setTimeout(() => {
      setHearing(false);
      setDraft(policy ? 'What isn’t covered?' : 'What renews next?');
    }, 2200);
  };

  const mood: MoeMood = thinking ? 'thinking' : cheer ? 'happy' : typing || hearing ? 'listening' : 'idle';
  const prompts = policy ? policyPrompts(policy) : HOME_PROMPTS;
  // In a chat about an insight, offer the follow-ups that haven't been asked yet.
  const asked = new Set(chat?.messages.filter((m) => m.role === 'user').map((m) => m.text));
  const followUps = chat?.insightId ? INSIGHT_FOLLOW_UPS.filter((f) => !asked.has(f)) : [];

  const submit = (text: string) => {
    if (!text.trim() || thinking) return;
    send(text, sheet?.policyId);
    setDraft('');
    sheet?.onExpand();
  };

  return (
    <View style={styles.screen}>
      <Animated.View style={[{ flex: 1 }, sheet?.bodyStyle]} pointerEvents={minimised ? 'none' : 'auto'}>
      <View style={styles.header}>
        {sheet || (hero && count === 0 && view === 'chat') ? null : <Moe size={48} mood={mood} paused={paused} />}
        <View style={styles.title}>
          <Text style={type.h3} numberOfLines={1}>
            {view === 'history' ? 'Past chats' : chat && count ? chat.title : 'Ask Moe'}
          </Text>
          {view === 'chat' && policy ? (
            <Text style={type.small} numberOfLines={1}>
              About {policy.title}
            </Text>
          ) : null}
        </View>
        <IconButton
          icon={view === 'history' ? MessageCircle : Menu}
          label={view === 'history' ? 'Back to chat' : 'Past chats'}
          onPress={() => setView((v) => (v === 'history' ? 'chat' : 'history'))}
          tint={colors.plum}
        />
        <IconButton
          icon={SquarePen}
          label="New chat"
          tint={colors.plum}
          onPress={() => {
            openChat(null);
            setView('chat');
          }}
        />
        {onClose ? <IconButton icon={X} label="Close" onPress={onClose} /> : null}
      </View>

      {view === 'history' ? (
        <History
          chats={past}
          activeId={activeId}
          onOpen={(id) => {
            openChat(id);
            setView('chat');
          }}
        />
      ) : (
          <ScrollView
            ref={scroll}
            style={{ flex: 1 }}
            contentContainerStyle={[styles.messages, count === 0 && { flexGrow: 1, justifyContent: 'center' }]}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {count === 0 ? (
              <View style={styles.empty}>
                {hero ? <Moe size={128} mood={mood} paused={paused} /> : null}
                <Text style={[type.h2, { textAlign: 'center' }]}>
                  {policy ? `Ask me about ${policy.title}` : 'What do you want to know?'}
                </Text>
                <Text style={[type.body, { textAlign: 'center' }]}>
                  I’ve read your policies. Ask in plain words and I’ll answer in plain words.
                </Text>
                {sheet ? null : (
                  <View style={styles.prompts}>
                    {prompts.map((p) => (
                      <Chip key={p} label={p} onPress={() => submit(p)} />
                    ))}
                  </View>
                )}
              </View>
            ) : (
              <>
                {chat!.messages.map((m) =>
                  m.role === 'user' ? (
                    <View key={m.id} style={styles.mine}>
                      <Text style={styles.mineText}>{m.text}</Text>
                    </View>
                  ) : (
                    <View key={m.id} style={styles.moeRow}>
                      <View style={styles.theirs}>
                        <Text style={styles.theirsText}>{m.text}</Text>
                        {m.insight ? (
                          <View style={[styles.insight, { borderLeftColor: TONE[m.insight.tone].ink }]}>
                            <TonePill tone={m.insight.tone} />
                            <Text style={[type.h3, { marginTop: space.sm }]}>{m.insight.title}</Text>
                            <Text style={[type.body, { marginTop: 4 }]}>{m.insight.body}</Text>
                          </View>
                        ) : null}
                      </View>
                    </View>
                  ),
                )}
                {thinking ? (
                  <View style={styles.moeRow} accessibilityLabel="Moe is thinking" accessibilityLiveRegion="polite">
                    <View style={[styles.theirs, styles.thinking]}>
                      <Dots />
                      <Text style={type.small}>Rolling through your policies</Text>
                    </View>
                  </View>
                ) : followUps.length > 0 ? (
                  <View style={styles.followUps} accessibilityLabel="Suggested questions">
                    {followUps.map((f) => (
                      <Chip key={f} label={f} onPress={() => submit(f)} />
                    ))}
                  </View>
                ) : null}
              </>
            )}
          </ScrollView>
      )}
      {sheet && view === 'chat' ? <Text style={[styles.disclaimer, styles.sheetDisclaimer]}>{DISCLAIMER}</Text> : null}
      </Animated.View>

      {sheet || view === 'chat' ? (
          <Animated.View
            style={[styles.composer, sheet && styles.sheetComposer, sheet?.composerStyle]}
            onLayout={(e) => sheet?.onComposerLayout(e.nativeEvent.layout.height)}
          >
            {sheet && count === 0 ? (
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
                contentContainerStyle={{ gap: space.sm, paddingHorizontal: space.md }}
                style={styles.sheetChips}
              >
                {prompts.map((p) => (
                  <Chip key={p} label={p} onPress={() => submit(p)} />
                ))}
              </ScrollView>
            ) : null}
            {sheet ? null : <Text style={[styles.disclaimer, styles.disclaimerAbove]}>{DISCLAIMER}</Text>}
            <View style={styles.inputRow}>
              {sheet ? (
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={sheet.expanded ? 'Moe' : 'Open chat with Moe'}
                  onPress={sheet.onExpand}
                >
                  <Moe size={52} mood={mood} paused={paused} />
                </Pressable>
              ) : null}
              <View style={styles.inputWrap}>
                <TextInput
                  value={draft}
                  onChangeText={setDraft}
                  onFocus={() => setTyping(true)}
                  onBlur={() => setTyping(false)}
                  onSubmitEditing={() => submit(draft)}
                  placeholder={hearing ? 'Listening…' : sheet ? 'Ask Moe about this policy…' : 'Ask anything about your policies…'}
                  placeholderTextColor={colors.muted}
                  returnKeyType="send"
                  style={styles.input}
                  accessibilityLabel="Message Moe"
                />
                {draft.trim() ? (
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel="Send"
                    disabled={thinking}
                    onPress={() => submit(draft)}
                    style={[styles.send, thinking && { backgroundColor: colors.sunken }]}
                  >
                    <ArrowUp size={20} color={thinking ? colors.muted : '#fff'} strokeWidth={2.6} />
                  </Pressable>
                ) : (
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel={hearing ? 'Stop listening' : 'Speak your question'}
                    accessibilityState={{ selected: hearing }}
                    onPress={toggleVoice}
                    style={[styles.send, styles.mic, hearing && styles.micOn]}
                  >
                    <Mic size={20} color={hearing ? '#fff' : colors.plum} strokeWidth={2.4} />
                  </Pressable>
                )}
              </View>
            </View>
          </Animated.View>
      ) : null}
    </View>
  );
}

function Dots() {
  const dots = useRef([0, 1, 2].map(() => new Animated.Value(0.3))).current;
  useEffect(() => {
    const loop = Animated.loop(
      Animated.stagger(
        160,
        dots.map((d) =>
          Animated.sequence([
            Animated.timing(d, { toValue: 1, duration: 260, useNativeDriver: true }),
            Animated.timing(d, { toValue: 0.3, duration: 260, useNativeDriver: true }),
          ]),
        ),
      ),
    );
    loop.start();
    return () => loop.stop();
  }, [dots]);
  const tints = [colors.tangerine, colors.teal, colors.pink];
  return (
    <View style={{ flexDirection: 'row', gap: 4 }}>
      {dots.map((d, i) => (
        <Animated.View key={i} style={{ width: 9, height: 9, borderRadius: 3, backgroundColor: tints[i], opacity: d }} />
      ))}
    </View>
  );
}

function History({ chats, activeId, onOpen }: { chats: Chat[]; activeId: string | null; onOpen: (id: string) => void }) {
  const rename = useStore((s) => s.renameChat);
  const remove = useStore((s) => s.deleteChat);
  const [editing, setEditing] = useState<string | null>(null);
  const [confirming, setConfirming] = useState<string | null>(null);
  const [name, setName] = useState('');

  if (chats.length === 0) {
    return (
      <View style={[styles.empty, { flex: 1, justifyContent: 'center' }]}>
        <Text style={type.h3}>No past chats</Text>
        <Text style={[type.body, { textAlign: 'center' }]}>Conversations with Moe show up here.</Text>
      </View>
    );
  }

  const save = (id: string) => {
    rename(id, name);
    setEditing(null);
  };

  return (
    <ScrollView contentContainerStyle={{ padding: space.lg, gap: space.sm }} keyboardShouldPersistTaps="handled">
      {chats.map((c) => {
        if (editing === c.id) {
          return (
            <View key={c.id} style={[styles.chatRow, styles.chatRowEdit]}>
              <TextInput
                value={name}
                onChangeText={setName}
                autoFocus
                selectTextOnFocus
                onSubmitEditing={() => save(c.id)}
                returnKeyType="done"
                style={[styles.input, { fontFamily: fonts.semi }]}
                accessibilityLabel="Chat name"
              />
              <IconButton icon={X} label="Cancel rename" onPress={() => setEditing(null)} tint={colors.muted} />
              <IconButton icon={Check} label="Save name" onPress={() => save(c.id)} tint={colors.plum} />
            </View>
          );
        }
        if (confirming === c.id) {
          return (
            <View key={c.id} style={[styles.chatRow, { backgroundColor: colors.gapBg }]}>
              <Text style={[type.bodyInk, { flex: 1, color: colors.gapInk }]} numberOfLines={1}>
                Delete “{c.title}”?
              </Text>
              <Pressable accessibilityRole="button" onPress={() => setConfirming(null)} style={styles.textButton}>
                <Text style={[styles.textButtonLabel, { color: colors.inkSoft }]}>Keep</Text>
              </Pressable>
              <Pressable
                accessibilityRole="button"
                onPress={() => {
                  remove(c.id);
                  setConfirming(null);
                }}
                style={[styles.textButton, { backgroundColor: colors.gapInk }]}
              >
                <Text style={[styles.textButtonLabel, { color: '#fff' }]}>Delete</Text>
              </Pressable>
            </View>
          );
        }
        return (
          <View key={c.id} style={[styles.chatRow, c.id === activeId && { backgroundColor: colors.plumSoft }]}>
            <Pressable accessibilityRole="button" onPress={() => onOpen(c.id)} style={{ flex: 1, minHeight: HIT, justifyContent: 'center' }}>
              <Text style={type.bodyInk} numberOfLines={1}>
                {c.title}
              </Text>
              <Text style={type.small}>
                {timeAgo(c.updatedAt)} · {c.messages.length} messages
              </Text>
            </Pressable>
            <IconButton
              icon={Pencil}
              label={`Rename ${c.title}`}
              size={18}
              tint={colors.inkSoft}
              onPress={() => {
                setName(c.title);
                setConfirming(null);
                setEditing(c.id);
              }}
            />
            <IconButton
              icon={Trash}
              label={`Delete ${c.title}`}
              size={18}
              tint={colors.gapInk}
              onPress={() => {
                setEditing(null);
                setConfirming(c.id);
              }}
            />
          </View>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  backdrop: { backgroundColor: 'rgba(27,27,58,0.4)' },
  panel: { flex: 1, borderRadius: 30, backgroundColor: colors.surface, ...shadowStrong },
  panelClip: { flex: 1, borderRadius: 30, overflow: 'hidden' },
  screen: { flex: 1, backgroundColor: colors.surface },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: space.md,
    paddingRight: space.xs,
    paddingVertical: space.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.line,
  },
  title: { flex: 1, paddingHorizontal: space.sm },
  messages: { padding: space.lg, gap: space.md },
  empty: { alignItems: 'center', gap: space.sm, paddingHorizontal: space.xl },
  insight: {
    marginTop: space.md,
    padding: space.md,
    borderRadius: radius.md,
    borderLeftWidth: 5,
    backgroundColor: colors.surface,
  },
  followUps: { flexDirection: 'row', flexWrap: 'wrap', gap: space.sm, marginTop: space.sm },
  prompts: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: space.sm, marginTop: space.md },
  mine: {
    alignSelf: 'flex-end',
    maxWidth: '84%',
    backgroundColor: colors.plum,
    borderRadius: radius.lg,
    borderBottomRightRadius: 6,
    paddingHorizontal: space.lg,
    paddingVertical: space.md,
  },
  mineText: { fontFamily: fonts.medium, fontSize: 16, lineHeight: 22, color: '#fff' },
  moeRow: { flexDirection: 'row', alignItems: 'flex-end', gap: space.sm },
  theirs: {
    maxWidth: '90%',
    backgroundColor: colors.bg,
    borderRadius: radius.lg,
    borderBottomLeftRadius: 6,
    paddingHorizontal: space.lg,
    paddingVertical: space.md,
  },
  theirsText: { fontFamily: fonts.body, fontSize: 16, lineHeight: 23, color: colors.ink },
  thinking: { flexDirection: 'row', alignItems: 'center', gap: space.sm },
  composer: { paddingHorizontal: space.md, paddingTop: space.sm, paddingBottom: space.sm, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.line },
  inputRow: { flexDirection: 'row', alignItems: 'center', gap: space.sm },
  inputWrap: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.bg,
    borderRadius: radius.pill,
    paddingLeft: space.lg,
    paddingRight: 5,
    minHeight: 52,
  },
  input: { flex: 1, fontFamily: fonts.body, fontSize: 16, lineHeight: 23, color: colors.ink, minHeight: HIT },
  send: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: colors.plum,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sheetComposer: { borderTopWidth: 0, paddingTop: 0 },
  sheetChips: { flexGrow: 0, marginHorizontal: -space.md, marginBottom: space.sm },
  sheetDisclaimer: { marginTop: 0, marginBottom: space.sm, paddingHorizontal: space.lg },
  disclaimerAbove: { marginTop: 0, marginBottom: space.sm },
  mic: { backgroundColor: colors.plumSoft },
  micOn: { backgroundColor: colors.gapInk },
  disclaimer: { fontFamily: fonts.body, fontSize: 12, lineHeight: 16, color: colors.muted, textAlign: 'center', marginTop: space.sm },
  chatRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    minHeight: 64,
    paddingLeft: space.lg,
    paddingRight: space.sm,
    borderRadius: radius.md,
    backgroundColor: colors.bg,
  },
  chatRowEdit: { borderWidth: 2, borderColor: colors.plum, backgroundColor: colors.surface },
  textButton: { minHeight: HIT, paddingHorizontal: 14, borderRadius: radius.pill, alignItems: 'center', justifyContent: 'center' },
  textButtonLabel: { fontFamily: fonts.bold, fontSize: 14, lineHeight: 20 },
});
