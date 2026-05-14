# Creative Hub - design alignment (Filllo-style)

This document captures the UI direction for Creative Hub (aligned with the Stitch / Filllo dashboard reference discussed in your brief).

## Layout

- Persistent **sidebar** for primary navigation per role (client, designer, admin).
- **Top bar** with product name, signed-in user, and log out.
- **Main content** uses a max-width content column with generous padding.

## Visual language

- **Surfaces**: white cards on a cool grey page background (`#f4f7fb`).
- **Shape**: rounded cards (`16px`), soft shadow, subtle borders.
- **Typography**: `DM Sans`, strong hierarchy on titles, muted supporting text.
- **Accent**: vibrant blue (`#2563eb`) for primary buttons and active nav states.
- **Status**: green for in progress, orange for paused, neutral grey for completed/draft.

## Components

- **Project cards**: title, short description, status pill, decorative progress bar.
- **Brief cards**: title, company, design type, status badge.
- **Workspace**: horizontal **task board** by column, **asset gallery** (link tiles), **chat** panel (feedback list + composer).
- **Forms**: stacked fields with clear labels; primary action aligned with the accent button.

## Stitch MCP (optional)

If you use Google Stitch MCP, configure the server in Cursor MCP settings and store any API key in environment or Cursor secrets - **never commit keys to the repository**.
