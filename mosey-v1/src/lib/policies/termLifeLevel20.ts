import type { Policy } from '../policyTypes';

export const termLifeLevel20: Policy = {
  id: 'termLifeLevel20',
  title: 'Term Life · Dana R. Whitlock',
  type: 'termLife',
  carrier: 'Evergreen Life Assurance',
  number: 'EGL-TL-4480217',
  status: 'unknown',
  effective: '2022-06-15',
  expires: '2042-06-15',
  premium: 396,
  premiumLabel: 'Per year',
  deductible: null,
  policyholder: 'Dana R. Whitlock',
  form: '20-Year Level Term Life Insurance Policy · ICC-TL-2022 (06-22)',
  payment: 'Monthly by autopay · $33.00 per month',
  coverages: [
    {
      key: 'deathBenefit',
      label: 'Death benefit',
      limit: 500000,
      note: 'Paid to beneficiaries on death within the term',
    },
    {
      key: 'acceleratedDeathBenefit',
      label: 'Accelerated death benefit rider',
      limit: 250000,
      note: 'Terminal illness, up to 50% of the death benefit',
    },
    {
      key: 'termLength',
      label: 'Level term',
      limit: null,
      note: '20 years, Jun 15 2022 to Jun 15 2042',
    },
  ],
  exclusions: [
    'Misrepresentation or fraud in the application',
    'Suicide within 2 years of the policy date (premiums paid are returned)',
  ],
  insights: [
    {
      id: 'termLifeLevel20-1',
      tone: 'good',
      title: '$500,000 death benefit, level for 20 years',
      body: 'The policy pays a fixed $500,000 to the beneficiaries if Dana R. Whitlock dies between Jun 15 2022 and Jun 15 2042.',
    },
    {
      id: 'termLifeLevel20-2',
      tone: 'good',
      title: 'Terminal illness rider included',
      body: 'The Accelerated Death Benefit Rider can pay up to 50% of the death benefit, up to $250,000, on a terminal illness diagnosis.',
    },
    {
      id: 'termLifeLevel20-3',
      tone: 'warn',
      title: 'Conversion option has a deadline',
      body: 'The policy can be converted to a permanent policy until Jun 15 2032. After that date the option is no longer available.',
    },
    {
      id: 'termLifeLevel20-4',
      tone: 'gap',
      title: 'Premiums are due monthly',
      body: 'The $33.00 premium is due on the 15th of each month by autopay. A 31-day grace period applies, and coverage ends if the premium is not paid by the end of it.',
    },
  ],
  coveredLabel: 'Insured and beneficiaries',
  covered: [
    {
      name: 'Dana R. Whitlock',
      role: 'Insured',
      note: 'The life insured under the policy',
      source: 'declarations',
    },
    {
      name: 'Priya Whitlock',
      role: 'Primary beneficiary',
      note: 'Spouse · 100% of the death benefit',
      source: 'beneficiaries',
    },
    {
      name: 'Eli Whitlock',
      role: 'Contingent beneficiary',
      note: 'Son · 100% if the primary beneficiary does not survive the insured',
      source: 'beneficiaries',
    },
  ],
  assetsLabel: 'Policy covered',
  assets: [
    {
      id: 'contract',
      kind: 'Contract',
      name: '20-Year Level Term Life Contract',
      facts: [
        ['Death benefit', '$500,000'],
        ['Term', '20 years · Jun 15 2022 to Jun 15 2042'],
        ['Premium', '$396 per year'],
        ['Payment frequency', 'Monthly · $33.00 per month by autopay'],
        ['Premium type', 'Level for the term'],
        ['Convertible', 'Yes · until Jun 15 2032'],
      ],
      coverages: [
        {
          title: 'Death benefit',
          limit: '$500,000',
          text: 'A fixed $500,000 is paid to the beneficiaries if the insured dies during the term while the policy is in force. No death benefit is paid after the term ends on Jun 15 2042 unless the policy has been converted.',
          source: 'benefit',
        },
        {
          title: 'Accelerated Death Benefit Rider',
          limit: 'Up to 50% of the death benefit, maximum $250,000',
          text: 'Pays part of the death benefit in advance if the insured is diagnosed as terminally ill. Any amount paid under the rider is deducted from the death benefit paid to the beneficiaries.',
          source: 'rider',
        },
      ],
      source: 'declarations',
    },
  ],
  details: {
    included: [
      {
        title: 'Death benefit',
        text: 'The policy pays $500,000 to the beneficiaries if the insured dies during the term, Jun 15 2022 to Jun 15 2042.',
        source: 'benefit',
        group: 'Across your policy',
        limit: '$500,000',
      },
      {
        title: 'Accelerated Death Benefit Rider',
        text: 'The rider pays up to 50% of the death benefit, up to $250,000, in advance on a terminal illness diagnosis. The rider adds coverage and reduces the death benefit paid later by the amount advanced.',
        source: 'rider',
        group: 'Across your policy',
        limit: 'Up to 50% of the death benefit, maximum $250,000',
      },
    ],
    excluded: [
      {
        title: 'Misrepresentation or fraud in the application',
        text: 'A claim can be denied or the policy rescinded if the application contains a material misrepresentation or fraud.',
        source: 'misrepresentation',
        group: 'Across your policy',
      },
      {
        title: 'Suicide within 2 years of the policy date',
        text: 'If the insured dies by suicide within 2 years of Jun 15 2022, no death benefit is paid and the premiums paid are returned instead.',
        source: 'suicide',
        group: 'Across your policy',
      },
    ],
    limits: [
      {
        title: 'Term ends Jun 15 2042',
        text: 'The term ends on Jun 15 2042. After that date there is no death benefit unless the policy was converted.',
        source: 'declarations',
        group: 'Across your policy',
      },
      {
        title: '31-day grace period',
        text: 'A premium not paid by its due date can be paid within 31 days after it without losing coverage. Coverage ends if the premium is not paid by the end of the grace period.',
        source: 'grace',
        group: 'Across your policy',
      },
      {
        title: '2-year contestability period',
        text: 'For 2 years from Jun 15 2022 the insurer may contest statements made in the application. This period is separate from the suicide exclusion.',
        source: 'contestability',
        group: 'Across your policy',
      },
      {
        title: 'Reinstatement window',
        text: 'A policy that ended after the grace period can be reinstated within 3 years of the premium due date that went unpaid, with evidence of insurability and payment of the overdue premiums.',
        source: 'reinstatement',
        group: 'Across your policy',
      },
      {
        title: 'Conversion window',
        text: 'The policy can be converted to a permanent policy until Jun 15 2032, the 10th policy anniversary.',
        source: 'conversion',
        group: 'Across your policy',
      },
    ],
    watch: [
      {
        title: 'Premium due on the 15th of each month',
        text: 'The $33.00 premium is due on the 15th of each month by autopay. Coverage ends if a premium is not paid by the end of the 31-day grace period. Review with your insurance professional.',
        source: 'grace',
        severity: 'Critical',
        group: 'Across your policy',
      },
      {
        title: 'Conversion option ends Jun 15 2032',
        text: 'The policy grants the option to convert to a permanent policy without a new medical exam until Jun 15 2032. The premium after conversion is not stated in the pages analyzed. Review with your insurance professional.',
        source: 'conversion',
        severity: 'Moderate',
        group: 'Across your policy',
      },
      {
        title: 'Review your beneficiaries',
        text: 'Priya Whitlock is the primary beneficiary and Eli Whitlock is the contingent beneficiary. Beneficiaries can be updated, and a periodic review is a reminder only. Review with your insurance professional.',
        source: 'beneficiaries',
        severity: 'Low',
        group: 'Across your policy',
      },
    ],
    deductibles: [],
    specs: [
      {
        title: 'Policy form',
        text: '20-Year Level Term Life Insurance Policy, ICC-TL-2022 (06-22). Level premium for the 20-year term.',
        source: 'declarations',
        group: 'Across your policy',
      },
      {
        title: 'Convertible term',
        text: 'The term policy is convertible to a permanent policy until Jun 15 2032.',
        source: 'conversion',
        group: 'Across your policy',
      },
      {
        title: 'Payment method',
        text: 'Premium is paid monthly by autopay, $33.00 per month, $396 per year.',
        source: 'declarations',
        group: 'Across your policy',
      },
      {
        title: 'Accelerated Death Benefit Rider (ICC-ADB-2022)',
        text: 'Terminal illness rider. Adds coverage: up to 50% of the death benefit, maximum $250,000, advanced before death.',
        source: 'rider',
        group: 'Across your policy',
      },
    ],
  },
  sources: [
    {
      id: 'declarations',
      title: 'Policy Schedule',
      pages: [3],
      form: 'ICC-TL-2022 (06-22)',
      entries: [
        ['Carrier', 'Evergreen Life Assurance'],
        ['Policy number', 'EGL-TL-4480217'],
        ['Insured and policyholder', 'Dana R. Whitlock'],
        ['Policy date', 'Jun 15 2022'],
        ['Term', '20 years, ends Jun 15 2042'],
        ['Death benefit', '$500,000'],
        ['Annual premium', '$396'],
        ['Premium payment', 'Monthly, $33.00, by autopay'],
      ],
    },
    {
      id: 'benefit',
      title: 'Death Benefit',
      pages: [5],
      form: 'ICC-TL-2022 (06-22)',
      entries: [
        ['Death benefit', '$500,000'],
        ['Payable to', 'Beneficiaries on death of the insured within the term'],
        ['After the term', 'No death benefit unless converted'],
      ],
    },
    {
      id: 'beneficiaries',
      title: 'Beneficiary Designation',
      pages: [4],
      form: 'ICC-BEN-2022 (06-22)',
      entries: [
        ['Primary beneficiary', 'Priya Whitlock, spouse, 100%'],
        [
          'Contingent beneficiary',
          'Eli Whitlock, son, 100% if the primary beneficiary does not survive the insured',
        ],
      ],
    },
    {
      id: 'grace',
      title: 'Grace Period',
      pages: [6],
      form: 'ICC-TL-2022 (06-22)',
      entries: [
        ['Grace period', '31 days after the premium due date'],
        ['Effect of non-payment', 'Coverage ends at the end of the grace period'],
      ],
    },
    {
      id: 'suicide',
      title: 'Suicide Exclusion',
      pages: [7],
      form: 'ICC-TL-2022 (06-22)',
      entries: [
        ['Period', '2 years from the policy date'],
        ['Effect', 'No death benefit; premiums paid are returned'],
      ],
    },
    {
      id: 'contestability',
      title: 'Contestability Period',
      pages: [7],
      form: 'ICC-TL-2022 (06-22)',
      entries: [
        ['Period', '2 years from the policy date'],
        ['Effect', 'The insurer may contest statements made in the application'],
      ],
    },
    {
      id: 'misrepresentation',
      title: 'Misrepresentation and Fraud',
      pages: [8],
      form: 'ICC-TL-2022 (06-22)',
      entries: [
        ['Applies to', 'Material misrepresentation or fraud in the application'],
      ],
    },
    {
      id: 'conversion',
      title: 'Conversion Privilege',
      pages: [9],
      form: 'ICC-CONV-2022 (06-22)',
      entries: [
        ['Convert to', 'A permanent policy offered by the carrier'],
        ['Conversion deadline', 'Jun 15 2032, the 10th policy anniversary'],
        ['Medical exam', 'Not required to convert'],
      ],
    },
    {
      id: 'rider',
      title: 'Accelerated Death Benefit Rider',
      pages: [11, 12],
      form: 'ICC-ADB-2022 (06-22)',
      entries: [
        ['Trigger', 'Terminal illness diagnosis'],
        ['Maximum advance', '50% of the death benefit, up to $250,000'],
        ['Effect on death benefit', 'Reduced by the amount advanced'],
      ],
    },
    {
      id: 'reinstatement',
      title: 'Reinstatement',
      pages: [13],
      form: 'ICC-TL-2022 (06-22)',
      entries: [
        ['Window', '3 years from the unpaid premium due date'],
        ['Requirements', 'Evidence of insurability and payment of overdue premiums'],
      ],
    },
  ],
  documentMap: [
    {
      title: 'Policy Schedule',
      ref: 'ICC-TL-2022 (06-22) · Page 3',
      source: 'declarations',
    },
    {
      title: 'Beneficiary Designation',
      ref: 'ICC-BEN-2022 (06-22) · Page 4',
      source: 'beneficiaries',
    },
    {
      title: 'Death Benefit',
      ref: 'ICC-TL-2022 (06-22) · Page 5',
      source: 'benefit',
    },
    {
      title: 'Grace Period',
      ref: 'ICC-TL-2022 (06-22) · Page 6',
      source: 'grace',
    },
    {
      title: 'Suicide Exclusion and Contestability',
      ref: 'ICC-TL-2022 (06-22) · Page 7',
      source: 'suicide',
    },
    {
      title: 'Misrepresentation and Fraud',
      ref: 'ICC-TL-2022 (06-22) · Page 8',
      source: 'misrepresentation',
    },
    {
      title: 'Conversion Privilege',
      ref: 'ICC-CONV-2022 (06-22) · Page 9',
      source: 'conversion',
    },
    {
      title: 'Accelerated Death Benefit Rider',
      ref: 'ICC-ADB-2022 (06-22) · Pages 11-12',
      source: 'rider',
    },
    {
      title: 'Reinstatement',
      ref: 'ICC-TL-2022 (06-22) · Page 13',
      source: 'reinstatement',
    },
  ],
  notAvailable: [
    'Agent or planner contact details',
    'Premium amount after conversion to a permanent policy',
    'Cash value (term life has none)',
    'Policy loan or surrender provisions',
    'Claims filing instructions',
  ],
  documents: [
    {
      name: 'evergreen-life-term-policy.pdf',
      pages: 18,
    },
  ],
  uploadedAt: '2026-09-28',
};
