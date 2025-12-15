const PIN = "123456"; // SET YOUR PIN HERE
let time = 15;
const timerEl = document.getElementById('timer');

const interval = setInterval(() => {
    time--;
    timerEl.innerText = time;
    if(time <= 0) {
        clearInterval(interval);
        chrome.runtime.sendMessage({ action: "AUTH_FAILED" }); // Trigger Alarm
    }
}, 1000);

document.getElementById('pin').addEventListener('keyup', (e) => {
    if(e.target.value === PIN) {
        clearInterval(interval);
        chrome.runtime.sendMessage({ action: "ADMIN_VERIFIED" });
        window.history.back(); // Go back to normal
    }
});
