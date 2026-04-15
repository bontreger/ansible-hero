import type { BattlePhaseSegment, BossPhaseIndex, EnemyDefinition } from "./types";

export function isBossEnemy(enemy: EnemyDefinition): boolean {
  return enemy.bossPhases != null && enemy.bossPhases.length === 3;
}

/** Narrative + attacks for the current fight or boss phase. */
export function getActiveBattleSegment(
  enemy: EnemyDefinition,
  bossPhase: BossPhaseIndex | null,
): BattlePhaseSegment {
  if (enemy.bossPhases != null && bossPhase != null) {
    return enemy.bossPhases[bossPhase - 1]!;
  }
  return {
    battleIntro: enemy.battleIntro,
    taunt: enemy.taunt,
    battlePrompt: enemy.battlePrompt,
    attacks: enemy.attacks,
  };
}
