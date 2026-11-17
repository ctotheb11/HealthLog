// 📊 Analysis: finds patterns between what was eaten, bowel movements and symptoms.
// Everything runs on the device. Results are associations, not causes.
'use strict';

const RANGES = [
  { key: '30', label: '30 days' }, { key: '90', label: '90 days' }, { key: '365', label: '1 year' }, { key: 'all', label: 'All' },
];
const LATE = 'Ate after 8 PM', SKIP = 'Skipped breakfast';

function rangeBounds(key) {
  const end = todayISO();
  const all = [...DATA.meals, ...DATA.stools, ...DATA.symptoms].map(r => r.date).sort();
  const first = all[0] || end;
  const start = key === 'all' ? first : [first, addDays(end, -(+key - 1))].sort()[1];
  return { start, end };
}

/* ---------------- daily table ---------------- */
function buildDays({ start, end }) {
  const days = [], idx = {};
  for (let d = start; d <= end; d = addDays(d, 1)) {
    idx[d] = days.length;
    days.push({ i: days.length, date: d, active: false, meals: 0, slots: new Set(), tags: new Set(), foods: new Set(), habits: new Set(), load: 0, groups: {}, entries: [], stools: [] });
  }
  const at = d => days[idx[d]];
  for (const m of DATA.meals) {
    const day = at(m.date); if (!day) continue;
    day.active = true; day.meals++; day.slots.add(m.slot);
    if (toMin(m.time) >= 20 * 60 && m.items.length) day.habits.add(LATE);
    for (const it of m.items) { day.foods.add(it.name); (it.tags || []).forEach(t => day.tags.add(TAGS[t] || t)); }
  }
  for (const e of DATA.symptoms) {
    const day = at(e.date); if (!day) continue;
    day.active = true; day.entries.push(e);
    for (const i of e.items) {
      day.load += i.sev;
      const g = SYMPTOM_GROUPS[i.cat] || 'Other';
      day.groups[g] = (day.groups[g] || 0) + i.sev;
    }
  }
  for (const s of DATA.stools) { const day = at(s.date); if (day) { day.active = true; day.stools.push(s); } }
  for (const d of days) if (d.meals >= 2 && !d.slots.has('breakfast')) d.habits.add(SKIP);
  return days;
}
const loose = d => (d.stools.length ? (d.stools.some(s => s.type >= 6) ? 1 : 0) : null);
const hard = d => (d.stools.length ? (d.stools.some(s => s.type <= 2) ? 1 : 0) : null);

/* ---------------- statistics ---------------- */
// Seeded random numbers so results don't change each time the page is opened.
const seededRandom = seed => () => (seed = (seed * 16807) % 2147483647) / 2147483647;
const quantile = (arr, q) => { const a = [...arr].sort((x, y) => x - y); return a[Math.min(a.length - 1, Math.floor(q * a.length))] ?? Infinity; };
const PERMS = 40;
const mean = a => (a.length ? a.reduce((s, x) => s + x, 0) / a.length : 0);
const variance = a => { if (a.length < 2) return 0; const m = mean(a); return a.reduce((s, x) => s + (x - m) ** 2, 0) / (a.length - 1); };
function welch(a, b) {
  const va = variance(a), vb = variance(b);
  const se = Math.sqrt(va / a.length + vb / b.length) || 1e-6;
  const pooled = Math.sqrt((va + vb) / 2) || 1;
  return { t: (mean(a) - mean(b)) / Math.max(se, 0.15 * pooled / Math.sqrt(Math.min(a.length, b.length))), ma: mean(a), mb: mean(b) };
}
// Compare outcome on days after exposure vs days without it, at a given delay.
function compare(days, has, outcome, lag) {
  const a = [], b = [];
  for (let i = lag; i < days.length; i++) {
    const src = days[i - lag], dst = days[i];
    if (!src.meals || !dst.active) continue;
    const y = outcome(dst);
    if (y == null) continue;
    (has(src) ? a : b).push(y);
  }
  return { a, b };
}

function exposures(days) {
  const counts = new Map();
  const bump = (k, kind) => { const c = counts.get(k) || { name: k, kind, n: 0 }; c.n++; counts.set(k, c); };
  for (const d of days) {
    d.tags.forEach(t => bump(t, 'tag'));
    d.foods.forEach(f => bump(f, 'food'));
    d.habits.forEach(h => bump(h, 'habit'));
  }
  return [...counts.values()].filter(c => c.n >= 4);
}
const hasExp = e => d => (e.kind === 'tag' ? d.tags : e.kind === 'food' ? d.foods : d.habits).has(e.name);

const LAG_TEXT = ['the same day', 'the next day', '2 days later'];

