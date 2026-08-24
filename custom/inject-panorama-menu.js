/* =========================================================
   منوی پانوراما — دراور کناری، ظاهر شیشه‌ای روشن (الهام از داشبورد)
   =========================================================
   کجا بذاری: 3DVista Studio > Skin/Main Viewer > On Initialization
   کل این فایل رو داخل اکشن Execute Javascript بچسبون.

   این فایل توسط «پنل مدیریت پانوراما» تولید شده. برای تغییر
   لیست طبقات/پانوراماها دوباره از همون پنل استفاده کن و این
   فایل رو با نسخه‌ی جدید جایگزین کن؛ دستی داخل این فایل تغییر نده.

   توجه: جستجو عمداً از این ویجت حذف شده — قراره جدا و به‌صورت
   یک کادر کوچک بالای صفحه ساخته بشه (مرحله‌ی بعدی).
   ========================================================= */

(function () {

  /* ---------- تابع رفتن به پانوراما (روش تأییدشده: URL Hash) ---------- */
  function goToPano(panoName) {
    window.location.hash = "media=" + encodeURIComponent(panoName);
  }

  /* ---------- لیست طبقات و پانوراماها (تولیدشده توسط پنل مدیریت) ---------- */
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

  const CSS = `
  #glassPanoWrap, #glassPanoWrap *{ box-sizing:border-box; font-family:'Vazirmatn', sans-serif; -webkit-tap-highlight-color:transparent; }
  #glassPanoWrap{
    --ink:#000000; --ink-dim:rgba(0,0,0,0.7); --gold:#171717; --gold-bright:#4a4a4a; --gold-rgb:23,23,23; --mint:#b7afa2; --mint-rgb:183,175,162;
    --glass-fill: rgba(201,201,201,0.75); --glass-fill-2: rgba(201,201,201,0.83);
    --glass-border: rgba(0,0,0,0.16); --glass-border-strong: rgba(23,23,23,0.4);
    --radius-lg:16px; --radius-sm:11px; --blur:13px; --text-scale:1.2;
    --panel-w: clamp(272px, 86vw, 356px);
    --edge-gap: clamp(12px, 3vw, 22px);
    position:fixed; top:0; right:0; height:100%; z-index:9999; direction:rtl; pointer-events:none;
  }

  /* ===== دستگیره‌ی کناری ===== */
  #glassPanoTab{
    position:fixed; top:50%; right:0; transform:translateY(-50%);
    width:clamp(38px, 9vw, 46px); height:clamp(92px, 20vw, 112px);
    border-radius:var(--radius-lg) 0 0 var(--radius-lg);
    background:linear-gradient(160deg, var(--glass-fill) 0%, var(--glass-fill-2) 100%);
    backdrop-filter:blur(var(--blur)) saturate(140%); -webkit-backdrop-filter:blur(var(--blur)) saturate(140%);
    border:1px solid var(--glass-border); border-right:none;
    box-shadow:-10px 0 34px rgba(20,20,20,0.14), inset 0 1px 0 rgba(255,255,255,0.55);
    display:flex; flex-direction:column; align-items:center; justify-content:center; gap:8px;
    color:var(--ink); cursor:pointer; pointer-events:auto; user-select:none;
    transition:transform .42s cubic-bezier(.65,0,.35,1), right .42s cubic-bezier(.65,0,.35,1);
    z-index:10000;
  }
  #glassPanoTab .tab-dot{
    width:7px; height:7px; border-radius:50%; background:var(--gold); flex-shrink:0;
    box-shadow:0 0 0 0 rgba(var(--gold-rgb,26,26,26),0.5);
    animation:tabPulse 2.6s cubic-bezier(.4,0,.3,1) infinite;
  }
  @keyframes tabPulse{
    0%{ box-shadow:0 0 0 0 rgba(var(--gold-rgb,26,26,26),0.45); }
    65%{ box-shadow:0 0 0 9px rgba(var(--gold-rgb,26,26,26),0); }
    100%{ box-shadow:0 0 0 0 rgba(var(--gold-rgb,26,26,26),0); }
  }
  #glassPanoTab svg{ width:17px; height:17px; transition:transform .42s cubic-bezier(.65,0,.35,1); flex-shrink:0; }
  #glassPanoTab .tab-icon-wrap{ animation:tabNudge 3.4s ease-in-out infinite; }
  @keyframes tabNudge{
    0%, 100%{ transform:translateX(0); }
    50%{ transform:translateX(-3px); }
  }
  #glassPanoWrap.open #glassPanoTab{ right:var(--panel-w); }
  #glassPanoWrap.open #glassPanoTab svg{ transform:rotate(180deg); }
  #glassPanoWrap.open #glassPanoTab .tab-icon-wrap{ animation:none; }

  /* ===== پنل اصلی ===== */
  #glassPanoMenu{
    position:absolute; top:calc(var(--edge-gap) + 66px); right:var(--edge-gap);
    height:calc(100% - (var(--edge-gap) * 2) - 66px); width:var(--panel-w);
    max-width:calc(100vw - (var(--edge-gap) * 2));
    background:linear-gradient(165deg, var(--glass-fill) 0%, var(--glass-fill-2) 100%);
    backdrop-filter:blur(var(--blur)) saturate(140%); -webkit-backdrop-filter:blur(var(--blur)) saturate(140%);
    border:1px solid var(--glass-border); border-radius:var(--radius-lg);
    box-shadow:0 30px 70px rgba(20,20,20,0.16), inset 0 1px 0 rgba(255,255,255,0.55);
    display:flex; flex-direction:column; overflow:hidden; color:var(--ink);
    transform:translateX(120%) scale(0.96); opacity:0;
    transition:transform .42s cubic-bezier(.32,.72,0,1), opacity .32s ease;
    pointer-events:none;
  }
  #glassPanoWrap.open #glassPanoMenu{ transform:translateX(0) scale(1); opacity:1; pointer-events:auto; }

  #glassPanoMenu .d-head{ display:flex; align-items:center; gap:12px; padding:clamp(18px,4.6vw,24px) clamp(17px,4.4vw,21px) 15px; border-bottom:1px solid var(--glass-border); flex-shrink:0; }
  #glassPanoMenu .d-head.logo-banner{ flex-direction:column; align-items:center; gap:10px; text-align:center; }
  #glassPanoMenu .d-logo{ width:36px; height:36px; border-radius:calc(var(--radius-sm) * 0.65); object-fit:cover; flex-shrink:0; border:1px solid var(--glass-border-strong); }
  #glassPanoMenu .d-head.logo-banner .d-logo{ width:auto; height:clamp(64px,20vw,104px); max-width:88%; border-radius:0; object-fit:contain; background:none; border:none; padding:0; }
  #glassPanoMenu .d-title{ display:flex; flex-direction:column; gap:5px; min-width:0; }
  #glassPanoMenu .d-title .eyebrow{ font-size:calc(var(--text-scale) * 10.5px); letter-spacing:.2em; color:var(--ink-dim); font-family:'JetBrains Mono', monospace; text-transform:uppercase; }
  #glassPanoMenu .d-title .name{ font-size:calc(var(--text-scale) * clamp(18px,4.8vw,21px)); font-weight:300; letter-spacing:.01em; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }

  #glassPanoMenu .d-body{ flex:1; overflow-y:auto; -webkit-overflow-scrolling:touch; padding:14px 12px 20px; overscroll-behavior:contain; }

  #glassPanoMenu .floor-group{
    margin-bottom:11px; border-radius:var(--radius-sm); overflow:hidden;
    background:rgba(255,255,255,0.32); border:1px solid var(--glass-border);
    box-shadow:0 1px 0 rgba(255,255,255,0.5) inset;
    transition:border-color .22s, background .22s, box-shadow .22s;
  }
  #glassPanoMenu .floor-group.open{ background:rgba(255,255,255,0.5); border-color:var(--glass-border-strong); box-shadow:0 10px 26px rgba(20,20,20,0.08), 0 1px 0 rgba(255,255,255,0.6) inset; }
  #glassPanoMenu .floor-header{ display:flex; align-items:center; gap:12px; padding:13px; cursor:pointer; user-select:none; min-height:50px; touch-action:manipulation; }
  #glassPanoMenu .floor-badge{
    width:38px; height:38px; border-radius:11px; display:flex; align-items:center; justify-content:center;
    font-family:'JetBrains Mono', monospace; font-size:calc(var(--text-scale) * 14px); font-weight:700; flex-shrink:0;
    background:var(--ink); color:#fff; box-shadow:0 6px 16px rgba(20,20,20,0.22);
  }
  #glassPanoMenu .floor-header .texts{ flex:1; min-width:0; }
  #glassPanoMenu .floor-header .label{ font-size:calc(var(--text-scale) * clamp(14px,3.8vw,15.5px)); font-weight:700; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
  #glassPanoMenu .floor-header .sub{ font-size:calc(var(--text-scale) * 11px); color:var(--ink-dim); font-family:'JetBrains Mono', monospace; margin-top:2px; }
  #glassPanoMenu .chev{ color:var(--ink-dim); transition:transform .3s cubic-bezier(.65,0,.35,1); flex-shrink:0; width:16px; height:16px; }
  #glassPanoMenu .floor-group.open .chev{ transform:rotate(-180deg); color:var(--ink); }

  #glassPanoMenu .pano-list{ display:grid; gap:6px; max-height:0; overflow:hidden; transition:max-height .38s cubic-bezier(.65,0,.35,1); padding:0 9px; }
  #glassPanoMenu .floor-group.open .pano-list{ max-height:2000px; padding-bottom:11px; padding-top:2px; }

  @keyframes itemIn{ from{ opacity:0; transform:translateY(7px); } to{ opacity:1; transform:translateY(0); } }
  #glassPanoMenu .floor-group.open .pano-item{ animation:itemIn .38s cubic-bezier(.22,.9,.32,1) both; }
  #glassPanoMenu .floor-group.open .pano-item:nth-child(1){ animation-delay:.02s; }
  #glassPanoMenu .floor-group.open .pano-item:nth-child(2){ animation-delay:.06s; }
  #glassPanoMenu .floor-group.open .pano-item:nth-child(3){ animation-delay:.10s; }
  #glassPanoMenu .floor-group.open .pano-item:nth-child(4){ animation-delay:.14s; }
  #glassPanoMenu .floor-group.open .pano-item:nth-child(5){ animation-delay:.18s; }
  #glassPanoMenu .floor-group.open .pano-item:nth-child(n+6){ animation-delay:.20s; }

  #glassPanoMenu .pano-item{
    display:flex; align-items:center; gap:12px; padding:9px; border-radius:12px; cursor:pointer;
    border:1px solid transparent; background:rgba(255,255,255,0.28);
    transition:background .18s, border-color .18s, transform .18s; min-height:60px; touch-action:manipulation;
  }
  #glassPanoMenu .pano-item:active{ transform:scale(0.98); }
  #glassPanoMenu .pano-item:hover{ background:rgba(255,255,255,0.5); }
  #glassPanoMenu .pano-item.active{ background:rgba(255,255,255,0.62); border-color:var(--glass-border-strong); }
  #glassPanoMenu .pano-thumb{
    width:64px; height:48px; border-radius:10px; flex-shrink:0; position:relative;
    background:linear-gradient(135deg, rgba(var(--mint-rgb),0.4), rgba(30,30,30,0.12));
    background-size:cover; background-position:center; border:1px solid rgba(255,255,255,0.6);
    box-shadow:0 4px 12px rgba(20,20,20,0.1);
  }
  #glassPanoMenu .pano-item.active .pano-thumb{ box-shadow:0 0 0 2px var(--gold), 0 6px 16px rgba(var(--gold-rgb,26,26,26),0.3); }
  @keyframes checkPop{ 0%{ transform:scale(0); } 65%{ transform:scale(1.15); } 100%{ transform:scale(1); } }
  #glassPanoMenu .check-dot{
    position:absolute; bottom:-5px; left:-5px; width:19px; height:19px; border-radius:50%;
    background:var(--gold); display:none; align-items:center; justify-content:center;
    box-shadow:0 3px 8px rgba(0,0,0,0.28); animation:checkPop .32s cubic-bezier(.3,1.4,.5,1) both;
  }
  #glassPanoMenu .pano-item.active .check-dot{ display:flex; }
  #glassPanoMenu .check-dot svg{ width:11px; height:11px; color:#fff; }
  #glassPanoMenu .pano-meta{ min-width:0; flex:1; }
  #glassPanoMenu .pano-meta .pname{ font-size:calc(var(--text-scale) * clamp(13px,3.6vw,14.5px)); font-weight:600; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
  #glassPanoMenu .pano-meta .pcode{ font-family:'JetBrains Mono', monospace; font-size:calc(var(--text-scale) * 10.5px); color:var(--gold); letter-spacing:.03em; margin-top:3px; }

  #glassPanoMenu .d-body::-webkit-scrollbar{ width:5px; }
  #glassPanoMenu .d-body::-webkit-scrollbar-thumb{ background:var(--glass-border-strong); border-radius:3px; }

  @media (max-height:420px){
    #glassPanoTab{ height:70px; }
    #glassPanoMenu .d-head{ padding-top:12px; padding-bottom:9px; }
    #glassPanoMenu .floor-header{ padding:9px 12px; min-height:40px; }
    #glassPanoMenu .pano-item{ min-height:44px; padding:7px; }
  }
  @media (max-width:359px){
    #glassPanoWrap{ --panel-w: 92vw; --edge-gap: 9px; }
  }
  @media (pointer:coarse){
    #glassPanoTab{ width:clamp(42px, 10vw, 50px); }
  }
  `;

  function esc(s){
    return String(s == null ? '' : s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  }

  function buildHTML() {
    const totalPanos = FLOORS.reduce((n, f) => n + f.panos.length, 0);

    let floorsHTML = FLOORS.map((floor, i) => `
      <div class="floor-group ${i === 0 ? 'open' : ''}" data-floor="${esc(floor.key)}">
        <div class="floor-header">
          <div class="floor-badge">${esc(floor.badge)}</div>
          <div class="texts">
            <div class="label">${esc(floor.label)}</div>
            <div class="sub">${floor.panos.length} ایستگاه</div>
          </div>
          <svg class="chev" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9l6 6 6-6"/></svg>
        </div>
        <div class="pano-list">
          ${floor.panos.map((p, j) => `
            <div class="pano-item ${i === 0 && j === 0 ? 'active' : ''}" data-pano="${esc(p.name)}">
              <div class="pano-thumb"${p.thumb ? ` style="background-image:url('${esc(p.thumb)}')"` : ''}>
                <span class="check-dot"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6L9 17l-5-5"/></svg></span>
              </div>
              <div class="pano-meta">
                <div class="pname">${esc(p.label)}</div>
                <div class="pcode">${esc(p.code)}</div>
              </div>
            </div>`).join('')}
        </div>
      </div>`).join('');

    return `
      <button id="glassPanoTab" title="باز و بسته کردن منو">
        <span class="tab-dot"></span>
        <span class="tab-icon-wrap">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 6l-6 6 6 6"/></svg>
        </span>
      </button>
      <div id="glassPanoMenu">
        <div class="d-head logo-banner">
          <img class="d-logo" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAALwAAACTCAYAAAA0s3NIAAAACXBIWXMAAAsTAAALEwEAmpwYAAAG2mlUWHRYTUw6Y29tLmFkb2JlLnhtcAAAAAAAPD94cGFja2V0IGJlZ2luPSLvu78iIGlkPSJXNU0wTXBDZWhpSHpyZVN6TlRjemtjOWQiPz4gPHg6eG1wbWV0YSB4bWxuczp4PSJhZG9iZTpuczptZXRhLyIgeDp4bXB0az0iQWRvYmUgWE1QIENvcmUgNS42LWMxNDUgNzkuMTYzNDk5LCAyMDE4LzA4LzEzLTE2OjQwOjIyICAgICAgICAiPiA8cmRmOlJERiB4bWxuczpyZGY9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkvMDIvMjItcmRmLXN5bnRheC1ucyMiPiA8cmRmOkRlc2NyaXB0aW9uIHJkZjphYm91dD0iIiB4bWxuczp4bXA9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC8iIHhtbG5zOmRjPSJodHRwOi8vcHVybC5vcmcvZGMvZWxlbWVudHMvMS4xLyIgeG1sbnM6cGhvdG9zaG9wPSJodHRwOi8vbnMuYWRvYmUuY29tL3Bob3Rvc2hvcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RFdnQ9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZUV2ZW50IyIgeG1wOkNyZWF0b3JUb29sPSJBZG9iZSBQaG90b3Nob3AgQ0MgMjAxOSAoV2luZG93cykiIHhtcDpDcmVhdGVEYXRlPSIyMDI2LTA4LTE0VDAxOjM3OjA1KzAzOjMwIiB4bXA6TW9kaWZ5RGF0ZT0iMjAyNi0wOC0yNVQwMDoxMDo1NiswMzozMCIgeG1wOk1ldGFkYXRhRGF0ZT0iMjAyNi0wOC0yNVQwMDoxMDo1NiswMzozMCIgZGM6Zm9ybWF0PSJpbWFnZS9wbmciIHBob3Rvc2hvcDpDb2xvck1vZGU9IjMiIHBob3Rvc2hvcDpJQ0NQcm9maWxlPSJzUkdCIElFQzYxOTY2LTIuMSIgeG1wTU06SW5zdGFuY2VJRD0ieG1wLmlpZDo1ZjM0MjVmNC01MGI1LTdlNGUtODM1Ny0zMDZkMTFiNGI2NTMiIHhtcE1NOkRvY3VtZW50SUQ9ImFkb2JlOmRvY2lkOnBob3Rvc2hvcDoyYjg4OGNhNy0zNDRlLWYxNDktYTJkMi1hMGQ5OTA0MWI0OTgiIHhtcE1NOk9yaWdpbmFsRG9jdW1lbnRJRD0ieG1wLmRpZDpjZGRkYWZkYy05ZTEwLTMwNDQtOWJhNS04ODFkMmQ1ZjU0NTIiPiA8cGhvdG9zaG9wOlRleHRMYXllcnM+IDxyZGY6QmFnPiA8cmRmOmxpIHBob3Rvc2hvcDpMYXllck5hbWU9Itio24zZhdin2LPYqtin2YYg2K3Yttix2Kog2LHYs9mI2YQo2LUpICDZgdix2K/ZiNizIiBwaG90b3Nob3A6TGF5ZXJUZXh0PSLYqNuM2YXYp9iz2KrYp9mGINit2LbYsdiqINix2LPZiNmEKNi1KSAg2YHYsdiv2YjYsyIvPiA8L3JkZjpCYWc+IDwvcGhvdG9zaG9wOlRleHRMYXllcnM+IDx4bXBNTTpIaXN0b3J5PiA8cmRmOlNlcT4gPHJkZjpsaSBzdEV2dDphY3Rpb249ImNyZWF0ZWQiIHN0RXZ0Omluc3RhbmNlSUQ9InhtcC5paWQ6Y2RkZGFmZGMtOWUxMC0zMDQ0LTliYTUtODgxZDJkNWY1NDUyIiBzdEV2dDp3aGVuPSIyMDI2LTA4LTE0VDAxOjM3OjA1KzAzOjMwIiBzdEV2dDpzb2Z0d2FyZUFnZW50PSJBZG9iZSBQaG90b3Nob3AgQ0MgMjAxOSAoV2luZG93cykiLz4gPHJkZjpsaSBzdEV2dDphY3Rpb249InNhdmVkIiBzdEV2dDppbnN0YW5jZUlEPSJ4bXAuaWlkOjVmMzQyNWY0LTUwYjUtN2U0ZS04MzU3LTMwNmQxMWI0YjY1MyIgc3RFdnQ6d2hlbj0iMjAyNi0wOC0yNVQwMDoxMDo1NiswMzozMCIgc3RFdnQ6c29mdHdhcmVBZ2VudD0iQWRvYmUgUGhvdG9zaG9wIENDIDIwMTkgKFdpbmRvd3MpIiBzdEV2dDpjaGFuZ2VkPSIvIi8+IDwvcmRmOlNlcT4gPC94bXBNTTpIaXN0b3J5PiA8L3JkZjpEZXNjcmlwdGlvbj4gPC9yZGY6UkRGPiA8L3g6eG1wbWV0YT4gPD94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" alt="لوگو">
          <div class="d-title">
            <span class="eyebrow">تور مجازی بیمارستان حضرت رسول(ص)</span>
            <span class="name">دسترسی سریع به طبقات</span>
          </div>
        </div>
        <div class="d-body">${floorsHTML}</div>
      </div>
    `;
  }

  function init() {
    if (document.getElementById('glassPanoWrap')) return;

    if (!document.getElementById('glassPanoFonts')) {
      const fontLink = document.createElement('link');
      fontLink.id = 'glassPanoFonts';
      fontLink.rel = 'stylesheet';
      fontLink.href = 'https://fonts.googleapis.com/css2?family=Vazirmatn:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600&display=swap';
      document.head.appendChild(fontLink);
    }

    const style = document.createElement('style');
    style.textContent = CSS;
    document.head.appendChild(style);

    const wrap = document.createElement('div');
    wrap.id = 'glassPanoWrap';
    wrap.innerHTML = buildHTML();
    document.body.appendChild(wrap);

    document.getElementById('glassPanoTab').addEventListener('click', () => {
      wrap.classList.toggle('open');
    });

    wrap.querySelectorAll('.floor-header').forEach(header => {
      header.addEventListener('click', () => {
        const group = header.parentElement;
        const wasOpen = group.classList.contains('open');
        wrap.querySelectorAll('.floor-group').forEach(g => g.classList.remove('open'));
        if (!wasOpen) group.classList.add('open');
      });
    });

    wrap.querySelectorAll('.pano-item').forEach(item => {
      item.addEventListener('click', (e) => {
        e.stopPropagation();
        wrap.querySelectorAll('.pano-item').forEach(i => i.classList.remove('active'));
        item.classList.add('active');
        goToPano(item.getAttribute('data-pano'));
      });
    });

    /* ---------- سازگاری با حالت تمام‌صفحه (Fullscreen) ----------
       وقتی مرورگر وارد حالت فول‌اسکرین می‌شه، فقط عنصری که فول‌اسکرین
       شده (و فرزندهاش) دیده می‌شن؛ هر چیزی بیرون از اون (مثل این پنل که
       به body چسبیده) مخفی می‌شه. برای رفع این مشکل، با هر تغییر حالت
       فول‌اسکرین، پنل رو به داخل عنصر فول‌اسکرین (یا برگردوندن به body) منتقل می‌کنیم. */
    function getFsElement() {
      return document.fullscreenElement || document.webkitFullscreenElement ||
             document.mozFullScreenElement || document.msFullscreenElement || null;
    }
    function relocateWrap() {
      const target = getFsElement() || document.body;
      if (wrap.parentElement !== target) target.appendChild(wrap);
    }
    ['fullscreenchange', 'webkitfullscreenchange', 'mozfullscreenchange', 'MSFullscreenChange']
      .forEach(evt => document.addEventListener(evt, relocateWrap));
    relocateWrap();
  }

  init();

})();
