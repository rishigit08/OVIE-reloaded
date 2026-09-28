
/* Standalone, document-grounded design prototype. No remote submission or carrier connection. */
const $ = id => document.getElementById(id);
const phone = $('phone');
const sourceSheet = $('sourceSheet');
const utilitySheet = $('utilitySheet');
const feedbackSheet = $('feedbackSheet');
const triggers = new WeakMap();
let toastTimer;
document.addEventListener('keydown', () => document.documentElement.classList.add('keyboard'), true);
document.addEventListener('pointerdown', () => document.documentElement.classList.remove('keyboard'), true);

function node(tag, className, text) {
  const element = document.createElement(tag);
  if (className) element.className = className;
  if (text) element.textContent = text;
  return element;
}
function action(text, onClick, secondary = false) {
  const button = node('button', secondary ? 'secondary-action' : 'primary-action', text);
  button.type = 'button';
  button.addEventListener('click', onClick);
  return button;
}
function showToast(message) {
  $('toast').textContent = message;
  $('toast').classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => $('toast').classList.remove('show'), 2600);
}
function openDialog(dialog, trigger) {
  triggers.set(dialog, trigger || document.activeElement);
  phone.style.overflow = 'hidden';
  dialog.showModal();
  dialog.querySelector('button').focus({preventScroll: true});
}
for (const dialog of document.querySelectorAll('dialog')) {
  dialog.addEventListener('click', event => {
    const b = dialog.getBoundingClientRect();
    if (event.target === dialog && (event.clientX < b.left || event.clientX > b.right || event.clientY < b.top || event.clientY > b.bottom)) dialog.close();
  });
  dialog.addEventListener('close', () => {
    if (!document.querySelector('dialog[open]')) phone.style.overflow = '';
    const trigger = triggers.get(dialog);
    if (trigger?.isConnected) trigger.focus({preventScroll:true});
  });
}
$('closeSource').onclick = () => sourceSheet.close();
$('closeUtility').onclick = () => utilitySheet.close();
function showSource(id, trigger) {
  const source=EVIDENCE[id]; if(!source)return;
  $('sourceTitle').textContent=source.title;
  const parts=[];
  const explain=trigger?.dataset?.explain;
  if(explain)parts.push(node('p','evidence-note pa-source-explain',explain));
  parts.push(node('p','source-meta',source.ref),node('p','source-context','Form reference: '+source.form));
  if(source.entries && source.entries.length){ const list=node('dl','source-entries'); for(const [label,value] of source.entries) {const row=node('div','source-entry');row.append(node('dt','',label),node('dd','',value));list.append(row);}parts.push(list); }
  if(source.excerpt)parts.push(node('blockquote','source-excerpt',source.excerpt));
  if(source.page){const link=node('a','primary-action document-link','View in document');link.href=POLICY_URL+'#page='+source.page;link.target='_blank';link.rel='noopener';parts.push(link);}
  $('sourceBody').replaceChildren(...parts);openDialog(sourceSheet,trigger);
}
document.addEventListener('click', event => { const button=event.target.closest('[data-source]'); if(button) showSource(button.dataset.source,button); });
$('backButton').onclick = () => { window.location.href = 'Insights.html'; };
$('shareButton').onclick = event => window.personalShare(event.currentTarget);

// Search navigates to actual visible prototype content, opening containing disclosures.

