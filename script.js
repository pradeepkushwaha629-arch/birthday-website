/* ============================================
   BIRTHDAY SURPRISE — Vanilla JS Engine
   ============================================ */

(function () {
  'use strict';

  /* ---- Configuration (edit these) ---- */
  const CONFIG = {
    friendName: 'Ankita (Pulu)',
    dateOfBirth: '1999-06-26T12:00:00',
    birthdayLiveStart: { month: 6, day: 26, hour: 12, minute: 0 },
    birthdayLiveEnd: { month: 6, day: 27, hour: 0, minute: 0 },
    letterText: `Happy Birthday, My Best Friend ❤️

Today is not just another day...
It is the day the world became a little brighter because you were born.

Thank you for every smile,
every memory,
every laugh,
and every moment we shared.

No matter where life takes us,
our friendship will always stay special.

I wish you endless happiness,
good health,
big dreams,
success,
love,
and countless beautiful memories.

May this year become the most magical chapter of your life.

Stay happy,
keep smiling,
and never change.

Happy Birthday once again.

You deserve the entire universe.

❤️🎂✨`
  };

  /* ---- State ---- */
  let doorOpened = false;
  let experienceStarted = false;
  let surpriseTriggered = false;
  let letterTypingStarted = false;
  let isEntering = false;
  let introPhase = true;
  let introSparkleAnimId = null;
  let animationFrameId = null;
  let isPageVisible = !document.hidden;
  let scrollRafPending = false;
  let parallaxRafId = null;
  const parallaxTarget = { x: 0, y: 0 };
  const parallaxCurrent = { x: 0, y: 0 };
  let currentPhotoIndex = 0;
  let photoSources = [];

  const isTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  const isMobile = () => window.innerWidth <= 768;
  const isLowPower = isTouch && window.innerWidth <= 768;
  const useCustomCursor = () => window.innerWidth > 768;

  /* ---- DOM References ---- */
  const $ = (sel) => document.querySelector(sel);
  const $$ = (sel) => document.querySelectorAll(sel);

  const parallaxLayers = $$('.parallax-layer');
  const parallaxSections = $$('.section:not(.hero-section)');

  const introScreen = $('#intro-screen');
  const mainExperience = $('#main-experience');
  const openBtn = $('#open-surprise-btn');
  const giftBox = $('#gift-box');
  const giftLid = $('#gift-lid');
  const giftBow = $('#gift-bow');
  const ribbonV = $('#ribbon-v');
  const ribbonH = $('#ribbon-h');
  const giftScene = $('#gift-scene');
  const lightBurst = $('#gift-light-burst');
  const giftSmoke = $('#gift-smoke');
  const screenFlash = $('#screen-flash');
  const birthdayTitle = $('#birthday-title');
  const friendNameEl = $('#friend-name');
  const musicPlayer = $('#music-player');
  const audio = $('#birthday-audio');
  const musicToggle = $('#music-toggle');
  const progressFill = $('#music-progress-fill');
  const progressBar = $('#music-progress-bar');
  const musicTime = $('#music-time');
  const volumeSlider = $('#music-volume');
  const letterContent = $('#letter-content');
  const letterCursor = $('#letter-cursor');
  const photoModal = $('#photo-modal');
  const modalImg = $('#modal-img');
  const modalClose = $('#modal-close');
  const finalMessage = $('#final-message');
  const oneMoreBtn = $('#one-more-surprise');
  const lightRays = $('.light-rays');
  const floatingContainer = $('#floating-elements');
  const balloonsContainer = $('#balloons-container');
  const butterfliesContainer = $('#butterflies-container');
  const cursorSparkle = $('#cursor-sparkle');
  const customCursor = $('#custom-cursor');
  const mouseTrail = $('#mouse-trail');
  const scrollProgress = $('#scroll-progress');
  const scrollProgressFill = $('#scroll-progress-fill');
  const sectionNav = $('#section-nav');
  const backToTop = $('#back-to-top');
  const modalPrev = $('#modal-prev');
  const modalNext = $('#modal-next');
  const modalCounter = $('#modal-counter');
  const musicCollapse = $('#music-collapse');
  const galleryGrid = $('#gallery-grid');
  const introSparkleCanvas = $('#intro-sparkle-canvas');
  const introSpotlight = $('#intro-spotlight');
  const introMessageEl = $('#intro-message');
  const gateLayer = $('#gate-layer');
  const gateInterior = $('#gate-interior');
  const openDoorBtn = $('#open-door-btn');
  const gateDoorLeft = $('#gate-door-left');
  const gateDoorRight = $('#gate-door-right');
  const gateLightThrough = $('#gate-light-through');

  if (isTouch) document.body.classList.add('is-touch');
  if (useCustomCursor()) document.body.classList.add('has-custom-cursor');

  /* ---- Canvas Setup ---- */
  const particlesCanvas = $('#particles-canvas');
  const effectsCanvas = $('#effects-canvas');
  const fireworksCanvas = $('#fireworks-canvas');
  const pCtx = particlesCanvas.getContext('2d');
  const eCtx = effectsCanvas.getContext('2d');
  const fCtx = fireworksCanvas.getContext('2d');

  let width, height;

  function resizeCanvas() {
    width = window.innerWidth;
    height = window.innerHeight;
    [particlesCanvas, effectsCanvas, fireworksCanvas].forEach((c) => {
      c.width = width;
      c.height = height;
    });
  }

  window.addEventListener('resize', resizeCanvas);
  resizeCanvas();

  /* ============================================
     UTILITY — Easing & Animation Helpers
     ============================================ */
  const ease = {
    outCubic: (t) => 1 - Math.pow(1 - t, 3),
    outElastic: (t) => {
      if (t === 0 || t === 1) return t;
      return Math.pow(2, -10 * t) * Math.sin((t - 0.075) * (2 * Math.PI) / 0.3) + 1;
    },
    outBounce: (t) => {
      const n1 = 7.5625, d1 = 2.75;
      if (t < 1 / d1) return n1 * t * t;
      if (t < 2 / d1) return n1 * (t -= 1.5 / d1) * t + 0.75;
      if (t < 2.5 / d1) return n1 * (t -= 2.25 / d1) * t + 0.9375;
      return n1 * (t -= 2.625 / d1) * t + 0.984375;
    }
  };

  function animate({ duration, delay = 0, onUpdate, onComplete }) {
    const start = performance.now() + delay;
    function frame(now) {
      if (now < start) {
        requestAnimationFrame(frame);
        return;
      }
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      onUpdate(progress);
      if (progress < 1) {
        requestAnimationFrame(frame);
      } else if (onComplete) {
        onComplete();
      }
    }
    requestAnimationFrame(frame);
  }

  function delay(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  function random(min, max) {
    return Math.random() * (max - min) + min;
  }

  function randomColor() {
    const colors = ['#ff6b9d', '#a855f7', '#ffd700', '#ff8fab', '#b24bf3', '#ffe566'];
    return colors[Math.floor(Math.random() * colors.length)];
  }

  /* ============================================
     PARTICLE ENGINE — Background Particles
     ============================================ */
  const bgParticles = [];
  const MAX_SPARKLES = 30;
  const MAX_CONFETTI = 50;
  let PARTICLE_COUNT = isLowPower ? 18 : 40;
  let frameTick = 0;

  class BgParticle {
    constructor() {
      this.reset();
    }

    reset() {
      this.x = random(0, width);
      this.y = random(0, height);
      this.size = random(1, 3);
      this.speedX = random(-0.3, 0.3);
      this.speedY = random(-0.5, -0.1);
      this.opacity = random(0.2, 0.8);
      this.color = randomColor();
      this.twinkle = random(0, Math.PI * 2);
    }

    update() {
      this.x += this.speedX;
      this.y += this.speedY;
      this.twinkle += 0.02;
      if (this.y < -10 || this.x < -10 || this.x > width + 10) {
        this.x = random(0, width);
        this.y = height + 10;
      }
    }

    draw(ctx) {
      const alpha = this.opacity * (0.5 + 0.5 * Math.sin(this.twinkle));
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fillStyle = this.color;
      ctx.globalAlpha = alpha;
      ctx.fill();
      ctx.globalAlpha = 1;
    }
  }

  for (let i = 0; i < PARTICLE_COUNT; i++) {
    bgParticles.push(new BgParticle());
  }

  /* ============================================
     CONFETTI ENGINE
     ============================================ */
  const confetti = [];

  class ConfettiPiece {
    constructor(x, y, burst = false) {
      this.x = x ?? random(0, width);
      this.y = y ?? (burst ? height / 2 : -20);
      this.size = random(6, 12);
      this.color = randomColor();
      this.speedX = random(-8, 8);
      this.speedY = burst ? random(-15, -5) : random(2, 6);
      this.rotation = random(0, 360);
      this.rotationSpeed = random(-10, 10);
      this.gravity = 0.15;
      this.opacity = 1;
      this.shape = Math.random() > 0.5 ? 'rect' : 'circle';
    }

    update() {
      this.x += this.speedX;
      this.speedY += this.gravity;
      this.y += this.speedY;
      this.rotation += this.rotationSpeed;
      this.speedX *= 0.99;
      if (this.y > height + 20) this.opacity = 0;
    }

    draw(ctx) {
      if (this.opacity <= 0) return;
      ctx.save();
      ctx.translate(this.x, this.y);
      ctx.rotate((this.rotation * Math.PI) / 180);
      ctx.globalAlpha = this.opacity;
      ctx.fillStyle = this.color;
      if (this.shape === 'rect') {
        ctx.fillRect(-this.size / 2, -this.size / 4, this.size, this.size / 2);
      } else {
        ctx.beginPath();
        ctx.arc(0, 0, this.size / 2, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    }

    isDead() {
      return this.opacity <= 0 || this.y > height + 50;
    }
  }

  function spawnConfetti(count = 150, burst = false) {
    const room = Math.max(0, MAX_CONFETTI - confetti.length);
    const n = Math.min(count, room);
    const cx = burst ? width / 2 : undefined;
    const cy = burst ? height / 2 : undefined;
    for (let i = 0; i < n; i++) {
      confetti.push(new ConfettiPiece(
        burst ? cx + random(-50, 50) : undefined,
        burst ? cy + random(-50, 50) : undefined,
        burst
      ));
    }
  }

  /* ============================================
     FIREWORKS ENGINE
     ============================================ */
  const fireworks = [];
  const fireworkParticles = [];

  class Firework {
    constructor(x, targetY) {
      this.x = x;
      this.y = height;
      this.targetY = targetY;
      this.speed = random(8, 14);
      this.color = randomColor();
      this.trail = [];
      this.exploded = false;
    }

    update() {
      this.trail.push({ x: this.x, y: this.y });
      if (this.trail.length > 8) this.trail.shift();
      this.y -= this.speed;
      if (this.y <= this.targetY && !this.exploded) {
        this.exploded = true;
        explodeFirework(this.x, this.y, this.color);
        return true;
      }
      return false;
    }

    draw(ctx) {
      this.trail.forEach((t, i) => {
        ctx.beginPath();
        ctx.arc(t.x, t.y, 2, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.globalAlpha = i / this.trail.length;
        ctx.fill();
      });
      ctx.globalAlpha = 1;
      ctx.beginPath();
      ctx.arc(this.x, this.y, 3, 0, Math.PI * 2);
      ctx.fillStyle = this.color;
      ctx.fill();
    }
  }

  class FireworkParticle {
    constructor(x, y, color) {
      this.x = x;
      this.y = y;
      this.color = color;
      const angle = random(0, Math.PI * 2);
      const speed = random(2, 8);
      this.speedX = Math.cos(angle) * speed;
      this.speedY = Math.sin(angle) * speed;
      this.opacity = 1;
      this.decay = random(0.01, 0.025);
      this.size = random(2, 4);
    }

    update() {
      this.x += this.speedX;
      this.y += this.speedY;
      this.speedY += 0.05;
      this.speedX *= 0.98;
      this.opacity -= this.decay;
    }

    draw(ctx) {
      if (this.opacity <= 0) return;
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fillStyle = this.color;
      ctx.globalAlpha = this.opacity;
      ctx.fill();
      ctx.globalAlpha = 1;
    }

    isDead() {
      return this.opacity <= 0;
    }
  }

  function explodeFirework(x, y, color) {
    const count = random(60, 100);
    for (let i = 0; i < count; i++) {
      fireworkParticles.push(new FireworkParticle(x, y, color));
    }
  }

  function launchFirework() {
    fireworks.push(new Firework(random(width * 0.1, width * 0.9), random(height * 0.1, height * 0.4)));
  }

  function launchFireworkShow(count = 8, interval = 300) {
    for (let i = 0; i < count; i++) {
      setTimeout(() => launchFirework(), i * interval);
    }
  }

  /* ============================================
     GOLDEN SPARKLES & METEORS (Effects Canvas)
     ============================================ */
  const sparkles = [];
  const meteors = [];

  class Sparkle {
    constructor(x, y) {
      this.x = x ?? random(0, width);
      this.y = y ?? random(0, height);
      this.size = random(1, 4);
      this.life = 1;
      this.decay = random(0.01, 0.03);
      this.speedX = random(-2, 2);
      this.speedY = random(-3, -1);
    }

    update() {
      this.x += this.speedX;
      this.y += this.speedY;
      this.life -= this.decay;
    }

    draw(ctx) {
      if (this.life <= 0) return;
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size * this.life, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255, 215, 0, ${this.life})`;
      ctx.fill();
    }

    isDead() {
      return this.life <= 0;
    }
  }

  class Meteor {
    constructor() {
      this.reset();
    }

    reset() {
      this.x = random(0, width);
      this.y = random(-100, -20);
      this.length = random(60, 120);
      this.speed = random(8, 15);
      this.angle = Math.PI / 4;
      this.opacity = random(0.3, 0.8);
    }

    update() {
      this.x += Math.cos(this.angle) * this.speed;
      this.y += Math.sin(this.angle) * this.speed;
      if (this.y > height + 100) this.reset();
    }

    draw(ctx) {
      const tailX = this.x - Math.cos(this.angle) * this.length;
      const tailY = this.y - Math.sin(this.angle) * this.length;
      const grad = ctx.createLinearGradient(tailX, tailY, this.x, this.y);
      grad.addColorStop(0, 'transparent');
      grad.addColorStop(1, `rgba(255, 255, 255, ${this.opacity})`);
      ctx.beginPath();
      ctx.moveTo(tailX, tailY);
      ctx.lineTo(this.x, this.y);
      ctx.strokeStyle = grad;
      ctx.lineWidth = 2;
      ctx.stroke();
    }
  }

  for (let i = 0; i < (isMobile() ? 1 : 2); i++) {
    meteors.push(new Meteor());
  }

  function burstSparkles(x, y, count = 80) {
    const room = Math.max(0, MAX_SPARKLES - sparkles.length);
    const n = Math.min(count, room);
    for (let i = 0; i < n; i++) {
      sparkles.push(new Sparkle(x, y));
    }
  }

  function stopIntroEffects() {
    introPhase = false;
    if (introSparkleAnimId) {
      cancelAnimationFrame(introSparkleAnimId);
      introSparkleAnimId = null;
    }
    if (introSparkleCanvas) introSparkleCanvas.style.display = 'none';
    if (introSpotlight) introSpotlight.style.display = 'none';
  }

  /* ============================================
     MAIN RENDER LOOP
     ============================================ */
  function renderLoop() {
    if (!isPageVisible) {
      animationFrameId = null;
      return;
    }

    frameTick++;
    const lite = introPhase && frameTick % 2 === 0;

    if (!lite) {
      pCtx.clearRect(0, 0, width, height);
      bgParticles.forEach((p) => {
        p.update();
        p.draw(pCtx);
      });
    }

    if (confetti.length || sparkles.length || (experienceStarted && meteors.length)) {
      eCtx.clearRect(0, 0, width, height);
      for (let i = confetti.length - 1; i >= 0; i--) {
        confetti[i].update();
        confetti[i].draw(eCtx);
        if (confetti[i].isDead()) confetti.splice(i, 1);
      }
      for (let i = sparkles.length - 1; i >= 0; i--) {
        sparkles[i].update();
        sparkles[i].draw(eCtx);
        if (sparkles[i].isDead()) sparkles.splice(i, 1);
      }
      if (experienceStarted) {
        meteors.forEach((m) => {
          m.update();
          m.draw(eCtx);
        });
      }
    }

    if (fireworks.length || fireworkParticles.length) {
      fCtx.clearRect(0, 0, width, height);
      fCtx.globalCompositeOperation = 'lighter';
      for (let i = fireworks.length - 1; i >= 0; i--) {
        const dead = fireworks[i].update();
        fireworks[i].draw(fCtx);
        if (dead) fireworks.splice(i, 1);
      }
      for (let i = fireworkParticles.length - 1; i >= 0; i--) {
        fireworkParticles[i].update();
        fireworkParticles[i].draw(fCtx);
        if (fireworkParticles[i].isDead()) fireworkParticles.splice(i, 1);
      }
      fCtx.globalCompositeOperation = 'source-over';
    }

    animationFrameId = requestAnimationFrame(renderLoop);
  }

  renderLoop();

  document.addEventListener('visibilitychange', () => {
    isPageVisible = !document.hidden;
    if (isPageVisible) {
      if (!animationFrameId) renderLoop();
    } else if (introSparkleAnimId) {
      cancelAnimationFrame(introSparkleAnimId);
      introSparkleAnimId = null;
    }
  });

  /* ============================================
     SMOOTH ENGINE — RAF scroll & parallax
     ============================================ */
  const PARALLAX_LERP = 0.14;

  function scheduleParallaxTick() {
    if (parallaxRafId) return;
    parallaxRafId = requestAnimationFrame(parallaxTick);
  }

  function parallaxTick() {
    parallaxRafId = null;
    parallaxCurrent.x += (parallaxTarget.x - parallaxCurrent.x) * PARALLAX_LERP;
    parallaxCurrent.y += (parallaxTarget.y - parallaxCurrent.y) * PARALLAX_LERP;

    const depthMul = isTouch ? 4 : 8;
    parallaxLayers.forEach((layer, i) => {
      const depth = (i + 1) * depthMul;
      layer.style.transform = `translate3d(${parallaxCurrent.x * depth}px, ${parallaxCurrent.y * depth}px, 0)`;
    });

    const dx = Math.abs(parallaxTarget.x - parallaxCurrent.x);
    const dy = Math.abs(parallaxTarget.y - parallaxCurrent.y);
    if (dx > 0.002 || dy > 0.002) scheduleParallaxTick();
  }

  function setParallaxFromPoint(clientX, clientY) {
    parallaxTarget.x = (clientX / width - 0.5) * 2;
    parallaxTarget.y = (clientY / height - 0.5) * 2;
    scheduleParallaxTick();
  }

  function updateSectionParallax() {
    if (isMobile() || !experienceStarted) return;
    const viewCenter = window.innerHeight * 0.5;
    parallaxSections.forEach((section) => {
      const rect = section.getBoundingClientRect();
      const center = rect.top + rect.height * 0.5;
      const offset = Math.max(-60, Math.min(60, (center - viewCenter) * 0.025));
      section.style.transform = `translate3d(0, ${offset}px, 0)`;
    });
  }

  function scheduleScrollUpdate() {
    if (scrollRafPending) return;
    scrollRafPending = true;
    requestAnimationFrame(() => {
      scrollRafPending = false;
      updateScrollUI();
      updateSectionParallax();
    });
  }

  /* ============================================
     FLOATING DOM ELEMENTS
     ============================================ */
  function createHeart(x, y) {
    const heart = document.createElement('div');
    heart.className = 'floating-heart';
    heart.textContent = ['❤️', '💕', '💖', '💗'][Math.floor(Math.random() * 4)];
    heart.style.left = (x ?? random(0, width)) + 'px';
    heart.style.top = (y ?? height + 20) + 'px';
    heart.style.animationDuration = random(4, 8) + 's';
    floatingContainer.appendChild(heart);
    setTimeout(() => heart.remove(), 8000);
  }

  function spawnHearts(count = 5) {
    for (let i = 0; i < count; i++) {
      setTimeout(() => createHeart(), i * 200);
    }
  }

  function createBalloon() {
    const colors = ['#ff6b9d', '#a855f7', '#ffd700', '#ff8fab', '#60a5fa'];
    const balloon = document.createElement('div');
    balloon.className = 'balloon';
    balloon.style.left = random(5, 95) + '%';
    balloon.style.animationDuration = random(6, 12) + 's';
    const body = document.createElement('div');
    body.className = 'balloon-body';
    body.style.background = `radial-gradient(circle at 35% 30%, ${colors[Math.floor(Math.random() * colors.length)]}, ${colors[Math.floor(Math.random() * colors.length)]})`;
    body.style.color = colors[Math.floor(Math.random() * colors.length)];
    const string = document.createElement('div');
    string.className = 'balloon-string';
    balloon.appendChild(body);
    balloon.appendChild(string);
    balloonsContainer.appendChild(balloon);
    setTimeout(() => balloon.remove(), 15000);
  }

  function spawnBalloons(count = 12) {
    for (let i = 0; i < count; i++) {
      setTimeout(() => createBalloon(), i * 300);
    }
  }

  function createButterfly() {
    const bf = document.createElement('div');
    bf.className = 'butterfly';
    bf.textContent = '🦋';
    bf.style.left = random(10, 80) + '%';
    bf.style.top = random(20, 70) + '%';
    bf.style.animationDuration = random(6, 12) + 's';
    butterfliesContainer.appendChild(bf);
    setTimeout(() => bf.remove(), 15000);
  }

  function spawnButterflies(count = 6) {
    for (let i = 0; i < count; i++) {
      setTimeout(() => createButterfly(), i * 500);
    }
  }

  function createBubble() {
    const bubble = document.createElement('div');
    bubble.className = 'bubble';
    const size = random(10, 40);
    bubble.style.width = size + 'px';
    bubble.style.height = size + 'px';
    bubble.style.left = random(0, width) + 'px';
    bubble.style.bottom = '-50px';
    bubble.style.animationDuration = random(6, 14) + 's';
    floatingContainer.appendChild(bubble);
    setTimeout(() => bubble.remove(), 15000);
  }

  function startBubbleLoop() {
    setInterval(() => {
      if (experienceStarted) createBubble();
    }, 2000);
  }

  /* ============================================
     CURSOR & INTERACTION EFFECTS
     ============================================ */
  let mouseX = window.innerWidth / 2;
  let mouseY = window.innerHeight / 2;
  let trailThrottle = 0;
  let cursorVisible = false;

  function moveCustomCursor(x, y) {
    mouseX = x;
    mouseY = y;
    if (!useCustomCursor() || !customCursor) return;

    customCursor.style.left = x + 'px';
    customCursor.style.top = y + 'px';
    if (!cursorVisible) {
      customCursor.classList.add('active');
      cursorVisible = true;
    }

    if (cursorSparkle) {
      cursorSparkle.style.left = x + 'px';
      cursorSparkle.style.top = y + 'px';
      cursorSparkle.classList.add('visible');
    }
  }

  function initCustomCursor() {
    if (!useCustomCursor() || !customCursor) return;

    moveCustomCursor(mouseX, mouseY);
    customCursor.classList.add('active');
    cursorVisible = true;

    document.addEventListener('mousedown', () => customCursor.classList.add('click'));
    document.addEventListener('mouseup', () => customCursor.classList.remove('click'));

    document.addEventListener('mouseleave', () => {
      customCursor.classList.remove('active');
      if (cursorSparkle) cursorSparkle.classList.remove('visible');
      cursorVisible = false;
    });

    document.addEventListener('mouseenter', (e) => {
      moveCustomCursor(e.clientX, e.clientY);
    });

    window.addEventListener('resize', () => {
      document.body.classList.toggle('has-custom-cursor', useCustomCursor());
      if (useCustomCursor()) {
        moveCustomCursor(mouseX, mouseY);
      } else if (customCursor) {
        customCursor.classList.remove('active');
      }
    });
  }

  initCustomCursor();

  document.addEventListener('mousemove', (e) => {
    moveCustomCursor(e.clientX, e.clientY);
    setParallaxFromPoint(e.clientX, e.clientY);

    if (useCustomCursor() && mouseTrail) {
      const now = Date.now();
      if (now - trailThrottle > 40) {
        trailThrottle = now;
        const dot = document.createElement('div');
        dot.className = 'trail-dot';
        const size = random(3, 8);
        dot.style.width = size + 'px';
        dot.style.height = size + 'px';
        dot.style.left = mouseX + 'px';
        dot.style.top = mouseY + 'px';
        dot.style.background = randomColor();
        dot.style.boxShadow = `0 0 ${size}px ${randomColor()}`;
        mouseTrail.appendChild(dot);
        setTimeout(() => dot.remove(), 800);
      }
    }
  });

  /* ---- Parallax ---- */
  document.addEventListener('click', (e) => {
    const x = e.clientX ?? (e.touches && e.touches[0]?.clientX);
    const y = e.clientY ?? (e.touches && e.touches[0]?.clientY);
    if (x != null) {
      createRipple(x, y);
      if (experienceStarted) burstSparkles(x, y, isMobile() ? 8 : 15);
    }
  });

  if (isTouch) {
    document.addEventListener('touchstart', (e) => {
      const t = e.touches[0];
      createTouchSparkle(t.clientX, t.clientY);
      if (experienceStarted) burstSparkles(t.clientX, t.clientY, 10);
    }, { passive: true });

    document.addEventListener('touchmove', (e) => {
      const t = e.touches[0];
      setParallaxFromPoint(t.clientX, t.clientY);
    }, { passive: true });
  }

  function createTouchSparkle(x, y) {
    const spark = document.createElement('div');
    spark.className = 'touch-sparkle';
    spark.textContent = ['✨', '💫', '⭐'][Math.floor(Math.random() * 3)];
    spark.style.left = x + 'px';
    spark.style.top = y + 'px';
    document.body.appendChild(spark);
    setTimeout(() => spark.remove(), 600);
  }

  function createRipple(x, y) {
    const ripple = document.createElement('div');
    ripple.className = 'ripple';
    ripple.style.left = x + 'px';
    ripple.style.top = y + 'px';
    ripple.style.width = '0';
    ripple.style.height = '0';
    document.body.appendChild(ripple);
    setTimeout(() => ripple.remove(), 800);
  }

  /* ---- Parallax mouse (handled in cursor mousemove) ---- */

  /* ============================================
     ONE-TAP ENTER — Door + Gift + Inside
     ============================================ */
  async function enterSurprise() {
    if (isEntering || doorOpened) return;
    if (!gateLayer || !gateDoorLeft || !gateDoorRight) return;

    isEntering = true;
    doorOpened = true;
    experienceStarted = true;

    stopIntroEffects();

    gateLayer.classList.add('opening');
    document.body.classList.add('gate-opening');

    gateDoorLeft.classList.add('open');
    gateDoorRight.classList.add('open');
    if (gateLightThrough) gateLightThrough.classList.add('burst');

    if (gateInterior) gateInterior.classList.add('revealed');

    const doorsWrap = $('.gate-doors-wrap');
    if (doorsWrap) {
      const r = doorsWrap.getBoundingClientRect();
      burstSparkles(r.left + r.width / 2, r.top + r.height / 2, isMobile() ? 20 : 35);
    }

    await delay(700);

    gateLayer.classList.add('hidden');
    document.body.classList.remove('gate-opening');
    document.body.classList.add('gift-opening');

    if (giftScene) giftScene.classList.add('zooming');
    if (giftBow) giftBow.classList.add('opening');
    if (ribbonV) ribbonV.classList.add('untied');
    if (ribbonH) ribbonH.classList.add('untied');
    if (giftBow) giftBow.classList.add('untied');

    await delay(350);

    if (giftBox) giftBox.classList.add('opening');
    if (giftLid) giftLid.classList.add('open');
    if (giftSmoke) giftSmoke.classList.add('active');
    if (lightBurst) lightBurst.classList.add('burst');

    if (giftBox) {
      const rect = giftBox.getBoundingClientRect();
      burstSparkles(rect.left + rect.width / 2, rect.top + rect.height / 2, isMobile() ? 25 : 40);
    }

    await delay(300);

    const fx = isMobile() ? 0.35 : 0.55;
    spawnConfetti(Math.floor(50 * fx), true);
    launchFireworkShow(3, 220);
    spawnHearts(isMobile() ? 5 : 8);
    spawnBalloons(isMobile() ? 4 : 6);

    screenFlash.classList.add('flash');
    await delay(120);
    screenFlash.classList.remove('flash');
    screenFlash.classList.add('fade-out');

    introScreen.classList.add('exit');
    mainExperience.classList.remove('hidden');
    mainExperience.classList.add('visible');
    document.body.classList.remove('intro-active');
    lightRays.classList.add('active');
    document.body.classList.add('experience-active');
    document.body.classList.remove('gift-opening');

    scrollProgress.classList.add('visible');
    sectionNav.classList.remove('hidden');
    if (isMobile()) musicPlayer.classList.add('collapsed');

    startMusic();
    musicPlayer.classList.remove('hidden');
    musicPlayer.classList.add('show');
    animateBirthdayTitle();

    const effectInterval = isMobile() ? 5000 : 3500;
    setInterval(() => {
      if (Math.random() > 0.75) launchFirework();
      if (Math.random() > 0.6) spawnHearts(1);
    }, effectInterval);

    if (!isMobile()) startBubbleLoop();
  }

  /* Legacy alias — not used for entry */
  async function openGiftExperience() {
    if (!doorOpened) enterSurprise();
  }

  /* ============================================
     BIRTHDAY TITLE — Letter by Letter
     ============================================ */
  function animateBirthdayTitle() {
    const text = 'HAPPY BIRTHDAY';
    birthdayTitle.innerHTML = '';

    text.split('').forEach((char, i) => {
      const span = document.createElement('span');
      if (char === ' ') {
        span.className = 'letter space';
        span.innerHTML = '&nbsp;';
      } else {
        span.className = 'letter';
        span.textContent = char;
        span.style.animationDelay = `${i * 0.12}s, ${i * 0.12 + 0.8}s`;
        setTimeout(() => span.classList.add('revealed'), i * 120 + 900);
      }
      birthdayTitle.appendChild(span);
    });

    const totalDelay = text.length * 120 + 800;

    setTimeout(() => {
      const dearest = $('.dearest-label');
      dearest.classList.add('visible');

      setTimeout(() => {
        revealFriendName();
        activateNameSparkleRing();
      }, 1200);
    }, totalDelay);
  }

  function activateNameSparkleRing() {
    const ring = $('#name-sparkle-ring');
    if (!ring) return;
    ring.innerHTML = '';
    const count = isMobile() ? 8 : 12;
    for (let i = 0; i < count; i++) {
      const dot = document.createElement('div');
      dot.className = 'sparkle-dot';
      dot.style.animationDelay = `${(i / count) * 4}s`;
      dot.style.top = '50%';
      dot.style.left = '50%';
      dot.style.marginTop = '-3px';
      dot.style.marginLeft = '-3px';
      ring.appendChild(dot);
    }
    ring.classList.add('active');
  }

  function revealFriendName() {
    const name = CONFIG.friendName;
    friendNameEl.innerHTML = '';
    friendNameEl.classList.add('visible');

    name.split('').forEach((char, i) => {
      const span = document.createElement('span');
      span.className = 'name-char';
      span.textContent = char === ' ' ? '\u00A0' : char;
      span.style.animationDelay = `${i * 0.08}s, ${i * 0.08 + 0.7}s`;
      friendNameEl.appendChild(span);

      setTimeout(() => {
        span.classList.add('wave');
      }, i * 80 + 700);
    });
  }

  /* ============================================
     MUSIC PLAYER
     ============================================ */
  function startMusic() {
    audio.volume = volumeSlider.value / 100;
    audio.play().catch(() => {});
  }

  musicToggle.addEventListener('click', () => {
    const playIcon = musicToggle.querySelector('.icon-play');
    const pauseIcon = musicToggle.querySelector('.icon-pause');
    if (audio.paused) {
      audio.play();
      playIcon.classList.add('hidden');
      pauseIcon.classList.remove('hidden');
    } else {
      audio.pause();
      playIcon.classList.remove('hidden');
      pauseIcon.classList.add('hidden');
    }
  });

  volumeSlider.addEventListener('input', () => {
    audio.volume = volumeSlider.value / 100;
  });

  audio.addEventListener('timeupdate', () => {
    if (audio.duration) {
      const pct = (audio.currentTime / audio.duration) * 100;
      progressFill.style.width = pct + '%';
      const mins = Math.floor(audio.currentTime / 60);
      const secs = Math.floor(audio.currentTime % 60).toString().padStart(2, '0');
      musicTime.textContent = `${mins}:${secs}`;
    }
  });

  progressBar.addEventListener('click', (e) => {
    const rect = progressBar.getBoundingClientRect();
    const pct = (e.clientX - rect.left) / rect.width;
    if (audio.duration) audio.currentTime = pct * audio.duration;
  });

  audio.addEventListener('play', () => {
    musicToggle.querySelector('.icon-play').classList.add('hidden');
    musicToggle.querySelector('.icon-pause').classList.remove('hidden');
  });

  audio.addEventListener('pause', () => {
    musicToggle.querySelector('.icon-play').classList.remove('hidden');
    musicToggle.querySelector('.icon-pause').classList.add('hidden');
  });

  /* ============================================
     PHOTO GALLERY
     ============================================ */
  function setupPhotoFallbacks() {
    $$('.photo-card img').forEach((img, i) => {
      img.addEventListener('error', function onError() {
        this.removeEventListener('error', onError);
        const canvas = document.createElement('canvas');
        canvas.width = 600;
        canvas.height = 400;
        const ctx = canvas.getContext('2d');
        const hues = [330, 280, 45, 310, 260, 350];
        const h = hues[i % hues.length];
        const grad = ctx.createLinearGradient(0, 0, 600, 400);
        grad.addColorStop(0, `hsl(${h}, 60%, 25%)`);
        grad.addColorStop(0.5, `hsl(${h + 20}, 70%, 35%)`);
        grad.addColorStop(1, `hsl(${h}, 50%, 20%)`);
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, 600, 400);
        ctx.font = '48px Cormorant Garamond, serif';
        ctx.fillStyle = 'rgba(255, 215, 0, 0.6)';
        ctx.textAlign = 'center';
        ctx.fillText('Memory ' + (i + 1), 300, 200);
        ctx.font = '20px Montserrat, sans-serif';
        ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
        ctx.fillText('Add images/photo' + (i + 1) + '.jpg', 300, 250);
        this.src = canvas.toDataURL('image/jpeg', 0.9);
      });
    });
  }

  setupPhotoFallbacks();

  photoSources = Array.from($$('.photo-card img')).map((img) => ({
    src: img.src,
    alt: img.alt
  }));

  function openPhotoModal(index) {
    currentPhotoIndex = index;
    const photo = photoSources[index];
    modalImg.src = photo.src;
    modalImg.alt = photo.alt;
    modalCounter.textContent = `${index + 1} / ${photoSources.length}`;
    photoModal.classList.remove('hidden');
    requestAnimationFrame(() => photoModal.classList.add('active'));
    document.body.style.overflow = 'hidden';
  }

  function navigatePhoto(dir) {
    currentPhotoIndex = (currentPhotoIndex + dir + photoSources.length) % photoSources.length;
    const photo = photoSources[currentPhotoIndex];
    modalImg.style.opacity = '0';
    modalImg.style.transform = 'scale(0.9)';
    setTimeout(() => {
      modalImg.src = photo.src;
      modalImg.alt = photo.alt;
      modalCounter.textContent = `${currentPhotoIndex + 1} / ${photoSources.length}`;
      modalImg.style.opacity = '1';
      modalImg.style.transform = 'scale(1)';
    }, 200);
  }

  $$('.photo-card').forEach((card, index) => {
    card.addEventListener('click', () => openPhotoModal(index));
  });

  modalPrev.addEventListener('click', (e) => { e.stopPropagation(); navigatePhoto(-1); });
  modalNext.addEventListener('click', (e) => { e.stopPropagation(); navigatePhoto(1); });

  let touchStartX = 0;
  photoModal.addEventListener('touchstart', (e) => {
    touchStartX = e.touches[0].clientX;
  }, { passive: true });

  photoModal.addEventListener('touchend', (e) => {
    const diff = e.changedTouches[0].clientX - touchStartX;
    if (Math.abs(diff) > 50) navigatePhoto(diff > 0 ? -1 : 1);
  }, { passive: true });

  function closeModal() {
    photoModal.classList.remove('active');
    setTimeout(() => {
      photoModal.classList.add('hidden');
      document.body.style.overflow = '';
    }, 500);
  }

  modalClose.addEventListener('click', closeModal);
  photoModal.addEventListener('click', (e) => {
    if (e.target === photoModal || e.target === modalImg) closeModal();
  });
  document.addEventListener('keydown', (e) => {
    if (photoModal.classList.contains('active')) {
      if (e.key === 'Escape') closeModal();
      if (e.key === 'ArrowLeft') navigatePhoto(-1);
      if (e.key === 'ArrowRight') navigatePhoto(1);
    }
  });

  /* ============================================
     SCROLL PROGRESS & NAVIGATION
     ============================================ */
  function updateScrollUI() {
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const pct = docHeight > 0 ? scrollTop / docHeight : 0;
    scrollProgressFill.style.transform = `scaleX(${pct})`;

    if (scrollTop > 400) {
      backToTop.classList.add('visible');
    } else {
      backToTop.classList.remove('visible');
    }

    const sections = ['birthday-hero', 'gallery', 'memories', 'letter', 'counter', 'surprise'];
    let current = sections[0];
    sections.forEach((id) => {
      const el = document.getElementById(id);
      if (el && el.getBoundingClientRect().top <= window.innerHeight * 0.4) {
        current = id;
      }
    });

    $$('.nav-dot').forEach((dot) => {
      dot.classList.toggle('active', dot.dataset.section === current);
    });
  }

  window.addEventListener('scroll', scheduleScrollUpdate, { passive: true });
  scheduleScrollUpdate();

  $$('.nav-dot').forEach((dot) => {
    dot.addEventListener('click', (e) => {
      e.preventDefault();
      const target = document.getElementById(dot.dataset.section);
      if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });

  backToTop.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  /* ============================================
     MUSIC PLAYER — Mobile Collapse
     ============================================ */
  if (musicCollapse) {
    musicCollapse.addEventListener('click', (e) => {
      e.stopPropagation();
      musicPlayer.classList.toggle('collapsed');
    });
  }

  musicPlayer.addEventListener('click', () => {
    if (isMobile() && musicPlayer.classList.contains('collapsed')) {
      musicPlayer.classList.remove('collapsed');
    }
  });

  /* ============================================
     INTERSECTION OBSERVER — Scroll Animations
     ============================================ */
  const scrollObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const el = entry.target;
        const delay = parseInt(el.dataset.delay || 0, 10);
        setTimeout(() => {
          requestAnimationFrame(() => el.classList.add('visible'));
        }, delay);
        scrollObserver.unobserve(el);
      }
    });
  }, {
    root: null,
    rootMargin: isMobile() ? '0px 0px -40px 0px' : '0px 0px -80px 0px',
    threshold: isMobile() ? 0.08 : 0.15
  });

  $$('.reveal-on-scroll').forEach((el) => scrollObserver.observe(el));
  $$('.timeline-card').forEach((el) => scrollObserver.observe(el));
  $$('.photo-card').forEach((el) => scrollObserver.observe(el));
  $$('.section-divider').forEach((el) => scrollObserver.observe(el));

  /* Letter typing triggered on scroll */
  const letterObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting && !letterTypingStarted) {
        letterTypingStarted = true;
        startLetterTyping();
        letterObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.3 });

  const letterSection = $('.letter-container');
  if (letterSection) letterObserver.observe(letterSection);

  /* ============================================
     TYPING LETTER EFFECT
     ============================================ */
  function startLetterTyping() {
    letterContent.textContent = '';
    letterCursor.classList.remove('hidden');
    const text = CONFIG.letterText;
    let index = 0;
    const speed = 35;

    function type() {
      if (index < text.length) {
        letterContent.textContent += text[index];
        index++;
        const pause = text[index - 1] === '\n' ? speed * 4 : speed;
        setTimeout(type, pause + random(-10, 10));
      } else {
        letterCursor.classList.add('hidden');
      }
    }

    type();
  }

  /* ============================================
     BIRTHDAY / LIFE COUNTER
     ============================================ */
  const birthDate = new Date(CONFIG.dateOfBirth);
  const counterSince = $('#counter-since');
  const counterLiveBadge = $('#counter-live-badge');

  counterSince.textContent = 'Born on 26 June 1999 · From 12:00 PM';

  function getBirthdayWindow(now) {
    const y = now.getFullYear();
    const s = CONFIG.birthdayLiveStart;
    const e = CONFIG.birthdayLiveEnd;
    const start = new Date(y, s.month - 1, s.day, s.hour, s.minute, 0);
    const end = new Date(y, e.month - 1, e.day, e.hour, e.minute, 0);
    return { start, end, active: now >= start && now < end };
  }

  function updateCounter() {
    const now = new Date();
    const window = getBirthdayWindow(now);

    if (counterLiveBadge) {
      counterLiveBadge.classList.toggle('hidden', !window.active);
      if (window.active) {
        const left = window.end - now;
        const lh = Math.floor(left / (1000 * 60 * 60));
        const lm = Math.floor((left % (1000 * 60 * 60)) / (1000 * 60));
        const ls = Math.floor((left % (1000 * 60)) / 1000);
        counterLiveBadge.textContent = `🎂 Birthday Live · ${lh}h ${lm}m ${ls}s left until 27th 12 AM`;
      }
    }

    const diff = now - birthDate;
    if (diff < 0) return;

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);

    animateCounterValue('#counter-days', days);
    $('#counter-hours').textContent = hours.toString().padStart(2, '0');
    $('#counter-minutes').textContent = minutes.toString().padStart(2, '0');
    $('#counter-seconds').textContent = seconds.toString().padStart(2, '0');
  }

  let lastDays = -1;
  function animateCounterValue(selector, value) {
    const el = $(selector);
    if (value !== lastDays) {
      lastDays = value;
      el.classList.add('pulse');
      setTimeout(() => el.classList.remove('pulse'), 500);
      animate({
        duration: 600,
        onUpdate: (t) => {
          el.textContent = Math.floor(value * ease.outCubic(t));
        },
        onComplete: () => { el.textContent = value; }
      });
    }
  }

  const counterDisplay = $('.counter-display');
  const counterObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        counterDisplay.classList.add('visible');
        updateCounter();
        setInterval(updateCounter, 1000);
        counterObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.3 });

  if (counterDisplay) counterObserver.observe(counterDisplay.parentElement);

  /* ============================================
     ONE MORE SURPRISE
     ============================================ */
  oneMoreBtn.addEventListener('click', async () => {
    if (surpriseTriggered) return;
    surpriseTriggered = true;
    oneMoreBtn.style.pointerEvents = 'none';
    oneMoreBtn.style.opacity = '0.5';

    launchFireworkShow(15, 200);
    spawnConfetti(300, true);
    spawnHearts(30);

    for (let i = 0; i < 5; i++) {
      setTimeout(() => {
        burstSparkles(random(0, width), random(0, height), 50);
      }, i * 300);
    }

    screenFlash.classList.add('flash');
    await delay(100);
    screenFlash.classList.remove('flash');

    document.body.classList.add('screen-shake');
    await delay(500);
    document.body.classList.remove('screen-shake');

    finalMessage.classList.remove('hidden');
    finalMessage.classList.add('show');

    spawnBalloons(10);
    spawnButterflies(5);
  });

  /* ============================================
     ENDING HEARTS
     ============================================ */
  function startEndingHearts() {
    const endingHearts = $('.ending-hearts');
    setInterval(() => {
      const heart = document.createElement('div');
      heart.className = 'floating-heart';
      heart.textContent = '❤️';
      heart.style.left = random(0, 100) + '%';
      heart.style.bottom = '0';
      heart.style.top = 'auto';
      heart.style.animationDuration = random(5, 10) + 's';
      endingHearts.appendChild(heart);
      setTimeout(() => heart.remove(), 10000);
    }, 1500);
  }

  const endingObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        startEndingHearts();
        endingObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.3 });

  const endingSection = $('#ending');
  if (endingSection) endingObserver.observe(endingSection);

  /* ============================================
     EVENT LISTENERS
     ============================================ */
  function bindDoorOpen(el) {
    if (!el) return;
    let fired = false;
    const open = (e) => {
      if (fired || isEntering || doorOpened) return;
      fired = true;
      setTimeout(() => { fired = false; }, 500);
      e.preventDefault();
      e.stopPropagation();
      enterSurprise();
    };
    el.addEventListener('click', open);
    if (isTouch) el.addEventListener('touchend', open, { passive: false });
  }

  bindDoorOpen(openDoorBtn);
  bindDoorOpen(gateDoorLeft);
  bindDoorOpen(gateDoorRight);
  bindDoorOpen(openBtn);

  window.addEventListener('resize', () => {
    PARTICLE_COUNT = isMobile() ? 18 : 40;
    while (bgParticles.length > PARTICLE_COUNT) bgParticles.pop();
    while (bgParticles.length < PARTICLE_COUNT) bgParticles.push(new BgParticle());
  });

  /* Hero text particles behind title */
  function createHeroParticles() {
    const container = $('#hero-particles');
    if (!container) return;
    for (let i = 0; i < (isMobile() ? 12 : 18); i++) {
      const p = document.createElement('div');
      p.style.cssText = `
        position: absolute;
        width: ${random(2, 5)}px;
        height: ${random(2, 5)}px;
        background: ${randomColor()};
        border-radius: 50%;
        left: ${random(0, 100)}%;
        top: ${random(0, 100)}%;
        opacity: ${random(0.3, 0.8)};
        animation: floatHeart ${random(4, 10)}s linear infinite;
        box-shadow: 0 0 10px currentColor;
      `;
      container.appendChild(p);
    }
  }

  /* Periodic golden dust — light */
  setInterval(() => {
    if (experienceStarted && !isMobile()) {
      burstSparkles(random(0, width), random(0, height), 2);
    }
  }, 3000);

  /* Init hero particles when main shows */
  const mainObserver = new MutationObserver(() => {
    if (mainExperience.classList.contains('visible')) {
      createHeroParticles();
      mainObserver.disconnect();
    }
  });
  mainObserver.observe(mainExperience, { attributes: true, attributeFilter: ['class'] });

  /* ============================================
     ADVANCED ANIMATIONS — Init
     ============================================ */
  function initFloatingOrbs() {
    const container = $('#floating-orbs');
    if (!container) return;
    const colors = [
      'rgba(255, 107, 157, 0.25)',
      'rgba(168, 85, 247, 0.2)',
      'rgba(255, 215, 0, 0.15)'
    ];
    const count = isMobile() ? 2 : 4;
    for (let i = 0; i < count; i++) {
      const orb = document.createElement('div');
      orb.className = 'floating-orb';
      const size = random(80, 200);
      orb.style.width = size + 'px';
      orb.style.height = size + 'px';
      orb.style.left = random(0, 100) + '%';
      orb.style.top = random(0, 100) + '%';
      orb.style.background = colors[i % colors.length];
      orb.style.animationDuration = random(15, 30) + 's';
      orb.style.animationDelay = random(0, 5) + 's';
      container.appendChild(orb);
    }
  }

  function initIntroHearts() {
    const container = $('#intro-hearts');
    if (!container) return;
    const hearts = ['❤️', '💕', '💖', '✨'];
    setInterval(() => {
      if (!introPhase) return;
      const heart = document.createElement('div');
      heart.className = 'intro-heart';
      heart.textContent = hearts[Math.floor(Math.random() * hearts.length)];
      heart.style.left = random(20, 80) + '%';
      heart.style.bottom = random(30, 60) + '%';
      heart.style.animationDuration = random(4, 7) + 's';
      container.appendChild(heart);
      setTimeout(() => heart.remove(), 7000);
    }, isMobile() ? 2500 : 1800);
  }

  function initPhotoTilt() {
    if (isTouch) return;
    const tilt = { rx: 0, ry: 0, tx: 0, ty: 0, inner: null, raf: null };

    function tick() {
      if (!tilt.inner) {
        tilt.raf = null;
        return;
      }
      tilt.rx += (tilt.tx - tilt.rx) * 0.18;
      tilt.ry += (tilt.ty - tilt.ry) * 0.18;
      tilt.inner.style.transform =
        `perspective(900px) rotateY(${tilt.rx}deg) rotateX(${tilt.ry}deg) scale3d(1.03, 1.03, 1)`;

      if (Math.abs(tilt.tx - tilt.rx) > 0.04 || Math.abs(tilt.ty - tilt.ry) > 0.04) {
        tilt.raf = requestAnimationFrame(tick);
      } else {
        tilt.raf = null;
        if (tilt.tx === 0 && tilt.ty === 0) tilt.inner.style.transform = '';
      }
    }

    function schedule() {
      if (!tilt.raf) tilt.raf = requestAnimationFrame(tick);
    }

    $$('.photo-card-inner').forEach((inner) => {
      inner.classList.add('tilt-active');
      const card = inner.closest('.photo-card');
      card.addEventListener('mousemove', (e) => {
        const rect = inner.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width - 0.5;
        const y = (e.clientY - rect.top) / rect.height - 0.5;
        tilt.inner = inner;
        tilt.tx = x * 12;
        tilt.ty = -y * 12;
        schedule();
      });
      card.addEventListener('mouseleave', () => {
        if (tilt.inner === inner) {
          tilt.tx = 0;
          tilt.ty = 0;
          schedule();
        }
      });
    });
  }

  function initMagneticButton() {
    if (isTouch) return;
    [openBtn, oneMoreBtn].forEach((btn) => {
      if (!btn) return;
      btn.addEventListener('mousemove', (e) => {
        const rect = btn.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;
        btn.style.transform = `translate(${x * 0.2}px, ${y * 0.2}px) scale(1.05)`;
      });
      btn.addEventListener('mouseleave', () => {
        btn.style.transform = '';
      });
    });
  }

  initFloatingOrbs();
  initIntroHearts();
  initPhotoTilt();
  initMagneticButton();
  initIntroPremium();

  function initIntroPremium() {
    initIntroSparkleCanvas();
    initIntroSpotlight();
    syncIntroName();
  }

  function syncIntroName() {
    $$('.intro-name').forEach((el) => { el.textContent = CONFIG.friendName; });
  }

  function initIntroTypewriter() {
    if (!introMessageEl) return;
    const text = 'Someone has something special for you ❤️';
    introMessageEl.innerHTML = '';
    text.split('').forEach((char, i) => {
      const span = document.createElement('span');
      span.className = 'msg-char';
      span.textContent = char === ' ' ? '\u00A0' : char;
      span.style.animationDelay = `${0.8 + i * 0.04}s`;
      introMessageEl.appendChild(span);
    });
    setTimeout(() => {
      introMessageEl.style.animation = 'messagePulse 3s ease-in-out infinite';
    }, text.length * 40 + 1200);
  }

  function initIntroSparkleCanvas() {
    if (!introSparkleCanvas) return;
    const ctx = introSparkleCanvas.getContext('2d');
    const sparks = [];
    const count = isMobile() ? 18 : 32;

    function resize() {
      const rect = introScreen.getBoundingClientRect();
      introSparkleCanvas.width = rect.width;
      introSparkleCanvas.height = rect.height;
    }
    resize();
    window.addEventListener('resize', resize);

    for (let i = 0; i < count; i++) {
      sparks.push({
        x: random(0, introSparkleCanvas.width || width),
        y: random(0, introSparkleCanvas.height || height),
        size: random(0.5, 2),
        speed: random(0.2, 0.6),
        twinkle: random(0, Math.PI * 2),
        color: randomColor()
      });
    }

    function drawIntroSparks() {
      if (!introPhase || !isPageVisible) {
        introSparkleAnimId = null;
        return;
      }
      ctx.clearRect(0, 0, introSparkleCanvas.width, introSparkleCanvas.height);
      sparks.forEach((s) => {
        s.y -= s.speed;
        s.twinkle += 0.05;
        if (s.y < 0) {
          s.y = introSparkleCanvas.height;
          s.x = random(0, introSparkleCanvas.width);
        }
        const alpha = 0.3 + 0.5 * Math.sin(s.twinkle);
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
        ctx.fillStyle = s.color;
        ctx.globalAlpha = alpha;
        ctx.fill();
      });
      ctx.globalAlpha = 1;
      introSparkleAnimId = requestAnimationFrame(drawIntroSparks);
    }
    drawIntroSparks();
  }

  function initIntroSpotlight() {
    if (!introSpotlight || !introScreen) return;
    const moveSpot = (x, y) => {
      const rect = introScreen.getBoundingClientRect();
      introSpotlight.style.left = (x - rect.left) + 'px';
      introSpotlight.style.top = (y - rect.top) + 'px';
    };
    introSpotlight.style.left = '50%';
    introSpotlight.style.top = '40%';

    document.addEventListener('mousemove', (e) => {
      if (introPhase) moveSpot(e.clientX, e.clientY);
    });
    if (isTouch) {
      introScreen.addEventListener('touchmove', (e) => {
        if (introPhase) moveSpot(e.touches[0].clientX, e.touches[0].clientY);
      }, { passive: true });
    }
  }

  function initGiftOrbitSparkles() {
    const orbit = $('#gift-sparkle-orbit');
    if (!orbit) return;
    const symbols = ['✦', '✧', '·', '✦'];
    const count = isMobile() ? 10 : 16;
    for (let i = 0; i < count; i++) {
      const s = document.createElement('span');
      s.className = 'orbit-sparkle';
      s.textContent = symbols[i % symbols.length];
      s.style.animationDelay = `${(i / count) * 5}s`;
      s.style.animationDuration = `${4 + random(0, 3)}s`;
      const radius = isMobile() ? 100 : 130;
      s.style.setProperty('--orbit-r', radius + 'px');
      orbit.appendChild(s);
    }
  }

  const endingEl = $('#ending');
  if (endingEl) {
    const endObs = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) endingEl.classList.add('visible-ending');
      });
    }, { threshold: 0.3 });
    endObs.observe(endingEl);
  }

})();
