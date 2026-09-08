import {aggregateSocialProfile,buildSparseResonanceGraph,declaredRelation} from '../server/social-graph.js';
const e=(parameter,value,evidenceId,source='onboarding',extra={})=>({parameter,value,evidenceId,source,...extra});

// Values are normalized from explicit choices and edits. Missing evidence is
// omitted; it is never silently filled with a neutral zero.
const evidence={
 littleE:[
  e('water_affinity',1,'le-water'),e('light_preference',0,'le-light'),e('shelter_need',-1,'le-home'),
  e('fantasy_orientation',1,'le-unicorn','free_expression'),e('nature_orientation',1,'le-forest'),
  e('world_mobility',1,'le-travelling-turtle','free_expression'),e('environmental_motion',1,'le-water-cycle','repeated_edit'),
  e('structure_need',.55,'le-water-system','repeated_edit'),e('social_openness',.65,'le-visitors','free_expression'),
  e('boundary_selectivity',1,'le-turtle-review','free_expression'),e('caregiving_drive',1,'le-dream-gift','free_expression'),
  e('symbolic_expression',1,'le-visible-scent','free_expression'),e('domesticity',-1,'le-no-house'),
  e('change_appetite',1,'le-edit-1','repeated_edit'),e('change_appetite',1,'le-edit-2','repeated_edit'),
 ],
 yokyLiu:[
  e('water_affinity',1,'yl-water'),e('light_preference',0,'yl-light'),e('shelter_need',-1,'yl-home'),
  e('fantasy_orientation',1,'yl-unicorn','free_expression'),e('nature_orientation',1,'yl-forest'),
  e('environmental_motion',1,'yl-water-ring','free_expression'),e('structure_need',.55,'yl-water-system','free_expression'),
  e('symbolic_expression',.85,'yl-sky-water','free_expression'),e('domesticity',-1,'yl-no-house'),
  e('change_appetite',.8,'yl-edit-1','repeated_edit'),e('change_appetite',.8,'yl-edit-2','repeated_edit'),
 ],
 yoky:[
  e('water_affinity',1,'y-ocean'),e('light_preference',1,'y-day'),e('shelter_need',1,'y-cottage'),
  e('fantasy_orientation',-.65,'y-cat-cottage'),e('nature_orientation',.8,'y-flowers'),
  e('environmental_motion',.35,'y-ocean-motion'),e('structure_need',.65,'y-cottage-structure'),
  e('symbolic_expression',-.45,'y-literal-elements'),e('domesticity',1,'y-domestic'),
 ],
 vincent:[
  e('water_affinity',-1,'v-no-water','user_confirmed'),e('light_preference',-1,'v-night'),e('shelter_need',1,'v-cottage'),
  e('fantasy_orientation',-.2,'v-forest-cottage'),e('nature_orientation',1,'v-forest'),
  e('world_mobility',-.55,'v-rooted-home'),e('environmental_motion',-.4,'v-preserve-no-water'),
  e('structure_need',.7,'v-cottage-structure'),e('caregiving_drive',.65,'v-yoky-heart','free_expression'),
  e('pair_bond_focus',1,'v-needs-yoky','free_expression'),e('symbolic_expression',.45,'v-heart-symbol','scene_custom'),
  e('domesticity',.85,'v-domestic'),
 ],
};
const people={
 littleE:{personId:'littleE',parameters:aggregateSocialProfile(evidence.littleE)},
 yokyLiu:{personId:'yoky',parameters:aggregateSocialProfile(evidence.yokyLiu)},
 yoky:{personId:'yoky',parameters:aggregateSocialProfile(evidence.yoky)},
 vincent:{personId:'vincent',parameters:aggregateSocialProfile(evidence.vincent)},
};
const graph=buildSparseResonanceGraph(people);
const relations=[declaredRelation({from:'vincent',to:'yoky',type:'partner',confirmedBy:['vincent']})];
console.log(JSON.stringify({people,graph,relations},null,2));
