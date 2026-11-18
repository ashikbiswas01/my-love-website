// =========================
// QUESTIONS (Edit Only This)
// =========================

const questions = [
    "Hey...❤️",
    "Tmr kache ekta proshno chilo...🥺",
    "Tmi ki amar sathe protidin kotha bolbe? 😊",
    "Tmr ki mone hoy amader golpota ekhan theke suru howa uchit? 💕",
    "Tmi ki amar sathe onek shundor memory create korbe? 🌸",
    "Last Question...🥹<br><br>Amar Hobe? ❤️"
];

// =========================
// SETUP
// =========================

const $ = (id) => document.getElementById(id);
const body = document.body;
const title = $("title");
const message = $("message");
const buttons = $("buttons");
const yesBtn = $("yesBtn");
const noBtn = $("noBtn");
const noSlot = $("noSlot");
const progress = $("progressBar");
const progressWrap = document.querySelector(".progress");
const fx = $("fx");
const musicBtn = $("musicBtn");
const music = $("bgMusic");
const heartsLayer = document.querySelector(".hearts");
const petalsLayer = document.querySelector(".petals");
const starsLayer = document.querySelector(".stars");

const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const rand = (a, b) => a + Math.random() * (b - a);
const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

let page = 0;
let isFinished = false;
let typingToken = 0;

// Add an element to a layer and remove it when its animation ends
function spawn(layer, el, maxMs = 12000) {
    let removed = false;
    const remove = () => { if (!removed) { removed = true; el.remove(); } };
    el.addEventListener("animationend", remove);
    setTimeout(remove, maxMs);
    layer.appendChild(el);
}

// =========================
// TYPEWRITER (emoji safe)
// =========================

function typeWriter(text, onDone, speed = 42) {
    const token = ++typingToken;
    message.textContent = "";

    const txt = document.createElement("span");
    const caret = document.createElement("span");
    caret.className = "caret";
    message.append(txt, caret);

    // Array.from keeps emoji whole (no broken characters)
    const chars = [];
    text.split("<br>").forEach((part, i) => {
        if (i > 0) chars.push("\n");
        chars.push(...Array.from(part));
    });

    const base = reduceMotion ? 8 : speed;
    let i = 0;

    (function step() {
        if (token !== typingToken) return; // a newer text started
        if (i < chars.length) {
            const c = chars[i++];
            if (c === "\n") txt.appendChild(document.createElement("br"));
            else txt.appendChild(document.createTextNode(c));
            const slow = c === "." || c === "?" || c === "," ? 3 : 1;
            setTimeout(step, base * slow);
        } else {
            caret.remove();
            if (onDone) onDone();
        }
    })();
}

// =========================
// PAGE FLOW
// =========================

function setProgress(value) {
    const pct = Math.round(value * 100);
    progress.style.width = pct + "%";
    progressWrap.setAttribute("aria-valuenow", pct);
}

function goTo(n, first = false) {
    hideButtons();

    const run = () => {
        page = n;
        body.dataset.stage = n;
        setProgress(n / (questions.length - 1));
        message.classList.remove("out");
        stageEffects(n);

        typeWriter(questions[n], () => {
            if (n === 0) setTimeout(() => !isFinished && goTo(1), 1100);
            else showButtons();
        });
    };

    if (first) run();
    else {
        message.classList.add("out");
        setTimeout(run, 450);
    }
}

function showButtons() {
    dockNo();
    buttons.hidden = false;
    noBtn.hidden = false;
    buttons.classList.remove("pop");
    void buttons.offsetWidth; // restart the pop-in animation
    buttons.classList.add("pop");
}

function hideButtons() {
    buttons.hidden = true;
    noBtn.hidden = true;
    dockNo();
}

yesBtn.addEventListener("click", () => {
    if (isFinished) return;
    if (page + 1 < questions.length) goTo(page + 1);
    else finishLove();
});

// =========================
// NO BUTTON — glides away, never leaves the screen
// =========================

