import { Injectable } from "@angular/core";
import {
  Firestore,
  collection,
  onSnapshot,
  CollectionReference,
  Timestamp,
  DocumentChange,
  QuerySnapshot,
  addDoc,
  DocumentData,
} from "@angular/fire/firestore";

export class CollectionPath {
  meetingCollection = "meetings";
  messagesCollection = (meetingId: string) =>
    `${this.meetingCollection}/${meetingId}/messages`;
}

export interface MessageDoc {
  participantName: string;
  participantId: string;
  content: string;
  type: "message" | "reaction";
  sendTime: Timestamp;
}

@Injectable({
  providedIn: "root",
})
export class MessageCollectionService {
  constructor(public firestore: Firestore) {}

  async attachMessageSnapshotListner(
    meetingId: string,
    callbackFunction: Function
  ) {
    const messagesCollectionPath: string =
      new CollectionPath().messagesCollection(meetingId);
    const messagesCollectionRef: CollectionReference = collection(
      this.firestore,
      messagesCollectionPath
    );
    onSnapshot(
      messagesCollectionRef,
      (participantSnapshot: QuerySnapshot): void => {
        participantSnapshot
          .docChanges()
          .forEach((changedDoc: DocumentChange) => {
            const message: DocumentData = changedDoc.doc.data();
            message["sendTime"] = message["sendTime"].toDate();
            callbackFunction(changedDoc.type, message);
          });
      }
    );
  }

  async addMessage(
    meetingId: string,
    participantId: string,
    participantName: string,
    content: string,
    type: "message" | "reaction"
  ): Promise<void> {
    const messageDoc: MessageDoc = {
      participantName: participantName,
      participantId: participantId,
      content: content,
      type: type,
      sendTime: Timestamp.now(),
    };
    const messagesCollectionPath: string =
      new CollectionPath().messagesCollection(meetingId);
    await addDoc(
      collection(this.firestore, messagesCollectionPath),
      messageDoc
    );
  }
}
