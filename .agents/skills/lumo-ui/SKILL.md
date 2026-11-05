---
name: lumo-ui
description: "Components to copy, not to install: Base UI for behaviour, Tailwind v4 for styling and CSS variables for theme, installed as a shadcn registry rather than an npm package. Use when installing an item from @lumo, writing a screen with it, or looking up one of its parts, variants or state attributes."
---

# lumo-ui

> Components to copy, not to install: Base UI for behaviour, Tailwind v4 for styling, CSS
> variables for theme.

lumo-ui is a personal React component library distributed as a shadcn registry - there is no
npm package. A component arrives as source, in the project, copied into the consumer's own
aliases; a file already there with the same content is skipped, so a second install shares the
first. The site is the registry: `/r/<name>.json` is what the CLI reads.

## how an install works

Declare the namespace once, in `components.json` (or under `registries` in `package.json`).
`https://ui.lumo.cab` is this skill's origin; `{name}` is the CLI's placeholder.

```json
"registries": { "@lumo": "https://ui.lumo.cab/r/{name}.json" }
```

```bash
bunx shadcn@latest add @lumo/theme
bunx shadcn@latest add @lumo/button
```

`@lumo/theme` is required and is merged into the project's stylesheet rather than copied;
`@lumo/palette` only adds the default colours where a project has none. Everything a component
imports comes with it: another item, or the npm package it names.

## rules that decide the code

- Behaviour is Base UI's (`@base-ui/react`). Focus trapping, escape, scroll lock, positioning
  and ARIA are never reimplemented here.
- Composition is `render`, not `asChild`: `<Dialog.Trigger render={<Button />} />`.
- Appearance is tokens only - `bg-primary`, `text-muted-foreground`, `rounded-md`. No
  `bg-blue-500`, no `#fff`, no `rounded-[6px]`, and no new token without a reason.
- Focus is declared once, in the theme's `:focus-visible`. A component does not write its own;
  the field family instead moves its own edge to `--input-strong`.
- State attributes are Base UI's own: `data-open`, `data-closed`, `data-starting-style`,
  `data-ending-style`, `data-highlighted`, `data-disabled`. A variant is mirrored as
  `data-variant`, a size as `data-size`.
- Icons are lucide, passed as rendered elements into a slot - `icon={<Trash2 />}`, sized in
  `em` by the slot itself - never as an icon-component type.
- A multi-part component exports one namespace (`Dialog.Root`, `Dialog.Popup`, ...); a
  single-part one exports the function. Every rendered element carries `data-slot`.
- The consumer's `className` is merged last, through `cn()`.

## workflow

1. Choose the item from the index below, then read `references/<name>.md` for it: the install command, the source the CLI copies, and the examples its page shows.
2. Read that source before writing a call site - it is the API. There is no generated prop table, so a part, a variant or a prop that is not in the file does not exist.
3. Follow the rules above instead of inventing a convention beside them, and copy the shape the examples already use rather than re-deriving it from this text.

## index

### Components

