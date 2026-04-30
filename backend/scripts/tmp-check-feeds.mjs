import Parser from "rss-parser";

const parser = new Parser({ timeout: 15000 });

const feeds = [
  "https://openai.com/blog/rss.xml",
  "https://dev.to/feed",
  "https://blog.cloudflare.com/rss/",
  "https://techcrunch.com/feed/",
  "https://www.theverge.com/rss/index.xml",
  "https://overreacted.io/rss.xml",
  "https://jvns.ca/atom.xml",
  "https://davidwalsh.name/feed",
  "https://css-tricks.com/feed/",
  "https://github.blog/feed/",
  "https://aws.amazon.com/blogs/aws/feed/",
  "https://aws.amazon.com/blogs/architecture/feed/",
  "https://kubernetes.io/feed.xml",
  "https://blog.jetbrains.com/feed/",
  "https://engineering.atspotify.com/feed/",
  "https://netflixtechblog.com/feed",
  "https://developer.chrome.com/blog/feed.xml",
  "https://stackoverflow.blog/feed/",
  "https://blog.mozilla.org/feed/",
  "https://engineering.linkedin.com/blog.rss",
  "https://cloud.google.com/blog/rss/",
  "https://go.dev/blog/feed.atom",
  "https://nodejs.org/en/feed/blog.xml",
  "https://www.docker.com/blog/feed/"
];

for (const feed of feeds) {
  try {
    const data = await parser.parseURL(feed);
    const count = Array.isArray(data.items) ? data.items.length : 0;
    const title = String(data.title || "").replace(/\s+/g, " ").trim();
    console.log(`OK|${feed}|items=${count}|title=${title}`);
  } catch (error) {
    console.log(`FAIL|${feed}|${error.message}`);
  }
}
