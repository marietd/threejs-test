import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setAnimationLoop(animate);
document.body.appendChild(renderer.domElement);

let cubeMixer, sphereMixer; // Separate mixers for the cube and sphere
const clock = new THREE.Clock(); // For delta time calculation

let cubeTexture;

// Load the GLB model
const loader = new GLTFLoader();
loader.load(
  'public/blenderthreeanimated2.glb',
  (gltf) => {
    const model = gltf.scene;
    scene.add(model);

    // Find the cube and sphere objects by name
    const cube = model.getObjectByName('Cube');
    const sphere = model.getObjectByName('Sphere');

    // Check if the animations exist and set up the mixers
    if (cube && gltf.animations.length > 0) {
      cubeMixer = new THREE.AnimationMixer(cube);
      const cubeClip = gltf.animations.find((clip) => clip.name === 'CubeAction'); // Replace with the correct name
      if (cubeClip) {
        const cubeAction = cubeMixer.clipAction(cubeClip);
        cubeAction.play();
      }
    }

    if (sphere && gltf.animations.length > 0) {
      sphereMixer = new THREE.AnimationMixer(sphere);
      const sphereClip = gltf.animations.find((clip) => clip.name === 'SphereAction'); // Replace with the correct name
      if (sphereClip) {
        const sphereAction = sphereMixer.clipAction(sphereClip);
        sphereAction.play();
      }
    }

    model.traverse(function(node) {
      if (node.isMesh && node.name === 'Cube') {
          const textureLoader = new THREE.TextureLoader();
          textureLoader.load('public/pattern.jpg', function(texture) {
              node.material.map = texture;
              node.material.needsUpdate = true;
              cubeTexture = texture;
          });
      }
  });

    // Add lighting to the scene
    const ambientLight = new THREE.AmbientLight(0x404040);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(0, 1, 1);
    scene.add(directionalLight);

    camera.position.set(3, 1, 5); // Adjust x, y, z as needed
    camera.lookAt(scene.position);

  },
  (progress) => {
    console.log(`Loading file: ${(progress.loaded / progress.total * 100)}% loaded`);
  },
  (error) => {
    console.error('An error occurred while loading the GLB model:', error);
  }
);

// Get the sliders and add event listeners to control animation speed
const cubeSpeedSlider = document.getElementById('cube-animation-speed');
const sphereSpeedSlider = document.getElementById('sphere-animation-speed');
const cubeTextureSlider = document.getElementById('cube-texture');

cubeSpeedSlider.addEventListener('input', (event) => {
  const speed = parseFloat(event.target.value);
  if (cubeMixer) {
    cubeMixer.timeScale = speed;
  }
});

sphereSpeedSlider.addEventListener('input', (event) => {
  const speed = parseFloat(event.target.value);
  if (sphereMixer) {
    sphereMixer.timeScale = speed;
  }
});

cubeTextureSlider.addEventListener('input', (event) => {
  const texture = parseFloat(event.target.value);
  if (cubeMixer) {
    cubeTexture.repeat.set(texture, texture);
    cubeTexture.needsUpdate = true;
  }
});

function animate() {
  // Calculate delta time for consistent animations
  const deltaTime = clock.getDelta();

  // Update the mixers
  if (cubeMixer) {
    cubeMixer.update(deltaTime);
  }
  if (sphereMixer) {
    sphereMixer.update(deltaTime);
  }

  renderer.render(scene, camera);
}
