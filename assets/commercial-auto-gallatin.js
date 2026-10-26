/* Gallatin County Water District · Commercial Auto insights.
   Every value below is taken from "Commercial Auto Raw Insights.docx". Nothing is added or inferred. */
const autoEscape = value => String(value ?? '').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const autoIcon = name => {
  const shapes={info:'<circle cx="12" cy="12" r="10"/><path d="M12 16v-4m0-4h.01"/>',down:'<path d="m6 9 6 6 6-6"/>',truck:'<path d="M10 17h4V5H2v12h3m10-9h4l3 4v5h-3"/><circle cx="7.5" cy="17.5" r="2.5"/><circle cx="16.5" cy="17.5" r="2.5"/>'};
  return `<svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${shapes[name]||shapes.info}</svg>`;
};

/* Source registry: each cited fact opens its document citation (and the schedule row where one exists). */
const EVIDENCE={};
let sourceCount=0;
const source=(title,ref,entries)=>{const id='src'+(++sourceCount);EVIDENCE[id]={title,ref,entries:entries||null};return id;};

const POLICY_ID='CPO-0632562-02';
const POLICY_END='2022-07-01';
const DECS='CPO-0632562-02 Common Policy Declarations, Page 1/130';

const overview=[
  ['Policyholder','Gallatin County Water District'],
  ['Policy type','Commercial Auto'],
  ['Policy number','CPO-0632562-02'],
  ['Carrier','American Zurich Insurance Company'],
  ['Mailing address','4500 Hwy 455, Sparta, KY 41086'],
  ['Policy term','7/1/2021 to 7/1/2022'],
  ['Business description','Special District'],
  ['Named-insured entity type','Not specified beyond "Special District"'],
  ['Commercial auto policy form','BUSINESS AUTO DECLARATIONS, U-CA-D 600 C(0414)'],
  ['Commercial auto premium','$3,013'],
  ['Additional fees (all lines)','$287 terrorism, $163.31 taxes & surcharges, $250 data fee'],
  ['Total policy premium including all fees','$18,597.31 (all lines, not auto-specific)'],
  ['Broker / producer / agency','Allied Public Risk LLC, 4507 North Front Street Suite 200, Harrisburg, PA 17110, Producer No. 56139000']
];

const BAD112='Business Auto Declarations, Page 112/130';
const symbolRows=[
  ['Liability','1','"Any auto" (covers owned, hired, leased, borrowed, and non-owned autos)','Business Auto Declarations, Page 112/130; Business Auto Policy Form U-CA-D 600 C(0414), Section I—Covered Autos'],
  ['Personal Injury Protection (PIP)','5','"Owned autos subject to no-fault" (applies to autos that must meet no-fault requirements)','Business Auto Declarations, Page 112/130; Business Auto Policy Form U-CA-D 600 C(0414), Section I—Covered Autos'],
  ['Uninsured Motorists','2','"Owned autos only" (owned vehicles as listed)','Business Auto Declarations, Page 112/130; Business Auto Policy Form U-CA-D 600 C(0414), Section I—Covered Autos'],
  ['Underinsured Motorists','2','"Owned autos only"',BAD112],
  ['Comprehensive','7, 8','"Specifically described autos (7) and hired autos only (8)" (see vehicle and hired auto schedules)','Business Auto Declarations, Page 112/130; Form definitions'],
  ['Collision','7, 8','"Specifically described autos (7) and hired autos only (8)"',BAD112]
].map(([coverage,symbol,meaning,ref])=>({coverage,symbol,meaning,source:source(coverage+' · covered-auto symbol',ref,[['Coverage',coverage],['Covered-auto symbol',symbol],['Plain-language meaning',meaning]])}));

