import { Injectable } from "@angular/core";
import { MeetingCollectionService } from "./database-services/meeting-collection.service";
import { ParticipantChannel } from "./channels/participants-channel";
import {
  ParticipantCollectionService,
  ParticipantDoc,
} from "./database-services/participant-collection.service";
import { ConnectionService, connectionStatus } from "./connection.service";
import { MediaService, mediaStatus } from "./media.service";
import { MessagingService } from "./messaging.service";

import { ConnectionCollectionService } from "./database-services/connection-collection.service";
import { Subject } from "rxjs";

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
  emojiReacted: boolean;
  emojiReaction?: string;
  videoEnabled: boolean;
  micEnabled: boolean;
}

@Injectable({
  providedIn: "root",
})
export class MeetingService {
  meetingId = "";
  meetingName = "";
  userParticipantId: string = "";
  userParticipantName = "";
  isRaisedHand = false;
  participantRaisedHandCount = 0;
  joinMeetingLoading = false;
  peerPartcipants: PeerParticipant[] = [];
  participantCounter: number = 1;
  private participantChannel!: ParticipantChannel;
  partcipantsStyleCodeMap: any = {};
  partcipantsMap: any = {};
  userEmojiReacted: boolean = false;
  userEmojiReaction: string = "";
  participantEvent = new Subject<boolean>();

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
    this.messagingService.participantEmohiReactionEvent.subscribe(
      (particpantReaction: {
        participantId: string;
        emojiReaction: string;
      }) => {
        this.participantEmojiReact(
          particpantReaction.participantId,
          particpantReaction.emojiReaction
        );
      }
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
    this.joinMeetingLoading = true;
    this.storeUserDetailsLocally();

    const participantChannelCallbackWrapper = (type: any, data: any) => {
      return this.participantChannelCallback(type, data);
    };

    this.participantChannel.subscribe(
      this.meetingId,
      participantChannelCallbackWrapper
    );
    await this.participantChannel.publishNewParticipant(
      this.meetingId,
      this.userParticipantId,
      this.userParticipantName,
      this.mediaService.cameraStatus === mediaStatus.ENABLED,
      this.mediaService.micStatus === mediaStatus.ENABLED,
      this.isRaisedHand
    );
    this.joinMeetingLoading = false;
  }

  private participantChannelCallback(
    type: any,
    peerParticipant: ParticipantDoc
  ) {
    switch (type) {
      case "added": {
        if (peerParticipant.participantId !== this.userParticipantId) {
          // Idempotency check
          if (
            !(peerParticipant.participantId in this.partcipantsMap) ||
            this.partcipantsMap[peerParticipant.participantId].connection
              .status === connectionStatus.CLOSED
          ) {
            this.addPeerParticipant(peerParticipant);
          }
        }
        break;
      }
      case "modified": {
        if (peerParticipant.participantId in this.partcipantsMap) {
          const updatePeerParticipant =
            this.partcipantsMap[peerParticipant.participantId];
          updatePeerParticipant.handRaised = peerParticipant.handRaised;
          updatePeerParticipant.videoEnabled = peerParticipant.videoEnabled;
          updatePeerParticipant.micEnabled = peerParticipant.micEnabled;
        }
        break;
      }
    }

    if (type === "added") {
    }

    this.participantEvent.next(true);
  }
  storeUserDetailsLocally(): void {
    localStorage.setItem("userParticipantId", this.userParticipantId);
    localStorage.setItem("userParticipantName", this.userParticipantName);
  }

  private addPeerParticipant(peerParticipant: ParticipantDoc): void {
    this.participantCounter++;
    const newPeerParticipant: PeerParticipant = {
      participantName: peerParticipant.participantName,
      participantId: peerParticipant.participantId,
      roll: this.participantCounter,
      handRaised: false,
      emojiReacted: false,
      videoEnabled: peerParticipant.videoEnabled,
      micEnabled: peerParticipant.micEnabled,
      connection: new ConnectionService(
        this.connectionCollectionService,
        this.meetingId,
        this.userParticipantId,
        peerParticipant.participantId,
        this.mediaService.localMediaStream
      ),
    };
    console.log(newPeerParticipant.participantName);

    this.partcipantsMap[newPeerParticipant.participantId] = newPeerParticipant;
    this.peerPartcipants.push(newPeerParticipant);
    this.partcipantsStyleCodeMap[newPeerParticipant.participantId] =
      newPeerParticipant.roll;

    newPeerParticipant.connection.participantConnectionEvent.subscribe(
      (event: boolean) => {
        console.log(this.peerPartcipants);
        this.participantEvent.next(true);
      }
    );
  }

  getParticipantStyleCode(participantId: string): number {
    if (!(participantId in this.partcipantsStyleCodeMap)) {
      this.partcipantsStyleCodeMap[participantId] =
        (Math.floor(Math.random() * 5) % 5) + 1;
    }

    return this.partcipantsStyleCodeMap[participantId];
  }

  private participantEmojiReact(
    participantId: string,
    emojiReaction: string
  ): void {
    if (participantId in this.partcipantsMap) {
      const participant = this.partcipantsMap[participantId];
      participant.emojiReaction = emojiReaction;
      participant.emojiReacted = true;
      setTimeout(() => {
        participant.emojiReacted = false;
      }, 4000);
    } else if (participantId == this.userParticipantId) {
      this.userEmojiReaction = emojiReaction;
      this.userEmojiReacted = true;
      setTimeout(() => {
        this.userEmojiReacted = false;
      }, 4000);
    }
  }

  userRaiseHand(): void {
    this.participantRaisedHandCount++;
    this.isRaisedHand = true;
    this.updatePartcipant();
  }

  userLowerHand(): void {
    this.participantRaisedHandCount--;
    this.isRaisedHand = false;
    this.updatePartcipant();
  }

  updateConnectionVideoStream(): void {
    for (const peerPartcipant of this.peerPartcipants) {
      if (peerPartcipant.connection.status == connectionStatus.CONNECTED) {
        peerPartcipant.connection.updateConnectionVideoMediaTrack(
          this.mediaService.localMediaStream
        );
      }
    }
  }

  updateConnectionAudioStream(): void {
    for (const peerPartcipant of this.peerPartcipants) {
      if (peerPartcipant.connection.status == connectionStatus.CONNECTED) {
        peerPartcipant.connection.updateConnectionAudioMediaTrack(
          this.mediaService.localMediaStream
        );
      }
    }
  }

  async updatePartcipant(): Promise<void> {
    await this.participantChannel.publishParticipantChanges(
      this.meetingId,
      this.userParticipantId,
      this.mediaService.cameraStatus === mediaStatus.ENABLED,
      this.mediaService.micStatus === mediaStatus.ENABLED,
      this.isRaisedHand
    );
  }
}
