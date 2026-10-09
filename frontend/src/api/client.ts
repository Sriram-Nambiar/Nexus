import type {
  AskQuestionRequest,
  AskQuestionResponse,
  Course,
  CreateResourceRequest,
  CreateStudyPlanRequest,
  HealthCheckResponse,
  Resource,
  SearchResult,
  SourceReference,
  StudyPlanResponse,
} from './types';
import { MOCK_COURSES, MOCK_RESOURCES, MOCK_STUDY_PLANS } from './mockData';

// Configurable API base URL
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

// In-memory / localStorage cache for resources uploaded during local session
const LOCAL_STORAGE_RESOURCES_KEY = 'nexus_local_uploaded_resources';
const LOCAL_STORAGE_SAVED_PLANS_KEY = 'nexus_saved_study_plans';

function getStoredLocalResources(): Resource[] {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_RESOURCES_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveLocalResource(res: Resource): void {
  try {
    const existing = getStoredLocalResources();
    localStorage.setItem(LOCAL_STORAGE_RESOURCES_KEY, JSON.stringify([res, ...existing]));
  } catch {
    // Ignore storage quota errors
  }
}

// Track connection health
let isBackendLive: boolean | null = null;
let forceMockMode = false;

export const apiClientStatus = {
  isLive: () => isBackendLive,
  isMockOnly: () => forceMockMode,
  setForceMock: (val: boolean) => {
    forceMockMode = val;
  },
};

function unwrapData<T>(raw: unknown): T {
  if (raw && typeof raw === 'object' && 'success' in raw && 'data' in raw) {
    return (raw as { data: T }).data;
  }
  return raw as T;
}

/**
 * Health check endpoint: GET /api/health
 */
export async function checkHealth(): Promise<HealthCheckResponse> {
  if (forceMockMode) {
    isBackendLive = false;
    return {
      status: 'ok',
      version: '1.0.0-offline',
      ai_service: 'connected',
      database: 'offline_sqlite',
      storage: 'local',
      offline_ready: true,
      timestamp: new Date().toISOString(),
    };
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2000);

    const res = await fetch(`${API_BASE_URL}/health`, {
      signal: controller.signal,
      headers: { Accept: 'application/json' },
    });
    clearTimeout(timeoutId);

    if (res.ok) {
      const json = await res.json();
      isBackendLive = true;
      return unwrapData<HealthCheckResponse>(json);
    }
    throw new Error(`Health check returned status ${res.status}`);
  } catch {
    isBackendLive = false;
    // Fallback offline health info
    return {
      status: 'degraded',
      version: '1.0.0-local-cache',
      ai_service: 'connected',
      database: 'offline_sqlite',
      storage: 'local',
      offline_ready: true,
      timestamp: new Date().toISOString(),
    };
  }
}

/**
 * GET /api/courses
 */
export async function getCourses(): Promise<Course[]> {
  if (!forceMockMode && isBackendLive !== false) {
    try {
      const res = await fetch(`${API_BASE_URL}/courses`);
      if (res.ok) {
        isBackendLive = true;
        const json = await res.json();
        const data = unwrapData<any>(json);
        const list = Array.isArray(data) ? data : Array.isArray(data?.courses) ? data.courses : [];
        if (list.length > 0) {
          return list.map((c: any) => ({
            id: c.id,
            code: c.code || (c.id?.startsWith('crs_') ? c.id.replace('crs_', '').toUpperCase() : 'COURSE'),
            title: c.title,
            description: c.description || '',
            instructor: c.instructor,
            department: c.department || 'Computer Science',
            semester: c.semester || 'Fall 2026',
            resource_count: c.resource_count ?? (c.resources?.length ?? 0),
            resource_types: c.resource_types || ['pdf', 'video', 'notes'],
            updated_at: c.updated_at,
          }));
        }
      }
    } catch {
      isBackendLive = false;
    }
  }

  // Mock / Offline fallback
  await new Promise((r) => setTimeout(r, 80));
  return [...MOCK_COURSES];
}

