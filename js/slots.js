// 이 파일의 역할: 1+3+3 고정 슬롯 캔버스 관리 (카드 추가/제거 + 빈 슬롯 placeholder)

(function () {
  const SLOT_CAPS = { who: 1, pain: 3, gain: 3 };
  const SLOT_HINTS = {
    who:  "👇 클릭해서 카드 추가",
    pain: "👇 카드 추가",
    gain: "👇 카드 추가",
  };

  const state = {
    slots: { who: [], pain: [], gain: [] },
  };

  function init() {
    renderAll();
  }

  function renderAll() {
    ["who", "pain", "gain"].forEach(renderRow);
    if (window.Sentence) window.Sentence.refresh();
    if (window.Stats) window.Stats.refresh();
    if (window.Palette) window.Palette.refresh();
  }

  function renderRow(cat) {
    const row = document.querySelector(`.slot-row[data-cat="${cat}"]`);
    if (!row) return;
    row.innerHTML = "";
    const cap = SLOT_CAPS[cat];
    const filled = state.slots[cat];
    for (let i = 0; i < cap; i++) {
      const card = filled[i];
      const slot = document.createElement("div");
      slot.className = "slot " + (card ? "filled" : "empty");
      slot.dataset.cat = cat;
      slot.dataset.index = i;
      if (card) {
        slot.innerHTML = `
          <span class="slot-icon">${escapeHtml(card.icon)}</span>
          <span class="slot-label">${escapeHtml(card.label)}</span>
        `;
        slot.addEventListener("click", () => removeFromSlot(cat, i));
      } else {
        slot.textContent = SLOT_HINTS[cat];
      }
      row.appendChild(slot);
    }
  }

  function addToSlot(card) {
    if (!card || !SLOT_CAPS[card.cat]) return;
    const cat = card.cat;
    if (state.slots[cat].length >= SLOT_CAPS[cat]) {
      if (window.Notify) {
        const catLabel = (window.CARD_CATEGORIES.find((c) => c.id === cat) || {}).label || cat;
        window.Notify(`${catLabel} 슬롯이 가득 찼어요. 먼저 기존 카드를 빼주세요.`);
      }
      return;
    }
    if (isUsed(card.id)) return;
    state.slots[cat].push({ ...card });
    renderAll();
  }

  function removeFromSlot(cat, index) {
    if (!state.slots[cat] || !state.slots[cat][index]) return;
    state.slots[cat].splice(index, 1);
    renderAll();
  }

  function clearAll() {
    state.slots = { who: [], pain: [], gain: [] };
    renderAll();
  }

  function isUsed(cardId) {
    return ["who", "pain", "gain"].some((cat) =>
      state.slots[cat].some((c) => c.id === cardId)
    );
  }

  function getUsedCardIds() {
    const set = new Set();
    ["who", "pain", "gain"].forEach((cat) => {
      state.slots[cat].forEach((c) => set.add(c.id));
    });
    return set;
  }

  function getState() {
    return {
      who: state.slots.who.map((c) => ({ ...c })),
      pain: state.slots.pain.map((c) => ({ ...c })),
      gain: state.slots.gain.map((c) => ({ ...c })),
    };
  }

  function load(snapshot) {
    if (!snapshot) return;
    state.slots.who = (snapshot.who || []).slice(0, 1);
    state.slots.pain = (snapshot.pain || []).slice(0, 3);
    state.slots.gain = (snapshot.gain || []).slice(0, 3);
    renderAll();
  }

  function counts() {
    return {
      who: state.slots.who.length,
      pain: state.slots.pain.length,
      gain: state.slots.gain.length,
      total: state.slots.who.length + state.slots.pain.length + state.slots.gain.length,
      maxTotal: 7,
    };
  }

  function escapeHtml(s) {
    return String(s).replace(/[<>&"']/g, (c) => ({
      "<":"&lt;",">":"&gt;","&":"&amp;",'"':"&quot;","'":"&apos;"
    }[c]));
  }

  window.Slots = {
    init, addToSlot, removeFromSlot, clearAll,
    getUsedCardIds, getState, load, counts,
  };
})();
