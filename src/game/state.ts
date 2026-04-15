import { getActiveBattleSegment, isBossEnemy } from "./battleSegment";
import { ENEMY_ROSTER, getEnemyByIndex } from "./enemies";
import type { AttackDefinition, Effectiveness, GameState } from "./types";
import type { EncounterSummary, Equipment } from "./types";
import { STARTING_HP } from "./types";

function battleReset(
  subPhase: GameState["battle"]["subPhase"] = "intro",
): GameState["battle"] {
  return {
    subPhase,
    pendingAttackId: null,
    bossPhase: null,
    bossClearedWithSuper: null,
    attackOrderIds: null,
  };
}

function shuffleArray<T>(items: readonly T[]): T[] {
  const a = [...items];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j]!, a[i]!];
  }
  return a;
}

function shuffleAttackIdsForState(state: GameState): string[] {
  const enemy = getEnemyByIndex(state.currentEnemyIndex);
  if (!enemy) return [];
  const segment = getActiveBattleSegment(enemy, state.battle.bossPhase);
  return shuffleArray(segment.attacks.map((a) => a.id));
}

function getBossSwordReward(): Equipment | undefined {
  const hydra = ENEMY_ROSTER[6];
  if (!hydra?.bossPhases) return undefined;
  for (const atk of hydra.bossPhases[2]!.attacks) {
    if (atk.equipmentReward) return atk.equipmentReward;
  }
  return undefined;
}

function markBossPhaseSuper(
  prev: [boolean, boolean, boolean] | null,
  phaseIndex: number,
  tier: Effectiveness,
): [boolean, boolean, boolean] {
  const base = prev ?? [false, false, false];
  const next: [boolean, boolean, boolean] = [base[0]!, base[1]!, base[2]!];
  next[phaseIndex - 1] = tier === "super";
  return next;
}

export function initialState(): GameState {
  return {
    phase: "menu",
    hp: STARTING_HP,
    maxHp: STARTING_HP,
    currentEnemyIndex: 0,
    equipment: [],
    lastEncounterSummary: null,
    battle: battleReset(),
  };
}

export function startNewRun(state: GameState): GameState {
  return {
    ...state,
    phase: "scroll",
    hp: STARTING_HP,
    maxHp: STARTING_HP,
    currentEnemyIndex: 0,
    equipment: [],
    lastEncounterSummary: null,
    battle: battleReset(),
  };
}

/** After premise scroll — staging for level 1. */
export function enterLevelBriefFromScroll(state: GameState): GameState {
  return {
    ...state,
    phase: "level_brief",
    currentEnemyIndex: 0,
    lastEncounterSummary: null,
    battle: battleReset(),
  };
}

/** Continue from level brief into battle (taunt first; skips intro overlay). */
export function enterBattleFromLevelBrief(state: GameState): GameState {
  const enemy = getEnemyByIndex(state.currentEnemyIndex);
  const boss = enemy && isBossEnemy(enemy);
  return {
    ...state,
    phase: "battle",
    battle: {
      subPhase: "taunt",
      pendingAttackId: null,
      bossPhase: boss ? 1 : null,
      bossClearedWithSuper: boss ? [false, false, false] : null,
      attackOrderIds: null,
    },
  };
}

export function advanceFromRecap(state: GameState): GameState {
  const sum = state.lastEncounterSummary;
  if (!sum) {
    return { ...state, phase: "menu", lastEncounterSummary: null };
  }
  const completed = sum.completedEncounterIndex;
  const nextIdx = completed + 1;

  if (nextIdx >= ENEMY_ROSTER.length) {
    return {
      ...state,
      currentEnemyIndex: nextIdx,
      lastEncounterSummary: null,
      phase: "victory",
      battle: battleReset("choose_attack"),
    };
  }

  if (completed === 5) {
    return {
      ...state,
      currentEnemyIndex: 6,
      lastEncounterSummary: null,
      phase: "boss_teaser",
      battle: battleReset(),
    };
  }

  return {
    ...state,
    currentEnemyIndex: nextIdx,
    lastEncounterSummary: null,
    phase: "level_brief",
    battle: battleReset(),
  };
}

export function advanceFromBossTeaser(state: GameState): GameState {
  return {
    ...state,
    phase: "level_brief",
    currentEnemyIndex: 6,
    lastEncounterSummary: null,
    battle: battleReset(),
  };
}

/** After a failed standard encounter recap, return to the same fight (same roster index). */
export function retryFailedEncounter(state: GameState): GameState {
  return {
    ...state,
    phase: "battle",
    lastEncounterSummary: null,
    battle: {
      ...state.battle,
      subPhase: "choose_attack",
      pendingAttackId: null,
      attackOrderIds: shuffleAttackIdsForState(state),
    },
  };
}

/** Same progression as Next on a normal recap: leave failed encounter and advance roster. */
export function skipFailedEncounter(state: GameState): GameState {
  return advanceFromRecap(state);
}

