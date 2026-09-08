// Footprints are metres and match the runtime's normalized asset bounds.
export const FOOTPRINTS={sofa:[2,.9],bed:[1.1,2],desk:[1.3,.7],chair:[.55,.55],table:[.9,.6],bookshelf:[1.2,.4],plant:[.5,.5],lamp:[.4,.4],recordPlayer:[.95,.45]};
export function furnitureBounds(o){const [w,d]=FOOTPRINTS[o.kind]||[.3,.3],c=Math.abs(Math.cos(o.rotation)),s=Math.abs(Math.sin(o.rotation));return {x:o.x,z:o.z,w:w*c+d*s,d:w*s+d*c};}
export function checkFurniturePlacement(object,room,objects){if(!FOOTPRINTS[object.kind])return;const b=furnitureBounds(object);
 if(Math.abs(b.x)+b.w/2>room.width/2-.12||Math.abs(b.z)+b.d/2>room.depth/2-.12)throw Error('家具会穿过墙壁，请往房间内移一点');
 if(Math.abs(b.x)<1.2+b.w/2&&b.z+b.d/2>room.depth/2-1.2)throw Error('请给入口留出通道');
 for(const other of objects){if(other.id===object.id||other.roomId!==object.roomId||!FOOTPRINTS[other.kind]||Math.abs(other.y-object.y)>.4)continue;const a=furnitureBounds(other);if(Math.abs(a.x-b.x)<(a.w+b.w)/2-.04&&Math.abs(a.z-b.z)<(a.d+b.d)/2-.04)throw Error('这里已有家具，请换一个位置');}
}
