import * as THREE from 'three';

export const M = {
  wall: new THREE.MeshStandardMaterial({color:0xf0e0c8,flatShading:true}),
  wallAccent: new THREE.MeshStandardMaterial({color:0xd4b896,flatShading:true}),
  floor: new THREE.MeshStandardMaterial({color:0x9b7b5a,flatShading:true}),
  floorDark: new THREE.MeshStandardMaterial({color:0x7a5f42,flatShading:true}),
  ceiling: new THREE.MeshStandardMaterial({color:0xe8d5b8,flatShading:true}),
  wood: new THREE.MeshStandardMaterial({color:0x6b4226,flatShading:true}),
  woodLight: new THREE.MeshStandardMaterial({color:0xa0785a,flatShading:true}),
  woodDark: new THREE.MeshStandardMaterial({color:0x4a2c17,flatShading:true}),
  counter: new THREE.MeshStandardMaterial({color:0x5c3d2e,flatShading:true}),
  metal: new THREE.MeshStandardMaterial({color:0xb8b8b8,flatShading:true}),
  darkMetal: new THREE.MeshStandardMaterial({color:0x444444,flatShading:true}),
  white: new THREE.MeshStandardMaterial({color:0xf5f5f0,flatShading:true}),
  cream: new THREE.MeshStandardMaterial({color:0xfaebd7,flatShading:true}),
  red: new THREE.MeshStandardMaterial({color:0xc0392b,flatShading:true}),
  green: new THREE.MeshStandardMaterial({color:0x27ae60,flatShading:true}),
  darkGreen: new THREE.MeshStandardMaterial({color:0x1e8449,flatShading:true}),
  brown: new THREE.MeshStandardMaterial({color:0x8b4513,flatShading:true}),
  glass: new THREE.MeshStandardMaterial({color:0xaaddff,transparent:true,opacity:0.25,flatShading:true}),
  gold: new THREE.MeshStandardMaterial({color:0xd4a537,flatShading:true}),
  black: new THREE.MeshStandardMaterial({color:0x1a1a1a,flatShading:true}),
  screen: new THREE.MeshStandardMaterial({color:0x111122,emissive:0x2233aa,emissiveIntensity:0.3}),
  pathStone: new THREE.MeshStandardMaterial({color:0xaa9988,flatShading:true}),
  fabric: new THREE.MeshStandardMaterial({color:0xcc6644,flatShading:true}),
  fabricBlue: new THREE.MeshStandardMaterial({color:0x4477aa,flatShading:true}),
  coffee: new THREE.MeshStandardMaterial({color:0x4a2c0a,flatShading:true}),
  milk: new THREE.MeshStandardMaterial({color:0xfff8e7,flatShading:true}),
  stone: new THREE.MeshStandardMaterial({color:0x999999,flatShading:true}),
  soil: new THREE.MeshStandardMaterial({color:0x4a3728,flatShading:true}),
  hedge: new THREE.MeshStandardMaterial({color:0x1e8449,flatShading:true}),
  water: new THREE.MeshStandardMaterial({color:0x3498db,transparent:true,opacity:0.7}),
  building: new THREE.MeshStandardMaterial({color:0x555566,flatShading:true}),
  building2: new THREE.MeshStandardMaterial({color:0x666677,flatShading:true}),
  windowLit: new THREE.MeshStandardMaterial({color:0xffffcc,emissive:0xffffcc,emissiveIntensity:0.3}),
};

export function box(scene,w,h,d,mat,x,y,z,opts={}){
  const m=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),mat);
  m.position.set(x,y,z);
  if(opts.ry)m.rotation.y=opts.ry;
  if(opts.rx)m.rotation.x=opts.rx;
  if(opts.rz)m.rotation.z=opts.rz;
  m.castShadow=opts.castShadow!==false;
  m.receiveShadow=opts.receiveShadow!==false;
  scene.add(m); return m;
}

export function cyl(scene,rt,rb,h,mat,x,y,z,seg=12,opts={}){
  const m=new THREE.Mesh(new THREE.CylinderGeometry(rt,rb,h,seg),mat);
  m.position.set(x,y,z);
  if(opts.rx)m.rotation.x=opts.rx;
  if(opts.rz)m.rotation.z=opts.rz;
  m.castShadow=opts.castShadow!==false;
  m.receiveShadow=opts.receiveShadow!==false;
  scene.add(m); return m;
}

