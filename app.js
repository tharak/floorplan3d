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

// Geometry retraced against the architectural sheet crop (the PDF remains the dimensional source of truth).
const ROOMS = [
  room("balcony1", "Sacada social", [[.55,.47],[3.13,.47],[3.13,6.89],[2.58,6.89],[2.58,12.47],[1.35,12.47]]),
  room("service", "Serviço", [[3.13,.47],[6.12,.47],[6.12,1.94],[3.95,1.94],[3.95,2.05],[3.13,2.05]]),
  room("serviceBath", "Banho de serviço", [[6.12,.47],[7.72,.47],[7.72,1.94],[6.12,1.94]]),
  room("living", "Cozinha gourmet · Estar / Jantar", [[3.13,1.94],[7.72,1.94],[7.72,3.29],[8.58,3.29],[8.58,3.29],[12.15,3.29],[12.15,6.89],[3.13,6.89]]),
  room("lavatory", "Lavatório", [[11.05,4.31],[13.55,4.31],[13.55,5.21],[11.05,5.21]]),
  room("bath3", "Banho Suíte 3", [[11.05,5.21],[13.55,5.21],[13.55,6.89],[11.05,6.89]]),
  room("closet", "Closet", [[3.13,6.89],[9.48,6.89],[9.48,8.34],[5.40,8.34],[5.40,8.42],[3.13,8.42]]),
  room("hall", "Circulação", [[9.48,6.89],[10.75,6.89],[10.75,8.34],[9.48,8.34]]),
  room("suite1", "Suíte 01", [[3.13,8.34],[5.40,8.34],[5.40,11.52],[3.13,11.52]]),
  room("bath1", "Banho Suíte 1", [[5.40,8.34],[6.73,8.34],[6.73,11.52],[5.40,11.52]]),
  room("suite2", "Suíte 02", [[6.73,8.34],[9.48,8.34],[9.48,11.52],[6.73,11.52]]),
  room("bath2", "Banho Suíte 2", [[9.48,8.34],[10.75,8.34],[10.75,11.52],[9.48,11.52]]),
  room("suite3", "Suíte 03", [[10.75,6.89],[13.35,6.89],[13.35,10.88],[10.75,10.88]]),
  room("balcony2", "Sacada Suíte 3", [[10.75,10.88],[13.35,10.88],[13.55,12.47],[10.82,12.47]])
];

