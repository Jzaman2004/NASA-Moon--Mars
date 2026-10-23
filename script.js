// ==========================================
// 1. SCENE, CAMERA & RENDERER SETUP
// ==========================================
const container = document.getElementById('container');
const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(58, window.innerWidth / window.innerHeight, 0.1, 10000);
// Pulled back so spheres sit cleanly between the top title and bottom buttons
camera.position.set(0, 0.4, 14.5);

const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: "high-performance" });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
container.appendChild(renderer.domElement);

const controls = new THREE.OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.06;
controls.enablePan = false;
controls.minDistance = 2.6;
controls.maxDistance = 30;
controls.target.set(0, -0.4, 0);

let appState = 'HOME';
let activePlanet = null;
const BASE_PLANET_Y = -0.65; // Shifts spheres slightly down so top text never overlaps

// ==========================================
// 2. LIGHTING & STARFIELD
// ==========================================
const ambientLight = new THREE.AmbientLight(0x2a3550, 1.3);
scene.add(ambientLight);

const sunLight = new THREE.DirectionalLight(0xfff4e5, 2.2);
sunLight.position.set(15, 8, 12);
scene.add(sunLight);

const rimLight = new THREE.DirectionalLight(0x00d4ff, 0.7);
rimLight.position.set(-15, -6, -10);
scene.add(rimLight);

function createStarfield() {
    const starGeo = new THREE.BufferGeometry();
    const count = 4500;
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);

    const palette = [
        new THREE.Color(0xffffff),
        new THREE.Color(0xaad4ff),
        new THREE.Color(0xffe9b3),
        new THREE.Color(0xffb5a7)
    ];

    for (let i = 0; i < count; i++) {
        const r = 120 + Math.random() * 600;
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos(2 * Math.random() - 1);

        positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
        positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
        positions[i * 3 + 2] = r * Math.cos(phi);

        const c = palette[Math.floor(Math.random() * palette.length)];
        colors[i * 3] = c.r;
        colors[i * 3 + 1] = c.g;
        colors[i * 3 + 2] = c.b;
    }

    starGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    starGeo.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const starMat = new THREE.PointsMaterial({
        size: 1.25,
        vertexColors: true,
        transparent: true,
        opacity: 0.92
    });

    const starField = new THREE.Points(starGeo, starMat);
    scene.add(starField);
    return starField;
}
const stars = createStarfield();

// ==========================================
// 3. PROCEDURAL PLANET TEXTURES
// ==========================================
function generatePlanetTexture(type) {
    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');

    if (type === 'moon') {
        const grad = ctx.createLinearGradient(0, 0, 0, canvas.height);
        grad.addColorStop(0, '#9a9ea6');
        grad.addColorStop(0.5, '#7c8088');
        grad.addColorStop(1, '#8f939b');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        for (let i = 0; i < 35; i++) {
            ctx.fillStyle = `rgba(55, 58, 66, ${Math.random() * 0.35 + 0.1})`;
            ctx.beginPath();
            ctx.arc(Math.random() * canvas.width, Math.random() * canvas.height, Math.random() * 90 + 25, 0, Math.PI * 2);
            ctx.fill();
        }

        for (let i = 0; i < 400; i++) {
            const x = Math.random() * canvas.width;
            const y = Math.random() * canvas.height;
            const r = Math.random() * 18 + 2;
            ctx.strokeStyle = `rgba(215, 220, 230, ${Math.random() * 0.45})`;
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.arc(x, y, r, 0, Math.PI * 2);
            ctx.stroke();
            ctx.fillStyle = `rgba(40, 42, 48, ${Math.random() * 0.5})`;
            ctx.fill();
        }
    } else {
        const grad = ctx.createLinearGradient(0, 0, 0, canvas.height);
        grad.addColorStop(0, '#a84224');
        grad.addColorStop(0.5, '#c9532b');
        grad.addColorStop(1, '#9c3b1f');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        for (let i = 0; i < 45; i++) {
            ctx.fillStyle = `rgba(85, 28, 14, ${Math.random() * 0.35 + 0.1})`;
            ctx.beginPath();
            ctx.ellipse(Math.random() * canvas.width, Math.random() * canvas.height, Math.random() * 110 + 20, Math.random() * 45 + 10, Math.random() * Math.PI, 0, Math.PI * 2);
            ctx.fill();
        }

        for (let i = 0; i < 250; i++) {
            ctx.fillStyle = `rgba(235, 138, 88, ${Math.random() * 0.25})`;
            ctx.beginPath();
            ctx.arc(Math.random() * canvas.width, Math.random() * canvas.height, Math.random() * 25 + 3, 0, Math.PI * 2);
            ctx.fill();
        }

        ctx.fillStyle = 'rgba(245, 250, 255, 0.75)';
        ctx.fillRect(0, 0, canvas.width, 18);
        ctx.fillRect(0, canvas.height - 18, canvas.width, 18);
    }

    return new THREE.CanvasTexture(canvas);
}

