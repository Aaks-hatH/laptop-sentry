const btn = document.getElementById('toggleBtn');
const txt = document.getElementById('statusText');
let isArmed = localStorage.getItem('sentry_armed') === 'true';

function updateUI() {
    if (isArmed) {
        btn.innerText = "DISARM";
        btn.className = "active";
        txt.innerText = "● MONITORING (IDLE)";
        txt.className = "status armed";
    } else {
        btn.innerText = "ARM SYSTEM";
        btn.className = "";
        txt.innerText = "● SYSTEM DISARMED";
        txt.className = "status disarmed";
    }
}
updateUI();

btn.addEventListener('click', () => {
    isArmed = !isArmed;
    localStorage.setItem('sentry_armed', isArmed);
    updateUI();
    chrome.runtime.sendMessage({ action: "TOGGLE_SENTRY", state: isArmed });
});