const WALLS = (() => {
  const segments = new Map();
  ROOMS.forEach(roomItem => roomItem.points.forEach((a, index) => {
    const b = roomItem.points[(index + 1) % roomItem.points.length];
    const key = [a, b].map(pointValue => pointValue.map(value => value.toFixed(4)).join(",")).sort().join("|");
    const existing = segments.get(key);
    if (existing) existing.names.push(roomItem.name);
    else segments.set(key, { a, b, names: [roomItem.name] });
  }));
  return [...segments.values()].map(segment => ({
    name: segment.names.join(" / "), a: segment.a, b: segment.b, removable: segment.names.length > 1
  }));
})();

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
function materialFor(id, surface = "floor", rotation = 0) {
  const item = MATERIALS.find(material => material.id === id) || BASE_MATERIALS[surface];
  const options = { color: item.color, roughness: item.roughness, metalness: 0 };
  if (item.image) {
    options.map = textureFor(item).clone();
    options.map.center.set(.5, .5);
    options.map.rotation = rotation;
    options.map.needsUpdate = true;
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
  floor.userData = { kind: "floor", id: room.id, name: room.name, materialId: "base-floor", textureRotation: 0 };
  apartment.add(floor); floors.push(floor);
}

const planOverlayTextures = {
  architecture: textureLoader.load("overlays/architecture.png"),
  electrical: textureLoader.load("overlays/electrical.png"),
  systems: textureLoader.load("overlays/ac-gas-risers.png")
};
Object.values(planOverlayTextures).forEach(texture => { texture.colorSpace = THREE.SRGBColorSpace; });
const planOverlayMaterial = new THREE.MeshBasicMaterial({ transparent: true, opacity: .72, depthWrite: false, side: THREE.DoubleSide });
const planOverlay = new THREE.Mesh(new THREE.PlaneGeometry(13, 12.13), planOverlayMaterial);
planOverlay.rotation.x = -Math.PI / 2;
planOverlay.position.set(.05, .075, -.315);
planOverlay.renderOrder = 4;
planOverlay.visible = false;
apartment.add(planOverlay);
let activePlanLayer = "architecture";

function setPlanLayer(layer) {
  activePlanLayer = layer;
  planOverlay.visible = true;
  planOverlayMaterial.map = planOverlayTextures[layer] || null;
  planOverlayMaterial.opacity = layer === "architecture" ? .32 : .72;
  planOverlayMaterial.needsUpdate = true;
  document.querySelectorAll("[data-plan-layer]").forEach(button => {
    const active = button.dataset.planLayer === layer;
    button.classList.toggle("active", active);
    button.setAttribute("aria-pressed", String(active));
  });
}
setPlanLayer("architecture");

const walls = [];
const WALL_BASE_HEIGHT = 1.26;
WALLS.forEach((segment, index) => {
  const [x1, z1] = segment.a; const [x2, z2] = segment.b;
  const length = Math.hypot(x2 - x1, z2 - z1);
  const wallMesh = new THREE.Mesh(new THREE.BoxGeometry(length, WALL_BASE_HEIGHT, .12), materialFor("base-wall", "wall"));
  wallMesh.position.set((x1 + x2) / 2, WALL_BASE_HEIGHT / 2, (z1 + z2) / 2);
  wallMesh.rotation.y = -Math.atan2(z2 - z1, x2 - x1);
  wallMesh.castShadow = wallMesh.receiveShadow = true;
  wallMesh.userData = { kind: "wall", id: `wall-${index}`, name: segment.name, removable: segment.removable, materialId: "base-wall", textureRotation: 0 };
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

const APPLIANCE_TYPES = {
  fridge: { name: "Geladeira", size: [.78, 1.35, .72], color: 0xbfc5c4 },
  stove: { name: "Fogão", size: [.72, .82, .65], color: 0x444846 },
  oven: { name: "Forno", size: [.62, .68, .58], color: 0x777c79 },
  microwave: { name: "Micro-ondas", size: [.58, .35, .42], color: 0x8c918e },
  dishwasher: { name: "Lava-louças", size: [.62, .82, .62], color: 0xd2d5d2 },
  washer: { name: "Lava e seca", size: [.68, .88, .68], color: 0xe1e3df },
  hood: { name: "Coifa", size: [.78, .35, .45], color: 0x9ca19e },
  ac: { name: "Ar-condicionado", size: [1.0, .3, .3], color: 0xe7e8e3 }
};
const appliances = [];
let applianceCounter = 0;

function makeAppliance(type, position, restoring = false) {
  const definition = APPLIANCE_TYPES[type];
  if (!definition) return null;
  const [width, height, depth] = definition.size;
  const group = new THREE.Group();
  const body = new THREE.Mesh(
    new THREE.BoxGeometry(width, height, depth),
    new THREE.MeshStandardMaterial({ color: definition.color, roughness: .62, metalness: .08 })
  );
  body.position.y = height / 2;
  body.castShadow = body.receiveShadow = true;
  body.userData.parentAppliance = group;
  group.add(body);
  const accent = new THREE.Mesh(
    new THREE.BoxGeometry(width * .7, .025, depth * .58),
    new THREE.MeshStandardMaterial({ color: 0x303330, roughness: .5 })
  );
  accent.position.set(0, height + .014, 0);
  accent.userData.parentAppliance = group;
  group.add(accent);
  group.position.copy(position || new THREE.Vector3(0, .04, 0));
  group.position.y = .04;
  group.userData = { kind: "appliance", id: `appliance-${++applianceCounter}`, type, name: definition.name };
  apartment.add(group);
  appliances.push(group);
  if (!restoring) selectObject(group);
  return group;
}

function appliancePosition() {
  const position = new THREE.Vector3(0, .04, 0);
  if (selected?.userData.kind === "floor") new THREE.Box3().setFromObject(selected).getCenter(position);
  position.y = .04;
  return position;
}

const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();
const dragPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
const dragPoint = new THREE.Vector3();
let selected = floors.find(floor => floor.userData.id === "living");
let dragging = null;
const dragOffset = new THREE.Vector3();
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
  if (["floor", "wall"].includes(object.userData.kind)) document.querySelector('[data-tab="materials"]').click();
  document.querySelector("#selectionName").textContent = object.userData.name;
  document.querySelector("#roomLabel").textContent = object.userData.name.toUpperCase();
  renderMaterials();
  if (openPicker && matchMedia("(max-width: 760px)").matches) setMobilePanel(true);
}

canvas.addEventListener("pointerdown", event => {
  pointerDown = { x: event.clientX, y: event.clientY };
  updatePointer(event);
  const hit = raycaster.intersectObjects(appliances, true)[0];
  if (hit) {
    pushHistory();
    dragging = hit.object.userData.parentAppliance;
    if (raycaster.ray.intersectPlane(dragPlane, dragPoint)) dragOffset.copy(dragging.position).sub(dragPoint);
    controls.enabled = false;
    canvas.setPointerCapture(event.pointerId);
  }
});

canvas.addEventListener("pointermove", event => {
  if (!dragging) return;
  updatePointer(event);
  if (raycaster.ray.intersectPlane(dragPlane, dragPoint)) {
    dragging.position.x = THREE.MathUtils.clamp(dragPoint.x + dragOffset.x, -6.35, 6.45);
    dragging.position.z = THREE.MathUtils.clamp(dragPoint.z + dragOffset.z, -6.25, 5.65);
  }
});

canvas.addEventListener("pointerup", event => {
  if (dragging) {
    saveState(); selectObject(dragging); dragging = null; controls.enabled = true;
    return;
  }
  if (pointerDown && Math.hypot(event.clientX - pointerDown.x, event.clientY - pointerDown.y) < 5) {
    updatePointer(event);
    const candidates = [...appliances, ...walls.filter(wall => wall.visible), ...floors];
    const hit = raycaster.intersectObjects(candidates, true)[0];
    if (hit) selectObject(hit.object.userData.parentAppliance || hit.object);
  }
});

canvas.addEventListener("dragover", event => event.preventDefault());
canvas.addEventListener("drop", event => {
  event.preventDefault();
  const type = event.dataTransfer.getData("text/appliance");
  if (!APPLIANCE_TYPES[type]) return;
  updatePointer(event);
  if (!raycaster.ray.intersectPlane(dragPlane, dragPoint)) return;
  pushHistory(); makeAppliance(type, dragPoint); saveState();
  showToast(`${APPLIANCE_TYPES[type].name} adicionado`);
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
  const rotateTexture = document.querySelector("#rotateTextureBtn");
  const hasTexture = ["floor", "wall"].includes(selected?.userData.kind) && MATERIALS.some(item => item.id === selected.userData.materialId);
  rotateTexture.disabled = !hasTexture;
  rotateTexture.title = hasTexture ? "Girar a textura da superfície selecionada" : "Aplique uma textura antes de girar";
  document.querySelector("#deleteApplianceBtn").hidden = selected?.userData.kind !== "appliance";
}

function applyMaterial(item) {
  if (!selected || !["floor", "wall"].includes(selected.userData.kind)) return showToast("Selecione um piso ou parede primeiro");
  pushHistory();
  selected.material.dispose();
  selected.userData.textureRotation = 0;
  selected.material = materialFor(item.id, selected.userData.kind, 0);
  selected.userData.materialId = item.id;
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
    floors: Object.fromEntries(floors.map(item => [item.userData.id, { material: item.userData.materialId, rotation: item.userData.textureRotation || 0 }])),
    walls: Object.fromEntries(walls.map(item => [item.userData.id, { visible: item.visible, material: item.userData.materialId, rotation: item.userData.textureRotation || 0 }])),
    appliances: appliances.map(item => ({ type: item.userData.type, position: item.position.toArray(), rotation: item.rotation.y })),
    planLayer: activePlanLayer
  };
}

function applyState(state) {
  if (!state) return;
  floors.forEach(item => {
    const saved = state.floors?.[item.userData.id];
    const savedId = typeof saved === "string" ? saved : saved?.material;
    const rotation = typeof saved === "object" ? saved.rotation || 0 : 0;
    const id = MATERIALS.some(material => material.id === savedId) ? savedId : "base-floor";
    item.material.dispose(); item.material = materialFor(id, "floor", rotation); item.userData.materialId = id; item.userData.textureRotation = rotation;
  });
  walls.forEach(item => {
    const value = state.walls?.[item.userData.id];
    if (!value) return;
    const id = MATERIALS.some(material => material.id === value.material) ? value.material : "base-wall";
    const rotation = value.rotation || 0;
    item.visible = value.visible; item.material.dispose(); item.material = materialFor(id, "wall", rotation); item.userData.materialId = id; item.userData.textureRotation = rotation;
  });
  appliances.splice(0).forEach(item => apartment.remove(item));
  (state.appliances || []).forEach(value => {
    const item = makeAppliance(value.type, new THREE.Vector3().fromArray(value.position), true);
    if (item) item.rotation.y = value.rotation || 0;
  });
  setPlanLayer(state.planLayer && ["architecture", "electrical", "systems"].includes(state.planLayer) ? state.planLayer : "architecture");
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
document.querySelectorAll("[data-plan-layer]").forEach(button => button.addEventListener("click", () => { setPlanLayer(button.dataset.planLayer); saveState(); }));
document.querySelectorAll("[data-appliance]").forEach(button => {
  button.addEventListener("dragstart", event => {
    event.dataTransfer.setData("text/appliance", button.dataset.appliance);
    event.dataTransfer.effectAllowed = "copy";
  });
  button.addEventListener("click", () => {
    pushHistory(); makeAppliance(button.dataset.appliance, appliancePosition()); saveState();
    showToast(`${APPLIANCE_TYPES[button.dataset.appliance].name} adicionado — arraste para posicionar`);
  });
});
document.querySelector("#rotateTextureBtn").addEventListener("click", () => {
  if (!["floor", "wall"].includes(selected?.userData.kind) || !MATERIALS.some(item => item.id === selected.userData.materialId)) return;
  pushHistory();
  selected.userData.textureRotation = ((selected.userData.textureRotation || 0) + Math.PI / 2) % (Math.PI * 2);
  selected.material.dispose();
  selected.material = materialFor(selected.userData.materialId, selected.userData.kind, selected.userData.textureRotation);
  saveState(); showToast("Textura girada 90°");
});
document.querySelector("#deleteApplianceBtn").addEventListener("click", () => {
  if (selected?.userData.kind !== "appliance") return;
  pushHistory(); apartment.remove(selected); appliances.splice(appliances.indexOf(selected), 1);
  selected = floors.find(item => item.userData.id === "living"); saveState(); selectObject(selected, false); showToast("Eletrodoméstico removido");
});
document.querySelector("#hideWallBtn").addEventListener("click", () => { if (selected?.userData.kind !== "wall" || !selected.userData.removable) return; pushHistory(); selected.visible = false; saveState(); selectObject(floors.find(item => item.userData.id === "living")); showToast("Parede removida da visualização"); });
document.querySelector("#undoBtn").addEventListener("click", () => { const state = history.pop(); if (!state) return showToast("Nada para desfazer"); applyState(JSON.parse(state)); saveState(); showToast("Alteração desfeita"); });
document.querySelector("#resetBtn").addEventListener("click", () => { pushHistory(); localStorage.removeItem("miragio204-design"); location.reload(); });
document.querySelector("#captureBtn").addEventListener("click", () => { renderer.render(scene, camera); const link = document.createElement("a"); link.download = "miragio-204-estudo.png"; link.href = canvas.toDataURL("image/png"); link.click(); showToast("Imagem exportada"); });
const sidebar = document.querySelector(".sidebar");
const mobilePanelButton = document.querySelector("#mobilePanelBtn");
function setMobilePanel(open) {
  sidebar.classList.toggle("open", open);
  if (open) sidebar.scrollTop = 0;
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
