// Build the blog: Markdown posts in /posts -> styled HTML in /writing,
// plus a blog index, an RSS feed, and a regenerated sitemap.
//
// Usage:  npm install  &&  npm run build:blog
//
// Each post is a Markdown file in /posts with YAML front matter:
//   ---
//   title: "My post title"
//   date: 2026-07-08
//   description: "One-line summary used for SEO and the listing."
//   tags: [product, marketplaces]
//   draft: false            # optional; drafts are skipped
//   ---
//   Body in Markdown...

import { readFileSync, writeFileSync, readdirSync, mkdirSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import matter from "gray-matter";
import { marked } from "marked";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const POSTS_DIR = join(ROOT, "posts");
const OUT_DIR = join(ROOT, "writing");
const SITE = "https://berkbuldanli.github.io";
const CSP = "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data:; connect-src 'self'; object-src 'none'; base-uri 'self'; form-action 'none'; upgrade-insecure-requests";
const FONTS = 'https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,500;9..144,600&family=Inter:wght@400;450;500;600&display=swap';

const esc = (s = "") => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const fmtDate = (d) => new Date(d).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
const isoDate = (d) => new Date(d).toISOString();
const readingTime = (md) => Math.max(1, Math.round(md.trim().split(/\s+/).length / 200));

const themeScript = `<script>(function(){try{var t=localStorage.getItem('theme');if(t!=='dark'&&t!=='light'){t=window.matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light';}document.documentElement.setAttribute('data-theme',t);}catch(e){}})();</script>`;

const themeToggle = `<button class="theme-toggle" type="button" aria-label="Switch to dark mode" aria-pressed="false">
  <svg class="icon-sun" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="4"></circle><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"></path></svg>
  <svg class="icon-moon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"></path></svg>
</button>`;

// ---- read + parse posts ----
if (!existsSync(POSTS_DIR)) { console.error("No /posts directory."); process.exit(0); }
mkdirSync(OUT_DIR, { recursive: true });

const posts = readdirSync(POSTS_DIR)
  .filter((f) => f.endsWith(".md"))
  .map((file) => {
    const raw = readFileSync(join(POSTS_DIR, file), "utf8");
    const { data, content } = matter(raw);
    const slug = (data.slug || file.replace(/\.md$/, "").replace(/^\d{4}-\d{2}-\d{2}-/, "")).trim();
    return {
      file, slug,
      title: data.title || slug,
      date: data.date ? new Date(data.date) : new Date(),
      description: data.description || "",
      tags: Array.isArray(data.tags) ? data.tags : [],
      draft: data.draft === true,
      html: marked.parse(content),
      readMin: readingTime(content),
    };
  })
  .filter((p) => !p.draft)
  .sort((a, b) => b.date - a.date);

// ---- render one article page ----
function renderPost(p) {
  const url = `${SITE}/writing/${p.slug}.html`;
  const ld = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: p.title,
    description: p.description,
    datePublished: isoDate(p.date),
    dateModified: isoDate(p.date),
    url,
    mainEntityOfPage: url,
    inLanguage: "en",
    image: `${SITE}/assets/og-cover.png`,
    author: { "@type": "Person", name: "Berk Buldanlı", url: `${SITE}/` },
    publisher: { "@type": "Person", name: "Berk Buldanlı", url: `${SITE}/` },
    keywords: p.tags.join(", "),
  };
  const tagsMeta = p.tags.length ? `<meta name="keywords" content="${esc(p.tags.join(", "))}">` : "";
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<meta http-equiv="Content-Security-Policy" content="${CSP}">
<meta name="referrer" content="strict-origin-when-cross-origin">
<title>${esc(p.title)} — Berk Buldanlı</title>
<meta name="description" content="${esc(p.description)}">
<meta name="author" content="Berk Buldanlı">
<meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1">
${tagsMeta}
<link rel="canonical" href="${url}">
<meta property="og:type" content="article">
<meta property="og:title" content="${esc(p.title)}">
<meta property="og:description" content="${esc(p.description)}">
<meta property="og:url" content="${url}">
<meta property="og:image" content="${SITE}/assets/og-cover.png">
<meta property="article:published_time" content="${isoDate(p.date)}">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:image" content="${SITE}/assets/og-cover.png">
<link rel="icon" type="image/svg+xml" href="../favicon.svg">
<link rel="alternate" type="application/rss+xml" title="Berk Buldanlı — Writing" href="../feed.xml">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="${FONTS}" rel="stylesheet">
<link rel="stylesheet" href="../styles.css">
${themeScript}
<script type="application/ld+json">
${JSON.stringify(ld, null, 2)}
</script>
</head>
<body>
<a class="skip-link" href="#main">Skip to content</a>
<header class="site-header">
  <div class="site-header__inner">
    <a href="../index.html" class="brand">
      <span class="brand__name">Berk Buldanlı</span>
      <span class="brand__role">Product Manager</span>
    </a>
    <div class="header-tools">${themeToggle}</div>
  </div>
</header>
<main id="main">
  <article class="doc">
    <a href="../writing/" class="doc__back reveal">← All writing</a>
    <p class="doc__meta reveal">${fmtDate(p.date)} · ${p.readMin} min read</p>
    <h1 class="doc__title reveal">${esc(p.title)}</h1>
    ${p.description ? `<p class="doc__lede reveal">${esc(p.description)}</p>` : ""}
    <div class="reveal">
      ${p.html}
    </div>
    <p class="reveal" style="margin-top:3rem;">
      <a href="../index.html#contact" class="btn btn--primary">Get in touch</a>
      <a href="../writing/" class="btn btn--ghost">More posts</a>
    </p>
  </article>
</main>
<footer class="contact">
  <p class="contact__footnote">© 2026 Berk Buldanlı · Rotterdam, Netherlands</p>
</footer>
<script src="../script.js"></script>
</body>
</html>
`;
}

// ---- render the blog index ----
function renderIndex() {
  const items = posts.map((p) => `      <li>
        <a href="${p.slug}.html">
          <span class="writing__title">${esc(p.title)}</span>
          <span class="writing__desc">${esc(p.description)}</span>
          <span class="writing__src">${fmtDate(p.date)} · ${p.readMin} min →</span>
        </a>
      </li>`).join("\n");
  const empty = `<p class="doc__lede reveal">No posts yet — check back soon.</p>`;
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<meta http-equiv="Content-Security-Policy" content="${CSP}">
<meta name="referrer" content="strict-origin-when-cross-origin">
<title>Writing — Berk Buldanlı</title>
<meta name="description" content="Essays and notes on product management by Berk Buldanlı — marketplaces, search & recommendations, data migration, and shipping product across markets.">
<meta name="author" content="Berk Buldanlı">
<meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1">
<link rel="canonical" href="${SITE}/writing/">
<meta property="og:type" content="website">
<meta property="og:title" content="Writing — Berk Buldanlı">
<meta property="og:description" content="Essays and notes on product management by Berk Buldanlı.">
<meta property="og:url" content="${SITE}/writing/">
<meta property="og:image" content="${SITE}/assets/og-cover.png">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:image" content="${SITE}/assets/og-cover.png">
<link rel="icon" type="image/svg+xml" href="../favicon.svg">
<link rel="alternate" type="application/rss+xml" title="Berk Buldanlı — Writing" href="../feed.xml">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="${FONTS}" rel="stylesheet">
<link rel="stylesheet" href="../styles.css">
${themeScript}
</head>
<body>
<a class="skip-link" href="#main">Skip to content</a>
<header class="site-header">
  <div class="site-header__inner">
    <a href="../index.html" class="brand">
      <span class="brand__name">Berk Buldanlı</span>
      <span class="brand__role">Product Manager</span>
    </a>
    <div class="header-tools">${themeToggle}</div>
  </div>
</header>
<main id="main">
  <section class="section">
    <div class="section__head reveal">
      <p class="section__kicker">Writing</p>
      <h1 class="section__title">Notes on product craft.</h1>
      <p class="section__sub">Essays on marketplaces, search, migration, and the messy middle of shipping product.</p>
    </div>
    ${posts.length ? `<ul class="writing reveal">\n${items}\n    </ul>` : empty}
    <p class="reveal" style="margin-top:2.5rem;">
      <a href="../index.html" class="btn btn--ghost">← Back to home</a>
    </p>
  </section>
</main>
<footer class="contact">
  <p class="contact__footnote">© 2026 Berk Buldanlı · Rotterdam, Netherlands</p>
</footer>
<script src="../script.js"></script>
</body>
</html>
`;
}

