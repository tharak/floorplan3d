import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";

const MATERIALS = [];
const BASE_MATERIALS = {
  floor: { id: "base-floor", color: "#d7d1c5", roughness: .92 },
  wall: { id: "base-wall", color: "#ebe7dc", roughness: .95 }
};

const CATEGORY_LABELS = {
  "colecao-realce": "Coleção Realce",
  "cores": "Cores",
  "madeiras": "Madeiras",
  "madeiras-brasileiras": "Madeiras Brasileiras",
  "metais": "Metais",
  "pedras": "Pedras",
  "tecidos": "Tecidos"
};

try {
  const response = await fetch("textures/arauco/source-manifest.json");
  if (response.ok) {
    const catalog = await response.json();
    MATERIALS.push(...catalog.textures.map(item => ({
      id: `arauco-${item.filename.replace(/\.[^.]+$/, "")}`,
      name: item.name,
      type: "surface",
      brand: "ARAUCO",
      category: CATEGORY_LABELS[item.collection] || item.collection,
      finish: item.finish,
      image: `textures/arauco/${item.filename}`,
      color: "#ffffff",
      roughness: .82,
      repeat: [1, 1]
    })));
  }
} catch (error) {
  console.warn("ARAUCO texture catalog unavailable", error);
}

const CENTER_X = 7.0;
const CENTER_Z = 6.8;
const point = (x, z) => [x - CENTER_X, z - CENTER_Z];
const room = (id, name, coordinates) => ({ id, name, points: coordinates.map(([x, z]) => point(x, z)) });
const wall = (name, x1, z1, x2, z2, removable = false) => ({ name, a: point(x1, z1), b: point(x2, z2), removable });

// Geometry traced from sheet 1 of the supplied architectural PDF.
const ROOMS = [
  room("balcony1", "Sacada social", [[.55,.45],[2.95,.45],[2.95,7.30],[2.42,7.30],[2.42,12.35],[1.35,12.35]]),
  room("service", "Serviço", [[3.05,.45],[6.10,.45],[6.10,1.95],[3.85,1.95],[3.85,2.08],[3.05,2.08]]),
  room("serviceBath", "Banho de serviço", [[6.15,.45],[7.50,.45],[7.50,1.95],[6.15,1.95]]),
  room("living", "Cozinha gourmet · Estar / Jantar", [[3.05,2.05],[7.68,2.05],[7.68,3.45],[11.14,3.45],[11.14,7.27],[3.05,7.27]]),
  room("lavatory", "Lavatório", [[11.27,4.52],[13.48,4.52],[13.48,5.73],[11.27,5.73]]),
  room("bath3", "Banho Suíte 3", [[11.27,5.85],[13.48,5.85],[13.48,7.27],[11.27,7.27]]),
  room("closet", "Closet", [[2.43,7.43],[9.42,7.43],[9.42,8.86],[5.28,8.86],[5.28,9.02],[2.43,9.02]]),
  room("hall", "Circulação", [[9.47,7.43],[10.65,7.43],[10.65,9.92],[9.47,9.92]]),
  room("suite1", "Suíte 01", [[2.43,9.02],[5.24,9.02],[5.24,12.32],[2.43,12.32]]),
  room("bath1", "Banho Suíte 1", [[5.34,9.02],[6.65,9.02],[6.65,12.32],[5.34,12.32]]),
  room("suite2", "Suíte 02", [[6.73,9.02],[9.38,9.02],[9.38,12.32],[6.73,12.32]]),
  room("bath2", "Banho Suíte 2", [[9.48,9.94],[10.66,9.94],[10.66,12.32],[9.48,12.32]]),
  room("suite3", "Suíte 03", [[10.78,7.45],[13.48,7.45],[13.48,11.66],[10.78,11.66]]),
  room("balcony2", "Sacada Suíte 3", [[10.75,11.82],[13.48,11.82],[13.55,12.55],[10.82,12.55]])
];