const MOVE_TRANSITION = "transform 0.6s cubic-bezier(0.22, 1, 0.36, 1)";
const EDGE = 14;          // safe margin from the screen edge
let flying = false;       // true when NO is detached and floating on <body>
let pos = { x: 0, y: 0 }; // current top-left of NO (viewport px)
let lastMove = 0;
let yesGrow = 1;

// Put NO back into its normal place inside the card
function dockNo() {
    if (noBtn.parentElement !== noSlot) noSlot.appendChild(noBtn);
    noBtn.classList.remove("flying", "dodge");
    noBtn.style.transform = "";
    noBtn.style.transition = "";
    noSlot.style.width = "";
    noSlot.style.height = "";
    flying = false;
    yesGrow = 1;
    yesBtn.style.setProperty("--grow", 1);
}

function viewport() {
    return {
        w: document.documentElement.clientWidth || window.innerWidth,
        h: window.innerHeight
    };
}

function moveNo(px, py) {
    if (isFinished || noBtn.hidden) return;

    const now = performance.now();
    if (now - lastMove < 260) return;
    lastMove = now;

    const w = noBtn.offsetWidth;
    const h = noBtn.offsetHeight;

    // First dodge: lift NO out of the card (blurred cards trap fixed children)
    if (!flying) {
        const r = noBtn.getBoundingClientRect();
        noSlot.style.width = r.width + "px";   // keep the layout from jumping
        noSlot.style.height = r.height + "px";
        document.body.appendChild(noBtn);
        noBtn.classList.add("flying");
        noBtn.style.transition = "none";
        pos = { x: r.left, y: r.top };
        noBtn.style.transform = `translate(${pos.x}px, ${pos.y}px)`;
        void noBtn.offsetWidth;
        flying = true;
    }

    const vp = viewport();
    const minX = EDGE;
    const minY = EDGE;
    const maxX = Math.max(minX, vp.w - w - EDGE);
    const maxY = Math.max(minY, vp.h - h - EDGE);

    // Where the pointer is (fallback: the button itself)
    const fromX = px ?? pos.x + w / 2;
    const fromY = py ?? pos.y + h / 2;

    const yr = yesBtn.getBoundingClientRect();
    const gap = 18;

    // Try many random spots and keep the best one:
    // far from the pointer, far from where NO was, not on top of YES.
    let best = { x: pos.x, y: pos.y };
    let bestScore = -Infinity;

    for (let k = 0; k < 30; k++) {
        const x = rand(minX, maxX);
        const y = rand(minY, maxY);
        const cx = x + w / 2;
        const cy = y + h / 2;

        const fromPointer = Math.hypot(cx - fromX, cy - fromY);
        const fromOld = Math.hypot(x - pos.x, y - pos.y);

        const overlapsYes =
            x < yr.right + gap && x + w > yr.left - gap &&
            y < yr.bottom + gap && y + h > yr.top - gap;

        let score = Math.min(fromPointer, 340) + Math.min(fromOld, 260) * 0.5 + Math.random() * 90;
        if (overlapsYes) score -= 1000;

        if (score > bestScore) {
            bestScore = score;
            best = { x, y };
        }
    }

    pos = best;
    noBtn.style.transition = MOVE_TRANSITION;
    noBtn.style.transform = `translate(${pos.x}px, ${pos.y}px)`;

    // Little wiggle
    noBtn.classList.remove("dodge");
    void noBtn.offsetWidth;
    noBtn.classList.add("dodge");

    // YES gets a little bigger every time NO escapes 😄
    yesGrow = Math.min(1.3, yesGrow + 0.04);
    yesBtn.style.setProperty("--grow", yesGrow);
}

// Mouse: hover
noBtn.addEventListener("pointerenter", (e) => moveNo(e.clientX, e.clientY));

// Touch / mouse press: dodge before it can be activated
noBtn.addEventListener("pointerdown", (e) => {
    e.preventDefault();
    moveNo(e.clientX, e.clientY);
});

// Safety: a click never counts as "No"
noBtn.addEventListener("click", (e) => {
    e.preventDefault();
    e.stopPropagation();
    moveNo();
});

// Keyboard: tabbing onto NO also makes it run
noBtn.addEventListener("focus", () => moveNo());

