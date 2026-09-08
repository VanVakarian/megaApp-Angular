import { Chart, Plugin } from 'chart.js';

export interface CategoryHoverHighlightPlugin extends Plugin {
  // Full color when nothing is hovered or `label` is the hovered category, dimmed otherwise.
  colorFor(label: string, fullColor: string, dimmedColor: string): string;
}

// Hovering one category's bar segment keeps its own color everywhere that category appears
// (every bar/month) and mutes every other category's segments everywhere else — not just the
// bar under the cursor. Chart.js's own per-element hover state (hoverBackgroundColor) only ever
// targets the single segment directly under the pointer, so it's unused here; this plugin tracks
// the *category* (dataset label) as closure state, read from `chart.getActiveElements()` — the
// same active-element list Chart.js already resolves via its hover interaction mode on every
// relevant event (mousemove, mouseout included) before any plugin's afterEvent runs. Dataset-
// level scriptable colors in rebuildChartDatasets call colorFor() to render against it.
// One instance per chart — hover state must not leak between independent charts (Expense/Income).
export function createCategoryHoverHighlight(): CategoryHoverHighlightPlugin {
  let hoveredLabel: string | null = null;

  function setHovered(chart: Chart, label: string | null): void {
    if (label === hoveredLabel) return;
    hoveredLabel = label;
    chart.update('none');
  }

  return {
    id: 'categoryHoverHighlight',
    afterEvent(chart) {
      const active = chart.getActiveElements();
      const label = active.length ? (chart.data.datasets[active[0].datasetIndex]?.label ?? null) : null;
      setHovered(chart, label);
    },
    colorFor(label, fullColor, dimmedColor) {
      return hoveredLabel === null || hoveredLabel === label ? fullColor : dimmedColor;
    },
  };
}
