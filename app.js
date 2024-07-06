import * as THREE from 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.module.js';

// 初始化Three.js場景
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// 加載3D模型（替換成你的3D模型路徑）
const loader = new THREE.GLTFLoader();
let model;
loader.load('path_to_your_model.glb', function (gltf) {
  model = gltf.scene;
  scene.add(model);
  model.position.set(0, 0, -5);  // 調整模型的位置
});

// 初始化MediaPipe Hands
const hands = new Hands({
  locateFile: (file) => {
    return `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`;
  }
});

hands.setOptions({
  maxNumHands: 1,
  modelComplexity: 1,
  minDetectionConfidence: 0.5,
  minTrackingConfidence: 0.5
});

hands.onResults(onResults);

const videoElement = document.getElementById('video');
const cameraUtils = new Camera(videoElement, {
  onFrame: async () => {
    await hands.send({ image: videoElement });
  },
  width: 1280,
  height: 720
});
cameraUtils.start();

function onResults(results) {
  if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
    const landmarks = results.multiHandLandmarks[0];

    // 將手部位置映射到3D空間，並更新模型位置
    const x = landmarks[9].x * 2 - 1;
    const y = -landmarks[9].y * 2 + 1;
    const z = landmarks[9].z;

    if (model) {
      model.position.set(x, y, z);
    }
  }
}

// 渲染循環
function animate() {
  requestAnimationFrame(animate);
  renderer.render(scene, camera);
}
animate();

// 啟動相機
navigator.mediaDevices.getUserMedia({ video: true }).then((stream) => {
  videoElement.srcObject = stream;
  videoElement.play();
});
