import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

// --- Room Data Definition ---
const roomsData = {
  foyer: {
    id: 'foyer',
    name: 'Foyer',
    desc: 'The welcoming entrance area of the 4th Floor. Features a warm reception desk and comfortable seating. Connects directly to the main Corridor.',
    position: new THREE.Vector3(-7, 0.05, 0),
    size: { width: 6, depth: 6 },
    color: 0x1d3557,
    lightColor: 0xffd166,
    connections: ['corridor']
  },
  corridor: {
    id: 'corridor',
    name: 'Corridor',
    desc: 'The central spine of the 4th Floor. A sleek, well-lit hallway with glowing directories that links the Foyer to Room 7-12.',
    position: new THREE.Vector3(0, 0.05, 0),
    size: { width: 8, depth: 3.5 },
    color: 0x0B2545,
    lightColor: 0x4cc9f0,
    connections: ['foyer', 'room712']
  },
  room712: {
    id: 'room712',
    name: 'Room 7-12 (Lab)',
    desc: 'A state-of-the-art computer science laboratory and workspace. Fully equipped with workbenches, servers, and interactive screens.',
    position: new THREE.Vector3(7, 0.05, 0),
    size: { width: 6, depth: 6 },
    color: 0x134074,
    lightColor: 0x00f5d4,
    connections: ['corridor']
  }
};

// --- Scene Initialization ---
const canvas = document.querySelector('#webgl');
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x07162c);
scene.fog = new THREE.FogExp2(0x07162c, 0.02);

// Sizes
const sizes = {
  width: window.innerWidth,
  height: window.innerHeight
};

// Camera
const camera = new THREE.PerspectiveCamera(60, sizes.width / sizes.height, 0.1, 100);
scene.add(camera);

// Renderer
const renderer = new THREE.WebGLRenderer({
  canvas: canvas,
  antialias: true,
  alpha: false,
  powerPreference: "high-performance"
});
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

// Orbit Controls (Overview Mode)
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;
controls.maxPolarAngle = Math.PI / 2 - 0.05; // Don't go below floor
controls.minDistance = 5;
controls.maxDistance = 28;

// --- Lighting ---
const ambientLight = new THREE.AmbientLight(0x133B68, 0.6);
scene.add(ambientLight);

const dirLight = new THREE.DirectionalLight(0x8DA9C4, 0.8);
dirLight.position.set(10, 20, 10);
dirLight.castShadow = true;
dirLight.shadow.mapSize.width = 1024;
dirLight.shadow.mapSize.height = 1024;
dirLight.shadow.bias = -0.001;
scene.add(dirLight);

// Add warm/cool point lights for each room
const roomLights = {};
Object.values(roomsData).forEach(room => {
  const light = new THREE.PointLight(room.lightColor, 1.5, 10);
  light.position.copy(room.position).y = 2.5;
  light.castShadow = true;
  light.shadow.bias = -0.002;
  scene.add(light);
  roomLights[room.id] = light;
  
  // Light helper sphere representing bulb
  const bulbGeo = new THREE.SphereGeometry(0.12, 16, 16);
  const bulbMat = new THREE.MeshBasicMaterial({ color: room.lightColor });
  const bulb = new THREE.Mesh(bulbGeo, bulbMat);
  bulb.position.copy(light.position);
  scene.add(bulb);
});

// --- Create Floor & Walls (Architectural Model) ---
const floorGroup = new THREE.Group();
const wallsGroup = new THREE.Group();
const propsGroup = new THREE.Group();
scene.add(floorGroup);
scene.add(wallsGroup);
scene.add(propsGroup);

// Main Grid Floor
const gridHelper = new THREE.GridHelper(50, 50, 0x134074, 0x133B68);
gridHelper.position.y = 0.01;
scene.add(gridHelper);

const mainFloorGeo = new THREE.PlaneGeometry(80, 80);
const mainFloorMat = new THREE.MeshStandardMaterial({
  color: 0x050f1d,
  roughness: 0.8,
  metalness: 0.2
});
const mainFloor = new THREE.Mesh(mainFloorGeo, mainFloorMat);
mainFloor.rotation.x = -Math.PI / 2;
mainFloor.receiveShadow = true;
scene.add(mainFloor);