// Step-wise: find the strongest link, remove its effect, then look again. This
// stops foods that are usually eaten together (or that share an ingredient)
// from all getting credit for the same bad days.
function associations(days) {
  const mealDays = days.filter(d => d.meals).length;
  const cands = exposures(days).filter(e => mealDays - e.n >= 4);
  const resid = days.map(d => d.load);
  const groups = [...new Set(Object.values(SYMPTOM_GROUPS))];
  const found = [];
  const used = new Set();
  const actIdx = days.filter(d => d.active).map(d => d.i);
  const rand = seededRandom(actIdx.length * 7919 + cands.length + 1);
  const scan = (outcomeArr, skip) => {
    let pick = null;
    const Rx = d => outcomeArr[d.i];
    for (const e of cands) {
      if (skip.has(e.name)) continue;
      for (const lag of [0, 1, 2]) {
        const { a, b } = compare(days, hasExp(e), Rx, lag);
        if (a.length < 4 || b.length < 4) continue;
        const w = welch(a, b);
        if (!pick || Math.abs(w.t) > Math.abs(pick.r.t)) pick = { e, r: { ...w, lag, n1: a.length, n0: b.length } };
      }
    }
    return pick;
  };
  for (let step = 0; step < 8; step++) {
    const pick = scan(resid, used);
    if (!pick) break;
    // How strong does the best match look when food timing is scrambled?
    const nullMax = [];
    for (let k = 0; k < PERMS; k++) {
      const vals = actIdx.map(i => resid[i]);
      for (let j = vals.length - 1; j > 0; j--) { const r = Math.floor(rand() * (j + 1)); [vals[j], vals[r]] = [vals[r], vals[j]]; }
      const perm = [...resid];
      actIdx.forEach((i, j) => (perm[i] = vals[j]));
      const pk = scan(perm, used);
      nullMax.push(pk ? Math.abs(pk.r.t) : 0);
    }
    const at = Math.abs(pick.r.t);
    const conf = pick.r.n1 < 4 || pick.r.n0 < 4 ? null
      : at > quantile(nullMax, 0.99) && pick.r.n1 >= 8 ? 'Strong'
      : at > quantile(nullMax, 0.95) && pick.r.n1 >= 6 ? 'Moderate'
      : at > quantile(nullMax, 0.9) ? 'Possible' : null;
    if (!conf) break;
    pick.conf = conf;
    const { e, r } = pick;
    used.add(e.name);
    const raw = compare(days, hasExp(e), d => d.load, r.lag);
    const rawMa = mean(raw.a), rawMb = mean(raw.b);
    // remove this exposure's effect before looking for the next one
    const has = hasExp(e);
    for (let i = r.lag; i < days.length; i++) if (days[i - r.lag].meals && days[i].active && has(days[i - r.lag])) resid[i] -= r.ma - r.mb;
    let top = null;
    for (const g of groups) {
      const { a, b } = compare(days, has, d => d.groups[g] || 0, r.lag);
      if (a.length < 4 || b.length < 4) continue;
      const w = welch(a, b);
      if (Math.sign(w.t) === Math.sign(r.t) && (!top || Math.abs(w.t) > Math.abs(top.t)) && Math.abs(w.ma - w.mb) > 0.3) top = { g, ...w };
    }
    const lz = compare(days, has, loose, Math.min(r.lag, 1));
    const st = lz.a.length >= 3 && lz.b.length >= 3 ? { after: mean(lz.a), other: mean(lz.b) } : null;
    let sources = [];
    if (e.kind === 'tag') {
      const n = new Map();
      for (const m of DATA.meals) if (m.date >= days[0].date && m.date <= days[days.length - 1].date) for (const it of m.items) if ((it.tags || []).some(t => TAGS[t] === e.name)) n.set(it.name, (n.get(it.name) || 0) + 1);
      sources = [...n.entries()].sort((x, y) => y[1] - x[1]).slice(0, 3).map(x => x[0]);
    }
    found.push({ ...e, ...r, ma: rawMa, mb: rawMb, conf: pick.conf, diff: rawMa - rawMb, pct: (rawMa - rawMb) / Math.max(rawMb, 1), topGroup: top?.g, stool: st, sources });
  }
  // Foods linked to loose stools even when overall symptoms didn't change
  const stoolOnly = [];
  const looseArr = days.map(loose);
  const stoolIdx = days.filter(d => looseArr[d.i] != null).map(d => d.i);
  const foundTags = new Set(found.filter(o => o.kind === 'tag').map(o => o.name));
  const covered = e => found.some(o => o.name === e.name) || (e.kind === 'food' && (foodInfo(e.name).tags || []).some(t => foundTags.has(TAGS[t])));
  const looseScan = arr => cands.filter(e => !covered(e)).map(e => {
    const { a, b } = compare(days, hasExp(e), d => arr[d.i], 1);
    return a.length < 4 || b.length < 4 ? null : { e, ...welch(a, b), n1: a.length };
  }).filter(Boolean);
  if (stoolIdx.length >= 10) {
    const real = looseScan(looseArr);
    const nullMax = [];
    for (let k = 0; k < PERMS; k++) {
      const vals = stoolIdx.map(i => looseArr[i]);
      for (let j = vals.length - 1; j > 0; j--) { const r = Math.floor(rand() * (j + 1)); [vals[j], vals[r]] = [vals[r], vals[j]]; }
      const perm = [...looseArr];
      stoolIdx.forEach((i, j) => (perm[i] = vals[j]));
      nullMax.push(Math.max(0, ...looseScan(perm).map(x => x.t)));
    }
    for (const x of real) {
      const conf = x.t > quantile(nullMax, 0.99) && x.n1 >= 8 ? 'Strong' : x.t > quantile(nullMax, 0.95) ? 'Moderate' : x.t > quantile(nullMax, 0.9) ? 'Possible' : null;
      if (conf && x.ma - x.mb >= 0.2) stoolOnly.push({ ...x.e, conf, after: x.ma, other: x.mb, n1: x.n1, t: x.t });
    }
  }
  const rank = { Strong: 3, Moderate: 2, Possible: 1 };
  const sort = arr => arr.sort((x, y) => rank[y.conf] - rank[x.conf] || Math.abs(y.t) - Math.abs(x.t));
  return {
    resid,
    worse: sort(found.filter(o => o.t > 0 && o.diff > 0)).slice(0, 10),
    better: sort(found.filter(o => o.t < 0 && o.diff < 0)).slice(0, 6),
    stoolOnly: sort(stoolOnly).slice(0, 5),
  };
}

