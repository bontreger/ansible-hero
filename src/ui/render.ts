import { getActiveBattleSegment } from "../game/battleSegment";
import {
  getBackgroundForEnemy,
  getBattleAssets,
  initUiPortrait,
  loadBattleAssets,
} from "../game/assets";
import { BattleStage } from "../game/animations";
import { ENEMY_ROSTER, getEnemyByIndex } from "../game/enemies";
import { getLevelPresentation, levelStoryClause } from "../game/levelPresentation";
import {
  advanceBattleSubPhase,
  advanceFromBossTeaser,
  advanceFromRecap,
  beginAttackAnimation,
  enterBattleFromLevelBrief,
  enterLevelBriefFromScroll,
  initialState,
  resolveOutcome,
  retryFailedEncounter,
  returnToMenu,
  showOutcomeAfterAnimation,
  skipFailedEncounter,
  startNewRun,
} from "../game/state";
import type { AttackDefinition, GameState } from "../game/types";
import { effectivenessLabel } from "../game/types";

const PREMISE_HTML = `
  <p>You are an <strong>IT leader</strong> on a quest to enable automation success within your organization.  But wait! the <strong>automation blockers</strong> stand in your way! </p>
  <p>Defeat these blockers to clear the way for enterprise automation success. Your <strong>stamina is limited</strong>, so choose your attackswith care.</p>
`;

function tierClass(tier: AttackDefinition["effectiveness"]): string {
  switch (tier) {
    case "not":
      return "outcome-tier outcome-tier--not";
    case "slight":
      return "outcome-tier outcome-tier--slight";
    case "normal":
      return "outcome-tier outcome-tier--normal";
    case "super":
      return "outcome-tier outcome-tier--super";
    default:
      return "outcome-tier";
  }
}

