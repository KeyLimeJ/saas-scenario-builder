// ─────────────────────────────────────────────────────────────────
// SaaS Scenario Builder — app logic
// ─────────────────────────────────────────────────────────────────

// ─── GLOSSARY ────────────────────────────────────────────────────
// Every key term in the app has a definition here. Wrap any visible
// term in `<span class="term" data-term="KEY">…</span>` to make it clickable.
const GLOSSARY = {
  'ARR': {
    name: 'ARR · Annual Recurring Revenue',
    def: 'The annualized value of recurring subscription revenue at a point in time. Excludes one-time fees and services.',
    formula: 'ARR = MRR × 12 (at end of period)',
    bench: 'Standard SaaS metric for board / investor reporting'
  },
  'MRR': {
    name: 'MRR · Monthly Recurring Revenue',
    def: 'The recurring portion of revenue expressed monthly. Annual contracts contribute AOV/12 each month.',
    formula: 'MRR = (monthly customers × ARPA) + (annual customers × AOV/12)'
  },
  'ARPA': {
    name: 'ARPA · Average Revenue Per Account',
    def: 'Average monthly revenue from a single customer, blended across monthly and annual billing.',
    formula: 'ARPA = (1 − annual%) × monthly + annual% × (AOV ÷ 12)'
  },
  'LTV': {
    name: 'LTV · Lifetime Value',
    def: 'Total gross-margin revenue expected from a customer over their lifetime.',
    formula: 'LTV = ARPA × Gross Margin ÷ Churn rate',
    bench: 'Target: ≥ 3× CAC'
  },
  'CAC': {
    name: 'CAC · Customer Acquisition Cost',
    def: 'The total marketing and sales cost to acquire one new customer.',
    formula: 'CAC = Total spend ÷ New customers acquired',
    bench: 'Payback ≤ 12 mo · LTV:CAC ≥ 3'
  },
  'AOV': {
    name: 'AOV · Annual Order Value',
    def: 'The annual revenue from a single annual-contract customer (also called ACV).',
    bench: 'Higher AOV improves cash flow and reduces churn risk'
  },
  'Churn': {
    name: 'Churn',
    def: 'The rate at which customers (logo churn) or revenue (revenue churn) leave the business each period.',
    formula: 'Logo churn = lost accounts ÷ total accounts',
    bench: 'B2B SaaS target: ≤ 3% monthly logo churn'
  },
  'NRR': {
    name: 'NRR · Net Revenue Retention',
    def: 'Revenue retained from existing customers — including expansion, minus churn and contraction. Can exceed 100%.',
    formula: 'NRR = (Starting MRR − churn − contraction + expansion) ÷ Starting MRR',
    bench: 'Best-in-class: ≥ 120%'
  },
  'GRR': {
    name: 'GRR · Gross Revenue Retention',
    def: 'Revenue retained from existing customers, excluding expansion. Caps at 100%.',
    formula: 'GRR = (Starting MRR − churn − contraction) ÷ Starting MRR',
    bench: 'Healthy SaaS: ≥ 90%'
  },
  'LTV:CAC': {
    name: 'LTV : CAC ratio',
    def: 'How many times over each customer pays back their acquisition cost in lifetime value.',
    formula: 'LTV:CAC = LTV ÷ CAC',
    bench: '≥ 3× healthy · 1.5–3× marginal · < 1.5× unprofitable'
  },
  'CAC Payback': {
    name: 'CAC Payback Period',
    def: 'How many months of gross profit it takes to recover the acquisition cost of a customer.',
    formula: 'Payback = CAC ÷ (ARPA × Gross Margin)',
    bench: '≤ 12 mo target · ≤ 18 mo acceptable'
  },
  'Rule of 40': {
    name: 'Rule of 40',
    def: 'Composite SaaS health metric: growth rate + free-cash-flow margin should sum to at least 40.',
    formula: 'Rule of 40 = Growth % + FCF Margin %',
    bench: '≥ 40 is the public-SaaS bar'
  },
  'Magic Number': {
    name: 'SaaS Magic Number',
    def: 'Sales efficiency: how much new ARR each dollar of S&M spend produced last quarter.',
    formula: '(ΔARR × 4) ÷ S&M spend (quarter)',
    bench: '> 0.75 healthy · > 1.0 great · < 0.5 reassess'
  },
  'CPM': {
    name: 'CPM · Cost Per Mille',
    def: 'The cost to deliver 1,000 ad impressions on a media channel.',
    formula: 'CPM = Spend ÷ (Impressions ÷ 1000)',
    bench: 'Paid Search ~$20–80 · Paid Social ~$5–20 · Outbound (per touch) much higher'
  },
  'CTR': {
    name: 'CTR · Click-Through Rate',
    def: 'Percentage of impressions that resulted in a click to your site.',
    formula: 'CTR = Visitors ÷ Impressions',
    bench: 'Paid Search 2–5% · Paid Social 0.5–2%'
  },
  'Funnel': {
    name: 'Acquisition Funnel',
    def: 'The cascade from impressions → visitors → signups → trials → paid customers. Each stage drops volume by its conversion rate.',
    formula: 'Paid = Impressions × CTR × Sign% × Trial% × Paid%'
  },
  'Expansion': {
    name: 'Expansion MRR',
    def: 'Additional recurring revenue from existing customers — seat growth, plan upgrades, add-ons.',
    formula: 'Expansion MRR = current MRR × expansion %',
    bench: 'The compounding force behind NRR > 100%'
  },
  'Contraction': {
    name: 'Contraction MRR',
    def: 'Revenue lost from existing customers without losing them — downgrades, fewer seats, plan moves.',
    bench: 'Should be smaller than churn'
  },
  'Winback': {
    name: 'Winback Rate',
    def: 'Share of churned customers reactivated each month. CAC for winback is typically far below new-logo CAC.',
    bench: '5–10% monthly is meaningful'
  },
  'Viral coefficient': {
    name: 'Viral Coefficient (k-factor)',
    def: 'Number of new customers each active customer brings in per period. Above 1.0 = pure-organic exponential growth.',
    formula: 'k = referrals per customer × conversion rate of referrals',
    bench: 'k > 0.5 meaningful in SaaS · k > 1 rare'
  },
  'Annual contracts': {
    name: 'Annual Contracts %',
    def: 'Share of customers paying yearly (upfront) rather than monthly. Shifts blended ARPA toward AOV ÷ 12.',
    bench: 'Higher mix = better cash flow + lower churn risk'
  },
  'Compounding': {
    name: 'Compounding Growth',
    def: 'When growth feeds growth. In SaaS the compounding engines are expansion revenue (adds to a growing base) and viral referrals (active customers bring more customers).',
    bench: 'The defining feature of a self-reinforcing business'
  },
  'Gross Margin': {
    name: 'Gross Margin',
    def: 'The share of revenue left after the direct cost of delivering the service (hosting, support, payment processing).',
    bench: 'B2B SaaS norm: 70–85%'
  }
};