/* ---------------- time patterns ---------------- */
const TOD_BINS = ['12–3 AM', '3–6 AM', '6–9 AM', '9 AM–12', '12–3 PM', '3–6 PM', '6–9 PM', '9 PM–12'];
const TOD_NAMES = ['overnight (12–3 AM)', 'early morning (3–6 AM)', 'morning (6–9 AM)', 'late morning (9 AM–noon)', 'early afternoon (noon–3 PM)', 'late afternoon (3–6 PM)', 'evening (6–9 PM)', 'night (9 PM–midnight)'];
function timeOfDay(days) {
  const bins = Array(8).fill(0), byGroup = {};
  for (const d of days) for (const e of d.entries) {
    const b = Math.floor(toMin(e.time) / 180);
    for (const i of e.items) {
      bins[b] += i.sev;
      const g = SYMPTOM_GROUPS[i.cat];
      (byGroup[g] ||= Array(8).fill(0))[b] += i.sev;
    }
  }
  return { bins, byGroup, total: bins.reduce((s, x) => s + x, 0) };
}
function dayOfWeek(days) {
  const sums = Array(7).fill(0), n = Array(7).fill(0);
  for (const d of days) if (d.active) { const w = parseISO(d.date).getDay(); sums[w] += d.load; n[w]++; }
  return { avg: sums.map((s, i) => (n[i] ? s / n[i] : null)), n };
}
function weekOfMonth(days) {
  const sums = Array(5).fill(0), n = Array(5).fill(0);
  for (const d of days) if (d.active) { const w = Math.min(4, Math.floor((parseISO(d.date).getDate() - 1) / 7)); sums[w] += d.load; n[w]++; }
  return { avg: sums.map((s, i) => (n[i] ? s / n[i] : null)), n };
}

/* ---------------- recurring cycles ---------------- */
// base: daily scores with known food effects removed, so food noise doesn't hide a rhythm.
function cycles(days, base) {
  const act = days.map((d, i) => ({ i, d })).filter(x => x.d.active);
  if (act.length < 21) return { status: 'short', activeDays: act.length };
  const first = act[0].i, last = act[act.length - 1].i;
  const series = days.slice(first, last + 1).map(d => (d.active ? (base ? base[d.i] : d.load) : null));
  const vals = series.filter(v => v != null);
  const m = mean(vals), v = variance(vals);
  if (v < 0.5) return { status: 'flat' };
  const span = series.length;
  const r = {};
  for (let k = 5; k <= 40; k++) {
    if (span < 2.5 * k) break;
    let s = 0, n = 0;
    for (let t = 0; t + k < span; t++) if (series[t] != null && series[t + k] != null) { s += (series[t] - m) * (series[t + k] - m); n++; }
    if (n >= 12) r[k] = s / (n * v);
  }
  const ks = Object.keys(r).map(Number);
  // How high does the best autocorrelation get when the days are shuffled?
  const rand = seededRandom(vals.length * 31 + span);
  const acMax = arr => {
    let best = 0;
    for (const k of ks) {
      let s2 = 0, n2 = 0;
      for (let t = 0; t + k < span; t++) if (arr[t] != null && arr[t + k] != null) { s2 += (arr[t] - m) * (arr[t + k] - m); n2++; }
      if (n2 >= 12) best = Math.max(best, s2 / (n2 * v));
    }
    return best;
  };
  const nullMax = [];
  const actPos = series.map((x, t) => (x != null ? t : -1)).filter(t => t >= 0);
  for (let p = 0; p < PERMS; p++) {
    const vv = actPos.map(t => series[t]);
    for (let j = vv.length - 1; j > 0; j--) { const q = Math.floor(rand() * (j + 1)); [vv[j], vv[q]] = [vv[q], vv[j]]; }
    const arr = [...series]; actPos.forEach((t, j) => (arr[t] = vv[j]));
    nullMax.push(acMax(arr));
  }
  const rCut = Math.max(0.25, quantile(nullMax, 0.95));
  const peaks = ks.filter(k => r[k] >= rCut && (r[k - 1] == null || r[k] >= r[k - 1]) && (r[k + 1] == null || r[k] >= r[k + 1]));
  if (!peaks.length) return { status: ks.length ? 'none' : 'short', activeDays: act.length, maxLag: Math.max(0, ...ks) };
  // prefer the fundamental period: a short peak that explains a longer one
  peaks.sort((a, b) => r[b] - r[a]);
  let k = peaks[0];
  const shorter = peaks.filter(p => p < k && k % p <= 1 && r[p] >= r[k] * 0.8);
  if (shorter.length) k = Math.min(...shorter);

  // phase profile
  const raw = days.slice(first, last + 1).map(d => (d.active ? d.load : null));
  const phase = Array(k).fill(0), pn = Array(k).fill(0);
  raw.forEach((val, t) => { if (val != null) { phase[t % k] += val; pn[t % k]++; } });
  const rawMean = mean(raw.filter(x => x != null));
  const prof = phase.map((s, i) => (pn[i] ? s / pn[i] : rawMean));
  const smooth = prof.map((_, i) => (prof[(i - 1 + k) % k] + prof[i] + prof[(i + 1) % k]) / 3);
  const peak = smooth.indexOf(Math.max(...smooth));
  const sd = Math.sqrt(variance(smooth)) || 1;
  const cut = mean(smooth) + 0.35 * sd;
  let a = peak, b = peak;
  while (b - a + 1 < Math.ceil(k / 2) && smooth[(a - 1 + k) % k] >= cut) a--;
  while (b - a + 1 < Math.ceil(k / 2) && smooth[(b + 1) % k] >= cut) b++;
  const winLen = b - a + 1;
  const inWin = t => { const p = ((t % k) + k) % k, s = ((a % k) + k) % k; return (p - s + k) % k < winLen; };

  // what else differs inside the flare window
  const inside = [], outside = [];
  raw.forEach((val, t) => { if (val != null) (inWin(t) ? inside : outside).push(days[first + t]); });
  const rate = (arr, f) => { const xs = arr.filter(d => d.meals); return xs.length ? xs.filter(f).length / xs.length : null; };
  const tagNames = [...new Set(inside.flatMap(d => [...d.tags, ...d.habits]))];
  const extras = tagNames.map(t => ({ t, i: rate(inside, d => d.tags.has(t) || d.habits.has(t)), o: rate(outside, d => d.tags.has(t) || d.habits.has(t)) }))
    .filter(x => {
      if (x.i == null || x.o == null || x.i - x.o < 0.15) return false;
      // two-proportion z-test, strict because many tags are checked
      const n1 = inside.filter(d => d.meals).length, n0 = outside.filter(d => d.meals).length;
      if (n1 < 5 || n0 < 5) return false;
      const pp = (x.i * n1 + x.o * n0) / (n1 + n0), se = Math.sqrt(pp * (1 - pp) * (1 / n1 + 1 / n0)) || 1;
      return (x.i - x.o) / se >= 3;
    })
    .sort((p, q) => (q.i - q.o) - (p.i - p.o)).slice(0, 4);
  const li = inside.map(loose).filter(x => x != null), lo = outside.map(loose).filter(x => x != null);
  const groupDiff = Object.values(SYMPTOM_GROUPS).filter((g, i, arr) => arr.indexOf(g) === i)
    .map(g => ({ g, d: mean(inside.map(x => x.groups[g] || 0)) - mean(outside.map(x => x.groups[g] || 0)) }))
    .filter(x => x.d > 0.3).sort((p, q) => q.d - p.d).slice(0, 2);

  // next predicted window start
  const t0 = days[first].date;
  let next = null;
  for (let i = 0; i <= k; i++) {
    const dte = addDays(todayISO(), i), t = dayDiff(t0, dte);
    if (inWin(t) && !inWin(t - 1)) { next = dte; break; }
    if (i === 0 && inWin(t)) { next = 'now'; break; }
  }
  const strength = r[k] > quantile(nullMax, 0.99) ? 'Strong' : 'Moderate';
  return {
    status: 'found', k, r: r[k], strength, winLen, prof: smooth, peak, a: ((a % k) + k) % k, extras, groupDiff,
    loose: li.length >= 3 && lo.length >= 3 ? { i: mean(li), o: mean(lo) } : null,
    inAvg: mean(inside.map(d => d.load)), outAvg: mean(outside.map(d => d.load)), next, cyclesSeen: span / k,
  };
}

