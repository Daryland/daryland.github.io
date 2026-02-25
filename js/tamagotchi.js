/* =============================================
   TAMAGOTCHI — site-wide virtual pet
   Three characters assigned by browser fingerprint (stored in localStorage).
   Roams the full screen, has basic needs, doesn't block page interactions.
   ============================================= */
(function initTamagotchi() {
  'use strict';

  const SIZE = 64; // canvas px

  // --- localStorage helpers (throws in Firefox private mode, some CSP configs) ---
  function lsGet(key) {
    try { return localStorage.getItem(key); } catch (_) { return null; }
  }
  function lsSet(key, val) {
    try { localStorage.setItem(key, val); } catch (_) {}
  }

  // --- Character assignment (fingerprint → localStorage) ---
  function pickCharType() {
    const stored = lsGet('tama_char');
    if (stored && ['bot', 'cat', 'ghost'].includes(stored)) return stored;

    let seed = navigator.userAgent + navigator.language;
    try { seed += Intl.DateTimeFormat().resolvedOptions().timeZone || ''; } catch (_) {}

    // DJB2 hash
    let h = 5381;
    for (let i = 0; i < seed.length; i++) {
      h = ((h << 5) + h) ^ seed.charCodeAt(i);
    }
    const types = ['bot', 'cat', 'ghost'];
    const picked = types[Math.abs(h) % 3];
    lsSet('tama_char', picked);
    return picked;
  }

  const charType = pickCharType();

  // --- Character config ---
  const CHARS = {
    bot: {
      name: 'B0T',
      body:   '#495fef',
      dark:   '#3248d1',
      light:  '#8b9fff',
      phrases: {
        greeting: ['Hello.exe 👋', 'Booting up! 🤖', 'Online! ✅'],
        hungry:   ['Low battery! 🔋', 'Need fuel... ⚡', 'Charge me!'],
        bored:    ['...beep?', 'Debug me? 🤖', 'Run a loop!', 'Boop!'],
        happy:    ['Beep! 💙', 'Systems: green ✅', '01001000!'],
        sleep:    ['💤 shutdown...', '...zzz...', 'zzzz 💤'],
      },
    },
    cat: {
      name: 'Neko',
      body:   '#ff8c42',
      dark:   '#c45e1a',
      light:  '#ffc49e',
      phrases: {
        greeting: ['Meow! 😺', '*waves paw* 🐾', 'Nya~'],
        hungry:   ['Meow... 🐟', 'Feed me! 😿', '*hungry meow*'],
        bored:    ['Meow?', 'Pet me! 🐾', '*chirps*', 'Play!'],
        happy:    ['Purrrr~ 🧡', '*happy meow*', 'Mrrrow! 😸'],
        sleep:    ['💤 purrr...', '*snooze* 😴', 'zzz~ 🐱'],
      },
    },
    ghost: {
      name: 'Boo',
      body:   '#a78bfa',
      dark:   '#7c4cc7',
      light:  '#ddd6fe',
      phrases: {
        greeting: ['Booo! 👻', '*phases in* 🌙', 'Boo~!'],
        hungry:   ['Hungry 👻', 'Feed me...', '*spooky growl*'],
        bored:    ['Boo! 👻', 'Haunt with me?', '*floats sadly*'],
        happy:    ['Boo! 💜', '*happy haunting*', 'Spooky! 👻'],
        sleep:    ['💤 haunt...zzz', '*ghost snore*', 'zzz 👻'],
      },
    },
  };

  const char = CHARS[charType];

  // --- DOM ---
  const wrapper = document.createElement('div');
  wrapper.id = 'tama-wrapper';

  const pet = document.createElement('div');
  pet.id = 'tama-pet';

  const canvas = document.createElement('canvas');
  canvas.id = 'tama-canvas';
  canvas.width = SIZE;
  canvas.height = SIZE;

  const bubble = document.createElement('div');
  bubble.className = 'tama-bubble above';
  bubble.style.borderColor = char.body;
  bubble.style.border = `2px solid ${char.body}`;
  bubble.style.bottom = `${SIZE + 6}px`;

  const bubbleTip = document.createElement('div');
  bubbleTip.className = 'tama-bubble-tip';
  bubbleTip.style.borderTopColor = char.body;
  bubble.appendChild(bubbleTip);

  const nameTag = document.createElement('div');
  nameTag.className = 'tama-name';
  nameTag.textContent = char.name;
  nameTag.style.color = char.body;

  pet.append(canvas, bubble, nameTag);
  wrapper.appendChild(pet);
  document.body.appendChild(wrapper);

  const ctx = canvas.getContext('2d');

  // --- State ---
  let px = 100 + Math.random() * (window.innerWidth - 200);
  let py = 100 + Math.random() * (window.innerHeight - 200);
  let vx = (Math.random() > 0.5 ? 1 : -1) * (0.5 + Math.random() * 0.5);
  let vy = (Math.random() - 0.5) * 0.4;
  let state     = 'walking';
  let hunger    = 100;
  let mood      = 100;
  let frame     = 0;
  let isBlinking = false;
  let blinkTimer = 150;
  let bubbleTO   = null;
  let sleepFrames = 0;
  let idleFrames  = 0;
  let clickCool   = 0;
  let lastTs      = 0;

  // --- Speech bubble ---
  function say(text, ms) {
    if (bubbleTO) clearTimeout(bubbleTO);
    // Remove old text node
    if (bubble.firstChild !== bubbleTip) bubble.removeChild(bubble.firstChild);
    bubble.insertBefore(document.createTextNode(text), bubble.firstChild);
    bubble.style.opacity = '1';
    bubbleTO = setTimeout(() => { bubble.style.opacity = '0'; }, ms || 3000);
  }

  function randPhrase(key) {
    const arr = char.phrases[key];
    return arr[Math.floor(Math.random() * arr.length)];
  }

  // Position bubble above or below depending on vertical position
  function updateBubblePosition() {
    if (py < 120) {
      // Near top — show bubble below
      bubble.classList.remove('above');
      bubble.classList.add('below');
      bubble.style.bottom = '';
      bubble.style.top = `${SIZE + 6}px`;
      bubbleTip.style.borderTopColor = '';
      bubbleTip.style.borderBottomColor = char.body;
    } else {
      bubble.classList.remove('below');
      bubble.classList.add('above');
      bubble.style.top = '';
      bubble.style.bottom = `${SIZE + 6}px`;
      bubbleTip.style.borderBottomColor = '';
      bubbleTip.style.borderTopColor = char.body;
    }
  }

  setTimeout(() => say(randPhrase('greeting'), 4000), 800);

  // --- Click ---
  pet.addEventListener('click', () => {
    if (clickCool > 0) return;
    clickCool = 90;
    if (state === 'sleeping') {
      state = 'walking'; sleepFrames = 0;
      say('...Wha? 😴', 2500);
      return;
    }
    mood   = Math.min(100, mood + 25);
    hunger = Math.min(100, hunger + (state === 'hungry' ? 30 : 10));
    state  = 'happy';
    say(randPhrase('happy'), 2500);
    setTimeout(() => { if (state === 'happy') state = 'walking'; }, 2500);
  });

  // --- Drawing helpers ---
  function rr(x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r);
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
  }

  function drawEyes(lx, ly, rx, ry, blink) {
    if (blink) {
      ctx.fillStyle = char.dark;
      ctx.fillRect(lx - 5, ly, 10, 2);
      ctx.fillRect(rx - 5, ry, 10, 2);
      return;
    }
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(lx, ly, 5, 0, Math.PI * 2);
    ctx.arc(rx, ry, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#333';
    ctx.beginPath();
    ctx.arc(lx, ly, 2.5, 0, Math.PI * 2);
    ctx.arc(rx, ry, 2.5, 0, Math.PI * 2);
    ctx.fill();
    // Eye shine
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(lx - 1.5, ly - 1.5, 1.2, 0, Math.PI * 2);
    ctx.arc(rx - 1.5, ry - 1.5, 1.2, 0, Math.PI * 2);
    ctx.fill();
  }

  function drawZzz() {
    const now = Date.now() / 1000;
    ctx.font = 'bold 9px Inter, sans-serif';
    ctx.fillStyle = char.light;
    ctx.globalAlpha = 0.5 + 0.5 * Math.sin(now * 2);
    ctx.fillText('z', 46, 10 + Math.sin(now) * 2);
    ctx.font = 'bold 7px Inter, sans-serif';
    ctx.globalAlpha = 0.3 + 0.3 * Math.sin(now * 2 + 1);
    ctx.fillText('z', 52, 4 + Math.sin(now + 1));
    ctx.globalAlpha = 1;
  }

  // --- Character draw functions ---
  function drawBot(wf, blink, happy, sleeping) {
    const c = char;

    // Antenna
    ctx.fillStyle = c.dark;
    ctx.fillRect(29, 1, 3, 8);
    ctx.fillStyle = c.light;
    ctx.beginPath();
    ctx.arc(30.5, 1, 4, 0, Math.PI * 2);
    ctx.fill();

    // Head
    ctx.fillStyle = c.body;
    rr(7, 8, 50, 26, 6);
    ctx.fill();

    // Visor strip
    ctx.fillStyle = c.dark;
    rr(11, 18, 42, 7, 2);
    ctx.fill();

    // Eyes
    drawEyes(22, 22, 42, 22, blink);

    // Mouth
    if (happy) {
      ctx.strokeStyle = c.dark;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(32, 30, 5, 0, Math.PI);
      ctx.stroke();
    } else {
      ctx.fillStyle = c.dark;
      rr(23, 29, 18, 3, 1);
      ctx.fill();
    }

    // Body
    ctx.fillStyle = c.body;
    rr(13, 33, 38, 20, 4);
    ctx.fill();

    // Chest detail
    ctx.fillStyle = c.dark;
    rr(17, 37, 10, 9, 2);
    ctx.fill();
    ctx.fillStyle = c.light;
    rr(30, 38, 12, 4, 2);
    ctx.fill();

    // Arms (alternate height for walk)
    const ay = 35 + (wf ? 2 : 0);
    ctx.fillStyle = c.body;
    rr(1, ay, 13, 8, 3);
    ctx.fill();
    rr(50, ay, 13, 8, 3);
    ctx.fill();
    ctx.fillStyle = c.dark;
    rr(1, ay + 5, 13, 4, 2);
    ctx.fill();
    rr(50, ay + 5, 13, 4, 2);
    ctx.fill();

    // Legs
    if (!sleeping) {
      const l1x = wf ? 17 : 20;
      const l2x = wf ? 37 : 34;
      ctx.fillStyle = c.dark;
      ctx.fillRect(l1x, 52, 8, 8);
      ctx.fillRect(l2x, 52, 8, 8);
      ctx.fillStyle = c.body;
      ctx.fillRect(l1x - 2, 57, 12, 5);
      ctx.fillRect(l2x - 2, 57, 12, 5);
    } else {
      drawZzz();
    }
  }

  function drawCat(wf, blink, happy, sleeping) {
    const c = char;
    const tailSwing = Math.sin(Date.now() / 350) * 10;

    // Tail (draw first so it's behind body)
    ctx.strokeStyle = c.dark;
    ctx.lineWidth = 5;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(52, 48);
    ctx.quadraticCurveTo(60, 38, 56 + tailSwing * 0.5, 26 + tailSwing);
    ctx.stroke();
    ctx.strokeStyle = c.light;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(52, 48);
    ctx.quadraticCurveTo(60, 38, 56 + tailSwing * 0.5, 26 + tailSwing);
    ctx.stroke();

    // Ears
    ctx.fillStyle = c.dark;
    ctx.beginPath();
    ctx.moveTo(11, 22); ctx.lineTo(4, 5); ctx.lineTo(21, 16);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(41, 22); ctx.lineTo(58, 5); ctx.lineTo(47, 16);
    ctx.fill();
    // Inner ears
    ctx.fillStyle = '#ff9fce';
    ctx.beginPath();
    ctx.moveTo(12, 21); ctx.lineTo(7, 9); ctx.lineTo(19, 16);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(40, 21); ctx.lineTo(53, 9); ctx.lineTo(47, 17);
    ctx.fill();

    // Head
    ctx.fillStyle = c.body;
    ctx.beginPath();
    ctx.arc(32, 26, 18, 0, Math.PI * 2);
    ctx.fill();

    // Eyes (cat: dark with white shine)
    if (blink) {
      ctx.fillStyle = c.dark;
      ctx.fillRect(21, 25, 10, 2);
      ctx.fillRect(35, 25, 10, 2);
    } else {
      ctx.fillStyle = '#1a1a1a';
      ctx.beginPath();
      ctx.ellipse(26, 25, 4.5, 5.5, 0, 0, Math.PI * 2);
      ctx.ellipse(40, 25, 4.5, 5.5, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(25, 23, 1.5, 0, Math.PI * 2);
      ctx.arc(39, 23, 1.5, 0, Math.PI * 2);
      ctx.fill();
    }

    // Nose
    ctx.fillStyle = '#ff6b9e';
    ctx.beginPath();
    ctx.moveTo(32, 31); ctx.lineTo(29, 34); ctx.lineTo(35, 34);
    ctx.fill();

    // Mouth / happy smile
    if (happy) {
      ctx.strokeStyle = c.dark;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(28, 35, 3, 0, Math.PI);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(36, 35, 3, 0, Math.PI);
      ctx.stroke();
    }

    // Whiskers
    ctx.strokeStyle = c.dark;
    ctx.lineWidth = 1;
    ctx.globalAlpha = 0.45;
    [[8, 30, 22, 32], [8, 34, 22, 33], [56, 30, 42, 32], [56, 34, 42, 33]].forEach(([x1, y1, x2, y2]) => {
      ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke();
    });
    ctx.globalAlpha = 1;

    // Body
    ctx.fillStyle = c.body;
    ctx.beginPath();
    ctx.ellipse(30, 52, 17, 12, 0, 0, Math.PI * 2);
    ctx.fill();

    // Paws (alternating for walk)
    const pw = wf ? 3 : 0;
    ctx.fillStyle = c.dark;
    ctx.beginPath();
    ctx.ellipse(17, 62 + pw, 7, 4, -0.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(40, 62 - pw, 7, 4, 0.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = c.light;
    ctx.beginPath();
    ctx.ellipse(17, 62 + pw, 5, 3, -0.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(40, 62 - pw, 5, 3, 0.2, 0, Math.PI * 2);
    ctx.fill();

    if (sleeping) drawZzz();
  }

  function drawGhost(wf, blink, happy, sleeping) {
    const c = char;
    const bob = Math.sin(Date.now() / 560) * 3;
    const wave = Date.now() / 500;

    // Body dome + wavy bottom
    ctx.fillStyle = c.body;
    ctx.beginPath();
    ctx.arc(32, 26 + bob, 20, Math.PI, 0); // dome top
    ctx.lineTo(52, 50 + bob);
    // 5 scallops right → left
    ctx.quadraticCurveTo(48, 57 + bob + Math.sin(wave) * 4,       44, 50 + bob);
    ctx.quadraticCurveTo(40, 57 + bob + Math.sin(wave + 1) * 4,   36, 50 + bob);
    ctx.quadraticCurveTo(32, 58 + bob + Math.sin(wave + 2) * 4,   28, 50 + bob);
    ctx.quadraticCurveTo(24, 57 + bob + Math.sin(wave + 3) * 4,   20, 50 + bob);
    ctx.quadraticCurveTo(16, 58 + bob + Math.sin(wave + 4) * 4,   12, 50 + bob);
    ctx.closePath(); // closes back to arc start (12, 26+bob)
    ctx.fill();

    // Inner glow
    const grad = ctx.createRadialGradient(26, 20 + bob, 2, 32, 26 + bob, 18);
    grad.addColorStop(0, 'rgba(255,255,255,0.25)');
    grad.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(32, 26 + bob, 20, Math.PI, 0);
    ctx.lineTo(52, 50 + bob);
    ctx.lineTo(12, 50 + bob);
    ctx.fill();

    // Eyes
    if (blink) {
      ctx.fillStyle = c.dark;
      ctx.fillRect(20, 25 + bob, 9, 2);
      ctx.fillRect(34, 25 + bob, 9, 2);
    } else {
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.ellipse(24, 26 + bob, 4.5, 5.5, 0, 0, Math.PI * 2);
      ctx.ellipse(40, 26 + bob, 4.5, 5.5, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#333';
      ctx.beginPath();
      ctx.arc(24, 27 + bob, 2, 0, Math.PI * 2);
      ctx.arc(40, 27 + bob, 2, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(23, 25 + bob, 1, 0, Math.PI * 2);
      ctx.arc(39, 25 + bob, 1, 0, Math.PI * 2);
      ctx.fill();
    }

    // Smile
    if (happy) {
      ctx.strokeStyle = c.dark;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(32, 35 + bob, 6, 0, Math.PI);
      ctx.stroke();
    } else if (!blink) {
      ctx.fillStyle = c.dark;
      ctx.beginPath();
      ctx.arc(32, 36 + bob, 3, 0, Math.PI);
      ctx.fill();
    }

    if (sleeping) drawZzz();
  }

  function draw() {
    ctx.clearRect(0, 0, SIZE, SIZE);
    const wf      = Math.floor(frame / 18) % 2;
    const sleeping = state === 'sleeping';
    const happy    = state === 'happy';

    if (charType === 'bot')   drawBot(wf, isBlinking, happy, sleeping);
    if (charType === 'cat')   drawCat(wf, isBlinking, happy, sleeping);
    if (charType === 'ghost') drawGhost(wf, isBlinking, happy, sleeping);
  }

  // --- Game loop ---
  function loop(ts) {
    const dt = Math.min((ts - lastTs) / 16.67, 3);
    lastTs = ts;
    frame++;
    if (clickCool > 0) clickCool--;

    // Decay stats every ~8s at 60fps
    if (frame % 480 === 0) {
      hunger = Math.max(0, hunger - 3);
      mood   = Math.max(0, mood - 2);
    }

    // --- State machine ---
    if (state === 'sleeping') {
      sleepFrames -= dt;
      if (sleepFrames <= 0) {
        state = 'walking'; idleFrames = 0;
        bubble.style.opacity = '0';
        hunger = Math.min(100, hunger + 8);
      }
    } else if (state !== 'happy') {
      // Need-based overrides
      if (hunger < 20) {
        if (state !== 'hungry') { state = 'hungry'; say(randPhrase('hungry'), 3500); }
        else if (frame % 240 === 0) say(randPhrase('hungry'), 3500);
      } else if (mood < 20) {
        if (state !== 'bored') { state = 'bored'; say(randPhrase('bored'), 3500); }
        else if (frame % 240 === 0) say(randPhrase('bored'), 3500);
      } else if (state === 'hungry' || state === 'bored') {
        state = 'walking';
      }

      // Random idle
      if (state === 'walking') {
        idleFrames++;
        if (idleFrames > 400 && Math.random() < 0.003) {
          state = 'idle'; idleFrames = 0;
          setTimeout(() => { if (state === 'idle') state = 'walking'; }, 2000 + Math.random() * 2000);
        }
        // Random sleep (every ~12s, 25% chance, only when stats are OK)
        if (frame % 720 === 0 && hunger > 40 && mood > 30 && Math.random() < 0.25) {
          state = 'sleeping';
          sleepFrames = 240 + Math.random() * 360;
          say(randPhrase('sleep'), sleepFrames * 16.67);
        }
      }

      // Random direction change while walking
      if (state === 'walking' && frame % 90 === 0 && Math.random() < 0.25) {
        vx = (Math.random() > 0.5 ? 1 : -1) * (0.4 + Math.random() * 0.7);
        vy = (Math.random() - 0.5) * 0.5;
      }
    }

    // --- Speed per state ---
    const speeds = { walking: 0.9, idle: 0, sleeping: 0, hungry: 0.4, bored: 0.5, happy: 1.4 };
    const spd = speeds[state] ?? 0.9;

    // Happy bounce
    if (state === 'happy') vy = Math.sin(frame * 0.25) * 0.8;

    px += vx * spd * dt;
    py += vy * spd * dt;

    // Bounce off edges
    const m = 50;
    const maxX = window.innerWidth  - m;
    const maxY = window.innerHeight - 90;
    if (px < m)    { px = m;    vx =  Math.abs(vx); }
    if (px > maxX) { px = maxX; vx = -Math.abs(vx); }
    if (py < 50)   { py = 50;   vy =  Math.abs(vy); }
    if (py > maxY) { py = maxY; vy = -Math.abs(vy); }

    // Update DOM
    pet.style.left = (px - SIZE / 2) + 'px';
    pet.style.top  = (py - SIZE / 2) + 'px';

    // Flip canvas for direction (bubble + name stay unflipped)
    canvas.style.transform = (vx >= 0 || state === 'idle' || state === 'sleeping') ? '' : 'scaleX(-1)';

    updateBubblePosition();

    // Blink
    blinkTimer -= dt;
    if (blinkTimer <= 0 && !isBlinking) {
      isBlinking = true;
      blinkTimer = 130 + Math.random() * 130;
      setTimeout(() => { isBlinking = false; }, 110);
    }

    try { draw(); } catch (_) {}
    requestAnimationFrame(loop);
  }

  requestAnimationFrame(loop);
})();
