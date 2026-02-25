// =============================================
// CONSTANTS & SELECTORS
// =============================================
const theme     = 'theme';
const dataTheme = 'data-theme';
const themeTab  = '.theme-tab';
const switcherBtn = '.switcher-btn';
const dark   = 'dark';
const light  = 'light';
const open   = 'open';
const active = 'active';

const modalOpen  = '[data-open]';
const modalClose = '[data-close]';
const isVisible  = 'is-visible';

const dataFilter    = '[data-filter]';
const portfolioData = '[data-item]';

const root = document.documentElement;

// =============================================
// THEME
// =============================================
const toggleTheme   = document.querySelector(themeTab);
const switcher      = document.querySelectorAll(switcherBtn);
const currentTheme  = localStorage.getItem(theme);

const setActive = (elm, selector) => {
  const current = document.querySelector(`${selector}.${active}`);
  if (current) current.classList.remove(active);
  elm.classList.add(active);
};

const setTheme = (val) => {
  if (val === dark) {
    root.setAttribute(dataTheme, dark);
    localStorage.setItem(theme, dark);
  } else {
    root.setAttribute(dataTheme, light);
    localStorage.setItem(theme, light);
  }
};

if (currentTheme) {
  root.setAttribute(dataTheme, currentTheme);
  switcher.forEach(btn => btn.classList.remove(active));
  if (currentTheme === dark) {
    switcher[1].classList.add(active);
  } else {
    switcher[0].classList.add(active);
  }
}

toggleTheme.addEventListener('click', function () {
  const tab = this.parentElement.parentElement;
  tab.classList.toggle(open);
});

for (const elm of switcher) {
  elm.addEventListener('click', function () {
    setActive(elm, switcherBtn);
    setTheme(this.dataset.toggle);
  });
}

// =============================================
// SIDE NAVIGATION
// =============================================
const hamburgerBtn    = document.getElementById('hamburgerBtn');
const sideNav         = document.getElementById('sideNav');
const sideNavClose    = document.getElementById('sideNavClose');
const sideNavOverlay  = document.getElementById('sideNavOverlay');

const openSideNav = () => {
  sideNav.classList.add('open');
  sideNavOverlay.classList.add('active');
  hamburgerBtn.classList.add('open');
  document.body.style.overflow = 'hidden';
};

const closeSideNav = () => {
  sideNav.classList.remove('open');
  sideNavOverlay.classList.remove('active');
  hamburgerBtn.classList.remove('open');
  document.body.style.overflow = '';
};

hamburgerBtn.addEventListener('click', openSideNav);
sideNavClose.addEventListener('click', closeSideNav);
sideNavOverlay.addEventListener('click', closeSideNav);

// Close side nav on any [data-sidenav-close] click
document.querySelectorAll('[data-sidenav-close]').forEach(el => {
  el.addEventListener('click', closeSideNav);
});

// =============================================
// PORTFOLIO FILTER & SEARCH
// =============================================
const filterLink     = document.querySelectorAll(dataFilter);
const portfolioItems = document.querySelectorAll(portfolioData);
const searchBox      = document.querySelector('#search');

searchBox.addEventListener('keyup', (e) => {
  const query = e.target.value.toLowerCase().trim();
  portfolioItems.forEach(card => {
    // search against data-name (title/keywords) and data-item (category)
    const nameMatch = (card.dataset.name || '').toLowerCase().includes(query);
    const catMatch  = card.dataset.item.includes(query);
    card.style.display = (nameMatch || catMatch) ? 'block' : 'none';
  });
});

for (const link of filterLink) {
  link.addEventListener('click', function () {
    setActive(link, '.filter-link');
    const filter = this.dataset.filter;
    portfolioItems.forEach(card => {
      if (filter === 'all' || card.dataset.item === filter) {
        card.style.display = 'block';
      } else {
        card.style.display = 'none';
      }
    });
  });
}

// =============================================
// MODALS
// =============================================
const openModal  = document.querySelectorAll(modalOpen);
const closeModal = document.querySelectorAll(modalClose);

for (const elm of openModal) {
  elm.addEventListener('click', function (e) {
    // Don't trigger modal if it's a side-nav smooth-scroll link
    const id = this.dataset.open;
    if (!id) return;
    const target = document.getElementById(id);
    if (target) target.classList.add(isVisible);
  });
}

for (const elm of closeModal) {
  elm.addEventListener('click', function () {
    this.closest('.full-site-modal, .modal').classList.remove(isVisible);
  });
}