const limitRows=[
  ['Liability','1','$1,000,000','Each Accident','Covers any auto for up to $1,000,000 per accident',BAD112],
  ['Personal Injury Protection','5','Not stated','PIP Endt. minus deductible','As per separately stated endorsement',BAD112],
  ['Uninsured Motorists','2','$1,000,000','Each Accident','Uninsured motorist coverage for owned autos only; $1M per accident',BAD112],
  ['Underinsured Motorists','2','$1,000,000','Each Accident','Underinsured motorist coverage for owned autos only; $1M per accident',BAD112],
  ['Comprehensive (Autos Owned)','7','ACV or cost of repair, minus $500 deductible','Per Auto/Per Loss','Covers specified vehicles for comprehensive (non-collision) losses','Business Auto Declarations, Auto Schedule, Pages 112, 121/130'],
  ['Collision (Autos Owned)','7','ACV or cost of repair, minus $500 deductible','Per Auto/Per Loss','Covers specified vehicles for collision losses','Business Auto Declarations, Auto Schedule, Pages 112, 121/130'],
  ['Comprehensive (Hired Autos)','8','$35,000','Each loss','Hired vehicles, $35,000 max per loss, $500 deductible each auto','Business Auto Declarations, p. 116/130'],
  ['Collision (Hired Autos)','8','$35,000','Each loss','Hired vehicles, $35,000 max per loss, $500 deductible each auto','Business Auto Declarations, p. 116/130']
].map(([title,symbol,limit,basis,summary,ref])=>({title,symbol,limit,basis,summary,source:source(title,ref,[['Coverage title',title],['Covered-auto symbol',symbol],['Limit',limit],['Limit basis',basis],['Plain-language summary',summary]])}));

const AUTO_REF='Auto Schedule, Page 121/130';
const vehicles=[
  ['1','1997','Hurst','Trailer','1HT9T41834V1057027','$2,750'],
  ['2','1998','GMC','Sierra','1GDJC34R6WF032684','$22,000'],
  ['3','2010','Ford','F250','1FTSX2B50AEA08886','$26,295'],
  ['4','2012','Ford','F250','1FT7X2B68CEA12959','$35,000'],
  ['5','2016','Ford','F150','1FTFX1EF9GFB03420','$27,204'],
  ['6','2017','Chevrolet','1500','1GCUYAEF4KZ310485','$29,946'],
  ['7','2020','BigTex','Utility Trailer','16VEX2026L2053636','$4,600']
].map(([number,year,make,model,vin,cost])=>({number,name:`${year} ${make} ${model}`,vin,cost,comp:'$500',coll:'$500',applicable:'Liab, UM/UIM, Comp, Coll',source:source(`${year} ${make} ${model}`,AUTO_REF,[['Vehicle #',number],['Year',year],['Make',make],['Model',model],['VIN',vin],['Cost New',cost],['COMP Ded','$500'],['COLL Ded','$500'],['Applicable Coverages','Liab, UM/UIM, Comp, Coll']])}));

const detail=(title,text,ref,extra)=>({title,text,source:source(title,ref),...extra});

const valuation=detail('Valuation','Actual Cash Value for all autos.',AUTO_REF);
const drivers=[
  detail('Covered Driver Schedule','Not provided in the supplied files.','Files reviewed: All CPO-0632562-02 commercial auto declarations, schedules, endorsements'),
  detail('Missing item notification','No named or scheduled drivers are shown; no driver-restriction endorsements are referenced or attached.','Files reviewed: All CPO-0632562-02 commercial auto declarations, schedules, endorsements')
];

const included=[
  ['Covered Autos Liability','1','Pays bodily injury and property damage losses when using any auto (owned, hired, non-owned, borrowed).'],
  ['Personal Injury Protection','5','Pays no-fault losses as per KY requirements for covered vehicles.'],
  ['Uninsured Motorists','2','Covers you if injured by a driver with no insurance, using owned autos.'],
  ['Underinsured Motorists','2','Covers you if injured by a driver with too little insurance, owned autos.'],
  ['Comprehensive','7, 8','Pays for non-collision damages (theft, weather, fire, etc.) on scheduled and hired vehicles.'],
  ['Collision','7, 8','Pays for collision damages to scheduled and hired vehicles.']
].map(([title,symbol,text])=>({title,text,symbol,source:source(title,BAD112)}));