// ==========================================
// 4. REAL NASA DISCARDED EQUIPMENT (4 MOON + 4 MARS)
// ==========================================
const equipmentData = {
    moon: [
        {
            id: 'apollo-11',
            name: 'Apollo 11 Descent Stage (Eagle)',
            lat: 0.674, lon: 23.473,
            coords: '0.6741° N, 23.4730° E',
            year: '1969',
            mass: '2,132 kg',
            status: 'Historic Monument & Reflector',
            pageUrl: 'equipment.html?id=apollo-11',
            story: 'When Neil Armstrong and Buzz Aldrin lifted off from Tranquility Base, Eagle’s octagon-shaped lower stage stayed behind as their launchpad. Alongside it sits the Lunar Laser Ranging Retroreflector—an array of mirrors that still reflects laser beams fired from Earth today!',
            fact: 'A stainless-steel plaque on its ladder leg is signed by the crew and reads: "We came in peace for all mankind."'
        },
        {
            id: 'apollo-15-lrv',
            name: 'Apollo 15 Lunar Roving Vehicle',
            lat: 26.132, lon: 3.633,
            coords: '26.1322° N, 3.6339° E',
            year: '1971',
            mass: '210 kg',
            status: 'Parked on Hadley Plain',
            pageUrl: 'equipment.html?id=apollo-15-lrv',
            story: 'The first "Moon Buggy" driven by humans on another world! Powered by two 36-volt silver-zinc batteries, it carried astronauts David Scott and James Irwin 27.9 km across craters and mountains using woven zinc-coated piano-wire mesh tires instead of air-filled rubber.',
            fact: 'It folded up like a lawn chair inside the Lunar Module and was deployed by pulling ribbons!'
        },
        {
            id: 'surveyor-3',
            name: 'Surveyor 3 Robotic Lander',
            lat: -3.015, lon: -23.418,
            coords: '3.0158° S, 23.4183° W',
            year: '1967',
            mass: '296 kg',
            status: 'Visited by Apollo 12 Crew',
            pageUrl: 'equipment.html?id=surveyor-3',
            story: 'Surveyor 3 bounced twice during landing in the Ocean of Storms before using its robotic scoop to dig trenches and prove the Moon’s soil would not swallow Apollo astronauts. In 1969, Apollo 12 astronauts walked right up to it and snipped off its TV camera to return to Earth!',
            fact: 'Surveyor 3 remains the only robotic spacecraft ever visited in person by humans on another world.'
        },
        {
            id: 'ranger-4',
            name: 'Ranger 4 Impact Probe',
            lat: -15.5, lon: -130.7,
            coords: '15.5° S, 130.7° W (Far Side)',
            year: '1962',
            mass: '331 kg',
            status: 'Shattered on Lunar Far Side',
            pageUrl: 'equipment.html?id=ranger-4',
            story: 'Built to snap high-res images of the Moon right before impact and drop a balsa-wood seismometer sphere, Ranger 4 suffered a master clock computer failure. Though silent, it became the very first U.S. spacecraft to reach another celestial body when it impacted the Moon’s far side at 9,600 km/h.',
            fact: 'Its gold and chrome plating was specially painted to balance scorching sunlight and freezing shadow in deep space.'
        }
    ],
    mars: [
        {
            id: 'ingenuity',
            name: 'Ingenuity Mars Helicopter (Ginny)',
            lat: 18.444, lon: 77.450,
            coords: '18.4447° N, 77.4508° E',
            year: '2021 - 2024',
            mass: '1.8 kg',
            status: 'Static Weather Telemetry',
            pageUrl: 'equipment.html?id=ingenuity',
            story: 'Designed for just 5 test flights over 30 days, Ingenuity made history as the first aircraft to achieve powered, controlled flight on another planet—completing 72 flights! After a hard landing damaged its carbon-fiber rotor blades in January 2024, NASA reprogrammed it to serve as a stationary weather and avionics testbed for future Mars explorers.',
            fact: 'Taped to a cable underneath its solar panel is a real piece of fabric from the Wright Brothers’ 1903 Flyer!'
        },
        {
            id: 'opportunity',
            name: 'Opportunity Rover (MER-B)',
            lat: -2.046, lon: -5.528,
            coords: '2.046° S, 5.528° W',
            year: '2004 - 2018',
            mass: '185 kg',
            status: 'Resting in Perseverance Valley',
            pageUrl: 'equipment.html?id=opportunity',
            story: 'Expected to last only 90 Martian sols before dust covered its solar panels, "Oppy" caught lucky wind gusts ("cleaning events") and roved Mars for nearly 15 years! It drove 45.16 km—more than a marathon—and discovered tiny mineral spheres nicknamed "blueberries" that proved liquid water once soaked Mars.',
            fact: 'Its final message home during the historic 2018 global dust storm translated poetically to: "My battery is low and it’s getting dark."'
        },
        {
            id: 'sojourner',
            name: 'Sojourner Rover & Pathfinder',
            lat: 19.13, lon: -33.22,
            coords: '19.13° N, 33.22° W',
            year: '1997',
            mass: '11.5 kg',
            status: 'Silent in Ares Vallis',
            pageUrl: 'equipment.html?id=sojourner',
            story: 'No bigger than a microwave oven, Sojourner was the pioneer that proved six-wheeled "rocker-bogie" rovers could climb over Martian boulders. Delivered inside a giant pyramid of 24 inflatable airbags on the Carl Sagan Memorial Station (Pathfinder), it X-rayed Martian rocks for 83 sols.',
            fact: 'When the Pathfinder lander’s battery died from the cold, loyal little Sojourner followed its backup code and drove in circles around the lander waiting for instructions.'
        },
        {
            id: 'insight',
            name: 'InSight Geophysical Lander',
            lat: 4.502, lon: 135.623,
            coords: '4.5024° N, 135.6234° E',
            year: '2018 - 2022',
            mass: '358 kg',
            status: 'Retired Seismometer Station',
            pageUrl: 'equipment.html?id=insight',
            story: 'Instead of wheels, InSight used a robotic arm to place a copper-colored dome seismometer directly onto the ground in Elysium Planitia. It detected over 1,300 "marsquakes"—including a magnitude 5 quake—allowing scientists to map the thickness of Mars’s crust, mantle, and liquid metal core for the first time.',
            fact: 'InSight snapped a farewell selfie in 2022 showing its round solar wings completely blanketed in thick red Martian dust.'
        }
    ]
};

