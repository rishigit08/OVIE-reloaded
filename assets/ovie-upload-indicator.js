/* Design-preview navigation status. No API calls or file transfer. */
(() => {
  const key = 'ovie.upload.design-preview.v1';
  const scriptUrl = document.currentScript.src;
  const isUploadPage = location.pathname.endsWith('/ovie_upload.html');
  const selector = '#uploadPolicy,.upload-nav,[data-upload-entry]';
  const stages = ['Uploading files', 'Generating insights', 'Generating insights', 'Generating insights'];
  const css = document.createElement('link');
  css.rel = 'stylesheet';
  css.href = new URL('ovie-upload-nav.css?v=20260909n', scriptUrl).href;
  document.head.append(css);
  function read() { try { return JSON.parse(localStorage.getItem(key)); } catch { return null; } }
  let toastTimer,toastBatch;
  const completionKey='ovie.upload.last-completion-toast';
  function showCompletionToast(state) {
    if(document.visibilityState==='hidden'||!state?.batchId||state.stage!==4||!state.insightPolicies?.length||!state.insightPolicies.every(id=>state.readyPolicies?.includes(id)))return;
    try{if(localStorage.getItem(completionKey)===state.batchId)return;localStorage.setItem(completionKey,state.batchId)}catch{}
    let toast=document.querySelector('#ovie-upload-completion-toast');
    if(!toast){toast=document.createElement('div');toast.id='ovie-upload-completion-toast';toast.className='ovie-upload-completion-toast';toast.setAttribute('role','status');toast.setAttribute('aria-live','polite');toast.innerHTML='<span>All policy insights are now generated.</span><button type="button" aria-label="Dismiss notification"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="m18 6-12 12M6 6l12 12"/></svg></button>';document.body.append(toast)}
    toastBatch=state.batchId;
    const button=toast.querySelector('button');
    const dismiss=()=>{toast.classList.remove('is-visible');toast.setAttribute('aria-hidden','true');button.tabIndex=-1};
    toast.classList.toggle('above-navigation',!isUploadPage);
    toast.setAttribute('aria-hidden','false');button.tabIndex=0;button.onclick=dismiss;
    toast.getBoundingClientRect();toast.classList.add('is-visible');
    clearTimeout(toastTimer);toastTimer=setTimeout(dismiss,5000);
  }
  function update() {
    const state = read();
    if(state?.stage===1){state.stage=state.custom||['unmatched','duplicate'].includes(state.scenario)?4:3;state.scenario=state.scenario==='duplicateReview'?'generating':state.scenario;state.insightPolicies=state.stage===4?[]:(state.insightPolicies||['condo','umbrella','standalone']);state.tick=Date.now();try{localStorage.setItem(key,JSON.stringify(state))}catch{}}
    if(toastBatch&&toastBatch!==state?.batchId){const toast=document.querySelector('#ovie-upload-completion-toast');toast?.classList.remove('is-visible');toast?.setAttribute('aria-hidden','true');const close=toast?.querySelector('button');if(close)close.tabIndex=-1;clearTimeout(toastTimer);toastBatch=null}
    if (!isUploadPage && state?.playing && state.stage < 4) {
      const elapsed = Date.now() - state.tick;
      if (elapsed >= (state.stage === 0 ? 12000 : 6000)) {
        if (state.stage === 0) {
          state.uploadProgress = 100;
          state.stage = state.custom || ['unmatched','duplicate'].includes(state.scenario) ? 4 : 3;
          state.insightPolicies=state.stage===4?[]:state.scenario==='existingOnly'?['umbrella']:state.scenario==='standalone'?['standalone']:state.scenario==='inbox'?['condo']:['condo','umbrella','standalone'];
        } else if (state.stage === 2) {
          state.stage = 3;
        } else {
          state.readyPolicies ||= [];
          const policies=state.insightPolicies||[];
          const failed=id=>(state.scenario==='failed'&&id==='condo')||(state.scenario==='regenerationFailed'&&id==='umbrella');
          const next=policies.find(id=>!state.readyPolicies.includes(id)&&!failed(id));
          if(next)state.readyPolicies.push(next);
          if(policies.every(id=>state.readyPolicies.includes(id)||failed(id)))state.stage=4;
        }
        state.tick = Date.now();
        if (state.stage === 4) state.playing = false;
        try { localStorage.setItem(key, JSON.stringify(state)); } catch {}
      }
    }
    showCompletionToast(state);
    document.querySelectorAll('.ovie-upload-preview-indicator').forEach(row => row.remove());
    document.querySelectorAll(selector).forEach(button => {
      if (!state) {
        button.querySelector('.ovie-upload-nav-progress')?.remove();
        button.setAttribute('aria-label', 'Upload files');
        return;
      }
      const done = state.stage === 4;
      const failed = done && ['failed', 'regenerationFailed', 'uploadFailed'].includes(state.scenario);
      const step = state.stage < 2 ? 1 : 2;
      const outcome = failed ? 'Finished with an issue' : state.scenario === 'duplicate' ? 'Duplicates discarded' : 'Complete';
      const label = done ? `Upload: ${outcome}. View outcome` : `Upload: ${stages[state.stage]}, step ${step} of 2. View progress`;
      button.setAttribute('aria-label', label);
      button.title = label;
      const anchor = button.querySelector('.nav-icon') || button;
      anchor.classList.add('ovie-upload-nav-anchor');
      let marker = anchor.querySelector('.ovie-upload-nav-progress');
      if (!marker) {
        marker = document.createElement('span');
        marker.className = 'ovie-upload-nav-progress';
        marker.setAttribute('aria-hidden', 'true');
        anchor.append(marker);
      }
      const signature = `${state.stage}-${failed}`;
      if (marker.dataset.state !== signature) {
        marker.dataset.state = signature;
        marker.classList.toggle('is-complete', done && !failed);
        marker.classList.toggle('is-failed', failed);
        marker.innerHTML = `<svg class="ovie-upload-stage-ring" viewBox="0 0 60 60" fill="none"><circle class="track" cx="30" cy="30" r="28" stroke-width="3"/><circle class="value" cx="30" cy="30" r="28" stroke-width="3" pathLength="100" stroke-dasharray="${done ? 100 : step * 100 / 2} 100" transform="rotate(-90 30 30)"/></svg>${done ? `<span class="ovie-upload-step-badge">${failed ? '!' : '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m20 6-11 11-5-5"/></svg>'}</span>` : ''}`;
      }
      try {
        if (sessionStorage.getItem('ovie.upload.return-focus') && button.getClientRects().length) {
          button.focus({ preventScroll: true });
          sessionStorage.removeItem('ovie.upload.return-focus');
        }
      } catch {}
    });
  }
  document.addEventListener('click', event => {
    const trigger = event.target.closest(selector);
    if (!trigger) return;
    event.preventDefault();
    event.stopImmediatePropagation();
    const route = read() ? 'detail' : 'upload';
    if (isUploadPage) {
      location.hash = route;
    } else {
      const target = new URL('../ovie_upload.html', scriptUrl);
      target.searchParams.set('return', location.pathname.split('/').pop());
      target.hash = route;
      location.href = target.href;
    }
  }, true);
  window.addEventListener('ovie-upload-preview-changed', update);
  window.addEventListener('storage', update);
  update();
  setInterval(update, 1000);
})();
