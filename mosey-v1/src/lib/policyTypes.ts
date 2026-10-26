// The shape of a policy in the prototype. It follows the section framework the
// client uses on its insight pages (see docs/client-framework.md), so each
// client section has one obvious home here. How these are laid out on screen
// is ours and will change; the data should not need to.

export type PolicyType =
  | 'personalAuto'
  | 'commercialAuto'
  | 'renters'
  | 'condo'
  | 'personalUmbrella'
  | 'commercialUmbrella'
  | 'generalLiability'
  | 'commercialProperty'
  | 'bop'
  | 'workersComp'
  | 'commercialPackage'
  | 'termLife';

export type PolicyStatus = 'active' | 'expiring' | 'expired' | 'unknown';
export type Tone = 'good' | 'warn' | 'gap';

/** The client's watch-point severity labels. Never "major gap". */
export type Severity = 'Critical' | 'Moderate' | 'Low';

export type Insight = { id: string; tone: Tone; title: string; body: string };

/** One line of "limits at a glance". `limit` is a number when the policy states one. */
export type Coverage = { key: string; label: string; limit: number | null; note?: string };

/**
 * Where a statement was read from. Mirrors the client's EVIDENCE entries:
 * a titled passage with PDF page numbers, the form it came from, the key/value
 * facts read off it and sometimes a verbatim excerpt.
 */
export type Source = {
  id: string;
  title: string;
  /** PDF pages in the uploaded document, first one is the one we cite. */
  pages: number[];
  form?: string;
  entries?: [label: string, value: string][];
  excerpt?: string;
};

/** The six groups of policy detail, in the client's order. */
export type DetailKind = 'included' | 'specs' | 'excluded' | 'limits' | 'watch' | 'deductibles';

/** One titled statement in a detail group. `source` is a `Source.id`. */
export type DetailItem = {
  title: string;
  text: string;
  source?: string;
  /** Only on `watch` items. */
  severity?: Severity;
  /** The asset it belongs to, e.g. "2018 Hyundai Elantra", or "Across your policy". */
  group?: string;
  /** As printed on the schedule, when this item is a scheduled coverage. */
  limit?: string;
  deductible?: string;
  premium?: string;
};

/** "Individuals covered" / named insureds / additional insureds / beneficiaries. */
export type Covered = { name: string; role?: string; note?: string; source?: string };

/** A vehicle, location, unit, rented home, class of employee, layer... whatever the line treats as an asset. */
export type Asset = {
  id: string;
  /** e.g. 'Vehicle', 'Location', 'Unit', 'Home', 'Layer'. */
  kind: string;
  /** The real name ("2018 Hyundai Elantra"), never "Vehicle 1". */
  name: string;
  facts: [label: string, value: string][];
  coverages: {
    title: string;
    /** As printed, e.g. "$100,000 per person / $300,000 per accident". */
    limit: string;
    deductible?: string;
    premium?: string;
    /** On the schedule but not taken, e.g. "Medical expense benefits · Declined". */
    declined?: boolean;
    text: string;
    source?: string;
  }[];
  source?: string;
};

export type PolicyDocument = {
  name: string;
  pages: number;
  /** A sample file we can open. Only set where the client hosts a real PDF. */
  url?: string;
};

export type Policy = {
  id: string;
  title: string;
  type: PolicyType;
  carrier: string;
  number: string;
  status: PolicyStatus;
  effective: string | null;
  expires: string | null;

  /** Total premium for the term, as a number, and what the term is. */
  premium: number;
  premiumLabel: string; // "Per 6 months", "Per year", "One-time"
  /** Headline deductible for the stats row. Null when the line has none. */
  deductible: number | null;

  /** Named insured / policyholder. */
  policyholder: string;
  /** The policy name and form number as the client prints them, e.g. "Personal Auto Policy · PP 00 01 09 18". */
  form?: string;
  payment?: string;

  /** Limits at a glance, plus the older flat lists the chat and compare screens read. */
  coverages: Coverage[];
  exclusions: string[];
  insights: Insight[];

  /** "Individuals covered", named insureds etc. */
  coveredLabel: string;
  covered: Covered[];
  /** "Vehicles covered", "Property covered"... */
  assetsLabel: string;
  assets: Asset[];

  /** Policy details, grouped the way the client groups them. */
  details: Record<DetailKind, DetailItem[]>;
  sources: Source[];
  /** The client's "Document sources" list: which forms sit on which pages. */
  documentMap: { title: string; ref: string; source?: string }[];
  /** The client's "Not available in the pages analyzed". */
  notAvailable: string[];

  documents: PolicyDocument[];
  uploadedAt: string;
  sharedBy?: string;
};
