/** Staging copy for pre-level interstitials (matches roster order). */
export interface LevelPresentation {
  level: number;
  title: string;
  subtitle: string;
}

const LEVELS: readonly LevelPresentation[] = [
  { level: 1, title: "The developer's dilemma", subtitle: "Where to write code" },
  { level: 2, title: "The Content Warden", subtitle: "Using upstream code" },
  { level: 3, title: "Dependencies… Here be dragons!", subtitle: "Make development look like production" },
  { level: 4, title: "Humans! Pesky humans", subtitle: "Someone's gotta click the button still" },
  { level: 5, title: "Red Tape Project", subtitle: "The chasm between dev and prod" },
  { level: 6, title: "The ghost of ROI", subtitle: "Visibility and reporting save the day" },
  { level: 7, title: "The next frontier", subtitle: "Will AI and Automation cooperate or collapse?" },
] as const;

export function getLevelPresentation(rosterIndex: number): LevelPresentation | undefined {
  return LEVELS[rosterIndex];
}

export function levelStoryClause(rosterIndex: number): string {
  const p = LEVELS[rosterIndex];
  if (!p) return "";
  return `${p.title} (${p.subtitle})`;
}
