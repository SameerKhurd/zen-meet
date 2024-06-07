import { Component, OnInit } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import {
  DeviceMedia,
  MediaService,
  mediaStatus,
} from "../services/media.service";
import { Meeting, MeetingService } from "../services/meeting.service";

@Component({
  selector: "app-meeting-main",
  templateUrl: "./meeting-main.component.html",
  styleUrls: ["./meeting-main.component.scss"],
})
export class MeetingMainComponent implements OnInit {
  deviceMedia!: DeviceMedia;
  mediaStatus = mediaStatus;
  waitingToJoinMeeting = !true;

  constructor(
    public mediaService: MediaService,
    route: ActivatedRoute,
    public meetingService: MeetingService
  ) {
    let meetingId = route.snapshot.paramMap.get("meetingId");
    meetingId = meetingId ? meetingId : "";
    this.meetingService.setMeetingDetails(meetingId, "temp meeting name");
    //this.getMeetingDetails(meetingId);
  }
  ngOnInit(): void {
    this.getDeviceMedia();
    //this.meetingService.startNewMeeting("new meeting")
  }

  getMeetingDetails(meetingId: string) {
    this.meetingService
      .getMeetingDetails(meetingId)
      .then((meetingDetails: Meeting | undefined) => {
        if (meetingDetails) {
          this.meetingService.setMeetingDetails(
            meetingId,
            meetingDetails.meetingName
          );
        }
      });
  }

  getDeviceMedia(): void {
    this.mediaService.getDeviceMedia().then((deviceMedia: DeviceMedia) => {
      this.deviceMedia = deviceMedia;
      if (this.deviceMedia.cameras.length) {
        this.mediaService.setCamera(this.deviceMedia.cameras[0]);
      }
      if (this.deviceMedia.mics.length) {
        this.mediaService.setMic(this.deviceMedia.mics[0]);
      }
      this.mediaService.requestMediaDevices();
    });
  }

  onJoinMeeting() {
    this.meetingService.joinMeeting();
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

  onCameraSelect() {
    this.mediaService.startCamera();
  }
}
