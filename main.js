class ModelViewer {
  constructor(containerElement) {
    this.container = containerElement || document.body;
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x2a3b4c);
    this.camera = new THREE.PerspectiveCamera(
      60,
      this.container.clientWidth / this.container.clientHeight,
      0.1,
      1000
    );
    this.camera.position.set(0, 0, 5);
    this.renderer = new THREE.WebGLRenderer({ 
      antialias: true,
      powerPreference: 'high-performance',
      alpha: true
    });
    this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
    this.renderer.setPixelRatio(window.devicePixelRatio);
    if (this.renderer.outputEncoding !== undefined) {
      this.renderer.outputEncoding = THREE.sRGBEncoding;
    }
    this.renderer.physicallyCorrectLights = true;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1;
    this.container.appendChild(this.renderer.domElement);
    this.controls = new THREE.OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.25;
    this.controls.screenSpacePanning = true;
    this.controls.target.set(0, 0, 0);
    this.controls.update();
    this.addLights();
    // this.addDebugHelpers();
    window.addEventListener('resize', this.onWindowResize.bind(this));
    this.initDragAndDrop();
    this.animate();
  }

  initDragAndDrop() {
    this.container.addEventListener('dragover', (event) => {
      event.preventDefault();
      this.container.style.border = '2px dashed white';
    });

    this.container.addEventListener('dragleave', () => {
      this.container.style.border = 'none';
    });

    this.container.addEventListener('drop', (event) => {
      event.preventDefault();
      this.container.style.border = 'none';
      const file = event.dataTransfer.files[0];
      if (file && (file.name.endsWith('.gltf') || file.name.endsWith('.glb'))) {
        const reader = new FileReader();
        reader.onload = (e) => {
          this.clearScene();
          this.loadModel(e.target.result);
        };
        reader.readAsDataURL(file);
      }
    });
  }

  clearScene() {
    while (this.scene.children.length > 0) {
      this.scene.remove(this.scene.children[0]);
    }
    this.addLights();
    this.addEnvironmentMap();
  }
  
  addLights() {
    // Clear any existing lights
    this.scene.children.forEach(child => {
      if (child.isLight) this.scene.remove(child);
    });
    
    // Add ambient light for base illumination
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    this.scene.add(ambientLight);
    
    // Add hemisphere light for more natural environmental lighting
    const hemiLight = new THREE.HemisphereLight(0xffffff, 0xbbbbff, 0.3);
    this.scene.add(hemiLight);
    
    // Key light - main directional light (simulates sun)
    const mainLight = new THREE.DirectionalLight(0xffffff, 1.0);
    mainLight.position.set(1, 1, 1).normalize();
    mainLight.castShadow = true;
    
    if (mainLight.shadow) {
      mainLight.shadow.mapSize.width = 2048;
      mainLight.shadow.mapSize.height = 2048;
      mainLight.shadow.camera.near = 0.1;
      mainLight.shadow.camera.far = 500;
      mainLight.shadow.bias = -0.001;
      
      const shadowCam = mainLight.shadow.camera;
      shadowCam.left = -10;
      shadowCam.right = 10;
      shadowCam.top = 10;
      shadowCam.bottom = -10;
    }
    
    this.scene.add(mainLight);
    
    const fillLight = new THREE.DirectionalLight(0xffffff, 0.5);
    fillLight.position.set(-1, 0.5, -1).normalize();
    this.scene.add(fillLight);
    
    const rimLight = new THREE.DirectionalLight(0xffffff, 0.3);
    rimLight.position.set(0, 0, -1).normalize();
    this.scene.add(rimLight);
    
    this.addEnvironmentMap();
  }
  
  addEnvironmentMap() {
    const pmremGenerator = new THREE.PMREMGenerator(this.renderer);
    pmremGenerator.compileEquirectangularShader();
    
    const colors = [new THREE.Color(0x88ccff), new THREE.Color(0x334455)]; // Sky blue to dark blue
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const context = canvas.getContext('2d');
    const gradient = context.createLinearGradient(0, 0, 0, 512);
    gradient.addColorStop(0, colors[0].getStyle());
    gradient.addColorStop(1, colors[1].getStyle());
    context.fillStyle = gradient;
    context.fillRect(0, 0, 512, 512);
    
    const texture = new THREE.CanvasTexture(canvas);
    texture.mapping = THREE.EquirectangularReflectionMapping;
    
    const envMap = pmremGenerator.fromEquirectangular(texture).texture;
    this.scene.environment = envMap;
    
    texture.dispose();
    pmremGenerator.dispose();
  }
  
  addDebugHelpers() {
    const axesHelper = new THREE.AxesHelper(5);
    this.scene.add(axesHelper);
    const gridHelper = new THREE.GridHelper(10, 10);
    this.scene.add(gridHelper);
  }
  
  loadModel(url, callback) {
    const loadingManager = new THREE.LoadingManager();
    loadingManager.onProgress = (url, loaded, total) => {
      console.log(`Loading: ${Math.round(loaded / total * 100)}%`);
    };
    const dracoLoader = new THREE.DRACOLoader();
    dracoLoader.setDecoderPath('https://www.gstatic.com/draco/v1/decoders/');
    const loader = new THREE.GLTFLoader(loadingManager);
    loader.setDRACOLoader(dracoLoader);
    loader.load(
      url,
      (gltf) => {
        console.log('Model loaded:', gltf);
        const model = gltf.scene;
        this.fixMaterials(model);

        const container = this.centerAndScaleModel(model);

        this.setupCameraForModel(container);
        // this.addBoundingBoxHelper(container);

        if (callback && typeof callback === 'function') {
          callback(container);
        }
      },
      (xhr) => {
        console.log(`${Math.round(xhr.loaded / xhr.total * 100)}% loaded`);
      },
      (error) => {
        console.error('Error loading model:', error);
      }
    );
  }

  centerAndScaleModel(model) {
    const box = new THREE.Box3().setFromObject(model);

    const size = new THREE.Vector3();
    box.getSize(size);
    const maxDim = Math.max(size.x, size.y, size.z);

    const desiredSize = 10;
    const scale = maxDim > 0 ? desiredSize / maxDim : 1;
    
    const container = new THREE.Group();
    this.scene.add(container);
    
    this.scene.remove(model);
    container.add(model);
    
    container.scale.set(scale, scale, scale);
    
    const scaledBox = new THREE.Box3().setFromObject(container);
    const center = new THREE.Vector3();
    scaledBox.getCenter(center);
    
    container.position.x = -center.x;
    container.position.y = -center.y;
    container.position.z = -center.z;
    
    return container;
  }

  addBoundingBoxHelper(object) {
    const box = new THREE.Box3().setFromObject(object);
    const helper = new THREE.Box3Helper(box, 0xffff00);
    this.scene.add(helper);
  }
  
  fixMaterials(model) {
    model.traverse((node) => {
      if (node.isMesh) {
        console.log('Found mesh:', node.name);
        
        if (node.material) {
          const materials = Array.isArray(node.material) ? node.material : [node.material];
          
          materials.forEach(material => {
            material.side = THREE.DoubleSide;
            
            if (material.metalness !== undefined) {
              if (material.metalness === 0) material.metalness = 0.1;
              
              if (material.roughness !== undefined && material.roughness < 0.1) {
                material.roughness = 0.1;
              }
            }
            
            if (material.map) {
              material.map.encoding = THREE.sRGBEncoding;
            }
            if (material.emissiveMap) {
              material.emissiveMap.encoding = THREE.sRGBEncoding;
            }
            if (material.envMap) {
              material.envMap.encoding = THREE.sRGBEncoding;
            }
            
            material.needsUpdate = true;
          });
        }
        
        node.castShadow = true;
        node.receiveShadow = true;
      }
    });
  }
  
  setupCameraForModel(model) {
    const box = new THREE.Box3().setFromObject(model);
    const size = new THREE.Vector3();
    box.getSize(size);
    
    const maxDim = Math.max(size.x, size.y, size.z);
    
    const fov = this.camera.fov * (Math.PI / 180);
    const cameraDistance = Math.abs(maxDim / Math.sin(fov / 2));
    
    this.camera.position.set(10, 10, cameraDistance);
    
    this.controls.target.set(0, 0, 0);
    this.controls.update();
    
    console.log('Camera setup complete:', {
      cameraPosition: this.camera.position,
      modelSize: size,
      cameraDistance: cameraDistance
    });
  }
  
  onWindowResize() {
    this.camera.aspect = this.container.clientWidth / this.container.clientHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
  }
  
  animate() {
    requestAnimationFrame(this.animate.bind(this));
    this.controls.update();
    this.renderer.render(this.scene, this.camera);
  }
}

function initModelViewer() {
  const container = document.getElementById('model-viewer');
  if (!container) {
    console.error('Container element not found');
    return;
  }
  if (container.clientHeight === 0) {
    container.style.height = '500px';
  }
  const viewer = new ModelViewer(container);
  viewer.loadModel('public/Shop_08.gltf', (model) => {
    console.log('Model added to scene:', model);
  });
}

document.addEventListener('DOMContentLoaded', () => {
  const container = document.getElementById('model-viewer') || document.body;
  new ModelViewer(container);
});