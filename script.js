/**
 * STARDANCE - Personal Portfolio & Digital Cosmos
 * Vanilla JavaScript Engine
 * Author: Shuaib (@dumass-dev)
 */

(function () {
  'use strict';

  /* ==========================================================================
     1. Web Audio API - Celestial Pentatonic Chimes
     ========================================================================== */
  let audioCtx = null;
  let isSoundEnabled = false;

  // Pentatonic scale frequencies in Hz (C4, D4, E4, G4, A4, C5, D5, E5, G5)
  const PENTATONIC_FREQUENCIES = [
    261.63, 293.66, 329.63, 392.00, 440.00,
    523.25, 587.33, 659.25, 783.99
  ];

  function initAudio() {
    if (!audioCtx) {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (AudioContextClass) {
        audioCtx = new AudioContextClass();
      }
    }
    if (audioCtx && audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
  }

  function playCelestialChime(frequency) {
    if (!isSoundEnabled || !audioCtx) return;

    try {
      const freq = frequency || PENTATONIC_FREQUENCIES[Math.floor(Math.random() * PENTATONIC_FREQUENCIES.length)];
      const now = audioCtx.currentTime;

      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();

      // Sine wave with soft bell harmonics
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now);

      // Envelope: gentle attack, exponential decay
      gain.gain.setValueAtTime(0.001, now);
      gain.gain.exponentialRampToValueAtTime(0.12, now + 0.04);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 1.2);

      osc.connect(gain);
      gain.connect(audioCtx.destination);

      osc.start(now);
      osc.stop(now + 1.25);
    } catch (e) {
      console.warn('Audio playback error', e);
    }
  }

  // Audio Toggle Button
  const soundToggleBtn = document.getElementById('sound-toggle-btn');
  const soundIcon = document.getElementById('sound-icon');

  if (soundToggleBtn && soundIcon) {
    soundToggleBtn.addEventListener('click', () => {
      initAudio();
      isSoundEnabled = !isSoundEnabled;
      soundIcon.textContent = isSoundEnabled ? '🔊' : '🔇';
      showToast(isSoundEnabled ? 'Celestial audio enabled 🎶' : 'Cosmic audio muted 🔇', isSoundEnabled ? '✨' : '🌙');
      if (isSoundEnabled) {
        playCelestialChime(523.25);
      }
    });
  }

  /* ==========================================================================
     2. Background Ambient Starfield Canvas
     ========================================================================== */
  const bgCanvas = document.getElementById('starfield-canvas');
  if (bgCanvas) {
    const ctx = bgCanvas.getContext('2d');
    let width = (bgCanvas.width = window.innerWidth);
    let height = (bgCanvas.height = window.innerHeight);

    let mouse = { x: width / 2, y: height / 2, active: false };

    window.addEventListener('mousemove', (e) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
      mouse.active = true;
    });

    window.addEventListener('mouseleave', () => {
      mouse.active = false;
    });

    window.addEventListener('resize', () => {
      width = bgCanvas.width = window.innerWidth;
      height = bgCanvas.height = window.innerHeight;
      initBgStars();
    });

    const STAR_COUNT = Math.min(Math.floor((width * height) / 9000), 120);
    const bgStars = [];

    class BgStar {
      constructor() {
        this.reset();
      }

      reset() {
        this.x = Math.random() * width;
        this.y = Math.random() * height;
        this.size = Math.random() * 1.8 + 0.6;
        this.vx = (Math.random() - 0.5) * 0.35;
        this.vy = (Math.random() - 0.5) * 0.35;
        this.alpha = Math.random() * 0.7 + 0.2;
        this.baseAlpha = this.alpha;
        this.twinkleSpeed = Math.random() * 0.02 + 0.005;
        this.color = Math.random() > 0.4 ? '#ffffff' : (Math.random() > 0.5 ? '#38bdf8' : '#c084fc');
      }

      update() {
        this.x += this.vx;
        this.y += this.vy;

        // Twinkle
        this.alpha += this.twinkleSpeed;
        if (this.alpha > 0.9 || this.alpha < 0.2) {
          this.twinkleSpeed = -this.twinkleSpeed;
        }

        // Screen wrap
        if (this.x < 0) this.x = width;
        if (this.x > width) this.x = 0;
        if (this.y < 0) this.y = height;
        if (this.y > height) this.y = 0;

        // Subtle mouse reaction
        if (mouse.active) {
          const dx = mouse.x - this.x;
          const dy = mouse.y - this.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 120) {
            const force = (120 - dist) / 120;
            this.x -= (dx / dist) * force * 1.2;
            this.y -= (dy / dist) * force * 1.2;
          }
        }
      }

      draw() {
        ctx.save();
        ctx.globalAlpha = Math.max(0.1, Math.min(1, this.alpha));
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
    }

    function initBgStars() {
      bgStars.length = 0;
      for (let i = 0; i < STAR_COUNT; i++) {
        bgStars.push(new BgStar());
      }
    }
    initBgStars();

    function renderBg() {
      ctx.clearRect(0, 0, width, height);

      // Draw subtle constellation proximity webs
      const maxDist = 95;
      for (let i = 0; i < bgStars.length; i++) {
        for (let j = i + 1; j < bgStars.length; j++) {
          const dx = bgStars[i].x - bgStars[j].x;
          const dy = bgStars[i].y - bgStars[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < maxDist) {
            const alpha = (1 - dist / maxDist) * 0.15;
            ctx.strokeStyle = `rgba(168, 85, 247, ${alpha})`;
            ctx.lineWidth = 0.8;
            ctx.beginPath();
            ctx.moveTo(bgStars[i].x, bgStars[i].y);
            ctx.lineTo(bgStars[j].x, bgStars[j].y);
            ctx.stroke();
          }
        }
      }

      // Update & draw stars
      for (let i = 0; i < bgStars.length; i++) {
        bgStars[i].update();
        bgStars[i].draw();
      }

      requestAnimationFrame(renderBg);
    }
    renderBg();
  }

  /* ==========================================================================
     3. Interactive Stardance Sandbox Canvas
     ========================================================================== */
  const sWrapper = document.getElementById('sandbox-canvas-wrapper');
  const sCanvas = document.getElementById('sandbox-canvas');
  const starCountDisplay = document.getElementById('sandbox-star-count');
  const modeLabel = document.getElementById('sandbox-mode-label');

  if (sCanvas && sWrapper) {
    const sCtx = sCanvas.getContext('2d');
    let sWidth = (sCanvas.width = sWrapper.clientWidth);
    let sHeight = (sCanvas.height = sWrapper.clientHeight);

    window.addEventListener('resize', () => {
      if (sWrapper) {
        sWidth = sCanvas.width = sWrapper.clientWidth;
        sHeight = sCanvas.height = sWrapper.clientHeight;
      }
    });

    const sandboxStars = [];
    let isGravityInverted = false;

    class SandboxStar {
      constructor(x, y, vx, vy, color, size) {
        this.x = x !== undefined ? x : Math.random() * sWidth;
        this.y = y !== undefined ? y : Math.random() * sHeight;
        this.vx = vx !== undefined ? vx : (Math.random() - 0.5) * 1.6;
        this.vy = vy !== undefined ? vy : (Math.random() - 0.5) * 1.6;
        this.size = size || Math.random() * 2.5 + 1.2;
        this.color = color || ['#38bdf8', '#a855f7', '#fbbf24', '#f43f5e', '#ffffff'][Math.floor(Math.random() * 5)];
        this.life = 1;
        this.decay = 0;
      }

      update() {
        this.x += this.vx;
        this.y += this.vy;

        // Friction & bounds bounce
        if (this.x < 0 || this.x > sWidth) this.vx = -this.vx;
        if (this.y < 0 || this.y > sHeight) this.vy = -this.vy;

        // Center gravitational drift
        const cx = sWidth / 2;
        const cy = sHeight / 2;
        const dx = cx - this.x;
        const dy = cy - this.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist > 10) {
          const g = isGravityInverted ? -0.0004 : 0.0003;
          this.vx += (dx / dist) * g * (dist / 10);
          this.vy += (dy / dist) * g * (dist / 10);
        }

        // Velocity damping
        this.vx *= 0.995;
        this.vy *= 0.995;
      }

      draw() {
        sCtx.save();
        sCtx.fillStyle = this.color;
        sCtx.shadowColor = this.color;
        sCtx.shadowBlur = 8;
        sCtx.beginPath();
        sCtx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        sCtx.fill();
        sCtx.restore();
      }
    }

    // Initialize initial cluster
    function initSandboxCluster(count = 55) {
      sandboxStars.length = 0;
      for (let i = 0; i < count; i++) {
        sandboxStars.push(new SandboxStar());
      }
      updateStarCount();
    }
    initSandboxCluster(65);

    function updateStarCount() {
      if (starCountDisplay) {
        starCountDisplay.textContent = sandboxStars.length;
      }
    }

    // Spawn stars on click or drag
    let isMouseDown = false;

    function spawnAtMouse(e) {
      const rect = sCanvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      if (x < 0 || x > sWidth || y < 0 || y > sHeight) return;

      if (sandboxStars.length < 220) {
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 3 + 1;
        const star = new SandboxStar(
          x,
          y,
          Math.cos(angle) * speed,
          Math.sin(angle) * speed,
          ['#38bdf8', '#c084fc', '#fbbf24', '#ffffff'][Math.floor(Math.random() * 4)],
          Math.random() * 3 + 1.5
        );
        sandboxStars.push(star);
        updateStarCount();
      }

      playCelestialChime();
    }

    sCanvas.addEventListener('mousedown', (e) => {
      isMouseDown = true;
      initAudio();
      spawnAtMouse(e);
    });

    window.addEventListener('mouseup', () => {
      isMouseDown = false;
    });

    sCanvas.addEventListener('mousemove', (e) => {
      if (isMouseDown) {
        spawnAtMouse(e);
      }
    });

    // Touch support for mobile devices
    sCanvas.addEventListener('touchstart', (e) => {
      initAudio();
      const touch = e.touches[0];
      if (touch) spawnAtMouse(touch);
    }, { passive: true });

    // Supernova Button
    const btnSupernova = document.getElementById('btn-supernova');
    if (btnSupernova) {
      btnSupernova.addEventListener('click', () => {
        initAudio();
        const cx = sWidth / 2;
        const cy = sHeight / 2;

        for (let i = 0; i < 40; i++) {
          const angle = (Math.PI * 2 * i) / 40;
          const speed = Math.random() * 5 + 3;
          sandboxStars.push(
            new SandboxStar(
              cx,
              cy,
              Math.cos(angle) * speed,
              Math.sin(angle) * speed,
              Math.random() > 0.5 ? '#fbbf24' : '#f43f5e',
              Math.random() * 3.5 + 2
            )
          );
        }
        updateStarCount();
        playCelestialChime(659.25);
        showToast('💥 Supernova unleashed across the galaxy!', '🌌');
      });
    }

    // Invert Gravity Button
    const btnToggleGravity = document.getElementById('btn-toggle-gravity');
    if (btnToggleGravity) {
      btnToggleGravity.addEventListener('click', () => {
        isGravityInverted = !isGravityInverted;
        btnToggleGravity.textContent = isGravityInverted ? '🪐 Center Gravity' : '🪐 Invert Gravity';
        if (modeLabel) {
          modeLabel.textContent = isGravityInverted ? 'Orbital Repulsion' : 'Interactive Gravity';
        }
        showToast(isGravityInverted ? 'Gravity inverted to outward cosmic wind!' : 'Gravity restored to cosmic core.', '🪐');
      });
    }

    // Clear Space Button
    const btnClearSandbox = document.getElementById('btn-clear-sandbox');
    if (btnClearSandbox) {
      btnClearSandbox.addEventListener('click', () => {
        initSandboxCluster(20);
        showToast('Space cleared and reseeded with pristine stardust.', '🧹');
      });
    }

    // Render loop for Sandbox
    function renderSandbox() {
      sCtx.fillStyle = 'rgba(6, 9, 20, 0.28)';
      sCtx.fillRect(0, 0, sWidth, sHeight);

      const maxDist = 90;
      const count = sandboxStars.length;

      // Draw constellation connections
      for (let i = 0; i < count; i++) {
        for (let j = i + 1; j < count; j++) {
          const dx = sandboxStars[i].x - sandboxStars[j].x;
          const dy = sandboxStars[i].y - sandboxStars[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < maxDist) {
            const alpha = (1 - dist / maxDist) * 0.45;
            sCtx.strokeStyle = `rgba(56, 189, 248, ${alpha})`;
            sCtx.lineWidth = 1;
            sCtx.beginPath();
            sCtx.moveTo(sandboxStars[i].x, sandboxStars[i].y);
            sCtx.lineTo(sandboxStars[j].x, sandboxStars[j].y);
            sCtx.stroke();
          }
        }
      }

      // Update & render stars
      for (let i = 0; i < count; i++) {
        sandboxStars[i].update();
        sandboxStars[i].draw();
      }

      requestAnimationFrame(renderSandbox);
    }
    renderSandbox();
  }

  /* ==========================================================================
     4. Navigation Bar, ScrollSpy & Mobile Menu
     ========================================================================== */
  const navbar = document.getElementById('navbar');
  const navLinks = document.querySelectorAll('.nav-link');
  const mobileToggle = document.getElementById('mobile-menu-toggle');
  const navMenu = document.getElementById('nav-menu');
  const btnBackToTop = document.getElementById('btn-back-to-top');

  window.addEventListener('scroll', () => {
    const scrollPos = window.scrollY;

    // Header blur state
    if (navbar) {
      if (scrollPos > 40) {
        navbar.classList.add('scrolled');
      } else {
        navbar.classList.remove('scrolled');
      }
    }

    // Back to top button visibility
    if (btnBackToTop) {
      if (scrollPos > 400) {
        btnBackToTop.classList.add('show');
      } else {
        btnBackToTop.classList.remove('show');
      }
    }

    // ScrollSpy active link updater
    const sections = document.querySelectorAll('section[id]');
    sections.forEach((section) => {
      const top = section.offsetTop - 120;
      const height = section.offsetHeight;
      const id = section.getAttribute('id');

      if (scrollPos >= top && scrollPos < top + height) {
        navLinks.forEach((link) => {
          link.classList.remove('active');
          if (link.getAttribute('href') === `#${id}`) {
            link.classList.add('active');
          }
        });
      }
    });
  });

  if (btnBackToTop) {
    btnBackToTop.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  if (mobileToggle && navMenu) {
    mobileToggle.addEventListener('click', () => {
      const isExpanded = navMenu.classList.toggle('open');
      mobileToggle.setAttribute('aria-expanded', isExpanded);
      mobileToggle.textContent = isExpanded ? '✕' : '☰';
    });

    navLinks.forEach((link) => {
      link.addEventListener('click', () => {
        navMenu.classList.remove('open');
        mobileToggle.textContent = '☰';
      });
    });
  }

  /* ==========================================================================
     5. Project Filtering
     ========================================================================== */
  const filterBtns = document.querySelectorAll('.filter-btn');
  const projectCards = document.querySelectorAll('.project-card');

  filterBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      filterBtns.forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');

      const filter = btn.getAttribute('data-filter');

      projectCards.forEach((card) => {
        const category = card.getAttribute('data-category');
        if (filter === 'all' || category === filter) {
          card.style.display = 'flex';
          card.style.opacity = '0';
          setTimeout(() => {
            card.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
            card.style.opacity = '1';
          }, 10);
        } else {
          card.style.display = 'none';
        }
      });
    });
  });

  /* ==========================================================================
     6. Project Modal Details & Previews
     ========================================================================== */
  const projectData = {
    stardance: {
      title: 'Stardance Engine',
      badge: 'Interactive Canvas 2D & Audio',
      summary: 'A fast, lightweight 60 FPS generative particle and constellation simulator built with pure HTML5 Canvas and the Web Audio API.',
      features: [
        'Zero external dependencies—under 12KB uncompressed',
        'Dynamic spatial proximity checks for starry constellation links',
        'Real-time mouse and gravitational physics interaction',
        'Procedural ambient pentatonic chimes synthesized directly in-browser'
      ],
      tech: ['HTML5 Canvas', 'Vanilla JavaScript (ES6+)', 'Web Audio API', 'CSS Glassmorphism'],
      github: 'https://github.com/dumass-dev/stardance-web'
    },
    glasss: {
      title: 'Glasss UI Component Kit',
      badge: 'Modern CSS3 Design System',
      summary: 'A state-of-the-art glassmorphism design system delivering translucent layers, luminous accent borders, and accessible high-contrast typography.',
      features: [
        'Comprehensive design tokens via native CSS Custom Properties',
        'Hardware-accelerated backdrop-filter blur and specular highlights',
        'Fully responsive card, modal, button, and navigation primitives',
        'Clean, semantic HTML markup with zero framework overhead'
      ],
      tech: ['CSS Custom Properties', 'Backdrop Filter', 'Vanilla HTML5', 'Modular Design'],
      github: 'https://github.com/shuaib-mk/glasss.git'
    },
    ssh: {
      title: 'SSH Terminal Multiplayer',
      badge: 'Systems & Realtime Terminal',
      summary: 'A real-time multiplayer application accessed purely through terminal SSH streams with zero installation required on client systems.',
      features: [
        'Direct connection via standard command line: ssh play.stardance.net',
        'Zero npm/pip client packages needed; leverages raw ANSI terminal escape sequences',
        'Sub-30ms low-latency socket synchronization',
        'Multi-room state management and interactive multiplayer avatars'
      ],
      tech: ['Node.js', 'SSH2 Server', 'ANSI Escape Sequences', 'Binary Sockets'],
      github: 'https://github.com/dumass-dev'
    },
    telemetry: {
      title: 'Cosmic Pulse Telemetry',
      badge: 'Realtime Web & Telemetry',
      summary: 'A high-frequency web dashboard displaying live service heartbeats, latency histograms, and uptime signals with sub-millisecond chart rendering.',
      features: [
        'Full duplex WebSocket telemetry streaming',
        'Microsecond accurate P95 / P99 latency percentile calculations',
        'Custom lightweight SVG charting with zero charting library overhead',
        'Resilient automatic reconnection and offline packet replay'
      ],
      tech: ['WebSockets', 'SVG Visualization', 'Modern JavaScript', 'CSS Grid'],
      github: 'https://github.com/dumass-dev'
    }
  };

  const projectModal = document.getElementById('project-modal');
  const projectModalBody = document.getElementById('modal-project-body');
  const btnCloseProjectModal = document.getElementById('btn-close-project-modal');

  document.querySelectorAll('.btn-preview-project').forEach((btn) => {
    btn.addEventListener('click', () => {
      const pKey = btn.getAttribute('data-project');
      const data = projectData[pKey];
      if (!data) return;

      projectModalBody.innerHTML = `
        <div style="margin-bottom: 20px;">
          <span class="pill-badge" style="margin-bottom: 12px;">${data.badge}</span>
          <h2 style="font-size: 2rem; margin-bottom: 10px;" id="modal-project-title">${data.title}</h2>
          <p style="font-size: 1.05rem; line-height: 1.7; color: var(--text-main);">${data.summary}</p>
        </div>

        <div style="margin-bottom: 24px;">
          <h4 style="font-size: 1.1rem; color: var(--accent-cyan); margin-bottom: 12px;">Key Engineering Highlights:</h4>
          <ul style="list-style: none; display: flex; flex-direction: column; gap: 8px;">
            ${data.features.map(f => `<li style="display: flex; align-items: center; gap: 8px; color: var(--text-muted);"><span style="color: var(--accent-purple);">✦</span> ${f}</li>`).join('')}
          </ul>
        </div>

        <div style="margin-bottom: 28px;">
          <h4 style="font-size: 1.1rem; color: var(--accent-cyan); margin-bottom: 10px;">Tech Stack:</h4>
          <div style="display: flex; flex-wrap: wrap; gap: 8px;">
            ${data.tech.map(t => `<span class="project-tag">${t}</span>`).join('')}
          </div>
        </div>

        <div style="display: flex; gap: 14px; flex-wrap: wrap;">
          <a href="${data.github}" target="_blank" rel="noopener noreferrer" class="btn btn-primary">
            <span>View Source on GitHub</span>
            <span>↗</span>
          </a>
          <button class="btn btn-secondary" onclick="document.getElementById('project-modal').classList.remove('active')">
            Close Preview
          </button>
        </div>
      `;

      projectModal.classList.add('active');
    });
  });

  if (btnCloseProjectModal) {
    btnCloseProjectModal.addEventListener('click', () => {
      projectModal.classList.remove('active');
    });
  }

  if (projectModal) {
    projectModal.addEventListener('click', (e) => {
      if (e.target === projectModal) {
        projectModal.classList.remove('active');
      }
    });
  }

  /* ==========================================================================
     7. Cosmic Blog / Dev Logs Reader Modal
     ========================================================================== */
  const articlesData = {
    vanilla: {
      title: 'The Superpower of Vanilla HTML, CSS & JavaScript',
      date: 'October 13, 2026',
      readTime: '5 min read',
      tag: 'Web Philosophy',
      content: `
        <p>In modern web development, it's remarkably easy to install 500 megabytes of node_modules before even typing a single line of markup. But when you step back and master the fundamental triad—<strong>Semantic HTML, Modern Vanilla CSS, and Vanilla JavaScript</strong>—everything changes.</p>
        <br>
        <h4 style="color: var(--accent-cyan); margin: 12px 0;">1. Zero Build Steps, Instant Velocity</h4>
        <p>With vanilla code, your browser is your compiler. You save a file, refresh, and the browser executes native, hardware-optimized primitives at blistering speed. No waiting for bundling, no mysterious compiler errors.</p>
        <br>
        <h4 style="color: var(--accent-cyan); margin: 12px 0;">2. CSS Has Evolved Tremendously</h4>
        <p>CSS Custom Properties, Grid, Flexbox, <code>backdrop-filter</code>, and subgrid allow us to construct hyper-responsive, glassmorphic interfaces with zero utility frameworks. Writing CSS by hand gives you total creative control and pride in your aesthetic.</p>
        <br>
        <h4 style="color: var(--accent-cyan); margin: 12px 0;">3. Longevity</h4>
        <p>Code written in pure HTML and CSS written today will still render perfectly a decade from now without deprecation warnings. Simplicity is the ultimate sophistication.</p>
      `
    },
    canvas: {
      title: 'Building 60 FPS Dancing Constellations on HTML5 Canvas',
      date: 'September 24, 2026',
      readTime: '7 min read',
      tag: 'Generative Art',
      content: `
        <p>The interactive starfield on this website isn't a pre-rendered video—it is generated entirely in real-time on an HTML5 <code>&lt;canvas&gt;</code> element.</p>
        <br>
        <h4 style="color: var(--accent-cyan); margin: 12px 0;">The Core Algorithm: Proximity Constellations</h4>
        <p>Each star maintains a position <code>(x, y)</code> and velocity <code>(vx, vy)</code>. On every frame:</p>
        <ul style="margin-left: 20px; margin-top: 8px; color: var(--text-muted); line-height: 1.8;">
          <li>We update positions and handle bounds wrapping.</li>
          <li>For every pair of stars, we calculate Euclidean distance: <code>Math.hypot(dx, dy)</code>.</li>
          <li>If the distance is under the threshold (95px), we draw a dynamic line whose opacity scales inversely with distance.</li>
          <li>We apply gravitational vectors when the cursor wanders nearby, giving stars a playful, organic responsiveness.</li>
        </ul>
        <br>
        <p>By keeping the star count balanced and avoiding expensive memory allocations inside the render loop, the simulation runs at a silky smooth 60 FPS across laptops, desktops, and mobile screens alike.</p>
      `
    },
    hackclub: {
      title: 'Why Hack Club and Open Source Changed How I Build',
      date: 'August 18, 2026',
      readTime: '4 min read',
      tag: 'Community',
      content: `
        <p>When you first learn to code, it's easy to get trapped in tutorial purgatory. You follow along, build a clone of a generic app, and wonder what to do next.</p>
        <br>
        <p>Discovering Hack Club and the open-source philosophy shattered that barrier for me. Hack Club encourages hackers to <strong>build real things, get creative, and ship them to the world</strong>—no matter how silly or experimental they seem.</p>
        <br>
        <h4 style="color: var(--accent-cyan); margin: 12px 0;">The Magic of Shipping in Public</h4>
        <p>When you build a personal website from scratch, you aren't just filling out templates—you are carving out your own sovereign corner of the internet. You choose the colors, the fonts, the toys, the Easter eggs. That creative freedom is why I love programming.</p>
      `
    }
  };

  const blogModal = document.getElementById('blog-modal');
  const blogModalBody = document.getElementById('modal-blog-body');
  const btnCloseBlogModal = document.getElementById('btn-close-blog-modal');

  document.querySelectorAll('.blog-card').forEach((card) => {
    card.addEventListener('click', () => {
      const artKey = card.getAttribute('data-article');
      const data = articlesData[artKey];
      if (!data) return;

      blogModalBody.innerHTML = `
        <div style="margin-bottom: 24px;">
          <div style="display: flex; gap: 10px; font-family: var(--font-mono); font-size: 0.85rem; color: var(--accent-cyan); margin-bottom: 10px;">
            <span>${data.date}</span>
            <span>•</span>
            <span>${data.readTime}</span>
            <span>•</span>
            <span style="color: var(--accent-purple);">${data.tag}</span>
          </div>
          <h2 style="font-size: 1.85rem; margin-bottom: 16px;" id="modal-blog-title">${data.title}</h2>
          <div style="height: 1px; background: var(--border-subtle); margin-bottom: 20px;"></div>
        </div>

        <div style="font-size: 1.05rem; line-height: 1.8; color: var(--text-main); margin-bottom: 28px;">
          ${data.content}
        </div>

        <div style="border-top: 1px solid var(--border-subtle); padding-top: 18px; display: flex; justify-content: space-between; align-items: center; flex-wrap: gap;">
          <span style="font-size: 0.88rem; color: var(--text-dim); font-family: var(--font-mono);">&lt;transmission completed // dumass-dev&gt;</span>
          <button class="btn btn-secondary btn-sm" onclick="document.getElementById('blog-modal').classList.remove('active')">
            Close Log
          </button>
        </div>
      `;

      blogModal.classList.add('active');
    });
  });

  if (btnCloseBlogModal) {
    btnCloseBlogModal.addEventListener('click', () => {
      blogModal.classList.remove('active');
    });
  }

  if (blogModal) {
    blogModal.addEventListener('click', (e) => {
      if (e.target === blogModal) {
        blogModal.classList.remove('active');
      }
    });
  }

  // Escape key to close any active modal
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      if (projectModal) projectModal.classList.remove('active');
      if (blogModal) blogModal.classList.remove('active');
    }
  });

  /* ==========================================================================
     8. Interactive Stargaze Thought Generator & Silly Extras
     ========================================================================== */
  const thoughts = [
    '"Code is poetry etched into silicon, dancing like stars across the screen."',
    '"The cosmos is under no obligation to make sense to us, but clean code should."',
    '"Every great website begins with a single <html> tag and a dream."',
    '"Debugging is like looking for a black hole: you spot it by how everything bends around it."',
    '"Vanilla JavaScript runs everywhere, just like cosmic microwave background radiation."',
    '"In an infinite universe, every branch you commit is merged into something wondrous."',
    '"Keep your functions pure and your stargazing nights quiet."'
  ];

  let thoughtIdx = 0;
  const thoughtText = document.getElementById('daily-thought-text');
  const btnNewThought = document.getElementById('btn-new-thought');

  if (btnNewThought && thoughtText) {
    btnNewThought.addEventListener('click', () => {
      thoughtIdx = (thoughtIdx + 1) % thoughts.length;
      thoughtText.style.opacity = '0';
      setTimeout(() => {
        thoughtText.textContent = thoughts[thoughtIdx];
        thoughtText.style.opacity = '1';
      }, 200);
      playCelestialChime(440);
    });
  }

  // Developer Oracle Fortunes
  const fortunes = [
    '✨ Tonight, your stubborn bug will solve itself after a sip of tea.',
    '🌟 A pull request you submit this week will be merged with zero review comments.',
    '🪐 You will uncover a remarkably clean solution in under 5 lines of code.',
    '🚀 A forgotten repository will spark inspiration for your next major project.',
    '🔮 The constellation of Orion promises blazing 60 FPS on your next canvas experiment.',
    '⚡ May your terminal latency remain forever under 15ms.',
    '🌌 In a parallel galaxy, your code compiled without a single warning.'
  ];

  const fortuneText = document.getElementById('fortune-text');
  const btnReadFortune = document.getElementById('btn-read-fortune');

  if (btnReadFortune && fortuneText) {
    btnReadFortune.addEventListener('click', () => {
      initAudio();
      const rand = fortunes[Math.floor(Math.random() * fortunes.length)];
      fortuneText.style.opacity = '0';
      setTimeout(() => {
        fortuneText.textContent = rand;
        fortuneText.style.opacity = '1';
      }, 200);
      playCelestialChime(587.33);
      showToast('The Cosmic Oracle has spoken! 🔮', '✨');
    });
  }

  // Space Trivia
  const facts = [
    {
      title: 'Neutron Star Density',
      body: 'A single sugar-cube-sized chunk of neutron star material would weigh approximately 1 billion tons on Earth—about the weight of Mount Everest!'
    },
    {
      title: 'Voyager 1 Distance',
      body: 'Launched in 1977, Voyager 1 is over 24 billion kilometers away from Earth, sailing through interstellar space at 61,000 km/h.'
    },
    {
      title: 'Diamond Rain on Neptune',
      body: 'Extreme atmospheric pressures on Neptune and Uranus can compress methane into real diamonds that sink toward the planet cores.'
    },
    {
      title: 'Silent Vacuum',
      body: 'Space is completely silent because there is no atmosphere for sound vibrations to travel through. Radio transmissions bridge the silence!'
    }
  ];

  let factIdx = 0;
  const factHeading = document.getElementById('fact-heading');
  const factBody = document.getElementById('fact-body');
  const btnRandomFact = document.getElementById('btn-random-fact');

  if (btnRandomFact && factHeading && factBody) {
    btnRandomFact.addEventListener('click', () => {
      factIdx = (factIdx + 1) % facts.length;
      factHeading.textContent = facts[factIdx].title;
      factBody.textContent = facts[factIdx].body;
      playCelestialChime(392);
    });
  }

  /* ==========================================================================
     9. Contact Actions: Copy Email & Transmission Form
     ========================================================================== */
  const btnCopyEmail = document.getElementById('btn-copy-email');
  if (btnCopyEmail) {
    btnCopyEmail.addEventListener('click', () => {
      const email = 'shuaib.melekodesseri@gmail.com';
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(email).then(() => {
          showCopySuccess();
        }).catch(() => {
          fallbackCopy(email);
        });
      } else {
        fallbackCopy(email);
      }
    });

    function showCopySuccess() {
      const original = btnCopyEmail.textContent;
      btnCopyEmail.textContent = 'Copied! ✓';
      btnCopyEmail.style.borderColor = 'var(--accent-emerald)';
      btnCopyEmail.style.color = 'var(--accent-emerald)';
      showToast('Email address copied to clipboard! 📋', '✉️');
      setTimeout(() => {
        btnCopyEmail.textContent = original;
        btnCopyEmail.style.borderColor = '';
        btnCopyEmail.style.color = '';
      }, 2200);
    }

    function fallbackCopy(text) {
      const ta = document.createElement('textarea');
      ta.value = text;
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.select();
      try {
        document.execCommand('copy');
        showCopySuccess();
      } catch (e) {
        showToast('Direct copy unavailable. Email: ' + text, 'ℹ️');
      }
      document.body.removeChild(ta);
    }
  }

  // Contact Form Submission Simulation
  const contactForm = document.getElementById('contact-form');
  const btnSubmitForm = document.getElementById('btn-submit-form');

  if (contactForm && btnSubmitForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();

      const nameInput = document.getElementById('form-name');
      const emailInput = document.getElementById('form-email');
      const subjectInput = document.getElementById('form-subject');
      const messageInput = document.getElementById('form-message');

      if (!nameInput.value.trim() || !emailInput.value.trim() || !messageInput.value.trim()) {
        showToast('Please fill in all transmission fields.', '⚠️');
        return;
      }

      // Simulate transmission state
      initAudio();
      const originalHtml = btnSubmitForm.innerHTML;
      btnSubmitForm.disabled = true;
      btnSubmitForm.innerHTML = '<span>Transmitting through hyperspace...</span> 🛰️';

      setTimeout(() => {
        btnSubmitForm.disabled = false;
        btnSubmitForm.innerHTML = originalHtml;
        contactForm.reset();
        playCelestialChime(783.99);
        showToast(`Transmission received from ${nameInput.value || 'Fellow Explorer'}! Stardance will reply soon. ✨`, '🚀');
      }, 800);
    });
  }

  /* ==========================================================================
     10. Toast Notification System
     ========================================================================== */
  const toastContainer = document.getElementById('toast-container');

  function showToast(message, icon = '✦') {
    if (!toastContainer) return;

    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerHTML = `
      <span style="font-size: 1.2rem;">${icon}</span>
      <span>${message}</span>
    `;

    toastContainer.appendChild(toast);

    setTimeout(() => {
      toast.classList.add('fade-out');
      setTimeout(() => {
        if (toast.parentNode) {
          toast.parentNode.removeChild(toast);
        }
      }, 300);
    }, 3800);
  }

  /* ==========================================================================
     11. Live UTC Clock & Dynamic Year
     ========================================================================== */
  const utcClock = document.getElementById('footer-utc-clock');
  const currentYear = document.getElementById('current-year');

  if (currentYear) {
    currentYear.textContent = new Date().getFullYear();
  }

  function updateUtcClock() {
    if (!utcClock) return;
    const now = new Date();
    const hours = String(now.getUTCHours()).padStart(2, '0');
    const mins = String(now.getUTCMinutes()).padStart(2, '0');
    const secs = String(now.getUTCSeconds()).padStart(2, '0');
    utcClock.textContent = `${hours}:${mins}:${secs} UTC`;
  }

  updateUtcClock();
  setInterval(updateUtcClock, 1000);

  // Welcome Toast on Initial Load
  window.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
      showToast('Welcome to Stardance! Explore and create constellations below. ✨', '🪐');
    }, 800);
  });

})();