// ==========================================
// 5. BUILD SPHERES & 3D MARKERS
// ==========================================
const planets = {};
const clickableMeshes = [];
const markerMeshes = [];

function latLonToVector3(lat, lon, radius) {
    const phi = (90 - lat) * (Math.PI / 180);
    const theta = (lon + 180) * (Math.PI / 180);
    return new THREE.Vector3(
        -(radius * Math.sin(phi) * Math.cos(theta)),
        (radius * Math.cos(phi)),
        (radius * Math.sin(phi) * Math.sin(theta))
    );
}

function createTextLabel(title, subtitle, colorHex) {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 140;
    const ctx = canvas.getContext('2d');

    ctx.font = 'bold 42px Orbitron, sans-serif';
    ctx.fillStyle = colorHex;
    ctx.textAlign = 'center';
    ctx.shadowColor = colorHex;
    ctx.shadowBlur = 14;
    ctx.fillText(title, 256, 60);

    ctx.font = '600 24px Rajdhani, sans-serif';
    ctx.fillStyle = '#d8e8ff';
    ctx.shadowBlur = 0;
    ctx.fillText(subtitle, 256, 100);

    const tex = new THREE.CanvasTexture(canvas);
    const mat = new THREE.SpriteMaterial({ map: tex, transparent: true, depthTest: false });
    const sprite = new THREE.Sprite(mat);
    sprite.scale.set(3.6, 1.0, 1);
    return sprite;
}