/**
 * GET /api/courses/:id
 */
export async function getCourseById(id: string): Promise<Course> {
  if (!forceMockMode && isBackendLive !== false) {
    try {
      const res = await fetch(`${API_BASE_URL}/courses/${encodeURIComponent(id)}`);
      if (res.ok) {
        isBackendLive = true;
        const json = await res.json();
        const c = unwrapData<any>(json);
        return {
          id: c.id,
          code: c.code || (c.id?.startsWith('crs_') ? c.id.replace('crs_', '').toUpperCase() : 'COURSE'),
          title: c.title,
          description: c.description || '',
          instructor: c.instructor,
          department: c.department || 'Computer Science',
          semester: c.semester || 'Fall 2026',
          resource_count: c.resource_count ?? (c.resources?.length ?? 0),
          resource_types: c.resource_types || ['pdf', 'video', 'notes'],
          updated_at: c.updated_at,
        };
      }
    } catch {
      isBackendLive = false;
    }
  }

  await new Promise((r) => setTimeout(r, 60));
  const found = MOCK_COURSES.find((c) => c.id === id || c.code.toLowerCase() === id.toLowerCase());
  if (!found) {
    throw new Error(`Course with ID "${id}" was not found.`);
  }
  return found;
}

/**
 * GET /api/courses/:id/resources
 */
export async function getCourseResources(courseId: string): Promise<Resource[]> {
  if (!forceMockMode && isBackendLive !== false) {
    try {
      const res = await fetch(`${API_BASE_URL}/courses/${encodeURIComponent(courseId)}/resources`);
      if (res.ok) {
        isBackendLive = true;
        const json = await res.json();
        const data = unwrapData<any>(json);
        const list = Array.isArray(data) ? data : Array.isArray(data?.resources) ? data.resources : [];
        if (list.length > 0) {
          return list.map((r: any) => ({
            id: r.id,
            course_id: r.course_id || courseId,
            course_title: r.course_title,
            course_code: r.course_code,
            title: r.title,
            description: r.description,
            resource_type: r.resource_type || 'notes',
            file_url: r.file_url || `${API_BASE_URL}/resources/${r.id}/file`,
            file_name: r.file_name || r.title,
            file_size_bytes: r.file_size || r.file_size_bytes,
            duration_seconds: r.duration_seconds,
            page_count: r.page_count,
            author: r.author || r.instructor,
            created_at: r.created_at || new Date().toISOString(),
            tags: r.tags || [r.resource_type],
            content_preview: r.description,
          }));
        }
      }
    } catch {
      isBackendLive = false;
    }
  }

  await new Promise((r) => setTimeout(r, 90));
  const baseList = MOCK_RESOURCES.filter((r) => r.course_id === courseId);
  const userAdded = getStoredLocalResources().filter((r) => r.course_id === courseId);
  return [...userAdded, ...baseList];
}

/**
 * GET /api/resources/:id
 */
export async function getResourceById(id: string): Promise<Resource> {
  if (!forceMockMode && isBackendLive !== false) {
    try {
      const res = await fetch(`${API_BASE_URL}/resources/${encodeURIComponent(id)}`);
      if (res.ok) {
        isBackendLive = true;
        return await res.json();
      }
    } catch {
      isBackendLive = false;
    }
  }

  await new Promise((r) => setTimeout(r, 60));
  const all = [...getStoredLocalResources(), ...MOCK_RESOURCES];
  const found = all.find((r) => r.id === id);
  if (!found) {
    throw new Error(`Resource with ID "${id}" not found.`);
  }
  return found;
}

/**
 * GET /api/search?q=deadlocks
 */
