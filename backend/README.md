# NEXUS AI — Backend & Resource Management System

The NEXUS AI backend provides high-performance educational resource management, media delivery, metadata search, and proxy integration with the Python AI service.

Designed for campus university servers and **offline Kiwix Wi-Fi hotspots**, NEXUS enables students and teachers to access courses, stream lectures with HTTP Range seeking, read PDFs inline, and query AI study assistants over the local network without relying on external internet connectivity.

---

## 🚀 Key Features

- **Course & Educational Resource Management**: Full lifecycle management of courses, lectures, PDF slides, and documentation.
- **Optimized Video & PDF Delivery**:
  - **HTTP Range Requests (`206 Partial Content`)**: Enables instant video seeking and scrubbing on mobile devices without reading files entirely into memory or saturating local Wi-Fi bandwidth.
  - **Inline PDF Viewing**: Browser-native rendering for documents and notes.
- **Robust Security**:
  - Safe UUID file identifiers preventing arbitrary filesystem exposure.
  - Strict path traversal protection enforcing containment inside the configured data directory.
  - MIME type and extension whitelisting for upload verification.
- **Fast Metadata & Extensible Search**: Sub-millisecond indexed searching across courses and resources with hooks for vector/content search.
- **AI Service Resilience**: Proxying requests to the Python AI service with timeouts, connection failure shields, and realistic fallback simulations during offline testing.
- **Containerized Deployment**: Ready for single-command Docker deployment with persistent volume mounts.
- **Kiwix Hotspot & Campus LAN Ready**: Detects network interfaces and binds cleanly to accept connections from student devices on the same Wi-Fi subnet.

---

## 🛠 Technology Stack

- **Runtime**: Node.js (v20+ / v22+ / v24+)
- **Framework**: Express 5
- **Language**: TypeScript
- **Database**: SQLite via `better-sqlite3` (WAL mode enabled, foreign keys enforced)
- **Validation**: Zod schema validation
- **Multipart Uploads**: Multer with safe disk storage
- **Testing**: Vitest + Supertest
- **Containerization**: Docker & Docker Compose (Multi-stage build)

---

## 📁 Project Architecture

```
backend/
├── src/
│   ├── app.ts                  # Express application factory & middleware setup
│   ├── server.ts               # Server startup, LAN IP discovery, graceful shutdown
│   ├── config/
│   │   └── env.ts              # Zod-validated environment configuration
│   ├── db/
│   │   ├── database.ts         # SQLite connection manager with WAL & pragmas
│   │   ├── schema.ts           # SQLite schema definitions & performance indexes
│   │   └── seed.ts             # Seeder with NPTEL ML & OS Deadlocks courses
│   ├── types/
│   │   └── index.ts            # TypeScript interfaces & API contracts
│   ├── validators/
│   │   └── index.ts            # Zod validation schemas
│   ├── middleware/
│   │   ├── error.middleware.ts # Centralized error handler & AppError classes
│   │   ├── upload.middleware.ts# Multer storage, MIME whitelist & safe naming
│   │   └── rate-limit.ts       # Rate limiters for general API & AI proxy
│   ├── services/
│   │   ├── course.service.ts   # Course database logic & cascades
│   │   ├── resource.service.ts # Safe storage & HTTP Range streaming service
│   │   ├── study-plan.service.ts # Study plan JSON storage & retrieval
│   │   ├── search.service.ts   # Metadata search & AI search integration
│   │   └── ai-client.service.ts# Python AI client with timeout protection
│   ├── controllers/
│   │   ├── health.controller.ts
│   │   ├── course.controller.ts
│   │   ├── resource.controller.ts
│   │   ├── search.controller.ts
│   │   └── ai.controller.ts
│   └── routes/
│       ├── index.ts            # Route aggregation under /api
│       ├── health.routes.ts    # GET /api/health
│       ├── course.routes.ts    # CRUD /api/courses
│       ├── resource.routes.ts  # Upload & stream /api/resources
│       ├── search.routes.ts    # GET /api/search?q=deadlocks
│       └── ai.routes.ts        # /api/ai/ask & /api/ai/study-plan
├── tests/
│   ├── health.test.ts
│   ├── courses.test.ts
│   ├── resources.test.ts
│   ├── search.test.ts
│   └── ai.test.ts
├── docs/
│   └── API.md                  # Complete API documentation
├── Dockerfile                  # Multi-stage production container
├── docker-compose.yml          # Orchestration with persistent volume mounts
├── package.json
└── tsconfig.json
```

---

## 🐳 Quickstart with Docker (Recommended)

To run the complete backend in Docker with persistent storage:

