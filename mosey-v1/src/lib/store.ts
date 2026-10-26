import { create } from 'zustand';

import { Insight, makeUploadedPolicy, Policy, seedPolicies } from './data';
import { insightIntro, moeReply } from './moeBrain';

/** `insight` puts that insight's card in the message, so it stays in view while you ask about it. */
export type Message = { id: string; role: 'user' | 'moe'; text: string; insight?: Insight };
export type Chat = {
  id: string;
  title: string;
  messages: Message[];
  updatedAt: number;
  policyId?: string;
  /** Set when the chat was opened from an insight; Moe answers follow-ups about it. */
  insightId?: string;
};

export type Upload = {
  id: string;
  fileName: string;
  progress: number; // 0..1
  status: 'working' | 'done';
  policyId?: string;
};

/** Something worth telling the reader about. Shown in Notifications. */
export type Activity = {
  id: string;
  /** Uploads go in one pane; insights, watch points and the rest in the other. */
  kind: 'upload' | 'insight' | 'watch' | 'share' | 'chat';
  /** For uploads: how it ended. */
  status?: 'complete' | 'read' | 'failed';
  text: string;
  at: number;
  /** Opens this policy when tapped. */
  policyId?: string;
};

const HOUR = 3600_000;
const DAY = 24 * HOUR;
const now = Date.now();
let seq = 0;
const uid = (p: string) => `${p}-${Date.now().toString(36)}-${seq++}`;

/** Friendly names for each stretch of the upload, in order. */
export const UPLOAD_STAGES = [
  { until: 0.3, label: 'Rolling up your pages' },
  { until: 0.6, label: 'Reading the fine print' },
  { until: 0.88, label: 'Sorting the tiles' },
  { until: 1, label: 'Polishing your insights' },
];

export function stageFor(progress: number) {
  const i = UPLOAD_STAGES.findIndex((s) => progress < s.until);
  return i === -1 ? UPLOAD_STAGES.length - 1 : i;
}

const ask = (policyId: string, q: string) => moeReply(q, seedPolicies, policyId);

const seedChats: Chat[] = [
  {
    id: 'c1',
    title: 'Renters deductible',
    updatedAt: now - 2 * DAY,
    policyId: 'renters',
    messages: [
      { id: 'c1m1', role: 'user', text: 'What’s my deductible?' },
      { id: 'c1m2', role: 'moe', text: ask('renters', 'What’s my deductible?') },
    ],
  },
  {
    id: 'c2',
    title: 'What isn’t covered on my car',
    updatedAt: now - 6 * DAY,
    policyId: 'personalAuto',
    messages: [
      { id: 'c2m1', role: 'user', text: 'What isn’t covered?' },
      { id: 'c2m2', role: 'moe', text: ask('personalAuto', 'What isn’t covered?') },
    ],
  },
  {
    id: 'c3',
    title: 'Water damage',
    updatedAt: now - 15 * DAY,
    messages: [
      { id: 'c3m1', role: 'user', text: 'Am I covered for a flood?' },
      { id: 'c3m2', role: 'moe', text: moeReply('Am I covered for a flood?', seedPolicies) },
    ],
  },
];

const titleOf = (id: string) => seedPolicies.find((p) => p.id === id)?.title ?? 'your policy';
const firstInsight = (id: string) => seedPolicies.find((p) => p.id === id)?.insights[0]?.title;
const firstWatch = (id: string) =>
  seedPolicies.find((p) => p.id === id)?.details.watch.find((w) => w.severity === 'Critical')?.title;