// ─── CHART HELP ──────────────────────────────────────────────────
// Plain-English explanation for each chart. Click the (i) icon next to
// a chart title to see: What you see · How to read it · What to look for.
const CHART_HELP = {
  'growth-outcome': {
    title: 'Growth Outcome · 24 mo',
    what: 'The headline projection of how the business compounds over 24 months under your current scenario. Three tabs: ARR, MRR, or Customers.',
    read: '<strong>Solid line</strong> = with the referral loop active. <strong>Dashed line</strong> = same scenario with no referrals. The gap between them is the value of compounding.',
    look: 'A <strong>widening gap</strong> means referrals are doing real work. A <strong>flat or shrinking solid line</strong> means churn is beating acquisition + expansion — the business is plateauing.'
  },
  'acq-payback': {
    title: 'CAC Payback by Channel',
    what: 'Months of gross profit needed to recoup the acquisition cost of each customer, per channel.',
    read: 'Bar length = months. <strong>Green</strong> ≤ 12 mo (healthy) · <strong>amber</strong> 12–18 (watch) · <strong>red</strong> > 18 (problem).',
    look: 'Long bars on high-spend channels = capital tied up too long. <strong>Reallocate spend</strong> toward channels with shorter payback.'
  },
  'mon-stack': {
    title: 'MRR Composition · 24 mo',
    what: 'Monthly Recurring Revenue broken into its four moving parts: New, Expansion, Churn (below zero), Contraction (below zero).',
    read: 'Each stacked bar = one month. <strong>Green</strong> adds to MRR; <strong>red and orange</strong> subtract. Net MRR = green − red.',
    look: 'If churn bars grow faster than new + expansion, you\'re approaching a plateau. A healthy stack has expansion (light green) becoming a larger share over time.'
  },
  'mon-mix': {
    title: 'Revenue Mix · Annual vs. Monthly',
    what: 'Share of end-Y1 ARR coming from annual contracts vs monthly subscriptions.',
    read: 'Bigger <strong>green slice</strong> = more upfront cash + stickier customers. Bigger <strong>blue slice</strong> = more flexibility but higher churn risk.',
    look: 'Healthy SaaS usually has > 30% annual to balance cash flow. Move the % Annual slider to see how the mix changes the LTV math.'
  },
  'cohort': {
    title: 'Cohort Retention Heatmap',
    what: 'Retention by signup cohort over time. Each row = a different signup month. Each column = months since that cohort signed up.',
    read: '<strong>Darker green</strong> = higher retention. Read each row left-to-right to follow that cohort\'s aging. Compare top-to-bottom to spot recent cohort improvements.',
    look: '<strong>Steep drops in early columns</strong> (M1–M3) = onboarding problem. <strong>Improving rows over time</strong> = retention work is paying off.'
  },
  'ret-trend': {
    title: 'NRR & GRR Trend · 12 mo',
    what: 'Net and Gross Revenue Retention compounding over 12 months under the current scenario.',
    read: '<strong>NRR (green, filled)</strong> includes expansion and can exceed 100%. <strong>GRR (orange, dashed)</strong> only subtracts churn and caps at 100%.',
    look: 'NRR > 110% is healthy. The <strong>gap between the lines</strong> is the power of expansion revenue. If NRR dives below 100%, expansion can\'t cover churn.'
  },
  'comp-overlay': {
    title: 'Linear vs. Compounded Growth',
    what: 'Customer base over 24 months — same acquisition spend, run twice: <strong>with</strong> and <strong>without</strong> the referral loop.',
    read: '<strong>Solid green</strong> = referrals on. <strong>Dashed gray</strong> = pure linear (referrals off).',
    look: 'The wider the gap, the more referrals are doing the heavy lifting. <strong>Closing the gap = invest in the viral motion.</strong>'
  },
  'comp-mix': {
    title: 'Compounding Contribution · M24',
    what: 'At month 24, where do new logos come from?',
    read: '<strong>Blue slice</strong> = paid acquisition (every customer costs CAC). <strong>Green slice</strong> = referral loop (free, generated by existing customers).',
    look: 'A growing green slice signals a self-reinforcing business. <strong>Pure blue = you must keep buying every customer</strong> — no compounding.'
  },
  'comp-sens': {
    title: 'Sensitivity · k-factor',
    what: 'Projected M24 ARR across a range of viral coefficients (0% to 30%) — holding every other lever constant.',
    read: 'Each bar = an alternate scenario at that k. The <strong>highlighted bar</strong> = your current k-factor.',
    look: '<strong>Steep slope</strong> = viral is the highest-leverage lever in your model. <strong>Flat slope</strong> = referrals don\'t move the needle yet; focus elsewhere first.'
  },
  'ue-ratio': {
    title: 'LTV:CAC by Channel',
    what: 'How many times each channel\'s lifetime value exceeds its acquisition cost.',
    read: '<strong>Green</strong> ≥ 3x (healthy) · <strong>amber</strong> 1.5–3x (marginal) · <strong>red</strong> < 1.5x (unprofitable).',
    look: '<strong>Red bars = channels burning cash.</strong> Cut spend or fix the funnel before scaling. Blended ratio can hide channel-level problems.'
  },
  'ue-payback': {
    title: 'CAC Payback by Channel',
    what: 'Same as the Acquisition view\'s payback: months to recoup CAC per channel.',
    read: 'Lower is better. Color-coded by health threshold.',
    look: 'Reallocate budget from long-payback channels to short-payback channels for capital efficiency.'
  },
  'ml-forecast': {
    title: 'MRR Forecast · 90-day Horizon',
    what: 'A Prophet-style 90-day forecast of MRR with prediction intervals (uncertainty bands).',
    read: '<strong>Solid blue line</strong> = point forecast. <strong>Faded band</strong> = P10 to P90 uncertainty range — there\'s an 80% chance MRR lands inside it.',
    look: '<strong>Widening band</strong> = uncertainty grows with horizon. Plan against the band, not the point — especially the P10 (downside) for capacity decisions.'
  }
};

// ─── TERM POPOVER ────────────────────────────────────────────────
(function setupTermPopover() {
  const pop = document.getElementById('term-popover');
  if (!pop) return;
  const nameEl = pop.querySelector('.term-popover-name');
  const defEl  = pop.querySelector('.term-popover-def');
  const metaEl = pop.querySelector('.term-popover-meta');

  function position(anchorRect) {
    // Show first to measure
    pop.style.left = '-9999px';
    pop.style.top  = '-9999px';
    pop.classList.add('open');
    const popW = pop.offsetWidth;
    const popH = pop.offsetHeight;
    let left = anchorRect.left;
    let top  = anchorRect.bottom + 8;
    if (left + popW > window.innerWidth - 12) left = window.innerWidth - popW - 12;
    if (top  + popH > window.innerHeight - 12) top  = anchorRect.top - popH - 8;
    if (left < 12) left = 12;
    if (top  < 12) top  = 12;
    pop.style.left = left + 'px';
    pop.style.top  = top + 'px';
  }
  function show(el) {
    const key = el.dataset.term;
    const t = GLOSSARY[key];
    if (!t) return;
    pop.classList.remove('chart-help');
    nameEl.textContent = t.name || key;
    defEl.style.display = '';
    defEl.textContent  = t.def  || '';
    metaEl.innerHTML = '';
    if (t.formula) metaEl.innerHTML += `<div class="term-popover-row"><span class="term-popover-label">Formula</span><span class="term-popover-value">${t.formula}</span></div>`;
    if (t.bench)   metaEl.innerHTML += `<div class="term-popover-row"><span class="term-popover-label">Benchmark</span><span class="term-popover-value">${t.bench}</span></div>`;
    metaEl.style.display = (t.formula || t.bench) ? '' : 'none';
    position(el.getBoundingClientRect());
  }
  function showChart(el) {
    const key = el.dataset.chartHelp;
    const c = CHART_HELP[key];
    if (!c) return;
    pop.classList.add('chart-help');
    nameEl.textContent = c.title || key;
    defEl.style.display = 'none';  // chart help uses sections instead
    metaEl.innerHTML =
      `<div class="term-popover-section"><div class="term-popover-section-lbl">What you see</div><div class="term-popover-section-txt">${c.what}</div></div>` +
      `<div class="term-popover-section"><div class="term-popover-section-lbl">How to read</div><div class="term-popover-section-txt">${c.read}</div></div>` +
      `<div class="term-popover-section"><div class="term-popover-section-lbl">What to look for</div><div class="term-popover-section-txt">${c.look}</div></div>`;
    metaEl.style.display = '';
    position(el.getBoundingClientRect());
  }
  function hide() { pop.classList.remove('open'); pop.classList.remove('chart-help'); }

  document.addEventListener('click', e => {
    const help = e.target.closest('.card-help');
    const term = e.target.closest('.term');
    if (help && help.dataset.chartHelp && CHART_HELP[help.dataset.chartHelp]) {
      e.stopPropagation();
      showChart(help);
    } else if (term && term.dataset.term && GLOSSARY[term.dataset.term]) {
      e.stopPropagation();
      show(term);
    } else if (!e.target.closest('.term-popover')) {
      hide();
    }
  });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') hide(); });
  window.addEventListener('scroll', hide, true);
  window.addEventListener('resize', hide);
})();

// ─── ROUTE METADATA ──────────────────────────────────────────────
const ROUTES = {
  'overview':     { num: '01', title: 'Where the Business Lands',         sub: 'The headline result of every lever in this app. Walk left to right through the sidebar to see how Acquisition, Retention, and Compounding stack into this projection.' },
  'acquisition':  { num: '02', title: 'Acquisition · Top of Funnel',      sub: 'Spend allocation across six channels and funnel conversion rates. Edit any channel cell to see the model recompute.' },
  'monetization': { num: '03', title: 'Monetization · Pricing & Mix',     sub: 'ARPA, annual contract mix, and expansion revenue determine the slope of MRR growth. Adjust the levers and watch the stack rebuild.' },
  'retention':    { num: '04', title: 'Retention · Hold the Base',        sub: 'Churn, contraction and winback shape both LTV and the net retention story. The cohort heatmap shows how each month compounds.' },
  'compounding':  { num: '05', title: 'Compounding · The Multiplier',     sub: 'When customers bring customers, growth stops being linear. The viral coefficient turns acquisition spend into a self-reinforcing base.' },
  'unit-econ':    { num: '06', title: 'Unit Economics · LTV vs. CAC',     sub: 'The portfolio question: blended ratio can look healthy while individual channels burn cash. Read each channel separately to reallocate spend.' },
  'predictive':   { num: '07', title: 'Predictive Layer · ML in Production', sub: 'Four production models feed every metric in this app. Toggle ML in the sidebar footer to compare flat assumptions with model-driven inputs.' }
};

