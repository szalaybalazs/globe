import React, { Component, FC, useRef, useEffect } from "react";
import ReactDOM from "react-dom";
import { OrbitControls } from "./OrbitControls";
import * as THREE from "three";
import WorldMap from "./Map";

const DOT_RADIUS = 580;
const DOT_COUNT = 80000;

const _handleLoad = async (wrapper: HTMLDivElement) => {
  const map = new WorldMap("./map.png");
  await map.load();

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x11243e);

  {
    const color = 0x11243e;
    const near = 1000;
    const far = 2500;
    scene.fog = new THREE.Fog(color, near, far);
  }
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

  const group = new THREE.Group();

  // A hexagon with a radius of 2 pixels looks like a circle
  const dotGeometry = new THREE.CircleGeometry(2, 5);
  const material = new THREE.MeshStandardMaterial({
    color: 0x355a86,
    side: THREE.DoubleSide,
  });
  const globeGeometry = new THREE.SphereGeometry(500, 50, 50);
  const globeMaterial = new THREE.MeshStandardMaterial({
    color: 0x1a2b4e,
  });
  var singleGeometry = new THREE.BufferGeometry();
  const globe = new THREE.Mesh(globeGeometry, globeMaterial);
  scene.add(globe);

  // The XYZ coordinate of each dot
  const positions = [];

  // A random identifier for each dot
  const rndId = [];

  // The country border each dot falls within
  const countryIds = [];

  const vector = new THREE.Vector3(0, 0, 0);
  for (let i = DOT_COUNT; i >= 0; i--) {
    const phi = Math.acos(-1 + (2 * i) / DOT_COUNT);
    const theta = Math.sqrt(DOT_COUNT * Math.PI) * phi;

    const x = (theta % (Math.PI * 2)) / (Math.PI * 2);
    const y = phi / Math.PI;
    const multiply = (val: Uint8ClampedArray | any[]) =>
      val[0] + val[1] + val[2];
    // const val = multiply(map.getColor(x, y)?.data || []);
    if (map.getColor(x, y) > 0) {
      // Pass the angle between this dot an the Y-axis (phi)
      // Pass this dot’s angle around the y axis (theta)
      // Scale each position by 600 (the radius of the globe)
      vector.setFromSphericalCoords(DOT_RADIUS, phi, theta);

      // Move the dot to the newly calculated position
      // dotGeometry.translate(vector.x, vector.y, vector.z);
      // dotGeometry.lookAt(new THREE.Vector3(0, 0, 0));
      const dotMesh = new THREE.Mesh(dotGeometry, material);
      dotMesh.position.x = vector.x;
      dotMesh.position.y = vector.y;
      dotMesh.position.z = vector.z;
      dotMesh.lookAt(new THREE.Vector3(0, 0, 0));
      group.add(dotMesh);
    }
  }

  {
    const color = 0xffffff;
    const intensity = 1;
    const light = new THREE.AmbientLight(color, intensity);
    scene.add(light);
  }
  {
    const skyColor = 0x355a86; // light blue
    const groundColor = 0x11243e; // brownish orange
    const intensity = 2;
    const light = new THREE.HemisphereLight(skyColor, groundColor, intensity);
    scene.add(light);
  }

  scene.add(group);

  camera.position.z = 1200;
  camera.position.y = 600;
  controls.update();

  var animate = function () {
    requestAnimationFrame(animate);
    console.time("RENDER");
    // group.rotation.x += 0.001;
    // group.rotation.y += 0.001;
    controls.update();
    renderer.render(scene, camera);
    console.timeEnd("RENDER");
  };
  animate();
};
const Globe: FC = () => {
  const wrapper = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (wrapper.current) _handleLoad(wrapper.current);
  }, []);

  return <div ref={wrapper} />;
};
// class App extends Component {
//   mount: any;
//   componentDidMount() {
//     var scene = new THREE.Scene();
//     var camera = new THREE.PerspectiveCamera(
//       75,
//       window.innerWidth / window.innerHeight,
//       0.1,
//       1000
//     );
//     var renderer = new THREE.WebGLRenderer();
//     renderer.setSize(window.innerWidth, window.innerHeight);
//     // document.body.appendChild( renderer.domElement );
//     // use ref as a mount point of the Three.js scene instead of the document.body
//     this.mount.appendChild(renderer.domElement);
//     var geometry = new THREE.BoxGeometry(1, 1, 1);
//     var material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
//     var cube = new THREE.Mesh(geometry, material);
//     scene.add(cube);
//     camera.position.z = 5;
//     var animate = function () {
//       requestAnimationFrame(animate);
//       cube.rotation.x += 0.01;
//       cube.rotation.y += 0.01;
//       renderer.render(scene, camera);
//     };
//     animate();
//   }
//   render() {
//     return <div ref={(ref) => (this.mount = ref)} />;
//   }
// }

export default Globe;

// var n = 0; // index
// var a = 0; // angle
// var c = 4; // gap
// var oldX = 0;
// var oldY = 0;
// var group = 1;
// var r = 0;
// var angle = 137.50755; // sunflower phyllotaxis
// function setup() {
//   // createCanvas(window.innerWidth, window.innerHeight);
//   // strokeWeight(.2);
// }

// function draw() {
//   group++;
//   addDot(n);
//   n++;
//   addDot(n);
//   n++;
//   addDot(n);
//   n++;
//   // for (var i=0;i<group;i++) {
//   //   n++;
//   //   addDot(n);
//   // }
// }

// function addDot(n) {
//   a = n * angle;
//   r = c * Math.sqrt(n) + n / 50;
//   // angleMode(DEGREES);
//   var x = r * Math.cos(a) + width / 2;
//   var y = r * Math.sin(a) + height / 2;

//   // fill(50);
//   // noStroke();
//   // ellipse(x, y, 4, 5);

//   // noFill();
//   // stroke('red');
//   // if (frameCount > 1 && frameCount < 10000) {
//   //   line(oldX, oldY, x, y);
//   // }
//   oldX = x;
//   oldY = y;
// }