// Desktop: start running a little before the cursor even touches it
document.addEventListener("pointermove", (e) => {
    if (e.pointerType !== "mouse" || isFinished || noBtn.hidden || buttons.hidden) return;
    const r = noBtn.getBoundingClientRect();
    const m = 55;
    if (e.clientX > r.left - m && e.clientX < r.right + m &&
        e.clientY > r.top - m && e.clientY < r.bottom + m) {
        moveNo(e.clientX, e.clientY);
    }
});

// Keep NO inside the screen when the window is resized / phone rotates
function clampNo() {
    if (!flying) return;
    const vp = viewport();
    const w = noBtn.offsetWidth;
    const h = noBtn.offsetHeight;
    pos.x = Math.min(Math.max(EDGE, pos.x), Math.max(EDGE, vp.w - w - EDGE));
    pos.y = Math.min(Math.max(EDGE, pos.y), Math.max(EDGE, vp.h - h - EDGE));
    noBtn.style.transition = "none";
    noBtn.style.transform = `translate(${pos.x}px, ${pos.y}px)`;
    void noBtn.offsetWidth;
    noBtn.style.transition = MOVE_TRANSITION;
}
window.addEventListener("resize", clampNo);
window.addEventListener("orientationchange", () => setTimeout(clampNo, 250));

// =========================
// FLOATING HEARTS
// =========================

const HEARTS = ["❤️", "💖", "💕", "💗", "💘"];

function createHeart(force = false) {
    if (reduceMotion || document.hidden) return;
    if (heartsLayer.childElementCount > (force ? 80 : 36)) return;

    const heart = document.createElement("div");
    heart.className = "heart";
    heart.textContent = pick(HEARTS);
    heart.style.left = rand(0, 100) + "vw";
    heart.style.fontSize = rand(14, 42) + "px";
    heart.style.setProperty("--sway", rand(-45, 45) + "px");
    heart.style.animationDuration = rand(5, 9) + "s";
    spawn(heartsLayer, heart, 10000);
}

(function heartLoop() {
    createHeart();
    setTimeout(heartLoop, isFinished ? 150 : rand(330, 520));
})();

// =========================
// STARS + SHOOTING STARS
// =========================

for (let i = 0; i < 70; i++) {
    const star = document.createElement("div");
    star.className = "star";
    const size = rand(1.5, 4);
    star.style.left = rand(0, 100) + "%";
    star.style.top = rand(0, 100) + "%";
    star.style.width = size + "px";
    star.style.height = size + "px";
    star.style.animationDelay = rand(0, 3) + "s";
    star.style.animationDuration = rand(2, 4.5) + "s";
    starsLayer.appendChild(star);
}

(function shootingStarLoop() {
    if (!reduceMotion && !document.hidden) {
        const s = document.createElement("div");
        s.className = "shoot";
        s.style.setProperty("--x", rand(5, 60) + "vw");
        s.style.setProperty("--y", rand(2, 40) + "vh");
        spawn(starsLayer, s, 2500);
    }
    setTimeout(shootingStarLoop, rand(4500, 8500));
})();

// =========================
// FALLING PETALS
// =========================

function createPetal() {
    if (reduceMotion) return;
    const petal = document.createElement("div");
    petal.className = "petal";
    petal.textContent = "🌸";
    petal.style.left = rand(0, 100) + "vw";
    petal.style.fontSize = rand(16, 36) + "px";
    petal.style.setProperty("--dx", rand(-120, 120) + "px");
    petal.style.setProperty("--rot", rand(360, 900) + "deg");
    petal.style.animationDuration = rand(6, 10) + "s";
    spawn(petalsLayer, petal, 11000);
}

// =========================
// EXTRA EFFECTS PER QUESTION
// =========================

function stageEffects(n) {
    switch (n) {
        case 2:
            createPetal();
            break;
        case 3:
            for (let i = 0; i < 18; i++) setTimeout(createPetal, i * 120);
            break;
        case 4:
            for (let i = 0; i < 30; i++) setTimeout(() => createHeart(true), i * 60);
            break;
    }
}

// =========================
// FINAL LOVE ENDING
// =========================

