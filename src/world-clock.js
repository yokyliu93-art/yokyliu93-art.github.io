export const WORLD_DAY_MS=10*60*1000;
export function worldClock(mode='balanced',epoch=0,at=Date.now()){
 const dayRatio=mode==='day'?.8:mode==='night'?.22:.5;
 const offset=mode==='night'?dayRatio+(1-dayRatio)*.4:dayRatio*.4;
 const phase=((at-epoch)/WORLD_DAY_MS+offset)%1;
 const p=(phase+1)%1,day=p<dayRatio;
 const segment=day?p/dayRatio:(p-dayRatio)/(1-dayRatio);
 const smooth=x=>{x=Math.max(0,Math.min(1,x));return x*x*(3-2*x);};
 const daylight=day?smooth(segment/.12)*smooth((1-segment)/.12):0;
 return {phase:p,day,daylight,dayMinutes:dayRatio*10,nightMinutes:(1-dayRatio)*10,angle:day?segment*Math.PI:Math.PI+segment*Math.PI};
}