// ─── ROUTER ──────────────────────────────────────────────────────
function goto(route) {
  document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
  document.querySelectorAll('.sb-item').forEach(i => i.classList.remove('active'));
  const view = document.getElementById('v-' + route);
  const navItem = document.querySelector(`[data-view="${route}"]`);
  if (view) view.classList.add('active');
  if (navItem) navItem.classList.add('active');

  const meta = ROUTES[route];
  if (meta) {
    document.getElementById('m-eyebrow').textContent = `${meta.num} · ${route.replace('-', ' ').toUpperCase()}`;
    document.getElementById('m-title').textContent   = meta.title;
    document.getElementById('m-sub').textContent     = meta.sub;
    document.getElementById('footer-route').textContent = `${meta.num} · ${route.replace('-', ' ').toUpperCase()}`;
  }

  // Update URL hash for deep linking
  if (location.hash !== '#' + route) location.hash = route;

  // Destroy charts that aren't in the now-active view. When we navigate back to them,
  // they'll be re-created fresh against a properly-sized container.
  Object.keys(charts).forEach(id => {
    const c = document.getElementById(id);
    if (!c || !c.closest('.view.active')) {
      try { charts[id].destroy(); } catch (e) {}
      delete charts[id];
    }
  });

  calc();
}

// Deep-link support
window.addEventListener('hashchange', () => {
  const r = location.hash.replace('#', '');
  if (ROUTES[r]) goto(r);
});

// ─── CHANNEL DATA ────────────────────────────────────────────────
// Calibrated for a mid-market B2B SaaS Employee Experience Platform
// (think Lattice / 15Five / Culture Amp competitor — 50-500 employee customers,
// sales-assisted, $200/mo blended ARPA, annual-contract-heavy).
// Every channel owns its own CPM, spend, AND its own funnel conversion rates.
// CAC is fully derived: spend / (impressions × CTR × signup × trial × paid).
const CHANNELS = [
  { tag: 'C1', name: 'Paid Search',   cpm:  80, spend: 25000, ctr: 2.0, sig: 2.5, tri: 50, pd: 22 },
  { tag: 'C2', name: 'Paid Social',   cpm:  50, spend: 20000, ctr: 1.2, sig: 2.0, tri: 45, pd: 20 },
  { tag: 'C3', name: 'Organic / SEO', cpm:   8, spend: 10000, ctr: 4.0, sig: 0.5, tri: 45, pd: 20 },
  { tag: 'C4', name: 'Referral',      cpm:  20, spend:  3000, ctr: 4.0, sig: 1.0, tri: 60, pd: 35 },
  { tag: 'C5', name: 'Outbound',      cpm: 400, spend: 18000, ctr: 4.0, sig: 4.0, tri: 40, pd: 25 },
  { tag: 'C6', name: 'Partnerships',  cpm:  50, spend:  8000, ctr: 2.5, sig: 1.0, tri: 55, pd: 30 }
];

// ─── BUILD PER-CHANNEL COLUMNS ───────────────────────────────────
// Each channel column has: header, INPUTS (Spend, CPM), CONVERSION (CTR, V→S, S→T, T→P),
// FUNNEL output (5 stages), and CAC at the bottom. All dials write to the channel state.
(function buildChannelColumns() {
  const grid = document.getElementById('ch-cols');
  if (!grid) return;
  CHANNELS.forEach((c, i) => {
    const col = document.createElement('div');
    col.className = 'ch-col2';
    col.innerHTML = `
      <div class="ch-col2-head">
        <div class="ch-col2-tag">${c.tag}</div>
        <div class="ch-col2-name">${c.name}</div>
      </div>

      <div class="ch-col2-section">
        <span class="ch-col2-section-lbl">Inputs</span>
        <div class="ch-dial">
          <div class="ch-dial-row"><span class="ch-dial-lbl">Spend / mo</span><span class="ch-dial-val editable" id="cv-sp-${i}" data-ch="${i}" data-field="spend" title="Click to type a value">$${(c.spend/1000).toFixed(0)}k</span></div>
          <input type="range" data-ch="${i}" data-field="spend" min="0"   max="60000" step="500" value="${c.spend}">
        </div>
        <div class="ch-dial">
          <div class="ch-dial-row"><span class="ch-dial-lbl"><span class="term" data-term="CPM">CPM</span></span><span class="ch-dial-val editable" id="cv-cpm-${i}" data-ch="${i}" data-field="cpm" title="Click to type a value">$${c.cpm}</span></div>
          <input type="range" data-ch="${i}" data-field="cpm"   min="1"   max="500"   step="1"   value="${c.cpm}">
        </div>
      </div>

      <div class="ch-col2-section">
        <span class="ch-col2-section-lbl">Conversion</span>
        <div class="ch-dial">
          <div class="ch-dial-row"><span class="ch-dial-lbl"><span class="term" data-term="CTR">CTR</span></span><span class="ch-dial-val editable" id="cv-ctr-${i}" data-ch="${i}" data-field="ctr" title="Click to type a value">${c.ctr.toFixed(1)}%</span></div>
          <input type="range" data-ch="${i}" data-field="ctr"   min="0.1" max="20"  step="0.1" value="${c.ctr}">
        </div>
        <div class="ch-dial">
          <div class="ch-dial-row"><span class="ch-dial-lbl">V → Signup</span><span class="ch-dial-val editable" id="cv-sig-${i}" data-ch="${i}" data-field="sig" title="Click to type a value">${c.sig.toFixed(1)}%</span></div>
          <input type="range" data-ch="${i}" data-field="sig"   min="0.5" max="30"  step="0.5" value="${c.sig}">
        </div>
        <div class="ch-dial">
          <div class="ch-dial-row"><span class="ch-dial-lbl">Sign → Trial</span><span class="ch-dial-val editable" id="cv-tri-${i}" data-ch="${i}" data-field="tri" title="Click to type a value">${c.tri}%</span></div>
          <input type="range" data-ch="${i}" data-field="tri"   min="5"   max="100" step="1"   value="${c.tri}">
        </div>
        <div class="ch-dial">
          <div class="ch-dial-row"><span class="ch-dial-lbl">Trial → Paid</span><span class="ch-dial-val editable" id="cv-pd-${i}" data-ch="${i}" data-field="pd" title="Click to type a value">${c.pd.toFixed(1)}%</span></div>
          <input type="range" data-ch="${i}" data-field="pd"    min="1"   max="80"  step="0.5" value="${c.pd}">
        </div>
      </div>

      <div class="ch-col2-section">
        <span class="ch-col2-section-lbl">Funnel Output</span>
        <div class="ch-stages">
          <div class="ch-stage-row"><span class="ch-stage-lbl">Impressions</span><span class="ch-stage-val" id="cs-imp-${i}">—</span></div>
          <div class="ch-stage-row"><span class="ch-stage-lbl">Visitors</span>   <span class="ch-stage-val" id="cs-vis-${i}">—</span></div>
          <div class="ch-stage-row"><span class="ch-stage-lbl">Signups</span>    <span class="ch-stage-val" id="cs-sig-${i}">—</span></div>
          <div class="ch-stage-row"><span class="ch-stage-lbl">Trials</span>     <span class="ch-stage-val" id="cs-tri-${i}">—</span></div>
          <div class="ch-stage-row paid"><span class="ch-stage-lbl">Paid</span>  <span class="ch-stage-val" id="cs-paid-${i}">—</span></div>
        </div>
      </div>

      <div class="ch-col2-cac">
        <span class="ch-col2-cac-lbl">CAC</span>
        <span class="ch-col2-cac-val" id="cs-cac-${i}">—</span>
      </div>
    `;
    grid.appendChild(col);
  });

  // Wire all sliders — each writes back to CHANNELS state and triggers a recalc
  grid.querySelectorAll('input[type=range]').forEach(input => {
    input.addEventListener('input', () => {
      const idx = +input.dataset.ch;
      const field = input.dataset.field;
      CHANNELS[idx][field] = +input.value;
    });
  });

  // Click-to-edit: any editable value swaps to a text input on click.
  // Enter / blur commits, Escape cancels. Slider follows the typed value;
  // if the value exceeds the slider's max, the max auto-expands.
  function parseTyped(raw, field) {
    if (!raw) return NaN;
    const hadK = /k/i.test(raw);
    const cleaned = raw.replace(/[^0-9.\-]/g, '');
    let v = parseFloat(cleaned);
    if (!isFinite(v)) return NaN;
    if (field === 'spend' && hadK) v *= 1000;
    return v;
  }
  grid.addEventListener('click', e => {
    const span = e.target.closest('.ch-dial-val.editable');
    if (!span || span.classList.contains('editing')) return;
    startEdit(span);
  });
  function startEdit(span) {
    const idx   = +span.dataset.ch;
    const field = span.dataset.field;
    const slider = grid.querySelector(`input[type=range][data-ch="${idx}"][data-field="${field}"]`);
    if (!slider) return;

    span.classList.add('editing');
    span.style.display = 'none';

    const input = document.createElement('input');
    input.type = 'text';
    input.className = 'ch-dial-edit';
    input.value = CHANNELS[idx][field];
    span.parentNode.insertBefore(input, span.nextSibling);
    input.focus();
    input.select();

    let done = false;
    const cleanup = () => {
      if (done) return;
      done = true;
      input.remove();
      span.classList.remove('editing');
      span.style.display = '';
    };
    const commit = () => {
      const v = parseTyped(input.value, field);
      if (isFinite(v) && v >= 0) {
        // Auto-expand slider max if typed value exceeds it
        if (v > +slider.max) slider.max = String(Math.ceil(v * 1.25));
        const clamped = Math.max(+slider.min, v);
        CHANNELS[idx][field] = clamped;
        slider.value = clamped;
      }
      cleanup();
      calc();
    };
    input.addEventListener('blur', commit);
    input.addEventListener('keydown', e => {
      if (e.key === 'Enter')  { e.preventDefault(); commit(); }
      if (e.key === 'Escape') { e.preventDefault(); cleanup(); }
    });
  }
})();

