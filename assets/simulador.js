/* ==========================================================================
   Semillero de Programación Competitiva · Universidad EIA
   Motor de Simuladores Interactivos Paso a Paso (Semanas 01 a 16)
   Funciona 100% offline (file:// y http://), sin dependencias externas.
   ========================================================================== */
(function (global) {
  "use strict";

  const esc = s => String(s ?? "").replace(/[&<>"']/g, c => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  }[c]));

  const parseNumsDetailed = (str, maxLen, minVal, maxVal) => {
    const rawTokens = String(str ?? "").trim().split(/[\s,;]+/).filter(Boolean);
    const nums = [];
    let invalid = 0;
    let clamped = 0;
    let truncated = 0;
    for (const tok of rawTokens) {
      const n = Number(tok);
      if (!Number.isFinite(n)) { invalid++; continue; }
      if (nums.length >= maxLen) { truncated++; continue; }
      let v = Math.round(n);
      const before = v;
      if (minVal !== undefined) v = Math.max(minVal, v);
      if (maxVal !== undefined) v = Math.min(maxVal, v);
      if (v !== before) clamped++;
      nums.push(v);
    }
    return { nums, invalid, clamped, truncated };
  };

  const parseNums = (str, maxLen, minVal, maxVal) => parseNumsDetailed(str, maxLen, minVal, maxVal).nums;

  const toFinite = (val, fallback) => {
    if (val === "" || val === null || val === undefined) return fallback;
    const n = Number(val);
    return Number.isFinite(n) ? n : fallback;
  };

  const COMP_COLORS = ["var(--sim-cyan)", "var(--sim-green)", "var(--sim-amber)", "var(--sim-purple)", "var(--sim-red)", "var(--sim-blue)"];

  // ========================================================================
  // DEFINICIÓN DE LOS 16 SIMULADORES (SEMANAS 01 – 16)
  // ========================================================================
  const SIMS = {};

  // ------------------------------------------------------------------------
  // SEMANA 01 · UVa 573 — The Snail (Simulación Ad Hoc)
  // ------------------------------------------------------------------------
  SIMS[1] = {
    title: "UVa 573 — The Snail (Simulación paso a paso)",
    code: [
      "fatigue = U * (F / 100.0); height = 0; climb = U;",
      "while (true) {",
      "  day++;",
      "  if (climb > 0) height += climb;  // (1) Subir de día",
      "  if (height > H) return SUCCESS;  // (2) ¿Salió del pozo?",
      "  height -= D;                     // (3) Resbalar de noche",
      "  if (height < 0) return FAILURE;  // (4) ¿Cayó al fondo?",
      "  climb = max(0.0, climb - fatigue);",
      "}"
    ],
    tableHeaders: ["Paso", "Día", "Fase", "Altura", "Ascenso sig.", "Verificación"],
    fields: [
      { id: "H", label: "H (pozo)", type: "number", min: 1, max: 100, step: 1 },
      { id: "U", label: "U (sube)", type: "number", min: 1, max: 50, step: 1 },
      { id: "D", label: "D (resbala)", type: "number", min: 0, max: 50, step: 1 },
      { id: "F", label: "F (% fatiga)", type: "number", min: 0, max: 100, step: 1 }
    ],
    presets: [
      { label: "Ejemplo clase (6, 3, 1, 10%)", values: { H: 6, U: 3, D: 1, F: 10 } },
      { label: "Trampa borde (1, 1, 1, 1%)", values: { H: 1, U: 1, D: 1, F: 1 } },
      { label: "Fallo día 4 (10, 2, 1, 50%)", values: { H: 10, U: 2, D: 1, F: 50 } }
    ],
    build(v) {
      const H = Math.max(1, toFinite(v.H, 6));
      const U = Math.max(0.1, toFinite(v.U, 3));
      const D = Math.max(0, toFinite(v.D, 1));
      const F = Math.max(0, Math.min(100, toFinite(v.F, 10)));
      const fat = U * (F / 100);
      const fmt = x => Number(x).toFixed(2);
      const steps = [];
      let h = 0, climb = U, day = 0;

      steps.push({
        badge: "Inicio",
        title: "Estado inicial en el fondo del pozo",
        explain: `Pozo de altura <code>H = ${H}</code>. La fatiga es fija: <code>Δ = U × F% = ${fmt(U)} × ${F}% = ${fmt(fat)}</code> pies menos cada día (no porcentual sobre el día previo).`,
        line: 0,
        vars: [{ k: "H", v: fmt(H) }, { k: "Δ fatiga", v: fmt(fat) }, { k: "height", v: "0.00" }, { k: "climb", v: fmt(climb) }],
        row: ["Init", "0", "Inicio", "0.00", fmt(climb), "En el fondo (h = 0)"],
        vis: { H, h: 0, prevH: 0, phase: "init", day: 0, climb, fat, status: "run" }
      });

      const MAX_DAYS = 25;
      while (day < MAX_DAYS) {
        day++;
        const startH = h;
        const gain = climb > 0 ? climb : 0;
        h = startH + gain;
        const won = h > H + 1e-12;
        steps.push({
          badge: won ? `Día ${day} · ÉXITO ★` : `Día ${day} · Subida`,
          badgeCls: won ? "ok" : "",
          title: won ? `¡El caracol sale del pozo el día ${day}!` : `Día ${day} (de día): sube ${fmt(gain)} pies`,
          explain: won
            ? `Sube desde <code>${fmt(startH)}</code> hasta <code>${fmt(h)}</code>. Como <b><code>${fmt(h)} &gt; ${fmt(H)}</code></b> (estrictamente mayor), termina con <b>success on day ${day}</b>.`
            : `Sube desde <code>${fmt(startH)}</code> + <code>${fmt(gain)}</code> = <code>${fmt(h)}</code>. ¿Es <code>${fmt(h)} &gt; ${fmt(H)}</code>? <b>No</b>${Math.abs(h - H) < 1e-9 ? " (¡estar exactamente en H aún NO cuenta como salir!)" : ""}.`,
          line: won ? 4 : 3,
          vars: [
            { k: "day", v: day },
            { k: "height", v: fmt(h), cls: won ? "ok" : "" },
            { k: "subió", v: "+" + fmt(gain) },
            { k: "¿> H?", v: won ? "SÍ ★" : "No", cls: won ? "ok" : "" }
          ],
          row: [`${day}a`, String(day), "Subida (+)", `${fmt(startH)} → ${fmt(h)}`, fmt(climb), won ? `Sí (> ${H}) → Éxito ★` : `No (≤ ${H})`],
          vis: { H, h, prevH: startH, phase: "up", day, climb, fat, gain, status: won ? "win" : "run" }
        });
        if (won) break;

        const afterUp = h;
        h = afterUp - D;
        const lost = h < -1e-12;
        const nextClimb = Math.max(0, climb - fat);
        steps.push({
          badge: lost ? `Día ${day} · FALLO ✕` : `Día ${day} · Noche`,
          badgeCls: lost ? "bad" : "warn",
          title: lost ? `El caracol cae por debajo del fondo el día ${day}` : `Día ${day} (de noche): resbala −${fmt(D)} pies`,
          explain: lost
            ? `Resbala de <code>${fmt(afterUp)}</code> a <code>${fmt(h)}</code>. Como <b><code>${fmt(h)} &lt; 0</code></b> (estrictamente menor), termina con <b>failure on day ${day}</b>.`
            : `Resbala de <code>${fmt(afterUp)}</code> − <code>${fmt(D)}</code> = <code>${fmt(h)}</code>. ¿Es <code>&lt; 0</code>? <b>No</b>${Math.abs(h) < 1e-9 ? " (h = 0.00 aún NO falla)" : ""}. Nuevo ascenso para mañana: <code>max(0, ${fmt(climb)} − ${fmt(fat)}) = ${fmt(nextClimb)}</code>.`,
          line: lost ? 6 : 7,
          vars: [
            { k: "day", v: day },
            { k: "height", v: fmt(h), cls: lost ? "bad" : "" },
            { k: "resbaló", v: "-" + fmt(D), cls: "warn" },
            { k: "climb sig.", v: fmt(nextClimb) }
          ],
          row: [`${day}b`, String(day), "Noche (−)", `${fmt(afterUp)} → ${fmt(h)}`, fmt(nextClimb), lost ? "Sí (< 0) → Fallo" : "No (≥ 0)"],
          vis: { H, h, prevH: afterUp, phase: "down", day, climb: nextClimb, fat, slip: D, status: lost ? "lose" : "run" }
        });
        if (lost) break;
        climb = nextClimb;
      }
      if (day >= MAX_DAYS && steps[steps.length - 1].vis.status === "run") {
        steps.push({
          badge: "Límite visual",
          badgeCls: "warn",
          title: `Simulación truncada en el día ${MAX_DAYS}`,
          explain: "Se muestran los primeros 25 días para mantener la visualización ágil. Prueba un valor menor de H o mayor de U.",
          line: 1,
          vars: [{ k: "day", v: day }, { k: "height", v: fmt(h) }],
          row: ["...", String(day), "Pausa", fmt(h), fmt(climb), "Continúa..."],
          vis: { H, h, prevH: h, phase: "init", day, climb, fat, status: "run" }
        });
      }
      return { steps, note: `Orden obligatorio en cada día: (1) subir, (2) comprobar > H, (3) resbalar −D, (4) comprobar < 0, (5) aplicar fatiga fija Δ = ${fmt(fat)}.` };
    },
    render(step) {
      const { H, h, prevH, phase, day, climb, fat, status } = step.vis;
      const maxY = Math.max(H * 1.18, h + 0.5, 1.4);
      const minY = Math.min(-0.6, h - 0.3);
      const svgH = 225, topPad = 24, botPad = 24;
      const toY = val => topPad + (maxY - val) / (maxY - minY) * (svgH - topPad - botPad);
      const yTop = toY(H), yZero = toY(0), yCur = toY(h), yPrev = toY(prevH);
      const wellX = 115, wellW = 140;
      const snailColor = status === "win" ? "var(--sim-green)" : status === "lose" ? "var(--sim-red)" : "var(--sim-cyan)";
      const ticks = [0, H * 0.25, H * 0.5, H * 0.75, H].map(t => ({ v: t, y: toY(t) }));

      return `<svg viewBox="0 0 460 ${svgH}" width="460" height="${svgH}" role="img" aria-label="Simulación visual del pozo del caracol">
        <defs>
          <marker id="arr-up" viewBox="0 0 10 10" refX="7" refY="5" markerWidth="6" markerHeight="6" orient="auto">
            <path d="M0,1 L9,5 L0,9 z" fill="var(--sim-green)"/>
          </marker>
          <marker id="arr-dn" viewBox="0 0 10 10" refX="7" refY="5" markerWidth="6" markerHeight="6" orient="auto">
            <path d="M0,1 L9,5 L0,9 z" fill="var(--sim-amber)"/>
          </marker>
        </defs>
        <!-- Paredes del pozo -->
        <rect x="${wellX}" y="${yTop}" width="${wellW}" height="${Math.max(4, yZero - yTop)}" fill="var(--surface)" stroke="var(--line)" stroke-width="2" rx="6"/>
        <!-- Zona de éxito (> H) -->
        <line x1="${wellX - 24}" y1="${yTop}" x2="${wellX + wellW + 24}" y2="${yTop}" stroke="var(--sim-green)" stroke-width="2" stroke-dasharray="5 4"/>
        <text x="${wellX + wellW + 28}" y="${yTop + 4}" fill="var(--pos)" font-size="11" font-weight="700" font-family="var(--f-mono)">Meta &gt; ${H}</text>
        <!-- Fondo (0) -->
        <line x1="${wellX - 24}" y1="${yZero}" x2="${wellX + wellW + 24}" y2="${yZero}" stroke="var(--sim-red)" stroke-width="2"/>
        <text x="${wellX + wellW + 28}" y="${yZero + 4}" fill="var(--neg)" font-size="11" font-weight="700" font-family="var(--f-mono)">Fondo (&lt; 0)</text>
        <!-- Regla vertical -->
        ${ticks.map(t => `<line x1="${wellX - 8}" y1="${t.y}" x2="${wellX}" y2="${t.y}" stroke="var(--ink-3)" stroke-width="1.2"/>
          <text x="${wellX - 12}" y="${t.y + 4}" text-anchor="end" fill="var(--ink-3)" font-size="10" font-family="var(--f-mono)">${t.v.toFixed(1)}</text>`).join("")}
        <!-- Flecha de movimiento -->
        ${phase === "up" && Math.abs(yPrev - yCur) > 3 ? `<line x1="${wellX + 34}" y1="${yPrev}" x2="${wellX + 34}" y2="${yCur + 4}" stroke="var(--sim-green)" stroke-width="3" marker-end="url(#arr-up)"/>` : ""}
        ${phase === "down" && Math.abs(yPrev - yCur) > 3 ? `<line x1="${wellX + wellW - 34}" y1="${yPrev}" x2="${wellX + wellW - 34}" y2="${yCur - 4}" stroke="var(--sim-amber)" stroke-width="3" marker-end="url(#arr-dn)"/>` : ""}
        <!-- Posición previa fantasma -->
        ${phase !== "init" ? `<circle cx="${wellX + wellW / 2}" cy="${yPrev}" r="7" fill="none" stroke="var(--ink-3)" stroke-dasharray="3 2" opacity="0.6"/>` : ""}
        <!-- Caracol actual -->
        <circle cx="${wellX + wellW / 2}" cy="${yCur}" r="14" fill="${snailColor}" stroke="var(--surface)" stroke-width="2.5"/>
        <text x="${wellX + wellW / 2}" y="${yCur + 4}" text-anchor="middle" fill="var(--sim-on-fill)" font-size="11" font-weight="800" font-family="var(--f-mono)">${h.toFixed(2)}</text>
        <!-- Panel informativo derecho -->
        <rect x="330" y="24" width="120" height="170" rx="10" fill="var(--surface)" stroke="var(--line)"/>
        <text x="342" y="45" fill="var(--ink-3)" font-size="10" font-weight="700" font-family="var(--f-head)">ESTADO DÍA ${day}</text>
        <text x="342" y="68" fill="var(--ink)" font-size="12" font-weight="700" font-family="var(--f-mono)">h = ${h.toFixed(2)}</text>
        <text x="342" y="90" fill="var(--ink-2)" font-size="11" font-family="var(--f-mono)">climb = ${climb.toFixed(2)}</text>
        <text x="342" y="110" fill="var(--ink-3)" font-size="10.5" font-family="var(--f-mono)">Δ = −${fat.toFixed(2)}/día</text>
        <text x="342" y="138" fill="var(--ink-3)" font-size="10" font-weight="700" font-family="var(--f-head)">FASE</text>
        <rect x="342" y="146" width="96" height="26" rx="6" fill="${status === "win" ? "rgba(80,175,77,.18)" : status === "lose" ? "rgba(179,38,30,.15)" : "var(--chip)"}"/>
        <text x="390" y="163" text-anchor="middle" fill="${status === "win" ? "var(--pos)" : status === "lose" ? "var(--neg)" : "var(--accent)"}" font-size="11" font-weight="700" font-family="var(--f-mono)">${status === "win" ? "ÉXITO ★" : status === "lose" ? "FALLO ✕" : phase === "up" ? "☀ DÍA (+)" : phase === "down" ? "☾ NOCHE (−)" : "INICIO"}</text>
      </svg>`;
    }
  };

  // ------------------------------------------------------------------------
  // SEMANA 02 · UVa 11413 — Fill the Containers (Búsqueda Binaria en Respuesta)
  // ------------------------------------------------------------------------
  SIMS[2] = {
    title: "UVa 11413 — Búsqueda Binaria sobre la Respuesta (BSTA)",
    code: [
      "lo = max(c); hi = sum(c);",
      "while (lo < hi) {",
      "  mid = lo + (hi - lo) / 2;",
      "  if (canFill(c, m, mid))  // greedy O(n)",
      "    hi = mid;              // sí alcanza: probar menor",
      "  else",
      "    lo = mid + 1;          // no alcanza: subir capacidad",
      "}",
      "return lo;"
    ],
    tableHeaders: ["Paso", "[lo, hi]", "mid", "Partición voraz", "Usados", "¿≤ m?", "Acción"],
    fields: [
      { id: "c", label: "Recipientes c[]", type: "text", width: "170px" },
      { id: "m", label: "Contenedores m", type: "number", min: 1, max: 10, step: 1 }
    ],
    presets: [
      { label: "Clase ([1,2,3,4,5], m=3)", values: { c: "1, 2, 3, 4, 5", m: 3 } },
      { label: "Sample 2 ([4,78,9], m=2)", values: { c: "4, 78, 9", m: 2 } },
      { label: "Split ([7,2,5,10,8], m=2)", values: { c: "7, 2, 5, 10, 8", m: 2 } }
    ],
    build(v) {
      let arr = parseNums(v.c, 10, 1, 999);
      if (!arr.length) arr = [1, 2, 3, 4, 5];
      const m = Math.max(1, Math.min(arr.length + 2, Number(v.m) || 3));
      const minLo = Math.max(...arr), maxHi = arr.reduce((a, b) => a + b, 0);
      let lo = minLo, hi = maxHi;
      const steps = [];

      const pack = cap => {
        const bins = [[]];
        let cur = 0;
        for (const x of arr) {
          if (cur + x > cap) { bins.push([x]); cur = x; }
          else { bins[bins.length - 1].push(x); cur += x; }
        }
        return bins;
      };

      steps.push({
        badge: "Inicio",
        title: `Rango inicial [${lo}, ${hi}]`,
        explain: `Ningún contenedor puede tener capacidad menor al recipiente más grande (<code>lo = max(c) = ${lo}</code>). Con 1 solo contenedor basta <code>hi = sum(c) = ${hi}</code>.`,
        line: 0,
        vars: [{ k: "lo", v: lo }, { k: "hi", v: hi }, { k: "m", v: m }],
        row: ["Init", `[${lo}, ${hi}]`, "—", "Pendiente", "—", "—", "Rango inicial"],
        vis: { minLo, maxHi, lo, hi, mid: null, bins: [], m, ok: null, done: false }
      });

      let k = 0;
      while (lo < hi && k < 25) {
        k++;
        const mid = lo + Math.floor((hi - lo) / 2);
        const bins = pack(mid);
        const ok = bins.length <= m;
        const partStr = bins.map(b => `[${b.join(",")}]`).join(" | ");
        const nextLo = ok ? lo : mid + 1;
        const nextHi = ok ? mid : hi;

        steps.push({
          badge: `Paso ${k} · mid = ${mid}`,
          badgeCls: ok ? "ok" : "bad",
          title: ok ? `Capacidad ${mid} SÍ alcanza (${bins.length} ≤ ${m} contenedores)` : `Capacidad ${mid} NO alcanza (${bins.length} > ${m} contenedores)`,
          explain: ok
            ? `Empacando vorazmente con límite <code>${mid}</code> usamos <b>${bins.length}</b> contenedores (≤ ${m}). Como es factible, probamos si existe una capacidad aún menor: <code>hi = ${mid}</code> → <code>[${nextLo}, ${nextHi}]</code>.`
            : `Empacando vorazmente con límite <code>${mid}</code> necesitamos <b>${bins.length}</b> contenedores (> ${m}). Debemos aumentar la capacidad mínima: <code>lo = ${mid} + 1 = ${nextLo}</code> → <code>[${nextLo}, ${nextHi}]</code>.`,
          line: ok ? 4 : 6,
          vars: [
            { k: "[lo,hi]", v: `[${lo},${hi}]` },
            { k: "mid", v: mid },
            { k: "usados", v: `${bins.length} / ${m}`, cls: ok ? "ok" : "bad" },
            { k: "nuevo", v: `[${nextLo},${nextHi}]` }
          ],
          row: [String(k), `[${lo}, ${hi}]`, String(mid), partStr, String(bins.length), ok ? "Sí" : "No", `[${nextLo}, ${nextHi}]`],
          vis: { minLo, maxHi, lo, hi, mid, bins, m, ok, done: false }
        });
        lo = nextLo; hi = nextHi;
      }

      const finalBins = pack(lo);
      steps.push({
        badge: `Resultado · Ans = ${lo} ★`,
        badgeCls: "ok",
        title: `Convergencia: lo == hi == ${lo}`,
        explain: `En solo <b>${k}</b> evaluaciones hallamos la capacidad mínima óptima <b><code>${lo}</code></b>. Partición óptima: ${finalBins.map(b => `<code>[${b.join("+")}=${b.reduce((a, x) => a + x, 0)}]</code>`).join(" ")}.`,
        line: 8,
        vars: [{ k: "Respuesta", v: lo, cls: "ok" }, { k: "Evaluaciones", v: k }],
        row: ["Fin", `[${lo}, ${lo}]`, String(lo), finalBins.map(b => `[${b.join(",")}]`).join(" | "), String(finalBins.length), "Óptimo ★", `Ans = ${lo}`],
        vis: { minLo, maxHi, lo, hi: lo, mid: lo, bins: finalBins, m, ok: true, done: true }
      });

      return { steps, note: `Monotonía F F ... F V V ... V: el primer valor donde canFill(cap) es verdadero se halla en O(n log(∑c)).` };
    },
    render(step) {
      const { minLo, maxHi, lo, hi, mid, bins, m, ok, done } = step.vis;
      const span = Math.max(1, maxHi - minLo);
      const toX = val => 36 + ((val - minLo) / span) * 388;
      const xLo = toX(lo), xHi = toX(hi), xMid = mid !== null ? toX(mid) : null;

      const svg = `<svg viewBox="0 0 460 88" width="460" height="88" role="img" aria-label="Intervalo de búsqueda binaria">
        <line x1="36" y1="44" x2="424" y2="44" stroke="var(--line)" stroke-width="6" stroke-linecap="round"/>
        <line x1="${xLo}" y1="44" x2="${xHi}" y2="44" stroke="${done ? "var(--sim-green)" : "var(--sim-cyan)"}" stroke-width="8" stroke-linecap="round"/>
        <circle cx="${xLo}" cy="44" r="6" fill="var(--accent)"/>
        <text x="${xLo}" y="72" text-anchor="middle" fill="var(--ink-2)" font-size="11" font-weight="700" font-family="var(--f-mono)">lo=${lo}</text>
        ${hi !== lo ? `<circle cx="${xHi}" cy="44" r="6" fill="var(--accent)"/>
          <text x="${xHi}" y="72" text-anchor="middle" fill="var(--ink-2)" font-size="11" font-weight="700" font-family="var(--f-mono)">hi=${hi}</text>` : ""}
        ${xMid !== null ? `<circle cx="${xMid}" cy="44" r="9" fill="${ok ? "var(--sim-green)" : "var(--sim-red)"}" stroke="var(--surface)" stroke-width="2"/>
          <text x="${xMid}" y="22" text-anchor="middle" fill="${ok ? "var(--pos)" : "var(--neg)"}" font-size="12" font-weight="800" font-family="var(--f-mono)">mid=${mid}</text>` : ""}
        <text x="36" y="16" fill="var(--ink-3)" font-size="9.5" font-family="var(--f-mono)">${minLo}</text>
        <text x="424" y="16" text-anchor="end" fill="var(--ink-3)" font-size="9.5" font-family="var(--f-mono)">${maxHi}</text>
      </svg>`;

      const binsHtml = bins.length ? `<div class="sim-bins">${bins.map((b, i) => {
        const s = b.reduce((a, x) => a + x, 0);
        const pct = Math.min(100, Math.round((s / Math.max(1, mid)) * 100));
        const over = i >= m;
        return `<div class="sim-bin ${over ? "over" : "ok"}">
          <div class="sim-bin-h"><span>Cont. #${i + 1}${over ? " (!)" : ""}</span><b>${s}/${mid}</b></div>
          <div class="sim-bin-bar"><i style="width:${pct}%"></i></div>
          <div class="sim-bin-items">${b.map(x => `<span>${x}</span>`).join("")}</div>
        </div>`;
      }).join("")}</div>` : `<div class="small muted" style="text-align:center;margin-top:8px;">Presiona <b>Siguiente ▶</b> para probar el primer <code>mid</code>.</div>`;

      return svg + binsHtml;
    }
  };

  // ------------------------------------------------------------------------
  // SEMANA 03 · UVa 10107 — Dos Heaps para Mediana Dinámica
  // ------------------------------------------------------------------------
  SIMS[3] = {
    title: "UVa 10107 — Mediana Dinámica con Dos Heaps (lo / hi)",
    code: [
      "for (x : stream) {",
      "  if (lo.empty() || x <= lo.top()) lo.push(x); // max-heap",
      "  else hi.push(x);                              // min-heap",
      "  if (lo.size() > hi.size() + 1) move(lo -> hi);",
      "  else if (hi.size() > lo.size()) move(hi -> lo);",
      "  med = (lo.size() > hi.size()) ? lo.top()",
      "        : (lo.top() + hi.top()) / 2;",
      "}"
    ],
    tableHeaders: ["Paso", "Entrada x", "lo (max-heap)", "hi (min-heap)", "Balanceo", "Mediana"],
    fields: [
      { id: "seq", label: "Secuencia", type: "text", width: "210px" }
    ],
    presets: [
      { label: "Sample UVa (1,3,4,60,70,50,2)", values: { seq: "1, 3, 4, 60, 70, 50, 2" } },
      { label: "Descendente (10,8,6,4,2)", values: { seq: "10, 8, 6, 4, 2" } },
      { label: "Duplicados (5,1,5,9,3,5)", values: { seq: "5, 1, 5, 9, 3, 5" } }
    ],
    build(v) {
      let seq = parseNums(v.seq, 12, -999, 9999);
      if (!seq.length) seq = [1, 3, 4, 60, 70, 50, 2];
      // Real binary heaps
      const pushHeap = (h, val, isMax) => {
        h.push(val);
        let i = h.length - 1;
        while (i > 0) {
          const p = (i - 1) >> 1;
          if (isMax ? h[i] > h[p] : h[i] < h[p]) { [h[i], h[p]] = [h[p], h[i]]; i = p; }
          else break;
        }
      };
      const popHeap = (h, isMax) => {
        const top = h[0], last = h.pop();
        if (h.length) {
          h[0] = last;
          let i = 0;
          while (true) {
            let l = 2 * i + 1, r = 2 * i + 2, best = i;
            if (l < h.length && (isMax ? h[l] > h[best] : h[l] < h[best])) best = l;
            if (r < h.length && (isMax ? h[r] > h[best] : h[r] < h[best])) best = r;
            if (best !== i) { [h[i], h[best]] = [h[best], h[i]]; i = best; }
            else break;
          }
        }
        return top;
      };

      const lo = [], hi = [], steps = [];
      steps.push({
        badge: "Inicio",
        title: "Heaps vacíos — Invariante de dos mitades",
        explain: "<code>lo</code> (max-heap) guarda la mitad menor y <code>hi</code> (min-heap) la mitad mayor. Mantendremos siempre <code>|lo| == |hi|</code> o <code>|lo| == |hi| + 1</code>.",
        line: 0,
        vars: [{ k: "|lo|", v: 0 }, { k: "|hi|", v: 0 }, { k: "Mediana", v: "—" }],
        row: ["Init", "—", "[]", "[]", "—", "—"],
        vis: { seq, idx: -1, lo: [], hi: [], med: null, moved: null, inserted: null }
      });

      seq.forEach((x, idx) => {
        const toLo = lo.length === 0 || x <= lo[0];
        if (toLo) pushHeap(lo, x, true);
        else pushHeap(hi, x, false);

        let moved = null;
        if (lo.length > hi.length + 1) {
          const m = popHeap(lo, true); pushHeap(hi, m, false);
          moved = `${m}: lo → hi`;
        } else if (hi.length > lo.length) {
          const m = popHeap(hi, false); pushHeap(lo, m, true);
          moved = `${m}: hi → lo`;
        }
        const odd = lo.length > hi.length;
        const med = odd ? lo[0] : Math.floor((lo[0] + hi[0]) / 2);
        const medFormula = odd ? `${lo[0]} (tope lo)` : `⌊(${lo[0]} + ${hi[0]}) / 2⌋ = ${med}`;

        steps.push({
          badge: `Paso ${idx + 1} · x = ${x}`,
          badgeCls: moved ? "warn" : "ok",
          title: `Entra ${x} → Mediana = ${med}`,
          explain: `Como ${toLo ? `<code>${x} ≤ tope(lo)</code>` : `<code>${x} &gt; tope(lo)</code>`}, entra en <b>${toLo ? "lo (max-heap)" : "hi (min-heap)"}</b>.${moved ? ` Se reequilibra moviendo <code>${moved}</code>.` : " Los tamaños ya cumplen el invariante."} Mediana entera: <b><code>${medFormula}</code></b>.`,
          line: moved ? (moved.includes("lo → hi") ? 3 : 4) : (odd ? 5 : 6),
          vars: [
            { k: "entra", v: x },
            { k: "top(lo)", v: lo[0] ?? "—" },
            { k: "top(hi)", v: hi[0] ?? "—" },
            { k: "Mediana", v: med, cls: "ok" }
          ],
          row: [String(idx + 1), String(x), `[${lo.join(", ")}]`, `[${hi.join(", ")}]`, moved || "Balanceado", String(med)],
          vis: { seq, idx, lo: [...lo], hi: [...hi], med, moved, inserted: x, odd }
        });
      });

      return { steps, note: "Cada inserción y balanceo cuesta O(log N) gracias a los heaps; consultar la mediana es O(1) leyendo las raíces." };
    },
    render(step) {
      const { seq, idx, lo, hi, med, moved, odd } = step.vis;
      const drawTree = (arr, cx, title, accent, isRootUsed) => {
        if (!arr.length) return `<text x="${cx}" y="30" text-anchor="middle" fill="var(--ink-3)" font-size="11" font-weight="700" font-family="var(--f-head)">${title}</text>
          <text x="${cx}" y="100" text-anchor="middle" fill="var(--ink-3)" font-size="11" font-family="var(--f-mono)">(vacío)</text>`;
        const coords = [];
        const baseY = 58, dy = 48;
        for (let i = 0; i < arr.length; i++) {
          const depth = Math.floor(Math.log2(i + 1));
          const posInLvl = i - ((1 << depth) - 1);
          const countInLvl = 1 << depth;
          const spread = 165 / countInLvl;
          const x = cx - 82.5 + spread * (posInLvl + 0.5);
          const y = baseY + depth * dy;
          coords.push({ x, y });
        }
        let edges = "";
        for (let i = 1; i < arr.length; i++) {
          const p = (i - 1) >> 1;
          edges += `<line x1="${coords[p].x}" y1="${coords[p].y}" x2="${coords[i].x}" y2="${coords[i].y}" stroke="var(--line)" stroke-width="2"/>`;
        }
        const nodes = arr.map((val, i) => {
          const r = i === 0 ? 18 : 14;
          const fill = i === 0 && isRootUsed ? accent : "var(--surface)";
          const stroke = i === 0 ? accent : "var(--line)";
          const tc = i === 0 && isRootUsed ? "var(--sim-on-fill)" : "var(--ink)";
          return `<circle cx="${coords[i].x}" cy="${coords[i].y}" r="${r}" fill="${fill}" stroke="${stroke}" stroke-width="${i === 0 ? 2.5 : 1.8}"/>
            <text x="${coords[i].x}" y="${coords[i].y + 4}" text-anchor="middle" fill="${tc}" font-size="${i === 0 ? 12 : 10.5}" font-weight="700" font-family="var(--f-mono)">${val}</text>`;
        }).join("");
        return `<text x="${cx}" y="24" text-anchor="middle" fill="var(--ink-2)" font-size="11" font-weight="700" font-family="var(--f-head)">${title} (|${arr.length}|)</text>${edges}${nodes}`;
      };

      const streamHtml = `<div class="sim-cells" style="margin-bottom:8px;">${seq.map((v, i) =>
        `<div class="sim-cell ${i === idx ? "cur" : i < idx ? "ok" : "dim"}" style="min-width:34px;padding:3px 6px;"><span class="val" style="font-size:.82rem;">${v}</span></div>`
      ).join("")}</div>`;

      const svg = `<svg viewBox="0 0 460 190" width="460" height="190" role="img" aria-label="Dos heaps para mediana dinámica">
        <rect x="10" y="6" width="200" height="176" rx="12" fill="var(--surface)" stroke="var(--line)"/>
        <rect x="250" y="6" width="200" height="176" rx="12" fill="var(--surface)" stroke="var(--line)"/>
        ${drawTree(lo, 110, "lo · Max-Heap", "var(--sim-petrol)", med !== null)}
        ${drawTree(hi, 350, "hi · Min-Heap", "var(--sim-cyan)", med !== null && !odd)}
        ${moved ? `<text x="230" y="90" text-anchor="middle" fill="var(--warn)" font-size="11" font-weight="800" font-family="var(--f-mono)">⇄</text>` : ""}
        ${med !== null ? `<rect x="195" y="136" width="70" height="34" rx="9" fill="var(--sim-green)"/>
          <text x="230" y="150" text-anchor="middle" fill="var(--sim-on-fill)" font-size="8.5" font-weight="700" font-family="var(--f-head)">MEDIANA</text>
          <text x="230" y="164" text-anchor="middle" fill="var(--sim-on-fill)" font-size="13" font-weight="800" font-family="var(--f-mono)">${med}</text>` : ""}
      </svg>`;
      return streamHtml + svg;
    }
  };

  // ------------------------------------------------------------------------
  // SEMANA 04 · Fenwick Tree / BIT (UVa 12086)
  // ------------------------------------------------------------------------
  SIMS[4] = {
    title: "Fenwick Tree (BIT) — Saltos binarios con LSOne(i) = i & -i",
    code: [
      "// Cada bit[i] cubre el rango [i - LSOne(i) + 1 .. i]",
      "int prefixSum(int i) {",
      "  int sum = 0;",
      "  for (; i > 0; i -= i & -i) sum += bit[i];",
      "  return sum;",
      "}",
      "void add(int i, int delta) {",
      "  for (; i <= n; i += i & -i) bit[i] += delta;",
      "}"
    ],
    tableHeaders: ["Paso", "Índice i", "Binario", "LSOne (i&-i)", "Rango bit[i]", "Acumulado / Cambio"],
    fields: [
      { id: "A", label: "Arreglo A[1..n]", type: "text", width: "160px" },
      { id: "mode", label: "Operación", type: "select", options: [{ v: "sum", l: "prefixSum(idx)" }, { v: "add", l: "add(idx, Δ)" }] },
      { id: "idx", label: "idx", type: "number", min: 1, max: 8, step: 1 },
      { id: "delta", label: "Δ (si add)", type: "number", min: -20, max: 20, step: 1 }
    ],
    presets: [
      { label: "prefixSum(7) · Ejemplo clase", values: { A: "3, 2, 5, 1, 4, 2, 6, 3", mode: "sum", idx: 7, delta: 4 } },
      { label: "add(3, +4) · Actualizar BIT", values: { A: "3, 2, 5, 1, 4, 2, 6, 3", mode: "add", idx: 3, delta: 4 } },
      { label: "prefixSum(6) · 2 saltos", values: { A: "3, 2, 5, 1, 4, 2, 6, 3", mode: "sum", idx: 6, delta: 4 } }
    ],
    build(v) {
      let A = parseNums(v.A, 8, -99, 99);
      if (A.length < 4) A = [3, 2, 5, 1, 4, 2, 6, 3];
      const n = A.length;
      const mode = v.mode === "add" ? "add" : "sum";
      const idx = Math.max(1, Math.min(n, Number(v.idx) || Math.min(7, n)));
      const delta = Number(v.delta) || 4;

      const bit = Array(n + 1).fill(0);
      for (let i = 1; i <= n; i++) {
        for (let j = i; j <= n; j += j & -j) bit[j] += A[i - 1];
      }
      const bin4 = x => x.toString(2).padStart(4, "0");
      const steps = [];

      steps.push({
        badge: "Estructura BIT",
        title: mode === "sum" ? `Preparando consulta prefixSum(${idx})` : `Preparando actualización add(${idx}, ${delta >= 0 ? "+" + delta : delta})`,
        explain: `Cada celda <code>bit[i]</code> almacena la suma de los últimos <code>LSOne(i) = i &amp; -i</code> elementos terminando en <code>i</code>. Observa cómo las barras de cobertura particionan cualquier prefijo en a lo sumo <code>⌊log₂ n⌋ + 1</code> bloques.`,
        line: 0,
        vars: [{ k: "n", v: n }, { k: "operación", v: mode === "sum" ? `prefixSum(${idx})` : `add(${idx},${delta})` }],
        row: ["Init", String(idx), bin4(idx), String(idx & -idx), `[${idx - (idx & -idx) + 1}..${idx}]`, "BIT construido"],
        vis: { A: [...A], bit: [...bit], cur: null, visited: [], mode, sum: 0, idx, delta }
      });

      if (mode === "sum") {
        let i = idx, sum = 0, stepNum = 0;
        const visited = [];
        while (i > 0) {
          stepNum++;
          const ls = i & -i;
          const nextI = i - ls;
          sum += bit[i];
          visited.push(i);
          steps.push({
            badge: `Salto ${stepNum} · i = ${i}`,
            title: `Sumar bit[${i}] = ${bit[i]} (rango [${i - ls + 1}..${i}])`,
            explain: `<code>i = ${i} (${bin4(i)}₂)</code> tiene <code>LSOne = ${ls}</code>. Acumulamos <code>sum += bit[${i}] (${bit[i]}) → ${sum}</code> y quitamos el bit bajo: <code>i = ${i} − ${ls} = ${nextI}</code>.`,
            line: 3,
            vars: [{ k: "i", v: `${i} (${bin4(i)}₂)` }, { k: "LSOne", v: ls }, { k: "bit[i]", v: bit[i] }, { k: "sum", v: sum, cls: "ok" }],
            row: [String(stepNum), String(i), bin4(i), String(ls), `[${i - ls + 1}..${i}]`, `sum = ${sum} → i=${nextI}`],
            vis: { A: [...A], bit: [...bit], cur: i, visited: [...visited], mode, sum, idx, delta }
          });
          i = nextI;
        }
        steps.push({
          badge: `Resultado · ${sum} ★`,
          badgeCls: "ok",
          title: `prefixSum(${idx}) = ${sum} en solo ${stepNum} saltos`,
          explain: `Los bloques visitados <code>{${visited.map(x => `bit[${x}]`).join(", ")}}</code> cubren exactamente <code>A[1..${idx}]</code> sin solaparse. Suma exacta = <b>${sum}</b>.`,
          line: 4,
          vars: [{ k: `prefixSum(${idx})`, v: sum, cls: "ok" }, { k: "saltos", v: stepNum }],
          row: ["Fin", "0", "0000", "—", `[1..${idx}]`, `Total = ${sum} ★`],
          vis: { A: [...A], bit: [...bit], cur: null, visited: [...visited], mode, sum, idx, delta, done: true }
        });
      } else {
        let i = idx, stepNum = 0;
        const visited = [];
        const A2 = [...A]; A2[idx - 1] += delta;
        const bit2 = [...bit];
        while (i <= n) {
          stepNum++;
          const ls = i & -i;
          const nextI = i + ls;
          const prevVal = bit2[i];
          bit2[i] += delta;
          visited.push(i);
          steps.push({
            badge: `Salto ${stepNum} · i = ${i}`,
            badgeCls: "warn",
            title: `Actualizar bit[${i}]: ${prevVal} → ${bit2[i]}`,
            explain: `<code>i = ${i} (${bin4(i)}₂)</code> cubre el índice ${idx}. Sumamos <code>Δ = ${delta >= 0 ? "+" + delta : delta}</code> a <code>bit[${i}]</code> y subimos al padre sumando LSOne: <code>i = ${i} + ${ls} = ${nextI}</code>${nextI > n ? " (> n, fin)" : ""}.`,
            line: 7,
            vars: [{ k: "i", v: `${i} (${bin4(i)}₂)` }, { k: "LSOne", v: ls }, { k: "bit[i]", v: `${prevVal}→${bit2[i]}`, cls: "warn" }, { k: "sig. i", v: nextI }],
            row: [String(stepNum), String(i), bin4(i), String(ls), `[${i - ls + 1}..${i}]`, `${prevVal} → ${bit2[i]}`],
            vis: { A: A2, bit: [...bit2], cur: i, visited: [...visited], mode, sum: 0, idx, delta }
          });
          i = nextI;
        }
      }
      return { steps, note: `Tanto prefixSum(i) como add(i, Δ) hacen O(log N) saltos usando únicamente el operador de bits i & -i.` };
    },
    render(step) {
      const { A, bit, cur, visited, mode } = step.vis;
      const n = A.length;
      const colW = 48, left = 46, barY0 = 58, rowH = 19;
      const svgW = left + n * colW + 16;
      const svgH = barY0 + n * rowH + 16;

      let cols = "";
      for (let i = 1; i <= n; i++) {
        const x = left + (i - 1) * colW;
        cols += `<rect x="${x + 2}" y="12" width="${colW - 4}" height="34" rx="6" fill="var(--surface)" stroke="var(--line)"/>
          <text x="${x + colW / 2}" y="24" text-anchor="middle" fill="var(--ink-3)" font-size="9" font-family="var(--f-mono)">A[${i}]</text>
          <text x="${x + colW / 2}" y="39" text-anchor="middle" fill="var(--ink)" font-size="12" font-weight="800" font-family="var(--f-mono)">${A[i - 1]}</text>`;
      }

      let bars = "";
      for (let i = 1; i <= n; i++) {
        const ls = i & -i;
        const start = i - ls + 1;
        const x1 = left + (start - 1) * colW + 3;
        const w = ls * colW - 6;
        const y = barY0 + (i - 1) * rowH;
        const isCur = i === cur;
        const isVis = visited.includes(i);
        const fill = isCur ? "var(--sim-cyan)" : isVis ? (mode === "add" ? "var(--sim-amber)" : "var(--sim-green)") : "var(--surface-2)";
        const stroke = isCur ? "var(--sim-petrol)" : isVis ? fill : "var(--line)";
        const tc = (isCur || isVis) ? "var(--sim-on-fill)" : "var(--ink)";
        bars += `<text x="${left - 6}" y="${y + 12}" text-anchor="end" fill="${isCur ? "var(--accent)" : "var(--ink-3)"}" font-size="10" font-weight="${isCur ? 800 : 600}" font-family="var(--f-mono)">i=${i}</text>
          <rect x="${x1}" y="${y}" width="${w}" height="15" rx="4" fill="${fill}" stroke="${stroke}" stroke-width="${isCur ? 2 : 1}"/>
          <text x="${x1 + w / 2}" y="${y + 11}" text-anchor="middle" fill="${tc}" font-size="10" font-weight="700" font-family="var(--f-mono)">bit[${i}]=${bit[i]}</text>`;
      }

      return `<svg viewBox="0 0 ${svgW} ${svgH}" width="${svgW}" height="${svgH}" role="img" aria-label="Cobertura del Fenwick Tree">${cols}${bars}</svg>`;
    }
  };

  // ------------------------------------------------------------------------
  // SEMANA 05 · UVa 624 — Backtracking con Podas (CD)
  // ------------------------------------------------------------------------
  SIMS[5] = {
    title: "UVa 624 — Árbol de Backtracking con Podas (CD)",
    code: [
      "void dfs(int i, int sum, vector<int>& cur) {",
      "  if (sum > N) return;              // PODA por exceso",
      "  if (sum > bestSum) { bestSum = sum; best = cur; }",
      "  if (i == T) return;",
      "  cur.push_back(a[i]);",
      "  dfs(i + 1, sum + a[i], cur);      // Rama (+): tomar",
      "  cur.pop_back();",
      "  dfs(i + 1, sum, cur);             // Rama (−): omitir",
      "}"
    ],
    tableHeaders: ["Paso", "Estado (i, sum)", "Decisión", "Acción", "Mejor acumulado"],
    fields: [
      { id: "N", label: "Capacidad N", type: "number", min: 2, max: 50, step: 1 },
      { id: "tracks", label: "Pistas (máx 4)", type: "text", width: "145px" }
    ],
    presets: [
      { label: "Clase (N=5, [1,3,4])", values: { N: 5, tracks: "1, 3, 4" } },
      { label: "Sample UVa (N=10, [9,8,4,2])", values: { N: 10, tracks: "9, 8, 4, 2" } },
      { label: "Muchas podas (N=7, [5,4,3,2])", values: { N: 7, tracks: "5, 4, 3, 2" } }
    ],
    build(v) {
      const N = Math.max(2, Number(v.N) || 5);
      let tracks = parseNums(v.tracks, 4, 1, 40);
      if (!tracks.length) tracks = [1, 3, 4];

      // Build full visited tree first for tidy layout, while logging steps
      const nodes = [];
      const edges = [];
      const steps = [];
      let bestSum = -1, bestChosen = [], bestNodeId = 0;

      const dfs = (i, sum, chosen, parentId, edgeLabel) => {
        const id = nodes.length;
        const pruned = sum > N;
        nodes.push({ id, i, sum, chosen: [...chosen], parentId, edgeLabel, pruned, children: [] });
        if (parentId !== null) {
          nodes[parentId].children.push(id);
          edges.push({ from: parentId, to: id, label: edgeLabel, pruned });
        }

        const prevBest = bestSum;
        let isNewBest = false;
        if (!pruned && sum > bestSum) {
          bestSum = sum; bestChosen = [...chosen]; bestNodeId = id; isNewBest = true;
        }

        const visitedIds = nodes.map(nd => nd.id);
        steps.push({
          badge: pruned ? "PODA ✂ (sum > N)" : isNewBest ? `Nuevo mejor: ${bestSum} ★` : `Nodo i=${i}`,
          badgeCls: pruned ? "bad" : isNewBest ? "ok" : "",
          title: pruned
            ? `Poda en (${i}, suma=${sum} > ${N})`
            : id === 0 ? `Inicio en raíz (0, suma=0)`
            : `${edgeLabel}: llegamos a suma=${sum} con [${chosen.join(",")}]`,
          explain: pruned
            ? `La suma <code>${sum}</code> supera la capacidad <code>N = ${N}</code>. <b>Cortamos toda esta rama</b> inmediatamente sin explorar las pistas restantes.`
            : isNewBest
            ? `<code>sum = ${sum}</code> mejora el récord anterior (${prevBest < 0 ? "—" : prevBest}). Actualizamos <code>best = [${chosen.join(", ")}]</code>.${i === tracks.length ? " Llegamos a una hoja." : ` Probaremos tomar <code>+${tracks[i]}</code>.`}`
            : i === tracks.length
            ? `Hoja alcanzada con suma <code>${sum}</code> (no supera el mejor actual <code>${bestSum}</code>). Retrocedemos (backtrack).`
            : `Exploramos desde <code>i=${i}</code> con suma <code>${sum}</code> (mejor actual: <code>${bestSum}</code>).`,
          line: pruned ? 1 : isNewBest ? 2 : i === tracks.length ? 3 : 5,
          vars: [
            { k: "i", v: `${i}/${tracks.length}` },
            { k: "sum", v: `${sum}/${N}`, cls: pruned ? "bad" : isNewBest ? "ok" : "" },
            { k: "actual", v: `[${chosen.join(",")}]` },
            { k: "mejor", v: `${bestSum} [${bestChosen.join(",")}]`, cls: "ok" }
          ],
          row: [String(steps.length), `(${i}, ${sum})`, edgeLabel || "Raíz", pruned ? "PODA ✂" : isNewBest ? "Actualiza mejor ★" : i === tracks.length ? "Hoja / vuelve" : "Avanza", `${bestSum} ([${bestChosen.join(",")}])`],
          vis: { activeId: id, visitedIds, bestNodeId, bestSum, bestChosen: [...bestChosen], N }
        });

        if (pruned || i === tracks.length) return;
        dfs(i + 1, sum + tracks[i], [...chosen, tracks[i]], id, `+${tracks[i]}`);
        dfs(i + 1, sum, chosen, id, `−${tracks[i]}`);
      };

      dfs(0, 0, [], null, "");

      steps.push({
        badge: `Óptimo = ${bestSum} ★`,
        badgeCls: "ok",
        title: `Búsqueda completa terminada: mejor suma = ${bestSum}`,
        explain: `Tras explorar (y podar) el árbol de decisiones, la mejor combinación sin superar <code>N = ${N}</code> es <b><code>[${bestChosen.join(", ")}]</code></b> con suma total <b><code>${bestSum}</code></b>.`,
        line: 2,
        vars: [{ k: "Capacidad N", v: N }, { k: "Óptimo", v: `${bestSum} [${bestChosen.join(",")}]`, cls: "ok" }, { k: "Nodos visitados", v: nodes.length }],
        row: ["Fin", `(★, ${bestSum})`, "Óptimo", "Búsqueda completa", `${bestSum} ([${bestChosen.join(",")}]) ★`],
        vis: { activeId: bestNodeId, visitedIds: nodes.map(nd => nd.id), bestNodeId, bestSum, bestChosen: [...bestChosen], N }
      });

      // Compute tidy x,y coordinates for all nodes
      let leafX = 0;
      const assignX = id => {
        const nd = nodes[id];
        if (!nd.children.length) { nd.tx = leafX++; }
        else {
          nd.children.forEach(assignX);
          nd.tx = (nodes[nd.children[0]].tx + nodes[nd.children[nd.children.length - 1]].tx) / 2;
        }
      };
      assignX(0);
      const maxX = Math.max(1, leafX - 1);
      const maxDepth = Math.max(1, ...nodes.map(nd => nd.i));
      const W = 460, H = 225, padX = 36, padY = 28;
      nodes.forEach(nd => {
        nd.x = maxX === 0 ? W / 2 : padX + (nd.tx / maxX) * (W - 2 * padX);
        nd.y = padY + (nd.i / maxDepth) * (H - 2 * padY);
      });

      // Attach static graph geometry to each step
      steps.forEach(s => { s.vis.nodes = nodes; s.vis.edges = edges; });
      return { steps, note: `La poda temprana if (sum > N) return corta subárboles enteros; observa los nodos rojos con ✕ que no generan hijos.` };
    },
    render(step) {
      const { nodes, edges, activeId, visitedIds, bestNodeId } = step.vis;
      const visSet = new Set(visitedIds);
      const edgeSvg = edges.filter(e => visSet.has(e.to)).map(e => {
        const a = nodes[e.from], b = nodes[e.to];
        const mx = (a.x + b.x) / 2, my = (a.y + b.y) / 2;
        return `<line x1="${a.x}" y1="${a.y}" x2="${b.x}" y2="${b.y}" stroke="${e.pruned ? "var(--sim-red)" : "var(--line)"}" stroke-width="${e.to === activeId ? 2.8 : 1.8}" ${e.pruned ? 'stroke-dasharray="4 3"' : ""}/>
          <rect x="${mx - 13}" y="${my - 8}" width="26" height="14" rx="4" fill="var(--bg)"/>
          <text x="${mx}" y="${my + 2.5}" text-anchor="middle" fill="${e.pruned ? "var(--neg)" : "var(--ink-2)"}" font-size="9.5" font-weight="700" font-family="var(--f-mono)">${esc(e.label)}</text>`;
      }).join("");

      const nodeSvg = nodes.filter(nd => visSet.has(nd.id)).map(nd => {
        const isAct = nd.id === activeId;
        const isBest = nd.id === bestNodeId;
        const fill = isAct ? (nd.pruned ? "var(--sim-red)" : "var(--sim-cyan)") : nd.pruned ? "rgba(179,38,30,.15)" : isBest ? "var(--sim-green)" : "var(--surface)";
        const stroke = isAct ? "var(--sim-petrol)" : nd.pruned ? "var(--sim-red)" : isBest ? "var(--sim-green)" : "var(--line)";
        const tc = (isAct || isBest) ? "var(--sim-on-fill)" : nd.pruned ? "var(--neg)" : "var(--ink)";
        return `<circle cx="${nd.x}" cy="${nd.y}" r="${isAct ? 16 : 13}" fill="${fill}" stroke="${stroke}" stroke-width="${isAct ? 2.6 : 1.8}"/>
          <text x="${nd.x}" y="${nd.y + 4}" text-anchor="middle" fill="${tc}" font-size="11" font-weight="800" font-family="var(--f-mono)">${nd.pruned ? "✕" : nd.sum}</text>`;
      }).join("");

      return `<svg viewBox="0 0 460 225" width="460" height="225" role="img" aria-label="Árbol de backtracking con podas">${edgeSvg}${nodeSvg}</svg>`;
    }
  };

  // ------------------------------------------------------------------------
  // SEMANA 06 · UVa 12405 — Cobertura Voraz (Scarecrow)
  // ------------------------------------------------------------------------
  SIMS[6] = {
    title: "UVa 12405 — Cobertura Voraz de Campo (Scarecrow)",
    code: [
      "int ans = 0;",
      "for (int i = 0; i < N; ) {",
      "  if (s[i] == '.') {       // primera fértil sin cubrir",
      "    ans++;                 // colocar en i + 1",
      "    i += 3;                // cubre {i, i+1, i+2}",
      "  } else {",
      "    i += 1;                // '#' estéril: avanzar",
      "  }",
      "}"
    ],
    tableHeaders: ["Paso", "Pos. i", "s[i]", "Acción voraz", "Cubiertas", "Siguiente i"],
    fields: [
      { id: "field", label: "Campo ('.' fértil, '#' estéril)", type: "text", width: "175px" }
    ],
    presets: [
      { label: "Clase (.#.###...)", values: { field: ".#.###..." } },
      { label: "Todo fértil (.......)", values: { field: "......." } },
      { label: "Alternado (.#.#.#.)", values: { field: ".#.#.#." } }
    ],
    build(v) {
      let s = String(v.field || "").replace(/[^.#]/g, "").slice(0, 14);
      if (!s) s = ".#.###...";
      const n = s.length;
      const steps = [];
      const scarecrows = [];
      const covered = new Set();

      steps.push({
        badge: "Inicio",
        title: `Campo de longitud N = ${n}`,
        explain: `Recorremos de izquierda a derecha. Al encontrar una celda fértil <code>'.'</code> descubierta en <code>i</code>, siempre conviene colocar el espantapájaros en <code>i + 1</code> para cubrir <code>{i, i+1, i+2}</code>.`,
        line: 1,
        vars: [{ k: "i", v: 0 }, { k: "ans", v: 0 }],
        row: ["Init", "0", `'${s[0]}'`, "Comenzar barrido", "—", "0"],
        vis: { s, i: 0, scarecrows: [], covered: [], justPlaced: null, done: false }
      });

      let i = 0, stepNum = 0;
      while (i < n) {
        stepNum++;
        if (s[i] === ".") {
          const pos = Math.min(i + 1, n - 1);
          scarecrows.push(pos);
          const span = [i, i + 1, i + 2].filter(k => k < n);
          span.forEach(k => covered.add(k));
          const nextI = i + 3;
          steps.push({
            badge: `Paso ${stepNum} · Colocar #${scarecrows.length}`,
            badgeCls: "ok",
            title: `s[${i}] == '.' → colocar espantapájaros en ${pos}`,
            explain: `La celda <code>${i}</code> es fértil y no está cubierta. Colocando el espantapájaros en <b><code>${pos}</code></b> cubrimos <code>{${span.join(", ")}}</code> de una sola vez y saltamos a <code>i = ${i} + 3 = ${nextI}</code>.`,
            line: 4,
            vars: [{ k: "i", v: i }, { k: "colocar en", v: pos, cls: "ok" }, { k: "ans", v: scarecrows.length, cls: "ok" }, { k: "sig. i", v: nextI }],
            row: [String(stepNum), String(i), "'.' (fértil)", `Colocar en ${pos}`, `{${span.join(",")}}`, `${nextI}${nextI >= n ? " (fin)" : ""}`],
            vis: { s, i, scarecrows: [...scarecrows], covered: [...covered], justPlaced: pos, justSpan: span, done: false }
          });
          i = nextI;
        } else {
          const nextI = i + 1;
          steps.push({
            badge: `Paso ${stepNum} · Omitir '#'`,
            title: `s[${i}] == '#' (estéril) → avanzar a ${nextI}`,
            explain: `La celda <code>${i}</code> es estéril (<code>'#'</code>), no requiere cobertura. Avanzamos una posición: <code>i += 1 → ${nextI}</code>.`,
            line: 6,
            vars: [{ k: "i", v: i }, { k: "s[i]", v: "'#'" }, { k: "ans", v: scarecrows.length }, { k: "sig. i", v: nextI }],
            row: [String(stepNum), String(i), "'#' (estéril)", "No hace falta cubrir", "—", `${nextI}${nextI >= n ? " (fin)" : ""}`],
            vis: { s, i, scarecrows: [...scarecrows], covered: [...covered], justPlaced: null, justSpan: [], done: false }
          });
          i = nextI;
        }
      }

      steps.push({
        badge: `Total = ${scarecrows.length} ★`,
        badgeCls: "ok",
        title: `Campo cubierto con ${scarecrows.length} espantapájaros`,
        explain: `Todas las celdas fértiles quedaron cubiertas en un único barrido lineal <code>O(N)</code>. Posiciones elegidas: <code>[${scarecrows.join(", ")}]</code>.`,
        line: 0,
        vars: [{ k: "Óptimo", v: scarecrows.length, cls: "ok" }, { k: "posiciones", v: `[${scarecrows.join(",")}]` }],
        row: ["Fin", String(n), "—", "Todas las '.' cubiertas", `${covered.size} celdas`, `Ans = ${scarecrows.length} ★`],
        vis: { s, i: n, scarecrows: [...scarecrows], covered: [...covered], justPlaced: null, justSpan: [], done: true }
      });

      return { steps, note: "Argumento de intercambio (Greedy stays ahead): colocar en i+1 siempre domina colocar en i−1 o i porque cubre lo mismo hacia la izquierda y llega más lejos a la derecha." };
    },
    render(step) {
      const { s, i, scarecrows, covered, justPlaced, justSpan } = step.vis;
      const covSet = new Set(covered);
      const scSet = new Set(scarecrows);
      const spanSet = new Set(justSpan || []);
      return `<div class="sim-cells">${[...s].map((ch, idx) => {
        const isCur = idx === i;
        const isNewSpan = spanSet.has(idx);
        const isCov = covSet.has(idx);
        const hasSc = scSet.has(idx);
        const cls = isCur ? "cur" : isNewSpan ? "ok" : isCov ? "ok" : ch === "#" ? "dim" : "";
        return `<div class="sim-cell ${cls}" style="min-width:42px;position:relative;">
          <span class="idx">${isCur ? "▼ " : ""}${idx}</span>
          <span class="val">${ch === "." ? "🌱" : "🪨"}</span>
          <span class="sub">${hasSc ? (idx === justPlaced ? "★ NEW" : "★") : ch}</span>
        </div>`;
      }).join("")}</div>`;
    }
  };

  // ------------------------------------------------------------------------
  // SEMANA 07 · UVa 357 — Coin Change 1D DP (Conteo de combinaciones)
  // ------------------------------------------------------------------------
  SIMS[7] = {
    title: "UVa 357 — Coin Change Conteo (DP 1D por moneda)",
    code: [
      "dp[0] = 1; // 1 forma de formar monto 0 (vacío)",
      "for (int c : coins) {          // orden externo: monedas",
      "  for (int v = c; v <= n; v++) {",
      "    dp[v] += dp[v - c];        // sumar formas usando moneda c",
      "  }",
      "}",
      "return dp[n];"
    ],
    tableHeaders: ["Paso", "Moneda c", "Monto v", "Fórmula", "Nuevo dp[v]"],
    fields: [
      { id: "coins", label: "Monedas", type: "text", width: "120px" },
      { id: "n", label: "Monto n (≤12)", type: "number", min: 2, max: 12, step: 1 }
    ],
    presets: [
      { label: "Clase ({1,5,10}, n=11)", values: { coins: "1, 5, 10", n: 11 } },
      { label: "Clásico ({1,2,5}, n=7)", values: { coins: "1, 2, 5", n: 7 } },
      { label: "Sin moneda 1 ({2,3,5}, n=8)", values: { coins: "2, 3, 5", n: 8 } }
    ],
    build(v) {
      let coins = [...new Set(parseNums(v.coins, 5, 1, 20))];
      if (!coins.length) coins = [1, 5, 10];
      const n = Math.max(2, Math.min(12, Number(v.n) || 11));
      const dp = Array(n + 1).fill(0);
      dp[0] = 1;
      const steps = [];

      steps.push({
        badge: "Caso Base",
        title: "Inicializar dp[0] = 1, resto en 0",
        explain: `Hay exactamente <b>1</b> forma de formar monto <code>0</code> (no elegir ninguna moneda). Procesar una moneda a la vez en el bucle externo evita contar permutaciones repetidas como <code>1+5</code> y <code>5+1</code>.`,
        line: 0,
        vars: [{ k: "monedas", v: `{${coins.join(",")}}` }, { k: "n", v: n }, { k: "dp[0]", v: 1, cls: "ok" }],
        row: ["Init", "—", "0", "Caso base", "dp[0] = 1"],
        vis: { dp: [...dp], coin: null, curV: 0, srcV: null, changed: [0] }
      });

      for (const c of coins) {
        if (c > n) continue;
        // If coin == 1 and n > 6, group the fill of 1..n into a crisp single coin pass OR show key jumps so step count stays friendly (~14-18 steps)
        if (c === 1 && n >= 8 && coins.length >= 3) {
          for (let val = 1; val <= n; val++) dp[val] += dp[val - 1];
          steps.push({
            badge: `Moneda c = ${c}`,
            title: `Pasada completa con moneda ${c}: dp[1..${n}] += dp[v−1]`,
            explain: `Con la moneda <code>1</code>, cada monto <code>v = 1..${n}</code> recibe <code>dp[v−1]</code> formas adicionales (usar solo monedas de 1). Ahora todo el arreglo vale <code>1</code>.`,
            line: 3,
            vars: [{ k: "moneda c", v: c }, { k: "rango v", v: `1..${n}` }, { k: `dp[${n}]`, v: dp[n] }],
            row: [String(steps.length), String(c), `1..${n}`, `dp[v] += dp[v-1]`, `todos = 1`],
            vis: { dp: [...dp], coin: c, curV: n, srcV: n - 1, changed: Array.from({ length: n }, (_, k) => k + 1) }
          });
        } else {
          for (let val = c; val <= n; val++) {
            const add = dp[val - c];
            if (add === 0) continue;
            const prev = dp[val];
            dp[val] += add;
            steps.push({
              badge: `Moneda ${c} · v=${val}`,
              title: `dp[${val}] = ${prev} + dp[${val - c}] (${add}) = ${dp[val]}`,
              explain: `Al añadir una moneda de <b><code>${c}</code></b> a cada forma de lograr <code>${val - c}</code> (hay <code>${add}</code>), sumamos <code>+${add}</code> a <code>dp[${val}]</code>.`,
              line: 3,
              vars: [{ k: "moneda c", v: c }, { k: "v", v: val }, { k: `dp[${val - c}]`, v: add, cls: "warn" }, { k: `dp[${val}]`, v: dp[val], cls: "ok" }],
              row: [String(steps.length), String(c), String(val), `${prev} + dp[${val - c}](${add})`, String(dp[val])],
              vis: { dp: [...dp], coin: c, curV: val, srcV: val - c, changed: [val] }
            });
          }
        }
      }

      steps.push({
        badge: `Ans = ${dp[n]} ★`,
        badgeCls: "ok",
        title: `Resultado final: dp[${n}] = ${dp[n]} combinaciones`,
        explain: `Existen exactamente <b>${dp[n]}</b> combinaciones distintas usando monedas <code>{${coins.join(", ")}}</code> para sumar <b>${n}</b>.`,
        line: 6,
        vars: [{ k: `dp[${n}]`, v: dp[n], cls: "ok" }],
        row: ["Fin", "Todas", String(n), "Resultado final", `${dp[n]} formas ★`],
        vis: { dp: [...dp], coin: null, curV: n, srcV: null, changed: [n], done: true }
      });

      return { steps, note: `Orden de los bucles: monedas afuera ⇒ combinaciones (sin orden). Monto afuera ⇒ permutaciones (con orden).` };
    },
    render(step) {
      const { dp, coin, curV, srcV, changed } = step.vis;
      const n = dp.length - 1;
      const cellW = Math.min(40, Math.floor(420 / (n + 1)));
      const gap = 4;
      const totalW = (n + 1) * (cellW + gap) - gap;
      const startX = (460 - totalW) / 2;
      const boxY = 72;

      let arrow = "";
      if (srcV !== null && curV !== null && srcV !== curV) {
        const x1 = startX + srcV * (cellW + gap) + cellW / 2;
        const x2 = startX + curV * (cellW + gap) + cellW / 2;
        const midX = (x1 + x2) / 2;
        const ctrlY = Math.max(14, boxY - 36 - Math.abs(x2 - x1) * 0.14);
        arrow = `<defs><marker id="dp-arr" viewBox="0 0 10 10" refX="7" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0,1 L9,5 L0,9 z" fill="var(--sim-amber)"/></marker></defs>
          <path d="M ${x1} ${boxY - 2} Q ${midX} ${ctrlY} ${x2} ${boxY - 4}" fill="none" stroke="var(--sim-amber)" stroke-width="2.4" marker-end="url(#dp-arr)"/>
          <text x="${midX}" y="${ctrlY + 12}" text-anchor="middle" fill="var(--warn)" font-size="11" font-weight="800" font-family="var(--f-mono)">+dp[${srcV}] (c=${coin})</text>`;
      }

      const chSet = new Set(changed || []);
      const cells = dp.map((val, idx) => {
        const x = startX + idx * (cellW + gap);
        const isCur = idx === curV;
        const isSrc = idx === srcV;
        const fill = isCur ? "var(--sim-cyan)" : isSrc ? "rgba(217,130,43,.22)" : chSet.has(idx) ? "rgba(80,175,77,.18)" : "var(--surface)";
        const stroke = isCur ? "var(--sim-petrol)" : isSrc ? "var(--sim-amber)" : chSet.has(idx) ? "var(--sim-green)" : "var(--line)";
        const tc = isCur ? "var(--sim-on-fill)" : "var(--ink)";
        return `<rect x="${x}" y="${boxY}" width="${cellW}" height="46" rx="7" fill="${fill}" stroke="${stroke}" stroke-width="${isCur || isSrc ? 2.2 : 1.2}"/>
          <text x="${x + cellW / 2}" y="${boxY + 15}" text-anchor="middle" fill="${isCur ? "rgba(255,255,255,.85)" : "var(--ink-3)"}" font-size="9" font-family="var(--f-mono)">${idx}</text>
          <text x="${x + cellW / 2}" y="${boxY + 35}" text-anchor="middle" fill="${tc}" font-size="13" font-weight="800" font-family="var(--f-mono)">${val}</text>`;
      }).join("");

      return `<svg viewBox="0 0 460 140" width="460" height="140" role="img" aria-label="Tabla DP 1D Coin Change">${arrow}${cells}</svg>`;
    }
  };

  // ------------------------------------------------------------------------
  // SEMANA 08 · UVa 10192 — LCS 2D DP + Reconstrucción
  // ------------------------------------------------------------------------
  SIMS[8] = {
    title: "UVa 10192 — Tabla LCS 2D y Reconstrucción Paso a Paso",
    code: [
      "for (int i = 1; i <= |A|; i++)",
      "  for (int j = 1; j <= |B|; j++) {",
      "    if (A[i-1] == B[j-1])",
      "      dp[i][j] = dp[i-1][j-1] + 1;      // ↖ coincidencia",
      "    else",
      "      dp[i][j] = max(dp[i-1][j], dp[i][j-1]); // ↑ o ←",
      "  }",
      "// Reconstruir desde (|A|, |B|) siguiendo ↖"
    ],
    tableHeaders: ["Paso", "(i, j)", "A[i-1] vs B[j-1]", "Transición", "dp[i][j]"],
    fields: [
      { id: "A", label: "Cadena A (≤6)", type: "text", width: "110px" },
      { id: "B", label: "Cadena B (≤6)", type: "text", width: "110px" }
    ],
    presets: [
      { label: "Clase (abcd vs acdb)", values: { A: "abcd", B: "acdb" } },
      { label: "UVa 10192 (abcde vs acdbe)", values: { A: "abcde", B: "acdbe" } },
      { label: "ADN (AGGTAB vs GXTXAY)", values: { A: "AGGTAB", B: "GXTXAY" } }
    ],
    build(v) {
      const A = (String(v.A || "abcd").trim() || "abcd").slice(0, 6);
      const B = (String(v.B || "acdb").trim() || "acdb").slice(0, 6);
      const n = A.length, m = B.length;
      const dp = Array.from({ length: n + 1 }, () => Array(m + 1).fill(null));
      const dir = Array.from({ length: n + 1 }, () => Array(m + 1).fill(""));
      for (let i = 0; i <= n; i++) dp[i][0] = 0;
      for (let j = 0; j <= m; j++) dp[0][j] = 0;
      const clone2D = g => g.map(r => [...r]);
      const steps = [];

      steps.push({
        badge: "Caso Base",
        title: `Fila 0 y columna 0 en 0 (prefijo vacío ∅)`,
        explain: `La LCS de cualquier cadena con la cadena vacía es <code>0</code>. Llenaremos <code>dp[i][j]</code> fila por fila comparando <code>A="${esc(A)}"</code> y <code>B="${esc(B)}"</code>.`,
        line: 0,
        vars: [{ k: "A", v: `"${A}"` }, { k: "B", v: `"${B}"` }],
        row: ["Init", "(0,*),(*,0)", "∅", "Casos base", "0"],
        vis: { A, B, dp: clone2D(dp), dir: clone2D(dir), cur: null, srcs: [], path: [] }
      });

      for (let i = 1; i <= n; i++) {
        for (let j = 1; j <= m; j++) {
          const match = A[i - 1] === B[j - 1];
          if (match) {
            dp[i][j] = dp[i - 1][j - 1] + 1;
            dir[i][j] = "↖";
          } else if (dp[i - 1][j] >= dp[i][j - 1]) {
            dp[i][j] = dp[i - 1][j];
            dir[i][j] = "↑";
          } else {
            dp[i][j] = dp[i][j - 1];
            dir[i][j] = "←";
          }
          steps.push({
            badge: match ? `¡Match '${A[i - 1]}'!` : `Celda (${i},${j})`,
            badgeCls: match ? "ok" : "",
            title: match ? `A[${i - 1}] == B[${j - 1}] == '${A[i - 1]}' → diagonal + 1` : `'${A[i - 1]}' ≠ '${B[j - 1]}' → max(↑${dp[i - 1][j]}, ←${dp[i][j - 1]})`,
            explain: match
              ? `Coinciden <b><code>'${esc(A[i - 1])}'</code></b>: tomamos <code>dp[${i - 1}][${j - 1}] + 1 = ${dp[i - 1][j - 1]} + 1 = ${dp[i][j]}</code>.`
              : `No coinciden <code>'${esc(A[i - 1])}'</code> y <code>'${esc(B[j - 1])}'</code>: conservamos el mejor prefijo <code>max(arriba=${dp[i - 1][j]}, izq=${dp[i][j - 1]}) = ${dp[i][j]}</code>.`,
            line: match ? 3 : 5,
            vars: [{ k: "(i,j)", v: `(${i},${j})` }, { k: "comparación", v: `'${A[i - 1]}' ${match ? "==" : "≠"} '${B[j - 1]}'`, cls: match ? "ok" : "" }, { k: "dp[i][j]", v: dp[i][j] }],
            row: [String(steps.length), `(${i},${j})`, `'${A[i - 1]}' vs '${B[j - 1]}'`, match ? `↖ dp[${i - 1}][${j - 1}]+1` : `max(↑${dp[i - 1][j]}, ←${dp[i][j - 1]})`, String(dp[i][j])],
            vis: { A, B, dp: clone2D(dp), dir: clone2D(dir), cur: [i, j], srcs: match ? [[i - 1, j - 1]] : [[i - 1, j], [i, j - 1]], path: [] }
          });
        }
      }

      // Backtrack path
      const path = [];
      let ci = n, cj = m, lcs = "";
      while (ci > 0 && cj > 0) {
        path.push([ci, cj]);
        if (A[ci - 1] === B[cj - 1]) { lcs = A[ci - 1] + lcs; ci--; cj--; }
        else if (dp[ci - 1][cj] >= dp[ci][cj - 1]) ci--;
        else cj--;
      }
      steps.push({
        badge: `LCS = "${lcs}" (${dp[n][m]}) ★`,
        badgeCls: "ok",
        title: `Reconstrucción: LCS de longitud ${dp[n][m]} → "${lcs}"`,
        explain: `Retrocediendo desde <code>dp[${n}][${m}]</code> por las flechas resaltadas en verde recuperamos la subsecuencia común más larga: <b><code>"${esc(lcs)}"</code></b>.`,
        line: 7,
        vars: [{ k: "Longitud", v: dp[n][m], cls: "ok" }, { k: "LCS", v: `"${lcs}"`, cls: "ok" }],
        row: ["Fin", `(${n},${m})`, "Backtrack", `Camino verde`, `${dp[n][m]} ('${lcs}') ★`],
        vis: { A, B, dp: clone2D(dp), dir: clone2D(dir), cur: null, srcs: [], path }
      });

      return { steps, note: `Complejidad O(|A|·|B|) en tiempo y espacio. En el juez UVa 10192 las cadenas pueden incluir espacios: leer con getline().` };
    },
    render(step) {
      const { A, B, dp, dir, cur, srcs, path } = step.vis;
      const srcSet = new Set(srcs.map(([r, c]) => `${r},${c}`));
      const pathSet = new Set(path.map(([r, c]) => `${r},${c}`));
      let html = `<table class="sim-matrix"><thead><tr><th>A \\ B</th><th>∅</th>${[...B].map(ch => `<th>${esc(ch)}</th>`).join("")}</tr></thead><tbody>`;
      for (let i = 0; i <= A.length; i++) {
        html += `<tr><th>${i === 0 ? "∅" : esc(A[i - 1])}</th>`;
        for (let j = 0; j <= B.length; j++) {
          const val = dp[i][j];
          const key = `${i},${j}`;
          const isCur = cur && cur[0] === i && cur[1] === j;
          const isPath = pathSet.has(key);
          const isSrc = srcSet.has(key);
          const isMatch = dir[i][j] === "↖";
          const cls = isPath ? "path" : isCur ? "cur" : isSrc ? "src" : isMatch ? "match" : val === null ? "empty" : "";
          html += `<td class="${cls}">${val === null ? "·" : `${val}<span style="font-size:.66em;opacity:.75;margin-left:2px;">${dir[i][j]}</span>`}</td>`;
        }
        html += `</tr>`;
      }
      html += `</tbody></table>`;
      return html;
    }
  };

  // ------------------------------------------------------------------------
  // SEMANA 09 · UVa 10305 — Orden Topológico (Algoritmo de Kahn)
  // ------------------------------------------------------------------------
  const KAHN_GRAPHS = {
    uva10305: {
      label: "UVa 10305 (5 tareas DAG)",
      nodes: [
        { id: 1, x: 75, y: 75 }, { id: 2, x: 205, y: 45 }, { id: 3, x: 345, y: 75 },
        { id: 4, x: 75, y: 165 }, { id: 5, x: 205, y: 155 }
      ],
      edges: [[1, 2], [2, 3], [1, 3], [1, 5]]
    },
    cursos: {
      label: "Prerrequisitos (6 nodos DAG)",
      nodes: [
        { id: 1, x: 65, y: 55 }, { id: 2, x: 65, y: 155 }, { id: 3, x: 195, y: 55 },
        { id: 4, x: 195, y: 155 }, { id: 5, x: 330, y: 55 }, { id: 6, x: 330, y: 155 }
      ],
      edges: [[1, 3], [2, 3], [2, 4], [3, 5], [4, 5], [4, 6]]
    },
    ciclo: {
      label: "Grafo con ciclo (detecta error)",
      nodes: [
        { id: 1, x: 70, y: 110 }, { id: 2, x: 190, y: 45 }, { id: 3, x: 330, y: 110 },
        { id: 4, x: 190, y: 175 }
      ],
      edges: [[1, 2], [2, 3], [3, 4], [4, 2]]
    }
  };

  SIMS[9] = {
    title: "UVa 10305 — Orden Topológico con Algoritmo de Kahn (BFS)",
    code: [
      "for (u : V) if (indeg[u] == 0) Q.push(u);",
      "while (!Q.empty()) {",
      "  u = Q.front(); Q.pop(); order.push_back(u);",
      "  for (v : adj[u]) {",
      "    if (--indeg[v] == 0) Q.push(v);",
      "  }",
      "}",
      "// Si order.size() < V ⇒ ¡existe un ciclo!"
    ],
    tableHeaders: ["Paso", "Cola Q", "Extraído u", "Aristas eliminadas", "Orden acumulado"],
    fields: [
      { id: "graph", label: "Grafo dirigido", type: "select", options: Object.entries(KAHN_GRAPHS).map(([v, g]) => ({ v, l: g.label })) }
    ],
    presets: [
      { label: "UVa 10305 (DAG)", values: { graph: "uva10305" } },
      { label: "Cursos (6 nodos)", values: { graph: "cursos" } },
      { label: "Con ciclo (sin orden)", values: { graph: "ciclo" } }
    ],
    build(v) {
      const g = KAHN_GRAPHS[v.graph] || KAHN_GRAPHS.uva10305;
      const indeg = {};
      g.nodes.forEach(nd => { indeg[nd.id] = 0; });
      g.edges.forEach(([, to]) => { indeg[to]++; });
      const Q = g.nodes.filter(nd => indeg[nd.id] === 0).map(nd => nd.id);
      const order = [];
      const removed = new Set();
      const steps = [];

      steps.push({
        badge: "Inicio",
        title: `Encolar todos los nodos con indeg == 0`,
        explain: `Los nodos sin prerrequisitos (<code>indeg == 0</code>) entran a la cola FIFO inicial: <code>Q = [${Q.join(", ")}]</code>.`,
        line: 0,
        vars: [{ k: "Cola Q", v: `[${Q.join(",")}]` }, { k: "Orden", v: "[]" }],
        row: ["Init", `[${Q.join(",")}]`, "—", "—", "[]"],
        vis: { g, indeg: { ...indeg }, Q: [...Q], order: [], active: null, removed: [], highlightEdges: [] }
      });

      let stepNum = 0;
      while (Q.length) {
        stepNum++;
        const u = Q.shift();
        order.push(u);
        const outEdges = g.edges.filter(([a]) => a === u);
        const enq = [];
        outEdges.forEach(([a, b]) => {
          removed.add(`${a}->${b}`);
          indeg[b]--;
          if (indeg[b] === 0) { Q.push(b); enq.push(b); }
        });

        steps.push({
          badge: `Paso ${stepNum} · Extrae ${u}`,
          title: `Procesar nodo ${u}${enq.length ? ` → encola [${enq.join(", ")}]` : ""}`,
          explain: `Extraemos <b><code>${u}</code></b> de la cola y lo añadimos al orden. ${outEdges.length ? `Eliminamos ${outEdges.length} arista(s) saliente(s) (${outEdges.map(([a, b]) => `${a}→${b}`).join(", ")}), decrementando su <code>indeg</code>.` : "No tiene aristas salientes."}${enq.length ? ` Quedan con <code>indeg == 0</code> y se encolan: <b><code>${enq.join(", ")}</code></b>.` : ""}`,
          line: enq.length ? 4 : 2,
          vars: [{ k: "u", v: u }, { k: "Cola Q", v: `[${Q.join(",")}]` }, { k: "Orden", v: `[${order.join(",")}]`, cls: "ok" }],
          row: [String(stepNum), `[${Q.join(",")}]`, String(u), outEdges.length ? outEdges.map(([a, b]) => `${a}→${b}`).join(", ") : "(ninguna)", `[${order.join(", ")}]`],
          vis: { g, indeg: { ...indeg }, Q: [...Q], order: [...order], active: u, removed: [...removed], highlightEdges: outEdges.map(([a, b]) => `${a}->${b}`) }
        });
      }

      const isDag = order.length === g.nodes.length;
      steps.push({
        badge: isDag ? "DAG Válido ★" : "¡CICLO DETECTADO! ✕",
        badgeCls: isDag ? "ok" : "bad",
        title: isDag ? `Orden topológico completo: [${order.join(" → ")}]` : `Cola vacía con solo ${order.length}/${g.nodes.length} nodos procesados`,
        explain: isDag
          ? `Se procesaron todos los <b>${g.nodes.length}</b> vértices. Toda arista <code>u → v</code> apunta hacia adelante en <code>[${order.join(", ")}]</code>.`
          : `Los nodos restantes tienen <code>indeg &gt; 0</code> permanentemente porque forman un <b>ciclo dirigido</b> (2→3→4→2). ¡No existe orden topológico!`,
        line: 7,
        vars: [{ k: "Procesados", v: `${order.length}/${g.nodes.length}`, cls: isDag ? "ok" : "bad" }, { k: "Estado", v: isDag ? "DAG ★" : "Tiene ciclo ✕", cls: isDag ? "ok" : "bad" }],
        row: ["Fin", "[]", "—", isDag ? "V == procesados" : "Quedan nodos con indeg > 0", isDag ? `[${order.join(", ")}] ★` : "CICLO ✕"],
        vis: { g, indeg: { ...indeg }, Q: [], order: [...order], active: null, removed: [...removed], highlightEdges: [], done: true, isDag }
      });

      return { steps, note: "Kahn corre en O(V + E). Además de construir un orden topológico, detecta ciclos si al final order.size() < V." };
    },
    render(step) {
      const { g, indeg, Q, order, active, removed, highlightEdges } = step.vis;
      const remSet = new Set(removed), hiSet = new Set(highlightEdges), ordSet = new Set(order), qSet = new Set(Q);
      const pos = Object.fromEntries(g.nodes.map(nd => [nd.id, nd]));
      const R = 19;

      const edgesSvg = g.edges.map(([a, b]) => {
        const p1 = pos[a], p2 = pos[b];
        const dx = p2.x - p1.x, dy = p2.y - p1.y, len = Math.hypot(dx, dy) || 1;
        const x1 = p1.x + (dx / len) * R, y1 = p1.y + (dy / len) * R;
        const x2 = p2.x - (dx / len) * (R + 5), y2 = p2.y - (dy / len) * (R + 5);
        const key = `${a}->${b}`;
        const isHi = hiSet.has(key), isRem = remSet.has(key);
        return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${isHi ? "var(--sim-cyan)" : isRem ? "var(--line)" : "var(--ink-2)"}" stroke-width="${isHi ? 3 : 2}" ${isRem && !isHi ? 'stroke-dasharray="4 4" opacity="0.4"' : ""} marker-end="url(#${isHi ? "k-arr-hi" : "k-arr"})"/>`;
      }).join("");

      const nodesSvg = g.nodes.map(nd => {
        const isAct = nd.id === active;
        const isDone = ordSet.has(nd.id);
        const isQ = qSet.has(nd.id);
        const fill = isAct ? "var(--sim-cyan)" : isDone ? "var(--sim-green)" : isQ ? "rgba(33,184,210,.22)" : "var(--surface)";
        const stroke = isAct ? "var(--sim-petrol)" : isDone ? "var(--sim-green)" : isQ ? "var(--sim-cyan)" : "var(--line)";
        const tc = (isAct || isDone) ? "var(--sim-on-fill)" : "var(--ink)";
        return `<circle cx="${nd.x}" cy="${nd.y}" r="${R}" fill="${fill}" stroke="${stroke}" stroke-width="${isAct || isQ ? 2.6 : 1.8}"/>
          <text x="${nd.x}" y="${nd.y + 4}" text-anchor="middle" fill="${tc}" font-size="13" font-weight="800" font-family="var(--f-mono)">${nd.id}</text>
          <rect x="${nd.x + 11}" y="${nd.y - 24}" width="26" height="15" rx="7" fill="${indeg[nd.id] === 0 && !isDone ? "var(--sim-cyan)" : "var(--surface-2)"}" stroke="var(--line)"/>
          <text x="${nd.x + 24}" y="${nd.y - 13.5}" text-anchor="middle" fill="${indeg[nd.id] === 0 && !isDone ? "var(--sim-on-fill)" : "var(--ink-2)"}" font-size="9.5" font-weight="700" font-family="var(--f-mono)">in:${indeg[nd.id]}</text>`;
      }).join("");

      return `<div class="sim-split">
        <svg viewBox="0 0 400 215" width="400" height="215" role="img" aria-label="Grafo dirigido Kahn">
          <defs>
            <marker id="k-arr" viewBox="0 0 10 10" refX="7" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0,1 L9,5 L0,9 z" fill="var(--ink-2)"/></marker>
            <marker id="k-arr-hi" viewBox="0 0 10 10" refX="7" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0,1 L9,5 L0,9 z" fill="var(--sim-cyan)"/></marker>
          </defs>
          ${edgesSvg}${nodesSvg}
        </svg>
        <div style="display:grid;gap:8px;">
          <div class="sim-mini-panel"><div class="sim-mini-title">Cola FIFO (indeg == 0)</div><div class="sim-list">${Q.length ? Q.map((x, idx) => `<div class="sim-list-item ${idx === 0 ? "cur" : ""}"><span>${idx === 0 ? "Frente →" : ""} Nodo ${x}</span><b>in=0</b></div>`).join("") : `<span class="muted">(vacía)</span>`}</div></div>
          <div class="sim-mini-panel"><div class="sim-mini-title">Orden topológico</div><div style="font-family:var(--f-mono);font-weight:700;color:var(--pos);">${order.length ? order.join(" → ") : "—"}</div></div>
        </div>
      </div>`;
    }
  };

  // ------------------------------------------------------------------------
  // SEMANA 10 · UVa 11631 — Kruskal MST + DSU
  // ------------------------------------------------------------------------
  const KRUSKAL_GRAPHS = {
    clase: {
      label: "Ejemplo clase (4 nodos, 5 aristas)",
      nodes: [{ id: 0, x: 75, y: 55 }, { id: 1, x: 245, y: 55 }, { id: 2, x: 75, y: 170 }, { id: 3, x: 245, y: 170 }],
      edges: [[0, 1, 1], [1, 2, 2], [0, 2, 3], [2, 3, 4], [1, 3, 5]]
    },
    urbana: {
      label: "Red urbana (6 nodos, 8 aristas)",
      nodes: [
        { id: 0, x: 55, y: 110 }, { id: 1, x: 145, y: 42 }, { id: 2, x: 145, y: 178 },
        { id: 3, x: 245, y: 42 }, { id: 4, x: 245, y: 178 }, { id: 5, x: 330, y: 110 }
      ],
      edges: [[0, 1, 2], [1, 3, 3], [2, 4, 3], [0, 2, 4], [1, 2, 5], [3, 5, 4], [4, 5, 6], [3, 4, 2]]
    }
  };

  SIMS[10] = {
    title: "UVa 11631 — Árbol de Expansión Mínima (Kruskal + DSU)",
    code: [
      "sort(edges by weight asc);",
      "for (auto [w, u, v] : edges) {",
      "  if (dsu.find(u) != dsu.find(v)) {",
      "    dsu.unite(u, v);       // unir componentes",
      "    mstCost += w; taken++;",
      "  } // else: mismo grupo ⇒ forma ciclo, descartar",
      "}",
      "ahorro = totalWeight - mstCost;"
    ],
    tableHeaders: ["Paso", "Arista (u,v,w)", "find(u) vs find(v)", "Decisión", "MST", "Aristas"],
    fields: [
      { id: "graph", label: "Grafo ponderado", type: "select", options: Object.entries(KRUSKAL_GRAPHS).map(([v, g]) => ({ v, l: g.label })) }
    ],
    presets: [
      { label: "Clase (4 nodos)", values: { graph: "clase" } },
      { label: "Red urbana (6 nodos)", values: { graph: "urbana" } }
    ],
    build(v) {
      const g = KRUSKAL_GRAPHS[v.graph] || KRUSKAL_GRAPHS.clase;
      const n = g.nodes.length;
      const sorted = [...g.edges].sort((a, b) => a[2] - b[2]);
      const totalW = sorted.reduce((s, e) => s + e[2], 0);
      const p = Array.from({ length: n }, (_, i) => i);
      const find = x => (p[x] === x ? x : (p[x] = find(p[x])));
      const getGroups = () => {
        const map = {};
        for (let i = 0; i < n; i++) { const r = find(i); (map[r] = map[r] || []).push(i); }
        return map;
      };
      const mst = [], rejected = [], steps = [];
      let mstCost = 0;

      steps.push({
        badge: "Ordenar aristas",
        title: `Cada vértice inicia en su propio conjunto DSU`,
        explain: `Ordenamos las ${sorted.length} aristas por peso ascendente (suma total = <code>${totalW}</code>). Buscamos exactamente <code>V − 1 = ${n - 1}</code> aristas sin crear ciclos.`,
        line: 0,
        vars: [{ k: "Total red", v: totalW }, { k: "MST", v: 0 }, { k: "Meta aristas", v: n - 1 }],
        row: ["Init", "Ordenadas", `${n} grupos`, "Iniciar DSU", "0", `0 / ${n - 1}`],
        vis: { g, sorted, curIdx: -1, mst: [], rejected: [], groups: getGroups(), mstCost: 0, totalW }
      });

      for (let i = 0; i < sorted.length; i++) {
        const [u, wNode, w] = sorted[i];
        const ru = find(u), rv = find(wNode);
        const accept = ru !== rv;
        if (accept) {
          p[rv] = ru;
          mst.push(i);
          mstCost += w;
        } else {
          rejected.push(i);
        }
        const groups = getGroups();
        steps.push({
          badge: accept ? `Aceptar (${u}-${wNode}, w=${w})` : `Descartar · Ciclo`,
          badgeCls: accept ? "ok" : "bad",
          title: accept ? `Unir componentes de ${u} y ${wNode} (+${w})` : `(${u}-${wNode}, w=${w}) cierra un ciclo → descartada`,
          explain: accept
            ? `<code>find(${u})=${ru} ≠ find(${wNode})=${rv}</code>: pertenecen a componentes distintas. Aceptamos la arista, unimos sus grupos y sumamos <code>+${w}</code> al MST (<code>${mstCost}</code>).`
            : `<code>find(${u}) == find(${wNode}) == ${ru}</code>: ya están conectados por aristas más baratas. Agregar esta arista formaría un <b>ciclo</b>, así que la omitimos.`,
          line: accept ? 3 : 5,
          vars: [{ k: "arista", v: `(${u}-${wNode}, w=${w})` }, { k: "MST", v: mstCost, cls: "ok" }, { k: "tomadas", v: `${mst.length}/${n - 1}` }],
          row: [String(i + 1), `(${u}, ${wNode}, ${w})`, `${ru} ${accept ? "≠" : "=="} ${rv}`, accept ? "Aceptar ✓" : "Descartar (ciclo)", String(mstCost), `${mst.length} / ${n - 1}`],
          vis: { g, sorted, curIdx: i, mst: [...mst], rejected: [...rejected], groups, mstCost, totalW }
        });
        if (mst.length === n - 1) break;
      }

      steps.push({
        badge: `MST = ${mstCost} · Ahorro = ${totalW - mstCost} ★`,
        badgeCls: "ok",
        title: `Árbol de expansión mínima completado`,
        explain: `Con <b>${n - 1}</b> aristas conectamos todos los vértices con costo mínimo <b><code>${mstCost}</code></b>. En UVa 11631 (Dark Roads) el ahorro total apagando calles redundantes es <code>${totalW} − ${mstCost} = ${totalW - mstCost}</code>.`,
        line: 7,
        vars: [{ k: "Costo MST", v: mstCost, cls: "ok" }, { k: "Ahorro", v: totalW - mstCost, cls: "ok" }],
        row: ["Fin", "Completo", "1 grupo", `Ahorro = ${totalW - mstCost}`, String(mstCost), `${n - 1} / ${n - 1} ★`],
        vis: { g, sorted, curIdx: -1, mst: [...mst], rejected: [...rejected], groups: getGroups(), mstCost, totalW, done: true }
      });

      return { steps, note: "Kruskal cuesta O(E log E) por el ordenamiento; las operaciones DSU con compresión de caminos cuestan O(α(V)) ≈ O(1)." };
    },
    render(step) {
      const { g, sorted, curIdx, mst, rejected, groups } = step.vis;
      const pos = Object.fromEntries(g.nodes.map(nd => [nd.id, nd]));
      const mstSet = new Set(mst), rejSet = new Set(rejected);
      const nodeColor = {};
      Object.values(groups).forEach((members, idx) => {
        const col = COMP_COLORS[idx % COMP_COLORS.length];
        members.forEach(m => { nodeColor[m] = col; });
      });

      const edgesSvg = sorted.map(([u, v, w], idx) => {
        const a = pos[u], b = pos[v], mx = (a.x + b.x) / 2, my = (a.y + b.y) / 2;
        const isCur = idx === curIdx, isMst = mstSet.has(idx), isRej = rejSet.has(idx);
        const col = isCur ? (isMst ? "var(--sim-green)" : "var(--sim-red)") : isMst ? "var(--sim-green)" : isRej ? "var(--sim-red)" : "var(--line)";
        const sw = isCur ? 4 : isMst ? 3.2 : 1.8;
        return `<line x1="${a.x}" y1="${a.y}" x2="${b.x}" y2="${b.y}" stroke="${col}" stroke-width="${sw}" ${isRej ? 'stroke-dasharray="5 4" opacity="0.55"' : ""}/>
          <circle cx="${mx}" cy="${my}" r="10" fill="var(--bg)" stroke="${col}" stroke-width="1.3"/>
          <text x="${mx}" y="${my + 3.5}" text-anchor="middle" fill="${isMst ? "var(--pos)" : isRej ? "var(--neg)" : "var(--ink)"}" font-size="10.5" font-weight="800" font-family="var(--f-mono)">${w}</text>`;
      }).join("");

      const nodesSvg = g.nodes.map(nd => `<circle cx="${nd.x}" cy="${nd.y}" r="17" fill="${nodeColor[nd.id]}" stroke="var(--surface)" stroke-width="2.2"/>
        <text x="${nd.x}" y="${nd.y + 4}" text-anchor="middle" fill="var(--sim-on-fill)" font-size="12.5" font-weight="800" font-family="var(--f-mono)">${nd.id}</text>`).join("");

      const listHtml = sorted.map(([u, v, w], idx) => {
        const cls = idx === curIdx ? "cur" : mstSet.has(idx) ? "ok" : rejSet.has(idx) ? "bad" : "";
        return `<div class="sim-list-item ${cls}"><span>(${u}–${v})</span><b>w=${w}</b></div>`;
      }).join("");

      const groupsHtml = Object.values(groups).map((m, idx) =>
        `<span style="display:inline-block;padding:2px 7px;border-radius:999px;font-family:var(--f-mono);font-size:.73rem;font-weight:700;color:var(--sim-on-fill);background:${COMP_COLORS[idx % COMP_COLORS.length]};margin:2px;">{${m.join(",")}}</span>`
      ).join("");

      return `<div class="sim-split">
        <svg viewBox="0 0 385 215" width="385" height="215" role="img" aria-label="Grafo Kruskal MST">${edgesSvg}${nodesSvg}</svg>
        <div style="display:grid;gap:8px;">
          <div class="sim-mini-panel"><div class="sim-mini-title">Aristas ordenadas</div><div class="sim-list">${listHtml}</div></div>
          <div class="sim-mini-panel"><div class="sim-mini-title">Componentes DSU</div><div>${groupsHtml}</div></div>
        </div>
      </div>`;
    }
  };

  // ------------------------------------------------------------------------
  // SEMANA 11 · UVa 10986 — Dijkstra SSSP (Cola de Prioridad + Obsoletos)
  // ------------------------------------------------------------------------
  const DIJKSTRA_GRAPHS = {
    uva10986: {
      label: "UVa 10986 Caso 2 (S=2 → T=0)",
      src: 2, dst: 0,
      nodes: [{ id: 0, x: 75, y: 110 }, { id: 1, x: 200, y: 45 }, { id: 2, x: 325, y: 110 }],
      edges: [[0, 1, 100], [0, 2, 200], [1, 2, 50]]
    },
    diamante: {
      label: "Atajo de 5 nodos (S=0 → T=4)",
      src: 0, dst: 4,
      nodes: [
        { id: 0, x: 52, y: 110 }, { id: 1, x: 155, y: 45 }, { id: 2, x: 155, y: 175 },
        { id: 3, x: 265, y: 110 }, { id: 4, x: 350, y: 110 }
      ],
      edges: [[0, 1, 10], [0, 2, 3], [2, 1, 4], [1, 3, 2], [2, 3, 8], [3, 4, 3], [1, 4, 9]]
    }
  };

  SIMS[11] = {
    title: "UVa 10986 — Algoritmo de Dijkstra (Relajación y Entradas Obsoletas)",
    code: [
      "dist.assign(n, INF); dist[S] = 0; pq.push({0, S});",
      "while (!pq.empty()) {",
      "  auto [d, u] = pq.top(); pq.pop();",
      "  if (d > dist[u]) continue;    // ¡descartar obsoleta!",
      "  for (auto [v, w] : adj[u])",
      "    if (d + w < dist[v]) {",
      "      dist[v] = d + w; pq.push({dist[v], v});",
      "    }",
      "}"
    ],
    tableHeaders: ["Paso", "Pop (d, u)", "¿Obsoleta?", "Relajaciones", "dist[]"],
    fields: [
      { id: "graph", label: "Grafo ponderado (w ≥ 0)", type: "select", options: Object.entries(DIJKSTRA_GRAPHS).map(([v, g]) => ({ v, l: g.label })) }
    ],
    presets: [
      { label: "UVa 10986 (S=2 → T=0)", values: { graph: "uva10986" } },
      { label: "Diamante 5 nodos (0 → 4)", values: { graph: "diamante" } }
    ],
    build(v) {
      const g = DIJKSTRA_GRAPHS[v.graph] || DIJKSTRA_GRAPHS.uva10986;
      const n = g.nodes.length;
      const adj = Array.from({ length: n }, () => []);
      g.edges.forEach(([a, b, w]) => { adj[a].push([b, w]); adj[b].push([a, w]); });
      const INF = 1e9;
      const dist = Array(n).fill(INF);
      dist[g.src] = 0;
      const pq = [{ d: 0, u: g.src }];
      const settled = new Set();
      const fmtD = x => (x >= INF ? "∞" : String(x));
      const steps = [];

      steps.push({
        badge: "Inicio",
        title: `dist[${g.src}] = 0, resto = ∞`,
        explain: `Insertamos el origen <code>(0, ${g.src})</code> en el min-heap <code>pq</code>. Buscamos la distancia mínima desde <b>${g.src}</b> hasta <b>${g.dst}</b>.`,
        line: 0,
        vars: [{ k: "Origen S", v: g.src }, { k: "Destino T", v: g.dst }, { k: "dist[]", v: `[${dist.map(fmtD).join(",")}]` }],
        row: ["Init", "—", "—", `dist[${g.src}] = 0`, `[${dist.map(fmtD).join(", ")}]`],
        vis: { g, dist: [...dist], pq: [...pq], active: null, settled: [], relaxed: [], obsolete: false }
      });

      let stepNum = 0;
      while (pq.length && stepNum < 25) {
        pq.sort((a, b) => a.d - b.d || a.u - b.u);
        const top = pq.shift();
        stepNum++;
        if (top.d > dist[top.u]) {
          steps.push({
            badge: `Paso ${stepNum} · Obsoleta ✕`,
            badgeCls: "warn",
            title: `Descartar (${top.d}, ${top.u}) porque ${top.d} > dist[${top.u}] (${dist[top.u]})`,
            explain: `Ya habíamos encontrado un camino más corto al nodo <code>${top.u}</code> con costo <code>${dist[top.u]}</code>. La guardia <code>if (d &gt; dist[u]) continue;</code> evita reprocesar sus vecinos.`,
            line: 3,
            vars: [{ k: "pop", v: `(${top.d},${top.u})`, cls: "warn" }, { k: `dist[${top.u}]`, v: dist[top.u] }],
            row: [String(stepNum), `(${top.d}, ${top.u})`, "Sí (ignorar)", "—", `[${dist.map(fmtD).join(", ")}]`],
            vis: { g, dist: [...dist], pq: [...pq], active: top.u, settled: [...settled], relaxed: [], obsolete: true, popped: top }
          });
          continue;
        }
        settled.add(top.u);
        const relaxed = [], relTxt = [];
        for (const [nb, w] of adj[top.u]) {
          if (top.d + w < dist[nb]) {
            const old = fmtD(dist[nb]);
            dist[nb] = top.d + w;
            pq.push({ d: dist[nb], u: nb });
            relaxed.push(`${Math.min(top.u, nb)}-${Math.max(top.u, nb)}`);
            relTxt.push(`v=${nb}: ${old}→${dist[nb]}`);
          }
        }
        pq.sort((a, b) => a.d - b.d || a.u - b.u);
        const reached = top.u === g.dst;
        steps.push({
          badge: reached ? `Destino T=${g.dst} · ${dist[g.dst]} ★` : `Paso ${stepNum} · Fija u=${top.u}`,
          badgeCls: reached ? "ok" : "",
          title: `Extrae (${top.d}, ${top.u})${reached ? ` → ¡Distancia óptima a T = ${top.d}!` : ""}`,
          explain: `Fijamos <code>dist[${top.u}] = ${top.d}</code>.${relTxt.length ? ` Relajamos: <code>${relTxt.join("; ")}</code>.` : " Ningún vecino mejora su distancia actual."}`,
          line: relTxt.length ? 6 : 2,
          vars: [{ k: "pop", v: `(${top.d},${top.u})` }, { k: `dist[${g.dst}]`, v: fmtD(dist[g.dst]), cls: reached ? "ok" : "" }],
          row: [String(stepNum), `(${top.d}, ${top.u})`, "No", relTxt.length ? relTxt.join("; ") : "Sin mejoras", `[${dist.map(fmtD).join(", ")}]`],
          vis: { g, dist: [...dist], pq: [...pq], active: top.u, settled: [...settled], relaxed, obsolete: false, popped: top }
        });
      }

      return { steps, note: "Dijkstra solo funciona con pesos w ≥ 0. Si existen aristas negativas usa Bellman-Ford (como en UVa 558 Wormholes)." };
    },
    render(step) {
      const { g, dist, pq, active, settled, relaxed, obsolete } = step.vis;
      const pos = Object.fromEntries(g.nodes.map(nd => [nd.id, nd]));
      const setS = new Set(settled), relS = new Set(relaxed);
      const fmtD = x => (x >= 1e9 ? "∞" : String(x));

      const edgesSvg = g.edges.map(([u, v, w]) => {
        const a = pos[u], b = pos[v], mx = (a.x + b.x) / 2, my = (a.y + b.y) / 2;
        const key = `${Math.min(u, v)}-${Math.max(u, v)}`;
        const isRel = relS.has(key);
        return `<line x1="${a.x}" y1="${a.y}" x2="${b.x}" y2="${b.y}" stroke="${isRel ? "var(--sim-cyan)" : "var(--line)"}" stroke-width="${isRel ? 3.5 : 2}"/>
          <rect x="${mx - 15}" y="${my - 9}" width="30" height="16" rx="5" fill="var(--bg)" stroke="${isRel ? "var(--sim-cyan)" : "var(--line)"}"/>
          <text x="${mx}" y="${my + 3}" text-anchor="middle" fill="${isRel ? "var(--accent)" : "var(--ink-2)"}" font-size="10" font-weight="800" font-family="var(--f-mono)">${w}</text>`;
      }).join("");

      const nodesSvg = g.nodes.map(nd => {
        const isAct = nd.id === active;
        const isSet = setS.has(nd.id);
        const fill = isAct ? (obsolete ? "var(--sim-amber)" : "var(--sim-cyan)") : isSet ? "var(--sim-green)" : "var(--surface)";
        const stroke = isAct ? "var(--sim-petrol)" : isSet ? "var(--sim-green)" : "var(--line)";
        const tc = (isAct || isSet) ? "var(--sim-on-fill)" : "var(--ink)";
        return `<circle cx="${nd.x}" cy="${nd.y}" r="18" fill="${fill}" stroke="${stroke}" stroke-width="${isAct ? 2.8 : 1.8}"/>
          <text x="${nd.x}" y="${nd.y + 4}" text-anchor="middle" fill="${tc}" font-size="12.5" font-weight="800" font-family="var(--f-mono)">${nd.id}</text>
          <rect x="${nd.x - 20}" y="${nd.y + 21}" width="40" height="15" rx="5" fill="var(--surface-2)" stroke="var(--line)"/>
          <text x="${nd.x}" y="${nd.y + 32}" text-anchor="middle" fill="var(--accent)" font-size="9.5" font-weight="700" font-family="var(--f-mono)">d=${fmtD(dist[nd.id])}</text>`;
      }).join("");

      const pqHtml = pq.length ? pq.map((e, i) => {
        const isObs = e.d > dist[e.u];
        return `<div class="sim-list-item ${i === 0 ? "cur" : ""} ${isObs ? "bad" : ""}"><span>(${e.d}, u=${e.u})</span><b>${isObs ? "obs." : "ok"}</b></div>`;
      }).join("") : `<span class="muted">(vacía)</span>`;

      return `<div class="sim-split">
        <svg viewBox="0 0 395 220" width="395" height="220" role="img" aria-label="Grafo Dijkstra">${edgesSvg}${nodesSvg}</svg>
        <div class="sim-mini-panel"><div class="sim-mini-title">Cola de prioridad (pq)</div><div class="sim-list">${pqHtml}</div></div>
      </div>`;
    }
  };

  // ------------------------------------------------------------------------
  // SEMANA 12 · UVa 820 — Edmonds-Karp Flujo Máximo & Corte Mínimo
  // ------------------------------------------------------------------------
  const FLOW_NETS = {
    uva820: {
      label: "UVa 820 (s=1, t=4 · red bidireccional)",
      s: 1, t: 4, undirected: true,
      nodes: [{ id: 1, x: 55, y: 110 }, { id: 2, x: 185, y: 45 }, { id: 3, x: 185, y: 175 }, { id: 4, x: 325, y: 110 }],
      edges: [[1, 2, 20], [1, 3, 10], [2, 3, 5], [2, 4, 10], [3, 4, 20]]
    },
    diamante: {
      label: "Red dirigida con arista inversa (s=1, t=4)",
      s: 1, t: 4, undirected: false,
      nodes: [{ id: 1, x: 55, y: 110 }, { id: 2, x: 185, y: 45 }, { id: 3, x: 185, y: 175 }, { id: 4, x: 325, y: 110 }],
      edges: [[1, 2, 10], [1, 3, 10], [2, 3, 2], [2, 4, 8], [3, 4, 10]]
    }
  };

  SIMS[12] = {
    title: "UVa 820 — Flujo Máximo (Edmonds-Karp) y Corte Mínimo",
    code: [
      "while (bfs_camino_aumentante(s, t, parent)) {",
      "  f = min capacidad residual en camino s -> t;",
      "  for (v = t; v != s; v = parent[v]) {",
      "    cap[parent[v]][v] -= f; // reducir directa",
      "    cap[v][parent[v]] += f; // aumentar inversa",
      "  }",
      "  maxFlow += f;",
      "}"
    ],
    tableHeaders: ["Iter.", "Camino BFS", "Cuello botella", "Flujo total", "Observación"],
    fields: [
      { id: "net", label: "Red de flujo", type: "select", options: Object.entries(FLOW_NETS).map(([v, g]) => ({ v, l: g.label })) }
    ],
    presets: [
      { label: "UVa 820 (MaxFlow=25)", values: { net: "uva820" } },
      { label: "Red dirigida (MaxFlow=18)", values: { net: "diamante" } }
    ],
    build(v) {
      const net = FLOW_NETS[v.net] || FLOW_NETS.uva820;
      const n = net.nodes.length;
      const cap = Array.from({ length: n + 1 }, () => Array(n + 1).fill(0));
      const orig = Array.from({ length: n + 1 }, () => Array(n + 1).fill(0));
      net.edges.forEach(([u, w, c]) => {
        cap[u][w] += c; orig[u][w] += c;
        if (net.undirected) { cap[w][u] += c; orig[w][u] += c; }
      });

      const snapshotEdges = () => net.edges.map(([u, w, c]) => {
        const flow = Math.max(0, orig[u][w] - cap[u][w]);
        const revFlow = net.undirected ? Math.max(0, orig[w][u] - cap[w][u]) : 0;
        const used = Math.max(flow, revFlow);
        return { u, v: w, cap: c, flow: used, remUV: cap[u][w], remVU: cap[w][u] };
      });

      const steps = [];
      let maxFlow = 0;
      steps.push({
        badge: "Inicio",
        title: `Red residual inicial (s=${net.s} → t=${net.t})`,
        explain: `Flujo inicial = <code>0</code>. En cada iteración, Edmonds-Karp ejecuta un <b>BFS</b> para hallar el camino aumentante con el menor número de aristas.`,
        line: 0,
        vars: [{ k: "s → t", v: `${net.s} → ${net.t}` }, { k: "maxFlow", v: 0 }],
        row: ["Init", "—", "—", "0", "Red lista"],
        vis: { net, edgesState: snapshotEdges(), path: [], maxFlow: 0, minCutS: null }
      });

      let iter = 0;
      while (iter < 15) {
        const parent = Array(n + 1).fill(-1);
        parent[net.s] = net.s;
        const q = [net.s];
        while (q.length && parent[net.t] === -1) {
          const u = q.shift();
          for (let nxt = 1; nxt <= n; nxt++) {
            if (parent[nxt] === -1 && cap[u][nxt] > 0) {
              parent[nxt] = u;
              q.push(nxt);
            }
          }
        }
        if (parent[net.t] === -1) {
          // Min-cut reachable set S
          const minCutS = [];
          for (let i = 1; i <= n; i++) if (parent[i] !== -1) minCutS.push(i);
          steps.push({
            badge: `Flujo Máximo = ${maxFlow} ★`,
            badgeCls: "ok",
            title: `No hay más caminos aumentantes → Corte Mínimo = ${maxFlow}`,
            explain: `El BFS desde <code>${net.s}</code> solo alcanza <code>S = {${minCutS.join(", ")}}</code>. Las aristas que cruzan de <code>S</code> hacia <code>T</code> están saturadas y su suma coincide exactamente con el flujo máximo: <b><code>${maxFlow}</code></b>.`,
            line: 7,
            vars: [{ k: "Max-Flow", v: maxFlow, cls: "ok" }, { k: "Corte S", v: `{${minCutS.join(",")}}` }],
            row: ["Fin", "Ninguno", "0", `${maxFlow} ★`, `Min-Cut S={${minCutS.join(",")}}`],
            vis: { net, edgesState: snapshotEdges(), path: [], maxFlow, minCutS }
          });
          break;
        }
        iter++;
        const path = [];
        let bottleneck = Infinity;
        for (let cur = net.t; cur !== net.s; cur = parent[cur]) {
          path.push([parent[cur], cur]);
          bottleneck = Math.min(bottleneck, cap[parent[cur]][cur]);
        }
        path.reverse();
        for (const [u, nxt] of path) {
          cap[u][nxt] -= bottleneck;
          cap[nxt][u] += bottleneck;
        }
        maxFlow += bottleneck;
        const pathStr = [net.s, ...path.map(([, b]) => b)].join(" → ");
        steps.push({
          badge: `Iteración ${iter} · +${bottleneck}`,
          badgeCls: "ok",
          title: `Camino BFS: ${pathStr} (cuello = ${bottleneck})`,
          explain: `BFS halla <b><code>${pathStr}</code></b>. La capacidad residual mínima a lo largo del camino es <b><code>${bottleneck}</code></b>. Empujamos ese flujo y actualizamos las capacidades residuales (<code>maxFlow = ${maxFlow}</code>).`,
          line: 6,
          vars: [{ k: "camino", v: pathStr }, { k: "cuello", v: `+${bottleneck}`, cls: "ok" }, { k: "maxFlow", v: maxFlow, cls: "ok" }],
          row: [String(iter), pathStr, String(bottleneck), String(maxFlow), `Empuja +${bottleneck}`],
          vis: { net, edgesState: snapshotEdges(), path, maxFlow, minCutS: null }
        });
      }

      return { steps, note: "Teorema Max-Flow Min-Cut: el flujo máximo que pasa de s a t siempre iguala la capacidad del corte mínimo que separa s de t." };
    },
    render(step) {
      const { net, edgesState, path, minCutS } = step.vis;
      const pos = Object.fromEntries(net.nodes.map(nd => [nd.id, nd]));
      const pathSet = new Set(path.map(([a, b]) => `${Math.min(a, b)}-${Math.max(a, b)}`));
      const sSet = minCutS ? new Set(minCutS) : null;

      const edgesSvg = edgesState.map(e => {
        const a = pos[e.u], b = pos[e.v], mx = (a.x + b.x) / 2, my = (a.y + b.y) / 2;
        const key = `${Math.min(e.u, e.v)}-${Math.max(e.u, e.v)}`;
        const inPath = pathSet.has(key);
        const isCut = sSet && ((sSet.has(e.u) && !sSet.has(e.v)) || (sSet.has(e.v) && !sSet.has(e.u)));
        const sat = e.flow >= e.cap;
        const col = isCut ? "var(--sim-red)" : inPath ? "var(--sim-cyan)" : sat ? "var(--sim-green)" : "var(--line)";
        return `<line x1="${a.x}" y1="${a.y}" x2="${b.x}" y2="${b.y}" stroke="${col}" stroke-width="${inPath || isCut ? 3.8 : 2.2}" ${isCut ? 'stroke-dasharray="6 3"' : ""}/>
          <rect x="${mx - 22}" y="${my - 10}" width="44" height="18" rx="6" fill="var(--bg)" stroke="${col}" stroke-width="1.3"/>
          <text x="${mx}" y="${my + 3}" text-anchor="middle" fill="${isCut ? "var(--neg)" : inPath ? "var(--accent)" : "var(--ink)"}" font-size="10.5" font-weight="800" font-family="var(--f-mono)">${e.flow}/${e.cap}</text>`;
      }).join("");

      const nodesSvg = net.nodes.map(nd => {
        const isS = nd.id === net.s, isT = nd.id === net.t;
        const inS = sSet && sSet.has(nd.id);
        const fill = isS ? "var(--sim-petrol)" : isT ? "var(--sim-green)" : inS ? "var(--sim-cyan)" : "var(--surface)";
        const stroke = isS || isT || inS ? "var(--surface)" : "var(--line)";
        const tc = (isS || isT || inS) ? "var(--sim-on-fill)" : "var(--ink)";
        return `<circle cx="${nd.x}" cy="${nd.y}" r="19" fill="${fill}" stroke="${stroke}" stroke-width="2.2"/>
          <text x="${nd.x}" y="${nd.y + 4}" text-anchor="middle" fill="${tc}" font-size="12.5" font-weight="800" font-family="var(--f-mono)">${nd.id}${isS ? "(s)" : isT ? "(t)" : ""}</text>`;
      }).join("");

      return `<svg viewBox="0 0 385 220" width="385" height="220" role="img" aria-label="Red de flujo Edmonds-Karp">${edgesSvg}${nodesSvg}</svg>`;
    }
  };

  // ------------------------------------------------------------------------
  // SEMANA 13 · UVa 374 — Exponenciación Binaria (B^P mod M)
  // ------------------------------------------------------------------------
  SIMS[13] = {
    title: "UVa 374 — Exponenciación Binaria Modular (B^P mod M)",
    code: [
      "res = 1 % M; base = B % M;",
      "while (p > 0) {",
      "  if (p & 1)                   // si bit bajo es 1",
      "    res = (res * base) % M;    // acumular potencia actual",
      "  base = (base * base) % M;    // elevar base al cuadrado",
      "  p >>= 1;                     // desplazar bits a la derecha",
      "}",
      "return res;"
    ],
    tableHeaders: ["Paso", "p (binario)", "Bit (p&1)", "base (mod M)", "res (mod M)"],
    fields: [
      { id: "B", label: "Base B", type: "number", min: 0, max: 100000, step: 1 },
      { id: "P", label: "Exp. P", type: "number", min: 0, max: 65535, step: 1 },
      { id: "M", label: "Mód. M", type: "number", min: 1, max: 100000, step: 1 }
    ],
    presets: [
      { label: "Clase (3¹³ mod 17)", values: { B: 3, P: 13, M: 17 } },
      { label: "UVa 374 (3¹⁸¹³² mod 17)", values: { B: 3, P: 18132, M: 17 } },
      { label: "2¹⁰ mod 1000", values: { B: 2, P: 10, M: 1000 } }
    ],
    build(v) {
      const B = BigInt(Math.max(0, Math.floor(toFinite(v.B, 3))));
      const P = BigInt(Math.max(0, Math.floor(toFinite(v.P, 13))));
      const M = BigInt(Math.max(1, Math.floor(toFinite(v.M, 17))));
      const origBin = P.toString(2);
      let p = P, base = B % M, res = 1n % M;
      const steps = [];

      steps.push({
        badge: "Inicio",
        title: `Descomponer P = ${P} en binario: ${origBin}₂`,
        explain: `Inicializamos <code>res = 1 mod ${M} = ${res}</code> y <code>base = ${B} mod ${M} = ${base}</code>. Solo necesitaremos <b>${origBin.length}</b> iteraciones (<code>O(log P)</code>).`,
        line: 0,
        vars: [{ k: "P", v: `${P} (${origBin}₂)` }, { k: "base", v: String(base) }, { k: "res", v: String(res) }],
        row: ["Init", `${P} (${origBin})`, "—", String(base), String(res)],
        vis: { origBin, bitPos: -1, p: String(p), base: String(base), res: String(res), bit: null, M: String(M), mult: false }
      });

      let k = 0;
      while (p > 0n) {
        const bit = Number(p & 1n);
        const prevRes = res, prevBase = base, prevP = p;
        if (bit === 1) res = (res * base) % M;
        const nextBase = (base * base) % M;
        const nextP = p >> 1n;
        steps.push({
          badge: `Paso ${k + 1} · bit = ${bit}`,
          badgeCls: bit ? "ok" : "",
          title: bit ? `Bit impar (1): res = (${prevRes} × ${prevBase}) mod ${M} = ${res}` : `Bit par (0): res se mantiene en ${res}`,
          explain: `${bit ? `Como <code>p &amp; 1 == 1</code>, multiplicamos <code>res = (${prevRes} × ${prevBase}) % ${M} = <b>${res}</b></code>.` : `Como <code>p &amp; 1 == 0</code>, <code>res</code> no cambia (<code>${res}</code>).`} Luego elevamos <code>base = ${prevBase}² % ${M} = <b>${nextBase}</b></code> y desplazamos <code>p: ${prevP} → ${nextP}</code>.`,
          line: bit ? 3 : 4,
          vars: [
            { k: "p", v: `${prevP} → ${nextP}` },
            { k: "bit", v: bit, cls: bit ? "ok" : "" },
            { k: "res", v: String(res), cls: bit ? "ok" : "" },
            { k: "base sig.", v: String(nextBase) }
          ],
          row: [String(k + 1), `${prevP} → ${nextP}`, bit ? "1 (impar)" : "0 (par)", `${prevBase} → ${nextBase}`, bit ? `${prevRes}×${prevBase} ≡ ${res}` : `${res} (=)`],
          vis: { origBin, bitPos: origBin.length - 1 - k, p: String(nextP), base: String(prevBase), nextBase: String(nextBase), res: String(res), prevRes: String(prevRes), bit, M: String(M), mult: bit === 1 }
        });
        base = nextBase; p = nextP; k++;
      }

      steps.push({
        badge: `Ans = ${res} ★`,
        badgeCls: "ok",
        title: `${B}^${P} mod ${M} = ${res}`,
        explain: `<code>p == 0</code>: terminamos en solo <b>${k}</b> iteraciones sin jamás calcular el número completo <code>${B}^${P}</code>.`,
        line: 7,
        vars: [{ k: "Resultado", v: String(res), cls: "ok" }, { k: "Iteraciones", v: k }],
        row: ["Fin", "0", "—", "—", `${res} ★`],
        vis: { origBin, bitPos: -1, p: "0", base: String(base), res: String(res), bit: null, M: String(M), done: true }
      });

      return { steps, note: `Complejidad O(log P): incluso para P = 2³¹ − 1 solo hace 31 iteraciones.` };
    },
    render(step) {
      const { origBin, bitPos, base, nextBase, res, prevRes, bit, M, mult, done } = step.vis;
      const bitsHtml = `<div style="text-align:center;margin-bottom:10px;">
        <div class="sim-lbl" style="margin-bottom:6px;">Bits de P (se leen de derecha a izquierda)</div>
        <div class="sim-cells">${[...origBin].map((b, i) => {
          const isCur = i === bitPos;
          const isDone = bitPos !== -1 && i > bitPos;
          const cls = isCur ? (b === "1" ? "ok" : "cur") : isDone ? "dim" : "";
          const pow = origBin.length - 1 - i;
          return `<div class="sim-cell ${cls}" style="min-width:34px;padding:4px 6px;">
            <span class="idx">2^${pow}</span>
            <span class="val">${b}</span>
          </div>`;
        }).join("")}</div>
      </div>`;

      const cards = `<div style="display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px;">
        <div class="sim-mini-panel" style="border-top:3px solid ${mult ? "var(--pos)" : "var(--line)"};">
          <div class="sim-mini-title">Acumulador res (mod ${M})</div>
          <div style="font-family:var(--f-mono);font-size:1.1rem;font-weight:800;color:${done || mult ? "var(--pos)" : "var(--ink)"};">${mult ? `${prevRes} × ${base} ≡ ${res}` : res}</div>
          <div class="small muted">${bit === 1 ? "bit=1 → multiplica por base" : bit === 0 ? "bit=0 → sin cambios" : done ? "Respuesta final ★" : "Valor inicial"}</div>
        </div>
        <div class="sim-mini-panel" style="border-top:3px solid var(--accent);">
          <div class="sim-mini-title">Potencia base (mod ${M})</div>
          <div style="font-family:var(--f-mono);font-size:1.1rem;font-weight:800;color:var(--accent);">${nextBase !== undefined ? `${base}² ≡ ${nextBase}` : base}</div>
          <div class="small muted">${nextBase !== undefined ? "Siempre se eleva al cuadrado" : "Base inicial"}</div>
        </div>
      </div>`;
      return bitsHtml + cards;
    }
  };

  // ------------------------------------------------------------------------
  // SEMANA 14 · UVa 350 — Floyd Tortuga y Liebre (Detección de Ciclos)
  // ------------------------------------------------------------------------
  SIMS[14] = {
    title: "UVa 350 — Algoritmo de Floyd (Tortuga 🐢 y Liebre 🐇)",
    code: [
      "// Fase 1: encontrar punto de encuentro t == h",
      "t = f(L); h = f(f(L));",
      "while (t != h) { t = f(t); h = f(f(h)); }",
      "// Fase 2: hallar inicio del ciclo μ",
      "h = L; while (t != h) { t = f(t); h = f(h); mu++; }",
      "// Fase 3: medir longitud del ciclo λ",
      "lam = 1; h = f(t);",
      "while (t != h) { h = f(h); lam++; }"
    ],
    tableHeaders: ["Paso", "Fase", "🐢 t", "🐇 h", "Estado"],
    fields: [
      { id: "Z", label: "Z", type: "number", min: 1, max: 23, step: 1 },
      { id: "I", label: "I", type: "number", min: 0, max: 23, step: 1 },
      { id: "M", label: "M (≤18)", type: "number", min: 3, max: 18, step: 1 },
      { id: "L", label: "Semilla L", type: "number", min: 0, max: 17, step: 1 }
    ],
    presets: [
      { label: "UVa 350 (7,5,12,4 · μ=0, λ=6)", values: { Z: 7, I: 5, M: 12, L: 4 } },
      { label: "Con cola ρ (2,1,18,0 · μ=1, λ=6)", values: { Z: 2, I: 1, M: 18, L: 0 } },
      { label: "Cola μ=2 (2,3,12,2 · μ=2, λ=2)", values: { Z: 2, I: 3, M: 12, L: 2 } }
    ],
    build(v) {
      const Z = Math.max(1, Math.floor(toFinite(v.Z, 7)));
      const I = Math.max(0, Math.floor(toFinite(v.I, 5)));
      const M = Math.max(3, Math.min(18, Math.floor(toFinite(v.M, 12))));
      const L = ((Math.floor(toFinite(v.L, 0)) % M) + M) % M;
      const f = x => (Z * x + I) % M;

      // Extract exact functional graph path (tail + cycle)
      const seen = new Map();
      const seq = [];
      let cur = L;
      while (!seen.has(cur)) { seen.set(cur, seq.length); seq.push(cur); cur = f(cur); }
      const muTrue = seen.get(cur);
      const tail = seq.slice(0, muTrue);
      const cycle = seq.slice(muTrue);

      const steps = [];
      steps.push({
        badge: "Inicio",
        title: `Secuencia f(x) = (${Z}x + ${I}) mod ${M} desde L = ${L}`,
        explain: `Tanto la tortuga 🐢 como la liebre 🐇 parten desde <code>L = ${L}</code>. La tortuga avanza 1 paso <code>f(t)</code> y la liebre 2 pasos <code>f(f(h))</code>.`,
        line: 1,
        vars: [{ k: "🐢 t", v: L }, { k: "🐇 h", v: L }, { k: "Fase", v: "Inicio" }],
        row: ["Init", "Inicio", String(L), String(L), `Semilla L=${L}`],
        vis: { tail, cycle, t: L, h: L, phase: 0, lam: 0, mu: 0 }
      });

      // Phase 1
      let t = f(L), h = f(f(L)), p1 = 1;
      while (t !== h && p1 < 30) {
        steps.push({
          badge: `Fase 1 · Paso ${p1}`,
          title: `🐢 t = ${t}, 🐇 h = ${h} (aún no coinciden)`,
          explain: `La tortuga avanza 1 paso a <code>${t}</code> y la liebre 2 pasos a <code>${h}</code>. Como <code>t ≠ h</code>, continuamos.`,
          line: 2,
          vars: [{ k: "🐢 t", v: t }, { k: "🐇 h", v: h }, { k: "t == h?", v: "No" }],
          row: [`1.${p1}`, "Fase 1", String(t), String(h), "t ≠ h"],
          vis: { tail, cycle, t, h, phase: 1, lam: 0, mu: 0 }
        });
        t = f(t); h = f(f(h)); p1++;
      }
      steps.push({
        badge: `Fase 1 · ¡Encuentro en ${t}!`,
        badgeCls: "ok",
        title: `¡Tortuga y liebre se encuentran en ${t}!`,
        explain: `En el paso ${p1}, ambos caen en <b><code>${t}</code></b> (un nodo garantizado dentro del ciclo).`,
        line: 2,
        vars: [{ k: "🐢 t", v: t, cls: "ok" }, { k: "🐇 h", v: h, cls: "ok" }, { k: "Encuentro", v: t, cls: "ok" }],
        row: [`1.${p1}`, "Fase 1", String(t), String(h), `¡Encuentro t=h=${t}!`],
        vis: { tail, cycle, t, h, phase: 1, lam: 0, mu: 0, met: true }
      });

      // Phase 2 (only show steps if mu > 0, or a quick note if mu == 0)
      let mu = 0; h = L;
      if (t !== h) {
        steps.push({
          badge: "Fase 2 · Buscar μ",
          badgeCls: "warn",
          title: `Reiniciar 🐇 h = L (${L}); ambos avanzan de 1 en 1`,
          explain: `Como <code>t (${t}) ≠ L (${L})</code>, hay una cola antes del ciclo (<code>μ &gt; 0</code>). Movemos ambos 1 paso a la vez hasta volver a coincidir en la entrada exacta del ciclo.`,
          line: 4,
          vars: [{ k: "🐢 t", v: t }, { k: "🐇 h", v: h }, { k: "μ", v: mu }],
          row: ["2.0", "Fase 2", String(t), String(h), "Reinicia h=L"],
          vis: { tail, cycle, t, h, phase: 2, lam: 0, mu }
        });
        while (t !== h && mu < 20) {
          t = f(t); h = f(h); mu++;
          steps.push({
            badge: t === h ? `Fase 2 · Inicio ciclo = ${t} (μ=${mu})` : `Fase 2 · μ = ${mu}`,
            badgeCls: t === h ? "ok" : "warn",
            title: t === h ? `Inicio exacto del ciclo en ${t} (μ = ${mu})` : `Avanzan 1 paso: 🐢 ${t}, 🐇 ${h}`,
            explain: t === h ? `Coinciden en <b><code>${t}</code></b> tras <code>μ = ${mu}</code> pasos: esa es la entrada del ciclo.` : `Siguen avanzando de 1 en 1: <code>t = ${t}</code>, <code>h = ${h}</code>.`,
            line: 4,
            vars: [{ k: "🐢 t", v: t }, { k: "🐇 h", v: h }, { k: "μ", v: mu, cls: t === h ? "ok" : "" }],
            row: [`2.${mu}`, "Fase 2", String(t), String(h), t === h ? `Inicio ciclo (μ=${mu})` : "t ≠ h"],
            vis: { tail, cycle, t, h, phase: 2, lam: 0, mu }
          });
        }
      }

      // Phase 3: count lambda
      let lam = 1; h = f(t);
      const counted = [h];
      while (h !== t && lam < 25) {
        steps.push({
          badge: `Fase 3 · λ = ${lam}`,
          title: `🐢 fijo en ${t}; 🐇 avanza a ${h} (λ = ${lam})`,
          explain: `Dejamos la tortuga fija en <code>${t}</code> y contamos cuántos saltos necesita la liebre para dar la vuelta completa al ciclo.`,
          line: 7,
          vars: [{ k: "🐢 fijo", v: t }, { k: "🐇 h", v: h }, { k: "λ", v: lam }],
          row: [`3.${lam}`, "Fase 3", `${t} (fijo)`, String(h), `Contando λ = ${lam}`],
          vis: { tail, cycle, t, h, phase: 3, lam, mu, counted: [...counted] }
        });
        h = f(h); lam++; counted.push(h);
      }

      steps.push({
        badge: `Resultado · μ=${mu}, λ=${lam} ★`,
        badgeCls: "ok",
        title: `Ciclo medido: longitud λ = ${lam} (cola μ = ${mu})`,
        explain: `La liebre regresa a <code>${t}</code> en exactamente <b><code>λ = ${lam}</code></b> pasos usando memoria <code>O(1)</code> (sin hash tables ni arreglos).`,
        line: 7,
        vars: [{ k: "cola μ", v: mu }, { k: "ciclo λ", v: lam, cls: "ok" }],
        row: ["Fin", "Completo", String(t), String(h), `μ = ${mu}, λ = ${lam} ★`],
        vis: { tail, cycle, t, h, phase: 3, lam, mu, counted: [...counted], done: true }
      });

      return { steps, note: `Floyd detecta μ y λ en tiempo O(μ + λ) y espacio estrictamente O(1) — solo dos punteros.` };
    },
    render(step) {
      const { tail, cycle, t, h } = step.vis;
      const coords = {};
      const cx = tail.length ? 305 : 230, cy = 112;
      const R = Math.min(76, Math.max(46, cycle.length * 11));
      cycle.forEach((val, i) => {
        const ang = Math.PI + (2 * Math.PI * i) / cycle.length;
        coords[val] = { x: cx + R * Math.cos(ang), y: cy + R * Math.sin(ang) };
      });
      if (tail.length) {
        const entry = coords[cycle[0]];
        const stepX = Math.min(54, (entry.x - 42) / tail.length);
        tail.forEach((val, i) => {
          coords[val] = { x: entry.x - (tail.length - i) * stepX, y: cy };
        });
      }

      const all = [...tail, ...cycle];
      const edges = [];
      for (let i = 0; i < tail.length; i++) edges.push([tail[i], i + 1 < tail.length ? tail[i + 1] : cycle[0]]);
      for (let i = 0; i < cycle.length; i++) edges.push([cycle[i], cycle[(i + 1) % cycle.length]]);

      const nr = 16;
      const edgesSvg = edges.map(([a, b]) => {
        const p1 = coords[a], p2 = coords[b];
        if (a === b) return `<path d="M ${p1.x + 12} ${p1.y - 12} C ${p1.x + 42} ${p1.y - 42}, ${p1.x + 42} ${p1.y + 42}, ${p1.x + 12} ${p1.y + 12}" fill="none" stroke="var(--ink-3)" stroke-width="1.8" marker-end="url(#fl-arr)"/>`;
        const dx = p2.x - p1.x, dy = p2.y - p1.y, len = Math.hypot(dx, dy) || 1;
        return `<line x1="${p1.x + (dx / len) * nr}" y1="${p1.y + (dy / len) * nr}" x2="${p2.x - (dx / len) * (nr + 5)}" y2="${p2.y - (dy / len) * (nr + 5)}" stroke="var(--ink-3)" stroke-width="1.8" marker-end="url(#fl-arr)"/>`;
      }).join("");

      const nodesSvg = all.map(val => {
        const p = coords[val];
        const hasT = val === t, hasH = val === h;
        const fill = (hasT && hasH) ? "var(--sim-green)" : hasT ? "var(--sim-petrol)" : hasH ? "var(--sim-cyan)" : "var(--surface)";
        const tc = (hasT || hasH) ? "var(--sim-on-fill)" : "var(--ink)";
        const tag = (hasT && hasH) ? "🐢🐇" : hasT ? "🐢" : hasH ? "🐇" : "";
        return `<circle cx="${p.x}" cy="${p.y}" r="${nr}" fill="${fill}" stroke="${hasT || hasH ? "var(--surface)" : "var(--line)"}" stroke-width="2"/>
          <text x="${p.x}" y="${p.y + 4}" text-anchor="middle" fill="${tc}" font-size="11.5" font-weight="800" font-family="var(--f-mono)">${val}</text>
          ${tag ? `<text x="${p.x}" y="${p.y - 20}" text-anchor="middle" font-size="13">${tag}</text>` : ""}`;
      }).join("");

      return `<svg viewBox="0 0 460 225" width="460" height="225" role="img" aria-label="Grafo funcional Floyd Tortuga y Liebre">
        <defs><marker id="fl-arr" viewBox="0 0 10 10" refX="7" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0,1 L9,5 L0,9 z" fill="var(--ink-3)"/></marker></defs>
        ${edgesSvg}${nodesSvg}
      </svg>`;
    }
  };

  // ------------------------------------------------------------------------
  // SEMANA 15 · UVa 10298 — KMP Función Prefijo π y Periodo
  // ------------------------------------------------------------------------
  SIMS[15] = {
    title: "UVa 10298 — Función Prefijo π de KMP y Periodo Mínimo",
    code: [
      "pi[0] = 0;",
      "for (int i = 1; i < n; i++) {",
      "  int j = pi[i - 1];",
      "  while (j > 0 && s[i] != s[j])",
      "    j = pi[j - 1];       // retroceso amortizado O(1)",
      "  if (s[i] == s[j]) j++; // extiende borde",
      "  pi[i] = j;",
      "}",
      "p = n - pi[n-1]; k = (n % p == 0) ? n / p : 1;"
    ],
    tableHeaders: ["Paso", "i", "j", "Comparación", "Acción", "pi[i]"],
    fields: [
      { id: "s", label: "Cadena s (≤12)", type: "text", width: "160px" }
    ],
    presets: [
      { label: "UVa 10298 (ababab · k=3)", values: { s: "ababab" } },
      { label: "Retroceso KMP (abacaba)", values: { s: "abacaba" } },
      { label: "Sin periodo (abcabd)", values: { s: "abcabd" } }
    ],
    build(v) {
      const s = (String(v.s || "ababab").replace(/\s+/g, "") || "ababab").slice(0, 12);
      const n = s.length;
      const pi = Array(n).fill(null);
      pi[0] = 0;
      const steps = [];

      steps.push({
        badge: "Inicio",
        title: `pi[0] = 0 (un solo carácter no tiene borde propio)`,
        explain: `<code>pi[i]</code> guarda la longitud del prefijo propio más largo de <code>s[0..i]</code> que también es sufijo de <code>s[0..i]</code>.`,
        line: 0,
        vars: [{ k: "s", v: `"${s}"` }, { k: "pi[0]", v: 0 }],
        row: ["Init", "0", "0", "—", "Caso base", "0"],
        vis: { s, pi: [...pi], i: 0, j: 0, match: null, fallback: false }
      });

      for (let i = 1; i < n; i++) {
        let j = pi[i - 1];
        while (j > 0 && s[i] !== s[j]) {
          const nextJ = pi[j - 1];
          steps.push({
            badge: `i=${i} · Retroceso`,
            badgeCls: "warn",
            title: `s[${i}]='${s[i]}' ≠ s[${j}]='${s[j]}' → retrocede j = pi[${j - 1}] = ${nextJ}`,
            explain: `No podemos extender el borde de longitud <code>${j}</code>. En lugar de reiniciar desde cero, saltamos al siguiente borde más largo: <code>j = pi[${j - 1}] = ${nextJ}</code>.`,
            line: 4,
            vars: [{ k: "i", v: i }, { k: "j", v: `${j} → ${nextJ}`, cls: "warn" }, { k: "comp", v: `'${s[i]}' ≠ '${s[j]}'`, cls: "bad" }],
            row: [String(steps.length), String(i), `${j}→${nextJ}`, `'${s[i]}' ≠ '${s[j]}'`, `j = pi[${j - 1}]`, "…"],
            vis: { s, pi: [...pi], i, j, match: false, fallback: true }
          });
          j = nextJ;
        }
        const matched = s[i] === s[j];
        if (matched) j++;
        pi[i] = j;
        steps.push({
          badge: matched ? `i=${i} · Match (+1)` : `i=${i} · pi[${i}]=0`,
          badgeCls: matched ? "ok" : "",
          title: matched ? `s[${i}] == s[${j - 1}] == '${s[i]}' → pi[${i}] = ${j}` : `s[${i}]='${s[i]}' ≠ s[0]='${s[0]}' → pi[${i}] = 0`,
          explain: matched
            ? `¡Coinciden! El borde crece a longitud <b><code>${j}</code></b>: prefijo <code>"${esc(s.slice(0, j))}"</code> == sufijo <code>"${esc(s.slice(i - j + 1, i + 1))}"</code>.`
            : `Con <code>j = 0</code> tampoco coincide con <code>s[0]</code>, por lo que <code>pi[${i}] = 0</code>.`,
          line: matched ? 5 : 6,
          vars: [{ k: "i", v: i }, { k: "pi[i]", v: j, cls: matched ? "ok" : "" }, { k: "borde", v: j ? `"${s.slice(0, j)}"` : "∅" }],
          row: [String(steps.length), String(i), String(j), matched ? `'${s[i]}' == '${s[j - 1]}'` : `'${s[i]}' ≠ '${s[0]}'`, matched ? "Extiende borde" : "Sin borde", String(j)],
          vis: { s, pi: [...pi], i, j, match: matched, fallback: false }
        });
      }

      const p = n - pi[n - 1];
      const divides = n % p === 0;
      const k = divides ? n / p : 1;
      steps.push({
        badge: `Potencia k = ${k} ★`,
        badgeCls: "ok",
        title: `Periodo p = ${n} − ${pi[n - 1]} = ${p} → k = ${k}`,
        explain: divides
          ? `Como <code>${n} % ${p} == 0</code>, la cadena completa es <b><code>"${esc(s.slice(0, p))}"</code></b> repetida <b><code>k = ${k}</code></b> veces.`
          : `Como <code>${n} % ${p} ≠ 0</code>, la cadena no es potencia exacta de un bloque menor ⇒ <b><code>k = 1</code></b>.`,
        line: 8,
        vars: [{ k: "p = n−π[n−1]", v: p }, { k: "k", v: k, cls: "ok" }, { k: "bloque", v: `"${s.slice(0, divides ? p : n)}"` }],
        row: ["Fin", String(n - 1), String(pi[n - 1]), `${n} % ${p} ${divides ? "==" : "≠"} 0`, `Periodo=${p}`, `k = ${k} ★`],
        vis: { s, pi: [...pi], i: n - 1, j: pi[n - 1], match: true, done: true, p: divides ? p : n, k }
      });

      return { steps, note: `Aunque hay un while dentro del for, j sube a lo sumo n veces y nunca baja de 0 ⇒ complejidad total estrictamente O(N).` };
    },
    render(step) {
      const { s, pi, i, j, match, fallback, done } = step.vis;
      const prefLen = fallback ? j : (pi[i] || 0);
      const sufStart = i - prefLen + 1;

      const cells = [...s].map((ch, idx) => {
        const isI = idx === i;
        const isJ = fallback ? idx === j : (match && idx === j - 1);
        const inPref = prefLen > 0 && idx < prefLen;
        const inSuf = prefLen > 0 && idx >= sufStart && idx <= i;
        const cls = isI ? (fallback ? "bad" : match ? "ok" : "cur") : isJ ? (fallback ? "src" : "ok") : (inPref || inSuf) ? "cur" : "";
        return `<div class="sim-cell ${cls}" style="min-width:40px;">
          <span class="idx">${idx}${isI ? " (i)" : isJ ? " (j)" : ""}</span>
          <span class="val">${esc(ch)}</span>
          <span class="sub">π=${pi[idx] === null ? "·" : pi[idx]}</span>
        </div>`;
      }).join("");

      const legend = prefLen > 0
        ? `<div class="small" style="text-align:center;margin-top:10px;font-family:var(--f-mono);">Prefijo <code>s[0..${prefLen - 1}] = "${esc(s.slice(0, prefLen))}"</code> ${fallback ? "vs" : "=="} Sufijo <code>s[${sufStart}..${i}] = "${esc(s.slice(sufStart, i + 1))}"</code></div>`
        : `<div class="small muted" style="text-align:center;margin-top:10px;">${done ? "Cálculo de función prefijo completado." : "Sin borde propio en esta posición."}</div>`;

      return `<div class="sim-cells">${cells}</div>${legend}`;
    }
  };

  // ------------------------------------------------------------------------
  // SEMANA 16 · UVa 10065 — Convex Hull (Monotone Chain) + Shoelace
  // ------------------------------------------------------------------------
  const POLY_PRESETS = {
    uva10065: {
      label: "UVa 10065 Caso 1 (5 vértices · 25%)",
      pts: [[0, 0], [2, 0], [2, 2], [1, 1], [0, 2]]
    },
    lshape: {
      label: "Polígono en L (6 vértices)",
      pts: [[0, 0], [3, 0], [3, 1], [1, 1], [1, 3], [0, 3]]
    },
    flecha: {
      label: "Flecha no convexa (6 vértices)",
      pts: [[0, 1], [2, 0], [4, 1], [3, 3], [2, 1], [1, 3]]
    }
  };

  SIMS[16] = {
    title: "UVa 10065 — Shoelace + Andrew's Monotone Chain (Enteros Exactos)",
    code: [
      "areaPoly2 = abs(shoelace(P));    // 2·Área en enteros",
      "sort(P by (x, y));               // sin atan2()",
      "// Cadena inferior (izquierda → derecha):",
      "for (p : P) {",
      "  while (L.size() >= 2 && cross(L[-2], L[-1], p) <= 0)",
      "    L.pop_back();                // giro horario/colineal",
      "  L.push_back(p);",
      "}",
      "// Repetir derecha → izquierda para cadena superior → % desperdicio"
    ],
    tableHeaders: ["Paso", "Fase", "Punto / Detalle", "Pila Hull", "Observación"],
    fields: [
      { id: "poly", label: "Polígono de prueba", type: "select", options: Object.entries(POLY_PRESETS).map(([v, g]) => ({ v, l: g.label })) }
    ],
    presets: [
      { label: "UVa 10065 Caso 1", values: { poly: "uva10065" } },
      { label: "Polígono en L", values: { poly: "lshape" } },
      { label: "Flecha", values: { poly: "flecha" } }
    ],
    build(v) {
      const pr = POLY_PRESETS[v.poly] || POLY_PRESETS.uva10065;
      const orig = pr.pts;
      const cross = (a, b, c) => (b[0] - a[0]) * (c[1] - a[1]) - (b[1] - a[1]) * (c[0] - a[0]);
      const shoelace2 = pts => {
        let s = 0;
        for (let i = 0; i < pts.length; i++) {
          const [x1, y1] = pts[i], [x2, y2] = pts[(i + 1) % pts.length];
          s += x1 * y2 - y1 * x2;
        }
        return Math.abs(s);
      };
      const fmtP = p => `(${p[0]},${p[1]})`;
      const areaPoly2 = shoelace2(orig);
      const sorted = [...orig].sort((a, b) => a[0] - b[0] || a[1] - b[1]);
      const steps = [];

      steps.push({
        badge: "1 · Shoelace",
        title: `Polígono original: 2·Área = ${areaPoly2} (Área = ${(areaPoly2 / 2).toFixed(1)})`,
        explain: `Calculamos el doble del área con la fórmula de Shoelace usando solo enteros: <code>2·A = |∑(xᵢyᵢ₊₁ − yᵢxᵢ₊₁)| = ${areaPoly2}</code>. Cero errores de punto flotante.`,
        line: 0,
        vars: [{ k: "2·Área_poly", v: areaPoly2 }, { k: "Área_poly", v: (areaPoly2 / 2).toFixed(1) }],
        row: ["1", "Shoelace", `${orig.length} vértices`, "—", `Área = ${(areaPoly2 / 2).toFixed(1)}`],
        vis: { orig, sorted, chain: [], upper: [], testPt: null, popped: null, phase: "poly", hull: null }
      });

      steps.push({
        badge: "2 · Ordenar (x,y)",
        title: `Ordenar vértices lexicográficamente por (x, y)`,
        explain: `Ordenados: <code>${sorted.map(fmtP).join(" → ")}</code>. Monotone Chain no usa ángulos ni <code>atan2()</code>.`,
        line: 1,
        vars: [{ k: "Ordenados", v: sorted.map(fmtP).join(" ") }],
        row: ["2", "Sort (x,y)", sorted.map(fmtP).join(", "), "[]", "Sin trigonométricas"],
        vis: { orig, sorted, chain: [], upper: [], testPt: null, popped: null, phase: "sort", hull: null }
      });

      // Lower hull
      const L = [];
      for (const p of sorted) {
        while (L.length >= 2 && cross(L[L.length - 2], L[L.length - 1], p) <= 0) {
          const a = L[L.length - 2], b = L[L.length - 1];
          const cr = cross(a, b, p);
          L.pop();
          steps.push({
            badge: "Inferior · POP ✕",
            badgeCls: "bad",
            title: `cross(${fmtP(a)}, ${fmtP(b)}, ${fmtP(p)}) = ${cr} ≤ 0 → sacar ${fmtP(b)}`,
            explain: `Al girar hacia ${fmtP(p)}, el vértice <code>${fmtP(b)}</code> queda interior o colineal (giro no-CCW). Lo expulsamos de la pila.`,
            line: 5,
            vars: [{ k: "cross", v: `${cr} ≤ 0`, cls: "bad" }, { k: "pop", v: fmtP(b), cls: "bad" }],
            row: [String(steps.length + 1), "Inferior", `pop ${fmtP(b)} ante ${fmtP(p)}`, L.map(fmtP).join("→"), `cross=${cr} ≤ 0`],
            vis: { orig, sorted, chain: [...L], upper: [], testPt: p, popped: b, phase: "lower", hull: null }
          });
        }
        L.push(p);
        steps.push({
          badge: "Inferior · Push",
          title: `Agregar ${fmtP(p)} a la cadena inferior`,
          explain: `${L.length <= 2 ? "Menos de 3 puntos: entra directo a la pila." : `<code>cross(${fmtP(L[L.length - 3])}, ${fmtP(L[L.length - 2])}, ${fmtP(p)}) &gt; 0</code> (giro CCW a la izquierda ✓).`}`,
          line: 6,
          vars: [{ k: "push", v: fmtP(p), cls: "ok" }, { k: "|L|", v: L.length }],
          row: [String(steps.length + 1), "Inferior", `push ${fmtP(p)}`, L.map(fmtP).join("→"), "Giro CCW ✓"],
          vis: { orig, sorted, chain: [...L], upper: [], testPt: p, popped: null, phase: "lower", hull: null }
        });
      }

      // Upper hull
      const U = [];
      for (let i = sorted.length - 1; i >= 0; i--) {
        const p = sorted[i];
        while (U.length >= 2 && cross(U[U.length - 2], U[U.length - 1], p) <= 0) {
          const a = U[U.length - 2], b = U[U.length - 1];
          const cr = cross(a, b, p);
          U.pop();
          steps.push({
            badge: "Superior · POP ✕",
            badgeCls: "bad",
            title: `cross(${fmtP(a)}, ${fmtP(b)}, ${fmtP(p)}) = ${cr} ≤ 0 → sacar ${fmtP(b)}`,
            explain: `En el barrido de regreso (derecha → izquierda), <code>${fmtP(b)}</code> queda interior al giro hacia <code>${fmtP(p)}</code>. Lo expulsamos.`,
            line: 8,
            vars: [{ k: "cross", v: `${cr} ≤ 0`, cls: "bad" }, { k: "pop", v: fmtP(b), cls: "bad" }],
            row: [String(steps.length + 1), "Superior", `pop ${fmtP(b)} ante ${fmtP(p)}`, U.map(fmtP).join("→"), `cross=${cr} ≤ 0`],
            vis: { orig, sorted, chain: [...L], upper: [...U], testPt: p, popped: b, phase: "upper", hull: null }
          });
        }
        U.push(p);
      }
      const hull = [...L.slice(0, -1), ...U.slice(0, -1)];
      const areaHull2 = shoelace2(hull);
      const waste = ((1 - areaPoly2 / areaHull2) * 100).toFixed(2);

      steps.push({
        badge: `Desperdicio = ${waste}% ★`,
        badgeCls: "ok",
        title: `Envolvente Convexa completa: 2·Área_hull = ${areaHull2}`,
        explain: `Hull = <code>[${hull.map(fmtP).join(", ")}]</code> con Área = <code>${(areaHull2 / 2).toFixed(1)}</code>. Desperdicio = <code>(1 − ${areaPoly2}/${areaHull2}) × 100 = <b>${waste}%</b></code>.`,
        line: 8,
        vars: [{ k: "Área poly", v: (areaPoly2 / 2).toFixed(1) }, { k: "Área hull", v: (areaHull2 / 2).toFixed(1), cls: "ok" }, { k: "Desperdicio", v: `${waste}%`, cls: "ok" }],
        row: ["Fin", "Hull completo", hull.map(fmtP).join("→"), `2·A=${areaHull2}`, `Desperdicio = ${waste}% ★`],
        vis: { orig, sorted, chain: [...L], upper: [...U], testPt: null, popped: null, phase: "done", hull }
      });

      return { steps, note: `Andrew's Monotone Chain corre en O(N log N) usando exclusivamente aritmética entera para el producto cruz.` };
    },
    render(step) {
      const { orig, sorted, chain, upper, testPt, popped, hull } = step.vis;
      const xs = orig.map(p => p[0]), ys = orig.map(p => p[1]);
      const minX = Math.min(0, ...xs), maxX = Math.max(2, ...xs);
      const minY = Math.min(0, ...ys), maxY = Math.max(2, ...ys);
      const pad = 34, W = 380, H = 220;
      const scale = Math.min((W - 2 * pad) / Math.max(1, maxX - minX), (H - 2 * pad) / Math.max(1, maxY - minY));
      const ox = (W - (maxX - minX) * scale) / 2;
      const oy = H - (H - (maxY - minY) * scale) / 2;
      const px = p => ox + (p[0] - minX) * scale;
      const py = p => oy - (p[1] - minY) * scale;

      let grid = "";
      for (let x = minX; x <= maxX; x++) {
        const sx = px([x, 0]);
        grid += `<line x1="${sx}" y1="${py([0, maxY])}" x2="${sx}" y2="${py([0, minY])}" stroke="var(--line)" stroke-dasharray="2 3" opacity="0.7"/>`;
      }
      for (let y = minY; y <= maxY; y++) {
        const sy = py([0, y]);
        grid += `<line x1="${px([minX, 0])}" y1="${sy}" x2="${px([maxX, 0])}" y2="${sy}" stroke="var(--line)" stroke-dasharray="2 3" opacity="0.7"/>`;
      }

      const polyPts = orig.map(p => `${px(p)},${py(p)}`).join(" ");
      const hullSvg = hull ? `<polygon points="${hull.map(p => `${px(p)},${py(p)}`).join(" ")}" fill="rgba(217,130,43,.22)" stroke="var(--sim-green)" stroke-width="3"/>` : "";
      const polySvg = `<polygon points="${polyPts}" fill="rgba(33,184,210,.22)" stroke="var(--sim-petrol)" stroke-width="2"/>`;
      const lowSvg = !hull && chain.length >= 2 ? `<polyline points="${chain.map(p => `${px(p)},${py(p)}`).join(" ")}" fill="none" stroke="var(--sim-green)" stroke-width="3.2"/>` : "";
      const upSvg = !hull && upper.length >= 2 ? `<polyline points="${upper.map(p => `${px(p)},${py(p)}`).join(" ")}" fill="none" stroke="var(--sim-amber)" stroke-width="3"/>` : "";

      const ptsSvg = sorted.map(p => {
        const x = px(p), y = py(p);
        const isTest = testPt && p[0] === testPt[0] && p[1] === testPt[1];
        const isPop = popped && p[0] === popped[0] && p[1] === popped[1];
        const fill = isPop ? "var(--sim-red)" : isTest ? "var(--sim-cyan)" : "var(--accent)";
        return `<circle cx="${x}" cy="${y}" r="${isTest || isPop ? 7.5 : 5.5}" fill="${fill}" stroke="var(--surface)" stroke-width="1.8"/>
          <text x="${x + 8}" y="${y - 7}" fill="${isPop ? "var(--neg)" : "var(--ink)"}" font-size="10" font-weight="700" font-family="var(--f-mono)">(${p[0]},${p[1]})</text>`;
      }).join("");

      return `<svg viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" role="img" aria-label="Plano cartesiano Convex Hull">${grid}${hullSvg}${polySvg}${lowSvg}${upSvg}${ptsSvg}</svg>`;
    }
  };

  // ========================================================================
  // VALIDACIÓN Y SANEAMIENTO DE ENTRADAS (REFLEJA CAMBIOS AL USUARIO)
  // ========================================================================
  const LIST_SPECS = {
    2: { c: { maxLen: 10, min: 1, max: 999, minLen: 1, def: [1, 2, 3, 4, 5], sep: "," } },
    3: { seq: { maxLen: 12, min: -999, max: 9999, minLen: 1, def: [1, 3, 4, 60, 70, 50, 2], sep: ", " } },
    4: { A: { maxLen: 8, min: -99, max: 99, minLen: 4, def: [3, 2, 5, 1, 4, 2, 6, 3], sep: "," } },
    5: { tracks: { maxLen: 4, min: 1, max: 40, minLen: 1, def: [1, 3, 4], sep: "," } },
    7: { coins: { maxLen: 5, min: 1, max: 20, minLen: 1, def: [1, 5, 10], sep: ",", unique: true } }
  };

  function sanitizeValues(weekNum, def, raw) {
    const clean = { ...def.presets[0].values };
    const warnings = [];
    const adjustedFields = new Set();
    const wk = Number(weekNum);
    const listSpecs = LIST_SPECS[wk] || {};

    def.fields.forEach(f => {
      const val = raw[f.id];
      const fallback = def.presets[0].values[f.id];
      if (f.type === "select") {
        const valid = (f.options || []).some(o => String(o.v) === String(val));
        clean[f.id] = valid ? val : fallback;
        if (!valid) { adjustedFields.add(f.id); warnings.push(`${f.label}: opción no válida, se usó el valor por defecto.`); }
        return;
      }
      if (f.type === "number") {
        const str = String(val ?? "").trim();
        const num = str === "" ? NaN : Number(str);
        if (!Number.isFinite(num)) {
          clean[f.id] = fallback;
          adjustedFields.add(f.id);
          warnings.push(`${f.label}: valor vacío o inválido; se restauró a ${fallback}.`);
          return;
        }
        let v = num;
        if (f.min !== undefined && v < f.min) {
          v = f.min; adjustedFields.add(f.id);
          warnings.push(`${f.label}: ajustado al mínimo permitido (${f.min}).`);
        }
        if (f.max !== undefined && v > f.max) {
          v = f.max; adjustedFields.add(f.id);
          warnings.push(`${f.label}: ajustado al máximo permitido (${f.max}).`);
        }
        clean[f.id] = v;
        return;
      }
      if (listSpecs[f.id]) {
        const spec = listSpecs[f.id];
        const parsed = parseNumsDetailed(val, spec.maxLen, spec.min, spec.max);
        let nums = parsed.nums;
        if (spec.unique) {
          const uniq = [...new Set(nums)];
          if (uniq.length < nums.length) {
            adjustedFields.add(f.id);
            warnings.push(`${f.label}: se eliminaron valores repetidos.`);
          }
          nums = uniq;
        }
        if (parsed.invalid > 0) {
          adjustedFields.add(f.id);
          warnings.push(`${f.label}: se ignoraron ${parsed.invalid} dato(s) no numérico(s).`);
        }
        if (parsed.truncated > 0) {
          adjustedFields.add(f.id);
          warnings.push(`${f.label}: se usaron los primeros ${spec.maxLen} elementos (máximo permitido).`);
        }
        if (parsed.clamped > 0) {
          adjustedFields.add(f.id);
          warnings.push(`${f.label}: ${parsed.clamped} valor(es) se ajustaron al rango [${spec.min}, ${spec.max}].`);
        }
        if (nums.length < spec.minLen) {
          nums = [...spec.def];
          adjustedFields.add(f.id);
          warnings.push(`${f.label}: requiere al menos ${spec.minLen} número(s) válido(s); se usó [${nums.join(", ")}].`);
        }
        clean[f.id] = nums.join(spec.sep);
        return;
      }
      if (wk === 6 && f.id === "field") {
        const original = String(val ?? "").trim();
        const filtered = original.replace(/[^.#]/g, "");
        let s = filtered.slice(0, 14);
        if (filtered.length !== original.length) {
          adjustedFields.add(f.id);
          warnings.push(`${f.label}: se descartaron caracteres distintos de '.' y '#'.`);
        }
        if (filtered.length > 14) {
          adjustedFields.add(f.id);
          warnings.push(`${f.label}: se recortó a los primeros 14 caracteres.`);
        }
        if (!s) {
          s = ".#.###...";
          adjustedFields.add(f.id);
          warnings.push(`${f.label}: entrada vacía o sin celdas válidas; se usó «${s}».`);
        }
        clean[f.id] = s;
        return;
      }
      if (wk === 8 && (f.id === "A" || f.id === "B")) {
        const trimmed = String(val ?? "").trim();
        let s = trimmed.slice(0, 6);
        if (trimmed.length > 6) {
          adjustedFields.add(f.id);
          warnings.push(`${f.label}: se recortó a 6 caracteres para la matriz DP.`);
        }
        if (!s) {
          s = String(fallback);
          adjustedFields.add(f.id);
          warnings.push(`${f.label}: cadena vacía; se usó «${s}».`);
        }
        clean[f.id] = s;
        return;
      }
      if (wk === 15 && f.id === "s") {
        const original = String(val ?? "");
        const compact = original.replace(/\s+/g, "");
        let s = compact.slice(0, 12);
        if (compact.length !== original.trim().length) {
          adjustedFields.add(f.id);
          warnings.push(`${f.label}: se eliminaron espacios internos.`);
        }
        if (compact.length > 12) {
          adjustedFields.add(f.id);
          warnings.push(`${f.label}: se recortó a 12 caracteres.`);
        }
        if (!s) {
          s = String(fallback);
          adjustedFields.add(f.id);
          warnings.push(`${f.label}: cadena vacía; se usó «${s}».`);
        }
        clean[f.id] = s;
        return;
      }
      clean[f.id] = String(val ?? fallback);
    });

    if (wk === 2) {
      const arrLen = parseNums(clean.c, 10, 1, 999).length;
      if (clean.m > arrLen + 2) {
        clean.m = arrLen + 2;
        adjustedFields.add("m");
        warnings.push(`Contenedores m: ajustado a ${clean.m} según la cantidad de recipientes.`);
      }
    }
    if (wk === 4) {
      const arrLen = parseNums(clean.A, 8, -99, 99).length;
      if (clean.idx > arrLen) {
        clean.idx = arrLen;
        adjustedFields.add("idx");
        warnings.push(`Índice idx: ajustado al tamaño actual del arreglo (${arrLen}).`);
      }
    }
    if (wk === 14 && clean.L >= clean.M) {
      const modL = ((Math.floor(clean.L) % clean.M) + clean.M) % clean.M;
      warnings.push(`Semilla L: reducida módulo M=${clean.M} a ${modL}.`);
      clean.L = modL;
      adjustedFields.add("L");
    }

    return { clean, warnings, adjustedFields };
  }

  // ========================================================================
  // MOTOR DE MONTAJE DE SIMULADORES EN EL DOM
  // ========================================================================
  const activeTimers = new WeakMap();

  function mount(host, weekNum) {
    const def = SIMS[Number(weekNum)];
    if (!host || !def) return null;

    // Limpiar timer previo si existía
    if (activeTimers.has(host)) { clearInterval(activeTimers.get(host)); activeTimers.delete(host); }

    let values = { ...def.presets[0].values };
    let activePreset = 0;
    let model = def.build(values);
    let idx = 0;
    let playing = false;
    let speed = 1300; // ms
    let quizMode = false;
    let revealed = true;
    let showAllRows = false;

    host.innerHTML = `<div class="sim-root" data-sim-week="${weekNum}">
      <div class="sim-top">
        <div class="sim-presets" role="group" aria-label="Casos de prueba predefinidos">
          <span class="sim-lbl">Casos:</span>
          ${def.presets.map((p, i) => `<button type="button" class="sim-chip" data-preset="${i}" aria-pressed="${i === 0}">${esc(p.label)}</button>`).join("")}
        </div>
        <div class="sim-opts">
          <button type="button" class="sim-btn sm" data-act="quiz" aria-pressed="false" title="Oculta la explicación de cada paso para preguntar primero en clase">Modo clase (ocultar)</button>
        </div>
      </div>

      <details class="sim-custom-box" data-el="custom-box">
        <summary>Personalizar datos de entrada</summary>
        <form class="sim-inputs" data-sim-form novalidate>
          ${def.fields.map(f => {
            if (f.type === "select") {
              return `<label class="sim-field" data-field="${esc(f.id)}">${esc(f.label)} <select name="${esc(f.id)}">${f.options.map(o => `<option value="${esc(o.v)}">${esc(o.l)}</option>`).join("")}</select></label>`;
            }
            return `<label class="sim-field" data-field="${esc(f.id)}">${esc(f.label)} <input type="${esc(f.type)}" name="${esc(f.id)}" ${f.min !== undefined ? `min="${f.min}"` : ""} ${f.max !== undefined ? `max="${f.max}"` : ""} ${f.step !== undefined ? `step="${f.step}"` : ""} ${f.width ? `style="width:${f.width}"` : ""}></label>`;
          }).join("")}
          <button type="submit" class="sim-btn sm prim">Simular</button>
        </form>
      </details>
      <div class="sim-feedback" data-el="feedback" role="status" aria-live="polite" hidden></div>

      <div class="sim-ctrl">
        <div class="sim-transport" role="group" aria-label="Controles paso a paso">
          <button type="button" class="sim-btn sm" data-act="first" title="Ir al inicio" aria-label="Ir al inicio">⏮</button>
          <button type="button" class="sim-btn sm" data-act="prev" title="Paso anterior (tecla [)" aria-label="Paso anterior">◀ Ant.</button>
          <button type="button" class="sim-btn sm prim" data-act="play" title="Reproducir / Pausar" aria-pressed="false">▶ Play</button>
          <button type="button" class="sim-btn sm" data-act="next" title="Paso siguiente (tecla ])" aria-label="Paso siguiente">Sig. ▶</button>
          <button type="button" class="sim-btn sm" data-act="last" title="Ir al final" aria-label="Ir al final">⏭</button>
        </div>
        <div class="sim-scrubber">
          <input type="range" min="0" max="0" value="0" data-act="range" aria-label="Línea de tiempo paso a paso">
          <span class="sim-step-cnt" data-el="cnt">Paso 1 / 1</span>
        </div>
        <div class="sim-opts">
          <button type="button" class="sim-btn sm" data-act="speed" title="Velocidad de reproducción" aria-label="Velocidad de reproducción: 1×">1×</button>
        </div>
      </div>

      <div class="sim-main">
        <div class="sim-stage-wrap">
          <div class="sim-stage" data-el="stage"></div>
          <div class="sim-vars" data-el="vars"></div>
        </div>
        <div class="sim-side">
          <div class="sim-narration" data-el="narr" aria-live="polite" aria-atomic="true">
            <span class="sim-badge" data-el="badge"></span>
            <div class="sim-step-title" data-el="title"></div>
            <div class="sim-exp-body"><p data-el="explain"></p></div>
            <div class="sim-reveal-bar" data-el="revbar" hidden>
              <button type="button" class="sim-btn sm prim" data-act="reveal">Revelar explicación</button>
            </div>
          </div>
          <div class="sim-code" data-el="code">
            <div class="sim-code-title">Algoritmo en ejecución (línea activa)</div>
            ${def.code.map((ln, i) => `<div class="sim-cline" data-ln="${i}"><span class="ln">${i + 1}</span><span>${esc(ln)}</span></div>`).join("")}
          </div>
        </div>
      </div>

      <div class="sim-trace-wrap">
        <div class="sim-trace-head">
          <span class="sim-lbl">Traza progresiva (haz clic en cualquier fila para saltar a ese paso)</span>
          <button type="button" class="sim-btn sm" data-act="allrows" aria-pressed="false">Ver traza completa</button>
        </div>
        <div class="sim-trace-scroll">
          <table class="sim-trace-tbl">
            <thead><tr>${def.tableHeaders.map(h => `<th>${esc(h)}</th>`).join("")}</tr></thead>
            <tbody data-el="tbody"></tbody>
          </table>
        </div>
        <p class="small muted" style="margin:8px 0 0;" data-el="note"></p>
      </div>
    </div>`;

    const q = sel => host.querySelector(sel);
    const form = q("[data-sim-form]");
    const range = q('[data-act="range"]');
    const btnPlay = q('[data-act="play"]');
    const btnPrev = q('[data-act="prev"]');
    const btnNext = q('[data-act="next"]');
    const btnFirst = q('[data-act="first"]');
    const btnLast = q('[data-act="last"]');
    const btnSpeed = q('[data-act="speed"]');
    const btnQuiz = q('[data-act="quiz"]');
    const btnReveal = q('[data-act="reveal"]');
    const btnAllRows = q('[data-act="allrows"]');

    const feedbackEl = q('[data-el="feedback"]');
    const showFeedback = (warnings, adjustedFields) => {
      host.querySelectorAll(".sim-field").forEach(lbl => {
        lbl.classList.toggle("is-adjusted", !!(adjustedFields && adjustedFields.has(lbl.dataset.field)));
      });
      if (!warnings || !warnings.length) {
        feedbackEl.hidden = true;
        feedbackEl.innerHTML = "";
        return;
      }
      feedbackEl.hidden = false;
      feedbackEl.innerHTML = `<div><strong>Entrada ajustada:</strong> ${warnings.map(esc).join(" ")}</div><button type="button" class="sim-feedback-dismiss" aria-label="Cerrar aviso">✕</button>`;
      const dis = feedbackEl.querySelector(".sim-feedback-dismiss");
      if (dis) dis.addEventListener("click", () => showFeedback([], null));
    };

    const syncForm = () => {
      def.fields.forEach(f => {
        const el = form.elements[f.id];
        if (el) el.value = values[f.id] ?? "";
      });
    };

    const stopPlay = () => {
      if (activeTimers.has(host)) { clearInterval(activeTimers.get(host)); activeTimers.delete(host); }
      playing = false;
      btnPlay.textContent = "▶ Play";
      btnPlay.setAttribute("aria-pressed", "false");
    };

    const startPlay = () => {
      if (playing) return;
      if (idx >= model.steps.length - 1) idx = 0;
      playing = true;
      btnPlay.textContent = "⏸ Pausar";
      btnPlay.setAttribute("aria-pressed", "true");
      const t = setInterval(() => {
        if (!host.isConnected) { stopPlay(); return; }
        if (idx < model.steps.length - 1) {
          goTo(idx + 1, true);
        } else {
          stopPlay();
        }
      }, speed);
      activeTimers.set(host, t);
    };

    const rebuildRows = () => {
      const tbody = q('[data-el="tbody"]');
      tbody.innerHTML = model.steps.map((st, i) =>
        `<tr data-step-idx="${i}" tabindex="0" role="button" aria-label="Ir al paso ${i + 1}: ${esc(st.title || st.badge || "")}">${st.row.map(c => `<td>${esc(c)}</td>`).join("")}</tr>`
      ).join("");
      tbody.querySelectorAll("tr").forEach(tr => {
        const activate = () => { stopPlay(); goTo(Number(tr.dataset.stepIdx)); };
        tr.addEventListener("click", activate);
        tr.addEventListener("keydown", e => {
          if (e.key === "Enter" || e.key === " ") { e.preventDefault(); activate(); }
        });
      });
      range.max = String(Math.max(0, model.steps.length - 1));
      q('[data-el="note"]').textContent = "Nota: " + model.note;
    };

    const renderStep = () => {
      const step = model.steps[idx] || model.steps[0];
      const total = model.steps.length;
      q('[data-el="cnt"]').textContent = `Paso ${idx + 1} / ${total}`;
      range.value = String(idx);
      range.setAttribute("aria-valuetext", `Paso ${idx + 1} de ${total}: ${step.title || ""}`);
      btnFirst.disabled = btnPrev.disabled = idx === 0;
      btnLast.disabled = btnNext.disabled = idx === total - 1;

      // Stage + Variables
      q('[data-el="stage"]').innerHTML = def.render(step, values);
      q('[data-el="vars"]').innerHTML = (step.vars || []).map(vr =>
        `<span class="sim-var ${vr.cls || ""}"><span>${esc(vr.k)}:</span> <b>${esc(vr.v)}</b></span>`
      ).join("");

      // Narration
      const badge = q('[data-el="badge"]');
      badge.textContent = step.badge || `Paso ${idx + 1}`;
      badge.className = "sim-badge " + (step.badgeCls || "");
      q('[data-el="title"]').textContent = step.title || "";
      q('[data-el="explain"]').innerHTML = step.explain || "";
      const narr = q('[data-el="narr"]');
      const shouldMask = quizMode && !revealed && idx > 0;
      narr.classList.toggle("masked", shouldMask);
      q('[data-el="revbar"]').hidden = !shouldMask;

      // Highlight active code line
      const lines = Array.isArray(step.line) ? step.line : [step.line];
      host.querySelectorAll(".sim-cline").forEach(el => {
        el.classList.toggle("active", lines.includes(Number(el.dataset.ln)));
      });

      // Progressive table
      const rows = host.querySelectorAll('[data-el="tbody"] tr');
      rows.forEach((tr, i) => {
        tr.classList.toggle("sim-row-cur", i === idx);
        tr.classList.toggle("sim-row-future", showAllRows && i > idx);
        tr.classList.toggle("sim-row-hidden", !showAllRows && i > idx);
      });
      const curRow = rows[idx];
      if (curRow && curRow.scrollIntoView) {
        const sc = curRow.closest(".sim-trace-scroll");
        if (sc) sc.scrollTop = Math.max(0, curRow.offsetTop - sc.clientHeight + curRow.offsetHeight + 12);
      }
    };

    const goTo = (nextIdx, fromAuto) => {
      idx = Math.max(0, Math.min(model.steps.length - 1, nextIdx));
      revealed = fromAuto ? true : !quizMode;
      renderStep();
    };

    const rerun = () => {
      stopPlay();
      model = def.build(values);
      idx = 0;
      revealed = true;
      rebuildRows();
      renderStep();
    };

    // Preset clicks
    host.querySelectorAll("[data-preset]").forEach(btn => {
      btn.addEventListener("click", () => {
        activePreset = Number(btn.dataset.preset);
        values = { ...def.presets[activePreset].values };
        host.querySelectorAll("[data-preset]").forEach(b => b.setAttribute("aria-pressed", String(Number(b.dataset.preset) === activePreset)));
        showFeedback([], null);
        syncForm();
        rerun();
      });
    });

    // Form submit / select change
    form.addEventListener("submit", e => {
      e.preventDefault();
      const raw = {};
      def.fields.forEach(f => {
        const el = form.elements[f.id];
        if (el) raw[f.id] = el.value;
      });
      const { clean, warnings, adjustedFields } = sanitizeValues(weekNum, def, raw);
      values = clean;
      syncForm();
      showFeedback(warnings, adjustedFields);
      const cbox = q('[data-el="custom-box"]');
      if (cbox && warnings.length) cbox.open = true;
      host.querySelectorAll("[data-preset]").forEach(b => b.setAttribute("aria-pressed", "false"));
      rerun();
    });
    form.querySelectorAll("select").forEach(sel => sel.addEventListener("change", () => form.requestSubmit ? form.requestSubmit() : form.dispatchEvent(new Event("submit"))));

    // Transport buttons
    btnFirst.addEventListener("click", () => { stopPlay(); goTo(0); });
    btnPrev.addEventListener("click", () => { stopPlay(); goTo(idx - 1); });
    btnNext.addEventListener("click", () => { stopPlay(); goTo(idx + 1); });
    btnLast.addEventListener("click", () => { stopPlay(); goTo(model.steps.length - 1); });
    btnPlay.addEventListener("click", () => { if (playing) stopPlay(); else startPlay(); });
    range.addEventListener("input", () => { stopPlay(); goTo(Number(range.value)); });

    const speeds = [{ label: "0.7×", ms: 1900 }, { label: "1×", ms: 1300 }, { label: "1.8×", ms: 720 }];
    let spIdx = 1;
    btnSpeed.addEventListener("click", () => {
      spIdx = (spIdx + 1) % speeds.length;
      speed = speeds[spIdx].ms;
      btnSpeed.textContent = speeds[spIdx].label;
      btnSpeed.setAttribute("aria-label", `Velocidad de reproducción: ${speeds[spIdx].label}`);
      if (playing) { stopPlay(); startPlay(); }
    });

    btnQuiz.addEventListener("click", () => {
      quizMode = !quizMode;
      btnQuiz.setAttribute("aria-pressed", String(quizMode));
      btnQuiz.classList.toggle("active", quizMode);
      revealed = !quizMode;
      renderStep();
    });
    btnReveal.addEventListener("click", () => { revealed = true; renderStep(); });

    btnAllRows.addEventListener("click", () => {
      showAllRows = !showAllRows;
      btnAllRows.setAttribute("aria-pressed", String(showAllRows));
      btnAllRows.classList.toggle("active", showAllRows);
      btnAllRows.textContent = showAllRows ? "Mostrar solo hasta paso actual" : "Ver traza completa";
      renderStep();
    });

    syncForm();
    rebuildRows();
    renderStep();

    const api = {
      next: () => { stopPlay(); goTo(idx + 1); },
      prev: () => { stopPlay(); goTo(idx - 1); },
      togglePlay: () => { if (playing) stopPlay(); else startPlay(); },
      stop: stopPlay
    };
    host._simApi = api;
    return api;
  }

  function mountAll(root) {
    (root || document).querySelectorAll("[data-sim-week]").forEach(el => {
      if (!el.classList.contains("sim-root")) mount(el, el.dataset.simWeek);
    });
  }

  // ========================================================================
  // CALCULADORA INTERACTIVA DE COMPLEJIDAD (N → Big-O → AC / TLE)
  // ========================================================================
  function mountComplexityLab(host) {
    if (!host) return;
    const EXPS = [
      { n: 10, lbl: "10" }, { n: 20, lbl: "20" }, { n: 40, lbl: "40" },
      { n: 100, lbl: "100" }, { n: 500, lbl: "500" }, { n: 2000, lbl: "2.000" },
      { n: 10000, lbl: "10⁴" }, { n: 100000, lbl: "10⁵" }, { n: 500000, lbl: "5×10⁵" },
      { n: 1000000, lbl: "10⁶" }, { n: 10000000, lbl: "10⁷" }, { n: 1000000000, lbl: "10⁹" }
    ];
    const fmtOps = x => {
      if (!Number.isFinite(x) || x > 1e18) return "> 10¹⁸";
      if (x < 1000) return Math.round(x).toLocaleString("es-CO");
      const e = Math.floor(Math.log10(x));
      const m = x / Math.pow(10, e);
      return `${m.toFixed(1)}×10^${e}`;
    };
    const fact = n => { if (n > 20) return Infinity; let r = 1; for (let i = 2; i <= n; i++) r *= i; return r; };

    let curIdx = 7; // 10^5
    let lang = "cpp";
    host.innerHTML = `<div class="cplx-box">
      <div class="cplx-ctrl">
        <label class="sim-field" style="flex:1 1 200px;min-width:0;">
          Tamaño de entrada <b>N = <span data-el="nval" style="color:var(--accent);font-family:var(--f-mono);">10⁵</span></b>
          <input type="range" min="0" max="${EXPS.length - 1}" value="${curIdx}" data-el="slider" aria-valuetext="N = 10⁵" style="flex:1;min-width:90px;accent-color:var(--accent);cursor:pointer;">
        </label>
        <div class="sim-presets" role="group" aria-label="Lenguaje del presupuesto">
          <button type="button" class="sim-chip" data-cl="cpp" aria-pressed="true">C++17 (~10⁸ ops/s)</button>
          <button type="button" class="sim-chip" data-cl="java" aria-pressed="false">Java (~4×10⁷ ops/s)</button>
          <button type="button" class="sim-chip" data-cl="py" aria-pressed="false">Python 3 (~10⁷ ops/s)</button>
        </div>
      </div>
      <div class="cplx-grid" data-el="grid"></div>
    </div>`;

    const render = () => {
      const N = EXPS[curIdx].n;
      const budget = lang === "cpp" ? 1e8 : lang === "java" ? 4e7 : 1e7;
      host.querySelector('[data-el="nval"]').textContent = EXPS[curIdx].lbl;
      const sl = host.querySelector('[data-el="slider"]');
      if (sl) sl.setAttribute("aria-valuetext", `N = ${EXPS[curIdx].lbl}`);
      const items = [
        { name: "O(log N)", ops: Math.log2(N), ex: "Búsqueda binaria, GCD" },
        { name: "O(N)", ops: N, ex: "Kadane, BFS/DFS, KMP" },
        { name: "O(N log N)", ops: N * Math.log2(N), ex: "Sort, Dijkstra, BIT" },
        { name: "O(N²)", ops: N * N, ex: "DP 2D (LCS), Bellman-Ford" },
        { name: "O(N³)", ops: N * N * N, ex: "Floyd-Warshall, Max 2D" },
        { name: "O(2ᴺ)", ops: N > 60 ? Infinity : Math.pow(2, N), ex: "Bitmask DP, subconjuntos" },
        { name: "O(N!)", ops: fact(N), ex: "Permutaciones completas" }
      ];
      host.querySelector('[data-el="grid"]').innerHTML = items.map(it => {
        const ratio = it.ops / budget;
        const cls = ratio <= 0.45 ? "ac" : ratio <= 1.5 ? "warn" : "tle";
        const pill = cls === "ac" ? "p-rapido" : cls === "warn" ? "p-medio" : "p-largo";
        const txt = cls === "ac" ? "AC ✓" : cls === "warn" ? "Al límite" : "TLE ✕";
        return `<div class="cplx-card ${cls}">
          <div class="cc-top"><span>${it.name}</span><span class="pill ${pill}">${txt}</span></div>
          <div class="cc-ops">~${fmtOps(it.ops)} ops</div>
          <div class="small muted" style="font-size:.73rem;margin-top:2px;">${it.ex}</div>
        </div>`;
      }).join("");
    };

    host.querySelector('[data-el="slider"]').addEventListener("input", e => { curIdx = Number(e.target.value); render(); });
    host.querySelectorAll("[data-cl]").forEach(b => b.addEventListener("click", () => {
      lang = b.dataset.cl;
      host.querySelectorAll("[data-cl]").forEach(x => x.setAttribute("aria-pressed", String(x.dataset.cl === lang)));
      render();
    }));
    render();
  }

  // ========================================================================
  // LABORATORIO INTERACTIVO DE NOTACIÓN BIG-O (SEMANA 01)
  // ========================================================================
  function mountBigOLab(host) {
    if (!host) return;

    const PATTERNS = [
      {
        id: "O1", label: "O(1) · Constante", complexity: "O(1)",
        title: "Acceso directo / Fórmula cerrada (Gauss)",
        code: [
          "// Sumar 1 + 2 + ... + n sin bucles",
          "long long suma(long long n) {",
          "  return n * (n + 1) / 2;",
          "}"
        ],
        steps: [
          { t: "Contar operaciones", d: "1 suma (<code>n+1</code>), 1 multiplicación, 1 división y 1 retorno ⇒ exactamente <code>T(n) = 4</code> operaciones." },
          { t: "Dependencia respecto a n", d: "Da igual si <code>n = 10</code> o <code>n = 10⁹</code>: siempre se ejecutan las mismas 4 operaciones elementales." },
          { t: "Eliminar constante", d: "<code>T(n) = 4 · 1</code>. Al quitar el factor constante <code>4</code> obtenemos la clase constante." },
          { t: "Conclusión: O(1)", d: "Tiempo <b>constante</b>. Con <code>N = 10⁹</code> hace solo <b>4 ops</b> → AC instantáneo (~0.000001 s)." }
        ],
        sample: "N = 10⁹ → 4 operaciones (AC instantáneo)"
      },
      {
        id: "Ologn", label: "O(log n) · Logarítmico", complexity: "O(log n)",
        title: "Dividir el problema a la mitad en cada paso",
        code: [
          "// ¿Cuántas veces cabe dividir n entre 2?",
          "int pasos = 0;",
          "while (n > 1) {",
          "  n /= 2;     // reduce el tamaño a la mitad",
          "  pasos++;",
          "}"
        ],
        steps: [
          { t: "Observar cómo se reduce n", d: "Tras 1 paso queda <code>n/2</code>; tras 2 pasos <code>n/4</code>; tras <code>k</code> pasos queda <code>n / 2ᵏ</code>." },
          { t: "Condición de parada", d: "El bucle termina cuando <code>n / 2ᵏ = 1</code>, es decir, cuando <code>2ᵏ = n</code>." },
          { t: "Despejar k con logaritmo", d: "Aplicando <code>log₂</code> a ambos lados: <code>k = log₂(n)</code> iteraciones (cada iteración cuesta <code>O(1)</code>)." },
          { t: "Conclusión: O(log n)", d: "Base irrelevante en Big-O (<code>log₂ n</code> y <code>log₁₀ n</code> solo difieren en una constante). Con <code>N = 10⁹</code> hace solo <b>~30 iteraciones</b>!" }
        ],
        sample: "N = 1.000.000 → solo ~20 iteraciones; N = 10⁹ → ~30 iteraciones"
      },
      {
        id: "On", label: "O(n) · Lineal", complexity: "O(n)",
        title: "Un barrido lineal (ej. UVa 11799 / Kadane)",
        code: [
          "// Hallar el máximo de un arreglo de tamaño n",
          "int best = a[0];",
          "for (int i = 1; i < n; i++) {",
          "  if (a[i] > best) best = a[i];",
          "}"
        ],
        steps: [
          { t: "Contar iteraciones del bucle", d: "El índice <code>i</code> recorre <code>1, 2, …, n−1</code>: exactamente <code>n − 1</code> iteraciones." },
          { t: "Trabajo dentro de cada iteración", d: "1 comparación + a lo sumo 1 asignación + 1 incremento = <code>c ≈ 3</code> operaciones constantes." },
          { t: "Expresión exacta T(n)", d: "<code>T(n) = 1 + 3(n − 1) = 3n − 2</code>." },
          { t: "Conclusión: O(n)", d: "Ignoramos el término constante <code>−2</code> y el factor <code>3</code> ⇒ <b><code>O(n)</code></b>. Con <code>N = 10⁶</code> hace ~10⁶ ops (~0.01 s en C++)." }
        ],
        sample: "N = 10⁶ → ~10⁶ ops (~0.01 s en C++ → AC)"
      },
      {
        id: "Onlogn", label: "O(n log n) · Lineal-log", complexity: "O(n log n)",
        title: "Ordenamiento (sort) o bucle n × búsqueda binaria",
        code: [
          "// Para cada elemento i, dividir j por 2",
          "for (int i = 0; i < n; i++) {       // n veces",
          "  for (int j = n; j > 1; j /= 2) {  // log₂ n veces",
          "    ops++;",
          "  }",
          "}"
        ],
        steps: [
          { t: "Bucle externo", d: "Se ejecuta exactamente <code>n</code> veces (<code>i = 0 … n−1</code>)." },
          { t: "Bucle interno por cada i", d: "Como <code>j</code> se divide por 2 en cada paso, ejecuta <code>⌊log₂ n⌋</code> iteraciones." },
          { t: "Regla de anidamiento (multiplicar)", d: "Bucles anidados independientes se multiplican: <code>T(n) = n · log₂(n)</code>." },
          { t: "Conclusión: O(n log n)", d: "Es el estándar de oro para <code>N ≤ 5×10⁵</code>: con <code>N = 2×10⁵</code> hace <code>2×10⁵ × 18 ≈ 3.6×10⁶</code> ops (AC holgado)." }
        ],
        sample: "N = 200.000 → ~3.5×10⁶ ops (~0.04 s en C++ → AC)"
      },
      {
        id: "On2", label: "O(n²) · Cuadrático (triangular)", complexity: "O(n²)",
        title: "Doble bucle triangular (j empieza en i)",
        code: [
          "// Comparar todos los pares (i, j) con i <= j",
          "for (int i = 0; i < n; i++) {",
          "  for (int j = i; j < n; j++) {",
          "    ops++;   // ¿cuántas veces se ejecuta?",
          "  }",
          "}"
        ],
        steps: [
          { t: "Contar iteraciones por cada fila i", d: "Para <code>i=0</code> hace <code>n</code> pasos; para <code>i=1</code> hace <code>n−1</code>; …; para <code>i=n−1</code> hace <code>1</code> paso." },
          { t: "Sumar la serie aritmética", d: "<code>T(n) = n + (n−1) + … + 1 = n(n + 1) / 2</code>." },
          { t: "Expandir el polinomio", d: "<code>T(n) = ½ n² + ½ n</code>. ¡Aunque sea la mitad de un cuadrado completo, sigue teniendo <code>n²</code>!" },
          { t: "Conclusión: O(n²)", d: "Eliminamos el término menor <code>½n</code> y la constante <code>½</code> ⇒ <b><code>O(n²)</code></b>. Pasa con <code>N ≤ 5.000</code>, pero da <b>TLE</b> con <code>N = 10⁵</code> (5×10⁹ ops)." }
        ],
        sample: "N = 5.000 → 1.25×10⁷ ops (AC) · N = 10⁵ → 5×10⁹ ops (TLE ✕)"
      },
      {
        id: "O2n", label: "O(2ⁿ) · Exponencial", complexity: "O(2ⁿ)",
        title: "Recursión que se ramifica en 2 llamadas",
        code: [
          "// Generar los 2ⁿ subconjuntos (tomar / omitir)",
          "void dfs(int i) {",
          "  if (i == n) return;",
          "  dfs(i + 1);   // rama 1: tomar elemento i",
          "  dfs(i + 1);   // rama 2: omitir elemento i",
          "}"
        ],
        steps: [
          { t: "Contar nodos por nivel del árbol", d: "Nivel 0: 1 nodo; Nivel 1: 2; Nivel 2: 4; …; Nivel <code>n</code>: <code>2ⁿ</code> hojas." },
          { t: "Sumar todo el árbol binario", d: "<code>T(n) = 1 + 2 + 4 + … + 2ⁿ = 2ⁿ⁺¹ − 1 = 2 · 2ⁿ − 1</code>." },
          { t: "Simplificar", d: "Quitamos el <code>−1</code> y la constante multiplicativa <code>2</code> ⇒ <b><code>O(2ⁿ)</code></b>." },
          { t: "Conclusión: O(2ⁿ)", d: "Cada +1 en <code>n</code> <b>duplica</b> el tiempo. Viable para <code>N ≤ 20</code> (2²⁰ ≈ 10⁶ ops); con <code>N = 40</code> ya supera 10¹² (TLE)." }
        ],
        sample: "N = 20 → 10⁶ ops (AC) · N = 35 → 3.4×10¹⁰ ops (TLE ✕)"
      }
    ];

    const QUIZ = [
      {
        q: "¿Cuál es la complejidad de este doble bucle triangular?",
        code: "for (int i = 0; i < n; i++)\n  for (int j = i; j < n; j++)\n    total += a[i] * a[j];",
        opts: ["O(n)", "O(n log n)", "O(n²)", "O(2ⁿ)"],
        ans: 2,
        exp: "Ejecuta n + (n−1) + … + 1 = n(n+1)/2 = ½n² + ½n operaciones. Al quitar constantes y términos menores queda O(n²)."
      },
      {
        q: "Tienes dos arreglos de tamaños N y M (independientes). ¿Cuál es el Big-O?",
        code: "for (int i = 0; i < N; i++) sumA += A[i];\nfor (int j = 0; j < M; j++) sumB += B[j];",
        opts: ["O(N · M)", "O(N + M)", "O(N²)", "O(max(N, M)²)"],
        ans: 1,
        exp: "Son bucles SECUENCIALES (uno después del otro), no anidados. Por eso sus tiempos se suman: O(N) + O(M) = O(N + M)."
      },
      {
        q: "¿Cuál es la complejidad exacta de este fragmento?",
        code: "for (int i = 0; i < n; i++)\n  for (int j = 1; j <= n; j *= 2)\n    cnt++;",
        opts: ["O(n)", "O(log n)", "O(n log n)", "O(n²)"],
        ans: 2,
        exp: "El bucle externo corre n veces y, por cada i, j se duplica (1, 2, 4, …, n) tomando log₂(n) pasos. Al estar anidados se multiplican: O(n log n)."
      },
      {
        q: "Simplifica f(n) = 5000 · n · log(n) + 0.001 · n² + 10⁶ en notación Big-O:",
        code: "f(n) = 5000 · n log(n) + 0.001 · n² + 10⁶",
        opts: ["O(n log n)", "O(n²)", "O(10⁶)", "O(n² log n)"],
        ans: 1,
        exp: "Aunque 0.001 parezca diminuto frente a 5000, asintóticamente n² siempre termina superando a n log n cuando n crece lo suficiente. Queda O(n²)."
      },
      {
        q: "Un problema de UVa tiene N ≤ 200.000 y límite de 1 segundo en C++. ¿Qué complejidad necesitas?",
        code: "N ≤ 2 × 10⁵   |   Presupuesto C++ ≈ 10⁸ ops/s",
        opts: ["O(N²) pasa sobrado", "O(N log N) o O(N)", "O(2ᴺ) con podas", "O(N³) optimizado con -O2"],
        ans: 1,
        exp: "Con N = 2×10⁵, O(N²) hace 4×10¹⁰ ops (~400 s → TLE). En cambio O(N log N) hace ~3.5×10⁶ ops (~0.04 s → AC seguro)."
      }
    ];

    let activeTab = 0;
    let patIdx = 4; // empezar en O(n²) triangular o O(1)? Empezar en 0 (O(1)) para recorrer de menor a mayor!
    patIdx = 0;
    let patStep = 3; // mostrar hasta paso actual (0..3)
    let quizAnswers = Array(QUIZ.length).fill(null);

    const uid = "bigo-" + Math.random().toString(36).slice(2, 7);
    host.innerHTML = `<div class="bigo-lab">
      <div class="bigo-tabs" role="tablist" aria-label="Explorador de notación Big-O">
        <button type="button" class="bigo-tab" role="tab" id="${uid}-t0" aria-controls="${uid}-p0" data-btab="0" aria-selected="true" tabindex="0">1 · Qué es Big-O (O, Ω, Θ)</button>
        <button type="button" class="bigo-tab" role="tab" id="${uid}-t1" aria-controls="${uid}-p1" data-btab="1" aria-selected="false" tabindex="-1">2 · Código → Big-O paso a paso</button>
        <button type="button" class="bigo-tab" role="tab" id="${uid}-t2" aria-controls="${uid}-p2" data-btab="2" aria-selected="false" tabindex="-1">3 · Curvas y regla 10⁸ ops/s</button>
        <button type="button" class="bigo-tab" role="tab" id="${uid}-t3" aria-controls="${uid}-p3" data-btab="3" aria-selected="false" tabindex="-1">4 · Mini-Reto (5 preguntas)</button>
      </div>
      <div class="bigo-pane" role="tabpanel" id="${uid}-p0" aria-labelledby="${uid}-t0" data-bpane="0"></div>
      <div class="bigo-pane" role="tabpanel" id="${uid}-p1" aria-labelledby="${uid}-t1" data-bpane="1" hidden></div>
      <div class="bigo-pane" role="tabpanel" id="${uid}-p2" aria-labelledby="${uid}-t2" data-bpane="2" hidden></div>
      <div class="bigo-pane" role="tabpanel" id="${uid}-p3" aria-labelledby="${uid}-t3" data-bpane="3" hidden></div>
    </div>`;

    // ---- TAB 0: Definición formal + intuición + 4 reglas ----
    host.querySelector('[data-bpane="0"]').innerHTML = `
      <p class="small" style="margin:0 0 10px;"><b>¿Por qué existe Big-O?</b> Medir un programa en segundos depende del procesador y del lenguaje. En el <b>Modelo RAM</b> (Skiena Cap. 2) contamos cuántas <em>operaciones elementales</em> (sumas, comparaciones, accesos a arreglos) ejecuta el algoritmo al crecer el tamaño de entrada <b><code>N</code></b>.</p>
      <div class="bigo-grid-3">
        <div class="bigo-card">
          <div class="bigo-card-title">O(g(n)) · Cota superior ("a lo sumo")</div>
          <span class="bigo-formula">f(n) ≤ c · g(n) ∀ n ≥ n₀</span>
          <p class="small muted" style="margin:0;">Es el <b>techo de peor caso</b>: garantiza al juez que el tiempo no crecerá más rápido que <code>g(n)</code>. Ej.: buscar un dato en un arreglo sin ordenar toma <code>O(n)</code> en el peor caso (está al final o no existe).</p>
        </div>
        <div class="bigo-card warn">
          <div class="bigo-card-title">Ω(g(n)) · Cota inferior ("al menos")</div>
          <span class="bigo-formula">f(n) ≥ c · g(n) ∀ n ≥ n₀</span>
          <p class="small muted" style="margin:0;">Es el <b>piso mínimo</b> del problema o mejor caso. Ej.: búsqueda lineal puede hallarlo en el índice 0 (<code>Ω(1)</code>); cualquier algoritmo de ordenamiento por comparaciones requiere al menos <code>Ω(n log n)</code>.</p>
        </div>
        <div class="bigo-card pos">
          <div class="bigo-card-title">Θ(g(n)) · Cota ajustada ("del mismo orden")</div>
          <span class="bigo-formula">c₁·g(n) ≤ f(n) ≤ c₂·g(n)</span>
          <p class="small muted" style="margin:0;">Se cumple cuando es simultáneamente <code>O(g(n))</code> y <code>Ω(g(n))</code>. Ej.: sumar todos los elementos de un arreglo siempre visita los <code>n</code> elementos ⇒ <b><code>Θ(n)</code></b>.</p>
        </div>
      </div>

      <div class="bigo-rules">
        <div class="bigo-rule"><b>Regla 1 · Ignorar constantes multiplicativas</b><code>5n → O(n)</code>, <code>½n² → O(n²)</code>. Multiplicar por una constante no cambia la forma de la curva.</div>
        <div class="bigo-rule"><b>Regla 2 · Quedarse con el término dominante</b><code>3n² + 40n + 100 → O(n²)</code>. Para <code>n</code> grande, <code>n²</code> opaca por completo a <code>40n</code>.</div>
        <div class="bigo-rule"><b>Regla 3 · Bloques secuenciales se SUMAN</b>Un bucle de <code>n</code> seguido de uno de <code>m</code> cuesta <code>O(n + m)</code> (y <code>O(n) + O(n²) = O(n²)</code>).</div>
        <div class="bigo-rule"><b>Regla 4 · Bloques anidados se MULTIPLICAN</b>Un bucle de <code>n</code> que adentro ejecuta algo <code>O(log n)</code> cuesta <code>O(n log n)</code>.</div>
      </div>

      <div class="aviso mt" style="margin-top:10px;padding:9px 12px;">
        <div class="small"><b>Jerarquía de crecimiento (de más rápido a más lento):</b> <code>O(1) &lt; O(log n) &lt; O(√n) &lt; O(n) &lt; O(n log n) &lt; O(n²) &lt; O(n³) &lt; O(2ⁿ) &lt; O(n!)</code> · Recuerda también usar <code>long long</code> si sumas/productos superan <code>2.1×10⁹</code> y <code>|a−b| &lt; 1e-9</code> en flotantes.</div>
      </div>
    `;

    // ---- TAB 1: Código → Big-O paso a paso ----
    const pane1 = host.querySelector('[data-bpane="1"]');
    const renderPat = () => {
      const p = PATTERNS[patIdx];
      pane1.innerHTML = `
        <div class="sim-presets" style="margin-bottom:10px;">
          <span class="sim-lbl">Patrón:</span>
          ${PATTERNS.map((x, i) => `<button type="button" class="sim-chip" data-pat="${i}" aria-pressed="${i === patIdx}">${esc(x.label)}</button>`).join("")}
        </div>
        <div class="bigo-grid-2" style="align-items:start;">
          <div>
            <div class="sim-code" style="border-radius:12px;overflow:hidden;">
              <div class="sim-code-title">${esc(p.title)}</div>
              ${p.code.map((ln, i) => `<div class="sim-cline"><span class="ln">${i + 1}</span><span>${esc(ln)}</span></div>`).join("")}
            </div>
            <div class="aviso mt" style="margin-top:10px;padding:8px 11px;">
              <div class="small"><b>Escala real:</b> ${esc(p.sample)}</div>
            </div>
          </div>
          <div>
            <div style="display:flex;align-items:center;justify-content:space-between;gap:8px;margin-bottom:8px;">
              <span class="sim-lbl">Derivación paso a paso (${patStep + 1} / ${p.steps.length})</span>
              <div style="display:flex;gap:5px;">
                <button type="button" class="sim-btn sm" data-pstep="prev" ${patStep === 0 ? "disabled" : ""}>◀ Ant.</button>
                <button type="button" class="sim-btn sm prim" data-pstep="next" ${patStep === p.steps.length - 1 ? "disabled" : ""}>Sig. ▶</button>
              </div>
            </div>
            <div class="bigo-steps">
              ${p.steps.map((st, i) => `<button type="button" class="bigo-step ${i === patStep ? "cur" : i > patStep ? "dim" : ""}" data-jump-st="${i}" aria-pressed="${i === patStep}">
                <span class="sn">${i + 1}</span>
                <span><b>${esc(st.t)}</b><span class="muted" style="display:block;margin-top:2px;">${st.d}</span></span>
              </button>`).join("")}
            </div>
          </div>
        </div>
      `;
      pane1.querySelectorAll("[data-pat]").forEach(b => b.addEventListener("click", () => { patIdx = Number(b.dataset.pat); patStep = 0; renderPat(); }));
      pane1.querySelector('[data-pstep="prev"]').addEventListener("click", () => { if (patStep > 0) { patStep--; renderPat(); } });
      pane1.querySelector('[data-pstep="next"]').addEventListener("click", () => { if (patStep < p.steps.length - 1) { patStep++; renderPat(); } });
      pane1.querySelectorAll("[data-jump-st]").forEach(el => el.addEventListener("click", () => { patStep = Number(el.dataset.jumpSt); renderPat(); }));
    };
    renderPat();

    // ---- TAB 2: Curvas SVG + Calculadora N → AC/TLE ----
    const pane2 = host.querySelector('[data-bpane="2"]');
    const buildCurveSvg = () => {
      const W = 460, H = 175, l = 42, r = 18, t = 16, b = 26;
      const pw = W - l - r, ph = H - t - b;
      const maxX = 20, maxY = 120;
      const sx = x => l + (x / maxX) * pw;
      const sy = y => t + ph - (Math.min(y, maxY) / maxY) * ph;
      const mkPath = fn => {
        const pts = [];
        for (let x = 1; x <= maxX; x += 0.5) {
          const y = fn(x);
          if (y <= maxY * 1.15) pts.push(`${sx(x).toFixed(1)},${sy(y).toFixed(1)}`);
        }
        return pts.join(" ");
      };
      const curves = [
        { name: "O(2ⁿ)", col: "var(--sim-red)", pts: mkPath(x => Math.pow(2, x)), lx: sx(7.1), ly: t + 14 },
        { name: "O(n²)", col: "var(--sim-amber)", pts: mkPath(x => x * x), lx: sx(11.6), ly: t + 14 },
        { name: "O(n log n)", col: "var(--sim-purple)", pts: mkPath(x => x * Math.log2(x)), lx: sx(18.2), ly: sy(84) },
        { name: "O(n)", col: "var(--sim-cyan)", pts: mkPath(x => x), lx: sx(18.4), ly: sy(25) },
        { name: "O(log n)", col: "var(--sim-green)", pts: mkPath(x => Math.log2(x)), lx: sx(17.8), ly: sy(8) }
      ];
      return `<svg viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" style="max-width:100%;height:auto;display:block;margin:0 auto;" role="img" aria-label="Comparación visual de curvas de crecimiento Big-O">
        <line x1="${l}" y1="${t}" x2="${l}" y2="${H - b}" stroke="var(--ink-3)" stroke-width="1.5"/>
        <line x1="${l}" y1="${H - b}" x2="${W - r}" y2="${H - b}" stroke="var(--ink-3)" stroke-width="1.5"/>
        <text x="${W / 2}" y="${H - 6}" text-anchor="middle" fill="var(--ink-3)" font-size="10" font-family="var(--f-mono)">Tamaño de entrada N →</text>
        <text x="14" y="${H / 2}" text-anchor="middle" fill="var(--ink-3)" font-size="10" font-family="var(--f-mono)" transform="rotate(-90 14 ${H / 2})">Operaciones →</text>
        ${curves.map(c => `<polyline points="${c.pts}" fill="none" stroke="${c.col}" stroke-width="2.6" stroke-linecap="round"/>
          <text x="${c.lx}" y="${c.ly}" fill="${c.col}" font-size="10.5" font-weight="800" font-family="var(--f-mono)">${c.name}</text>`).join("")}
      </svg>`;
    };
    pane2.innerHTML = `
      <div class="bigo-grid-2" style="align-items:center;margin-bottom:10px;">
        <div style="background:var(--bg);border:1px solid var(--line);border-radius:12px;padding:8px;">${buildCurveSvg()}</div>
        <div class="aviso" style="margin:0;">
          <div class="small">
            <b>Regla de oro en competencias (leer N al revés):</b><br>
            En C++ (<code>-O2</code>) caben <b>~10⁸ ops/s</b>; en Python <b>~10⁷ ops/s</b>. Antes de programar, mira el límite de <code>N</code> en el enunciado:
            <ul class="lst small" style="margin-top:6px;">
              <li><code>N ≤ 20</code> → <code>O(2ⁿ)</code> / Backtracking / Bitmask</li>
              <li><code>N ≤ 2.000</code> → <code>O(N²)</code> (doble bucle / DP 2D)</li>
              <li><code>N ≤ 2×10⁵</code> → <code>O(N log N)</code> o <code>O(N)</code></li>
              <li><code>N ≤ 10⁹</code> → <code>O(√N)</code>, <code>O(log N)</code> o <code>O(1)</code></li>
            </ul>
          </div>
        </div>
      </div>
      <div data-el="bigo-cplx"></div>
    `;
    mountComplexityLab(pane2.querySelector('[data-el="bigo-cplx"]'));

    // ---- TAB 3: Mini-Reto interactivo ----
    const pane3 = host.querySelector('[data-bpane="3"]');
    let qIdx = 0;
    const renderQuiz = () => {
      const item = QUIZ[qIdx];
      const chosen = quizAnswers[qIdx];
      const score = quizAnswers.filter((a, i) => a === QUIZ[i].ans).length;
      const answered = quizAnswers.filter(a => a !== null).length;

      pane3.innerHTML = `
        <div style="display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:8px;margin-bottom:10px;">
          <div class="sim-presets">
            <span class="sim-lbl">Pregunta:</span>
            ${QUIZ.map((_, i) => {
              const st = quizAnswers[i];
              const mark = st === null ? "" : st === QUIZ[i].ans ? " ✓" : " ✕";
              return `<button type="button" class="sim-chip" data-qi="${i}" aria-pressed="${i === qIdx}">#${i + 1}${mark}</button>`;
            }).join("")}
          </div>
          <div style="display:flex;align-items:center;gap:8px;">
            <span class="small" style="font-family:var(--f-mono);font-weight:700;color:var(--accent);">Aciertos: ${score} / ${answered}</span>
            <button type="button" class="sim-btn sm" data-qact="reset">Reiniciar</button>
          </div>
        </div>
        <div style="font-weight:700;margin-bottom:8px;">${qIdx + 1}. ${esc(item.q)}</div>
        <div class="sim-code" style="border-radius:10px;padding:8px 12px;margin-bottom:6px;white-space:pre-wrap;">${esc(item.code)}</div>
        <div class="bigo-q-opts">
          ${item.opts.map((op, i) => {
            let cls = "";
            if (chosen !== null) {
              if (i === item.ans) cls = "ok";
              else if (i === chosen) cls = "bad";
            }
            return `<button type="button" class="bigo-opt ${cls}" data-qopt="${i}" ${chosen !== null ? "disabled" : ""}>${String.fromCharCode(65 + i)}) ${esc(op)}</button>`;
          }).join("")}
        </div>
        ${chosen !== null ? `<div class="bigo-fb ${chosen === item.ans ? "ok" : "bad"}">
          <b>${chosen === item.ans ? "¡Correcto! ✓" : `Respuesta correcta: ${item.opts[item.ans]}`}</b> — ${esc(item.exp)}
          ${qIdx < QUIZ.length - 1 ? ` <button type="button" class="sim-btn sm prim" data-qact="next" style="margin-left:8px;">Siguiente pregunta →</button>` : ""}
        </div>` : ""}
      `;
      pane3.querySelectorAll("[data-qi]").forEach(b => b.addEventListener("click", () => { qIdx = Number(b.dataset.qi); renderQuiz(); }));
      pane3.querySelectorAll("[data-qopt]").forEach(b => b.addEventListener("click", () => { quizAnswers[qIdx] = Number(b.dataset.qopt); renderQuiz(); }));
      const nxt = pane3.querySelector('[data-qact="next"]');
      if (nxt) nxt.addEventListener("click", () => { qIdx++; renderQuiz(); });
      pane3.querySelector('[data-qact="reset"]').addEventListener("click", () => { quizAnswers = Array(QUIZ.length).fill(null); qIdx = 0; renderQuiz(); });
    };
    renderQuiz();

    // Tab switching + WAI-ARIA roving tabindex & Arrow/Home/End keys
    const btabs = [...host.querySelectorAll("[data-btab]")];
    const selectBigOTab = (nextIdx, moveFocus) => {
      activeTab = (nextIdx + btabs.length) % btabs.length;
      btabs.forEach((b, i) => {
        const on = i === activeTab;
        b.setAttribute("aria-selected", String(on));
        b.tabIndex = on ? 0 : -1;
      });
      host.querySelectorAll("[data-bpane]").forEach(p => { p.hidden = Number(p.dataset.bpane) !== activeTab; });
      if (moveFocus && btabs[activeTab]) btabs[activeTab].focus();
    };
    btabs.forEach((btn, idx) => {
      btn.addEventListener("click", () => selectBigOTab(idx, false));
      btn.addEventListener("keydown", e => {
        if (e.key === "ArrowRight") { e.preventDefault(); selectBigOTab(idx + 1, true); }
        else if (e.key === "ArrowLeft") { e.preventDefault(); selectBigOTab(idx - 1, true); }
        else if (e.key === "Home") { e.preventDefault(); selectBigOTab(0, true); }
        else if (e.key === "End") { e.preventDefault(); selectBigOTab(btabs.length - 1, true); }
      });
    });
  }

  global.SemilleroSim = { SIMS, mount, mountAll, mountComplexityLab, mountBigOLab };

  if (typeof document !== "undefined") {
    const boot = () => {
      mountAll();
      document.querySelectorAll("[data-bigo-lab]").forEach(el => mountBigOLab(el));
    };
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", boot);
    } else {
      boot();
    }
  }
})(typeof window !== "undefined" ? window : globalThis);
