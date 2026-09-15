const fs=require('fs'),path=require('path'),vm=require('vm'),assert=require('assert/strict');
const root=path.resolve(__dirname,'../..');
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
const html=read('ovie_commercial_package_insights.html');
const data=read('assets/commercial-package-data.js');
const js=read('assets/commercial-package-insights.js');
new vm.Script(js);new vm.Script(data);
const ctx={};vm.runInNewContext(data+';this.evidence=EVIDENCE;this.url=POLICY_URL',ctx);
assert.equal(ctx.url,'assets/policies/commercial-package__acadia__10.pdf');
const ids=[...html.matchAll(/data-source="([^"]+)"/g)].map(m=>m[1]);
assert.equal(ids.length,45);assert.equal(new Set(ids).size,20);
for(const id of ids){assert(ctx.evidence[id]);assert(ctx.evidence[id].pages.every(n=>n>=1&&n<=254));}
for(const m of html.matchAll(/(?:src|href)="([^"]+)"/g)){
 if(/^https?:/.test(m[1]))continue;
 assert(fs.existsSync(path.resolve(root,m[1].split(/[?#]/)[0])),m[1]);
}
assert(fs.existsSync(path.join(root,ctx.url)));
const summary=html.match(/<section class="card" id="policy-summary">([\s\S]*?)<\/section>/)[1];
assert(!summary.includes('<button'));assert(summary.includes('CPA 3182984 - 24'));
assert(!summary.includes('subject to adjustment'));assert(!js.includes('revealPolicy'));
assert(!js.includes('View PDF page'));assert(js.includes("const page=source.pages[0]"));
assert(js.includes("window.location.href = 'Insights.html'"));assert(!html.includes('../'));
assert(read('DESIGN.md').includes('- Commercial Package Insights (approved September 15, 2026):'));
console.log('Publish checks passed: 45 sourced controls, 20 evidence records, correct root-level paths, approved simplified card and one document action.');
