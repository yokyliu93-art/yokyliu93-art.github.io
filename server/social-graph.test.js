import test from 'node:test';
import assert from 'node:assert/strict';
import {aggregateSocialProfile,scoreResonance,buildSparseResonanceGraph,declaredRelation} from './social-graph.js';

const e=(parameter,value,evidenceId,source='onboarding',extra={})=>({parameter,value,evidenceId,source,...extra});

test('evidence from one generation cluster is deduplicated',()=>{
 const p=aggregateSocialProfile([
  e('water_affinity',1,'a','scene_generated',{cluster:'same-job'}),
  e('water_affinity',1,'b','scene_generated',{cluster:'same-job'}),
  e('water_affinity',-1,'c','user_confirmed',{cluster:'correction'}),
 ]);
 assert.equal(p.water_affinity.evidenceCount,2);
 assert(p.water_affinity.value<0);
});

test('generic cohort traits lose information weight',()=>{
 const natural=id=>aggregateSocialProfile([e('nature_orientation',1,id)]);
 const cohort=['a','b','c','d'].map(natural);
 const score=scoreResonance(cohort[0],cohort[1],cohort);
 assert.equal(score.details[0].information,.12);
});

test('only a strong, sufficiently evidenced mutual-best pair becomes a resonance edge',()=>{
 const make=(id,sign)=>aggregateSocialProfile([
  e('water_affinity',sign,id+'w','user_confirmed'),e('shelter_need',-sign,id+'h','user_confirmed'),
  e('fantasy_orientation',sign,id+'f','free_expression'),e('world_mobility',sign,id+'m','free_expression'),
  e('environmental_motion',sign,id+'e','repeated_edit'),e('symbolic_expression',sign,id+'s','free_expression'),
 ]);
 const graph=buildSparseResonanceGraph({a:{personId:'a',parameters:make('a',1)},b:{personId:'b',parameters:make('b',.95)},c:{personId:'c',parameters:make('c',-1)}});
 assert.equal(graph.pairs.find(p=>p.a==='a'&&p.b==='b').edge,true);
 assert.equal(graph.pairs.filter(p=>p.edge).length,1);
});

test('same person accounts never create a social edge; declared relation needs both confirmations',()=>{
 const p=aggregateSocialProfile([e('water_affinity',1,'w','user_confirmed')]);
 const graph=buildSparseResonanceGraph({a:{personId:'same',parameters:p},b:{personId:'same',parameters:p}});
 assert.equal(graph.pairs[0].kind,'same_person');
 assert.equal(graph.pairs[0].edge,false);
 assert.equal(declaredRelation({from:'a',to:'b',type:'partner',confirmedBy:['a']}).status,'one_sided');
 assert.equal(declaredRelation({from:'a',to:'b',type:'partner',confirmedBy:['a','b']}).status,'confirmed');
});
