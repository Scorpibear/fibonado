<template>
  <div class="q-pa-md">
    <div>
      <q-btn v-if="!isStarted" color="primary" label="Start" @click="startTask" />
      <q-btn v-if="showContinueButton" color="secondary" label="Continue" @click="continueTask" />
      <q-btn color="accent" label="Next" @click="nextTask" />
      <q-btn color="warning" label="Break" @click="takeBreak" />
    </div>
    <div class="q-mt-md">
      <p>Total Time Spent: {{ formatTime(totalTime) }}</p>
      <p>Time Remaining: {{ formatTime(timeRemaining) }}</p>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { Notify } from 'quasar'

const totalTime = ref(0)
const timeRemaining = ref(240) // Start with 4 minutes in seconds
const timer = ref(null)
const showContinueButton = ref(false)
const isStarted = ref(false)
const currentSessionIndex = ref(0)
const sessionDurations = [240, 420, 660, 1080] // Durations in seconds

function startTask() {
  resetTimer()
  isStarted.value = true // Hide the Start button
  timer.value = setInterval(() => {
    if (timeRemaining.value > 0) {
      timeRemaining.value--
      totalTime.value++
    } else {
      clearInterval(timer.value)
      showContinueButton.value = true // Show continue button when time is up
      notifyEndOfPeriod()
    }
  }, 1000)
}

function notifyEndOfPeriod() {
  Notify.create({
    message: 'Time is up! What would you like to do next?',
    actions: [
      { label: 'Continue', color: 'green', handler: continueTask },
      { label: 'Take a Break', color: 'orange', handler: takeBreak },
      { label: 'Start Another Task', color: 'blue', handler: nextTask },
    ],
    timeout: 0, // Keep notification until user interacts
  })
}

function continueTask() {
  if (currentSessionIndex.value < sessionDurations.length - 1) {
    currentSessionIndex.value++
    timeRemaining.value = sessionDurations[currentSessionIndex.value]
    startTask()
  }
}

function nextTask() {
  resetTimer() // Reset to the first session duration
}

function takeBreak() {
  clearInterval(timer.value)
}

function resetTimer() {
  totalTime.value = 0
  currentSessionIndex.value = 0 // Reset to the first session
  timeRemaining.value = sessionDurations[currentSessionIndex.value] // Reset to initial session time
  clearInterval(timer.value)
  showContinueButton.value = false // Hide continue button on reset
  isStarted.value = false // Show Start button again
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