/* ---------------- summaries ---------------- */
function topSymptoms(days) {
  const map = new Map();
  const half = days.length ? days[Math.floor(days.length / 2)].date : '';
  for (const d of days) for (const e of d.entries) for (const i of e.items) {
    const k = `${i.name}|${SYMPTOMS[i.cat]?.label || i.cat}`;
    const m = map.get(k) || { name: i.name, cat: SYMPTOMS[i.cat]?.label || i.cat, n: 0, sev: 0, early: 0, late: 0, regions: new Map() };
    m.n++; m.sev += i.sev;
    if (d.date < half) m.early++; else m.late++;
    m.regions.set(e.regionLabel, (m.regions.get(e.regionLabel) || 0) + 1);
    map.set(k, m);
  }
  return [...map.values()].map(m => ({ ...m, avg: m.sev / m.n, where: [...m.regions.entries()].sort((a, b) => b[1] - a[1]).slice(0, 2).map(x => x[0]).join(', ') }))
    .sort((a, b) => b.sev - a.sev).slice(0, 12);
}
function regionStats(days) {
  const map = new Map();
  for (const d of days) for (const e of d.entries) {
    const m = map.get(e.regionLabel) || { label: e.regionLabel, n: 0, sev: 0 };
    m.n++; m.sev += maxSev(e);
    map.set(e.regionLabel, m);
  }
  return [...map.values()].map(m => ({ ...m, avg: m.sev / m.n })).sort((a, b) => b.n - a.n || b.avg - a.avg);
}
function stoolStats(days) {
  const all = days.flatMap(d => d.stools);
  const types = Array(8).fill(0); const flags = {}; const amounts = {};
  all.forEach(s => { types[s.type]++; s.flags.forEach(f => (flags[f] = (flags[f] || 0) + 1)); amounts[s.amount] = (amounts[s.amount] || 0) + 1; });
  const active = days.filter(d => d.active).length;
  return { n: all.length, types, flags, amounts, perDay: active ? all.length / active : 0, normal: all.length ? (types[3] + types[4]) / all.length : 0, loose: all.length ? (types[6] + types[7]) / all.length : 0, hard: all.length ? (types[1] + types[2]) / all.length : 0 };
}

function analyze(rangeKey) { return analyzeBounds(rangeBounds(rangeKey)); }
function analyzeBounds(b) {
  const days = buildDays(b);
  const active = days.filter(d => d.active);
  const assoc = associations(days);
  return {
    b, days, active: active.length,
    mealDays: days.filter(d => d.meals).length,
    symEntries: active.reduce((s, d) => s + d.entries.length, 0),
    avgLoad: mean(active.map(d => d.load)),
    goodDays: active.filter(d => d.load === 0).length,
    assoc, tod: timeOfDay(days), dow: dayOfWeek(days), wom: weekOfMonth(days),
    cyc: cycles(days, assoc.resid), top: topSymptoms(days), regions: regionStats(days), stool: stoolStats(days),
  };
}

