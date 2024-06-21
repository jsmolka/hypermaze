import App from '@/App.vue';
import '@/main.scss';
import { router } from '@/router';
import { createPinia } from 'pinia';
import { createApp } from 'vue';

function main() {
  const app = createApp(App);
  app.use(createPinia());
  app.use(router);
  app.mount('#app');
}

main();
