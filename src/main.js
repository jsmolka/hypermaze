import App from '@/App.vue';
import '@/main.scss';
import { router } from '@/router';
import { useStores } from '@/stores';
import { createPinia } from 'pinia';
import { createApp } from 'vue';

async function main() {
  const app = createApp(App);
  app.use(createPinia());

  const stores = useStores();
  await stores.hydrate();

  app.use(router);
  app.mount('#app');
}

main();
