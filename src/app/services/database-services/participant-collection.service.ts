import { Injectable } from "@angular/core";
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
} from "@angular/fire/firestore";

export class Collections {
  meeting = "meetings";
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
}

@Injectable({
  providedIn: "root",
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
            callbackFunction(changedDoc.type, changedDoc.doc.data());
          });
      }
    );
  }

  async addParticipant(
    meetingId: string,
    participantId: string,
    participantName: string
  ): Promise<void> {
    const participantDoc: ParticipantDoc = {
      participantName: participantName,
      participantId: participantId,
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
  }
}
