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
  const parts=[node('p','source-meta',source.ref)];
  if(source.entries){ const list=node('dl','source-entries'); for(const [label,value] of source.entries) {const row=node('div','source-entry');row.append(node('dt','',label),node('dd','',value));list.append(row);}parts.push(list); }
  parts.push(node('p','source-context','The original policy file is not attached to this preview.'));
  $('sourceBody').replaceChildren(...parts);openDialog(sourceSheet,trigger);
}
document.addEventListener('click', event => { const button=event.target.closest('[data-source]'); if(button) showSource(button.dataset.source,button); });
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


$('searchButton').onclick = event => {
  $('utilityTitle').textContent = 'Search these insights';
  const label = node('label', '', 'Find a coverage, limit or policy detail');
  label.htmlFor = 'insightsSearch';
  const input = node('input', 'search-field');
  input.id = 'insightsSearch'; input.type = 'search'; input.placeholder = 'Try collision or liability';
  const status = node('p', 'source-context', 'Search within these policy insights.');
  status.setAttribute('role', 'status');
  const results = node('div', 'search-results');
  input.addEventListener('input', () => {
    const query = input.value.trim().toLowerCase();
    results.replaceChildren();
    if (!query) { status.textContent = 'Search within these policy insights.'; return; }
    const searchIndex = [...document.querySelectorAll('main .field, main .auto-fact')];
    const matches = searchIndex.filter(element => element.textContent.toLowerCase().includes(query));
    status.textContent = matches.length ? `${matches.length} results` : 'No matching details. Try a coverage name such as collision.';
    matches.forEach(element => {
      const result = node('button', 'search-result', element.textContent.trim());
      result.type = 'button';
      result.onclick = () => {
        for(let parent=element.parentElement;parent;parent=parent.parentElement)if(parent.tagName==='DETAILS')parent.open=true;
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
function answerForPolicy() {
  return {answer:'This preview has no verified answer for that question. Review the document sources or ask your insurance agent.'};
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

