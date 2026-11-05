# palette

> The default light and dark page colours, under the shadcn/ui names, and the `--radius` the radius scale derives from. Skip this one if the target project already defines them; lumo-tokens.css is needed either way.

## install

```bash
bunx shadcn@latest add @lumo/palette
```

- payload: `/r/palette.json`

## what the CLI does

Not a file, and not copied: the CLI merges it into the stylesheet `components.json` names — the custom properties into `:root`, `.dark` and `@theme inline`, the rules into the base layer. `@lumo/theme` is required either way; `@lumo/palette` is the default colours, added only where a project has none of its own. The source it is generated from is the stylesheet below, so a variable in it is the variable installed.

### src/styles/lumo-palette.css

```css
/* The default palette: the page colours, light and dark, and the one knob their radii derive from.
   Every name here is one a shadcn/ui theme already defines, which makes this the only file a
   project may skip — keep its own :root/.dark and import lumo-tokens.css alone.

   Nothing in a component reads a colour that is here and only here: what a shadcn theme lacks —
   the outcomes, the field's strong edge, the scrim, the shadows — lives in lumo-tokens.css. */

:root {
	--radius: 0.625rem;
	--background: oklch(1 0 0);
	--foreground: oklch(0.145 0 0);
	--card: oklch(1 0 0);
	--card-foreground: oklch(0.145 0 0);
	--popover: oklch(1 0 0);
	--popover-foreground: oklch(0.145 0 0);
	--primary: oklch(0.205 0 0);
	--primary-foreground: oklch(0.985 0 0);
	--secondary: oklch(0.94 0 0);
	--secondary-foreground: oklch(0.205 0 0);
	--muted: oklch(0.94 0 0);
	--muted-foreground: oklch(0.556 0 0);
	--accent: oklch(0.97 0 0);
	--accent-foreground: oklch(0.205 0 0);
	--destructive: oklch(0.577 0.245 27.325);
	--destructive-foreground: oklch(0.985 0 0);
	--border: oklch(0.922 0 0);
	--input: oklch(0.922 0 0);
	--ring: oklch(0.708 0 0);
}

.dark {
	--background: rgb(28 29 32);
	--foreground: oklch(0.985 0 0);
	--card: rgb(34 35 38);
	--card-foreground: oklch(0.985 0 0);
	--popover: rgb(34 35 38);
	--popover-foreground: oklch(0.985 0 0);
	--primary: oklch(0.922 0 0);
	--primary-foreground: oklch(0.205 0 0);
	--secondary: rgb(40 41 44);
	--secondary-foreground: oklch(0.985 0 0);
	--muted: oklch(0.295 0 0);
	--muted-foreground: oklch(0.708 0 0);
	--accent: oklch(0.269 0 0);
	--accent-foreground: oklch(0.985 0 0);
	--destructive: oklch(0.704 0.191 22.216);
	--destructive-foreground: oklch(0.205 0 0);
	--border: oklch(1 0 0 / 10%);
	--input: oklch(1 0 0 / 15%);
	--ring: oklch(0.556 0 0);
}
```
