<template>
  <div class="q-pa-md">
    <h2>Task Timer</h2>
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

<script>
export default {
  data() {
    return {
      totalTime: 0,
      timeRemaining: 240, // Start with 4 minutes in seconds
      timer: null,
      showContinueButton: false,
      isStarted: false, // Track if the timer has started
      currentSessionIndex: 0,
      sessionDurations: [240, 420, 660, 1080], // Durations in seconds (4, 7, 11, and 18 minutes)
    }
  },
  methods: {
    startTask() {
      this.resetTimer()
      this.isStarted = true // Hide the Start button
      this.timer = setInterval(() => {
        if (this.timeRemaining > 0) {
          this.timeRemaining--
          this.totalTime++
        } else {
          clearInterval(this.timer)
          this.showContinueButton = true // Show continue button when time is up
        }
      }, 1000)
    },
    continueTask() {
      if (this.currentSessionIndex < this.sessionDurations.length - 1) {
        this.currentSessionIndex++
        this.timeRemaining = this.sessionDurations[this.currentSessionIndex]
        this.startTask()
      }
    },
    nextTask() {
      this.resetTimer() // Reset to the first session duration
    },
    takeBreak() {
      clearInterval(this.timer)
    },
    resetTimer() {
      this.totalTime = 0
      this.currentSessionIndex = 0 // Reset to the first session
      this.timeRemaining = this.sessionDurations[this.currentSessionIndex] // Reset to initial session time
      clearInterval(this.timer)
      this.showContinueButton = false // Hide continue button on reset
      this.isStarted = false // Show Start button again
    },
    formatTime(seconds) {
      const minutes = Math.floor(seconds / 60)
      const secs = seconds % 60
      return `${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`
    },
  },
}
</script>

<style scoped>
.q-pa-md {
  max-width: 400px;
  margin: auto;
}
</style>