// Build individual room floors
const roomFloors = {};
Object.values(roomsData).forEach(room => {
  const floorGeo = new THREE.BoxGeometry(room.size.width, 0.1, room.size.depth);
  const floorMat = new THREE.MeshStandardMaterial({
    color: room.color,
    roughness: 0.4,
    metalness: 0.1,
    transparent: true,
    opacity: 0.85
  });
  const floorMesh = new THREE.Mesh(floorGeo, floorMat);
  floorMesh.position.copy(room.position);
  floorMesh.position.y = 0.05;
  floorMesh.receiveShadow = true;
  floorMesh.userData = { isRoomFloor: true, roomId: room.id };
  floorGroup.add(floorMesh);
  roomFloors[room.id] = floorMesh;

  // Add a nice thin neon outline border for high-end look
  const edges = new THREE.EdgesGeometry(floorGeo);
  const lineMat = new THREE.LineBasicMaterial({ color: room.lightColor, linewidth: 2 });
  const wireframe = new THREE.LineSegments(edges, lineMat);
  wireframe.position.copy(floorMesh.position);
  scene.add(wireframe);
});

// Create Room Walls programmatically (with Doorways)
const wallMaterial = new THREE.MeshStandardMaterial({
  color: 0x0f2038,
  roughness: 0.6,
  metalness: 0.1
});

function createWall(x, z, w, d, h = 2.8) {
  const wallGeo = new THREE.BoxGeometry(w, h, d);
  const wall = new THREE.Mesh(wallGeo, wallMaterial);
  wall.position.set(x, h / 2 + 0.1, z);
  wall.castShadow = true;
  wall.receiveShadow = true;
  wallsGroup.add(wall);
  return wall;
}

// Foyer walls (Left, Top, Bottom)
createWall(-10, 0, 0.2, 6);   // Left wall
createWall(-7, 3, 6, 0.2);    // Top wall
createWall(-7, -3, 6, 0.2);   // Bottom wall
createWall(-4, 2, 0.2, 2);    // Right wall (partial)
createWall(-4, -2, 0.2, 2);   // Right wall (partial) - leaves door in center

// Corridor walls
createWall(0, 1.75, 8, 0.2);  // Top wall
createWall(0, -1.75, 8, 0.2); // Bottom wall

// Room 7-12 walls (Right, Top, Bottom)
createWall(10, 0, 0.2, 6);    // Right wall
createWall(7, 3, 6, 0.2);     // Top wall
createWall(7, -3, 6, 0.2);    // Bottom wall
createWall(4, 2, 0.2, 2);     // Left wall (partial)
createWall(4, -2, 0.2, 2);    // Left wall (partial) - leaves door in center

// --- Add Decorative Room Props ---
// Foyer - Reception Desk & Chair
const deskGeo = new THREE.BoxGeometry(1.5, 0.8, 0.8);
const deskMat = new THREE.MeshStandardMaterial({ color: 0x8da9c4, roughness: 0.3 });
const desk = new THREE.Mesh(deskGeo, deskMat);
desk.position.set(-8, 0.5, 0);
desk.castShadow = true;
propsGroup.add(desk);

const plantGeo = new THREE.CylinderGeometry(0.3, 0.2, 0.6);
const plant = new THREE.Mesh(plantGeo, deskMat);
plant.position.set(-5, 0.4, 2);
propsGroup.add(plant);

// Room 7-12 CS Lab - Workbench & Computer Monitors
for (let i = -1.5; i <= 1.5; i += 1.5) {
  // Benches
  const benchGeo = new THREE.BoxGeometry(0.8, 0.75, 2.5);
  const benchMat = new THREE.MeshStandardMaterial({ color: 0x133b68 });
  const bench = new THREE.Mesh(benchGeo, benchMat);
  bench.position.set(7 + i, 0.47, 0);
  bench.castShadow = true;
  propsGroup.add(bench);

  // Small computers
  const compGeo = new THREE.BoxGeometry(0.2, 0.3, 0.4);
  const compMat = new THREE.MeshBasicMaterial({ color: 0x00f5d4 });
  const comp = new THREE.Mesh(compGeo, compMat);
  comp.position.set(7 + i, 0.9, 0);
  propsGroup.add(comp);
}

// --- Text Canvas Labels for Overview Mode ---
function createRoomLabel(text, position) {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 128;
  const ctx = canvas.getContext('2d');
  
  // Background
  ctx.fillStyle = 'rgba(11, 37, 69, 0.8)';
  ctx.roundRect(10, 10, 236, 108, 15);
  ctx.fill();
  ctx.strokeStyle = '#8DA9C4';
  ctx.lineWidth = 3;
  ctx.stroke();
  
  // Text
  ctx.font = 'bold 24px Outfit';
  ctx.fillStyle = '#ffffff';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, 128, 64);
  
  const texture = new THREE.CanvasTexture(canvas);
  const spriteMat = new THREE.SpriteMaterial({ map: texture, transparent: true });
  const sprite = new THREE.Sprite(spriteMat);
  sprite.position.copy(position);
  sprite.position.y = 3.5;
  sprite.scale.set(3, 1.5, 1);
  return sprite;
}

