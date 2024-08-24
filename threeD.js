import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true; 
document.body.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.25;
controls.enableZoom = true;

const roomSize = 50;
controls.minDistance = 5; 
controls.maxDistance = roomSize / 2; 
const ambientLight = new THREE.AmbientLight(0xffffff);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight('rgb(255,255,255)', 0.5);
directionalLight.position.set(1, 100, 10).normalize();
directionalLight.castShadow = true; 
scene.add(directionalLight);

const textureloader = new THREE.TextureLoader();

function createRoom(size) {
  const room = new THREE.Group();

  const wallMaterial = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    side: THREE.DoubleSide,
    bumpMap: textureloader.load("./fabric_1.jpg"),
    bumpScale: 0.1,
    normalMap: textureloader.load("./fabric_1.jpg")
  });

  const floorMaterial = new THREE.MeshStandardMaterial({
    side: THREE.DoubleSide,
    map: textureloader.load("./fabric_1.jpg"),
  });
  const floorGeometry = new THREE.PlaneGeometry(size, size);
  const floor = new THREE.Mesh(floorGeometry, floorMaterial);
  floor.rotation.x = -Math.PI / 2; 
  floor.position.y = -size / 2; 
  floor.receiveShadow = true; 
  room.add(floor);

  const ceiling = new THREE.Mesh(floorGeometry, wallMaterial);
  ceiling.rotation.x = Math.PI / 2; 
  ceiling.position.y = size / 2; 
  ceiling.receiveShadow = true; 
  room.add(ceiling);

  const wallGeometry = new THREE.PlaneGeometry(size, size);
  const walls = [
    new THREE.Mesh(wallGeometry, wallMaterial), 
    new THREE.Mesh(wallGeometry, wallMaterial),
    new THREE.Mesh(wallGeometry, wallMaterial), 
    new THREE.Mesh(wallGeometry, wallMaterial), 
  ];

  walls[0].rotation.y = 0; 
  walls[0].position.z = size / 2;
  walls[0].receiveShadow = true; 
  room.add(walls[0]);

  walls[1].rotation.y = Math.PI;
  walls[1].position.z = -size / 2;
  walls[1].receiveShadow = true; 
  room.add(walls[1]);

  walls[2].rotation.y = -Math.PI / 2;
  walls[2].position.x = -size / 2;
  walls[2].receiveShadow = true; 
  room.add(walls[2]);

  walls[3].rotation.y = Math.PI / 2;
  walls[3].position.x = size / 2;
  walls[3].receiveShadow = true; 
  room.add(walls[3]);

  return room;
}

const room = createRoom(roomSize);
scene.add(room);

const loader = new GLTFLoader();
loader.load("./scene.gltf", (gltf) => {
  scene.add(gltf.scene);
  gltf.scene.scale.set(0.15, 0.15, 0.15); 
  gltf.scene.position.y = -27.3; 
  gltf.scene.position.z = 0.2;
  gltf.scene.traverse((child) => {
    if (child.isMesh) {
      child.castShadow = true; 
      child.receiveShadow = true; 
    }
  });

  const mommyLight = new THREE.PointLight(0xffffff, 1, 100); 
  mommyLight.position.set(0, 0, 0); 
  room.add(mommyLight);

  const loadMommy = new GLTFLoader();
  loadMommy.load('./chief.gltf', (mommy) => {
    scene.add(mommy.scene);
    mommy.scene.scale.set(15, 15, 15);
    mommy.scene.position.y = center.y - 32;
    mommy.scene.position.z = 10;
    mommy.scene.rotateY(204.2);
   
    mommyLight.position.set(mommy.scene.position.x - 10, mommy.scene.position.y  , mommy.scene.position.z - 10);
  });

  const boundingBox = new THREE.Box3().setFromObject(gltf.scene);
  const center = boundingBox.getCenter(new THREE.Vector3());
  camera.position.set(center.x, center.y + 10, center.z - 10.3);
  camera.lookAt(center); 
});

const animate = function () {
  requestAnimationFrame(animate);
  controls.update(); 
  renderer.render(scene, camera);
};
animate();

window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});