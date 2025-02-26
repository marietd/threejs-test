(function(){const o=document.createElement("link").relList;if(o&&o.supports&&o.supports("modulepreload"))return;for(const e of document.querySelectorAll('link[rel="modulepreload"]'))t(e);new MutationObserver(e=>{for(const s of e)if(s.type==="childList")for(const i of s.addedNodes)i.tagName==="LINK"&&i.rel==="modulepreload"&&t(i)}).observe(document,{childList:!0,subtree:!0});function n(e){const s={};return e.integrity&&(s.integrity=e.integrity),e.referrerPolicy&&(s.referrerPolicy=e.referrerPolicy),e.crossOrigin==="use-credentials"?s.credentials="include":e.crossOrigin==="anonymous"?s.credentials="omit":s.credentials="same-origin",s}function t(e){if(e.ep)return;e.ep=!0;const s=n(e);fetch(e.href,s)}})();class h{constructor(o){this.container=o||document.body,this.scene=new THREE.Scene,this.scene.background=new THREE.Color(2767692),this.camera=new THREE.PerspectiveCamera(60,this.container.clientWidth/this.container.clientHeight,.1,1e3),this.camera.position.set(0,0,5),this.renderer=new THREE.WebGLRenderer({antialias:!0,powerPreference:"high-performance",alpha:!0}),this.renderer.setSize(this.container.clientWidth,this.container.clientHeight),this.renderer.setPixelRatio(window.devicePixelRatio),this.renderer.outputEncoding!==void 0&&(this.renderer.outputEncoding=THREE.sRGBEncoding),this.renderer.physicallyCorrectLights=!0,this.renderer.toneMapping=THREE.ACESFilmicToneMapping,this.renderer.toneMappingExposure=1,this.container.appendChild(this.renderer.domElement),this.controls=new THREE.OrbitControls(this.camera,this.renderer.domElement),this.controls.enableDamping=!0,this.controls.dampingFactor=.25,this.controls.screenSpacePanning=!0,this.controls.target.set(0,0,0),this.controls.update(),this.addLights(),window.addEventListener("resize",this.onWindowResize.bind(this)),this.initDragAndDrop(),this.animate()}initDragAndDrop(){this.container.addEventListener("dragover",o=>{o.preventDefault(),this.container.style.border="2px dashed white"}),this.container.addEventListener("dragleave",()=>{this.container.style.border="none"}),this.container.addEventListener("drop",o=>{o.preventDefault(),this.container.style.border="none";const n=o.dataTransfer.files[0];if(n&&(n.name.endsWith(".gltf")||n.name.endsWith(".glb"))){const t=new FileReader;t.onload=e=>{this.clearScene(),this.loadModel(e.target.result)},t.readAsDataURL(n)}})}clearScene(){for(;this.scene.children.length>0;)this.scene.remove(this.scene.children[0]);this.addLights(),this.addEnvironmentMap()}addLights(){this.scene.children.forEach(i=>{i.isLight&&this.scene.remove(i)});const o=new THREE.AmbientLight(16777215,.5);this.scene.add(o);const n=new THREE.HemisphereLight(16777215,12303359,.3);this.scene.add(n);const t=new THREE.DirectionalLight(16777215,1);if(t.position.set(1,1,1).normalize(),t.castShadow=!0,t.shadow){t.shadow.mapSize.width=2048,t.shadow.mapSize.height=2048,t.shadow.camera.near=.1,t.shadow.camera.far=500,t.shadow.bias=-.001;const i=t.shadow.camera;i.left=-10,i.right=10,i.top=10,i.bottom=-10}this.scene.add(t);const e=new THREE.DirectionalLight(16777215,.5);e.position.set(-1,.5,-1).normalize(),this.scene.add(e);const s=new THREE.DirectionalLight(16777215,.3);s.position.set(0,0,-1).normalize(),this.scene.add(s),this.addEnvironmentMap()}addEnvironmentMap(){const o=new THREE.PMREMGenerator(this.renderer);o.compileEquirectangularShader();const n=[new THREE.Color(8965375),new THREE.Color(3359829)],t=document.createElement("canvas");t.width=512,t.height=512;const e=t.getContext("2d"),s=e.createLinearGradient(0,0,0,512);s.addColorStop(0,n[0].getStyle()),s.addColorStop(1,n[1].getStyle()),e.fillStyle=s,e.fillRect(0,0,512,512);const i=new THREE.CanvasTexture(t);i.mapping=THREE.EquirectangularReflectionMapping;const r=o.fromEquirectangular(i).texture;this.scene.environment=r,i.dispose(),o.dispose()}addDebugHelpers(){const o=new THREE.AxesHelper(5);this.scene.add(o);const n=new THREE.GridHelper(10,10);this.scene.add(n)}loadModel(o,n){const t=new THREE.LoadingManager;t.onProgress=(i,r,a)=>{console.log(`Loading: ${Math.round(r/a*100)}%`)};const e=new THREE.DRACOLoader;e.setDecoderPath("https://www.gstatic.com/draco/v1/decoders/");const s=new THREE.GLTFLoader(t);s.setDRACOLoader(e),s.load(o,i=>{console.log("Model loaded:",i);const r=i.scene;this.fixMaterials(r);const a=this.centerAndScaleModel(r);this.setupCameraForModel(a),n&&typeof n=="function"&&n(a)},i=>{console.log(`${Math.round(i.loaded/i.total*100)}% loaded`)},i=>{console.error("Error loading model:",i)})}centerAndScaleModel(o){const n=new THREE.Box3().setFromObject(o),t=new THREE.Vector3;n.getSize(t);const e=Math.max(t.x,t.y,t.z),i=e>0?10/e:1,r=new THREE.Group;this.scene.add(r),this.scene.remove(o),r.add(o),r.scale.set(i,i,i);const a=new THREE.Box3().setFromObject(r),c=new THREE.Vector3;return a.getCenter(c),r.position.x=-c.x,r.position.y=-c.y,r.position.z=-c.z,r}addBoundingBoxHelper(o){const n=new THREE.Box3().setFromObject(o),t=new THREE.Box3Helper(n,16776960);this.scene.add(t)}fixMaterials(o){o.traverse(n=>{n.isMesh&&(console.log("Found mesh:",n.name),n.material&&(Array.isArray(n.material)?n.material:[n.material]).forEach(e=>{e.side=THREE.DoubleSide,e.metalness!==void 0&&(e.metalness===0&&(e.metalness=.1),e.roughness!==void 0&&e.roughness<.1&&(e.roughness=.1)),e.map&&(e.map.encoding=THREE.sRGBEncoding),e.emissiveMap&&(e.emissiveMap.encoding=THREE.sRGBEncoding),e.envMap&&(e.envMap.encoding=THREE.sRGBEncoding),e.needsUpdate=!0}),n.castShadow=!0,n.receiveShadow=!0)})}setupCameraForModel(o){const n=new THREE.Box3().setFromObject(o),t=new THREE.Vector3;n.getSize(t);const e=Math.max(t.x,t.y,t.z),s=this.camera.fov*(Math.PI/180),i=Math.abs(e/Math.sin(s/2));this.camera.position.set(10,10,i),this.controls.target.set(0,0,0),this.controls.update(),console.log("Camera setup complete:",{cameraPosition:this.camera.position,modelSize:t,cameraDistance:i})}onWindowResize(){this.camera.aspect=this.container.clientWidth/this.container.clientHeight,this.camera.updateProjectionMatrix(),this.renderer.setSize(this.container.clientWidth,this.container.clientHeight)}animate(){requestAnimationFrame(this.animate.bind(this)),this.controls.update(),this.renderer.render(this.scene,this.camera)}}document.addEventListener("DOMContentLoaded",()=>{const d=document.getElementById("model-viewer")||document.body;new h(d)});