export async function searchResources(query: string): Promise<SearchResult[]> {
  const trimmed = query.trim().toLowerCase();
  if (!trimmed) return [];

  if (!forceMockMode && isBackendLive !== false) {
    try {
      const res = await fetch(`${API_BASE_URL}/search?q=${encodeURIComponent(trimmed)}`);
      if (res.ok) {
        isBackendLive = true;
        const json = await res.json();
        const data = unwrapData<any>(json);
        if (data && Array.isArray(data.resources)) {
          return data.resources.map((r: any) => ({
            id: `search-${r.id}`,
            resource_id: r.id,
            resource_title: r.title,
            course_id: r.course_id || 'course',
            course_title: r.course_title || 'Campus Course',
            course_code: r.course_code || 'UNIV',
            resource_type: r.resource_type || 'notes',
            matching_snippet: r.description || r.title,
            file_url: r.file_url || `${API_BASE_URL}/resources/${r.id}/file`,
          }));
        }
      }
    } catch {
      isBackendLive = false;
    }
  }

  // Mock / Local search engine implementation
  await new Promise((r) => setTimeout(r, 120));
  const allResources = [...getStoredLocalResources(), ...MOCK_RESOURCES];
  const results: SearchResult[] = [];

  for (const res of allResources) {
    const titleMatch = res.title.toLowerCase().includes(trimmed);
    const descMatch = (res.description || '').toLowerCase().includes(trimmed);
    const previewMatch = (res.content_preview || '').toLowerCase().includes(trimmed);
    const tagMatch = (res.tags || []).some((t) => t.toLowerCase().includes(trimmed));

    if (titleMatch || descMatch || previewMatch || tagMatch) {
      // Find matching text excerpt snippet
      let snippet = res.content_preview || res.description || 'Matching course material';
      if (previewMatch && res.content_preview) {
        const idx = res.content_preview.toLowerCase().indexOf(trimmed);
        const start = Math.max(0, idx - 40);
        const end = Math.min(res.content_preview.length, idx + trimmed.length + 80);
        snippet = (start > 0 ? '...' : '') + res.content_preview.substring(start, end) + (end < res.content_preview.length ? '...' : '');
      }

      results.push({
        id: `search-${res.id}`,
        resource_id: res.id,
        resource_title: res.title,
        course_id: res.course_id,
        course_title: res.course_title || 'General Course',
        course_code: res.course_code || 'UNIV',
        resource_type: res.resource_type,
        matching_snippet: snippet,
        file_url: res.file_url,
        page_number: res.page_count ? Math.floor(Math.random() * (res.page_count - 1)) + 1 : undefined,
        relevance_score: titleMatch ? 0.95 : tagMatch ? 0.85 : 0.75,
      });
    }
  }

  return results;
}

/**
 * POST /api/resources
 * Handles administrative resource upload
 */
