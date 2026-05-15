# Handwriting Animation — Board Component

## Vision

A `<Board>` component that ingests a schema file and plays out a whiteboard-style animation —
shapes, text, arrows — sequentially, like someone drawing on a board in real time.
Used for article explainers (e.g. `dataflow.json` renders an animated data flow diagram).

---

## Content Format

**Authoritative format: JSON**
- Full layout control (x, y, size, draw order, timing)
- Optionally accept MD with frontmatter that maps to the JSON schema
- MD works for pure text flows; JSON is required the moment you have positioned elements, arrows, or boxes

---

## Board Element Types

| Type        | Description                                          |
|-------------|------------------------------------------------------|
| `text`      | Handwriting-font label, revealed left → right        |
| `box`       | Hand-drawn rectangle (rough edges)                   |
| `circle`    | Hand-drawn ellipse                                   |
| `arrow`     | Connecting line between two node IDs                 |
| `highlight` | Underline or circle annotation on existing text      |
| `image`     | Icon or illustration, fades in                       |

---

## Animation Approach

- **Rough.js** (base library, not Rough Notation) — generates SVG paths with hand-drawn wobble for shapes and arrows
- Animate paths via CSS `stroke-dashoffset` — no extra animation dependency
- Text uses **Caveat** (Google Font) with a sliding `clip-path` reveal — looks handwritten, far simpler than per-character SVG paths
- Sequential timing controlled by a step runner that chains animations using `animationend` events or a delay accumulator
- Draw order = array order in the JSON steps

---

## JSON Schema

```json
{
  "title": "Data Flow",
  "theme": "dark",
  "steps": [
    { "id": "src",   "type": "box",   "x": 60,  "y": 120, "w": 120, "h": 50, "label": "Source DB" },
    { "id": "etl",   "type": "box",   "x": 260, "y": 120, "w": 120, "h": 50, "label": "ETL Layer" },
    { "id": "a1",    "type": "arrow", "from": "src", "to": "etl" },
    { "id": "note1", "type": "text",  "x": 200, "y": 60,  "content": "nightly batch" }
  ]
}
```

---

## Library Stack

| Concern               | Tool                                          |
|-----------------------|-----------------------------------------------|
| Hand-drawn shapes     | `roughjs`                                     |
| SVG rendering         | Raw SVG (no extra lib)                        |
| Text style            | Caveat (Google Font)                          |
| Animation sequencing  | CSS `stroke-dashoffset` + JS delay accumulator |
| MD → JSON parsing     | `gray-matter` (frontmatter) + custom parser   |

---

## Hard Problems to Solve

1. **Responsive scaling** — SVG needs a `viewBox` + `preserveAspectRatio` so positions don't break at different screen sizes
2. **Arrow routing** — start with center-to-center lines, add smart edge-midpoint routing later
3. **Text reveal** — clip-path sliding reveal over Caveat font is the practical approach (per-character SVG paths are overkill)

---

## Next Steps

- [ ] Finalise and lock JSON schema shape
- [ ] Build `<Board>` component scaffold (SVG canvas, viewBox, step runner)
- [ ] Integrate Rough.js for box/circle/arrow path generation
- [ ] Implement `stroke-dashoffset` animation per element
- [ ] Add Caveat font + clip-path text reveal
- [ ] Wire up MD frontmatter parser as alternative input
- [ ] Test with `dataflow.json` as first real board
