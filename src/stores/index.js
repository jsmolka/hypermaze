import { useSettingsStore } from '@/stores/settings';
import { defineStore } from 'pinia';

export const useStores = defineStore('stores', () => {
  const stores = [useSettingsStore()];

  const toJson = () => {
    const data = {};
    for (const store of stores) {
      data[store.$id] = store.toJson();
    }
    return data;
  };

  const fromJson = (data) => {
    for (const store of stores) {
      store.fromJson(data[store.$id]);
    }
  };

  const hydrate = async () => {
    try {
      await Promise.all(stores.map((store) => store.hydrate?.()));
    } catch (error) {
      console.error(error);
    }
  };

  return { toJson, fromJson, hydrate };
});
