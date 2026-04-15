# Ansible Hero — developer notes

Web-based proof-of-concept JRPG battle screen built with **Vite** and **TypeScript**; ships as static files. Player-facing copy lives in the root [`README.md`](README.md).

**Maintainer-only:** GitHub Pages deployment and CI details are kept in a local **`OWNER-README.md`** at the repo root (gitignored). Copy that template from a teammate or create your own if you publish the site.

---

## Local development

```bash
npm install
npm run dev
```

Open the URL Vite prints (usually `http://localhost:5173`).

## Production build

```bash
npm run build
```

Output is written to `dist/`. You can serve that directory with any static file server.

---

## Sprite size workflow

Battle art lives in [`public/sprites/`](public/sprites/). AI exports are often very large (e.g. 2.8K wide) and may include a corner watermark; **`npm run build` runs `npm run sprites:optimize` first**, which **crops** masters still larger than ~900px on either axis (symmetric inset for backgrounds; slightly asymmetric for enemies/player/FX to trim watermark), then **downscales** with **nearest-neighbor** resampling on those chroma sprites so magenta does not bleed into edges. Re-running optimize on already-shipped small sprites does not stack crops. Keep the main subject inside the safe central area for first-time imports.

**Local masters:** put huge source PNGs in `public/sprites/originals/` (that folder is **gitignored**). Copy them into the live sprite paths with **`npm run sprites:restore`**, then run **`npm run sprites:optimize`**. The optimize script **never reads or writes** under `originals/`.

Gemini / image prompts: see [`public/sprites/prompts.txt`](public/sprites/prompts.txt).

**Production Red Tape FX** (optional files under `sprites/fx/`; the app falls back to existing art if missing): `prayer-holy.png`, `weapon-lead-pipeline.png`, `weapon-oak-branch.png`. Add matching names to `public/sprites/originals/` if you use `npm run sprites:restore`.

| Folder | Max width (fit inside) |
|--------|-------------------------|
| `sprites/bg/` | 1280 px |
| `sprites/enemies/` | 720 px |
| `sprites/player/` (except portrait) | 480 px |
| `sprites/player/` portrait | 128 px |
| `sprites/fx/` | 448 px |

To resize only (without a full build): `npm run sprites:optimize`.

To refresh active sprites from your local `originals/` copies: `npm run sprites:restore` then `npm run sprites:optimize`.

**Masters vs shipped:** keep huge source PNGs in `originals/` locally, or outside the repo; ship optimized files under `bg/`, `enemies/`, etc.

### Graphics verification checklist (when art “doesn’t update”)

1. Changed files must live under **`public/sprites/...`** — Vite serves `public/` at the site root; the app loads URLs from [`src/game/assets.ts`](src/game/assets.ts).
2. Run **`npm run sprites:restore`** (if you use local masters), then **`npm run sprites:optimize`**, then **`npm run dev`** or **`npm run build`**.
3. **Hard-refresh** the browser or disable cache while testing.
4. Confirm **filenames** match `spriteBase` / FX keys in enemy definitions and `SPRITE_URLS` in `assets.ts`.
5. Run **`npm run build`** as a sanity check (same steps CI would use).

**Rendering behavior:** The app keys **magenta-like** backgrounds to transparent at load time for chroma assets (not required for opaque backgrounds), with a light **defringe** pass on sprites to drop residual pink halos.

**Missing assets:** If an enemy image is missing, the loader falls back to the **laptop** enemy sprites. Optional FX files fall back to placeholder art (see `loadImageOrFallback` in `assets.ts`). Extra gatekeeper / wyrm FX names are listed in [`public/sprites/prompts.txt`](public/sprites/prompts.txt) (`gate-charm-glow.png`, `gate-sigil-rune.png`, `gate-crown-beam.png`, `dark-grimoire-hex.png`). The hydra arena uses `sprites/bg/battle-hydra-lair.png` when present; otherwise the server-room backdrop.

---

## Container image

Build and run (Docker or Podman):

```bash
docker build -t ansible-hero:latest .
docker run --rm -p 8080:8080 ansible-hero:latest
```

Then open `http://localhost:8080`. The app listens on **port 8080** using the official **non-root** [`nginxinc/nginx-unprivileged`](https://hub.docker.com/r/nginxinc/nginx-unprivileged) image, which is a common choice for OpenShift.

### OpenShift / Kubernetes (sketch)

- Deploy the image; expose a **Service** on port **8080**.
- No secrets or persistent storage are required for this static POC.
- For a conference kiosk, consider fullscreen browser chrome and a dedicated profile.

---

## Gameplay rules (implementation summary)

- Standard roster: clearing a foe requires an **Effective** or **Super effective** approach; **Not effective** and **Slightly effective** send you to a recap with **Try again?** / **Skip** (see [`src/game/state.ts`](src/game/state.ts)).
- Attack buttons are **shuffled** each time the `choose_attack` menu is entered (`attackOrderIds` on `GameState.battle`).
- Boss (hydra): phases advance on **Effective** or **Super effective**; relic rules per boss config in [`src/game/enemies/ai-hydra-boss.ts`](src/game/enemies/ai-hydra-boss.ts).
