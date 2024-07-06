const videoElement = document.getElementById('camera');
const canvasElement = document.getElementById('output');
const canvasCtx = canvasElement.getContext('2d');

async function setupCamera() {
    const stream = await navigator.mediaDevices.getUserMedia({ video: true });
    videoElement.srcObject = stream;

    return new Promise((resolve) => {
        videoElement.onloadedmetadata = () => {
            resolve(videoElement);
        };
    });
}

const handTracking = new HandTracking.Hands({
    locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/hand_tracking/${file}`,
});

handTracking.setOptions({
    maxNumHands: 1,
    modelComplexity: 1,
    minDetectionConfidence: 0.5,
    minTrackingConfidence: 0.5
});

handTracking.onResults(onResults);

function onResults(results) {
    canvasCtx.save();
    canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);

    if (results.multiHandLandmarks) {
        for (const landmarks of results.multiHandLandmarks) {
            // 畫手部骨架
            drawConnectors(canvasCtx, landmarks, HandTracking.HAND_CONNECTIONS, { color: '#00FF00', lineWidth: 5 });
            drawLandmarks(canvasCtx, landmarks, { color: '#FF0000', lineWidth: 2 });

            // 計算紋身位置
            const wrist = landmarks[0];
            const thumbTip = landmarks[4];
            const indexFingerTip = landmarks[8];

            const tattooImage = new Image();
            tattooImage.src = 'tattoo.png'; // 替換為你的紋身圖像路徑
            tattooImage.onload = () => {
                const tattooWidth = 100;
                const tattooHeight = 100;
                const x = wrist.x * canvasElement.width - tattooWidth / 2;
                const y = wrist.y * canvasElement.height - tattooHeight / 2;
                canvasCtx.drawImage(tattooImage, x, y, tattooWidth, tattooHeight);
            };
        }
    }
    canvasCtx.restore();
}

setupCamera().then((video) => {
    video.play();
    handTracking.send({ image: videoElement });
});
