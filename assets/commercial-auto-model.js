/* Reviewed policy data only. PDF extraction/classification is an upstream service. */
(function (root) {
  'use strict';
  const symbolDescriptions = {
    1: 'Any auto', 2: 'Owned autos', 3: 'Owned private passenger autos',
    4: 'Owned autos other than private passenger autos', 5: 'Owned autos subject to no-fault requirements',
    6: 'Owned autos subject to compulsory uninsured motorist requirements',
    7: 'Specifically scheduled autos', 8: 'Hired or borrowed autos', 9: 'Non-owned autos used for business',
    19: 'Mobile equipment subject to motor vehicle insurance laws'
  };
  const hasValue = value => value !== undefined && value !== null && String(value).trim() !== '';
  function gate(policy) {
    const missing = [];
    const docs = policy.documents || {};
    for (const [key, label] of [['declarations','Declarations page'],['businessAutoForm','Business auto policy form'],['endorsements','Complete endorsements']]) {
      if (docs[key] !== true) missing.push(label);
    }
    const rows = policy.coverages || [];
    const active = rows.filter(row => row.selected === true);
    const liability = active.find(row => row.kind === 'liability');
    const allSymbols = active.flatMap(row => row.symbols || []).map(Number);
    const hnoOnly = !!liability && allSymbols.length > 0 && allSymbols.every(s => s === 8 || s === 9)
      && [8,9].every(s => (liability.symbols || []).map(Number).includes(s));
    if (!liability || !hasValue(liability.limit) || !hasValue(liability.basis)) missing.push('Liability coverage limit and basis');
    if (!allSymbols.length || allSymbols.some(s => !symbolDescriptions[s])) missing.push('Verified covered-auto symbols');
    if (active.some(row => !hasValue(row.limit) || !hasValue(row.basis) || !row.symbols?.length)) missing.push('Coverage limits and covered-auto designations');
    if (!hnoOnly) {
      if (docs.vehicleSchedule !== true || !policy.vehicles?.length) missing.push('Complete vehicle schedule');
      if (docs.driverSchedule !== true || !policy.drivers?.length || policy.drivers.some(d => d.type !== 'person' || !hasValue(d.name))) missing.push('Driver information');
      if (policy.vehicles?.some(v => !hasValue(v.vin))) missing.push('VIN for every covered auto');
      if (policy.vehicles?.some(v => !v.coverages?.length || v.coverages.some(c => !hasValue(c.limit) || !hasValue(c.basis)))) missing.push('Coverage limits for every covered auto');
    }
    return {complete: missing.length === 0, status: missing.length ? 'red-stored' : 'ready', hnoOnly, missing: [...new Set(missing)]};
  }
  function applicableCoverages(vehicle) {
    return (vehicle.coverages || []).filter(c => c.selected === true && (!c.extension || c.declarationsApplicable === true));
  }
  function watchPoints(policy) {
    const points = [...(policy.watchPoints || [])];
    for (const v of policy.vehicles || []) {
      if (v.financed === true && !applicableCoverages(v).some(c => c.kind === 'comprehensive' || c.kind === 'collision')) {
        points.push({severity:'Critical',title:`No physical damage for ${v.name}`,text:'This financed auto has no physical damage coverage in the declarations. Review the loan requirements with your agent. This is an informational flag.',source:v.financeSource});
      }
      if (v.outsideDeclaredUse === true) points.push({severity:'Critical',title:'Operations outside declared use',text:`The recorded use of ${v.name} differs from its declared use. Ask your agent to review the operation and policy terms.`,source:v.useSource});
    }
    if (gate(policy).hnoOnly && !policy.coverages.some(c => c.selected && ['comprehensive','collision'].includes(c.kind))) {
      points.push({severity:'Moderate',title:'Hired and non-owned is liability-only',text:'Liability coverage does not pay for damage to the rented vehicle or an employee’s vehicle. Ask your agent about the applicable vehicle coverage.',source:policy.hnoSource});
    }
    return points;
  }
  function fleetPage(vehicles, query = '', count = 6) {
    const q = query.trim().toLowerCase();
    const matches = vehicles.filter(v => `${v.name} ${v.vin}`.toLowerCase().includes(q));
    return {rows:matches.slice(0,count),total:matches.length,more:matches.length>count,list:vehicles.length>=7};
  }
  function resolvePackage(packages, asOf) {
    const candidates = packages.filter(p => p.effective <= asOf).sort((a,b) => b.effective.localeCompare(a.effective));
    if (!candidates.length || (candidates[1]?.effective === candidates[0].effective)) throw new Error('Policy version needs verification.');
    return structuredClone(candidates[0]);
  }
  const api = {gate,applicableCoverages,watchPoints,fleetPage,resolvePackage,symbolDescriptions};
  if (typeof module !== 'undefined') module.exports = api;
  else root.CommercialAuto = api;
})(typeof window !== 'undefined' ? window : globalThis);
