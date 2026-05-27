// 이 파일의 역할: Customer Finder 카드 데이터 (Who 10 / Pain 10 / Gain 10 = 30장)

const CARD_CATEGORIES = [
  { id: "who",  label: "👤 Who",   color: "#6b8cae", desc: "내 결과물을 받는 사람 1명" },
  { id: "pain", label: "💢 Pain",  color: "#c45c5c", desc: "그 사람의 불편 3개" },
  { id: "gain", label: "🎁 Gain",  color: "#5c9e7a", desc: "내 도구가 줄 좋은 변화 3개" },
];

const CARDS = [
  // 👤 Who (10) - 결과물을 받는 사람
  { id: "accounting", cat: "who", icon: "🧾", label: "회계팀" },
  { id: "boss",       cat: "who", icon: "📊", label: "상사·임원" },
  { id: "site",       cat: "who", icon: "📦", label: "현장 담당자" },
  { id: "employee",   cat: "who", icon: "👤", label: "임직원" },
  { id: "vendor",     cat: "who", icon: "🏢", label: "외주사" },
  { id: "audit",      cat: "who", icon: "🏛", label: "감사실" },
  { id: "approver",   cat: "who", icon: "💰", label: "결재권자" },
  { id: "facility",   cat: "who", icon: "🔧", label: "시설팀" },
  { id: "citizen",    cat: "who", icon: "📞", label: "민원인" },
  { id: "system",     cat: "who", icon: "🤖", label: "다른 시스템" },

  // 💢 Pain (10) - 고객의 불편
  { id: "slow",       cat: "pain", icon: "⏰", label: "응답이 늦다" },
  { id: "opaque",     cat: "pain", icon: "❓", label: "진행상황 모름" },
  { id: "repeat",     cat: "pain", icon: "🔁", label: "같은 걸 또 물음" },
  { id: "format",     cat: "pain", icon: "📑", label: "양식이 매번 다름" },
  { id: "reject",     cat: "pain", icon: "🚫", label: "반려 사유 불명" },
  { id: "lost",       cat: "pain", icon: "🌀", label: "시작법 모름" },
  { id: "peak",       cat: "pain", icon: "🗓", label: "시즌마다 폭증" },
  { id: "broken",     cat: "pain", icon: "💢", label: "표 형식 깨짐" },
  { id: "copy",       cat: "pain", icon: "🔍", label: "데이터 일일이 옮김" },
  { id: "missing",    cat: "pain", icon: "📎", label: "첨부 누락" },

  // 🎁 Gain (10) - 도구가 줄 변화
  { id: "fast",       cat: "gain", icon: "😊", label: "5분 안에 끝" },
  { id: "onepass",    cat: "gain", icon: "✅", label: "한 번에 통과" },
  { id: "notify",     cat: "gain", icon: "🔔", label: "자동 알림" },
  { id: "uniform",    cat: "gain", icon: "📋", label: "양식이 늘 똑같음" },
  { id: "summary",    cat: "gain", icon: "🎯", label: "핵심만 한눈에" },
  { id: "transparent",cat: "gain", icon: "🪟", label: "진행상황 투명" },
  { id: "noask",      cat: "gain", icon: "🤝", label: "두 번 안 물음" },
  { id: "nolate",     cat: "gain", icon: "📈", label: "월말 야근 ↓" },
  { id: "easy",       cat: "gain", icon: "💡", label: "신규자도 사용" },
  { id: "praise",     cat: "gain", icon: "🏅", label: "상사가 칭찬" },
];

window.CARD_CATEGORIES = CARD_CATEGORIES;
window.CARDS = CARDS;
