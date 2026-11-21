/* Nocturne — Truth or Dare · Spin the Bottle */
(function () {
  "use strict";

  const LEVELS = window.NOCTURNE_LEVELS || [];
  const DECK = window.NOCTURNE_DECK || {};
  const PENALTIES = window.NOCTURNE_PENALTIES || ["Take a sip of your drink."];

  const MAX_PLAYERS = 12;
  const MIN_PLAYERS = 2;
  const COLORS = ["#FF3EA5", "#C6FF3D", "#FFD23F", "#5CE1E6", "#FF8A3D", "#B69CFF",
                  "#7CF2B0", "#FF6B6B", "#6EC8FF", "#FFB27A", "#FF9BD2", "#E6FF5C"];
  const CONFETTI = ["#FF3EA5", "#C6FF3D", "#FFD23F", "#5CE1E6", "#FFF7E8", "#B69CFF"];

  const reducedMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)");
  const prefersReduced = () => !!(reducedMotion && reducedMotion.matches);

  // ---------- state ----------
  const state = {
    players: [],              // { name, color, points, skips }
    levels: ["warmup", "flirty"],
    round: 1,
    chosen: -1,
    lastChosen: -1,
    angle: 0,                 // bottle rotation in degrees (cumulative)
    spinning: false,
    current: null,            // { type, level, text }
    used: new Set()
  };

  // ---------- storage (never throws) ----------
  const store = {
    get(key, fallback) {
      try { const v = localStorage.getItem(key); return v ? JSON.parse(v) : fallback; }
      catch (e) { return fallback; }
    },
    set(key, value) {
      try { localStorage.setItem(key, JSON.stringify(value)); } catch (e) { /* ignore */ }
    }
  };

  // ---------- dom ----------
  const $ = (id) => document.getElementById(id);
  const screens = { gate: $("screen-gate"), setup: $("screen-setup"), game: $("screen-game") };
  const el = {
    form: $("add-player-form"), input: $("player-input"), msg: $("player-msg"), list: $("player-list"),
    count: $("player-count"), hint: $("player-hint"), levels: $("level-list"), start: $("start-btn"),
    seats: $("seats"), table: $("table"), bottleBtn: $("bottle-btn"), bottle: $("bottle"),
    spinHint: $("spin-hint"), round: $("round-num"), gameBar: document.querySelector(".game-bar"),
    sheet: $("sheet"), backdrop: $("sheet-backdrop"),
    chosenName: $("chosen-name"), card: $("prompt-card"), pType: $("prompt-type"), pLevel: $("prompt-level"),
    pFor: $("prompt-for"), pText: $("prompt-text"), penalty: $("penalty-text"), penaltyWho: $("penalty-who"),
    scores: $("scores"), toast: $("toast"), toastText: $("toast-text"), toastAction: $("toast-action")
  };
  const steps = {
    choose: $("step-choose"), card: $("step-card"), penalty: $("step-penalty"),
    leave: $("step-leave"), scores: $("step-scores")
  };
  // Where keyboard / screen-reader focus lands when each step opens.
  const stepFocus = {
    choose: "truth-btn", card: "prompt-text", penalty: "penalty-text", leave: "leave-no", scores: "scores-close"
  };
  const stepLabel = {
    choose: () => "Turn for " + state.players[state.chosen].name,
    card: () => (state.current ? (state.current.type === "dare" ? "Dare" : "Truth") : "Card"),
    penalty: () => "Forfeit", leave: () => "Leave this game?", scores: () => "Scores"
  };

  // ---------- helpers ----------
  const rand = (n) => Math.floor(Math.random() * n);
  const pick = (arr) => arr[rand(arr.length)];
  const buzz = (ms) => { try { if (navigator.vibrate) navigator.vibrate(ms); } catch (e) {} };
  const inGame = () => !screens.game.classList.contains("hidden");

  let toastTimer;
  function toast(msg, action) {
    el.toastText.textContent = msg;
    el.toastAction.classList.toggle("hidden", !action);
    el.toastAction.onclick = action ? () => { hideToast(); action.run(); } : null;
    if (action) el.toastAction.textContent = action.label;
    el.toast.classList.remove("hidden");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(hideToast, action ? 5000 : 3000);
  }
  function hideToast() { el.toast.classList.add("hidden"); el.toastAction.onclick = null; }

  function show(name, focus) {
    Object.entries(screens).forEach(([k, s]) => s.classList.toggle("hidden", k !== name));
    window.scrollTo(0, 0);
    if (focus !== false) {
      const h = screens[name].querySelector("h1");
      if (h) h.focus({ preventScroll: true });
    }
  }

  function otherPlayerName(excludeIdx) {
    const others = state.players.filter((_, i) => i !== excludeIdx);
    return others.length ? pick(others).name : "someone";
  }
  const fill = (text, forIdx) => text.replace(/\{player\}/g, () => otherPlayerName(forIdx));

  // ---------- gate ----------
  $("gate-yes").addEventListener("click", () => {
    store.set("nocturne.adult", true);
    show("setup");
  });
  $("gate-no").addEventListener("click", () => {
    screens.gate.querySelector(".gate-lede").textContent =
      "Nocturne is only for players 18 and over. Close the app and pick a game everyone can play.";
    $("gate-yes").classList.add("hidden");
    $("gate-no").classList.add("hidden");
  });

  // ---------- setup: players ----------
  function setFieldMsg(text) {
    el.msg.textContent = text || "";
    if (text) el.input.setAttribute("aria-invalid", "true");
    else el.input.removeAttribute("aria-invalid");
  }

  function recolor() { state.players.forEach((p, i) => { p.color = COLORS[i % COLORS.length]; }); }

  function renderPlayers() {
    el.list.innerHTML = "";
    state.players.forEach((p, i) => {
      const li = document.createElement("li");
      li.className = "seat-row";
      li.style.setProperty("--seat-color", p.color);
      const dot = document.createElement("span");
      dot.className = "dot";
      dot.setAttribute("aria-hidden", "true");
      dot.style.background = p.color;
      const name = document.createElement("span");
      name.className = "nm";
      name.textContent = p.name;
      const rm = document.createElement("button");
      rm.type = "button";
      rm.className = "rm";
      rm.setAttribute("aria-label", "Remove " + p.name);
      rm.innerHTML = '<svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>';
      rm.addEventListener("click", () => removePlayer(i));
      li.append(dot, name, rm);
      el.list.appendChild(li);
    });
    el.count.textContent = state.players.length + " of " + MAX_PLAYERS;
    const need = MIN_PLAYERS - state.players.length;
    el.hint.textContent = need > 0
      ? "Add " + need + " more player" + (need > 1 ? "s" : "") + " to start."
      : state.players.length + " players, " + state.levels.length + " vibe" + (state.levels.length > 1 ? "s" : "") + " on.";
    store.set("nocturne.players", state.players.map((p) => p.name));
    el.start.disabled = state.players.length < MIN_PLAYERS || state.levels.length === 0;
  }

  function removePlayer(i) {
    const [removed] = state.players.splice(i, 1);
    recolor();
    renderPlayers();
    setFieldMsg("");
    // keep focus in the list instead of dropping it to <body>
    const rows = el.list.querySelectorAll(".rm");
    (rows[Math.min(i, rows.length - 1)] || el.input).focus();
    toast(removed.name + " removed", {
      label: "Undo",
      run: () => {
        if (state.players.length >= MAX_PLAYERS) return;
        state.players.splice(Math.min(i, state.players.length), 0, removed);
        recolor();
        renderPlayers();
      }
    });
  }

  function addPlayer(raw) {
    const name = raw.trim().replace(/\s+/g, " ");
    if (!name) { setFieldMsg("Type a name first."); return false; }
    if (state.players.length >= MAX_PLAYERS) {
      setFieldMsg("The table seats " + MAX_PLAYERS + ". Remove someone to add " + name + ".");
      return false;
    }
    if (state.players.some((p) => p.name.toLowerCase() === name.toLowerCase())) {
      setFieldMsg(name + " is already playing. Add an initial to tell them apart, like " + name + " K.");
      return false;
    }
    state.players.push({ name, color: COLORS[state.players.length % COLORS.length], points: 0, skips: 0 });
    setFieldMsg("");
    renderPlayers();
    return true;
  }

  el.form.addEventListener("submit", (e) => {
    e.preventDefault();
    if (addPlayer(el.input.value)) el.input.value = "";
    el.input.focus();
  });
  el.input.addEventListener("input", () => { if (el.msg.textContent) setFieldMsg(""); });

  // ---------- setup: vibes ----------
  function renderLevels() {
    el.levels.innerHTML = "";
    LEVELS.forEach((lv) => {
      const b = document.createElement("button");
      b.type = "button";
      b.className = "vibe";
      b.setAttribute("role", "switch");
      b.setAttribute("aria-checked", state.levels.includes(lv.id) ? "true" : "false");
      b.innerHTML = '<span><span class="vibe-name"></span><span class="vibe-desc"></span></span><span class="switch" aria-hidden="true"></span>';
      b.querySelector(".vibe-name").textContent = lv.name;
      b.querySelector(".vibe-desc").textContent = lv.desc;
      b.addEventListener("click", () => {
        const on = state.levels.includes(lv.id);
        if (on && state.levels.length === 1) { toast("Keep at least one vibe on"); return; }
        state.levels = on ? state.levels.filter((x) => x !== lv.id) : state.levels.concat(lv.id);
        store.set("nocturne.levels", state.levels);
        b.setAttribute("aria-checked", on ? "false" : "true"); // update in place, keep focus
        renderPlayers();
      });
      el.levels.appendChild(b);
    });
  }

  el.start.addEventListener("click", startGame);

  // ---------- game ----------
  function startGame() {
    state.players.forEach((p) => { p.points = 0; p.skips = 0; });
    state.round = 1;
    state.chosen = -1;
    state.lastChosen = -1;
    state.used.clear();
    el.round.textContent = "1";
    el.spinHint.textContent = "Tap the bottle to spin";
    show("game");
    renderSeats();
    el.bottle.style.transform = "rotate(" + state.angle + "deg)";
    pushGuard();
  }

  const seatAngle = (i) => (360 / state.players.length) * i; // 0deg = top, clockwise

  function renderSeats() {
    el.seats.innerHTML = "";
    const n = state.players.length;
    const size = el.table.offsetWidth || 340;
    el.table.classList.toggle("crowded", n > 8);
    const radius = size / 2 - (n > 8 ? 34 : 46);
    state.players.forEach((p, i) => {
      const a = (seatAngle(i) - 90) * Math.PI / 180;
      const seat = document.createElement("div");
      seat.className = "seat";
      seat.style.setProperty("--tilt", (i % 2 ? 4 : -4) + "deg");
      seat.style.transform = "translate(" + (Math.cos(a) * radius).toFixed(1) + "px," + (Math.sin(a) * radius).toFixed(1) + "px)";
      const av = document.createElement("div");
      av.className = "disc";
      av.setAttribute("aria-hidden", "true");
      av.style.background = p.color;
      av.textContent = p.name.charAt(0).toUpperCase();
      const nm = document.createElement("div");
      nm.className = "tag";
      nm.textContent = p.name;
      seat.append(av, nm);
      el.seats.appendChild(seat);
    });
    markSeats();
  }

  function markSeats() {
    [...el.seats.children].forEach((s, i) => {
      s.classList.toggle("is-chosen", i === state.chosen);
      s.classList.toggle("dim", state.chosen !== -1 && i !== state.chosen);
    });
  }

  function spin() {
    if (state.spinning || sheetOpen()) return;
    const n = state.players.length;
    state.spinning = true;
    state.chosen = -1;
    markSeats();
    el.bottleBtn.setAttribute("aria-disabled", "true");
    el.spinHint.textContent = "Spinning…";
    buzz(15);

    // Avoid the same player twice in a row when possible.
    let target = rand(n);
    if (n > 2 && target === state.lastChosen) target = (target + 1 + rand(n - 1)) % n;

    // Land inside the target's slice, not dead centre, so it feels natural.
    const slice = 360 / n;
    const jitter = (Math.random() - 0.5) * slice * 0.5;
    const desired = (seatAngle(target) + jitter + 360) % 360;
    const start = state.angle;
    let delta = desired - (((start % 360) + 360) % 360);
    if (delta < 0) delta += 360;

    const reduced = prefersReduced();
    if (!reduced) el.table.classList.add("playing");
    const turns = reduced ? 0 : 4 + rand(3);
    const end = start + turns * 360 + delta;
    const duration = reduced ? 500 : 3600 + rand(900);
    const t0 = performance.now();
    const easeOut = (t) => 1 - Math.pow(1 - t, 4);
    let lastTick = Math.floor(start / slice);

    function frame(now) {
      const t = Math.min(1, (now - t0) / duration);
      const a = start + (end - start) * easeOut(t);
      el.bottle.style.transform = "rotate(" + a + "deg)";
      if (!reduced) {
        const tick = Math.floor((a + slice / 2) / slice);
        if (tick !== lastTick) { lastTick = tick; if (t < 0.85) buzz(4); }
      }
      if (t < 1) { requestAnimationFrame(frame); return; }
      state.angle = end % 360;   // keep the number small; visual angle is identical
      el.bottle.style.transform = "rotate(" + state.angle + "deg)";
      state.spinning = false;
      el.table.classList.remove("playing");
      el.bottleBtn.removeAttribute("aria-disabled");
      landOn(target);
    }
    requestAnimationFrame(frame);
  }

  function landOn(idx) {
    state.chosen = idx;
    state.lastChosen = idx;
    markSeats();
    buzz([30, 40, 30]);
    burstConfetti(idx);
    el.spinHint.textContent = "The bottle points at " + state.players[idx].name;
    setTimeout(() => {
      if (!inGame()) return;
      el.chosenName.textContent = state.players[idx].name;
      openSheet("choose");
    }, prefersReduced() ? 150 : 550);
  }

  // One celebratory burst from the chosen player's sticker.
  function burstConfetti(idx) {
    if (prefersReduced() || !Element.prototype.animate) return;
    const layer = $("confetti");
    const seat = el.seats.children[idx];
    if (!seat) return;
    const tr = el.table.getBoundingClientRect();
    const sr = seat.querySelector(".disc").getBoundingClientRect();
    const scale = tr.width / el.table.offsetWidth || 1;
    const ox = (sr.left + sr.width / 2 - tr.left) / scale;
    const oy = (sr.top + sr.height / 2 - tr.top) / scale;
    for (let k = 0; k < 26; k++) {
      const bit = document.createElement("i");
      if (k % 3 === 0) bit.className = "round-bit";
      bit.style.left = ox + "px";
      bit.style.top = oy + "px";
      bit.style.background = CONFETTI[k % CONFETTI.length];
      layer.appendChild(bit);
      const ang = Math.random() * Math.PI * 2;
      const dist = 50 + Math.random() * 90;
      const dx = Math.cos(ang) * dist;
      const dy = Math.sin(ang) * dist - 40;
      const rot = (Math.random() - 0.5) * 720;
      bit.animate([
        { transform: "translate(-50%,-50%) rotate(0deg) scale(.6)", opacity: 1 },
        { transform: "translate(calc(-50% + " + dx + "px), calc(-50% + " + dy + "px)) rotate(" + rot / 2 + "deg) scale(1)", opacity: 1, offset: 0.45 },
        { transform: "translate(calc(-50% + " + dx * 1.15 + "px), calc(-50% + " + (dy + 120) + "px)) rotate(" + rot + "deg) scale(.9)", opacity: 0 }
      ], { duration: 1100 + Math.random() * 400, easing: "cubic-bezier(.2,.7,.4,1)", fill: "forwards" })
        .onfinish = () => bit.remove();
    }
  }

  el.bottleBtn.addEventListener("click", spin);

  // ---------- prompts ----------
  const keyOf = (p) => p.level + "|" + p.type + "|" + p.text;

  function drawPrompt(type) {
    const pool = [];
    state.levels.forEach((lv) => {
      ((DECK[lv] && DECK[lv][type]) || []).forEach((text) => pool.push({ level: lv, type, text }));
    });
    if (!pool.length) return null;
    let fresh = pool.filter((p) => !state.used.has(keyOf(p)));
    if (!fresh.length) { pool.forEach((p) => state.used.delete(keyOf(p))); fresh = pool; } // reshuffle
    const chosen = pick(fresh);
    state.used.add(keyOf(chosen));
    return chosen;
  }

  function showPrompt(type) {
    const p = drawPrompt(type);
    if (!p) { toast("This vibe has no " + type + "s. Turn on another vibe in setup."); return; }
    state.current = { type, level: p.level, text: fill(p.text, state.chosen) };
    const lv = LEVELS.find((l) => l.id === p.level);
    const label = type === "truth" ? "Truth" : "Dare";
    el.card.classList.toggle("is-dare", type === "dare");
    el.pType.textContent = label;
    el.pLevel.textContent = lv ? lv.name : p.level;
    el.pFor.textContent = "for " + state.players[state.chosen].name;
    el.pText.textContent = state.current.text;
    el.card.querySelectorAll(".corner-letter").forEach((c) => { c.textContent = label.charAt(0); });
    el.card.classList.remove("dealt"); void el.card.offsetWidth; el.card.classList.add("dealt");
    setStep("card");
  }

  // Each action only runs from the step it belongs to — guards against double taps.
  const onStep = (name, fn) => () => { if (currentStep === name) fn(); };

  $("truth-btn").addEventListener("click", onStep("choose", () => showPrompt("truth")));
  $("dare-btn").addEventListener("click", onStep("choose", () => showPrompt("dare")));
  $("random-btn").addEventListener("click", onStep("choose", () => showPrompt(Math.random() < 0.5 ? "truth" : "dare")));
  $("swap-btn").addEventListener("click", onStep("card", () => showPrompt(state.current.type)));

  $("done-btn").addEventListener("click", onStep("card", () => {
    const p = state.players[state.chosen];
    const pts = state.current.type === "dare" ? 2 : 1;
    p.points += pts;
    nextRound();
    el.spinHint.textContent = p.name + " +" + pts + (pts > 1 ? " points" : " point") + ". Tap the bottle to spin";
  }));

  $("skip-btn").addEventListener("click", onStep("card", () => {
    state.players[state.chosen].skips += 1;
    el.penaltyWho.textContent = state.players[state.chosen].name + " skipped. Forfeit:";
    el.penalty.textContent = fill(pick(PENALTIES), state.chosen);
    setStep("penalty");
  }));
  $("penalty-ok").addEventListener("click", onStep("penalty", nextRound));

  function nextRound() {
    closeSheet();
    state.round += 1;
    el.round.textContent = String(state.round);
    state.chosen = -1;
    markSeats();
    el.spinHint.textContent = "Tap the bottle to spin";
  }

  // ---------- scores ----------
  function renderScores() {
    el.scores.innerHTML = "";
    [...state.players]
      .sort((a, b) => b.points - a.points || a.skips - b.skips)
      .forEach((p, i) => {
        const li = document.createElement("li");
        li.innerHTML = '<span class="rank"></span><span class="dot" aria-hidden="true"></span><span class="nm"></span><span class="pts"></span>';
        li.querySelector(".rank").textContent = i + 1;
        li.querySelector(".rank").style.background = p.color;
        li.querySelector(".dot").style.background = p.color;
        li.querySelector(".nm").textContent = p.name;
        const pts = li.querySelector(".pts");
        pts.textContent = p.points + (p.points === 1 ? " pt" : " pts");
        if (p.skips) {
          const sk = document.createElement("span");
          sk.className = "sk";
          sk.textContent = p.skips + " skip" + (p.skips > 1 ? "s" : "");
          pts.appendChild(sk);
        }
        el.scores.appendChild(li);
      });
  }

  // Overlay steps (scores, leave) remember the step they interrupted.
  let returnStep = null;
  function openOverlay(step) {
    returnStep = sheetOpen() ? currentStep : null;
    if (sheetOpen()) setStep(step); else openSheet(step);
  }
  function closeOverlay() {
    if (returnStep) { setStep(returnStep); returnStep = null; }
    else closeSheet();
  }

  $("score-btn").addEventListener("click", () => {
    if (state.spinning || currentStep === "scores" || currentStep === "leave") return;
    renderScores();
    openOverlay("scores");
  });
  $("scores-close").addEventListener("click", onStep("scores", closeOverlay));

  // ---------- leaving the game ----------
  const gameHasProgress = () => state.round > 1 || state.players.some((p) => p.points || p.skips);

  function requestLeave() {
    if (!gameHasProgress()) { leaveGame(); return; }
    openOverlay("leave");
  }
  function leaveGame() {
    returnStep = null;
    closeSheet(false);
    popGuard();
    show("setup");
  }
  $("leave-yes").addEventListener("click", onStep("leave", leaveGame));
  $("leave-no").addEventListener("click", onStep("leave", closeOverlay));

  // ---------- sheet ----------
  let currentStep = null;
  let lastFocus = null;

  function setStep(name) {
    currentStep = name;
    Object.entries(steps).forEach(([k, s]) => s.classList.toggle("hidden", k !== name));
    el.sheet.setAttribute("aria-label", stepLabel[name]());
    const target = $(stepFocus[name]);
    if (target) {
      if (!target.matches("button, input")) target.setAttribute("tabindex", "-1");
      // wait one frame so the step is visible before focusing
      requestAnimationFrame(() => target.focus({ preventScroll: true }));
    }
    liftTable();
  }
  function openSheet(step) {
    hideToast();
    lastFocus = document.activeElement;
    screens.game.inert = true;           // background can't be tabbed to or read
    el.backdrop.classList.remove("hidden");
    clearTimeout(closingTimer);
    el.sheet.classList.remove("closing");
    el.sheet.classList.add("open");
    setStep(step);
  }
  let closingTimer;
  function closeSheet(restoreFocus) {
    if (sheetOpen()) {
      // stay visible while it slides out, then hide it from focus and screen readers
      el.sheet.classList.add("closing");
      clearTimeout(closingTimer);
      closingTimer = setTimeout(() => el.sheet.classList.remove("closing"), 240);
    }
    el.sheet.classList.remove("open");
    el.backdrop.classList.add("hidden");
    screens.game.inert = false;
    currentStep = null;
    el.table.style.transform = "";
    if (restoreFocus !== false && inGame()) {
      (lastFocus && document.contains(lastFocus) && lastFocus !== document.body ? lastFocus : el.bottleBtn)
        .focus({ preventScroll: true });
    }
  }
  const sheetOpen = () => el.sheet.classList.contains("open");

  // Keep the table (and the chosen player) visible above the open sheet.
  function liftTable() {
    if (!inGame() || !sheetOpen()) return;
    const bar = el.gameBar.getBoundingClientRect();
    const appTop = el.table.offsetParent.getBoundingClientRect().top;
    const t = { top: appTop + el.table.offsetTop, height: el.table.offsetHeight };
    const sheetTop = window.innerHeight - el.sheet.offsetHeight;
    const space = sheetTop - bar.bottom - 24;
    const scale = Math.max(0.45, Math.min(1, space / t.height));
    const dy = bar.bottom + 12 + space / 2 - (t.top + t.height / 2);
    el.table.style.transform = "translateY(" + dy.toFixed(1) + "px) scale(" + scale.toFixed(3) + ")";
  }

  el.backdrop.addEventListener("click", () => {
    if (currentStep === "scores" || currentStep === "leave") closeOverlay();
  });

  // ---------- back: one predictable path for UI button, Esc, and Android back ----------
  function handleBack() {
    if (!inGame()) return false;
    if (state.spinning) return true;                        // let the spin finish
    switch (currentStep) {
      case "scores":
      case "leave":   closeOverlay(); break;
      case "card":    setStep("choose"); break;             // back to Truth / Dare
      case "penalty": nextRound(); break;
      default:        requestLeave();                       // choose step or no sheet
    }
    return true;
  }
  $("back-btn").addEventListener("click", handleBack);
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && inGame()) { e.preventDefault(); handleBack(); }
  });

  // Hold one history entry while in a game, so the Android back button (Capacitor's
  // default WebView behaviour, or browser back) runs handleBack instead of exiting.
  let guardActive = false;
  let ignorePop = false;
  function pushGuard() {
    if (guardActive) return;
    try { history.pushState({ nocturne: "game" }, ""); guardActive = true; } catch (e) {}
  }
  function popGuard() {
    if (!guardActive) return;
    guardActive = false;
    ignorePop = true;
    try { history.back(); } catch (e) { ignorePop = false; }
  }
  window.addEventListener("popstate", () => {
    if (ignorePop) { ignorePop = false; return; }
    if (!guardActive) return;
    guardActive = false;
    handleBack();
    if (inGame()) pushGuard();
  });
  // Android app (Capacitor): the native back button comes here instead of popstate.
  // In a game it runs the same handleBack path; on setup / 18+ screens it closes the app.
  const NativeApp = window.Capacitor && window.Capacitor.isNativePlatform && window.Capacitor.isNativePlatform()
    && window.Capacitor.Plugins && window.Capacitor.Plugins.App;
  if (NativeApp) {
    NativeApp.addListener("backButton", () => {
      if (inGame()) handleBack();
      else NativeApp.exitApp();
    });
  }

  let resizeTimer;
  window.addEventListener("resize", () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => { if (inGame()) { renderSeats(); liftTable(); } }, 120);
  });

  // ---------- init ----------
  (store.get("nocturne.players", []) || []).slice(0, MAX_PLAYERS).forEach((n) => {
    if (typeof n === "string" && n.trim()) state.players.push({ name: n.trim(), color: "", points: 0, skips: 0 });
  });
  recolor();
  const savedLevels = store.get("nocturne.levels", null);
  if (Array.isArray(savedLevels)) {
    const valid = savedLevels.filter((id) => LEVELS.some((l) => l.id === id));
    if (valid.length) state.levels = valid;
  }
  renderLevels();
  renderPlayers();
  show(store.get("nocturne.adult", false) ? "setup" : "gate", false);
})();
