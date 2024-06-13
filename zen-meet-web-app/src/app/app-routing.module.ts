import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { MeetingMainComponent } from './pages/meeting-main/meeting-main.component';
// import { EndMeetingComponent } from "./pages/meeting-main/end-meeting/end-meeting.component";

const routes: Routes = [
  {
    path: '',
    component: HomeComponent,
    children: [
      {
        path: 'meeting',
        children: [
          // {
          //   path: "end",
          //   component: EndMeetingComponent,
          // },
          {
            path: ':meetingId',
            component: MeetingMainComponent,
          },
          { path: '', redirectTo: '/', pathMatch: 'full' },
        ],
      },
    ],
  },
  {
    path: '**',
    redirectTo: '',
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
