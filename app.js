import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";

const MATERIALS = [
  { id: "oak", name: "Carvalho claro", type: "floor", image: "textures/oak.webp", color: "#d6aa73", roughness: 0.7, repeat: [2.5, 2.5] },
  { id: "travertine", name: "Travertino", type: "floor", image: "textures/travertine.webp", color: "#d8cbb5", roughness: 0.85, repeat: [3, 3] },
  { id: "sand", name: "Areia acetinada", type: "floor", color: "#c7b69e", roughness: 0.92 },
  { id: "charcoal", name: "Pedra grafite", type: "floor", color: "#4f514f", roughness: 0.9 },
  { id: "limewash", name: "Cal mineral", type: "wall", image: "textures/limewash.webp", color: "#dedbd1", roughness: 1, repeat: [2, 1] },
  { id: "warmwhite", name: "Branco quente", type: "wall", color: "#ebe7dc", roughness: 0.95 },
  { id: "clay", name: "Argila", type: "wall", color: "#a9684d", roughness: 0.96 },
  { id: "sage", name: "Sálvia", type: "wall", color: "#778070", roughness: 0.96 }
];

const ROOMS = [
  { id: "balcony1", name: "Sacada", x: -5.0, z: 1.0, w: 2.0, d: 12.0, floor: "travertine" },
  { id: "service", name: "Serviço", x: -1.5, z: -5.0, w: 5.0, d: 2.0, floor: "travertine" },
  { id: "serviceBath", name: "Banho de serviço", x: 2.2, z: -5.0, w: 2.0, d: 2.0, floor: "travertine" },
  { id: "living", name: "Estar / Jantar", x: 1.0, z: -1.8, w: 10.0, d: 4.4, floor: "oak" },
  { id: "lavatory", name: "Lavatório", x: 7.0, z: -0.4, w: 2.0, d: 1.7, floor: "travertine" },
  { id: "bath3", name: "Banho Suíte 3", x: 7.0, z: 1.55, w: 2.0, d: 1.7, floor: "travertine" },
  { id: "closet", name: "Closet", x: 0.0, z: 2.0, w: 6.0, d: 1.3, floor: "oak" },
  { id: "hall", name: "Circulação", x: 4.0, z: 2.0, w: 2.0, d: 1.3, floor: "oak" },
  { id: "suite1", name: "Suíte 01", x: -2.0, z: 5.2, w: 5.0, d: 5.1, floor: "oak" },
  { id: "bath1", name: "Banho Suíte 1", x: 1.1, z: 5.2, w: 1.6, d: 5.1, floor: "travertine" },
  { id: "suite2", name: "Suíte 02", x: 3.4, z: 5.2, w: 2.8, d: 5.1, floor: "oak" },
  { id: "bath2", name: "Banho Suíte 2", x: 5.5, z: 5.2, w: 1.3, d: 5.1, floor: "travertine" },
  { id: "suite3", name: "Suíte 03", x: 7.4, z: 4.6, w: 2.8, d: 4.7, floor: "oak" },
  { id: "balcony2", name: "Sacada suíte", x: 7.4, z: 7.9, w: 2.8, d: 1.2, floor: "travertine" }
];

const WALLS = [
  ["Fachada oeste", -6, 1, 0.18, 12.2, false], ["Fachada norte", 0, -6.1, 12.2, 0.18, false],
  ["Fachada leste superior", 5.9, -3.7, 0.18, 4.8, false], ["Fachada leste", 8.5, 2.9, 0.18, 8.7, false],
  ["Fachada sul", 1.3, 8.55, 14.4, 0.18, false], ["Parede cozinha / serviço", -1.3, -3.95, 6.8, 0.14, true],
  ["Parede cozinha / sacada", -4.0, -1.8, 0.14, 4.4, true], ["Parede social / íntimo", 0.5, 0.48, 10.8, 0.14, true],
  ["Divisória closet", 0.4, 2.72, 7.5, 0.14, true], ["Divisória suíte 1", 0.35, 5.5, 0.14, 5.8, true],
  ["Divisória suíte 2", 4.85, 5.4, 0.14, 6.0, true], ["Divisória suíte 3", 6.0, 4.5, 0.14, 5.0, true],
  ["Banheiros sociais", 7.0, 0.55, 2.8, 0.14, true], ["Parede lavabo", 6.0, -0.6, 0.14, 2.2, true],
  ["Parede circulação", 4.0, 1.35, 0.14, 1.7, true], ["Banho suíte 1", 1.9, 5.2, 0.14, 4.9, true],
  ["Banho suíte 2", 5.5, 5.2, 0.14, 4.9, true], ["Parede serviço", 2.25, -5.0, 0.14, 2.0, true]
];

