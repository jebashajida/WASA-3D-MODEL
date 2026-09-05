import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

// ============================================================
// SCENE
// ============================================================

const scene=new THREE.Scene();
const camera=new THREE.PerspectiveCamera(38,innerWidth/innerHeight,.1,200);

const renderer=new THREE.WebGLRenderer({antialias:true,alpha:true});
renderer.setSize(innerWidth,innerHeight);
renderer.setPixelRatio(Math.min(devicePixelRatio,2));
renderer.shadowMap.enabled=true;
renderer.shadowMap.type=THREE.PCFSoftShadowMap;
renderer.outputColorSpace=THREE.SRGBColorSpace;
renderer.toneMapping=THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure=1.08;
scene.background=new THREE.Color(0xd8c8b7);

Object.assign(document.documentElement.style,{width:"100%",height:"100%"});
Object.assign(document.body.style,{margin:"0",width:"100%",height:"100%",overflow:"hidden"});
Object.assign(renderer.domElement.style,{display:"block",position:"fixed",inset:"0",width:"100%",height:"100%"});
document.body.appendChild(renderer.domElement);

// ============================================================
// CAMERA
// ============================================================

const controls=new OrbitControls(camera,renderer.domElement);
controls.enableDamping=true;
controls.dampingFactor=.06;
controls.minDistance=12;
controls.maxDistance=65;
controls.maxPolarAngle=Math.PI/2.02;

const view=(x,y,z)=>{camera.position.set(x,y,z);controls.target.set(3.5,5.5,0);controls.update()};

const menu=document.createElement("div");
Object.assign(menu.style,{position:"fixed",top:"12px",left:"50%",transform:"translateX(-50%)",display:"flex",gap:"8px",zIndex:"20"});

[
 ["FRONT VIEW",[3.5,8,34]],
 ["UPPER VIEW",[3.5,34,.01]],
 ["BACK VIEW",[3.5,8,-29]]
].forEach(([t,p])=>{
 const b=document.createElement("button");
 b.textContent=t;
 Object.assign(b.style,{padding:"8px 14px",border:"1px solid #8bcfff",borderRadius:"5px",background:"#163d5b",color:"#fff",fontWeight:"bold",cursor:"pointer",boxShadow:"0 2px 8px #0008"});
 b.onclick=()=>view(...p);
 menu.appendChild(b);
});

document.body.appendChild(menu);
view(3.5,8,35);

// ============================================================
// LIGHTS
// ============================================================

scene.add(new THREE.HemisphereLight(0xfff4e8,0x756e68,1.45));

const sun=new THREE.DirectionalLight(0xfff3e6,3.1);
sun.position.set(-14,24,18);
sun.castShadow=true;
sun.shadow.mapSize.set(4096,4096);
Object.assign(sun.shadow.camera,{left:-35,right:35,top:35,bottom:-35,near:.5,far:80});
sun.shadow.bias=-.00015;
sun.shadow.normalBias=.025;
sun.shadow.radius=5;
scene.add(sun);

const fill=new THREE.DirectionalLight(0xffe4ca,1.05);
fill.position.set(18,12,-12);
scene.add(fill);

// ============================================================
// MATERIALS
// ============================================================

const tankMat=new THREE.MeshPhysicalMaterial({color:0xe8edf0,transparent:true,opacity:.38,transmission:.12,roughness:.28,clearcoat:1,clearcoatRoughness:.08,side:THREE.DoubleSide,depthWrite:false});
const waterMat=new THREE.MeshPhysicalMaterial({color:0x70d3ff,transparent:true,opacity:.72,roughness:.06,clearcoat:1,clearcoatRoughness:.05,depthWrite:false});
const metal=new THREE.MeshStandardMaterial({color:0xbfc7cc,metalness:.82,roughness:.24});
const darkMetal=new THREE.MeshStandardMaterial({color:0x464d52,metalness:.72,roughness:.3});
const black=new THREE.MeshStandardMaterial({color:0x151515,roughness:.35});
const blue=new THREE.MeshStandardMaterial({color:0x1769aa,metalness:.4,roughness:.3});
const pipeBlue=new THREE.MeshStandardMaterial({color:0x2877d6,metalness:.25,roughness:.28});
const greenDark=new THREE.MeshStandardMaterial({color:0x087b2c,metalness:.25,roughness:.35});
const red=new THREE.MeshStandardMaterial({color:0xdc2020,roughness:.35});

const pipeGlass=new THREE.MeshPhysicalMaterial({color:0xdff4ff,transparent:true,opacity:.28,transmission:.72,roughness:.08,clearcoat:1,clearcoatRoughness:.03,side:THREE.DoubleSide,depthWrite:false});
const pipeWater=new THREE.MeshPhysicalMaterial({color:0x29bfff,transparent:true,opacity:.67,roughness:.03,clearcoat:1,clearcoatRoughness:.02,depthWrite:false});
const flowDotMat=new THREE.MeshBasicMaterial({color:0xe9fbff,transparent:true,opacity:.96});

// ============================================================
// ROOM
// ============================================================

const roomMat=new THREE.MeshStandardMaterial({
 color:0xb8aa9d,roughness:.92,transparent:true,
 opacity:.28,side:THREE.DoubleSide,depthWrite:false
});

const ground=new THREE.Mesh(new THREE.PlaneGeometry(60,40),roomMat);
ground.rotation.x=-Math.PI/2;
ground.position.y=.02;
ground.receiveShadow=true;
ground.renderOrder=1;
scene.add(ground);

function createBrickTexture(light="#e9ded2",dark="#dfd3c6",mortar="#d5c8bb"){
 const c=document.createElement("canvas"),ctx=c.getContext("2d");
 c.width=512;c.height=256;
 const bw=64,bh=32,gap=2;
 ctx.fillStyle=mortar;ctx.fillRect(0,0,512,256);

 for(let y=0,row=0;y<256;y+=bh,row++)
  for(let x=-bw*((row%2)/2);x<512;x+=bw){
   ctx.fillStyle=Math.random()>.5?light:dark;
   ctx.fillRect(x+gap/2,y+gap/2,bw-gap,bh-gap);
  }

 const tex=new THREE.CanvasTexture(c);
 tex.wrapS=tex.wrapT=THREE.RepeatWrapping;
 tex.colorSpace=THREE.SRGBColorSpace;
 return tex;
}

const brickTex=createBrickTexture();
brickTex.repeat.set(18,6);

const wallMat=new THREE.MeshStandardMaterial({map:brickTex,bumpMap:brickTex,bumpScale:.006,color:0xf2e7dc,roughness:.94});

[
 [60,20,0,10,-18,0],
 [40,20,-22,10,0,Math.PI/2]
].forEach(([w,h,x,y,z,r])=>{
 const m=new THREE.Mesh(new THREE.PlaneGeometry(w,h),wallMat);
 m.position.set(x,y,z);m.rotation.y=r;m.receiveShadow=true;scene.add(m);
});

// ============================================================
// SCADA
// ============================================================

const outputs=new Map();

function registerOutput(tag,setter){outputs.set(tag,setter)}

function setOutput(tag,value){
 const setter=outputs.get(tag);
 setter?setter(value):console.warn(`Unknown SCADA tag: ${tag}`);
}

window.SCADA={
 set:setOutput,
 update(values){Object.entries(values||{}).forEach(([tag,value])=>setOutput(tag,value))},
 tags(){return [...outputs.keys()]}
};

// ============================================================
// TEXT
// ============================================================

const labelMeshes=[];
const LABEL_REF_DIST=31;

