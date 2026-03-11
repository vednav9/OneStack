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