export function mount(root: HTMLElement): void {
  root.innerHTML = `
    <main class="app-main">
      <section id="screen-menu" class="screen menu-screen is-active" aria-label="Title menu">
        <h1 class="game-title">Ansible Hero</h1>
        <button type="button" id="btn-start" class="btn">Start</button>
      </section>

      <section id="screen-scroll" class="screen scroll-screen" aria-label="Premise">
        <div class="scroll-panel">
          <h2>The quest</h2>
          <div id="scroll-body"></div>
          <div class="scroll-actions">
            <button type="button" id="btn-scroll-continue" class="btn">Continue</button>
          </div>
        </div>
      </section>

      <section id="screen-level-brief" class="screen scroll-screen interstitial-screen" aria-label="Level briefing">
        <div class="scroll-panel interstitial-panel">
          <p class="level-badge" id="level-brief-number"></p>
          <h2 id="level-brief-title"></h2>
          <p class="level-subtitle" id="level-brief-subtitle"></p>
          <p class="level-enemy-name" id="level-brief-enemy"></p>
          <div class="scroll-actions">
            <button type="button" id="btn-level-brief-continue" class="btn">Continue</button>
          </div>
        </div>
      </section>

      <section id="screen-level-recap" class="screen scroll-screen interstitial-screen" aria-label="Encounter results">
        <div class="scroll-panel interstitial-panel interstitial-panel--recap">
          <h2 class="recap-heading">Encounter results</h2>
          <p class="recap-label">Situation</p>
          <p id="recap-prompt" class="recap-prompt"></p>
          <p class="recap-label">Your approach</p>
          <p id="recap-attack-name" class="recap-attack-name"></p>
          <p id="recap-attack-desc" class="recap-attack-desc"></p>
          <p class="recap-label">Effectiveness</p>
          <p id="recap-tier" class="recap-tier-line"></p>
          <div id="recap-reward-block" class="recap-reward-block" hidden>
            <p class="recap-label">Relic earned</p>
            <p id="recap-reward" class="recap-reward"></p>
          </div>
          <div class="scroll-actions scroll-actions--recap-next">
            <button type="button" id="btn-level-recap-next" class="btn">Next</button>
          </div>
          <div class="scroll-actions scroll-actions--recap-retry" hidden>
            <button type="button" id="btn-level-recap-try-again" class="btn">Try again?</button>
            <button type="button" id="btn-level-recap-skip" class="btn">Skip</button>
          </div>
        </div>
      </section>

      <section id="screen-boss-teaser" class="screen scroll-screen interstitial-screen" aria-label="Plot twist">
        <div class="scroll-panel interstitial-panel">
          <h2 class="teaser-title">Victory! …or is it?</h2>
          <p class="teaser-body">The blockers fell — yet something larger stirs beyond the budget ledger. One more frontier waits.</p>
          <div class="scroll-actions">
            <button type="button" id="btn-boss-teaser-next" class="btn">Next</button>
          </div>
        </div>
      </section>

      <section id="screen-battle" class="screen battle-screen" aria-hidden="true">
        <div class="battle-stage-wrap">
          <span id="enemy-name-tag" class="enemy-name-tag" aria-hidden="true"></span>
          <canvas id="battle-canvas" width="400" height="240" aria-hidden="true"></canvas>
          <div id="taunt-bubble-root" class="taunt-bubble-root" hidden>
            <div id="taunt-bubble" class="taunt-bubble" role="dialog" aria-modal="true" aria-labelledby="taunt-bubble-text" tabindex="0">
              <p id="taunt-bubble-text" class="taunt-bubble__text"></p>
              <p class="taunt-bubble__hint">Click or press Enter to continue</p>
            </div>
          </div>
          <div id="message-overlay" class="message-overlay" role="dialog" aria-modal="true" aria-labelledby="message-content">
            <div class="message-box" id="message-box" tabindex="0">
              <div id="message-content"></div>
              <p class="message-hint" id="message-hint">Click or press Enter to continue</p>
            </div>
          </div>
        </div>
        <div class="battle-bottom">
          <div class="player-column">
            <div class="player-portrait" aria-hidden="true">
              <img class="player-portrait__img" src="" alt="" width="72" height="72" decoding="async" />
            </div>
            <div class="player-name">IT Leader</div>
            <div id="player-hp" class="player-hp">5 / 5</div>
            <button type="button" id="btn-reset" class="btn btn--small">Reset</button>
          </div>
          <div class="attacks-column">
            <p id="battle-prompt" class="battle-prompt" aria-live="polite"></p>
            <div id="attacks-grid" class="attacks-grid" role="group" aria-label="Attacks"></div>
          </div>
        </div>
      </section>

      <section id="screen-victory" class="screen end-screen" aria-label="Victory">
        <div class="end-panel end-panel--victory">
          <h2>Victory!</h2>
          <div class="victory-layout">
            <div class="victory-layout__story">
              <p id="victory-story" class="victory-story"></p>
              <p id="victory-cta" class="victory-cta"></p>
            </div>
            <div class="victory-layout__relics">
              <p class="victory-relics-heading"><strong>Relics gathered along the way</strong></p>
              <ul id="equipment-list" class="equipment-list"></ul>
            </div>
          </div>
          <div class="end-actions end-actions--victory-cta">
            <button type="button" id="btn-victory-menu" class="btn">Start over</button>
          </div>
        </div>
      </section>

      <section id="screen-defeat" class="screen end-screen" aria-label="Defeat">
        <div class="end-panel end-panel--defeat">
          <h2>Defeat</h2>
          <p>Your resolve ran out before the blockers relented. The organization stalls… for now.</p>
          <div class="end-actions">
            <button type="button" id="btn-defeat-restart" class="btn">Try again</button>
          </div>
        </div>
      </section>
    </main>
  `;

  const scrollBody = root.querySelector<HTMLDivElement>("#scroll-body")!;
  scrollBody.innerHTML = PREMISE_HTML;

  const screenMenu = root.querySelector<HTMLElement>("#screen-menu")!;
  const screenScroll = root.querySelector<HTMLElement>("#screen-scroll")!;
  const screenLevelBrief = root.querySelector<HTMLElement>("#screen-level-brief")!;
  const screenLevelRecap = root.querySelector<HTMLElement>("#screen-level-recap")!;
  const screenBossTeaser = root.querySelector<HTMLElement>("#screen-boss-teaser")!;
  const screenBattle = root.querySelector<HTMLElement>("#screen-battle")!;
  const screenVictory = root.querySelector<HTMLElement>("#screen-victory")!;
  const screenDefeat = root.querySelector<HTMLElement>("#screen-defeat")!;

  const btnStart = root.querySelector<HTMLButtonElement>("#btn-start")!;
  const btnScrollContinue = root.querySelector<HTMLButtonElement>(
    "#btn-scroll-continue",
  )!;
  const btnLevelBriefContinue = root.querySelector<HTMLButtonElement>(
    "#btn-level-brief-continue",
  )!;
  const btnLevelRecapNext = root.querySelector<HTMLButtonElement>(
    "#btn-level-recap-next",
  )!;
  const recapActionsNext = root.querySelector<HTMLDivElement>(
    ".scroll-actions--recap-next",
  )!;
  const recapActionsRetry = root.querySelector<HTMLDivElement>(
    ".scroll-actions--recap-retry",
  )!;
  const btnLevelRecapTryAgain = root.querySelector<HTMLButtonElement>(
    "#btn-level-recap-try-again",
  )!;
  const btnLevelRecapSkip = root.querySelector<HTMLButtonElement>(
    "#btn-level-recap-skip",
  )!;
  const btnBossTeaserNext = root.querySelector<HTMLButtonElement>(
    "#btn-boss-teaser-next",
  )!;
  const btnReset = root.querySelector<HTMLButtonElement>("#btn-reset")!;
  const btnVictoryMenu = root.querySelector<HTMLButtonElement>(
    "#btn-victory-menu",
  )!;
  const btnDefeatRestart = root.querySelector<HTMLButtonElement>(
    "#btn-defeat-restart",
  )!;

  const canvas = root.querySelector<HTMLCanvasElement>("#battle-canvas")!;
  const enemyNameTag = root.querySelector<HTMLElement>("#enemy-name-tag")!;
  const messageOverlay = root.querySelector<HTMLElement>("#message-overlay")!;
  const messageBox = root.querySelector<HTMLElement>("#message-box")!;
  const messageContent = root.querySelector<HTMLElement>("#message-content")!;
  const messageHint = root.querySelector<HTMLElement>("#message-hint")!;
  const tauntBubbleRoot = root.querySelector<HTMLElement>("#taunt-bubble-root")!;
  const tauntBubble = root.querySelector<HTMLElement>("#taunt-bubble")!;
  const tauntBubbleText = root.querySelector<HTMLElement>("#taunt-bubble-text")!;
  const playerHpEl = root.querySelector<HTMLElement>("#player-hp")!;
  const battlePromptEl = root.querySelector<HTMLElement>("#battle-prompt")!;
  const attacksGrid = root.querySelector<HTMLElement>("#attacks-grid")!;
  const equipmentList = root.querySelector<HTMLUListElement>(
    "#equipment-list",
  )!;
  const levelBriefNumber = root.querySelector<HTMLElement>("#level-brief-number")!;
  const levelBriefTitle = root.querySelector<HTMLElement>("#level-brief-title")!;
  const levelBriefSubtitle = root.querySelector<HTMLElement>(
    "#level-brief-subtitle",
  )!;
  const levelBriefEnemy = root.querySelector<HTMLElement>("#level-brief-enemy")!;
  const recapTier = root.querySelector<HTMLElement>("#recap-tier")!;
  const recapAttackName = root.querySelector<HTMLElement>("#recap-attack-name")!;
  const recapAttackDesc = root.querySelector<HTMLElement>("#recap-attack-desc")!;
  const recapPrompt = root.querySelector<HTMLElement>("#recap-prompt")!;
  const recapRewardBlock = root.querySelector<HTMLElement>("#recap-reward-block")!;
  const recapReward = root.querySelector<HTMLElement>("#recap-reward")!;
  const victoryStory = root.querySelector<HTMLElement>("#victory-story")!;
  const victoryCta = root.querySelector<HTMLElement>("#victory-cta")!;

  const stage = new BattleStage(canvas);

  let state: GameState = initialState();

  const portraitImg = root.querySelector<HTMLImageElement>(
    ".player-portrait__img",
  )!;
  portraitImg.alt = "IT Leader";
  initUiPortrait(portraitImg);

  void loadBattleAssets()
    .then((assets) => {
      stage.setAssets(assets);
      const e = getEnemyByIndex(state.currentEnemyIndex);
      stage.applyEnemySprites(e?.id ?? "laptop-lockdown");
      if (e) {
        stage.setBattleBackground(getBackgroundForEnemy(assets, e));
      }
      if (state.phase === "battle") {
        stage.resize();
      }
    })
    .catch((err) => {
      console.error("Battle assets failed to load:", err);
    });
  /** When waiting for click after outcome, holds the attack that was used */
  let pendingResolvedAttack: AttackDefinition | null = null;
  let messageAdvanceHandler: (() => void) | null = null;
  let tauntAdvanceHandler: (() => void) | null = null;

  function setActiveScreen(phase: GameState["phase"]): void {
    screenMenu.classList.toggle("is-active", phase === "menu");
    screenScroll.classList.toggle("is-active", phase === "scroll");
    screenLevelBrief.classList.toggle("is-active", phase === "level_brief");
    screenLevelRecap.classList.toggle("is-active", phase === "level_recap");
    screenBossTeaser.classList.toggle("is-active", phase === "boss_teaser");
    screenBattle.classList.toggle("is-active", phase === "battle");
    screenVictory.classList.toggle("is-active", phase === "victory");
    screenDefeat.classList.toggle("is-active", phase === "defeat");

    screenBattle.setAttribute(
      "aria-hidden",
      phase === "battle" ? "false" : "true",
    );
  }

  function syncLevelBrief(): void {
    const pres = getLevelPresentation(state.currentEnemyIndex);
    const enemy = getEnemyByIndex(state.currentEnemyIndex);
    if (!pres || !enemy) return;
    levelBriefNumber.textContent = `Level ${String(pres.level)}`;
    levelBriefTitle.textContent = pres.title;
    levelBriefSubtitle.textContent = pres.subtitle;
    levelBriefEnemy.textContent = enemy.name;
  }

  function syncLevelRecap(): void {
    const s = state.lastEncounterSummary;
    if (!s) return;
    recapTier.textContent = effectivenessLabel(s.effectiveness);
    recapTier.className = `recap-tier-line ${tierClass(s.effectiveness)}`;
    recapAttackName.textContent = s.chosenAttackName;
    recapAttackDesc.textContent = s.chosenAttackDescription;
    recapPrompt.textContent = s.battlePromptSnapshot;
    const retry = s.recapKind === "retry_or_skip";
    recapActionsNext.hidden = retry;
    recapActionsRetry.hidden = !retry;
    if (s.equipmentEarned) {
      recapRewardBlock.hidden = false;
      recapReward.textContent = `${s.equipmentEarned.name} — ${s.equipmentEarned.description}`;
    } else {
      recapRewardBlock.hidden = true;
      recapReward.textContent = "";
    }
  }

  function currentEnemy() {
    return getEnemyByIndex(state.currentEnemyIndex);
  }

  function orderedAttacksForSegment(
    attacks: readonly AttackDefinition[],
    orderIds: string[] | null,
  ): AttackDefinition[] {
    if (!orderIds?.length) return [...attacks];
    const byId = new Map(attacks.map((a) => [a.id, a]));
    const seen = new Set<string>();
    const out: AttackDefinition[] = [];
    for (const id of orderIds) {
      const a = byId.get(id);
      if (a && !seen.has(a.id)) {
        seen.add(a.id);
        out.push(a);
      }
    }
    for (const a of attacks) {
      if (!seen.has(a.id)) out.push(a);
    }
    return out;
  }

  function renderAttackCards(): void {
    const enemy = currentEnemy();
    attacksGrid.innerHTML = "";
    if (!enemy || state.phase !== "battle") return;

    const segment = getActiveBattleSegment(enemy, state.battle.bossPhase);
    const attacks = orderedAttacksForSegment(
      segment.attacks,
      state.battle.attackOrderIds,
    );
    for (const atk of attacks) {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "attack-card";
      btn.dataset.attackId = atk.id;
      btn.innerHTML = `<span class="attack-card__name"></span><span class="attack-card__desc"></span>`;
      btn.querySelector(".attack-card__name")!.textContent = atk.name;
      btn.querySelector(".attack-card__desc")!.textContent = atk.description;
      btn.addEventListener("click", () => void onAttackChosen(atk));
      attacksGrid.appendChild(btn);
    }
    syncAttackDisabled();
  }

  function isTauntBubbleVisible(): boolean {
    return !tauntBubbleRoot.hidden;
  }

  function syncAttackDisabled(): void {
    const disabled =
      state.phase !== "battle" ||
      state.battle.subPhase !== "choose_attack" ||
      messageOverlay.classList.contains("is-visible") ||
      isTauntBubbleVisible();
    attacksGrid.querySelectorAll<HTMLButtonElement>(".attack-card").forEach((b) => {
      b.disabled = disabled;
    });
  }

  function updateHpDisplay(): void {
    playerHpEl.textContent = `${state.hp} / ${state.maxHp}`;
    playerHpEl.classList.toggle("is-low", state.hp <= 2);
  }

  function clearMessageClick(): void {
    messageBox.removeEventListener("click", onMessageClick);
    messageBox.removeEventListener("keydown", onMessageKeydown);
    messageAdvanceHandler = null;
  }

  function onMessageClick(ev: MouseEvent): void {
    ev.preventDefault();
    if (messageAdvanceHandler) messageAdvanceHandler();
  }

  function onMessageKeydown(ev: KeyboardEvent): void {
    if (ev.key === "Enter" || ev.key === " ") {
      ev.preventDefault();
      if (messageAdvanceHandler) messageAdvanceHandler();
    }
  }

  function showMessage(html: string, hint: string, onAdvance: () => void): void {
    clearMessageClick();
    messageContent.innerHTML = html;
    messageHint.textContent = hint;
    messageOverlay.classList.add("is-visible");
    messageAdvanceHandler = onAdvance;
    messageBox.addEventListener("click", onMessageClick);
    messageBox.addEventListener("keydown", onMessageKeydown);
    syncAttackDisabled();
    queueMicrotask(() => messageBox.focus());
  }

  function clearTauntClick(): void {
    tauntBubble.removeEventListener("click", onTauntClick);
    tauntBubble.removeEventListener("keydown", onTauntKeydown);
    tauntAdvanceHandler = null;
  }

  function hideTauntBubble(): void {
    clearTauntClick();
    tauntBubbleRoot.hidden = true;
    tauntBubbleText.textContent = "";
    syncAttackDisabled();
  }

  function onTauntClick(ev: MouseEvent): void {
    ev.preventDefault();
    if (tauntAdvanceHandler) tauntAdvanceHandler();
  }

  function onTauntKeydown(ev: KeyboardEvent): void {
    if (ev.key === "Enter" || ev.key === " ") {
      ev.preventDefault();
      if (tauntAdvanceHandler) tauntAdvanceHandler();
    }
  }

  function showTauntBubble(text: string, onAdvance: () => void): void {
    clearTauntClick();
    clearMessageClick();
    messageOverlay.classList.remove("is-visible");
    messageContent.innerHTML = "";
    tauntBubbleText.textContent = text;
    tauntBubbleRoot.hidden = false;
    tauntAdvanceHandler = onAdvance;
    tauntBubble.addEventListener("click", onTauntClick);
    tauntBubble.addEventListener("keydown", onTauntKeydown);
    syncAttackDisabled();
    queueMicrotask(() => tauntBubble.focus());
  }

  function hideMessage(): void {
    clearMessageClick();
    messageOverlay.classList.remove("is-visible");
    messageContent.innerHTML = "";
    hideTauntBubble();
  }

  function syncBattleUI(): void {
    const enemy = currentEnemy();
    if (state.phase !== "battle" || !enemy) {
      hideMessage();
      battlePromptEl.textContent = "";
      return;
    }

    const segment = getActiveBattleSegment(enemy, state.battle.bossPhase);
    enemyNameTag.textContent = enemy.name;
    battlePromptEl.textContent = segment.battlePrompt;
    const assetsNow = getBattleAssets();
    if (assetsNow) {
      stage.setBattleBackground(getBackgroundForEnemy(assetsNow, enemy));
    }
    stage.applyEnemySprites(enemy.id);
    updateHpDisplay();
    renderAttackCards();
    stage.resize();
    stage.drawStatic(0);

    const { subPhase } = state.battle;

    if (subPhase === "intro") {
      showMessage(`<p>${escapeHtml(segment.battleIntro)}</p>`, "Click to continue", () => {
        state = advanceBattleSubPhase(state);
        syncBattleUI();
      });
      return;
    }

    if (subPhase === "taunt") {
      showTauntBubble(segment.taunt, () => {
        state = advanceBattleSubPhase(state);
        hideTauntBubble();
        syncBattleUI();
      });
      return;
    }

    if (subPhase === "outcome_text" && pendingResolvedAttack) {
      const resolvedAttack = pendingResolvedAttack;
      const tier = effectivenessLabel(resolvedAttack.effectiveness);
      showMessage(
        `<p class="${tierClass(resolvedAttack.effectiveness)}">${escapeHtml(tier)}</p><p>${escapeHtml(resolvedAttack.enemyResponse)}</p>`,
        "Click to continue",
        () => {
          state = resolveOutcome(state, resolvedAttack);
          pendingResolvedAttack = null;
          if (state.phase === "battle") {
            hideMessage();
          }
          paint();
        },
      );
      return;
    }

    if (subPhase === "choose_attack") {
      hideMessage();
    }
  }

  function escapeHtml(s: string): string {
    return s
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  async function onAttackChosen(attack: AttackDefinition): Promise<void> {
    if (state.phase !== "battle" || state.battle.subPhase !== "choose_attack") {
      return;
    }
    state = beginAttackAnimation(state, attack.id);
    syncAttackDisabled();
    await stage.playAttackAnimation(attack);
    state = showOutcomeAfterAnimation(state);
    pendingResolvedAttack = attack;
    syncBattleUI();
  }

  function renderVictory(): void {
    const beats = ENEMY_ROSTER.map((_, i) => levelStoryClause(i)).join(" ");
    victoryStory.textContent = `You cleared every trial: ${beats}. From the locked laptop to the hydra's last head, you bent the story toward calmer automation.`;
    victoryCta.textContent =
      "Now, as you step back into the real world on your automation quests, do you need a guide, a sidekick, or a mercenary? Talk to us at Red Hat Consulting - we would love to help you slay your metaphorical dragons. (No real ones, please.)";

    equipmentList.innerHTML = "";
    if (state.equipment.length === 0) {
      const li = document.createElement("li");
      li.textContent = "No relics this run — still a legendary clear.";
      equipmentList.appendChild(li);
    } else {
      for (const eq of state.equipment) {
        const li = document.createElement("li");
        li.innerHTML = `<strong>${escapeHtml(eq.name)}</strong> — ${escapeHtml(eq.description)}`;
        equipmentList.appendChild(li);
      }
    }
  }

  function paint(): void {
    setActiveScreen(state.phase);
    updateHpDisplay();

    if (state.phase === "battle") {
      syncBattleUI();
    } else {
      hideMessage();
    }

    if (state.phase === "level_brief") {
      syncLevelBrief();
    }
    if (state.phase === "level_recap") {
      syncLevelRecap();
    }

    if (state.phase === "victory") {
      renderVictory();
    }
  }

  btnStart.addEventListener("click", () => {
    state = startNewRun(state);
    paint();
  });

  btnScrollContinue.addEventListener("click", () => {
    state = enterLevelBriefFromScroll(state);
    paint();
  });

  btnLevelBriefContinue.addEventListener("click", () => {
    state = enterBattleFromLevelBrief(state);
    paint();
  });

  btnLevelRecapNext.addEventListener("click", () => {
    state = advanceFromRecap(state);
    paint();
  });

  btnLevelRecapTryAgain.addEventListener("click", () => {
    state = retryFailedEncounter(state);
    paint();
  });

  btnLevelRecapSkip.addEventListener("click", () => {
    state = skipFailedEncounter(state);
    paint();
  });

  btnBossTeaserNext.addEventListener("click", () => {
    state = advanceFromBossTeaser(state);
    paint();
  });

  btnReset.addEventListener("click", () => {
    pendingResolvedAttack = null;
    state = returnToMenu();
    paint();
  });

  btnVictoryMenu.addEventListener("click", () => {
    state = returnToMenu();
    paint();
  });

  btnDefeatRestart.addEventListener("click", () => {
    state = returnToMenu();
    paint();
  });

  paint();
}
