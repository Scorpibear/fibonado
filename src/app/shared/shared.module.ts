import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { TranslateModule } from '@ngx-translate/core';

import { PageNotFoundComponent } from './components/';
import { WebviewDirective } from './directives/';
import { FormsModule } from '@angular/forms';
import { TimeSpanPipe } from './pipes/time-span.pipe';
import { NotifyDialogComponent } from './components/notify-dialog/notify-dialog.component';

@NgModule({
  declarations: [PageNotFoundComponent, WebviewDirective, TimeSpanPipe, NotifyDialogComponent],
  imports: [CommonModule, TranslateModule, FormsModule],
  exports: [TranslateModule, WebviewDirective, FormsModule]
})
export class SharedModule {}
