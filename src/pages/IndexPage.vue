<template>
  <div class="q-pa-md">
    <div v-if="showButtons">
      <div v-if="showContinueButton">
        <q-btn
          v-for="(button, index) in actionButtons"
          :key="index"
          :color="button.color"
          :label="button.label"
          @click="button.handler"
        />
      </div>
      <div v-else>
        <q-btn color="primary" label="Start Another Task" @click="startTask" />
      </div>
    </div>
    <div class="q-mt-md">
      <p>Spent / Remaining: {{ formatTime(totalTime) }} / {{ formatTime(timeRemaining) }}</p>
      <label>Next Break: </label><input size="14" />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { Notify } from 'quasar'

const totalTime = ref(0)
const timeRemaining = ref(240) // Start with 4 minutes in seconds
const timer = ref(null)
const showContinueButton = ref(false)
const showButtons = ref(true)
const currentSessionIndex = ref(0)
const sessionDurations = [240, 420, 660, 1080] // Durations in seconds

// Debug mode flag
const debugMode = true // Set to true to enable debug mode

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
]

let clearNotification = () => {}

// On component mount, check localStorage for last break time
onMounted(() => {})

function startTask() {
  clearNotification()
  showButtons.value = true
  resetTimer()
  startTimer(sessionDurations[currentSessionIndex.value])
}

function continueTask() {
  clearNotification()
  showButtons.value = true
  if (currentSessionIndex.value < sessionDurations.length - 1) {
    currentSessionIndex.value++
  }
  timeRemaining.value = sessionDurations[currentSessionIndex.value]
  clearInterval(timer.value)
  showContinueButton.value = false // Hide continue button on reset
  startTimer(timeRemaining.value)
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
        showContinueButton.value = true // Show continue button when time is up
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

  showContinueButton.value = false // Hide continue button on reset
}

function formatTime(seconds) {
  const minutes = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`
}
</script>

<style scoped>
.q-pa-md {
  max-width: 400px;
  margin: auto;
}
</style>