export function advanceBattleSubPhase(state: GameState): GameState {
  const { subPhase } = state.battle;
  if (subPhase === "intro") {
    return {
      ...state,
      battle: { ...state.battle, subPhase: "taunt" },
    };
  }
  if (subPhase === "taunt") {
    return {
      ...state,
      battle: {
        ...state.battle,
        subPhase: "choose_attack",
        attackOrderIds: shuffleAttackIdsForState(state),
      },
    };
  }
  return state;
}

export function beginAttackAnimation(
  state: GameState,
  attackId: string,
): GameState {
  return {
    ...state,
    battle: {
      ...state.battle,
      subPhase: "animating",
      pendingAttackId: attackId,
    },
  };
}

export function showOutcomeAfterAnimation(state: GameState): GameState {
  return {
    ...state,
    battle: {
      ...state.battle,
      subPhase: "outcome_text",
    },
  };
}

function hpDeltaForEffectiveness(tier: Effectiveness): number {
  if (tier === "not" || tier === "slight") return -1;
  return 0;
}

function buildSummary(
  state: GameState,
  attack: AttackDefinition,
  tier: Effectiveness,
  equipmentEarned: Equipment | undefined,
  recapKind: EncounterSummary["recapKind"],
): EncounterSummary {
  const enemy = getEnemyByIndex(state.currentEnemyIndex)!;
  const segment = getActiveBattleSegment(enemy, state.battle.bossPhase);
  return {
    effectiveness: tier,
    chosenAttackName: attack.name,
    chosenAttackDescription: attack.description,
    battlePromptSnapshot: segment.battlePrompt,
    completedEncounterIndex: state.currentEnemyIndex,
    equipmentEarned,
    recapKind,
  };
}

function applySuperResolveHeal(
  hp: number,
  tier: Effectiveness,
  maxHp: number,
): number {
  if (tier !== "super" || hp >= maxHp) return hp;
  return Math.min(maxHp, hp + 1);
}

export function resolveOutcome(
  state: GameState,
  attack: AttackDefinition,
): GameState {
  const enemy = getEnemyByIndex(state.currentEnemyIndex);
  if (!enemy) {
    return state;
  }

  const tier = attack.effectiveness;
  let hp = applySuperResolveHeal(
    state.hp + hpDeltaForEffectiveness(tier),
    tier,
    state.maxHp,
  );
  let equipment = state.equipment;
  const boss = isBossEnemy(enemy);
  const phase = state.battle.bossPhase;

  const grantStandardSuper =
    !boss &&
    tier === "super" &&
    attack.equipmentReward;
  if (grantStandardSuper && attack.equipmentReward) {
    const exists = equipment.some((e) => e.id === attack.equipmentReward!.id);
    if (!exists) {
      equipment = [...equipment, attack.equipmentReward];
    }
  }

  if (hp <= 0) {
    return {
      ...state,
      hp: 0,
      equipment,
      lastEncounterSummary: null,
      phase: "defeat",
      battle: battleReset("choose_attack"),
    };
  }

  if (boss) {
    const bp = phase ?? 1;
    const advancesPhase = tier === "normal" || tier === "super";

    if (!advancesPhase) {
      return {
        ...state,
        hp,
        equipment,
        battle: {
          ...state.battle,
          subPhase: "choose_attack",
          pendingAttackId: null,
          bossPhase: bp,
          attackOrderIds: shuffleAttackIdsForState(state),
        },
      };
    }

    const superFlags = markBossPhaseSuper(state.battle.bossClearedWithSuper, bp, tier);

    if (bp < 3) {
      return {
        ...state,
        hp,
        equipment,
        battle: {
          ...state.battle,
          subPhase: "intro",
          pendingAttackId: null,
          bossPhase: (bp + 1) as 2 | 3,
          bossClearedWithSuper: superFlags,
          attackOrderIds: null,
        },
      };
    }

    const sword = getBossSwordReward();
    const allSuper = superFlags[0] && superFlags[1] && superFlags[2];
    if (allSuper && sword && !equipment.some((e) => e.id === sword.id)) {
      equipment = [...equipment, sword];
    }

    const equipForSummary = allSuper && sword ? sword : undefined;
    const summary = buildSummary(state, attack, tier, equipForSummary, "progress");

    return {
      ...state,
      hp,
      equipment,
      lastEncounterSummary: summary,
      phase: "level_recap",
      battle: battleReset("choose_attack"),
    };
  }

  const standardWeak =
    tier === "not" || tier === "slight";
  if (standardWeak) {
    const summary = buildSummary(state, attack, tier, undefined, "retry_or_skip");
    return {
      ...state,
      hp,
      equipment,
      lastEncounterSummary: summary,
      phase: "level_recap",
      battle: battleReset("choose_attack"),
    };
  }

  const standardReward =
    tier === "super" && attack.equipmentReward ? attack.equipmentReward : undefined;
  const summary = buildSummary(state, attack, tier, standardReward, "progress");

  return {
    ...state,
    hp,
    equipment,
    lastEncounterSummary: summary,
    phase: "level_recap",
    battle: battleReset("choose_attack"),
  };
}

export function returnToMenu(): GameState {
  return initialState();
}
