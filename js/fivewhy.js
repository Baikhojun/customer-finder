// 이 파일의 역할: 🔥 5 Why 깊이 파기 — Pain 한 개를 골라 "왜?"를 5번 자문하며 근본 원인 발견

(function () {
  const state = {
    selectedPainId: null,
    answers: ["", "", "", "", ""],
    notesByPain: {},  // 슬롯의 painId별로 저장 (작품에 포함됨)
  };

  function open() {
    const slots = window.Slots ? window.Slots.getState() : { pain: [] };
    if (!slots.pain || slots.pain.length === 0) {
      if (window.Notify) window.Notify("먼저 Pain 카드를 한 장이라도 골라주세요. 그 다음에 깊이 파볼 수 있어요!");
      return;
    }
    if (!state.selectedPainId || !slots.pain.find((p) => p.id === state.selectedPainId)) {
      state.selectedPainId = slots.pain[0].id;
      restoreFromNotes();
    }
    document.getElementById("fivewhy-modal").classList.remove("hidden");
    render();
  }
  function close() { document.getElementById("fivewhy-modal").classList.add("hidden"); }

  function restoreFromNotes() {
    const note = state.notesByPain[state.selectedPainId];
    state.answers = note ? note.answers.slice() : ["", "", "", "", ""];
  }

  function saveToNotes() {
    state.notesByPain[state.selectedPainId] = {
      painId: state.selectedPainId,
      answers: state.answers.slice(),
    };
  }

  function escapeHtml(s) {
    return String(s).replace(/[<>&"']/g, (c) => ({
      "<":"&lt;",">":"&gt;","&":"&amp;",'"':"&quot;","'":"&apos;"
    }[c]));
  }

  function render() {
    const slots = window.Slots.getState();
    const selectedPain = slots.pain.find((p) => p.id === state.selectedPainId) || slots.pain[0];
    if (selectedPain) state.selectedPainId = selectedPain.id;

    // Pain 선택 탭
    const tabs = slots.pain.map((p) => `
      <button class="fw-pain-tab ${p.id === state.selectedPainId ? "active" : ""}" data-id="${p.id}">
        ${escapeHtml(p.icon)} ${escapeHtml(p.label)}
      </button>
    `).join("");

    // 5 단계 질문/답 박스
    const stages = state.answers.map((ans, i) => {
      const prev = i === 0 ? selectedPain.label : (state.answers[i-1].trim() || "(이전 답을 먼저 채우세요)");
      const disabled = i > 0 && !state.answers[i-1].trim();
      return `
        <div class="fw-step ${disabled ? "fw-step-disabled" : ""}" data-step="${i}">
          <div class="fw-step-head">
            <span class="fw-num">${i+1}</span>
            <span class="fw-q">
              왜 <b>${escapeHtml(i === 0 ? selectedPain.icon + " " + prev : prev)}</b>일까요?
            </span>
          </div>
          <textarea class="fw-textarea" data-idx="${i}" ${disabled ? "disabled" : ""}
            placeholder="${i === 4 ? "👇 5번째 — 여기까지 가면 근본 원인에 가까워집니다." : "왜 그럴지 한 문장으로..."}"
          >${escapeHtml(ans)}</textarea>
        </div>
      `;
    }).join("");

    const allFilled = state.answers.every((a) => a.trim().length > 0);
    const root = state.answers[4] || "";

    const conclusion = allFilled ? `
      <div class="fw-conclusion">
        <h4>🎯 발견한 근본 원인</h4>
        <p class="fw-root">${escapeHtml(root)}</p>
        <p class="fw-tip">💡 이게 진짜 풀어야 할 문제예요. 도구는 <b>겉으로 보이는 불편</b>이 아니라 <b>이 근본 원인</b>을 해결해야 합니다.</p>
      </div>` : `
      <div class="fw-conclusion fw-conclusion-empty">
        <p>👉 5단계까지 모두 채우면 근본 원인이 보입니다.</p>
      </div>`;

    document.getElementById("fivewhy-content").innerHTML = `
      <p class="fw-lead">한 가지 불편을 골라 <b>"왜?"</b>를 다섯 번 물어보세요.<br/>
      처음 답은 누구나 알지만, <b>네다섯 번째 답에 진짜 원인이 숨어 있어요.</b></p>

      <div class="fw-pain-tabs">${tabs}</div>

      <div class="fw-stages">${stages}</div>

      ${conclusion}
    `;

    // 바인딩
    document.querySelectorAll(".fw-pain-tab").forEach((btn) => {
      btn.addEventListener("click", () => {
        saveToNotes();
        state.selectedPainId = btn.dataset.id;
        restoreFromNotes();
        render();
      });
    });
    document.querySelectorAll(".fw-textarea").forEach((ta) => {
      ta.addEventListener("input", () => {
        const idx = parseInt(ta.dataset.idx, 10);
        state.answers[idx] = ta.value;
        saveToNotes();
        // 다음 단계 활성/비활성 변경되었을 수 있으니 부분 갱신
        const next = document.querySelector(`.fw-step[data-step="${idx+1}"]`);
        if (next) {
          const nta = next.querySelector("textarea");
          const dis = !ta.value.trim();
          next.classList.toggle("fw-step-disabled", dis);
          if (nta) nta.disabled = dis;
          // 다음 step의 질문 라벨도 업데이트
          const qb = next.querySelector(".fw-q b");
          if (qb) qb.textContent = ta.value.trim() || "(이전 답을 먼저 채우세요)";
        }
        // 결론 박스 갱신은 모든 5개가 채워졌을 때만 (재렌더 부담 방지)
        const all = state.answers.every((a) => a.trim().length > 0);
        const conc = document.querySelector(".fw-conclusion");
        if (all && conc && conc.classList.contains("fw-conclusion-empty")) {
          render();
        } else if (all && conc) {
          const root = conc.querySelector(".fw-root");
          if (root) root.textContent = state.answers[4];
        }
      });
    });
  }

  function getAllNotes() {
    saveToNotes();
    return Object.values(state.notesByPain).filter((n) => n.answers.some((a) => a.trim()));
  }

  function clear() {
    state.notesByPain = {};
    state.answers = ["", "", "", "", ""];
  }

  function init() {
    document.getElementById("fivewhy-btn").addEventListener("click", open);
    document.getElementById("fivewhy-close").addEventListener("click", () => { saveToNotes(); close(); });
    document.getElementById("fivewhy-close-2").addEventListener("click", () => { saveToNotes(); close(); });
  }

  window.FiveWhy = { init, open, close, getAllNotes, clear };
})();
