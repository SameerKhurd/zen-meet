import { Injectable } from "@angular/core";
import {
  Firestore,
  addDoc,
  collection,
  setDoc,
  updateDoc,
  getDoc,
  onSnapshot,
  doc,
  CollectionReference,
  DocumentData,
  DocumentChange,
  QuerySnapshot,
} from "@angular/fire/firestore";

export class CollectionPath {
  meetingCollection = "meetings";
  connCollection = (meetingId: string) =>
    `${this.meetingCollection}/${meetingId}/connections`;
  connDoc = (meetingId: string, connectionId: string) =>
    `${this.connCollection(meetingId)}/${connectionId}`;
  connOfferCandidatesCollection = (meetingId: string, connectionId: string) =>
    `${this.connDoc(meetingId, connectionId)}/offerCandidates`;
  connAnswerCandidatesCollection = (meetingId: string, connectionId: string) =>
    `${this.connDoc(meetingId, connectionId)}/answerCandidiates`;
}

export interface ConnectionDoc {
  connectionId: string;
}

@Injectable({
  providedIn: "root",
})
export class ConnectionCollectionService {
  constructor(public firestore: Firestore) {}

  async addConnection(meetingId: string, connectionId: string) {
    const connCollectionPath: string = new CollectionPath().connCollection(
      meetingId
    );
    const connectionsCollectionRef: CollectionReference = collection(
      this.firestore,
      connCollectionPath
    );

    const connDocRef = doc(connectionsCollectionRef, connectionId);
    const connectionDoc: ConnectionDoc = { connectionId: connectionId };
    setDoc(connDocRef, connectionDoc);
  }

  async addOfferCandidate(
    meetingId: string,
    connectionId: string,
    offerCandidateData: RTCIceCandidateInit
  ): Promise<void> {
    const connOfferCandidatesCollectionPath: string =
      new CollectionPath().connOfferCandidatesCollection(
        meetingId,
        connectionId
      );
    const connOfferCandidatesCollectionRef: CollectionReference = collection(
      this.firestore,
      connOfferCandidatesCollectionPath
    );
    await addDoc(connOfferCandidatesCollectionRef, offerCandidateData);
  }

  async addAnswerCandidate(
    meetingId: string,
    connectionId: string,
    answerCandidateData: RTCIceCandidateInit
  ): Promise<void> {
    const connAnswerCandidatesCollectionPath: string =
      new CollectionPath().connAnswerCandidatesCollection(
        meetingId,
        connectionId
      );
    const connAnswerCandidatesCollectionRef: CollectionReference = collection(
      this.firestore,
      connAnswerCandidatesCollectionPath
    );
    await addDoc(connAnswerCandidatesCollectionRef, answerCandidateData);
  }

  async setConnectionOfferData(
    meetingId: string,
    connectionId: string,
    offer: RTCSessionDescriptionInit
  ): Promise<void> {
    const connCollectionPath: string = new CollectionPath().connCollection(
      meetingId
    );
    const connectionsCollectionRef: CollectionReference = collection(
      this.firestore,
      connCollectionPath
    );
    const connDocRef = doc(connectionsCollectionRef, connectionId);

    await setDoc(connDocRef, { offer });
  }

  async updateConnectionAnwserData(
    meetingId: string,
    connectionId: string,
    answer: RTCSessionDescriptionInit
  ): Promise<void> {
    const connCollectionPath: string = new CollectionPath().connCollection(
      meetingId
    );
    const connectionsCollectionRef: CollectionReference = collection(
      this.firestore,
      connCollectionPath
    );
    const connDocRef = doc(connectionsCollectionRef, connectionId);

    await updateDoc(connDocRef, { answer });
  }

  async getConnectionOfferData(
    meetingId: string,
    connectionId: string
  ): Promise<RTCSessionDescriptionInit | undefined> {
    const connCollectionPath: string = new CollectionPath().connCollection(
      meetingId
    );
    const connectionsCollectionRef: CollectionReference = collection(
      this.firestore,
      connCollectionPath
    );
    const connDocRef = doc(connectionsCollectionRef, connectionId);
    const connDocData: DocumentData | undefined = (
      await getDoc(connDocRef)
    ).data();

    if (connDocData) {
      return connDocData["offer"];
    }
    return undefined;
  }

  async getConnectionAnswerData(
    meetingId: string,
    connectionId: string
  ): Promise<RTCSessionDescriptionInit | undefined> {
    const connCollectionPath: string = new CollectionPath().connCollection(
      meetingId
    );
    const connectionsCollectionRef: CollectionReference = collection(
      this.firestore,
      connCollectionPath
    );
    const connDocRef = doc(connectionsCollectionRef, connectionId);
    const connDocData: DocumentData | undefined = (
      await getDoc(connDocRef)
    ).data();

    if (connDocData) {
      return connDocData["answer"];
    }
    return undefined;
  }

  attachOfferCandidateSnapshotListner(
    meetingId: string,
    connectionId: string,
    callbackFunction: Function
  ) {
    const connOfferCandidatesCollectionPath: string =
      new CollectionPath().connOfferCandidatesCollection(
        meetingId,
        connectionId
      );
    const connOfferCandidatesCollectionRef: CollectionReference = collection(
      this.firestore,
      connOfferCandidatesCollectionPath
    );
    onSnapshot(
      connOfferCandidatesCollectionRef,
      (offerCandidateSnapshot: QuerySnapshot): void => {
        offerCandidateSnapshot
          .docChanges()
          .forEach((changedDoc: DocumentChange) => {
            callbackFunction(changedDoc.type, changedDoc.doc.data());
          });
      }
    );
  }

  attachAnswerCandidateSnapshotListner(
    meetingId: string,
    connectionId: string,
    callbackFunction: Function
  ) {
    const connAnswerCandidatesCollectionPath: string =
      new CollectionPath().connAnswerCandidatesCollection(
        meetingId,
        connectionId
      );
    const connAnswerCandidiatesCollectionRef: CollectionReference = collection(
      this.firestore,
      connAnswerCandidatesCollectionPath
    );
    onSnapshot(
      connAnswerCandidiatesCollectionRef,
      (anwserCandidateSnapshot: QuerySnapshot): void => {
        anwserCandidateSnapshot
          .docChanges()
          .forEach((changedDoc: DocumentChange) => {
            callbackFunction(changedDoc.type, changedDoc.doc.data());
          });
      }
    );
  }
}
