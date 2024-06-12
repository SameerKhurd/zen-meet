import { AfterViewInit, Component } from "@angular/core";
import { MatDialog } from "@angular/material/dialog";
import { JoinMeetingDailogComponent } from "./dailog-modals/join-meeting-dailog/join-meeting-dailog.component";
import { NewMeetingDailogComponent } from "./dailog-modals/new-meeting-dailog/new-meeting-dailog.component";
import { AuthService } from "./services/auth-service/auth.service";

@Component({
  selector: "app-root",
  templateUrl: "./app.component.html",
  styleUrls: ["./app.component.scss"],
})
export class AppComponent {
  title = "angular-zoom";

  constructor(authService: AuthService, public dialog: MatDialog) {}

  openJoinMeetingDialog() {
    this.dialog.open(JoinMeetingDailogComponent);
  }

  openNewMeetingDialog() {
    this.dialog.open(NewMeetingDailogComponent);
  }
}