function makeText(text,width=2,height=.55,fontSize=50,color="#222222",background=null){
 width*=1.35;height*=1.08;fontSize*=1.18;

 const canvas=document.createElement("canvas");
 canvas.width=1024;canvas.height=256;
 const ctx=canvas.getContext("2d");

 function draw(value){
  ctx.clearRect(0,0,1024,256);
  if(background){ctx.fillStyle=background;ctx.fillRect(0,0,1024,256)}
  ctx.font=`bold ${Math.floor(fontSize*2.55)}px Arial`;
  ctx.fillStyle=color;
  ctx.textAlign="center";
  ctx.textBaseline="middle";
  ctx.fillText(String(value),512,128,940);
 }

 draw(text);

 const texture=new THREE.CanvasTexture(canvas);
 texture.colorSpace=THREE.SRGBColorSpace;
 texture.anisotropy=renderer.capabilities.getMaxAnisotropy();

 const object=new THREE.Mesh(
  new THREE.PlaneGeometry(width,height),
  new THREE.MeshBasicMaterial({map:texture,transparent:true,depthWrite:false,depthTest:false,side:THREE.DoubleSide})
 );

 object.renderOrder=50;
 object.userData.setText=value=>{draw(value);texture.needsUpdate=true};
 labelMeshes.push(object);
 return object;
}

// ============================================================
// FLOW
// ============================================================

const flowZones={
 p0102:{percent:100,running:true},
 p0103:{percent:100,running:true},
 main:{percent:80,running:true}
};

const flowSystems=[];
let mainValveOpen=65;

function runningValue(value){
 if(typeof value==="boolean")return value;
 return !["0","FALSE","STOP","STOPPED","OFF"].includes(String(value).trim().toUpperCase());
}

function setFlowZone(zone,percent){
 if(flowZones[zone])flowZones[zone].percent=THREE.MathUtils.clamp(Number(percent)||0,0,100);
}

function setFlowRunning(zone,value){
 if(zone==="all"){
  Object.values(flowZones).forEach(item=>item.running=runningValue(value));
  return;
 }
 if(flowZones[zone])flowZones[zone].running=runningValue(value);
}

window.waterFlow={
 set:setFlowZone,
 start:(z="all")=>setFlowRunning(z,true),
 stop:(z="all")=>setFlowRunning(z,false),
 get:()=>JSON.parse(JSON.stringify(flowZones))
};

registerOutput("FLOW_P0102",v=>setFlowZone("p0102",v));
registerOutput("FLOW_P0103",v=>setFlowZone("p0103",v));
registerOutput("FLOW_MAIN",v=>setFlowZone("main",v));
registerOutput("FLOW_P0102_RUNNING",v=>setFlowRunning("p0102",v));
registerOutput("FLOW_P0103_RUNNING",v=>setFlowRunning("p0103",v));
registerOutput("FLOW_MAIN_RUNNING",v=>setFlowRunning("main",v));
registerOutput("FLOW_ALL_RUNNING",v=>setFlowRunning("all",v));

// ============================================================
// WATER PIPE
// ============================================================

function makeWaterPipe(curve,radius=.16,zone="main",segments=72){
 const outer=new THREE.Mesh(new THREE.TubeGeometry(curve,segments,radius,24,false),pipeGlass.clone());
 outer.renderOrder=3;outer.castShadow=true;scene.add(outer);

 const waterMaterial=pipeWater.clone();
 const inner=new THREE.Mesh(new THREE.TubeGeometry(curve,segments,radius*.63,20,false),waterMaterial);
 inner.renderOrder=2;scene.add(inner);

 const particles=[];

 for(let i=0;i<10;i++){
  const p=new THREE.Mesh(new THREE.SphereGeometry(radius*.23,12,8),flowDotMat.clone());
  p.renderOrder=4;scene.add(p);particles.push(p);
 }

 flowSystems.push({curve,zone,particles,waterMaterial,offset:Math.random()});
 return{outer,inner};
}

function pipe(start,end,radius=.16,_material=metal,zone="main"){
 return makeWaterPipe(new THREE.LineCurve3(start.clone(),end.clone()),radius,zone,42);
}

function pipeRoute(points,radius=.16,_material=metal,zone="main"){
 return makeWaterPipe(new THREE.CatmullRomCurve3(points,false,"catmullrom",.15),radius,zone,Math.max(90,points.length*35));
}

function pipeJoint(x,y,z,r=.3){
 const m=new THREE.Mesh(new THREE.TorusGeometry(r,.055,12,40),metal);
 m.rotation.x=Math.PI/2;m.position.set(x,y,z);m.castShadow=true;scene.add(m);
}

function animatePipeFlow(delta){
 for(const system of flowSystems){
  const zone=flowZones[system.zone]||flowZones.main;
  let effective=zone.running?zone.percent:0;

  if(system.zone==="main")effective*=mainValveOpen/100;

  system.waterMaterial.opacity=effective>.1?.68:.13;
  const speed=effective>.1?.04+.56*(effective/100):0;
  system.offset=(system.offset+delta*speed)%1;

  system.particles.forEach((particle,index)=>{
   particle.visible=effective>.1;
   if(!particle.visible)return;

   const t=(system.offset+index/system.particles.length)%1;
   particle.position.copy(system.curve.getPointAt(t));
   particle.scale.setScalar(.65+.45*(effective/100));
  });
 }
}

// ============================================================
// TANK
// ============================================================

