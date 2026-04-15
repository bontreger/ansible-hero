export type Effectiveness = "not" | "slight" | "normal" | "super";

export type BattleFxKind =
  | "slash"
  | "jump"
  | "punch"
  | "fireball"
  /** Final Fantasy–style holy / prayer burst (Production Red Tape: Trust the Vanguard) */
  | "prayer"
  /** Swinging weapon arc + impact burst (Lead Pipe(line)) */
  | "pipeSwing"
  /** Swinging weapon arc + impact burst (Oak Branch) */
  | "branchSwing"
  /** Gatekeeper: charm / shadow pull */
  | "gateCharm"
  /** Gatekeeper: sigil / rune flash */
  | "gateSigil"
  /** Gatekeeper: crown / beam */
  | "gateCrown"
  /** Dependency wyrm: dark hex burst */
  | "darkHex";

export type GamePhase =
  | "menu"
  | "scroll"
  | "level_brief"
  | "level_recap"
  | "boss_teaser"
  | "battle"
  | "victory"
  | "defeat";

export type BattleSubPhase =
  | "intro"
  | "taunt"
  | "choose_attack"
  | "animating"
  | "outcome_text";

export interface Equipment {
  id: string;
  name: string;
  description: string;
}

export interface AttackDefinition {
  id: string;
  name: string;
  description: string;
  effectiveness: Effectiveness;
  /** Which battle FX animation to play */
  fxKind: BattleFxKind;
  enemyResponse: string;
  /** Granted when this attack resolves with super effectiveness */
  equipmentReward?: Equipment;
}

/** One intro → taunt → attack grid (used per boss phase or as the whole fight for normal enemies). */
export interface BattlePhaseSegment {
  battleIntro: string;
  taunt: string;
  /** Shown above the attack grid during battle */
  battlePrompt: string;
  attacks: AttackDefinition[];
}

export type BossPhaseIndex = 1 | 2 | 3;

export interface EnemyDefinition {
  id: string;
  /** Files: `sprites/enemies/{spriteBase}.png` and `{spriteBase}-hurt.png` */
  spriteBase: string;
  name: string;
  /** Ignored when `bossPhases` is set (use each phase segment instead). */
  battleIntro: string;
  taunt: string;
  battlePrompt: string;
  attacks: AttackDefinition[];
  /** Three-phase boss: `normal` and `super` advance; sword only if all three phases cleared with `super`. */
  bossPhases?: readonly [
    BattlePhaseSegment,
    BattlePhaseSegment,
    BattlePhaseSegment,
  ];
  /** Optional battle backdrop under `public/` (e.g. `sprites/bg/battle-hydra-lair.png`). */
  bgSprite?: string;
}

export type EncounterRecapKind = "progress" | "retry_or_skip";

/** Shown on post-encounter recap (one per roster fight, including hydra as a whole). */
export interface EncounterSummary {
  effectiveness: Effectiveness;
  chosenAttackName: string;
  chosenAttackDescription: string;
  battlePromptSnapshot: string;
  /** Roster index of the encounter just completed (0–6). */
  completedEncounterIndex: number;
  equipmentEarned?: Equipment;
  /** `retry_or_skip`: standard fight, Not/Slightly effective — Try again / Skip instead of Next. */
  recapKind: EncounterRecapKind;
}

export interface GameState {
  phase: GamePhase;
  hp: number;
  maxHp: number;
  /** Index into ENEMY_ROSTER */
  currentEnemyIndex: number;
  equipment: Equipment[];
  /** Filled when entering `level_recap`; cleared when leaving recap. */
  lastEncounterSummary: EncounterSummary | null;
  battle: {
    subPhase: BattleSubPhase;
    pendingAttackId: string | null;
    /** Set when fighting a `bossPhases` enemy; 1–3 selects the active segment. */
    bossPhase: BossPhaseIndex | null;
    /** Tracks whether each hydra phase was cleared with `super` (for sword reward). */
    bossClearedWithSuper: [boolean, boolean, boolean] | null;
    /** Randomized order of attack ids for the current segment; set when entering `choose_attack`. */
    attackOrderIds: string[] | null;
  };
}

export const STARTING_HP = 5;

export function effectivenessLabel(tier: Effectiveness): string {
  switch (tier) {
    case "not":
      return "Not effective";
    case "slight":
      return "Slightly effective";
    case "normal":
      return "Effective";
    case "super":
      return "Super effective";
  }
}
