import { Component } from "@angular/core";
import { MatDialogRef } from "@angular/material/dialog";

@Component({
  selector: "app-new-meeting-dailog",
  templateUrl: "./new-meeting-dailog.component.html",
  styleUrls: ["./new-meeting-dailog.component.scss"],
})
export class NewMeetingDailogComponent {
  userMeetingName: string = "";
  constructor(public dialogRef: MatDialogRef<NewMeetingDailogComponent>) {}

  onClose(): void {
    this.dialogRef.close();
  }
}
