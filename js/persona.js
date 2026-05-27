// 이 파일의 역할: Who+Pain+Gain → "이 사람의 하루" 가상 페르소나 시트 자동 생성 (공감 강화)

(function () {
  // Who별 페르소나 템플릿 (토목설계회사 맥락)
  const WHO_PROFILE = {
    accounting:  { dept: "회계팀",        roles: ["과장", "대리"], surnames: ["김", "이", "박"], focus: "월말 마감과 결재 처리" },
    accounting2: { dept: "회계부",        roles: ["부장", "차장"], surnames: ["최", "정", "한"], focus: "예산 집행과 자금 흐름 관리" },
    planning:    { dept: "기획실",        roles: ["과장", "차장"], surnames: ["윤", "오", "임"], focus: "사업 기획과 임원 보고" },
    operation:   { dept: "업무부",        roles: ["과장", "대리"], surnames: ["송", "신", "유"], focus: "직원 인사·교육·복리후생" },
    general:     { dept: "총무부",        roles: ["과장", "대리"], surnames: ["조", "강", "장"], focus: "사내 행정과 자산 관리" },
    it:          { dept: "정보시스템실",  roles: ["팀장", "과장"], surnames: ["서", "남", "백"], focus: "사내 시스템 운영과 사용자 지원" },
    design:      { dept: "설계부서",      roles: ["수석", "책임"], surnames: ["고", "노", "권"], focus: "도면 작업과 인허가 자료 작성" },
    supervise:   { dept: "감리부서",      roles: ["감리원", "책임감리"], surnames: ["양", "허", "심"], focus: "현장 품질 확인과 검측" },
    audit:       { dept: "감사실",        roles: ["과장", "차장"], surnames: ["황", "곽", "민"], focus: "내부 통제와 정합성 검토" },
    facility:    { dept: "시설팀",        roles: ["주임", "대리"], surnames: ["전", "안", "성"], focus: "사옥·장비 유지보수" },
    boss:        { dept: "임원실",        roles: ["임원"],         surnames: ["김", "이", "박"], focus: "전사 의사결정과 보고 검토" },
    approver:    { dept: "결재 라인",     roles: ["부장", "임원"], surnames: ["박", "최", "한"], focus: "결재 승인과 리스크 판단" },
    junior:      { dept: "우리 팀",       roles: ["사원", "주임"], surnames: ["김", "정", "이"], focus: "선임 지시 수행과 자료 정리" },
    pm:          { dept: "PM실",          roles: ["PM"],           surnames: ["오", "윤", "강"], focus: "프로젝트 일정·예산·리스크 관리" },
    site:        { dept: "현장",          roles: ["현장소장", "공사관리"], surnames: ["박", "이", "장"], focus: "현장 진행과 안전 관리" },
    employee:    { dept: "임직원",        roles: ["사원", "대리"], surnames: ["김", "이", "박"], focus: "본인 업무와 행정 요청" },
    client:      { dept: "발주처",        roles: ["담당자", "팀장"], surnames: ["최", "한", "조"], focus: "발주 사양 확정과 진척 확인" },
    partner:     { dept: "협력업체",      roles: ["담당자", "PM"], surnames: ["남", "백", "황"], focus: "납기·품질 약속 이행" },
    vendor:      { dept: "외주사",        roles: ["담당자"],       surnames: ["성", "전", "민"], focus: "외주 산출물 납품" },
    citizen:     { dept: "시민·민원인",   roles: ["민원인"],       surnames: ["김", "이", "박"], focus: "내 문제의 빠른 해결" },
    system:      { dept: "연계 시스템",   roles: ["시스템"],       surnames: [],                focus: "표준 데이터 연계" },
  };

  const NAMES = ["민준", "서연", "예준", "지우", "도윤", "하윤", "주원", "지호", "수아", "은우",
                 "현우", "지윤", "건우", "다은", "지훈", "수빈", "준서", "유나", "성민", "혜원"];

  function pick(arr, seedStr) {
    if (!arr || arr.length === 0) return "";
    let h = 0;
    for (let i = 0; i < seedStr.length; i++) h = (h * 31 + seedStr.charCodeAt(i)) >>> 0;
    return arr[h % arr.length];
  }

  function build(snapshot) {
    const who = snapshot.who[0];
    const pains = snapshot.pain || [];
    const gains = snapshot.gain || [];
    if (!who) return null;

    const profile = WHO_PROFILE[who.id] || { dept: who.label, roles: ["담당자"], surnames: ["김"], focus: "본인 업무" };
    const seed = (snapshot.nickname || "") + who.id;
    const surname = pick(profile.surnames, seed) || "김";
    const given   = pick(NAMES, seed + "_given");
    const role    = pick(profile.roles, seed + "_role");
    const fullName = profile.surnames.length === 0 ? "(시스템)" : `${surname}${given} ${role}`;

    const dept = profile.dept;
    const focus = profile.focus;

    // 하루 시나리오 — Pain을 시점별로 매핑
    const dayParts = [];
    if (pains[0]) dayParts.push(`오전 9시, 첫 업무를 시작하자마자 <b>${escapeHtml(pains[0].label)}</b> 상황을 마주합니다.`);
    if (pains[1]) dayParts.push(`점심 무렵에는 <b>${escapeHtml(pains[1].label)}</b> 때문에 또 시간이 빠져나갑니다.`);
    if (pains[2]) dayParts.push(`오후 늦게, 퇴근 직전인데도 <b>${escapeHtml(pains[2].label)}</b> 이슈가 발목을 잡습니다.`);
    if (dayParts.length === 0) dayParts.push("아직 어떤 불편을 겪는지 카드를 더 골라주세요.");

    // 가장 힘든 순간
    const hardestMoment = pains[0]
      ? `"${escapeHtml(pains[0].label)}" 때문에 <b>${escapeHtml(focus)}</b>에 집중하기 어렵습니다.`
      : `${escapeHtml(focus)}에 집중하고 싶지만 자잘한 일이 너무 많습니다.`;

    // 변화
    const changes = gains.length > 0
      ? gains.map((g) => `<li>${escapeHtml(g.icon)} ${escapeHtml(g.label)}</li>`).join("")
      : "<li>(아직 변화 카드를 안 골랐어요)</li>";

    // 도구가 바꿀 한 줄
    const oneLine = gains[0]
      ? `만약 도구가 <b>"${escapeHtml(gains[0].label)}"</b>를 진짜로 실현해주면, ${escapeHtml(fullName)}의 하루가 정말 달라질 거예요.`
      : `도구가 어떤 변화를 줄지 카드를 더 골라주세요.`;

    return {
      fullName,
      dept,
      focus,
      dayParts,
      hardestMoment,
      changesHtml: changes,
      oneLine,
    };
  }

  function renderInto(container, snapshot) {
    if (!container) return;
    const p = build(snapshot);
    if (!p) {
      container.innerHTML = "";
      return;
    }
    container.innerHTML = `
      <div class="persona-card">
        <div class="persona-header">
          <span class="persona-emoji">👤</span>
          <div>
            <div class="persona-tag">가상 페르소나</div>
            <div class="persona-name">${escapeHtml(p.fullName)} · ${escapeHtml(p.dept)}</div>
            <div class="persona-focus">주된 관심: ${escapeHtml(p.focus)}</div>
          </div>
        </div>

        <div class="persona-section">
          <h4>📅 이 사람의 하루</h4>
          <ul class="persona-day">
            ${p.dayParts.map((s) => `<li>${s}</li>`).join("")}
          </ul>
        </div>

        <div class="persona-section">
          <h4>🥵 가장 힘든 순간</h4>
          <p>${p.hardestMoment}</p>
        </div>

        <div class="persona-section">
          <h4>✨ 도구가 바꿀 변화</h4>
          <ul class="persona-changes">${p.changesHtml}</ul>
          <p class="persona-oneline">${p.oneLine}</p>
        </div>

        <p class="persona-note">💡 실제 그 부서의 사람은 다를 수 있어요. 진짜 인터뷰는 이 시트를 들고 그 사람에게 직접 물어보세요.</p>
      </div>
    `;
  }

  function toMd(snapshot) {
    const p = build(snapshot);
    if (!p) return "";
    const day = p.dayParts.map((s) => "- " + stripHtml(s)).join("\n");
    return `
## 👤 가상 페르소나 시트

**${stripHtml(p.fullName)}** · ${p.dept}
주된 관심: ${p.focus}

### 📅 이 사람의 하루
${day}

### 🥵 가장 힘든 순간
${stripHtml(p.hardestMoment)}

### ✨ 도구가 바꿀 변화
${stripHtml(p.changesHtml).replace(/<\/li>/g, "").replace(/<li>/g, "- ").trim()}

> ${stripHtml(p.oneLine)}
`.trim();
  }

  function stripHtml(s) { return String(s).replace(/<[^>]+>/g, ""); }

  function escapeHtml(s) {
    return String(s).replace(/[<>&"']/g, (c) => ({
      "<":"&lt;",">":"&gt;","&":"&amp;",'"':"&quot;","'":"&apos;"
    }[c]));
  }

  window.Persona = { build, renderInto, toMd };
})();
