import React, { Component, FC, useRef, useEffect } from "react";
import ReactDOM from "react-dom";
import { OrbitControls } from "./OrbitControls";
import * as THREE from "three";
import WorldMap from "./Map";

const DOT_RADIUS = 580;
const DOT_COUNT = 20000;
const green = 0xc1fdc3;
const yellow = 0xf9c982;
const globeColor = 0x101c45;

let activeObject: any = null;
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

function updateScreenPosition(renderer: any, camera: any, popup: any) {
  const vector = new THREE.Vector3(
    activeObject.position.x,
    activeObject.position.y,
    activeObject.position.z
  );
  activeObject.getWorldPosition(vector);
  const canvas = renderer.domElement;
  const { width, height } = canvas.getBoundingClientRect();

  const spriteBehindObject = vector.distanceTo(camera.position) > 1200;
  vector.project(camera);

  vector.x = Math.round((0.5 + vector.x / 2) * width);
  vector.y = Math.round((0.5 - vector.y / 2) * height);

  popup.style.top = `${vector.y}px`;
  popup.style.left = `${vector.x}px`;
  popup.style.opacity = spriteBehindObject ? 0.25 : 1;
}

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
  const dotGeometry = new THREE.CircleGeometry(2, 5);
  const activeGeometry = new THREE.CircleGeometry(2, 25);
  const material = new THREE.MeshStandardMaterial({
    color: yellow,
    side: THREE.DoubleSide,
    transparent: true,
    opacity: 0.8,
  });
  const activeMaterial = new THREE.LineBasicMaterial({
    color: 0xb800c8,
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
          ? new THREE.Mesh(activeGeometry, activeMaterial)
          : new THREE.Mesh(dotGeometry, material);

      let scale = Math.random() + 0.5;
      if (val > 120) {
        activeObject = dotMesh;
        scale *= 4;
      }
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
  const popup = document.querySelector("#popup-wrapper");
  const animate = (time: number) => {
    requestAnimationFrame(animate);

    const delta = time - previous;
    previous = time;
    group.rotation.y += 0.0001 * delta;

    controls.update();
    renderer.setClearColor(0x000000, 0);
    renderer.render(scene, camera);

    updateScreenPosition(renderer, camera, popup);
  };
  animate(0);
};
const Globe: FC = () => {
  const wrapper = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (wrapper.current) _handleLoad(wrapper.current);
  }, []);

  return (
    <div className="globe-container">
      <div className="popup-wrapper" id="popup-wrapper">
        <div className="content-wrapper">
          <div className="content">
            <span className="title">Magnitude 5</span>
            <p>
              Lorem fugiat aute proident cupidatat commodo ea deserunt
              adipisicing.
            </p>
          </div>
          <span className="date">Jun 12, 08:18</span>
        </div>

        <svg
          width="36px"
          height="40px"
          viewBox="0 0 204 204"
          version="1.1"
          xmlns="http://www.w3.org/2000/svg"
        >
          <g
            id="Page-1"
            stroke="none"
            stroke-width="1"
            fill="none"
            fill-rule="evenodd"
          >
            <g id="Group">
              <path
                d="M12,192 C18.270881,139.700741 36.5148327,98.4426005 66.731855,68.2255781 C96.9488774,38.0085558 138.704926,19.2666964 192,12"
                id="Path-2"
                stroke="#AC05AF"
                stroke-width="10"
                stroke-linecap="round"
                stroke-linejoin="round"
              ></path>
              <rect
                id="Rectangle"
                fill="#AC05AF"
                x="0"
                y="180"
                width="24"
                height="24"
                rx="12"
              ></rect>
              <rect
                id="Rectangle-Copy"
                fill="#AC05AF"
                x="180"
                y="0"
                width="24"
                height="24"
                rx="12"
              ></rect>
            </g>
          </g>
        </svg>
        <img src="/loader.png" alt="" />
      </div>
      <div ref={wrapper} />;
    </div>
  );
};

export default Globe;