const labelsGroup = new THREE.Group();
scene.add(labelsGroup);
Object.values(roomsData).forEach(room => {
  const label = createRoomLabel(room.name, room.position);
  labelsGroup.add(label);
});

// --- 3D Navigation Arrows (Walk Mode Portal/Indicators) ---
const arrowsGroup = new THREE.Group();
scene.add(arrowsGroup);

function spawnNavArrows(roomId) {
  // Clear previous arrows
  while(arrowsGroup.children.length > 0) {
    const obj = arrowsGroup.children[0];
    arrowsGroup.remove(obj);
  }

  const room = roomsData[roomId];
  if (!room) return;

  room.connections.forEach(targetId => {
    const targetRoom = roomsData[targetId];
    if (!targetRoom) return;

    // Direction vector from current room to target room
    const dir = new THREE.Vector3().subVectors(targetRoom.position, room.position).normalize();
    
    // Position arrow in front of camera
    const arrowPos = new THREE.Vector3().copy(room.position);
    arrowPos.y = 0.5; // ground height
    arrowPos.addScaledVector(dir, 1.8); // offset towards door

    // Create 3D Arrow Mesh (Cone pointing in direction)
    const arrowGeo = new THREE.ConeGeometry(0.2, 0.5, 16);
    // Rotate cone to point horizontally in direction
    arrowGeo.rotateX(Math.PI / 2);
    
    const arrowMat = new THREE.MeshStandardMaterial({
      color: 0x8DA9C4,
      emissive: 0x134074,
      emissiveIntensity: 1,
      transparent: true,
      opacity: 0.8
    });
    
    const arrowMesh = new THREE.Mesh(arrowGeo, arrowMat);
    arrowMesh.position.copy(arrowPos);
    arrowMesh.lookAt(targetRoom.position.x, 0.5, targetRoom.position.z);
    arrowMesh.userData = { isNavArrow: true, targetRoomId: targetId };
    
    // Animate arrow floating/glowing
    arrowMesh.name = "navArrow";
    
    arrowsGroup.add(arrowMesh);
  });
}

// --- App State Management ---
let appMode = 'overview'; // 'overview' or 'walk'
let activeRoomId = null;
let targetCameraPos = new THREE.Vector3();
let targetCameraLookAt = new THREE.Vector3();
let currentCameraLookAt = new THREE.Vector3();
let isTransitioning = false;

// Look-Around Rotations (Walk Mode)
let yaw = 0;
let pitch = 0;
let targetYaw = 0;
let targetPitch = 0;
const lookSpeed = 0.003;

function setOverviewMode() {
  appMode = 'overview';
  activeRoomId = null;
  isTransitioning = true;
  
  controls.enabled = true;
  labelsGroup.visible = true;
  arrowsGroup.visible = false;
  
  // Animate camera to overview position
  targetCameraPos.set(0, 10, 11);
  targetCameraLookAt.set(0, 0, 0);

  // Update UI DOM
  document.querySelector('#btn-overview').classList.add('active');
  document.querySelector('#btn-walk').classList.remove('active');
  document.querySelector('#walk-hud').classList.add('hidden');
  document.querySelector('#current-room-badge').textContent = "Overview Mode";
  document.querySelector('#room-card').classList.add('hidden');
}

function setWalkMode(roomId) {
  appMode = 'walk';
  activeRoomId = roomId;
  isTransitioning = true;
  
  controls.enabled = false;
  labelsGroup.visible = false;
  arrowsGroup.visible = true;

  const room = roomsData[roomId];
  targetCameraPos.copy(room.position);
  targetCameraPos.y = 1.6; // Human eye height
  
  // Look slightly forward into room
  if (roomId === 'foyer') {
    targetYaw = 0; // look East/right
  } else if (roomId === 'room712') {
    targetYaw = Math.PI; // look West/left
  } else {
    targetYaw = 0;
  }
  targetPitch = 0;
  yaw = targetYaw;
  pitch = targetPitch;

  // Set initial target lookAt based on initial yaw
  const dir = new THREE.Vector3(Math.cos(yaw), 0, Math.sin(yaw));
  targetCameraLookAt.copy(targetCameraPos).add(dir);

  spawnNavArrows(roomId);

  // Update UI DOM
  document.querySelector('#btn-overview').classList.remove('active');
  document.querySelector('#btn-walk').classList.add('active');
  document.querySelector('#walk-hud').classList.remove('hidden');
  document.querySelector('#current-room-badge').textContent = `Walk Mode: ${room.name}`;
  
  // Set up Room Card UI
  document.querySelector('#room-title').textContent = room.name;
  document.querySelector('#room-desc').textContent = room.desc;
  document.querySelector('#room-card').classList.remove('hidden');
  document.querySelector('#btn-enter-room').classList.add('hidden'); // hidden inside room

  // Update HUD back button logic
  const backBtn = document.querySelector('#hud-go-back');
  if (roomId === 'corridor') {
    backBtn.textContent = "Go to Foyer";
    backBtn.onclick = () => transitionToRoom('foyer');
  } else {
    backBtn.textContent = "Exit to Corridor";
    backBtn.onclick = () => transitionToRoom('corridor');
  }
}

