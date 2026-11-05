/* Files page: shows a card while newly uploaded files are read and extracted.
   Design preview only: reads the simulated batch state kept by the upload flow. */
(() => {
  'use strict';
  const key = 'ovie.upload.design-preview.v1';
  const css = `
.files-processing{margin:0 0 18px;padding:16px;border-radius:12px;background:var(--surface,#fff);color:var(--text-primary,#111)}
.files-processing-row{display:flex;align-items:flex-start;gap:12px}
.files-processing-icon{width:40px;height:40px;flex:0 0 auto;border-radius:12px;display:grid;place-items:center;background:var(--primary-soft,#f5edf3);color:var(--icon-brand,#6B4062)}
.files-processing-copy{min-width:0;flex:1}
.files-processing-title{margin:0;font-size:14px;line-height:20px;font-weight:600;overflow-wrap:anywhere}
.files-processing-meta{margin:0;font-size:12px;line-height:16px;color:var(--text-tertiary,#5f6368);overflow-wrap:anywhere}
.files-processing-track{margin-top:16px;height:2px;position:relative;background:var(--border-subtle,#ecefed)}
.files-processing-bar{position:absolute;inset:0;background:var(--primary,#6B4062);transform-origin:left center;transform:scaleX(0);transition:transform var(--motion-duration-standard,200ms) linear}
.files-processing-dots{display:inline-block;width:1.5em;text-align:left;font-weight:600}
.files-processing-dots i{font-style:normal;opacity:.25;animation:files-processing-dot 1200ms linear infinite}
.files-processing-dots i:nth-child(2){animation-delay:200ms}
.files-processing-dots i:nth-child(3){animation-delay:400ms}
@keyframes files-processing-dot{0%,60%,100%{opacity:.25}20%,40%{opacity:1}}
@media (prefers-reduced-motion:reduce){.files-processing-bar{transition:none}.files-processing-dots i{animation:none;opacity:1}}
.files-processing-sr{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap}`;
  // Files shows progress in its own card, so the Add button carries no progress ring.
  const css2 = `.files-header-actions .ovie-upload-nav-progress{display:none!important}`;
  let keyboardUsed = false;
  addEventListener('keydown', () => { keyboardUsed = true; }, { once: true, capture: true });
  // Returning from the upload page restores focus to Add programmatically; don't show a ring unless the keyboard is in use.
  setTimeout(() => {
    const active = document.activeElement;
    if (!keyboardUsed && active?.closest?.('.files-header-actions')) active.blur();
  }, 50);
  const style = document.createElement('style');
  style.textContent = css + css2;
  document.head.append(style);
  const fileIcon = '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" x2="12" y1="3" y2="15"/></svg>';
  let card, lastBatch, lastLabel;
  function state() {
    try {
      const s = JSON.parse(localStorage.getItem(key));
      if (!s || !window.OvieUploadFlow) return null;
      window.OvieUploadFlow.sync(s);
      return s.stage === 4 || !s.custom?.length ? null : s;
    } catch { return null; }
  }
  const phase = s => window.OvieUploadFlow.item(s, 'local');
  function build() {
    card = document.createElement('section');
    card.className = 'files-processing';
    card.setAttribute('aria-label', 'Upload in progress');
    card.innerHTML = `<div class="files-processing-row"><span class="files-processing-icon">${fileIcon}</span>
      <div class="files-processing-copy"><p class="files-processing-title"><span class="files-processing-label"></span><span class="files-processing-dots" aria-hidden="true"><i>.</i><i>.</i><i>.</i></span></p><p class="files-processing-meta"></p></div></div>
      <div class="files-processing-track"><span class="files-processing-bar"></span></div>
      <span class="files-processing-sr" role="status" aria-live="polite"></span>`;
  }
  const put = (el, text) => { if (el.textContent !== text) el.textContent = text; };
  function update() {
    const s = state(), tabs = document.querySelector('.files-tabs');
    if (!s || !tabs) { card?.remove(); lastBatch = lastLabel = null; return; }
    if (!card) build();
    if (card.previousElementSibling !== tabs) tabs.after(card);
    const names = s.custom, item = phase(s), time = window.OvieUploadFlow.elapsed(s);
    const label = ['Uploading', 'Extracting data', 'Reading info'][Math.floor(time / 2000) % 3]; // loops while the batch is active
    const index = Math.floor(time / (6000 / names.length)) % names.length;
    put(card.querySelector('.files-processing-label'), label);
    put(card.querySelector('.files-processing-meta'), names.length === 1 ? names[0] : `${names[index]} · ${index + 1}/${names.length}`);
    const bar = card.querySelector('.files-processing-bar'), t = `scaleX(${item.progress / 100})`;
    if (bar.style.transform !== t) bar.style.transform = t;
    if (lastBatch !== s.batchId || lastLabel !== label) {
      put(card.querySelector('[role="status"]'), `${label} for ${names.length === 1 ? 'your file' : names.length + ' files'}`);
      lastBatch = s.batchId; lastLabel = label;
    }
  }
  new MutationObserver(update).observe(document.getElementById('root') || document.body, { childList: true, subtree: true });
  window.addEventListener('storage', update);
  window.addEventListener('ovie-upload-preview-changed', update);
  setInterval(update, 500);
  update();
})();
