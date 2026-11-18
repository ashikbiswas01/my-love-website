# ❤️ For You

A cute interactive proposal / love-question website with a typewriter effect, a **runaway "No" button**, floating hearts, falling petals, shooting stars and a big celebration ending.

---

## ✨ Features

- Smooth **typewriter** questions (emoji-safe, with blinking caret)
- Background colors **fade smoothly** from one question to the next
- Floating hearts, twinkling stars, shooting stars, falling petals
- Glass card with floating motion, glow and light sheen
- **Runaway "No" button**
  - glides smoothly to a new spot when you hover, touch or tab to it
  - on desktop it starts running before the cursor even touches it
  - always stays **inside the screen** (mobile + desktop, also after resize / rotate)
  - never lands on top of the YES button
  - YES grows a little each time NO escapes 😄
- Heart explosion + confetti + staggered final message when someone says **YES**
- Background music starts after the first user interaction (browser autoplay policy)
- Music on/off button stays visible throughout the experience
- Music loops continuously, including during the questions and final celebration
- Respects "reduce motion" accessibility setting

---

## 📁 Project Structure

```
for-YOU/
├── index.html      # Page structure
├── style.css       # Design & animations
├── script.js       # Questions, logic & effects
├── music.mp3       # (Optional) background music
└── README.md
```

---

## 🚀 How to Use

1. Put all files in one folder
2. Open the folder with VS Code Live Server (recommended), or open `index.html` in a browser
3. Tap/click anywhere once to start music (browsers block sound autoplay before interaction)
3. (Optional) Add a song named `music.mp3` in the same folder

No build tools needed. Fonts (Fraunces + Nunito) load from Google Fonts when online, with safe fallbacks offline.

---

## ✏️ Customize the Questions

Open `script.js` and edit the `questions` array at the top:

```js
const questions = [
    "Hey...❤️",
    "Tmr kache ekta proshno chilo...🥺",
    // ... add or change any question
    "Last Question...🥹<br><br>Amar Hobe? ❤️"
];
```

- Use `<br>` for a line break.
- The first line plays alone, then the next one asks with YES / NO buttons.
- The number of questions can change freely. Background colors for questions 1–5 are set in `style.css` (`body[data-stage="..."]`).

## 🎨 Customization Tips

- Change colors → `body[data-stage="..."]` rules in `style.css`
- Change the final message → search for `finishLove` in `script.js`
- Make NO run farther/faster → `MOVE_TRANSITION` and `EDGE` in `script.js`
- Add your own music → name your song `music.mp3`

---

## 💖 Made with Love

Host it for free on GitHub Pages and share the link.


## Dashboard Design

The page includes a responsive left navigation panel, a central interactive love-story card, and right-side live clock, date, memory and quote cards. On smaller screens the navigation becomes a horizontal strip and the side cards stack below the main card.