function finishLove() {
    isFinished = true;
    typingToken++; // stop any typing in progress

    hideButtons();
    body.dataset.stage = "win";
    body.classList.add("win");

    title.textContent = "❤️ YAYYYY ❤️";
    title.classList.add("win");

    message.classList.remove("out");
    message.innerHTML = `
        <div class="final-message">
            <span style="--i:0">Tumi YES bole diyecho! 🥹💖</span>
            <span style="--i:1">Aaj theke amar sobcheye shundor golpo ta shuru holo. 🌸</span>
            <span style="--i:2">I Promise...</span>
            <span style="--i:3">Tomake sobsomoy care korbo. ❤️</span>
        </div>
    `;

    setProgress(1);
    progress.classList.add("done");

    startHeartExplosion();
    startConfetti();
    playMusic();
}

// =========================
// HEART EXPLOSION
// =========================

function startHeartExplosion() {
    if (reduceMotion) return;
    const reach = Math.max(window.innerWidth, window.innerHeight) * 0.75;
    const EMOJI = ["❤️", "💖", "💕", "💗", "💘", "✨"];

    for (let i = 0; i < 130; i++) {
        setTimeout(() => {
            const heart = document.createElement("div");
            heart.className = "burst";
            heart.textContent = pick(EMOJI);
            heart.style.fontSize = rand(18, 44) + "px";
            fx.appendChild(heart);

            const angle = rand(0, Math.PI * 2);
            const dist = rand(reach * 0.25, reach);
            const x = Math.cos(angle) * dist;
            const y = Math.sin(angle) * dist;

            const anim = heart.animate([
                { transform: "translate(-50%, -50%) scale(0.2) rotate(0deg)", opacity: 1 },
                { transform: `translate(calc(-50% + ${x}px), calc(-50% + ${y}px)) scale(1.1) rotate(${rand(-360, 360)}deg)`, opacity: 1, offset: 0.7 },
                { transform: `translate(calc(-50% + ${x * 1.15}px), calc(-50% + ${y * 1.15}px)) scale(0.6) rotate(${rand(-420, 420)}deg)`, opacity: 0 }
            ], { duration: rand(1700, 2600), easing: "cubic-bezier(0.15, 0.85, 0.35, 1)", fill: "forwards" });

            anim.onfinish = () => heart.remove();
        }, i * 16);
    }
}

// =========================
// CONFETTI
// =========================

function startConfetti() {
    if (reduceMotion) return;
    const colors = ["#ff2e63", "#FFD93D", "#6BCB77", "#4D96FF", "#ffffff", "#c026d3"];

    for (let i = 0; i < 200; i++) {
        setTimeout(() => {
            const piece = document.createElement("div");
            piece.className = "confetti";
            const w = rand(6, 12);
            piece.style.left = rand(0, 100) + "vw";
            piece.style.width = w + "px";
            piece.style.height = w * rand(1, 1.8) + "px";
            piece.style.background = pick(colors);
            piece.style.borderRadius = Math.random() > 0.5 ? "50%" : "2px";
            piece.style.setProperty("--sway", rand(-90, 90) + "px");
            piece.style.animationDuration = rand(3.5, 5.8) + "s";
            spawn(fx, piece, 7000);
        }, i * 14);
    }
}

// =========================
// MUSIC — starts on the first user interaction
// =========================

function setMusicUI(on) {
    musicBtn.classList.toggle("playing", on);
    musicBtn.classList.toggle("muted", !on);
    musicBtn.textContent = on ? "🎶" : "🎵";
    musicBtn.setAttribute("aria-label", on ? "Turn music off" : "Turn music on");
    musicBtn.title = on ? "Music is playing — click to pause" : "Click to play music";
}

function musicToast(text) {
    let t = document.getElementById("musicToast");
    if (!t) {
        t = document.createElement("div");
        t.id = "musicToast";
        t.style.cssText =
            "position:fixed;left:50%;bottom:82px;transform:translateX(-50%);z-index:9999;" +
            "background:rgba(0,0,0,.78);color:#fff;padding:10px 16px;border-radius:14px;" +
            "font:600 14px system-ui,sans-serif;max-width:90vw;text-align:center;";
        document.body.appendChild(t);
    }
    t.textContent = text;
    clearTimeout(t._h);
    t._h = setTimeout(() => t.remove(), 6500);
}

