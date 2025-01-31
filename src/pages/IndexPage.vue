<template>
  <q-page class="flex flex-center">
    <div class="q-pa-md">
      <h2>Task Timer</h2>
      <div>
        <q-btn color="primary" label="Start" @click="startTask" />
        <q-btn color="secondary" label="Continue" @click="continueTask" />
        <q-btn color="accent" label="Next" @click="nextTask" />
        <q-btn color="warning" label="Break" @click="takeBreak" />
      </div>
      <div class="q-mt-md">
        <p>Total Time Spent: {{ totalTime }} seconds</p>
        <p>Time Remaining: {{ timeRemaining }} seconds</p>
      </div>
    </div>
  </q-page>
</template>

<script>
export default {
  data() {
    return {
      totalTime: 0,
      timeRemaining: 1500, // Example: 25 minutes in seconds
      timer: null,
    }
  },
  methods: {
    startTask() {
      this.resetTimer()
      this.timer = setInterval(() => {
        if (this.timeRemaining > 0) {
          this.timeRemaining--
          this.totalTime++
        } else {
          clearInterval(this.timer)
        }
      }, 1000)
    },
    continueTask() {
      // Logic to continue the task can be added here
      this.startTask()
    },
    nextTask() {
      // Logic for moving to the next task can be added here
      this.resetTimer()
    },
    takeBreak() {
      // Logic for taking a break can be added here
      clearInterval(this.timer)
    },
    resetTimer() {
      this.totalTime = 0
      this.timeRemaining = 1500 // Resetting to initial session time
      clearInterval(this.timer)
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