/* ---------------- charts (inline SVG) ---------------- */
function barChart(items, { h = 120, fmt = v => v.toFixed(1), hiIdx = -1, color = 'var(--accent)' } = {}) {
  const W = 320, top = 14, bot = 22, n = items.length, gap = 4;
  const bw = (W - gap * (n - 1)) / n;
  const max = Math.max(1e-6, ...items.map(i => i.v || 0));
  return `<svg class="chart" viewBox="0 0 ${W} ${h}" role="img">${items.map((it, i) => {
    const v = it.v || 0, bh = (h - top - bot) * v / max, x = i * (bw + gap), y = h - bot - bh;
    return `<rect x="${x}" y="${y}" width="${bw}" height="${Math.max(bh, it.v == null ? 0 : 1)}" rx="3" fill="${i === hiIdx ? 'var(--warn)' : color}" opacity="${it.v == null ? 0.2 : 1}"><title>${esc(it.label)}: ${it.v == null ? 'no data' : fmt(v)}</title></rect>
      ${it.v != null && bw > 18 ? `<text x="${x + bw / 2}" y="${y - 3}" class="cv" text-anchor="middle">${fmt(v)}</text>` : ''}
      <text x="${x + bw / 2}" y="${h - 7}" class="cl" text-anchor="middle">${esc(it.short ?? it.label)}</text>`;
  }).join('')}</svg>`;
}
function trendChart(days, { h = 130 } = {}) {
  const W = 320, top = 10, bot = 18, n = days.length;
  if (!n) return '';
  const max = Math.max(5, ...days.map(d => d.load));
  const bw = W / n;
  const roll = days.map((_, i) => { const w = days.slice(Math.max(0, i - 6), i + 1).filter(d => d.active); return w.length ? mean(w.map(d => d.load)) : null; });
  const y = v => h - bot - (h - top - bot) * v / max;
  let path = '', pen = false;
  roll.forEach((v, i) => { if (v == null) { pen = false; return; } path += `${pen ? 'L' : 'M'}${(i + 0.5) * bw} ${y(v)} `; pen = true; });
  const ticks = [0, Math.floor(n / 2), n - 1].map(i => `<text x="${Math.min(W - 20, Math.max(18, (i + 0.5) * bw))}" y="${h - 4}" class="cl" text-anchor="middle">${fmtDate(days[i].date, { weekday: false })}</text>`).join('');
  return `<svg class="chart" viewBox="0 0 ${W} ${h}" role="img" aria-label="Daily symptom score">
    ${days.map((d, i) => d.active ? `<rect x="${i * bw + bw * 0.1}" y="${y(d.load)}" width="${Math.max(bw * 0.8, 0.8)}" height="${h - bot - y(d.load)}" fill="${d.load ? sevColor(Math.min(10, 2 + d.load / max * 8)) : 'var(--good)'}" opacity=".75"><title>${d.date}: ${d.load}</title></rect>${d.load ? '' : `<rect x="${i * bw + bw * 0.1}" y="${h - bot - 2}" width="${Math.max(bw * 0.8, 0.8)}" height="2" fill="var(--good)"/>`}` : '').join('')}
    <path d="${path}" fill="none" stroke="var(--ink)" stroke-width="1.6" stroke-linejoin="round"/>${ticks}</svg>`;
}
function stoolTrend(days, { h = 110 } = {}) {
  const W = 320, top = 8, bot = 18, n = days.length;
  if (!n) return '';
  const bw = W / n, y = t => top + (h - top - bot) * (t - 1) / 6;
  return `<svg class="chart" viewBox="0 0 ${W} ${h}" role="img" aria-label="Stool type over time">
    <rect x="0" y="${y(3)}" width="${W}" height="${y(4) - y(3)}" fill="var(--good)" opacity=".18"/>
    ${[1, 4, 7].map(t => `<text x="2" y="${y(t) + 3}" class="cl">${t}</text>`).join('')}
    ${days.flatMap((d, i) => d.stools.map(s => `<circle cx="${(i + 0.5) * bw}" cy="${y(s.type)}" r="${s.amount === 'heavy' ? 4 : s.amount === 'light' ? 2.2 : 3}" fill="${s.flags.includes('blood') ? 'var(--danger)' : 'var(--stool)'}" opacity=".8"/>`)).join('')}
    <text x="${W - 2}" y="${h - 4}" class="cl" text-anchor="end">↑ hard · watery ↓</text></svg>`;
}
function heatmapSVG(days) {
  const marks = days.flatMap(d => d.entries).filter(e => e.view !== 'general' && e.shape);
  const dots = marks.map(e => {
    const c = e.shape.kind === 'pin' ? e.shape : centroid(e.shape.pts);
    const rr = e.shape.kind === 'area' ? Math.max(8, Math.sqrt(polyArea(e.shape.pts) / Math.PI)) : 9;
    return `<circle cx="${c.x + FIG_X[e.view]}" cy="${c.y}" r="${rr}" fill="${sevColor(maxSev(e) || 5)}" opacity="0.28"/>`;
  }).join('');
  const general = days.flatMap(d => d.entries).filter(e => e.view === 'general').length;
  return `<div class="heat"><svg viewBox="0 0 420 500" role="img" aria-label="Where symptoms were logged">${figureSVG('front', { glow: general > 0 })}${figureSVG('back', { glow: general > 0 })}<g style="mix-blend-mode:multiply">${dots}</g></svg>
    <div class="figlabels"><span>Front</span><span>Back</span></div></div>`;
}
function polyArea(p) { let s = 0; for (let i = 0; i < p.length; i++) { const [x1, y1] = p[i], [x2, y2] = p[(i + 1) % p.length]; s += x1 * y2 - x2 * y1; } return Math.abs(s / 2); }

