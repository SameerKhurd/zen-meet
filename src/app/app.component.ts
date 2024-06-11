import { AfterViewInit, Component } from "@angular/core";
import { AuthService } from "./services/auth.service";

@Component({
  selector: "app-root",
  templateUrl: "./app.component.html",
  styleUrls: ["./app.component.scss"],
})
export class AppComponent {
  title = "angular-zoom";
  name!: string;
  color: any;
  age: any;

  constructor(authService: AuthService) {}
}
