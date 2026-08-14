// --- SYSTEM BOOT & USER REGISTRATION ---

let myEmail = null;
let currentFunds = 0;
let localVideoTrack = null;
let isCameraOn = false;

window.addEventListener('DOMContentLoaded', () => {
    const savedEmail = localStorage.getItem('cybernetEmail');
    
    if (!savedEmail) {
        document.getElementById('setup-modal').classList.remove('hidden');
        document.getElementById('username-input').focus();
    } else {
        myEmail = savedEmail;
        document.getElementById('user-email-display').innerText = savedEmail.toUpperCase();
        bootNetworkListeners();
    }
});

function registerUser() {
    const input = document.getElementById('username-input').value.trim();
    if (input === "") return;
    
    const formattedName = input.toLowerCase().replace(/[^a-z0-9]/g, '');
    const newEmail = `${formattedName}@cybernet.com`;
    
    localStorage.setItem('cybernetEmail', newEmail);
    myEmail = newEmail;
    
    document.getElementById('user-email-display').innerText = newEmail.toUpperCase();
    document.getElementById('setup-modal').classList.add('hidden');
    
    const dynamicEmails = document.querySelectorAll('.dynamic-user-email');
    dynamicEmails.forEach(el => el.innerText = newEmail.toLowerCase());
    
    bootNetworkListeners();
}

function handleSetupEnter(event) {
    if (event.key === 'Enter') {
        registerUser();
    }
}

// Boot internal network systems only after user is registered
function bootNetworkListeners() {
    initEmailWiretap();
    initBankWiretap();
    initCallWiretap();
    checkDevStatus();
}

function checkDevStatus() {
    const adminTab = document.getElementById('tab-admin');
    if (!adminTab) return;

    if (myEmail === 'yari@cybernet.com') {
        adminTab.style.display = 'block';
        initTribunalWiretap(); // Start listening for Netwatch reports
    } else {
        adminTab.style.display = 'none';
    }
}

// --- TAB NAVIGATION SYSTEM ---

function switchView(viewName) {
    const netView = document.getElementById('net-view');
    const msgView = document.getElementById('messages-view');
    const adminView = document.getElementById('admin-view');

    const tabNet = document.getElementById('tab-net');
    const tabMsg = document.getElementById('tab-msg');
    const tabAdmin = document.getElementById('tab-admin');

    // Hide all views
    if (netView) netView.style.display = 'none';
    if (msgView) msgView.style.display = 'none';
    if (adminView) adminView.style.display = 'none';

    // Reset active tabs
    if (tabNet) tabNet.classList.remove('active');
    if (tabMsg) tabMsg.classList.remove('active');
    if (tabAdmin) tabAdmin.classList.remove('active');

    if (viewName === 'net') {
        netView.style.display = 'grid'; 
        tabNet.classList.add('active');
    } else if (viewName === 'messages') {
        msgView.style.display = 'flex'; 
        tabMsg.classList.add('active');
        switchFolder('inbox');
    } else if (viewName === 'admin') {
        adminView.style.display = 'flex';
        tabAdmin.classList.add('active');
    }
}

function launchApp(appName) {
    console.log("Initializing connection to: " + appName);
    alert(`[SYSTEM OVERRIDE]\nAttempting to access ${appName} database...\nAccess Granted.`);
}


// --- AUDIO ENGINE SETUP ---
const audioPlayer = new Audio();
let currentVolume = 1.0;
audioPlayer.volume = currentVolume;

let activeStationIndex = null;
let activeSongIndex = null;

const stations = [
    { freq: "", name: "No Station", songs: [], cover: "" },
    { freq: "88.9", name: "PACIFIC DREAMS", songs: ["Pacific Dreams/Delicate Weapon.mp3", "Pacific Dreams/My Lullaby for You.mp3", "Pacific Dreams/Night City.mp3"], cover: "PacificDreamsIcon.jpg" },
    { freq: "89.3", name: "RADIO VEXELSTROM", songs: ["Vexelstorm/Kill the Messenger.mp3", "Vexelstorm/Resist and Disorder.mp3", "Vexelstorm/Night City Aliens.mp3", "Vexelstorm/Never Stop Me.mp3"], cover: "VexelstormIcon.jpg" },
    { freq: "89.7", name: "ROYAL BLUE", songs: ["Royal Blue/Generique.mp3", "Royal Blue/Impressions.mp3", "Royal Blue/'Round Midnight.mp3", "Royal Blue/You Don't Know What Love Is.mp3"], cover: "RoyalBlueIcon.jpg" },
    { freq: "98.7", name: "BODY HEAT RADIO", songs: ["Body Heat/Friday Night Fire Fight.mp3", "Body Heat/I Really Want to Stay at Your House.mp3", "Body Heat/On My Way to Hell.mp3", "Body Heat/Who's Ready for Tomorrow.mp3"], cover: "BodyHeat.jpg" }
];

function openRadio() {
    document.getElementById('radio-modal').classList.remove('hidden');
    renderStationList();
}

function closeRadio() {
    document.getElementById('radio-modal').classList.add('hidden');
}

