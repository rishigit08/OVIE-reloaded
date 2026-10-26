// Data for the prototype. The policies come from the client's insight pages
// (see src/lib/policies and docs/client-framework.md); the term life ones are
// fictional, written to the client's template. Nothing here is a real account.

import { bop } from './policies/bop';
import { commercialAuto } from './policies/commercialAuto';
import { commercialPackage } from './policies/commercialPackage';
import { commercialProperty } from './policies/commercialProperty';
import { commercialUmbrella } from './policies/commercialUmbrella';
import { condo } from './policies/condo';
import { generalLiability } from './policies/generalLiability';
import { personalAuto } from './policies/personalAuto';
import { personalUmbrella } from './policies/personalUmbrella';
import { renters } from './policies/renters';
import { termLifeConvertible10 } from './policies/termLifeConvertible10';
import { termLifeLevel20 } from './policies/termLifeLevel20';
import { workersComp } from './policies/workersComp';
import type { Policy, PolicyStatus, PolicyType } from './policyTypes';

export type {
  Asset,
  Coverage,
  Covered,
  DetailItem,
  DetailKind,
  Insight,
  Policy,
  PolicyDocument,
  PolicyStatus,
  PolicyType,
  Severity,
  Source,
  Tone,
} from './policyTypes';

export const TYPE_LABEL: Record<PolicyType, string> = {
  personalAuto: 'Personal auto',
  commercialAuto: 'Commercial auto',
  renters: 'Renters',
  condo: 'Condo',
  personalUmbrella: 'Personal umbrella',
  commercialUmbrella: 'Commercial umbrella',
  generalLiability: 'General liability',
  commercialProperty: 'Commercial property',
  bop: 'Business owners',
  workersComp: 'Workers’ comp',
  commercialPackage: 'Commercial package',
  termLife: 'Term life',
};

export const profile = {
  firstName: 'Jon',
  lastName: 'K.',
  email: 'jon@example.com',
  phone: '+1 (555) 010-0142',
  dob: '02 / 14 / 1988',
  country: 'United States of America',
  state: 'New York',
  memberId: 'MZ-2026-0417',
};

const DAY = 86_400_000;

/** Active, renewing within 60 days, or expired, from the policy's own dates. */
export function statusFor(effective: string | null, expires: string | null, today = new Date()): PolicyStatus {
  if (!effective || !expires) return 'unknown';
  const end = new Date(`${expires}T23:59:59`);
  if (end.getTime() < today.getTime()) return 'expired';
  if (end.getTime() - today.getTime() < 60 * DAY) return 'expiring';
  return 'active';
}

const withStatus = (p: Policy): Policy => ({ ...p, status: statusFor(p.effective, p.expires) });

// Two autos, two term life, and one of every other line the client has a page for.
export const seedPolicies: Policy[] = [
  personalAuto,
  commercialAuto,
  renters,
  condo,
  personalUmbrella,
  commercialUmbrella,
  generalLiability,
  commercialProperty,
  bop,
  workersComp,
  commercialPackage,
  termLifeLevel20,
  termLifeConvertible10,
].map(withStatus);

/** The policy that "arrives" when a demo upload finishes. */
export function makeUploadedPolicy(id: string, fileName: string): Policy {
  const cite = 'declarations';
  return {
    id,
    title: 'Moving Protection · Baker Van Lines',
    type: 'renters',
    carrier: 'Baker Transit Assurance',
    number: 'BT-1008-8197',
    status: 'unknown',
    effective: null,
    expires: null,
    premium: 310,
    premiumLabel: 'One-time',
    deductible: 250,
    policyholder: `${profile.firstName} ${profile.lastName}`,
    coverages: [
      { key: 'property', label: 'Goods in transit', limit: 40000 },
      { key: 'valuables', label: 'High-value items', limit: 5000, note: 'Must be listed' },
    ],
    exclusions: ['Items you packed yourself', 'Cash, documents and jewelry'],
    insights: [
      {
        id: `${id}-1`,
        tone: 'warn',
        title: 'I couldn’t find an end date',
        body: 'The document lists a move date but no coverage period, so I can’t say whether this is still active.',
      },
      {
        id: `${id}-2`,
        tone: 'gap',
        title: 'Self-packed boxes aren’t covered',
        body: 'Damage inside boxes you packed yourself is excluded unless the box itself is visibly crushed.',
      },
    ],
    coveredLabel: 'Individuals covered',
    covered: [{ name: `${profile.firstName} ${profile.lastName}`, role: 'Policyholder' }],
    assetsLabel: 'Property covered',
    assets: [],
    details: {
      included: [
        { title: 'Goods in transit', text: 'Up to $40,000 for goods loaded by the mover.', source: cite },
        { title: 'High-value items', text: 'Up to $5,000 for items listed before the move.', source: cite },
      ],
      specs: [],
      excluded: [
        { title: 'Self-packed boxes', text: 'Items you packed yourself are not covered.', source: cite },
        { title: 'Cash, documents and jewelry', text: 'Cash, documents and jewelry are not covered.', source: cite },
      ],
      limits: [],
      watch: [
        {
          title: 'No coverage period stated',
          text: 'The document lists a move date but no coverage period.',
          source: cite,
          severity: 'Moderate',
        },
      ],
      deductibles: [{ title: 'Deductible', text: 'A $250 deductible applies to each claim.', source: cite }],
    },
    sources: [{ id: cite, title: 'Moving protection summary', pages: [2] }],
    documentMap: [{ title: 'Moving protection summary', ref: 'PDF page 2', source: cite }],
    notAvailable: ['A coverage period or end date.'],
    documents: [{ name: fileName, pages: 9 }],
    uploadedAt: new Date().toISOString().slice(0, 10),
  };
}

/** Lines of cover Mosey knows how to recognise, for the "what you have / don't" map. */
export const COVERAGE_MAP: { key: string; label: string; types: PolicyType[] }[] = [
  { key: 'place', label: 'Home, condo or renters', types: ['renters', 'condo'] },
  { key: 'auto', label: 'Auto', types: ['personalAuto', 'commercialAuto'] },
  { key: 'umbrella', label: 'Umbrella', types: ['personalUmbrella', 'commercialUmbrella'] },
  { key: 'life', label: 'Life', types: ['termLife'] },
  { key: 'liability', label: 'Business liability', types: ['generalLiability', 'bop', 'commercialPackage'] },
  { key: 'property', label: 'Business property', types: ['commercialProperty', 'bop', 'commercialPackage'] },
  { key: 'workers', label: 'Workers’ comp', types: ['workersComp'] },
  { key: 'health', label: 'Health', types: [] },
  { key: 'disability', label: 'Disability', types: [] },
];

export function money(n: number | null, compact = false): string {
  if (n === null) return '—';
  if (compact && n >= 1000) {
    const k = n / 1000;
    return `$${k >= 100 || Number.isInteger(k) ? Math.round(k) : k.toFixed(1)}k`;
  }
  return `$${n.toLocaleString('en-US')}`;
}

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export function shortDate(iso: string | null): string {
  if (!iso) return 'Unknown';
  const [y, m, d] = iso.split('-').map(Number);
  return `${MONTHS[m - 1]} ${d}, ${y}`;
}

export function statusLabel(p: Policy): string {
  switch (p.status) {
    case 'active':
      return 'Active';
    case 'expiring':
      return 'Renews soon';
    case 'expired':
      return 'Expired';
    default:
      return 'Dates unknown';
  }
}

export function maskNumber(n: string): string {
  return `•••• ${n.slice(-4)}`;
}
