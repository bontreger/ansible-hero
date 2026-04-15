/**
 * Battle sprite URLs (served from /public/sprites via Vite).
 * Run `npm run sprites:optimize` before build to crop watermark + resize.
 */

import { ENEMY_ROSTER } from "./enemies";
import type { EnemyDefinition } from "./types";

const rawBase = import.meta.env.BASE_URL;
const base = rawBase.endsWith("/") ? rawBase : `${rawBase}/`;

function assetUrl(path: string): string {
  const p = path.startsWith("/") ? path.slice(1) : path;
  return `${base}${p}`;
}

export const SPRITE_URLS = {
  bg: assetUrl("sprites/bg/battle-server-room.png"),
  bgHydra: assetUrl("sprites/bg/battle-hydra-lair.png"),
  playerBattle: assetUrl("sprites/player/battle-idle.png"),
  portrait: assetUrl("sprites/player/portrait-it-leader.png"),
  fxSlash: assetUrl("sprites/fx/slash-dagger.png"),
  fxImpact: assetUrl("sprites/fx/impact-burst.png"),
  fxPunch: assetUrl("sprites/fx/punch-flurry.png"),
  fxFireball: assetUrl("sprites/fx/fireball-burst.png"),
  /** Production Red Tape — Trust the Vanguard */
  fxPrayer: assetUrl("sprites/fx/prayer-holy.png"),
  /** Production Red Tape — Lead Pipe(line) */
  fxWeaponLead: assetUrl("sprites/fx/weapon-lead-pipeline.png"),
  /** Production Red Tape — Oak Branch */
  fxWeaponOak: assetUrl("sprites/fx/weapon-oak-branch.png"),
  fxGateCharm: assetUrl("sprites/fx/gate-charm-glow.png"),
  fxGateSigil: assetUrl("sprites/fx/gate-sigil-rune.png"),
  fxGateCrown: assetUrl("sprites/fx/gate-crown-beam.png"),
  fxDarkHex: assetUrl("sprites/fx/dark-grimoire-hex.png"),
  fxLaserBeam: assetUrl("sprites/fx/laser-beam-horizontal.png"),
  fxSonicWave: assetUrl("sprites/fx/sonic-crescent-wave.png"),
  fxShockwaveRing: assetUrl("sprites/fx/ground-shockwave-ring.png"),
  fxIceVolley: assetUrl("sprites/fx/ice-volley-cluster.png"),
  fxWaterSpiral: assetUrl("sprites/fx/water-spiral-orb.png"),
  fxMeteorStreak: assetUrl("sprites/fx/meteor-streak.png"),
  fxHolySwordRain: assetUrl("sprites/fx/holy-sword-rain.png"),
  fxPoisonBio: assetUrl("sprites/fx/poison-bio-burst.png"),
  fxLightningFork: assetUrl("sprites/fx/lightning-fork-burst.png"),
  fxSummonCircle: assetUrl("sprites/fx/summon-circle-floor.png"),
} as const;

export type ChromaKeyedCanvas = HTMLCanvasElement;

export interface EnemySpritePair {
  idle: ChromaKeyedCanvas;
  hurt: ChromaKeyedCanvas;
}

export interface BattleAssets {
  bg: ChromaKeyedCanvas;
  /** Boss arena; falls back to server room if missing. */
  bgHydra: ChromaKeyedCanvas;
  enemies: Record<string, EnemySpritePair>;
  player: ChromaKeyedCanvas;
  fxSlash: ChromaKeyedCanvas;
  fxImpact: ChromaKeyedCanvas;
  fxPunch: ChromaKeyedCanvas;
  fxFireball: ChromaKeyedCanvas;
  fxPrayer: ChromaKeyedCanvas;
  fxWeaponLead: ChromaKeyedCanvas;
  fxWeaponOak: ChromaKeyedCanvas;
  fxGateCharm: ChromaKeyedCanvas;
  fxGateSigil: ChromaKeyedCanvas;
  fxGateCrown: ChromaKeyedCanvas;
  fxDarkHex: ChromaKeyedCanvas;
  fxLaserBeam: ChromaKeyedCanvas;
  fxSonicWave: ChromaKeyedCanvas;
  fxShockwaveRing: ChromaKeyedCanvas;
  fxIceVolley: ChromaKeyedCanvas;
  fxWaterSpiral: ChromaKeyedCanvas;
  fxMeteorStreak: ChromaKeyedCanvas;
  fxHolySwordRain: ChromaKeyedCanvas;
  fxPoisonBio: ChromaKeyedCanvas;
  fxLightningFork: ChromaKeyedCanvas;
  fxSummonCircle: ChromaKeyedCanvas;
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`Failed to load image: ${src}`));
    img.src = src;
  });
}

