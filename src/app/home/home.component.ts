import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
  queues = [[4, 7, 11, 18, 30, 45, 75],[5, 10, 15, 25, 40, 60, 90]];
  activeQueueIndex = 0;
  activePeriodIndex = 0;
  debug = false;
  taskStarted = null;
  timeSpent = 0;
  timerId: any;
  periodFinished = false;
  minBreakTime = 30 * 60 * 1000; 
  constructor() {
    
  }

  ngOnInit(): void {
    setInterval(() => {
      if(this.taskStarted) {
        const now = Date.now();
        const passed = (now - this.taskStarted);
        this.timeSpent = passed;
      }
    }, 100) 
  }

  getQueue() {
    return this.queues[this.activeQueueIndex];
  }

  getTime() {
    return this.getQueue()[this.activePeriodIndex];
  }

  getTimeInMs() {
    return this.getTime() * 1000 * (this.debug ? 1 : 60);
  }

  reset() {
    if(this.timerId) {
      clearTimeout(this.timerId);
    }
    this.activePeriodIndex = 0;
    this.taskStarted = null;
  }

  start() {
    this.reset();
    this.taskStarted = Date.now();
    this.nextPeriod();
  }
  nextPeriod() {
    this.periodFinished = false;
    this.timerId = setTimeout(() => {
      this.activePeriodIndex++;
      this.periodFinished = true;
      new Notification('Time is up!', {
        body: "time is up"
      })
    }, this.getTimeInMs());
  }
  isTimeToBreak() {
    return this.taskStarted && this.timeSpent >= this.minBreakTime;
  }
  break() {
    this.reset();
  }
}
