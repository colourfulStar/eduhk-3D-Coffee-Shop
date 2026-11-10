import * as THREE from 'three';
import { PointerLockControls } from 'three/addons/controls/PointerLockControls.js';
import { M, buildWorld, box, cyl } from './world.js';

// === DOM ===
const startScreen=document.getElementById('start-screen');
const promptEl=document.getElementById('prompt');
const notifEl=document.getElementById('notification');
const coffeeMenu=document.getElementById('coffee-menu');
const coffeeList=document.getElementById('coffee-list');
const btnMake=document.getElementById('btn-make');
const btnCancel=document.getElementById('btn-cancel');
const btnStart=document.getElementById('btn-start');

// === STATE ===
let scene,camera,renderer,controls,clock;
let colliders=[],interactables=[];
let raycaster,centerRay;
let highlightedObj=null;
let doorOpen=false,doorPivot,doorCollider;
let coffeeCupMesh=null,handCup=null,cupOnCounter=false,cupInHand=false,drinkAnimT=0;
let projectorReels=[],projectorBeam,screenMesh,screenTime=0;
let posterMesh=null;
let tvScreenMesh=null,tvGroupRef=null,videoEl=null,videoOverlay=null,videoTexture=null,videoPlaying=false,lastVideoTime=-1;
let dustParticles;
let fountainSpray;
let selectedCoffee=null;
let isPointerLocked=false;
let menuOpen=false;
let lightboxOpen=false;
let notificationTimer=null;
let worldRefs={};

// === AUDIO: JAZZ ===
let audioCtx=null,masterGain=null,musicPlaying=false,sequenceTimer=null,currentChord=0;
const JC=[
  {pad:[146.83,174.61,220,261.63,329.63],bass:[73.42,87.31,110,130.81]},
  {pad:[196,246.94,293.66,349.23],bass:[98,123.47,146.83,174.61]},
  {pad:[261.63,329.63,392,493.88],bass:[65.41,82.41,98,123.47]},
  {pad:[220,311.13,329.63,392],bass:[55,82.41,98,110]},
];
function initAudio(){
  audioCtx=new (window.AudioContext||window.webkitAudioContext)();
  masterGain=audioCtx.createGain();
  masterGain.gain.value=0.2;
  const filter=audioCtx.createBiquadFilter();
  filter.type='lowpass'; filter.frequency.value=3000; filter.Q.value=0.5;
  masterGain.connect(filter); filter.connect(audioCtx.destination);
}
function playNote(freq,dur,type,vol,time,detune=0){
  const osc=audioCtx.createOscillator();
  const g=audioCtx.createGain();
  osc.type=type; osc.frequency.value=freq; osc.detune.value=detune;
  g.gain.setValueAtTime(0,time);
  g.gain.linearRampToValueAtTime(vol,time+0.03);
  g.gain.exponentialRampToValueAtTime(0.001,time+dur);
  osc.connect(g); g.connect(masterGain);
  osc.start(time); osc.stop(time+dur+0.1);
}
function playNoise(dur,time,vol,hpFreq=6000){
  const len=audioCtx.sampleRate*dur;
  const buf=audioCtx.createBuffer(1,len,audioCtx.sampleRate);
  const d=buf.getChannelData(0);
  for(let i=0;i<len;i++) d[i]=Math.random()*2-1;
  const src=audioCtx.createBufferSource(); src.buffer=buf;
  const g=audioCtx.createGain();
  g.gain.setValueAtTime(vol,time);
  g.gain.exponentialRampToValueAtTime(0.001,time+dur);
  const f=audioCtx.createBiquadFilter(); f.type='highpass'; f.frequency.value=hpFreq;
  src.connect(f); f.connect(g); g.connect(masterGain);
  src.start(time);
}
function playBar(){
  if(!musicPlaying) return;
  const now=audioCtx.currentTime;
  const chord=JC[currentChord];
  const bpm=96;
  const beat=60/bpm, bar=beat*4;
  const swing=beat*0.667;
  // Pad (jazz voicing, spread out)
  chord.pad.forEach((f,i)=>{
    playNote(f,bar*0.9,'triangle',0.045,now,i*2);
    playNote(f*2,bar*0.9,'sine',0.012,now);
  });
  // Walking bass (quarter notes)
  chord.bass.forEach((f,i)=>{
    playNote(f,beat*0.85,'sine',0.11,now+i*beat);
  });
  // Melody (syncopated, chord tones with approach notes)
  for(let b=0;b<4;b++){
    if(Math.random()>0.35){
      const n=chord.pad[Math.floor(Math.random()*chord.pad.length)]*2;
      const off=b*beat+(Math.random()>0.5?swing:0);
      playNote(n,beat*0.4,'sine',0.035,now+off);
      // Occasional grace note
      if(Math.random()>0.7){
        playNote(n*1.06,beat*0.15,'sine',0.02,now+off-beat*0.1);
      }
    }
  }
  // Ride cymbal (swing pattern: ding-ding-da-ding)
  [0,beat,beat+swing,beat*2,beat*3,beat*3+swing].forEach(t=>{
    playNoise(0.035,now+t,0.01);
  });
  // Snare on 2 & 4 (brush feel)
  playNoise(0.06,now+beat,0.025,4000);
  playNoise(0.06,now+beat*3,0.025,4000);
  // Vinyl crackle
  if(Math.random()>0.4) playNoise(0.015,now+Math.random()*bar,0.005);
  currentChord=(currentChord+1)%JC.length;
  sequenceTimer=setTimeout(playBar,bar*1000);
}
function startMusic(){
  if(!audioCtx) initAudio();
  if(audioCtx.state==='suspended') audioCtx.resume();
  if(musicPlaying) return;
  musicPlaying=true; currentChord=0; playBar();
}
function stopMusic(){
  musicPlaying=false;
  if(sequenceTimer) clearTimeout(sequenceTimer);
}
function toggleMusic(){
  if(musicPlaying){ stopMusic(); return false; }
  startMusic(); return true;
}