$('searchButton').onclick = event => {
  $('utilityTitle').textContent = 'Search these insights';
  const label = node('label', '', 'Find a coverage, limit or policy detail');
  label.htmlFor = 'insightsSearch';
  const input = node('input', 'search-field');
  input.id = 'insightsSearch'; input.type = 'search'; input.placeholder = 'Try PIP, GAP or roadside';
  const status = node('p', 'source-context', 'Search within these policy insights.');
  status.setAttribute('role', 'status');
  const results = node('div', 'search-results');
  input.addEventListener('input', () => {
    const query = input.value.trim().toLowerCase();
    results.replaceChildren();
    if (!query) { status.textContent = 'Search within these policy insights.'; return; }
    const searchIndex = [...document.querySelectorAll('main .pa-searchable, main .auto-fleet-row')];
    const matches = searchIndex.filter(element => element.textContent.toLowerCase().includes(query));
    status.textContent = matches.length ? `${matches.length} results` : 'No matching details. Try a coverage name such as PIP.';
    matches.forEach(element => {
      const result = node('button', 'search-result', element.textContent.trim());
      result.type = 'button';
      result.onclick = () => {
        for(let parent=element.parentElement;parent;parent=parent.parentElement)if(parent.tagName==='DETAILS')parent.open=true;
        const panel=element.closest('[role="tabpanel"]');if(panel)window.selectAutoTab(panel.dataset.group,panel.dataset.index,false);
        element.tabIndex = -1;
        triggers.set(utilitySheet, element);
        utilitySheet.close();
        element.focus({preventScroll:true});
        element.scrollIntoView({block:'center', behavior:'instant'}); if(element.matches('.auto-fleet-row'))element.click();
      };
      results.append(result);
    });
  });
  $('utilityBody').replaceChildren(label,input,status,results);
  openDialog(utilitySheet, event.currentTarget);
  input.focus({preventScroll:true});
};

// Sample answers are limited to the uploaded policy; unsupported questions stay unresolved.
function answerForPolicy(question) {
 const q=question.toLowerCase();
 if(/transport|rental|rent a car/.test(q))return {answer:'Every vehicle on this policy carries Transportation Expense, Included, up to $50 per day and a $1,500 maximum while that vehicle is being repaired after a covered loss. Roadside Assistance is a separate benefit — up to 50 miles or $250 per disablement in-network — for a breakdown rather than a covered loss.',source:'additionalCov'};
 if(/glass|windshield/.test(q))return {answer:'This policy carries Full Safety Glass Coverage (CPA1588QMI) as Included on every vehicle, which waives the deductible for a covered glass-only claim — you would not pay the standard $1,000 comprehensive deductible for a windshield-only claim.',source:'additionalCov'};
 if(/deduct|collision|comprehensive/.test(q))return {answer:'Comprehensive (Other Than Collision) and Collision (Broadened) each carry a $1,000 deductible on every vehicle. PIP medical has its own $300 deductible. Liability, UM/UIM, Property Protection Insurance and PIP work loss have no deductible.',source:'coreVehicleTable'};
 if(/driver|insured|permissive|family member|carly/.test(q))return {answer:'Samir Pimputkar and Avani Pimputkar are the named insureds; Carly Braun is listed as a third covered driver. Dates of birth are masked as XX/XX/XXXX for all three in the reviewed pages, and no named-driver exclusion is listed on the endorsement schedule.',source:'drivers'};
 if(/premium|cost|total|prior term|renewal/.test(q))return {answer:'The Total Policy Premium is $9,068.00 for this 12-month renewal term (Mar 11, 2024 to Mar 11, 2025), covering all five vehicles plus the $313 Personal Auto Plus Coverage billed once for the whole policy. A prior-term premium for a like-for-like comparison is not in the reviewed pages.',source:'premiumTotals'};
 if(/rideshare|uber|lyft|tnc|delivery/.test(q))return {answer:'Rideshare or delivery use is not asserted anywhere in the reviewed pages for any of the five vehicles, and no rideshare/TNC endorsement is listed on the schedule. Whether the base FA4000TQ contract excludes that use by default is not established here, since its full text is not among the reviewed pages.'};
 if(/pip|med ?pay|medical|injury|work loss/.test(q))return {answer:'PIP medical is carried at Option 1: Unlimited, with a $300 deductible and a 10% premium reduction — no dollar cap on allowable medical expenses. PIP work loss is carried at the Full option (Class I). Property Protection Insurance adds $1,000,000 for damage this vehicle causes to someone else’s parked vehicle or property.',source:'pipMedicalForm'};
 if(/right|entitle|clue|fcra/.test(q))return {answer:'Several statutory rights — like produce-the-policy requests and free CLUE reports — exist independently of what this policy purchased. Whether Michigan’s specific versions of these apply is not established in the reviewed pages; see Your rights on this policy.'};
 if(/lien|lease|gap|loan/.test(q))return {answer:'Four of the five vehicles carry both a loss payee and GAP coverage: BMW X5 (BMW Financial Services, $28 GAP), Ford Bronco (DFCU Credit Union, $21), Ford Explorer (Ford Motor Credit, $18) and BMW i7 (Financial Services Vehicle Trust, $60). The Jeep Wrangler has neither a listed loss payee nor GAP coverage.',source:'lossPayees'};
 if(/wrangler|jeep/.test(q))return {answer:'The 2020 Jeep Wrangler JL Unlimited is the one vehicle on this policy with no listed loss payee and no GAP premium — otherwise it carries the same coverage structure as the other four vehicles, including PIP Unlimited and $1,000 comprehensive/collision deductibles.',source:'lossPayees'};
 if(/mcca/.test(q))return {answer:'The $122 MCCA fee on each vehicle is a statutory Michigan Catastrophic Claims Association assessment that funds reinsurance for PIP claims above a set threshold. It is required, not a coverage you can decline or shop away.',source:'additionalCov'};
 return {answer:'This preview has no verified answer for that question. Review the document sources or ask your insurance professional.'};
}

