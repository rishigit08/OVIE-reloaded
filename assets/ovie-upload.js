(() => {
  'use strict';
  const flow = window.OvieUploadFlow;
  const KEY = 'ovie.upload.design-preview.v1';
  document.querySelector('#preview-options').open=window.matchMedia('(min-width:1051px)').matches;
  const icons = {
    eye:'<path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0"/><circle cx="12" cy="12" r="3"/>',
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
  const sample=()=>({flowVersion:5,batchId:Date.now().toString(36)+Math.random().toString(36).slice(2),readyPolicies:[],insightPolicies:['condo','umbrella','standalone'],scenario:'reading',stage:3,elapsed:0,playing:true,tick:Date.now(),seen:false,custom:null});
  let state;try{state=JSON.parse(localStorage.getItem(KEY))}catch{}if(!state || ![4,5].includes(state.flowVersion) || !Number.isInteger(state.stage))state=sample();
  flow.migrate(state); flow.sync(state);
  const expandedPolicyFolders=new Set();
  const save=()=>{try{localStorage.setItem(KEY,JSON.stringify(state))}catch{}};
  const scenarios=[['reading','Extracting and Reading Data'],['generating','Generating insights'],['partial','Some insights generated'],['failed','Insights failed'],['uploadFailed','Processing failed']];
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
  const title=()=>'Upload & Generate Insights';
  const summary=()=>state.scenario==='uploadFailed'?'These files weren’t saved. You can upload them again.':state.scenario==='failed'?'Your umbrella insights are updated and your standalone policy insights are ready. Insights for the new condo policy couldn’t be generated.':state.scenario==='regenerationFailed'?'Your new and standalone policy insights are ready. Umbrella insights couldn’t be updated; the previous insights remain available.':state.scenario==='existingOnly'?'Your documents were added and the policy insights are updated.':state.scenario==='standalone'?'Insights are ready for your standalone policy document.':state.scenario==='duplicate'?'Duplicate copies were discarded. Your existing documents and insights are unchanged.':noInsights()?'Your files are saved in My Files. No policy insights were generated.':state.scenario==='inbox'?'Your condo policy insights are ready. The non-policy quote summary was discarded.':'Insights are ready for your new and standalone policies, and updated for your existing policy.';
  const duplicateNames=()=>state.custom||['inbox','unmatched','uploadFailed','existingOnly','standalone'].includes(state.scenario)?[]:state.scenario==='duplicate'?batchFiles():[batchFiles()[4]];
  const discardedNames=()=>duplicateNames();
  const insightPolicies=()=>noInsights()||state.scenario==='uploadFailed'?[]:state.scenario==='existingOnly'||state.scenario==='duplicate'?['umbrella']:state.scenario==='standalone'?['standalone']:state.scenario==='inbox'?['condo']:['condo','umbrella','standalone'];
  const policyWillFail=policy=>(state.scenario==='failed'&&policy==='condo')||(state.scenario==='regenerationFailed'&&policy==='umbrella');
  const successfulCompletion=()=>terminal()&&!failure()&&state.insightPolicies.length>0;
  const linkRow=(name,sub,target,kind='folder')=>`<button class="destination" data-go="${target}"><span class="icon-box">${icon(kind)}</span><span class="stack grow"><strong>${name}</strong><span class="caption">${sub}</span></span>${icon('chevron')}</button>`;
  function headerHtml(name,back='files',isDetail=false){return `<button class="icon-button clear ${isDetail?'strong-icon':''}" data-go="${back}" aria-label="Back">${icon('back')}</button><div class="header-heading"><h1 tabindex="-1">${name}</h1></div>${isDetail?`<button class="icon-button clear cancel-action strong-icon" data-go="files" aria-label="Cancel">${icon('x')}</button>`:''}`}
  function navHtml(){return `<a href="ovie_homepage.html">${icon('home')}Home</a><button aria-current="page" data-go="files">${icon('folder')}My Files</button><button class="upload" data-upload-entry data-go="detail" aria-label="Upload files">${icon('upload')}</button><a href="Insights.html">${icon('brain')}Insights</a><a href="ovie_homepage.html#access">${icon('users')}Access</a>`}
  function files(){header.innerHTML=`<h1 tabindex="-1">My Files</h1>`;main.innerHTML=`<div class="destinations">${linkRow('Citizens personal umbrella policy','Umbrella · Policy ••8389','policy/umbrella')}${linkRow('Citizens condo policy','Condo · Policy ••4218','policy/condo')}${linkRow('Non-policy documents','Documents not linked to a policy','policy/other')}</div><p class="section-caption caption">Documents sent to your Ovie Inbox appear here after processing.</p>`;nav.innerHTML=navHtml()}
  function fileRow(name,status,description,kind=''){return `<div class="file-row">${icon('file')}<div class="stack grow"><strong>${esc(name)}</strong>${description?`<span class="caption">${esc(description)}</span>`:''}${status?badge(status,kind):''}</div></div>`}
  function policyGroup(name,meta,files,policy,added){
    const failed=terminal()&&((state.scenario==='failed'&&policy==='condo')||(state.scenario==='regenerationFailed'&&added));
    const ready=state.readyPolicies.includes(policy);
    const process=flow.item(state,policy);
    const label=process.label;
    const category=policy==='local'?'Not classified':added?'Existing policy':'New policy';
    const context=policy==='local'?`${files.length} ${files.length===1?'document':'documents'}`:`${policy==='standalone'?'Policy number unavailable':`Policy ${meta.split(' · ').pop()}`} · ${files.length} ${files.length===1?'document':'documents'}`;
    return `<section class="upload-policy-item" data-processing-policy="${policy}"><details class="upload-policy-folder" data-policy-folder="${state.batchId}:${policy}" ${expandedPolicyFolders.has(`${state.batchId}:${policy}`)?'open':''}><summary class="upload-policy-heading"><span class="icon-box">${icon(policy==='umbrella'?'umbrella':policy==='standalone'?'car':policy==='condo'?'building2':'folder')}</span><div class="stack grow"><div class="upload-title-line"><h2>${name}</h2></div><span class="caption">${context}</span>${badge(category,'category-badge')}</div><span class="policy-folder-chevron">${icon('chevron')}</span></summary><div class="upload-policy-documents">${files.map((n,index)=>documentRow(n,policy,index,process.preview)).join('')}</div></details><div class="upload-policy-footer">${!process.complete&&!process.failed?`<div class="policy-progress" role="progressbar" aria-label="${esc(name)} progress" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${process.progress}" aria-valuetext="${esc(label)}"><span style="transform:scaleX(${process.progress/100})"></span></div>`:''}<div class="policy-insight-status">${process.complete||failed?badge(label,process.complete?'success':'danger'):`<span class="caption insight-processing-text">${esc(label)}${dots()}</span>`}${failed&&added?'<p class="caption">Your documents are saved. Previous insights remain available.</p>':''}</div>${ready?policy==='standalone'?'<button class="text-action" data-go="standalone-insights">View insights '+icon('chevron')+'</button>':`<a class="text-action" href="ovie_${policy==='umbrella'?'umbrella':'condo'}_insights.html">View insights ${icon('chevron')}</a>`:''}</div></section>`;
  }
  function taggedDocument(name,tags,description){return `<div class="upload-document-row ungrouped-document"><span class="upload-document-icon">${icon('file')}</span><div class="stack grow"><div class="upload-title-line"><strong>${esc(name)}</strong></div><span class="caption">${esc(description)}</span><div class="upload-tag-row">${tags.map(tag=>badge(tag,tag==='Discarded'?'danger category-badge':'category-badge')).join('')}</div></div></div>`}
  function documentRow(name,policy,index,available){return `<div class="upload-document-row"><span class="upload-document-icon">${icon('file')}</span><div class="stack grow"><strong>${esc(name)}</strong></div><button class="icon-button clear document-preview-button" data-preview-policy="${policy}" data-preview-index="${index}" data-preview-name="${esc(name)}" aria-label="Preview ${esc(name)}" ${available?'':'hidden'}>${icon('eye')}</button></div>`}
  let previewDialog,previewUrl,previewOpener,previewRequest=0;
  async function previewDocument(button){
    if(!previewDialog){
      previewDialog=document.createElement('dialog');previewDialog.className='document-preview';
      previewDialog.setAttribute('aria-labelledby','document-preview-title');
      previewDialog.innerHTML=`<div class="document-preview-heading"><h2 id="document-preview-title"></h2><button class="icon-button clear" aria-label="Close document preview">${icon('x')}</button></div><div class="document-preview-body"></div>`;
      document.body.append(previewDialog);
      previewDialog.querySelector('button').onclick=()=>previewDialog.close();
      previewDialog.addEventListener('close',()=>{previewRequest++;if(previewUrl)URL.revokeObjectURL(previewUrl);previewUrl=null;previewDialog.querySelector('.document-preview-body').replaceChildren();if(previewOpener){const target=[...main.querySelectorAll('[data-preview-name]')].find(b=>b.dataset.previewPolicy===previewOpener.policy&&b.dataset.previewIndex===previewOpener.index);target?.focus({preventScroll:true})}});
    }
    previewOpener={policy:button.dataset.previewPolicy,index:button.dataset.previewIndex};
    const request=++previewRequest,body=previewDialog.querySelector('.document-preview-body');
    previewDialog.querySelector('h2').textContent=button.dataset.previewName;
    body.textContent='Opening document…';previewDialog.showModal();
    if(!state.custom){body.innerHTML='<div class="document-preview-placeholder"><p class="pill category-badge">Demo document</p><p>This filename is part of the sample upload. Choose a PDF or image from your device to preview the original document here.</p></div>';return}
    try{
      const file=await flow.readFile(state.batchId,Number(button.dataset.previewIndex));
      if(request!==previewRequest||!previewDialog.open)return;
      if(!file)throw new Error('missing');
      previewUrl=URL.createObjectURL(file);body.replaceChildren();
      const image=/\.(png|jpe?g)$/i.test(file.name), viewer=document.createElement(image?'img':'object');
      if(image){viewer.src=previewUrl;viewer.alt=file.name}else{viewer.data=previewUrl;viewer.type='application/pdf';viewer.setAttribute('aria-label',file.name)}
      body.append(viewer);
      const link=document.createElement('a');link.className='text-action';link.href=previewUrl;link.target='_blank';link.rel='noopener';link.textContent='Open original document';body.append(link);
    }catch{body.textContent='The original file is no longer available in this browser. Choose the document again to preview it.'}
  }
  document.addEventListener('click',event=>{const button=event.target.closest('[data-preview-name]');if(button)previewDocument(button)});
  function updateProcessing(){
    const before=document.querySelector('[data-processing-policy]')?.dataset.phaseSignature;
    const signature=JSON.stringify([state.stage,...[...state.insightPolicies,'local'].map(id=>flow.item(state,id).label)]);
    if(before!==signature){
      const active=document.activeElement,folder=active?.closest('[data-policy-folder]')?.dataset.policyFolder;
      const preview=active?.dataset.previewName;
      render();
      if(preview)[...main.querySelectorAll('[data-preview-name]')].find(b=>b.dataset.previewName===preview)?.focus({preventScroll:true});
      else if(folder)[...main.querySelectorAll('[data-policy-folder]')].find(f=>f.dataset.policyFolder===folder)?.querySelector('summary').focus({preventScroll:true});
      document.querySelector('[data-processing-policy]')?.setAttribute('data-phase-signature',signature);
      document.querySelector('#announcer').textContent=state.stage===4?'Processing complete.':flow.elapsed(state)<6000?'Extracting and Reading Data.':'Generating Insights. Document previews are available.';
    }
    main.querySelectorAll('[data-processing-policy]').forEach(card=>{
      const process=flow.item(state,card.dataset.processingPolicy),bar=card.querySelector('.policy-progress');
      if(bar){bar.setAttribute('aria-valuenow',process.progress);bar.querySelector('span').style.transform=`scaleX(${process.progress/100})`}
    });
  }
  function outcomes(){
    const names=batchFiles();
    if(state.scenario==='uploadFailed')return `<section class="card"><h2>Files not saved</h2>${names.map(n=>fileRow(n,'Not saved','','danger')).join('')}</section>`;
    const existing=documents=>`<section class="card upload-file-card">${policyGroup('Citizens personal umbrella policy','Existing policy · ••8389',documents,'umbrella',true)}</section>`;
    const discarded=()=>discardedNames().length?`<section class="card upload-file-card" aria-label="Discarded documents">${discardedNames().map(n=>taggedDocument(n,['Discarded'],'Duplicate copy · Existing file kept.')).join('')}</section>`:'';
    const nonPolicy=documents=>`<section class="card upload-file-card" aria-label="Non-policy documents">${documents.map(n=>taggedDocument(n,['Non-policy'],'Saved in My Files · No insights generated.')).join('')}</section>`;
    const standalone=documents=>`<section class="card upload-file-card">${policyGroup('Auto policy','Not grouped with another policy',documents,'standalone',false)}</section>`;
    if(state.scenario==='duplicate')return discarded();
    if(state.scenario==='existingOnly')return existing(names);
    if(state.scenario==='standalone')return standalone(names);
    if(state.custom)return `<section class="card upload-file-card">${policyGroup('Uploaded documents','',state.custom,'local',false)}<p class="local-document-note caption">Document classification and insight generation aren’t available for local files in this preview.</p></section>`;
    if(state.scenario==='unmatched')return nonPolicy(names);
    const newPolicy=`<section class="card upload-file-card">${policyGroup('Citizens condo policy','New policy · ••4218',state.scenario==='inbox'?[names[0]]:[names[2],...(names[5]?[names[5]]:[])],'condo',false)}</section>`;
    if(state.scenario==='inbox')return newPolicy+`<section class="card upload-file-card" aria-label="Discarded documents">${taggedDocument(names[1],['Non-policy','Discarded'],'Quote summaries sent by email aren’t added to My Files.')}</section>`;
    return newPolicy+existing(names.slice(0,2))+standalone([names[6]])+nonPolicy([names[3]])+discarded();
  }
  function progress(){
    if(terminal()&&!successfulCompletion())return '';
    const description='Reading your policy documents and generating insights.';
    return `<section class="current-progress" aria-label="Upload progress"><p class="muted">${description}</p></section>`;
  }
  function detail(){
    header.innerHTML=headerHtml(title(),'files',true);
    main.innerHTML=`${terminal()&&!successfulCompletion()?`<section class="hero"><p>${summary()}</p></section>`:''}${progress()}${outcomes()}${terminal()&&state.scenario==='uploadFailed'?'<button class="button" data-go="upload">Upload again</button>':''}`;
  }
  function upload(){header.innerHTML=headerHtml('Upload files');main.innerHTML=`<section class="card"><div class="icon-box">${icon('upload')}</div><h2 style="margin-top:16px">Add your documents</h2><p class="secondary">Ovie will check your files, organize them by policy, and generate insights where available.</p><button type="button" class="text-action" data-upload-options style="margin-top:12px">Upload options</button><label for="picker" class="text-action" style="margin-top:12px">Select files</label><input class="file-select" id="picker" type="file" accept=".pdf,.png,.jpg,.jpeg" multiple><p class="caption">PDF, PNG or JPG · Up to 10 files<br>25 MiB per file · 100 MiB per batch</p><p id="validation" class="error-copy" role="alert"></p><div id="selected"></div><button class="button" id="submit-files" style="margin-top:16px" disabled>Upload files</button></section><div class="notice">${icon('info')}<p>Your original documents are available to preview once reading finishes.</p></div>${linkRow('Use your Ovie Inbox','Send documents by email','inbox-info','mail')}`;
    let selected=[];document.querySelector('#picker').addEventListener('change',e=>{selected=[...e.target.files];let error=selected.length>10?'Choose up to 10 files.':selected.some(f=>!/^.+\.(pdf|png|jpe?g)$/i.test(f.name))?'Choose PDF, PNG or JPG files.':selected.some(f=>!f.size)?'Remove empty files.':selected.some(f=>f.size>26214400)?'Each file must be 25 MiB or smaller.':selected.reduce((sum,f)=>sum+f.size,0)>104857600?'The batch must be 100 MiB or smaller.':'';document.querySelector('#validation').textContent=error;document.querySelector('#submit-files').disabled=!!error||!selected.length;document.querySelector('#selected').innerHTML=selected.map(f=>fileRow(f.name,'Selected')).join('')});document.querySelector('#submit-files').onclick=async()=>{document.querySelector('#submit-files').disabled=true;state=sample();state.custom=selected.map(f=>f.name);state.insightPolicies=[];state.playing=true;state.tick=Date.now();try{await flow.storeFiles(state.batchId,selected);save();go('detail')}catch{document.querySelector('#validation').textContent='This browser could not save these documents. Please try again.';document.querySelector('#submit-files').disabled=false}};}
  function policy(id){const names=id==='umbrella'?['Personal umbrella declarations.pdf','Personal umbrella policy form.pdf',...(state.stage>=3&&state.scenario!=='uploadFailed'?['Umbrella amendment.pdf','Umbrella schedule.pdf']:[])]:id==='standalone'?['Auto policy.pdf']:id==='condo'?['Condo declarations.pdf',...(state.scenario!=='inbox'&&state.stage>=3?['Condo policy form.pdf']:[])]:state.custom?effectiveFiles():['Home inventory.pdf'];header.innerHTML=headerHtml('Policy documents',previous==='detail'?'detail':'files');main.innerHTML=`<section class="card"><h2>${id==='umbrella'?'Citizens personal umbrella policy':id==='condo'?'Citizens condo policy':id==='standalone'?'Auto policy':'Non-policy documents'}</h2><p class="caption" style="margin-bottom:16px">${id==='standalone'?'Standalone policy document':id==='other'?'Non-policy':`Policy ••${id==='umbrella'?'8389':'4218'}`}</p>${names.map(n=>fileRow(n,'Saved','','success')).join('')}</section><button class="button secondary-button" data-go="detail">Return to upload details</button>`}
  function standaloneInsights(){header.innerHTML=headerHtml('Auto policy insights','detail');main.innerHTML=`<section class="card"><h2>Standalone policy</h2><p class="secondary">Auto policy.pdf</p><div class="policy-insight-status">${badge('Insights generated','success')}</div><p class="muted">This policy document has its own insights, even though it isn’t grouped with another policy.</p><button class="text-action" data-go="policy/standalone">View document ${icon('chevron')}</button></section>`}
  function inboxInfo(){header.innerHTML=headerHtml('My Ovie Inbox','upload');main.innerHTML=`<section class="card"><h2>Upload by email</h2><p class="secondary">Send your documents to the Ovie Inbox address in your profile. Ovie will process them automatically.</p><p class="muted" style="margin-top:12px">You can share that address with someone sending documents on your behalf.</p></section><div class="notice">${icon('info')}<p>Tap Upload in the bottom navigation to follow your upload’s progress. Email files classified as non-insurance are skipped.</p></div><button class="button" data-go="detail">View upload progress</button>`}
  function render(focus=false){let route=location.hash.slice(1)||'files';if(route==='files'){location.replace(returnPage);return}if(route==='activity'){route='detail';history.replaceState(null,'',location.pathname+location.search+'#detail')}nav.hidden=route!=='files';main.className=route==='files'?'with-nav':'';if(route==='files')files();else if(route==='detail')detail();else if(route==='upload')upload();else if(route==='standalone-insights')standaloneInsights();else if(route.startsWith('policy/'))policy(route.split('/')[1]);else inboxInfo();document.querySelector('#advance').disabled=terminal();document.querySelector('#advance').textContent=flow.elapsed(state)<6000?'Finish reading data':'Complete next policy';document.querySelector('#play').disabled=terminal();document.querySelector('#play').textContent=state.playing?'Pause preview':'Play process';document.querySelectorAll('[name=scenario]').forEach(r=>r.checked=r.value===state.scenario);window.dispatchEvent(new Event('ovie-upload-preview-changed'));if(focus){if(restoreIndicator){document.querySelector('[data-upload-entry]')?.focus();restoreIndicator=false}else (header.querySelector('h1')||main.querySelector('h1'))?.focus({preventScroll:true})}}
  function go(route){if(route==='activity')route='detail';if(route==='files'&&returnPage){try{sessionStorage.setItem('ovie.upload.return-focus','1')}catch{}location.href=returnPage;return}previous=location.hash.slice(1)||'files';restoreIndicator=route==='files';if(location.hash==='#'+route)render(true);else location.hash=route}
  document.addEventListener('toggle',e=>{const folder=e.target;if(!folder.matches?.('[data-policy-folder]')||!folder.isConnected)return;const key=folder.dataset.policyFolder;if(folder.open)expandedPolicyFolders.add(key);else expandedPolicyFolders.delete(key)},true);
  document.addEventListener('click',e=>{const b=e.target.closest('[data-go]');if(b)go(b.dataset.go)});
  window.addEventListener('hashchange',()=>{render(true);window.scrollTo({top:document.querySelector('.app-shell').offsetTop,behavior:'instant'})});
  document.querySelector('#scenarios').innerHTML=scenarios.map(([id,name])=>`<label><input type="radio" name="scenario" value="${id}">${name}</label>`).join('');
  function selectPreview(scenario){
    state=sample();state.scenario=scenario;state.playing=false;
    state.elapsed={reading:0,generating:7000,partial:12000}[scenario]??20000;
    state.insightPolicies=insightPolicies();flow.sync(state);
    save();render();document.querySelector('#announcer').textContent=flow.elapsed(state)<6000?'Extracting and Reading Data.':'Generating Insights.';
  }
  document.querySelector('#scenarios').addEventListener('change',e=>selectPreview(e.target.value));
  function advance(){
    if(terminal())return;
    const elapsed=flow.elapsed(state),next=[6000,...state.insightPolicies.map(flow.duration)].sort((a,b)=>a-b).find(time=>time>elapsed);
    state.elapsed=next??20000;state.tick=Date.now();flow.sync(state);save();updateProcessing();
  }
  document.querySelector('#advance').onclick=advance;
  document.querySelector('#play').onclick=()=>{state.elapsed=flow.elapsed(state);state.playing=!state.playing;state.tick=Date.now();save();render()};
  document.querySelector('#reset').onclick=()=>{state=sample();save();go('files');render()};
  setInterval(()=>{if(!state.playing)return;flow.sync(state);save();if(location.hash==='#detail')updateProcessing();window.dispatchEvent(new Event('ovie-upload-preview-changed'))},250);
  window.addEventListener('storage',event=>{if(event.key!==KEY)return;try{const latest=JSON.parse(event.newValue);if(latest){state=latest;flow.migrate(state);flow.sync(state);render()}}catch{}});
  state.insightPolicies=insightPolicies();
  const requestedPreview=new URLSearchParams(location.search).get('preview');
  const previewStage=requestedPreview==='uploading'?'reading':['organizing','duplicateReview'].includes(requestedPreview)?'generating':requestedPreview;
  if(scenarios.some(([id])=>id===previewStage))selectPreview(previewStage);else{save();render()}
})();
