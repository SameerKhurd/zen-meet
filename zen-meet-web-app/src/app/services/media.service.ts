import { Injectable } from '@angular/core';

const MEDIA_CONSTRAINTS = {
  audio: true,
  //video: { width: 1280, height: 720 },
  // video: {width: 1280, height: 720} // 16:9
  // video: {width: 960, height: 540}  // 16:9
  video: { width: 640, height: 480 }, //  4:3
  // video: {width: 160, height: 120}  //  4:3
};

export interface DeviceMedia {
  cameras: MediaDeviceInfo[];
  mics: MediaDeviceInfo[];
  speakars: MediaDeviceInfo[];
}

export enum mediaStatus {
  LOADING = 0,
  ERROR = 1,
  ENABLED = 2,
  DISABLED = 3,
  NA = 4,
}

@Injectable({
  providedIn: 'root',
})
export class MediaService {
  localMediaStream!: MediaStream;
  localScreenShareMediaStream!: MediaStream;
  cameraStatus: mediaStatus = mediaStatus.DISABLED;
  micStatus: mediaStatus = mediaStatus.DISABLED;

  camera!: MediaDeviceInfo;
  mic!: MediaDeviceInfo;
  speakar!: MediaDeviceInfo;

  //localVideoActive = false;

  constructor() {}

  async getDeviceMedia(): Promise<DeviceMedia> {
    const availableDevices: MediaDeviceInfo[] =
      await navigator.mediaDevices.enumerateDevices();

    const cameraDevices: MediaDeviceInfo[] = availableDevices.filter(
      (device) => device.kind === 'videoinput'
    );
    const micDevices: MediaDeviceInfo[] = availableDevices.filter(
      (device) => device.kind === 'audioinput'
    );
    const speakarDevices: MediaDeviceInfo[] = availableDevices.filter(
      (device) => device.kind === 'audiooutput'
    );

    const deviceMedia: DeviceMedia = {
      cameras: cameraDevices,
      mics: micDevices,
      speakars: speakarDevices,
    };
    return deviceMedia;
  }

  setCamera(selectedCamera: MediaDeviceInfo): void {
    this.camera = selectedCamera;
  }

  setMic(selectedMic: MediaDeviceInfo): void {
    this.mic = selectedMic;
  }

  async setSpeakar(selectedSpeakar: MediaDeviceInfo): Promise<void> {
    this.speakar = selectedSpeakar;
    const audio: any = document.createElement('audio');
    audio
      .setSinkId(this.speakar.deviceId)
      .then(() => {})
      .catch((rr: any) => {});
  }

  async requestMediaDevices(): Promise<void> {
    if (!this.localMediaStream) {
      this.cameraStatus = mediaStatus.LOADING;
      this.micStatus = mediaStatus.LOADING;
      this.localMediaStream = await navigator.mediaDevices.getUserMedia(
        MEDIA_CONSTRAINTS
      );
      this.cameraStatus = mediaStatus.ENABLED;
      this.micStatus = mediaStatus.ENABLED;
    }
  }

  async requestScreenShareMedia(): Promise<void> {
    const displayMediaOptions = {
      video: {
        displaySurface: 'window',
      },
      audio: false,
    };
    this.localScreenShareMediaStream =
      await navigator.mediaDevices.getDisplayMedia(displayMediaOptions);
  }

  stopScreenShareMedia() {
    if (this.localScreenShareMediaStream) {
      this.localScreenShareMediaStream
        .getTracks()
        .forEach((track: MediaStreamTrack) => {
          track.stop();
        });
    }
  }

  private async startMediaDevice(
    mediaStreamConstraints: MediaStreamConstraints,
    getMediaTracksMethod: 'getVideoTracks' | 'getAudioTracks'
  ) {
    const mediaStream: MediaStream = await navigator.mediaDevices.getUserMedia(
      mediaStreamConstraints
    );

    if (this.localMediaStream) {
      const [currMediaTrack] = this.localMediaStream[getMediaTracksMethod]();
      currMediaTrack.enabled = false;
      currMediaTrack.stop();
      this.localMediaStream.removeTrack(currMediaTrack);

      const [newMediaTrack] = mediaStream[getMediaTracksMethod]();
      this.localMediaStream.addTrack(newMediaTrack);
    }
  }

  private stopMediaDevice(
    getMediaTracksMethod: 'getVideoTracks' | 'getAudioTracks'
  ): void {
    if (this.localMediaStream) {
      const [currMediaTrack] = this.localMediaStream[getMediaTracksMethod]();
      if (currMediaTrack) {
        currMediaTrack.enabled = false;
        currMediaTrack.stop();
      }
    }
  }

  async startCamera(): Promise<void> {
    this.cameraStatus = mediaStatus.LOADING;
    const videoConstraints: MediaStreamConstraints = {
      video: {
        width: MEDIA_CONSTRAINTS.video.width,
        height: MEDIA_CONSTRAINTS.video.height,
        deviceId: {
          exact: this.camera.deviceId,
        },
      },
    };

    await this.startMediaDevice(videoConstraints, 'getVideoTracks');
    this.cameraStatus = mediaStatus.ENABLED;
  }

  stopCamera(): void {
    this.cameraStatus = mediaStatus.LOADING;
    this.stopMediaDevice('getVideoTracks');
    this.cameraStatus = mediaStatus.DISABLED;
  }

  async startMic(): Promise<void> {
    this.micStatus = mediaStatus.LOADING;
    const micConstraints: MediaStreamConstraints = {
      audio: {
        deviceId: {
          exact: this.mic.deviceId,
        },
      },
    };

    await this.startMediaDevice(micConstraints, 'getAudioTracks');
    this.micStatus = mediaStatus.ENABLED;
  }

  stopMic(): void {
    this.micStatus = mediaStatus.LOADING;
    this.stopMediaDevice('getAudioTracks');
    this.micStatus = mediaStatus.DISABLED;
  }
}
