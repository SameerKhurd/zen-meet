import { Injectable } from '@angular/core';
import { MeetingCollectionService } from './database-services/meeting-collection.service';
import { ParticipantChannel } from './channels/participants-channel';
import { ParticipantCollectionService } from './database-services/participant-collection.service';
import { MediaService, mediaStatus } from './media.service';
import { MessagingService } from './messaging.service';

import { ConnectionCollectionService } from './database-services/connection-collection.service';
import { Subject } from 'rxjs';
import { ConnectionService } from './connection/connection.service';
import { connectionStatus } from './connection/rtc-connection/rtc-connection-abstract/rtc-connection-abstract.service';

export interface Meeting {
  meetingName: string;
  startTime: Date;
}

export interface ParticipantData {
  participantName: string;
  participantId: string;
  videoEnabled: boolean;
  micEnabled: boolean;
  handRaised: boolean;
  joinTime: Date;
  state: 'new' | 'updated';
}

export interface ScreenSharing {
  isEnabled: boolean;
  isUserScreenSharing: boolean;
  currScreenSharingSessionId: number;
  currScreenSharingParticipantId: string;
}

export interface PeerParticipant {
  participantName: string;
  participantId: string;
  connection: ConnectionService;
  screenShareConnection?: ConnectionService;
  handRaised: boolean;
  roll: number;
  emojiReacted: boolean;
  emojiReaction?: string;
  videoEnabled: boolean;
  micEnabled: boolean;
}

const SCREEN_SHARE_PARTICIPANT_ID = 'screen_share_participant';

@Injectable({
  providedIn: 'root',
})
export class MeetingService {
  meetingId = '';
  meetingName = '';
  meetingTimer = 0;
  userParticipantId: string = '';
  userParticipantName = '';
  isRaisedHand = false;
  participantRaisedHandCount = 0;
  meetingStatus: 'not-joined' | 'joined' | 'ended' | 'loading' | 'error' =
    'not-joined';
  peerPartcipants: PeerParticipant[] = [];
  participantCounter: number = 1;
  private participantChannel!: ParticipantChannel;
  partcipantsStyleCodeMap: any = {};
  partcipantsMap: any = {};
  participantIdempotencyMap: any = {};
  userEmojiReacted: boolean = false;
  userEmojiReaction: string = '';
  participantEvent!: Subject<boolean>;
  private userRegistrationTime!: Date;
  private userSessionId!: number;
  screenSharing: ScreenSharing = {
    isEnabled: false,
    isUserScreenSharing: false,
    currScreenSharingSessionId: 0,
    currScreenSharingParticipantId: '',
  };

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

  private initializeScreenSharingParameters() {
    this.screenSharing = {
      isEnabled: false,
      isUserScreenSharing: false,
      currScreenSharingSessionId: 0,
      currScreenSharingParticipantId: '',
    };
  }

  private initializeMeetingParameters() {
    this.isRaisedHand = false;
    this.participantRaisedHandCount = 0;
    this.meetingStatus = 'not-joined';
    this.peerPartcipants = [];
    this.participantCounter = 1;
    this.partcipantsStyleCodeMap = {};
    this.partcipantsMap = {};
    this.participantIdempotencyMap = {};
    this.userEmojiReacted = false;
    this.userEmojiReaction = '';
    this.participantEvent = new Subject<boolean>();
    this.initializeScreenSharingParameters();
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
    this.meetingTimer = 0;
    this.closeConnections();
    this.initializeMeetingParameters();
    this.meetingStatus = 'not-joined';
    // TODO
    //this.meetingStatus = 'loading';
    this.storeUserDetailsLocally();

    try {
      this.userRegistrationTime =
        await this.participantChannel.publishNewParticipant(
          this.meetingId,
          this.userParticipantId,
          this.userParticipantName,
          this.mediaService.cameraStatus === mediaStatus.ENABLED,
          this.mediaService.micStatus === mediaStatus.ENABLED,
          this.isRaisedHand
        );
      this.userSessionId = this.userRegistrationTime.getTime();
      this.subscribeParticipantChannel();
      this.meetingTimer = 0;
      this.meetingStatus = 'joined';
    } catch (err: any) {
      // TODO -
      //this.meetingStatus = 'error';
      this.meetingStatus = 'joined';
      throw err;
    }

    this.meetingTimer = 0;
  }

