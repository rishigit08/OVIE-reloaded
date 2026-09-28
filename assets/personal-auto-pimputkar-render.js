const paEscape = value => String(value ?? '').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const paIcon = name => {
 const paths={info:'<circle cx="12" cy="12" r="10"/><path d="M12 16v-4m0-4h.01"/>',down:'<path d="m6 9 6 6 6-6"/>',right:'<path d="m9 18 6-6-6-6"/>',car:'<path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4c0 .6.4 1 1 1h2"/><circle cx="7" cy="17" r="2"/><path d="M9 17h6"/><circle cx="17" cy="17" r="2"/>',lock:'<rect x="4" y="11" width="16" height="11" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/>',brain:'<path d="M12 5a3 3 0 1 0-5.997.125 4 4 0 0 0-2.526 5.77 4 4 0 0 0 .556 6.588A4 4 0 1 0 12 18Z"/><path d="M9 13a4.5 4.5 0 0 0 3-4"/><path d="M6.003 5.125A3 3 0 0 0 6.401 6.5"/><path d="M3.477 10.896a4 4 0 0 1 .585-.396"/><path d="M6 18a4 4 0 0 1-1.967-.516"/><path d="M12 13h4"/><path d="M12 18h6a2 2 0 0 1 2 2v1"/><path d="M12 8h8"/><path d="M16 8V5a2 2 0 0 1 2-2"/><circle cx="16" cy="13" r=".5"/><circle cx="18" cy="3" r=".5"/><circle cx="20" cy="21" r=".5"/><circle cx="20" cy="8" r=".5"/>'};
 return `<svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${paths[name]||paths.info}</svg>`;
};
const paInfo = (id,explain='') => id && EVIDENCE[id] ? `<button type="button" class="source-button" data-source="${id}" ${explain?`data-explain="${paEscape(explain)}"`:''} aria-label="Source: ${paEscape(EVIDENCE[id].title)}">${paIcon('info')}</button>` : '';
const paMoney = n => new Intl.NumberFormat('en-US',{style:'currency',currency:'USD',maximumFractionDigits:0}).format(n);
const paSubtotal = v => v.coverages.reduce((sum,c)=>sum+c.premium,0);
const paField = (label,value,source,note='') => `<div class="field auto-field pa-searchable"><div><div class="label">${label}</div><div class="value">${value}</div>${note?`<p class="label pa-field-note">${note}</p>`:''}</div>${source?paInfo(source):''}</div>`;
const paDetail = item => `<div class="coverage-detail auto-fact pa-searchable"><div class="auto-detail-head"><h3>${paEscape(item.title)}</h3>${item.source?paInfo(item.source):''}</div><p>${paEscape(item.text)}</p></div>`;
const paWatch = item => `<div class="watchpoint pa-searchable"><div class="watchpoint-head"><span class="severity ${item.severity.toLowerCase()}">${item.severity}</span>${paInfo(item.source)}</div><h3>${paEscape(item.title)}</h3><p>${paEscape(item.text)}</p></div>`;
const paDisclosure = (title,body,count,open=false) => `<details class="auto-disclosure" ${open?'open':''}><summary><span>${title}</span>${count==null?'':`<span class="count-pill">${count}</span>`}${paIcon('down')}</summary><div class="auto-disclosure-body">${body}</div></details>`;
const paUnavailable = text => `<p class="evidence-note">${text}</p>`;
let personalPolicy = PERSONAL_AUTO_PIMPUTKAR;

