import { Injectable } from '@angular/core';
import {
  DocumentReference,
  Firestore,
  collection,
  setDoc,
  onSnapshot,
  doc,
  CollectionReference,
  Timestamp,
  DocumentChange,
  QuerySnapshot,
  updateDoc,
  DocumentData,
} from '@angular/fire/firestore';

export class Collections {
  meeting = 'meetings';
  participants = (meetingId: string) =>
    `${this.meeting}/${meetingId}/participants`;
}

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

@Injectable({
  providedIn: 'root',
})
export class ParticipantCollectionService {
  constructor(public firestore: Firestore) {}

  async attachParticipantSnapshotListner(
    meetingId: string,
    callbackFunction: Function
  ) {
    const partcipantCollectionPath: string = new Collections().participants(
      meetingId
    );
    const participantsCollectionRef: CollectionReference = collection(
      this.firestore,
      partcipantCollectionPath
    );
    onSnapshot(
      participantsCollectionRef,
      (participantSnapshot: QuerySnapshot): void => {
        participantSnapshot
          .docChanges()
          .forEach((changedDoc: DocumentChange) => {
            const participantDoc: DocumentData = changedDoc.doc.data();
            participantDoc['joinTime'] = participantDoc['joinTime'].toDate();
            callbackFunction(changedDoc.type, participantDoc);
          });
      }
    );
  }

  async addParticipant(
    meetingId: string,
    participantId: string,
    participantName: string,
    videoEnabled: boolean,
    micEnabled: boolean,
    handRaised: boolean
  ): Promise<Date> {
    const participantDoc: ParticipantDoc = {
      participantName: participantName,
      participantId: participantId,
      videoEnabled: videoEnabled,
      micEnabled: micEnabled,
      handRaised: handRaised,
      joinTime: Timestamp.now(),
      state: 'new',
    };
    const partcipantCollectionPath: string = new Collections().participants(
      meetingId
    );
    const participantsCollectionRef: CollectionReference = collection(
      this.firestore,
      partcipantCollectionPath
    );
    const newParticipantDocRef: DocumentReference = doc(
      participantsCollectionRef,
      participantId
    );
    await setDoc(newParticipantDocRef, participantDoc);
    return participantDoc.joinTime.toDate();
  }

  async updateParticipantData(
    meetingId: string,
    participantId: string,
    videoEnabled: boolean,
    micEnabled: boolean,
    handRaised: boolean
  ): Promise<void> {
    const partcipantCollectionPath: string = new Collections().participants(
      meetingId
    );
    const participantsCollectionRef: CollectionReference = collection(
      this.firestore,
      partcipantCollectionPath
    );
    const participantDocRef = doc(participantsCollectionRef, participantId);

    await updateDoc(participantDocRef, {
      videoEnabled: videoEnabled,
      micEnabled: micEnabled,
      handRaised: handRaised,
      state: 'updated',
    });
  }
}
