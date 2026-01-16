<template>
  <div class="q-pa-md">
    <div v-if="showButtons">
      <q-btn color="primary" label="Start Another Task" @click="startTask" />
    </div>
    <div class="q-mt-md">
      <p>Spent / Remaining: {{ formatTime(totalTime) }} / {{ formatTime(timeRemaining) }}</p>
      <p><label>Next break: </label><input :value="nextBreak" size="14" /></p>
      <p><label>Focus on: </label><input :value="focusOn" size="30" /></p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { Notify } from 'quasar'

// Debug mode flag
const debugMode = false // Set to true to enable debug mode

const totalTime = ref(0)
const timeRemaining = ref(240) // Start with 4 minutes in seconds
const timer = ref(null)
const showButtons = ref(true)
const nextBreak = ref('')
const focusOn = ref('')
const currentSessionIndex = ref(0)
const sessionDurations = [240, 420, 660, 1080] // Durations in seconds

// Define button configurations
const actionButtons = [
  {
    label: 'Continue',
    color: 'green',
    handler: continueTask,
  },
  {
    label: 'Start Another Task',
    color: 'primary',
    handler: startTask,
  },
  {
    label: 'Break',
    color: 'red',
    handler: startBreak,
  },
]

// when not started or break started, show only 'Start another task'
// when working, show only 'Start another task'
// when period is reached, hide all buttons, show notification with buttons

let clearNotification = () => {}

// On component mount, check localStorage for last break time
onMounted(() => {})

function calcNextBreak() {
  nextBreak.value = getLocalTime(new Date(Date.now() + 45 * 60 * 1000))
}

function startTask() {
  if (!nextBreak.value) calcNextBreak()
  clearNotification()
  resetTimer()
  startTimer(sessionDurations[currentSessionIndex.value])
}

function continueTask() {
  clearNotification()
  if (currentSessionIndex.value < sessionDurations.length - 1) {
    currentSessionIndex.value++
  }
  timeRemaining.value = sessionDurations[currentSessionIndex.value]
  clearInterval(timer.value)
  showButtons.value = true
  startTimer(timeRemaining.value)
}

function startBreak() {
  clearNotification()
  resetTimer()
  nextBreak.value = ''
  focusOn.value = ''
}

function startTimer() {
  timer.value = setInterval(
    () => {
      if (timeRemaining.value > 0) {
        const elapsedSeconds = debugMode ? 6 * (currentSessionIndex.value + 1) : 1 // Adjust for debug mode
        timeRemaining.value -= elapsedSeconds
        totalTime.value += elapsedSeconds
      } else {
        clearInterval(timer.value)
        notifyEndOfPeriod()
      }
    },
    debugMode ? 100 : 1000,
  ) // Run every second in debug mode too
}

function notifyEndOfPeriod() {
  showButtons.value = false
  clearNotification = Notify.create({
    message: 'Time is up! What would you like to do next?',
    actions: actionButtons.map((button) => ({
      label: button.label,
      color: button.color,
      handler: button.handler,
    })),
    timeout: 0, // Keep notification until user interacts
  })
}

function resetTimer() {
  totalTime.value = 0
  currentSessionIndex.value = 0 // Reset to the first session
  timeRemaining.value = sessionDurations[currentSessionIndex.value] // Reset to initial session time
  clearInterval(timer.value)
  showButtons.value = true
}

function formatTime(seconds) {
  const minutes = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`
}

const getLocalTime = (date) =>
  new Intl.DateTimeFormat('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(date)
</script>

<style scoped>
.q-pa-md {
  max-width: 400px;
  margin: auto;
}
</style>
