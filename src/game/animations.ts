import type { BattleAssets, ChromaKeyedCanvas } from "./assets";
import type { AttackDefinition, BattleFxKind } from "./types";

export type AnimationKind = AttackDefinition["id"];

interface SceneLayout {
  w: number;
  h: number;
  player: { x: number; y: number; w: number; h: number };
  enemy: { x: number; y: number; w: number; h: number };
  groundY: number;
}

export interface DrawStaticOptions {
  playerBox?: SceneLayout["player"];
  enemyShakeX?: number;
  enemyShakeY?: number;
  enemyUseHurt?: boolean;
  fxExtra?: (ctx: CanvasRenderingContext2D) => void;
}

function layoutScene(w: number, h: number): SceneLayout {
  const groundY = h * 0.72;
  return {
    w,
    h,
    groundY,
    player: { x: w * 0.04, y: groundY - h * 0.40, w: w * 0.40, h: h * 0.38 },
    enemy: { x: w * 0.50, y: groundY - h * 0.42, w: w * 0.44, h: h * 0.4 },
  };
}

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

function easeOutQuad(t: number): number {
  return 1 - (1 - t) * (1 - t);
}

function easeInQuad(t: number): number {
  return t * t;
}

function spriteSize(src: CanvasImageSource): { iw: number; ih: number } {
  if (src instanceof HTMLImageElement) {
    return { iw: src.naturalWidth, ih: src.naturalHeight };
  }
  if (src instanceof HTMLCanvasElement) {
    return { iw: src.width, ih: src.height };
  }
  if (typeof ImageBitmap !== "undefined" && src instanceof ImageBitmap) {
    return { iw: src.width, ih: src.height };
  }
  if (typeof OffscreenCanvas !== "undefined" && src instanceof OffscreenCanvas) {
    return { iw: src.width, ih: src.height };
  }
  return { iw: 1, ih: 1 };
}

export class BattleStage {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private layout: SceneLayout = layoutScene(300, 200);
  private assets: BattleAssets | null = null;
  /** Backdrop drawn behind the stage; defaults from assets on setAssets. */
  private battleBackground: ChromaKeyedCanvas | null = null;
  private enemyIdle: HTMLCanvasElement | null = null;
  private enemyHurt: HTMLCanvasElement | null = null;
  /** After a landed strike, keep hurt sprite until the next attack or a new enemy. */
  private enemyHurtAfterStrike = false;
  private appliedEnemySpriteId: string | null = null;

  constructor(canvas: HTMLCanvasElement) {
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("2D context unavailable");
    this.canvas = canvas;
    this.ctx = ctx;
    this.resize();
    window.addEventListener("resize", () => this.resize());
  }

  setAssets(assets: BattleAssets | null): void {
    this.assets = assets;
    this.battleBackground = assets?.bg ?? null;
    if (assets) {
      const p = assets.enemies["laptop-lockdown"];
      this.enemyIdle = p.idle;
      this.enemyHurt = p.hurt;
    } else {
      this.enemyIdle = null;
      this.enemyHurt = null;
    }
    this.appliedEnemySpriteId = null;
    this.enemyHurtAfterStrike = false;
    this.drawStatic(0);
  }

  /** Swap battle backdrop (e.g. hydra lair vs server room). */
  setBattleBackground(canvas: ChromaKeyedCanvas): void {
    this.battleBackground = canvas;
    this.drawStatic(0);
  }

  /** Swap battle sprites for the current roster enemy. */
  applyEnemySprites(enemyId: string): void {
    if (!this.assets) return;
    if (this.appliedEnemySpriteId !== enemyId) {
      this.enemyHurtAfterStrike = false;
      this.appliedEnemySpriteId = enemyId;
    }
    const pair =
      this.assets.enemies[enemyId] ?? this.assets.enemies["laptop-lockdown"];
    this.enemyIdle = pair.idle;
    this.enemyHurt = pair.hurt;
    this.drawStatic(0);
  }

  resize(): void {
    const parent = this.canvas.parentElement;
    if (!parent) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const w = parent.clientWidth;
    const h = parent.clientHeight;
    this.canvas.width = Math.max(1, Math.floor(w * dpr));
    this.canvas.height = Math.max(1, Math.floor(h * dpr));
    this.canvas.style.width = `${w}px`;
    this.canvas.style.height = `${h}px`;
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    this.layout = layoutScene(w, h);
    this.drawStatic(0);
  }

  private drawBackgroundCover(
    ctx: CanvasRenderingContext2D,
    dw: number,
    dh: number,
    img: CanvasImageSource,
  ): void {
    const { iw, ih } = spriteSize(img);
    if (iw <= 0 || ih <= 0) return;
    const scale = Math.max(dw / iw, dh / ih);
    const sw = iw;
    const sh = ih;
    const tw = sw * scale;
    const th = sh * scale;
    const dx = (dw - tw) / 2;
    const dy = (dh - th) / 2;
    ctx.drawImage(img, 0, 0, sw, sh, dx, dy, tw, th);
  }

