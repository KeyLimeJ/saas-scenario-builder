// ─────────────────────────────────────────────────────────────────
// SaaS Scenario Builder — app logic
// ─────────────────────────────────────────────────────────────────

// ─── ROUTE METADATA ──────────────────────────────────────────────
const ROUTES = {
  'overview':     { num: '01', title: 'Executive Snapshot',           sub: 'The six KPIs named in the role definition, recomputed live as scenario inputs change. Composite ratios on the ribbon below show how the business compounds on top of them.' },
  'acquisition':  { num: '02', title: 'Acquisition · Channels & Funnel', sub: 'Spend allocation across six channels, funnel conversion rates, and CAC payback per source. Edit any channel cell to see the model recompute.' },
  'monetization': { num: '03', title: 'Monetization · Pricing & Mix',     sub: 'ARPA, annual contract mix, and expansion revenue determine the slope of MRR growth. Adjust the levers and watch the stack rebuild.' },
  'retention':    { num: '04', title: 'Retention · Churn, NRR, GRR',      sub: 'Churn (logo and revenue), contraction and winback shape both LTV and the net retention story. Cohort heatmap shows the compounding effect.' },
  'unit-econ':    { num: '05', title: 'Unit Economics · LTV vs. CAC',     sub: 'The portfolio question: blended ratio can look healthy while individual channels burn cash. Read each channel separately to reallocate spend.' },
  'predictive':   { num: '06', title: 'Predictive Layer · ML in Production', sub: 'Four production models feed every metric in this app. Toggle ML in the sidebar footer to compare flat assumptions with model-driven inputs.' }
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

  // Charts only resize properly when visible — kick a recalc
  calc();
}

// Deep-link support
window.addEventListener('hashchange', () => {
  const r = location.hash.replace('#', '');
  if (ROUTES[r]) goto(r);
});

// ─── CHANNEL DATA ────────────────────────────────────────────────
const CHANNELS = [
  { tag: 'C1', name: 'Paid Search',   cac: 1450, spend: 22000 },
  { tag: 'C2', name: 'Paid Social',   cac: 1820, spend: 18000 },
  { tag: 'C3', name: 'Organic / SEO', cac:  340, spend:  8000 },
  { tag: 'C4', name: 'Referral',      cac:  420, spend:  5000 },
  { tag: 'C5', name: 'Outbound',      cac: 2200, spend: 12000 },
  { tag: 'C6', name: 'Partnerships',  cac:  890, spend:  9000 }
];

// ─── BUILD CHANNEL GRID ──────────────────────────────────────────
(function buildChannels() {
  const grid = document.getElementById('ch-grid');
  CHANNELS.forEach((c, i) => {
    const col = document.createElement('div');
    col.className = 'ch-col';
    col.innerHTML = `
      <div class="ch-tag">${c.tag}</div>
      <div class="ch-name">${c.name}</div>
      <div class="ch-cell" onclick="ovOpen(${i})">
        <span class="ch-cell-lbl">CAC</span>
        <span class="ch-cell-val" id="cac-${i}">$${c.cac}</span>
      </div>
      <div class="ch-cell" onclick="ovOpen(${i})">
        <span class="ch-cell-lbl">Spend / mo</span>
        <span class="ch-cell-val" id="sp-${i}">$${(c.spend / 1000).toFixed(0)}k</span>
      </div>
      <div class="ch-result" id="new-${i}">0</div>
      <div class="ch-result-sub">new logos / mo</div>
    `;
    grid.appendChild(col);
  });
})();

