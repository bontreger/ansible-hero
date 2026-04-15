import type { EnemyDefinition } from "../types";

const p1Intro =
  "The hydra rises — many heads, one grin. Each maw whispers a different policy about letting AI touch the forge of code.";
const p1Taunt = "Which head do you feed first, mortal?";
const p1Prompt =
  "Faster cycles pull teams toward public models and plugins, while data sovereignty pulls toward fences and private inference. Where does your org land between bans, guided public use, curated catalogs, and fully internal models?";

const p2Intro =
  "The beast coils for a second pass — this time it asks how you kept extensions and clever assistants from overreaching into production.";
const p2Taunt = "Pretty words — show me the wards.";
const p2Prompt =
  "Assistants invite overreach: custom agents, plugins, and shadow integrations. How do you keep extensions from rewriting production — blind trust, casual review, merge policy, or proof in sandboxes before trunk?";

const p3Intro =
  "One head remains — it speaks of the organization after the tools settle: who runs the playbooks when the hype thins?";
const p3Taunt = "Finish the verse, or be swallowed by the backlog.";
const p3Prompt =
  "When AI writes or refactors code, safeguards decide whether that code is a gift or a liability. How do you run it today — hero-speed patches, one pipeline for everything, quarantine branches for generated diffs, or CI testing married to policy gates?";

export const aiHydraBoss: EnemyDefinition = {
  id: "ai-hydra-boss",
  spriteBase: "ai-hydra-boss",
  name: "Shifting Hydra of Borrowed Minds",
  battleIntro: p1Intro,
  taunt: p1Taunt,
  battlePrompt: p1Prompt,
  bgSprite: "sprites/bg/battle-hydra-lair.png",
  attacks: [],
  bossPhases: [
    {
      battleIntro: p1Intro,
      taunt: p1Taunt,
      battlePrompt: p1Prompt,
      attacks: [
        {
          id: "hydra-p1-forbidden-writ",
          name: "Baneful Writ of Forbidden Forge",
          description:
            "Ban all AI-assisted coding so every line is typed only by human fingers.",
          effectiveness: "not",
          fxKind: "sonicWave",
          enemyResponse:
            "Hard bans maximize custody of every keystroke — the trade is shadow channels where people still paste help, and velocity quietly walks out the side door.",
        },
        {
          id: "hydra-p1-open-orb",
          name: "Orb of the Guided Bazaar",
          description:
            "Publish clear guidance so teams can use public models for generic tasks while keeping proprietary data out of prompts, uploads, and logs.",
          effectiveness: "slight",
          fxKind: "waterSpiral",
          enemyResponse:
            "Teams keep modern tooling with guardrails they can repeat — the trade is that guidance must stay fresh as vendors and plugins shift weekly.",
        },
        {
          id: "hydra-p1-guarded-seal",
          name: "Seal of the Curated Commons",
          description:
            "Offer an organization-approved catalog of vetted public models and plugins so reuse stays fast inside a known boundary.",
          effectiveness: "normal",
          fxKind: "lightningFork",
          enemyResponse:
            "Innovation keeps pace with a shelf everyone can trust — the trade is curator labor so the catalog does not rot into shelfware.",
        },
        {
          id: "hydra-p1-sanctum-lens",
          name: "Sanctum Lens of the Private Mind",
          description:
            "Host approved models inside the boundary with telemetry, data residency, and controlled prompts.",
          effectiveness: "super",
          fxKind: "laserBeam",
          enemyResponse:
            "The first head wilts — creativity stays inside the wall, telemetry proves it, and the hydra hisses because you stole its favorite fear.",
        },
      ],
    },
    {
      battleIntro: p2Intro,
      taunt: p2Taunt,
      battlePrompt: p2Prompt,
      attacks: [
        {
          id: "hydra-p2-blind-ward",
          name: "Ward of Blind Faith",
          description:
            "Trust that contributors will simply be careful when AI suggests risky refactors.",
          effectiveness: "not",
          fxKind: "poisonBio",
          enemyResponse:
            "This keeps reviews lightweight and contributors autonomous — the trade is that subtle regressions arrive without a receipt when nobody logged which suggestion landed.",
        },
        {
          id: "hydra-p2-eyeball-oath",
          name: "Oath of the Eyeball Pass",
          description:
            "Rely on informal peer review without mandatory checklists for AI-touched files.",
          effectiveness: "slight",
          fxKind: "meteorStreak",
          enemyResponse:
            "Peers still read each other’s diffs with goodwill — the trade is skimmed passes and style nits that miss silent logic shifts unless cadence is sacred.",
        },
        {
          id: "hydra-p2-lawgiver",
          name: "Lawgiver’s Edict",
          description:
            "Enforce branching rules, required reviewers, and policy gates on merges that include generated snippets.",
          effectiveness: "normal",
          fxKind: "summonCircle",
          enemyResponse:
            "Rules bite where risk concentrates — the hydra shrinks a ring — yet clever extensions still probe runtime paths your policy never imagined.",
        },
        {
          id: "hydra-p2-bulwark",
          name: "Bulwark of the Sandboxed Trial",
          description:
            "Run tests, static analysis, and sandboxed execution on AI-assisted changes before they touch trunk.",
          effectiveness: "super",
          fxKind: "holySwordRain",
          enemyResponse:
            "Another head goes slack — bad ideas die in sand before they learn your customers’ names, and the creature hates reproducible proof.",
        },
      ],
    },
    {
      battleIntro: p3Intro,
      taunt: p3Taunt,
      battlePrompt: p3Prompt,
      attacks: [
        {
          id: "hydra-p3-lone-dagger",
          name: "Dagger of the Fast Familiar",
          description:
            "Let engineers paste AI-suggested fixes straight into hot paths when incidents demand minutes, not committee time.",
          effectiveness: "not",
          fxKind: "iceVolley",
          enemyResponse:
            "Outages cool fast when experts wield the assistant like a scalpel — the trade is postmortems must still reconstruct intent or the hero becomes the single point of failure.",
        },
        {
          id: "hydra-p3-half-chain",
          name: "Chain of the Shared Forge",
          description:
            "Treat AI-generated diffs like any other commit in the standard merge and deploy pipeline.",
          effectiveness: "slight",
          fxKind: "shockwaveRing",
          enemyResponse:
            "One pipeline keeps operators from juggling special cases — the trade is you must ensure the same tests and reviewers truly stress generated logic, not just syntax.",
        },
        {
          id: "hydra-p3-quarantine-branch",
          name: "Branch of Human Inclusion",
          description:
            "Route AI-authored changes through a dedicated integration branch until a human promotes them into trunk.",
          effectiveness: "normal",
          fxKind: "summonCircle",
          enemyResponse:
            "Quarantine gives reviewers air to read intent — the hydra staggers — while humans keep the pen that merges learning into production.",
        },
        {
          id: "hydra-p3-augmented-blade",
          name: "Twin Keys of Proof and Policy",
          description:
            "Pair automated pipeline testing with policy enforcement so AI-touched files cannot drift past failing checks or forbidden patterns.",
          effectiveness: "super",
          fxKind: "meteorStreak",
          enemyResponse:
            "The last head falls — the lair dims — you did not banish curiosity, you yoked it to discipline, and the quest remembers your strike.",
          equipmentReward: {
            id: "sword-of-living-pipeline",
            name: "Sword of the Living Pipeline",
            description:
              "A blade that only cuts in CI — forged to remind the realm that automation and judgment march together.",
          },
        },
      ],
    },
  ],
};