  /** Fit sprite inside rect, centered. */
  private drawSpriteInRect(
    ctx: CanvasRenderingContext2D,
    src: CanvasImageSource,
    rect: SceneLayout["player"],
    ox: number,
    oy: number,
  ): void {
    const { iw, ih } = spriteSize(src);
    if (iw <= 0 || ih <= 0) return;
    const { x, y, w, h } = rect;
    const scale = Math.min(w / iw, h / ih);
    const dw = iw * scale;
    const dh = ih * scale;
    const dx = x + (w - dw) / 2 + ox;
    const dy = y + (h - dh) / 2 + oy;
    ctx.drawImage(src, 0, 0, iw, ih, dx, dy, dw, dh);
  }

  private drawFxCentered(
    ctx: CanvasRenderingContext2D,
    src: CanvasImageSource,
    cx: number,
    cy: number,
    targetMax: number,
    scaleMul = 1,
  ): void {
    const { iw, ih } = spriteSize(src);
    if (iw <= 0 || ih <= 0) return;
    const baseScale = targetMax / Math.max(iw, ih);
    const scale = baseScale * scaleMul;
    const dw = iw * scale;
    const dh = ih * scale;
    ctx.drawImage(src, 0, 0, iw, ih, cx - dw / 2, cy - dh / 2, dw, dh);
  }