function buildCelestialBody(key, name, subtitle, radius, positionX, glowColor) {
    const group = new THREE.Group();
    group.position.set(positionX, BASE_PLANET_Y, 0);
    scene.add(group);

    const tex = generatePlanetTexture(key);
    const geo = new THREE.SphereGeometry(radius, 64, 64);
    const mat = new THREE.MeshStandardMaterial({
        map: tex,
        bumpMap: tex,
        bumpScale: 0.04,
        roughness: 0.85,
        metalness: 0.1,
        transparent: true,
        opacity: 1
    });
    const sphere = new THREE.Mesh(geo, mat);
    sphere.userData = { type: 'planet', planetKey: key, name: name };
    group.add(sphere);
    clickableMeshes.push(sphere);

    const glowGeo = new THREE.SphereGeometry(radius * 1.06, 64, 64);
    const glowMat = new THREE.MeshBasicMaterial({
        color: glowColor,
        transparent: true,
        opacity: 0.16,
        side: THREE.BackSide
    });
    group.add(new THREE.Mesh(glowGeo, glowMat));

    const ringGeo = new THREE.RingGeometry(radius * 1.32, radius * 1.35, 64);
    const ringMat = new THREE.MeshBasicMaterial({
        color: glowColor,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.35
    });
    const ringMesh = new THREE.Mesh(ringGeo, ringMat);
    ringMesh.rotation.x = Math.PI / 2.3;
    group.add(ringMesh);

    const label = createTextLabel(name, subtitle, glowColor === 0x00d4ff ? '#00d4ff' : '#ff6b4a');
    label.position.set(0, radius + 0.9, 0);
    group.add(label);

    const markersGroup = new THREE.Group();
    markersGroup.visible = false;
    sphere.add(markersGroup);

    equipmentData[key].forEach((eq, idx) => {
        const pinGroup = new THREE.Group();
        const pos = latLonToVector3(eq.lat, eq.lon, radius * 1.01);
        pinGroup.position.copy(pos);
        pinGroup.lookAt(pos.clone().multiplyScalar(2));

        const pinGeo = new THREE.SphereGeometry(0.085, 20, 20);
        const pinMat = new THREE.MeshBasicMaterial({
            color: key === 'moon' ? 0x00ffcc : 0xffaa00
        });
        const pinMesh = new THREE.Mesh(pinGeo, pinMat);
        pinMesh.userData = {
            type: 'marker',
            planetKey: key,
            equipment: eq,
            markerIndex: idx + 1
        };
        pinGroup.add(pinMesh);
        markerMeshes.push(pinMesh);

        const haloGeo = new THREE.RingGeometry(0.12, 0.17, 32);
        const haloMat = new THREE.MeshBasicMaterial({
            color: 0xffffff,
            side: THREE.DoubleSide,
            transparent: true,
            opacity: 0.85
        });
        const haloMesh = new THREE.Mesh(haloGeo, haloMat);
        pinGroup.add(haloMesh);
        pinMesh.userData.halo = haloMesh;

        markersGroup.add(pinGroup);
    });

    planets[key] = { key, name, group, sphere, ringMesh, label, markersGroup, radius };
}

// Wider X-spacing (-4.8 and +4.8) so spheres have plenty of room
buildCelestialBody('moon', 'THE MOON', '4 Lunar Artifacts', 1.75, -4.8, 0x00d4ff);
buildCelestialBody('mars', 'MARS', '4 Martian Artifacts', 1.90, 4.8, 0xff5e3a);

// ==========================================
// 6. CAMERA ZOOM-MORPH FUNCTIONS
// ==========================================
const heroHeader = document.getElementById('heroHeader');
const heroBottomBar = document.getElementById('heroBottomBar');
const planetHud = document.getElementById('planetHud');
const backToSpaceBtn = document.getElementById('backToSpaceBtn');
const backToPlanetBtn = document.getElementById('backToPlanetBtn');
const equipmentView = document.getElementById('equipmentView');

