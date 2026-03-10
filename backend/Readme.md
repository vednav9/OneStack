Good choice. **Hybrid architecture** is exactly what serious blog aggregators use (Feedly, Inoreader, etc.).
It gives you:

* fast search
* legal safety
* reader mode
* original traffic to sources

Now I’ll give you the **complete backend plan + file order + feature order** so you can build it step-by-step without confusion.

---

# 1. Overall System Architecture

Your system will have **4 main layers**:

```
Frontend (React)
        ↓
API Server (Node.js)
        ↓
Database (PostgreSQL)
        ↓
Workers (Crawler + Indexer)
```

Additional systems:

```
Redis → caching + queues
Worker → RSS crawler
Worker → blog parsing
Worker → tag generation
Worker → indexing
```

---

# 2. Hybrid Blog Storage Model

Each blog stored like this:

```
Blog
 ├─ title
 ├─ description
 ├─ tags
 ├─ author
 ├─ source_url
 ├─ source_site
 ├─ published_at
 ├─ read_time
 ├─ thumbnail
 ├─ content_excerpt
 ├─ reader_content (optional)
```

Important:

```
User view modes
```

1️⃣ Reader mode → stored parsed content
2️⃣ Original mode → open original blog
3️⃣ Embed mode → iframe

---

# 3. Backend Folder Structure (Final)

```
backend

src

config
  db.js
  env.js
  redis.js

controllers
  authController.js
  userController.js
  blogController.js
  searchController.js

routes
  authRoutes.js
  userRoutes.js
  blogRoutes.js
  searchRoutes.js

services
  authService.js
  userService.js
  blogService.js
  searchService.js

middlewares
  authMiddleware.js
  errorHandler.js

utils
  jwt.js
  logger.js
  tagGenerator.js
  readingTime.js

jobs
  rssCrawler.js
  blogParser.js
  indexingWorker.js
  trendingWorker.js

queues
  crawlQueue.js
  indexingQueue.js

prisma
  schema.prisma

server.js
```

---

# 4. Development Sequence (Important)

Build backend **in this exact order**.

---

# Phase 1 — Core Backend Setup

Files to create first.

```
server.js
config/env.js
config/db.js
middlewares/errorHandler.js
utils/logger.js
```

Features:

* Express server
* Prisma DB connection
* error handling
* logging

---

# Phase 2 — Authentication System

Build this **fully before anything else**.

Files:

```
controllers/authController.js
services/authService.js
routes/authRoutes.js
utils/jwt.js
middlewares/authMiddleware.js
config/googleStrategy.js
```

Features:

### Email signup

```
POST /auth/register
```

### Email login

```
POST /auth/login
```

### Google login

```
GET /auth/google
GET /auth/google/callback
```

### Token refresh

```
POST /auth/refresh
```

---

# Phase 3 — User System

Files:

```
controllers/userController.js
services/userService.js
routes/userRoutes.js
```

Features:

```
GET /user/profile
PUT /user/profile
GET /user/history
GET /user/saved
```

---

# Phase 4 — Blog Interaction

Files:

```
controllers/blogController.js
services/blogService.js
routes/blogRoutes.js
```

Features:

### Save blog

```
POST /blogs/:id/save
```

### Like blog

```
POST /blogs/:id/like
```

### Reading history

```
POST /blogs/:id/read
```

### Lists

```
POST /lists
POST /lists/:id/add-blog
```

---

# Phase 5 — Blog Database

Prisma schema.

```
User
Blog
Source
Tag
BlogTag
SavedBlog
LikedBlog
ReadingHistory
List
ListBlog
```

Example:

```
Blog
 ├ id
 ├ title
 ├ excerpt
 ├ content
 ├ sourceUrl
 ├ sourceSite
 ├ author
 ├ readTime
 ├ publishedAt
```

---

# Phase 6 — Search System

Files:

```
controllers/searchController.js
services/searchService.js
routes/searchRoutes.js
```

API:

```
GET /search?q=ai
GET /search/topic/ai
```

Search fields:

```
title
tags
description
author
```

---

# Phase 7 — Blog Crawler Pipeline

This is where your **50,000+ blogs come from**.

Workers:

```
jobs/rssCrawler.js
jobs/blogParser.js
jobs/indexingWorker.js
jobs/trendingWorker.js
```

Flow:

```
RSS feed
   ↓
fetch article
   ↓
parse content
   ↓
generate tags
   ↓
store blog
   ↓
index blog
```

---

# RSS Crawler

```
rssCrawler.js
```

Reads RSS feeds:

```
https://blog.google/rss
https://openai.com/blog/rss
```

---

# Blog Parser

```
blogParser.js
```

Extracts:

```
title
content
tags
author
thumbnail
```

Libraries:

```
cheerio
readability
```

---

# Tag Generator

```
utils/tagGenerator.js
```

Example:

```
AI
React
WebDev
Startup
```

Later you can use **LLM tagging**.

---

# Phase 8 — Trending Algorithm

Worker:

```
trendingWorker.js
```

Trending score based on:

```
likes
reads
shares
recent views
```

---

# Phase 9 — Queue System

Use **Redis + BullMQ**.

Queues:

```
crawlQueue
indexQueue
tagQueue
```

Flow:

```
RSS fetch
   ↓
crawlQueue
   ↓
parser worker
   ↓
indexQueue
   ↓
search indexing
```

---

# 10. API Endpoints Summary

Auth

```
POST /auth/register
POST /auth/login
GET /auth/google
GET /auth/google/callback
POST /auth/refresh
```

User

```
GET /user/profile
PUT /user/profile
GET /user/history
```

Blogs

```
GET /blogs
GET /blogs/:id
POST /blogs/:id/save
POST /blogs/:id/like
```

Search

```
GET /search?q=
GET /search/topic/:tag
```

Lists

```
POST /lists
POST /lists/:id/blog
```

---

# 11. Database Tables Overview

```
User
Blog
Source
Tag
BlogTag
SavedBlog
LikedBlog
ReadingHistory
List
ListBlog
```

---

# 12. Worker Services

You will run **separate worker processes**.

Example:

```
node jobs/rssCrawler.js
node jobs/blogParser.js
node jobs/indexingWorker.js
```

---

# 13. Tech Stack Summary

Frontend

```
React
Tailwind
Zustand
```

Backend

```
Node.js
Express
Prisma
JWT
Passport
```

Database

```
PostgreSQL
```

Infrastructure

```
Redis
BullMQ
Workers
```

Parsing

```
Cheerio
Mozilla Readability
```

---

# 14. Final System Flow

```
User searches blog
        ↓
Search API
        ↓
PostgreSQL full text search
        ↓
Results returned
        ↓
User opens blog
        ↓
Reader mode or source mode
```

---

# 15. Next Step (Actual Coding Start)

Now we start coding backend **step-by-step in the correct order**.

Step 1 we will build:

```
Production Express Backend
+ Prisma
+ PostgreSQL
+ Env config
+ Logger
```

Then Step 2:

```
JWT Authentication
+ Email login
+ Google login
```

---

If you want, next I will show you the **exact backend starter code (production-level)** including:

* Express setup
* Prisma setup
* env config
* error handling
* logging
* project structure

This will take your backend from **0 → real production foundation**.
