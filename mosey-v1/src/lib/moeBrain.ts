// Moe's "brain" for the prototype: canned, keyword-matched answers over the mock
// policies. Swap `moeReply` for a real model call when there's a backend.

import { COVERAGE_MAP, DetailItem, Insight, money, Policy, shortDate, Source, TYPE_LABEL } from './data';

export function greeting(firstName: string, policies: Policy[]): string {
  const hour = new Date().getHours();
  const hello = hour < 12 ? 'Morning' : hour < 18 ? 'Hey' : 'Evening';
  const expiring = policies.filter((p) => p.status === 'expiring').length;
  const expired = policies.filter((p) => p.status === 'expired').length;
  const unknown = policies.filter((p) => p.status === 'unknown').length;
  const bits: string[] = [];
  if (expiring) bits.push(`${expiring} ${expiring === 1 ? 'policy renews' : 'policies renew'} soon`);
  if (expired) bits.push(`${expired} ${expired === 1 ? 'has' : 'have'} ended`);
  if (unknown) bits.push(`${unknown} ${unknown === 1 ? 'needs' : 'need'} a date check`);
  const tail = bits.length
    ? `I rolled through your policies: ${bits.join(' and ')}.`
    : 'I rolled through your policies and everything looks tidy.';
  return `${hello}, ${firstName}! ${tail}`;
}

export const HOME_PROMPTS = ['What am I missing?', 'What renews next?', 'Am I covered for a flood?'];

export function policyPrompts(p: Policy): string[] {
  const base = ['What’s my deductible?', 'What isn’t covered?'];
  if (p.status === 'expired' || p.status === 'expiring') return ['When does this end?', ...base];
  return ['Sum this up for me', ...base];
}

function mine(policies: Policy[]) {
  return policies.filter((p) => !p.sharedBy);
}

function summarize(p: Policy): string {
  const top = p.coverages
    .slice(0, 3)
    .map((c) => `${c.label.toLowerCase()} ${c.limit === null ? `(${(c.note ?? 'see policy').toLowerCase()})` : money(c.limit)}`)
    .join(', ');
  const ded = p.deductible === null ? 'no deductible' : `a ${money(p.deductible)} deductible`;
  return `${p.title} is with ${p.carrier}. It costs ${money(p.premium)} (${p.premiumLabel.toLowerCase()}) with ${ded}. The big pieces: ${top}.`;
}

/** The questions Moe offers once an insight is on the table. */
export const INSIGHT_FOLLOW_UPS = [
  'Why does this matter?',
  'Where does the policy say this?',
  'What should I ask my agent?',
  'What else is related?',
];

/** How Moe opens a chat about one insight. */
export function insightIntro(policy: Policy, insight: Insight): string {
  return `Here’s what I noticed on ${policy.title}. Ask me anything about it, or pick a question below.`;
}

const words = (s: string) => new Set(s.toLowerCase().match(/[a-z0-9$]{4,}/g) ?? []);

/** The detail items on the policy that talk about the same thing as the insight, best match first. */
function related(policy: Policy, insight: Insight): DetailItem[] {
  const want = words(`${insight.title} ${insight.body}`);
  const all = [...policy.details.watch, ...policy.details.limits, ...policy.details.excluded, ...policy.details.included, ...policy.details.specs];
  return all
    .map((d) => ({ d, score: [...words(`${d.title} ${d.text}`)].filter((w) => want.has(w)).length }))
    .filter((x) => x.score >= 2)
    .sort((a, b) => b.score - a.score)
    .map((x) => x.d);
}

function aboutInsight(q: string, policy: Policy, insight: Insight): string | null {
  const hits = related(policy, insight);
  const top = hits[0];
  const source: Source | undefined = hits.map((h) => policy.sources.find((s) => s.id === h.source)).find(Boolean);

  if (q.includes('where') || q.includes('source') || q.includes('page')) {
    if (!source) return `I couldn’t tie this to one passage in ${policy.documents[0]?.name ?? 'the document'}. The policy wording is what counts, so it’s worth reading the relevant section yourself.`;
    const pages = `page${source.pages.length > 1 ? 's' : ''} ${source.pages.join(', ')}`;
    return `It comes from “${source.title}”, PDF ${pages}${source.form ? `, form ${source.form}` : ''}.${source.excerpt ? ` The wording there: “${source.excerpt}”` : ''}`;
  }
  if (q.includes('why') || q.includes('matter') || q.includes('mean')) {
    return top && top.text !== insight.body
      ? `${insight.body} In the policy’s own terms: ${top.text}`
      : `${insight.body} That’s what the documents say; whether it’s a problem depends on your situation, which is a question for your insurance professional.`;
  }
  if (q.includes('agent') || q.includes('ask') || q.includes('professional')) {
    return `I can’t give advice, but you could ask your insurance professional: “My ${TYPE_LABEL[policy.type].toLowerCase()} policy with ${policy.carrier} shows this: ${insight.title.toLowerCase()}. How does that apply to me, and what are my options?”${source ? ` Point them to “${source.title}”, PDF page ${source.pages[0]}.` : ''}`;
  }
  if (q.includes('related') || q.includes('else')) {
    const others = hits.slice(0, 3).map((h) => h.title);
    return others.length
      ? `Related items on this policy: ${others.join('; ')}. Each one is under Policy details with its source page.`
      : 'I didn’t find other items on this policy that tie directly to it.';
  }
  return null;
}