  private subscribeParticipantChannel(): void {
    const participantChannelCallbackWrapper = (type: any, data: any) => {
      return this.participantChannelCallback(type, data);
    };

    this.participantChannel.subscribe(
      this.meetingId,
      participantChannelCallbackWrapper
    );
  }

  private participantChannelCallback(
    type: any,
    peerParticipant: ParticipantData
  ) {
    if (this.meetingStatus === 'ended') {
      return;
    }
    const partcipantSessionId = peerParticipant.joinTime.getTime();
    if (peerParticipant.participantId === SCREEN_SHARE_PARTICIPANT_ID) {
      this.handleParticipantShareScreen(peerParticipant, partcipantSessionId);
    } else if (peerParticipant.participantId !== this.userParticipantId) {
      // Idempotency check
      if (!(peerParticipant.participantId in this.participantIdempotencyMap)) {
        this.participantIdempotencyMap[peerParticipant.participantId] =
          partcipantSessionId;
        this.addPeerParticipant(peerParticipant, partcipantSessionId);
      } else if (
        this.participantIdempotencyMap[peerParticipant.participantId] <
        partcipantSessionId
      ) {
        const currPeerPartcipant: PeerParticipant =
          this.partcipantsMap[peerParticipant.participantId];
        currPeerPartcipant.connection.closeConnection();
        if (currPeerPartcipant.screenShareConnection) {
          currPeerPartcipant.screenShareConnection.closeConnection();
        }

        this.participantIdempotencyMap[peerParticipant.participantId] =
          partcipantSessionId;
        this.addPeerParticipant(peerParticipant, partcipantSessionId);
      } else {
        const updatePeerParticipant =
          this.partcipantsMap[peerParticipant.participantId];
        updatePeerParticipant.handRaised = peerParticipant.handRaised;
        updatePeerParticipant.videoEnabled = peerParticipant.videoEnabled;
        updatePeerParticipant.micEnabled = peerParticipant.micEnabled;
      }
      this.participantEvent.next(true);
    }
  }

  storeUserDetailsLocally(): void {
    localStorage.setItem('userParticipantId', this.userParticipantId);
    localStorage.setItem('userParticipantName', this.userParticipantName);
  }