// ─── OVERLAY ─────────────────────────────────────────────────────
let ovIdx = 0;
function ovOpen(i) {
  ovIdx = i;
  const c = CHANNELS[i];
  document.getElementById('ov-seg').textContent  = `${c.tag} · CHANNEL`;
  document.getElementById('ov-name').textContent = c.name;
  document.getElementById('ov-cpm').value        = c.cpm;
  document.getElementById('ov-spend').value      = c.spend;
  ovDerivedPreview();
  document.getElementById('ov').classList.add('open');
  setTimeout(() => document.getElementById('ov-cpm').focus(), 80);
}
function ovClose() { document.getElementById('ov').classList.remove('open'); }
function ovSave() {
  const cpm = parseFloat(document.getElementById('ov-cpm').value);
  const sp  = parseInt(document.getElementById('ov-spend').value);
  if (!cpm || cpm < 0.1 || sp < 0) return;
  CHANNELS[ovIdx].cpm   = cpm;
  CHANNELS[ovIdx].spend = sp;
  document.getElementById(`cpm-${ovIdx}`).textContent = `$${cpm.toLocaleString()}`;
  document.getElementById(`sp-${ovIdx}`).textContent  = sp >= 1000 ? `$${(sp / 1000).toFixed(0)}k` : `$${sp}`;
  ovClose();
  calc();
}
function ovDerivedPreview() {
  // Per-channel sliders replaced the modal; preview no longer used. Kept as a no-op shim.
  const el = document.getElementById('ov-derived');
  if (el) el.textContent = '';
}
document.getElementById('ov').addEventListener('keydown', e => {
  if (e.key === 'Enter')  { e.preventDefault(); ovSave(); }
  if (e.key === 'Escape') ovClose();
});
['ov-cpm', 'ov-spend'].forEach(id => {
  const el = document.getElementById(id);
  if (el) el.addEventListener('input', ovDerivedPreview);
});

// ─── ML TOGGLE ───────────────────────────────────────────────────
let mlOn = true;
function toggleML() {
  mlOn = !mlOn;
  const dot = document.getElementById('sb-ml-dot');
  const txt = document.getElementById('sb-ml-txt');
  txt.textContent = mlOn ? 'ML · ON' : 'ML · OFF';
  dot.style.background = mlOn ? 'var(--ml)' : 'var(--ink-faint)';
  dot.style.boxShadow  = mlOn ? '0 0 6px var(--ml)' : 'none';
  // Update LTV method label
  const meth = mlOn ? 'BG/NBD probabilistic CLV' : 'Flat: ARPA × GM / churn';
  const m1 = document.getElementById('kb-ltv-method');
  const m2 = document.getElementById('ue-ltv-meth');
  if (m1) m1.textContent = meth;
  if (m2) m2.textContent = meth;
  calc();
}

// ─── SLIDER LIVE LABELS ──────────────────────────────────────────
function bindSlider(id, fmt) {
  const el = document.getElementById(id);
  const v  = document.getElementById(id + '-v');
  if (!el || !v) return;
  const upd = () => v.textContent = fmt(el.value);
  el.addEventListener('input', upd); upd();
}
bindSlider('m-annual',   v => `${v}%`);
bindSlider('m-gm',       v => `${v}%`);
bindSlider('m-exp',      v => `${(+v).toFixed(1)}%`);
bindSlider('r-logo',     v => `${(+v).toFixed(1)}%`);
bindSlider('r-rev',      v => `${(+v).toFixed(1)}%`);
bindSlider('r-contract', v => `${(+v).toFixed(1)}%`);
bindSlider('r-winback',  v => `${(+v).toFixed(1)}%`);
bindSlider('v-k',        v => `${(+v).toFixed(1)}%`);
bindSlider('v-lag',      v => `${v} mo`);
bindSlider('v-conv',     v => `${v}%`);

// ─── CHART STATE ─────────────────────────────────────────────────
const charts = {};

// Overview chart view: 'arr' | 'mrr' | 'customers'
let overviewView = 'arr';
function setOverviewView(view) {
  if (view === overviewView) return;
  overviewView = view;
  document.querySelectorAll('.chart-tab').forEach(t =>
    t.classList.toggle('active', t.dataset.view === view)
  );
  // Recreate chart with new axes/datasets
  if (charts['c-overview-stock']) {
    charts['c-overview-stock'].destroy();
    delete charts['c-overview-stock'];
  }
  calc();
}

function chartDefaults() {
  Chart.defaults.font.family = "'JetBrains Mono', monospace";
  Chart.defaults.color = '#7A766B';
  Chart.defaults.borderColor = 'rgba(255,255,255,0.04)';
}

function ensureChart(id, config) {
  if (charts[id]) return charts[id];
  const ctx = document.getElementById(id);
  if (!ctx) return null;
  // Don't create on a hidden canvas — Chart.js measures it at 0×0 and gets stuck there.
  if (!ctx.closest('.view.active')) return null;
  chartDefaults();
  charts[id] = new Chart(ctx.getContext('2d'), config);
  return charts[id];
}

// Helper: returns the canvas only if its view is active, else null.
// Each chart block guards on this so we skip hidden views entirely.
function visibleCanvas(id) {
  const c = document.getElementById(id);
  return (c && c.closest('.view.active')) ? c : null;
}

const baseChartOptions = (extra = {}) => ({
  responsive: true,
  maintainAspectRatio: false,
  interaction: { intersect: false, mode: 'index' },
  plugins: {
    legend: { display: false },
    tooltip: { backgroundColor: '#141B16', borderColor: '#2E3830', borderWidth: 1, padding: 10, titleFont: { size: 11 }, bodyFont: { size: 11 } }
  },
  scales: {
    x: { grid: { color: 'rgba(255,255,255,0.04)' }, ticks: { font: { size: 9 } } },
    y: { grid: { color: 'rgba(255,255,255,0.04)' }, ticks: { font: { size: 9 } } }
  },
  ...extra
});