const FORM='Business Auto Policy Form U-CA-D 600 C(0414)';
const excluded=[
  ['Expected or Intended Injury','Losses expected or intended from the insured’s standpoint are not covered.'],
  ['Contractual Liability','Liabilities assumed under contracts, unless specifically allowed, are not covered.'],
  ['Workers’ Compensation','The policy does not provide workers’ compensation or similar benefits.'],
  ['Care, Custody, or Control','Damage to property owned by, transported by, or in the care, custody, or control of the insured is not covered.'],
  ['Employee Indemnification and Employer’s Liability','Bodily injury to employees is covered only under a separate workers\' comp policy.'],
  ['Handling of Property','Coverage does not apply while property is being handled before or after transport.'],
  ['Pollution','Excludes most pollution-related losses except as specifically endorsed or excepted.'],
  ['Racing','No coverage for vehicles while being used in professional or organized racing.'],
  ['War and Nuclear','Excludes acts of war and nuclear incidents.']
].map(([t,x])=>detail(t,x,`${FORM}, Section II, Exclusions`));

const limitations=[
  detail('Symbol-Specific Coverage','Each coverage only extends to that coverage’s designated auto symbol (e.g., owned, hired, any).',`${FORM}, Section I`),
  detail('Physical Damage Valuation','Pays actual cash value or cost of repairs—whichever is less—minus stated deductible.','Business Auto Declarations, Page 112/130; Auto Schedule, Page 121/130'),
  detail('Hired Auto Physical Damage Sublimit','Hired autos are capped at $35,000 per loss for comp and collision.','Business Auto Declarations, Page 116/130'),
  detail('Deductibles Per Auto/Per Loss','Each vehicle has a $500 per-loss deductible for comp and collision coverage.',AUTO_REF),
  detail('No Coverage for Non-Scheduled Drivers','Because no driver schedule is on file, there are no declared limitations or extensions regarding driver assignments or exclusions.','All supplied files; missing item listing'),
  detail('Territory Limitation','Policy applies within coverage territory, usually US/Canada, but see master policy for specifics.',`${FORM}, Section VII`)
];

const watchPoints=[
  detail('Symbol Mismatch Watchpoint','Different coverages use different symbols (e.g., Liability "1" vs. Physical Damage "7,8" vs. UM/UIM "2")—each auto may not be covered for every available benefit; review coverage by symbol.',BAD112),
  detail('Informational Driver Schedule','No covered drivers are listed; if you have named drivers or driver exclusions, ensure they are endorsed/recorded.','Files reviewed: All CPO-0632562-02'),
  detail('Owned Vehicle Schedule Completeness','All listed vehicles show year, make, model, VIN, comp, and coll deductibles; if a new unit is added, schedule and endorsement are required for coverage.',AUTO_REF),
  detail('Hired Auto Physical Damage Cap','$35,000 per-loss sublimit for comprehensive and collision on hired autos; review exposure before renting higher-value vehicles.','Business Auto Declarations, Page 116/130'),
  detail('Actual Cash Value Valuation','"Actual cash value" basis can result in less than full replacement cost after a loss—potential gap with new/expensive vehicles.',AUTO_REF)
];

const specs=[
  detail('Endorsements Attached','"SEE SCHEDULE OF FORMS AND ENDORSEMENTS" is referenced, but specific auto endorsements are not shown in the supplied excerpts for this period.','Business Auto Declarations, Page 111/130'),
  detail('Forms Referenced','','Business Auto Declarations, Page 111/130',{list:['Common Policy Conditions IL 00 17','Broad Form Nuclear Exclusion IL 00 21']}),
  detail('Missing Endorsements/Forms','Any referenced but missing or unsubmitted endorsements are informational missing items; their specifics cannot be summarized without actual text.','Business Auto Declarations, Page 111/130')
];

