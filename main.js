import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setAnimationLoop(animate);
document.body.appendChild(renderer.domElement);

let mixer;
const clock = new THREE.Clock(); // For calculating delta time

// Load the GLB model
const loader = new GLTFLoader();
loader.load(
  'public/blenderthreeanimated.glb',
  (gltf) => {
    const model = gltf.scene;
    scene.add(model);

    // Find the cube object by name
    const cube = model.getObjectByName('Cube');

    // Get the animation clip from the GLTF data
    const animationClip = gltf.animations[0];

    // Create a mixer to play the animation
    mixer = new THREE.AnimationMixer(cube);
    const action = mixer.clipAction(animationClip);
    action.play();

    // Store the mixer and clip on the cube's userData
    cube.userData.mixer = mixer;
    cube.userData.clip = animationClip;

    // Add lighting to the scene
    const ambientLight = new THREE.AmbientLight(0x404040);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(0, 1, 1);
    scene.add(directionalLight);

    camera.position.z = 5;
  },
  (progress) => {
    console.log(`Loading file: ${(progress.loaded / progress.total * 100)}% loaded`);
  },
  (error) => {
    console.error('An error occurred while loading the GLB model:', error);
  }
);

// Get the slider element and add an event listener to control animation speed
const speedSlider = document.getElementById('animation-speed');
speedSlider.addEventListener('input', (event) => {
  const speed = parseFloat(event.target.value);
  if (mixer) {
    mixer.timeScale = speed;
  }
});

function animate() {
  // Calculate the delta time between frames
  const deltaTime = clock.getDelta();

  // Update the animation mixer with delta time
  if (mixer) {
    mixer.update(deltaTime);
  }

  renderer.render(scene, camera);
}
