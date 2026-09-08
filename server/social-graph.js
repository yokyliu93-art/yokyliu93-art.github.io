const clamp=(value,min=0,max=1)=>Math.max(min,Math.min(max,value));

export const SOCIAL_ALGORITHM_VERSION='island-social-v2';

export const SOURCE_RELIABILITY={
 user_confirmed:1,
 free_expression:.9,
 repeated_edit:.85,
 onboarding:.75,
 scene_custom:.6,
 scene_generated:.25,
 model_inference:.2,
 template_default:.05,
};

// Every parameter is bipolar and normalized to [-1, 1]. A zero is a real
// midpoint, not "unknown"; unknown parameters are omitted entirely.
export const SOCIAL_PARAMETERS={
 water_affinity:{group:'aesthetic',weight:1},          // dry <-> water-centred
 light_preference:{group:'rhythm',weight:.8},         // night <-> day
 shelter_need:{group:'boundary',weight:1},             // open air <-> enclosed home
 fantasy_orientation:{group:'imagination',weight:1},   // realistic <-> fantastical
 nature_orientation:{group:'aesthetic',weight:.7},     // built <-> natural
 world_mobility:{group:'imagination',weight:.9},       // rooted <-> travelling
 environmental_motion:{group:'rhythm',weight:.9},      // still <-> flowing/changing
 structure_need:{group:'rhythm',weight:.8},            // emergent <-> planned
 social_openness:{group:'relationship',weight:1},      // solitary <-> welcoming
 boundary_selectivity:{group:'boundary',weight:1},     // unrestricted <-> selective gate
 caregiving_drive:{group:'relationship',weight:1},     // receive/neutral <-> care/give
 pair_bond_focus:{group:'relationship',weight:1},      // world-centred <-> specific person
 autonomy_need:{group:'boundary',weight:1},             // merged <-> independent space
 symbolic_expression:{group:'imagination',weight:.8},  // literal <-> symbolic
 domesticity:{group:'aesthetic',weight:.8},             // wilderness <-> domestic life
 change_appetite:{group:'rhythm',weight:.8},            // preserve <-> revise repeatedly
};

function evidenceWeight(item){
 const source=SOURCE_RELIABILITY[item.source];
 if(source===undefined)throw new Error(`Unknown evidence source: ${item.source}`);
 return source*clamp(item.independence??1)*clamp(item.freshness??1);
}

export function aggregateSocialProfile(items){
 const grouped=new Map();
 for(const item of items){
  if(!SOCIAL_PARAMETERS[item.parameter])throw new Error(`Unknown social parameter: ${item.parameter}`);
  if(!Number.isFinite(item.value)||item.value < -1||item.value > 1)throw new Error(`Parameter ${item.parameter} must be within [-1, 1]`);
  const cluster=item.cluster||item.evidenceId;
  if(!cluster)throw new Error('Every evidence item needs evidenceId or cluster');
  const key=`${item.parameter}:${cluster}`;
  const w=evidenceWeight(item),current=grouped.get(key);
  // Repeated text from one onboarding/edit/model response is one observation.
  if(!current||w>current.weight)grouped.set(key,{...item,weight:w});
 }
 const byParameter=new Map();
 for(const item of grouped.values()){
  if(!byParameter.has(item.parameter))byParameter.set(item.parameter,[]);
  byParameter.get(item.parameter).push(item);
 }
 const parameters={};
 for(const [parameter,rows] of byParameter){
  const total=rows.reduce((sum,row)=>sum+row.weight,0);
  const value=rows.reduce((sum,row)=>sum+row.value*row.weight,0)/total;
  const variance=rows.reduce((sum,row)=>sum+row.weight*(row.value-value)**2,0)/total;
  const consistency=clamp(1-variance);
  const confidence=clamp(total/1.35)*(.55+.45*consistency);
  parameters[parameter]={value:Number(value.toFixed(4)),confidence:Number(confidence.toFixed(4)),evidenceCount:rows.length,sources:[...new Set(rows.map(row=>row.source))]};
 }
 return parameters;
}