window.focusPlanet = function(planetKey) {
    equipmentView.classList.add('d-none');

    appState = planetKey.toUpperCase();
    activePlanet = planets[planetKey];
    const otherPlanet = planets[planetKey === 'moon' ? 'mars' : 'moon'];

    heroHeader.classList.add('hidden');
    heroBottomBar.classList.add('hidden');
    backToSpaceBtn.classList.remove('d-none');
    backToPlanetBtn.classList.add('d-none');
    planetHud.classList.remove('d-none');

    document.getElementById('hudPlanetName').innerText = activePlanet.name;
    const quickList = document.getElementById('markerQuickList');
    quickList.innerHTML = '';
    equipmentData[planetKey].forEach((eq, i) => {
        const btn = document.createElement('button');
        btn.className = 'marker-pill';
        btn.innerHTML = `📍 <strong>Site 0${i + 1}:</strong> ${eq.name}`;
        btn.onclick = () => zoomToMarker(eq, planetKey);
        quickList.appendChild(btn);
    });

    activePlanet.markersGroup.visible = true;
    activePlanet.label.visible = false;
    activePlanet.ringMesh.visible = false;

    gsap.to(otherPlanet.sphere.material, { opacity: 0.06, duration: 1.2 });
    otherPlanet.label.visible = false;
    otherPlanet.markersGroup.visible = false;

    const targetX = activePlanet.group.position.x;
    const targetY = activePlanet.group.position.y;

    gsap.to(controls.target, {
        x: targetX,
        y: targetY,
        z: 0,
        duration: 1.5,
        ease: 'power3.inOut'
    });

    gsap.to(camera.position, {
        x: targetX,
        y: targetY + 0.5,
        z: activePlanet.radius * 2.5,
        duration: 1.5,
        ease: 'power3.inOut'
    });
};

function returnToHome() {
    appState = 'HOME';
    activePlanet = null;

    heroHeader.classList.remove('hidden');
    heroBottomBar.classList.remove('hidden');
    planetHud.classList.add('d-none');
    equipmentView.classList.add('d-none');
    backToSpaceBtn.classList.add('d-none');
    backToPlanetBtn.classList.add('d-none');

    Object.values(planets).forEach(p => {
        gsap.to(p.sphere.material, { opacity: 1, duration: 1 });
        p.label.visible = true;
        p.ringMesh.visible = true;
        p.markersGroup.visible = false;
    });

    gsap.to(controls.target, {
        x: 0, y: -0.4, z: 0,
        duration: 1.5,
        ease: 'power3.inOut'
    });

    gsap.to(camera.position, {
        x: 0, y: 0.4, z: 14.5,
        duration: 1.5,
        ease: 'power3.inOut'
    });
}

function zoomToMarker(eq, planetKey) {
    appState = 'EQUIPMENT';
    const p = planets[planetKey];

    const targetPin = markerMeshes.find(m => m.userData.equipment.id === eq.id);
    const worldPos = new THREE.Vector3();
    targetPin.getWorldPosition(worldPos);

    const planetCenter = p.group.position.clone();
    const normalDir = worldPos.clone().sub(planetCenter).normalize();
    const camDest = planetCenter.clone().add(normalDir.multiplyScalar(p.radius * 1.45));

    planetHud.classList.add('d-none');
    backToPlanetBtn.classList.remove('d-none');

    gsap.to(controls.target, {
        x: worldPos.x,
        y: worldPos.y,
        z: worldPos.z,
        duration: 1.25,
        ease: 'power3.inOut'
    });

    gsap.to(camera.position, {
        x: camDest.x,
        y: camDest.y,
        z: camDest.z,
        duration: 1.25,
        ease: 'power3.inOut',
        onComplete: () => {
            openEquipmentOverlay(eq, planetKey);
        }
    });
}

function openEquipmentOverlay(eq, planetKey) {
    const badge = document.getElementById('eqBadge');
    badge.innerText = planetKey === 'moon' ? '🌕 LUNAR ARTIFACT' : '🔴 MARTIAN ARTIFACT';
    badge.className = planetKey === 'moon' ? 'badge bg-info text-dark mb-2' : 'badge bg-danger text-white mb-2';

    document.getElementById('eqTitle').innerText = eq.name;
    document.getElementById('eqCoords').innerText = eq.coords;
    document.getElementById('eqYear').innerText = eq.year;
    document.getElementById('eqMass').innerText = eq.mass;
    document.getElementById('eqStatus').innerText = eq.status;
    document.getElementById('eqStory').innerText = eq.story;
    document.getElementById('eqFact').innerText = eq.fact;

    document.getElementById('openFullPageBtn').onclick = () => {
        window.location.href = eq.pageUrl;
    };

    equipmentView.classList.remove('d-none');
}