const canvas = document.querySelector("#scene");
const viewport = document.querySelector("#viewport");
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, preserveDrawingBuffer: true });
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.15;

const scene = new THREE.Scene();
scene.background = new THREE.Color(0xebe8e0);
scene.fog = new THREE.Fog(0xebe8e0, 24, 47);
const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 100);
camera.position.set(17, 20, 22);
const controls = new OrbitControls(camera, canvas);
controls.target.set(1, 0, 1.4);
controls.enableDamping = true;
controls.dampingFactor = 0.07;
controls.maxPolarAngle = Math.PI / 2.04;
controls.minDistance = 7;
controls.maxDistance = 42;

scene.add(new THREE.HemisphereLight(0xfff9ec, 0x657064, 2.25));
const sun = new THREE.DirectionalLight(0xfff3dc, 3.2);
sun.position.set(-8, 18, -9); sun.castShadow = true; sun.shadow.mapSize.set(2048, 2048);
sun.shadow.camera.left = -16; sun.shadow.camera.right = 16; sun.shadow.camera.top = 16; sun.shadow.camera.bottom = -16;
scene.add(sun);

const ground = new THREE.Mesh(new THREE.PlaneGeometry(60, 60), new THREE.MeshStandardMaterial({ color: 0xe3dfd6, roughness: 1 }));
ground.rotation.x = -Math.PI / 2; ground.position.y = -0.06; ground.receiveShadow = true; scene.add(ground);
const apartment = new THREE.Group(); apartment.rotation.y = -0.08; scene.add(apartment);

const textureLoader = new THREE.TextureLoader();
const textureCache = new Map();
for (const item of MATERIALS.filter(item => item.image)) {
  const texture = textureLoader.load(item.image);
  texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.repeat.set(...(item.repeat || [2, 2]));
  textureCache.set(item.id, texture);
}

function materialFor(id, surface = "floor") {
  const item = MATERIALS.find(material => material.id === id) || MATERIALS.find(material => material.type === surface);
  const options = { color: item.color, roughness: item.roughness, metalness: 0 };
  if (item.image && textureCache.has(item.id)) {
    options.map = textureCache.get(item.id);
    options.color = 0xffffff;
  }
  return new THREE.MeshStandardMaterial(options);
}

const floors = [];
for (const room of ROOMS) {
  const floor = new THREE.Mesh(new THREE.BoxGeometry(room.w - 0.05, 0.10, room.d - 0.05), materialFor(room.floor));
  floor.position.set(room.x, 0, room.z); floor.receiveShadow = true;
  floor.userData = { kind: "floor", id: room.id, name: room.name, materialId: room.floor };
  apartment.add(floor); floors.push(floor);
}

const walls = [];
WALLS.forEach(([name, x, z, w, d, removable], index) => {
  const wall = new THREE.Mesh(new THREE.BoxGeometry(w, 2.6, d), materialFor("warmwhite", "wall"));
  wall.position.set(x, 1.3, z); wall.castShadow = wall.receiveShadow = true;
  wall.userData = { kind: "wall", id: `wall-${index}`, name, removable, materialId: "warmwhite" };
  apartment.add(wall); walls.push(wall);
});

function addWindow(x, z, w, d) {
  const glass = new THREE.Mesh(new THREE.BoxGeometry(w, 1.65, d), new THREE.MeshPhysicalMaterial({ color: 0x9fc3ca, transparent: true, opacity: .28, roughness: .15, transmission: .45 }));
  glass.position.set(x, 1.3, z); apartment.add(glass);
}
addWindow(-5.93, 1.1, .08, 6.0); addWindow(-2.2, 8.48, 4.0, .08); addWindow(3.6, 8.48, 2.3, .08); addWindow(7.4, 8.48, 2.3, .08);

