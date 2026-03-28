import { Link } from "react-router-dom";
import { Compass, Github, Twitter, Rss } from "lucide-react";

export default function Footer() {
  const links = {
    Product: [
      { label: "Explore", href: "/explore" },
      { label: "Trending", href: "/trending" },
      { label: "Topics", href: "/explore" },
    ],
    Company: [
      { label: "About", href: "#" },
      { label: "Blog", href: "#" },
      { label: "Careers", href: "#" },
    ],
    Legal: [
      { label: "Privacy", href: "#" },
      { label: "Terms", href: "#" },
      { label: "Contact", href: "#" },
    ],
  };

  return (
    <footer className="border-t bg-card mt-16">
      <div className="max-w-screen-xl mx-auto px-6 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                <Compass className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="font-bold text-lg text-gradient-red">BlogSphere</span>
            </Link>
            <p className="text-sm text-muted-foreground leading-relaxed mb-4">
              Unified discovery platform for real-world engineering blogs from top tech companies.
            </p>
            <div className="flex gap-3">
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-md border hover:border-primary hover:text-primary text-muted-foreground transition-colors"
                aria-label="GitHub"
              >
                <Github className="h-4 w-4" />
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-md border hover:border-primary hover:text-primary text-muted-foreground transition-colors"
                aria-label="Twitter"
              >
                <Twitter className="h-4 w-4" />
              </a>
              <a
                href="/rss"
                className="p-2 rounded-md border hover:border-primary hover:text-primary text-muted-foreground transition-colors"
                aria-label="RSS Feed"
              >
                <Rss className="h-4 w-4" />
              </a>
            </div>
          </div>

          {/* Links */}
          {Object.entries(links).map(([category, items]) => (
            <div key={category}>
              <h3 className="font-semibold text-sm mb-4">{category}</h3>
              <ul className="space-y-2">
                {items.map((item) => (
                  <li key={item.label}>
                    <Link
                      to={item.href}
                      className="text-sm text-muted-foreground hover:text-foreground transition-colors hover-underline"
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="border-t pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} BlogSphere. All rights reserved.
          </p>
          <p className="text-xs text-muted-foreground">
            Built for developers who care about how real systems are built.
          </p>
        </div>
      </div>
    </footer>
  );
}
