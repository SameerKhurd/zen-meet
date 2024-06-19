import { Injectable } from '@angular/core';
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
  DocumentReference,
} from '@angular/fire/firestore';

export class CollectionPath {
  meetingCollection = 'meetings';
  connCollection = (meetingId: string) =>
    `${this.meetingCollection}/${meetingId}/connections`;
  connDoc = (meetingId: string, connectionId: string) =>
    `${this.connCollection(meetingId)}/${connectionId}`;
  connCallsCollection = (meetingId: string, connectionId: string) =>
    `${this.connDoc(meetingId, connectionId)}/calls`;
  connOfferCandidatesCollection = (meetingId: string, connectionId: string) =>
    `${this.connDoc(meetingId, connectionId)}/offerCandidates`;
  connAnswerCandidatesCollection = (meetingId: string, connectionId: string) =>
    `${this.connDoc(meetingId, connectionId)}/answerCandidiates`;
}

export interface ConnectionDoc {
  connectionId: string;
}

export interface CallDoc {
  sessionTimeId: number;
  data: any;
  type: 'answer' | 'offer';
}

export interface CandidateDoc {
  sessionTimeId: number;
  candidateData: RTCIceCandidateInit;
}

@Injectable({
  providedIn: 'root',
})
export class ConnectionCollectionService {
  constructor(public firestore: Firestore) {}

  async addOfferCandidate(
    meetingId: string,
    connectionId: string,
    sessionTimeId: number,
    candidateId: string,
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
    const candidateDoc: CandidateDoc = {
      sessionTimeId: sessionTimeId,
      candidateData: offerCandidateData,
    };
    const candidateDocRef: DocumentReference = doc(
      connOfferCandidatesCollectionRef,
      candidateId
    );
    await setDoc(candidateDocRef, candidateDoc);
  }

  async addAnswerCandidate(
    meetingId: string,
    connectionId: string,
    sessionTimeId: number,
    candidateId: string,
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

    const candidateDoc: CandidateDoc = {
      sessionTimeId: sessionTimeId,
      candidateData: answerCandidateData,
    };
    const candidateDocRef: DocumentReference = doc(
      connAnswerCandidatesCollectionRef,
      candidateId
    );
    await setDoc(candidateDocRef, candidateDoc);
  }

  async addCallData(
    meetingId: string,
    connectionId: string,
    type: 'offer' | 'answer',
    sessionTimeId: number,
    callData: RTCSessionDescriptionInit
  ): Promise<void> {
    const connCallsCollectionPath: string =
      new CollectionPath().connCallsCollection(meetingId, connectionId);

    const connCallCollectionRef: CollectionReference = collection(
      this.firestore,
      connCallsCollectionPath
    );
    const connCallDocRef = doc(connCallCollectionRef, type);
    const callDoc: CallDoc = {
      sessionTimeId: sessionTimeId,
      data: callData,
      type: type,
    };

    await setDoc(connCallDocRef, callDoc);
  }

  attachCallsSnapshotListner(
    meetingId: string,
    connectionId: string,
    callbackFunction: Function
  ) {
    const connCallsCollectionPath: string =
      new CollectionPath().connCallsCollection(meetingId, connectionId);
    const connCallCollectionRef: CollectionReference = collection(
      this.firestore,
      connCallsCollectionPath
    );
    onSnapshot(connCallCollectionRef, (callsSnapshot: QuerySnapshot): void => {
      callsSnapshot.docChanges().forEach((changedDoc: DocumentChange) => {
        callbackFunction(changedDoc.type, changedDoc.doc.data());
      });
    });
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
