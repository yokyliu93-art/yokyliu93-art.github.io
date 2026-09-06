// Artistic annual cycle, not a claim about local weather or plant phenology.
export function seasonalBlend(date=new Date()){
  const year=date.getFullYear(),at=(y,m,d)=>new Date(y,m,d).getTime();
  const points=[[at(year-1,10,15),'autumn'],[at(year,0,15),'winter'],[at(year,3,15),'spring'],[at(year,6,15),'summer'],[at(year,8,15),'summer'],[at(year,10,15),'autumn'],[at(year+1,0,15),'winter']];
  const now=date.getTime();let i=1;while(i<points.length-1&&now>points[i][0])i++;
  const [start,from]=points[i-1],[end,to]=points[i];const t=Math.max(0,Math.min(1,(now-start)/(end-start)));
  return {from,to,amount:t*t*(3-2*t)};
}