function renderStationList() {
    const listContainer = document.getElementById('station-list');
    listContainer.innerHTML = ''; 

    stations.forEach((station, index) => {
        const div = document.createElement('div');
        div.className = 'station-item';
        div.innerHTML = `<span>${station.freq}</span> ${station.name}`;
        
        div.onclick = () => {
            document.querySelectorAll('.station-item').forEach(el => el.classList.remove('active'));
            div.classList.add('active');
            playStation(index);
        };
        listContainer.appendChild(div);
    });
}

function playStation(stationIndex) {
    const station = stations[stationIndex];
    activeStationIndex = stationIndex; 
    
    if (station.songs.length === 0) {
        document.getElementById('now-playing-title').innerText = "RADIO OFF";
        audioPlayer.pause();
        audioPlayer.currentTime = 0;
        document.getElementById('radio-art').style.backgroundImage = 'none';
        activeSongIndex = null; 
        return;
    }
    
    let newSongIndex = Math.floor(Math.random() * station.songs.length);
    if (station.songs.length > 1 && newSongIndex === activeSongIndex) {
        newSongIndex = (newSongIndex + 1) % station.songs.length;
    }
    activeSongIndex = newSongIndex;
    const selectedSong = station.songs[activeSongIndex];

    document.getElementById('now-playing-title').innerText = `${station.name} - ${selectedSong.replace('.mp3', '').toUpperCase()}`;
    const artDiv = document.getElementById('radio-art');
    if (station.cover) {
        artDiv.style.backgroundImage = `url('radio/${station.cover}')`;
    } else {
        artDiv.style.backgroundImage = 'none'; 
    }

    audioPlayer.src = `radio/${selectedSong}`;
    audioPlayer.play().catch(e => {
        console.error("Playback failed:", e);
        document.getElementById('now-playing-title').innerText = "ERROR: FILE NOT FOUND";
    });
}

function adjustVolume(change) {
    currentVolume += change;
    if (currentVolume > 1.0) currentVolume = 1.0;
    if (currentVolume < 0.0) currentVolume = 0.0;
    audioPlayer.volume = currentVolume;
    document.getElementById('vol-display').innerText = `${Math.round(currentVolume * 100)}%`;
}

audioPlayer.addEventListener('ended', () => {
    if (activeStationIndex !== null && stations[activeStationIndex]) {
        const station = stations[activeStationIndex];
        if (station.songs.length > 0) {
            let nextSongIndex;
            if (station.songs.length > 1) {
                do {
                    nextSongIndex = Math.floor(Math.random() * station.songs.length);
                } while (nextSongIndex === activeSongIndex);
            } else {
                nextSongIndex = 0;
            }
            activeSongIndex = nextSongIndex;
            const nextSong = station.songs[activeSongIndex];

            document.getElementById('now-playing-title').innerText = `${station.name} - ${nextSong.replace('.mp3', '').toUpperCase()}`;
            audioPlayer.src = `radio/${nextSong}`;
            audioPlayer.play().catch(e => console.error(e));
        }
    }
});


// --- GLOBAL HOVER SOUND SYSTEM ---
const uiHoverSound = new Audio('assets/HoverSound.ogg'); 
uiHoverSound.volume = 0.4; 
const allButtons = document.querySelectorAll('button, .tab, .app-item');
allButtons.forEach(btn => {
    btn.addEventListener('mouseenter', () => {
        uiHoverSound.currentTime = 0; 
        uiHoverSound.play().catch(error => {});
    });
});

const leftClickSound = new Audio('assets/ClickSound.ogg'); 
leftClickSound.volume = 0.8; 
document.addEventListener('mousedown', (event) => {
    if (event.button === 1) {
        leftClickSound.currentTime = 0;
        leftClickSound.play().catch(error => {});
    }
});


// --- AI CHAT SYSTEM (VERCEL PROXY UPLINK) ---
function openChat() {
    document.getElementById('chat-modal').classList.remove('hidden');
    document.getElementById('chat-input').focus();
}

function closeChat() {
    document.getElementById('chat-modal').classList.add('hidden');
}

function handleChatEnter(event) {
    if (event.key === 'Enter') {
        sendChatMessage();
    }
}

async function sendChatMessage() {
    const inputField = document.getElementById('chat-input');
    const messageText = inputField.value.trim();
    if (messageText === "") return;

    addMessageToUI('USER', messageText, 'user-message');
    inputField.value = ''; 

    const loadingId = addMessageToUI('OVERSEER', '[Processing...]', 'ai-message');

    try {
        const response = await fetch('/api/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message: messageText })
        });

        if (!response.ok) {
            throw new Error(`Server block: ${response.status}`);
        }

        const data = await response.json();
        document.getElementById(loadingId).remove();

        if (data.reply) {
            const msgId = addMessageToUI('OVERSEER', '', 'ai-message');
            typeWriterEffect(msgId, data.reply, 20); 
        } else {
            addMessageToUI('SYSTEM ERROR', 'No signal detected from subnet.', 'ai-message');
        }
    } catch (error) {
        console.error("API Error:", error);
        document.getElementById(loadingId).remove();
        addMessageToUI('SYSTEM ERROR', 'Connection to mainframe lost. Check ICE blocks.', 'ai-message');
    }
}

