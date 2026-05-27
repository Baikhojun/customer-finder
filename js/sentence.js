// 이 파일의 역할: 슬롯 상태 → "한 문장" 자동 생성 + 사용자 직접 수정 모드

(function () {
  const state = {
    customText: null,   // 사용자가 직접 수정했으면 그 문자열, 아니면 null (자동 생성)
    editing: false,
  };

  function refresh() {
    if (state.editing) return;
    const el = document.getElementById("sentence-display");
    if (!el) return;
    if (state.customText != null) {
      el.textContent = state.customText;
      return;
    }
    el.innerHTML = buildAuto();
  }

  function buildAuto() {
    const s = window.Slots ? window.Slots.getState() : { who: [], pain: [], gain: [] };
    const who = s.who[0];
    const pains = s.pain;
    const gains = s.gain;
    const escape = escapeHtml;

    const whoText = who
      ? `<span class="sentence-who">${escape(who.icon)} ${escape(who.label)}</span>`
      : `<span class="placeholder">[누구를 위한 도구인가요?]</span>`;

    const painText = pains.length
      ? pains.map((p) => `<span class="sentence-pain">${escape(p.label)}</span>`).join(" · ")
      : `<span class="placeholder">[그 사람의 불편 3가지]</span>`;

    const gainText = gains.length
      ? gains.map((g) => `<span class="sentence-gain">${escape(g.label)}</span>`).join(" · ")
      : `<span class="placeholder">[도구가 줄 좋은 변화 3가지]</span>`;

    return `${whoText}은(는) ${painText} 때문에 힘들다.<br/>내 도구는 ${gainText} 변화를 줄 수 있다.`;
  }

  function buildPlainText() {
    if (state.customText != null) return state.customText;
    const s = window.Slots ? window.Slots.getState() : { who: [], pain: [], gain: [] };
    const who = s.who[0];
    const pains = s.pain;
    const gains = s.gain;
    const whoT = who ? `${who.icon} ${who.label}` : "[누구를 위한 도구인가요?]";
    const painT = pains.length ? pains.map((p) => p.label).join(" · ") : "[그 사람의 불편 3가지]";
    const gainT = gains.length ? gains.map((g) => g.label).join(" · ") : "[도구가 줄 좋은 변화 3가지]";
    return `${whoT}은(는) ${painT} 때문에 힘들다.\n내 도구는 ${gainT} 변화를 줄 수 있다.`;
  }

  function startEdit() {
    const el = document.getElementById("sentence-display");
    const btn = document.getElementById("sentence-edit-btn");
    if (!el) return;
    state.editing = true;
    el.textContent = buildPlainText();
    el.setAttribute("contenteditable", "true");
    el.focus();
    if (btn) btn.textContent = "✅ 저장";
    placeCaretAtEnd(el);
  }

  function stopEdit() {
    const el = document.getElementById("sentence-display");
    const btn = document.getElementById("sentence-edit-btn");
    if (!el) return;
    const text = el.textContent.trim();
    state.customText = text.length > 0 ? text : null;
    state.editing = false;
    el.setAttribute("contenteditable", "false");
    if (btn) btn.textContent = "✏️ 직접 수정";
    refresh();
  }

  function resetCustom() {
    state.customText = null;
    refresh();
  }

  function bind() {
    const btn = document.getElementById("sentence-edit-btn");
    if (btn) {
      btn.addEventListener("click", () => {
        if (state.editing) stopEdit();
        else startEdit();
      });
    }
    const el = document.getElementById("sentence-display");
    if (el) {
      el.addEventListener("blur", () => {
        if (state.editing) stopEdit();
      });
      el.addEventListener("keydown", (e) => {
        if (state.editing && e.key === "Enter" && e.ctrlKey) {
          e.preventDefault();
          stopEdit();
        }
      });
    }
  }

  function placeCaretAtEnd(el) {
    el.focus();
    const range = document.createRange();
    range.selectNodeContents(el);
    range.collapse(false);
    const sel = window.getSelection();
    sel.removeAllRanges();
    sel.addRange(range);
  }

  function escapeHtml(s) {
    return String(s).replace(/[<>&"']/g, (c) => ({
      "<":"&lt;",">":"&gt;","&":"&amp;",'"':"&quot;","'":"&apos;"
    }[c]));
  }

  function init() {
    bind();
    refresh();
  }

  window.Sentence = {
    init, refresh, buildPlainText, buildAuto, resetCustom,
    isCustomized: () => state.customText != null,
  };
})();
