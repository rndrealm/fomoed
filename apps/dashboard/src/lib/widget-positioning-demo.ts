/**
 * Widget Positioning System Improvements
 *
 * This file demonstrates the improvements made to the widget positioning system
 * in the dashboard application.
 */

import {
  getGridPosition,
  getOptimalGridPosition,
  getGridColumns,
} from "@/charts/helpers";

// Example: Old vs New Widget Positioning

// OLD SYSTEM (Simple alternating pattern)
// =====================================
console.log("=== OLD SYSTEM ===");
console.log("Simple alternating left/right pattern:");
for (let i = 0; i < 6; i++) {
  const position = getGridPosition(i);
  console.log(`Widget ${i}: x=${position.x}, y=${position.y}`);
}
// Output:
// Widget 0: x=0, y=0
// Widget 1: x=4, y=0
// Widget 2: x=0, y=2
// Widget 3: x=4, y=2
// Widget 4: x=0, y=4
// Widget 5: x=4, y=4

// NEW SYSTEM (Smart optimal positioning)
// ======================================
console.log("\n=== NEW SYSTEM ===");

// Example layout with existing widgets of different sizes
const existingWidgets = [
  { meta: { x: 0, y: 0, w: 8, h: 4 } }, // Large chart widget
  { meta: { x: 8, y: 0, w: 4, h: 4 } }, // Medium widget
  { meta: { x: 12, y: 0, w: 4, h: 2 } }, // Small widget
  { meta: { x: 16, y: 0, w: 8, h: 2 } }, // Wide widget
];

console.log("Existing widgets layout:");
existingWidgets.forEach((widget, i) => {
  console.log(
    `Widget ${i}: x=${widget.meta.x}, y=${widget.meta.y}, w=${widget.meta.w}, h=${widget.meta.h}`,
  );
});

console.log("\nNew widget positioning with different strategies:");

// Test different widget sizes and strategies
const testWidgets = [
  { w: 4, h: 2, name: "Small Widget" },
  { w: 8, h: 4, name: "Large Chart" },
  { w: 6, h: 2, name: "Medium Widget" },
];

const strategies: Array<"optimal" | "compact" | "row-based"> = [
  "optimal",
  "compact",
  "row-based",
];

strategies.forEach((strategy) => {
  console.log(`\n--- ${strategy.toUpperCase()} STRATEGY ---`);
  testWidgets.forEach((widget) => {
    const position = getOptimalGridPosition(
      existingWidgets,
      { w: widget.w, h: widget.h },
      getGridColumns("xl"),
      strategy,
    );
    console.log(
      `${widget.name} (${widget.w}x${widget.h}): x=${position.x}, y=${position.y}`,
    );
  });
});

// Benefits of the new system:
console.log(`
=== IMPROVEMENTS ===

1. **Smart Gap Detection**: The new system identifies and fills empty spaces in the grid,
   rather than just placing widgets in a simple pattern.

2. **Size-Aware Positioning**: Takes into account the actual dimensions of widgets
   to find the best fit, preventing overlaps and optimizing space usage.

3. **Multiple Strategies**: 
   - 'optimal': Balances space efficiency with visual alignment
   - 'compact': Minimizes empty space by filling gaps aggressively  
   - 'row-based': Maintains clean row organization

4. **Responsive Grid Support**: Adapts to different screen sizes and grid configurations
   using the responsive breakpoint system.

5. **Visual Alignment**: Attempts to align widgets with existing rows for better
   visual organization.

6. **Future-Proof**: Easy to extend with additional placement strategies and
   user preferences.

=== USAGE ===

// Basic usage (replaces old getGridPosition)
const position = getOptimalGridPosition(
  currentLayout?.widgets || [],
  { w: 8, h: 4 },
  getGridColumns('xl')
);

// With strategy preference  
const position = getOptimalGridPosition(
  currentLayout?.widgets || [],
  { w: 8, h: 4 },
  getGridColumns('xl'),
  'compact'
);

=== BACKWARD COMPATIBILITY ===

The old getGridPosition function is still available for legacy code,
but new code should use getOptimalGridPosition for better results.
`);

export {};
