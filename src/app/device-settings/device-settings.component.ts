import { AfterViewInit, Component } from "@angular/core";
import {
  DeviceMedia,
  MediaService,
  mediaStatus,
} from "../services/media.service";
@Component({
  selector: "app-device-settings",
  templateUrl: "./device-settings.component.html",
  styleUrls: ["./device-settings.component.scss"],
})
export class DeviceSettingsComponent implements AfterViewInit {
  deviceMedia: DeviceMedia = {
    cameras: [],
    mics: [],
    speakars: [],
  };
  mediaStatus = mediaStatus;

  constructor(public mediaService: MediaService) {}

  ngAfterViewInit(): void {
    this.getDeviceMedia();
    //this.meetingService.startNewMeeting("new meeting")
  }

  getDeviceMedia(): void {
    this.mediaService.getDeviceMedia().then((deviceMedia: DeviceMedia) => {
      this.deviceMedia = deviceMedia;
      if (this.deviceMedia.cameras.length && !this.mediaService.camera) {
        this.mediaService.setCamera(this.deviceMedia.cameras[0]);
      }
      if (this.deviceMedia.mics.length && !this.mediaService.mic) {
        this.mediaService.setMic(this.deviceMedia.mics[0]);
      }
      this.mediaService.requestMediaDevices();
    });
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
