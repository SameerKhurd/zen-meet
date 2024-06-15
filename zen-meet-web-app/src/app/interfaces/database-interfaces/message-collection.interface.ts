import { Timestamp } from '@angular/fire/firestore';

export interface MessageDoc {
  participantName: string;
  participantId: string;
  content: string;
  type: 'message' | 'reaction';
  sendTime: Timestamp;
}