const PLAYER_HEIGHT=1.7,PLAYER_RADIUS=0.4,MOVE_SPEED=5.0;
const moveState={forward:false,backward:false,left:false,right:false};

const COFFEES=[
  {name:'Espresso',price:'HKD 18'},
  {name:'Americano',price:'HKD 22'},
  {name:'Latte',price:'HKD 28'},
  {name:'Cappuccino',price:'HKD 28'},
  {name:'Mocha',price:'HKD 32'},
  {name:'Caramel Macchiato',price:'HKD 32'},
];

// === ADD INTERACTABLE ===
function addInteractable(obj,name,prompt,action){
  obj.userData.interactable=true;
  obj.userData.name=name;
  obj.userData.prompt=prompt;
  obj.userData.action=action;
  interactables.push(obj);
}

// === INIT ===
function init(){
  clock=new THREE.Clock();
  raycaster=new THREE.Raycaster();
  centerRay=new THREE.Vector2(0,0);

  scene=new THREE.Scene();
  scene.background=new THREE.Color(0x87CEEB);
  scene.fog=new THREE.FogExp2(0x87CEEB,0.012);

  camera=new THREE.PerspectiveCamera(70,innerWidth/innerHeight,0.1,200);
  camera.position.set(0,PLAYER_HEIGHT,10);

  renderer=new THREE.WebGLRenderer({antialias:true});
  renderer.setSize(innerWidth,innerHeight);
  renderer.setPixelRatio(Math.min(devicePixelRatio,2));
  renderer.shadowMap.enabled=true;
  renderer.shadowMap.type=THREE.PCFSoftShadowMap;
  document.body.appendChild(renderer.domElement);

  controls=new PointerLockControls(camera,document.body);

  setupLights();
  worldRefs=buildWorld(scene,colliders,interactables,addInteractable);
  doorPivot=worldRefs.doorPivot;
  doorCollider=worldRefs.doorCollider;
  projectorReels=worldRefs.reels;
  projectorBeam=worldRefs.beam;
  screenMesh=worldRefs.screenMesh;
  posterMesh=worldRefs.posterMesh;
  tvScreenMesh=worldRefs.tvScreen;
  tvGroupRef=worldRefs.tvGroup;
  dustParticles=worldRefs.dust;
  fountainSpray=worldRefs.fountainSpray;

  // Set actions
  doorPivot.userData.action=toggleDoor;
  worldRefs.cmGroup.userData.action=openCoffeeMenu;
  worldRefs.filmGroup.userData.action=openWebsite;
  posterMesh.userData.action=openPoster;
  tvGroupRef.userData.action=toggleVideo;

  // Video setup
  videoEl=document.getElementById('shop-video');
  videoOverlay=document.getElementById('video-overlay');
  videoTexture=new THREE.VideoTexture(videoEl);
  videoTexture.colorSpace=THREE.SRGBColorSpace;
  videoTexture.minFilter=THREE.LinearFilter;
  tvScreenMesh.material=new THREE.MeshBasicMaterial({map:videoTexture});
  videoEl.addEventListener('play',()=>{ videoPlaying=true; if(musicPlaying) stopMusic(); });
  videoEl.addEventListener('pause',()=>{ videoPlaying=false; });
  videoEl.addEventListener('ended',()=>{ closeVideoOverlay(); startMusic(); });
  videoOverlay.addEventListener('click',()=>{ closeVideoOverlay(); });
  // Show first frame on TV before user clicks
  videoEl.preload='auto';
  videoEl.muted=true;
  videoEl.addEventListener('loadeddata',()=>{ videoEl.currentTime=0.5; });
  videoEl.addEventListener('seeked',()=>{ videoTexture.needsUpdate=true; });

  setupUI();
  setupEventListeners();
  animate();
}

