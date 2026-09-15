
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
  const parts=[node('p','source-meta',source.ref),node('p','source-context','Form reference: '+source.form)];
  if(source.entries){ const list=node('dl','source-entries'); for(const [label,value] of source.entries) {const row=node('div','source-entry');row.append(node('dt','',label),node('dd','',value));list.append(row);}parts.push(list); }
  if(source.excerpt)parts.push(node('blockquote','source-excerpt',source.excerpt));
  const link=node('a','primary-action document-link','View in document');link.href=POLICY_URL+'#page='+source.page;link.target='_blank';link.rel='noopener';parts.push(link);
  $('sourceBody').replaceChildren(...parts);openDialog(sourceSheet,trigger);
}
document.addEventListener('click', event => { const button=event.target.closest('[data-source]'); if(button) showSource(button.dataset.source,button); });
$('backButton').onclick = () => { window.location.href = '../Insights.html'; };
$('shareButton').onclick = event => window.personalShare(event.currentTarget);

// Search navigates to actual visible prototype content, opening containing disclosures.

$('searchButton').onclick = event => {
  $('utilityTitle').textContent = 'Search these insights';
  const label = node('label', '', 'Find a coverage, limit or policy detail');
  label.htmlFor = 'insightsSearch';
  const input = node('input', 'search-field');
  input.id = 'insightsSearch'; input.type = 'search'; input.placeholder = 'Try collision or rental';
  const status = node('p', 'source-context', 'Search within these policy insights.');
  status.setAttribute('role', 'status');
  const results = node('div', 'search-results');
  input.addEventListener('input', () => {
    const query = input.value.trim().toLowerCase();
    results.replaceChildren();
    if (!query) { status.textContent = 'Search within these policy insights.'; return; }
    const searchIndex = [...document.querySelectorAll('main .pa-searchable, main .auto-fleet-row')];
    const matches = searchIndex.filter(element => element.textContent.toLowerCase().includes(query));
    status.textContent = matches.length ? `${matches.length} results` : 'No matching details. Try a coverage name such as collision.';
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
 if(/rent|transport/.test(q))return {answer:'The 2018 Hyundai Elantra has Option 1 transportation expenses up to $900 per accident. A 48-hour total-theft or more-than-24-hour other-loss waiting period applies. No daily dollar rate is stated in the selected endorsement.',source:'rental'};
 if(/deduct|collision|comprehensive|glass/.test(q))return {answer:'The Hyundai has $500 comprehensive and collision deductibles. No glass repair waiver is established. UM property damage shows $200 in the declarations, while the endorsement qualifies that amount for unknown/hit-and-run vehicles. Review both with your insurance professional.',source:'physical'};
 if(/driver|insured/.test(q))return {answer:'Tremayne Hedgepeth is the named insured and the application lists him as the Hyundai’s primary driver. Other driver-rating statuses are not stated.',source:'driver'};
 if(/premium|cost/.test(q))return {answer:'Listed coverage premiums total $2,098 for the six-month term. This is a calculated sum; installment fees are separate and the payment frequency is not stated.',source:'premium'};
 if(/rideshare|uber|lyft/.test(q))return {answer:'The policy excludes the specified liability and physical-damage losses during public/livery use, including time logged into a rideshare platform as a driver. No adding rideshare endorsement is listed. The documents do not establish active rideshare use.',source:'exclusions'};
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
  $('utilityBody').replaceChildren(node('p','source-context','Contact your agent or the insurer listed in the documents before making coverage or claim decisions.'),node('p','value','Root Insurance Co. · (866) 980-9431'),node('p','source-context','Contact shown in this historical document. Have policy 2J2XN6 available.'));
  openDialog(utilitySheet,event.target.closest('[data-professional]'));
 }
 const tip=event.target.closest('[data-tooltip]');if(tip){
  const existing=tip.nextElementSibling;if(existing?.classList.contains('pa-tooltip')){existing.remove();tip.setAttribute('aria-expanded','false');return;}
  const text=node('p','pa-tooltip evidence-note',tip.dataset.tooltip);text.id='coverage-tip-'+Date.now();text.setAttribute('role','note');tip.setAttribute('aria-expanded','true');tip.setAttribute('aria-controls',text.id);tip.after(text);
 }
});
document.addEventListener('keydown',event=>{if(event.key==='Escape'){document.querySelectorAll('.pa-tooltip').forEach(t=>{t.previousElementSibling.setAttribute('aria-expanded','false');t.remove();});}});
