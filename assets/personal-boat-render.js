/* Reuse the personal-auto page's field, disclosure, fact and source-control composition. */
const paEscape = value => String(value ?? '').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const paIcon = name => `<svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${name==='down'?'<path d="m6 9 6 6 6-6"/>':name==='right'?'<path d="m9 18 6-6-6-6"/>':'<circle cx="12" cy="12" r="10"/><path d="M12 16v-4m0-4h.01"/>'}</svg>`;
const paInfo = id => `<button type="button" class="source-button" data-source="${id}" aria-label="Source: ${paEscape(EVIDENCE[id].title)}">${paIcon('info')}</button>`;
const paField = (label,value,source) => `<div class="field auto-field pa-searchable"><div><div class="label">${label}</div><div class="value">${value}</div></div>${source?paInfo(source):''}</div>`;
const paDetail = item => `<div class="coverage-detail auto-fact pa-searchable"><div class="auto-detail-head"><h3>${paEscape(item.title)}</h3>${item.source?paInfo(item.source):''}</div><p>${paEscape(item.text)}</p></div>`;
const paWatch = item => `<div class="watchpoint pa-searchable"><div class="watchpoint-head"><span class="severity ${item.severity.toLowerCase()}">${item.severity}</span>${paInfo(item.source)}</div><h3>${paEscape(item.title)}</h3><p>${paEscape(item.text)}</p></div>`;
const paDisclosure = (title,body,count) => `<details class="auto-disclosure"><summary><span>${title}</span>${count==null?'':`<span class="count-pill">${count}</span>`}${paIcon('down')}</summary><div class="auto-disclosure-body">${body}</div></details>`;
const boatNote = (title,text) => `<div class="evidence-note boat-note pa-searchable"><strong>${title}</strong><p>${text}</p></div>`;
const boatRows = items => items.map(paDetail).join('');
const boatCard = (title,body) => `<section class="card card-pad"><h2 class="section-title">${title}</h2>${body}</section>`;
const boatDisclaimer = 'Insights are based on the documents provided; incomplete or missing documents may result in incomplete or inaccurate insights. OVIE is not intended to serve as evidence of insurance for third parties, nor does OVIE provide advice or guidance on the adequacy of coverage. Users should consult their agent or insurance carrier for coverage-related questions or determinations.';

