import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'timeSpan'
})
export class TimeSpanPipe implements PipeTransform {

  transform(milliseconds: number): string {
    const totalSeconds = Math.floor(milliseconds / 1000);
    const totalMinutes = Math.floor(totalSeconds / 60);
    const totalHours = Math.floor(totalMinutes / 60);
    const dd = Math.floor(totalHours / 24);
    const ss = totalSeconds % 60;
    const mm = totalMinutes % 60;
    const hh = totalHours % 24;
    return `${dd > 0 ? `${dd}d` : ''}${totalHours > 0 ? `${hh}:` : ''}${totalHours > 0 ? this.toLeadZero(mm) : mm}:${this.toLeadZero(ss)}`;
  }

  toLeadZero(value: number): string {
    return value.toString().padStart(2, '0');
  }

}
