// Entry point of the Events section (Vue 3 + Bootstrap), served by events.html for /events/*.
// The rest of the site is the React app in main.jsx; links between the two are plain <a href>.
import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router/events'

createApp(App).use(createPinia()).use(router).mount('#app')
