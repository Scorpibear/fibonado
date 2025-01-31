<template>
  <div class="q-pa-md">
    <div>
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
      <q-btn
        v-if="timeUntilDeservedBreak <= 0"
        color="warning"
        label="Take a Break"
        @click="takeBreak"
      />
    </div>
    <div class="q-mt-md">
      <p>Total Time Spent: {{ formatTime(totalTime) }}</p>
      <p>Time Remaining: {{ formatTime(timeRemaining) }}</p>
      <p v-if="isOnBreak">Time in Break: {{ formatTime(breakTime) }}</p>
      <p v-else>
        Time to Deserved Break:
        {{ timeUntilDeservedBreak > 0 ? formatTime(timeUntilDeservedBreak) : 'Now!' }}
      </p>
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
const currentSessionIndex = ref(0)
const sessionDurations = [240, 420, 660, 1080] // Durations in seconds

// New variable to track time until deserved break
const timeUntilDeservedBreak = ref(0)
let breakTimer = null // Timer for tracking time since last break
const breakTime = ref(0) // Track time spent during breaks
const isOnBreak = ref(false) // Flag to indicate if currently on a break
const acceptableWorkTime = 2700

// Debug mode flag
const debugMode = false // Set to true to enable debug mode

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
onMounted(() => {
  const lastBreakTime = localStorage.getItem('lastBreakTime')

  if (lastBreakTime) {
    const elapsedTime = Math.floor((Date.now() - Number(lastBreakTime)) / 1000) // Calculate elapsed time in seconds
    updateDeservedBreakTime(elapsedTime) // Update the time until deserved break based on elapsed time
  } else {
    localStorage.setItem('lastBreakTime', Date.now())
    timeUntilDeservedBreak.value = 2700 // Set default to 45 minutes (2700 seconds)
  }
})

function startTask() {
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

        // Update the countdown for "Time to Deserved Break"
        if (timeUntilDeservedBreak.value > 0) {
          timeUntilDeservedBreak.value -= elapsedSeconds
        }
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

function takeBreak() {
  clearNotification()
  clearInterval(timer.value)

  if (breakTimer) {
    clearInterval(breakTimer)
  }

  updateDeservedBreakTime(0)

  isOnBreak.value = true
  showContinueButton.value = false

  breakTimer = setInterval(() => {
    breakTime.value++ // Increment every second while on break
  }, 1000)
}

function updateDeservedBreakTime(elapsedSeconds) {
  if (elapsedSeconds >= acceptableWorkTime) {
    timeUntilDeservedBreak.value = Math.max(0, acceptableWorkTime - elapsedSeconds)
    return
  }

  timeUntilDeservedBreak.value = acceptableWorkTime - elapsedSeconds
}

function resetTimer() {
  totalTime.value = 0
  currentSessionIndex.value = 0 // Reset to the first session
  timeRemaining.value = sessionDurations[currentSessionIndex.value] // Reset to initial session time
  clearInterval(timer.value)

  showContinueButton.value = false // Hide continue button on reset
  if (isOnBreak.value) {
    localStorage.setItem('lastBreakTime', Date.now())
    isOnBreak.value = false
  }

  if (breakTimer) {
    clearInterval(breakTimer)
    breakTimer = null
    timeUntilDeservedBreak.value = acceptableWorkTime
  }
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
