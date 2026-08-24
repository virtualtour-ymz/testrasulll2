/* =========================================================
   جستجوی سراسری پانوراما — ویجت مستقل (بالا-راست صفحه)
   =========================================================
   کجا بذاری: 3DVista Studio > Skin/Main Viewer > On Initialization
   این یک اکشن Execute Javascript جداگانه است — کاملاً مستقل از
   منوی کناری طبقات؛ می‌تونی هر دو رو با هم یا هرکدوم رو تنها فعال کنی.

   منطق داده: این ویجت لیست پانوراماهایی که توی «پنل مدیریت» تعریف
   کردی رو به‌عنوان پایه‌ی همیشه-قابل‌اعتماد داره؛ علاوه بر اون، سعی
   می‌کنه لیست کامل پانوراماهای موتور تور رو هم به‌صورت خودکار (best-effort)
   شناسایی کنه و به همون لیست اضافه کنه. اگه شناسایی خودکار به هر
   دلیلی کار نکنه (مثلاً ساختار داخلی 3DVista فرق داشته باشه)، هیچ
   اتفاقی نمی‌افته و جستجو با همون لیست پایه کار می‌کنه.
   ========================================================= */

(function () {

  function goToPano(panoName) {
    window.location.hash = "media=" + encodeURIComponent(panoName);
  }

  /* ---------- لیست پایه (همون داده‌ی پنل مدیریت) ---------- */
  const FLOORS = [
  {
    "key": "gf",
    "label": "طبقه همکف",
    "badge": "هم",
    "panos": [
      {
        "name": "بستری اورژانس",
        "label": "بستری اورژانس",
        "code": "",
        "thumb": ""
      },
      {
        "name": "تریاژ",
        "label": "تریاژ",
        "code": "",
        "thumb": ""
      },
      {
        "name": "رادیولوژی",
        "label": "رادیولوژی",
        "code": "",
        "thumb": ""
      },
      {
        "name": "آزمایشگاه",
        "label": "آزمایشگاه",
        "code": "",
        "thumb": ""
      },
      {
        "name": "آسانسور همکف",
        "label": "آسانسور همکف",
        "code": "",
        "thumb": ""
      },
      {
        "name": "نمازخانه",
        "label": "نمازخانه",
        "code": "",
        "thumb": ""
      },
      {
        "name": "پذیرش1",
        "label": "پذیرش",
        "code": "",
        "thumb": ""
      }
    ]
  },
  {
    "key": "f4",
    "label": "طبقه چهارم",
    "badge": "۴",
    "panos": [
      {
        "name": "بخش اطفال",
        "label": "بخش اطفال",
        "code": "",
        "thumb": ""
      },
      {
        "name": "مراقبت‌های ویژه کودکان",
        "label": "مراقبت‌های ویژه کودکان",
        "code": "",
        "thumb": ""
      },
      {
        "name": "بخش جراحی",
        "label": "بخش جراحی",
        "code": "",
        "thumb": ""
      },
      {
        "name": "آسانسور طبقه چهارم",
        "label": "آسانسور طبقه چهارم",
        "code": "",
        "thumb": ""
      }
    ]
  }
];

  const BASELINE = [];
  FLOORS.forEach(floor => {
    floor.panos.forEach(p => {
      BASELINE.push({ name: p.name, label: p.label || p.name, code: p.code || '', floor: floor.label || '', thumb: p.thumb || '' });
    });
  });

  /* ---------- تلاش برای شناسایی خودکار همه‌ی پانوراماهای تور ----------
     چند روش شناخته‌شده‌ی 3DVista رو امتحان می‌کنیم؛ هر کدوم که جواب داد
     همون استفاده می‌شه. اگه هیچ‌کدوم جواب نداد، فقط با BASELINE کار می‌کنیم. */
  function tryAutoDetect() {
    const found = [];
    const pushItem = (name, label) => {
      if (!name) return;
      found.push({ name: String(name), label: label ? String(label) : String(name), code: '', floor: '', thumb: '' });
    };

    /* روش ۱: window.tour.get('playlist').get('items') */
    try {
      if (window.tour && typeof window.tour.get === 'function') {
        const playlist = window.tour.get('playlist');
        if (playlist && typeof playlist.get === 'function') {
          const items = playlist.get('items') || [];
          items.forEach(it => {
            try {
              const data = typeof it.get === 'function' ? it.get('data') : null;
              const name = data && typeof data.get === 'function' ? (data.get('name') || data.get('media')) : (it.name || it.media);
              const label = data && typeof data.get === 'function' ? (data.get('label') || data.get('title')) : (it.label || it.title);
              pushItem(name, label);
            } catch (innerErr) { /* این آیتم رو رد کن */ }
          });
        }
      }
    } catch (e) { console.warn('[جستجوی پانوراما] روش ۱ ناموفق:', e.message); }

    /* روش ۲: window.tour.mainPlayList / window.tour.get('mainPlayList') */
    try {
      if (window.tour && typeof window.tour.get === 'function' && !found.length) {
        const mp = window.tour.get('mainPlayList') || window.tour.mainPlayList;
        const items = mp && typeof mp.get === 'function' ? mp.get('items') : (mp && mp.items);
        (items || []).forEach(it => {
          try {
            const name = (it.get && (it.get('name') || it.get('media'))) || it.name || it.media;
            const label = (it.get && (it.get('label') || it.get('title'))) || it.label || it.title;
            pushItem(name, label);
          } catch (innerErr) {}
        });
      }
    } catch (e) { console.warn('[جستجوی پانوراما] روش ۲ ناموفق:', e.message); }

    /* روش ۳: window.TDV.Tour (نسخه‌های قدیمی‌تر) */
    try {
      if (window.TDV && window.TDV.Tour && typeof window.TDV.Tour.getCurrentTour === 'function' && !found.length) {
        const t = window.TDV.Tour.getCurrentTour();
        const playlist = t && typeof t.get === 'function' ? t.get('playlist') : null;
        const items = playlist && typeof playlist.get === 'function' ? playlist.get('items') : [];
        (items || []).forEach(it => {
          try {
            const data = it.get ? it.get('data') : null;
            const name = data ? (data.get('name') || data.get('media')) : (it.name || it.media);
            const label = data ? (data.get('label') || data.get('title')) : (it.label || it.title);
            pushItem(name, label);
          } catch (innerErr) {}
        });
      }
    } catch (e) { console.warn('[جستجوی پانوراما] روش ۳ ناموفق:', e.message); }

    return found;
  }

  function mergeUnique(base, extra) {
    const map = new Map();
    base.forEach(p => map.set(p.name, p));
    extra.forEach(p => { if (!map.has(p.name)) map.set(p.name, p); });
    return Array.from(map.values());
  }

  let ALL_PANOS = BASELINE.slice();

  const CSS = `
  #glassSearchWrap, #glassSearchWrap *{ box-sizing:border-box; font-family:'Vazirmatn', sans-serif; -webkit-tap-highlight-color:transparent; }
  #glassSearchWrap{
    --ink:#000000; --ink-dim:rgba(0,0,0,0.7); --gold:#171717; --gold-bright:#4a4a4a; --gold-rgb:23,23,23; --mint:#b7afa2; --mint-rgb:183,175,162;
    --glass-fill: rgba(201,201,201,0.75); --glass-fill-2: rgba(201,201,201,0.83);
    --glass-border: rgba(0,0,0,0.16); --glass-border-strong: rgba(23,23,23,0.4);
    --radius-lg:16px; --radius-sm:11px; --blur:13px; --text-scale:1.2;
    position:fixed; top:calc(12px + env(safe-area-inset-top,0px)); right:calc(12px + env(safe-area-inset-right,0px));
    z-index:10050; direction:rtl;
  }
  #glassSearchBtn{
    width:clamp(38px,9vw,44px); height:clamp(38px,9vw,44px); border-radius:50%;
    background:linear-gradient(155deg, var(--glass-fill-2) 0%, var(--glass-fill) 100%);
    backdrop-filter:blur(var(--blur)) saturate(140%); -webkit-backdrop-filter:blur(var(--blur)) saturate(140%);
    border:1px solid var(--glass-border-strong);
    box-shadow:0 10px 26px rgba(20,20,20,0.16), inset 0 1px 0 rgba(255,255,255,0.5);
    display:flex; align-items:center; justify-content:center; color:var(--ink);
    cursor:pointer; transition:transform .25s cubic-bezier(.65,0,.35,1), opacity .2s ease;
  }
  #glassSearchBtn svg{ width:17px; height:17px; }
  #glassSearchWrap.open #glassSearchBtn{ opacity:0; pointer-events:none; transform:scale(.7); position:absolute; top:0; right:0; }

  #glassSearchBar{
    position:absolute; top:0; right:0; width:clamp(44px, 9vw, 44px);
    display:flex; align-items:center; gap:8px; height:clamp(38px,9vw,44px);
    background:linear-gradient(155deg, var(--glass-fill-2) 0%, var(--glass-fill) 100%);
    backdrop-filter:blur(var(--blur)) saturate(140%); -webkit-backdrop-filter:blur(var(--blur)) saturate(140%);
    border:1px solid var(--glass-border-strong); border-radius:999px;
    box-shadow:0 10px 26px rgba(20,20,20,0.16), inset 0 1px 0 rgba(255,255,255,0.5);
    overflow:hidden; padding:0; opacity:0; pointer-events:none;
    transition:width .32s cubic-bezier(.32,.72,0,1), opacity .22s ease, padding .32s ease;
  }
  #glassSearchWrap.open #glassSearchBar{
    width:min(78vw, 320px); padding:0 14px 0 8px; opacity:1; pointer-events:auto;
  }
  #glassSearchBar svg.s-icon{ width:16px; height:16px; color:var(--ink-dim); flex-shrink:0; }
  #glassSearchBar input{
    flex:1; min-width:0; background:transparent; border:none; outline:none;
    color:var(--ink); font-family:'Vazirmatn', sans-serif; font-size:13.5px;
  }
  #glassSearchBar input::placeholder{ color:var(--ink-dim); }
  #glassSearchBar .s-close{
    width:26px; height:26px; border-radius:50%; flex-shrink:0; display:flex; align-items:center; justify-content:center;
    color:var(--ink-dim); cursor:pointer;
  }
  #glassSearchBar .s-close svg{ width:14px; height:14px; }

  #glassSearchResults{
    position:absolute; top:calc(clamp(38px,9vw,44px) + 8px); right:0; width:min(78vw, 320px);
    max-height:min(60vh, 420px); overflow-y:auto; -webkit-overflow-scrolling:touch;
    background:linear-gradient(165deg, var(--glass-fill) 0%, var(--glass-fill-2) 100%);
    backdrop-filter:blur(var(--blur)) saturate(140%); -webkit-backdrop-filter:blur(var(--blur)) saturate(140%);
    border:1px solid var(--glass-border); border-radius:var(--radius-sm);
    box-shadow:0 24px 60px rgba(20,20,20,0.2), inset 0 1px 0 rgba(255,255,255,0.5);
    opacity:0; transform:translateY(-6px); pointer-events:none;
    transition:opacity .2s ease, transform .25s cubic-bezier(.32,.72,0,1);
    padding:6px;
  }
  #glassSearchWrap.open.has-query #glassSearchResults{ opacity:1; transform:translateY(0); pointer-events:auto; }

  #glassSearchResults .sr-item{
    display:flex; align-items:center; gap:10px; padding:8px; border-radius:10px; cursor:pointer;
    min-height:48px; touch-action:manipulation;
  }
  #glassSearchResults .sr-item:hover, #glassSearchResults .sr-item:active{ background:rgba(255,255,255,0.4); }
  #glassSearchResults .sr-thumb{
    width:44px; height:33px; border-radius:8px; flex-shrink:0;
    background:linear-gradient(135deg, rgba(var(--mint-rgb),0.4), rgba(30,30,30,0.12));
    background-size:cover; background-position:center; border:1px solid rgba(255,255,255,0.6);
  }
  #glassSearchResults .sr-meta{ min-width:0; flex:1; }
  #glassSearchResults .sr-name{ font-size:13px; font-weight:600; color:var(--ink); white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
  #glassSearchResults .sr-floor{ font-size:10.5px; color:var(--gold); font-family:'JetBrains Mono',monospace; margin-top:2px; }
  #glassSearchResults .sr-empty{ text-align:center; color:var(--ink-dim); font-size:12.5px; padding:20px 10px; }
  `;

  function esc(s){
    return String(s == null ? '' : s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  }

  function buildHTML() {
    return `
      <button id="glassSearchBtn" title="جستجوی پانوراما" aria-label="جستجوی پانوراما">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/></svg>
      </button>
      <div id="glassSearchBar">
        <svg class="s-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/></svg>
        <input id="glassSearchInput" type="text" placeholder="جستجوی مکان...">
        <span class="s-close" id="glassSearchClose">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6L6 18M6 6l12 12"/></svg>
        </span>
      </div>
      <div id="glassSearchResults"></div>
    `;
  }

  function renderResults(query) {
    const box = document.getElementById('glassSearchResults');
    const wrap = document.getElementById('glassSearchWrap');
    const q = query.trim().toLowerCase();
    wrap.classList.toggle('has-query', q.length > 0);
    if (!q) { box.innerHTML = ''; return; }

    const matches = ALL_PANOS.filter(p =>
      (p.label || '').toLowerCase().includes(q) ||
      (p.name || '').toLowerCase().includes(q) ||
      (p.code || '').toLowerCase().includes(q) ||
      (p.floor || '').toLowerCase().includes(q)
    ).slice(0, 40);

    if (!matches.length) {
      box.innerHTML = `<div class="sr-empty">چیزی پیدا نشد</div>`;
      return;
    }

    box.innerHTML = matches.map(p => `
      <div class="sr-item" data-pano="${esc(p.name)}">
        <div class="sr-thumb"${p.thumb ? ` style="background-image:url('${esc(p.thumb)}')"` : ''}></div>
        <div class="sr-meta">
          <div class="sr-name">${esc(p.label)}</div>
          ${p.floor ? `<div class="sr-floor">${esc(p.floor)}</div>` : ''}
        </div>
      </div>
    `).join('');

    box.querySelectorAll('.sr-item').forEach(item => {
      item.addEventListener('click', () => {
        goToPano(item.getAttribute('data-pano'));
        closeSearch();
      });
    });
  }

  let wrapEl, inputEl;
  function openSearch(){
    wrapEl.classList.add('open');
    setTimeout(() => inputEl && inputEl.focus(), 80);
  }
  function closeSearch(){
    wrapEl.classList.remove('open', 'has-query');
    if (inputEl) inputEl.value = '';
  }

  function init() {
    if (document.getElementById('glassSearchWrap')) return;

    if (!document.getElementById('glassSearchFonts')) {
      const fontLink = document.createElement('link');
      fontLink.id = 'glassSearchFonts';
      fontLink.rel = 'stylesheet';
      fontLink.href = 'https://fonts.googleapis.com/css2?family=Vazirmatn:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600&display=swap';
      document.head.appendChild(fontLink);
    }

    const style = document.createElement('style');
    style.textContent = CSS;
    document.head.appendChild(style);

    wrapEl = document.createElement('div');
    wrapEl.id = 'glassSearchWrap';
    wrapEl.innerHTML = buildHTML();
    document.body.appendChild(wrapEl);
    inputEl = document.getElementById('glassSearchInput');

    /* شناسایی خودکار (best-effort) — بدون اینکه چیزی رو خراب کنه */
    try {
      const discovered = tryAutoDetect();
      if (discovered.length) {
        ALL_PANOS = mergeUnique(BASELINE, discovered);
        console.log('[جستجوی پانوراما] ' + discovered.length + ' پانوراما به‌صورت خودکار از موتور تور شناسایی شد. مجموع: ' + ALL_PANOS.length);
      } else {
        console.log('[جستجوی پانوراما] شناسایی خودکار چیزی پیدا نکرد؛ فقط لیست پایه (' + ALL_PANOS.length + ' مورد) استفاده می‌شه.');
      }
    } catch (e) {
      console.warn('[جستجوی پانوراما] خطا در شناسایی خودکار:', e.message);
    }

    document.getElementById('glassSearchBtn').addEventListener('click', openSearch);
    document.getElementById('glassSearchClose').addEventListener('click', closeSearch);
    inputEl.addEventListener('input', () => renderResults(inputEl.value));

    document.addEventListener('click', (e) => {
      if (wrapEl.classList.contains('open') && !wrapEl.contains(e.target)) closeSearch();
    });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && wrapEl.classList.contains('open')) closeSearch();
    });

    /* سازگاری با فول‌اسکرین، مثل منوی طبقات */
    function getFsElement() {
      return document.fullscreenElement || document.webkitFullscreenElement ||
             document.mozFullScreenElement || document.msFullscreenElement || null;
    }
    function relocateWrap() {
      const target = getFsElement() || document.body;
      if (wrapEl.parentElement !== target) target.appendChild(wrapEl);
    }
    ['fullscreenchange', 'webkitfullscreenchange', 'mozfullscreenchange', 'MSFullscreenChange']
      .forEach(evt => document.addEventListener(evt, relocateWrap));
  }

  init();

})();
