import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { HomeComponent } from "./home/home.component";
import { MeetingStartComponent } from "./meeting-start/meeting-start.component";
import { MeetingJoinComponent } from "./meeting-join/meeting-join.component";
import { MeetingMainComponent } from "./meeting-main/meeting-main.component";

const routes: Routes = [
  {
    path: "",
    component: HomeComponent,
    children: [
      {
        path: "meeting",
        children: [
          {
            path: "start",
            component: MeetingStartComponent,
          },
          {
            path: "join",
            component: MeetingJoinComponent,
          },
          {
            path: ":meetingId",
            component: MeetingMainComponent,
          },
          { path: "", redirectTo: "/", pathMatch: "full" },
        ],
      },
    ],
  },
  {
    path: "**",
    redirectTo: "",
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