function setupLights(){
  scene.add(new THREE.AmbientLight(0xfff4e0,0.5));
  scene.add(new THREE.HemisphereLight(0xfff8e7,0x8b6f47,0.6));
  const sun=new THREE.DirectionalLight(0xfff0d0,1.2);
  sun.position.set(15,25,10);
  sun.castShadow=true;
  sun.shadow.mapSize.set(2048,2048);
  sun.shadow.camera.near=1; sun.shadow.camera.far=60;
  sun.shadow.camera.left=-20; sun.shadow.camera.right=20;
  sun.shadow.camera.top=20; sun.shadow.camera.bottom=-20;
  sun.shadow.bias=-0.001;
  scene.add(sun);

  [[0,3.5,0],[-4,3.5,-3],[4,3.5,3],[0,3.5,-5]].forEach(p=>{
    const l=new THREE.PointLight(0xffc873,15,12,2);
    l.position.set(p[0],p[1],p[2]);
    scene.add(l);
    const bulb=new THREE.Mesh(new THREE.SphereGeometry(0.06,8,6),
      new THREE.MeshStandardMaterial({color:0xffe0a0,emissive:0xffc060,emissiveIntensity:2}));
    bulb.position.set(p[0],p[1],p[2]);
    scene.add(bulb);
    const cord=new THREE.Mesh(new THREE.CylinderGeometry(0.015,0.015,0.5,4),
      new THREE.MeshStandardMaterial({color:0x222}));
    cord.position.set(p[0],p[1]+0.25,p[2]);
    scene.add(cord);
  });
}

// === UI ===
function setupUI(){
  COFFEES.forEach(c=>{
    const item=document.createElement('div');
    item.className='coffee-item';
    item.innerHTML=`<span class="name">${c.name}</span><span class="price">${c.price}</span>`;
    item.addEventListener('click',()=>{
      document.querySelectorAll('.coffee-item').forEach(el=>el.classList.remove('selected'));
      item.classList.add('selected');
      selectedCoffee=c;
      btnMake.disabled=false;
    });
    coffeeList.appendChild(item);
  });

  btnMake.addEventListener('click',()=>{
    if(!selectedCoffee) return;
    makeCoffee(selectedCoffee);
    closeCoffeeMenu();
  });

  btnCancel.addEventListener('click',closeCoffeeMenu);
}