  private addPeerParticipant(
    peerParticipant: ParticipantData,
    partcipantSessionId: number
  ): void {
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
        this.mediaService.localMediaStream,
        this.userSessionId,
        partcipantSessionId
      ),
    };

    this.partcipantsMap[newPeerParticipant.participantId] = newPeerParticipant;
    this.peerPartcipants.push(newPeerParticipant);
    this.partcipantsStyleCodeMap[newPeerParticipant.participantId] =
      newPeerParticipant.roll;

    newPeerParticipant.connection
      .connectionEventListener()
      .subscribe((event: boolean) => {
        if (
          newPeerParticipant.connection.status === connectionStatus.CONNECTED &&
          this.screenSharing.isEnabled
        ) {
          const screenSharingSessionId: number = Math.max(
            this.userSessionId,
            partcipantSessionId,
            this.screenSharing.currScreenSharingSessionId
          );
          if (this.screenSharing.isUserScreenSharing) {
            this.createParticipantScreenShareConnection(
              newPeerParticipant,
              this.mediaService.localScreenShareMediaStream,
              screenSharingSessionId
            );
          } else if (
            this.screenSharing.currScreenSharingParticipantId ===
            newPeerParticipant.participantId
          ) {
            this.createParticipantScreenShareConnection(
              newPeerParticipant,
              new MediaStream(),
              screenSharingSessionId
            );
          }
        }

        this.participantEvent.next(true);
      });
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

  private closeConnections(): void {
    if (
      this.screenSharing.isEnabled &&
      this.screenSharing.isUserScreenSharing
    ) {
      this.stopScreenShare();
    }
    this.closeScreenShareConnections();
    for (const peerPartcipant of this.peerPartcipants) {
      if (peerPartcipant.connection.status == connectionStatus.CONNECTED) {
        peerPartcipant.connection.closeConnection();
      }
    }
  }

  private closeScreenShareConnections(): void {
    for (const peerPartcipant of this.peerPartcipants) {
      if (
        peerPartcipant.screenShareConnection &&
        peerPartcipant.screenShareConnection.status ==
          connectionStatus.CONNECTED
      ) {
        peerPartcipant.screenShareConnection.closeConnection();
      }
    }
  }

  private createParticipantScreenShareConnection(
    peerPartcipant: PeerParticipant,
    localScreenShareMediaStream: MediaStream,
    screenSharingSessionId: number
  ) {
    peerPartcipant.screenShareConnection = new ConnectionService(
      this.connectionCollectionService,
      this.meetingId,
      this.userParticipantId + '_ss',
      peerPartcipant.participantId + '_ss',
      localScreenShareMediaStream,
      screenSharingSessionId,
      peerPartcipant.connection.partcipantSessionId
    );
  }

  private createScreenShareConnections(
    localScreenShareMediaStream: MediaStream,
    screenSharingSessionId: number
  ): void {
    for (const peerPartcipant of this.peerPartcipants) {
      if (peerPartcipant.connection.status === connectionStatus.CONNECTED) {
        this.createParticipantScreenShareConnection(
          peerPartcipant,
          localScreenShareMediaStream,
          screenSharingSessionId
        );
      }
    }
  }

  private async handleParticipantShareScreen(
    peerParticipant: ParticipantData,
    screenShareSessionId: number
  ) {
    const participantId = peerParticipant.participantName;
    if (participantId !== this.userParticipantId) {
      // Idempotency check
      if (
        this.screenSharing.currScreenSharingSessionId < screenShareSessionId
      ) {
        this.mediaService.stopScreenShareMedia();
        this.screenSharing.currScreenSharingSessionId = screenShareSessionId;
        this.screenSharing.isEnabled = peerParticipant.videoEnabled;
        this.screenSharing.currScreenSharingParticipantId = participantId;
        this.screenSharing.isUserScreenSharing = false;

        if (
          peerParticipant.videoEnabled &&
          participantId in this.partcipantsMap
        ) {
          const screenSharingParticipant: PeerParticipant =
            this.partcipantsMap[participantId];
          this.closeScreenShareConnections();

          if (
            screenSharingParticipant.connection.status ===
            connectionStatus.CONNECTED
          ) {
            this.createParticipantScreenShareConnection(
              screenSharingParticipant,
              new MediaStream(),
              screenShareSessionId
            );
          }
        } else {
          this.closeScreenShareConnections();
        }
        this.participantEvent.next(true);
      }
    } else {
      if (
        peerParticipant.videoEnabled &&
        !this.screenSharing.isUserScreenSharing
      ) {
        await this.publishStopUserScreenShare();
      }
    }
  }

  async startScreenShare() {
    await this.mediaService.requestScreenShareMedia();
    this.screenSharing.isUserScreenSharing = true;
    this.screenSharing.currScreenSharingParticipantId = this.userParticipantId;

    this.mediaService.localScreenShareMediaStream.getVideoTracks()[0].onended =
      () => this.stopScreenShare();
    const screenShareParticipantRegistrationTime: Date =
      await this.participantChannel.publishNewParticipant(
        this.meetingId,
        SCREEN_SHARE_PARTICIPANT_ID,
        this.userParticipantId,
        true,
        false,
        false
      );

    const screenShareParticipantSessionId: number =
      screenShareParticipantRegistrationTime.getTime();
    this.screenSharing.isEnabled = true;
    this.screenSharing.currScreenSharingSessionId =
      screenShareParticipantSessionId;

    this.createScreenShareConnections(
      this.mediaService.localScreenShareMediaStream,
      screenShareParticipantSessionId
    );
    this.participantEvent.next(true);
  }

  async publishStopUserScreenShare() {
    await this.participantChannel.publishNewParticipant(
      this.meetingId,
      SCREEN_SHARE_PARTICIPANT_ID,
      this.userParticipantId,
      false,
      false,
      false
    );
  }

  async stopScreenShare() {
    this.mediaService.stopScreenShareMedia();
    if (this.screenSharing.isUserScreenSharing) {
      this.screenSharing.isUserScreenSharing = false;
      this.closeScreenShareConnections();
      this.screenSharing.isEnabled = false;
      await this.publishStopUserScreenShare();
    }
    this.participantEvent.next(true);
  }

  leaveMeeting() {
    this.closeConnections();
    this.initializeMeetingParameters();
    this.mediaService.stopCamera();
    this.mediaService.stopMic();
    this.meetingStatus = 'ended';
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
