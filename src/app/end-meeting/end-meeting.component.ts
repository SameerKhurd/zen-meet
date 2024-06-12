import { Component } from "@angular/core";
import { MeetingService } from "../services/meeting.service";
import { Router } from "@angular/router";

@Component({
  selector: "app-end-meeting",
  templateUrl: "./end-meeting.component.html",
  styleUrls: ["./end-meeting.component.scss"],
})
export class EndMeetingComponent {
  constructor(public meetingService: MeetingService, private router: Router) {}
  private validateUserMeetingId() {
    this.meetingService.meetingId = this.meetingService.meetingId.trim();
    return this.meetingService.meetingId.length !== 0;
  }

  onReJoin(): void {
    this.validateUserMeetingId();
    if (this.validateUserMeetingId()) {
      this.router.navigate(["meeting", this.meetingService.meetingId]);
    }
  }
}