function openCoffeeMenu(){
  menuOpen=true;
  coffeeMenu.style.display='block';
  controls.unlock();
}

function closeCoffeeMenu(){
  menuOpen=false;
  coffeeMenu.style.display='none';
  selectedCoffee=null;
  btnMake.disabled=true;
  document.querySelectorAll('.coffee-item').forEach(el=>el.classList.remove('selected'));
  if(!isPointerLocked) controls.lock();
}

function showNotification(msg,duration=2500){
  notifEl.textContent=msg;
  notifEl.style.display='block';
  notifEl.style.opacity='1';
  if(notificationTimer) clearTimeout(notificationTimer);
  notificationTimer=setTimeout(()=>{
    notifEl.style.opacity='0';
    setTimeout(()=>{ notifEl.style.display='none'; },300);
  },duration);
}

// === COFFEE ===
function makeCoffee(coffee){
  showNotification(`Making ${coffee.name}...`);
  setTimeout(()=>{
    // Clear existing cup
    if(coffeeCupMesh){ scene.remove(coffeeCupMesh); coffeeCupMesh=null; }
    if(handCup){ camera.remove(handCup); handCup=null; }
    cupOnCounter=false;
    cupInHand=false;

    // Create cup on counter
    coffeeCupMesh=createCupMesh(coffee.name);
    coffeeCupMesh.position.set(7.4,1.1,-1.15);
    scene.add(coffeeCupMesh);
    cupOnCounter=true;
    addInteractable(coffeeCupMesh,'coffee_cup','Click to pick up coffee',pickupCoffee);
    showNotification(`${coffee.name} is ready! Click to pick up`);
  },1500);
}

function createCupMesh(coffeeType){
  const group=new THREE.Group();
  // Cup body
  const cupBody=new THREE.Mesh(new THREE.CylinderGeometry(0.06,0.05,0.12,12),M.white);
  cupBody.position.set(0,0.06,0); cupBody.castShadow=true; group.add(cupBody);
  // Handle
  const handle=new THREE.Mesh(new THREE.TorusGeometry(0.03,0.008,8,12),M.white);
  handle.position.set(0.07,0.06,0); group.add(handle);
  // Coffee liquid
  const liquidColor=getCoffeeColor(coffeeType);
  const liquid=new THREE.Mesh(new THREE.CylinderGeometry(0.055,0.05,0.01,12),
    new THREE.MeshStandardMaterial({color:liquidColor,flatShading:true}));
  liquid.position.set(0,0.115,0); group.add(liquid);
  // Saucer
  const saucer=new THREE.Mesh(new THREE.CylinderGeometry(0.09,0.07,0.015,12),M.white);
  saucer.position.set(0,0.008,0); group.add(saucer);
  // Steam (animated)
  const steamGeo=new THREE.BufferGeometry();
  const steamCount=8;
  const steamPos=new Float32Array(steamCount*3);
  for(let i=0;i<steamCount;i++){
    steamPos[i*3]=(Math.random()-0.5)*0.04;
    steamPos[i*3+1]=0.13+Math.random()*0.15;
    steamPos[i*3+2]=(Math.random()-0.5)*0.04;
  }
  steamGeo.setAttribute('position',new THREE.BufferAttribute(steamPos,3));
  const steamMat=new THREE.PointsMaterial({color:0xffffff,size:0.015,transparent:true,opacity:0.4});
  const steam=new THREE.Points(steamGeo,steamMat);
  steam.userData.isSteam=true;
  group.add(steam);
  return group;
}