function createTank(x,z,level=.65,scaleValue=.86,name="MIX TANK"){
 const tank=new THREE.Group();
 tank.position.set(x,0,z);
 tank.scale.setScalar(scaleValue);
 scene.add(tank);

 const R=4,H=9,maxWater=8.4,capacity=5000;

 const body=new THREE.Mesh(new THREE.CylinderGeometry(R,R,H,96,1,true),tankMat);
 body.position.y=H/2;body.renderOrder=4;body.castShadow=true;tank.add(body);

 const bottom=new THREE.Mesh(new THREE.CylinderGeometry(R,R-.28,.28,96),metal);
 bottom.position.y=.14;tank.add(bottom);

 [1.4,3.5,5.6,7.7].forEach(y=>{
  const ring=new THREE.Mesh(new THREE.TorusGeometry(R+.025,.065,12,96),metal);
  ring.rotation.x=Math.PI/2;ring.position.y=y;tank.add(ring);
 });

 [.3,8.95].forEach(y=>{
  const rim=new THREE.Mesh(new THREE.TorusGeometry(R+.02,.09,12,96),metal);
  rim.rotation.x=Math.PI/2;rim.position.y=y;tank.add(rim);
 });

 const roof=new THREE.Mesh(new THREE.CylinderGeometry(2.65,R,1.55,96,1,true),tankMat);
 roof.position.y=9.75;tank.add(roof);

 const hatch=new THREE.Mesh(new THREE.CylinderGeometry(1.05,1.05,.16,48),darkMetal);
 hatch.position.y=10.58;tank.add(hatch);

 const hatchRing=new THREE.Mesh(new THREE.TorusGeometry(1.05,.1,12,48),metal);
 hatchRing.rotation.x=Math.PI/2;hatchRing.position.y=10.7;tank.add(hatchRing);

 const water=new THREE.Mesh(new THREE.CylinderGeometry(R-.22,R-.22,1,72),waterMat);
 tank.add(water);

 const surfaceGeo=new THREE.CircleGeometry(R-.23,72);
 surfaceGeo.rotateX(-Math.PI/2);

 const surface=new THREE.Mesh(surfaceGeo,waterMat);
 tank.add(surface);

 const positions=surfaceGeo.attributes.position;
 const originalY=Array.from({length:positions.count},(_,i)=>positions.getY(i));

 [-3.2,3.2].forEach(px=>
  [-3.2,3.2].forEach(pz=>{
   const post=new THREE.Mesh(new THREE.BoxGeometry(.24,11.8,.24),blue);
   post.position.set(px,5.9,pz);tank.add(post);
  })
 );

 [-3.2,3.2].forEach(pz=>{
  const beam=new THREE.Mesh(new THREE.BoxGeometry(6.7,.25,.25),blue);
  beam.position.set(0,11.8,pz);tank.add(beam);
 });

 [-3.2,3.2].forEach(px=>{
  const beam=new THREE.Mesh(new THREE.BoxGeometry(.25,.25,6.7),blue);
  beam.position.set(px,11.8,0);tank.add(beam);
 });

 const centerBeam=new THREE.Mesh(new THREE.BoxGeometry(6.5,.3,.4),blue);
 centerBeam.position.y=11.8;tank.add(centerBeam);

 const gearboxBase=new THREE.Mesh(new THREE.CylinderGeometry(.75,.9,.35,32),darkMetal);
 gearboxBase.position.y=12.05;tank.add(gearboxBase);

 const gearbox=new THREE.Mesh(new THREE.BoxGeometry(1.25,.8,1.25),greenDark);
 gearbox.position.y=12.55;tank.add(gearbox);

 const motor=new THREE.Mesh(new THREE.CylinderGeometry(.55,.55,1.9,32),greenDark);
 motor.position.set(1.5,12.75,0);motor.rotation.z=Math.PI/2;tank.add(motor);

 for(let mx=.85;mx<=2.1;mx+=.25){
  const rib=new THREE.Mesh(new THREE.TorusGeometry(.57,.035,8,28),darkMetal);
  rib.position.set(mx,12.75,0);rib.rotation.y=Math.PI/2;tank.add(rib);
 }

 const shaft=new THREE.Mesh(new THREE.CylinderGeometry(.1,.1,9.6,20),metal);
 shaft.position.y=7.3;tank.add(shaft);

 const impeller=new THREE.Group();
 impeller.position.y=3.2;tank.add(impeller);
 impeller.add(new THREE.Mesh(new THREE.CylinderGeometry(.25,.25,.3,20),metal));

 for(let i=0;i<4;i++){
  const arm=new THREE.Group();arm.rotation.y=i*Math.PI/2;
  const blade=new THREE.Mesh(new THREE.BoxGeometry(1.8,.12,.65),metal);
  blade.position.x=.9;blade.rotation.z=.15;
  arm.add(blade);impeller.add(arm);
 }

 const outlet=new THREE.Mesh(new THREE.CylinderGeometry(.23,.23,1.1,24),metal);
 outlet.position.set(R+.45,.8,0);outlet.rotation.z=Math.PI/2;tank.add(outlet);

 const label=makeText(name,3,.42,48,"#17232d",null);
 label.position.set(0,1,R+.08);tank.add(label);

 const state={level:0,volume:0,rpm:120,running:true,angle:0};

 const api={
  tank,impeller,surface,originalY,surfaceBaseY:0,
  outletWorld:new THREE.Vector3(x+(R+.95)*scaleValue,.8*scaleValue,z),

  setLevel(normalized){
   const n=THREE.MathUtils.clamp(Number(normalized)||0,0,1);
   state.level=n;state.volume=capacity*n;
   const h=Math.max(maxWater*n,.01);
   water.scale.y=h;water.position.y=h/2;
   api.surfaceBaseY=h;surface.position.y=h;
  },

  setVolume(liters){api.setLevel(THREE.MathUtils.clamp(Number(liters)||0,0,capacity)/capacity)},
  setRPM(rpm){state.rpm=Math.max(Number(rpm)||0,0)},
  setRunning(value){state.running=runningValue(value)},

  animate(time,delta){
   if(state.running){
    state.angle+=state.rpm*Math.PI*2/60*delta;
    impeller.rotation.y=-state.angle;
   }

   for(let i=1;i<positions.count;i++){
    const px=positions.getX(i),pz=positions.getZ(i);
    positions.setY(i,originalY[i]+Math.sin(px*1.8+time*3)*.055+Math.cos(pz*2.1+time*2.5)*.04);
   }

   positions.needsUpdate=true;
   surface.position.y=api.surfaceBaseY+Math.sin(time*2.2)*.025;
  }
 };

 api.setLevel(level);
 return api;
}

// ============================================================
// DOSING PUMP
// ============================================================

function createDosingPump(x,y,z,name){
 const g=new THREE.Group();g.position.set(x,y,z);scene.add(g);

 const lightBlue=new THREE.MeshStandardMaterial({color:0x62b5ec,metalness:.3,roughness:.32});
 const blue2=new THREE.MeshStandardMaterial({color:0x348fd0,metalness:.35,roughness:.3});
 const dark=new THREE.MeshStandardMaterial({color:0x1f4f72,metalness:.4,roughness:.3});
 const silver=new THREE.MeshStandardMaterial({color:0xc8d6df,metalness:.45,roughness:.24});

 const add=(geo,mat,p=[0,0,0],r=[0,0,0])=>{
  const m=new THREE.Mesh(geo,mat);
  m.position.set(...p);m.rotation.set(...r);m.castShadow=true;g.add(m);return m;
 };

 add(new THREE.BoxGeometry(2.35,.22,1.5),dark,[0,-.82,0]);
 add(new THREE.BoxGeometry(1.45,1.25,1.25),lightBlue,[.35,-.05,0]);
 add(new THREE.CylinderGeometry(.72,.72,.65,40),dark,[-.62,0,0],[0,0,Math.PI/2]);
 add(new THREE.CylinderGeometry(.62,.62,.12,40),silver,[-.98,0,0],[0,0,Math.PI/2]);

 for(let i=0;i<6;i++){
  const a=i*Math.PI/3;
  add(new THREE.CylinderGeometry(.045,.045,.13,10),dark,[-1.06,Math.cos(a)*.48,Math.sin(a)*.48],[0,0,Math.PI/2]);
 }

 const rotor=new THREE.Group();
 rotor.position.set(-1.065,0,0);g.add(rotor);

 for(let i=0;i<5;i++){
  const h=new THREE.Group();h.rotation.x=i*Math.PI*2/5;
  const b=new THREE.Mesh(new THREE.BoxGeometry(.08,.46,.14),blue2);
  b.position.y=.25;h.add(b);rotor.add(h);
 }

 const hub=new THREE.Mesh(new THREE.CylinderGeometry(.12,.12,.12,20),dark);
 hub.rotation.z=Math.PI/2;rotor.add(hub);

 add(new THREE.CylinderGeometry(.46,.46,1.3,32),blue2,[.48,1.18,0]);
 add(new THREE.CylinderGeometry(.52,.46,.32,32),lightBlue,[.48,1.98,0]);
 add(new THREE.CylinderGeometry(.5,.5,.16,32),dark,[.48,.48,0]);

 for(let yy=.72;yy<1.72;yy+=.18){
  const rib=new THREE.Mesh(new THREE.TorusGeometry(.47,.025,8,28),dark);
  rib.rotation.x=Math.PI/2;rib.position.set(.48,yy,0);g.add(rib);
 }

 add(new THREE.BoxGeometry(.62,.72,.7),dark,[.9,1.15,.38]);
 add(new THREE.BoxGeometry(.65,.5,.08),blue2,[.25,.08,.67]);
 add(new THREE.CylinderGeometry(.19,.19,.13,24),dark,[.25,.1,.74],[Math.PI/2,0,0]);
 add(new THREE.CylinderGeometry(.26,.26,.55,24),lightBlue,[-1.28,0,0],[0,0,Math.PI/2]);
 add(new THREE.CylinderGeometry(.34,.34,.22,28),silver,[-1.52,0,0],[0,0,Math.PI/2]);
 add(new THREE.CylinderGeometry(.26,.26,.55,24),lightBlue,[1.18,0,0],[0,0,Math.PI/2]);
 add(new THREE.CylinderGeometry(.34,.34,.22,28),silver,[1.48,0,0],[0,0,Math.PI/2]);

 const label=makeText(name,1.5,.30,44,"#17232d",null);
 label.position.set(0,-1.15,.78);g.add(label);

 return{
  pump:g,rotor,
  inlet:new THREE.Vector3(x-1.63,y,z),
  outlet:new THREE.Vector3(x+1.63,y,z)
 };
}

// ============================================================
// PUMP PANEL
// ============================================================

