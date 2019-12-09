import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { HomeRoutingModule } from './home-routing.module';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { HomeComponent } from './home.component';
import { SharedModule } from '../shared/shared.module';
import { TimeSpanPipe } from '../shared/pipes/time-span.pipe';

@NgModule({
  declarations: [HomeComponent, TimeSpanPipe],
  imports: [
    CommonModule,
    SharedModule,
    HomeRoutingModule,
    BrowserAnimationsModule
  ]
})
export class HomeModule {}