function transitionToRoom(roomId) {
  setWalkMode(roomId);
}

// Smoothly interpolate camera position and lookAt target
function updateCameraTransition(delta) {
  if (!isTransitioning) return;

  const lerpSpeed = 0.08; // smooth interpolation speed
  camera.position.lerp(targetCameraPos, lerpSpeed);
  currentCameraLookAt.lerp(targetCameraLookAt, lerpSpeed);
  camera.lookAt(currentCameraLookAt);

  // Check if close enough to terminate transition
  if (camera.position.distanceTo(targetCameraPos) < 0.05 && currentCameraLookAt.distanceTo(targetCameraLookAt) < 0.05) {
    isTransitioning = false;
    if (appMode === 'overview') {
      controls.target.copy(currentCameraLookAt);
    }
  }
}

// --- Interaction Handling (Raycaster & Pointers) ---
const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();
let hoveredRoomId = null;

// Track pointer coordinates
function onPointerMove(event) {
  pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
  pointer.y = -(event.clientY / window.innerHeight) * 2 + 1;

  // Handle Drag-to-Look in Walk Mode
  if (appMode === 'walk' && isPointerDown && !isTransitioning) {
    const deltaX = event.clientX - prevPointerPos.x;
    const deltaY = event.clientY - prevPointerPos.y;
    
    targetYaw -= deltaX * lookSpeed;
    targetPitch -= deltaY * lookSpeed;
    
    // Clamp vertical looking pitch
    targetPitch = Math.max(-Math.PI / 4, Math.min(Math.PI / 4, targetPitch));
    
    prevPointerPos.set(event.clientX, event.clientY);
  }
}

// Touch/Mouse dragging trackers
let isPointerDown = false;
const prevPointerPos = new THREE.Vector2();

function onPointerDown(event) {
  isPointerDown = true;
  prevPointerPos.set(event.clientX, event.clientY);
}

function onPointerUp(event) {
  isPointerDown = false;
  
  // Handle raycast click logic on mouse/tap up (to avoid click during drag)
  if (event.clientX && prevPointerPos.distanceTo(new THREE.Vector2(event.clientX, event.clientY)) > 10) {
    return; // Dragging, not clicking
  }

  raycaster.setFromCamera(pointer, camera);

  if (appMode === 'overview') {
    // Check click room floors
    const intersects = raycaster.intersectObjects(floorGroup.children);
    if (intersects.length > 0) {
      const roomMesh = intersects.find(intersect => intersect.object.userData.isRoomFloor);
      if (roomMesh) {
        const roomId = roomMesh.object.userData.roomId;
        const room = roomsData[roomId];
        
        // Open Room details card
        document.querySelector('#room-title').textContent = room.name;
        document.querySelector('#room-desc').textContent = room.desc;
        document.querySelector('#room-card').classList.remove('hidden');
        
        const enterBtn = document.querySelector('#btn-enter-room');
        enterBtn.classList.remove('hidden');
        enterBtn.onclick = () => transitionToRoom(roomId);
        
        // Highlight room
        highlightRoom(roomId);
      }
    } else {
      // Clicked outside, hide card
      document.querySelector('#room-card').classList.add('hidden');
      resetRoomHighlights();
    }
  } else if (appMode === 'walk' && !isTransitioning) {
    // Check clicking 3D navigation arrows
    const intersects = raycaster.intersectObjects(arrowsGroup.children);
    if (intersects.length > 0) {
      const arrowMesh = intersects.find(intersect => intersect.object.userData.isNavArrow);
      if (arrowMesh) {
        const targetId = arrowMesh.object.userData.targetRoomId;
        transitionToRoom(targetId);
      }
    }
  }
}

