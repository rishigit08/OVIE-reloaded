// Policy details as sections, each citing the page of the document it was read
// from. The content lives on the policy (see policyTypes.ts); this turns it
// into the shape the detail screens read.

import type { DetailKind, Policy, Severity, Source } from './policyTypes';

export type { DetailKind } from './policyTypes';

export type Citation = {
  doc: string;
  page: number;
  pages: number[];
  heading: string;
  form?: string;
};

export type Section = {
  id: string;
  kind: DetailKind;
  title: string;
  points: string[];
  cite: Citation;
  group?: string;
  severity?: Severity;
  /** Schedule metadata, when this item is a scheduled coverage. */
  limit?: string;
  deductible?: string;
  premium?: string;
  /** The evidence the section was read from, with its facts and any excerpt. */
  source?: Source;
};

/** The client's order and wording for the groups of policy detail. */
export const KINDS: DetailKind[] = ['included', 'specs', 'excluded', 'limits', 'watch', 'deductibles'];

export const KIND_LABEL: Record<DetailKind, string> = {
  included: 'What’s included',
  specs: 'Policy specifications',
  excluded: 'What’s not included',
  limits: 'Coverage limitations',
  watch: 'Coverage watch points',
  deductibles: 'Deductibles',
};

export function detailsFor(policy: Policy): Record<DetailKind, Section[]> {
  const doc = policy.documents[0]?.name ?? 'policy.pdf';
  const byId = new Map(policy.sources.map((s) => [s.id, s]));
  const out = {} as Record<DetailKind, Section[]>;
  for (const kind of KINDS) {
    out[kind] = policy.details[kind].map((item, i) => {
      const source = item.source ? byId.get(item.source) : undefined;
      return {
        id: `${kind}-${i}`,
        kind,
        title: item.title,
        points: [item.text],
        group: item.group,
        severity: item.severity,
        limit: item.limit,
        deductible: item.deductible,
        premium: item.premium,
        source,
        cite: {
          doc,
          page: source?.pages[0] ?? 1,
          pages: source?.pages ?? [],
          heading: source?.title ?? item.title,
          form: source?.form,
        },
      };
    });
  }
  return out;
}

export function findSection(policy: Policy, sectionId: string): Section | undefined {
  const all = detailsFor(policy);
  return KINDS.flatMap((k) => all[k]).find((s) => s.id === sectionId);
}

/** The short facts to show beside a coverage: limit, deductible, premium, whichever exist. */
export function coverageMeta(c: { limit?: string; deductible?: string; premium?: string }): string[] {
  return [c.limit, c.deductible ? `Deductible: ${c.deductible}` : null, c.premium ? `Premium: ${c.premium}` : null].filter((x): x is string => !!x);
}
