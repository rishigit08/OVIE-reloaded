/* Local sharing review. Never uploads, sends email, or claims to generate a secure link. */
(() => {
 const {node,action,openDialog,utilitySheet,phone}=window.paUI;
 let origin,page,selection,previewPayload;
 const disclaimer='Educational summary only. This is not a certificate of insurance (COI), certification of coverage, or proof of insurance. Review coverage questions with your insurance professional.';
 function snapshot(){
   const vehicles=personalPolicy.vehicles.filter(v=>!selection.hiddenVehicles.has(v.id));
   // Whitelist the reviewed fields. Never serialize the original model, source excerpts or document URLs.
   return {
     policy:{carrier:personalPolicy.carrier,title:personalPolicy.title,form:personalPolicy.form,number:personalPolicy.number,insured:personalPolicy.insured,period:'Dec 10, 2022, 12:01 a.m. EST – Jun 10, 2023, 12:01 a.m. EDT',term:personalPolicy.term},
     driver:{name:personalPolicy.insured,relationship:'Named insured · primary driver',...(selection.hideDob?{}:{dob:'**/**/1990 · already masked in source'}),...(selection.hideLicense?{}:{license:'Virginia · ******745 · already masked in source'})},
     vehicles:vehicles.map(v=>({name:v.name,vin:v.vin,use:v.use,lienholder:v.lienholder,premium:paMoney(paSubtotal(v)),coverages:v.coverages.map(c=>({title:c.title,limit:c.limit,deductible:c.deductible,premium:paMoney(c.premium),text:c.text,...(c.note?{note:c.note}:{})})),included:paIncluded(v).map(({title,text})=>({title,text})),excluded:paResolvedExclusions(v).map(({title,text})=>({title,text})),limitations:v.limitations.map(({title,text})=>({title,text})),watchPoints:paVehicleWatches(v).map(({severity,title,text})=>({severity,title,text}))})),
     watchPoints:personalPolicy.watchPoints.map(({severity,title,text})=>({severity,title,text})),
     scope:selection.hiddenVehicles.size?'Vehicle information has been omitted by the owner. This is a partial summary.':'Includes all vehicles in this reviewed document snapshot.',
     disclaimer
   };
 }
 window.personalAutoSnapshot=snapshot;
 function close(){page?.remove();page=null;phone.style.overflow='';document.getElementById('autoMain').inert=false;document.querySelector('.topbar').inert=false;document.getElementById('chatForm').hidden=false;origin?.focus({preventScroll:true});}
 function heading(subtitle='Send a secure, time-limited copy.'){
   const header=node('header','titlebar');const back=node('button','icon-button back-button');back.type='button';back.setAttribute('aria-label','Back to insights');back.innerHTML='<svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m12 19-7-7 7-7M5 12h14"/></svg>';back.onclick=close;
   const title=node('div');title.append(node('h1','','Share'),node('p','',subtitle));header.append(back,title);return header;
 }
 function showPage(){
   page=node('section','pa-share-page');page.setAttribute('aria-label','Share personal auto insights');page.tabIndex=-1;
   phone.append(page);phone.style.overflow='hidden';document.getElementById('autoMain').inert=true;document.querySelector('.topbar').inert=true;document.getElementById('chatForm').hidden=true;document.getElementById('toast').classList.remove('show');drawOptions();page.focus();
 }
 window.personalShare=trigger=>{
   origin=trigger;selection={hiddenVehicles:new Set(),hideDob:true,hideLicense:true};
   document.getElementById('utilityTitle').textContent='Share';
   document.getElementById('utilityBody').replaceChildren(node('p','source-context','This summary contains personal insurance information. Anyone you share it with may disclose it further. Your policy number and policyholder name will always remain visible. You can hide individual vehicles and driver details before sharing.'),node('p','source-context','By selecting “Confirm Sharing,” you acknowledge these privacy implications. You will review a preview before any sharing action.'),action('Confirm Sharing',()=>{utilitySheet.addEventListener('close',showPage,{once:true});utilitySheet.close();}));openDialog(utilitySheet,trigger);
 };
 function checkbox(label,checked,onchange){const row=node('label','pa-check-row');row.append(node('span','',label));const input=document.createElement('input');input.type='checkbox';input.checked=checked;input.onchange=()=>onchange(input.checked);row.append(input);return row;}
 function drawOptions(){
   page.replaceChildren(heading());const body=node('div','pa-share-body');page.append(body);
   const object=node('section','card card-pad');object.append(node('h2','','What you’re sharing'),node('strong','','Personal auto'),node('p','label',`Insights only · Based on policy ${personalPolicy.number}`));
   const masking=node('p','label','Driver date of birth and license details are hidden by default. Choose which vehicles to include. ');const manage=node('button','pa-text-button','Manage what’s shared');manage.type='button';manage.onclick=()=>{settings.open=true;settings.querySelector('input').focus();};masking.append(manage);object.append(masking);body.append(object);
   const settings=document.createElement('details');settings.className='card auto-disclosure';settings.open=true;const summary=document.createElement('summary');summary.innerHTML='<span>Manage what’s shared</span>'+paIcon('down');settings.append(summary);const options=node('div','auto-disclosure-body');settings.append(options);
   const locked=node('p','pa-lock-row');locked.innerHTML=paIcon('lock')+`<span><strong>Always included</strong><br>${paEscape(personalPolicy.insured)}<br>Policy ${paEscape(personalPolicy.number)}<br><span class="label">Policyholder name and policy number cannot be masked.</span></span>`;options.append(locked);
   const vehicles=document.createElement('fieldset');vehicles.append(node('legend','','Hide vehicles'));
   personalPolicy.vehicles.forEach(v=>vehicles.append(checkbox(v.name,selection.hiddenVehicles.has(v.id),checked=>{checked?selection.hiddenVehicles.add(v.id):selection.hiddenVehicles.delete(v.id);})));options.append(vehicles);
   options.append(checkbox('Hide date of birth',selection.hideDob,checked=>selection.hideDob=checked),checkbox('Hide driver’s license number',selection.hideLicense,checked=>selection.hideLicense=checked));body.append(settings);
   const delivery=node('section','card card-pad');delivery.append(node('h2','','Delivery'));const label=node('label','','Recipient email');label.htmlFor='recipientEmail';const input=document.createElement('input');input.id='recipientEmail';input.type='email';input.placeholder='name@example.com';input.autocomplete='email';delivery.append(label,input,node('p','evidence-note','Secure links and email delivery are not connected in this HTML preview. You can review and download the selected summary locally.'));
   const send=action('Share by email',()=>{});send.disabled=true;send.setAttribute('aria-describedby','deliveryStatus');const status=node('p','pa-sharing-notice','Email delivery requires a connected sharing service. Nothing will be sent from this preview.');status.id='deliveryStatus';delivery.append(send,status);body.append(delivery);
   const preview=action('Preview shared summary',()=>{previewPayload=snapshot();drawPreview();});body.append(preview);
 }
 function summaryDOM(payload){
   const content=node('article','pa-share-preview');content.append(node('h2','','Personal auto insights'),node('p','label',payload.scope));
   const fields=node('dl');for(const [key,value] of [['Carrier',payload.policy.carrier],['Policy',payload.policy.title+' · '+payload.policy.form],['Policy number',payload.policy.number],['Policyholder',payload.policy.insured],['Policy period',payload.policy.period]]){fields.append(node('dt','',key),node('dd','',value));}content.append(fields,node('h3','','Individuals covered'),node('p','',payload.driver.name+' · '+payload.driver.relationship));
   if(payload.driver.dob)content.append(node('p','label','Date of birth: '+payload.driver.dob));if(payload.driver.license)content.append(node('p','label','Driver’s license: '+payload.driver.license));
   for(const v of payload.vehicles){content.append(node('h3','',v.name),node('p','',`VIN ${v.vin}`),node('p','label','Use: '+v.use),node('p','label','Lienholder / loss payee: '+v.lienholder));const list=node('ul');v.coverages.forEach(c=>list.append(node('li','',`${c.title}: ${c.limit}. Deductible: ${c.deductible}. Premium: ${c.premium}. ${c.text}${c.note?' '+c.note:''}`)));content.append(list,node('p','',`Calculated vehicle premium: ${v.premium} · ${payload.policy.term}. Fees are separate.`));
     for(const [label,key] of [["What's included",'included'],["What's not included",'excluded'],['Coverage limitations','limitations'],['Coverage watch points','watchPoints']]){content.append(node('h3','',label));const items=node('ul');v[key].forEach(item=>items.append(node('li','',`${item.severity?item.severity+' · ':''}${item.title}: ${item.text}`)));content.append(items);}
   }
   content.append(node('h3','','Policy watch points'));const watch=node('ul');payload.watchPoints.forEach(w=>watch.append(node('li','',`${w.severity} · ${w.title}: ${w.text}`)));content.append(watch,node('p','pa-disclaimer',payload.disclaimer),node('p','pa-disclaimer','Historical document summary. Policy dates do not establish current or uninterrupted coverage. Source excerpts and original policy files are not included in this copy.'));return content;
 }
 function drawPreview(){
   page.replaceChildren(heading('Review exactly what is included.'));const body=node('div','pa-share-body');page.append(body);body.append(node('p','evidence-note','Owner preview · The recipient must acknowledge this is not a COI or certification of coverage before opening the summary.'),summaryDOM(previewPayload));
   body.append(action('Download reviewed preview',download),action('Preview recipient acknowledgement',drawRecipient,true),action('Edit what’s shared',drawOptions,true));page.scrollTop=0;page.focus();
 }
 function drawRecipient(){
   page.replaceChildren(heading('Recipient preview'));const body=node('div','pa-share-body');page.append(body);const cover=node('section','pa-recipient-cover');cover.append(node('h2','','Before you view these insights'),node('p','label',disclaimer));const view=action('View shared summary',()=>{body.replaceChildren(summaryDOM(previewPayload),action('Back to owner preview',drawPreview,true));page.scrollTop=0;page.focus();});view.disabled=true;cover.append(checkbox('I acknowledge this summary is not a COI or certification of coverage.',false,checked=>view.disabled=!checked),view);body.append(cover,action('Back to owner preview',drawPreview,true));page.scrollTop=0;page.focus();
 }
 function download(){
   const markup=summaryDOM(previewPayload).outerHTML;
   const safe=JSON.stringify(markup).replace(/</g,'\\u003c');
   const output=`<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Personal auto insights — shared preview</title><style>body{margin:0;background:#f6f6f6;color:#111;font:14px/20px system-ui,sans-serif}main{max-width:640px;margin:auto;padding:24px 16px}h1,h2{font-size:18px;line-height:24px}h3{font-size:14px;margin-top:24px}article,section{background:white;padding:16px;border-radius:12px}dt,.label{color:#5f6368;margin-top:10px}dd{margin:2px 0;font-weight:600;overflow-wrap:anywhere}li{margin:10px 0}.pa-disclaimer{color:#5f6368;font-size:12px}label{display:flex;align-items:center;gap:12px;min-height:56px}input{width:20px;height:20px;accent-color:#6b4062}button{min-height:44px;padding:10px 16px;border:0;border-radius:12px;background:#6b4062;color:white;font:600 14px system-ui}button:disabled{background:#e8dee5;color:#795972}:focus-visible{outline:3px solid #6b4062;outline-offset:3px}</style><main id="main"><section><h1>Before you view these insights</h1><p>${disclaimer}</p><p>This local copy has no secure-link protection or automatic expiry.</p><label><input id="ack" type="checkbox">I acknowledge this summary is not a COI or certification of coverage.</label><button id="view" disabled>View shared summary</button></section></main><script>const ack=document.getElementById('ack'),view=document.getElementById('view');ack.onchange=()=>view.disabled=!ack.checked;view.onclick=()=>{if(!ack.checked)return;document.getElementById('main').innerHTML=${safe};document.querySelector('h2').tabIndex=-1;document.querySelector('h2').focus();};<\/script></html>`;
   const url=URL.createObjectURL(new Blob([output],{type:'text/html'}));const a=document.createElement('a');a.href=url;a.download='personal-auto-shared-preview.html';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
   const message=node('p','pa-share-status','Reviewed preview downloaded. No email was sent.');message.setAttribute('role','status');page.querySelector('.pa-share-body').append(message);
 }
})();