// Sample notifications. Insight and watch-point lines quote the policy's own data.
const seedActivity: Activity[] = [
  { id: 'a1', kind: 'insight', text: `New insight on ${titleOf('personalAuto')}: ${firstInsight('personalAuto')}`, at: now - 5 * HOUR, policyId: 'personalAuto' },
  { id: 'a2', kind: 'watch', text: `New watch point on ${titleOf('commercialUmbrella')}: ${firstWatch('commercialUmbrella')}`, at: now - 9 * HOUR, policyId: 'commercialUmbrella' },
  { id: 'a3', kind: 'upload', status: 'read', text: `${titleOf('termLifeLevel20')} uploaded and read`, at: now - 2 * DAY, policyId: 'termLifeLevel20' },
  { id: 'a4', kind: 'upload', status: 'failed', text: 'Upload failed: scan-0412.pdf couldn’t be read. Try a clearer copy.', at: now - 3 * DAY },
  { id: 'a5', kind: 'watch', text: `New watch point on ${titleOf('workersComp')}: ${firstWatch('workersComp')}`, at: now - 4 * DAY, policyId: 'workersComp' },
  { id: 'a6', kind: 'upload', status: 'complete', text: 'Upload complete: commercial-auto-ath-wonder.pdf', at: now - 6 * DAY, policyId: 'commercialAuto' },
  { id: 'a7', kind: 'upload', status: 'read', text: `${titleOf('renters')} uploaded and read`, at: now - 7 * DAY, policyId: 'renters' },
];

type PanelAnchor = { x: number; y: number; size: number } | null;

type State = {
  policies: Policy[];
  chats: Chat[];
  activeChatId: string | null;
  thinkingChatId: string | null;
  /** Which type of policy the Files list is narrowed to. */
  filesFilter: string | null;
  setFilesFilter: (type: string | null) => void;
  panelOpen: boolean;
  panelAnchor: PanelAnchor;
  uploads: Upload[];
  unseenFiles: number;
  /** Notifications that arrived since the reader last opened Notifications. */
  unseenNotifications: number;
  activity: Activity[];

  openPanel: (anchor: PanelAnchor) => void;
  closePanel: () => void;
  openChat: (id: string | null) => void;
  startChat: (policyId?: string) => string;
  startInsightChat: (policyId: string, insightId: string) => void;
  send: (text: string, policyId?: string) => void;
  renameChat: (id: string, title: string) => void;
  deleteChat: (id: string) => void;

  startUpload: (fileName: string) => void;
  dismissUpload: (id: string) => void;
  markFilesSeen: () => void;
  markNotificationsSeen: () => void;
};