```bash
# From the repository root or backend folder
docker compose up --build -d
```

The server will automatically:
1. Compile the TypeScript source code in an isolated build container.
2. Initialize SQLite database at `/app/data/nexus.sqlite`.
3. Mount the persistent volume `nexus_data` to protect courses and uploaded files across container updates.
4. Expose port `5000` to your host machine and local network.

To check container logs:
```bash
docker compose logs -f
```

To stop the container:
```bash
docker compose down
```

---

## 💻 Local Development Setup (Without Docker)

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

Key environment configurations:
```ini
PORT=5000
HOST=127.0.0.1                  # Set to 0.0.0.0 for LAN / Kiwix hotspot access
ENABLE_LAN_ACCESS=false         # Set to true for campus network access
DB_PATH=./data/nexus.sqlite
UPLOAD_DIR=./data/uploads
AI_SERVICE_URL=http://127.0.0.1:8000
AI_MOCK_FALLBACK=true           # Enables realistic responses when AI service is offline
```

### 3. Seed Demo Courses and Videos
Seeds two educational courses, demo videos, and PDF notes:
```bash
npm run seed
```

This populates:
1. **Course 1**: *Machine Learning (NPTEL)* by Prof. Balaraman Ravindran with video `https://youtu.be/OTAR0kT1swg` (*Week 1 Lecture 2 - Supervised Learning*) and lecture notes PDF.
2. **Course 2**: *Operating Systems & Concurrency* with lecture video on *Deadlocks and Banker's Algorithm* and study guide.

### 4. Start Development Server
```bash
npm run dev
```

### 5. Build for Production
```bash
npm run build
npm start
```

### 6. Run Test Suite
```bash
npm test
```

---

## 📡 University LAN & Kiwix Hotspot Deployment Guide

The platform is designed to operate seamlessly on offline campus networks and Kiwix Wi-Fi hotspots:

### Why HTTP Range Streaming Matters for Kiwix Hotspots
When 20–50 students connect to a local Kiwix Wi-Fi access point simultaneously, transmitting whole 100MB video files would saturate the wireless router. NEXUS implements **HTTP Range Requests (`206 Partial Content`)**:
- Mobile browsers request only 256KB–1MB chunks as students watch or seek.
- Video files are never buffered entirely into server RAM (`fs.createReadStream` pipes byte chunks directly).
- Seeking back and forth through a lecture is instantaneous.

### Setup Instructions for Local Server
1. **Configure Network Binding**:
   Set `ENABLE_LAN_ACCESS=true` and `HOST=0.0.0.0` in `.env` (or run with Docker Compose).
2. **Obtain Local IP Address**:
   When the server boots, it scans network interfaces and outputs the connection URLs:
   ```
   - Network Access URLs for students on the same hotspot:
       -> http://192.168.8.100:5000
   ```
3. **Firewall Rule**:
   Ensure inbound TCP traffic on port `5000` is allowed:
   - **Windows**:
     ```powershell
     New-NetFirewallRule -DisplayName "NEXUS AI Backend" -Direction Inbound -LocalPort 5000 -Protocol TCP -Action Allow
     ```
   - **Linux**:
     ```bash
     sudo ufw allow 5000/tcp
     ```
4. **Student Access**:
   Students connected to the Kiwix Wi-Fi hotspot simply navigate to `http://<SERVER_IP>:5000` in Chrome, Safari, or Firefox to access courses, stream video, and download notes.

---

## 🔒 Security Design

1. **Path Traversal Shield**:
   All file paths passed to the delivery service are sanitized using `path.basename` and verified with `path.resolve`. If any resolved path escapes `UPLOAD_DIR`, the request is immediately rejected with HTTP 400.
2. **Safe Filenames**:
   Uploaded files are assigned unique UUID identifiers (`res_<uuid>.<ext>`). User-provided filenames are never written to the filesystem.
3. **Type Whitelisting**:
   Strict MIME and extension checking blocks dangerous files (`.exe`, `.sh`, `.bat`, `.dll`).
4. **Credential Protection**:
   Internal stack traces and API keys are suppressed in production mode.

---

## 🤝 AI Service Coordination & Known Limitations

- **Python Service Routes**:
  - `POST /ask`
  - `POST /study-plan`
  - `GET /health`
- **Fallback Simulation**:
  When `AI_MOCK_FALLBACK=true`, if the Python service is offline, the backend provides simulated educational answers so demonstrations and offline student practice never fail.
- **Document Content Search**:
  The `SearchService` includes an extensible provider hook (`registerContentSearchProvider`) designed to cleanly receive vector search results from the AI team without duplicate SQL queries.
