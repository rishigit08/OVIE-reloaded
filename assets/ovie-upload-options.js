/* Shared upload entry sheet. File processing is simulated by the HTML preview. */
(() => {
  'use strict';
  const scriptUrl = document.currentScript.src;
  const asset = path => new URL(path, scriptUrl).href;
  const icon = name => `<span class="upload-option-icon" aria-hidden="true" style="--option-icon:url('${asset(name)}')"></span>`;
  let sheet, opener, selected = [], closeTimer, selectionRequest = 0;
  function destination(route, batchId) {
    const target = new URL('../ovie_upload.html', scriptUrl);
    const returnPage = location.pathname.endsWith('/ovie_upload.html')
      ? new URLSearchParams(location.search).get('return') : location.pathname.split('/').pop();
    target.searchParams.set('return', ['ovie_homepage.html','MyFiles.html','Insights.html'].includes(returnPage) ? returnPage : 'ovie_homepage.html');
    target.hash = route;
    if (batchId) target.searchParams.set(route==='review'?'draft':'batch', batchId);
    location.href = target.href;
  }
  function close(instant = false) {
    if (!sheet?.open) return;
    selectionRequest++;
    sheet.classList.toggle('instant', instant);
    sheet.classList.remove('is-visible');
    const finish = () => { sheet.close(); document.documentElement.classList.remove('upload-options-open'); opener?.focus({preventScroll:true}); };
    clearTimeout(closeTimer);
    if (instant) finish();
    else closeTimer = setTimeout(finish, matchMedia('(prefers-reduced-motion:reduce)').matches ? 125 : 260);
  }
  function message(copy) { sheet.querySelector('[role="status"]').textContent = copy; }
  function currentUpload() {
    try {
      const state = JSON.parse(localStorage.getItem('ovie.upload.design-preview.v1'));
      if (state) window.OvieUploadFlow.sync(state);
      return state && state.stage !== 4 ? state : null;
    } catch { return null; }
  }
  function refresh(state = currentUpload()) {
    if (!sheet) return;
    const button = sheet.querySelector('[data-current-upload]');
    const active = !!state && state.stage !== 4;
    if (!active && document.activeElement === button) sheet.querySelector('[data-source="files"]').focus({preventScroll:true});
    button.hidden = !active;
  }
  function build() {
    sheet = document.createElement('dialog');
    sheet.className = 'upload-options-sheet';
    sheet.id = 'upload-options-sheet';
    sheet.setAttribute('aria-labelledby', 'upload-options-title');
    sheet.setAttribute('aria-describedby', 'upload-options-formats');
    sheet.innerHTML = `
      <div class="upload-options-handle" aria-hidden="true"></div>
      <div class="upload-options-heading"><h2 id="upload-options-title">Upload your document</h2>
        <button class="upload-options-close" type="button" aria-label="Close upload options">${icon('lucide/x.svg')}</button>
        <p id="upload-options-formats">PDF, PNG, JPG · 10 files · 25 MiB/file · 100 MiB total</p></div>
      <div class="upload-options-body">
        <button class="upload-option" type="button" data-current-upload hidden>${icon('lucide/clock.svg?v=20260911a')}<span>View current upload status</span></button>
        <button class="upload-option" type="button" data-source="files">${icon('lucide/folder.svg')}<span>Choose from files</span></button>
        <button class="upload-option" type="button" data-source="camera">${icon('upload-options/camera.svg')}<span>Camera</span></button>
        <button class="upload-option" type="button" data-source="link">${icon('upload-options/link.svg')}<span>Request a link</span></button>
        <details class="upload-options-more"><summary><span>More</span>${icon('lucide/chevron-down.svg')}</summary>
          <button class="upload-option" type="button" data-source="drive"><span class="upload-option-brand"><img src="${asset('upload-options/google-drive.png')}" alt=""></span><span>Google Drive</span></button>
          <button class="upload-option" type="button" data-source="onedrive"><span class="upload-option-brand"><img src="${asset('upload-options/onedrive.png')}" alt=""></span><span>OneDrive</span></button>
        </details>
        <p class="upload-options-status" role="status" aria-live="polite"></p>
        <input id="upload-options-files" type="file" accept=".pdf,.png,.jpg,.jpeg" multiple hidden>
        <input id="upload-options-camera" type="file" accept="image/jpeg,image/png" capture="environment" hidden>
        <p class="upload-options-error" role="alert"></p>
        <p class="upload-options-notice">I understand that I am uploading sensitive insurance documents and confirm Ovie may process them securely per our Privacy Policy and Terms of Service.</p>
      </div>`;
    document.body.append(sheet);
    sheet.querySelector('[data-current-upload]').onclick = () => {
      const state = currentUpload();
      if (state) destination('detail', state.batchId);
      else refresh(null);
    };
    sheet.querySelector('.upload-options-close').onclick = event => close(event.detail === 0);
    sheet.addEventListener('cancel', event => { event.preventDefault(); close(true); });
    let backdropDown = false;
    const outside = event => { const rect = sheet.getBoundingClientRect(); return event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom; };
    sheet.addEventListener('pointerdown', event => { backdropDown = event.target === sheet && outside(event); });
    sheet.addEventListener('click', event => { if (backdropDown && event.target === sheet && outside(event)) close(); backdropDown = false; });
    sheet.querySelectorAll('[data-source]').forEach(button => button.onclick = () => {
      const source = button.dataset.source;
      if (source === 'link') { message('Link requests are not connected in this HTML preview. Choose a file or take a photo to try the upload flow.'); return; }
      message(source === 'drive' || source === 'onedrive'
        ? `Choose a file from your synced ${source === 'drive' ? 'Google Drive' : 'OneDrive'} folder. Direct cloud sign-in is not connected in this preview.`
        : source === 'camera' ? 'Use your device camera, or choose an image if a camera is not available.' : '');
      const input = sheet.querySelector(source === 'camera' ? '#upload-options-camera' : '#upload-options-files');
      input.value = '';
      input.click();
    });
    sheet.querySelectorAll('input[type="file"]').forEach(input => input.addEventListener('change', async () => {
      if (!input.files.length) return;
      const request=++selectionRequest;
      selected = Array.from(input.files);
      const error=window.OvieUploadFlow.validateFiles(selected);
      sheet.querySelector('[role="alert"]').textContent=error;
      if(error)return;
      sheet.querySelectorAll('[data-source]').forEach(button=>button.disabled=true);
      message('Preparing your files for review…');
      try{
        const draftId=location.hash==='#review'?new URLSearchParams(location.search).get('draft'):null;
        const draft=await window.OvieUploadFlow.createDraft(selected,draftId);
        if(sheet.open&&request===selectionRequest)destination('review',draft.id);
      }catch(error){sheet.querySelector('[role="alert"]').textContent=error.message||'These files could not be prepared. Please try again.';message('')}
      finally{sheet.querySelectorAll('[data-source]').forEach(button=>button.disabled=false)}
    }));
  }

  function open(trigger = document.activeElement, keyboard = false) {
    if (!sheet) build();
    if (sheet.open) return;
    clearTimeout(closeTimer); opener = trigger; selected = [];
    const shell = document.querySelector('.app-shell');
    sheet.style.width = shell ? `${shell.getBoundingClientRect().width}px` : '';
    sheet.querySelectorAll('[role="status"],[role="alert"]').forEach(element => element.textContent = '');
    sheet.querySelector('details').open = false;
    refresh();
    sheet.classList.toggle('instant', keyboard);
    document.documentElement.classList.add('upload-options-open');
    sheet.showModal();
    sheet.querySelector('[data-source="files"]').focus({preventScroll:true});
    sheet.getBoundingClientRect();
    sheet.classList.add('is-visible');
  }
  window.OvieUploadOptions = {open, refresh};
  window.addEventListener('resize', () => {
    if (!sheet?.open) return;
    const shell = document.querySelector('.app-shell');
    sheet.style.width = shell ? `${shell.getBoundingClientRect().width}px` : '';
  });
  document.addEventListener('click', event => {
    const trigger = event.target.closest('[data-upload-options]');
    if (!trigger) return;
    event.preventDefault(); open(trigger, event.detail === 0);
  });
})();
