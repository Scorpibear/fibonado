<template>
  <div class="q-pa-md">
    <div v-if="showButtons">
      <q-btn color="primary" label="Start Another Task" @click="startTask" />
      <q-btn
        v-if="isRunning"
        :color="isDeservedBreak ? 'green' : 'grey'"
        :label="isDeservedBreak ? 'Deserved break' : 'Break'"
        @click="startBreak"
        class="q-ml-sm"
      />
    </div>
    <div class="q-mt-md">
      <p>Spent / Remaining: {{ formatTime(totalTime) }} / {{ formatTime(timeRemaining) }}</p>
      <p><label>Next break: </label><input v-model="nextBreak" size="14" /></p>
      <p><label>Focus on: </label><input v-model="focusOn" size="30" /></p>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { Notify } from 'quasar'

const debugMode = false

const getLocalTime = (date) =>
  new Intl.DateTimeFormat('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }).format(
    date,
  )

const formatTime = (seconds) =>
  `${String(Math.floor(seconds / 60)).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}`

// State
const sessionDurations = [240, 420, 660, 1080]
const currentTime = ref(getLocalTime(new Date()))
const timer = ref(null)
const isRunning = ref(false)
const showButtons = ref(true)
const totalTime = ref(0)
const timeRemaining = ref(sessionDurations[0])
const currentSessionIndex = ref(0)
const nextBreak = ref('')
const focusOn = ref('')

let clearNotification = () => {}

// Computed
const isDeservedBreak = computed(() => nextBreak.value && currentTime.value >= nextBreak.value)

// Actions
function startTask() {
  if (!nextBreak.value) nextBreak.value = getLocalTime(new Date(Date.now() + 45 * 60 * 1000))
  clearNotification()
  resetTimer()
  startTimer()
}

function continueTask() {
  clearNotification()
  if (currentSessionIndex.value < sessionDurations.length - 1) currentSessionIndex.value++
  timeRemaining.value = sessionDurations[currentSessionIndex.value]
  clearInterval(timer.value)
  showButtons.value = true
  startTimer()
}

function startBreak() {
  clearNotification()
  resetTimer()
  nextBreak.value = ''
  focusOn.value = ''
}

function startTimer() {
  isRunning.value = true
  timer.value = setInterval(
    () => {
      currentTime.value = getLocalTime(new Date())
      if (timeRemaining.value > 0) {
        const elapsed = debugMode ? 6 * (currentSessionIndex.value + 1) : 1
        timeRemaining.value -= elapsed
        totalTime.value += elapsed
      } else {
        clearInterval(timer.value)
        isRunning.value = false
        notifyEndOfPeriod()
      }
    },
    debugMode ? 100 : 1000,
  )
}

function notifyEndOfPeriod() {
  showButtons.value = false
  clearNotification = Notify.create({
    message: 'Time is up! What would you like to do next?',
    actions: [
      { label: 'Continue', color: 'green', handler: continueTask },
      { label: 'Start Another Task', color: 'primary', handler: startTask },
      { label: 'Break', color: 'red', handler: startBreak },
    ],
    timeout: 0,
  })
}

function resetTimer() {
  totalTime.value = 0
  currentSessionIndex.value = 0
  timeRemaining.value = sessionDurations[0]
  clearInterval(timer.value)
  isRunning.value = false
  showButtons.value = true
}
</script>

<style scoped>
.q-pa-md {
  max-width: 400px;
  margin: auto;
}
</style>