function addMessageToUI(sender, text, cssClass) {
    const chatHistory = document.getElementById('chat-history');
    const msgDiv = document.createElement('div');
    msgDiv.className = `message ${cssClass}`;
    
    const uniqueId = 'msg-' + Date.now();
    msgDiv.id = uniqueId;
    msgDiv.innerHTML = `<span class="sender">${sender}:</span> <span class="message-content">${text}</span>`;
    
    chatHistory.appendChild(msgDiv);
    chatHistory.scrollTop = chatHistory.scrollHeight;
    
    return uniqueId;
}

function typeWriterEffect(elementId, text, speed) {
    const contentSpan = document.querySelector(`#${elementId} .message-content`);
    let i = 0;
    contentSpan.innerHTML = ''; 

    const typing = setInterval(() => {
        if (i < text.length) {
            contentSpan.innerHTML += text.charAt(i);
            i++;
            const chatHistory = document.getElementById('chat-history');
            chatHistory.scrollTop = chatHistory.scrollHeight;
        } else {
            clearInterval(typing);
        }
    }, speed);
}


// --- BIOTECHNICA REAL-TIME WEATHER SYSTEM ---
function openWeather() {
    document.getElementById('weather-modal').classList.remove('hidden');
    document.getElementById('condition-display').innerText = "LINKING TO SATELLITE...";
    document.getElementById('condition-display').style.color = "#33ff33";
    fetchRealWeather();
}

function closeWeather() {
    document.getElementById('weather-modal').classList.add('hidden');
}

