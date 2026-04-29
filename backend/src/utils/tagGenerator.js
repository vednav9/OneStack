/**
 * Generates relevant tags from blog text using keyword matching.
 * Each keyword entry: [tagLabel, ...searchTerms]
 */
const TAG_RULES = [
    // AI / ML
    ["AI", "artificial intelligence", "machine learning", "deep learning", "neural network", " ai ", "openai", "gpt", "llm", "chatgpt", "claude", "gemini", "mistral", "copilot", "generative ai", "diffusion"],
    ["Machine Learning", "machine learning", "ml model", "supervised", "unsupervised", "reinforcement learning", "training model", "scikit", "pytorch", "tensorflow", "hugging face", "transformers"],
    ["LLM", "large language model", "llm", "gpt-4", "gpt-3", "palm", "llama", "gemma", "mistral", "falcon", "rag", "retrieval augmented"],

    // System Design / Architecture
    [
        "System Design",
        "system design",
        "distributed systems",
        "scalability",
        "load balancer",
        "load balancing",
        "rate limiting",
        "queue",
        "message queue",
        "cache",
        "caching",
        "sharding",
        "replication",
        "high availability",
        "consistency",
        "cap theorem",
        "throughput",
        "latency",
        "microservices",
        "monolith",
        "design pattern",
        "clean architecture",
        "domain-driven",
        "ddd",
    ],

    // Web Dev
    ["JavaScript", "javascript", "js ", "node.js", "nodejs", "typescript", "ts ", "deno", "bun "],
    ["TypeScript", "typescript", " tsx", " ts "],
    ["React", "react", "reactjs", "react.js", "next.js", "nextjs", "remix", "vite", "jsx"],
    ["Vue", "vue.js", "vuejs", "nuxt"],
    ["Angular", "angular", "angularjs"],
    ["CSS", "css", "tailwind", "sass", "scss", "styled components", "design system", "css-in-js"],
    ["Frontend", "frontend", "front-end", "ui development", "web design", "component", "browser api"],
    ["Backend", "backend", "back-end", "server-side", "api development", "rest api", "graphql", "grpc"],
    ["Full Stack", "full stack", "fullstack", "full-stack"],
    ["Web", "web development", "web app", "progressive web", "web performance", "html", "webassembly", "wasm"],

    // Cloud / Infra
    [
        "Infrastructure",
        "infrastructure",
        "cloud computing",
        "aws",
        "amazon web services",
        "azure",
        "google cloud",
        "gcp",
        "cloud native",
        "kubernetes",
        " k8s",
        "helm",
        "kubectl",
        "container",
        "docker",
        "dockerfile",
        "containerization",
        "serverless",
        "lambda",
        "cloud functions",
        "edge functions",
        "vercel",
        "netlify",
        "sre",
        "site reliability",
    ],
    ["DevOps", "devops", "ci/cd", "continuous integration", "continuous deployment", "github actions", "jenkins", "pipeline", "infrastructure as code"],

    // Data
    ["Databases", "database", "databases", "postgresql", "mysql", "sqlite", "mongodb", "redis", "nosql", "sql", "orm", "prisma", "drizzle"],
    ["Data Engineering", "data pipeline", "data warehouse", "etl", "spark", "kafka", "airflow", "dbt", "snowflake", "bigquery"],
    ["Analytics", "analytics", "data analysis", "data science", "visualization", "pandas", "numpy", "matplotlib"],

    // Security
    ["Security", "security", "cybersecurity", "vulnerability", "exploit", "pen test", "authentication", "authorization", "oauth", "jwt", "encryption", "zero day", "ransomware"],

    // Mobile
    ["Mobile", "mobile app", "ios", "android", "react native", "flutter", "swift", "kotlin", "mobile development"],
    ["iOS", "ios", "swift", "xcode", "apple developer", "swiftui", "uikit"],
    ["Android", "android", "kotlin", "jetpack compose", "android studio"],

    // Languages
    ["Python", "python", " py ", "django", "flask", "fastapi", "pandas", "pytorch", "tensorflow"],
    ["Go", "golang", " go ", " go,", "goroutines", "gopher"],
    ["Rust", "rust", "cargo", "rustacean", "tokio", "actix"],
    ["Java", "java", "spring boot", "jvm", "maven", "gradle"],
    ["C++", "c++", "cpp", "llvm", "unreal engine"],

    // Product / Startup
    ["Startup", "startup", "saas", "product market fit", "mvp", "venture capital", "seed round", "series a", "founder", "entrepreneur"],
    ["Product", "product management", "product manager", "roadmap", "user research", "product design"],
    ["Design", "ux", "ui/ux", "user experience", "figma", "sketch", "design thinking", "prototyping", "wireframe"],

    // Open Source
    ["Open Source", "open source", "github", "git ", "pull request", "open-source", "oss", "foss", "contribution"],

    // Performance
    ["Performance", "performance", "optimization", "latency", "throughput", "benchmark", "profiling", "scalability", "caching"],

    // Blockchain/Web3
    ["Web3", "web3", "blockchain", "ethereum", "smart contract", "nft", "defi", "solidity", "crypto", "decentralized"],

    // Gaming
    ["Gaming", "game development", "unity", "unreal", "game engine", "gamedev", "indie game"],

    // Business / Industry news
    ["Industry", "acquisition", "ipo", "layoffs", "big tech", "regulation", "antitrust", "merger"],
];

/**
 * Generate tags from a block of text.
 * Returns an array of matching tag strings (de-duplicated).
 * @param {string} text
 * @returns {string[]}
 */
export function generateTags(text) {
    if (!text) return [];
    const lower = text.toLowerCase();
    const found = new Set();

    for (const [tag, ...terms] of TAG_RULES) {
        for (const term of terms) {
            if (lower.includes(term)) {
                found.add(tag);
                break; // matched, move to next rule
            }
        }
        if (found.size >= 6) break; // cap at 6 tags per article
    }

    return [...found];
}