// Highlight rooms on hover/click in Overview mode
function highlightRoom(roomId) {
  resetRoomHighlights();
  const floorMesh = roomFloors[roomId];
  if (floorMesh) {
    floorMesh.material.opacity = 1.0;
    floorMesh.scale.set(1.02, 1.0, 1.02);
  }
}

function resetRoomHighlights() {
  Object.keys(roomFloors).forEach(id => {
    const mesh = roomFloors[id];
    mesh.material.opacity = 0.85;
    mesh.scale.set(1.0, 1.0, 1.0);
  });
}

function onTouchStart(event) {
  if (event.touches.length === 1) {
    isPointerDown = true;
    prevPointerPos.set(event.touches[0].clientX, event.touches[0].clientY);
    
    // Update pointer coordinates for raycasting on tap
    pointer.x = (event.touches[0].clientX / window.innerWidth) * 2 - 1;
    pointer.y = -(event.touches[0].clientY / window.innerHeight) * 2 + 1;
  }
}

function onTouchMove(event) {
  if (event.touches.length === 1 && isPointerDown && appMode === 'walk' && !isTransitioning) {
    const touch = event.touches[0];
    const deltaX = touch.clientX - prevPointerPos.x;
    const deltaY = touch.clientY - prevPointerPos.y;
    
    targetYaw -= deltaX * lookSpeed;
    targetPitch -= deltaY * lookSpeed;
    targetPitch = Math.max(-Math.PI / 4, Math.min(Math.PI / 4, targetPitch));
    
    prevPointerPos.set(touch.clientX, touch.clientY);
  }
}

function onTouchEnd(event) {
  isPointerDown = false;
  // Fire click action on touch end
  onPointerUp(event);
}

// --- Attach Event Listeners ---
window.addEventListener('resize', () => {
  sizes.width = window.innerWidth;
  sizes.height = window.innerHeight;

  camera.aspect = sizes.width / sizes.height;
  camera.updateProjectionMatrix();

  renderer.setSize(sizes.width, sizes.height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});

window.addEventListener('pointermove', onPointerMove);
window.addEventListener('mousedown', onPointerDown);
window.addEventListener('mouseup', onPointerUp);

// Mobile Touch Events (Explicit support for Capacitor Android)
window.addEventListener('touchstart', onTouchStart, { passive: true });
window.addEventListener('touchmove', onTouchMove, { passive: true });
window.addEventListener('touchend', onTouchEnd, { passive: true });

// UI Button handlers
document.querySelector('#btn-overview').addEventListener('click', setOverviewMode);
document.querySelector('#btn-walk').addEventListener('click', () => transitionToRoom('foyer'));

// --- Animation Loop ---
const clock = new THREE.Clock();

function tick() {
  const elapsedTime = clock.getElapsedTime();
  const delta = clock.getDelta();

  // 1. Overview Damping
  if (appMode === 'overview') {
    controls.update();
  }

  // 2. First-Person Walk Look-Around rotation mapping
  if (appMode === 'walk' && !isTransitioning) {
    // Lerp looking angles for silky inertia feel
    yaw += (targetYaw - yaw) * 0.15;
    pitch += (targetPitch - pitch) * 0.15;
    
    const direction = new THREE.Vector3(
      Math.cos(pitch) * Math.cos(yaw),
      Math.sin(pitch),
      Math.cos(pitch) * Math.sin(yaw)
    );
    
    targetCameraLookAt.copy(camera.position).add(direction);
    camera.lookAt(targetCameraLookAt);
  }

  // 3. Update Camera transitions
  updateCameraTransition(delta);

  // 4. Animate floating/glowing 3D navigation portals/arrows
  arrowsGroup.children.forEach((arrow) => {
    if (arrow.name === "navArrow") {
      // Float up and down
      arrow.position.y = 0.5 + Math.sin(elapsedTime * 3) * 0.08;
      // Self-rotate slightly
      arrow.rotation.z = elapsedTime * 1.5;
    }
  });

  // 5. Render Scene
  renderer.render(scene, camera);

  window.requestAnimationFrame(tick);
}

// Initial position
setOverviewMode();
camera.position.set(0, 10, 11);
currentCameraLookAt.set(0, 0, 0);
camera.lookAt(currentCameraLookAt);

// Remove Loader screen once resources are loaded/rendered
setTimeout(() => {
  const loader = document.getElementById('loader');
  if (loader) {
    loader.classList.add('fade-out');
  }
}, 800);

tick();

// --- PWA Service Worker Registration ---
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then(reg => console.log('Service Worker registered successfully!', reg.scope))
      .catch(err => console.error('Service Worker registration failed:', err));
  });
}
