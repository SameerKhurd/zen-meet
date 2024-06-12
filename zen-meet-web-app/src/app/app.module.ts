import { NgModule } from "@angular/core";
import { BrowserModule } from "@angular/platform-browser";

import { AppRoutingModule } from "./app-routing.module";
import { AppComponent } from "./app.component";

import { initializeApp, provideFirebaseApp } from "@angular/fire/app";
import { provideFirestore, getFirestore } from "@angular/fire/firestore";
import { FormsModule } from "@angular/forms";

import { environment } from "src/environments/environment";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";

import { MeetingControlButtonComponent } from "./pages/meeting-main/meeting-room/layout/meeting-control-button/meeting-control-button.component";
import { MeetingParticipantsComponent } from "./pages/meeting-main/meeting-room/layout/meeting-participants/meeting-participants.component";
import { MeetingMessagesComponent } from "./pages/meeting-main/meeting-room/layout/meeting-messages/meeting-messages.component";
import { HomeComponent } from "./pages/home/home.component";
import { MeetingMainComponent } from "./pages/meeting-main/meeting-main.component";
import { MatSlideToggleModule } from "@angular/material/slide-toggle";
import { MediaService } from "./services/media.service";
import { MeetingCollectionService } from "./services/database-services/meeting-collection.service";
import { MeetingService } from "./services/meeting.service";
import { ParticipantCollectionService } from "./services/database-services/participant-collection.service";
import { ConnectionCollectionService } from "./services/database-services/connection-collection.service";
import { MessageCollectionService } from "./services/database-services/message-collection.service";
import { MessagingService } from "./services/messaging.service";
import { PickerModule } from "@ctrl/ngx-emoji-mart";
import { EmojiPickerComponent } from "./common/emoji-picker/emoji-picker.component";
import { MatDialogModule } from "@angular/material/dialog";
import { MatMenuModule } from "@angular/material/menu";
import { DeviceSettingsDailogComponent } from "./dailog-modals/device-settings-dailog/device-settings-dailog.component";
import { InvitePeopleDailogComponent } from "./dailog-modals/invite-people-dailog/invite-people-dailog.component";
import { JoinMeetingDailogComponent } from "./dailog-modals/join-meeting-dailog/join-meeting-dailog.component";
import { EndMeetingComponent } from "./pages/meeting-main/end-meeting/end-meeting.component";
import { MeetingRoomComponent } from "./pages/meeting-main/meeting-room/meeting-room.component";
import { NewMeetingDailogComponent } from "./dailog-modals/new-meeting-dailog/new-meeting-dailog.component";
import { DeviceSettingsComponent } from "./common/device-settings/device-settings.component";
import { AuthService } from "./services/auth-service/auth.service";

@NgModule({
  declarations: [
    AppComponent,
    MeetingControlButtonComponent,
    MeetingParticipantsComponent,
    MeetingMessagesComponent,
    HomeComponent,
    MeetingMainComponent,
    EmojiPickerComponent,
    DeviceSettingsComponent,
    DeviceSettingsDailogComponent,
    InvitePeopleDailogComponent,
    JoinMeetingDailogComponent,
    NewMeetingDailogComponent,
    EndMeetingComponent,
    MeetingRoomComponent,
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
