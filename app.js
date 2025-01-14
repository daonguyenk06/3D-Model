import * as THREE from "https://cdn.skypack.dev/three@0.129.0/build/three.module.js";

// To allow for the camera to move around the scene
import { OrbitControls } from "https://cdn.skypack.dev/three@0.129.0/examples/jsm/controls/OrbitControls.js";
// To allow for importing gltf and glb files
import { GLTFLoader } from "https://cdn.skypack.dev/three@0.129.0/examples/jsm/loaders/GLTFLoader.js";

//3D environment variables
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000)
const renderer = new THREE.WebGLRenderer({ alpha: true}); //Alpha: true allows for the transparent background
const loader = new GLTFLoader();
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

//HTML elements
const container3D = document.getElementById("container3D");
const displayContainer = document.getElementById('display-container');
const partSlider = document.getElementById('part-slider');
const sliderValue = document.getElementById('slider-value');


let model;
let objectParts = {}; //This list allows flexibility when changing file type

// This is a set list that requires manual changes
const objectParts_const = {
    'Sketchfab_Scene': {
        name: 'Sketchfab_Scene',
        type: 'Group'
    },
    'Sketchfab_model': {
        name: 'Sketchfab_model',
        type: 'Object3D'
    },
    'Root': {
        name: 'Root',
        type: 'Object3D'
    },
    'Brain001': {
        name: 'Right Hemisphere',
        type: 'Object3D'
    },
    'Brain001_0': {
        name: 'Right Hemisphere',
        type: 'Mesh'
    },
    'Brain001_0_1': {
        name: 'Right Hemisphere',
        type: 'Mesh'
    },
    'Brain002': {
        name: 'Cerebellum',
        type: 'Object3D'
    },
    'Brain002_0': {
        name: 'Cerebellum',
        type: 'Mesh'
    },
    'Brain003': {
        name: 'Left Hemisphere',
        type: 'Object3D'
    },
    'Brain003_0': {
        name: 'Left Hemisphere',
        type: 'Mesh'
    },
    'Brain003_0_1': {
        name: 'Left Hemisphere',
        type: 'Mesh'
    }
};

//This lines by itself allows clicking, dragging, zoom in/out, and pan the scene
let controls = new OrbitControls(camera, renderer.domElement);

//Logging for debugging
controls.addEventListener('change', () => {
    console.log(`Camera Position: x=${camera.position.x.toFixed(2)}, y=${camera.position.y.toFixed(2)}, z=${camera.position.z.toFixed(2)}`);

    const direction = new THREE.Vector3();
    camera.getWorldDirection(direction);
    console.log(`Camera Direction: x=${direction.x.toFixed(2)}, y=${direction.y.toFixed(2)}, z=${direction.z.toFixed(2)}`);
});


loader.load(
    '3D-Models/brain.glb', (file) => {
        console.log('\nModel loaded:', file);
        
        //Set model
        model = file.scene; 

        //Model settings
        model.scale.set(0.5, 0.5, 0.5); // Scale the model
        model.rotation.set(-1.6, 0, 1); // Set rotation
        
        //Add model
        scene.add(model);

        //Count objects in file
        let objectCount = 0;
        model.traverse((child) => {
            objectCount++;
        });
        console.log(`\nTotal number of objects in the GLB file: ${objectCount}`);

        //Get names and types of all objects in file
        console.log('\nObjects in the GLB file:');
        model.traverse((child) => {
            // Add object details to objectParts
            const objectName = child.name || `Unnamed_${Object.keys(objectParts).length + 1}`; // Handle unnamed objects
            objectParts[objectName] = {
                name: objectName, 
                type: child.type,
                object: child
            };
            console.log(`Name: ${child.name}`.padEnd(25) + `Type: ${child.type}`);
        });
        

    }, (loading) => {
        console.log(`Loading: ${(loading.loaded / loading.total) * 100}%`);
    }, (error) => {
        console.error('Error loading model:', error);
    }
)

console.log(objectParts)

//Scene
renderer.setSize(window.innerWidth, window.innerHeight);
container3D.appendChild(renderer.domElement); //Add renderer to DOM

//Camera
camera.position.z = 150; //Set how far camera will be from 3D model

//Customize OrbitControls 
// controls.enableDamping = true; // Smooth camera movement
// controls.dampingFactor = 0.05; // Adjust damping speed
// controls.enableZoom = true; // Allow zooming
// controls.minDistance = 10; // Minimum zoom distance
// controls.maxDistance = 200; // Maximum zoom distance
// controls.maxPolarAngle = Math.PI / 2; // Limit vertical rotation


//Lighting (get color code here: https://color.adobe.com/create/color-wheel)
const sunlight = new THREE.DirectionalLight(0xffffff, 3);
sunlight.position.set(50, 200, 100); // Higher position to simulate the sun
sunlight.castShadow = true; // Enable shadows
scene.add(sunlight);

const ambientLight = new THREE.AmbientLight(0xFA6850, 1); //Color of model
scene.add(ambientLight);

