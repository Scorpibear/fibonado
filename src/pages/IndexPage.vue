<template>
  <div class="q-pa-md">
    <div v-if="showButtons">
      <q-btn v-bind="buttons.startTask" @click="startTask" />
      <q-btn v-if="isRunning" v-bind="buttons.break" @click="startBreak" class="q-ml-sm" />
    </div>
    <div class="q-mt-md">
      <p v-if="onBreak" class="timer-row" @click="showSettings = !showSettings">
        Break: {{ formatTime(breakElapsed) }}
        <span class="settings-hint">⚙</span>
      </p>
      <p v-else class="timer-row" @click="showSettings = !showSettings">
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
import { ref, computed, watch } from 'vue'
import { Notify } from 'quasar'

const debugMode = true

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
const nextBreakTs = ref(null)
const focusOn = ref('')
const workDurationMinutes = ref(45)
const onBreak = ref(false)
const breakElapsed = ref(0)
const breakTimer = ref(null)

let clearNotification = () => {}

watch(nextBreak, (val) => {
  if (!val) {
    nextBreakTs.value = null
    return
  }
  const [h, m] = val.split(':').map(Number)
  if (isNaN(h) || isNaN(m)) {
    nextBreakTs.value = null
    return
  }
  const now = new Date()
  const target = new Date(now)
  target.setHours(h, m, 0, 0)
  if (target <= now) target.setDate(target.getDate() + 1)
  nextBreakTs.value = target.getTime()
})

const isDeservedBreak = computed(() => {
  void currentTime.value
  return nextBreakTs.value !== null && Date.now() >= nextBreakTs.value
})

const buttons = computed(() => {
  const deserved = isDeservedBreak.value
  const breakLabel = deserved ? 'Deserved break' : 'Break'
  return {
    continue: { label: 'Continue', color: deserved ? 'primary' : 'green' },
    startTask: { label: 'Start Another Task', color: deserved ? 'orange' : 'primary' },
    break: { label: breakLabel, color: deserved ? 'green' : 'grey' },
    breakNotify: { label: breakLabel, color: deserved ? 'green' : 'red' },
  }
})

function onSchemeChange() {
  if (!isRunning.value) applySchemeReset()
}

function applySchemeReset() {
  currentSession.value = 0
  timeRemaining.value = sessionDurationMinutes.value[0] * 60
}

function startTask() {
  if (!nextBreak.value) {
    const ts = Date.now() + workDurationMinutes.value * 60 * 1000
    nextBreakTs.value = ts
    nextBreak.value = getLocalTime(new Date(ts))
  }
  clearNotification()
  onBreak.value = false
  clearInterval(breakTimer.value)
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
  nextBreakTs.value = null
  focusOn.value = ''
  onBreak.value = true
  breakElapsed.value = 0
  breakTimer.value = setInterval(() => {
    breakElapsed.value++
    currentTime.value = getLocalTime(new Date())
  }, 1000)
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
      { ...buttons.value.continue, handler: continueTask },
      { ...buttons.value.startTask, handler: startTask },
      { ...buttons.value.breakNotify, handler: startBreak },
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
</style>
