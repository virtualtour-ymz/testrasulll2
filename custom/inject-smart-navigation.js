/* ============================================================
   inject-smart-navigation.js
   قابلیت مسیریابی هوشمند برای تور مجازی بیمارستان (3DVista)

   منطق نهایی (بعد از چند بار تست و رفع اشکال):
   - گراف مستقیماً از روی اسم صحنه‌ها (Label فارسی) که خودت تأیید کردی ساخته شده
   - جابجایی با فرمت رسمی خود 3DVista: #media=<اسم>&yaw=<جهت>&pitch=<زاویه>
     (این پارامتر رسمیه؛ خود موتور تور چرخش نرم دوربین رو انجام می‌ده،
      نیازی به دستکاری camera یا window.tour از بیرون نیست)
   - هیچ وابستگی‌ای به ساختار داخلی script_general.js یا window.tour نداره
   ============================================================ */
(function () {
  'use strict';

  /* ---------- 1) گراف صحنه‌ها (طبق چیزی که خودت تأیید کردی) ----------
     برای اضافه/ویرایش: کافیه این آبجکت رو دستی آپدیت کنی.
     فرمت هر یال: { to: "اسم مقصد", yaw: عدد (اختیاری), pitch: عدد (اختیاری) } */
  var GRAPH = {
    "ورودی اصلی":      [{ to: "ورودی کلینیک", yaw: 75.29 }, { to: "پذیرش1", yaw: 1.08 }, { to: "ورودی اورژانس", yaw: -61.35 }],
    "ورودی کلینیک":     [{ to: "روبروی آزمایشگاه", yaw: 1.97 }, { to: "ورودی اصلی", yaw: -91.65 }],
    "ورودی اورژانس":    [{ to: "ورودی اصلی", yaw: 69.32 }, { to: "تریاژ", yaw: -1.35 }],
    "تریاژ":            [{ to: "بستری اورژانس", yaw: 87.42 }, { to: "ورودی اورژانس", yaw: -10.72 }, { to: "راهنمای خطوط", yaw: -151.25 }],
    "بستری اورژانس":    [{ to: "تریاژ", yaw: -20.07 }],
    "پذیرش1":           [{ to: "ورودی اصلی", yaw: -0.11 }, { to: "پذیرش2", yaw: -177.2 }],
    "پذیرش2":           [{ to: "پذیرش1", yaw: -179.66 }, { to: "راهنمای خطوط", yaw: -1.79 }, { to: "آسانسور همکف", yaw: 39.5 }],
    "آسانسور همکف":     [{ to: "پذیرش2", yaw: -92.75 }, { to: "نمازخانه", yaw: 79.73 }],
    "نمازخانه":         [{ to: "آسانسور همکف", yaw: -1.43 }],
    "راهنمای خطوط":     [{ to: "تریاژ", yaw: -100.28 }, { to: "پذیرش2", yaw: -178.47 }, { to: "ورودی رادیولوژی" }],
    "روبروی آزمایشگاه": [{ to: "آزمایشگاه" }, { to: "ورودی کلینیک", yaw: 152.65 }, { to: "روبروی کتابخونه", yaw: -85.85 }],
    "آزمایشگاه":        [{ to: "روبروی آزمایشگاه", yaw: 87.73 }],
    "روبروی کتابخونه":  [{ to: "کتابخونه" }, { to: "روبروی آزمایشگاه", yaw: 154.27 }],
    "کتابخونه":         [{ to: "روبروی کتابخونه", yaw: 148.53 }],
    "ورودی رادیولوژی":  [{ to: "راهنمای خطوط" }]
  };
  /* توجه: اسم صحیح تو فایل پروژه "کتابخونه" و "روبروی کتابخونه"ست (نه کتابخانه) —
     اگه setMediaByName این اسم رو تو تور پیدا نکنه، یعنی لیبل واقعی صحنه فرق داره،
     می‌تونی از پنل Scene Properties تو 3DVista اسم دقیق رو چک کنی. */

  /* اگر graph دو طرفه نبود (لینکی فقط یک طرف تعریف شده) خودکار می‌سازیمش */
  (function ensureUndirected() {
    Object.keys(GRAPH).forEach(function (from) {
      GRAPH[from].forEach(function (edge) {
        if (!GRAPH[edge.to]) GRAPH[edge.to] = [];
        var hasBack = GRAPH[edge.to].some(function (e) { return e.to === from; });
        if (!hasBack) GRAPH[edge.to].push({ to: from });
      });
    });
  })();

  /* ---------- 2) الگوریتم Dijkstra (وزن = تعداد گام) ---------- */
  function dijkstra(start, end) {
    var dist = {}, prev = {}, visited = {};
    Object.keys(GRAPH).forEach(function (n) { dist[n] = Infinity; });
    if (!(start in dist) || !(end in dist)) return null;
    dist[start] = 0;

    while (true) {
      var u = null, best = Infinity;
      for (var n in dist) { if (!visited[n] && dist[n] < best) { best = dist[n]; u = n; } }
      if (u === null || u === end) break;
      visited[u] = true;
      (GRAPH[u] || []).forEach(function (edge) {
        if (!(edge.to in dist)) return;
        var alt = dist[u] + 1;
        if (alt < dist[edge.to]) { dist[edge.to] = alt; prev[edge.to] = { from: u, yaw: edge.yaw, pitch: edge.pitch, fov: edge.fov }; }
      });
    }

    if (dist[end] === Infinity) return null;
    var steps = [], cur = end;
    while (cur !== start) {
      var p = prev[cur];
      if (!p) return null;
      steps.unshift({ from: p.from, to: cur, yaw: p.yaw, pitch: p.pitch, fov: p.fov });
      cur = p.from;
    }
    return { steps: steps };
  }

  function getSelectableLabels() {
    return Object.keys(GRAPH).sort(function (a, b) { return a.localeCompare(b, 'fa'); });
  }

  /* ---------- 3) استایل ---------- */
  var css = ''
    + '@import url("https://fonts.googleapis.com/css2?family=Vazirmatn:wght@400;500;600;700&display=swap");'
    + '#snav-btn{position:fixed;top:calc(14px + env(safe-area-inset-top,0px));left:50%;transform:translateX(-50%);z-index:2147483647;'
    + 'padding:11px 20px;border-radius:999px;border:1px solid rgba(212,175,55,.35);'
    + 'background:linear-gradient(160deg,rgba(11,31,36,.92),rgba(15,46,52,.88));backdrop-filter:blur(14px);'
    + 'display:flex;align-items:center;justify-content:center;cursor:pointer;white-space:nowrap;'
    + 'font-family:"Vazirmatn",sans-serif;font-size:13px;font-weight:600;color:#e8f4f2;letter-spacing:.2px;'
    + 'box-shadow:0 8px 24px rgba(0,0,0,.35),inset 0 0 0 1px rgba(45,212,191,.08);transition:transform .25s ease,box-shadow .25s ease;'
    + 'user-select:none;-webkit-tap-highlight-color:transparent;}'
    + '#snav-btn:hover{transform:translateX(-50%) translateY(2px);box-shadow:0 4px 16px rgba(0,0,0,.4);}'
    + '#snav-panel{position:fixed;top:0;left:50%;transform:translateX(-50%) translateY(-130%);'
    + 'width:min(380px,94vw);max-width:94vw;z-index:2147483647;'
    + 'margin-top:calc(72px + env(safe-area-inset-top,0px));border-radius:22px;'
    + 'padding:20px 18px 16px;box-sizing:border-box;'
    + 'background:linear-gradient(165deg,rgba(9,25,29,.96),rgba(13,41,46,.94));'
    + 'border:1px solid rgba(212,175,55,.25);backdrop-filter:blur(20px);'
    + 'box-shadow:0 20px 60px rgba(0,0,0,.5),inset 0 0 0 1px rgba(45,212,191,.06);'
    + 'font-family:"Vazirmatn",sans-serif;direction:rtl;transition:transform .4s cubic-bezier(.22,1,.36,1);'
    + 'max-height:calc(100vh - 100px);overflow-y:auto;}'
    + '#snav-panel.open{transform:translateX(-50%) translateY(0);}'
    + '#snav-panel h3{margin:0 0 16px;font-size:14.5px;font-weight:700;color:#e8f4f2;letter-spacing:.2px;'
    + 'display:flex;align-items:center;gap:8px;}'
    + '#snav-panel h3 .dot{width:6px;height:6px;border-radius:50%;background:#d4af37;box-shadow:0 0 8px #d4af37;flex-shrink:0;}'
    + '.snav-field{margin-bottom:12px;}'
    + '.snav-field label{display:block;font-size:11.5px;color:#8fb5b0;margin-bottom:6px;font-weight:500;}'
    + '.snav-field select{width:100%;box-sizing:border-box;padding:12px 14px;border-radius:12px;'
    + 'border:1px solid rgba(45,212,191,.2);background-color:#0d2226;color:#eaf6f4;'
    + 'font-family:"Vazirmatn",sans-serif;font-size:14px;outline:none;appearance:none;cursor:pointer;'
    + 'background-image:url(\'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="12" height="8"><path d="M1 1l5 5 5-5" stroke="%232dd4bf" stroke-width="1.6" fill="none"/></svg>\');'
    + 'background-repeat:no-repeat;background-position:14px center;padding-left:32px;transition:border-color .2s;}'
    + '.snav-field select:focus{border-color:#2dd4bf;}'
    + '.snav-field select option{background-color:#0d2226;color:#eaf6f4;}'
    + '#snav-go{width:100%;margin-top:6px;padding:13px;border:none;border-radius:12px;cursor:pointer;'
    + 'background:linear-gradient(120deg,#2dd4bf,#1a8f82);color:#06201d;font-family:"Vazirmatn",sans-serif;'
    + 'font-weight:700;font-size:14px;transition:filter .2s,transform .15s;-webkit-tap-highlight-color:transparent;}'
    + '#snav-go:hover{filter:brightness(1.08);}'
    + '#snav-go:active{transform:scale(.98);}'
    + '#snav-go:disabled{opacity:.5;cursor:not-allowed;}'
    + '#snav-status{margin-top:14px;padding:12px 14px;border-radius:12px;background:rgba(212,175,55,.08);'
    + 'border:1px solid rgba(212,175,55,.2);font-size:12.5px;color:#f0dfa8;display:none;'
    + 'align-items:center;justify-content:space-between;gap:10px;}'
    + '#snav-status.show{display:flex;}'
    + '#snav-status .txt{flex:1;line-height:1.6;}'
    + '#snav-status b{font-family:"JetBrains Mono",monospace;color:#ffe9a8;}'
    + '#snav-cancel{border:none;background:rgba(255,90,90,.15);color:#ff9d9d;border-radius:8px;'
    + 'padding:7px 12px;font-family:"Vazirmatn",sans-serif;font-size:11.5px;cursor:pointer;white-space:nowrap;-webkit-tap-highlight-color:transparent;}'
    + '#snav-err{margin-top:10px;font-size:12px;color:#ff8f8f;display:none;}'
    + '#snav-close{position:absolute;top:14px;left:16px;background:none;border:none;color:#7fa8a2;'
    + 'font-size:20px;cursor:pointer;line-height:1;padding:4px;-webkit-tap-highlight-color:transparent;}'
    + '@media (max-width:420px){'
    + '#snav-btn{font-size:12px;padding:10px 16px;}'
    + '#snav-panel{padding:18px 14px 14px;border-radius:18px;}'
    + '#snav-panel h3{font-size:13.5px;}'
    + '.snav-field select{font-size:15px;padding:13px 14px;padding-left:30px;}'
    + '#snav-go{font-size:14.5px;padding:14px;}'
    + '}';

  var styleEl = document.createElement('style');
  styleEl.textContent = css;
  document.head.appendChild(styleEl);

  /* ---------- 4) ساخت UI ---------- */
  var btn = document.createElement('div');
  btn.id = 'snav-btn';
  btn.title = 'مسیریابی هوشمند';
  btn.textContent = 'مسیریابی هوشمند';
  document.body.appendChild(btn);

  var labels = getSelectableLabels();
  var optionsHtml = labels.map(function (l) { return '<option value="' + l + '">' + l + '</option>'; }).join('');

  var panel = document.createElement('div');
  panel.id = 'snav-panel';
  panel.innerHTML =
    '<button id="snav-close">&times;</button>' +
    '<h3><span class="dot"></span>مسیریابی هوشمند تور</h3>' +
    '<div class="snav-field"><label>مبدأ</label><select id="snav-from">' + optionsHtml + '</select></div>' +
    '<div class="snav-field"><label>مقصد</label><select id="snav-to">' + optionsHtml + '</select></div>' +
    '<button id="snav-go">شروع مسیریابی</button>' +
    '<div id="snav-err"></div>' +
    '<div id="snav-status"><div class="txt" id="snav-status-txt"></div><button id="snav-cancel">توقف</button></div>';
  document.body.appendChild(panel);

  btn.addEventListener('click', function () { panel.classList.toggle('open'); });
  panel.querySelector('#snav-close').addEventListener('click', function () { panel.classList.remove('open'); });

  /* ---------- تشخیص فول‌اسکرین: وقتی مرورگر یه المنت رو fullscreen می‌کنه،
     المنت‌های خارج از اون (مثل دکمه/پنل ما که به body وصل شدن) دیده نمی‌شن.
     پس هر بار fullscreen عوض شد، دکمه و پنل رو منتقل می‌کنیم به المنت فول‌اسکرین. */
  function relocateUI() {
    var fsEl = document.fullscreenElement || document.webkitFullscreenElement ||
      document.mozFullScreenElement || document.msFullscreenElement;
    var target = fsEl || document.body;
    if (btn.parentNode !== target) target.appendChild(btn);
    if (panel.parentNode !== target) target.appendChild(panel);
  }
  ['fullscreenchange', 'webkitfullscreenchange', 'mozfullscreenchange', 'MSFullscreenChange'].forEach(function (evt) {
    document.addEventListener(evt, relocateUI);
  });

  /* ---------- 5) جابجایی با فرمت رسمی 3DVista ---------- */
  function goToScene(label, yaw, pitch, fov) {
    var hash = 'media-name=' + encodeURIComponent(label);
    if (typeof yaw === 'number') hash += '&yaw=' + yaw;
    // pitch رو همیشه ست می‌کنیم (پیش‌فرض ۰ = افقی) تا اگه کاربر قبلش سمت سقف/زمین نگاه می‌کرده، صحنه صاف بشه
    // نکته مهم: خود موتور تور با "parseFloat(pitch)||undefined" پردازش می‌کنه،
    // یعنی اگه pitch دقیقاً 0 باشه (falsy تو جاوااسکریپت) نادیده گرفته می‌شه.
    // برای همین به‌جای 0 خالص از یه مقدار خیلی کوچیک غیرصفر استفاده می‌کنیم.
    hash += '&pitch=' + (typeof pitch === 'number' && pitch !== 0 ? pitch : 0.1);
    if (typeof fov === 'number') hash += '&fov=' + fov;
    console.log('[SmartNav] hash ->', hash);
    window.location.hash = hash;
  }

  /* ---------- 6) اجرای مسیر گام‌به‌گام ---------- */
  var STEP_DELAY_MS = 3000;   // فاصله کلی بین رسیدن به یک صحنه و شروع قدم بعدی
  var ROTATE_WAIT_MS = 2000;  // چقدر صبر کنه تا چرخش دوربین سمت هات‌اسپات کامل بشه، قبل از پرش به صحنه بعد
  var navTimer = null, cancelled = false;

  var goBtn = panel.querySelector('#snav-go');
  var statusBox = panel.querySelector('#snav-status');
  var statusTxt = panel.querySelector('#snav-status-txt');
  var errBox = panel.querySelector('#snav-err');
  var cancelBtn = panel.querySelector('#snav-cancel');

  function runPath(result, toLabel) {
    cancelled = false;
    var steps = result.steps;
    var idx = 0;
    goBtn.disabled = true;
    errBox.style.display = 'none';
    statusBox.classList.add('show');

    function step() {
      if (cancelled) { finish(); return; }
      var s = steps[idx];

      // فاز ۱: تو همون صحنه‌ی فعلی (s.from) دوربین بچرخه سمت هات‌اسپاتی که به s.to می‌ره
      statusTxt.innerHTML = 'در حال چرخش به سمت هات‌اسپات… گام <b>' + (idx + 1) + '</b> از <b>' + steps.length + '</b>';
      navTimer = setTimeout(function () {
        if (typeof s.yaw === 'number') {
          goToScene(s.from, s.yaw, s.pitch, s.fov); // همون صحنه، فقط زاویه دوربین عوض می‌شه
        }

        // فاز ۲: بعد از چرخش، برو به صحنه بعدی
        navTimer = setTimeout(function () {
          statusTxt.innerHTML = 'در حال حرکت… گام <b>' + (idx + 1) + '</b> از <b>' + steps.length + '</b> (' + s.to + ')';
          goToScene(s.to);
          idx++;
          if (idx < steps.length) {
            navTimer = setTimeout(step, STEP_DELAY_MS);
          } else {
            statusTxt.innerHTML = 'رسیدید به مقصد: <b>' + toLabel + '</b> ✓';
            setTimeout(finish, 1400);
          }
        }, typeof s.yaw === 'number' ? ROTATE_WAIT_MS : 0);
      }, 200);
    }

    if (steps.length === 0) { finish(); return; }
    // برو به نقطه مبدا اول (بدون yaw خاص) بعد شروع کن
    goToScene(steps[0].from);
    setTimeout(step, 600);
  }

  function finish() {
    goBtn.disabled = false;
    clearTimeout(navTimer);
    setTimeout(function () { statusBox.classList.remove('show'); }, 800);
  }

  cancelBtn.addEventListener('click', function () {
    cancelled = true;
    clearTimeout(navTimer);
    statusTxt.textContent = 'مسیریابی متوقف شد.';
    setTimeout(finish, 900);
  });

  goBtn.addEventListener('click', function () {
    var fromLabel = panel.querySelector('#snav-from').value;
    var toLabel = panel.querySelector('#snav-to').value;
    errBox.style.display = 'none';

    if (!fromLabel || !toLabel) { showError('لطفاً مبدأ و مقصد را انتخاب کنید.'); return; }
    if (fromLabel === toLabel) { showError('مبدأ و مقصد نمی‌توانند یکسان باشند.'); return; }

    var result = dijkstra(fromLabel, toLabel);
    console.log('[SmartNav] path:', result);
    if (!result) { showError('مسیری بین این دو نقطه در گراف فعلی پیدا نشد.'); return; }

    runPath(result, toLabel);
  });

  function showError(msg) {
    errBox.textContent = msg;
    errBox.style.display = 'block';
  }

  window.SmartNav = { graph: GRAPH, dijkstra: dijkstra };
  console.log('[SmartNav] loaded. Scenes:', labels.length, labels);
})();
