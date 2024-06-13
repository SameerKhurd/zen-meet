import { Component } from '@angular/core';
import { MeetingService } from '../../../services/meeting.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-end-meeting',
  templateUrl: './end-meeting.component.html',
  styleUrls: ['./end-meeting.component.scss'],
})
export class EndMeetingComponent {
  formatedMeetingTime = '';
  constructor(public meetingService: MeetingService, private router: Router) {
    this.formatMeetingTime();
  }

  private validateUserMeetingId() {
    this.meetingService.meetingId = this.meetingService.meetingId.trim();
    return this.meetingService.meetingId.length !== 0;
  }

  onReJoin(): void {
    this.validateUserMeetingId();
    if (this.validateUserMeetingId()) {
      this.meetingService.joinMeeting();
      //this.router.navigate(['meeting', this.meetingService.meetingId]);
    }
  }

  private formatMeetingTime() {
    const meetingTimer = this.meetingService.meetingTimer;
    const minutes: number = Math.floor(meetingTimer / 60);
    const seconds: number = meetingTimer - minutes * 60;

    if (minutes < 10 && seconds < 10) {
      this.formatedMeetingTime =
        '0' + minutes + ' Min 0' + (meetingTimer - minutes * 60) + ' Sec';
    } else if (minutes < 10 && seconds >= 10) {
      this.formatedMeetingTime =
        '0' + minutes + ' Min ' + (meetingTimer - minutes * 60) + ' Sec';
    } else if (minutes >= 10 && seconds >= 10) {
      this.formatedMeetingTime =
        minutes + ' Min' + (meetingTimer - minutes * 60) + ' Sec';
    } else if (minutes >= 10 && seconds < 10) {
      this.formatedMeetingTime =
        minutes + ' Min 0' + (meetingTimer - minutes * 60) + ' Sec';
    }
  }
}
