import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import * as PlotlyJS from 'plotly.js-dist-min';
import { PlotlyModule } from 'angular-plotly.js';
import { PlotlyA11yModule } from 'plotly-a11y';

PlotlyModule.plotlyjs = PlotlyJS;
@NgModule({
    declarations: [
        AppComponent
    ],
    imports: [
        BrowserModule,
        AppRoutingModule,
        PlotlyModule,
        PlotlyA11yModule
    ],
    providers: [],
    bootstrap: [AppComponent]
})
export class AppModule { }