// ---- RSS feed ----
function renderFeed() {
  const items = posts.map((p) => `  <item>
    <title>${esc(p.title)}</title>
    <link>${SITE}/writing/${p.slug}.html</link>
    <guid>${SITE}/writing/${p.slug}.html</guid>
    <pubDate>${new Date(p.date).toUTCString()}</pubDate>
    <description>${esc(p.description)}</description>
  </item>`).join("\n");
  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
<channel>
  <title>Berk Buldanlı — Writing</title>
  <link>${SITE}/writing/</link>
  <description>Essays and notes on product management by Berk Buldanlı.</description>
  <language>en</language>
${items}
</channel>
</rss>
`;
}

// ---- sitemap (regenerated to include posts) ----
function renderSitemap() {
  const today = new Date().toISOString().slice(0, 10);
  const urls = [
    { loc: `${SITE}/`, pri: "1.0" },
    { loc: `${SITE}/writing/`, pri: "0.8" },
    { loc: `${SITE}/case-ratings-reviews.html`, pri: "0.7" },
    ...posts.map((p) => ({ loc: `${SITE}/writing/${p.slug}.html`, pri: "0.6", lastmod: new Date(p.date).toISOString().slice(0, 10) })),
  ];
  const body = urls.map((u) => `  <url>
    <loc>${u.loc}</loc>
    <lastmod>${u.lastmod || today}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>${u.pri}</priority>
  </url>`).join("\n");
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${body}
</urlset>
`;
}

// ---- write everything ----
for (const p of posts) writeFileSync(join(OUT_DIR, `${p.slug}.html`), renderPost(p));
writeFileSync(join(OUT_DIR, "index.html"), renderIndex());
writeFileSync(join(ROOT, "feed.xml"), renderFeed());
writeFileSync(join(ROOT, "sitemap.xml"), renderSitemap());

console.log(`Built ${posts.length} post(s):`);
for (const p of posts) console.log(`  - writing/${p.slug}.html  (${fmtDate(p.date)})`);
console.log("Wrote writing/index.html, feed.xml, sitemap.xml");
