# SaaS Scenario Builder

An interactive SaaS scenario builder demonstrating data analytics leadership for a Director-level interview. Models acquisition, monetization, retention, and unit economics with a production-style ML overlay — every input is live, every chart recomputes in real time.

**Live demo:** open `index.html` in any modern browser, or deploy to GitHub Pages.

---

## What this is

A single-page web app that mirrors how an executive-grade BI tool actually behaves: a left navigation pane, six focused views, a consistent visual system, and a model that drives every number you see on the screen.

The six views map to the metric families a Director of Data Analytics owns:

| # | View | What it shows |
|---|---|---|
| 01 | **Overview** | The six headline KPIs (ARR, ARPA, LTV, CAC, Churn, AOV) plus a composite ribbon (LTV:CAC, Payback, NRR, GRR, Rule of 40, Magic Number) and a 24-month ARR / customer stock chart |
| 02 | **Acquisition** | Six-channel mix with editable CAC and spend, three-stage funnel sliders, a live visitor → paid funnel viz, and CAC payback by channel |
| 03 | **Monetization** | ARPA, AOV, annual contract mix, expansion sliders driving a 24-month stacked MRR composition and annual vs. monthly mix |
| 04 | **Retention** | Logo churn, revenue churn, contraction and winback feeding an 8 × 8 cohort retention heatmap and NRR / GRR trend |
| 05 | **Unit Economics** | LTV, CAC, ratio and payback at the portfolio level plus per-channel breakdowns |
| 06 | **Predictive · ML** | Production model cards (Churn, LTV, Demand, Anomaly) with method, performance metrics and re-train cadence, plus a 90-day MRR forecast with P10 / P90 prediction bands |

The **ML toggle** in the sidebar footer swaps flat assumptions for model-driven inputs across every view. Churn drops to reflect proactive CSM triggers; LTV uses BG/NBD probabilistic CLV rather than ARPA × GM / churn.

---

## Why this exists

The role definition for Director of Data Analytics roles in SaaS typically calls out the same six KPIs: LTV, CAC, ARR, ARPA, Churn, AOV. Saying you understand them is one thing. Walking a hiring manager through a working tool that recomputes them under different assumptions, with the composite ratios a CFO actually opens a dashboard to see, is another.

This app demonstrates four competencies at once:

1. **SaaS metric fluency** — every KPI from the standard Director-of-Data role description, rendered with benchmarks
2. **Predictive modeling** — four production models with documented methods (XGBoost, BG/NBD + Gamma-Gamma, Prophet, Isolation Forest)
3. **BI / dashboard design** — opinionated information hierarchy, color-coded thresholds, drill-down navigation
4. **Translating data into business decisions** — every view ends with a strategic read, not just numbers

The stack referenced in the footer — **Snowflake** for warehousing, **DBT** for transformation, **Looker** for exposure, **Python** for modeling — matches what most SaaS data orgs actually run in production.

---

## Running locally

No build step. No dependencies to install. Open the file:

```bash
git clone <this-repo>
cd saas-scenario-builder
open index.html        # macOS
# or simply double-click index.html
```

For local server (some browsers restrict file:// for fetch):

```bash
python3 -m http.server 8000
# then visit http://localhost:8000
```

### Deploying to GitHub Pages

1. Push the repo to GitHub.
2. Repo **Settings → Pages → Source → Deploy from a branch**.
3. Choose `main` (or `master`) and `/ (root)`.
4. Save. Your app will be live at `https://<your-username>.github.io/<repo-name>/`.

URL hashes (`#overview`, `#acquisition`, etc.) are deep-linkable.

---

## Project structure

```
saas-scenario-builder/
├── index.html      # Layout, styles, six routed views
├── app.js          # Router, calc engine, chart rendering
├── README.md       # This file
├── LICENSE         # MIT
└── .gitignore
```

Single-page app. No framework. All state lives in memory and recomputes on input.

**External dependencies (CDN, loaded at runtime):**
- Chart.js 4.4.1 — charts
- Google Fonts (Fraunces, Inter Tight, JetBrains Mono) — typography

---

## How the model works

### Acquisition

```
new_logos_per_channel = (spend / cac) × funnel_lift
funnel_lift           = (visitor→signup × signup→trial × trial→paid) / baseline_funnel
blended_cac           = total_spend / sum(new_logos_per_channel)
```

### Monetization

```
blended_arpa = arpa × (1 - annual_share) + (aov / 12) × annual_share
```

The 24-month stock simulation accrues:

```
customers_{t+1} = customers_t + new_logos - churned + winback × churned × 0.3
mrr_{t+1}       = mrr_t + new_mrr + expansion - revenue_churn - contraction
```

### Retention & LTV

When **ML is OFF** (flat assumptions):

```
ltv = (blended_arpa × gross_margin) / revenue_churn
```

When **ML is ON** (BG/NBD-style approximation):

```
ltv = flat_ltv × 1.18    # heterogeneity premium from probabilistic CLV
logo_churn × 0.82        # proactive CSM interventions
revenue_churn × 0.85
```

### Composite metrics

```
ltv_cac      = ltv / blended_cac
cac_payback  = blended_cac / (blended_arpa × gross_margin)
nrr          = 1 + expansion - contraction - revenue_churn
grr          = 1 - revenue_churn
rule_of_40   = trailing_growth_pct + fcf_margin_pct
magic_number = delta_arr_q / s&m_spend_prior_q
```

### Forecast (Predictive view)

```
mrr_forecast(d) = mrr_now × geometric_growth(d) × seasonality(d)
band(d)         = 0.08 × forecast(d) × √(d/30)        # widening P10/P90 with horizon
```

These are illustrative formulas to make the demo legible. A production implementation would back each one with a real model artifact stored in Snowflake and served via a DBT model + Python UDF.

---

## Design system

Built without a framework or component library. The visual language is intentional, not generic AI dashboard styling.

| Token | Value | Use |
|---|---|---|
| Background | `#0E1410` | Deep green-black, easier on the eyes than pure black |
| Panel | `#141B16` | Card surfaces |
| Accent | `#C5E063` | Single lime accent, used sparingly |
| Good / Warn / Bad | `#82C99B` / `#E89F4A` / `#D96C5E` | Threshold colors |
| ML | `#8AB4F0` | Predictive layer differentiation |
| Display font | Fraunces (italic) | Titles, brand mark |
| Body | Inter Tight | UI text |
| Numeric | JetBrains Mono | Every metric value |

---

## Possible extensions

If this were a real product:

- Wire to a Snowflake schema with `dim_customer`, `fct_revenue`, `fct_acquisition` tables and replace hardcoded channel defaults with `LISTAGG()`-pulled live data
- Persist scenarios via Snowflake stored procedures with versioning
- Replace the simulated forecast with actual Prophet output served from a UDF
- Surface model performance (AUC, MAPE) from a `model_registry` table rather than hardcoded card values
- Add a "compare scenarios" view to diff two saved scenario configs side-by-side
- Export to Looker LookML so analysts can drill down into the underlying tables

---

## License

MIT. See `LICENSE`.
