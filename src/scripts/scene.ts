import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader.js';
import Stats from 'three/examples/jsm/libs/stats.module'

const maxSize = 800;

const scene = new THREE.Scene()
// scene.add(new THREE.AxesHelper(5))

const camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
)
camera.position.z = 20

const renderer = new THREE.WebGLRenderer({ alpha: true });
renderer.setClearColor( 0x000000, 0 );
renderer.setSize(window.innerWidth, window.innerHeight)
document.getElementById("three-container").appendChild(renderer.domElement)

const controls = new OrbitControls(camera, renderer.domElement)
controls.enableDamping = true

const ambientLight = new THREE.AmbientLight(0x404040, 100);
scene.add(ambientLight);

const loader = new FBXLoader();
loader.load(
    'chibi.fbx',
    (object) => {
        object.scale.set(0.01, 0.01, 0.01); // FBX often imports large

        const box = new THREE.Box3().setFromObject(object);
        const center = box.getCenter(new THREE.Vector3());
        object.position.sub(center);
        scene.add(object);
    },
    (xhr) => {
        console.log((xhr.loaded / xhr.total * 100) + '% loaded');
    },
    (error) => {
        console.error('Error loading FBX:', error);
    }
);

window.addEventListener('resize', onWindowResize, false)
function onWindowResize() {
    // const size = Math.min(window.innerWidth, window.innerHeight, maxSize);
    camera.aspect = window.innerWidth / window.innerHeight
    camera.updateProjectionMatrix()
    renderer.setSize(window.innerWidth, window.innerHeight)
    render()
}
onWindowResize();

const stats = new Stats()
document.getElementById("three-container").appendChild(stats.dom)

// Create an array to store lights and their orbit data
const orbitLights = [];
const colors = [
    0xff0000, // red
    0x00ff00, // green
    0x0000ff, // blue
    0xffff00, // yellow
    0xff00ff  // magenta
];
const radii = [5, 7, 9, 6, 8]; // different orbit radii
const speeds = [0.5, 0.5, 0.5, 0.5,0.5]; // radians per second
const offset = [0.0, 1.25, 2.5, 3.75, 5.5];

colors.forEach((color, i) => {
    const light = new THREE.PointLight(color, 40, 200);
    scene.add(light);
    // optional: small sphere to visualize the light
    // const sphere = new THREE.Mesh(
    //     new THREE.SphereGeometry(0.1, 8, 8),
    //     new THREE.MeshBasicMaterial({ color })
    // );
    // light.add(sphere);
    orbitLights.push({
        light,
        radius: radii[i],
        speed: speeds[i],
        angle: offset[i] // random start position
    });
});

// Animate in your render loop
function animateLights(delta) {
    orbitLights.forEach(l => {
        l.angle += l.speed * delta;
        l.light.position.set(
            Math.cos(l.angle) * l.radius,
            Math.sin(l.angle * 0.7) * 2, // add a vertical wobble
            Math.sin(l.angle) * l.radius
        );
    });
}

function render() {
    renderer.render(scene, camera)
}

const clock = new THREE.Clock();
function animate() {
    requestAnimationFrame(animate)
    controls.update()
    const delta = clock.getDelta();
    animateLights(delta);
    render()
    stats.update()
}

export default animate;