// Plum insight callout — reads like the alert component (icon + heading + copy) in the plum/info
// palette, so an enrichment finding is visually distinct without claiming a warning severity.
// status: 'grounded' | 'indeterminate' | 'blocked' | 'compiled' | 'not-applicable' | 'clear' | 'finding'
const paStatusLabel = {grounded:'',clear:'',finding:'',indeterminate:'Not available in the pages analyzed',blocked:'Document not in file','not-applicable':'Not applicable to this policy',compiled:'Compiled · general reference'};
function paInsight(item) {
  const statusText = paStatusLabel[item.status] ?? '';
  const statusClass = item.status && ['indeterminate','blocked','compiled'].includes(item.status) ? ` is-${item.status}` : '';
  return `<div class="pa-insight pa-searchable">${paIcon('brain')}<div class="pa-insight-copy"><div class="pa-insight-head"><h3>${paEscape(item.title)}</h3>${statusText?`<span class="pa-insight-status${statusClass}">${paEscape(statusText)}</span>`:''}${item.source?paInfo(item.source):''}</div><p>${paEscape(item.text)}</p></div></div>`;
}
const paInsightList = items => `<div class="pa-insight-list">${items.map(paInsight).join('')}</div>`;

// Endorsement resolution belongs to reviewed content. Explicit additions remove the matching exclusion.
function paResolvedExclusions(v) {
  return v.excluded.filter(item=>!(item.source==='exclusions' && /rideshare/i.test(item.title) && v.rideshareEndorsement?.addsCoverage));
}
// A line on the declarations coverage table is not automatically an "included coverage":
// a statutory fee (MCCA) is a charge, not coverage, and a policy-wide bundle (Personal Auto
// Plus, billed once at $313) is not a per-vehicle coverage. Both are kept in the premium
// reconciliation but excluded from the per-vehicle "What's included" inventory.
const PA_FEE_TITLES = new Set(['MCCA fee']);
const PA_POLICY_LEVEL_TITLES = new Set(['Personal Auto Plus Coverage']);
const paIsFee = c => PA_FEE_TITLES.has(c.title);
const paIsPolicyLevel = c => PA_POLICY_LEVEL_TITLES.has(c.title);
const paIsIncludedCoverage = c => c.selected!==false && !paIsFee(c) && !paIsPolicyLevel(c);
function paIncluded(v) {
  const items=v.coverages.filter(paIsIncludedCoverage).map(c=>({title:`${c.title} · ${c.limit}`,text:`${v.name}: ${c.text} ${c.deductible}.`,source:c.source}));
  if(v.rideshareEndorsement?.addsCoverage)items.push(v.rideshareEndorsement);
  return items;
}
function paVehicleWatches(v) {
  const items=[...v.watchPoints];
  if(v.activeRideshare && !v.rideshareEndorsement?.addsCoverage)items.unshift({severity:'Critical',title:'Active rideshare use is excluded',text:`${v.name} is used for rideshare, but no adding endorsement is established. Review the exclusion with your insurance professional.`,source:'exclusions'});
  if(v.collisionDeductible>=1000)items.push({severity:'Moderate',title:'Higher collision out-of-pocket cost',text:`${v.name} has a ${paMoney(v.collisionDeductible)} collision deductible. This is your portion before insurance pays under that coverage.`,source:'coreVehicleTable'});
  return items;
}

// §2 Individuals covered — enrichment insights. General policy-mechanics education, distinguished
// from the specific driver facts on the declarations (which stay in the "Individuals covered" card).
const INDIVIDUALS_INSIGHTS = [
  {title:'The driver list is not necessarily the complete definition of who is covered',status:'indeterminate',
    text:'Most personal auto contracts extend liability coverage to any permitted user of a covered vehicle, not only the drivers listed on the declarations. The base FA4000TQ contract’s exact wording on this point is not among the reviewed pages, so this is a general pattern to check, not a confirmed fact about this policy.'},
  {title:'Three drivers are listed; household relationships are not stated',status:'indeterminate',source:'drivers',
    text:'Samir Pimputkar and Avani Pimputkar are named insureds; Carly Braun is listed as a third covered driver. Her relationship to the named insureds is not stated in the reviewed declarations.'},
  {title:'A named-driver exclusion has state-specific formalities',status:'clear',source:'forms',
    text:'Where a named-driver exclusion applies, it typically must specifically name the excluded person and be accepted in writing. No named-driver exclusion is listed on this policy’s endorsement schedule — all three listed drivers appear as covered drivers.'},
  {title:'Adding or removing a driver can change five vehicles’ premiums at once',status:'grounded',source:'premiumTotals',
    text:'Because this is one policy covering five vehicles, a change to any driver’s status can affect rating across the whole $9,068.00 premium, not just one vehicle.'}
];

