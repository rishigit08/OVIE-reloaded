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
  const source = EVIDENCE[id];
  const pageNumbers = source.ref.match(/PDF (?:page |pp\. )([\d,\s–-]+)/)?.[1].trim() || String(source.page);
  const pageLabel = `PDF ${/[–,\-]/.test(pageNumbers) ? 'pages' : 'page'} ${pageNumbers} of 101`;
  const reference = source.ref.replace(/ · PDF (?:page |pp\. )[\d,\s–-]+/g, '')
    .replace(/\bpp\. /g, 'form pages ').replace(/\bp\. /g, 'form page ').replace(/; /g, ';\n');
  let excerpt = node('blockquote', 'source-excerpt', source.excerpt);
  if (source.limitGroups) {
    excerpt = node('div', 'source-schedule');
    excerpt.append(node('p', 'source-schedule-note', source.scheduleNote));
    for (const group of source.limitGroups) {
      excerpt.append(node('h3', '', group.title));
      for (const [coverage, original, revised] of group.rows) {
        const row = node('section', 'source-limit');
        const values = node('dl');
        values.append(node('dt', '', 'Base policy limit (BP 00 03)'), node('dd', '', original),
          node('dt', '', 'Revised limit'), node('dd', '', revised));
        row.append(node('h4', '', coverage), values);
        excerpt.append(row);
      }
    }
  }
  const documentLink = POLICY_URL
    ? node('a', 'primary-action document-link', 'View in document')
    : node('p', 'source-context', 'The original policy document is not included in this shared preview.');
  if (POLICY_URL) {
    documentLink.href = `${POLICY_URL}#page=${source.page}`;
    documentLink.target = '_blank';
    documentLink.rel = 'noopener';
    documentLink.setAttribute('aria-label', `View in document, PDF page ${source.page} (opens in a new tab)`);
  }
  $('sourceTitle').textContent = source.title;
  $('sourceBody').replaceChildren(
    node('p', 'source-meta', source.documentTitle ? `${source.documentTitle} · ${pageLabel}` : pageLabel),
    node('p', 'source-reference', `Form reference: ${reference}`),
    excerpt,
    documentLink
  );
  openDialog(sourceSheet, trigger);
}
document.querySelectorAll('[data-source]').forEach(button => button.addEventListener('click', () => showSource(button.dataset.source, button)));
$('backButton').onclick = () => { window.location.href = 'Insights.html'; };
$('shareButton').onclick = event => {
  $('utilityTitle').textContent = 'Share';
  $('utilityBody').replaceChildren(
    node('p', 'source-context', 'This insight contains sensitive personal information protected under privacy laws. If you share it with individuals or organizations that are not legally bound by those laws, the information may be further disclosed and may no longer remain protected. OVIE is not responsible for consequences arising from your decision to share this information.'),
    node('p', 'source-context', 'By selecting “Confirm Sharing,” you acknowledge and accept these terms.'),
    action('Confirm Sharing', () => {
      utilitySheet.close();
      showToast('Sharing is not connected in this prototype.');
    })
  );
  openDialog(utilitySheet, event.currentTarget);
};

// Search navigates to actual visible prototype content, opening containing disclosures.
const searchIndex = [...document.querySelectorAll('main .field,main .coverage-row,main .coverage-detail,main .insight-item,main .watchpoint,main .sublimit-row,main .building-row')]
  .filter(element => !element.querySelector('.insight-item'));
