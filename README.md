# Semillero de Programación Competitiva · Universidad EIA (2027-01)

Plataforma web interactiva y autocontenida de entrenamiento algorítmico de **16 semanas** diseñada para los equipos de programación competitiva de la **Universidad EIA** en su preparación rumbo a las maratones regionales **CCPL** e **ICPC Colombia**.

El repositorio unifica en un solo entorno offline/web cuatro textos canónicos de algoritmos y programación competitiva junto con guías ampliadas, **16 simuladores visuales paso a paso**, **17 presentaciones de clase**, un banco de **92 ejercicios de UVa Online Judge** con seguimiento local y **32 soluciones verificadas** en **C++17, Java y Python 3**.

---

## Resumen en cifras

| Recurso | Cantidad | Descripción |
| :--- | :---: | :--- |
| **Módulos temáticos** | 4 | Fundamentos y Estructuras · Paradigmas · Grafos · Matemáticas, Cadenas, Geometría y Simulacro |
| **Semanas de entrenamiento** | 16 | Guía ampliada por semana con teoría, trazas, plantillas, trampas y taller |
| **Presentaciones de clase** | 17 | 1 presentación general (`24` diapositivas) + 16 clases semanales (`10` diapositivas c/u) |
| **Simuladores interactivos** | 16 + 2 labs | 1 simulador paso a paso por semana + Laboratorio Big-O + Simulador de presupuesto `10⁸ ops/s` |
| **Banco de ejercicios UVa** | 92 | Problemas estrella (`*`) de *Competitive Programming 3* con progreso en `localStorage` |
| **Soluciones comentadas** | 32 | 2 problemas resueltos por semana con análisis, casos de prueba y código en C++17, Java y Python 3 |
| **Biblioteca base (PDF)** | 4 libros | 2.297 páginas de referencia local integradas por capítulo en cada semana |
| **Dependencias en ejecución** | 0 | HTML5, CSS3 y JavaScript puro; funciona directo por `file://` o `http://` sin build ni backend |

---

## Estructura de la aplicación

### 1. Plataforma principal ([index.html](index.html))

Aplicación de una sola página con navegación por pestañas (con soporte de rutas por hash como `#semanas/4` o `#soluciones/573`), tema claro/oscuro, diseño responsivo, soporte de impresión y seis vistas integradas:

0. **Inicio (`#inicio`)**
   - Portada del ciclo `2027-01` con acceso rápido a la última semana visitada (**Continuar Semana XX**).
   - Barra de progreso global sobre los **92 ejercicios UVa** completados.
   - Mapa interactivo de los **4 módulos** con avance parcial por bloque.
   - **Glosario competitivo** desplegable (`UVa / VJudge`, `uHunt`, veredictos `AC/WA/TLE/RTE/PE`, `Big-O`, `BSTA`, `DSU`, `BIT`, `Segment Tree`, `DP`, `MST`, `SCC`, `Max-Flow Min-Cut`, `KMP`, `Convex Hull`).

1. **Plan 16 Semanas (`#semanas`)**
   - Navegación **maestro-detalle** con panel lateral agrupado por módulo, buscador en tiempo real (por tema, algoritmo o ID de UVa) y filtro por módulo (`M1`–`M4`).
   - Selector global de lenguaje (**C++17**, **Java**, **Python 3**) sincronizado en toda la app.
   - Cada semana incluye: objetivo, motivación comparativa, desarrollo teórico, tabla de referencia, traza paso a paso, **simulador interactivo embebido** (y **Laboratorio Big-O** en la Semana 01), plantilla copiable, trampas frecuentes, lecturas asignadas de los 4 libros, ejercicios teóricos, enlace directo a su presentación de 10 diapositivas y taller de ejercicios UVa.

