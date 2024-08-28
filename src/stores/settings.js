import { Settings } from '@/modules/settings';
import { deserialize, serialize } from '@/utils/persist';
import { watchIgnorable } from '@vueuse/core';
import { get, set } from 'idb-keyval';
import { defineStore } from 'pinia';
import { ref } from 'vue';

const version = 1;

export const useSettingsStore = defineStore('settings', () => {
  const settings = ref(new Settings());

  const toJson = () => {
    return { version, data: serialize(settings.value) };
  };

  const fromJson = (data) => {
    if (data != null && data.version != null) {
      settings.value = deserialize(Settings, convert(data));
    }
  };

  const storageKey = 'settings';

  const persist = async () => {
    await set(storageKey, toJson());
  };

  const { ignoreUpdates } = watchIgnorable(settings, persist, { deep: true });

  const hydrate = async () => {
    const data = await get(storageKey);
    ignoreUpdates(() => fromJson(data));
  };

  return { settings, toJson, fromJson, hydrate, persist };
});

function convert(data) {
  const { version, data: settings } = data;
  switch (version) {
    case 1:
      break;
  }
  return settings;
}
