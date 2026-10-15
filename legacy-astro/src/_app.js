// Installed on every Vue island (the Events app is the only one): Pinia + the events router.
import { createPinia } from 'pinia'
import router from './router'

export default (app) => {
  app.use(createPinia())
  app.use(router)
}
