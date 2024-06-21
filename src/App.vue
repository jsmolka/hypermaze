<template>
  <Layout v-if="layout" :layout="layout" />
  <RouterView v-else />
</template>

<script setup>
import Layout from '@/layouts/Layout.vue';
import { computed } from 'vue';
import { useRoute } from 'vue-router';

const route = useRoute();
const layout = computed(() => route.meta.layout);
</script>
