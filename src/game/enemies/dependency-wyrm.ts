import type { EnemyDefinition } from "../types";

export const dependencyWyrm: EnemyDefinition = {
  id: "dependency-wyrm",
  spriteBase: "dependency-wyrm",
  name: "Dependency Wyrm",
  battleIntro:
    "A wyrm of tangled Python, Ansible, and system layers coils around your pipeline — the old curse of “it worked on my machine” slithers toward something steadier.",
  taunt:
    "Another silent upgrade on a laptop? My coils remember every version skew you hoped would disappear.",
  battlePrompt:
    "Dependencies crawl from lone laptops to shared venvs to containers — how far does your dev environment dare to mirror what production actually runs?",
  attacks: [
    {
      id: "dw-lone-grimoire",
      name: "Hex of the Lone Grimoire",
      description:
        "Let every developer fetch their own dependencies ad hoc — whatever feels right on the laptop, no shared lockfiles or manifests.",
      effectiveness: "not",
      fxKind: "darkHex",
      enemyResponse:
        "This keeps individuals unblocked on day one — the trade is that “what we run” becomes private folklore instead of a contract the whole fleet can repeat.",
    },
    {
      id: "dw-shared-talisman",
      name: "Talisman of the Shared Venv",
      description:
        "Share a team virtual environment and pin a few top-level packages without full reproducibility.",
      effectiveness: "slight",
      fxKind: "jump",
      enemyResponse:
        "A shared talisman pulls most people onto one path — the trade is fragile edges where OS patches and laptop drift still argue under the hood.",
    },
    {
      id: "dw-container-banner",
      name: "Banner of the Container Grove",
      description:
        "Standardize on container images for development so builds match across machines.",
      effectiveness: "normal",
      fxKind: "punch",
      enemyResponse:
        "Containers align libraries and OS slices so CI and desks agree more often — the next refinement is making sure the promoted image is the same story prod heard.",
    },
    {
      id: "dw-execution-heart",
      name: "Heart of the Execution Engine",
      description:
        "Adopt execution-environment builds that mirror automation content in the developer workspace.",
      effectiveness: "super",
      fxKind: "fireball",
      enemyResponse:
        "The wyrm thins: the same dependency graph is exercised early, roles and collections resolve in one truth, and “works on my machine” retires to myth.",
      equipmentReward: {
        id: "team-shirt",
        name: "Team Shirt",
        description:
          "Same cut, same patch level — a shirt that reminds the org everyone reads from the same dependency runebook.",
      },
    },
  ],
};
