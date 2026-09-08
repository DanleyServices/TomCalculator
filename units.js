/*
 * Unit system for the Tom Danley Calculator.
 *
 * The calculators keep working in their own native units (the book's cgs and SI);
 * this is a display layer. Every length-bearing control is tagged with
 * data-unit="<native unit>" and this script rewrites the label and the readout
 * into the system the user picked. Feet is the default.
 *
 * The page's own code rewrites those readouts on every slider move, so each one
 * is re-rendered from the input's value (which is always native) and a
 * MutationObserver puts the conversion back if the page overwrites it.
 */
(function () {
  'use strict';

  var STORE = 'tdcUnitSystem';
  var DEFAULT = 'imperial';

  // native unit -> { imperial symbol, factor, decimals }
  var MAP = {
    mm:  { to: 'in',   f: 1 / 25.4,      d: 3 },
    cm:  { to: 'in',   f: 1 / 2.54,      d: 2 },
    m:   { to: 'ft',   f: 3.280839895,   d: 2 },
    km:  { to: 'mi',   f: 0.621371,      d: 3 },
    'cm2': { to: 'in2', f: 1 / 6.4516,   d: 2 },
    'm2':  { to: 'ft2', f: 10.7639104,   d: 2 },
    'cm3': { to: 'in3', f: 1 / 16.387064, d: 2 },
    'm3':  { to: 'ft3', f: 35.3146667,   d: 1 },
    L:   { to: 'ft3',  f: 0.0353146667, d: 3 },
    'm/s': { to: 'ft/s', f: 3.280839895, d: 1 },
    'cm/s': { to: 'in/s', f: 1 / 2.54,   d: 1 }
  };

  // how a unit is written in a label, e.g. [cm] or (m3)
  var PRETTY = {
    in: 'in', ft: 'ft', mi: 'mi', in2: 'in&sup2;', ft2: 'ft&sup2;',
    in3: 'in&sup3;', ft3: 'ft&sup3;', 'ft/s': 'ft/s', 'in/s': 'in/s'
  };
  var NATIVE_PRETTY = {
    mm: 'mm', cm: 'cm', m: 'm', km: 'km', cm2: 'cm&sup2;', m2: 'm&sup2;',
    cm3: 'cm&sup3;', m3: 'm&sup3;', L: 'L', 'm/s': 'm/s', 'cm/s': 'cm/s'
  };

  var system = DEFAULT;
  try { system = localStorage.getItem(STORE) || DEFAULT; } catch (e) { /* private mode */ }

  function isImperial() { return system === 'imperial'; }

  function convert(value, native) {
    var m = MAP[native];
    if (!m || !isImperial()) return { v: value, u: NATIVE_PRETTY[native] || native, d: null };
    return { v: value * m.f, u: PRETTY[m.to] || m.to, d: m.d };
  }

  // ---- readouts -------------------------------------------------------------
  var writing = false;

  var GROUPS = '.control-group, .input-control, .input-group';

  function groupOf(input) {
    return (input.closest && input.closest(GROUPS)) || input.parentElement;
  }

  // three layouts are in use across the app:
  //   .control-group  -> <div class="control-value"><span>12</span> cm</div>
  //   .input-control  -> <label>.. <span class="val">6.0 m</span></label> + <span class="lbl-unit">m</span>
  //   .input-group    -> <label>.. <span id="lblX">17.0 cm</span></label> + <span class="unit">cm</span>
  function readoutFor(input) {
    var group = groupOf(input);
    if (!group) return null;
    return group.querySelector('.control-value') ||
           group.querySelector('label span.val') ||
           group.querySelector('label span[id]');
  }

  function chipFor(input) {
    var group = groupOf(input);
    if (!group) return null;
    return group.querySelector('.lbl-unit, .unit');
  }

  function renderReadout(input) {
    var out = readoutFor(input);
    if (!out) return;
    var native = input.getAttribute('data-unit');
    if (!native) return;
    var raw = parseFloat(input.value);
    if (!isFinite(raw)) return;
    var c = convert(raw, native);
    var decimals = c.d !== null ? c.d : (input.step && input.step.indexOf('.') >= 0 ? input.step.split('.')[1].length : 0);
    var text = c.v.toFixed(decimals);
    var wanted = text + ' ' + c.u;
    if (out.textContent.trim() === wanted.replace(/&sup2;/g,'²').replace(/&sup3;/g,'³')) return;

    writing = true;
    if (out.classList.contains('control-value')) {
      var inner = out.querySelector('span');
      out.innerHTML = (inner ? '<span id="' + (inner.id || '') + '">' + text + '</span>' : text) + ' ' + c.u;
    } else {
      out.innerHTML = wanted;                       // "19.69 ft" straight into the label readout
    }
    var chip = chipFor(input);
    if (chip) chip.innerHTML = c.u;                 // the unit shown beside the entry boxes
    writing = false;
  }

  function renderAll() {
    document.querySelectorAll('input[data-unit]').forEach(function (input) {
      renderLabel(input);
      renderReadout(input);
    });
  }

  // ---- labels ---------------------------------------------------------------
  function renderLabel(input) {
    var group = groupOf(input);
    if (!group) return;
    var label = group.querySelector('label');
    if (!label) return;
    if (!label.hasAttribute('data-u-original')) label.setAttribute('data-u-original', label.innerHTML);
    var original = label.getAttribute('data-u-original');
    var native = input.getAttribute('data-unit');
    var m = MAP[native];
    if (!m) return;
    if (!isImperial()) { label.innerHTML = original; return; }
    var nativeText = NATIVE_PRETTY[native] || native;
    var target = PRETTY[m.to] || m.to;
    var alts = [nativeText];
    if (native === 'L') alts = ['L', 'litres', 'liters', 'litre', 'liter'];
    var outHtml = original;
    alts.forEach(function (a) {
      outHtml = outHtml.replace('[' + a + ']', '[' + target + ']').replace('(' + a + ')', '(' + target + ')');
    });
    label.innerHTML = outHtml;
  }

  // ---- the control ----------------------------------------------------------
  function buildToggle() {
    if (document.getElementById('unitToggle')) return;
    var wrap = document.createElement('div');
    wrap.id = 'unitToggle';
    wrap.setAttribute('role', 'button');
    wrap.setAttribute('tabindex', '0');
    wrap.title = 'Switch between feet and meters';
    wrap.innerHTML =
      '<svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">' +
      '<circle cx="12" cy="12" r="3"></circle>' +
      '<path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"></path>' +
      '</svg><span id="unitToggleLabel"></span>';

    var css = document.createElement('style');
    css.textContent =
      '#unitToggle{position:fixed;top:14px;left:18px;z-index:400;display:flex;align-items:center;gap:7px;' +
      'padding:6px 11px;font-family:Orbitron,Rajdhani,monospace;font-size:0.72rem;font-weight:700;letter-spacing:1.5px;' +
      'color:#00e5ff;background:rgba(6,14,24,0.85);border:1px solid rgba(0,229,255,0.35);border-radius:8px;' +
      'cursor:pointer;user-select:none;backdrop-filter:blur(4px);box-shadow:0 4px 18px rgba(0,0,0,0.55);' +
      'transition:background .15s,color .15s}' +
      '#unitToggle:hover{background:rgba(0,229,255,0.18);color:#fff}' +
      '#unitToggle svg{flex:0 0 auto}' +
      '@media (max-width:700px){#unitToggle{top:8px;left:8px;padding:4px 8px;font-size:0.62rem}}';

    document.head.appendChild(css);
    document.body.appendChild(wrap);

    wrap.addEventListener('click', toggle);
    wrap.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggle(); } });
    paintToggle();
  }

  function paintToggle() {
    var el = document.getElementById('unitToggleLabel');
    if (el) el.textContent = isImperial() ? 'FEET' : 'METERS';
  }

  function toggle() {
    system = isImperial() ? 'metric' : 'imperial';
    try { localStorage.setItem(STORE, system); } catch (e) { /* ignore */ }
    paintToggle();
    renderAll();
    document.dispatchEvent(new CustomEvent('unitsystemchange', { detail: { system: system } }));
  }

  // ---- keep our rendering on top of the page's own updates -------------------
  function watch() {
    var obs = new MutationObserver(function (records) {
      if (writing) return;
      var seen = new Set();
      records.forEach(function (r) {
        var group = r.target.closest ? r.target.closest(GROUPS) : (r.target.parentElement && r.target.parentElement.closest ? r.target.parentElement.closest(GROUPS) : null);
        if (!group) return;
        var input = group.querySelector('input[data-unit]');
        if (input && !seen.has(input)) { seen.add(input); renderReadout(input); }
      });
    });
    document.querySelectorAll(GROUPS).forEach(function (g) {
      obs.observe(g, { childList: true, characterData: true, subtree: true });
    });
    document.querySelectorAll('input[data-unit]').forEach(function (i) {
      i.addEventListener('input', function () { setTimeout(function () { renderReadout(i); }, 0); });
    });
  }

  function start() {
    buildToggle();
    renderAll();
    watch();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start);
  else start();

  window.TDCUnits = {
    system: function () { return system; },
    isImperial: isImperial,
    convert: convert,
    refresh: renderAll
  };
})();