function pairKey(a,b){return [a,b].sort().join('::');}
function agreement(a,b){return clamp(1-Math.abs(a-b)/2);}

export function scoreResonance(profileA,profileB,cohortProfiles=[]){
 const cohort=cohortProfiles.length?cohortProfiles:[profileA,profileB];
 const details=[];
 for(const [parameter,meta] of Object.entries(SOCIAL_PARAMETERS)){
  const a=profileA[parameter],b=profileB[parameter];
  if(!a||!b)continue;
  const pairAgreements=[];
  for(let i=0;i<cohort.length;i++)for(let j=i+1;j<cohort.length;j++){
   const x=cohort[i][parameter],y=cohort[j][parameter];
   if(x&&y)pairAgreements.push(agreement(x.value,y.value));
  }
  // A trait shared by nearly everybody carries little identifying power.
  const prevalence=pairAgreements.length?pairAgreements.reduce((s,v)=>s+v,0)/pairAgreements.length:.5;
  const information=Math.max(.12,1-prevalence);
  const confidence=Math.sqrt(a.confidence*b.confidence);
  const weight=meta.weight*information*confidence;
  details.push({parameter,group:meta.group,a:a.value,b:b.value,agreement:agreement(a.value,b.value),information,confidence,weight});
 }
 const total=details.reduce((s,d)=>s+d.weight,0),allWeight=Object.values(SOCIAL_PARAMETERS).reduce((s,d)=>s+d.weight,0);
 if(!total)return {score:null,confidence:0,coverage:0,details:[],distinctiveMatches:0};
 const raw=details.reduce((s,d)=>s+d.agreement*d.weight,0)/total;
 const coverage=details.reduce((s,d)=>s+SOCIAL_PARAMETERS[d.parameter].weight*d.confidence,0)/allWeight;
 const confidence=clamp(Math.sqrt(coverage)*(1-Math.exp(-details.length/5)));
 const distinctiveMatches=details.filter(d=>d.agreement>=.82&&d.information>=.25&&d.confidence>=.45).length;
 return {score:Math.round(raw*100),confidence:Number(confidence.toFixed(3)),coverage:Number(coverage.toFixed(3)),distinctiveMatches,details:details.sort((a,b)=>b.weight*(b.agreement-.5)-a.weight*(a.agreement-.5))};
}

export function buildSparseResonanceGraph(people){
 const ids=Object.keys(people),profiles=ids.map(id=>people[id].parameters),pairs=[];
 for(let i=0;i<ids.length;i++)for(let j=i+1;j<ids.length;j++){
  const a=ids[i],b=ids[j];
  if(people[a].personId&&people[a].personId===people[b].personId){pairs.push({a,b,kind:'same_person',eligible:false});continue;}
  pairs.push({a,b,kind:'resonance',eligible:true,...scoreResonance(people[a].parameters,people[b].parameters,profiles)});
 }
 const eligible=pairs.filter(pair=>pair.eligible&&pair.score!==null);
 const best=new Map();
 for(const id of ids){const ranked=eligible.filter(pair=>pair.a===id||pair.b===id).sort((a,b)=>b.score-a.score);if(ranked[0])best.set(id,pairKey(ranked[0].a,ranked[0].b));}
 for(const pair of pairs){
  if(!pair.eligible){pair.edge=false;continue;}
  const key=pairKey(pair.a,pair.b),mutualBest=best.get(pair.a)===key&&best.get(pair.b)===key;
  pair.edge=pair.score>=75&&pair.confidence>=.35&&pair.distinctiveMatches>=3&&mutualBest;
  pair.reason=pair.edge?'threshold_and_mutual_best':'insufficient_significance';
 }
 return {algorithm:SOCIAL_ALGORITHM_VERSION,pairs};
}

export function declaredRelation({from,to,type,confirmedBy=[]}){
 const parties=new Set(confirmedBy);
 return {from,to,type,status:parties.has(from)&&parties.has(to)?'confirmed':parties.size?'one_sided':'suggested',strength:parties.has(from)&&parties.has(to)?1:parties.size?.35:0};
}