async function fetchRealWeather() {
    const lat = 47.45;
    const lon = 8.80;
    
    try {
        const response = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true`);
        const data = await response.json();
        
        const realTemp = Math.round(data.current_weather.temperature);
        const weatherCode = data.current_weather.weathercode;
        
        let cyberpunkCondition = "UNKNOWN";
        let conditionColor = "#33ff33";
        let aqi = Math.floor(Math.random() * 40) + 10; 
        let rads = (Math.random() * 1.5).toFixed(1);

        if (weatherCode === 0) { cyberpunkCondition = "CLEAR SKY"; conditionColor = "#33ff33"; } 
        else if (weatherCode >= 1 && weatherCode <= 3) { cyberpunkCondition = "HEAVY SMOG"; conditionColor = "#ffcc00"; aqi += 40; } 
        else if (weatherCode === 45 || weatherCode === 48) { cyberpunkCondition = "TOXIC FOG"; conditionColor = "#ffcc00"; aqi += 80; } 
        else if ((weatherCode >= 51 && weatherCode <= 67) || (weatherCode >= 80 && weatherCode <= 82)) { cyberpunkCondition = "ACID RAIN"; conditionColor = "#ff2a2a"; rads = (Math.random() * 3 + 2).toFixed(1); } 
        else if (weatherCode >= 71 && weatherCode <= 86) { cyberpunkCondition = "NUCLEAR WINTER"; conditionColor = "#00f0ff"; } 
        else if (weatherCode >= 95) { cyberpunkCondition = "RAD-STORM"; conditionColor = "#ff2a2a"; rads = (Math.random() * 8 + 5).toFixed(1); }

        document.querySelector('.location-tag').innerText = "NODE: ZELL, ZURICH (CH)";
        document.getElementById('temp-display').innerText = `${realTemp}°C`;
        
        const conditionEl = document.getElementById('condition-display');
        conditionEl.innerText = cyberpunkCondition;
        conditionEl.style.color = conditionColor;
        document.getElementById('aqi-display').innerText = aqi;
        document.getElementById('rad-display').innerText = `${rads} Sv`;
        
        const rainProb = (cyberpunkCondition === "ACID RAIN" || cyberpunkCondition === "NUCLEAR WINTER" || cyberpunkCondition === "RAD-STORM") ? 100 : Math.floor(Math.random() * 15);
        document.getElementById('rain-display').innerText = `${rainProb}%`;

    } catch (error) {
        console.error("Satellite uplink failed:", error);
        document.getElementById('condition-display').innerText = "SENSOR OFFLINE";
        document.getElementById('condition-display').style.color = "#ff2a2a";
    }
}

// --- FIREBASE INITIALIZATION ---
const firebaseConfig = {
  apiKey: "AIzaSyCrLr7l2F89qzqV3Xmn1P6NLJ6nl_HSOPU",
  authDomain: "keystone-cybernet.firebaseapp.com",
  databaseURL: "https://keystone-cybernet-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "keystone-cybernet",
  storageBucket: "keystone-cybernet.firebasestorage.app",
  messagingSenderId: "510405488684",
  appId: "1:510405488684:web:db3b484dbfa013e665a189",
  measurementId: "G-JZXW6HR4NP"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();


// --- BANKING & EDDIES SYSTEM ---

function openBank() {
    document.getElementById('bank-modal').classList.remove('hidden');
}

function closeBank() {
    document.getElementById('bank-modal').classList.add('hidden');
}

let isFirstLoad = true;
let lastHackedTimestamp = null; 
let lockdownTimerInterval = null; // NEW: Timer for Netwatch lockdown

function initBankWiretap() {
    const userDocRef = db.collection('users').doc(myEmail);
    
    userDocRef.onSnapshot(doc => {
        if (doc.exists) {
            const data = doc.data();
            const newBalance = data.balance;
            
            // --- HACK DETECTION ---
            if (!isFirstLoad && data.wasHacked && data.wasHacked !== lastHackedTimestamp) {
                triggerHackAlarm();
            }
            lastHackedTimestamp = data.wasHacked || null;

            // --- NEW: NETWATCH LOCKDOWN WATCHER ---
            if (data.lockdownUntil && data.lockdownUntil > Date.now()) {
                triggerLockdown(data.lockdownUntil);
            } else {
                clearLockdown();
            }

            if (isFirstLoad) {
                isFirstLoad = false;
                currentFunds = newBalance;
                updateDisplays(newBalance);
            } else if (currentFunds !== newBalance) {
                const difference = newBalance - currentFunds;
                animateTransactionOverlay(difference);
                animateCounter(currentFunds, newBalance);
                currentFunds = newBalance;
            }
        } else {
            userDocRef.set({ balance: 1000 }).catch(e => console.error(e));
        }
    });
}

function triggerHackAlarm() {
    document.body.classList.add('hacked-theme');
    
    const headers = document.querySelectorAll('.brand, .url');
    headers.forEach(el => el.classList.add('blink-text'));

    setTimeout(() => {
        document.body.classList.remove('hacked-theme');
        headers.forEach(el => el.classList.remove('blink-text'));
    }, 10000);
}

// --- NEW: LOCKDOWN LOGIC ---
function triggerLockdown(endTime) {
    document.getElementById('lockdown-overlay').classList.remove('hidden');
    if (lockdownTimerInterval) clearInterval(lockdownTimerInterval);

    lockdownTimerInterval = setInterval(() => {
        const now = Date.now();
        const diff = endTime - now;
        
        if (diff <= 0) {
            clearLockdown();
            db.collection('users').doc(myEmail).set({ lockdownUntil: 0 }, { merge: true });
        } else {
            const minutes = Math.floor(diff / 60000);
            const seconds = Math.floor((diff % 60000) / 1000);
            document.getElementById('lockdown-timer').innerText = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
        }
    }, 1000);
}

function clearLockdown() {
    document.getElementById('lockdown-overlay').classList.add('hidden');
    if (lockdownTimerInterval) clearInterval(lockdownTimerInterval);
}

async function payBailout() {
    if (currentFunds < 1000) {
        alert("[NETWATCH ALERT] INSUFFICIENT FUNDS. YOU REMAIN IN LOCKDOWN.");
        return;
    }
    
    try {
        const userRef = db.collection('users').doc(myEmail);
        
        await db.runTransaction(async (transaction) => {
            const doc = await transaction.get(userRef);
            const bal = doc.data().balance;
            
            if (bal < 1000) throw "Insufficient funds";
            
            // Deduct funds and remove the lockdown timestamp
            transaction.set(userRef, { balance: bal - 1000, lockdownUntil: 0 }, { merge: true });
        });
        
        alert("[NETWATCH ALERT] BAILOUT PAYMENT ACCEPTED. SYSTEM RESTORED.");
        clearLockdown();
    } catch (error) {
        console.error(error);
        alert("[SYSTEM ERROR] Transaction failed. Lockdown remains active.");
    }
}


function updateDisplays(val) {
    const displayString = `${val.toLocaleString()} €$`;
    const topDisplay = document.getElementById('user-funds-display');
    const bankDisplay = document.getElementById('bank-main-balance');
    
    if (topDisplay) {
        topDisplay.innerText = displayString;
        if (val < 0) {
            topDisplay.classList.add('negative-funds');
        } else {
            topDisplay.classList.remove('negative-funds');
        }
    }
    
    if (bankDisplay) {
        bankDisplay.innerText = displayString;
        if (val < 0) {
            bankDisplay.classList.add('negative-funds');
        } else {
            bankDisplay.classList.remove('negative-funds');
        }
    }
}

function animateCounter(startVal, endVal) {
    const duration = 1500;
    const startTime = performance.now();
    
    function updateCounter(currentTime) {
        const elapsedTime = currentTime - startTime;
        const progress = Math.min(elapsedTime / duration, 1);
        const easeProgress = 1 - Math.pow(1 - progress, 3);
        const currentDisplayVal = Math.floor(startVal + (endVal - startVal) * easeProgress);
        
        updateDisplays(currentDisplayVal);
        
        if (progress < 1) {
            requestAnimationFrame(updateCounter);
        } else {
            updateDisplays(endVal);
        }
    }
    requestAnimationFrame(updateCounter);
}

function animateTransactionOverlay(difference) {
    const overlay = document.getElementById('transaction-overlay');
    const textElement = document.getElementById('transaction-text');
    
    if (!overlay || !textElement) return;

    textElement.className = '';
    void textElement.offsetWidth;

    if (difference > 0) {
        textElement.innerText = `+${difference.toLocaleString()} €$`;
        textElement.classList.add('transact-up');
    } else {
        textElement.innerText = `${difference.toLocaleString()} €$`;
        textElement.classList.add('transact-down');
    }
    
    overlay.classList.remove('hidden');
    
    setTimeout(() => {
        overlay.classList.add('hidden');
    }, 2000);
}

// --- REAL-TIME CLOUD EMAIL SYSTEM ---
let emailDatabase = [];
let currentFolder = 'inbox';

function initEmailWiretap() {
    db.collection("emails")
        .where("participants", "array-contains", myEmail)
        .onSnapshot((snapshot) => {
            emailDatabase = [];
            
            snapshot.forEach((doc) => {
                const data = doc.data();
                data.id = doc.id; 
                data.folder = (data.from === myEmail) ? 'sent' : 'inbox';
                emailDatabase.push(data);
            });

            emailDatabase.sort((a, b) => b.timestamp - a.timestamp);

            if (document.getElementById('messages-view').style.display !== 'none') {
                renderEmailList();
            }
        });
}

function switchFolder(folderName) {
    currentFolder = folderName;
    
    const inboxTab = document.getElementById('folder-inbox');
    const sentTab = document.getElementById('folder-sent');
    
    if (inboxTab) inboxTab.classList.remove('active');
    if (sentTab) sentTab.classList.remove('active');
    
    const activeTab = document.getElementById('folder-' + folderName);
    if (activeTab) activeTab.classList.add('active');
    
    document.getElementById('mail-placeholder').style.display = 'block';
    document.getElementById('active-email-view').style.display = 'none';
    document.getElementById('compose-view').style.display = 'none';
    
    renderEmailList();
}

function renderEmailList() {
    const listContainer = document.getElementById('dynamic-mail-list');
    if (!listContainer) return;
    listContainer.innerHTML = ''; 
    
    const filteredEmails = emailDatabase.filter(email => email.folder === currentFolder);
    
    if (filteredEmails.length === 0) {
        listContainer.innerHTML = `<div class="empty-inbox-msg">NO DATASHARDS FOUND.</div>`;
        return;
    }
    
    filteredEmails.forEach(email => {
        const itemDiv = document.createElement('div');
        const isRead = currentFolder === 'sent' ? true : email.read;
        itemDiv.className = `mail-item ${isRead ? '' : 'unread'}`;
        
        const displayEntity = currentFolder === 'sent' ? `TO: ${email.to}` : email.from;
        
        itemDiv.innerHTML = `
            <div class="mail-sender">${displayEntity}</div>
            <div class="mail-subject">${email.subject}</div>
            <div class="mail-preview">${email.body.substring(0, 35)}...</div>
        `;
        
        itemDiv.onclick = () => openSpecificEmail(email.id);
        listContainer.appendChild(itemDiv);
    });
}

function openSpecificEmail(emailId) {
    const email = emailDatabase.find(e => e.id === emailId);
    if (!email) return;
    
    if (email.folder === 'inbox' && email.read === false) {
        db.collection("emails").doc(emailId).update({ read: true });
    }
    
    document.getElementById('mail-placeholder').style.display = 'none';
    document.getElementById('compose-view').style.display = 'none';
    document.getElementById('active-email-view').style.display = 'block';
    
    document.getElementById('read-subject').innerText = email.subject;
    document.getElementById('read-from').innerText = `FROM: ${email.from}`;
    document.getElementById('read-to').innerText = `TO: ${email.to}`;
    
    let finalBodyHTML = email.body.replace(/\n/g, '<br>');
    if (email.attachedFunds > 0) {
        finalBodyHTML = `<div style="color: #ffcc00; border: 1px dashed #ffcc00; padding: 10px; margin-bottom: 15px;">
            <strong>[ENCRYPTED TRANSACTION DETECTED]</strong><br>
            FUNDS TRANSFERRED: ${email.attachedFunds.toLocaleString()} €$
        </div>` + finalBodyHTML;
    }
    
    document.getElementById('read-body').innerHTML = finalBodyHTML;
    renderEmailList();
}

function openCompose() {
    document.getElementById('mail-placeholder').style.display = 'none';
    document.getElementById('active-email-view').style.display = 'none';
    document.getElementById('compose-view').style.display = 'flex';
    
    document.getElementById('compose-to').value = '';
    document.getElementById('compose-subject').value = '';
    document.getElementById('compose-body').value = '';
    document.getElementById('compose-eddies').value = '';
}

async function sendOutboundEmail() {
    let toField = document.getElementById('compose-to').value.trim().toLowerCase();
    
    if (toField !== '' && !toField.includes('@')) {
        toField = toField + '@cybernet.com';
    }

    const subjectField = document.getElementById('compose-subject').value.trim();
    const bodyField = document.getElementById('compose-body').value.trim();
    const transferAmount = parseInt(document.getElementById('compose-eddies').value) || 0;
    
    if (toField === '' || bodyField === '') {
        alert("[SYSTEM ERROR] Cannot transmit. Missing recipient or datastream.");
        return;
    }

    if (transferAmount > currentFunds) {
        alert("[BANK ERROR] Insufficient funds. You don't have enough eddies.");
        return;
    }
    
    try {
        if (transferAmount > 0) {
            const senderRef = db.collection('users').doc(myEmail);
            const receiverRef = db.collection('users').doc(toField);

            await db.runTransaction(async (transaction) => {
                const senderDoc = await transaction.get(senderRef);
                const receiverDoc = await transaction.get(receiverRef);

                let senderBalance = senderDoc.exists ? senderDoc.data().balance : 1000;
                let receiverBalance = receiverDoc.exists ? receiverDoc.data().balance : 1000;

                if (senderBalance < transferAmount) {
                    throw "Insufficient funds";
                }

                transaction.set(senderRef, { balance: senderBalance - transferAmount }, { merge: true });
                transaction.set(receiverRef, { balance: receiverBalance + transferAmount }, { merge: true });
            });
        }

        await db.collection("emails").add({
            from: myEmail,
            to: toField,
            participants: [myEmail, toField],
            subject: subjectField !== '' ? subjectField : '<NO SUBJECT>',
            body: bodyField,
            timestamp: Date.now(),
            read: false,
            attachedFunds: transferAmount
        });
        
        switchFolder('sent');

    } catch (error) {
        console.error("Error processing request: ", error);
        alert("[SYSTEM OVERLOAD] Connection to server failed.");
    }
}

// ==========================================
// --- WEBRTC SECURE VOICELINK SYSTEM ---
// ==========================================

const ringtoneAudio = new Audio('assets/RingTone.mp3'); 
ringtoneAudio.loop = true; 

let peerConnection = null;
let localStream = null;
let remoteStream = null;
let currentCallId = null;

const rtcConfig = {
    iceServers: [
        { urls: ['stun:stun1.l.google.com:19302', 'stun:stun2.l.google.com:19302'] }
    ]
};

function openCallPrompt() {
    document.getElementById('call-target-input').value = '';
    document.getElementById('call-prompt-modal').classList.remove('hidden');
    document.getElementById('call-target-input').focus();
}

function closeCallPrompt() {
    document.getElementById('call-prompt-modal').classList.add('hidden');
}

async function submitCallAlias() {
    let target = document.getElementById('call-target-input').value.toLowerCase().trim();
    
    if (target !== '' && !target.includes('@')) {
        target = target + '@cybernet.com';
    }
    
    if (!target || target === myEmail) {
        alert("INVALID ALIAS.");
        return;
    }
    
    closeCallPrompt();
    
    localStream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
    document.getElementById('local-audio').srcObject = localStream;

    const callDoc = db.collection('calls').doc();
    currentCallId = callDoc.id;

    peerConnection = new RTCPeerConnection(rtcConfig);
    setupPeerConnection(callDoc, true); 

    const offerDescription = await peerConnection.createOffer();
    await peerConnection.setLocalDescription(offerDescription);

    const offer = { sdp: offerDescription.sdp, type: offerDescription.type };

    await callDoc.set({
        callerEmail: myEmail,
        targetEmail: target,
        offer: offer,
        status: 'ringing'
    });

    showHolocallUI("CALLING...", target, false);

    callDoc.onSnapshot(snapshot => {
        const data = snapshot.data();
        if (!peerConnection.currentRemoteDescription && data?.answer) {
            document.getElementById('holocall-status').innerText = "CONNECTED";
            document.getElementById('holocall-status').classList.remove('blink-text');
            const answerDescription = new RTCSessionDescription(data.answer);
            peerConnection.setRemoteDescription(answerDescription);
        }
    });

    listenForCallEnd(currentCallId);
}

async function toggleCamera() {
    if (!peerConnection || !currentCallId) return;
    
    const camBtn = document.getElementById('cam-toggle-btn');
    const videoTransceiver = peerConnection.getTransceivers().find(t => t.receiver.track.kind === 'video');
    const videoSender = videoTransceiver ? videoTransceiver.sender : null;

    const callDocRef = db.collection('calls').doc(currentCallId);
    const callData = (await callDocRef.get()).data();
    const amICaller = (callData.callerEmail === myEmail);

    if (!isCameraOn) {
        try {
            const camStream = await navigator.mediaDevices.getUserMedia({ video: true });
            localVideoTrack = camStream.getVideoTracks()[0];
            
            if (videoSender) {
                await videoSender.replaceTrack(localVideoTrack);
            }
            
            isCameraOn = true;
            camBtn.innerText = "CAM: ON";
            camBtn.classList.add('active');

            await callDocRef.update({ [amICaller ? 'callerCam' : 'targetCam']: true });
        } catch (err) {
            console.error("Camera access error:", err);
            alert("[OPTICS ERROR] Could not access local camera feed.");
        }
    } else {
        if (localVideoTrack) {
            localVideoTrack.stop();
            localVideoTrack = null;
        }
        
        if (videoSender) {
            await videoSender.replaceTrack(null);
        }
        
        isCameraOn = false;
        camBtn.innerText = "CAM: OFF";
        camBtn.classList.remove('active');

        await callDocRef.update({ [amICaller ? 'callerCam' : 'targetCam']: false });
    }
}

function initCallWiretap() {
    db.collection('calls').where('targetEmail', '==', myEmail).where('status', '==', 'ringing')
        .onSnapshot(snapshot => {
            snapshot.docChanges().forEach(change => {
                if (change.type === 'added') {
                    const callData = change.doc.data();
                    currentCallId = change.doc.id;
                    
                    showHolocallUI("INCOMING CALL", callData.callerEmail, true);
                    ringtoneAudio.play().catch(e => console.log("Autoplay blocked."));
                    
                    listenForCallEnd(currentCallId);
                }
            });
        });
}

function showHolocallUI(statusText, aliasText, isIncoming) {
    document.getElementById('holocall-status').innerText = statusText;
    document.getElementById('holocall-status').classList.add('blink-text');
    document.getElementById('holocall-alias').innerText = aliasText;
    
    document.getElementById('holocall-ui').classList.remove('hidden');
    
    if (isIncoming) {
        document.getElementById('holocall-incoming-controls').classList.remove('hidden');
        document.getElementById('holocall-active-controls').classList.add('hidden');
    } else {
        document.getElementById('holocall-incoming-controls').classList.add('hidden');
        document.getElementById('holocall-active-controls').classList.remove('hidden');
    }
}

async function answerCall() {
    ringtoneAudio.pause();
    ringtoneAudio.currentTime = 0;
    
    document.getElementById('holocall-incoming-controls').classList.add('hidden');
    document.getElementById('holocall-active-controls').classList.remove('hidden');
    document.getElementById('holocall-status').innerText = "CONNECTED";
    document.getElementById('holocall-status').classList.remove('blink-text');

    const callDoc = db.collection('calls').doc(currentCallId);
    const callData = (await callDoc.get()).data();

    localStream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
    document.getElementById('local-audio').srcObject = localStream;

    peerConnection = new RTCPeerConnection(rtcConfig);
    setupPeerConnection(callDoc, false);

    const offerDescription = callData.offer;
    await peerConnection.setRemoteDescription(new RTCSessionDescription(offerDescription));

    const videoTransceiver = peerConnection.getTransceivers().find(t => t.receiver.track.kind === 'video');
    if (videoTransceiver) {
        videoTransceiver.direction = 'sendrecv';
    }

    const answerDescription = await peerConnection.createAnswer();
    await peerConnection.setLocalDescription(answerDescription);

    const answer = { type: answerDescription.type, sdp: answerDescription.sdp };

    await callDoc.update({ answer: answer, status: 'answered' });
}

async function declineCall() {
    if (currentCallId) {
        await db.collection('calls').doc(currentCallId).delete().catch(e => console.error(e));
    }
    stopCallCleanup();
}

async function hangUp() {
    if (currentCallId) {
        await db.collection('calls').doc(currentCallId).delete().catch(e => console.error(e));
    }
    stopCallCleanup();
}

function listenForCallEnd(callId) {
    db.collection('calls').doc(callId).onSnapshot(doc => {
        if (!doc.exists) {
            stopCallCleanup();
        } else {
            const data = doc.data();
            const remoteVid = document.getElementById('remote-video');
            const placeholderImg = document.getElementById('holocall-placeholder-img');
            
            const amICaller = (data.callerEmail === myEmail);
            const isRemoteCamOn = amICaller ? data.targetCam : data.callerCam;

            if (isRemoteCamOn) {
                remoteVid.classList.remove('hidden');
                placeholderImg.classList.add('hidden');
            } else {
                remoteVid.classList.add('hidden');
                placeholderImg.classList.remove('hidden');
            }
        }
    });
}

function stopCallCleanup() {
    ringtoneAudio.pause();
    ringtoneAudio.currentTime = 0;
    
    document.getElementById('holocall-ui').classList.add('hidden');
    document.getElementById('remote-video').classList.add('hidden');
    document.getElementById('holocall-placeholder-img').classList.remove('hidden');
    
    const camBtn = document.getElementById('cam-toggle-btn');
    if (camBtn) {
        camBtn.innerText = "CAM: OFF";
        camBtn.classList.remove('active');
    }

    if (localVideoTrack) {
        localVideoTrack.stop();
        localVideoTrack = null;
    }
    isCameraOn = false;

    if (peerConnection) peerConnection.close();
    if (localStream) localStream.getTracks().forEach(t => t.stop());
    
    peerConnection = null;
    localStream = null;
    remoteStream = null;
    currentCallId = null;
}

function setupPeerConnection(callDoc, isCaller) {
    localStream.getTracks().forEach(track => {
        peerConnection.addTrack(track, localStream);
    });

    if (isCaller) {
        peerConnection.addTransceiver('video', { direction: 'sendrecv' });
    }

    remoteStream = new MediaStream();
    
    peerConnection.ontrack = event => {
        if (event.track.kind === 'audio') {
            remoteStream.addTrack(event.track);
            document.getElementById('remote-audio').srcObject = remoteStream;
        } else if (event.track.kind === 'video') {
            const remoteVid = document.getElementById('remote-video');
            remoteStream.addTrack(event.track);
            remoteVid.srcObject = remoteStream;
        }
    };

    const callerCandidatesCollection = callDoc.collection('callerCandidates');
    const calleeCandidatesCollection = callDoc.collection('calleeCandidates');

    peerConnection.onicecandidate = event => {
        if (!event.candidate) return;
        const targetCollection = isCaller ? callerCandidatesCollection : calleeCandidatesCollection;
        targetCollection.add(event.candidate.toJSON());
    };

    const remoteCandidatesCollection = isCaller ? calleeCandidatesCollection : callerCandidatesCollection;
    remoteCandidatesCollection.onSnapshot(snapshot => {
        snapshot.docChanges().forEach(change => {
            if (change.type === 'added') {
                const candidate = new RTCIceCandidate(change.doc.data());
                peerConnection.addIceCandidate(candidate);
            }
        });
    });
}

// ==========================================
// --- DEVELOPER OVERRIDE FUNCTIONS ---
// ==========================================

async function devPurgeAllMessages() {
    if (myEmail !== 'yari@cybernet.com') return;
    
    if (!confirm("[MAINFRAME WARNING]\nAre you sure you want to permanently delete ALL datashards from the database?")) {
        return;
    }

    try {
        const snapshot = await db.collection("emails").get();
        const batch = db.batch();
        
        snapshot.docs.forEach((doc) => {
            batch.delete(doc.ref);
        });

        await batch.commit();
        alert("[MAINFRAME PURGE COMPLETE] All datashards wiped from database.");
    } catch (error) {
        console.error("Purge error:", error);
        alert("[PURGE ERROR] Connection rejected by database ICE.");
    }
}

async function devModifyFunds() {
    if (myEmail !== 'yari@cybernet.com') return;

    let target = document.getElementById('dev-target-user').value.trim().toLowerCase();
    const amount = parseInt(document.getElementById('dev-funds-amount').value);

    if (!target || isNaN(amount)) {
        alert("[DEV ERROR] Enter a valid target alias and integer amount.");
        return;
    }

    if (!target.includes('@')) {
        target = target + '@cybernet.com';
    }

    try {
        const userRef = db.collection('users').doc(target);
        const doc = await userRef.get();

        let currentBal = doc.exists ? doc.data().balance : 1000;
        let newBal = currentBal + amount;
        if (newBal < 0) newBal = 0;

        await userRef.set({ balance: newBal }, { merge: true });
        
        alert(`[TRANSACTION SUCCESSFUL]\nUpdated ${target}'s balance to: ${newBal.toLocaleString()} €$`);
        
        document.getElementById('dev-target-user').value = '';
        document.getElementById('dev-funds-amount').value = '';

    } catch (error) {
        console.error("Fund modification error:", error);
        alert("[DEV ERROR] Could not override target account balance.");
    }
} 

