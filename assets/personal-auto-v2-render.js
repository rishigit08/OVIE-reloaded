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
const paBullet = item => `<li class="pa-searchable"><div class="auto-detail-head"><h3>${paEscape(item.title)}</h3>${item.source?paInfo(item.source):''}</div><p>${paEscape(item.text)}</p></li>`;
const paWatch = item => `<div class="watchpoint pa-searchable"><div class="watchpoint-head"><span class="severity ${item.severity.toLowerCase()}">${item.severity}</span>${paInfo(item.source)}</div><h3>${paEscape(item.title)}</h3><p>${paEscape(item.text)}</p></div>`;
const paDisclosure = (title,body,count,open=false) => `<details class="auto-disclosure" ${open?'open':''}><summary><span>${title}</span>${count==null?'':`<span class="count-pill">${count}</span>`}${paIcon('down')}</summary><div class="auto-disclosure-body">${body}</div></details>`;
const paUnavailable = text => `<p class="evidence-note">${text}</p>`;
let personalPolicy = PERSONAL_AUTO_V2;

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
function paIncluded(v) {
  const items=v.coverages.filter(c=>c.selected!==false).map(c=>({title:`${c.title} · ${c.limit}`,text:`${v.name}: ${c.text} ${c.deductible}.`,source:c.source}));
  if(v.rideshareEndorsement?.addsCoverage)items.push(v.rideshareEndorsement);
  return items;
}
function paVehicleWatches(v) {
  const items=[...v.watchPoints];
  if(v.activeRideshare && !v.rideshareEndorsement?.addsCoverage)items.unshift({severity:'Critical',title:'Active rideshare use is excluded',text:`${v.name} is used for rideshare, but no adding endorsement is established. Review the exclusion with your insurance professional.`,source:'exclusions'});
  if(v.collisionDeductible>=1000)items.push({severity:'Moderate',title:'Higher collision out-of-pocket cost',text:`${v.name} has a ${paMoney(v.collisionDeductible)} collision deductible. This is your portion before insurance pays under that coverage.`,source:'physical'});
  return items;
}

// §2 Individuals covered — enrichment insights. General policy-mechanics education, distinguished
// from the specific driver facts on the declarations (which stay in the "Individuals covered" card).
const INDIVIDUALS_INSIGHTS = [
  {title:'The driver list is not the complete definition of who is covered',status:'grounded',source:'liability',
    text:'Part A also extends liability coverage to "any person using ‘your covered auto’" with permission — a broader group than the named/primary driver shown on the declarations. The driver list on the dec page is a rating record, not the coverage boundary.'},
  {title:'"Family member" requires both relationship and residency',status:'indeterminate',
    text:'The base-form definition of "family member" generally requires someone related by blood, marriage or adoption who also resides in the household — with no automatic extension for a student away at school. Household composition is not stated in the reviewed pages, so who qualifies as a family member here is not established.'},
  {title:'An unrelated resident may need a separate endorsement',status:'indeterminate',
    text:'A partner, roommate or other unrelated household resident typically falls outside the "family member" definition and reaches coverage only through the narrower "using the vehicle" limb. Whether any such person resides in this household is not stated.'},
  {title:'A separated spouse’s coverage can be time-limited',status:'indeterminate',
    text:'On many base forms, a spouse who has moved out remains within the definition of "you" only until the earlier of a set number of days (commonly 90) after the change of residence, or the end of the policy period — a fact easy to miss during a separation. Marital status and any separation are not stated in the reviewed pages.'},
  {title:'A named-driver exclusion has state-specific formalities',status:'clear',
    text:'Where a named-driver exclusion applies, it typically must specifically name the excluded person, cannot exclude a class of drivers, and must be accepted in writing — with some states voiding a noncompliant exclusion outright. No named-driver exclusion is listed on this policy’s endorsement schedule.'}
];

