import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { Meeting, MeetingService } from '../../services/meeting.service';
import { InvitePeopleDailogComponent } from '../../dailog-modals/invite-people-dailog/invite-people-dailog.component';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'app-meeting-main',
  templateUrl: './meeting-main.component.html',
  styleUrls: ['./meeting-main.component.scss'],
})
export class MeetingMainComponent implements OnInit {
  joinedMeeting = false;
  isInvalidName = false;
  userMeetingId = '';
  status: 'new' | 'not-found' | 'loading' | 'error' = 'new';
  joinStatus: 'new' | 'loading' | 'error' = 'new';

  constructor(
    private route: ActivatedRoute,
    public meetingService: MeetingService,
    public dialog: MatDialog
  ) {}
  
  ngOnInit(): void {
    let meetingId = this.route.snapshot.paramMap.get('meetingId');
    console.log('called', meetingId);
    meetingId = meetingId ? meetingId : '';

    this.meetingService.meetingStatus = 'not-joined';

    this.userMeetingId = meetingId;
    //this.meetingService.setMeetingDetails(meetingId, "temp meeting name");
    this.getMeetingDetails(meetingId);
  }

  openInvitePeopleDialog() {
    this.dialog.open(InvitePeopleDailogComponent);
  }

  private validateUserParticipantName() {
    this.meetingService.userParticipantName =
      this.meetingService.userParticipantName.trim();
    this.isInvalidName = this.meetingService.userParticipantName.length === 0;
  }

  getMeetingDetails(meetingId: string) {
    this.status = 'loading';
    this.meetingService
      .getMeetingDetails(meetingId)
      .then((meetingDetails: Meeting | undefined) => {
        if (meetingDetails) {
          this.status = 'new';
          this.meetingService.setMeetingDetails(
            meetingId,
            meetingDetails.meetingName
          );
        } else {
          this.status = 'not-found';
        }
      })
      .catch(() => {
        this.status = 'error';
      });
  }

  onJoinMeeting() {
    this.validateUserParticipantName();
    if (!this.isInvalidName) this.joinStatus = 'loading';
    this.meetingService
      .joinMeeting()
      .then(() => {
        this.joinStatus = 'new';
        this.joinedMeeting = true;
      })
      .catch(() => {
        this.joinStatus = 'error';
      });
  }
}
