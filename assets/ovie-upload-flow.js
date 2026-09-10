/* Local design-preview timing and document storage; no network processing. */
(() => {
  const duration = id => ({condo:12000,umbrella:16000,standalone:20000,local:16000}[id] || 6000);
  const elapsed = state => (state.elapsed || 0) + (state.playing ? Math.max(0,Date.now()-state.tick) : 0);
  const fails = (state,id) => (state.scenario==='failed'&&id==='condo') || (state.scenario==='regenerationFailed'&&id==='umbrella');
  function migrate(state) {
    if(state?.custom?.length&&state.scenario!=='uploadFailed'&&!state.insightPolicies?.includes('local')){state.insightPolicies=['local'];state.readyPolicies=[];state.stage=3;state.elapsed=0;state.tick=Date.now();state.playing=true}
    if (!state || state.flowVersion===5) return state;
    state.elapsed = state.stage===4 ? 20000 : state.scenario==='partial' ? 12000 : state.stage>=2 ? 7000 : 0;
    state.stage = state.stage===4 ? 4 : 3;
    state.flowVersion=5; state.tick=Date.now();
    if(state.scenario==='uploading')state.scenario='reading';
    return state;
  }
  function item(state,id) {
    const time=elapsed(state), ready=state.readyPolicies?.includes(id);
    const complete=ready;
    const failed=state.stage===4&&fails(state,id);
    const reading=time<6000&&!complete&&!failed;
    return {complete,failed,preview:!reading,progress:complete||failed?100:Math.min(99,Math.round(time/duration(id)*100)),
      label:complete?'Insights generated':failed?'Insights unavailable':reading?'Extracting and Reading Data':'Generating Insights'};
  }
  function sync(state) {
    migrate(state);
    if (!state || state.stage===4) return;
    const time=elapsed(state), ids=state.insightPolicies || [];
    state.readyPolicies ||= [];
    ids.forEach(id=>{if(time>=duration(id)&&!fails(state,id)&&!state.readyPolicies.includes(id))state.readyPolicies.push(id)});
    if(time>=Math.max(6000,...ids.map(duration))){state.elapsed=time;state.stage=4;state.playing=false}
  }
  function database() {
    return new Promise((resolve,reject)=>{
      const request=indexedDB.open('ovie-upload-documents',1);
      request.onupgradeneeded=()=>request.result.createObjectStore('files');
      request.onsuccess=()=>resolve(request.result); request.onerror=()=>reject(request.error);
    });
  }
  async function storeFiles(batchId,files) {
    const db=await database();
    try { await new Promise((resolve,reject)=>{
      const tx=db.transaction('files','readwrite'), store=tx.objectStore('files');
      const keys=store.getAllKeys();
      keys.onsuccess=()=>{keys.result.filter(key=>String(key).startsWith(`${batchId}:`)).forEach(key=>store.delete(key));files.forEach((file,index)=>store.put(file,`${batchId}:${index}`))};
      tx.oncomplete=resolve; tx.onerror=()=>reject(tx.error); tx.onabort=()=>reject(tx.error);
    }); } finally {db.close()}
  }
  async function readFile(batchId,index) {
    const db=await database();
    try {return await new Promise((resolve,reject)=>{
      const request=db.transaction('files').objectStore('files').get(`${batchId}:${index}`);
      request.onsuccess=()=>resolve(request.result);request.onerror=()=>reject(request.error);
    });} finally {db.close()}
  }
  async function clearDraftFiles(id){
    const db=await database();
    try{await new Promise((resolve,reject)=>{
      const tx=db.transaction('files','readwrite'),store=tx.objectStore('files'),keys=store.getAllKeys();
      keys.onsuccess=()=>keys.result.filter(key=>String(key).startsWith(`${id}:`)).forEach(key=>store.delete(key));
      tx.oncomplete=resolve;tx.onerror=()=>reject(tx.error);tx.onabort=()=>reject(tx.error);
    })}finally{db.close()}
  }
  const draftKey=id=>`ovie.upload.draft.${id}`;
  function readDraft(id){try{return JSON.parse(sessionStorage.getItem(draftKey(id)))}catch{return null}}
  function saveDraft(draft){sessionStorage.setItem(draftKey(draft.id),JSON.stringify(draft))}
  function validateFiles(files){return !files.length?'Choose at least one file.':files.length>10?'Choose up to 10 files.':files.some(file=>!/^.+\.(pdf|png|jpe?g)$/i.test(file.name))?'Choose PDF, PNG or JPG files.':files.some(file=>!file.size)?'Remove empty files.':files.some(file=>file.size>26214400)?'Each file must be 25 MiB or smaller.':files.reduce((sum,file)=>sum+file.size,0)>104857600?'The batch must be 100 MiB or smaller.':''}
  async function createDraft(files,existingId){
    const existing=readDraft(existingId);
    const previous=existing?await Promise.all(existing.files.map(file=>readFile(existing.id,file.index))):[];
    if(previous.some(file=>!file))throw new Error('A selected file is unavailable. Please choose your files again.');
    const selected=[...previous,...files],error=validateFiles(selected);if(error)throw new Error(error);
    const id=existing?.id || Date.now().toString(36)+Math.random().toString(36).slice(2);
    const draft={id,files:selected.map((file,index)=>({index,name:file.name,size:file.size,type:file.type}))};
    await storeFiles(id,selected);saveDraft(draft);return draft;
  }
  async function confirmDraft(id){
    const draft=readDraft(id);if(!draft?.files.length)throw new Error('Choose at least one file before confirming.');
    const files=await Promise.all(draft.files.map(file=>readFile(id,file.index)));
    if(files.some(file=>!file))throw new Error('A selected file is unavailable. Please choose your files again.');
    const error=validateFiles(files);if(error)throw new Error(error);
    // Keep previews in a separate batch so browser history cannot re-submit the draft.
    const batchId=Date.now().toString(36)+Math.random().toString(36).slice(2);
    await storeFiles(batchId,files);
    const state={flowVersion:5,batchId,readyPolicies:[],insightPolicies:['local'],scenario:'reading',stage:3,elapsed:0,playing:true,tick:Date.now(),seen:false,custom:files.map(file=>file.name)};
    localStorage.setItem('ovie.upload.design-preview.v1',JSON.stringify(state));
    sessionStorage.removeItem(draftKey(id));
    clearDraftFiles(id).catch(()=>{});
    return state;
  }
  window.OvieUploadFlow={duration,elapsed,item,sync,migrate,storeFiles,readFile,readDraft,saveDraft,validateFiles,createDraft,confirmDraft};
})();
