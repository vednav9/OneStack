## Frontend

**Framework**

* React.js
* Vite (fast dev server)

**UI**

* Tailwind CSS
* shadcn/ui (components)

**Data fetching**

* TanStack Query (React Query)

**Routing**

* React Router

**Optional**

* Framer Motion (animations)

---

# Backend

**Runtime**

* Node.js

**Framework**

* Express.js (simple)
  or
* NestJS (more structured, better for big projects)

For your project I recommend:

✅ **Node + Express** (fast to build)

---

# Database (Important Choice)

You will store **metadata + user actions**, not full blogs.

### Use:

### PostgreSQL

Best for:

* relational data
* filters
* structured queries

Example tables:

```sql
users
blogs_metadata
interactions
comments
tags
```

PostgreSQL is **very reliable and widely used**.

---

# Search Engine

Normal SQL search will not be enough.

Use:

### Meilisearch

Benefits:

* super fast
* typo tolerant
* easy setup
* great with Node

Example search:

```text
authentication zomato
```

returns relevant blogs instantly.

Alternative:

* Elasticsearch (heavier)
* Typesense (also good)

I recommend:

✅ **Meilisearch**

---

# Cache Layer

Because blogs are **fetched dynamically**, you must cache them.

Use:

### Redis

Use cases:

* cache blog content (10–30 min)
* queue jobs
* rate limiting

Example:

```text
Key: blog_url
TTL: 30 minutes
```

---

# Queue / Background Jobs

You need background jobs for:

* blog ingestion
* tag generation
* metadata updates

Use:

### BullMQ

BullMQ runs on Redis.

Example jobs:

```text
fetch_rss_job
parse_blog_job
generate_tags_job
```

---

# Blog Crawling Tools

For ingestion pipeline.

### RSS Parser

```bash
npm install rss-parser
```

---

### HTML Parsing

```bash
npm install cheerio
```

---

### Article Extraction

```bash
npm install @mozilla/readability
npm install jsdom
```

Used for reader mode.

---

# HTTP Fetch

Use:

### Axios

```bash
npm install axios
```

---

# Authentication

Use:

### JWT

```text
Access token
Refresh token
```

For login:

* Google OAuth
* GitHub OAuth

Library:

```bash
npm install passport
npm install jsonwebtoken
```

---

# Deployment

### Frontend

* Vercel

### Backend

* Railway
* Fly.io
* AWS EC2

---

# Storage (Optional)

If you store:

* thumbnails
* screenshots

Use:

* Cloudflare R2
* AWS S3

---

# Observability (Optional but good)

* Sentry (error tracking)
* Logtail / Loki (logs)

---

# Recommended Architecture

```text
Frontend (React + Vite)
        │
        ▼
Backend API (Node + Express)
        │
        ├── PostgreSQL (metadata + users)
        │
        ├── Meilisearch (search index)
        │
        ├── Redis (cache + queues)
        │
        └── BullMQ Workers (blog ingestion)
```

---

# Example Folder Structure

Backend:

```text
backend
│
├── controllers
│
├── services
│
├── crawlers
│
├── workers
│
├── models
│
├── routes
│
└── utils
```

Frontend:

```text
frontend
│
├── components
├── pages
├── hooks
├── api
└── utils
```

---

# Stack Summary

| Layer           | Technology           |
| --------------- | -------------------- |
| Frontend        | React + Vite         |
| UI              | Tailwind + shadcn    |
| Backend         | Node + Express       |
| Database        | PostgreSQL           |
| Search          | Meilisearch          |
| Cache           | Redis                |
| Queue           | BullMQ               |
| Crawler         | RSS Parser + Cheerio |
| Article parsing | Mozilla Readability  |
| Auth            | JWT + OAuth          |

---

# Why This Stack Is Perfect

This stack supports:

✅ dynamic content fetching
✅ fast search
✅ scalable crawling
✅ caching for performance
✅ modern frontend dev
