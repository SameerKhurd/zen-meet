import { Component } from "@angular/core";
import { MatDialogRef } from "@angular/material/dialog";
import { MeetingService } from "../services/meeting.service";
import { ActivatedRoute, Router } from "@angular/router";

@Component({
  selector: "app-new-meeting-dailog",
  templateUrl: "./new-meeting-dailog.component.html",
  styleUrls: ["./new-meeting-dailog.component.scss"],
})
export class NewMeetingDailogComponent {
  userMeetingName: string = "";
  isInvalidName = false;
  status: "loading" | "new" | "error" = "new";

  constructor(
    public dialogRef: MatDialogRef<NewMeetingDailogComponent>,
    public meetingService: MeetingService,
    private router: Router,
    private activatedRoute: ActivatedRoute
  ) {}

  onClose(): void {
    this.dialogRef.close();
  }

  private validateUserMeetingName() {
    this.userMeetingName = this.userMeetingName.trim();
    this.isInvalidName = this.userMeetingName.length === 0;
  }

  onStartNewMeeting() {
    this.validateUserMeetingName();
    if (!this.isInvalidName) {
      this.dialogRef.disableClose = true;
      this.status = "loading";
      this.meetingService
        .startNewMeeting(this.userMeetingName)
        .then(() => {
          this.router.navigate(["meeting", this.meetingService.meetingId], {
            relativeTo: this.activatedRoute,
          });
          this.status = "new";
          this.dialogRef.disableClose = false;
          this.dialogRef.close();
        })
        .catch(() => {
          this.dialogRef.disableClose = false;
          this.status = "error";
        });
    }
  }
}
