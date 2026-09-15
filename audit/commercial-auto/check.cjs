const assert=require('node:assert/strict'), fs=require('fs'),path=require('path'),vm=require('vm');
const {chromium}=require('C:/Users/rishiv/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const root=path.resolve(__dirname,'../..');const model=require(path.join(root,'assets/commercial-auto-model.js'));
const data=fs.readFileSync(path.join(root,'assets/commercial-auto-data.js'),'utf8');
const ctx={};vm.createContext(ctx);vm.runInContext(data+'\nthis.policy=JSON.parse(JSON.stringify(AUTO_POLICY));',ctx);const policy=JSON.parse(JSON.stringify(ctx.policy));
assert(model.gate(policy).complete);
for(const key of ['declarations','businessAutoForm','endorsements','driverSchedule','vehicleSchedule']){const p=structuredClone(policy);p.documents[key]=false;assert.equal(model.gate(p).status,'red-stored',key);}
for(const mutation of [p=>p.vehicles[0].vin='',p=>p.drivers=[],p=>p.drivers[0].type='business',p=>p.coverages[0].limit=null,p=>p.vehicles[0].coverages[0].limit=null]){const p=structuredClone(policy);mutation(p);assert(!model.gate(p).complete);}
const hno=structuredClone(policy);hno.coverages=[{...hno.coverages[0],symbols:[8,9]}];hno.vehicles=[];hno.drivers=[];hno.documents.vehicleSchedule=false;hno.documents.driverSchedule=false;
assert(model.gate(hno).complete);assert(model.gate(hno).hnoOnly);assert(model.watchPoints(hno).some(w=>w.title.includes('liability-only')));
const ambiguous=structuredClone(hno);ambiguous.coverages[0].symbols=[7,8,9];assert(!model.gate(ambiguous).complete);
const noForm=structuredClone(hno);noForm.documents.businessAutoForm=false;assert(!model.gate(noForm).complete);
const v=structuredClone(policy.vehicles[0]);v.coverages.push({kind:'transportation',selected:true,extension:true,declarationsApplicable:false});assert(!model.applicableCoverages(v).some(c=>c.kind==='transportation'));
const financed=structuredClone(policy);financed.vehicles[0].financed=true;financed.vehicles[0].coverages=financed.vehicles[0].coverages.filter(c=>!['comprehensive','collision'].includes(c.kind));assert(model.watchPoints(financed).some(w=>w.severity==='Critical'));
const fleet=Array.from({length:125},(_,i)=>({...policy.vehicles[0],id:`qa-${i}`,number:String(i+1),name:`QA fleet auto ${i+1}`,vin:`QA-${String(i+1).padStart(5,'0')}`}));
assert.equal(model.fleetPage(fleet).rows.length,6);assert.equal(model.fleetPage(fleet).total,125);assert.equal(model.fleetPage(fleet,'QA-00125').rows.length,1);
assert.equal(model.resolvePackage([{...policy,effective:'2020-03-21',premium:'old'},policy],'2020-04-09').premium,'$9,479');
(async()=>{
 const browser=await chromium.launch({headless:true,channel:"msedge"});const page=await browser.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));
 const url='file:///'+path.join(root,'ovie_commercial_auto_insights.html').replaceAll('\\','/');
 for(const width of [320,390,480,1440]){
  await page.setViewportSize({width,height:920});await page.goto(url);await page.locator('#autoSimplified').waitFor();
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
  assert.equal(await page.evaluate(()=>{const p=document.getElementById('phone');return p.scrollWidth>p.clientWidth;}),false);
  await page.screenshot({path:path.join(__dirname,`overview-${width}.png`)});
 }
 await page.setViewportSize({width:390,height:920});await page.goto(url);
 assert.equal(await page.locator('#autoPolicyNumber').innerText(),policy.id);assert.equal(await page.locator('[aria-labelledby="autoSimplified"] button').count(),0);
 const policyDetails=page.locator('[aria-labelledby="autoPolicyDetails"]');
 assert.equal(await page.locator('[aria-labelledby="coveredAutos"] [role="tablist"]').count(),0);
 const excluded=policyDetails.locator('details').filter({has:page.locator('summary').filter({hasText:"What's not included"})});
 const limitations=policyDetails.locator('details').filter({has:page.locator('summary').filter({hasText:'Coverage limitations'})});
 const included=policyDetails.locator('details').filter({has:page.locator('summary').filter({hasText:"What's included"})});
 await excluded.locator('summary').click();assert.equal(await excluded.getAttribute('open'),'');
 await page.screenshot({path:path.join(__dirname,'auto-exclusions.png')});
 await limitations.locator('summary').focus();await page.keyboard.press('Enter');assert.equal(await limitations.getAttribute('open'),'');
 await limitations.locator('summary').click();
 await included.locator('[data-source="rental"]').click();assert(await page.locator('#sourceSheet').isVisible());
 assert((await page.locator('#sourceBody a').first().getAttribute('href')).endsWith('#page=71'));
 await page.screenshot({path:path.join(__dirname,'rental-source.png')});await page.keyboard.press('Escape');assert.equal(await page.evaluate(()=>document.activeElement.dataset.source),'rental');
 await page.getByRole('button',{name:'Search these insights',exact:true}).click();await page.locator('#insightsSearch').fill('spare');await page.locator('.search-result').first().click();assert.equal(await limitations.getAttribute('open'),'');
 await page.locator('#chatInput').click();assert.equal(await page.evaluate(()=>document.activeElement.id),'askOvieInput');await page.locator('#askOvieInput').fill('What is rental reimbursement?');await page.locator('#askOvieInput').press('Enter');assert((await page.locator('#askOvieAnswer').innerText()).includes('$50'));await page.keyboard.press('Escape');
 await page.locator('[data-feedback="down"]').click();await page.getByRole('button',{name:'Submit',exact:true}).click();assert((await page.locator('#feedbackError').innerText()).includes('Select'));await page.keyboard.press('Escape');
 await page.evaluate(fleet=>{const p=structuredClone(AUTO_POLICY);p.vehicles=fleet;renderAuto(p)},fleet);
 assert.equal(await page.locator('#fleetRows button').count(),6);await page.locator('#fleetMore').click();assert.equal(await page.locator('#fleetRows button').count(),26);
 await page.locator('#fleetSearch').fill('QA-00125');assert.equal(await page.locator('#fleetRows button').count(),1);await page.locator('#fleetRows button').click();assert(await page.locator('#autoVehicleSheet').isVisible());assert((await page.locator('.auto-vehicle-body').innerText()).includes('QA-00125'));await page.keyboard.press('Escape');
 await page.evaluate(()=>{const p=structuredClone(AUTO_POLICY);p.documents.driverSchedule=false;renderAuto(p)});assert.equal(await page.locator('[role="tab"]').count(),0);assert.equal(await page.locator('#autoMain').innerText().then(t=>t.includes('$1,000,000')),false);
 await page.screenshot({path:path.join(__dirname,'incomplete.png')});
 await page.goto(url);await page.evaluate(async()=>{const p=structuredClone(AUTO_POLICY);p.premium='$9,000';await window.regenerateCommercialAuto(async()=>p)});assert((await page.locator('#autoMain').innerText()).includes('$9,000'));
 await page.evaluate(async()=>window.regenerateCommercialAuto(async()=>{throw new Error('Offline')}));assert((await page.locator('#autoMain').innerText()).includes('$9,000'));
 await page.emulateMedia({reducedMotion:'reduce'});assert.equal(await page.locator('.auto-disclosure>summary>svg').first().evaluate(e=>getComputedStyle(e).transitionDuration),'0s');
 assert.deepEqual(errors,[]);await browser.close();console.log('PASS: evidence gate, HNO exception, selected extensions, financed-auto flag, 125-auto fleet, version resolution, 4 widths, tabs, source links/focus, search, Ask Ovie, feedback, incomplete suppression and regeneration.');
})().catch(e=>{console.error(e);process.exit(1)});