const dedPrem=[
  ['Each Scheduled Vehicle','Comprehensive','$500 per loss per vehicle','Included','Actual cash value valuation, fire/lightning exception','Auto Schedule, Page 121/130; Declarations, Page 112/130'],
  ['Each Scheduled Vehicle','Collision','$500 per loss per vehicle','Included','Actual cash value valuation','Auto Schedule, Page 121/130'],
  ['Hired Autos','Comp & Coll','$500 per loss per auto; $35,000 max per loss','Included','Valuation capped at $35,000','Business Auto Declarations, Page 116/130'],
  ['Policy-Level (Auto line)','All coverages','As above','$3,013','Per policy year, billed as stated','Business Auto Declarations, Page 112/130'],
  ['Fees/Taxes (all lines)','—','—','+$287 terrorism, +$163.31 taxes & surcharges, +$250 data fee','Per policy year, all lines combined','Common Policy Declarations, Page 94/130']
].map(([level,coverage,deductible,premium,application,ref])=>({level,coverage,deductible,premium,application,source:source(`${level} · ${coverage}`,ref,[['Level/Vehicle',level],['Coverage',coverage],['Deductible',deductible],['Premium',premium],['Application',application]])}));

const missing=[
  'No driver schedule or names: Not supplied.',
  'No vehicle-level premiums: Policy-level only.',
  'No explicit state-specific endorsements shown for auto coverages.'
];

const disclaimer='Insights are based on the documents provided; incomplete or missing documents may result in incomplete or inaccurate insights. OVIE is not intended to serve as evidence of insurance for third parties, nor does OVIE provide advice or guidance on the adequacy of coverage. Users should consult their agent or insurance carrier for coverage-related questions or determinations.';

/* Markup helpers: same primitives and classes as the shared Commercial Auto page. */
const autoInfo = id => id ? `<button class="source-button" data-source="${autoEscape(id)}" aria-label="Source: ${autoEscape(EVIDENCE[id].title)}">${autoIcon('info')}</button>` : '';
const autoField = (label,value) => `<div class="field auto-field"><div><div class="label">${autoEscape(label)}</div><div class="value">${autoEscape(value)}</div></div></div>`;
const autoDetail = item => `<div class="coverage-detail auto-fact"><div class="auto-detail-head"><h3>${autoEscape(item.title)}</h3>${autoInfo(item.source)}</div>${item.text?`<p>${autoEscape(item.text)}</p>`:''}${item.list?`<ul class="source-list">${item.list.map(l=>`<li>${autoEscape(l)}</li>`).join('')}</ul>`:''}${item.symbol?`<div class="coverage-meta"><p><span>Covered-auto symbol</span> ${autoEscape(item.symbol)}</p></div>`:''}</div>`;
const autoDisclosure = (title,items,open=false) => `<details class="auto-disclosure" ${open?'open':''}><summary><span>${autoEscape(title)}</span>${Array.isArray(items)?`<span class="count-pill">${items.length}</span>`:''}${autoIcon('down')}</summary><div class="auto-disclosure-body">${Array.isArray(items)?items.map(autoDetail).join(''):items}</div></details>`;
const autoWatch = item => `<div class="watchpoint auto-fact"><div class="watchpoint-head">${autoInfo(item.source)}</div><h3>${autoEscape(item.title)}</h3><p>${autoEscape(item.text)}</p></div>`;
const limitRow = c => `<div class="coverage-detail auto-fact"><div class="auto-detail-head"><div class="label">${autoEscape(c.title)}</div>${autoInfo(c.source)}</div><div class="auto-limit">${autoEscape(c.limit)}</div><p>${autoEscape(c.basis)}</p><p class="auto-explanation">${autoEscape(c.summary)}</p><div class="coverage-meta"><p><span>Covered-auto symbol</span> ${autoEscape(c.symbol)}</p></div></div>`;
const symbolRow = r => `<div class="coverage-detail auto-fact"><div class="auto-detail-head"><div class="label">${autoEscape(r.coverage)}</div>${autoInfo(r.source)}</div><div class="auto-limit">Symbol ${autoEscape(r.symbol)}</div><p>${autoEscape(r.meaning)}</p></div>`;
const dedRow = r => `<div class="coverage-detail auto-fact"><div class="auto-detail-head"><h3>${autoEscape(r.level)} · ${autoEscape(r.coverage)}</h3>${autoInfo(r.source)}</div><div class="coverage-meta"><p><span>Deductible</span> ${autoEscape(r.deductible)}</p><p><span>Premium</span> ${autoEscape(r.premium)}</p><p><span>Application</span> ${autoEscape(r.application)}</p></div></div>`;
const vehicleRow = v => `<article class="auto-vehicle"><div class="auto-vehicle-head"><div class="auto-vehicle-icon">${autoIcon('truck')}</div><div><h3>${autoEscape(v.name)}</h3><p class="label">Vehicle ${autoEscape(v.number)}</p></div>${autoInfo(v.source)}</div><dl class="auto-vehicle-facts"><div><dt>VIN</dt><dd>${autoEscape(v.vin)}</dd></div><div><dt>Cost new</dt><dd>${autoEscape(v.cost)}</dd></div><div><dt>Comprehensive deductible</dt><dd>${autoEscape(v.comp)}</dd></div><div><dt>Collision deductible</dt><dd>${autoEscape(v.coll)}</dd></div><div><dt>Applicable coverages</dt><dd>${autoEscape(v.applicable)}</dd></div></dl></article>`;
const subhead = text => `<h3 class="auto-subtitle">${autoEscape(text)}</h3>`;

