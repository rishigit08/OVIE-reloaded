(() => {
  'use strict';
  const KEY = 'ovie.upload.design-preview.v1';
  document.querySelector('#preview-options').open=window.matchMedia('(min-width:1051px)').matches;
  const icons = {
    building2:'<path d="M10 12h4M10 8h4M14 21v-3a2 2 0 0 0-4 0v3M6 10H4a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-2M6 21V5a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v16"/>',
    umbrella:'<path d="M12 13v7a2 2 0 0 0 4 0M12 2v2M20.992 13a1 1 0 0 0 .97-1.274 10.284 10.284 0 0 0-19.923 0A1 1 0 0 0 3 13z"/>',
    car:'<path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4c0 .6.4 1 1 1h2M9 17h6"/><circle cx="7" cy="17" r="2"/><circle cx="17" cy="17" r="2"/>',
    upload:'<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12"/>',
    file:'<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z"/><path d="M14 2v6h6M8 13h8M8 17h5"/>',
    folder:'<path d="M20 20H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h5l2 2h9a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2Z"/>',
    check:'<path d="m20 6-11 11-5-5"/>', x:'<path d="m18 6-12 12M6 6l12 12"/>',
    back:'<path d="m12 19-7-7 7-7M5 12h14"/>',chevron:'<path d="m9 18 6-6-6-6"/>',
    clock:'<circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>',
    mail:'<rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-10 6L2 7"/>',
    info:'<circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/>',
    home:'<path d="m3 10 9-7 9 7v10a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1Z"/>',
    users:'<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/><circle cx="9" cy="7" r="4"/>',
    brain:'<path d="M12 18V5a3 3 0 0 0-5.997-.125 4 4 0 0 0-2.526 5.77 4 4 0 0 0 .556 6.588A4 4 0 1 0 12 18M9 13a4.5 4.5 0 0 1-3-4M6.003 4.875A3 3 0 0 0 6.4 6.5M3.477 10.645A4 4 0 0 1 5 10.1M6 18a4 4 0 0 1-1.967-.767M12 13h4M12 18h6a2 2 0 0 1 2 2v1M12 8h8M16 8V5a2 2 0 0 1 2-2"/><circle cx="16" cy="13" r=".5"/><circle cx="20" cy="8" r=".5"/><circle cx="18" cy="3" r=".5"/><circle cx="20" cy="21" r=".5"/>'
  };
  const icon=(name)=>`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${icons[name] || icons.file}</svg>`;
  const esc=(v)=>String(v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const sample=()=>({flowVersion:4,batchId:Date.now().toString(36)+Math.random().toString(36).slice(2),readyPolicies:[],insightPolicies:['condo','umbrella','standalone'],scenario:'uploading',stage:0,uploadProgress:32.5,playing:false,tick:0,seen:false,custom:null});
  let state;try{state=JSON.parse(localStorage.getItem(KEY))}catch{}if(!state || state.flowVersion!==4 || !Number.isInteger(state.stage))state=sample();
  const expandedPolicyFolders=new Set();
  const save=()=>{try{localStorage.setItem(KEY,JSON.stringify(state))}catch{}};
  const scenarios=[['uploading','Uploading files'],['generating','Generating insights'],['partial','Some insights generated'],['failed','Insights failed'],['uploadFailed','Processing failed']];
  const stageNames=['Uploading files','Generating insights','Generating insights','Generating insights'];
  const visibleStep=()=>state.stage<2?1:2;
  const main=document.querySelector('#main'),header=document.querySelector('#header'),nav=document.querySelector('#nav');
  let previous='files',restoreIndicator=false;
  const requestedReturn=new URLSearchParams(location.search).get('return');
  const returnPage=['ovie_homepage.html','MyFiles.html','Insights.html'].includes(requestedReturn)?requestedReturn:'ovie_homepage.html';
  const terminal=()=>state.stage===4;
  const failure=()=>['failed','regenerationFailed','uploadFailed'].includes(state.scenario);
  const noInsights=()=>state.scenario==='unmatched'||!!state.custom||state.scenario==='duplicate';
  const dots=()=>'<span class="processing-dots" aria-hidden="true"><span>.</span><span>.</span><span>.</span></span>';
  const badge=(text,kind='')=>`<span class="pill ${kind}">${esc(text)}${['Generating insights','Regenerating insights'].includes(text)?dots():''}</span>`;
  const ring=()=>`<span class="status-ring ${terminal()?(failure()?'error':'done'):''}">${icon(terminal()?(failure()?'info':'check'):'upload')}</span>`;
  const batchFiles=()=>state.custom || (state.scenario==='standalone'?['Auto policy.pdf']:state.scenario==='existingOnly'?['Umbrella amendment.pdf','Umbrella schedule.pdf']:state.scenario==='duplicate'?['Umbrella declarations.pdf','Umbrella policy form.pdf']:state.scenario==='inbox'?['Condo declarations.pdf','Quote summary.pdf']:state.scenario==='unmatched'?['Home inventory.pdf']:['Umbrella amendment.pdf','Umbrella schedule.pdf','Condo declarations.pdf','Home inventory.pdf','Umbrella declarations.pdf','Condo policy form.pdf','Auto policy.pdf']);
  const effectiveFiles=()=>state.custom?[...state.custom.filter(n=>/\.pdf$/i.test(n)),...(state.custom.some(n=>/\.(png|jpe?g)$/i.test(n))?['merged-images.pdf']:[])]:batchFiles();
  const title=()=>!terminal()?stageNames[state.stage]:state.scenario==='uploadFailed'?'Upload couldn’t be processed':failure()?'Insights partly ready':noInsights()?'Files processed':'Generating insights';
  const summary=()=>state.scenario==='uploadFailed'?'These files weren’t saved. You can upload them again.':state.scenario==='failed'?'Your umbrella insights are updated and your standalone policy insights are ready. Insights for the new condo policy couldn’t be generated.':state.scenario==='regenerationFailed'?'Your new and standalone policy insights are ready. Umbrella insights couldn’t be updated; the previous insights remain available.':state.scenario==='existingOnly'?'Your documents were added and the policy insights are updated.':state.scenario==='standalone'?'Insights are ready for your standalone policy document.':state.scenario==='duplicate'?'Duplicate copies were discarded. Your existing documents and insights are unchanged.':noInsights()?'Your files are saved in My Files. No policy insights were generated.':state.scenario==='inbox'?'Your condo policy insights are ready. The non-policy quote summary was discarded.':'Insights are ready for your new and standalone policies, and updated for your existing policy.';
  const duplicateNames=()=>state.custom||['inbox','unmatched','uploadFailed','existingOnly','standalone'].includes(state.scenario)?[]:state.scenario==='duplicate'?batchFiles():[batchFiles()[4]];
  const discardedNames=()=>duplicateNames();
  const insightPolicies=()=>noInsights()||state.scenario==='uploadFailed'?[]:state.scenario==='existingOnly'||state.scenario==='duplicate'?['umbrella']:state.scenario==='standalone'?['standalone']:state.scenario==='inbox'?['condo']:['condo','umbrella','standalone'];
  const policyWillFail=policy=>(state.scenario==='failed'&&policy==='condo')||(state.scenario==='regenerationFailed'&&policy==='umbrella');
  const successfulCompletion=()=>terminal()&&!failure()&&state.insightPolicies.length>0;
  const linkRow=(name,sub,target,kind='folder')=>`<button class="destination" data-go="${target}"><span class="icon-box">${icon(kind)}</span><span class="stack grow"><strong>${name}</strong><span class="caption">${sub}</span></span>${icon('chevron')}</button>`;
  function headerHtml(name,back='files',isDetail=false){return `<button class="icon-button clear ${isDetail?'strong-icon':''}" data-go="${back}" aria-label="Back">${icon('back')}</button><div class="header-heading"><h1 tabindex="-1">${name}</h1>${isDetail&&(!terminal()||successfulCompletion())?`<span class="step-count">Step ${visibleStep()} of 2</span>`:''}</div>${isDetail?`<button class="icon-button clear cancel-action strong-icon" data-go="files" aria-label="Cancel">${icon('x')}</button>`:''}`}
  function navHtml(){return `<a href="ovie_homepage.html">${icon('home')}Home</a><button aria-current="page" data-go="files">${icon('folder')}My Files</button><button class="upload" data-upload-entry data-go="detail" aria-label="Upload files">${icon('upload')}</button><a href="Insights.html">${icon('brain')}Insights</a><a href="ovie_homepage.html#access">${icon('users')}Access</a>`}
  function files(){header.innerHTML=`<h1 tabindex="-1">My Files</h1>`;main.innerHTML=`<div class="destinations">${linkRow('Citizens personal umbrella policy','Umbrella · Policy ••8389','policy/umbrella')}${linkRow('Citizens condo policy','Condo · Policy ••4218','policy/condo')}${linkRow('Non-policy documents','Documents not linked to a policy','policy/other')}</div><p class="section-caption caption">Documents sent to your Ovie Inbox appear here after processing.</p>`;nav.innerHTML=navHtml()}
  function fileRow(name,status,description,kind=''){return `<div class="file-row">${icon('file')}<div class="stack grow"><strong>${esc(name)}</strong>${description?`<span class="caption">${esc(description)}</span>`:''}${status?badge(status,kind):''}</div></div>`}
  function policyGroup(name,meta,files,policy,added){
    const failed=terminal()&&((state.scenario==='failed'&&policy==='condo')||(state.scenario==='regenerationFailed'&&added));
    const ready=state.readyPolicies.includes(policy);
    const label=ready?'Insights generated':failed?'Insights unavailable':added?'Regenerating insights':'Generating insights';
    const category=added?'Existing policy':'New policy';
    const context=`${policy==='standalone'?'Policy number unavailable':`Policy ${meta.split(' · ').pop()}`} · ${files.length} ${files.length===1?'document':'documents'}`;
    return `<section class="upload-policy-item"><details class="upload-policy-folder" data-policy-folder="${state.batchId}:${policy}" ${expandedPolicyFolders.has(`${state.batchId}:${policy}`)?'open':''}><summary class="upload-policy-heading"><span class="icon-box">${icon(policy==='umbrella'?'umbrella':policy==='standalone'?'car':policy==='condo'?'building2':'folder')}</span><div class="stack grow"><div class="upload-title-line"><h2>${name}</h2></div><span class="caption">${context}</span>${badge(category,'category-badge')}</div><span class="policy-folder-chevron">${icon('chevron')}</span></summary><div class="upload-policy-documents">${files.map(n=>`<div class="upload-document-row"><span class="upload-document-icon">${icon('file')}</span><div class="stack grow"><strong>${esc(n)}</strong></div></div>`).join('')}</div></details><div class="upload-policy-footer"><div class="policy-insight-status">${ready||failed?badge(label,ready?'success':'danger'):`<span class="caption insight-processing-text">${esc(label)}${dots()}</span>`}${failed&&added?'<p class="caption">Your documents are saved. Previous insights remain available.</p>':''}</div>${ready?policy==='standalone'?'<button class="text-action" data-go="standalone-insights">View insights '+icon('chevron')+'</button>':`<a class="text-action" href="ovie_${policy==='umbrella'?'umbrella':'condo'}_insights.html">View insights ${icon('chevron')}</a>`:''}</div></section>`;
  }
  function taggedDocument(name,tags,description){return `<div class="upload-document-row ungrouped-document"><span class="upload-document-icon">${icon('file')}</span><div class="stack grow"><div class="upload-title-line"><strong>${esc(name)}</strong></div><span class="caption">${esc(description)}</span><div class="upload-tag-row">${tags.map(tag=>badge(tag,tag==='Discarded'?'danger category-badge':'category-badge')).join('')}</div></div></div>`}
  function transferState(index){
    // Preview timeline: each file starts extracting immediately after its own upload.
    const work=(state.uploadProgress??32.5)*(batchFiles().length+1)-index*100;
    const uploading=work<100;
    const value=Math.max(0,Math.min(100,Math.round(uploading?work:work-100)));
    return {phase:uploading?'upload':'extraction',value,status:uploading?(value===0?'Waiting to upload':'Uploading & Extracting data'):value===100?'Uploaded':'Uploading & Extracting data',complete:!uploading&&value===100};
  }
  const transferLabel=item=>item.complete?badge(item.status,'success category-badge'):`<span class="caption">${esc(item.status)}</span>`;
  function uploadingFiles(){
    return `<section class="card" aria-label="Uploading and extracting documents">${batchFiles().map((name,index)=>{const item=transferState(index);return `<div class="file-row">${icon('file')}<div class="stack grow"><strong>${esc(name)}</strong><div class="transfer-meta"><span data-transfer-status data-status="${item.status}">${transferLabel(item)}</span><span data-transfer-percent ${item.complete?'hidden':''}>${item.complete?'':`${item.value}%`}</span></div><div class="transfer-track" ${item.complete?'hidden':''} data-phase="${item.phase}" role="progressbar" aria-label="${item.phase==='upload'?'Upload':'Extraction'} progress for ${esc(name)}" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${item.value}"><span class="transfer-fill" style="transform:scaleX(${item.value/100})"></span></div></div></div>`}).join('')}</section>`;
  }
  function updateTransfer(){
    document.querySelectorAll('.transfer-track').forEach((bar,index)=>{
      const item=transferState(index);
      bar.hidden=item.complete;
      bar.setAttribute('aria-valuenow',item.value);
      bar.setAttribute('aria-label',`${item.phase==='upload'?'Upload':'Extraction'} progress for ${batchFiles()[index]}`);
      if(bar.dataset.phase!==item.phase){
        // A new phase starts its own bar; do not animate an upload bar backwards.
        bar.dataset.phase=item.phase;
        bar.innerHTML=`<span class="transfer-fill" style="transform:scaleX(${item.value/100})"></span>`;
      }else bar.querySelector('.transfer-fill').style.transform=`scaleX(${item.value/100})`;
      const percentage=bar.parentElement.querySelector('[data-transfer-percent]');
      percentage.textContent=item.complete?'':`${item.value}%`;percentage.hidden=item.complete;
      const label=bar.parentElement.querySelector('[data-transfer-status]');
      if(label.dataset.status!==item.status){label.dataset.status=item.status;label.innerHTML=transferLabel(item)}
    });
  }
  function outcomes(){
    const names=batchFiles();
    if(state.stage<2)return uploadingFiles();
    if(state.scenario==='uploadFailed')return `<section class="card"><h2>Files not saved</h2>${names.map(n=>fileRow(n,'Not saved','','danger')).join('')}</section>`;
    const existing=documents=>`<section class="card upload-file-card">${policyGroup('Citizens personal umbrella policy','Existing policy · ••8389',documents,'umbrella',true)}</section>`;
    const discarded=()=>discardedNames().length?`<section class="card upload-file-card" aria-label="Discarded documents">${discardedNames().map(n=>taggedDocument(n,['Discarded'],'Duplicate copy · Existing file kept.')).join('')}</section>`:'';
    const nonPolicy=documents=>`<section class="card upload-file-card" aria-label="Non-policy documents">${documents.map(n=>taggedDocument(n,['Non-policy'],'Saved in My Files · No insights generated.')).join('')}</section>`;
    const standalone=documents=>`<section class="card upload-file-card">${policyGroup('Auto policy','Not grouped with another policy',documents,'standalone',false)}</section>`;
    if(state.scenario==='duplicate')return discarded();
    if(state.scenario==='existingOnly')return existing(names);
    if(state.scenario==='standalone')return standalone(names);
    if(state.custom)return `<section class="card"><h2>Saved documents</h2>${effectiveFiles().map(n=>fileRow(n,'Not classified','Document classification isn’t available for local files in this preview.')).join('')}</section>`;
    if(state.scenario==='unmatched')return nonPolicy(names);
    const newPolicy=`<section class="card upload-file-card">${policyGroup('Citizens condo policy','New policy · ••4218',state.scenario==='inbox'?[names[0]]:[names[2],...(names[5]?[names[5]]:[])],'condo',false)}</section>`;
    if(state.scenario==='inbox')return newPolicy+`<section class="card upload-file-card" aria-label="Discarded documents">${taggedDocument(names[1],['Non-policy','Discarded'],'Quote summaries sent by email aren’t added to My Files.')}</section>`;
    return newPolicy+existing(names.slice(0,2))+standalone([names[6]])+nonPolicy([names[3]])+discarded();
  }
  function progress(){
    if(terminal()&&!successfulCompletion())return '';
    const description=state.stage===0?'Each document is uploaded and its data is extracted.':'Generating insights for policy documents and updating existing policies.';
    return `<section class="current-progress" aria-label="Upload progress"><p class="muted">${description}</p></section>`;
  }
  function detail(){
    header.innerHTML=headerHtml(title(),'files',true);
    main.innerHTML=`${terminal()&&!successfulCompletion()?`<section class="hero"><p>${summary()}</p></section>`:''}${progress()}${outcomes()}${terminal()&&state.scenario==='uploadFailed'?'<button class="button" data-go="upload">Upload again</button>':''}`;
  }
  function upload(){header.innerHTML=headerHtml('Upload files');main.innerHTML=`<section class="card"><div class="icon-box">${icon('upload')}</div><h2 style="margin-top:16px">Add your documents</h2><p class="secondary">Ovie will check your files, organize them by policy, and generate insights where available.</p><label for="picker" class="text-action" style="margin-top:12px">Select files</label><input class="file-select" id="picker" type="file" accept=".pdf,.png,.jpg,.jpeg" multiple><p class="caption">PDF, PNG or JPG · Up to 10 files<br>25 MiB per file · 100 MiB per batch</p><p id="validation" class="error-copy" role="alert"></p><div id="selected"></div><button class="button" id="submit-files" style="margin-top:16px" disabled>Upload files</button></section><div class="notice">${icon('info')}<p>Photos in the same upload are combined into one PDF, in selection order.</p></div>${linkRow('Use your Ovie Inbox','Send documents by email','inbox-info','mail')}`;
    let selected=[];document.querySelector('#picker').addEventListener('change',e=>{selected=[...e.target.files];let error=selected.length>10?'Choose up to 10 files.':selected.some(f=>!/^.+\.(pdf|png|jpe?g)$/i.test(f.name))?'Choose PDF, PNG or JPG files.':selected.some(f=>!f.size)?'Remove empty files.':selected.some(f=>f.size>26214400)?'Each file must be 25 MiB or smaller.':selected.reduce((sum,f)=>sum+f.size,0)>104857600?'The batch must be 100 MiB or smaller.':'';document.querySelector('#validation').textContent=error;document.querySelector('#submit-files').disabled=!!error||!selected.length;document.querySelector('#selected').innerHTML=selected.map(f=>fileRow(f.name,'Selected')).join('')});document.querySelector('#submit-files').onclick=()=>{state=sample();state.stage=0;state.uploadProgress=0;state.custom=selected.map(f=>f.name);state.insightPolicies=[];state.playing=true;state.tick=Date.now();save();go('detail')};}
  function policy(id){const names=id==='umbrella'?['Personal umbrella declarations.pdf','Personal umbrella policy form.pdf',...(state.stage>=3&&state.scenario!=='uploadFailed'?['Umbrella amendment.pdf','Umbrella schedule.pdf']:[])]:id==='standalone'?['Auto policy.pdf']:id==='condo'?['Condo declarations.pdf',...(state.scenario!=='inbox'&&state.stage>=3?['Condo policy form.pdf']:[])]:state.custom?effectiveFiles():['Home inventory.pdf'];header.innerHTML=headerHtml('Policy documents',previous==='detail'?'detail':'files');main.innerHTML=`<section class="card"><h2>${id==='umbrella'?'Citizens personal umbrella policy':id==='condo'?'Citizens condo policy':id==='standalone'?'Auto policy':'Non-policy documents'}</h2><p class="caption" style="margin-bottom:16px">${id==='standalone'?'Standalone policy document':id==='other'?'Non-policy':`Policy ••${id==='umbrella'?'8389':'4218'}`}</p>${names.map(n=>fileRow(n,'Saved','','success')).join('')}</section><button class="button secondary-button" data-go="detail">Return to upload details</button>`}
  function standaloneInsights(){header.innerHTML=headerHtml('Auto policy insights','detail');main.innerHTML=`<section class="card"><h2>Standalone policy</h2><p class="secondary">Auto policy.pdf</p><div class="policy-insight-status">${badge('Insights generated','success')}</div><p class="muted">This policy document has its own insights, even though it isn’t grouped with another policy.</p><button class="text-action" data-go="policy/standalone">View document ${icon('chevron')}</button></section>`}
  function inboxInfo(){header.innerHTML=headerHtml('My Ovie Inbox','upload');main.innerHTML=`<section class="card"><h2>Upload by email</h2><p class="secondary">Send your documents to the Ovie Inbox address in your profile. Ovie will process them automatically.</p><p class="muted" style="margin-top:12px">You can share that address with someone sending documents on your behalf.</p></section><div class="notice">${icon('info')}<p>Tap Upload in the bottom navigation to follow your upload’s progress. Email files classified as non-insurance are skipped.</p></div><button class="button" data-go="detail">View upload progress</button>`}
  function render(focus=false){let route=location.hash.slice(1)||'files';if(route==='files'){location.replace(returnPage);return}if(route==='activity'){route='detail';history.replaceState(null,'',location.pathname+location.search+'#detail')}nav.hidden=route!=='files';main.className=route==='files'?'with-nav':'';if(route==='files')files();else if(route==='detail')detail();else if(route==='upload')upload();else if(route==='standalone-insights')standaloneInsights();else if(route.startsWith('policy/'))policy(route.split('/')[1]);else inboxInfo();document.querySelector('#advance').disabled=terminal();document.querySelector('#advance').textContent=state.stage===3?'Complete next policy':'Next stage';document.querySelector('#play').disabled=terminal();document.querySelector('#play').textContent=state.playing?'Pause preview':'Play process';document.querySelectorAll('[name=scenario]').forEach(r=>r.checked=r.value===state.scenario);window.dispatchEvent(new Event('ovie-upload-preview-changed'));if(focus){if(restoreIndicator){document.querySelector('[data-upload-entry]')?.focus();restoreIndicator=false}else (header.querySelector('h1')||main.querySelector('h1'))?.focus({preventScroll:true})}}
  function go(route){if(route==='activity')route='detail';if(route==='files'&&returnPage){try{sessionStorage.setItem('ovie.upload.return-focus','1')}catch{}location.href=returnPage;return}previous=location.hash.slice(1)||'files';restoreIndicator=route==='files';if(location.hash==='#'+route)render(true);else location.hash=route}
  document.addEventListener('toggle',e=>{const folder=e.target;if(!folder.matches?.('[data-policy-folder]')||!folder.isConnected)return;const key=folder.dataset.policyFolder;if(folder.open)expandedPolicyFolders.add(key);else expandedPolicyFolders.delete(key)},true);
  document.addEventListener('click',e=>{const b=e.target.closest('[data-go]');if(b)go(b.dataset.go)});
  window.addEventListener('hashchange',()=>{render(true);window.scrollTo({top:document.querySelector('.app-shell').offsetTop,behavior:'instant'})});
  document.querySelector('#scenarios').innerHTML=scenarios.map(([id,name])=>`<label><input type="radio" name="scenario" value="${id}">${name}</label>`).join('');
  function selectPreview(scenario){
    state=sample();state.scenario=scenario;
    state.stage={uploading:0,generating:3,partial:3,existingOnly:3,standalone:3,regenerationFailed:4}[scenario]??4;
    state.insightPolicies=insightPolicies();
    if(state.stage===4)state.readyPolicies=state.insightPolicies.filter(policy=>!policyWillFail(policy));
    if(scenario==='partial')state.readyPolicies=['condo'];
    save();render();if(!successfulCompletion())document.querySelector('#announcer').textContent=state.stage===3?`${state.readyPolicies.length} of ${state.insightPolicies.length} policy insights generated.`:title();
  }
  document.querySelector('#scenarios').addEventListener('change',e=>selectPreview(e.target.value));
  function advance(){
    if(terminal())return;
    if(state.stage===0){state.uploadProgress=100;state.stage=noInsights()?4:3}
    else{const next=state.insightPolicies.find(policy=>!state.readyPolicies.includes(policy)&&!policyWillFail(policy));if(next)state.readyPolicies.push(next);if(state.insightPolicies.every(policy=>state.readyPolicies.includes(policy)||policyWillFail(policy)))state.stage=4}
    state.insightPolicies=insightPolicies();
    if(terminal())state.playing=false;
    state.tick=Date.now();save();if(location.hash!=='#upload')render();if(!successfulCompletion())document.querySelector('#announcer').textContent=state.stage===3?`${state.readyPolicies.length} of ${state.insightPolicies.length} policy insights generated.`:title();
  }
  document.querySelector('#advance').onclick=advance;
  document.querySelector('#play').onclick=()=>{state.playing=!state.playing;state.tick=Date.now()-(state.stage===0?(state.uploadProgress??32.5)*120:0);save();render()};
  document.querySelector('#reset').onclick=()=>{state=sample();save();go('files');render()};
  setInterval(()=>{if(!state.playing)return;if(state.stage===0){state.uploadProgress=Math.min(100,Math.round((Date.now()-state.tick)/120));save();updateTransfer()}if(Date.now()-state.tick>=(state.stage===0?12000:6000))advance()},1000);
  // Resume older previews without stopping for the removed duplicate decision.
  if(state.scenario==='duplicateReview')state.scenario='generating';
  if(state.stage===1){state.stage=noInsights()?4:3;state.tick=Date.now()}
  delete state.duplicateChoices;delete state.resumeAfterReview;
  state.insightPolicies=insightPolicies();
  const requestedPreview=new URLSearchParams(location.search).get('preview');
  const previewStage=['organizing','duplicateReview'].includes(requestedPreview)?'generating':requestedPreview;
  if(scenarios.some(([id])=>id===previewStage))selectPreview(previewStage);else{save();render()}
})();
