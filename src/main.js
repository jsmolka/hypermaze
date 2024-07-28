import App from '@/App.vue';
import '@/main.scss';
import { router } from '@/router';
import { useSettingsStore } from '@/stores/settings';
import { createPinia } from 'pinia';
import { createApp } from 'vue';

async function main() {
  const app = createApp(App);
  app.use(createPinia());

  const store = useSettingsStore();
  await store.hydrate();

  app.use(router);
  app.mount('#app');
}

main();
