// Supporting documents: the things that sit beside a policy without being one.
// ID cards, declarations pages, endorsements, beneficiary forms. Samples for
// the prototype; each points at evidence in one of the demo policies so the
// preview shows real content from the client's data.

import type { Policy, Source } from './policyTypes';

export type DocKind = 'ID card' | 'Declarations' | 'Endorsement' | 'Schedule' | 'Form';

export type FileDoc = {
  id: string;
  name: string;
  kind: DocKind;
  policyId: string;
  /** A `Source.id` on that policy; the preview shows its facts. */
  source?: string;
  /** For documents with no source of their own, e.g. an ID card. */
  entries?: [label: string, value: string][];
  note?: string;
  addedAt: string;
};

export const seedDocuments: FileDoc[] = [
  {
    id: 'doc-pa-id',
    name: 'Auto insurance ID card',
    kind: 'ID card',
    policyId: 'personalAuto',
    entries: [
      ['Insured', 'Tremayne Hedgepeth'],
      ['Vehicle', '2018 Hyundai Elantra'],
      ['VIN', 'KMHH55LC5JU039020'],
      ['Policy number', '2J2XN6'],
      ['Company', 'Root Insurance Co.'],
      ['Effective', 'Dec 10, 2022 – Jun 10, 2023'],
    ],
    note: 'Sample card. The client has no ID card in its files; this one is filled from the declarations.',
    addedAt: '2026-09-28',
  },
  { id: 'doc-pa-dec', name: 'Amended auto declarations', kind: 'Declarations', policyId: 'personalAuto', source: 'identity', addedAt: '2026-09-28' },
  { id: 'doc-pa-um', name: 'Uninsured motorists endorsement', kind: 'Endorsement', policyId: 'personalAuto', source: 'um', addedAt: '2026-09-28' },
  { id: 'doc-ca-dec', name: 'Revised business auto declarations', kind: 'Declarations', policyId: 'commercialAuto', source: 'identity', addedAt: '2026-09-26' },
  { id: 'doc-ca-forms', name: 'Forms and endorsements inventory', kind: 'Schedule', policyId: 'commercialAuto', source: 'forms', addedAt: '2026-09-26' },
  { id: 'doc-bop-dec', name: 'Businessowners policy declarations', kind: 'Declarations', policyId: 'bop', source: 'identity', addedAt: '2026-09-22' },
  { id: 'doc-rent-end', name: 'Renters amendatory endorsement', kind: 'Endorsement', policyId: 'renters', source: 'ap1294', addedAt: '2026-09-20' },
  { id: 'doc-life-ben', name: 'Beneficiary designation', kind: 'Form', policyId: 'termLifeLevel20', source: 'beneficiaries', addedAt: '2026-09-18' },
  { id: 'doc-life-rider', name: 'Accelerated death benefit rider', kind: 'Endorsement', policyId: 'termLifeLevel20', source: 'rider', addedAt: '2026-09-18' },
];

/** Everything the list row and the preview need, resolved against the policies. */
export function resolveDoc(doc: FileDoc, policies: Policy[]) {
  const policy = policies.find((p) => p.id === doc.policyId);
  const source: Source | undefined = doc.source ? policy?.sources.find((s) => s.id === doc.source) : undefined;
  const file = policy?.documents[0];
  const page = source?.pages[0];
  return {
    policy,
    source,
    pages: source?.pages.length ?? 1,
    /** Opens the client's hosted PDF at the right page, where there is one. */
    url: file?.url ? `${file.url}${page ? `#page=${page}` : ''}` : undefined,
    totalPages: file?.pages,
  };
}
