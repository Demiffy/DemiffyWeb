import './style.css';

import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { TextureLoader } from 'three/src/loaders/TextureLoader';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';

// Scene setup
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({
  canvas: document.querySelector('#bg'),
  antialias: true
});
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);
camera.position.setZ(50);
camera.position.setY(10);
camera.rotation.x = -0.2;

// Post-processing
const composer = new EffectComposer(renderer);
const renderPass = new RenderPass(scene, camera);
composer.addPass(renderPass);
const bloomPass = new UnrealBloomPass(new THREE.Vector2(window.innerWidth, window.innerHeight), 1.5, 0.4, 0.85);
bloomPass.threshold = 0.21;
bloomPass.strength = 1.5;
bloomPass.radius = 0.55;
composer.addPass(bloomPass);

// Lighting
const ambientLight = new THREE.AmbientLight(0x404040);
const hemisphereLight = new THREE.HemisphereLight(0xffffbb, 0x080820, 1);
scene.add(ambientLight, hemisphereLight);

// Helpers
//const gridHelper = new THREE.GridHelper(200, 50);
//scene.add(gridHelper);

// Background texture
//const spaceTexture = new TextureLoader().load('images/space.jpg');
//scene.background = spaceTexture;

// Stars
function addStar() {
  const starGeometry = new THREE.SphereGeometry(0.25, 24, 24);
  const starMaterial = new THREE.MeshStandardMaterial({ color: 0xffffff, emissive: 0xffffff, emissiveIntensity: 0.5 });
  const star = new THREE.Mesh(starGeometry, starMaterial);
  const [x, y, z] = Array(3).fill().map(() => THREE.MathUtils.randFloatSpread(200));
  star.position.set(x, y, z);
  scene.add(star);
}
Array(200).fill().forEach(addStar);

// Sun
const sunTexture = new TextureLoader().load('images/sun.jpg');
const sunGeometry = new THREE.SphereGeometry(5, 32, 32);
const sunMaterial = new THREE.MeshBasicMaterial({ map: sunTexture });
const sun = new THREE.Mesh(sunGeometry, sunMaterial);
scene.add(sun);

// Planets with orbits
const planetData = [
  { name: "Mercury", texture: "images/mercury.jpg", size: 1, distance: 10, speed: 0.04 },
  { name: "Venus", texture: "images/venus.jpg", atmosphere: "images/venusatmosphere.jpg", size: 1.5, distance: 15, speed: 0.03 },
  { name: "Earth", texture: "images/earth.jpg", normal: "images/earthnormal.jpg", specular: "images/earthspecular.jpg", clouds: "images/earthclouds.jpg", moon: "images/moon.jpg", size: 2, distance: 20, speed: 0.01, moonDistance: 3, moonSpeed: 0.01 },
  { name: "Mars", texture: "images/mars.jpg", size: 1.2, distance: 25, speed: 0.015 },
  { name: "Jupiter", texture: "images/jupiter.jpg", size: 4, distance: 35, speed: 0.012 },
  { name: "Saturn", texture: "images/saturn.jpg", ringTexture: "images/saturnRN.jpg", ringSize: [7, 9, 64], size: 3.5, distance: 45, speed: 0.01 },
  { name: "Uranus", texture: "images/uranus.jpg", size: 2.5, distance: 55, speed: 0.008 },
  { name: "Neptune", texture: "images/neptune.jpg", size: 2.5, distance: 65, speed: 0.006 }
];

const planets = planetData.map(data => {
  const texture = new TextureLoader().load(data.texture);
  const geometry = new THREE.SphereGeometry(data.size, 32, 32);
  const material = new THREE.MeshPhongMaterial({ map: texture });

  // Specific enhancements for Earth
  if (data.name === "Earth") {
    material.normalMap = new TextureLoader().load(data.normal);
    material.specularMap = new TextureLoader().load(data.specular);
    const cloudsTexture = new TextureLoader().load(data.clouds);
    const cloudsGeometry = new THREE.SphereGeometry(data.size * 1.05, 32, 32);
    const cloudsMaterial = new THREE.MeshPhongMaterial({ map: cloudsTexture, transparent: true, opacity: 0.4 });
    const clouds = new THREE.Mesh(cloudsGeometry, cloudsMaterial);
    const planet = new THREE.Mesh(geometry, material);
    planet.add(clouds);

    // Moon
    const moonTexture = new TextureLoader().load(data.moon);
    const moonGeometry = new THREE.SphereGeometry(0.5, 32, 32);
    const moonMaterial = new THREE.MeshPhongMaterial({ map: moonTexture });
    const moon = new THREE.Mesh(moonGeometry, moonMaterial);
    moon.position.set(data.moonDistance, 0, 0);
    planet.add(moon);
    return { planet, clouds, moon, data };
  } else if (data.name === "Saturn") {
    const ringTexture = new TextureLoader().load(data.ringTexture);
    const ringGeometry = new THREE.RingGeometry(data.ringSize[0], data.ringSize[1], data.ringSize[2]);
    const ringMaterial = new THREE.MeshBasicMaterial({ map: ringTexture, side: THREE.DoubleSide });
    const ring = new THREE.Mesh(ringGeometry, ringMaterial);
    ring.rotation.x = -0.5 * Math.PI;
    const planet = new THREE.Mesh(geometry, material);
    planet.add(ring);
    return { planet, ring, data };
  } else if (data.name === "Venus") {
    const atmosphereTexture = new TextureLoader().load(data.atmosphere);
    const atmosphereGeometry = new THREE.SphereGeometry(data.size * 1.1, 32, 32);
    const atmosphereMaterial = new THREE.MeshPhongMaterial({ map: atmosphereTexture, transparent: true, opacity: 0.8 });
    const atmosphere = new THREE.Mesh(atmosphereGeometry, atmosphereMaterial);
    const planet = new THREE.Mesh(geometry, material);
    planet.add(atmosphere);
    return { planet, atmosphere, data };
  } else {
    return { planet: new THREE.Mesh(geometry, material), data };
  }
});

