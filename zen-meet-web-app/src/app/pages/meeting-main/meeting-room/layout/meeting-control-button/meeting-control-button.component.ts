import { Component, Input, OnInit } from '@angular/core';
import {
  MeetingService,
  PeerParticipant,
} from '../../../../../services/meeting.service';
import {
  MediaService,
  mediaStatus,
} from '../../../../../services/media.service';
import { MatDialog } from '@angular/material/dialog';
import { EmojiPickerComponent } from '../../../../../common/emoji-picker/emoji-picker.component';
import {
  Message,
  MessagingService,
} from '../../../../../services/messaging.service';
import { DeviceSettingsDailogComponent } from '../../../../../dailog-modals/device-settings-dailog/device-settings-dailog.component';
import { InvitePeopleDailogComponent } from '../../../../../dailog-modals/invite-people-dailog/invite-people-dailog.component';
import { Router } from '@angular/router';
import { connectionStatus } from 'src/app/services/connection/rtc-connection/rtc-connection-abstract/rtc-connection-abstract.service';

@Component({
  selector: 'app-meeting-control-button',
  templateUrl: './meeting-control-button.component.html',
  styleUrls: ['./meeting-control-button.component.scss'],
})
export class MeetingControlButtonComponent implements OnInit {
  @Input() meetingSideSection!: any;
  formatedMeetingTime = '00:00';
  mediaStatus = mediaStatus;

  constructor(
    public mediaService: MediaService,
    public meetingService: MeetingService,
    public messagingService: MessagingService,
    private router: Router,
    public dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.startMeetingTimer();

    this.onParticipantEvent();
    this.meetingService.participantEvent.subscribe((event: boolean) => {
      this.onParticipantEvent();
    });
  }

  private onParticipantEvent() {
    let currPeerPartcipants = this.meetingService.peerPartcipants.filter(
      (peerParticipant: PeerParticipant) =>
        peerParticipant.connection.status === connectionStatus.CONNECTED
    );
    const raisedHandPartcipants = currPeerPartcipants.filter(
      (peerParticipant: PeerParticipant) => peerParticipant.handRaised
    );
    this.meetingService.participantRaisedHandCount =
      raisedHandPartcipants.length;
    if (this.meetingService.isRaisedHand) {
      this.meetingService.participantRaisedHandCount++;
    }
  }

  openEmojiDialog() {
    const dialogRef = this.dialog.open(EmojiPickerComponent, {
      data: { emoji: '' },
    });

    dialogRef
      .afterClosed()
      .subscribe((result: { emoji: string } | undefined) => {
        if (result) {
          this.sendEmojiReaction(result.emoji);
        }
      });
  }

  openDeviceSettingsDialog() {
    this.dialog.open(DeviceSettingsDailogComponent);
  }

  openInvitePeopleDialog() {
    this.dialog.open(InvitePeopleDailogComponent);
  }

  private sendEmojiReaction(emoji: string) {
    const newUserEmojiReaction: Message = {
      content: emoji,
      participantId: this.meetingService.userParticipantId,
      participantName: this.meetingService.userParticipantName,
      type: 'reaction',
    };
    this.messagingService.sendEmojiReaction(
      this.meetingService.meetingId,
      newUserEmojiReaction
    );
  }

  onPeopleSection() {
    if (this.meetingSideSection.section === 'message') {
      this.messagingService.updateLastUserReadTimeStamp();
    }
    this.meetingSideSection.section =
      this.meetingSideSection.section === 'people' ? 'hide' : 'people';
  }

  onMessageSection() {
    this.messagingService.updateLastUserReadTimeStamp();

    this.meetingSideSection.section =
      this.meetingSideSection.section === 'message' ? 'hide' : 'message';
  }

  onRaiseHand() {
    this.meetingService.isRaisedHand
      ? this.meetingService.userLowerHand()
      : this.meetingService.userRaiseHand();
  }

  onLeaveMeeting() {
    this.meetingService.leaveMeeting();
    //this.router.navigate(['meeting', 'end']);
  }

  async onCameraToggle(): Promise<void> {
    if (this.mediaService.cameraStatus === mediaStatus.ENABLED) {
      this.mediaService.stopCamera();
    } else {
      await this.mediaService.startCamera();
      this.meetingService.updateConnectionVideoStream();
    }
    this.meetingService.updatePartcipant();
  }

  async onMicToggle() {
    if (this.mediaService.micStatus === mediaStatus.ENABLED) {
      this.mediaService.stopMic();
    } else {
      await this.mediaService.startMic();
      this.meetingService.updateConnectionAudioStream();
    }
    this.meetingService.updatePartcipant();
  }

  async onScreenShareToggle() {
    this.meetingService.screenSharing.isUserScreenSharing
      ? this.meetingService.stopScreenShare()
      : this.meetingService.startScreenShare();
  }

  private startMeetingTimer() {
    setInterval(() => {
      this.meetingService.meetingTimer++;
      this.formatMeetingTime();
    }, 1000);
  }

  private formatMeetingTime() {
    const meetingTimer = this.meetingService.meetingTimer;
    const minutes: number = Math.floor(meetingTimer / 60);
    const seconds: number = meetingTimer - minutes * 60;

    if (minutes < 10 && seconds < 10) {
      this.formatedMeetingTime =
        '0' + minutes + ':0' + (meetingTimer - minutes * 60);
    } else if (minutes < 10 && seconds >= 10) {
      this.formatedMeetingTime =
        '0' + minutes + ':' + (meetingTimer - minutes * 60);
    } else if (minutes >= 10 && seconds >= 10) {
      this.formatedMeetingTime = minutes + ':' + (meetingTimer - minutes * 60);
    } else if (minutes >= 10 && seconds < 10) {
      this.formatedMeetingTime = minutes + ':0' + (meetingTimer - minutes * 60);
    }
  }
}
