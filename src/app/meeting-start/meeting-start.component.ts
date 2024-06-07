import { Component } from "@angular/core";
import { VideoService } from "../services/video.service";

@Component({
  selector: "app-meeting-start",
  templateUrl: "./meeting-start.component.html",
  styleUrls: ["./meeting-start.component.scss"],
})
export class MeetingStartComponent {
  meetingName = "Meeting with Sameer";

  constructor(public videoService: VideoService) {}

  onStartMeeting() {
    this.videoService.startNewMeting(this.meetingName);
  }
}