export const useStore = create<State>((set, get) => ({
  policies: seedPolicies,
  chats: seedChats,
  activeChatId: null,
  thinkingChatId: null,
  filesFilter: null,
  setFilesFilter: (type) => set({ filesFilter: type }),
  panelOpen: false,
  panelAnchor: null,
  uploads: [],
  unseenFiles: 0,
  unseenNotifications: 0,
  activity: seedActivity,

  openPanel: (anchor) => set({ panelOpen: true, panelAnchor: anchor }),
  closePanel: () => set({ panelOpen: false }),
  openChat: (id) => set({ activeChatId: id }),

  startChat: (policyId) => {
    const chat: Chat = { id: uid('chat'), title: 'New chat', messages: [], updatedAt: Date.now(), policyId };
    set((s) => ({ chats: [chat, ...s.chats], activeChatId: chat.id }));
    return chat.id;
  },

  startInsightChat: (policyId, insightId) => {
    const policy = get().policies.find((p) => p.id === policyId);
    const insight = policy?.insights.find((i) => i.id === insightId);
    if (!policy || !insight) return;
    // Reopen the chat about this insight if there already is one.
    const existing = get().chats.find((c) => c.insightId === insightId);
    if (existing) return set({ activeChatId: existing.id });
    const chat: Chat = {
      id: uid('chat'),
      title: insight.title.length > 34 ? `${insight.title.slice(0, 33)}…` : insight.title,
      messages: [{ id: uid('m'), role: 'moe', text: insightIntro(policy, insight), insight }],
      updatedAt: Date.now(),
      policyId,
      insightId,
    };
    set((s) => ({ chats: [chat, ...s.chats], activeChatId: chat.id }));
  },

  send: (raw, policyId) => {
    const text = raw.trim();
    if (!text) return;
    let chatId = get().activeChatId;
    if (!chatId || !get().chats.some((c) => c.id === chatId)) chatId = get().startChat(policyId);

    set((s) => ({
      thinkingChatId: chatId,
      chats: s.chats.map((c) =>
        c.id === chatId
          ? {
              ...c,
              title: c.messages.length === 0 ? (text.length > 34 ? `${text.slice(0, 33)}…` : text) : c.title,
              messages: [...c.messages, { id: uid('m'), role: 'user', text }],
              updatedAt: Date.now(),
            }
          : c,
      ),
    }));

    const about = get().chats.find((c) => c.id === chatId);
    const context = about?.policyId;
    setTimeout(
      () => {
        const reply = moeReply(text, get().policies, context, about?.insightId);
        set((s) => ({
          thinkingChatId: s.thinkingChatId === chatId ? null : s.thinkingChatId,
          chats: s.chats.map((c) =>
            c.id === chatId
              ? { ...c, messages: [...c.messages, { id: uid('m'), role: 'moe', text: reply }], updatedAt: Date.now() }
              : c,
          ),
        }));
      },
      1100 + Math.random() * 700,
    );
  },

  renameChat: (id, title) =>
    set((s) => ({ chats: s.chats.map((c) => (c.id === id ? { ...c, title: title.trim() || c.title } : c)) })),

  deleteChat: (id) =>
    set((s) => ({
      chats: s.chats.filter((c) => c.id !== id),
      activeChatId: s.activeChatId === id ? null : s.activeChatId,
    })),

  startUpload: (fileName) => {
    const id = uid('up');
    set((s) => ({
      uploads: [{ id, fileName, progress: 0, status: 'working' }, ...s.uploads],
      activity: s.activity,
    }));

    // Simulated upload + extraction, ~12 seconds end to end.
    const timer = setInterval(() => {
      const current = get().uploads.find((u) => u.id === id);
      if (!current) return clearInterval(timer);
      const next = Math.min(1, current.progress + 0.012 + Math.random() * 0.022);
      if (next < 1) {
        set((s) => ({ uploads: s.uploads.map((u) => (u.id === id ? { ...u, progress: next } : u)) }));
        return;
      }
      clearInterval(timer);
      const policy = makeUploadedPolicy(uid('policy'), fileName);
      set((s) => ({
        policies: [policy, ...s.policies],
        uploads: s.uploads.map((u) => (u.id === id ? { ...u, progress: 1, status: 'done', policyId: policy.id } : u)),
        unseenFiles: s.unseenFiles + 1,
        // One badge per finished upload, however many entries it adds.
        unseenNotifications: s.unseenNotifications + 1,
        activity: [
          { id: uid('a'), kind: 'insight', text: `Moe found 2 insights on ${policy.title}`, at: Date.now(), policyId: policy.id },
          { id: uid('a'), kind: 'upload', status: 'read', text: `${policy.title} uploaded and read`, at: Date.now(), policyId: policy.id },
          ...s.activity,
        ],
      }));
    }, 260);
  },

  dismissUpload: (id) => set((s) => ({ uploads: s.uploads.filter((u) => u.id !== id) })),
  markFilesSeen: () => set((s) => (s.unseenFiles ? { unseenFiles: 0 } : s)),
  markNotificationsSeen: () => set((s) => (s.unseenNotifications ? { unseenNotifications: 0 } : s)),
}));

export function timeAgo(at: number): string {
  const d = Date.now() - at;
  if (d < 60_000) return 'Just now';
  if (d < HOUR) return `${Math.floor(d / 60_000)}m ago`;
  if (d < DAY) return `${Math.floor(d / HOUR)}h ago`;
  if (d < 7 * DAY) return `${Math.floor(d / DAY)}d ago`;
  return `${Math.floor(d / (7 * DAY))}w ago`;
}