function createPumpControlPanel(x,y,z,prefix){
 const panel=new THREE.Group();panel.position.set(x,y,z);scene.add(panel);

 const title=makeText(prefix==="P0102"?"DOSING PUMP-1":"DOSING PUMP-2",2.2,.28,44,"#17232d",null);
 title.position.set(0,.55,.15);panel.add(title);

 const on=makeText("ON",.75,.34,52,"#fff","rgba(20,150,60,.96)");
 on.position.set(-.6,-.15,.16);panel.add(on);

 const off=makeText("OFF",.75,.34,52,"#fff","rgba(210,40,40,.96)");
 off.position.set(.6,-.15,.16);panel.add(off);

 const am=makeText("A/M",.9,.28,48,"#fff","rgba(22,61,91,.98)");
 am.position.set(0,-.72,.16);panel.add(am);

 registerOutput(`${prefix}_ON`,v=>on.userData.setText(v));
 registerOutput(`${prefix}_OFF`,v=>off.userData.setText(v));
 registerOutput(`${prefix}_AM`,v=>am.userData.setText(v));

 return panel;
}

// ============================================================
// TRANSPARENT UNDERGROUND PUMP WELL
// ============================================================

function createPumpWell(x,z){
 const g=new THREE.Group();g.position.set(x,0,z);scene.add(g);

 const soil=new THREE.MeshStandardMaterial({color:0x795b40,roughness:1,transparent:true,opacity:.1,side:THREE.DoubleSide,depthWrite:false});
 const concrete=new THREE.MeshStandardMaterial({color:0xa6a8a7,roughness:.8,transparent:true,opacity:.2,side:THREE.DoubleSide,depthWrite:false});
 const waterM=new THREE.MeshPhysicalMaterial({color:0x22bfff,transparent:true,opacity:.45,transmission:.45,roughness:.03,clearcoat:1,side:THREE.DoubleSide,depthWrite:false});

 const add=(geo,mat,p)=>{
  const m=new THREE.Mesh(geo,mat);
  m.position.set(...p);m.castShadow=m.receiveShadow=true;g.add(m);return m;
 };

 add(new THREE.BoxGeometry(.55,4.6,2.2),soil,[-1.7,-2.2,0]);
 add(new THREE.BoxGeometry(.55,4.6,2.2),soil,[1.7,-2.2,0]);
 add(new THREE.BoxGeometry(2.9,4.6,.3),soil,[0,-2.2,-1]);
 add(new THREE.BoxGeometry(3.1,.3,2),soil,[0,-4.45,0]);

 add(new THREE.BoxGeometry(.12,4.2,1.7),concrete,[-1.4,-2.2,0]);
 add(new THREE.BoxGeometry(.12,4.2,1.7),concrete,[1.4,-2.2,0]);
 add(new THREE.BoxGeometry(2.7,4.2,.12),concrete,[0,-2.2,-.82]);

 const water=add(new THREE.BoxGeometry(2.62,3.9,1.52),waterM,[0,-2.35,0]);
 water.renderOrder=2;

 const surface=add(
  new THREE.PlaneGeometry(2.58,1.48),
  new THREE.MeshPhysicalMaterial({color:0x7edfff,transparent:true,opacity:.6,roughness:.03,clearcoat:1,depthWrite:false}),
  [0,-.39,0]
 );
 surface.rotation.x=-Math.PI/2;surface.renderOrder=3;

 add(new THREE.BoxGeometry(3.15,.18,.22),concrete,[0,.06,-.93]);
 add(new THREE.BoxGeometry(3.15,.18,.22),concrete,[0,.06,.93]);
 add(new THREE.BoxGeometry(.22,.18,1.65),concrete,[-1.45,.06,0]);
 add(new THREE.BoxGeometry(.22,.18,1.65),concrete,[1.45,.06,0]);

 const frame=new THREE.LineSegments(
  new THREE.EdgesGeometry(new THREE.BoxGeometry(2.9,4.4,1.75)),
  new THREE.LineBasicMaterial({color:0x303030,transparent:true,opacity:.38})
 );
 frame.position.y=-2.2;g.add(frame);

 return g;
}

// ============================================================
// SMALL SUBMERSIBLE PUMP
// ============================================================

function createMainPump(x,y,z){
 const g=new THREE.Group();g.position.set(x,y,z);g.scale.setScalar(.72);scene.add(g);

 const silver=new THREE.MeshStandardMaterial({color:0xd2d7da,metalness:.75,roughness:.17,transparent:true,opacity:.72});
 const dark=new THREE.MeshStandardMaterial({color:0x303438,metalness:.65,roughness:.24,transparent:true,opacity:.78});
 const brass=new THREE.MeshStandardMaterial({color:0xb9933e,metalness:.65,roughness:.22,transparent:true,opacity:.76});

 const add=(geo,mat,p=[0,0,0])=>{
  const m=new THREE.Mesh(geo,mat);m.position.set(...p);m.castShadow=true;g.add(m);return m;
 };

 add(new THREE.CylinderGeometry(.29,.31,1.45,32),silver,[0,.05,0]);
 add(new THREE.CylinderGeometry(.17,.30,.40,32),silver,[0,-.88,0]);
 add(new THREE.CylinderGeometry(.32,.32,.14,32),dark,[0,.82,0]);
 add(new THREE.CylinderGeometry(.29,.29,.55,32),silver,[0,1.15,0]);
 add(new THREE.CylinderGeometry(.39,.39,.78,32),brass,[0,1.82,0]);

 [1.50,1.67,1.84,2.01,2.16].forEach(yy=>{
  const r=new THREE.Mesh(new THREE.TorusGeometry(.39,.035,10,32),dark);
  r.rotation.x=Math.PI/2;r.position.y=yy;g.add(r);
 });

 add(new THREE.CylinderGeometry(.25,.25,.28,28),silver,[0,2.36,0]);
 add(new THREE.CylinderGeometry(.17,.17,1.25,24),silver,[0,3.10,0]);

 const u=new THREE.CatmullRomCurve3([
  new THREE.Vector3(-.60,3.60,0),
  new THREE.Vector3(-.60,-1.05,0),
  new THREE.Vector3(-.43,-1.30,0),
  new THREE.Vector3(.43,-1.30,0),
  new THREE.Vector3(.60,-1.05,0),
  new THREE.Vector3(.60,3.60,0)
 ]);

 const guard=new THREE.Mesh(new THREE.TubeGeometry(u,60,.045,10,false),dark);
 guard.castShadow=true;g.add(guard);

 const rotor=new THREE.Group();rotor.position.y=.1;g.add(rotor);

 for(let i=0;i<5;i++){
  const b=new THREE.Mesh(new THREE.BoxGeometry(.06,.05,.38),silver);
  b.rotation.y=i*Math.PI*2/5;rotor.add(b);
 }

 return{
  group:g,
  rotor,
  baseY:y,
  outlet:new THREE.Vector3(x,y+3.72*.72,z)
 };
}

// ============================================================
// MOTORIZED VALVE
// ============================================================