async function loadImageOrFallback(
  primaryUrl: string,
  fallbackUrl: string,
  label: string,
): Promise<HTMLImageElement> {
  try {
    return await loadImage(primaryUrl);
  } catch {
    console.warn(
      `[ansible-hero] Missing FX "${label}" (${primaryUrl}); using placeholder art.`,
    );
    return loadImage(fallbackUrl);
  }
}

export interface ChromaKeyOptions {
  loose?: boolean;
}

function isChromaPixel(
  r: number,
  g: number,
  b: number,
  loose: boolean,
): boolean {
  if (loose) {
    return r > 165 && b > 165 && g < 115 && r + b > g * 2.4;
  }
  return r > 200 && b > 200 && g < 80;
}

function defringeMagentaHalos(imgData: ImageData, width: number, height: number): void {
  const d = imgData.data;
  const idx = (x: number, y: number) => (y * width + x) * 4;
  const snap = new Uint8ClampedArray(d);

  function magentaTint(r: number, g: number, b: number): boolean {
    return r > 115 && b > 115 && g < 125 && r + b > g * 2.1;
  }

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const i = idx(x, y);
      if (snap[i + 3]! < 24) continue;
      if (!magentaTint(snap[i]!, snap[i + 1]!, snap[i + 2]!)) continue;
      let nearClear = false;
      for (const [dx, dy] of [
        [-1, 0],
        [1, 0],
        [0, -1],
        [0, 1],
      ] as const) {
        const nx = x + dx;
        const ny = y + dy;
        if (nx < 0 || ny < 0 || nx >= width || ny >= height) {
          nearClear = true;
          break;
        }
        const j = idx(nx, ny);
        if (snap[j + 3]! < 36) {
          nearClear = true;
          break;
        }
      }
      if (nearClear) d[i + 3] = 0;
    }
  }
}

export function applyChromaKey(
  source: CanvasImageSource,
  options?: ChromaKeyOptions,
): ChromaKeyedCanvas {
  const loose = options?.loose === true;
  const w =
    source instanceof HTMLImageElement
      ? source.naturalWidth
      : (source as HTMLCanvasElement).width;
  const h =
    source instanceof HTMLImageElement
      ? source.naturalHeight
      : (source as HTMLCanvasElement).height;
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) throw new Error("2D context unavailable");
  ctx.drawImage(source, 0, 0);
  const imgData = ctx.getImageData(0, 0, w, h);
  const d = imgData.data;
  for (let i = 0; i < d.length; i += 4) {
    if (isChromaPixel(d[i]!, d[i + 1]!, d[i + 2]!, loose)) {
      d[i + 3] = 0;
    }
  }
  ctx.putImageData(imgData, 0, 0);
  return canvas;
}

/** Strict chroma + edge defringe for sprites (not backgrounds). */
export function applyChromaKeySprite(source: CanvasImageSource): ChromaKeyedCanvas {
  const canvas = applyChromaKey(source);
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) throw new Error("2D context unavailable");
  const w = canvas.width;
  const h = canvas.height;
  const imgData = ctx.getImageData(0, 0, w, h);
  defringeMagentaHalos(imgData, w, h);
  ctx.putImageData(imgData, 0, 0);
  return canvas;
}

let cached: BattleAssets | null = null;
let loadPromise: Promise<BattleAssets> | null = null;

export function getBattleAssets(): BattleAssets | null {
  return cached;
}

const HYDRA_BG_REL = "sprites/bg/battle-hydra-lair.png";

/** Active backdrop for an enemy (hydra lair vs default server room). */
export function getBackgroundForEnemy(
  assets: BattleAssets,
  enemy: EnemyDefinition,
): ChromaKeyedCanvas {
  if (enemy.bgSprite === HYDRA_BG_REL) {
    return assets.bgHydra;
  }
  return assets.bg;
}