const hemisphereLight = new THREE.HemisphereLight(0xFA6850, 0x333333, 1);
scene.add(hemisphereLight);

//Resize window and camera
window.addEventListener('resize', function() {
    camera.aspect = window.innerWidth / this.window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

//Animation
function animate() {
    requestAnimationFrame(animate);

    // Automate movements
    if (model) {
        //model.rotation.z += 0.002; //Rotate horizontally
        //model.rotation.y += 0.002; //Rotate clockwise
        //model.rotation.x += 0.002; //Rotate vertically
    }
    
    TWEEN.update();
    renderer.render(scene, camera);
}

//Move parts independently
partSlider.addEventListener('input', () => {
    updatePartPosition('Brain001', 'x', true, partSlider, sliderValue);
    //updatePartPosition('Brain001_0', 'x', true, partSlider, sliderValue);
    // updatePartPosition('Brain001_0_1', 'x', true, partSlider, sliderValue);
    updatePartPosition('Brain002', 'y', true, partSlider, sliderValue);
    // updatePartPosition('Brain002_0', 'y', true, partSlider, sliderValue);
    updatePartPosition('Brain003', 'x', false, partSlider, sliderValue);
    // updatePartPosition('Brain003_0', 'x', false, partSlider, sliderValue);
    // updatePartPosition('Brain003_0_1', 'x', false, partSlider, sliderValue);

});

function updatePartPosition(partName, axis, positive, slider, value) {
    const selectedPart = objectParts[partName]; // Get the selected part
    if (selectedPart && selectedPart.object) {
        const part = selectedPart.object;

        // Update the chosen axis position based on slider value
        const positionValue = parseFloat(slider.value);
        if (positive) {
            part.position[axis] = positionValue;
        } else {
            part.position[axis] = -positionValue;
        }

        // Update the slider value display
        value.textContent = slider.value;

        //For testing purposes
        //console.log(`Updated ${part.name} position.${axis} to ${part.position[axis]}`);
    } else {
        console.error(`Part "${partName}" not found or invalid.`);
    }
}

//Code for clicking the parts
window.addEventListener('click', (event) => {
    // Update mouse coordinates (normalized device coordinates: -1 to +1)
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    // Perform raycasting
    raycaster.setFromCamera(mouse, camera);

    // Get intersections
    const intersects = raycaster.intersectObjects(model.children, true); // Check all descendants

    if (intersects.length > 0) {
        const clickedObject = intersects[0].object; // The first intersected object

        displayContainer.innerHTML = '';
        const nameDisplay = document.createElement('h2');
        nameDisplay.textContent = objectParts_const[clickedObject.name].name || '(Unnamed)';
        displayContainer.appendChild(nameDisplay);

        // Temporarily change the background color
        displayContainer.style.backgroundColor = 'blue';

        // Revert the background color after 0.5 seconds
        setTimeout(() => {
            displayContainer.style.backgroundColor = ''; // Reset to original color
        }, 500);

        //For testing purposes
        //console.log(`Clicked on: ${clickedObject.name || '(Unnamed)'} / ${objectParts_const[clickedObject.name].name}`);

        //Camera positions for each parts
        const cameraPositions = {
            Brain001: { x: 114.81, y: 3.15, z: -115.31 },  // Right Hemisphere
            Brain001_0: { x: 114.81, y: 3.15, z: -115.31 },
            Brain001_0_1: { x: 114.81, y: 3.15, z: -115.31 },
            Brain002: { x: 106.62, y: -71.79, z: 86.68 },   // Cerebellum
            Brain002_0: { x: 106.62, y: -71.79, z: 86.68 },
            Brain003: { x: -50.67, y: 8.48, z: 150 },   // Left Hemisphere
            Brain003_0: { x: -50.67, y: 8.48, z: 150 },
            Brain003_0_1: { x: -50.67, y: 8.48, z: 150 }
        };
        const defaultCameraPosition = { x: 0, y: 0, z: 150 }; // Fallback offset        
        
        // Get the target position (center of the clicked object)
        const targetPosition = clickedObject.getWorldPosition(new THREE.Vector3());
        
        // Retrieve the camera position for the clicked part
        const cameraPosition = cameraPositions[clickedObject.name] || defaultCameraPosition;
        console.log(clickedObject.name)

        // Smoothly move the camera to the specified position
        new TWEEN.Tween(camera.position)
            .to(cameraPosition, 1000) // Transition duration in milliseconds
            .easing(TWEEN.Easing.Quadratic.InOut)
            .onUpdate(() => {
                camera.lookAt(targetPosition); // Ensure the camera always looks at the target
            })
            .start();

        // Update controls target to the clicked object
        controls.target.copy(targetPosition);
        controls.update();

        // Log for debugging
        console.log(`Clicked part: ${clickedObject.name}`);
        console.log(`Target Position: x=${targetPosition.x}, y=${targetPosition.y}, z=${targetPosition.z}`);
        console.log(`Camera Position:`, cameraPosition);
    }
});

animate();
