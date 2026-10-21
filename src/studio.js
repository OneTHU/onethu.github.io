import * as THREE from 'three';
import {RoundedBoxGeometry} from 'three/addons/geometries/RoundedBoxGeometry.js';
export async function mountStudio(host){
 const canvas=host.querySelector('canvas'),poster=host.querySelector('img'),reduced=matchMedia('(prefers-reduced-motion: reduce)');
 const renderer=new THREE.WebGLRenderer({canvas,antialias:true,alpha:true,powerPreference:'low-power'});
 renderer.setPixelRatio(Math.min(devicePixelRatio,1.75));renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.setClearColor(0,0);renderer.toneMapping=THREE.ACESFilmicToneMapping;
 const scene=new THREE.Scene(),camera=new THREE.PerspectiveCamera(32,1,.1,100),group=new THREE.Group();scene.add(group);
 const loader=new THREE.TextureLoader(),texture=await loader.loadAsync(poster.src);texture.colorSpace=THREE.SRGBColorSpace;texture.anisotropy=Math.min(8,renderer.capabilities.getMaxAnisotropy());
 const bodyMaterial=new THREE.MeshStandardMaterial({color:0x555550,metalness:.75,roughness:.28}),glassMaterial=new THREE.MeshStandardMaterial({color:0x171716,metalness:.25,roughness:.17}),screenMaterial=new THREE.MeshBasicMaterial({map:texture,toneMapped:false});
 const body=new THREE.Mesh(new RoundedBoxGeometry(1.23,2.65,.12,6,.09),bodyMaterial);group.add(body);
 const glass=new THREE.Mesh(new RoundedBoxGeometry(1.20,2.61,.025,5,.08),glassMaterial);glass.position.z=.071;group.add(glass);
 const screen=new THREE.Mesh(new THREE.PlaneGeometry(1.16,1.16*844/390),screenMaterial);screen.position.z=.086;group.add(screen);
 const cameraSlot=new THREE.Mesh(new RoundedBoxGeometry(.15,.012,.01,3,.005),glassMaterial);cameraSlot.position.set(0,1.294,.09);group.add(cameraSlot);
 const button=new THREE.Mesh(new RoundedBoxGeometry(.018,.25,.045,3,.006),bodyMaterial);button.position.set(.62,.3,0);group.add(button);
 scene.add(new THREE.HemisphereLight(0xffffff,0x8d8b80,3));const key=new THREE.DirectionalLight(0xffffff,4);key.position.set(-3,5,5);scene.add(key);const rim=new THREE.DirectionalLight(0xffffff,2);rim.position.set(3,1,-2);scene.add(rim);
 let raf=0,visible=true,lost=false,disposed=false,renderWidth=0,renderHeight=0;
 function draw(){raf=0;if(disposed||lost||document.hidden||!visible||reduced.matches)return;
  const r=host.getBoundingClientRect(),progress=THREE.MathUtils.clamp((100-r.top)/(innerHeight*.9),0,1);
  group.rotation.set(-.035+progress*.09,-.25+progress*.48,-.055+progress*.075);group.position.y=.03-progress*.06;
  const width=host.clientWidth,height=host.clientHeight;if(width!==renderWidth||height!==renderHeight){renderer.setSize(width,height,false);camera.aspect=width/height;camera.updateProjectionMatrix();renderWidth=width;renderHeight=height;}const tan=Math.tan(THREE.MathUtils.degToRad(16));camera.position.set(0,.03,Math.max(2.92/(2*tan),1.55/(2*tan*camera.aspect))+.18);camera.lookAt(0,0,0);renderer.render(scene,camera);host.classList.add('is-ready');
 }
 const schedule=()=>{if(!raf)raf=requestAnimationFrame(draw);};const ro=new ResizeObserver(schedule);ro.observe(host);const io=new IntersectionObserver(([entry])=>{visible=entry.isIntersecting;if(visible)schedule();});io.observe(host);
 const onLost=e=>{e.preventDefault();lost=true;host.classList.remove('is-ready');};const onRestored=()=>{lost=false;schedule();};canvas.addEventListener('webglcontextlost',onLost);canvas.addEventListener('webglcontextrestored',onRestored);
 const onMotion=()=>{if(reduced.matches)host.classList.remove('is-ready');else schedule();};reduced.addEventListener('change',onMotion);window.addEventListener('scroll',schedule,{passive:true});document.addEventListener('visibilitychange',schedule);
 function dispose(){if(disposed)return;disposed=true;cancelAnimationFrame(raf);ro.disconnect();io.disconnect();window.removeEventListener('scroll',schedule);document.removeEventListener('visibilitychange',schedule);reduced.removeEventListener('change',onMotion);canvas.removeEventListener('webglcontextlost',onLost);canvas.removeEventListener('webglcontextrestored',onRestored);group.traverse(object=>object.geometry?.dispose());bodyMaterial.dispose();glassMaterial.dispose();screenMaterial.dispose();texture.dispose();renderer.dispose();}
 window.addEventListener('pagehide',dispose,{once:true});schedule();return dispose;
}
