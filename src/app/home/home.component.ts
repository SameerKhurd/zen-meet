import { Component } from "@angular/core";
import { MatDialog } from "@angular/material/dialog";
import { JoinMeetingDailogComponent } from "../join-meeting-dailog/join-meeting-dailog.component";
import { NewMeetingDailogComponent } from "../new-meeting-dailog/new-meeting-dailog.component";

@Component({
  selector: "app-home",
  templateUrl: "./home.component.html",
  styleUrls: ["./home.component.scss"],
})
export class HomeComponent {
  constructor(public dialog: MatDialog) {}

  openJoinMeetingDialog() {
    this.dialog.open(JoinMeetingDailogComponent);
  }

  openNewMeetingDialog() {
    this.dialog.open(NewMeetingDailogComponent);
  }
}
