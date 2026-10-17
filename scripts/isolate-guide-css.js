// Tailwind emits property fallbacks outside the nested utilities block.
// Keep those and registered properties private too; never touch product CSS.
export function isolateGuideCss() {
  return {
    postcssPlugin: 'lrm-isolate-guide-css',
    OnceExit(root) {
      if (!root.source?.input.file?.replaceAll('\\', '/').endsWith('/src/style-guide/style-guide.css')) return
      const animations = new Set()
      root.walkAtRules('keyframes', rule => animations.add(rule.params))
      root.walkDecls(decl => {
        decl.prop = decl.prop.replaceAll('--tw-', '--sg-tw-')
        decl.value = decl.value.replaceAll('--tw-', '--sg-tw-')
        for (const name of animations) {
          decl.value = decl.value.replace(new RegExp(`(?<![\\w-])${name}(?![\\w-])`, 'g'), `sg-${name}`)
        }
      })
      root.walkAtRules(rule => {
        if (rule.name === 'property') rule.params = rule.params.replaceAll('--tw-', '--sg-tw-')
        if (rule.name === 'keyframes') rule.params = `sg-${rule.params}`
        if (rule.name === 'layer' && rule.params === 'properties') rule.params = 'sg-properties'
      })
      root.walkRules(rule => {
        // Only the generated @supports property fallback has a global selector.
        // Keyframe steps are not DOM selectors.
        if (rule.parent?.type === 'atrule' && rule.parent.name.endsWith('keyframes')) return
        if (!rule.selector.includes('.style-guide')) {
          rule.selector = rule.selectors.map(selector => `.style-guide ${selector}`).join(', ')
        }
      })
    },
  }
}
