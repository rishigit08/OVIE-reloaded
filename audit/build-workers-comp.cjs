const fs=require('fs'),path=require('path');
const root=path.resolve(__dirname,'..');
const ref=fs.readFileSync(path.join(__dirname,'workers-comp/template.html'),'utf8');
const pages=require('./workers-comp/pages.json');
const groups=require('./workers-comp/classes.json');
const locations=require('./workers-comp/locations.json');
const E={};
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const clean=s=>s.replace(/\s+/g,' ').trim();
function evidence(id,title,page,form,start,end){
 const text=pages[page-1]; const a=text.indexOf(start),b=end?text.indexOf(end,a+start.length):text.indexOf('Case 1:',a);
 if(a<0||b<a)throw Error('Cannot locate excerpt: '+id);
 E[id]={title,page,ref:`${form} · PDF page ${page}`,excerpt:text.slice(a,b).replace(/[\t ]+/g,' ').replace(/\n(?=(?:[A-Z]\. |\d+\. |PART ))/g,'\n\n').trim()};
}
evidence('identity','Policy information',20,'WC 99 00 01 C · Information Page','Insured:','A.\n');
evidence('premium','Estimated premium and cost',20,'WC 99 00 01 C · Item 4','TOTAL  ESTIMATED  ANNUAL','Issue Date');
evidence('states','Covered states and stated liability limits',20,'WC 99 00 01 C · Item 3','Workers Compensation Insurance:','4. The premium');
evidence('business','Business classification',346,'New Jersey cancellation notice','Temporary Staffing','CERTIFICATION:');
evidence('program','Guaranteed cost program',2,'New policy welcome letter','Re: Workers Compensation Coverage','Thank you');
evidence('cancel','Cancellation at insured request',340,'Notice of Cancellation','Effective Date of Cancellation:','If you have any questions');
evidence('statutory','Workers compensation benefits',65,'WC 00 00 00 A · Part One','PART  ONE','D. We Will Also Pay');
evidence('beneficiary','Employees receive the benefits',66,'WC 00 00 00 A · Part One H','3. We  are directly','4. Jurisdiction');
evidence('locations','Workplaces and locations',65,'WC 00 00 00 A · General Section E','E. Locations','PART  ONE');
evidence('liability','Employers liability',67,'WC 00 00 00 A · Part Two B','B. We Will Pay','G. Exclusions');
evidence('epli','Employment practices exclusion',67,'WC 00 00 00 A · Part Two C.7','7. damages arising','8 .');
evidence('exclusions','Employers liability exclusions',67,'WC 00 00 00 A · Part Two C','G. Exclusions','Includes copyright');
evidence('otherStates','New work in other states',68,'WC 00 00 00 A · Part Three','PART  THREE','Includes copyright');
evidence('notice','Other-states notification rules',69,'WC 00 00 00 A · Part Three','3. We  will reimburse','PART  FOUR');
evidence('classifications','Payroll and classification basis',69,'WC 00 00 00 A · Part Five B–C','Classifications','D. Premium Payments');
evidence('audit','Final premium and annual audit',70,'WC 00 00 00 A · Part Five E–G','classifications and rates','PART  SIX');
evidence('mod','Estimated experience modification',76,'WC 00 04 03','The premium for the policy','This endorsement');
evidence('defense','Defense and supplementary payments',68,'WC 00 00 00 A · Part Two D–E','D. We Will Defend','F. Other Insurance');
evidence('stateAmend','State-specific endorsements',92,'WC 04 03 60 B · California amendatory endorsement','The insurance afforded','This endorsement');
evidence('officers','Officer and member elections',216,'New Hampshire · Form 6WCex','EXCLUSION OF EXECUTIVE','1. Date:');
evidence('njElection','Proprietor and partner elections',72,'New Jersey · Form PP-1B','The New  Jersey','The insurer or insurance');
const icons={info:'<circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/>',down:'<path d="m6 9 6 6 6-6"/>',alert:'<path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3"/><path d="M12 9v4M12 17h.01"/>'};
const svg=(n,c='')=>`<svg class="${c}" aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${icons[n]}</svg>`;
const info=id=>`<button class="source-button" type="button" data-source="${id}" aria-label="View source: ${esc(E[id].title)}">${svg('info')}</button>`;
const field=(l,v,id)=>`<div class="field sourced-field"><div><div class="label">${l}</div><div class="value">${v}</div></div>${id?info(id):''}</div>`;
const fact=(l,v,p,id)=>`<div class="coverage-row"><div class="coverage-copy"><div class="label">${l}</div><div class="value">${v}</div>${p?`<p class="coverage-description">${p}</p>`:''}</div>${id?info(id):''}</div>`;
const detail=(title,copy,id)=>`<div class="coverage-detail"><div class="coverage-detail-head"><h3>${title}</h3>${id?info(id):''}</div><p>${copy}</p></div>`;
const note=(copy,id)=>`<div class="neutral-note${id?' sourced-note':''}"><p>${copy}</p>${id?info(id):''}</div>`;
const item=(text,id)=>`<div class="insight-item"><span>${text}</span>${id?info(id):''}</div>`;
const disclosure=(title,count,body,open=false,id='')=>`<details ${open?'open':''} ${id?`id="${id}"`:''}><summary><span class="summary-title">${title}</span>${count?`<span class="count-pill">${count}</span>`:''}${svg('down','chevron')}</summary><div class="policy-detail-body">${body}</div></details>`;
const watch=(level,title,copy,id)=>`<div class="watchpoint"><div class="watchpoint-head"><span class="severity ${level.toLowerCase()}">${level}</span>${info(id)}</div><strong>${title}</strong><p>${copy}</p></div>`;
const money=n=>n===null?'Not stated':`$${n.toLocaleString('en-US')}`;
const filter=(id,label,placeholder)=>`<div class="schedule-filter"><label for="${id}">${label}</label><input class="search-field" id="${id}" type="search" placeholder="${placeholder}"><p class="filter-status" id="${id}Status" role="status" aria-live="polite"></p></div>`;
const states=groups.map(g=>g.state).join(', ');
for(const g of groups){
 const rating=pages[g.page-1].match(/Experience Modification (?:\d+%|N\/A)[^\n]*/)?.[0];
 E['schedule'+g.page]={title:`${g.state} experience rating`,page:g.page,ref:`WC 99 00 01 C · Item 4 · PDF page ${g.page}`,excerpt:`${g.state}\n${rating}${g.merit?'\n'+clean(g.merit):''}`};
 for(const c of g.classes){
  E[`class${c.page}_${c.code}`]={title:`${g.state} · Class ${c.code}`,page:c.page,ref:`WC 99 00 01 C · Item 4 · PDF page ${c.page}`,excerpt:`${g.state}\nClassification: ${c.description}\nCode No.: ${c.code}\nPremium basis — total estimated annual remuneration: ${c.payroll===null?'[blank in schedule]':money(c.payroll)}\nRate per $100 of remuneration: $${c.rate}`};
 }
}
const classRow=(c,state,preview=false)=>`<div class="coverage-detail class-entry${preview?' class-preview':''}" data-class-entry data-search="${esc(state+' '+c.code+' '+c.description)}"><div class="coverage-detail-head"><div><span class="entry-meta">${esc(state)} · Class ${c.code}</span><${preview?'h3':'h4'}>${esc(c.description.replace(/Mfg\./gi,'manufacturing').replace(/\bNOC\b/g,'(not otherwise classified)'))}</${preview?'h3':'h4'}></div>${info(`class${c.page}_${c.code}`)}</div><div class="class-facts"><div><span class="label">Estimated annual payroll</span><strong>${money(c.payroll)}</strong></div><div><span class="label">Rate per $100 of payroll</span><strong>$${c.rate}</strong></div></div></div>`;
const classCount=groups.reduce((n,g)=>n+g.classes.length,0);
const classList=groups.map(g=>`<section class="state-class-group" data-class-group aria-label="${esc(g.state)} classifications"><div class="state-heading"><h3>${esc(g.state)}</h3><span class="entry-meta">${g.classes.length} ${g.classes.length===1?'class':'classes'}</span></div>${g.classes.map(c=>classRow(c,g.state)).join('')}</section>`).join('');
const locationList=locations.map(([n,address,state])=>{
 const page=n<=32?252:253,id='location'+n;
 E[id]={title:`Location ${n} · ${state}`,page,ref:`WC 99 00 01 C · Item 1 · PDF page ${page}`,excerpt:`${n>=50?'MVP Workforce, LLC':'Personnel Staffing Group, LLC DBA: Barnett Management'}\nLocation Number ${n}.\n${address}`};
 return `<div class="coverage-detail location-entry" data-location-entry data-search="${esc(n+' '+address+' '+(n>=50?'MVP Workforce':'Personnel Staffing Group'))}"><div class="coverage-detail-head"><strong>Location ${n} · ${state}</strong>${info(id)}</div><p class="location-address">${esc(address)}</p>${n>=50?'<p class="entry-meta">MVP Workforce, LLC</p>':''}</div>`;
}).join('');
const california=groups.find(g=>g.state==='California');
const previewClasses=['8810','8292','2003'].map(code=>classRow(california.classes.find(c=>c.code===code),'California',true)).join('');
require('./workers-comp/enrich-evidence.cjs')(E,groups,locations);
const disclaimer='Insights are based on the documents provided; incomplete or missing documents may result in incomplete or inaccurate insights. OVIE is not intended to serve as evidence of insurance for third parties, nor does OVIE provide advice or guidance on the adequacy of coverage. Users should consult their agent or insurance carrier for coverage-related questions or determinations.';
const main=`
<section class="card card-pad" aria-labelledby="simplified-title"><div class="heading-row"><h2 class="section-title" id="simplified-title">Your policy simplified</h2><span class="status-pill" aria-label="Cancelled effective August 5, 2016, per the supplied notice">Cancelled</span></div>
${field('Policy type','Commercial workers’ compensation')}
${field('Policy label','Workers’ Compensation and Employers Liability')}
${field('Named insured','Personnel Staffing Group, LLC<br>DBA: Barnett Management')}
${field('Policy number','WWC3216474')}${field('Carrier','Wesco Insurance Company')}
${field('Business classification','Temporary staffing')}${field('Policy term','June 30, 2016 – June 30, 2017')}
${field('Estimated annual premium','$33,316,855')}
${field('Covered states · Item 3.A',`${groups.length} states`)}
<p class="state-list">${esc(states)}</p>
</section>
<aside class="card card-pad attention cancellation-note">${svg('alert')}<div class="cancellation-copy"><div class="cancellation-heading"><strong>Cancelled effective August 5, 2016</strong>${info('cancel')}</div><p>The supplied notice ends this policy at 12:01 a.m. at the insured’s mailing address, at the insured’s request. Review the applicable injury or disease-exposure dates with your agent.</p></div></aside>
<section class="card" aria-labelledby="locations-title"><div class="card-pad"><div class="heading-row"><h2 class="section-title" id="locations-title">Locations covered</h2>${info('locationsOverview')}</div><p><strong>51 declared locations</strong> across 39 states.</p><p class="section-copy">Addresses and “No Specific Location” entries are retained as scheduled. Locations 50–51 are listed under MVP Workforce, LLC.</p></div>
${disclosure('All declared locations','51',filter('locationSearch','Find a declared location','Search address, state code or location number')+locationList,false,'locationsList')}
<div class="card-pad"><p class="neutral-note">The form also covers other workplaces in Item 3.A states unless separately insured or self-insured. An undeclared address is a point to verify, not an automatic exclusion.</p></div></section>
<section class="card" aria-labelledby="employees-title"><div class="card-pad"><div class="heading-row"><h2 class="section-title" id="employees-title">Employees &amp; job classifications</h2>${info('employeeBasis')}</div><p>Employees are the beneficiaries. Coverage is described by state and job class, rather than a roster of individual names.</p><p class="section-copy">Risk differs by role. These California examples show how office work and warehouse work have different payroll rates.</p>${previewClasses}</div>
${disclosure('All job classifications','39 states',filter('classSearch','Find a state or job class','Try California, 8810 or warehouse')+`<p class="detail-intro">${classCount} class entries, grouped by state.</p><p class="neutral-note">Payroll is the estimated annual remuneration basis. Blank payroll values are shown as “Not stated,” not zero. Rates are per $100 of payroll.</p>`+classList,false,'classificationsList')}
</section>
<section class="card disclosure-card" aria-labelledby="policy-details-title"><div class="policy-details-header"><h2 class="section-title" id="policy-details-title">Policy details</h2></div>
${disclosure("What’s included",'2 parts',`<section class="coverage-part" aria-label="Part One — Workers Compensation">${detail('Part One — Workers Compensation (statutory)','Employees receive benefits for covered work injuries or occupational disease. These include medical payments, lost wages and disability benefits or settlements as required by the applicable state law.','statutory')}${fact('Part One limits','State-mandated limits','Ask your agent for the exact benefits and interpretation in each covered state.','statutory')}</section><section class="coverage-part" aria-label="Part Two — Employers Liability">${detail('Part Two — Employers Liability','Pays damages the employer legally owes because of covered bodily injury to employees, subject to the policy’s exclusions. Employers Liability does not provide employment practices liability insurance (EPLI).','liabilityScope')}${fact('Bodily injury by accident','$1,000,000','Each accident','states')}${fact('Bodily injury by disease','$1,000,000','Policy limit','states')}${fact('Bodily injury by disease','$1,000,000','Each employee','states')}${detail('Defense and supplementary payments','The policy includes defense for covered proceedings and specified additional costs. Defense obligations are subject to the form and applicable limits.','defense')}</section>`,true,'includedList')}
${disclosure("What’s not included",'5',
item('<strong>EPLI is separate and optional.</strong> Harassment, discrimination and other employment practices claims are excluded here; Employers Liability covers a different type of risk.','employmentPractices')+
item('<strong>North Dakota, Ohio, Washington and Wyoming</strong> are excluded from Item 3.C other-states coverage and are not listed in Item 3.A.','states')+
item('Intentionally caused or aggravated employee injuries are excluded under Employers Liability.','exclusions')+
item('Contractually assumed liability is excluded, with a workmanlike-warranty exception in the base form; state endorsements may change this.','exclusionContext')+
item('Specified federal employment-injury obligations, vessel crew injuries, and fines or penalties are excluded under the base Employers Liability form.','exclusions'))}
${disclosure('Coverage limitations','5',
item('Coverage and rating depend on the applicable states, workplaces and work classifications. Changes in roles or exposures can require amended classifications, payroll and rates.','classifications')+
item('New work in an eligible Item 3.C state may be covered if begun after the effective date and not otherwise insured or self-insured. Notify the carrier at once.','otherStatesConditions')+
item('For work already underway at the effective date in a state not listed in Item 3.A, Part Three requires notice within 30 days. Do not assume automatic coverage in an unlisted state.','notice')+
item('State laws and mandatory or state-specific endorsements can amend coverage, limits and conditions. Ask your agent which forms apply to each operation.','stateAmend')+
item('Contractor costs may enter the premium basis when they could create a workers compensation obligation, unless evidence shows their employer secured its own coverage.','classifications'))}
</section>
<section class="card" aria-labelledby="premium-title"><div class="card-pad"><h2 class="section-title" id="premium-title">Experience modification &amp; premium</h2><p class="section-copy">Experience modification compares past losses with similar businesses. Below 1.0 means better than market-average loss experience; above 1.0 signals riskier loss experience for rating purposes.</p></div>
${fact('Experience modification · most states','0.75','Estimated factor; applies to 34 state schedules.','standardRatings')}
${fact('California experience modification','0.94','California uses its own factor.','schedule27')}
<div class="card-pad">${note('Delaware, Michigan, Pennsylvania and Wisconsin show experience modification as N/A. Michigan also shows a 0% merit rating credit.','ratingExceptions')}</div>
${disclosure('Rating by state','39',groups.map(g=>field(esc(g.state),g.mod===null?'N/A'+(g.merit?' · Merit rating credit: 0%':''):g.mod.toFixed(2),'schedule'+g.page)).join(''))}
<div class="card-pad"><div class="formula"><div class="coverage-detail-head"><h3>How the base calculation works</h3>${info('calculationBasis')}</div><p>(Annual payroll ÷ 100) × rate per $100 × experience mod</p></div><p class="section-copy">California clerical example: ($17,185,000 ÷ 100) × $0.88 × 0.94 = <strong>$142,154.32</strong> before other adjustments. This is an illustration, not the final class premium.</p>${detail('Final premium can change','State rating rules, discounts, increased-limit charges, expense constants and assessments also affect the price. Scheduled experience factors are estimates and may be updated by endorsement.','ratingAdjustments')}</div>
${fact('Estimated annual premium','$33,316,855','','premium')}${fact('State assessments / fees','$876,184','','premium')}${fact('Total estimated annual cost','$34,193,039','Annual estimate for the original term; not the final earned cost after cancellation.','premium')}
${disclosure('Premium payment details','',field('Minimum premium','$27,485','premium')+field('Deposit premium','$3,419,312','premium')+note('The deposit is not an additional annual charge. The cancellation notice calls for a final audit and earned-premium bill.','depositContext'))}
</section>
<section class="card disclosure-card" aria-labelledby="watch-title"><div class="policy-details-header"><h2 class="section-title" id="watch-title">Coverage watch points</h2></div>
${disclosure('Items to review','5',
watch('Critical','Documented cancellation','The notice ends this policy on August 5, 2016. Confirm the coverage in place for the relevant injury or exposure period; later reporting alone does not establish an exclusion.','cancel')+
watch('Critical','Location or job class not declared','Compare the full schedules with actual workplaces and employee duties. Ask your agent to resolve omissions and any required amendments.','declarationCheck')+
watch('Critical','Operations in a non-covered state','Check Item 3.A and the conditions for Item 3.C before relying on this policy for an operation in another state. ND, OH, WA and WY are not included.','states')+
watch('Moderate','Annual premium audit','Payroll growth, role changes and contractor exposures can change the final premium retroactively. Keep payroll and job records current; additional premium or a refund may result.','audit')+
watch('Low','Officer inclusion / exclusion elections','Check applicable state elections for officers, members, proprietors and partners. Do not infer an individual election from an uncompleted form.','officerElections'),true)}
<div class="card-pad">${note('No numeric experience mod above 1.0 is shown in these schedules. If an updated factor exceeds 1.0, treat it as a Moderate informational watch point.','allRatings')}</div></section>
<section class="card footer-card" aria-labelledby="about-title"><div class="card-pad"><h2 class="section-title" id="about-title" tabindex="-1">About these insights</h2><p>${disclaimer}</p></div>
${disclosure('Document sources','',`<div class="detail-intro"><strong>workers-compensation__wesco__06.pdf</strong><p>Policy WWC3216474 · 346 PDF pages. References use PDF page numbers, including the exhibit cover.</p></div><ul class="source-list"><li>Welcome letter and reporting information · pages 2–6</li><li>Information Page and endorsement schedule · pages 20–23</li><li>State payroll, rates and premiums · pages 24–63</li><li>WC 00 00 00 A policy form · pages 65–70</li><li>Election notices and rating endorsements · pages 72, 76–78</li><li>State-specific forms and notices · pages 88–251</li><li>Full declared-location list · pages 252–253; repeated in later schedule attachments</li><li>Cancellation notices · pages 340–346</li></ul><a class="primary-action document-link" href="assets/policies/workers-compensation__wesco__06.pdf" target="_blank" rel="noopener">View policy document<span class="sr-only"> (opens in a new tab)</span></a>`)}
${disclosure('Not available in the pages analyzed','',`<ul class="source-list"><li>Final audited premium and earned cost after cancellation</li><li>Updated experience-rating endorsement confirming final factors</li><li>Payroll amounts for class rows left blank in the schedule</li><li>Confirmed elections for individual officers, members, proprietors or partners where forms are uncompleted</li><li>Any replacement or renewal policy after the documented cancellation</li><li>Exact state benefit amounts and individual claim determinations — consult your agent</li></ul>`)}
</section>
${ref.match(/<div class="feedback"[\s\S]*?(?=<\/main>)/)[0]}`;
let html=ref.replace('<title>Ovie: Policy insights template</title>','<title>Ovie: Commercial workers’ compensation insights</title>').replace(/<main>[\s\S]*?<\/main>/,`<main>${main}</main>`);
html=html.replace('<!-- policy-evidence -->',`<script>const EVIDENCE=${JSON.stringify(E).replaceAll('<','\\u003c')};const POLICY_URL="assets/policies/workers-compensation__wesco__06.pdf";</script><script src="assets/workers-comp-insights.js"></script>`);
html=html.replace('</style>',`
/* Workers compensation content uses the established Insights primitives. */
.sourced-field{display:flex;gap:8px;align-items:flex-start;justify-content:space-between}.sourced-field>div{min-width:0}.sourced-field .source-button{margin:-7px -8px 0 0}
.state-list{color:var(--ink);line-height:22px;margin:8px 0 0}.section-copy{color:var(--muted);margin-top:8px}.card>.section-copy{margin-top:0}.card-pad>p+p{margin-top:8px}
.neutral-note{margin:0;padding:12px;border-radius:var(--radius);background:var(--bg-subtle);color:var(--muted)}
.field+.neutral-note{margin-top:12px}
.sourced-note{display:flex;align-items:flex-start;gap:8px}.sourced-note>p{flex:1;min-width:0}.sourced-note .source-button{margin:-12px -12px -12px 0}
.state-heading h3,.formula h3{font-size:14px;line-height:20px}.coverage-detail-head h3{margin:0;flex:1;min-width:0}
.coverage-part+.coverage-part{border-top:1px solid var(--line);margin-top:12px;padding-top:12px}.policy-detail-body .coverage-row{padding-left:0;padding-right:0}.policy-detail-body .coverage-row>.source-button{margin-right:-8px}
.insight-item{color:var(--muted)}.insight-item strong{color:var(--ink)}
#searchButton,#shareButton{background:var(--bg-subtle)}
@media(hover:hover) and (pointer:fine){#searchButton:hover,#shareButton:hover{background:var(--plum-soft)}}
.source-record+.source-record{border-top:1px solid var(--line);margin-top:18px;padding-top:18px}.source-document-name,.source-schedule-entry h4{font-size:14px;line-height:20px;color:var(--ink);font-weight:600}.source-meta{margin-top:6px}.source-form{color:var(--primary);font-weight:600;margin-top:6px;overflow-wrap:anywhere}
.source-fields{margin:12px 0 16px}.source-field{padding:10px 0;border-bottom:1px solid var(--line)}.source-field:last-child{border-bottom:0}.source-field dt{color:var(--muted)}.source-field dd{margin:4px 0 0;font-weight:600;overflow-wrap:anywhere}.source-excerpt{white-space:pre-line;overflow-wrap:anywhere}.source-schedule-entry{padding-top:16px}
@media(min-width:860px){#sourceSheet{position:fixed;inset:0 0 0 auto;margin:0;width:min(480px,100vw);height:100dvh;max-height:100dvh;border-radius:12px 0 0 12px;transform:translateX(100%)}#sourceSheet[open]{transform:translateX(0)}#sourceSheet .sheet-handle{display:none}#sourceSheet .sheet-body{max-height:calc(100dvh - 59px)}@starting-style{#sourceSheet[open]{transform:translateX(100%);opacity:0}}}
.cancellation-copy{flex:1;min-width:0}.cancellation-heading{display:flex;align-items:flex-start;justify-content:space-between;gap:8px}.cancellation-note .source-button{margin:-12px -8px -12px 0;color:var(--icon-warning)}.entry-meta{font-size:12px;line-height:16px;color:var(--muted)}.coverage-detail h3{font-size:14px;line-height:20px;margin-top:4px}.coverage-detail-head{align-items:flex-start}
.class-facts{display:flex;gap:14px;margin-top:10px;flex-wrap:wrap}.class-facts>div{flex:1;min-width:115px}.class-facts strong{display:block;margin-top:3px}.location-entry .location-address{color:var(--ink)}
.schedule-filter{padding:8px 0 12px}.schedule-filter label{display:block;font-weight:600;margin-bottom:6px}.filter-status{color:var(--muted);font-size:12px;line-height:16px;margin-top:8px}.search-field{max-width:100%}
.state-heading{display:flex;gap:12px;align-items:center;justify-content:space-between;padding:14px 0;border-bottom:1px solid var(--line)}.state-heading h3{font-size:18px;line-height:24px}.state-class-group+.state-class-group{margin-top:18px}.formula{background:var(--bg-subtle);border-radius:var(--radius);padding:16px}.formula p{margin-top:8px;color:var(--ink)}
.state-heading h3,.formula h3,.class-entry h4{font-size:14px;line-height:20px}.class-entry h4{margin-top:4px}
[hidden]{display:none!important}.heading-row{flex-wrap:wrap}.source-excerpt{white-space:pre-line}.feedback-question{font-weight:400}.chevron{color:var(--icon-default)}
html.keyboard *,html.keyboard *::before,html.keyboard *::after{transition:none!important;animation:none!important}html.keyboard :active{transform:none!important}
@media(prefers-reduced-motion:reduce){.feedback-button:active{transform:none}.toast,.toast.show{transform:translateX(-50%)}}
</style>`);
fs.writeFileSync(path.join(root,'ovie_commercial_workers_compensation_insights.html'),html);
fs.writeFileSync(path.join(__dirname,'workers-comp/evidence.json'),JSON.stringify(E,null,2));
console.log(`Built workers compensation insights: ${locations.length} locations, ${classCount} class entries, ${groups.length} states, ${Object.keys(E).length} source records.`);
