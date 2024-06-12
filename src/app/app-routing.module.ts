import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { HomeComponent } from "./home/home.component";
import { MeetingMainComponent } from "./meeting-main/meeting-main.component";
import { EndMeetingComponent } from "./end-meeting/end-meeting.component";

const routes: Routes = [
  {
    path: "",
    component: HomeComponent,
    children: [
      {
        path: "meeting",
        children: [
          {
            path: "end",
            component: EndMeetingComponent,
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
