/* Review-only sharing surface: no remote transmission, email or secure-link claims. */
(() => {
 const {node,action,openDialog,utilitySheet,phone}=window.paUI;
 let origin,page;
 function close(){page?.remove();page=null;phone.style.overflow='';document.getElementById('autoMain').inert=false;document.querySelector('.topbar').inert=false;document.getElementById('chatForm').hidden=false;origin?.focus({preventScroll:true});}
 function showPage(){
  page=node('section','pa-share-page');page.setAttribute('aria-label','Share boat insights');page.tabIndex=-1;
  const header=node('header','titlebar'),back=node('button','icon-button');back.type='button';back.setAttribute('aria-label','Back to insights');back.innerHTML='<svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m12 19-7-7 7-7M5 12h14"/></svg>';back.onclick=close;
  const title=node('div');title.append(node('h1','','Share'),node('p','','Send a secure, time-limited copy.'));header.append(back,title);page.append(header);
  const body=node('div','pa-share-body'),card=node('section','card card-pad');
  card.append(node('h2','','What you’re sharing'),node('strong','','Personal boat'),node('p','label','Insights only · Policy number unavailable'));
  const masking=node('p','','Personal information will be masked. Sensitive details are hidden before sharing. '),manage=node('button','pa-text-button','Manage what’s shared');manage.type='button';manage.onclick=()=>{settings.hidden=!settings.hidden;manage.setAttribute('aria-expanded',String(!settings.hidden));};manage.setAttribute('aria-expanded','false');
  const settings=node('p','evidence-note','This sample summary contains no named insured, policy number, vessel identifiers or addresses to reveal. Source text is excluded from the shared summary.');settings.hidden=true;masking.append(manage);card.append(masking,settings);body.append(card);
  const form=node('section','card card-pad');const emailLabel=node('label','','Recipient email');emailLabel.htmlFor='boatRecipient';const email=node('input');email.type='email';email.id='boatRecipient';email.placeholder='name@example.com';
  const expiryLabel=node('label','','Link expires after');expiryLabel.htmlFor='boatExpiry';const expiry=node('select');expiry.id='boatExpiry';for(const days of [1,7,30]){const option=node('option','',`${days} ${days===1?'day':'days'}`);option.value=days;expiry.append(option);}expiry.value='7';expiry.style.cssText='display:block;width:100%;min-height:44px;margin:6px 0 12px;border:1px solid var(--border);border-radius:12px;padding:10px;font:inherit;background:white';
  const send=action('Share by email',()=>{}),copy=action('Copy secure link',()=>{},true);send.disabled=true;copy.disabled=true;
  const status=node('p','evidence-note','Secure sharing is not connected in this preview. No email is sent and no expiring link is created.');status.id='boatShareStatus';send.setAttribute('aria-describedby',status.id);copy.setAttribute('aria-describedby',status.id);
  form.append(emailLabel,email,expiryLabel,expiry,status,send,copy);body.append(form,action('Download summary preview',download));page.append(body);
  phone.append(page);phone.style.overflow='hidden';document.getElementById('autoMain').inert=true;document.querySelector('.topbar').inert=true;document.getElementById('chatForm').hidden=true;page.focus();
 }
 function download(){
  const main=document.getElementById('autoMain').cloneNode(true);main.querySelectorAll('button,svg,.feedback').forEach(el=>el.remove());
  const text='PERSONAL BOAT INSIGHTS\nBased on a supplied summary; original policy PDF not reviewed.\nLocal preview: no secure-link protection or automatic expiry.\n\n'+main.textContent.replace(/\n\s*\n/g,'\n\n');
  const url=URL.createObjectURL(new Blob([text],{type:'text/plain;charset=utf-8'})),link=document.createElement('a');link.href=url;link.download='personal-boat-insights-preview.txt';link.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
 }
 window.personalShare=trigger=>{origin=trigger;document.getElementById('utilityTitle').textContent='Share';document.getElementById('utilityBody').replaceChildren(node('p','source-context','Insurance insights may contain sensitive information. Review what is included before sharing. This sample is based on a supplied summary and is not evidence of insurance.'),node('p','source-context','By selecting “Confirm Sharing,” you acknowledge these privacy implications. You can review sharing options on the next screen.'),action('Confirm Sharing',()=>{utilitySheet.addEventListener('close',showPage,{once:true});utilitySheet.close();}));openDialog(utilitySheet,trigger);};
 document.addEventListener('keydown',e=>{if(page&&e.key==='Escape'){e.preventDefault();close();}});
})();
