import test from 'node:test';
import assert from 'node:assert/strict';
import {groundReflection} from './reflection-agent.js';
const answers={space:'一片海',firstObject:'龙，是我家乡节日的记忆',weather:'小雨'};
const result=()=>({lines:[{text:'你让想象和来处一起住进了这座岛，也给自己留下自由改变的空间。',evidence:['space','firstObject'],observations:[{quote:'伪造的原话'}]}],analysis:{headline:'一座向海打开的岛',overview:'这些线索放在一起，像是一段仍可由你改写的自我叙事。',themes:[{title:'海与最初的生命',reading:'一片海和带着家乡记忆的龙放在一起，也许说明想象与来处都值得被保留。',evidence:['space','firstObject'],alternative:'海也可能只是你此刻最喜欢的景色。',lens:'narrative_identity'},{title:'雨里的停留',reading:'海与小雨同时出现，像是你为这座岛选择了一种连贯的天气语言。',evidence:['space','weather'],alternative:'这也可能只是画面和声音上的偏好。',lens:'environmental_preference'},{title:'没有被说死的意义',reading:'龙和小雨的并置，也许留下了现实记忆与幻想共同生长的空间。',evidence:['firstObject','weather'],alternative:'两者也可能没有共同含义，只是各自都被喜欢。',lens:'symbolic_association'}]}});
test('reflection evidence is rebuilt from original answers and survives serialization',()=>{
 const mirror=JSON.parse(JSON.stringify(groundReflection(result(),answers)));
 assert.deepEqual(mirror.lines[0].observations,[{key:'space',quote:answers.space,basis:'user_statement'},{key:'firstObject',quote:answers.firstObject,basis:'user_statement'}]);
 assert.deepEqual(mirror.analysis.themes[0].observations.map(item=>item.quote),[answers.space,answers.firstObject]);
 assert.equal(mirror.analysis.measurement.mbti,null);
});
test('reject unsupported or missing evidence and explicit personality labels',()=>{
 for(const patch of [{evidence:[]},{evidence:['invented']},{text:'这说明你是内向的人。'}]){
  const r=result();Object.assign(r.lines[0],patch);assert.throws(()=>groundReflection(r,answers));
 }
});
test('rejects unsupported labels and invented evidence in the detailed report',()=>{
 const labeled=result();labeled.analysis.themes[0].reading='所以你是 ENFP。';assert.throws(()=>groundReflection(labeled,answers));
 const invented=result();invented.analysis.themes[0].evidence=['visitors'];assert.throws(()=>groundReflection(invented,answers));
});
