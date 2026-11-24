# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Primary users are **competitive programming teams at Universidad EIA** doing advanced preparation for regional programming marathons (**CCPL** and **ICPC Colombia**) during the 2027-01 semillero cycle.

A secondary operational context evidenced in the repository is guided weekly sessions (16 weekly 10-slide decks plus a 24-slide program overview) alongside independent team practice on UVa Online Judge / VJudge / uHunt.

## Product Purpose

Prepare Universidad EIA competitive programming teams specifically for regional marathons (**CCPL / ICPC Colombia**) through a structured 16-week syllabus organized into four progressive modules:

1. **Módulo 1 (Semanas 1–4):** Fundamentos y Estructuras de Datos (Big-O, E/S rápida, ordenamiento, BSTA, STL, DSU, Fenwick Tree, Segment Tree).
2. **Módulo 2 (Semanas 5–8):** Paradigmas de Resolución (búsqueda completa con podas, voraces, programación dinámica clásica y con bitmask).
3. **Módulo 3 (Semanas 9–12):** Algoritmos sobre Grafos (DFS/BFS, conectividad avanzada/SCC, MST, caminos más cortos, flujo máximo, DAG/árboles).
4. **Módulo 4 (Semanas 13–16):** Matemáticas, Cadenas, Geometría Computacional, NP-Completitud y simulacro estilo ICPC de 3 horas.

Success means teams complete this progression ready to recognize paradigms under contest pressure, implement bug-free solutions within judge limits, manage their Team Reference Document (Notebook), and perform effectively in CCPL / ICPC Colombia contests.

## Positioning

Unlike a loose folder of textbooks or raw online-judge problem lists, the platform unifies four canonical algorithmic texts (*Competitive Programming 3*, *Competitive Programmer's Handbook*, *The Algorithm Design Manual*, and *Algorithms* by Erickson) into one cohesive Spanish-language competitive training hub featuring:

- 16 interactive step-by-step algorithm simulators paired with each week's core topic;
- 92 curated UVa problems (CP3 star exercises) with browser-persisted progress tracking;
- 32 verified UVa solutions (2 per week) with analysis, edge cases, and implementations in C++17, Java, and Python 3;
- 17 standalone slide decks (1 general overview + 16 weekly 10-slide decks) and a contest quick-reference toolkit (complexity budget lab, fast I/O templates, verdict diagnostics, pre-submission checklist).

## Operating Context

- **Language:** Spanish (`es`), using standard competitive programming terminology (UVa, VJudge, uHunt, ICPC, CCPL, AC/WA/TLE/RTE/PE, Big-O, BSTA, DSU/UFDS, BIT, DP, MST, SCC).
- **Workflows & Rituals:** Weekly training sessions projecting slide decks (`semanas/semana01.html`–`semana16.html`), hands-on stepping through algorithm simulators (`assets/simulador.js`), judge submission practice on UVa/VJudge tracked locally in `localStorage`, assembling a printed ICPC Team Reference Document / Notebook (max 25 pages), and closing with a 3-hour ICPC-style team mock contest (3 members, 1 computer).
- **Runtime environment (current codebase):** Static HTML/CSS/JS site with no build pipeline or backend, currently engineered to run directly via `file://` or `http://` with zero runtime external JS dependencies.

## Capabilities and Constraints

### Current implemented capabilities
- Six-view hub in `index.html`: *Inicio*, *Plan 16 Semanas*, *Ejercicios UVa*, *Soluciones UVa (32)*, *Biblioteca (4 PDFs)*, and *Referencia Rápida*.
- Interactive complexity budget simulator (`#cplx-lab`), 16 weekly step-by-step visual simulators (`assets/simulador.js`), multi-language code switcher (C++17, Java, Python 3) with copy actions, light/dark theme toggle, and keyboard-driven slide navigation.
- Local progress persistence via `localStorage` for the 92 UVa exercises and checklists.

### Open decisions (not yet confirmed as hard constraints)
- **Offline `file://` portability:** Currently supported across all HTML/JS files, but not yet explicitly locked as a mandatory constraint for future work.
- **Multi-language parity (C++17, Java, Python 3):** Currently present across all templates and 32 solutions, but not yet confirmed as strictly mandatory for future additions (especially given advanced ICPC/CCPL focus where C++ often dominates).
- **Print-to-PDF slide export:** Currently supported in slide decks, not yet confirmed as a binding requirement.
- **Deployment & textbook PDF distribution:** Whether the platform stays strictly local/internal (bundled with the 4 copyrighted PDFs) or moves to public web hosting (which would require removing or replacing the bundled PDFs) remains undecided.

## Brand Commitments

- **Existing institutional references in codebase:** Named *Semillero de Programación Competitiva · Universidad EIA* (`2027-01`), with embedded base64 Universidad EIA logos/favicon linking to `https://www.eia.edu.co`.
- **Open decision:** Whether the Universidad EIA name and logo are strictly binding institutional commitments for future surfaces has not been explicitly confirmed.

## Evidence on Hand

- `index.html`: Complete 16-week hub, 92 UVa exercises, 32 verified solutions in C++17/Java/Python 3, complexity table and interactive lab, fast I/O templates, glossary, and pre-submission checklist.
- `presentacion.html`: 24-slide general program presentation (including ICPC 6-step workflow, verdict diagnostics, and semester milestones).
- `semanas/semana01.html` – `semanas/semana16.html`: 16 standalone 10-slide weekly class decks.
- `assets/simulador.js` & `assets/simulador.css`: Offline interactive step-by-step simulator engine covering Weeks 1–16.
- Local reference textbook PDFs (2,297 pages total):
  - `competitive_programming_3 (1).pdf` — *Competitive Programming 3* (Steven & Felix Halim, 448 pp.)
  - `book.pdf` — *Competitive Programmer's Handbook* (Antti Laaksonen, 296 pp.)
  - `The Algorithm Design Manual 2nd edition  by Steven S. Skiena (1).pdf` — *The Algorithm Design Manual* (Steven S. Skiena, 739 pp.)
  - `Algorithms.pdf` — *Algorithms* (Jeff Erickson, 814 pp.)
- **Absences future work must not fabricate:** No historical CCPL/ICPC rankings, team win records, student testimonials, cohort headcounts, official contest dates, or live hosting URLs exist in the repository.

## Product Principles

1. **Train for CCPL and ICPC Colombia competition reality:** Optimize every workflow for fast paradigm identification, tight complexity estimation (`N` → target Big-O), verdict debugging, and 3-person/1-computer team execution.
2. **Bridge formal algorithms and judge-ready code:** Pair intuition and mathematical rigor directly with step-by-step traces, pitfalls, and verified implementations ready for online judges.
3. **Keep training tools frictionless and self-contained:** Let teams move seamlessly between syllabus topics, textbooks, interactive simulators, templates, and exercise tracking without losing focus.
4. **Stay strictly grounded in real training evidence:** Base problem lists, readings, and solutions on verified UVa IDs and bundled references; never invent contest outcomes, metrics, or testimonials.
