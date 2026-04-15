import type { EnemyDefinition } from "../types";
import { aiHydraBoss } from "./ai-hydra-boss";
import { dependencyWyrm } from "./dependency-wyrm";
import { gatekeeperSentry } from "./gatekeeper-sentry";
import { laptopLockdown } from "./laptop-lockdown";
import { messengerIntern } from "./messenger-intern";
import { moneybagsAuditor } from "./moneybags-auditor";
import { productionRedTape } from "./production-red-tape";

export const ENEMY_ROSTER: EnemyDefinition[] = [
  laptopLockdown,
  gatekeeperSentry,
  dependencyWyrm,
  messengerIntern,
  productionRedTape,
  moneybagsAuditor,
  aiHydraBoss,
];

export function getEnemyByIndex(index: number): EnemyDefinition | undefined {
  return ENEMY_ROSTER[index];
}
