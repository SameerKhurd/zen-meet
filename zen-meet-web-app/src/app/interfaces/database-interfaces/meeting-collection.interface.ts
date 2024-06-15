import { Timestamp } from '@angular/fire/firestore';

export interface MeetingDoc {
  meetingName: string;
  startTime: Timestamp;
}