function getCoffeeColor(type){
  const colors={
    'Espresso':0x2c1810,'Americano':0x3c2410,'Latte':0xc4a882,
    'Cappuccino':0xb8956a,'Mocha':0x5c3d2e,'Caramel Macchiato':0xd4a574,
  };
  return colors[type]||0x4a2c0a;
}

function pickupCoffee(){
  if(!cupOnCounter||!coffeeCupMesh) return;
  // Remove from counter
  scene.remove(coffeeCupMesh);
  coffeeCupMesh=null;
  cupOnCounter=false;
  // Attach to camera
  handCup=createCupMesh(selectedCoffee?selectedCoffee.name:'Latte');
  handCup.position.set(0.25,-0.2,-0.5);
  handCup.scale.set(1.5,1.5,1.5);
  camera.add(handCup);
  scene.add(camera);
  cupInHand=true;
  drinkAnimT=0;
  showNotification('Press E to drink coffee');
  // Remove interactable
  interactables=interactables.filter(i=>i.userData.name!=='coffee_cup');
}

function drinkCoffee(){
  if(!cupInHand) return;
  drinkAnimT=0.001;
}

function updateDrinkAnimation(dt){
  if(drinkAnimT<=0||!cupInHand||!handCup) return;
  drinkAnimT+=dt;
  if(drinkAnimT<0.5){
    handCup.rotation.x=drinkAnimT*1.5;
    handCup.position.y=-0.2+drinkAnimT*0.1;
  } else if(drinkAnimT<1.0){
    handCup.rotation.x=0.75-(drinkAnimT-0.5)*1.5;
    handCup.position.y=-0.15-(drinkAnimT-0.5)*0.1;
  } else {
    camera.remove(handCup);
    handCup=null;
    cupInHand=false;
    drinkAnimT=0;
    showNotification('Finished your coffee ☕');
  }
}

// === DOOR ===
function toggleDoor(){
  doorOpen=!doorOpen;
  if(doorOpen){
    // Remove door collider
    colliders=colliders.filter(c=>c!==doorCollider);
    showNotification('Door opened');
  } else {
    // Re-add door collider
    if(!colliders.includes(doorCollider)) colliders.push(doorCollider);
    showNotification('Door closed');
  }
}

function updateDoor(dt){
  const target=doorOpen?Math.PI/2:0;
  doorPivot.rotation.y+=(target-doorPivot.rotation.y)*5*dt;
}

// === WEBSITE ===
function openWebsite(){
  window.open('http://120.77.58.145','_blank');
  showNotification('Opening website...');
}

// === VIDEO ===
function toggleVideo(){
  if(!videoEl||!videoOverlay) return;
  if(videoEl.paused){
    videoEl.muted=false;
    videoOverlay.style.display='flex';
    controls.unlock();
    videoEl.play();
    showNotification('Playing video');
  } else {
    closeVideoOverlay();
  }
}

function closeVideoOverlay(){
  if(!videoEl||!videoOverlay) return;
  videoEl.pause();
  videoOverlay.style.display='none';
  if(!musicPlaying) startMusic();
  if(startScreen.style.display==='none') controls.lock();
}

// === POSTER ===
function openPoster(){
  lightboxOpen=true;
  document.getElementById('poster-lightbox').style.display='flex';
  controls.unlock();
}