const furniture = [];
let furnitureCounter = 0;
function finishFurniture(group, type, name, restoring = false) {
  group.userData = { kind: "furniture", id: `furniture-${++furnitureCounter}`, type, name };
  group.traverse(child => { if (child.isMesh) { child.castShadow = true; child.receiveShadow = true; child.userData.parentFurniture = group; } });
  apartment.add(group); furniture.push(group);
  if (!restoring) selectObject(group);
  return group;
}

function makeFurniture(type, restoring = false) {
  const group = new THREE.Group();
  const fabric = new THREE.MeshStandardMaterial({ color: 0x9b7868, roughness: .88 });
  const wood = new THREE.MeshStandardMaterial({ color: 0x755947, roughness: .75 });
  const linen = new THREE.MeshStandardMaterial({ color: 0xd9d1c5, roughness: .94 });
  const part = (geometry, material, x, y, z) => { const mesh = new THREE.Mesh(geometry, material); mesh.position.set(x, y, z); group.add(mesh); return mesh; };
  if (type === "sofa") {
    part(new THREE.BoxGeometry(2.4, .45, .9), fabric, 0, .35, 0);
    part(new THREE.BoxGeometry(2.4, .8, .2), fabric, 0, .78, .38);
    part(new THREE.BoxGeometry(.18, .58, .9), fabric, -1.12, .52, 0); part(new THREE.BoxGeometry(.18, .58, .9), fabric, 1.12, .52, 0);
    group.position.set(0, .04, -1.3); return finishFurniture(group, type, "Sofá", restoring);
  }
  if (type === "table") {
    part(new THREE.CylinderGeometry(.9, .9, .12, 40), wood, 0, .78, 0);
    part(new THREE.CylinderGeometry(.14, .28, .75, 24), wood, 0, .38, 0);
    group.position.set(2.6, .04, -1.3); return finishFurniture(group, type, "Mesa de jantar", restoring);
  }
  if (type === "bed") {
    part(new THREE.BoxGeometry(2.0, .42, 2.2), linen, 0, .42, 0);
    part(new THREE.BoxGeometry(2.05, .95, .16), wood, 0, .68, .99);
    part(new THREE.BoxGeometry(.78, .16, .5), new THREE.MeshStandardMaterial({ color: 0xf3efe7, roughness: 1 }), -.48, .7, .62);
    part(new THREE.BoxGeometry(.78, .16, .5), new THREE.MeshStandardMaterial({ color: 0xf3efe7, roughness: 1 }), .48, .7, .62);
    group.position.set(-2, .04, 5.2); return finishFurniture(group, type, "Cama queen", restoring);
  }
  part(new THREE.CylinderGeometry(.55, .65, .5, 24), fabric, 0, .4, 0);
  part(new THREE.BoxGeometry(1.1, .9, .18), fabric, 0, .86, .38);
  group.position.set(-1.7, .04, -1.5); return finishFurniture(group, type, "Poltrona", restoring);
}
makeFurniture("sofa", true); makeFurniture("table", true); makeFurniture("bed", true); makeFurniture("chair", true);

const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();
const dragPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
const dragPoint = new THREE.Vector3();
let selected = floors.find(floor => floor.userData.id === "living");
let selectedSurface = "floor";
let dragging = null;
let dragOffset = new THREE.Vector3();
let pointerDown = null;
const history = [];

function updatePointer(event) {
  const rect = canvas.getBoundingClientRect();
  pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
  pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
  raycaster.setFromCamera(pointer, camera);
}

function selectableParent(object) {
  if (object.userData.parentFurniture) return object.userData.parentFurniture;
  return object;
}

function selectObject(object) {
  if (!object) return;
  selected = object;
  if (object.userData.kind === "floor" || object.userData.kind === "wall") {
    selectedSurface = object.userData.kind;
    document.querySelectorAll("#surfaceToggle button").forEach(button => button.classList.toggle("active", button.dataset.surface === selectedSurface));
    document.querySelector('[data-tab="materials"]').click();
  } else {
    document.querySelector('[data-tab="furniture"]').click();
  }
  document.querySelector("#selectionName").textContent = object.userData.name;
  document.querySelector("#roomLabel").textContent = object.userData.name.toUpperCase();
  renderMaterials();
}