// ─── OVERLAY ─────────────────────────────────────────────────────
let ovIdx = 0;
function ovOpen(i) {
  ovIdx = i;
  const c = CHANNELS[i];
  document.getElementById('ov-seg').textContent  = `${c.tag} · CHANNEL`;
  document.getElementById('ov-name').textContent = c.name;
  document.getElementById('ov-cac').value        = c.cac;
  document.getElementById('ov-spend').value      = c.spend;
  document.getElementById('ov').classList.add('open');
  setTimeout(() => document.getElementById('ov-cac').focus(), 80);
}
function ovClose() { document.getElementById('ov').classList.remove('open'); }
function ovSave() {
  const cac = parseInt(document.getElementById('ov-cac').value);
  const sp  = parseInt(document.getElementById('ov-spend').value);
  if (!cac || cac < 1 || sp < 0) return;
  CHANNELS[ovIdx].cac   = cac;
  CHANNELS[ovIdx].spend = sp;
  document.getElementById(`cac-${ovIdx}`).textContent = `$${cac.toLocaleString()}`;
  document.getElementById(`sp-${ovIdx}`).textContent  = sp >= 1000 ? `$${(sp / 1000).toFixed(0)}k` : `$${sp}`;
  ovClose();
  calc();
}
document.getElementById('ov').addEventListener('keydown', e => {
  if (e.key === 'Enter')  { e.preventDefault(); ovSave(); }
  if (e.key === 'Escape') ovClose();
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
  const m1 = document.getElementById('o-ltv-method');
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
bindSlider('f-signup',   v => `${(+v).toFixed(1)}%`);
bindSlider('f-trial',    v => `${v}%`);
bindSlider('f-paid',     v => `${(+v).toFixed(1)}%`);
bindSlider('m-annual',   v => `${v}%`);
bindSlider('m-exp',      v => `${(+v).toFixed(1)}%`);
bindSlider('r-logo',     v => `${(+v).toFixed(1)}%`);
bindSlider('r-rev',      v => `${(+v).toFixed(1)}%`);
bindSlider('r-contract', v => `${(+v).toFixed(1)}%`);
bindSlider('r-winback',  v => `${(+v).toFixed(1)}%`);

// ─── CHART STATE ─────────────────────────────────────────────────
const charts = {};

function chartDefaults() {
  Chart.defaults.font.family = "'JetBrains Mono', monospace";
  Chart.defaults.color = '#7A766B';
  Chart.defaults.borderColor = 'rgba(255,255,255,0.04)';
}

function ensureChart(id, config) {
  if (charts[id]) return charts[id];
  const ctx = document.getElementById(id);
  if (!ctx) return null;
  chartDefaults();
  charts[id] = new Chart(ctx.getContext('2d'), config);
  return charts[id];
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

// ─── FUNNEL VIZ ──────────────────────────────────────────────────
function renderFunnel(fSignup, fTrial, fPaid) {
  const wrap = document.getElementById('funnel-viz');
  if (!wrap) return;
  const start = 100000;
  const stages = [
    { name: 'Visitors',         val: start },
    { name: 'Signups',          val: start * fSignup },
    { name: 'Trial Users',      val: start * fSignup * fTrial },
    { name: 'Paid Customers',   val: start * fSignup * fTrial * fPaid }
  ];
  const maxVal = stages[0].val;
  wrap.innerHTML = stages.map(s => {
    const pct = (s.val / maxVal) * 100;
    const v = s.val >= 1000 ? `${(s.val / 1000).toFixed(1)}k` : Math.round(s.val).toLocaleString();
    return `
      <div class="funnel-stage">
        <span class="funnel-stage-name">${s.name}</span>
        <div class="funnel-bar-wrap"><div class="funnel-bar" style="width:${pct}%"></div></div>
        <span class="funnel-stage-val">${v}</span>
      </div>
    `;
  }).join('');
}

// ─── CALC ────────────────────────────────────────────────────────
function calc() {
  // ── Inputs
  const fSignup = +document.getElementById('f-signup').value / 100;
  const fTrial  = +document.getElementById('f-trial').value / 100;
  const fPaid   = +document.getElementById('f-paid').value / 100;
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

  // ── Channel new logos, blended CAC
  let totalNew = 0, totalSpend = 0;
  const channelData = CHANNELS.map((c, i) => {
    const baseNew = c.spend / c.cac;
    const newLogos = baseNew * funnelLift;
    totalNew += newLogos;
    totalSpend += c.spend;
    const cellEl = document.getElementById(`new-${i}`);
    if (cellEl) cellEl.textContent = Math.round(newLogos).toLocaleString();
    return { ...c, newLogos };
  });
  const wAvgCAC = totalNew > 0 ? totalSpend / totalNew : 0;

  // ── LTV — flat vs. ML
  const grossMargin = 0.72;
  const flatLTV = revChurn > 0 ? (blendedArpa * grossMargin) / revChurn : 0;
  const ltv = mlOn ? flatLTV * 1.18 : flatLTV;

  // ── Unit economics
  const ltvCac = wAvgCAC > 0 ? ltv / wAvgCAC : 0;
  const cacPayback = (blendedArpa * grossMargin) > 0 ? wAvgCAC / (blendedArpa * grossMargin) : 0;

  // ── 24-month simulation
  const months = 24;
  let customers = 0, mrr = 0;
  const labels = [], arrSeries = [], newSeries = [], expSeries = [], churnSeries = [], mrrSeries = [];
  const churnRevSeries = [], contractRevSeries = [];
  for (let m = 1; m <= months; m++) {
    labels.push(`M${m}`);
    const newC = totalNew;
    const churnedC = customers * logoChurn;
    const reactC = (customers * logoChurn) * winback * 0.3;
    customers = customers + newC - churnedC + reactC;

    const newMrr      = newC * blendedArpa;
    const expMrr      = mrr * expMo;
    const churnMrr    = mrr * revChurn;
    const contractMrr = mrr * contract;
    mrr = mrr + newMrr + expMrr - churnMrr - contractMrr;

    arrSeries.push(mrr * 12 / 1000);
    newSeries.push(newC);
    expSeries.push(expMrr / 1000);
    churnSeries.push(churnedC);
    mrrSeries.push(mrr / 1000);
    churnRevSeries.push(-churnMrr / 1000);
    contractRevSeries.push(-contractMrr / 1000);
  }
  const arrEnd = mrr * 12;

  // ── Composite metrics
  const nrr = 1 + expMo - contract - revChurn;
  const grr = 1 - revChurn;
  const growth12 = arrSeries[11] > 0 ? (arrSeries[23] - arrSeries[11]) / arrSeries[11] : 0;
  const fcfMargin = (grossMargin - (totalSpend * 12) / Math.max(1, arrEnd)) * 100;
  const r40 = (growth12 * 100) + fcfMargin;
  const deltaArrQ = (arrSeries[23] - arrSeries[20]) * 1000;
  const smQuarter = totalSpend * 3;
  const magicNum = smQuarter > 0 ? deltaArrQ / smQuarter : 0;

  // ── HELPERS
  const fmt$ = v => v >= 1e6 ? `$${(v / 1e6).toFixed(2)}M` : v >= 1e3 ? `$${(v / 1e3).toFixed(0)}k` : `$${Math.round(v).toLocaleString()}`;
  const fmt$compact = v => v >= 10000 ? `$${(v / 1000).toFixed(1)}k` : `$${Math.round(v).toLocaleString()}`;

  // ── OVERVIEW: KPI strip
  setText('o-arr',   fmt$(arrEnd));
  setText('o-arpa',  `$${Math.round(blendedArpa)}`);
  setText('o-ltv',   fmt$compact(ltv));
  setText('o-cac',   fmt$compact(wAvgCAC));
  setKpi ('o-churn', `${(logoChurn * 100).toFixed(1)}%`, logoChurn <= 0.03 ? 'good' : logoChurn <= 0.05 ? 'warn' : 'bad');
  setText('o-aov',   `$${aov.toLocaleString()}`);

  // ── OVERVIEW: composite ribbon
  setRibbon('o-ltvcac', `${ltvCac.toFixed(1)}x`,     ltvCac     >= 3    ? 'good' : ltvCac >= 1.5 ? 'warn' : 'bad');
  setRibbon('o-pay',    `${cacPayback.toFixed(1)} mo`, cacPayback <= 12 ? 'good' : cacPayback <= 18 ? 'warn' : 'bad');
  setRibbon('o-nrr',    `${(nrr * 100).toFixed(0)}%`, nrr >= 1.1 ? 'good' : nrr >= 1 ? 'warn' : 'bad');
  setRibbon('o-grr',    `${(grr * 100).toFixed(0)}%`, grr >= 0.9 ? 'good' : grr >= 0.8 ? 'warn' : 'bad');
  setRibbon('o-r40',    `${r40.toFixed(0)}`,          r40 >= 40 ? 'good' : r40 >= 20 ? 'warn' : 'bad');
  setRibbon('o-mn',     magicNum.toFixed(2),          magicNum >= 0.75 ? 'good' : magicNum >= 0.5 ? 'warn' : 'bad');

  // ── ACQUISITION: tags + funnel viz
  setText('acq-total-tag',    `${Math.round(totalNew).toLocaleString()} new/mo`);
  setText('funnel-rate-tag',  `${(fnTotal * 100).toFixed(2)}% V→Paid`);
  renderFunnel(fSignup, fTrial, fPaid);

  // ── MONETIZATION: tags
  setText('mon-arpa-tag', `$${Math.round(blendedArpa)} blended ARPA`);

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

  // OVERVIEW STOCK CHART
  if (document.getElementById('c-overview-stock')) {
    const ch = ensureChart('c-overview-stock', {
      type: 'line',
      data: { labels: [], datasets: [] },
      options: baseChartOptions({
        scales: {
          x: { grid: { color: 'rgba(255,255,255,0.04)' }, ticks: { font: { size: 9 } } },
          y: { grid: { color: 'rgba(255,255,255,0.04)' }, ticks: { font: { size: 9 }, callback: v => `$${v}k` }, title: { display: true, text: 'ARR ($k)', font: { size: 10 }, color: '#7A766B' } },
          y1: { position: 'right', grid: { display: false }, ticks: { font: { size: 9 } }, title: { display: true, text: 'Customers', font: { size: 10 }, color: '#7A766B' } }
        }
      })
    });
    ch.data.labels = labels;
    ch.data.datasets = [
      { label: 'ARR ($k)',    data: arrSeries,   borderColor: '#C5E063', backgroundColor: 'rgba(197,224,99,0.10)', fill: true, tension: 0.35, borderWidth: 2.2, pointRadius: 0, yAxisID: 'y' },
      { label: 'New / mo',    data: newSeries,   borderColor: '#B8B3A6', borderWidth: 1.2, pointRadius: 0, fill: false, tension: 0.3, yAxisID: 'y1', borderDash: [3, 3] },
      { label: 'Expansion',   data: expSeries,   borderColor: '#82C99B', borderWidth: 1.2, pointRadius: 0, fill: false, tension: 0.3, yAxisID: 'y' },
      { label: 'Churn logos', data: churnSeries, borderColor: '#D96C5E', borderWidth: 1.2, pointRadius: 0, fill: false, tension: 0.3, yAxisID: 'y1', borderDash: [2, 2] }
    ];
    ch.update('none');
  }

  // ACQUISITION: CAC payback bars
  if (document.getElementById('c-acq-payback')) {
    const ch = ensureChart('c-acq-payback', {
      type: 'bar',
      data: { labels: [], datasets: [] },
      options: baseChartOptions({ indexAxis: 'y' })
    });
    const labelsC = CHANNELS.map(c => c.name);
    const paybacks = CHANNELS.map(c => c.cac / (blendedArpa * grossMargin));
    const colors = paybacks.map(p => p <= 12 ? '#82C99B' : p <= 18 ? '#E89F4A' : '#D96C5E');
    ch.data.labels = labelsC;
    ch.data.datasets = [{ data: paybacks, backgroundColor: colors, borderRadius: 3, barThickness: 16 }];
    ch.options.scales.x.title = { display: true, text: 'Payback (months)', font: { size: 10 }, color: '#7A766B' };
    ch.update('none');
  }

  // MONETIZATION: stacked MRR composition
  if (document.getElementById('c-mon-stack')) {
    const ch = ensureChart('c-mon-stack', {
      type: 'bar',
      data: { labels: [], datasets: [] },
      options: baseChartOptions({
        scales: {
          x: { stacked: true, grid: { color: 'rgba(255,255,255,0.04)' }, ticks: { font: { size: 9 } } },
          y: { stacked: true, grid: { color: 'rgba(255,255,255,0.04)' }, ticks: { font: { size: 9 } } }
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
  if (document.getElementById('c-mon-mix')) {
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
  if (document.getElementById('c-ret-trend')) {
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
      nrrSeries.push(Math.pow(nr_monthly(expMo, contract, revChurn), m / 12));
      grrSeries.push(Math.pow(1 - revChurn, m));
    }
    ch.data.labels = labels.slice(0, 12);
    ch.data.datasets = [
      { label: 'NRR', data: nrrSeries, borderColor: '#82C99B', backgroundColor: 'rgba(130,201,155,0.08)', fill: true, tension: 0.3, borderWidth: 2, pointRadius: 0 },
      { label: 'GRR', data: grrSeries, borderColor: '#E89F4A', borderWidth: 1.5, pointRadius: 0, tension: 0.3, borderDash: [4, 3] }
    ];
    ch.update('none');
  }

  // UNIT ECON: LTV:CAC by channel
  if (document.getElementById('c-ue-ratio')) {
    const ch = ensureChart('c-ue-ratio', {
      type: 'bar',
      data: { labels: [], datasets: [] },
      options: baseChartOptions({ indexAxis: 'y' })
    });
    const labelsC = CHANNELS.map(c => c.name);
    const ratios = CHANNELS.map(c => ltv / c.cac);
    const colors = ratios.map(r => r >= 3 ? '#82C99B' : r >= 1.5 ? '#E89F4A' : '#D96C5E');
    ch.data.labels = labelsC;
    ch.data.datasets = [{ data: ratios, backgroundColor: colors, borderRadius: 3, barThickness: 16 }];
    ch.options.scales.x.title = { display: true, text: 'LTV : CAC (x)', font: { size: 10 }, color: '#7A766B' };
    ch.update('none');
  }

  // UNIT ECON: CAC Payback by channel
  if (document.getElementById('c-ue-payback')) {
    const ch = ensureChart('c-ue-payback', {
      type: 'bar',
      data: { labels: [], datasets: [] },
      options: baseChartOptions({ indexAxis: 'y' })
    });
    const labelsC = CHANNELS.map(c => c.name);
    const paybacks = CHANNELS.map(c => c.cac / (blendedArpa * grossMargin));
    const colors = paybacks.map(p => p <= 12 ? '#82C99B' : p <= 18 ? '#E89F4A' : '#D96C5E');
    ch.data.labels = labelsC;
    ch.data.datasets = [{ data: paybacks, backgroundColor: colors, borderRadius: 3, barThickness: 16 }];
    ch.options.scales.x.title = { display: true, text: 'Months', font: { size: 10 }, color: '#7A766B' };
    ch.update('none');
  }

  // ML FORECAST chart (90-day projection with bands)
  if (document.getElementById('c-ml-forecast')) {
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
    let mrrSim = mrr;
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
