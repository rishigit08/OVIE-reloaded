/* Shared "More" bottom sheet: Manage access and Compare quotes.
   Used by pages whose navigation has a More button but no sheet of its own. */
(() => {
  'use strict';
  const items = [
    { label: 'Manage access', href: 'manage_access.html',
      icon: '<path d="M15 8a1 1 0 0 1-1-1V2a2.4 2.4 0 0 1 1.704.706l3.588 3.588A2.4 2.4 0 0 1 20 8z"/><path d="M20 8v12a2 2 0 0 1-2 2h-4.182"/><path d="m3.305 19.53.923-.382"/><path d="M4 10.592V4a2 2 0 0 1 2-2h8"/><path d="m4.228 16.852-.924-.383"/><path d="m5.852 15.228-.383-.923"/><path d="m5.852 20.772-.383.924"/><path d="m8.148 15.228-.383-.923"/><path d="m8.53 21.696-.382-.924"/><path d="m9.773 16.852.922-.383"/><path d="m9.773 19.148.922.383"/><circle cx="7" cy="18" r="3"/>' },
    { label: 'Compare quotes', href: 'ovie_upload_quote_comparison.html',
      icon: '<path d="M11 13H7"/><path d="M19 9h-4"/><path d="M3 3v16a2 2 0 0 0 2 2h16"/><rect x="15" y="5" width="4" height="12" rx="1"/><rect x="7" y="8" width="4" height="9" rx="1"/>' }
  ];
  const css = `
.ovie-more-sheet{position:fixed;z-index:1000;inset:auto auto 0 50%;width:min(100%,390px);max-width:none;margin:0;padding:0;overflow:hidden;border:0;border-radius:12px 12px 0 0;background:#fff;color:#111;font:400 14px/20px Figtree,system-ui,sans-serif;box-shadow:0 6px 16px rgba(17,17,17,.12);transform:translate(-50%,100%);transition:transform 260ms cubic-bezier(.32,.72,0,1)}
.ovie-more-sheet[open].is-visible{transform:translate(-50%,0)}
.ovie-more-sheet::backdrop{background:rgba(17,24,23,.58);opacity:0;transition:opacity 260ms cubic-bezier(.23,1,.32,1)}
.ovie-more-sheet.is-visible::backdrop{opacity:1}
.ovie-more-sheet.instant,.ovie-more-sheet.instant::backdrop{transition:none}
.ovie-more-inner{padding:8px 16px calc(18px + env(safe-area-inset-bottom))}
.ovie-more-handle{width:36px;height:4px;margin:0 auto 8px;border-radius:999px;background:#d8dddb}
.ovie-more-header{min-height:44px;display:flex;align-items:center;justify-content:space-between}
.ovie-more-header h2{margin:0;font-size:18px;line-height:24px;font-weight:600}
.ovie-more-close{width:44px;height:44px;margin-right:-10px;border:0;border-radius:12px;display:grid;place-items:center;background:transparent;color:#5f6368;cursor:pointer}
.ovie-more-list{margin-top:4px;display:grid}
.ovie-more-row{width:100%;min-height:60px;padding:8px 4px;display:flex;align-items:center;gap:12px;border:0;border-top:1px solid #ecefed;background:transparent;color:#111;font:inherit;text-align:left;cursor:pointer;transition:background-color 160ms cubic-bezier(.23,1,.32,1)}
.ovie-more-row:first-child{border-top:0}
.ovie-more-row:active{background:#f6f6f6}
.ovie-more-icon{width:40px;height:40px;flex:0 0 auto;display:grid;place-items:center;border-radius:10px;background:#f5edf3;color:#6b4062}
.ovie-more-label{font-size:14px;line-height:20px;font-weight:600}
.ovie-more-sheet button:focus-visible{outline:0;box-shadow:0 0 0 3px rgba(107,64,98,.24);border-radius:12px}
@media (hover:hover) and (pointer:fine){.ovie-more-row:hover{background:#f6f6f6}}
@media (prefers-reduced-motion:reduce){.ovie-more-sheet{transform:translate(-50%,0);opacity:0;transition:opacity 125ms cubic-bezier(.23,1,.32,1)}.ovie-more-sheet[open].is-visible{opacity:1}.ovie-more-sheet::backdrop{transition-duration:125ms}}`;
  let sheet, opener, timer;
  function build() {
    const style = document.createElement('style');
    style.textContent = css;
    document.head.append(style);
    sheet = document.createElement('dialog');
    sheet.className = 'ovie-more-sheet';
    sheet.setAttribute('aria-labelledby', 'ovie-more-title');
    const svg = paths => `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths}</svg>`;
    sheet.innerHTML = `<div class="ovie-more-inner"><div class="ovie-more-handle" aria-hidden="true"></div>
      <div class="ovie-more-header"><h2 id="ovie-more-title">More</h2><button class="ovie-more-close" type="button" aria-label="Close more options"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="m18 6-12 12"/><path d="m6 6 12 12"/></svg></button></div>
      <div class="ovie-more-list">${items.map(i => `<button class="ovie-more-row" type="button" data-href="${i.href}"><span class="ovie-more-icon">${svg(i.icon)}</span><span class="ovie-more-label">${i.label}</span></button>`).join('')}</div></div>`;
    document.body.append(sheet);
    sheet.querySelector('.ovie-more-close').onclick = e => close(e.detail === 0);
    sheet.addEventListener('cancel', e => { e.preventDefault(); close(true); });
    sheet.addEventListener('click', e => {
      if (e.target === sheet) return close();
      const row = e.target.closest('[data-href]');
      if (!row) return;
      const instant = e.detail === 0 || matchMedia('(prefers-reduced-motion:reduce)').matches;
      close(instant, true);
      setTimeout(() => { location.href = row.dataset.href; }, instant ? 0 : 280);
    });
  }
  function close(instant = false, keepFocus = false) {
    if (!sheet?.open) return;
    sheet.classList.toggle('instant', instant);
    sheet.classList.remove('is-visible');
    const finish = () => { sheet.close(); document.documentElement.style.removeProperty('overflow'); if (!keepFocus) opener?.focus({ preventScroll: true }); };
    clearTimeout(timer);
    if (instant) finish(); else timer = setTimeout(finish, matchMedia('(prefers-reduced-motion:reduce)').matches ? 125 : 260);
  }
  function open(trigger, keyboard) {
    if (!sheet) build();
    if (sheet.open) return;
    opener = trigger;
    sheet.classList.toggle('instant', keyboard);
    sheet.showModal();
    sheet.getBoundingClientRect();
    sheet.classList.add('is-visible');
    sheet.querySelector('.ovie-more-row').focus({ preventScroll: true });
  }
  // Capture so it wins over a page's own placeholder More handler (toast, no-op).
  document.addEventListener('click', event => {
    const button = event.target.closest('button');
    if (!button || button.closest('dialog')) return;
    if (button.id !== 'moreMenu' && !(button.closest('nav,.mobile-nav') && button.textContent.trim() === 'More')) return;
    event.preventDefault();
    event.stopImmediatePropagation();
    open(button, event.detail === 0);
  }, true);
})();