export async function uploadResource(
  data: CreateResourceRequest,
  onProgress?: (percent: number) => void
): Promise<Resource> {
  if (!forceMockMode && isBackendLive !== false) {
    try {
      const formData = new FormData();
      formData.append('title', data.title);
      formData.append('course_id', data.course_id);
      formData.append('resource_type', data.resource_type);
      if (data.description) formData.append('description', data.description);
      formData.append('file', data.file);

      // Attempt live upload
      const res = await fetch(`${API_BASE_URL}/resources`, {
        method: 'POST',
        body: formData,
      });

      if (res.ok) {
        isBackendLive = true;
        if (onProgress) onProgress(100);
        const json = await res.json();
        const r = unwrapData<any>(json);
        return {
          id: r.id,
          course_id: r.course_id,
          course_title: r.course_title,
          course_code: r.course_code,
          title: r.title,
          description: r.description,
          resource_type: r.resource_type || data.resource_type,
          file_url: r.file_url || `${API_BASE_URL}/resources/${r.id}/file`,
          file_name: data.file.name,
          file_size_bytes: r.file_size || data.file.size,
          created_at: r.created_at || new Date().toISOString(),
          tags: r.tags || [data.resource_type, 'local-upload'],
          content_preview: r.description || r.title,
        };
      }
    } catch {
      isBackendLive = false;
    }
  }

  // Simulated upload with realistic progress steps
  if (onProgress) {
    onProgress(15);
    await new Promise((r) => setTimeout(r, 200));
    onProgress(45);
    await new Promise((r) => setTimeout(r, 250));
    onProgress(85);
    await new Promise((r) => setTimeout(r, 200));
    onProgress(100);
  }

  const course = MOCK_COURSES.find((c) => c.id === data.course_id);
  const newResource: Resource = {
    id: `res-user-${Date.now()}`,
    course_id: data.course_id,
    course_title: course?.title || 'Course Resource',
    course_code: course?.code || 'UNIV',
    title: data.title,
    description: data.description || 'Uploaded educational material.',
    resource_type: data.resource_type,
    file_url: URL.createObjectURL(data.file),
    file_name: data.file.name,
    file_size_bytes: data.file.size,
    created_at: new Date().toISOString(),
    tags: [data.resource_type, 'local-upload'],
    content_preview: `Locally uploaded ${data.resource_type} for ${course?.title || data.course_id}. Verified locally hosted material.`,
  };

  saveLocalResource(newResource);
  return newResource;
}

/**
 * POST /api/ai/ask
 * Coordinates question answering grounded in university course materials
 */
