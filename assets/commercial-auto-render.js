/* Auto-specific content composed with the Commercial Property Insights primitives. */
const autoEscape = value => String(value ?? '').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const autoIcon = name => {
  const shapes={info:'<circle cx="12" cy="12" r="10"/><path d="M12 16v-4m0-4h.01"/>',chevron:'<path d="m9 18 6-6-6-6"/>',down:'<path d="m6 9 6 6 6-6"/>',eye:'<path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0"/><circle cx="12" cy="12" r="3"/>',truck:'<path d="M10 17h4V5H2v12h3m10-9h4l3 4v5h-3"/><circle cx="7.5" cy="17.5" r="2.5"/><circle cx="16.5" cy="17.5" r="2.5"/>',search:'<circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>'};
  return `<svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${shapes[name]||shapes.info}</svg>`;
};
const autoInfo = id => id ? `<button class="source-button" data-source="${autoEscape(id)}" aria-label="Source: ${autoEscape(EVIDENCE[id]?.title || id)}">${autoIcon('info')}</button>` : '';
const autoField = (label,value) => `<div class="field auto-field"><div><div class="label">${autoEscape(label)}</div><div class="value">${value}</div></div></div>`;
const autoDetail = item => `<div class="coverage-detail auto-fact"><div class="auto-detail-head"><h3>${autoEscape(item.title)}</h3>${autoInfo(item.source)}</div><p>${autoEscape(item.text)}</p></div>`;
const autoDisclosure = (title,items,open=false) => `<details class="auto-disclosure" ${open?'open':''}><summary><span>${autoEscape(title)}</span>${Array.isArray(items)?`<span class="count-pill">${items.length}</span>`:''}${autoIcon('down')}</summary><div class="auto-disclosure-body">${Array.isArray(items)?items.map(autoDetail).join(''):items}</div></details>`;
const autoWatch = item => `<div class="watchpoint auto-fact"><div class="watchpoint-head"><span class="severity ${item.severity.toLowerCase()}">${autoEscape(item.severity)}</span>${autoInfo(item.source)}</div><h3>${autoEscape(item.title)}</h3><p>${autoEscape(item.text)}</p></div>`;
const autoCoverage = c => `<div class="coverage-detail auto-fact"><div class="auto-detail-head"><div class="label">${autoEscape(c.title)}</div>${autoInfo(c.source)}</div><div class="auto-limit">${autoEscape(c.limit)}</div><p>${autoEscape(c.basis)}</p>${c.description?`<p class="auto-explanation">${autoEscape(c.description)}</p>`:''}<div class="coverage-meta">${c.deductible?`<p><span>Deductible</span> ${autoEscape(c.deductible)}</p>`:''}<p><span>Premium</span> ${autoEscape(c.premium ?? 'Not stated in the policy')}</p></div></div>`;
const autoTabLabels = ["What's included","What's not included","Coverage limitations","Coverage watch points"];
let autoCurrentPolicy = AUTO_POLICY;
function autoTabs(vehicle,group) {
  const contents=[CommercialAuto.applicableCoverages(vehicle).map(autoCoverage).join(''),(vehicle.exclusions || autoCurrentPolicy.exclusions || []).map(autoDetail).join(''),(vehicle.limitations || autoCurrentPolicy.limitations || []).map(autoDetail).join(''),CommercialAuto.watchPoints({...autoCurrentPolicy,watchPoints:vehicle.watchPoints || autoCurrentPolicy.watchPoints,vehicles:[vehicle]}).map(autoWatch).join('')];
  return `<div class="auto-tabs" role="tablist" aria-label="${autoEscape(vehicle.name)} coverage details">${autoTabLabels.map((label,i)=>`<button type="button" role="tab" id="${group}-tab-${i}" aria-controls="${group}-panel-${i}" aria-selected="${i===0}" tabindex="${i===0?0:-1}" data-tab-group="${group}" data-tab-index="${i}">${autoEscape(label)}</button>`).join('')}</div>${contents.map((body,i)=>`<div role="tabpanel" class="auto-panel" id="${group}-panel-${i}" aria-labelledby="${group}-tab-${i}" data-group="${group}" data-index="${i}" tabindex="0" ${i?'hidden':''}>${body || '<p class="detail-intro">No applicable items are identified in the reviewed policy.</p>'}</div>`).join('')}`;
}
function selectAutoTab(group,index,focus=true) {
  document.querySelectorAll(`[data-tab-group="${group}"]`).forEach((t,i)=>{t.setAttribute('aria-selected',String(i===Number(index)));t.tabIndex=i===Number(index)?0:-1;if(focus&&i===Number(index))t.focus({preventScroll:true});});
  document.querySelectorAll(`[data-group="${group}"][role="tabpanel"]`).forEach((p,i)=>p.hidden=i!==Number(index));
}
window.selectAutoTab=selectAutoTab;
document.addEventListener('click',e=>{const tab=e.target.closest('[data-tab-group]');if(tab)selectAutoTab(tab.dataset.tabGroup,tab.dataset.tabIndex,false);});
document.addEventListener('keydown',e=>{
  const tab=e.target.closest('[data-tab-group]');if(!tab || !['ArrowRight','ArrowLeft','ArrowDown','ArrowUp','Home','End'].includes(e.key))return;
  e.preventDefault();const n=Number(tab.dataset.tabIndex);const i=e.key==='Home'?0:e.key==='End'?3:(n+(['ArrowLeft','ArrowUp'].includes(e.key)?3:1))%4;selectAutoTab(tab.dataset.tabGroup,i);
});
function vehicleIdentity(v,heading='h3') {
  return `<div class="auto-vehicle-head"><div class="auto-vehicle-icon">${autoIcon('truck')}</div><div><${heading}>${autoEscape(v.name)}</${heading}><p class="label">Covered auto ${autoEscape(v.number)}</p></div>${autoInfo('vehicle')}</div><dl class="auto-vehicle-facts"><div><dt>VIN</dt><dd>${autoEscape(v.vin)}</dd></div><div><dt>Principally garaged</dt><dd>${autoEscape(v.garaging || 'Not stated in the policy')}</dd></div><div><dt>Vehicle premium</dt><dd>${autoEscape(v.premium || 'Not stated in the policy')}</dd></div></dl>`;
}
function policyIncluded(policy,state,hasHnoLiability) {
  const hired = hasHnoLiability ? autoDetail({title:'Hired and non-owned liability',text:'The selected liability symbols include hired or borrowed autos and non-owned autos used for business, including employee vehicles used for business purposes. Insured-status conditions apply.',source:policy.hnoSource || 'symbols'}) : '';
  if(state.hnoOnly)return hired+CommercialAuto.applicableCoverages(policy).map(autoCoverage).join('');
  if(policy.vehicles.length>=7)return hired+'<p class="detail-intro">Limits, deductibles and premiums vary by covered auto. Open a vehicle in Covered autos to review its coverage details.</p><button class="secondary-action" id="chooseCoverageAuto">Choose a covered auto</button>';
  return hired+policy.vehicles.map(v=>`<section class="auto-coverage-group"><h3 class="auto-subtitle">${autoEscape(v.name)}</h3>${CommercialAuto.applicableCoverages(v).map(autoCoverage).join('')}</section>`).join('');
}
function policyDetailItems(policy,key) {
  const specific=policy.vehicles.filter(v=>Array.isArray(v[key]));
  return (policy[key] || []).map(autoDetail).join('')+specific.map(v=>`<section class="auto-coverage-group"><h3 class="auto-subtitle">${autoEscape(v.name)}</h3>${v[key].map(autoDetail).join('')}</section>`).join('');
}
function renderAuto(policy) {
  autoCurrentPolicy=policy;
  const main=document.getElementById('autoMain');const state=CommercialAuto.gate(policy);
  if(!state.complete){
    document.querySelectorAll('dialog[open]').forEach(d=>d.close());
    document.querySelector('.auto-vehicle-body')?.replaceChildren();
    document.getElementById('sourceBody').replaceChildren();document.getElementById('utilityBody').replaceChildren();
    document.getElementById('askOvieQuestion').textContent='';document.getElementById('askOvieAnswer').textContent='';document.getElementById('askSourceActions').replaceChildren();
    main.innerHTML=`<section class="card card-pad"><h2 class="section-title">Commercial Auto documents</h2><p>${autoEscape(policy.name)}</p><div class="auto-incomplete" role="status"><strong>Incomplete · Insights unavailable</strong><p>The policy documents are retained. Re-upload a complete policy package to generate insights.</p></div><h3 class="auto-subtitle">Documents needed</h3><ul class="source-list">${state.missing.map(m=>`<li>${autoEscape(m)}</li>`).join('')}</ul><a class="primary-action document-link" href="ovie_upload.html">Re-upload documents</a></section>`;
    document.getElementById('chatForm').hidden=true;document.getElementById('searchButton').hidden=true;document.getElementById('shareButton').hidden=true;
    return state;
  }
  document.getElementById('chatForm').hidden=false;document.getElementById('searchButton').hidden=false;document.getElementById('shareButton').hidden=false;
  const status = policy.end < new Date().toISOString().slice(0,10) ? 'Expired' : 'Within term';
  const liabilitySymbols=(policy.coverages.find(c=>c.selected && c.kind==='liability')?.symbols || []).map(Number);
  const hasHnoLiability=liabilitySymbols.includes(1) || [8,9].every(s=>liabilitySymbols.includes(s));
  const symbolText=liabilitySymbols.map(s=>`${CommercialAuto.symbolDescriptions[s]} (symbol ${s})`).join(' · ');
  const hnoIntro = state.hnoOnly ? 'Hired and non-owned autos used for business. No owned-auto schedule is required for the selected symbols 8 and 9.' : `${symbolText}. Coverage applies to the autos designated for each coverage in the declarations.`;
  const named=policy.namedInsureds || [policy.name];
  const people = `${policy.commonlyOwned===true?'<p class="detail-intro">This policy covers multiple commonly owned businesses. Insured entities and individual drivers are listed separately.</p>':''}${autoDetail({title:'Named Insured',text:named.join(' · '),source:'identity'})}${autoDetail({title:'Additional Named Insureds',text:policy.additionalNamedInsureds?.length?policy.additionalNamedInsureds.join(' · '):'None listed in the supplied policy.',source:'drivers'})}${autoDetail({title:'Drivers',text:state.hnoOnly?'No individual driver schedule is required for this hired and non-owned-only policy.':policy.drivers.map(d=>d.name).join(' · '),source:state.hnoOnly?policy.hnoSource:'drivers'})}${autoDetail({title:'Other people and organizations',text:policy.insuredDescription || 'Insured status depends on the applicable coverage. Permissive users have coverage subject to the form’s exceptions; contractual additional insured status requires the specified prior written agreement.',source:'insured'})}`;
  const disclaimer='Insights are based on the documents provided; incomplete or missing documents may result in incomplete or inaccurate insights. OVIE is not intended to serve as evidence of insurance for third parties, nor does OVIE provide advice or guidance on the adequacy of coverage. Users should consult their agent or insurance carrier for coverage-related questions or determinations.';
  main.innerHTML=`
  <section class="card card-pad" aria-labelledby="autoSimplified"><div class="heading-row"><h2 class="section-title" id="autoSimplified">Your policy simplified</h2><span class="status-pill">${status}</span></div>
    ${autoField('Policyholder',autoEscape(policy.name))}
    ${autoField('Policy type','Commercial Auto')}
    ${autoField('Policy number',`<span id="autoPolicyNumber">${autoEscape(policy.id)}</span>`)}
    ${autoField('Carrier',autoEscape(policy.carrier))}
    ${autoField('Business classification',autoEscape(policy.classification || 'Not stated in the policy'))}
    ${autoField('Policy term',autoEscape(policy.term))}
    ${autoField('Policy premium',autoEscape(policy.premium))}
  </section>
  <section class="card card-pad" aria-labelledby="autoWho"><h2 class="section-title" id="autoWho">Who's covered</h2>${people}</section>
  <section class="card card-pad" aria-labelledby="coveredAutos"><div class="heading-row"><h2 class="section-title" id="coveredAutos">Covered autos</h2><span class="count-pill">${state.hnoOnly?'8 & 9':policy.vehicles.length}</span></div>
    ${autoDetail({title:state.hnoOnly?'Hired and non-owned autos':liabilitySymbols.length===1 && liabilitySymbols[0]===7?'Scheduled autos only':'Covered-auto designations',text:hnoIntro,source:state.hnoOnly?policy.hnoSource:'symbols'})}
    ${state.hnoOnly?'':policy.vehicles.length<7?policy.vehicles.map(v=>`<article class="auto-vehicle">${vehicleIdentity(v)}</article>`).join(''):`<label class="sr-only" for="fleetSearch">Search covered autos by vehicle or VIN</label><div class="auto-fleet-search">${autoIcon('search')}<input id="fleetSearch" type="search" placeholder="Search vehicle or VIN"><button class="source-button" id="clearFleet" aria-label="Clear vehicle search" hidden>×</button></div><p id="fleetStatus" role="status" class="label"></p><div id="fleetRows"></div><button class="secondary-action" id="fleetMore">See more</button>`}
    <p class="auto-agent-note">For changes in business use, ownership or fleet size, review the policy with your agent.</p>
  </section>
  <section class="card auto-policy-details" aria-labelledby="autoPolicyDetails"><div class="card-pad"><h2 class="section-title" id="autoPolicyDetails">Policy details</h2></div>
    ${autoDisclosure("What's included",policyIncluded(policy,state,hasHnoLiability),true)}
    ${autoDisclosure('Policy specifications',policy.endorsements.filter(e=>!['state-amendment','legal-notice'].includes(e.kind)),true)}
    ${autoDisclosure('Endorsement summary',`<p class="detail-intro">Practical effects are highlighted above. State amendments and legal notices are retained in Document sources.</p>${autoDetail({title:'Summary uses the revised schedule',text:'The later package lists the 2017 International 4000 and no loan/lease gap coverage. Earlier vehicle and premium details are kept separate.',source:'update'})}${autoDetail({title:'Forms and endorsements',text:'Read the complete inventory and applicable forms in the supplied policy.',source:'forms'})}`)}
    ${autoDisclosure("What's not included",policyDetailItems(policy,'exclusions'))}
    ${autoDisclosure('Coverage limitations',policyDetailItems(policy,'limitations'))}
    ${autoDisclosure('Coverage watch points',CommercialAuto.watchPoints(policy).map(autoWatch).join(''),true)}
  </section>
  <section class="card footer-card" aria-labelledby="autoAbout"><div class="card-pad"><h2 class="section-title" id="autoAbout">About these insights</h2><p>${disclaimer}</p></div>
    ${autoDisclosure('Document sources',`${autoDetail({title:'ATH Wonder Consulting LLC · Business Auto policy',text:'98-page supplied PDF. Summary uses the revised package on pages 51–98. Earlier policy documents on pages 3–50 are retained as history.',source:'update'})}${autoDetail({title:'Declarations, driver and vehicle schedules',text:'PDF pages 52–56 and 92.',source:'vehicle'})}${autoDetail({title:'Business auto form and endorsements',text:'PDF pages 57–75 and 82–98. Administrative notices are on pages 51 and 76–81.',source:'forms'})}<a class="secondary-action document-link" href="${POLICY_URL}#page=52" target="_blank" rel="noopener">Open policy document</a>`)}
    ${autoDisclosure('Not available in the pages analyzed',`<ul class="source-list"><li>Business classification: the business-description field is blank.</li><li>Financing status and the named lessor or loss payee.</li><li>Business-use details and whether operations have changed.</li><li>Resolution of the medical-payments limit-basis difference.</li><li>Reconciliation of the UM property-damage value with the unchecked vehicle-schedule box.</li></ul><p class="detail-intro">The expired badge describes this uploaded term. It does not establish whether a renewal exists.</p>`)}
  </section>`;
  main.append(document.getElementById('autoFeedback').content.cloneNode(true));
  if(policy.vehicles.length>=7 && !state.hnoOnly) setupFleet(policy.vehicles);
  document.getElementById('chooseCoverageAuto')?.addEventListener('click',()=>document.getElementById('fleetSearch').focus());
  return state;
}
function setupFleet(vehicles) {
  let count=6;const input=document.getElementById('fleetSearch'),more=document.getElementById('fleetMore'),clear=document.getElementById('clearFleet');
  function draw(){const result=CommercialAuto.fleetPage(vehicles,input.value,count);document.getElementById('fleetStatus').textContent=`${result.total} covered autos${result.total?` · Showing ${result.rows.length}`:''}`;document.getElementById('fleetRows').innerHTML=result.rows.map(v=>`<button class="auto-fleet-row" data-vehicle="${autoEscape(v.id)}"><span><strong>${autoEscape(v.name)}</strong><span class="label">VIN ${autoEscape(v.vin)}</span></span>${autoIcon('chevron')}</button>`).join('')||'<p class="detail-intro">No matching covered autos. Try a vehicle name or clear the search.</p>';more.hidden=!result.more;clear.hidden=!input.value;}
  input.oninput=()=>{count=6;draw();};clear.onclick=()=>{input.value='';count=6;draw();input.focus();};more.onclick=()=>{count+=20;draw();if(more.hidden)document.querySelector('#fleetRows button:last-child')?.focus({preventScroll:true});};
  document.getElementById('fleetRows').onclick=e=>{const row=e.target.closest('[data-vehicle]');if(!row)return;const v=vehicles.find(v=>v.id===row.dataset.vehicle);const dialog=document.getElementById('autoVehicleSheet');dialog.querySelector('.auto-vehicle-body').innerHTML=vehicleIdentity(v)+autoTabs(v,'fleetAsset');dialog.showModal();dialog.querySelector('button').focus();dialog.onclose=()=>row.focus({preventScroll:true});};draw();
}
renderAuto(AUTO_POLICY);