// ─── COHORT HEATMAP ──────────────────────────────────────────────
function renderCohort(monthlyRetention) {
  const rows = 8, cols = 8;
  const labels = document.getElementById('cohort-labels');
  const grid   = document.getElementById('cohort-grid');
  if (!labels || !grid) return;
  labels.innerHTML = '';
  grid.innerHTML   = '';
  grid.style.gridTemplateColumns = `repeat(${cols}, 1fr)`;
  grid.style.gridTemplateRows    = `repeat(${rows}, 1fr)`;

  const cohortMonths = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug'];
  for (let r = 0; r < rows; r++) {
    const lbl = document.createElement('div');
    lbl.textContent = cohortMonths[r];
    labels.appendChild(lbl);
  }
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const age = c;
      const maxAge = (rows - 1) - r;
      const cell = document.createElement('div');
      cell.className = 'cohort-cell';
      if (age > maxAge) {
        cell.style.background = 'rgba(255,255,255,0.02)';
        cell.textContent = '';
      } else {
        const cohortFactor = 1 + (r - rows / 2) * 0.005;
        const ret = Math.pow(monthlyRetention * cohortFactor, age);
        const pct = Math.max(0, Math.min(1, ret));
        const alpha = 0.15 + pct * 0.85;
        cell.style.background = `rgba(197, 224, 99, ${alpha})`;
        cell.textContent = `${(pct * 100).toFixed(0)}`;
      }
      grid.appendChild(cell);
    }
  }
}


