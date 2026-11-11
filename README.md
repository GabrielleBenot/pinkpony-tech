# Pink Pony Tech (`pinkpony.tech`)

Official corporate & venture studio web presence for **Pink Pony Tech LLC** — inspired by the architectural liquid-glass layout of `stoxos.io`, crafted in a **Soft Pearl & Blush Couture** aesthetic with **Rose-Pink & Prismatic Rainbow** refraction.

## Project Structure

```text
Pink Pony Tech/
├── index.html                  # Single-viewport couture stage, hero glass card, 01–04 governance cards & JSON-LD
├── style.css                   # Soft Pearl & Blush frosted liquid-glass design system & responsive layout
├── script.js                   # Three.js r170 3D relief Glassmorphed Show Arabian, GLSL prism caustics & spectrum dock
├── arabian_glassmorph.webp     # Couture frosted blush-pearl glassmorphism Show Arabian sculpture (RGBA)
├── arabian_glass_relief.webp   # 3D surface normal & depth relief map for real-time WebGL refraction & specular glints
├── favicon.svg                 # Couture Show Arabian crest vector icon
└── README.md                   # Documentation & GoDaddy DNS guide
```

## Connecting `pinkpony.tech` on GoDaddy to GitHub Pages

In **GoDaddy -> Domains -> `pinkpony.tech` -> DNS -> DNS Records**:

1. Delete any default GoDaddy Parked `A` record (`@ -> Parked` or `WebsiteBuilder`).
2. Add these **4 `A` records** for the root domain (`@`) and **1 `CNAME` record** for `www`:

| Type | Name | Value | TTL |
| :--- | :--- | :--- | :--- |
| `A` | `@` | `185.199.108.153` | 600s (or Default) |
| `A` | `@` | `185.199.109.153` | 600s (or Default) |
| `A` | `@` | `185.199.110.153` | 600s (or Default) |
| `A` | `@` | `185.199.111.153` | 600s (or Default) |
| `CNAME` | `www` | `gabriellebenot.github.io` | 1 Hour (or Default) |

3. Once DNS propagates (typically 5–20 minutes), open **GitHub Repo -> Settings -> Pages** and check **Enforce HTTPS**.

## Local Preview

```bash
python3 -m http.server 8080
```

Then visit `http://localhost:8080`.
