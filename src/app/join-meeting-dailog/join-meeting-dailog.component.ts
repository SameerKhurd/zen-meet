import { Component } from "@angular/core";
import { MatDialogRef } from "@angular/material/dialog";
import { ActivatedRoute, Router } from "@angular/router";

@Component({
  selector: "app-join-meeting-dailog",
  templateUrl: "./join-meeting-dailog.component.html",
  styleUrls: ["./join-meeting-dailog.component.scss"],
})
export class JoinMeetingDailogComponent {
  userMeetingId: string = "tIQSBsmGU8tWBTvwj6IQ";
  constructor(
    public dialogRef: MatDialogRef<JoinMeetingDailogComponent>,
    private router: Router,
    private activatedRoute: ActivatedRoute
  ) {}

  onClose(): void {
    this.dialogRef.close();
  }

  onJoin(): void {
    this.dialogRef.disableClose = true;
    this.router.navigate(["meeting", this.userMeetingId], {
      relativeTo: this.activatedRoute,
    });
    this.dialogRef.close();
  }
}