2. **Ejercicios UVa (`#ejercicios`)**
   - Catálogo completo de **92 problemas UVa** curados a partir de los problemas estrella de *CP3*.
   - Filtros combinables por **módulo**, **dificultad** (`Fácil`, `Media`, `Difícil`), **estado** (`Todos`, `Pendientes`, `Completados`, `Con solución aquí`) y búsqueda por ID, nombre o pista.
   - Casillas de verificación con guardado automático en `localStorage`, barra de progreso y botón **Reiniciar marcas** con notificación de **Deshacer** (*undo toast*).
   - Enlaces directos al enunciado en **PDF de UVa Online Judge**, envío en **VJudge** y, para los 32 resueltos, acceso directo al código dentro de la plataforma.

3. **Soluciones UVa (`#soluciones`)**
   - Vista maestro-detalle con las **32 soluciones verificadas** (2 por semana).
   - Incluye complejidad de tiempo y espacio, resumen del problema, idea clave y trampas frecuentes, *Sample Input / Sample Output*, enlace directo a la diapositiva de clase correspondiente y código listo para juez en **C++17, Java y Python 3** con botón de copiado rápido.

4. **Biblioteca (`#libros`)**
   - Fichas de los **4 libros base en PDF** con sus autores, número de páginas, rol pedagógico dentro del semillero, mapeo de capítulos por semana y apertura directa del PDF local.
   - Estrategia semanal de estudio en 4 fases: *Intuición (20 min)* → *Clase semanal (120 min)* → *Práctica UVa (3–4 h)* → *Profundización (opcional)*.

5. **Referencia Rápida (`#referencia`)**
   - **Simulador interactivo de complejidad (`#cplx-lab`)**: permite variar `N` y observar qué complejidades obtienen `AC` o `TLE` bajo la regla práctica de `~10⁸ ops/s` en C++ (`~10⁷ ops/s` en Python).
   - Tabla de referencia `N máximo → complejidad viable → técnicas típicas` (desde `N ≤ 10` hasta `N ≤ 10¹⁸`).
   - **Plantillas base de E/S rápida** copiables en C++17, Java y Python 3.
   - **Checklist pre-envío** interactivo y persistente para prevenir errores clásicos (`overflow`, casos borde, limpieza de globales, formato de salida y presupuesto de operaciones).

---

### 2. Presentaciones de clase ([presentacion.html](presentacion.html) y [semanas/](semanas/))

- **Presentación general ([presentacion.html](presentacion.html)) — 24 diapositivas:**
  Cubre la visión general del semillero, los 4 libros base, el mapa de las 16 semanas, la regla de complejidad y plantilla base, una ficha resumen por cada una de las 16 semanas, el flujo de trabajo ICPC, diagnóstico de veredictos (`WA`, `TLE`, `RTE`, `PE`), lista de verificación del semestre y accesos directos.
- **16 presentaciones semanales ([semanas/semana01.html](semanas/semana01.html) – [semanas/semana16.html](semanas/semana16.html)) — 10 diapositivas c/u:**
  Diseñadas para proyectarse en sesiones guiadas de 120 minutos. Cada deck incluye:
  - Selector de lenguaje (`C++17`, `Java`, `Python 3`) sincronizado entre diapositivas.
  - Simulador visual interactivo embebido en la diapositiva de traza.
  - Modal de **Índice** de diapositivas, modo **Pantalla completa**, cambio de tema claro/oscuro, gestos táctiles (*swipe*) en dispositivos móviles y estilos `@media print` para exportar a PDF.

---

### 3. Motor de simuladores y laboratorios ([assets/simulador.js](assets/simulador.js) y [assets/simulador.css](assets/simulador.css))