const WALLS = [
  wall("Fachada serviço",3.00,.42,7.55,.42), wall("Fachada serviço",7.55,.42,7.55,1.96),
  wall("Serviço / sacada",3.00,.42,3.00,1.42), wall("Serviço / sacada",3.00,2.12,3.00,7.28),
  wall("Serviço / cozinha",3.82,1.98,6.05,1.98,true), wall("Banho de serviço",6.12,.42,6.12,1.08,true),
  wall("Banho de serviço",6.12,1.56,6.12,1.98,true), wall("Banho de serviço",6.12,1.98,7.72,1.98,true),
  wall("Entrada",7.72,1.98,7.72,2.60), wall("Entrada",7.72,3.12,7.72,3.48),
  wall("Fachada social",7.72,3.48,11.48,3.48), wall("Fachada social",12.18,3.48,12.28,3.48),
  wall("Hall de entrada",12.28,3.48,12.28,4.15), wall("Hall de entrada",12.28,4.48,13.50,4.48),
  wall("Fachada leste",13.50,4.48,13.50,12.42),
  wall("Lavatório",11.25,4.50,11.25,4.88,true), wall("Lavatório",11.25,5.40,11.25,5.75,true),
  wall("Lavatório",11.25,5.75,13.50,5.75,true), wall("Banho Suíte 3",11.25,5.83,11.25,7.28,true),
  wall("Banho Suíte 3",11.25,7.28,12.02,7.28,true), wall("Banho Suíte 3",12.60,7.28,13.50,7.28,true),
  wall("Área social / íntima",2.40,7.30,5.65,7.30,true), wall("Área social / íntima",6.18,7.30,9.45,7.30,true),
  wall("Circulação",9.45,7.30,9.45,7.98,true), wall("Circulação",9.45,8.52,9.45,8.88,true),
  wall("Circulação",9.45,8.88,10.15,8.88,true), wall("Circulação",10.58,8.88,10.68,8.88,true),
  wall("Suíte 03",10.68,7.38,10.68,8.12,true), wall("Suíte 03",10.68,8.62,10.68,9.92,true),
  wall("Suíte 03",10.68,9.92,10.68,11.78), wall("Suíte 03 / sacada",10.68,11.78,11.18,11.78),
  wall("Suíte 03 / sacada",11.78,11.78,13.50,11.78),
  wall("Closet",2.40,7.30,2.40,8.92,true), wall("Suíte 01",2.40,8.92,2.40,12.42),
  wall("Suíte 01 / banho",5.28,8.92,5.28,9.34,true), wall("Suíte 01 / banho",5.28,9.88,5.28,12.42,true),
  wall("Banho Suíte 1",5.28,8.92,5.82,8.92,true), wall("Banho Suíte 1",6.35,8.92,6.70,8.92,true),
  wall("Banho Suíte 1 / Suíte 02",6.70,8.92,6.70,12.42,true),
  wall("Suíte 02",6.70,8.92,9.40,8.92,true), wall("Suíte 02 / banho",9.40,8.92,9.40,9.55,true),
  wall("Suíte 02 / banho",9.40,10.05,9.40,12.42,true), wall("Banho Suíte 2",9.40,9.92,9.86,9.92,true),
  wall("Banho Suíte 2",10.40,9.92,10.68,9.92,true),
  wall("Fachada dormitórios",2.40,12.42,4.86,12.42), wall("Fachada dormitórios",5.38,12.42,7.18,12.42),
  wall("Fachada dormitórios",7.88,12.42,10.05,12.42), wall("Fachada dormitórios",10.55,12.42,10.75,12.42)
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
const camera = new THREE.PerspectiveCamera(34, 1, 0.1, 100);
camera.position.set(0, 26, .1);
const controls = new OrbitControls(camera, canvas);
controls.target.set(0, 0, .1);
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
const apartment = new THREE.Group(); scene.add(apartment);

const textureLoader = new THREE.TextureLoader();
const textureCache = new Map();
function textureFor(item) {
  if (textureCache.has(item.id)) return textureCache.get(item.id);
  const texture = textureLoader.load(item.image);
  texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.repeat.set(...(item.repeat || [2, 2]));
  textureCache.set(item.id, texture);
  return texture;
}
function materialFor(id, surface = "floor") {
  const item = MATERIALS.find(material => material.id === id) || BASE_MATERIALS[surface];
  const options = { color: item.color, roughness: item.roughness, metalness: 0 };
  if (item.image) {
    options.map = textureFor(item);
    options.color = 0xffffff;
  }
  return new THREE.MeshStandardMaterial(options);
}

const floors = [];
for (const room of ROOMS) {
  const shape = new THREE.Shape();
  room.points.forEach(([x, z], index) => index ? shape.lineTo(x, -z) : shape.moveTo(x, -z));
  shape.closePath();
  const geometry = new THREE.ShapeGeometry(shape);
  geometry.rotateX(-Math.PI / 2);
  const floor = new THREE.Mesh(geometry, materialFor("base-floor"));
  floor.position.y = .015; floor.receiveShadow = true;
  floor.userData = { kind: "floor", id: room.id, name: room.name, materialId: "base-floor" };
  apartment.add(floor); floors.push(floor);
}

const walls = [];
const WALL_BASE_HEIGHT = 1.26;
WALLS.forEach((segment, index) => {
  const [x1, z1] = segment.a; const [x2, z2] = segment.b;
  const length = Math.hypot(x2 - x1, z2 - z1);
  const wallMesh = new THREE.Mesh(new THREE.BoxGeometry(length, WALL_BASE_HEIGHT, .12), materialFor("base-wall", "wall"));
  wallMesh.position.set((x1 + x2) / 2, WALL_BASE_HEIGHT / 2, (z1 + z2) / 2);
  wallMesh.rotation.y = -Math.atan2(z2 - z1, x2 - x1);
  wallMesh.castShadow = wallMesh.receiveShadow = true;
  wallMesh.userData = { kind: "wall", id: `wall-${index}`, name: segment.name, removable: segment.removable, materialId: "base-wall" };
  apartment.add(wallMesh); walls.push(wallMesh);
});

function addWindow(name, x1, z1, x2, z2, fullHeight = false) {
  const [ax, az] = point(x1, z1); const [bx, bz] = point(x2, z2);
  const length = Math.hypot(bx - ax, bz - az);
  const height = fullHeight ? 1.45 : .82;
  const glass = new THREE.Mesh(new THREE.BoxGeometry(length, height, .035), new THREE.MeshPhysicalMaterial({ color: 0x8ebbc2, transparent: true, opacity: .34, roughness: .12, transmission: .62 }));
  glass.position.set((ax + bx) / 2, fullHeight ? .74 : 1.02, (az + bz) / 2);
  glass.rotation.y = -Math.atan2(bz - az, bx - ax); glass.userData.name = name; apartment.add(glass);
  const frameMaterial = new THREE.MeshStandardMaterial({ color: 0x4e5350, roughness: .65 });
  for (const offset of [-length / 2, length / 2]) {
    const frame = new THREE.Mesh(new THREE.BoxGeometry(.045, height + .08, .06), frameMaterial);
    frame.position.copy(glass.position); frame.rotation.copy(glass.rotation);
    frame.translateX(offset); apartment.add(frame);
  }
}
addWindow("Esquadria serviço",3.00,1.42,3.00,2.12,true);
addWindow("Janela Suíte 01",4.86,12.42,5.38,12.42);
addWindow("Janela Suíte 02",7.18,12.42,7.88,12.42);
addWindow("Janela Banho Suíte 2",10.05,12.42,10.55,12.42);
addWindow("Esquadria Suíte 03",11.18,11.78,11.78,11.78,true);
addWindow("Guarda-corpo sacada social",.55,.45,1.35,12.35,true);
addWindow("Guarda-corpo sacada suíte",10.82,12.55,13.55,12.55,true);

const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();
let selected = floors.find(floor => floor.userData.id === "living");
let pointerDown = null;
const history = [];

function updatePointer(event) {
  const rect = canvas.getBoundingClientRect();
  pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
  pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
  raycaster.setFromCamera(pointer, camera);
}

function selectObject(object, openPicker = true) {
  if (!object) return;
  selected = object;
  document.querySelector('[data-tab="materials"]').click();
  document.querySelector("#selectionName").textContent = object.userData.name;
  document.querySelector("#roomLabel").textContent = object.userData.name.toUpperCase();
  renderMaterials();
  if (openPicker && matchMedia("(max-width: 760px)").matches) setMobilePanel(true);
}

canvas.addEventListener("pointerdown", event => {
  pointerDown = { x: event.clientX, y: event.clientY };
});

canvas.addEventListener("pointerup", event => {
  if (pointerDown && Math.hypot(event.clientX - pointerDown.x, event.clientY - pointerDown.y) < 5) {
    updatePointer(event);
    const candidates = [...walls.filter(wall => wall.visible), ...floors];
    const hit = raycaster.intersectObjects(candidates, true)[0];
    if (hit) selectObject(hit.object);
  }
});

function renderMaterials() {
  const list = document.querySelector("#materialList");
  list.innerHTML = "";
  const search = document.querySelector("#materialSearch");
  const query = search.value.trim().toLocaleLowerCase("pt-BR");
  const available = MATERIALS.filter(item => !query || `${item.name} ${item.brand} ${item.category} ${item.finish}`.toLocaleLowerCase("pt-BR").includes(query));
  const brands = groupBy(available, item => item.brand || "Outros");
  for (const [brand, brandItems] of brands) {
    const section = document.createElement("section"); section.className = "brand-group";
    section.innerHTML = `<div class="brand-heading"><strong>${brand}</strong><small>${brandItems.length} padrões</small></div>`;
    const categories = groupBy(brandItems, item => item.category || "Outros");
    for (const [category, categoryItems] of categories) {
      const details = document.createElement("details"); details.className = "category-group";
      details.open = Boolean(query);
      details.innerHTML = `<summary><span>${category}</span><small>${categoryItems.length}</small></summary><div class="materials-grid"></div>`;
      const grid = details.querySelector(".materials-grid");
      categoryItems.forEach(item => {
        const button = document.createElement("button"); button.className = "material";
        if (selected?.userData.materialId === item.id) button.classList.add("active");
        const swatch = item.image
          ? `<img class="swatch" src="${item.image}" alt="" loading="lazy" decoding="async">`
          : `<span class="swatch" style="background:${item.color}"></span>`;
        button.innerHTML = `${swatch}<strong>${item.name}</strong><small>${item.finish}</small>`;
        button.addEventListener("click", () => applyMaterial(item)); grid.append(button);
      });
      section.append(details);
    }
    list.append(section);
  }
  const hide = document.querySelector("#hideWallBtn");
  hide.style.display = selected?.userData.kind === "wall" ? "block" : "none";
  hide.disabled = selected?.userData.kind !== "wall" || !selected.userData.removable;
  hide.textContent = hide.disabled ? "Selecione uma divisória" : "Remover parede selecionada";
}

function applyMaterial(item) {
  if (!selected || !["floor", "wall"].includes(selected.userData.kind)) return showToast("Selecione um piso ou parede primeiro");
  pushHistory();
  selected.material.dispose(); selected.material = materialFor(item.id, selected.userData.kind); selected.userData.materialId = item.id;
  saveState(); renderMaterials(); showToast(`${item.name} aplicado em ${selected.userData.name}`);
}

function groupBy(items, keyFor) {
  const groups = new Map();
  for (const item of items) {
    const key = keyFor(item);
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(item);
  }
  return groups;
}

function serialize() {
  return {
    floors: Object.fromEntries(floors.map(item => [item.userData.id, item.userData.materialId])),
    walls: Object.fromEntries(walls.map(item => [item.userData.id, { visible: item.visible, material: item.userData.materialId }]))
  };
}

function applyState(state) {
  if (!state) return;
  floors.forEach(item => {
    const savedId = state.floors?.[item.userData.id];
    const id = MATERIALS.some(material => material.id === savedId) ? savedId : "base-floor";
    item.material.dispose(); item.material = materialFor(id); item.userData.materialId = id;
  });
  walls.forEach(item => {
    const value = state.walls?.[item.userData.id];
    if (!value) return;
    const id = MATERIALS.some(material => material.id === value.material) ? value.material : "base-wall";
    item.visible = value.visible; item.material.dispose(); item.material = materialFor(id, "wall"); item.userData.materialId = id;
  });
  selectObject(floors.find(item => item.userData.id === "living"), false);
}
function pushHistory() { history.push(JSON.stringify(serialize())); if (history.length > 20) history.shift(); }
function saveState() { localStorage.setItem("miragio204-design", JSON.stringify(serialize())); }

document.querySelectorAll(".tab").forEach(tab => tab.addEventListener("click", () => {
  document.querySelectorAll(".tab").forEach(item => item.classList.toggle("active", item === tab));
  document.querySelectorAll(".panel").forEach(panel => panel.classList.remove("active"));
  document.querySelector(`#${tab.dataset.tab}Panel`).classList.add("active");
}));
document.querySelector("#materialSearch").addEventListener("input", renderMaterials);
document.querySelector("#hideWallBtn").addEventListener("click", () => { if (selected?.userData.kind !== "wall" || !selected.userData.removable) return; pushHistory(); selected.visible = false; saveState(); selectObject(floors.find(item => item.userData.id === "living")); showToast("Parede removida da visualização"); });
document.querySelector("#undoBtn").addEventListener("click", () => { const state = history.pop(); if (!state) return showToast("Nada para desfazer"); applyState(JSON.parse(state)); saveState(); showToast("Alteração desfeita"); });
document.querySelector("#resetBtn").addEventListener("click", () => { pushHistory(); localStorage.removeItem("miragio204-design"); location.reload(); });
document.querySelector("#captureBtn").addEventListener("click", () => { renderer.render(scene, camera); const link = document.createElement("a"); link.download = "miragio-204-estudo.png"; link.href = canvas.toDataURL("image/png"); link.click(); showToast("Imagem exportada"); });
const sidebar = document.querySelector(".sidebar");
const mobilePanelButton = document.querySelector("#mobilePanelBtn");
function setMobilePanel(open) {
  sidebar.classList.toggle("open", open);
  mobilePanelButton.setAttribute("aria-expanded", String(open));
}
mobilePanelButton.addEventListener("click", () => setMobilePanel(!sidebar.classList.contains("open")));
document.querySelector("#mobileCloseBtn").addEventListener("click", () => setMobilePanel(false));

const views = {
  top: { position: [0, 26, .1], target: [0, 0, .1], wallHeight: .38 },
  cameraReset: { position: [12.5, 15.5, 17.5], target: [0, 0, .2], wallHeight: WALL_BASE_HEIGHT }
};
function applyView(viewName, activeButton = null) {
  const view = views[viewName];
  controls.enabled = false;
  camera.up.set(0, 1, 0);
  camera.position.fromArray(view.position);
  controls.target.fromArray(view.target);
  walls.forEach(item => { item.scale.y = view.wallHeight / WALL_BASE_HEIGHT; item.position.y = view.wallHeight / 2; });
  controls.maxPolarAngle = Math.PI / 2.04;
  camera.lookAt(controls.target);
  camera.updateProjectionMatrix();
  controls.update();
  controls.enabled = true;
  if (activeButton) document.querySelectorAll("[data-view]").forEach(item => item.classList.toggle("active", item === activeButton));
}
let wallsShown = false;
const showWallsButton = document.querySelector("#showWallsBtn");
const plantaButton = document.querySelector('[data-view="top"]');
function setWallsShown(show) {
  wallsShown = show;
  applyView(show ? "cameraReset" : "top", plantaButton);
  showWallsButton.classList.toggle("active", show);
  showWallsButton.setAttribute("aria-pressed", String(show));
  showToast(show ? "Walls shown" : "Walls hidden");
}
plantaButton.addEventListener("click", () => setWallsShown(false));
showWallsButton.addEventListener("click", () => setWallsShown(!wallsShown));
applyView("top", document.querySelector('[data-view="top"]'));

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