document.getElementById('autoMain').innerHTML = `
<section class="card card-pad"><div class="heading-row"><h2 class="section-title">Your policy simplified</h2></div>
${paField('Policy type','Personal boat / yacht')}
${paField('Policy name',BOAT_TITLE)}
${paField('Governing form',BOAT_FORM)}
${paField('Policyholder','Not available')}
${paField('Underwriting company','Not available')}
${paField('Policy number','Not available')}
${paField('Policy period','Not available')}
${paField('Premium & term','Not available')}
${boatNote('Declarations not supplied','This sample summary describes policy wording. Your vessel, selected coverages, limits and policy status cannot be confirmed.')}</section>
${boatCard('Who is covered',boatRows([
 {title:'Named insured and resident spouse',text:'Described by the definitions, but no person is identified in the supplied summary.',source:'people'},
 {title:'Permitted operators',text:'A permitted person or organization may qualify under the definitions. Commercial rental and paid-operation restrictions still apply.',source:'people'},
 {title:'Passengers and towed persons',text:'Benefit eligibility depends on the liability or medical-payments wording. Being a passenger does not automatically establish insured status.',source:'people'}
]))}
${boatCard('Vessels & marine assets',paDetail({title:'Vessel schedule not available',text:'No boat, yacht or personal watercraft can be identified from the summary. This does not mean that no vessel is insured.',source:'assets'})+paDetail({title:'Motors, tenders and equipment',text:'The definitions describe original or permanently attached equipment. Outboards, tenders, trailers and personal effects depend on definitions or schedule entries.',source:'assets'})+boatNote('Per-vessel coverage unavailable','Vessel values, hull identification numbers, liability limits and physical-damage amounts need the declarations and schedule.'))}
<section class="card pa-policy-details"><div class="card-pad"><h2 class="section-title">Policy details</h2></div>
${paDisclosure("What’s included",boatNote('Benefits described in the sample','These coverage parts are described in the summary. Their inclusion on an issued policy and selected limits are not confirmed.')+BOAT.included.map(group=>`<section class="boat-group"><h3 class="pa-policy-vehicle-title">${group.heading}</h3>${boatRows(group.items)}</section>`).join(''),2)}
${paDisclosure('Policy specifications',boatRows(BOAT.specifications),3)}
${paDisclosure('Sub-limits',paDetail({title:'Amounts not available',text:'The summary refers to limits for towing, wreck removal and personal property, but provides no selected amounts or applicable bases.',source:'assistance'}),null)}
${paDisclosure('Navigation & lay-up',boatRows([
 {title:'Navigation territory',text:'The summary mentions the United States, Alaska, Hawaii, Puerto Rico and Canada. Its geographical wording is ambiguous; use the original clause and scheduled navigation boundaries to confirm the area.',source:'navigation'},
 {title:'Mooring and lay-up dates',text:'Home port, primary mooring and any required lay-up period are not available.',source:'navigation'},
 {title:'Warranty breaches',text:'The summary refers to a 10-day correction provision, but its effect on a loss during a breach is unclear. Do not treat it as a confirmed grace period.',source:'navigation'}
]),3)}
${paDisclosure('Valuation & loss settlement',boatRows([
 {title:'Hull settlement basis needs confirmation',text:'The summary describes repair, replacement and actual-cash-value comparisons. The original wording, scheduled value and applicable endorsement are needed to resolve the actual settlement basis.',source:'valuation'},
 {title:'Trailer and personal property',text:'The summary describes the lowest of actual cash value, repair cost or replacement cost for these items. Scheduled property and applicable conditions must be confirmed.',source:'valuation'},
 {title:'Age-dependent depreciation',text:'Two length-dependent endorsement variants are referenced. Older equipment and machinery may receive depreciated settlement; see Policy specifications.',source:'endorsements'}
]),3)}
${paDisclosure("What’s not included",boatRows(BOAT.excluded),BOAT.excluded.length)}
${paDisclosure('Coverage limitations',boatRows(BOAT.limitations),BOAT.limitations.length)}
${paDisclosure('Claims & assistance',boatRows([
 {title:'Protect property and cooperate',text:'The summary describes protecting property, separating damaged property, allowing inspection and cooperating with the insurer.',source:'claims'},
 {title:'Proof of loss',text:'Sworn proof of loss is described for medical payments and upon request for property damage. Exact deadlines and requirements need the original wording.',source:'claims'},
 {title:'Towing and recovery approval',text:'Confirm the applicable assistance limits and approval requirements. No claims phone number or named claims administrator is supplied.',source:'assistance'}
]),3)}
${paDisclosure('Coverage watch points',BOAT.watches.map(paWatch).join('')+boatNote('Confirm the scheduled details','Obtain the declarations and issued forms to identify the insured vessel, selected coverages and applicable conditions.'),BOAT.watches.length)}
</section>
${boatCard('Deductibles',paField('Hull / physical damage','Amount not available','deductibles')+paDetail({title:'Different parts and property items',text:'The summary describes a deductible applying separately by part and property item, per occurrence. Trailer and personal-property amounts may differ.',source:'deductibles'})+paDetail({title:'Liability, medical payments and uninsured boater',text:'The summary describes no deductible unless otherwise shown. The declarations and amendments are needed to confirm.',source:'deductibles'})+paDetail({title:'Named storm or hurricane',text:'A separate deductible is not established. Missing information does not mean the deductible is zero.',source:'deductibles'}))}
<section class="card footer-card"><div class="card-pad"><h2 class="section-title">About these insights</h2><p>${boatDisclaimer}</p>${boatNote('Based on a supplied summary','The original policy PDF has not been reviewed. Page references are reported by the summary and have not been verified against a PDF.')}
</div>
${paDisclosure('Document sources',paDetail({title:BOAT_TITLE,text:'Supplied structured summary · form MA-14558A (04/05). References policy pages 1–13, including endorsement wording on page 13. Original PDF and declarations unavailable.',source:'identity'})+paDetail({title:'Referenced endorsement variants',text:'MA7Z04 (4/00) and MA6508b (04/01), reported on page 13. Issued applicability is not confirmed.',source:'endorsements'}),2)}
${paDisclosure('Not available in the pages analyzed',`<ul class="source-list">${BOAT.unavailable.map(text=>`<li class="pa-searchable">${paEscape(text)}</li>`).join('')}</ul>`,BOAT.unavailable.length)}
</section>`;
document.getElementById('autoMain').append(document.getElementById('autoFeedback').content.cloneNode(true));
