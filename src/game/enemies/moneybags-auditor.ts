import type { EnemyDefinition } from "../types";

export const moneybagsAuditor: EnemyDefinition = {
  id: "moneybags-auditor",
  spriteBase: "moneybags-auditor",
  name: "Moneybags Auditor",
  battleIntro:
    "A ledger spirit taps its cane — automation budgets live or die on what gets written down. Silence in the metrics column sounds like waste to the purse-holders.",
  taunt: "Show me the numbers, or show me the door.",
  battlePrompt:
    "Finance reads KPIs first — some teams lead with gut, some with busy counters, stronger shops tie metrics to dollars and let expected ROI decide which automations graduate first. Which story matches your budget table?",
  attacks: [
    {
      id: "mb-copper-pinch",
      name: "Copper Pinch of Good Intent",
      description:
        "Ship automation without capturing baseline time, error rates, or rework before and after.",
      effectiveness: "not",
      fxKind: "slash",
      enemyResponse:
        "Shipping keeps the team’s momentum sacred — the trade is that renewal season has no receipts, so good work can still look like hobbycraft to the ledger.",
    },
    {
      id: "mb-silver-ledger",
      name: "Silver Ledger of Vanity Metrics",
      description:
        "Report only activity counts — runs per day, lines changed — without tying them to outcomes.",
      effectiveness: "slight",
      fxKind: "jump",
      enemyResponse:
        "Activity charts prove the machinery is alive — the trade is they rarely prove relief, so finance still wonders what headcount you freed.",
    },
    {
      id: "mb-gold-scale",
      name: "Gold Scale of Leading Indicators",
      description:
        "Track cycle time, failure recovery, and quality signals that precede revenue impact.",
      effectiveness: "normal",
      fxKind: "punch",
      enemyResponse:
        "Leading indicators sharpen the narrative before dollars land — execs see where automation relieved pressure while you still build the bridge to booked savings.",
    },
    {
      id: "mb-platinum-band",
      name: "Platinum Band of Proven Return",
      description:
        "Model cost avoidance and revenue effects so ROI survives scrutiny and expected return ranks which automations get funded next.",
      effectiveness: "super",
      fxKind: "fireball",
      enemyResponse:
        "The purse opens: savings and risk reduction are spelled in the auditor’s ink — automation graduates from experiment to line item, and the backlog inherits oxygen.",
      equipmentReward: {
        id: "ring-of-value",
        name: "Ring of Value",
        description:
          "A band inscribed with before-and-after runes — wear it when finance asks why the playbooks matter.",
      },
    },
  ],
};
