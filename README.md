# NEXUS AI — Intelligent Offline Campus & Local Network Learning Platform

NEXUS AI is an autonomous, air-gapped educational platform designed to run on local campus servers and offline **Kiwix Wi-Fi hotspots**. It delivers course materials, high-performance video streaming with HTTP 206 byte-range seeking, syllabus-grounded AI assistance via LM Studio Gemma, and OpenZIM archive integration without requiring an internet connection.

---

## 📸 Interface Preview

### Neo-Brutalist Campus OS Landing Page
![NEXUS AI Hero Landing Page](https://raw.githubusercontent.com/Sriram-Nambiar/Nexus/main/docs/screenshots/hero_landing_page.png)

### Course Catalog & NPTEL Video Streaming Player
![Course Materials & NPTEL Video Streaming](https://raw.githubusercontent.com/Sriram-Nambiar/Nexus/main/docs/screenshots/course_lecture_stream.png)

---

## 🌟 Core Pillars & Key Features

### 1. 🔒 100% Data Privacy & Zero Cloud Exfiltration
- **Completely Air-Gapped**: Student questions, exam doubts, and uploaded academic documents never leave the local machine or campus network.
- **No Third-Party Telemetry**: Zero external tracking, data scraping, or third-party API logging (unlike commercial cloud LLMs).

### 2. 💸 100% Free & Zero Cloud Bills ($0.00 / query)
- **Zero Token Fees**: Powered by open-weights models (Google Gemma 4, Llama) running entirely on local consumer hardware (laptops, mini-PCs, or Raspberry Pi).
- **No Subscription Paywalls**: Eliminates monthly cloud hosting, egress bandwidth costs, and API token bills.

### 3. 📡 Multi-User Wi-Fi Hotspot Mesh (Kiwix Offspot Architecture)
- **One Host Serves Dozens of Students**: A single laptop or Raspberry Pi creates an offline Wi-Fi access point without needing an internet connection, SIM card, or router.
- **Concurrent Access**: Multiple student computers, phones, or tablets can connect to the local hotspot simultaneously and browse courses, stream lectures, and query the AI independently.

### 4. ⚡ Zero-Buffering HTTP 206 Partial Content Video Streaming
- **Instant Byte-Range Seeking**: Delivers high-definition NPTEL and university video lectures with instantaneous forward/backward scrubbing.
- **Sub-10ms Latency**: Streams video chunks on demand over the local intranet rather than forcing whole-file downloads, drastically reducing network overhead.

### 5. 📦 Kiwix OpenZIM (.zim) Educational Archive Interoperability
- **Standardized Offline Packages**: Direct support for OpenZIM archives, allowing whole encyclopedias (Wikipedia, Project Gutenberg, Khan Academy, PhET Science Simulations) to be stored and accessed locally.

### 6. 🧠 Syllabus-Grounded Local AI Tutor
- **Context-Aware Assistance**: The AI assistant dynamically reads course titles, syllabi, instructor descriptions, and uploaded PDFs/videos from SQLite, grounding every answer in the student's actual curriculum.
- **Accurate & Non-Hallucinatory**: Ensures students receive answers aligned with their specific professors and university course requirements.

### 7. 📅 Personalized AI Study & Revision Planner
- **Goal-Driven Scheduling**: Students can generate multi-week structured revision plans (`/planner`) tailored to their exam dates, topics, and available study hours.
- **Direct Material Linking**: Daily study modules link directly back to locally hosted course lecture notes and video segments.

### 8. 🔍 Blazing Fast Full-Text Local Search
- **Instant Discovery**: Indexed search across courses, lecture titles, notes, and resource tags in milliseconds without external search engines.

### 9. 🌍 Crisis, Maritime & Rural Education Ready
- **Extreme Resilience**: Engineered specifically for rural classrooms, disaster-relief camps, research vessels, remote communities, and areas with severed or unstable connectivity.

### 10. 🎨 High-Contrast Neo-Brutalist Design System
- **Accessibility & Clarity**: Bold `#ffe17c` yellow background, solid 2px black borders, hard offset shadows, and clean geometric typography (*Cabinet Grotesk* + *Satoshi*) for effortless readability across daylight, tablets, and phones.

---

## 🚀 Quick Start

### 1. Backend Service
```bash
cd backend
npm install
npm run build
npm start
```
> Running on **http://localhost:5000** (LAN access enabled on `0.0.0.0:5000`)

### 2. Frontend Development Server
```bash
cd frontend
npm install
npm run dev
```
> Running on **http://localhost:5173**

### 3. Docker Compose (Production / Hotspot Node)
```bash
docker compose up --build -d
```

---

## 📁 Repository Structure

- [`frontend/`](./frontend): Modern, offline-first React 19 + TypeScript + Vite + Tailwind CSS web application.
  - [`README.md`](./frontend/README.md): Frontend architectural overview and developer guide.
- [`backend/`](./backend): Node.js, Express & TypeScript backend service with SQLite database.
  - [`docs/API.md`](./backend/docs/API.md): Full REST API documentation.
  - [`Dockerfile`](./backend/Dockerfile): Multi-stage container definition.
  - [`README.md`](./backend/README.md): Detailed backend architecture and deployment guide.
- [`offspot/`](./offspot): Kiwix Offspot Raspberry Pi deployment recipe and configuration.
- [`OFFSPOT_DEPLOYMENT.md`](./OFFSPOT_DEPLOYMENT.md): Complete guide for provisioning offline Wi-Fi access points.
- [`docker-compose.offspot.yml`](./docker-compose.offspot.yml): Offspot-specific multi-service orchestration.

---

## 🎯 Verification & Testing

```bash
cd backend
npm test
```
All integration tests pass, covering health checks, course CRUD, resource uploads, HTTP Range video streaming, metadata search, and AI proxying.
