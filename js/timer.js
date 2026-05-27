// 이 파일의 역할: 카운트다운 타이머 (시작/일시정지/리셋) — draw-toast 패턴 재사용

(function () {
  const state = {
    duration: 1200,
    remaining: 1200,
    intervalId: null,
    running: false,
  };

  function fmt(s) {
    if (s == null || s < 0) return "--:--";
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
  }

  function render() {
    const el = document.getElementById("timer-display");
    if (el) el.textContent = state.duration === 0 ? "OFF" : fmt(state.remaining);
    const btn = document.getElementById("timer-toggle");
    if (btn) btn.textContent = state.running ? "일시정지" : "시작";
  }

  function tick() {
    state.remaining -= 1;
    if (state.remaining <= 0) {
      state.remaining = 0;
      pause();
      render();
      if (window.Notify) window.Notify("⏰ 시간 끝! '완성!' 버튼을 눌러 갤러리에 저장하세요.");
      return;
    }
    render();
  }

  function start() {
    if (state.duration === 0) return;
    if (state.running) return;
    if (state.remaining <= 0) state.remaining = state.duration;
    state.running = true;
    state.intervalId = setInterval(tick, 1000);
    render();
  }

  function pause() {
    state.running = false;
    if (state.intervalId) clearInterval(state.intervalId);
    state.intervalId = null;
    render();
  }

  function toggle() {
    if (state.running) pause();
    else start();
  }

  function reset() {
    pause();
    state.remaining = state.duration;
    render();
  }

  function setDuration(secs) {
    state.duration = secs;
    state.remaining = secs;
    render();
  }

  function init() {
    const t = document.getElementById("timer-toggle");
    const r = document.getElementById("timer-reset");
    if (t) t.addEventListener("click", toggle);
    if (r) r.addEventListener("click", reset);
    render();
  }

  window.Timer = { init, start, pause, reset, setDuration };
})();