function paVehicle(v,group,insideSheet=false) {
 const comprehensiveTip = 'Consumer intuition about comprehensive vs. collision is often wrong: hitting a deer is comprehensive, but swerving to avoid one and hitting a guardrail is collision. A single-car rollover with no impact is still collision (an "upset"). A pothole is collision. With a deductible spread between the two coverages, that classification can be a real dollar difference worth asking your adjuster about in writing.';
 return `<${insideSheet?'div':'section'} class="${insideSheet?'':'card '}pa-vehicle" data-asset="${paEscape(v.id)}"><div class="card-pad"><div class="auto-vehicle-head"><div class="auto-vehicle-icon">${paIcon('car')}</div><${insideSheet?'h3':'h2'} class="section-title">${paEscape(v.name)}</${insideSheet?'h3':'h2'}>${paInfo(v.source)}</div><dl class="auto-vehicle-facts"><div><dt>VIN</dt><dd>${paEscape(v.vin)}</dd></div><div><dt>Use</dt><dd>${paEscape(v.use)}</dd></div><div><dt>Lienholder / loss payee</dt><dd>${paEscape(v.lienholder)}</dd></div></dl>
 <dl class="pa-vehicle-attrs auto-vehicle-facts"><div><dt>Garaging state</dt><dd>${paEscape(v.garagingState)}</dd></div><div><dt>Financial-responsibility filing (SR-22 / FR-44)</dt><dd>${paEscape(v.financialResponsibilityFiling)}</dd></div><div><dt>Valuation basis</dt><dd>${paEscape(v.valuationBasis)}</dd></div></dl></div>
 <div class="card-pad" style="padding-top:0">${paInsight({title:'Comprehensive vs. collision, as a definitional test',status:'grounded',source:'physical',text:comprehensiveTip})}</div>
 ${paDisclosure('Coverages & premiums',`<div class="pa-table" role="table" aria-label="${paEscape(v.name)} coverage schedule"><div class="pa-table-heading" role="row"><span role="columnheader">Coverage / limit</span><span role="columnheader">Deductible / premium</span></div>${v.coverages.map(c=>`<div class="pa-coverage pa-searchable" role="row"><div role="cell"><div class="auto-detail-head"><span class="label">${paEscape(c.title)}</span>${paInfo(c.source,c.tip)}</div><div class="auto-limit">${paEscape(c.limit)}</div><p>${paEscape(c.text)}</p>${c.note?`<p class="evidence-note">${paEscape(c.note)}</p>`:''}</div><div class="pa-coverage-meta" role="cell"><p><span class="label">Deductible</span><strong>${paEscape(c.deductible)}</strong></p><p><span class="label">Premium</span><strong>${paMoney(c.premium)}</strong></p></div></div>`).join('')}</div><div class="pa-subtotal"><span>Vehicle premium subtotal</span><strong>${paMoney(paSubtotal(v))}</strong></div><p class="label pa-field-note">Calculated from coverage premiums · ${personalPolicy.term}. Fees are separate.</p>`,v.coverages.length,true)}
 </${insideSheet?'div':'section'}>`;
}
function paPolicyVehicleItems(policy,items,watch=false) {
 return policy.vehicles.map(v=>`<section class="pa-policy-vehicle-group" data-policy-asset="${paEscape(v.id)}"><h3 class="pa-policy-vehicle-title">${paEscape(v.name)}</h3>${watch?items(v).map(paWatch).join(''):`<ul class="pa-bullets">${items(v).map(paBullet).join('')}</ul>`}</section>`).join('');
}

// §4 Injury coverages — a standalone card, because these coverages follow people, not vehicles.
function paInjurySection() {
  return `<section class="card" id="personalInjuryCoverages" aria-labelledby="personalInjuryTitle"><div class="card-pad"><h2 class="section-title" id="personalInjuryTitle">Injury coverages</h2><p class="pa-section-intro">Medical Payments, PIP and UM/UIM bodily injury follow people, not a specific vehicle, so they are summarized once here rather than repeated on every vehicle.</p>
  ${paInsightList([
    {title:'Medical Payments',status:INJURY.medPay.status==='not-selected'?'not-applicable':'grounded',source:INJURY.medPay.source,text:INJURY.medPay.text},
    {title:'Personal Injury Protection (PIP)',status:'not-applicable',text:INJURY.pip.text},
    {title:'UM/UIM bodily injury and UM property damage are separately stated',status:'grounded',source:'um',text:INJURY.umuim.text},
    {title:'Coordination of benefits',status:'indeterminate',text:INJURY.coordination.text}
  ])}
  </div></section>`;
}

// §7 Loss of use & assistance — new card.
function paLossOfUseSection() {
  return `<section class="card" id="personalLossOfUse" aria-labelledby="personalLossOfUseTitle"><div class="card-pad"><h2 class="section-title" id="personalLossOfUseTitle">Loss of use & assistance</h2><p class="pa-section-intro">Three products get confused with each other: the built-in transportation benefit, a purchased rental-reimbursement endorsement, and towing/labor versus a roadside membership.</p>
  ${paInsightList(LOSS_OF_USE)}
  </div></section>`;
}