document.addEventListener('click', (e) => {
  const visibleModal = document.querySelector('.modal.is-visible');
  if (visibleModal && e.target === visibleModal) {
    visibleModal.classList.remove(isVisible);
  }
});

document.addEventListener('keyup', (e) => {
  if (e.key === 'Escape') {
    const visibleModal = document.querySelector('.modal.is-visible, .full-site-modal.is-visible');
    if (visibleModal) visibleModal.classList.remove(isVisible);
  }
});

// =============================================
// MARQUEE
// =============================================
const elmsDisplayed  = getComputedStyle(root).getPropertyValue('--marquee-elms-displayed');
const marqueeContent = document.querySelector('ul.marquee-content');

if (marqueeContent) {
  root.style.setProperty('--marquee-elms', marqueeContent.children.length);
  for (let i = 0; i < elmsDisplayed; i += 1) {
    marqueeContent.appendChild(marqueeContent.children[i].cloneNode(true));
  }
}

// =============================================
// TYPING EFFECT
// =============================================
const typingPhrases = [
  'Code. Eat. Sleep.',
  'Full-Stack Developer.',
  'Cloud Architect.',
  'React Native Builder.',
  'Problem Solver.',
];

const typingEl   = document.getElementById('typingText');
let phraseIdx    = 0;
let charIdx      = 0;
let isDeleting   = false;

function typeEffect() {
  if (!typingEl) return;
  const current = typingPhrases[phraseIdx];

  if (isDeleting) {
    typingEl.textContent = current.substring(0, charIdx - 1);
    charIdx--;
  } else {
    typingEl.textContent = current.substring(0, charIdx + 1);
    charIdx++;
  }

  let delay = isDeleting ? 40 : 80;

  if (!isDeleting && charIdx === current.length) {
    delay = 2000;
    isDeleting = true;
  } else if (isDeleting && charIdx === 0) {
    isDeleting = false;
    phraseIdx  = (phraseIdx + 1) % typingPhrases.length;
    delay = 400;
  }

  setTimeout(typeEffect, delay);
}

typeEffect();

// =============================================
// HERO STATS COUNTER
// =============================================
const animateCounter = (el, target) => {
  let current = 0;
  const step  = Math.ceil(target / 50);
  const interval = setInterval(() => {
    current = Math.min(current + step, target);
    el.textContent = current + '+';
    if (current >= target) clearInterval(interval);
  }, 30);
};

const heroStats = document.querySelector('.hero-stats');
if (heroStats) {
  const statsObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.querySelectorAll('.stat-number').forEach(num => {
          animateCounter(num, parseInt(num.dataset.target, 10));
        });
        statsObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });

  statsObserver.observe(heroStats);
}

// =============================================
// SKILL BAR ANIMATION
// =============================================
const skillBarsContainer = document.querySelector('.skill-bars');
if (skillBarsContainer) {
  const skillObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.querySelectorAll('.skill-bar-fill').forEach(bar => {
          bar.style.width = bar.dataset.level + '%';
        });
        skillObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.3 });

  skillObserver.observe(skillBarsContainer);
}

// =============================================
// RORK CODE SNIPPET EXPAND / COLLAPSE
// =============================================
document.querySelectorAll('.expand-trigger').forEach(btn => {
  btn.addEventListener('click', function () {
    const targetId = this.dataset.target;
    const content  = document.getElementById(targetId);
    const arrow    = this.querySelector('.expand-arrow');
    const isOpen   = content.classList.contains('open');

    // close all
    document.querySelectorAll('.code-collapse.open').forEach(el => {
      el.classList.remove('open');
    });
    document.querySelectorAll('.expand-arrow.rotated').forEach(el => {
      el.classList.remove('rotated');
    });

    // open clicked if it was closed
    if (!isOpen) {
      content.classList.add('open');
      if (arrow) arrow.classList.add('rotated');
    }
  });
});

