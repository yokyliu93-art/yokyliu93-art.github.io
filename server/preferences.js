import {starterEcosystem} from './ecosystem.js';
import {applyWorldTemplate,worldTemplates} from './world-templates.js';
export const preferenceOptions={animals:['rabbit','bird','cat','dog','bear','fox','unicorn','none'],light:['day','night','balanced'],home:['open','cottage','floating'],landscape:['forest','flowers','meadow','none']};
const customKeys=['world','water',...Object.keys(preferenceOptions)];
export function validPreferences(p){
 if(!p||typeof p!=='object'||Array.isArray(p)||!Object.keys(p).every(k=>customKeys.includes(k)||['variant','custom','growing','expression'].includes(k)))return false;
 if(p.expression!==undefined&&(typeof p.expression!=='string'||p.expression.length>1000))return false;
 if(p.custom!==undefined&&(!p.custom||typeof p.custom!=='object'||Array.isArray(p.custom)||!Object.entries(p.custom).every(([k,v])=>customKeys.includes(k)&&typeof v==='string'&&v.length<=240)))return false;
 const chosen=(key,values)=>p[key]==='custom'?typeof p.custom?.[key]==='string'&&p.custom[key].trim().length>0:values.includes(p[key]);
 return (p.growing===undefined||typeof p.growing==='boolean')&&(p.water===undefined||chosen('water',['none','pond','river','waterfall']))&&(p.world===undefined||chosen('world',worldTemplates.map(t=>t.id)))&&(p.variant===undefined||(Number.isInteger(p.variant)&&p.variant>=0&&p.variant<=9999))&&Object.entries(preferenceOptions).every(([k,values])=>chosen(k,values));
}
export function applyPreferences(scene,p){p={...p};const fallback={water:'none',world:'forest',animals:'none',light:'balanced',home:'open',landscape:'forest'};for(const k of customKeys)if(p[k]==='custom')p[k]=fallback[k];const s=p.world||p.growing?starterEcosystem():structuredClone(scene);if(p.growing){s.growing=true;s.objects=[];}s.daylight=p.light;s.time=p.light==='night'?'night':'sunset';s.objects=s.objects.filter(o=>!['rabbit','bird','cat','dog','bear','fox','unicorn','house'].includes(o.kind));
const object=(id,kind,x,y,z,color='cream')=>({id,kind,x,y,z,color,roomId:null,rotation:0});
if(p.animals!=='none')for(let i=0;i<3;i++)s.objects.push(object('companion-'+i,p.animals,-2+i*1.4,p.animals==='bird'?2:0,2+i*.3));
if(p.home!=='open')s.objects.push(object('chosen-home','house',1.4,p.home==='floating'?4.2:0,-1.4));
s.ecosystem.biome=p.landscape==='forest'?'woodland':'meadow';
if(p.growing&&p.landscape==='forest')s.objects.push(...starterEcosystem().objects.filter(o=>['tree','pine','flowers'].includes(o.kind)));if(p.landscape!=='forest'&&p.landscape!=='none'){s.objects=s.objects.filter(o=>!['tree','pine','flowers'].includes(o.kind));for(let i=0;i<4;i++)s.objects.push(object('chosen-tree-'+i,'tree',Math.cos(i*1.7)*5,0,Math.sin(i*1.7)*5,'sage'));for(let i=0;i<20;i++)s.objects.push(object('chosen-field-'+i,p.landscape==='flowers'?'flowers':'grass',Math.cos(i*2.4)*(2+i%5),0,Math.sin(i*2.4)*(2+i%5),p.landscape==='flowers'?'rose':'sage'));}if(p.water!==undefined){s.objects=s.objects.filter(o=>!['river','pond','waterfall'].includes(o.kind));if(p.water!=='none'){s.objects.push(object('chosen-water',p.water,0,0,0,'blue'));if(p.water==='waterfall')s.objects.push(object('chosen-stream','river',0,0,0,'blue'));}}return p.world?applyWorldTemplate(s,p.world,p.variant||0):s;}
export function preferenceDescription(p){
 const labels={water:'水',world:'世界',animals:'陪伴我的生命',light:'光与时间',home:'住所',landscape:'风景'};
 const values={water:{none:'暂时不需要水',pond:'一汪池塘',river:'一条溪流',waterfall:'溪流与瀑布'},world:Object.fromEntries(worldTemplates.map(t=>[t.id,t.name])),animals:{dog:'小狗',bear:'熊猫',fox:'狐狸',unicorn:'独角兽',rabbit:'小兔子',bird:'飞鸟',cat:'猫',none:'暂时不要动物'},light:{day:'白天更长',night:'夜晚更长',balanced:'昼夜均衡'},home:{open:'不要房子',cottage:'有一间林间小屋',floating:'有一座漂浮在空中的房子'},landscape:{none:'先留白',forest:'森林',flowers:'花园',meadow:'草甸'}};
 const description=customKeys.filter(k=>p[k]!==undefined).map(k=>`${labels[k]}：${p[k]==='custom'?p.custom?.[k]||'':k==='animals'&&p[k]!=='none'?'有'+values[k][p[k]]:values[k][p[k]]}。`);
 if(p.expression?.trim())description.push(`她还告诉 Agent：${p.expression.trim()}`);
 return description.join('\n');
}
