import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { NotifyDialogComponent } from '../shared/components/notify-dialog/notify-dialog.component';

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
  constructor(public dialog: MatDialog) {
    
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

  start() {
    if(this.timerId) {
      clearTimeout(this.timerId);
    }
    this.activePeriodIndex = 0;
    this.taskStarted = Date.now();
    this.nextPeriod();
  }
  nextPeriod() {
    this.periodFinished = false;
    this.timerId = setTimeout(() => {
      this.activePeriodIndex++;
      this.periodFinished = true;
      let dialogRef = this.dialog.open(NotifyDialogComponent, {
        height: '200px',
        width: '570px',
        role: 'alertdialog',
        disableClose: true
      });
      dialogRef.afterClosed().subscribe(result => {
        switch(result) {
          case 'continue': setTimeout(() => {
            this.nextPeriod()}, 0); break;
          case 'next': setTimeout(() => {
            this.start()}, 0); break;
          case 'break': console.error('not supported yet'); break;
          default: console.error(`Unexpected dialog result returned: '${result}'`); break;
        }
      });
    }, this.getTimeInMs());
  }
  isTimeToBreak() {
    return this.timeSpent >= this.minBreakTime;
  }
}
