# NEXUS AI — Frontend

> Modern, offline-first university learning platform designed for university students to access locally hosted educational resources, search courses, ask syllabus-grounded questions using AI, and generate structured revision plans.

---

## 1. Overview & Architectural Principles

NEXUS AI is an **educational productivity platform**, not a generic chatbot. It is engineered with offline-first university campus constraints in mind:
- **Low/No Connectivity Resilience**: Works reliably when connecting directly to local campus Wi-Fi or edge server nodes.
- **Source-Grounded AI**: The study assistant cites verified textbooks, lecture notes, and page numbers. It explicitly labels general ungrounded answers when no local course materials exist.
- **In-Browser Local Media**: Native HTML5 video streaming for lecture recordings and an integrated in-browser PDF reader with direct page jumping from AI citations.
- **Structured Productivity**: Generates daily revision milestones with time estimates and linked local materials rather than large unstructured text walls.
- **Zero Internet Requirement for UI**: Provides typed fallback and simulated offline cache mode when the backend is unreachable.

---

## 2. Technology Stack

- **Framework**: React 19 + TypeScript + Vite
- **Styling**: Tailwind CSS v4 (dark theme by default: charcoal/black palette, subtle borders, high-contrast typography)
- **Routing**: React Router DOM (v7)
- **Icons**: Lucide React
- **HTTP Layer**: Native Fetch API client with automatic offline fallback and typed API contracts

---

## 3. Application Structure

```
frontend/
├── src/
│   ├── api/
│   │   ├── client.ts              # Fetch API client, live backend caller & offline fallback
│   │   ├── types.ts               # Strict TypeScript interfaces matching backend contracts
│   │   ├── mockData.ts            # Realistic university course catalog & syllabus datasets
│   │   └── index.ts
│   ├── components/
│   │   ├── common/                # Reusable UI primitives (Button, Card, Badge, Modal, SearchInput, EmptyState)
│   │   ├── layout/                # Responsive Shell (Sidebar, Header, MobileNav, AppLayout)
│   │   ├── resources/             # ResourceCard, In-browser PdfViewer, HTML5 VideoPlayer, ResourceViewerModal
│   │   └── assistant/             # SourceReferenceCard, ChatMessageItem with citation inspection
│   ├── context/
│   │   ├── AppContext.tsx         # AppProvider component
│   │   ├── useApp.ts              # Custom context hook
│   │   ├── contextDefinition.ts   # Context contract definition
│   │   └── index.ts
│   ├── hooks/
│   │   └── useDebounce.ts         # Debounce hook for global search queries
│   ├── pages/
│   │   ├── DashboardPage.tsx      # Student overview, recent courses & materials, quick prompts
│   │   ├── CoursesPage.tsx        # Searchable course catalog with department filters
│   │   ├── CourseDetailPage.tsx    # Categorized course materials (PDF, Video, Notes, Labs)
│   │   ├── SearchPage.tsx         # Global search across corpus with matching excerpts
│   │   ├── AssistantPage.tsx      # Course-grounded AI chat with citation inspection & page jumps
│   │   ├── PlannerPage.tsx        # Multi-day revision planner with structured daily tasks
│   │   └── AdminResourcesPage.tsx # Educational material uploader with progress tracking
│   ├── App.tsx                    # Route definitions
│   ├── main.tsx                   # Entrypoint
│   └── index.css                  # Tailwind CSS v4 & theme variables
├── .env.example
├── package.json
├── vite.config.ts
└── tsconfig.json
```

---

## 4. API Endpoints & Contracts

The frontend interacts with the backend proxy via these standard endpoints:

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/health` | Node health status and AI service connectivity |
| `GET` | `/api/courses` | List all available campus courses |
| `GET` | `/api/courses/:id` | Course details, department, instructor, metadata |
| `GET` | `/api/courses/:id/resources` | Course educational materials (PDFs, Videos, Notes) |
| `GET` | `/api/resources/:id` | Detailed resource metadata and streaming URLs |
| `GET` | `/api/search?q={term}` | Debounced full-text search across courses and excerpts |
| `POST` | `/api/resources` | Upload new educational material (`multipart/form-data`) |
| `POST` | `/api/ai/ask` | Send question to AI proxy (course-grounded RAG query) |
| `POST` | `/api/ai/study-plan` | Generate multi-day structured revision schedule |
| `POST` | `/api/study-plans` | Persist generated study plan |

### Automatic Offline Fallback Mode
If the backend is not yet started or offline:
- The frontend pings `/api/health` and displays the **Campus Node Status** badge in the header and sidebar.
- Requests automatically fall back to the typed mock data engine without throwing unhandled exceptions.
- Students can also manually toggle **"Simulate Offline"** from the sidebar to test offline behavior.

---

## 5. Development & Running Instructions

### Prerequisites
- Node.js (v18+ or v20+)
- npm or pnpm

### Quick Start
```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Start Vite development server
npm run dev
```

The application will run locally at `http://localhost:5173`.

### Environment Configuration
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
Set `VITE_API_BASE_URL` to your backend URL (defaults to `/api`):
```env
VITE_API_BASE_URL=http://localhost:8000/api
```

### Verification & Testing
```bash
# Run linter
npm run lint

# Build production bundle & type check
npm run build

# Preview production build
npm run preview
```
All commands run cleanly with zero warnings or errors.
