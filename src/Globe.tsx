import React, { Component, FC, useRef, useEffect } from "react";
import ReactDOM from "react-dom";
import { OrbitControls } from "./OrbitControls";
import * as THREE from "three";
import WorldMap from "./Map";

const DOT_RADIUS = 580;
const DOT_COUNT = 30000;
const green = 0xc1fdc3;
const yellow = 0xf9c982;
const globeColor = 0x101c45;

const addFog = (scene: THREE.Scene) => {
  // Fog color
  const color = globeColor;

  // Fog near plane
  const near = 1000;

  // Fog far plane
  const far = 2200;

  // Main scene
  scene.fog = new THREE.Fog(color, near, far);
};

const addGlobe = (scene: THREE.Scene) => {
  const globeGeometry = new THREE.SphereGeometry(DOT_RADIUS - 20, 250, 250);
  const globeMaterial = new THREE.MeshStandardMaterial({
    color: globeColor,
    opacity: 0.6,
    transparent: true,
  });

  const globe = new THREE.Mesh(globeGeometry, globeMaterial);
  globe.renderOrder = 1.0;
  scene.add(globe);
};

const setupRenderer = (wrapper: HTMLDivElement) => {
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    5000
  );
  const renderer = new THREE.WebGLRenderer({ antialias: false, alpha: true });
  renderer.setSize(800 * 4, 800 * 4 * (window.innerHeight / window.innerWidth));
  wrapper.appendChild(renderer.domElement);

  const controls = new OrbitControls(camera, renderer.domElement);

  camera.position.z = 1200;
  camera.position.y = 600;
  return { scene, camera, renderer, controls };
};

const _handleLoad = async (wrapper: HTMLDivElement) => {
  // Load map texture to heatmap
  const map = new WorldMap("./map.png");
  await map.load();

  // Create scene
  const { scene, camera, renderer, controls } = setupRenderer(wrapper);
  // addFog(scene);

  // Create mesh group
  const group = new THREE.Group();

  // A hexagon with a radius of 2 pixels looks like a circle
  const dotGeometry = new THREE.CircleGeometry(3, 5);
  const ringGeometry = new THREE.RingGeometry(3, 4, 25);
  const material = new THREE.MeshStandardMaterial({
    color: yellow,
    side: THREE.DoubleSide,
    transparent: true,
    opacity: 0.8,
  });
  const activeMaterial = new THREE.LineBasicMaterial({
    color: 0x000000,
    side: THREE.DoubleSide,
  });
  const vector = new THREE.Vector3(0, 0, 0);
  for (let i = DOT_COUNT; i >= 0; i--) {
    const phi = Math.acos(-1 + (2 * i) / DOT_COUNT);
    const theta = Math.sqrt(DOT_COUNT * Math.PI) * phi;

    const x = (theta % (Math.PI * 2)) / (Math.PI * 2);
    const y = phi / Math.PI;
    const val = map.getColor(x, y);
    if (val > 0) {
      console.log(val);
      // Pass the angle between this dot an the Y-axis (phi)
      // Pass this dot’s angle around the y axis (theta)
      // Scale each position by 600 (the radius of the globe)
      vector.setFromSphericalCoords(DOT_RADIUS, phi, theta);

      // Move the dot to the newly calculated position
      // dotGeometry.translate(vector.x, vector.y, vector.z);
      // dotGeometry.lookAt(new THREE.Vector3(0, 0, 0));
      const material = new THREE.MeshStandardMaterial({
        color: yellow,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: Math.random() / 2 + 0.25,
      });
      const dotMesh =
        val > 120
          ? new THREE.Mesh(ringGeometry, material)
          : new THREE.Mesh(dotGeometry, material);

      const scale = Math.random() / 2 + 0.5;
      dotMesh.scale.x = scale;
      dotMesh.scale.y = scale;
      dotMesh.scale.z = scale;
      dotMesh.position.x = vector.x;
      dotMesh.position.y = vector.y;
      dotMesh.position.z = vector.z;
      dotMesh.lookAt(new THREE.Vector3(0, 0, 0));
      dotMesh.renderOrder = 0.5;
      group.add(dotMesh);
    }
  }

  {
    const color = green;
    const intensity = 0;
    const light = new THREE.AmbientLight(color, intensity);
    scene.add(light);
  }
  {
    const skyColor = green; // light blue
    const groundColor = yellow; // brownish orange
    const intensity = 1.8;
    const light = new THREE.HemisphereLight(skyColor, groundColor, intensity);
    scene.add(light);
  }

  scene.add(group);

  addGlobe(scene);

  controls.update();
  group.rotation.y = -Math.PI / 2;
  let previous: number = 0;
  const animate = (time: number) => {
    requestAnimationFrame(animate);
    const delta = time - previous;
    previous = time;
    console.log(delta);
    group.rotation.y += 0.0001 * delta;
    // group.rotation.x = 0.1;
    controls.update();
    renderer.setClearColor(0x000000, 0);
    renderer.render(scene, camera);
  };
  animate(0);
};
const Globe: FC = () => {
  const wrapper = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (wrapper.current) _handleLoad(wrapper.current);
  }, []);

  return <div ref={wrapper} />;
};

export default Globe;