canvas.addEventListener("pointerdown", event => {
  pointerDown = { x: event.clientX, y: event.clientY };
  updatePointer(event);
  const hit = raycaster.intersectObjects(furniture, true)[0];
  if (hit) {
    pushHistory();
    dragging = selectableParent(hit.object);
    if (raycaster.ray.intersectPlane(dragPlane, dragPoint)) dragOffset.copy(dragging.position).sub(dragPoint);
    controls.enabled = false; canvas.setPointerCapture(event.pointerId);
  }
});

canvas.addEventListener("pointermove", event => {
  if (!dragging) return;
  updatePointer(event);
  if (raycaster.ray.intersectPlane(dragPlane, dragPoint)) {
    dragging.position.x = THREE.MathUtils.clamp(dragPoint.x + dragOffset.x, -5.5, 8);
    dragging.position.z = THREE.MathUtils.clamp(dragPoint.z + dragOffset.z, -5.5, 8);
  }
});

canvas.addEventListener("pointerup", event => {
  if (dragging) { saveState(); selectObject(dragging); dragging = null; controls.enabled = true; return; }
  if (pointerDown && Math.hypot(event.clientX - pointerDown.x, event.clientY - pointerDown.y) < 5) {
    updatePointer(event);
    const candidates = selectedSurface === "wall" ? walls.filter(wall => wall.visible) : [...furniture, ...floors];
    const hit = raycaster.intersectObjects(candidates, true)[0];
    if (hit) selectObject(selectableParent(hit.object));
  }
});

function renderMaterials() {
  const list = document.querySelector("#materialList");
  list.innerHTML = "";
  MATERIALS.filter(item => item.type === selectedSurface).forEach(item => {
    const button = document.createElement("button"); button.className = "material";
    if (selected?.userData.materialId === item.id) button.classList.add("active");
    const background = item.image ? `url('${item.image}')` : item.color;
    button.innerHTML = `<span class="swatch" style="background:${background}"></span><strong>${item.name}</strong>`;
    button.addEventListener("click", () => applyMaterial(item)); list.append(button);
  });
  const hide = document.querySelector("#hideWallBtn");
  hide.style.display = selectedSurface === "wall" ? "block" : "none";
  hide.disabled = selected?.userData.kind !== "wall" || !selected.userData.removable;
  hide.textContent = hide.disabled ? "Selecione uma divisória" : "Remover parede selecionada";
}

function applyMaterial(item) {
  if (!selected || selected.userData.kind !== selectedSurface) return showToast(`Selecione um ${selectedSurface === "floor" ? "piso" : "parede"} primeiro`);
  pushHistory();
  selected.material.dispose(); selected.material = materialFor(item.id, item.type); selected.userData.materialId = item.id;
  saveState(); renderMaterials(); showToast(`${item.name} aplicado em ${selected.userData.name}`);
}

function serialize() {
  return {
    floors: Object.fromEntries(floors.map(item => [item.userData.id, item.userData.materialId])),
    walls: Object.fromEntries(walls.map(item => [item.userData.id, { visible: item.visible, material: item.userData.materialId }])),
    furniture: furniture.map(item => ({ type: item.userData.type, x: item.position.x, z: item.position.z, rotation: item.rotation.y }))
  };
}

function applyState(state) {
  if (!state) return;
  floors.forEach(item => { const id = state.floors?.[item.userData.id]; if (id) { item.material.dispose(); item.material = materialFor(id); item.userData.materialId = id; } });
  walls.forEach(item => { const value = state.walls?.[item.userData.id]; if (value) { item.visible = value.visible; item.material.dispose(); item.material = materialFor(value.material, "wall"); item.userData.materialId = value.material; } });
  furniture.splice(0).forEach(item => apartment.remove(item));
  (state.furniture || []).forEach(value => { const item = makeFurniture(value.type, true); item.position.x = value.x; item.position.z = value.z; item.rotation.y = value.rotation; });
  selectObject(floors.find(item => item.userData.id === "living"));
}
function pushHistory() { history.push(JSON.stringify(serialize())); if (history.length > 20) history.shift(); }
function saveState() { localStorage.setItem("miragio204-design", JSON.stringify(serialize())); }