// ==========================================
// --- NEW: NETWATCH REPORTING SYSTEM ---
// ==========================================

function openReportModal() {
    document.getElementById('report-modal').classList.remove('hidden');
    document.getElementById('report-target-input').value = '';
    document.getElementById('report-target-input').focus();
}

function closeReportModal() {
    document.getElementById('report-modal').classList.add('hidden');
}

async function submitReport() {
    let target = document.getElementById('report-target-input').value.trim().toLowerCase();
    
    if (target !== '' && !target.includes('@')) {
        target = target + '@cybernet.com';
    }

    if (!target) {
        alert("Please enter a valid target alias.");
        return;
    }

    try {
        await db.collection('reports').add({
            reporter: myEmail,
            suspect: target,
            timestamp: Date.now()
        });
        
        alert("[NETWATCH UPLINK] Report successfully submitted to Tribunal for review.");
        closeReportModal();
    } catch (error) {
        console.error("Error submitting report:", error);
        alert("[SYSTEM ERROR] Could not connect to Netwatch servers.");
    }
}

// --- ADMIN TRIBUNAL LOGIC ---

function initTribunalWiretap() {
    if (myEmail !== 'yari@cybernet.com') return;

    db.collection('reports').onSnapshot(snapshot => {
        const listContainer = document.getElementById('admin-reports-list');
        if (!listContainer) return;

        listContainer.innerHTML = '';
        
        if (snapshot.empty) {
            listContainer.innerHTML = '<div style="color: #fff; opacity: 0.6; font-size: 0.9rem;">NO ACTIVE CASES.</div>';
            return;
        }

        snapshot.forEach(doc => {
            const data = doc.data();
            const caseId = doc.id.substring(0, 6).toUpperCase();
            
            listContainer.innerHTML += `
                <div class="admin-report-card">
                    <div class="admin-report-header">CASE ID: #${caseId}</div>
                    <div class="admin-report-body">
                        <strong>SUSPECT:</strong> ${data.suspect}<br>
                        <strong style="color: rgba(255,255,255,0.5);">REPORTER:</strong> <span style="color: rgba(255,255,255,0.5);">${data.reporter}</span>
                    </div>
                    <div class="admin-report-actions">
                        <button class="btn-punish" onclick="punishUser('${doc.id}', '${data.suspect}')">LOCKDOWN (20m)</button>
                        <button class="btn-dismiss" onclick="dismissReport('${doc.id}')">DISMISS</button>
                    </div>
                </div>
            `;
        });
    });
}

async function dismissReport(reportId) {
    try {
        await db.collection('reports').doc(reportId).delete();
    } catch (e) {
        console.error("Failed to dismiss case:", e);
    }
}

async function punishUser(reportId, suspectEmail) {
    if (!confirm(`Are you sure you want to enforce a 20-minute lockdown on ${suspectEmail}?`)) return;

    // Calculate lockdown time (20 minutes from now)
    // 20 minutes * 60 seconds * 1000 milliseconds = 1200000 ms
    const lockdownTime = Date.now() + 1200000;

    try {
        // Inject the lockdown timestamp into the user's document
        await db.collection('users').doc(suspectEmail).set({ lockdownUntil: lockdownTime }, { merge: true });
        
        // Delete the report so it clears from the tribunal
        await db.collection('reports').doc(reportId).delete();
        
        alert(`[TRIBUNAL ENFORCED] ${suspectEmail} is now locked down.`);
    } catch (e) {
        console.error("Failed to enforce punishment:", e);
        alert("[DEV ERROR] Could not execute lockdown protocol.");
    }
}