  private drawFallbackScene(shakePx: number): void {
    const { ctx, layout } = this;
    const { w, h, groundY, player, enemy } = layout;
    const sky = ctx.createLinearGradient(0, 0, 0, h);
    sky.addColorStop(0, "#1e1e32");
    sky.addColorStop(1, "#12121c");
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, w, h);
    ctx.strokeStyle = "#3a3a52";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, groundY);
    ctx.lineTo(w, groundY);
    ctx.stroke();
    const sx = (Math.random() - 0.5) * 2 * shakePx;
    ctx.fillStyle = "#5b7fd1";
    ctx.fillRect(
      player.x + sx * 0.3,
      player.y,
      player.w * 0.35,
      player.h * 0.55,
    );
    ctx.fillStyle = "#3d3d52";
    ctx.fillRect(enemy.x + sx, enemy.y, enemy.w * 0.7, enemy.h * 0.75);
  }

  drawStatic(shakePx = 0, opts?: DrawStaticOptions): void {
    const { ctx, layout } = this;
    const { w, h, player, enemy } = layout;
    ctx.save();
    ctx.clearRect(0, 0, w, h);
    ctx.imageSmoothingEnabled = false;

    if (!this.assets) {
      this.drawFallbackScene(shakePx);
      ctx.restore();
      return;
    }

    const backdrop = this.battleBackground ?? this.assets.bg;
    this.drawBackgroundCover(ctx, w, h, backdrop);
    ctx.fillStyle = "#12121c";
    ctx.globalCompositeOperation = "destination-over";
    ctx.fillRect(0, 0, w, h);
    ctx.globalCompositeOperation = "source-over";

    const pBox = opts?.playerBox ?? player;
    const esx =
      (opts?.enemyShakeX ?? 0) + (Math.random() - 0.5) * 2 * shakePx;
    const esy =
      (opts?.enemyShakeY ?? 0) + (Math.random() - 0.5) * 2 * shakePx;
    const psx = (Math.random() - 0.5) * 2 * shakePx * 0.35;
    const psy = (Math.random() - 0.5) * 2 * shakePx * 0.35;

    const hurt = this.enemyHurt ?? this.enemyIdle;
    const idle = this.enemyIdle;
    const explicitHurt = opts?.enemyUseHurt;
    const useHurt =
      explicitHurt === false
        ? false
        : explicitHurt === true || this.enemyHurtAfterStrike;
    const enemySrc = useHurt ? hurt : idle;
    this.drawSpriteInRect(ctx, this.assets.player, pBox, psx, psy);
    if (enemySrc) {
      this.drawSpriteInRect(ctx, enemySrc, enemy, esx, esy);
    }

    opts?.fxExtra?.(ctx);
    ctx.restore();
  }

  private frameLoop(
    durationMs: number,
    drawFrame: (t: number) => void,
  ): Promise<void> {
    return new Promise((resolve) => {
      const start = performance.now();
      const tick = (now: number) => {
        const elapsed = now - start;
        const t = Math.min(1, elapsed / durationMs);
        drawFrame(t);
        if (t < 1) {
          requestAnimationFrame(tick);
        } else {
          resolve();
        }
      };
      requestAnimationFrame(tick);
    });
  }

  async playAttackAnimation(attack: AttackDefinition): Promise<void> {
    const { enemy, player, h, w } = this.layout;
    const assets = this.assets;
    this.enemyHurtAfterStrike = false;
    if (!assets) {
      await this.frameLoop(300, () => this.drawStatic(0));
      return;
    }

    const kind: BattleFxKind = attack.fxKind;

    const holdHurtAfter = (): void => {
      this.enemyHurtAfterStrike = true;
      this.drawStatic(0);
    };

    if (kind === "slash") {
      const fxMax = Math.min(w, h) * 0.22;
      await this.frameLoop(420, (t) => {
        const u = easeOutQuad(t);
        const cx = lerp(player.x + player.w * 0.85, enemy.x + enemy.w * 0.35, u);
        const cy = player.y + player.h * 0.38;
        this.drawStatic(0, {
          fxExtra: (ctx) => {
            this.drawFxCentered(ctx, assets.fxSlash, cx, cy, fxMax);
          },
        });
      });
      let shake = 6;
      await this.frameLoop(120, () =>
        this.drawStatic(shake--, { enemyUseHurt: true }),
      );
      holdHurtAfter();
      return;
    }

    if (kind === "prayer") {
      const fxMax = Math.min(w, h) * 0.24;
      await this.frameLoop(520, (t) => {
        const u = easeOutQuad(t);
        const cx = lerp(player.x + player.w * 0.72, enemy.x + enemy.w * 0.42, u);
        const cy = lerp(
          player.y + player.h * 0.28,
          enemy.y + enemy.h * 0.32,
          u * 0.85,
        );
        this.drawStatic(0, {
          fxExtra: (ctx) => {
            this.drawFxCentered(ctx, assets.fxPrayer, cx, cy, fxMax, 0.92);
          },
        });
      });
      let shake = 5;
      await this.frameLoop(140, () =>
        this.drawStatic(shake--, { enemyUseHurt: true }),
      );
      holdHurtAfter();
      return;
    }

    if (kind === "pipeSwing" || kind === "branchSwing") {
      const weapon =
        kind === "pipeSwing" ? assets.fxWeaponLead : assets.fxWeaponOak;
      const fxWeaponMax = Math.min(w, h) * 0.22;
      const fxImpactMax = Math.min(w, h) * 0.26;
      const ix = enemy.x + enemy.w * 0.42;
      const iy = enemy.y + enemy.h * 0.52;
      await this.frameLoop(460, (t) => {
        const strike = t > 0.78;
        const u = strike ? 1 : easeOutQuad(t / 0.78);
        const cx = lerp(player.x + player.w * 0.82, ix, u);
        const cy = lerp(player.y + player.h * 0.36, iy, u * 0.35);
        this.drawStatic(0, {
          enemyUseHurt: strike,
          fxExtra: (ctx) => {
            if (strike) {
              this.drawFxCentered(ctx, assets.fxImpact, ix, iy, fxImpactMax);
            } else {
              this.drawFxCentered(ctx, weapon, cx, cy, fxWeaponMax);
            }
          },
        });
      });
      let shake = 8;
      await this.frameLoop(120, () =>
        this.drawStatic(shake--, { enemyUseHurt: true }),
      );
      holdHurtAfter();
      return;
    }

    if (kind === "jump") {
      const cx = player.x;
      const startY = player.y;
      const peakY = player.y - h * 0.28;
      const landX = enemy.x - player.w * 0.15;
      const fxMax = Math.min(w, h) * 0.28;
      await this.frameLoop(700, (t) => {
        let px = cx;
        let py = startY;
        if (t < 0.45) {
          const u = easeOutQuad(t / 0.45);
          px = lerp(cx, (cx + landX) / 2, u);
          py = lerp(startY, peakY, Math.sin(u * Math.PI * 0.5));
        } else {
          const u = easeInQuad((t - 0.45) / 0.55);
          px = lerp((cx + landX) / 2, landX, u);
          py = lerp(peakY, startY, u);
        }
        const showImpact = t > 0.92;
        this.drawStatic(0, {
          playerBox: { ...player, x: px, y: py },
          enemyUseHurt: showImpact,
          fxExtra: showImpact
            ? (ctx) => {
                this.drawFxCentered(
                  ctx,
                  assets.fxImpact,
                  enemy.x + enemy.w * 0.45,
                  enemy.y + enemy.h * 0.55,
                  fxMax,
                );
              }
            : undefined,
        });
      });
      let shake = 10;
      for (let i = 0; i < 8; i++) {
        await this.frameLoop(40, () =>
          this.drawStatic(shake, { enemyUseHurt: true }),
        );
        shake = Math.max(0, shake - 2);
      }
      holdHurtAfter();
      return;
    }

    if (kind === "punch") {
      const fxMax = Math.min(w, h) * 0.2;
      for (let hit = 0; hit < 5; hit++) {
        await this.frameLoop(80, (t) => {
          const punch = t < 0.5 ? 14 : 0;
          const alt = hit % 2 === 0 ? punch : -punch;
          const hurt = t > 0.45;
          this.drawStatic(0, {
            playerBox: { ...player, x: player.x + alt },
            enemyShakeX: hurt ? -6 : 0,
            enemyUseHurt: hurt,
            fxExtra: hurt
              ? (ctx) => {
                  this.drawFxCentered(
                    ctx,
                    assets.fxPunch,
                    enemy.x + enemy.w * 0.35,
                    enemy.y + enemy.h * 0.45,
                    fxMax,
                  );
                }
              : undefined,
          });
        });
      }
      holdHurtAfter();
      return;
    }

    if (kind === "gateCharm") {
      const fxMax = Math.min(w, h) * 0.23;
      await this.frameLoop(480, (t) => {
        const u = easeOutQuad(t);
        const cx = lerp(player.x + player.w * 0.68, enemy.x + enemy.w * 0.4, u);
        const cy = lerp(player.y + player.h * 0.32, enemy.y + enemy.h * 0.36, u * 0.9);
        this.drawStatic(0, {
          fxExtra: (ctx) => {
            this.drawFxCentered(ctx, assets.fxGateCharm, cx, cy, fxMax, 0.95);
          },
        });
      });
      let shake = 5;
      await this.frameLoop(120, () =>
        this.drawStatic(shake--, { enemyUseHurt: true }),
      );
      holdHurtAfter();
      return;
    }

    if (kind === "gateSigil") {
      const fxMax = Math.min(w, h) * 0.26;
      const cx = enemy.x + enemy.w * 0.42;
      const cy = enemy.y + enemy.h * 0.46;
      await this.frameLoop(380, (t) => {
        const pulse = 0.82 + 0.22 * Math.sin(t * Math.PI * 3);
        this.drawStatic(0, {
          enemyUseHurt: t > 0.5,
          fxExtra: (ctx) => {
            this.drawFxCentered(ctx, assets.fxGateSigil, cx, cy, fxMax, pulse);
          },
        });
      });
      holdHurtAfter();
      return;
    }

    if (kind === "gateCrown") {
      const sx = player.x + player.w * 0.55;
      const sy = player.y + player.h * 0.22;
      const tx = enemy.x + enemy.w * 0.45;
      const ty = enemy.y + enemy.h * 0.35;
      const fxMax = Math.min(w, h) * 0.22;
      await this.frameLoop(540, (t) => {
        const u = easeOutQuad(t);
        const x = lerp(sx, tx, u);
        const y = lerp(sy, ty, u);
        this.drawStatic(0, {
          fxExtra: (ctx) => {
            this.drawFxCentered(ctx, assets.fxGateCrown, x, y, fxMax, 0.9);
          },
        });
      });
      await this.frameLoop(200, () =>
        this.drawStatic(4, { enemyUseHurt: true }),
      );
      holdHurtAfter();
      return;
    }

    if (kind === "darkHex") {
      const fxMax = Math.min(w, h) * 0.24;
      await this.frameLoop(440, (t) => {
        const u = easeOutQuad(t);
        const cx = lerp(player.x + player.w * 0.8, enemy.x + enemy.w * 0.38, u);
        const cy = player.y + player.h * 0.4;
        this.drawStatic(0, {
          fxExtra: (ctx) => {
            this.drawFxCentered(ctx, assets.fxDarkHex, cx, cy, fxMax);
          },
        });
      });
      let shake = 7;
      await this.frameLoop(130, () =>
        this.drawStatic(shake--, { enemyUseHurt: true }),
      );
      holdHurtAfter();
      return;
    }

    if (kind === "fireball") {
      const sx = player.x + player.w * 0.75;
      const sy = player.y + player.h * 0.35;
      const tx = enemy.x + enemy.w * 0.42;
      const ty = enemy.y + enemy.h * 0.38;
      const fxMax = Math.min(w, h) * 0.18;
      await this.frameLoop(520, (t) => {
        const u = easeOutQuad(t);
        const x = lerp(sx, tx, u);
        const y = lerp(sy, ty, u);
        this.drawStatic(0, {
          fxExtra: (ctx) => {
            this.drawFxCentered(ctx, assets.fxFireball, x, y, fxMax, 0.85);
          },
        });
      });
      await this.frameLoop(420, (t) => {
        const shake = t * 10;
        this.drawStatic(shake, {
          enemyUseHurt: true,
          fxExtra: (ctx) => {
            this.drawFxCentered(
              ctx,
              assets.fxFireball,
              tx,
              ty,
              fxMax,
              1.1 + t * 1.6,
            );
          },
        });
      });
      holdHurtAfter();
      return;
    }
  }
}