$('searchButton').onclick = event => {
  $('utilityTitle').textContent = 'Search these insights';
  const label = node('label', '', 'Find a coverage, limit or policy detail');
  label.htmlFor = 'insightsSearch';
  const input = node('input', 'search-field');
  input.id = 'insightsSearch'; input.type = 'search'; input.placeholder = 'Try flood or business income';
  const status = node('p', 'source-context', 'Search within these policy insights.');
  status.setAttribute('role', 'status');
  const results = node('div', 'search-results');
  input.addEventListener('input', () => {
    const query = input.value.trim().toLowerCase();
    results.replaceChildren();
    if (!query) { status.textContent = 'Search within these policy insights.'; return; }
    const matches = searchIndex.filter(element => element.textContent.toLowerCase().includes(query));
    status.textContent = matches.length ? `${matches.length} results` : 'No matching details. Try a coverage name such as flood.';
    matches.forEach(element => {
      const result = node('button', 'search-result', element.textContent.trim());
      result.type = 'button';
      result.onclick = () => {
        let parent = element.parentElement;
        while(parent) { if(parent.tagName === 'DETAILS') parent.open = true; parent = parent.parentElement; }
        element.tabIndex = -1;
        triggers.set(utilitySheet, element);
        utilitySheet.close();
        element.focus({preventScroll:true});
        element.scrollIntoView({block:'center', behavior:'instant'});
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
  if (/eligib|growth|agent/.test(q)) return {answer:'A question you can share with your agent: “Our business size or operations may have changed since this policy was issued. Does our current business still qualify for a BOP at renewal, and should our classification or schedules be updated?” These policy documents do not establish current renewal eligibility.'};
  if (/endorsement/.test(q)) return {answer:'The page highlights nine practical changes, including hired/non-owned auto liability, hotel extensions, water backup, sprinkler requirements and restrictions on liability. The schedule contains 23 forms and notices, including 15 coverage, premium and state endorsements.',source:'schedule'};
  if (/auto|vehicle|hired/.test(q)) return {answer:'Hired and non-owned auto liability are included by BP 06 86 05 17, with premiums of $58 and $102 respectively. Coverage is subject to its business-use conditions and is excess over primary insurance covering the vehicle. Owned-auto liability remains excluded under the base form.',source:'hnoa'};
  if (/water|backup|flood/.test(q)) return {answer:'Water backup has separate annual aggregates of $5,000 for property and $5,000 for business income/extra expense at each of buildings 001–004. The endorsement is not flood insurance and has maintenance requirements.',source:'water'};
  if (/income|waiting|expense/.test(q)) return {answer:'Business income and extra expense are actual loss sustained up to 12 months, subject to a covered physical loss and the restoration terms. Business income begins after 72 hours; extra expense begins immediately.',source:'waiting'};
  if (/deduct/.test(q)) return {answer:'Property: $10,000 per occurrence. The same-location, multi-building endorsement applies the single largest deductible, with earthquake/wind/hail exceptions. Optional coverages/glass: $500 as scheduled. No bodily-injury or property-damage liability deductibles are shown.',source:'deductible'};
  if (/guest/.test(q)) return {answer:'Guest-property liability is limited to $1,000 per guest and $25,000 per occurrence, regardless of the number of guests. Safe deposit box property and other specified property are excluded.',source:'guest'};
  if (/sprinkler|safeguard/.test(q)) return {answer:'All four buildings require P-1 automatic sprinklers. The endorsement requires maintenance, activation and notice of known impairment, subject to its temporary-shutdown exception. Noncompliance can exclude fire loss.',source:'safeguards'};
  if (/building|location|address/.test(q)) return {answer:'The declarations schedule location 001 at 4961 N Cedar Ave, Fresno, California, with buildings 001–004. Each building has a $3,197,958 building limit and $100,000 BPP limit.',source:'b001'};
  if (/premium|classification|term/.test(q)) return {answer:'The declarations name West Coast Hotel Management LLC, classified as Hotels (except Casino Hotels) and Motels. The term is December 20, 2018 to December 20, 2019, with a $22,887 annual premium.',source:'identity'};
  if (/aggregate|liability|limit/.test(q)) return {answer:'Liability is occurrence-based: $1,000,000 each occurrence, $2,000,000 general aggregate and a separate $2,000,000 products/completed-operations aggregate. Medical expenses are $5,000 each person. Remaining aggregates are not established by these documents.',source:'liability'};
  return {answer:'This preview has no prepared answer for that question. Try business income, deductibles, hired auto, water backup or guest property. Review the full policy for a coverage determination.'};
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
  $('askOvieAnswer').textContent=`Preview answer based on the supplied policy.\n\n${answer}`;
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

// A host may supply a verified count; this prototype does not assume a wallet inventory.
window.setBopWalletContext = ({ commercialPolicyCount } = {}) => {
  $('companionNotice').hidden = commercialPolicyCount !== 1;
};
for (const button of document.querySelectorAll('[data-ask]')) button.onclick=()=>{
  askInput.value=button.dataset.ask;
  openAsk(button);
};
