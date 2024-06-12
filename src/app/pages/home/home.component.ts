import { Component } from "@angular/core";
import { MatDialog } from "@angular/material/dialog";
import { JoinMeetingDailogComponent } from "../../dailog-modals/join-meeting-dailog/join-meeting-dailog.component";
import { NewMeetingDailogComponent } from "src/app/dailog-modals/new-meeting-dailog/new-meeting-dailog.component";

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