// §8 Lien, lease & the GAP question — new card, only meaningfully triggered when a lienholder exists.
function paLienLeaseSection() {
  return `<section class="card" id="personalLienLease" aria-labelledby="personalLienLeaseTitle"><div class="card-pad"><h2 class="section-title" id="personalLienLeaseTitle">Lien, lease & the GAP question</h2><p class="pa-section-intro">A lienholder or lessor on the declarations is what triggers these questions. Three different products share loose nicknames — a loan/lease payoff endorsement, a dealer GAP waiver, and new-car replacement — and they are not the same thing.</p>
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
  ${paDisclosure('Cross-policy insights (I33–I60 reference set)',insightRows,CROSS_POLICY.insights.length)}
  </section>`;
}

// Critical watch-point reference set (C1–C23) — lives inside Coverage watch points as its own
// disclosure so it doesn't inflate the policy's own moderate/low watch-point list.
function paCriticalReferenceSet() {
  const rows = CRITICAL_WATCHPOINTS.map(c=>{
    const cls = c.determination==='finding'?'finding':c.determination==='clear'?'clear':'indeterminate';
    const label = c.determination==='finding'?'Finding for this policy':c.determination==='clear'?'Checked — clear':c.determination==='not-applicable'?'Not applicable to this policy':'Indeterminate';
    return `<div class="pa-ref-row pa-searchable"><div class="pa-ref-row-head"><span class="pa-ref-id">${c.id}</span><h4>${paEscape(c.title)}</h4></div>${c.basis?`<p>${paEscape(c.basis)}</p>`:''}<span class="pa-ref-determination ${cls}">${label}</span><p>${paEscape(c.note)}</p></div>`;
  }).join('');
  return paDisclosure('Critical watch-point reference (C1–C23)',`<p class="pa-section-intro">A structured pass through the standard critical watch-point set against this policy’s documents. Most items are indeterminate or not applicable because the necessary fact or companion document is not in this file — that is reported directly rather than guessed.</p><div class="pa-ref-table">${rows}</div>`,CRITICAL_WATCHPOINTS.length);
}

