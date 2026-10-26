// Every user-facing string of the site. One flat catalog per language;
// there is one language. Components and pages render these values and
// never hold literal copy.

export const messages = {
  siteName: "memorynote.io",
  crumb: "design system",
  toggleToDark: "Switch to dark",
  toggleToLight: "Switch to light",
  nav: {
    color: "Color",
    type: "Typography",
    space: "Spacing & radius",
    breakpoints: "Breakpoints",
    components: "Components",
  },
  lede: {
    color:
      "One leading color, a warm neutral ramp, and an accent that keeps AA contrast in both modes.",
    type: "Inter, self-hosted. One family carries every role; mono carries token values.",
    space: "A 4 px base unit and two radii: 8 for controls, 12 for cards.",
    breakpoints: "Mobile-first. Four stops.",
    components: "The four core components every future page is built from.",
  },
  section: {
    color: "Color",
    type: "Typography",
    space: "Spacing & radius",
    breakpoints: "Breakpoints",
    components: "Components",
  },
  tokenTable: {
    token: "token",
    light: "light",
    dark: "dark",
    contrast: "contrast (AA)",
  },
  scale: {
    role: "role",
    sample: "sample",
  },
  spacing: "Spacing",
  cornerRadius: "Corner radius",
  radiusControlsLabel: "controls",
  radiusCardsLabel: "cards",
  breakpointTable: {
    px: "px",
    appliesTo: "applies to",
  },
  components: {
    button: "Button",
    input: "Input",
    card: "Card",
    text: "Text",
    buttonTag: "radius 8",
    inputTag: "radius 8",
    cardTag: "radius 12",
    textTag: "roles",
    saveNote: "Save note",
    preview: "Preview",
    delete: "Delete",
    noteTitle: "Note title",
    notePlaceholder: "e.g. Ideas for the spring plan",
    noteHint: "Visible on every page you share.",
    cardTitle: "Morning run",
    cardMeta: "5.2 km · 28:14",
    cardBody: "Faster than Tuesday. The route along the river held up.",
    cardLink: "Edit note",
    cardDate: "Oct 25",
    textBody: "Notes link to each other.",
    textLink: "Open the linked note",
    textBodyTail: "to keep the trail.",
    textCaption: "last opened on the desk machine",
  },
  footer: {
    built: "built on dgxspark in Jozefoslaw.",
  },
} as const;
