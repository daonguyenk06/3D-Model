// Scene, Camera, Renderer Setup
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth * 0.5, window.innerHeight * 0.5);
document.body.appendChild(renderer.domElement);

// Center the renderer
renderer.domElement.style.position = 'absolute';
renderer.domElement.style.top = '50%';
renderer.domElement.style.left = '50%';
renderer.domElement.style.transform = 'translate(-50%, -50%)';

/**** Lighting ****/
// Add ambient light for overall brightness
const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(ambientLight);

// Add directional light for shadows and highlights
const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
directionalLight.position.set(50, 50, 50);
scene.add(directionalLight);

// Add point lights to fill in other areas
const pointLight = new THREE.PointLight(0xffffff, 0.5);
pointLight.position.set(-50, -50, -50);
scene.add(pointLight);

// Load GLB Model
const loader = new THREE.GLTFLoader(); //GLTFLoader() works for both gltf and glb files
loader.load('3D-Models/cube.glb', (glb) => {
    const model = glb.scene;
    scene.add(model);

    // Add interaction: rotate model on click
    window.addEventListener('click', () => {
        model.rotation.y += 0.1;
    });
}, undefined, (error) => {
    console.error(error);
});

// Camera Controls
const controls = new THREE.OrbitControls(camera, renderer.domElement);
camera.position.set(0,0,5);

// Animation Loop
function animate() {
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
    controls.update();
}
animate();

// Handle window resize
window.addEventListener('resize', () => {
    renderer.setSize(window.innerWidth, window.innerHeight);
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
});