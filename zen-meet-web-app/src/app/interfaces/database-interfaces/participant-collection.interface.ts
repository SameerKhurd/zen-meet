import { Timestamp } from '@angular/fire/firestore';

export interface MeetingDoc {
  meetingName: string;
  startTime: Timestamp;
}

export interface ParticipantDoc {
  participantName: string;
  participantId: string;
  videoEnabled: boolean;
  micEnabled: boolean;
  handRaised: boolean;
  joinTime: Timestamp;
  state: 'new' | 'updated';
}