// =============================================
// CONTACT FORM VALIDATION
// =============================================
(function initContactForm() {
  const form = document.getElementById('contactForm');
  if (!form) return;

  // Clear error on field edit
  form.querySelectorAll('.form-control').forEach(input => {
    input.addEventListener('input', () => {
      const wrapper = input.closest('.form-field');
      if (wrapper) {
        const err = wrapper.querySelector('.field-error');
        if (err) err.textContent = '';
      }
      input.classList.remove('field-invalid');
    });
  });

  form.addEventListener('submit', function (e) {
    e.preventDefault();

    const nameEl    = form.querySelector('[name="Name"]');
    const emailEl   = form.querySelector('[name="email"]');
    const subjectEl = form.querySelector('[name="subject"]');
    const msgEl     = form.querySelector('[name="message"]');

    // Clear all errors
    form.querySelectorAll('.field-error').forEach(el => (el.textContent = ''));
    form.querySelectorAll('.field-invalid').forEach(el => el.classList.remove('field-invalid'));

    let valid = true;

    if (!nameEl.value.trim()) {
      setFieldError(nameEl, 'Please enter your name.');
      valid = false;
    }
    if (!emailEl.value.trim()) {
      setFieldError(emailEl, 'Please enter your email address.');
      valid = false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailEl.value.trim())) {
      setFieldError(emailEl, 'Please enter a valid email address.');
      valid = false;
    }
    if (!subjectEl.value.trim()) {
      setFieldError(subjectEl, 'Please enter a subject.');
      valid = false;
    }
    if (!msgEl.value.trim()) {
      setFieldError(msgEl, 'Please enter your message.');
      valid = false;
    }

    if (!valid) return;

    // Disable submit while sending
    const submitBtn = form.querySelector('[type="submit"]');
    if (submitBtn) submitBtn.disabled = true;

    fetch('https://formspree.io/f/xkovkaen', {
      method: 'POST',
      headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name:    nameEl.value.trim(),
        email:   emailEl.value.trim(),
        subject: subjectEl.value.trim(),
        message: msgEl.value.trim(),
      }),
    })
      .then(res => {
        if (res.ok) {
          form.reset();
          const prev = form.querySelector('.form-success, .form-error');
          if (prev) prev.remove();
          const banner = document.createElement('div');
          banner.className   = 'form-success';
          banner.textContent = '✓ Message sent! Daniel will get back to you soon.';
          form.appendChild(banner);
          setTimeout(() => { if (banner.parentNode) banner.remove(); }, 6000);
        } else {
          return res.json().then(data => { throw new Error(data.error || 'Submit failed'); });
        }
      })
      .catch(() => {
        const prev = form.querySelector('.form-success, .form-error');
        if (prev) prev.remove();
        const errBanner = document.createElement('div');
        errBanner.className   = 'form-error';
        errBanner.textContent = '✗ Something went wrong. Please try again or email Daniel.Ryland@pm.me directly.';
        form.appendChild(errBanner);
      })
      .finally(() => {
        if (submitBtn) submitBtn.disabled = false;
      });
  });

  function setFieldError(input, msg) {
    const wrapper = input.closest('.form-field');
    let errEl = wrapper ? wrapper.querySelector('.field-error') : null;
    if (!errEl) {
      errEl = document.createElement('div');
      errEl.className = 'field-error';
      (wrapper || input.parentNode).appendChild(errEl);
    }
    errEl.textContent = msg;
    input.classList.add('field-invalid');
  }
})();

// =============================================
// HERO PARTICLE CANVAS
// =============================================
(function initParticles() {
  const canvas = document.getElementById('heroCanvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  let particles = [];

  const resize = () => {
    canvas.width  = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
  };

  window.addEventListener('resize', resize);
  resize();

  class Particle {
    constructor() { this.reset(); }
    reset() {
      this.x      = Math.random() * canvas.width;
      this.y      = Math.random() * canvas.height;
      this.vx     = (Math.random() - 0.5) * 0.4;
      this.vy     = (Math.random() - 0.5) * 0.4;
      this.radius = Math.random() * 1.8 + 0.4;
      this.alpha  = Math.random() * 0.45 + 0.1;
    }
    draw() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(73, 95, 239, ${this.alpha})`;
      ctx.fill();
    }
    update() {
      this.x += this.vx;
      this.y += this.vy;
      if (this.x < 0 || this.x > canvas.width)  this.vx *= -1;
      if (this.y < 0 || this.y > canvas.height)  this.vy *= -1;
    }
  }

  for (let i = 0; i < 70; i++) particles.push(new Particle());

  const drawLines = () => {
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx   = particles[i].x - particles[j].x;
        const dy   = particles[i].y - particles[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 110) {
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.strokeStyle = `rgba(73, 95, 239, ${0.12 * (1 - dist / 110)})`;
          ctx.lineWidth = 0.6;
          ctx.stroke();
        }
      }
    }
  };

  const animate = () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles.forEach(p => { p.update(); p.draw(); });
    drawLines();
    requestAnimationFrame(animate);
  };

  animate();
})();