function renderPersonalAutoV2(policy=PERSONAL_AUTO_V2) {
 personalPolicy=policy;
 const specs=[{title:'Adds income loss benefits',text:'$100 per person per week for qualifying lost income. The benefit ends on return to usual work, one year after the accident or death, whichever is earliest.',source:'income'}, {title:'Adds transportation and roadside benefits',text:'The scheduled Hyundai has $900 Option 1 transportation expenses and $100 towing/labor per disablement. These benefits are also explained on the vehicle.',source:'rental'}, {title:'Requires payment to the loss payee as its interest appears',text:'Santander is listed for the Hyundai. The loss-payable clause addresses payment to you and the listed loss payee.',source:'vehicle'}, {title:'Limits peer-to-peer sharing coverage',text:'The sharing endorsement excludes the specified losses during platform sharing by someone other than you or a family member.',source:'exclusions'}];
 const registryRows = ENDORSEMENT_REGISTRY.map(r=>`<div class="coverage-detail auto-fact pa-searchable"><div class="auto-detail-head"><h3>${paEscape(r.form)} · ${paEscape(r.edition)}</h3>${r.ref?paInfo(r.ref):''}</div><p><strong>${paEscape(r.title)}</strong> — ${paEscape(r.note)} Effect: ${paEscape(r.effect)}. Verification: ${paEscape(r.verification)}.</p></div>`).join('');
 const specifications=specs.map(paDetail).join('')
   +paDetail({title:'Discounts',text:'Multi-vehicle, safe-driver and good-student discounts are not identified in the supplied documents. No discount amount is assumed.'})
   +paDetail({title:'Death indemnity and extended benefits',text:'A separate death-indemnity or essential-services benefit is not established. The documented income-loss benefit is summarized above.',source:'forms'})
   +paDetail({title:'Endorsement summary · 12 listed modifications and notices',text:'The declarations identify 12 modifying forms and notices. Four practical changes are highlighted above. State amendments and legal notices remain in Document sources; material changes are reflected beside the affected coverage.',source:'forms'})
   +`<div class="coverage-detail auto-fact"><div class="auto-detail-head"><h3>Typed endorsement registry</h3></div><p>Every listed form, with its effect (expands / restricts / conditions / administrative) and verification status. Impact is looked up from the actual clause, never inferred from a form’s title.</p></div>${registryRows}`;
 const groupCount=policy.vehicles.length;
 const policyDetails=`<section class="card pa-policy-details" id="personalPolicyDetails" aria-labelledby="personalPolicyDetailsTitle"><div class="card-pad"><h2 class="section-title" id="personalPolicyDetailsTitle">Policy details</h2></div>
 ${paDisclosure("What's included",paPolicyVehicleItems(policy,paIncluded),groupCount)}
 ${paDisclosure('Policy specifications',specifications,specs.length+ENDORSEMENT_REGISTRY.length+3)}
 ${paDisclosure("What's not included",paPolicyVehicleItems(policy,paResolvedExclusions),groupCount)}
 ${paDisclosure('Coverage limitations',paPolicyVehicleItems(policy,v=>v.limitations),groupCount)}
 ${paDisclosure('Coverage watch points',`<section class="pa-policy-vehicle-group"><h3 class="pa-policy-vehicle-title">Across your policy</h3>${policy.watchPoints.map(paWatch).join('')}</section>${paPolicyVehicleItems(policy,paVehicleWatches,true)}${paCriticalReferenceSet()}`,groupCount+2)}
 ${paDisclosure('State limits reference',paDetail({title:'Historical policy wording',text:'The Virginia amendment includes state-mandated limit wording for the document’s issue period. It is an informational source reference, not a current compliance verdict.',source:'newAuto'}),null)}</section>`;
 const glassInsight = paInsight({title:'The "$0 glass" illusion',status:'grounded',source:'physical',
   text:'Glass breakage is listed as other than collision on this policy, and no separate glass-repair deductible waiver is established. Where a policy shows "Comprehensive — Full Glass" on one line and a dollar deductible on the next, glass is $0 and everything else carries the shown deductible — a distinction easy to miss reading only the first line. Here, no full-glass line is present, so the standard $500 comprehensive deductible applies to a glass claim.'});
 const glassMandateInsight = paInsight({title:'State glass-repair mandates (general reference)',status:'compiled',
   text:'A small number of states mandate favorable glass-repair terms: Florida (windshield only), South Carolina (all safety glass), and Kentucky (glass-only claims, and it folds ADAS calibration into the repair). Arizona’s statute makes a safety-equipment option available rather than mandatory. This is general state law, not a fact about this Virginia-garaged policy — shown for reference because glass claims are commonly misunderstood.'});
 const subrogationInsight = paInsight({title:'Deductible recovery through subrogation is usually pro-rata',status:'compiled',
   text:'When the insurer recovers money from an at-fault third party, many states return only a proportional share of the policyholder’s deductible, not the whole amount — commonly deductible ÷ total loss × net recovery. On an $8,000 loss with a $1,000 deductible and a $6,000 net recovery, that is $750, not $1,000. The exact split varies by state and is not established for Virginia in the reviewed pages.'});
 const unavailable=['Payment frequency, AutoPay amount and an all-in term premium including fees.','Commuting/personal use, rated/occasional/permit-holder status and good-student status.','Awarded multi-vehicle, safe-driver and good-student discounts.','Glass-repair deductible waiver, a rideshare adding endorsement, death indemnity and essential-services benefits.','A daily rental rate and fixed covered day count under the selected Option 1 benefit.','Current renewal or continuous coverage throughout the historical term.','A prior-term premium for a like-for-like renewal comparison.','A garaging address separately labeled and distinct from the mailing address.','SR-22 / FR-44 or other financial-responsibility filing.','Loan/lease payoff endorsement, dealer GAP waiver, or new-car/better-car replacement documentation.','UM/UIM rejection, stacking-waiver, or tort-election forms (none needed here — UM/UIM is unreduced — but none are in the file either way).','Any homeowners, umbrella, boat or other companion policy needed to resolve the cross-policy items above.'];
 const sourceRows=[['Amended declarations','1923 VA (08-2022) · PDF 2–4','identity'],['Personal Auto Policy','PP 00 01 09 18 · PDF 5–18','physical'],['Virginia amendment','PP 01 99 01 22 · PDF 19–25','newAuto'],['Towing and transportation','PP 13 55 01 20 · PDF 26; PP 13 52 10 20 · PDF 27–29','rental'],['Vehicle-sharing exclusion','PP 43 20 11 20 · PDF 31–32','exclusions'],['Medical expense and income loss','PP 05 96 01 20 · PDF 36–40','income'],['Uninsured motorists','PP 14 03 10 20 · PDF 41–44','um'],['Loss payable clause','PP 03 05 08 86 · PDF 45','vehicle'],['Notices and disclosures','Forms 01, 03, 04 · PDF 33–35; Forms 10, 11 · PDF 46–47; privacy and delivery notices · PDF 48–56. Acknowledged without a coverage summary.','forms'],['Application and reinstatement statements','Form 101 · PDF 57–58; statements · PDF 59–61. Application used for driver identity only.','driver']];
 const priorTermNote = policy.priorTermPremium ? `Prior term premium: ${paMoney(policy.priorTermPremium)}. A premium increase from a prior term can carry a required renewal notice, so review your renewal documents.` : '';
 document.getElementById('autoMain').innerHTML=`<section class="card card-pad"><div class="heading-row"><h2 class="section-title">Your policy simplified</h2><span class="status-pill">${new Date(policy.end)<new Date()?'Expired':'In term'}</span></div>
 ${paField('Carrier',paEscape(policy.carrier))}${paField('Policy name / form',`${paEscape(policy.title)}<br>${paEscape(policy.form)} · edition ${paEscape(policy.formEdition)}`,null,'Every quoted coverage figure keys to this form and edition.')}${paField('Policy number',paEscape(policy.number))}${paField('Policyholder',paEscape(policy.insured))}${paField('Policy period','Dec 10, 2022 – Jun 10, 2023')}${paField('Coverage premiums',`${paMoney(policy.vehicles.reduce((s,v)=>s+paSubtotal(v),0))} · ${policy.term}${policy.installmentFee?` · $${policy.installmentFee} installment fee`:''}`,null,priorTermNote||'A prior-term premium for renewal comparison is not available in the pages analyzed.')}</section>
 <section class="card"><div class="card-pad"><h2 class="section-title">Individuals covered</h2>${paDetail({title:policy.insured,text:'Named insured · primary driver',source:'driver'})}${paUnavailable('Driver rating, occasional-driver, permit-holder and good-student status are not stated. A primary-driver listing does not establish these statuses.')}</div>${paDisclosure('Driver details',`${paField('Date of birth','**/**/1990','driver','Already masked in the source.')}${paField('Driver’s license','Virginia · ******745','driver','Already masked in the source.')}`,null)}<div class="card-pad" style="padding-top:0">${paInsightList(INDIVIDUALS_INSIGHTS)}</div></section>
 ${policy.vehicles.length<7?policy.vehicles.map((v,i)=>paVehicle(v,'asset'+i)).join(''):`<section class="card card-pad"><h2 class="section-title">Vehicles covered <span class="count-pill">${policy.vehicles.length}</span></h2><label for="fleetSearch">Find a vehicle</label><input id="fleetSearch" class="search-field" type="search" placeholder="Search name or VIN"><p id="fleetStatus" class="label" role="status"></p><div id="fleetRows"></div><button id="fleetMore" class="secondary-action" type="button">See more</button></section>`}
 ${paInjurySection()}
 ${policyDetails}
 <section class="card pa-deductibles"><div class="card-pad"><h2 class="section-title">Deductibles</h2><p class="label">What you must pay before insurance pays.</p>${policy.vehicles.map(v=>`<section class="pa-deductible-asset"><h3>${paEscape(v.name)}</h3>${paField('Comprehensive','$500 · deductible applies','physical')}${paField('Collision','$500 · deductible applies','physical')}</section>`).join('')}${paDetail({title:'Liability and UM/UIM bodily injury',text:'No deductible applies to these coverages. Medical expense benefits are declined, so a medical deductible is not applicable.',source:'liability'})}${paDetail({title:'UM property damage · $200 shown',text:'The declarations show $200. The endorsement applies its $200 provision to unknown/hit-and-run vehicles; review this difference with your insurance professional.',source:'um'})}<div class="pa-insight-list" style="margin-top:12px">${glassInsight}${glassMandateInsight}${subrogationInsight}</div>${paDetail({title:'Important to know',text:'For coverage with a deductible, a loss below that deductible produces no payment under that coverage. Higher deductibles mean more out of pocket. A glass repair waiver is not established here.',source:'physical'})}</div></section>
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
 document.getElementById('fleetRows').onclick=e=>{const b=e.target.closest('[data-vehicle]');if(!b)return;const v=vehicles.find(v=>v.id===b.dataset.vehicle);document.getElementById('autoVehicleTitle').textContent=v.name;document.querySelector('.auto-vehicle-body').innerHTML=paVehicle(v,'fleetAsset',true);window.openAutoModal(document.getElementById('autoVehicleSheet'),b);};draw();
}
renderPersonalAutoV2();
