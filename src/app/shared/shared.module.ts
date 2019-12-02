import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { TranslateModule } from '@ngx-translate/core';

import { PageNotFoundComponent } from './components/';
import { WebviewDirective } from './directives/';
import { FormsModule } from '@angular/forms';
import { NotifyDialogComponent } from './components/notify-dialog/notify-dialog.component';
import { MatDialogModule } from '@angular/material';

@NgModule({
  declarations: [PageNotFoundComponent, WebviewDirective, NotifyDialogComponent],
  imports: [CommonModule, TranslateModule, FormsModule, MatDialogModule],
  exports: [TranslateModule, WebviewDirective, FormsModule]
})
export class SharedModule {}
