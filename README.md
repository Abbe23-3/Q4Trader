# Q4Trader

Institutional-grade equity valuation and scenario modeling engine designed to replicate professional investment analysis workflows.

---

## Overview

Q4Trader is a structured equity valuation platform built to translate operating assumptions into disciplined valuation outputs. The application formalizes how professional investors bridge enterprise value, capital structure, and equity pricing through a transparent EV/EBITDA framework.

The system connects:

- Operating performance (EBITDA)
- Capital structure (Net Debt)
- Market regime assumptions (valuation multiples)

to derive scenario-based equity value outcomes and implied share prices.

The objective is not simply to compute valuation metrics, but to encode institutional underwriting logic into a clean, reproducible interface aligned with buy-side and advisory workflows.

---

## Core Capabilities

### 1. Enterprise Valuation Framework
- Real-time EV/EBITDA computation
- Market Cap and Enterprise Value derivation
- Free Cash Flow yield calculation
- Net Debt / EBITDA leverage monitoring

### 2. Scenario Modeling
- Bull / Base / Bear multiple scenarios
- Instant implied equity value and share price recalculation
- Explicit downside protection (equity floor at zero)

### 3. Forward Projection Engine
- EBITDA growth assumption modeling
- Debt paydown (deleveraging) modeling
- Forward re-rating analysis
- Forward scenario implied price outputs

### 4. Multiple Sensitivity Analysis
- EV/EBITDA multiple sweep (5x–15x)
- Dynamic equity re-pricing visualization
- Interactive institutional-style chart (Recharts)

### 5. Research Export
- Automated multi-page PDF generation
- Clean A4 layout with margins and title formatting
- Scenario outputs suitable for investment discussion

---

## Financial Methodology

Q4Trader follows an enterprise-value-first valuation structure.

### Enterprise Value

Enterprise Value is calculated as:

EV = Market Capitalization + Net Debt

EV/EBITDA is used as the primary valuation anchor due to capital structure neutrality and comparability across companies.

### Equity Bridge

Implied equity value is derived as:

Implied Enterprise Value = Multiple × EBITDA  
Implied Equity Value = Implied Enterprise Value − Net Debt  
Implied Share Price = Implied Equity Value / Shares Outstanding  

Negative equity scenarios are floored at zero to reflect economic reality.

### Forward Re-Rating Logic

Forward EBITDA and forward net debt assumptions are used to evaluate:

- Operating expansion
- Balance sheet deleveraging
- Potential multiple expansion or compression
- Equity accretion under improved fundamentals

This mirrors how private equity underwriting and hedge fund re-rating theses are structured.

---

## Technology Stack

- React (functional architecture)
- Vite (build tooling)
- Recharts (valuation sensitivity visualization)
- jsPDF (research report generation)
- html2canvas (dashboard capture for PDF export)

Financial logic is fully separated from UI components to maintain modeling clarity and extensibility.

---

## Strategic Intent

Q4Trader was built to demonstrate:

- Structured valuation thinking
- Scenario-driven risk framing
- Capital structure awareness
- Assumption transparency
- Communication-ready outputs

The architecture reflects how valuation work is performed in investment banking, private equity screening, and fundamental hedge fund analysis.

---

## Planned Enhancements

- AI-assisted earnings report parsing and KPI extraction
- Multi-year integrated financial projection engine
- Monte Carlo valuation simulations
- Institutional dark-mode analytical interface
- Comparable company benchmarking module

---

## Disclaimer

This tool is for educational and analytical demonstration purposes only and does not constitute investment advice.