// Per-vehicle accordion group (What's included / What's not included / Coverage limitations /
// Coverage watch points) — same paDisclosure primitive Policy details uses, closed by default,
// so each vehicle's own breakdown lives on the vehicle card instead of duplicated in Policy details.
const paCoverageRow = c => `<div class="pa-coverage pa-searchable" role="row"><div role="cell"><div class="auto-detail-head"><span class="label">${paEscape(c.title)}</span>${paInfo(c.source,c.tip)}</div><div class="auto-limit">${paEscape(c.limit)}</div><p>${paEscape(c.text)}</p>${c.note?`<p class="evidence-note">${paEscape(c.note)}</p>`:''}</div><div class="pa-coverage-meta" role="cell"><p><span class="label">Deductible</span><strong>${paEscape(c.deductible)}</strong></p><p><span class="label">Premium</span><strong>${paMoney(c.premium)}</strong></p></div></div>`;
// "What's included" is the coverage schedule itself — the real per-vehicle coverages, with the
// premium reconciled back to the declarations' vehicle total (coverage premiums + the mandatory
// MCCA fee). The MCCA fee and the policy-wide Personal Auto Plus bundle are disclosed in the
// reconciliation note rather than listed as included coverages.
function paIncludedTable(v) {
  const covered=v.coverages.filter(paIsIncludedCoverage);
  const fee=v.coverages.find(paIsFee);
  const coverageSum=covered.reduce((s,c)=>s+c.premium,0);
  const total=coverageSum+(fee?fee.premium:0);
  return `<div class="pa-table" role="table" aria-label="${paEscape(v.name)} coverage schedule">${covered.map(paCoverageRow).join('')}</div><div class="pa-subtotal"><span>Vehicle premium total</span><strong>${paMoney(total)}</strong></div><p class="label pa-field-note">${paMoney(coverageSum)} in coverage premiums${fee?` plus a mandatory ${paEscape(fee.title)} of ${paMoney(fee.premium)}`:''} — matching this vehicle's total on the declarations for the ${paEscape(personalPolicy.term)}. Personal Auto Plus Coverage is a policy-wide bundle billed once ($313) and is shown in Policy details, not per vehicle; not-purchased items are under "What's not included."</p>`;
}
function paVehicleAccordions(v) {
  const covered=v.coverages.filter(paIsIncludedCoverage);
  const excluded=paResolvedExclusions(v);
  const watches=paVehicleWatches(v);
  return paDisclosure("What's included",paIncludedTable(v),covered.length)
    +paDisclosure("What's not included",excluded.map(paDetail).join('')||'<p class="label">No items are identified for this vehicle.</p>',excluded.length)
    +paDisclosure('Coverage limitations',v.limitations.map(paDetail).join('')||'<p class="label">No items are identified for this vehicle.</p>',v.limitations.length)
    +paDisclosure('Coverage watch points',watches.map(paWatch).join('')||'<p class="label">No items are identified for this vehicle.</p>',watches.length);
}

function paVehicle(v,insideSheet=false) {
 return `<${insideSheet?'div':'section'} class="${insideSheet?'':'card '}pa-vehicle" data-asset="${paEscape(v.id)}"><div class="card-pad"><div class="auto-vehicle-head"><div class="auto-vehicle-icon">${paIcon('car')}</div><${insideSheet?'h3':'h2'} class="section-title">${paEscape(v.name)}</${insideSheet?'h3':'h2'}>${paInfo(v.source)}</div><dl class="auto-vehicle-facts"><div><dt>VIN</dt><dd>${paEscape(v.vin)}</dd></div><div><dt>Use</dt><dd>${paEscape(v.use)}</dd></div><div><dt>Lienholder / loss payee</dt><dd>${paEscape(v.lienholder)}</dd></div></dl>
 <dl class="pa-vehicle-attrs auto-vehicle-facts"><div><dt>Garaging state</dt><dd>${paEscape(v.garagingState)}</dd></div><div><dt>Financial-responsibility filing (SR-22 / FR-44)</dt><dd>${paEscape(v.financialResponsibilityFiling)}</dd></div><div><dt>Valuation basis</dt><dd>${paEscape(v.valuationBasis)}</dd></div></dl></div>
 ${paVehicleAccordions(v)}
 </${insideSheet?'div':'section'}>`;
}