/* ---------------- text helpers ---------------- */
const pctTxt = x => `${Math.round(x * 100)}%`;
const confBadge = c => `<span class="conf ${c.toLowerCase()}">${c}</span>`;
function assocCard(o) {
  const worse = o.t > 0;
  const what = o.kind === 'tag' ? `eating foods with <i>${esc(o.name.toLowerCase())}</i>`
    : o.kind === 'food' ? `eating <i>${esc(o.name)}</i>`
    : o.name === LATE ? 'days you ate after 8 PM' : 'days you skipped breakfast';
  return `<li class="assoc">
    <div class="ah"><b>${o.kind === 'tag' ? '🏷 ' : ''}${esc(o.name)}</b>${confBadge(o.conf)}</div>
    <div>Symptoms were <b>${pctTxt(Math.abs(o.pct))} ${worse ? 'higher' : 'lower'}</b> ${LAG_TEXT[o.lag]} after ${what}
      <span class="muted">(avg score ${o.ma.toFixed(1)} vs ${o.mb.toFixed(1)}; ${o.n1} vs ${o.n0} days)</span>.</div>
    ${o.topGroup ? `<div class="muted">Most affected: ${esc(o.topGroup)}.</div>` : ''}
    ${o.sources?.length ? `<div class="muted">Mostly from: ${o.sources.map(esc).join(', ')}.</div>` : ''}
    ${o.stool && Math.abs(o.stool.after - o.stool.other) >= 0.15 ? `<div class="muted">Loose stools: ${pctTxt(o.stool.after)} of days after vs ${pctTxt(o.stool.other)} otherwise.</div>` : ''}
  </li>`;
}

