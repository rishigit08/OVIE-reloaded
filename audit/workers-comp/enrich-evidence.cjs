// Presentation metadata and faithful table structure for the verified PDF extracts.
module.exports=(E,groups,locations)=>{
 for(const [id,s] of Object.entries(E)){
  s.documentName=id.startsWith('class')&&/^class\d/.test(id)||id.startsWith('schedule')?'State payroll and premium schedule':id.startsWith('location')&&/^location\d/.test(id)?'Named insured and workplaces schedule':
   ['identity','premium','states'].includes(id)?'Policy Information Page':
   id==='cancel'?'Notice of Cancellation':id==='mod'?'Experience Rating Modification Factor Endorsement':
   id==='stateAmend'?'California Employers Liability Coverage Amendatory Endorsement':
   id==='officers'?'New Hampshire officer and member election form':id==='njElection'?'New Jersey proprietor and partner election notice':
   id==='business'?'New Jersey notice of cancellation':id==='program'?'New policy welcome letter':'Workers Compensation and Employers Liability Insurance Policy';
  s.formReference=s.ref.replace(/ · PDF page \d+$/,'');
 }
 E.premium.fields=[['Total estimated annual premium','$33,316,855'],['State assessment','$876,184'],['Total estimated cost','$34,193,039'],['Minimum premium','$27,485'],['Deposit premium','$3,419,312']];
 E.states.fields=[['Item 3.A · Workers compensation states',groups.map(g=>g.state).join(', ')],['Part Two · Bodily injury by accident','$1,000,000 each accident'],['Part Two · Bodily injury by disease','$1,000,000 policy limit'],['Part Two · Bodily injury by disease','$1,000,000 each employee'],['Item 3.C · Other states','All states except ND, OH, WA, WY and states designated in Item 3.A.']];
 E.cancel.fields=[['Policy number','WWC3216474'],['Effective date of cancellation','August 5, 2016 · 12:01 a.m. at the insured’s mailing address'],['Reason','Insured Request']];
 E.cancel.after='You are hereby notified that in accordance with the terms and conditions of the above mentioned policy, your insurance will cease at and from the hour and date mentioned above due to the reason stated above.\n\nOn the premium that has been paid, premium adjustment will be made as soon as practical after cancellation becomes effective. A final audit will be done and a bill for the premium earned to the time of cancellation will be forwarded in due course.';
 for(const g of groups){
  E['schedule'+g.page].fields=[['State',g.state],['Experience modification',g.mod===null?'N/A':`${Math.round(g.mod*100)}%`],...(g.merit?[['Merit rating credit','0%']]:[])];
  for(const c of g.classes)E[`class${g.page}_${c.code}`].fields=[['State',g.state],['Classification',c.description],['Code number',c.code],['Premium basis · Total estimated annual remuneration',c.payroll===null?'Blank in schedule':`$${c.payroll.toLocaleString('en-US')}`],['Rate per $100 of remuneration',`$${c.rate}`]];
 }
 for(const [n,address] of locations)E['location'+n].fields=[['Named insured',n>=50?'MVP Workforce, LLC':'Personnel Staffing Group, LLC DBA: Barnett Management'],['Location number',String(n)],['Declared address or description',address]];
 for(const page of [252,253]){
  E['workplaceSchedule'+page]={title:'Declared workplaces',page,documentName:'Named insured and workplaces schedule',formReference:'WC 99 00 01 C · Extension for Item 1',excerpt:'Declared location entries',entries:locations.filter(([n])=>page===252?n<=32:n>32).map(([n])=>E['location'+n])};
 }
 const combine=(id,title,ids)=>E[id]={title,page:E[ids[0]].page,excerpt:ids.map(x=>E[x].excerpt).join('\n\n'),parts:ids.map(x=>E[x])};
 combine('locationsOverview','Declared locations and workplace conditions',['workplaceSchedule252','workplaceSchedule253','locations']);
 combine('employeeBasis','Employees, payroll and job classifications',['beneficiary','classifications']);
 combine('otherStatesConditions','Other-states coverage and notice conditions',['otherStates','notice']);
 combine('declarationCheck','Workplaces and classification changes',['locations','classifications']);
 combine('officerElections','State-specific inclusion and exclusion elections',['officers','njElection']);
 combine('ratingExceptions','States with no experience modification',['schedule29','schedule43','schedule56','schedule62']);
 combine('standardRatings','States with an estimated 0.75 factor',groups.filter(g=>g.mod===0.75).map(g=>'schedule'+g.page));
 combine('allRatings','Experience modification by state',groups.map(g=>'schedule'+g.page));
 combine('depositContext','Deposit and final premium after cancellation',['premium','cancel']);
 combine('ratingAdjustments','Premium adjustments and estimated factors',['schedule27','mod']);
 combine('exclusionContext','Base exclusions and California amendments',['exclusions','stateAmend']);
 combine('employmentPractices','Employment practices exclusions',['epli','stateAmend']);
 combine('liabilityScope','Employers Liability and employment practices',['liability','epli','stateAmend']);
 combine('calculationBasis','Payroll rate and experience-mod calculation',['class27_8810','schedule27','classifications']);
};
