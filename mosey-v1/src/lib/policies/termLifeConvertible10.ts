import type { Policy } from '../policyTypes';

export const termLifeConvertible10: Policy = {
  id: 'termLifeConvertible10',
  title: 'Term Life · Jordan A. Okafor',
  type: 'termLife',
  carrier: 'Northlane Life',
  number: 'NLL-GT-0093352',
  status: 'unknown',
  effective: '2017-11-20',
  expires: '2027-11-20',
  premium: 180,
  premiumLabel: 'Per year',
  deductible: null,
  policyholder: 'Jordan A. Okafor',
  form: '10-Year Convertible Term Life Certificate · NLL-CT-2017 (11-17)',
  payment: 'Annually · paid by employer',
  coverages: [
    {
      key: 'deathBenefit',
      label: 'Death benefit',
      limit: 250000,
      note: 'Paid to the beneficiary on death within the term',
    },
    {
      key: 'annualPremium',
      label: 'Annual premium',
      limit: 180,
      note: 'Paid annually by employer',
    },
    {
      key: 'termLength',
      label: 'Term',
      limit: null,
      note: '10 years, Nov 20 2017 to Nov 20 2027',
    },
  ],
  exclusions: [
    'Misrepresentation or fraud in the application',
    'Death while committing or attempting a criminal act',
    'Suicide within 2 years of the effective date',
  ],
  insights: [
    {
      id: 'termLifeConvertible10-1',
      tone: 'good',
      title: '$250,000 death benefit',
      body: 'The policy pays a fixed $250,000 to the primary beneficiary if Jordan A. Okafor dies during the term, which ends Nov 20 2027.',
    },
    {
      id: 'termLifeConvertible10-2',
      tone: 'gap',
      title: 'Term ends Nov 20 2027',
      body: 'After Nov 20 2027 there is no death benefit unless the policy has been converted. The conversion window closes May 20 2027.',
    },
    {
      id: 'termLifeConvertible10-3',
      tone: 'warn',
      title: 'Convertible to a permanent policy',
      body: 'The policy grants an option to convert to a whole life policy until May 20 2027, six months before the term ends.',
    },
    {
      id: 'termLifeConvertible10-4',
      tone: 'warn',
      title: 'No contingent beneficiary on file',
      body: 'Only a primary beneficiary is named. Beneficiaries can be updated and are worth reviewing from time to time.',
    },
  ],
  coveredLabel: 'Insured and beneficiaries',
  covered: [
    {
      name: 'Jordan A. Okafor',
      role: 'Insured',
      note: 'The employee insured under the policy',
      source: 'declarations',
    },
    {
      name: 'Amara Okafor',
      role: 'Primary beneficiary',
      note: 'Sister · 100% of the death benefit',
      source: 'beneficiaries',
    },
  ],
  assetsLabel: 'Policy covered',
  assets: [
    {
      id: 'contract',
      kind: 'Contract',
      name: '10-Year Convertible Term Life Contract',
      facts: [
        ['Death benefit', '$250,000'],
        ['Term', '10 years · Nov 20 2017 to Nov 20 2027'],
        ['Premium', '$180 per year'],
        ['Payment frequency', 'Annually'],
        ['Payment method', 'Paid by employer'],
        ['Convertible', 'Yes · until May 20 2027'],
      ],
      coverages: [
        {
          title: 'Death benefit',
          limit: '$250,000',
          text: 'A fixed $250,000 is paid to the primary beneficiary if the insured dies during the term while the policy is in force. No death benefit is paid after the term ends on Nov 20 2027 unless the policy has been converted.',
          source: 'benefit',
        },
      ],
      source: 'declarations',
    },
  ],
  details: {
    included: [
      {
        title: 'Death benefit',
        text: 'The policy pays $250,000 to the primary beneficiary if the insured dies during the term, Nov 20 2017 to Nov 20 2027.',
        source: 'benefit',
        group: 'Across your policy',
        limit: '$250,000',
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
        title: 'Criminal activity',
        text: 'No death benefit is paid if the insured dies while committing or attempting to commit a felony.',
        source: 'criminal',
        group: 'Across your policy',
      },
      {
        title: 'Suicide within 2 years of the effective date',
        text: 'If the insured dies by suicide within 2 years of Nov 20 2017, no death benefit is paid and the premiums paid are returned instead.',
        source: 'suicide',
        group: 'Across your policy',
      },
    ],
    limits: [
      {
        title: 'Term ends Nov 20 2027',
        text: 'The term ends on Nov 20 2027. After that date there is no death benefit unless the policy was converted.',
        source: 'declarations',
        group: 'Across your policy',
      },
      {
        title: '30-day grace period',
        text: 'A premium not paid by its due date can be paid within 30 days after it without losing coverage. Coverage ends if the premium is not paid by the end of the grace period.',
        source: 'grace',
        group: 'Across your policy',
      },
      {
        title: 'Conversion window',
        text: 'The policy can be converted to a whole life policy until May 20 2027, six months before the term ends.',
        source: 'conversion',
        group: 'Across your policy',
      },
    ],
    watch: [
      {
        title: 'Term ends Nov 20 2027',
        text: 'The term ends on Nov 20 2027. After that date there is no death benefit unless the policy was converted before the conversion window closes on May 20 2027. Review with your insurance professional.',
        source: 'declarations',
        severity: 'Critical',
        group: 'Across your policy',
      },
      {
        title: 'Conversion option ends May 20 2027',
        text: 'The policy grants the option to convert to a whole life policy until May 20 2027. The premium after conversion is not stated in the pages analyzed. Review with your insurance professional.',
        source: 'conversion',
        severity: 'Moderate',
        group: 'Across your policy',
      },
      {
        title: 'Review your beneficiaries',
        text: 'Amara Okafor is the only beneficiary named, and no contingent beneficiary is listed. Beneficiaries can be updated, and a periodic review is a reminder only. Review with your insurance professional.',
        source: 'beneficiaries',
        severity: 'Low',
        group: 'Across your policy',
      },
    ],
    deductibles: [],
    specs: [
      {
        title: 'Policy form',
        text: '10-Year Convertible Term Life Certificate, NLL-CT-2017 (11-17), issued under an employer-sponsored program.',
        source: 'declarations',
        group: 'Across your policy',
      },
      {
        title: 'Convertible term',
        text: 'The term policy is convertible to a whole life policy until May 20 2027.',
        source: 'conversion',
        group: 'Across your policy',
      },
      {
        title: 'Payment method',
        text: 'Premium is $180 per year, paid annually by the insured’s employer.',
        source: 'declarations',
        group: 'Across your policy',
      },
    ],
  },
  sources: [
    {
      id: 'declarations',
      title: 'Certificate Schedule',
      pages: [2],
      form: 'NLL-CT-2017 (11-17)',
      entries: [
        ['Carrier', 'Northlane Life'],
        ['Policy number', 'NLL-GT-0093352'],
        ['Insured', 'Jordan A. Okafor'],
        ['Effective date', 'Nov 20 2017'],
        ['Term', '10 years, ends Nov 20 2027'],
        ['Death benefit', '$250,000'],
        ['Annual premium', '$180'],
        ['Premium payment', 'Annually, paid by employer'],
      ],
    },
    {
      id: 'beneficiaries',
      title: 'Beneficiary Designation',
      pages: [3],
      form: 'NLL-BEN-2017 (11-17)',
      entries: [
        ['Primary beneficiary', 'Amara Okafor, sister, 100%'],
      ],
    },
    {
      id: 'benefit',
      title: 'Death Benefit',
      pages: [4],
      form: 'NLL-CT-2017 (11-17)',
      entries: [
        ['Death benefit', '$250,000'],
        ['Payable to', 'Primary beneficiary on death of the insured within the term'],
        ['After the term', 'No death benefit unless converted'],
      ],
    },
    {
      id: 'grace',
      title: 'Grace Period',
      pages: [5],
      form: 'NLL-CT-2017 (11-17)',
      entries: [
        ['Grace period', '30 days after the premium due date'],
        ['Effect of non-payment', 'Coverage ends at the end of the grace period'],
      ],
    },
    {
      id: 'misrepresentation',
      title: 'Misrepresentation and Fraud',
      pages: [8],
      form: 'NLL-CT-2017 (11-17)',
      entries: [
        ['Applies to', 'Material misrepresentation or fraud in the application'],
      ],
    },
    {
      id: 'criminal',
      title: 'Criminal Activity Exclusion',
      pages: [8],
      form: 'NLL-CT-2017 (11-17)',
      entries: [
        ['Applies to', 'Death while committing or attempting to commit a felony'],
      ],
    },
    {
      id: 'suicide',
      title: 'Suicide Exclusion',
      pages: [9],
      form: 'NLL-CT-2017 (11-17)',
      entries: [
        ['Period', '2 years from the effective date'],
        ['Effect', 'No death benefit; premiums paid are returned'],
      ],
    },
    {
      id: 'conversion',
      title: 'Conversion Privilege',
      pages: [11],
      form: 'NLL-CONV-2017 (11-17)',
      entries: [
        ['Convert to', 'A whole life policy offered by the carrier'],
        ['Conversion deadline', 'May 20 2027, six months before the term ends'],
      ],
    },
  ],
  documentMap: [
    {
      title: 'Certificate Schedule',
      ref: 'NLL-CT-2017 (11-17) · Page 2',
      source: 'declarations',
    },
    {
      title: 'Beneficiary Designation',
      ref: 'NLL-BEN-2017 (11-17) · Page 3',
      source: 'beneficiaries',
    },
    {
      title: 'Death Benefit',
      ref: 'NLL-CT-2017 (11-17) · Page 4',
      source: 'benefit',
    },
    {
      title: 'Grace Period',
      ref: 'NLL-CT-2017 (11-17) · Page 5',
      source: 'grace',
    },
    {
      title: 'Misrepresentation and Criminal Activity',
      ref: 'NLL-CT-2017 (11-17) · Page 8',
      source: 'misrepresentation',
    },
    {
      title: 'Suicide Exclusion',
      ref: 'NLL-CT-2017 (11-17) · Page 9',
      source: 'suicide',
    },
    {
      title: 'Conversion Privilege',
      ref: 'NLL-CONV-2017 (11-17) · Page 11',
      source: 'conversion',
    },
  ],
  notAvailable: [
    'Agent or planner contact details',
    'Riders or endorsements (none stated in the pages analyzed)',
    'Contestability period length',
    'Reinstatement provisions',
    'Premium amount after conversion to a whole life policy',
    'Cash value (term life has none)',
  ],
  documents: [
    {
      name: 'northlane-term-policy.pdf',
      pages: 14,
    },
  ],
  uploadedAt: '2026-09-28',
};
