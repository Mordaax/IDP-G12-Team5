import test from 'node:test'
import assert from 'node:assert/strict'
import { genreFamilies, variantColour } from './genrePalette.js'

function contrastOnWhite(rgb) {
  const linear = rgb.map(value => value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4)
  return 1.05 / (linear.reduce((sum, value, i) => sum + value * [0.2126, 0.7152, 0.0722][i], 0) + 0.05)
}

function hslToRgb(hue, saturation, lightness) {
  const s = saturation / 100
  const l = lightness / 100
  const a = s * Math.min(l, 1 - l)
  return [0, 8, 4].map(n => {
    const k = (n + hue / 30) % 12
    return l - a * Math.max(-1, Math.min(k - 3, 9 - k, 1))
  })
}

test('seven families retain their variants with Synthwave extending Electronic to five', () => {
  assert.deepEqual(genreFamilies.map(f => f.label), ['Pop', 'Rock & Alternative', 'Punk & Metal', 'Hip-Hop', 'R&B / Soul', 'Electronic / EDM', 'Traditional'])
  for (const family of genreFamilies) {
    const expectedVariants = family.id === 'electronic' ? 5 : 4
    assert.equal(family.variants.length, expectedVariants)
    assert.equal(new Set(family.variants.map(v => v.label)).size, expectedVariants)
    let previousLightness = family.lightness
    for (const variant of family.variants) {
      if (family.id === 'punk-metal') {
        assert.equal(family.saturation, 0)
        assert.equal(variant.saturation, 0)
        assert.ok(variant.lightness > previousLightness)
        previousLightness = variant.lightness
      } else assert.ok(variant.saturation > 0 && variant.saturation < family.saturation)
      assert.equal(variantColour(family, variant), `hsl(${family.hue} ${variant.saturation}% ${variant.lightness ?? family.lightness}%)`)
    }
  }
})

test('formerly faded variants use saturated medium-light colours in their original family hue', () => {
  const labels = ['Dream pop', 'Shoegaze', 'Trap', 'Alternative R&B', 'Techno', 'Xinyao']
  for (const family of genreFamilies) for (const variant of family.variants.filter(v => labels.includes(v.label))) {
    assert.ok(variant.saturation >= 65 && variant.saturation <= 80, `${variant.label} needs richer colour`)
    assert.ok(variant.lightness >= 58 && variant.lightness <= 70, `${variant.label} needs medium-light brightness, not a washed-out tint`)
    assert.equal(variant.textCss, `hsl(${family.hue} 65% 30%)`)
    assert.ok(contrastOnWhite(hslToRgb(family.hue, 65, 30)) >= 4.5, `${variant.label}: label contrast`)
  }
})

test('all 36 anchor and child fills have AA contrast with their assigned text colour', () => {
  const ratios = []
  for (const family of genreFamilies) {
    const rgb = family.hex.slice(1).match(/../g).map(value => parseInt(value, 16) / 255)
    const derived = hslToRgb(family.hue, family.saturation, family.lightness)
    rgb.forEach((value, i) => assert.ok(Math.abs(value - derived[i]) < 0.0001))
    ratios.push(contrastOnWhite(rgb))
    for (const variant of family.variants) {
      const whiteRatio = contrastOnWhite(hslToRgb(family.hue, variant.saturation, variant.lightness ?? family.lightness))
      const ratio = variant.foreground === '#272522'
        ? contrastOnWhite([39 / 255, 37 / 255, 34 / 255]) / whiteRatio : whiteRatio
      if (variant.textCss !== variantColour(family, variant)) assert.equal(variant.foreground, '#272522')
      assert.ok(ratio >= 4.5, `${family.label} / ${variant.label}: ${ratio}`)
      ratios.push(ratio)
    }
  }
  assert.equal(ratios.length, 36)
  assert.ok(Math.min(...ratios) >= 4.5)
})

test('Rock is vibrant orange and Punk & Metal uses a neutral black-to-grey scale', () => {
  const rock = genreFamilies.find(f => f.id === 'rock')
  assert.ok(rock.hue >= 10 && rock.hue <= 30)
  assert.ok(rock.saturation >= 90 && rock.lightness >= 40)
  const punk = genreFamilies.find(f => f.id === 'punk-metal')
  assert.equal(punk.hex, '#181818')
  assert.equal(punk.saturation, 0)
})

test('coloured children vary visibly in saturation AND lightness while retaining family hue', () => {
  for (const family of genreFamilies.filter(f => f.id !== 'punk-metal')) {
    const saturations = family.variants.map(v => v.saturation)
    const lightnesses = family.variants.map(v => v.lightness)
    assert.ok(Math.max(...saturations) - Math.min(...saturations) >= 35, `${family.label}: saturation variation`)
    assert.ok(Math.max(...lightnesses) - Math.min(...lightnesses) >= 20, `${family.label}: brightness variation`)
  }
})
