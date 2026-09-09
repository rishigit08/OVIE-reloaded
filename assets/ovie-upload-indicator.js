/* Design-preview navigation status. No API calls or file transfer. */
(() => {
  const key = 'ovie.upload.design-preview.v1';
  const scriptUrl = document.currentScript.src;
  const isUploadPage = location.pathname.endsWith('/ovie_upload.html');
  const selector = '#uploadPolicy,.upload-nav,[data-upload-entry]';
  const css = document.createElement('link');
  css.rel = 'stylesheet';
  css.href = new URL('ovie-upload-nav.css?v=20260909aj', scriptUrl).href;
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
    if(state){window.OvieUploadFlow.migrate(state);window.OvieUploadFlow.sync(state)}
    if(toastBatch&&toastBatch!==state?.batchId){const toast=document.querySelector('#ovie-upload-completion-toast');toast?.classList.remove('is-visible');toast?.setAttribute('aria-hidden','true');const close=toast?.querySelector('button');if(close)close.tabIndex=-1;clearTimeout(toastTimer);toastBatch=null}
    if(!isUploadPage&&state){try{const value=JSON.stringify(state);if(localStorage.getItem(key)!==value)localStorage.setItem(key,value)}catch{}}
    showCompletionToast(state);
    document.querySelectorAll('.ovie-upload-preview-indicator').forEach(row => row.remove());
    document.querySelectorAll(selector).forEach(button => {
      try {
        if (sessionStorage.getItem('ovie.upload.return-focus') && button.getClientRects().length) {
          button.focus({ preventScroll: true });
          sessionStorage.removeItem('ovie.upload.return-focus');
        }
      } catch {}
      if (!state || state.stage === 4) {
        button.querySelector('.ovie-upload-nav-progress')?.remove();
        button.setAttribute('aria-label', 'Upload files');
        button.title = 'Upload files';
        return;
      }
      const ids=state.insightPolicies?.length?state.insightPolicies:['local'];
      const value=Math.round(ids.reduce((sum,id)=>sum+window.OvieUploadFlow.item(state,id).progress,0)/ids.length);
      const label = `Upload: ${window.OvieUploadFlow.elapsed(state)<6000?'Extracting and Reading Data':'Generating Insights'}. View progress`;
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
      const signature = String(value);
      if (marker.dataset.state !== signature) {
        marker.dataset.state = signature;
        marker.innerHTML = `<svg class="ovie-upload-stage-ring" viewBox="0 0 60 60" fill="none"><circle class="track" cx="30" cy="30" r="28" stroke-width="3"/><circle class="value" cx="30" cy="30" r="28" stroke-width="3" pathLength="100" stroke-dasharray="${value} 100" transform="rotate(-90 30 30)"/></svg>`;
      }
    });
  }
  document.addEventListener('click', event => {
    const trigger = event.target.closest(selector);
    if (!trigger) return;
    event.preventDefault();
    event.stopImmediatePropagation();
    const state = read();
    if ((!state || state.stage === 4) && window.OvieUploadOptions) {
      window.OvieUploadOptions.open(trigger, event.detail === 0);
      return;
    }
    const route = state ? 'detail' : 'upload';
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
