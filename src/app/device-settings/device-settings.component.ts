import { AfterViewInit, Component } from "@angular/core";
import {
  DeviceMedia,
  MediaService,
  mediaStatus,
} from "../services/media.service";
import { MeetingService } from "../services/meeting.service";
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

  constructor(
    public mediaService: MediaService,
    public meetingService: MeetingService
  ) {}

  ngAfterViewInit(): void {
    this.getDeviceMedia();
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

  async onCameraSelect() {
    await this.mediaService.startCamera();
    this.meetingService.updateConnectionVideoStream();
  }


  async onMicSelect() {
    await this.mediaService.startMic();
    this.meetingService.updateConnectionVideoStream();
  }

}
