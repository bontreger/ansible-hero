import type { EnemyDefinition } from "../types";

export const messengerIntern: EnemyDefinition = {
  id: "messenger-intern",
  spriteBase: "messenger-intern",
  name: "Messenger Intern",
  battleIntro:
    "An overloaded intern staggers under towers of paper — every approval detours through a human slot, and the queue only grows.",
  taunt: "Another ticket? I’ll triage it… right after this coffee.",
  battlePrompt:
    "Automation only runs when something wakes it — calendars, incidents, approvals, or signals from upstream systems. What most often pulls your playbooks off the shelf today?",
  attacks: [
    {
      id: "mi-ask-receive",
      name: "Bell of Ask and Receive",
      description:
        "Keep automation on a leash: engineers only run playbooks when another engineer pings them to do it.",
      effectiveness: "not",
      fxKind: "slash",
      enemyResponse:
        "Human sponsorship keeps every run intentional — the trade is quiet nights when the pager fires but the runbook waits for permission.",
    },
    {
      id: "mi-gatekeeper-queue",
      name: "Scroll Through the Gatekeeper",
      description:
        "Bundle risky automation changes into CAB-style approval that lands in the next maintenance window instead of every ad hoc tweak.",
      effectiveness: "slight",
      fxKind: "jump",
      enemyResponse:
        "Batching change gives operators predictable airtime to read diffs — the trade is that urgent fixes still need a fast lane or the queue becomes the real incident.",
    },
    {
      id: "mi-ticket-spiral",
      name: "Seal of the Endless Ticket",
      description:
        "Require a ticket to open a ticket; every request spawns paperwork before anyone may touch automation.",
      effectiveness: "normal",
      fxKind: "punch",
      enemyResponse:
        "Paper trails make intent visible to auditors — the trade is meta-work that can starve the real fix unless templates stay ruthlessly short.",
    },
    {
      id: "mi-event-tide",
      name: "Horn of the Event Tide",
      description:
        "When the fix is deterministic, let events trigger automation so the next step runs without a human router.",
      effectiveness: "super",
      fxKind: "fireball",
      enemyResponse:
        "Facts wake playbooks, handoffs serialize in software instead of spines, and the intern can finally breathe while the machinery keeps tempo.",
      equipmentReward: {
        id: "sunglasses-of-repose",
        name: "Sunglasses of Repose",
        description:
          "Tinted lenses that cut the glare of pagerduty — a vacation token for whoever finally automated the human bottleneck.",
      },
    },
  ],
};
