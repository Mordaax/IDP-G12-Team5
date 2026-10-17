// Mounts the team's style guide (feat/style-guide → src/views/StyleGuideView.vue, a Vue page)
// inside the React /style-guide page. Loaded only when "Style Guide 2" is picked.
import { createApp } from 'vue'
import StyleGuideView from '@/views/StyleGuideView.vue'

export function mountTeamGuide(el) {
  const app = createApp(StyleGuideView)
  app.mount(el)
  return () => app.unmount()
}