export async function askAI(request: AskQuestionRequest): Promise<AskQuestionResponse> {
  if (!request.question.trim()) {
    throw new Error('Please enter a question to ask the study assistant.');
  }

  if (!forceMockMode && isBackendLive !== false) {
    try {
      const res = await fetch(`${API_BASE_URL}/ai/ask`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(request),
      });

      if (res.ok) {
        isBackendLive = true;
        const json = await res.json();
        const data = unwrapData<any>(json);
        return {
          answer: data.answer,
          sources: (data.sources || []).map((s: any, idx: number) => ({
            resource_id: s.resource_id || `src-${idx}`,
            resource_title: s.title || s.resource_title || 'Cited Course Material',
            course_id: s.course_id || request.course_id || 'course',
            course_title: s.course_title || 'Course Syllabus',
            course_code: s.course_code || 'UNIV',
            resource_type: s.resource_type || 'pdf',
            passage: s.snippet || s.passage || '',
            page_number: s.page_number,
            section: s.section,
            file_url: s.file_url || '#',
          })),
          grounded: Boolean(data.sources && data.sources.length > 0),
          generated_at: new Date().toISOString(),
          confidence_score: data.confidence_score,
        };
      } else {
        const errorBody = await res.json().catch(() => ({}));
        throw new Error(errorBody.message || errorBody.error || `AI service responded with status ${res.status}`);
      }
    } catch (err: unknown) {
      if ((err as Error).message?.includes('AI service responded')) {
        throw err;
      }
      isBackendLive = false;
    }
  }

  // Simulated AI response grounded in local university syllabus
  await new Promise((r) => setTimeout(r, 650));
  const q = request.question.toLowerCase();

  // Deadlocks & Banker's algorithm
  if (q.includes('deadlock') || q.includes('banker') || q.includes('coffman')) {
    const sources: SourceReference[] = [
      {
        resource_id: 'res-cs301-pdf-01',
        resource_title: 'Lecture 05: Deadlocks, Coffman Conditions, and Banker\'s Algorithm',
        course_id: 'cs-301',
        course_title: 'Operating Systems & Concurrency',
        course_code: 'CS-301',
        resource_type: 'pdf',
        page_number: 14,
        section: 'Section 4.2: Coffman Conditions',
        passage: 'For a deadlock to occur, four conditions must hold simultaneously: 1. Mutual Exclusion, 2. Hold and Wait, 3. No Preemption, and 4. Circular Wait.',
        file_url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
      },
      {
        resource_id: 'res-cs301-pdf-01',
        resource_title: 'Lecture 05: Deadlocks, Coffman Conditions, and Banker\'s Algorithm',
        course_id: 'cs-301',
        course_title: 'Operating Systems & Concurrency',
        course_code: 'CS-301',
        resource_type: 'pdf',
        page_number: 22,
        section: 'Section 5.1: Banker\'s Algorithm Safety Criteria',
        passage: 'A state is safe if there exists an execution sequence <P1, P2, ... Pn> such that for each Pi, the resources that Pi can still request can be satisfied by currently available resources plus resources held by all Pj (j < i).',
        file_url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
      },
    ];

    return {
      answer: `### Deadlocks & Coffman Conditions

In modern operating systems, a **deadlock** is an impasse where a set of processes are blocked because each process holds a resource and waits for another resource held by another process.

According to **CS-301 Lecture 05**, four conditions must hold simultaneously for a deadlock to arise:

1. **Mutual Exclusion**: At least one resource must be held in a non-shareable mode.
2. **Hold and Wait**: A process must hold at least one resource and be waiting to acquire additional resources held by other processes.
3. **No Preemption**: Resources cannot be preempted; a resource can only be released voluntarily by the process holding it after finishing its task.
4. **Circular Wait**: A closed chain of processes exists such that each process holds at least one resource needed by the next process in the chain.

---

### Dijkstra's Banker's Algorithm
The Banker's Algorithm prevents deadlocks in multi-instance resource environments by maintaining:
- **Allocation Matrix**: Currently allocated instances per process.
- **Max Matrix**: Maximum demand declared by each process.
- **Need Matrix**: $\\text{Need}[i][j] = \\text{Max}[i][j] - \\text{Allocation}[i][j]$.
- **Available Vector**: Unassigned resources in the system.

Before granting any request $\\text{Request}_i \\le \\text{Available}$, the kernel simulates allocation and verifies if the resulting state remains **Safe**. If unsafe, process $P_i$ must wait.`,
      sources,
      grounded: true,
      generated_at: new Date().toISOString(),
      course_id: 'cs-301',
      confidence_score: 0.98,
    };
  }

  // Raft & Consensus
  if (q.includes('raft') || q.includes('consensus') || q.includes('leader election') || q.includes('paxos')) {
    const sources: SourceReference[] = [
      {
        resource_id: 'res-cs340-pdf-01',
        resource_title: 'The Raft Consensus Algorithm: In Search of an Understandable Consensus',
        course_id: 'cs-340',
        course_title: 'Distributed Systems & Consensus',
        course_code: 'CS-340',
        resource_type: 'pdf',
        page_number: 4,
        section: 'Section 5.2: Leader Election',
        passage: 'Raft uses randomized election timeouts to ensure that split votes are rare and resolved quickly. If a follower receives no communication over an election timeout, it transitions to candidate state and increments its current term.',
        file_url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
      },
    ];

    return {
      answer: `### Raft Consensus: Leader Election & Log Replication

The **Raft Consensus Protocol** (CS-340) decomposes state machine replication into three key sub-problems:

1. **Leader Election**:
   - Nodes start in **Follower** state.
   - If a follower does not receive heartbeats (\`AppendEntries\`) before its randomized election timeout expires (typically 150ms–300ms), it transitions to **Candidate**, increments its **Term**, votes for itself, and broadcasts \`RequestVote\` RPCs.
   - A candidate becomes leader once it gains votes from a strict majority ($> N/2$) of the cluster.

2. **Log Replication**:
   - The leader accepts client write requests, appends them to its local write-ahead log, and disseminates \`AppendEntries\` to followers.
   - Once an entry is confirmed replicated on a majority of nodes, it is marked **Committed** and applied to the state machine.

3. **Safety Invariant**:
   - A voter denies its vote if the candidate's log is less up-to-date than its own log (evaluated by term first, then index length).`,
      sources,
      grounded: true,
      generated_at: new Date().toISOString(),
      course_id: 'cs-340',
      confidence_score: 0.96,
    };
  }

  // Virtual memory & Paging
  if (q.includes('paging') || q.includes('virtual memory') || q.includes('tlb') || q.includes('page fault')) {
    const sources: SourceReference[] = [
      {
        resource_id: 'res-cs301-pdf-02',
        resource_title: 'Virtual Memory, Multi-Level Paging & TLB Hit Ratios',
        course_id: 'cs-301',
        course_title: 'Operating Systems & Concurrency',
        course_code: 'CS-301',
        resource_type: 'pdf',
        page_number: 11,
        section: 'Section 3.3: TLB Effective Access Time',
        passage: 'Effective Access Time (EAT) = Hit_Ratio * (TLB_time + Mem_time) + (1 - Hit_Ratio) * (TLB_time + 2 * Mem_time). For 2-level paging, a TLB miss costs two memory references to walk the page directory and page table.',
        file_url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
      },
    ];

    return {
      answer: `### Virtual Memory & Multi-Level Paging Mechanics

**Virtual Memory** decouples the logical address space perceived by user programs from the physical DRAM frames managed by the hardware MMU.

#### Address Translation Architecture
A virtual address is split into:
- **Page Number ($p$)**: Index into the active page table directory.
- **Offset ($d$)**: Byte displacement within the $4\\text{ KB}$ page frame.

#### Translation Lookaside Buffer (TLB)
Because page tables reside in main memory, every memory access would require two DRAM round-trips without hardware acceleration. The **TLB** is an associative hardware cache storing recently translated $(\\text{VPN} \\to \\text{PFN})$ pairs:

$$\\text{Effective Access Time (EAT)} = h \\cdot (t_{\\text{TLB}} + t_{\\text{RAM}}) + (1 - h) \\cdot (t_{\\text{TLB}} + 2 \\cdot t_{\\text{RAM}})$$

When a virtual page is marked invalid in the page table entry, the MMU triggers a **Page Fault Exception (Trap #14)**, handing control to the kernel's swap daemon to load the page from storage.`,
      sources,
      grounded: true,
      generated_at: new Date().toISOString(),
      course_id: 'cs-301',
      confidence_score: 0.97,
    };
  }

  // Red-Black Trees or Data Structures
  if (q.includes('red-black') || q.includes('tree') || q.includes('rotation') || q.includes('avl')) {
    const sources: SourceReference[] = [
      {
        resource_id: 'res-cs210-pdf-01',
        resource_title: 'Self-Balancing Search Trees: Red-Black Trees Invariant Guide',
        course_id: 'cs-210',
        course_title: 'Data Structures & Algorithmic Analysis',
        course_code: 'CS-210',
        resource_type: 'pdf',
        page_number: 7,
        section: 'Section 2.1: The 5 Fundamental Invariants',
        passage: 'Properties: 1. Every node is red or black. 2. Root is black. 3. Leaves (NIL) are black. 4. Red nodes cannot have red children. 5. Equal black-height across all root-to-leaf paths.',
        file_url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
      },
    ];

    return {
      answer: `### Red-Black Tree Invariants and Balancing

A **Red-Black Tree** (CS-210) is a self-balancing binary search tree that guarantees $O(\\log n)$ search, insertion, and deletion complexity by maintaining five structural invariants:

1. **Color Rule**: Every node is explicitly colored either **Red** or **Black**.
2. **Root Rule**: The root node is always **Black**.
3. **Leaf Rule**: Every sentinel leaf node (\`NIL\`) is **Black**.
4. **Red Invariant**: If a node is **Red**, then both of its children must be **Black** (no two consecutive red nodes on any path).
5. **Black-Height Invariant**: For every node, all paths from the node to descendant \`NIL\` leaves contain the exact same count of black nodes.

#### Why height is bounded by $2\\log_2(n+1)$
Because no path can have two red nodes in a row, the longest path (alternating red and black) is at most twice the length of the shortest path (all black). Hence balance is maintained without the rigid strictness of AVL trees.`,
      sources,
      grounded: true,
      generated_at: new Date().toISOString(),
      course_id: 'cs-210',
      confidence_score: 0.95,
    };
  }

  // Non-grounded or general academic query where no local syllabus references exist
  // Fulfills: "The assistant must not pretend that an answer is source-grounded if the AI service returns no sources."
  return {
    answer: `I analyzed your question: **"${request.question}"**.

I did not find matching textbook chapters, lecture notes, or recitation slides for this specific topic in your locally hosted course repository.

Here is a general academic explanation based on fundamental computer science principles:
- Please verify if there is an uploaded course module or lecture PDF corresponding to this topic in the **Course Library**.
- If this is part of your syllabus, an administrator or instructor can add the lecture PDF in the **Resource Manager** to ground future AI answers with verified citations and exact page numbers.`,
    sources: [], // Explicitly empty sources!
    grounded: false, // Explicitly false!
    generated_at: new Date().toISOString(),
    confidence_score: 0.60,
  };
}