export function initUiPortrait(img: HTMLImageElement): void {
  void (async () => {
    try {
      const source = await loadImage(SPRITE_URLS.portrait);
      const canvas = applyChromaKeySprite(source);
      const blob = await new Promise<Blob | null>((resolve) => {
        canvas.toBlob((b) => resolve(b), "image/png");
      });
      if (blob) {
        img.src = URL.createObjectURL(blob);
      } else {
        img.src = SPRITE_URLS.portrait;
      }
    } catch {
      img.src = SPRITE_URLS.portrait;
    }
  })();
}

async function loadEnemySprites(): Promise<Record<string, EnemySpritePair>> {
  const enemies: Record<string, EnemySpritePair> = {};

  for (const enemy of ENEMY_ROSTER) {
    const idlePath = assetUrl(`sprites/enemies/${enemy.spriteBase}.png`);
    const hurtPath = assetUrl(`sprites/enemies/${enemy.spriteBase}-hurt.png`);
    try {
      const [idleImg, hurtImg] = await Promise.all([
        loadImage(idlePath),
        loadImage(hurtPath),
      ]);
      enemies[enemy.id] = {
        idle: applyChromaKeySprite(idleImg),
        hurt: applyChromaKeySprite(hurtImg),
      };
    } catch {
      if (enemy.id === "laptop-lockdown") {
        throw new Error(`Required sprites missing for ${enemy.spriteBase}`);
      }
      const fallback = enemies["laptop-lockdown"];
      if (!fallback) {
        throw new Error("laptop-lockdown sprites must load before fallback");
      }
      enemies[enemy.id] = fallback;
      console.warn(
        `[ansible-hero] Missing sprites for ${enemy.spriteBase}; using laptop art until files exist.`,
      );
    }
  }

  return enemies;
}