const askSheet = $('askOvieSheet');
const askInput = $('askOvieInput');
const askAction = $('askComposerAction');
let askViewportHeight = window.innerHeight;
function syncAskViewport() {
  const viewport = window.visualViewport;
  if (!askSheet.open || !viewport) return;
  const inset = Math.max(0, window.innerHeight - viewport.height - viewport.offsetTop);
  askSheet.style.setProperty('--keyboard-inset', `${inset}px`);
  askSheet.style.setProperty('--visual-viewport-height', `${viewport.height}px`);
  askSheet.classList.toggle('keyboard-visible', inset > 80 || viewport.height < askViewportHeight - 80);
}
function syncAskAction() {
  const hasQuestion = Boolean(askInput.value.trim());
  askAction.classList.toggle('is-send', hasQuestion);
  askAction.setAttribute('aria-label', hasQuestion ? 'Send question' : 'Use voice input');
  askAction.title = hasQuestion ? 'Send question' : 'Use voice input';
}
function openAsk(trigger) {
  askViewportHeight = window.innerHeight;
  askSheet.classList.add('is-visible');
  askSheet.classList.toggle('show-android-keyboard-preview', !matchMedia('(pointer: coarse)').matches);
  syncAskAction();
  openDialog(askSheet, trigger);
  askInput.focus({preventScroll:true});
  syncAskViewport();
}
$('chatInput').onclick = () => openAsk($('chatInput'));
$('chatInput').onkeydown = event => {
  if (event.key === 'Enter' || event.key === ' ') {
    event.preventDefault();
    openAsk($('chatInput'));
  }
};
$('chatForm').onsubmit = event => {
  event.preventDefault();
  openAsk($('chatAskButton'));
};
$('closeAskOvie').onclick = () => askSheet.close();
askSheet.addEventListener('close', () => {
  askSheet.classList.remove('is-visible','keyboard-visible','show-android-keyboard-preview');
  askSheet.style.removeProperty('--keyboard-inset');
  askSheet.style.removeProperty('--visual-viewport-height');
});
askInput.oninput = syncAskAction;
askInput.onfocus = () => {
  askSheet.classList.toggle('show-android-keyboard-preview', !matchMedia('(pointer: coarse)').matches);
  syncAskViewport();
};
$('hidePreviewKeyboard').onclick = () => {
  askInput.blur();
  askSheet.classList.remove('show-android-keyboard-preview');
};
window.visualViewport?.addEventListener('resize', syncAskViewport);
window.visualViewport?.addEventListener('scroll', syncAskViewport);
askAction.onclick = () => {
  if (askInput.value.trim()) $('askOvieForm').requestSubmit();
  else {
    showToast('Voice input is not available in this prototype.');
    askInput.focus({preventScroll:true});
  }
};
$('askOvieForm').onsubmit = event => {
  event.preventDefault();
  const question=askInput.value.trim();
  if(!question)return;
  const {answer,source}=answerForPolicy(question);
  $('askOvieQuestion').textContent=question;
  $('askOvieAnswer').textContent=`Sample answer based on your policy.\n\n${answer}`;
  $('askOvieConversation').hidden=false;
  askSheet.classList.add('chat-view');
  $('askSourceActions').replaceChildren();
  if(source){
    const sourceAction=action('Read supporting excerpt',()=>showSource(source,sourceAction),true);
    $('askSourceActions').append(sourceAction);
  }
  askInput.value='';
  syncAskAction();
  syncAskViewport();
};

