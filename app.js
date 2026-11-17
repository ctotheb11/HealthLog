// Health Log — private, offline food, stool and symptom journal.
// All entries are stored only on this device (IndexedDB).
'use strict';

const APP_VERSION = '1.2.0';

/* ---------------- small helpers ---------------- */
const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const pad = n => String(n).padStart(2, '0');
const isoDate = d => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const todayISO = () => isoDate(new Date());
const nowTime = () => { const d = new Date(); return `${pad(d.getHours())}:${pad(d.getMinutes())}`; };
const parseISO = s => { const [y, m, d] = s.split('-').map(Number); return new Date(y, m - 1, d); };
const addDays = (s, n) => { const d = parseISO(s); d.setDate(d.getDate() + n); return isoDate(d); };
const dayDiff = (a, b) => Math.round((parseISO(b) - parseISO(a)) / 864e5);
const toMin = t => { const [h, m] = (t || '00:00').split(':').map(Number); return h * 60 + m; };
const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
const WEEKDAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function fmtDate(s, { weekday = true, year = false } = {}) {
  const d = parseISO(s);
  return `${weekday ? WEEKDAYS[d.getDay()].slice(0, 3) + ', ' : ''}${MONTHS[d.getMonth()]} ${d.getDate()}${year ? ', ' + d.getFullYear() : ''}`;
}
function fmtTime(t) {
  if (!t) return '';
  let [h, m] = t.split(':').map(Number);
  const ap = h >= 12 ? 'PM' : 'AM';
  h = h % 12 || 12;
  return `${h}:${pad(m)} ${ap}`;
}
function relDay(s) {
  const n = dayDiff(s, todayISO());
  return n === 0 ? 'Today' : n === 1 ? 'Yesterday' : fmtDate(s);
}

function toast(msg) {
  const t = $('#toast');
  t.textContent = msg;
  t.hidden = false;
  clearTimeout(toast.t);
  toast.t = setTimeout(() => (t.hidden = true), 2600);
}

const store = {
  get(k, d) { try { const v = localStorage.getItem('hl.' + k); return v == null ? d : JSON.parse(v); } catch { return d; } },
  set(k, v) { try { localStorage.setItem('hl.' + k, JSON.stringify(v)); } catch { /* private mode */ } },
};

/* ---------------- storage (IndexedDB) ---------------- */
const STORES = ['meals', 'stools', 'symptoms', 'foods'];
const DB = {
  db: null,
  open() {
    return new Promise((res, rej) => {
      const r = indexedDB.open('health-log', 1);
      r.onupgradeneeded = () => {
        const d = r.result;
        d.createObjectStore('meals', { keyPath: 'id' });
        d.createObjectStore('stools', { keyPath: 'id' });
        d.createObjectStore('symptoms', { keyPath: 'id' });
        d.createObjectStore('foods', { keyPath: 'key' });
        d.createObjectStore('meta', { keyPath: 'key' });
      };
      r.onsuccess = () => { this.db = r.result; res(); };
      r.onerror = () => rej(r.error);
    });
  },
  tx(st, mode, fn) {
    return new Promise((res, rej) => {
      const t = this.db.transaction(st, mode);
      let out;
      const req = fn(t.objectStore(st));
      if (req) req.onsuccess = () => (out = req.result);
      t.oncomplete = () => res(out);
      t.onerror = t.onabort = () => rej(t.error);
    });
  },
  all: s => DB.tx(s, 'readonly', st => st.getAll()),
  get: (s, k) => DB.tx(s, 'readonly', st => st.get(k)),
  put: (s, v) => DB.tx(s, 'readwrite', st => st.put(v)),
  del: (s, k) => DB.tx(s, 'readwrite', st => st.delete(k)),
  putMany: (s, arr) => DB.tx(s, 'readwrite', st => { arr.forEach(v => st.put(v)); }),
  clear: s => DB.tx(s, 'readwrite', st => st.clear()),
};

const DATA = { meals: [], stools: [], symptoms: [], foods: [] };
let SETTINGS = { name: '', lastBackup: 0 };

async function saveSettings() { await DB.put('meta', { key: 'settings', value: SETTINGS }); }
async function requestPersist() {
  if (requestPersist.done || !navigator.storage?.persist) return;
  requestPersist.done = true;
  try { await navigator.storage.persist(); } catch { /* not supported */ }
}
async function putRec(s, rec) {
  rec.updatedAt = Date.now();
  await DB.put(s, rec);
  const k = s === 'foods' ? 'key' : 'id';
  const i = DATA[s].findIndex(r => r[k] === rec[k]);
  if (i >= 0) DATA[s][i] = rec; else DATA[s].push(rec);
  requestPersist();
}
async function delRec(s, id) {
  await DB.del(s, id);
  const k = s === 'foods' ? 'key' : 'id';
  DATA[s] = DATA[s].filter(r => r[k] !== id);
}

/* ---------------- food catalog ---------------- */
const foodKey = name => name.trim().toLowerCase();
function catalog() {
  const map = new Map();
  for (const f of BUILTIN_FOODS) map.set(foodKey(f.name), { ...f, key: foodKey(f.name), fav: false, custom: false });
  for (const u of DATA.foods) {
    const cur = map.get(u.key);
    map.set(u.key, { ...(cur || {}), ...u, custom: !cur });
  }
  return map;
}
function foodInfo(name) { return catalog().get(foodKey(name)) || { name, tags: [], drink: false, key: foodKey(name) }; }
async function setFood(name, patch) {
  const key = foodKey(name);
  const prev = DATA.foods.find(f => f.key === key) || { key, name: foodInfo(name).name || name };
  await putRec('foods', { ...prev, ...patch });
}
function frequentFoods(limit = 15) {
  const n = new Map();
  const since = addDays(todayISO(), -120);
  for (const m of DATA.meals) if (m.date >= since) for (const it of m.items) n.set(foodKey(it.name), (n.get(foodKey(it.name)) || 0) + 1);
  const cat = catalog();
  return [...n.entries()].sort((a, b) => b[1] - a[1]).slice(0, limit).map(([k, c]) => ({ ...(cat.get(k) || { name: k, tags: [] }), count: c }));
}
function searchFoods(q) {
  q = q.trim().toLowerCase();
  if (!q) return [];
  const words = q.split(/\s+/);
  const freq = new Map(frequentFoods(60).map(f => [f.key, f.count]));
  return [...catalog().values()]
    .filter(f => words.every(w => f.name.toLowerCase().includes(w)))
    .map(f => ({ f, score: (f.name.toLowerCase().startsWith(q) ? 100 : 0) + (f.fav ? 50 : 0) + (freq.get(f.key) || 0) }))
    .sort((a, b) => b.score - a.score || a.f.name.localeCompare(b.f.name))
    .slice(0, 12).map(x => x.f);
}
const tagChips = tags => (tags || []).map(t => `<span class="tag">${esc(TAGS[t] || t)}</span>`).join('');

/* ---------------- UI state ---------------- */
const ui = {
  food: { date: todayISO(), slot: store.get('slot', null), drafts: {}, panel: store.get('favpanel', 'fav'), panelOpen: false },
  stool: null,
  health: { date: todayISO(), zoom: null, mode: 'pin', vb: [0, 0, 420, 500], glow: false },
  analysis: { range: store.get('range', '90') },
};
function guessSlot() {
  const m = toMin(nowTime());
  return m < 600 ? 'breakfast' : m < 690 ? 'snack1' : m < 840 ? 'lunch' : m < 1020 ? 'snack2' : m < 1200 ? 'dinner' : 'snack3';
}
if (!ui.food.slot) ui.food.slot = guessSlot();

