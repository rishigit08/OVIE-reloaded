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
  $('sourceTitle').textContent = source.title;
  const records = source.parts || [source];
  const content = records.map(record => {
    const section = node('section', 'source-record');
    section.append(node('h3','source-document-name',record.documentName),
      node('p','source-meta',`PDF page ${record.page} of 346`),
      node('p','source-form',`Form reference: ${record.formReference}`));
    function appendFields(target, fields) {
      const list=node('dl','source-fields');
      for(const [label,value] of fields){
        const row=node('div','source-field');
        row.append(node('dt','',label),node('dd','',value));
        list.append(row);
      }
      target.append(list);
    }
    if(record.entries){
      for(const entry of record.entries){
        const row=node('div','source-schedule-entry');
        row.append(node('h4','',entry.title));
        appendFields(row,entry.fields);
        section.append(row);
      }
    } else if(record.fields) appendFields(section,record.fields);
    else section.append(node('blockquote','source-excerpt',record.excerpt));
    if(record.after)section.append(node('blockquote','source-excerpt',record.after));
    if(POLICY_URL){
      const link=node('a','primary-action document-link',records.length>1?`View in document · page ${record.page}`:'View in document');
      link.href=`${POLICY_URL}#page=${record.page}`;
      link.target='_blank';link.rel='noopener';
      link.setAttribute('aria-label',`View in document, PDF page ${record.page} (opens in a new tab)`);
      section.append(link);
    } else section.append(node('p','source-context','The original policy document is not included in this preview.'));
    return section;
  });
  $('sourceBody').replaceChildren(...content);
  $('sourceBody').scrollTop=0;
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
const searchIndex = [...document.querySelectorAll('main .field,main .coverage-row,main .coverage-detail,main .insight-item,main .watchpoint,main .sublimit-row,main .neutral-note')]
  .filter(element => !element.querySelector('.insight-item'));
$('searchButton').onclick = event => {
  $('utilityTitle').textContent = 'Search these insights';
  const label = node('label', '', 'Find a coverage, limit or policy detail');
  label.htmlFor = 'insightsSearch';
  const input = node('input', 'search-field');
  input.id = 'insightsSearch'; input.type = 'search'; input.placeholder = 'Try payroll, California or employers liability';
  const status = node('p', 'source-context', 'Search within these policy insights.');
  status.setAttribute('role', 'status');
  const results = node('div', 'search-results');
  input.addEventListener('input', () => {
    const query = input.value.trim().toLowerCase();
    results.replaceChildren();
    if (!query) { status.textContent = 'Search within these policy insights.'; return; }
    const matches = searchIndex.filter(element => element.textContent.toLowerCase().includes(query));
    status.textContent = matches.length ? `${matches.length} results` : 'No matching details. Try payroll, a state name or a class code.';
    matches.forEach(element => {
      const result = node('button', 'search-result', element.textContent.trim());
      result.type = 'button';
      result.onclick = () => {
        let details = element.closest('details');
        while (details) { details.open = true; details = details.parentElement.closest('details'); }
        for (const id of ['locationSearch','classSearch']) {
          $(id).value = '';
          $(id).dispatchEvent(new Event('input'));
        }
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
  const lower = question.toLowerCase();
  let answer, source;
  if (/cancel|active|expir/.test(lower)) {
    answer='The supplied notice cancels policy WWC3216474 effective August 5, 2016 at 12:01 a.m., at the insured’s request. This does not establish whether replacement coverage exists. Review relevant injury and disease-exposure dates with your agent.';source='cancel';
  } else if (/epli|harass|discrimin|employment practice/.test(lower)) {
    answer='Harassment, discrimination and other employment practices claims are excluded here. EPLI is separate and optional; it is different from the Employers Liability coverage in this policy.';source='epli';
  } else if (/experience|modif|merit/.test(lower)) {
    answer='Most state schedules show an estimated 0.75 experience mod. California shows 0.94. Delaware, Michigan, Pennsylvania and Wisconsin show N/A; Michigan also shows a 0% merit rating credit. The rating endorsement says estimated factors may change.';source='mod';
  } else if (/audit|payroll|premium/.test(lower)) {
    answer='The estimated annual premium is $33,316,855, plus $876,184 in assessments. The base calculation is (payroll ÷ 100) × rate per $100 × the applicable experience mod, with other adjustments. Final audited cost after cancellation is not established here.';source='premium';
  } else if (/other state|ohio|washington|dakota|wyoming|unlisted/.test(lower)) {
    answer='ND, OH, WA and WY are outside Item 3.C and are not scheduled in 3.A. Eligible new work in other states has notice and other-insurance conditions. For work already underway at inception outside Item 3.A, the form requires notice within 30 days.';source='notice';
  } else if (/location|address|workplace/.test(lower)) {
    answer='The full schedule lists 51 locations, including “No Specific Location” entries. Locations 50–51 are under MVP Workforce, LLC. The base form also covers other workplaces in Item 3.A states unless separately insured or self-insured.';source='locations';
  } else if (/california|8810|8292|class/.test(lower)) {
    answer='California clerical class 8810 has $17,185,000 estimated annual payroll at $0.88 per $100. Review all 145 state/class entries in Employees & job classifications for other roles and rates.';source='class27_8810';
  } else if (/limit|employers liability/.test(lower)) {
    answer='Part One has state-mandated limits. The stated Part Two Employers Liability limits are $1,000,000 each accident, $1,000,000 disease policy limit and $1,000,000 disease each employee, subject to applicable state endorsements.';source='states';
  } else if (/medical|wage|disab|benefit/.test(lower)) {
    answer='Employees receive the statutory benefits for covered workplace injury or occupational disease. Exact medical, wage and disability benefits depend on the applicable state law; ask your agent for interpretation.';source='statutory';
  } else {
    answer='This prototype has no answer for that question. Review the linked policy or ask your agent.';
  }
  return {answer,source};
}

// Both schedules include every declared entry; filtering never changes the underlying data.
function wireScheduleFilter(inputId, rowSelector, groupSelector) {
  const input = $(inputId), rows = [...document.querySelectorAll(rowSelector)];
  const update = () => {
    const query = input.value.trim().toLowerCase();
    let visible = 0;
    rows.forEach(row => { row.hidden = !row.dataset.search.toLowerCase().includes(query); if (!row.hidden) visible++; });
    if (groupSelector) document.querySelectorAll(groupSelector).forEach(group => {
      group.hidden = ![...group.querySelectorAll(rowSelector)].some(row => !row.hidden);
    });
    $(inputId+'Status').textContent = visible ? `${visible} of ${rows.length} entries` : 'No matching entries. Try another search or clear the field.';
  };
  input.addEventListener('input',update);
  update();
}
wireScheduleFilter('locationSearch','#locationsList [data-location-entry]');
wireScheduleFilter('classSearch','#classificationsList [data-class-entry]','[data-class-group]');

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
