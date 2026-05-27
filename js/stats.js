// 이 파일의 역할: 사이드바 슬롯 채움 상태 + 진행률 + 갤러리 카운트 갱신

(function () {
  function refresh() {
    const c = window.Slots ? window.Slots.counts() : { who:0, pain:0, gain:0, total:0, maxTotal:7 };
    set("stat-who", c.who);
    set("stat-pain", c.pain);
    set("stat-gain", c.gain);
    const fill = document.getElementById("progress-fill");
    if (fill) {
      const pct = Math.round((c.total / c.maxTotal) * 100);
      fill.style.width = pct + "%";
    }
    refreshGalleryCount();
  }
  function refreshGalleryCount() {
    const n = window.Gallery ? window.Gallery.count() : 0;
    const el = document.getElementById("gallery-count");
    if (el) el.textContent = n;
  }
  function set(id, val) {
    const el = document.getElementById(id);
    if (el) el.textContent = val;
  }
  window.Stats = { refresh, refreshGalleryCount };
})();
