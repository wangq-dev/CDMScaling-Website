# CDM Scaling — What Transfers from Text to Vision?

Paper project website for **What Transfers from Text to Vision? Capability Scaling Laws and Transfer Dynamics for VLMs** (arXiv:2608.00013), using the author-supplied revised PDF.

The website presents the capability-driven scaling law, an interactive explanation of transfer and absorption, original paper figures, scale and family holdout results, transfer-tax findings, Base/Instruct and family comparisons, batch-size extrapolation, and BibTeX. Author order and affiliations follow the paper.

## Develop and validate

Requires Node.js 22 and npm.

```bash
npm ci
npm run dev
npm run lint
npx tsc --noEmit
npm run build
```

The production build exports static HTML to `out/`. The existing GitHub Pages workflow supports deployment under a repository base path. For a local build with a prefix, set both `PAGES_BASE_PATH` and `NEXT_PUBLIC_BASE_PATH` to the same value.

## Main files

- `components/research/ResearchPage.tsx`: paper narrative and original figures.
- `components/research/ResearchInteractions.tsx`: formula explorer and citation copy.
- `components/research/MathFormula.tsx`: KaTeX formula rendering.
- `lib/research-data.ts`: sourced paper values, authors, resource URLs, and citation.
- `app/research.css`: responsive project-page design.
- `public/research/`: Figures 2–6 used by the page (the introduction displays the text–vision correlation from Appendix A.1, Figure 6). Paper buttons link to arXiv; no local paper PDF is bundled.
