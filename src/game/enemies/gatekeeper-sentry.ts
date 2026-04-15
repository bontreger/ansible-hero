import type { EnemyDefinition } from "../types";

export const gatekeeperSentry: EnemyDefinition = {
  id: "gatekeeper-sentry",
  spriteBase: "gatekeeper-sentry",
  name: "Gatekeeper Sentry",
  battleIntro:
    "A ward blocks outside content: some teams treat every import as treason, others pipe in anything that compiles. The gate hums, waiting for your stance.",
  taunt: "Nothing passes without my stamp — or everything does. Your call.",
  battlePrompt:
    "Every import is a decision between locking down unknown upstream content and letting teams reuse good work from outside at speed. How hard do you weigh provenance and scanning against raw velocity when the gate opens?",
  attacks: [
    {
      id: "gk-purist-scroll",
      name: "Scroll of Purist Zeal",
      description:
        "Reject outside libraries entirely so every dependency is rewritten in-house from scratch.",
      effectiveness: "not",
      fxKind: "shockwaveRing",
      enemyResponse:
        "This maximizes control of the supply chain you can see — the trade is slower ships and duplicated effort while the wider ecosystem keeps shipping fixes you will not inherit.",
    },
    {
      id: "gk-shadow-charm",
      name: "Charm of Shadow Imports",
      description:
        "Allow any paste-in from the public internet with no scanning or provenance trail.",
      effectiveness: "slight",
      fxKind: "waterSpiral",
      enemyResponse:
        "Innovators move at the speed of curiosity — the trade is that speed without receipts invites poisoned tarballs and secrets in places audits never mapped.",
    },
    {
      id: "gk-reading-sigil",
      name: "Sigil of the Reading Room",
      description:
        "Review outside content case-by-case in email threads without a central catalog or SLAs.",
      effectiveness: "normal",
      fxKind: "lightningFork",
      enemyResponse:
        "Human judgment stays in the loop where it matters — the trade is reviewer fatigue and fuzzy memory unless the decisions land in a catalog everyone can query later.",
    },
    {
      id: "gk-trusted-crown",
      name: "Crown of the Trusted Repository",
      description:
        "Scan artifacts, maintain a secure internal library, and run an intake process for new upstream content.",
      effectiveness: "super",
      fxKind: "laserBeam",
      enemyResponse:
        "Reuse accelerates with evidence: approved packages, repeatable pulls, and audit trails — the gate opens where the light is good, and teams still ship.",
      equipmentReward: {
        id: "hat-of-knowledge",
        name: "Hat of Knowledge",
        description:
          "Grants the wearer the sense to reuse code safely: provenance, scanning, and a shelf of blessed libraries.",
      },
    },
  ],
};
