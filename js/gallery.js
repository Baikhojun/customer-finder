// 이 파일의 역할: 완성된 작품을 localStorage에 저장 + 갤러리 격자/비교/팀분포 보기

(function () {
  const STORAGE_KEY = "customer-finder.gallery.v1";
  const MAX_ITEMS = 50;

  const ui = {
    modal: null,
    content: null,
    mode: "grid",
    compareSlots: [null, null],
  };

  function loadAll() {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]"); }
    catch (e) { return []; }
  }
  function saveAll(items) {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(items)); }
    catch (e) {
      console.error(e);
      if (window.Notify) window.Notify("⚠ 저장 공간 부족");
    }
  }

  function save(snapshot) {
    const items = loadAll();
    const entry = {
      id: Date.now() + "_" + Math.random().toString(36).slice(2, 7),
      nickname: snapshot.nickname || "익명",
      who: snapshot.who || [],
      pain: snapshot.pain || [],
      gain: snapshot.gain || [],
      sentence: snapshot.sentence || "",
      createdAt: new Date().toISOString(),
    };
    items.unshift(entry);
    while (items.length > MAX_ITEMS) items.pop();
    saveAll(items);
    if (window.Stats) window.Stats.refreshGalleryCount();
    return entry;
  }

  function remove(id) {
    const items = loadAll().filter((it) => it.id !== id);
    saveAll(items);
    if (window.Stats) window.Stats.refreshGalleryCount();
    if (ui.modal && !ui.modal.classList.contains("hidden")) render();
  }

  function clear() {
    if (!confirm("갤러리의 모든 작품을 삭제할까요?")) return;
    saveAll([]);
    if (window.Stats) window.Stats.refreshGalleryCount();
    render();
  }

  function count() { return loadAll().length; }

  function escapeHtml(s) {
    return String(s).replace(/[<>&"']/g, (c) => ({
      "<":"&lt;",">":"&gt;","&":"&amp;",'"':"&quot;","'":"&apos;"
    }[c]));
  }

  function itemCardHtml(it) {
    const who = it.who[0];
    const whoStr = who ? `${escapeHtml(who.icon)} ${escapeHtml(who.label)}` : "(고객 없음)";
    const painStr = (it.pain || []).map((p) => `${escapeHtml(p.icon)} ${escapeHtml(p.label)}`).join(" · ") || "(불편 없음)";
    const gainStr = (it.gain || []).map((g) => `${escapeHtml(g.icon)} ${escapeHtml(g.label)}`).join(" · ") || "(변화 없음)";
    return `
      <div class="gallery-item-card">
        <div class="gw-row"><span class="gw">👤 ${whoStr}</span></div>
        <div class="gp-row"><span class="gp">💢 ${painStr}</span></div>
        <div class="gg-row"><span class="gg">🎁 ${gainStr}</span></div>
      </div>`;
  }

  function itemHtml(it) {
    const d = new Date(it.createdAt);
    const dateStr = `${d.getMonth()+1}/${d.getDate()} ${String(d.getHours()).padStart(2,"0")}:${String(d.getMinutes()).padStart(2,"0")}`;
    return `
      <div class="gallery-item" data-id="${it.id}">
        ${itemCardHtml(it)}
        <div class="gallery-item-meta">
          <div class="name">${escapeHtml(it.nickname)}</div>
          <div class="small">${dateStr}</div>
        </div>
        <div class="gallery-item-actions">
          <button data-act="png" data-id="${it.id}">💾 PNG</button>
          <button data-act="md" data-id="${it.id}">📝 MD</button>
          <button data-act="compare" data-id="${it.id}">⚖ 비교</button>
          <button data-act="delete" data-id="${it.id}">🗑</button>
        </div>
      </div>`;
  }

  function open() {
    if (!ui.modal) ui.modal = document.getElementById("gallery-modal");
    if (!ui.content) ui.content = document.getElementById("gallery-content");
    ui.modal.classList.remove("hidden");
    ui.mode = "grid";
    ui.compareSlots = [null, null];
    setActiveModeBtn();
    render();
  }
  function close() { if (ui.modal) ui.modal.classList.add("hidden"); }

  function setActiveModeBtn() {
    ["grid", "compare", "stats"].forEach((m) => {
      const btn = document.getElementById(`gallery-mode-${m === "stats" ? "stats" : m}`);
      if (btn) btn.classList.toggle("active", ui.mode === m);
    });
    const sBtn = document.getElementById("gallery-stats");
    if (sBtn) sBtn.classList.toggle("active", ui.mode === "stats");
  }

  function render() {
    const items = loadAll();
    if (items.length === 0) {
      ui.content.innerHTML = `<div class="gallery-empty">아직 저장된 작품이 없어요.<br/><br/>슬롯을 채우고 <b>✅ 완성!</b> 버튼을 눌러 추가하세요.</div>`;
      return;
    }
    if (ui.mode === "grid") renderGrid(items);
    else if (ui.mode === "compare") renderCompare(items);
    else if (ui.mode === "stats") renderStats(items);
  }

  function renderGrid(items) {
    ui.content.innerHTML = `<div class="gallery-grid">${items.map(itemHtml).join("")}</div>`;
    bindActions();
  }

  function bindActions() {
    ui.content.querySelectorAll("[data-act]").forEach((btn) => {
      btn.addEventListener("click", () => handleItemAction(btn.dataset.id, btn.dataset.act));
    });
  }

  function handleItemAction(id, act) {
    const item = loadAll().find((it) => it.id === id);
    if (!item) return;
    if (act === "png") {
      if (window.Export) window.Export.snapshotToPng(item);
    } else if (act === "md") {
      if (window.Export) window.Export.snapshotToMd(item);
    } else if (act === "delete") {
      if (confirm(`${item.nickname} 작품을 삭제할까요?`)) remove(id);
    } else if (act === "compare") {
      pushToCompare(item);
    }
  }

  function pushToCompare(item) {
    if (ui.compareSlots[0] && ui.compareSlots[0].id === item.id) ui.compareSlots[0] = null;
    else if (ui.compareSlots[1] && ui.compareSlots[1].id === item.id) ui.compareSlots[1] = null;
    else if (!ui.compareSlots[0]) ui.compareSlots[0] = item;
    else if (!ui.compareSlots[1]) ui.compareSlots[1] = item;
    else ui.compareSlots = [item, ui.compareSlots[0]];
    ui.mode = "compare";
    setActiveModeBtn();
    render();
  }

  function renderCompare(items) {
    const [a, b] = ui.compareSlots;
    const slot = (s, idx) => s ? `
      <div class="compare-slot filled">
        <h4>${escapeHtml(s.nickname)}</h4>
        ${itemCardHtml(s)}
      </div>` : `
      <div class="compare-slot">
        <h4>슬롯 ${idx+1}</h4>
        <p style="color:#7a6850;font-size:13px;margin-top:14px;">아래 작품에서 <b>⚖ 비교</b>를 눌러 채우세요.</p>
      </div>`;
    const insight = (a && b) ? buildInsight(a, b) : `<div class="compare-insight">두 작품을 모두 선택하면 차이가 한눈에 보입니다.</div>`;
    ui.content.innerHTML = `
      <div class="gallery-compare">
        ${slot(a, 0)}
        ${slot(b, 1)}
        ${insight}
      </div>
      <h3 style="margin:18px 0 10px;color:#8b5e34;">📚 전체 작품</h3>
      <div class="gallery-grid">${items.map(itemHtml).join("")}</div>`;
    bindActions();
  }

  function buildInsight(a, b) {
    const sameWho = a.who[0] && b.who[0] && a.who[0].id === b.who[0].id;
    const aPainIds = new Set(a.pain.map((p) => p.id));
    const bPainIds = new Set(b.pain.map((p) => p.id));
    const commonPain = a.pain.filter((p) => bPainIds.has(p.id));
    const aOnlyPain = a.pain.filter((p) => !bPainIds.has(p.id));
    const bOnlyPain = b.pain.filter((p) => !aPainIds.has(p.id));

    const lines = [];
    if (sameWho) {
      lines.push(`👀 두 분 모두 같은 고객(<b>${escapeHtml(a.who[0].label)}</b>)을 보고 있네요!`);
    } else {
      const aw = a.who[0] ? a.who[0].label : "(없음)";
      const bw = b.who[0] ? b.who[0].label : "(없음)";
      lines.push(`🤯 두 분이 보고 있는 고객이 다릅니다: <b>${escapeHtml(aw)}</b> vs <b>${escapeHtml(bw)}</b>`);
    }
    if (commonPain.length > 0) {
      lines.push(`✅ 두 분 모두 같은 불편을 봤어요: ${commonPain.map((p) => escapeHtml(p.label)).join(" · ")}`);
    }
    if (aOnlyPain.length > 0) {
      lines.push(`💡 <b>${escapeHtml(a.nickname)}</b>만 본 불편: ${aOnlyPain.map((p) => escapeHtml(p.label)).join(" · ")}`);
    }
    if (bOnlyPain.length > 0) {
      lines.push(`💡 <b>${escapeHtml(b.nickname)}</b>만 본 불편: ${bOnlyPain.map((p) => escapeHtml(p.label)).join(" · ")}`);
    }
    lines.push(`<i style="color:#7a6850;font-size:12px;">→ 비교에서 발견한 차이가 토론의 출발점입니다.</i>`);
    return `<div class="compare-insight">${lines.join("<br/>")}</div>`;
  }

  function renderStats(items) {
    const whoCount = {}, painCount = {}, gainCount = {};
    items.forEach((it) => {
      (it.who || []).forEach((c) => { whoCount[c.label] = (whoCount[c.label] || 0) + 1; });
      (it.pain || []).forEach((c) => { painCount[c.label] = (painCount[c.label] || 0) + 1; });
      (it.gain || []).forEach((c) => { gainCount[c.label] = (gainCount[c.label] || 0) + 1; });
    });
    const total = items.length;
    const view = (title, counts, color) => {
      const arr = Object.entries(counts).sort((a, b) => b[1] - a[1]);
      if (arr.length === 0) return `<div class="gallery-stats-view"><h3>${title}</h3><p>(데이터 없음)</p></div>`;
      const max = arr[0][1];
      const rows = arr.map(([label, n]) => {
        const pct = Math.round((n / max) * 100);
        const pctOfTotal = total > 0 ? Math.round((n / total) * 100) : 0;
        return `
          <div class="stat-bar-row">
            <span class="stat-bar-label">${escapeHtml(label)}</span>
            <span class="stat-bar-track"><span class="stat-bar-fill" style="width:${pct}%; background:${color}">${n} (${pctOfTotal}%)</span></span>
          </div>`;
      }).join("");
      return `<div class="gallery-stats-view"><h3>${title}</h3>${rows}</div>`;
    };
    ui.content.innerHTML = `
      <p style="margin-bottom:12px;color:#7a6850;font-size:13px;">총 <b>${total}명</b>의 응답 기준 — 우리 팀이 어디를 보고 있는지 한눈에 봅시다.</p>
      ${view("👤 우리 팀이 주로 보는 고객", whoCount, "#6b8cae")}
      <div style="height:14px;"></div>
      ${view("💢 가장 많이 언급된 불편", painCount, "#c45c5c")}
      <div style="height:14px;"></div>
      ${view("🎁 가장 많이 선택된 변화", gainCount, "#5c9e7a")}
    `;
  }

  function init() {
    document.getElementById("gallery-close").addEventListener("click", close);
    document.getElementById("gallery-mode-grid").addEventListener("click", () => { ui.mode = "grid"; setActiveModeBtn(); render(); });
    document.getElementById("gallery-mode-compare").addEventListener("click", () => { ui.mode = "compare"; setActiveModeBtn(); render(); });
    document.getElementById("gallery-stats").addEventListener("click", () => { ui.mode = "stats"; setActiveModeBtn(); render(); });
    document.getElementById("gallery-clear").addEventListener("click", clear);
    document.getElementById("gallery-export-all").addEventListener("click", () => {
      if (window.Export) window.Export.allToPng();
    });
  }

  window.Gallery = {
    init, open, close, save, remove, clear, count, loadAll, itemCardHtml,
  };
})();
