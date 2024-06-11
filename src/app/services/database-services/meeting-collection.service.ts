import { Injectable } from "@angular/core";
import {
  DocumentReference,
  Firestore,
  addDoc,
  collection,
  getDoc,
  doc,
  CollectionReference,
  Timestamp,
  DocumentData,
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

@Injectable({
  providedIn: "root",
})
export class MeetingCollectionService {
  constructor(public firestore: Firestore) {}

  async addMeeting(meetingName: string): Promise<string> {
    const meetingDoc: MeetingDoc = {
      meetingName: meetingName,
      startTime: Timestamp.now(),
    };
    const meetingCollectionPath: string = new Collections().meeting;
    const meetingDocRef: DocumentReference = await addDoc(
      collection(this.firestore, meetingCollectionPath),
      meetingDoc
    );
    const meetingId: string = meetingDocRef.id;
    return meetingId;
  }

  async getMeeting(
    meetingId: string
  ): Promise<{ meetingName: string; startTime: Date } | undefined> {
    const meetingCollectionPath: string = new Collections().meeting;
    const meetingCollectionRef: CollectionReference = collection(
      this.firestore,
      meetingCollectionPath
    );
    const meetingDocRef: DocumentReference = doc(
      meetingCollectionRef,
      meetingId
    );
    const meetingDocData: DocumentData | undefined = (
      await getDoc(meetingDocRef)
    ).data();

    if (meetingDocData) {
      return {
        meetingName: meetingDocData["meetingName"],
        startTime: meetingDocData["startTime"].toDate(),
      };
    }
    return undefined;
  }
}