function createMotorizedValve(x,y,z){
 const g=new THREE.Group();g.position.set(x,y,z);scene.add(g);

 const steel=new THREE.MeshStandardMaterial({color:0x929a9f,metalness:.82,roughness:.25});
 const steelDark=new THREE.MeshStandardMaterial({color:0x586066,metalness:.76,roughness:.3});
 const actuator=new THREE.MeshStandardMaterial({color:0xe7ebed,metalness:.48,roughness:.24});
 const actuatorEdge=new THREE.MeshStandardMaterial({color:0xc8ced2,metalness:.65,roughness:.22});

 const ring=(major,tube,yy,mat=steel)=>{
  const m=new THREE.Mesh(new THREE.TorusGeometry(major,tube,14,48),mat);
  m.rotation.x=Math.PI/2;m.position.y=yy;m.castShadow=true;g.add(m);return m;
 };

 ring(.385,.115,0);
 ring(.35,.08,-.5);
 ring(.35,.08,.5);
 ring(.31,.04,-.32,steelDark);
 ring(.31,.04,.32,steelDark);

 const valvePipe=new THREE.Mesh(new THREE.CylinderGeometry(.24,.24,1.12,28),pipeGlass.clone());
 valvePipe.renderOrder=3;g.add(valvePipe);

 const valveWaterMat=pipeWater.clone();
 const valveWater=new THREE.Mesh(new THREE.CylinderGeometry(.15,.15,1.13,24),valveWaterMat);
 valveWater.renderOrder=2;g.add(valveWater);

 const bonnetFlange=new THREE.Mesh(new THREE.CylinderGeometry(.25,.25,.1,32),steel);
 bonnetFlange.rotation.z=Math.PI/2;bonnetFlange.position.x=.43;g.add(bonnetFlange);

 const bonnet=new THREE.Mesh(new THREE.CylinderGeometry(.13,.22,.34,32),steel);
 bonnet.rotation.z=Math.PI/2;bonnet.position.x=.62;g.add(bonnet);

 const stem=new THREE.Mesh(new THREE.CylinderGeometry(.04,.04,.3,14),metal);
 stem.rotation.z=Math.PI/2;stem.position.x=.86;g.add(stem);

 const a=new THREE.Group();a.position.x=1.05;g.add(a);

 const aBody=new THREE.Mesh(new THREE.CylinderGeometry(.25,.25,.72,36),actuator);a.add(aBody);
 const aTop=new THREE.Mesh(new THREE.CylinderGeometry(.22,.25,.18,36),actuator);aTop.position.y=.45;a.add(aTop);
 const aBand=new THREE.Mesh(new THREE.CylinderGeometry(.28,.28,.08,36),actuatorEdge);aBand.position.y=-.28;a.add(aBand);

 const face=new THREE.Mesh(new THREE.CylinderGeometry(.28,.28,.11,36),actuator);
 face.rotation.x=Math.PI/2;face.position.z=.23;a.add(face);

 const screen=new THREE.Mesh(new THREE.PlaneGeometry(.13,.09),new THREE.MeshBasicMaterial({color:0x748326}));
 screen.position.set(.03,.03,.292);a.add(screen);

 const selector=new THREE.Mesh(new THREE.SphereGeometry(.055,14,9),black);
 selector.position.set(-.12,.14,.3);a.add(selector);

 const redKnob=new THREE.Mesh(new THREE.SphereGeometry(.06,14,9),red);
 redKnob.position.set(-.12,-.13,.3);a.add(redKnob);

 const openLampMat=new THREE.MeshStandardMaterial({color:0x07882c,emissive:0x005515});
 const openLamp=new THREE.Mesh(new THREE.SphereGeometry(.04,12,8),openLampMat);
 openLamp.position.set(.13,-.13,.305);a.add(openLamp);

 const wheel=new THREE.Mesh(new THREE.TorusGeometry(.22,.025,10,36),black);
 wheel.rotation.y=Math.PI/2;wheel.position.x=.42;a.add(wheel);

 const valveApi={
  group:g,
  setOpen(percent){
   const n=THREE.MathUtils.clamp(Number(percent)||0,0,100);
   mainValveOpen=n;
   valveWaterMat.opacity=n>0?.2+.47*n/100:.06;
   openLamp.material.emissive.setHex(n>1?0x00bb36:0);
   wheel.rotation.x=THREE.MathUtils.degToRad(n*3.6);
  }
 };

 valveApi.setOpen(mainValveOpen);
 return valveApi;
}

// ============================================================
// PRESSURE METER
// ============================================================

function createPressureGauge(x,y,z){
 const g=new THREE.Group();g.position.set(x,y,z);scene.add(g);

 const b=new THREE.MeshStandardMaterial({color:0x367be6,metalness:.28,roughness:.25});
 const s=new THREE.MeshStandardMaterial({color:0xd7dde1,metalness:.82,roughness:.18});
 const d=new THREE.MeshStandardMaterial({color:0x202326,roughness:.25});
 const lcd=new THREE.MeshBasicMaterial({color:0xd8edf0});

 const add=(geo,mat,p=[0,0,0],r=[0,0,0])=>{
  const m=new THREE.Mesh(geo,mat);m.position.set(...p);m.rotation.set(...r);m.castShadow=true;g.add(m);return m;
 };

 add(new THREE.CylinderGeometry(.09,.09,.42,20),s,[0,-.27,0]);
 add(new THREE.CylinderGeometry(.16,.12,.22,24),s,[0,.02,0]);
 add(new THREE.CylinderGeometry(.48,.48,.18,48),b,[0,.62,0],[Math.PI/2,0,0]);
 add(new THREE.TorusGeometry(.405,.035,12,48),s,[0,.62,.105]);
 add(new THREE.CircleGeometry(.375,48),d,[0,.62,.112]);
 add(new THREE.PlaneGeometry(.48,.23),lcd,[0,.68,.12]);

 const v=makeText("10.000",.42,.15,48,"#111");
 v.position.set(0,.66,.125);g.add(v);

 const u=makeText("kPa",.18,.08,40,"#111");
 u.position.set(-.13,.76,.126);g.add(u);

 return g;
}

// ============================================================
// 3D ANALOG PRESSURE GAUGE
// ============================================================

function createAnalogPressureGauge(x,y,z,scale=1){
 const g=new THREE.Group();g.position.set(x,y,z);g.scale.setScalar(scale);scene.add(g);
 const silver=new THREE.MeshStandardMaterial({color:0xcfd3d4,metalness:.8,roughness:.2});
 const white=new THREE.MeshBasicMaterial({color:0xffffff});
 const dark=new THREE.MeshBasicMaterial({color:0x151515});

 const body=new THREE.Mesh(new THREE.CylinderGeometry(.48,.48,.16,48),silver);
 body.rotation.x=Math.PI/2;body.castShadow=true;g.add(body);

 const face=new THREE.Mesh(new THREE.CircleGeometry(.41,48),white);
 face.position.z=.09;g.add(face);

 const rim=new THREE.Mesh(new THREE.TorusGeometry(.44,.045,12,48),silver);
 rim.position.z=.11;g.add(rim);

 for(let i=0;i<11;i++){
  const a=THREE.MathUtils.degToRad(135-i*27);
  const mark=new THREE.Mesh(new THREE.BoxGeometry(.025,.13,.02),dark);
  mark.position.set(Math.cos(a)*.32,Math.sin(a)*.32,.125);
  mark.rotation.z=a-Math.PI/2;g.add(mark);
 }

 const needle=new THREE.Mesh(new THREE.BoxGeometry(.035,.31,.025),dark);
 needle.position.set(.08,.08,.14);needle.rotation.z=-Math.PI/4;g.add(needle);

 const hub=new THREE.Mesh(new THREE.CircleGeometry(.055,20),dark);
 hub.position.z=.155;g.add(hub);

 const stem=new THREE.Mesh(new THREE.CylinderGeometry(.07,.07,.42,18),silver);
 stem.position.y=-.66;g.add(stem);

 const fitting=new THREE.Mesh(new THREE.CylinderGeometry(.15,.15,.22,24),silver);
 fitting.position.y=-.93;g.add(fitting);

 return g;
}

// ============================================================
// PRESSURE SWITCH
// ============================================================

