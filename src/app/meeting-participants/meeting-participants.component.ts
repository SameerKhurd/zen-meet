import { Component, Input } from "@angular/core";
import { MediaService, mediaStatus } from "../services/media.service";
import { MeetingService } from "../services/meeting.service";

@Component({
  selector: "app-meeting-participants",
  templateUrl: "./meeting-participants.component.html",
  styleUrls: ["./meeting-participants.component.scss"],
})
export class MeetingParticipantsComponent {
  @Input() meetingSideSection!: any;
  mediaStatus = mediaStatus;

  isMeetingURLCopied = false;

  constructor(
    public mediaService: MediaService,
    public meetingService: MeetingService
  ) {}

  copyMeetingURLToClipboard() {
    const meetingURL = "temp-meeting-url-213";
    navigator.clipboard.writeText(meetingURL);
    this.isMeetingURLCopied = true;
    setTimeout(() => {
      this.isMeetingURLCopied = false;
    }, 1250);
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

  onCameraToggle(): void {
    this.mediaService.cameraStatus === mediaStatus.ENABLED
      ? this.mediaService.stopCamera()
      : this.mediaService.startCamera();
  }

  onMicToggle() {
    this.mediaService.micStatus === mediaStatus.ENABLED
      ? this.mediaService.stopMic()
      : this.mediaService.startMic();
  }
}
