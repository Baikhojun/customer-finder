// 이 파일의 역할: 전체 초기화 + 시작/완성/도움말/닉네임 편집/직접 추가 + Toast 알림

(function () {
  const game = { nickname: "", started: false };

  function showToast(msg, ms = 2400) {
    const el = document.getElementById("toast-notification");
    if (!el) return;
    el.textContent = msg;
    el.classList.remove("hidden");
    clearTimeout(showToast._t);
    showToast._t = setTimeout(() => el.classList.add("hidden"), ms);
  }
  window.Notify = showToast;

  function setNickname(name) {
    game.nickname = name;
    const el = document.getElementById("player-name-display");
    if (el) el.textContent = `👤 ${name}`;
  }

  function startGame() {
    const nick = (document.getElementById("nickname-input").value || "").trim()
      || "익명_" + Math.floor(Math.random() * 1000);
    setNickname(nick);
    game.started = true;
    document.getElementById("start-screen").classList.add("hidden");

    const secs = parseInt(document.getElementById("timer-select").value, 10);
    window.Timer.setDuration(secs);
    if (secs > 0) window.Timer.start();
    if (window.Export && window.Export.loadFonts) window.Export.loadFonts();
  }

  function startNicknameEdit() {
    if (!game.started) return;
    const display = document.getElementById("player-name-display");
    if (!display || display.classList.contains("editing")) return;
    const input = document.createElement("input");
    input.type = "text";
    input.maxLength = 12;
    input.value = game.nickname;
    input.className = "player-name-input";
    let composing = false, cancelled = false;
    input.addEventListener("compositionstart", () => { composing = true; });
    input.addEventListener("compositionend", () => { composing = false; });
    input.addEventListener("keydown", (e) => {
      if (composing) return;
      if (e.key === "Enter") { e.preventDefault(); input.blur(); }
      if (e.key === "Escape") { cancelled = true; input.blur(); }
    });
    input.addEventListener("blur", () => {
      if (!cancelled) {
        const v = input.value.trim();
        if (v.length > 0) setNickname(v);
      }
      input.remove();
      display.classList.remove("editing");
    });
    display.classList.add("editing");
    display.parentNode.insertBefore(input, display.nextSibling);
    input.focus();
    input.select();
  }

  // ===== Finish =====
  function finishWork() {
    const state = window.Slots.getState();
    if (state.who.length === 0 && state.pain.length === 0 && state.gain.length === 0) {
      showToast("아직 카드를 하나도 안 놓았어요. Who 카드부터 1장 골라보세요!");
      return;
    }
    const sentence = window.Sentence ? window.Sentence.buildPlainText() : "";
    const snapshot = {
      nickname: game.nickname,
      who: state.who, pain: state.pain, gain: state.gain,
      sentence,
    };
    window.Gallery.save(snapshot);

    const completeness = computeCompleteness(state);
    document.getElementById("finish-message").textContent =
      `🎉 ${game.nickname}님의 고객 발견이 갤러리에 저장됐어요!`;
    const box = document.getElementById("finish-insight");
    if (box) box.innerHTML = buildInsightHtml(state, sentence, completeness);

    // 페르소나 시트 자동 렌더
    if (window.Persona) {
      window.Persona.renderInto(document.getElementById("finish-persona"), snapshot);
    }
    // 5 Why 결과 요약 (있으면)
    renderFiveWhySummary(state);

    document.getElementById("finish-modal").classList.remove("hidden");
  }

  function renderFiveWhySummary(state) {
    const wrap = document.getElementById("finish-fivewhy");
    if (!wrap) return;
    const notes = window.FiveWhy ? window.FiveWhy.getAllNotes() : [];
    if (notes.length === 0) {
      wrap.innerHTML = "";
      return;
    }
    const items = notes.map((n) => {
      const pain = state.pain.find((p) => p.id === n.painId);
      const painLabel = pain ? `${pain.icon} ${pain.label}` : "(삭제된 카드)";
      const root = n.answers[4] || n.answers.filter((a) => a.trim()).slice(-1)[0] || "";
      return `
        <div class="fwsum-item">
          <div class="fwsum-pain">🔥 ${escapeHtml(painLabel)}</div>
          <div>5번 "왜?"를 자문한 결과:</div>
          <div class="fwsum-root">${escapeHtml(root)}</div>
        </div>`;
    }).join("");
    wrap.innerHTML = `
      <div class="fivewhy-wrap-inner">
        <h4>🔥 5 Why로 발견한 근본 원인</h4>
        ${items}
      </div>`;
  }

  function computeCompleteness(state) {
    const w = state.who.length, p = state.pain.length, g = state.gain.length;
    const filled = (w >= 1 ? 1 : 0) + (p >= 3 ? 1 : 0) + (g >= 3 ? 1 : 0);
    return { who: w, pain: p, gain: g, sections: filled };
  }

  function buildInsightHtml(state, sentence, c) {
    const who = state.who[0];
    let headline;
    if (c.sections === 3) {
      headline = `🎯 완성 — 당신은 <b>${escapeHtml(who.label)}</b>를 위한 도구를 만들고 있군요!`;
    } else if (c.sections >= 2) {
      headline = `🌱 거의 완성 — 빠진 부분만 채우면 도구 컨셉이 또렷해집니다.`;
    } else {
      headline = `🔍 좋은 출발 — 슬롯을 더 채우면 그림이 또렷해집니다.`;
    }

    const missing = [];
    if (c.who < 1) missing.push(`👤 Who (${c.who}/1)`);
    if (c.pain < 3) missing.push(`💢 Pain (${c.pain}/3)`);
    if (c.gain < 3) missing.push(`🎁 Gain (${c.gain}/3)`);

    const sentenceHtml = sentence ? `
      <div class="insight-quote">
        ${formatSentenceHtml(sentence)}
      </div>` : "";

    const tips = [];
    if (who) tips.push(`<li>다음 시간 흐름도에서 <b>${escapeHtml(who.label)}</b>의 입장을 출발점으로 잡아보세요.</li>`);
    if (state.pain.length > 0) tips.push(`<li>3회차 HTML 도구는 <b>${escapeHtml(state.pain[0].label)}</b>를 해결하는 것을 목표로 설계하세요.</li>`);
    if (state.gain.length > 0) tips.push(`<li>도구를 만들 때 "${escapeHtml(state.gain[0].label)}"가 진짜 일어나는지 검증 기준으로 삼으세요.</li>`);

    return `
      <div class="insight-headline">${headline}</div>
      ${missing.length ? `<p style="font-size:13px;color:#7a6850;margin-bottom:8px;">아직 빈 슬롯: ${missing.join(" · ")}</p>` : ""}
      ${sentenceHtml}
      <div style="margin-top:10px;">
        <b style="font-size:13px;color:#8b5e34;">💡 다음 단계에서 활용할 점</b>
        <ul style="margin:6px 0 0 20px;font-size:13px;line-height:1.7;color:#3a2e22;">
          ${tips.join("")}
        </ul>
      </div>
      <p class="insight-note">💡 옆 사람과 비교해보세요. 같은 회사 안에서도 보고 있는 고객이 다를 거예요.</p>
    `;
  }

  function formatSentenceHtml(text) {
    return escapeHtml(text).replace(/\n/g, "<br/>");
  }

  function escapeHtml(s) {
    return String(s).replace(/[<>&"']/g, (c) => ({
      "<":"&lt;",">":"&gt;","&":"&amp;",'"':"&quot;","'":"&apos;"
    }[c]));
  }

  // ===== Help =====
  function openHelp() { document.getElementById("help-modal").classList.remove("hidden"); }
  function closeHelp() { document.getElementById("help-modal").classList.add("hidden"); }

  // ===== Custom Add =====
  function openCustom() {
    const cat = window.Palette ? window.Palette.getActiveCategory() : "who";
    const catLabel = (window.CARD_CATEGORIES.find((c) => c.id === cat) || {}).label || cat;
    document.getElementById("custom-cat-label").textContent = catLabel;
    document.getElementById("custom-icon").value = "";
    document.getElementById("custom-label").value = "";
    document.getElementById("custom-modal").classList.remove("hidden");
    document.getElementById("custom-label").focus();
  }
  function closeCustom() { document.getElementById("custom-modal").classList.add("hidden"); }
  function saveCustom() {
    const icon = (document.getElementById("custom-icon").value || "✨").trim() || "✨";
    const label = (document.getElementById("custom-label").value || "").trim();
    if (!label) { showToast("이름을 입력하세요."); return; }
    const cat = window.Palette ? window.Palette.getActiveCategory() : "who";
    const customCard = { id: "custom_" + Date.now(), cat, icon, label };
    // 카드 라이브러리에 추가 (현재 세션에서만 유지)
    window.CARDS.push(customCard);
    if (window.Palette) window.Palette.refresh();
    if (window.Slots) window.Slots.addToSlot(customCard);
    closeCustom();
  }

  // ===== Bindings =====
  function bindStartScreen() {
    document.getElementById("start-btn").addEventListener("click", startGame);
    document.getElementById("nickname-input").addEventListener("keydown", (e) => {
      if (e.key === "Enter") startGame();
    });
    document.getElementById("help-btn-start").addEventListener("click", openHelp);
  }

  function bindHeader() {
    document.getElementById("clear-btn").addEventListener("click", () => {
      const c = window.Slots.counts();
      if (c.total === 0) return;
      if (confirm("슬롯의 모든 카드를 비울까요? (5 Why 기록도 함께 초기화됩니다.)")) {
        window.Slots.clearAll();
        if (window.Sentence) window.Sentence.resetCustom();
        if (window.FiveWhy) window.FiveWhy.clear();
      }
    });
    document.getElementById("finish-btn").addEventListener("click", finishWork);
    document.getElementById("help-btn-top").addEventListener("click", openHelp);
    document.getElementById("player-name-display").addEventListener("click", startNicknameEdit);
  }

  function bindFinishModal() {
    document.getElementById("finish-png").addEventListener("click", () => window.Export.currentToPng());
    document.getElementById("finish-md").addEventListener("click", () => window.Export.currentToMd());
    document.getElementById("finish-gallery").addEventListener("click", () => {
      document.getElementById("finish-modal").classList.add("hidden");
      window.Gallery.open();
    });
    document.getElementById("finish-continue").addEventListener("click", () => {
      document.getElementById("finish-modal").classList.add("hidden");
    });
  }

  function bindSidebar() {
    document.getElementById("save-png-btn").addEventListener("click", () => window.Export.currentToPng());
    document.getElementById("save-md-btn").addEventListener("click", () => window.Export.currentToMd());
    document.getElementById("gallery-btn").addEventListener("click", () => window.Gallery.open());
  }

  function bindHelpModal() {
    document.getElementById("help-close").addEventListener("click", closeHelp);
    document.getElementById("help-close-2").addEventListener("click", closeHelp);
  }

  function bindCustomModal() {
    document.getElementById("add-custom-btn").addEventListener("click", openCustom);
    document.getElementById("custom-save").addEventListener("click", saveCustom);
    document.getElementById("custom-cancel").addEventListener("click", closeCustom);
    document.getElementById("custom-label").addEventListener("keydown", (e) => {
      if (e.key === "Enter") saveCustom();
    });
  }

  function init() {
    if (window.Palette)  window.Palette.init();
    if (window.Slots)    window.Slots.init();
    if (window.Sentence) window.Sentence.init();
    if (window.Timer)    window.Timer.init();
    if (window.Gallery)  window.Gallery.init();
    if (window.Stats)    window.Stats.refresh();
    if (window.FiveWhy)  window.FiveWhy.init();
    bindStartScreen();
    bindHeader();
    bindFinishModal();
    bindSidebar();
    bindHelpModal();
    bindCustomModal();
  }

  window.Game = { init, getNickname: () => game.nickname };
  document.addEventListener("DOMContentLoaded", init);
})();