document.querySelectorAll(".tab").forEach(tab => tab.addEventListener("click", () => {
  document.querySelectorAll(".tab").forEach(item => item.classList.toggle("active", item === tab));
  document.querySelectorAll(".panel").forEach(panel => panel.classList.remove("active"));
  document.querySelector(`#${tab.dataset.tab}Panel`).classList.add("active");
}));
document.querySelectorAll("#surfaceToggle button").forEach(button => button.addEventListener("click", () => {
  selectedSurface = button.dataset.surface;
  document.querySelectorAll("#surfaceToggle button").forEach(item => item.classList.toggle("active", item === button));
  renderMaterials(); showToast(`Clique em ${selectedSurface === "floor" ? "um ambiente" : "uma parede"} na maquete`);
}));
document.querySelectorAll("[data-furniture]").forEach(button => button.addEventListener("click", () => { pushHistory(); makeFurniture(button.dataset.furniture); saveState(); showToast("Móvel adicionado — arraste para posicionar"); }));
document.querySelector("#rotateBtn").addEventListener("click", () => { if (selected?.userData.kind !== "furniture") return showToast("Selecione um móvel"); pushHistory(); selected.rotation.y += Math.PI / 4; saveState(); });
document.querySelector("#deleteBtn").addEventListener("click", () => { if (selected?.userData.kind !== "furniture") return showToast("Selecione um móvel"); pushHistory(); apartment.remove(selected); furniture.splice(furniture.indexOf(selected), 1); selected = null; saveState(); showToast("Móvel removido"); });
document.querySelector("#hideWallBtn").addEventListener("click", () => { if (selected?.userData.kind !== "wall" || !selected.userData.removable) return; pushHistory(); selected.visible = false; saveState(); selectObject(floors.find(item => item.userData.id === "living")); showToast("Parede removida da visualização"); });
document.querySelector("#undoBtn").addEventListener("click", () => { const state = history.pop(); if (!state) return showToast("Nada para desfazer"); applyState(JSON.parse(state)); saveState(); showToast("Alteração desfeita"); });
document.querySelector("#resetBtn").addEventListener("click", () => { pushHistory(); localStorage.removeItem("miragio204-design"); location.reload(); });
document.querySelector("#captureBtn").addEventListener("click", () => { renderer.render(scene, camera); const link = document.createElement("a"); link.download = "miragio-204-estudo.png"; link.href = canvas.toDataURL("image/png"); link.click(); showToast("Imagem exportada"); });
document.querySelector("#mobilePanelBtn").addEventListener("click", () => document.querySelector(".sidebar").classList.toggle("open"));
document.querySelector("#mobileCloseBtn").addEventListener("click", () => document.querySelector(".sidebar").classList.remove("open"));

const views = {
  perspective: { position: [17, 20, 22], target: [1, 0, 1.4] },
  top: { position: [1, 28, 1.4], target: [1, 0, 1.4] },
  walk: { position: [0, 1.65, -1.8], target: [5, 1.45, -1.0] }
};
document.querySelectorAll("[data-view]").forEach(button => button.addEventListener("click", () => {
  const view = views[button.dataset.view]; camera.position.fromArray(view.position); controls.target.fromArray(view.target); controls.update();
  document.querySelectorAll("[data-view]").forEach(item => item.classList.toggle("active", item === button));
}));

function showToast(message) {
  const toast = document.querySelector("#toast"); toast.textContent = message; toast.classList.add("show");
  clearTimeout(showToast.timer); showToast.timer = setTimeout(() => toast.classList.remove("show"), 2200);
}

function resize() {
  const { clientWidth, clientHeight } = viewport;
  renderer.setSize(clientWidth, clientHeight, false); camera.aspect = clientWidth / clientHeight; camera.updateProjectionMatrix();
}
new ResizeObserver(resize).observe(viewport); resize();
try { const saved = localStorage.getItem("miragio204-design"); if (saved) applyState(JSON.parse(saved)); } catch { localStorage.removeItem("miragio204-design"); }
renderMaterials();
setTimeout(() => document.querySelector("#loading").classList.add("hidden"), 650);

function animate() { controls.update(); renderer.render(scene, camera); requestAnimationFrame(animate); }
animate();
