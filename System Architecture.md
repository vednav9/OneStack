                    ┌──────────────────────┐
                    │   Blog Sources       │
                    │  (RSS / Websites)    │
                    └──────────┬───────────┘
                               │
                               ▼
                    ┌──────────────────────┐
                    │   Ingestion Worker   │
                    │ (RSS crawler)        │
                    └──────────┬───────────┘
                               │
                               ▼
                    ┌──────────────────────┐
                    │  Metadata Processor  │
                    │ title / tags / url   │
                    └──────────┬───────────┘
                               │
                               ▼
                    ┌──────────────────────┐
                    │   PostgreSQL DB      │
                    │ blogs_metadata       │
                    │ users                │
                    │ interactions         │
                    └──────────┬───────────┘
                               │
                               ▼
                    ┌──────────────────────┐
                    │ PostgreSQL full-text │
                    │   search index       │
                    └──────────┬───────────┘
                               │
                               ▼
                       ┌───────────────┐
                       │ Node.js API   │
                       │ (Express)     │
                       └───────┬───────┘
                               │
             ┌─────────────────┴─────────────────┐
             │                                   │
             ▼                                   ▼
     ┌───────────────┐                   ┌─────────────────┐
     │ Redis Cache   │                   │ Worker Queue    │
     │ blog caching  │                   │ BullMQ          │
     └───────┬───────┘                   └─────────────────┘
             │
             ▼
      ┌─────────────────┐
      │ React Frontend  │
      │ Blog viewer     │
      │ Search UI       │
      └─────────────────┘


-------------------

RSS Feed
   ↓
Fetch URLs
   ↓
Queue (Redis)
   ↓
Parser Worker
   ↓
Extract Content
   ↓
Generate Tags
   ↓
Save Blog
   ↓
Indexed for 


-------------------
1. Content-based (tags)
2. User behavior (likes, saves, reads)
3. Trending boost

--------------
score =
  (likes * 3)
+ (reads * 2)
+ (recent boost)
+ (user preference weight)
------------------
UI (components/pages)
        ↓
Hooks (useBlogs, useAuth)
        ↓
Services (API calls)
        ↓
Backend