// === INTERACTION ===
function setupEventListeners(){
  const musicBtn=document.getElementById('music-btn');

  btnStart.addEventListener('click',()=>{
    startScreen.style.opacity='0';
    setTimeout(()=>startScreen.style.display='none',500);
    controls.lock();
    startMusic();
    showNotification('☕ Welcome to SHOEGAZERS!',3000);
  });

  document.addEventListener('keydown',e=>{
    switch(e.code){
      case 'KeyW': case 'ArrowUp': moveState.forward=true; break;
      case 'KeyS': case 'ArrowDown': moveState.backward=true; break;
      case 'KeyA': case 'ArrowLeft': moveState.left=true; break;
      case 'KeyD': case 'ArrowRight': moveState.right=true; break;
      case 'KeyE': drinkCoffee(); break;
      case 'KeyM': toggleMusic(); musicBtn.classList.toggle('muted',!musicPlaying); break;
    }
  });

  document.addEventListener('keyup',e=>{
    switch(e.code){
      case 'KeyW': case 'ArrowUp': moveState.forward=false; break;
      case 'KeyS': case 'ArrowDown': moveState.backward=false; break;
      case 'KeyA': case 'ArrowLeft': moveState.left=false; break;
      case 'KeyD': case 'ArrowRight': moveState.right=false; break;
    }
  });

  document.addEventListener('mousemove',e=>{
    if(!isPointerLocked) return;
    // Raycast from center
    raycaster.setFromCamera(centerRay,camera);
    const hits=raycaster.intersectObjects(interactables,true);
    if(hits.length>0){
      let obj=hits[0].object;
      // Walk up to find interactable parent
      while(obj&&!obj.userData.interactable) obj=obj.parent;
      if(obj&&obj.userData.interactable){
        if(highlightedObj!==obj){
          highlightedObj=obj;
          promptEl.textContent=obj.userData.prompt;
          promptEl.style.display='block';
          document.body.style.cursor='pointer';
        }
      }
    } else {
      if(highlightedObj){
        highlightedObj=null;
        promptEl.style.display='none';
        document.body.style.cursor='default';
      }
    }
  });

  document.addEventListener('mousedown',e=>{
    if(!isPointerLocked||e.button!==0) return;
    if(highlightedObj&&highlightedObj.userData.action){
      highlightedObj.userData.action();
    }
  });

  // Re-lock pointer when clicking on canvas (e.g. after returning from new tab)
  renderer.domElement.addEventListener('click',()=>{
    if(!isPointerLocked && !menuOpen && !lightboxOpen && startScreen.style.display==='none'){
      controls.lock();
    }
  });

  // Poster lightbox: click anywhere to close and return to the scene
  const lightbox=document.getElementById('poster-lightbox');
  lightbox.addEventListener('click',()=>{
    lightbox.style.display='none';
    lightboxOpen=false;
    if(startScreen.style.display==='none') controls.lock();
  });

  // Show hint when pointer is unlocked unexpectedly
  controls.addEventListener('unlock',()=>{
    isPointerLocked=false;
    if(!menuOpen && !lightboxOpen && startScreen.style.display==='none'){
      showNotification('Click to continue',1500);
    }
  });
  controls.addEventListener('lock',()=>{
    isPointerLocked=true;
  });

  // Music toggle button
  musicBtn.addEventListener('click',()=>{
    const playing=toggleMusic();
    musicBtn.classList.toggle('muted',!playing);
    if(!isPointerLocked) controls.lock();
  });

  window.addEventListener('resize',()=>{
    camera.aspect=innerWidth/innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(innerWidth,innerHeight);
  });
}

// === PLAYER MOVEMENT ===
function updatePlayer(dt){
  if(!isPointerLocked) return;

  const direction=new THREE.Vector3();
  const forward=new THREE.Vector3();
  camera.getWorldDirection(forward);
  forward.y=0; forward.normalize();
  const right=new THREE.Vector3();
  right.crossVectors(forward,new THREE.Vector3(0,1,0)).normalize();

  if(moveState.forward) direction.add(forward);
  if(moveState.backward) direction.sub(forward);
  if(moveState.right) direction.add(right);
  if(moveState.left) direction.sub(right);

  if(direction.length()>0){
    direction.normalize();
    const moveDist=MOVE_SPEED*dt;
    const newPos=camera.position.clone();
    newPos.x+=direction.x*moveDist;
    newPos.z+=direction.z*moveDist;
    newPos.y=PLAYER_HEIGHT;

    // Collision check
    if(!checkCollision(newPos)){
      camera.position.copy(newPos);
    } else {
      // Try sliding along X only
      const xOnly=camera.position.clone();
      xOnly.x=newPos.x;
      if(!checkCollision(xOnly)){
        camera.position.copy(xOnly);
      } else {
        // Try sliding along Z only
        const zOnly=camera.position.clone();
        zOnly.z=newPos.z;
        if(!checkCollision(zOnly)){
          camera.position.copy(zOnly);
        }
      }
    }
  }
}