function createPressureSwitch(x,y,z){
 const g=new THREE.Group();g.position.set(x,y,z);scene.add(g);

 const steel=new THREE.MeshStandardMaterial({color:0xbfc7cc,metalness:.8,roughness:.22});
 const dark=new THREE.MeshStandardMaterial({color:0x303438,metalness:.6,roughness:.3});
 const green=new THREE.MeshBasicMaterial({color:0x21a447});
 const redM=new THREE.MeshBasicMaterial({color:0xd92d20});

 const body=new THREE.Mesh(new THREE.CylinderGeometry(.28,.28,.16,32),steel);
 body.rotation.x=Math.PI/2;g.add(body);

 const face=new THREE.Mesh(new THREE.CircleGeometry(.22,32),dark);
 face.position.z=.09;g.add(face);

 const center=new THREE.Mesh(new THREE.CircleGeometry(.11,24),green);
 center.position.z=.105;g.add(center);

 [-.36,.36].forEach(x=>{
  const lug=new THREE.Mesh(new THREE.BoxGeometry(.12,.28,.12),dark);
  lug.position.x=x;g.add(lug);
 });

 const stem=new THREE.Mesh(new THREE.CylinderGeometry(.06,.06,.42,16),steel);
 stem.position.y=-.42;g.add(stem);

 const fitting=new THREE.Mesh(new THREE.CylinderGeometry(.14,.14,.20,20),steel);
 fitting.position.y=-.68;g.add(fitting);

 const title=makeText("PRESSURE SWITCH",1.55,.25,42,"#17232d",null);
 title.position.set(0,.65,.16);g.add(title);

 let high=false;

 const normal=makeText("NORMAL",1.05,.34,48,"#fff","rgba(30,150,70,.96)");
 normal.position.set(-1.1,-.45,.16);g.add(normal);

 const highBox=makeText("HIGH",1.05,.34,48,"#fff","rgba(210,40,40,.96)");
 highBox.position.set(-1.1,-.45,.17);highBox.visible=false;g.add(highBox);

 const btn=new THREE.Mesh(
  new THREE.PlaneGeometry(1.15,.42),
  new THREE.MeshBasicMaterial({transparent:true,opacity:0,depthWrite:false})
 );
 btn.position.set(-1.1,-.45,.18);g.add(btn);

 const ray=new THREE.Raycaster(),mouse=new THREE.Vector2();

 renderer.domElement.addEventListener("pointerdown",e=>{
  mouse.x=e.clientX/innerWidth*2-1;
  mouse.y=-(e.clientY/innerHeight)*2+1;
  ray.setFromCamera(mouse,camera);

  if(ray.intersectObject(btn,false).length){
   high=!high;
   center.material=high?redM:green;
   normal.visible=!high;
   highBox.visible=high;
  }
 });

 return g;
}

// ============================================================
// FLOW METER
// ============================================================

function createFlowMeter(x,y,z){
 const g=new THREE.Group();g.position.set(x,y,z);g.scale.setScalar(.62);scene.add(g);

 const b=new THREE.MeshStandardMaterial({color:0x188fdd,metalness:.4,roughness:.27});
 const d=new THREE.MeshStandardMaterial({color:0x22282d,metalness:.35,roughness:.3});
 const w=new THREE.MeshStandardMaterial({color:0xf0f2f2,metalness:.3,roughness:.24});

 const add=(geo,mat,p=[0,0,0],r=[0,0,0])=>{
  const m=new THREE.Mesh(geo,mat);m.position.set(...p);m.rotation.set(...r);m.castShadow=true;g.add(m);return m;
 };

 add(new THREE.CylinderGeometry(.46,.46,.82,36),b);
 [-.49,.49].forEach(yy=>add(new THREE.CylinderGeometry(.68,.68,.14,40),b,[0,yy,0]));
 add(new THREE.CylinderGeometry(.14,.14,.55,20),b,[.43,.1,0],[0,0,Math.PI/2]);
 add(new THREE.CylinderGeometry(.46,.46,.16,40),w,[.88,.1,0],[Math.PI/2,0,0]);
 add(new THREE.CircleGeometry(.34,36),d,[.88,.1,.09]);

 return g;
}

// ============================================================
// READOUT
// ============================================================

function createInstrumentReadout(tag,initialValue,x,y,z,width=2,displayName=tag){
 const group=new THREE.Group();group.position.set(x,y,z);scene.add(group);

 if(displayName){
  const nameLabel=makeText(displayName,width*1.05,.34,64,"#17232d",null);
  nameLabel.position.set(0,.45,.04);group.add(nameLabel);
 }

 const valueLabel=makeText(initialValue,width*1.05,.32,68,"#ffffff","rgba(22,61,91,.98)");
 valueLabel.position.set(0,-.17,.05);group.add(valueLabel);

 const api={group,setValue:value=>valueLabel.userData.setText(value)};
 registerOutput(tag,api.setValue);
 return api;
}

function createStatusReadout(tag,initialValue,x,y,z,width=1.4,color="#ff3030",background=null){
 const label=makeText(initialValue,width*1.05,.44,66,color,background);
 label.position.set(x,y,z);scene.add(label);
 registerOutput(tag,value=>label.userData.setText(value));
 return label;
}

// ============================================================
// AUTO / PID / INTERLOCK
// ============================================================

function createModePanel(x,y,z){
 const g=new THREE.Group();g.position.set(x,y,z);scene.add(g);
 const raycaster=new THREE.Raycaster(),mouse=new THREE.Vector2(),buttons=[];

 const box=(text,yy,tag,lamp=true)=>{
  let state=true;
  const btnMat=new THREE.MeshBasicMaterial({color:0x65e7e7});
  const btn=new THREE.Mesh(new THREE.PlaneGeometry(1.65,.48),btnMat);
  btn.position.set(0,yy,0);g.add(btn);

  const label=makeText(text,1.45,.30,48,"#08242c",null);
  label.position.set(-.12,yy,.02);g.add(label);

  let lampMat=null;

  if(lamp){
   lampMat=new THREE.MeshBasicMaterial({color:0x00e83a});
   const l=new THREE.Mesh(new THREE.CircleGeometry(.12,24),lampMat);
   l.position.set(.68,yy,.03);g.add(l);
  }

  const item={mesh:btn,toggle(){
   state=!state;
   if(lampMat)lampMat.color.setHex(state?0x00e83a:0x666666);
   console.log(tag,state);
  }};

  buttons.push(item);

  registerOutput(tag,v=>{
   state=runningValue(v);
   if(lampMat)lampMat.color.setHex(state?0x00e83a:0x666666);
  });
 };

 box("AUTO",.95,"SYS_AUTO",true);
 box("PID Active",0,"PID_ACTIVE",true);
 box("INTERLOCK",-.95,"INTERLOCK_ACTIVE",false);

 const non=makeText("NON-INTERLOCK",1.7,.22,42,"#d71920",null);
 non.position.set(0,-1.38,.04);g.add(non);

 registerOutput("INTERLOCK_ACTIVE",v=>{non.visible=!runningValue(v)});

 renderer.domElement.addEventListener("pointerdown",e=>{
  mouse.x=(e.clientX/innerWidth)*2-1;
  mouse.y=-(e.clientY/innerHeight)*2+1;
  raycaster.setFromCamera(mouse,camera);
  const hit=raycaster.intersectObjects(buttons.map(b=>b.mesh))[0];
  if(hit)buttons.find(b=>b.mesh===hit.object)?.toggle();
 });

 return g;
}

// ============================================================
// POWER / ZONE RTU / ALARM
// ============================================================

function createBottomPanel(x,y,z){
 const g=new THREE.Group();g.position.set(x,y,z);scene.add(g);
 const raycaster=new THREE.Raycaster(),mouse=new THREE.Vector2(),buttons=[];

 const add=(text,px,tag)=>{
  let state=false;
  const mat=new THREE.MeshBasicMaterial({color:0xba5f04});
  const box=new THREE.Mesh(new THREE.PlaneGeometry(1.7,.5),mat);
  box.position.set(px,0,0);g.add(box);

  const label=makeText(text,1.5,.34,48,"#fff",null);
  label.position.set(px,0,.02);g.add(label);

  const btn={mesh:box,toggle(){
   state=!state;
   mat.color.setHex(state?0x19a34a:0xba5f04);
   setOutput(tag,state);
  }};

  buttons.push(btn);

  registerOutput(tag,v=>{
   state=runningValue(v);
   mat.color.setHex(state?0x19a34a:0xba5f04);
  });
 };

 add("POWER",-2.3,"POWER_STATUS");
 add("ZONE RTU",0,"ZONE_RTU_STATUS");
 add("ALARM",2.3,"ALARM_STATUS");

 renderer.domElement.addEventListener("pointerdown",e=>{
  mouse.x=(e.clientX/innerWidth)*2-1;
  mouse.y=-(e.clientY/innerHeight)*2+1;
  raycaster.setFromCamera(mouse,camera);
  const hit=raycaster.intersectObjects(buttons.map(b=>b.mesh))[0];
  if(hit)buttons.find(b=>b.mesh===hit.object)?.toggle();
 });

 return g;
}

