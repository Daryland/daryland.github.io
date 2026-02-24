# daryland.github.io

Personal portfolio site for **Daniel Ryland** — Full-Stack Developer & AWS Certified Cloud Practitioner.

Live at: [daryland.github.io](https://daryland.github.io)

---

## Features

### UI & Navigation

- **Expandable side navigation** — hamburger-triggered slide-in panel with links, social icons, and AWS cert badge
- **Light / Dark theme switcher** — persisted via localStorage
- **Animated hero section** — live particle canvas background, cycling typing effect, and scroll-triggered stats counters (GitHub repos, published apps, core technologies)
- **Filterable project grid** — filter by Web, Mobile, Cloud/AI, or UI/Design with live keyword search

### Sections

- **Rork Apps** — showcase cards for three published React Native apps (SchedulerX, Recipe Vault, Framework Coaching) with expandable TypeScript code snippets and live app links
- **Skills & Stack** — animated skill progress bars (IntersectionObserver-triggered) and an interactive tech tag cloud covering 18+ technologies
- **Portfolio grid** — real named projects including Curriculo, Cool Peptides, AWS Infrastructure, CodePen Experiments, and more
- **Testimonials carousel** — client review slider
- **About modal** — bio, AWS/location/stack badges, social links, interests, and a scrolling tech icon marquee
- **Contact modal** — contact form with centered social links

### AI Chat Assistant

- **Portfolio Assistant** — right-side slide-in chat panel powered by [Groq](https://groq.com) (Llama 3.3 70B)
- Knows Daniel's full portfolio: projects, skills, Rork apps, GitHub, LinkedIn, CodePen, and contact info
- **Three-layer guardrail system** — server-side regex pre-check → strict system prompt → LLM response detection; jailbreak, off-topic, and how-to attempts are all blocked
- **Fail-rate UX** — first two off-topic messages return random dad jokes or snarky poems; third triggers a contact/redirect prompt with clickable links
- **Hyperlink rendering** — bot responses parse markdown `[text](url)` and bare URLs into clickable `<a>` tags (XSS-safe)
- Minimize / close controls; matches site light/dark theme

---

## Tech Stack

### Frontend

- HTML5, CSS3 (custom properties / CSS variables for theming), Vanilla JavaScript
- Font Awesome 6 icons
- Canvas API (particle animation)
- IntersectionObserver API (skill bars, stat counters)

### Backend (chat server — deployed on Railway)

- Node.js + Express
- [Groq](https://console.groq.com) via OpenAI-compatible API (Llama 3.3 70B)
- dotenv for environment config
- **Structured JSON logging** — every chat event written to stdout (Railway dashboard) and `server/logs/chat.log`
- **PII redaction** — emails, phone numbers, SSNs, credit card numbers, and long tokens are stripped before any logging
- **IP hashing** — client IPs stored as HMAC-SHA256 (truncated, salted); never logged in plain text
- **Rate limiting** — 20 requests per IP per 60-second window; returns `429` when exceeded
- **Jailbreak auto-block** — IPs that trigger 5+ jailbreak patterns are automatically blocked for 24 hours
- **Scraper/bot detection** — empty or known non-browser user-agents (curl, python-requests, wget, scrapy, etc.) are blocked with `403 Forbidden`

---

## Project Structure

```text
daryland.github.io/
├── index.html          # Main portfolio page
├── privacy.html        # Privacy policy
├── css/
│   ├── styles.css      # Core layout and component styles
│   ├── chat.css        # Chat panel styles
│   ├── themes.css      # Light/dark CSS variables
│   ├── base.css        # Reset and base styles
│   └── pages.css       # Modal and page-level styles
├── js/
│   ├── main.js         # Theme, nav, modals, particles, typing, skill bars
│   ├── chat.js         # Chat open/close/minimize and message handling
│   └── carousel.js     # Testimonial carousel
├── server/
│   ├── server.js       # Express API, guardrails, logging, and security middleware
│   ├── logs/           # Structured JSON chat logs (local dev; gitignored)
│   └── package.json
└── assests/images/     # Portfolio images and avatars
```

---

## Running Locally

**Portfolio site** — open `index.html` directly in a browser or serve with any static file server.

**Chat server** — requires a `.env` file in the project root:

```env
GROQ_API_KEY="your_groq_api_key"
```

```bash
cd server
npm install
node server.js
# Server runs at http://localhost:5551
```

Get a free Groq API key at [console.groq.com](https://console.groq.com).

---

## Published Rork Apps

| App | Description | Link |
| --- | ----------- | ---- |
| SchedulerX | Smart scheduling utility — appointments, time blocks, recurring events | [schedulerx.rork.app](https://schedulerx.rork.app) |
| Recipe Vault | Mobile recipe manager — search, collections, ingredient tracking | [recipe-vault-t5shvji.rork.app](https://recipe-vault-t5shvji.rork.app) |
| Framework Coaching | Structured coaching app — goal tracking and milestone management | [framework-coaching-app-ke7rr14.rork.app](https://framework-coaching-app-ke7rr14.rork.app) |

---

## Links

- GitHub: [github.com/Daryland](https://github.com/Daryland)
- LinkedIn: [linkedin.com/in/daniel-ryland-1b233a68](https://www.linkedin.com/in/daniel-ryland-1b233a68/)
- CodePen: [codepen.io/daryland](https://codepen.io/daryland)
- Email: [Daniel.Ryland@pm.me](mailto:Daniel.Ryland@pm.me)
