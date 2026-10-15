# stardance - chiefkaaf's personal site

> "A personal site is a small space on the internet about you." — Built for the Hack Club Personal Site Workshop.

welcome to **stardance** (`dumass-dev/my-web`), the personal website of **chiefkaaf** ([@dumass-dev](https://github.com/dumass-dev)).

a minimal, creative personal website designed like a physical sticky note bulletin board. built with pure semantic HTML5, Vanilla CSS, and basic Vanilla JavaScript. Zero frameworks, zero bundlers, zero AI gradients.

Live site: [https://dumass-dev.github.io/my-web/](https://dumass-dev.github.io/my-web/)

---

## what's on this site

- **Sticky Note Bulletin Board**: a clean corkboard column with stacked sticky notes (yellow, mint, pink, white).
- **The Star Bouncer (Canvas Toy)**: simple 2D canvas physics where stars bounce with basic gravity and air resistance. Click or drag to throw stars, tap Space to drop a cluster.
- **Community Pinboard**: write a short note to stick on the board. Notes persist in your browser using `localStorage`.
- **Projects**: a sticky note showing what i'm working on as i learn to code.
- **Zero Bloat**: clean, minimal, beginner-friendly code that anyone can read and understand.

---

## project structure

```text
stardance-web/
├── index.html        # Minimal semantic HTML5 structure
├── style.css         # Clean sticky note CSS styling
├── script.js         # Canvas star bouncer and pinboard logic
└── README.md         # Documentation
```

---

## running locally

No build tools or installations needed:

### option 1: python local server
```bash
python -m http.server 8080
```
Then open `http://localhost:8080` in your browser.

### option 2: vs code live server
Open this folder in VS Code, right-click `index.html`, and select **Open with Live Server**.

### option 3: direct file open
Double-click `index.html` in your file explorer to open it in any browser.

---

## built with

- Semantic HTML5
- Vanilla CSS3
- Vanilla JavaScript (HTML5 Canvas 2D, localStorage)
- Fonts: Outfit, Plus Jakarta Sans, JetBrains Mono
