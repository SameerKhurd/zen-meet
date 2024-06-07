import { Injectable } from "@angular/core";
import {
  MeetingCollectionService,
  ParticipantDoc,
} from "./database-services/meeting-collection.service";
import { ParticipantChannel } from "./channels/participants-channel";
import { ParticipantCollectionService } from "./database-services/participant-collection.service";
import { ConnectionService } from "./connection.service";
import { MediaService } from "./media.service";
import { MessagingService } from "./messaging.service";

import { ConnectionCollectionService } from "./database-services/connection-collection.service";

export const randomIDGenerator = (length: number = 10): string => {
  const CHARS =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let autoId = "";
  for (let i = 0; i < length; i++) {
    autoId += CHARS.charAt(Math.floor(Math.random() * CHARS.length));
  }
  return autoId;
};

export interface Meeting {
  meetingName: string;
  startTime: Date;
}

export interface PeerParticipant {
  participantName: string;
  participantId: string;
  connection: ConnectionService;
  handRaised: boolean;
  roll: number;
  //videoEnabled: boolean;
  //micEnabled: boolean;
}

@Injectable({
  providedIn: "root",
})
export class MeetingService {
  meetingId = "";
  meetingName = "";
  userParticipantId: string = randomIDGenerator();
  userParticipantName = "Sameer K";
  isRaisedHand = false;
  peerPartcipants: PeerParticipant[] = [];
  participantCounter: number = 1;
  private participantChannel!: ParticipantChannel;

  constructor(
    public mediaService: MediaService,
    private messagingService: MessagingService,
    private meetingCollectionService: MeetingCollectionService,
    private connectionCollectionService: ConnectionCollectionService,
    participantCollectionService: ParticipantCollectionService
  ) {
    this.participantChannel = new ParticipantChannel(
      participantCollectionService
    );
  }

  async startNewMeeting(meetingName: string): Promise<void> {
    this.meetingName = meetingName;
    this.meetingId = await this.meetingCollectionService.addMeeting(
      meetingName
    );
  }

  async getMeetingDetails(meetingId: string): Promise<Meeting | undefined> {
    const meetingDetails = await this.meetingCollectionService.getMeeting(
      meetingId
    );
    return meetingDetails;
  }

  setMeetingDetails(meetingId: string, meetingName: string) {
    this.meetingId = meetingId;
    this.meetingName = meetingName;
    this.messagingService.subscribeMessageChannel(
      this.meetingId,
      this.userParticipantId
    );
  }

  async joinMeeting() {

    const participantChannelCallbackWrapper = (type: any, data: any) => {
      return this.participantChannelCallback(type, data);
    };
    this.participantChannel.subscribe(
      this.meetingId,
      participantChannelCallbackWrapper
    );
    await this.participantChannel.publish(
      this.meetingId,
      this.userParticipantId,
      this.userParticipantName
    );
  }

  private participantChannelCallback(
    type: any,
    peerParticipant: ParticipantDoc
  ) {
    if (type === "added") {
      if (peerParticipant.participantId !== this.userParticipantId) {
        this.addPeerParticipant(peerParticipant);
      }
    }
  }

  private addPeerParticipant(peerParticipant: ParticipantDoc): void {
    this.participantCounter++;
    const newPeerParticipant: PeerParticipant = {
      participantName: peerParticipant.participantName,
      participantId: peerParticipant.participantId,
      roll: this.participantCounter,
      handRaised: false,
      connection: new ConnectionService(
        this.connectionCollectionService,
        this.meetingId,
        this.userParticipantId,
        peerParticipant.participantId,
        this.mediaService.localMediaStream
      ),
    };
    console.log(newPeerParticipant.participantName);
    this.peerPartcipants.push(newPeerParticipant);
  }

  userRaiseHand(): void {
    this.isRaisedHand = true;
  }

  userLowerHand(): void {
    this.isRaisedHand = false;
  }
}