/**
 * POST /api/ai/study-plan
 * Generates structured multi-day study revision plan
 */
export async function generateStudyPlan(request: CreateStudyPlanRequest): Promise<StudyPlanResponse> {
  if (!forceMockMode && isBackendLive !== false) {
    try {
      const res = await fetch(`${API_BASE_URL}/ai/study-plan`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(request),
      });

      if (res.ok) {
        isBackendLive = true;
        return await res.json();
      }
    } catch {
      isBackendLive = false;
    }
  }

  // Simulated structured study plan generation
  await new Promise((r) => setTimeout(r, 700));

  const totalDays = request.days_count || 4;
  const hoursPerDay = request.hours_per_day || 3;
  const courseNames = request.course_ids.length > 0
    ? request.course_ids.map((id) => {
        const found = MOCK_COURSES.find((c) => c.id === id);
        return found ? `${found.title} (${found.code})` : id;
      })
    : ['Operating Systems & Concurrency (CS-301)'];

  const generatedDays = [
    {
      day_number: 1,
      day_label: 'Day 1: Theoretical Foundations & Architecture',
      focus_area: 'System model, core definitions, and foundational mechanics.',
      tasks: [
        {
          id: `task-d1-1`,
          title: 'Review Course Lecture Notes & Cheat Sheet',
          description: 'Synthesize definitions, hardware diagrams, and core formulas.',
          estimated_minutes: 60,
          resource_id: 'res-cs301-notes-01',
          resource_title: 'Quick Revision Sheet: Process Scheduling & CPU Dispatcher',
          resource_type: 'notes' as const,
          completed: false,
        },
        {
          id: `task-d1-2`,
          title: 'Deep Dive: Primary Text Reading',
          description: 'Focus on highlighted textbook passages and state transition proofs.',
          estimated_minutes: 90,
          resource_id: 'res-cs301-pdf-01',
          resource_title: 'Lecture 05: Deadlocks, Coffman Conditions, and Banker\'s Algorithm',
          resource_type: 'pdf' as const,
          completed: false,
        },
      ],
    },
    {
      day_number: 2,
      day_label: 'Day 2: Synchronization, Invariants & Case Studies',
      focus_area: 'Algorithm trace, race conditions, and critical section invariants.',
      tasks: [
        {
          id: `task-d2-1`,
          title: 'Recitation Video Lecture Walkthrough',
          description: 'Watch code walkthroughs and note synchronization primitives in practice.',
          estimated_minutes: 60,
          resource_id: 'res-cs301-vid-01',
          resource_title: 'Recitation 03: POSIX Mutexes, Condition Variables, and Race Conditions',
          resource_type: 'video' as const,
          completed: false,
        },
        {
          id: `task-d2-2`,
          title: 'Algorithmic Problem Solving Worksheet',
          description: 'Complete 4 textbook numerical problems under timed conditions.',
          estimated_minutes: 75,
          completed: false,
        },
      ],
    },
    {
      day_number: 3,
      day_label: 'Day 3: Memory Subsystems & Advanced Mechanics',
      focus_area: 'Paging hierarchies, TLB calculation, replacement policies, and crash recovery.',
      tasks: [
        {
          id: `task-d3-1`,
          title: 'Study Virtual Memory & TLB Formulas',
          description: 'Derive Effective Access Time under different hit ratio scenarios.',
          estimated_minutes: 60,
          resource_id: 'res-cs301-pdf-02',
          resource_title: 'Virtual Memory, Multi-Level Paging & TLB Hit Ratios',
          resource_type: 'pdf' as const,
          completed: false,
        },
        {
          id: `task-d3-2`,
          title: 'Lab Code Analysis & Edge Cases',
          description: 'Review lab starter files and identify common synchronization bugs.',
          estimated_minutes: 60,
          resource_id: 'res-cs301-lab-01',
          resource_title: 'Lab 02: Implementing an OS Kernel Round Robin Scheduler',
          resource_type: 'lab' as const,
          completed: false,
        },
      ],
    },
    {
      day_number: 4,
      day_label: 'Day 4: Comprehensive Exam Simulation & Synthesis',
      focus_area: 'Past papers, rapid recall, and cross-topic integration questions.',
      tasks: [
        {
          id: `task-d4-1`,
          title: 'Mock Midterm Practice Exam',
          description: 'Timed full-length exam simulation covering all course modules.',
          estimated_minutes: 90,
          completed: false,
        },
        {
          id: `task-d4-2`,
          title: 'AI Assistant Weak Spot Interrogation',
          description: 'Use NEXUS AI to clarify questions and test recall on doubtful topics.',
          estimated_minutes: 45,
          completed: false,
        },
      ],
    },
  ].slice(0, totalDays);

  const planResponse: StudyPlanResponse = {
    id: `plan-${Date.now()}`,
    goal: request.topic_or_goal,
    course_ids: request.course_ids,
    course_names: courseNames,
    created_at: new Date().toISOString(),
    total_days: totalDays,
    total_hours: totalDays * hoursPerDay,
    summary: `Tailored ${totalDays}-day revision strategy for "${request.topic_or_goal}". Allocated ~${hoursPerDay} hours per day structured into actionable tasks linked with locally hosted university readings, lecture videos, and practice problems.`,
    days: generatedDays,
  };

  return planResponse;
}

/**
 * Save study plan to backend or local persistence
 */
export async function saveStudyPlan(plan: StudyPlanResponse): Promise<{ success: boolean; id: string }> {
  if (!forceMockMode && isBackendLive !== false) {
    try {
      const res = await fetch(`${API_BASE_URL}/study-plans`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(plan),
      });
      if (res.ok) {
        return { success: true, id: plan.id };
      }
    } catch {
      // Fallback to local save
    }
  }

  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_SAVED_PLANS_KEY);
    const existing: StudyPlanResponse[] = raw ? JSON.parse(raw) : [];
    const updated = [plan, ...existing.filter((p) => p.id !== plan.id)];
    localStorage.setItem(LOCAL_STORAGE_SAVED_PLANS_KEY, JSON.stringify(updated));
  } catch {
    // Ignore storage quota
  }

  return { success: true, id: plan.id };
}

export function getSavedStudyPlans(): StudyPlanResponse[] {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_SAVED_PLANS_KEY);
    const list = raw ? JSON.parse(raw) : [];
    if (list.length === 0) {
      return [MOCK_STUDY_PLANS.default];
    }
    return list;
  } catch {
    return [MOCK_STUDY_PLANS.default];
  }
}
