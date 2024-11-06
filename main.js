import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setAnimationLoop(animate);
document.body.appendChild(renderer.domElement);

// Load the GLB model
const loader = new GLTFLoader();
loader.load(
  'public/blenderthree.glb',
  (gltf) => {
    const model = gltf.scene;
    scene.add(model);

    // Find the cube and sphere objects by name
    const cube = model.getObjectByName('Cube');
    const sphere = model.getObjectByName('Sphere');

    // Wait for the DOM elements to be available
    setTimeout(() => {
      // Create UI sliders
      const cubeXSlider = document.getElementById('cube-x');
      const cubeScaleSlider = document.getElementById('cube-scale');
      const sphereXSlider = document.getElementById('sphere-x');
      const sphereScaleSlider = document.getElementById('sphere-scale');

      // Update the scene based on slider values
      function updateScene() {
        cube.position.x = cubeXSlider.value;
        cube.scale.set(cubeScaleSlider.value, cubeScaleSlider.value, cubeScaleSlider.value);

        sphere.position.x = sphereXSlider.value;
        sphere.scale.set(sphereScaleSlider.value, sphereScaleSlider.value, sphereScaleSlider.value);
      }

      // Attach event listeners to the sliders
      cubeXSlider.addEventListener('input', updateScene);
      cubeScaleSlider.addEventListener('input', updateScene);
      sphereXSlider.addEventListener('input', updateScene);
      sphereScaleSlider.addEventListener('input', updateScene);
    }, 100);

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

function animate() {
  renderer.render(scene, camera);
}