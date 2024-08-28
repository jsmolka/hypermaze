import { useSettingsStore } from '@/stores/settings';
import { defineStore } from 'pinia';

export const useStores = defineStore('stores', () => {
  const stores = {
    settings: useSettingsStore(),
  };

  const hydrate = async () => {
    for (const store of Object.values(stores)) {
      try {
        await store.hydrate();
      } catch (error) {
        console.error(error);
      }
    }
  };

  return { hydrate };
});
