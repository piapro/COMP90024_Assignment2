import {BrowserModule} from '@angular/platform-browser';
import {NgModule} from '@angular/core';

import {AgmCoreModule} from '@agm/core';
import {AgmSnazzyInfoWindowModule} from '@agm/snazzy-info-window';
import {AgmJsMarkerClustererModule} from '@agm/js-marker-clusterer';


import {ChartsModule} from 'ng2-charts/ng2-charts';
import {FormsModule} from '@angular/forms';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {MatButtonModule, MatDialogModule, MatCheckboxModule} from '@angular/material';
import {HttpClientModule} from '@angular/common/http';
import {AppComponent, DialogComponent} from './app.component/app.component';
import {DBService} from './db.service/db.service';


@NgModule({
  declarations: [
    AppComponent,
    DialogComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    FormsModule,
    MatButtonModule,
    HttpClientModule,
    MatDialogModule,
    MatCheckboxModule,
    ChartsModule,
    AgmCoreModule.forRoot({
      apiKey: 'AIzaSyDfnD1_7ok9l6GdHUWU21uxdQvOMpMOty4',
      language: 'en',
      region: 'au'
    }),
    AgmSnazzyInfoWindowModule,
    AgmJsMarkerClustererModule,
  ],
  entryComponents: [AppComponent, DialogComponent],
  providers: [DBService],
  bootstrap: [AppComponent]
})
export class AppModule {
}