Motor 100% offline sin librerías externas que renderiza visualizaciones en **SVG** sincronizadas con:
- **Controles de reproducción**: paso anterior/siguiente, *Play/Pause*, velocidad ajustable y reinicio.
- **Datos editables y *presets***: casos de clase y casos trampa precargados, además de campos para probar entradas personalizadas.
- **Trazado en vivo**: línea de pseudocódigo resaltada, panel de variables de estado, explicación didáctica en cada paso y tabla histórica de la traza.
- **Laboratorio Big-O** (integrado en la Semana 01): 4 pestañas interactivas con navegación por teclado WAI-ARIA:
  1. *Qué es Big-O (`O`, `Ω`, `Θ`)*
  2. *Código → Big-O paso a paso*
  3. *Curvas de crecimiento y regla `10⁸ ops/s`*
  4. *Mini-Reto interactivo (5 preguntas con retroalimentación)*

---

## Plan de estudios: 16 semanas, simuladores y soluciones UVa

### Módulo 1 · Fundamentos y Estructuras de Datos (Semanas 1–4)

| Sem. | Tema | Simulador interactivo | Ej. UVa | Soluciones comentadas (C++17 / Java / Python 3) |
| :---: | :--- | :--- | :---: | :--- |
| **01** | Introducción, E/S Rápida, Ad Hoc y Complejidad | UVa 573 — The Snail + Laboratorio Big-O | 6 | `UVa 573` The Snail · `UVa 11799` Horror Dash |
| **02** | Ordenamiento, Búsqueda Binaria y Divide y Vencerás | UVa 11413 — Búsqueda Binaria sobre la Respuesta (BSTA) | 5 | `UVa 11413` Fill the Containers · `UVa 10341` Solve It |
| **03** | Estructuras Lineales, Conjuntos, Mapas, Heaps y Bits | UVa 10107 — Mediana Dinámica con Dos Heaps (`lo` / `hi`) | 6 | `UVa 10107` What is the Median? · `UVa 10038` Jolly Jumpers |
| **04** | Union-Find (DSU), Fenwick Tree (BIT) y Segment Tree | Fenwick Tree (BIT) — Saltos binarios con `LSOne(i) = i & -i` | 6 | `UVa 11503` Virtual Friends · `UVa 12086` Potentiometers |

### Módulo 2 · Paradigmas de Resolución (Semanas 5–8)

| Sem. | Tema | Simulador interactivo | Ej. UVa | Soluciones comentadas (C++17 / Java / Python 3) |
| :---: | :--- | :--- | :---: | :--- |
| **05** | Búsqueda Completa, Backtracking y Podas | UVa 624 — Árbol de Backtracking con Podas (CD) | 6 | `UVa 624` CD · `UVa 10976` Fractions Again?! |
| **06** | Algoritmos Voraces (Greedy) y Argumentos de Intercambio | UVa 12405 — Cobertura Voraz de Campo (Scarecrow) | 5 | `UVa 11389` The Bus Driver Problem · `UVa 12405` Scarecrow |
| **07** | Programación Dinámica I: Subproblemas, Range Sum, LIS y Coin Change | UVa 357 — Coin Change Conteo (DP 1D por moneda) | 6 | `UVa 357` Let Me Count The Ways · `UVa 10684` The Jackpot |
| **08** | Programación Dinámica II: Knapsack 0-1, Edit Distance y DP con Bitmask | UVa 10192 — Tabla LCS 2D y Reconstrucción Paso a Paso | 6 | `UVa 10496` Collecting Beepers · `UVa 10192` Vacation |

### Módulo 3 · Algoritmos sobre Grafos (Semanas 9–12)

| Sem. | Tema | Simulador interactivo | Ej. UVa | Soluciones comentadas (C++17 / Java / Python 3) |
| :---: | :--- | :--- | :---: | :--- |
| **09** | Recorridos en Grafos: DFS, BFS, Flood Fill, Bipartitos y Toposort | UVa 10305 — Orden Topológico con Algoritmo de Kahn (BFS) | 6 | `UVa 10004` Bicoloring · `UVa 10305` Ordering Tasks |
| **10** | Conectividad Avanzada (Puentes, Articulaciones, SCC) y MST | UVa 11631 — Árbol de Expansión Mínima (Kruskal + DSU) | 6 | `UVa 11631` Dark Roads · `UVa 11838` Come and Go |
| **11** | Caminos Más Cortos: Dijkstra, Bellman-Ford y Floyd-Warshall | UVa 10986 — Algoritmo de Dijkstra (Relajación y Obsoletas) | 6 | `UVa 10986` Sending email · `UVa 558` Wormholes |
| **12** | Flujo Máximo, Emparejamiento Bipartito y Grafos Especiales (DAG/Árboles) | UVa 820 — Flujo Máximo (Edmonds-Karp) y Corte Mínimo | 5 | `UVa 820` Internet Bandwidth · `UVa 10285` Longest Run on a Snowboard |

