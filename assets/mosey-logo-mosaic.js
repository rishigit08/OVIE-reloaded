/* Mosey logo intro: a mosaic of policy tiles leaves an M-shaped gap, the gap fills
   tile by tile (top row first, left to right), each logo piece fuses solid, then the
   mosaic recedes and the wordmark lands. Splash / brand intro only (DESIGN.md §11).
   Two marks share the engine: mountMoseyLogo(host, { variant: 'v1' | 'v2' }). */
(() => {
  const NS = 'http://www.w3.org/2000/svg';
  const SHADES = 3;   // per family: --mm-shade-0..2 and 3..5
  const WORD = 'Mosey';
  // Policy types on the surrounding tiles (Material Symbols Outlined names).
  const ICONS = ['directions_car', 'home', 'medical_services', 'pets', 'flight', 'directions_boat', 'two_wheeler', 'apartment',
    'business_center', 'local_shipping', 'umbrella', 'favorite', 'engineering', 'storefront', 'agriculture', 'diamond'];
  const ICON_SIZE = 3.4;
  const FLIPPED = new Set(['umbrella']); // the glyph hangs handle-up; turned so it stands upright

  function roundedPath(pts, r) {
    const n = pts.length, sub = (p, q) => [p[0] - q[0], p[1] - q[1]], len = v => Math.hypot(v[0], v[1]);
    const corner = i => {
      const p = pts[i], a = pts[(i + n - 1) % n], c = pts[(i + 1) % n];
      const va = sub(a, p), vc = sub(c, p), ra = Math.min(r, len(va) / 2), rc = Math.min(r, len(vc) / 2);
      return { p, from: [p[0] + va[0] / len(va) * ra, p[1] + va[1] / len(va) * ra], to: [p[0] + vc[0] / len(vc) * rc, p[1] + vc[1] / len(vc) * rc] };
    };
    const f = v => +v.toFixed(3);
    return pts.map((_, i) => corner(i)).map((c, i) => `${i ? 'L' : 'M'}${f(c.from[0])} ${f(c.from[1])}Q${f(c.p[0])} ${f(c.p[1])} ${f(c.to[0])} ${f(c.to[1])}`).join('') + 'Z';
  }

  /* ── V1: top bar + three slanted legs ("Logo M Mosaic V1.svg") ───────────────────────── */
  const V1 = (() => {
    const GAP = 2;      // logo gutter, reused between every tile
    const TILE = 5.5;   // target mosaic tile width
    const RING = 2;     // mosaic rings around the mark
    const ROWS = [[-15, -9.5], [-7.5, -2], [0, 7], [9, 15.5], [17.5, 24], [26, 31.5], [33.5, 39]];

    // Exact paths from the SVG; the fused mark is these, untouched.
    const pieces = {
      bar: 'M19.7689 0C20.4036 0 20.8778 0.583708 20.7477 1.20497L19.7006 6.20497C19.6036 6.66821 19.1951 7 18.7218 7H4.67241C4.05721 7 3.58789 6.44977 3.68493 5.84226L4.48362 0.842262C4.56113 0.357021 4.97971 0 5.4711 0H19.7689Z',
      left: 'M8.5 23C8.5 23.5523 8.05228 24 7.5 24H1.2198C0.588758 24 0.115465 23.4227 0.239223 22.8039L2.83922 9.80388C2.93271 9.33646 3.34312 9 3.8198 9H7.5C8.05228 9 8.5 9.44772 8.5 10V23Z',
      middle: 'M10.5 10C10.5 9.44772 10.9477 9 11.5 9H17.7398C18.3839 9 18.86 9.59999 18.7136 10.2272L15.6803 23.2272C15.5747 23.6798 15.1712 24 14.7065 24H11.5C10.9477 24 10.5 23.5523 10.5 23V10Z',
      right: 'M22.3342 0.796045C22.4308 0.332326 22.8395 0 23.3131 0H25.2309C25.7853 0 26.2339 0.450996 26.2309 1.00537L26.1128 23.0054C26.1098 23.5556 25.663 24 25.1128 24H18.7298C18.0955 24 17.6215 23.417 17.7508 22.796L22.3342 0.796045Z',
    };

    // Edges as x = a + b·y, read off the straight segments of each piece.
    const line = ([x1, y1], [x2, y2]) => { const b = (x2 - x1) / (y2 - y1); return { a: x1 - b * y1, b }; };
    const shift = (l, dx) => ({ a: l.a + dx, b: l.b });
    const at = (l, y) => l.a + l.b * y;
    const EDGES = {
      bar: [line([4.48362, 0.842262], [3.68493, 5.84226]), line([20.7477, 1.20497], [19.7006, 6.20497])],
      left: [line([2.83922, 9.80388], [0.239223, 22.8039]), { a: 8.5, b: 0 }],
      middle: [{ a: 10.5, b: 0 }, line([18.7136, 10.2272], [15.6803, 23.2272])],
      right: [line([22.3342, 0.796045], [17.7508, 22.796]), line([26.2309, 1.00537], [26.1128, 23.0054])],
    };
    // The mosaic's outer silhouette echoes the mark: slanted left, upright right.
    const OUTER = [shift(EDGES.left[0], -RING * (TILE + GAP)), shift(EDGES.right[1], RING * (TILE + GAP))];
    const PIECES_IN_ROW = [[], [], ['bar', 'right'], ['left', 'middle', 'right'], ['left', 'middle', 'right'], [], []];

    // Split the band between two edges into n tiles with GAP gutters; cuts interpolate the edge slopes.
    function split(L, R, y0, y1, n) {
      const xs = y => { const w = at(R, y) - at(L, y), tw = (w - (n - 1) * GAP) / n; return i => [at(L, y) + i * (tw + GAP), at(L, y) + i * (tw + GAP) + tw]; };
      const top = xs(y0), bottom = xs(y1);
      return Array.from({ length: n }, (_, i) => [[top(i)[0], y0], [top(i)[1], y0], [bottom(i)[1], y1], [bottom(i)[0], y1]]);
    }

    // The mosaic is built like a construction: blocks of mixed sizes (1×1, wide, tall, 2×2) laid
    // on a column grid per region. Each block is [column, column span, row, row span].
    const leftWall = { at: y => (y < 8 ? at(EDGES.bar[0], y) : at(EDGES.left[0], y)) - GAP };
    const REGIONS = [
      { L: OUTER[0], R: OUTER[1], cols: 7, blocks: [[0, 1, 0, 2], [1, 2, 0, 1], [3, 1, 0, 1], [4, 1, 0, 1], [5, 2, 0, 2], [1, 1, 1, 1], [2, 2, 1, 1], [4, 1, 1, 1]] },
      { L: OUTER[0], R: OUTER[1], cols: 7, blocks: [[0, 1, 5, 1], [1, 2, 5, 2], [3, 1, 5, 1], [4, 1, 5, 1], [5, 1, 5, 2], [6, 1, 5, 1], [0, 1, 6, 1], [3, 2, 6, 1], [6, 1, 6, 1]] },
      { L: OUTER[0], R: leftWall, cols: 2, blocks: [[0, 2, 2, 1], [0, 1, 3, 2], [1, 1, 3, 1], [1, 1, 4, 1]] },
      { L: shift(EDGES.right[1], GAP), R: OUTER[1], cols: 2, blocks: [[0, 1, 2, 2], [1, 1, 2, 1], [1, 1, 3, 1], [0, 2, 4, 1]] },
    ];
    const xAt = (edge, y) => (edge.at ? edge.at(y) : at(edge, y));

    function block({ L, R, cols }, [c, cs, r, rs]) {
      const y0 = ROWS[r][0], y1 = ROWS[r + rs - 1][1];
      const span = y => {
        const l = xAt(L, y), tw = (xAt(R, y) - l - (cols - 1) * GAP) / cols, x0 = l + c * (tw + GAP);
        return [x0, x0 + cs * tw + (cs - 1) * GAP];
      };
      const [a, b] = span(y0), [d, e] = span(y1);
      return [[a, y0], [b, y0], [e, y1], [d, y1]];
    }

    function layout() {
      const mosaic = REGIONS.flatMap(region => region.blocks.map(spec => ({ parts: [block(region, spec)], icon: true })));
      const fill = [];
      ROWS.forEach(([y0, y1], row) => {
        PIECES_IN_ROW[row].forEach(piece => {
          const [L, R] = EDGES[piece];
          split(L, R, y0, y1, piece === 'bar' ? 2 : 1).forEach(pts => fill.push({ pts, row, piece }));
        });
      });
      // Reading order: top row first, left to right.
      const mid = t => t.pts.reduce((s, p) => s + p[0], 0) / 4;
      fill.sort((a, b) => a.row - b.row || mid(a) - mid(b));
      return { mosaic, fill };
    }

    return {
      pieces, layout, radius: 1, fillRadius: 1,
      center: [13, 12],          // middle of the mark; blocks gather toward it
      mark: { height: 24, bottom: 24, wordX: 32 },
      T: { mosaicStagger: 30, slots: 650, fillStart: 1000, fillStagger: 110, drop: 220, fuse: 260, resolve: 2450, settle: 2600, word: 2750 },
    };
  })();

  /* ── V2: five diamonds in a zigzag ("Mosey Logo Mosaic V2.svg") ──────────────────────── */
  const V2 = (() => {
    // The diamonds sit on a lattice: true (unrounded) diamond with half-diagonals W×H, steps U and V.
    const C0 = [17.835, 15.024], U = [6.3721, 8.0488], V = [6.3721, -8.0488], W = 5.098, H = 6.976;
    const cell = (i, j) => [C0[0] + i * U[0] + j * V[0], C0[1] + i * U[1] + j * V[1]];
    const diamond = ([x, y]) => [[x, y - H], [x + W, y], [x, y + H], [x - W, y]];

    // Exact paths from the SVG, keyed by lattice cell [i, j].
    const LOGO = {
      topLeft: [[-1, 0], 'M10.5906 12.7643C11.0185 13.3515 11.8941 13.3527 12.3236 12.7666L16.1025 7.60977C16.3793 7.23214 16.3793 6.7187 16.1025 6.34107L12.3236 1.18423C11.8941 0.598146 11.0185 0.599311 10.5906 1.18654L6.83266 6.34337C6.55818 6.72003 6.55818 7.2308 6.83266 7.60747L10.5906 12.7643Z'],
      topRight: [[0, 1], 'M23.3347 12.7643C23.7627 13.3515 24.6382 13.3527 25.0677 12.7666L28.8467 7.60977C29.1234 7.23214 29.1234 6.7187 28.8467 6.34107L25.0677 1.18423C24.6382 0.598146 23.7627 0.599311 23.3347 1.18654L19.5768 6.34337C19.3023 6.72003 19.3023 7.2308 19.5768 7.60747L23.3347 12.7643Z'],
      bottomLeft: [[-1, -1], 'M4.21853 20.8131C4.64646 21.4004 5.52202 21.4015 5.9515 20.8154L9.73048 15.6586C10.0072 15.281 10.0072 14.7675 9.73048 14.3899L5.9515 9.23306C5.52201 8.64697 4.64646 8.64814 4.21853 9.23536L0.460593 14.3922C0.186107 14.7689 0.186106 15.2796 0.460592 15.6563L4.21853 20.8131Z'],
      bottomMiddle: [[0, 0], 'M16.9627 20.8131C17.3906 21.4004 18.2662 21.4015 18.6956 20.8154L22.4746 15.6586C22.7513 15.281 22.7513 14.7675 22.4746 14.3899L18.6956 9.23306C18.2662 8.64697 17.3906 8.64814 16.9627 9.23536L13.2047 14.3922C12.9302 14.7689 12.9302 15.2796 13.2047 15.6563L16.9627 20.8131Z'],
      bottomRight: [[1, 1], 'M29.7068 20.8131C30.1347 21.4004 31.0103 21.4015 31.4398 20.8154L35.2188 15.6586C35.4955 15.281 35.4955 14.7675 35.2188 14.3899L31.4398 9.23306C31.0103 8.64697 30.1347 8.64814 29.7068 9.23536L25.9489 14.3922C25.6744 14.7689 25.6744 15.2796 25.9489 15.6563L29.7068 20.8131Z'],
    };
    const pieces = Object.fromEntries(Object.entries(LOGO).map(([k, [, d]]) => [k, d]));

    function layout() {
      const logoCells = new Set(Object.values(LOGO).map(([[i, j]]) => `${i},${j}`));
      const mosaic = [];
      for (let i = -6; i <= 6; i++) for (let j = -6; j <= 6; j++) {
        const c = cell(i, j), row = i - j;
        // The mark's bottom row (row 0) keeps open sides; everything else rings it.
        if (row < -3 || row > 2 || row === 0 || c[0] < -8 || c[0] > 44 || logoCells.has(`${i},${j}`)) continue;
        mosaic.push({ parts: [diamond(c)], icon: true });
      }
      // Fill order: top row first, left to right; each diamond drops in whole.
      const fill = ['topLeft', 'topRight', 'bottomLeft', 'bottomMiddle', 'bottomRight']
        .map(piece => ({ pts: diamond(cell(...LOGO[piece][0])), piece }));
      return { mosaic, fill };
    }

    return {
      pieces, layout, radius: 1.4, fillRadius: 1.4,
      center: [17.84, 11],
      mark: { height: 22, bottom: 22, wordX: 40.7 },
      T: { mosaicStagger: 30, slots: 600, fillStart: 900, fillStagger: 160, drop: 220, fuse: 260, resolve: 2150, settle: 2300, word: 2450 },
    };
  })();

  /* ── V3: pixel-mosaic M of 20 triangles + "Mosey" wordmark ("M Mosaic Logo + Wordmark V3.svg") ──
     The triangles (policies) gather one by one into the M, built large in the centre; the finished M
     then shrinks and moves left into its slot as the wordmark slides in beside it. */
  const V3 = {
    // Exact triangles from the SVG, as [points, tone]; tone d = #830869, b = #B52095.
    tris: [
      [[[31.3789, 22.2243], [36.2571, 18.3623], [36.2571, 22.2243]], 'd'],
      [[[26.5, 18.362], [31.3782, 14.5], [31.3782, 18.362]], 'b'],
      [[[36.2571, 22.2236], [31.3789, 22.2236], [36.2571, 26.0856]], 'b'],
      [[[31.3782, 18.3623], [26.5, 18.3623], [31.3782, 22.2243]], 'd'],
      [[[36.2568, 22.2236], [36.2568, 26.0856], [41.1351, 22.2236]], 'd'],
      [[[31.3789, 18.3623], [31.3789, 22.2243], [36.2571, 18.3623]], 'b'],
      [[[36.2568, 22.2243], [36.2568, 18.3623], [41.1351, 22.2243]], 'b'],
      [[[31.3789, 18.362], [31.3789, 14.5], [36.2571, 18.362]], 'd'],
      [[[41.1351, 18.362], [36.2568, 18.362], [41.1351, 14.5]], 'b'],
      [[[41.1351, 22.2243], [36.2568, 18.3623], [41.1351, 18.3623]], 'd'],
      [[[41.1338, 18.362], [41.1338, 14.5], [46.4999, 18.362]], 'd'],
      [[[41.1338, 22.2243], [41.1338, 18.3623], [46.4999, 18.3623]], 'b'],
      [[[46.4999, 22.2243], [41.1338, 22.2243], [46.4999, 18.3623]], 'd'],
      [[[26.5007, 22.2243], [31.3789, 22.2243], [26.5007, 18.3623]], 'b'],
      [[[46.4999, 26.0856], [41.1338, 22.2236], [46.4999, 22.2236]], 'b'],
      [[[26.5007, 26.6374], [31.3789, 22.2236], [26.5007, 22.2236]], 'd'],
      [[[46.4999, 30.4987], [41.1338, 26.085], [46.4999, 26.085]], 'b'],
      [[[31.3789, 30.4997], [31.3789, 26.6377], [26.5007, 26.6377]], 'd'],
      [[[46.4999, 26.0856], [41.1338, 22.2236], [41.1338, 26.0856]], 'd'],
      [[[26.5007, 26.6374], [31.3789, 22.2236], [31.3789, 26.6374]], 'b'],
    ],
    word: 'M54.12 29V15.86H57.612L60.906 23.708H61.23L64.506 15.86H68.052V29H65.514V17.786L65.838 17.822L62.292 26.318H59.682L56.118 17.822L56.46 17.786V29H54.12ZM75.2538 29.342C74.3898 29.342 73.6278 29.204 72.9678 28.928C72.3078 28.652 71.7498 28.28 71.2938 27.812C70.8378 27.332 70.4898 26.792 70.2498 26.192C70.0218 25.592 69.9078 24.968 69.9078 24.32V23.942C69.9078 23.27 70.0278 22.634 70.2678 22.034C70.5198 21.422 70.8738 20.882 71.3298 20.414C71.7978 19.934 72.3618 19.562 73.0218 19.298C73.6818 19.022 74.4258 18.884 75.2538 18.884C76.0818 18.884 76.8258 19.022 77.4858 19.298C78.1458 19.562 78.7038 19.934 79.1598 20.414C79.6278 20.882 79.9818 21.422 80.2218 22.034C80.4618 22.634 80.5818 23.27 80.5818 23.942V24.32C80.5818 24.968 80.4618 25.592 80.2218 26.192C79.9938 26.792 79.6518 27.332 79.1958 27.812C78.7398 28.28 78.1818 28.652 77.5218 28.928C76.8618 29.204 76.1058 29.342 75.2538 29.342ZM75.2538 27.2C75.8658 27.2 76.3818 27.068 76.8018 26.804C77.2218 26.528 77.5398 26.162 77.7558 25.706C77.9718 25.238 78.0798 24.71 78.0798 24.122C78.0798 23.522 77.9658 22.994 77.7378 22.538C77.5218 22.07 77.1978 21.704 76.7658 21.44C76.3458 21.164 75.8418 21.026 75.2538 21.026C74.6658 21.026 74.1558 21.164 73.7238 21.44C73.3038 21.704 72.9798 22.07 72.7518 22.538C72.5238 22.994 72.4098 23.522 72.4098 24.122C72.4098 24.71 72.5178 25.238 72.7338 25.706C72.9618 26.162 73.2858 26.528 73.7058 26.804C74.1258 27.068 74.6418 27.2 75.2538 27.2ZM85.7786 29.306C84.4346 29.306 83.3786 29.024 82.6106 28.46C81.8546 27.884 81.4586 27.092 81.4226 26.084H83.6726C83.7086 26.42 83.8946 26.726 84.2306 27.002C84.5666 27.278 85.0946 27.416 85.8146 27.416C86.4146 27.416 86.8886 27.308 87.2366 27.092C87.5966 26.876 87.7766 26.582 87.7766 26.21C87.7766 25.886 87.6386 25.628 87.3626 25.436C87.0986 25.244 86.6426 25.118 85.9946 25.058L85.1306 24.968C84.0386 24.848 83.1986 24.536 82.6106 24.032C82.0226 23.528 81.7286 22.856 81.7286 22.016C81.7286 21.344 81.8966 20.78 82.2326 20.324C82.5686 19.868 83.0306 19.526 83.6186 19.298C84.2186 19.058 84.9026 18.938 85.6706 18.938C86.8706 18.938 87.8426 19.202 88.5866 19.73C89.3306 20.258 89.7206 21.032 89.7566 22.052H87.5066C87.4826 21.716 87.3146 21.428 87.0026 21.188C86.6906 20.948 86.2406 20.828 85.6526 20.828C85.1246 20.828 84.7166 20.93 84.4286 21.134C84.1406 21.338 83.9966 21.602 83.9966 21.926C83.9966 22.238 84.1106 22.478 84.3386 22.646C84.5786 22.814 84.9626 22.928 85.4906 22.988L86.3546 23.078C87.5066 23.198 88.4066 23.516 89.0546 24.032C89.7146 24.548 90.0446 25.244 90.0446 26.12C90.0446 26.768 89.8646 27.332 89.5046 27.812C89.1566 28.28 88.6646 28.646 88.0286 28.91C87.3926 29.174 86.6426 29.306 85.7786 29.306ZM95.9455 29.342C95.1055 29.342 94.3675 29.198 93.7315 28.91C93.1075 28.622 92.5855 28.238 92.1655 27.758C91.7575 27.266 91.4455 26.72 91.2295 26.12C91.0255 25.52 90.9235 24.908 90.9235 24.284V23.942C90.9235 23.294 91.0255 22.67 91.2295 22.07C91.4455 21.458 91.7575 20.918 92.1655 20.45C92.5855 19.97 93.1015 19.592 93.7135 19.316C94.3255 19.028 95.0335 18.884 95.8375 18.884C96.8935 18.884 97.7755 19.118 98.4835 19.586C99.2035 20.042 99.7435 20.648 100.104 21.404C100.464 22.148 100.644 22.952 100.644 23.816V24.716H91.9855V23.186H99.0775L98.3035 23.942C98.3035 23.318 98.2135 22.784 98.0335 22.34C97.8535 21.896 97.5775 21.554 97.2055 21.314C96.8455 21.074 96.3895 20.954 95.8375 20.954C95.2855 20.954 94.8175 21.08 94.4335 21.332C94.0495 21.584 93.7555 21.95 93.5515 22.43C93.3595 22.898 93.2635 23.462 93.2635 24.122C93.2635 24.734 93.3595 25.28 93.5515 25.76C93.7435 26.228 94.0375 26.6 94.4335 26.876C94.8295 27.14 95.3335 27.272 95.9455 27.272C96.5575 27.272 97.0555 27.152 97.4395 26.912C97.8235 26.66 98.0695 26.354 98.1775 25.994H100.482C100.338 26.666 100.062 27.254 99.6535 27.758C99.2455 28.262 98.7235 28.652 98.0875 28.928C97.4635 29.204 96.7495 29.342 95.9455 29.342ZM101.818 32.852V30.71H103.654C104.002 30.71 104.29 30.662 104.518 30.566C104.758 30.482 104.956 30.338 105.112 30.134C105.268 29.942 105.388 29.672 105.472 29.324L108.1 19.226H110.494L107.596 29.864C107.404 30.596 107.134 31.178 106.786 31.61C106.438 32.054 105.988 32.372 105.436 32.564C104.896 32.756 104.224 32.852 103.42 32.852H101.818ZM104.86 28.784V26.804H106.948V28.784H104.86ZM104.014 28.784L100.846 19.226H103.366L106.372 28.784H104.014Z',
    markCenter: [36.5, 22.5],
    viewBox: [24.5, 9.7, 88.5, 28],   // final lockup, mark + wordmark, with breathing room
    buildScale: 2.5,             // how large the M is built before it settles
    // Colour order traces the M's stroke: up the left leg from the bottom, over the first peak, down into
    // the middle V, up to the second peak and down the right leg. Indexes into `tris`.
    stroke: [17, 19, 15, 13, 3, 1, 7, 5, 0, 2, 4, 6, 9, 8, 10, 11, 12, 14, 18, 16],
    T: { triStagger: 70, recolor: 1800, ripple: 40, settle: 2950, word: 3350 },
  };

  async function mountV3(host, { onDone, slow }) {
    const T = V3.T, [vx, vy, vw, vh] = V3.viewBox, [mx, my] = V3.markCenter;
    await iconFont();
    const lockup = document.createElement('div');
    lockup.className = 'mm-lockup mm-v3';
    lockup.style.width = `${Math.min(640, roomIn(host))}px`;
    lockup.style.setProperty('--mm-slow', slow);

    const svg = el('svg', { class: 'mm-svg', viewBox: V3.viewBox.join(' '), role: 'img', 'aria-label': 'Mosey' });
    lockup.append(svg);
    // The SVG's grain: 4% black fractal noise over the mark. The region covers the gather offsets.
    const filter = el('filter', { id: 'mm3-grain', x: 12.5, y: 1, width: 48, height: 44, filterUnits: 'userSpaceOnUse', 'color-interpolation-filters': 'sRGB' }, el('defs', {}, svg));
    el('feTurbulence', { type: 'fractalNoise', baseFrequency: '2.5892856121063232', stitchTiles: 'stitch', numOctaves: 3, seed: 1206, result: 'noise' }, filter);
    el('feColorMatrix', { in: 'noise', type: 'luminanceToAlpha', result: 'alphaNoise' }, filter);
    const transfer = el('feComponentTransfer', { in: 'alphaNoise', result: 'coloredNoise1' }, filter);
    el('feFuncA', { type: 'discrete', tableValues: [...Array(51).fill(1), ...Array(49).fill(0)].join(' ') }, transfer);
    el('feComposite', { operator: 'in', in2: 'SourceGraphic', in: 'coloredNoise1', result: 'noise1Clipped' }, filter);
    el('feFlood', { 'flood-color': 'rgba(0, 0, 0, 0.04)', result: 'color1Flood' }, filter);
    el('feComposite', { operator: 'in', in2: 'noise1Clipped', in: 'color1Flood', result: 'color1' }, filter);
    const merge = el('feMerge', {}, filter);
    el('feMergeNode', { in: 'SourceGraphic' }, merge);
    el('feMergeNode', { in: 'color1' }, merge);

    // Built large in the centre of the lockup, then settles into its slot on the left.
    const k = V3.buildScale;
    const mark = el('g', {
      class: 'mm3-mark',
      style: `--d:${T.settle};--mk:${k};--mx:${vx + vw / 2 - mx}px;--my:${vy + vh / 2 - my}px`,
    }, svg);
    const grain = el('g', { filter: 'url(#mm3-grain)' }, mark);

    // Reading order: top row first, left to right. Each triangle is a light policy tile with an icon that
    // gathers inward from just outside the M; once all have grouped, they take the logo's plums one by
    // one along the M's stroke and their icons fade.
    const centroid = pts => [mean(pts, 0), mean(pts, 1)];
    const rowOf = pts => Math.floor((centroid(pts)[1] - 14.5) / 3.862);
    const order = [...V3.tris].sort((a, b) => rowOf(a[0]) - rowOf(b[0]) || centroid(a[0])[0] - centroid(b[0])[0]);
    const strokeRank = new Map(V3.stroke.map((t, rank) => [V3.tris[t], rank]));
    order.forEach((tri, i) => {
      const [pts, tone] = tri;
      const [cx, cy] = centroid(pts), len = Math.hypot(cx - mx, cy - my) || 1, reach = 5 + (i % 3) * 1.5;
      const recolor = T.recolor + strokeRank.get(tri) * T.ripple;
      const [paleVar, toneVar] = tone === 'd' ? ['--mm3-pale-dark', '--mm3-dark'] : ['--mm3-pale-bright', '--mm3-bright'];
      const tile = el('g', {
        class: 'mm3-tri',
        style: `--tile:var(${paleVar});--tone:var(${toneVar});` +
          `--d:${i * T.triStagger};--d2:${recolor};--dx:${((cx - mx) / len * reach).toFixed(2)}px;--dy:${((cy - my) / len * reach).toFixed(2)}px`,
      }, grain);
      el('path', { class: 'mm3-face', d: `M${pts.map(p => p.join(' ')).join('L')}Z` }, tile);
      // Icon sits on the triangle's incentre, sized to its inscribed circle.
      const side = (p, q) => Math.hypot(p[0] - q[0], p[1] - q[1]);
      const [A, B, C] = pts, a = side(B, C), b = side(C, A), c = side(A, B), s = (a + b + c) / 2;
      const r = Math.sqrt((s - a) * (s - b) * (s - c) / s);
      const ix = ((a * A[0] + b * B[0] + c * C[0]) / (2 * s)).toFixed(2), iy = ((a * A[1] + b * B[1] + c * C[1]) / (2 * s)).toFixed(2);
      const name = ICONS[(i * 5) % ICONS.length];
      const icon = el('text', { class: 'mm-icon mm3-icon', x: ix, y: iy, 'font-size': (r * 1.7).toFixed(2) }, tile);
      if (FLIPPED.has(name)) icon.setAttribute('transform', `rotate(180 ${ix} ${iy})`);
      icon.textContent = name;
    });

    const word = el('path', { class: 'mm3-word', d: V3.word, style: `--d:${T.word}` }, svg);
    host.replaceChildren(lockup);
    return wireSkip(lockup, word, onDone);
  }

  const mean = (pts, k) => pts.reduce((s, p) => s + p[k], 0) / pts.length;
  // Usable width inside the host, minus the 16px gutters; a phone width if the host isn't laid out yet.
  const roomIn = host => (host.clientWidth || 375) - 32;

  // Any tap or key jumps to the final lockup; onDone fires once, on skip or when the last element lands.
  function wireSkip(lockup, last, onDone) {
    let finished = false;
    const finish = () => {
      if (finished) return;
      finished = true;
      removeEventListener('pointerdown', skip, true);
      removeEventListener('keydown', skip, true);
      onDone?.();
    };
    const skip = () => { lockup.classList.add('is-complete'); finish(); };
    addEventListener('pointerdown', skip, true);
    addEventListener('keydown', skip, true);
    last.addEventListener('animationend', finish);
    if (getComputedStyle(last).animationName === 'none') finish();
    return { skip, element: lockup };
  }

  const VARIANTS = { v1: V1, v2: V2 };

  function el(name, attrs, parent) {
    const node = document.createElementNS(NS, name);
    for (const [k, v] of Object.entries(attrs)) node.setAttribute(k, v);
    parent?.append(node);
    return node;
  }

  // Icons are Material Symbols ligatures; wait for the font so names never flash as text.
  async function iconFont() {
    try { await Promise.race([document.fonts.load('24px "Material Symbols Outlined"', ICONS.join('')), new Promise(r => setTimeout(r, 1500))]); } catch {}
  }

  async function wordMetrics(capHeight) {
    const font = '700 100px "Nunito"';
    try { await Promise.race([document.fonts.load(font, WORD), new Promise(r => setTimeout(r, 1500))]); } catch {}
    const ctx = document.createElement('canvas').getContext('2d');
    ctx.font = `${font}, system-ui, sans-serif`;
    const cap = ctx.measureText('M').actualBoundingBoxAscent || 70;
    const size = capHeight / cap * 100; // cap height of the wordmark = height of the mark
    ctx.font = `700 ${size}px "Nunito", system-ui, sans-serif`;
    ctx.letterSpacing = `${-0.05 * size}px`; // matches .mm-word letter-spacing
    return { size, width: ctx.measureText(WORD).actualBoundingBoxRight };
  }

  async function mountMoseyLogo(host, { onDone, slow = 1, variant = 'v1' } = {}) {
    if (variant === 'v3') return mountV3(host, { onDone, slow });
    const logo = VARIANTS[variant] || V1, T = logo.T;
    const { mosaic, fill } = logo.layout();
    const [word] = await Promise.all([wordMetrics(logo.mark.height), iconFont()]);
    const all = [...mosaic.flatMap(t => t.parts.flat()), ...fill.flatMap(t => t.pts)];
    const minX = Math.min(...all.map(p => p[0])) - 1.5, maxX = Math.max(...all.map(p => p[0])) + 1.5;
    const minY = Math.min(...all.map(p => p[1])) - 1.5, maxY = Math.max(...all.map(p => p[1])) + 1.5, vbW = maxX - minX;
    const wordRight = logo.mark.wordX + word.width;

    // Build big, then settle: scale down so mark + wordmark fit, and slide so the lockup is centered.
    const lockup = document.createElement('div');
    lockup.className = 'mm-lockup';
    const room = roomIn(host);
    const width = Math.min(340, room), scale = Math.min(1, Math.min(room, 640) / (width * wordRight / vbW));
    lockup.style.width = `${width}px`;
    lockup.style.setProperty('--mm-shift', `${((minX + vbW / 2 - wordRight / 2) / vbW * 100 * scale).toFixed(2)}%`);
    lockup.style.setProperty('--mm-scale', scale.toFixed(3));
    lockup.style.setProperty('--mm-slow', slow);
    lockup.style.setProperty('--mm-settle', T.settle);

    const svg = el('svg', { class: 'mm-svg', viewBox: `${minX} ${minY} ${vbW} ${maxY - minY}`, role: 'img', 'aria-label': 'Mosey' });
    lockup.append(svg);
    const gMosaic = el('g', { class: 'mm-mosaic', 'aria-hidden': 'true' }, svg);
    // Empty slots in the shape of the mark, so the gap reads as an M before it fills.
    const gSlots = el('g', { class: 'mm-slots', 'aria-hidden': 'true' }, svg);
    const gFill = el('g', { class: 'mm-fill', 'aria-hidden': 'true' }, svg);
    const gMark = el('g', { class: 'mm-mark' }, svg);

    // Mosaic: blocks slide inward along their dominant axis, one after another from the top-left,
    // closing around the M-shaped gap; they recede in reverse. Two light-plum families mix
    // (different policies); each lightens a touch toward the bottom.
    const cx = t => mean(t.parts.flat(), 0), cy = t => mean(t.parts.flat(), 1);
    const diag = t => (cx(t) - minX) / vbW + (cy(t) - minY) / (maxY - minY);
    const order = [...mosaic].sort((a, b) => diag(a) - diag(b));
    order.forEach((t, i) => {
      const jitter = [0, 1, -1, 0, 1][(i * 7) % 5];
      const level = Math.max(0, Math.min(SHADES - 1, Math.round((cy(t) - minY) / (maxY - minY) * (SHADES - 1)) + jitter));
      const shade = ((i * 3) % 5 < 2 ? SHADES : 0) + level;
      const vx = cx(t) - logo.center[0], vy = cy(t) - logo.center[1], reach = 6 + (i % 3) * 3;
      const [dx, dy] = Math.abs(vx) > Math.abs(vy) ? [Math.sign(vx) * reach, 0] : [0, Math.sign(vy) * reach];
      const tile = el('g', {
        class: 'mm-tile',
        style: `--tile:var(--mm-shade-${shade});--d:${i * T.mosaicStagger};--d2:${T.resolve + (order.length - 1 - i) * 10};--dx:${dx}px;--dy:${dy}px`,
      }, gMosaic);
      const r = t.parts.length > 1 ? logo.fillRadius : logo.radius;
      t.parts.forEach(pts => el('path', { d: roundedPath(pts, r), fill: 'var(--tile)' }, tile));
      if (t.icon) {
        const name = ICONS[(i * 5) % ICONS.length], x = cx(t).toFixed(2), y = cy(t).toFixed(2);
        const icon = el('text', { class: 'mm-icon', x, y, 'font-size': ICON_SIZE }, tile);
        if (FLIPPED.has(name)) icon.setAttribute('transform', `rotate(180 ${x} ${y})`);
        icon.textContent = name;
      }
    });

    // Fill: in the layout's order. A piece fuses once its last tile lands.
    const fuseAt = {};
    fill.forEach((t, i) => { fuseAt[t.piece] = T.fillStart + i * T.fillStagger + T.drop; });
    fill.forEach((t, i) => {
      const d = roundedPath(t.pts, logo.fillRadius);
      el('path', { class: 'mm-slot', d, style: `--d:${T.slots + i * 20};--d2:${fuseAt[t.piece] + T.fuse}` }, gSlots);
      el('path', { class: 'mm-drop', d, style: `--d:${T.fillStart + i * T.fillStagger};--d2:${fuseAt[t.piece] + T.fuse}` }, gFill);
    });
    for (const [piece, d] of Object.entries(logo.pieces)) el('path', { class: 'mm-piece', d, style: `--d:${fuseAt[piece]}` }, gMark);

    const text = el('text', { class: 'mm-word', x: logo.mark.wordX, y: logo.mark.bottom, 'font-size': word.size.toFixed(2), style: `--d:${T.word}` }, svg);
    text.textContent = WORD;

    host.replaceChildren(lockup);
    return wireSkip(lockup, text, onDone);
  }

  window.mountMoseyLogo = mountMoseyLogo;
})();
