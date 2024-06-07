import { NgModule } from "@angular/core";
import { BrowserModule } from "@angular/platform-browser";

import { AppRoutingModule } from "./app-routing.module";
import { AppComponent } from "./app.component";

import { initializeApp, provideFirebaseApp } from "@angular/fire/app";
import { provideFirestore, getFirestore } from "@angular/fire/firestore";
import { FormsModule } from "@angular/forms";

import { environment } from "src/environments/environment";
import { DataService } from "./services/data.service";
import { VideoService } from "./services/video.service";
import { MeetingComponent } from "./meeting/meeting.component";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";

import { MeetingControlButtonComponent } from "./meeting-control-button/meeting-control-button.component";
import { MeetingParticipantsComponent } from "./meeting-participants/meeting-participants.component";
import { MeetingMessagesComponent } from "./meeting-messages/meeting-messages.component";
import { HomeComponent } from "./home/home.component";
import { MeetingMainComponent } from "./meeting-main/meeting-main.component";
import { MeetingStartComponent } from "./meeting-start/meeting-start.component";
import { MeetingJoinComponent } from "./meeting-join/meeting-join.component";
import { MatSlideToggleModule } from "@angular/material/slide-toggle";
import { MediaService } from "./services/media.service";
import { MeetingCollectionService } from "./services/database-services/meeting-collection.service";
import { MeetingService } from "./services/meeting.service";
import { ParticipantCollectionService } from "./services/database-services/participant-collection.service";
import { ConnectionCollectionService } from "./services/database-services/connection-collection.service";
import { MessageCollectionService } from "./services/database-services/message-collection.service";
import { MessagingService } from "./services/messaging.service";

@NgModule({
  declarations: [
    AppComponent,
    MeetingComponent,
    MeetingControlButtonComponent,
    MeetingParticipantsComponent,
    MeetingMessagesComponent,
    HomeComponent,
    MeetingMainComponent,
    MeetingStartComponent,
    MeetingJoinComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    provideFirebaseApp(() => initializeApp(environment.firebase)),
    provideFirestore(() => getFirestore()),
    MatSlideToggleModule,
    FormsModule,
    BrowserAnimationsModule,
  ],
  providers: [
    DataService,
    VideoService,
    MediaService,
    MeetingCollectionService,
    ParticipantCollectionService,
    ConnectionCollectionService,
    MessageCollectionService,
    MeetingService,
    MessagingService,
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
