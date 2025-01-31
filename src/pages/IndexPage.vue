<template>
  <div class="q-pa-md">
    <div>
      <q-btn color="primary" label="Start Another Task" @click="startTask" />

      <div v-if="showContinueButton">
        <q-btn
          v-for="(button, index) in actionButtons"
          :key="index"
          :color="button.color"
          :label="button.label"
          @click="button.handler"
        />
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
      <p>
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
const isStarted = ref(false)
const currentSessionIndex = ref(0)
const sessionDurations = [240, 420, 660, 1080] // Durations in seconds

// New variable to track time until deserved break
const timeUntilDeservedBreak = ref(0)
let breakTimer = null // Timer for tracking time since last break

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
    color: 'blue',
    handler: nextTask,
  },
]

// On component mount, check localStorage for last break time
onMounted(() => {
  const lastBreakTime = localStorage.getItem('lastBreakTime')

  if (lastBreakTime) {
    const elapsedTime = Math.floor((Date.now() - Number(lastBreakTime)) / 1000) // Calculate elapsed time in seconds
    updateDeservedBreakTime(elapsedTime) // Update the time until deserved break based on elapsed time
  } else {
    // If no last break time exists, initialize it to the current time
    localStorage.setItem('lastBreakTime', Date.now())
    timeUntilDeservedBreak.value = 2700 // Set default to 45 minutes (2700 seconds)
  }
})

function startTask() {
  resetTimer()
  isStarted.value = true // Task has started
  timer.value = setInterval(
    () => {
      if (timeRemaining.value > 0) {
        // Adjust for debug mode (4 minutes in 4 seconds)
        const elapsedSeconds = debugMode ? 6 : 1 // Use normal increment or accelerated

        timeRemaining.value -= elapsedSeconds
        totalTime.value += elapsedSeconds

        // Update the countdown for "Time to Deserved Break"
        if (timeUntilDeservedBreak.value > 0) {
          timeUntilDeservedBreak.value-- // Decrease every second
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
  Notify.create({
    message: 'Time is up! What would you like to do next?',
    actions: actionButtons.map((button) => ({
      label: button.label,
      color: button.color,
      handler: button.handler,
    })),
    timeout: 0, // Keep notification until user interacts
  })
}

function continueTask() {
  console.debug('Continuing task...')
  if (currentSessionIndex.value < sessionDurations.length - 1) {
    currentSessionIndex.value++
  }

  // Set remaining time to the next session duration
  timeRemaining.value = sessionDurations[currentSessionIndex.value]
  console.debug('Time remaining:', timeRemaining.value)

  clearInterval(timer.value)

  showContinueButton.value = false // Hide continue button on reset

  isStarted.value = true // Task has started
  timer.value = setInterval(
    () => {
      if (timeRemaining.value > 0) {
        // Adjust for debug mode (4 minutes in 4 seconds)
        const elapsedSeconds = debugMode ? 6 * (currentSessionIndex.value + 1) : 1 // Use normal increment or accelerated

        timeRemaining.value -= elapsedSeconds
        totalTime.value += elapsedSeconds

        // Update the countdown for "Time to Deserved Break"
        if (timeUntilDeservedBreak.value > 0) {
          timeUntilDeservedBreak.value-- // Decrease every second
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

function nextTask() {
  resetTimer() // Reset to the first session duration
}

function takeBreak() {
  clearInterval(timer.value)

  // Store the current timestamp in localStorage when taking a break
  localStorage.setItem('lastBreakTime', Date.now())

  // Reset and start tracking time until next deserved break
  if (breakTimer) {
    clearInterval(breakTimer)
  }

  updateDeservedBreakTime(0) // Reset and start tracking from now
}

function updateDeservedBreakTime(elapsedSeconds) {
  const totalDurationForNextBreak = 2700 // Set desired duration for breaks (45 minutes in seconds)

  // Calculate remaining time until next deserved break
  if (elapsedSeconds >= totalDurationForNextBreak) {
    timeUntilDeservedBreak.value = Math.max(0, totalDurationForNextBreak - elapsedSeconds)
    return
  }

  timeUntilDeservedBreak.value = totalDurationForNextBreak - elapsedSeconds
}

function resetTimer() {
  totalTime.value = 0
  currentSessionIndex.value = 0 // Reset to the first session
  timeRemaining.value = sessionDurations[currentSessionIndex.value] // Reset to initial session time
  clearInterval(timer.value)

  showContinueButton.value = false // Hide continue button on reset
  isStarted.value = false // Show Start button again if needed

  // Clear break timer when resetting
  if (breakTimer) {
    clearInterval(breakTimer)
    breakTimer = null // Reset break timer reference
    timeUntilDeservedBreak.value = Math.max(0, timeUntilDeservedBreak.value) // Ensure it doesn't go negative on reset.
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
