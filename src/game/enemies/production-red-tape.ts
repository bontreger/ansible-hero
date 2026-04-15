import type { EnemyDefinition } from "../types";

export const productionRedTape: EnemyDefinition = {
  id: "production-red-tape",
  spriteBase: "production-red-tape",
  name: "Production Red Tape",
  battleIntro:
    "Beyond the laptop lies the gate to production — every push meets tape, signatures, and the fear of being the one who broke uptime. The server-bound warden wants a story it can repeat to auditors and on-call alike.",
  taunt: "Change tickets or it didn’t happen.",
  battlePrompt:
    "Automation does not deliver value until it reaches production — yet production rightly demands stability and evidence. How do you balance shipping fast with the guardrails the business trusts when traffic is real?",
  attacks: [
    {
      id: "hopes-prayers",
      name: "Trust the Vanguard",
      description:
        "Move fast into production because you trust engineers’ judgment, ownership, and on-call culture more than heavyweight gates.",
      effectiveness: "not",
      fxKind: "prayer",
      enemyResponse:
        "This bets on people who know the system — velocity and morale stay high — the trade is that trust works best when incidents still get blameless learning and rollback is muscle memory, not luck.",
    },
    {
      id: "lead-pipeline",
      name: "Lead Pipe(line)",
      description:
        "Add a pipeline that checks syntax and secrets but still promotes straight to prod on green.",
      effectiveness: "slight",
      fxKind: "pipeSwing",
      enemyResponse:
        "Fast feedback catches the obvious traps early — the trade is that subtler coupling and data stories still deserve rehearsal before they meet customers.",
    },
    {
      id: "oak-branch",
      name: "Oak Branch",
      description:
        "Use branching and pipelines to deploy through a test environment before controlled promotion to production.",
      effectiveness: "normal",
      fxKind: "branchSwing",
      enemyResponse:
        "Rehearsal environments give risk a dress rehearsal — the tape frays where the path is repeatable, and rollback becomes a lever instead of a prayer.",
    },
    {
      id: "gitops-chop",
      name: "GitOps Chop",
      description:
        "Keep integrated tests in the pipeline and promote only when the build proves the change against realistic checks.",
      effectiveness: "super",
      fxKind: "punch",
      enemyResponse:
        "Green means something now — production receives code that already lived under scrutiny, and the warden nods because the story matches the diff.",
      equipmentReward: {
        id: "gloves-of-gitops",
        name: "Gloves of GitOps",
        description:
          "Gloves that steady the hand when pushing complex change — they remember the last known-good world and how to return to it.",
      },
    },
  ],
};