// §4 Injury coverages — a standalone card, because these coverages follow people, not vehicles.
function paInjurySection() {
  return `<section class="card" id="personalInjuryCoverages" aria-labelledby="personalInjuryTitle"><div class="card-pad"><h2 class="section-title" id="personalInjuryTitle">Injury coverages</h2><p class="pa-section-intro">PIP medical, PIP work loss, Property Protection Insurance and UM/UIM bodily injury follow people and Michigan no-fault rules, not a specific vehicle, so they are summarized once here rather than repeated on every vehicle.</p>
  ${paInsightList([
    {title:'PIP medical — Option 1: Unlimited',status:'grounded',source:INJURY.pipMedical.source,text:INJURY.pipMedical.text},
    {title:'PIP work loss (Class I · Full)',status:'grounded',source:INJURY.pipWorkLoss.source,text:INJURY.pipWorkLoss.text},
    {title:'Property Protection Insurance · $1,000,000',status:'grounded',source:INJURY.ppi.source,text:INJURY.ppi.text},
    {title:'UM/UIM bodily injury are separately stated',status:'grounded',source:INJURY.umuim.source,text:INJURY.umuim.text},
    {title:'MCCA fee — a statutory assessment, not a coverage choice',status:'grounded',source:INJURY.mcca.source,text:INJURY.mcca.text}
  ])}
  </div></section>`;
}

// §7 Loss of use & assistance — new card.
function paLossOfUseSection() {
  return `<section class="card" id="personalLossOfUse" aria-labelledby="personalLossOfUseTitle"><div class="card-pad"><h2 class="section-title" id="personalLossOfUseTitle">Loss of use & assistance</h2><p class="pa-section-intro">Two built-in benefits are easy to conflate: Transportation Expense (a repair-time benefit) and Roadside Assistance (a breakdown/disablement benefit).</p>
  ${paInsightList(LOSS_OF_USE)}
  </div></section>`;
}

// §8 Lien, lease & the GAP question — new card, only meaningfully triggered when a lienholder exists.
function paLienLeaseSection() {
  return `<section class="card" id="personalLienLease" aria-labelledby="personalLienLeaseTitle"><div class="card-pad"><h2 class="section-title" id="personalLienLeaseTitle">Lien, lease & the GAP question</h2><p class="pa-section-intro">A lienholder or lessor on the declarations is what triggers these questions. Four of this household’s five vehicles carry both a loss payee and a purchased GAP endorsement.</p>
  ${paInsightList(LIEN_LEASE_GAP)}
  </div></section>`;
}

// §10 Your rights on this policy — new card. Entitlements: what a user is owed, not a coverage judgment.
function paRightsSection() {
  return `<section class="card" id="personalRights" aria-labelledby="personalRightsTitle"><div class="card-pad"><h2 class="section-title" id="personalRightsTitle">Your rights on this policy</h2><p class="pa-section-intro">These are legal entitlements that exist regardless of what this policy purchased — distinct from the coverage comparisons above.</p>
  ${paInsightList(RIGHTS)}
  </div></section>`;
}

