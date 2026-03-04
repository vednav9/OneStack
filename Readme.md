# 🚀 BlogLens

**Unified Discovery Platform for Real-World Engineering Blogs**

BlogLens is a developer-first platform that continuously aggregates production-grade engineering blogs from top tech companies and makes them searchable, comparable, and discussable in one place.

It focuses on **how real systems are built in production**, not tutorials.

---

## 🧠 Why BlogLens?

Engineering insights are scattered across:

* Company engineering blogs
* Medium posts
* Personal tech write-ups

Developers often search things like:

* *“authentication system Zomato”*
* *“rate limiting Uber”*
* *“distributed cache Netflix”*

BlogLens solves this by:

* Automatically ingesting new engineering blogs
* Enabling keyword + semantic search
* Showing related system designs side-by-side
* Adding community signals (votes, comments, saves)

---

## ✨ Key Features

### 🔍 Search & Discovery

* Keyword search (title, tags, company)
* Semantic search using vector embeddings
* Filters by company, topic, and recency

### 📰 Automated Blog Ingestion

* Fetches new posts every 10–30 minutes
* Supports RSS, Sitemap, and HTML crawling
* Change detection & deduplication built-in

### 🖥 Unified Blog Viewer

* Displays original blog inside the platform (iframe if allowed)
* Reader-mode fallback when embedding is blocked
* Sidebar with similar & recommended blogs

### 🤝 Community Layer

* Upvote / Downvote blogs
* Save blogs to profile
* Comment & discuss
* Share links

### 🧠 Recommendation Engine

* Content similarity–based recommendations
* Popularity & freshness aware
* “People also read” suggestions

---

## 🏗 High-Level Architecture

```
Blog Sources (RSS / Sitemap / HTML)
            ↓
     Ingestion Scheduler
            ↓
      Fetcher Workers
            ↓
 Change Detection & Deduplication
            ↓
     Parser & Cleaner
            ↓
 Search Index + Vector DB
            ↓
         API Layer
            ↓
       Frontend (Web)
```

---

## 🧰 Tech Stack

### Frontend

* **Next.js** (SEO & performance)
* **React**
* **Tailwind CSS**
* **ShadCN UI**
* **React Query**
* **Framer Motion** (optional)

---

### Backend

* **Node.js** (NestJS / Express)
* **PostgreSQL** – relational metadata
* **Redis** – caching & queues
* **BullMQ** – background jobs
* **FastAPI** (optional ML services)

---

### Search & Intelligence

* **Meilisearch / OpenSearch** – keyword search
* **Qdrant / Pinecone** – vector similarity search
* **Sentence Transformers / OpenAI** – embeddings

---

### Crawling & Ingestion

* **RSS parsers**
* **Sitemap XML parsing**
* **Playwright** – JS-rendered sites
* **Cheerio** – HTML parsing
* **Cron / scheduled workers**

---

### Infrastructure

* **Docker**
* **Cloudflare** (CDN)
* **AWS / GCP / Fly.io**
* **Object storage** (S3 compatible)

---

## 🗄 Database Design (Core Tables)

### `blog_sources`

```sql
id
name
base_url
rss_url
crawl_strategy      -- rss | sitemap | html
crawl_interval_min
etag
last_modified
last_checked_at
status
```

---

### `blogs`

```sql
id
title
url
company
summary
tags
published_at
embedding
created_at
```

---

### `users`

```sql
id
email
provider
created_at
```

---

### `interactions`

```sql
id
user_id
blog_id
type          -- upvote | downvote | save | comment
content       -- for comments
created_at
```

---

## 🔄 Blog Ingestion Workflow

### 1️⃣ Scheduling

* Each source has its own crawl interval
* Priority-based scheduling to avoid overload
* Only due sources are processed

---

### 2️⃣ Fetch Strategy (in order)

1. **RSS feed** (preferred)
2. **Sitemap diffing**
3. **HTML listing crawl** (fallback)

---

### 3️⃣ Change Detection

* Uses `ETag` and `Last-Modified` headers
* Skips unchanged content (`304 Not Modified`)
* HTML hash comparison as fallback

---

### 4️⃣ Parsing & Cleaning

* Remove navigation, ads, footers
* Extract main article body
* Normalize text & metadata

---

### 5️⃣ Deduplication

* URL normalization
* Content fingerprinting
* Title similarity checks

---

### 6️⃣ Indexing

* Store metadata in PostgreSQL
* Generate embeddings
* Index into search engine
* Trigger recommendation updates

---

## 🔍 Search Flow

```
User Query
   ↓
Keyword Search (Search Engine)
   ↓
Semantic Search (Vector DB)
   ↓
Score Fusion & Ranking
   ↓
Results Returned
```

---

## 🧠 Recommendation Logic

Signals:

* Content similarity (embeddings)
* Tag overlap
* User interactions (votes, saves)
* Recency

Example scoring:

```
final_score =
  0.5 * similarity +
  0.3 * popularity +
  0.2 * freshness
```

---

## 🔐 Authentication & Security

* JWT + refresh tokens
* OAuth (Google, GitHub)
* Rate limiting
* Role-based access (admin / user)

---

## ⚖ Legal & Ethical Design

* Only metadata stored permanently
* Original content always attributed
* Redirects to original source
* Respects `robots.txt`
* No ads on embedded content

---

## 🛣 Roadmap

### Phase 1 – MVP

* Blog ingestion pipeline
* Search & unified viewer
* Authentication
* Basic recommendations

### Phase 2

* Comments & voting
* User profiles
* Advanced filters
* Weekly email digests

### Phase 3

* AI-generated summaries
* Blog comparison view
* LLM-powered Q&A
* Mobile-first UI

---

## 💼 Resume Impact

This project demonstrates:

* Distributed systems design
* Background job processing
* Crawling & ingestion pipelines
* Search engines & vector databases
* Recommendation systems
* Production-level constraints

**Resume Bullet Example**

> Built BlogLens, a production-grade engineering blog discovery platform with automated ingestion, semantic search, and recommendation systems aggregating real-world system design blogs.

---

## 🧪 Local Setup

```bash
git clone https://github.com/your-username/bloglens
cd bloglens
docker-compose up
```

---

## 🤝 Contributing

Contributions are welcome.
Please open an issue before major changes.

---

## ⭐ Final Note

**BlogLens is designed as a real system, not a toy project.**
It reflects how large-scale content aggregation, search, and recommendation platforms work in production.
