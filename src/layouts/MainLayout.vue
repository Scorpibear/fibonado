<template>
  <q-layout view="lHh Lpr lFf">
    <q-header elevated>
      <q-toolbar>
        <q-btn flat dense round icon="menu" aria-label="Menu" @click="toggleLeftDrawer" />
        <q-toolbar-title> Fibonado </q-toolbar-title>
        <div>v{{ productVersion }}</div>
      </q-toolbar>
    </q-header>

    <q-drawer v-model="leftDrawerOpen" show-if-above bordered>
      <q-list>
        <q-item-label header> Essential Links </q-item-label>
        <EssentialLink v-for="link in essentialLinks" :key="link.title" v-bind="link" />
      </q-list>
    </q-drawer>

    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script setup>
import { ref } from 'vue'
import packageInfo from '../../package.json' // Adjust the path based on your file structure
import EssentialLink from 'components/EssentialLink.vue'

const productVersion = ref(packageInfo.version) // Accessing the version from package.json

const essentialLinks = [
  {
    title: 'Docs',
    caption: 'fibonado.com',
    icon: 'school',
    link: 'https://fibonado.com/',
  },
  {
    title: 'Github',
    caption: 'github.com/Scorpibear/fibonado',
    icon: 'code',
    link: 'https://github.com/Scorpibear/fibonado',
  },
]

const leftDrawerOpen = ref(false)

function toggleLeftDrawer() {
  leftDrawerOpen.value = !leftDrawerOpen.value
}
</script>

<style scoped>
.q-pa-md {
  max-width: 400px;
  margin: auto;
}
</style>
