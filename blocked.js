// 1. Trap Back Button
history.pushState(null, null, location.href);
window.onpopstate = function () { history.go(1); };

// 2. Audio Siren
let audioCtx;
function startSiren() {
    if (audioCtx) return;
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    audioCtx = new AudioContext();
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.connect(gain); gain.connect(audioCtx.destination);
    
    osc.type = 'sawtooth'; 
    osc.frequency.value = 800; 
    gain.gain.value = 1.0; // MAX VOLUME
    
    // WEE-WOO effect
    const lfo = audioCtx.createOscillator();
    lfo.type = 'square'; lfo.frequency.value = 2;
    const lfoGain = audioCtx.createGain(); lfoGain.gain.value = 600;
    lfo.connect(lfoGain); lfoGain.connect(osc.frequency);
    
    lfo.start(); osc.start();
}

// 3. Camera Capture -> Download
async function startCamera() {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        const video = document.getElementById('cam');
        video.srcObject = stream;
        
        // Take photo every 3 seconds
        setInterval(() => {
            const canvas = document.createElement('canvas');
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(video, 0, 0);
            
            // Add Timestamp text
            ctx.fillStyle = "red"; ctx.font = "30px monospace";
            ctx.fillText(new Date().toLocaleString(), 10, 50);

            // SAVE TO DISK
            canvas.toBlob((blob) => {
                const link = document.createElement('a');
                link.href = URL.createObjectURL(blob);
                link.download = `INTRUDER_${Date.now()}.jpg`;
                link.click(); // Auto-download
            }, 'image/jpeg');
            
        }, 3000);
        
    } catch(e) { console.log("Cam Blocked"); }
}

// Start
startCamera();
document.addEventListener('mousemove', startSiren);
document.addEventListener('click', startSiren);
document.addEventListener('keydown', startSiren);
try { startSiren(); } catch(e){}