// ─── CALC ────────────────────────────────────────────────────────
function calc() {
  // ── Inputs (funnel rates now live per-channel; show a representative blend in headlines)
  const blendRate = (arr, field) => {
    const totalSpend = arr.reduce((s, c) => s + c.spend, 0);
    return totalSpend > 0
      ? arr.reduce((s, c) => s + (c[field] / 100) * c.spend, 0) / totalSpend
      : arr.reduce((s, c) => s + c[field] / 100, 0) / arr.length;
  };
  const fSignup = blendRate(CHANNELS, 'sig');
  const fTrial  = blendRate(CHANNELS, 'tri');
  const fPaid   = blendRate(CHANNELS, 'pd');
  const fnTotal = fSignup * fTrial * fPaid;

  const arpa   = +document.getElementById('m-arpa').value;
  const aov    = +document.getElementById('m-aov').value;
  const annual = +document.getElementById('m-annual').value / 100;
  const expMo  = +document.getElementById('m-exp').value / 100;

  let logoChurn = +document.getElementById('r-logo').value / 100;
  let revChurn  = +document.getElementById('r-rev').value / 100;
  const contract = +document.getElementById('r-contract').value / 100;
  const winback  = +document.getElementById('r-winback').value / 100;

  // ML adjustments — proactive CSM intervention reduces effective churn
  if (mlOn) {
    logoChurn = logoChurn * 0.82;
    revChurn  = revChurn  * 0.85;
  }

  // ── Blended ARPA (annual contracts contribute aov/12 monthly)
  const blendedArpa = arpa * (1 - annual) + (aov / 12) * annual;

  // ── Funnel lift vs. baseline
  const baselineFunnel = 0.06 * 0.55 * 0.22;
  const funnelLift = fnTotal / baselineFunnel;

  // ── Per-channel funnel: spend × CPM → impressions → channel-specific funnel → paid → CAC
  const fmtVol = v =>
    v >= 1e6 ? `${(v / 1e6).toFixed(2)}M`
    : v >= 1e3 ? `${(v / 1e3).toFixed(1)}k`
    : Math.round(v).toLocaleString();
  const fmtSpend = v => v >= 1000 ? `$${(v / 1000).toFixed(0)}k` : `$${v.toLocaleString()}`;

  let totalNew = 0, totalSpend = 0, totalImp = 0, totalVis = 0, totalSig = 0, totalTri = 0;
  const channelData = CHANNELS.map((c, i) => {
    const ctr  = c.ctr / 100;
    const sig  = c.sig / 100;
    const tri  = c.tri / 100;
    const pd   = c.pd  / 100;
    const impr  = c.cpm > 0 ? (c.spend / c.cpm) * 1000 : 0;
    const vis   = impr * ctr;
    const sigs  = vis  * sig;
    const tris  = sigs * tri;
    const paid  = tris * pd;
    const derivedCac = paid > 0 ? c.spend / paid : 0;

    totalNew   += paid;
    totalSpend += c.spend;
    totalImp   += impr;
    totalVis   += vis;
    totalSig   += sigs;
    totalTri   += tris;

    // Column dial labels (input values)
    setText(`cv-sp-${i}`,  fmtSpend(c.spend));
    setText(`cv-cpm-${i}`, `$${c.cpm}`);
    setText(`cv-ctr-${i}`, `${c.ctr.toFixed(1)}%`);
    setText(`cv-sig-${i}`, `${c.sig.toFixed(1)}%`);
    setText(`cv-tri-${i}`, `${c.tri}%`);
    setText(`cv-pd-${i}`,  `${c.pd.toFixed(1)}%`);

    // Column stage outputs
    setText(`cs-imp-${i}`,  fmtVol(impr));
    setText(`cs-vis-${i}`,  fmtVol(vis));
    setText(`cs-sig-${i}`,  fmtVol(sigs));
    setText(`cs-tri-${i}`,  fmtVol(tris));
    setText(`cs-paid-${i}`, Math.round(paid).toLocaleString());
    setText(`cs-cac-${i}`,  `$${Math.round(derivedCac).toLocaleString()}`);

    return { ...c, newLogos: paid, cac: derivedCac };
  });
  const wAvgCAC = totalNew > 0 ? totalSpend / totalNew : 0;
  const vToPaid = totalVis > 0 ? totalNew / totalVis : 0;

  // Totals strip
  setText('tot-spend', fmtSpend(totalSpend));
  setText('tot-imp',   fmtVol(totalImp));
  setText('tot-vis',   fmtVol(totalVis));
  setText('tot-sig',   fmtVol(totalSig));
  setText('tot-tri',   fmtVol(totalTri));
  setText('tot-paid',  Math.round(totalNew).toLocaleString());
  setText('tot-cac',   `$${Math.round(wAvgCAC).toLocaleString()}`);
  setText('tot-conv',  `${(vToPaid * 100).toFixed(2)}%`);

  // ── LTV — flat vs. ML
  const grossMargin = (+document.getElementById('m-gm')?.value || 72) / 100;
  const flatLTV = revChurn > 0 ? (blendedArpa * grossMargin) / revChurn : 0;
  const ltv = mlOn ? flatLTV * 1.18 : flatLTV;

  // ── Unit economics
  const ltvCac = wAvgCAC > 0 ? ltv / wAvgCAC : 0;
  const cacPayback = (blendedArpa * grossMargin) > 0 ? wAvgCAC / (blendedArpa * grossMargin) : 0;

  // ── Compounding inputs (viral loop)
  const viralK   = +(document.getElementById('v-k')?.value    ?? 8)  / 100;
  const viralLag =  +(document.getElementById('v-lag')?.value  ?? 2);
  const viralConv = +(document.getElementById('v-conv')?.value ?? 65) / 100;

  // ── 24-month simulation — runs twice (with and without viral) for comparison
  const months = 24;
  const labels = Array.from({ length: months }, (_, i) => `M${i + 1}`);

  function runSim(withViral) {
    let customers = 0, mrr = 0;
    const referralQueue = []; // referrals queued by lag-month
    const out = {
      arr: [], mrr: [], customers: [], newPaid: [], newViral: [],
      churnLogos: [], churnRev: [], expRev: []
    };
    for (let m = 1; m <= months; m++) {
      // Referrals generated this month (paid into queue, mature after lag)
      if (withViral) referralQueue.push(customers * viralK * viralConv);
      // Referrals maturing this month
      const newFromViral = (withViral && m > viralLag) ? referralQueue[m - viralLag - 1] : 0;

      const newPaid     = totalNew;
      const churnedC    = customers * logoChurn;
      const reactC      = (customers * logoChurn) * winback * 0.3;
      customers = customers + newPaid + newFromViral - churnedC + reactC;

      const newMrr      = (newPaid + newFromViral) * blendedArpa;
      const expMrr      = mrr * expMo;
      const churnMrr    = mrr * revChurn;
      const contractMrr = mrr * contract;
      mrr = mrr + newMrr + expMrr - churnMrr - contractMrr;

      out.arr.push(mrr * 12 / 1000);
      out.mrr.push(mrr / 1000);
      out.customers.push(customers);
      out.newPaid.push(newPaid);
      out.newViral.push(newFromViral);
      out.churnLogos.push(churnedC);
      out.churnRev.push(-churnMrr / 1000);
      out.expRev.push(expMrr / 1000);
    }
    return out;
  }

  const simWith   = runSim(true);
  const simWithout = runSim(false);

  // Legacy aliases used downstream
  const arrSeries           = simWith.arr;
  const newSeries           = simWith.newPaid.map((p, i) => p + simWith.newViral[i]);
  const expSeries           = simWith.expRev;
  const churnSeries         = simWith.churnLogos;
  const churnRevSeries      = simWith.churnRev;
  const customerStockSeries = simWith.customers;
  const mrrSeries           = simWith.mrr;
  const arrEnd              = simWith.mrr[months - 1] * 1000 * 12;

  // ── Composite metrics
  // NRR/GRR are monthly factors here, but the industry conventions for the
  // ribbon benchmarks (≥110% NRR, ≥90% GRR) are annualized — so we compound 12 months.
  const nrrMonthly = 1 + expMo - contract - revChurn;
  const grrMonthly = 1 - revChurn - contract;
  const nrr = Math.pow(nrrMonthly, 12);   // annualized
  const grr = Math.pow(grrMonthly, 12);   // annualized
  const growth12 = arrSeries[11] > 0 ? (arrSeries[23] - arrSeries[11]) / arrSeries[11] : 0;
  const fcfMargin = (grossMargin - (totalSpend * 12) / Math.max(1, arrEnd)) * 100;
  const r40 = (growth12 * 100) + fcfMargin;
  const deltaArrQ = (arrSeries[23] - arrSeries[20]) * 1000;
  const smQuarter = totalSpend * 3;
  const magicNum = smQuarter > 0 ? deltaArrQ / smQuarter : 0;

  // ── HELPERS
  const fmt$ = v => v >= 1e6 ? `$${(v / 1e6).toFixed(2)}M` : v >= 1e3 ? `$${(v / 1e3).toFixed(0)}k` : `$${Math.round(v).toLocaleString()}`;
  const fmt$compact = v => v >= 10000 ? `$${(v / 1000).toFixed(1)}k` : `$${Math.round(v).toLocaleString()}`;

  // ── Persistent KPI bar (visible on every view)
  setText('kb-arr',   fmt$(arrEnd));
  setText('kb-arpa',  `$${Math.round(blendedArpa)}`);
  setText('kb-ltv',   fmt$compact(ltv));
  setText('kb-cac',   fmt$compact(wAvgCAC));
  setKpi ('kb-churn', `${(logoChurn * 100).toFixed(1)}%`, logoChurn <= 0.03 ? 'good' : logoChurn <= 0.05 ? 'warn' : 'bad');
  setText('kb-aov',   `$${aov.toLocaleString()}`);

  // ── OVERVIEW: composite ribbon
  setRibbon('o-ltvcac', `${ltvCac.toFixed(1)}x`,     ltvCac     >= 3    ? 'good' : ltvCac >= 1.5 ? 'warn' : 'bad');
  setRibbon('o-pay',    `${cacPayback.toFixed(1)} mo`, cacPayback <= 12 ? 'good' : cacPayback <= 18 ? 'warn' : 'bad');
  setRibbon('o-nrr',    `${(nrr * 100).toFixed(0)}%`, nrr >= 1.1 ? 'good' : nrr >= 1 ? 'warn' : 'bad');
  setRibbon('o-grr',    `${(grr * 100).toFixed(0)}%`, grr >= 0.9 ? 'good' : grr >= 0.8 ? 'warn' : 'bad');
  setRibbon('o-r40',    `${r40.toFixed(0)}`,          r40 >= 40 ? 'good' : r40 >= 20 ? 'warn' : 'bad');
  setRibbon('o-mn',     magicNum.toFixed(2),          magicNum >= 0.75 ? 'good' : magicNum >= 0.5 ? 'warn' : 'bad');

  // ── ACQUISITION: hero card + tag
  setText('acq-total-tag',    `${Math.round(totalNew).toLocaleString()} new/mo`);
  setText('funnel-rate-tag',  `${(fnTotal * 100).toFixed(2)}% V→Paid`);
  setText('acq-hero-num',     Math.round(totalNew).toLocaleString());
  setText('acq-hero-spend',   fmtSpend(totalSpend));
  setText('acq-hero-cac',     fmt$compact(wAvgCAC));
  setText('acq-hero-funnel',  `${(fnTotal * 100).toFixed(2)}%`);

  // ── MONETIZATION: tags
  setText('mon-arpa-tag', `$${Math.round(blendedArpa)} blended ARPA`);
  const m1NewMrr = totalNew * blendedArpa;
  const m1Fmt = m1NewMrr >= 1000 ? `$${(m1NewMrr / 1000).toFixed(1)}k` : `$${Math.round(m1NewMrr)}`;
  setText('mon-stack-sub',
    `M1 New MRR = ${Math.round(totalNew).toLocaleString()} customers from Acquisition × $${Math.round(blendedArpa)} ARPA = ${m1Fmt}/mo`);

  // Live breakdown explaining how % Annual + Expansion stack
  const annualMo  = aov / 12;
  const monthlyMo = arpa;
  const m12Mrr    = mrrSeries[11] || 0;        // in $k
  const expM12    = m12Mrr * expMo * 1000;     // expansion $ added in M13
  const bd = document.getElementById('mon-breakdown');
  if (bd) {
    bd.innerHTML =
      `<strong>Blended ARPA $${Math.round(blendedArpa)}</strong> = ${Math.round((1 - annual) * 100)}% monthly @ $${monthlyMo}/mo + ${Math.round(annual * 100)}% annual @ $${Math.round(annualMo)}/mo equivalent ($${aov.toLocaleString()} AOV ÷ 12). &nbsp;·&nbsp; ` +
      `<strong>Expansion ${(expMo * 100).toFixed(1)}%</strong> on the M12 base ($${Math.round(m12Mrr).toLocaleString()}k MRR) = <strong>+$${(expM12 / 1000).toFixed(1)}k</strong> added to M13. It compounds because next month's expansion is calculated on a bigger base.`;
  }

  // ── RETENTION: tag
  setText('ret-disp-tag', `${(logoChurn * 100).toFixed(1)}% logo · ${(revChurn * 100).toFixed(1)}% rev`);
  renderCohort(1 - logoChurn);

  // ── UNIT ECON: header values
  setText('ue-ltv',     fmt$compact(ltv));
  setText('ue-cac',     fmt$compact(wAvgCAC));
  setKpi ('ue-ratio',   `${ltvCac.toFixed(1)}x`,      ltvCac >= 3 ? 'good' : ltvCac >= 1.5 ? 'warn' : 'bad');
  setKpi ('ue-payback', `${cacPayback.toFixed(1)} mo`, cacPayback <= 12 ? 'good' : cacPayback <= 18 ? 'warn' : 'bad');
  setText('ue-tag',     `LTV ${fmt$compact(ltv)} · CAC ${fmt$compact(wAvgCAC)}`);

  // ─────────────────────────────────────────────────────────────
  // CHARTS — only build/update charts whose view is mounted
  // ─────────────────────────────────────────────────────────────

  // GROWTH OUTCOME CHART — tabbed: ARR / MRR / Customers · with linear-vs-compounded overlay
  if (visibleCanvas('c-overview-stock')) {
    let dataWith, dataWithout, yTitle, yCallback, withLabel;
    if (overviewView === 'arr') {
      dataWith = simWith.arr; dataWithout = simWithout.arr;
      yTitle = 'ARR ($k)'; yCallback = v => `$${v}k`; withLabel = 'ARR · with compounding';
    } else if (overviewView === 'mrr') {
      dataWith = simWith.mrr; dataWithout = simWithout.mrr;
      yTitle = 'MRR ($k)'; yCallback = v => `$${v}k`; withLabel = 'MRR · with compounding';
    } else {
      dataWith = simWith.customers; dataWithout = simWithout.customers;
      yTitle = 'Customers'; yCallback = v => Math.round(v).toLocaleString(); withLabel = 'Customers · with compounding';
    }

    const ch = ensureChart('c-overview-stock', {
      type: 'line',
      data: { labels: [], datasets: [] },
      options: baseChartOptions({
        plugins: {
          legend: { display: true, position: 'top', align: 'end', labels: { font: { size: 10 }, color: '#B8B3A6', padding: 10, boxWidth: 22, boxHeight: 2 } },
          tooltip: { backgroundColor: '#141B16', borderColor: '#2E3830', borderWidth: 1, padding: 10 }
        },
        scales: {
          x: { grid: { color: 'rgba(255,255,255,0.04)' }, ticks: { font: { size: 9 } } },
          y: { grid: { color: 'rgba(255,255,255,0.04)' }, ticks: { font: { size: 9 }, callback: yCallback }, title: { display: true, text: yTitle, font: { size: 10 }, color: '#7A766B' } }
        }
      })
    });
    ch.data.labels = labels;
    ch.data.datasets = [
      { label: withLabel,             data: dataWith,    borderColor: '#C5E063', backgroundColor: 'rgba(197,224,99,0.10)', fill: true, tension: 0.35, borderWidth: 2.4, pointRadius: 0 },
      { label: 'Without referral loop', data: dataWithout, borderColor: '#7A766B', backgroundColor: 'transparent', fill: false, tension: 0.35, borderWidth: 1.4, pointRadius: 0, borderDash: [5, 4] }
    ];
    ch.options.scales.y.ticks.callback = yCallback;
    ch.options.scales.y.title.text = yTitle;
    ch.update('none');

    // M24 endpoint tag — shows the headline number for the active tab
    const endpoint = dataWith[months - 1];
    const ep = document.getElementById('overview-endpoint');
    if (ep) {
      const fmt = overviewView === 'customers'
        ? `${Math.round(endpoint).toLocaleString()} cust.`
        : `$${endpoint >= 1000 ? (endpoint / 1000).toFixed(2) + 'M' : Math.round(endpoint) + 'k'}`;
      ep.textContent = `M24 → ${fmt}`;
    }
  }

  // ACQUISITION: CAC payback bars
  if (visibleCanvas('c-acq-payback')) {
    const ch = ensureChart('c-acq-payback', {
      type: 'bar',
      data: { labels: [], datasets: [] },
      options: baseChartOptions({ indexAxis: 'y' })
    });
    const labelsC = channelData.map(c => c.name);
    const paybacks = channelData.map(c => c.cac / (blendedArpa * grossMargin));
    const colors = paybacks.map(p => p <= 12 ? '#82C99B' : p <= 18 ? '#E89F4A' : '#D96C5E');
    ch.data.labels = labelsC;
    ch.data.datasets = [{ data: paybacks, backgroundColor: colors, borderRadius: 3, barThickness: 16 }];
    ch.options.scales.x.title = { display: true, text: 'Payback (months)', font: { size: 10 }, color: '#7A766B' };
    ch.update('none');
  }

  // MONETIZATION: stacked MRR composition
  if (visibleCanvas('c-mon-stack')) {
    const ch = ensureChart('c-mon-stack', {
      type: 'bar',
      data: { labels: [], datasets: [] },
      options: baseChartOptions({
        plugins: {
          legend: { display: true, position: 'top', align: 'end', labels: { font: { size: 10 }, color: '#B8B3A6', padding: 10, boxWidth: 12, boxHeight: 12 } },
          tooltip: { backgroundColor: '#141B16', borderColor: '#2E3830', borderWidth: 1, padding: 10, callbacks: { label: c => `${c.dataset.label}: $${Math.abs(c.parsed.y).toFixed(1)}k` } }
        },
        scales: {
          x: { stacked: true, grid: { color: 'rgba(255,255,255,0.04)' }, ticks: { font: { size: 9 } } },
          y: { stacked: true, grid: { color: 'rgba(255,255,255,0.04)' }, ticks: { font: { size: 9 }, callback: v => `$${v}k` } }
        }
      })
    });
    // Decompose monthly MRR into components
    const newC_ser = [], expC_ser = [], churnC_ser = [], contC_ser = [];
    let m2 = 0;
    for (let m = 1; m <= months; m++) {
      const nC = totalNew;
      const nM = nC * blendedArpa;
      const eM = m2 * expMo;
      const cM = m2 * revChurn;
      const ctM = m2 * contract;
      m2 = m2 + nM + eM - cM - ctM;
      newC_ser.push(nM / 1000);
      expC_ser.push(eM / 1000);
      churnC_ser.push(-cM / 1000);
      contC_ser.push(-ctM / 1000);
    }
    ch.data.labels = labels;
    ch.data.datasets = [
      { label: 'New',         data: newC_ser,   backgroundColor: '#C5E063', borderRadius: 2 },
      { label: 'Expansion',   data: expC_ser,   backgroundColor: '#82C99B', borderRadius: 2 },
      { label: 'Churn',       data: churnC_ser, backgroundColor: '#D96C5E', borderRadius: 2 },
      { label: 'Contraction', data: contC_ser,  backgroundColor: '#E89F4A', borderRadius: 2 }
    ];
    ch.update('none');
  }

  // MONETIZATION: annual vs monthly mix
  if (visibleCanvas('c-mon-mix')) {
    const ch = ensureChart('c-mon-mix', {
      type: 'doughnut',
      data: { labels: ['Annual', 'Monthly'], datasets: [] },
      options: {
        responsive: true, maintainAspectRatio: false,
        plugins: {
          legend: { position: 'bottom', labels: { font: { size: 10 }, color: '#B8B3A6', padding: 12 } },
          tooltip: { backgroundColor: '#141B16', borderColor: '#2E3830', borderWidth: 1 }
        },
        cutout: '60%'
      }
    });
    const arrAnnual  = annual * arrEnd;
    const arrMonthly = (1 - annual) * arrEnd;
    ch.data.datasets = [{
      data: [arrAnnual, arrMonthly],
      backgroundColor: ['#C5E063', '#8AB4F0'],
      borderColor: '#141B16', borderWidth: 2
    }];
    ch.update('none');
  }

  // RETENTION: NRR/GRR trend (12 months)
  if (visibleCanvas('c-ret-trend')) {
    const ch = ensureChart('c-ret-trend', {
      type: 'line',
      data: { labels: [], datasets: [] },
      options: baseChartOptions({
        scales: {
          x: { grid: { color: 'rgba(255,255,255,0.04)' }, ticks: { font: { size: 9 } } },
          y: { grid: { color: 'rgba(255,255,255,0.04)' }, ticks: { font: { size: 9 }, callback: v => `${(v * 100).toFixed(0)}%` }, suggestedMin: 0.7, suggestedMax: 1.3 }
        }
      })
    });
    const nrrSeries = [], grrSeries = [];
    for (let m = 1; m <= 12; m++) {
      nrrSeries.push(Math.pow(nrrMonthly, m));
      grrSeries.push(Math.pow(grrMonthly, m));
    }
    ch.data.labels = labels.slice(0, 12);
    ch.data.datasets = [
      { label: 'NRR', data: nrrSeries, borderColor: '#82C99B', backgroundColor: 'rgba(130,201,155,0.08)', fill: true, tension: 0.3, borderWidth: 2, pointRadius: 0 },
      { label: 'GRR', data: grrSeries, borderColor: '#E89F4A', borderWidth: 1.5, pointRadius: 0, tension: 0.3, borderDash: [4, 3] }
    ];
    ch.update('none');
  }

  // UNIT ECON: LTV:CAC by channel
  if (visibleCanvas('c-ue-ratio')) {
    const ch = ensureChart('c-ue-ratio', {
      type: 'bar',
      data: { labels: [], datasets: [] },
      options: baseChartOptions({ indexAxis: 'y' })
    });
    const labelsC = channelData.map(c => c.name);
    const ratios = channelData.map(c => c.cac > 0 ? ltv / c.cac : 0);
    const colors = ratios.map(r => r >= 3 ? '#82C99B' : r >= 1.5 ? '#E89F4A' : '#D96C5E');
    ch.data.labels = labelsC;
    ch.data.datasets = [{ data: ratios, backgroundColor: colors, borderRadius: 3, barThickness: 16 }];
    ch.options.scales.x.title = { display: true, text: 'LTV : CAC (x)', font: { size: 10 }, color: '#7A766B' };
    ch.update('none');
  }

  // UNIT ECON: CAC Payback by channel
  if (visibleCanvas('c-ue-payback')) {
    const ch = ensureChart('c-ue-payback', {
      type: 'bar',
      data: { labels: [], datasets: [] },
      options: baseChartOptions({ indexAxis: 'y' })
    });
    const labelsC = channelData.map(c => c.name);
    const paybacks = channelData.map(c => c.cac / (blendedArpa * grossMargin));
    const colors = paybacks.map(p => p <= 12 ? '#82C99B' : p <= 18 ? '#E89F4A' : '#D96C5E');
    ch.data.labels = labelsC;
    ch.data.datasets = [{ data: paybacks, backgroundColor: colors, borderRadius: 3, barThickness: 16 }];
    ch.options.scales.x.title = { display: true, text: 'Months', font: { size: 10 }, color: '#7A766B' };
    ch.update('none');
  }

  // ML FORECAST chart (90-day projection with bands)
  if (visibleCanvas('c-ml-forecast')) {
    const ch = ensureChart('c-ml-forecast', {
      type: 'line',
      data: { labels: [], datasets: [] },
      options: baseChartOptions({
        plugins: {
          legend: { display: true, position: 'top', labels: { font: { size: 10 }, color: '#B8B3A6', padding: 12, boxWidth: 12 } },
          tooltip: { backgroundColor: '#141B16', borderColor: '#2E3830', borderWidth: 1 }
        }
      })
    });
    const horizonLabels = [];
    const pointForecast = [];
    const p10 = [], p90 = [];
    // Forecast starts from the most recent simulated MRR (M24).
    // simWith.mrr is in $k; multiply back to actual dollars for the daily growth math.
    let mrrSim = (simWith.mrr[months - 1] || 0) * 1000;
    for (let d = 1; d <= 90; d++) {
      horizonLabels.push(`D${d}`);
      // Geometric growth from current MRR using monthly-equivalent rate
      const dailyG = Math.pow(1 + expMo - revChurn - contract, 1 / 30);
      mrrSim = mrrSim * dailyG;
      // Add small seasonality
      const seas = 1 + Math.sin(d / 14) * 0.015;
      const point = mrrSim * seas / 1000;
      const band  = point * 0.08 * Math.sqrt(d / 30);
      pointForecast.push(point);
      p10.push(point - band);
      p90.push(point + band);
    }
    ch.data.labels = horizonLabels;
    ch.data.datasets = [
      { label: 'P90', data: p90, borderColor: 'rgba(138,180,240,0.4)', backgroundColor: 'rgba(138,180,240,0.10)', fill: '+1', borderWidth: 0, pointRadius: 0, tension: 0.4 },
      { label: 'P10', data: p10, borderColor: 'rgba(138,180,240,0.4)', backgroundColor: 'transparent', borderWidth: 0, pointRadius: 0, tension: 0.4 },
      { label: 'Forecast', data: pointForecast, borderColor: '#8AB4F0', borderWidth: 2.2, pointRadius: 0, tension: 0.35, fill: false }
    ];
    ch.options.scales.y.ticks = { font: { size: 9 }, callback: v => `$${v.toFixed(0)}k` };
    ch.update('none');
  }

  // ── COMPOUNDING VIEW: tags + sliders + 3 charts
  setText('comp-k-tag', `k = ${(viralK * 100).toFixed(1)}%`);
  const gapM24 = simWith.customers[months - 1] - simWithout.customers[months - 1];
  setText('comp-gap-tag', `M24 gap → +${Math.round(gapM24).toLocaleString()} customers`);

  // COMPOUNDING: linear vs compounded customer-stock overlay
  if (visibleCanvas('c-comp-overlay')) {
    const ch = ensureChart('c-comp-overlay', {
      type: 'line',
      data: { labels: [], datasets: [] },
      options: baseChartOptions({
        plugins: {
          legend: { display: true, position: 'top', align: 'end', labels: { font: { size: 10 }, color: '#B8B3A6', padding: 10, boxWidth: 22, boxHeight: 2 } },
          tooltip: { backgroundColor: '#141B16', borderColor: '#2E3830', borderWidth: 1, padding: 10 }
        },
        scales: {
          x: { grid: { color: 'rgba(255,255,255,0.04)' }, ticks: { font: { size: 9 } } },
          y: { grid: { color: 'rgba(255,255,255,0.04)' }, ticks: { font: { size: 9 } }, title: { display: true, text: 'Customers', font: { size: 10 }, color: '#7A766B' } }
        }
      })
    });
    ch.data.labels = labels;
    ch.data.datasets = [
      { label: 'With referral loop',     data: simWith.customers,    borderColor: '#C5E063', backgroundColor: 'rgba(197,224,99,0.10)', fill: true, tension: 0.35, borderWidth: 2.4, pointRadius: 0 },
      { label: 'Without (linear)',       data: simWithout.customers, borderColor: '#7A766B', borderDash: [5, 4], fill: false, tension: 0.35, borderWidth: 1.4, pointRadius: 0 }
    ];
    ch.update('none');
  }

  // COMPOUNDING: contribution mix at M24 (paid vs referral)
  if (visibleCanvas('c-comp-mix')) {
    const ch = ensureChart('c-comp-mix', {
      type: 'doughnut',
      data: { labels: ['Paid acquisition', 'Referral loop'], datasets: [] },
      options: {
        responsive: true, maintainAspectRatio: false,
        plugins: {
          legend: { position: 'bottom', labels: { font: { size: 10 }, color: '#B8B3A6', padding: 12 } },
          tooltip: { backgroundColor: '#141B16', borderColor: '#2E3830', borderWidth: 1 }
        },
        cutout: '62%'
      }
    });
    const paidM24    = simWith.newPaid[months - 1];
    const referralM24 = simWith.newViral[months - 1];
    ch.data.datasets = [{
      data: [paidM24, referralM24],
      backgroundColor: ['#8AB4F0', '#C5E063'],
      borderColor: '#141B16', borderWidth: 2
    }];
    ch.update('none');
  }

  // COMPOUNDING: sensitivity — ARR at M24 across k-values
  if (visibleCanvas('c-comp-sens')) {
    const ch = ensureChart('c-comp-sens', {
      type: 'bar',
      data: { labels: [], datasets: [] },
      options: baseChartOptions({
        plugins: {
          legend: { display: false },
          tooltip: { backgroundColor: '#141B16', borderColor: '#2E3830', borderWidth: 1, callbacks: { label: c => `$${c.parsed.y.toFixed(0)}k ARR @ k=${c.label}` } }
        },
        scales: {
          x: { grid: { display: false }, ticks: { font: { size: 9 } }, title: { display: true, text: 'Viral coefficient (k)', font: { size: 10 }, color: '#7A766B' } },
          y: { grid: { color: 'rgba(255,255,255,0.04)' }, ticks: { font: { size: 9 }, callback: v => `$${v}k` } }
        }
      })
    });
    const kRange = [0, 0.05, 0.10, 0.15, 0.20, 0.25, 0.30];
    const arrAtK = kRange.map(k => {
      // Re-run sim with this k, holding all other inputs
      let customers = 0, mrr = 0;
      const queue = [];
      for (let m = 1; m <= months; m++) {
        queue.push(customers * k * viralConv);
        const fromViral = m > viralLag ? queue[m - viralLag - 1] : 0;
        const churned = customers * logoChurn;
        const react   = (customers * logoChurn) * winback * 0.3;
        customers = customers + totalNew + fromViral - churned + react;
        mrr = mrr + (totalNew + fromViral) * blendedArpa + mrr * expMo - mrr * revChurn - mrr * contract;
      }
      return mrr * 12 / 1000;
    });
    const colors = kRange.map(k => k === Math.round(viralK * 20) / 20 ? '#C5E063' : 'rgba(197,224,99,0.35)');
    // Highlight bar matching current k (snap to nearest 0.05)
    const nearestIdx = kRange.reduce((best, k, i) => Math.abs(k - viralK) < Math.abs(kRange[best] - viralK) ? i : best, 0);
    const barColors = kRange.map((_, i) => i === nearestIdx ? '#C5E063' : 'rgba(197,224,99,0.32)');
    ch.data.labels = kRange.map(k => `${(k * 100).toFixed(0)}%`);
    ch.data.datasets = [{ data: arrAtK, backgroundColor: barColors, borderRadius: 3, barThickness: 22 }];
    ch.update('none');
  }
}