// §11 Cross-policy ribbon — new, collapsed by default.
function paCrossPolicySection() {
  const ribbonRows = CROSS_POLICY.ribbon.map(r=>`<div class="pa-ref-row"><div class="pa-ref-row-head"><h4>${paEscape(r.title)}</h4></div><p>${paEscape(r.text)}</p></div>`).join('');
  const insightRows = CROSS_POLICY.insights.map(i=>paInsight({title:`${i.id} · ${i.title}`,status:i.status,text:i.text})).join('');
  return `<section class="card pa-policy-details" id="personalCrossPolicy" aria-labelledby="personalCrossPolicyTitle"><div class="card-pad"><h2 class="section-title" id="personalCrossPolicyTitle">Cross-policy</h2></div>
  ${paDisclosure('Documents this wallet does not yet hold',`<div class="pa-ref-table">${ribbonRows}</div>`,CROSS_POLICY.ribbon.length)}
  ${paDisclosure('Cross-policy insights (reference set)',insightRows,CROSS_POLICY.insights.length)}
  </section>`;
}

// Critical watch-point reference set — lives inside Coverage watch points as its own
// disclosure so it doesn't inflate the policy's own moderate/low watch-point list.
function paCriticalReferenceSet() {
  const rows = CRITICAL_WATCHPOINTS.map(c=>{
    const cls = c.determination==='finding'?'finding':c.determination==='clear'?'clear':'indeterminate';
    const label = c.determination==='finding'?'Finding for this policy':c.determination==='clear'?'Checked — clear':c.determination==='not-applicable'?'Not applicable to this policy':'Indeterminate';
    return `<div class="pa-ref-row pa-searchable"><div class="pa-ref-row-head"><span class="pa-ref-id">${c.id}</span><h4>${paEscape(c.title)}</h4></div>${c.basis?`<p>${paEscape(c.basis)}</p>`:''}<span class="pa-ref-determination ${cls}">${label}</span><p>${paEscape(c.note)}</p></div>`;
  }).join('');
  return paDisclosure('Critical watch-point reference (M1–M10)',`<p class="pa-section-intro">A structured pass through this policy's documents for the standard critical watch-point categories. Most items are indeterminate or not applicable because the necessary fact or companion document is not in this file — that is reported directly rather than guessed.</p><div class="pa-ref-table">${rows}</div>`,CRITICAL_WATCHPOINTS.length);
}