function insightsHTML(A, { forReport = false } = {}) {
  const enough = A.active >= 14;
  const dowMax = A.dow.avg.reduce((bi, v, i, arr) => (v != null && A.dow.n[i] >= 2 && (bi < 0 || v > arr[bi]) ? i : bi), -1);
  const dowMin = A.dow.avg.reduce((bi, v, i, arr) => (v != null && A.dow.n[i] >= 2 && (bi < 0 || v < arr[bi]) ? i : bi), -1);
  const todMax = A.tod.bins.indexOf(Math.max(...A.tod.bins));
  const womMax = A.wom.avg.reduce((bi, v, i, arr) => (v != null && A.wom.n[i] >= 3 && (bi < 0 || v > arr[bi]) ? i : bi), -1);
  const C = A.cyc;
  const flagLabel = k => STOOL_FLAGS.find(f => f.key === k)?.label || k;

  return `
  <section class="card">
    <h2>Overview</h2>
    <div class="stats">
      <div><b>${A.active}</b><span>days logged</span></div>
      <div><b>${A.avgLoad.toFixed(1)}</b><span>avg daily symptom score</span></div>
      <div><b>${A.goodDays}</b><span>symptom-free days</span></div>
      <div><b>${A.stool.n}</b><span>bowel movements</span></div>
    </div>
    <p class="muted small">Daily symptom score = the strengths (1–10) of every symptom logged that day, added together. Bars are days; the line is the 7-day average.</p>
    ${trendChart(A.days)}
  </section>

  <section class="card">
    <h2>Possible triggers</h2>
    ${!enough ? `<p class="muted">Keep logging — patterns appear after about 2 weeks of meals and symptoms (you have ${A.active} day${A.active === 1 ? '' : 's'}).</p>` : ''}
    ${A.assoc.worse.length ? `<p class="muted small">Foods, ingredients and habits followed by worse days, checked the same day, next day and 2 days later.</p><ul class="assocs">${A.assoc.worse.map(assocCard).join('')}</ul>`
      : enough ? '<p class="muted">No food or drink stands out yet as being followed by worse days.</p>' : ''}
    ${A.assoc.stoolOnly.length ? `<h3>Linked to loose stools</h3><ul class="assocs">${A.assoc.stoolOnly.map(o => `<li class="assoc"><div class="ah"><b>${esc(o.name)}</b>${confBadge(o.conf)}</div><div>Loose stools (type 6–7) on ${pctTxt(o.after)} of days after, vs ${pctTxt(o.other)} otherwise.</div></li>`).join('')}</ul>` : ''}
    ${A.assoc.better.length ? `<h3>Linked to better days</h3><ul class="assocs">${A.assoc.better.map(assocCard).join('')}</ul>` : ''}
  </section>

  <section class="card">
    <h2>Recurring cycles</h2>
    ${C.status === 'found' ? `
      <p><b>Your symptoms tend to rise about every ${C.k} days</b>${C.k === 7 ? ' (a weekly pattern)' : C.k >= 13 && C.k <= 15 ? ' (about every 2 weeks)' : C.k >= 19 && C.k <= 23 ? ' (about every 3 weeks)' : C.k >= 25 && C.k <= 33 ? ' (about monthly)' : ''}, and the higher stretch lasts about ${C.winLen} day${C.winLen > 1 ? 's' : ''}. ${confBadge(C.strength)}</p>
      <p>In those stretches your average score was <b>${C.inAvg.toFixed(1)}</b> vs ${C.outAvg.toFixed(1)} the rest of the time.
      ${C.groupDiff.length ? `It's mostly <b>${C.groupDiff.map(g => esc(g.g.toLowerCase())).join(' and ')}</b>.` : ''}</p>
      ${C.extras.length ? `<p>During those stretches you also logged more: ${C.extras.map(x => `<b>${esc(x.t.toLowerCase())}</b> (${pctTxt(x.i)} of days vs ${pctTxt(x.o)})`).join(', ')}.</p>` : ''}
      ${C.loose && C.loose.i - C.loose.o >= 0.15 ? `<p>Loose stools were more common too (${pctTxt(C.loose.i)} vs ${pctTxt(C.loose.o)} of days).</p>` : ''}
      ${!forReport && C.next ? `<p class="callout">📅 ${C.next === 'now' ? 'You may be in one of these stretches now.' : `If the pattern holds, the next stretch may start around <b>${fmtDate(C.next)}</b>.`}</p>` : ''}
      ${barChart(C.prof.map((v, i) => ({ v, label: `Day ${i + 1} of cycle`, short: C.k <= 16 || i % Math.ceil(C.k / 10) === 0 ? String(i + 1) : '' })), { hiIdx: C.peak, h: 100 })}
      <p class="muted small">Average score by day of the ${C.k}-day cycle (based on ~${Math.floor(C.cyclesSeen)} cycles). This shows timing only — it can't say why. Hormones, work schedules, medication timing or sleep can all cause rhythms like this.</p>`
    : C.status === 'short' ? `<p class="muted">Needs more data. Finding a repeating rhythm takes about 3 full cycles — roughly 3 weeks for a weekly pattern and about 3 months for a monthly one${C.activeDays ? ` (you have ${C.activeDays} days logged)` : ''}.</p>`
    : C.status === 'flat' ? '<p class="muted">Your symptom scores have been very steady, so there’s no rhythm to find.</p>'
    : `<p class="muted">No repeating cycle found yet in up to ${C.maxLag} days. That's good information too — it'll keep checking as you log.</p>`}
  </section>

  <section class="card">
    <h2>Time of day</h2>
    ${A.tod.total ? `<p>Most symptom intensity is logged in the <b>${TOD_NAMES[todMax]}</b> — ${pctTxt(A.tod.bins[todMax] / A.tod.total)} of the total.</p>
      ${barChart(A.tod.bins.map((v, i) => ({ v: v / A.tod.total * 100, label: TOD_BINS[i], short: ['12a', '3a', '6a', '9a', '12p', '3p', '6p', '9p'][i] })), { hiIdx: todMax, fmt: v => Math.round(v) + '%' })}
      <div class="mini">${Object.entries(A.tod.byGroup).sort((a, b) => b[1].reduce((s, x) => s + x, 0) - a[1].reduce((s, x) => s + x, 0)).slice(0, 4).map(([g, arr]) => `<div><b>${esc(g)}</b>: worst in the ${TOD_NAMES[arr.indexOf(Math.max(...arr))]}</div>`).join('')}</div>
      <p class="muted small">Based on the time each symptom was logged. If you usually log at night, symptoms may look like they cluster then.</p>`
      : '<p class="muted">No symptoms logged in this period.</p>'}
  </section>

  <section class="card">
    <h2>Day of the week</h2>
    ${dowMax >= 0 ? `<p>${WEEKDAYS[dowMax]}s are your hardest day (avg ${A.dow.avg[dowMax].toFixed(1)}); ${WEEKDAYS[dowMin]}s are easiest (avg ${A.dow.avg[dowMin].toFixed(1)}).</p>
      ${barChart(A.dow.avg.map((v, i) => ({ v, label: WEEKDAYS[i], short: WEEKDAYS[i].slice(0, 3) })), { hiIdx: dowMax })}`
      : '<p class="muted">Needs at least 2 logged days of each weekday.</p>'}
    <h3>Time of the month</h3>
    ${womMax >= 0 ? `${barChart(A.wom.avg.map((v, i) => ({ v, label: ['Days 1–7', 'Days 8–14', 'Days 15–21', 'Days 22–28', 'Days 29–31'][i], short: ['1–7', '8–14', '15–21', '22–28', '29–31'][i] })), { hiIdx: womMax })}
      <p class="muted small">Average score by calendar date. For rhythms that don't line up with the calendar, see Recurring cycles.</p>` : '<p class="muted">Needs more days logged.</p>'}
  </section>

  <section class="card">
    <h2>Where symptoms happen</h2>
    ${A.regions.length ? `${heatmapSVG(A.days)}
      <table class="tbl"><thead><tr><th>Area</th><th class="num">Times</th><th class="num">Avg strength</th></tr></thead><tbody>
      ${A.regions.slice(0, 10).map(r => `<tr><td>${esc(r.label)}</td><td class="num">${r.n}</td><td class="num">${r.avg.toFixed(1)}</td></tr>`).join('')}</tbody></table>`
      : '<p class="muted">No symptoms logged in this period.</p>'}
  </section>

  <section class="card">
    <h2>Most common symptoms</h2>
    ${A.top.length ? `<table class="tbl"><thead><tr><th>Symptom</th><th class="num">Times</th><th class="num">Avg</th><th class="num">Trend</th></tr></thead><tbody>
      ${A.top.map(s => `<tr><td>${esc(s.name)} <span class="muted small">· ${esc(s.where)}</span></td><td class="num">${s.n}</td><td class="num">${s.avg.toFixed(1)}</td><td class="num">${s.n < 4 ? '' : s.late > s.early * 1.3 ? '↑ more' : s.late < s.early * 0.7 ? '↓ less' : '→ same'}</td></tr>`).join('')}</tbody></table>
      <p class="muted small">Trend compares the second half of this period with the first half.</p>`
      : '<p class="muted">No symptoms logged in this period.</p>'}
  </section>

  <section class="card">
    <h2>Bowel movements</h2>
    ${A.stool.n ? `<div class="stats">
        <div><b>${A.stool.perDay.toFixed(1)}</b><span>per logged day</span></div>
        <div><b>${pctTxt(A.stool.normal)}</b><span>normal (type 3–4)</span></div>
        <div><b>${pctTxt(A.stool.loose)}</b><span>loose (type 6–7)</span></div>
        <div><b>${pctTxt(A.stool.hard)}</b><span>hard (type 1–2)</span></div>
      </div>
      ${barChart([1, 2, 3, 4, 5, 6, 7].map(t => ({ v: A.stool.types[t], label: `Type ${t}`, short: String(t) })), { fmt: v => String(Math.round(v)), color: 'var(--stool)' })}
      ${stoolTrend(A.days)}
      ${Object.keys(A.stool.flags).length ? `<p>${Object.entries(A.stool.flags).map(([k, n]) => `${k === 'blood' ? '<b class="danger">' : '<b>'}${esc(flagLabel(k))}</b>: ${n} time${n > 1 ? 's' : ''}`).join(' · ')}</p>` : ''}
      ${A.stool.flags.blood ? '<p class="callout danger">Blood in stool was logged. Tell your doctor about this.</p>' : ''}`
      : '<p class="muted">No bowel movements logged in this period.</p>'}
  </section>`;
}

/* ---------------- 📊 Analysis tab ---------------- */
function viewAnalysis(main) {
  const key = ui.analysis.range;
  const A = analyze(key);
  main.innerHTML = `
  ${backupBanner()}
  <div class="seg">${RANGES.map(r => `<button data-range="${r.key}" class="${r.key === key ? 'on' : ''}">${r.label}</button>`).join('')}</div>
  <p class="muted small center">${fmtDate(A.b.start, { year: true })} – ${fmtDate(A.b.end, { year: true })}</p>
  ${A.active ? insightsHTML(A) : '<p class="empty"><span class="big">🔍</span>Nothing logged yet! Start with the 🍔, 💩 and ➕ tabs and your patterns will show up here.</p>'}
  <div class="card">
    <a class="btn primary block" href="#/report?range=${key}">📄 Create a doctor report</a>
    <p class="muted small">These are patterns in what you logged, not a diagnosis. Some will be coincidences — the more days you log, the more reliable they get. Talk to your doctor before cutting out foods.</p>
  </div>`;
  $$('[data-range]', main).forEach(b => (b.onclick = () => { ui.analysis.range = b.dataset.range; store.set('range', b.dataset.range); viewAnalysis(main); }));
}

/* ---------------- 📄 Doctor report ---------------- */
function viewReport(main) {
  const { q } = route();
  const key = q.get('range') || ui.analysis.range;
  const custom = q.get('from') && q.get('to');
  const withLog = q.get('log') === '1';
  const A = custom ? analyzeBounds({ start: q.get('from'), end: q.get('to') }) : analyze(key);

  const setQ = patch => {
    const p = new URLSearchParams(q);
    Object.entries(patch).forEach(([k, v]) => (v == null ? p.delete(k) : p.set(k, v)));
    location.replace('#/report?' + p.toString());
  };
  main.innerHTML = `
  <div class="noprint card">
    <div class="seg">${RANGES.map(r => `<button data-range="${r.key}" class="${!custom && r.key === key ? 'on' : ''}">${r.label}</button>`).join('')}</div>
    <div class="row2"><label class="field"><span>From</span><input type="date" id="rfrom" value="${A.b.start}"></label><label class="field"><span>To</span><input type="date" id="rto" value="${A.b.end}" max="${todayISO()}"></label></div>
    <label class="check"><input type="checkbox" id="rlog" ${withLog ? 'checked' : ''}> Include the full day-by-day log</label>
    <button class="btn primary block" id="rprint">🖨 Print / Save as PDF</button>
    <p class="muted small">In the print screen, pinch out on the preview (or use Share) to save the PDF to Files or send it.</p>
  </div>
  <article class="report">
    <header>
      <h1>Symptom, food &amp; bowel log</h1>
      <p>${SETTINGS.name ? `<b>${esc(SETTINGS.name)}</b> · ` : ''}${fmtDate(A.b.start, { year: true })} – ${fmtDate(A.b.end, { year: true })} · Created ${fmtDate(todayISO(), { year: true })}</p>
      <p class="muted small">Self-reported by the patient with the Health Log app. Symptom strengths are on a 1–10 scale. Stool form uses the Bristol Stool Scale. Food associations are statistical patterns in this person's own log and have not been clinically tested.</p>
    </header>
    ${A.active ? insightsHTML(A, { forReport: true }) : '<p>No entries in this period.</p>'}
    ${withLog ? dayLogHTML(A.days) : ''}
  </article>`;
  $$('[data-range]', main).forEach(b => (b.onclick = () => setQ({ range: b.dataset.range, from: null, to: null })));
  const dates = () => { const f = $('#rfrom').value, t = $('#rto').value; if (f && t && f <= t) setQ({ from: f, to: t }); };
  $('#rfrom').onchange = dates; $('#rto').onchange = dates;
  $('#rlog').onchange = e => setQ({ log: e.target.checked ? '1' : null });
  $('#rprint').onclick = () => window.print();
}

function dayLogHTML(days) {
  const rows = days.filter(d => d.active).map(d => {
    const meals = MEALS.map(m => DATA.meals.find(x => x.date === d.date && x.slot === m.key)).filter(Boolean);
    return `<div class="logday">
      <h3>${fmtDate(d.date, { year: true })} <span class="muted">· score ${d.load}</span></h3>
      ${meals.map(m => `<div><b>${fmtTime(m.time)} ${MEALS.find(x => x.key === m.slot).label}:</b> ${m.items.map(i => esc(i.name)).join(', ')}</div>`).join('')}
      ${d.stools.sort((a, b) => a.time.localeCompare(b.time)).map(s => `<div><b>${fmtTime(s.time)} Stool:</b> type ${s.type}, ${s.amount}${s.flags.length ? ', ' + s.flags.map(k => STOOL_FLAGS.find(f => f.key === k)?.label.toLowerCase()).join(', ') : ''}${s.notes ? ` — ${esc(s.notes)}` : ''}</div>`).join('')}
      ${d.entries.sort((a, b) => a.time.localeCompare(b.time)).map(e => `<div><b>${fmtTime(e.time)} ${esc(e.regionLabel)}:</b> ${e.items.map(i => `${esc(i.name.toLowerCase())} ${i.sev}/10`).join(', ')}${e.notes ? ` — ${esc(e.notes)}` : ''}</div>`).join('')}
    </div>`;
  });
  return `<section class="card log"><h2>Day-by-day log</h2>${rows.join('') || '<p>No entries.</p>'}</section>`;
}