// Add planets to the scene and animate
planets.forEach(planet => {
  scene.add(planet.planet);
});

function addSpaceDust() {
  const particlesGeometry = new THREE.BufferGeometry();
  const count = 10000; // Number of particles
  const positions = new Float32Array(count * 3); // Each particle has x, y, and z coordinates

  for (let i = 0; i < count * 3; i++) {
      positions[i] = THREE.MathUtils.randFloatSpread(2000); // Fill the positions array
  }

  particlesGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3)); // Set the position attribute of the geometry

  const particlesMaterial = new THREE.PointsMaterial({
      color: 0xaaaaaa,
      size: 0.1,
      transparent: true
  });

  const dustParticles = new THREE.Points(particlesGeometry, particlesMaterial);
  scene.add(dustParticles);

  function animateDust() {
      requestAnimationFrame(animateDust);
      dustParticles.rotation.y += 0.00001;
      renderer.render(scene, camera);
  }
  animateDust();
}
addSpaceDust();


function addStarField() {
  const starsGeometry = new THREE.BufferGeometry();
  const starsMaterial = new THREE.PointsMaterial({
      color: 0xffffff,
      size: 0.7,
      sizeAttenuation: true
  });

  const starPositions = [];
  const starCount = 10000; // Increase the number for more density

  for (let i = 0; i < starCount; i++) {
      const x = THREE.MathUtils.randFloatSpread(2000); // Spread them wider to cover the whole scene
      const y = THREE.MathUtils.randFloatSpread(2000);
      const z = THREE.MathUtils.randFloatSpread(2000);
      starPositions.push(x, y, z);
  }

  starsGeometry.setAttribute('position', new THREE.Float32BufferAttribute(starPositions, 3));
  const starField = new THREE.Points(starsGeometry, starsMaterial);

  scene.add(starField);
}
addStarField();

function addDistantPlanet() {
  const textureLoader = new THREE.TextureLoader();
  const planetTexture = textureLoader.load('images/eris.jpg'); // Ensure you have a suitable texture
  const planetGeometry = new THREE.SphereGeometry(10, 20, 20); // Large size for the planet
  const planetMaterial = new THREE.MeshStandardMaterial({
      map: planetTexture,
      roughness: 0.7,
      metalness: 0.3
  });

  const distantPlanet = new THREE.Mesh(planetGeometry, planetMaterial);
  distantPlanet.position.set(600, 30, -600); // Position it far from the center
  scene.add(distantPlanet);

  // Optional: Add rotation to the planet
  function animateDistantPlanet() {
      requestAnimationFrame(animateDistantPlanet);
      distantPlanet.rotation.y += 0.001; // Slow rotation for realism
      renderer.render(scene, camera);
  }
  animateDistantPlanet();
}
addDistantPlanet();

function MoveCamera() {
  const t = document.body.getBoundingClientRect().top;
  // Map scroll position to camera z position
  camera.position.z = Math.max(0, Math.min(300, 50 - 0.1 * t));
  camera.position.x = t * -0.0002;
  camera.rotation.y = t * -0.0002;
}
document.body.onscroll = MoveCamera;

function animate() {
  requestAnimationFrame(animate);

  planets.forEach(({ planet, clouds, moon, data }) => {
    const time = Date.now() * 0.001 * data.speed;
    planet.position.x = Math.cos(time) * data.distance;
    planet.position.z = Math.sin(time) * data.distance;
    planet.rotation.y += 0.01;
    if (clouds) clouds.rotation.y += 0.005;  // Clouds rotate slightly faster
    if (moon) {
      moon.position.x = Math.cos(time * 10) * data.moonDistance;  // Moon's own orbit
      moon.position.z = Math.sin(time * 10) * data.moonDistance;
    }
  });
  composer.render();
}

window.addEventListener('load', function() {
  document.getElementById('loadingScreen').style.display = 'none';
  animate();
});



