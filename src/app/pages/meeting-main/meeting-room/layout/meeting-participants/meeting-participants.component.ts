import { Component, Input } from "@angular/core";
import { MediaService, mediaStatus } from "../../../../../services/media.service";
import { MeetingService, PeerParticipant } from "../../../../../services/meeting.service";
import { connectionStatus } from "../../../../../services/connection.service";
import { InvitePeopleDailogComponent } from "../../../../../dailog-modals/invite-people-dailog/invite-people-dailog.component";
import { MatDialog } from "@angular/material/dialog";

@Component({
  selector: "app-meeting-participants",
  templateUrl: "./meeting-participants.component.html",
  styleUrls: ["./meeting-participants.component.scss"],
})
export class MeetingParticipantsComponent {
  @Input() meetingSideSection!: any;
  mediaStatus = mediaStatus;
  currPeerPartcipants: PeerParticipant[] = [];
  connectionStatus = connectionStatus;

  constructor(
    public mediaService: MediaService,
    public meetingService: MeetingService,
    public dialog: MatDialog
  ) {
    this.onParticipantEvent();
    this.meetingService.participantEvent.subscribe((event: boolean) => {
      this.onParticipantEvent();
    });
  }

  openInvitePeopleDialog() {
    this.dialog.open(InvitePeopleDailogComponent);
  }

  private onParticipantEvent() {
    let currPeerPartcipants = this.meetingService.peerPartcipants.filter(
      (peerParticipant: PeerParticipant) =>
        peerParticipant.connection.status !== connectionStatus.CLOSED
    );
    currPeerPartcipants = currPeerPartcipants.sort((a, b) =>
      a.participantName > b.participantName ? 1 : -1
    );
    const raisedHandPartcipants = currPeerPartcipants.filter(
      (peerParticipant: PeerParticipant) => peerParticipant.handRaised
    );
    const otherPeerPartcipants = currPeerPartcipants.filter(
      (peerParticipant: PeerParticipant) => !peerParticipant.handRaised
    );
    this.currPeerPartcipants = [
      ...raisedHandPartcipants,
      ...otherPeerPartcipants,
    ];
  }

  onClose() {
    this.meetingSideSection.section = "hide";
  }

  splitPartcipantName(participantName: string): string {
    participantName = participantName.trim();
    let initials: string = participantName?.length ? participantName[0] : "";
    const whitespaceIndex = participantName.indexOf(" ");
    if (whitespaceIndex > 0) {
      const lastName: string = participantName
        .substring(whitespaceIndex)
        .trim();
      initials += lastName.length ? lastName[0] : "";
    }
    return initials;
  }

  onRaiseHand() {
    this.meetingService.isRaisedHand
      ? this.meetingService.userLowerHand()
      : this.meetingService.userRaiseHand();
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
}
