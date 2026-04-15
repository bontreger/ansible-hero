import type { EnemyDefinition } from "../types";

export const laptopLockdown: EnemyDefinition = {
  id: "laptop-lockdown",
  spriteBase: "laptop",
  name: "Laptop Lockdown",
  battleIntro:
    "The path to reliable automation is blocked — developers wait on machines, drift creeps in, and the laptop on the desk has become a quiet tyrant. You step forward as the IT leader who must loosen the jam without opening every risk at once.",
  taunt:
    "Unsanctioned installs are a security incident in a trenchcoat. That request? Denied until it has a ticket and a blessing.",
  battlePrompt:
    "The locked-down corporate laptop: everyone knows it is a lousy forge for automation, yet it is the machine on the desk. What do you do with the tension between policy and progress?",
  attacks: [
    {
      id: "dagger-ingenuity",
      name: "Dagger of Ingenuity",
      description:
        "Assume smart engineers will improvise their own tools and merge conflicts without a shared baseline.",
      effectiveness: "not",
      fxKind: "slash",
      enemyResponse:
        "This honors local creativity and keeps nobody waiting on a platform team — the trade is that brilliance does not broadcast itself, so onboarding and parity lean on hero memory instead of a shared forge.",
    },
    {
      id: "jump-box",
      name: "Jump Box Attack",
      description:
        "Stand up a shared jump host everyone SSHes into for builds, tests, and ad hoc installs.",
      effectiveness: "slight",
      fxKind: "jump",
      enemyResponse:
        "One well-known door gives teams a sanctioned place to converge — the cost is operational love for that host, because when it coughs, every lane stalls together.",
    },
    {
      id: "way-elders",
      name: "Way of the Elders",
      description:
        "Publish a documented local environment: packages, versions, and setup steps the whole team can repeat.",
      effectiveness: "normal",
      fxKind: "punch",
      enemyResponse:
        "A written path spreads good defaults on purpose — fewer mystery laptops — and the win deepens when someone keeps the scroll current after OS and toolchain churn.",
    },
    {
      id: "devspaces-fireball",
      name: "DevSpaces Fireball",
      description:
        "Offer browser-based, managed developer spaces with pinned images and centralized updates.",
      effectiveness: "super",
      fxKind: "fireball",
      enemyResponse:
        "Managed spaces deliver the same desk to everyone, updates ride the platform instead of folklore, and the laptop stops being the fragile altar where every build must pray.",
      equipmentReward: {
        id: "devx-grimoire",
        name: "DevX Grimoire",
        description:
          "A tome of consistent environments and shared tooling wisdom — its margins warn against worshipping any one machine.",
      },
    },
  ],
};
