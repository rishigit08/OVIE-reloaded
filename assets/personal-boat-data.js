/* Content is grounded in the supplied summary, not an independently inspected policy PDF. */
const BOAT_FORM = 'MA-14558A (04/05)';
const BOAT_TITLE = 'Yachtsman / Windjammer / Boatsman Policy';
const boatEvidence = (title, pages, excerpt) => ({title, ref:`${BOAT_TITLE} · pages ${pages} reported in the supplied summary`, form:BOAT_FORM, excerpt});
const EVIDENCE = {
 identity: boatEvidence('Policy wording and missing declarations','1, 3–10','The supplied summary identifies the product and governing form. It does not provide the declarations, named insured, underwriting company, policy number, term dates or premium.'),
 people: boatEvidence('Who the wording may cover','3, 5–6','The summary describes “you or your” as the named insured and resident spouse. Permitted operators or organizations may meet the covered-person definition, subject to restrictions. Passenger and towed-person eligibility depends on the relevant liability or medical-payments wording.'),
 assets: boatEvidence('Vessels and insured property','3','No scheduled vessel is shown. The summary describes original equipment and permanently attached property, with motors, tenders, trailers and personal effects subject to definitions or listing requirements.'),
 navigation: boatEvidence('Navigation and lay-up conditions','7–8','The summary mentions the United States, Alaska, Hawaii, Puerto Rico and Canada, subject to amendments and scheduled navigation warranties. Its geographical grouping and description of a 10-day breach correction provision require the original clause to establish their scope. No navigation schedule, home port or lay-up period is supplied.'),
 liability: boatEvidence('Liability and defense costs','5','Part B is described as covering legal liability arising from ownership, maintenance or use of a covered vessel, subject to exclusions. The summary describes defense costs as additional to liability limits unless amended. The selected coverage and limit are unavailable.'),
 injury: boatEvidence('Medical payments and uninsured boater','6','Part C is described as medical and funeral expenses for qualifying accidental injury arising from use of the insured vessel. Part D is described as compensatory damages for bodily injury in a collision with an uninsured vessel, subject to its terms and limits.'),
 hull: boatEvidence('Hull and attached equipment','3–4','Part A is described as accidental direct physical loss or damage to insured watercraft, spars, sails, machinery, electronics and attached equipment, including trailers if listed. The actual insured property and amounts are unavailable.'),
 assistance: boatEvidence('Towing, salvage and wreck removal','4–5, 10','The summary describes commercial towing and assistance for a breakdown or disablement when the vessel and people are not in imminent danger. It also describes legally required wreck removal, subject to policy limits. Approval and assistance conditions require the original wording and schedule.'),
 personal: boatEvidence('Personal property and fishing equipment','7–8','Part G is described as direct and accidental loss to personal property on board when insured and declared. Settlement is described as the lowest of actual cash value, repair or replacement cost for scheduled property. Wear, deterioration, marine life and unsecured-theft restrictions are reported.'),
 exclusions: boatEvidence('Property and liability exclusions','4, 6–10','The summary lists wear, deterioration, rot, corrosion, marine growth, zebra mussels, vermin, manufacturing defects and mechanical or electrical breakdown with limited exceptions; theft conditions; territorial and use restrictions; war and nuclear hazards. Liability exclusions reported include household, employee and paid-crew injury, intentional or criminal acts, pollution and commercial use. Exact clauses and exceptions were not supplied.'),
 use: boatEvidence('Crew, commercial use and operator restrictions','6, 9','The summary reports exclusions for paid-crew injury, hire/livery or commercial carriage of passengers or cargo, racing, and unlicensed or unapproved operation. No actual operator, crew, charter activity or intended use is identified.'),
 conditions: boatEvidence('Policy conditions and new vessels','8–10','The summary reports written insurer consent for assignment and consequences for concealment, misrepresentation or fraud. It does not establish automatic coverage for a newly acquired or replacement vessel. Absence of that evidence does not establish an exclusion.'),
 valuation: boatEvidence('Valuation and loss settlement','4, 7, 13','The summary describes repair, replacement and actual-cash-value comparisons, with depreciation for some property. It separately describes trailer and personal-property settlement. The original base form, applicable endorsement and scheduled value are needed to resolve the vessel’s settlement basis.'),
 endorsements: boatEvidence('Length and age-dependent settlement provisions','13','The summary references MA7Z04 (4/00) for vessels over 26 feet and MA6508b (04/01) for vessels under 27 feet. It describes depreciated settlement for plastics/canvas, sails and outboards/outdrives over 5 years old; the shorter-vessel provision also addresses machinery inside the vessel over 7 years old. Applicability and exact item-level age qualifications require the original endorsements and vessel schedule.'),
 deductibles: boatEvidence('Deductible provisions','4, 7','The summary says the declarations deductible applies separately by coverage part and item of property, per occurrence. Separate property, trailer or personal-property amounts may apply. Liability, medical payments and uninsured-boater deductibles are described as absent unless otherwise shown. No actual amounts or named-storm deductible are supplied.'),
 claims: boatEvidence('Claims duties and assistance administration','5–6, 10','The summary describes cooperation, protection of property, inspection and separation of damaged property, plus sworn proof of loss for medical payments and on request for property damage. No claims contact is identified. Assistance approval requirements and limits are not established without the original wording and schedule.')
};
const BOAT = {
 included:[
  {heading:'Liability & injury',items:[
   {title:'Watercraft liability',text:'The sample describes damages you are legally liable to pay from ownership, maintenance or use of a covered vessel. The selected limit is not available.',source:'liability'},
   {title:'Defense costs',text:'Described as additional to the liability limit, unless an endorsement changes that treatment.',source:'liability'},
   {title:'Medical payments',text:'Medical and funeral expenses for qualifying accidental injury connected with use of the insured vessel. Eligibility and limits remain subject to the wording.',source:'injury'},
   {title:'Uninsured boater',text:'Bodily injury damages from a collision with an uninsured vessel, subject to the form’s conditions. No selected limit is shown.',source:'injury'}]},
  {heading:'Hull & marine benefits',items:[
   {title:'Hull and equipment',text:'Accidental direct physical loss or damage to insured watercraft and qualifying equipment. A trailer must meet the listing requirement.',source:'hull'},
   {title:'Commercial towing and assistance',text:'Breakdown or disablement assistance is described for situations without imminent danger. Limits and approval conditions need confirmation.',source:'assistance'},
   {title:'Salvage and wreck removal',text:'The summary describes legally required wreck removal, subject to policy limits. Separate salvage terms are not established.',source:'assistance'},
   {title:'Personal property and fishing equipment',text:'Part G benefits depend on the property being insured and declared. No scheduled items or selected amounts are available.',source:'personal'}]}
 ],
 specifications:[
  {title:'Vessels over 26 feet · MA7Z04 (4/00)',text:'The referenced provision changes settlement for plastics/canvas, sails and older outboards/outdrives to a depreciated basis. The summary reports a 5-year age threshold; exact application needs the endorsement.',source:'endorsements'},
  {title:'Vessels under 27 feet · MA6508b (04/01)',text:'The referenced provision has similar depreciation terms and also addresses machinery inside the vessel over 7 years old.',source:'endorsements'},
  {title:'Endorsement summary',text:'Two alternative provisions are referenced, not two confirmed issued endorsements. Vessel length, the forms schedule and original wording are needed to establish which applies.',source:'endorsements'}
 ],
 excluded:[
  {title:'Wear, deterioration and breakdown',text:'Reported exclusions include rot, corrosion, marine growth, zebra mussels, vermin and manufacturing defects. Mechanical and electrical breakdown have limited exceptions that need the original clause.',source:'exclusions'},
  {title:'Theft and personal-property restrictions',text:'The summary reports force/entry or security conditions for theft and exclusions for wear, deterioration and marine life. Requirements differ by property and coverage part.',source:'personal'},
  {title:'Household, employee and paid-crew injury',text:'The summary identifies liability exclusions for these injury categories. No crew or captain is scheduled in the supplied information.',source:'exclusions'},
  {title:'Commercial use, racing and restricted operators',text:'The summary reports restrictions on hire, livery, commercial carriage, racing and unlicensed or unapproved operation.',source:'use'},
  {title:'Other reported exclusions',text:'Intentional or criminal acts, pollution liability, war, nuclear hazards and losses outside applicable territory or warranties are identified. This is not an exhaustive exclusion list.',source:'exclusions'}
 ],
 limitations:[
  {title:'Navigation and lay-up warranties',text:'A breach may affect a claim. The summary’s correction-period description is ambiguous; it does not establish a safe grace period for a loss during a breach.',source:'navigation'},
  {title:'Transfer or assignment',text:'The summary says the insurer’s written consent is required to assign the policy.',source:'conditions'},
  {title:'Concealment, misrepresentation or fraud',text:'The summary describes these as grounds for voiding the policy, subject to the actual clause.',source:'conditions'},
  {title:'Newly acquired or replacement vessels',text:'Automatic coverage is not established in the supplied summary. Confirm the applicable form and endorsements before relying on coverage for another vessel.',source:'conditions'}
 ],
 watches:[
  {severity:'Critical',title:'Confirm intended use and operators',text:'The summary reports commercial-use, racing and operator restrictions. Check intended use and any navigation or lay-up warranty against the actual policy before operating.',source:'use'},
  {severity:'Moderate',title:'Depreciation can change the payment',text:'Vessel length, equipment age and the applicable endorsement may affect settlement. Confirm these against the vessel and forms schedules.',source:'endorsements'},
  {severity:'Moderate',title:'Deductibles may apply separately',text:'Different parts or property items may have separate deductibles. Review each scheduled amount to understand potential out-of-pocket costs.',source:'deductibles'}
 ],
 unavailable:[
  'Original policy PDF, declarations, forms schedule and issued endorsements.',
  'Named insured, mailing address, resident spouse, approved or excluded operators, and any paid crew.',
  'Policy number, underwriting company, producer, agent or broker, and claims contact.',
  'Effective and expiration dates, policy status, premium, premium term, discounts and rating information.',
  'Vessel identity, hull identification number (HIN), length, age, scheduled values, motors, tenders and trailers.',
  'Coverage selections, per-vessel limits, sub-limits, deductible amounts and any named-storm deductible.',
  'Navigation boundaries, primary mooring or home port, and any lay-up period.',
  'Applicable valuation endorsement, exact depreciation conditions, and automatic new-vessel coverage.'
 ]
};