function musicErrorText() {
    const e = music.error;
    if (!e) return "";
    return ({
        1: "load aborted",
        2: "network error",
        3: "audio decode error",
        4: "music.mp3 not found or unsupported"
    })[e.code] || ("audio error code " + e.code);
}

let musicStartedOnce = false;

function playMusic() {
    if (!music || !musicBtn) return Promise.resolve(false);

    musicBtn.hidden = false;
    music.loop = true;
    music.volume = 0.55;
    music.muted = false;

    // Avoid restarting the song if it is already playing.
    if (!music.paused && !music.ended) {
        setMusicUI(true);
        return Promise.resolve(true);
    }

    const result = music.play();

    if (!result || typeof result.then !== "function") {
        musicStartedOnce = true;
        setMusicUI(true);
        return Promise.resolve(true);
    }

    return result.then(() => {
        musicStartedOnce = true;
        setMusicUI(true);
        return true;
    }).catch((err) => {
        setMusicUI(false);
        console.warn("Music playback was blocked or failed:", err, musicErrorText());
        musicToast(
            musicErrorText()
                ? "Music problem: " + musicErrorText()
                : "Music চালাতে আবার স্ক্রিনে টাচ করো বা 🎵 বাটনে চাপ দাও।"
        );
        return false;
    });
}

// The browser allows sound after a real user interaction.
// Start on the first tap/click/key press anywhere on the page.
// Do not handle the music button here; its own click handler toggles it.
function startMusicOnFirstInteraction(event) {
    if (event && event.target && event.target.closest &&
        event.target.closest("#musicBtn")) {
        return;
    }

    if (musicStartedOnce) return;

    // Call play() directly inside the user interaction event.
    playMusic();

    document.removeEventListener("pointerdown", startMusicOnFirstInteraction);
    document.removeEventListener("keydown", startMusicOnFirstInteraction);
    document.removeEventListener("touchstart", startMusicOnFirstInteraction);
}

document.addEventListener("pointerdown", startMusicOnFirstInteraction);
document.addEventListener("keydown", startMusicOnFirstInteraction);
document.addEventListener("touchstart", startMusicOnFirstInteraction, { passive: true });

// Dedicated ON/OFF control.
musicBtn.hidden = false;
musicBtn.addEventListener("click", () => {
    if (music.paused || music.ended) {
        playMusic();
    } else {
        music.pause();
        setMusicUI(false);
    }
});

music.addEventListener("play", () => setMusicUI(true));
music.addEventListener("pause", () => setMusicUI(false));
music.addEventListener("error", () => {
    console.error("Could not load music.mp3:", musicErrorText());
    setMusicUI(false);
});

setMusicUI(false);

// =========================
// START
// =========================

goTo(0, true);

// Dashboard clock and navigation helpers
(function initDashboard() {
    const clock = document.getElementById("liveClock");
    const date = document.getElementById("liveDate");
    const musicNav = document.getElementById("musicNav");
    const navLinks = document.querySelectorAll(".nav-link[href]");
    const quote = document.getElementById("dailyQuote");
    const quotes = [
        "The sweetest things in life are felt with the heart.",
        "Little moments can turn into the loveliest memories.",
        "Every story is more beautiful when it begins with kindness.",
        "Some feelings are too special for ordinary words."
    ];
    if (quote) quote.textContent = quotes[new Date().getDate() % quotes.length];
    function updateClock() {
        const now = new Date();
        if (clock) clock.textContent = now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
        if (date) date.textContent = now.toLocaleDateString([], { weekday: "long", month: "short", day: "numeric", year: "numeric" });
    }
    updateClock();
    setInterval(updateClock, 1000);
    if (musicNav && musicBtn) musicNav.addEventListener("click", () => musicBtn.click());
    navLinks.forEach(link => link.addEventListener("click", () => {
        navLinks.forEach(item => item.classList.remove("active"));
        link.classList.add("active");
    }));
})();
