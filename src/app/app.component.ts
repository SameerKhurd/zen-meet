import { AfterViewInit, Component, ElementRef, ViewChild } from "@angular/core";
import { DataService } from "./services/data.service";
import { VideoService } from "./services/video.service";

@Component({
  selector: "app-root",
  templateUrl: "./app.component.html",
  styleUrls: ["./app.component.scss"],
})
export class AppComponent implements AfterViewInit {
  title = "angular-zoom";
  inputMeetingId = this.videoService.meetingId;
  name!: string;
  color: any;
  age: any;

  constructor(
    public dataService: DataService,
    public videoService: VideoService
  ) {}

  ngAfterViewInit(): void {
    //this.videoService.requestMediaDevices();
  }

  onVideoDeviceSelect(selectedVideoDevice: any) {
    this.videoService.onVideoStreamChange(selectedVideoDevice);
  }

  video() {
    this.videoService.videoToggle();
    //this.localVideo.nativeElement.srcObject = this.videoService.localStream;
  }
  mic() {
    this.videoService.audioToggle();
    //this.localVideo.nativeElement.srcObject = this.videoService.localStream;
  }

  onWebcam() {
    //this.videoService.onWebcam();
    //this.remoteVideo.nativeElement.srcObject = this.videoService.remoteStream;
  }

  addRobot(name: string, color: string, age: string) {
    this.dataService.createRobot(name, color, age);
  }

  startMeeting() {
    //this.videoService.startNewMeting();
  }

  joinMeeting() {
    this.videoService.joinMeeting(this.videoService.meetingId);
  }

  robots: any;

  async readRobots() {
    this.robots = await this.dataService.getRobots();
  }
}
