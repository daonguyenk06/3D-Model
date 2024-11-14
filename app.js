import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

// Scene, Camera, Renderer Setup
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Lighting
const light = new THREE.DirectionalLight(0xffffff, 1);
light.position.set(10, 10, 10);
scene.add(light);

// Load GLTF Model
const loader = new GLTFLoader();
loader.load('path/to/your/model.glb', (gltf) => {
    const model = gltf.scene;
    scene.add(model);

    // Add interaction: rotate model on click
    window.addEventListener('click', () => {
        model.rotation.y += 0.1;
    });
}, undefined, (error) => {
    console.error(error);
});

// Camera Controls
const controls = new OrbitControls(camera, renderer.domElement);
camera.position.z = 5;

// Animation Loop
function animate() {
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
    controls.update();
}
animate();