### Módulo 4 · Matemáticas, Cadenas, Geometría y Simulacro (Semanas 13–16)

| Sem. | Tema | Simulador interactivo | Ej. UVa | Soluciones comentadas (C++17 / Java / Python 3) |
| :---: | :--- | :--- | :---: | :--- |
| **13** | Teoría de Números: Primos, Criba, Euclides y Aritmética Modular | UVa 374 — Exponenciación Binaria Modular (`B^P mod M`) | 6 | `UVa 374` Big Mod · `UVa 543` Goldbach's Conjecture |
| **14** | Combinatoria, Probabilidad, Detección de Ciclos y Teoría de Juegos | UVa 350 — Algoritmo de Floyd (Tortuga y Liebre) | 6 | `UVa 350` Pseudo-Random Numbers · `UVa 10491` Cows and Cars |
| **15** | Procesamiento de Cadenas: KMP, Z-Algorithm, Hashing, Trie y Suffix Array | UVa 10298 — Función Prefijo `π` de KMP y Periodo Mínimo | 6 | `UVa 10298` Power Strings · `UVa 10252` Common Permutation |
| **16** | Geometría Computacional, NP-Completitud y Simulacro ICPC | UVa 10065 — Shoelace + Andrew's Monotone Chain | 5 | `UVa 10065` Useless Tile Packers · `UVa 920` Sunny Mountains |

---

## Biblioteca base incluida

| Sigla | Libro | Autores | Págs. | Rol en el semillero | Archivo |
| :---: | :--- | :--- | :---: | :--- | :--- |
| **CP3** | *Competitive Programming 3* | Steven Halim & Felix Halim | 448 | Columna vertebral y banco de problemas UVa | `competitive_programming_3 (1).pdf` |
| **CPH** | *Competitive Programmer's Handbook* | Antti Laaksonen (2018) | 296 | Implementación moderna y concisa en C++ | `book.pdf` |
| **Skiena** | *The Algorithm Design Manual (2nd ed.)* | Steven S. Skiena (Springer, 2008) | 739 | Modelado de problemas reales y catálogo de 75 problemas | `The Algorithm Design Manual 2nd edition  by Steven S. Skiena (1).pdf` |
| **Erickson** | *Algorithms (UIUC Lecture Notes)* | Jeff Erickson (1999–2011) | 814 | Rigor formal, inducción, recurrencias y demostraciones | `Algorithms.pdf` |

---

## Atajos de teclado

### En presentaciones (`presentacion.html` y `semanas/semanaXX.html`)
- `→` / `PageDown` / `Espacio`: avanzar a la siguiente diapositiva (o *Play/Pause* si hay un simulador activo en esa diapositiva).
- `←` / `PageUp`: volver a la diapositiva anterior.
- `Home` / `End`: ir a la primera o última diapositiva.
- `I`: abrir el índice rápido de diapositivas.
- `F`: alternar pantalla completa.
- `[` / `]`: paso anterior / siguiente en el simulador de la diapositiva actual.

### En la plataforma principal (`index.html`)
- `[` / `]`: paso anterior / siguiente en el simulador activo dentro de **Plan 16 Semanas**.
- `←` / `→` / `Home` / `End`: navegar entre las pestañas del **Laboratorio Big-O** cuando tienen foco.

---

## Persistencia local y características técnicas