function renderPersonalAutoV2(policy=PERSONAL_AUTO_PIMPUTKAR) {
 personalPolicy=policy;
 const specs=[
   {title:'Adds PIP work loss and Property Protection Insurance',text:'PIP work loss (Class I, Full option) replaces qualifying lost income, and $1,000,000 of Property Protection Insurance covers damage this vehicle causes to a parked vehicle or physical property.',source:'coreVehicleTable'},
   {title:'Adds Transportation Expense and Roadside Assistance',text:'Every vehicle carries $50/day up to $1,500 Transportation Expense, plus Roadside Assistance covering 50 miles or $250 per disablement in-network.',source:'additionalCov'},
   {title:'Requires payment to each vehicle’s loss payee as its interest appears',text:'BMW Financial Services, DFCU Credit Union, Ford Motor Credit and Financial Services Vehicle Trust are each listed for their respective vehicle. The Jeep Wrangler has no listed loss payee.',source:'lossPayees'},
   {title:'GAP coverage applies to four of the five vehicles',text:'The BMW X5, Ford Bronco, Ford Explorer and BMW i7 each carry a GAP premium; the Jeep Wrangler does not.',source:'lossPayees'}
 ];
 const registryRows = ENDORSEMENT_REGISTRY.map(r=>`<div class="coverage-detail auto-fact pa-searchable"><div class="auto-detail-head"><h3>${paEscape(r.form)} · ${paEscape(r.edition)}</h3>${r.ref?paInfo(r.ref):''}</div><p><strong>${paEscape(r.title)}</strong> — ${paEscape(r.note)} Effect: ${paEscape(r.effect)}. Verification: ${paEscape(r.verification)}.</p></div>`).join('');
 const specifications=specs.map(paDetail).join('')
   +paDetail({title:'Discounts',text:'Six named credits are applied — Advance Quote Credit, Advanced Safety Features Discount, New Vehicle Discount, Package Credit, Pay Plan Discount and Safe Driver Discount — but individual dollar amounts are not itemized in the reviewed pages.',source:'premiumTotals'})
   +paDetail({title:'Funeral and survivor benefits are part of PIP, not a separate rider',text:'The bundled PIP medical selection form states that PIP coverage also includes some funeral expense benefits and survivor’s benefits, paid to a covered person’s dependents if injuries from an auto accident result in their death. This is part of the PIP medical benefit selected above, not a separately priced line.',source:'pipMedicalForm'})
   +paDetail({title:'Endorsement summary · 19 listed modifications and notices',text:'The declarations identify 19 modifying forms and notices. Only five were included as reviewable pages in this file; the rest are known only by title and edition. Material changes are reflected beside the affected coverage where the reviewed pages support it.',source:'forms'})
   +`<div class="coverage-detail auto-fact"><div class="auto-detail-head"><h3>Typed endorsement registry</h3></div><p>Every listed form, with its effect (expands / restricts / conditions / administrative) and verification status. Impact is looked up from the actual clause where reviewed, and marked "listed" rather than guessed where only the title and edition are known.</p></div>${registryRows}`;
 const policyDetails=`<section class="card pa-policy-details" id="personalPolicyDetails" aria-labelledby="personalPolicyDetailsTitle"><div class="card-pad"><h2 class="section-title" id="personalPolicyDetailsTitle">Policy details</h2><p class="pa-section-intro">Per-vehicle detail — what's included, what's not, coverage limitations and watch points for a specific vehicle — is on that vehicle's own card above, under its coverage tabs. This section covers what applies across the whole policy.</p></div>
 ${paDisclosure('Policy specifications',specifications,specs.length+ENDORSEMENT_REGISTRY.length+3)}
 ${paDisclosure('Coverage watch points',`<section class="pa-policy-vehicle-group"><h3 class="pa-policy-vehicle-title">Across your policy</h3>${policy.watchPoints.map(paWatch).join('')}</section>${paCriticalReferenceSet()}`,policy.watchPoints.length+1)}
 ${paDisclosure('State limits reference',paDetail({title:'Historical policy wording',text:'The bundled Michigan forms (CPA1567MI, CPA1568MI, CPA1569QMI) include state-mandated limit wording current as of their printed edition dates. This is an informational source reference, not a current compliance verdict.',source:'biChoiceForm'}),null)}</section>`;
 const glassInsight = paInsight({title:'Full Safety Glass Coverage waives the deductible',status:'grounded',source:'additionalCov',
   text:'Unlike a policy where a glass claim falls under the standard comprehensive deductible, this policy carries Full Safety Glass Coverage (CPA1588QMI) as Included on every vehicle. A covered glass-only claim is not subject to the $1,000 comprehensive deductible shown elsewhere on the declarations.'});
 const subrogationInsight = paInsight({title:'You may be able to recover your deductible from an at-fault driver',status:'grounded',source:'subrogationNote',
   text:'Per the bundled Michigan no-fault collision forms: if another insured driver was more than 50% the cause of an accident, you may sue that driver in small claims or municipal court to recover your deductible or collision damages, up to the amount stated on the form. The insurer is not responsible for filing that suit on your behalf, and the other driver’s insurer may not be responsible to pay the award either.'});
 const comprehensiveInsight = paInsight({title:'Comprehensive vs. collision, as a definitional test',status:'grounded',source:'coreVehicleTable',
   text:'Consumer intuition about comprehensive vs. collision is often wrong: hitting a deer is comprehensive, but swerving to avoid one and hitting a guardrail is collision. A single-car rollover with no impact is still collision (an "upset"). A pothole is collision. Every vehicle here carries the same $1,000 deductible on both, so the classification changes which coverage responds, not the amount — but it is still worth asking your adjuster to confirm in writing.'});
 const unavailable=['Full text of the base FA4000TQ contract and 13 of the 19 listed Michigan endorsements — only five bundled forms were included as reviewable pages.','A garaging address separately labeled and distinct from the named insureds’ mailing address.','Rated/occasional-driver, permit-holder and good-student status for any of the three drivers.','A dollar limit for Limited Property Damage — only its per-vehicle premium is shown.','The exact payoff formula and exclusions of the GAP Coverage endorsement (CPA1246QMI).','Whether the BMW i7’s "Financial Services Vehicle Trust" loss payee reflects a lease or a loan.','A prior-term premium for a like-for-like renewal comparison.','SR-22 / FR-44 or other financial-responsibility filing.','A named-driver exclusion, rideshare/TNC endorsement, or diminished-value exclusion — none is listed on the schedule, but none is confirmed absent from the un-reviewed base contract either.','Any homeowners, umbrella, boat or other companion policy needed to resolve the cross-policy items above.'];
 const sourceRows=[['Auto declarations','DDA (7/17) · PDF pages 1–7','identity'],['Michigan Choice of Bodily Injury Liability Coverage Limits','CPA1567MI (7/20) · PDF page 8','biChoiceForm'],['Michigan Selection of PIP Medical Coverage','CPA1568MI (7/23) · PDF pages 9–11','pipMedicalForm'],['Michigan Bodily Injury Coverage Options and Premiums','CPA1569QMI (7/20) · PDF page 12','biOptionsForm'],['No Fault Collision Selection — Michigan (blank specimen)','CPA1320QMI (9/19); MI1037QMI (9/19) · PDF pages 13–16','collisionForm'],['Endorsement schedule','Named on the declarations · PDF page 6. Acknowledged by title and edition; full text not attached.','forms']];
 const priorTermNote = policy.priorTermPremium ? `Prior term premium: ${paMoney(policy.priorTermPremium)}. A premium increase from a prior term can carry a required renewal notice, so review your renewal documents.` : 'A prior-term premium for renewal comparison is not available in the pages analyzed. This is a Renewal transaction, per the declarations.';
 document.getElementById('autoMain').innerHTML=`<section class="card card-pad"><div class="heading-row"><h2 class="section-title">Your policy simplified</h2><span class="status-pill">${new Date(policy.end)<new Date()?'Expired':'In term'}</span></div>
 ${paField('Carrier',paEscape(policy.carrier))}${paField('Policy name / form',`${paEscape(policy.title)}<br>${paEscape(policy.form)} · edition ${paEscape(policy.formEdition)}`,null,'Every quoted coverage figure keys to this form and edition.')}${paField('Policy number',paEscape(policy.number))}${paField('Policyholders',paEscape(policy.insured))}${paField('Policy period','Mar 11, 2024 – Mar 11, 2025 · 12:01 a.m. Standard Time')}${paField('Coverage premiums',`${paMoney(policy.vehicles.reduce((s,v)=>s+paSubtotal(v),0)+313)} · ${policy.term}`,null,`${priorTermNote} Includes each vehicle’s coverage premiums plus the $313 Personal Auto Plus Coverage billed once for the whole policy — Total Policy Premium per the declarations.`)}</section>
 <section class="card"><div class="card-pad"><h2 class="section-title">Individuals covered</h2>${policy.drivers.map(d=>paDetail({title:d.name,text:d.relationship,source:'drivers'})).join('')}${paUnavailable('Dates of birth are masked as XX/XX/XXXX for all three drivers in the reviewed pages. Driver rating, occasional-driver, permit-holder and good-student status are not stated.')}</div><div class="card-pad" style="padding-top:0">${paInsightList(INDIVIDUALS_INSIGHTS)}</div></section>
 ${policy.vehicles.length<7?policy.vehicles.map(v=>paVehicle(v)).join(''):`<section class="card card-pad"><h2 class="section-title">Vehicles covered <span class="count-pill">${policy.vehicles.length}</span></h2><label for="fleetSearch">Find a vehicle</label><input id="fleetSearch" class="search-field" type="search" placeholder="Search name or VIN"><p id="fleetStatus" class="label" role="status"></p><div id="fleetRows"></div><button id="fleetMore" class="secondary-action" type="button">See more</button></section>`}
 ${paInjurySection()}
 ${policyDetails}
 <section class="card pa-deductibles"><div class="card-pad"><h2 class="section-title">Deductibles</h2><p class="label">What you must pay before insurance pays.</p>${policy.vehicles.map(v=>`<section class="pa-deductible-asset"><h3>${paEscape(v.name)}</h3>${paField('Comprehensive (Other Than Collision)',`${paMoney(v.collisionDeductible)} · deductible applies`,'coreVehicleTable')}${paField('Collision (Broadened)',`${paMoney(v.collisionDeductible)} · applies only when this vehicle’s driver is more than 50% at fault`,'collisionForm')}</section>`).join('')}${paDetail({title:'PIP medical',text:'A $300 deductible applies to PIP medical under the selected Option 1: Unlimited coverage.',source:'pipMedicalForm'})}${paDetail({title:'Liability, UM/UIM, PPI and PIP work loss',text:'No deductible applies to bodily injury liability, property damage liability, UM/UIM bodily injury, Property Protection Insurance, or PIP work loss.',source:'coreVehicleTable'})}<div class="pa-insight-list" style="margin-top:12px">${comprehensiveInsight}${glassInsight}${subrogationInsight}</div>${paDetail({title:'Important to know',text:'For coverage with a deductible, a loss below that deductible produces no payment under that coverage. Higher deductibles mean more out of pocket.',source:'coreVehicleTable'})}</div></section>
 ${paLossOfUseSection()}
 ${paLienLeaseSection()}
 ${paRightsSection()}
 ${paCrossPolicySection()}
 <section class="card footer-card"><div class="card-pad"><h2 class="section-title">About these insights</h2><p>Insights are based on the documents provided; incomplete or missing documents may result in incomplete or inaccurate insights. OVIE is not intended to serve as evidence of insurance for third parties, nor does OVIE provide advice or guidance on the adequacy of coverage. Users should consult their agent or insurance carrier for coverage-related questions or determinations.</p><button class="pa-text-button" type="button" data-professional>Review with your insurance professional ${paIcon('right')}</button></div>${paDisclosure('Document sources',sourceRows.map(([title,text,source])=>paDetail({title,text,source})).join(''),sourceRows.length)}${paDisclosure('Not available in the pages analyzed',`<ul class="source-list">${unavailable.map(x=>`<li>${paEscape(x)}</li>`).join('')}</ul>`,unavailable.length)}</section>`;
 document.getElementById('autoMain').append(document.getElementById('autoFeedback').content.cloneNode(true));
 if(policy.vehicles.length>=7)paFleet(policy.vehicles);
}
function paFleet(vehicles) {
 let count=6;const input=document.getElementById('fleetSearch'),more=document.getElementById('fleetMore');
 function draw(){const matches=vehicles.filter(v=>(v.name+' '+v.vin).toLowerCase().includes(input.value.toLowerCase().trim()));document.getElementById('fleetStatus').textContent=`${matches.length} vehicles · showing ${Math.min(count,matches.length)}`;document.getElementById('fleetRows').innerHTML=matches.slice(0,count).map(v=>`<button type="button" class="auto-fleet-row" data-vehicle="${paEscape(v.id)}"><span><strong>${paEscape(v.name)}</strong><span class="label">VIN ${paEscape(v.vin)}</span></span>${paIcon('right')}</button>`).join('')||'<p class="label">No matching vehicles. Try a name or clear the search.</p>';more.hidden=matches.length<=count;}
 input.oninput=()=>{count=6;draw();};more.onclick=()=>{count+=6;draw();if(more.hidden)document.querySelector('#fleetRows button:last-child')?.focus();};
 document.getElementById('fleetRows').onclick=e=>{const b=e.target.closest('[data-vehicle]');if(!b)return;const v=vehicles.find(v=>v.id===b.dataset.vehicle);document.getElementById('autoVehicleTitle').textContent=v.name;document.querySelector('.auto-vehicle-body').innerHTML=paVehicle(v,true);window.openAutoModal(document.getElementById('autoVehicleSheet'),b);};draw();
}
renderPersonalAutoV2();
