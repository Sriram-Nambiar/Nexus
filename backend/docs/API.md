# NEXUS AI Backend API Specification

This document details the RESTful API endpoints exposed by the NEXUS AI backend service.

---

## Base URLs

- **Local Development**: `http://127.0.0.1:5000`
- **University LAN / Kiwix Hotspot**: `http://<SERVER_IP>:5000` (e.g. `http://192.168.1.50:5000`)
- **Docker**: `http://localhost:5000`

---

## Table of Contents

1. [Health & Diagnostics](#1-health--diagnostics)
2. [Courses](#2-courses)
3. [Educational Resources](#3-educational-resources)
4. [File Delivery & Video Streaming](#4-file-delivery--video-streaming)
5. [Search](#5-search)
6. [AI Proxy Integration](#6-ai-proxy-integration)
7. [Study Plans](#7-study-plans)
8. [Error Responses & Status Codes](#8-error-responses--status-codes)

---

## 1. Health & Diagnostics

### `GET /api/health`
Retrieves comprehensive operational health, storage writeability, and database connectivity.

**Response `200 OK`**:
```json
{
  "status": "healthy",
  "uptime_seconds": 128,
  "timestamp": "2026-10-09T05:30:00.000Z",
  "network": {
    "host": "0.0.0.0",
    "port": 5000,
    "lan_access_enabled": true,
    "base_url": "http://localhost:5000"
  },
  "services": {
    "database": "connected",
    "storage": "available",
    "ai_service": "ok"
  },
  "environment": "production"
}
```

---

## 2. Courses

### `GET /api/courses`
Lists available educational courses.

**Query Parameters**:
- `search` *(string, optional)*: Filter by title, description, or instructor.
- `limit` *(integer, optional, default: 50)*: Number of records to return.
- `offset` *(integer, optional, default: 0)*: Pagination offset.

**Response `200 OK`**:
```json
{
  "success": true,
  "data": [
    {
      "id": "crs_ml_nptel",
      "title": "Machine Learning (NPTEL)",
      "description": "Comprehensive ML course covering supervised learning.",
      "instructor": "Prof. Balaraman Ravindran",
      "created_at": "2026-10-09T05:00:00.000Z",
      "updated_at": "2026-10-09T05:00:00.000Z"
    }
  ],
  "meta": {
    "total": 1,
    "limit": 50,
    "offset": 0
  }
}
```

### `GET /api/courses/:id`
Retrieves course details along with all associated resources.

**Response `200 OK`**:
```json
{
  "success": true,
  "data": {
    "id": "crs_ml_nptel",
    "title": "Machine Learning (NPTEL)",
    "description": "Comprehensive ML course.",
    "instructor": "Prof. Balaraman Ravindran",
    "created_at": "2026-10-09T05:00:00.000Z",
    "updated_at": "2026-10-09T05:00:00.000Z",
    "resources": [
      {
        "id": "res_ml_video_1",
        "course_id": "crs_ml_nptel",
        "title": "Week 1 Lecture 2 - Supervised Learning",
        "description": "Supervised learning definitions and loss functions",
        "resource_type": "video",
        "storage_path": "demo_ml_lecture.mp4",
        "mime_type": "video/mp4",
        "file_size": 68484,
        "created_at": "2026-10-09T05:00:00.000Z",
        "file_url": "/api/resources/res_ml_video_1/file",
        "download_url": "/api/resources/res_ml_video_1/file?download=1"
      }
    ]
  }
}
```

### `POST /api/courses`
Creates a new course.

**Request Body**:
```json
{
  "title": "Operating Systems & Concurrency",
  "description": "Process scheduling, deadlocks, and virtual memory.",
  "instructor": "Dr. Sarah Lin"
}
```

**Response `201 Created`**:
```json
{
  "success": true,
  "data": {
    "id": "crs_os_deadlocks",
    "title": "Operating Systems & Concurrency",
    "description": "Process scheduling, deadlocks, and virtual memory.",
    "instructor": "Dr. Sarah Lin",
    "created_at": "2026-10-09T05:00:00.000Z",
    "updated_at": "2026-10-09T05:00:00.000Z"
  }
}
```

### `PUT /api/courses/:id`
Updates course fields.

### `DELETE /api/courses/:id`
Deletes a course and cascades deletion to all associated resources and files.

---

## 3. Educational Resources

### `POST /api/resources`
Uploads an educational resource (PDF, Video, Notes, or Document).

**Content-Type**: `multipart/form-data`

**Form Fields**:
- `file` *(File, required)*: The educational file to upload (Max 500 MB).
- `course_id` *(string, required)*: ID of the parent course.
- `title` *(string, required)*: Title of the resource.
- `description` *(string, optional)*: Detailed summary.
- `resource_type` *(string, optional)*: One of `pdf`, `video`, `notes`, `document`, `other`. (Auto-detected if omitted).

**Response `201 Created`**:
```json
{
  "success": true,
  "data": {
    "id": "res_84920491-0392-4912-8321-938210381023",
    "course_id": "crs_ml_nptel",
    "title": "Week 1 Supervised Learning Notes",
    "description": "Lecture notes PDF",
    "resource_type": "pdf",
    "storage_path": "res_84920491-0392-4912-8321-938210381023.pdf",
    "mime_type": "application/pdf",
    "file_size": 204850,
    "created_at": "2026-10-09T05:10:00.000Z",
    "file_url": "/api/resources/res_84920491-0392-4912-8321-938210381023/file",
    "download_url": "/api/resources/res_84920491-0392-4912-8321-938210381023/file?download=1"
  }
}
```

### `GET /api/resources/:id`
Returns resource metadata. If called directly by a browser requesting media (`video/*` or `application/pdf`) or with an HTTP `Range` header, it automatically streams the underlying file.

### `GET /api/courses/:id/resources`
Lists all resources belonging to a given course.

---

## 4. File Delivery & Video Streaming

### `GET /api/resources/:id/file`

Delivers the physical file stored on disk with optimized protocols for browsers and offline network clients.

#### 1. PDF Delivery
- Header `Content-Type: application/pdf`
- Header `Content-Disposition: inline; filename="Course_Notes.pdf"`
- Opens natively in browser PDF viewers.
- Append `?download=1` to force file download dialog (`Content-Disposition: attachment`).

#### 2. Video Delivery & HTTP Range Requests
- Supports HTTP Range headers: `Range: bytes=start-end`
- Returns status `206 Partial Content`
- Header `Content-Range: bytes 0-1048575/6848412`
- Header `Accept-Ranges: bytes`
- Header `Content-Length: 1048576`
- Enables video seeking and scrub bars on phones, tablets, and computers connected via the Kiwix hotspot without downloading the entire video file into memory.

---

## 5. Search

### `GET /api/search?q=deadlocks`
Performs fast metadata search across courses (title, description, instructor) and resources (title, description, type).

**Query Parameters**:
- `q` *(string, required)*: The search term.
- `include_content` *(boolean, optional)*: Enables AI document-content vector search if available.

**Response `200 OK`**:
```json
{
  "success": true,
  "data": {
    "query": "deadlocks",
    "total": 3,
    "courses": [
      {
        "id": "crs_os_deadlocks",
        "title": "Operating Systems & Concurrency",
        "instructor": "Dr. Sarah Lin"
      }
    ],
    "resources": [
      {
        "id": "res_os_video_deadlocks",
        "title": "Operating Systems: Deadlocks, Prevention, and Bankers Algorithm",
        "resource_type": "video",
        "file_url": "/api/resources/res_os_video_deadlocks/file"
      }
    ],
    "content_search_enabled": false
  }
}
```

---

## 6. AI Proxy Integration

### `POST /api/ai/ask`
Proxies validated student questions to the Python AI service.

**Request Body**:
```json
{
  "question": "What are the four necessary Coffman conditions for deadlocks to occur?",
  "course_id": "crs_os_deadlocks"
}
```

**Response `200 OK`**:
```json
{
  "success": true,
  "data": {
    "answer": "The four Coffman conditions are: 1) Mutual Exclusion, 2) Hold and Wait, 3) No Preemption, and 4) Circular Wait. All four must hold simultaneously for a deadlock to exist.",
    "sources": [
      {
        "title": "Operating Systems: Deadlocks and Concurrency Guide",
        "snippet": "Four conditions must hold simultaneously for deadlock to occur..."
      }
    ],
    "suggested_questions": [
      "How does the Banker's algorithm prevent deadlocks?",
      "Can circular wait be prevented by resource ordering?"
    ]
  }
}
```

### `POST /api/ai/study-plan`
Requests study plan generation and automatically saves it into the SQLite database.

**Request Body**:
```json
{
  "goal": "Prepare for Machine Learning Semester Exam",
  "duration_weeks": 4,
  "save": true
}
```

**Response `200 OK`**:
```json
{
  "success": true,
  "data": {
    "title": "Mastery Plan: Prepare for Machine Learning Semester Exam",
    "goal": "Prepare for Machine Learning Semester Exam",
    "estimated_hours_per_week": 4,
    "study_plan_id": "sp_98412894-4821-4921-9214-981249812491",
    "saved": true,
    "plan": {
      "weeks": [
        {
          "week": 1,
          "topic": "Module 1: Supervised Learning Principles",
          "activities": [
            "Watch NPTEL Week 1 Lecture 2 video on local hotspot",
            "Read lecture notes PDF"
          ]
        }
      ]
    }
  }
}
```

### `GET /api/ai/health`
Checks connectivity to the Python AI service.

---

## 7. Study Plans

### `GET /api/ai/study-plans`
Lists all saved study plans.

### `GET /api/ai/study-plans/:id`
Retrieves a specific study plan and returns the parsed JSON plan.

---

## 8. Error Responses & Status Codes

All errors return uniform JSON structures:

```json
{
  "success": false,
  "error": "File size exceeds maximum permitted limit"
}
```

For validation errors (HTTP 400):
```json
{
  "success": false,
  "error": "Validation failed",
  "issues": [
    {
      "path": "title",
      "message": "Course title is required"
    }
  ]
}
```

| HTTP Status | Description |
|---|---|
| `200 OK` | Request succeeded |
| `201 Created` | Entity or resource created |
| `206 Partial Content` | Video range chunk served successfully |
| `400 Bad Request` | Zod validation failed or disallowed file type |
| `404 Not Found` | Course, resource, or file not found |
| `413 Payload Too Large`| Uploaded file exceeds `MAX_FILE_SIZE_BYTES` |
| `416 Range Not Satisfiable` | Requested byte range is invalid or beyond file size |
| `429 Too Many Requests`| Rate limit exceeded |
| `502 Bad Gateway` | AI service returned invalid response |
| `503 Service Unavailable` | AI service unreachable |
| `500 Internal Server Error` | Unhandled error (stack trace withheld in production) |
