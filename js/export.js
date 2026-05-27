// 이 파일의 역할: 완성 작품을 PNG 또는 MD 텍스트로 다운로드 (Yooshin 폰트 임베드)

(function () {
  const fontCache = { medium: null, bold: null };

  async function blobToBase64(blob) {
    return new Promise((res, rej) => {
      const r = new FileReader();
      r.onload = () => res(r.result.split(",")[1]);
      r.onerror = rej;
      r.readAsDataURL(blob);
    });
  }

  async function loadFonts() {
    if (fontCache.medium && fontCache.bold) return;
    try {
      const [m, b] = await Promise.all([
        fetch("assets/fonts/Yooshin-Medium.ttf").then((r) => r.blob()),
        fetch("assets/fonts/Yooshin-Bold.ttf").then((r) => r.blob()),
      ]);
      fontCache.medium = await blobToBase64(m);
      fontCache.bold = await blobToBase64(b);
    } catch (e) { console.warn("폰트 로드 실패:", e); }
  }

  function fontFaceCss() {
    if (!fontCache.medium || !fontCache.bold) return "";
    return `
      @font-face { font-family: "Yooshin"; font-weight: 400; src: url(data:font/ttf;base64,${fontCache.medium}) format("truetype"); }
      @font-face { font-family: "Yooshin"; font-weight: 700; src: url(data:font/ttf;base64,${fontCache.bold}) format("truetype"); }
    `;
  }

  function escapeXml(s) {
    return String(s).replace(/[<>&"']/g, (c) => ({
      "<":"&lt;",">":"&gt;","&":"&amp;",'"':"&quot;","'":"&apos;"
    }[c]));
  }

  const EMOJI_FAMILY = "Apple Color Emoji, Segoe UI Emoji, Noto Color Emoji, Segoe UI Symbol, sans-serif";

  // snapshot { nickname, who, pain, gain, sentence } → SVG string
  function buildSvg(snap) {
    const W = 1000, H = 720;
    const cardH = 90;
    const padX = 40;

    function cardSvg(x, y, w, card, color, bg) {
      if (!card) {
        return `<g transform="translate(${x},${y})">
          <rect width="${w}" height="${cardH}" rx="10" fill="#fdf1d9" stroke="#e8d6b2" stroke-width="2" stroke-dasharray="6 4"/>
          <text x="${w/2}" y="${cardH/2 + 5}" text-anchor="middle" font-family="Yooshin, sans-serif" font-size="13" fill="#7a6850">(빈 슬롯)</text>
        </g>`;
      }
      return `<g transform="translate(${x},${y})">
        <rect width="${w}" height="${cardH}" rx="10" fill="${bg}" stroke="${color}" stroke-width="2"/>
        <text x="${w/2}" y="${cardH/2 - 4}" text-anchor="middle" dominant-baseline="middle" font-size="28" font-family="${EMOJI_FAMILY}">${escapeXml(card.icon)}</text>
        <text x="${w/2}" y="${cardH - 16}" text-anchor="middle" font-family="Yooshin, sans-serif" font-weight="700" font-size="14" fill="#3a2e22">${escapeXml(card.label)}</text>
      </g>`;
    }

    function sectionTitle(x, y, text, color) {
      return `<text x="${x}" y="${y}" font-family="Yooshin, sans-serif" font-weight="700" font-size="14" fill="${color}">${escapeXml(text)}</text>`;
    }

    // Who 카드 1장 (중앙)
    const whoY = 110;
    const whoW = 280;
    const whoX = (W - whoW) / 2;
    const whoSvg = cardSvg(whoX, whoY, whoW, snap.who[0], "#6b8cae", "#e3eaf3");

    // Pain 카드 3장
    const painY = 270;
    const painW = (W - padX * 2 - 20) / 3;
    const painSvg = [0, 1, 2].map((i) =>
      cardSvg(padX + i * (painW + 10), painY, painW, snap.pain[i], "#c45c5c", "#f5dede")
    ).join("");

    // Gain 카드 3장
    const gainY = 410;
    const gainW = painW;
    const gainSvg = [0, 1, 2].map((i) =>
      cardSvg(padX + i * (gainW + 10), gainY, gainW, snap.gain[i], "#5c9e7a", "#def0e5")
    ).join("");

    // 한 문장
    const sentenceY = 545;
    const sentence = snap.sentence || buildAutoSentence(snap);
    // 두 줄로 단순 분리
    const sentLines = sentence.split(/\n|\.(?:\s|$)/).filter(Boolean).map((s) => s.trim() + ".");

    const sentenceSvg = `
      <rect x="${padX}" y="${sentenceY}" width="${W - padX*2}" height="120" rx="12" fill="#fff" stroke="#f3c98b" stroke-width="2"/>
      ${sentLines.map((line, i) => `
        <text x="${W/2}" y="${sentenceY + 40 + i * 32}" text-anchor="middle" font-family="Yooshin, sans-serif" font-size="16" fill="#3a2e22">${escapeXml(line)}</text>
      `).join("")}
    `;

    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}">
      <defs><style>${fontFaceCss()}</style></defs>
      <rect width="${W}" height="${H}" fill="#fff8ec"/>
      <text x="${padX}" y="40" font-family="Yooshin, sans-serif" font-weight="700" font-size="22" fill="#8b5e34">🎯 ${escapeXml(snap.nickname || "익명")}의 고객 발견 결과</text>
      <text x="${padX}" y="62" font-family="Yooshin, sans-serif" font-size="13" fill="#7a6850">내 업무의 진짜 고객 + 그 사람의 불편 + 도구가 줄 변화</text>

      ${sectionTitle(padX, whoY - 10, "👤 Who — 내 업무의 고객", "#6b8cae")}
      ${whoSvg}

      ${sectionTitle(padX, painY - 10, "💢 Pain — 그 사람의 진짜 불편", "#c45c5c")}
      ${painSvg}

      ${sectionTitle(padX, gainY - 10, "🎁 Gain — 내 도구가 줄 변화", "#5c9e7a")}
      ${gainSvg}

      ${sectionTitle(padX, sentenceY - 10, "📝 한 문장 비전", "#8b5e34")}
      ${sentenceSvg}

      <text x="${W - padX}" y="${H - 16}" text-anchor="end" font-family="Yooshin, sans-serif" font-size="11" fill="#7a6850">made with Customer Finder by WhiteJune · AI 활용 2차 TF</text>
    </svg>`;
  }

  function buildAutoSentence(snap) {
    const who = snap.who[0];
    const pains = snap.pain;
    const gains = snap.gain;
    const whoT = who ? `${who.icon} ${who.label}` : "[고객]";
    const painT = pains.length ? pains.map((p) => p.label).join(" · ") : "[불편]";
    const gainT = gains.length ? gains.map((g) => g.label).join(" · ") : "[변화]";
    return `${whoT}은(는) ${painT} 때문에 힘들다.\n내 도구는 ${gainT} 변화를 줄 수 있다.`;
  }

  async function svgToPng(svgStr, filename, scale = 2) {
    await loadFonts();
    const finalSvg = svgStr.includes("@font-face") ? svgStr : svgStr.replace("<defs>", `<defs><style>${fontFaceCss()}</style>`);
    const blob = new Blob([finalSvg], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        const w = img.naturalWidth || 1000;
        const h = img.naturalHeight || 720;
        const canvas = document.createElement("canvas");
        canvas.width = w * scale;
        canvas.height = h * scale;
        const ctx = canvas.getContext("2d");
        ctx.fillStyle = "#fff8ec";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        URL.revokeObjectURL(url);
        canvas.toBlob((pngBlob) => {
          if (!pngBlob) return reject(new Error("PNG 변환 실패"));
          downloadBlob(pngBlob, filename);
          resolve();
        }, "image/png");
      };
      img.onerror = (e) => { URL.revokeObjectURL(url); reject(e); };
      img.src = url;
    });
  }

  function downloadBlob(blob, filename) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  function safeFilename(s) {
    return String(s).replace(/[\/\\:*?"<>|]/g, "_");
  }

  function buildMdText(snap) {
    const who = snap.who[0];
    const pains = snap.pain || [];
    const gains = snap.gain || [];
    const sentence = snap.sentence || buildAutoSentence(snap);
    const date = new Date(snap.createdAt || Date.now());
    return `# 🎯 내 업무 도구의 한 줄 비전

> ${snap.nickname || "익명"} · ${date.toLocaleString("ko-KR")}

## 누구를 위한 도구?

${who ? `**${who.icon} ${who.label}**` : "_(아직 안 골랐어요)_"}

## 그 사람이 지금 겪는 일

${pains.length ? pains.map((p) => `- ${p.icon} ${p.label}`).join("\n") : "_(아직 안 골랐어요)_"}

## 내 도구가 만들 변화

${gains.length ? gains.map((g) => `- ${g.icon} ${g.label}`).join("\n") : "_(아직 안 골랐어요)_"}

---

## 📝 한 문장 비전

> ${sentence.replace(/\n/g, "\n> ")}

---

_made with Customer Finder by WhiteJune · AI 활용 2차 TF_
`;
  }

  function currentSnapshot() {
    const s = window.Slots ? window.Slots.getState() : { who:[], pain:[], gain:[] };
    const nickname = window.Game ? window.Game.getNickname() : "익명";
    const sentence = window.Sentence ? window.Sentence.buildPlainText() : "";
    return { nickname, who: s.who, pain: s.pain, gain: s.gain, sentence, createdAt: new Date().toISOString() };
  }

  async function currentToPng() {
    const snap = currentSnapshot();
    const svg = buildSvg(snap);
    try {
      await svgToPng(svg, `customer_${safeFilename(snap.nickname)}_${Date.now()}.png`);
      if (window.Notify) window.Notify("💾 PNG로 저장했어요!");
    } catch (e) { console.error(e); if (window.Notify) window.Notify("⚠ PNG 변환 실패"); }
  }

  function currentToMd() {
    const snap = currentSnapshot();
    const md = buildMdText(snap);
    const blob = new Blob([md], { type: "text/markdown;charset=utf-8" });
    downloadBlob(blob, `customer_${safeFilename(snap.nickname)}_${Date.now()}.md`);
    if (window.Notify) window.Notify("📝 MD로 저장했어요!");
  }

  async function snapshotToPng(snap) {
    const svg = buildSvg(snap);
    try {
      await svgToPng(svg, `customer_${safeFilename(snap.nickname)}_${Date.now()}.png`);
      if (window.Notify) window.Notify("💾 PNG로 저장했어요!");
    } catch (e) { console.error(e); if (window.Notify) window.Notify("⚠ PNG 변환 실패"); }
  }

  function snapshotToMd(snap) {
    const md = buildMdText(snap);
    const blob = new Blob([md], { type: "text/markdown;charset=utf-8" });
    downloadBlob(blob, `customer_${safeFilename(snap.nickname)}_${Date.now()}.md`);
    if (window.Notify) window.Notify("📝 MD로 저장했어요!");
  }

  async function allToPng() {
    const items = window.Gallery.loadAll();
    if (items.length === 0) {
      if (window.Notify) window.Notify("갤러리에 작품이 없어요.");
      return;
    }
    await loadFonts();
    const cellW = 480, cellH = 280, pad = 24, headerH = 80;
    const cols = Math.min(3, items.length);
    const rows = Math.ceil(items.length / cols);
    const totalW = cols * cellW + (cols + 1) * pad;
    const totalH = rows * cellH + (rows + 1) * pad + headerH;
    const cells = items.map((it, i) => {
      const col = i % cols, row = Math.floor(i / cols);
      const x = pad + col * (cellW + pad);
      const y = headerH + pad + row * (cellH + pad);
      const who = it.who[0] ? `${escapeXml(it.who[0].icon)} ${escapeXml(it.who[0].label)}` : "(고객 없음)";
      const painT = (it.pain || []).map((p) => `${escapeXml(p.icon)} ${escapeXml(p.label)}`).join("  ·  ") || "(없음)";
      const gainT = (it.gain || []).map((g) => `${escapeXml(g.icon)} ${escapeXml(g.label)}`).join("  ·  ") || "(없음)";
      return `<g transform="translate(${x},${y})">
        <rect width="${cellW}" height="${cellH}" rx="10" fill="#fff" stroke="#e8d6b2" stroke-width="2"/>
        <text x="20" y="32" font-family="Yooshin, sans-serif" font-weight="700" font-size="16" fill="#8b5e34">${escapeXml(it.nickname)}</text>
        <text x="20" y="72" font-family="Yooshin, sans-serif" font-weight="700" font-size="13" fill="#6b8cae">👤 ${who}</text>
        <text x="20" y="110" font-family="Yooshin, sans-serif" font-weight="700" font-size="12" fill="#c45c5c">💢 ${painT}</text>
        <text x="20" y="148" font-family="Yooshin, sans-serif" font-weight="700" font-size="12" fill="#5c9e7a">🎁 ${gainT}</text>
        <text x="20" y="${cellH - 20}" font-family="Yooshin, sans-serif" font-size="11" fill="#7a6850">made with Customer Finder by WhiteJune</text>
      </g>`;
    }).join("");
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${totalW} ${totalH}" width="${totalW}" height="${totalH}">
      <defs><style>${fontFaceCss()}</style></defs>
      <rect width="${totalW}" height="${totalH}" fill="#fff8ec"/>
      <text x="${totalW/2}" y="40" text-anchor="middle" font-family="Yooshin, sans-serif" font-weight="700" font-size="26" fill="#8b5e34">🎯 우리 팀의 고객 발견 — 각자 누구를 보고 있을까?</text>
      <text x="${totalW/2}" y="64" text-anchor="middle" font-family="Yooshin, sans-serif" font-size="13" fill="#7a6850">made with Customer Finder by WhiteJune · 작품 ${items.length}개</text>
      ${cells}
    </svg>`;
    try {
      await svgToPng(svg, `customer-finder_갤러리_${Date.now()}.png`, 1.5);
      if (window.Notify) window.Notify("📦 갤러리 전체를 PNG로 저장했어요!");
    } catch (e) { console.error(e); if (window.Notify) window.Notify("⚠ 갤러리 PNG 실패"); }
  }

  window.Export = {
    currentToPng, currentToMd, snapshotToPng, snapshotToMd, allToPng, loadFonts, buildAutoSentence
  };
})();