function renderAuto() {
  const status = POLICY_END < new Date().toISOString().slice(0,10) ? 'Expired' : 'Within term';
  const refs=[...new Set(Object.values(EVIDENCE).map(e=>e.ref))];
  document.getElementById('autoMain').innerHTML=`
  <section class="card card-pad" aria-labelledby="autoSimplified"><div class="heading-row"><h2 class="section-title" id="autoSimplified">Your policy simplified</h2><span class="status-pill">${status}</span></div>${overview.map(([l,v])=>autoField(l,v)).join('')}</section>
  <section class="card card-pad" aria-labelledby="coveredAutos"><div class="heading-row"><h2 class="section-title" id="coveredAutos">Covered autos</h2><span class="count-pill">${vehicles.length}</span></div><p class="detail-intro">Each vehicle is scheduled with year, make, model, VIN, costs, and applicable deductibles:</p>${vehicles.map(vehicleRow).join('')}${autoDetail(valuation)}</section>
  <section class="card card-pad" aria-labelledby="autoDrivers"><h2 class="section-title" id="autoDrivers">Covered drivers</h2>${drivers.map(autoDetail).join('')}</section>
  <section class="card auto-policy-details" aria-labelledby="autoPolicyDetails"><div class="card-pad"><h2 class="section-title" id="autoPolicyDetails">Policy details</h2></div>
    ${autoDisclosure("What's included",`<section class="auto-coverage-group">${subhead('Coverage and monetary limits')}${limitRows.map(limitRow).join('')}</section><section class="auto-coverage-group">${subhead('Coverage summaries')}${included.map(autoDetail).join('')}</section>`,true)}
    ${autoDisclosure('Covered-auto symbols',`${symbolRows.map(symbolRow).join('')}`)}
    ${autoDisclosure('Policy specifications',specs)}
    ${autoDisclosure("What's not included",`<p class="detail-intro">Exclusions – see policy form for exhaustive list</p>${excluded.map(autoDetail).join('')}`)}
    ${autoDisclosure('Coverage limitations',limitations)}
    ${autoDisclosure('Coverage watch points',watchPoints.map(autoWatch).join(''))}
    ${autoDisclosure('Deductibles and premiums',dedPrem.map(dedRow).join(''))}
  </section>
  <section class="card footer-card" aria-labelledby="autoAbout"><div class="card-pad"><h2 class="section-title" id="autoAbout">About these insights</h2><p>${disclaimer}</p></div>
    ${autoDisclosure('Document sources',`<ul class="source-list">${refs.map(r=>`<li>${autoEscape(r)}</li>`).join('')}</ul>`)}
    ${autoDisclosure('Not available in the pages analyzed',`<ul class="source-list">${missing.map(m=>`<li>${autoEscape(m)}</li>`).join('')}</ul>`)}
  </section>`;
  document.getElementById('autoMain').append(document.getElementById('autoFeedback').content.cloneNode(true));
}
renderAuto();
