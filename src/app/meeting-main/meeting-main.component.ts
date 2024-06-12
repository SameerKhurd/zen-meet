import { Component } from "@angular/core";
import { ActivatedRoute } from "@angular/router";

import { Meeting, MeetingService } from "../services/meeting.service";

@Component({
  selector: "app-meeting-main",
  templateUrl: "./meeting-main.component.html",
  styleUrls: ["./meeting-main.component.scss"],
})
export class MeetingMainComponent {
  joinedMeeting = !false;

  constructor(route: ActivatedRoute, public meetingService: MeetingService) {
    let meetingId = route.snapshot.paramMap.get("meetingId");
    meetingId = meetingId ? meetingId : "";
    //this.meetingService.setMeetingDetails(meetingId, "temp meeting name");
    // this.getMeetingDetails(meetingId);
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

  onJoinMeeting() {
    this.meetingService.joinMeeting().then(() => {
      this.joinedMeeting = true;
    });
  }
}
