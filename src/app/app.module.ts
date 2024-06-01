import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';

import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { provideFirestore, getFirestore } from '@angular/fire/firestore';
import { FormsModule } from '@angular/forms';

import { environment } from 'src/environments/environment';
import { DataService } from './services/data.service';
import { VideoService } from './services/video.service';
import { MeetingComponent } from './meeting/meeting.component';

@NgModule({
  declarations: [AppComponent, MeetingComponent],
  imports: [
    BrowserModule,
    AppRoutingModule,
    provideFirebaseApp(() => initializeApp(environment.firebase)),
    provideFirestore(() => getFirestore()),

    FormsModule,
  ],
  providers: [DataService, VideoService],
  bootstrap: [AppComponent],
})
export class AppModule {}
