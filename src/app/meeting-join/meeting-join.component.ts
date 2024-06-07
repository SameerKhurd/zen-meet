import { Component } from "@angular/core";
import { VideoService } from "../services/video.service";

@Component({
  selector: "app-meeting-join",
  templateUrl: "./meeting-join.component.html",
  styleUrls: ["./meeting-join.component.scss"],
})
export class MeetingJoinComponent {
  meetingId = "bbcnxTaaxfMIpuqLqSLF";

  constructor(public videoService: VideoService) {}

  onJoinMeeting() {
    this.videoService.getMeetingDetails(this.meetingId);
  }
}