const feedbackForm = $('feedbackForm');
let selectedFeedback = null;
function setFeedback(value) {
  selectedFeedback = value;
  document.querySelectorAll('[data-feedback]').forEach(button => button.setAttribute('aria-pressed',String(button.dataset.feedback === value)));
}
document.querySelectorAll('[data-feedback]').forEach(button => button.onclick = () => {
  if (button.dataset.feedback === 'up') {setFeedback('up');showToast('Thanks for your feedback.');return;}
  $('feedbackError').textContent='';
  openDialog(feedbackSheet,button);
});
feedbackForm.onchange = event => {
  if(event.target.name === 'reason') {
    $('feedbackFollowup').hidden = event.target.value !== 'other';
    $('feedbackError').textContent='';
  }
};
feedbackForm.onsubmit = event => {
  event.preventDefault();
  const reason = new FormData(feedbackForm).get('reason');
  if (!reason) {$('feedbackError').textContent='Select one reason to continue.';feedbackForm.querySelector('input').focus();return;}
  if (reason === 'other' && !$('feedbackConcern').value.trim()) {$('feedbackError').textContent='Enter your concern to continue.';$('feedbackConcern').focus();return;}
  setFeedback('down'); feedbackSheet.close(); showToast('Thanks for helping us improve these insights.');
};
$('closeFeedback').onclick = $('cancelFeedback').onclick = () => feedbackSheet.close();

// Deliberate downward scroll hides the header. Upward scroll and keyboard focus restore it.
let lastScroll = 0, downward = 0;
phone.addEventListener('scroll', () => {
  const next = phone.scrollTop;
  const delta = next-lastScroll;
  const header = document.querySelector('.topbar');
  if (next < 80 || delta < 0 || header.contains(document.activeElement)) {header.classList.remove('hidden-header');downward=0;}
  else if (delta > 0) {downward+=delta;if(downward>36)header.classList.add('hidden-header');}
  lastScroll=next;
},{passive:true});

window.openAutoModal=openDialog;

window.paUI={node,action,openDialog,showToast,phone,utilitySheet,triggers};
document.addEventListener('click',event=>{
 if(event.target.closest('[data-professional]')){
  $('utilityTitle').textContent='Review with your insurance professional';
  $('utilityBody').replaceChildren(node('p','source-context','Contact your agent or the insurer listed in the documents before making coverage or claim decisions.'),node('p','value','Insurance Advisors (agent) · 248-363-5746'),node('p','value','The Cincinnati Casualty Company (claims) · 877-242-2544'),node('p','source-context','Contact shown in this historical document. Have policy A01 1121043 available.'));
  openDialog(utilitySheet,event.target.closest('[data-professional]'));
 }
});