- [accordion](references/accordion.md): A list of folds that share one value: one answer open at a time, or several.
- [alert-dialog](references/alert-dialog.md): A modal that asks rather than offers: the page behind it is inert and a click outside will not dismiss it, so the only way out is one of th...
- [avatar](references/avatar.md): A face, or the initials standing in for one, and the row a set of them is stacked in.
- [badge](references/badge.md): A word that labels the thing beside it.
- [button](references/button.md): The reference component: tailwind-variants API, token-driven appearance, data-slot / data-variant hooks.
- [card](references/card.md): One surface for one subject: a header with its title, description and action, a body that takes the slack, and a footer.
- [checkbox](references/checkbox.md): One of several, any number of them: a 16px box, the tick inside it, and a real hidden input so a form and a label both see a checkbox.
- [code](references/code.md): Highlighted source with optional line numbers, bare by default so Card can supply the surface, title and actions.
- [code-diff](references/code-diff.md): Two revisions of one file, side by side or stacked, with both line numberings, a per-side change stripe and the additions and deletions cou...
- [collapsible](references/collapsible.md): Disclosure region that expands and collapses one panel.
- [combobox](references/combobox.md): A select whose options are found by typing: the field is the control, so the chosen label stays in it and the query narrows the list under...
- [dialog](references/dialog.md): Modal dialog.
- [drawer](references/drawer.md): A panel that slides in from an edge and can be swiped away.
- [field](references/field.md): One control, its name, and the line beneath it: label, description and error joined to whatever control is inside, by Base UI's own wiring.
- [fieldset](references/fieldset.md): A heading over the fields it names, so a long form reads as several answers instead of one list.
- [form](references/form.md): The fields as one submission: it collects their values, checks them on submit, moves focus to the first one that failed, and files every ve...
- [hover-card](references/hover-card.md): A card that arrives when a pointer rests on the thing it is about - a name, a link - and stays open while the pointer moves into it, becaus...
- [input](references/input.md): A single line of text in the same 32 / 36 / 40 tiers a Button takes, so the two line up.
- [menu](references/menu.md): A menu of actions on a trigger: groups, a group label, separators, and one popup several detached triggers can share.
- [nav](references/nav.md): A list of navigation rows: groups, icons, active state, badges, inline sub rows, and a compact rail where a row with children opens them in...
- [pagination](references/pagination.md): Which page of the records you are on, and the way to another: a window of numbers that keeps the first and last page and collapses everythi...
- [popover](references/popover.md): Anchored panel that holds rich content.
- [progress](references/progress.md): How far a task has come: a groove, the fill inside it, and the number that names it, all read from one value.
- [radio-group](references/radio-group.md): Exactly one of these, and never none: Base UI's group and its radio as one namespace, so the value, the arrow keys and the dot between them...
- [scroll-area](references/scroll-area.md): A pane that scrolls under the platform's overlay bar: instead of the box's own, a track drawn over the content that stays out of sight unti...
- [select](references/select.md): One value out of many, in a list laid under the control that opened it: an Input's shell as a trigger with a caret that turns itself, a row...
- [separator](references/separator.md): A line between two regions, horizontal or vertical, announced as a separator.
- [skeleton](references/skeleton.md): Placeholder for content that has not arrived.
- [slider](references/slider.md): A setting that is a number on a line: a groove, what is already taken of it, and the knob you drag.
- [spinner](references/spinner.md): Default loading indicator: a container-query sized ring of pulsing dots, one em across so it matches the icon it replaces.
- [steps](references/steps.md): A sequence of steps as an ordered list: one current index makes the items before it finish and the ones after wait, and the connector is dr...
- [switch](references/switch.md): A track and a knob, on or off, in the space of one line of text.
- [table](references/table.md): Display structured records with native table semantics, borderless, outlined or filled surfaces, three spacing densities, row headers, sele...
- [tabs](references/tabs.md): One panel at a time, chosen from a row of tabs, with a highlight that travels between them - stacked and cross-fading, or all of them side...
- [textarea](references/textarea.md): Several lines of text in the same box as an Input.
- [toast](references/toast.md): Transient messages in a corner stack: behaviour from Base UI, appearance from tokens, and a Toaster that maps the queue to parts so a calle...
- [toggle](references/toggle.md): A control that stays where it was put: one setting spelled as a control rather than an action.
- [toggle-group](references/toggle-group.md): A set of toggles that are one control: one of them on at a time, or several, with the arrow keys moving between them and the whole row a si...
- [tooltip](references/tooltip.md): Hover and focus hint anchored to its trigger.
- [transition](references/transition.md): A box that keeps its size to what is inside it and glides to each new one - continuously, so a reflow, a late font or a swap does not move...

### Blocks

- [code-tree](references/code-tree.md): A flat list of paths drawn as the tree a person reads a project in: folders that open and close, one file active.
- [layout](references/layout.md): The responsive app shell: one nav array draws a desktop rail and a mobile navigation drawer, beside the surface a page scrolls in.

### Helpers

- [clipboard](references/clipboard.md): A copy button's two halves - the write, and the moment of 'copied' that says it landed - so every copy in the library forgets at the same s...
- [control](references/control.md): The five things every control in the library looks the same way: the tint a hover or a press leaves, the size an icon slot takes from the t...
- [measure](references/measure.md): Two numbers a glide cannot be written without: the box's padding and borders, and the screen-per-CSS-pixel scale an ancestor transform or a...
- [motion](references/motion.md): The springs the library moves with, in one place; a hook that drops them when the reader asked for less motion; and the timing helpers that...
- [shiki](references/shiki.md): The highlighter behind Code and CodeDiff: one shared core, a grammar per file fetched on demand, a light/dark colour pair per token so the...
- [surface](references/surface.md): What every floating surface shares: the layer ladder (a backdrop, a popup, a tooltip, a toast), the scrim, the way a popup arrives, the box...
- [utils](references/utils.md): clsx + tailwind-merge.

### Theme

- [palette](references/palette.md): The default light and dark page colours, under the shadcn/ui names, and the `--radius` the radius scale derives from.
- [theme](references/theme.md): The stylesheet every component reads: the `dark` variant, the `@theme` mappings, the interaction and motion tokens, the radius scale, the o...