// ============================================================
// I/O BOX
// ============================================================

function createIOBox(x,y,z){
 const c=document.createElement("canvas"),ctx=c.getContext("2d");
 const v={sp:"0MPa",hz:"0Hz",pr:"-3MPa"};

 c.width=1024;c.height=420;

 const draw=()=>{
  ctx.clearRect(0,0,1024,420);
  ctx.fillStyle="#203a4d";ctx.fillRect(0,0,1024,420);
  ctx.strokeStyle="#8bcfff";ctx.lineWidth=8;ctx.strokeRect(5,5,1014,410);
  ctx.textAlign="left";

  const f=(t,val,x,y,w)=>{
   ctx.fillStyle="#fff";ctx.font="bold 52px Arial";ctx.fillText(t,x,y);
   ctx.fillStyle="#e9f6ff";ctx.fillRect(x,y+18,w,86);
   ctx.strokeStyle="#79bfe8";ctx.lineWidth=4;ctx.strokeRect(x,y+18,w,86);
   ctx.fillStyle="#102634";ctx.font="bold 68px Arial";ctx.fillText(String(val),x+16,y+82);
  };

  f("Setpoint",v.sp,55,82,350);
  f("Actual frequency",v.hz,535,82,430);
  f("Actual Pressure",v.pr,55,260,400);
 };

 draw();

 const tex=new THREE.CanvasTexture(c);
 tex.colorSpace=THREE.SRGBColorSpace;
 tex.anisotropy=renderer.capabilities.getMaxAnisotropy();

 const g=new THREE.Group();g.position.set(x,y,z);scene.add(g);

 const body=new THREE.Mesh(new THREE.BoxGeometry(6.1,2.5,.18),new THREE.MeshStandardMaterial({color:0x263d4c}));
 g.add(body);

 const face=new THREE.Mesh(new THREE.PlaneGeometry(5.95,2.36),new THREE.MeshBasicMaterial({map:tex}));
 face.position.z=.095;face.renderOrder=30;g.add(face);

 [["P0101_SETPOINT","sp"],["P0101_FREQUENCY","hz"],["P0101_PRESSURE","pr"]].forEach(([tag,k])=>
  registerOutput(tag,value=>{v[k]=value;draw();tex.needsUpdate=true})
 );

 return g;
}

function componentName(text,x,y,z,w=1.8){
 const l=makeText(text,w,.28,46,"#17232d",null);
 l.position.set(x,y,z);scene.add(l);
}

function createPipeSupport(x,z,height){
 const post=new THREE.Mesh(new THREE.BoxGeometry(.16,height,.16),darkMetal);
 post.position.set(x,height/2,z);post.castShadow=true;scene.add(post);

 const foot=new THREE.Mesh(new THREE.BoxGeometry(.7,.1,.7),metal);
 foot.position.set(x,.05,z);foot.castShadow=true;scene.add(foot);
}

// ============================================================
// EQUIPMENT
// ============================================================

const tank1=createTank(-8,6,.62,.86,"DOSING TANK 1");
const tank2=createTank(-8,-6,.78,.86,"DOSING TANK 2");

const dosingPump1=createDosingPump(0,1.35,6,"P0102");
const dosingPump2=createDosingPump(0,1.35,-6,"P0103");

createPumpControlPanel(0,5.2,6.8,"P0102");
createPumpControlPanel(0,5.2,-5.2,"P0103");

createBottomPanel(-8,.65,10.5);
createModePanel(19,4.4,.65);

// ============================================================
// DOSING PIPES
// ============================================================

pipeRoute([tank1.outletWorld.clone(),new THREE.Vector3(-3,1.35,6),dosingPump1.inlet.clone()],.18,metal,"p0102");
pipe(dosingPump1.outlet,new THREE.Vector3(4.5,1.35,6),.18,metal,"p0102");

pipeRoute([tank2.outletWorld.clone(),new THREE.Vector3(-3,1.35,-6),dosingPump2.inlet.clone()],.18,metal,"p0103");
pipe(dosingPump2.outlet,new THREE.Vector3(4.5,1.35,-6),.18,metal,"p0103");

pipe(new THREE.Vector3(4.5,1.35,6),new THREE.Vector3(4.5,1.35,0),.22,metal,"p0102");
pipe(new THREE.Vector3(4.5,1.35,-6),new THREE.Vector3(4.5,1.35,0),.22,metal,"p0103");

// ============================================================
// MAIN SUBMERSIBLE PUMP + UNDERGROUND WELL
// ============================================================

createPumpWell(8,6);

const mainPump=createMainPump(8,-2.65,6);

componentName("SUBMERSIBLE PUMP",8,.65,7.1,2.5);

// ============================================================
// DOSING PIPE -> TOP MAIN WATER LINE
// ============================================================

pipeRoute(
 [
  new THREE.Vector3(4.5,1.35,0),
  new THREE.Vector3(4.5,10.8,0),
  new THREE.Vector3(4.7,11.35,0),
  new THREE.Vector3(5.2,11.7,0),
  new THREE.Vector3(12,11.7,0)
 ],
 .24,pipeBlue,"main"
);

// ============================================================
// SUBMERSIBLE PUMP -> DISCHARGE PIPE
// Straight underground riser then horizontal line
// ============================================================

pipeRoute(
 [
  mainPump.outlet,
  new THREE.Vector3(8,-.4,6),
  new THREE.Vector3(8,1.3,6),
  new THREE.Vector3(8,4.65,6),
  new THREE.Vector3(10.55,4.65,6)
 ],
 .24,pipeBlue,"main"
);

// ============================================================
// DISCHARGE PIPE -> MOTORIZED VALVE
// Clean smooth bend toward vertical valve line
// ============================================================

pipeRoute(
 [
  new THREE.Vector3(10.55,4.65,6),
  new THREE.Vector3(10.8,4.75,5.5),
  new THREE.Vector3(10.95,5.25,4),
  new THREE.Vector3(11,6.1,2),
  new THREE.Vector3(11,6.8,.7),
  new THREE.Vector3(11,7.14,0)
 ],
 .24,pipeBlue,"main"
);

// ============================================================
// PRESSURE GAUGE + PRESSURE SWITCH ON DISCHARGE PIPE
// ============================================================

// Gauge fitting sits directly on y=4.65 pipe
createAnalogPressureGauge(9.75,5.32,6,.72);
componentName("PRESSURE GAUGE",9.75,6.0,6.2,1.55);

// Switch fitting sits directly on same pipe
createPressureSwitch(8.75,5.33,6);

pipeJoint(11,7.14,0,.31);

// ============================================================
// MOTORIZED VALVE
// ============================================================

const mv0103=createMotorizedValve(11,7.7,0);
componentName("MOTORIZED VALVE",13,7.2,.56,2.15);

// ============================================================
// VALVE -> FLOW METER
// ============================================================

pipe(
 new THREE.Vector3(11,8.26,0),
 new THREE.Vector3(11,9.66,0),
 .24,pipeBlue,"main"
);

pipeJoint(11,8.26,0,.31);
pipeJoint(11,9.66,0,.31);

// ============================================================
// FLOW METER
// ============================================================

createFlowMeter(11,10,0);
componentName("FLOW METER",13,9.6,.6,1.55);

// ============================================================
// FLOW METER -> TOP MAIN PIPE
// ============================================================

pipe(
 new THREE.Vector3(11,10.34,0),
 new THREE.Vector3(11,10.9,0),
 .24,pipeBlue,"main"
);

pipeJoint(11,10.34,0,.31);

pipeRoute(
 [
  new THREE.Vector3(11,10.9,0),
  new THREE.Vector3(11,11.2,0),
  new THREE.Vector3(11.35,11.55,0),
  new THREE.Vector3(12,11.7,0)
 ],
 .24,pipeBlue,"main"
);

// ============================================================
// TOP MAIN PIPE -> NETWORK
// ============================================================

