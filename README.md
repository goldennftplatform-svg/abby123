# Rumi's Alphabet Stage 🌟

**Live site (GitHub Pages):** https://goldennftplatform-svg.github.io/abby123/

A bright, touch-friendly learning website for little kids (around 3–4 years old),
themed around an original, kid-friendly K-pop stage star inspired by Rumi from
*KPop Demon Hunters*.

It teaches:

- **A–Z letters** with each letter's sound and a picture word
- **Colours** — learn them by name, then find the right one
- **Words** — match pictures to words and words to pictures
- **Early spelling** — build simple three-letter words by tapping letters

Everything runs locally. No internet, no accounts, no downloads, no tracking.

---

## Start it

**Easiest:** double-click **`START-HERE.bat`**.

That starts a small web server and prints two addresses:

```
On this computer:  http://localhost:8000
On other devices:  http://192.168.x.x:8000
```

Open the first one on the computer running the server. Open the **second** one
on any tablet or phone connected to the **same Wi‑Fi**.

Press `Ctrl + C` in the black window (or close it) to stop the server.

### If you prefer the command line

```bat
python server.py
```

or

```bat
node server.js
```

Both listen on all network interfaces (`0.0.0.0`) so other devices can connect.

---

## Sharing on your network — checklist

1. All devices must be on the **same Wi‑Fi / LAN**.
2. If it doesn't connect, allow Python or Node through **Windows Defender Firewall**
   (Private networks) for port **8000**.
3. Use the `192.168...` address, not `localhost`, on other devices — `localhost`
   always means "this device".
4. Keep the server window open while playing.
5. For a full-screen experience on a tablet, use the browser's **Add to Home
   Screen** option (works in Chrome/Safari).

---

## Grown-up corner

Tap the **⚙️** button in the top right to:

- turn the speaking voice on/off
- turn the happy sound effects on/off
- switch to slower speech for very early learners
- reset stars and letter progress

Stars and letter progress are saved in the browser on each device.

### Stage audio 🎵

Tap **🎵 Rumi's Stage Theme** on the home screen for an original, bouncy
synth-pop stage jingle with drums, bass, synth melody and crowd cheers. There
are also mic-tap, light-stick shimmer, power-up and "Honmoon" sparkle sounds
during the games, plus a short fanfare every 5 stars.

All audio is generated live in the browser by `js/audio.js`. It is **original
music** — no songs, lyrics, samples or audio files from any existing show or
artist are used or included.

You can turn the stage music off in the grown-up corner if you'd prefer a
quieter game.

---

## What's in the files

| File | Purpose |
|---|---|
| `index.html` | Page structure and the built-in SVG mascot |
| `css/styles.css` | All the styling, animation and tablet-friendly sizing |
| `js/data.js` | Letters, words, colours and spelling words — easy to edit |
| `js/audio.js` | Original synthesized stage music and sound effects |
| `js/app.js` | Game logic, speech and sounds |
| `server.py` | Python LAN server (used by `START-HERE.bat`) |
| `server.js` | Node.js fallback server |
| `assets/` | Optional extra artwork slot |

### Make it your own

Open `js/data.js` in any text editor to change the picture words, add colours,
or swap in your child's favourite words. Keep the same format and refresh the
page — no build step needed.

---

## Easy updates (git style)

The folder is already a git repo connected to
`https://github.com/goldennftplatform-svg/abby123`. After changing a file:

```bat
git add -A
git commit -m "Describe what changed"
git push
```

GitHub Pages rebuilds automatically in about 30 seconds. Refresh the live
site to see the update.

Made with big buttons, gentle feedback, and lots of encouragement. ✨
