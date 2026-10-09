# NEXUS AI — Intelligent Offline Campus & Local Network Learning Platform

NEXUS AI is an educational platform designed to run on local university servers and offline **Kiwix Wi-Fi hotspots**. It provides course management, fast indexed search, educational resource delivery (PDFs and videos with seeking support), and intelligent AI assistance.

---

## 🚀 Quick Start with Docker

```bash
docker compose up --build -d
```

The NEXUS backend service will be available at:
- **Local Access**: `http://localhost:5000`
- **Campus Hotspot / LAN**: `http://<SERVER_LAN_IP>:5000`

---

## 📁 Repository Structure

- [`backend/`](./backend): Node.js, Express & TypeScript backend service.
  - [`docs/API.md`](./backend/docs/API.md): Full REST API documentation.
  - [`Dockerfile`](./backend/Dockerfile): Multi-stage container definition.
  - [`README.md`](./backend/README.md): Detailed backend architecture and deployment guide.
- [`docker-compose.yml`](./docker-compose.yml): Multi-container orchestration with persistent volumes.

---

## 🎯 Verification & Testing

```bash
cd backend
npm install
npm test
```

All 29 integration tests pass, covering health checks, course CRUD, resource uploads, HTTP Range video streaming, metadata search, and AI proxying.