backToSpaceBtn.addEventListener('click', returnToHome);
document.getElementById('navHomeBtn').addEventListener('click', (e) => {
    e.preventDefault();
    returnToHome();
});

document.getElementById('closeEqBtn').addEventListener('click', () => {
    if (activePlanet) focusPlanet(activePlanet.key);
});
backToPlanetBtn.addEventListener('click', () => {
    if (activePlanet) focusPlanet(activePlanet.key);
});

// Check URL parameters in case user returns from equipment.html?planet=moon
const urlParams = new URLSearchParams(window.location.search);
const returnPlanet = urlParams.get('planet');
if (returnPlanet === 'moon' || returnPlanet === 'mars') {
    setTimeout(() => focusPlanet(returnPlanet), 200);
}

// ==========================================
// 7. RAYCASTER (CLICK & HOVER)
// ==========================================
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();
const tooltip = document.getElementById('tooltip');

window.addEventListener('mousemove', (e) => {
    mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;

    if (appState === 'EQUIPMENT') {
        tooltip.style.opacity = 0;
        document.body.style.cursor = 'default';
        return;
    }

    raycaster.setFromCamera(mouse, camera);

    if (appState === 'MOON' || appState === 'MARS') {
        const activeMarkers = markerMeshes.filter(m => m.userData.planetKey === activePlanet.key);
        const markerHits = raycaster.intersectObjects(activeMarkers);
        if (markerHits.length > 0) {
            const eq = markerHits[0].object.userData.equipment;
            document.body.style.cursor = 'pointer';
            tooltip.innerText = `📍 Click to Zoom: ${eq.name}`;
            tooltip.style.left = `${e.clientX + 15}px`;
            tooltip.style.top = `${e.clientY + 15}px`;
            tooltip.style.opacity = 1;
            return;
        }
    }

    if (appState === 'HOME') {
        const planetHits = raycaster.intersectObjects(clickableMeshes);
        if (planetHits.length > 0) {
            const pName = planetHits[0].object.userData.name;
            document.body.style.cursor = 'pointer';
            tooltip.innerText = `🚀 Click to Enter ${pName} Orbit`;
            tooltip.style.left = `${e.clientX + 15}px`;
            tooltip.style.top = `${e.clientY + 15}px`;
            tooltip.style.opacity = 1;
            return;
        }
    }

    document.body.style.cursor = 'grab';
    tooltip.style.opacity = 0;
});

window.addEventListener('click', (e) => {
    if (e.target.tagName !== 'CANVAS' || appState === 'EQUIPMENT') return;
    raycaster.setFromCamera(mouse, camera);

    if (appState === 'MOON' || appState === 'MARS') {
        const activeMarkers = markerMeshes.filter(m => m.userData.planetKey === activePlanet.key);
        const markerHits = raycaster.intersectObjects(activeMarkers);
        if (markerHits.length > 0) {
            const { equipment, planetKey } = markerHits[0].object.userData;
            zoomToMarker(equipment, planetKey);
            return;
        }
    }

    if (appState === 'HOME') {
        const planetHits = raycaster.intersectObjects(clickableMeshes);
        if (planetHits.length > 0) {
            focusPlanet(planetHits[0].object.userData.planetKey);
        }
    }
});

// ==========================================
// 8. ANIMATION LOOP
// ==========================================
const clock = new THREE.Clock();

function animate() {
    requestAnimationFrame(animate);
    const elapsed = clock.getElapsedTime();

    const rotSpeed = (appState === 'HOME') ? 0.004 : (appState === 'EQUIPMENT' ? 0.0002 : 0.0012);
    planets.moon.sphere.rotation.y += rotSpeed;
    planets.mars.sphere.rotation.y += rotSpeed * 0.9;

    if (appState === 'HOME') {
        planets.moon.group.position.y = BASE_PLANET_Y + Math.sin(elapsed * 1.2) * 0.14;
        planets.mars.group.position.y = BASE_PLANET_Y + Math.cos(elapsed * 1.2) * 0.14;
    }

    const pulseScale = 1 + Math.sin(elapsed * 4) * 0.25;
    markerMeshes.forEach(m => {
        if (m.userData.halo) m.userData.halo.scale.set(pulseScale, pulseScale, 1);
    });

    stars.rotation.y = elapsed * 0.008;
    controls.update();
    renderer.render(scene, camera);
}
animate();

window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});