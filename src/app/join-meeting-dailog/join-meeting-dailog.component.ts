import { Component } from "@angular/core";
import { MatDialogRef } from "@angular/material/dialog";
import { ActivatedRoute, Router } from "@angular/router";

@Component({
  selector: "app-join-meeting-dailog",
  templateUrl: "./join-meeting-dailog.component.html",
  styleUrls: ["./join-meeting-dailog.component.scss"],
})
export class JoinMeetingDailogComponent {
  userMeetingId: string = "";
  isInvalidId = false;

  constructor(
    public dialogRef: MatDialogRef<JoinMeetingDailogComponent>,
    private router: Router,
    private activatedRoute: ActivatedRoute
  ) {}

  onClose(): void {
    this.dialogRef.close();
  }

  private validateUserMeetingId() {
    this.userMeetingId = this.userMeetingId.trim();
    this.isInvalidId = this.userMeetingId.length === 0;
  }

  onJoin(): void {
    this.validateUserMeetingId();
    if (!this.isInvalidId) {
      this.router.navigate(["meeting", this.userMeetingId], {
        relativeTo: this.activatedRoute,
      });
      this.dialogRef.close();
    }
  }
}