// ─── HELPERS ─────────────────────────────────────────────────────
function setText(id, v) { const el = document.getElementById(id); if (el) el.textContent = v; }
function setKpi(id, v, cls) {
  const el = document.getElementById(id);
  if (!el) return;
  el.textContent = v;
  // Preserve any non-state class names from the base
  el.className = el.className.replace(/\b(good|warn|bad|green)\b/g, '').trim() + ' ' + cls;
}
function setRibbon(id, v, cls) {
  const el = document.getElementById(id);
  if (!el) return;
  el.textContent = v;
  el.className = 'ribbon-val ' + cls;
}
function nr_monthly(expMo, contract, revChurn) {
  // Net retention proxy for trend
  return 1 + expMo - contract - revChurn;
}

// ─── WIRE INPUTS ─────────────────────────────────────────────────
let calcT;
document.addEventListener('input',  () => { clearTimeout(calcT); calcT = setTimeout(calc, 60); });
document.addEventListener('change', calc);

// ─── INIT ────────────────────────────────────────────────────────
window.addEventListener('load', () => {
  // Honor hash deep-link if present
  const initial = location.hash.replace('#', '');
  if (initial && ROUTES[initial]) goto(initial);
  else calc();
});

// Recompute on resize to handle chart layout
window.addEventListener('resize', () => {
  clearTimeout(calcT);
  calcT = setTimeout(calc, 120);
});