pipe(
 new THREE.Vector3(12,11.7,0),
 new THREE.Vector3(20,11.7,0),
 .24,pipeBlue,"main"
);

// ============================================================
// PRESSURE
// ============================================================

createPressureGauge(17,12.25,0);
componentName("PRESSURE METER",17,13.65,.6,1.95);
createInstrumentReadout("PIT0101","-3MPa",14.75,12.3,.42,2.25);

createAnalogPressureGauge(18.8,12.65,.35);
componentName("PRESSURE GAUGE",18.8,13.25,.35);

// ============================================================
// FLOW VALUE
// ============================================================

createInstrumentReadout("FIT0101","120m3/h",13,9.5,.42,2.25);

const fitTextSetter=outputs.get("FIT0101");

registerOutput("FIT0101",value=>{
 const numeric=parseFloat(value);

 if(Number.isFinite(numeric))
  setFlowZone("main",THREE.MathUtils.clamp(numeric/200*100,0,100));

 fitTextSetter(typeof value==="number"?`${value}m3/h`:value);
});

// ============================================================
// VALVE VALUES
// ============================================================

createInstrumentReadout("MV0103_HL","0MPa",8.8,8.8,.42,1.7,"MV_HL");
createInstrumentReadout("MV0103_LL","0MPa",8.8,7.55,.42,1.7,"MV_LL");
createInstrumentReadout("MV0103_OPEN","65%",8.8,6.3,.42,1.7,"OPEN %");

const oldMvOpenSetter=outputs.get("MV0103_OPEN");

registerOutput("MV0103_OPEN",value=>{
 const numeric=parseFloat(value);
 const open=Number.isFinite(numeric)?numeric:0;
 mv0103.setOpen(open);
 oldMvOpenSetter(`${open}%`);
});

const mvTitle=makeText("MV0103",1.7,.2,62,"#17232d",null);
mvTitle.position.set(13.15,8.5,.45);
scene.add(mvTitle);

createStatusReadout("MV0103_RUN","RUN",12.4,6.8,.45,1.15,"#ffffff","rgba(20,150,60,.96)");
createStatusReadout("MV0103_STOP","STOP",13.9,6.8,.45,1.15,"#ffffff","rgba(210,40,40,.96)");
createInstrumentReadout("MV0103_AM","A/M",13.15,6.40,.42,1.45,"");

// ============================================================
// MAIN PUMP VALUES
// ============================================================

createStatusReadout("P0101_RUN","RUN",4.3,-3.2,.55,1.15,"#ffffff","rgba(20,150,60,.96)");
createStatusReadout("P0101_STOP","STOP",5.8,-3.2,.55,1.15,"#ffffff","rgba(210,40,40,.96)");

createInstrumentReadout("P0101_AM","A/M",5.05,-4.05,.42,1.1,"");
createInstrumentReadout("P0101_HL","0MPa",5.0,-5.05,.42,2);
createInstrumentReadout("P0101_LL","0MPa",5.0,-6.1,.42,2);

// Level sensor
componentName("Level Sensor",12.765,-3.951,1.5,2.2);
createInstrumentReadout("LIT0101","-25M",12.165,-4.95,1.5,1.6,"LIT0101");

// ============================================================
// I/O BOX
// ============================================================

createIOBox(15.4,1.25,1.2);

// ============================================================
// ANALYZERS
// ============================================================

pipe(new THREE.Vector3(15.5,11.7,0),new THREE.Vector3(15.5,7.2,0),.13,pipeBlue,"main");

pipe(new THREE.Vector3(15.5,10.3,0),new THREE.Vector3(17,10.3,0),.12,pipeBlue,"main");
createInstrumentReadout("AIT0101","-3NTU",18.25,10.3,.42,2.25);

pipe(new THREE.Vector3(15.5,8.75,0),new THREE.Vector3(17,8.75,0),.12,pipeBlue,"main");
createInstrumentReadout("AIT0102","0pH",18.25,8.75,.42,2.25);

pipe(new THREE.Vector3(15.5,7.2,0),new THREE.Vector3(17,7.2,0),.12,pipeBlue,"main");
createInstrumentReadout("AIT0103","-3mg/l",18.25,7.2,.42,2.25);

// ============================================================
// NETWORK
// ============================================================

const networkLabel=makeText("TO THE NETWORK →",3.8,.32,52,"#17232d",null);
networkLabel.position.set(22.6,11.55,.42);
scene.add(networkLabel);

// ============================================================
// TANK VALUES
// ============================================================

createInstrumentReadout("LIT0303","3900L",-6,.5,-2,2);
createInstrumentReadout("LIT0302","3900L",-8,2.2,9.5,2);

const ag1=makeText("AGITATOR-1",2.5,.32,64,"#17232d",null);
ag1.position.set(-8,13,1.8);
scene.add(ag1);

const ag2=makeText("AGITATOR-2",2.5,.32,64,"#17232d",null);
ag2.position.set(-8,13,-10.2);
scene.add(ag2);

// ============================================================
// TANK SCADA
// ============================================================

const lit1=outputs.get("LIT0302");
const lit2=outputs.get("LIT0303");

registerOutput("LIT0302",value=>{
 const v=parseFloat(value);
 if(Number.isFinite(v))tank1.setVolume(v);
 lit1(Number.isFinite(v)?`${Math.round(v)}L`:value);
});

registerOutput("LIT0303",value=>{
 const v=parseFloat(value);
 if(Number.isFinite(v))tank2.setVolume(v);
 lit2(Number.isFinite(v)?`${Math.round(v)}L`:value);
});

registerOutput("AGITATOR01_STATUS",value=>tank1.setRunning(value));
registerOutput("AGITATOR02_STATUS",value=>tank2.setRunning(value));

registerOutput("TANK1_LEVEL",value=>tank1.setLevel(THREE.MathUtils.clamp(Number(value)/100,0,1)));
registerOutput("TANK2_LEVEL",value=>tank2.setLevel(THREE.MathUtils.clamp(Number(value)/100,0,1)));

// ============================================================
// SUPPORTS
// ============================================================

createPipeSupport(4.5,5.3,1.35);
createPipeSupport(4.5,-5.3,1.35);

createPipeSupport(11,0,10);
createPipeSupport(10,6,4.45);

// ============================================================
// ANIMATION
// ============================================================

const clock=new THREE.Clock();
const _labelWorldPos=new THREE.Vector3();
let elapsed=0;

renderer.setAnimationLoop(()=>{
 const delta=Math.min(clock.getDelta(),.05);
 elapsed+=delta;

 tank1.animate(elapsed,delta);
 tank2.animate(elapsed+.5,delta);

 const p1Flow=flowZones.p0102.running?flowZones.p0102.percent/100:0;
 const p2Flow=flowZones.p0103.running?flowZones.p0103.percent/100:0;
 const mainFlow=flowZones.main.running?flowZones.main.percent/100*mainValveOpen/100:0;

 dosingPump1.rotor.rotation.x+=delta*5*p1Flow;
 dosingPump2.rotor.rotation.x+=delta*5*p2Flow;
 mainPump.rotor.rotation.y+=delta*10*mainFlow;

 mainPump.group.position.y=
  mainPump.baseY+
  Math.sin(elapsed*18)*.018*mainFlow;

 animatePipeFlow(delta);

 for(const label of labelMeshes){
  label.getWorldPosition(_labelWorldPos);

  const dist=camera.position.distanceTo(_labelWorldPos);

  label.scale.setScalar(
   THREE.MathUtils.clamp(
    dist/LABEL_REF_DIST,
    .95,
    1.15
   )
  );
 }

 controls.update();
 renderer.render(scene,camera);
});

// ============================================================
// RESIZE
// ============================================================

addEventListener("resize",()=>{
 camera.aspect=innerWidth/innerHeight;
 camera.updateProjectionMatrix();
 renderer.setSize(innerWidth,innerHeight);
 renderer.setPixelRatio(Math.min(devicePixelRatio,2));
});