# theme

> The stylesheet every component reads: the `dark` variant, the `@theme` mappings, the interaction and motion tokens, the radius scale, the outcome colours a shadcn theme does not define, the focus ring and the base layer. Required — a project that keeps its own palette still needs this file, which is why the colours are a separate item.

## install

```bash
bunx shadcn@latest add @lumo/theme
```

- payload: `/r/theme.json`

## what the CLI does

Not a file, and not copied: the CLI merges it into the stylesheet `components.json` names — the custom properties into `:root`, `.dark` and `@theme inline`, the rules into the base layer. `@lumo/theme` is required either way; `@lumo/palette` is the default colours, added only where a project has none of its own. The source it is generated from is the stylesheet below, so a variable in it is the variable installed.

### src/styles/lumo-tokens.css

```css
/* lumo-ui — everything a component needs from the stylesheet, whatever the project already has.
   Names follow the shadcn/ui convention, so a community theme drops in as-is; what this file adds
   is what such a theme does not define: the `dark` variant, the `@theme` mappings, the interaction
   and motion tokens, the radius scale, the focus ring and the base layer.

   This file is both the docs site's stylesheet and the source of the `@lumo/theme` item, which the
   CLI merges into a project's own CSS instead of copying a file — see scripts/theme.ts. The
   colours are the separate `lumo-palette.css`, and the only part a project may skip.
   The site consumes it with: @import 'tailwindcss'; @import './lumo-palette.css';
   @import './lumo-tokens.css'; */

@custom-variant dark (&:where(.dark, .dark *));

@theme inline {
	/* Type: Inter carries the Latin, and the CJK families after it carry Chinese. The font
	   FILE is not shipped here — a consumer installs `@fontsource-variable/inter` (or serves
	   Inter some other way) and this stack picks it up; without it, the stack degrades to the
	   system sans rather than to something broken. Tailwind's preflight resolves `html`'s
	   font-family from `--font-sans`, so this one declaration is the whole app's type. */
	--font-sans:
		'Inter Variable', 'Inter', 'Noto Sans SC Variable', 'Noto Sans SC', system-ui,
		-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;

	/* Mono: Geist Mono comes FIRST so every machine draws code in the same font — the
	   installed monos after it are a safety net, not the intent (ui-monospace resolves to
	   Consolas on Windows, which is thin and blurry at 12px).
	   The CJK families sit AFTER the Latin monos on purpose: a CJK face carries Latin glyphs
	   of its own and is full-width for characters a mono would rather own (box drawing is
	   1.000em there against Consolas' 0.550em), so the mono has to win that race. They sit
	   BEFORE the generic `monospace`, which always resolves and would otherwise swallow them.
	   No `font-feature-settings` needed: Geist Mono ships without ligatures, so `!==` in a
	   diff stays three characters. */
	--font-mono:
		'Geist Mono Variable', 'Geist Mono', ui-monospace, SFMono-Regular, Menlo, Consolas,
		'Liberation Mono', 'Noto Sans SC Variable', 'Noto Sans SC', monospace;

	--color-background: var(--background);
	--color-layout-background: var(--layout-background);
	--color-layout-content: var(--layout-content);
	--color-foreground: var(--foreground);
	--color-card: var(--card);
	--color-card-foreground: var(--card-foreground);
	--color-popover: var(--popover);
	--color-popover-foreground: var(--popover-foreground);
	--color-primary: var(--primary);
	--color-primary-foreground: var(--primary-foreground);
	--color-secondary: var(--secondary);
	--color-secondary-foreground: var(--secondary-foreground);
	--color-muted: var(--muted);
	--color-muted-foreground: var(--muted-foreground);
	--color-accent: var(--accent);
	--color-accent-foreground: var(--accent-foreground);
	--color-destructive: var(--destructive);
	--color-destructive-foreground: var(--destructive-foreground);
	--color-success: var(--success);
	--color-warning: var(--warning);
	--color-info: var(--info);
	--color-border: var(--border);
	--color-input: var(--input);

	/* Three elevation levels: the resting surface includes its own hairline edge; the lifted and
	   overlay shadows spread further without changing the borders of the surfaces using them. */
	--shadow-surface: var(--shadow-surface);
	--shadow-lifted: var(--shadow-lifted);
	--shadow-overlay: var(--shadow-overlay);
	--color-input-strong: var(--input-strong);
	--color-ring: var(--ring);

	/* Table bands are opaque so sticky headers hide the records beneath them. A standalone table
	   supplies its surface; a frameless table can name its host through --table-surface. Row states
	   stay transparent so the same washes work on either surface. Keep these mixes inline: a value
	   resolved in :root would freeze the light theme before a dark scope can change its colours. */
	--color-table-head: color-mix(
		in oklch,
		var(--foreground) 2%,
		var(--table-surface, var(--background))
	);
	--color-table-head-hover: color-mix(
		in oklch,
		var(--foreground) 8%,
		var(--table-surface, var(--background))
	);
	--color-row-hover: color-mix(in oklch, var(--foreground) 5%, transparent);
	--color-row-selected: color-mix(in oklch, var(--primary) 8%, transparent);
	--color-row-selected-hover: color-mix(in oklch, var(--primary) 12%, transparent);
	/* The column a sort is applied to. Transparent like the row states, and a step lighter than the
	   hover, so a hovered row still reads as hovered inside a sorted column. */
	--color-column-sorted: color-mix(in oklch, var(--foreground) 3%, transparent);

	/* --radius is the only knob; the whole scale derives from it. */
	--radius-sm: calc(var(--radius) * 0.6);
	--radius-md: calc(var(--radius) * 0.8);
	--radius-lg: var(--radius);
	--radius-xl: calc(var(--radius) * 1.4);
	--radius-2xl: calc(var(--radius) * 1.8);

	/* The one keyframe the theme owns: a bar whose end is unknown sweeps a segment of itself from
	   one end of its groove to the other. It lives here rather than in Progress because the
	   distances are what makes it work — the segment is 40% of the groove, so travelling from
	   -100% of itself to 250% of itself is exactly one groove, edge to edge. */
	--animate-progress-sweep: lumo-progress-sweep 1.2s ease-in-out infinite;

	@keyframes lumo-progress-sweep {
		from {
			translate: -100% 0;
		}

		to {
			translate: 250% 0;
		}
	}
}

/* The values this file names that a shadcn/ui theme does not: the three outcomes beside
   `--destructive`, the second step of a field's edge, the scrim, and the shadows a surface is
   lifted with. They live here rather than in the palette because no other theme defines them —
   skipping the palette must not take them away. The page colours they are read against
   (--background, --foreground, --primary, --ring, --border) are the palette's, or the
   consumer's own. */
:root {
	/* Shell chrome stays separate from the content canvas and card surfaces. */
	--layout-background: rgb(239 239 240);
	--layout-content: rgb(249 249 250);

	/* Interaction feedback — shared by every pressable control.
	   Filled buttons tint themselves with their light foreground colour, which reads
	   weaker than the dark tint the surface variants get, so they carry their own pair.
	   A press also nudges the control down one pixel — except where `aria-haspopup` marks
	   it as a trigger, because an overlay is positioned against that element's measured
	   rect and must not see it move. If Base UI ever stops setting that attribute
	   somewhere, the nudge returns there silently. */
	--state-layer-hover-opacity: 0.06;
	--state-layer-pressed-opacity: 0.14;
	--state-layer-fill-hover-opacity: 0.16;
	--state-layer-fill-pressed-opacity: 0.26;
	/* The one step between hover and press, for a control that is already lit — a nav row you are on,
	   a chosen row of a menu or a select that the pointer is still over. A tint that is a press and a
	   tint that is a mark left behind cannot be the same weight: the first is gone in a frame, the
	   second has to sit under a pointer that stays and still say something. */
	--state-layer-selected-hover-opacity: 0.1;
	--press-offset: 1px;
	/* A box easing to the size of the content inside it is a spring, not a token: see springSize
	   in lib/motion.ts. A theme still reaches it, because the file is source. */
	/* How far a tab panel travels sideways as it takes over from the one before it. Kept in px
	   because it is a distance, not a duration. */
	--shift-content: 8px;
	/* How far out of focus a tab panel is while it waits off the edge of the track. */
	--blur-inactive: 4px;
	--ease-spring: cubic-bezier(0.34, 1.56, 0.64, 1);
	--duration-state: 150ms;
	/* A glyph whose whole meaning is what a panel is doing — a caret turning as the box opens —
	   keeps time with the box rather than with a state change, so it turns over the longer stretch
	   and lands with it. A spring is fast at first and settles late, which is the shape an
	   ease-out already has. */
	--duration-turn: 200ms;
	--duration-press: 80ms;

	/* Overlays travel further than a state change, so they ease out with no overshoot
	   and take a longer tail. */
	--ease-overlay: cubic-bezier(0.22, 1, 0.36, 1);
	--duration-overlay: 350ms;

	/* Additions in a diff. The pair to `--destructive`, at the same weight, because the two are
	   always read together and must not differ in loudness. */
	--success: oklch(0.627 0.194 149.214);
	/* The third outcome: read before it is acted on, so it sits between the other two in weight —
	   loud enough not to be mistaken for a note, quiet enough not to be mistaken for a failure. */
	--warning: oklch(0.666 0.179 58.318);
	/* The outcome with no direction: a fact to be read. Blue is what that reads as, and it is the
	   only hue left that means neither "worse" nor "better". */
	--info: oklch(0.546 0.245 262.881);
	/* The second step a field's border has: the one it wears while a pointer is over it or a
	   keyboard has arrived in it. Both states are this colour and not two colours, because a field
	   is saying the same thing either way — this is the box you are working in — and a border that
	   moved twice for the same meaning would read as two different states. */
	--input-strong: oklch(0.78 0 0);
	/* The scrim behind a modal surface. A colour of its own rather than `foreground` at an opacity:
	   a scrim is dark in both themes — it is the page being pushed back, not the text on it — and
	   in the dark one it has to be deeper still, because the popup above it is only a little
	   lighter than the page it covers. */
	--overlay: oklch(0 0 0 / 50%);

	/* The resting card has no border: one spread-only layer draws the hairline, and two short
	   shadows lift it just off the page. The lifted shadow adds a wider halo on hover. */
	--shadow-surface:
		0 0 0 1px rgb(0 0 0 / 2.9%), 0 3px 6px -2px rgb(0 0 0 / 2%), 0 1px 1px rgb(0 0 0 / 4%);
	--shadow-lifted:
		0 17.5px 23.4px rgb(0 0 0 / 4%), 0 9.4px 12.5px rgb(0 0 0 / 3%),
		0 5.25px 7px rgb(0 0 0 / 2%), 0 2.8px 3.7px -2px rgb(0 0 0 / 1%),
		0 1.2px 1.5px rgb(0 0 0 / 1%);
	/* The third step belongs to a surface that takes the page away rather than sitting on it — a
	   dialog, a drawer. It spreads twice as far as the lifted one, which is what separates "this is
	   above the page" from "the pointer is over this". */
	--shadow-overlay:
		0 40px 80px rgb(0 0 0 / 6%), 0 20px 40px rgb(0 0 0 / 5%), 0 10px 20px rgb(0 0 0 / 4%),
		0 5px 10px rgb(0 0 0 / 3%), 0 2px 4px rgb(0 0 0 / 2%);
}

.dark {
	--layout-background: color-mix(in srgb, var(--background) 75%, black);
	--layout-content: var(--background);
	--success: oklch(0.723 0.219 149.579);
	--warning: oklch(0.769 0.188 70.08);
	--info: oklch(0.623 0.214 259.815);
	/* A step lighter rather than darker: on a dark page an edge is found by adding light. */
	--input-strong: oklch(1 0 0 / 30%);
	--overlay: oklch(0 0 0 / 65%);
	/* The hairline adds light on a dark page; the shadows beneath it still remove light. */
	--shadow-surface:
		0 0 0 1px rgb(255 255 255 / 10%), 0 3px 6px -2px rgb(0 0 0 / 3%), 0 1px 1px rgb(0 0 0 / 6%);
	--shadow-lifted:
		0 17.5px 23.4px rgb(0 0 0 / 6%), 0 9.4px 12.5px rgb(0 0 0 / 5%),
		0 5.25px 7px rgb(0 0 0 / 3%), 0 2.8px 3.7px -2px rgb(0 0 0 / 2%),
		0 1.2px 1.5px rgb(0 0 0 / 2%);
	--shadow-overlay:
		0 40px 80px rgb(0 0 0 / 9%), 0 20px 40px rgb(0 0 0 / 8%), 0 10px 20px rgb(0 0 0 / 6%),
		0 5px 10px rgb(0 0 0 / 5%), 0 2px 4px rgb(0 0 0 / 3%);
}

@layer base {
	* {
		border-color: var(--border);
	}

	body {
		background-color: var(--background);
		color: var(--foreground);
		-webkit-font-smoothing: antialiased;
	}

	/* Selection belongs to the page, not to each control: a reader expects the same colour wherever
	   they drag across text — a field, a code block, a paragraph. */
	::selection {
		background-color: var(--primary);
		color: var(--primary-foreground);
	}

	/* Focus is declared once, here, and never in a component: a control reached by keyboard says
	   so the same way wherever it sits. An outline rather than a ring, because it is drawn
	   outside the box — the control keeps its size and its border while it holds focus.

	   It fades in as an animation and not as a transition, because a transition is a property the
	   element has to opt into and every component replaces `transition` with its own list of
	   properties — the ring would arrive at two speeds depending on what it was drawn around. An
	   animation runs beside those lists instead, and only on the moment it is wanted: a control
	   that takes focus and keeps it has nothing left to animate. */
	:focus-visible {
		outline: 2px solid var(--ring);
		outline-offset: 2px;
		animation: focus-ring var(--duration-state) var(--ease-spring);
	}

	@keyframes focus-ring {
		from {
			outline-color: transparent;
		}
	}

	/* Scrollbars: a transparent track, so whatever a pane is filled with shows through, and a
	   rounded thumb that only firms up on hover. Firefox has no webkit pseudo-elements, so it
	   needs the standard pair — and Chromium ignores the pseudo-elements once that pair is set,
	   so the `@supports` keeps each engine on exactly one of the two. */
	@supports not selector(::-webkit-scrollbar) {
		* {
			scrollbar-width: thin;
			scrollbar-color: var(--ring) transparent;
		}
	}

	*::-webkit-scrollbar {
		width: 10px;
		height: 10px;
	}

	*::-webkit-scrollbar-track,
	*::-webkit-scrollbar-corner {
		background-color: transparent;
	}

	*::-webkit-scrollbar-thumb {
		background-color: var(--ring);
		background-clip: content-box;
		border: 2px solid transparent;
		border-radius: 9999px;
	}

	*::-webkit-scrollbar-thumb:hover {
		background-color: var(--muted-foreground);
	}
}

/* Neutralise the interaction tokens instead of asking every component to opt out. */
@media (prefers-reduced-motion: reduce) {
	:root {
		--press-offset: 0;
		--shift-content: 0px;
		--blur-inactive: 0px;
		--ease-spring: linear;
		--duration-state: 1ms;
		--duration-turn: 1ms;
		--duration-press: 1ms;
		--ease-overlay: linear;
		--duration-overlay: 1ms;
	}
}
```