export function loadBattleAssets(): Promise<BattleAssets> {
  if (cached) return Promise.resolve(cached);
  if (loadPromise) return loadPromise;

  loadPromise = (async () => {
    const [
      bgImg,
      bgHydraImg,
      playerImg,
      fxSlashImg,
      fxImpactImg,
      fxPunchImg,
      fxFireballImg,
      fxPrayerImg,
      fxWeaponLeadImg,
      fxWeaponOakImg,
      fxGateCharmImg,
      fxGateSigilImg,
      fxGateCrownImg,
      fxDarkHexImg,
      fxLaserBeamImg,
      fxSonicWaveImg,
      fxShockwaveRingImg,
      fxIceVolleyImg,
      fxWaterSpiralImg,
      fxMeteorStreakImg,
      fxHolySwordRainImg,
      fxPoisonBioImg,
      fxLightningForkImg,
      fxSummonCircleImg,
      enemyMap,
    ] = await Promise.all([
      loadImage(SPRITE_URLS.bg),
      loadImageOrFallback(
        SPRITE_URLS.bgHydra,
        SPRITE_URLS.bg,
        "battle-hydra-lair.png",
      ),
      loadImage(SPRITE_URLS.playerBattle),
      loadImage(SPRITE_URLS.fxSlash),
      loadImage(SPRITE_URLS.fxImpact),
      loadImage(SPRITE_URLS.fxPunch),
      loadImage(SPRITE_URLS.fxFireball),
      loadImageOrFallback(
        SPRITE_URLS.fxPrayer,
        SPRITE_URLS.fxFireball,
        "prayer-holy.png",
      ),
      loadImageOrFallback(
        SPRITE_URLS.fxWeaponLead,
        SPRITE_URLS.fxSlash,
        "weapon-lead-pipeline.png",
      ),
      loadImageOrFallback(
        SPRITE_URLS.fxWeaponOak,
        SPRITE_URLS.fxSlash,
        "weapon-oak-branch.png",
      ),
      loadImageOrFallback(
        SPRITE_URLS.fxGateCharm,
        SPRITE_URLS.fxPrayer,
        "gate-charm-glow.png",
      ),
      loadImageOrFallback(
        SPRITE_URLS.fxGateSigil,
        SPRITE_URLS.fxImpact,
        "gate-sigil-rune.png",
      ),
      loadImageOrFallback(
        SPRITE_URLS.fxGateCrown,
        SPRITE_URLS.fxFireball,
        "gate-crown-beam.png",
      ),
      loadImageOrFallback(
        SPRITE_URLS.fxDarkHex,
        SPRITE_URLS.fxSlash,
        "dark-grimoire-hex.png",
      ),
      loadImageOrFallback(
        SPRITE_URLS.fxLaserBeam,
        SPRITE_URLS.fxGateCrown,
        "laser-beam-horizontal.png",
      ),
      loadImageOrFallback(
        SPRITE_URLS.fxSonicWave,
        SPRITE_URLS.fxSlash,
        "sonic-crescent-wave.png",
      ),
      loadImageOrFallback(
        SPRITE_URLS.fxShockwaveRing,
        SPRITE_URLS.fxPrayer,
        "ground-shockwave-ring.png",
      ),
      loadImageOrFallback(
        SPRITE_URLS.fxIceVolley,
        SPRITE_URLS.fxFireball,
        "ice-volley-cluster.png",
      ),
      loadImageOrFallback(
        SPRITE_URLS.fxWaterSpiral,
        SPRITE_URLS.fxGateCharm,
        "water-spiral-orb.png",
      ),
      loadImageOrFallback(
        SPRITE_URLS.fxMeteorStreak,
        SPRITE_URLS.fxFireball,
        "meteor-streak.png",
      ),
      loadImageOrFallback(
        SPRITE_URLS.fxHolySwordRain,
        SPRITE_URLS.fxGateCrown,
        "holy-sword-rain.png",
      ),
      loadImageOrFallback(
        SPRITE_URLS.fxPoisonBio,
        SPRITE_URLS.fxDarkHex,
        "poison-bio-burst.png",
      ),
      loadImageOrFallback(
        SPRITE_URLS.fxLightningFork,
        SPRITE_URLS.fxGateSigil,
        "lightning-fork-burst.png",
      ),
      loadImageOrFallback(
        SPRITE_URLS.fxSummonCircle,
        SPRITE_URLS.fxGateSigil,
        "summon-circle-floor.png",
      ),
      loadEnemySprites(),
    ]);

    cached = {
      bg: applyChromaKey(bgImg, { loose: true }),
      bgHydra: applyChromaKey(bgHydraImg, { loose: true }),
      enemies: enemyMap,
      player: applyChromaKeySprite(playerImg),
      fxSlash: applyChromaKeySprite(fxSlashImg),
      fxImpact: applyChromaKeySprite(fxImpactImg),
      fxPunch: applyChromaKeySprite(fxPunchImg),
      fxFireball: applyChromaKeySprite(fxFireballImg),
      fxPrayer: applyChromaKeySprite(fxPrayerImg),
      fxWeaponLead: applyChromaKeySprite(fxWeaponLeadImg),
      fxWeaponOak: applyChromaKeySprite(fxWeaponOakImg),
      fxGateCharm: applyChromaKeySprite(fxGateCharmImg),
      fxGateSigil: applyChromaKeySprite(fxGateSigilImg),
      fxGateCrown: applyChromaKeySprite(fxGateCrownImg),
      fxDarkHex: applyChromaKeySprite(fxDarkHexImg),
      fxLaserBeam: applyChromaKeySprite(fxLaserBeamImg),
      fxSonicWave: applyChromaKeySprite(fxSonicWaveImg),
      fxShockwaveRing: applyChromaKeySprite(fxShockwaveRingImg),
      fxIceVolley: applyChromaKeySprite(fxIceVolleyImg),
      fxWaterSpiral: applyChromaKeySprite(fxWaterSpiralImg),
      fxMeteorStreak: applyChromaKeySprite(fxMeteorStreakImg),
      fxHolySwordRain: applyChromaKeySprite(fxHolySwordRainImg),
      fxPoisonBio: applyChromaKeySprite(fxPoisonBioImg),
      fxLightningFork: applyChromaKeySprite(fxLightningForkImg),
      fxSummonCircle: applyChromaKeySprite(fxSummonCircleImg),
    };
    return cached;
  })();

  return loadPromise;
}
