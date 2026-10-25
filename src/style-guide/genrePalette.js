// The live catalogue is the single source for the guide and product genre colours.
import catalogue from '../data/artists.json' with { type: 'json' }

export const genreFamilies = catalogue.genreFamilies.map(family => ({
  ...family,
  variants: catalogue.subgenres.filter(child => child.familyId === family.id).map(child => ({
    label: child.label,
    saturation: child.colour.saturation,
    lightness: child.colour.lightness,
    foreground: child.colour.foreground ?? '#fff',
    textCss: child.colour.textCss ?? child.colour.css,
  })),
}))

export function variantColour(family, variant) {
  return `hsl(${family.hue} ${variant.saturation}% ${variant.lightness ?? family.lightness}%)`
}
