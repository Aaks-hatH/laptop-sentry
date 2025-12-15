// STATE
let sentryMode = false;
let lockdownActive = false;
let authPending = false; // Is the yellow screen open?

// 1. LISTEN FOR POPUP COMMANDS
chrome.runtime.onMessage.addListener((req, sender, sendResponse) => {
    // Toggle Sentry
    if (req.action === "TOGGLE_SENTRY") {
        sentryMode = req.state;
        if (!sentryMode) {
            lockdownActive = false;
            authPending = false;
        }
        console.log("SENTRY:", sentryMode ? "ARMED" : "DISARMED");
        sendResponse({ status: "OK" });
    }

    // Success: PIN Correct
    if (req.action === "ADMIN_VERIFIED") {
        sentryMode = false;
        authPending = false;
        lockdownActive = false;
    }

    // Failure: Wrong PIN or Timeout
    if (req.action === "AUTH_FAILED") {
        authPending = false;
        lockdownActive = true; // Start screaming
        forceRedirectToBlock();
    }
});

// 2. WATCH FOR MOVEMENT (15 Seconds Idle)
chrome.idle.setDetectionInterval(15);

chrome.idle.onStateChanged.addListener((newState) => {
    // If Armed + Active + Not Screaming + Not Asking for PIN
    if (sentryMode && newState === "active" && !lockdownActive && !authPending) {
        authPending = true;
        // Redirect to Yellow Unlock Screen
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            if(tabs[0]) chrome.tabs.update(tabs[0].id, { url: chrome.runtime.getURL("unlock.html") });
        });
    }
});

// 3. THE LOCKDOWN TRAP (Keeps them on Red Screen)
function forceRedirectToBlock() {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if(tabs[0]) chrome.tabs.update(tabs[0].id, { url: chrome.runtime.getURL("blocked.html") });
    });
}

// Monitor tab switching to force redirect if locked
chrome.tabs.onActivated.addListener(async (activeInfo) => {
    if (lockdownActive) {
        const blockUrl = chrome.runtime.getURL("blocked.html");
        chrome.tabs.get(activeInfo.tabId, (tab) => {
            if (tab.url !== blockUrl) chrome.tabs.update(activeInfo.tabId, { url: blockUrl });
        });
    }
});

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (lockdownActive && changeInfo.status === 'complete') {
        const blockUrl = chrome.runtime.getURL("blocked.html");
        if (tab.url !== blockUrl) chrome.tabs.update(tabId, { url: blockUrl });
    }
});
