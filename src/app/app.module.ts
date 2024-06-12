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
import { AuthService } from "./services/auth.service";
import { PickerModule } from "@ctrl/ngx-emoji-mart";
import { EmojiPickerComponent } from "./emoji-picker/emoji-picker.component";
import { MatDialogModule } from "@angular/material/dialog";
import { MatMenuModule } from "@angular/material/menu";
import { DeviceSettingsComponent } from './device-settings/device-settings.component';
import { DeviceSettingsDailogComponent } from './device-settings-dailog/device-settings-dailog.component';
import { InvitePeopleDailogComponent } from './invite-people-dailog/invite-people-dailog.component';
import { JoinMeetingDailogComponent } from './join-meeting-dailog/join-meeting-dailog.component';
import { NewMeetingDailogComponent } from './new-meeting-dailog/new-meeting-dailog.component';

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
    EmojiPickerComponent,
    DeviceSettingsComponent,
    DeviceSettingsDailogComponent,
    InvitePeopleDailogComponent,
    JoinMeetingDailogComponent,
    NewMeetingDailogComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    provideFirebaseApp(() => initializeApp(environment.firebase)),
    provideFirestore(() => getFirestore()),
    MatSlideToggleModule,
    FormsModule,
    BrowserAnimationsModule,
    PickerModule,
    MatDialogModule,
    MatMenuModule,
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
    AuthService,
    MessagingService,
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
