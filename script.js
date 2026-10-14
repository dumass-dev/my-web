/**
 * STARDANCE - Minimal Sticky Note Theme Script
 * By chiefkaaf (@dumass-dev) for Hack Club
 * Simple, beginner-friendly vanilla JavaScript
 */

(function () {
  'use strict';

  /* ==========================================================================
     1. The Star Bouncer (Simple 2D Canvas Physics)
     ========================================================================== */
  const canvas = document.getElementById('canvas-toy');
  const countDisplay = document.getElementById('star-count');
  const btnDrop = document.getElementById('btn-drop');
  const btnClear = document.getElementById('btn-clear');

  if (canvas) {
    const ctx = canvas.getContext('2d');
    let width = (canvas.width = canvas.parentElement.clientWidth);
    let height = (canvas.height = canvas.parentElement.clientHeight);

    window.addEventListener('resize', () => {
      if (canvas.parentElement) {
        width = canvas.width = canvas.parentElement.clientWidth;
        height = canvas.height = canvas.parentElement.clientHeight;
      }
    });

    const gravity = 0.2;
    const bounce = -0.78;
    const colors = ['#eab308', '#16a34a', '#0284c7', '#db2777', '#7c3aed', '#ea580c'];
    const stars = [];

    class Star {
      constructor(x, y, vx, vy) {
        this.x = x !== undefined ? x : Math.random() * width;
        this.y = y !== undefined ? y : Math.random() * (height / 2);
        this.vx = vx !== undefined ? vx : (Math.random() - 0.5) * 5;
        this.vy = vy !== undefined ? vy : (Math.random() - 0.5) * 3;
        this.size = Math.random() * 2.5 + 2.5;
        this.color = colors[Math.floor(Math.random() * colors.length)];
      }

      update() {
        this.vy += gravity;
        this.x += this.vx;
        this.y += this.vy;

        // Air resistance
        this.vx *= 0.993;
        this.vy *= 0.995;

        // Floor collision
        if (this.y + this.size > height) {
          this.y = height - this.size;
          this.vy *= bounce;
        }

        // Ceiling collision
        if (this.y - this.size < 0) {
          this.y = this.size;
          this.vy *= bounce;
        }

        // Wall collisions
        if (this.x + this.size > width) {
          this.x = width - this.size;
          this.vx *= -0.85;
        } else if (this.x - this.size < 0) {
          this.x = this.size;
          this.vx *= -0.85;
        }
      }

      draw() {
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // Initialize 25 stars
    function init(count = 25) {
      stars.length = 0;
      for (let i = 0; i < count; i++) {
        stars.push(new Star());
      }
      updateCount();
    }
    init(25);

    function updateCount() {
      if (countDisplay) countDisplay.textContent = stars.length;
    }

    function addStar(x, y, vx = 0, vy = 0) {
      if (stars.length >= 120) stars.shift(); // keep it lightweight
      stars.push(new Star(
        x,
        y,
        vx || (Math.random() - 0.5) * 6,
        vy || (Math.random() - 0.5) * 4 - 2
      ));
      updateCount();
    }

    // Mouse / Touch interaction
    let isMouseDown = false;
    let lastX = 0, lastY = 0;

    canvas.addEventListener('mousedown', (e) => {
      isMouseDown = true;
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      lastX = x;
      lastY = y;
      addStar(x, y);
    });

    window.addEventListener('mouseup', () => {
      isMouseDown = false;
    });

    canvas.addEventListener('mousemove', (e) => {
      if (!isMouseDown) return;
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const vx = (x - lastX) * 0.35;
      const vy = (y - lastY) * 0.35;
      addStar(x, y, vx, vy);
      lastX = x;
      lastY = y;
    });

    canvas.addEventListener('touchstart', (e) => {
      const touch = e.touches[0];
      const rect = canvas.getBoundingClientRect();
      addStar(touch.clientX - rect.left, touch.clientY - rect.top);
    }, { passive: true });

    if (btnDrop) {
      btnDrop.addEventListener('click', () => {
        const cx = width / 2;
        const cy = height / 2;
        for (let i = 0; i < 15; i++) {
          const angle = Math.random() * Math.PI * 2;
          const speed = Math.random() * 6 + 2;
          stars.push(new Star(cx, cy, Math.cos(angle) * speed, Math.sin(angle) * speed));
        }
        updateCount();
      });
    }

    if (btnClear) {
      btnClear.addEventListener('click', () => {
        stars.length = 0;
        updateCount();
      });
    }

    // Spacebar drops a cluster
    window.addEventListener('keydown', (e) => {
      if (e.code === 'Space' && !['INPUT', 'TEXTAREA'].includes(document.activeElement?.tagName)) {
        e.preventDefault();
        const cx = Math.random() * width;
        const cy = Math.random() * (height / 2);
        for (let i = 0; i < 10; i++) {
          stars.push(new Star(cx, cy, (Math.random() - 0.5) * 6, (Math.random() - 0.5) * 5));
        }
        updateCount();
      }
    });

    // Animation Loop
    function loop() {
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, width, height);

      // Connect stars that are close together with delicate pencil-like lines
      const maxDist = 55;
      for (let i = 0; i < stars.length; i++) {
        for (let j = i + 1; j < stars.length; j++) {
          const dx = stars[i].x - stars[j].x;
          const dy = stars[i].y - stars[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < maxDist) {
            const alpha = 1 - dist / maxDist;
            ctx.strokeStyle = `rgba(100, 116, 139, ${alpha * 0.3})`;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(stars[i].x, stars[i].y);
            ctx.lineTo(stars[j].x, stars[j].y);
            ctx.stroke();
          }
        }
      }

      for (let star of stars) {
        star.update();
        star.draw();
      }

      requestAnimationFrame(loop);
    }
    loop();
  }

  /* ==========================================================================
     2. Community Pinboard (Simple Sticky Notes with LocalStorage)
     ========================================================================== */
  const pinForm = document.getElementById('pin-form');
  const pinAuthor = document.getElementById('pin-author');
  const pinText = document.getElementById('pin-text');
  const pinnedNotesEl = document.getElementById('pinned-notes');

  const NOTE_COLORS = ['note-yellow', 'note-mint', 'note-pink', 'note-blue', 'note-white'];

  const DEFAULT_NOTES = [
    { text: 'welcome to the board! leave a note if you want', author: 'chiefkaaf', color: 'note-yellow' },
    { text: 'reminder: keep things simple and handmade', author: 'past me', color: 'note-mint' },
    { text: 'hack club is fun', author: 'a friend', color: 'note-pink' },
    { text: 'tabs over spaces', author: 'visitor', color: 'note-blue' }
  ];

  function getNotes() {
    try {
      const saved = localStorage.getItem('chiefkaaf_board_notes');
      return saved ? JSON.parse(saved) : DEFAULT_NOTES;
    } catch (e) {
      return DEFAULT_NOTES;
    }
  }

  function saveNotes(arr) {
    try {
      localStorage.setItem('chiefkaaf_board_notes', JSON.stringify(arr));
    } catch (e) {
      // Storage error ignored
    }
  }

  function renderNotes() {
    if (!pinnedNotesEl) return;
    const list = getNotes();
    pinnedNotesEl.innerHTML = '';

    list.forEach((n) => {
      const el = document.createElement('div');
      el.className = `mini-note ${n.color || 'note-yellow'}`;
      el.innerHTML = `
        <div>"${escapeHTML(n.text)}"</div>
        <div class="mini-author">— ${escapeHTML(n.author || 'anon')}</div>
      `;
      pinnedNotesEl.appendChild(el);
    });
  }

  function escapeHTML(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  if (pinForm && pinText) {
    pinForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const text = pinText.value.trim();
      const author = pinAuthor.value.trim() || 'anon';

      if (!text) return;

      const list = getNotes();
      const color = NOTE_COLORS[Math.floor(Math.random() * NOTE_COLORS.length)];

      list.unshift({ text, author, color });
      if (list.length > 16) list.pop(); // keep last 16

      saveNotes(list);
      renderNotes();

      pinText.value = '';
    });
  }

  renderNotes();

})();
