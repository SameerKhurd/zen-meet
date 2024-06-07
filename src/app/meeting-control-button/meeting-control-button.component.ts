import { Component, Input, OnInit } from "@angular/core";
import { MeetingService } from "../services/meeting.service";
import { MediaService, mediaStatus } from "../services/media.service";

@Component({
  selector: "app-meeting-control-button",
  templateUrl: "./meeting-control-button.component.html",
  styleUrls: ["./meeting-control-button.component.scss"],
})
export class MeetingControlButtonComponent implements OnInit {
  @Input() meetingSideSection!: any;
  private meetingTimer = 0;
  formatedMeetingTime = "00:00";
  mediaStatus = mediaStatus;

  constructor(
    public mediaService: MediaService,
    public meetingService: MeetingService
  ) {}

  ngOnInit(): void {
    this.startMeetingTimer();
  }

  onPeopleSection() {
    this.meetingSideSection.section =
      this.meetingSideSection.section === "people" ? "hide" : "people";
  }

  onMessageSection() {
    this.meetingSideSection.section =
      this.meetingSideSection.section === "message" ? "hide" : "message";
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

  private startMeetingTimer() {
    setInterval(() => {
      this.meetingTimer++;
      this.formatMeetingTime();
    }, 1000);
  }

  private formatMeetingTime() {
    const minutes: number = Math.floor(this.meetingTimer / 60);
    const seconds: number = this.meetingTimer - minutes * 60;

    if (minutes < 10 && seconds < 10) {
      this.formatedMeetingTime =
        "0" + minutes + ":0" + (this.meetingTimer - minutes * 60);
    } else if (minutes < 10 && seconds >= 10) {
      this.formatedMeetingTime =
        "0" + minutes + ":" + (this.meetingTimer - minutes * 60);
    } else if (minutes >= 10 && seconds >= 10) {
      this.formatedMeetingTime =
        minutes + ":" + (this.meetingTimer - minutes * 60);
    } else if (minutes >= 10 && seconds < 10) {
      this.formatedMeetingTime =
        minutes + ":0" + (this.meetingTimer - minutes * 60);
    }
  }
}