export function moeReply(text: string, policies: Policy[], policyId?: string, insightId?: string): string {
  const q = text.toLowerCase();
  const focus = policies.find((p) => p.id === policyId);
  const insight = focus?.insights.find((i) => i.id === insightId);
  if (focus && insight) {
    const answer = aboutInsight(q, focus, insight);
    if (answer) return answer;
  }
  const own = mine(policies);

  if (/^(hi|hey|hello|yo|sup)\b/.test(q) || q.includes('test')) {
    return `Hi! I’m Moe. I’ve read all ${own.length} of your policies so you don’t have to. Ask me what’s covered, what isn’t, or what’s coming up.`;
  }

  if (focus) {
    if (q.includes('deductible')) {
      return focus.deductible === null
        ? `${focus.title} doesn’t have a deductible. It pays the full benefit.`
        : `Your deductible on ${focus.title} is ${money(focus.deductible)}. That’s what you pay on a claim before ${focus.carrier} pays the rest.`;
    }
    if (q.includes('isn’t covered') || q.includes("isn't covered") || q.includes('not covered') || q.includes('exclu')) {
      return `Things this policy leaves out include: ${focus.exclusions.slice(0, 4).join('; ') || 'nothing listed in the pages I read'}. Want me to check whether another policy picks any of those up?`;
    }
    if (q.includes('end') || q.includes('expire') || q.includes('renew')) {
      return focus.expires
        ? `${focus.title} runs through ${shortDate(focus.expires)}.`
        : `I couldn’t find a coverage period in this document. If you have the declarations page, upload it and I’ll pin the dates down.`;
    }
    if (q.includes('sum') || q.includes('overview') || q.includes('explain')) {
      return summarize(focus);
    }
  }

  if (q.includes('flood') || q.includes('water')) {
    const hits = own.filter((p) => p.details.excluded.some((d) => /flood|surface water|water/i.test(`${d.title} ${d.text}`)));
    return hits.length
      ? `Water is called out as excluded or limited on: ${hits.map((p) => p.title).join('; ')}. Open a policy and check What’s not included for the exact wording.`
      : 'None of your policies mention flood or surface water as an exclusion in the pages I read.';
  }

  if (q.includes('missing') || q.includes('gap') || q.includes("don't have") || q.includes('don’t have')) {
    const none = COVERAGE_MAP.filter((l) => !own.some((p) => l.types.includes(p.type))).map((l) => l.label.toLowerCase());
    const gaps = own.flatMap((p) => p.insights.filter((i) => i.tone === 'gap').map((i) => `${i.title} (${TYPE_LABEL[p.type]})`)).slice(0, 3);
    return `I don’t see any ${none.join(', ') || 'other kinds of'} cover in your files. Flagged inside your policies: ${gaps.join('; ') || 'nothing marked as a gap'}.`;
  }

  if (q.includes('renew') || q.includes('expir') || q.includes('next') || q.includes('due')) {
    const live = own.filter((p) => p.expires && p.status !== 'expired').sort((a, b) => a.expires!.localeCompare(b.expires!));
    if (live[0]) return `Next up is ${live[0].title}, which ends ${shortDate(live[0].expires)}.`;
    const last = own.filter((p) => p.expires).sort((a, b) => b.expires!.localeCompare(a.expires!))[0];
    return last
      ? `Nothing is in force right now. The most recent term, ${last.title}, ended ${shortDate(last.expires)}.`
      : 'Nothing is coming up for renewal.';
  }

  if (q.includes('deductible')) {
    const list = own
      .filter((p) => p.deductible !== null)
      .map((p) => `${TYPE_LABEL[p.type]} ${money(p.deductible)}`)
      .join(', ');
    return `Here are your deductibles: ${list}. Policies without a deductible aren’t listed.`;
  }

  if (q.includes('how much') || q.includes('cost') || q.includes('pay') || q.includes('premium')) {
    return `Premiums as printed: ${own.map((p) => `${TYPE_LABEL[p.type]} ${p.premium ? money(p.premium) : 'not stated'} (${p.premiumLabel.toLowerCase()})`).join('; ')}. Terms differ, so they aren’t added together.`;
  }

  if (q.includes('compare')) {
    return 'The Compare tab has the full side-by-side: price, deductible, dates and every coverage line. Going deeper than that table needs the real model, which this prototype isn’t wired to yet.';
  }


  if (focus) return summarize(focus);

  return 'I can answer that once I’m wired up to the real model. In this prototype, try asking what you’re missing, what renews next, what your deductibles are, or whether water damage is excluded.';
}
