// 이 파일의 역할: Customer Finder 카드 데이터 (토목설계회사 맥락, Who 21 / Pain 20 / Gain 20 = 61장)

const CARD_CATEGORIES = [
  { id: "who",  label: "👤 Who",   color: "#6b8cae", desc: "내 결과물을 받는 사람 1명" },
  { id: "pain", label: "💢 Pain",  color: "#c45c5c", desc: "그 사람의 불편 3개" },
  { id: "gain", label: "🎁 Gain",  color: "#5c9e7a", desc: "내 도구가 줄 좋은 변화 3개" },
];

const CARDS = [
  // 👤 Who (21) - 토목설계회사 부서·역할
  // 부서
  { id: "accounting",  cat: "who", icon: "🧾", label: "회계팀" },
  { id: "accounting2", cat: "who", icon: "💵", label: "회계부" },
  { id: "planning",    cat: "who", icon: "🗂", label: "기획실" },
  { id: "operation",   cat: "who", icon: "📑", label: "업무부" },
  { id: "general",     cat: "who", icon: "🗃", label: "총무부" },
  { id: "it",          cat: "who", icon: "💻", label: "정보시스템실" },
  { id: "design",      cat: "who", icon: "📐", label: "설계부서" },
  { id: "supervise",   cat: "who", icon: "🔍", label: "감리부서" },
  { id: "audit",       cat: "who", icon: "🏛", label: "감사실" },
  { id: "facility",    cat: "who", icon: "🔧", label: "시설팀" },
  // 사람·역할
  { id: "boss",        cat: "who", icon: "📊", label: "상사·임원" },
  { id: "approver",    cat: "who", icon: "💰", label: "결재권자" },
  { id: "junior",      cat: "who", icon: "🧑‍💼", label: "부하직원" },
  { id: "pm",          cat: "who", icon: "🎯", label: "담당 PM" },
  { id: "site",        cat: "who", icon: "📦", label: "현장 담당자" },
  { id: "employee",    cat: "who", icon: "👤", label: "임직원" },
  // 외부
  { id: "client",      cat: "who", icon: "🏗", label: "발주처" },
  { id: "partner",     cat: "who", icon: "🤝", label: "협력업체" },
  { id: "vendor",      cat: "who", icon: "🏢", label: "외주사" },
  { id: "citizen",     cat: "who", icon: "📞", label: "민원인" },
  // 시스템
  { id: "system",      cat: "who", icon: "🤖", label: "다른 시스템" },

  // 💢 Pain (20) - 토목설계회사 업무 맥락
  // 기존 일반 불편
  { id: "slow",        cat: "pain", icon: "⏰", label: "응답이 늦다" },
  { id: "opaque",      cat: "pain", icon: "❓", label: "진행상황 모름" },
  { id: "repeat",      cat: "pain", icon: "🔁", label: "같은 걸 또 물음" },
  { id: "format",      cat: "pain", icon: "📑", label: "양식이 매번 다름" },
  { id: "reject",      cat: "pain", icon: "🚫", label: "반려 사유 불명" },
  { id: "lost",        cat: "pain", icon: "🌀", label: "시작법 모름" },
  { id: "peak",        cat: "pain", icon: "🗓", label: "시즌마다 폭증" },
  { id: "broken",      cat: "pain", icon: "💢", label: "표 형식 깨짐" },
  { id: "copy",        cat: "pain", icon: "🔍", label: "데이터 일일이 옮김" },
  { id: "missing",     cat: "pain", icon: "📎", label: "첨부 누락" },
  // 토목설계회사 특화 불편 (신규 10개)
  { id: "drawing_ver", cat: "pain", icon: "📐", label: "도면 버전이 헷갈림" },
  { id: "change_freq", cat: "pain", icon: "🔄", label: "설계 변경이 잦음" },
  { id: "estimate",    cat: "pain", icon: "💸", label: "견적·원가 산정 오래" },
  { id: "permit",      cat: "pain", icon: "📜", label: "인허가 절차 복잡" },
  { id: "site_gap",    cat: "pain", icon: "🏗", label: "현장-사무실 단절" },
  { id: "duplicate",   cat: "pain", icon: "🔀", label: "여러 명이 중복 작업" },
  { id: "meeting",     cat: "pain", icon: "📌", label: "회의 결정사항 추적 안 됨" },
  { id: "approval",    cat: "pain", icon: "🐢", label: "결재 라인 길어 느림" },
  { id: "search",      cat: "pain", icon: "🗄", label: "자료 검색이 어려움" },
  { id: "handover",    cat: "pain", icon: "📚", label: "신입 인수인계 힘듦" },

  // 🎁 Gain (20) - 도구가 줄 변화
  // 기존 일반
  { id: "fast",        cat: "gain", icon: "😊", label: "5분 안에 끝" },
  { id: "onepass",     cat: "gain", icon: "✅", label: "한 번에 통과" },
  { id: "notify",      cat: "gain", icon: "🔔", label: "자동 알림" },
  { id: "uniform",     cat: "gain", icon: "📋", label: "양식이 늘 똑같음" },
  { id: "summary",     cat: "gain", icon: "🎯", label: "핵심만 한눈에" },
  { id: "transparent", cat: "gain", icon: "🪟", label: "진행상황 투명" },
  { id: "noask",       cat: "gain", icon: "🤝", label: "두 번 안 물음" },
  { id: "nolate",      cat: "gain", icon: "📈", label: "월말 야근 ↓" },
  { id: "easy",        cat: "gain", icon: "💡", label: "초보자도 사용 가능" },
  { id: "praise",      cat: "gain", icon: "🏅", label: "상사가 칭찬" },
  // 토목설계회사 특화 변화 (신규 10개)
  { id: "drawing_auto",cat: "gain", icon: "📐", label: "도면 버전 자동 관리" },
  { id: "estimate_5m", cat: "gain", icon: "⚡", label: "견적 5분에 산정" },
  { id: "search_1s",   cat: "gain", icon: "🔎", label: "자료 1초만에 검색" },
  { id: "talk_fast",   cat: "gain", icon: "💬", label: "부서 간 소통 빨라짐" },
  { id: "less_ot",     cat: "gain", icon: "🌙", label: "야근 50% 감소" },
  { id: "day1_use",    cat: "gain", icon: "🎓", label: "신입도 첫날부터 활용" },
  { id: "no_memory",   cat: "gain", icon: "🧠", label: "머릿속에 안 담아도 됨" },
  { id: "no_mistake",  cat: "gain", icon: "🎯", label: "실수 0건 (체크리스트)" },
  { id: "quality",     cat: "gain", icon: "✨", label: "결과물 품질 일정" },
  { id: "decide_fast", cat: "gain", icon: "🚀", label: "결정이 빨라짐" },
];

window.CARD_CATEGORIES = CARD_CATEGORIES;
window.CARDS = CARDS;
