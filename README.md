# Berk Buldanlı — Portfolio

A single-page portfolio site. Plain HTML/CSS/JS — no build step, no dependencies.

## Files
- `index.html` — content and structure
- `styles.css` — all styling
- `script.js` — scroll-reveal animation for the case study cards

## Before you publish — things to confirm/fill in

Search the site for `[bracketed]` placeholders (they're styled in italic brass with a dashed underline so they're easy to spot in the browser too):

- Hero title block: current city, current role
- Artifact 01 (data migration): exact scope of your role, a concrete outcome metric
- Artifact 02: an entire second case study — context, role, approach, outcome
- About section: a line or two about your current focus
- Contact section: your email address

## Deploying to GitHub Pages (free)

These files live in the `berkbuldanli/website` repo. Once merged to `main`, turn on Pages:

1. In the repo, go to **Settings → Pages**.
2. Under "Build and deployment", set **Source** to "Deploy from a branch", branch `main`, folder `/ (root)`. Save.
3. GitHub gives you a URL within a minute or two — it will be **`https://berkbuldanli.github.io/website`**. That's your live portfolio.

### Want the shorter `berkbuldanli.github.io` URL?

GitHub only serves a site at the bare `https://berkbuldanli.github.io` from a repo named **exactly** `berkbuldanli.github.io`. To use that:

1. Create a new repo named `berkbuldanli.github.io`.
2. Copy `index.html`, `styles.css`, and `script.js` into it (drag-and-drop via "Add file → Upload files", or `git push`).
3. Enable Pages the same way (Settings → Pages → Deploy from a branch → `main` → `/ (root)`).

### Custom domain (optional)

Add it under Settings → Pages → Custom domain, then point your domain's DNS at GitHub (GitHub's docs walk through the exact DNS records).