/* ---------------- shell ---------------- */
const TABS = [
  { key: 'food', label: 'Food', icon: '<span class="emoji" aria-hidden="true">🍔</span>' },
  { key: 'stool', label: 'Stool', icon: '<span class="emoji" aria-hidden="true">💩</span>' },
  { key: 'health', label: 'Health', icon: '<svg viewBox="0 0 32 32" aria-hidden="true" class="medbox"><rect x="3" y="3" width="26" height="26" rx="6" fill="#fff" stroke="#c9ccd2" stroke-width="1.5"/><path d="M13 8h6v5h5v6h-5v5h-6v-5H8v-6h5z" fill="#e0262f"/></svg>' },
  { key: 'analysis', label: 'Analysis', icon: '<span class="emoji" aria-hidden="true">📊</span>' },
];
const TITLES = { food: 'What did I eat?', stool: 'Bathroom log', health: 'How do I feel?', analysis: 'My patterns', settings: 'Settings', report: 'Doctor report' };
const TITLE_EMOJI = { food: '🍽️', stool: '🚽', health: '💗', analysis: '🔍', settings: '⚙️', report: '📄' };
const isSimple = () => document.documentElement.classList.contains('simple');

/* ---------------- fun bits ---------------- */
const CHEERS = ['Nice job! 🎉', 'Got it! 🙌', 'Awesome! 🌟', 'Great logging! ⭐', 'Way to go! 🎈', 'Super! 💪'];
function celebrate(from, msg) {
  const streak = streakDays();
  toast(msg || (streak >= 2 && Math.random() < 0.5 ? `🔥 ${streak}-day streak!` : CHEERS[Math.floor(Math.random() * CHEERS.length)]));
  if (isSimple() || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const r = from?.getBoundingClientRect?.() || { left: innerWidth / 2, top: innerHeight / 2, width: 0, height: 0 };
  const x0 = r.left + r.width / 2, y0 = r.top + r.height / 2;
  const colors = ['#ff6b6b', '#ffd93d', '#6bcB77', '#4d96ff', '#c77dff', '#ff9a3c'];
  const emo = ['⭐', '🎉', '💖', '✨'];
  for (let i = 0; i < 26; i++) {
    const c = document.createElement('i');
    const isE = i % 6 === 0;
    c.className = 'confetti' + (isE ? ' e' : '');
    if (isE) c.textContent = emo[i % emo.length]; else c.style.background = colors[i % colors.length];
    const ang = -Math.PI / 2 + (Math.random() - 0.5) * 2.4, dist = 90 + Math.random() * 140;
    c.style.left = x0 + 'px'; c.style.top = y0 + 'px';
    c.style.setProperty('--dx', Math.cos(ang) * dist + 'px');
    c.style.setProperty('--dy', Math.sin(ang) * dist + 60 + 'px');
    c.style.setProperty('--rot', (Math.random() * 720 - 360) + 'deg');
    document.body.appendChild(c);
    setTimeout(() => c.remove(), 1100);
  }
}
// Consecutive days (ending today, or yesterday if nothing yet today) with any entry.
function streakDays() {
  const days = new Set([...DATA.meals, ...DATA.stools, ...DATA.symptoms].map(r => r.date));
  let d = todayISO();
  if (!days.has(d)) d = addDays(d, -1);
  let n = 0;
  while (days.has(d)) { n++; d = addDays(d, -1); }
  return n;
}
const SEV_FACES = [[2, '🙂', 'A little'], [4, '😕', 'Some'], [6, '😣', 'Quite a bit'], [8, '😖', 'A lot'], [10, '😭', 'Worst ever']];
const sevFace = v => SEV_FACES.find(f => v <= f[0]);

function route() {
  const [tab, q] = location.hash.replace(/^#\/?/, '').split('?');
  return { tab: tab || 'food', q: new URLSearchParams(q || '') };
}
function go(tab) { location.hash = '#/' + tab; }

function renderShell(tab) {
  $('#tabs').innerHTML = TABS.map(t => `<a href="#/${t.key}" class="tab tab-${t.key} ${t.key === tab ? 'on' : ''}" aria-label="${t.label}" ${t.key === tab ? 'aria-current="page"' : ''}><span class="bub">${t.icon}</span></a>`).join('');
  $('#title').innerHTML = TITLES[tab] ? `${isSimple() ? '' : `<span class="ti" aria-hidden="true">${TITLE_EMOJI[tab]}</span>`}${TITLES[tab]}` : '';
  const st = streakDays(), sEl = $('#streak');
  sEl.hidden = !(st >= 2 && tab !== 'settings' && tab !== 'report');
  sEl.textContent = `🔥 ${st}`;
  sEl.title = `${st}-day logging streak`;
  $('#back').hidden = !(tab === 'settings' || tab === 'report');
  $('#gear').hidden = tab === 'settings' || tab === 'report';
}

function render() {
  const { tab } = route();
  document.body.dataset.tab = tab;
  renderShell(tab);
  const main = $('#main');
  const views = { food: viewFood, stool: viewStool, health: viewHealth, analysis: viewAnalysis, settings: viewSettings, report: viewReport };
  (views[tab] || viewFood)(main);
}

/* ---------------- sheet (bottom pop-up) ---------------- */
function openSheet(html, onClose) {
  const sh = $('#sheet');
  sh.innerHTML = `<div class="sheet-box" role="dialog" aria-modal="true">${html}</div>`;
  sh.hidden = false;
  document.body.classList.add('sheet-open');
  sh.onClose = onClose;
  sh.onclick = e => { if (e.target === sh) closeSheet(); };
  return $('.sheet-box', sh);
}
function closeSheet(saved = false) {
  const sh = $('#sheet');
  if (sh.hidden) return;
  sh.hidden = true;
  sh.innerHTML = '';
  document.body.classList.remove('sheet-open');
  const cb = sh.onClose; sh.onClose = null;
  if (cb) cb(saved);
}

/* =====================================================================
 * 🍔 FOOD
 * ===================================================================*/
function mealRec(date, slot) { return DATA.meals.find(m => m.date === date && m.slot === slot); }
function draftFor(date, slot) {
  const k = `${date}|${slot}`;
  if (!ui.food.drafts[k]) {
    const saved = mealRec(date, slot);
    const def = MEALS.find(m => m.key === slot).time;
    ui.food.drafts[k] = saved
      ? { items: saved.items.map(i => ({ ...i })), time: saved.time, dirty: false }
      : { items: [], time: date === todayISO() ? nowTime() : def, dirty: false };
  }
  return ui.food.drafts[k];
}

function viewFood(main) {
  const f = ui.food;
  const d = draftFor(f.date, f.slot);
  const slotLabel = MEALS.find(m => m.key === f.slot).label;
  const favs = [...catalog().values()].filter(x => x.fav).sort((a, b) => a.name.localeCompare(b.name));
  const freq = frequentFoods();
  const list = f.panel === 'fav' ? favs : freq;
  main.innerHTML = `
  ${backupBanner()}
  <div class="row2">
    <label class="field"><span>Date</span><input type="date" id="fdate" value="${f.date}" max="${todayISO()}"></label>
    <label class="field"><span>Time eaten</span><input type="time" id="ftime" value="${d.time}"></label>
  </div>
  <div class="meals" role="group" aria-label="Meal">
    ${MEALS.map(m => {
      const saved = mealRec(f.date, m.key);
      const dr = f.drafts[`${f.date}|${m.key}`];
      const badge = dr?.dirty ? '<i class="dot unsaved" title="Not saved"></i>' : saved ? `<i class="count">${saved.items.length}</i>` : '';
      return `<button class="meal ${m.key === f.slot ? 'on' : ''}" data-slot="${m.key}" aria-pressed="${m.key === f.slot}"><span class="me" aria-hidden="true">${m.emoji}</span>${m.label}${badge}</button>`;
    }).join('')}
  </div>
  <div class="search">
    <input type="search" id="fsearch" placeholder="Search foods & drinks" autocomplete="off" autocorrect="off" enterkeyhint="done" aria-label="Search foods and drinks">
    <div id="fresults" class="results" hidden></div>
  </div>
  <details class="favs" ${f.panelOpen ? 'open' : ''}>
    <summary>★ Favorites &amp; frequent</summary>
    <div class="seg small">
      <button data-panel="fav" class="${f.panel === 'fav' ? 'on' : ''}">Favorites</button>
      <button data-panel="freq" class="${f.panel === 'freq' ? 'on' : ''}">Frequent</button>
    </div>
    <div class="chips">
      ${list.length ? list.map(x => `<button class="chip add" data-add="${esc(x.name)}">${foodEmoji(x.name, x.drink)} ${esc(x.name)}</button>`).join('')
        : `<p class="muted">${f.panel === 'fav' ? 'Tap ☆ next to any item in your list to make it a favorite.' : 'Items you log often will show up here.'}</p>`}
    </div>
  </details>
  <h2 class="section">${slotLabel} · ${relDay(f.date)}</h2>
  ${d.items.length ? `<ul class="items">${d.items.map((it, i) => {
    const info = foodInfo(it.name);
    return `<li>
      <button class="star ${info.fav ? 'on' : ''}" data-star="${esc(it.name)}" aria-label="${info.fav ? 'Remove from' : 'Add to'} favorites">${info.fav ? '★' : '☆'}</button>
      <span class="fe" aria-hidden="true">${foodEmoji(it.name, info.drink)}</span>
      <div class="it"><div>${esc(it.name)}</div><div class="tags">${tagChips(it.tags)}</div></div>
      <button class="x" data-del="${i}" aria-label="Remove ${esc(it.name)}">✕</button></li>`;
  }).join('')}</ul>` : `<p class="empty"><span class="big">🍽️</span>Nothing here yet! Search above or tap a favorite.</p>`}
  <div class="savebar"><button class="btn primary block" id="fsave" ${!d.dirty ? 'disabled' : ''}>${d.dirty ? `Save ${slotLabel.toLowerCase()}` : mealRec(f.date, f.slot) ? 'Saved ✓' : `Save ${slotLabel.toLowerCase()}`}</button></div>`;

  const changed = () => { d.dirty = true; viewFood(main); };
  $('#fdate').onchange = e => { if (e.target.value) { f.date = e.target.value; viewFood(main); } };
  $('#ftime').onchange = e => { d.time = e.target.value || d.time; d.dirty = true; viewFood(main); };
  $$('.meal', main).forEach(b => (b.onclick = () => { f.slot = b.dataset.slot; store.set('slot', f.slot); viewFood(main); }));
  $('.favs', main).ontoggle = e => { f.panelOpen = e.target.open; };
  $$('[data-panel]', main).forEach(b => (b.onclick = e => { e.preventDefault(); f.panel = b.dataset.panel; store.set('favpanel', f.panel); viewFood(main); }));
  $$('[data-add]', main).forEach(b => (b.onclick = () => { addItem(d, b.dataset.add); changed(); toast(`Added ${b.dataset.add}`); }));
  $$('[data-del]', main).forEach(b => (b.onclick = () => { d.items.splice(+b.dataset.del, 1); changed(); }));
  $$('[data-star]', main).forEach(b => (b.onclick = async () => { const info = foodInfo(b.dataset.star); await setFood(info.name, { fav: !info.fav, tags: info.tags, drink: !!info.drink }); viewFood(main); }));

  const inp = $('#fsearch'), res = $('#fresults');
  inp.oninput = () => {
    const q = inp.value.trim();
    if (!q) { res.hidden = true; return; }
    const hits = searchFoods(q);
    const exact = hits.some(h => foodKey(h.name) === foodKey(q));
    res.innerHTML = hits.map(h => `<button data-pick="${esc(h.name)}"><span>${foodEmoji(h.name, h.drink)} ${esc(h.name)}${h.fav ? ' ★' : ''}</span><span class="tags">${tagChips(h.tags.slice(0, 3))}</span></button>`).join('')
      + (exact ? '' : `<button class="addnew" data-new="${esc(q)}">＋ Add “${esc(q)}” as a new item</button>`);
    res.hidden = false;
    $$('[data-pick]', res).forEach(b => (b.onclick = () => { addItem(d, b.dataset.pick); d.dirty = true; keepSearch(); }));
    $$('[data-new]', res).forEach(b => (b.onclick = () => newFoodSheet(b.dataset.new, name => { addItem(d, name); d.dirty = true; viewFood(main); })));
  };
  const keepSearch = () => { viewFood(main); const n = $('#fsearch'); n.focus(); toast('Added'); };
  inp.onkeydown = e => { if (e.key === 'Enter') { e.preventDefault(); const first = $('#fresults button'); if (first) first.click(); } };

  $('#fsave').onclick = async () => {
    const rec = mealRec(f.date, f.slot);
    if (!d.items.length) {
      if (rec) { await delRec('meals', rec.id); toast(`${slotLabel} cleared`); }
    } else {
      await putRec('meals', { id: rec?.id || uid(), date: f.date, slot: f.slot, time: d.time, items: d.items });
      celebrate($('#fsave'), `${MEALS.find(m => m.key === f.slot).emoji} ${slotLabel} saved!`);
    }
    d.dirty = false;
    viewFood(main);
  };
}
function addItem(d, name) {
  const info = foodInfo(name);
  d.items.push({ name: info.name || name, tags: [...(info.tags || [])], drink: !!info.drink });
}

function tagPicker(selected) {
  return `<div class="chips tagpick">${TAG_ORDER.map(t => `<button type="button" class="chip ${selected.includes(t) ? 'on' : ''}" data-tag="${t}" aria-pressed="${selected.includes(t)}">${esc(TAGS[t])}</button>`).join('')}</div>`;
}
function bindTagPicker(root, selected) {
  $$('[data-tag]', root).forEach(b => (b.onclick = () => {
    const t = b.dataset.tag, i = selected.indexOf(t);
    if (i >= 0) selected.splice(i, 1); else selected.push(t);
    b.classList.toggle('on', i < 0);
    b.setAttribute('aria-pressed', i < 0);
  }));
}
function newFoodSheet(name, done, existing) {
  const tags = [...(existing?.tags || [])];
  let drink = !!existing?.drink;
  const box = openSheet(`
    <h3>${existing ? 'Edit' : 'New item'}</h3>
    <label class="field"><span>Name</span><input id="nfname" value="${esc(name)}" ${existing && !existing.custom ? 'readonly' : ''}></label>
    <div class="seg"><button type="button" data-k="food" class="${!drink ? 'on' : ''}">🍽 Food</button><button type="button" data-k="drink" class="${drink ? 'on' : ''}">🥤 Drink</button></div>
    <p class="muted">What does it contain? Tags are how the analysis spots possible triggers.</p>
    ${tagPicker(tags)}
    <div class="sheet-actions"><button class="btn" data-cancel>Cancel</button><button class="btn primary" data-ok>Save</button></div>`);
  bindTagPicker(box, tags);
  $$('[data-k]', box).forEach(b => (b.onclick = () => { drink = b.dataset.k === 'drink'; $$('[data-k]', box).forEach(x => x.classList.toggle('on', x === b)); }));
  $('[data-cancel]', box).onclick = () => closeSheet();
  $('[data-ok]', box).onclick = async () => {
    const nm = $('#nfname').value.trim();
    if (!nm) return;
    await setFood(nm, { name: nm, tags: TAG_ORDER.filter(t => tags.includes(t)), drink });
    closeSheet(true);
    done(nm);
  };
}

/* =====================================================================
 * 💩 STOOL
 * ===================================================================*/
const STOOL_SVG = {
  1: '<circle cx="12" cy="24" r="6"/><circle cx="26" cy="18" r="7"/><circle cx="40" cy="25" r="6"/><circle cx="51" cy="16" r="5"/><circle cx="20" cy="33" r="4"/>',
  2: '<path d="M8 24c0-7 5-10 10-9 2-4 8-5 11-2 3-3 9-3 12 1 5-1 11 3 10 9 3 4 0 10-6 10-3 3-9 3-12 0-3 3-9 3-12 0-6 1-10-2-10-6-3-1-4-2-3-3z"/><g fill="var(--stool-dark)"><circle cx="20" cy="22" r="1.6"/><circle cx="31" cy="27" r="1.6"/><circle cx="42" cy="21" r="1.6"/></g>',
  3: '<rect x="5" y="13" width="50" height="17" rx="8.5"/><path d="M17 13l3 6M29 30l2-6M38 13l-2 5M47 30l-3-5" stroke="var(--stool-dark)" stroke-width="1.6" fill="none" stroke-linecap="round"/>',
  4: '<path d="M7 27c6-12 14-12 20-4s14 8 22-4" stroke="var(--stool)" stroke-width="10" fill="none" stroke-linecap="round"/>',
  5: '<ellipse cx="14" cy="24" rx="9" ry="7"/><ellipse cx="31" cy="18" rx="9" ry="7"/><ellipse cx="47" cy="25" rx="8" ry="6.5"/>',
  6: '<path d="M6 28c1-6 5-8 9-7 1-5 7-7 11-4 3-4 10-4 12 1 4-2 10 1 10 6 4 1 5 6 1 8-3 3-8 1-10 3-4 2-8 0-11 1-4 2-9 1-11-1-4 1-9 0-11-2-2-1-1-4 0-5z" opacity=".85"/><circle cx="54" cy="18" r="2.5" opacity=".8"/><circle cx="9" cy="18" r="2" opacity=".8"/>',
  7: '<path d="M5 30c3-5 10-6 15-4 5-3 13-3 18 0 6-2 14 0 17 4 2 4-4 6-10 5-6 2-14 2-20 0-7 1-14 1-18-1-3-1-3-3-2-4z" fill="var(--stool-light)"/><path d="M30 8c3 5 5 8 5 10a5 5 0 0 1-10 0c0-2 2-5 5-10z" fill="var(--stool-light)"/>',
};
const stoolIcon = (t, cls = '') => `<svg class="stool-ic ${cls}" viewBox="0 0 60 40" aria-hidden="true"><g fill="var(--stool)">${STOOL_SVG[t]}</g></svg>`;

function stoolDraft(rec) {
  const d = new Date();
  return rec ? { ...rec, flags: [...rec.flags] } : { id: null, date: todayISO(), time: `${pad(d.getHours())}:${pad(d.getMinutes())}`, type: null, amount: null, flags: [], notes: '' };
}

function viewStool(main) {
  if (!ui.stool) ui.stool = stoolDraft();
  const s = ui.stool;
  const todays = DATA.stools.filter(x => x.date === s.date).sort((a, b) => a.time.localeCompare(b.time));
  main.innerHTML = `
  <div class="row2">
    <label class="field"><span>Date</span><input type="date" id="sdate" value="${s.date}" max="${todayISO()}"></label>
    <label class="field"><span>Time</span><input type="time" id="stime" value="${s.time}"></label>
  </div>
  ${s.id ? `<p class="editing">Editing entry from ${fmtTime(s.time)} <button class="link" id="snew">Start a new entry</button></p>` : ''}
  <h2 class="section">What did it look like?</h2>
  <div class="stools">
    ${STOOL_TYPES.map(t => `<button class="stool ${s.type === t.type ? 'on' : ''}" data-type="${t.type}" aria-pressed="${s.type === t.type}">
      ${stoolIcon(t.type)}<b>Type ${t.type}</b><span>${t.label}</span><small>${t.note}</small></button>`).join('')}
  </div>
  ${s.type ? `
  <h2 class="section">How much?</h2>
  <div class="seg big">${STOOL_AMOUNTS.map(a => `<button data-amt="${a.key}" class="${s.amount === a.key ? 'on' : ''}" aria-pressed="${s.amount === a.key}">${a.label}</button>`).join('')}</div>
  <h2 class="section">Anything else? <small>optional</small></h2>
  <div class="chips">${STOOL_FLAGS.map(fl => `<button class="chip ${s.flags.includes(fl.key) ? 'on' : ''} ${fl.key === 'blood' ? 'warn' : ''}" data-flag="${fl.key}" aria-pressed="${s.flags.includes(fl.key)}">${fl.label}</button>`).join('')}</div>
  <label class="field"><span>Notes</span><textarea id="snotes" rows="2" placeholder="Optional">${esc(s.notes)}</textarea></label>
  <div class="savebar"><button class="btn primary block" id="ssave" ${!s.amount ? 'disabled' : ''}>${s.amount ? (s.id ? 'Save changes' : 'Save') : 'Choose an amount'}</button></div>` : ''}
  <h2 class="section">${relDay(s.date)}</h2>
  ${todays.length ? `<ul class="items">${todays.map(x => `<li class="${x.id === s.id ? 'sel' : ''}">
      ${stoolIcon(x.type, 'sm')}
      <button class="it plain" data-edit="${x.id}"><div>${fmtTime(x.time)} · Type ${x.type} · ${STOOL_AMOUNTS.find(a => a.key === x.amount)?.label || ''}</div>
      <div class="tags">${x.flags.map(k => `<span class="tag ${k === 'blood' ? 'warn' : ''}">${STOOL_FLAGS.find(f => f.key === k)?.label}</span>`).join('')}${x.notes ? `<span class="muted"> ${esc(x.notes)}</span>` : ''}</div></button>
      <button class="x" data-sdel="${x.id}" aria-label="Delete entry">✕</button></li>`).join('')}</ul>`
    : '<p class="empty"><span class="big">🧻</span>Nothing logged for this day.</p>'}`;

  $('#sdate').onchange = e => { if (e.target.value) { s.date = e.target.value; viewStool(main); } };
  $('#stime').onchange = e => { s.time = e.target.value || s.time; };
  if ($('#snew')) $('#snew').onclick = () => { ui.stool = stoolDraft(); ui.stool.date = s.date; viewStool(main); };
  $$('[data-type]', main).forEach(b => (b.onclick = () => {
    s.type = +b.dataset.type;
    viewStool(main);
    $('.seg.big', main)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }));
  $$('[data-amt]', main).forEach(b => (b.onclick = () => { s.amount = b.dataset.amt; viewStool(main); }));
  $$('[data-flag]', main).forEach(b => (b.onclick = () => {
    const i = s.flags.indexOf(b.dataset.flag);
    if (i >= 0) s.flags.splice(i, 1); else s.flags.push(b.dataset.flag);
    s.notes = $('#snotes').value;
    viewStool(main);
  }));
  if ($('#snotes')) $('#snotes').oninput = e => { s.notes = e.target.value; };
  if ($('#ssave')) $('#ssave').onclick = async () => {
    await putRec('stools', { id: s.id || uid(), date: s.date, time: s.time, type: s.type, amount: s.amount, flags: s.flags, notes: s.notes.trim() });
    if (s.id) toast('Changes saved'); else celebrate($('#ssave'));
    const keepDate = s.date;
    ui.stool = stoolDraft();
    ui.stool.date = keepDate;
    if (keepDate !== todayISO()) ui.stool.time = s.time;
    viewStool(main);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  $$('[data-edit]', main).forEach(b => (b.onclick = () => { ui.stool = stoolDraft(DATA.stools.find(x => x.id === b.dataset.edit)); viewStool(main); window.scrollTo({ top: 0, behavior: 'smooth' }); }));
  $$('[data-sdel]', main).forEach(b => (b.onclick = async () => {
    if (!confirm('Delete this entry?')) return;
    await delRec('stools', b.dataset.sdel);
    if (s.id === b.dataset.sdel) { ui.stool = stoolDraft(); ui.stool.date = s.date; }
    viewStool(main);
  }));
}

/* =====================================================================
 * ➕ HEALTH (body map)
 * ===================================================================*/
const FIG_X = { front: 0, back: 220 };
const FULL_VB = [0, 0, 420, 500];

function figureSVG(view, opts = {}) {
  const ox = FIG_X[view];
  const id = `${view}${opts.idSuffix || ''}`;
  const front = view === 'front';
  // Soft anatomy hints: they show which side is which without being busy.
  const detail = front
    ? `<path d="M74 97 Q86 101 97 99 M103 99 Q114 101 126 97"/>
       <path d="M100 104 V146"/>
       <path d="M78 140 Q90 150 100 147 Q110 150 122 140" opacity=".55"/>
       <path d="M88 176 Q100 179 112 176" opacity=".25"/>
       <ellipse cx="100" cy="212" rx="1.6" ry="2.4" class="dot"/>
       <path d="M70 238 Q84 258 100 272 M130 238 Q116 258 100 272" opacity=".45"/>
       <path d="M72 362 Q78 368 86 362 M128 362 Q122 368 114 362" opacity=".5"/>
       ${isSimple() ? '<path d="M90 36 Q92.5 34.5 95 36 M105 36 Q107.5 34.5 110 36" opacity=".35"/>'
         : `<g class="face"><ellipse cx="91" cy="38" rx="2.6" ry="3.4"/><ellipse cx="109" cy="38" rx="2.6" ry="3.4"/>
            <circle cx="92" cy="37" r=".9" fill="#fff"/><circle cx="110" cy="37" r=".9" fill="#fff"/>
            <ellipse cx="85" cy="47" rx="4" ry="2.4" class="cheek"/><ellipse cx="115" cy="47" rx="4" ry="2.4" class="cheek"/>
            <path d="M93 49 Q100 55 107 49" class="smile"/></g>`}`
    : `<path d="M100 84 V236" stroke-dasharray="1.5 4" opacity=".8"/>
       <path d="M66 110 Q72 136 90 132 M134 110 Q128 136 110 132"/>
       <path d="M92 228 Q100 222 108 228" opacity=".5"/>
       <path d="M100 240 V270 M66 266 Q82 276 98 270 M134 266 Q118 276 102 270" opacity=".6"/>
       <path d="M70 370 Q78 374 86 370 M130 370 Q122 374 114 370" opacity=".5"/>
       <path d="M86 26 Q100 18 114 26" opacity=".35"/>`;
  return `<g transform="translate(${ox},0)" data-view="${view}">
    <defs>
      <linearGradient id="skin-${id}" x1="0" x2="1" y1="0" y2="0">
        <stop offset="0" style="stop-color:var(--body-shade)"/><stop offset=".3" style="stop-color:var(--body)"/>
        <stop offset=".55" style="stop-color:var(--body-hi)"/><stop offset=".75" style="stop-color:var(--body)"/>
        <stop offset="1" style="stop-color:var(--body-shade)"/>
      </linearGradient>
    </defs>
    <ellipse cx="100" cy="497" rx="62" ry="4" class="floor"/>
    ${opts.glow ? `<path d="${BODY_PATH}" class="glow" fill="none" stroke="var(--glow)" stroke-width="14" stroke-linejoin="round"/>` : ''}
    <path d="${BODY_PATH}" fill="url(#skin-${id})" stroke="var(--body-line)" stroke-width="1.6" stroke-linejoin="round"/>
    <g class="detail">${detail}</g>
    <text x="12" y="16" class="sidelbl">${front ? 'R' : 'L'}</text>
    <text x="188" y="16" class="sidelbl" text-anchor="end">${front ? 'L' : 'R'}</text>
  </g>`;
}

function sevColor(v) {
  // 1 → yellow, 10 → deep red
  const t = Math.max(0, Math.min(1, (v - 1) / 9));
  return `hsl(${48 - 48 * t} 92% ${58 - 16 * t}%)`;
}
const maxSev = e => Math.max(0, ...e.items.map(i => i.sev || 0));

function markerSVG(e, scale, temp) {
  if (e.view === 'general' || !e.shape) return '';
  const ox = FIG_X[e.view];
  const col = temp ? 'var(--accent)' : sevColor(maxSev(e) || 5);
  if (e.shape.kind === 'pin') {
    const r = 5.5 * scale;
    return `<g transform="translate(${ox},0)" class="marker ${temp ? 'temp' : ''}"><circle cx="${e.shape.x}" cy="${e.shape.y}" r="${r * 1.9}" fill="${col}" opacity=".28"/><circle cx="${e.shape.x}" cy="${e.shape.y}" r="${r}" fill="${col}" stroke="#fff" stroke-width="${1.4 * scale}"/></g>`;
  }
  const d = 'M' + e.shape.pts.map(p => p.join(' ')).join(' L') + ' Z';
  return `<g transform="translate(${ox},0)" class="marker ${temp ? 'temp' : ''}"><path d="${d}" fill="${col}" fill-opacity=".35" stroke="${col}" stroke-width="${2 * scale}" stroke-dasharray="${temp ? 4 * scale : 0}" stroke-linejoin="round"/></g>`;
}

function viewHealth(main) {
  const H = ui.health;
  const entries = DATA.symptoms.filter(e => e.date === H.date).sort((a, b) => a.time.localeCompare(b.time));
  main.innerHTML = `
  <div class="row2">
    <label class="field"><span>Date</span><input type="date" id="hdate" value="${H.date}" max="${todayISO()}"></label>
    <div class="field"><span>&nbsp;</span><button class="btn general" id="hgeneral">🧍 Whole body</button></div>
  </div>
  <div class="bodybar">
    ${H.zoom ? `<button class="btn small" id="hfull">← Full body</button>
      <div class="seg small"><button data-mode="pin" class="${H.mode === 'pin' ? 'on' : ''}">📍 Pin</button><button data-mode="area" class="${H.mode === 'area' ? 'on' : ''}">⭕ Circle</button></div>`
      : '<div class="hint">👆 Tap where it hurts or feels funny</div>'}
  </div>
  ${H.zoom ? `<div class="hint center">${H.mode === 'pin' ? 'Tap the exact spot' : 'Draw a circle around the area with your finger'}</div>`
    : '<div class="figlabels"><span>Front</span><span>Back</span></div>'}
  <div class="bodywrap ${H.zoom ? 'zoomed' : ''}">
    <svg id="body" viewBox="${H.vb.join(' ')}" role="img" aria-label="Body map, front and back">
      ${figureSVG('front', { glow: H.glow })}${figureSVG('back', { glow: H.glow })}
      <g id="markers"></g><g id="tempmark"></g>
    </svg>
  </div>
  <p class="muted small center">R and L are the person's own right and left sides.</p>
  <h2 class="section">${relDay(H.date)}</h2>
  ${entries.length ? `<ul class="items">${entries.map(e => `<li>
      <span class="sevdot ${isSimple() ? '' : 'face'}" style="background:${sevColor(maxSev(e) || 1)}" title="Strongest: ${maxSev(e)}/10">${isSimple() ? maxSev(e) || '' : sevFace(maxSev(e) || 1)[1]}</span>
      <button class="it plain" data-hedit="${e.id}"><div>${fmtTime(e.time)} · ${esc(e.regionLabel)}${e.shape?.kind === 'area' ? ' · area' : ''}</div>
      <div class="tags">${e.items.map(i => `<span class="tag">${esc(i.name)} ${i.sev}</span>`).join('')}${e.notes ? `<span class="muted"> ${esc(e.notes)}</span>` : ''}</div></button>
      <button class="x" data-hdel="${e.id}" aria-label="Delete entry">✕</button></li>`).join('')}</ul>`
    : '<p class="empty"><span class="big">😊</span>Nothing logged for this day. Feeling good?</p>'}`;

  const svg = $('#body');
  const scale = () => H.vb[2] / FULL_VB[2];
  const drawMarkers = () => { $('#markers').innerHTML = entries.map(e => markerSVG(e, scale())).join(''); };
  drawMarkers();

  $('#hdate').onchange = e => { if (e.target.value) { H.date = e.target.value; viewHealth(main); } };
  $('#hgeneral').onclick = () => {
    H.glow = true;
    viewHealth(main);
    symptomSheet({ view: 'general', regionLabel: 'Whole body', cats: ['general'] }, () => { H.glow = false; viewHealth(main); });
  };
  $$('[data-hedit]', main).forEach(b => (b.onclick = () => {
    const e = DATA.symptoms.find(x => x.id === b.dataset.hedit);
    const rg = e.view === 'general' ? { cats: ['general'] } : REGIONS[e.view].find(r => r.key === e.region) || { cats: ['skin'] };
    symptomSheet({ ...e, cats: rg.cats }, () => viewHealth(main));
  }));
  $$('[data-hdel]', main).forEach(b => (b.onclick = async () => {
    if (!confirm('Delete this entry?')) return;
    await delRec('symptoms', b.dataset.hdel);
    viewHealth(main);
  }));
  if ($('#hfull')) $('#hfull').onclick = () => animateVB(svg, FULL_VB, () => { H.zoom = null; viewHealth(main); });
  $$('[data-mode]', main).forEach(b => (b.onclick = () => { H.mode = b.dataset.mode; viewHealth(main); }));

  function animateVB(el, target, done) {
    const from = [...H.vb], t0 = performance.now(), dur = 320;
    const step = now => {
      const k = Math.min(1, (now - t0) / dur), e = 1 - Math.pow(1 - k, 3);
      H.vb = from.map((v, i) => v + (target[i] - v) * e);
      el.setAttribute('viewBox', H.vb.join(' '));
      if (k < 1) requestAnimationFrame(step); else { H.vb = [...target]; done && done(); }
    };
    requestAnimationFrame(step);
  }

  const toSVG = ev => {
    const p = svg.createSVGPoint();
    p.x = ev.clientX; p.y = ev.clientY;
    return p.matrixTransform(svg.getScreenCTM().inverse());
  };
  const local = (pt, view) => ({ x: Math.max(0, Math.min(FIG_W, pt.x - FIG_X[view])), y: Math.max(0, Math.min(FIG_H, pt.y)) });
  let down = null, lasso = null;

  svg.onpointerdown = ev => {
    down = { cx: ev.clientX, cy: ev.clientY, pt: toSVG(ev) };
    if (H.zoom && H.mode === 'area') {
      svg.setPointerCapture(ev.pointerId);
      const l = local(down.pt, H.zoom.view);
      lasso = [[l.x, l.y]];
      ev.preventDefault();
    }
  };
  svg.onpointermove = ev => {
    if (!lasso) return;
    const l = local(toSVG(ev), H.zoom.view);
    const last = lasso[lasso.length - 1];
    if (Math.hypot(l.x - last[0], l.y - last[1]) > 1.2 * scale()) {
      lasso.push([+l.x.toFixed(1), +l.y.toFixed(1)]);
      $('#tempmark').innerHTML = markerSVG({ view: H.zoom.view, shape: { kind: 'area', pts: lasso } }, scale(), true);
    }
  };
  svg.onpointercancel = () => { down = null; lasso = null; $('#tempmark').innerHTML = ''; };
  svg.onpointerup = ev => {
    if (!down) return;
    const moved = Math.hypot(ev.clientX - down.cx, ev.clientY - down.cy);
    const pt = down.pt;
    down = null;
    if (!H.zoom) {
      if (moved > 10) return;
      const view = pt.x < 210 ? 'front' : 'back';
      const l = local(pt, view);
      // zoom in centered on the tapped spot, matching the box's shape
      const box = svg.getBoundingClientRect();
      const w = 150, h = w * box.height / box.width;
      const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
      const cx = clamp(l.x, w / 2 - 10, FIG_W + 10 - w / 2) + FIG_X[view];
      const cy = clamp(l.y, h / 2 - 10, FIG_H + 10 - h / 2);
      H.zoom = { view };
      animateVB(svg, [cx - w / 2, cy - h / 2, w, h], () => viewHealth(main));
      return;
    }
    const view = H.zoom.view;
    let shape;
    if (lasso && lasso.length > 6) {
      const xs = lasso.map(p => p[0]), ys = lasso.map(p => p[1]);
      const span = Math.max(Math.max(...xs) - Math.min(...xs), Math.max(...ys) - Math.min(...ys));
      if (span > 6) shape = { kind: 'area', pts: simplify(lasso) };
    }
    lasso = null;
    if (!shape) {
      if (H.mode === 'pin' && moved > 12) return;
      const l = local(pt, view);
      shape = { kind: 'pin', x: +l.x.toFixed(1), y: +l.y.toFixed(1) };
    }
    const c = shape.kind === 'pin' ? shape : centroid(shape.pts);
    const rg = regionAt(view, c.x, c.y);
    if (shapeDist(rg, c.x, c.y) > 0.9) { $('#tempmark').innerHTML = ''; toast('Tap on the body'); return; }
    const draft = { view, region: rg.key, regionLabel: rg.label, shape, cats: rg.cats };
    $('#tempmark').innerHTML = markerSVG(draft, scale(), true);
    symptomSheet(draft, () => viewHealth(main));
  };
}

function centroid(pts) {
  const n = pts.length;
  return { x: pts.reduce((s, p) => s + p[0], 0) / n, y: pts.reduce((s, p) => s + p[1], 0) / n };
}
function simplify(pts) {
  // keep at most ~40 points
  const step = Math.max(1, Math.floor(pts.length / 40));
  return pts.filter((_, i) => i % step === 0);
}

function symptomSheet(entry, after) {
  const sel = new Map((entry.items || []).map(i => [`${i.cat}|${i.name}`, { ...i }]));
  let cat = entry.cats[0];
  let time = entry.time || (ui.health.date === todayISO() ? nowTime() : '12:00');
  let notes = entry.notes || '';
  let saved = false;
  const box = openSheet('', () => after && after(saved));

  const draw = () => {
    const counts = c => [...sel.values()].filter(i => i.cat === c).length;
    box.innerHTML = `
      <div class="sheet-head"><h3>${esc(entry.regionLabel)}</h3><button class="x" data-close aria-label="Close">✕</button></div>
      <label class="field inline"><span>Time</span><input type="time" id="stime2" value="${time}"></label>
      ${entry.cats.length > 1 ? `<div class="chips cats">${entry.cats.map(c => `<button class="chip ${c === cat ? 'on' : ''}" data-cat="${c}">${SYMPTOMS[c].label}${counts(c) ? ` · ${counts(c)}` : ''}</button>`).join('')}</div>` : ''}
      <p class="muted">What does it feel like? Tap all that fit, then slide to show how bad it is.</p>
      <div class="symlist">
        ${SYMPTOMS[cat].items.map(n => {
          const k = `${cat}|${n}`, s = sel.get(k);
          return `<div class="sym ${s ? 'on' : ''}">
            <button class="symbtn" data-sym="${esc(k)}" aria-pressed="${!!s}"><span class="check">${s ? '✓' : ''}</span>${esc(n)}</button>
            ${s ? `<div class="sev">${isSimple() ? '' : `<span class="sevface" aria-hidden="true">${sevFace(s.sev)[1]}</span>`}<input type="range" min="1" max="10" step="1" value="${s.sev}" data-sev="${esc(k)}" aria-label="${esc(n)} strength"><b style="background:${sevColor(s.sev)}">${s.sev}</b></div>
              <div class="sevword">${sevFace(s.sev)[2]}</div>` : ''}
          </div>`;
        }).join('')}
      </div>
      <label class="field"><span>Notes</span><textarea id="snote2" rows="2" placeholder="Optional — what were you doing, what helped…">${esc(notes)}</textarea></label>
      <div class="sheet-actions">
        <button class="btn" data-close>Cancel</button>
        <button class="btn primary" id="symsave" ${sel.size ? '' : 'disabled'}>Save${sel.size ? ` (${sel.size})` : ''}</button>
      </div>`;
    $$('[data-close]', box).forEach(b => (b.onclick = () => closeSheet()));
    $('#stime2', box).onchange = e => { time = e.target.value || time; };
    $('#snote2', box).oninput = e => { notes = e.target.value; };
    $$('[data-cat]', box).forEach(b => (b.onclick = () => { cat = b.dataset.cat; draw(); }));
    $$('[data-sym]', box).forEach(b => (b.onclick = () => {
      const k = b.dataset.sym;
      if (sel.has(k)) sel.delete(k); else { const [c, name] = k.split('|'); sel.set(k, { cat: c, name, sev: 5 }); }
      const y = $('.symlist', box).scrollTop, sy = box.scrollTop;
      draw();
      $('.symlist', box).scrollTop = y; box.scrollTop = sy;
    }));
    $$('[data-sev]', box).forEach(r => (r.oninput = () => {
      const s = sel.get(r.dataset.sev);
      s.sev = +r.value;
      const b = r.nextElementSibling, f = sevFace(s.sev);
      b.textContent = s.sev;
      b.style.background = sevColor(s.sev);
      const face = r.previousElementSibling;
      if (face) face.textContent = f[1];
      r.parentElement.nextElementSibling.textContent = f[2];
    }));
    $('#symsave', box).onclick = async () => {
      const rec = {
        id: entry.id || uid(), date: entry.date || ui.health.date, time, view: entry.view,
        region: entry.region || 'general', regionLabel: entry.regionLabel, shape: entry.shape || { kind: 'general' },
        items: [...sel.values()], notes: notes.trim(),
      };
      await putRec('symptoms', rec);
      saved = true;
      closeSheet(true);
      celebrate($('#hgeneral'));
    };
  };
  draw();
}

/* =====================================================================
 * ⚙️ SETTINGS, backup, export
 * ===================================================================*/
function backupBanner() {
  const n = DATA.meals.length + DATA.stools.length + DATA.symptoms.length;
  if (n < 5) return '';
  const days = (Date.now() - (SETTINGS.lastBackup || 0)) / 864e5;
  if (days < 7) return '';
  return `<a class="banner" href="#/settings">💾 ${SETTINGS.lastBackup ? `Last backup was ${Math.floor(days)} days ago.` : 'You haven’t made a backup yet.'} Tap to back up.</a>`;
}

function viewSettings(main) {
  const customs = [...catalog().values()].filter(f => f.custom || f.fav || DATA.foods.some(u => u.key === f.key && u.tags));
  main.innerHTML = `
  <section class="card">
    <h2>Look</h2>
    <div class="seg"><button data-look="fun" class="${isSimple() ? '' : 'on'}">🎈 Playful</button><button data-look="simple" class="${isSimple() ? 'on' : ''}">Simple</button></div>
  </section>
  <section class="card">
    <h2>About you</h2>
    <label class="field"><span>Your name (shown on doctor reports)</span><input id="sname" value="${esc(SETTINGS.name)}" placeholder="Optional"></label>
  </section>
  <section class="card">
    <h2>Backup</h2>
    <p class="muted">Your entries live only on this iPhone. If the app is deleted, so is your data — a backup file is the only way to get it back.
    ${SETTINGS.lastBackup ? `Last backup: ${new Date(SETTINGS.lastBackup).toLocaleString()}.` : 'No backup yet.'}</p>
    <button class="btn primary block" id="bk">💾 Back up now</button>
    <label class="btn block filebtn">Restore from a backup<input type="file" id="rs" accept="application/json,.json" hidden></label>
    <button class="btn block" id="csv">Export spreadsheet (CSV)</button>
    <p class="muted small" id="storageinfo"></p>
  </section>
  <section class="card">
    <h2>My foods</h2>
    <p class="muted">Items you added, starred or re-tagged. Tap one to change its tags.</p>
    <div class="chips">${customs.length ? customs.sort((a, b) => a.name.localeCompare(b.name)).map(f => `<button class="chip" data-food="${esc(f.name)}">${f.fav ? '★ ' : ''}${esc(f.name)}</button>`).join('') : '<p class="muted">None yet.</p>'}</div>
    <div class="search"><input type="search" id="tagsearch" placeholder="Change tags on any food…" autocomplete="off"><div id="tagresults" class="results" hidden></div></div>
  </section>
  <section class="card">
    <h2>About this app</h2>
    <p class="muted">Health Log ${APP_VERSION}. A personal journal — not a medical device. The analysis shows patterns in what you logged; it can’t diagnose anything or prove a cause. Share your report with your doctor before changing your diet or treatment.</p>
    <button class="btn block" id="upd">🔄 Check for updates</button>
    <button class="btn danger block" id="wipe">Delete all my data</button>
  </section>`;
  $$('[data-look]', main).forEach(b => (b.onclick = () => {
    const simple = b.dataset.look === 'simple';
    document.documentElement.classList.toggle('simple', simple);
    store.set('look', simple ? 'simple' : 'fun');
    render();
  }));
  $('#sname').onchange = async e => { SETTINGS.name = e.target.value.trim(); await saveSettings(); toast('Saved'); };
  $('#bk').onclick = backup;
  $('#upd').onclick = checkForUpdate;
  $('#rs').onchange = e => e.target.files[0] && restore(e.target.files[0]);
  $('#csv').onclick = exportCSV;
  $('#wipe').onclick = async () => {
    if (!confirm('Delete ALL entries on this phone? This cannot be undone.')) return;
    if (prompt('Type DELETE to confirm') !== 'DELETE') return;
    for (const s of STORES) { await DB.clear(s); DATA[s] = []; }
    toast('All data deleted');
    render();
  };
  const editFood = name => { const info = foodInfo(name); newFoodSheet(info.name, () => { toast('Saved'); viewSettings(main); }, info); };
  $$('[data-food]', main).forEach(b => (b.onclick = () => editFood(b.dataset.food)));
  const ti = $('#tagsearch'), tr = $('#tagresults');
  ti.oninput = () => {
    const hits = searchFoods(ti.value);
    tr.hidden = !hits.length;
    tr.innerHTML = hits.map(h => `<button data-food="${esc(h.name)}"><span>${esc(h.name)}</span><span class="tags">${tagChips(h.tags.slice(0, 3))}</span></button>`).join('');
    $$('[data-food]', tr).forEach(b => (b.onclick = () => editFood(b.dataset.food)));
  };
  if (navigator.storage?.persisted) navigator.storage.persisted().then(p => { $('#storageinfo').textContent = p ? 'Storage is marked as persistent on this device.' : 'Tip: open the app from the Home Screen icon so iOS keeps its storage.'; });
}

async function shareOrDownload(blob, name) {
  const file = new File([blob], name, { type: blob.type });
  if (navigator.canShare && navigator.canShare({ files: [file] })) {
    try { await navigator.share({ files: [file], title: name }); return true; } catch (e) { if (e.name === 'AbortError') return false; }
  }
  const url = URL.createObjectURL(blob);
  const a = Object.assign(document.createElement('a'), { href: url, download: name });
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 15000);
  return true;
}
const fileSlug = () => (SETTINGS.name ? SETTINGS.name.replace(/[^\w]+/g, '-').toLowerCase() + '-' : '');

async function backup() {
  const obj = { app: 'health-log', format: 1, version: APP_VERSION, exportedAt: new Date().toISOString(), settings: SETTINGS, ...DATA };
  const ok = await shareOrDownload(new Blob([JSON.stringify(obj)], { type: 'application/json' }), `${fileSlug()}health-log-backup-${todayISO()}.json`);
  if (!ok) return;
  SETTINGS.lastBackup = Date.now();
  await saveSettings();
  toast('Backup created');
  render();
}
async function restore(file) {
  let obj;
  try { obj = JSON.parse(await file.text()); } catch { return toast('That file is not a backup.'); }
  if (obj.app !== 'health-log') return toast('That file is not a Health Log backup.');
  const total = STORES.reduce((n, s) => n + (obj[s]?.length || 0), 0);
  if (!confirm(`Restore backup from ${new Date(obj.exportedAt).toLocaleString()} (${total} items)?\n\nItems missing here, or newer in the backup, are added. Nothing on this phone is deleted.`)) return;
  let added = 0;
  for (const s of STORES) {
    const k = s === 'foods' ? 'key' : 'id';
    const add = (obj[s] || []).filter(r => { const cur = DATA[s].find(x => x[k] === r[k]); return !cur || (r.updatedAt || 0) > (cur.updatedAt || 0); });
    await DB.putMany(s, add);
    add.forEach(r => { const i = DATA[s].findIndex(x => x[k] === r[k]); if (i >= 0) DATA[s][i] = r; else DATA[s].push(r); });
    added += add.length;
  }
  if (!SETTINGS.name && obj.settings?.name) { SETTINGS.name = obj.settings.name; await saveSettings(); }
  toast(`Restored ${added} items`);
  render();
}
function csvCell(v) { v = String(v ?? ''); return /[",\n]/.test(v) ? `"${v.replace(/"/g, '""')}"` : v; }
async function exportCSV() {
  const rows = [['Date', 'Time', 'Type', 'What', 'Details', 'Strength (1-10)', 'Notes']];
  for (const m of DATA.meals) for (const it of m.items) rows.push([m.date, m.time, MEALS.find(x => x.key === m.slot)?.label, it.name, (it.tags || []).map(t => TAGS[t]).join('; '), '', '']);
  for (const s of DATA.stools) rows.push([s.date, s.time, 'Stool', `Bristol type ${s.type}`, [STOOL_AMOUNTS.find(a => a.key === s.amount)?.label, ...s.flags.map(k => STOOL_FLAGS.find(f => f.key === k)?.label)].join('; '), '', s.notes]);
  for (const e of DATA.symptoms) for (const i of e.items) rows.push([e.date, e.time, 'Symptom', i.name, e.regionLabel, i.sev, e.notes]);
  rows.splice(1, rows.length, ...rows.slice(1).sort((a, b) => (a[0] + a[1]).localeCompare(b[0] + b[1])));
  await shareOrDownload(new Blob([rows.map(r => r.map(csvCell).join(',')).join('\r\n')], { type: 'text/csv' }), `${fileSlug()}health-log-${todayISO()}.csv`);
}

/* ---------------- app updates ---------------- */
// iPhones usually resume a Home Screen app instead of restarting it, so check
// for a new version whenever the app comes back to the screen, and reload into
// it as soon as it's ready (unless a pop-up is open).
let swReg = null;
function setupUpdates() {
  if (!('serviceWorker' in navigator) || location.protocol === 'file:') return;
  const hadController = !!navigator.serviceWorker.controller;
  navigator.serviceWorker.register('sw.js', { updateViaCache: 'none' }).then(r => { swReg = r; }).catch(() => {});
  let reloading = false;
  const reload = () => { if (!reloading) { reloading = true; location.reload(); } };
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (!hadController) return; // first install, nothing to refresh
    if ($('#sheet').hidden) reload();
    else $('#sheet').onClose = (cb => saved => { cb && cb(saved); reload(); })($('#sheet').onClose);
  });
  document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible') swReg?.update().catch(() => {}); });
}
async function checkForUpdate() {
  toast('Checking for updates…');
  try { await swReg?.update(); } catch { /* offline */ }
  setTimeout(() => location.reload(), 1200);
}

/* ---------------- start ---------------- */
(async function start() {
  try {
    await DB.open();
    for (const s of STORES) DATA[s] = await DB.all(s);
    const st = await DB.get('meta', 'settings');
    if (st) SETTINGS = { ...SETTINGS, ...st.value };
  } catch (e) {
    $('#main').innerHTML = `<p class="empty">This browser blocked local storage, so the app can’t save entries. Open it from the Home Screen icon (not a private tab).</p>`;
    return;
  }
  $('#gear').onclick = () => go('settings');
  $('#back').onclick = () => (history.length > 1 ? history.back() : go('analysis'));
  window.addEventListener('hashchange', () => { closeSheet(); $('#toast').hidden = true; window.scrollTo(0, 0); render(); });
  render();
  setupUpdates();
})();