La aplicación no requiere servidor ni base de datos. Todo el estado del usuario se guarda en el navegador mediante `localStorage`:

| Clave `localStorage` | Propósito |
| :--- | :--- |
| `semillero-done-uva` | Lista de IDs UVa marcados como resueltos (de los 92 ejercicios) |
| `semillero-lang` | Lenguaje preferido para plantillas y soluciones (`cpp`, `java`, `py`) |
| `semillero-last-week` | Última semana consultada (alimenta la tarjeta «Continuar» en Inicio) |
| `semillero-last-sol` | Última solución UVa abierta |
| `semillero-ref-check` | Estado del checklist pre-envío en Referencia Rápida |
| `semillero-pres-check` | Estado de la lista de verificación en `presentacion.html` |
| `semillero-check-s01` … `s16` | Estado del taller/checklist individual en cada presentación semanal |
| `tema-semillero` | Preferencia de tema visual (`light` / `dark`, con respaldo en `prefers-color-scheme`) |

**Características adicionales:**
- **100 % offline-first**: iconos SVG inline, logos y favicon embebidos en Base64 y fuentes con respaldo del sistema (`Exo` / `Roboto Mono` con *fallback* a fuentes nativas si no hay internet).
- **Accesibilidad**: enlaces «Saltar al contenido», regiones `aria-live`, roles WAI-ARIA en pestañas y diálogos, soporte para `prefers-reduced-motion` y áreas táctiles ampliadas en pantallas móviles.
- **Impresión / PDF**: estilos `@media print` en `index.html`, `presentacion.html` y las 16 presentaciones semanales para imprimir guías, cuadernos (*Team Reference Document / Notebook*) o diapositivas.

---

## Estructura del repositorio

```text
.
├── index.html                    # Plataforma principal (6 vistas, 92 ejercicios, 32 soluciones)
├── presentacion.html             # Presentación general del programa (24 diapositivas)
├── semanas/
│   ├── semana01.html             # Presentación Semana 01 (10 diapositivas + simulador + Big-O Lab)
│   ├── ...
│   └── semana16.html             # Presentación Semana 16 (10 diapositivas + simulador)
├── assets/
│   ├── simulador.js              # Motor de los 16 simuladores SVG + Big-O Lab + Complexity Lab
│   └── simulador.css             # Estilos de simuladores y laboratorios (claro/oscuro)
├── PRODUCT.md                    # Especificación de producto, principios y alcance
├── README.md                     # Documentación general del proyecto
├── competitive_programming_3 (1).pdf
├── book.pdf
├── The Algorithm Design Manual 2nd edition  by Steven S. Skiena (1).pdf
└── Algorithms.pdf
```

---

## Cómo ejecutar la aplicación

### Opción 1: Abrir directamente en el navegador (sin instalar nada)
1. Clona o descarga el repositorio:
   ```bash
   git clone https://github.com/sebastianzapatar/semillero2027.git
   cd semillero2027
   ```
2. Abre `index.html` (o `presentacion.html`) haciendo doble clic o arrastrándolo a tu navegador. Todos los simuladores, filtros, soluciones y enlaces locales funcionan directamente sobre `file://`.

### Opción 2: Servir localmente por HTTP
Si prefieres ejecutarlo mediante un servidor local:

```bash
# Con Python 3
python3 -m http.server 8000
```
Luego abre [http://localhost:8000](http://localhost:8000) en tu navegador.

### Opción 3: GitHub Pages
Al ser un sitio completamente estático con `index.html` en la raíz, puede publicarse directamente activando **Settings → Pages → Deploy from a branch (`main` / `/ (root)`)** en GitHub.

---

## Licencia y uso académico

Material estructurado con fines académicos y de entrenamiento para el **Semillero de Programación Competitiva · Universidad EIA**. Los textos de referencia en PDF corresponden a sus respectivos autores y editoriales; si se despliega públicamente, verifica los derechos de distribución de los archivos PDF incluidos.
