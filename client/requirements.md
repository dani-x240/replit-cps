## Packages
framer-motion | For smooth page transitions and animations
react-hook-form | For efficient form handling
@hookform/resolvers | For Zod schema validation in forms
recharts | For dashboard analytics and heatmaps
clsx | For conditional class names
tailwind-merge | For merging Tailwind classes

## Notes
Tailwind Config - extend fontFamily:
fontFamily: {
  display: ["'Outfit'", "sans-serif"],
  body: ["'DM Sans'", "sans-serif"],
  mono: ["'Fira Code'", "monospace"],
}

Tailwind Config - extend colors:
colors: {
  citizen: {
    DEFAULT: "hsl(var(--citizen))",
    foreground: "hsl(var(--citizen-foreground))",
  },
  police: {
    DEFAULT: "hsl(var(--police))",
    foreground: "hsl(var(--police-foreground))",
  },
}
