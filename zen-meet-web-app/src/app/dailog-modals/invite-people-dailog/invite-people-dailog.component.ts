import { Component } from "@angular/core";
import { MatDialogRef } from "@angular/material/dialog";

@Component({
  selector: "app-invite-people-dailog",
  templateUrl: "./invite-people-dailog.component.html",
  styleUrls: ["./invite-people-dailog.component.scss"],
})
export class InvitePeopleDailogComponent {
  meetingCopy: { meetingURLCopied: boolean; meetingIDCopied: boolean } = {
    meetingURLCopied: false,
    meetingIDCopied: false,
  };
  constructor(public dialogRef: MatDialogRef<InvitePeopleDailogComponent>) {}

  onClose(): void {
    this.dialogRef.close();
  }

  copyToClipboard(copyItem: "meetingURLCopied" | "meetingIDCopied") {
    const meetingURL = "temp-meeting-url-213";
    navigator.clipboard.writeText(meetingURL);
    this.meetingCopy[copyItem] = true;
    setTimeout(() => {
      this.meetingCopy[copyItem] = false;
    }, 1250);
  }
}
