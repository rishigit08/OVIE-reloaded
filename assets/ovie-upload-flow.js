/* Local design-preview timing and document storage; no network processing. */
(() => {
  const duration = id => ({condo:12000,umbrella:16000,standalone:20000}[id] || 6000);
  const elapsed = state => (state.elapsed || 0) + (state.playing ? Math.max(0,Date.now()-state.tick) : 0);
  const fails = (state,id) => (state.scenario==='failed'&&id==='condo') || (state.scenario==='regenerationFailed'&&id==='umbrella');
  function migrate(state) {
    if (!state || state.flowVersion===5) return state;
    state.elapsed = state.stage===4 ? 20000 : state.scenario==='partial' ? 12000 : state.stage>=2 ? 7000 : 0;
    state.stage = state.stage===4 ? 4 : 3;
    state.flowVersion=5; state.tick=Date.now();
    if(state.scenario==='uploading')state.scenario='reading';
    return state;
  }
  function item(state,id) {
    const time=elapsed(state), ready=state.readyPolicies?.includes(id), local=id==='local';
    const complete=ready || (local&&state.stage===4);
    const failed=state.stage===4&&fails(state,id);
    const reading=time<6000&&!complete&&!failed;
    return {complete,failed,preview:!reading,progress:complete||failed?100:Math.min(99,Math.round(time/duration(id)*100)),
      label:complete?(local?'Saved':'Insights generated'):failed?'Insights unavailable':reading?'Extracting and Reading Data':'Generating Insights'};
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
      store.clear(); files.forEach((file,index)=>store.put(file,`${batchId}:${index}`));
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
  window.OvieUploadFlow={duration,elapsed,item,sync,migrate,storeFiles,readFile};
})();
