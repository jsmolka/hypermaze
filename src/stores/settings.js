import { Settings } from '@/modules/settings';
import { deserialize, serialize } from '@/utils/persist';
import { watchIgnorable } from '@vueuse/core';
import { get, set } from 'idb-keyval';
import { defineStore } from 'pinia';
import { ref } from 'vue';

const version = 1;
const id = 'settings';

export const useSettingsStore = defineStore(id, () => {
  const settings = ref(new Settings());

  const exportData = () => {
    return { version, data: serialize(settings.value) };
  };

  const persist = async () => {
    await set(id, exportData());
  };

  const { ignoreUpdates } = watchIgnorable(settings, persist, { deep: true });

  const importData = (data) => {
    if (data != null && data.version != null) {
      settings.value = deserialize(Settings, convert(data));
    }
  };

  const hydrate = async () => {
    const data = await get(id);
    ignoreUpdates(() => importData(data));
  };

  return { settings, hydrate };
});

function convert(data) {
  const { version, data: settings } = data;
  switch (version) {
  }
  return settings;
}