export function buildWorld(scene,colliders,interactables,addInteractable){
  const W=16,D=12,H=4,T=0.3,hw=W/2,hd=D/2;

  function addCollider(x,y,z,w,h,d){
    const b=new THREE.Box3(
      new THREE.Vector3(x-w/2,y-h/2,z-d/2),
      new THREE.Vector3(x+w/2,y+h/2,z+d/2)
    );
    colliders.push(b); return b;
  }

  function buildWindowFrame(cx,cy,z,w,h,alongX=true){
    const ft=0.08,fd=0.15;
    if(alongX){
      box(scene,w+ft*2,ft,fd,M.woodDark,cx,cy+h/2+ft/2,z,{castShadow:false});
      box(scene,w+ft*2,ft,fd,M.woodDark,cx,cy-h/2-ft/2,z,{castShadow:false});
      box(scene,ft,h,fd,M.woodDark,cx-w/2-ft/2,cy,z,{castShadow:false});
      box(scene,ft,h,fd,M.woodDark,cx+w/2+ft/2,cy,z,{castShadow:false});
      box(scene,ft*0.6,h,fd*0.6,M.woodDark,cx,cy,z,{castShadow:false});
      box(scene,w,ft*0.6,fd*0.6,M.woodDark,cx,cy,z,{castShadow:false});
      const g=new THREE.Mesh(new THREE.PlaneGeometry(w,h),M.glass);
      g.position.set(cx,cy,z); scene.add(g);
      box(scene,w+0.3,0.06,0.35,M.woodLight,cx,cy-h/2-ft-0.03,z,{castShadow:false});
      // Curtains
      box(scene,0.15,h+0.3,0.1,M.fabric,cx-w/2-0.15,cy,z+0.08,{castShadow:false});
      box(scene,0.15,h+0.3,0.1,M.fabric,cx+w/2+0.15,cy,z+0.08,{castShadow:false});
    } else {
      box(scene,fd,ft,w+ft*2,M.woodDark,cx,cy+h/2+ft/2,z,{castShadow:false});
      box(scene,fd,ft,w+ft*2,M.woodDark,cx,cy-h/2-ft/2,z,{castShadow:false});
      box(scene,fd,h,ft,M.woodDark,cx,cy,z-w/2-ft/2,{castShadow:false});
      box(scene,fd,h,ft,M.woodDark,cx,cy,z+w/2+ft/2,{castShadow:false});
      box(scene,fd*0.6,h,ft*0.6,M.woodDark,cx,cy,z,{castShadow:false});
      box(scene,fd*0.6,ft*0.6,w,M.woodDark,cx,cy,z,{castShadow:false});
      const g=new THREE.Mesh(new THREE.PlaneGeometry(w,h),M.glass);
      g.position.set(cx,cy,z); g.rotation.y=Math.PI/2; scene.add(g);
      box(scene,0.35,0.06,w+0.3,M.woodLight,cx,cy-h/2-ft-0.03,z,{castShadow:false});
      box(scene,0.1,h+0.3,0.15,M.fabric,cx+0.08,cy,z-w/2-0.15,{castShadow:false});
      box(scene,0.1,h+0.3,0.15,M.fabric,cx+0.08,cy,z+w/2+0.15,{castShadow:false});
    }
  }

  // --- OUTDOOR: CITY PARK ---
  const ground=new THREE.Mesh(new THREE.PlaneGeometry(100,100),
    new THREE.MeshStandardMaterial({color:0x4a8c3f,flatShading:true}));
  ground.rotation.x=-Math.PI/2; ground.position.y=-0.01;
  ground.receiveShadow=true; scene.add(ground);

  // Paved plaza in front of entrance
  const plazaMat=new THREE.MeshStandardMaterial({color:0xb8a88a,flatShading:true});
  const plaza=new THREE.Mesh(new THREE.PlaneGeometry(10,5),plazaMat);
  plaza.rotation.x=-Math.PI/2; plaza.position.set(0,0.01,8.5);
  plaza.receiveShadow=true; scene.add(plaza);
  for(let ix=-4;ix<=4;ix++) for(let iz=0;iz<4;iz++)
    box(scene,0.9,0.02,0.9,plazaMat,ix,0.02,6.5+iz,{castShadow:false,receiveShadow:true});

  // Main walkway
  const walkMat=new THREE.MeshStandardMaterial({color:0xc4b49a,flatShading:true});
  const walk=new THREE.Mesh(new THREE.PlaneGeometry(4,12),walkMat);
  walk.rotation.x=-Math.PI/2; walk.position.set(0,0.01,16);
  walk.receiveShadow=true; scene.add(walk);
  for(let iz=0;iz<12;iz++) for(let ix=-1;ix<=1;ix++)
    box(scene,0.9,0.02,0.9,walkMat,ix,0.02,10.5+iz,{castShadow:false});

  // Side paths
  [[6,14],[-6,14]].forEach(([px,pz])=>{
    const sw=new THREE.Mesh(new THREE.PlaneGeometry(8,2.5),walkMat);
    sw.rotation.x=-Math.PI/2; sw.position.set(px,0.01,pz);
    sw.receiveShadow=true; scene.add(sw);
  });

  // Circular plaza around fountain
  const circPlaza=new THREE.Mesh(new THREE.CircleGeometry(4,24),plazaMat);
  circPlaza.rotation.x=-Math.PI/2; circPlaza.position.set(0,0.01,24);
  circPlaza.receiveShadow=true; scene.add(circPlaza);
  const walk2=new THREE.Mesh(new THREE.PlaneGeometry(3,6),walkMat);
  walk2.rotation.x=-Math.PI/2; walk2.position.set(0,0.01,21);
  walk2.receiveShadow=true; scene.add(walk2);

  // --- TREES ---
  function buildTree(x,z,s=1){
    const th=2.0*s;
    cyl(scene,0.12*s,0.18*s,th,M.woodDark,x,th/2,z,6);
    const cc=[0x2ecc71,0x27ae60,0x1e8449,0x229954];
    const c=cc[Math.floor(Math.random()*cc.length)];
    const c1=new THREE.Mesh(new THREE.SphereGeometry(1.2*s,8,6),
      new THREE.MeshStandardMaterial({color:c,flatShading:true}));
    c1.position.set(x,th+0.8*s,z); c1.castShadow=true; scene.add(c1);
    const c2=new THREE.Mesh(new THREE.SphereGeometry(0.8*s,7,5),
      new THREE.MeshStandardMaterial({color:c,flatShading:true}));
    c2.position.set(x+0.5*s,th+1.3*s,z+0.3*s); c2.castShadow=true; scene.add(c2);
  }
  for(let i=0;i<5;i++){
    buildTree(-3.5,10+i*2.5,0.8+Math.random()*0.4);
    buildTree(3.5,10+i*2.5,0.8+Math.random()*0.4);
  }
  [[-8,18,1.2],[8,18,1.2],[-10,12,1.0],[10,12,1.0],[-6,26,1.1],[6,26,1.1],[0,30,1.3],[-12,20,1.0],[12,20,1.0]].forEach(([tx,tz,ts])=>buildTree(tx,tz,ts));

  // --- BENCHES ---
  function buildBench(x,z,ry=0){
    const g=new THREE.Group(); g.position.set(x,0,z); g.rotation.y=ry;
    const seat=new THREE.Mesh(new THREE.BoxGeometry(1.5,0.08,0.5),M.woodLight);
    seat.position.set(0,0.45,0); seat.castShadow=true; g.add(seat);
    const back=new THREE.Mesh(new THREE.BoxGeometry(1.5,0.4,0.06),M.woodLight);
    back.position.set(0,0.7,-0.22); back.castShadow=true; g.add(back);
    [[-0.6,-0.18],[0.6,-0.18],[-0.6,0.18],[0.6,0.18]].forEach(([lx,lz])=>{
      const leg=new THREE.Mesh(new THREE.BoxGeometry(0.06,0.45,0.06),M.darkMetal);
      leg.position.set(lx,0.225,lz); g.add(leg);
    });
    [-0.7,0.7].forEach(ax=>{
      const arm=new THREE.Mesh(new THREE.BoxGeometry(0.06,0.06,0.5),M.darkMetal);
      arm.position.set(ax,0.6,0); g.add(arm);
    });
    scene.add(g);
  }
  buildBench(-2.5,12,Math.PI/2); buildBench(2.5,14,-Math.PI/2);
  buildBench(-2.5,16,Math.PI/2); buildBench(2.5,18,-Math.PI/2);
  buildBench(-5,22,Math.PI/4); buildBench(5,22,-Math.PI/4);

  // --- FOUNTAIN ---
  const fg=new THREE.Group(); fg.position.set(0,0,24);
  const fBase=new THREE.Mesh(new THREE.CylinderGeometry(3,3.2,0.5,16),M.stone);
  fBase.position.y=0.25; fBase.castShadow=true; fBase.receiveShadow=true; fg.add(fBase);
  const fWater=new THREE.Mesh(new THREE.CylinderGeometry(2.8,2.8,0.1,16),M.water);
  fWater.position.y=0.45; fg.add(fWater);
  const col=new THREE.Mesh(new THREE.CylinderGeometry(0.2,0.3,1.5,8),M.stone);
  col.position.y=1.2; col.castShadow=true; fg.add(col);
  const bowl=new THREE.Mesh(new THREE.CylinderGeometry(0.8,0.5,0.3,12),M.stone);
  bowl.position.y=2.0; bowl.castShadow=true; fg.add(bowl);
  const topWater=new THREE.Mesh(new THREE.CylinderGeometry(0.7,0.7,0.05,12),M.water);
  topWater.position.y=2.15; fg.add(topWater);
  scene.add(fg);
  // Spray particles
  const sprayGeo=new THREE.BufferGeometry();
  const sprayCount=30;
  const sprayPos=new Float32Array(sprayCount*3);
  for(let i=0;i<sprayCount;i++){
    sprayPos[i*3]=(Math.random()-0.5)*0.5;
    sprayPos[i*3+1]=2.2+Math.random()*0.8;
    sprayPos[i*3+2]=(Math.random()-0.5)*0.5;
  }
  sprayGeo.setAttribute('position',new THREE.BufferAttribute(sprayPos,3));
  const spray=new THREE.Points(sprayGeo,new THREE.PointsMaterial({color:0xaaddff,size:0.04,transparent:true,opacity:0.6}));
  spray.position.set(0,0,24); spray.userData.isFountain=true; scene.add(spray);

  // --- FLOWER BEDS ---
  function buildFlowerBed(x,z,w,d){
    box(scene,w+0.2,0.25,0.1,M.stone,x,0.125,z-d/2-0.05);
    box(scene,w+0.2,0.25,0.1,M.stone,x,0.125,z+d/2+0.05);
    box(scene,0.1,0.25,d,M.stone,x-w/2-0.05,0.125,z);
    box(scene,0.1,0.25,d,M.stone,x+w/2+0.05,0.125,z);
    box(scene,w,0.15,d,M.soil,x,0.075,z,{castShadow:false});
    const fc=[0xff6b81,0xffd93d,0xff8c42,0xe05656,0xff9ff3,0xf368e0];
    for(let r=0;r<Math.floor(d/0.4);r++) for(let c=0;c<Math.floor(w/0.4);c++){
      if(Math.random()>0.3){
        const fx=x-w/2+0.3+c*0.4, fz=z-d/2+0.3+r*0.4;
        const stem=new THREE.Mesh(new THREE.CylinderGeometry(0.015,0.015,0.2,4),
          new THREE.MeshStandardMaterial({color:0x27ae60}));
        stem.position.set(fx,0.25,fz); scene.add(stem);
        const fl=new THREE.Mesh(new THREE.SphereGeometry(0.05,6,5),
          new THREE.MeshStandardMaterial({color:fc[Math.floor(Math.random()*fc.length)],flatShading:true}));
        fl.position.set(fx,0.37,fz); scene.add(fl);
      }
    }
  }
  buildFlowerBed(-6,9,3,2); buildFlowerBed(6,9,3,2);
  buildFlowerBed(-8,15,2.5,2); buildFlowerBed(8,15,2.5,2);

  // --- BUSHES ---
  [[-3,8],[3,8],[-9,10],[9,10],[-4,20],[4,20],[-11,15],[11,15]].forEach(([bx,bz])=>{
    const b=new THREE.Mesh(new THREE.SphereGeometry(0.5,7,5),
      new THREE.MeshStandardMaterial({color:0x1e8449,flatShading:true}));
    b.position.set(bx,0.35,bz); b.castShadow=true; scene.add(b);
  });

  // --- HEDGE boundary ---
  for(let i=-15;i<=15;i+=1.5){
    if(Math.abs(i)<3)continue;
    box(scene,1.4,1.0,0.6,M.hedge,i,0.5,30,{castShadow:true});
  }
  for(let i=8;i<=30;i+=1.5){
    box(scene,0.6,1.0,1.4,M.hedge,-14,0.5,i,{castShadow:true});
    box(scene,0.6,1.0,1.4,M.hedge,14,0.5,i,{castShadow:true});
  }

  // --- STREET LAMPS ---
  function buildLamp(x,z){
    cyl(scene,0.06,0.08,3.5,M.darkMetal,x,1.75,z,8);
    const head=new THREE.Mesh(new THREE.SphereGeometry(0.2,8,6),
      new THREE.MeshStandardMaterial({color:0xffe0a0,emissive:0xffc060,emissiveIntensity:1.5}));
    head.position.set(x,3.6,z); scene.add(head);
    const l=new THREE.PointLight(0xffc873,5,8,2);
    l.position.set(x,3.5,z); scene.add(l);
  }
  buildLamp(-2,10); buildLamp(2,12); buildLamp(-2,14); buildLamp(2,16);
  buildLamp(-2,18); buildLamp(2,20); buildLamp(-4,24); buildLamp(4,24);

  // --- CITY SKYLINE ---
  function buildBuilding(x,z,w,d,h,mat){
    const b=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),mat);
    b.position.set(x,h/2,z); scene.add(b);
    const rows=Math.floor(h/2), cols=Math.floor(w/1.5);
    for(let r=0;r<rows;r++) for(let c=0;c<cols;c++){
      if(Math.random()>0.3){
        const win=new THREE.Mesh(new THREE.PlaneGeometry(0.6,0.8),M.windowLit);
        win.position.set(x-w/2+0.8+c*1.5,1.5+r*2,z+d/2+0.01);
        scene.add(win);
      }
    }
  }
  buildBuilding(-20,45,8,6,20,M.building);
  buildBuilding(-10,48,6,8,28,M.building2);
  buildBuilding(0,50,10,8,24,M.building);
  buildBuilding(10,48,7,6,32,M.building2);
  buildBuilding(20,45,9,7,18,M.building);
  buildBuilding(28,42,6,6,22,M.building2);
  buildBuilding(-28,42,7,7,16,M.building);
  buildBuilding(30,20,8,10,25,M.building);
  buildBuilding(32,5,6,8,20,M.building2);
  buildBuilding(30,-10,10,8,30,M.building);
  buildBuilding(-30,20,8,10,22,M.building2);
  buildBuilding(-32,5,6,8,28,M.building);
  buildBuilding(-30,-10,10,8,18,M.building2);

  // --- FLOOR ---
  box(scene,W,0.2,D,M.floor,0,-0.1,0);
  for(let i=-hw+1;i<hw;i+=1.5) box(scene,0.04,0.21,D,M.floorDark,i,-0.095,0,{castShadow:false});
  box(scene,W,0.2,D,M.ceiling,0,H+0.1,0);

  // --- SOUTH WALL (entrance) ---
  const dw=W/2-0.8;
  // Window dimensions
  const winW=2.0, winH=1.7, winY1=1.2, winY2=winY1+winH;
  const winLX1=-5.5, winLX2=-3.5; // left window x range
  const winRX1=3.5, winRX2=5.5;   // right window x range
  const wallZ=hd+T/2;

  // Left section (x: -8 to -0.8) with window opening
  // Bottom
  box(scene,dw,winY1,T,M.wall,-(0.8+dw/2),winY1/2,wallZ);
  // Top
  box(scene,dw,H-winY2,T,M.wall,-(0.8+dw/2),winY2+(H-winY2)/2,wallZ);
  // Middle-left
  const mlw=winLX1-(-hw);
  box(scene,mlw,winH,T,M.wall,-hw+mlw/2,(winY1+winY2)/2,wallZ);
  // Middle-right
  const mrw=-0.8-winLX2;
  box(scene,mrw,winH,T,M.wall,winLX2+mrw/2,(winY1+winY2)/2,wallZ);
  addCollider(-(0.8+dw/2),H/2,wallZ,dw,H,T);

  // Right section (x: 0.8 to 8) with window opening
  box(scene,dw,winY1,T,M.wall,(0.8+dw/2),winY1/2,wallZ);
  box(scene,dw,H-winY2,T,M.wall,(0.8+dw/2),winY2+(H-winY2)/2,wallZ);
  const mlw2=winRX1-0.8;
  box(scene,mlw2,winH,T,M.wall,0.8+mlw2/2,(winY1+winY2)/2,wallZ);
  const mrw2=hw-winRX2;
  box(scene,mrw2,winH,T,M.wall,winRX2+mrw2/2,(winY1+winY2)/2,wallZ);
  addCollider((0.8+dw/2),H/2,wallZ,dw,H,T);

  // Above door
  box(scene,1.6,H-2.5,T,M.wall,0,2.5+(H-2.5)/2,wallZ);

  // Window frames + glass
  buildWindowFrame(-4.5,(winY1+winY2)/2,wallZ,winW,winH,true);
  buildWindowFrame(4.5,(winY1+winY2)/2,wallZ,winW,winH,true);

  // Flower boxes under south windows
  [[-4.5],[4.5]].forEach(([fx])=>{
    box(scene,winW+0.2,0.2,0.35,M.woodDark,fx,winY1-0.15,wallZ+0.25);
    for(let fi=0;fi<5;fi++){
      const fz=fx-winW/2+0.2+fi*(winW-0.4)/4;
      const colors=[0xff6b81,0xffd93d,0xff8c42,0xe05656,0xff6b81];
      const flower=new THREE.Mesh(new THREE.SphereGeometry(0.06,6,5),
        new THREE.MeshStandardMaterial({color:colors[fi],flatShading:true}));
      flower.position.set(fz,winY1+0.05,wallZ+0.25);
      scene.add(flower);
      const stem=new THREE.Mesh(new THREE.CylinderGeometry(0.01,0.01,0.12,4),
        new THREE.MeshStandardMaterial({color:0x27ae60}));
      stem.position.set(fz,winY1-0.02,wallZ+0.25);
      scene.add(stem);
    }
  });

  // Door frame
  box(scene,0.15,2.5,0.4,M.woodDark,-0.8,1.25,wallZ);
  box(scene,0.15,2.5,0.4,M.woodDark,0.8,1.25,wallZ);
  box(scene,1.75,0.15,0.4,M.woodDark,0,2.55,wallZ);

  // Door
  const doorPivot=new THREE.Group();
  doorPivot.position.set(-0.75,0,hd);
  const doorMesh=new THREE.Mesh(new THREE.BoxGeometry(1.5,2.5,0.08),M.wood);
  doorMesh.position.set(0.75,1.25,0);
  doorMesh.castShadow=true; doorMesh.receiveShadow=true;
  doorPivot.add(doorMesh);
  const handle=new THREE.Mesh(new THREE.SphereGeometry(0.05,8,6),M.gold);
  handle.position.set(1.35,1.15,0.07); doorPivot.add(handle);
  scene.add(doorPivot);
  addInteractable(doorPivot,'door','Click to open/close door');
  const doorCollider=addCollider(0,1.25,hd,1.6,2.5,0.2);

  // --- HANGING SIGN (horizontal, flat against wall) ---
  function buildHangingSign(x,y,z,text){
    // Canvas texture
    const c=document.createElement('canvas');
    c.width=640; c.height=220;
    const ctx=c.getContext('2d');
    // Background - dark wood
    const grad=ctx.createLinearGradient(0,0,0,220);
    grad.addColorStop(0,'#2c1810');
    grad.addColorStop(1,'#1a0f08');
    ctx.fillStyle=grad;
    ctx.fillRect(0,0,640,220);
    // Wood grain lines
    ctx.strokeStyle='rgba(100,60,30,0.3)';
    ctx.lineWidth=1;
    for(let i=0;i<8;i++){
      ctx.beginPath();
      ctx.moveTo(0,25+i*26);
      ctx.bezierCurveTo(160,20+i*26,480,30+i*26,640,25+i*26);
      ctx.stroke();
    }
    // Gold border
    ctx.strokeStyle='#d4a537';
    ctx.lineWidth=8;
    ctx.strokeRect(14,14,612,192);
    ctx.strokeStyle='#b8860b';
    ctx.lineWidth=2;
    ctx.strokeRect(24,24,592,172);
    // Corner decorations
    ctx.fillStyle='#d4a537';
    [[36,36],[604,36],[36,184],[604,184]].forEach(([cx,cy])=>{
      ctx.beginPath(); ctx.arc(cx,cy,8,0,Math.PI*2); ctx.fill();
    });
    // Coffee bean icon
    ctx.save();
    ctx.translate(80,105);
    ctx.fillStyle='#8b4513';
    ctx.beginPath(); ctx.ellipse(0,0,22,15,0.3,0,Math.PI*2); ctx.fill();
    ctx.strokeStyle='#5c2e0a';
    ctx.lineWidth=2;
    ctx.beginPath(); ctx.moveTo(-12,-6); ctx.quadraticCurveTo(0,0,12,6); ctx.stroke();
    ctx.restore();
    // Text
    ctx.fillStyle='#faebd7';
    ctx.font='bold 62px Georgia,serif';
    ctx.textAlign='center';
    ctx.textBaseline='middle';
    ctx.shadowColor='rgba(0,0,0,0.5)';
    ctx.shadowBlur=4;
    ctx.shadowOffsetX=2;
    ctx.shadowOffsetY=2;
    ctx.fillText(text,340,100);
    ctx.shadowColor='transparent';
    // Tagline
    ctx.fillStyle='#c4a882';
    ctx.font='italic 20px Georgia,serif';
    ctx.fillText('~ Fine Coffee & Tea ~',340,160);

    const tex=new THREE.CanvasTexture(c);
    tex.minFilter=THREE.LinearFilter;
    tex.colorSpace=THREE.SRGBColorSpace;

    // Sign group
    const g=new THREE.Group();
    g.position.set(x,y,z);
    // Board (horizontal, parallel to wall, faces +z)
    const faceMat=new THREE.MeshStandardMaterial({map:tex});
    const sideMat=M.woodDark;
    const board=new THREE.Mesh(new THREE.BoxGeometry(2.4,0.85,0.08),
      [sideMat,sideMat,sideMat,sideMat,faceMat,sideMat]);
    board.castShadow=true;
    g.add(board);
    // Gold trim - top/bottom
    const trimMat=new THREE.MeshStandardMaterial({color:0xd4a537,flatShading:true});
    const trimTB=new THREE.BoxGeometry(2.5,0.06,0.1);
    const trimTop=new THREE.Mesh(trimTB,trimMat);
    trimTop.position.y=0.46; g.add(trimTop);
    const trimBot=new THREE.Mesh(trimTB,trimMat);
    trimBot.position.y=-0.46; g.add(trimBot);
    // Gold trim - left/right
    const trimLR=new THREE.BoxGeometry(0.06,0.95,0.1);
    const trimL=new THREE.Mesh(trimLR,trimMat);
    trimL.position.x=-1.23; g.add(trimL);
    const trimR=new THREE.Mesh(trimLR,trimMat);
    trimR.position.x=1.23; g.add(trimR);
    // Mounting bolts
    [[-1.0,0.35],[1.0,0.35],[-1.0,-0.35],[1.0,-0.35]].forEach(([bx,by])=>{
      const bolt=new THREE.Mesh(new THREE.SphereGeometry(0.035,8,6),M.gold);
      bolt.position.set(bx,by,0.05);
      g.add(bolt);
    });
    // Back mounting brackets
    [-0.8,0.8].forEach(bx=>{
      const bracket=new THREE.Mesh(new THREE.BoxGeometry(0.15,0.3,0.06),M.darkMetal);
      bracket.position.set(bx,0,-0.07);
      g.add(bracket);
    });
    // Small shelf under sign
    box(scene,2.6,0.06,0.3,M.woodDark,x,y-0.55,z+0.1);
    // Spotlight above sign
    const spot=new THREE.Mesh(new THREE.CylinderGeometry(0.06,0.08,0.15,8),M.darkMetal);
    spot.position.set(x,y+0.65,z+0.05);
    scene.add(spot);
    const spotLight=new THREE.PointLight(0xffe0a0,3,4,2);
    spotLight.position.set(x,y+0.6,z+0.2);
    scene.add(spotLight);
    scene.add(g);
    return g;
  }
  buildHangingSign(2.5,3.15,hd+T+0.06,'SHOEGAZERS');

  // --- NORTH WALL ---
  box(scene,W,H,T,M.wall,0,H/2,-hd-T/2);
  addCollider(0,H/2,-hd-T/2,W,H,T);
  box(scene,W,1.0,0.05,M.wallAccent,0,0.5,-hd+0.03,{castShadow:false});

  // --- WEST WALL ---
  const wwX=-hw-T/2;
  const wWin1Z1=-2.5, wWin1Z2=0.5;
  const wWin2Z1=2.0, wWin2Z2=5.0;
  const wWinY1=1.3, wWinY2=3.0;
  // Bottom
  box(scene,T,wWinY1,D,M.wall,wwX,wWinY1/2,0);
  // Top
  box(scene,T,H-wWinY2,D,M.wall,wwX,wWinY2+(H-wWinY2)/2,0);
  // Between windows
  const betD=wWin2Z1-wWin1Z2;
  box(scene,T,wWinY2-wWinY1,betD,M.wall,wwX,(wWinY1+wWinY2)/2,wWin1Z2+betD/2);
  // Left of window 1
  const leftD=wWin1Z1-(-hd);
  box(scene,T,wWinY2-wWinY1,leftD,M.wall,wwX,(wWinY1+wWinY2)/2,-hd+leftD/2);
  // Right of window 2
  const rightD=hd-wWin2Z2;
  box(scene,T,wWinY2-wWinY1,rightD,M.wall,wwX,(wWinY1+wWinY2)/2,wWin2Z2+rightD/2);
  addCollider(wwX,H/2,0,T,H,D);
  // Window frames
  buildWindowFrame(wwX,(wWinY1+wWinY2)/2,(wWin1Z1+wWin1Z2)/2,wWin1Z2-wWin1Z1,wWinY2-wWinY1,false);
  buildWindowFrame(wwX,(wWinY1+wWinY2)/2,(wWin2Z1+wWin2Z2)/2,wWin2Z2-wWin2Z1,wWinY2-wWinY1,false);

  // --- EAST WALL ---
  box(scene,T,H,D,M.wall,hw+T/2,H/2,0);
  addCollider(hw+T/2,H/2,0,T,H,D);

  // Base trim
  box(scene,W+0.1,0.15,0.1,M.woodDark,0,0.075,hd+0.2,{castShadow:false});
  box(scene,W+0.1,0.15,0.1,M.woodDark,0,0.075,-hd-0.2,{castShadow:false});
  box(scene,0.1,0.15,D+0.1,M.woodDark,hw+0.2,0.075,0,{castShadow:false});
  box(scene,0.1,0.15,D+0.1,M.woodDark,-hw-0.2,0.075,0,{castShadow:false});

  // --- COUNTER ---
  box(scene,1.2,1.0,6,M.counter,hw-0.6,0.5,0);
  box(scene,1.3,0.06,6.2,M.woodLight,hw-0.6,1.03,0);
  addCollider(hw-0.6,0.5,0,1.2,1.0,6);

  // Display case
  box(scene,0.8,0.5,2.5,M.glass,hw-0.6,1.3,1.5,{castShadow:false});
  box(scene,0.85,0.05,2.55,M.woodDark,hw-0.6,1.06,1.5);
  for(let i=0;i<4;i++){
    cyl(scene,0.1,0.08,0.12,M.brown,hw-0.6,1.15,0.6+i*0.6,8);
    cyl(scene,0.12,0.1,0.06,M.cream,hw-0.6,1.24,0.6+i*0.6,8);
  }

  // --- TABLES & CHAIRS ---
  const tables=[[-3,0],[-0.5,3],[-4,-3],[3,-3]];
  tables.forEach(([tx,tz])=>{
    cyl(scene,0.7,0.7,0.06,M.woodLight,tx,0.75,tz,8);
    cyl(scene,0.06,0.08,0.72,M.darkMetal,tx,0.37,tz,6);
    cyl(scene,0.3,0.35,0.05,M.darkMetal,tx,0.03,tz,8);
    addCollider(tx,0.4,tz,1.3,0.8,1.3);

    [0.6,Math.PI-0.6,Math.PI/2+0.3,-Math.PI/2-0.3].forEach(a=>{
      const cx=tx+Math.cos(a)*1.1, cz=tz+Math.sin(a)*1.1;
      // Chair seat
      box(scene,0.45,0.06,0.45,M.fabric,cx,0.45,cz,{ry:a});
      // Back
      box(scene,0.45,0.5,0.06,M.fabric,cx-Math.cos(a)*0.2,0.75,cz-Math.sin(a)*0.2,{ry:a});
      // Legs
      [[-0.18,-0.18],[0.18,-0.18],[-0.18,0.18],[0.18,0.18]].forEach(([lx,lz])=>{
        const rx=cx+lx*Math.cos(a)-lz*Math.sin(a);
        const rz=cz+lx*Math.sin(a)+lz*Math.cos(a);
        box(scene,0.04,0.45,0.04,M.woodDark,rx,0.22,rz);
      });
      addCollider(cx,0.4,cz,0.5,0.8,0.5);
    });
  });

  // --- SHELVES ---
  for(let s=0;s<3;s++){
    const sy=1.5+s*0.7;
    box(scene,0.3,0.05,3.5,M.woodLight,-hw+0.2,sy,2);
    for(let i=0;i<5;i++){
      const colors=[M.red,M.green,M.gold,M.cream,M.brown];
      box(scene,0.15,0.25,0.15,colors[i%5],-hw+0.2,sy+0.15,0.8+i*0.7);
    }
  }

  // --- PLANTS ---
  cyl(scene,0.25,0.2,0.4,M.cream,-hw+0.4,0.2,-hd+0.4,8);
  const leaves=new THREE.Mesh(new THREE.SphereGeometry(0.4,6,5),
    new THREE.MeshStandardMaterial({color:0x27ae60,flatShading:true}));
  leaves.position.set(-hw+0.4,0.8,-hd+0.4); leaves.castShadow=true; scene.add(leaves);
  addCollider(-hw+0.4,0.4,-hd+0.4,0.6,0.8,0.6);

  cyl(scene,0.25,0.2,0.4,M.cream,hw-0.4,0.2,hd-0.4,8);
  const leaves2=new THREE.Mesh(new THREE.SphereGeometry(0.4,6,5),
    new THREE.MeshStandardMaterial({color:0x27ae60,flatShading:true}));
  leaves2.position.set(hw-0.4,0.8,hd-0.4); leaves2.castShadow=true; scene.add(leaves2);
  addCollider(hw-0.4,0.4,hd-0.4,0.6,0.8,0.6);

  // --- COFFEE MACHINE on counter ---
  const cmGroup=new THREE.Group();
  cmGroup.position.set(hw-0.6,1.06,-1.5);
  // Body
  const cmBody=new THREE.Mesh(new THREE.BoxGeometry(0.5,0.6,0.4),M.darkMetal);
  cmBody.position.set(0,0.3,0); cmBody.castShadow=true; cmGroup.add(cmBody);
  // Top
  const cmTop=new THREE.Mesh(new THREE.BoxGeometry(0.55,0.08,0.45),M.metal);
  cmTop.position.set(0,0.64,0); cmGroup.add(cmTop);
  // Spout
  const cmSpout=new THREE.Mesh(new THREE.CylinderGeometry(0.03,0.02,0.15,8),M.gold);
  cmSpout.position.set(0,0.15,0.25); cmGroup.add(cmSpout);
  // Drip tray
  const cmTray=new THREE.Mesh(new THREE.BoxGeometry(0.3,0.03,0.2),M.metal);
  cmTray.position.set(0,0.02,0.25); cmGroup.add(cmTray);
  // Buttons
  for(let i=0;i<3;i++){
    const btn=new THREE.Mesh(new THREE.CylinderGeometry(0.025,0.025,0.02,8),
      new THREE.MeshStandardMaterial({color:[0xff0000,0x00ff00,0x0000ff][i],emissive:[0xff0000,0x00ff00,0x0000ff][i],emissiveIntensity:0.5}));
    btn.rotation.x=Math.PI/2;
    btn.position.set(-0.1+i*0.1,0.45,0.21);
    cmGroup.add(btn);
  }
  scene.add(cmGroup);
  addInteractable(cmGroup,'coffee_machine','Click to order coffee');

  // --- FILM PROJECTOR ---
  // Stand/table
  box(scene,1.0,0.8,0.6,M.wood,0,0.4,-hd+0.5);
  addCollider(0,0.4,-hd+0.5,1.0,0.8,0.6);

  // Projector body
  const projGroup=new THREE.Group();
  projGroup.position.set(0,1.05,-hd+0.5);
  const projBody=new THREE.Mesh(new THREE.BoxGeometry(0.5,0.35,0.7),M.darkMetal);
  projBody.castShadow=true; projGroup.add(projBody);
  // Lens
  const lens=new THREE.Mesh(new THREE.CylinderGeometry(0.06,0.08,0.2,12),M.black);
  lens.rotation.x=Math.PI/2; lens.position.set(0,0,0.45); projGroup.add(lens);
  // Lens ring
  const lensRing=new THREE.Mesh(new THREE.TorusGeometry(0.06,0.015,8,16),M.gold);
  lensRing.position.set(0,0,0.55); projGroup.add(lensRing);

  // Reels
  const reelGeo=new THREE.CylinderGeometry(0.18,0.18,0.04,12);
  const reelMat=M.metal;
  const reel1=new THREE.Mesh(reelGeo,reelMat);
  reel1.rotation.x=Math.PI/2; reel1.position.set(-0.15,0.3,-0.15);
  reel1.castShadow=true; projGroup.add(reel1);
  const reel2=new THREE.Mesh(reelGeo,reelMat);
  reel2.rotation.x=Math.PI/2; reel2.position.set(0.15,0.3,0.15);
  reel2.castShadow=true; projGroup.add(reel2);
  // Reel spokes
  [reel1,reel2].forEach(reel=>{
    for(let i=0;i<4;i++){
      const spoke=new THREE.Mesh(new THREE.BoxGeometry(0.3,0.02,0.02),M.darkMetal);
      spoke.rotation.z=i*Math.PI/4;
      reel.add(spoke);
    }
  });
  scene.add(projGroup);

  // Light beam (cone)
  const beamGeo=new THREE.ConeGeometry(1.2,4,16,1,true);
  const beamMat=new THREE.MeshBasicMaterial({color:0xffffcc,transparent:true,opacity:0.06,side:THREE.DoubleSide,depthWrite:false});
  const beam=new THREE.Mesh(beamGeo,beamMat);
  beam.position.set(0,1.05,-hd+0.5+2.2);
  beam.rotation.x=-Math.PI/2;
  scene.add(beam);

  // Projection screen on north wall
  const screenMesh=new THREE.Mesh(new THREE.PlaneGeometry(3.5,2.2),
    new THREE.MeshStandardMaterial({color:0x111122,emissive:0x2233aa,emissiveIntensity:0.3}));
  screenMesh.position.set(0,2.5,-hd+0.02);
  scene.add(screenMesh);
  // Screen frame
  box(scene,3.7,0.08,0.06,M.woodDark,0,3.65,-hd+0.05);
  box(scene,3.7,0.08,0.06,M.woodDark,0,1.35,-hd+0.05);
  box(scene,0.08,2.4,0.06,M.woodDark,-1.85,2.5,-hd+0.05);
  box(scene,0.08,2.4,0.06,M.woodDark,1.85,2.5,-hd+0.05);

  // Poster on the projection screen
  const posterTex=new THREE.TextureLoader().load('20261104162033_1538_25.png');
  posterTex.colorSpace=THREE.SRGBColorSpace;
  const posterAspect=1696/2528;
  const posterH=2.2, posterW=posterH*posterAspect;
  const posterMesh=new THREE.Mesh(new THREE.PlaneGeometry(posterW,posterH),
    new THREE.MeshStandardMaterial({map:posterTex}));
  posterMesh.position.set(0,2.5,-hd+0.04);
  scene.add(posterMesh);
  addInteractable(posterMesh,'poster','Click to view poster');

  // --- TV SCREEN (video) ---
  const tvGroup=new THREE.Group();
  tvGroup.position.set(-3,2.5,-hd+0.06);
  // TV frame
  const tvFrame=new THREE.Mesh(new THREE.BoxGeometry(1.8,1.1,0.08),M.black);
  tvGroup.add(tvFrame);
  // TV screen
  const tvScreen=new THREE.Mesh(new THREE.PlaneGeometry(1.7,1.0),
    new THREE.MeshStandardMaterial({color:0x0a0a0a,emissive:0x111111,emissiveIntensity:0.2}));
  tvScreen.position.z=0.045;
  tvGroup.add(tvScreen);
  scene.add(tvGroup);
  addInteractable(tvGroup,'tv','Click to play/pause video');

  // --- FILM STRIP (clickable, on wall) ---
  const filmGroup=new THREE.Group();
  filmGroup.position.set(3.5,2.5,-hd+0.08);
  // Film strip frame
  const filmFrame=new THREE.Mesh(new THREE.BoxGeometry(1.4,1.0,0.06),M.woodDark);
  filmGroup.add(filmFrame);
  // Film frames
  for(let r=0;r<2;r++){
    for(let c=0;c<4;c++){
      const frame=new THREE.Mesh(new THREE.PlaneGeometry(0.25,0.3),
        new THREE.MeshStandardMaterial({color:0x333344,emissive:0x6644aa,emissiveIntensity:0.2}));
      frame.position.set(-0.5+c*0.33,-0.25+r*0.5,0.04);
      filmGroup.add(frame);
    }
  }
  // Film strip decorations (perforations)
  for(let i=0;i<8;i++){
    const perf=new THREE.Mesh(new THREE.BoxGeometry(0.06,0.08,0.02),M.black);
    perf.position.set(-0.6+i*0.17,0.42,0.04);
    filmGroup.add(perf);
  }
  scene.add(filmGroup);
  addInteractable(filmGroup,'film_strip','Click to open website');

  // Caption plaque under the film strip
  const capGroup=new THREE.Group();
  capGroup.position.set(3.5,1.75,-hd+0.10);
  capGroup.add(new THREE.Mesh(new THREE.BoxGeometry(1.5,0.4,0.05),M.woodDark));
  // Gold border
  const capTrimMat=new THREE.MeshStandardMaterial({color:0xd4a537,flatShading:true});
  [[0,0.185,1.54,0.03],[0,-0.185,1.54,0.03]].forEach(([x,y,w,h])=>{
    const t=new THREE.Mesh(new THREE.BoxGeometry(w,h,0.055),capTrimMat);
    t.position.set(x,y,0); capGroup.add(t);
  });
  [[-0.735,0],[0.735,0]].forEach(([x,y])=>{
    const t=new THREE.Mesh(new THREE.BoxGeometry(0.03,0.36,0.055),capTrimMat);
    t.position.set(x,y,0); capGroup.add(t);
  });
  // Text (auto-fit to plaque)
  const capText='Take your time and enjoy!';
  const capCanvas=document.createElement('canvas');
  capCanvas.width=1400; capCanvas.height=280;
  const capCtx=capCanvas.getContext('2d');
  let capFs=110;
  capCtx.font=`italic ${capFs}px Georgia,serif`;
  while(capCtx.measureText(capText).width>1280 && capFs>40){
    capFs-=5;
    capCtx.font=`italic ${capFs}px Georgia,serif`;
  }
  capCtx.fillStyle='#faebd7';
  capCtx.textAlign='center';
  capCtx.textBaseline='middle';
  capCtx.fillText(capText,700,140);
  const capTex=new THREE.CanvasTexture(capCanvas);
  capTex.minFilter=THREE.LinearFilter;
  capTex.colorSpace=THREE.SRGBColorSpace;
  const capMesh=new THREE.Mesh(new THREE.PlaneGeometry(1.4,0.28),
    new THREE.MeshBasicMaterial({map:capTex,transparent:true}));
  capMesh.position.z=0.028;
  capGroup.add(capMesh);
  scene.add(capGroup);

  // --- WALL DECOR ---
  // Painting frames
  [[3,2.8,-hd+0.05],[-hw+0.05,2.5,3]].forEach(([px,py,pz],idx)=>{
    box(scene,1.2,0.9,0.04,M.woodDark,px,py,pz);
    const canvas=new THREE.Mesh(new THREE.PlaneGeometry(1.0,0.7),
      new THREE.MeshStandardMaterial({color:[0x4477aa,0x27ae60][idx],flatShading:true}));
    canvas.position.set(px,py,pz+(pz<0?0.03:-0.03));
    if(pz<0) canvas.rotation.y=0;
    scene.add(canvas);
  });

  // Clock on wall
  cyl(scene,0.3,0.3,0.05,M.cream,hw-0.05,3.0,0,16,{rz:Math.PI/2});
  const clockFace=new THREE.Mesh(new THREE.CircleGeometry(0.25,16),M.white);
  clockFace.position.set(hw-0.1,3.0,0);
  clockFace.rotation.y=-Math.PI/2;
  scene.add(clockFace);
  // Clock hands
  box(scene,0.02,0.15,0.01,M.black,hw-0.12,3.05,0);
  box(scene,0.02,0.1,0.01,M.black,hw-0.12,3.0,0.03);

  // --- MENU BOARD ---
  const menuPages=[
    {title:'INT6066',subtitle:'Innovative Learning Environment with Technology',items:[]},
  ];
  const menuCanvas=document.createElement('canvas');
  menuCanvas.width=1000; menuCanvas.height=600;
  const menuCtx=menuCanvas.getContext('2d');
  function drawMenuPage(idx){
    const ctx=menuCtx,w=1000,h=600;
    ctx.fillStyle='#1a1a1a'; ctx.fillRect(0,0,w,h);
    ctx.strokeStyle='#c8956c'; ctx.lineWidth=6; ctx.strokeRect(18,18,w-36,h-36);
    ctx.strokeStyle='#8b6f47'; ctx.lineWidth=2; ctx.strokeRect(30,30,w-60,h-60);
    const page=menuPages[idx];
    ctx.fillStyle='#e8c9a0'; ctx.font='bold 72px Georgia,serif'; ctx.textAlign='center'; ctx.textBaseline='middle';
    ctx.fillText(page.title,w/2,100);
    ctx.fillStyle='#8b6f47'; ctx.font='italic 26px Georgia,serif';
    ctx.fillText(page.subtitle,w/2,165);
    ctx.strokeStyle='#c8956c'; ctx.lineWidth=2;
    ctx.beginPath(); ctx.moveTo(200,200); ctx.lineTo(800,200); ctx.stroke();
    if(page.items.length===0){
      ctx.fillStyle='#f5e6d0'; ctx.font='36px Georgia,serif';
      ctx.fillText('Welcome to the Course!',w/2,320);
    } else {
      ctx.font='32px Georgia,serif'; ctx.textAlign='left';
      page.items.forEach(([name,price],i)=>{
        if(!name) return;
        const y=250+i*58;
        ctx.fillStyle='#f5e6d0'; ctx.fillText(name,120,y);
        ctx.fillStyle='#e8c9a0'; ctx.textAlign='right'; ctx.fillText(price,880,y); ctx.textAlign='left';
      });
    }
  }
  drawMenuPage(0);
  const menuTex=new THREE.CanvasTexture(menuCanvas);
  menuTex.minFilter=THREE.LinearFilter;
  menuTex.colorSpace=THREE.SRGBColorSpace;

  const menuBoardGroup=new THREE.Group();
  menuBoardGroup.position.set(hw-1.3,2.5,-1.5);
  const menuFrame=new THREE.Mesh(new THREE.BoxGeometry(2.2,1.4,0.06),M.woodDark);
  menuBoardGroup.add(menuFrame);
  const menuPlane=new THREE.Mesh(new THREE.PlaneGeometry(2.0,1.2),
    new THREE.MeshStandardMaterial({map:menuTex}));
  menuPlane.position.z=0.035;
  menuBoardGroup.add(menuPlane);
  scene.add(menuBoardGroup);

  // Rug in center
  const rug=new THREE.Mesh(new THREE.CircleGeometry(2.0,16),
    new THREE.MeshStandardMaterial({color:0x8b4513,flatShading:true}));
  rug.rotation.x=-Math.PI/2; rug.position.set(0,0.01,0);
  rug.receiveShadow=true; scene.add(rug);
  const rugInner=new THREE.Mesh(new THREE.CircleGeometry(1.5,16),
    new THREE.MeshStandardMaterial({color:0xa0522d,flatShading:true}));
  rugInner.rotation.x=-Math.PI/2; rugInner.position.set(0,0.02,0);
  rugInner.receiveShadow=true; scene.add(rugInner);

  // Dust particles in projector beam
  const dustGeo=new THREE.BufferGeometry();
  const dustCount=60;
  const dustPos=new Float32Array(dustCount*3);
  for(let i=0;i<dustCount;i++){
    dustPos[i*3]=(Math.random()-0.5)*1.5;
    dustPos[i*3+1]=Math.random()*2+0.8;
    dustPos[i*3+2]=(Math.random()-0.5)*3-2;
  }
  dustGeo.setAttribute('position',new THREE.BufferAttribute(dustPos,3));
  const dustMat=new THREE.PointsMaterial({color:0xffffcc,size:0.02,transparent:true,opacity:0.6});
  const dust=new THREE.Points(dustGeo,dustMat);
  scene.add(dust);

  return {
    doorPivot,doorCollider,
    reels:[reel1,reel2],
    beam,screenMesh,
    posterMesh,
    tvGroup,tvScreen,
    dust,
    filmGroup,
    cmGroup,
    fountainSpray:spray
  };
}