// 이 파일의 역할: 좌측 카드 팔레트 (Who/Pain/Gain 3 탭) + 카드 클릭 → 적절한 슬롯에 추가

(function () {
  const state = { activeCategory: "who" };

  function renderTabs() {
    const wrap = document.getElementById("palette-tabs");
    wrap.innerHTML = "";
    window.CARD_CATEGORIES.forEach((cat) => {
      const btn = document.createElement("button");
      btn.className = "palette-tab" + (cat.id === state.activeCategory ? " active" : "");
      btn.textContent = cat.label;
      btn.dataset.cat = cat.id;
      btn.addEventListener("click", () => switchCategory(cat.id));
      wrap.appendChild(btn);
    });
  }

  function renderGrid() {
    const grid = document.getElementById("palette-grid");
    grid.innerHTML = "";
    const cards = (window.CARDS || []).filter((c) => c.cat === state.activeCategory);
    const usedIds = window.Slots ? window.Slots.getUsedCardIds() : new Set();
    cards.forEach((card) => {
      const el = document.createElement("button");
      el.className = "palette-card" + (usedIds.has(card.id) ? " used" : "");
      el.dataset.cardId = card.id;
      el.innerHTML = `<span class="icon">${card.icon}</span><span class="label">${card.label}</span>`;
      el.addEventListener("click", () => {
        if (usedIds.has(card.id)) {
          if (window.Notify) window.Notify("이미 사용한 카드예요. 슬롯의 카드를 빼고 다시 시도하세요.");
          return;
        }
        if (window.Slots) window.Slots.addToSlot(card);
      });
      grid.appendChild(el);
    });
  }

  function switchCategory(catId) {
    state.activeCategory = catId;
    renderTabs();
    renderGrid();
    updateAddCustomLabel();
  }

  function updateAddCustomLabel() {
    const label = document.getElementById("custom-cat-label");
    if (label) {
      const cat = window.CARD_CATEGORIES.find((c) => c.id === state.activeCategory);
      label.textContent = cat ? cat.label : state.activeCategory;
    }
  }

  function getActiveCategory() { return state.activeCategory; }
  function refresh() { renderGrid(); }

  function init() {
    renderTabs();
    renderGrid();
    updateAddCustomLabel();
  }

  window.Palette = { init, refresh, getActiveCategory };
})();
