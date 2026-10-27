# Design decisions

Durable product and UI decisions. Change them on purpose, not by accident.

## Product
- Offline first. Every feature works without a network, and data stays on the device.
- Four steps in a fixed order: **Draw, Nails, Strings, Build**. The step bar is always visible.
- The board is the star. Controls sit around it and never cover it, except short-lived sheets.

## Touch and layout
- Minimum touch target 44 px. Tool buttons are a fixed 76 x 62 px so the active highlight is the same size for every tool.
- Phone: board on top, inspector below. iPad (820 px and wider): board left, 360 px inspector right.
- Tools with several modes (Pen, Lasso) open a bottom sheet first, then the chosen mode becomes active.
- Two fingers always mean "view" or "transform the selection": pinch zoom, twist rotate.
- Every destructive action is undoable. Clear and delete in lists ask for a second tap.

## Look
- iOS-style grouped cards, a translucent top bar, blue accent, system font.
- The board and the threads use their own colors and never follow the light or dark theme.
- Light boards switch nails, grid and default thread to dark automatically.

## Writing
- Short, plain sentences. Say what happened and what undo does.
