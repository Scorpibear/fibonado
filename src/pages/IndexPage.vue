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
      <p class="timer-row" @click="showSettings = !showSettings">
        Spent / Remaining: {{ formatTime(totalTime) }} / {{ formatTime(timeRemaining) }}
        <span class="settings-hint">⚙</span>
      </p>

      <div v-if="showSettings" class="settings-panel">
        <p>
          <label>Work till deserved break: </label>
          <select v-model="workDurationMinutes">
            <option :value="45">45 min</option>
            <option :value="25">25 min</option>
          </select>
        </p>
        <p>
          <label>Scheme: </label>
          <select v-model="selectedSchemeKey" @change="onSchemeChange">
            <option v-for="(scheme, key) in schemes" :key="key" :value="key">{{ key }}</option>
          </select>
        </p>
      </div>
      <p><label>Next break: </label><input v-model="nextBreak" size="14" /></p>
      <p><input v-model="focusOn" size="35" placeholder="Focus on..." /></p>
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

// Schemes
const schemes = {
  '4-7-11-18': [4, 7, 11, 18],
  '2-3-5-8-13-21': [2, 3, 5, 8, 13, 21],
  '5-8-12-20': [5, 8, 12, 20],
}

const selectedSchemeKey = ref('4-7-11-18')
const sessionDurationMinutes = computed(() => schemes[selectedSchemeKey.value])

// State
const showSettings = ref(false)
const currentTime = ref(getLocalTime(new Date()))
const timer = ref(null)
const isRunning = ref(false)
const showButtons = ref(true)
const totalTime = ref(0)
const timeRemaining = ref(sessionDurationMinutes.value[0] * 60)
const currentSession = ref(0)
const nextBreak = ref('')
const focusOn = ref('')
const workDurationMinutes = ref(45)

let clearNotification = () => {}

const isDeservedBreak = computed(() => nextBreak.value && currentTime.value >= nextBreak.value)

function onSchemeChange() {
  if (!isRunning.value) applySchemeReset()
}

function applySchemeReset() {
  currentSession.value = 0
  timeRemaining.value = sessionDurationMinutes.value[0] * 60
}

function startTask() {
  if (!nextBreak.value)
    nextBreak.value = getLocalTime(new Date(Date.now() + workDurationMinutes.value * 60 * 1000))
  clearNotification()
  showSettings.value = false
  resetTimer()
  startTimer()
}

function continueTask() {
  clearNotification()
  if (currentSession.value < sessionDurationMinutes.value.length - 1) currentSession.value++
  timeRemaining.value = sessionDurationMinutes.value[currentSession.value] * 60
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
        const elapsed = debugMode ? 6 * (currentSession.value + 1) : 1
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
  currentSession.value = 0
  timeRemaining.value = sessionDurationMinutes.value[0] * 60
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
input,
select {
  height: 24px;
  box-sizing: border-box;
}
.timer-row {
  cursor: pointer;
  user-select: none;
}
.timer-row:hover {
  opacity: 0.75;
}
.settings-panel {
  border-left: 2px solid #ddd;
  padding-left: 10px;
  margin-bottom: 4px;
}
.scheme-preview {
  font-size: 0.8em;
  color: #888;
}
</style>