/*
 * True imperial entry.
 *
 * The boxes and sliders show the value in the chosen system, but the page's own
 * code must keep receiving the native value it was written for. So on every
 * tagged input the `value` and `valueAsNumber` properties are redefined: what
 * the user sees and drags is imperial, what the page reads is always native.
 */
(function () {
  'use strict';
  if (!window.TDCUnits) return;

  var FACTOR = { mm: 1 / 25.4, cm: 1 / 2.54, m: 3.280839895, km: 0.621371,
    cm2: 1 / 6.4516, m2: 10.7639104, cm3: 1 / 16.387064, m3: 35.3146667,
    L: 0.0353146667, 'm/s': 3.280839895, 'cm/s': 1 / 2.54 };

  var patched = [];

  function nativeUnitOf(el) {
    return el.getAttribute('data-unit') || el.getAttribute('data-unit-native');
  }

  function patch(el) {
    var unit = nativeUnitOf(el);
    var f = FACTOR[unit];
    if (!f || el.__tdcPatched) return;
    var proto = Object.getPrototypeOf(el);
    var desc = Object.getOwnPropertyDescriptor(proto, 'value');
    var numDesc = Object.getOwnPropertyDescriptor(proto, 'valueAsNumber');
    el.__tdcPatched = true;
    el.__tdcFactor = f;
    el.__tdcRaw = desc;

    Object.defineProperty(el, 'value', {
      configurable: true,
      get: function () {
        var shown = parseFloat(desc.get.call(el));
        if (!isFinite(shown)) return desc.get.call(el);
        return String(TDCUnits.isImperial() ? shown / f : shown);
      },
      set: function (v) {
        var n = parseFloat(v);
        if (!isFinite(n)) { desc.set.call(el, v); return; }
        desc.set.call(el, String(TDCUnits.isImperial() ? n * f : n));
      }
    });
    if (numDesc && numDesc.get) {
      Object.defineProperty(el, 'valueAsNumber', {
        configurable: true,
        get: function () { return parseFloat(el.value); }
      });
    }
    patched.push(el);
  }

  // rescale what is displayed (bounds and current position) when the system changes
  function rescale(el, toImperial) {
    var f = el.__tdcFactor;
    var desc = el.__tdcRaw;
    // read the value first: changing min/max clamps it, and a clamped value
    // would then be converted, drifting the number the page computes with
    var shownBefore = parseFloat(desc.get.call(el));
    // bounds scale with the unit; the step does not - an imperial step grid would
    // snap the value off the native grid and quietly change the calculation
    ['min', 'max'].forEach(function (a) {
      var v = parseFloat(el.getAttribute(a));
      if (!isFinite(v)) return;
      if (!el.hasAttribute('data-native-' + a)) el.setAttribute('data-native-' + a, v);
      var nat = parseFloat(el.getAttribute('data-native-' + a));
      el.setAttribute(a, toImperial ? +(nat * f).toPrecision(6) : nat);
    });
    if (!el.hasAttribute('data-native-step') && el.hasAttribute('step')) {
      el.setAttribute('data-native-step', el.getAttribute('step'));
    }
    if (toImperial) el.setAttribute('step', 'any');
    else if (el.hasAttribute('data-native-step')) el.setAttribute('step', el.getAttribute('data-native-step'));

    var shown = shownBefore;
    if (isFinite(shown)) {
      var next = toImperial ? shown * f : shown / f;
      desc.set.call(el, String(el.type === 'number' ? +next.toFixed(3) : next));
    }
  }

  function applyAll(toImperial) {
    patched.forEach(function (el) { rescale(el, toImperial); });
    TDCUnits.refresh();
  }

  function init() {
    document.querySelectorAll('input[data-unit], input[data-unit-native]').forEach(patch);
    if (TDCUnits.isImperial()) patched.forEach(function (el) { rescale(el, true); });
    TDCUnits.refresh();
  }

  document.addEventListener('unitsystemchange', function (e) {
    applyAll(e.detail.system === 'imperial');
  });

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
