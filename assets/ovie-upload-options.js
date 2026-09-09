/* Shared upload entry sheet. File processing is simulated by the HTML preview. */
(() => {
  'use strict';
  const scriptUrl = document.currentScript.src;
  const key = 'ovie.upload.design-preview.v1';
  const asset = path => new URL(path, scriptUrl).href;
  const icon = name => `<span class="upload-option-icon" aria-hidden="true" style="--option-icon:url('${asset(name)}')"></span>`;
  let sheet, opener, selected = [], closeTimer;
  function destination(route, batchId) {
    const target = new URL('../ovie_upload.html', scriptUrl);
    const returnPage = location.pathname.endsWith('/ovie_upload.html')
      ? new URLSearchParams(location.search).get('return') : location.pathname.split('/').pop();
    target.searchParams.set('return', ['ovie_homepage.html','MyFiles.html','Insights.html'].includes(returnPage) ? returnPage : 'ovie_homepage.html');
    target.hash = route;
    if (batchId) target.searchParams.set('batch', batchId);
    location.href = target.href;
  }
  function close(instant = false) {
    if (!sheet?.open) return;
    sheet.classList.toggle('instant', instant);
    sheet.classList.remove('is-visible');
    const finish = () => { sheet.close(); document.documentElement.classList.remove('upload-options-open'); opener?.focus({preventScroll:true}); };
    clearTimeout(closeTimer);
    if (instant) finish();
    else closeTimer = setTimeout(finish, matchMedia('(prefers-reduced-motion:reduce)').matches ? 125 : 260);
  }
  function message(copy) { sheet.querySelector('[role="status"]').textContent = copy; }
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
        <ul class="upload-options-selected" aria-label="Selected documents" hidden></ul>
        <button class="upload-options-submit" type="button" hidden>Upload files</button>
        <p class="upload-options-notice">I understand that I am uploading sensitive insurance documents and confirm Ovie may process them securely per our Privacy Policy and Terms of Service.</p>
      </div>`;
    document.body.append(sheet);
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
    sheet.querySelectorAll('input[type="file"]').forEach(input => input.addEventListener('change', () => {
      if (!input.files.length) return;
      selected = Array.from(input.files);
      const error = selected.length > 10 ? 'Choose up to 10 files.'
        : selected.some(file => !/^.+\.(pdf|png|jpe?g)$/i.test(file.name)) ? 'Choose PDF, PNG or JPG files.'
        : selected.some(file => !file.size) ? 'Remove empty files.'
        : selected.some(file => file.size > 26214400) ? 'Each file must be 25 MiB or smaller.'
        : selected.reduce((sum,file) => sum + file.size, 0) > 104857600 ? 'The batch must be 100 MiB or smaller.' : '';
      sheet.querySelector('[role="alert"]').textContent = error;
      const list = sheet.querySelector('.upload-options-selected');
      list.replaceChildren(...selected.map(file => { const item = document.createElement('li'); item.textContent = file.name; return item; }));
      list.hidden = false;
      const submit = sheet.querySelector('.upload-options-submit');
      submit.hidden = false; submit.disabled = Boolean(error);
      message(error ? '' : `${selected.length} ${selected.length === 1 ? 'file selected' : 'files selected'}.`);
      if (!error) submit.focus();
    }));
    sheet.querySelector('.upload-options-submit').onclick = async () => {
      if (!selected.length || sheet.querySelector('.upload-options-submit').disabled) return;
      const state = {flowVersion:5,batchId:Date.now().toString(36)+Math.random().toString(36).slice(2),readyPolicies:[],insightPolicies:[],scenario:'reading',stage:3,elapsed:0,playing:true,tick:Date.now(),seen:false,custom:selected.map(file=>file.name)};
      const submit=sheet.querySelector('.upload-options-submit'); submit.disabled=true;
      try { await window.OvieUploadFlow.storeFiles(state.batchId,selected); localStorage.setItem(key, JSON.stringify(state)); }
      catch { submit.disabled=false; message('This browser could not save the upload preview. Please allow site storage and try again.'); return; }
      // A new batch URL reloads detail state even when this sheet opens over detail.
      destination('detail', state.batchId);
    };
  }
  function open(trigger = document.activeElement, keyboard = false) {
    if (!sheet) build();
    if (sheet.open) return;
    clearTimeout(closeTimer); opener = trigger; selected = [];
    const shell = document.querySelector('.app-shell');
    sheet.style.width = shell ? `${shell.getBoundingClientRect().width}px` : '';
    sheet.querySelectorAll('[role="status"],[role="alert"]').forEach(element => element.textContent = '');
    sheet.querySelector('.upload-options-selected').hidden = true;
    sheet.querySelector('.upload-options-submit').hidden = true;
    sheet.querySelector('details').open = false;
    sheet.classList.toggle('instant', keyboard);
    document.documentElement.classList.add('upload-options-open');
    sheet.showModal();
    sheet.querySelector('[data-source="files"]').focus({preventScroll:true});
    sheet.getBoundingClientRect();
    sheet.classList.add('is-visible');
  }
  window.OvieUploadOptions = {open};
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