function checkCollision(pos){
  const playerBox=new THREE.Box3(
    new THREE.Vector3(pos.x-PLAYER_RADIUS,pos.y-PLAYER_HEIGHT,pos.z-PLAYER_RADIUS),
    new THREE.Vector3(pos.x+PLAYER_RADIUS,pos.y+0.1,pos.z+PLAYER_RADIUS)
  );
  for(const box of colliders){
    if(playerBox.intersectsBox(box)) return true;
  }
  return false;
}

// === PROJECTOR ANIMATION ===
function updateProjector(dt,t){
  // Rotate reels
  projectorReels.forEach((reel,i)=>{
    reel.rotation.z+=dt*(2+i);
  });

  // Animate screen content
  screenTime+=dt;
  const hue=(Math.sin(screenTime*0.5)+1)/2;
  screenMesh.material.emissive.setHSL(hue*0.6,0.5,0.15);
  screenMesh.material.emissiveIntensity=0.3+Math.sin(screenTime*2)*0.1;

  // Flicker beam
  projectorBeam.material.opacity=0.04+Math.sin(screenTime*8)*0.015+Math.random()*0.01;

  // Animate dust
  if(dustParticles){
    const pos=dustParticles.geometry.attributes.position;
    for(let i=0;i<pos.count;i++){
      pos.array[i*3+1]+=dt*0.1;
      pos.array[i*3]+=Math.sin(t+i)*dt*0.05;
      if(pos.array[i*3+1]>3) pos.array[i*3+1]=0.8;
    }
    pos.needsUpdate=true;
  }
}

// === ANIMATE ===
function animate(){
  requestAnimationFrame(animate);
  const dt=Math.min(clock.getDelta(),0.05);
  const t=clock.elapsedTime;

  updatePlayer(dt);
  updateDoor(dt);
  updateProjector(dt,t);
  updateDrinkAnimation(dt);

  // Keep TV texture in sync with video frame
  if(videoEl&&videoTexture&&videoEl.readyState>=videoEl.HAVE_CURRENT_DATA
     &&videoEl.currentTime!==lastVideoTime){
    lastVideoTime=videoEl.currentTime;
    videoTexture.needsUpdate=true;
  }

  // Animate steam on cups
  scene.traverse(obj=>{
    if(obj.userData.isSteam){
      const pos=obj.geometry.attributes.position;
      for(let i=0;i<pos.count;i++){
        pos.array[i*3+1]+=dt*0.3;
        pos.array[i*3]+=Math.sin(t*3+i)*dt*0.02;
        if(pos.array[i*3+1]>0.3){
          pos.array[i*3+1]=0.13;
          pos.array[i*3]=(Math.random()-0.5)*0.04;
          pos.array[i*3+2]=(Math.random()-0.5)*0.04;
        }
      }
      pos.needsUpdate=true;
    }
  });

  // Animate fountain spray
  if(fountainSpray){
    const pos=fountainSpray.geometry.attributes.position;
    for(let i=0;i<pos.count;i++){
      pos.array[i*3+1]+=dt*0.5;
      pos.array[i*3]+=Math.sin(t*4+i)*dt*0.1;
      pos.array[i*3+2]+=Math.cos(t*4+i)*dt*0.1;
      if(pos.array[i*3+1]>3.2){
        pos.array[i*3+1]=2.2;
        pos.array[i*3]=(Math.random()-0.5)*0.5;
        pos.array[i*3+2]=(Math.random()-0.5)*0.5;
      }
    }
    pos.needsUpdate=true;
  }

  renderer.render(scene,camera);
}

init();